const Notification = require("../models/notification");

exports.getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({})
            .sort({ createdAt: -1 })
            .limit(50);
        
        const unreadCount = await Notification.countDocuments({ status: "unread" });

        return res.status(200).json({
            success: true,
            data: notifications,
            unreadCount
        });
    } catch (error) {
        console.error("getAllNotifications error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByIdAndUpdate(
            id,
            { status: "read" },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        return res.status(200).json({ success: true, data: notification });
    } catch (error) {
        console.error("markAsRead error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany({ status: "unread" }, { status: "read" });
        return res.status(200).json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
        console.error("markAllAsRead error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByIdAndDelete(id);
        
        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        return res.status(200).json({ success: true, message: "Notification deleted" });
    } catch (error) {
        console.error("deleteNotification error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
