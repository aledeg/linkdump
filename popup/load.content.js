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
  browser.runtime.sendMessage({
    action: 'download',
    payload: document.querySelector('input[type="radio"]:checked').value
  });
});

document.querySelector('#clear').addEventListener('click', () => {
  browser.runtime.sendMessage({
    action: 'clear'
  });
});

document.querySelector('#delete').addEventListener('click', () => {
  const indexes = [];
  document.querySelectorAll('input[type="checkbox"]:checked').forEach(item => {
    indexes.push(Number(item.dataset.index));
  });
  browser.runtime.sendMessage({
    action: 'delete',
    payload: indexes
  });
});

function handleMessage(message) {
  switch (message.action) {
    case 'reload':
      window.location.reload(true);
      break;
    default:
      // Do nothing on purpose
  }
}

browser.runtime.onMessage.addListener(handleMessage);
