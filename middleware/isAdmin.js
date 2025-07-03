const User = require("../models/userModel.js")

exports.isAdmin = async (req, res, next) => {
    try {
        const user = req.user;

        if (!user || !user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Access denied: Admins only",
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Admin check failed",
        });
    }
};