export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-line px-5 py-4">
        <div className="mx-auto flex w-full max-w-md items-baseline justify-between gap-3">
          <div>
            <h1
              className="text-2xl font-semibold tracking-tight text-brand"
              style={{ fontFamily: "var(--font-display), serif" }}
            >
              Dawuro
            </h1>
            <p className="mt-0.5 text-sm text-ink-soft">
              Scripture in your language, out loud
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 py-8">
        <section className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gold">
            Phase 0
          </p>
          <h2
            className="mt-2 text-xl font-semibold text-ink"
            style={{ fontFamily: "var(--font-display), serif" }}
          >
            Scaffold ready
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            The app boots. Next: drop your API keys into{" "}
            <code className="rounded bg-gold-soft px-1.5 py-0.5 text-ink">
              .env.local
            </code>
            , then we build the Scripture spine (Phase 1).
          </p>
          <p
            className="mt-4 text-base leading-relaxed text-twi"
            style={{ fontFamily: "var(--font-verse), serif" }}
            lang="tw"
          >
            Diacritic check: ɛ ɔ Ɛ Ɔ — Nkwa Asɛm
          </p>
        </section>

        <section className="rounded-2xl border border-dashed border-line bg-gold-soft/40 p-5">
          <p className="text-sm text-ink-soft">
            What&apos;s on your heart? (input + verse card land in Phase 1)
          </p>
        </section>
      </main>
    </div>
  );
}
