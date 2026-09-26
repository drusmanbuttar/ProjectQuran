# Pockett Quran — Google Play submission

## Build identity

- App name: **Pockett Quran**
- Package name: `com.drusmanbuttar.projectquran`
- Version name: `1.0`
- Version code: `200010`
- Android App Bundle: `android/app/build/outputs/bundle/release/app-release.aab`
- Target SDK: Android 16 / API 36
- Minimum SDK: Android 7 / API 24

The package name cannot be changed after the first Play release. Increase `versionCode` in `android/app/build.gradle` for every later upload.

## Advertising and privacy declarations

This release is intentionally ad-free. It contains:

- no advertising space or placeholder;
- no advertising SDK or mediation SDK;
- no `com.google.android.gms.permission.AD_ID` permission;
- no analytics or tracking SDK; and
- no account system or server-side user profile.

In Play Console, answer **No** when asked whether the app contains ads. In Data safety, use the app's actual behavior: the app does not collect or share user data. Saved verses and preferences remain on the device. Android cloud backup is disabled. External links open only after a user selects them.

Privacy policy URL: `https://drusmanbuttar.github.io/ProjectQuran/privacy.html`

## One-time upload-key setup

Create and securely retain an upload key. Run this on your own trusted computer, replacing the example location if needed:

```sh
keytool -genkeypair -v -keystore pockett-quran-upload.jks -alias pockett-quran-upload -keyalg RSA -keysize 2048 -validity 10000
```

Do not commit the `.jks` file or send its passwords in chat. Back it up in two secure locations.

Encode the keystore as a single-line Base64 value:

```sh
base64 < pockett-quran-upload.jks | tr -d '\n'
```

Add these GitHub repository Actions secrets:

- `ANDROID_KEYSTORE_BASE64` — the Base64 value
- `ANDROID_STORE_PASSWORD` — keystore password
- `ANDROID_KEY_ALIAS` — `pockett-quran-upload`
- `ANDROID_KEY_PASSWORD` — key password

Then run **Actions → Android Play bundle → Run workflow**. Download the `pockett-quran-play-bundle` artifact and upload its `.aab` file to Play Console.

## Play Console checklist

1. Create the app as **Pockett Quran**, default language English, type App, and choose Free.
2. Accept the declarations and enable Play App Signing when prompted.
3. Complete App access: all functionality is available without login.
4. Complete Ads: **No, my app does not contain ads**.
5. Complete Data safety based on the declarations above and publish the privacy-policy URL.
6. Complete Content rating honestly. The app is a Quran reference/education app and has no social or user-generated content.
7. Set the target audience appropriate for a general reference app; do not select children unless you specifically intend to join the Families program and meet its additional rules.
8. Add the store listing, phone/tablet screenshots, 512 × 512 icon, and 1024 × 500 feature graphic.
9. Upload the signed `.aab` first to **Internal testing**, add testers, and install from the Play opt-in link.
10. Verify launch, Arabic/Urdu rendering, search, saved verses, navigation, privacy/support links, and behavior with airplane mode.
11. Promote the tested release to Production and submit it for review.

Suggested category: **Books & Reference**.
