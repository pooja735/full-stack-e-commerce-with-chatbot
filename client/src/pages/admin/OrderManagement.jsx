import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Spinner, Alert, Badge, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const navigate = useNavigate();

  // Get token and user from localStorage
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  let user = null;
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('http://localhost:5000/api/admin/orders', config);
      console.log('Orders fetched:', data);
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.response?.data?.message || 'Failed to fetch orders');
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !user) {
      navigate('/login');
      return;
    }

    if (!user.isAdmin) {
      navigate('/');
      return;
    }

    fetchOrders();
  }, []);

  const handleDeliverOrder = async (orderId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/orders/${orderId}/status`,
        { status: 'delivered' },
        config
      );
      toast.success('Order marked as delivered');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="mb-4">Order Management</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      
      {orders.length === 0 ? (
        <Alert variant="info">No orders found.</Alert>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Payment Status</th>
                <th>Delivery Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{order.user?.name || 'N/A'}</td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>₹{order.totalAmount?.toFixed(2) || '0.00'}</td>
                  <td>
                    <Badge bg={order.isDelivered || order.isPaid ? 'success' : 'warning'}>
                      {order.isDelivered || order.isPaid ? 'Paid' : 'Pending'}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={order.isDelivered ? 'success' : 'warning'}>
                      {order.isDelivered ? 'Delivered' : 'Processing'}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      variant="info"
                      size="sm"
                      className="me-2"
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowOrderModal(true);
                      }}
                    >
                      View Details
                    </Button>
                    {!order.isDelivered && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleDeliverOrder(order._id)}
                      >
                        Mark as Delivered
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Order Details Modal */}
          <Modal
            show={showOrderModal}
            onHide={() => setShowOrderModal(false)}
            size="lg"
          >
            <Modal.Header closeButton>
              <Modal.Title>Order Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedOrder && (
                <>
                  <div className="mb-4">
                    <h5>Customer Information</h5>
                    <p>Name: {selectedOrder.user?.name}</p>
                    <p>Email: {selectedOrder.user?.email}</p>
                  </div>

                  <div className="mb-4">
                    <h5>Order Information</h5>
                    <p>Order Date: {formatDate(selectedOrder.createdAt)}</p>
                    {selectedOrder.paidAt && (
                      <p>Paid On: {formatDate(selectedOrder.paidAt)}</p>
                    )}
                    {selectedOrder.deliveredAt && (
                      <p>Delivered On: {formatDate(selectedOrder.deliveredAt)}</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <h5>Order Items</h5>
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Quantity</th>
                          <th>Price</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items?.map((item, index) => (
                          <tr key={index}>
                            <td>{item.name}</td>
                            <td>{item.quantity}</td>
                            <td>₹{item.price?.toFixed(2)}</td>
                            <td>₹{(item.price * item.quantity)?.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

                  <div>
                    <h5>Order Total</h5>
                    <p className="h4">₹{selectedOrder.totalAmount?.toFixed(2)}</p>
                  </div>
                </>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowOrderModal(false)}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </Container>
  );
};

export default OrderManagement; 