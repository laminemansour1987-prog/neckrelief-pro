export default function Marquee({ items }: { items: string[] }) {
  return (
    <div className="relative overflow-hidden border-y border-white/[0.06] py-6 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div className="flex w-max animate-marquee gap-12 hover:[animation-play-state:paused]">
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className="whitespace-nowrap font-display text-2xl italic text-white/20"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
