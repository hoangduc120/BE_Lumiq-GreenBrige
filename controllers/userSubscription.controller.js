const catchAsync = require("../utils/catchAsync");
const userSubscriptionService = require("../services/userSubscription.service");
const { OK, BAD_REQUEST } = require("../configs/response.config");

class UserSubscriptionController {
  registerPackage = catchAsync(async (req, res) => {
    try {
      const userId = req.user.id;
      const { planId, voucherCode } = req.body;
      const result = await userSubscriptionService.register(
        userId,
        planId,
        voucherCode
      );
      return OK(res, "Đăng ký gói thành công", result);
    } catch (error) {
      return BAD_REQUEST(res, error.message);
    }
  });
}

module.exports = new UserSubscriptionController();
