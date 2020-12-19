function filterUrl(url, filter) {
    if (filter.indexOf('!') === 0) {
        return (url.indexOf(filter.substring(1)) > -1 );
    }
    return (url.indexOf(filter) === -1 );
}

function getElementTitle(element) {
    let title = element.title.trim();
    if (title !== "") {
        return title;
    }

    return element.text.trim();
}

function getPageLinks(formData) {
    const elements = document.querySelectorAll('a');
    const filter = formData.get('filter');
    let links = [];
    elements.forEach(element => {
        let url = element.href;
        if (filterUrl(url, filter)) {
            return;
        }

        let title = getElementTitle(element);
        if (title === "") {
            return;
        }
        links.push({url, title});
    });

    return links;
}

function sendMessage(formData) {
    browser.runtime.sendMessage({
        action: 'addLink',
        payload: getPageLinks(formData)
    });
}

var divElement = document.createElement('div');
divElement.className = 'linkdump';
document.body.appendChild(divElement);

var formElement = document.createElement('form');
formElement.addEventListener('submit', (event) => {
    sendMessage(new FormData(event.target));
    formElement.parentNode.remove();
});
divElement.appendChild(formElement);

var filterElement = document.createElement('input');
filterElement.type = 'text';
filterElement.name = 'filter';
formElement.appendChild(filterElement);
filterElement.focus({preventScroll: true});