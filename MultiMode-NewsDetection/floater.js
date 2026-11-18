const floater = document.getElementById('floater');
const floaterStatic = document.getElementById('floater-static');
const floaterDetect = document.getElementById('floater-detect');
const floaterMenu = document.getElementById('floater-menu');
const alertAudio = document.getElementById('alert-audio');

// 1. 浮窗和提示音设置同步
function applySettings() {
  if (localStorage.getItem('floaterEnabled') === '0') {
    floater.style.display = 'none';
  } else {
    floater.style.display = '';
  }
}
window.addEventListener('storage', (e) => {
  if (e.key === 'floaterEnabled' || e.key === 'soundEnabled') {
    applySettings();
  }
});
applySettings();

// 2. 右键菜单弹出
floater.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  floaterMenu.style.display = 'flex';
  floaterMenu.style.left = e.offsetX + 'px';
  floaterMenu.style.top = e.offsetY + 'px';
});
document.addEventListener('click', () => {
  floaterMenu.style.display = 'none';
});

// 3. 菜单功能
document.getElementById('menu-hide').onclick = () => {
  floater.style.display = 'none';
  localStorage.setItem('floaterEnabled', '0');
};
/*document.getElementById('menu-logout').onclick = () => {
  window.open(chrome.runtime.getURL('popup.html'), '_blank');
};*/
document.getElementById('menu-logout').onclick = () => {
  // 清除登录状态
  localStorage.removeItem('isLoggedIn');
  // 也可以清除记住的用户名和密码
  localStorage.removeItem('rememberEmail');
  localStorage.removeItem('rememberPassword');
  // 跳转到popup.html登录页面
  window.open(chrome.runtime.getURL('popup.html'), '_blank');
};
document.getElementById('menu-mode').onclick = () => {
  window.open(chrome.runtime.getURL('popup.html') + '#model', '_blank');
};
document.getElementById('menu-advanced').onclick = (e) => {
  e.stopPropagation();
  const overlay = document.getElementById('advancedModalOverlay');
  overlay.style.display = 'flex';
  document.getElementById('toggleFloater').checked = localStorage.getItem('floaterEnabled') !== '0';
  document.getElementById('toggleSound').checked = localStorage.getItem('soundEnabled') !== '0';
};
// 高级设置弹窗关闭/保存
document.getElementById('closeAdvancedModalBtn').onclick = function() {
  document.getElementById('advancedModalOverlay').style.display = 'none';
};
document.getElementById('closeAdvancedSaveBtn').onclick = function() {
  localStorage.setItem('floaterEnabled', document.getElementById('toggleFloater').checked ? '1' : '0');
  localStorage.setItem('soundEnabled', document.getElementById('toggleSound').checked ? '1' : '0');
  document.getElementById('advancedModalOverlay').style.display = 'none';
  applySettings();
};
// 点击弹窗外关闭
document.getElementById('advancedModalOverlay').onclick = function(e) {
  if (e.target === this) this.style.display = 'none';
};

// 4. 悬浮窗双击，直接进上传页或模型页
floater.addEventListener('dblclick', () => {
  const selectedModel = localStorage.getItem('selectedModel');
  if (selectedModel) {
    window.open(chrome.runtime.getURL('popup.html') + '#upload', '_blank');
  } else {
    window.open(chrome.runtime.getURL('popup.html') + '#model', '_blank');
  }
});

// 5. 详情按钮可弹出详细检测页
document.getElementById('floater-detail').onclick = () => {
  window.open(chrome.runtime.getURL('popup.html') + '#result', '_blank');
};

// 6. 自动检测模拟
setTimeout(() => {
  // 这里请替换为实际检测逻辑
  const isFake = Math.random() < 0.5; // 模拟检测
  if (isFake) {
    floaterStatic.style.display = 'none';
    floaterDetect.style.display = 'flex';
    if (localStorage.getItem('soundEnabled') !== '0') {
      alertAudio.play();
    }
  } else {
    floaterStatic.style.display = 'flex';
    floaterDetect.style.display = 'none';
  }
}, 1200); 
