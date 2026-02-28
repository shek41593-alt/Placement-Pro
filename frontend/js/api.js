/* PlacementPro API Client */
const API_BASE = window.location.origin + '/api';

const api = {
    _getToken() { return localStorage.getItem('pp_token'); },
    _headers(extra = {}) {
        const h = { 'Content-Type': 'application/json', ...extra };
        const t = this._getToken();
        if (t) h['Authorization'] = `Bearer ${t}`;
        return h;
    },
    async request(method, path, body, isDownload = false) {
        const opts = { method, headers: this._headers() };
        if (body) opts.body = JSON.stringify(body);
        const res = await fetch(`${API_BASE}${path}`, opts);
        if (isDownload) return res;
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || data.message || `HTTP ${res.status}`);
        return data;
    },
    get: (path) => api.request('GET', path),
    post: (path, body) => api.request('POST', path, body),
    put: (path, body) => api.request('PUT', path, body),
    patch: (path, body) => api.request('PATCH', path, body),
    delete: (path) => api.request('DELETE', path),

    /* Auth */
    auth: {
        login: (body) => api.post('/auth/login', body),
        register: (body) => api.post('/auth/register', body),
        profile: () => api.get('/auth/profile'),
        updateProfile: (body) => api.put('/auth/profile', body),
    },
    /* Drives */
    drives: {
        all: () => api.get('/drives'),
        eligible: () => api.get('/drives/eligible'),
        get: (id) => api.get(`/drives/${id}`),
        create: (b) => api.post('/drives', b),
        update: (id, b) => api.put(`/drives/${id}`, b),
        delete: (id) => api.delete(`/drives/${id}`),
        notify: (id) => api.post(`/drives/${id}/notify`, {}),
        previewEligible: (b) => api.post('/drives/preview-eligible', b),
        eligibleCount: () => api.get('/drives/eligible-count'),
    },
    /* Applications */
    applications: {
        apply: (b) => api.post('/applications/apply', b),
        my: () => api.get('/applications/my'),
        all: (drive_id) => api.get('/applications/all' + (drive_id ? `?drive_id=${drive_id}` : '')),
        updateStatus: (id, status) => api.patch(`/applications/${id}/status`, { status }),
        stats: () => api.get('/applications/stats'),
    },
    /* Interviews */
    interviews: {
        all: (drive_id) => api.get('/interviews' + (drive_id ? `?drive_id=${drive_id}` : '')),
        my: () => api.get('/interviews/my'),
        schedule: (b) => api.post('/interviews', b),
        update: (id, b) => api.put(`/interviews/${id}`, b),
        delete: (id) => api.delete(`/interviews/${id}`),
    },
    /* Resume */
    resume: {
        generate: (b) => api.post('/resume/generate', b),
        history: () => api.get('/resume/history'),
        downloadUrl: (fn) => `${API_BASE}/resume/download/${fn}`,
    },
    /* Alumni */
    alumni: {
        referrals: () => api.get('/alumni/referrals'),
        createReferral: (b) => api.post('/alumni/referrals', b),
        updateReferral: (id, b) => api.put(`/alumni/referrals/${id}`, b),
        deleteReferral: (id) => api.delete(`/alumni/referrals/${id}`),
        mentorship: (avail) => api.get('/alumni/mentorship' + (avail ? '?available_only=true' : '')),
        createSlot: (b) => api.post('/alumni/mentorship', b),
        deleteSlot: (id) => api.delete(`/alumni/mentorship/${id}`),
        bookSlot: (id) => api.post(`/alumni/mentorship/${id}/book`, {}),
        mySlots: () => api.get('/alumni/mentorship/my'),
    },
    /* Analytics */
    analytics: {
        overview: () => api.get('/analytics/dashboard'),
        skillGap: (role) => api.get('/analytics/skill-gap' + (role ? `?target_role=${encodeURIComponent(role)}` : '')),
        trends: () => api.get('/analytics/placement-stats'),
    },
    /* Bot */
    bot: {
        chat: (message) => api.post('/bot/chat', { message }),
        getFaqs: () => api.get('/bot/faqs'),
        addFaq: (b) => api.post('/bot/faqs', b),
        deleteFaq: (id) => api.delete(`/bot/faqs/${id}`),
        history: () => api.get('/bot/history'),
    },
    /* Notifications */
    notifications: {
        all: () => api.get('/notifications'),
        unreadCount: () => api.get('/notifications/unread-count'),
        markRead: (id) => api.patch(`/notifications/${id}/read`, {}),
        markAllRead: () => api.patch('/notifications/mark-all-read', {}),
        purgeRead: () => api.delete('/notifications/purge-read'),
        create: (b) => api.post('/notifications', b),
        getBroadcasts: () => api.get('/notifications/broadcasts'),
    },
    /* AI Advisor */
    ai: {
        getAdvice: (role) => api.post('/ai/career-advice', { target_role: role }),
    },
    debug: {
        resetSystem: () => api.post('/debug/reset', {}),
    }
};
