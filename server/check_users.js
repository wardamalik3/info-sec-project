require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

const checkUsers = async () => {
    await connectDB();
    const users = await User.find({}, 'username');
    console.log('Registered Users:', users.map(u => u.username));
    process.exit();
};

checkUsers();
