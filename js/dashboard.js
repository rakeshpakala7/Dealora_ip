// ---------------- HELPERS ----------------
function getWishlistKeyForCurrentUser() {
  const email = sessionStorage.getItem('userEmail');
  if (!email) return null;
  return `wishlist_${email.replace(/[@.]/g, '_')}`;
}

function getLoggedInUser() {
  const name = sessionStorage.getItem("userName");
  const email = sessionStorage.getItem("userEmail");
  const password = sessionStorage.getItem("userPassword");
  if (!email) return null;

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const found = users.find(u => u.email === email);

  return {
    name: found?.name || name || '',
    email,
    password,
    phone: found?.phone || '',
    address: found?.address || ''
  };
}

// ---------------- SWITCH SECTIONS ----------------
function showSection(section) {
  document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
  const el = document.getElementById(section);
  if (el) el.classList.add('active');

  document.querySelectorAll('.sidebar-menu a').forEach(a => a.classList.remove('active'));
  const selector = document.querySelector(`.sidebar-menu a[onclick="showSection('${section}')"]`);
  if (selector) selector.classList.add('active');

  if (section === 'orders') loadOrders();
  if (section === 'wishlist') loadWishlist();
}

// ---------------- PAGE LOAD ----------------
window.addEventListener('load', () => {
  const user = getLoggedInUser();
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  document.getElementById('user-name').textContent = user.name || 'User';
  document.getElementById('user-email').textContent = user.email || '';

  document.getElementById('profile-name').value = user.name || '';
  document.getElementById('profile-email').value = user.email || '';
  document.getElementById('profile-phone').value = user.phone || '';
  document.getElementById('profile-address').value = user.address || '';

  loadProfile();
  renderWishlist();
  updateCartCount();
});

// ---------------- PROFILE ----------------
function enableEdit() {
  document.getElementById('profile-name').disabled = false;
  document.getElementById('profile-phone').disabled = false;
  document.getElementById('profile-address').disabled = false;
  document.getElementById('save-btn').disabled = false;
}

function saveProfile() {
  const user = getLoggedInUser();
  if (!user) return;

  const newName = document.getElementById('profile-name').value.trim();
  const newPhone = document.getElementById('profile-phone').value.trim();
  const newAddress = document.getElementById('profile-address').value.trim();

  let users = JSON.parse(localStorage.getItem('users')) || [];
  const idx = users.findIndex(u => u.email === user.email);

  const updated = { ...(users[idx] || {}), name: newName || user.name, email: user.email, password: user.password, phone: newPhone, address: newAddress };

  if (idx !== -1) users[idx] = updated;
  else users.push(updated);

  localStorage.setItem('users', JSON.stringify(users));
  sessionStorage.setItem('userName', updated.name);

  document.getElementById('user-name').textContent = updated.name;
  showNotification('✅ Profile updated!');

  document.getElementById('profile-name').disabled = true;
  document.getElementById('profile-phone').disabled = true;
  document.getElementById('profile-address').disabled = true;
  document.getElementById('save-btn').disabled = true;
}

function loadProfile() {
  const user = getLoggedInUser();
  if (!user) return;

  document.getElementById('profile-name').value = user.name || '';
  document.getElementById('profile-email').value = user.email || '';
  document.getElementById('profile-phone').value = user.phone || '';
  document.getElementById('profile-address').value = user.address || '';
}

// ---------------- ORDERS (UPDATED UI) ----------------
function loadOrders() {
  const user = getLoggedInUser();
  const allOrders = JSON.parse(localStorage.getItem("orders")) || [];
  const container = document.getElementById('orders-list');

  const userOrders = allOrders
  .filter(o => o.email === user.email)
  .reverse(); // newest orders first


  if (userOrders.length === 0) {
    container.innerHTML = `<p>No orders yet. <a href="products.html">Start shopping now!</a></p>`;
    return;
  }

  container.innerHTML = "";

  userOrders.forEach(order => {

    let subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let tax = Math.round(subtotal * 0.05);
    let shipping = subtotal > 999 ? 0 : 49;
    let total = subtotal + tax + shipping;

    const statusClass =
      order.status === "Delivered" ? "status-success" :
      order.status === "Pending" ? "status-pending" :
      "status-cancel";

    const div = document.createElement("div");
    div.classList.add("order-card");

    div.innerHTML = `
      <div class="order-header">
        <span>Order #${order.id}</span>
        <span class="order-status ${statusClass}">${order.status}</span>
      </div>

      ${order.items
        .map(
          item => `
        <div class="order-item">
          <img src="${item.image}" alt="${item.name}">
          <div class="order-item-info">
            <h4>${item.name}</h4>
            <p>₹${item.price.toLocaleString()} × ${item.quantity}</p>
          </div>
        </div>
      `
        )
        .join("")}

      <div class="order-summary">
        <div><span>Subtotal</span> <span>₹${subtotal.toLocaleString()}</span></div>
        <div><span>Tax (5%)</span> <span>₹${tax.toLocaleString()}</span></div>
        <div><span>Shipping</span> <span>₹${shipping.toLocaleString()}</span></div>
        <div class="total"><span>Total</span> <span>₹${total.toLocaleString()}</span></div>
      </div>
    `;

    container.appendChild(div);
  });
}

// ---------------- WISHLIST ----------------
function loadWishlist() {
  const key = getWishlistKeyForCurrentUser();
  const container = document.getElementById('wishlist-list');
  if (!container) return;

  if (!key) {
    container.innerHTML = '<p>Please login to see your wishlist.</p>';
    return;
  }

  const wishlist = JSON.parse(localStorage.getItem(key)) || [];

  if (wishlist.length === 0) {
    container.innerHTML = `<p>Your wishlist is empty</p>`;
    return;
  }

  container.innerHTML = '';
  wishlist.forEach(item => {
    const div = document.createElement('div');
    div.className = 'wishlist-item';
    div.style.justifyContent = 'space-between';

    div.innerHTML = `
      <div style="display:flex; align-items:center; gap:12px;">
        <img src="${item.image}" alt="${item.name}">
        <div class="wishlist-info">
          <h4 style="margin:0; color:#00eaff;">${item.name}</h4>
          <p style="margin:6px 0 0;">₹${item.price.toLocaleString()}</p>
        </div>
      </div>

      <div>
        <button class="btn" onclick="moveToCartFromWishlist(${item.id})">Add to Cart</button>
        <button class="remove-btn" onclick="removeFromWishlist(${item.id})">Remove</button>
      </div>
    `;
    container.appendChild(div);
  });
}

function removeFromWishlist(id) {
  const key = getWishlistKeyForCurrentUser();
  if (!key) return showNotification('Login required.');

  let wishlist = JSON.parse(localStorage.getItem(key)) || [];
  wishlist = wishlist.filter(i => i.id !== id);

  localStorage.setItem(key, JSON.stringify(wishlist));
  loadWishlist();
  showNotification("Removed from wishlist!");
}

function moveToCartFromWishlist(id) {
  const key = getWishlistKeyForCurrentUser();
  if (!key) return showNotification("Login required.");

  const wishlist = JSON.parse(localStorage.getItem(key)) || [];
  const item = wishlist.find(i => i.id === id);
  if (!item) return;

  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existing = cart.find(c => c.id === id);

  if (existing) existing.quantity += 1;
  else cart.push({ ...item, quantity: 1 });

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  removeFromWishlist(id);
}

// ---------------- UTILITIES ----------------
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const el = document.getElementById('cart-count');
  if (el) el.textContent = cart.reduce((sum, i) => sum + i.quantity, 0);
}

function showNotification(msg) {
  const n = document.getElementById("notification");
  if (!n) return;
  n.textContent = msg;
  n.classList.add("show");
  setTimeout(() => n.classList.remove("show"), 2500);
}

function renderWishlist() { loadWishlist(); }
// ===================== CHANGE PASSWORD =====================
function changePassword() {
  const currentPassword = prompt("Enter your current password:");
  if (!currentPassword) return;

  const newPassword = prompt("Enter your new password:");
  if (!newPassword) return;

  const confirmPassword = prompt("Confirm your new password:");
  if (newPassword !== confirmPassword) {
    return showNotification("❌ Passwords do not match!");
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const email = sessionStorage.getItem("userEmail");

  const idx = users.findIndex(u => u.email === email);
  if (idx === -1) return showNotification("❌ User not found!");

  if (users[idx].password !== currentPassword) {
    return showNotification("❌ Current password is incorrect!");
  }

  users[idx].password = newPassword;
  localStorage.setItem("users", JSON.stringify(users));
  sessionStorage.setItem("userPassword", newPassword);

  // Also update single-user legacy keys for compatibility
  localStorage.setItem("userPassword", newPassword);

  showNotification("✅ Password changed successfully!");
}

// ===================== DELETE ACCOUNT =====================
function deleteAccount() {
  if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const email = sessionStorage.getItem("userEmail");

  const updatedUsers = users.filter(u => u.email !== email);
  localStorage.setItem("users", JSON.stringify(updatedUsers));

  // Remove legacy keys
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userName");
  localStorage.removeItem("userPassword");

  // Clear session
  sessionStorage.clear();

  showNotification("🗑️ Account deleted successfully!");

  setTimeout(() => {
    window.location.href = "login.html";
  }, 1200);
}

// Expose these to global scope (so buttons in dashboard.html can call them)
window.changePassword = changePassword;
window.deleteAccount = deleteAccount;
