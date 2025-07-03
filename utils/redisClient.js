// utils/redisClient.js
const { createClient } = require('redis');

const client = createClient({
    username: 'default',
    password: '4GvTt2aTSl7lJLdZfol3xPcu1GjptMRp',
    socket: {
        host: 'redis-13334.c14.us-east-1-2.ec2.redns.redis-cloud.com',
        port: 13334
    }
});

client.on('error', err => console.log('❌ Redis Client Error:', err));

// Connect once at startup
(async () => {
    try {
        await client.connect();
        console.log('✅ Redis connected successfully');
    } catch (err) {
        console.error('❌ Redis connection failed:', err);
    }
})();

module.exports = client;
