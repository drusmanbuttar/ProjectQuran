# ProjectQuran Android test build

The Android app uses Capacitor 8 and bundles `dist/`, including Arabic, English, Urdu, translator notes, metadata, source notices, categories and timelines. It does not load the private website or require ChatGPT sign-in. The Quran is available on first launch without a download. External source links still need internet.

## Build

Use Node 22+, pnpm 11.19.0, Java 21, and an Android SDK with API 36. From the repository root:

```sh
pnpm install --frozen-lockfile
pnpm exec cap sync android
cd android
./gradlew assembleDebug testDebugUnitTest
```

On Windows, use `gradlew.bat`. The APK is `android/app/build/outputs/apk/debug/app-debug.apk`. GitHub Actions on the `android-offline` branch builds the APK and runs Android emulator tests. Its artifact is named `ProjectQuran-Android-APK`.

## Install and preserve research

Transfer the APK to your Android phone and open it. Android may ask you to allow installation from the app opening the file. This is a test build, not a Play Store release. The minimum Android version is 7.0 (API 24).

Before moving from the website, choose Research notebook → Export backup there. In Android, choose Research notebook → Import backup and select that JSON. App and browser storage are separate. Notes do not synchronize automatically.

Export backup opens Android's system Create Document picker; choose a location and save. Import uses the Open Document picker. Neither needs broad storage permission. A backup must be valid ProjectQuran v1 JSON and no larger than 10 MB. Notes and saved verses are restored as one local-storage record. Invalid references reject the import; equivalent research entries are deduplicated without dropping entries that have different source/category metadata.

Keep exported copies outside the app. Uninstalling or clearing app data removes its local research. Automatic Android OS backup is disabled; explicit JSON export is the portable backup mechanism. A debug signing key generated on a build runner is for testing only; different runs may produce different signatures and may require uninstalling the previous test app. Export before uninstalling. A stable privately held signing key is required before distributing upgradeable releases.

## Tests and limits

- Existing data validation checks 6,236 aligned verses, all juz boundaries, catalog ranges and offline assets.
- Java unit tests check UTF-8 round-trip and size limits in the native file IO.
- Android instrumentation runs with emulator Wi-Fi and mobile data disabled, checks Arabic/English/Urdu reading, imports and exports through the real Capacitor Java plugin using stubbed system-picker results, checks deduplication, Activity recreation and rejection of invalid data.
- The picker intent results are supplied by Espresso tests; this does not replace manually trying the visible Documents picker on a physical phone or testing every Android version.

Do not claim a test passed until its GitHub Actions report confirms success. Store publication, production signing, cloud sync and native iOS packaging are outside this test build.
