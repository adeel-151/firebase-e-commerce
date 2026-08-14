import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// DOM Elements
const userMenu = document.getElementById('userMenu');
const mobileUserMenu = document.getElementById('mobileUserMenu');

// Observer
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // User is signed in
        const isAdmin = await checkUserRole(user.uid);
        updateNavigation(user, isAdmin);
        
        // If on login/signup page, redirect to home
        if (window.location.pathname.includes('login.html') || window.location.pathname.includes('signup.html')) {
            window.location.href = '../index.html';
        }
    } else {
        // User is signed out
        resetNavigation();
        
        // Protect admin routes
        if (window.location.pathname.includes('/admin/')) {
            window.location.href = '../auth/login.html';
        }
    }
});

async function checkUserRole(uid) {
    try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
            return userDoc.data().role === 'admin';
        }
    } catch (error) {
        console.error("Error checking role:", error);
    }
    return false;
}

function updateNavigation(user, isAdmin) {
    const name = user.displayName ? user.displayName.split(' ')[0] : 'User';
    const pathLevel = window.location.pathname.includes('/auth/') || window.location.pathname.includes('/admin/') ? '../' : '';
    
    // Desktop Nav
    if (userMenu) {
        userMenu.innerHTML = `
            <div class="user-menu-wrapper position-relative">
                <button class="btn btn-link text-white text-decoration-none p-0 d-flex align-items-center shadow-none">
                    <div class="icon-wrapper" title="Hi, ${name}"><i class="far fa-user"></i></div>
                </button>
                <div class="user-menu-dropdown">
                    ${isAdmin ? `<a href="${pathLevel}admin/index.html" class="dropdown-custom-item border-bottom border-light">Dashboard</a>` : ''}
                    <a href="#" id="logoutLink" class="dropdown-custom-item">Logout</a>
                </div>
            </div>
        `;
        document.getElementById('logoutLink').addEventListener('click', handleLogout);
    }

    // Mobile Nav
    if (mobileUserMenu) {
        mobileUserMenu.innerHTML = `
            <span class="d-block px-3 py-3 border-bottom border-secondary text-brand-gold font-serif">Hi, ${name}</span>
            ${isAdmin ? `<a href="${pathLevel}admin/index.html" class="d-block px-3 py-3 border-bottom border-secondary text-white text-decoration-none">Admin Dashboard</a>` : ''}
            <a href="#" id="mobileLogoutLink" class="d-block px-3 py-3 text-white text-decoration-none">Logout</a>
        `;
        document.getElementById('mobileLogoutLink').addEventListener('click', handleLogout);
    }
}

function resetNavigation() {
    const loginPath = window.location.pathname.includes('/auth/') || window.location.pathname.includes('/admin/') ? '../auth/login.html' : 'auth/login.html';
    
    if (userMenu) {
        userMenu.innerHTML = `<a href="${loginPath}" id="loginLink" class="text-white text-decoration-none d-flex align-items-center"><div class="icon-wrapper" title="Login"><i class="far fa-user"></i></div></a>`;
    }
    if (mobileUserMenu) {
        mobileUserMenu.innerHTML = `<a href="${loginPath}" id="mobileLoginLink" class="d-block px-3 py-3 text-white text-decoration-none">Login</a>`;
    }
}

async function handleLogout(e) {
    e.preventDefault();
    try {
        await signOut(auth);
        window.location.href = window.location.pathname.includes('/auth/') || window.location.pathname.includes('/admin/') ? '../index.html' : 'index.html';
    } catch (error) {
        console.error("Logout error:", error);
    }
}
