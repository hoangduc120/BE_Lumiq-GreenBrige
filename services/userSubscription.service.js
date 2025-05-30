const UserSubscription = require("../schema/userSubscription.model");
const SubscriptionPlan = require("../schema/subscriptionPlan.model");
const voucherService = require("./voucher.service");
const ErrorWithStatus = require("../utils/errorWithStatus");
const { StatusCodes } = require("http-status-codes");

class UserSubscriptionService {
  async register(userId, planId, voucherCode) {
    // Lấy thông tin gói
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      throw new ErrorWithStatus({
        status: StatusCodes.NOT_FOUND,
        message: "Subscription plan not found",
      });
    }

    // Kiểm tra nếu đã có subscription active
    const now = new Date();
    const existing = await UserSubscription.findOne({
      userId,
      endDate: { $gt: now },
    });
    if (existing) {
      throw new ErrorWithStatus({
        status: StatusCodes.BAD_REQUEST,
        message: "Bạn đã có gói còn hiệu lực",
      });
    }

    // Tính quyền lợi (áp dụng voucher nếu có)
    const { price, aiFreeUsage, voucher } = await this.calculateBenefits(
      plan,
      voucherCode
    );

    // Tạo subscription mới
    const durationDays = plan.duration;
    const startDate = now;
    const endDate = new Date(
      now.getTime() + durationDays * 24 * 60 * 60 * 1000
    );

    const userSub = await UserSubscription.create({
      userId,
      subscriptionPlanId: plan._id,
      voucherId: voucher ? voucher._id : null,
      aiFreeUsageLeft: aiFreeUsage,
      startDate,
      endDate,
    });

    return {
      subscription: userSub,
      plan,
      price,
      voucher: voucher ? voucher.code : null,
    };
  }

  async calculateBenefits(plan, voucherCode) {
    let price = plan.price;
    let aiFreeUsage = plan.aiFreeUsage;
    let voucher = null;
    if (voucherCode) {
      voucher = await voucherService.getByCode(voucherCode);
      if (voucher) {
        if (voucher.discountType === "percent") {
          price = Math.max(0, price - (price * voucher.discountValue) / 100);
        } else if (voucher.discountType === "fixed") {
          price = Math.max(0, price - voucher.discountValue);
        }
      }
    }
    return { price, aiFreeUsage, voucher };
  }
}

module.exports = new UserSubscriptionService();
