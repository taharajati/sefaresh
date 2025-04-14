require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

// Use the environment variable correctly
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sefaresh';

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    
    console.log('Connected to MongoDB');
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'shop_admin' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      mongoose.connection.close();
      return;
    }
    
    // Create new admin
    const admin = new Admin({
      username: 'shop_admin',
      password: 'Sefaresh@1401', // This will be hashed by the pre-save hook
    });
    
    await admin.save();
    
    console.log('Admin created successfully!');
    console.log('Username: shop_admin');
    console.log('Password: Sefaresh@1401');
    
    // Close the connection
    mongoose.connection.close();
    
  } catch (error) {
    console.error('Error creating admin:', error);
    mongoose.connection.close();
  }
}

createAdmin(); 