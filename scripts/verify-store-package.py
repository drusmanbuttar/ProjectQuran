"""Confirm that the signed store binary includes the exact validated reading edition."""
import os
import plistlib
import sys
from pathlib import Path
from zipfile import ZipFile

package = Path(sys.argv[1])
dist = Path(__file__).resolve().parents[1] / 'dist'
with ZipFile(package) as archive:
    if package.suffix == '.ipa':
        plists = [name for name in archive.namelist() if name.count('/') == 2 and name.endswith('.app/Info.plist')]
        assert len(plists) == 1, 'Expected one iOS application'
        info = plistlib.loads(archive.read(plists[0]))
        assert info['CFBundleIdentifier'] == 'com.drusmanbuttar.projectquran'
        sdk = info['DTSDKName']
        assert sdk.startswith('iphoneos') and int(sdk[8:].split('.')[0]) >= 27, sdk
        print(f"Verified signed iOS SDK: {sdk}, build {info['CFBundleVersion']}")
        prefix = plists[0].rsplit('/', 1)[0] + '/public/'
        if os.getenv('GITHUB_OUTPUT'):
            with open(os.environ['GITHUB_OUTPUT'], 'a') as out:
                print('version=' + info['CFBundleShortVersionString'], file=out)
                print('build=' + info['CFBundleVersion'], file=out)
    elif package.suffix == '.aab':
        prefix = 'base/assets/public/'
    else:
        raise ValueError('Expected an exported IPA or Android App Bundle')
    for path in sorted(dist.rglob('*')):
        if path.is_file():
            relative = path.relative_to(dist).as_posix()
            assert archive.read(prefix + relative) == path.read_bytes(), relative
print(f'PASS: {package.name} contains the exact verified scripture, translations, fonts and reader assets.')

