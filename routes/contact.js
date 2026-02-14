const express = require("express")
const router = express.Router()

const { contact, getAllContact } = require("../controller/contactUs")

router.post("/contact", contact)
router.get("/contact", getAllContact)


module.exports = router