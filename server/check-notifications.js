const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

async function checkNotifications() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    
    const db = client.db('IQAC');
    
    // Get all notifications
    console.log('\n📋 All Notifications in Database:');
    const notifications = await db.collection('notifications').find({}).toArray();
    console.log(`Total notifications: ${notifications.length}`);
    
    notifications.forEach((notif, index) => {
      console.log(`\n${index + 1}. ${notif.title}`);
      console.log(`   UserId: ${notif.userId}`);
      console.log(`   Type: ${notif.type}`);
      console.log(`   Read: ${notif.isRead}`);
      console.log(`   Created: ${notif.createdAt}`);
    });
    
    // Get all users to compare IDs
    console.log('\n👥 All Users in Database:');
    const users = await db.collection('users').find({}, { projection: { username: 1, email: 1, _id: 1 } }).toArray();
    console.log(`Total users: ${users.length}`);
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.username || user.email}`);
      console.log(`   UserId: ${user._id}`);
      console.log(`   Email: ${user.email}`);
      
      // Check if this user has notifications
      const userNotifs = notifications.filter(n => n.userId.toString() === user._id.toString());
      console.log(`   Notifications: ${userNotifs.length}`);
    });
    
    // Check for unread notifications per user
    console.log('\n🔔 Unread Notifications by User:');
    for (const user of users) {
      const unreadCount = await db.collection('notifications').countDocuments({
        userId: user._id,
        isRead: false
      });
      console.log(`${user.username || user.email}: ${unreadCount} unread`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Database connection closed');
  }
}

checkNotifications().catch(console.error);
