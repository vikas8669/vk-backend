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
        const doc = new PDFDocument({ margin: 50, size: 'A4' })
        
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "invoices",
                resource_type: "image", 
                public_id: safeInvoiceId,
                format: "pdf"
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

        // --- Theme Colors ---
        const primaryColor = "#0f766e" // Teal theme from frontend
        const darkGray = "#1f2937"
        const lightGray = "#6b7280"
        
        // --- Header Section ---
        // Faux Logo Graphic
        doc.rect(50, 50, 45, 45).fill(primaryColor)
        doc.fillColor("#ffffff").fontSize(24).font("Helvetica-Bold").text("VK", 55, 62)
        
        // Brand Name
        doc.fillColor(primaryColor).fontSize(14).text("Portfolio & Projects", 110, 55)
        doc.fillColor(lightGray).fontSize(10).font("Helvetica").text("Digital Products Delivery", 110, 75)
        
        // Right Side Titles
        doc.fillColor(darkGray).fontSize(30).font("Helvetica-Bold").text("INVOICE", 50, 50, { align: "right" })
        doc.fontSize(10).font("Helvetica").fillColor(lightGray).text(`Receipt: ${safeInvoiceId}`, 50, 85, { align: "right" })

        // Thick Divider
        doc.moveTo(50, 120).lineTo(545, 120).lineWidth(1).strokeColor("#e5e7eb").stroke()
        
        // --- Billing Information ---
        const dateStr = new Date(date).toLocaleDateString("en-IN", {
            day: "numeric", month: "short", year: "numeric"
        })
        
        // Left Column (Bill To)
        doc.font("Helvetica-Bold").fontSize(11).fillColor(darkGray).text("Billed To:", 50, 145)
        doc.font("Helvetica").fontSize(10).fillColor(lightGray)
           .text(userName || "Valued Customer", 50, 163)
           .text(email || "No email provided", 50, 178)
           
        // Right Column (Details)
        doc.font("Helvetica-Bold").fontSize(11).fillColor(darkGray).text("Invoice Details:", 380, 145)
        doc.font("Helvetica").fontSize(10).fillColor(lightGray)
           .text(`Date:`, 380, 163)
           .text(dateStr, 450, 163)
           .text(`Payment ID:`, 380, 178)
           .text(paymentId || "Pending", 450, 178)
           
        doc.moveTo(50, 215).lineTo(545, 215).strokeColor("#e5e7eb").stroke()

        // --- Line Items Table ---
        doc.rect(50, 240, 495, 30).fillColor("#f3f4f6").fill()
        
        doc.font("Helvetica-Bold").fontSize(10).fillColor(darkGray)
        doc.text("Description", 65, 250)
        doc.text("Qty", 350, 250)
        doc.text("Amount", 440, 250, { width: 90, align: "right" })
        
        // Line Item Content
        doc.font("Helvetica").fontSize(11).fillColor(darkGray)
        doc.text(projectName, 65, 290, { width: 270 })
        doc.text("1", 350, 290)
        doc.text(formatCurrency(amount, currency), 440, 290, { width: 90, align: "right" })
        
        // Bottom Table Divider
        doc.moveTo(50, 330).lineTo(545, 330).strokeColor("#e5e7eb").stroke()
        
        // --- Total Section ---
        doc.rect(340, 355, 205, 45).fillColor("#f9fafb").fill()
        doc.font("Helvetica-Bold").fontSize(14).fillColor(darkGray).text("Total Paid:", 360, 370)
        doc.fillColor(primaryColor).text(formatCurrency(amount, currency), 420, 370, { width: 110, align: "right" })

        // --- Footer ---
        // Positioned absolute near bottom
        doc.moveTo(50, 750).lineTo(545, 750).strokeColor("#e5e7eb").stroke()
        doc.font("Helvetica-Oblique").fontSize(10).fillColor(lightGray)
           .text("Thank you for your purchase! This is an electronically generated invoice.", 50, 765, { align: "center", width: 495 })

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