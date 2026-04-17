const Blog = require("../models/blog")
const { uploadImage, deleteImage } = require("../utils/cloudinary")

// Simple slugify utility
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -
}

/* ================================
   CREATE BLOG
================================ */
exports.createBlog = async (req, res) => {
  try {
    const { title, description, content, category, tags, isPublished, featured } = req.body

    if (!title || !content || !description) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and content are required"
      })
    }

    const slug = slugify(title)
    
    // Check if slug exists
    const existing = await Blog.findOne({ slug })
    if (existing) {
        // Append random string if exists
        req.body.slug = `${slug}-${Math.floor(Math.random() * 1000)}`
    } else {
        req.body.slug = slug
    }

    let imageData = { public_id: "", url: "" }
    if (req.file) {
      const result = await uploadImage(req.file)
      imageData = {
        public_id: result.public_id,
        url: result.url
      }
    }

    const blog = await Blog.create({
      ...req.body,
      image: imageData,
      tags: typeof tags === 'string' ? JSON.parse(tags) : tags
    })

    res.status(201).json({
      success: true,
      message: "Blog post created successfully",
      data: blog
    })
  } catch (error) {
    console.error("createBlog error =>", error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    })
  }
}

/* ================================
   GET ALL BLOGS (Public & Admin)
================================ */
exports.getBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, q, admin = false } = req.query
    const skip = (page - 1) * limit

    const filter = {}
    if (!admin) filter.isPublished = true
    if (category && category !== "All") filter.category = category
    if (q) filter.title = { $regex: q, $options: "i" }

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Blog.countDocuments(filter)
    ])

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: blogs
    })
  } catch (error) {
    console.error("getBlogs error =>", error)
    res.status(500).json({
      success: false,
      message: "Internal server error"
    })
  }
}

/* ================================
   GET BLOG BY SLUG
================================ */
exports.getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params
    const blog = await Blog.findOne({ slug }).lean()

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found"
      })
    }

    res.status(200).json({
      success: true,
      data: blog
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error"
    })
  }
}

/* ================================
   UPDATE BLOG
================================ */
exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params
    const blog = await Blog.findById(id)

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found"
      })
    }

    const { title, tags } = req.body
    if (title && title !== blog.title) {
        blog.slug = slugify(title)
    }

    if (req.file) {
      if (blog.image && blog.image.public_id) {
        await deleteImage(blog.image.public_id)
      }
      const result = await uploadImage(req.file)
      blog.image = {
        public_id: result.public_id,
        url: result.url
      }
    }

    if (tags && typeof tags === 'string') {
        req.body.tags = JSON.parse(tags)
    }

    const updatedBlog = await Blog.findByIdAndUpdate(id, { ...req.body, image: blog.image }, { new: true })

    res.status(200).json({
      success: true,
      message: "Blog post updated successfully",
      data: updatedBlog
    })
  } catch (error) {
    console.error("updateBlog error =>", error)
    res.status(500).json({
      success: false,
      message: "Internal server error"
    })
  }
}

/* ================================
   DELETE BLOG
================================ */
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found"
      })
    }

    if (blog.image && blog.image.public_id) {
      await deleteImage(blog.image.public_id)
    }

    await Blog.findByIdAndDelete(req.params.id)

    res.status(200).json({
      success: true,
      message: "Blog post deleted successfully"
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error"
    })
  }
}
