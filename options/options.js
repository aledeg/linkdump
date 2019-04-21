async function saveOption(name, value) {
    const obj = await browser.storage.local.get('options');
    const options = obj.options || {};
    options[name] = value;
    await browser.storage.local.set({ options });
}

document.querySelectorAll('input').forEach(item => {
  item.addEventListener('change', ({target}) => {
    saveOption(target.name, target.checked);
  });
});

document.querySelector('[for="clearAfterCopy"]').textContent = browser.i18n.getMessage(`optionsClearAfterCopy`);
document.querySelector('[for="clearAfterDownload"]').textContent = browser.i18n.getMessage(`optionsClearAfterDownload`);

browser.storage.local.get('options').then(obj => {
  if (obj.options !== undefined && obj.options.clearAfterDownload) {
    document.querySelector('[name="clearAfterDownload"]').checked = obj.options.clearAfterDownload;
  }
  if (obj.options !== undefined && obj.options.clearAfterCopy) {
    document.querySelector('[name="clearAfterCopy"]').checked = obj.options.clearAfterCopy;
  }
});
