export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-ink-soft" role="status">
      <span
        className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-line border-t-brand"
        aria-hidden
      />
      {label}
    </span>
  );
}
