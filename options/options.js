async function saveOption(name, value) {
    const obj = await browser.storage.local.get('options');
    const options = obj.options || {};
    options[name] = value;
    await browser.storage.local.set({ options });
}

document.querySelectorAll('input').forEach(item => {
  item.addEventListener('change', (event) => {
    switch (event.target.type) {
      case 'radio':
        saveOption(event.target.name, event.target.value);
        break;
      case 'checkbox':
        saveOption(event.target.name, event.target.checked);
        break;
      default:
        // Do nothing on purpose
    }
  });
});

document.querySelector('[for="defaultFormat"]').textContent = browser.i18n.getMessage(`optionsDefaultFormat`);
document.querySelector('[for="clearAfterDownload"]').textContent = browser.i18n.getMessage(`optionsClearAfterDownload`);

browser.storage.local.get('options').then(obj => {
  if (obj.options.defaultFormat) {
    document.querySelector(`[name="defaultFormat"][value="${obj.options.defaultFormat}"]`).checked = true;
  }
  if (obj.options.clearAfterDownload) {
    document.querySelector('[name="clearAfterDownload"]').checked = obj.options.clearAfterDownload;
  }
});
