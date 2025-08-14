const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

async function testNotifications() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    
    const db = client.db('IQAC');
    
    // Check notifications collection
    const notificationsCollection = db.collection('notifications');
    const totalCount = await notificationsCollection.countDocuments();
    console.log(`\n📋 Total notifications in database: ${totalCount}`);
    
    if (totalCount > 0) {
      // Get some sample notifications
      const sampleNotifications = await notificationsCollection
        .find({})
        .limit(5)
        .toArray();
      
      console.log('\n📝 Sample notifications:');
      sampleNotifications.forEach((notif, index) => {
        console.log(`${index + 1}. ${notif.title} (${notif.isRead ? 'READ' : 'UNREAD'}) - User: ${notif.userId}`);
        console.log(`   Message: ${notif.message}`);
        console.log(`   Created: ${notif.createdAt}`);
        console.log('   ---');
      });
      
      // Check read/unread counts
      const unreadCount = await notificationsCollection.countDocuments({ isRead: false });
      const readCount = await notificationsCollection.countDocuments({ isRead: true });
      
      console.log(`\n📊 Notification counts:`);
      console.log(`   Unread: ${unreadCount}`);
      console.log(`   Read: ${readCount}`);
      console.log(`   Total: ${totalCount}`);
      
      // Check users who have notifications
      const usersWithNotifications = await notificationsCollection.distinct('userId');
      console.log(`\n👥 Users with notifications: ${usersWithNotifications.length}`);
      usersWithNotifications.forEach(userId => {
        console.log(`   - ${userId}`);
      });
    } else {
      console.log('\n⚠️ No notifications found in database');
      
      // Check if users collection exists
      const usersCollection = db.collection('users');
      const userCount = await usersCollection.countDocuments();
      console.log(`\n👥 Total users in database: ${userCount}`);
      
      if (userCount > 0) {
        const sampleUsers = await usersCollection.find({}).limit(3).toArray();
        console.log('\n📝 Sample users:');
        sampleUsers.forEach(user => {
          console.log(`   - ${user.email} (${user.username}) - Role: ${user.role}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n🔌 Database connection closed');
  }
}

testNotifications().catch(console.error);
