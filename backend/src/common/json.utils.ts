export function parseModelJson<T>(value: string): T | null {
  const normalized = value
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    return JSON.parse(normalized) as T;
  } catch {
    return null;
  }
}
