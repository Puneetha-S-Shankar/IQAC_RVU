// migrate_users_from_json.js
const fs = require('fs');
const path = require('path');
const mongoDB = require('./config/database');

async function migrateUsers() {
  try {
    // Read users from database.json
    const dbJsonPath = path.join(__dirname, 'database.json');
    const dbJson = JSON.parse(fs.readFileSync(dbJsonPath, 'utf-8'));
    const users = dbJson.users || [];

    // Connect to MongoDB
    await mongoDB.connect();
    const usersCollection = mongoDB.getDatabase().collection('users');

    let added = 0, skipped = 0;
    for (const user of users) {
      // Check if user already exists by email or username
      const exists = await usersCollection.findOne({ $or: [ { email: user.email }, { username: user.username } ] });
      if (exists) {
        skipped++;
        continue;
      }
      // Remove _id if present (let MongoDB generate it)
      const { _id, ...userData } = user;
      await usersCollection.insertOne(userData);
      added++;
    }
    console.log(`Migration complete. Added: ${added}, Skipped: ${skipped}`);
    await mongoDB.disconnect();
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

// Add this function to update all users with missing fields
async function updateExistingUsersWithDefaults() {
  try {
    await mongoDB.connect();
    const usersCollection = mongoDB.getDatabase().collection('users');
    const users = await usersCollection.find({}).toArray();
    let updated = 0;
    for (const user of users) {
      const update = {};
      if (!user.username && user.email) update.username = user.email.split('@')[0];
      if (!user.firstName) update.firstName = '';
      if (!user.lastName) update.lastName = '';
      if (user.isActive === undefined) update.isActive = true;
      if (!user.createdAt) update.createdAt = new Date();
      if (!user.lastLogin) update.lastLogin = new Date();
      if (!user.role) update.role = 'user';
      if (Object.keys(update).length > 0) {
        await usersCollection.updateOne({ _id: user._id }, { $set: update });
        updated++;
      }
    }
    console.log(`Updated ${updated} existing users with default fields.`);
    await mongoDB.disconnect();
  } catch (err) {
    console.error('User update error:', err);
    process.exit(1);
  }
}

// If run directly, update users after migration
if (require.main === module) {
  migrateUsers().then(updateExistingUsersWithDefaults);
} 