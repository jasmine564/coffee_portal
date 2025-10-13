// Login and Registration Functionality/
//login.js
document.addEventListener('DOMContentLoaded', function() {
    initializeAuthSystem();
});

function initializeAuthSystem() {
    console.log('Initializing authentication system...');
    
    // Setup login link first
    setupLoginLink();
    
    // Enhanced Forgot password functionality
    setupForgotPassword();
    
    // Check if user is already logged in
    checkExistingUser();
    
    // Setup existing forms if they exist
    setupExistingForms();
}

function setupExistingForms() {
    // Login form submission - only if form exists in HTML
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        console.log('Found existing login form');
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLoginFromForm();
        });
    }
    
    // Registration form submission - only if form exists in HTML
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        console.log('Found existing registration form');
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleRegistrationFromForm();
        });
    }
}

function setupLoginLink() {
    const loginLink = document.getElementById('login-link');
    if (loginLink) {
        // Always clear existing content first to avoid orphaned event listeners
        loginLink.innerHTML = '';

        const user = JSON.parse(localStorage.getItem('user'));
        
        if (user) {
            updateUserUI(user);
        } else {
            // Create the login button and add the event listener
            const loginBtn = document.createElement('a');
            loginBtn.href = '#';
            loginBtn.className = 'login-btn';
            loginBtn.style.cssText = 'color: #333; text-decoration: none; font-weight: bold; padding: 8px 16px; border: 1px solid #007bff; border-radius: 4px; background: #007bff; color: white;';
            loginBtn.textContent = 'Login';
            
            loginBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Login button clicked');
                openLoginForm();
            });
            
            loginLink.appendChild(loginBtn);
        }
    } else {
        console.log('Login link not found, creating one...');
        createLoginLink();
    }
}

function createLoginLink() {
    // Create login link if it doesn't exist
    const loginLink = document.createElement('div');
    loginLink.id = 'login-link';
    loginLink.style.cssText = 'display: inline-block; margin-left: 20px;';
    
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        updateUserUI(user);
    } else {
        loginLink.innerHTML = '<a href="#" class="login-btn" style="color: #333; text-decoration: none; font-weight: bold; padding: 8px 16px; border: 1px solid #007bff; border-radius: 4px; background: #007bff; color: white;">Login</a>';
        
        const loginBtn = loginLink.querySelector('.login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', function(e) {
                e.preventDefault();
                openLoginForm();
            });
        }
    }
    
    // Try to add to header or navigation
    const header = document.querySelector('header, .header, nav, .nav');
    if (header) {
        header.appendChild(loginLink);
    } else {
        document.body.insertBefore(loginLink, document.body.firstChild);
    }
}

function setupForgotPassword() {
    const forgotPasswordLinks = document.querySelectorAll('.forgot-password, .forgot-password-link, a[href*="forgot"]');
    forgotPasswordLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            handleForgotPassword();
        });
    });
}

function checkExistingUser() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        console.log('User found in localStorage:', user.name);
        updateUserUI(user);
    } else {
        console.log('No user found in localStorage');
    }
    addLogoutButton();
}

function handleLoginFromForm() {
    console.log('Handling login from existing form...');
    
    // Get email and password from existing form
    const emailElement = document.getElementById('login-email');
    const passwordElement = document.getElementById('login-password');
    
    if (!emailElement || !passwordElement) {
        console.error('Login form elements not found, creating dynamic form instead');
        openLoginForm();
        return;
    }
    
    const email = emailElement.value;
    const password = passwordElement.value;
    
    processLogin(email, password);
}

function handleLogin(email, password) {
    console.log('Handling login with credentials...');
    processLogin(email, password);
}

function processLogin(email, password) {
    // Simple validation
    if (!email || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    // Check user credentials
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Login successful
        localStorage.setItem('user', JSON.stringify(user));
        showNotification('Login successful!', 'success');
        
        // Close any open modals or forms
        closeDynamicForms();
        closeModals();
        
        // Update UI for logged in user
        updateUserUI(user);
        
        // Reload page to update all components
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    } else {
        showNotification('Invalid email or password', 'error');
    }
}

function handleRegistrationFromForm() {
    console.log('Handling registration from existing form...');
    
    // Get registration form elements
    const nameElement = document.getElementById('reg-name');
    const emailElement = document.getElementById('reg-email');
    const phoneElement = document.getElementById('reg-phone');
    const passwordElement = document.getElementById('reg-password');
    const confirmPasswordElement = document.getElementById('reg-confirm-password');
    
    if (!nameElement || !emailElement || !phoneElement || !passwordElement || !confirmPasswordElement) {
        console.error('Registration form elements not found, creating dynamic form instead');
        createDynamicRegisterForm();
        return;
    }
    
    const name = nameElement.value;
    const email = emailElement.value;
    const phone = phoneElement.value;
    const password = passwordElement.value;
    const confirmPassword = confirmPasswordElement.value;
    
    processRegistration(name, email, phone, password, confirmPassword);
}

function handleRegistration(name, email, phone, password, confirmPassword) {
    console.log('Handling registration...');
    processRegistration(name, email, phone, password, confirmPassword);
}

function processRegistration(name, email, phone, password, confirmPassword) {
    // Validation
    if (!name || !email || !phone || !password || !confirmPassword) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.find(u => u.email === email)) {
        showNotification('User with this email already exists', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now(),
        name,
        email,
        phone,
        password
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Auto login after registration
    localStorage.setItem('user', JSON.stringify(newUser));
    showNotification('Registration successful! You are now logged in.', 'success');
    
    // Close any open forms
    closeDynamicForms();
    closeModals();
    
    // Update UI for logged in user
    updateUserUI(newUser);
    
    // Reload page to update all components
    setTimeout(() => {
        window.location.reload();
    }, 1500);
}

function openLoginForm() {
    console.log('Opening login form...');
    
    // First try to open existing modal
    const loginModal = document.getElementById('login-modal');
    if (loginModal) {
        loginModal.style.display = 'block';
        return;
    }
    
    // If no modal exists, create a dynamic login form
    createDynamicLoginForm();
}

function createDynamicLoginForm() {
    console.log('Creating dynamic login form...');
    
    // Remove existing dynamic form if any
    closeDynamicForms();
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'login-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 9999;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    
    // Create login form
    const loginForm = document.createElement('div');
    loginForm.id = 'dynamic-login-form';
    loginForm.style.cssText = `
        background: white;
        padding: 40px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        width: 400px;
        max-width: 90%;
        position: relative;
    `;
    
    loginForm.innerHTML = `
        <h3 style="margin-bottom: 25px; text-align: center; color: #333; font-size: 24px;">Login</h3>
        <form id="dynamic-login-form-element">
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 8px; color: #555; font-weight: bold; font-size: 14px;">Email Address</label>
                <input type="email" id="dynamic-email" placeholder="Enter your email" required 
                    style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 14px; transition: border-color 0.3s;">
            </div>
            <div style="margin-bottom: 25px;">
                <label style="display: block; margin-bottom: 8px; color: #555; font-weight: bold; font-size: 14px;">Password</label>
                <input type="password" id="dynamic-password" placeholder="Enter your password" required 
                    style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 14px; transition: border-color 0.3s;">
            </div>
            <button type="submit" 
                style="width: 100%; padding: 15px; background: #007bff; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold; transition: background-color 0.3s;">
                Sign In
            </button>
        </form>
        <div style="text-align: center; margin-top: 25px; padding-top: 20px; border-top: 1px solid #eee;">
            <span style="color: #666; font-size: 14px;">Don't have an account? </span>
            <a href="#" id="show-register-dynamic" style="color: #007bff; text-decoration: none; font-weight: bold; font-size: 14px;">Create Account</a>
        </div>
        <div style="text-align: center; margin-top: 15px;">
            <a href="#" id="forgot-password-dynamic" style="color: #666; text-decoration: none; font-size: 13px;">Forgot your password?</a>
        </div>
        <button onclick="closeDynamicForms()" 
            style="position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 24px; cursor: pointer; color: #666; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: background-color 0.3s;">
            ×
        </button>
    `;
    
    // Add to page
    overlay.appendChild(loginForm);
    document.body.appendChild(overlay);
    
    // Add hover effects
    const inputs = loginForm.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.style.borderColor = '#007bff';
        });
        input.addEventListener('blur', function() {
            this.style.borderColor = '#ddd';
        });
    });
    
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#0056b3';
        });
        submitBtn.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '#007bff';
        });
    }
    
    // Add event listeners
    const form = document.getElementById('dynamic-login-form-element');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('dynamic-email').value;
            const password = document.getElementById('dynamic-password').value;
            
            handleLogin(email, password);
        });
    }
    
    // Show register form
    const showRegister = document.getElementById('show-register-dynamic');
    if (showRegister) {
        showRegister.addEventListener('click', function(e) {
            e.preventDefault();
            closeDynamicForms();
            createDynamicRegisterForm();
        });
    }
    
    // Forgot password
    const forgotPassword = document.getElementById('forgot-password-dynamic');
    if (forgotPassword) {
        forgotPassword.addEventListener('click', function(e) {
            e.preventDefault();
            closeDynamicForms();
            handleForgotPassword();
        });
    }
    
    // Close when clicking overlay
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closeDynamicForms();
        }
    });
}

function createDynamicRegisterForm() {
    console.log('Creating dynamic registration form...');
    
    // Remove existing dynamic form if any
    closeDynamicForms();
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'register-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 9999;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    
    // Create register form
    const registerForm = document.createElement('div');
    registerForm.id = 'dynamic-register-form';
    registerForm.style.cssText = `
        background: white;
        padding: 40px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        width: 450px;
        max-width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
    `;
    
    registerForm.innerHTML = `
        <h3 style="margin-bottom: 25px; text-align: center; color: #333; font-size: 24px;">Create Account</h3>
        <form id="dynamic-register-form-element">
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 8px; color: #555; font-weight: bold; font-size: 14px;">Full Name</label>
                <input type="text" id="dynamic-reg-name" placeholder="Enter your full name" required 
                    style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 14px; transition: border-color 0.3s;">
            </div>
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 8px; color: #555; font-weight: bold; font-size: 14px;">Email Address</label>
                <input type="email" id="dynamic-reg-email" placeholder="Enter your email" required 
                    style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 14px; transition: border-color 0.3s;">
            </div>
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 8px; color: #555; font-weight: bold; font-size: 14px;">Phone Number</label>
                <input type="tel" id="dynamic-reg-phone" placeholder="Enter your phone number" required 
                    style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 14px; transition: border-color 0.3s;">
            </div>
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 8px; color: #555; font-weight: bold; font-size: 14px;">Password</label>
                <input type="password" id="dynamic-reg-password" placeholder="Create password (min 6 characters)" required 
                    style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 14px; transition: border-color 0.3s;">
            </div>
            <div style="margin-bottom: 25px;">
                <label style="display: block; margin-bottom: 8px; color: #555; font-weight: bold; font-size: 14px;">Confirm Password</label>
                <input type="password" id="dynamic-reg-confirm-password" placeholder="Confirm your password" required 
                    style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 14px; transition: border-color 0.3s;">
            </div>
            <button type="submit" 
                style="width: 100%; padding: 15px; background: #28a745; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold; transition: background-color 0.3s;">
                Create Account
            </button>
        </form>
        <div style="text-align: center; margin-top: 25px; padding-top: 20px; border-top: 1px solid #eee;">
            <span style="color: #666; font-size: 14px;">Already have an account? </span>
            <a href="#" id="show-login-dynamic" style="color: #007bff; text-decoration: none; font-weight: bold; font-size: 14px;">Sign In</a>
        </div>
        <button onclick="closeDynamicForms()" 
            style="position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 24px; cursor: pointer; color: #666; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: background-color 0.3s;">
            ×
        </button>
    `;
    
    // Add to page
    overlay.appendChild(registerForm);
    document.body.appendChild(overlay);
    
    // Add hover effects
    const inputs = registerForm.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.style.borderColor = '#007bff';
        });
        input.addEventListener('blur', function() {
            this.style.borderColor = '#ddd';
        });
    });
    
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#218838';
        });
        submitBtn.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '#28a745';
        });
    }
    
    // Add event listeners
    const form = document.getElementById('dynamic-register-form-element');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('dynamic-reg-name').value;
            const email = document.getElementById('dynamic-reg-email').value;
            const phone = document.getElementById('dynamic-reg-phone').value;
            const password = document.getElementById('dynamic-reg-password').value;
            const confirmPassword = document.getElementById('dynamic-reg-confirm-password').value;
            
            handleRegistration(name, email, phone, password, confirmPassword);
        });
    }
    
    // Show login form
    const showLogin = document.getElementById('show-login-dynamic');
    if (showLogin) {
        showLogin.addEventListener('click', function(e) {
            e.preventDefault();
            closeDynamicForms();
            createDynamicLoginForm();
        });
    }
    
    // Close when clicking overlay
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closeDynamicForms();
        }
    });
}

function closeDynamicForms() {
    const overlays = document.querySelectorAll('#login-overlay, #register-overlay');
    overlays.forEach(overlay => overlay.remove());
    
    const dynamicForms = document.querySelectorAll('#dynamic-login-form, #dynamic-register-form');
    dynamicForms.forEach(form => form.remove());
}

function closeModals() {
    const modals = ['login-modal', 'register-modal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    });
}

// Keep all the other functions exactly the same (updateUserUI, addLogoutButton, handleLogout, handleForgotPassword, showNotification)

function updateUserUI(user) {
    const loginLink = document.getElementById('login-link');
    if (loginLink) {
        loginLink.innerHTML = '';
        
        const userDropdown = document.createElement('div');
        userDropdown.className = 'user-dropdown';
        userDropdown.style.cssText = `
            position: relative;
            display: inline-block;
        `;
        
        const userGreeting = document.createElement('span');
        userGreeting.textContent = `Hi, ${user.name.split(' ')[0]}`;
        userGreeting.style.cssText = `
            cursor: pointer;
            padding: 8px 16px;
            display: block;
            color: #333;
            font-weight: bold;
            background: #f8f9fa;
            border-radius: 4px;
            border: 1px solid #dee2e6;
        `;
        
        const dropdownMenu = document.createElement('div');
        dropdownMenu.className = 'dropdown-menu';
        dropdownMenu.style.cssText = `
            position: absolute;
            top: 100%;
            right: 0;
            background: white;
            min-width: 180px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.15);
            border-radius: 8px;
            display: none;
            z-index: 1000;
            border: 1px solid #ddd;
            padding: 5px 0;
        `;
        
        const profileButton = document.createElement('button');
        profileButton.textContent = '👤 Profile';
        profileButton.style.cssText = `
            width: 100%;
            padding: 12px 15px;
            border: none;
            background: none;
            text-align: left;
            cursor: pointer;
            color: #333;
            font-size: 14px;
            transition: background-color 0.2s;
        `;
        
        profileButton.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f8f9fa';
        });
        
        profileButton.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'white';
        });
        
        profileButton.addEventListener('click', function() {
            showNotification(`Welcome back, ${user.name}!`, 'success');
            dropdownMenu.style.display = 'none';
        });
        
        const logoutButton = document.createElement('button');
        logoutButton.textContent = '🚪 Logout';
        logoutButton.style.cssText = `
            width: 100%;
            padding: 12px 15px;
            border: none;
            background: none;
            text-align: left;
            cursor: pointer;
            color: #dc3545;
            font-size: 14px;
            transition: background-color 0.2s;
        `;
        
        logoutButton.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f8f9fa';
        });
        
        logoutButton.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'white';
        });
        
        logoutButton.addEventListener('click', function() {
            handleLogout();
        });
        
        dropdownMenu.appendChild(profileButton);
        dropdownMenu.appendChild(logoutButton);
        userDropdown.appendChild(userGreeting);
        userDropdown.appendChild(dropdownMenu);
        loginLink.appendChild(userDropdown);
        
        userGreeting.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
        });
        
        document.addEventListener('click', function() {
            dropdownMenu.style.display = 'none';
        });
    }
}

function addLogoutButton() {
    const user = JSON.parse(localStorage.getItem('user'));
    const existingLogoutBtn = document.getElementById('logout-btn');
    
    if (user && !existingLogoutBtn) {
        const logoutBtn = document.createElement('button');
        logoutBtn.id = 'logout-btn';
        logoutBtn.textContent = 'Logout';
        logoutBtn.style.cssText = `
            margin-left: 15px;
            padding: 8px 16px;
            background: #dc3545;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            transition: background-color 0.3s;
        `;
        
        logoutBtn.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#c82333';
        });
        
        logoutBtn.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '#dc3545';
        });
        
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            handleLogout();
        });
        
        const headerActions = document.querySelector('.header-actions, .nav-actions, nav, header');
        if (headerActions) {
            headerActions.appendChild(logoutBtn);
        } else {
            const loginLink = document.getElementById('login-link');
            if (loginLink && loginLink.parentNode) {
                loginLink.parentNode.insertBefore(logoutBtn, loginLink.nextSibling);
            }
        }
    } else if (!user && existingLogoutBtn) {
        existingLogoutBtn.remove();
    }
}

function handleLogout() {
    localStorage.removeItem('user');
    showNotification('Logged out successfully!', 'success');
    
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.remove();
    }
    
    // Simply reset the UI to the logged-out state.
    setupLoginLink();
    
    // No need to reload the page, which can cause state loss
    // setTimeout(() => {
    //     window.location.reload();
    // }, 1000);
}

function handleForgotPassword() {
    const email = prompt('Please enter your email address to recover your password:');
    
    if (!email) {
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email);
    
    if (user) {
        showNotification(`Password recovery email sent to ${email}`, 'success');
        
        setTimeout(() => {
            const message = `Demo: Your password is "${user.password}".\n\nIn a real application, this would be securely sent to your email.\n\nWould you like to copy it to clipboard?`;
            
            if (confirm(message)) {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(user.password).then(() => {
                        showNotification('Password copied to clipboard!', 'success');
                    }).catch(() => {
                        showNotification('Password recovery information displayed', 'info');
                    });
                } else {
                    showNotification('Password recovery information displayed', 'info');
                }
            }
        }, 500);
    } else {
        showNotification('No account found with this email address', 'error');
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    const backgroundColor = type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8';
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 15px 20px;
        background-color: ${backgroundColor};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        font-family: Arial, sans-serif;
        font-size: 14px;
        max-width: 300px;
        word-wrap: break-word;
        font-weight: bold;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}
