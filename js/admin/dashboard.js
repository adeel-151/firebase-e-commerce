import { db, auth } from '../firebase-config.js';
import { collection, getDocs, query, orderBy, limit, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const totalProductsEl = document.getElementById('totalProducts');
const totalOrdersEl = document.getElementById('totalOrders');
const totalSalesEl = document.getElementById('totalSales');
const totalCategoriesEl = document.getElementById('totalCategories');
const recentOrdersBody = document.getElementById('recentOrdersBody');
const adminEmail = document.getElementById('adminEmail');
const logoutBtn = document.getElementById('logoutBtn');
const logoutBtnSidebar = document.getElementById('logoutBtnSidebar');

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

if (logoutBtnSidebar) {
    logoutBtnSidebar.addEventListener('click', (e) => {
        e.preventDefault();
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
    
    // Categories
    onSnapshot(collection(db, "categories"), (snapshot) => {
        if (totalCategoriesEl) totalCategoriesEl.textContent = snapshot.size;
    });

    // Orders & Sales
    onSnapshot(collection(db, "orders"), (snapshot) => {
        totalOrdersEl.textContent = snapshot.size;
        
        let total = 0;
        const last7Days = {};
        
        // Initialize last 7 days array
        for(let i=6; i>=0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            last7Days[d.toLocaleDateString()] = 0;
        }

        snapshot.docs.forEach(doc => {
            const order = doc.data();
            total += order.total || 0;
            
            if (order.createdAt && order.createdAt.toDate) {
                const orderDate = order.createdAt.toDate().toLocaleDateString();
                if (last7Days[orderDate] !== undefined) {
                    last7Days[orderDate] += (order.total || 0);
                }
            }
        });
        totalSalesEl.textContent = `$${total.toFixed(2)}`;
        
        // Render Chart
        renderChart(last7Days);
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
            const date = order.createdAt && order.createdAt.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A';
            const statusClass = order.status ? order.status.toLowerCase() : 'pending';
            return `
                <tr>
                    <td>#${doc.id.slice(0, 8)}</td>
                    <td>${date}</td>
                    <td>${order.userEmail}</td>
                    <td>$${(order.total || 0).toFixed(2)}</td>
                    <td><span class="badge ${statusClass}">${order.status || 'Pending'}</span></td>
                </tr>
            `;
        }).join('');
    });
}

let chartInstance = null;
function renderChart(dataMap) {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    
    const labels = Object.keys(dataMap);
    const data = Object.values(dataMap);
    
    if (chartInstance) {
        chartInstance.destroy();
    }
    
    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Revenue ($)',
                data: data,
                borderColor: '#c0a062',
                backgroundColor: 'rgba(192, 160, 98, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();
});
