import { NextResponse } from "next/server";
import { GlooError, generateReflection, isGlooConfigured } from "@/lib/gloo";
import type { Tradition } from "@/lib/types";

export const runtime = "nodejs";

const TRADITIONS: Tradition[] = ["evangelical", "catholic", "mainline"];

type Body = {
  feeling?: string;
  humanReference?: string;
  englishVerseText?: string;
  tradition?: string;
};

/**
 * POST { feeling, humanReference, englishVerseText, tradition? }
 * → { reflection: { english, tradition } }
 *
 * If Gloo keys are missing, returns 503 with a clear code so the UI
 * can skip reflection without blanking the verse.
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

    return NextResponse.json({
      reflection: {
        english: result.english,
        tradition: result.tradition,
      },
      model: result.model,
    });
  } catch (e) {
    if (e instanceof GlooError) {
      return NextResponse.json(
        { error: e.message, code: e.code || "GLOO_ERROR" },
        {
          status:
            e.status >= 400 && e.status < 600 ? e.status : 502,
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
