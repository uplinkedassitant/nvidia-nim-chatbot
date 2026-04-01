# NVIDIA NIM Chatbot - Setup Guide

A Grok-inspired AI chatbot powered by NVIDIA NIM with Bring Your Own Key (BYOK) support.

## Features

- ✅ **Client-side API key storage** - Your NVIDIA API key stays in your browser (localStorage)
- ✅ **Grok-like personality** - Witty, helpful, truthful assistant
- ✅ **Session history** - Multiple chat sessions saved locally
- ✅ **Smooth streaming** - Real-time response streaming like Grok
- ✅ **Markdown support** - Rich text formatting, code blocks, tables
- ✅ **Dark theme** - Clean, modern UI
- ✅ **Mobile-friendly** - Works great on iPhone Safari (add to home screen for PWA feel)

## Quick Start

### 1. Get Your NVIDIA API Key

1. Go to [build.nvidia.com](https://build.nvidia.com)
2. Sign in / create account
3. Get your API key (starts with `nvapi-...`)

### 2. Run the Chatbot

```bash
cd /home/jay/.openclaw/workspace/nvidia-nim-chatbot
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Configure NIM Settings

1. Click the **⚙️ NIM Settings** button in the header
2. Enter your NVIDIA API key
3. Select a model (e.g., `meta/llama-3.1-70b-instruct`)
4. Click **Save & Apply**

### 4. Start Chatting!

Type a message and get Grok-like responses powered by NVIDIA NIM.

## Available Models

The chat includes presets for popular NVIDIA NIM models:

- **Llama 3.1 70B Instruct** - Best overall performance
- **Llama 3.1 8B Instruct** - Faster, lighter
- **Llama 3.2 90B Vision** - Vision + text
- **Mistral Large 2** - Mistral's flagship
- **Mixtral 8x22B** - MoE architecture
- **Nemotron 4 340B** - NVIDIA's largest model
- And more...

You can also enter custom model IDs from the [NVIDIA catalog](https://build.nvidia.com/models).

## Deployment to Vercel

1. Push your changes to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Deploy (no environment variables needed!)
4. Once live, open on iPhone Safari → "Add to Home Screen" for PWA

## Customization

### Change the System Prompt

In the NIM Settings dialog, click "Show Advanced Settings" to customize the system prompt. Default:

```
You are a helpful, truthful, and slightly witty assistant inspired by Grok from xAI. Be maximally useful.
```

### Modify the UI

- Main chat page: `app/nim-chat/page.tsx`
- Settings component: `components/nim-settings.tsx`
- API route: `app/api/chat/route.ts`

## Troubleshooting

### "Missing NIM config" error
Make sure you've entered your API key in settings and saved it.

### Model not found
Double-check the exact model ID from [NVIDIA's catalog](https://build.nvidia.com). Some models may require specific access tiers.

### Rate limiting
NVIDIA NIM has rate limits based on your tier. Check your usage at build.nvidia.com.

### Streaming not working
Ensure you have a stable internet connection. The response streams in real-time.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS, shadcn/ui
- **AI SDK:** `ai` (Vercel AI SDK) + `@ai-sdk/openai-compatible`
- **Markdown:** react-markdown + remark-gfm
- **Storage:** localStorage (client-side only)

## Privacy & Security

- 🔒 Your NVIDIA API key is stored **only in your browser** (localStorage)
- 🔒 Keys are **never sent to any server** except NVIDIA's API directly
- 🔒 No database, no server-side key storage
- 🔒 Fully client-side configuration (BYOK = Bring Your Own Key)

## License

Based on [Vercel's Chatbot template](https://github.com/vercel/chatbot) (MIT)

---

**Built with ❤️ for NVIDIA NIM**
