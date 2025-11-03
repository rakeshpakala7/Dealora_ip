// ✅ Check if user is logged in
function checkLogin() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Redirects for access control
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

// ✅ Handle Login
function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    const storedEmail = localStorage.getItem('userEmail');
    const storedPassword = localStorage.getItem('userPassword');
    const storedName = localStorage.getItem('userName');

    if (!storedEmail || !storedPassword) {
        showNotification('⚠️ No account found. Please sign up first!', 'orange');
        return;
    }

    if (email === storedEmail && password === storedPassword) {
        // ✅ Successful login
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('userEmail', storedEmail);
        sessionStorage.setItem('userName', storedName);

        showNotification('✅ Login successful!', 'limegreen');

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1200);
    } else {
        // ❌ Wrong credentials
        showNotification('❌ Invalid email or password!', 'red');
    }
}

// ✅ Handle Signup
function handleSignup(event) {
    event.preventDefault();

    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value.trim();

    if (!name || !email || !password) {
        showNotification('⚠️ Please fill all fields!', 'orange');
        return;
    }

    // ✅ Save new user credentials
    localStorage.setItem('userName', name);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userPassword', password);

    showNotification('🎉 Account created successfully! Please login.', '#00eaff');

    // Switch back to login form
    setTimeout(() => {
        showLogin();
    }, 1000);
}

// ✅ Switch to Login Form
function showLogin() {
    document.getElementById('signup-form').classList.remove('active');
    document.getElementById('login-form').classList.add('active');
}

// ✅ Switch to Signup Form
function showSignup() {
    document.getElementById('login-form').classList.remove('active');
    document.getElementById('signup-form').classList.add('active');
}

// ✅ Update user info on navbar (if applicable)
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

// ✅ Logout user
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.clear();
        showNotification('👋 Logged out successfully from Dealora!', 'orange');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
}

// ✅ Show notification message
function showNotification(message, color = '#00eaff') {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.textContent = message;
        notification.style.background = color;
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 2500);
    }
}

// ✅ Run check on page load
window.addEventListener('load', checkLogin);
