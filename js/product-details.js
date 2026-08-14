import './auth-state.js';
import { db } from './firebase-config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { updateCartBadge } from './cart.js';

const productContainer = document.getElementById('productContainer');
const loadingProduct = document.getElementById('loadingProduct');
let currentProduct = null;

async function fetchProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        window.location.href = 'index.html';
        return;
    }
    
    try {
        const docRef = doc(db, "products", productId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            currentProduct = { id: docSnap.id, ...docSnap.data() };
            renderProductDetails(currentProduct);
        } else {
            productContainer.innerHTML = '<div class="text-red-500 text-center w-full col-span-full">Product not found.</div>';
        }
    } catch (error) {
        console.error("Error fetching product:", error);
        productContainer.innerHTML = '<div class="text-red-500 text-center w-full col-span-full">Error loading product details.</div>';
    } finally {
        loadingProduct.style.display = 'none';
        productContainer.classList.remove('hidden');
    }
}

function renderProductDetails(product) {
    productContainer.className = 'row gy-5 align-items-center';
    productContainer.innerHTML = `
        <div class="col-md-6">
            <div class="bg-light-sage w-100 position-relative" style="height: 500px; @media (min-width: 768px) { height: 700px; }">
                 <span class="position-absolute top-0 start-0 m-4 bg-white bg-opacity-75 text-dark small fw-bold px-3 py-2 text-uppercase tracking-widest z-1">Authentic</span>
                <img src="${product.image}" alt="${product.title}" class="w-100 h-100 object-fit-cover">
            </div>
        </div>
        <div class="col-md-6 d-flex flex-column justify-content-center px-md-5">
            <div class="small fw-light text-brand-slate mb-3 text-uppercase tracking-widest">${product.category}</div>
            <h1 class="display-3 font-serif text-brand-dark mb-4">${product.title}</h1>
            <div class="fs-2 fw-bold text-brand-dark mb-5">Rs.${product.price.toFixed(2)}</div>
            
            <p class="text-muted fw-light lh-lg mb-5 fs-5">${product.description.replace(/\n/g, '<br>')}</p>
            
            <div class="d-flex align-items-center gap-4 mb-5">
                <div class="d-flex align-items-center border border-secondary" style="border-color: rgba(94,104,113,0.3) !important;">
                    <button class="btn btn-link text-brand-slate text-decoration-none px-4 py-3" onclick="updateQty(-1)"><i class="fas fa-minus small"></i></button>
                    <input type="number" id="qtyInput" class="form-control text-center bg-transparent border-0 shadow-none fs-5 fw-bold" style="width: 60px;" value="1" min="1" max="10">
                    <button class="btn btn-link text-brand-slate text-decoration-none px-4 py-3" onclick="updateQty(1)"><i class="fas fa-plus small"></i></button>
                </div>
            </div>
            
            <button class="btn btn-dark w-100 w-md-auto py-3 px-5 text-uppercase tracking-widest fw-bold transition-colors btn-custom-checkout d-flex justify-content-center align-items-center gap-3" id="addToCartBtn">
                <i class="fas fa-shopping-bag"></i> Add to Cart
            </button>
        </div>
    `;
    
    document.getElementById('addToCartBtn').addEventListener('click', () => {
        const qty = parseInt(document.getElementById('qtyInput').value) || 1;
        addToCartDetailed(product, qty);
    });
}

window.updateQty = (change) => {
    const input = document.getElementById('qtyInput');
    let newVal = parseInt(input.value) + change;
    if(newVal >= 1 && newVal <= 10) {
        input.value = newVal;
    }
};

function addToCartDetailed(product, quantity) {
    let cart = JSON.parse(localStorage.getItem('lumiere_cart')) || [];
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image,
            quantity: quantity
        });
    }
    
    localStorage.setItem('lumiere_cart', JSON.stringify(cart));
    
    const btn = document.getElementById('addToCartBtn');
    const originalText = btn.innerHTML;
    const originalClasses = btn.className;
    
    btn.innerHTML = '<i class="fas fa-check"></i> Added to Cart';
    btn.className = 'btn bg-brand-gold text-white w-100 w-md-auto py-3 px-5 text-uppercase tracking-widest fw-bold transition-colors d-flex justify-content-center align-items-center gap-3';
    
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.className = originalClasses;
    }, 2000);
    
    updateCartBadge();
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    if(productContainer) fetchProductDetails();
});
