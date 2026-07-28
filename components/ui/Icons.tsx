/** Shared line icons — no emoji. Stroke-based, 24×24 viewBox. */

type IconProps = {
  className?: string;
  size?: number;
  /** Filled variant when active in nav */
  solid?: boolean;
};

const defaults = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconHome({ className, size = 22, solid }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden {...defaults}>
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z"
        fill={solid ? "currentColor" : "none"}
      />
    </svg>
  );
}

export function IconCalendar({ className, size = 22, solid }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden {...defaults}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" fill={solid ? "currentColor" : "none"} opacity={solid ? 0.15 : 1} />
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" />
    </svg>
  );
}

export function IconTopics({ className, size = 22, solid }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden {...defaults}>
      <rect x="4" y="4" width="7" height="7" rx="1.5" fill={solid ? "currentColor" : "none"} />
      <rect x="13" y="4" width="7" height="7" rx="1.5" fill={solid ? "currentColor" : "none"} />
      <rect x="4" y="13" width="7" height="7" rx="1.5" fill={solid ? "currentColor" : "none"} />
      <rect x="13" y="13" width="7" height="7" rx="1.5" fill={solid ? "currentColor" : "none"} />
    </svg>
  );
}

export function IconSliders({ className, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden {...defaults}>
      <path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M8 14v6" />
    </svg>
  );
}

export function IconMic({ className, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden {...defaults}>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6" />
    </svg>
  );
}

export function IconStop({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="6" y="6" width="12" height="12" rx="1.5" fill="currentColor" />
    </svg>
  );
}

export function IconPlay({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M8 5.5v13l11-6.5L8 5.5z" fill="currentColor" />
    </svg>
  );
}

export function IconPause({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
      <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
    </svg>
  );
}

export function IconShare({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden {...defaults}>
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="M8.2 10.8 15.8 6.7M8.2 13.2l7.6 4.1" />
    </svg>
  );
}

export function IconSpeaker({ className, size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden {...defaults}>
      <path d="M4 9.5v5h3.5L12 18V6L7.5 9.5H4zM16 9a3.5 3.5 0 0 1 0 6M18.5 7a6 6 0 0 1 0 10" />
    </svg>
  );
}

export function IconWave({ className, size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden {...defaults}>
      <path d="M3 12h2M7 8v8M11 5v14M15 8v8M19 10v4" />
    </svg>
  );
}

export function IconChevronRight({ className, size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden {...defaults}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function IconLoader({ className, size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden {...defaults}>
      <path d="M12 3a9 9 0 1 1-9 9" />
    </svg>
  );
}
