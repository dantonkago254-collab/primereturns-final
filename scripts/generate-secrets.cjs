const crypto = require('crypto');

const jwtSecret = crypto.randomBytes(32).toString('hex');
const cronSecret = crypto.randomBytes(32).toString('hex');
const adminPassword = `Prime-${crypto.randomBytes(9).toString('base64url')}-2026`;

console.log('Copy these into Railway Variables:');
console.log('');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`CRON_SECRET=${cronSecret}`);
console.log(`ADMIN_PASSWORD=${adminPassword}`);
console.log('');
console.log('Keep these private. Do not paste them in public chats or commit them to GitHub.');