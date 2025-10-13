// Cart Functionality
document.addEventListener('DOMContentLoaded', function () {
    // Initialize cart
    updateCartDisplay();

    // Checkout button
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function () {
            proceedToCheckout();
        });
    }

    // Address form submission
    const addressForm = document.getElementById('delivery-address-form');
    if (addressForm) {
        addressForm.addEventListener('submit', function (e) {
            e.preventDefault();
            placeOrder();
        });
    }

    // Close address modal
    const addressModal = document.getElementById('address-modal');
    if (addressModal) {
        const closeBtn = addressModal.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function () {
                addressModal.style.display = 'none';
            });
        }
        
        // Close modal when clicking outside
        window.addEventListener('click', function (e) {
            if (e.target === addressModal) {
                addressModal.style.display = 'none';
            }
        });
    }
});

function proceedToCheckout() {
    // Check if user is logged in
    if (!isLoggedIn()) {
        document.getElementById('login-modal').style.display = 'block';
        createFallingFood(document.querySelector('.login-background'));
        return;
    }

    // Check if cart is empty
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }

    // Show address modal
    document.getElementById('address-modal').style.display = 'block';
}

function placeOrder() {
    const addressForm = document.getElementById('delivery-address-form');
    const formData = new FormData(addressForm);
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Basic validation
    if (cart.length === 0) {
        showNotification('Your cart is empty. Cannot place order.', 'error');
        return;
    }

    // Validate required fields
    const requiredFields = [
        'delivery_name',
        'delivery_phone', 
        'delivery_address',
        'delivery_city',
        'delivery_pincode'
    ];

    let allFieldsFilled = true;
    for (let field of requiredFields) {
        const input = addressForm.querySelector(`[name="${field}"]`);
        if (input && !input.value.trim()) {
            allFieldsFilled = false;
            input.style.borderColor = 'red';
        } else if (input) {
            input.style.borderColor = '';
        }
    }

    if (!allFieldsFilled) {
        showNotification('Please fill all required address fields.', 'error');
        return;
    }

    // Prepare data to send to the server
    const orderData = {
        cart: cart,
        deliveryDetails: Object.fromEntries(formData)
    };

    // Send data to the server
    fetch('process_order.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Clear cart from localStorage
            localStorage.removeItem('cart');

            // Hide cart sidebar & address modal, then reset form
            document.getElementById('cart-sidebar').classList.remove('open');
            document.getElementById('address-modal').style.display = 'none';
            addressForm.reset();

            // Show order confirmation
            showOrderConfirmation({ id: data.order_id });
            
            // Update UI
            updateCartDisplay();
            updateCartCount();

        } else {
            // Show error message
            const errorMessage = data.errors ? data.errors.join(', ') : 'An unknown error occurred.';
            showNotification(`Order failed: ${errorMessage}`, 'error');
        }
    })
    .catch(error => {
        console.error('Error placing order:', error);
        showNotification('An error occurred while placing your order. Please try again.', 'error');
    });
}

function showOrderConfirmation(order) {
    const modal = document.getElementById('order-confirmation-modal');
    const orderIdElement = document.getElementById('order-id');

    if (orderIdElement) orderIdElement.textContent = order.id;

    modal.style.display = 'block';

    // Update cart display and count
    updateCartDisplay();
    updateCartCount();
}

function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartTax = document.getElementById('cart-tax');
    const cartTotalAmount = document.getElementById('cart-total-amount');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (!cartItemsContainer) return;

    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Clear container
    cartItemsContainer.innerHTML = '';

    let subtotal = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        if (checkoutBtn) {
            checkoutBtn.disabled = true;
            checkoutBtn.style.opacity = '0.6';
            checkoutBtn.style.cursor = 'not-allowed';
        }
    } else {
        if (checkoutBtn) {
            checkoutBtn.disabled = false;
            checkoutBtn.style.opacity = '1';
            checkoutBtn.style.cursor = 'pointer';
        }

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;

            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-price">₹${item.price}</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn increase" data-id="${item.id}">+</button>
                    </div>
                    <button class="remove-item" data-id="${item.id}">Remove</button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItem);
        });

        // Add event listeners to quantity buttons
        document.querySelectorAll('.quantity-btn.decrease').forEach(button => {
            button.addEventListener('click', function () {
                const itemId = parseInt(this.getAttribute('data-id'));
                updateQuantity(itemId, -1);
            });
        });

        document.querySelectorAll('.quantity-btn.increase').forEach(button => {
            button.addEventListener('click', function () {
                const itemId = parseInt(this.getAttribute('data-id'));
                updateQuantity(itemId, 1);
            });
        });

        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', function () {
                const itemId = parseInt(this.getAttribute('data-id'));
                removeFromCart(itemId);
            });
        });
    }

    // Calculate tax and total
    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    // Update totals
    if (cartSubtotal) cartSubtotal.textContent = subtotal.toFixed(2);
    if (cartTax) cartTax.textContent = tax.toFixed(2);
    if (cartTotalAmount) cartTotalAmount.textContent = total.toFixed(2);
}

function updateQuantity(itemId, change) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemIndex = cart.findIndex(item => item.id === itemId);

    if (itemIndex !== -1) {
        cart[itemIndex].quantity += change;

        // Remove item if quantity becomes 0
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
            showNotification('Item removed from cart', 'info');
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
        updateCartCount();
    }
}

function removeFromCart(itemId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemIndex = cart.findIndex(item => item.id === itemId);

    if (itemIndex !== -1) {
        const itemName = cart[itemIndex].name;
        cart.splice(itemIndex, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
        updateCartCount();
        showNotification(`${itemName} removed from cart`, 'info');
    }
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
}

function isLoggedIn() {
    return localStorage.getItem('user') !== null;
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Add to page
    const container = document.getElementById('notification-container');
    if (container) {
        container.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    } else {
        // Fallback: alert if no container
        alert(message);
    }
}

// Create Falling Food Animation (for login modal)
function createFallingFood(container) {
    // Clear any existing animations
    if (!container) return;
    
    container.innerHTML = '';

    // Food emojis to use
    const foodItems = ['☕', '🍵', '🍰', '🥪', '🍦', '🥤', '🍪', '🍩',];

    // Create multiple falling elements
    for (let i = 0; i < 15; i++) {
        const food = document.createElement('div');
        food.className = 'food-item';
        food.textContent = foodItems[Math.floor(Math.random() * foodItems.length)];

        // Random position and animation duration
        const left = Math.random() * 100;
        const duration = 3 + Math.random() * 5;
        const delay = Math.random() * 5;

        food.style.left = `${left}%`;
        food.style.animationDuration = `${duration}s`;
        food.style.animationDelay = `${delay}s`;

        container.appendChild(food);
    }
}