/* Login Page & Portal Entry */
const pages_login = {
  selectedRole: null, // 'student', 'tpo', 'alumni'
  isRegistering: false,

  render(container) {
    if (!this.selectedRole) {
      this.renderPortalSelection(container);
    } else {
      this.renderLoginForm(container);
    }
  },

  renderPortalSelection(container) {
    container.innerHTML = `
      <div class="login-page fade-in">
        <div style="max-width: 900px; width: 100%;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="margin-bottom: 12px; color: var(--primary);">PlacementPro Portal</h1>
            <p style="font-size: 1.125rem; color: var(--text-muted);">Select your gateway to campus career intelligence</p>
          </div>
          
          <div class="portal-grid">
            <div class="portal-card" onclick="pages_login.selectPortal('student')">
              <span class="portal-icon">🎓</span>
              <h2 class="portal-name">Student Portal</h2>
              <p class="portal-desc">Apply for jobs, build your resume, and connect with alumni mentors.</p>
              <button class="btn btn-primary btn-sm" style="margin-top: 20px;">Enter Portal →</button>
            </div>
            
            <div class="portal-card" onclick="pages_login.selectPortal('tpo')">
              <span class="portal-icon">🏢</span>
              <h2 class="portal-name">TPO Portal</h2>
              <p class="portal-desc">Manage drives, track applications, and coordinate placement activities.</p>
              <button class="btn btn-primary btn-sm" style="margin-top: 20px;">Enter Portal →</button>
            </div>
            
            <div class="portal-card" onclick="pages_login.selectPortal('alumni')">
              <span class="portal-icon">🤝</span>
              <h2 class="portal-name">Alumni Portal</h2>
              <p class="portal-desc">Refer students for jobs and mentor the next generation of professionals.</p>
              <button class="btn btn-primary btn-sm" style="margin-top: 20px;">Enter Portal →</button>
            </div>
          </div>
          
          <div style="margin-top: 60px; text-align: center; color: var(--text-muted); font-size: 0.875rem;">
            © 2026 PlacementPro Intelligence System
          </div>
        </div>
      </div>
    `;
  },

  selectPortal(role) {
    this.selectedRole = role;
    this.render(document.getElementById('app'));
  },

  renderLoginForm(container) {
    const roleTitle = this.selectedRole.charAt(0).toUpperCase() + this.selectedRole.slice(1);
    container.innerHTML = `
      <div class="login-page fade-in">
        <div class="login-card">
          <button class="btn btn-secondary btn-sm" style="margin-bottom: 24px;" onclick="pages_login.selectedRole=null;pages_login.render(document.getElementById('app'))">← Back to Portals</button>
          
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="font-size: 40px; margin-bottom: 12px;">${this.selectedRole === 'student' ? '🎓' : (this.selectedRole === 'tpo' ? '🏢' : '🤝')}</div>
            <h2 style="margin-bottom: 8px;">${roleTitle} ${this.isRegistering ? 'Registration' : 'Login'}</h2>
            <p style="font-size: 0.875rem; color: var(--text-muted);">Enter your credentials to access your dashboard</p>
          </div>

          <form id="login-form" onsubmit="pages_login.handleSubmit(event)">
            ${this.isRegistering ? `
              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input type="text" id="reg-name" class="form-control" placeholder="John Doe" required />
              </div>
            ` : ''}
            
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input type="email" id="login-email" class="form-control" placeholder="name@example.edu" required />
            </div>
            
            <div class="form-group">
              <label class="form-label">Password</label>
              <input type="password" id="login-password" class="form-control" placeholder="••••••••" required />
            </div>

            ${this.isRegistering && this.selectedRole === 'student' ? `
              <div class="grid-2" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
                <div class="form-group">
                  <label class="form-label">Passing Year</label>
                  <input type="number" id="reg-year" class="form-control" placeholder="2025" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Branch</label>
                  <input type="text" id="reg-branch" class="form-control" placeholder="CSE" required />
                </div>
              </div>
            ` : ''}

            <button type="submit" class="btn btn-primary lg" style="width: 100%; margin-top: 8px;">
              ${this.isRegistering ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div style="margin-top: 24px; text-align: center; font-size: 0.875rem;">
            ${this.isRegistering ?
        `Already have an account? <a href="#" onclick="pages_login.toggleMode(false)">Sign in</a>` :
        `Don't have an account? <a href="#" onclick="pages_login.toggleMode(true)">Create one</a>`}
          </div>
        </div>
      </div>
    `;
  },

  toggleMode(isReg) {
    this.isRegistering = isReg;
    this.render(document.getElementById('app'));
  },

  async handleSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Processing...';

    try {
      if (this.isRegistering) {
        const name = document.getElementById('reg-name').value;
        const extra = {};
        if (this.selectedRole === 'student') {
          extra.passing_year = document.getElementById('reg-year').value;
          extra.branch = document.getElementById('reg-branch').value;
        }
        await api.auth.register({ name, email, password, role: this.selectedRole, ...extra });
        components.showToast('Registration successful! Please login.');
        this.isRegistering = false;
        this.render(document.getElementById('app'));
      } else {
        const data = await api.auth.login({ email, password });

        // Ensure role matches portal selected on landing page
        if (data.user.role !== this.selectedRole) {
          throw new Error(`Unauthorized. This account is registered as ${data.user.role}. Please enter through the ${data.user.role} portal.`);
        }

        auth.save(data.user, data.token);
        components.showToast(`Welcome back, ${data.user.name}!`);
        router.navigate(data.user.role);
      }
    } catch (err) {
      components.showToast(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  }
};
