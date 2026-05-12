/* eslint-disable no-control-regex */
export function stripCRLF(input: string): string {
  return input.replace(/[\r\n\u2028\u2029\u0000]/g, '');
}
