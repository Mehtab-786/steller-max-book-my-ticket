import JWT from "jsonwebtoken"
import APIError from "../utils/APIError.js"

async function authMiddleware(req, res, next) {
    const { access_token } = req.cookies || {};

    if (!access_token) {
        return next(APIError.unauthorized("You must be authenticated!"));
    }

    try {
        let decoded = JWT.verify(access_token, process.env.ACCESS_SECRET)

        req.user = decoded
        next()
    }
    catch (error) {
        if (error.name === "TokenExpiredError") {
            return next(APIError.unauthorized("Access token expired"));
        }

        return next(APIError.unauthorized("Invalid access token, Login again !"));
    }
}

export default authMiddleware;