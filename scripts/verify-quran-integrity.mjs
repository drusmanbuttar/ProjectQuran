import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

// These digests come from the independent Quran.com retrieval in Actions run 44381500925.
// The JSON map is in numbered surah:ayah order. No Unicode normalisation is permitted.
const expectedCorpus = 'b49b11a10fd0b24b79d3af2d89aa72a1427c79ccd46e98a86797b233390d5c0b';
const expected238 = 'c5cdadb502c02b9880b503111ce2ff1916434b6f9c550fa7150dc4cd75996972';
const expectedFont = '8c00e7a7d5f773bcfb1642fdcfba505dbd81975fef39f14718827a32d075020c';
const digest = data => createHash('sha256').update(data).digest('hex');
const read = name => readFileSync(new URL('../dist/' + name, import.meta.url));
const arabic = JSON.parse(read('arabic.json'));
const metadata = JSON.parse(read('metadata.json'));
const records = {};
assert.equal(Object.keys(arabic).filter(key => /^\d+$/.test(key)).length, 114);
assert.equal(metadata.chapters.length, 114);
for (const [index, chapter] of metadata.chapters.entries()) {
  const surah = index + 1;
  assert.equal(chapter.id, surah);
  assert.equal(arabic[surah].length, chapter.total_verses);
  for (const [index, entry] of arabic[surah].entries()) {
    const ayah = index + 1;
    const key = surah + ':' + ayah;
    assert.equal(entry.chapter, surah, key);
    assert.equal(entry.verse, ayah, key);
    assert.ok(typeof entry.text === 'string' && entry.text.length, key);
    records[key] = entry.text;
  }
}
assert.equal(Object.keys(records).length, 6236);
assert.equal(records['2:38'].split(' ')[6], 'مِّنِّي', 'Al-Baqarah 2:38 word 7');
assert.equal(digest(records['2:38']), expected238, 'Al-Baqarah 2:38');
assert.equal(digest(JSON.stringify(records)), expectedCorpus, 'Quran.com QPC Hafs word-record digest');
assert.equal(digest(read('fonts/UthmanicHafs1Ver18.woff2')), expectedFont, 'QPC Hafs font');
console.log('PASS: all 6,236 ordered ayat reproduce the Quran.com QPC Hafs word records exactly, including 2:38. The paired Quran Foundation font also matches.');

