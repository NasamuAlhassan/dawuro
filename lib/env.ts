/**
 * Server-side env access. Never import this from client components.
 * All vendor keys stay secret — only route handlers / server code use this.
 */

const REQUIRED_KEYS = [
  "YVP_APP_KEY",
  "GLOO_CLIENT_ID",
  "GLOO_CLIENT_SECRET",
  "KHAYA_API_KEY",
] as const;

export type RequiredEnvKey = (typeof REQUIRED_KEYS)[number];

export type AppEnv = {
  YVP_APP_KEY: string;
  GLOO_CLIENT_ID: string;
  GLOO_CLIENT_SECRET: string;
  KHAYA_API_KEY: string;
  NEXT_PUBLIC_APP_NAME: string;
  GLOO_TOKEN_URL?: string;
};

function missingKeys(): RequiredEnvKey[] {
  return REQUIRED_KEYS.filter((key) => !process.env[key]?.trim());
}

/** Returns which required keys are still empty (no throw). */
export function getMissingEnvKeys(): RequiredEnvKey[] {
  return missingKeys();
}

/** True when all required API keys are present. */
export function hasAllKeys(): boolean {
  return missingKeys().length === 0;
}

/**
 * Typed env access for server routes.
 * Throws a clear message naming every missing key — fail fast, not mid-vendor call.
 */
export function requireEnv(): AppEnv {
  const missing = missingKeys();
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(", ")}. ` +
        `Copy .env.example to .env.local and fill in your API keys (see 10_ENV_AND_SETUP.md).`,
    );
  }

  return {
    YVP_APP_KEY: process.env.YVP_APP_KEY!.trim(),
    GLOO_CLIENT_ID: process.env.GLOO_CLIENT_ID!.trim(),
    GLOO_CLIENT_SECRET: process.env.GLOO_CLIENT_SECRET!.trim(),
    KHAYA_API_KEY: process.env.KHAYA_API_KEY!.trim(),
    NEXT_PUBLIC_APP_NAME:
      process.env.NEXT_PUBLIC_APP_NAME?.trim() || "Dawuro",
    GLOO_TOKEN_URL: process.env.GLOO_TOKEN_URL?.trim() || undefined,
  };
}
