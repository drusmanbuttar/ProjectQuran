# Research backup format v1

```json
{
  "format": "ProjectQuran",
  "version": 1,
  "notes": [{
    "id": "example-id",
    "title": "My research finding",
    "body": "Write the researcher's commentary, not a substitute Quran text.",
    "refs": ["2:30-39"],
    "chapter": "Chapter 1",
    "topic": "creation",
    "track": "origins",
    "evidence": "Research note",
    "source": "Book, author, edition and page, or source URL"
  }],
  "saved": ["2:30"]
}
```

Imports create new local IDs and deduplicate matching title/body/reference combinations. Unknown topics or paths are cleared. Invalid verse ranges reject the import. Limits: 10 MB per backup, 10,000 notes, 200-character titles and 20,000-character bodies. The chapter field is a personal research chapter, independent of juz or surah.

Valid theme IDs and path IDs are in `dist/catalog.js`. Source citations are plain text. No HTML is interpreted. User research stays labelled draft. No imported note is automatically promoted to Quran text or authoritative scholarship.
