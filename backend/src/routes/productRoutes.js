const express = require("express");

const {
  createProduct,
  getProducts,
} = require("../controllers/productController");

const { authenticate } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authenticate, createProduct);
router.get("/", authenticate, getProducts);

module.exports = router;