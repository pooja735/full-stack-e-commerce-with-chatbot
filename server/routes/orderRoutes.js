const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');

// @desc    Create new order from cart
// @route   POST /api/orders
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.product');
    
    if (user.cart.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Check stock availability and reduce stock
    for (const item of user.cart) {
      const product = await Product.findById(item.product._id);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product.name} not found` });
      }
      
      if (product.countInStock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.countInStock}, Requested: ${item.quantity}` 
        });
      }

      // Reduce stock
      product.countInStock -= item.quantity;
      await product.save();
    }

    // Calculate total amount and prepare order items
    const orderItems = user.cart.map(item => ({
      product: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      image: item.product.image
    }));

    const totalAmount = user.cart.reduce(
      (total, item) => total + (item.product.price * item.quantity),
      0
    );

    // Create new order using Order model
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      paymentMethod: 'COD' // Default to Cash on Delivery
    });

    const createdOrder = await order.save();

    // Clear cart after order creation
    user.cart = [];
    await user.save();

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(400).json({ message: error.message });
  }
});

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name price image')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update order delivery status
// @route   PUT /api/orders/:orderId/deliver
// @access  Private/Admin
router.put('/:orderId/deliver', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();
    
    // Automatically mark payment as paid when order is delivered
    order.isPaid = true;
    order.paidAt = Date.now();

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:orderId
// @access  Private
router.get('/:orderId', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('items.product', 'name price image');
    
    if (order) {
      // Check if the order belongs to the user
      if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
