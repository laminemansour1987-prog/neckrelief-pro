export default function AuraOrb({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute overflow-hidden ${className}`} aria-hidden="true">
      <div className="absolute left-1/2 top-0 h-[380px] w-[380px] -translate-x-1/2 animate-blob-a rounded-full bg-aura-500/40 opacity-70 mix-blend-screen blur-[90px]" />
      <div className="absolute left-[15%] top-[20%] h-[300px] w-[300px] animate-blob-b rounded-full bg-bloom-pink/30 opacity-60 mix-blend-screen blur-[90px]" />
      <div className="absolute right-[10%] top-[5%] h-[280px] w-[280px] animate-blob-c rounded-full bg-bloom-blue/25 opacity-60 mix-blend-screen blur-[90px]" />
    </div>
  );
}
