const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

async function createTestNotifications() {
    let client;
    try {
        client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        const db = client.db('IQAC');
        
        console.log('🔍 Creating test notifications for admin...');
        
        // Find admin user
        const admin = await db.collection('users').findOne({ email: 'admin@iqac.com' });
        if (!admin) {
            console.log('❌ Admin user not found');
            return;
        }
        
        console.log('✅ Found admin:', { id: admin._id, email: admin.email });
        
        // Create test notifications
        const testNotifications = [
            {
                userId: admin._id,
                title: 'Welcome to IQAC System',
                message: 'Your admin account has been activated successfully.',
                type: 'system_notification',
                isRead: false,
                createdAt: new Date(),
                priority: 'normal',
                navigationPath: '/dashboard'
            },
            {
                userId: admin._id,
                title: 'New Document Submitted',
                message: 'A new document has been submitted for review.',
                type: 'document_submitted',
                isRead: false,
                createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
                priority: 'high',
                navigationPath: '/documents'
            },
            {
                userId: admin._id,
                title: 'System Maintenance Scheduled',
                message: 'System maintenance is scheduled for tonight at 2 AM.',
                type: 'maintenance',
                isRead: true, // This one is already read
                readAt: new Date(Date.now() - 1000 * 60 * 15), // Read 15 minutes ago
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
                priority: 'normal',
                navigationPath: '/system'
            },
            {
                userId: admin._id,
                title: 'Weekly Report Available',
                message: 'The weekly analytics report is now available for download.',
                type: 'report_ready',
                isRead: true, // This one is also read
                readAt: new Date(Date.now() - 1000 * 60 * 45), // Read 45 minutes ago
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
                priority: 'low',
                navigationPath: '/reports'
            }
        ];
        
        // Insert notifications
        const result = await db.collection('notifications').insertMany(testNotifications);
        console.log(`✅ Created ${result.insertedCount} test notifications`);
        
        // Verify notifications
        const adminNotifications = await db.collection('notifications').find({ userId: admin._id }).toArray();
        console.log(`\n📊 Admin now has ${adminNotifications.length} total notifications:`);
        
        const unreadCount = adminNotifications.filter(n => !n.isRead).length;
        const readCount = adminNotifications.filter(n => n.isRead).length;
        
        console.log(`   📥 Unread: ${unreadCount}`);
        console.log(`   📖 Read: ${readCount}`);
        
        console.log('\n🔔 Notification details:');
        adminNotifications.forEach((notif, index) => {
            console.log(`   ${index + 1}. "${notif.title}" - ${notif.isRead ? 'READ' : 'UNREAD'}`);
        });
        
        console.log('\n✅ Test notifications created successfully!');
        console.log('🔄 Refresh the dashboard to see the notifications.');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (client) await client.close();
    }
}

createTestNotifications();
