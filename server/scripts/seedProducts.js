require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/productModel');
const { products } = require('../../client/src/data/products');

const seedProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB successfully');

    // Drop the existing collection to remove all indexes
    await mongoose.connection.db.dropCollection('products').catch(() => {
      console.log('No existing products collection to drop');
    });
    console.log('Dropped existing collection');

    // Create the collection with proper schema
    await Product.createCollection();
    console.log('Created new products collection');

    // Transform products to match the schema
    const transformedProducts = products.map(product => {
      // Remove the id field and transform the data
      const { id, stock, ...productData } = product;
      return {
        user: new mongoose.Types.ObjectId(), // Admin user ID
        ...productData,
        countInStock: stock, // Map stock to countInStock
        reviews: [],
        numReviews: 0,
        rating: product.rating || 0
      };
    });

    // Insert new products
    const result = await Product.insertMany(transformedProducts);
    console.log(`Successfully seeded ${result.length} products`);

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

// Run the seed function
seedProducts(); 