const express = require('express');
const { verifyOtp, sendOTP, updateProfile, getAllUser, getSingleUser } = require('../controller/userController');
const { isAuthenticated } = require('../middleware/auth.js');

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router()


router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOtp);
router.post('/profile/update', upload.fields([
    { name: 'profilePicture', maxCount: 1 },
    { name: 'aadharCardImage', maxCount: 1 },
]), isAuthenticated, updateProfile);
router.get('/:id', getSingleUser);






module.exports = router;
