function sendMessage(event) {
    const link = event.target.closest('a');
    if (link !== null) {
        browser.runtime.sendMessage({
            action: 'addLink',
            payload: { url: link.href, title: link.text.trim() }
        });
        event.preventDefault();
        event.stopPropagation();
    }
}

let divElement = document.createElement('div');
divElement.className = 'linkdump';
divElement.innerText = browser.i18n.getMessage(`warningLinkCapture`);
divElement.addEventListener('click', (event) => {
    document.documentElement.removeEventListener('click', sendMessage, true);
    divElement.remove();
});
document.body.appendChild(divElement);

document.documentElement.addEventListener('click', sendMessage, true);
