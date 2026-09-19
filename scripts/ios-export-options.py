"""Validate the supplied App Store profile and write Xcode export options."""
import datetime
import os
import pathlib
import plistlib

root = pathlib.Path(os.environ['RUNNER_TEMP'])
profile = plistlib.loads((root / 'profile.plist').read_bytes())
team = os.environ['APPLE_TEAM_ID']
bundle = 'com.drusmanbuttar.projectquran'
entitlements = profile.get('Entitlements', {})
assert team in profile.get('TeamIdentifier', []), 'Profile belongs to a different Apple team'
assert entitlements.get('application-identifier', '').endswith('.' + bundle), 'Profile is for a different app'
assert not profile.get('ProvisionedDevices'), 'Use an App Store distribution profile, not development or Ad Hoc'
assert not profile.get('ProvisionsAllDevices'), 'Enterprise profiles cannot be uploaded to App Store Connect'
assert not entitlements.get('get-task-allow', False), 'Use a distribution profile'
assert profile['ExpirationDate'] > datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None), 'Profile has expired'
uuid = profile['UUID']
assert isinstance(uuid, str) and all(c in '0123456789abcdefABCDEF-' for c in uuid), 'Invalid profile UUID'
(root / 'ExportOptions.plist').write_bytes(plistlib.dumps({
    'method': 'app-store-connect', 'destination': 'export',
    'teamID': team, 'signingStyle': 'manual', 'signingCertificate': 'Apple Distribution',
    'provisioningProfiles': {bundle: uuid}, 'manageAppVersionAndBuildNumber': False,
    'uploadSymbols': True,
}))
with open(os.environ['GITHUB_ENV'], 'a', encoding='utf-8') as output:
    output.write('PROFILE_UUID=' + uuid + '\n')
