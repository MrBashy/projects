// Run with: node --test
const test = require("node:test");
const assert = require("node:assert");
const { generatePassword, estimateStrength, SETS } = require("./generator.js");

test("default password is 16 chars and includes every character type", () => {
  for (let i = 0; i < 200; i++) {
    const pw = generatePassword();
    assert.strictEqual(pw.length, 16);
    for (const set of Object.values(SETS)) {
      assert.ok([...pw].some((c) => set.includes(c)), `missing a char from ${set} in ${pw}`);
    }
  }
});

test("respects length and selected character types", () => {
  const pw = generatePassword({ length: 40, upper: false, symbols: false });
  assert.strictEqual(pw.length, 40);
  assert.match(pw, /^[a-z0-9]+$/);
});

test("digits only", () => {
  assert.match(generatePassword({ length: 10, lower: false, upper: false, symbols: false }), /^\d{10}$/);
});

test("avoid look-alikes removes I l 1 O 0 o", () => {
  for (let i = 0; i < 200; i++) {
    assert.doesNotMatch(generatePassword({ length: 64, avoidLookalikes: true }), /[Il1O0o]/);
  }
});

test("rejects bad input", () => {
  assert.throws(() => generatePassword({ length: 3 }), RangeError);
  assert.throws(() => generatePassword({ length: 200 }), RangeError);
  assert.throws(() => generatePassword({ length: 12.5 }), RangeError);
  assert.throws(() => generatePassword({ lower: false, upper: false, digits: false, symbols: false }), /at least one/);
});

test("passwords are not repeated", () => {
  const seen = new Set(Array.from({ length: 1000 }, () => generatePassword()));
  assert.strictEqual(seen.size, 1000);
});

test("characters are roughly evenly distributed", () => {
  const counts = {};
  const n = 20000;
  for (let i = 0; i < n; i++) {
    const c = generatePassword({ length: 4, upper: false, lower: false, symbols: false });
    for (const d of c) counts[d] = (counts[d] || 0) + 1;
  }
  const expected = (n * 4) / 10;
  for (const d of SETS.digits) {
    assert.ok(Math.abs(counts[d] - expected) / expected < 0.1, `digit ${d} count ${counts[d]} far from ${expected}`);
  }
});

test("strength estimate", () => {
  assert.deepStrictEqual(estimateStrength({ length: 16 }), { bits: 104, label: "Very strong" });
  assert.strictEqual(estimateStrength({ length: 6, upper: false, symbols: false, lower: false }).label, "Weak");
});
