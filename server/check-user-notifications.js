const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

async function checkUserNotificationMatch() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('IQAC');

    // Get all users
    const users = await db.collection('users').find({}).toArray();
    console.log('\n👥 All Users:');
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.username || user.email} (${user.email}) - ID: ${user._id}`);
    });

    // Get all notifications
    const notifications = await db.collection('notifications').find({}).toArray();
    console.log('\n🔔 All Notifications:');
    notifications.forEach((notif, index) => {
      console.log(`  ${index + 1}. "${notif.title}" - userId: ${notif.userId}, type: ${notif.type}, isRead: ${notif.isRead}`);
    });

    // Check which users have notifications
    console.log('\n🔍 User-Notification Mapping:');
    for (const user of users) {
      const userNotifications = notifications.filter(n => n.userId.toString() === user._id.toString());
      console.log(`\n  👤 ${user.username || user.email} (${user._id}):`);
      if (userNotifications.length === 0) {
        console.log('    ❌ No notifications');
      } else {
        console.log(`    ✅ ${userNotifications.length} notifications:`);
        userNotifications.forEach((notif, index) => {
          console.log(`    ${index + 1}. "${notif.title}" (${notif.isRead ? 'READ' : 'UNREAD'})`);
        });
      }
    }

    // Check for orphaned notifications
    console.log('\n🚫 Orphaned Notifications (no matching user):');
    const orphanedNotifications = notifications.filter(notif => 
      !users.some(user => user._id.toString() === notif.userId.toString())
    );
    if (orphanedNotifications.length === 0) {
      console.log('  ✅ No orphaned notifications');
    } else {
      orphanedNotifications.forEach((notif, index) => {
        console.log(`  ${index + 1}. "${notif.title}" - userId: ${notif.userId} (NO MATCHING USER)`);
      });
    }

    // Get unread counts per user
    console.log('\n📊 Unread Notification Counts:');
    for (const user of users) {
      const unreadCount = notifications.filter(n => 
        n.userId.toString() === user._id.toString() && !n.isRead
      ).length;
      if (unreadCount > 0) {
        console.log(`  👤 ${user.username || user.email}: ${unreadCount} unread`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

checkUserNotificationMatch();
