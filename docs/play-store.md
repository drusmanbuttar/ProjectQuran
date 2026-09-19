# Pocket Quran — Play Console preparation

Developer: Spiritual Developer  
Public support email: gsolconnect@gmail.com  
Account: Personal  
Intended audience: Adults 18+  
Android identity: com.drusmanbuttar.projectquran (kept for research compatibility)  
Display name: Pocket Quran  
Pricing assumption: Free to download, supported by advertising; confirm before publishing.

## Create the app
In Play Console choose Create app. Enter Pocket Quran, default language English, application type App, and Free if the pricing assumption above is correct. Read and accept the declarations yourself. Creating the record does not publish it. Use Books & Reference as the proposed category. Complete the target-audience questionnaire truthfully; the intended audience is 18+ and the content rating is determined separately by Google's questionnaire.

## Store listing draft
Short description:
Read Quran offline in Arabic, English and Urdu, with themes and research notes.

Full description:
Pocket Quran brings Quran reading and personal research together in one place.

Read the complete Arabic Quran with English and Urdu translations, available offline in the Android app. Browse 114 surahs and 30 juz, search the text, save verses, and keep your own source-linked research notes.

Explore selected passages through 25 prophet entries, 30 proposed research categories and four conceptual study paths: creation, prophetic narratives, revelation and community, and the Hereafter. These indexes are editorial starting points, not an exhaustive classification or scholarly certification. Dates are left unknown where the sources do not establish them.

Export your research to a JSON backup and import it on another device. Notes remain local and do not automatically synchronize. Keep copies outside the app before uninstalling.

Arabic text: Tanzil. English translation: Marmaduke Pickthall. Urdu translation and notes: Muhammad Junagarhi, QuranEnc.com edition v1.1.3. Translations express interpretations of meaning. Source credits and notices are available inside the app.

Designed for adult readers and researchers. External source links and advertising require internet; bundled Quran reading works offline.

## Current build, not a production release
- Debug APK: renamed app, optional Google demo banners; not suitable for Play upload.
- Unsigned release AAB: build preparation only, no upload signature; demo banners are disabled by the native release guard. Do not upload this file as a completed Play release.
- Google sample IDs are hardcoded. There is no production-ad path and no remote ad configuration.
- Test banners only start after an explicit button press on timeline, prophet or category screens. Navigation or opening verses removes the banner. Notes and Quran content are never passed as ad-targeting inputs.
- Ad requests use maximum content rating G and non-personalized requests. This is not a guarantee of religious suitability.
- The packaged privacy notice describes this demo. It must be updated and hosted at a public URL for the final release.

## Before production advertising
1. Register Pocket Quran in AdMob as an unpublished Android app. Create a banner unit. Share the App ID and banner unit ID, not passwords. Link the Play listing after publication.
2. In Blocking controls, apply restrictions at the app level: block alcohol, gambling/betting, sexual content, dating, tobacco/drugs, and other categories inconsistent with your standards. Review religion/politics and financial-services categories with particular care. Google category labels and availability vary; verify the actual dashboard settings.
3. Set the app's maximum ad content rating to G. Keep third-party mediation disabled unless separately assessed. Use the Ad Review Center regularly and block unsuitable creatives/advertisers. Category filters are best-effort, not guaranteed.
4. Configure Privacy & messaging and integrate/test Google's UMP consent flow, including refusal, withdrawal and offline behavior. Non-personalized advertising is not a substitute for consent where required.
5. Review the QuranEnc distribution condition against inappropriate advertising. Resolve any unsuitable creative promptly; suspend advertising if needed. Review current translation versions and source terms before release.
6. Complete Play Data safety using the final SDK and actual behavior. Do not select “no data collected” simply because research notes stay local. Declare Contains ads for the advertising release.
7. Publish the finalized privacy policy with an in-app link. Confirm the public support email, store graphics, screenshots and source notices.

## Signing and testing
Create and securely retain a permanent upload key, outside Git. Use Play App Signing. The bundle must be signed with the upload key; never put key passwords in source code or chat. Signing setup remains outstanding.

Export notes before replacing the old debug APK: different runner-generated debug keys can prevent installation over an earlier test build.

New personal accounts generally require a closed test with at least 12 testers continuously opted in for 14 days before applying for production access. Direct APK installation and automated emulator tests do not meet that requirement. Use the requirements displayed for your account.

## Sources checked 19 September 2026
- https://support.google.com/googleplay/android-developer/answer/9859152
- https://support.google.com/googleplay/android-developer/answer/14151465
- https://support.google.com/admob/answer/9989980
- https://support.google.com/admob/answer/3150953
- https://developers.google.com/admob/android/privacy/play-data-disclosure
- https://developers.google.com/admob/android/privacy
- https://quranenc.com/en/home/api
