browser.storage.local.get('urls').then(obj => {
  if (obj.urls) {
    obj.urls.forEach((item, index) => {
      const listItem = document.createElement('p');
      const itemSelect = document.createElement('input');
      itemSelect.id = `link-${index}`;
      itemSelect.type = 'checkbox';
      itemSelect.dataset.index = index;
      const itemLink = document.createElement('a');
      itemLink.href = item.url;
      itemLink.innerHTML = item.title;

      listItem.appendChild(itemSelect);
      listItem.appendChild(itemLink);

      document.querySelector('#popup-content').appendChild(listItem);
    });
  }
});

document.querySelector('#download').addEventListener('click', () => {
  const page = browser.extension.getBackgroundPage();
  page.download();
});

document.querySelector('#clear').addEventListener('click', () => {
  browser.storage.local.clear();
  window.close();
});

document.querySelector('#delete').addEventListener('click', () => {
  const indexes = [];
  document.querySelectorAll('input[type="checkbox"]:checked').forEach(item => {
    indexes.push(item.dataset.index);
  });
  const page = browser.extension.getBackgroundPage();
  page.deleteLink(indexes);
  window.close();
});
