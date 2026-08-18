import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const seedBtn = document.getElementById('seedBtn');
const seedStatus = document.getElementById('seedStatus');

async function createAccount(email, password, name, role) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        await updateProfile(user, { displayName: name });
        
        await setDoc(doc(db, "users", user.uid), {
            name: name,
            email: email,
            role: role,
            createdAt: serverTimestamp()
        });
        
        return true;
    } catch (error) {
        // If email already in use, we just return true for our seed script simplicity
        if (error.code === 'auth/email-already-in-use') {
            return true;
        }
        console.error(`Error creating ${role}:`, error);
        throw error;
    }
}

if (seedBtn) {
    seedBtn.addEventListener('click', async () => {
        seedBtn.disabled = true;
        seedBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Creating accounts...';
        seedStatus.classList.add('d-none');
        
        try {
            await createAccount('admin@example.com', 'admin123', 'Admin User', 'admin');
            await createAccount('user@example.com', 'user123', 'Dummy User', 'customer');
            
            seedStatus.textContent = 'Successfully created Admin and User dummy accounts! You can now login.';
            seedStatus.className = 'alert alert-success mt-3';
        } catch (error) {
            seedStatus.textContent = 'Error creating accounts. Check console.';
            seedStatus.className = 'alert alert-danger mt-3';
        } finally {
            seedBtn.disabled = false;
            seedBtn.innerHTML = 'Create Dummy Accounts';
            seedStatus.classList.remove('d-none');
        }
    });
}
