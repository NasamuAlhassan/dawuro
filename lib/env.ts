/**
 * Server-side env access. Never import this from client components.
 * All vendor keys stay secret — only route handlers / server code use this.
 *
 * Gloo is optional until the human can complete registration (card issues).
 * Reflection routes degrade gracefully when Gloo keys are missing.
 */

const CORE_KEYS = ["YVP_APP_KEY", "KHAYA_API_KEY"] as const;
const GLOO_KEYS = ["GLOO_CLIENT_ID", "GLOO_CLIENT_SECRET"] as const;
const ALL_KNOWN = [...CORE_KEYS, ...GLOO_KEYS] as const;

export type RequiredEnvKey = (typeof ALL_KNOWN)[number];

export type AppEnv = {
  YVP_APP_KEY: string;
  KHAYA_API_KEY: string;
  GLOO_CLIENT_ID?: string;
  GLOO_CLIENT_SECRET?: string;
  NEXT_PUBLIC_APP_NAME: string;
  GLOO_TOKEN_URL?: string;
};

function isSet(key: string): boolean {
  return Boolean(process.env[key]?.trim());
}

/** Keys still empty (for /api/health). Gloo listed as optional until provided. */
export function getMissingEnvKeys(): {
  required: string[];
  optional: string[];
} {
  return {
    required: CORE_KEYS.filter((k) => !isSet(k)),
    optional: GLOO_KEYS.filter((k) => !isSet(k)),
  };
}

export function hasCoreKeys(): boolean {
  return CORE_KEYS.every(isSet);
}

export function hasGlooKeys(): boolean {
  return GLOO_KEYS.every(isSet);
}

/** True when YouVersion + Khaya are present (enough for Phase 1+ voice). */
export function hasAllKeys(): boolean {
  return hasCoreKeys() && hasGlooKeys();
}

/**
 * Core keys required for Scripture + voice paths.
 * Throws a clear message naming every missing core key.
 */
export function requireCoreEnv(): Pick<
  AppEnv,
  "YVP_APP_KEY" | "KHAYA_API_KEY" | "NEXT_PUBLIC_APP_NAME"
> {
  const missing = CORE_KEYS.filter((k) => !isSet(k));
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(", ")}. ` +
        `Copy .env.example to .env.local and fill in your API keys.`,
    );
  }

  return {
    YVP_APP_KEY: process.env.YVP_APP_KEY!.trim(),
    KHAYA_API_KEY: process.env.KHAYA_API_KEY!.trim(),
    NEXT_PUBLIC_APP_NAME:
      process.env.NEXT_PUBLIC_APP_NAME?.trim() || "Dawuro",
  };
}

/** YouVersion-only routes (Phase 1). */
export function requireYouVersionEnv(): { YVP_APP_KEY: string } {
  if (!isSet("YVP_APP_KEY")) {
    throw new Error(
      "Missing YVP_APP_KEY. Add it to .env.local (platform.youversion.com).",
    );
  }
  return { YVP_APP_KEY: process.env.YVP_APP_KEY!.trim() };
}

/** Gloo routes — throws if keys not yet provided. */
export function requireGlooEnv(): {
  GLOO_CLIENT_ID: string;
  GLOO_CLIENT_SECRET: string;
  GLOO_TOKEN_URL?: string;
} {
  const missing = GLOO_KEYS.filter((k) => !isSet(k));
  if (missing.length > 0) {
    throw new Error(
      `Gloo credentials not configured yet (${missing.join(", ")}). ` +
        `Reflection is unavailable until GLOO_CLIENT_ID and GLOO_CLIENT_SECRET are in .env.local.`,
    );
  }
  return {
    GLOO_CLIENT_ID: process.env.GLOO_CLIENT_ID!.trim(),
    GLOO_CLIENT_SECRET: process.env.GLOO_CLIENT_SECRET!.trim(),
    GLOO_TOKEN_URL: process.env.GLOO_TOKEN_URL?.trim() || undefined,
  };
}

/** Full env when everything is present. Prefer the more specific helpers. */
export function requireEnv(): AppEnv {
  const core = requireCoreEnv();
  const gloo = hasGlooKeys()
    ? {
        GLOO_CLIENT_ID: process.env.GLOO_CLIENT_ID!.trim(),
        GLOO_CLIENT_SECRET: process.env.GLOO_CLIENT_SECRET!.trim(),
      }
    : {};
  return {
    ...core,
    ...gloo,
    GLOO_TOKEN_URL: process.env.GLOO_TOKEN_URL?.trim() || undefined,
  };
}
