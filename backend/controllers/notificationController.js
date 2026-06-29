const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new notification (Coordinator/Admin only)
exports.createNotification = async (req, res) => {
  try {
    const { title, message, type } = req.body;
    const postedBy = req.user.id;

    if (!title || !message || !type) {
      return res.status(400).json({ error: "Title, message, and type are required" });
    }

    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type,
        postedBy
      }
    });

    res.status(201).json({ message: "Notification posted successfully", notification });
  } catch (err) {
    console.error("Create Notification Error:", err);
    res.status(500).json({ error: "Failed to create notification", details: err.message });
  }
};

// Get all notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(notifications);
  } catch (err) {
    console.error("Get Notifications Error:", err);
    res.status(500).json({ error: "Failed to fetch notifications", details: err.message });
  }
};

// Delete a notification (Coordinator/Admin only)
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.notification.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: "Notification deleted successfully" });
  } catch (err) {
    console.error("Delete Notification Error:", err);
    res.status(500).json({ error: "Failed to delete notification", details: err.message });
  }
};
