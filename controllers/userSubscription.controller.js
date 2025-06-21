const catchAsync = require("../utils/catchAsync");
const userSubscriptionService = require("../services/userSubscription.service");
const { OK, BAD_REQUEST } = require("../configs/response.config");

class UserSubscriptionController {
  registerPackage = catchAsync(async (req, res) => {
    try {
      const userId = req.user.id;

      const planId = req.params.id;
      // Log kiểm tra
      console.log("planId:", planId);
      const result = await userSubscriptionService.register(userId, planId);
      return OK(res, "Đăng ký gói thành công", result);
    } catch (error) {
      return BAD_REQUEST(res, error.message);
    }
  });
}

module.exports = new UserSubscriptionController();
