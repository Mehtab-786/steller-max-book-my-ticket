import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { loginUser, logoutUser, refreshToken, registerUser } from "../controllers/auth.controller.js";

const Router = express.Router();

Router.post('/register', registerUser);

Router.post('/login', loginUser);

Router.post('/refresh-token', refreshToken);

Router.post('/logout', authMiddleware, logoutUser);

export default Router;
