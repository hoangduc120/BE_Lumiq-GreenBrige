const express = require("express");
const router = express.Router();

const userRoute = require("./user.route");
const authRoute = require("./auth.route");
const productRoute = require("./produciRoute");
const paymentRoute = require("./payment.route");
const uploadRoute = require("./upload.route");

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
    path: "/upload",
    route: uploadRoute,
  },
  {
    path: "/blog",
    route: require("./blog.route"),
  }
];

routes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
