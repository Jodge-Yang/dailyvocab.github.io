// 登录界面UI交互
const AuthUI = {
  // 切换登录方式
  switchTab(tab) {
    const btns = document.querySelectorAll('.tab-btn');
    btns.forEach(btn => btn.classList.remove('active'));
    
    if (tab === 'employee') {
      btns[0].classList.add('active');
      document.getElementById('loginEmployee').classList.remove('hidden');
      document.getElementById('loginExternal').classList.add('hidden');
    } else {
      btns[1].classList.add('active');
      document.getElementById('loginEmployee').classList.add('hidden');
      document.getElementById('loginExternal').classList.remove('hidden');
    }
  },

  // 员工登录
  async loginEmployee() {
    const username = document.getElementById('empUser').value.trim();
    const password = document.getElementById('empPass').value.trim();
    const msg = document.getElementById('empMsg');

    if (!username || !password) {
      msg.textContent = '请输入用户名和密码';
      msg.className = 'msg error';
      return;
    }

    msg.textContent = '登录中...';
    msg.className = 'msg info';

    const result = await Auth.loginEmployee(username, password);
    if (result.success) {
      msg.textContent = '登录成功！';
      msg.className = 'msg success';
      setTimeout(() => App.showHome(), 500);
    } else {
      msg.textContent = result.message;
      msg.className = 'msg error';
    }
  },

  // 外部人员登录
  async loginExternal() {
    const code = document.getElementById('inviteCode').value.trim();
    const name = document.getElementById('externalName').value.trim();
    const msg = document.getElementById('extMsg');

    if (!code || !name) {
      msg.textContent = '请输入邀请码和姓名';
      msg.className = 'msg error';
      return;
    }

    msg.textContent = '验证中...';
    msg.className = 'msg info';

    const result = await Auth.loginExternal(code, name);
    if (result.success) {
      msg.textContent = '验证成功！';
      msg.className = 'msg success';
      setTimeout(() => App.showHome(), 500);
    } else {
      msg.textContent = result.message;
      msg.className = 'msg error';
    }
  }
};
