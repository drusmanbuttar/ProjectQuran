"""Capture the released reader through the native Android accessibility hierarchy."""
import re
import subprocess
import time
import xml.etree.ElementTree as ET
from pathlib import Path

def adb(*args):
    return subprocess.check_output(['adb',*args])

def tree():
    result=subprocess.run(['adb','exec-out','uiautomator','dump','/dev/tty'],capture_output=True,timeout=35)
    data=result.stdout
    start,end=data.find(b'<?xml'),data.rfind(b'</hierarchy>')
    if start < 0 or end < start:
        return ET.Element('hierarchy')
    return ET.fromstring(data[start:end+len(b'</hierarchy>')])

def find_control(text):
    for _ in range(25):
        for node in tree().iter('node'):
            labels=[node.get(key,'').strip() for key in ('text','content-desc')]
            if text in labels:
                return node
        time.sleep(1)
    raise ValueError('Control not found: '+text)

def tap(node):
    x1,y1,x2,y2=map(int,re.findall(r'-?\d+',node.get('bounds')))
    adb('shell','input','tap',str((x1+x2)//2),str((y1+y2)//2))

def capture(name):
    time.sleep(1)
    Path('store-media',name+'.png').write_bytes(adb('exec-out','screencap','-p'))

Path('store-media').mkdir(exist_ok=True)
find_control('Reading room')
capture('Android-Reading-room')
tap(find_control('Open the Surah'))
find_control('Reading settings')
capture('Android-Reader')
tap(find_control('Study'))
find_control('Connected study')
capture('Android-Connected-study')

