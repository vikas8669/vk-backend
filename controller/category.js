const Category = require("../models/category")

// Simple slugify utility
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") 
    .replace(/[^\w-]+/g, "") 
    .replace(/--+/g, "-") 
}

exports.createCategory = async (req, res) => {
  try {
    const { name, type } = req.body
    if (!name) return res.status(400).json({ success: false, message: "Name is required" })

    const slug = slugify(name)
    const existing = await Category.findOne({ slug, type })
    if (existing) return res.status(400).json({ success: false, message: "Category already exists for this type" })

    const category = await Category.create({ name, slug, type })
    res.status(201).json({ success: true, data: category })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getCategories = async (req, res) => {
  try {
    const { type } = req.query
    const filter = {}
    if (type) filter.type = type

    const categories = await Category.find(filter).sort({ name: 1 }).lean()
    res.status(200).json({ success: true, data: categories })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params
    const { name } = req.body
    const update = { ...req.body }
    if (name) update.slug = slugify(name)

    const category = await Category.findByIdAndUpdate(id, update, { new: true })
    if (!category) return res.status(404).json({ success: false, message: "Category not found" })

    res.status(200).json({ success: true, data: category })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id)
    if (!category) return res.status(404).json({ success: false, message: "Category not found" })
    res.status(200).json({ success: true, message: "Category deleted" })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
