// content.js
let floaterFrame = null;

function injectFloater() {
  if (floaterFrame) return;
  floaterFrame = document.createElement('iframe');
  floaterFrame.src = chrome.runtime.getURL('floater.html');
  floaterFrame.style = `
    position: fixed;
    right: 30px;
    bottom: 30px;
    width: 340px;
    height: 180px;
    z-index: 999999;
    border: none;
    background: transparent;
  `;
  floaterFrame.id = 'news-floater-frame';
  document.body.appendChild(floaterFrame);
}

injectFloater();