const express = require("express")
const router = express.Router()
const { addReview, getReviewsByProject } = require("../controller/review")

router.post("/", addReview)
router.get("/:projectId", getReviewsByProject)

module.exports = router
