import { openai } from '@ai-sdk/openai';
import { convertToModelMessages, streamText, type UIMessage } from 'ai';

export const maxDuration = 30;

export async function POST(request: Request) {
  const { messages }: { messages: UIMessage[] } = await request.json();

  const result = streamText({
    model: openai('gpt-5.4-mini'),
    system:
      'You are Textura, a linguistics assistant. Help with definitions, translations, grammar, usage, word origins, semantic nuance, and related language questions. Refuse requests that are outside linguistics.',
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
