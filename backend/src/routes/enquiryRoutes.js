const express = require("express");

const {
  createEnquiry,
  getEnquiries,
} = require("../controllers/enquiryController");

const { authenticate } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authenticate, createEnquiry);
router.get("/", authenticate, getEnquiries);

module.exports = router;