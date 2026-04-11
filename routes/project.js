const express = require("express")
const router = express.Router()

const upload = require("../middleware/multer")
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject
} = require("../controller/project")

router.post("/projects", upload.array("images", 5), createProject)
router.get("/projects", getProjects)
router.get("/projects/:id", getProjectById)
router.put("/projects/:id",  upload.array("images", 5), updateProject)
router.delete("/projects/:id", deleteProject)

module.exports = router
