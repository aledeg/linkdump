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
    addLink(info.linkUrl);
  }
});

browser.pageAction.onClicked.addListener(tab => {
  addLink(tab.url);
});

function addLink(url) {
  browser.storage.local.get("urls")
  .then(obj => {
    var urls = [];
    if (obj.hasOwnProperty("urls")) {
      urls = obj.urls;
    }
    urls.push(url);

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

    var content = obj.urls.reduce((a,b) => {return a + "\n" + b});
    var blob = new Blob([content], {type: "text/plain"});

    browser.downloads.download({
      url: URL.createObjectURL(blob),
      filename: "linkdump.txt",
      saveAs: true
    })
    .then(id => {downloadId = id});
  });
}

browser.downloads.onChanged.addListener(handleChanged);
