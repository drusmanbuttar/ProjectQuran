import fs from 'node:fs';
import crypto from 'node:crypto';

const arabic = JSON.parse(fs.readFileSync(new URL('../dist/arabic.json', import.meta.url), 'utf8'));
const reference = JSON.parse(fs.readFileSync(new URL('./quran-uthmani-reference.json', import.meta.url), 'utf8'));

const EXPECTED_SURAHS = 114;
const EXPECTED_VERSES = 6236;
const failures = [];
const numericKeys = Object.keys(arabic).filter(k => /^\d+$/.test(k)).sort((a,b) => Number(a) - Number(b));
const expectedKeys = Object.keys(reference.verses);

function fail(message) {
  failures.push(message);
}

if (reference.meta?.source !== 'tanzil-uthmani') fail('Reference source is not tanzil-uthmani.');
if (reference.meta?.normalization !== 'NFC') fail('Reference normalization is not NFC.');
if (reference.meta?.hash_algorithm !== 'sha256') fail('Reference hash algorithm is not SHA-256.');
if (expectedKeys.length !== EXPECTED_VERSES) fail(`Reference contains ${expectedKeys.length} verses; expected ${EXPECTED_VERSES}.`);
if (numericKeys.length !== EXPECTED_SURAHS) fail(`Arabic corpus contains ${numericKeys.length} surahs; expected ${EXPECTED_SURAHS}.`);
if (!String(arabic._license || '').includes('Tanzil')) fail('Arabic corpus does not contain the expected Tanzil licence marker.');

let total = 0;
let matched = 0;
const seen = new Set();

for (let s = 1; s <= EXPECTED_SURAHS; s++) {
  const verses = arabic[String(s)];
  if (!Array.isArray(verses)) {
    fail(`Missing Surah ${s}.`);
    continue;
  }

  const expectedForSurah = expectedKeys.filter(k => k.startsWith(`${s}:`)).length;
  if (verses.length !== expectedForSurah) {
    fail(`Surah ${s} has ${verses.length} verses; reference expects ${expectedForSurah}.`);
  }

  for (let i = 0; i < verses.length; i++) {
    const expectedVerseNumber = i + 1;
    const entry = verses[i];
    const key = `${s}:${expectedVerseNumber}`;
    total++;

    if (seen.has(key)) fail(`Duplicate verse reference ${key}.`);
    seen.add(key);

    if (entry.chapter !== s) fail(`${key}: chapter field is ${entry.chapter}; expected ${s}.`);
    if (entry.verse !== expectedVerseNumber) fail(`${key}: verse field is ${entry.verse}; expected ${expectedVerseNumber}.`);
    if (typeof entry.text !== 'string' || !entry.text.length) {
      fail(`${key}: Arabic text is empty or not a string.`);
      continue;
    }

    const expectedHash = reference.verses[key];
    if (!expectedHash) {
      fail(`${key}: no trusted reference hash exists.`);
      continue;
    }

    const normalized = entry.text.normalize('NFC');
    const actualHash = crypto.createHash('sha256').update(normalized, 'utf8').digest('hex');

    if (actualHash !== expectedHash) {
      fail(`${key}: SHA-256 mismatch (expected ${expectedHash}, got ${actualHash}).`);
    } else {
      matched++;
    }
  }
}

for (const key of expectedKeys) {
  if (!seen.has(key)) fail(`Reference verse ${key} is missing from dist/arabic.json.`);
}

if (total !== EXPECTED_VERSES) {
  fail(`Corpus contains ${total} verse records; expected ${EXPECTED_VERSES}.`);
}

const baqarah238 = arabic['2']?.[37]?.text;
if (baqarah238) {
  const hash238 = crypto.createHash('sha256').update(baqarah238.normalize('NFC'), 'utf8').digest('hex');
  if (hash238 !== reference.verses['2:38']) fail('Al-Baqarah 2:38 failed its dedicated integrity check.');
}

if (failures.length) {
  console.error('FAIL: Quran corpus integrity check failed.');
  for (const message of failures.slice(0, 100)) console.error(' - ' + message);
  if (failures.length > 100) console.error(` - ...and ${failures.length - 100} more failures.`);
  process.exit(1);
}

console.log(`PASS: ${matched}/${EXPECTED_VERSES} ayat match the locked Tanzil-Uthmani SHA-256 reference after NFC normalization.`);
console.log('PASS: 114 surahs, exact verse ordering, no missing/extra verse references, and Al-Baqarah 2:38 verified.');
