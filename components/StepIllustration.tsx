interface Props {
  variant: "account" | "question" | "daily";
  className?: string;
}

export default function StepIllustration({ variant, className = "h-36 w-full" }: Props) {
  return (
    <svg viewBox="0 0 280 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`${variant}-accent`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8b76ff" />
          <stop offset="100%" stopColor="#ff9fe8" />
        </linearGradient>
        <radialGradient id={`${variant}-halo`} cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="rgba(139,118,255,0.35)" />
          <stop offset="100%" stopColor="rgba(139,118,255,0)" />
        </radialGradient>
      </defs>

      <rect width="280" height="140" rx="14" fill={`url(#${variant}-halo)`} opacity="0.6" />

      {variant === "account" && (
        <g>
          <rect x="70" y="22" width="140" height="96" rx="12" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.12)" />
          <circle cx="140" cy="52" r="16" fill="url(#account-accent)" opacity="0.9" />
          <circle cx="140" cy="47" r="5.5" fill="#0c0920" opacity="0.55" />
          <path d="M131 58c2.5-4 15.5-4 18 0" stroke="#0c0920" strokeOpacity="0.55" strokeWidth="3" strokeLinecap="round" />
          <rect x="96" y="78" width="88" height="7" rx="3.5" fill="rgba(255,255,255,0.18)" />
          <rect x="108" y="93" width="64" height="7" rx="3.5" fill="rgba(255,255,255,0.10)" />
          <circle cx="204" cy="30" r="10" fill="url(#account-accent)" />
          <path d="M200 30l3 3 5.5-6" stroke="#0c0920" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="70" cy="104" r="3" fill="#8b76ff" opacity="0.7" />
          <circle cx="222" cy="90" r="2.2" fill="#ff9fe8" opacity="0.7" />
        </g>
      )}

      {variant === "question" && (
        <g>
          <rect x="52" y="30" width="112" height="30" rx="14" fill="rgba(255,255,255,0.09)" />
          <rect x="64" y="42" width="66" height="6" rx="3" fill="rgba(255,255,255,0.28)" />
          <rect x="96" y="72" width="132" height="40" rx="16" fill="url(#question-accent)" opacity="0.9" />
          <rect x="110" y="84" width="86" height="6" rx="3" fill="rgba(12,9,32,0.5)" />
          <rect x="110" y="96" width="58" height="6" rx="3" fill="rgba(12,9,32,0.35)" />
          <path d="M225 32c1.5 6 4.5 9 10 10.5-5.5 1.5-8.5 4.5-10 10.5-1.5-6-4.5-9-10-10.5 5.5-1.5 8.5-4.5 10-10.5Z" fill="url(#question-accent)" />
          <circle cx="48" cy="98" r="2.6" fill="#52b4ff" opacity="0.8" />
        </g>
      )}

      {variant === "daily" && (
        <g>
          <rect x="66" y="26" width="148" height="92" rx="12" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.12)" />
          <rect x="66" y="26" width="148" height="24" rx="12" fill="rgba(255,255,255,0.07)" />
          <circle cx="82" cy="38" r="3.4" fill="#ff9fe8" />
          <circle cx="94" cy="38" r="3.4" fill="#8b76ff" />
          {[0, 1, 2, 3, 4].map((col) => (
            <circle key={col} cx={90 + col * 25} cy={68} r="5.5" fill={col < 4 ? "url(#daily-accent)" : "rgba(255,255,255,0.12)"} />
          ))}
          <path
            d="M84 104c14-4 22-16 34-14s16 8 28 4 18-14 30-16"
            stroke="url(#daily-accent)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="206" cy="78" r="3" fill="#52b4ff" opacity="0.8" />
        </g>
      )}
    </svg>
  );
}
