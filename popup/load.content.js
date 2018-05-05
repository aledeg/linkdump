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
  var page = browser.extension.getBackgroundPage();
  page.download();
});

document.querySelector("#clear").addEventListener("click", (e) => {
  browser.storage.local.clear();
  window.close();
});
