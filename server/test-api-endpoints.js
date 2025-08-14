// Test script to call notification API endpoints
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODVhYjdhMmIxNWY4MTgzZDM2MmFhY2IiLCJpYXQiOjE3NTUxOTc4MzYsImV4cCI6MTc1NTI4NDIzNn0.f7nlepXz1NW86bqklPwykJQy7QiTc2WER5mUr27VJ6w';

const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
};

async function testAPIs() {
    console.log('🧪 Testing Notification API Endpoints');
    console.log('=====================================');
    
    try {
        // Test 1: Get all notifications
        console.log('\n📋 Test 1: GET /api/notifications');
        const response1 = await axios.get(`${API_BASE}/notifications`, { headers });
        console.log('✅ Success - Status:', response1.status);
        console.log('📊 Data:', response1.data);
        console.log('📝 Count:', response1.data.length);
        
        // Test 2: Get categorized notifications
        console.log('\n📂 Test 2: GET /api/notifications/categorized');
        const response2 = await axios.get(`${API_BASE}/notifications/categorized`, { headers });
        console.log('✅ Success - Status:', response2.status);
        console.log('📊 Data structure:', Object.keys(response2.data));
        console.log('📝 New notifications:', response2.data.new?.length || 0);
        console.log('📝 Read notifications:', response2.data.read?.length || 0);
        console.log('📝 All notifications:', response2.data.all?.length || 0);
        
        // Test 3: Get only unread notifications
        console.log('\n🔥 Test 3: GET /api/notifications?category=new');
        const response3 = await axios.get(`${API_BASE}/notifications?category=new`, { headers });
        console.log('✅ Success - Status:', response3.status);
        console.log('📊 Data:', response3.data);
        console.log('📝 Unread count:', response3.data.length);
        
        if (response3.data.length > 0) {
            console.log('\n🔔 First notification details:');
            const firstNotif = response3.data[0];
            console.log('   Title:', firstNotif.title);
            console.log('   Type:', firstNotif.type);
            console.log('   IsRead:', firstNotif.isRead);
            console.log('   UserId:', firstNotif.userId);
            console.log('   Created:', firstNotif.createdAt);
        }
        
        console.log('\n✅ All API tests passed! The backend is working correctly.');
        
    } catch (error) {
        console.error('❌ API Test failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testAPIs();
