/**
 * Client-side helpers to render ShareableCard DOM → PNG data URL.
 * Uses html-to-image (browser only).
 */

import { toPng } from "html-to-image";

export async function renderCardToPng(
  element: HTMLElement,
  options?: { pixelRatio?: number },
): Promise<string> {
  // Wait a frame so fonts/layout settle
  await new Promise((r) => requestAnimationFrame(() => r(null)));

  return toPng(element, {
    cacheBust: true,
    pixelRatio: options?.pixelRatio ?? 2,
    backgroundColor: "#FBF7F0",
    // Prefer system/Noto fonts already loaded on the page
    style: {
      // Ensure fixed dimensions are honored
    },
  });
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function slugifyRef(humanReference: string): string {
  return humanReference
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

/** Can we use Web Share with files on this device? */
export function canShareFiles(): boolean {
  if (typeof navigator === "undefined" || !navigator.share) return false;
  try {
    const test = new File([new Blob(["x"], { type: "text/plain" })], "t.txt", {
      type: "text/plain",
    });
    return navigator.canShare?.({ files: [test] }) ?? false;
  } catch {
    return false;
  }
}
