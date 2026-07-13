import { AbsoluteFill, Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const ProductAd: React.FC<{
  image: string;
  ctaText: string;
}> = ({ image, ctaText }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const scale = interpolate(frame, [0, durationInFrames], [1, 1.18], {
    extrapolateRight: "clamp",
  });

  const imageOpacity = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: 20,
  });

  const ctaStart = durationInFrames - fps * 2.2;
  const ctaProgress = spring({
    frame: frame - ctaStart,
    fps,
    config: { damping: 200 },
    durationInFrames: 20,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#111111" }}>
      <AbsoluteFill
        style={{
          opacity: imageOpacity,
          transform: `scale(${scale})`,
        }}
      >
        <Img
          src={image}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 30%",
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 140,
          opacity: ctaProgress,
          transform: `translateY(${interpolate(ctaProgress, [0, 1], [40, 0])}px)`,
        }}
      >
        <AbsoluteFill
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 45%)",
          }}
        />
        <div
          style={{
            fontFamily: "Helvetica, Arial, sans-serif",
            fontSize: 64,
            fontWeight: 700,
            color: "white",
            textAlign: "center",
            padding: "0 60px",
            textShadow: "0 4px 20px rgba(0,0,0,0.5)",
          }}
        >
          {ctaText}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
