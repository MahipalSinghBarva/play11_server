const express = require('express');
const { isAuthenticated } = require('../middleware/auth.js');
const { createOrder, withdrawAmount, getBalance, verifyPayment } = require('../controller/walletController.js');

const router = express.Router();

router.post("/add-amount", isAuthenticated, createOrder)
router.post("/verify-amount", isAuthenticated, verifyPayment)
router.get("/get-amount", isAuthenticated, getBalance)
router.post("/withdraw-amount", isAuthenticated, withdrawAmount)

module.exports = router