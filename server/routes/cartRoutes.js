const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    console.log('Adding to cart:', { productId, quantity });
    
    const user = await User.findById(req.user._id);
    if (!user) {
      console.log('User not found:', req.user._id);
      return res.status(404).json({ message: 'User not found' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      console.log('Product not found:', productId);
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product already in cart
    const cartItemIndex = user.cart.findIndex(
      item => item.product.toString() === productId
    );

    if (cartItemIndex > -1) {
      // Update quantity if product exists
      user.cart[cartItemIndex].quantity += quantity;
      console.log('Updated existing cart item quantity');
    } else {
      // Add new product to cart
      user.cart.push({ product: productId, quantity });
      console.log('Added new item to cart');
    }

    await user.save();
    console.log('Cart saved successfully');
    
    // Populate cart items with product details
    const populatedUser = await User.findById(user._id)
      .populate('cart.product');

    res.json(populatedUser.cart);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(400).json({ message: error.message });
  }
});

// @desc    Get cart items
// @route   GET /api/cart
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('cart.product');
    res.json(user.cart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:productId
// @access  Private
router.put('/:productId', protect, async (req, res) => {
  try {
    const { quantity } = req.body;
    const user = await User.findById(req.user._id);
    
    const cartItemIndex = user.cart.findIndex(
      item => item.product.toString() === req.params.productId
    );

    if (cartItemIndex > -1) {
      user.cart[cartItemIndex].quantity = quantity;
      await user.save();
      
      const populatedUser = await User.findById(user._id)
        .populate('cart.product');
      res.json(populatedUser.cart);
    } else {
      res.status(404).json({ message: 'Product not found in cart' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
router.delete('/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = user.cart.filter(
      item => item.product.toString() !== req.params.productId
    );
    await user.save();
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
router.delete('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = [];
    await user.save();
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 