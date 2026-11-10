// Password generation logic. Works in the browser (as a plain <script>) and in Node (for tests).
(function (root) {
  const SETS = {
    lower: "abcdefghijklmnopqrstuvwxyz",
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    digits: "0123456789",
    symbols: "!@#$%^&*()-_=+[]{};:,.<>?/~",
  };
  const LOOKALIKES = /[Il1O0o]/g;

  const MIN_LENGTH = 4;
  const MAX_LENGTH = 128;

  // Cryptographically secure random integer in [0, max), without modulo bias.
  function randomInt(max) {
    const limit = Math.floor(0x100000000 / max) * max;
    const buf = new Uint32Array(1);
    do {
      root.crypto.getRandomValues(buf);
    } while (buf[0] >= limit);
    return buf[0] % max;
  }

  function pick(chars) {
    return chars[randomInt(chars.length)];
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = randomInt(i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function generatePassword(options = {}) {
    const {
      length = 16,
      lower = true,
      upper = true,
      digits = true,
      symbols = true,
      avoidLookalikes = false,
    } = options;

    if (!Number.isInteger(length) || length < MIN_LENGTH || length > MAX_LENGTH) {
      throw new RangeError(`Length must be a whole number from ${MIN_LENGTH} to ${MAX_LENGTH}.`);
    }

    const chosen = Object.entries({ lower, upper, digits, symbols })
      .filter(([, on]) => on)
      .map(([name]) => (avoidLookalikes ? SETS[name].replace(LOOKALIKES, "") : SETS[name]));

    if (chosen.length === 0) {
      throw new Error("Pick at least one character type.");
    }

    // Guarantee at least one character from every chosen set, then fill the rest.
    const all = chosen.join("");
    const chars = chosen.map(pick);
    while (chars.length < length) chars.push(pick(all));
    return shuffle(chars).join("");
  }

  // Entropy in bits: length * log2(pool size).
  function estimateStrength(options = {}) {
    const { length = 16, lower = true, upper = true, digits = true, symbols = true, avoidLookalikes = false } = options;
    let pool = 0;
    for (const [name, on] of Object.entries({ lower, upper, digits, symbols })) {
      if (on) pool += (avoidLookalikes ? SETS[name].replace(LOOKALIKES, "") : SETS[name]).length;
    }
    const bits = pool > 0 ? Math.round(length * Math.log2(pool)) : 0;
    const label = bits < 40 ? "Weak" : bits < 60 ? "Fair" : bits < 80 ? "Strong" : "Very strong";
    return { bits, label };
  }

  const api = { generatePassword, estimateStrength, SETS, MIN_LENGTH, MAX_LENGTH };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.PasswordGenerator = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
