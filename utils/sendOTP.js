const twilio = require("twilio");
const { v4: uuidv4 } = require('uuid');

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);

exports.sendOtpSMS = async (phone, otp) => {
    const message = `Your OTP is ${otp}`;
    await client.messages.create({
        body: message,
        to: `+91${phone}`,
        from: process.env.TWILIO_PHONE_NUMBER,
    });
};
exports.generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.generateUserId = (name, phone) => {
    const namePart = name.toLowerCase().replace(/\s/g, '').slice(0, 4);
    const phonePart = phone.slice(-4);
    const randomPart = uuidv4().split('-')[0];
    return `${namePart}${phonePart}${randomPart}`;
};