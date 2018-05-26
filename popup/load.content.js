function deleteItem(event) {
  browser.runtime.sendMessage({
    action: 'delete',
    payload: event.target.dataset.index
  });
}

function loadDump() {
  document.querySelector('#popup-content').innerHTML = '';
  browser.storage.local.get('urls').then(obj => {
    if (obj.urls && obj.urls.length !== 0) {
      obj.urls.forEach((item, index) => {
        const listItem = document.createElement('p');
        const itemLink = document.createElement('a');
        itemLink.href = item.url;
        itemLink.innerHTML = item.title;
        const itemDelete = document.createElement('button');
        itemDelete.dataset.index = index;
        itemDelete.onclick = deleteItem;
        const deleteImage = document.createElement('img');
        deleteImage.src = browser.extension.getURL('icons/trash-48.png');
        itemDelete.appendChild(deleteImage);

        listItem.appendChild(itemDelete);
        listItem.appendChild(itemLink);

        document.querySelector('#popup-content').appendChild(listItem);
      });
    } else {
      const emptyItem = document.createElement('p');
      emptyItem.innerHTML = 'The dump is empty!';
      document.querySelector('#popup-content').appendChild(emptyItem);
    }
  });
}

document.querySelectorAll('.download').forEach(item => {
  item.addEventListener('click', (event) => {
    browser.runtime.sendMessage({
      action: 'download',
      payload: event.target.dataset.type
    });
  });
});

document.querySelector('#clear').addEventListener('click', () => {
  browser.runtime.sendMessage({
    action: 'clear'
  }).then(window.close());
});

document.querySelector('.dropdown-toggle').addEventListener('click', (event) => {
  event.target.parentNode.classList.toggle('show');
  event.target.nextElementSibling.classList.toggle('show');
  const expanded = event.target.getAttribute('aria-expanded') === 'true' ? 'false' : 'true';
  event.target.setAttribute('aria-expanded', expanded);
});

function handleMessage(message) {
  switch (message.action) {
    case 'reload':
      loadDump();
      break;
    default:
      // Do nothing on purpose
  }
}

browser.runtime.onMessage.addListener(handleMessage);
loadDump();
