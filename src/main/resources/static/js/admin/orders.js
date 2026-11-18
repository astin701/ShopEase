// ==========================================
// ADMIN ORDER MANAGEMENT
// ==========================================

(function () {

    // ==========================================
    // API URLS
    // ==========================================

    const ORDERS_API_URL = "/api/admin/orders";
    const UPDATE_STATUS_API_URL = "/api/orders/admin";


    // ==========================================
    // AUTHENTICATION
    // ==========================================

    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");

    if (!token || userRole !== "ROLE_ADMIN") {
        window.location.href = "../login.html";
        return;
    }


    // ==========================================
    // DOM ELEMENTS
    // ==========================================

    const ordersTableBody = document.getElementById("orders-table-body");
    const ordersCount = document.getElementById("orders-count");

    const totalOrders = document.getElementById("total-orders");
    const pendingOrders = document.getElementById("pending-orders");
    const deliveredOrders = document.getElementById("delivered-orders");
    const cancelledOrders = document.getElementById("cancelled-orders");

    const emptyOrders = document.getElementById("empty-orders");
    const refreshOrdersBtn = document.getElementById("refresh-orders-btn");

    const orderDetailsModalElement =
        document.getElementById("order-details-modal");

    const orderDetailsBody =
        document.getElementById("order-details-body");

    const orderToastElement =
        document.getElementById("order-toast");

    const orderToastMessage =
        document.getElementById("order-toast-message");


    // ==========================================
    // BOOTSTRAP COMPONENTS
    // ==========================================

    const orderDetailsModal = new bootstrap.Modal(
        orderDetailsModalElement
    );

    const orderToast = new bootstrap.Toast(
        orderToastElement,
        {
            delay: 3000
        }
    );


    // ==========================================
    // GLOBAL ORDERS ARRAY
    // ==========================================

    let orders = [];


    // ==========================================
    // API REQUEST FUNCTION
    // ==========================================

    async function orderRequest(url, options = {}) {

        const response = await fetch(url, {

            ...options,

            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                ...options.headers
            }

        });

        const responseText = await response.text();

        let data = responseText;

        try {
            data = responseText ? JSON.parse(responseText) : null;
        } catch {
            // Keep the original text response.
        }

        if (!response.ok) {

            const message =
                typeof data === "string"
                    ? data
                    : data?.message || "Something went wrong.";

            throw new Error(message);
        }

        return data;
    }


    // ==========================================
    // TOAST MESSAGE
    // ==========================================

    function showOrderToast(message, type = "success") {

        orderToastMessage.textContent = message;

        orderToastElement.classList.remove(
            "text-bg-success",
            "text-bg-danger"
        );

        orderToastElement.classList.add(
            type === "success"
                ? "text-bg-success"
                : "text-bg-danger"
        );

        orderToast.show();
    }


    // ==========================================
    // LOAD ALL ORDERS
    // ==========================================

    async function loadOrders() {

        try {

            ordersTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4">
                        Loading orders...
                    </td>
                </tr>
            `;

            const data = await orderRequest(ORDERS_API_URL);

            orders = Array.isArray(data)
                ? data
                : data?.data || data?.orders || [];

            displayOrders(orders);

            updateOrderStatistics();

        } catch (error) {

            console.error("Load orders error:", error);

            ordersTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-danger py-4">
                        ${escapeHTML(error.message)}
                    </td>
                </tr>
            `;

            showOrderToast(error.message, "danger");
        }
    }


    // ==========================================
    // DISPLAY ORDERS
    // ==========================================

    function displayOrders(orderList) {

        ordersTableBody.innerHTML = "";

        if (!orderList || orderList.length === 0) {

            emptyOrders.classList.remove("d-none");
            ordersCount.textContent = "0 orders";

            return;
        }

        emptyOrders.classList.add("d-none");

        ordersCount.textContent =
            `${orderList.length} orders`;

        orderList.forEach(order => {

            const orderId = order.id ?? order.orderId;

            const status = (
                order.status || "PENDING"
            ).toUpperCase();

            const customerId =
                order.customerId ?? order.userId ?? "-";

            const totalAmount =
                order.totalAmount ?? order.total ?? 0;

            const orderDate =
                order.createdAt ?? order.orderDate ?? order.date;

            const row = document.createElement("tr");

            row.innerHTML = `

                <td>#${escapeHTML(orderId)}</td>

                <td>${escapeHTML(customerId)}</td>

                <td>${formatCurrency(totalAmount)}</td>

                <td>
                    <span class="status-badge status-${escapeHTML(status)}">
                        ${escapeHTML(status)}
                    </span>
                </td>

                <td>${formatDate(orderDate)}</td>

                <td>
                    <select
                        class="form-select form-select-sm order-status-select"
                        data-order-id="${escapeHTML(orderId)}"
                        ${status === "CANCELLED" || status === "DELIVERED"
                            ? "disabled"
                            : ""}
                    >
                        ${getStatusOptions(status)}
                    </select>
                </td>

                <td>
                    <div class="d-flex gap-2">

                        <button
                            type="button"
                            class="btn btn-sm btn-outline-primary view-order-btn"
                            data-order-id="${escapeHTML(orderId)}"
                        >
                            <i class="bi bi-eye"></i>
                        </button>

                        <button
                            type="button"
                            class="btn btn-sm btn-success update-status-btn"
                            data-order-id="${escapeHTML(orderId)}"
                            ${status === "CANCELLED" || status === "DELIVERED"
                                ? "disabled"
                                : ""}
                        >
                            Update
                        </button>

                    </div>
                </td>

            `;

            ordersTableBody.appendChild(row);
        });
    }


    // ==========================================
    // STATUS OPTIONS
    // ==========================================

    function getStatusOptions(currentStatus) {

        const transitions = {

            PENDING: [
                "CONFIRMED",
                "CANCELLED"
            ],

            CONFIRMED: [
                "SHIPPED"
            ],

            SHIPPED: [
                "DELIVERED"
            ]

        };

        const options = transitions[currentStatus] || [];

        let html = `
            <option value="${escapeHTML(currentStatus)}" selected>
                ${escapeHTML(currentStatus)}
            </option>
        `;

        options.forEach(status => {

            html += `
                <option value="${status}">
                    ${status}
                </option>
            `;

        });

        return html;
    }


    // ==========================================
    // UPDATE ORDER STATISTICS
    // ==========================================

    function updateOrderStatistics() {

        totalOrders.textContent = orders.length;

        pendingOrders.textContent =
            orders.filter(order =>
                order.status === "PENDING"
            ).length;

        deliveredOrders.textContent =
            orders.filter(order =>
                order.status === "DELIVERED"
            ).length;

        cancelledOrders.textContent =
            orders.filter(order =>
                order.status === "CANCELLED"
            ).length;
    }


    // ==========================================
    // UPDATE ORDER STATUS
    // ==========================================

    async function updateOrderStatus(orderId) {

        const selectElement = document.querySelector(
            `.order-status-select[data-order-id="${orderId}"]`
        );

        if (!selectElement) return;

        const newStatus = selectElement.value;

        const order = orders.find(item =>
            String(item.id ?? item.orderId) === String(orderId)
        );

        if (!order) return;

        const currentStatus = order.status;

        if (newStatus === currentStatus) {

            showOrderToast(
                "Please select a different status.",
                "danger"
            );

            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to change order #${orderId} ` +
            `from ${currentStatus} to ${newStatus}?`
        );

        if (!confirmed) {

            selectElement.value = currentStatus;
            return;
        }

        try {

            const button = document.querySelector(
                `.update-status-btn[data-order-id="${orderId}"]`
            );

            button.disabled = true;
            button.textContent = "Updating...";

            const url =
                `${UPDATE_STATUS_API_URL}/${orderId}/status` +
                `?status=${encodeURIComponent(newStatus)}`;

            const response = await orderRequest(url, {
                method: "PUT"
            });

            showOrderToast(
                typeof response === "string"
                    ? response
                    : "Order status updated successfully."
            );

            await loadOrders();

        } catch (error) {

            console.error("Update status error:", error);

            showOrderToast(error.message, "danger");

            await loadOrders();
        }
    }


    // ==========================================
    // VIEW ORDER DETAILS
    // ==========================================

    function viewOrderDetails(orderId) {

        const order = orders.find(item =>
            String(item.id ?? item.orderId) === String(orderId)
        );

        if (!order) return;

        const items = order.items || order.orderItems || [];

        const addressId = order.addressId ?? "-";

        const customerId =
            order.customerId ?? order.userId ?? "-";

        const totalAmount =
            order.totalAmount ?? order.total ?? 0;

        let itemsHTML = "";

        if (items.length > 0) {

            itemsHTML = items.map(item => {

                const productName =
                    item.productName ?? item.name ?? "Product";

                const quantity = item.quantity ?? 0;

                const price = item.price ?? 0;

                const subtotal =
                    item.subtotal ?? price * quantity;

                return `

                    <tr>

                        <td>${escapeHTML(productName)}</td>

                        <td>${escapeHTML(quantity)}</td>

                        <td>${formatCurrency(price)}</td>

                        <td>${formatCurrency(subtotal)}</td>

                    </tr>

                `;

            }).join("");

        } else {

            itemsHTML = `
                <tr>
                    <td colspan="4" class="text-center">
                        No order items available.
                    </td>
                </tr>
            `;
        }

        orderDetailsBody.innerHTML = `

            <div class="row g-3 mb-4">

                <div class="col-md-6">
                    <div class="detail-item">
                        <span>Order ID</span>
                        <strong>#${escapeHTML(orderId)}</strong>
                    </div>
                </div>

                <div class="col-md-6">
                    <div class="detail-item">
                        <span>Customer ID</span>
                        <strong>${escapeHTML(customerId)}</strong>
                    </div>
                </div>

                <div class="col-md-6">
                    <div class="detail-item">
                        <span>Address ID</span>
                        <strong>${escapeHTML(addressId)}</strong>
                    </div>
                </div>

                <div class="col-md-6">
                    <div class="detail-item">
                        <span>Order Status</span>
                        <strong>${escapeHTML(order.status)}</strong>
                    </div>
                </div>

                <div class="col-md-6">
                    <div class="detail-item">
                        <span>Order Date</span>
                        <strong>${formatDate(
                            order.createdAt ?? order.orderDate ?? order.date
                        )}</strong>
                    </div>
                </div>

                <div class="col-md-6">
                    <div class="detail-item">
                        <span>Total Amount</span>
                        <strong>${formatCurrency(totalAmount)}</strong>
                    </div>
                </div>

            </div>

            <h6 class="fw-bold mb-3">Order Items</h6>

            <div class="table-responsive">

                <table class="table table-bordered">

                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${itemsHTML}
                    </tbody>

                </table>

            </div>

        `;

        orderDetailsModal.show();
    }


    // ==========================================
    // FORMAT CURRENCY
    // ==========================================

    function formatCurrency(amount) {

        return new Intl.NumberFormat("en-IN", {

            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2

        }).format(Number(amount) || 0);
    }


    // ==========================================
    // FORMAT DATE
    // ==========================================

    function formatDate(dateValue) {

        if (!dateValue) return "-";

        const date = new Date(dateValue);

        if (isNaN(date.getTime())) return "-";

        return date.toLocaleString("en-IN", {

            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"

        });
    }


    // ==========================================
    // HTML ESCAPE
    // ==========================================

    function escapeHTML(value) {

        return String(value ?? "").replace(
            /[&<>"']/g,
            character => ({

                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"

            })[character]
        );
    }


    // ==========================================
    // EVENT LISTENERS
    // ==========================================

    ordersTableBody.addEventListener("click", function (event) {

        const viewButton = event.target.closest(".view-order-btn");

        const updateButton = event.target.closest(".update-status-btn");

        if (viewButton) {

            viewOrderDetails(viewButton.dataset.orderId);

        }

        if (updateButton) {

            updateOrderStatus(updateButton.dataset.orderId);

        }

    });


    // ==========================================
    // REFRESH ORDERS
    // ==========================================

    refreshOrdersBtn.addEventListener("click", loadOrders);


    // ==========================================
    // INITIAL LOAD
    // ==========================================

    loadOrders();

})();