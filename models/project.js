const mongoose = require("mongoose")

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    images: [
      {
        public_id: { type: String, default: "" },
        url: { type: String, default: "" },
        width: { type: Number, default: 0 },
        height: { type: Number, default: 0 },
        format: { type: String, default: "" },
        bytes: { type: Number, default: 0 }
      }
    ],
    customFields: { type: mongoose.Schema.Types.Mixed, default: {} },
    packageDetails: { type: String, default: "" },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true, minimize: false }
)

module.exports = mongoose.model("project", projectSchema)
