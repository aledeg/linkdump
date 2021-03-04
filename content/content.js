const sendMessage = (event) => {
    const element = event.target.closest('a') || event.target.closest('img');

    if (null === element) {
        return;
    }

    const url = element.href || element.src;
    const title = element.text.trim() || element.alt || url;

    browser.runtime.sendMessage({
        action: 'addLink',
        payload: { url, title }
    });
    event.preventDefault();
    event.stopPropagation();
}

var divElement = document.createElement('div');
divElement.className = 'linkdump';
divElement.innerText = browser.i18n.getMessage(`warningLinkCapture`);
divElement.addEventListener('click', (event) => {
    document.documentElement.removeEventListener('click', sendMessage, true);
    divElement.remove();
});
document.body.appendChild(divElement);

document.documentElement.addEventListener('click', sendMessage, true);
