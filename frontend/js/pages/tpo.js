/* TPO Dashboard */
const pages_tpo = {
  section: 'overview',
  render(container) {
    const user = auth.getUser();
    container.innerHTML = `
      <div class="app-layout">
        ${components.buildSidebar(user, 'overview')}
        <div class="main-content">
          ${components.buildTopbar('TPO Dashboard')}
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
    const navLabelMap = { overview: 'dashboard', drives: 'drives', applications: 'applications', scheduler: 'scheduler', analytics: 'analytics', faqs: 'faqs', notifications: 'notifications', profile: 'profile' };
    document.querySelectorAll('.nav-item').forEach(el => { if (el.textContent.toLowerCase().includes(navLabelMap[sec] || sec)) el.classList.add('active'); });

    const titles = { overview: 'Placement Overview', drives: 'Manage Drives', applications: 'All Applications', scheduler: 'Interview Scheduler', analytics: 'Placement Analytics', faqs: 'Bot FAQs', notifications: 'Service Notifs', profile: 'TPO Profile' };
    document.querySelector('.topbar-title').textContent = titles[sec] || 'TPO Portal';

    const c = document.getElementById('section-content');
    if (c) {
      c.innerHTML = '<div style="text-align:center;padding:100px 0"><div class="loader-spinner" style="margin:auto"></div></div>';
      switch (sec) {
        case 'overview': this.renderOverview(c); break;
        case 'drives': this.renderDrives(c); break;
        case 'applications': this.renderApplications(c); break;
        case 'scheduler': this.renderScheduler(c); break;
        case 'analytics': this.renderAnalytics(c); break;
        case 'faqs': this.renderFAQs(c); break;
        case 'notifications': this.renderNotifs(c); break;
        case 'profile': this.renderProfile(c); break;
      }
    }
  },
  async renderOverview(c) {
    try {
      const data = await api.analytics.overview();
      c.innerHTML = `
        <div style="margin-bottom:32px">
          <h2>Placement Intelligence Overview</h2>
          <p>Real-time analytics for current placement session 2025-26.</p>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:8px">Registered Students</div>
            <div class="stat-value">${data.total_students}</div>
          </div>
          <div class="stat-card">
            <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:8px">Active Drives</div>
            <div class="stat-value" style="color:var(--primary)">${data.active_drives}</div>
          </div>
          <div class="stat-card">
            <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:8px">Placed Students</div>
            <div class="stat-value" style="color:var(--success)">${data.placed_students} (${((data.placed_students / data.total_students) * 100).toFixed(1)}%)</div>
          </div>
          <div class="stat-card">
            <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:8px">Highest Package</div>
            <div class="stat-value" style="color:var(--accent)">₹${data.highest_package} LPA</div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns: 1fr 1fr; gap:24px; margin-top:24px;">
           <div class="card">
             <h3>Job Role Distribution</h3>
             <div style="margin-top:20px">
               ${Object.entries(data.drives_by_type || {}).map(([role, count]) => `
                 <div style="margin-bottom:16px">
                   <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:0.875rem"><span>${role}</span><strong>${count} Drives</strong></div>
                   <div style="height:6px;background:#f1f5f9;border-radius:3px;overflow:hidden"><div style="height:100%;width:${(count / data.active_drives) * 100}%;background:var(--primary)"></div></div>
                 </div>`).join('')}
             </div>
           </div>
           <div class="card">
             <h3>Salary Bracket Distribution</h3>
             <div style="margin-top:20px">
               ${Object.entries(data.salary_brackets || {}).map(([bracket, count]) => `
                 <div style="margin-bottom:16px">
                   <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:0.875rem"><span>${bracket} LPA</span><strong>${count} Students</strong></div>
                   <div style="height:6px;background:#f1f5f9;border-radius:3px;overflow:hidden"><div style="height:100%;width:${(count / data.placed_students) * 100}%;background:var(--success)"></div></div>
                 </div>`).join('')}
             </div>
           </div>
        </div>`;
    } catch (err) { c.innerHTML = `<div class="alert alert-error">${err.message}</div>`; }
  },
  async renderDrives(c) {
    c.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:32px;flex-wrap:wrap;gap:16px">
        <div><h2>Placement Drives</h2><p>Create and manage campus recruitment drives.</p></div>
        <div style="display:flex;gap:12px">
          <input type="search" class="page-filter" placeholder="Search drives..." 
            oninput="window._currentMatchSearch = this.value; pages_tpo._filterDrives()" 
            value="${window._currentMatchSearch || ''}"
            style="padding:10px 16px;border-radius:12px;border:1px solid #e2e8f0;width:240px;font-size:0.875rem">
          <button class="btn btn-primary" onclick="pages_tpo.showDriveModal()">+ Create New Drive</button>
        </div>
      </div>
      <div id="tpo-drives-list"></div>`;
    this._loadDrives();
  },
  async _loadDrives() {
    const list = document.getElementById('tpo-drives-list');
    try {
      const drives = await api.drives.all();
      window._allTpoDrives = drives;
      this._filterDrives();
    } catch (err) { if (list) list.innerHTML = `<div class="alert alert-error">${err.message}</div>`; }
  },
  _filterDrives() {
    const list = document.getElementById('tpo-drives-list');
    if (!list) return;
    const search = (window._currentMatchSearch || '').toLowerCase();
    const filtered = (window._allTpoDrives || []).filter(d =>
      d.company_name.toLowerCase().includes(search) ||
      d.job_role.toLowerCase().includes(search)
    );
    list.innerHTML = filtered.length === 0 ? '<div class="alert alert-info">No matching drives found</div>' : `
      <div class="table-wrapper">
        <table>
          <thead><tr><th>Company</th><th>Job Role</th><th>Package</th><th>Eligible SDE</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>${filtered.map(d => `
            <tr>
              <td style="font-weight:600">${d.company_name}</td>
              <td>${d.job_role}</td>
              <td>₹${d.package_lpa} LPA</td>
              <td><span class="tag-chip">${d.min_cgpa}+ CGPA</span></td>
              <td>${components.formatDate(d.drive_date)}</td>
              <td>
                <div style="display:flex;gap:4px">
                  <button class="btn btn-secondary btn-sm" onclick="pages_tpo.editDrive(${d.id})">Edit</button>
                  <button class="btn btn-warning btn-sm" onclick="pages_tpo.notifyStudents(${d.id})">Push Notif</button>
                </div>
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  },
  async showDriveModal(existing = null) {
    const branches = ['CSE', 'IT', 'ECE', 'ME', 'CE', 'EE', 'AI/ML', 'DS'];
    const exBranches = existing?.allowed_branches || [];

    const html = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:20px;">
        <div class="form-group"><label class="form-label">Company Name</label><input id="d-name" class="form-control" value="${existing?.company_name || ''}" /></div>
        <div class="form-group"><label class="form-label">Job Role</label><input id="d-role" class="form-control" value="${existing?.job_role || ''}" /></div>
        <div class="form-group"><label class="form-label">Package (LPA)</label><input type="number" id="d-pkg" class="form-control" value="${existing?.package_lpa || ''}" /></div>
        <div class="form-group"><label class="form-label">Min CGPA</label><input type="number" step="0.1" id="d-cgpa" class="form-control" value="${existing?.min_cgpa || ''}" /></div>
        <div class="form-group"><label class="form-label">Max Backlogs</label><input type="number" id="d-back" class="form-control" value="${existing?.max_backlogs || 0}" /></div>
        <div class="form-group"><label class="form-label">Drive Date</label><input type="date" id="d-date" class="form-control" value="${existing?.drive_date ? new Date(existing.drive_date).toISOString().split('T')[0] : ''}" /></div>
      </div>
      <div class="form-group">
        <label class="form-label">Allowed Branches</label>
        <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:10px;padding:12px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
          ${branches.map(b => `
            <label style="display:flex;align-items:center;gap:8px;font-size:0.875rem;cursor:pointer">
              <input type="checkbox" name="d-branch" value="${b}" ${exBranches.includes(b) ? 'checked' : ''} /> ${b}
            </label>`).join('')}
        </div>
      </div>
      <div class="form-group"><label class="form-label">Required Skills (Comma separated)</label><input id="d-skills" class="form-control" value="${(existing?.required_skills || []).join(', ')}" /></div>
      <div class="form-group"><label class="form-label">Job Description</label><textarea id="d-desc" class="form-control" style="height:100px">${existing?.description || existing?.job_description || ''}</textarea></div>`;

    components.modal(existing ? 'Edit Drive' : 'Post New Drive', html, async () => {
      const selectedBranches = Array.from(document.querySelectorAll('input[name="d-branch"]:checked')).map(cb => cb.value);
      const company_name = document.getElementById('d-name').value;
      const job_role = document.getElementById('d-role').value;
      const pkg = parseFloat(document.getElementById('d-pkg').value);
      const cgpa = parseFloat(document.getElementById('d-cgpa').value);
      const back = parseInt(document.getElementById('d-back').value);

      if (!company_name || !job_role) return components.showToast('Missing Company or Role', 'error');
      if (isNaN(pkg) || pkg <= 0) return components.showToast('Invalid Package', 'error');
      if (isNaN(cgpa) || cgpa < 0 || cgpa > 10) return components.showToast('Invalid CGPA (0-10)', 'error');

      const data = {
        company_name,
        job_role,
        package_lpa: pkg,
        min_cgpa: cgpa,
        max_backlogs: isNaN(back) ? 0 : back,
        drive_date: document.getElementById('d-date').value,
        allowed_branches: selectedBranches,
        required_skills: document.getElementById('d-skills').value.split(',').map(s => s.trim()).filter(Boolean),
        job_description: document.getElementById('d-desc').value
      };
      try {
        if (existing) await api.drives.update(existing.id, data); else await api.drives.create(data);
        components.showToast(`Drive ${existing ? 'updated' : 'created'} successfully!`);
        document.querySelector('.modal-overlay').remove();
        pages_tpo.renderDrives(document.getElementById('section-content'));
      } catch (err) { components.showToast(err.message, 'error'); }
    });
  },
  async editDrive(id) {
    try {
      const drive = await api.drives.get(id);
      this.showDriveModal(drive);
    } catch (err) { components.showToast(err.message, 'error'); }
  },
  async notifyStudents(id) {
    try {
      const res = await api.drives.notify(id);
      components.showToast(`Success! ${res.count} eligible students notified via push alert.`);
    } catch (err) { components.showToast(err.message, 'error'); }
  },
  async renderApplications(c) {
    try {
      const apps = await api.applications.all();
      c.innerHTML = `
        <div style="margin-bottom:32px"><h2>All Applications</h2><p>Review and update student application statuses.</p></div>
        <div class="table-wrapper">
          <table>
            <thead><tr><th>Student</th><th>Company</th><th>Branch/CGPA</th><th>Status</th><th>Update</th></tr></thead>
            <tbody>${apps.map(a => `
              <tr>
                <td>
                  <div style="font-weight:600">${a.student_name}</div>
                  <button class="btn btn-secondary btn-sm" style="padding:2px 6px;font-size:0.7rem;margin-top:4px" onclick="pages_tpo.showStudentProfile(${JSON.stringify(a).replace(/"/g, '&quot;')})">View Details</button>
                </td>
                <td>
                  <div style="font-weight:600">${a.company_name}</div>
                  <div style="font-size:0.75rem;color:var(--text-muted)">${a.job_role}</div>
                </td>
                <td>
                   <div style="font-weight:600">${a.branch}</div>
                   <div style="font-size:0.75rem;color:var(--text-muted)">${a.cgpa} CGPA | ${a.backlogs} Backlogs</div>
                </td>
                <td>${components.statusBadge(a.status)}</td>
                <td>
                  <select class="form-control" style="width:auto;padding:4px 8px;font-size:0.75rem" onchange="pages_tpo.updateAppStatus(${a.id}, this.value)">
                    <option value="">Update Status</option>
                    <option value="Aptitude">Aptitude</option>
                    <option value="Cleared">Cleared</option>
                    <option value="Interview Scheduled">Interview</option>
                    <option value="Selected">Selected</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>`;
    } catch (err) { c.innerHTML = `<div class="alert alert-error">${err.message}</div>`; }
  },
  showStudentProfile(app) {
    const html = `
      <div style="padding:20px 0">
        <div class="card" style="margin-bottom:20px;background:#f8fafc;border:none;">
          <h4 style="margin-bottom:12px;color:var(--primary)">Academic Portfolio</h4>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
            <div><label style="font-size:0.75rem;color:var(--text-muted)">Branch</label><div style="font-weight:700">${app.branch}</div></div>
            <div><label style="font-size:0.75rem;color:var(--text-muted)">CGPA</label><div style="font-weight:700">${app.cgpa}</div></div>
            <div><label style="font-size:0.75rem;color:var(--text-muted)">Passing Year</label><div style="font-weight:700">${app.passing_year || 'N/A'}</div></div>
            <div><label style="font-size:0.75rem;color:var(--text-muted)">Backlogs</label><div style="font-weight:700">${app.backlogs}</div></div>
          </div>
        </div>
        <div>
          <h4 style="margin-bottom:12px;color:var(--primary)">Technical Stack</h4>
          <div style="display:flex;flex-wrap:wrap;gap:8px">
            ${(app.skills || []).map(s => `<span class="tag-chip" style="background:white">${s}</span>`).join('') || '<p style="font-size:0.875rem;color:var(--text-muted)">No skills listed</p>'}
          </div>
        </div>
        <div style="margin-top:24px;border-top:1px solid #f1f5f9;padding-top:20px">
          <h4 style="margin-bottom:8px;color:var(--primary)">Contact Information</h4>
          <p style="font-size:0.9rem">Email: <strong>${app.student_email}</strong></p>
        </div>
      </div>`;
    components.modal(`${app.student_name}'s Profile`, html, null);
  },
  async updateAppStatus(id, status) {
    if (!status) return;
    try {
      await api.applications.updateStatus(id, status);
      components.showToast('Status updated!');
    } catch (err) { components.showToast(err.message, 'error'); }
  },
  async renderScheduler(c) {
    try {
      const ints = await api.interviews.all();
      c.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:32px">
          <div><h2>Interview Scheduler</h2><p>Coordinate student-interviewer sessions.</p></div>
          <button class="btn btn-primary" onclick="pages_tpo.showScheduleModal()">+ Assign Interview</button>
        </div>
        <div class="table-wrapper">
          <table>
            <thead><tr><th>Student</th><th>Company</th><th>Round</th><th>Date & Time</th><th>Interviewer</th></tr></thead>
            <tbody>${ints.map(i => `
              <tr>
                <td style="font-weight:600">${i.student_name}</td>
                <td>${i.company_name}</td>
                <td><span class="tag-chip">${i.round_name}</span></td>
                <td style="font-size:0.8rem">${components.formatDateTime(i.slot_start)}</td>
                <td>${i.interviewer || 'N/A'}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>`;
    } catch (err) { c.innerHTML = `<div class="alert alert-error">${err.message}</div>`; }
  },
  async showScheduleModal() {
    try {
      const apps = await api.applications.all();
      const filtered = apps.filter(a => a.status === 'Cleared' || a.status === 'Interview Scheduled');
      const html = `
        <div style="margin-top:20px">
          <div class="form-group">
            <label class="form-label">Select Candidate Application</label>
            <select id="s-app" class="form-control">
              ${filtered.map(a => `<option value="${a.id}">${a.student_name} - ${a.company_name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group"><label class="form-label">Round Name</label><input id="s-round" class="form-control" placeholder="e.g. Technical Round 1" /></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div class="form-group"><label class="form-label">Start Time</label><input type="datetime-local" id="s-start" class="form-control" /></div>
            <div class="form-group"><label class="form-label">End Time</label><input type="datetime-local" id="s-end" class="form-control" /></div>
          </div>
          <div class="form-group"><label class="form-label">Interviewer Name</label><input id="s-inter" class="form-control" /></div>
          <div class="form-group"><label class="form-label">Meeting Link / Room</label><input id="s-loc" class="form-control" /></div>
        </div>`;

      components.modal('Schedule Interview', html, async () => {
        const data = {
          application_id: document.getElementById('s-app').value,
          round_name: document.getElementById('s-round').value,
          slot_start: document.getElementById('s-start').value,
          slot_end: document.getElementById('s-end').value,
          interviewer: document.getElementById('s-inter').value,
          location: document.getElementById('s-loc').value
        };
        try {
          await api.interviews.schedule(data);
          components.showToast('Interview scheduled!');
          document.querySelector('.modal-overlay').remove();
          this.renderScheduler(document.getElementById('section-content'));
        } catch (err) { components.showToast(err.message, 'error'); }
      });
    } catch (err) { components.showToast('No eligible applications found for scheduling.'); }
  },
  async renderAnalytics(c) {
    try {
      const trends = await api.analytics.trends();
      c.innerHTML = `
        <div style="margin-bottom:32px"><h2>Placement Trends</h2><p>Historical comparison and recruitment insights.</p></div>
        <div class="card" style="margin-bottom:32px">
          <h3>Hiring Trends (Branch-wise)</h3>
          <div style="margin-top:24px">
            ${Object.entries(trends.branch_stats || {}).map(([branch, stats]) => `
              <div style="margin-bottom:24px">
                <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                  <span style="font-weight:600">${branch}</span>
                  <span style="font-size:0.875rem;color:var(--success)">${stats.placed}/${stats.total} Placed</span>
                </div>
                <div style="height:12px;background:#f1f5f9;border-radius:6px;overflow:hidden">
                  <div style="height:100%;width:${(stats.placed / stats.total) * 100}%;background:var(--primary)"></div>
                </div>
              </div>`).join('')}
          </div>
        </div>
        <div class="grid-2">
           <div class="card"><h3>Top Recruiting Partners</h3><div style="margin-top:16px">${(trends.top_companies || []).map(co => `<div style="padding:10px 0;border-bottom:1px solid #f1f5f9;display:flex;justify-content:space-between"><span>${co.name}</span><strong>${co.count} Hires</strong></div>`).join('')}</div></div>
           <div class="card"><h3>Common Skill Deficits</h3><div style="margin-top:16px">${(trends.missing_skills || []).map(sk => `<span class="tag-chip" style="margin:4px;background:#fff1f2;border-color:#fecaca;color:#be123c">${sk}</span>`).join('')}</div></div>
        </div>`;
    } catch (err) { c.innerHTML = `<div class="alert alert-error">${err.message}</div>`; }
  },
  async renderFAQs(c) {
    try {
      const faqs = await api.bot.getFaqs();
      c.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:32px">
          <div><h2>PlacementBot FAQs</h2><p>Configure automated responses for commonly asked questions.</p></div>
          <button class="btn btn-primary" onclick="pages_tpo.showFaqModal()">+ Add FAQ</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:16px">
          ${faqs.map(f => `
            <div class="card" style="padding:16px 20px;">
              <div style="display:flex;justify-content:space-between">
                <span style="background:#eff6ff;color:var(--primary);font-size:0.75rem;padding:2px 8px;border-radius:4px;font-weight:700;margin-bottom:8px">${f.category.toUpperCase()}</span>
                <button class="btn btn-secondary btn-sm" onclick="pages_tpo.deleteFaq(${f.id})">Delete</button>
              </div>
              <h4 style="margin-bottom:8px">${f.question}</h4>
              <p style="font-size:0.875rem;color:var(--text-muted)">${f.answer}</p>
            </div>`).join('')}
        </div>`;
    } catch (err) { c.innerHTML = `<div class="alert alert-error">${err.message}</div>`; }
  },
  async showFaqModal() {
    const html = `<div style="margin-top:20px">
      <div class="form-group"><label class="form-label">Category</label><input id="f-cat" class="form-control" placeholder="e.g. Eligibility, Resume" /></div>
      <div class="form-group"><label class="form-label">Question</label><input id="f-ques" class="form-control" /></div>
      <div class="form-group"><label class="form-label">Automated Answer</label><textarea id="f-ans" class="form-control" style="height:100px"></textarea></div>
    </div>`;
    components.modal('Add Automated FAQ', html, async () => {
      const data = {
        category: document.getElementById('f-cat').value,
        question: document.getElementById('f-ques').value,
        answer: document.getElementById('f-ans').value
      };
      try {
        await api.bot.addFaq(data);
        components.showToast('FAQ added!');
        document.querySelector('.modal-overlay').remove();
        this.renderFAQs(document.getElementById('section-content'));
      } catch (err) { components.showToast(err.message, 'error'); }
    });
  },
  async deleteFaq(id) {
    if (!confirm('Delete this FAQ?')) return;
    try { await api.bot.deleteFaq(id); components.showToast('FAQ removed!'); this.renderFAQs(document.getElementById('section-content')); }
    catch (err) { components.showToast(err.message, 'error'); }
  },
  async renderNotifs(c) {
    try {
      const history = await api.notifications.getBroadcasts();
      c.innerHTML = `
        <div style="margin-bottom:32px"><h2>Service Notifications</h2><p>Push alerts to registered users by role.</p></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px">
          <div class="card">
            <h4 style="margin-bottom:20px">Send New Broadcast</h4>
            <div class="form-group">
              <label class="form-label">Target Audience</label>
              <select id="n-role" class="form-control">
                <option value="student">Students Only</option>
                <option value="alumni">Alumni Only</option>
                <option value="all">All Registered (Students & Alumni)</option>
              </select>
            </div>
            <div class="form-group"><label class="form-label">Broadcast Title</label><input id="n-title" class="form-control" placeholder="e.g. Drive Postponed" /></div>
            <div class="form-group"><label class="form-label">Message Content</label><textarea id="n-msg" class="form-control" style="height:120px"></textarea></div>
            <div style="display:flex;justify-content:flex-end"><button class="btn btn-primary lg" style="width:100%" onclick="pages_tpo.sendBroadcast()">🚀 Send Targeted Broadcast</button></div>
          </div>
          <div class="card">
            <h4 style="margin-bottom:20px">Recently Sent</h4>
            ${history.length === 0 ? '<p style="color:var(--text-muted);font-style:italic">No broadcast history found.</p>' : `
              <div class="table-wrapper" style="border:none">
                <table style="font-size:0.875rem">
                  <thead><tr><th>Target</th><th>Message</th><th>Date</th></tr></thead>
                  <tbody>${history.map(h => `
                    <tr>
                      <td><span class="badge" style="background:#f1f5f9;color:var(--text-main);font-size:0.7rem;text-transform:capitalize">${h.target_role}</span></td>
                      <td>
                        <div style="font-weight:600">${h.title}</div>
                        <div style="font-size:0.75rem;color:var(--text-muted);display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden">${h.message}</div>
                      </td>
                      <td style="color:var(--text-muted);font-size:0.7rem">${components.formatDate(h.created_at)}</td>
                    </tr>`).join('')}
                  </tbody>
                </table>
              </div>`}
          </div>
        </div>`;
    } catch (err) { c.innerHTML = `<div class="alert alert-error">${err.message}</div>`; }
  },
  async sendBroadcast() {
    const title = document.getElementById('n-title').value;
    const msg = document.getElementById('n-msg').value;
    const role = document.getElementById('n-role').value;
    if (!title || !msg) return components.showToast('Missing title/msg', 'error');
    try {
      await api.notifications.create({ user_id: 0, target_role: role, title, message: msg, type: 'alert' });
      components.showToast(`Broadcast sent to ${role === 'all' ? 'everyone' : role + 's'}!`);
      this.renderNotifs(document.getElementById('section-content'));
    } catch (err) { components.showToast(err.message, 'error'); }
  },
  async renderProfile(c) {
    try {
      const data = await api.auth.profile();
      const initial = data.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

      c.innerHTML = `
        <div style="max-width: 800px; margin: 0 auto;">
          <div class="card" style="margin-bottom: 24px; background: linear-gradient(135deg, var(--accent), var(--primary)); color: white; border: none; padding: 40px; display: flex; align-items: center; gap: 32px;">
            <div style="width: 100px; height: 100px; background: rgba(255,255,255,0.2); border: 4px solid rgba(255,255,255,0.4); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: 800; backdrop-filter: blur(10px);">${initial}</div>
            <div>
              <h2 style="color: white; font-size: 2rem; margin-bottom: 4px;">${data.name}</h2>
              <p style="color: rgba(255,255,255,0.9); font-size: 1.125rem;">Training & Placement Officer (TPO)</p>
              <div style="margin-top: 16px; display: flex; gap: 8px;">
                <span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">Admin ID: #${data.id}</span>
                <span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">Verified Staff</span>
              </div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr; gap: 24px;">
            <div class="card" style="background: var(--glass); backdrop-filter: blur(10px);">
              <h3 style="margin-bottom: 24px; display: flex; align-items: center; gap: 12px;">👤 Officer Details</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div class="form-group"><label class="form-label">Full Name</label><input type="text" id="prof-name" class="form-control" value="${data.name}" placeholder="Your Full Name" /></div>
                <div class="form-group"><label class="form-label">Official Email</label><input type="email" id="prof-email" class="form-control" value="${data.email}" readonly style="background:#f8fafc" /></div>
                <div class="form-group"><label class="form-label">Contact Number</label><input type="text" id="prof-phone" class="form-control" value="${data.phone || ''}" placeholder="+91 98765 43210" /></div>
                <div class="form-group"><label class="form-label">Designation</label><input type="text" id="prof-designation" class="form-control" value="${data.designation || 'Training & Placement Officer'}" readonly style="background:#f8fafc" /></div>
              </div>
              <div class="form-group" style="margin-top: 20px;"><label class="form-label">Professional Bio</label><textarea id="prof-bio" class="form-control" style="height: 100px;">${data.bio || ''}</textarea></div>
            </div>

            <div style="text-align: right; margin-top: 8px; margin-bottom: 24px;">
              <button class="btn btn-primary lg" id="save-profile-btn" onclick="pages_tpo.handleProfileUpdate()" style="min-width: 200px; box-shadow: var(--shadow-lg);">✨ Save TPO Profile</button>
            </div>

            <div class="card" style="border: 1px dashed var(--danger); background: #fff1f2;">
              <h3 style="color: #be123c; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">⚠️ Danger Zone</h3>
              <p style="font-size: 0.875rem; color: #991b1b; margin-bottom: 20px;">Use these actions to reset or purge system-wide data. This is useful for testing or periodic cleanup. <strong>Action cannot be undone.</strong></p>
              <div style="display: flex; gap: 16px;">
                <button class="btn btn-danger" onclick="pages_tpo.resetSystemData()" style="padding: 10px 20px;">🧹 Clean All Data (Reset System)</button>
              </div>
            </div>
          </div>
        </div>
      `;
    } catch (err) { c.innerHTML = `<div class="alert alert-error">${err.message}</div>`; }
  },
  async resetSystemData() {
    if (!confirm('CRITICAL: This will delete ALL drives, applications, and custom data (except users). Continue?')) return;
    try {
      await api.debug.resetSystem();
      components.showToast('System data wiped and reset! 🧹');
      setTimeout(() => location.reload(), 2000);
    } catch (err) { components.showToast(err.message, 'error'); }
  },

  async handleProfileUpdate() {
    const btn = document.getElementById('save-profile-btn');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = 'Saving...';

    const payload = {
      name: document.getElementById('prof-name').value,
      phone: document.getElementById('prof-phone').value,
      bio: document.getElementById('prof-bio').value
    };

    try {
      const response = await api.auth.updateProfile(payload);

      if (response.user) {
        auth.setUser(response.user);
        const sidebar = document.querySelector('.sidebar');
        const topbarTitle = document.querySelector('.topbar-title');
        if (sidebar) sidebar.outerHTML = components.buildSidebar(auth.getUser(), 'profile');
        if (topbarTitle) topbarTitle.textContent = 'TPO Profile';
      }

      btn.innerHTML = 'Saved! ✅';
      btn.style.background = 'var(--success)';
      components.showToast('TPO Profile updated! ✨');

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
