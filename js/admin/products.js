import { db, auth } from '../firebase-config.js';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// DOM Elements
const addProductBtn = document.getElementById('addProductBtn');
const productModal = document.getElementById('productModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const productForm = document.getElementById('productForm');
const productsTableBody = document.getElementById('productsTableBody');
const productSearch = document.getElementById('productSearch');
const imageInput = document.getElementById('image');
const imagePreview = document.getElementById('imagePreview');
const modalTitle = document.getElementById('modalTitle');
const productIdInput = document.getElementById('productId');

// State
let products = [];

// Event Listeners
if (addProductBtn) {
    addProductBtn.addEventListener('click', () => openModal());
    closeModalBtn.addEventListener('click', closeModal);
    cancelModalBtn.addEventListener('click', closeModal);
    
    productForm.addEventListener('submit', handleProductSubmit);
    
    imageInput.addEventListener('input', (e) => {
        if(e.target.value) {
            imagePreview.src = e.target.value;
            imagePreview.style.display = 'block';
        } else {
            imagePreview.style.display = 'none';
        }
    });

    productSearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filtered = products.filter(p => 
            p.title.toLowerCase().includes(searchTerm) || 
            p.category.toLowerCase().includes(searchTerm)
        );
        renderProducts(filtered);
    });

    // Initial load
    loadProducts();
}

// Functions
function openModal(product = null) {
    productModal.classList.add('active');
    if (product) {
        modalTitle.textContent = 'Edit Product';
        productIdInput.value = product.id;
        document.getElementById('title').value = product.title;
        document.getElementById('price').value = product.price;
        document.getElementById('category').value = product.category;
        document.getElementById('image').value = product.image;
        document.getElementById('description').value = product.description;
        
        imagePreview.src = product.image;
        imagePreview.style.display = 'block';
    } else {
        modalTitle.textContent = 'Add New Product';
        productForm.reset();
        productIdInput.value = '';
        imagePreview.style.display = 'none';
    }
}

function closeModal() {
    productModal.classList.remove('active');
    productForm.reset();
}

async function handleProductSubmit(e) {
    e.preventDefault();
    
    const saveBtn = document.getElementById('saveProductBtn');
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    
    const productData = {
        title: document.getElementById('title').value,
        price: parseFloat(document.getElementById('price').value),
        category: document.getElementById('category').value,
        image: document.getElementById('image').value,
        description: document.getElementById('description').value,
    };
    
    const id = productIdInput.value;
    
    try {
        if (id) {
            // Update
            await updateDoc(doc(db, "products", id), productData);
            showToast('Product updated successfully!', 'success');
        } else {
            // Create
            productData.createdAt = new Date();
            await addDoc(collection(db, "products"), productData);
            showToast('Product added successfully!', 'success');
        }
        closeModal();
    } catch (error) {
        console.error("Error saving product:", error);
        showToast('Error saving product.', 'error');
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = 'Save Product';
    }
}

function loadProducts() {
    // Real-time listener
    onSnapshot(collection(db, "products"), (snapshot) => {
        products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Update stats
        const prodCountAll = document.getElementById('prodCountAll');
        const prodCountCategories = document.getElementById('prodCountCategories');
        if (prodCountAll) prodCountAll.textContent = products.length;
        if (prodCountCategories) {
            const cats = new Set(products.map(p => p.category).filter(Boolean));
            prodCountCategories.textContent = cats.size;
        }
        
        renderProducts(products);
    }, (error) => {
        console.error("Error loading products:", error);
        productsTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Failed to load products</td></tr>`;
    });
}

function renderProducts(productsToRender) {
    if (productsToRender.length === 0) {
        productsTableBody.innerHTML = `<tr><td colspan="5" class="text-center">No products found.</td></tr>`;
        return;
    }
    
    productsTableBody.innerHTML = productsToRender.map(product => `
        <tr>
            <td><img src="${product.image}" alt="${product.title}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"></td>
            <td><strong>${product.title}</strong></td>
            <td>${product.category}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td class="action-btns">
                <button class="btn-icon edit" onclick="window.editProduct('${product.id}')"><i class="fas fa-edit"></i></button>
                <button class="btn-icon delete" onclick="window.deleteProduct('${product.id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

// Global functions for inline onclick handlers
window.editProduct = (id) => {
    const product = products.find(p => p.id === id);
    if (product) openModal(product);
};

window.deleteProduct = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            await deleteDoc(doc(db, "products", id));
            showToast('Product deleted successfully!', 'success');
        } catch (error) {
            console.error("Error deleting product:", error);
            showToast('Error deleting product.', 'error');
        }
    }
};

function showToast(message, type) {
    // Basic toast implementation
    const existing = document.querySelector('.toast-container');
    if(!existing) {
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> <span>${message}</span>`;
    
    document.querySelector('.toast-container').appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after 3s
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
