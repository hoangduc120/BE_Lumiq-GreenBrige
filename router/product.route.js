const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/product.controller");
const Product = require("../schema/product.model");
const generateQRCode = require("../utils/generateQR");
const multer = require("multer"); // Add multer for parsing multipart/form-data
const upload = multer();
const mongoose = require("mongoose");
const cloudinary = require("../configs/cloudinary.config"); // Ensure you have cloudinary configured

router.post("/create", ProductController.createProduct);

router.post("/", upload.none(), async (req, res) => {
  try {
    const {
      productName,
      description,
      unitsAvailable,
      price,
      categories,
      photos,
      plantedAt,
      gardener,
    } = req.body;

    if (
      !productName ||
      !description ||
      !unitsAvailable ||
      !price ||
      !categories ||
      !photos ||
      !plantedAt ||
      !gardener
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const parsedCategories =
      typeof categories === "string" ? JSON.parse(categories) : categories;
    const parsedPhotos =
      typeof photos === "string" ? JSON.parse(photos) : photos;

    const formattedPhotos = parsedPhotos.map((photo) => {
      if (typeof photo === "string") {
        const urlParts = photo.split("/");
        const publicId = urlParts.slice(-2).join("/"); // Approximate public_id from URL
        return { url: photo, public_id: publicId };
      }
      return photo; // Already an object with url and public_id
    });

    const gardenerObjectId = mongoose.Types.ObjectId.isValid(gardener)
      ? new mongoose.Types.ObjectId(gardener)
      : null;

    if (!gardenerObjectId) {
      return res.status(400).json({ error: "Invalid gardener UID" });
    }

    const newPlant = {
      name: productName,
      description,
      gardener: gardenerObjectId,
      plantedAt: new Date(plantedAt),
      lastInspected: null,
      unitsAvailable: parseInt(unitsAvailable),
      price: parseFloat(price),
      categories: parsedCategories,
      photos: formattedPhotos,
    };

    const qrImage = await generateQRCode(newPlant._id); // Ensure this function exists
    newPlant.qrCode = qrImage;

    const savedPlant = await Product.create(newPlant);

    res
      .status(201)
      .json({ message: "Plant added successfully", data: savedPlant });
  } catch (err) {
    console.error("Error saving plant:", err);
    res
      .status(500)
      .json({ error: "Failed to add plant", details: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId).populate(
      "gardener",
      "name email"
    );
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json(product);
  } catch (err) {
    console.error("Error fetching product:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch product", details: err.message });
  }
});

router.get("/gardener/:gardenerId", async (req, res) => {
  try {
    const gardenerId = req.params.gardenerId;
    const products = await Product.find({ gardener: gardenerId }).populate(
      "gardener",
      "name email"
    );
    if (!products || products.length === 0) {
      return res
        .status(404)
        .json({ error: "No products found for this gardener" });
    }
    res.status(200).json(products);
  } catch (err) {
    console.error("Error fetching products for gardener:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch products", details: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;

  const allowedFields = [
    'name',
    'description',
    'price',
    'plantedAt',
    'categories',
    'photos',
    'image',
    'discount'
  ];

  const updateData = {};
  for (const key of allowedFields) {
    if (req.body[key] !== undefined) {
      updateData[key] = req.body[key];
    }
  }

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (updateData.photos) {
      if (!Array.isArray(updateData.photos)) {
        return res.status(400).json({ error: 'Photos must be an array' });
      }
      for (const photo of updateData.photos) {
        if (!photo.url || !photo.public_id) {
          return res.status(400).json({ error: 'Each photo must have url and public_id' });
        }
      }
    }

    const updated = await Product.findByIdAndUpdate(id, updateData, {
      new: true, 
      runValidators: true, 
    });

    if (!updated) {
      return res.status(500).json({ error: 'Failed to update product' });
    }

    res.json({ message: 'Product updated successfully', data: updated });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Failed to update product', details: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid product ID" });
  }

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Optional: Delete photos from Cloudinary
    const photos = product.photos || [];
    for (const photo of photos) {
      if (photo.public_id) {
        try {
          await cloudinary.uploader.destroy(photo.public_id);
        } catch (err) {
          console.warn("Failed to delete from Cloudinary:", err.message);
        }
      }
    }

    await Product.findByIdAndDelete(id);

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});


router.get("/:id", ProductController.getProductById);
router.post("/address", ProductController.getAddressData);

module.exports = router;
