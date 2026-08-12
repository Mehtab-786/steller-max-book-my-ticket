import APIError from "../utils/APIError.js";
import APIResponse from "../utils/APIResponse.js";
import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";

let SALT = Number(process.env.SALT) || 10

async function registerUser(req, res) {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
        throw APIError.badRequest("All fields are required!")
    }

    const ifUserExists = await pool.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);

    if (ifUserExists.rowCount > 0) {
        throw APIError.badRequest("Username or email already registered!")
    }

    const hashedPassword = await bcrypt.hash(password, SALT)

    let user;
    try {
        user = await pool.query("INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
            [username, email, hashedPassword]
        )
    } catch (error) {
        throw APIError.internalError("Unable to register User!")
    }


    const User = user.rows[0]

    const refreshToken = JWT.sign({ id: User.id, name: User.username }, process.env.REFRESH_SECRET, {
        expiresIn: process.env.REFRESH_SECRET_EXPIRY
    });

    const accessToken = JWT.sign({ id: User.id, name: User.username }, process.env.ACCESS_SECRET, {
        expiresIn: process.env.ACCESS_SECRET_EXPIRY
    });

    const isProduction = process.env.NODE_ENV === "production";
    const options = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
    }

    res.cookie('refresh_token', refreshToken, { ...options, maxAge: 7 * 24 * 60 * 60 * 1000 })

    res.cookie('access_token', accessToken, { ...options, maxAge: 15 * 60 * 1000 })

    return APIResponse.created(res, "User registered successfully!", {
        username: User.username,
        email: User.email
    })
}

async function loginUser(req, res) {
    const { password, email } = req.body;

    if (!password || !email) {
        throw APIError.badRequest("All fields are required!")
    }

    const ifUserExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (ifUserExists.rowCount === 0) {
        throw APIError.notFound("Invalid email or password")
    }

    const User = ifUserExists.rows[0]

    const isMatch = await bcrypt.compare(password, User.password)
    if (!isMatch) {
        throw APIError.unauthorized("Invalid email or password")
    }

    const refreshToken = JWT.sign({ id: User.id, name: User.username }, process.env.REFRESH_SECRET, {
        expiresIn: process.env.REFRESH_SECRET_EXPIRY
    });

    const accessToken = JWT.sign({ id: User.id, name: User.username }, process.env.ACCESS_SECRET, {
        expiresIn: process.env.ACCESS_SECRET_EXPIRY
    });

    const isProduction = process.env.NODE_ENV === "production";
    const options = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
    }

    res.cookie('refresh_token', refreshToken, { ...options, maxAge: 7 * 24 * 60 * 60 * 1000 })

    res.cookie('access_token', accessToken, { ...options, maxAge: 15 * 60 * 1000 })

    return APIResponse.ok(res, "User logged in successfully!", {
        username: User.username,
        email: User.email
    })
}

async function refreshToken(req, res) {
    const { refresh_token } = req.cookies || {};

    if (!refresh_token) {
        throw APIError.unauthorized("No token provided")
    }

    let decodedToken;

    try {
        decodedToken = await JWT.verify(refresh_token, process.env.REFRESH_SECRET)
    } catch (error) {
        throw APIError.unauthorized("Invalid token")
    }

    const ifUserExists = await pool.query('SELECT * FROM users WHERE id = $1', [decodedToken.id]);

    if (ifUserExists.rowCount === 0) {
        throw APIError.unauthorized("Invalid token")
    }

    const User = ifUserExists.rows[0]

    const accessToken = JWT.sign({ id: User.id, name: User.username }, process.env.ACCESS_SECRET, { expiresIn: process.env.ACCESS_SECRET_EXPIRY });

    const refreshToken = JWT.sign({ id: User.id, name: User.username }, process.env.REFRESH_SECRET, { expiresIn: process.env.REFRESH_SECRET_EXPIRY });

    const isProduction = process.env.NODE_ENV === "production";
    const options = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
    }

    res.cookie('refresh_token', refreshToken, { ...options, maxAge: 7 * 24 * 60 * 60 * 1000 })

    res.cookie('access_token', accessToken, { ...options, maxAge: 15 * 60 * 1000 })

    return APIResponse.ok(res, "Token refreshed successfully!", {
        username: User.username,
        email: User.email
    })
}

async function logoutUser(req, res) {

    const isProduction = process.env.NODE_ENV === "production";
    let options = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
    }

    res.clearCookie("access_token", options)

    res.clearCookie("refresh_token", options)

    return APIResponse.ok(res, "User logged out successfully!", {})
}

export { registerUser, loginUser, refreshToken, logoutUser }
