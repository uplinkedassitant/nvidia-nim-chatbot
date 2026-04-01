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

export default function NimChatPage() {
  const [config, setConfig] = useState<NIMConfig | null>(null);
  const [hasOpenedSettings, setHasOpenedSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput } = useChat({
    api: '/api/nim-chat',
    body: config
      ? {
          baseUrl: config.baseUrl,
          apiKey: config.apiKey,
          model: config.model,
          systemPrompt: config.systemPrompt,
        }
      : {},
    onFinish: () => {
      scrollToBottom();
    },
  });

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

  // Session history (localStorage-based)
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState('default');

  useEffect(() => {
    const saved = localStorage.getItem('chatSessions');
    if (saved) {
      try {
        setSessions(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse sessions', e);
      }
    }
  }, []);

  const saveSessions = (newSessions: any[]) => {
    localStorage.setItem('chatSessions', JSON.stringify(newSessions));
    setSessions(newSessions);
  };

  const createNewSession = () => {
    const newSession = {
      id: `session-${Date.now()}`,
      title: 'New chat',
      createdAt: new Date().toISOString(),
      messages: [],
    };
    const newSessions = [newSession, ...sessions];
    saveSessions(newSessions);
    setCurrentSessionId(newSession.id);
    // Clear current chat
    setInput('');
  };

  const deleteSession = (sessionId: string) => {
    const newSessions = sessions.filter((s) => s.id !== sessionId);
    saveSessions(newSessions);
    if (currentSessionId === sessionId) {
      setCurrentSessionId(newSessions[0]?.id || 'default');
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold">Sessions</h2>
              <button
                onClick={createNewSession}
                className="p-1 hover:bg-muted rounded"
                title="New chat"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>
            <div className="space-y-1">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="group flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer text-sm"
                  onClick={() => {
                    setCurrentSessionId(session.id);
                    setSidebarOpen(false);
                  }}
                >
                  <span className="truncate flex-1">{session.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              ))}
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
                        components={{
                          code({ node, className, children, ...props }) {
                            return (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          },
                        }}
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
            onSubmit={(e) => {
              e.preventDefault();
              if (!config?.apiKey) {
                alert('Please configure your NIM API key in settings first!');
                return;
              }
              handleSubmit(e);
            }}
            className="border-t p-4"
          >
            <div className="flex gap-2 max-w-3xl mx-auto">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
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
