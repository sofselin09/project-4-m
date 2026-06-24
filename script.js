document.addEventListener('DOMContentLoaded', function () {

    // ===== Анимация подписи на главной =====
    const signatureImage = document.getElementById('signatureImage');
    const signatureLine = document.querySelector('.signature-line');

    if (signatureImage && signatureLine) {
        setTimeout(() => {
            signatureLine.classList.add('visible');
        }, 500);

        setTimeout(() => {
            const duration = 4000;
            const startTime = performance.now();

            function animateSignature(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const clipValue = 100 - (eased * 100);
                signatureImage.style.clipPath = `inset(0 ${clipValue}% 0 0)`;

                if (progress < 1) {
                    requestAnimationFrame(animateSignature);
                }
            }

            requestAnimationFrame(animateSignature);
        }, 1500);
    }

    // ===== Плавное появление элементов при скролле =====
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.manifest-item, .question-item, .footer-column').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // ===== Кнопка "Смотреть онлайн" (dropdown) =====
    const watchOnlineBtn = document.getElementById('watchOnlineBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');

    if (watchOnlineBtn && dropdownMenu) {
        watchOnlineBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle('active');
        });

        document.addEventListener('click', function (e) {
            if (!watchOnlineBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                dropdownMenu.classList.remove('active');
            }
        });
    }

    // ===== Бургер-меню =====
    const burgerBtn = document.getElementById('burgerBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    if (burgerBtn && mobileMenu) {
        burgerBtn.addEventListener('click', function () {
            burgerBtn.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function () {
                burgerBtn.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // ===== Обработчик формы подписки =====
    const subscribeForm = document.getElementById('subscribeForm');
    if (subscribeForm) {
        subscribeForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            alert(`Спасибо за подписку! Письмо с подтверждением отправлено на ${email}`);
            subscribeForm.reset();
        });
    }

    // ===== Корзина =====
    updateCartCount();

    document.querySelectorAll('.btn-buy[data-product-id]').forEach(btn => {
        btn.addEventListener('click', function () {
            const productId = parseInt(this.getAttribute('data-product-id'));
            addToCart(productId);
        });
    });

    if (document.getElementById('cartContent')) {
        renderCart();
    }

    // ===== Клик на карточку товара (переход на 404) =====
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', function (e) {
            if (!e.target.classList.contains('btn-buy')) {
                window.location.href = '404.html';
            }
        });
    });
});

// ===== База товаров =====
const productsDB = [
    { id: 1, name: 'Вторая сторона', volume: '100 ml', price: 33000, image: 'images/green.PNG' },
    { id: 2, name: 'Экземпляр', volume: '100 ml', price: 33000, image: 'images/ChatGPT Image 21 июня 2026 г., 22_04_51.png' },
    { id: 3, name: 'Преамбула', volume: '100 ml', price: 33000, image: 'images/ChatGPT Image 21 июня 2026 г., 22_06_13.png' },
    { id: 4, name: 'Скрепа', volume: '100 ml', price: 33000, image: 'images/ChatGPT Image 21 июня 2026 г., 22_08_32.png' },
    { id: 5, name: 'Подлинник', volume: '100 ml', price: 33000, image: 'images/grey.PNG' },
    { id: 6, name: 'Сэт из 5 ароматов', volume: '2 аромата + пробники', price: 55000, image: 'images/сэт.PNG' }
];

// ===== Функции корзины =====
function getCart() {
    const cart = localStorage.getItem('signumCart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('signumCart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = totalItems;
    });
}

function addToCart(productId) {
    const product = productsDB.find(p => p.id === productId);
    if (!product) return;

    const cart = getCart();
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart(cart);

    const btn = document.querySelector(`[data-product-id="${productId}"]`);
    if (btn) {
        const originalText = btn.textContent;
        btn.textContent = '✓ Добавлено';
        btn.style.background = '#333';
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '#000';
        }, 1500);
    }
}

function changeQuantity(index, delta) {
    const cart = getCart();
    cart[index].quantity += delta;
    if (cart[index].quantity < 1) {
        cart.splice(index, 1);
    }
    saveCart(cart);
    renderCart();
}

function removeItem(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    renderCart();
}

function renderCart() {
    const cartContent = document.getElementById('cartContent');
    const cartEmpty = document.getElementById('cartEmpty');
    if (!cartContent) return;

    const cart = getCart();

    if (cart.length === 0) {
        cartContent.style.display = 'none';
        if (cartEmpty) cartEmpty.style.display = 'block';
        return;
    }

    let itemsHTML = '';
    let total = 0;

    cart.forEach((product, index) => {
        const itemTotal = product.price * product.quantity;
        total += itemTotal;

        itemsHTML += `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="cart-item-info">
                    <h3>${product.name}</h3>
                    <p class="cart-item-volume">${product.volume}</p>
                    <div class="cart-item-controls">
                        <div class="quantity-control">
                            <button onclick="changeQuantity(${index}, -1)">−</button>
                            <span class="quantity">${product.quantity}</span>
                            <button onclick="changeQuantity(${index}, 1)">+</button>
                        </div>
                    </div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem;">
                    <div class="cart-item-price">${itemTotal.toLocaleString('ru-RU')} ₽</div>
                    <button class="cart-item-remove" onclick="removeItem(${index})">×</button>
                </div>
            </div>
        `;
    });

    const delivery = total > 5000 ? 0 : 500;

    cartContent.innerHTML = `
        <div class="cart-items">${itemsHTML}</div>
        <div class="cart-summary">
            <h3>Итого</h3>
            <div class="summary-row">
                <span>Товары</span>
                <span>${total.toLocaleString('ru-RU')} ₽</span>
            </div>
            <div class="summary-row">
                <span>Доставка</span>
                <span>${delivery === 0 ? 'Бесплатно' : delivery + ' ₽'}</span>
            </div>
            <div class="summary-row total">
                <span>К оплате</span>
                <span>${(total + delivery).toLocaleString('ru-RU')} ₽</span>
            </div>
            <button class="btn-checkout" onclick="checkout()">Оформить заказ</button>
        </div>
    `;
}

function checkout() {
    alert('Переход к оформлению заказа');
}