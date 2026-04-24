/**
 * AI Provider Abstraction
 *
 * Switch between providers via AI_PROVIDER env var:
 *   AI_PROVIDER=gemini  → Google Gemini Flash (configurable model, defaults to Gemini 2.0 Flash)
 *   AI_PROVIDER=claude  → Anthropic Claude Sonnet (paid, with prompt caching)
 *
 * Free Gemini API key: https://aistudio.google.com/app/apikey
 * Anthropic key:       https://console.anthropic.com
 */

import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

export interface AICallOptions {
  systemPrompt: string;
  userMessage: string;
  maxTokens?: number;
  /** If true, the system prompt is eligible for Anthropic prompt caching (saves cost) */
  cacheSystem?: boolean;
}

export interface AICallResult {
  text: string;
  provider: 'gemini' | 'claude';
  inputTokens?: number;
  outputTokens?: number;
}

// ─── Singleton clients ─────────────────────────────────────────────────────────
let _anthropic: Anthropic | null = null;
let _gemini: GoogleGenerativeAI | null = null;

function getAnthropicClient(): Anthropic {
  if (!_anthropic) _anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY! });
  return _anthropic;
}

function getGeminiClient(): GoogleGenerativeAI {
  if (!_gemini) _gemini = new GoogleGenerativeAI(env.GEMINI_API_KEY!);
  return _gemini;
}

function getGeminiCandidateModels(): string[] {
  const configured = env.GEMINI_MODEL?.trim() || 'gemini-2.0-flash';
  return Array.from(new Set([configured, 'gemini-2.0-flash', 'gemini-2.0-flash-001']));
}

function isGeminiModelNotFoundError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;

  const status = 'status' in err ? (err as { status?: number }).status : undefined;
  const message = 'message' in err ? String((err as { message?: unknown }).message ?? '') : '';

  return status === 404 && message.toLowerCase().includes('not found');
}

// ─── Gemini call ──────────────────────────────────────────────────────────────
async function callGemini(opts: AICallOptions): Promise<AICallResult> {
  const ai = getGeminiClient();
  const candidateModels = getGeminiCandidateModels();
  let lastError: unknown;

  for (const modelName of candidateModels) {
    try {
      const model = ai.getGenerativeModel({
        model: modelName,
        systemInstruction: opts.systemPrompt,
        generationConfig: {
          maxOutputTokens: opts.maxTokens ?? 4096,
          temperature: 0.1,
          responseMimeType: 'application/json',
        },
      });

      const result = await model.generateContent(opts.userMessage);
      const text = result.response.text();
      const usage = result.response.usageMetadata;

      logger.debug(`Gemini call (${modelName}): ${usage?.promptTokenCount ?? 0} in / ${usage?.candidatesTokenCount ?? 0} out`);

      return {
        text,
        provider: 'gemini',
        inputTokens: usage?.promptTokenCount,
        outputTokens: usage?.candidatesTokenCount,
      };
    } catch (err) {
      lastError = err;

      if (!isGeminiModelNotFoundError(err) || modelName === candidateModels[candidateModels.length - 1]) {
        throw err;
      }

      logger.warn(`Gemini model ${modelName} is unavailable, trying the next configured fallback.`);
    }
  }

  throw lastError ?? new Error('Gemini call failed');
}

// ─── Claude call ──────────────────────────────────────────────────────────────
async function callClaude(opts: AICallOptions): Promise<AICallResult> {
  const client = getAnthropicClient();

  const systemContent = opts.cacheSystem
    ? [{ type: 'text' as const, text: opts.systemPrompt, cache_control: { type: 'ephemeral' as const } }]
    : opts.systemPrompt;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: opts.maxTokens ?? 4096,
    system: systemContent as any,
    messages: [{ role: 'user', content: opts.userMessage }],
  });

  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Unexpected Claude response type');

  const usage = message.usage as any;
  const cached = usage?.cache_read_input_tokens ?? 0;
  if (cached > 0) {
    logger.debug(`Claude cache hit: ${cached} tokens read from cache (saves ~${Math.round(cached * 0.9)} token cost)`);
  }

  return {
    text: content.text,
    provider: 'claude',
    inputTokens: usage?.input_tokens,
    outputTokens: usage?.output_tokens,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────
export async function callAI(opts: AICallOptions): Promise<AICallResult> {
  const provider = env.AI_PROVIDER;
  logger.debug(`AI call via ${provider}`);

  try {
    if (provider === 'gemini') return await callGemini(opts);
    return await callClaude(opts);
  } catch (err: any) {
    // Gemini free tier 429 → log clearly
    if (provider === 'gemini' && err?.status === 429) {
      logger.warn('Gemini free tier rate limit hit (15 RPM). Consider upgrading or switching to claude.');
    }
    throw err;
  }
}

/** Extract JSON from an AI response — works for both structured and prose replies */
export function extractJSON<T>(text: string): T {
  // Gemini with responseMimeType=json returns clean JSON
  // Claude may wrap in markdown code fences
  const cleaned = text.trim();
  const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/) ?? null;
  const jsonStr = jsonMatch ? jsonMatch[1].trim() : cleaned;

  const objMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (!objMatch) throw new Error('No JSON object found in AI response');

  return JSON.parse(objMatch[0]) as T;
}
