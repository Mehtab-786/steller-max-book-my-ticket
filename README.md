# 🎬 BookMyTicket — Steller Max Movie Seat Booking App

A modern, full-stack movie ticket and real-time seat booking web application built with **Node.js**, **Express.js**, **PostgreSQL**, and **Vanilla JavaScript + Tailwind CSS**. 

Features double-booking protection using **PostgreSQL Row-Level Locking (`FOR UPDATE`)**, **JWT authentication via HttpOnly cookies**, and **seamless automatic token refresh**.

---

## ✨ Features

- 🍿 **Cinematic UI/UX**: Dark-themed, glassmorphic design built with Tailwind CSS, custom ambient lighting effects, and smooth animations.
- 🔐 **Dual-Token Authentication**: Secure authentication using short-lived Access Tokens and long-lived Refresh Tokens stored in secure `HttpOnly` cookies.
- 🔄 **Auto-Refresh & Request Retry**: Background token refreshing using a custom `fetchWithAuth` wrapper—users stay logged in seamlessly without interruptions.
- 🛡️ **Race-Condition & Double-Booking Protection**: Uses database transactions with PostgreSQL row-level locks (`SELECT ... FOR UPDATE`) to prevent simultaneous seat bookings.
- 🪑 **Interactive Seat Selection Grid**: Real-time seat availability rendering, seat state selection, and instant booking summary.
- 💬 **Inline Status Notifications**: Dynamic success/error banner feedback on the page without annoying browser `alert()` popups.
- 📱 **Fully Responsive Layout**: Accessible across desktop, tablet, and mobile browsers.

---

## 🛠️ Tech Stack

### **Backend**
* **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
* **Framework**: [Express.js](https://expressjs.com/) (v5)
* **Database**: [PostgreSQL](https://www.postgresql.org/) (`pg` connection pool with transactions)
* **Authentication**: [JSON Web Tokens (JWT)](https://jwt.io/), [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
* **Middleware**: `cookie-parser`, `cors`, custom centralized `APIError` & `APIResponse` handlers

### **Frontend**
* **Structure & Logic**: HTML5, Vanilla JavaScript (ES6+, Fetch API)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/) (CDN), Google Fonts (*Playfair Display* & *Inter*)

---

## 📁 Project Structure

```text
steller-max-book-my-ticket/
├── public/                     # Static frontend files
│   ├── index.html              # Home landing page with movie catalog & dynamic navbar
│   ├── movies.html             # Seat booking grid page with dynamic seat fetching
│   ├── login.html              # Standalone user login page
│   ├── register.html           # Standalone user registration page
│   └── images/                 # Movie poster images (odyssey, avengers, etc.)
├── src/                        # Backend source code
│   ├── app.js                  # Express app initialization, static serving & error handlers
│   ├── config/
│   │   └── db.js               # PostgreSQL connection pool configuration
│   ├── controllers/
│   │   ├── auth.controller.js  # Register, Login, Refresh Token & Logout handlers
│   │   └── seat.controller.js  # Get seats & Transactional seat booking logic
│   ├── middlewares/
│   │   └── auth.middleware.js  # JWT authentication verification middleware
│   ├── routes/
│   │   ├── auth.routes.js      # Auth API endpoints (/register, /login, /refresh-token, /logout)
│   │   └── seat.routes.js      # Seat booking API endpoints (/seats, /seats/:movie/:id)
│   └── utils/
│       ├── APIError.js         # Custom operational error class
│       └── APIResponse.js      # Standardized API response formatter
├── index.js                    # Application entry point (Server listener)
├── seed.js                     # SQL schema queries for database setup
├── package.json                # Project dependencies & scripts
└── README.md                   # Project documentation
```

---

## ⚡ Setup & Local Installation

### Prerequisites
Make sure you have installed:
* [Node.js](https://nodejs.org/) (v18 or higher)
* [PostgreSQL](https://www.postgresql.org/) (Local instance or cloud instance like Supabase/Neon/Render)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/Mehtab-786/steller-max-book-my-ticket.git
cd steller-max-book-my-ticket
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Create a `.env` file in the root directory:

```env
PORT=8080
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/yourdb?sslmode=disable
SALT=10

ACCESS_SECRET=your_access_token_secret_key_here
REFRESH_SECRET=your_refresh_token_secret_key_here
ACCESS_SECRET_EXPIRY=15m
REFRESH_SECRET_EXPIRY=7d

NODE_ENV=development
```

---

### Step 4: Database Setup & Seeding

Run the following SQL commands in your PostgreSQL database (or execute the statements from `seed.js`):

```sql
-- 1. Create Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Movie Seat Tables (100 seats per movie)
-- Movie 1: Odyssey
CREATE TABLE odyssey (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    isbooked INT DEFAULT 0
);
INSERT INTO odyssey(isbooked) SELECT 0 FROM generate_series(1, 100);

-- Movie 2: Dhurandhar
CREATE TABLE dhurandhar (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    isbooked INT DEFAULT 0
);
INSERT INTO dhurandhar(isbooked) SELECT 0 FROM generate_series(1, 100);

-- Movie 3: Avengers
CREATE TABLE avengers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    isbooked INT DEFAULT 0
);
INSERT INTO avengers(isbooked) SELECT 0 FROM generate_series(1, 100);

-- Movie 4: Sholay
CREATE TABLE sholay (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    isbooked INT DEFAULT 0
);
INSERT INTO sholay(isbooked) SELECT 0 FROM generate_series(1, 100);
```

---

### Step 5: Start the Local Development Server
```bash
npm run dev
```

Open your browser and navigate to:
```text
http://localhost:8080
```

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Register a new user account | ❌ No |
| `POST` | `/login` | Authenticate user & set JWT cookies | ❌ No |
| `POST` | `/refresh-token` | Renew access token via refresh token | ❌ No |
| `POST` | `/logout` | Clear user cookies & end session | 🔒 Yes |
| `GET` | `/seats?movie=:movieName` | Fetch all seats for a movie | ❌ No |
| `PUT` | `/seats/:movie/:id` | Book a specific seat | 🔒 Yes |

---

## 🔒 Security & Concurrency Design

- **Double Booking Prevention**: Uses `SELECT * FROM <movie> WHERE id = $1 AND isbooked = 0 FOR UPDATE` inside a database transaction block. Concurrent requests for the same seat are serialized by PostgreSQL row locks.
- **XSS Protection**: Tokens are stored strictly in `HttpOnly` cookies, preventing malicious client-side scripts from reading authentication secrets.
- **SQL Injection Prevention**: All queries use parameterized values (`$1`, `$2`).

---

## 🤝 Author
Crafted by **Mehtab**  
Website: [mehtabhussain.tech](https://mehtabhussain.tech)
