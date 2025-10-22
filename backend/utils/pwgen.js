// utils/pwgen.js (CommonJS)
const crypto = require("crypto");

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.<>?/";
const SIMILAR = "ilLI|`oO0";

function randInt(max) {
  return crypto.randomInt(0, max);
}

function stripSimilar(s) {
  return [...s].filter((ch) => !SIMILAR.includes(ch)).join("");
}

function buildPool({ useLower, useUpper, useDigits, useSymbols, avoidSimilar }) {
  let pool = "";
  if (useLower) pool += LOWER;
  if (useUpper) pool += UPPER;
  if (useDigits) pool += DIGITS;
  if (useSymbols) pool += SYMBOLS;
  if (avoidSimilar) pool = stripSimilar(pool);
  if (!pool) throw new Error("Character set is empty. Enable at least one category.");
  return pool;
}

/**
 
 * @param {Object} options
 * @param {number} [options.length=16]
 * @param {boolean} [options.useLower=true]
 * @param {boolean} [options.useUpper=true]
 * @param {boolean} [options.useDigits=true]
 * @param {boolean} [options.useSymbols=true]
 * @param {boolean} [options.avoidSimilar=false]  
 * @returns {string}
 */
function generatePassword({
  length = 16,
  useLower = true,
  useUpper = true,
  useDigits = true,
  useSymbols = true,
  avoidSimilar = false,
} = {}) {
  if (!Number.isInteger(length) || length < 1 || length > 512) {
    throw new Error("Invalid length (1–512).");
  }

  const pool = buildPool({ useLower, useUpper, useDigits, useSymbols, avoidSimilar });

  const pools = [];
  if (useLower) pools.push(avoidSimilar ? stripSimilar(LOWER) : LOWER);
  if (useUpper) pools.push(avoidSimilar ? stripSimilar(UPPER) : UPPER);
  if (useDigits) pools.push(avoidSimilar ? stripSimilar(DIGITS) : DIGITS);
  if (useSymbols) pools.push(avoidSimilar ? stripSimilar(SYMBOLS) : SYMBOLS);

  if (pools.length > length) {
    throw new Error("Length too small to include one of each selected category.");
  }

  const chars = [];

  for (const p of pools) {
    if (!p.length) continue;
    chars.push(p[randInt(p.length)]);
  }

  for (let i = chars.length; i < length; i++) {
    chars.push(pool[randInt(pool.length)]);
  }

  for (let i = chars.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}

module.exports = { generatePassword };
