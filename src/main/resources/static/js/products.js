// =================================
// API URLs
// =================================

const API_URL = "/api/products";
const CART_API_URL = "/api/cart";
const WISHLIST_API_URL = "/api/wishlist";


// =================================
// USER AUTHENTICATION
// =================================

const userId = localStorage.getItem("userId");
const token = localStorage.getItem("token");


// =================================
// HTML ELEMENTS
// =================================

const productsContainer = document.getElementById("products-container");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const sortFilter = document.getElementById("sort-filter");
const resetBtn = document.getElementById("reset-btn");
const productCount = document.getElementById("product-count");
const cartCount = document.getElementById("cart-count");


// =================================
// PRODUCTS ARRAY
// =================================

let products = [];


// =================================
// GET PRODUCT EMOJI
// =================================

function getProductEmoji(product) {

    const category = product.category?.name?.toLowerCase() || "";

    if (category.includes("electronic")) {
        return "🎧";
    }

    else if (category.includes("fashion")) {
        return "👕";
    }

    else if (category.includes("home")) {
        return "🏠";
    }

    else if (category.includes("accessor")) {
        return "⌚";
    }

    return "🛍️";
}

// =================================
// GET PRODUCT IMAGE URL
// =================================

function getProductImageUrl(imageUrl) {

    if (!imageUrl) {
        return null;
    }

    // Already an uploaded image path
    if (imageUrl.startsWith("/uploads/")) {
        return imageUrl;
    }

    // Existing local static images
    if (imageUrl.startsWith("/images/")) {
        return imageUrl;
    }

    // Existing external image URLs
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
        return imageUrl;
    }

    // Newly uploaded image filename
    return `/uploads/${encodeURIComponent(imageUrl)}`;
}


// =================================
// FETCH ALL PRODUCTS
// =================================

async function getAllProducts() {

    try {

        productsContainer.innerHTML = `
            <div class="col-12 text-center">
                <p>Loading products...</p>
            </div>
        `;

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        products = await response.json();

        loadCategories();

        displayProducts(products);

    }

    catch (error) {

        console.error("Product loading error:", error);

        productsContainer.innerHTML = `
            <div class="col-12 text-center text-danger">
                <h5>Unable to load products.</h5>
                <p>Please try again later.</p>
            </div>
        `;

    }

}


// =================================
// LOAD CATEGORIES
// =================================

function loadCategories() {

    const categories = [];

    products.forEach(product => {

        const categoryName = product.category?.name;

        if (categoryName && !categories.includes(categoryName)) {
            categories.push(categoryName);
        }

    });

    categoryFilter.innerHTML = `
        <option value="all">All Categories</option>
    `;

    categories.sort().forEach(category => {

        const option = document.createElement("option");

        option.value = category;
        option.textContent = category;

        categoryFilter.appendChild(option);

    });

}


// =================================
// DISPLAY PRODUCTS
// =================================

function displayProducts(productList) {

    productsContainer.innerHTML = "";

    productCount.textContent = `${productList.length} Products`;

    if (productList.length === 0) {

        productsContainer.innerHTML = `
            <div class="col-12">
                <div class="no-products">
                    <span>🔍</span>
                    <h4>No products found</h4>
                    <p>Try another search or category.</p>
                </div>
            </div>
        `;

        return;

    }

    productList.forEach(product => {

        const productCard = document.createElement("div");

        productCard.className = "col-lg-3 col-md-6 col-sm-6";

        const emoji = getProductEmoji(product);

        const stockAvailable = Number(product.quantity) > 0;

        productCard.innerHTML = `

            <div class="product-card">
                <div class="product-image-placeholder">
                    <img
                        src="${getProductImageUrl(product.imageUrl) || ""}"
                        alt="${product.name || "Product"}"
                        class="product-card-image"
                        onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
                    >
                    <span style="display: ${product.imageUrl ? "none" : "block"}">
                        ${emoji}
                    </span>
                </div>
                <div class="card-body">
                    <span class="product-category">
                        ${product.category?.name || "General"}
                    </span>
                    <h5 class="mt-3">
                        ${product.name || "Unnamed Product"}
                    </h5>
                    <p class="product-description">
                        ${product.description || "Explore this amazing product."}
                    </p>
                    <p class="product-price">
                        ₹${Number(product.price).toLocaleString("en-IN")}
                    </p>
                    <p class="${stockAvailable ? "stock-available" : "stock-unavailable"}">
                        ${stockAvailable ? "✓ In Stock" : "✕ Out of Stock"}
                    </p>
                    <button class="btn btn-outline-danger w-100 mt-2" onclick="addToWishlist(${product.id})">
                        ❤️ Add to Wishlist
                    </button>
                    <a href="product-details.html?id=${encodeURIComponent(product.id)}"
                       class="btn btn-primary w-100">
                        View Product
                    </a>
                </div>
            </div>
        `;

        productsContainer.appendChild(productCard);

    });

}


// =================================
// SEARCH AND FILTER PRODUCTS
// =================================

function searchProducts() {

    const searchValue = searchInput.value.toLowerCase().trim();

    const selectedCategory = categoryFilter.value;

    const selectedSort = sortFilter.value;

    let filteredProducts = products.filter(product => {

        const productName = (product.name || "").toLowerCase();

        const matchesSearch = productName.includes(searchValue);

        const categoryName = product.category?.name || "";

        const matchesCategory =
            selectedCategory === "all" ||
            categoryName === selectedCategory;

        return matchesSearch && matchesCategory;

    });


    // Sorting

    if (selectedSort === "low-high") {

        filteredProducts.sort((a, b) =>
            Number(a.price) - Number(b.price)
        );

    }

    else if (selectedSort === "high-low") {

        filteredProducts.sort((a, b) =>
            Number(b.price) - Number(a.price)
        );

    }

    else if (selectedSort === "name") {

        filteredProducts.sort((a, b) =>
            (a.name || "").localeCompare(b.name || "")
        );

    }

    displayProducts(filteredProducts);

}


// =================================
// RESET FILTERS
// =================================

function resetFilters() {

    searchInput.value = "";

    categoryFilter.value = "all";

    sortFilter.value = "default";

    displayProducts(products);

}


// =================================
// UPDATE CART COUNT FROM DATABASE
// =================================

async function updateCartCount() {

    if (!userId || !token) {

        if (cartCount) {
            cartCount.textContent = "0";
        }

        return;
    }

    try {

        const response = await fetch(`${CART_API_URL}/${userId}`, {

            headers: {
                "Authorization": `Bearer ${token}`
            }

        });

        if (!response.ok) {
            cartCount.textContent = "0";
            return;
        }

        const cartItems = await response.json();

        const totalItems = cartItems.reduce(
            (total, item) => total + Number(item.quantity || 0),
            0
        );

        if (cartCount) {
            cartCount.textContent = totalItems;
        }

    }

    catch (error) {

        console.error("Error fetching cart count:", error);

        if (cartCount) {
            cartCount.textContent = "0";
        }

    }

}


// =================================
// EVENT LISTENERS
// =================================

searchInput.addEventListener("input", searchProducts);

categoryFilter.addEventListener("change", searchProducts);

sortFilter.addEventListener("change", searchProducts);

resetBtn.addEventListener("click", resetFilters);


// =================================
// PAGE LOAD
// =================================

document.addEventListener("DOMContentLoaded", () => {

    getAllProducts();

    updateCartCount();

});

// =================================
// ADD TO WISHLIST
// =================================

async function addToWishlist(productId) {

    if (!userId || !token) {
        alert("Please login to add products to your wishlist.");
        window.location.href = "login.html";
        return;
    }

    try {

        const response = await fetch(
            `${WISHLIST_API_URL}/add/${userId}/${productId}`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const responseText = await response.text();
        let data;
        try{
            data = responseText ? JSON.parse(responseText) : null;
        }catch{
            data = responseText;
        }

        if(!response.ok){
            throw new Error(typeof data === "string" ? data : data?.message || "Unable to add product to wishlist.");
        }

        alert("❤️ Product added to wishlist successfully!");

        if(typeof updateNavbarWishlistCount === "function"){
            await updateNavbarWishlistCount();
        }

    }

    catch (error) {

        console.error("Wishlist error:", error);

        alert(error.message);

    }

}