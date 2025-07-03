const catchAsyncError = require('../utils/catchAsyncError.js');
const { ErrorHandler } = require("../middleware/error.js");
const bcrypt = require("bcryptjs");
const { generateAuthToken } = require('../utils/jwtToken.js');
const User = require('../models/userModel.js');
const Otp = require("../models/otpModel.js")
const { generateOtp, generateUserId, sendOtpSMS } = require('../utils/sendOTP.js');
const { imagekit } = require('../utils/imageKit.js');
const dotenv = require("dotenv")
dotenv.config()


exports.sendOTP = catchAsyncError(async (req, res, next) => {
    const { phone, name } = req.body;
    if (!phone || !name) {
        return next(new ErrorHandler("Phone number and name are required", 400));
    }

    if (phone.isBlocked) {
        return res.status(403).json({
            success: false,
            message: "Your account is blocked. Please contact support.",
        });
    }
    const otp = generateOtp();

    await Otp.findOneAndUpdate(
        { phone },
        { otp, expiresAt: Date.now() + 5 * 60 * 1000 },
        { upsert: true }
    );

    await sendOtpSMS(phone, otp);
    console.log(`OTP for ${phone}: ${otp}`);

    res.status(200).json({ success: true, message: "OTP sent successfully" });
})

exports.verifyOtp = catchAsyncError(async (req, res, next) => {
    const { phone, otp, name } = req.body;
    if (!phone || !otp || !name) return next(new ErrorHandler("Phone, OTP, and name are required", 400));

    const validOtp = await Otp.findOne({ phone });
    if (!validOtp || validOtp.otp !== otp || validOtp.expiresAt < Date.now()) {
        return next(new ErrorHandler("Invalid or expired OTP", 400));
    }

    let user = await User.findOne({ phone });
    if (!user) {
        const userId = generateUserId(name, phone);
        user = await User.create({ name, phone, userId });
    }

    await Otp.deleteOne({ phone });
    user.password = undefined;
    generateAuthToken(user, "Login/Register successful", 200, res);
});

exports.blockUser = catchAsyncError(async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await User.findByIdAndUpdate(userId, { isBlocked: true }, { new: true });

        if (!user) return next(new ErrorHandler("User not found", 400));

        res.json({ success: true, message: "User blocked successfully", user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

exports.unblockUser = catchAsyncError(async (req, res, next) => {
    try {
        const { userId } = req.params;
        const user = await User.findByIdAndUpdate(userId, { isBlocked: false }, { new: true });

        if (!user) return next(new ErrorHandler("User not found", 400));

        res.json({ success: true, message: "User unblocked successfully", user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

exports.updateProfile = catchAsyncError(async (req, res, next) => {
    const { name, email, address, aadharCardNumber } = req.body;
    const userId = req.user._id;
    // console.log("User ID:", userId);

    let profilePicture, aadharCardImage;

    if (req.file) {
        const uploaded = await imagekit.upload({
            file: req.file.buffer,
            fileName: req.file.originalname,
            folder: "play11/user_profiles",
        })
        profilePicture = uploaded.url;
    }

    if (req.files?.aadharCardImage) {
        const uploadedAadhar = await imagekit.upload({
            file: req.files.aadharCardImage[0].buffer,
            fileName: req.files.aadharCardImage[0].originalname,
            folder: "play11/aadhar_cards",
        })
        aadharCardImage = uploadedAadhar.url;
    }

    const updatedFields = { name, email, address, aadharCardNumber };
    if (profilePicture) updatedFields.profilePicture = profilePicture;
    if (aadharCardImage) updatedFields.aadharCardImage = aadharCardImage;

    const user = await User.findByIdAndUpdate(userId, updatedFields, {
        new: true,
        runValidators: true,
    });

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }
    res.status(200).json({
        success: true,
        message: "Profile Updated!",
        user,
    });
})

exports.loginAdmin = catchAsyncError(async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(new ErrorHandler("Email and password are required", 400));
        }

        const admin = await User.findOne({ email, isAdmin: true }).select("+password");
        if (!admin) {
            return next(new ErrorHandler("Admin not found", 404));
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return next(new ErrorHandler("Invalid password", 401));
        }


        admin.password = undefined;

        generateAuthToken(admin, "Admin login successful", 200, res);
    } catch (error) {
        next(error);
    }
})

exports.registerAdmin = catchAsyncError(async (req, res, next) => {
    const { name, phone, email, password, secret } = req.body;

    if (!name || !phone || !email || !password) {
        return next(new ErrorHandler("All fields are required", 400));
    }

    if (secret !== process.env.ADMIN_SECRET_KEY) {
        return next(new ErrorHandler("Unauthorized admin registration", 401));
    }

    const existingAdmin = await User.findOne({ email, isAdmin: true });
    if (existingAdmin) {
        return next(new ErrorHandler("Admin already exists", 400));
    }


    const admin = await User.create({
        name,
        phone,
        email,
        password,
        isAdmin: true,
        userId: `admin-${Date.now()}`
    });

    await admin.save();

    res.status(200).json({
        success: true,
        message: "Admin registered successfully",
        admin
    });
});

exports.getAllUser = catchAsyncError(async (req, res, next) => {
    const user = await User.find({ isAdmin: false });
    res.status(200).json({
        success: true,
        message: "All user fetch successfully",
        user
    })
})

exports.getSingleUser = catchAsyncError(async (req, res, next) => {
    const ID = req.params.id
    const user = await User.findById(ID);
    res.status(200).json({
        success: true,
        message: "User fetch successfully",
        user
    })
})



