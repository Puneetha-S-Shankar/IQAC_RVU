const { MongoClient } = require('mongodb');
require('dotenv').config();

const mongoUri = process.env.MONGODB_URI;

async function checkAdminNotifications() {
    let client;
    try {
        client = new MongoClient(mongoUri);
        await client.connect();
        const db = client.db('IQAC');
        
        console.log('🔍 Checking Admin User Notifications');
        console.log('====================================');
        
        // Find admin user
        const adminUser = await db.collection('users').findOne({ 
            $or: [
                { email: 'admin@iqac.com' },
                { username: 'admin' },
                { role: 'admin' }
            ]
        });
        
        if (!adminUser) {
            console.log('❌ Admin user not found');
            return;
        }
        
        console.log('✅ Found admin user:');
        console.log(`   Username: ${adminUser.username}`);
        console.log(`   Email: ${adminUser.email}`);
        console.log(`   ID: ${adminUser._id}`);
        console.log(`   Role: ${adminUser.role}`);
        
        // Find notifications for admin
        const adminNotifications = await db.collection('notifications').find({ 
            userId: adminUser._id 
        }).toArray();
        
        console.log(`\n🔔 Admin Notifications (${adminNotifications.length}):`);
        adminNotifications.forEach((notif, index) => {
            console.log(`   ${index + 1}. "${notif.title}"`);
            console.log(`      Type: ${notif.type}`);
            console.log(`      IsRead: ${notif.isRead}`);
            console.log(`      Created: ${notif.createdAt}`);
            console.log(`      UserId: ${notif.userId}`);
            console.log('');
        });
        
        if (adminNotifications.length === 0) {
            console.log('❌ No notifications found for admin user');
            
            // Check if there are notifications with similar userIds
            console.log('\n🔍 Checking for notifications with similar userIds...');
            const allNotifications = await db.collection('notifications').find({}).toArray();
            console.log(`Total notifications in database: ${allNotifications.length}`);
            
            // Look for notifications that might belong to admin
            const possibleAdminNotifs = allNotifications.filter(n => 
                n.userId.toString().includes('86a89d0') || 
                n.type === 'reviewer_approved'
            );
            
            console.log(`Possible admin notifications: ${possibleAdminNotifs.length}`);
            possibleAdminNotifs.forEach((notif, index) => {
                console.log(`   ${index + 1}. "${notif.title}" - userId: ${notif.userId}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (client) await client.close();
    }
}

checkAdminNotifications();
