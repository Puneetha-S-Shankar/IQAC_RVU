const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
require('dotenv').config();

const usersToUpdate = [
  { email: 'admin@iqac.com', password: 'admin123' },
  { email: 'user@iqac.com', password: 'user123' },
  { email: 'viewer@iqac.com', password: 'viewer123' }
];

async function resetAllPasswords() {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  for (const { email, password } of usersToUpdate) {
    const hash = await bcrypt.hash(password, 12);
    const result = await User.findOneAndUpdate(
      { email },
      { $set: { password: hash } },
      { new: true }
    );
    if (result) {
      console.log(`Password reset successful for ${email}`);
    } else {
      console.log(`User not found: ${email}`);
    }
  }

  mongoose.disconnect();
}

resetAllPasswords(); 