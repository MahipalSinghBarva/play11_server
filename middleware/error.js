class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

const errorMiddleware = (err, req, res, next) => {
    err.message = err.message || "Internal Server Error";
    err.statusCode = err.statusCode || 500;

    if (err.code === 11000) {
        const field = err.keyValue ? Object.keys(err.keyValue)[0] : "field";
        const message = `Duplicate ${field} entered`;
        err = new ErrorHandler(message, 400);
    }
    if (err.name === "jsonWebToken") {
        const message = "JSON Web Token is invalid";
        err = new ErrorHandler(message, 400);
    }
    if (err.name === "TokenExpiredError") {
        const message = "JSON Web Token is Expire";
        err = new ErrorHandler(message, 400);
    }
    if (err.name === "CastError") {
        const message = `Invalid ${err.path}`;
        err = new ErrorHandler(message, 400);
    }

    const errorMessage = err.errors
        ? Object.values(err.errors)
            .map((error) => error.message)
            .join(" ")
        : err.message;
    return res.status(err.statusCode).json({
        success: false,
        message: errorMessage,
    });
};

module.exports = {
    ErrorHandler,
    errorMiddleware
};