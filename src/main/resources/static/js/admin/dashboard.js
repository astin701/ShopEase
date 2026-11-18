// =================================
// API URLS
// =================================

const PRODUCTS_API_URL = "/api/products";
const USERS_API_URL = "/api/admin/users";
const ORDERS_API_URL = "/api/admin/orders";
const REVENUE_API_URL = "/api/admin/revenue-statistics";


// =================================
// AUTHENTICATION
// =================================

const dashboardToken = localStorage.getItem("token");


// =================================
// HTML ELEMENTS
// =================================

const totalProducts = document.getElementById("total-products");
const totalUsers = document.getElementById("total-users");
const totalOrders = document.getElementById("total-orders");
const totalRevenue = document.getElementById("total-revenue");

const totalSales = document.getElementById("total-sales");
const todayRevenue = document.getElementById("today-revenue");
const monthlyRevenue = document.getElementById("monthly-revenue");
const averageOrderValue = document.getElementById("average-order-value");

const recentOrdersContainer = document.getElementById("recent-orders-container");


// =================================
// CURRENCY FORMAT
// =================================

function formatCurrency(amount) {

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    }).format(Number(amount) || 0);

}


// =================================
// FETCH DASHBOARD DATA
// =================================

async function loadDashboard() {

    try {

        const headers = {
            "Authorization": `Bearer ${dashboardToken}`
        };


        // Fetch all dashboard data

        const [
            productsResponse,
            usersResponse,
            ordersResponse,
            revenueResponse
        ] = await Promise.all([

            fetch(PRODUCTS_API_URL),

            fetch(USERS_API_URL, {
                headers: headers
            }),

            fetch(ORDERS_API_URL, {
                headers: headers
            }),

            fetch(REVENUE_API_URL, {
                headers: headers
            })

        ]);


        // Check API responses

        if (
            !productsResponse.ok ||
            !usersResponse.ok ||
            !ordersResponse.ok ||
            !revenueResponse.ok
        ) {

            throw new Error("Failed to load dashboard data");

        }


        // Convert responses into JSON

        const products = await productsResponse.json();
        const users = await usersResponse.json();
        const orders = await ordersResponse.json();
        const statistics = await revenueResponse.json();


        // =================================
        // UPDATE OVERVIEW STATISTICS
        // =================================

        totalProducts.textContent = products.length;

        totalUsers.textContent = users.length;

        totalOrders.textContent = orders.length;

        totalRevenue.textContent = formatCurrency(
            statistics.totalRevenue
        );


        // =================================
        // UPDATE REVENUE ANALYTICS
        // =================================

        totalSales.textContent = statistics.totalSales;

        todayRevenue.textContent = formatCurrency(
            statistics.todayRevenue
        );

        monthlyRevenue.textContent = formatCurrency(
            statistics.monthlyRevenue
        );

        averageOrderValue.textContent = formatCurrency(
            statistics.averageOrderValue
        );


        // =================================
        // DISPLAY RECENT ORDERS
        // =================================

        displayRecentOrders(orders);

    }

    catch (error) {

        console.error("Dashboard Error:", error);

        if (recentOrdersContainer) {

            recentOrdersContainer.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-danger">
                        Failed to load dashboard data.
                    </td>
                </tr>
            `;

        }

    }

}


// =================================
// DISPLAY RECENT ORDERS
// =================================

function displayRecentOrders(orders) {

    recentOrdersContainer.innerHTML = "";


    if (orders.length === 0) {

        recentOrdersContainer.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    No orders available.
                </td>
            </tr>
        `;

        return;

    }


    // Sort orders by newest date

    const recentOrders = [...orders]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);


    recentOrders.forEach(order => {

        const row = document.createElement("tr");


        // Order ID

        const orderIdCell = document.createElement("td");

        orderIdCell.textContent = `#${order.orderId}`;


        // User ID

        const userIdCell = document.createElement("td");

        userIdCell.textContent = order.userId;


        // Amount

        const amountCell = document.createElement("td");

        amountCell.textContent = formatCurrency(order.totalAmount);


        // Status

        const statusCell = document.createElement("td");

        const statusBadge = document.createElement("span");

        const status = (order.status || "").toUpperCase();

        statusBadge.classList.add("order-status");


        if (status === "PENDING") {

            statusBadge.classList.add("status-pending");

        } else if (status === "CONFIRMED") {

            statusBadge.classList.add("status-confirmed");

        } else if (status === "SHIPPED") {

            statusBadge.classList.add("status-shipped");

        } else if (status === "DELIVERED") {

            statusBadge.classList.add("status-completed");

        } else if (status === "CANCELLED") {

            statusBadge.classList.add("status-cancelled");

        }


        statusBadge.textContent = status;

        statusCell.appendChild(statusBadge);


        // Order Date

        const dateCell = document.createElement("td");

        dateCell.textContent = new Date(order.createdAt)
            .toLocaleDateString("en-IN");


        // Add cells to row

        row.appendChild(orderIdCell);

        row.appendChild(userIdCell);

        row.appendChild(amountCell);

        row.appendChild(statusCell);

        row.appendChild(dateCell);


        // Add row to table

        recentOrdersContainer.appendChild(row);

    });

}


// =================================
// LOAD DASHBOARD
// =================================

if (
    dashboardToken &&
    localStorage.getItem("userRole") === "ROLE_ADMIN"
) {

    loadDashboard();

}