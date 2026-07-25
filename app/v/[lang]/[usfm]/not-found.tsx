import Link from "next/link";

/** Shown for corrupted or unknown verse links — friendly, with a way in. */
export default function ReceiveNotFound() {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <header className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-brand">
          Sent to you
        </p>
        <h1
          className="text-[1.65rem] font-semibold leading-[1.2] tracking-[-0.02em] text-ink"
          style={{ fontFamily: "var(--font-display), serif" }}
        >
          A verse for you
        </h1>
      </header>
      <section className="dawuro-panel px-4 py-4">
        <p className="text-[13px] leading-relaxed text-ink-soft">
          This link doesn&apos;t look like a verse we know. Ask your friend to
          send it again — or find a verse of your own below.
        </p>
      </section>
      <Link
        href="/"
        className="inline-flex min-h-11 w-full items-center justify-center rounded-[var(--radius-sm)] bg-brand text-[14px] font-semibold text-white transition hover:bg-brand-deep"
      >
        Find a verse for how you feel
      </Link>
    </div>
  );
}
