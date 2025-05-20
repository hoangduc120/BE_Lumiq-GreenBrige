const express = require("express");
const router = express.Router();

const userRoute = require("./user.route");
const authRoute = require("./auth.route");
const productRoute = require("./product.route");
const paymentRoute = require("./payment.route");
const orderRoute = require("./order.route");
const cartRoute = require("./cart.route");

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
    path: "/payment",
    route: paymentRoute,
  },
  {
    path: "/orders",
    route: orderRoute,
  },
  {
    path: "/cart",
    route: cartRoute,
  },
];

routes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
