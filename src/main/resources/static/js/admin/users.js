(() => {
// ========================================
// API CONFIGURATION
// ========================================

const API_URL = "/api/admin/users";

const token = localStorage.getItem("token");
const userRole = localStorage.getItem("userRole");

let allUsers = [];
let currentAdminEmail = "";


// ========================================
// ADMIN AUTHENTICATION
// ========================================

if (!token || userRole !== "ROLE_ADMIN") {

    window.location.href = "../login.html";

}


// ========================================
// GET CURRENT ADMIN EMAIL
// ========================================

function getAdminEmail() {

    try {

        const payload = token.split(".")[1];

        const base64 = payload
            .replace(/-/g, "+")
            .replace(/_/g, "/");

        const paddedBase64 = base64.padEnd(
            Math.ceil(base64.length / 4) * 4,
            "="
        );

        const decoded = JSON.parse(atob(paddedBase64));

        return decoded.sub || "";

    } catch (error) {

        console.error("JWT decoding error:", error);

        return "";

    }

}

currentAdminEmail = getAdminEmail();


// ========================================
// API REQUEST
// ========================================

async function apiRequest(url, options = {}) {

    const response = await fetch(url, {

        ...options,

        headers: {

            "Authorization": `Bearer ${token}`,

            ...(options.headers || {})

        }

    });

    const responseText = await response.text();

    let data = responseText;

    try {

        data = responseText ? JSON.parse(responseText) : null;

    } catch (error) {

        // Response is plain text.

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


// ========================================
// LOAD USERS
// ========================================

async function loadUsers() {

    const refreshButton = document.getElementById(
        "refresh-users-btn"
    );

    try {

        refreshButton.disabled = true;

        refreshButton.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2"></span>
            Loading...
        `;

        const response = await apiRequest(API_URL);

        allUsers = Array.isArray(response)
            ? response
            : response?.data || response?.users || [];

        displayUsers(allUsers);

        updateUserStatistics(allUsers);

    } catch (error) {

        console.error("Unable to load users:", error);

        showToast(error.message, "danger");

    } finally {

        refreshButton.disabled = false;

        refreshButton.innerHTML = `
            <i class="bi bi-arrow-clockwise"></i>
            Refresh
        `;

    }

}


// ========================================
// DISPLAY USERS
// ========================================

function displayUsers(users) {

    const tableBody = document.getElementById(
        "users-table-body"
    );

    const emptyUsers = document.getElementById(
        "empty-users"
    );

    const usersCount = document.getElementById(
        "users-count"
    );

    tableBody.innerHTML = "";

    usersCount.textContent =
        `${users.length} ${users.length === 1 ? "user" : "users"}`;

    if (users.length === 0) {

        emptyUsers.classList.remove("d-none");

        return;

    }

    emptyUsers.classList.add("d-none");

    users.forEach(user => {

        const isActive = user.enabled === true;

        const isAdmin = user.role === "ROLE_ADMIN";

        const isCurrentAdmin =
            user.email?.toLowerCase() ===
            currentAdminEmail.toLowerCase();

        const statusClass = isActive
            ? "user-active"
            : "user-inactive";

        const statusText = isActive
            ? "Active"
            : "Inactive";

        const roleClass = isAdmin
            ? "role-admin"
            : "role-user";

        const initials = getInitials(user.name);

        const joinedDate = formatDate(user.createdAt);

        const actionText = isActive
            ? "Deactivate"
            : "Activate";

        const actionClass = isActive
            ? "btn-outline-danger"
            : "btn-outline-success";

        const actionButton = isCurrentAdmin

            ? `
                <button
                    type="button"
                    class="btn btn-sm btn-secondary"
                    disabled>

                    Current Admin

                </button>
            `

            : `
                <button
                    type="button"
                    class="btn btn-sm ${actionClass} toggle-user-btn"
                    data-id="${user.id}"
                    data-enabled="${!isActive}">

                    ${actionText}

                </button>
            `;

        const row = document.createElement("tr");

        row.innerHTML = `

            <td>${user.id}</td>

            <td>

                <div class="user-name-cell">

                    <div class="user-avatar">

                        ${escapeHTML(initials)}

                    </div>

                    <span>
                        ${escapeHTML(user.name)}
                    </span>

                </div>

            </td>

            <td>
                ${escapeHTML(user.email)}
            </td>

            <td>
                ${escapeHTML(user.phoneNumber || "N/A")}
            </td>

            <td>

                <span class="user-role-badge ${roleClass}">

                    ${isAdmin ? "Admin" : "User"}

                </span>

            </td>

            <td>

                <span class="user-status-badge ${statusClass}">

                    ${statusText}

                </span>

            </td>

            <td>
                ${joinedDate}
            </td>

            <td>

                <div class="user-actions">

                    <button
                        type="button"
                        class="btn btn-sm btn-outline-primary view-user-btn"
                        data-id="${user.id}"
                        title="View User">

                        <i class="bi bi-eye"></i>

                    </button>

                    ${actionButton}

                </div>

            </td>

        `;

        tableBody.appendChild(row);

    });

}


// ========================================
// USER STATISTICS
// ========================================

function updateUserStatistics(users) {

    const totalUsers = users.length;

    const activeUsers = users.filter(
        user => user.enabled === true
    ).length;

    const inactiveUsers = users.filter(
        user => user.enabled === false
    ).length;

    document.getElementById("total-users").textContent =
        totalUsers;

    document.getElementById("active-users").textContent =
        activeUsers;

    document.getElementById("inactive-users").textContent =
        inactiveUsers;

}


// ========================================
// SEARCH AND FILTER
// ========================================

function filterUsers() {

    const searchValue = document
        .getElementById("user-search")
        .value
        .toLowerCase()
        .trim();

    const statusValue = document
        .getElementById("user-status-filter")
        .value;

    const filteredUsers = allUsers.filter(user => {

        const matchesSearch =

            user.name?.toLowerCase().includes(searchValue) ||

            user.email?.toLowerCase().includes(searchValue) ||

            user.phoneNumber?.toLowerCase().includes(searchValue);

        let matchesStatus = true;

        if (statusValue === "ACTIVE") {

            matchesStatus = user.enabled === true;

        }

        if (statusValue === "INACTIVE") {

            matchesStatus = user.enabled === false;

        }

        return matchesSearch && matchesStatus;

    });

    displayUsers(filteredUsers);

}


// ========================================
// ACTIVATE / DEACTIVATE USER
// ========================================

async function updateUserStatus(userId, enabled) {

    const action = enabled
        ? "activate"
        : "deactivate";

    const confirmed = confirm(
        `Are you sure you want to ${action} this user account?`
    );

    if (!confirmed) return;

    try {

        const response = await apiRequest(

            `${API_URL}/${userId}/status?enabled=${enabled}`,

            {
                method: "PUT"
            }

        );

        showToast(

            typeof response === "string"
                ? response
                : "User status updated successfully.",

            "success"

        );

        await loadUsers();

        // Reapply current search and filter.

        filterUsers();

    } catch (error) {

        console.error("User status update error:", error);

        showToast(error.message, "danger");

    }

}


// ========================================
// VIEW USER DETAILS
// ========================================

function viewUserDetails(userId) {

    const user = allUsers.find(
        user => user.id === Number(userId)
    );

    if (!user) return;

    const status = user.enabled
        ? "Active"
        : "Inactive";

    const role = user.role === "ROLE_ADMIN"
        ? "Admin"
        : "User";

    alert(

        `USER DETAILS\n\n` +

        `ID: ${user.id}\n` +

        `Name: ${user.name}\n` +

        `Email: ${user.email}\n` +

        `Phone: ${user.phoneNumber || "N/A"}\n` +

        `Role: ${role}\n` +

        `Status: ${status}\n` +

        `Joined: ${formatDate(user.createdAt)}`

    );

}


// ========================================
// TOAST NOTIFICATION
// ========================================

function showToast(message, type = "success") {

    let toastContainer = document.getElementById(
        "dynamic-toast-container"
    );

    if (!toastContainer) {

        toastContainer = document.createElement("div");

        toastContainer.id = "dynamic-toast-container";

        toastContainer.className =
            "toast-container position-fixed top-0 end-0 p-3";

        toastContainer.style.zIndex = "1100";

        document.body.appendChild(toastContainer);

    }

    const toastElement = document.createElement("div");

    const backgroundClass = type === "success"
        ? "text-bg-success"
        : "text-bg-danger";

    toastElement.className =
        `toast align-items-center ${backgroundClass} border-0`;

    toastElement.setAttribute("role", "alert");

    toastElement.setAttribute("aria-live", "assertive");

    toastElement.setAttribute("aria-atomic", "true");

    toastElement.innerHTML = `

        <div class="d-flex">

            <div class="toast-body"></div>

            <button
                type="button"
                class="btn-close btn-close-white me-2 m-auto"
                data-bs-dismiss="toast">

            </button>

        </div>

    `;

    toastElement.querySelector(".toast-body").textContent =
        message;

    toastContainer.appendChild(toastElement);

    const toast = new bootstrap.Toast(toastElement, {
        delay: 3000
    });

    toastElement.addEventListener("hidden.bs.toast", () => {

        toastElement.remove();

    });

    toast.show();

}


// ========================================
// HELPER FUNCTIONS
// ========================================

function getInitials(name) {

    if (!name) return "U";

    return name
        .trim()
        .split(/\s+/)
        .map(word => word.charAt(0))
        .slice(0, 2)
        .join("")
        .toUpperCase();

}


function formatDate(dateValue) {

    if (!dateValue) return "N/A";

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) return "N/A";

    return date.toLocaleDateString("en-IN", {

        day: "2-digit",

        month: "short",

        year: "numeric"

    });

}


function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, char => {

        const entities = {

            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"

        };

        return entities[char];

    });

}


// ========================================
// EVENT LISTENERS
// ========================================


// Refresh users

document
    .getElementById("refresh-users-btn")
    .addEventListener("click", loadUsers);


// Search users

document
    .getElementById("user-search")
    .addEventListener("input", filterUsers);


// Filter users

document
    .getElementById("user-status-filter")
    .addEventListener("change", filterUsers);


// User table actions

document
    .getElementById("users-table-body")
    .addEventListener("click", function (event) {

        const viewButton = event.target.closest(
            ".view-user-btn"
        );

        const toggleButton = event.target.closest(
            ".toggle-user-btn"
        );


        // View user details

        if (viewButton) {

            const userId = viewButton.dataset.id;

            viewUserDetails(userId);

        }


        // Activate or deactivate user

        if (toggleButton) {

            const userId = toggleButton.dataset.id;

            const enabled =
                toggleButton.dataset.enabled === "true";

            updateUserStatus(userId, enabled);

        }

    });


// ========================================
// INITIALIZE PAGE
// ========================================

loadUsers();

})();