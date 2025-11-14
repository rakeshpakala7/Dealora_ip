// Show specific section
function showSection(sectionName) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(sectionName).classList.add('active');
  document.querySelectorAll('.sidebar-menu a').forEach(a => a.classList.remove('active'));
  document.querySelector(`.sidebar-menu a[onclick="showSection('${sectionName}')"]`).classList.add('active');
  if (sectionName === 'wishlist') renderWishlist();
}

// Enable editing profile
function enableEdit() {
  document.querySelectorAll('#profile-form input, #profile-form textarea').forEach(el => {
    if (el.id !== 'profile-email') el.disabled = false;
  });
  document.getElementById('save-btn').disabled = false;
}

// Save profile changes
function saveProfile() {
  const name = document.getElementById('profile-name').value.trim();
  const phone = document.getElementById('profile-phone').value.trim();
  const address = document.getElementById('profile-address').value.trim();

  if (!name || !phone || !address) {
    showNotification('⚠️ Please fill all fields!');
    return;
  }

  const userEmail = sessionStorage.getItem('userEmail');
  const updatedProfile = { name, phone, address, email: userEmail };

  sessionStorage.setItem('userProfile', JSON.stringify(updatedProfile));

  document.getElementById('user-name').textContent = name;
  document.getElementById('user-email').textContent = userEmail;

  showNotification('✅ Profile updated successfully on Dealora!');
  document.querySelectorAll('#profile-form input, #profile-form textarea').forEach(el => el.disabled = true);
  document.getElementById('save-btn').disabled = true;
}

// Load profile info
function loadProfile() {
  const userEmail = sessionStorage.getItem('userEmail');
  const userName = sessionStorage.getItem('userName');
  const userProfile = JSON.parse(sessionStorage.getItem('userProfile')) || {};

  document.getElementById('user-name').textContent = userProfile.name || userName || 'User';
  document.getElementById('user-email').textContent = userEmail || 'user@email.com';

  document.getElementById('profile-name').value = userProfile.name || userName || '';
  document.getElementById('profile-email').value = userEmail || '';
  document.getElementById('profile-phone').value = userProfile.phone || '';
  document.getElementById('profile-address').value = userProfile.address || '';
}

// Wishlist rendering
function renderWishlist() {
  const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
  const wishlistList = document.getElementById('wishlist-list');
  wishlistList.innerHTML = wishlist.length
    ? wishlist.map(item => `
  <div class="wishlist-item">
    <img src="${item.image}" alt="${item.name}" style="width:60px; height:60px; object-fit:cover; border-radius:8px; margin-right:15px;">
    <div class="wishlist-item-details">
      <h4>${item.name}</h4>
      <div class="price">₹${item.price}</div>
    </div>
    <button class="remove-btn" onclick="removeFromWishlist(${item.id})">Remove</button>
  </div>
`).join('')


function removeFromWishlist(id) {
  let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
  wishlist = wishlist.filter(item => item.id !== id);
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  renderWishlist();
}

// 🔒 Change password with full persistence
function changePassword() {
  const userEmail = sessionStorage.getItem('userEmail');
  const storedPassword = sessionStorage.getItem('userPassword');

  const currentPassword = prompt('Enter your current password:');
  if (!currentPassword) {
    showNotification('Password change cancelled.');
    return;
  }

  if (storedPassword && currentPassword !== storedPassword) {
    showNotification('❌ Incorrect current password!');
    return;
  }

  const newPassword = prompt('Enter your new password (min 6 characters):');
  if (!newPassword) {
    showNotification('Password change cancelled.');
    return;
  }

  if (newPassword.length < 6) {
    showNotification('Password must be at least 6 characters!');
    return;
  }

  const confirmPassword = prompt('Confirm your new password:');
  if (confirmPassword !== newPassword) {
    showNotification('Passwords do not match!');
    return;
  }

  // ✅ Update in sessionStorage
  sessionStorage.setItem('userPassword', newPassword);

  // ✅ Update in localStorage
  let users = JSON.parse(localStorage.getItem('users')) || [];
  users = users.map(u => {
    if (u.email === userEmail) {
      return { ...u, password: newPassword };
    }
    return u;
  });
  localStorage.setItem('users', JSON.stringify(users));

  showNotification('🔐 Password changed successfully for your Dealora account!');
}

// Delete account
function deleteAccount() {
  if (confirm('Are you sure you want to delete your Dealora account? This action cannot be undone.')) {
    sessionStorage.clear();
    window.location.href = 'login.html';
  }
}

// Notification display
function showNotification(message) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.classList.add('show');
  setTimeout(() => notification.classList.remove('show'), 2500);
}

// Update cart count
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  document.getElementById('cart-count').textContent = cart.reduce((sum, i) => sum + i.quantity, 0);
}

// Logout
function logout() {
  sessionStorage.clear();
  showNotification('👋 Logged out successfully from Dealora!');
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 800);
}

// Load everything
window.addEventListener('load', () => {
  updateCartCount();
  loadProfile();
});
