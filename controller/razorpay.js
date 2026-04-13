const Razorpay = require("razorpay")
const crypto = require("crypto")

const Project = require("../models/project")
const Purchase = require("../models/purchase")
const {
    finalizePurchasePayment,
    toDirectGoogleDriveLink
} = require("../services/paymentFulfillmentService")

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

const CURRENCY = "INR"
const logPrefix = "[razorpay]"

const toPositiveNumber = (value, fallback) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const isNonEmptyString = (value) =>
    typeof value === "string" && value.trim().length > 0

const normalizePrice = (project) => {
    const rawPrice =
        project?.customFields?.buy?.price ??
        project?.customFields?.Buy ??
        0

    const price = Number(rawPrice)
    return Number.isFinite(price) && price > 0 ? price : 0
}

const getProjectDownloadLink = (project) =>
    project?.customFields?.downloadLink ||
    project?.customFields?.buy?.downloadLink ||
    ""

const createHmacSignature = (payload, secret) =>
    crypto.createHmac("sha256", secret).update(payload).digest("hex")

const isValidSignature = (expected, received) => {
    if (!isNonEmptyString(expected) || !isNonEmptyString(received)) return false

    const expectedBuffer = Buffer.from(expected, "utf8")
    const receivedBuffer = Buffer.from(received, "utf8")

    if (expectedBuffer.length !== receivedBuffer.length) return false

    return crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
}

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

        const project = await Project.findById(projectId).lean()
        const price = normalizePrice(project)

        if (!project || !price) {
            return res.status(404).json({
                success: false,
                message: "Project not available for purchase"
            })
        }

        const options = {
            amount: Math.round(price * 100),
            currency: CURRENCY,
            receipt: `rcpt_${Date.now().toString().slice(-10)}`
        }

        const order = await razorpay.orders.create(options)

        await Purchase.create({
            projectId,
            projectTitle: project.title,
            userEmail: email,
            userName: name,
            amount: price,
            currency: CURRENCY,
            razorpay_order_id: order.id,
            paymentStatus: "pending",
            downloadLink: toDirectGoogleDriveLink(getProjectDownloadLink(project))
        })

        return res.status(200).json({
            success: true,
            message: "Payment order created successfully",
            order
        })
    } catch (error) {
        console.log(`${logPrefix} createOrder error:`, error)

        return res.status(500).json({
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

        // 1. Validate input
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Missing payment verification fields"
            })
        }

        // 2. Find purchase
        const purchase = await Purchase.findOne({ razorpay_order_id })

        if (!purchase) {
            return res.status(404).json({
                success: false,
                message: "Purchase not found"
            })
        }

        // 3. Verify signature
        const crypto = require("crypto")

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex")

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature"
            })
        }

        // 4. Get project for download link
        const project = await Project.findById(purchase.projectId)

        const downloadLink =
            project?.customFields?.downloadLink ||
            project?.customFields?.Buy?.downloadLink ||
            ""

        // 5. OPTIONAL: invoice URL (if you generate invoices later)
        const invoiceUrl = purchase.invoiceUrl || ""

        // 6. Update purchase
        const updatedPurchase = await Purchase.findOneAndUpdate(
            { razorpay_order_id },
            {
                $set: {
                    razorpay_payment_id,
                    razorpay_signature,
                    paymentStatus: "success",
                    downloadLink: downloadLink,
                    updatedAt: new Date()
                }
            },
            { new: true }
        )

        // 7. FINAL RESPONSE (IMPORTANT)
        return res.status(200).json({
            success: true,
            message: "Payment successful",
            purchase: updatedPurchase,
            downloadLink: updatedPurchase.downloadLink,
            invoiceUrl: invoiceUrl,
            paymentStatus: updatedPurchase.paymentStatus
        })

    } catch (error) {
        console.log("verifyPayment error:", error)

        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

/* ======================================
   SECURE DOWNLOAD
====================================== */

exports.downloadPurchasedProject = async (req, res) => {
    try {
        const { token } = req.params
        const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip
        const userAgent = req.get("user-agent") || ""

        const purchase = await Purchase.findOne({ downloadToken: token })

        if (!purchase) {
            return res.status(404).json({
                success: false,
                message: "Invalid download token"
            })
        }

        if (purchase.paymentStatus !== "success") {
            return res.status(403).json({
                success: false,
                message: "Payment not completed"
            })
        }

        if (purchase.downloadUsed) {
            return res.status(410).json({
                success: false,
                message: "Download link already used"
            })
        }

        if (!purchase.tokenExpiry || purchase.tokenExpiry < new Date()) {
            return res.status(410).json({
                success: false,
                message: "Download link expired"
            })
        }

        if (!purchase.downloadLink) {
            return res.status(404).json({
                success: false,
                message: "Download file not available"
            })
        }

        purchase.downloadUsed = true
        purchase.downloadUsedAt = new Date()
        purchase.downloadIp = ip
        purchase.downloadUserAgent = userAgent
        purchase.downloadAccessLogs.push({
            ip,
            userAgent,
            downloadedAt: new Date()
        })

        await purchase.save()

        return res.status(200).json({
            success: true,
            message: "Download authorized",
            downloadLink: purchase.downloadLink,
            invoiceUrl: purchase.invoiceUrl || ""
        })
    } catch (error) {
        console.log(`${logPrefix} downloadPurchasedProject error:`, error)

        return res.status(500).json({
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
        })
            .select("projectTitle amount currency paymentStatus createdAt invoiceUrl downloadUsed downloadUsedAt")
            .sort({ createdAt: -1 })
            .lean()

        return res.status(200).json({
            success: true,
            data: purchases
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

/* ======================================
   ADMIN DASHBOARD
====================================== */

exports.getAdminDashboard = async (req, res) => {
    try {
        const [successSummaryRows, failedSummaryRows, projectRows, recentPurchases] = await Promise.all([
            Purchase.aggregate([
                { $match: { paymentStatus: "success" } },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$amount" },
                        totalSales: { $sum: 1 },
                        totalDownloads: {
                            $sum: {
                                $cond: [{ $eq: ["$downloadUsed", true] }, 1, 0]
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalRevenue: 1,
                        totalSales: 1,
                        totalDownloads: 1
                    }
                }
            ]),
            Purchase.aggregate([
                { $match: { paymentStatus: "failed" } },
                {
                    $group: {
                        _id: null,
                        failedPaymentsCount: { $sum: 1 }
                    }
                }
            ]),
            Purchase.aggregate([
                { $match: { paymentStatus: "success" } },
                {
                    $group: {
                        _id: "$projectId",
                        projectTitle: { $first: "$projectTitle" },
                        totalRevenue: { $sum: "$amount" },
                        totalSales: { $sum: 1 },
                        totalDownloads: {
                            $sum: {
                                $cond: [{ $eq: ["$downloadUsed", true] }, 1, 0]
                            }
                        },
                        lastPurchasedAt: { $max: "$createdAt" }
                    }
                },
                { $sort: { totalSales: -1, totalRevenue: -1 } },
                { $limit: 10 }
            ]),
            Purchase.find({ paymentStatus: "success" })
                .select("projectId projectTitle userName userEmail amount currency paymentStatus createdAt razorpay_payment_id invoiceUrl downloadUsed")
                .sort({ createdAt: -1 })
                .limit(10)
                .lean()
        ])

        const summary = successSummaryRows[0] || {
            totalRevenue: 0,
            totalSales: 0,
            totalDownloads: 0
        }

        return res.status(200).json({
            success: true,
            data: {
                ...summary,
                failedPaymentsCount: failedSummaryRows[0]?.failedPaymentsCount || 0,
                topSellingProject: projectRows[0] || null,
                topProjects: projectRows,
                recentPurchases
            }
        })
    } catch (error) {
        console.log(`${logPrefix} getAdminDashboard error:`, error)

        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

/* ======================================
   ADMIN PURCHASE HISTORY
====================================== */

exports.getAdminPurchases = async (req, res) => {
    try {
        const page = toPositiveNumber(req.query.page, 1)
        const limit = Math.min(toPositiveNumber(req.query.limit, 10), 100)
        const status = (req.query.status || "").trim()
        const search = (req.query.search || "").trim()

        const filter = {}

        if (status) {
            filter.paymentStatus = status
        }

        if (search) {
            filter.$or = [
                { projectTitle: { $regex: search, $options: "i" } },
                { userName: { $regex: search, $options: "i" } },
                { userEmail: { $regex: search, $options: "i" } },
                { razorpay_payment_id: { $regex: search, $options: "i" } },
                { razorpay_order_id: { $regex: search, $options: "i" } }
            ]
        }

        const skip = (page - 1) * limit

        const [purchases, total] = await Promise.all([
            Purchase.find(filter)
                .select("projectId projectTitle userName userEmail amount currency paymentStatus createdAt razorpay_order_id razorpay_payment_id downloadLink downloadToken tokenExpiry downloadUsed downloadUsedAt downloadIp invoiceId invoiceUrl paymentCapturedAt webhookReceivedAt")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Purchase.countDocuments(filter)
        ])

        return res.status(200).json({
            success: true,
            total,
            page,
            limit,
            data: purchases
        })
    } catch (error) {
        console.log(`${logPrefix} getAdminPurchases error:`, error)

        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

/* ======================================
   RAZORPAY WEBHOOK
====================================== */

exports.razorpayWebhook = async (req, res) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET
        const signature = req.headers["x-razorpay-signature"]
        const rawBody = Buffer.isBuffer(req.body)
            ? req.body
            : Buffer.from(JSON.stringify(req.body || {}))

        if (!secret || !isNonEmptyString(signature)) {
            console.log(`${logPrefix} webhook rejected: missing secret or signature`)
            return res.status(400).json({
                success: false,
                message: "Invalid webhook configuration"
            })
        }

        const digest = createHmacSignature(rawBody, secret)

        if (!isValidSignature(digest, signature)) {
            console.log(`${logPrefix} webhook rejected: invalid signature`)
            return res.status(400).json({
                success: false,
                message: "Invalid webhook signature"
            })
        }

        const event = JSON.parse(rawBody.toString("utf8"))

        console.log(
            `${logPrefix} webhook received`,
            JSON.stringify({
                event: event?.event || null,
                paymentId: event?.payload?.payment?.entity?.id || null,
                orderId: event?.payload?.payment?.entity?.order_id || null
            })
        )

        if (event.event !== "payment.captured") {
            return res.status(200).json({
                success: true,
                message: `Ignored webhook event: ${event.event}`
            })
        }

        const payment = event?.payload?.payment?.entity

        if (!payment?.order_id || !payment?.id) {
            console.log(`${logPrefix} payment.captured ignored: missing order/payment id`)
            return res.status(400).json({
                success: false,
                message: "Invalid payment payload"
            })
        }

        const { purchase, alreadyProcessed } = await finalizePurchasePayment({
            orderId: payment.order_id,
            paymentId: payment.id,
            signature,
            eventId: payment.id,
            capturedAt: payment.captured_at
                ? new Date(payment.captured_at * 1000)
                : new Date(),
            webhookReceivedAt: new Date(),
            req
        })

        if (!purchase) {
            console.log(
                `${logPrefix} payment.captured received for missing purchase`,
                JSON.stringify({
                    orderId: payment.order_id,
                    paymentId: payment.id
                })
            )

            return res.status(404).json({
                success: false,
                message: "Purchase not found"
            })
        }

        console.log(
            `${logPrefix} purchase finalized`,
            JSON.stringify({
                orderId: payment.order_id,
                paymentId: payment.id,
                alreadyProcessed
            })
        )

        return res.status(200).json({
            success: true,
            status: "ok"
        })
    } catch (error) {
        console.log(`${logPrefix} webhook error:`, error)
        return res.status(500).send("Webhook Error")
    }
}
