// Admin Authentication
document.addEventListener('DOMContentLoaded', function() {
    // Check if admin is already logged in
    const admin = JSON.parse(localStorage.getItem('admin'));
    if (admin && window.location.pathname.includes('admin/index.html')) {
        window.location.href = 'dashboard.html';
    }
    
    // Admin login form
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('admin-email').value;
            const password = document.getElementById('admin-password').value;
            const errorElement = document.getElementById('admin-login-error');
            
            // Hardcoded admin credentials (for demo only)
            // In production, use proper authentication
            const ADMIN_EMAIL = 'admin@investpro.com';
            const ADMIN_PASSWORD = 'admin123';
            
            if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
                // Save admin session
                localStorage.setItem('admin', JSON.stringify({
                    email: ADMIN_EMAIL,
                    name: 'Admin User',
                    lastLogin: new Date().toISOString()
                }));
                
                // Redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                errorElement.textContent = 'Invalid admin credentials';
            }
        });
    }
    
    // Admin logout
    const logoutBtn = document.getElementById('admin-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('admin');
            window.location.href = 'index.html';
        });
    }
});