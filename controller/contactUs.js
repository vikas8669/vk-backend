const constactUs = require("../models/contactUs")
const { sendContactEmail } = require("../utils/email")


exports.contact = async (req, res) => {

    try {

        const { name, mobile , email, description } = req.body

        if (!name || !mobile  || !email || !description) {
            return res.status(400).json({
                message: "All fields required",
            })
        }

        const response = await constactUs.create({ name, mobile, email, description })

        const sendMail = await sendContactEmail({ name, mobile, email, description })
        return res.status(201).json({
            success: true,
            message: "Form submitted successfully!",
            data: response
        })

    } catch (error) {
        console.log("contact error ==>", error)
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        })

    }
}

exports.getAllContact = async (req, res) => {
    try {
        const response = await constactUs.find({});
        const total = await constactUs.countDocuments({})
        // If no contacts found
        if (!response || response.length === 0) {
            return res.status(404).json({
                success: false,
                total,
                message: "No contacts found!",
                data: [],
            });
        }

        // Success response
        return res.status(200).json({
            success: true,
            count: total,
            message: "Fetched all contacts successfully",
            data: response,
        });
    } catch (error) {
        console.log("getAll contact error ===> ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};



exports.getOneContact = async (req, res) => {

    try {
        const { id } = req.params
        const total = await constactUs.countDocuments({})

        const response = await constactUs.findOne(id)

        if (!response) {
            res.status(400).json({
                success: false,
                message: "Contacts not found!"
            })
        }

        return res.status(400).json({
            success: true,
            count: total,
            data: response,
            message: "Fetch all contacts"
        })

    } catch (error) {
        console.log("getAll contact error ===> ", error)
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        })

    }

}