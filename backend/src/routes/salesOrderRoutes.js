const express = require("express");

const {
  createSalesOrder,
  getSalesOrders,
} = require("../controllers/salesOrderController");

const {
  authenticate,
  authorizeRoles,
} = require("../middlewares/authMiddleware");

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorizeRoles("ADMIN", "SALES_USER"),
  createSalesOrder
);

router.get(
  "/",
  authenticate,
  authorizeRoles("ADMIN", "SALES_USER"),
  getSalesOrders
);

module.exports = router;