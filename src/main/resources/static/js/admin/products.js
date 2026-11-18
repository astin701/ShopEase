// =================================
// PRODUCTS MANAGEMENT
// =================================

(function () {

    // =================================
    // API URL
    // =================================

    const PRODUCTS_API_URL = "/api/products";


    // =================================
    // AUTHENTICATION
    // =================================

    const productsToken = localStorage.getItem("token");


    // =================================
    // HTML ELEMENTS
    // =================================

    const productsContainer = document.getElementById("products-container");

    const productCount = document.getElementById("product-count");

    const inStockCount = document.getElementById("in-stock-count");

    const outStockCount = document.getElementById("out-stock-count");

    const productSearch = document.getElementById("product-search");

    const noProductsMessage = document.getElementById("no-products-message");


    // =================================
    // PRODUCTS ARRAY
    // =================================

    let products = [];


    // =================================
    // CURRENCY FORMAT
    // =================================

    function formatCurrency(amount) {

        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        }).format(amount);

    }


    // =================================
    // GET PRODUCT IMAGE URL
    // =================================

    function getProductImageUrl(imageUrl) {

        if (!imageUrl) {
            return "";
        }

        if (imageUrl.startsWith("/uploads/")) {
            return imageUrl;
        }

        return `/uploads/${encodeURIComponent(imageUrl)}`;

    }


    // =================================
    // FETCH ALL PRODUCTS
    // =================================

    async function loadProducts() {

        try {

            productsContainer.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">
                        Loading products...
                    </td>
                </tr>
            `;


            const response = await fetch(PRODUCTS_API_URL);

            if (!response.ok) {

                throw new Error("Failed to fetch products");

            }


            products = await response.json();


            // Update statistics

            updateProductStatistics();


            // Display products

            displayProducts(products);

        }

        catch (error) {

            console.error("Products Error:", error);

            productsContainer.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-danger">
                        Failed to load products.
                    </td>
                </tr>
            `;

        }

    }


    // =================================
    // UPDATE PRODUCT STATISTICS
    // =================================

    function updateProductStatistics() {

        const total = products.length;

        const inStock = products.filter(product =>
            product.quantity > 0
        ).length;

        const outOfStock = products.filter(product =>
            product.quantity <= 0
        ).length;


        productCount.textContent = total;

        inStockCount.textContent = inStock;

        outStockCount.textContent = outOfStock;

    }


    // =================================
    // DISPLAY PRODUCTS
    // =================================

    function displayProducts(productList) {

        productsContainer.innerHTML = "";


        if (productList.length === 0) {

            noProductsMessage.classList.remove("d-none");

            return;

        }


        noProductsMessage.classList.add("d-none");


        productList.forEach(product => {

            const row = document.createElement("tr");


            // Product Details

            const productCell = document.createElement("td");

            const productInfo = document.createElement("div");

            productInfo.className = "product-info";


            const productImage = document.createElement("div");

            productImage.className = "product-image";


            const imageUrl = getProductImageUrl(product.imageUrl);


            if (imageUrl) {

                const image = document.createElement("img");

                image.src = imageUrl;

                image.alt = product.name;

                image.onerror = function () {

                    productImage.textContent = "📦";

                };

                productImage.appendChild(image);

            } else {

                productImage.textContent = "📦";

            }


            const productName = document.createElement("h6");

            productName.textContent = product.name;


            productInfo.appendChild(productImage);

            productInfo.appendChild(productName);

            productCell.appendChild(productInfo);


            // Product Price

            const priceCell = document.createElement("td");

            priceCell.textContent = formatCurrency(product.price);


            // Product Stock

            const stockCell = document.createElement("td");

            stockCell.className = "product-stock";

            stockCell.textContent = product.quantity;

            if (product.quantity > 0) {

                stockCell.classList.add("in-stock");

            } else {

                stockCell.classList.add("out-of-stock");

            }


            // Product Status

            const statusCell = document.createElement("td");

            const statusBadge = document.createElement("span");

            statusBadge.classList.add("product-status");


            if (product.quantity > 0) {

                statusBadge.classList.add("available-status");

                statusBadge.textContent = "In Stock";

            } else {

                statusBadge.classList.add("unavailable-status");

                statusBadge.textContent = "Out of Stock";

            }

            statusCell.appendChild(statusBadge);


            // Product Actions

            const actionsCell = document.createElement("td");

            const actions = document.createElement("div");

            actions.className = "product-actions";


            // Edit Button

            const editButton = document.createElement("button");

            editButton.className = "product-action-btn edit-product-btn";

            editButton.innerHTML = '<i class="bi bi-pencil"></i>';

            editButton.title = "Edit Product";

            editButton.addEventListener("click", function () {

                window.location.href = `edit-product.html?id=${product.id}`;

            });


            // Delete Button

            const deleteButton = document.createElement("button");

            deleteButton.className = "product-action-btn delete-product-btn";

            deleteButton.innerHTML = '<i class="bi bi-trash"></i>';

            deleteButton.title = "Delete Product";

            deleteButton.addEventListener("click", function () {

                deleteProduct(product.id);

            });


            actions.appendChild(editButton);

            actions.appendChild(deleteButton);

            actionsCell.appendChild(actions);


            // Append Table Cells

            row.appendChild(productCell);

            row.appendChild(priceCell);

            row.appendChild(stockCell);

            row.appendChild(statusCell);

            row.appendChild(actionsCell);


            productsContainer.appendChild(row);

        });

    }


    // =================================
    // SEARCH PRODUCTS
    // =================================

    productSearch.addEventListener("input", function () {

        const searchValue = productSearch.value.toLowerCase().trim();


        const filteredProducts = products.filter(product =>

            product.name.toLowerCase().includes(searchValue)

        );


        displayProducts(filteredProducts);

    });


    // =================================
    // DELETE PRODUCT
    // =================================

    async function deleteProduct(productId) {

        const confirmDelete = confirm(
            "Are you sure you want to delete this product?"
        );


        if (!confirmDelete) {

            return;

        }


        try {

            const response = await fetch(
                `${PRODUCTS_API_URL}/${productId}`,
                {
                    method: "DELETE",

                    headers: {
                        "Authorization": `Bearer ${productsToken}`
                    }
                }
            );


            if (!response.ok) {

                throw new Error("Failed to delete product");

            }


            alert("Product deleted successfully!");


            // Reload products

            await loadProducts();

        }

        catch (error) {

            console.error("Delete Error:", error);

            alert("Unable to delete product. Please try again.");

        }

    }


    // =================================
    // INITIALIZE PRODUCTS PAGE
    // =================================

    if (productsToken && localStorage.getItem("userRole") === "ROLE_ADMIN") {

        loadProducts();

    }

})();