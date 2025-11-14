// ✅ Check if user is logged in (keeps original redirect behaviour)
function checkLogin() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Redirects for access control (preserve original behaviour)
    if (!isLoggedIn && currentPage !== 'login.html') {
        window.location.href = 'login.html';
    }

    if (isLoggedIn && currentPage === 'login.html') {
        window.location.href = 'index.html';
    }

    // Update user info if logged in
    if (isLoggedIn) {
        updateUserInfo();
    }
}

// ===================== HANDLE LOGIN (backwards-compatible) =====================
function handleLogin(event) {
    event && event.preventDefault && event.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    // First try the users[] array (if exists)
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let user = users.find(u => u.email === email && u.password === password);

    // Fallback to single-user keys for backward compatibility
    if (!user) {
        const storedEmail = localStorage.getItem('userEmail');
        const storedPassword = localStorage.getItem('userPassword');
        const storedName = localStorage.getItem('userName');

        if (email === storedEmail && password === storedPassword) {
            user = { email: storedEmail, password: storedPassword, name: storedName || '' };
            // Ensure the users[] array includes this user (sync)
            users = users.filter(u => u.email !== storedEmail);
            users.push({ name: user.name, email: user.email, password: user.password });
            localStorage.setItem('users', JSON.stringify(users));
        }
    }

    if (!user) {
        showNotification('❌ Invalid email or password!', 'red');
        return;
    }

    // Successful login (preserve original session keys)
    sessionStorage.setItem('isLoggedIn', 'true');
    sessionStorage.setItem('userEmail', user.email);
    sessionStorage.setItem('userName', user.name || '');
    sessionStorage.setItem('userPassword', user.password);

    showNotification('✅ Login successful!', 'limegreen');

    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1200);
}

// ===================== HANDLE SIGNUP (keeps existing single-key behavior + users[]) =====================
function handleSignup(event) {
    event && event.preventDefault && event.preventDefault();

    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value.trim();

    if (!name || !email || !password) {
        showNotification('⚠️ Please fill all fields!', 'orange');
        return;
    }

    // Load or init users array
    let users = JSON.parse(localStorage.getItem('users')) || [];

    // If email already exists in users[], notify
    if (users.some(u => u.email === email)) {
        showNotification('⚠️ Email already registered!', 'orange');
        return;
    }

    // Push to users[] (primary source going forward)
    users.push({ name, email, password });
    localStorage.setItem('users', JSON.stringify(users));

    // ALSO keep the original single-user keys (so existing flows that read them keep working)
    localStorage.setItem('userName', name);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userPassword', password);

    showNotification('🎉 Account created successfully! Please login.', '#00eaff');

    // Switch back to login form (preserve original behaviour)
    setTimeout(() => {
        showLogin();
    }, 1000);
}

// ===================== FORM SWITCH HELPERS (preserve existing functions) =====================
function showLogin() {
    document.getElementById('signup-form')?.classList.remove('active');
    document.getElementById('login-form')?.classList.add('active');
}

function showSignup() {
    document.getElementById('login-form')?.classList.remove('active');
    document.getElementById('signup-form')?.classList.add('active');
}

// ===================== Update user info on navbar (if applicable) =====================
function updateUserInfo() {
    const userName = sessionStorage.getItem('userName');
    const userEmail = sessionStorage.getItem('userEmail');

    if (userName) {
        const nameEl = document.getElementById('user-name');
        const emailEl = document.getElementById('user-email');
        if (nameEl) nameEl.textContent = userName;
        if (emailEl) emailEl.textContent = userEmail;
    }
}

// ===================== Logout (preserve behavior) =====================
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.clear();
        showNotification('👋 Logged out successfully from Dealora!', 'orange');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
}

// ===================== Notification (keeps your UI) =====================
function showNotification(message, color = '#00eaff') {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.textContent = message;
        notification.style.background = color;
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 2500);
    } else {
        // Fallback: minimal alert if notification element missing
        console.log('Notification:', message);
    }
}

// Run check on page load (preserve original load behavior)
window.addEventListener('load', checkLogin);

// Expose handlers for forms that use inline onsubmit/onclick (compat)
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.showLogin = showLogin;
window.showSignup = showSignup;
window.logout = logout;
