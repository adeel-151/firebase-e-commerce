import { db, auth } from '../firebase-config.js';
import { collection, doc, updateDoc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const usersTableBody = document.getElementById('usersTableBody');
const userSearch = document.getElementById('userSearch');
const userModal = document.getElementById('userModal');
const userForm = document.getElementById('userForm');
const closeUserModalBtn = document.getElementById('closeUserModalBtn');
const cancelUserModalBtn = document.getElementById('cancelUserModalBtn');
const userIdInput = document.getElementById('userId');
const userRoleSelect = document.getElementById('userRole');

let allUsers = [];

function loadUsers() {
    onSnapshot(collection(db, "users"), (snapshot) => {
        allUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const countAll = document.getElementById('userCountAll');
        const countAdmin = document.getElementById('userCountAdmin');
        
        if (countAll) countAll.textContent = allUsers.length;
        if (countAdmin) countAdmin.textContent = allUsers.filter(u => u.role === 'admin').length;
        
        applyFilters();
    }, (error) => {
        console.error("Error loading users:", error);
        usersTableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error loading users.</td></tr>';
    });
}

function renderUsers(usersToRender) {
    if (usersToRender.length === 0) {
        usersTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No users found.</td></tr>';
        return;
    }

    usersTableBody.innerHTML = usersToRender.map(user => {
        const date = user.createdAt ? (user.createdAt.toDate ? user.createdAt.toDate().toLocaleDateString() : 'N/A') : 'N/A';
        const role = user.role || 'customer';
        const roleBadgeClass = role === 'admin' ? 'bg-primary' : 'bg-secondary';
        
        return `
            <tr>
                <td><strong>${user.name || 'N/A'}</strong></td>
                <td>${user.email || 'N/A'}</td>
                <td><span class="badge ${roleBadgeClass} text-white">${role}</span></td>
                <td>${date}</td>
                <td class="action-btns">
                    <button class="btn-icon edit" onclick="window.editUserRole('${user.id}')" title="Change Role"><i class="fas fa-shield-alt"></i></button>
                    <button class="btn-icon delete" onclick="window.deleteUser('${user.id}')" title="Delete User"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    }).join('');
}

function applyFilters() {
    const searchTerm = userSearch ? userSearch.value.toLowerCase() : '';
    const filtered = allUsers.filter(u => 
        (u.name && u.name.toLowerCase().includes(searchTerm)) || 
        (u.email && u.email.toLowerCase().includes(searchTerm))
    );
    renderUsers(filtered);
}

if (userSearch) {
    userSearch.addEventListener('input', applyFilters);
}

window.editUserRole = (id) => {
    const user = allUsers.find(u => u.id === id);
    if (!user) return;
    
    userIdInput.value = user.id;
    userRoleSelect.value = user.role || 'customer';
    userModal.classList.add('active');
};

const closeModal = () => {
    userModal.classList.remove('active');
    userForm.reset();
};

if (closeUserModalBtn) closeUserModalBtn.addEventListener('click', closeModal);
if (cancelUserModalBtn) cancelUserModalBtn.addEventListener('click', closeModal);

if (userForm) {
    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = userIdInput.value;
        const newRole = userRoleSelect.value;
        const saveBtn = document.getElementById('saveUserBtn');
        
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Updating...';
        
        try {
            await updateDoc(doc(db, "users", id), { role: newRole });
            showToast('User role updated successfully.', 'success');
            closeModal();
        } catch (error) {
            console.error("Error updating role:", error);
            showToast('Error updating user role.', 'error');
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save me-2"></i>Update Role';
        }
    });
}

window.deleteUser = async (id) => {
    if (confirm('Are you sure you want to delete this user document? Note: This does not delete their Firebase Auth account.')) {
        try {
            await deleteDoc(doc(db, "users", id));
            showToast('User document deleted successfully.', 'success');
        } catch (error) {
            console.error("Error deleting user:", error);
            showToast('Error deleting user.', 'error');
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
    loadUsers();
});
