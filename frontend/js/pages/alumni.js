/* Alumni Dashboard */
const pages_alumni = {
  section: 'overview',
  render(container) {
    const user = auth.getUser();
    container.innerHTML = `
      <div class="app-layout">
        ${components.buildSidebar(user, 'overview')}
        <div class="main-content">
          ${components.buildTopbar('Alumni Portal')}
          <div class="page-content fade-in" id="section-content" style="padding: 32px;"></div>
        </div>
      </div>
      ${components.buildChatbot()}`;
    this.showSection('overview');
    currentDashboard = this;
    components.loadNotifCount();
    components.applySidebarState();
  },
  showSection(sec) {
    this.section = sec;
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const navLabelMap = { overview: 'dashboard', referrals: 'referrals', mentorship: 'mentorship', notifications: 'notifications', profile: 'profile' };
    document.querySelectorAll('.nav-item').forEach(el => { if (el.textContent.toLowerCase().includes(navLabelMap[sec] || sec)) el.classList.add('active'); });

    const titles = { overview: 'Alumni Overview', referrals: 'Referral Management', mentorship: 'Mentorship Schedule', notifications: 'Service Alerts', profile: 'Alumni Profile' };
    document.querySelector('.topbar-title').textContent = titles[sec] || 'Alumni Portal';

    const c = document.getElementById('section-content');
    if (c) {
      c.innerHTML = '<div style="text-align:center;padding:100px 0"><div class="loader-spinner" style="margin:auto"></div></div>';
      switch (sec) {
        case 'overview': this.renderOverview(c); break;
        case 'referrals': this.renderReferrals(c); break;
        case 'mentorship': this.renderMentorship(c); break;
        case 'notifications': this.renderNotifs(c); break;
        case 'profile': this.renderProfile(c); break;
      }
    }
  },
  async renderOverview(c) {
    try {
      const [refs, slots] = await Promise.all([api.alumni.referrals(), api.alumni.mentorship()]);
      const myRefs = refs.filter(r => r.alumni_id === auth.getUser()?.id);
      const activeSlots = slots.filter(s => s.alumni_id === auth.getUser()?.id && !s.is_booked);

      c.innerHTML = `
        <div style="margin-bottom:32px">
          <h2>Welcome Back, Member 🌟</h2>
          <p>Your contribution helps students shape their corporate careers.</p>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:8px">Active Referrals</div>
            <div class="stat-value" style="color:var(--primary)">${myRefs.length}</div>
          </div>
          <div class="stat-card">
            <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:8px">Available Mentorship Slots</div>
            <div class="stat-value" style="color:var(--success)">${activeSlots.length}</div>
          </div>
          <div class="stat-card">
            <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:8px">Students Impacted</div>
            <div class="stat-value" style="color:var(--accent)">12</div>
            <div style="margin-top:12px;color:var(--text-muted);font-size:0.75rem">Based on your activity</div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns: 1fr 1fr; gap:24px; margin-top:24px;">
           <div class="card">
             <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
               <h3>Active Referrals</h3>
               <button class="btn btn-secondary btn-sm" onclick="currentDashboard.showSection('referrals')">Manage</button>
             </div>
             ${myRefs.length === 0 ? '<p style="text-align:center;padding:20px;color:var(--text-muted)">No active referrals.</p>' :
          myRefs.slice(0, 3).map(r => `
               <div style="padding:12px 0; border-bottom:1px solid #f1f5f9;">
                 <div style="font-weight:600">${r.title}</div>
                 <div style="font-size:0.8rem;color:var(--text-muted)">${r.company}</div>
               </div>`).join('')}
           </div>
           <div class="card">
             <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
               <h3>Upcoming Mentorships</h3>
               <button class="btn btn-secondary btn-sm" onclick="currentDashboard.showSection('mentorship')">Calendar</button>
             </div>
             ${activeSlots.length === 0 ? '<p style="text-align:center;padding:20px;color:var(--text-muted)">No booked sessions.</p>' :
          activeSlots.slice(0, 3).map(s => `
               <div style="padding:12px 0; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center;">
                 <div>
                   <div style="font-weight:600">${s.topic}</div>
                   <div style="font-size:0.75rem;color:var(--text-muted)">${components.formatDateTime(s.slot_date)}</div>
                 </div>
                 <span class="tag-chip" style="background:#f0f9ff;color:var(--primary)">${s.duration_minutes}m</span>
               </div>`).join('')}
           </div>
        </div>`;
    } catch (err) { c.innerHTML = `<div class="alert alert-error">${err.message}</div>`; }
  },
  async renderReferrals(c) {
    c.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:32px;flex-wrap:wrap;gap:16px">
        <div><h2>Manage Job Referrals</h2><p>Post openings at your current organization for students.</p></div>
        <div style="display:flex;gap:12px">
          <input type="search" class="page-filter" placeholder="Search positions..." 
            oninput="window._currentMatchSearch = this.value; pages_alumni._filterReferrals()" 
            value="${window._currentMatchSearch || ''}"
            style="padding:10px 16px;border-radius:12px;border:1px solid #e2e8f0;width:240px;font-size:0.875rem">
          <button class="btn btn-primary" onclick="pages_alumni.showReferralModal()">+ Post Referral</button>
        </div>
      </div>
      <div id="alumni-refs-list"></div>`;
    this._loadReferrals();
  },
  async _loadReferrals() {
    const list = document.getElementById('alumni-refs-list');
    try {
      const refs = await api.alumni.referrals();
      window._allAlumniRefs = refs;
      this._filterReferrals();
    } catch (err) { if (list) list.innerHTML = `<div class="alert alert-error">${err.message}</div>`; }
  },
  _filterReferrals() {
    const list = document.getElementById('alumni-refs-list');
    if (!list) return;
    const search = (window._currentMatchSearch || '').toLowerCase();
    const myId = auth.getUser()?.id;
    const filtered = (window._allAlumniRefs || []).filter(r =>
      r.alumni_id === myId &&
      (r.title.toLowerCase().includes(search) || r.company.toLowerCase().includes(search))
    );

    list.innerHTML = filtered.length === 0 ? '<div class="card" style="grid-column:1/-1;text-align:center;padding:60px;"><h3>No matching referrals found</h3></div>' : `
      <div class="grid-2">
        ${filtered.map(r => `
          <div class="card" style="display:flex;flex-direction:column;gap:12px">
            <div style="display:flex;justify-content:space-between;align-items:start">
              <h3 style="color:var(--primary)">${r.title}</h3>
              <span class="badge ${r.is_active ? 'badge-selected' : 'badge-rejected'}">${r.is_active ? 'Active' : 'Closed'}</span>
            </div>
            <div style="font-weight:700;font-size:0.9rem">${r.company}</div>
            <p style="font-size:0.875rem;color:var(--text-muted)">${r.description}</p>
            <div style="margin-top:auto;padding-top:12px;display:flex;gap:12px;">
              <button class="btn btn-secondary btn-sm" style="flex:1" onclick="pages_alumni.toggleReferral(${r.id}, ${!r.is_active})">${r.is_active ? 'Close' : 'Reopen'}</button>
              <button class="btn btn-danger btn-sm" onclick="pages_alumni.deleteReferral(${r.id})">Delete</button>
            </div>
          </div>`).join('')}
      </div>`;
  },
  async showReferralModal() {
    const html = `
      <div style="margin-top:20px">
        <div class="form-group"><label class="form-label">Position Title</label><input id="r-title" class="form-control" placeholder="e.g. SDE-1 @ Microsoft" /></div>
        <div class="form-group"><label class="form-label">Company</label><input id="r-company" class="form-control" placeholder="e.g. Microsoft India" /></div>
        <div class="form-group"><label class="form-label">Job Role / Dept</label><input id="r-role" class="form-control" /></div>
        <div class="form-group"><label class="form-label">Description / Requirements</label><textarea id="r-desc" class="form-control" style="height:100px"></textarea></div>
        <div class="form-group"><label class="form-label">Application Link / Instructions</label><input id="r-link" class="form-control" /></div>
        <div class="form-group"><label class="form-label">Key Skills (Comma separated)</label><input id="r-skills" class="form-control" /></div>
      </div>`;
    components.modal('Post Job Referral', html, async () => {
      const data = {
        title: document.getElementById('r-title').value,
        company: document.getElementById('r-company').value,
        job_role: document.getElementById('r-role').value,
        description: document.getElementById('r-desc').value,
        apply_link: document.getElementById('r-link').value,
        skills_required: document.getElementById('r-skills').value.split(',').map(s => s.trim()).filter(Boolean)
      };
      try {
        await api.alumni.createReferral(data);
        components.showToast('Referral posted!');
        document.querySelector('.modal-overlay').remove();
        this.renderReferrals(document.getElementById('section-content'));
      } catch (err) { components.showToast(err.message, 'error'); }
    });
  },
  async toggleReferral(id, active) {
    try { await api.alumni.updateReferral(id, { is_active: active }); components.showToast('Status updated!'); this.renderReferrals(document.getElementById('section-content')); }
    catch (err) { components.showToast(err.message, 'error'); }
  },
  async deleteReferral(id) {
    if (!confirm('Delete this referral?')) return;
    try { await api.alumni.deleteReferral(id); components.showToast('Referral deleted!'); this.renderReferrals(document.getElementById('section-content')); }
    catch (err) { components.showToast(err.message, 'error'); }
  },
  async renderMentorship(c) {
    try {
      const mySlots = await api.alumni.mySlots();
      c.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:32px">
          <div><h2>Mentorship Sessions</h2><p>Manage your availability and connect with students.</p></div>
          <button class="btn btn-primary" onclick="pages_alumni.showSlotModal()">+ Create New Slot</button>
        </div>
        <div class="table-wrapper">
          <table>
            <thead><tr><th>Topic</th><th>Date & Time</th><th>Status</th><th>Participant Details</th><th>Action</th></tr></thead>
            <tbody>${mySlots.map(s => `
              <tr>
                <td style="font-weight:600">${s.topic}</td>
                <td style="font-size:0.875rem">${components.formatDateTime(s.slot_date)}</td>
                <td>${s.student_id ? '<span class="badge badge-selected">Booked</span>' : '<span class="tag-chip">Available</span>'}</td>
                <td>
                  ${s.other_name ? `
                    <div style="font-weight:600">${s.other_name}</div>
                    <div style="font-size:0.75rem;color:var(--text-muted)">${s.other_branch || 'N/A'} | ${s.other_email}</div>
                  ` : '<span style="color:var(--text-muted);font-style:italic">Waiting...</span>'}
                </td>
                <td><button class="btn btn-danger btn-sm" onclick="pages_alumni.deleteSlot(${s.id})">Delete</button></td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>`;
    } catch (err) { c.innerHTML = `<div class="alert alert-error">${err.message}</div>`; }
  },
  async showSlotModal() {
    const html = `<div style="margin-top:20px">
      <div class="form-group"><label class="form-label">Mentorship Topic</label><input id="s-topic" class="form-control" placeholder="e.g. Preparing for SDE Interviews" /></div>
      <div class="form-group"><label class="form-label">Date & Time</label><input type="datetime-local" id="s-date" class="form-control" /></div>
      <div class="form-group"><label class="form-label">Duration (minutes)</label><input type="number" id="s-dur" class="form-control" value="30" /></div>
    </div>`;
    components.modal('Create Mentorship Slot', html, async () => {
      const data = {
        topic: document.getElementById('s-topic').value,
        slot_date: document.getElementById('s-date').value,
        duration_minutes: parseInt(document.getElementById('s-dur').value)
      };
      try {
        await api.alumni.createSlot(data);
        components.showToast('Slot created!');
        document.querySelector('.modal-overlay').remove();
        this.renderMentorship(document.getElementById('section-content'));
      } catch (err) { components.showToast(err.message, 'error'); }
    });
  },
  async deleteSlot(id) {
    if (!confirm('Delete this slot?')) return;
    try { await api.alumni.deleteSlot(id); components.showToast('Slot removed!'); this.renderMentorship(document.getElementById('section-content')); }
    catch (err) { components.showToast(err.message, 'error'); }
  },
  async renderNotifs(c) {
    try {
      const notifs = await api.notifications.all();
      await api.notifications.markAllRead();
      components.loadNotifCount();
      c.innerHTML = `
        <div style="margin-bottom:24px"><h2>System Notifications</h2></div>
        <div style="display:flex;flex-direction:column;gap:12px">
          ${notifs.length === 0 ? '<p style="text-align:center;padding:40px;color:var(--text-muted);">No new notifications.</p>' :
          notifs.map(n => `
            <div class="card" style="padding:16px 20px; border-radius:12px; ${!n.is_read ? 'background:#f0f7ff;border-color:#bfdbfe;' : ''}">
              <div style="display:flex;justify-content:space-between;align-items:start">
                <div>
                  <div style="font-weight:700;margin-bottom:4px;color:var(--text)">${n.title}</div>
                  <div style="font-size:0.875rem;color:var(--text-muted)">${n.message}</div>
                </div>
                <div style="font-size:0.75rem;color:var(--text-muted);white-space:nowrap">${components.relativeTime(n.created_at)}</div>
              </div>
            </div>`).join('')}
        </div>`;
    } catch (err) { c.innerHTML = `<div class="alert alert-error">${err.message}</div>`; }
  },
  async renderProfile(c) {
    try {
      const data = await api.auth.profile();
      const initial = data.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

      c.innerHTML = `
        <div style="max-width: 800px; margin: 0 auto;">
          <div class="card" style="margin-bottom: 24px; background: linear-gradient(135deg, #6366f1, #a855f7); color: white; border: none; padding: 40px; display: flex; align-items: center; gap: 32px;">
            <div style="width: 100px; height: 100px; background: rgba(255,255,255,0.2); border: 4px solid rgba(255,255,255,0.4); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: 800; backdrop-filter: blur(10px);">${initial}</div>
            <div>
              <h2 style="color: white; font-size: 2rem; margin-bottom: 4px;">${data.name}</h2>
              <p style="color: rgba(255,255,255,0.9); font-size: 1.125rem;">Alumni • ${data.company || 'Company Not Set'}</p>
              <div style="margin-top: 16px; display: flex; gap: 8px;">
                <span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">Graduation: ${data.graduation_year || 'N/A'}</span>
                <span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">Mentor Level: Pro</span>
              </div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr; gap: 24px;">
            <div class="card" style="background: var(--glass); backdrop-filter: blur(10px);">
              <h3 style="margin-bottom: 24px; display: flex; align-items: center; gap: 12px;">💼 Professional Details</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div class="form-group"><label class="form-label">Full Name</label><input type="text" id="prof-name" class="form-control" value="${data.name}" placeholder="Your Full Name" /></div>
                <div class="form-group"><label class="form-label">Email</label><input type="email" id="prof-email" class="form-control" value="${data.email}" readonly style="background:#f8fafc" /></div>
                <div class="form-group"><label class="form-label">Current Company</label><input type="text" id="prof-company" class="form-control" value="${data.company || ''}" placeholder="e.g. Google, Microsoft" /></div>
                <div class="form-group"><label class="form-label">Job Role</label><input type="text" id="prof-role" class="form-control" value="${data.job_role || ''}" placeholder="e.g. Senior Software Engineer" /></div>
              </div>
            </div>

            <div class="card" style="background: var(--glass); backdrop-filter: blur(10px);">
              <h3 style="margin-bottom: 24px; display: flex; align-items: center; gap: 12px;">🎓 Academic Background</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div class="form-group"><label class="form-label">Graduation Year</label><input type="number" id="prof-grad-year" class="form-control" value="${data.graduation_year || ''}" /></div>
                <div class="form-group"><label class="form-label">LinkedIn URL</label><input type="text" id="prof-li" class="form-control" value="${data.linkedin || ''}" placeholder="linkedin.com/in/..." /></div>
              </div>
              <div class="form-group" style="margin-top: 20px;"><label class="form-label">Bio / Mentorship Focus</label><textarea id="prof-bio" class="form-control" style="height: 100px;" placeholder="I can help with resume reviews, system design...">${data.bio || ''}</textarea></div>
            </div>

            <div style="text-align: right; margin-top: 8px; margin-bottom: 40px;">
              <button class="btn btn-primary lg" id="save-profile-btn" onclick="pages_alumni.handleProfileUpdate()" style="min-width: 200px; box-shadow: var(--shadow-lg);">✨ Save Alumni Profile</button>
            </div>
          </div>
        </div>
      `;
    } catch (err) { c.innerHTML = `<div class="alert alert-error">${err.message}</div>`; }
  },

  async handleProfileUpdate() {
    const btn = document.getElementById('save-profile-btn');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = 'Saving...';

    const payload = {
      name: document.getElementById('prof-name').value,
      company: document.getElementById('prof-company').value,
      job_role: document.getElementById('prof-role').value,
      graduation_year: parseInt(document.getElementById('prof-grad-year').value) || null,
      linkedin: document.getElementById('prof-li').value,
      bio: document.getElementById('prof-bio').value
    };

    try {
      const response = await api.auth.updateProfile(payload);

      if (response.user) {
        auth.setUser(response.user);
        const sidebar = document.querySelector('.sidebar');
        const topbarTitle = document.querySelector('.topbar-title');
        if (sidebar) sidebar.outerHTML = components.buildSidebar(auth.getUser(), 'profile');
        if (topbarTitle) topbarTitle.textContent = 'Alumni Profile';
      }

      btn.innerHTML = 'Saved! ✅';
      btn.style.background = 'var(--success)';
      components.showToast('Alumni Profile updated! ✨');

      setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = originalText;
        btn.style.background = '';
      }, 2000);

    } catch (err) {
      components.showToast(err.message, 'error');
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  }
};
