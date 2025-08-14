const jwt = require('jsonwebtoken');
require('dotenv').config();

// This script will help debug JWT token contents
console.log('🔐 JWT Token Debug Tool');
console.log('========================');

// Check if JWT_SECRET is available
if (!process.env.JWT_SECRET) {
    console.log('❌ JWT_SECRET not found in environment');
    console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('JWT') || key.includes('SECRET')));
    process.exit(1);
}

console.log('✅ JWT_SECRET found');
console.log('JWT_SECRET length:', process.env.JWT_SECRET.length);

// Function to decode a token
function decodeToken(token) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('\n🎫 Token decoded successfully:');
        console.log('User ID:', decoded.id);
        console.log('Username:', decoded.username);
        console.log('Email:', decoded.email);
        console.log('Role:', decoded.role);
        console.log('Issued at:', new Date(decoded.iat * 1000));
        console.log('Expires at:', new Date(decoded.exp * 1000));
        console.log('Full payload:', JSON.stringify(decoded, null, 2));
        return decoded;
    } catch (error) {
        console.log('\n❌ Token verification failed:');
        console.log('Error:', error.message);
        
        // Try to decode without verification to see the payload
        try {
            const decoded = jwt.decode(token, { complete: true });
            console.log('\n🔍 Token payload (unverified):');
            console.log(JSON.stringify(decoded, null, 2));
        } catch (decodeError) {
            console.log('Cannot decode token:', decodeError.message);
        }
        return null;
    }
}

// Example usage
console.log('\n📝 Usage:');
console.log('To test a token, call: decodeToken("your-jwt-token-here")');
console.log('\nOr set TOKEN environment variable and run again');

if (process.env.TOKEN) {
    console.log('\n🧪 Testing provided token...');
    decodeToken(process.env.TOKEN);
}

// Export for use in other scripts
module.exports = { decodeToken };
