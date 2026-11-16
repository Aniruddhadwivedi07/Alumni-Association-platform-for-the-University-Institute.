/**
 * Number Theory Utility Module for Alumni Verification System
 *
 * Implements:
 * 1. isPrime(n) - checks primality using trial division
 * 2. gcd(a, b) - Euclidean Algorithm
 * 3. extendedGcd(a, b) - Extended Euclidean Algorithm returning { gcd, x, y } (Bézout coefficients)
 * 4. modularInverse(a, m) - Calculates modular inverse using extendedGcd
 * 5. generateVerificationCode(x, config) - Affine modular transformation: V = (a * x + b) mod m
 * 6. recoverVerificationSequence(V, config) - Inverse transformation: x = a^(-1) * (V - b) mod m
 * 7. validateVerificationCode(V, config) - Validates mathematical identifier and recoverability
 *
 * All mathematical operations use BigInt to ensure integer precision.
 */

'use strict';

/**
 * Default Affine Transformation Constants
 *
 * Conditions:
 * - MODULUS (m) must be prime. (1000003 is a verified prime: 10^6 + 3)
 * - MULTIPLIER (a) must satisfy 0 < a < m and gcd(a, m) = 1. (a = 65537 is coprime to 1000003)
 * - INCREMENT (b) = 42857
 * - Max sequence supported: m - 1
 */
const DEFAULT_MATH_CONFIG = Object.freeze({
  m: 1000003n,
  a: 65537n,
  b: 42857n
});

/**
 * Checks whether BigInt n is prime using trial division
 * @param {bigint|number} n
 * @returns {boolean}
 */
function isPrime(n) {
  const num = BigInt(n);
  if (num <= 1n) return false;
  if (num <= 3n) return true;
  if (num % 2n === 0n || num % 3n === 0n) return false;

  for (let i = 5n; i * i <= num; i += 6n) {
    if (num % i === 0n || num % (i + 2n) === 0n) {
      return false;
    }
  }
  return true;
}

/**
 * Calculates Greatest Common Divisor using Euclidean Algorithm
 * @param {bigint|number} a
 * @param {bigint|number} b
 * @returns {bigint}
 */
function gcd(a, b) {
  let x = BigInt(a);
  let y = BigInt(b);
  if (x < 0n) x = -x;
  if (y < 0n) y = -y;

  while (y !== 0n) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x;
}

/**
 * Extended Euclidean Algorithm
 * Calculates Bézout coefficients x, y such that:
 * a * x + b * y = gcd(a, b)
 *
 * @param {bigint|number} a
 * @param {bigint|number} b
 * @returns {{ gcd: bigint, x: bigint, y: bigint }}
 */
function extendedGcd(a, b) {
  let old_r = BigInt(a);
  let r = BigInt(b);
  let old_s = 1n;
  let s = 0n;
  let old_t = 0n;
  let t = 1n;

  while (r !== 0n) {
    const quotient = old_r / r;

    let temp_r = r;
    r = old_r - quotient * r;
    old_r = temp_r;

    let temp_s = s;
    s = old_s - quotient * s;
    old_s = temp_s;

    let temp_t = t;
    t = old_t - quotient * t;
    old_t = temp_t;
  }

  return {
    gcd: old_r,
    x: old_s,
    y: old_t
  };
}

/**
 * Computes modular inverse of a modulo m: a^(-1) mod m
 * Throws error if gcd(a, m) !== 1
 *
 * @param {bigint|number} a
 * @param {bigint|number} m
 * @returns {bigint} Non-negative modular inverse in [0, m - 1]
 */
function modularInverse(a, m) {
  const mod = BigInt(m);
  if (mod <= 1n) {
    throw new Error('Modulus must be greater than 1');
  }

  // Canonicalize a into [0, mod - 1]
  let val = BigInt(a) % mod;
  if (val < 0n) val += mod;

  const egcd = extendedGcd(val, mod);
  if (egcd.gcd !== 1n) {
    throw new Error(`Modular inverse does not exist: gcd(${a}, ${m}) = ${egcd.gcd} !== 1`);
  }

  let inv = egcd.x % mod;
  if (inv < 0n) inv += mod;
  return inv;
}

/**
 * Normalizes configuration and validates mathematical invariants
 * @param {object} [customConfig]
 * @returns {{ m: bigint, a: bigint, b: bigint }}
 */
function normalizeConfig(customConfig) {
  const m = BigInt(customConfig?.m ?? DEFAULT_MATH_CONFIG.m);
  const a = BigInt(customConfig?.a ?? DEFAULT_MATH_CONFIG.a);
  const b = BigInt(customConfig?.b ?? DEFAULT_MATH_CONFIG.b);

  if (!isPrime(m)) {
    throw new Error(`Invalid configuration: Modulus m = ${m} is not prime`);
  }

  if (a <= 0n || a >= m) {
    throw new Error(`Invalid configuration: Multiplier a must satisfy 0 < a < m (got a = ${a}, m = ${m})`);
  }

  if (gcd(a, m) !== 1n) {
    throw new Error(`Invalid configuration: gcd(a, m) must be 1 (got gcd(${a}, ${m}) = ${gcd(a, m)})`);
  }

  return { m, a, b };
}

/**
 * Generates transformed verification number V using affine modular transformation:
 * V = (a * x + b) mod m
 *
 * @param {bigint|number} x - Numeric sequence
 * @param {object} [config] - Optional custom { m, a, b }
 * @returns {bigint} Non-negative verification number V in [0, m - 1]
 */
function generateVerificationCode(x, config) {
  const { m, a, b } = normalizeConfig(config);
  const seq = BigInt(x);

  if (seq < 0n || seq >= m) {
    throw new Error(`Sequence out of valid range [0, ${m - 1n}]: received ${seq}`);
  }

  let V = (a * seq + b) % m;
  if (V < 0n) V += m;
  return V;
}

/**
 * Reverses affine modular transformation to recover sequence x:
 * x = a^(-1) * (V - b) mod m
 *
 * @param {bigint|number} V - Transformed verification number
 * @param {object} [config] - Optional custom { m, a, b }
 * @returns {bigint} Recovered sequence x
 */
function recoverVerificationSequence(V, config) {
  const { m, a, b } = normalizeConfig(config);
  const code = BigInt(V);

  if (code < 0n || code >= m) {
    throw new Error(`Verification number out of range [0, ${m - 1n}]: received ${code}`);
  }

  const aInv = modularInverse(a, m);
  let diff = (code - b) % m;
  if (diff < 0n) diff += m;

  let x = (aInv * diff) % m;
  if (x < 0n) x += m;
  return x;
}

/**
 * Validates mathematical identifier and recoverability
 * @param {bigint|number} V
 * @param {object} [config]
 * @returns {boolean}
 */
function validateVerificationCode(V, config) {
  try {
    const code = BigInt(V);
    const { m } = normalizeConfig(config);
    if (code < 0n || code >= m) return false;

    const recovered = recoverVerificationSequence(code, config);
    const regenerated = generateVerificationCode(recovered, config);
    return regenerated === code;
  } catch {
    return false;
  }
}

/**
 * Formats mathematical verification number into human-readable identifier: ALU-000043
 * @param {bigint|number} V
 * @returns {string}
 */
function formatVerificationIdentifier(V) {
  const num = BigInt(V).toString();
  return `ALU-${num.padStart(6, '0')}`;
}

/**
 * Parses ALU-000043 into numeric verification code V
 * @param {string} identifier
 * @returns {bigint}
 */
function parseVerificationIdentifier(identifier) {
  if (typeof identifier !== 'string') {
    throw new Error('Verification identifier must be a string');
  }
  const trimmed = identifier.trim().toUpperCase();
  const match = trimmed.match(/^ALU-(\d+)$/);
  if (!match) {
    throw new Error(`Invalid identifier format "${identifier}". Expected format: ALU-XXXXXX`);
  }
  return BigInt(match[1]);
}

module.exports = {
  DEFAULT_MATH_CONFIG,
  isPrime,
  gcd,
  extendedGcd,
  modularInverse,
  normalizeConfig,
  generateVerificationCode,
  recoverVerificationSequence,
  validateVerificationCode,
  formatVerificationIdentifier,
  parseVerificationIdentifier
};
