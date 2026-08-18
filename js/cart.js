import './auth-state.js';
import { db, auth } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// DOM Elements
const cartContent = document.getElementById('cartContent');
const emptyCartMessage = document.getElementById('emptyCartMessage');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const subtotalAmount = document.getElementById('subtotalAmount');
const totalAmount = document.getElementById('totalAmount');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutAuthMessage = document.getElementById('checkoutAuthMessage');

export function updateCartBadge() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
        const cart = JSON.parse(localStorage.getItem('lumiere_cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

function loadCartPage() {
    if (!cartContent) return; // Not on cart page
    
    const cart = JSON.parse(localStorage.getItem('lumiere_cart')) || [];
    
    if (cart.length === 0) {
        cartContent.classList.add('d-none');
        emptyCartMessage.classList.remove('d-none');
        emptyCartMessage.classList.add('d-flex');
        return;
    }
    
    emptyCartMessage.classList.add('d-none');
    cartContent.classList.remove('d-none');
    
    cartItemsContainer.innerHTML = '';
    let subtotal = 0;
    
    cart.forEach(item => {
        subtotal += item.price * item.quantity;
        const itemEl = document.createElement('div');
        itemEl.className = 'd-flex flex-column flex-sm-row gap-4 bg-white p-4 p-md-4 align-items-center border border-light';
        itemEl.innerHTML = `
            <img src="${item.image}" alt="${item.title}" class="object-fit-cover" style="width: 100px; height: 100px;">
            <div class="flex-grow-1 text-center text-sm-start">
                <div class="fs-5 font-serif text-brand-dark mb-1">${item.title}</div>
                <div class="fw-bold text-brand-dark">PKR ${item.price.toFixed(2)}</div>
            </div>
            <div class="d-flex align-items-center gap-4 mt-3 mt-sm-0">
                <input type="number" class="form-control text-center rounded-0 shadow-none border-secondary custom-input" style="width: 80px;" value="${item.quantity}" min="1" max="99" onchange="window.updateCartItem('${item.id}', this.value)">
                <button class="btn btn-link text-danger text-decoration-none p-0" onclick="window.updateCartItem('${item.id}', 0)"><i class="fas fa-trash"></i></button>
            </div>
        `;
        cartItemsContainer.appendChild(itemEl);
    });
    
    subtotalAmount.textContent = `PKR ${subtotal.toFixed(2)}`;
    totalAmount.textContent = `PKR ${subtotal.toFixed(2)}`;
    
    // Check auth for checkout (Removed for Guest Checkout)
    // Auth is no longer required to checkout.
}

window.updateCartItem = (id, quantity) => {
    let cart = JSON.parse(localStorage.getItem('lumiere_cart')) || [];
    if (quantity == 0) {
        window.removeCartItem(id);
        return;
    }
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity = parseInt(quantity);
        localStorage.setItem('lumiere_cart', JSON.stringify(cart));
        loadCartPage();
        updateCartBadge();
    }
};

window.removeCartItem = (id) => {
    let cart = JSON.parse(localStorage.getItem('lumiere_cart')) || [];
    cart = cart.filter(i => i.id !== id);
    localStorage.setItem('lumiere_cart', JSON.stringify(cart));
    loadCartPage();
    updateCartBadge();
};

if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        const cart = JSON.parse(localStorage.getItem('lumiere_cart')) || [];
        if (cart.length === 0) return;
        
        window.location.href = 'checkout.html';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    loadCartPage();
});

// Sync cart across multiple tabs
window.addEventListener('storage', (e) => {
    if (e.key === 'lumiere_cart') {
        updateCartBadge();
        loadCartPage();
    }
});
