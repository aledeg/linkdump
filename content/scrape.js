const filterUrl = (url, filter) => {
  if (filter.indexOf('!') === 0) {
    return url.indexOf(filter.substring(1)) > -1;
  }
  return url.indexOf(filter) === -1;
}

const getElementTitle = (element) => {
  const title = element.title.trim();
  if (title !== '') {
    return title;
  }

  return element.text.trim();
}

const getPageLinks = (formData) => {
  const elements = document.querySelectorAll('a');
  const filter = formData.get('filter');
  const links = [];
  elements.forEach((element) => {
    const url = element.href;
    if (filterUrl(url, filter)) {
      return;
    }

    const title = getElementTitle(element) || url;
    links.push({ url, title });
  });

  return links;
};

const sendScrapedMessages = (formData) => {
  browser.runtime.sendMessage({
    action: 'addLink',
    payload: getPageLinks(formData),
  });
};

const divScrapeElement = document.createElement('div');
divScrapeElement.className = 'linkdump';
document.body.appendChild(divScrapeElement);

const formElement = document.createElement('form');
formElement.addEventListener('submit', (event) => {
  sendScrapedMessages(new FormData(event.target));
  formElement.parentNode.remove();
});
divScrapeElement.appendChild(formElement);

const filterElement = document.createElement('input');
filterElement.type = 'text';
filterElement.name = 'filter';
formElement.appendChild(filterElement);
filterElement.focus({ preventScroll: true });
