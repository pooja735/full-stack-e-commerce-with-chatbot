const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const User = require('./models/User');
const Product = require('./models/Product');
const products = require('./data/products');

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const importData = async () => {
  try {
    // Delete all existing data
    await User.deleteMany();
    await Product.deleteMany();

    // Create new admin user without hashing password
    const adminUser = await User.create({
      name: 'alice',
      email: 'alice@gmail.com',
      password: 'alice',
      isAdmin: true
    });

    console.log('Admin user created successfully'.green);

    // Add admin user ID to all products
    const productsWithUser = products.map(product => ({
      ...product,
      user: adminUser._id
    }));

    // Insert products
    await Product.insertMany(productsWithUser);
    console.log('Products imported successfully'.green);

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`.red);
    process.exit(1);
  }
};

importData(); 