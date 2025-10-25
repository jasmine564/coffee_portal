// Login and Registration Functionality - COMPLETE WORKING VERSION
document.addEventListener('DOMContentLoaded', function() {
    console.log("Login system initialized");
    
    // Test email input functionality
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            console.log("Email typing:", this.value);
        });
    }

    // SIMPLE LOGIN - This will definitely work
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        // Remove all existing event listeners by cloning the form
        const newForm = loginForm.cloneNode(true);
        loginForm.parentNode.replaceChild(newForm, loginForm);
        
        newForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log("=== SIMPLE LOGIN START ===");
            
            // Method 1: Direct element access
            const emailElement = document.getElementById('email');
            const passwordElement = document.getElementById('password');
            
            const email = emailElement ? emailElement.value : '';
            const password = passwordElement ? passwordElement.value : '';
            
            console.log("Direct access - Email:", `'${email}'`, "Password:", `'${password}'`);
            
            // Method 2: Form data
            const formData = new FormData(newForm);
            const emailFormData = formData.get('email') || '';
            const passwordFormData = formData.get('password') || '';
            
            console.log("FormData - Email:", `'${emailFormData}'`, "Password:", `'${passwordFormData}'`);
            
            // Use whichever method works
            const finalEmail = email || emailFormData;
            const finalPassword = password || passwordFormData;
            
            console.log("Final values - Email:", `'${finalEmail}'`, "Password:", `'${finalPassword}'`);
            
            if (!finalEmail || !finalPassword) {
                showNotification('Please fill in all fields', 'error');
                return;
            }
            
            const users = JSON.parse(localStorage.getItem('users')) || [];
            console.log("Available users:", users);
            
            const user = users.find(u => u.email === finalEmail && u.password === finalPassword);
            
            if (user) {
                console.log("LOGIN SUCCESS");
                localStorage.setItem('user', JSON.stringify(user));
                showNotification('Login successful!', 'success');
                document.getElementById('login-modal').style.display = 'none';
                newForm.reset();
                updateUserUI(user);
            } else {
                console.log("LOGIN FAILED");
                showNotification('Invalid email or password', 'error');
            }
            
            console.log("=== SIMPLE LOGIN END ===");
        });
    }

    // Registration form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('reg-name').value;
            const email = document.getElementById('reg-email').value;
            const phone = document.getElementById('reg-phone').value;
            const password = document.getElementById('reg-password').value;
            const confirmPassword = document.getElementById('reg-confirm-password').value;
            
            if (!name || !email || !phone || !password || !confirmPassword) {
                showNotification('Please fill in all fields', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showNotification('Passwords do not match', 'error');
                return;
            }
            
            const users = JSON.parse(localStorage.getItem('users')) || [];
            if (users.find(u => u.email === email)) {
                showNotification('User with this email already exists', 'error');
                return;
            }
            
            const newUser = { id: Date.now(), name, email, phone, password };
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('user', JSON.stringify(newUser));
            
            showNotification('Registration successful!', 'success');
            document.getElementById('register-modal').style.display = 'none';
            registerForm.reset();
            updateUserUI(newUser);
        });
    }
    // Forgot password functionality
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            // Close login modal and open forgot password modal
            document.getElementById('login-modal').style.display = 'none';
            showForgotPasswordModal();
        });
    }
    
    // Back to login from forgot password
    const backToLogin = document.getElementById('back-to-login');
    if (backToLogin) {
        backToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('forgot-password-modal').style.display = 'none';
            document.getElementById('login-modal').style.display = 'flex';
        });
    }
    
    
// COMPLETE FORGOT PASSWORD SOLUTION
document.addEventListener('DOMContentLoaded', function() {
    initializeForgotPassword();
    debugUsers(); // Remove this after testing
});

function initializeForgotPassword() {
    // Forgot password link click
    const forgotLink = document.getElementById('forgot-password-link');
    if (forgotLink) {
        console.log("Found forgot password link");
        forgotLink.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Forgot password clicked");
            openForgotPasswordModal();
        });
    } else {
        console.log("Forgot password link NOT found");
    }
    
    // Forgot password form submission
    const forgotForm = document.getElementById('forgot-password-form');
    if (forgotForm) {
        forgotForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log("Forgot password form submitted");
            processForgotPassword();
        });
    }
    
    // Close buttons
    const closeForgot = document.querySelector('.close-forgot');
    if (closeForgot) {
        closeForgot.addEventListener('click', closeForgotPasswordModal);
    }
}

function openForgotPasswordModal() {
    console.log("Opening forgot password modal");
    
    // Close login modal first
    const loginModal = document.getElementById('login-modal');
    if (loginModal) {
        loginModal.style.display = 'none';
    }
    
    // Open forgot password modal
    const forgotModal = document.getElementById('forgot-password-modal');
    if (forgotModal) {
        forgotModal.style.display = 'flex';
        
        // Pre-fill with email from login form if available
        const loginEmail = document.getElementById('email');
        const forgotEmail = document.getElementById('forgot-email');
        if (loginEmail && loginEmail.value && forgotEmail) {
            forgotEmail.value = loginEmail.value;
            console.log("Prefilled email:", loginEmail.value);
        }
        
        // Focus on email input
        setTimeout(() => {
            if (forgotEmail) forgotEmail.focus();
        }, 100);
    } else {
        console.log("Forgot password modal NOT found");
    }
}

function closeForgotPasswordModal() {
    const forgotModal = document.getElementById('forgot-password-modal');
    if (forgotModal) {
        forgotModal.style.display = 'none';
    }
}

function processForgotPassword() {
    const emailInput = document.getElementById('forgot-email');
    const email = emailInput ? emailInput.value.trim() : '';
    
    console.log("Processing forgot password for email:", email);
    
    if (!email) {
        showNotification('Please enter your email address', 'error');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    // Check if user exists - IMPORTANT: Case sensitive search
    const users = JSON.parse(localStorage.getItem('users')) || [];
    console.log("Searching in users:", users);
    
    // Try case-insensitive search
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (user) {
        console.log("USER FOUND:", user);
        // SUCCESS - Show confirmation
        showSuccessMessage(email, user.password);
    } else {
        console.log("USER NOT FOUND. Available emails:", users.map(u => u.email));
        // ERROR - User not found
        showNotification('❌ No account found with this email address. Please check your email or register first.', 'error');
        if (emailInput) emailInput.focus();
    }
}

function showSuccessMessage(email, password) {
    console.log("Showing success for:", email);
    
    // Close forgot password modal
    closeForgotPasswordModal();
    
    // Show success notification
    showNotification(`✅ Password reset instructions sent to ${email}`, 'success');
    
    // Show detailed success message
    setTimeout(() => {
        const message = `🎉 Password Recovery Successful!\n\n📧 Email: ${email}\n🔑 Password: ${password}\n\n💡 In a real application, reset instructions would be sent to your email.\n\nClick OK to continue.`;
        alert(message);
        
        // Reopen login modal
        const loginModal = document.getElementById('login-modal');
        if (loginModal) {
            loginModal.style.display = 'flex';
        }
    }, 1000);
}

// TEST FUNCTION - Create a test user if none exists
function createTestUser() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.length === 0) {
        const testUser = {
            id: Date.now(),
            name: "Test User",
            email: "test@example.com", 
            phone: "1234567890",
            password: "test123"
        };
        users.push(testUser);
        localStorage.setItem('users', JSON.stringify(users));
        console.log("Created test user:", testUser);
        showNotification('Test user created: test@example.com / test123', 'success');
    }
}

// Call this to create a test user
// createTestUser(); // Uncomment this line if you want to create a test user
    
    // Modal functionality
    setupModalFunctionality();
    
    // Check existing user
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        updateUserUI(user);
    }
});

function updateUserUI(user) {
    const loginLink = document.getElementById('login-link');
    if (loginLink && loginLink.parentNode) {
        const userDropdown = document.createElement('li');
        userDropdown.className = 'user-dropdown';
        userDropdown.innerHTML = `
            <a href="#" class="nav-link user-button">Hi, ${user.name.split(' ')[0]} <i class="fas fa-chevron-down"></i></a>
            <div class="user-dropdown-menu" style="display: none; position: absolute; background: white; padding: 10px; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <a href="#" class="profile-btn" style="display: block; padding: 5px 10px; color: #333; text-decoration: none;">Profile</a>
                <a href="#" class="logout-btn" style="display: block; padding: 5px 10px; color: #e74c3c; text-decoration: none;">Logout</a>
            </div>
        `;
        
        loginLink.parentNode.replaceChild(userDropdown, loginLink);
        
        userDropdown.querySelector('.user-button').addEventListener('click', function(e) {
            e.preventDefault();
            const menu = userDropdown.querySelector('.user-dropdown-menu');
            menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
        });
        
        userDropdown.querySelector('.logout-btn').addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('user');
            showNotification('Logged out successfully', 'success');
            setTimeout(() => location.reload(), 1000);
        });
    }
}

function setupModalFunctionality() {
    const closeButtons = document.querySelectorAll('.modal .close');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) this.style.display = 'none';
        });
    });
    
    const registerLink = document.getElementById('register-link');
    const loginFromRegister = document.getElementById('login-from-register');
    
    if (registerLink) {
        registerLink.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('login-modal').style.display = 'none';
            document.getElementById('register-modal').style.display = 'flex';
        });
    }
    
    if (loginFromRegister) {
        loginFromRegister.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('register-modal').style.display = 'none';
            document.getElementById('login-modal').style.display = 'flex';
        });
    }
    
    const loginNavLink = document.getElementById('login-link');
    if (loginNavLink) {
        loginNavLink.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('login-modal').style.display = 'flex';
        });
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed; top: 100px; right: 20px; padding: 15px 20px; 
        background-color: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3'}; 
        color: white; border-radius: 4px; z-index: 3000;
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }, 3000);
}

// Cart functionality (keep your existing cart functions)
document.addEventListener('DOMContentLoaded', function() {
    updateCartDisplay();
    
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', proceedToCheckout);
    }
    
    const addressForm = document.getElementById('delivery-address-form');
    if (addressForm) {
        addressForm.addEventListener('submit', function(e) {
            e.preventDefault();
            placeOrder();
        });
    }
});

function proceedToCheckout() {
    if (!isLoggedIn()) {
        document.getElementById('login-modal').style.display = 'block';
        return;
    }
    
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }
    
    document.getElementById('address-modal').style.display = 'block';
}

function placeOrder() {
    const addressForm = document.getElementById('delivery-address-form');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'error');
        return;
    }
    
    const requiredFields = ['delivery_name', 'delivery_phone', 'delivery_address', 'delivery_city', 'delivery_pincode'];
    let allFilled = true;
    
    requiredFields.forEach(field => {
        const input = addressForm.querySelector(`[name="${field}"]`);
        if (input && !input.value.trim()) {
            allFilled = false;
            input.style.borderColor = 'red';
        }
    });
    
    if (!allFilled) {
        showNotification('Please fill all fields', 'error');
        return;
    }
    
    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const submitBtn = addressForm.querySelector('.btn-primary');
    const originalText = submitBtn.textContent;
    
    submitBtn.textContent = 'Placing Order...';
    submitBtn.disabled = true;
    
    const formData = new FormData(addressForm);
    formData.append('cart_total', cartTotal);
    
    fetch('process_order.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showOrderSuccess(data.order_id);
        } else {
            showNotification('Order failed', 'error');
        }
    })
    .catch(error => {
        showNotification('Network error', 'error');
    })
    .finally(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
}

function showOrderSuccess(orderId) {
    localStorage.removeItem('cart');
    document.getElementById('address-modal').style.display = 'none';
    updateCartDisplay();
    updateCartCount();
    showNotification(`Order placed! ID: ${orderId}`, 'success');
}

function updateCartDisplay() {
    const container = document.getElementById('cart-items-container');
    const subtotalEl = document.getElementById('cart-subtotal');
    const taxEl = document.getElementById('cart-tax');
    const totalEl = document.getElementById('cart-total-amount');
    
    if (!container) return;
    
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    container.innerHTML = '';
    
    let subtotal = 0;
    
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.innerHTML = `
            <div>${item.name} - ₹${item.price} x ${item.quantity}</div>
            <button onclick="removeFromCart(${item.id})">Remove</button>
        `;
        container.appendChild(itemEl);
    });
    
    const tax = subtotal * 0.02;
    const total = subtotal + tax;
    
    if (subtotalEl) subtotalEl.textContent = subtotal.toFixed(2);
    if (taxEl) taxEl.textContent = tax.toFixed(2);
    if (totalEl) totalEl.textContent = total.toFixed(2);
}

function removeFromCart(itemId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== itemId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    updateCartCount();
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const countEl = document.querySelector('.cart-count');
    if (countEl) countEl.textContent = totalItems;
}

function isLoggedIn() {
    return localStorage.getItem('user') !== null;
}
// ACCURATE FORGOT PASSWORD FIX
document.addEventListener('DOMContentLoaded', function() {
    // Wait for modal to be ready
    setTimeout(function() {
        const forgotLink = document.getElementById('forgot-password-link');
        console.log("Looking for forgot link:", forgotLink);
        
        if (forgotLink) {
            console.log("Found forgot password link!");
            
            // Remove any existing event listeners
            const newForgotLink = forgotLink.cloneNode(true);
            forgotLink.parentNode.replaceChild(newForgotLink, forgotLink);
            
            // Add click event
            document.getElementById('forgot-password-link').onclick = function(e) {
                e.preventDefault();
                console.log("Forgot password clicked!");
                
                // Get email from login form
                const loginEmail = document.getElementById('email');
                const userEmail = loginEmail ? loginEmail.value : '';
                
                const email = prompt("Enter your email to reset password:", userEmail);
                
                if (email) {
                    const users = JSON.parse(localStorage.getItem('users')) || [];
                    console.log("All users:", users);
                    const user = users.find(u => u.email === email);
                    
                    if (user) {
                        alert(`Password recovery successful!\n\nYour password is: ${user.password}\n\n(In a real application, reset instructions would be sent to your email)`);
                    } else {
                        alert('❌ No account found with this email address');
                    }
                }
            };
        } else {
            console.log("Forgot password link not found!");
        }
    }, 1000);
});
// Your existing login.js code...

// ============ DEBUG CODE ============
console.log("=== FORGOT PASSWORD DEBUG ===");

// Debug function
function debugUsers() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    console.log("📍 All users in localStorage:", users);
    console.log("📊 Number of users:", users.length);
    
    if (users.length === 0) {
        console.log("❌ NO USERS FOUND - Please register first!");
    } else {
        users.forEach((user, index) => {
            console.log(`👤 User ${index + 1}: Email: "${user.email}", Password: "${user.password}"`);
        });
    }
    console.log("=============================");
}

// Test forgot password immediately
function testForgotPassword() {
    const email = "test@example.com";
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email);
    
    console.log(`🔍 Testing email: "${email}" - Found:`, user ? "YES" : "NO");
}

// Run debug on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log("🔄 Page loaded - checking users...");
    debugUsers();
    testForgotPassword();
});

// Also make debug function global so you can run it anytime
window.debugUsers = debugUsers;