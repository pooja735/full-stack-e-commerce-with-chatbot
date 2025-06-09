import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Button, Form, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/global.css';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkoutTime, setCheckoutTime] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const { data } = await axios.get('http://localhost:5000/api/cart', config);
      setCartItems(data);
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load cart');
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.put(`http://localhost:5000/api/cart/${productId}`, { quantity }, config);
      fetchCart();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update quantity');
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.delete(`http://localhost:5000/api/cart/${productId}`, config);
      fetchCart();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.delete('http://localhost:5000/api/cart', config);
      fetchCart();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to clear cart');
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal < 1999 ? 1000 : 0;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping();
  };

  const formatDateTime = (date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const proceedToCheckout = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const currentDateTime = new Date();
      setCheckoutTime(currentDateTime);

      const orderData = {
        items: cartItems.map(item => ({
          product: item.product._id,
          name: item.product.name,
          price: Number(item.product.price),
          image: item.product.image,
          quantity: Number(item.quantity)
        })),
        totalAmount: calculateTotal(),
        paymentMethod: 'COD'
      };

      const response = await axios.post('http://localhost:5000/api/orders', orderData, config);
      
      if (response.data) {
        await axios.delete('http://localhost:5000/api/cart', config);
        navigate('/orders', { 
          state: { 
            newOrder: {
              ...response.data,
              orderDateTime: currentDateTime
            }
          } 
        });
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create order');
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="loading-spinner mx-auto"></div>
      </Container>
    );
  }

  return (
    <Container className="py-5 page-transition">
      <h1 className="mb-4 text-center fw-bold" style={{ color: 'var(--primary-color)' }}>
        Shopping Cart
      </h1>
      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      {cartItems.length === 0 ? (
        <Card className="text-center p-5">
          <Card.Body>
            <i className="fas fa-shopping-cart mb-3" style={{ fontSize: '3rem', color: 'var(--text-light)' }}></i>
            <p className="mb-4">Your cart is empty.</p>
            <Button 
              variant="primary" 
              onClick={() => navigate('/shop')}
              className="rounded-pill px-4"
            >
              Continue Shopping
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          <Col md={8}>
            <ListGroup variant="flush">
              {cartItems.map((item) => (
                <ListGroup.Item key={item.product._id} className="py-4 cart-item">
                  <Row className="align-items-center">
                    <Col md={2}>
                      <div className="overflow-hidden rounded">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="img-fluid product-image"
                        />
                      </div>
                    </Col>
                    <Col md={4}>
                      <h5 className="mb-1">{item.product.name}</h5>
                      <p className="text-muted mb-0 price-tag">₹{item.product.price.toFixed(2)}</p>
                    </Col>
                    <Col md={3}>
                      <div className="quantity-control">
                        <Form.Control
                          as="select"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.product._id, Number(e.target.value))}
                          className="border-0 bg-transparent"
                        >
                          {[...Array(10).keys()].map(x => (
                            <option key={x + 1} value={x + 1}>
                              {x + 1}
                            </option>
                          ))}
                        </Form.Control>
                      </div>
                    </Col>
                    <Col md={2}>
                      <p className="mb-0 fw-bold price-tag">
                        ₹{(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </Col>
                    <Col md={1}>
                      <Button
                        variant="link"
                        onClick={() => removeFromCart(item.product._id)}
                        className="text-danger p-0"
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>

            <div className="d-flex justify-content-between mt-4">
              <Button 
                variant="outline-danger" 
                onClick={clearCart}
                className="rounded-pill"
              >
                <i className="fas fa-trash me-2"></i>
                Clear Cart
              </Button>
              <Button 
                variant="outline-primary" 
                onClick={() => navigate('/shop')}
                className="rounded-pill"
              >
                <i className="fas fa-shopping-bag me-2"></i>
                Continue Shopping
              </Button>
            </div>
          </Col>

          <Col md={4}>
            <Card className="position-sticky" style={{ top: '2rem' }}>
              <Card.Body>
                <h4 className="mb-4 fw-bold">Cart Summary</h4>
                <ListGroup variant="flush">
                  <ListGroup.Item className="d-flex justify-content-between border-0">
                    <span className="text-muted">Subtotal ({cartItems.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                    <span className="fw-bold">₹{calculateSubtotal().toFixed(2)}</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between border-0">
                    <span className="text-muted">Shipping</span>
                    <span className={calculateShipping() > 0 ? "text-danger" : "text-success"}>
                      {calculateShipping() > 0 ? `₹${calculateShipping().toFixed(2)}` : 'Free'}
                    </span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between border-0">
                    <span className="fw-bold">Total</span>
                    <span className="price-tag">₹{calculateTotal().toFixed(2)}</span>
                  </ListGroup.Item>
                </ListGroup>
                <div className="mt-3 text-center">
                  <small className="text-muted">
                    {calculateSubtotal() < 1999 && (
                      <span className="text-danger">
                        * Shipping charge of ₹1000 will be added for orders below ₹1999
                      </span>
                    )}
                  </small>
                  <div className="mt-2">
                    <small className="text-muted">
                      <i className="fas fa-truck me-1"></i>
                      Orders typically ship within 2-5 business days
                    </small>
                  </div>
                  {checkoutTime && (
                    <div className="mt-2">
                      <small className="text-muted">
                        <i className="fas fa-clock me-1"></i>
                        Order placed at: {formatDateTime(checkoutTime)}
                      </small>
                    </div>
                  )}
                </div>
                <Button
                  variant="primary"
                  className="w-100 mt-3 rounded-pill"
                  onClick={proceedToCheckout}
                  disabled={cartItems.length === 0}
                >
                  <i className="fas fa-lock me-2"></i>
                  Proceed to Checkout (COD)
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default CartPage; 