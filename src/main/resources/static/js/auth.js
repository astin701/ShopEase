// =================================
// API URL
// =================================

const API_URL = "/api/users";


// =================================
// REGISTER USER
// =================================

const registerForm = document.getElementById("register-form");

if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirm-password").value;
        const phoneNumber = document.getElementById("phoneNumber").value.trim();

        // Password Validation

        if (password !== confirmPassword) {

            alert("Passwords do not match!");

            return;

        }

        const registerBtn = document.getElementById("register-btn");

        try {

            registerBtn.disabled = true;
            registerBtn.textContent = "Registering...";

            const response = await fetch(`${API_URL}/register`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password,
                    phoneNumber: phoneNumber
                })

            });

            const data = await response.json();

            if (!response.ok) {

                throw new Error(data.message || "Registration failed");

            }

            alert("Registration successful! Please login.");

            window.location.href = "login.html";

        }

        catch (error) {

            console.error("Registration Error:", error);

            alert(error.message);

        }

        finally {

            registerBtn.disabled = false;
            registerBtn.textContent = "Create Account";

        }

    });

}


// =================================
// LOGIN USER
// =================================

const loginForm = document.getElementById("login-form");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        const loginBtn = document.getElementById("login-btn");

        try {

            loginBtn.disabled = true;
            loginBtn.textContent = "Logging in...";

            const response = await fetch(`${API_URL}/login`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email: email,
                    password: password
                })

            });

            const data = await response.json().catch(() =>({}));

            if (!response.ok) {

                throw new Error(data.message || data.detail || "Invalid email or password");

            }

            if(!data.token || !data.role){
                throw new Error("Invalid login response from server");
            }

            // Store User Information

            localStorage.setItem("userId", data.id);

            localStorage.setItem("userName", data.name);

            localStorage.setItem("userEmail", data.email);

            localStorage.setItem("token", data.token);

            localStorage.setItem("userRole", data.role);

            alert("Login successful!");

            if(data.role === "ROLE_ADMIN"){
                window.location.href = "../admin/dashboard.html";
            }else if(data.role === "ROLE_USER"){
                window.location.href = "../index.html";
            }else{
                throw new Error("Invalid user role");
            }

        }

        catch (error) {

            console.error("Login Error:", error);

            alert(error.message);

        }

        finally {

            loginBtn.disabled = false;
            loginBtn.textContent = "Login";

        }

    });

}


// =================================
// CHECK LOGIN STATUS
// =================================

function isLoggedIn() {

    return localStorage.getItem("token") !== null;

}


// =================================
// LOGOUT USER
// =================================

function logoutUser() {

    localStorage.removeItem("userId");

    localStorage.removeItem("userName");

    localStorage.removeItem("userEmail");

    localStorage.removeItem("token");

    localStorage.removeItem("userRole");

    localStorage.removeItem("cart");

    window.location.href = "login.html";

}