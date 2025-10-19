export function omit(
  obj: Record<string, unknown>,
  keys: string[],
): Record<string, unknown> {
  if (!obj || typeof obj !== 'object') return {};
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    if (!keys.includes(key)) {
      result[key] = obj[key];
    }
  }
  return result;
}
