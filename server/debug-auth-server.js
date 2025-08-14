const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Notification = require('./models/Notification');
require('dotenv').config();

const app = express();
app.use(express.json());

// Import the auth middleware
const { authenticateToken } = require('./routes/auth');

// Test endpoint to debug authentication
app.get('/debug-auth', authenticateToken, async (req, res) => {
    try {
        console.log('\n=== DEBUG AUTH ENDPOINT ===');
        console.log('req.user:', req.user);
        console.log('req.user._id:', req.user._id);
        console.log('req.user._id type:', typeof req.user._id);
        console.log('req.user._id.toString():', req.user._id.toString());
        
        // Try to find notifications for this user
        const userId = req.user._id;
        const notifications = await Notification.find({ userId });
        
        console.log('Found notifications count:', notifications.length);
        if (notifications.length > 0) {
            console.log('First notification userId:', notifications[0].userId);
            console.log('First notification userId type:', typeof notifications[0].userId);
            console.log('First notification:', {
                title: notifications[0].title,
                type: notifications[0].type,
                isRead: notifications[0].isRead
            });
        }
        
        // Check if IDs match
        const userIdString = req.user._id.toString();
        const matchingNotifications = notifications.filter(n => 
            n.userId.toString() === userIdString
        );
        console.log('Matching notifications:', matchingNotifications.length);
        
        res.json({
            user: {
                id: req.user._id.toString(),
                email: req.user.email,
                username: req.user.username
            },
            notifications: {
                total: notifications.length,
                matching: matchingNotifications.length,
                details: notifications.map(n => ({
                    title: n.title,
                    userId: n.userId.toString(),
                    matches: n.userId.toString() === userIdString
                }))
            }
        });
    } catch (error) {
        console.error('Debug auth error:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Debug server running on http://localhost:${PORT}`);
    console.log('Test with: GET http://localhost:${PORT}/debug-auth');
    console.log('Include Authorization header: Bearer <your-jwt-token>');
});

module.exports = app;
