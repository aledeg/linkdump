let elements = document.querySelectorAll('a');
let links = [];
elements.forEach(element => {
    let title = element.text.trim();
    if (title === "") {
        title = element.title.trim();
    }
    links.push({ url: element.href, title});
});
browser.runtime.sendMessage({
    action: 'addLink',
    payload: links
});
