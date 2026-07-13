import "./index.css";
import { Composition, staticFile } from "remotion";
import {
  CaptionedVideo,
  calculateCaptionedVideoMetadata,
  captionedVideoSchema,
} from "./CaptionedVideo";
import { ProductAd } from "./ProductAd";
import { ProductAdPunch, PRODUCT_AD_PUNCH_DURATION } from "./ProductAdPunch";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CaptionedVideo"
        component={CaptionedVideo}
        calculateMetadata={calculateCaptionedVideoMetadata}
        schema={captionedVideoSchema}
        width={1080}
        height={1920}
        defaultProps={{
          src: staticFile("sample-video.mp4"),
        }}
      />
      <Composition
        id="ProductAd"
        component={ProductAd}
        durationInFrames={240}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          image: staticFile("neckrelief-babycomfort.png"),
          ctaText: "NeckRelief + BabyComfort — Un sommeil sûr dès le premier jour",
        }}
      />
      <Composition
        id="ProductAdPunch"
        component={ProductAdPunch}
        durationInFrames={PRODUCT_AD_PUNCH_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
