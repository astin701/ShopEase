// =================================
// API URL
// =================================

const ORDER_API_URL = "/api/orders";


// =================================
// USER AUTHENTICATION
// =================================

const token = localStorage.getItem("token");


// =================================
// HTML ELEMENTS
// =================================

const ordersLoading = document.getElementById("orders-loading");
const ordersContainer = document.getElementById("orders-container");
const emptyOrders = document.getElementById("empty-orders");

const ordersMessage = document.getElementById("orders-message");

const orderDetailsContent = document.getElementById(
    "order-details-content"
);


// =================================
// COMMON FUNCTIONS
// =================================

function formatPrice(price) {

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR"
    }).format(price);

}


function formatDate(date) {

    if (!date) {
        return "Date unavailable";
    }

    const formattedDate = new Date(date);

    if (isNaN(formattedDate.getTime())) {
        return "Date unavailable";
    }

    return formattedDate.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });

}


// =================================
// PRODUCT IMAGE URL
// =================================

function getProductImageUrl(imageUrl) {

    if (!imageUrl) {
        return null;
    }

    if (
        imageUrl.startsWith("/uploads/") ||
        imageUrl.startsWith("/images/") ||
        imageUrl.startsWith("http://") ||
        imageUrl.startsWith("https://")
    ) {
        return imageUrl;
    }

    return `/uploads/${encodeURIComponent(imageUrl)}`;

}


// =================================
// ESCAPE HTML
// =================================

function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, character => {

        const characters = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return characters[character];

    });

}


// =================================
// SHOW MESSAGE
// =================================

function showMessage(message, type) {

    ordersMessage.innerHTML = `
        <div class="alert alert-${type}">
            ${escapeHTML(message)}
        </div>
    `;

}


// =================================
// GET ERROR MESSAGE
// =================================

async function getErrorMessage(response) {

    const responseText = await response.text();

    if (!responseText) {
        return "Something went wrong.";
    }

    try {

        const data = JSON.parse(responseText);

        return data.message || data.error || "Something went wrong.";

    } catch {

        return responseText;

    }

}


// =================================
// CHECK LOGIN
// =================================

function checkLogin() {

    if (!token) {

        window.location.href = "login.html";

        return false;

    }

    return true;

}


// =================================
// LOAD USER ORDERS
// =================================

async function loadOrders() {

    ordersLoading.classList.remove("d-none");

    ordersContainer.innerHTML = "";

    emptyOrders.classList.add("d-none");

    ordersMessage.innerHTML = "";

    try {

        const response = await fetch(
            `${ORDER_API_URL}/user`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        if (!response.ok) {

            throw new Error(await getErrorMessage(response));

        }


        const orders = await response.json();

        if (!Array.isArray(orders) || orders.length === 0) {

            emptyOrders.classList.remove("d-none");

            return;

        }


        displayOrders(orders);

    } catch (error) {

        showMessage(error.message, "danger");

    } finally {

        ordersLoading.classList.add("d-none");

    }

}


// =================================
// DISPLAY ORDERS
// =================================

function displayOrders(orders) {

    ordersContainer.innerHTML = "";

    orders.forEach(order => {

        const orderCard = document.createElement("div");

        orderCard.className = "order-card";


        const orderStatus = String(order.status || "PENDING").toUpperCase();

        const statusClass = orderStatus.toLowerCase();


        // Cancel button only for PENDING orders

        const cancelButton = orderStatus === "PENDING"
            ? `
                <button
                    type="button"
                    class="cancel-order-btn"
                    data-order-id="${Number(order.orderId)}">

                    Cancel Order

                </button>
            `
            : "";


        orderCard.innerHTML = `

            <div class="order-card-header">

                <div>

                    <span class="order-label">Order ID</span>

                    <h5>#${escapeHTML(order.orderId)}</h5>

                </div>

                <span class="order-status ${statusClass}">
                    ${escapeHTML(orderStatus)}
                </span>

            </div>


            <div class="order-card-body">

                <div class="order-info">

                    <span>Order Date</span>

                    <strong>
                        ${formatDate(order.createdAt)}
                    </strong>

                </div>


                <div class="order-info">

                    <span>Total Amount</span>

                    <strong class="order-total">
                        ${formatPrice(order.totalAmount)}
                    </strong>

                </div>

            </div>


            <div class="order-card-footer">

                <button
                    type="button"
                    class="view-order-btn"
                    data-order-id="${Number(order.orderId)}">

                    View Details

                </button>

                ${cancelButton}

            </div>

        `;


        // View Details

        const viewButton = orderCard.querySelector(".view-order-btn");

        viewButton.addEventListener("click", function () {

            viewOrderDetails(Number(this.dataset.orderId));

        });


        // Cancel Order

        const cancelButtonElement = orderCard.querySelector(
            ".cancel-order-btn"
        );

        if (cancelButtonElement) {

            cancelButtonElement.addEventListener("click", function () {

                cancelOrder(Number(this.dataset.orderId), this);

            });

        }


        ordersContainer.appendChild(orderCard);

    });

}


// =================================
// CANCEL ORDER
// =================================

async function cancelOrder(orderId, button) {

    const confirmCancel = confirm(
        `Are you sure you want to cancel Order #${orderId}?`
    );

    if (!confirmCancel) {
        return;
    }


    try {

        button.disabled = true;

        button.textContent = "Cancelling...";


        const response = await fetch(
            `${ORDER_API_URL}/cancel/${orderId}`,
            {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        if (!response.ok) {

            throw new Error(await getErrorMessage(response));

        }


        const message = await response.text();

        alert(message || "Order cancelled successfully!");


        // Refresh order history

        await loadOrders();

    } catch (error) {

        alert(error.message);

        button.disabled = false;

        button.textContent = "Cancel Order";

    }

}


// =================================
// VIEW ORDER DETAILS
// =================================

async function viewOrderDetails(orderId) {

    orderDetailsContent.innerHTML = `

        <div class="text-center py-4">

            <div class="spinner-border text-warning"></div>

            <p class="mt-2">Loading order details...</p>

        </div>

    `;


    const modalElement = document.getElementById("orderDetailsModal");

    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

    modal.show();


    try {

        const response = await fetch(
            `${ORDER_API_URL}/${orderId}`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        if (!response.ok) {

            throw new Error(await getErrorMessage(response));

        }


        const order = await response.json();

        displayOrderDetails(order);

    } catch (error) {

        orderDetailsContent.innerHTML = `
            <div class="alert alert-danger">
                ${escapeHTML(error.message)}
            </div>
        `;

    }

}


// =================================
// DISPLAY ORDER DETAILS
// =================================

function displayOrderDetails(order) {

    const items = Array.isArray(order.items) ? order.items : [];

    let itemsHTML = "";


    if (items.length === 0) {

        itemsHTML = `
            <div class="alert alert-info">
                No products found for this order.
            </div>
        `;

    } else {

        itemsHTML = items.map(item => {

            const imageUrl = getProductImageUrl(item.imageUrl);


            const imageHTML = imageUrl
                ? `
                    <img
                        src="${escapeHTML(imageUrl)}"
                        alt="${escapeHTML(item.productName)}"
                        class="order-product-image"
                        onerror="this.outerHTML='<div class=&quot;order-product-image order-image-placeholder&quot;>🛍️</div>'"
                    >
                `
                : `
                    <div class="order-product-image order-image-placeholder">
                        🛍️
                    </div>
                `;


            return `

                <div class="order-product-item">

                    <div class="order-product-info">

                        ${imageHTML}

                        <div class="order-product-text">

                            <h6>
                                ${escapeHTML(item.productName)}
                            </h6>

                            <p>
                                Price: ${formatPrice(item.price)}
                            </p>

                            <p>
                                Quantity: ${escapeHTML(item.quantity)}
                            </p>

                        </div>

                    </div>

                    <div class="order-product-subtotal">

                        ${formatPrice(item.subtotal)}

                    </div>

                </div>

            `;

        }).join("");

    }


    orderDetailsContent.innerHTML = `

        <div class="order-detail-summary">

            <h5 class="mb-3">Order Information</h5>

            <div class="detail-row">

                <span>Order ID</span>

                <strong>#${escapeHTML(order.orderId)}</strong>

            </div>


            <div class="detail-row">

                <span>Customer ID</span>

                <strong>${escapeHTML(order.userId)}</strong>

            </div>


            <div class="detail-row">

                <span>Address ID</span>

                <strong>${escapeHTML(order.addressId)}</strong>

            </div>


            <div class="detail-row">

                <span>Order Date</span>

                <strong>${formatDate(order.createdAt)}</strong>

            </div>


            <div class="detail-row">

                <span>Order Status</span>

                <strong>${escapeHTML(order.status)}</strong>

            </div>

        </div>


        <div class="order-products-section mt-4">

            <h5 class="mb-3">Ordered Products</h5>

            ${itemsHTML}

        </div>


        <div class="order-detail-total mt-4">

            <span>Total Amount</span>

            <strong class="order-total">
                ${formatPrice(order.totalAmount)}
            </strong>

        </div>

    `;

}


// =================================
// INITIALIZE
// =================================

document.addEventListener("DOMContentLoaded", function () {

    if (!checkLogin()) {
        return;
    }

    loadOrders();

});