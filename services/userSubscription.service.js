const UserSubscription = require("../schema/userSubscription.model");
const SubscriptionPlan = require("../schema/subscriptionPlan.model");
const User = require("../schema/user.model");
const Voucher = require("../schema/voucher.model");
const ErrorWithStatus = require("../utils/errorWithStatus");
const { StatusCodes } = require("http-status-codes");

class UserSubscriptionService {
  async register(userId, planId) {
    // Kiểm tra nếu đã đăng ký gói này và còn hiệu lực thì không cho đăng ký nữa
    const now = new Date();
    const existed = await UserSubscription.findOne({
      userId,
      subscriptionPlanId: planId,
      endDate: { $gt: now },
    });
    if (existed) {
      throw new ErrorWithStatus({
        status: StatusCodes.BAD_REQUEST,
        message: "Bạn đã đăng ký gói này và còn hiệu lực!",
      });
    }
    // Lấy thông tin gói
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      throw new ErrorWithStatus({
        status: StatusCodes.NOT_FOUND,
        message: "Subscription plan not found",
      });
    }
    // Lấy voucherId nếu có voucherCode
    let voucherIds = [];
    if (plan.voucherCode) {
      const voucher = await Voucher.findOne({ code: plan.voucherCode });
      if (voucher) {
        voucherIds.push(voucher._id);
      }
    }
    // Tạo subscription mới
    const durationDays = plan.duration;
    const startDate = now;
    const endDate = new Date(
      now.getTime() + durationDays * 24 * 60 * 60 * 1000
    );
    const userSub = await UserSubscription.create({
      userId,
      subscriptionPlanId: plan._id,
      aiFreeUsageLeft: plan.aiFreeUsage,
      startDate,
      endDate,
      voucherIds,
    });
    // Cộng thêm số lần freeUsage vào user
    await User.findByIdAndUpdate(userId, {
      $inc: { freeUsageCount: plan.aiFreeUsage },
    });
    return {
      subscription: userSub,
      // plan,
    };
  }
}

module.exports = new UserSubscriptionService();
