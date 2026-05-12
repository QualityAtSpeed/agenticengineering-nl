export function stripCRLF(input: string): string {
  return input.replace(/[\r\n]/g, '');
}
