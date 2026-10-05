import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { createLovableAiGatewayRunIdFetch } from './run-id.server';

export class GatewayError extends Error { constructor(public status: number, message: string) { super(message); } }

export async function analyzeSales(question: string, data: unknown) {
  const apiKey = process.env['LOVABLE_API_KEY'];
  if (!apiKey) throw new GatewayError(401, 'AI is not configured for this store yet.');
  const runIdFetch = createLovableAiGatewayRunIdFetch();
  const provider = createOpenAI({
    baseURL: 'https://ai.gateway.lovable.dev/v1',
    apiKey,
    headers: { 'Lovable-API-Key': apiKey, 'X-Lovable-AIG-SDK': 'vercel-ai-sdk' },
    fetch: runIdFetch.fetch,
  });
  let failure: unknown;
  const result = streamText({
    model: provider.responses('openai/gpt-6-astra'),
    system: 'You are a retail analyst for a grocery store in Kampala. Prices are in UGX. Answer the manager\'s question using ONLY the POS data provided. Be concise (under 250 words). Use markdown: a one-line answer, then "Key findings" bullets with numbers, then "Recommended actions" as 2-4 concrete steps. If the data is insufficient, say so and suggest what to track.',
    prompt: `Question: ${question}\n\nPOS data (JSON):\n${JSON.stringify(data)}`,
    maxRetries: 0,
    onError: ({ error }) => { failure = error; },
    providerOptions: { openai: { forceReasoning: true, reasoningEffort: 'low', reasoningSummary: 'auto', store: false, include: ['reasoning.encrypted_content'] } },
  });
  let text = '';
  try { text = await result.text; } catch (e) { failure ??= e; }
  if (failure || !text) {
    const status = (failure as { statusCode?: number })?.statusCode ?? 500;
    const msg = status === 402 ? 'AI credits are used up. Add credits in workspace billing to keep using insights.' : status === 429 ? 'Too many requests right now. Please wait a moment and try again.' : status === 403 ? 'AI access is blocked for this workspace.' : 'The analysis could not be completed. Please try again.';
    throw new GatewayError(status, msg);
  }
  return text;
}
