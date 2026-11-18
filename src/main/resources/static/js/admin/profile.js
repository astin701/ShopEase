(() => {

// ========================================
// API CONFIGURATION
// ========================================

const API_URL = "/api/admin/profile";

const CHANGE_PASSWORD_API_URL = "/api/admin/profile/change-password";


// ========================================
// AUTHENTICATION
// ========================================

const token = localStorage.getItem("token");
const userRole = localStorage.getItem("userRole");

if (!token || userRole !== "ROLE_ADMIN") {

    window.location.href = "../login.html";
    return;

}


// ========================================
// HTML ELEMENTS
// ========================================

// Profile information

const adminName = document.getElementById("admin-name");

const profileName = document.getElementById("profile-name");
const profileEmail = document.getElementById("profile-email");

const profileFullName = document.getElementById("profile-full-name");
const profileEmailAddress = document.getElementById("profile-email-address");
const profilePhone = document.getElementById("profile-phone");
const profileRole = document.getElementById("profile-role");
const profileId = document.getElementById("profile-id");
const profileCreatedAt = document.getElementById("profile-created-at");


// ========================================
// EDIT PROFILE ELEMENTS
// ========================================

const editProfileBtn = document.getElementById("edit-profile-btn");

const editProfileForm = document.getElementById("edit-profile-form");

const editFullName = document.getElementById("edit-full-name");
const editEmail = document.getElementById("edit-email");
const editPhone = document.getElementById("edit-phone");

const saveProfileBtn = document.getElementById("save-profile-btn");

const errorMessage = document.getElementById("profile-error-message");
const successMessage = document.getElementById("profile-success-message");


// ========================================
// CHANGE PASSWORD ELEMENTS
// ========================================

const changePasswordForm = document.getElementById("change-password-form");

const currentPassword = document.getElementById("current-password");
const newPassword = document.getElementById("new-password");
const confirmPassword = document.getElementById("confirm-password");

const passwordErrorMessage = document.getElementById("password-error-message");
const passwordSuccessMessage = document.getElementById("password-success-message");

const savePasswordBtn = document.getElementById("save-password-btn");

const changePasswordModal = document.getElementById("changePasswordModal");


// ========================================
// CURRENT ADMIN DATA
// ========================================

let currentAdmin = null;


// ========================================
// AUTHENTICATION HANDLER
// ========================================

function logoutAdmin() {

    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");

    window.location.href = "../login.html";

}


// ========================================
// LOAD ADMIN PROFILE
// ========================================

async function loadAdminProfile() {

    try {

        const response = await fetch(API_URL, {

            method: "GET",

            headers: {
                "Authorization": `Bearer ${token}`
            }

        });


        if (response.status === 401) {

            logoutAdmin();

            return;

        }


        if (response.status === 403) {

            throw new Error("You are not authorized to access this profile.");

        }


        if (!response.ok) {

            throw new Error("Failed to load admin profile.");

        }


        const admin = await response.json();

        currentAdmin = admin;


        // ========================================
        // DISPLAY ADMIN INFORMATION
        // ========================================

        adminName.textContent = admin.name || "Administrator";

        profileName.textContent = admin.name || "N/A";

        profileEmail.textContent = admin.email || "N/A";

        profileFullName.textContent = admin.name || "N/A";

        profileEmailAddress.textContent = admin.email || "N/A";

        profilePhone.textContent = admin.phoneNumber || "N/A";

        profileRole.textContent = admin.role || "N/A";

        profileId.textContent = admin.id ?? "N/A";


        // ========================================
        // FORMAT ACCOUNT CREATION DATE
        // ========================================

        if (admin.createdAt) {

            const createdDate = new Date(admin.createdAt);

            profileCreatedAt.textContent = createdDate.toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }
            );

        } else {

            profileCreatedAt.textContent = "N/A";

        }

    } catch (error) {

        console.error("Error loading admin profile:", error);

        profileName.textContent = "Unable to load profile";

        profileEmail.textContent = "Please try again.";

    }

}


// ========================================
// EDIT PROFILE MESSAGES
// ========================================

function clearMessages() {

    errorMessage.textContent = "";
    errorMessage.classList.add("d-none");

    successMessage.textContent = "";
    successMessage.classList.add("d-none");

}


// ========================================
// OPEN EDIT PROFILE MODAL
// ========================================

if (editProfileBtn) {

    editProfileBtn.addEventListener("click", () => {

        if (!currentAdmin) {
            return;
        }

        // Fill existing information

        editFullName.value = currentAdmin.name || "";

        editEmail.value = currentAdmin.email || "";

        editPhone.value = currentAdmin.phoneNumber || "";


        // Reset validation and messages

        editProfileForm.classList.remove("was-validated");

        clearMessages();

    });

}


// ========================================
// UPDATE ADMIN PROFILE
// ========================================

editProfileForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    // Clear previous messages

    clearMessages();


    // Browser validation

    editProfileForm.classList.add("was-validated");

    if (!editProfileForm.checkValidity()) {

        editProfileForm.reportValidity();

        return;

    }


    // Prepare updated profile data

    const updatedData = {

        fullName: editFullName.value.trim(),

        phoneNumber: editPhone.value.trim()

    };


    // Disable button while saving

    saveProfileBtn.disabled = true;

    saveProfileBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm"></span>
        Saving...
    `;


    try {

        const response = await fetch(API_URL, {

            method: "PUT",

            headers: {

                "Authorization": `Bearer ${token}`,

                "Content-Type": "application/json"

            },

            body: JSON.stringify(updatedData)

        });


        // Handle unauthorized request

        if (response.status === 401) {

            logoutAdmin();

            return;

        }


        // Read response

        const responseData = await response.json().catch(() => null);


        if (!response.ok) {

            throw new Error(
                responseData?.message ||
                responseData?.error ||
                "Unable to update profile."
            );

        }


        // ========================================
        // UPDATE CURRENT ADMIN DATA
        // ========================================

        currentAdmin = responseData;


        // Update profile information

        adminName.textContent = responseData.name || "Administrator";

        profileName.textContent = responseData.name || "N/A";

        profileEmail.textContent = responseData.email || "N/A";

        profileFullName.textContent = responseData.name || "N/A";

        profileEmailAddress.textContent = responseData.email || "N/A";

        profilePhone.textContent = responseData.phoneNumber || "N/A";


        // Update local storage name

        localStorage.setItem("userName", responseData.name);


        // ========================================
        // SUCCESS MESSAGE
        // ========================================

        successMessage.textContent = "Profile updated successfully!";

        successMessage.classList.remove("d-none");


        // Update modal input values

        editFullName.value = responseData.name || "";

        editPhone.value = responseData.phoneNumber || "";


    } catch (error) {

        console.error("Error updating admin profile:", error);

        errorMessage.textContent = error.message;

        errorMessage.classList.remove("d-none");

    } finally {

        // Enable button again

        saveProfileBtn.disabled = false;

        saveProfileBtn.innerHTML = `
            <i class="bi bi-check-circle"></i>
            Save Changes
        `;

    }

});


// ========================================
// CLEAR PASSWORD MESSAGES
// ========================================

function clearPasswordMessages() {

    passwordErrorMessage.textContent = "";

    passwordErrorMessage.classList.add("d-none");

    passwordSuccessMessage.textContent = "";

    passwordSuccessMessage.classList.add("d-none");

}


// ========================================
// SHOW / HIDE PASSWORD
// ========================================

function setupPasswordToggle(inputId, buttonId) {

    const input = document.getElementById(inputId);

    const button = document.getElementById(buttonId);

    if (!input || !button) {
        return;
    }

    button.addEventListener("click", () => {

        const isPassword = input.type === "password";

        input.type = isPassword ? "text" : "password";

        button.innerHTML = isPassword
            ? '<i class="bi bi-eye-slash"></i>'
            : '<i class="bi bi-eye"></i>';

    });

}


setupPasswordToggle("current-password", "toggle-current-password");

setupPasswordToggle("new-password", "toggle-new-password");

setupPasswordToggle("confirm-password", "toggle-confirm-password");


// ========================================
// RESET PASSWORD FORM
// ========================================

function resetPasswordForm() {

    changePasswordForm.reset();

    changePasswordForm.classList.remove("was-validated");

    currentPassword.type = "password";

    newPassword.type = "password";

    confirmPassword.type = "password";


    // Reset eye icons

    document.getElementById("toggle-current-password").innerHTML =
        '<i class="bi bi-eye"></i>';

    document.getElementById("toggle-new-password").innerHTML =
        '<i class="bi bi-eye"></i>';

    document.getElementById("toggle-confirm-password").innerHTML =
        '<i class="bi bi-eye"></i>';


    clearPasswordMessages();

}


// ========================================
// RESET WHEN PASSWORD MODAL OPENS
// ========================================

if (changePasswordModal) {

    changePasswordModal.addEventListener("show.bs.modal", () => {

        resetPasswordForm();

    });

}


// ========================================
// CHANGE ADMIN PASSWORD
// ========================================

changePasswordForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    // Clear previous messages

    clearPasswordMessages();


    // Browser validation

    changePasswordForm.classList.add("was-validated");

    if (!changePasswordForm.checkValidity()) {

        changePasswordForm.reportValidity();

        return;

    }


    // ========================================
    // PASSWORD CONFIRMATION
    // ========================================

    if (newPassword.value !== confirmPassword.value) {

        passwordErrorMessage.textContent =
            "New password and confirm password do not match.";

        passwordErrorMessage.classList.remove("d-none");

        return;

    }


    // ========================================
    // CHECK SAME PASSWORD
    // ========================================

    if (currentPassword.value === newPassword.value) {

        passwordErrorMessage.textContent =
            "New password must be different from your current password.";

        passwordErrorMessage.classList.remove("d-none");

        return;

    }


    // ========================================
    // PREPARE PASSWORD DATA
    // ========================================

    const passwordData = {

        currentPassword: currentPassword.value,

        newPassword: newPassword.value,

        confirmPassword: confirmPassword.value

    };


    // ========================================
    // DISABLE BUTTON
    // ========================================

    savePasswordBtn.disabled = true;

    savePasswordBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm"></span>
        Updating...
    `;


    try {

        const response = await fetch(CHANGE_PASSWORD_API_URL, {

            method: "PUT",

            headers: {

                "Authorization": `Bearer ${token}`,

                "Content-Type": "application/json"

            },

            body: JSON.stringify(passwordData)

        });


        // ========================================
        // HANDLE UNAUTHORIZED REQUEST
        // ========================================

        if (response.status === 401) {

            logoutAdmin();

            return;

        }


        // Read server response

        const responseData = await response.text();


        if (!response.ok) {

            throw new Error(
                responseData || "Unable to change password."
            );

        }


        // ========================================
        // PASSWORD UPDATE SUCCESS
        // ========================================

        passwordSuccessMessage.textContent =
            responseData || "Password changed successfully!";

        passwordSuccessMessage.classList.remove("d-none");


        // Clear password fields

        changePasswordForm.reset();

        changePasswordForm.classList.remove("was-validated");


        // Reset password visibility

        currentPassword.type = "password";

        newPassword.type = "password";

        confirmPassword.type = "password";


        document.getElementById("toggle-current-password").innerHTML =
            '<i class="bi bi-eye"></i>';

        document.getElementById("toggle-new-password").innerHTML =
            '<i class="bi bi-eye"></i>';

        document.getElementById("toggle-confirm-password").innerHTML =
            '<i class="bi bi-eye"></i>';


    } catch (error) {

        console.error("Error changing admin password:", error);

        passwordErrorMessage.textContent = error.message;

        passwordErrorMessage.classList.remove("d-none");

    } finally {

        // Enable button again

        savePasswordBtn.disabled = false;

        savePasswordBtn.innerHTML = `
            <i class="bi bi-shield-lock"></i>
            Update Password
        `;

    }

});


// ========================================
// LOAD PROFILE
// ========================================

loadAdminProfile();

})();