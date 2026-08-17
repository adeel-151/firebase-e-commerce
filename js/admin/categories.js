import { db, auth } from '../firebase-config.js';
import { collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const categoriesTableBody = document.getElementById('categoriesTableBody');
const categorySearch = document.getElementById('categorySearch');
const addCategoryBtn = document.getElementById('addCategoryBtn');
const categoryModal = document.getElementById('categoryModal');
const categoryForm = document.getElementById('categoryForm');
const closeCategoryModalBtn = document.getElementById('closeCategoryModalBtn');
const cancelCategoryModalBtn = document.getElementById('cancelCategoryModalBtn');
const categoryIdInput = document.getElementById('categoryId');
const categoryNameInput = document.getElementById('categoryName');
const categoryDescInput = document.getElementById('categoryDesc');
const modalTitle = document.getElementById('modalTitle');

let allCategories = [];

function loadCategories() {
    onSnapshot(collection(db, "categories"), (snapshot) => {
        allCategories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const countAll = document.getElementById('categoryCountAll');
        if (countAll) countAll.textContent = allCategories.length;
        
        applyFilters();
    }, (error) => {
        console.error("Error loading categories:", error);
        categoriesTableBody.innerHTML = '<tr><td colspan="3" class="text-center text-danger">Error loading categories.</td></tr>';
    });
}

function renderCategories(categoriesToRender) {
    if (categoriesToRender.length === 0) {
        categoriesTableBody.innerHTML = '<tr><td colspan="3" class="text-center">No categories found.</td></tr>';
        return;
    }

    categoriesTableBody.innerHTML = categoriesToRender.map(cat => {
        return `
            <tr>
                <td><strong>${cat.name}</strong></td>
                <td>${cat.description || '<span class="text-muted italic">No description</span>'}</td>
                <td class="action-btns">
                    <button class="btn-icon edit" onclick="window.editCategory('${cat.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon delete" onclick="window.deleteCategory('${cat.id}')" title="Delete"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    }).join('');
}

function applyFilters() {
    const searchTerm = categorySearch ? categorySearch.value.toLowerCase() : '';
    const filtered = allCategories.filter(c => 
        c.name.toLowerCase().includes(searchTerm)
    );
    renderCategories(filtered);
}

if (categorySearch) {
    categorySearch.addEventListener('input', applyFilters);
}

function openModal(category = null) {
    categoryModal.classList.add('active');
    if (category) {
        modalTitle.textContent = 'Edit Category';
        categoryIdInput.value = category.id;
        categoryNameInput.value = category.name;
        categoryDescInput.value = category.description || '';
    } else {
        modalTitle.textContent = 'Add New Category';
        categoryForm.reset();
        categoryIdInput.value = '';
    }
}

const closeModal = () => {
    categoryModal.classList.remove('active');
    categoryForm.reset();
};

if (addCategoryBtn) addCategoryBtn.addEventListener('click', () => openModal());
if (closeCategoryModalBtn) closeCategoryModalBtn.addEventListener('click', closeModal);
if (cancelCategoryModalBtn) cancelCategoryModalBtn.addEventListener('click', closeModal);

if (categoryForm) {
    categoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = categoryIdInput.value;
        const name = categoryNameInput.value.trim();
        const desc = categoryDescInput.value.trim();
        const saveBtn = document.getElementById('saveCategoryBtn');
        
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Saving...';
        
        try {
            if (id) {
                await updateDoc(doc(db, "categories", id), { name: name, description: desc });
                showToast('Category updated successfully.', 'success');
            } else {
                await addDoc(collection(db, "categories"), { 
                    name: name, 
                    description: desc,
                    createdAt: serverTimestamp()
                });
                showToast('Category created successfully.', 'success');
            }
            closeModal();
        } catch (error) {
            console.error("Error saving category:", error);
            showToast('Error saving category.', 'error');
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save me-2"></i>Save Category';
        }
    });
}

window.editCategory = (id) => {
    const category = allCategories.find(c => c.id === id);
    if (category) openModal(category);
};

window.deleteCategory = async (id) => {
    if (confirm('Are you sure you want to delete this category?')) {
        try {
            await deleteDoc(doc(db, "categories", id));
            showToast('Category deleted successfully.', 'success');
        } catch (error) {
            console.error("Error deleting category:", error);
            showToast('Error deleting category.', 'error');
        }
    }
};

function showToast(message, type) {
    let existing = document.querySelector('.toast-container');
    if(!existing) {
        existing = document.createElement('div');
        existing.className = 'toast-container';
        document.body.appendChild(existing);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> <span>${message}</span>`;
    existing.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
});
