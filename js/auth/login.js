import { auth } from '../firebase-config.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const loginForm = document.getElementById('loginForm');
const errorMsg = document.getElementById('authError');
const loginBtn = document.getElementById('loginBtn');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        errorMsg.classList.add('hidden');
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Signing in...';
        
        try {
            await signInWithEmailAndPassword(auth, email, password);
            
            // Redirect based on previous page or default to home
            // In a real app we might check user role in Firestore here
            // to redirect admins to dashboard directly
            window.location.href = '../index.html';
            
        } catch (error) {
            console.error("Login error:", error);
            errorMsg.textContent = "Invalid email or password. Please try again.";
            errorMsg.classList.remove('hidden');
            loginBtn.disabled = false;
            loginBtn.innerHTML = 'Sign In';
        }
    });
}
