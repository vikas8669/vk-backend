const express = require("express")
const router = express.Router()
const { verifyToken, adminOnly } = require("../middleware/auth")

const {
  createOrder,
  verifyPayment,
  downloadPurchasedProject,
  getUserPurchases,
  getAdminDashboard,
  getAdminPurchases,
  razorpayWebhook
} = require("../controller/razorpay")

router.post("/create-order", createOrder)
router.post("/verify-payment", verifyPayment)
router.get("/payment/download/:token", downloadPurchasedProject)
router.get("/purchases", getUserPurchases)
router.get("/admin/dashboard", verifyToken, adminOnly, getAdminDashboard)
router.get("/admin/purchases", verifyToken, adminOnly, getAdminPurchases)
router.post("/payment/webhook", razorpayWebhook)

module.exports = router
