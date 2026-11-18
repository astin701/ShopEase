// =================================
// API URLs
// =================================

const API_URL = "/api/products";
const CART_API_URL = "/api/cart";


// =================================
// HTML Elements
// =================================

const featuredProducts = document.getElementById("featured-products");
const cartCount = document.getElementById("cart-count");


// =================================
// User Authentication
// =================================

const userId = localStorage.getItem("userId");
const token = localStorage.getItem("token");


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

    imageUrl = imageUrl.trim();

    // Complete image URL
    if (
        imageUrl.startsWith("http://") ||
        imageUrl.startsWith("https://")
    ) {
        return imageUrl;
    }

    // Existing absolute paths
    if (imageUrl.startsWith("/")) {
        return imageUrl;
    }

    // Existing uploads folder path
    if (imageUrl.startsWith("uploads/")) {
        return `/${imageUrl}`;
    }

    // Uploaded image filename
    return `/uploads/${imageUrl}`;
}


// =================================
// FETCH FEATURED PRODUCTS
// =================================

async function getFeaturedProducts() {

    try {

        featuredProducts.innerHTML = `
            <div class="col-12 text-center">
                <p>Loading products...</p>
            </div>
        `;

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const products = await response.json();

        featuredProducts.innerHTML = "";

        if (products.length === 0) {

            featuredProducts.innerHTML = `
                <div class="col-12 text-center">
                    <p>No products available.</p>
                </div>
            `;

            return;
        }

        // Display first four products
        const featured = products.slice(0, 4);

        featured.forEach(product => {

            const productCard = document.createElement("div");

            productCard.className = "col-lg-3 col-md-6 col-sm-6";

            const emoji = getProductEmoji(product);

            // Get actual product image URL
            const imageUrl = getProductImageUrl(product.imageUrl);

            productCard.innerHTML = `

                <div class="product-card">

                    <div class="product-image-placeholder">

                        ${
                            imageUrl
                            ? `
                                <img
                                    src="${imageUrl}"
                                    alt="${product.name}"
                                    class="featured-product-image"
                                    onerror="
                                        this.style.display='none';
                                        this.nextElementSibling.style.display='block';
                                    "
                                >

                                <span style="display:none">
                                    ${emoji}
                                </span>
                            `
                            : `
                                <span>${emoji}</span>
                            `
                        }

                    </div>

                    <div class="card-body">

                        <h5>${product.name}</h5>

                        <p class="price">
                            ₹${Number(product.price).toLocaleString("en-IN")}
                        </p>

                        <p class="text-muted">
                            ${product.quantity > 0 ? "In Stock" : "Out of Stock"}
                        </p>

                        <a href="pages/products.html" class="btn btn-primary">
                            View Products
                        </a>

                    </div>

                </div>

            `;

            featuredProducts.appendChild(productCard);

        });

    }
    catch (error) {

        console.error("Error fetching products:", error);

        featuredProducts.innerHTML = `
            <div class="col-12 text-center">
                <p class="text-danger">
                    Unable to load products. Please try again later.
                </p>
            </div>
        `;

    }
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
// PAGE LOAD
// =================================

document.addEventListener("DOMContentLoaded", () => {

    getFeaturedProducts();

    updateCartCount();

});