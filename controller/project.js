const Project = require("../models/project")
const { uploadImage, deleteImage } = require("../utils/cloudinary")

const parseJsonIfPossible = (value) => {
  if (typeof value !== "string") return value
  try {
    return JSON.parse(value)
  } catch (err) {
    return value
  }
}

const normalizeBoolean = (value) => {
  if (typeof value === "boolean") return value
  if (typeof value === "number") return value === 1
  if (typeof value === "string") {
    return value === "true" || value === "1"
  }
  return undefined
}

const isPlainObject = (value) =>
  value && typeof value === "object" && !Array.isArray(value)

const deepMergeObjects = (target = {}, source = {}) => {
  const output = { ...target }

  Object.entries(source).forEach(([key, value]) => {
    if (isPlainObject(value) && isPlainObject(output[key])) {
      output[key] = deepMergeObjects(output[key], value)
      return
    }

    output[key] = value
  })

  return output
}

const buildCustomFields = (body) => {
  const excluded = new Set(["title", "description", "isActive", "customFields", "packageDetails"])
  const dynamicFields = {}

  Object.entries(body || {}).forEach(([key, value]) => {
    if (!excluded.has(key)) dynamicFields[key] = value
  })

  const parsedCustom = parseJsonIfPossible(body.customFields)
  const safeCustom =
    parsedCustom && typeof parsedCustom === "object" && !Array.isArray(parsedCustom)
      ? parsedCustom
      : {}

  return { ...safeCustom, ...dynamicFields }
}






/* ================================
   CREATE PROJECT
================================ */

exports.createProject = async (req, res) => {
  try {
    const { title, description } = req.body

    if (!title) {
      return res.status(400).json({
        message: "Title is required"
      })
    }

    const isActive = normalizeBoolean(req.body.isActive)
    const customFields = buildCustomFields(req.body)

    let images = []

    if (req.files && req.files.length > 0) {
      images = await Promise.all(
        req.files.map((file) => uploadImage(file))
      )
    }

    const payload = {
      title,
      description,
      customFields,
      packageDetails: req.body.packageDetails || "",
      images
    }

    if (typeof isActive !== "undefined") payload.isActive = isActive

    const project = await Project.create(payload)

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project
    })

  } catch (error) {
    console.log("createProject error =>", error)

    res.status(500).json({
      message: "Internal server error",
      error: error.message
    })
  }
}





/* ================================
   GET ALL PROJECTS
================================ */

exports.getProjects = async (req, res) => {
  try {

    const page = Math.max(parseInt(req.query.page || "1", 10), 1)
    const limit = Math.min(Math.max(parseInt(req.query.limit || "10", 10), 1), 100)
    const q = (req.query.q || "").trim()

    const filter = {}

    if (q) {
      filter.title = { $regex: q, $options: "i" }
    }

    const skip = (page - 1) * limit

      const [projects, total] = await Promise.all([
      Project.find(filter)
        // 👇 ADD customFields RIGHT HERE 👇
        .select("title description images isActive createdAt customFields packageDetails") 
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Project.countDocuments(filter)
    ])


    res.status(200).json({
      success: true,
      total,
      page,
      limit,
      data: projects
    })

  } catch (error) {

    console.log("getProjects error =>", error)

    res.status(500).json({
      message: "Internal server error",
      error: error.message
    })
  }
}





/* ================================
   GET PROJECT BY ID
================================ */

exports.getProjectById = async (req, res) => {
  try {

    const { id } = req.params

    const project = await Project.findById(id).lean()

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      })
    }

    res.status(200).json({
      success: true,
      data: project
    })

  } catch (error) {

    console.log("getProjectById error =>", error)

    res.status(500).json({
      message: "Internal server error",
      error: error.message
    })
  }
}





/* ================================
   UPDATE PROJECT
================================ */

exports.updateProject = async (req, res) => {
  try {

    const { id } = req.params

    const project = await Project.findById(id)

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      })
    }

    const { title, description } = req.body

    if (title) project.title = title
    if (typeof description !== "undefined") project.description = description
    if (typeof req.body.packageDetails !== "undefined") project.packageDetails = req.body.packageDetails

    const isActive = normalizeBoolean(req.body.isActive)

    if (typeof isActive !== "undefined") {
      project.isActive = isActive
    }

    const hasExplicitCustomFields = Object.prototype.hasOwnProperty.call(
      req.body || {},
      "customFields"
    )
    const customFields = buildCustomFields(req.body)

    if (hasExplicitCustomFields || Object.keys(customFields).length > 0) {
      project.customFields = deepMergeObjects(project.customFields || {}, customFields)
      project.markModified("customFields")
    }


    /* MULTIPLE IMAGE UPDATE */

    if (req.files && req.files.length > 0) {

      // delete old images
      if (project.images && project.images.length > 0) {
        await Promise.all(
          project.images.map((img) =>
            deleteImage(img.public_id)
          )
        )
      }

      // upload new images
      const images = await Promise.all(
        req.files.map((file) => uploadImage(file))
      )

      project.images = images
    }

    await project.save()

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: project
    })

  } catch (error) {

    console.log("updateProject error =>", error)

    res.status(500).json({
      message: "Internal server error",
      error: error.message
    })
  }
}





/* ================================
   DELETE PROJECT
================================ */

exports.deleteProject = async (req, res) => {
  try {

    const { id } = req.params

    const project = await Project.findById(id)

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      })
    }


    // delete multiple images
    if (project.images && project.images.length > 0) {
      await Promise.all(
        project.images.map((img) =>
          deleteImage(img.public_id)
        )
      )
    }

    await project.deleteOne()

    res.status(200).json({
      success: true,
      message: "Project deleted successfully"
    })

  } catch (error) {

    console.log("deleteProject error =>", error)

    res.status(500).json({
      message: "Internal server error",
      error: error.message
    })
  }
}
