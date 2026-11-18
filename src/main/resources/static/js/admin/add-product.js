// =================================
// ADD PRODUCT MANAGEMENT
// =================================

(function () {

    // =================================
    // API URLS
    // =================================

    const PRODUCTS_API_URL = "/api/products";
    const CATEGORIES_API_URL = "/api/categories";


    // =================================
    // ADMIN AUTHENTICATION
    // =================================

    const addProductToken = localStorage.getItem("token");
    const addProductRole = localStorage.getItem("userRole");

    if (!addProductToken || addProductRole !== "ROLE_ADMIN") {

        alert("Access denied! Admins only.");

        window.location.href = "../pages/login.html";

        return;

    }


    // =================================
    // HTML ELEMENTS
    // =================================

    const addProductForm = document.getElementById("add-product-form");

    const productName = document.getElementById("product-name");

    const productDescription = document.getElementById("product-description");

    const productPrice = document.getElementById("product-price");

    const productQuantity = document.getElementById("product-quantity");

    const productImage = document.getElementById("product-image");

    const productCategory = document.getElementById("product-category");

    const submitProductButton = addProductForm.querySelector(
        'button[type="submit"]'
    );


    // =================================
    // LOAD CATEGORIES
    // =================================

    async function loadCategories() {

        try {

            productCategory.innerHTML = `
                <option value="">Loading categories...</option>
            `;

            const response = await fetch(CATEGORIES_API_URL, {

                method: "GET",

                headers: {
                    "Authorization": `Bearer ${addProductToken}`
                }

            });

            if (!response.ok) {

                throw new Error("Failed to load categories.");

            }

            const categories = await response.json();

            productCategory.innerHTML = `
                <option value="">Select Category</option>
            `;

            categories.forEach(category => {

                const option = document.createElement("option");

                option.value = category.id;

                option.textContent = category.name;

                productCategory.appendChild(option);

            });

            if (categories.length === 0) {

                productCategory.innerHTML = `
                    <option value="">No categories available</option>
                `;

            }

        }

        catch (error) {

            console.error("Category Loading Error:", error);

            productCategory.innerHTML = `
                <option value="">Unable to load categories</option>
            `;

            alert(error.message);

        }

    }


    // =================================
    // VALIDATE PRODUCT FORM
    // =================================

    function validateProductForm() {

        const name = productName.value.trim();

        const description = productDescription.value.trim();

        const price = Number(productPrice.value);

        const quantity = Number(productQuantity.value);

        const selectedImage = productImage.files[0];

        const categoryId = productCategory.value;


        if (name.length < 3 || name.length > 150) {

            alert("Product name must contain 3 to 150 characters.");

            return false;

        }


        if (description.length < 10 || description.length > 1000) {

            alert("Product description must contain 10 to 1000 characters.");

            return false;

        }


        if (!Number.isFinite(price) || price <= 0) {

            alert("Product price must be greater than zero.");

            return false;

        }


        if (!Number.isInteger(quantity) || quantity < 0) {

            alert("Product quantity must be zero or greater.");

            return false;

        }


        if (!selectedImage) {

            alert("Please select a product image.");

            return false;

        }


        if (!selectedImage.type.startsWith("image/")) {

            alert("Please select a valid image file.");

            return false;

        }


        if (selectedImage.size > 5 * 1024 * 1024) {

            alert("Image size must be less than 5 MB.");

            return false;

        }


        if (!categoryId || Number(categoryId) <= 0) {

            alert("Please select a product category.");

            return false;

        }


        return true;

    }


    // =================================
    // ADD NEW PRODUCT
    // =================================

    addProductForm.addEventListener("submit", async function (event) {

        event.preventDefault();


        // Validate form

        if (!validateProductForm()) {

            return;

        }


        // Get selected image

        const selectedImage = productImage.files[0];


        // Create FormData

        const formData = new FormData();

        formData.append("name", productName.value.trim());

        formData.append("description", productDescription.value.trim());

        formData.append("price", productPrice.value);

        formData.append("quantity", productQuantity.value);

        formData.append("categoryId", productCategory.value);

        formData.append("image", selectedImage);


        try {

            // Disable submit button

            submitProductButton.disabled = true;

            submitProductButton.innerHTML = `
                <span class="spinner-border spinner-border-sm"></span>
                Adding Product...
            `;


            // Send POST request

            const response = await fetch(PRODUCTS_API_URL, {

                method: "POST",

                headers: {

                    "Authorization": `Bearer ${addProductToken}`

                },

                body: formData

            });


            // Read response

            const data = await response.json().catch(() => null);


            // Handle errors

            if (!response.ok) {

                let errorMessage = "Failed to add product.";

                if (data) {

                    if (data.message) {

                        errorMessage = data.message;

                    } else if (data.detail) {

                        errorMessage = data.detail;

                    } else if (data.errors) {

                        errorMessage = Object.values(data.errors).join("\n");

                    }

                }

                throw new Error(errorMessage);

            }


            // Success

            alert("Product added successfully!");


            // Reset form

            addProductForm.reset();


            // Redirect to products page

            window.location.href = "products.html";

        }

        catch (error) {

            console.error("Add Product Error:", error);

            alert(error.message);

        }

        finally {

            // Enable submit button

            submitProductButton.disabled = false;

            submitProductButton.innerHTML = `
                <i class="bi bi-plus-circle"></i>
                Add Product
            `;

        }

    });


    // =================================
    // INITIALIZE PAGE
    // =================================

    loadCategories();

})();