// auth.js - 登录逻辑
const Auth = {
  currentUser: null,

  // 初始化：检查是否已登录
  init() {
    const saved = localStorage.getItem('ftth_user');
    if (saved) {
      try {
        this.currentUser = JSON.parse(saved);
        return true;
      } catch (e) {
        localStorage.removeItem('ftth_user');
      }
    }
    return false;
  },

  // 员工登录
  async loginEmployee(username, password) {
    try {
      const res = await fetch(`${CONFIG.API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        this.currentUser = data.user;
        localStorage.setItem('ftth_user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: '网络错误，请检查服务器' };
    }
  },

  // 邀请码登录（外部人员）
  async loginExternal(code, name) {
    try {
      const res = await fetch(`${CONFIG.API_URL}/api/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, name })
      });
      const data = await res.json();
      if (data.success) {
        this.currentUser = data.user;
        localStorage.setItem('ftth_user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: '网络错误，请检查服务器' };
    }
  },

  // 提交答题成绩
  async submitScore(score, total, issue, answers) {
    if (!this.currentUser) return;
    try {
      await fetch(`${CONFIG.API_URL}/api/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: this.currentUser.id || null,
          user_type: this.currentUser.type || 'external',
          user_name: this.currentUser.name || this.currentUser.user_name || '未知',
          score,
          total,
          issue: issue || '',
          answers: answers || null
        })
      });
    } catch (err) {
      console.error('提交成绩失败:', err);
    }
  },

  // 登出
  logout() {
    this.currentUser = null;
    localStorage.removeItem('ftth_user');
    App.showLogin();
  }
};
