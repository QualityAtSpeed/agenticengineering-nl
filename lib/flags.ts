export function blogsEnabled(): boolean {
  return process.env.BLOGS_ENABLED === 'true';
}
