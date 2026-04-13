const crypto = require("crypto")

const Project = require("../models/project")
const Purchase = require("../models/purchase")
const { generateInvoicePdf } = require("./invoiceService")
const { sendPaymentSuccessEmail } = require("./paymentEmailService")

const TOKEN_VALIDITY_MS = 24 * 60 * 60 * 1000

const getProjectDownloadLink = (project) =>
    project?.customFields?.downloadLink ||
    project?.customFields?.buy?.downloadLink ||
    ""

const buildBaseUrl = (req) => {
    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http"
    return process.env.APP_BASE_URL || `${protocol}://${req.get("host")}`
}

const toDirectGoogleDriveLink = (link) => {
    if (!link) return ""

    const fileMatch = link.match(/\/d\/([^/]+)/)
    if (fileMatch?.[1]) {
        return `https://drive.google.com/uc?export=download&id=${fileMatch[1]}`
    }

    const urlMatch = link.match(/[?&]id=([^&]+)/)
    if (urlMatch?.[1]) {
        return `https://drive.google.com/uc?export=download&id=${urlMatch[1]}`
    }

    return link
}

const finalizePurchasePayment = async ({
    orderId,
    paymentId,
    signature,
    eventId,
    capturedAt,
    webhookReceivedAt,
    req
}) => {
    try {
        // 1. Find purchase (DO NOT use lean first)
        const purchase = await Purchase.findOne({ razorpay_order_id: orderId })

        if (!purchase) {
            return { purchase: null, alreadyProcessed: false }
        }

        // 2. Prevent duplicate processing
        if (purchase.paymentStatus === "success") {
            return { purchase, alreadyProcessed: true }
        }

        // 3. Get project
        const project = await Project.findById(purchase.projectId)

        const sourceDownloadLink = getProjectDownloadLink(project)
        const directDownloadLink = toDirectGoogleDriveLink(sourceDownloadLink)

        const downloadToken = crypto.randomUUID()
        const tokenExpiry = new Date(Date.now() + TOKEN_VALIDITY_MS)

        const invoiceId = `INV-${Date.now()}-${String(orderId).slice(-6)}`
        const baseUrl = buildBaseUrl(req)

        const secureDownloadUrl =
            `${baseUrl}/api/v1/payment/download/${downloadToken}`

        // 4. Generate invoice
        const invoice = await generateInvoicePdf({
            invoiceId,
            userName: purchase.userName,
            email: purchase.userEmail,
            projectName: purchase.projectTitle,
            amount: purchase.amount,
            currency: purchase.currency,
            paymentId,
            date: capturedAt || new Date(),
            baseUrl
        })

        const invoiceUrl = invoice.invoiceUrl

        // 5. UPDATE DB (IMPORTANT FIX HERE)
        const updatedPurchase = await Purchase.findOneAndUpdate(
            { razorpay_order_id: orderId },
            {
                $set: {
                    paymentStatus: "success",
                    razorpay_payment_id: paymentId,
                    razorpay_signature: signature,
                    razorpay_webhook_event_id: eventId,
                    paymentCapturedAt: capturedAt,
                    webhookReceivedAt,

                    downloadLink: directDownloadLink,
                    downloadToken,
                    tokenExpiry,

                    invoiceId,
                    invoiceUrl,
                    downloadUsed: false
                }
            },
            { new: true }
        )

        // 6. EMAIL (safe try-catch)
        try {
            await sendPaymentSuccessEmail({
                to: updatedPurchase.userEmail,
                userName: updatedPurchase.userName,
                projectTitle: updatedPurchase.projectTitle,
                downloadUrl: secureDownloadUrl,
                invoiceUrl
            })
        } catch (err) {
            console.log("EMAIL ERROR:", err.message)
        }

        return {
            purchase: updatedPurchase.toObject(),
            alreadyProcessed: false
        }

    } catch (error) {
        console.log("finalizePurchasePayment error:", error)
        return { purchase: null, alreadyProcessed: false }
    }
}

module.exports = {
    finalizePurchasePayment,
    buildBaseUrl,
    toDirectGoogleDriveLink
}
