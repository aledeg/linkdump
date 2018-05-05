const linkdumpAddId = "linkdump-add";
const linkdumpDownloadId = "linkdump-download";

var downloadId = 0;

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

function addLink(url, title) {
  browser.storage.local.get("urls")
  .then(obj => {
    var urls = [];
    if (obj.hasOwnProperty("urls")) {
      urls = obj.urls;
    }
    urls.push({"url": url, "title": title});

    return browser.storage.local.set({"urls": urls});
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

function download() {
  browser.storage.local.get("urls")
  .then(obj => {
    if (!obj.hasOwnProperty("urls")) {
      return;
    }

    var content = obj.urls.reduce((a,b) => {return a + b.url + "\n"},'');
    var blob = new Blob([content], {type: "text/plain"});

    browser.downloads.download({
      url: URL.createObjectURL(blob),
      filename: "linkdump.txt",
      saveAs: true
    })
    .then(id => {downloadId = id});
  });
}

function deleteLink(indexes) {
  browser.storage.local.get("urls")
  .then(obj => {
    if (!obj.hasOwnProperty("urls")) {
      return
    }
    urls = obj.urls;

    indexes = indexes.reverse();
    indexes.forEach(function(item) {
      urls.splice(item, 1);
    });

    return browser.storage.local.set({"urls": urls});
  });
}

browser.downloads.onChanged.addListener(handleChanged);
