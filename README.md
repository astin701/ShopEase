# 🛒 ShopEase – Full Stack E-Commerce Application

ShopEase is a full-stack e-commerce web application developed using Java Spring Boot and MySQL. It provides a platform where customers can browse products, manage their shopping carts, maintain wishlists, place orders, and manage their accounts.

The application also includes an admin dashboard for managing products, categories, users, orders, and store activities.

## 🚀 Features

### 👤 Customer Features

- User Registration and Login
- JWT-based Authentication
- Secure Password Encryption using BCrypt
- Browse and View Products
- Product Details
- Shopping Cart Management
- Wishlist Management
- Address Management
- Order Placement
- Cash on Delivery (COD) Payment
- Order History
- User Profile Management

### 🔐 Admin Features

- Admin Login and Authentication
- Admin Dashboard
- Product Management (CRUD)
- Category Management (CRUD)
- User Management
- Order Management
- Order Status Management
- Product Image Upload
- Admin Profile Management
- Change Password
- Activity Logs
- Revenue Statistics

## 🛠️ Technologies Used

### Backend
- Java 17
- Spring Boot
- Spring Security
- Spring Data JPA
- Hibernate
- REST API
- JWT Authentication
- Maven

### Frontend
- HTML5
- CSS3
- JavaScript
- Bootstrap 5
- Poppins Font

### Database
- MySQL 8

### Tools
- Visual Studio Code
- Git
- GitHub
- Postman

## 📂 Project Structure

```text
ShopEase/
│
├── .mvn/
├── src/
│   ├── main/
│   │   ├── java/com/example/shopease/
│   │   │   ├── Config/
│   │   │   ├── Controller/
│   │   │   ├── DTO/
│   │   │   ├── Entity/
│   │   │   ├── Exception/
│   │   │   ├── Filter/
│   │   │   ├── Repository/
│   │   │   ├── Service/
│   │   │   └── ShopeaseApplication.java
│   │   │
│   │   └── resources/
│   │       ├── static/
│   │       │   ├── admin/
│   │       │   ├── css/
│   │       │   ├── images/
│   │       │   ├── js/
│   │       │   ├── pages/
│   │       │   └── index.html
│   │       │
│   │       └── application.properties
│   │
│   └── test/
│
├── uploads/
├── pom.xml
├── mvnw
├── mvnw.cmd
├── .gitignore
└── README.md
```

## ⚙️ Installation and Setup

### 1. Prerequisites

Make sure you have installed:

- Java JDK 17
- MySQL 8
- Visual Studio Code or any Java IDE
- Git

### 2. Clone the Repository

```bash
git clone https://github.com/astin701/ShopEase.git
```

### 3. Open the Project

```bash
cd ShopEase
```

### 4. Create MySQL Database

Open MySQL and execute:

```sql
CREATE DATABASE shopease;
```

### 5. Configure Database Connection

Open:

`src/main/resources/application.properties`

Configure your MySQL credentials and JWT secret:

```properties
spring.application.name=shopease

spring.datasource.url=jdbc:mysql://localhost:3306/shopease
spring.datasource.username=YOUR_DB_USERNAME
spring.datasource.password=YOUR_DB_PASSWORD

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

jwt.secret=YOUR_JWT_SECRET_KEY
jwt.expiration=86400000

spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=6MB
```

Replace the placeholder values with your own credentials.

**Note:** Never share your actual database password or JWT secret publicly.

### 6. Run the Application

For Windows:

```bash
.\mvnw.cmd spring-boot:run
```

Alternatively, use Maven:

```bash
mvn spring-boot:run
```

### 7. Access the Application

Open your browser:

```text
http://localhost:8080
```

## 🔑 Authentication and Security

ShopEase implements:

- Spring Security for application security.
- JWT for stateless authentication.
- BCrypt for password hashing.
- Role-based access control for Customer and Admin.
- Custom JWT authentication filter.
- Protected REST API endpoints.

## 🗄️ Database Modules

The application uses MySQL to manage:

- Users
- Products
- Categories
- Cart Items
- Wishlists
- Addresses
- Orders
- Order Items
- Payments
- Activity Logs

## 📸 Screenshots

Screenshots of the following application pages can be added here:

- Home Page
- Product Listing
- Product Details
- Shopping Cart
- Wishlist
- Checkout
- Order History
- Admin Dashboard
- Admin Product Management
- Admin Category Management

## 💳 Payment Information

Currently, ShopEase supports Cash on Delivery (COD).

Online payment options such as UPI and Card are not yet implemented.

## 🎯 Project Objective

The main objective of ShopEase is to develop a complete full-stack e-commerce application while implementing practical concepts of Java development, Spring Boot, REST APIs, database management, authentication, and frontend development.

## 👨‍💻 Developer

**Astin**

- GitHub: [astin701](https://github.com/astin701)
- Project: [ShopEase](https://github.com/astin701/ShopEase)

---

⭐ If you find this project interesting, consider giving it a star!