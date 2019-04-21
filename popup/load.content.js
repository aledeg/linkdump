function deleteItem({target}) {
  const {href, text} = target.nextSibling;
  const container = target.parentNode;
  const root = container.parentNode;

  browser.runtime.sendMessage({
    action: 'delete',
    payload: {url: href, title: text}
  });

  container.remove();
  if (root.childNodes.length === 0) {
    window.close();
  }
}

function translateContent() {
  // Translate empty content
  document.querySelector('#popup-content').dataset.empty = browser.i18n.getMessage('popupContentEmpty');
  // Translate actions
  document.querySelectorAll('[data-action]').forEach(item => {
    const action = item.dataset.action[0].toUpperCase() + item.dataset.action.slice(1);
    // eslint-disable-next-line no-param-reassign
    item.title = browser.i18n.getMessage(`popupButtonAction${action}`);
  });
}

function configureContent() {
  browser.storage.local.get('options').then(obj => {
    if (obj.options !== undefined && obj.options.clearAfterDownload) {
      document.querySelector('[data-action="download"]').dataset.clear = true;
    }
  });
}

function drawHiddenContent() {
  document.querySelectorAll('.hidden').forEach(item => {
    item.classList.remove('hidden');
  });
}

function drawContentLinks(obj) {
  obj.urls.forEach((item) => {
    const listItem = document.createElement('p');
    const itemLink = document.createElement('a');
    itemLink.href = item.url;
    itemLink.textContent = item.title;
    const deleteImage = document.createElement('img');
    deleteImage.src = browser.extension.getURL('icons/trash-48.png');
    deleteImage.onclick = deleteItem;
    deleteImage.classList = 'delete';

    listItem.appendChild(deleteImage);
    listItem.appendChild(itemLink);

    document.querySelector('#popup-content').appendChild(listItem);
  });
}

function drawContent() {
  browser.storage.local.get('urls').then(obj => {
    translateContent();
    configureContent();
    if (obj.urls !== undefined && obj.urls.length !== 0) {
      drawHiddenContent();
      drawContentLinks(obj);
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

document.querySelector('[data-action="clear"]').addEventListener('click', () => {
  browser.runtime.sendMessage({
    action: 'clear'
  }).then(window.close());
});

document.querySelectorAll('[data-format]').forEach(item => {
  item.addEventListener('click', ({target}) => {
    browser.runtime.sendMessage({
      action: document.querySelector('li:hover img').dataset.action,
      payload: target.dataset.format
    });
  });
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
