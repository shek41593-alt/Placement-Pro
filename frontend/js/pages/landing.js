/* Landing Page Component – Premium Edition */
const pages_landing = {
    render(container) {
        container.innerHTML = `
      <div class="landing-page fade-in" id="landing-root">

        <!-- NAVBAR -->
        <nav class="landing-nav" id="landing-nav">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="background:linear-gradient(135deg,#2563eb,#7c3aed);color:white;width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:10px;font-weight:900;font-size:20px;box-shadow:0 4px 14px rgba(37,99,235,0.4);">P</div>
            <span style="font-size:1.375rem;font-weight:800;background:linear-gradient(135deg,#2563eb,#7c3aed);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">PlacementPro</span>
          </div>
          <div style="display:flex;align-items:center;gap:16px;">
            <a href="#features" onclick="event.preventDefault();document.getElementById('features').scrollIntoView({behavior:'smooth'})" style="color:#475569;font-weight:600;font-size:0.875rem;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='#2563eb'" onmouseout="this.style.color='#475569'">Features</a>
            <a href="#portals" onclick="event.preventDefault();document.getElementById('portals').scrollIntoView({behavior:'smooth'})" style="color:#475569;font-weight:600;font-size:0.875rem;text-decoration:none;transition:color 0.2s;" onmouseover="this.style.color='#2563eb'" onmouseout="this.style.color='#475569'">Portals</a>
            <a href="#login" onclick="event.preventDefault();router.navigate('login')" class="btn btn-secondary" style="font-size:0.875rem;padding:8px 20px;">Sign In</a>
            <a href="#portals" onclick="event.preventDefault();document.getElementById('portals').scrollIntoView({behavior:'smooth'})" class="btn btn-primary" style="font-size:0.875rem;padding:8px 20px;background:linear-gradient(135deg,#2563eb,#7c3aed);border:none;box-shadow:0 4px 14px rgba(37,99,235,0.35);">Get Started →</a>
          </div>
        </nav>

        <!-- HERO -->
        <header class="landing-hero" style="padding:140px 8% 100px;background:radial-gradient(ellipse at 60% 0%,rgba(37,99,235,0.08) 0,transparent 60%),radial-gradient(ellipse at 0% 80%,rgba(124,58,237,0.06) 0,transparent 60%),#fff;">
          <!-- Floating orbs -->
          <div style="position:absolute;top:80px;right:10%;width:300px;height:300px;background:radial-gradient(circle,rgba(37,99,235,0.12),transparent 70%);border-radius:50%;pointer-events:none;animation:floatOrb 6s ease-in-out infinite;"></div>
          <div style="position:absolute;bottom:20%;left:5%;width:200px;height:200px;background:radial-gradient(circle,rgba(124,58,237,0.1),transparent 70%);border-radius:50%;pointer-events:none;animation:floatOrb 8s ease-in-out infinite reverse;"></div>

          <div class="hero-badge" style="animation:slideUp 0.6s ease-out both;">🎓 Campus Career Intelligence Platform · 2026</div>

          <h1 class="hero-title" style="font-size:clamp(2.75rem,5.5vw,4.5rem);line-height:1.05;letter-spacing:-0.03em;max-width:860px;animation:slideUp 0.8s 0.1s ease-out both;">
            Your Campus Placement<br>
            <span style="background:linear-gradient(135deg,#2563eb,#7c3aed,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">Journey, Reimagined.</span>
          </h1>

          <p class="hero-subtitle" style="font-size:1.2rem;max-width:640px;margin-top:24px;animation:slideUp 0.8s 0.2s ease-out both;">
            An intelligent, role-based ecosystem linking <strong>Students</strong>, <strong>TPOs</strong>, and <strong>Alumni</strong> — with AI-powered career advice, live skill gap analysis, and seamless resume building.
          </p>

          <div class="hero-cta" style="margin-top:48px;animation:slideUp 0.8s 0.3s ease-out both;">
            <button onclick="document.getElementById('portals').scrollIntoView({behavior:'smooth'})" class="btn btn-primary" style="padding:16px 36px;font-size:1rem;font-weight:700;border-radius:14px;background:linear-gradient(135deg,#2563eb,#7c3aed);border:none;box-shadow:0 8px 24px rgba(37,99,235,0.35);transition:transform 0.2s,box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 12px 30px rgba(37,99,235,0.45)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 8px 24px rgba(37,99,235,0.35)'">
              🚀 Explore Portals
            </button>
            <button onclick="document.getElementById('features').scrollIntoView({behavior:'smooth'})" class="btn btn-secondary" style="padding:16px 36px;font-size:1rem;font-weight:600;border-radius:14px;border:2px solid #e2e8f0;box-shadow:0 4px 12px rgba(0,0,0,0.06);transition:transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
              Learn More ↓
            </button>
          </div>

          <!-- Hero trust badges -->
          <div style="margin-top:64px;display:flex;gap:32px;flex-wrap:wrap;justify-content:center;animation:slideUp 0.8s 0.4s ease-out both;">
            <div style="display:flex;align-items:center;gap:8px;color:#64748b;font-size:0.875rem;font-weight:600;">
              <span style="color:#10b981;font-size:1.1rem;">✓</span> No login required to explore
            </div>
            <div style="display:flex;align-items:center;gap:8px;color:#64748b;font-size:0.875rem;font-weight:600;">
              <span style="color:#10b981;font-size:1.1rem;">✓</span> AI-Powered Career Advice
            </div>
            <div style="display:flex;align-items:center;gap:8px;color:#64748b;font-size:0.875rem;font-weight:600;">
              <span style="color:#10b981;font-size:1.1rem;">✓</span> Real-time Placement Tracking
            </div>
          </div>
        </header>

        <!-- STATS BAR -->
        <div style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:48px 8%;display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:32px;text-align:center;">
          ${[
                { num: '2,400+', label: 'Students Placed' },
                { num: '120+', label: 'Partner Companies' },
                { num: '95%', label: 'Placement Rate' },
                { num: '3x', label: 'Faster Applications' },
            ].map(s => `
            <div class="landing-stat-item">
              <div style="font-size:2.25rem;font-weight:900;background:linear-gradient(135deg,#60a5fa,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">${s.num}</div>
              <div style="font-size:0.875rem;color:#94a3b8;margin-top:4px;font-weight:600;">${s.label}</div>
            </div>
          `).join('')}
        </div>

        <!-- FEATURES -->
        <section id="features" class="landing-section" style="background:#f8fafc;">
          <div class="section-header" style="margin-bottom:64px;">
            <div style="display:inline-block;background:#eff6ff;color:#2563eb;padding:6px 16px;border-radius:999px;font-size:0.8rem;font-weight:700;margin-bottom:16px;border:1px solid #bfdbfe;">FEATURES</div>
            <h2 style="font-size:2.5rem;font-weight:800;color:#0f172a;margin-bottom:16px;">Built for every stakeholder</h2>
            <p style="font-size:1.1rem;max-width:580px;margin:0 auto;">Streamlined tools for every step of the campus placement journey.</p>
          </div>
          <div class="feature-grid" style="gap:28px;">
            ${[
                { icon: '🤖', title: 'AI Career Advisor', desc: 'Get personalized career roadmaps, match scores, and skill-gap analysis powered by intelligent algorithms.', color: '#4f46e5' },
                { icon: '📄', title: 'Resume Wizard', desc: 'Build ATS-optimized PDFs in minutes with our guided 5-step resume builder tailored for recruiters.', color: '#0ea5e9' },
                { icon: '📊', title: 'Live Placement Analytics', desc: 'Real-time tracking of applications, drive status, and placement trends with beautiful dashboards.', color: '#10b981' },
                { icon: '🎓', title: 'Alumni Connect', desc: 'Access referrals and book mentorship sessions with industry professionals who were where you are.', color: '#f59e0b' },
                { icon: '📅', title: 'Interview Scheduler', desc: 'Manage all your interview slots, meeting links, and round statuses from a single unified calendar.', color: '#ec4899' },
                { icon: '🔔', title: 'Smart Notifications', desc: 'Never miss a drive deadline or interview update with intelligent real-time notification alerts.', color: '#8b5cf6' },
            ].map(f => `
              <div class="feature-card" style="display:flex;gap:24px;align-items:flex-start;padding:32px;border-radius:20px;background:white;border:1px solid #e2e8f0;transition:all 0.3s;cursor:default;" onmouseover="this.style.transform='translateY(-6px)';this.style.boxShadow='0 20px 40px rgba(0,0,0,0.08)';this.style.borderColor='${f.color}'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='';this.style.borderColor='#e2e8f0'">
                <div style="width:52px;height:52px;background:${f.color}18;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;flex-shrink:0;">${f.icon}</div>
                <div>
                  <h3 style="font-weight:700;color:#0f172a;margin-bottom:8px;">${f.title}</h3>
                  <p style="font-size:0.875rem;line-height:1.65;color:#64748b;">${f.desc}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- HOW IT WORKS -->
        <section style="padding:100px 8%;background:white;">
          <div class="section-header" style="margin-bottom:64px;">
            <div style="display:inline-block;background:#f0fdf4;color:#10b981;padding:6px 16px;border-radius:999px;font-size:0.8rem;font-weight:700;margin-bottom:16px;border:1px solid #bbf7d0;">HOW IT WORKS</div>
            <h2 style="font-size:2.5rem;font-weight:800;color:#0f172a;margin-bottom:16px;">Up and running in minutes</h2>
            <p style="font-size:1.1rem;max-width:560px;margin:0 auto;">Your personalized placement hub is just 3 steps away.</p>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:40px;max-width:900px;margin:0 auto;">
            ${[
                { step: '1', icon: '🎯', title: 'Choose Your Portal', desc: 'Select your role as a Student, TPO, or Alumni.' },
                { step: '2', icon: '👤', title: 'Complete Your Profile', desc: 'Fill in academic details, skills, and goals in minutes.' },
                { step: '3', icon: '🚀', title: 'Unlock Opportunities', desc: 'Apply to drives, get AI advice, and track progress live.' },
            ].map(s => `
              <div style="text-align:center;position:relative;">
                <div style="width:64px;height:64px;background:linear-gradient(135deg,#2563eb,#7c3aed);color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.5rem;margin:0 auto 20px;box-shadow:0 8px 20px rgba(37,99,235,0.3);">${s.icon}</div>
                <div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:#eff6ff;color:#2563eb;font-size:0.65rem;font-weight:900;padding:2px 8px;border-radius:99px;border:1px solid #bfdbfe;">STEP ${s.step}</div>
                <h3 style="font-weight:700;color:#0f172a;margin-bottom:8px;">${s.title}</h3>
                <p style="font-size:0.875rem;color:#64748b;">${s.desc}</p>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- PORTALS -->
        <section id="portals" class="portal-selection-section" style="background:linear-gradient(135deg,#0f172a 0%,#1e1b4b 100%);border-radius:60px 60px 0 0;padding:100px 8%;">
          <div class="section-header" style="margin-bottom:64px;">
            <div style="display:inline-block;background:rgba(255,255,255,0.1);color:white;padding:6px 16px;border-radius:999px;font-size:0.8rem;font-weight:700;margin-bottom:16px;border:1px solid rgba(255,255,255,0.2);">CHOOSE YOUR GATEWAY</div>
            <h2 style="font-size:2.5rem;font-weight:800;color:white;margin-bottom:16px;">Select Your Role</h2>
            <p style="color:#94a3b8;font-size:1.1rem;max-width:520px;margin:0 auto;">Each portal is tailored with the tools and insights you need most.</p>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:28px;max-width:1060px;margin:0 auto;">

            <!-- Student Portal -->
            <div onclick="pages_landing.enterPortal('student')" style="background:linear-gradient(135deg,rgba(37,99,235,0.15),rgba(37,99,235,0.05));border:1px solid rgba(37,99,235,0.3);padding:40px 32px;border-radius:24px;cursor:pointer;transition:all 0.35s;text-align:center;position:relative;overflow:hidden;" onmouseover="this.style.transform='translateY(-8px)';this.style.borderColor='#2563eb';this.style.background='linear-gradient(135deg,rgba(37,99,235,0.25),rgba(37,99,235,0.1))'" onmouseout="this.style.transform='translateY(0)';this.style.borderColor='rgba(37,99,235,0.3)';this.style.background='linear-gradient(135deg,rgba(37,99,235,0.15),rgba(37,99,235,0.05))'">
              <div style="position:absolute;top:-30px;right:-30px;width:100px;height:100px;background:rgba(37,99,235,0.1);border-radius:50%;"></div>
              <div style="font-size:3rem;margin-bottom:20px;">🎓</div>
              <h2 style="color:white;font-size:1.4rem;font-weight:800;margin-bottom:12px;">Student Portal</h2>
              <p style="color:#94a3b8;font-size:0.9rem;line-height:1.6;margin-bottom:28px;">Apply for jobs, get AI career advice, build your resume, and connect with alumni mentors.</p>
              <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:28px;">
                <span style="background:rgba(37,99,235,0.2);color:#93c5fd;font-size:0.7rem;font-weight:700;padding:3px 10px;border-radius:99px;">AI Advisor</span>
                <span style="background:rgba(37,99,235,0.2);color:#93c5fd;font-size:0.7rem;font-weight:700;padding:3px 10px;border-radius:99px;">Resume Builder</span>
                <span style="background:rgba(37,99,235,0.2);color:#93c5fd;font-size:0.7rem;font-weight:700;padding:3px 10px;border-radius:99px;">Skill Gap</span>
              </div>
              <button class="btn" style="background:linear-gradient(135deg,#2563eb,#3b82f6);color:white;border:none;padding:12px 32px;border-radius:12px;font-weight:700;width:100%;font-size:0.95rem;box-shadow:0 4px 14px rgba(37,99,235,0.4);">Enter as Student →</button>
            </div>

            <!-- TPO Portal -->
            <div onclick="pages_landing.enterPortal('tpo')" style="background:linear-gradient(135deg,rgba(124,58,237,0.15),rgba(124,58,237,0.05));border:1px solid rgba(124,58,237,0.3);padding:40px 32px;border-radius:24px;cursor:pointer;transition:all 0.35s;text-align:center;position:relative;overflow:hidden;" onmouseover="this.style.transform='translateY(-8px)';this.style.borderColor='#7c3aed';this.style.background='linear-gradient(135deg,rgba(124,58,237,0.25),rgba(124,58,237,0.1))'" onmouseout="this.style.transform='translateY(0)';this.style.borderColor='rgba(124,58,237,0.3)';this.style.background='linear-gradient(135deg,rgba(124,58,237,0.15),rgba(124,58,237,0.05))'">
              <div style="position:absolute;top:-30px;right:-30px;width:100px;height:100px;background:rgba(124,58,237,0.1);border-radius:50%;"></div>
              <div style="font-size:3rem;margin-bottom:20px;">🏢</div>
              <h2 style="color:white;font-size:1.4rem;font-weight:800;margin-bottom:12px;">TPO Portal</h2>
              <p style="color:#94a3b8;font-size:0.9rem;line-height:1.6;margin-bottom:28px;">Manage placement drives, track all applications, schedule interviews, and view live analytics.</p>
              <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:28px;">
                <span style="background:rgba(124,58,237,0.2);color:#c4b5fd;font-size:0.7rem;font-weight:700;padding:3px 10px;border-radius:99px;">Drive Manager</span>
                <span style="background:rgba(124,58,237,0.2);color:#c4b5fd;font-size:0.7rem;font-weight:700;padding:3px 10px;border-radius:99px;">Analytics</span>
                <span style="background:rgba(124,58,237,0.2);color:#c4b5fd;font-size:0.7rem;font-weight:700;padding:3px 10px;border-radius:99px;">Scheduler</span>
              </div>
              <button class="btn" style="background:linear-gradient(135deg,#7c3aed,#8b5cf6);color:white;border:none;padding:12px 32px;border-radius:12px;font-weight:700;width:100%;font-size:0.95rem;box-shadow:0 4px 14px rgba(124,58,237,0.4);">Enter as TPO →</button>
            </div>

            <!-- Alumni Portal -->
            <div onclick="pages_landing.enterPortal('alumni')" style="background:linear-gradient(135deg,rgba(16,185,129,0.15),rgba(16,185,129,0.05));border:1px solid rgba(16,185,129,0.3);padding:40px 32px;border-radius:24px;cursor:pointer;transition:all 0.35s;text-align:center;position:relative;overflow:hidden;" onmouseover="this.style.transform='translateY(-8px)';this.style.borderColor='#10b981';this.style.background='linear-gradient(135deg,rgba(16,185,129,0.25),rgba(16,185,129,0.1))'" onmouseout="this.style.transform='translateY(0)';this.style.borderColor='rgba(16,185,129,0.3)';this.style.background='linear-gradient(135deg,rgba(16,185,129,0.15),rgba(16,185,129,0.05))'">
              <div style="position:absolute;top:-30px;right:-30px;width:100px;height:100px;background:rgba(16,185,129,0.1);border-radius:50%;"></div>
              <div style="font-size:3rem;margin-bottom:20px;">🤝</div>
              <h2 style="color:white;font-size:1.4rem;font-weight:800;margin-bottom:12px;">Alumni Portal</h2>
              <p style="color:#94a3b8;font-size:0.9rem;line-height:1.6;margin-bottom:28px;">Post referrals, manage mentorship slots, and give back to your campus community.</p>
              <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:28px;">
                <span style="background:rgba(16,185,129,0.2);color:#6ee7b7;font-size:0.7rem;font-weight:700;padding:3px 10px;border-radius:99px;">Job Referrals</span>
                <span style="background:rgba(16,185,129,0.2);color:#6ee7b7;font-size:0.7rem;font-weight:700;padding:3px 10px;border-radius:99px;">Mentorship</span>
                <span style="background:rgba(16,185,129,0.2);color:#6ee7b7;font-size:0.7rem;font-weight:700;padding:3px 10px;border-radius:99px;">Network</span>
              </div>
              <button class="btn" style="background:linear-gradient(135deg,#059669,#10b981);color:white;border:none;padding:12px 32px;border-radius:12px;font-weight:700;width:100%;font-size:0.95rem;box-shadow:0 4px 14px rgba(16,185,129,0.4);">Enter as Alumni →</button>
            </div>
          </div>
        </section>

        <!-- TESTIMONIALS -->
        <section style="background:#0f172a;padding:80px 8%;">
          <div class="section-header" style="margin-bottom:48px;">
            <h2 style="font-size:1.75rem;font-weight:800;color:white;margin-bottom:8px;">Trusted by students across campuses</h2>
            <p style="color:#64748b;">Real stories from our community.</p>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;">
            ${[
                { name: 'Priya Sharma', role: 'B.Tech CSE · Placed at Google', quote: 'The AI Advisor literally told me exactly what skills I was missing. Got my dream offer in 3 months!' },
                { name: 'Rahul Mehta', role: 'TPO · BITS Pilani', quote: 'Managing 500+ student applications used to be chaos. PlacementPro made it seamless with real-time tracking.' },
                { name: 'Ananya Reddy', role: 'Alumni · Microsoft SDE', quote: 'Giving back is easy now. I post referrals in 2 minutes and can book mentorship slots directly.' },
            ].map(t => `
              <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:28px;transition:all 0.3s;" onmouseover="this.style.borderColor='rgba(255,255,255,0.2)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.08)'">
                <div style="display:flex;gap:4px;margin-bottom:16px;">${'⭐'.repeat(5)}</div>
                <p style="color:#cbd5e1;font-style:italic;line-height:1.7;font-size:0.9rem;margin-bottom:20px;">"${t.quote}"</p>
                <div style="display:flex;align-items:center;gap:12px;">
                  <div style="width:40px;height:40px;background:linear-gradient(135deg,#2563eb,#7c3aed);border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:800;">${t.name[0]}</div>
                  <div>
                    <div style="color:white;font-weight:700;font-size:0.875rem;">${t.name}</div>
                    <div style="color:#64748b;font-size:0.75rem;">${t.role}</div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- CTA BANNER -->
        <section style="background:linear-gradient(135deg,#2563eb,#7c3aed);padding:80px 8%;text-align:center;">
          <h2 style="color:white;font-size:2.25rem;font-weight:800;margin-bottom:16px;">Ready to accelerate your career?</h2>
          <p style="color:rgba(255,255,255,0.8);font-size:1.1rem;margin-bottom:40px;max-width:520px;margin-left:auto;margin-right:auto;">Join thousands of students who have already landed their dream jobs through PlacementPro.</p>
          <button onclick="document.getElementById('portals').scrollIntoView({behavior:'smooth'})" class="btn" style="background:white;color:#2563eb;border:none;padding:16px 48px;border-radius:14px;font-size:1rem;font-weight:800;box-shadow:0 8px 24px rgba(0,0,0,0.15);transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
            🚀 Get Started Free
          </button>
        </section>

        <!-- FOOTER -->
        <footer style="background:#0f172a;padding:48px 8%;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;border-top:1px solid rgba(255,255,255,0.06);">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="background:linear-gradient(135deg,#2563eb,#7c3aed);color:white;width:30px;height:30px;display:flex;align-items:center;justify-content:center;border-radius:8px;font-weight:900;font-size:16px;">P</div>
            <span style="color:white;font-weight:700;font-size:1rem;">PlacementPro</span>
          </div>
          <p style="color:#475569;font-size:0.8rem;">© 2026 PlacementPro Intelligence System. Built for campus excellence.</p>
          <div style="display:flex;gap:16px;">
            <button onclick="router.navigate('login')" style="background:none;border:none;color:#64748b;font-size:0.8rem;cursor:pointer;font-weight:600;transition:color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#64748b'">Sign In</button>
            <button onclick="document.getElementById('portals').scrollIntoView({behavior:'smooth'})" style="background:none;border:none;color:#64748b;font-size:0.8rem;cursor:pointer;font-weight:600;transition:color 0.2s;" onmouseover="this.style.color='white'" onmouseout="this.style.color='#64748b'">Portals</button>
          </div>
        </footer>

      </div>

      <style>
        @keyframes floatOrb {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }
        .landing-stat-item { transition: transform 0.3s; }
        .landing-stat-item:hover { transform: translateY(-4px); }
        #landing-nav {
          transition: background 0.3s, box-shadow 0.3s;
        }
        #landing-nav.scrolled {
          background: rgba(255,255,255,0.95);
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
      </style>
    `;

        // Scrolling navbar effect
        const root = document.getElementById('landing-root');
        if (root) {
            root.parentElement.addEventListener('scroll', () => {
                const nav = document.getElementById('landing-nav');
                if (!nav) return;
                const scrolled = root.parentElement.scrollTop > 50;
                nav.classList.toggle('scrolled', scrolled);
            }, { passive: true });
        }

        // Also listen on window scroll
        window.addEventListener('scroll', () => {
            const nav = document.getElementById('landing-nav');
            if (!nav) return;
            nav.classList.toggle('scrolled', window.scrollY > 50);
        }, { passive: true });
    },

    enterPortal(role) {
        pages_login.selectedRole = role;
        router.navigate('login');
    }
};
