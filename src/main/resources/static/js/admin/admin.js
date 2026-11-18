// =================================
// ADMIN AUTHENTICATION
// =================================

const token = localStorage.getItem("token");
const userRole = localStorage.getItem("userRole");

// Check whether the user is logged in
if (!token) {
    window.location.href = "../pages/login.html";
}

// Check whether the logged-in user is an admin
else if (userRole !== "ROLE_ADMIN") {
    alert("Access denied! Admins only.");
    window.location.href = "../index.html";
}


// =================================
// DISPLAY ADMIN NAME
// =================================

const adminName = document.getElementById("admin-name");

if (adminName) {
    adminName.textContent = localStorage.getItem("userName") || "Administrator";
}


// =================================
// SIDEBAR TOGGLE
// =================================

const sidebar = document.querySelector(".admin-sidebar");
const sidebarToggle = document.getElementById("sidebar-toggle");

if (sidebar && sidebarToggle) {

    sidebarToggle.addEventListener("click", function () {

        sidebar.classList.toggle("active");

    });

}


// =================================
// CLOSE SIDEBAR WHEN CLICKING OUTSIDE
// =================================

document.addEventListener("click", function (event) {

    if (
        window.innerWidth <= 991 &&
        sidebar &&
        sidebarToggle &&
        sidebar.classList.contains("active") &&
        !sidebar.contains(event.target) &&
        !sidebarToggle.contains(event.target)
    ) {

        sidebar.classList.remove("active");

    }

});


// =================================
// ADMIN LOGOUT
// =================================

const logoutButton = document.getElementById("admin-logout-btn");

if (logoutButton) {

    logoutButton.addEventListener("click", function () {

        const confirmLogout = confirm("Are you sure you want to logout?");

        if (confirmLogout) {

            localStorage.removeItem("userId");
            localStorage.removeItem("userName");
            localStorage.removeItem("userEmail");
            localStorage.removeItem("token");
            localStorage.removeItem("userRole");
            localStorage.removeItem("cart");

            window.location.href = "../pages/login.html";

        }

    });

}