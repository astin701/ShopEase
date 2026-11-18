// =================================
// API URLS
// =================================

const ADDRESS_API_URL = "/api/addresses/user";
const CART_API_URL = "/api/cart";
const ORDER_API_URL = "/api/orders";
const PAYMENT_API_URL = "/api/payments";


// =================================
// USER AUTHENTICATION
// =================================

const userId = localStorage.getItem("userId");
const token = localStorage.getItem("token");


// =================================
// HTML ELEMENTS
// =================================

const addressLoading = document.getElementById("address-loading");
const addressContainer = document.getElementById("address-container");
const emptyAddress = document.getElementById("empty-address");

const cartLoading = document.getElementById("cart-loading");
const checkoutItems = document.getElementById("checkout-items");

const subtotalElement = document.getElementById("checkout-subtotal");
const shippingElement = document.getElementById("checkout-shipping");
const totalElement = document.getElementById("checkout-total");

const placeOrderBtn = document.getElementById("place-order-btn");
const checkoutMessage = document.getElementById("checkout-message");


// =================================
// CHECKOUT VARIABLES
// =================================

let addresses = [];
let cartItems = [];

let selectedAddressId = null;

let orderSubtotal = 0;

// Loading states

let addressesLoaded = false;
let cartLoaded = false;

// Error states

let addressLoadFailed = false;
let cartLoadFailed = false;

// Prevent duplicate orders

let isPlacingOrder = false;


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


// Display message

function showMessage(message, type) {

    checkoutMessage.innerHTML = `

        <div class="alert alert-${type} alert-dismissible fade show">

            ${escapeHTML(message)}

            <button type="button"
                class="btn-close"
                data-bs-dismiss="alert">
            </button>

        </div>

    `;

}


// Escape HTML

function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, function (character) {

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


// Get API error message

async function getErrorMessage(response) {

    try {

        const text = await response.text();

        if (!text) {
            return `Request failed with status ${response.status}`;
        }

        try {
            const data = JSON.parse(text);
            return data.message || data.error || data.detail || text;
        } catch {
            return text;
        }

    } catch {

        return `Request failed with status ${response.status}`;

    }

}


// Authentication headers

function getHeaders() {

    return {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    };

}


// =================================
// CHECK USER LOGIN
// =================================

function checkUserLogin() {

    if (!userId || !token) {

        window.location.href = "login.html";

        return false;

    }

    return true;

}


// =================================
// UPDATE PLACE ORDER BUTTON
// =================================

function updatePlaceOrderButton() {

    const canPlaceOrder =
        addressesLoaded &&
        cartLoaded &&
        !addressLoadFailed &&
        !cartLoadFailed &&
        addresses.length > 0 &&
        cartItems.length > 0 &&
        !isPlacingOrder;

    placeOrderBtn.disabled = !canPlaceOrder;

}


// =================================
// LOAD ADDRESSES
// =================================

async function loadAddresses() {

    addressLoading.classList.remove("d-none");

    addressContainer.innerHTML = "";

    emptyAddress.classList.add("d-none");

    try {

        const response = await fetch(
            `${ADDRESS_API_URL}`,
            {
                method: "GET",
                headers: getHeaders()
            }
        );

        if (!response.ok) {

            throw new Error(await getErrorMessage(response));

        }

        addresses = await response.json();

        if (!Array.isArray(addresses)) {

            throw new Error("Invalid address response.");

        }

        addressesLoaded = true;

        addressLoading.classList.add("d-none");

        if (addresses.length === 0) {

            emptyAddress.classList.remove("d-none");

            return;

        }

        displayAddresses();

    } catch (error) {

        addressLoadFailed = true;

        addressLoading.classList.add("d-none");

        showMessage(
            "Unable to load addresses: " + error.message,
            "danger"
        );

    } finally {

        updatePlaceOrderButton();

    }

}


// =================================
// DISPLAY ADDRESSES
// =================================

function displayAddresses() {

    addressContainer.innerHTML = "";

    addresses.forEach(address => {

        const addressCard = document.createElement("div");

        addressCard.className = "checkout-address-card";

        addressCard.innerHTML = `

            <label class="address-select-label">

                <input
                    type="radio"
                    name="selected-address"
                    value="${Number(address.id)}">

                <div class="address-content">

                    <div class="address-top">

                        <h6>
                            ${escapeHTML(address.fullName)}
                        </h6>

                        <span class="address-type">
                            ${escapeHTML(address.addressType || "HOME")}
                        </span>

                    </div>

                    <p>
                        ${escapeHTML(address.addressLine1)}
                        ${address.addressLine2
                            ? ", " + escapeHTML(address.addressLine2)
                            : ""}
                    </p>

                    <p>
                        ${escapeHTML(address.city)},
                        ${escapeHTML(address.state)} -
                        ${escapeHTML(address.pincode)}
                    </p>

                    <p>
                        ${escapeHTML(address.country)}
                    </p>

                    <p class="address-phone">
                        Phone: ${escapeHTML(address.phoneNumber)}
                    </p>

                    ${address.defaultAddress
                        ? `<span class="default-address-badge">
                                Default Address
                           </span>`
                        : ""}

                </div>

            </label>

        `;


        const radio = addressCard.querySelector(
            'input[name="selected-address"]'
        );

        radio.addEventListener("change", function () {

            selectedAddressId = Number(this.value);

            updateSelectedAddress();

        });

        addressContainer.appendChild(addressCard);

    });


    // Find default address

    const defaultAddress = addresses.find(
        address => address.defaultAddress
    );


    // Select default address or first address

    if (defaultAddress) {

        selectedAddressId = Number(defaultAddress.id);

    } else {

        selectedAddressId = Number(addresses[0].id);

    }


    // Check selected radio button

    const selectedRadio = addressContainer.querySelector(
        `input[value="${selectedAddressId}"]`
    );

    if (selectedRadio) {

        selectedRadio.checked = true;

    }

    updateSelectedAddress();

}


// =================================
// UPDATE SELECTED ADDRESS STYLE
// =================================

function updateSelectedAddress() {

    const addressCards = document.querySelectorAll(
        ".checkout-address-card"
    );

    addressCards.forEach(card => {

        const radio = card.querySelector(
            'input[name="selected-address"]'
        );

        card.classList.toggle(
            "selected",
            radio.checked
        );

    });

}


// =================================
// LOAD CART ITEMS
// =================================

async function loadCartItems() {

    cartLoading.classList.remove("d-none");

    checkoutItems.innerHTML = "";

    try {

        const response = await fetch(
            `${CART_API_URL}/${userId}`,
            {
                method: "GET",
                headers: getHeaders()
            }
        );


        // No cart created yet

        if (response.status === 404) {

            cartItems = [];

            cartLoaded = true;

            cartLoading.classList.add("d-none");

            displayCartItems();

            return;

        }


        if (!response.ok) {

            throw new Error(await getErrorMessage(response));

        }


        cartItems = await response.json();

        if (!Array.isArray(cartItems)) {

            throw new Error("Invalid cart response.");

        }

        cartLoaded = true;

        cartLoading.classList.add("d-none");

        displayCartItems();

    } catch (error) {

        cartLoadFailed = true;

        cartLoading.classList.add("d-none");

        showMessage(
            "Unable to load cart: " + error.message,
            "danger"
        );

    } finally {

        updatePlaceOrderButton();

    }

}


// =================================
// DISPLAY CART ITEMS
// =================================

function displayCartItems() {

    checkoutItems.innerHTML = "";

    orderSubtotal = 0;


    if (!Array.isArray(cartItems) || cartItems.length === 0) {

        checkoutItems.innerHTML = `

            <div class="empty-checkout-state">

                <div class="empty-icon">🛒</div>

                <h5>Your Cart Is Empty</h5>

                <p>Add products before checking out.</p>

                <a href="products.html" class="btn btn-warning">
                    Shop Now
                </a>

            </div>

        `;

        updateOrderSummary();

        updatePlaceOrderButton();

        return;

    }


    cartItems.forEach(item => {

        const subtotal = Number(item.subtotal);

        orderSubtotal += subtotal;

        const itemElement = document.createElement("div");

        itemElement.className = "checkout-product";

        itemElement.innerHTML = `

            <div class="checkout-product-image">

                <span>📦</span>

            </div>

            <div class="checkout-product-info">

                <h6>
                    ${escapeHTML(item.productName)}
                </h6>

                <p>
                    ${formatPrice(item.price)} × ${Number(item.quantity)}
                </p>

                <strong>
                    ${formatPrice(subtotal)}
                </strong>

            </div>

        `;

        checkoutItems.appendChild(itemElement);

    });


    updateOrderSummary();

    updatePlaceOrderButton();

}


// =================================
// UPDATE ORDER SUMMARY
// =================================

function updateOrderSummary() {

    subtotalElement.textContent = formatPrice(orderSubtotal);

    shippingElement.textContent = "FREE";

    totalElement.textContent = formatPrice(orderSubtotal);

}


// =================================
// PAYMENT OPTION VISUAL SELECTION
// =================================

document.querySelectorAll(
    'input[name="paymentMethod"]'
).forEach(radio => {

    radio.addEventListener("change", function () {

        document.querySelectorAll(".payment-option").forEach(option => {

            option.classList.remove("selected");

        });

        this.closest(".payment-option").classList.add("selected");

    });

});


// =================================
// PLACE ORDER
// =================================

async function placeOrder() {

    // Prevent duplicate submissions

    if (isPlacingOrder) {

        return;

    }


    // Check loading states

    if (!addressesLoaded || !cartLoaded) {

        showMessage(
            "Please wait while checkout information loads.",
            "warning"
        );

        return;

    }


    // Check loading errors

    if (addressLoadFailed || cartLoadFailed) {

        showMessage(
            "Unable to load checkout information. Please refresh the page.",
            "danger"
        );

        return;

    }


    // Check address

    if (!selectedAddressId) {

        showMessage(
            "Please select a delivery address.",
            "warning"
        );

        return;

    }


    // Check cart

    if (!cartItems || cartItems.length === 0) {

        showMessage(
            "Your cart is empty.",
            "warning"
        );

        return;

    }


    // Check payment method

    const paymentMethod = document.querySelector(
        'input[name="paymentMethod"]:checked'
    );

    if (!paymentMethod || paymentMethod.value !== "COD") {

        showMessage(
            "Please select an available payment method.",
            "warning"
        );

        return;

    }


    // Confirm order

    const confirmation = confirm(
        "Are you sure you want to place this order?"
    );

    if (!confirmation) {

        return;

    }


    isPlacingOrder = true;

    placeOrderBtn.disabled = true;

    placeOrderBtn.textContent = "Placing Order...";


    let orderCreated = false;

    let orderId = null;


    try {

        // =================================
        // STEP 1: CREATE ORDER
        // =================================

        const orderResponse = await fetch(
            `${ORDER_API_URL}/place/${selectedAddressId}`,
            {
                method: "POST",
                headers: getHeaders()
            }
        );


        if (!orderResponse.ok) {

            throw new Error(
                await getErrorMessage(orderResponse)
            );

        }


        orderId = await orderResponse.json();

        if (!orderId) {

            throw new Error("Order ID was not received.");

        }


        // Order successfully created

        orderCreated = true;

        localStorage.setItem("lastOrderId", orderId);


        // =================================
        // STEP 2: CREATE COD PAYMENT
        // =================================

        const paymentResponse = await fetch(
            `${PAYMENT_API_URL}/cod/${orderId}`,
            {
                method: "POST",
                headers: getHeaders()
            }
        );


        if (!paymentResponse.ok) {

            throw new Error(
                await getErrorMessage(paymentResponse)
            );

        }


        const payment = await paymentResponse.json();

        localStorage.setItem(
            "lastPaymentId",
            payment.paymentId
        );


        // =================================
        // STEP 3: REDIRECT TO PAYMENT PAGE
        // =================================

        window.location.href =
            `payment.html?orderId=${encodeURIComponent(orderId)}`;


    } catch (error) {

        showMessage(error.message, "danger");


        // =================================
        // PAYMENT FAILED AFTER ORDER CREATED
        // =================================

        if (orderCreated) {

            showMessage(
                `Order #${orderId} was placed, but payment setup failed. Do not place the order again.`,
                "warning"
            );


            const paymentLink = document.createElement("a");

            paymentLink.href =
                `payment.html?orderId=${encodeURIComponent(orderId)}`;

            paymentLink.className = "btn btn-warning mt-2";

            paymentLink.textContent = "Continue to Payment";

            checkoutMessage.appendChild(paymentLink);


            placeOrderBtn.disabled = true;

            placeOrderBtn.textContent = "Order Placed";

            return;

        }


        // =================================
        // ORDER CREATION FAILED
        // =================================

        isPlacingOrder = false;

        placeOrderBtn.disabled = false;

        placeOrderBtn.textContent = "Place Order";

    }

}


// =================================
// EVENT LISTENERS
// =================================

placeOrderBtn.addEventListener("click", placeOrder);


// =================================
// INITIALIZE CHECKOUT
// =================================

document.addEventListener("DOMContentLoaded", function () {

    if (!checkUserLogin()) {

        return;

    }


    loadAddresses();

    loadCartItems();

});