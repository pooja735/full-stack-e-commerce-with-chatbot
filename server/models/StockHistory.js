const mongoose = require('mongoose');

const stockHistorySchema = mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product'
  },
  previousStock: {
    type: Number,
    required: true
  },
  newStock: {
    type: Number,
    required: true
  },
  changeType: {
    type: String,
    required: true,
    enum: ['order', 'restock', 'adjustment']
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  notes: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const StockHistory = mongoose.model('StockHistory', stockHistorySchema);

module.exports = StockHistory; 