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

type Caption = { text: string; from: number; duration: number };

const CAPTIONS: Caption[] = [
  { text: "Hi, I'm a mom just like you.", from: 0, duration: 78 },
  { text: "My baby wasn't sleeping well...", from: 78, duration: 78 },
  { text: "...and I was worried about flat spots.", from: 156, duration: 84 },
  { text: "Then I found NeckRelief + BabyComfort.", from: 240, duration: 90 },
  { text: "An ergonomic pillow, scientifically designed...", from: 330, duration: 96 },
  { text: "...to prevent plagiocephaly and ensure safe sleep.", from: 426, duration: 96 },
  { text: "Now she sleeps safe, comfortable, and sound.", from: 522, duration: 90 },
];

const PRESENTER_1_START = 0;
const PRESENTER_1_END = 240;
const PRODUCT_START = 240;
const PRODUCT_END = 522;
const PRESENTER_2_START = 522;
const PRESENTER_2_END = 612;
const CTA_START = 612;
const CTA_DURATION = 108;

export const PRESENTER_AD_DURATION = CTA_START + CTA_DURATION;

const CaptionBar: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const in_ = spring({ frame, fps, config: { damping: 18 }, durationInFrames: 12 });
  const out = spring({
    frame: frame - (durationInFrames - 10),
    fps,
    config: { damping: 18 },
    durationInFrames: 10,
  });
  const opacity = in_ * (1 - out);

  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 210 }}>
      <div
        style={{
          fontFamily: TheBoldFont,
          fontSize: 46,
          color: "white",
          textAlign: "center",
          padding: "18px 36px",
          borderRadius: 18,
          backgroundColor: "rgba(0,0,0,0.45)",
          opacity,
          transform: `translateY(${interpolate(opacity, [0, 1], [16, 0])}px)`,
          maxWidth: "88%",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

const PresenterScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const scale = interpolate(frame, [0, durationInFrames], [1, 1.08], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <Img
          src={staticFile("presenter.jpg")}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%" }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 40%)",
        }}
      />
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
        transform: `translateX(${interpolate(progress, [0, 1], [-50, 0])}px) scale(${interpolate(progress, [0, 1], [0.85, 1])})`,
        display: "flex",
        alignItems: "center",
        gap: 14,
        textShadow: "0 3px 12px rgba(0,0,0,0.6)",
      }}
    >
      <span style={{ color: PINK }}>✓</span>
      {text}
    </div>
  );
};

const ProductScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const punch = spring({ frame, fps, config: { damping: 22, mass: 0.7 }, durationInFrames: 22 });
  const scale = interpolate(punch, [0, 1], [1.1, 1.02]);

  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <Img
          src={staticFile("neckrelief-babycomfort.png")}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0.05) 55%, rgba(0,0,0,0.85) 100%)",
        }}
      />
      <AbsoluteFill style={{ padding: 60, justifyContent: "flex-end", paddingBottom: 260 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Bullet text="Patented ergonomic design" delay={90} />
          <Bullet text="Helps prevent plagiocephaly" delay={130} />
          <Bullet text="Safe, restful sleep" delay={186} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const CtaScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const punch = spring({ frame, fps, config: { damping: 16 }, durationInFrames: 20 });
  const pulse = 1 + Math.sin(frame / 7) * 0.035;
  const urgencyIn = spring({ frame: frame - 25, fps, config: { damping: 18 }, durationInFrames: 18 });

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
          fontSize: 32,
          color: "white",
          textAlign: "center",
          opacity: interpolate(punch, [0, 1], [0, 1]),
          marginBottom: 30,
        }}
      >
        Give your baby the perfect start
      </div>
      <div
        style={{
          backgroundColor: "white",
          borderRadius: 24,
          padding: "34px 56px",
          transform: `scale(${interpolate(punch, [0, 1], [0.5, 1]) * pulse})`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
        }}
      >
        <div style={{ fontFamily: TheBoldFont, fontSize: 56, color: PINK_DARK, textAlign: "center" }}>
          ORDER NOW
        </div>
      </div>
      <div
        style={{
          fontFamily: TheBoldFont,
          fontSize: 28,
          color: "white",
          textAlign: "center",
          marginTop: 32,
          opacity: urgencyIn,
          transform: `translateY(${interpolate(urgencyIn, [0, 1], [20, 0])}px)`,
        }}
      >
        Limited stock — Fast shipping
      </div>
    </AbsoluteFill>
  );
};

export const PresenterAd: React.FC = () => {
  useEffect(() => {
    loadFont();
  }, []);

  return (
    <AbsoluteFill>
      <Audio src={staticFile("audio/presenter-ad-beat.mp3")} />

      <Sequence from={PRESENTER_1_START} durationInFrames={PRESENTER_1_END - PRESENTER_1_START}>
        <PresenterScene />
      </Sequence>
      <Sequence from={PRODUCT_START} durationInFrames={PRODUCT_END - PRODUCT_START}>
        <ProductScene />
      </Sequence>
      <Sequence from={PRESENTER_2_START} durationInFrames={PRESENTER_2_END - PRESENTER_2_START}>
        <PresenterScene />
      </Sequence>
      <Sequence from={CTA_START} durationInFrames={CTA_DURATION}>
        <CtaScene />
      </Sequence>

      {CAPTIONS.map((c, i) => (
        <Sequence key={i} from={c.from} durationInFrames={c.duration}>
          <CaptionBar text={c.text} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
