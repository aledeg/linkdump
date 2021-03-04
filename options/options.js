async function saveOption(action, format, checked) {
  const obj = await browser.storage.local.get('options');
  const options = obj.options || {};

  if (options[action] === undefined) {
    options[action] = {};
  }
  options[action][format] = checked;

  await browser.storage.local.set({ options });
}

document.querySelectorAll('input').forEach((item) => {
  item.addEventListener('change', ({ target }) => {
    saveOption(target.dataset.action, target.dataset.format, target.checked);
  });
});

browser.storage.local.get('options').then((obj) => {
  if (obj.options !== undefined) {
    Object.entries(obj.options).forEach(([action, formats]) => {
      Object.entries(formats).forEach(([format, value]) => {
        document.querySelector(
          `[data-action="${action}"][data-format="${format}"]`
        ).checked = value;
      });
    });
  }
});

document.querySelector(
  '[for="downloadAction"]'
).textContent = browser.i18n.getMessage(`popupButtonActionDownload`);
document.querySelector(
  '[for="copyAction"]'
).textContent = browser.i18n.getMessage(`popupButtonActionCopy`);
document.querySelector(
  '[for="clearAfter"]'
).textContent = browser.i18n.getMessage(`optionsClearAfter`);
document.querySelector(
  '[for="sortDump"]'
).textContent = browser.i18n.getMessage(`optionsSortDump`);
document.querySelector(
  '[for="uniqueDump"]'
).textContent = browser.i18n.getMessage(`optionsUniqueDump`);
