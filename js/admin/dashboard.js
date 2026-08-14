import { db, auth } from '../firebase-config.js';
import { collection, getDocs, query, orderBy, limit, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const totalProductsEl = document.getElementById('totalProducts');
const totalOrdersEl = document.getElementById('totalOrders');
const totalSalesEl = document.getElementById('totalSales');
const recentOrdersBody = document.getElementById('recentOrdersBody');
const adminEmail = document.getElementById('adminEmail');
const logoutBtn = document.getElementById('logoutBtn');

// Auth check
auth.onAuthStateChanged(user => {
    if (user) {
        adminEmail.textContent = user.email;
    }
});

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        auth.signOut().then(() => {
            window.location.href = '../auth/login.html';
        });
    });
}

// Load Dashboard Data
function loadDashboardData() {
    // Total Products
    onSnapshot(collection(db, "products"), (snapshot) => {
        totalProductsEl.textContent = snapshot.size;
    });

    // Orders & Sales
    onSnapshot(collection(db, "orders"), (snapshot) => {
        totalOrdersEl.textContent = snapshot.size;
        
        let total = 0;
        snapshot.docs.forEach(doc => {
            total += doc.data().total || 0;
        });
        totalSalesEl.textContent = `$${total.toFixed(2)}`;
    });

    // Recent Orders
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(5));
    onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
            recentOrdersBody.innerHTML = '<tr><td colspan="5" class="text-center">No orders found.</td></tr>';
            return;
        }

        recentOrdersBody.innerHTML = snapshot.docs.map(doc => {
            const order = doc.data();
            const date = order.createdAt ? order.createdAt.toDate().toLocaleDateString() : 'N/A';
            const statusClass = order.status.toLowerCase();
            return `
                <tr>
                    <td>#${doc.id.slice(0, 8)}</td>
                    <td>${date}</td>
                    <td>${order.userEmail}</td>
                    <td>$${(order.total || 0).toFixed(2)}</td>
                    <td><span class="badge ${statusClass}">${order.status}</span></td>
                </tr>
            `;
        }).join('');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
});
