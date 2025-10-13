
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the website
    initNavigation();
    initMenu();
    initModals();
    initSearch();
    initScrollEffects();
    initDeals();
    initCart();
});

function initCart() {
    updateCartDisplay();
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            proceedToCheckout();
        });
    }
    const addressForm = document.getElementById('delivery-address-form');
    if (addressForm) {
        addressForm.addEventListener('submit', function(e) {
            e.preventDefault();
            placeOrder();
        });
    }
    const addressModal = document.getElementById('address-modal');
    if (addressModal) {
        const closeBtn = addressModal.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                addressModal.style.display = 'none';
            });
        }
    }
}

function proceedToCheckout() {
    if (!isLoggedIn()) {
        document.getElementById('login-modal').style.display = 'block';
        createFallingFood(document.querySelector('.login-background'));
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
    const formData = new FormData(addressForm);
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length === 0) {
        showNotification('Your cart is empty. Cannot place order.', 'error');
        return;
    }

    let allFieldsFilled = true;
    for (let pair of formData.entries()) {
        if (pair[0] !== 'delivery-landmark' && !pair[1]) {
            allFieldsFilled = false;
            break;
        }
    }

    if (!allFieldsFilled) {
        showNotification('Please fill all required address fields.', 'error');
        return;
    }

    const orderData = {
        cart: cart,
        deliveryDetails: Object.fromEntries(formData)
    };

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
                localStorage.removeItem('cart');
                document.getElementById('cart-sidebar').classList.remove('open');
                document.getElementById('address-modal').style.display = 'none';
                addressForm.reset();
                showOrderConfirmation({
                    id: data.order_id
                });
                updateCartDisplay();
                updateCartCount();

            } else {
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
    cartItemsContainer.innerHTML = '';

    let subtotal = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        if (checkoutBtn) checkoutBtn.disabled = true;
    } else {
        if (checkoutBtn) checkoutBtn.disabled = false;
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

        document.querySelectorAll('.quantity-btn.decrease').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = parseInt(this.getAttribute('data-id'));
                updateQuantity(itemId, -1);
            });
        });

        document.querySelectorAll('.quantity-btn.increase').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = parseInt(this.getAttribute('data-id'));
                updateQuantity(itemId, 1);
            });
        });

        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = parseInt(this.getAttribute('data-id'));
                removeFromCart(itemId);
            });
        });
    }

    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    if (cartSubtotal) cartSubtotal.textContent = subtotal.toFixed(2);
    if (cartTax) cartTax.textContent = tax.toFixed(2);
    if (cartTotalAmount) cartTotalAmount.textContent = total.toFixed(2);
}

function updateQuantity(itemId, change) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemIndex = cart.findIndex(item => item.id === itemId);

    if (itemIndex !== -1) {
        cart[itemIndex].quantity += change;
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

// Navigation Functions
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    window.addEventListener('scroll', function() {
        const header = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            header.classList.add('sticky');
        } else {
            header.classList.remove('sticky');
        }
    });
}

// Menu Functions
function initMenu() {
    const menuItems = [{
        id: 1,
        name: "Espresso",
        category: "coffee",
        description: "Strong and rich Italian coffee shot",
        price: 120,
        image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    }, {
        id: 2,
        name: "Cappuccino",
        category: "coffee",
        description: "Espresso with steamed milk and foam",
        price: 150,
        image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    }, {
        id: 3,
        name: "Black Coffee",
        category: "coffee",
        description: "Pure black coffee without milk",
        price: 100,
        image: "https://tse2.mm.bing.net/th/id/OIP.9KMo8fujro_56c47kaWIXAHaGl?rs=1&pid=ImgDetMain&o=7&rm=3"
    }, {
        id: 4,
        name: "Americano",
        category: "coffee",
        description: "Espresso with hot water",
        price: 130,
        image: "https://images.unsplash.com/photo-1568649929103-28ffbefaca1e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    }, {
        id: 5,
        name: "Caramel Macchiato",
        category: "coffee",
        description: "Espresso with caramel and steamed milk",
        price: 180,
        image: "https://i0.wp.com/gatherforbread.com/wp-content/uploads/2017/04/Iced-Caramel-Macchiato-16.jpg?resize=683%2C1024&ssl=1"
    }, {
        id: 6,
        name: "Green Tea",
        category: "tea",
        description: "Healthy and refreshing green tea",
        price: 80,
        image: "https://vaya.in/recipes/wp-content/uploads/2018/05/Green-Tea.jpg"
    }, {
        id: 7,
        name: "Iced Tea",
        category: "tea",
        description: "Chilled tea with lemon flavor",
        price: 110,
        image: "https://thumbs.dreamstime.com/z/iced-tea-21821221.jpg"
    }, {
        id: 8,
        name: "Masala Chai",
        category: "tea",
        description: "Traditional Indian spiced tea",
        price: 60,
        image: "https://img.freepik.com/premium-photo/masala-tea-with-spices_117406-912.jpg"
    }, {
        id: 9,
        name: "Chocolate Milkshake",
        category: "milkshake",
        description: "Rich chocolate milkshake with cream",
        price: 160,
        image: "https://img.freepik.com/premium-photo/photo-decadent-vanilla-milkshake-with-cake-pieces-cookie-crumbles-chocolate_1207718-1372.jpg"
    }, {
        id: 10,
        name: "Oreo Milkshake",
        category: "milkshake",
        description: "Creamy milkshake with Oreo cookies",
        price: 180,
        image: "https://www.whiskaffair.com/wp-content/uploads/2020/07/Oreo-Milkshake-2-1.jpg"
    }, {
        id: 11,
        name: "Brownie Milkshake",
        category: "milkshake",
        description: "Chocolate brownie blended milkshake",
        price: 190,
        image: "https://www.queensleeappetit.com/wp-content/uploads/2018/09/Brownie-Milkshake-5.jpg"
    }, {
        id: 12,
        name: "Vanilla Milkshake",
        category: "milkshake",
        description: "Classic vanilla milkshake",
        price: 150,
        image: "https://tse2.mm.bing.net/th/id/OIP._xdqmMcRrk1SlrqNNpdWsAHaLH?rs=1&pid=ImgDetMain&o=7&rm=3"
    }, {
        id: 13,
        name: "Club Sandwich",
        category: "sandwich",
        description: "Triple decker with chicken and veggies",
        price: 220,
        image: "https://images.unsplash.com/photo-1539252554453-80ab65ce3586?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    }, {
        id: 14,
        name: "Grilled Cheese",
        category: "sandwich",
        description: "Toasted bread with melted cheese",
        price: 180,
        image: "https://images.unsplash.com/photo-1553909489-cd47e0907980?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    }, {
        id: 15,
        name: "Veggie Delight",
        category: "sandwich",
        description: "Fresh vegetables with herb mayo",
        price: 160,
        image: "https://images.unsplash.com/photo-1567234669003-dce7a7a88821?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    }, {
        id: 16,
        name: "Croissant",
        category: "pastry",
        description: "Buttery and flaky French pastry",
        price: 90,
        image: "https://i.pinimg.com/originals/41/91/96/419196bf7c6851dd5a73687f723a5340.jpg"
    }, {
        id: 17,
        name: "Blueberry Muffin",
        category: "pastry",
        description: "Soft muffin with blueberry filling",
        price: 110,
        image: "https://cdn77-s3.lazycatkitchen.com/wp-content/uploads/2019/09/vegan-blueberry-muffins.jpg"
    }, {
        id: 18,
        name: "Chocolate Donut",
        category: "pastry",
        description: "Soft donut with chocolate glaze",
        price: 80,
        image: "https://tse4.mm.bing.net/th/id/OIP.9xL_eQ2FrxTlYtav9ykuqgHaLH?rs=1&pid=ImgDetMain&o=7&rm=3"
    }, {
        id: 19,
        name: "Egg Puff",
        category: "puff",
        description: "Flaky puff with egg filling",
        price: 70,
        image: "https://2.bp.blogspot.com/-4-QQE5FKU8A/XMSomFd7yRI/AAAAAAAAdRk/YYcfRnJ7_-Ij0Gk0-8L9ZiloxAg9kU32gCLcBGAs/s1600/masala-egg-puffs.jpg"
    }, {
        id: 20,
        name: "Veg Puff",
        category: "puff",
        description: "Vegetable filled puff pastry",
        price: 60,
        image: "https://carveyourcraving.com/wp-content/uploads/2021/11/veg-puff.jpg"
    }, {
        id: 21,
        name: "Chicken Puff",
        category: "puff",
        description: "Chicken filled savory puff",
        price: 90,
        image: "https://th.bing.com/th/id/R.5f1d9991fc1183832022a90a63ad820b?rik=eyvv3e1KtBJWiA&riu=http%3a%2f%2f1.bp.blogspot.com%2f-NTWwvjZsonA%2fTz30mIr_RTI%2fAAAAAAAAC7c%2fiVdVHvpJyuQ%2fs1600%2fIMG_8531.jpg&ehk=S4nIG8phCBATxKRpi%2b6Kpj4wlupiFXkcL2OaKVC26bU%3d&risl=&pid=ImgRaw&r=0"
    }, {
        id: 22,
        name: "Margherita Pizza",
        category: "pizza",
        description: "Classic pizza with tomato and cheese",
        price: 280,
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    }, {
        id: 23,
        name: "Pepperoni Pizza",
        category: "pizza",
        description: "Pizza with pepperoni and cheese",
        price: 320,
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    }, {
        id: 24,
        name: "French Fries",
        category: "snack",
        description: "Crispy golden fries with seasoning",
        price: 100,
        image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
    }, {
        id: 25,
        name: "Samosa",
        category: "snack",
        description: "Crispy pastry with potato filling",
        price: 50,
        image: "https://wallpaperaccess.com/full/2069188.jpg"
    }, {
        id: 26,
        name: "Vanilla Ice Cream",
        category: "icecream",
        description: "Classic vanilla bean ice cream",
        price: 120,
        image: "https://www.theroastedroot.net/wp-content/uploads/2023/06/dairy-free-vanilla-ice-cream-8-735x1103.jpg"
    }, {
        id: 27,
        name: "Chocolate Ice Cream",
        category: "icecream",
        description: "Rich chocolate ice cream",
        price: 130,
        image: "https://www.willflyforfood.net/wp-content/uploads/2022/05/ice-cream-flavors-chocolate.jpg"
    }, {
        id: 28,
        name: "Strawberry Ice Cream",
        category: "icecream",
        description: "Creamy strawberry flavored ice cream",
        price: 130,
        image: "https://tse1.explicit.bing.net/th/id/OIP.eJAyPuRW3h1aR55F-JNFZQHaLG?rs=1&pid=ImgDetMain&o=7&rm=3"
    }, {
        id: 29,
        name: "Butterscotch Ice Cream",
        category: "icecream",
        description: "Sweet butterscotch flavored ice cream",
        price: 140,
        image: "https://tse3.mm.bing.net/th/id/OIP.b8n7f_rFBZEhEKJZiCivXwHaFj?rs=1&pid=ImgDetMain&o=7&rm=3"
    }];

    window.menuItems = menuItems;

    const menuContainer = document.getElementById('menu-items');
    const categoryTabs = document.querySelectorAll('.tab-btn');

    function renderMenuItems(category = 'all') {
        menuContainer.innerHTML = '';

        const filteredItems = category === 'all' ?
            menuItems :
            menuItems.filter(item => item.category === category);

        if (filteredItems.length === 0) {
            menuContainer.innerHTML = '<p class="no-items">No items found in this category</p>';
            return;
        }

        filteredItems.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'menu-item card-hover';
            menuItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="menu-item-img">
                <div class="menu-item-content">
                    <h3 class="menu-item-title">${item.name}</h3>
                    <p class="menu-item-desc">${item.description}</p>
                    <div class="menu-item-price">₹${item.price}</div>
                    <div class="menu-item-actions">
                        <button class="add-to-cart" data-id="${item.id}">
                            <i class="fas fa-shopping-cart"></i> Add to Cart
                        </button>
                        <button class="add-to-wishlist" data-id="${item.id}">
                            <i class="far fa-heart"></i>
                        </button>
                    </div>
                </div>
            `;
            menuContainer.appendChild(menuItem);
        });

        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = parseInt(this.getAttribute('data-id'));
                addToCart(itemId);
            });
        });

        document.querySelectorAll('.add-to-wishlist').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = parseInt(this.getAttribute('data-id'));
                addToWishlist(itemId);
            });
        });
    }

    renderMenuItems();

    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            categoryTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const category = this.getAttribute('data-category');
            renderMenuItems(category);
        });
    });
}

// Deals Section Functionality
function initDeals() {
    const dealButtons = document.querySelectorAll('.add-deal-to-cart');

    dealButtons.forEach(button => {
        button.addEventListener('click', function() {
            const dealType = this.getAttribute('data-deal');
            addDealToCart(dealType);
        });
    });
}

function addDealToCart(dealType) {
    const deals = {
        breakfast: {
            id: 1001,
            name: "Morning Bliss Combo",
            description: "Any Coffee + Croissant of your choice",
            price: 199,
            image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            isCombo: true
        },
        lunch: {
            id: 1002,
            name: "Lunch Special",
            description: "Sandwich + Coffee/Tea + Cookie",
            price: 349,
            image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            isCombo: true
        },
        evening: {
            id: 1003,
            name: "Evening Snack Pack",
            description: "Any Pastry + Tea/Coffee",
            price: 249,
            image: "https://images.unsplash.com/photo-1559715745-e1b33a271c8f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            isCombo: true
        }
    };

    const deal = deals[dealType];
    if (deal) {
        addToCart(deal);
    }
}

// Modal Functions
function initModals() {
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const orderConfirmationModal = document.getElementById('order-confirmation-modal');
    const cartSidebar = document.getElementById('cart-sidebar');

    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    const loginFromRegister = document.getElementById('login-from-register');
    const bookTableBtn = document.getElementById('book-table-btn');
    const cartLink = document.getElementById('cart-link');
    const closeCart = document.querySelector('.close-cart');
    const continueShoppingBtn = document.getElementById('continue-shopping');

    const closeButtons = document.querySelectorAll('.close');

    if (loginLink) {
        loginLink.addEventListener('click', function(e) {
            loginModal.style.display = 'block';
            createFallingFood(loginModal.querySelector('.login-background'));
        });
    }

    if (registerLink) {
        registerLink.addEventListener('click', function(e) {
            loginModal.style.display = 'none';
            registerModal.style.display = 'block';
            createFallingFood(registerModal.querySelector('.register-background'));
        });
    }

    if (loginFromRegister) {
        loginFromRegister.addEventListener('click', function(e) {
            registerModal.style.display = 'none';
            loginModal.style.display = 'block';
            createFallingFood(loginModal.querySelector('.login-background'));
        });
    }

    if (bookTableBtn) {
        bookTableBtn.addEventListener('click', function(e) {
            const bookingSection = document.getElementById('booking');
            if (bookingSection) {
                window.scrollTo({
                    top: bookingSection.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    }

    const tableBookingForm = document.getElementById('table-booking-form');
    if (tableBookingForm) {
        tableBookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!isLoggedIn()) {
                loginModal.style.display = 'block';
                createFallingFood(loginModal.querySelector('.login-background'));
                return;
            }
            showNotification('Table booking request submitted successfully!', 'success');
            this.reset();
        });
    }

    if (cartLink) {
        cartLink.addEventListener('click', function(e) {
            e.preventDefault();
            cartSidebar.classList.add('open');
            updateCartDisplay();
        });
    }

    if (closeCart) {
        closeCart.addEventListener('click', function() {
            cartSidebar.classList.remove('open');
        });
    }

    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', function() {
            orderConfirmationModal.style.display = 'none';
        });
    }

    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

// Search Functionality
function initSearch() {
    const searchBar = document.getElementById('search-bar');
    const searchBtn = document.getElementById('search-btn');

    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            performSearch();
        });
    }

    if (searchBar) {
        searchBar.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    function performSearch() {
        const searchTerm = searchBar.value.trim().toLowerCase();
        if (searchTerm) {
            showNotification(`Searching for: ${searchTerm}`, 'info');
        }
    }
}

// Scroll Effects
function initScrollEffects() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
}

// Cart Functions
function addToCart(item) {
    if (!isLoggedIn()) {
        document.getElementById('login-modal').style.display = 'block';
        createFallingFood(document.querySelector('.login-background'));
        return;
    }

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let itemToAdd;

    if (typeof item === 'object') {
        itemToAdd = item;
    } else {
        const menuItem = window.menuItems.find(menuItem => menuItem.id === item);
        if (!menuItem) return;

        itemToAdd = {
            id: menuItem.id,
            name: menuItem.name,
            price: menuItem.price,
            image: menuItem.image,
            description: menuItem.description
        };
    }

    const existingItem = cart.find(cartItem => cartItem.id === itemToAdd.id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        itemToAdd.quantity = 1;
        cart.push(itemToAdd);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification(`${itemToAdd.name} added to cart!`, 'success');
}

function addToWishlist(itemId) {
    if (!isLoggedIn()) {
        document.getElementById('login-modal').style.display = 'block';
        createFallingFood(document.querySelector('.login-background'));
        return;
    }

    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

    if (!wishlist.includes(itemId)) {
        wishlist.push(itemId);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        showNotification('Item added to wishlist!', 'success');
    } else {
        showNotification('Item already in wishlist!', 'info');
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
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    const container = document.getElementById('notification-container');
    if (container) {
        container.appendChild(notification);
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

function createFallingFood(container) {
    container.innerHTML = '';
    const foodItems = ['☕', '🍵', '🍰', '🥪', '🍦', '🥤', '🍪', '🍩', '🧁'];
    for (let i = 0; i < 15; i++) {
        const food = document.createElement('div');
        food.className = 'food-item';
        food.textContent = foodItems[Math.floor(Math.random() * foodItems.length)];
        const left = Math.random() * 100;
        const duration = 3 + Math.random() * 5;
        const delay = Math.random() * 5;

        food.style.left = `${left}%`;
        food.style.animationDuration = `${duration}s`;
        food.style.animationDelay = `${delay}s`;

        container.appendChild(food);
    }
}
updateCartCount();
