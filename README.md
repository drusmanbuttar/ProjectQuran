# ProjectQuran

A Quran research platform initiated by **Muhammad Usman Buttar in 2015**.

The first working edition connects Quranic passages to study timelines, prophetic narratives, themes, and a personal research notebook. The complete Quran is readable in Arabic with English and Urdu translations.

## Run

No build step or third-party client libraries are required. Serve `dist/` with an HTTP server, for example `python3 -m http.server 8000 --directory dist`, and open the server in a browser. PWA installation and service workers require HTTPS in production (localhost is a development exception). Do not open `index.html` with a `file:` URL.

## Included

- Four distinct study paths: creation, prophetic narratives, revelation/community, and the Hereafter.
- Selected passages for 25 commonly listed Quranic prophets and 30 proposed thematic research categories. These are editorial starter indexes, not exhaustive verse classifications.
- Full Arabic text, Pickthall English translation, and Junagarhi Urdu translation with translator notes.
- 114 surahs, 30 juz, traditional Meccan/Medinan classification, and full-text/reference search.
- Saved verses and research drafts, with source citations, evidence type, theme, timeline path and one of 30 proposed thematic research categories, separately from the 30 juz.
- Non-destructive JSON backup import and export. All notes/bookmarks are device-local; there is no server sync.
- Responsive installable web app with offline text caching. This is not a native app-store release.

## Evidence and chronology

Arabic and translation strings are preserved from the attributed sources. Timelines are conceptual reading paths, not invented calendar dates. Quran, related hadith reports, historical sources, and editorial interpretation must remain distinct. Revelation subject and revelation occasion/date are not interchangeable. Meccan/Medinan metadata is surah-level, not an exact verse chronology.

No original research from the founder has yet been imported. A qualified reviewer should review topic links and chronology before wider scholarly publication. Further Islamic-history coverage and comprehensive categorization remain research tasks.

## Data provenance and licenses

See `dist/sources.json`, `dist/TANZIL-LICENSE.txt`, and `dist/DATA-LICENSE.txt`. Arabic: Tanzil Uthmani v1.1, CC BY 3.0 with verbatim-only requirements. English: Marmaduke Pickthall (1930). Urdu: Muhammad Junagarhi, QuranEnc.com v1.1.3, with translator notes preserved. Data is redistributed from the licensed-source files of risan/quran-json, not its deprecated legacy `dist/` corpus. Keep source attribution and edition information and check upstream for corrections.

## Research import

A JSON backup has `format: "ProjectQuran"`, `version: 1`, a `notes` array, and a `saved` array of verse references. See `docs/research-format.md`. Imports validate references and preserve existing notes. Keep regular exported backups outside the browser.

## Validation

Run `npm run check` and `node scripts/check-catalog.mjs`. No dependency installation is needed. Tests cover corpus alignment, all juz boundaries, references, and offline asset completeness. Automated checks do not substitute for a scholarly review.

## Publishing

`dist/` can be hosted by any static HTTPS host. The included GitHub Actions workflow publishes it through GitHub Pages when Pages is configured to use GitHub Actions. Private repositories may require an eligible GitHub plan. Do not make the repository public as a workaround without the owner's instruction. The private Sites preview is a separate deployment of the same files.

## Category structure

The founder clarified that the 30 research chapters are Quranic topics, not juz. The new 30-category structure is an editorial proposal, not recovered original titles. Existing chapter labels and topic IDs remain compatible with version 1 backups. English and Urdu can now appear together alongside Arabic. See `docs/categories.md` for the complete proposed index.

## Next research phase

1. Import the original 2015–present research, preserving the research chapter structure.
2. Review each verse-category link against tafsir; record alternative views with attribution.
3. Expand hadith records with collection, number, edition, grading, and grading authority.
4. Add historically dated events only with explicit source citations and uncertainty.
5. Add authenticated cloud synchronization and collaborative review if requested.
6. Package for native Android/iOS stores after the data, privacy, and release requirements are agreed.
