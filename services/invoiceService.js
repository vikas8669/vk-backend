const fs = require("fs")
const path = require("path")
const PDFDocument = require("pdfkit")

const invoicesDir = path.join(__dirname, "..", "generated", "invoices")

const ensureInvoicesDir = async () => {
    await fs.promises.mkdir(invoicesDir, { recursive: true })
}

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
    await ensureInvoicesDir()

    const safeInvoiceId = String(invoiceId).replace(/[^a-zA-Z0-9_-]/g, "")
    const fileName = `${safeInvoiceId}.pdf`
    const filePath = path.join(invoicesDir, fileName)

    await new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 })
        const stream = fs.createWriteStream(filePath)

        stream.on("finish", resolve)
        stream.on("error", reject)
        doc.on("error", reject)

        doc.pipe(stream)

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

    // IMPORTANT: public URL for frontend
    const relativeUrl = `/invoices/${fileName}`
    const invoiceUrl = baseUrl
        ? `${baseUrl}${relativeUrl}`
        : relativeUrl

    return {
        fileName,
        filePath,
        relativeUrl,
        invoiceUrl
    }
}

module.exports = {
    generateInvoicePdf
}