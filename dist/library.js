export function fold(value) {
  return String(value).normalize('NFKD').toLowerCase()
    .replace(/[\u064b-\u065f\u0670\u06d6-\u06ed\u0300-\u036f\u0640]/gu, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/[٠-٩]/g, n => String(n.charCodeAt(0)-0x660))
    .replace(/[۰-۹]/g, n => String(n.charCodeAt(0)-0x6f0))
    .replace(/[’'‘-]/g, '').trim();
}

export function parseRef(value, arabic) {
  const match = /^(\d{1,3})\s*:\s*(\d{1,3})$/.exec(fold(value));
  if (!match) return '';
  const surah = Number(match[1]), ayah = Number(match[2]);
  return arabic[surah]?.[ayah - 1] ? surah + ':' + ayah : '';
}

export function expandReferences(ranges, arabic) {
  const result = new Set();
  for (const range of ranges) {
    const match = /^(\d+):(\d+)(?:-(\d+))?$/.exec(range);
    if (!match) throw new Error('Invalid passage ' + range);
    const [, surah, start, end = start] = match;
    if (Number(start) > Number(end) || !parseRef(surah+':'+start, arabic) || !parseRef(surah+':'+end, arabic)) throw new Error('Invalid passage ' + range);
    for (let verse = Number(start); verse <= Number(end); verse++) result.add(surah + ':' + verse);
  }
  return [...result];
}

export function makeIndex(db, meta) {
  const verses = [], byRef = new Map(), byJuz = [], bySurah = [];
  const starts = new Set(meta.indexes.juzs.map(j => j.sura + ':' + j.aya));
  let juz = 0;
  for (const chapter of meta.chapters) {
    const s = chapter.id;
    bySurah[s] = [];
    for (const entry of db.ar[s]) {
      const v = entry.verse, ref = s + ':' + v;
      if (starts.has(ref)) byJuz[++juz] = [];
      const row = {ref, s, v, juz, audioNumber: verses.length + 1, ar:entry.text, en:db.en[s][v-1].text, ur:db.ur[s][v-1].text};
      verses.push(row); byRef.set(ref, row); byJuz[juz].push(row); bySurah[s].push(row);
    }
  }
  return {verses, byRef, byJuz, bySurah};
}

export function findPassages(query, db, index, meta) {
  const q = fold(query);
  if (!q) return {chapters:[], verses:[]};
  const direct = parseRef(q, db.ar);
  if (q.includes(':')) return {chapters:[], verses:direct ? [index.byRef.get(direct)] : []};
  const chapters = meta.chapters.filter(c => String(c.id) === q ||
    [c.name, c.translation, c.transliteration].some(name => fold(name).includes(q)));
  if (q.length < 2 || /^\d+$/.test(q)) return {chapters, verses:[]};
  const verses = index.verses.filter(row => {
    row.searchText ??= [row.ar, row.en, row.ur].map(fold).join('\n');
    return row.searchText.includes(q);
  });
  return {chapters, verses};
}
