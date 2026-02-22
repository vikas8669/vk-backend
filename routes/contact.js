const express = require("express")
const router = express.Router()

const { contact, getAllContact, getContactAnalytics } = require("../controller/contactUs")
const {  verifyToken, adminOnly  } = require("../middleware/auth")

router.post("/contact", contact)
router.get("/contact", getAllContact)
router.get("/contact/analytics", verifyToken, adminOnly, getContactAnalytics)

module.exports = router