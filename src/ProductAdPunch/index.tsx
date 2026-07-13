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

const HOOK_DURATION = 70;
const PROBLEM_DURATION = 85;
const SOLUTION_DURATION = 150;
const CTA_DURATION = 85;

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
          fontSize: 96,
          lineHeight: 1.05,
          color: "white",
          textAlign: "center",
          transform: `scale(${scale})`,
        }}
      >
        VOTRE BÉBÉ
        <br />
        DORT MAL ?
      </div>
    </AbsoluteFill>
  );
};

const Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const statIn = spring({ frame, fps, config: { damping: 14 }, durationInFrames: 20 });
  const subIn = spring({ frame: frame - 20, fps, config: { damping: 20 }, durationInFrames: 20 });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: INK,
        justifyContent: "center",
        alignItems: "center",
        padding: 80,
      }}
    >
      <div
        style={{
          fontFamily: TheBoldFont,
          fontSize: 108,
          color: PINK,
          textAlign: "center",
          lineHeight: 1.05,
          opacity: statIn,
          transform: `scale(${interpolate(statIn, [0, 1], [0.7, 1])})`,
        }}
      >
        1 BÉBÉ SUR 5
      </div>
      <div
        style={{
          fontFamily: TheBoldFont,
          fontSize: 42,
          color: "white",
          textAlign: "center",
          marginTop: 30,
          opacity: subIn,
          transform: `translateY(${interpolate(subIn, [0, 1], [20, 0])}px)`,
        }}
      >
        touché par la plagiocéphalie à cause d'une
        mauvaise position de sommeil.
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
        fontSize: 40,
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
          src={staticFile("neckrelief-babycomfort.png")}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 35%" }}
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
            fontSize: 58,
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
          <Bullet text="Design ergonomique breveté" delay={35} />
          <Bullet text="Prévient la plagiocéphalie" delay={55} />
          <Bullet text="Sommeil sûr et réparateur" delay={75} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const punch = spring({ frame, fps, config: { damping: 14 }, durationInFrames: 20 });
  const pulse = 1 + Math.sin(frame / 6) * 0.04;
  const urgencyIn = spring({ frame: frame - 20, fps, config: { damping: 18 }, durationInFrames: 18 });

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
          fontSize: 30,
          color: "white",
          letterSpacing: 2,
          opacity: interpolate(punch, [0, 1], [0, 1]),
          marginBottom: 24,
        }}
      >
        OFFRE DE LANCEMENT
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
          COMMANDEZ
          <br />
          MAINTENANT
        </div>
      </div>
      <div
        style={{
          fontFamily: TheBoldFont,
          fontSize: 30,
          color: "white",
          textAlign: "center",
          marginTop: 30,
          opacity: urgencyIn,
          transform: `translateY(${interpolate(urgencyIn, [0, 1], [20, 0])}px)`,
        }}
      >
        Stock limité — Livraison rapide
      </div>
    </AbsoluteFill>
  );
};

export const ProductAdPunch: React.FC = () => {
  useEffect(() => {
    loadFont();
  }, []);

  const hookStart = 0;
  const problemStart = hookStart + HOOK_DURATION;
  const solutionStart = problemStart + PROBLEM_DURATION;
  const ctaStart = solutionStart + SOLUTION_DURATION;

  return (
    <AbsoluteFill>
      <Audio src={staticFile("audio/warm-lullaby-beat.mp3")} />
      <Sequence from={hookStart} durationInFrames={HOOK_DURATION}>
        <Hook />
      </Sequence>
      <Sequence from={problemStart} durationInFrames={PROBLEM_DURATION}>
        <Problem />
      </Sequence>
      <Sequence from={solutionStart} durationInFrames={SOLUTION_DURATION}>
        <Solution />
      </Sequence>
      <Sequence from={ctaStart} durationInFrames={CTA_DURATION}>
        <Cta />
      </Sequence>

      <Sequence from={problemStart - FLASH_DURATION / 2} durationInFrames={FLASH_DURATION}>
        <Flash />
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

export const PRODUCT_AD_PUNCH_DURATION =
  HOOK_DURATION + PROBLEM_DURATION + SOLUTION_DURATION + CTA_DURATION;
