// --- users table ---
//  CREATE TABLE users(
//     id SERIAL PRIMARY KEY,
//     username VARCHAR(255) NOT NULL UNIQUE,
//     email VARCHAR(255) NOT NULL UNIQUE,
//     password VARCHAR(255) NOT NULL,
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );


// ============ 4 MOVIE TABLES (one per movie, 100 seats each) ============

// --- 1. Odyssey ---
// CREATE TABLE odyssey(
//     id SERIAL PRIMARY KEY,
//     name VARCHAR(255),
//     isbooked INT DEFAULT 0
// );
// INSERT INTO odyssey(isbooked)
// SELECT 0 FROM generate_series(1, 100);

// --- 2. Dhurandhar ---
// CREATE TABLE dhurandhar(
//     id SERIAL PRIMARY KEY,
//     name VARCHAR(255),
//     isbooked INT DEFAULT 0
// );
// INSERT INTO dhurandhar(isbooked)
// SELECT 0 FROM generate_series(1, 100);

// --- 3. Avengers ---
// CREATE TABLE avengers(
//     id SERIAL PRIMARY KEY,
//     name VARCHAR(255),
//     isbooked INT DEFAULT 0
// );
// INSERT INTO avengers(isbooked)
// SELECT 0 FROM generate_series(1, 100);

// --- 4. Sholay ---
// CREATE TABLE sholay(
//     id SERIAL PRIMARY KEY,
//     name VARCHAR(255),
//     isbooked INT DEFAULT 0
// );
// INSERT INTO sholay(isbooked)
// SELECT 0 FROM generate_series(1, 100);
