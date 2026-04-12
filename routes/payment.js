const express = require("express")
const router = express.Router()

const {
  createOrder,
  verifyPayment,
  getUserPurchases,
  razorpayWebhook
} = require("../controller/razorpay")

router.post("/create-order", createOrder)
router.post("/verify-payment", verifyPayment)
router.get("/purchases", getUserPurchases)
router.post("/payment/webhook", razorpayWebhook)

module.exports = router