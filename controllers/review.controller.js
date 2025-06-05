const ReviewService = require("../services/review.service");

class ReviewController {
    async createReview(req, res) {
        try {
            const { productId, comment, rating } = req.body;
            const userId = req.user.id;

            if (!productId || !comment || !rating) {
                return res.status(400).json({
                    success: false,
                    message: "Missing required fields",
                });
            }
            if (rating < 1 || rating > 5) {
                return res.status(400).json({
                    success: false,
                    message: "Rating must be between 1 and 5",
                });
            }
            const review = await ReviewService.createReview(userId, productId, { comment, rating });
            return res.status(201).json({
                success: true,
                message: "Review created successfully",
                data: review,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    async getReviewsByProductId(req, res) {
        try {
            const { productId } = req.params;
            const { page = 1, limit = 10 } = req.query;

            if (!productId) {
                return res.status(400).json({
                    success: false,
                    message: "Product ID is required",
                });
            }
            const data = await ReviewService.getReviewsByProductId(productId, page, limit);
            return res.status(200).json({
                success: true,
                message: "Reviews fetched successfully",
                data,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    async getReviewsByUserId(req, res) {
        try {
            const userId = req.user.id;
            const { page = 1, limit = 10 } = req.query;

            const data = await ReviewService.getReviewsByUserId(userId, page, limit);
            return res.status(200).json({
                success: true,
                message: "Reviews fetched successfully",
                data,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    async deleteReview(req, res) {
        try {
            const { reviewId } = req.params;
            const userId = req.user.id;
            const userRole = req.user.role;

            const data = await ReviewService.deleteReview(userId, reviewId, userRole);
            return res.status(200).json({
                success: true,
                message: "Review deleted successfully",
                data,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
}
module.exports = new ReviewController();