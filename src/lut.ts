
/* lookup tables */

let RAD = {};
let COS = {};
let SIN = {};

let r = Math.PI/180;

for(let i = 1; i <= 360; i++) {
    RAD[i] = i * r; 
    COS[i] = Math.cos(RAD[i]);
    SIN[i] = Math.sin(RAD[i]);

    RAD[-i] = -i * r; 
    COS[-i] = Math.cos(RAD[-i]);
    SIN[-i] = Math.sin(RAD[-i]);
}

export { RAD, COS, SIN }