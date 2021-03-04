const linkAddId = 'link-add';
const bookmarkAddId = 'bookmark-add';
const captureLinkId = 'capture-link';
const scrapeLinkId = 'scrape-link';
const textReducer = (carry, item) => `${carry + item.url}\n`;
const markdownReducer = (carry, item) =>
  `${carry}[${item.title}](${item.url})\n`;
const htmlReducer = (carry, item) =>
  `${carry}<a href="${item.url}">${item.title}</a><br/>\n`;
const dokuwikiReducer = (carry, item) =>
  `${carry}[[${item.url}|${item.title}]]\n`;
const phpbbReducer = (carry, item) =>
  `${carry}[url=${item.url}]${item.title}[/url]\n`;
const restructuredReducer = (carry, item) =>
  `${carry}\`${item.title} <${item.url}>\`\n`;
let downloadId = 0;

const notification = (message) => browser.notifications.create('download-notification', {
    type: 'basic',
    iconUrl: browser.extension.getURL('icons/linkdump-48.png'),
    title: 'Linkdump',
    message: browser.i18n.getMessage(message),
  })

const updateBadge = async (items) => {
  let count = items;

  if (items === undefined) {
    const storage = await browser.storage.local.get('urls');
    const urls = storage.urls || [];
    count = urls.length || '';
  } else if (items === 0) {
    count = '';
  }

  browser.browserAction.setBadgeText({ text: count.toString() });
  browser.browserAction.setBadgeTextColor({ color: 'white' });
  browser.browserAction.setBadgeBackgroundColor({ color: '#007bc5' });
}

const addLink = async (link) => {
  const storage = await browser.storage.local.get('urls');
  let urls = storage.urls || [];
  urls.push(link);

  urls = urls.flat();

  await browser.storage.local.get('options').then((obj) => {
    if (obj.options === undefined || obj.options.other === undefined) {
      return;
    }
    if (obj.options.other.sort) {
      urls.sort((a, b) => a.title.localeCompare(b.title));
    }
    if (obj.options.other.unique) {
      urls = urls.filter(
        (item, index, self) =>
          self.findIndex((t) => t.url === item.url) === index
      );
    }
  });

  await browser.storage.local.set({ urls });
  await updateBadge(urls.length);
}

const getLinks = (bookmark, initialLinks = []) => {
  let links = [...initialLinks];

  if (bookmark.url) {
    links.push({ url: bookmark.url, title: bookmark.title });
  } else if (bookmark.children) {
    bookmark.children.forEach((child) => {
      links = getLinks(child, links);
    });
  }

  return links;
}

const addBookmark = async (id) => {
  const [root] = await browser.bookmarks.getSubTree(id);
  await addLink(getLinks(root));
}

const getDownloadOptions = (format) => {
  switch (format) {
    case 'markdown':
      return {
        reducer: markdownReducer,
        filename: 'linkdump.md',
        type: 'text/markdown',
      };
    case 'html':
      return {
        reducer: htmlReducer,
        filename: 'linkdump.html',
        type: 'text/html',
      };
    case 'dokuwiki':
      return {
        reducer: dokuwikiReducer,
        filename: 'linkdump.dk',
        type: 'text/plain',
      };
    case 'phpbb':
      return {
        reducer: phpbbReducer,
        filename: 'linkdump.bb',
        type: 'text/plain',
      };
    case 'restructured':
      return {
        reducer: restructuredReducer,
        filename: 'linkdump.rst',
        type: 'text/plain',
      };
    default:
      return {
        reducer: textReducer,
        filename: 'linkdump.txt',
        type: 'text/plain',
      };
  }
}

const copy = (downloadOptions) => {
  browser.storage.local.get('urls').then((obj) => {
    if (!obj.urls) return;

    const content = obj.urls.reduce(downloadOptions.reducer, '');

    browser.runtime.sendMessage({
      action: 'copy',
      payload: content,
    });
  });
}

const download = (downloadOptions) => {
  browser.storage.local.get('urls').then((obj) => {
    if (!obj.urls) return;

    const content = obj.urls.reduce(downloadOptions.reducer, '');
    const blob = new Blob([content], { type: downloadOptions.type });

    browser.downloads
      .download({
        url: URL.createObjectURL(blob),
        filename: downloadOptions.filename,
        saveAs: true,
      })
      .then((id) => {
        downloadId = id;
      });
  });
}

const deleteLink = async (link) =>{
  const obj = await browser.storage.local.get('urls');
  if (!obj.urls) return;
  let { urls } = obj;

  urls = urls.filter(
    (item) => item.url !== link.url && item.title !== link.title
  );

  await browser.storage.local.set({ urls });
  await updateBadge(urls.length);
}

const clear = async () => {
  await browser.storage.local.remove('urls');
  await updateBadge(0);
}

const handleChanged = (delta) => {
  if (delta.id !== downloadId) {
    return;
  }
  if (delta.state && delta.state.current === 'complete') {
    browser.storage.local
      .get('options')
      .then(async (obj) => {
        if (
          obj.options !== undefined &&
          obj.options.clear !== undefined &&
          obj.options.clear.download
        ) {
          await browser.storage.local.remove('urls');
          await updateBadge(0);
        }
      })
      .then(notification('notificationDownloadComplete'));
  }
}

const handleMessage = (message) => {
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
      browser.storage.local
        .get('options')
        .then(async (obj) => {
          if (
            obj.options !== undefined &&
            obj.options.clear !== undefined &&
            obj.options.clear.copy
          ) {
            await browser.storage.local.remove('urls');
            await updateBadge(0);
          }
        })
        .then(notification('notificationStorageCopied'));
      break;
    }
    case 'delete':
      deleteLink(message.payload);
      break;
    case 'clear':
      clear();
      break;
    case 'addLink':
      addLink(message.payload);
      break;
    default:
    // Do nothing on purpose
  }
}

browser.menus.create({
  id: linkAddId,
  title: browser.i18n.getMessage('menuAddToDump'),
  contexts: ['link', 'image'],
});

browser.menus.create({
  id: bookmarkAddId,
  title: browser.i18n.getMessage('menuAddToDump'),
  contexts: ['bookmark'],
});

browser.menus.create({
  id: captureLinkId,
  title: browser.i18n.getMessage('menuCaptureLink'),
  contexts: ['page'],
});

browser.menus.create({
  id: scrapeLinkId,
  title: browser.i18n.getMessage('menuScrapeLink'),
  contexts: ['page'],
});

browser.menus.onClicked.addListener((info) => {
  switch (info.menuItemId) {
    case linkAddId: {
      const url = info.linkUrl || info.srcUrl;
      const title = info.linkText || info.srcUrl;
      addLink({ url, title });
      break;
    }
    case bookmarkAddId:
      addBookmark(info.bookmarkId);
      break;
    case captureLinkId:
      browser.tabs.executeScript({
        file: '/content/content.js',
      });
      browser.tabs.insertCSS({
        file: '/content/content.css',
      });
      break;
    case scrapeLinkId:
      browser.tabs.executeScript({
        file: '/content/scrape.js',
      });
      browser.tabs.insertCSS({
        file: '/content/content.css',
      });
      break;
    default:
    // Do nothing on purpose
  }
});

browser.pageAction.onClicked.addListener((tab) => {
  addLink(tab);
});

browser.downloads.onChanged.addListener(handleChanged);

browser.runtime.onMessage.addListener(handleMessage);

updateBadge();
