const Review = require("../models/review")

const addReview = async (req, res) => {
  try {
    const { projectId, userName, userEmail, rating, review } = req.body

    if (!projectId || !userName || !userEmail || !rating || !review) {
      return res.status(400).json({ success: false, message: "All fields are required" })
    }

    const newReview = new Review({
      projectId,
      userName,
      userEmail,
      rating,
      review,
    })

    await newReview.save()

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review: newReview,
    })
  } catch (error) {
    console.error("Error in addReview:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
}

const getReviewsByProject = async (req, res) => {
  try {
    const { projectId } = req.params

    const reviews = await Review.find({ projectId }).sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      reviews,
    })
  } catch (error) {
    console.error("Error in getReviewsByProject:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message })
  }
}

module.exports = {
  addReview,
  getReviewsByProject,
}
