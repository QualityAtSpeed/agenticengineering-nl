export function blogsEnabled(): boolean {
  return process.env.BLOGS_ENABLED === 'true';
}

export function testimonialsEnabled(): boolean {
  return process.env.TESTIMONIALS_ENABLED === 'true';
}
