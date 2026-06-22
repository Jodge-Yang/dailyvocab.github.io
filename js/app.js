// app.js - 主应用逻辑（包含登录页）
const App = {
  currentRoute: '',
  quizState: null,

  // ===== 登录页 =====
  showLogin() {
    document.getElementById('app').innerHTML = `
      <div class="login-container">
        <div class="login-header">
          <h1>FTTH工程英语</h1>
          <p>答题系统</p>
        </div>
        <div class="login-box">
          <div class="login-tabs">
            <button class="tab-btn active" onclick="App.switchLoginTab('employee')">员工登录</button>
            <button class="tab-btn" onclick="App.switchLoginTab('external')">邀请码登录</button>
          </div>
          <div id="loginEmployee" class="login-form">
            <div class="form-group">
              <label>用户名</label>
              <input type="text" id="empUser" placeholder="请输入用户名">
            </div>
            <div class="form-group">
              <label>密码</label>
              <input type="password" id="empPass" placeholder="请输入密码">
            </div>
            <button class="btn-primary" onclick="App.doLoginEmployee()">登录</button>
            <p id="empMsg" class="msg"></p>
          </div>
          <div id="loginExternal" class="login-form" style="display:none;">
            <div class="form-group">
              <label>邀请码</label>
              <input type="text" id="inviteCode" placeholder="请输入邀请码">
            </div>
            <div class="form-group">
              <label>姓名</label>
              <input type="text" id="externalName" placeholder="请输入您的姓名">
            </div>
            <button class="btn-primary" onclick="App.doLoginExternal()">开始答题</button>
            <p id="extMsg" class="msg"></p>
          </div>
        </div>
      </div>
    `;
  },

  switchLoginTab(tab) {
    const btns = document.querySelectorAll('.tab-btn');
    btns[0].classList.toggle('active', tab === 'employee');
    btns[1].classList.toggle('active', tab === 'external');
    document.getElementById('loginEmployee').style.display = tab === 'employee' ? 'block' : 'none';
    document.getElementById('loginExternal').style.display = tab === 'external' ? 'block' : 'none';
  },

  async doLoginEmployee() {
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
      setTimeout(() => this.renderHome(), 500);
    } else {
      msg.textContent = result.message;
      msg.className = 'msg error';
    }
  },

  async doLoginExternal() {
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
      setTimeout(() => this.renderHome(), 500);
    } else {
      msg.textContent = result.message;
      msg.className = 'msg error';
    }
  },

  doLogout() {
    if (confirm('确定要退出登录吗？')) {
      Auth.logout();
    }
  },

  // ===== 首页 =====
  renderHome() {
    const stats = Storage.getStats()
    const user = Auth.currentUser

    document.getElementById('app').innerHTML = `
      ${user ? `
        <div class="user-bar">
          <div class="user-name">欢迎，<strong>${user.name || user.user_name || '用户'}</strong>
            <span style="font-size:12px;color:#a0aec0;margin-left:4px;">${user.type === 'employee' ? '员工' : '外部'}</span>
          </div>
          <button class="btn-logout" onclick="App.doLogout()">退出</button>
        </div>
      ` : ''}

      <div class="home-header">
        <div class="home-title">FTTH工程英语考核</div>
        <div class="home-subtitle">每日5词 · 50期 · ${stats.totalWords}个专业词汇</div>
      </div>

      <div class="page">
        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-num">${stats.totalWords}</div>
            <div class="stat-label">总词汇</div>
          </div>
          <div class="stat-card">
            <div class="stat-num success">${stats.mastered}</div>
            <div class="stat-label">已掌握</div>
          </div>
          <div class="stat-card">
            <div class="stat-num danger">${stats.wrongCount}</div>
            <div class="stat-label">错题数</div>
          </div>
        </div>

        <div style="margin-top:20px;">
          <div class="mode-card" onclick="App.startQuiz('random')">
            <div class="mode-icon blue">&#128218;</div>
            <div class="mode-info">
              <div class="mode-name">随机出题</div>
              <div class="mode-desc">从全部词库中随机抽取</div>
            </div>
            <div class="mode-arrow">&rsaquo;</div>
          </div>

          <div class="mode-card" onclick="App.startQuiz('issue')">
            <div class="mode-icon green">&#128208;</div>
            <div class="mode-info">
              <div class="mode-name">按期数出题</div>
              <div class="mode-desc">选择一期内容进行测试</div>
            </div>
            <div class="mode-arrow">&rsaquo;</div>
          </div>

          <div class="mode-card" onclick="App.startQuiz('wrong')">
            <div class="mode-icon orange">&#128221;</div>
            <div class="mode-info">
              <div class="mode-name">错题重练</div>
              <div class="mode-desc">专攻薄弱词汇${stats.wrongCount > 0 ? '（' + stats.wrongCount + '题）' : ''}</div>
            </div>
            <div class="mode-arrow">&rsaquo;</div>
          </div>
        </div>

        <div style="margin-top:20px;padding:16px;background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <div style="font-size:13px;color:#718096;margin-bottom:8px;">学习统计</div>
          <div style="display:flex;gap:16px;flex-wrap:wrap;">
            <div style="flex:1;min-width:80px;">
              <div style="font-size:12px;color:#a0aec0;">已答题数</div>
              <div style="font-size:18px;font-weight:600;color:#2d3748;">${stats.totalAnswered}</div>
            </div>
            <div style="flex:1;min-width:80px;">
              <div style="font-size:12px;color:#a0aec0;">正确率</div>
              <div style="font-size:18px;font-weight:600;color:${stats.accuracy >= 80 ? '#38b2ac' : stats.accuracy >= 60 ? '#f6ad55' : '#fc8181'};">${stats.accuracy}%</div>
            </div>
            <div style="flex:1;min-width:80px;">
              <div style="font-size:12px;color:#a0aec0;">未学</div>
              <div style="font-size:18px;font-weight:600;color:#a0aec0;">${stats.unlearned}</div>
            </div>
          </div>
        </div>

        <div class="bottom-space"></div>
      </div>

      <div class="tab-bar">
        <div class="tab-item active" onclick="App.renderHome()">
          <div class="tab-icon">&#127968;</div>
          <div class="tab-label">首页</div>
        </div>
        <div class="tab-item" onclick="App.renderWrong()">
          <div class="tab-icon">&#128221;</div>
          <div class="tab-label">错题本</div>
        </div>
      </div>
    `
  },

  // ===== 答题页 =====
  startQuiz(mode) {
    if (mode === 'wrong') {
      const wrongList = Storage.getWrongQuestions()
      if (wrongList.length === 0) {
        alert('暂无错题，先去答题吧！')
        return
      }
      const questions = QuizEngine.generateQuestionsFromWrong(wrongList.length)
      this.quizState = {
        questions: questions,
        currentIndex: 0,
        correctCount: 0,
        wrongWords: []
      }
      this.renderQuiz()
      return
    }

    if (mode === 'issue') {
      this.showIssueSelector()
      return
    }

    this.showCountSelector(10, (count) => {
      const questions = QuizEngine.generateRandomQuestions(count)
      this.quizState = {
        questions: questions,
        currentIndex: 0,
        correctCount: 0,
        wrongWords: []
      }
      this.renderQuiz()
    })
  },

  showCountSelector(defaultCount, callback) {
    const counts = [5, 10, 15, 20]
    let selected = defaultCount

    const overlay = document.createElement('div')
    overlay.className = 'modal-overlay'
    overlay.innerHTML = `
      <div class="modal-content">
        <div class="modal-title">选择题数</div>
        <div class="modal-options">
          ${counts.map(c => `<div class="modal-option ${c === selected ? 'active' : ''}" data-count="${c}">${c}题</div>`).join('')}
        </div>
        <button class="btn btn-primary" id="confirmCount">开始答题</button>
      </div>
    `
    document.body.appendChild(overlay)

    overlay.querySelectorAll('.modal-option').forEach(el => {
      el.onclick = () => {
        overlay.querySelectorAll('.modal-option').forEach(o => o.classList.remove('active'))
        el.classList.add('active')
        selected = parseInt(el.dataset.count)
      }
    })

    overlay.querySelector('#confirmCount').onclick = () => {
      document.body.removeChild(overlay)
      callback(selected)
    }
  },

  showIssueSelector() {
    const issues = QuizEngine.getAllIssues()
    const overlay = document.createElement('div')
    overlay.className = 'modal-overlay'
    overlay.style.alignItems = 'flex-end'
    overlay.innerHTML = `
      <div class="modal-content" style="width:90%;max-width:420px;max-height:70vh;overflow-y:auto;border-radius:16px 16px 0 0;">
        <div class="modal-title">选择期数</div>
        <div style="text-align:left;max-height:50vh;overflow-y:auto;">
          ${issues.map(i => `
            <div class="mode-card" style="margin-bottom:6px;padding:10px 12px;" onclick="App.selectIssue('${i.issue}')">
              <div style="width:36px;height:36px;border-radius:8px;background:#ebf4ff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;color:#667eea;flex-shrink:0;margin-right:10px;">
                ${i.issue}
              </div>
              <div class="mode-info">
                <div class="mode-name" style="font-size:14px;">第${i.issue}期</div>
                <div class="mode-desc" style="font-size:12px;">${i.topic || ''}</div>
              </div>
            </div>
          `).join('')}
        </div>
        <button class="btn btn-secondary" style="margin-top:12px;" onclick="document.body.removeChild(document.querySelector('.modal-overlay'))">取消</button>
      </div>
    `
    document.body.appendChild(overlay)
  },

  selectIssue(issue) {
    const overlay = document.querySelector('.modal-overlay')
    if (overlay) document.body.removeChild(overlay)

    this.showCountSelector(5, (count) => {
      const questions = QuizEngine.generateQuestionsByIssue(issue, count)
      if (questions.length === 0) {
        alert('该期数没有单词数据')
        return
      }
      this.quizState = {
        questions: questions,
        currentIndex: 0,
        correctCount: 0,
        wrongWords: []
      }
      this.renderQuiz()
    })
  },

  renderQuiz() {
    if (!this.quizState || this.quizState.questions.length === 0) {
      this.renderHome()
      return
    }

    const state = this.quizState
    const q = state.questions[state.currentIndex]
    const progress = ((state.currentIndex + 1) / state.questions.length) * 100

    document.getElementById('app').innerHTML = `
      <div class="page">
        <div class="quiz-progress-bar">
          <div class="quiz-progress-fill" style="width:${progress}%"></div>
        </div>
        <div class="quiz-progress-text">第 ${state.currentIndex + 1} / ${state.questions.length} 题</div>

        <div class="question-card">
          <div class="question-word">${q.word}</div>
          <div class="question-phonetic">${q.phonetic || ''}</div>
          <div class="question-hint">请选择正确的释义</div>
        </div>

        <div class="options-list" id="optionsList">
          ${q.options.map((opt, i) => `
            <div class="option-item" onclick="App.selectAnswer(${i})">
              <div class="option-label">${['A','B','C','D'][i]}</div>
              <div class="option-text">${opt.text}</div>
            </div>
          `).join('')}
        </div>

        <div id="tipArea"></div>
        <div id="bottomBar"></div>
      </div>
    `
  },

  selectAnswer(index) {
    const state = this.quizState
    const q = state.questions[state.currentIndex]
    const selected = q.options[index]
    const isCorrect = selected.isCorrect

    const items = document.querySelectorAll('.option-item')
    items.forEach((item, i) => {
      item.onclick = null
      if (i === index) {
        item.classList.add(isCorrect ? 'selected-correct' : 'selected-wrong')
        const icon = document.createElement('div')
        icon.className = 'option-icon ' + (isCorrect ? 'correct' : 'wrong')
        icon.textContent = isCorrect ? '\u2713' : '\u2717'
        item.appendChild(icon)
      } else if (q.options[i].isCorrect) {
        item.classList.add('show-correct')
        const icon = document.createElement('div')
        icon.className = 'option-icon correct'
        icon.textContent = '\u2713'
        item.appendChild(icon)
      }
    })

    Storage.addQuizRecord({
      word: q.word,
      issue: q.issue,
      isCorrect: isCorrect
    })

    if (!isCorrect) {
      Storage.addWrongQuestion({
        word: q.word,
        issue: q.issue,
        definition_cn: q.definition_cn,
        example_en: q.example_en,
        example_cn: q.example_cn,
        memory_tip: q.memory_tip
      })
      state.wrongWords.push(q)
    } else {
      state.correctCount++
    }

    if (q.memory_tip) {
      document.getElementById('tipArea').innerHTML = `
        <div class="tip-card">
          <div class="tip-title">&#128161; 记忆提示</div>
          <div class="tip-content">${q.memory_tip}</div>
        </div>
      `
    }

    const isLast = state.currentIndex === state.questions.length - 1
    document.getElementById('bottomBar').innerHTML = isCorrect ? `
      ${q.example_en ? `
        <div class="card" style="margin-bottom:12px;background:#f0fff4;">
          <div style="font-size:13px;color:#38b2ac;margin-bottom:4px;">&#128214; 例句</div>
          <div style="font-size:14px;color:#2d3748;">${q.example_en}</div>
          ${q.example_cn ? `<div style="font-size:13px;color:#718096;margin-top:4px;">${q.example_cn}</div>` : ''}
        </div>
      ` : ''}
      <button class="btn btn-primary" onclick="App.nextQuestion()">${isLast ? '查看结果' : '下一题'}</button>
    ` : `
      <div class="card" style="margin-bottom:12px;background:#fff5f5;">
        <div style="font-size:13px;color:#fc8181;margin-bottom:4px;">&#128214; 正确释义</div>
        <div style="font-size:15px;font-weight:500;color:#2d3748;">${q.definition_cn}</div>
        ${q.example_en ? `
          <div style="margin-top:8px;padding-top:8px;border-top:1px solid #fed7d7;">
            <div style="font-size:13px;color:#718096;">${q.example_en}</div>
            ${q.example_cn ? `<div style="font-size:12px;color:#a0aec0;margin-top:2px;">${q.example_cn}</div>` : ''}
          </div>
        ` : ''}
      </div>
      <button class="btn btn-primary" onclick="App.nextQuestion()">${isLast ? '查看结果' : '下一题'}</button>
    `
  },

  nextQuestion() {
    const state = this.quizState
    state.currentIndex++
    if (state.currentIndex >= state.questions.length) {
      this.renderResult()
    } else {
      this.renderQuiz()
    }
  },

  // ===== 结果页 =====
  renderResult() {
    if (!this.quizState) {
      this.renderHome()
      return
    }

    const state = this.quizState
    const correct = state.correctCount
    const total = state.questions.length
    const percent = Math.round((correct / total) * 100)
    const wrongWords = state.wrongWords

    let scoreClass = 'poor'
    let comment = ''

    if (percent >= 90) {
      scoreClass = 'excellent'
      comment = '太棒了！你已经熟练掌握了这些FTTH工程英语词汇，继续保持！'
    } else if (percent >= 70) {
      scoreClass = 'good'
      comment = '不错！基础扎实，再多练几轮就能完全掌握了。'
    } else if (percent >= 50) {
      scoreClass = 'average'
      comment = '继续努力！建议多复习错题，巩固薄弱词汇。'
    } else {
      scoreClass = 'poor'
      comment = '别灰心！FTTH专业词汇需要反复记忆，多练习一定能进步。'
    }

    // 提交成绩到后端
    if (Auth.currentUser) {
      Auth.submitScore(correct, total, state.questions[0]?.issue || '', null);
    }

    document.getElementById('app').innerHTML = `
      <div class="page">
        <div class="result-score">
          <div class="score-circle ${scoreClass}">${percent}</div>
          <div class="score-text">${correct} / ${total} 题正确</div>
          <div class="score-detail">正确率 ${percent}%</div>
        </div>

        <div class="comment-card">
          <div class="comment-text">${comment}</div>
        </div>

        ${wrongWords.length > 0 ? `
          <div class="wrong-section-title">&#128221; 错题回顾（${wrongWords.length}题）</div>
          ${wrongWords.map(w => `
            <div class="wrong-item-card">
              <div class="wrong-item-word">${w.word}</div>
              <div class="wrong-item-def">${w.definition_cn}</div>
              ${w.example_en ? `
                <div class="wrong-item-example">
                  ${w.example_en}
                  ${w.example_cn ? '<br>' + w.example_cn : ''}
                </div>
              ` : ''}
              ${w.memory_tip ? `<div class="wrong-item-tip">&#128161; ${w.memory_tip}</div>` : ''}
            </div>
          `).join('')}
        ` : `
          <div class="card" style="text-align:center;padding:24px;">
            <div style="font-size:36px;margin-bottom:8px;">&#127881;</div>
            <div style="font-size:15px;font-weight:600;color:#38b2ac;">全对！太厉害了！</div>
          </div>
        `}

        <div style="margin-top:16px;">
          <button class="btn btn-primary btn-block" onclick="App.startQuiz('random')">再来一轮</button>
          <button class="btn btn-secondary btn-block" onclick="App.renderWrong()">查看错题本</button>
          <button class="btn btn-secondary btn-block" onclick="App.renderHome()">返回首页</button>
        </div>

        <div class="bottom-space"></div>
      </div>
    `
  },

  // ===== 错题本页 =====
  renderWrong() {
    const wrongList = Storage.getWrongQuestions()

    document.getElementById('app').innerHTML = `
      <div class="page">
        <div class="page-header">
          <div class="page-title">&#128221; 错题本</div>
          <div class="page-subtitle">巩固薄弱点，提升正确率</div>
        </div>

        ${wrongList.length > 0 ? `
          <div class="stats-row">
            <div class="stat-card">
              <div class="stat-num danger">${wrongList.length}</div>
              <div class="stat-label">错题总数</div>
            </div>
            <div class="stat-card">
              <div class="stat-num">${wrongList.filter(w => (w.wrongCount || 1) >= 2).length}</div>
              <div class="stat-label">多次错误</div>
            </div>
          </div>

          <div style="margin-top:16px;">
            <button class="btn btn-primary btn-block" onclick="App.startQuiz('wrong')">
              开始错题重练（${wrongList.length}题）
            </button>
            <button class="btn btn-danger btn-block" onclick="App.clearWrong()">清空错题本</button>
          </div>

          <div class="wrong-section-title" style="margin-top:20px;">&#128203; 错题列表</div>
          ${wrongList.map(w => `
            <div class="wrong-item-card">
              <div class="wrong-item-word">${w.word}</div>
              <div class="wrong-item-def">${w.definition_cn || ''}</div>
              <div style="display:flex;gap:12px;margin-top:4px;">
                ${w.issue ? `<span style="font-size:12px;color:#a0aec0;">第${w.issue}期</span>` : ''}
                <span style="font-size:12px;color:#fc8181;">错误${w.wrongCount || 1}次</span>
              </div>
              ${w.example_en ? `
                <div class="wrong-item-example">
                  ${w.example_en}
                  ${w.example_cn ? '<br>' + w.example_cn : ''}
                </div>
              ` : ''}
              ${w.memory_tip ? `<div class="wrong-item-tip">&#128161; ${w.memory_tip}</div>` : ''}
            </div>
          `).join('')}
        ` : `
          <div class="empty-state">
            <div class="empty-icon">&#9989;</div>
            <div class="empty-text">暂无错题</div>
            <div class="empty-hint">答错的题目会自动添加到这里</div>
          </div>
          <div style="margin-top:20px;">
            <button class="btn btn-primary" onclick="App.renderHome()">去答题</button>
          </div>
        `}

        <div class="bottom-space"></div>
      </div>

      <div class="tab-bar">
        <div class="tab-item" onclick="App.renderHome()">
          <div class="tab-icon">&#127968;</div>
          <div class="tab-label">首页</div>
        </div>
        <div class="tab-item active" onclick="App.renderWrong()">
          <div class="tab-icon">&#128221;</div>
          <div class="tab-label">错题本</div>
        </div>
      </div>
    `
  },

  clearWrong() {
    if (confirm('确定要清空错题本吗？此操作不可恢复。')) {
      Storage.clearWrongQuestions()
      this.renderWrong()
    }
  }
};

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.init()) {
    App.showLogin();
  } else {
    App.renderHome();
  }
});
