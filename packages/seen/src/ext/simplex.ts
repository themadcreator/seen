
// Adapted from https://github.com/josephg/noisejs/blob/master/perlin.js

// This code was placed in the public domain by its original author,
// Stefan Gustavson. You may use it as you see fit, but
// attribution is appreciated.

class Grad {
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly z: number
  ) {
  }

  public dot(x, y, z) {
    return (this.x*x) + (this.y*y) + (this.z*z);
  }
};

// prettier-ignore
const grad3 = [
  new Grad( 1, 1, 0),
  new Grad(-1, 1, 0),
  new Grad( 1,-1, 0),
  new Grad(-1,-1, 0),
  new Grad( 1, 0, 1),
  new Grad(-1, 0, 1),
  new Grad( 1, 0,-1),
  new Grad(-1, 0,-1),
  new Grad( 0, 1, 1),
  new Grad( 0,-1, 1),
  new Grad( 0, 1,-1),
  new Grad( 0,-1,-1)
];

// To remove the need for index wrapping, double the permutation table length
// prettier-ignore
const SIMPLEX_PERMUTATIONS_TABLE = [151,160,137,91,90,15,
  131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
  190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
  88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,
  77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
  102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,
  135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,
  5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
  223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,
  129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,
  251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,
  49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,
  138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];

const F3 = 1 / 3;
const G3 = 1 / 6;

export class Simplex3D {
  private readonly perm = new Array<number>(512);
  private readonly gradP = new Array<Grad>(512);

  constructor(seed: number = 0) {
    this.seed(seed);
  }

  // This isn't a very good seeding function, but it works ok. It supports 2^16
  // different seed values. Write something better if you need more seeds.
  private seed(seed) {
    // Scale the seed out
    if((seed > 0) && (seed < 1)) {
      seed *= 65536;
    }

    seed = Math.floor(seed);
    if(seed < 256) {
      seed |= seed << 8;
    }

    return (() => {
      const result = [];
      for (let i = 0; i < 256; i++) {
        let v = 0;
        if (i & 1) {
          v = SIMPLEX_PERMUTATIONS_TABLE[i] ^ (seed & 255);
        } else {
          v = SIMPLEX_PERMUTATIONS_TABLE[i] ^ ((seed>>8) & 255);
        }

        this.perm[i]  = (this.perm[i + 256]  = v);
        result.push(this.gradP[i] = (this.gradP[i + 256] = grad3[v % 12]));
      }
      return result;
    })();
  }

  public noise(x, y, z) {
    // Skew the input space to determine which simplex cell we're in
    let i1, i2, j1, j2, k1, k2, n0, n1, n2, n3;
    const s = (x + y + z)*F3; // Hairy factor for 2D
    let i = Math.floor(x + s);
    let j = Math.floor(y + s);
    let k = Math.floor(z + s);

    const t  = (i + j + k) * G3;
    const x0 = (x - i) + t; // The x,y distances from the cell origin, unskewed.
    const y0 = (y - j) + t;
    const z0 = (z - k) + t;

    // For the 3D case, the simplex shape is a slightly irregular tetrahedron.
    // Determine which simplex we are in.
    // Offsets for second corner of simplex in (i,j,k) coords
    // Offsets for third corner of simplex in (i,j,k) coords
    if(x0 >= y0) {
      if(y0 >= z0) {
        i1=1; j1=0; k1=0; i2=1; j2=1; k2=0;
      } else if(x0 >= z0) {
        i1=1; j1=0; k1=0; i2=1; j2=0; k2=1;
      } else {
        i1=0; j1=0; k1=1; i2=1; j2=0; k2=1;
      }
    } else {
      if(y0 < z0) {
        i1=0; j1=0; k1=1; i2=0; j2=1; k2=1;
      } else if(x0 < z0) {
        i1=0; j1=1; k1=0; i2=0; j2=1; k2=1;
      } else {
        i1=0; j1=1; k1=0; i2=1; j2=1; k2=0;
      }
    }

    // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
    // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
    // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
    // c = 1/6.
    const x1 = (x0 - i1) + G3; // Offsets for second corner
    const y1 = (y0 - j1) + G3;
    const z1 = (z0 - k1) + G3;

    const x2 = (x0 - i2) + (2 * G3); // Offsets for third corner
    const y2 = (y0 - j2) + (2 * G3);
    const z2 = (z0 - k2) + (2 * G3);

    const x3 = (x0 - 1) + (3 * G3); // Offsets for fourth corner
    const y3 = (y0 - 1) + (3 * G3);
    const z3 = (z0 - 1) + (3 * G3);

    // Work out the hashed gradient indices of the four simplex corners
    i &= 0xFF;
    j &= 0xFF;
    k &= 0xFF;
    const gi0 = this.gradP[i +      this.perm[j +      this.perm[k]]];
    const gi1 = this.gradP[i + i1 + this.perm[j + j1 + this.perm[k + k1]]];
    const gi2 = this.gradP[i + i2 + this.perm[j + j2 + this.perm[k + k2]]];
    const gi3 = this.gradP[i + 1  + this.perm[j + 1  + this.perm[k + 1]]];

    // Calculate the contribution from the four corners
    let t0 = 0.5 - (x0*x0)-(y0*y0)-(z0*z0);
    if(t0<0) {
      n0 = 0;
    } else {
      t0 *= t0;
      n0 = t0 * t0 * gi0.dot(x0, y0, z0);  // (x,y) of grad3 used for 2D gradient
    }

    let t1 = 0.5 - (x1*x1)-(y1*y1)-(z1*z1);
    if(t1<0) {
      n1 = 0;
    } else {
      t1 *= t1;
      n1 = t1 * t1 * gi1.dot(x1, y1, z1);
    }

    let t2 = 0.5 - (x2*x2)-(y2*y2)-(z2*z2);
    if(t2<0) {
      n2 = 0;
    } else {
      t2 *= t2;
      n2 = t2 * t2 * gi2.dot(x2, y2, z2);
    }

    let t3 = 0.5 - (x3*x3)-(y3*y3)-(z3*z3);
    if(t3<0) {
      n3 = 0;
    } else {
      t3 *= t3;
      n3 = t3 * t3 * gi3.dot(x3, y3, z3);
    }

    // Add contributions from each corner to get the final noise value.
    // The result is scaled to return values in the interval [-1,1].
    return 32 * (n0 + n1 + n2 + n3);
  }
};
