const express = require('express');
const router = express.Router();
const { handleChatbotQuery } = require('../controllers/chatbotController');
const { protect } = require('../middleware/authMiddleware');

// Chatbot route - protected
router.post('/', protect, handleChatbotQuery);

module.exports = router; 