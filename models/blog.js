const mongoose = require("mongoose")

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    category: {
      type: String,
      default: "General",
      trim: true
    },
    tags: [String],
    image: {
      public_id: { type: String, default: "" },
      url: { type: String, default: "" }
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    featured: {
        type: Boolean,
        default: false
    },
    author: {
      type: String,
      default: "Admin"
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model("Blog", blogSchema)
