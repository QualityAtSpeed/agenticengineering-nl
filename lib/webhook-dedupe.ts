// In-memory dedupe for Stripe webhook events. Best-effort within a single
// serverless instance; Stripe Dashboard remains the source of truth.
const handled = new Set<string>();
const MAX_HANDLED = 1000;

export function markHandled(id: string): boolean {
  if (handled.has(id)) return false;
  if (handled.size >= MAX_HANDLED) handled.clear();
  handled.add(id);
  return true;
}

export function unmarkHandled(id: string): void {
  handled.delete(id);
}

export function __resetWebhookDedupeForTests(): void {
  handled.clear();
}
