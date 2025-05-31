const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const User = require("../schema/user.model");
const UserSubscription = require("../schema/userSubscription.model");
const { BAD_REQUEST } = require("../configs/response.config");

// Middleware kiểm tra lượt miễn phí và subscription
async function checkBotUsage(req, res, next) {
  const user = await User.findById(req.user.id);
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  const now = new Date();
  const activeSub = await UserSubscription.findOne({
    userId: user._id,
    endDate: { $gt: now },
  });

  if (activeSub) {
    // Có subscription còn hạn, không giới hạn số lần dùng bot
    return next();
  }

  if (user.freeUsageCount < 10) {
    user.freeUsageCount += 1;
    await user.save();
    return next();
  } else {
    return BAD_REQUEST(res, {
      message:
        "Bạn đã hết lượt miễn phí, vui lòng mua gói để tiếp tục sử dụng.",
    });
  }
}

// Route sử dụng bot
router.post("/ask", authMiddleware, checkBotUsage, async (req, res) => {
  // ...xử lý bot...
  res.json({ message: "Bot trả lời ở đây" });
});

module.exports = router;
