/* Shared UI components - Refactored for Light Theme */
const components = {
  showToast(msg, type = 'success') {
    const t = document.createElement('div');
    const bg = type === 'error' ? '#fee2e2' : '#dcfce7';
    const border = type === 'error' ? '#ef4444' : '#10b981';
    const color = type === 'error' ? '#991b1b' : '#065f46';
    t.style.cssText = `position:fixed;bottom:32px;left:50%;transform:translateX(-50%) translateY(20px);background:${bg};border:1px solid ${border};color:${color};padding:12px 24px;border-radius:12px;font-size:0.875rem;font-weight:600;z-index:9999;transition:all 0.3s;opacity:0;box-shadow:var(--shadow-lg);`;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(0)'; }, 10);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3000);
  },
  confirmDialog(msg) { return window.confirm(msg); },
  formatDate(d) { if (!d) return '—'; return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); },
  formatDateTime(d) { if (!d) return '—'; return new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); },
  relativeTime(d) {
    if (!d) return '';
    const diff = Date.now() - new Date(d);
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now'; if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  },
  statusBadge(s) {
    const map = { 'Applied': 'applied', 'Aptitude': 'aptitude', 'Cleared': 'cleared', 'Interview Scheduled': 'interview', 'Selected': 'selected', 'Rejected': 'rejected', 'Active': 'active', 'Inactive': 'inactive' };
    return `<span class="badge badge-${map[s] || 'applied'}">${s}</span>`;
  },
  buildSidebar(user, activeSection) {
    const tpoNav = [
      { icon: '📊', label: 'Dashboard', page: 'overview' },
      { icon: '🏢', label: 'Drives', page: 'drives' },
      { icon: '📋', label: 'Applications', page: 'applications' },
      { icon: '📅', label: 'Scheduler', page: 'scheduler' },
      { icon: '📈', label: 'Analytics', page: 'analytics' },
      { icon: '🤖', label: 'Bot FAQs', page: 'faqs' },
      { icon: '🔔', label: 'Notifications', page: 'notifications' },
      { icon: '👤', label: 'My Profile', page: 'profile' },
    ];
    const studentNav = [
      { icon: '📊', label: 'Dashboard', page: 'overview' },
      { icon: '🏢', label: 'Eligible Drives', page: 'drives' },
      { icon: '📋', label: 'My Applications', page: 'applications' },
      { icon: '🚀', label: 'AI Advisor', page: 'advisor' },
      { icon: '📄', label: 'Resume Wizard', page: 'resume' },
      { icon: '📈', label: 'Skill Gap', page: 'analytics' },
      { icon: '🎓', label: 'Alumni Connect', page: 'alumni' },
      { icon: '📅', label: 'My Interviews', page: 'scheduler' },
      { icon: '🔔', label: 'Notifications', page: 'notifications' },
      { icon: '👤', label: 'My Profile', page: 'profile' },
    ];
    const alumniNav = [
      { icon: '📊', label: 'Dashboard', page: 'overview' },
      { icon: '💼', label: 'My Referrals', page: 'referrals' },
      { icon: '🎯', label: 'Mentorship', page: 'mentorship' },
      { icon: '🔔', label: 'Notifications', page: 'notifications' },
      { icon: '👤', label: 'My Profile', page: 'profile' },
    ];
    const nav = user.role === 'tpo' ? tpoNav : user.role === 'alumni' ? alumniNav : studentNav;
    const navItems = nav.map(n => {
      let badge = '';
      if (user.role === 'student' && n.page === 'drives' && window._eligibleCount > 0) {
        badge = `<span class="badge badge-error" style="margin-left:auto;font-size:0.65rem;padding:2px 6px;border-radius:10px">${window._eligibleCount}</span>`;
      }
      return `
      <button class="nav-item ${activeSection === n.page ? 'active' : ''}" onclick="currentDashboard.showSection('${n.page}')">
        <span class="nav-icon">${n.icon}</span>${n.label}${badge}
      </button>`;
    }).join('');
    const initial = user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const roleMap = { tpo: 'Higher TPO Portal', student: 'Student Portal', alumni: 'Alumni Portal' };
    return `
    <aside class="sidebar">
      <button class="sidebar-toggle" onclick="components.toggleSidebar()" title="Toggle Sidebar">
        <span style="font-size: 0.75rem;">❮</span>
      </button>
      <div class="sidebar-logo">
        <div style="background:var(--primary);color:white;width:32px;height:32px;display:flex;align-items:center;justify-content:center;border-radius:8px;font-weight:bold;font-size:18px">P</div>
        <h1>PlacementPro</h1>
      </div>
      <div style="padding:16px 24px;font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em">${roleMap[user.role] || 'Portal'}</div>
      <nav class="sidebar-nav">
        ${navItems}
      </nav>
      <div style="margin-top:auto;padding:16px;border-top:1px solid #f1f5f9;display:flex;align-items:center;gap:12px">
        <div style="width:36px;height:36px;background:#eff6ff;color:var(--primary);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:0.875rem">${user.name.includes('Account') ? 'SA' : initial}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:0.875rem;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${user.name.includes('Account') ? '<i>Anon Account</i>' : user.name}</div>
          ${user.name.includes('Account') ? '<button onclick="currentDashboard.showSection(\'profile\')" style="background:none;border:none;color:var(--primary);font-size:0.75rem;cursor:pointer;padding:0;font-weight:700">Complete Profile ⚡</button>' : '<button onclick="auth.logout()" style="background:none;border:none;color:var(--text-muted);font-size:0.75rem;cursor:pointer;padding:0">Sign out</button>'}
        </div>
        ${!user.name.includes('Account') ? '<button onclick="auth.logout()" style="background:none;border:none;font-size:1.1rem;cursor:pointer;padding:4px" title="Logout">🚪</button>' : ''}
      </div>
    </aside>`;
  },
  buildTopbar(title) {
    return `
    <header class="topbar">
      <div class="topbar-title">${title}</div>
      <div class="topbar-right" style="display:flex;align-items:center;gap:16px">
        <button class="btn btn-secondary" onclick="components.cleanPortal()" style="padding:6px 12px;font-size:0.75rem;display:flex;align-items:center;gap:6px">
          <span>🧹</span> Clean
        </button>
        <div style="position:relative">
          <button id="notif-btn" onclick="components.toggleNotifPanel()" style="background:none;border:none;font-size:20px;cursor:pointer;position:relative">🔔
            <span id="notif-count" style="display:none;position:absolute;top:-4px;right:-4px;background:var(--danger);color:white;font-size:0.6rem;width:16px;height:16px;border-radius:50%;align-items:center;justify-content:center;font-weight:bold;border:2px solid white">0</span>
          </button>
          <div class="notif-panel" id="notif-panel" style="display:none;right:0"></div>
        </div>
      </div>
    </header>`;
  },
  async cleanPortal() {
    try {
      // 1. Purge read notifications
      await api.notifications.purgeRead();
      // 2. Reset any search/filter inputs in the DOM
      const filters = document.querySelectorAll('.page-filter, input[type="search"]');
      filters.forEach(f => f.value = '');
      // 3. Clear transient window state if any
      window._currentMatchSearch = '';
      // 4. Reload the current section
      if (window.currentDashboard && window.currentDashboard.showSection) {
        const current = window.currentDashboard.section || 'overview';
        window.currentDashboard.showSection(current);
      }
      this.showToast('Portal cleaned and refreshed! ✨');
      this.loadNotifCount();
    } catch (err) {
      this.showToast('Clean failed: ' + err.message, 'error');
    }
  },
  cleanForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
      form.reset();
      const customInputs = form.querySelectorAll('.custom-input');
      customInputs.forEach(i => i.innerHTML = '');
    }
  },
  async loadNotifCount() {
    try {
      if (!auth.getUser()) return;
      const d = await api.notifications.unreadCount();
      const el = document.getElementById('notif-count');
      if (el) { el.textContent = d.count; el.style.display = d.count > 0 ? 'flex' : 'none'; }
    } catch { }
  },
  async loadEligibleCount() {
    try {
      const user = auth.getUser();
      if (!user || user.role !== 'student') return;
      const d = await api.drives.eligibleCount();
      window._eligibleCount = d.count;
      // Re-render sidebar if it exists to show badge
      const sidebar = document.querySelector('.sidebar');
      if (sidebar) {
        const activeSection = router.getCurrentPage?.() || 'overview';
        sidebar.outerHTML = this.buildSidebar(user, activeSection);
      }
    } catch { }
  },
  async toggleNotifPanel() {
    const panel = document.getElementById('notif-panel');
    if (!panel) return;
    if (panel.style.display === 'none') {
      panel.style.display = 'block';
      try {
        const notifs = await api.notifications.all();
        panel.innerHTML = notifs.length === 0 ? '<div style="padding:20px;text-align:center;color:var(--text-muted)">No notifications</div>' : `
          <div style="padding:12px 16px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #f1f5f9">
            <strong style="font-size:0.875rem">Recent Notifications</strong>
            <button onclick="components.markAllReadPanel()" style="background:none;border:none;color:var(--primary);font-size:0.75rem;cursor:pointer;font-weight:600">Mark all read</button>
          </div>` +
          notifs.slice(0, 8).map(n => `
            <div class="notif-item ${!n.is_read ? 'unread' : ''}" onclick="api.notifications.markRead(${n.id}).then(()=>components.loadNotifCount())" style="cursor:pointer;padding:12px 16px;border-bottom:1px solid #f8fafc">
              <div style="font-weight:600;font-size:0.825rem;color:var(--text);margin-bottom:4px">${n.title}</div>
              <div style="font-size:0.75rem;color:var(--text-muted);line-height:1.4">${n.message}</div>
              <div style="font-size:0.7rem;color:var(--text-muted);margin-top:4px">${components.relativeTime(n.created_at)}</div>
            </div>`).join('');
      } catch { panel.innerHTML = '<div style="padding:20px;text-align:center;color:var(--danger)">Failed to load notifications</div>'; }
    } else { panel.style.display = 'none'; }
  },
  async markAllReadPanel() {
    await api.notifications.markAllRead();
    document.getElementById('notif-panel').style.display = 'none';
    components.loadNotifCount();
  },
  toggleSidebar() {
    const layout = document.querySelector('.app-layout');
    if (!layout) return;
    const isCollapsed = layout.classList.toggle('sidebar-collapsed');
    localStorage.setItem('sidebar-collapsed', isCollapsed);
  },
  applySidebarState() {
    const layout = document.querySelector('.app-layout');
    if (!layout) return;
    const isCollapsed = localStorage.getItem('sidebar-collapsed') === 'true';
    if (isCollapsed) layout.classList.add('sidebar-collapsed');
  },
  buildChatbot() {
    return `
    <button class="chatbot-fab" id="chatbot-fab" onclick="components.toggleChatbot()" title="PlacementBot">💬</button>
    <div class="chatbot-window" id="chatbot-win" style="display:none">
      <div class="chatbot-header">
        <div><h4 style="font-size:1rem;font-weight:700">Placement Assistant</h4><p style="font-size:0.75rem;opacity:0.9">Online to help you</p></div>
        <button onclick="components.toggleChatbot()" style="background:none;border:none;color:white;font-size:1.25rem;cursor:pointer">✕</button>
      </div>
      <div id="chatbot-msgs" style="flex:1;padding:16px;overflow-y:auto;background:#f8fafc;display:flex;flex-direction:column;gap:12px">
        <div style="display:flex;gap:10px;align-items:flex-end">
          <div style="width:28px;height:28px;background:var(--primary);color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">🤖</div>
          <div style="background:white;padding:10px 14px;border-radius:12px 12px 12px 0;box-shadow:var(--shadow-sm);font-size:0.875rem;max-width:80%;color:var(--text)">👋 Hi! I'm your Placement Assistant. How can I help you today?</div>
        </div>
      </div>
      <div style="padding:16px;border-top:1px solid #e2e8f0;display:flex;gap:8px;background:white">
        <input type="text" id="chatbot-input" placeholder="Ask a question..." style="flex:1;border:1px solid #cbd5e1;border-radius:8px;padding:8px 12px;font-size:0.875rem" onkeydown="if(event.key==='Enter')components.sendChat()" />
        <button onclick="components.sendChat()" style="background:var(--primary);color:white;border:none;border-radius:8px;width:36px;height:36px;cursor:pointer;display:flex;align-items:center;justify-content:center">➤</button>
      </div>
    </div>`;
  },
  toggleChatbot() {
    const w = document.getElementById('chatbot-win');
    if (w) w.style.display = w.style.display === 'none' ? 'flex' : 'none';
  },
  async sendChat() {
    const inp = document.getElementById('chatbot-input');
    const msgs = document.getElementById('chatbot-msgs');
    if (!inp || !msgs || !inp.value.trim()) return;
    const msg = inp.value.trim();
    inp.value = '';
    msgs.innerHTML += `<div style="display:flex;justify-content:flex-end"><div style="background:var(--primary);color:white;padding:10px 14px;border-radius:12px 12px 0 12px;font-size:0.875rem;max-width:80%">${msg}</div></div>`;
    const botId = 'bot-' + Date.now();
    msgs.innerHTML += `<div id="${botId}" style="display:flex;gap:10px;align-items:flex-end">
          <div style="width:28px;height:28px;background:var(--primary);color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">🤖</div>
          <div style="background:white;padding:10px 14px;border-radius:12px 12px 12px 0;box-shadow:var(--shadow-sm);font-size:0.875rem;max-width:80%;color:var(--text)">⌛ Thinking...</div>
        </div>`;
    msgs.scrollTop = msgs.scrollHeight;
    try {
      const res = await api.bot.chat(msg);
      const botEl = document.getElementById(botId);
      if (botEl) botEl.querySelector('div:last-child').innerHTML = `${res.message}${res.escalated ? ' 🚨 <em style="color:var(--danger)"> — Escalated to TPO</em>' : ''}`;
    } catch {
      const botEl = document.getElementById(botId);
      if (botEl) botEl.querySelector('div:last-child').innerHTML = '<span style="color:var(--danger)">Connection error. Please try again.</span>';
    }
    msgs.scrollTop = msgs.scrollHeight;
  },
  createTagInput(containerId, initial = []) {
    const wrap = document.getElementById(containerId);
    if (!wrap) return;
    if (!window._tagData) window._tagData = {};
    window._tagData[containerId] = [...initial];

    const render = () => {
      const tags = window._tagData[containerId];
      wrap.innerHTML = tags.map((t, i) => `
        <span class="tag-chip" style="background:#eff6ff; border:1px solid #bfdbfe; color:var(--primary); font-weight:600; padding:4px 10px; border-radius:8px; display:inline-flex; align-items:center; gap:6px; margin:2px;">
          ${t}
          <button onclick="window._tagData['${containerId}'].splice(${i},1); components.createTagInput('${containerId}', window._tagData['${containerId}'])" style="background:none; border:none; padding:0; cursor:pointer; font-size:16px; line-height:1; color:#94a3b8;">&times;</button>
        </span>`).join('')
        + `<input class="form-control" placeholder="Type & Enter" style="width:auto; display:inline-block; border:none; box-shadow:none; padding:8px 12px; font-size:0.875rem;" onkeydown="if(event.key==='Enter'||event.key===','){event.preventDefault(); const v=this.value.trim(); if(v && !window._tagData['${containerId}'].includes(v)){ window._tagData['${containerId}'].push(v); components.createTagInput('${containerId}', window._tagData['${containerId}']); }}" />`;
    };
    render();
    wrap._getTags = () => window._tagData[containerId];
    return { getTags: () => window._tagData[containerId] };
  },
  skillBar(label, pct, color = 'var(--primary)') {
    return `<div style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:0.875rem"><span>${label}</span><span style="color:${color};font-weight:700">${pct}%</span></div>
      <div style="height:8px;background:#f1f5f9;border-radius:4px;overflow:hidden"><div style="height:100%;width:${pct}%;background:${color};border-radius:4px"></div></div>
    </div>`;
  },
  progressRing(pct, size = 90, stroke = 8, color = 'var(--primary)') {
    const r = (size - stroke) / 2, circ = 2 * Math.PI * r;
    const dash = circ - (pct / 100) * circ;
    return `<div style="position:relative;width:${size}px;height:${size}px">
      <svg width="${size}" height="${size}">
        <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="#f1f5f9" stroke-width="${stroke}"/>
        <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-dasharray="${circ}" stroke-dashoffset="${dash}" stroke-linecap="round" transform="rotate(-90 ${size / 2} ${size / 2})"/>
      </svg>
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
        <div style="font-size:1.25rem;font-weight:700">${pct}%</div>
        <div style="font-size:0.65rem;color:var(--text-muted)">Match</div>
      </div>
    </div>`;
  },
  pipelineView(currentStatus) {
    const steps = ['Applied', 'Aptitude', 'Cleared', 'Interview', 'Selected'];
    const idx = steps.indexOf(currentStatus);
    return `<div style="display:flex;justify-content:space-between;position:relative;margin:20px 0;padding:20px 0">
      <div style="position:absolute;top:39px;left:0;right:0;height:2px;background:#f1f5f9;z-index:1"></div>
      ${steps.map((s, i) => `
        <div style="position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;flex:1">
          <div style="width:40px;height:40px;background:${i <= idx ? 'var(--primary)' : 'white'};color:${i <= idx ? 'white' : 'var(--text-muted)'};border:2px solid ${i <= idx ? 'var(--primary)' : '#e2e8f0'};border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;margin-bottom:8px;transition:0.3s">${i < idx ? '✓' : (i + 1)}</div>
          <div style="font-size:0.75rem;font-weight:${i === idx ? '700' : '500'};color:${i === idx ? 'var(--text)' : 'var(--text-muted)'};text-align:center">${s}</div>
        </div>
      `).join('')}
    </div>`;
  },
  modal(title, html, onSave) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay fade-in';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000;backdrop-filter:blur(4px);';
    overlay.innerHTML = `
      <div class="modal card slide-up" style="width:100%;max-width:650px;max-height:90vh;overflow-y:auto;background:white;padding:32px;position:relative;border:none;">
        <button onclick="this.closest('.modal-overlay').remove()" style="position:absolute;top:20px;right:20px;background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted)">✕</button>
        <h2 style="margin-bottom:8px">${title}</h2>
        <div style="margin-bottom:32px;color:var(--text-muted);font-size:0.9rem">${title.includes('Edit') ? 'Update existing details below.' : 'Fill in the information to proceed.'}</div>
        ${html}
        <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:32px">
          <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
          ${onSave ? `<button class="btn btn-primary lg" id="modal-save-btn">Save Changes</button>` : ''}
        </div>
      </div>`;
    document.body.appendChild(overlay);
    if (onSave) {
      document.getElementById('modal-save-btn').onclick = async () => {
        const btn = document.getElementById('modal-save-btn');
        btn.disabled = true;
        btn.textContent = 'Saving...';
        await onSave();
        btn.disabled = false;
        btn.textContent = 'Save Changes';
      };
    }
  }
};

// Close elements on outside click
document.addEventListener('click', (e) => {
  const panel = document.getElementById('notif-panel');
  const btn = document.getElementById('notif-btn');
  if (panel && btn && !btn.contains(e.target) && !panel.contains(e.target)) panel.style.display = 'none';
});
