const express = require("express");
const router = express.Router();
const { verifyToken, adminOnly } = require("../middleware/auth");
const {
    getAllNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
} = require("../controller/notification");

// Apply admin protection to all routes
router.use(verifyToken, adminOnly);

router.get("/", getAllNotifications);
router.put("/mark-all-read", markAllAsRead);
router.put("/:id/read", markAsRead);
router.delete("/:id", deleteNotification);

module.exports = router;
