const catchAsync = require("../utils/catchAsync");
const subscriptionPlanService = require("../services/subscriptionPlan.service");
const { OK, BAD_REQUEST } = require("../configs/response.config");
const ErrorWithStatus = require("../utils/errorWithStatus");

class SubscriptionPlanController {
  create = catchAsync(async (req, res) => {
    try {
      const plan = await subscriptionPlanService.createSubscriptionPlan(
        req.body
      );
      return OK(res, "Subscription plan created successfully", { plan });
    } catch (error) {
      return BAD_REQUEST(
        res,
        "Error creating subscription plan: " + error.message
      );
    }
  });

  getAll = catchAsync(async (req, res) => {
    try {
      const packages = await subscriptionPlanService.getAll();
      return OK(res, "Get all subscription plans successfully", { packages });
    } catch (error) {
      return BAD_REQUEST(res, error.message);
    }
  });

  getById = catchAsync(async (req, res) => {
    try {
      const plan = await subscriptionPlanService.getById(req.params.id);
      if (!plan) {
        throw new ErrorWithStatus({
          status: 404,
          message: "Subscription plan not found",
        });
      }
      return OK(res, "Get subscription plan by id successfully", plan);
    } catch (error) {
      return BAD_REQUEST(res, error.message);
    }
  });

  update = catchAsync(async (req, res) => {
    try {
      const plan = await subscriptionPlanService.update(
        req.params.id,
        req.body
      );
      if (!plan) {
        throw new ErrorWithStatus({
          status: 404,
          message: "Subscription plan not found",
        });
      }
      return OK(res, "Subscription plan updated successfully", { plan });
    } catch (error) {
      return BAD_REQUEST(res, error.message);
    }
  });

  delete = catchAsync(async (req, res) => {
    try {
      const plan = await subscriptionPlanService.delete(req.params.id);
      if (!plan) {
        throw new ErrorWithStatus({
          status: 404,
          message: "Subscription plan not found",
        });
      }
      return OK(res, "Subscription plan deleted successfully");
    } catch (error) {
      return BAD_REQUEST(res, error.message);
    }
  });
}

module.exports = new SubscriptionPlanController();
