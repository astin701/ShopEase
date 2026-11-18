// =================================
// API URLS
// =================================

const WISHLIST_API_URL = "/api/wishlist";
const CART_API_URL = "/api/cart";


// =================================
// USER AUTHENTICATION
// =================================

const userId = localStorage.getItem("userId");
const token = localStorage.getItem("token");


// =================================
// HTML ELEMENTS
// =================================

const wishlistContainer = document.getElementById("wishlist-container");
const wishlistCount = document.getElementById("wishlist-count");
const emptyWishlist = document.getElementById("empty-wishlist");
const wishlistLoading = document.getElementById("wishlist-loading");
const wishlistError = document.getElementById("wishlist-error");


// =================================
// CHECK LOGIN
// =================================

function checkLogin() {

    if (!userId || !token) {

        alert("Please login to view your wishlist.");

        window.location.href = "login.html";

        return false;
    }

    return true;
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

async function wishlistRequest(url, options = {}) {

    const response = await fetch(url, {

        ...options,

        headers: {

            "Authorization": `Bearer ${token}`,

            "Content-Type": "application/json",

            ...options.headers

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
                : data?.message || "Something went wrong."
        );
    }

    return data;
}


// =================================
// GET WISHLIST
// =================================

async function getWishlist() {

    if (!checkLogin()) {
        return;
    }

    try {

        wishlistLoading.classList.remove("d-none");
        wishlistError.classList.add("d-none");
        emptyWishlist.classList.add("d-none");

        const wishlist = await wishlistRequest(
            `${WISHLIST_API_URL}/${userId}`
        );

        wishlistLoading.classList.add("d-none");

        displayWishlist(wishlist);

    } catch (error) {

        wishlistLoading.classList.add("d-none");

        wishlistError.textContent = error.message;
        wishlistError.classList.remove("d-none");

        console.error("Wishlist Error:", error);

    }

}


// =================================
// DISPLAY WISHLIST
// =================================

function displayWishlist(wishlist) {

    wishlistContainer.innerHTML = "";

    wishlistCount.textContent = wishlist.length;

    if (!wishlist || wishlist.length === 0) {

        emptyWishlist.classList.remove("d-none");

        return;
    }

    emptyWishlist.classList.add("d-none");

    wishlist.forEach(item => {

        const imageUrl = getProductImageUrl(item.imageUrl);

        const imageContent = imageUrl
            ? `<img
                    src="${imageUrl}"
                    alt="${item.productName}"
                    class="wishlist-product-image"
                    onerror="this.outerHTML='🛍️'">
                `
            : "🛍️";

        const wishlistCard = document.createElement("div");

        wishlistCard.className = "col-lg-3 col-md-4 col-sm-6";

        wishlistCard.innerHTML = `

            <div class="wishlist-card">

                <div class="wishlist-image">
                    ${imageContent}
                </div>

                <div class="wishlist-details">

                    <h5>${item.productName}</h5>

                    <p class="wishlist-price">
                        ₹${Number(item.price).toFixed(2)}
                    </p>

                    <div class="wishlist-buttons">

                        <a href="product-details.html?id=${item.productId}"
                           class="btn btn-warning">
                            View Product
                        </a>

                        <button class="btn btn-outline-danger"
                                onclick="removeFromWishlist(${item.wishlistId})">

                            ❤️ Remove

                        </button>

                    </div>

                </div>

            </div>

        `;

        wishlistContainer.appendChild(wishlistCard);

    });

}


// =================================
// REMOVE FROM WISHLIST
// =================================

async function removeFromWishlist(wishlistId) {

    const confirmRemove = confirm(
        "Are you sure you want to remove this product from your wishlist?"
    );

    if (!confirmRemove) {
        return;
    }

    try {

        await wishlistRequest(
            `${WISHLIST_API_URL}/remove/${userId}/${wishlistId}`,
            {
                method: "DELETE"
            }
        );

        alert("Product removed from wishlist successfully!");

        getWishlist();

    } catch (error) {

        alert(error.message);

        console.error("Remove Wishlist Error:", error);

    }

}


// =================================
// CART COUNT
// =================================

async function updateCartCount() {

    const cartCountElement = document.getElementById("cart-count");

    if (!cartCountElement) {
        return;
    }

    if (!userId || !token) {

        cartCountElement.textContent = "0";

        return;
    }

    try {

        const cart = await wishlistRequest(
            `${CART_API_URL}/${userId}`
        );

        const totalQuantity = cart.reduce(
            (total, item) => total + item.quantity,
            0
        );

        cartCountElement.textContent = totalQuantity;

    } catch (error) {

        cartCountElement.textContent = "0";

        console.error("Cart Count Error:", error);

    }

}


// =================================
// PAGE INITIALIZATION
// =================================

document.addEventListener("DOMContentLoaded", function () {

    getWishlist();

    updateCartCount();

});