require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

const viewUserKeys = async () => {
    await connectDB();
    const users = await User.find({});

    console.log('\n=== REGISTERED USERS WITH PUBLIC KEYS ===\n');

    users.forEach((user, index) => {
        console.log(`\n--- User ${index + 1}: ${user.username} ---`);
        console.log('User ID:', user._id);
        console.log('Created At:', user.createdAt);
        console.log('\nEncryption Public Key (JWK):');
        console.log(JSON.stringify(user.publicKey, null, 2));
        console.log('\nSigning Public Key (JWK):');
        console.log(JSON.stringify(user.signingPublicKey, null, 2));
        console.log('\n' + '='.repeat(60));
    });

    console.log(`\nTotal Users: ${users.length}\n`);
    process.exit();
};

viewUserKeys();
