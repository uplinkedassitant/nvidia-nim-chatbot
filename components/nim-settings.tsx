'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PRESET_MODELS = [
  { value: 'meta/llama-3.1-70b-instruct', label: 'Llama 3.1 70B Instruct' },
  { value: 'meta/llama-3.1-8b-instruct', label: 'Llama 3.1 8B Instruct' },
  { value: 'meta/llama-3.2-90b-vision-instruct', label: 'Llama 3.2 90B Vision' },
  { value: 'meta/llama-3.2-11b-vision-instruct', label: 'Llama 3.2 11B Vision' },
  { value: 'google/gemma-2b', label: 'Gemma 2B' },
  { value: 'google/gemma-7b', label: 'Gemma 7B' },
  { value: 'google/codegemma-7b', label: 'CodeGemma 7B' },
  { value: 'mistralai/mistral-large-2-instruct', label: 'Mistral Large 2' },
  { value: 'mistralai/mixtral-8x22b-instruct-v0.1', label: 'Mixtral 8x22B' },
  { value: 'nvidia/nemotron-4-340b-instruct', label: 'Nemotron 4 340B' },
];

export default function NimSettings({
  onConfigChange,
}: {
  onConfigChange?: (config: any) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [baseUrl, setBaseUrl] = useState('https://integrate.api.nvidia.com/v1');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('meta/llama-3.1-70b-instruct');
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful, truthful, and slightly witty assistant inspired by Grok from xAI. Be maximally useful.');
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('nimConfig');
    if (saved) {
      try {
        const config = JSON.parse(saved);
        setBaseUrl(config.baseUrl || baseUrl);
        setApiKey(config.apiKey || '');
        setModel(config.model || model);
        setSystemPrompt(config.systemPrompt || systemPrompt);
      } catch (e) {
        console.error('Failed to parse saved NIM config', e);
      }
    }
  }, []);

  const saveSettings = () => {
    const config = {
      baseUrl,
      apiKey,
      model,
      systemPrompt,
    };
    localStorage.setItem('nimConfig', JSON.stringify(config));
    setIsOpen(false);
    if (onConfigChange) {
      onConfigChange(config);
    }
    // Reload to apply settings
    window.location.reload();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
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
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>⚙️ NVIDIA NIM Configuration (BYOK)</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>Base URL</Label>
            <Input
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://integrate.api.nvidia.com/v1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              NVIDIA NIM API endpoint
            </p>
          </div>

          <div>
            <Label>API Key (nvapi-...)</Label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="nvapi-..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              Get your key from{' '}
              <a
                href="https://build.nvidia.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                build.nvidia.com
              </a>
            </p>
          </div>

          <div>
            <Label>Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {PRESET_MODELS.map((preset) => (
                  <SelectItem key={preset.value} value={preset.value}>
                    {preset.label}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom (enter manually)</SelectItem>
              </SelectContent>
            </Select>
            {model === 'custom' && (
              <Input
                className="mt-2"
                placeholder="Enter custom model ID"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
            )}
          </div>

          <div>
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
            </Button>
            {showAdvanced && (
              <div className="mt-2 space-y-2">
                <Label>System Prompt</Label>
                <textarea
                  className="w-full min-h-[80px] p-2 text-sm border rounded-md bg-background"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                />
              </div>
            )}
          </div>

          <Button onClick={saveSettings} className="w-full">
            Save & Apply
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            🔒 Your API key is stored locally in your browser and never sent to
            our servers
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
