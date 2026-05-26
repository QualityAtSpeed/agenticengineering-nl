import yaml from 'js-yaml';

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/;

export function parseFrontmatter(raw: string, filename: string): { fm: unknown; body: string } {
  const match = raw.match(FRONTMATTER_RE);
  if (!match) {
    throw new Error(
      `Invalid frontmatter in ${filename}: expected file to start with --- and end with ---`,
    );
  }
  let fm: unknown;
  try {
    fm = yaml.load(match[1]);
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to parse YAML frontmatter in ${filename}: ${reason}`);
  }
  return { fm, body: match[2].trim() };
}
