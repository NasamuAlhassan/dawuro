/**
 * Gloo AI Studio — OAuth2 client credentials + Completions v2.
 * Server only. Token is cached until near expiry.
 *
 * Auth (verified docs):
 *   POST https://platform.ai.gloo.com/oauth2/token
 *   Authorization: Basic base64(client_id:client_secret)
 *   grant_type=client_credentials&scope=api/access
 *
 * Completions v2:
 *   POST https://platform.ai.gloo.com/ai/v2/chat/completions
 *   tradition: evangelical | catholic | mainline
 */

import { requireGlooEnv, hasGlooKeys } from "@/lib/env";
import type { Tradition } from "@/lib/types";

const DEFAULT_TOKEN_URL = "https://platform.ai.gloo.com/oauth2/token";
const COMPLETIONS_URL =
  "https://platform.ai.gloo.com/ai/v2/chat/completions";

let cached: { token: string; exp: number } | null = null;

export class GlooError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status = 502, code?: string) {
    super(message);
    this.name = "GlooError";
    this.status = status;
    this.code = code;
  }
}

export function isGlooConfigured(): boolean {
  return hasGlooKeys();
}

export async function getGlooToken(): Promise<string> {
  if (cached && Date.now() < cached.exp - 60_000) {
    return cached.token;
  }

  const { GLOO_CLIENT_ID, GLOO_CLIENT_SECRET, GLOO_TOKEN_URL } =
    requireGlooEnv();
  const tokenUrl = GLOO_TOKEN_URL || DEFAULT_TOKEN_URL;
  const basic = Buffer.from(
    `${GLOO_CLIENT_ID}:${GLOO_CLIENT_SECRET}`,
  ).toString("base64");

  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basic}`,
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: "api/access",
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new GlooError(
      `Gloo token exchange failed (${res.status})${detail ? `: ${detail.slice(0, 160)}` : ""}`,
      res.status,
      "TOKEN_ERROR",
    );
  }

  const data = (await res.json()) as {
    access_token: string;
    expires_in?: number;
  };

  if (!data.access_token) {
    throw new GlooError("Gloo token response missing access_token", 502);
  }

  const expiresIn = data.expires_in ?? 3600;
  cached = {
    token: data.access_token,
    exp: Date.now() + expiresIn * 1000,
  };
  return cached.token;
}

type CompletionsResponse = {
  choices?: Array<{
    message?: { role?: string; content?: string };
  }>;
  model?: string;
  tradition?: string;
};

/**
 * Generate a short pastoral reflection. Never invents or rewrites Scripture.
 */
export async function generateReflection(params: {
  feeling: string;
  humanReference: string;
  englishVerseText: string;
  tradition?: Tradition;
}): Promise<{ english: string; tradition: Tradition; model?: string }> {
  if (!isGlooConfigured()) {
    throw new GlooError(
      "Gloo credentials not configured. Add GLOO_CLIENT_ID and GLOO_CLIENT_SECRET to .env.local.",
      503,
      "NOT_CONFIGURED",
    );
  }

  const tradition: Tradition = params.tradition || "evangelical";
  const token = await getGlooToken();

  const res = await fetch(COMPLETIONS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [
        {
          role: "system",
          content:
            "You are a warm, pastoral Ghanaian voice. In 2-3 short sentences, gently explain why the given Bible verse speaks to someone who feels the way described. Be encouraging and human. Do NOT quote or rewrite the verse text; reflect on it. Avoid clichés. Do not invent Scripture.",
        },
        {
          role: "user",
          content: `Feeling: "${params.feeling}". Verse (${params.humanReference}): "${params.englishVerseText}". Write the reflection.`,
        },
      ],
      auto_routing: true,
      tradition,
      temperature: 0.7,
      max_tokens: 220,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new GlooError(
      `Gloo completions failed (${res.status})${detail ? `: ${detail.slice(0, 160)}` : ""}`,
      res.status,
      "COMPLETIONS_ERROR",
    );
  }

  const data = (await res.json()) as CompletionsResponse;
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new GlooError("Gloo returned an empty reflection.", 502);
  }

  return {
    english: content,
    tradition,
    model: data.model,
  };
}

/**
 * Map free-text feeling → a curated USFM reference.
 * Gloo only chooses *which* verse; YouVersion always supplies the text.
 * Returns null if Gloo is offline or output is not in the allow-list.
 */
export async function mapFeelingWithGloo(
  feeling: string,
  allowedReferences: string[],
): Promise<{ reference: string; topicLabel: string } | null> {
  if (!isGlooConfigured() || !feeling.trim()) return null;

  try {
    const token = await getGlooToken();
    const list = allowedReferences.join(", ");
    const res = await fetch(COMPLETIONS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content:
              "You map a person's feeling to ONE Bible verse reference from an allow-list. " +
              "Reply with ONLY compact JSON: {\"usfm\":\"PHP.4.6-7\",\"topic\":\"Anxiety\"}. " +
              "usfm MUST be exactly one of the allowed values. Do not invent verses or write Scripture text.",
          },
          {
            role: "user",
            content: `Feeling: "${feeling.slice(0, 400)}"\nAllowed usfm: ${list}\nPick the best match.`,
          },
        ],
        auto_routing: true,
        temperature: 0.2,
        max_tokens: 80,
      }),
    });

    if (!res.ok) return null;
    const data = (await res.json()) as CompletionsResponse;
    const raw = data.choices?.[0]?.message?.content?.trim() || "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]) as {
      usfm?: string;
      topic?: string;
    };
    const usfm = parsed.usfm?.trim();
    if (!usfm || !allowedReferences.includes(usfm)) return null;
    return {
      reference: usfm,
      topicLabel: parsed.topic?.trim() || "Encouragement",
    };
  } catch (e) {
    console.warn("[gloo] mapFeelingWithGloo failed", e);
    return null;
  }
}
