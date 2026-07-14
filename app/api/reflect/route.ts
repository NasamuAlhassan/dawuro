import { NextResponse } from "next/server";
import { GlooError, generateReflection, isGlooConfigured } from "@/lib/gloo";
import type { Tradition } from "@/lib/types";
import { getLanguage, isLocalLanguageId } from "@/lib/languages";
import { translateFromEnglish } from "@/lib/khaya";

export const runtime = "nodejs";

const TRADITIONS: Tradition[] = ["evangelical", "catholic", "mainline"];

type Body = {
  feeling?: string;
  humanReference?: string;
  englishVerseText?: string;
  tradition?: string;
  /** Translate reflection into this language via Khaya when possible */
  language?: string;
};

/**
 * POST { feeling, humanReference, englishVerseText, tradition?, language? }
 * → { reflection: { english, local?, tradition } }
 */
export async function POST(req: Request) {
  if (!isGlooConfigured()) {
    return NextResponse.json(
      {
        error:
          "Reflection is unavailable until Gloo API credentials are configured.",
        code: "GLOO_NOT_CONFIGURED",
      },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const feeling = body.feeling?.trim();
  const humanReference = body.humanReference?.trim();
  const englishVerseText = body.englishVerseText?.trim();

  if (!feeling || !humanReference || !englishVerseText) {
    return NextResponse.json(
      {
        error:
          "feeling, humanReference, and englishVerseText are required.",
      },
      { status: 400 },
    );
  }

  const tradition = TRADITIONS.includes(body.tradition as Tradition)
    ? (body.tradition as Tradition)
    : "evangelical";

  try {
    const result = await generateReflection({
      feeling,
      humanReference,
      englishVerseText,
      tradition,
    });

    let local: string | undefined;
    const lang = isLocalLanguageId(body.language)
      ? getLanguage(body.language)
      : body.language
        ? getLanguage(body.language)
        : null;

    if (lang?.khayaTranslate && lang.id !== "fr") {
      try {
        local = await translateFromEnglish(
          result.english,
          lang.khayaTranslate,
        );
      } catch (e) {
        console.warn("[/api/reflect] Khaya reflection translate failed", e);
      }
    }

    return NextResponse.json({
      reflection: {
        english: result.english,
        local,
        tradition: result.tradition,
      },
      model: result.model,
    });
  } catch (e) {
    if (e instanceof GlooError) {
      return NextResponse.json(
        { error: e.message, code: e.code || "GLOO_ERROR" },
        {
          status: e.status >= 400 && e.status < 600 ? e.status : 502,
        },
      );
    }
    console.error("[/api/reflect]", e);
    return NextResponse.json(
      {
        error:
          "Could not generate a reflection right now. The verse is still for you.",
        code: "REFLECT_FAILED",
      },
      { status: 502 },
    );
  }
}
