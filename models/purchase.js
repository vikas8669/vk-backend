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
    razorpay_webhook_event_id: String,

    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending"
    },

    downloadLink: String,
    downloadToken: {
      type: String
    },
    tokenExpiry: Date,
    downloadUsed: {
      type: Boolean,
      default: false
    },
    invoiceId: String,
    invoiceUrl: String,
    paymentCapturedAt: Date,
    webhookReceivedAt: Date,
    downloadUsedAt: Date,
    downloadIp: String,
    downloadUserAgent: String,
    downloadAccessLogs: [
      {
        ip: String,
        userAgent: String,
        downloadedAt: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  {
    timestamps: true
  }
)

purchaseSchema.index({ razorpay_order_id: 1 }, { unique: true, sparse: true })
purchaseSchema.index({ razorpay_payment_id: 1 }, { unique: true, sparse: true })
purchaseSchema.index({ downloadToken: 1 }, { unique: true, sparse: true })
purchaseSchema.index({ paymentStatus: 1, createdAt: -1 })

module.exports = mongoose.model("purchase", purchaseSchema)
