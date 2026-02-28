/* Student Dashboard */
const pages_student = {
  section: 'overview',
  render(container) {
    const user = auth.getUser();
    container.innerHTML = `
      <div class="app-layout">
        ${components.buildSidebar(user, 'overview')}
        <div class="main-content">
          ${components.buildTopbar('Student Dashboard')}
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
    const navLabelMap = { overview: 'dashboard', drives: 'drives', applications: 'applications', advisor: 'advisor', resume: 'resume', analytics: 'skill', alumni: 'alumni', scheduler: 'interview', notifications: 'notifications', profile: 'profile' };
    document.querySelectorAll('.nav-item').forEach(el => { if (el.textContent.toLowerCase().includes(navLabelMap[sec] || sec)) el.classList.add('active'); });

    const titles = { overview: 'My Dashboard', drives: 'Eligible Drives', applications: 'My Applications', advisor: 'AI Career Advisor', resume: 'Resume Wizard', analytics: 'Skill Gap Analysis', alumni: 'Alumni Connect', scheduler: 'My Interviews', notifications: 'Notifications', profile: 'My Profile' };
    document.querySelector('.topbar-title').textContent = titles[sec] || 'Dashboard';

    const c = document.getElementById('section-content');
    if (c) {
      c.innerHTML = '<div style="text-align:center;padding:100px 0"><div class="loader-spinner" style="margin:auto"></div></div>';
      switch (sec) {
        case 'overview': this.renderOverview(c); break;
        case 'drives': this.renderDrives(c); break;
        case 'applications': this.renderApplications(c); break;
        case 'advisor': this.renderAdvisor(c); break;
        case 'resume': this.renderResume(c); break;
        case 'analytics': this.renderAnalytics(c); break;
        case 'alumni': this.renderAlumni(c); break;
        case 'scheduler': this.renderScheduler(c); break;
        case 'notifications': this.renderNotifs(c); break;
        case 'profile': this.renderProfile(c); break;
      }
    }
  },
  async renderOverview(c) {
    try {
      const [apps, profile, interviews] = await Promise.allSettled([api.applications.my(), api.auth.profile(), api.interviews.my()]);
      const appData = apps.value || [];
      const profileData = profile.value || {};
      const interviewData = interviews.value || [];
      const selected = appData.filter(a => a.status === 'Selected').length;
      const upcoming = interviewData.filter(s => new Date(s.slot_start) > new Date());

      c.innerHTML = `
        <div style="margin-bottom:32px">
          <h2 style="font-size:1.75rem;margin-bottom:8px">Welcome, ${profileData.name && !profileData.name.includes('Student Account') ? profileData.name : 'Student'}! 👋</h2>
          <p style="color:var(--text-muted)">${profileData.name && !profileData.name.includes('Student Account') ? "Here's a snapshot of your current placement activity." : "Please complete your profile to access eligible drives and analytics."}</p>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:8px">Applied Drives</div>
            <div class="stat-value">${appData.length}</div>
            <div style="margin-top:12px;display:flex;align-items:center;gap:4px;color:var(--success);font-size:0.75rem;font-weight:600">
              <span>↗ 12% from last month</span>
            </div>
          </div>
          <div class="stat-card">
            <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:8px">Offers Received</div>
            <div class="stat-value" style="color:var(--success)">${selected}</div>
            <div style="margin-top:12px;color:var(--text-muted);font-size:0.75rem">Keep up the good work!</div>
          </div>
          <div class="stat-card">
            <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:8px">Upcoming Interviews</div>
            <div class="stat-value" style="color:var(--primary)">${upcoming.length}</div>
            <div style="margin-top:12px;color:var(--text-muted);font-size:0.75rem">Next interview: ${upcoming[0] ? components.formatDate(upcoming[0].slot_start) : 'None'}</div>
          </div>
          <div class="stat-card">
            <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:8px">Your CGPA</div>
            <div class="stat-value">${profileData.cgpa || '—'}</div>
            <div style="margin-top:12px;color:var(--text-muted);font-size:0.75rem">${profileData.branch || 'Profile incomplete'}</div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns: 2fr 1fr; gap:24px;">
          <div class="card">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
              <h3>Recent Applications</h3>
              <button class="btn btn-secondary btn-sm" onclick="currentDashboard.showSection('applications')">View All</button>
            </div>
            ${appData.length === 0 ? `<div style="text-align:center;padding:40px;color:var(--text-muted);">No applications yet. <a href="#" onclick="currentDashboard.showSection('drives')">Browse Drives</a></div>`
          : `<div class="table-wrapper">
                <table>
                  <thead><tr><th>Company</th><th>Role</th><th>Status</th></tr></thead>
                  <tbody>${appData.slice(0, 5).map(a => `
                    <tr>
                      <td style="font-weight:600">${a.company_name}</td>
                      <td>${a.job_role}</td>
                      <td>${components.statusBadge(a.status)}</td>
                    </tr>`).join('')}
                  </tbody>
                </table>
              </div>`}
          </div>
          
          <div class="card">
            <h3 style="margin-bottom:20px">Upcoming Interviews</h3>
            ${upcoming.length === 0 ? `<div style="text-align:center;padding:40px;color:var(--text-muted);">No interviews scheduled.</div>`
          : upcoming.slice(0, 4).map(s => `
              <div style="padding:16px 0; border-bottom:1px solid #f1f5f9;">
                <div style="font-weight:600;margin-bottom:4px">${s.company_name}</div>
                <div style="font-size:0.8rem;color:var(--text-muted)">${s.round_name}</div>
                <div style="font-size:0.75rem;color:var(--primary);margin-top:4px;font-weight:600">📅 ${components.formatDateTime(s.slot_start)}</div>
              </div>`).join('')}
          </div>
        </div>`;
    } catch (err) { c.innerHTML = `<div class="alert alert-error">${err.message}</div>`; }
  },
  async renderDrives(c) {
    c.innerHTML = `
      <div style="margin-bottom:24px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px">
        <div>
          <h2>Placement Opportunities</h2>
          <p>Explore drives tailored to your profile and check eligibility criteria.</p>
        </div>
        <div style="display:flex;gap:12px">
          <input type="search" class="page-filter" placeholder="Search companies or roles..." 
            oninput="window._currentMatchSearch = this.value; pages_student._filterDrives()" 
            value="${window._currentMatchSearch || ''}"
            style="padding:10px 16px;border-radius:12px;border:1px solid #e2e8f0;width:280px;font-size:0.875rem">
        </div>
      </div>
      <div id="student-drives-list"></div>`;
    this._loadDrives();
  },
  async _loadDrives() {
    const list = document.getElementById('student-drives-list');
    try {
      const drives = await api.drives.eligible();
      window._allStudentDrives = drives;
      this._filterDrives();
    } catch (err) { if (list) list.innerHTML = `<div class="alert alert-error">${err.message}</div>`; }
  },
  _filterDrives() {
    const list = document.getElementById('student-drives-list');
    if (!list) return;
    const search = (window._currentMatchSearch || '').toLowerCase();
    const filtered = (window._allStudentDrives || []).filter(d =>
      d.company_name.toLowerCase().includes(search) ||
      d.job_role.toLowerCase().includes(search)
    );
    list.innerHTML = filtered.length === 0 ? `<div style="text-align:center;padding:60px;"><h3>No matching drives found</h3><p>Try a different keyword or check your profile.</p></div>`
      : `<div style="display:grid;grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap:20px;">
      ${filtered.map(d => `
        <div class="card" style="display:flex;flex-direction:column;gap:16px;transition:0.2s;cursor:default; ${!d.is_eligible ? 'opacity:0.8; filter:grayscale(0.2);' : ''}">
          <div style="display:flex;justify-content:space-between;align-items:start">
            <div style="flex:1">
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
                <h3 style="color:var(--primary);margin:0">${d.company_name}</h3>
                <span class="badge" style="background:${d.match_score > 70 ? '#dcfce7' : d.match_score > 40 ? '#fef9c3' : '#fee2e2'}; color:${d.match_score > 70 ? '#166534' : d.match_score > 40 ? '#854d0e' : '#991b1b'}; border:none; font-weight:700; font-size:0.75rem">${d.match_score}% Match</span>
              </div>
              <div style="font-weight:700;font-size:0.9rem">${d.job_role}</div>
            </div>
            ${d.already_applied ? components.statusBadge('Applied') : (!d.is_eligible ? '<span class="badge badge-rejected" style="box-shadow:none">Ineligible</span>' : '')}
          </div>
          <div style="font-size:0.875rem;color:var(--text-muted);display:flex;flex-wrap:wrap;gap:12px;">
            <span>📍 ${d.location || 'Remote'}</span>
            <span>💰 ₹${d.package_lpa} LPA</span>
            <span>📅 ${components.formatDate(d.drive_date)}</span>
          </div>
          <div style="border-top:1px solid #f1f5f9;padding-top:12px;">
            <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:8px">${d.is_eligible ? 'Eligibility Criteria' : 'Ineligibility Reasons'}</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              ${d.is_eligible ? `
                <span class="tag-chip">CGPA: ${d.min_cgpa}+</span>
                <span class="tag-chip">Max Backlogs: ${d.max_backlogs}</span>
              ` : d.reasons.map(r => `<span class="tag-chip" style="background:#fff1f2;border-color:#fecaca;color:#be123c">${r}</span>`).join('')}
            </div>
          </div>
          <div style="margin-top:auto;padding-top:12px">
            ${d.already_applied ? `<button class="btn btn-secondary" style="width:100%" disabled>Already Applied</button>`
          : (d.is_eligible ? `<button class="btn btn-primary" style="width:100%" onclick="pages_student.applyToDrive(${d.id}, '${d.company_name}')">Apply Now →</button>` : `<button class="btn btn-secondary" style="width:100%;cursor:not-allowed;" disabled title="${d.reasons.join(', ')}">Requirements Not Met</button>`)}
          </div>
        </div>`).join('')}</div>`;
  },
  async applyToDrive(driveId, company) {
    if (!components.confirmDialog(`Confirm application for ${company} ? `)) return;
    try {
      await api.applications.apply({ drive_id: driveId });
      components.showToast(`Applied to ${company} !Good luck.`);
      components.loadEligibleCount(); // Refresh sidebar badge
      this.renderDrives(document.getElementById('section-content'));
    } catch (err) { components.showToast(err.message, 'error'); }
  },
  async renderApplications(c) {
    try {
      const apps = await api.applications.my();
      c.innerHTML = `
        <div style="margin-bottom:24px">
          <h2>My Recruitment Pipeline</h2>
          <p>Track your real-time status for all applied drives.</p>
        </div>
  ${apps.length === 0 ? `<div style="text-align:center;padding:60px;"><h3>No applications found</h3><button class="btn btn-primary" onclick="currentDashboard.showSection('drives')">Browse Drives</button></div>`
          : apps.map(a => `
          <div class="card" style="margin-bottom:20px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
              <div>
                <h3 style="margin-bottom:4px">${a.company_name}</h3>
                <div style="font-size:0.875rem;color:var(--text-muted)">${a.job_role} • Applied on ${components.formatDate(a.applied_at)}</div>
              </div>
              <div>${components.statusBadge(a.status)}</div>
            </div>
            ${a.status === 'Rejected' ? `<div class="alert alert-error" style="margin-top:16px;">Better luck next time! Your application was not selected for further rounds.</div>`
              : components.pipelineView(a.status)}
          </div>`).join('')
        } `;
    } catch (err) { c.innerHTML = `<div class="alert alert-error">${err.message}</div>`; }
  },
  renderResume(c) {
    c.innerHTML = `
      <div style="margin-bottom:24px">
        <h2>Resume Intelligence Wizard</h2>
        <p>Build a professional, ATS-optimized resume tailored for recruitment.</p>
      </div>
      <div class="card" style="padding: 0; overflow: hidden;">
        <div style="display:flex;background:#f8fafc;border-bottom:1px solid #e2e8f0;">
          ${[1, 2, 3, 4, 5].map(i => `
            <button class="resume-step-btn" id="resume-step-${i}" style="flex:1;padding:16px;border:none;background:none;font-weight:600;font-size:0.875rem;cursor:default;color:#cbd5e1;display:flex;flex-direction:column;align-items:center;gap:4px">
              <span style="width:24px;height:24px;border-radius:50%;border:2px solid;display:flex;align-items:center;justify-content:center;font-size:12px">${i}</span>
              ${['Personal', 'Education', 'Skills', 'Projects', 'Generate'][i - 1]}
            </button>`).join('')}
        </div>
        <div id="resume-step-content" style="padding:32px;"></div>
      </div>
      <div class="card" style="margin-top:24px">
        <h3 style="margin-bottom:16px">Previously Generated Resumes</h3>
        <div id="resume-history" style="display:flex;flex-direction:column;gap:12px"></div>
      </div>`;
    this.resumeData = this.resumeData || { skills: [], projects: [] };
    this.resumeStep = 1;
    this.renderResumeStep();
    api.resume.history().then(hist => {
      const h = document.getElementById('resume-history');
      if (h) h.innerHTML = hist.length === 0 ? '<p style="font-size:0.875rem;color:var(--text-muted)">No history yet.</p>' :
        hist.map(r => `<div style="display:flex;justify-content:space-between;align-items:center;padding:12px;border:1px solid #f1f5f9;border-radius:8px;">
          <div style="font-size:0.875rem">Resume generated on <strong>${components.formatDateTime(r.created_at)}</strong></div>
          <a href="${api.resume.downloadUrl(r.filename)}" target="_blank" class="btn btn-secondary btn-sm">Download PDF</a>
        </div>`).join('');
    });
  },
  renderResumeStep() {
    [1, 2, 3, 4, 5].forEach(i => {
      const btn = document.getElementById(`resume-step-${i}`);
      if (!btn) return;
      if (i < this.resumeStep) { btn.style.color = 'var(--success)'; btn.querySelector('span').innerHTML = '✓'; btn.querySelector('span').style.borderColor = 'var(--success)'; }
      else if (i === this.resumeStep) { btn.style.color = 'var(--primary)'; btn.querySelector('span').style.borderColor = 'var(--primary)'; }
      else { btn.style.color = '#cbd5e1'; btn.querySelector('span').style.borderColor = '#cbd5e1'; btn.querySelector('span').innerHTML = i; }
    });

    const c = document.getElementById('resume-step-content');
    if (this.resumeStep === 1) c.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
        <div class="form-group"><label class="form-label">Full Name</label><input id="rv-name" class="form-control" value="${this.resumeData.name || auth.getUser()?.name || ''}" /></div>
        <div class="form-group"><label class="form-label">Email</label><input id="rv-email" class="form-control" value="${this.resumeData.email || auth.getUser()?.email || ''}" /></div>
        <div class="form-group"><label class="form-label">Phone</label><input id="rv-phone" class="form-control" value="${this.resumeData.phone || ''}" placeholder="+91 9876543210" /></div>
        <div class="form-group"><label class="form-label">LinkedIn</label><input id="rv-li" class="form-control" value="${this.resumeData.linkedin || ''}" placeholder="linkedin.com/in/username" /></div>
      </div>
      <div class="form-group"><label class="form-label">Professional Objective</label><textarea id="rv-obj" class="form-control" style="height:100px" placeholder="Motivated engineering student with a strong foundation in...">${this.resumeData.objective || ''}</textarea></div>
      <div style="text-align:right"><button class="btn btn-primary" onclick="pages_student.saveStep1()">Continue to Education →</button></div>`;
    else if (this.resumeStep === 2) c.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
        <div class="form-group"><label class="form-label">Branch/Course</label><input id="rv-branch" class="form-control" value="${this.resumeData.branch || ''}" placeholder="B.Tech Computer Science" /></div>
        <div class="form-group"><label class="form-label">Current CGPA</label><input id="rv-cgpa" class="form-control" value="${this.resumeData.cgpa || ''}" placeholder="8.5" /></div>
        <div class="form-group"><label class="form-label">Passing Year</label><input id="rv-yr" class="form-control" value="${this.resumeData.passing_year || ''}" placeholder="2025" /></div>
      </div>
  <div style="display:flex;justify-content:space-between;margin-top:20px">
    <button class="btn btn-secondary" onclick="pages_student.resumeStep=1;pages_student.renderResumeStep()">← Back</button>
    <button class="btn btn-primary" onclick="pages_student.saveStep2()">Save & Next: Skills →</button>
  </div>`;
    else if (this.resumeStep === 3) {
      c.innerHTML = `
        <div class="form-group"><label class="form-label">Technical Skills (Press Enter to add tags)</label>
          <div id="skills-tag-wrap" style="border:1px solid #cbd5e1;padding:8px;border-radius:8px;min-height:100px;background:white"></div>
        </div>
        <div class="form-group"><label class="form-label">Certifications (Format: Name - Issuer - Year)</label>
          <textarea id="rv-certs" class="form-control" style="height:100px" placeholder="AWS Certified Architect - Amazon - 2024">${(this.resumeData.certifications || []).map(c => `${c.name} - ${c.issuer} - ${c.year}`).join('\n')}</textarea>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:20px">
          <button class="btn btn-secondary" onclick="pages_student.resumeStep=2;pages_student.renderResumeStep()">← Back</button>
          <button class="btn btn-primary" onclick="pages_student.saveStep3()">Save & Next: Projects →</button>
        </div>`;
      components.createTagInput('skills-tag-wrap', this.resumeData.skills || []);
    } else if (this.resumeStep === 4) {
      c.innerHTML = `
        <div id="projects-wrap">
          ${(this.resumeData.projects || [{ title: '', tech: '', description: '' }]).map((p, i) => `
            <div style="padding:20px;border:1px solid #f1f5f9;border-radius:12px;margin-bottom:16px;background:#f8fafc">
              <div style="display:flex;justify-content:space-between;margin-bottom:12px"><h4 style="margin:0">Project #${i + 1}</h4>${i > 0 ? `<button class="btn btn-danger btn-sm" onclick="pages_student.removeProject(${i})">Remove</button>` : ''}</div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div class="form-group"><label class="form-label">Project Title</label><input class="form-control proj-title" value="${p.title}" /></div>
                <div class="form-group"><label class="form-label">Tech Stack</label><input class="form-control proj-tech" value="${p.tech}" /></div>
              </div>
              <div class="form-group"><label class="form-label">Key Highlights/Deliverables</label><textarea class="form-control proj-desc" style="height:80px">${p.description}</textarea></div>
            </div>`).join('')
        }
        </div>
        <button class="btn btn-secondary btn-sm" onclick="pages_student.addProject()">+ Add Another Project</button>
        <div style="display:flex;justify-content:space-between;margin-top:32px">
          <button class="btn btn-secondary" onclick="pages_student.resumeStep=3;pages_student.renderResumeStep()">← Back</button>
          <button class="btn btn-primary" onclick="pages_student.saveStep4()">Finally, Generate Resume →</button>
        </div>`;
    } else if (this.resumeStep === 5) c.innerHTML = `
      <div style="text-align:center;padding:20px 0;">
        <div style="font-size:3rem;margin-bottom:16px">📄</div>
        <h3 style="margin-bottom:12px">Ready to build!</h3>
        <p style="margin-bottom:32px">We've gathered all your information. Click the button below to generate your strict, ATS-optimized professional resume in PDF format.</p>
        <div style="background:#f1f5f9;border-radius:12px;padding:20px;text-align:left;max-width:400px;margin:0 auto 32px">
          <div style="font-size:0.875rem;margin-bottom:8px"><strong>Name:</strong> ${this.resumeData.name}</div>
          <div style="font-size:0.875rem;margin-bottom:8px"><strong>Skills:</strong> ${(this.resumeData.skills || []).length} added</div>
          <div style="font-size:0.875rem;margin-bottom:8px"><strong>Projects:</strong> ${(this.resumeData.projects || []).length} added</div>
        </div>
        <div style="display:flex;justify-content:center;gap:16px">
          <button class="btn btn-secondary" onclick="pages_student.resumeStep=4;pages_student.renderResumeStep()">← Re-check Projects</button>
          <button class="btn btn-primary lg" id="gen-resume-btn" onclick="pages_student.generateResume()">🚀 Generate & Download PDF</button>
        </div>
        <div id="gen-result" style="margin-top:24px"></div>
      </div>
`;
  },
  saveStep1() { this.resumeData.name = document.getElementById('rv-name').value; this.resumeData.email = document.getElementById('rv-email').value; this.resumeData.phone = document.getElementById('rv-phone').value; this.resumeData.linkedin = document.getElementById('rv-li').value; this.resumeStep = 2; this.renderResumeStep(); },
  saveStep2() { this.resumeData.branch = document.getElementById('rv-branch').value; this.resumeData.cgpa = document.getElementById('rv-cgpa').value; this.resumeData.passing_year = document.getElementById('rv-yr').value; this.resumeStep = 3; this.renderResumeStep(); },
  saveStep3() { const wrap = document.getElementById('skills-tag-wrap'); if (wrap && wrap._getTags) this.resumeData.skills = wrap._getTags(); const certsRaw = document.getElementById('rv-certs').value; this.resumeData.certifications = certsRaw.split('\n').filter(Boolean).map(l => { const p = l.split(' - '); return { name: p[0]?.trim(), issuer: p[1]?.trim(), year: p[2]?.trim() }; }); this.resumeStep = 4; this.renderResumeStep(); },
  addProject() { this.resumeData.projects = this.resumeData.projects || []; this.resumeData.projects.push({ title: '', tech: '', description: '' }); this.resumeStep = 4; this.renderResumeStep(); },
  removeProject(i) { this.resumeData.projects.splice(i, 1); this.resumeStep = 4; this.renderResumeStep(); },
  saveStep4() { const t = [...document.querySelectorAll('.proj-title')], te = [...document.querySelectorAll('.proj-tech')], d = [...document.querySelectorAll('.proj-desc')]; this.resumeData.projects = t.map((_, i) => ({ title: t[i].value, tech: te[i].value, description: d[i].value })); this.resumeStep = 5; this.renderResumeStep(); },
  async generateResume() {
    const btn = document.getElementById('gen-resume-btn'), res = document.getElementById('gen-result');
    btn.textContent = 'Generating PDF...'; btn.disabled = true;
    try {
      const data = await api.resume.generate(this.resumeData);
      res.innerHTML = `<div class="alert alert-success">✅ Resume generated successfully! <a href="${api.resume.downloadUrl(data.filename)}" target="_blank" style="text-decoration:underline">Click here to download</a></div>`;
      btn.textContent = 'Regenerate Resume'; btn.disabled = false;
    } catch (err) { res.innerHTML = `<div class="alert alert-error">${err.message}</div>`; btn.textContent = '🚀 Generate & Download PDF'; btn.disabled = false; }
  },
  async renderAnalytics(c) {
    c.innerHTML = `
      <div style="margin-bottom:24px">
        <h2>Career Analytics & Skill Gap</h2>
        <p>Analyze how your profile matches with market requirements for specific job roles.</p>
      </div>
      <div class="card" style="margin-bottom:24px">
        <label class="form-label">What role are you targeting?</label>
        <div style="display:flex;gap:12px">
          <input id="target-role" class="form-control" placeholder="e.g. Frontend Engineer, Product Manager" style="flex:1" onkeypress="if(event.key==='Enter') currentDashboard.loadSkillGap()" />
          <button class="btn btn-primary" onclick="currentDashboard.loadSkillGap()">Run Analytics 🔍</button>
        </div>
      </div>
      <div id="skill-gap-result"></div>`;
    this.loadSkillGap();
  },
  async loadSkillGap() {
    const role = document.getElementById('target-role')?.value, r = document.getElementById('skill-gap-result');
    if (!r) return;
    r.innerHTML = '<div style="text-align:center;padding:40px"><div class="loader-spinner" style="margin:auto"></div></div>';
    try {
      const data = await api.analytics.skillGap(role);
      r.innerHTML = `
        <div style="margin-top:24px; display:grid; grid-template-columns: 1fr 1fr; gap:24px;">
          <div class="card" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:32px; text-align:center;">
            ${components.progressRing(data.match_percentage, 140, 12)}
            <h3 style="margin-top:20px; margin-bottom:4px;">Match Score</h3>
            <p style="color:var(--text-muted); font-size:0.875rem;">Profile affinity for <strong>${data.target_role}</strong></p>
          </div>
          <div style="display:flex; flex-direction:column; gap:24px;">
            <div class="card" style="background:var(--glass); backdrop-filter:blur(10px); border-left:4px solid var(--success);">
              <h4 style="margin-bottom:12px; display:flex; align-items:center; gap:8px;">✅ Matched Skills (${data.matched_skills.length})</h4>
              <div style="display:flex; flex-wrap:wrap; gap:8px">
                ${data.matched_skills.length === 0 ? '<p style="color:var(--text-muted); font-size:0.875rem;">No direct matches found yet.</p>' :
          data.matched_skills.map(s => `<span class="tag-chip" style="background:#f0fdf4; border-color:#bbf7d0; color:#15803d; font-weight:600;">${s}</span>`).join('')}
              </div>
            </div>
            <div class="card" style="background:var(--glass); backdrop-filter:blur(10px); border-left:4px solid var(--accent);">
              <h4 style="margin-bottom:12px; display:flex; align-items:center; gap:8px;">🎯 Gap Areas (${data.missing_skills.length})</h4>
              <div style="display:flex; flex-wrap:wrap; gap:8px">
                ${data.missing_skills.length === 0 ? '<p style="color:var(--success); font-weight:600;">Perfect Match! Ready to apply. 🚀</p>' :
          data.missing_skills.map(s => `<span class="tag-chip" style="background:#fff1f2; border-color:#fecaca; color:#be123c; font-weight:600;">${s}</span>`).join('')}
              </div>
            </div>
          </div>
        </div>

  <div class="card" style="margin-top:24px; background:var(--glass); backdrop-filter:blur(10px);">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
      <div>
        <h3 style="margin-bottom:4px;">🚀 Personalized Roadmap</h3>
        <p style="color:var(--text-muted); font-size:0.875rem;">Strategic courses to bridge your technical gaps for ${data.target_role}</p>
      </div>
      <div class="badge badge-selected" style="padding:8px 16px;">AI Generated</div>
    </div>
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Target Skill</th>
            <th>Recommended Course</th>
            <th>Platform</th>
            <th>Duration</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${data.recommendations.map(re => `
                  <tr>
                    <td><span class="tag-chip" style="font-weight:700;">${re.skill}</span></td>
                    <td style="font-weight:600; color:var(--text);">${re.course}</td>
                    <td><span class="badge" style="background:#eef2ff; color:#4338ca; border:none;">${re.platform}</span></td>
                    <td><div style="display:flex; align-items:center; gap:6px;"><span style="font-size:1rem;">⏱️</span> ${re.duration}</div></td>
                    <td><button class="btn btn-secondary btn-sm" onclick="components.showToast('Redirecting to course...')">View Course</button></td>
                  </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>
`;
    } catch (err) { r.innerHTML = `<div class="alert alert-error">${err.message}</div>`; }
  },
  async renderAlumni(c) {
    c.innerHTML = `
      <div style="margin-bottom:24px">
        <h2>Alumni Connect</h2>
        <p>Reach out to graduated seniors for referrals and career mentorship sessions.</p>
      </div>
      <div style="margin-bottom:24px;display:flex;gap:12px;border-bottom:1px solid #e2e8f0;">
        <button class="nav-item active" id="alum-tab-ref" onclick="pages_student.alumniTab('referrals')" style="margin:0;width:auto;border-radius:0;border-bottom:2px solid var(--primary);padding:12px 24px;">💼 Job Referrals</button>
        <button class="nav-item" id="alum-tab-ment" onclick="pages_student.alumniTab('mentorship')" style="margin:0;width:auto;border-radius:0;padding:12px 24px;">🎯 Mentorship Sessions</button>
      </div>
      <div id="alumni-section-content"></div>`;
    this.alumniTab('referrals');
  },
  alumniTab(tab) {
    const t1 = document.getElementById('alum-tab-ref'), t2 = document.getElementById('alum-tab-ment');
    if (t1) { t1.classList.toggle('active', tab === 'referrals'); t1.style.borderBottom = tab === 'referrals' ? '2px solid var(--primary)' : 'none'; }
    if (t2) { t2.classList.toggle('active', tab === 'mentorship'); t2.style.borderBottom = tab === 'mentorship' ? '2px solid var(--primary)' : 'none'; }
    const c = document.getElementById('alumni-section-content');
    if (c) {
      c.innerHTML = '<div style="text-align:center;padding:60px"><div class="loader-spinner" style="margin:auto"></div></div>';
      if (tab === 'referrals') this._loadReferrals(c); else this._loadMentorship(c);
    }
  },
  async _loadReferrals(c) {
    try {
      const refs = await api.alumni.referrals();
      c.innerHTML = refs.length === 0 ? `<div style="text-align:center;padding:60px;"><h3>No referrals found</h3></div>` :
        `<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;"> ${refs.filter(r => r.is_active).map(r => `
          <div class="card" style="display:flex;flex-direction:column;gap:12px">
            <div style="display:flex;justify-content:space-between;align-items:start">
              <h3 style="color:var(--primary)">${r.title}</h3>
              <div style="font-size:0.75rem;padding:2px 8px;background:#f0fdf4;color:#166534;border-radius:4px;font-weight:700">ACTIVE</div>
            </div>
            <div style="font-weight:700;font-size:0.9rem">${r.company}</div>
            <p style="font-size:0.875rem">${r.description}</p>
            <div style="font-size:0.75rem;color:var(--text-muted)">Posted by ${r.alumni_name}</div>
            <div style="margin-top:auto;padding-top:12px"><a href="${r.apply_link}" target="_blank" class="btn btn-primary btn-sm" style="width:100%">Submit Application ↗</a></div>
          </div>`).join('')
        }</div>`;
    } catch (err) { c.innerHTML = `<div class="alert alert-error">${err.message}</div>`; }
  },
  async _loadMentorship(c) {
    try {
      const slots = await api.alumni.mentorship(true);
      c.innerHTML = slots.length === 0 ? `<div style="text-align:center;padding:60px;"><h3>No slots found</h3></div>` :
        `<div style="display:grid;grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:20px;"> ${slots.map(s => `
          <div class="card" style="text-align:center">
            <div style="width:48px;height:48px;background:#eff6ff;color:var(--primary);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-weight:bold">${s.mentor_name[0]}</div>
            <h3 style="margin-bottom:4px">${s.mentor_name}</h3>
            <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:12px">${s.company}</div>
            <div style="background:#f8fafc;padding:12px;border-radius:8px;margin-bottom:16px;">
              <div style="font-size:0.875rem;font-weight:700">${s.topic}</div>
              <div style="font-size:0.75rem;margin-top:4px;color:var(--text-muted)">📅 ${components.formatDateTime(s.slot_date)}</div>
            </div>
            <button class="btn btn-success" style="width:100%" onclick="pages_student.bookSlot(${s.id},'${s.mentor_name}')">Book Free Session</button>
          </div>`).join('')
        }</div>`;
    } catch (err) { c.innerHTML = `<div class="alert alert-error">${err.message}</div>`; }
  },
  async bookSlot(id, mentor) {
    if (!components.confirmDialog(`Book session with ${mentor}?`)) return;
    try { await api.alumni.bookSlot(id); components.showToast(`Session booked! Check notifications.`); this.alumniTab('mentorship'); }
    catch (err) { components.showToast(err.message, 'error'); }
  },
  async renderScheduler(c) {
    try {
      const slots = await api.interviews.my();
      c.innerHTML = `
        <div style="margin-bottom:24px">
          <h2>Interview Calendar</h2>
          <p>Your upcoming and past interview appointments.</p>
        </div>
  ${slots.length === 0 ? `<div style="text-align:center;padding:60px;"><h3>No interviews scheduled</h3></div>`
          : slots.map(s => `
          <div class="card" style="margin-bottom:20px; border-left: 4px solid var(--primary);">
            <div style="display:grid;grid-template-columns: 1fr 2fr; gap:24px; align-items:center;">
              <div style="text-align:center; border-right:1px solid #f1f5f9; padding-right:24px;">
                <div style="font-size:0.75rem;font-weight:800;color:var(--text-muted);text-transform:uppercase">${new Date(s.slot_start).toLocaleString('default', { month: 'short' })}</div>
                <div style="font-size:2rem;font-weight:800;color:var(--text)">${new Date(s.slot_start).getDate()}</div>
                <div style="font-size:0.875rem;font-weight:600;color:var(--primary)">${new Date(s.slot_start).getFullYear()}</div>
              </div>
              <div>
                <div style="display:flex;justify-content:space-between;align-items:start">
                  <div>
                    <h3 style="margin-bottom:4px">${s.company_name}</h3>
                    <div style="font-weight:700;font-size:0.9rem">${s.round_name}</div>
                  </div>
                  ${components.statusBadge(s.status)}
                </div>
                <div style="display:flex;gap:20px;margin-top:16px;font-size:0.875rem;color:var(--text-muted)">
                   <span>⏱ ${new Date(s.slot_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(s.slot_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                   <span>📍 ${s.location || 'Online'}</span>
                </div>
                ${s.meeting_link ? `<a href="${s.meeting_link}" target="_blank" class="btn btn-primary btn-sm" style="margin-top:16px">Join Video Interview</a>` : ''}
              </div>
            </div>
          </div>`).join('')
        } `;
    } catch (err) { c.innerHTML = `<div class="alert alert-error">${err.message}</div>`; }
  },
  async renderNotifs(c) {
    try {
      const notifs = await api.notifications.all();
      await api.notifications.markAllRead();
      components.loadNotifCount();
      c.innerHTML = `
        <div style="margin-bottom:24px">
          <h2>System Notifications</h2>
          <p>Updates about your drives, applications, and sessions.</p>
        </div>
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
          <div class="card" style="margin-bottom: 24px; background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white; border: none; padding: 40px; display: flex; align-items: center; gap: 32px;">
            <div style="width: 100px; height: 100px; background: rgba(255,255,255,0.2); border: 4px solid rgba(255,255,255,0.4); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: 800; backdrop-filter: blur(10px);">${data.name.includes('Student Account') ? 'SA' : initial}</div>
            <div>
              <h2 style="color: white; font-size: 2rem; margin-bottom: 4px;">${data.name.includes('Student Account') ? 'Your Profile' : data.name}</h2>
              <p style="color: rgba(255,255,255,0.9); font-size: 1.125rem;">Student • ${data.branch || 'Branch Not Set'}</p>
              <div style="margin-top: 16px; display: flex; gap: 8px;">
                <span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">ID: #${data.id}</span>
                <span style="background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">Status: ${data.branch ? 'Initialized' : 'Empty'}</span>
              </div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr; gap: 24px;">
            <div class="card" style="background: var(--glass); backdrop-filter: blur(10px);">
              <h3 style="margin-bottom: 24px; display: flex; align-items: center; gap: 12px;">👤 Personal Details</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div class="form-group"><label class="form-label">Full Name</label><input type="text" id="prof-name" class="form-control" value="${data.name.includes('Student Account') ? '' : data.name}" placeholder="Type your full name..." /></div>
                <div class="form-group"><label class="form-label">Email Address</label><input type="email" id="prof-email" class="form-control" value="${data.email}" readonly style="background:#f8fafc" /></div>
                <div class="form-group"><label class="form-label">Phone Number</label><input type="text" id="prof-phone" class="form-control" value="${data.phone || ''}" placeholder="+91 98765 43210" /></div>
                <div class="form-group"><label class="form-label">Bio/Summary</label><input type="text" id="prof-bio" class="form-control" value="${data.bio || ''}" placeholder="E.g. Aspiring Software Engineer" /></div>
              </div>
            </div>

            <div class="card" style="background: var(--glass); backdrop-filter: blur(10px);">
              <h3 style="margin-bottom: 24px; display: flex; align-items: center; gap: 12px;">🎓 Academic Information</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div class="form-group"><label class="form-label">Branch/Stream</label><input type="text" id="prof-branch" class="form-control" value="${data.branch || ''}" /></div>
                <div class="form-group"><label class="form-label">Current CGPA</label><input type="number" step="0.01" id="prof-cgpa" class="form-control" value="${data.cgpa || ''}" /></div>
                <div class="form-group"><label class="form-label">Active Backlogs</label><input type="number" id="prof-backlogs" class="form-control" value="${data.backlogs || 0}" /></div>
                <div class="form-group"><label class="form-label">Passing Year</label><input type="number" id="prof-year" class="form-control" value="${data.passing_year || ''}" /></div>
              </div>
            </div>

            <div class="card" style="background: var(--glass); backdrop-filter: blur(10px);">
              <h3 style="margin-bottom: 24px; display: flex; align-items: center; gap: 12px;">🔗 Professional Links</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div class="form-group"><label class="form-label">LinkedIn Profile</label><input type="text" id="prof-li" class="form-control" value="${data.linkedin || ''}" placeholder="linkedin.com/in/..." /></div>
                <div class="form-group"><label class="form-label">GitHub Profile</label><input type="text" id="prof-gh" class="form-control" value="${data.github || ''}" placeholder="github.com/..." /></div>
              </div>
            </div>

            <div class="card" style="background: var(--glass); backdrop-filter: blur(10px);">
              <h3 style="margin-bottom: 16px; display: flex; align-items: center; gap: 12px;">🛠 Technical Skills</h3>
              <div id="prof-skills-wrap" style="border:1px solid var(--border); padding:16px; border-radius:12px; min-height:80px; background:#ffffff"></div>
              <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 8px;">Type a skill and press Enter or comma to add a tag.</p>
            </div>

            <div style="text-align: right; margin-top: 8px; margin-bottom: 40px;">
              <button class="btn btn-primary lg" id="save-profile-btn" onclick="pages_student.handleProfileUpdate()" style="min-width: 200px; box-shadow: var(--shadow-lg);">✨ Save Profile Details</button>
            </div>
          </div>
        </div>
  `;
      components.createTagInput('prof-skills-wrap', data.skills || []);
    } catch (err) { c.innerHTML = `<div class="alert alert-error">${err.message}</div>`; }
  },

  async handleProfileUpdate() {
    const btn = document.getElementById('save-profile-btn');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = 'Saving...';

    const tags = document.getElementById('prof-skills-wrap')._getTags ? document.getElementById('prof-skills-wrap')._getTags() : [];

    const payload = {
      name: document.getElementById('prof-name').value,
      phone: document.getElementById('prof-phone').value,
      bio: document.getElementById('prof-bio').value,
      branch: document.getElementById('prof-branch').value,
      cgpa: parseFloat(document.getElementById('prof-cgpa').value) || null,
      backlogs: parseInt(document.getElementById('prof-backlogs').value) || 0,
      passing_year: parseInt(document.getElementById('prof-year').value) || null,
      linkedin: document.getElementById('prof-li').value,
      github: document.getElementById('prof-gh').value,
      skills: tags
    };

    try {
      const response = await api.auth.updateProfile(payload);

      // Update local storage and UI immediately
      if (response.user) {
        auth.setUser(response.user);
        // Refresh sidebar and topbar
        const sidebar = document.querySelector('.sidebar');
        const topbarTitle = document.querySelector('.topbar-title');
        if (sidebar) sidebar.outerHTML = components.buildSidebar(auth.getUser(), 'profile');
        if (topbarTitle) topbarTitle.textContent = 'My Profile';
      }

      btn.innerHTML = 'Saved! ✅';
      btn.style.background = 'var(--success)';
      components.showToast('Profile updated successfully! ✨');

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
  },

  /* AI Advisor */
  async renderAdvisor(c) {
    c.innerHTML = `
      <div style="max-width: 900px; margin: 0 auto;">
        <div class="card" style="background: linear-gradient(135deg, #4f46e5, #9333ea); color: white; border: none; padding: 40px; margin-bottom: 32px; border-radius: 20px; box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.4);">
          <div style="display: flex; align-items: center; gap: 24px;">
            <div style="font-size: 3rem;">🚀</div>
            <div>
              <h2 style="color: white; font-size: 2.25rem; margin-bottom: 8px;">AI Career Advisor</h2>
              <p style="color: rgba(255,255,255,0.9); font-size: 1.1rem; max-width: 500px;">Get personalized "Direction Paths" and industry match analysis powered by advanced AI.</p>
            </div>
          </div>
        </div>

        <div class="card" style="margin-bottom: 32px; padding: 32px; border-radius: 16px;">
          <h3 style="margin-bottom: 24px; display: flex; align-items: center; gap: 12px;">🎯 Set Your Career Goal</h3>
          <div style="display: flex; gap: 16px;">
            <input id="ai-target-role" class="form-control" placeholder="e.g. Senior Frontend Engineer, Cloud Architect..." style="flex: 1; padding: 14px 20px; font-size: 1.1rem; border-radius: 12px;" />
            <button class="btn btn-primary" onclick="currentDashboard.loadAIAdvice()" style="padding: 0 32px; border-radius: 12px; font-weight: 700;">Analyze Path 🔍</button>
          </div>
        </div>

        <div id="ai-advisor-results">
          <div style="text-align: center; padding: 40px; color: var(--text-muted);">
            <div style="font-size: 3rem; margin-bottom: 16px;">💡</div>
            <h3>Ready to analyze your career path?</h3>
            <p>Enter a target role above to generate your personalized roadmap.</p>
          </div>
        </div>
      </div>
  `;
  },

  async loadAIAdvice() {
    const role = document.getElementById('ai-target-role')?.value;
    const res = document.getElementById('ai-advisor-results');
    if (!role || !res) return components.showToast('Please enter a target role', 'error');

    res.innerHTML = '<div style="text-align:center;padding:100px 0"><div class="loader-spinner" style="margin:auto"></div><p style="margin-top:20px;color:var(--text-muted);font-weight:600">AI is analyzing your career path...</p></div>';

    try {
      const data = await api.ai.getAdvice(role);

      res.innerHTML = `
        <div class="fade-in">
          <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 32px; margin-bottom: 32px;">
            <div class="card" style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; text-align: center; border-radius: 20px; border: 2px solid #eef2ff;">
              ${components.progressRing(data.ai_match_score, 160, 16, 'var(--primary)')}
              <h3 style="margin-top: 24px; margin-bottom: 8px; font-size: 1.5rem;">AI Match Score</h3>
              <p style="color: var(--text-muted); font-size: 0.9rem;">How well you align with <br><strong>${data.target_role}</strong> expectations.</p>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 24px;">
              <div class="card" style="flex: 1; border-left: 6px solid #4f46e5; border-radius: 16px;">
                <h3 style="margin-bottom: 12px; font-size: 1.25rem;">🔍 Analysis Summary</h3>
                <p style="line-height: 1.7; color: var(--text); font-size: 1rem;">${data.analysis_summary}</p>
                <div style="display: flex; gap: 24px; margin-top: 24px;">
                   <div><div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 800;">Prospects</div><div style="font-weight: 700; color: var(--success);">${data.career_prospects}</div></div>
                   <div><div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 800;">Salary Indication</div><div style="font-weight: 700;">${data.salary_indication}</div></div>
                </div>
              </div>
            </div>
          </div>

          <h3 style="margin-bottom: 24px; font-size: 1.5rem; display: flex; align-items: center; gap: 12px;">🛤️ Personalized Direction Path</h3>
          <div class="card" style="padding: 0; overflow: hidden; border-radius: 20px;">
            <div style="padding: 32px; display: flex; flex-direction: column; gap: 0;">
              ${data.direction_path.map((p, i) => `
                <div style="display: flex; gap: 24px; position: relative; padding-bottom: 32px;">
                  ${i < data.direction_path.length - 1 ? '<div style="position: absolute; left: 24px; top: 48px; bottom: 0; width: 2px; background: #e2e8f0;"></div>' : ''}
                  <div style="width: 50px; height: 50px; background: ${i === 0 ? 'var(--primary)' : '#f8fafc'}; color: ${i === 0 ? 'white' : 'var(--primary)'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.25rem; z-index: 1; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 2px solid var(--primary);">${p.step}</div>
                  <div style="flex: 1; padding-top: 4px;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 4px;">
                      <h4 style="font-size: 1.25rem; font-weight: 700;">${p.title}</h4>
                      <span class="badge" style="background: ${p.difficulty === 'Expert' ? '#fee2e2' : p.difficulty === 'Hard' ? '#fef9c3' : '#e0f2fe'}; color: ${p.difficulty === 'Expert' ? '#991b1b' : p.difficulty === 'Hard' ? '#854d0e' : '#0369a1'}; border: none;">${p.difficulty}</span>
                    </div>
                    <p style="color: var(--text-muted);">${p.desc}</p>
                  </div>
                </div>
              `).join('')}
            </div>
            <div style="background: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.875rem; color: var(--text-muted); font-weight: 600;">Estimated completion: 3-5 Months</span>
              <button class="btn btn-secondary" onclick="components.showToast('Roadmap saved to your profile! 📂')">Save Path</button>
            </div>
          </div>
        </div>
  `;
    } catch (err) {
      res.innerHTML = `<div class="alert alert-error" style="border-radius:12px">${err.message}</div>`;
    }
  }
};
