const mongoose = require("mongoose")

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true
    },
    type: {
      type: String,
      enum: ["Blog", "Project", "Other"],
      default: "Blog"
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model("Category", categorySchema)
