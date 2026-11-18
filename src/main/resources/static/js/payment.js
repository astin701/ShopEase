// =================================
// API URL
// =================================

const PAYMENT_API_URL = "/api/payments";


// =================================
// USER AUTHENTICATION
// =================================

const userId = localStorage.getItem("userId");
const token = localStorage.getItem("token");


// =================================
// HTML ELEMENTS
// =================================

const paymentLoading = document.getElementById("payment-loading");
const paymentDetails = document.getElementById("payment-details");
const paymentMessage = document.getElementById("payment-message");

const orderIdElement = document.getElementById("payment-order-id");
const paymentIdElement = document.getElementById("payment-id");
const paymentMethodElement = document.getElementById("payment-method");
const paymentStatusElement = document.getElementById("payment-status");
const paymentAmountElement = document.getElementById("payment-amount");


// =================================
// COMMON FUNCTIONS
// =================================

// Currency formatting

function formatPrice(price) {

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR"
    }).format(Number(price) || 0);

}


// Escape HTML

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


// Display message

function showMessage(message, type) {

    paymentMessage.innerHTML = `
        <div class="alert alert-${type}" role="alert">
            ${escapeHTML(message)}
        </div>
    `;

}


// Get API error message

async function getErrorMessage(response) {

    try {

        const data = await response.json();

        return data.message ||
               data.error ||
               "Unable to load payment details.";

    } catch {

        return "Unable to load payment details. Please try again.";

    }

}


// =================================
// CHECK AUTHENTICATION
// =================================

function checkUserLogin() {

    if (!userId || !token) {

        window.location.href = "login.html";

        return false;

    }

    return true;

}


// =================================
// DISPLAY PAYMENT STATUS
// =================================

function displayPaymentStatus(status) {

    paymentStatusElement.textContent = status || "UNKNOWN";

    // Reset previous classes

    paymentStatusElement.className = "";

    if (status === "PAID") {

        paymentStatusElement.classList.add(
            "badge",
            "bg-success"
        );

    } else if (status === "PENDING") {

        paymentStatusElement.classList.add(
            "badge",
            "bg-warning",
            "text-dark"
        );

    } else if (status === "FAILED") {

        paymentStatusElement.classList.add(
            "badge",
            "bg-danger"
        );

    } else {

        paymentStatusElement.classList.add(
            "badge",
            "bg-secondary"
        );

    }

}


// =================================
// DISPLAY PAYMENT DETAILS
// =================================

function displayPaymentDetails(payment) {

    orderIdElement.textContent = payment.orderId;

    paymentIdElement.textContent = payment.paymentId;

    paymentMethodElement.textContent = payment.paymentMethod;

    displayPaymentStatus(payment.paymentStatus);

    paymentAmountElement.textContent = formatPrice(payment.amount);

    paymentLoading.classList.add("d-none");

    paymentDetails.classList.remove("d-none");


    // Show COD information only for COD payments

    const codInformation = document.querySelector(".cod-information");

    if (codInformation) {

        codInformation.classList.toggle(
            "d-none",
            payment.paymentMethod !== "COD"
        );

    }


    // Update heading

    const heading = paymentDetails.querySelector("h3");

    if (heading) {

        heading.textContent = "Order Confirmed!";

    }

}


// =================================
// LOAD PAYMENT DETAILS
// =================================

async function loadPaymentDetails() {

    const urlParams = new URLSearchParams(
        window.location.search
    );

    const orderId = urlParams.get("orderId");


    // Check authentication

    if (!checkUserLogin()) {

        return;

    }


    // Validate order ID

    if (!orderId || !/^\d+$/.test(orderId) || Number(orderId) <= 0) {

        paymentLoading.classList.add("d-none");

        showMessage(
            "Invalid order ID. Please check your order details.",
            "danger"
        );

        return;

    }


    try {

        const response = await fetch(
            `${PAYMENT_API_URL}/order/${encodeURIComponent(orderId)}`,
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        if (!response.ok) {

            throw new Error(
                await getErrorMessage(response)
            );

        }


        const payment = await response.json();


        // Validate payment response

        if (!payment || !payment.paymentId) {

            throw new Error(
                "Payment information is incomplete."
            );

        }


        // Display payment information

        displayPaymentDetails(payment);


    } catch (error) {

        paymentLoading.classList.add("d-none");

        showMessage(
            error.message || "Unable to load payment details.",
            "danger"
        );


        // Provide navigation options

        const actionContainer = document.createElement("div");

        actionContainer.className = "mt-3 d-flex gap-2 flex-wrap";

        actionContainer.innerHTML = `

            <a href="orders.html" class="btn btn-warning">
                View My Orders
            </a>

            <a href="products.html" class="btn btn-outline-secondary">
                Continue Shopping
            </a>

        `;

        paymentMessage.appendChild(actionContainer);

    }

}


// =================================
// INITIALIZE PAYMENT PAGE
// =================================

document.addEventListener("DOMContentLoaded", function () {

    loadPaymentDetails();

});