const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

// Helper function to get shipping information
const getShippingInfo = () => {
  return {
    response: [
      {
        text: "Here's our shipping information:\n\n" +
              "• Standard shipping takes 2-5 business days to ship\n\n" +
              "• Shipping charge of ₹1000 will be added for orders below ₹1999\n\n" +
              "• Free delivery for orders above ₹1999\n\n" +
              "All orders are processed within 24 hours of confirmation.",
        type: 'info'
      },
      {
        text: "Anything else apart from this I can help you with?",
        type: 'question'
      }
    ],
    buttons: ["Yes", "No"]
  };
};

// Helper function to get featured products
const getFeaturedProducts = async () => {
  try {
    const products = await Product.find({ rating: { $gte: 4.5 } });
    if (products.length === 0) {
      return {
        response: [
          {
            text: "Currently, we don't have any featured products available.",
            type: 'info'
          },
          {
            text: "Anything else apart from this I can help you with?",
            type: 'question'
          }
        ],
        buttons: ["Yes", "No"]
      };
    }
    
    let response = "Here are our featured products:\n\n";
    products.forEach((product, index) => {
      response += `• ${product.name} - ₹${product.price}\n`;
    });
    response += "\nThese products have received excellent ratings from our customers!";
    
    return {
      response: [
        {
          text: response,
          type: 'info'
        },
        {
          text: "Anything else apart from this I can help you with?",
          type: 'question'
        }
      ],
      buttons: ["Yes", "No"]
    };
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return {
      response: [
        {
          text: "I apologize, but I'm having trouble fetching the featured products. Please try again later.",
          type: 'info'
        },
        {
          text: "Anything else apart from this I can help you with?",
          type: 'question'
        }
      ],
      buttons: ["Yes", "No"]
    };
  }
};

// Helper function to get warranty information
const getWarrantyInfo = (type) => {
  if (type === 'faulty') {
    return {
      response: "Dear Customer,\n\n" +
                "Greetings from TechBot!\n\n" +
                "If the received product is faulty then kindly raise a support ticket from our website to claim the warranty.\n\n" +
                "Each and every product has a different warranty. Please check the warranty details on the product page. Minimum 15 days warranty is there on every product\n\n" +
                "Make sure to contact us within warranty period of order delivery, else the return will not be possible.\n\n" +
                "Have a nice day.\n\n" +
                "Anything else apart from this I can help you with?",
      buttons: ["Yes", "No"]
    };
  } else if (type === 'damaged' || type === 'missing' || type === 'different') {
    return {
      response: "Dear Customer,\n\n" +
                "Greetings from TechBot!\n\n" +
                "If the received product is Damaged/Different/Missing then kindly raise a support ticket from our website.\n\n" +
                "Make sure to contact us within 2 days from the order delivery date, else the return will not be possible.\n\n" +
                "Have a nice day\n\n" +
                "Anything else apart from this I can help you with?",
      buttons: ["Yes", "No"]
    };
  }
  return null;
};

// Helper function to get payment options
const getPaymentOptions = () => {
  return {
    response: [
      {
        text: "Dear Customer,\n\n" +
              "Greetings from TechBot!\n\n" +
              "Currently, we only accept Cash on Delivery (COD) as the payment method.\n\n" +
              "Important Notes:\n\n" +
              "• Cancellation cannot be done once the order is placed\n\n" +
              "• We wont be charging any extra amount for COD orders\n\n" +
              "Thank you for your understanding.",
        type: 'info'
      },
      {
        text: "Anything else apart from this I can help you with?",
        type: 'question'
      }
    ],
    buttons: ["Yes", "No"]
  };
};

const handleChatbotQuery = async (req, res) => {
  try {
    const { message } = req.body;
    const userMessage = message.toLowerCase();

    // Check for "no" response to follow-up question
    if (userMessage.includes('no') || userMessage.includes('nope') || userMessage.includes('nothing else')) {
      return res.json({
        response: [
          {
            text: "Thank you for contacting TechBot\nHave a nice day.",
            type: 'info'
          }
        ],
        buttons: [],
        shouldClose: true
      });
    }

    // Greetings
    if (userMessage.match(/^(hi|hello|hey|greetings)/i)) {
      return res.json({
        response: "Hi! I'm TechBot, your virtual assistant for TechStore. How can I help you today? 😊\n\n" +
          "I can help you with:",
        buttons: [
          "Shipping & Delivery",
          "Warranty Details",
          "Payment Options",
          "Out of Stock Products",
          "Featured Products",
          "Track Order",
          "Bulk Orders"
        ]
      });
    }

    // Track order queries
    if (userMessage.includes('track') || userMessage.includes('order status') || userMessage.includes('my order')) {
      if (!req.body.userId) {
        return res.json({
          response: "Your session has expired.",
          buttons: []
        });
      }
      
      return res.json({
        response: "To track your order, please visit the 'My Orders' section in your account.\n\n" +
                 "Anything else apart from this I can help you with?",
        buttons: ["Yes", "No"]
      });
    }

    // Featured products queries
    if (userMessage.includes('featured') || userMessage.includes('top') || 
        userMessage.includes('best') || userMessage.includes('popular')) {
      const featuredProducts = await getFeaturedProducts();
      return res.json(featuredProducts);
    }

    // Shipping queries
    if (userMessage.includes('shipping') || userMessage.includes('delivery') || 
        userMessage.includes('timeline') || userMessage.includes('when will i get')) {
      const shippingInfo = getShippingInfo();
      return res.json(shippingInfo);
    }

    // Stock status queries
    if (userMessage.includes('stock') || userMessage.includes('available') || 
        userMessage.includes('out of stock') || userMessage.includes('when will you have')) {
      return res.json({
        response: [
          {
            text: "Dear Customer,\n\n" +
                  "Greetings from TechBot!\n\n" +
                  "• Generally, the out of stock product come in stock within 3-4 working weeks\n\n" +
                  "• Still it depends on the supplier\n\n" +
                  "• Meanwhile, please join the waitlist so that you will receive a notification\n\n" +
                  "Have a nice day!",
            type: 'info'
          },
          {
            text: "Anything else apart from this I can help you with?",
            type: 'question'
          }
        ],
        buttons: ["Yes", "No"]
      });
    }

    // Warranty queries
    if (userMessage.includes('warranty') || userMessage.includes('guarantee') || 
        userMessage.includes('coverage') || userMessage.includes('protection') ||
        userMessage.includes('faulty') ||
        userMessage.includes('damaged') || userMessage.includes('missing') ||
        userMessage.includes('different')) {
      
      // Check for faulty conditions
      if (userMessage.includes('faulty')) {
        return res.json({
          response: [
            {
              text: "Dear Customer,\n\n" +
                    "Greetings from TechBot!\n\n" +
                    "• If the received product is faulty then kindly raise a support ticket from our website to claim the warranty\n\n" +
                    "• Each and every product has a different warranty. Please check the warranty details on the product page\n\n" +
                    "• Minimum 15 days warranty is there on every product\n\n" +
                    "• Make sure to contact us within warranty period of order delivery, else the return will not be possible\n\n" +
                    "Have a nice day.",
              type: 'info'
            },
            {
              text: "Anything else apart from this I can help you with?",
              type: 'question'
            }
          ],
          buttons: ["Yes", "No"]
        });
      }
      
      // Check for damaged/missing/different conditions
      if (userMessage.includes('damaged') || userMessage.includes('missing') || 
          userMessage.includes('different')) {
        return res.json({
          response: [
            {
              text: "Dear Customer,\n\n" +
                    "Greetings from TechBot!\n\n" +
                    "• If the received product is Damaged/Different/Missing then kindly raise a support ticket from our website\n\n" +
                    "• Make sure to contact us within 2 days from the order delivery date, else the return will not be possible\n\n" +
                    "Have a nice day",
              type: 'info'
            },
            {
              text: "Anything else apart from this I can help you with?",
              type: 'question'
            }
          ],
          buttons: ["Yes", "No"]
        });
      }

      return res.json({
        response: "Please specify if your product is:",
        buttons: [
          "Faulty",
          "Damaged/Different/Missing"
        ]
      });
    }

    // Payment queries
    if (userMessage.includes('payment') || userMessage.includes('pay') || 
        userMessage.includes('credit card') || userMessage.includes('debit card') ||
        userMessage.includes('upi') || userMessage.includes('cod') || 
        userMessage.includes('emi') || userMessage.includes('cancel')) {
      const paymentOptions = getPaymentOptions();
      return res.json(paymentOptions);
    }

    // Bulk order queries
    if (userMessage.includes('bulk order') || userMessage.includes('quotation') || 
        userMessage.includes('bulk') || userMessage.includes('wholesale')) {
      return res.json({
        response: [
          {
            text: "Dear Customer,\n\n" +
                  "We really appreciate you putting your trust in TechStore\n" +
                  "For quotation and best pricing on bulk orders\n\n" +
                  "Please click on the below link and raise a support ticket for further assistance-\n" +
                  "Link - https://support/Tickets/Submit\n\n" +
                  "Note - Once you raise a ticket for quotation then the sales team will get back to you within 24-48 working hours.",
            type: 'info'
          },
          {
            text: "Anything else apart from this I can help you with?",
            type: 'question'
          }
        ],
        buttons: ["Yes", "No"]
      });
    }

    // Default response for unrecognized queries
    return res.json({
      response: "What can I help you with?\n\n" +
                "I can assist you with:",
      buttons: [
        "Shipping & Delivery",
        "Warranty Details",
        "Payment Options",
        "Out of Stock Products",
        "Featured Products",
        "Track Order",
        "Bulk Orders"
      ]
    });

  } catch (error) {
    console.error('Chatbot Error:', error);
    res.status(500).json({
      response: "I apologize, but I'm having trouble processing your request. Please try again later or contact our support team.",
      buttons: []
    });
  }
};

module.exports = {
  handleChatbotQuery
}; 