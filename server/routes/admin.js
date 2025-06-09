const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleware');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');

// Apply protection and admin middleware to all routes
router.use(protect);
router.use(isAdmin);

// Product Management Routes
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/products', async (req, res) => {
  try {
    console.log('Creating product - User:', req.user._id);
    console.log('Request body:', req.body);

    // Create product data with the admin user's ID
    const productData = {
      ...req.body,
      user: req.user._id // Set the user ID from the authenticated admin
    };

    console.log('Product data to create:', productData);
    
    const product = new Product(productData);
    console.log('Product instance created:', product);
    
    const savedProduct = await product.save();
    console.log('Product saved successfully:', savedProduct);
    
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    console.error('Error details:', error.errors);
    res.status(400).json({ 
      message: error.message,
      details: error.errors // Include validation error details
    });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product removed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Order Management Routes
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'id name email')
      .populate('items.product', 'name price image')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/orders/:id/status', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const { status } = req.body;
    if (status === 'delivered') {
      // Set both delivery and payment status
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      order.isPaid = true;
      order.paidAt = Date.now();
    }

    const updatedOrder = await order.save();
    await updatedOrder.populate('user', 'id name email');
    await updatedOrder.populate('items.product', 'name price image');
    
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/orders/:id/notes', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const { note } = req.body;
    if (!order.notes) {
      order.notes = [];
    }

    order.notes.push({
      text: note,
      createdAt: Date.now(),
      createdBy: req.user._id
    });

    const updatedOrder = await order.save();
    await updatedOrder.populate('user', 'id name email');
    await updatedOrder.populate('items.product', 'name price image');
    
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// User Management Routes
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 