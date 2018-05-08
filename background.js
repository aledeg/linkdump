const linkdumpAddId = "linkdump-add";
let downloadId = 0;

function addLink(url, title) {
  browser.storage.local.get("urls")
  .then(obj => {
    const urls = obj.urls || [];
    urls.push({"url": url, "title": title});

    return browser.storage.local.set({"urls": urls});
  });
}

// Used by load.content.js
// eslint-disable-next-line no-unused-vars
function download() {
  browser.storage.local.get("urls")
  .then(obj => {
    if (!obj.urls) return;

    const content = obj.urls.reduce((a,b) => `${a + b.url  }\n`,'');
    const blob = new Blob([content], {type: "text/plain"});

    browser.downloads.download({
      url: URL.createObjectURL(blob),
      filename: "linkdump.txt",
      saveAs: true
    })
    .then(id => {downloadId = id});
  });
}

// Used by load.content.js
// eslint-disable-next-line no-unused-vars
function deleteLink(indexes) {
  browser.storage.local.get("urls")
  .then(obj => {
    if (!obj.urls) return;
    const { urls } = obj;

    const reversedIndexes = indexes.reverse();
    reversedIndexes.forEach((item) => {
      urls.splice(item, 1);
    });

    browser.storage.local.set({"urls": urls});
  });
}

function handleChanged(delta) {
  if (delta.id !== downloadId) {
    return;
  }
  if (delta.state && delta.state.current === "complete") {
    browser.notifications.create("download-notification", {
      "type": "basic",
      "iconUrl": browser.extension.getURL("icons/linkdump-48.png"),
      "title": "Linkdump",
      "message": "Download complete"
    })
    .then(browser.storage.local.clear());
  }
}

browser.menus.create({
  id: linkdumpAddId,
  title: "Add link to dump",
  contexts: ["link"]
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
