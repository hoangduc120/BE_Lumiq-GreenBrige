const express = require("express");
const router = express.Router();

const userRoute = require("./user.route");
const authRoute = require("./auth.route");
const productRoute = require("./product.route");
const paymentRoute = require("./payment.route");
const uploadRoute = require("./upload.route");
const orderRoute = require("./order.route");
const cartRoute = require("./cart.route");
const voucherRoute = require("./voucher.route");
const subscriptionPlanRoute = require("./subscriptionPlan.route");
const userSubscriptionRoute = require("./userSubscription.route");
const botRoute = require("./bot.route");
const reviewRoute = require("./review.route");

const routes = [
  {
    path: "/auth",
    route: authRoute,
  },
  {
    path: "/user",
    route: userRoute,
  },
  {
    path: "/product",
    route: productRoute,
  },
  {
    path: "/category",
    route: require("./category.route"),
  },
  {
    path: "/payment",
    route: paymentRoute,
  },
  {
    path: "/upload",
    route: uploadRoute,
  },
  {
    path: "/blog",
    route: require("./blog.route"),
  },
  {
    path: "/orders",
    route: orderRoute,
  },
  {
    path: "/cart",
    route: cartRoute,
  },
  {
    path: "/voucher",
    route: voucherRoute,
  },
  {
    path: "/subscription-plan",
    route: subscriptionPlanRoute,
  },
  {
    path: "/user/subscription-plan",
    route: userSubscriptionRoute,
  },
  {
    path: "/bot",
    route: botRoute,
  },
  {
    path: "/bank",
    route: require("./bank.route"),
  },
  {
    path: "/review",
    route: reviewRoute,
  }
];

routes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
