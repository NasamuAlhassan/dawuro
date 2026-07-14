import { HomeClient } from "@/components/HomeClient";

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

      <main className="flex flex-1 flex-col">
        <HomeClient />
      </main>

      <footer className="mx-auto w-full max-w-md px-5 pb-8 pt-2 text-center text-[11px] text-ink-soft">
        Scripture from YouVersion · Reflection by Gloo AI · Voice by GhanaNLP
        Khaya. Publisher copyrights shown with each verse.
      </footer>
    </div>
  );
}
