const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config();

const mongoUri = process.env.MONGODB_URI;

async function setUserPassword() {
    let client;
    try {
        console.log('🔑 Setting Known Password for Test User');
        console.log('======================================');
        
        // Connect to MongoDB
        client = new MongoClient(mongoUri);
        await client.connect();
        const db = client.db('IQAC');
        
        const email = 'Samarth@gmail.com';
        const newPassword = 'test123'; // Simple test password
        
        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        
        // Update the user's password
        const result = await db.collection('users').updateOne(
            { email: email },
            { $set: { password: hashedPassword } }
        );
        
        if (result.matchedCount === 0) {
            console.log('❌ User not found');
            return;
        }
        
        if (result.modifiedCount > 0) {
            console.log(`✅ Password updated for ${email}`);
            console.log(`🔑 New password: ${newPassword}`);
            console.log('');
            console.log('🧪 Test Login:');
            console.log(`   Email: ${email}`);
            console.log(`   Password: ${newPassword}`);
            console.log('');
            console.log('📧 This user has 2 notifications waiting!');
        } else {
            console.log('⚠️ No changes made (password might be the same)');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (client) {
            await client.close();
        }
    }
}

setUserPassword();
