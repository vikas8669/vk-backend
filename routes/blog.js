const express = require("express")
const router = express.Router()
const multer = require("multer")
const upload = multer({ dest: "uploads/" })

const { 
  createBlog, 
  getBlogs, 
  getBlogBySlug, 
  updateBlog, 
  deleteBlog 
} = require("../controller/blog")
const { verifyToken, adminOnly } = require("../middleware/auth")

// Public routes
router.get("/blogs", getBlogs)
router.get("/blogs/:slug", getBlogBySlug)

// Admin routes (Protected)
router.post("/blogs", verifyToken, adminOnly, upload.single("image"), createBlog)
router.put("/blogs/:id", verifyToken, adminOnly, upload.single("image"), updateBlog)
router.delete("/blogs/:id", verifyToken, adminOnly, deleteBlog)

module.exports = router
