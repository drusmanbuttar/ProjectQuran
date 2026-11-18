# Pockett Quran 1.1.0 | Reading experience audit

## Decision

Build the daily reading experience around the ayah, while keeping the project's distinctive strength within reach: following a prophet, event or theme back to its cited passages. Version 1.1.0 uses a paper-coloured reading surface, an original geometric illumination, a separate night palette and the existing locally bundled Amiri Quran font. The home screen offers a single reading action and direct access to the Surah and Juz index.

## Market comparison

Public Google Play install bands are cumulative Android figures from the listings reviewed in November 2026. They do not measure current monthly downloads, iOS installs or global rank. This comparison uses product listings and the Pockett Quran source and release archive. Competitors were not individually installed for a hands-on usability study.

| Product | Play install band | Relevant experience | Decision for Pockett Quran |
| --- | --- | --- | --- |
| Quran for Android, Quran.com | 50M+ | Madani pages, ayah bookmarks, search, night reading, repeatable gapless audio | Ship a quieter ayah view, local search and a night palette. Page-faithful Mushaf and audio are open gaps. |
| Al QURAN, 9D Muslim Apps | 50M+ | Adjustable Arabic size, night mode, page turning and bookmarks | Keep Arabic sizing conspicuous in reading settings, remove the old pinch restriction and preserve bookmarks on upgrade. |
| Al Quran (Tafsir & by Word), Greentech | 10M+ | Automatic last read, separate pins, word study, search and multiple scripts | Distinguish resume, a manual reading pin and saved ayat. Keep study references next to the cited text. |
| Quran Majeed, Pakdata | 10M+ | Offline reading, multiple scripts, downloadable recitation and memorisation tools | Retain offline Arabic, English and Urdu. Licensed recitation with downloads and repeat would close the biggest listening gap. |
| Pockett Quran, Muhammad Usman Buttar | 10+ | Ad-free, offline, bilingual translations, 25 prophetic narratives, 30 themes and four timelines | Make connected study discoverable without adding friction to daily reading. |

Public listings: [Pockett Quran for Android](https://play.google.com/store/apps/details?id=com.drusmanbuttar.projectquran), [Pockett Quran for iOS](https://apps.apple.com/us/app/pockett-quran/id6813873757), [Quran for Android](https://play.google.com/store/apps/details?id=com.quran.labs.androidquran), [9D Al QURAN](https://play.google.com/store/apps/details?id=free.alquran.holyquran), [Greentech](https://play.google.com/store/apps/details?id=com.greentech.quran), [Pakdata](https://play.google.com/store/apps/details?id=com.pakdata.QuranMajeed).

## Audit findings and changes

| Area | Finding in the previous implementation | Revision |
| --- | --- | --- |
| First visit | The welcome banner, empty Continue Reading card and Start Reading cards competed for the first tap. | Open Al-Faatiha in one action on first use. The same card resumes a returning reader. |
| Reading place | Continue Reading depended on manually marking an ayah. | Save the visible ayah after scrolling and restore the Surah or Juz context. Existing manual pins and bookmarks remain available. |
| Navigation | Separate selectors occupied the top of the reader. Research sections had more prominence than finding a passage. | Five destinations for Home, Index, Find, Study and Saved. The index can be filtered by name or number. |
| Find | The Play listing promised word and reference search. The release source explicitly removed search. | Search locally across the bundled Arabic, English and Urdu text. Arabic and Urdu numerals work in verse references. Arabic search ignores vowel marks while the displayed ayah remains verbatim. |
| Reading surface | Every ayah repeated full translator credits, multiple text buttons and several controls. | Give the Arabic room, use compact labelled translation blocks, put source details under Sources & method, and keep settings and jumping accessible. |
| Legibility | Light-only colours, device zoom restrictions, and Arabic size limited to 44 px. | Paper and night palettes, native pinch zoom enabled, 28–52 px Arabic text, RTL language attributes and named controls. |
| Study navigation | An inline detail relied on edge-swipe guidance and transient history state. | Directly addressable study entries and explicit parent links; an ayah reference opens its source surah. |
| Offline updates | A failed cache installation could activate anyway and remove the previous cache. | Activate the revised cache after every required file downloads successfully. Native apps use their packaged assets. |
| Store presentation | Apple’s description runs two sentences together. Its accessibility section has no declared features. | New release copy below. VoiceOver and TalkBack evaluation is needed before declaring their support in either store. |

## Content and verification scope

The locked source is Tanzil Uthmani. The integrity check verifies all 6,236 NFC-normalised SHA-256 values, the exact order of the 114 surahs and ayat, and an explicit regression for Al-Baqarah 2:38. Structural validation checks every English and Urdu record for its chapter, verse number and nonempty text. The 30 juz partitions cover every reference exactly once. All 284 authored passage references in the prophet, topic and timeline catalogues resolve. Arabic, English, Urdu, catalogue, metadata and reference files were preserved.

These checks verify data integrity and linkage. A scholar's review of translation quality, thematic interpretation or the completeness of the research index is a separate, unfinished task. No new Arabic verse text, translations or tafsir were authored for this update.

## Remaining opportunities, in order

1. **Listening.** Secure recording and distribution rights for a named reciter, verify ayah-to-audio alignment, and support repeat and offline downloads. A visible pause control and reliable audio interruptions matter more than the initial number of reciters.
2. **Mushaf reading.** Source and verify a page-faithful Madani edition. Evaluate an Indo-Pak edition with Pakistani Urdu readers. A font change alone would not reproduce page boundaries.
3. **Hands-on accessibility and Urdu localisation.** Test VoiceOver and TalkBack with readers. The ayat and Urdu translations are available, while navigation labels remain English. Review a complete Urdu interface with native speakers.
4. **Study depth.** Commission a documented scholarly review of the editorial links before expanding them. Add licensed word-level meanings or tafsir only after provenance and permissions are settled.
5. **Evidence for a ranking objective.** In the store dashboards, compare store-page conversion, returning readers where available, and crash-free use before and after adoption. Product quality and market rank are separate outcomes.

## Store copy for this candidate

**What’s new**

Resume at the ayah where you stopped. Browse all 114 surahs and 30 juz in the new Quran index, search Arabic, English and Urdu offline, and switch between paper and night reading. Your saved ayat and reading pin carry forward. Explore prophets, themes and timelines through links to their Quranic passages.
