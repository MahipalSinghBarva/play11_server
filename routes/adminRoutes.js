const express = require("express");
const { registerAdmin, loginAdmin, getAllUser, unblockUser, blockUser } = require("../controller/userController");
const { isAdmin } = require("../middleware/isAdmin");

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.get("/get-all", getAllUser);
router.put("/user/:userId/block", blockUser);
router.put("/user/:userId/unblock", unblockUser);

module.exports = router;