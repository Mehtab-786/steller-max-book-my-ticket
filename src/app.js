import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import seatRoutes from "./routes/seat.routes.js";
import express from "express";
import cors from 'cors'
import APIError from "./utils/APIError.js";

const app = new express();

// public files
app.use(express.static('public'));

// built-in middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser())


// routes
app.use('/', authRoutes)
app.use('/', seatRoutes)

app.use((err, req, res, next) => {

    if (err instanceof APIError) {

        return res.status(err.statusCode).json({
            success: false,
            code: err.code,
            message: err.message,
            details: err.details
        });
    }

    console.error(err);

    return res.status(500).json({
        success: false,
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong"
    });
});

export default app;
