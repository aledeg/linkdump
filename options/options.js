async function saveOption(name, value) {
    const obj = await browser.storage.local.get('options');
    const options = obj.options || {};
    options[name] = value;
    await browser.storage.local.set({ options });
}

document.querySelectorAll('[name="defaultFormat"]').forEach(item => {
  item.addEventListener('change', (event) => {
    saveOption('defaultFormat', event.target.value);
  });
});

document.querySelector('[for="defaultFormat"]').textContent = browser.i18n.getMessage(`optionsDefaultFormat`);
browser.storage.local.get('options').then(obj => {
  if (obj.options.defaultFormat) {
    document.querySelector(`[name="defaultFormat"][value="${obj.options.defaultFormat}"]`).checked = true;
  }
});
