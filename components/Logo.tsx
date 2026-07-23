export default function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="logo-glow" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#e6d9ff" />
          <stop offset="45%" stopColor="#a180ff" />
          <stop offset="100%" stopColor="#5c34f5" />
        </radialGradient>
        <linearGradient id="logo-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8b76ff" />
          <stop offset="100%" stopColor="#ff9fe8" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="15" stroke="url(#logo-ring)" strokeWidth="1.4" opacity="0.55" />
      <circle cx="16" cy="16" r="8.5" fill="url(#logo-glow)" />
    </svg>
  );
}
