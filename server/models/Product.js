const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    reviews: [reviewSchema],
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
    },
    reorderPoint: {
      type: Number,
      default: 5,
    },
    lastRestockDate: {
      type: Date,
    },
    stockStatus: {
      type: String,
      enum: ['in_stock', 'low_stock', 'out_of_stock', 'reorder_needed'],
      default: 'in_stock',
    },
    stockAlerts: [{
      type: {
        type: String,
        enum: ['low_stock', 'out_of_stock', 'reorder_needed'],
        required: true
      },
      message: String,
      createdAt: {
        type: Date,
        default: Date.now
      },
      isRead: {
        type: Boolean,
        default: false
      }
    }]
  },
  {
    timestamps: true,
  }
);

// Middleware to update stock status before saving
productSchema.pre('save', function(next) {
  if (this.countInStock <= 0) {
    this.stockStatus = 'out_of_stock';
  } else if (this.countInStock <= this.reorderPoint) {
    this.stockStatus = 'reorder_needed';
  } else if (this.countInStock <= this.lowStockThreshold) {
    this.stockStatus = 'low_stock';
  } else {
    this.stockStatus = 'in_stock';
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product; 