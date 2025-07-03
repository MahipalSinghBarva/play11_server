const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const otpSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
});


otpSchema.pre('save', async function (next) {
    if (!this.isModified('otp')) return next();
    const salt = await bcrypt.genSalt(10);
    this.otp = await bcrypt.hash(this.otp, salt);
    next();
});
otpSchema.methods.compareOtp = async function (enteredOtp) {
    return await bcrypt.compare(enteredOtp, this.otp);
};

module.exports = mongoose.model("Otp", otpSchema);
