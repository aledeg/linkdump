function deleteItem(event) {
  browser.runtime.sendMessage({
    action: 'delete',
    payload: event.target.dataset.index
  });
}

function formatSelect(target, format) {
  document.querySelectorAll('[name="formats"]').forEach(current => {
    if (current === target) {
      current.parentNode.classList.add('active');
    } else {
      current.parentNode.classList.remove('active');
    };
  });
  document.querySelectorAll('[data-action]').forEach(current => {
    current.dataset.format = format;
  });
}


function drawContent() {
  document.querySelector('#clear').textContent = browser.i18n.getMessage('popupButtonActionClear');
  document.querySelector('#popup-content').innerHTML = '';
  document.querySelectorAll('[data-action]').forEach(item => {
    const action = item.dataset.action[0].toUpperCase() + item.dataset.action.slice(1);
    item.textContent = browser.i18n.getMessage(`popupButtonAction${action}`);
  });
  browser.storage.local.get('options').then(obj => {
    if (obj.options.defaultFormat) {
      const target = document.querySelector(`[name="formats"][data-format="${obj.options.defaultFormat}"]`);
      formatSelect(target, obj.options.defaultFormat);
    }
  });

  browser.storage.local.get('urls').then(obj => {
    if (obj.urls && obj.urls.length !== 0) {
      obj.urls.forEach((item, index) => {
        const listItem = document.createElement('p');
        const itemLink = document.createElement('a');
        itemLink.href = item.url;
        itemLink.textContent = item.title;
        const itemDelete = document.createElement('button');
        itemDelete.dataset.index = index;
        itemDelete.onclick = deleteItem;
        itemDelete.classList = 'delete'
        const deleteImage = document.createElement('img');
        deleteImage.src = browser.extension.getURL('icons/trash-48.png');
        itemDelete.appendChild(deleteImage);

        listItem.appendChild(itemDelete);
        listItem.appendChild(itemLink);

        document.querySelector('#popup-content').appendChild(listItem);
      });
    } else {
      const emptyItem = document.createElement('p');
      emptyItem.textContent = browser.i18n.getMessage('popupContentEmpty');
      document.querySelector('#popup-content').appendChild(emptyItem);
      document.querySelectorAll('div').forEach(item => {
        if (item.id !== 'popup-content') {
          item.classList.add('empty');
        }
      });
    }
  });
}

function copyToClipboard(content) {
  const textarea = document.createElement('textarea');
  textarea.textContent = content;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
  browser.runtime.sendMessage({
    action: 'copied'
  }).then(window.close());
}

document.querySelectorAll('[data-action]').forEach(item => {
  item.addEventListener('click', (event) => {
    browser.runtime.sendMessage({
      action: event.target.dataset.action,
      payload: event.target.dataset.format
    });
  });
});

document.querySelectorAll('[name="formats"]').forEach(item => {
  item.addEventListener('click', (event) => {
    formatSelect(event.target, event.target.dataset.format);
  });
});

document.querySelector('#clear').addEventListener('click', () => {
  browser.runtime.sendMessage({
    action: 'clear'
  }).then(window.close());
});

function handleMessage(message) {
  switch (message.action) {
    case 'reload':
      drawContent();
      break;
    case 'copy':
      copyToClipboard(message.payload);
      break;
    default:
      // Do nothing on purpose
  }
}

browser.runtime.onMessage.addListener(handleMessage);
drawContent();
