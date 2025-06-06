const Product = require("../schema/product.model");
const User = require("../schema/user.model");
const Review = require("../schema/review.model");

class ReviewService {
    async createReview(userId, productId, { comment, rating }) {
        try {
            const product = await Product.findById(productId);
            if (!product) {
                throw new Error("Product not found");
            }
            const user = await User.findById(userId);
            if (!user) {
                throw new Error("User not found");
            }

            const existingReview = await Review.findOne({ author: userId, product: productId });
            if (existingReview) {
                throw new Error("You have already reviewed this product");
            }
            const review = new Review({
                comment,
                author: userId,
                product: productId,
                rating,
            });
            await review.save();
            product.reviews.push(review._id);
            await product.save();
            return await review.populate([
                {
                    path: "author",
                    select: "name email avatar",
                },
                {
                    path: "product",
                    select: "name",
                }
            ])
        } catch (error) {
            throw new Error("Failed to create review");
        }
    }
    async getReviewsByProductId(productId, page = 1, limit = 10) {
        try {
            const product = await Product.findById(productId)
            if (!product) {
                throw new Error("Product not found");
            }

            const reviews = await Review.find({ product: productId })
                .populate([
                    {
                        path: "author",
                        select: "name email avatar",
                    },
                    {
                        path: "product",
                        select: "name",
                    }
                ])
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit);

            const totalReviews = await Review.countDocuments({ product: productId });
            const totalPages = Math.ceil(totalReviews / limit);
            return {
                reviews,
                totalPages,
                currentPage: page,
                totalReviews,
            };
        } catch (error) {
            throw new Error("Failed to get reviews");
        }
    }
    async getReviewsByUserId(userId, page = 1, limit = 10) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error("User not found");
            }
            const reviews = await Review.find({ author: userId })
                .populate([
                    {
                        path: "product",
                        select: "name",
                    },
                    {
                        path: "author",
                        select: "name email avatar",
                    }
                ])
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit);
            const totalReviews = await Review.countDocuments({ author: userId });
            const totalPages = Math.ceil(totalReviews / limit);
            return {
                reviews,
                totalPages,
                currentPage: page,
                totalReviews,
            }
        } catch (error) {
            throw new Error("Failed to get reviews");
        }
    }
    async deleteReview(userId, reviewId, role = "user") {
        try {
            const review = await Review.findById(reviewId);
            if (!review) {
                throw new Error("Review not found");
            }
            if (review.author.toString() !== userId && role !== "admin") {
                throw new Error("You are not authorized to delete this review");
            }

            const product = await Product.findById(review.product);
            if (product) {
                product.reviews = product.reviews.filter(id => id.toString() !== reviewId);
                await product.save();
            }
            await Review.findByIdAndDelete(reviewId);
            return {
                message: "Review deleted successfully",
            }
        } catch (error) {
            throw new Error("Failed to delete review");
        }
    }
}

module.exports = new ReviewService();