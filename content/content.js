const sendCapturedMessages = (event) => {
  const element = event.target.closest('a') || event.target.closest('img');

  if (element === null) {
    return;
  }

  const url = element.href || element.src;
  const title = element.text.trim() || element.alt || url;

  browser.runtime.sendMessage({
    action: 'addLink',
    payload: { url, title },
  });
  event.preventDefault();
  event.stopPropagation();
};

const divCaptureElement = document.createElement('div');
divCaptureElement.className = 'linkdump';
divCaptureElement.innerText = browser.i18n.getMessage(`warningLinkCapture`);
divCaptureElement.addEventListener('click', () => {
  document.documentElement.removeEventListener(
    'click',
    sendCapturedMessages,
    true
  );
  divCaptureElement.remove();
});
document.body.appendChild(divCaptureElement);

document.documentElement.addEventListener('click', sendCapturedMessages, true);
