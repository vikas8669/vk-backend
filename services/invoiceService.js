const PDFDocument = require("pdfkit")
const { cloudinary } = require("../utils/cloudinary")

const formatCurrency = (amount, currency = "INR") =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency
    }).format(Number(amount || 0))

const generateInvoicePdf = async ({
    invoiceId,
    userName,
    email,
    projectName,
    amount,
    currency,
    paymentId,
    date,
    baseUrl
}) => {
    const safeInvoiceId = String(invoiceId).replace(/[^a-zA-Z0-9_-]/g, "")
    const fileName = `${safeInvoiceId}.pdf`

    const invoiceUrl = await new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 })
        
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "invoices",
                resource_type: "raw", 
                public_id: fileName
            },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary invoice upload error:", error)
                    return reject(error)
                }
                resolve(result.secure_url)
            }
        )

        doc.pipe(uploadStream)

        doc.fontSize(22).text("INVOICE", { align: "center" })
        doc.moveDown()

        doc.fontSize(12)
        doc.text(`Invoice ID: ${invoiceId}`)
        doc.text(`Date: ${new Date(date).toLocaleString("en-IN")}`)
        doc.text(`Customer Name: ${userName || "Customer"}`)
        doc.text(`Email: ${email || "Not provided"}`)
        doc.moveDown()

        doc.text(`Project: ${projectName}`)
        doc.text(`Amount: ${formatCurrency(amount, currency)}`)
        doc.text(`Payment ID: ${paymentId || "Pending"}`)
        doc.moveDown()

        doc.text("Thank you for your purchase!", { align: "left" })

        doc.end()
    })

    return {
        fileName,
        filePath: fileName,
        relativeUrl: invoiceUrl,
        invoiceUrl
    }
}

module.exports = {
    generateInvoicePdf
}