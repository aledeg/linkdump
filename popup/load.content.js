browser.storage.local.get("urls")
.then(obj => {
  if (obj.urls) {
    obj.urls.forEach(function (item, index) {
      var listItem = document.createElement('p');
      var itemSelect = document.createElement('input');
      itemSelect.id = 'link-' + index;
      itemSelect.type = 'checkbox';
      itemSelect.dataset.index = index;
      var itemLink = document.createElement('a');
      itemLink.href = item.url;
      itemLink.innerHTML = item.title;

      listItem.appendChild(itemSelect);
      listItem.appendChild(itemLink);

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

document.querySelector("#delete").addEventListener("click", (e) => {
  var indexes = [];
  document.querySelectorAll('input[type="checkbox"]:checked').forEach(function (item) {
    indexes.push(item.dataset.index);
  });
  var page = browser.extension.getBackgroundPage();
  page.deleteLink(indexes);
  window.close();
});
