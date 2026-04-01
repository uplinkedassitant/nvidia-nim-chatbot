'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import NimSettings from '@/components/nim-settings';

interface NIMConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  systemPrompt?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function NimChatPage() {
  const [config, setConfig] = useState<NIMConfig | null>(null);
  const [hasOpenedSettings, setHasOpenedSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load config from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('nimConfig');
    if (saved) {
      try {
        setConfig(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse NIM config', e);
      }
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check if config is set
  useEffect(() => {
    if (config?.apiKey) {
      setHasOpenedSettings(true);
    }
  }, [config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!config?.apiKey || !input.trim()) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/nim-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...(messages.map(m => ({
              role: m.role,
              content: m.content,
            }))),
            { role: 'user', content: userMessage.content },
          ],
          baseUrl: config.baseUrl,
          apiKey: config.apiKey,
          model: config.model,
          systemPrompt: config.systemPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      // Read streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader');
      }

      const decoder = new TextDecoder();
      let assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        // Parse the stream - in v6 it's a data stream
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('0:')) {
            // Text content
            const text = line.slice(2);
            if (text) {
              assistantMessage.content += text;
              setMessages(prev => {
                const filtered = prev.filter(m => m.id !== assistantMessage.id);
                return [...filtered, assistantMessage];
              });
            }
          }
        }
      }

      // If message wasn't added yet, add it
      if (assistantMessage.content && !messages.find(m => m.id === assistantMessage.id)) {
        setMessages(prev => [...prev, assistantMessage]);
      }

    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `Error: ${error.message}`,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-muted rounded-md lg:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            NVIDIA NIM Chat
          </h1>
          {!config?.apiKey && (
            <span className="text-xs text-destructive">⚠️ Configure NIM settings</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <NimSettings onConfigChange={setConfig} />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {(sidebarOpen || window.innerWidth >= 1024) && (
          <aside
            className={`w-64 border-r bg-muted/30 p-4 overflow-y-auto ${
              sidebarOpen ? 'block' : 'hidden lg:block'
            }`}
          >
            <h2 className="text-sm font-semibold mb-4">Info</h2>
            <div className="text-xs text-muted-foreground space-y-2">
              <p>Model: {config?.model || 'Not configured'}</p>
              <p>Messages: {messages.length}</p>
            </div>
          </aside>
        )}

        {/* Main chat area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {messages.length === 0 && !config?.apiKey ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mb-4 opacity-50"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M9 3v18" />
                  <path d="M15 3v18" />
                  <path d="M3 9h18" />
                  <path d="M3 15h18" />
                </svg>
                <h2 className="text-xl font-semibold mb-2">Welcome to NVIDIA NIM Chat</h2>
                <p className="max-w-md">
                  Click the ⚙️ settings icon to configure your NVIDIA NIM API key and get
                  started!
                </p>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${
                    m.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      m.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {m.role === 'assistant' ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                      >
                        {m.content}
                      </ReactMarkdown>
                    ) : (
                      m.content
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input form */}
          <form
            onSubmit={handleSubmit}
            className="border-t p-4"
          >
            <div className="flex gap-2 max-w-3xl mx-auto">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  config?.apiKey
                    ? 'Type a message...'
                    : 'Configure NIM settings first...'
                }
                className="flex-1 px-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={!config?.apiKey}
              />
              <button
                type="submit"
                disabled={isLoading || !config?.apiKey}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}
