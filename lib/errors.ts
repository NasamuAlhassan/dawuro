/**
 * Actionable error messages for the UI (Biblica, Gloo, network, Khaya).
 */

export function humanizeApiError(error: string | undefined | null): {
  title: string;
  detail?: string;
  actionHref?: string;
  actionLabel?: string;
} {
  const e = (error || "").toLowerCase();

  if (e.includes("biblica") || e.includes("license") || e.includes("access blocked") || e.includes("403")) {
    return {
      title: "Scripture text is blocked for this app key.",
      detail:
        "Accept the Biblica Fast-track Bible License on the YouVersion Platform, then refresh.",
      actionHref: "https://platform.youversion.com/",
      actionLabel: "Open platform.youversion.com",
    };
  }

  if (e.includes("gloo") && (e.includes("not configured") || e.includes("credentials"))) {
    return {
      title: "Reflection needs Gloo API keys.",
      detail:
        "Add GLOO_CLIENT_ID and GLOO_CLIENT_SECRET to .env.local (studio.ai.gloo.com).",
      actionHref: "https://studio.ai.gloo.com/",
      actionLabel: "Open Gloo Studio",
    };
  }

  if (e.includes("khaya") || e.includes("tts") || e.includes("transcri")) {
    return {
      title: "Voice service had a problem.",
      detail: "You can still read the verse. Try typing, or try again in a moment.",
    };
  }

  if (e.includes("network") || e.includes("timeout") || e.includes("fetch")) {
    return {
      title: "Connection problem.",
      detail: "Check your network and try again. On slow data, wait a few seconds.",
    };
  }

  return {
    title: error?.trim() || "Something went wrong.",
    detail: "Please try again.",
  };
}
