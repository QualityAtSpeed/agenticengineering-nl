import yaml from 'js-yaml';

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---\s*$/;

export function parseFrontmatter(raw: string, filename: string): unknown {
  const match = raw.match(FRONTMATTER_RE);
  if (!match) {
    throw new Error(
      `Invalid frontmatter in ${filename}: expected file to start with --- and end with ---`,
    );
  }
  try {
    return yaml.load(match[1]);
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to parse YAML frontmatter in ${filename}: ${reason}`);
  }
}
