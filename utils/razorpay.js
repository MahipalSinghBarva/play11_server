const Razorpay = require("razorpay")
const dotenv = require("dotenv")
dotenv.config()

// const keyid = process.env.RAZORPAY_KEY_ID;
// const secret = process.env.RAZORPAY_SECRET_ID
// console.log(keyid, secret)

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET_ID,
    headers: {
        "X-Razorpay-Account": process.env.RAZORPAY_MERCHANT_ID
    }
})

module.exports = razorpay