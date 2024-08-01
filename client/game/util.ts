// We use a fixed seed for deterministic behavior
const SEED = 0.8;

export function random(start: number, end: number): number {
     return Math.floor(SEED * (end - start + 1)) + start;
}

export function randomFloat(start: number, end: number): number {
    return SEED * (end - start) + start;
}