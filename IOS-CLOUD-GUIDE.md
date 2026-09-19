# Pocket Quran: iPhone builds without a Mac

Pocket Quran uses GitHub's macOS computers to build the iPhone app. The source includes offline Arabic, English and Urdu reading and import/export of research notes through Apple's Files picker. This iPhone version does not include an advertising SDK. Android's optional test ads are separate.

An unsigned archive is a build check and backup, not an installable iPhone app. Installing through TestFlight requires active paid Apple Developer Program membership, signing credentials, an App Store Connect app record, and a successful upload. Having a free Apple developer login alone is insufficient. The signed workflow still needs validation with your account's credentials.

## Start here if you have not enrolled

Open [Apple Developer Program enrollment](https://developer.apple.com/programs/enroll/) and enroll using your own Apple Account with two-factor authentication. Apple currently lists membership at USD 99 per year, with regional pricing shown during enrollment. For individual enrollment, Apple displays your legal name as the App Store seller; the Google Play display name Spiritual Developer does not automatically become your Apple seller name. After Apple activates membership, continue below. No membership purchase is needed to keep working on the source or run the unsigned GitHub checks.

## 1. Create Apple's app records

In [Apple Developer](https://developer.apple.com/account/), open Certificates, Identifiers & Profiles → Identifiers → + → App IDs → App.

- Description: Pocket Quran
- Explicit Bundle ID: `com.drusmanbuttar.projectquran`
- No additional capabilities are needed for this version.

In [App Store Connect](https://appstoreconnect.apple.com/), open My Apps → + → New App. Select iOS, name Pocket Quran (subject to availability), primary language English, the Bundle ID above, and SKU `pocket-quran-ios`. Complete any agreements Apple presents.

Find your Team ID in Apple Developer → Membership details. It is an identifier, not a password.

## 2. Prepare the distribution certificate on Windows

Use a trusted OpenSSL installation, such as the one included with Git for Windows. Keep these files in a private folder outside the repository and outside shared backups. Run the following from that folder in a terminal with OpenSSL available. OpenSSL asks for passwords interactively; do not put passwords in the commands or send them in chat.

```text
openssl genpkey -algorithm RSA -aes-256-cbc -pkeyopt rsa_keygen_bits:2048 -out PocketQuran-signing.key
openssl req -new -sha256 -key PocketQuran-signing.key -out PocketQuran.csr
```

Enter your own identity details when prompted. Leave the optional challenge password empty. In Apple Developer → Certificates → +, choose Apple Distribution and upload `PocketQuran.csr`. Download the issued certificate into the same private folder as `distribution.cer`.

```text
openssl x509 -inform DER -in distribution.cer -out distribution.pem
openssl pkcs12 -export -inkey PocketQuran-signing.key -in distribution.pem -out PocketQuran-distribution.p12
```

Remember the P12 export password. Keep the encrypted private key and P12 secure; the CSR and certificate cannot recreate the private key. Do not revoke existing certificates used by other apps.

## 3. Create the App Store provisioning profile

In Apple Developer → Profiles → +, select App Store Connect distribution, choose the Pocket Quran App ID and the distribution certificate from step 2, name the profile `Pocket Quran App Store`, and download it. Use an App Store profile, not Development, Ad Hoc or Enterprise. [Apple's profile instructions](https://developer.apple.com/help/account/provisioning-profiles/create-an-app-store-provisioning-profile).

## 4. Add GitHub's protected settings

In the ProjectQuran repository, open Settings → Environments → New environment, and name it `apple-release`. Add the following environment variable:

| Variable | Value |
| --- | --- |
| `APPLE_TEAM_ID` | Your Apple Team ID |

Add these environment secrets:

| Secret | Value |
| --- | --- |
| `BUILD_CERTIFICATE_BASE64` | Base64 of PocketQuran-distribution.p12 |
| `P12_PASSWORD` | Its export password |
| `BUILD_PROVISION_PROFILE_BASE64` | Base64 of the downloaded .mobileprovision file |
| `KEYCHAIN_PASSWORD` | A new strong random password for the temporary build keychain |

To copy a file as Base64 without printing it, use this PowerShell command with the actual absolute path, paste into the relevant GitHub secret, then clear the clipboard:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes('C:\YourPrivateFolder\PocketQuran-distribution.p12')) | Set-Clipboard
```

Repeat with the provisioning file for its secret. Afterwards:

```powershell
Set-Clipboard -Value ''
```

Base64 is encoding, not encryption. Keep it in GitHub Secrets only, never in source files or chat. The workflow imports the identity into a temporary keychain and removes its signing files at completion. [GitHub's signing guidance](https://docs.github.com/en/actions/how-tos/deploy/deploy-to-third-party-platforms/sign-xcode-applications).

## 5. Configure upload access

In App Store Connect → Users and Access → Integrations → App Store Connect API, request access if necessary, then create a **team API key** with Developer access. Download its `.p8` once and store it securely. This workflow expects a team key, not an individual key. Record its Key ID and Issuer ID. [Apple's API key guide](https://developer.apple.com/help/app-store-connect/get-started/app-store-connect-api).

Add three more secrets to the `apple-release` environment:

| Secret | Value |
| --- | --- |
| `APP_STORE_CONNECT_KEY_BASE64` | Base64 of the downloaded .p8 file |
| `APP_STORE_CONNECT_KEY_ID` | Key ID |
| `APP_STORE_CONNECT_ISSUER_ID` | Issuer ID |

The P8 is a private key; do not upload it as a repository file or share it in chat.

## 6. Run the cloud build

The unsigned testing workflow runs when changes are pushed to `ios-pocket-quran`. It checks content, runs iPhone simulator tests and produces an unsigned device archive. Its backup tests exercise real plugin file I/O with simulated Files-picker selection callbacks; they do not replace a final manual Files/iCloud test on your iPhone.

The manual signing workflow is `.github/workflows/ios-testflight.yml`. GitHub's Run workflow button requires this workflow to exist on the default branch. Review and merge the Android and iPhone pull requests in dependency order before using that button. Never merge signing files or secrets.

Once available, open Actions → Pocket Quran signed iPhone build → Run workflow. Select the reviewed branch. Leave **Upload the signed build to App Store Connect** unchecked for the first signing check. Download the `Pocket-Quran-Signed-iOS` artifact if it succeeds. This App Store IPA is intended for Apple distribution; tapping it on an iPhone will not install it.

Run again with the upload option checked when you are ready to send the build to Apple. Each run has a new build number. Wait for processing in App Store Connect → Pocket Quran → TestFlight. This uploads a beta build; it does not submit the app for public App Store release. [Apple's upload guide](https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds).

## 7. Install and verify on your iPhone

1. Install Apple's TestFlight app from the App Store.
2. In App Store Connect → TestFlight, create an internal testing group and add your eligible App Store Connect user and the processed build. Complete any required export-compliance questions accurately.
3. Open the invitation on your iPhone, accept it in TestFlight, and install Pocket Quran. External testers may require beta review.
4. Turn on airplane mode, open the Quran reader and check Arabic, English and Urdu in several surahs.
5. Create a sample note and save a verse. Export the research backup to Files, and keep a second copy in a separate location.
6. Test restoring that backup on another test installation. Confirm the note, Urdu text, verse references and saved verse survive. Do not uninstall your only copy of real research notes to test recovery.

Source backups contain the app and Quran data. Your personal notes exist on your device and must be exported separately. Import validates a whole backup before merging and skips duplicate notes. Backups are plain JSON; anyone who can access the file can read them.

## Before public App Store release

Complete screenshots, description, support and privacy URLs, content-rights declarations, App Privacy, age-rating questionnaire, review contact details and a physical-device check. The intended adult audience does not replace Apple's questionnaire. Verify translation/content permissions and proposed research categories before claiming scholarly completeness. iPhone ads remain absent in this version; adding ads later requires a new privacy and consent review.

Support contact: gsolconnect@gmail.com. The app name is Pocket Quran; the GitHub repository remains ProjectQuran.
