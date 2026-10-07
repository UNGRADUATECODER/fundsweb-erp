const express = require("express");

const {
  createCustomer,
  getCustomers,
} = require("../controllers/customerController");

const { authenticate } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authenticate, createCustomer);
router.get("/", authenticate, getCustomers);

module.exports = router;