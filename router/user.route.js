const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authMiddleware, restrictTo } = require("../middlewares/authMiddleware");


router.get("/all", authMiddleware, restrictTo("admin"),  userController.getAllUser)
router.get("/profile/me", authMiddleware, userController.profile)
router.get("/:id", authMiddleware,  userController.getUserById)
router.put("/update-profile", authMiddleware, userController.updateInfo)
router.put("/change-password", authMiddleware, userController.changePassword)

module.exports = router;
