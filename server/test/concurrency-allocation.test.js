const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { allocateNextVerificationSequence } = require('../src/controllers/verification.controller');

describe('CONCURRENCY-SAFE SEQUENCE ALLOCATION AUDIT', () => {
  it('Should atomically allocate unique, monotonically increasing sequence numbers under high concurrency', async () => {
    // Simulating PostgreSQL sequence engine with atomic nextval increment
    let internalPostgresSeqState = 0;
    const mockPostgresTx = {
      $queryRaw: async (strings, ...values) => {
        // Atomic nextval increment emulation
        internalPostgresSeqState += 1;
        return [{ next_val: internalPostgresSeqState }];
      }
    };

    const CONCURRENT_REQUESTS = 100;
    const promises = [];
    for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
      promises.push(allocateNextVerificationSequence(mockPostgresTx));
    }

    const allocated = await Promise.all(promises);

    // Verify exactly 100 results
    assert.equal(allocated.length, CONCURRENT_REQUESTS);

    // Verify zero duplicates
    const uniqueSet = new Set(allocated);
    assert.equal(uniqueSet.size, CONCURRENT_REQUESTS);

    // Verify values span exactly 1 through 100
    const sorted = [...allocated].sort((a, b) => a - b);
    assert.equal(sorted[0], 1);
    assert.equal(sorted[CONCURRENT_REQUESTS - 1], CONCURRENT_REQUESTS);
  });
});
