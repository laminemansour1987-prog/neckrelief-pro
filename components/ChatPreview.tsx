export default function ChatPreview() {
  return (
    <div className="relative mx-auto w-full max-w-md animate-float">
      <div className="absolute -inset-8 -z-10 bg-aura-glow blur-2xl" />
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/40 backdrop-blur-sm">
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          <span className="ml-2 text-xs text-white/30">Aura</span>
        </div>
        <div className="space-y-3 p-4">
          <div className="flex justify-end">
            <div className="max-w-[75%] rounded-2xl rounded-br-sm bg-aura-500 px-3.5 py-2 text-sm text-white">
              Je suis assis toute la journée, j&apos;ai mal au cou…
            </div>
          </div>
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-white/10 px-3.5 py-2 text-sm text-white/90">
              Redressez les épaules, menton légèrement rentré, et faites une
              pause de 2 min toutes les 30 min. Je vous rappelle dans 1h ?
            </div>
          </div>
          <div className="flex justify-end">
            <div className="max-w-[75%] rounded-2xl rounded-br-sm bg-aura-500 px-3.5 py-2 text-sm text-white">
              Oui, parfait 🙏
            </div>
          </div>
          <div className="flex items-center gap-1.5 pl-1 pt-1">
            <span className="h-1.5 w-1.5 animate-blink rounded-full bg-white/40 [animation-delay:0ms]" />
            <span className="h-1.5 w-1.5 animate-blink rounded-full bg-white/40 [animation-delay:200ms]" />
            <span className="h-1.5 w-1.5 animate-blink rounded-full bg-white/40 [animation-delay:400ms]" />
          </div>
        </div>
      </div>
    </div>
  );
}
