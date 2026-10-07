const express = require("express");

const {
  createDispatch,
  getDispatches,
} = require("../controllers/dispatchController");

const { authenticate } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authenticate, createDispatch);
router.get("/", authenticate, getDispatches);

module.exports = router;