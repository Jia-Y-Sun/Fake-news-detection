// 1. 自动填充邮箱、密码
window.addEventListener('DOMContentLoaded', function() {
  if(localStorage.getItem('rememberEmail')) {
    document.getElementById('loginEmail').value = localStorage.getItem('rememberEmail');
    document.getElementById('rememberMe').checked = true;
  }
  if(localStorage.getItem('rememberPassword')) {
    document.getElementById('loginPassword').value = localStorage.getItem('rememberPassword');
  }
  // 自动登录跳转
  if(localStorage.getItem('isLoggedIn') === '1') {
    document.getElementById('loginCard').style.display='none';
    document.getElementById('modelCard').style.display='block';
  }
});

// 2. 密码可见切换
document.getElementById('togglePassword').onclick = function() {
  const pwd = document.getElementById('loginPassword');
  if(pwd.type === 'password') {
    pwd.type = 'text';
    this.innerHTML = '<i class="fa fa-eye-slash"></i>';
  } else {
    pwd.type = 'password';
    this.innerHTML = '<i class="fa fa-eye"></i>';
  }
};

// 3. 登录逻辑
document.getElementById('loginForm').onsubmit = async function(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const remember = document.getElementById('rememberMe').checked;
  const errorDiv = document.getElementById('loginError');
  const url = chrome.runtime.getURL('account.xls');
  errorDiv.style.display = "none";
  try {
    let xlsUrl;
   if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.getURL) {
  xlsUrl = chrome.runtime.getURL('account.xls');
} else {
  xlsUrl = 'account.xls';
}
const resp = await fetch(xlsUrl);
    //const resp = await fetch('account.xls');
    const arrayBuffer = await resp.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    const workbook = XLSX.read(data, {type: 'array'});
    let worksheet = workbook.Sheets[workbook.SheetNames[0]];
    let json = XLSX.utils.sheet_to_json(worksheet);
    let found = json.find(row =>
      row.Email && row.Email.trim() === email &&
      row.Password && row.Password === password
    );
    if(found) {
      localStorage.setItem('isLoggedIn', '1');
      if(remember) {
        localStorage.setItem('rememberEmail', email);
        localStorage.setItem('rememberPassword', password);
      } else {
        localStorage.removeItem('rememberEmail');
        localStorage.removeItem('rememberPassword');
      }
      document.getElementById('loginCard').style.display='none';
      document.getElementById('modelCard').style.display='block';
    } else {
      errorDiv.textContent = "密码错误，请检查用户名与密码.";
      errorDiv.style.display = "block";
    }
  } catch(err) {
    errorDiv.textContent = "无法校验用户信息，检查account.xls文件是否存在";
    errorDiv.style.display = "block";
  }
};

// 4. 注册弹窗逻辑
const registerModal = document.getElementById('registerModalOverlay');
const registerBtn = document.getElementById('registerBtn');
const closeRegisterBtn = document.getElementById('closeRegisterModalBtn');
const doRegisterBtn = document.getElementById('doRegisterBtn');
const registerEmail = document.getElementById('registerEmail');
const registerPassword = document.getElementById('registerPassword');
const registerError = document.getElementById('registerModalError');
const registerSuccess = document.getElementById('registerModalSuccess');

registerBtn.onclick = () => {
  registerEmail.value = "";
  registerPassword.value = "";
  registerError.textContent = "";
  registerSuccess.textContent = "";
  registerModal.style.display = "flex";
};
closeRegisterBtn.onclick = () => {
  registerModal.style.display = "none";
};
registerModal.onclick = (e) => {
  if (e.target === registerModal) registerModal.style.display = "none";
};

doRegisterBtn.onclick = async function() {
  const email = registerEmail.value.trim();
  const password = registerPassword.value;
  registerError.textContent = "";
  registerSuccess.textContent = "";
  if (!email || !password) {
    registerError.textContent = "邮箱和密码不能为空";
    return;
  }
  if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
    registerError.textContent = "请输入有效邮箱";
    return;
  }
  try {
    let json = [];
    let sheetName = "Sheet1";
    try {
      const resp = await fetch('account.xls');
      const arrayBuffer = await resp.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      const workbook = XLSX.read(data, {type: 'array'});
      let worksheet = workbook.Sheets[workbook.SheetNames[0]];
      json = XLSX.utils.sheet_to_json(worksheet);
      sheetName = workbook.SheetNames[0];
    } catch (e) {
      json = [];
    }
    if (json.some(row => row.Email && row.Email.trim() === email)) {
      registerError.textContent = "该邮箱已被注册";
      return;
    }
    json.push({Email: email, Password: password});
    const newWb = XLSX.utils.book_new();
    const newWs = XLSX.utils.json_to_sheet(json, {header: ["Email", "Password"]});
    XLSX.utils.book_append_sheet(newWb, newWs, sheetName);
    XLSX.writeFile(newWb, "account.xls");
    registerSuccess.textContent = "注册成功，请使用新账号登录！";
    setTimeout(() => { registerModal.style.display = "none"; }, 1500);
  } catch (e) {
    registerError.textContent = "注册失败，请重试";
  }
};

// 5. “记住登录”自动跳转到主页面
window.addEventListener('DOMContentLoaded', function() {
  if(localStorage.getItem('isLoggedIn') === '1') {
    document.getElementById('loginCard').style.display='none';
    document.getElementById('modelCard').style.display='block';
  }
});

// 6. 模型选择页逻辑 + 模型记忆
let addModelSelected = false;
let customModelFileName = '';
const models = document.querySelectorAll('.model');
const continueBtn = document.getElementById('continueBtn');
let selectedModel = localStorage.getItem('selectedModel') || null;
models.forEach(model => {
  model.addEventListener('click', () => {
    // 特殊处理 add model
    if(model === document.getElementById('addModelBtn')) {
      document.getElementById('addModelModalOverlay').style.display = 'flex';
      document.getElementById('addModelFileError').textContent = '';
      document.getElementById('addModelFileInput').value = '';
      document.getElementById('addModelUploadBtn').disabled = true;
      addModelSelected = false;
      models.forEach(m => m.classList.remove('selected'));
      selectedModel = null;
      continueBtn.classList.remove('enabled');
      continueBtn.disabled = true;
      continueBtn.style.pointerEvents = "none";
      continueBtn.style.opacity = "0.5";
      return;
    }
    // 普通模型逻辑
    models.forEach(m => m.classList.remove('selected'));
    model.classList.add('selected');
    selectedModel = model.textContent;
    localStorage.setItem('selectedModel', selectedModel);
    continueBtn.classList.add('enabled');
    continueBtn.disabled = false;
    continueBtn.style.pointerEvents = "auto";
    continueBtn.style.opacity = "1";
    addModelSelected = false;
    customModelFileName = '';
  });
});

// add model弹窗关闭
document.getElementById('closeAddModelModalBtn').onclick = function() {
  document.getElementById('addModelModalOverlay').style.display = "none";
  document.getElementById('addModelFileInput').value = '';
  document.getElementById('addModelFileError').textContent = '';
  document.getElementById('addModelUploadBtn').disabled = true;
  addModelSelected = false;
};
document.getElementById('addModelModalOverlay').onclick = function(e) {
  if(e.target === document.getElementById('addModelModalOverlay')) {
    document.getElementById('closeAddModelModalBtn').onclick();
  }
};

// 选择文件，仅允许.py
document.getElementById('addModelFileInput').oninput = function() {
  const file = document.getElementById('addModelFileInput').files[0];
  if(!file) {
    document.getElementById('addModelFileError').textContent = '';
    document.getElementById('addModelUploadBtn').disabled = true;
    return;
  }
  if(!file.name.endsWith('.py')) {
    document.getElementById('addModelFileError').textContent = '请选择 .py 格式的模型文件';
    document.getElementById('addModelUploadBtn').disabled = true;
    return;
  }
  document.getElementById('addModelFileError').textContent = '';
  document.getElementById('addModelUploadBtn').disabled = false;
};

// 点击确认上传
document.getElementById('addModelUploadBtn').onclick = function() {
  const file = document.getElementById('addModelFileInput').files[0];
  if(!file || !file.name.endsWith('.py')) {
    document.getElementById('addModelFileError').textContent = '请选择 .py 格式的模型文件';
    return;
  }
  addModelSelected = true;
  customModelFileName = file.name;
  document.getElementById('addModelModalOverlay').style.display = 'none';
  models.forEach(m => m.classList.remove('selected'));
  document.getElementById('addModelBtn').classList.add('selected');
  selectedModel = "add model";
  localStorage.setItem('selectedModel', selectedModel);
  continueBtn.classList.add('enabled');
  continueBtn.disabled = false;
  continueBtn.style.pointerEvents = "auto";
  continueBtn.style.opacity = "1";
};

// 继续按钮
continueBtn.addEventListener('click', () => {
  if(selectedModel === "add model" && !addModelSelected) {
    document.getElementById('addModelFileError').textContent = '请先选择并确认一个 .py 格式的模型文件';
    document.getElementById('addModelModalOverlay').style.display = 'flex';
    continueBtn.classList.remove('enabled');
    continueBtn.disabled = true;
    continueBtn.style.pointerEvents = "none";
    continueBtn.style.opacity = "0.5";
    return;
  }
  if (!selectedModel) return;
  document.getElementById('modelCard').style.display = 'none';
  document.getElementById('inputCard').style.display = 'flex';
  fillCurrentUrl();
});

// 退出账号按钮功能
function logout() {
  localStorage.removeItem('isLoggedIn');
  document.getElementById('modelCard').style.display = 'none';
  document.getElementById('inputCard').style.display = 'none';
  document.getElementById('loginCard').style.display = 'flex';
}
document.getElementById('logoutBtn1').onclick = logout;
document.getElementById('logoutBtn2').onclick = logout;

// 选择模型页Back按钮返回登录页
document.getElementById('modelBackBtn').onclick = function() {
  document.getElementById('modelCard').style.display = 'none';
  document.getElementById('loginCard').style.display = 'flex';
  models.forEach(m => m.classList.remove('selected'));
  selectedModel = null;
  continueBtn.classList.remove('enabled');
  continueBtn.disabled = true;
  continueBtn.style.pointerEvents = "none";
  continueBtn.style.opacity = "0.5";
};

// 输入链接页Back按钮返回选择模型页
const inputUri = document.getElementById('inputUri');
const clearBtn = document.getElementById('clearBtn');
const inputBackBtn = document.getElementById('inputBackBtn');
const inputContinueBtn = document.getElementById('inputContinueBtn');

function updateInputContinueBtn() {
  if (inputUri.value.trim().length) {
    inputContinueBtn.classList.add('enabled');
    inputContinueBtn.disabled = false;
  } else {
    inputContinueBtn.classList.remove('enabled');
    inputContinueBtn.disabled = true;
  }
}
inputUri.addEventListener('input', updateInputContinueBtn);

function fillCurrentUrl() {
  if (chrome && chrome.tabs) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs.length > 0) {
        const url = tabs[0].url;
        if (inputUri && (!inputUri.value || inputUri.value.startsWith('chrome-extension://'))) {
          inputUri.value = url;
          updateInputContinueBtn();
        }
      }
    });
  }
}
document.addEventListener('DOMContentLoaded', fillCurrentUrl);

clearBtn.addEventListener('click', () => {
  inputUri.value = '';
  updateInputContinueBtn();
});

inputBackBtn.addEventListener('click', () => {
  document.getElementById('inputCard').style.display = 'none';
  document.getElementById('modelCard').style.display = 'block';
  models.forEach(m => m.classList.remove('selected'));
  selectedModel = null;
  continueBtn.classList.remove('enabled');
  continueBtn.disabled = true;
  continueBtn.style.pointerEvents = "none";
  continueBtn.style.opacity = "0.5";
  inputUri.value = '';
  updateInputContinueBtn();
});

// --- Modal Dialog ---
const modalOverlay = document.getElementById('resultModalOverlay');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalModel = document.getElementById('modalModel');
const modalUrl = document.getElementById('modalUrl');
const modalResult = document.getElementById('modalResult');
const saveResultBtn = document.getElementById('saveResultBtn');

async function getDetectionResult(model, url) {
  try {
    // 加载模型
    await fetch("http://localhost:5000/load_model", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: model })
    });

    // 加载训练集
    await fetch("http://localhost:5000/load_train_json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: "train.json" })  // 改了的话同步修改,默认放在同一目录下
    });

    // 加载测试集
    await fetch("http://localhost:5000/load_test_json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: "path.json" })  // 同上
    });

    // 运行模型
    const res = await fetch("http://localhost:5000/run_model", {
  method: "POST"
});
const data = await res.json();
if (data.status === "success") {
  console.log("检测结果：", data.result);
  alert("检测成功: " + JSON.stringify(data.result));
} else {
  alert("错误: " + data.message);
}

    // 返回结果
    return data.result || "模型运行成功";

  } catch (err) {
    console.error("检测出错:", err);
    return "检测失败：" + err.message;
  }
}

inputContinueBtn.addEventListener('click', async () => {
  let model = selectedModel;
  let url = inputUri.value.trim();
  modalModel.textContent = model;
  modalUrl.textContent = url;
  modalResult.textContent = "检测中...";
  modalOverlay.style.display = "flex";
  try {
    let result = await getDetectionResult(model, url);
    modalResult.textContent = result;
  } catch (e) {
    modalResult.textContent = "检测失败";
  }
});

saveResultBtn.addEventListener('click', function() {
  let table =
    `<table border="1">
      <tr><th>模型名称</th><th>新闻链接</th><th>检测结果</th></tr>
      <tr>
        <td>${modalModel.textContent}</td>
        <td>${modalUrl.textContent}</td>
        <td>${modalResult.textContent}</td>
      </tr>
    </table>`;
  let blob = new Blob([table], {type: "application/vnd.ms-excel"});
  let url = URL.createObjectURL(blob);
  let a = document.createElement('a');
  a.href = url;
  a.download = '检测结果.xls';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
});

closeModalBtn.addEventListener('click', () => {
  modalOverlay.style.display = "none";
});
modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) modalOverlay.style.display = "none";
});

// --- 高级设置弹窗 ---
const advancedModalOverlay = document.getElementById('advancedModalOverlay');
document.getElementById('advancedSettingBtn').onclick = function() {
  advancedModalOverlay.style.display = 'flex';
  document.getElementById('toggleFloater').checked = localStorage.getItem('floaterEnabled') !== '0';
  document.getElementById('toggleSound').checked = localStorage.getItem('soundEnabled') !== '0';
};
document.getElementById('closeAdvancedModalBtn').onclick = function() {
  advancedModalOverlay.style.display = 'none';
};
document.getElementById('closeAdvancedSaveBtn').onclick = function() {
  localStorage.setItem('floaterEnabled', document.getElementById('toggleFloater').checked ? '1' : '0');
  localStorage.setItem('soundEnabled', document.getElementById('toggleSound').checked ? '1' : '0');
  advancedModalOverlay.style.display = 'none';
};
window.addEventListener('DOMContentLoaded', function() {
  // ...已有自动填充等代码...
  // hash 跳转逻辑
  if (location.hash === '#upload') {
    if (localStorage.getItem('isLoggedIn') === '1' && localStorage.getItem('selectedModel')) {
      document.getElementById('loginCard').style.display='none';
      document.getElementById('modelCard').style.display='none';
      document.getElementById('inputCard').style.display='flex';
      fillCurrentUrl();
    } else {
      location.hash = '#model';
      document.getElementById('loginCard').style.display='none';
      document.getElementById('modelCard').style.display='block';
      document.getElementById('inputCard').style.display='none';
    }
  }
});