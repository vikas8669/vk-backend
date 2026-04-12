const mongoose = require("mongoose")

const purchaseSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "project",
      required: true
    },

    projectTitle: {
      type: String
    },

    userName: {
      type: String
    },

    userEmail: {
      type: String,
    //   required: true
    },

    amount: {
      type: Number,
      required: true
    },

    currency: {
      type: String,
      default: "INR"
    },

    razorpay_order_id: String,
    razorpay_payment_id: String,
    razorpay_signature: String,

    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending"
    },

    downloadLink: String
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model("purchase", purchaseSchema)