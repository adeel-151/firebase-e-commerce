import { auth, db } from '../firebase-config.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const loginForm = document.getElementById('loginForm');
const errorMsg = document.getElementById('authError');
const loginBtn = document.getElementById('loginBtn');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        errorMsg.classList.add('d-none');
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Signing in...';
        
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Check user role in Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));
            let isAdmin = false;
            if (userDoc.exists()) {
                isAdmin = userDoc.data().role === 'admin';
            }
            
            // Redirect based on role
            if (isAdmin) {
                window.location.href = '../admin/index.html';
            } else {
                window.location.href = '../index.html';
            }
            
        } catch (error) {
            console.error("Login error:", error);
            errorMsg.textContent = "Invalid email or password. Please try again.";
            errorMsg.classList.remove('d-none');
            loginBtn.disabled = false;
            loginBtn.innerHTML = 'Sign In';
        }
    });
}
