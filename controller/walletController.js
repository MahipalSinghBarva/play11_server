const Wallet = require("../models/walletModel.js")
const razorpay = require("../utils/razorpay.js")
const crypto = require("crypto");
const catchAsyncError = require('../utils/catchAsyncError.js');
const { ErrorHandler } = require("../middleware/error.js");

exports.createOrder = catchAsyncError(async (req, res, next) => {
    const { amount } = req.body;
    if (!amount) {
        return next(new ErrorHandler("Please enter amount to process", 400));
    }

    const options = {
        amount: amount * 100,
        currency: "INR",
        receipt: `wallet_rcpt_${Date.now()}`,
    }

    try {
        const order = await razorpay.orders.create(options)
        res.status(200).json({ success: true, order })
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
})

exports.verifyPayment = catchAsyncError(async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !amount) {
            return res.status(400).json({ success: false, message: "Missing payment verification fields" });
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_SECRET_ID)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Payment verification failed" });
        }

        let wallet = await Wallet.findOne({ user: req.user?._id, userId: req.user?.userId });
        if (!req.user || !req.user._id || !req.user.userId) {
            return res.status(400).json({ success: false, message: "User data missing from request" });
        }


        if (!wallet) {
            wallet = new Wallet({ user: req.user?._id, userId: req.user?.userId, balance: 0, transactions: [] });
        }

        wallet.balance += Number(amount) / 100;
        wallet.transactions.push({
            type: "credit",
            amount: Number(amount) / 100,
            description: "Wallet top-up via Razorpay",
            transactionId: razorpay_payment_id
        });
        // console.log("req.user:", req.user);
        // console.log("req.user._id:", req.user?._id);


        await wallet.save();

        return res.status(200).json({
            success: true,
            message: "Payment verified and wallet updated",
            userId: req.user.userId,
            balance: wallet.balance,
        });
    } catch (err) {
        console.error("Error in verifyPayment:", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message
        });
    }
});


exports.getBalance = catchAsyncError(async (req, res, next) => {
    const wallet = await Wallet.findOne({ user: req.user.id })
    res.status(200).json({ success: true, balance: wallet?.balance || 0 });
})

exports.withdrawAmount = async (req, res) => {
    const { amount } = req.body;

    if (!user.aadharCardImage) return res.status(403).json({ message: "KYC not verified" });
 
    const wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet || wallet.balance < amount) {
        return res.status(400).json({ success: false, message: "Insufficient balance" });
    }

    wallet.balance -= amount;
    wallet.transactions.push({ type: "debit", amount, description: "Withdrawal" });
    await wallet.save();

    res.status(200).json({ success: true, message: "Withdrawal initiated" });
};
