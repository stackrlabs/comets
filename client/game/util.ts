// default seed
let SEED = 0.8;

export function updateSeed(gameId: string) {
  const num = parseInt(gameId.slice(0, 8), 16);
  SEED = num / Math.pow(10, String(num).length);
}

export function random(start: number, end: number): number {
  return Math.floor(SEED * (end - start + 1)) + start;
}

export function randomFloat(start: number, end: number): number {
  return SEED * (end - start) + start;
}
