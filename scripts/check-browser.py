"""Exercise the production web assets in Chromium, including the offline restart."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from tempfile import TemporaryDirectory
import shutil

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select

root = Path(__file__).resolve().parents[1]
class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass

server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(root / 'dist')))
Thread(target=server.serve_forever, daemon=True).start()
url = f'http://127.0.0.1:{server.server_port}/'
options = webdriver.ChromeOptions()
options.add_argument('--headless=new')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')
with TemporaryDirectory() as profile:
    options.add_argument('--user-data-dir=' + profile)
    driver = webdriver.Chrome(service=Service(shutil.which('chromedriver')), options=options)
    wait = WebDriverWait(driver, 20)
    def el(css):
        return driver.find_element(By.CSS_SELECTOR, css)
    def at(hash_value, selector):
        driver.get(url + hash_value)
        wait.until(lambda d: d.find_elements(By.CSS_SELECTOR, selector))
    def fit():
        assert driver.execute_script('return document.documentElement.scrollWidth <= innerWidth + 1')
    try:
        driver.get(url)
        wait.until(lambda _: el('h1').text == 'Reading room')
        driver.execute_script("localStorage.setItem('pq-last-read', JSON.stringify('2:38'));localStorage.setItem('pq-saved','[\"1:1\"]')")
        driver.refresh()
        wait.until(lambda _: 'Resume' in el('.gold-button').text)
        assert '2:38' in el('.gold-button').get_attribute('href')
        for width,height in [(320,700),(390,844),(768,1024),(1280,800)]:
            driver.execute_cdp_cmd('Emulation.setDeviceMetricsOverride',dict(width=width,height=height,deviceScaleFactor=1,mobile=False))
            fit()
            assert el('nav.mobile-nav').is_displayed() == (width<=760)
            el('button[data-theme]').click()
            assert el('main h1').text == 'Reading room'
        at('#index','#filter')
        el('#filter').send_keys('البقرة')
        assert len(driver.find_elements(By.CSS_SELECTOR,'#directory-list a'))==1
        el('[data-directory="juz"]').click()
        assert len(driver.find_elements(By.CSS_SELECTOR,'#directory-list a'))==30
        at('#find','#find-query')
        el('#find-query').send_keys('٢:٣٨')
        wait.until(lambda _: '2:38' in el('.match').text)
        el('.match').click()
        wait.until(lambda _: driver.find_elements(By.CSS_SELECTOR, '[data-ref="2:38"].arrived'))
        assert len(driver.find_elements(By.CSS_SELECTOR,'.verse'))==286
        el('[data-save="2:38"]').click()
        assert el('[data-save="2:38"]').get_attribute('aria-pressed')=='true'
        el('#reader-settings summary').click()
        Select(el('#language')).select_by_value('ar')
        assert not driver.find_elements(By.CSS_SELECTOR,'.verse .translation')
        el('[data-size="2"]').click()
        assert '36' in el('.zoom output').text
        el('#reader-settings summary').click()
        at('#saved','[data-save="2:38"]')
        assert len(driver.find_elements(By.CSS_SELECTOR,'.verse')) == 2
        el('[data-save="2:38"]').click()
        assert len(driver.find_elements(By.CSS_SELECTOR,'.verse')) == 1
        at('#prophets?item=musa','[data-ref="20:9"]')
        assert driver.find_elements(By.CSS_SELECTOR,'.back')
        at('#reader?juz=30','[data-ref="114:6"]')
        for width,height in [(320,700),(768,1024)]:
            driver.execute_cdp_cmd('Emulation.setDeviceMetricsOverride',dict(width=width,height=height,deviceScaleFactor=1,mobile=False))
            fit()
        wait.until(lambda _: driver.execute_script('return !!navigator.serviceWorker.controller'))
        driver.execute_cdp_cmd('Network.enable',{})
        driver.execute_cdp_cmd('Network.emulateNetworkConditions',dict(offline=True,latency=0,downloadThroughput=0,uploadThroughput=0))
        driver.refresh()
        wait.until(lambda _: driver.find_elements(By.CSS_SELECTOR,'[data-ref="114:6"]'))
        assert el('.arabic').text.strip()
        print('PASS: rendered 320/390/768/1280px layouts, mode switch, migrated reading pin and bookmarks, Arabic reference, reader settings, study routes and offline restart.')
    finally:
        driver.quit()
        server.shutdown()
