export const getAnalyticsDashboard = async (req, res, next) => {
  try {
    const analytics = {
      systemHealth: 'Optimal',
      uptimeSeconds: Math.floor(process.uptime()),
      activeUsers: 1,
      totalMemoriesPreserved: 12,
      totalStorageUsedMB: 18.4,
      aiQueriesProcessed: 47,
      categoryDistribution: {
        Personal: 4,
        Travel: 3,
        Milestones: 3,
        Audio: 2,
      },
      moodBreakdown: {
        Inspiring: 45,
        Joyful: 30,
        Peaceful: 15,
        Nostalgic: 10,
      },
    };

    res.json({ success: true, analytics });
  } catch (error) {
    next(error);
  }
};

export const getStorageMetrics = async (req, res, next) => {
  try {
    res.json({
      success: true,
      storage: {
        quotaMB: 5000,
        usedMB: 18.4,
        availableMB: 4981.6,
        breakdown: {
          images: '12.2 MB',
          audio: '4.8 MB',
          documents: '1.4 MB',
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getActivityMetrics = async (req, res, next) => {
  try {
    res.json({
      success: true,
      activity: [
        { day: 'Mon', memoriesSealed: 2, aiChats: 8 },
        { day: 'Tue', memoriesSealed: 1, aiChats: 5 },
        { day: 'Wed', memoriesSealed: 3, aiChats: 12 },
        { day: 'Thu', memoriesSealed: 0, aiChats: 4 },
        { day: 'Fri', memoriesSealed: 4, aiChats: 15 },
        { day: 'Sat', memoriesSealed: 2, aiChats: 3 },
        { day: 'Sun', memoriesSealed: 0, aiChats: 0 },
      ],
    });
  } catch (error) {
    next(error);
  }
};
