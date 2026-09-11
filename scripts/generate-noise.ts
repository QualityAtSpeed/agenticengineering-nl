import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const SIZE = 256;
const BLUR_SIGMA = 2;
const OUTPUT = path.join(process.cwd(), 'public', 'noise-mask.png');

/**
 * Builds a greyscale noise tile used as a mask layer in the hero background.
 * Grey level maps to mask opacity: black hides, white reveals.
 */
export function generateNoise(size: number = SIZE): Buffer {
  const pixels = Buffer.alloc(size * size);
  for (let i = 0; i < pixels.length; i += 1) {
    pixels[i] = Math.floor(Math.random() * 256);
  }
  return pixels;
}

export async function writeNoiseTile(output: string = OUTPUT, size: number = SIZE): Promise<void> {
  const raw = generateNoise(size);

  // Blur first so the noise reads as soft cloud rather than TV static,
  // then stretch the remaining contrast back out.
  const grey = await sharp(raw, { raw: { width: size, height: size, channels: 1 } })
    .blur(BLUR_SIGMA)
    .normalise()
    .toBuffer();

  // A CSS mask reads the alpha channel, not brightness, so the noise has to
  // BE the alpha. White RGB keeps the revealed pixels at full strength.
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .joinChannel(grey, { raw: { width: size, height: size, channels: 1 } })
    .png({ compressionLevel: 9 })
    .toFile(output);
}

async function main(): Promise<void> {
  await writeNoiseTile();
  const { size: bytes } = fs.statSync(OUTPUT);
  console.log(`Wrote ${OUTPUT} (${(bytes / 1024).toFixed(1)} KB)`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err: unknown) => {
    console.error(err);
    process.exitCode = 1;
  });
}
