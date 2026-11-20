const openTip = document.getElementById('open-tip');
document.body.insertAdjacentHTML('beforeend', `<dialog id="tip-dialog" aria-labelledby="tip-heading">
    <form method="dialog"><button type="submit" class="outline" aria-label="Close support dialog">Close</button></form>
    <h2 id="tip-heading">Support Pockett Quran</h2>
    <p>Pockett Quran is free to read and listen to. An optional, one-time tip supports research, content review, and development. Every feature is free for everyone.</p>
    <button type="button" class="solid" data-tip-buy disabled>Give a one-time tip</button>
    <p role="status" data-tip-status></p>
  </dialog>`);
const tipDialog = document.getElementById('tip-dialog');
const hasNativeDialog = typeof tipDialog.showModal === 'function';
if (!hasNativeDialog) {
  // Older iOS WebViews can display the same form as an inline disclosure.
  openTip.parentElement.after(tipDialog);
  tipDialog.hidden = true;
  openTip.removeAttribute('aria-haspopup');
  openTip.setAttribute('aria-controls', tipDialog.id);
  openTip.setAttribute('aria-expanded', 'false');
  tipDialog.querySelector('form').addEventListener('submit', event => {
    event.preventDefault();
    tipDialog.hidden = true;
    openTip.setAttribute('aria-expanded', 'false');
    openTip.focus();
  });
}
openTip.addEventListener('click', async () => {
  if (hasNativeDialog) {
    tipDialog.showModal();
  } else {
    tipDialog.hidden = false;
    openTip.setAttribute('aria-expanded', 'true');
    tipDialog.querySelector('form button').focus();
  }
  const button = tipDialog.querySelector('[data-tip-buy]');
  const status = tipDialog.querySelector('[data-tip-status]');
  if (!window.Capacitor?.isPluginAvailable?.('QuranTip')) {
    button.hidden = true;
    status.textContent = 'The tip uses Apple in-app purchases on iOS.';
    return;
  }
  if (button.dataset.busy || button.dataset.loading) return;
  button.dataset.loading = 'true';
  button.disabled = true;
  button.textContent = 'Give a one-time tip';
  status.textContent = 'Checking the App Store price…';
  try {
    const offer = await window.Capacitor.Plugins.QuranTip.price();
    button.textContent = 'Give a one-time tip · ' + offer.price;
    status.textContent = '';
    button.disabled = false;
  } catch (error) {
    status.textContent = error?.code === 'TIP_NOT_AVAILABLE'
      ? 'The App Store has no tip available for this storefront. Close and reopen Support Pockett Quran to try again.'
      : 'Apple pricing is unavailable. Close and reopen Support Pockett Quran to try again.';
    if (error?.code?.startsWith('STOREKIT:')) {
      status.textContent += ' (' + error.code.slice(9) + ')';
    }
  } finally {
    delete button.dataset.loading;
  }
});

tipDialog.addEventListener('click', async event => {
  const button = event.target.closest?.('[data-tip-buy]');
  if (!button || button.disabled || button.dataset.busy) return;
  const status = button.parentElement.querySelector('[data-tip-status]');
  button.dataset.busy = 'true';
  button.disabled = true;
  try {
    const result = await window.Capacitor.Plugins.QuranTip.purchase();
    const messages = {paid:'Thank you for supporting Pockett Quran.', pending:'Your tip is awaiting approval.'};
    status.textContent = messages[result.status] || '';
  } catch {
    status.textContent = 'The tip could not be confirmed. You can continue reading.';
  } finally {
    delete button.dataset.busy;
    button.disabled = false;
  }
});
