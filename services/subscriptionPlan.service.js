const SubscriptionPlan = require("../schema/subscriptionPlan.model");
const ErrorWithStatus = require("../utils/errorWithStatus");
const { StatusCodes } = require("http-status-codes");

class SubscriptionPlanService {
  async createSubscriptionPlan(subscriptionPlanData) {
    try {
      const { name, price, duration, aiFreeUsage, voucherId } =
        subscriptionPlanData;

      if (!name || !price || !duration) {
        throw new ErrorWithStatus({
          status: StatusCodes.BAD_REQUEST,
          message: "Missing required fields",
        });
      }
      return await SubscriptionPlan.create(subscriptionPlanData);
    } catch (error) {
      throw new ErrorWithStatus({
        status: StatusCodes.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async getAll() {
    try {
      return await SubscriptionPlan.find();
    } catch (error) {
      throw new ErrorWithStatus({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }

  async getById(id) {
    try {
      const plan = await SubscriptionPlan.findById(id);
      if (!plan) {
        throw new ErrorWithStatus({
          status: StatusCodes.NOT_FOUND,
          message: "Subscription plan not found",
        });
      }
      return plan;
    } catch (error) {
      throw new ErrorWithStatus({
        status: StatusCodes.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async update(id, data) {
    try {
      const plan = await SubscriptionPlan.findByIdAndUpdate(id, data, {
        new: true,
      });
      if (!plan) {
        throw new ErrorWithStatus({
          status: StatusCodes.NOT_FOUND,
          message: "Subscription plan not found",
        });
      }
      return plan;
    } catch (error) {
      throw new ErrorWithStatus({
        status: StatusCodes.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async delete(id) {
    try {
      const plan = await SubscriptionPlan.findByIdAndDelete(id);
      if (!plan) {
        throw new ErrorWithStatus({
          status: StatusCodes.NOT_FOUND,
          message: "Subscription plan not found",
        });
      }
      return plan;
    } catch (error) {
      throw new ErrorWithStatus({
        status: StatusCodes.BAD_REQUEST,
        message: error.message,
      });
    }
  }
}

module.exports = new SubscriptionPlanService();
