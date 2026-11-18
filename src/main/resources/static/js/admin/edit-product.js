// =================================
// EDIT PRODUCT
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

    const editToken = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");

    if (!editToken || userRole !== "ROLE_ADMIN") {

        alert("Access denied! Admins only.");

        window.location.href = "../pages/login.html";

        return;

    }


    // =================================
    // GET PRODUCT ID
    // =================================

    const urlParams = new URLSearchParams(window.location.search);

    const productId = urlParams.get("id");

    if (!productId || !/^[1-9]\d*$/.test(productId)) {

        alert("Invalid product ID!");

        window.location.href = "products.html";

        return;

    }


    // =================================
    // DOM ELEMENTS
    // =================================

    const editProductForm = document.getElementById("edit-product-form");

    const productName = document.getElementById("product-name");

    const productDescription = document.getElementById("product-description");

    const productPrice = document.getElementById("product-price");

    const productQuantity = document.getElementById("product-quantity");

    const productImage = document.getElementById("product-image");

    const productCategory = document.getElementById("product-category");

    const currentProductImage = document.getElementById("current-product-image");

    const updateButton = document.getElementById("update-product-btn");

    const cancelButton = document.getElementById("cancel-edit-btn");


    // =================================
    // STORE EXISTING IMAGE
    // =================================

    let existingImageUrl = "";


    // =================================
    // LOAD PRODUCT DETAILS
    // =================================

    async function loadProduct() {

        try {

            const response = await fetch(`${PRODUCTS_API_URL}/${productId}`, {

                method: "GET",

                headers: {
                    "Authorization": `Bearer ${editToken}`
                }

            });


            const data = await response.json();


            if (!response.ok) {

                throw new Error(data?.message || "Unable to load product.");

            }


            console.log("Product API Response:", data);


            // Fill product details

            productName.value = data.name || "";

            productDescription.value = data.description || "";

            productPrice.value = data.price ?? "";

            productQuantity.value = data.quantity ?? "";


            // Display existing image

            existingImageUrl = data.imageUrl || data.image_url || "";

            if (existingImageUrl) {

                currentProductImage.src = existingImageUrl.startsWith("/uploads/")
                    ? existingImageUrl
                    : `/uploads/${encodeURIComponent(existingImageUrl)}`;

                currentProductImage.style.display = "block";

            }


            // Select existing category

            if (data.category && data.category.id) {

                productCategory.value = String(data.category.id);

            } else if (data.categoryId) {

                productCategory.value = String(data.categoryId);

            }


        } catch (error) {

            console.error("Load Product Error:", error);

            alert(error.message);

            window.location.href = "products.html";

        }

    }


    // =================================
    // IMAGE PREVIEW
    // =================================

    productImage.addEventListener("change", function () {

        const selectedImage = this.files[0];


        if (selectedImage) {

            // Check image type

            if (!selectedImage.type.startsWith("image/")) {

                alert("Please select a valid image file.");

                this.value = "";

                return;

            }


            // Check image size (5 MB)

            if (selectedImage.size > 5 * 1024 * 1024) {

                alert("Image size must be less than 5 MB.");

                this.value = "";

                return;

            }


            // Display selected image preview

            const imagePreviewUrl = URL.createObjectURL(selectedImage);

            currentProductImage.src = imagePreviewUrl;

            currentProductImage.style.display = "block";

        }

    });


    // =================================
    // LOAD CATEGORIES
    // =================================

    async function loadCategories() {

        try {

            const response = await fetch(CATEGORIES_API_URL, {

                method: "GET",

                headers: {
                    "Authorization": `Bearer ${editToken}`
                }

            });


            const categories = await response.json();


            if (!response.ok) {

                throw new Error("Unable to load categories.");

            }


            if (!Array.isArray(categories)) {

                throw new Error("Invalid category response.");

            }


            // Clear existing options

            productCategory.innerHTML = `
                <option value="">Select Category</option>
            `;


            // Add categories

            categories.forEach(category => {

                const option = document.createElement("option");

                option.value = category.id;

                option.textContent = category.name;

                productCategory.appendChild(option);

            });


        } catch (error) {

            console.error("Load Categories Error:", error);

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

        const categoryId = Number(productCategory.value);

        const selectedImage = productImage.files[0];


        // Validate name

        if (name.length < 3 || name.length > 150) {

            alert("Product name must contain 3 to 150 characters.");

            return false;

        }


        // Validate description

        if (description.length < 10 || description.length > 1000) {

            alert("Description must contain 10 to 1000 characters.");

            return false;

        }


        // Validate price

        if (!Number.isFinite(price) || price <= 0) {

            alert("Enter a valid product price.");

            return false;

        }


        // Validate quantity

        if (!Number.isInteger(quantity) || quantity < 0) {

            alert("Enter a valid product quantity.");

            return false;

        }


        // Validate category

        if (!Number.isInteger(categoryId) || categoryId <= 0) {

            alert("Please select a valid category.");

            return false;

        }


        // Validate selected image (only if a new image is selected)

        if (selectedImage) {

            if (!selectedImage.type.startsWith("image/")) {

                alert("Please select a valid image file.");

                return false;

            }


            if (selectedImage.size > 5 * 1024 * 1024) {

                alert("Image size must be less than 5 MB.");

                return false;

            }

        }


        return true;

    }


    // =================================
    // UPDATE PRODUCT
    // =================================

    editProductForm.addEventListener("submit", async function (event) {

        event.preventDefault();


        if (!validateProductForm()) {

            return;

        }


        // Get selected image file

        const selectedImage = productImage.files[0];


        // Create FormData

        const formData = new FormData();

        formData.append("name", productName.value.trim());

        formData.append("description", productDescription.value.trim());

        formData.append("price", productPrice.value);

        formData.append("quantity", productQuantity.value);

        formData.append("categoryId", productCategory.value);


        // Add image only when a new image is selected

        if (selectedImage) {

            formData.append("image", selectedImage);

        }


        try {

            // Disable button

            updateButton.disabled = true;

            updateButton.innerHTML = `
                <span class="spinner-border spinner-border-sm"></span>
                Updating...
            `;


            // Send PUT request

            const response = await fetch(`${PRODUCTS_API_URL}/${productId}`, {

                method: "PUT",

                headers: {

                    "Authorization": `Bearer ${editToken}`

                },

                body: formData

            });


            const data = await response.json().catch(() => null);


            if (!response.ok) {

                throw new Error(
                    data?.message ||
                    data?.detail ||
                    "Failed to update product."
                );

            }


            alert("Product updated successfully!");

            window.location.href = "products.html";


        } catch (error) {

            console.error("Update Product Error:", error);

            alert(error.message);

        } finally {

            updateButton.disabled = false;

            updateButton.innerHTML = `
                <i class="bi bi-check-circle"></i>
                Update Product
            `;

        }

    });


    // =================================
    // CANCEL EDIT
    // =================================

    cancelButton.addEventListener("click", function () {

        const confirmCancel = confirm(
            "Are you sure you want to cancel editing?"
        );


        if (confirmCancel) {

            window.location.href = "products.html";

        }

    });


    // =================================
    // INITIALIZE PAGE
    // =================================

    async function initializeEditProductPage() {

        await loadCategories();

        await loadProduct();

    }


    initializeEditProductPage();


})();