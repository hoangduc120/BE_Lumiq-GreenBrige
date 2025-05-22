const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/product.controller")


router.post("/create", ProductController.createProduct)

router.get("/all", ProductController.getAllProducts)

router.get("/:id", ProductController.getProductById)
router.post('/address', ProductController.getAddressData);

module.exports = router;