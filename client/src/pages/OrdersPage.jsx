import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Alert } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../styles/global.css';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchOrders();
    // If there's a new order in the navigation state, add it to the orders list
    if (location.state?.newOrder) {
      setOrders(prevOrders => [location.state.newOrder, ...prevOrders]);
    }
  }, [location.state]);

  const calculateOrderTotal = (items) => {
    if (!Array.isArray(items)) {
      console.log('Items is not an array:', items);
      return 0;
    }
    
    console.log('Calculating total for items:', JSON.stringify(items, null, 2));
    
    const total = items.reduce((sum, item) => {
      console.log('Processing item:', JSON.stringify(item, null, 2));
      const price = Number(item.price || item.product?.price) || 0;
      const quantity = Number(item.quantity) || 0;
      const subtotal = price * quantity;
      console.log(`Item calculation: price=${price}, quantity=${quantity}, subtotal=${subtotal}`);
      return sum + subtotal;
    }, 0);
    
    console.log('Final calculated total:', total);
    return total;
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const { data } = await axios.get('http://localhost:5000/api/orders', config);

      const processedOrders = Array.isArray(data) ? data.map(order => {
        const orderItems = order.items || order.products || order.orderItems || [];
        const subtotal = calculateOrderTotal(orderItems);
        const shippingCharge = order.shippingCharge || (subtotal < 1999 ? 1000 : 0);
        
        return {
          ...order,
          items: orderItems,
          subtotal: subtotal,
          shippingCharge: shippingCharge,
          total: Number(order.total) || (subtotal + shippingCharge)
        };
      }) : [];
      
      setOrders(processedOrders);
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load orders');
      setLoading(false);
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
        My Orders
      </h1>
      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      {!orders || orders.length === 0 ? (
        <Card className="text-center p-5">
          <Card.Body>
            <i className="fas fa-box mb-3" style={{ fontSize: '3rem', color: 'var(--text-light)' }}></i>
            <p className="mb-0">You haven't placed any orders yet.</p>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {orders.map((order) => {
            const orderTotal = order.total || calculateOrderTotal(order.items);
            return (
              <Col key={order._id || Math.random()} xs={12} className="mb-4">
                <Card className="order-card">
                  <Card.Header className="bg-white">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span className="text-muted">Order #</span>
                        <span className="ms-2 fw-bold">{order._id || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-muted">Order Placed: </span>
                        <span className="ms-2">
                          {order.orderDateTime ? new Date(order.orderDateTime).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          }) : order.createdAt ? new Date(order.createdAt).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          }) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </Card.Header>
                  <ListGroup variant="flush">
                    {Array.isArray(order.items) && order.items.map((item, index) => {
                      const itemTotal = (item.product?.price || 0) * (item.quantity || 0);
                      return (
                        <ListGroup.Item key={item._id || `${order._id}-${index}`} className="py-3">
                          <Row className="align-items-center">
                            <Col md={2}>
                              {item.product?.image && (
                                <div className="overflow-hidden rounded">
                                  <img
                                    src={item.product.image}
                                    alt={item.product?.name || 'Product'}
                                    className="img-fluid product-image"
                                  />
                                </div>
                              )}
                            </Col>
                            <Col md={6}>
                              <h5 className="mb-1">{item.product?.name || 'Unknown Product'}</h5>
                              <p className="text-muted mb-0">
                                Quantity: {item.quantity || 0} x{' '}
                                <span className="price-tag">
                                  ₹{(item.product?.price || 0).toFixed(2)}
                                </span>
                              </p>
                            </Col>
                            <Col md={4} className="text-end">
                              <p className="mb-0 price-tag">
                                ₹{itemTotal.toFixed(2)}
                              </p>
                            </Col>
                          </Row>
                        </ListGroup.Item>
                      );
                    })}
                    <ListGroup.Item className="bg-light">
                      <div className="d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="text-muted">Subtotal:</span>
                          <span className="fw-bold">₹{order.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="text-muted">Shipping:</span>
                          <span className={order.shippingCharge > 0 ? "text-danger" : "text-success"}>
                            {order.shippingCharge > 0 ? `₹${order.shippingCharge.toFixed(2)}` : 'Free'}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-muted">Total:</span>
                          <span className="price-tag h4 mb-0">
                            ₹{order.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </ListGroup.Item>
                  </ListGroup>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Container>
  );
};

export default OrdersPage; 