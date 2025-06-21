const catchAsync = require("../utils/catchAsync");
const voucherService = require("../services/voucher.service");
const { OK, BAD_REQUEST } = require("../configs/response.config");
const ErrorWithStatus = require("../utils/errorWithStatus");

class VoucherController {
  create = catchAsync(async (req, res) => {
    try {
      const voucher = await voucherService.create(req.body);
      return OK(res, "Voucher created successfully", { voucher });
    } catch (error) {
      return BAD_REQUEST(res, error.message);
    }
  });

  getAll = catchAsync(async (req, res) => {
    try {
      const vouchers = await voucherService.getAll();
      return OK(res, "Get all vouchers successfully", { vouchers });
    } catch (error) {
      return BAD_REQUEST(res, error.message);
    }
  });

  getById = catchAsync(async (req, res) => {
    try {
      const voucher = await voucherService.getById(req.params.id);
      if (!voucher) {
        throw new ErrorWithStatus({
          status: 404,
          message: "Voucher not found",
        });
      }
      return OK(res, "Get voucher by id successfully", voucher);
    } catch (error) {
      return BAD_REQUEST(res, error.message);
    }
  });

  getByCode = catchAsync(async (req, res) => {
    try {
      const voucher = await voucherService.getByCode(req.params.code);
      if (!voucher) {
        throw new ErrorWithStatus({
          status: 404,
          message: "Voucher not found",
        });
      }
      return OK(res, "Get voucher by code successfully", { voucher });
    } catch (error) {
      return BAD_REQUEST(res, error.message);
    }
  });

  update = catchAsync(async (req, res) => {
    try {
      const voucher = await voucherService.update(req.params.id, req.body);
      if (!voucher) {
        throw new ErrorWithStatus({
          status: 404,
          message: "Voucher not found",
        });
      }
      return OK(res, "Voucher updated successfully", { voucher });
    } catch (error) {
      return BAD_REQUEST(res, error.message);
    }
  });

  delete = catchAsync(async (req, res) => {
    try {
      const voucher = await voucherService.delete(req.params.id);
      if (!voucher) {
        throw new ErrorWithStatus({
          status: 404,
          message: "Voucher not found",
        });
      }
      return OK(res, "Voucher deleted successfully");
    } catch (error) {
      return BAD_REQUEST(res, error.message);
    }
  });

  getAvailableForUser = catchAsync(async (req, res) => {
    try {
      const userId = req.user.id;
      if (!userId) {
        return BAD_REQUEST(res, "Missing userId");
      }
      const vouchers = await voucherService.getAllVouchersOfUser(userId);
      return OK(res, "Get all vouchers of user successfully", { vouchers });
    } catch (error) {
      return BAD_REQUEST(res, error.message);
    }
  });
}

module.exports = new VoucherController();
