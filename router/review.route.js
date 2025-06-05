const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");
const { authMiddleware, restrictTo } = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, restrictTo("user"), reviewController.createReview);
router.get("/user", authMiddleware, restrictTo("user"), reviewController.getReviewsByUserId);
router.delete("/:reviewId", authMiddleware, restrictTo("user"), reviewController.deleteReview);

router.get("/product/:productId", reviewController.getReviewsByProductId);

module.exports = router;