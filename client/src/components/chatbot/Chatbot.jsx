import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);

  const suggestions = [
    "What are your shipping policies?",
    "What is your warranty policy?",
    "What payment methods do you accept?",
    "Bulk Orders"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message = input) => {
    if (!message.trim()) return;

    const userMessage = message.trim();
    setInput('');
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:5000/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await response.json();
      
      if (response.ok) {
        setTimeout(() => {
          if (Array.isArray(data.response)) {
            setMessages(prev => [...prev, { 
              text: data.response[0].text, 
              sender: 'bot',
              type: data.response[0].type
            }]);

            if (data.response[1]) {
              setTimeout(() => {
                setMessages(prev => [...prev, { 
                  text: data.response[1].text, 
                  sender: 'bot',
                  type: data.response[1].type,
                  buttons: data.buttons
                }]);

                if (data.shouldClose) {
                  setTimeout(() => {
                    setIsOpen(false);
                    setTimeout(() => {
                      setMessages([]);
                    }, 300);
                  }, 2000);
                }
              }, 2000);
            } else if (data.shouldClose) {
              setTimeout(() => {
                setIsOpen(false);
                setTimeout(() => {
                  setMessages([]);
                }, 300);
              }, 2000);
            }
          } else {
            setMessages(prev => [...prev, { 
              text: data.response || data.message, 
              sender: 'bot',
              buttons: data.buttons 
            }]);

            if (data.shouldClose) {
              setTimeout(() => {
                setIsOpen(false);
                setTimeout(() => {
                  setMessages([]);
                }, 300);
              }, 2000);
            }
          }
        }, 2000);
      } else {
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            text: 'Sorry, I encountered an error. Please try again.', 
            sender: 'bot' 
          }]);
        }, 2000);
      }
    } catch (error) {
      console.error('Chatbot Error:', error);
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          text: 'Sorry, I encountered an error. Please try again.', 
          sender: 'bot' 
        }]);
      }, 2000);
    } finally {
      setIsTyping(false);
    }
  };

  const handleButtonClick = (buttonText) => {
    handleSendMessage(buttonText);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setShowSuggestions(true);
    setTimeout(() => {
      setMessages([]);
    }, 300);
  };

  const handleSuggestionClick = (suggestion) => {
    setShowSuggestions(false);
    handleSendMessage(suggestion);
  };

  return (
    <div className="chatbot-container">
      {!isOpen && (
        <button 
          className="chatbot-toggle"
          onClick={() => setIsOpen(true)}
          aria-label="Open chat"
        >
          <div className="chatbot-icon">
            <span role="img" aria-label="robot">🤖</span>
          </div>
        </button>
      )}

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h5>Chat Assistant</h5>
            <button 
              className="close-button"
              onClick={handleClose}
              aria-label="Close chat"
            >
              <span>×</span>
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.length === 0 && (
              <div className="welcome-message">
                👋 Hi! I'm your shopping assistant. How can I help you today?
              </div>
            )}
            
            {showSuggestions && (
              <div className="suggestions-container">
                <p className="suggestions-title">You can ask me about:</p>
                <div className="suggestions-list">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="suggestion-button"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`message ${message.sender}-message ${message.type || ''}`}
              >
                <div className="message-content">
                  {message.text}
                  {message.buttons && (
                    <div className="button-group">
                      {message.buttons.map((button, btnIndex) => (
                        <button
                          key={btnIndex}
                          className="btn btn-sm btn-outline-primary response-button"
                          onClick={() => handleButtonClick(button)}
                        >
                          {button}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button 
                className="btn btn-primary"
                onClick={() => handleSendMessage()}
              >
                <span role="img" aria-label="send">➤</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot; 