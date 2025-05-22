const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authMiddleware, restrictTo } = require("../middlewares/authMiddleware");

router.get(
  "/all",
  authMiddleware,
  restrictTo("admin"),
  userController.getAllUser
);
router.get("/profile/me", authMiddleware, userController.profile);
router.put("/update-profile", authMiddleware, userController.updateInfo);
router.put("/change-password", authMiddleware, userController.changePassword);
router.get("/profile", authMiddleware, userController.getProfile);
router.put("/profile", authMiddleware, userController.updateProfile);

router.put("/avatar", authMiddleware, userController.updateAvatar);

router.get("/:id", authMiddleware, userController.getUserById);

module.exports = router;
