// 🛒 Dealora - Cart & Search Script

// Initialize cart from sessionStorage
let cart = [];

// Load cart count on page load
window.addEventListener('load', function() {
    loadCart();
    updateCartCount();
    loadCartPage();
});

// Add item to cart
function addToCart(id, name, price, image) {
    const item = {
        id: id,
        name: name,
        price: price,
        image: image,
        quantity: 1
    };
    
    const existingItem = cart.find(cartItem => cartItem.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
        showNotification(`${name} quantity increased in your Dealora cart!`);
    } else {
        cart.push(item);
        showNotification(`${name} added to your Dealora cart!`);
    }
    
    saveCart();
    updateCartCount();
}

// Remove item from cart
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartCount();
    loadCartPage();
    showNotification('Item removed from your Dealora cart!');
}

// Update quantity
function updateQuantity(id, quantity) {
    const item = cart.find(cartItem => cartItem.id === id);
    
    if (item) {
        if (quantity <= 0) {
            removeFromCart(id);
        } else {
            item.quantity = quantity;
            saveCart();
            updateCartCount();
            loadCartPage();
        }
    }
}

// Save cart to sessionStorage
function saveCart() {
    sessionStorage.setItem('cart', JSON.stringify(cart));
}

// Load cart from sessionStorage
function loadCart() {
    const storedCart = sessionStorage.getItem('cart');
    if (storedCart) {
        cart = JSON.parse(storedCart);
    } else {
        cart = [];
    }
}

// Update cart count in navbar
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('#cart-count');
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
}

// Show notification
function showNotification(message) {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.textContent = message;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    }
}

// Display cart items on cart page
function loadCartPage() {
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartDiv = document.getElementById('empty-cart');
    
    if (!cartItemsContainer) return;
    
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        if (emptyCartDiv) emptyCartDiv.style.display = 'block';
        cartItemsContainer.style.display = 'none';
    } else {
        if (emptyCartDiv) emptyCartDiv.style.display = 'none';
        cartItemsContainer.style.display = 'block';
        
        cart.forEach(item => {
            const cartItemHTML = `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p>Price: ₹${item.price}</p>
                        <div class="cart-item-quantity">
                            <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                        </div>
                    </div>
                    <div class="cart-item-price">₹${item.price * item.quantity}</div>
                    <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
                </div>
            `;
            cartItemsContainer.innerHTML += cartItemHTML;
        });
        
        updateCartSummary();
    }
}

// Update cart summary
function updateCartSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.05;
    const shipping = subtotal > 500 ? 0 : 50;
    const total = subtotal + tax + shipping;
    
    document.getElementById('subtotal').textContent = '₹' + subtotal;
    document.getElementById('tax').textContent = '₹' + Math.round(tax);
    document.getElementById('shipping').textContent = shipping === 0 ? 'FREE' : '₹' + shipping;
    document.getElementById('total').textContent = '₹' + Math.round(total);
}

// Checkout function
function checkout() {
    if (cart.length === 0) {
        showNotification('🛍️ Your Dealora cart is empty!');
        return;
    }
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.05;
    const shipping = subtotal > 500 ? 0 : 50;
    const total = subtotal + tax + shipping;
    
    alert(`🧾 Dealora Order Summary:\n\nSubtotal: ₹${subtotal}\nTax (5%): ₹${Math.round(tax)}\nShipping: ${shipping === 0 ? 'FREE' : '₹' + shipping}\n\nTotal: ₹${Math.round(total)}\n\nProceeding to payment...`);
    
    cart = [];
    saveCart();
    updateCartCount();
    loadCartPage();
    
    showNotification('✅ Order placed successfully on Dealora!');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}

// 🔍 Search Functionality for Dealora
const searchInput = document.getElementById('searchInput');
const productGrid = document.getElementById('productGrid');

if (searchInput && productGrid) {
    const noResultsMsg = document.createElement('p');
    noResultsMsg.textContent = "No products found 😢";
    noResultsMsg.style.textAlign = "center";
    noResultsMsg.style.color = "#8b949e";
    noResultsMsg.style.display = "none";
    productGrid.parentNode.appendChild(noResultsMsg);

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        const products = productGrid.querySelectorAll('.product');
        let visibleCount = 0;

        products.forEach(product => {
            const name = product.querySelector('h3').textContent.toLowerCase();
            const matches = name.includes(query);
            product.style.display = matches ? 'block' : 'none';
            if (matches) visibleCount++;
        });

        noResultsMsg.style.display = visibleCount === 0 ? 'block' : 'none';
    });
}
