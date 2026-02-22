// controller/contactUs.js
const constactUs = require("../models/contactUs");
const { sendContactEmail } = require("../utils/email");
const { getDeviceType, getBrowser } = require("../utils/deviceDetect");


exports.contact = async (req, res) => {

    try {
        const { name, mobile, email, description } = req.body;

        if (!name || !mobile || !email || !description) {
            return res.status(400).json({ message: "All fields required" });
        }

        const userAgent = req.headers["user-agent"] || "";
        const device = getDeviceType(userAgent);
        const browser = getBrowser(userAgent);

        const response = await constactUs.create({ name, mobile, email, description, device, browser });
        await sendContactEmail({ name, mobile, email, description });

        return res.status(201).json({
            success: true,
            message: "Form submitted successfully!",
            data: response
        });
    } catch (error) {
        console.log("contact error ==>", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

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
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Contact ID is required"
      });
    }

    const contact = await constactUs.findById(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact not found"
      });
    }

    const total = await constactUs.countDocuments({});

    return res.status(200).json({
      success: true,
      count: total,
      data: contact,
      message: "Fetched contact successfully"
    });

  } catch (error) {
    console.error("getOneContact error =>", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

exports.getContactAnalytics = async (req, res) => {
    try {
        const range = (req.query.range || "month").toLowerCase(); // week | month | year
        const now = new Date();

        // Total contacts
        const totalContacts = await constactUs.countDocuments({});

        // Match only valid dates
        const matchStage = { createdAt: { $exists: true, $type: "date" } };

        // ================= Device Aggregation =================
        const deviceAgg = await constactUs.aggregate([
            { $match: matchStage },
            { $group: { _id: "$device", count: { $sum: 1 } } }
        ]);
        const devices = {};
        deviceAgg.forEach(d => { devices[d._id || "Unknown"] = d.count });

        // ================= Browser Aggregation =================
        const browserAgg = await constactUs.aggregate([
            { $match: matchStage },
            { $group: { _id: "$browser", count: { $sum: 1 } } }
        ]);
        const browsers = {};
        browserAgg.forEach(b => { browsers[b._id || "Unknown"] = b.count });

        // ================= Time-based Analytics =================
        let groupStage, sortStage = { "_id": 1 }, formatFunc;

        if (range === "week") {
            groupStage = { _id: { $isoWeek: "$createdAt" }, count: { $sum: 1 } };
            formatFunc = item => ({ name: `Week ${item._id}`, count: item.count });
        } else if (range === "month") {
            groupStage = { _id: { $month: "$createdAt" }, count: { $sum: 1 } };
            const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            formatFunc = item => ({ name: monthNames[item._id], count: item.count });
        } else if (range === "year") {
            groupStage = { _id: { $year: "$createdAt" }, count: { $sum: 1 } };
            formatFunc = item => ({ name: item._id.toString(), count: item.count });
        } else {
            return res.status(400).json({ success: false, message: "Invalid range" });
        }

        const analytics = await constactUs.aggregate([
            { $match: matchStage },
            { $group: groupStage },
            { $sort: sortStage },
        ]);
        const formatted = analytics.map(formatFunc);

        // ================= Growth Calculation =================
        let growth = null;
        if (range === "month") {
            const lastMonth = await constactUs.countDocuments({
                createdAt: {
                    $gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
                    $lt: new Date(now.getFullYear(), now.getMonth(), 1),
                }
            });
            const thisMonth = await constactUs.countDocuments({
                createdAt: {
                    $gte: new Date(now.getFullYear(), now.getMonth(), 1),
                    $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
                }
            });
            growth = lastMonth ? (((thisMonth - lastMonth) / lastMonth) * 100).toFixed(2) : null;
        }

        return res.status(200).json({
            success: true,
            totalContacts,
            growthPercent: growth,
            analytics: formatted,
            devices,
            browsers
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

exports.markRead = async (req, res) => {
    try {
        const { id } = req.params;
        const contact = await constactUs.findByIdAndUpdate(
            id,
            { status: "Read" },
            { new: true }
        );
        if (!contact) return res.status(404).json({ message: "Contact not found" });
        return res.status(200).json({ success: true, data: contact });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};


exports.sendReply = async (req, res) => {
    try {
        const { id } = req.params;
        const { reply } = req.body;

        const contact = await constactUs.findByIdAndUpdate(
            id,
            { status: "Replied", reply },
            { new: true }
        );

        if (!contact) return res.status(404).json({ message: "Contact not found" });

        // Optional: send email to user with reply
        // await sendContactEmail({ email: contact.email, reply });

        return res.status(200).json({ success: true, data: contact });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};