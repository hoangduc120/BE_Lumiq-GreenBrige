const Voucher = require("../schema/voucher.model");
const UserSubscription = require("../schema/userSubscription.model");
const ErrorWithStatus = require("../utils/errorWithStatus");
const { StatusCodes } = require("http-status-codes");

class VoucherService {
  async create(data) {
    try {
      if (
        !data.code ||
        !data.discountType ||
        !data.discountValue ||
        !data.startDate ||
        !data.endDate
      ) {
        throw new ErrorWithStatus({
          status: StatusCodes.BAD_REQUEST,
          message: "Missing required fields",
        });
      }
      return await Voucher.create(data);
    } catch (error) {
      throw new ErrorWithStatus({
        status: StatusCodes.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async getAll() {
    try {
      return await Voucher.find();
    } catch (error) {
      throw new ErrorWithStatus({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }

  async getById(id) {
    try {
      const voucher = await Voucher.findById(id);
      if (!voucher) {
        throw new ErrorWithStatus({
          status: StatusCodes.NOT_FOUND,
          message: "Voucher not found",
        });
      }
      return voucher;
    } catch (error) {
      throw new ErrorWithStatus({
        status: StatusCodes.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async getByCode(code) {
    try {
      const voucher = await Voucher.findOne({ code });
      if (!voucher) {
        throw new ErrorWithStatus({
          status: StatusCodes.NOT_FOUND,
          message: "Voucher not found",
        });
      }
      return voucher;
    } catch (error) {
      throw new ErrorWithStatus({
        status: StatusCodes.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async update(id, data) {
    try {
      const voucher = await Voucher.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
        context: "query", // Thêm dòng này để validator lấy đúng giá trị update
      });
      if (!voucher) {
        throw new ErrorWithStatus({
          status: StatusCodes.NOT_FOUND,
          message: "Voucher not found",
        });
      }
      return voucher;
    } catch (error) {
      throw new ErrorWithStatus({
        status: StatusCodes.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async delete(id) {
    try {
      const voucher = await Voucher.findByIdAndDelete(id);
      if (!voucher) {
        throw new ErrorWithStatus({
          status: StatusCodes.NOT_FOUND,
          message: "Voucher not found",
        });
      }
      return voucher;
    } catch (error) {
      throw new ErrorWithStatus({
        status: StatusCodes.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async getAllVouchersOfUser(userId) {
    // Lấy tất cả voucherId từ các subscription của user
    const subs = await UserSubscription.find({ userId }).populate("voucherIds");
    return subs.flatMap((sub) => sub.voucherIds).filter((v) => v); // loại bỏ null
  }
}

module.exports = new VoucherService();
