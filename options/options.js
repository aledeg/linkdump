function saveOption(name, value) {
  browser.storage.local.set({
    [name]: value
  });
}

document.querySelectorAll('[name="default-format"]').forEach(item => {
  item.addEventListener('change', (event) => {
    saveOption('defaultFormat', event.target.value);
  });
});

document.querySelector('[for="default-format"]').textContent = browser.i18n.getMessage(`optionsDefaultFormat`);
