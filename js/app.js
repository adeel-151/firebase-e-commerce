import './auth-state.js'; // Ensure auth state observer runs
import { db } from './firebase-config.js';
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { updateCartBadge } from './cart.js'; // We will export this from cart.js

const productsGrid = document.getElementById('productsGrid');
const loadingProducts = document.getElementById('loadingProducts');
const noProductsFound = document.getElementById('noProductsFound');
const categoryFilter = document.getElementById('categoryFilter');
const sortFilter = document.getElementById('sortFilter');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');

// Mobile nav toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileNav = document.getElementById('mobileNav');
if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        mobileNav.classList.toggle('active');
    });
}

let allProducts = [];

// Load products initially
async function fetchProducts() {
    try {
        if(loadingProducts) loadingProducts.style.display = 'block';
        if(productsGrid) productsGrid.innerHTML = '';
        if(noProductsFound) noProductsFound.classList.add('d-none');
        try {
            const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
            const snapshot = await getDocs(q);
            allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (dbError) {
            console.warn("Could not fetch products from Firestore, falling back to mock data.", dbError);
            allProducts = []; // Trigger the auto-seed/fallback block below
        }
        
        // Auto-seed with Unsplash images if database is empty or failed
        if (allProducts.length === 0) {
            const defaultProducts = [
                // Clothes & Garments
                { id: "seed1", title: "Premium Boski Silk", category: "Clothes", price: 15000, description: "Authentic premium boski silk for special occasions. Features a smooth, rich texture.", image: "https://images.unsplash.com/photo-1594938298596-eb5fd3f50db2?q=80&w=800&auto=format&fit=crop" },
                { id: "seed2", title: "Classic Wash & Wear", category: "Garments", price: 4500, description: "Durable and elegant wash & wear fabric for everyday use.", image: "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=800&auto=format&fit=crop" },
                { id: "seed3", title: "Royal Cotton Suit", category: "Clothes", price: 6000, description: "100% pure Egyptian cotton. Breathable and comfortable.", image: "https://images.unsplash.com/photo-1594938328870-98233e536b56?q=80&w=800&auto=format&fit=crop" },
                { id: "seed4", title: "Signature Karandi", category: "Garments", price: 8500, description: "Warm and stylish karandi fabric for the winter season.", image: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?q=80&w=800&auto=format&fit=crop" },
                { id: "seed5", title: "Velvet Evening Gown", category: "Clothes", price: 25000, description: "Luxurious velvet evening gown for high-end events.", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop" },
                
                // Shoes
                { id: "seed6", title: "Oxford Leather Shoes", category: "Shoes", price: 12000, description: "Handcrafted genuine leather Oxford shoes.", image: "https://images.unsplash.com/photo-1614252339474-ce3a48e71c9b?q=80&w=800&auto=format&fit=crop" },
                { id: "seed7", title: "Classic Urban Sneakers", category: "Shoes", price: 8000, description: "Comfortable and stylish urban sneakers.", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop" },
                { id: "seed8", title: "Stiletto Heels", category: "Shoes", price: 15000, description: "Elegant stiletto heels for parties.", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop" },
                { id: "seed9", title: "Desert Boots", category: "Shoes", price: 9500, description: "Suede desert boots perfect for casual outings.", image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=800&auto=format&fit=crop" },
                
                // Perfumes
                { id: "seed10", title: "Oud Wood Intense", category: "Perfumes", price: 22000, description: "Rich, smoky, and woody oud fragrance.", image: "https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?q=80&w=800&auto=format&fit=crop" },
                { id: "seed11", title: "Floral Bloom", category: "Perfumes", price: 18000, description: "Fresh and elegant floral notes.", image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop" },
                { id: "seed12", title: "Noir Extrême", category: "Perfumes", price: 25000, description: "Mysterious and bold fragrance for the night.", image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=800&auto=format&fit=crop" },
                
                // Cosmetics
                { id: "seed13", title: "Matte Ruby Lipstick", category: "Cosmetics", price: 3500, description: "Long-lasting matte lipstick in ruby red.", image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=800&auto=format&fit=crop" },
                { id: "seed14", title: "Pro Eyeshadow Palette", category: "Cosmetics", price: 7500, description: "18 highly pigmented shades.", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=800&auto=format&fit=crop" },
                { id: "seed15", title: "Hydrating Face Serum", category: "Cosmetics", price: 5500, description: "Deep hydration with hyaluronic acid.", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop" }
            ];
            
            try {
                // Only try to save if we haven't failed already
                const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
                for (const p of defaultProducts) {
                    const { id, ...dataToSave } = p;
                    await addDoc(collection(db, "products"), {
                        ...dataToSave,
                        createdAt: serverTimestamp()
                    });
                }
                const snapshot2 = await getDocs(q);
                allProducts = snapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } catch (seedError) {
                console.warn("Could not seed database (likely permissions), falling back to in-memory mock products.", seedError);
                allProducts = defaultProducts; // Fallback so UI still looks good
            }
        }

        populateCategories(allProducts);
        renderProducts(allProducts);
        
    } catch (error) {
        console.error("Error fetching products:", error);
        if(productsGrid) productsGrid.innerHTML = '<p class="text-danger text-center w-100 col-12">Failed to load products.</p>';
    } finally {
        if(loadingProducts) loadingProducts.style.display = 'none';
    }
}

function populateCategories(products) {
    if(!categoryFilter) return;
    const categories = [...new Set(products.map(p => p.category))];
    const existingOptions = Array.from(categoryFilter.options).map(o => o.value);
    
    categories.forEach(cat => {
        if (!existingOptions.includes(cat)) {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categoryFilter.appendChild(option);
        }
    });
}

function renderProducts(productsToRender) {
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';
    
    // Limit to 4 items on the landing page
    const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');
    const displayProducts = isHomePage ? productsToRender.slice(0, 4) : productsToRender;
    
    if (displayProducts.length === 0) {
        if(noProductsFound) noProductsFound.classList.remove('d-none');
        return;
    } else {
        if(noProductsFound) noProductsFound.classList.add('d-none');
    }
    
    const fragment = document.createDocumentFragment();
    
    displayProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'col';
        card.innerHTML = `
            <div class="product-card-enhanced position-relative h-100 pb-3">
                <a href="product.html?id=${product.id}" class="product-card-link text-decoration-none d-block position-relative overflow-hidden">
                    <span class="position-absolute top-0 start-0 m-3 bg-brand-dark text-brand-gold small fw-bold px-3 py-1 text-uppercase tracking-widest z-1" style="font-size: 0.7rem;">New Arrival</span>
                    <img src="${product.image}" alt="${product.title}" class="product-card-img w-100 object-fit-cover" style="height: 300px;">
                    <button class="btn cart-overlay-btn" onclick="event.preventDefault(); window.addToCart('${product.id}')"><i class="fas fa-shopping-bag me-2"></i>Quick Add</button>
                </a>
                <div class="px-4 pt-4 text-center">
                    <p class="text-brand-gold small mb-1 tracking-widest text-uppercase">${product.category}</p>
                    <h3 class="fs-5 font-serif text-brand-dark mb-2">
                        <a href="product.html?id=${product.id}" class="text-decoration-none text-brand-dark hover-gold transition-colors">${product.title}</a>
                    </h3>
                    <p class="fw-bold text-brand-dark fs-5 mb-0">Rs. ${product.price.toLocaleString()}</p>
                </div>
            </div>
        `;
        fragment.appendChild(card);
    });
    
    productsGrid.appendChild(fragment);
}

// Filtering and Sorting
function applyFilters() {
    let filtered = [...allProducts];
    
    // Search
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    if (searchTerm) {
        filtered = filtered.filter(p => p.title.toLowerCase().includes(searchTerm));
    }
    
    // Category
    const category = categoryFilter ? categoryFilter.value : 'all';
    if (category !== 'all') {
        filtered = filtered.filter(p => p.category === category);
    }
    
    // Sort
    const sort = sortFilter ? sortFilter.value : 'default';
    if (sort === 'price-asc') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
        filtered.sort((a, b) => b.price - a.price);
    } else if (sort === 'name-asc') {
        filtered.sort((a, b) => a.title.localeCompare(b.title));
    }
    
    renderProducts(filtered);
}

// Event Listeners for Filters
if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
if (sortFilter) sortFilter.addEventListener('change', applyFilters);
if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', applyFilters);
    searchInput.addEventListener('keyup', (e) => {
        if(e.key === 'Enter') applyFilters();
    });
}
const clearFiltersBtn = document.getElementById('clearFiltersBtn');
if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
        if(searchInput) searchInput.value = '';
        if(categoryFilter) categoryFilter.value = 'all';
        if(sortFilter) sortFilter.value = 'default';
        applyFilters();
    });
}

// Expose addToCart globally for inline handlers
window.addToCart = (productId) => {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    let cart = JSON.parse(localStorage.getItem('lumiere_cart')) || [];
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    localStorage.setItem('lumiere_cart', JSON.stringify(cart));
    
    // Show feedback
    const btn = event.currentTarget;
    const originalText = btn.innerHTML;
    const originalClasses = btn.className;
    
    btn.innerHTML = '<i class="fas fa-check"></i> Added';
    btn.className = 'btn bg-brand-gold text-white w-100 py-2 text-uppercase tracking-widest small fw-bold d-flex justify-content-center align-items-center gap-2 transition-colors';
    
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.className = originalClasses;
    }, 1500);
    
    updateCartBadge();
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    if (productsGrid) {
        fetchProducts();
    }
});

// Sticky Navbar Scroll Effect
document.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar && window.scrollY > 50) {
        navbar.classList.add('scrolled-nav');
    } else if (navbar) {
        navbar.classList.remove('scrolled-nav');
    }
});
