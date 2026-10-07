const express = require("express");

const {
  createQuotation,
  getQuotations,
  updateQuotationStatus,
} = require("../controllers/quotationController");

const { authenticate } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authenticate, createQuotation);

router.get("/", authenticate, getQuotations);

router.patch(
  "/:id/status",
  authenticate,
  updateQuotationStatus
);

module.exports = router;