const User = require('../models/userModel.js');
const jwt = require('jsonwebtoken');
const catchAsyncError = require('../utils/catchAsyncError.js');
const { ErrorHandler } = require('../middleware/error.js');

exports.isAuthenticated = catchAsyncError(async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return next(new ErrorHandler("Please login to access this resource", 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        // console.log("Decoded JWT:", decoded);

        if (!user || user.isBlocked) {
            return res.status(403).json({ message: "Access denied: User blocked" });
        }

        next();
    } catch (error) {
        return next(new ErrorHandler("Invalid or expired token", 401));
    }
}); 