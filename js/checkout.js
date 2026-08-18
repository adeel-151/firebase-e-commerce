// js/checkout.js
import { db, auth } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// DOM Elements
const checkoutForm = document.getElementById('checkoutForm');
const payCardRadio = document.getElementById('payCard');
const payCODRadio = document.getElementById('payCOD');
const cardForm = document.getElementById('cardForm');
const checkoutItemsContainer = document.getElementById('checkoutItemsContainer');
const checkoutSubtotal = document.getElementById('checkoutSubtotal');
const checkoutTotal = document.getElementById('checkoutTotal');
const placeOrderBtn = document.getElementById('placeOrderBtn');
const checkoutContent = document.getElementById('checkoutContent');
const checkoutSuccess = document.getElementById('checkoutSuccess');
const successOrderId = document.getElementById('successOrderId');

// Card inputs (for validation toggle)
const cardInputs = [
    document.getElementById('cardNumber'),
    document.getElementById('cardExpiry'),
    document.getElementById('cardCvv')
];

let cartItems = [];
let cartTotal = 0;

// Initialize Page
document.addEventListener('DOMContentLoaded', () => {
    cartItems = JSON.parse(localStorage.getItem('lumiere_cart')) || [];
    
    if (cartItems.length === 0) {
        window.location.href = 'cart.html';
        return;
    }
    
    renderOrderSummary();
    setupPaymentToggle();
});

function renderOrderSummary() {
    checkoutItemsContainer.innerHTML = '';
    cartTotal = 0;
    
    cartItems.forEach(item => {
        cartTotal += item.price * item.quantity;
        
        checkoutItemsContainer.innerHTML += `
            <div class="d-flex align-items-center gap-3">
                <img src="${item.image}" alt="${item.title}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
                <div class="flex-grow-1">
                    <div class="font-serif fw-bold" style="font-size: 14px;">${item.title}</div>
                    <div class="text-muted small">Qty: ${item.quantity}</div>
                </div>
                <div class="fw-bold" style="font-size: 14px;">Rs.${(item.price * item.quantity).toFixed(2)}</div>
            </div>
        `;
    });
    
    checkoutSubtotal.textContent = `Rs.${cartTotal.toFixed(2)}`;
    checkoutTotal.textContent = `Rs.${cartTotal.toFixed(2)}`;
}

function setupPaymentToggle() {
    const toggleCardForm = () => {
        if (payCardRadio.checked) {
            cardForm.classList.remove('d-none');
            cardInputs.forEach(input => input.setAttribute('required', 'true'));
        } else {
            cardForm.classList.add('d-none');
            cardInputs.forEach(input => input.removeAttribute('required'));
        }
    };
    
    payCardRadio.addEventListener('change', toggleCardForm);
    payCODRadio.addEventListener('change', toggleCardForm);
}

if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent page reload
        
        placeOrderBtn.disabled = true;
        placeOrderBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Processing...';
        
        // 1. Gather Customer Details
        const customerInfo = {
            firstName: document.getElementById('chkFirstName').value,
            lastName: document.getElementById('chkLastName').value,
            email: document.getElementById('chkEmail').value,
            phone: document.getElementById('chkPhone').value,
            address: document.getElementById('chkAddress').value,
            city: document.getElementById('chkCity').value,
            zip: document.getElementById('chkZip').value
        };
        
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
        
        // 2. Identify User (Guest or Logged In)
        const user = auth.currentUser;
        const userId = user ? user.uid : 'guest';
        const userEmail = customerInfo.email; // Use form email as primary contact
        
        // 3. Build Order Object
        const orderData = {
            userId: userId,
            userEmail: userEmail,
            customerInfo: customerInfo,
            paymentMethod: paymentMethod,
            items: cartItems,
            total: cartTotal,
            status: 'Pending',
            createdAt: serverTimestamp()
        };
        
        try {
            // 4. Save to Firestore
            const docRef = await addDoc(collection(db, "orders"), orderData);
            
            // 5. Try to send EmailJS Confirmation
            try {
                if (typeof emailjs !== 'undefined') {
                    await emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
                        to_email: userEmail,
                        to_name: `${customerInfo.firstName} ${customerInfo.lastName}`,
                        order_id: docRef.id,
                        order_total: cartTotal.toFixed(2),
                        order_status: "Pending"
                    });
                    console.log("Order confirmation email sent.");
                }
            } catch (emailErr) {
                console.error("EmailJS error (Order Confirmation):", emailErr);
            }

            // 6. Cleanup & Success State
            localStorage.removeItem('lumiere_cart');
            
            checkoutContent.classList.add('d-none');
            checkoutSuccess.classList.remove('d-none');
            successOrderId.textContent = `#${docRef.id.slice(0,8).toUpperCase()}`;
            
        } catch (error) {
            console.error("Checkout error:", error);
            alert("Error processing checkout. Please try again.");
            placeOrderBtn.disabled = false;
            placeOrderBtn.innerHTML = 'Place Order';
        }
    });
}
