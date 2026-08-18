import { db } from '../firebase-config.js';
import { collection, doc, updateDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const ordersTableBody = document.getElementById('ordersTableBody');
const statusFilter = document.getElementById('statusFilter');
const orderModal = document.getElementById('orderModal');
const closeOrderModalBtn = document.getElementById('closeOrderModalBtn');
const updateOrderStatus = document.getElementById('updateOrderStatus');
const saveOrderStatusBtn = document.getElementById('saveOrderStatusBtn');

let allOrders = [];
let currentOrder = null;

function loadOrders() {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    
    onSnapshot(q, (snapshot) => {
        allOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Update order stats
        const countAll = document.getElementById('orderCountAll');
        const countPending = document.getElementById('orderCountPending');
        const countShipped = document.getElementById('orderCountShipped');
        const countDelivered = document.getElementById('orderCountDelivered');
        
        if (countAll) countAll.textContent = allOrders.length;
        if (countPending) countPending.textContent = allOrders.filter(o => o.status === 'Pending').length;
        if (countShipped) countShipped.textContent = allOrders.filter(o => o.status === 'Shipped').length;
        if (countDelivered) countDelivered.textContent = allOrders.filter(o => o.status === 'Delivered').length;
        
        applyFilters();
    }, (error) => {
        console.error("Error loading orders:", error);
        ordersTableBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error loading orders.</td></tr>';
    });
}

function renderOrders(orders) {
    if (orders.length === 0) {
        ordersTableBody.innerHTML = '<tr><td colspan="7" class="text-center">No orders found.</td></tr>';
        return;
    }

    ordersTableBody.innerHTML = orders.map(order => {
        const date = order.createdAt ? order.createdAt.toDate().toLocaleString() : 'N/A';
        const itemCount = order.items ? order.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
        const statusClass = order.status.toLowerCase();
        
        return `
            <tr>
                <td>#${order.id.slice(0, 8)}</td>
                <td>${date}</td>
                <td>${order.userEmail}</td>
                <td>${itemCount}</td>
                <td>$${(order.total || 0).toFixed(2)}</td>
                <td><span class="badge ${statusClass}">${order.status}</span></td>
                <td>
                    <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 12px;" onclick="window.viewOrder('${order.id}')">View / Update</button>
                </td>
            </tr>
        `;
    }).join('');
}

function applyFilters() {
    let filtered = [...allOrders];
    
    if (statusFilter && statusFilter.value !== 'all') {
        filtered = filtered.filter(o => o.status === statusFilter.value);
    }
    
    renderOrders(filtered);
}

if (statusFilter) {
    statusFilter.addEventListener('change', applyFilters);
}

// Global function for onclick
window.viewOrder = (id) => {
    currentOrder = allOrders.find(o => o.id === id);
    if (!currentOrder) return;
    
    document.getElementById('modalOrderId').textContent = `(#${currentOrder.id})`;
    document.getElementById('modalCustomerEmail').textContent = currentOrder.userEmail;
    document.getElementById('modalOrderDate').textContent = currentOrder.createdAt ? currentOrder.createdAt.toDate().toLocaleString() : 'N/A';
    document.getElementById('modalOrderTotal').textContent = `$${(currentOrder.total || 0).toFixed(2)}`;
    updateOrderStatus.value = currentOrder.status;
    
    const itemsList = document.getElementById('modalOrderItems');
    if (currentOrder.items && currentOrder.items.length > 0) {
        itemsList.innerHTML = currentOrder.items.map(item => `
            <li style="display: flex; gap: 15px; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #f0f0f0;">
                <img src="${item.image}" alt="${item.title}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                <div style="flex: 1;">
                    <div style="font-weight: 500;">${item.title}</div>
                    <div style="color: var(--text-light); font-size: 14px;">Qty: ${item.quantity} x $${item.price.toFixed(2)}</div>
                </div>
                <div style="font-weight: 600;">$${(item.quantity * item.price).toFixed(2)}</div>
            </li>
        `).join('');
    } else {
        itemsList.innerHTML = '<li>No items detail available.</li>';
    }
    
    orderModal.classList.add('active');
};

if (closeOrderModalBtn) {
    closeOrderModalBtn.addEventListener('click', () => {
        orderModal.classList.remove('active');
    });
}

if (saveOrderStatusBtn) {
    saveOrderStatusBtn.addEventListener('click', async () => {
        if (!currentOrder) return;
        
        saveOrderStatusBtn.disabled = true;
        saveOrderStatusBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        
        const newStatus = updateOrderStatus.value;
        
        try {
            await updateDoc(doc(db, "orders", currentOrder.id), {
                status: newStatus
            });
            
            // Try to send order status update email via EmailJS
            try {
                if (typeof emailjs !== 'undefined') {
                    await emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
                        to_email: currentOrder.userEmail,
                        to_name: "Customer", // You could fetch the actual name if stored in order
                        order_id: currentOrder.id,
                        order_total: (currentOrder.total || 0).toFixed(2),
                        order_status: newStatus
                    });
                    console.log(`Status update email sent for order ${currentOrder.id}`);
                }
            } catch (emailErr) {
                console.error("EmailJS error (Status Update):", emailErr);
            }

            orderModal.classList.remove('active');
            // Toast notification could be added here
        } catch (error) {
            console.error("Error updating order:", error);
            alert("Failed to update order status.");
        } finally {
            saveOrderStatusBtn.disabled = false;
            saveOrderStatusBtn.innerHTML = 'Update';
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadOrders();
});
