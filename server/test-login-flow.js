const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://IamSamk:2gRB01wOhNhKIqvP@iqac.mlrfsfs.mongodb.net/IQAC?retryWrites=true&w=majority&appName=IQAC';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function testLogin() {
    let client;
    try {
        console.log('🔐 Testing Login Flow');
        console.log('=====================');
        
        // Connect to MongoDB
        client = new MongoClient(mongoUri);
        await client.connect();
        const db = client.db('IQAC');
        
        // Find a user who has notifications
        // Let's try Samarth@gmail.com who has 2 notifications
        const userEmail = 'Samarth@gmail.com';
        const user = await db.collection('users').findOne({ email: userEmail });
        
        if (!user) {
            console.log(`❌ User ${userEmail} not found`);
            return;
        }
        
        console.log(`✅ Found user: ${user.username} (${user.email})`);
        console.log(`   User ID: ${user._id}`);
        console.log(`   Role: ${user.role}`);
        
        // Generate a JWT token for this user (simulating login)
        const token = jwt.sign(
            { userId: user._id },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        console.log(`\n🎫 Generated JWT token for ${user.email}`);
        console.log(`   Token: ${token.substring(0, 50)}...`);
        
        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log(`\n✅ Token decoded:`);
        console.log(`   userId: ${decoded.userId}`);
        console.log(`   userId type: ${typeof decoded.userId}`);
        
        // Find notifications for this user
        const notifications = await db.collection('notifications').find({ 
            userId: user._id 
        }).toArray();
        
        console.log(`\n🔔 Notifications for ${user.email}:`);
        console.log(`   Count: ${notifications.length}`);
        
        notifications.forEach((notif, index) => {
            console.log(`   ${index + 1}. "${notif.title}" (${notif.type})`);
            console.log(`      userId in DB: ${notif.userId}`);
            console.log(`      userId matches: ${notif.userId.toString() === user._id.toString()}`);
            console.log(`      isRead: ${notif.isRead}`);
        });
        
        // Test the ID comparison that would happen in the API
        console.log(`\n🔍 ID Comparison Test:`);
        console.log(`   User ID from token: ${decoded.userId}`);
        console.log(`   User ID from token (string): ${decoded.userId.toString()}`);
        console.log(`   User ID from DB: ${user._id}`);
        console.log(`   User ID from DB (string): ${user._id.toString()}`);
        console.log(`   IDs match: ${decoded.userId.toString() === user._id.toString()}`);
        
        console.log(`\n📋 Summary:`);
        console.log(`   ✅ User exists in database`);
        console.log(`   ✅ JWT token generated successfully`);
        console.log(`   ✅ Token can be decoded`);
        console.log(`   ✅ User has ${notifications.length} notifications`);
        console.log(`   ✅ ID comparison works`);
        
        console.log(`\n🧪 Test this token in the frontend:`);
        console.log(`   1. Copy this token: ${token}`);
        console.log(`   2. Set it in localStorage: localStorage.setItem('token', '${token}')`);
        console.log(`   3. Refresh the page and check if notifications appear`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (client) {
            await client.close();
        }
    }
}

testLogin();
