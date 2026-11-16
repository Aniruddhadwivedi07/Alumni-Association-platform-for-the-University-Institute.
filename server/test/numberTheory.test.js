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

describe('NUMBER THEORY MATHEMATICAL CORE & VERIFICATION IDENTIFIER SYSTEM', () => {
  it('should correctly validate prime numbers', () => {
    assert.equal(isPrime(2), true);
    assert.equal(isPrime(3), true);
    assert.equal(isPrime(5), true);
    assert.equal(isPrime(7), true);
    assert.equal(isPrime(11), true);
    assert.equal(isPrime(13), true);
    assert.equal(isPrime(101), true);
    assert.equal(isPrime(1000003n), true);
  });

  it('should correctly reject composite numbers and edge values <= 1', () => {
    assert.equal(isPrime(-5), false);
    assert.equal(isPrime(0), false);
    assert.equal(isPrime(1), false);
    assert.equal(isPrime(4), false);
    assert.equal(isPrime(9), false);
    assert.equal(isPrime(55), false);
    assert.equal(isPrime(100), false);
    assert.equal(isPrime(1000000), false);
  });

  it('should calculate GCD using Euclidean Algorithm', () => {
    assert.equal(gcd(12, 18), 6n);
    assert.equal(gcd(101, 3), 1n);
    assert.equal(gcd(54, 24), 6n);
    assert.equal(gcd(0, 15), 15n);
    assert.equal(gcd(-20, 30), 10n);
    assert.equal(gcd(1000003n, 65537n), 1n);
  });

  it('should compute Bézout coefficients using Extended Euclidean Algorithm', () => {
    const a = 120n;
    const b = 35n;
    const { gcd: g, x, y } = extendedGcd(a, b);
    assert.equal(g, 5n);
    assert.equal(a * x + b * y, g);
  });

  it('should compute correct modular inverse using Extended Euclidean Algorithm', () => {
    // 3 * 34 = 102 = 1 mod 101
    const inv = modularInverse(3, 101);
    assert.equal(inv, 34n);
    assert.equal((3n * inv) % 101n, 1n);
  });

  it('should reject modular inverse when gcd(a, m) !== 1', () => {
    assert.throws(() => {
      modularInverse(6, 9);
    }, /Modular inverse does not exist/);

    assert.throws(() => {
      modularInverse(10, 55);
    }, /Modular inverse does not exist/);
  });

  it('should reproduce required specification worked example: m=101, a=3, b=7, x=12 => V=43', () => {
    const testConfig = {
      m: 101,
      a: 3,
      b: 7
    };

    // V = (3 * 12 + 7) mod 101 = (36 + 7) mod 101 = 43
    const V = generateVerificationCode(12, testConfig);
    assert.equal(V, 43n);

    // Modular inverse of 3 modulo 101 is 34
    const aInv = modularInverse(testConfig.a, testConfig.m);
    assert.equal(aInv, 34n);

    // x = 34 * (43 - 7) mod 101 = 34 * 36 mod 101 = 1224 mod 101 = 12
    const recoveredX = recoverVerificationSequence(V, testConfig);
    assert.equal(recoveredX, 12n);

    assert.equal(validateVerificationCode(V, testConfig), true);
  });

  it('should preserve bijective round-trip property for arbitrary sequence values: recover(generate(x)) === x', () => {
    const sequences = [0n, 1n, 2n, 42n, 100n, 999n, 123456n, 500000n, DEFAULT_MATH_CONFIG.m - 1n];
    for (const x of sequences) {
      const code = generateVerificationCode(x);
      assert.ok(code >= 0n && code < DEFAULT_MATH_CONFIG.m);
      const recovered = recoverVerificationSequence(code);
      assert.equal(recovered, x);
      assert.equal(validateVerificationCode(code), true);
    }
  });

  it('should reject sequence inputs outside range [0, m - 1]', () => {
    assert.throws(() => {
      generateVerificationCode(-1);
    }, /Sequence out of valid range/);

    assert.throws(() => {
      generateVerificationCode(DEFAULT_MATH_CONFIG.m);
    }, /Sequence out of valid range/);
  });

  it('should reject non-prime modulus in affine transformation configuration', () => {
    assert.throws(() => {
      generateVerificationCode(5, { m: 55, a: 3, b: 7 });
    }, /is not prime/);
  });

  it('should reject multiplier a if not coprime to m or out of bounds', () => {
    assert.throws(() => {
      generateVerificationCode(5, { m: 101, a: 0, b: 7 });
    }, /must satisfy 0 < a < m/);

    assert.throws(() => {
      generateVerificationCode(5, { m: 101, a: 101, b: 7 });
    }, /must satisfy 0 < a < m/);
  });

  it('should format and parse human-readable identifier ALU-XXXXXX', () => {
    assert.equal(formatVerificationIdentifier(43), 'ALU-000043');
    assert.equal(formatVerificationIdentifier(123456), 'ALU-123456');

    assert.equal(parseVerificationIdentifier('ALU-000043'), 43n);
    assert.equal(parseVerificationIdentifier('alu-123456'), 123456n);

    assert.throws(() => {
      parseVerificationIdentifier('INVALID-123');
    }, /Invalid identifier format/);
  });
});
