const express = require("express");
const router = express.Router();
const { authMiddleware, restrictTo } = require("../middlewares/authMiddleware");
const voucherController = require("../controllers/voucher.controller");

// Only admin can CRUD
router.post("/", authMiddleware, restrictTo("admin"), voucherController.create);
router.get("/", authMiddleware, restrictTo("admin"), voucherController.getAll);
router.get("/:id", authMiddleware, voucherController.getById);
router.get("/code/:code", authMiddleware, voucherController.getByCode);
router.put(
  "/:id",
  authMiddleware,
  restrictTo("admin"),
  voucherController.update
);
router.delete(
  "/:id",
  authMiddleware,
  restrictTo("admin"),
  voucherController.delete
);

// User can get available vouchers
router.get(
  "/available/user",
  authMiddleware,
  voucherController.getAvailableForUser
);

module.exports = router;
