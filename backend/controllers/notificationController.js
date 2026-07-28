let inMemoryNotifications = [
  {
    id: 'notif-1',
    title: '✨ Welcome to Chrona Vault',
    message: 'Your 3D spatial time capsule vault is active and encrypted.',
    type: 'system',
    read: false,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'notif-2',
    title: '🔮 Unlock Reminder',
    message: 'Memory "First AI Artifact" is approaching its scheduled unlock threshold.',
    type: 'reminder',
    read: false,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
];

export const getNotifications = async (req, res, next) => {
  try {
    res.json({
      success: true,
      unreadCount: inMemoryNotifications.filter((n) => !n.read).length,
      notifications: inMemoryNotifications,
    });
  } catch (error) {
    next(error);
  }
};

export const createNotification = async (req, res, next) => {
  try {
    const { title, message, type } = req.body;
    const newNotif = {
      id: 'notif-' + Date.now(),
      title: title || 'Chrona Update',
      message: message || '',
      type: type || 'info',
      read: false,
      timestamp: new Date().toISOString(),
    };

    inMemoryNotifications.unshift(newNotif);

    res.status(201).json({
      success: true,
      notification: newNotif,
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.body;
    if (notificationId === 'all') {
      inMemoryNotifications.forEach((n) => (n.read = true));
    } else {
      const target = inMemoryNotifications.find((n) => n.id === notificationId);
      if (target) target.read = true;
    }

    res.json({
      success: true,
      message: 'Notifications updated',
      unreadCount: inMemoryNotifications.filter((n) => !n.read).length,
    });
  } catch (error) {
    next(error);
  }
};
