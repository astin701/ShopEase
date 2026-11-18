// =================================
// API URL
// =================================

const API_URL = "/api/cart";


// =================================
// HTML ELEMENTS
// =================================

const cartContainer = document.getElementById("cart-container");
const cartCount = document.getElementById("cart-count");
const cartSubtotal = document.getElementById("cart-subtotal");
const cartShipping = document.getElementById("cart-shipping");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");


// =================================
// USER INFORMATION
// =================================

const userId = localStorage.getItem("userId");
const token = localStorage.getItem("token");


// =================================
// CART ARRAY
// =================================

let cartItems = [];


// =================================
// CHECK LOGIN
// =================================

function checkLogin() {

    if (!userId || !token) {

        alert("Please login to view your cart.");

        window.location.href = "login.html";

        return false;
    }

    return true;
}


// =================================
// CURRENCY FORMAT
// =================================

function formatPrice(price) {

    return Number(price).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR"
    });
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
// API REQUEST
// =================================

async function cartRequest(url, method = "GET") {

    const response = await fetch(url, {

        method: method,

        headers: {
            "Authorization": `Bearer ${token}`
        }

    });

    const responseText = await response.text();

    let data;

    try {

        data = responseText ? JSON.parse(responseText) : null;

    } catch {

        data = responseText;

    }

    if (!response.ok) {

        throw new Error(
            typeof data === "string"
                ? data
                : data?.message || `HTTP Error: ${response.status}`
        );
    }

    return data;
}


// =================================
// GET CART
// =================================

async function getCart() {

    console.log("GET CART FUNCTION CALLED");

    if (!checkLogin()) return;

    try {

        cartContainer.innerHTML = `
            <div class="text-center py-5">
                Loading your cart...
            </div>
        `;

        const data = await cartRequest(`${API_URL}/${userId}`);

        cartItems = Array.isArray(data) ? data : [];

        displayCart();

        updateCartCount();

        updateCartSummary();

    }

    catch (error) {

        console.error("Get Cart Error:", error);

        if (error.message.toLowerCase().includes("cart not found")) {

            cartItems = [];

            displayCart();

            updateCartCount();

            updateCartSummary();

        } else {

            cartContainer.innerHTML = `
                <div class="alert alert-danger">
                    Unable to load your cart.
                    <p class="mb-0">${error.message}</p>
                </div>
            `;

            cartItems = [];

            updateCartCount();

            updateCartSummary();
        }
    }
}


// =================================
// DISPLAY CART
// =================================

function displayCart() {

    cartContainer.innerHTML = "";

    if (cartItems.length === 0) {

        cartContainer.innerHTML = `
            <div class="empty-cart">

                <span>🛒</span>

                <h4>Your Cart is Empty</h4>

                <p>You haven't added any products yet.</p>

                <a href="products.html" class="btn checkout-btn mt-3">
                    Start Shopping
                </a>

            </div>
        `;

        return;
    }


    // Check unavailable products

    const hasUnavailableProducts = cartItems.some(
        item => item.available === false
    );


    if (hasUnavailableProducts) {

        cartContainer.innerHTML += `
            <div class="alert alert-warning mb-4">

                <strong>⚠️ Some products are unavailable.</strong>

                <p class="mb-0">
                    Please remove unavailable products before checkout.
                </p>

            </div>
        `;
    }


    cartItems.forEach(item => {

        const cartItem = document.createElement("div");

        cartItem.className = "cart-item";

        const isAvailable = item.available === true;


        // Product image

        const imageUrl = getProductImageUrl(item.imageUrl);

        const imageContent = imageUrl
            ? `<img src="${imageUrl}"
                    alt="${item.productName}"
                    class="cart-product-image"
                    onerror="this.outerHTML='<div class=\\'cart-product-image\\'>🛍️</div>'">`
            : `<div class="cart-product-image">🛍️</div>`;


        cartItem.innerHTML = `

            ${imageContent}

            <div class="cart-product-details">

                <h5>${item.productName}</h5>

                ${
                    isAvailable
                    ? `<span class="badge bg-success mb-2">Available</span>`
                    : `<span class="badge bg-danger mb-2">Unavailable</span>`
                }

                <p class="cart-product-price">
                    ${formatPrice(item.price)}
                </p>

                <p class="mb-1">
                    Subtotal: ${formatPrice(item.subtotal)}
                </p>

                ${
                    isAvailable
                    ? `
                        <div class="quantity-controls">

                            <button type="button" class="quantity-btn"
                                onclick="changeQuantity(${item.cartItemId}, ${item.quantity - 1})"
                                ${item.quantity <= 1 ? "disabled" : ""}>
                                -
                            </button>

                            <span class="quantity-value">
                                ${item.quantity}
                            </span>

                            <button type="button" class="quantity-btn"
                                onclick="changeQuantity(${item.cartItemId}, ${item.quantity + 1})">
                                +
                            </button>

                        </div>
                    `
                    : `
                        <p class="text-danger small mb-2">
                            This product is no longer available.
                        </p>
                    `
                }

                <button class="remove-btn mt-2"
                    onclick="removeCartItem(${item.cartItemId})">

                    🗑 Remove

                </button>

            </div>

        `;

        cartContainer.appendChild(cartItem);

    });

}


// =================================
// UPDATE CART QUANTITY
// =================================

async function changeQuantity(cartItemId, quantity) {

    console.log("CHANGE QUANTITY FUNCTION CALLED");

    if (quantity < 1) return;

    try {

        const url = `${API_URL}/update/${userId}/${cartItemId}/${quantity}`;

        await cartRequest(url, "PUT");

        await getCart();

    }

    catch (error) {

        console.error("Update Cart Error:", error);

        showCartToast(error.message);
    }
}


// =================================
// REMOVE CART ITEM
// =================================

async function removeCartItem(cartItemId) {

    const confirmation = confirm(
        "Are you sure you want to remove this product?"
    );

    if (!confirmation) return;

    try {

        const url = `${API_URL}/remove/${userId}/${cartItemId}`;

        await cartRequest(url, "DELETE");

        await getCart();

    }

    catch (error) {

        console.error("Remove Cart Error:", error);

        alert(error.message);
    }
}


// =================================
// UPDATE CART COUNT
// =================================

function updateCartCount() {

    let totalItems = 0;

    cartItems.forEach(item => {

        totalItems += Number(item.quantity) || 0;

    });

    if (cartCount) {

        cartCount.textContent = totalItems;

    }
}


// =================================
// UPDATE CART SUMMARY
// =================================

function updateCartSummary() {

    let subtotal = 0;

    cartItems.forEach(item => {

        if (item.available === true) {

            subtotal += Number(item.subtotal) || 0;

        }

    });

    const shipping = 0;

    const total = subtotal + shipping;

    cartSubtotal.textContent = formatPrice(subtotal);

    cartShipping.textContent = formatPrice(shipping);

    cartTotal.textContent = formatPrice(total);


    // Disable checkout if any product is unavailable

    const hasUnavailableProducts = cartItems.some(
        item => item.available === false
    );

    if (checkoutBtn) {

        checkoutBtn.disabled =
            cartItems.length === 0 || hasUnavailableProducts;

    }
}


// =================================
// CHECKOUT BUTTON
// =================================

checkoutBtn.addEventListener("click", function () {

    if (cartItems.length === 0) {

        alert("Your cart is empty.");

        return;
    }

    const hasUnavailableProducts = cartItems.some(
        item => item.available === false
    );

    if (hasUnavailableProducts) {

        alert("Please remove unavailable products before checkout.");

        return;
    }

    window.location.href = "checkout.html";

});


// =================================
// PAGE LOAD
// =================================

document.addEventListener("DOMContentLoaded", function () {

    getCart();

});


function showCartToast(message) {

    const toastElement = document.getElementById("cart-toast");

    const toastMessage = document.getElementById("cart-toast-message");

    toastMessage.textContent = message;

    const toast = bootstrap.Toast.getOrCreateInstance(toastElement, {
        delay: 3000
    });

    toast.show();
}