const STOP_WORDS = new Set([
  'a',
  'as',
  'ao',
  'aos',
  'com',
  'como',
  'da',
  'das',
  'de',
  'do',
  'dos',
  'e',
  'em',
  'na',
  'nas',
  'no',
  'nos',
  'o',
  'os',
  'ou',
  'para',
  'por',
  'que',
  'se',
  'sem',
  'sobre',
  'um',
  'uma',
]);

export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function stripHtmlTags(value: string): string {
  return normalizeWhitespace(value.replace(/<[^>]+>/g, ' '));
}

export function tokenize(value: string): string[] {
  return normalizeWhitespace(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

export function uniqueTokens(values: string[]): string[] {
  return [...new Set(values)];
}

export function keywordOverlap(left: string[], right: string[]): string[] {
  const rightSet = new Set(right);
  return left.filter((token) => rightSet.has(token));
}

export function clipText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3)}...`;
}
