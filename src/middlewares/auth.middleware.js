import JWT from "jsonwebtoken"
import APIError from "../utils/APIError.js"

async function authMiddleware(req, res, next) {
    try {
        const { access_token } = req.cookies

        if (!access_token) {
            throw APIError.unauthorized("You must be logged in")
        }

        let decoded = JWT.verify(access_token, process.env.ACCESS_SECRET)

        req.user = decoded.id
        next()
    }
    catch (error) {
        if (error.name === "TokenExpiredError") {
            return next(APIError.unauthorized("Access token expired"));
        }

        return next(APIError.badRequest("Invalid access token, Login again !"));
    }
}

export default authMiddleware;