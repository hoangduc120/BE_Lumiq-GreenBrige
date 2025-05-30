const express = require("express");
const router = express.Router();
const controller = require("../controllers/subscriptionPlan.controller");
const { authMiddleware, restrictTo } = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, restrictTo("admin"), controller.create);
router.get("/", authMiddleware, controller.getAll);
router.get("/:id", authMiddleware, controller.getById);
router.put("/:id", authMiddleware, restrictTo("admin"), controller.update);
router.delete("/:id", authMiddleware, restrictTo("admin"), controller.delete);

module.exports = router;
