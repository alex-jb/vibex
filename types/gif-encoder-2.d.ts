declare module "gif-encoder-2" {
  import { Readable } from "stream";

  class GIFEncoder {
    constructor(width: number, height: number, algorithm?: string, useOptimizer?: boolean);
    setDelay(ms: number): void;
    setQuality(quality: number): void;
    setRepeat(repeat: number): void;
    start(): void;
    addFrame(data: Uint8ClampedArray | Buffer): void;
    finish(): void;
    createReadStream?(): Readable;
    out?: { getData(): Buffer };
  }

  export default GIFEncoder;
}
