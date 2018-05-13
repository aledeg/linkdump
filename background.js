const linkdumpAddId = 'linkdump-add';
const textReducer = (carry, item) => `${carry + item.url}\n`;
const markdownReducer = (carry, item) => `${carry}[${item.title}](${item.url})\n`;
const htmlReducer = (carry, item) => `${carry}<a href="${item.url}">${item.title}</a><br/>\n`;
let downloadId = 0;
const downloadOptions = {};

function notification(message) {
  return browser.notifications
      .create('download-notification', {
        type: 'basic',
        iconUrl: browser.extension.getURL('icons/linkdump-48.png'),
        title: 'Linkdump',
        message
      });
}

function addLink(url, title) {
  browser.storage.local.get('urls').then(obj => {
    const urls = obj.urls || [];
    urls.push({ url, title });

    return browser.storage.local.set({ urls });
  });
}

function getdownloadOptions(format) {
  let reducer = textReducer;
  let filename = 'linkdump.txt';
  let type = 'text/plain';
  switch (format) {
    case 'markdown':
      reducer = markdownReducer;
      filename = 'linkdump.md';
      type = 'text/markdown';
      break;
    case 'html':
      reducer = htmlReducer;
      filename = 'linkdump.html';
      type = 'text/html';
      break;
    default:
      // Do nothing on purpose
  }

  downloadOptions.reducer = reducer;
  downloadOptions.filename = filename;
  downloadOptions.type = type;
}

function download() {
  browser.storage.local.get('urls').then(obj => {
    if (!obj.urls) return;

    const content = obj.urls.reduce(downloadOptions.reducer, '');
    const blob = new Blob([content], { type: downloadOptions.type });

    browser.downloads
      .download({
        url: URL.createObjectURL(blob),
        filename: downloadOptions.filename,
        saveAs: true
      })
      .then(id => {
        downloadId = id;
      });
  });
}

function deleteLink(indexes) {
  browser.storage.local.get('urls').then(obj => {
    if (!obj.urls) return;
    const { urls } = obj;

    const reversedIndexes = indexes.reverse();
    reversedIndexes.forEach(item => {
      urls.splice(item, 1);
    });

    browser.storage.local.set({ urls });
  }).then(
    notification('Links removed')
  ).then(browser.runtime.sendMessage({
    action: 'reload'
  }));
}

function clear() {
  browser.storage.local.clear().then(
    notification('Storage cleared')
  ).then(
    browser.runtime.sendMessage({
      action: 'reload'
    })
  );
}

function handleChanged(delta) {
  if (delta.id !== downloadId) {
    return;
  }
  if (delta.state && delta.state.current === 'complete') {
    browser.storage.local.clear().then(notification('Download complete'));
  }
}

function handleMessage(message) {
  switch (message.action) {
    case 'download':
      getdownloadOptions(message.payload);
      download();
      break;
    case 'delete':
      deleteLink(message.payload);
      break;
    case 'clear':
      clear();
      break;
    default:
      // Do nothing on purpose
  }
}

browser.menus.create({
  id: linkdumpAddId,
  title: 'Add link to dump',
  contexts: ['link']
});

browser.menus.onClicked.addListener(info => {
  if (info.menuItemId === linkdumpAddId) {
    addLink(info.linkUrl, info.linkText);
  }
});

browser.pageAction.onClicked.addListener(tab => {
  addLink(tab.url, tab.title);
});

browser.downloads.onChanged.addListener(handleChanged);

browser.runtime.onMessage.addListener(handleMessage);
