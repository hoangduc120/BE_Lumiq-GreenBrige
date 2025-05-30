const { min } = require("moment");
const mongoose = require("mongoose");
const voucherSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      minlength: [4, "Code must be at least 4 characters"], // Tối thiểu 4 ký tự
    },
    discountType: { type: String, enum: ["percent", "fixed"], required: true },
    discountValue: { type: Number, required: true },
    productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    minOrderValue: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          // Khi update, this là query, cần lấy startDate từ update payload hoặc từ document
          if (this instanceof mongoose.Query) {
            const update = this.getUpdate();
            const startDate = update.startDate;
            const endDate = value;
            // Nếu không có startDate mới, lấy từ document hiện tại
            if (!startDate) {
              // Không thể lấy document hiện tại ở đây, nên bỏ qua, validator sẽ chạy lại khi save
              return true;
            }
            return new Date(endDate) > new Date(startDate);
          } else {
            // Khi create hoặc save thông thường
            return value > this.startDate;
          }
        },
        message: "End date must be after start date",
      },
    },
    usageLimit: { type: Number, default: 0 },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    subscriptionPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Voucher", voucherSchema);
