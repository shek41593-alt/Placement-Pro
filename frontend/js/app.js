/* App Entry Point */
window.addEventListener('DOMContentLoaded', () => {
    // Hide loader, start router
    setTimeout(() => {
        const loader = document.getElementById('page-loader');
        if (loader) { loader.style.opacity = '0'; setTimeout(() => loader.remove(), 400); }
        // Set currentDashboard based on role
        const user = auth.getUser();
        if (user) {
            if (user.role === 'tpo') currentDashboard = pages_tpo;
            else if (user.role === 'alumni') currentDashboard = pages_alumni;
            else {
                currentDashboard = pages_student;
                components.loadEligibleCount();
            }
        }
        router.init();
        components.loadNotifCount();
    }, 600);
});
