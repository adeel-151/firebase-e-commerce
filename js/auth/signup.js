import { auth, db } from '../firebase-config.js';
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const signupForm = document.getElementById('signupForm');
const errorMsg = document.getElementById('authError');
const signupBtn = document.getElementById('signupBtn');

if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        errorMsg.classList.add('hidden');
        signupBtn.disabled = true;
        signupBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Creating account...';
        
        try {
            // 1. Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // 2. Update display name
            await updateProfile(user, { displayName: name });
            
            // 3. Create user document in Firestore
            await setDoc(doc(db, "users", user.uid), {
                name: name,
                email: email,
                role: 'customer', // default role
                createdAt: serverTimestamp()
            });
            
            // 4. Redirect to home
            window.location.href = '../index.html';
            
        } catch (error) {
            console.error("Signup error:", error);
            errorMsg.textContent = error.message;
            errorMsg.classList.remove('hidden');
            signupBtn.disabled = false;
            signupBtn.innerHTML = 'Create Account';
        }
    });
}
