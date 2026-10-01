import { describe, it, expect, vi, beforeEach } from 'vitest';

// Next loads this module for the metadata of every page under [locale]. If loading it reads files, every page that
// renders on request needs those files in its serverless bundle. On Vercel they were not there, and /nl/articles,
// /nl/contact and the training pages crashed with "An error occurred in the Server Components render".
const { readFile, ImageResponse } = vi.hoisted(() => ({
  readFile: vi.fn(async (file: string) => Buffer.from(`font:${file}`)),
  ImageResponse: vi.fn(),
}));
vi.mock('node:fs/promises', () => ({ readFile, default: { readFile } }));
vi.mock('next/og', () => ({ ImageResponse }));
vi.mock('next-intl/server', () => ({ getTranslations: vi.fn(async () => (key: string) => key) }));

const loadModule = () => import('@/app/[locale]/opengraph-image');

describe('opengraph-image', () => {
  beforeEach(() => {
    vi.resetModules();
    readFile.mockClear();
    ImageResponse.mockClear();
  });

  it('reads no files when the module is loaded', async () => {
    await loadModule();
    expect(readFile).not.toHaveBeenCalled();
  });

  it('reads the three Rubik weights when it makes the image and passes them to ImageResponse', async () => {
    const { default: Image } = await loadModule();
    readFile.mockClear();
    await Image({ params: Promise.resolve({ locale: 'nl' }) });

    const files = readFile.mock.calls.map(([file]) => String(file));
    expect(files).toHaveLength(3);
    for (const weight of ['400', '600', '700']) {
      expect(
        files.some((file) => file.endsWith(`assets/fonts/rubik-latin-${weight}-normal.woff`)),
      ).toBe(true);
    }
    const options = ImageResponse.mock.calls[0][1];
    expect(options.fonts.map((f: { name: string; weight: number }) => [f.name, f.weight])).toEqual([
      ['Rubik', 400],
      ['Rubik', 600],
      ['Rubik', 700],
    ]);
    expect(options.fonts.every((f: { data: Buffer }) => String(f.data).startsWith('font:'))).toBe(
      true,
    );
  });
});
