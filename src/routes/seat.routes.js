import authMiddleware from "../middlewares/auth.middleware.js";
import { bookSeat, getSeatsByMovie } from "../controllers/seat.controller.js";
import { Router } from "express";

const router = Router()

// book a seat give the seatId and your name
router.put("/seats/:movie/:id", authMiddleware, bookSeat);

// get all seats as per specific movie
router.get('/seats', getSeatsByMovie)

export default router;
