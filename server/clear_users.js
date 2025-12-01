require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

const clearUsers = async () => {
    await connectDB();
    const result = await User.deleteMany({});
    console.log(`Deleted ${result.deletedCount} users from database`);
    process.exit();
};

clearUsers();
