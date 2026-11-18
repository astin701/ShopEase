// =================================
// CHECK LOGIN STATUS
// =================================

document.addEventListener("DOMContentLoaded", function () {

    const token = localStorage.getItem("token");
    const userName = localStorage.getItem("userName");

    const authLinks = document.getElementById("auth-links");
    const registerLink = document.getElementById("register-link");

    const userMenu = document.getElementById("user-menu");
    const welcomeUser = document.getElementById("welcome-user");

    const ordersLink = document.getElementById("orders-link");
    const logoutLink = document.getElementById("logout-link");


    if (token) {

        // Hide Login and Register

        if (authLinks) authLinks.classList.add("d-none");
        if (registerLink) registerLink.classList.add("d-none");

        // Show User Information

        if (userMenu) userMenu.classList.remove("d-none");

        if (welcomeUser) {
            welcomeUser.textContent = `Welcome, ${userName || "User"}`;
        }

        // Show Orders and Logout

        if (ordersLink) ordersLink.classList.remove("d-none");
        if (logoutLink) logoutLink.classList.remove("d-none");

    }

    updateNavbarWishlistCount();

});


// =================================
// UPDATE NAVBAR WISHLIST COUNT
// =================================

async function updateNavbarWishlistCount() {

    const wishlistCount = document.getElementById("wishlist-nav-count");

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!wishlistCount) return;

    if (!userId || !token) {

        wishlistCount.textContent = "0";

        return;
    }

    try {

        const response = await fetch(`/api/wishlist/${userId}`, {

            headers: {
                "Authorization": `Bearer ${token}`
            }

        });

        if (!response.ok) {
            wishlistCount.textContent = "0";
            return;
        }

        const wishlist = await response.json();

        wishlistCount.textContent = wishlist.length;

    }

    catch (error) {

        console.error("Wishlist count error:", error);

        wishlistCount.textContent = "0";

    }

}


// =================================
// LOGOUT USER
// =================================

function logoutUser() {

    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("token");

    window.location.href = "/index.html";

}