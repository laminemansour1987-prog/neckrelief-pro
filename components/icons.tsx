interface IconProps {
  className?: string;
}

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function ZapIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} fill="currentColor" stroke="none">
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
    </svg>
  );
}

export function SparkleIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} fill="currentColor" stroke="none">
      <path d="M12 2c.7 3.4 2 5.6 5 6.5-3 .9-4.3 3.1-5 6.5-.7-3.4-2-5.6-5-6.5 3-.9 4.3-3.1 5-6.5Z" />
      <path d="M19 15c.35 1.7 1 2.8 2.5 3.3-1.5.5-2.15 1.6-2.5 3.3-.35-1.7-1-2.8-2.5-3.3 1.5-.5 2.15-1.6 2.5-3.3Z" />
    </svg>
  );
}

export function TargetIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function GlobeIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <circle cx="12" cy="12" r="8.5" />
      <ellipse cx="12" cy="12" rx="3.6" ry="8.5" />
      <path d="M3.5 12h17" />
    </svg>
  );
}

export function LockIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <rect x="4.5" y="11" width="15" height="9.5" rx="2.2" />
      <path d="M7.5 11V7.7a4.5 4.5 0 0 1 9 0V11" />
    </svg>
  );
}

export function MessageIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base}>
      <rect x="3.5" y="4.5" width="17" height="12.5" rx="5" />
      <path d="M8.5 17 6 21v-4" />
    </svg>
  );
}
