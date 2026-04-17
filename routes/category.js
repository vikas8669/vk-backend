const express = require("express")
const router = express.Router()
const { getCategories, createCategory, updateCategory, deleteCategory } = require("../controller/category")
const { verifyToken, adminOnly } = require("../middleware/auth")

router.get("/categories", getCategories)

// Admin only
router.post("/categories", verifyToken, adminOnly, createCategory)
router.put("/categories/:id", verifyToken, adminOnly, updateCategory)
router.delete("/categories/:id", verifyToken, adminOnly, deleteCategory)

module.exports = router
