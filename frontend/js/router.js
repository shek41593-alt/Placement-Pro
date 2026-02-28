/* Router - SPA Navigation */
const router = {
    current: null,
    navigate(page, params = {}) {
        this.current = page;
        window.location.hash = `#${page}`;
        this.render(page, params);
    },
    render(page, params = {}) {
        const app = document.getElementById('app');
        app.innerHTML = '';
        const pages = {
            'landing': pages_landing,
            'login': pages_login,
            'tpo': pages_tpo,
            'student': pages_student,
            'alumni': pages_alumni,
        };
        if (pages[page]) pages[page].render(app, params);
        else pages_login.render(app, {});
    },
    init() {
        const hash = window.location.hash.replace('#', '') || '';
        const user = auth.getUser();
        const isLoggedIn = auth.isLoggedIn();

        if (!isLoggedIn) {
            if (hash === 'login') {
                this.navigate('login');
            } else {
                this.navigate('landing');
            }
        } else {
            // If logged in, redirect to correct dashboard if trying to access login, landing or empty hash
            if (!hash || hash === 'login' || hash === 'landing') {
                this.navigate(user.role);
            } else if (hash !== user.role) {
                // Stricter: Don't let user access other dashboards
                this.navigate(user.role);
            } else {
                this.render(hash);
            }
        }
    }
};
