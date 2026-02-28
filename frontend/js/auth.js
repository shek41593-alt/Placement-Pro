/* Auth state management */
const auth = {
    getUser() {
        try { return JSON.parse(localStorage.getItem('pp_user')); } catch { return null; }
    },
    getToken() { return localStorage.getItem('pp_token'); },
    isLoggedIn() { return !!this.getToken(); },
    save(user, token) {
        localStorage.setItem('pp_user', JSON.stringify(user));
        localStorage.setItem('pp_token', token);
    },
    setUser(user) {
        const current = this.getUser() || {};
        localStorage.setItem('pp_user', JSON.stringify({ ...current, ...user }));
    },
    logout() {
        localStorage.removeItem('pp_user');
        localStorage.removeItem('pp_token');
        router.navigate('login');
    }
};
