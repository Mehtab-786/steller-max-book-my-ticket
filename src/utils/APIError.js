class APIError extends Error {
    constructor(message, statusCode, error = "") {
        super(message)
        this.statusCode = statusCode
        this.isOperational = true
        Error.captureStackTrace(this, this.constructor)
    }

    static badRequest(message = "Bad request") {
        return new APIError(message, 400)
    }
    static unauthorized(message = "Unauthorized") {
        return new APIError(message, 401)
    }

    static internalError(message = "Internal Server Error") {
        return new APIError(message, 500)
    }

    static notFound(message = "Not Found") {
        return new APIError(message, 404)
    }

    static forbidden(message = "Forbidden") {
        return new APIError(message, 403)
    }

    static conflict(message = "Conflict") {
        return new APIError(message, 409)
    }

}

export default APIError;