const linkAddId = 'link-add';
const bookmarkAddId = 'bookmark-add';
const textReducer = (carry, item) => `${carry + item.url}\n`;
const markdownReducer = (carry, item) => `${carry}[${item.title}](${item.url})\n`;
const htmlReducer = (carry, item) => `${carry}<a href="${item.url}">${item.title}</a><br/>\n`;
const dokuwikiReducer = (carry, item) => `${carry}[[${item.url}|${item.title}]]\n`;
const phpbbReducer = (carry, item) => `${carry}[url=${item.url}]${item.title}[/url]\n`;
let downloadId = 0;

function notification(message) {
  return browser.notifications
      .create('download-notification', {
        type: 'basic',
        iconUrl: browser.extension.getURL('icons/linkdump-48.png'),
        title: 'Linkdump',
        message: browser.i18n.getMessage(message)
      });
}

async function addLink(link) {
  const storage = await browser.storage.local.get('urls');
  let urls = storage.urls || [];
  urls.push(link);

  await browser.storage.local.get('options').then(obj => {
    if (obj.options === undefined || obj.options.other === undefined) {
      return;
    }
    if (obj.options.other.sort) {
      urls.sort((a, b) => a.title.localeCompare(b.title));
    }
    if (obj.options.other.unique) {
      urls = urls.filter((item, index, self) => self.findIndex(t => t.url === item.url) === index);
    }
  })

  await browser.storage.local.set({ "urls": urls.flat() });
}

function getLinks(bookmark, initialLinks = []) {
  let links = [...initialLinks];

  if (bookmark.url) {
    links.push({ url: bookmark.url, title: bookmark.title});
  }
  else if (bookmark.children) {
    bookmark.children.forEach(child => {
      links = getLinks(child, links);
    });
  }

  return links;
}

async function addBookmark(id) {
  const [root] = await browser.bookmarks.getSubTree(id);
  await addLink(getLinks(root));
}

function getDownloadOptions(format) {
  switch (format) {
    case 'markdown':
      return {
        reducer: markdownReducer,
        filename: 'linkdump.md',
        type: 'text/markdown'
      };
    case 'html':
      return {
        reducer: htmlReducer,
        filename: 'linkdump.html',
        type: 'text/html'
      };
    case 'dokuwiki':
      return {
        reducer: dokuwikiReducer,
        filename: 'linkdump.dk',
        type: 'text/plain'
      };
    case 'phpbb':
      return {
        reducer: phpbbReducer,
        filename: 'linkdump.bb',
        type: 'text/plain'
      };
    default:
      return {
        reducer: textReducer,
        filename: 'linkdump.txt',
        type: 'text/plain'
      }
  }
}

function copy(downloadOptions) {
  browser.storage.local.get('urls').then(obj => {
    if (!obj.urls) return;

    const content = obj.urls.reduce(downloadOptions.reducer, '');

    browser.runtime.sendMessage({
      action: 'copy',
      payload: content
    })
  });
}

function download(downloadOptions) {
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

function deleteLink(link) {
  browser.storage.local.get('urls').then(obj => {
    if (!obj.urls) return;
    let { urls } = obj;

    urls = urls.filter((item) => item.url !== link.url && item.title !== link.title);

    browser.storage.local.set({ urls });
  });
}

function clear() {
  browser.storage.local.remove('urls').then(
    notification('notificationStorageCleared')
  );
}

function handleChanged(delta) {
  if (delta.id !== downloadId) {
    return;
  }
  if (delta.state && delta.state.current === 'complete') {
    browser.storage.local.get('options').then(obj => {
      if (obj.options !== undefined && obj.options.clear !== undefined && obj.options.clear.download) {
        browser.storage.local.remove('urls');
      }
    }).then(notification('notificationDownloadComplete'));
  }
}

function handleMessage(message) {
  switch (message.action) {
    case 'download': {
      const options = getDownloadOptions(message.payload);
      download(options);
      break;
    }
    case 'copy': {
      const options = getDownloadOptions(message.payload);
      copy(options);
      break;
    }
    case 'copied': {
      browser.storage.local.get('options').then(obj => {
        if (obj.options !== undefined && obj.options.clear !== undefined && obj.options.clear.copy) {
          browser.storage.local.remove('urls');
        }
      }).then(notification('notificationStorageCopied'));
      break;
    }
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
  id: linkAddId,
  title: browser.i18n.getMessage('menuAddToDump'),
  contexts: ['link', 'image']
});

browser.menus.create({
  id: bookmarkAddId,
  title: browser.i18n.getMessage('menuAddToDump'),
  contexts: ['bookmark']
});

browser.menus.onClicked.addListener(info => {
  switch (info.menuItemId) {
    case linkAddId:
      if (info.linkUrl !== undefined) {
        addLink({ url: info.linkUrl, title: info.linkText});
      } else {
        addLink({ url: info.srcUrl, title: info.srcUrl});
      }
      break;
    case bookmarkAddId:
      addBookmark(info.bookmarkId);
      break;
    default:
      // Do nothing on purpose
  }
});

browser.pageAction.onClicked.addListener(tab => {
  addLink({ url: tab.url, title: tab.title});
});

browser.downloads.onChanged.addListener(handleChanged);

browser.runtime.onMessage.addListener(handleMessage);
