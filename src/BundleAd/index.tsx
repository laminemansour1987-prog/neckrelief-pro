import { useEffect } from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont, TheBoldFont } from "../load-font";

const PINK = "#f0a8bd";
const PINK_DARK = "#d9578a";
const INK = "#241f2b";

const HOOK_DURATION = 75;
const SOLUTION_DURATION = 165;
const CTA_DURATION = 100;

const FLASH_DURATION = 8;

const Flash: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, FLASH_DURATION / 2, FLASH_DURATION],
    [0, 0.35, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return (
    <AbsoluteFill style={{ backgroundColor: "#fff5f7", opacity, zIndex: 50 }} />
  );
};

const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const punch = spring({ frame, fps, config: { damping: 18, mass: 0.7 }, durationInFrames: 22 });
  const scale = interpolate(punch, [0, 1], [1.15, 1]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: INK,
        justifyContent: "center",
        alignItems: "center",
        padding: 70,
      }}
    >
      <div
        style={{
          fontFamily: TheBoldFont,
          fontSize: 84,
          lineHeight: 1.08,
          color: "white",
          textAlign: "center",
          transform: `scale(${scale})`,
        }}
      >
        THE NEW PARENT
        <br />
        ESSENTIALS BUNDLE
      </div>
    </AbsoluteFill>
  );
};

const Bullet: React.FC<{ text: string; delay: number }> = ({ text, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - delay;
  const progress = spring({ frame: local, fps, config: { damping: 14 }, durationInFrames: 15 });

  return (
    <div
      style={{
        fontFamily: TheBoldFont,
        fontSize: 36,
        color: "white",
        opacity: progress,
        transform: `translateX(${interpolate(progress, [0, 1], [-60, 0])}px) scale(${interpolate(progress, [0, 1], [0.85, 1])})`,
        display: "flex",
        alignItems: "center",
        gap: 16,
        textShadow: "0 3px 12px rgba(0,0,0,0.6)",
      }}
    >
      <span style={{ color: PINK }}>✓</span>
      {text}
    </div>
  );
};

const Solution: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const punch = spring({ frame, fps, config: { damping: 22, mass: 0.7 }, durationInFrames: 22 });
  const scale = interpolate(punch, [0, 1], [1.12, 1.03]);

  const titleIn = spring({ frame: frame - 8, fps, config: { damping: 16 }, durationInFrames: 18 });

  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <Img
          src={staticFile("neckrelief-bundle.png")}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 55%" }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.85) 100%)",
        }}
      />
      <AbsoluteFill style={{ padding: 60, justifyContent: "space-between" }}>
        <div
          style={{
            fontFamily: TheBoldFont,
            fontSize: 54,
            color: "white",
            textAlign: "center",
            opacity: titleIn,
            transform: `translateY(${interpolate(titleIn, [0, 1], [-30, 0])}px)`,
            textShadow: "0 4px 16px rgba(0,0,0,0.7)",
          }}
        >
          NECKRELIEF + BABYCOMFORT
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <Bullet text="Ergonomic pillow for correct alignment" delay={35} />
          <Bullet text="Soothing teethers for baby" delay={60} />
          <Bullet text="Pediatrician-recommended" delay={85} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const punch = spring({ frame, fps, config: { damping: 16 }, durationInFrames: 20 });
  const pulse = 1 + Math.sin(frame / 7) * 0.035;
  const urgencyIn = spring({ frame: frame - 22, fps, config: { damping: 18 }, durationInFrames: 18 });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${PINK_DARK}, ${PINK})`,
        justifyContent: "center",
        alignItems: "center",
        padding: 60,
      }}
    >
      <div
        style={{
          fontFamily: TheBoldFont,
          fontSize: 28,
          color: "white",
          letterSpacing: 2,
          opacity: interpolate(punch, [0, 1], [0, 1]),
          marginBottom: 24,
        }}
      >
        EXCLUSIVE BUNDLE OFFER
      </div>
      <div
        style={{
          backgroundColor: "white",
          borderRadius: 24,
          padding: "34px 50px",
          transform: `scale(${interpolate(punch, [0, 1], [0.5, 1]) * pulse})`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
        }}
      >
        <div
          style={{
            fontFamily: TheBoldFont,
            fontSize: 54,
            color: PINK_DARK,
            textAlign: "center",
          }}
        >
          SAVE UP TO 20%
        </div>
      </div>
      <div
        style={{
          fontFamily: TheBoldFont,
          fontSize: 28,
          color: "white",
          textAlign: "center",
          marginTop: 30,
          opacity: urgencyIn,
          transform: `translateY(${interpolate(urgencyIn, [0, 1], [20, 0])}px)`,
        }}
      >
        Shop Now — Limited Time
      </div>
    </AbsoluteFill>
  );
};

export const BundleAd: React.FC = () => {
  useEffect(() => {
    loadFont();
  }, []);

  const hookStart = 0;
  const solutionStart = hookStart + HOOK_DURATION;
  const ctaStart = solutionStart + SOLUTION_DURATION;

  return (
    <AbsoluteFill>
      <Audio src={staticFile("audio/bundle-ad-beat.mp3")} />
      <Sequence from={hookStart} durationInFrames={HOOK_DURATION}>
        <Hook />
      </Sequence>
      <Sequence from={solutionStart} durationInFrames={SOLUTION_DURATION}>
        <Solution />
      </Sequence>
      <Sequence from={ctaStart} durationInFrames={CTA_DURATION}>
        <Cta />
      </Sequence>

      <Sequence from={solutionStart - FLASH_DURATION / 2} durationInFrames={FLASH_DURATION}>
        <Flash />
      </Sequence>
      <Sequence from={ctaStart - FLASH_DURATION / 2} durationInFrames={FLASH_DURATION}>
        <Flash />
      </Sequence>
    </AbsoluteFill>
  );
};

export const BUNDLE_AD_DURATION = HOOK_DURATION + SOLUTION_DURATION + CTA_DURATION;
