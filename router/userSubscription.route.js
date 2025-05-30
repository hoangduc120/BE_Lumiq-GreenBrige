const express = require("express");
const router = express.Router();
const { authMiddleware, restrictTo } = require("../middlewares/authMiddleware");
const userSubscriptionController = require("../controllers/userSubscription.controller");

router.post("/:id/register", authMiddleware, userSubscriptionController.registerPackage);

module.exports = router;
