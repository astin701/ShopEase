// =================================
// API URLs
// =================================

const API_URL = "/api/products";
const CART_API_URL = "/api/cart";
const WISHLIST_API_URL = "/api/wishlist";


// =================================
// HTML Elements
// =================================

const productDetails = document.getElementById("product-details");
const cartCount = document.getElementById("cart-count");


// =================================
// User Authentication
// =================================

const userId = localStorage.getItem("userId");
const token = localStorage.getItem("token");


// =================================
// Get Product ID from URL
// =================================

const urlParams = new URLSearchParams(window.location.search);

const productId = urlParams.get("id");


// =================================
// Escape HTML
// =================================

function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, character => {

        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];

    });

}


// =================================
// Get API Error Message
// =================================

async function getErrorMessage(response) {

    const responseText = await response.text();

    if (!responseText) {
        return `HTTP Error: ${response.status}`;
    }

    try {

        const errorData = JSON.parse(responseText);

        return errorData.message ||
            errorData.error ||
            `HTTP Error: ${response.status}`;

    }

    catch {

        return responseText;

    }

}


// =================================
// Get Product Emoji
// =================================

function getProductEmoji(product) {

    const category = product.category?.name?.toLowerCase() || "";

    if (category.includes("electronic")) {
        return "🎧";
    }

    if (category.includes("fashion")) {
        return "👕";
    }

    if (category.includes("home")) {
        return "🏠";
    }

    if (category.includes("accessor")) {
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

    if (
        imageUrl.startsWith("http://") ||
        imageUrl.startsWith("https://") ||
        imageUrl.startsWith("/uploads/") ||
        imageUrl.startsWith("/images/")
    ) {
        return imageUrl;
    }

    return `/uploads/${encodeURIComponent(imageUrl)}`;
}


// =================================
// Fetch Product Details
// =================================

async function getProductDetails() {

    try {

        if (!productId || !/^\d+$/.test(productId)) {

            throw new Error("Invalid product ID.");

        }


        const response = await fetch(`${API_URL}/${productId}`);


        if (!response.ok) {

            throw new Error(await getErrorMessage(response));

        }


        const product = await response.json();


        displayProduct(product);

    }

    catch (error) {

        console.error("Error loading product:", error);

        productDetails.innerHTML = `
            <div class="alert alert-danger">

                Unable to load product details.

                <a href="products.html">
                    Go back to products
                </a>.

            </div>
        `;

    }

}


// =================================
// Display Product
// =================================

function displayProduct(product) {

    const emoji = getProductEmoji(product);

    const imageUrl = getProductImageUrl(product.imageUrl);

    const stockQuantity = Number(product.quantity);

    const stockAvailable = Number.isInteger(stockQuantity) &&
        stockQuantity > 0;

    const productName = escapeHTML(product.name);

    const categoryName = escapeHTML(
        product.category?.name || "General"
    );

    const description = escapeHTML(
        product.description || "Explore this amazing product."
    );

    const price = Number(product.price);

    const formattedPrice = Number.isFinite(price)
        ? price.toLocaleString("en-IN")
        : "0";


    productDetails.innerHTML = `

        <div class="details-card">

            <div class="row align-items-center g-4">

                <!-- Product Image -->

                <div class="col-lg-5">
                    <div class="details-image">
                        <img
                            src="${imageUrl || ""}"
                            alt="${productName}"
                            class="details-product-image"
                            onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
                            style="display: ${imageUrl ? "block" : "none"};"
                        >
                        <span style="display: ${imageUrl ? "none" : "block"};">
                            ${emoji}
                        </span>
                    </div>
                </div>


                <!-- Product Information -->

                <div class="col-lg-7">

                    <div class="details-info">

                        <span class="details-category">

                            ${categoryName}

                        </span>


                        <h2 class="mt-3">

                            ${productName}

                        </h2>


                        <p class="details-price">

                            ₹${formattedPrice}

                        </p>


                        <p class="details-description">

                            ${description}

                        </p>


                        <p>

                            <strong>Available Quantity:</strong>

                            ${stockQuantity}

                        </p>


                        <p class="${stockAvailable ? "stock-available" : "stock-unavailable"}">

                            ${stockAvailable ? "✓ In Stock" : "✕ Out of Stock"}

                        </p>


                        <!-- Quantity -->

                        <div class="d-flex align-items-center gap-3 mt-4">

                            <label for="quantity">

                                Quantity:

                            </label>


                            <input
                                type="number"
                                id="quantity"
                                class="quantity-input"
                                value="1"
                                min="1"
                                max="${stockQuantity}"
                                step="1"
                                ${!stockAvailable ? "disabled" : ""}
                            >

                        </div>


                        <!-- Add to Cart -->

                        <button
                            type="button"
                            class="add-cart-btn mt-4"
                            id="add-cart-btn"
                            ${!stockAvailable ? "disabled" : ""}>

                            Add to Cart

                        </button>


                        <!-- Add to Wishlist -->

                        <button
                            type="button"
                            class="btn btn-outline-danger mt-3 w-100"
                            id="add-wishlist-btn">

                            ❤️ Add to Wishlist

                        </button>


                        <!-- Cart Message -->

                        <div id="cart-message" class="mt-3"></div>


                    </div>

                </div>

            </div>

        </div>

    `;


    // =================================
    // Add Cart Event
    // =================================

    document.getElementById("add-cart-btn")
        .addEventListener("click", () => addToCart(product));


    // =================================
    // Add Wishlist Event
    // =================================

    document.getElementById("add-wishlist-btn")
        .addEventListener("click", () => addToWishlist(product));

}


// =================================
// Display Cart Message
// =================================

function showCartMessage(message, type) {

    const messageElement = document.getElementById("cart-message");

    if (!messageElement) {
        return;
    }

    const paragraph = document.createElement("p");

    paragraph.className = type === "success"
        ? "text-success"
        : "text-danger";

    paragraph.textContent = message;

    messageElement.replaceChildren(paragraph);

}


// =================================
// Add Product to Backend Cart
// =================================

async function addToCart(product) {

    const quantityInput = document.getElementById("quantity");

    const quantity = Number(quantityInput.value);

    const addCartBtn = document.getElementById("add-cart-btn");


    // =================================
    // Check Login
    // =================================

    if (!userId || !token) {

        alert("Please login before adding products to your cart.");

        window.location.href = "login.html";

        return;

    }


    // =================================
    // Validate Quantity
    // =================================

    if (

        !Number.isInteger(quantity) ||

        quantity < 1 ||

        quantity > Number(product.quantity)

    ) {

        showCartMessage(
            "Please enter a valid quantity.",
            "error"
        );

        return;

    }


    try {

        // Disable Button

        addCartBtn.disabled = true;

        addCartBtn.textContent = "Adding...";


        // =================================
        // Backend API Request
        // =================================

        const response = await fetch(

            `${CART_API_URL}/add/${userId}/${product.id}/${quantity}`,

            {

                method: "POST",

                headers: {

                    "Authorization": `Bearer ${token}`

                }

            }

        );


        if (!response.ok) {

            throw new Error(await getErrorMessage(response));

        }


        // =================================
        // Update Cart Count
        // =================================

        await updateCartCount();


        // =================================
        // Success Message
        // =================================

        showCartMessage(
            "✓ Product added to cart successfully!",
            "success"
        );


    }

    catch (error) {

        console.error("Error adding product to cart:", error);

        showCartMessage(error.message, "error");

    }

    finally {

        addCartBtn.disabled = false;

        addCartBtn.textContent = "Add to Cart";

    }

}


// =================================
// ADD PRODUCT TO WISHLIST
// =================================

async function addToWishlist(product) {


    // =================================
    // Check Login
    // =================================

    if (!userId || !token) {

        alert("Please login before adding products to your wishlist.");

        window.location.href = "login.html";

        return;

    }


    const wishlistBtn = document.getElementById("add-wishlist-btn");


    try {

        // Disable Button

        wishlistBtn.disabled = true;

        wishlistBtn.textContent = "Adding...";


        // =================================
        // Backend API Request
        // =================================

        const response = await fetch(

            `${WISHLIST_API_URL}/add/${userId}/${product.id}`,

            {

                method: "POST",

                headers: {

                    "Authorization": `Bearer ${token}`

                }

            }

        );


        if (!response.ok) {

            throw new Error(await getErrorMessage(response));

        }


        // =================================
        // Update Navbar Wishlist Count
        // =================================

        if (typeof updateNavbarWishlistCount === "function") {

            await updateNavbarWishlistCount();

        }


        // =================================
        // Success Message
        // =================================

        alert("❤️ Product added to wishlist successfully!");


    }

    catch (error) {

        console.error("Wishlist Error:", error);

        alert(error.message);

    }

    finally {

        wishlistBtn.disabled = false;

        wishlistBtn.textContent = "❤️ Add to Wishlist";

    }

}


// =================================
// Update Cart Count from Database
// =================================

async function updateCartCount() {


    // =================================
    // Check Login
    // =================================

    if (!userId || !token) {

        if (cartCount) {

            cartCount.textContent = "0";

        }

        return;

    }


    try {

        const response = await fetch(

            `${CART_API_URL}/${userId}`,

            {

                headers: {

                    "Authorization": `Bearer ${token}`

                }

            }

        );


        if (!response.ok) {

            if (cartCount) {

                cartCount.textContent = "0";

            }

            return;

        }


        const cartItems = await response.json();


        // =================================
        // Calculate Total Cart Quantity
        // =================================

        const totalItems = cartItems.reduce(

            (total, item) => {

                return total + Number(item.quantity || 0);

            },

            0

        );


        // =================================
        // Update Navbar
        // =================================

        if (cartCount) {

            cartCount.textContent = totalItems;

        }

    }

    catch (error) {

        console.error("Error updating cart count:", error);

    }

}


// =================================
// PAGE LOAD
// =================================

document.addEventListener("DOMContentLoaded", () => {

    getProductDetails();

    updateCartCount();

});