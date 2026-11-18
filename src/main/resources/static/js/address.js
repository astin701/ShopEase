// =================================
// API URL
// =================================

const API_URL = "/api/addresses/user";

const userId = localStorage.getItem("userId");
const token = localStorage.getItem("token");


// =================================
// HTML ELEMENTS
// =================================

const addressForm = document.getElementById("address-form");
const addressContainer = document.getElementById("address-container");
const addressLoading = document.getElementById("address-loading");
const emptyAddress = document.getElementById("empty-address");
const addressMessage = document.getElementById("address-message");

const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");
const formTitle = document.getElementById("form-title");

let editingAddressId = null;


// =================================
// CHECK LOGIN
// =================================

function checkLogin() {

    if (!userId || !token) {

        alert("Please login to manage your addresses.");

        window.location.href = "login.html";

        return false;
    }

    return true;
}


// =================================
// API REQUEST
// =================================

async function addressRequest(url, options = {}) {

    const response = await fetch(url, {

        ...options,

        headers: {

            "Authorization": `Bearer ${token}`,

            "Content-Type": "application/json",

            ...options.headers

        }

    });

    const responseText = await response.text();

    let data = null;

    try {

        data = responseText ? JSON.parse(responseText) : null;

    } catch {

        data = responseText;

    }


    // Log API response for debugging

    console.log("API URL:", url);
    console.log("HTTP Status:", response.status);
    console.log("Response:", data);


    if (!response.ok) {

        let message = "Something went wrong.";

        if (typeof data === "string" && data.trim()) {

            message = data;

        } else if (data?.message) {

            message = data.message;

        } else if (data?.detail) {

            message = data.detail;

        } else if (data?.error) {

            message = data.error;

        }

        throw new Error(message);

    }

    return data;
}


// =================================
// SHOW MESSAGE
// =================================

function showMessage(message, type) {

    addressMessage.innerHTML = `

        <div class="alert alert-${type}">

            ${escapeHTML(message)}

        </div>

    `;

}


// =================================
// ESCAPE HTML
// =================================

function escapeHTML(value = "") {

    return String(value).replace(/[&<>"']/g, character => {

        const entities = {

            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"

        };

        return entities[character];

    });

}


// =================================
// GET ALL ADDRESSES
// =================================

async function getAddresses() {

    addressLoading.classList.remove("d-none");

    addressContainer.innerHTML = "";

    emptyAddress.classList.add("d-none");

    try {

        const addresses = await addressRequest(API_URL);

        displayAddresses(addresses || []);

    } catch (error) {

        showMessage(error.message, "danger");

    } finally {

        addressLoading.classList.add("d-none");

    }

}


// =================================
// DISPLAY ADDRESSES
// =================================

function displayAddresses(addresses) {

    addressContainer.innerHTML = "";

    if (!addresses.length) {

        emptyAddress.classList.remove("d-none");

        return;

    }

    emptyAddress.classList.add("d-none");


    addresses.forEach(address => {

        const card = document.createElement("div");

        card.className = "address-card";

        card.innerHTML = `

            <h5>

                ${escapeHTML(address.fullName)}

                ${address.defaultAddress
                    ? '<span class="default-badge">Default</span>'
                    : ''}

            </h5>

            <span class="address-type">

                ${escapeHTML(address.addressType)}

            </span>

            <p>📞 ${escapeHTML(address.phoneNumber)}</p>

            <p>${escapeHTML(address.addressLine1)}</p>

            ${address.addressLine2
                ? `<p>${escapeHTML(address.addressLine2)}</p>`
                : ''}

            <p>

                ${escapeHTML(address.city)},

                ${escapeHTML(address.state)} -

                ${escapeHTML(address.pincode)}

            </p>

            <p>${escapeHTML(address.country)}</p>


            <div class="address-actions">

                <button class="btn btn-warning btn-sm edit-btn">

                    Edit

                </button>

                <button class="btn btn-danger btn-sm delete-btn">

                    Delete

                </button>

            </div>

        `;


        // Edit Button

        card.querySelector(".edit-btn").addEventListener("click", () => {

            editAddress(address.id);

        });


        // Delete Button

        card.querySelector(".delete-btn").addEventListener("click", () => {

            deleteAddress(address.id);

        });


        addressContainer.appendChild(card);

    });

}


// =================================
// GET FORM DATA
// =================================

function getAddressFormData() {

    return {

        fullName: document.getElementById("fullName").value.trim(),

        phoneNumber: document.getElementById("phoneNumber").value.trim(),

        addressLine1: document.getElementById("addressLine1").value.trim(),

        addressLine2: document.getElementById("addressLine2").value.trim(),

        city: document.getElementById("city").value.trim(),

        state: document.getElementById("state").value.trim(),

        pincode: document.getElementById("pincode").value.trim(),

        country: document.getElementById("country").value.trim(),

        addressType: document.getElementById("addressType").value,

        defaultAddress: document.getElementById("defaultAddress").checked

    };

}


// =================================
// ADD / UPDATE ADDRESS
// =================================

addressForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const addressData = getAddressFormData();

    try {

        submitBtn.disabled = true;

        if (editingAddressId === null) {

            await addressRequest(API_URL, {

                method: "POST",

                body: JSON.stringify(addressData)

            });

            showMessage("Address added successfully!", "success");

        } else {

            await addressRequest(

                `${API_URL}/${editingAddressId}`,

                {

                    method: "PUT",

                    body: JSON.stringify(addressData)

                }

            );

            showMessage("Address updated successfully!", "success");

        }

        resetForm();

        await getAddresses();

    } catch (error) {

        showMessage(error.message, "danger");

    } finally {

        submitBtn.disabled = false;

    }

});


// =================================
// EDIT ADDRESS
// =================================

async function editAddress(addressId) {

    try {

        const address = await addressRequest(

            `${API_URL}/${addressId}`

        );


        editingAddressId = addressId;

        document.getElementById("fullName").value = address.fullName;

        document.getElementById("phoneNumber").value = address.phoneNumber;

        document.getElementById("addressLine1").value = address.addressLine1;

        document.getElementById("addressLine2").value = address.addressLine2 || "";

        document.getElementById("city").value = address.city;

        document.getElementById("state").value = address.state;

        document.getElementById("pincode").value = address.pincode;

        document.getElementById("country").value = address.country;

        document.getElementById("addressType").value = address.addressType;

        document.getElementById("defaultAddress").checked = address.defaultAddress;


        formTitle.textContent = "Update Address";

        submitBtn.textContent = "Update Address";

        cancelBtn.classList.remove("d-none");

        addressMessage.innerHTML = "";


        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    } catch (error) {

        showMessage(error.message, "danger");

    }

}


// =================================
// DELETE ADDRESS
// =================================

async function deleteAddress(addressId) {

    const confirmed = confirm(

        "Are you sure you want to delete this address?"

    );

    if (!confirmed) {

        return;

    }


    const deleteButtons = document.querySelectorAll(".delete-btn");

    deleteButtons.forEach(button => {

        button.disabled = true;

    });


    try {

        await addressRequest(

            `${API_URL}/${addressId}`,

            {

                method: "DELETE"

            }

        );


        showMessage("Address deleted successfully!", "success");


        if (editingAddressId === addressId) {

            resetForm();

        }


        await getAddresses();

    } catch (error) {

        console.error("Delete address error:", error);

        showMessage(error.message, "danger");

    } finally {

        deleteButtons.forEach(button => {

            button.disabled = false;

        });

    }

}


// =================================
// RESET FORM
// =================================

function resetForm() {

    addressForm.reset();

    editingAddressId = null;

    formTitle.textContent = "Add New Address";

    submitBtn.textContent = "Save Address";

    cancelBtn.classList.add("d-none");

    document.getElementById("country").value = "India";

}


// =================================
// CANCEL EDIT
// =================================

cancelBtn.addEventListener("click", function () {

    resetForm();

    addressMessage.innerHTML = "";

});


// =================================
// PAGE INITIALIZATION
// =================================

document.addEventListener("DOMContentLoaded", function () {

    if (!checkLogin()) {

        return;

    }

    getAddresses();

});