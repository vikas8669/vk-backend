const express = require("express")
const router = express.Router()

const { contact, getAllContact, getContactAnalytics, markRead, sendReply } = require("../controller/contactUs")
const {  verifyToken, adminOnly  } = require("../middleware/auth")

router.post("/contact", contact)
router.get("/contact", getAllContact)
router.get("/contact/analytics", verifyToken, adminOnly, getContactAnalytics)
router.patch("/contact/:id/mark-read", verifyToken, adminOnly, markRead)
router.patch("/contact/:id/reply", verifyToken, adminOnly, sendReply)
module.exports = router