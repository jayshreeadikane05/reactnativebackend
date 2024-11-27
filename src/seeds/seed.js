const mongoose = require('mongoose');
const User = require('../models/UserModel'); 
const bcrypt = require('bcrypt');
require('dotenv').config();

async function seedAdmin() {
    const adminEmail = 'admin@mail.com';
    const adminPassword = 'admin@123';
    const username ='Admin01'
    const role ='admin'

    await mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    // Remove any existing admin user
    await User.deleteOne({ email: adminEmail });

    // Hash the password before creating the user
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    console.log("Generated hashed password:", hashedPassword); 

    const adminUser = new User({
        email: adminEmail,
        password: hashedPassword, 
        username: username,
        role:role
    });

    await adminUser.save(); 

    console.log('Admin user created.');
    console.log("adminUser>>>>", adminUser); 

    await mongoose.disconnect();
}

seedAdmin().catch(err => {
    console.error(err);
    process.exit(1);
});


