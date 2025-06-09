import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, ListGroup, Button, Alert } from 'react-bootstrap';
import axios from 'axios';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        const { data } = await axios.get('http://localhost:5000/api/auth/profile', config);
        setUser(data);

        // Fetch orders
        const ordersResponse = await axios.get('http://localhost:5000/api/orders', config);
        setOrders(ordersResponse.data);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to load profile');
        if (error.response?.status === 401) {
          navigate('/login');
        }
      }
    };

    fetchUserProfile();
  }, [navigate]);

  if (!user) {
    return (
      <Container className="py-5">
        <div className="text-center">Loading...</div>
      </Container>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container className="py-5">
      <Row>
        <Col md={4}>
          <Card>
            <Card.Header as="h5">Profile Information</Card.Header>
            <Card.Body>
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={8}>
          <Card>
            <Card.Header as="h5">Order History</Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {!orders || orders.length === 0 ? (
                <p>No orders found.</p>
              ) : (
                <ListGroup variant="flush">
                  {orders.map((order, index) => (
                    <ListGroup.Item key={order._id || index}>
                      <h6>Order Date: {formatDate(order.createdAt)}</h6>
                      <p><strong>Status:</strong> {order.isDelivered ? 'Delivered' : order.isPaid ? 'Paid' : 'Pending'}</p>
                      <p><strong>Total:</strong> ₹{order.totalAmount?.toFixed(2) || '0.00'}</p>
                      <div className="ms-3">
                        {order.items && order.items.map((item, idx) => (
                          <div key={idx} className="mb-2">
                            <p className="mb-1">
                              {item.name || item.product?.name} - Quantity: {item.quantity}
                              <br />
                              Price: ₹{(item.price || item.product?.price || 0).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage; 