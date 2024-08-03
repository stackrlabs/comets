/* lookup tables */

const RAD: Record<number, number> = {};
const COS: Record<number, number> = {};
const SIN: Record<number, number> = {};
const r = Math.PI / 180;

for (let i = 0; i <= 360; i++) {
  RAD[i] = i * r;
  COS[i] = Math.cos(RAD[i]);
  SIN[i] = Math.sin(RAD[i]);

  RAD[-i] = -i * r;
  COS[-i] = Math.cos(RAD[-i]);
  SIN[-i] = Math.sin(RAD[-i]);
}

export { RAD, COS, SIN };
