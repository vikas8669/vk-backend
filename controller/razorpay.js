const Razorpay = require("razorpay")
const crypto = require("crypto")

const Project = require("../models/project")
const Purchase = require("../models/purchase")

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})



/* ======================================
   CREATE ORDER
====================================== */

exports.createOrder = async (req, res) => {

    try {

        const { projectId, email, name } = req.body

        if (!projectId) {
            return res.status(400).json({
                success: false,
                message: "Project ID required"
            })
        }

        const project = await Project.findById(projectId)

        // FIX HERE
        const price =
            project?.customFields?.buy?.price ||
            project?.customFields?.Buy || 0;

        if (!project || !price) {
            return res.status(404).json({
                success: false,
                message: "Project not available for purchase"
            })
        }

        const options = {
            amount: Number(price) * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        }

        const order = await razorpay.orders.create(options)

        await Purchase.create({
            projectId,
            projectTitle: project.title,
            userEmail: email,
            userName: name,
            amount: price,
            razorpay_order_id: order.id,
            paymentStatus: "pending",
            downloadLink:
                project?.customFields?.buy?.downloadLink || ""
        })

        return res.status(200).json({
            success: true,
            message: "Payment successfully created",
            order
        })

    } catch (error) {

        console.log("createOrder error:", error)

        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}



/* ======================================
   VERIFY PAYMENT
====================================== */

exports.verifyPayment = async (req, res) => {
    try {

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body

        const sign = razorpay_order_id + "|" + razorpay_payment_id

        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex")

        if (razorpay_signature !== expectedSign) {
            return res.status(400).json({
                success: false,
                message: "Invalid signature"
            })
        }

        // 🔥 FIND PURCHASE FIRST
        const purchase = await Purchase.findOne({ razorpay_order_id })

        if (!purchase) {
            return res.status(404).json({
                success: false,
                message: "Purchase not found"
            })
        }

        // 🔥 GET PROJECT
        const project = await Project.findById(purchase.projectId)

        const downloadLink =
            project?.customFields?.downloadLink ||
            project?.customFields?.buy?.downloadLink ||
            ""

        // 🔥 UPDATE PURCHASE
        const updated = await Purchase.findOneAndUpdate(
            { razorpay_order_id },
            {
                razorpay_payment_id,
                razorpay_signature,
                paymentStatus: "success",
                downloadLink
            },
            { new: true }
        )

        return res.json({
            success: true,
            message: "Payment successful",
            purchase: updated,
            downloadLink
        })

    } catch (error) {
        console.log("verifyPayment error:", error)

        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}



/* ======================================
   GET USER PURCHASES
====================================== */

exports.getUserPurchases = async (req, res) => {
    try {

        const { email } = req.query

        const purchases = await Purchase.find({
            userEmail: email,
            paymentStatus: "success"
        }).sort({ createdAt: -1 })

        res.json({
            success: true,
            data: purchases
        })

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}



/* ======================================
   RAZORPAY WEBHOOK (VERY IMPORTANT)
====================================== */

exports.razorpayWebhook = async (req, res) => {
    try {

        const secret = process.env.RAZORPAY_WEBHOOK_SECRET

        const crypto = require("crypto")

        const shasum = crypto.createHmac("sha256", secret)

        shasum.update(req.body) // RAW BUFFER

        const digest = shasum.digest("hex")

        const signature = req.headers["x-razorpay-signature"]

        if (digest === signature) {

            const event = JSON.parse(req.body.toString())

            const payment = event.payload.payment.entity

            await Purchase.findOneAndUpdate(
                { razorpay_order_id: payment.order_id },
                {
                    paymentStatus: payment.status,
                    razorpay_payment_id: payment.id
                }
            )

            console.log("✅ Payment updated via webhook")
        }

        res.status(200).json({ status: "ok" })

    } catch (error) {
        console.log("Webhook error:", error)
        res.status(500).send("Webhook Error")
    }
}