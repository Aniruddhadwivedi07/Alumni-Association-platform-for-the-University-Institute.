const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const {
  isPrime,
  gcd,
  extendedGcd,
  modularInverse,
  generateVerificationCode,
  recoverVerificationSequence,
  validateVerificationCode,
  formatVerificationIdentifier,
  parseVerificationIdentifier,
  DEFAULT_MATH_CONFIG
} = require('../src/utils/numberTheory');

describe('INDEPENDENT MATHEMATICAL VERIFICATION & ADVERSARIAL CASES', () => {
  it('Independently calculated case 1: m=17, a=5, b=3, x=9', () => {
    // 5 is coprime to 17. 5*7 = 35 = 2*17 + 1 => 5^(-1) mod 17 = 7
    // V = (5 * 9 + 3) mod 17 = (45 + 3) mod 17 = 48 mod 17 = 14
    const config = { m: 17, a: 5, b: 3 };
    const V = generateVerificationCode(9, config);
    assert.equal(V, 14n);
    const recovered = recoverVerificationSequence(14, config);
    assert.equal(recovered, 9n);
  });

  it('Independently calculated case 2: boundary x = 0', () => {
    const config = { m: 101, a: 3, b: 7 };
    // V = (3 * 0 + 7) mod 101 = 7
    const V = generateVerificationCode(0, config);
    assert.equal(V, 7n);
    const recovered = recoverVerificationSequence(V, config);
    assert.equal(recovered, 0n);
  });

  it('Independently calculated case 3: boundary x = m - 1', () => {
    const config = { m: 101, a: 3, b: 7 };
    // x = 100
    // V = (3 * 100 + 7) mod 101 = 307 mod 101 = 4
    const V = generateVerificationCode(100, config);
    assert.equal(V, 4n);
    const recovered = recoverVerificationSequence(V, config);
    assert.equal(recovered, 100n);
  });

  it('Boundary near modulus limit on production config: x = m - 1', () => {
    const m = DEFAULT_MATH_CONFIG.m;
    const x = m - 1n;
    const V = generateVerificationCode(x);
    const recovered = recoverVerificationSequence(V);
    assert.equal(recovered, x);
  });

  it('Boundary sequence 0 on production config', () => {
    const V = generateVerificationCode(0);
    const recovered = recoverVerificationSequence(V);
    assert.equal(recovered, 0n);
  });

  it('Rejection of invalid negative sequence', () => {
    assert.throws(() => generateVerificationCode(-5), /Sequence out of valid range/);
  });

  it('Rejection of sequence >= m', () => {
    assert.throws(() => generateVerificationCode(DEFAULT_MATH_CONFIG.m), /Sequence out of valid range/);
    assert.throws(() => generateVerificationCode(DEFAULT_MATH_CONFIG.m + 5n), /Sequence out of valid range/);
  });

  it('Rejection of composite modulus in config', () => {
    // 55 = 5 * 11
    assert.throws(() => generateVerificationCode(5, { m: 55, a: 3, b: 7 }), /is not prime/);
    // 100
    assert.throws(() => generateVerificationCode(5, { m: 100, a: 3, b: 7 }), /is not prime/);
    // 1
    assert.throws(() => generateVerificationCode(5, { m: 1, a: 3, b: 7 }), /is not prime/);
  });

  it('Rejection of non-coprime multiplier a', () => {
    // m = 101, if a = 0 or a = 101 or a < 0
    assert.throws(() => generateVerificationCode(5, { m: 101, a: 0, b: 7 }), /must satisfy 0 < a < m/);
    assert.throws(() => generateVerificationCode(5, { m: 101, a: -3, b: 7 }), /must satisfy 0 < a < m/);
    assert.throws(() => generateVerificationCode(5, { m: 101, a: 101, b: 7 }), /must satisfy 0 < a < m/);
  });

  it('Extended Euclidean algorithm with negative inputs', () => {
    const g1 = gcd(-48, 18);
    assert.equal(g1, 6n);
    const g2 = gcd(48, -18);
    assert.equal(g2, 6n);
    const g3 = gcd(-48, -18);
    assert.equal(g3, 6n);
  });

  it('Full round-trip across random sample in [1, m - 1]', () => {
    for (let i = 1; i <= 200; i++) {
      const x = BigInt(Math.floor(Math.random() * 999990) + 1);
      const V = generateVerificationCode(x);
      const recovered = recoverVerificationSequence(V);
      assert.equal(recovered, x);
      assert.equal(validateVerificationCode(V), true);
    }
  });

  it('Invalid/malformed verification identifier parsing', () => {
    assert.throws(() => parseVerificationIdentifier(''), /Invalid identifier format/);
    assert.throws(() => parseVerificationIdentifier('ALU-'), /Invalid identifier format/);
    assert.throws(() => parseVerificationIdentifier('ALU-ABC'), /Invalid identifier format/);
    assert.throws(() => parseVerificationIdentifier('STUDENT-000043'), /Invalid identifier format/);
    assert.throws(() => parseVerificationIdentifier(null), /must be a string/);
    assert.throws(() => parseVerificationIdentifier(12345), /must be a string/);
  });
});
