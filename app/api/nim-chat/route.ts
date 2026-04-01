import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { streamText } from 'ai';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages, baseUrl, apiKey, model, systemPrompt } = await req.json();

    if (!apiKey || !model) {
      return new Response('Missing NIM config (apiKey or model)', { status: 400 });
    }

    const nimProvider = createOpenAICompatible({
      name: 'nvidia-nim',
      baseURL: baseUrl || 'https://integrate.api.nvidia.com/v1',
      apiKey: apiKey,
    });

    const result = await streamText({
      model: nimProvider(model),
      messages: messages || [],
      system: systemPrompt || 'You are a helpful, truthful, and slightly witty assistant inspired by Grok from xAI. Be maximally useful.',
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error('Chat API error:', error);
    return new Response(error.message || 'Error processing chat request', { status: 500 });
  }
}
