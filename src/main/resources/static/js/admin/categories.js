(() => {

// ========================================
// API CONFIGURATION
// ========================================

const API_URL = "/api/categories";


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

// Statistics

const totalCategories = document.getElementById("total-categories");


// Table

const categoriesTableBody = document.getElementById("categories-table-body");

const categorySearch = document.getElementById("category-search");

const emptyState = document.getElementById("empty-state");

const tableContainer = document.querySelector(".table-responsive");


// Buttons

const addCategoryBtn = document.getElementById("add-category-btn");

const refreshCategoriesBtn = document.getElementById("refresh-categories-btn");

const saveCategoryBtn = document.getElementById("save-category-btn");

const confirmDeleteBtn = document.getElementById("confirm-delete-btn");


// Category form

const categoryForm = document.getElementById("category-form");

const categoryId = document.getElementById("category-id");

const categoryName = document.getElementById("category-name");

const categoryDescription = document.getElementById("category-description");

const categoryMessage = document.getElementById("category-message");


// Delete modal

const deleteCategoryId = document.getElementById("delete-category-id");

const deleteCategoryMessage = document.getElementById("delete-category-message");


// Modal elements

const categoryModalElement = document.getElementById("categoryModal");

const deleteModalElement = document.getElementById("deleteCategoryModal");

const categoryModal = bootstrap.Modal.getOrCreateInstance(categoryModalElement);

const deleteCategoryModal = bootstrap.Modal.getOrCreateInstance(deleteModalElement);


// Modal title

const categoryModalLabel = document.getElementById("categoryModalLabel");


// ========================================
// GLOBAL VARIABLES
// ========================================

let allCategories = [];


// ========================================
// API HEADERS
// ========================================

function getHeaders() {

    return {

        "Authorization": `Bearer ${token}`,

        "Content-Type": "application/json"

    };

}


// ========================================
// ERROR MESSAGE HANDLER
// ========================================

async function getErrorMessage(response) {

    try {

        const errorData = await response.json();

        return errorData.message ||
               errorData.error ||
               errorData.detail ||
               `Request failed with status ${response.status}`;

    } catch {

        try {

            const errorText = await response.text();

            return errorText || `Request failed with status ${response.status}`;

        } catch {

            return `Request failed with status ${response.status}`;

        }

    }

}


// ========================================
// ESCAPE HTML
// ========================================

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


// ========================================
// LOAD ALL CATEGORIES
// ========================================

async function loadCategories() {

    categoriesTableBody.innerHTML = `

        <tr>

            <td colspan="4" class="text-center py-4">

                <div class="spinner-border spinner-border-sm text-warning"
                    role="status">

                </div>

                <span class="ms-2">
                    Loading categories...
                </span>

            </td>

        </tr>

    `;

    emptyState.classList.add("d-none");

    tableContainer.classList.remove("d-none");


    try {

        const response = await fetch(API_URL, {

            method: "GET",

            headers: getHeaders()

        });


        if (!response.ok) {

            throw new Error(await getErrorMessage(response));

        }


        const categories = await response.json();


        allCategories = Array.isArray(categories) ? categories : [];


        // Update statistics

        totalCategories.textContent = allCategories.length;


        // Display categories

        displayCategories(allCategories);


    } catch (error) {

        console.error("Error loading categories:", error);


        categoriesTableBody.innerHTML = `

            <tr>

                <td colspan="4" class="text-center text-danger py-4">

                    <i class="bi bi-exclamation-circle"></i>

                    ${escapeHTML(error.message)}

                </td>

            </tr>

        `;

        totalCategories.textContent = "0";

    }

}


// ========================================
// DISPLAY CATEGORIES
// ========================================

function displayCategories(categories) {

    categoriesTableBody.innerHTML = "";


    // Check empty categories

    if (categories.length === 0) {

        tableContainer.classList.add("d-none");

        emptyState.classList.remove("d-none");

        return;

    }


    tableContainer.classList.remove("d-none");

    emptyState.classList.add("d-none");


    categories.forEach(category => {

        const row = document.createElement("tr");


        row.innerHTML = `

            <td>

                #${escapeHTML(category.id)}

            </td>


            <td>

                <strong>

                    ${escapeHTML(category.name)}

                </strong>

            </td>


            <td>

                ${escapeHTML(category.description)}

            </td>


            <td>

                <button type="button"
                    class="action-btn edit-btn"
                    data-id="${escapeHTML(category.id)}"
                    title="Edit Category">

                    <i class="bi bi-pencil-square"></i>

                </button>


                <button type="button"
                    class="action-btn delete-btn"
                    data-id="${escapeHTML(category.id)}"
                    title="Delete Category">

                    <i class="bi bi-trash"></i>

                </button>

            </td>

        `;


        categoriesTableBody.appendChild(row);

    });

}


// ========================================
// SEARCH CATEGORIES
// ========================================

function searchCategories() {

    const searchValue = categorySearch.value.trim().toLowerCase();


    const filteredCategories = allCategories.filter(category => {

        const name = String(category.name ?? "").toLowerCase();

        const description = String(category.description ?? "").toLowerCase();


        return name.includes(searchValue) ||
               description.includes(searchValue);

    });


    displayCategories(filteredCategories);


    // Update empty-state message

    const emptyTitle = emptyState.querySelector("h5");

    const emptyDescription = emptyState.querySelector("p");


    if (filteredCategories.length === 0 && searchValue !== "") {

        emptyTitle.textContent = "No Matching Categories";

        emptyDescription.textContent =
            "Try searching with a different category name.";

    } else if (filteredCategories.length === 0) {

        emptyTitle.textContent = "No Categories Found";

        emptyDescription.textContent =
            "Start by adding your first product category.";

    }

}


// ========================================
// RESET CATEGORY FORM
// ========================================

function resetCategoryForm() {

    categoryForm.reset();

    categoryId.value = "";

    categoryMessage.textContent = "";

    categoryMessage.className = "alert d-none";

    categoryModalLabel.textContent = "Add New Category";


    saveCategoryBtn.disabled = false;

    saveCategoryBtn.innerHTML = `

        <i class="bi bi-check-lg"></i>

        Save Category

    `;

}


// ========================================
// SHOW FORM MESSAGE
// ========================================

function showCategoryMessage(message, type = "danger") {

    categoryMessage.textContent = message;

    categoryMessage.className = `alert alert-${type}`;

}


// ========================================
// ADD CATEGORY BUTTON
// ========================================

addCategoryBtn.addEventListener("click", () => {

    resetCategoryForm();

});


// ========================================
// ADD / EDIT CATEGORY
// ========================================

categoryForm.addEventListener("submit", async event => {

    event.preventDefault();


    // Get form values

    const id = categoryId.value;

    const name = categoryName.value.trim();

    const description = categoryDescription.value.trim();


    // Frontend validation

    if (!name || !description) {

        showCategoryMessage("Please fill in all required fields.");

        return;

    }


    if (name.length > 100) {

        showCategoryMessage("Category name cannot exceed 100 characters.");

        return;

    }


    if (description.length > 500) {

        showCategoryMessage("Description cannot exceed 500 characters.");

        return;

    }


    // Request body

    const categoryData = {

        name: name,

        description: description

    };


    // Determine add or edit

    const isEditing = Boolean(id);

    const requestURL = isEditing
        ? `${API_URL}/${encodeURIComponent(id)}`
        : API_URL;

    const requestMethod = isEditing ? "PUT" : "POST";


    try {

        saveCategoryBtn.disabled = true;

        saveCategoryBtn.innerHTML = `

            <span class="spinner-border spinner-border-sm me-1"></span>

            ${isEditing ? "Updating..." : "Saving..."}

        `;


        const response = await fetch(requestURL, {

            method: requestMethod,

            headers: getHeaders(),

            body: JSON.stringify(categoryData)

        });


        if (!response.ok) {

            throw new Error(await getErrorMessage(response));

        }


        // Success message

        const successMessage = isEditing
            ? "Category updated successfully!"
            : "Category added successfully!";


        showCategoryMessage(successMessage, "success");


        // Reload categories

        await loadCategories();


        // Close modal after a short delay

        setTimeout(() => {

            categoryModal.hide();

            resetCategoryForm();

        }, 800);


    } catch (error) {

        console.error("Error saving category:", error);

        showCategoryMessage(error.message);


        saveCategoryBtn.disabled = false;

        saveCategoryBtn.innerHTML = `

            <i class="bi bi-check-lg"></i>

            ${isEditing ? "Update Category" : "Save Category"}

        `;

    }

});


// ========================================
// EDIT CATEGORY
// ========================================

function editCategory(id) {

    const category = allCategories.find(item =>

        String(item.id) === String(id)

    );


    if (!category) {

        alert("Category not found. Please refresh the page.");

        return;

    }


    // Reset previous messages

    resetCategoryForm();


    // Fill category details

    categoryId.value = category.id;

    categoryName.value = category.name;

    categoryDescription.value = category.description;


    // Update modal title

    categoryModalLabel.textContent = "Edit Category";


    // Update button

    saveCategoryBtn.innerHTML = `

        <i class="bi bi-check-lg"></i>

        Update Category

    `;


    // Show modal

    categoryModal.show();

}


// ========================================
// DELETE CATEGORY
// ========================================

function openDeleteModal(id) {

    deleteCategoryId.value = id;

    deleteCategoryMessage.textContent = "";

    deleteCategoryMessage.className = "alert d-none";


    confirmDeleteBtn.disabled = false;

    confirmDeleteBtn.innerHTML = `

        <i class="bi bi-trash"></i>

        Delete Category

    `;


    deleteCategoryModal.show();

}


// ========================================
// SHOW DELETE MESSAGE
// ========================================

function showDeleteMessage(message, type = "danger") {

    deleteCategoryMessage.textContent = message;

    deleteCategoryMessage.className = `alert alert-${type}`;

}


// ========================================
// CONFIRM DELETE CATEGORY
// ========================================

confirmDeleteBtn.addEventListener("click", async () => {

    const id = deleteCategoryId.value;


    if (!id) {

        showDeleteMessage("Invalid category ID.");

        return;

    }


    try {

        confirmDeleteBtn.disabled = true;

        confirmDeleteBtn.innerHTML = `

            <span class="spinner-border spinner-border-sm me-1"></span>

            Deleting...

        `;


        const response = await fetch(

            `${API_URL}/${encodeURIComponent(id)}`,

            {

                method: "DELETE",

                headers: getHeaders()

            }

        );


        if (!response.ok) {

            if (response.status === 409) {

                throw new Error(
                    "Cannot delete this category because products are assigned to it."
                );

            }

            throw new Error(await getErrorMessage(response));

        }


        // Success message

        showDeleteMessage("Category deleted successfully!", "success");


        // Reload categories

        await loadCategories();


        // Close modal

        setTimeout(() => {

            deleteCategoryModal.hide();

        }, 800);


    } catch (error) {

        console.error("Error deleting category:", error);

        showDeleteMessage(error.message);


        confirmDeleteBtn.disabled = false;

        confirmDeleteBtn.innerHTML = `

            <i class="bi bi-trash"></i>

            Delete Category

        `;

    }

});


// ========================================
// CATEGORY TABLE EVENT DELEGATION
// ========================================

categoriesTableBody.addEventListener("click", event => {

    const editButton = event.target.closest(".edit-btn");

    const deleteButton = event.target.closest(".delete-btn");


    // Edit button

    if (editButton) {

        const id = editButton.dataset.id;

        editCategory(id);

    }


    // Delete button

    if (deleteButton) {

        const id = deleteButton.dataset.id;

        openDeleteModal(id);

    }

});


// ========================================
// SEARCH EVENT
// ========================================

categorySearch.addEventListener("input", () => {

    searchCategories();

});


// ========================================
// REFRESH BUTTON
// ========================================

refreshCategoriesBtn.addEventListener("click", async () => {

    refreshCategoriesBtn.disabled = true;

    refreshCategoriesBtn.innerHTML = `

        <span class="spinner-border spinner-border-sm me-1"></span>

        Loading...

    `;


    await loadCategories();


    refreshCategoriesBtn.disabled = false;

    refreshCategoriesBtn.innerHTML = `

        <i class="bi bi-arrow-clockwise"></i>

        Refresh

    `;

});


// ========================================
// MODAL RESET EVENTS
// ========================================

categoryModalElement.addEventListener("hidden.bs.modal", () => {

    resetCategoryForm();

});


deleteModalElement.addEventListener("hidden.bs.modal", () => {

    deleteCategoryId.value = "";

    deleteCategoryMessage.textContent = "";

    deleteCategoryMessage.className = "alert d-none";

});


// ========================================
// INITIALIZE CATEGORY PAGE
// ========================================

loadCategories();


})();