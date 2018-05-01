browser.storage.local.get("urls")
.then(obj => {
  if (obj.urls) {
    obj.urls.forEach(function (item) {
      var listItem = document.createElement('p');
      listItem.appendChild(document.createTextNode(item));
      document.querySelector("#popup-content").appendChild(listItem);
    });
  }
});

document.querySelector("#download").addEventListener("click", (e) => {
  browser.storage.local.get("urls")
  .then((obj) => {
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
    .then(id => {
      var page = browser.extension.getBackgroundPage();
      page.downloadId = id;
    });
  });
});

document.querySelector("#clear").addEventListener("click", (e) => {
  browser.storage.local.clear();
  window.close();
});
