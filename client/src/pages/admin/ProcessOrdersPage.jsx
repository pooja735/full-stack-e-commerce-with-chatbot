import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Form, Modal, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProcessOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderNote, setOrderNote] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('http://localhost:5000/api/admin/orders', config);
      setOrders(data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch orders');
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/orders/${orderId}/status`,
        { status: 'delivered' },
        config
      );
      toast.success('Order marked as delivered');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleAddNote = async () => {
    if (!selectedOrder || !orderNote.trim()) return;

    try {
      await axios.post(
        `http://localhost:5000/api/admin/orders/${selectedOrder._id}/notes`,
        { note: orderNote },
        config
      );
      toast.success('Note added successfully');
      setOrderNote('');
      setShowOrderModal(false);
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add note');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !order.isPaid && !order.isDelivered;
    if (filter === 'delivered') return order.isDelivered;
    return true;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === 'date') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'amount') return b.totalAmount - a.totalAmount;
    return 0;
  });

  const getStatusBadge = (order) => {
    if (order.isDelivered) return <Badge bg="success">Delivered</Badge>;
    if (order.isPaid) return <Badge bg="info">Paid</Badge>;
    return <Badge bg="warning">Pending Payment</Badge>;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="loading-spinner mx-auto"></div>
      </div>
    );
  }

  return (
    <Container className="py-5">
      <h2 className="mb-4">Process Orders</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Filter Orders</Form.Label>
                <Form.Select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All Orders</option>
                  <option value="pending">Pending Payment</option>
                  <option value="delivered">Delivered</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Sort By</Form.Label>
                <Form.Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Order Date</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedOrders.map((order) => (
            <tr key={order._id}>
              <td>{order._id}</td>
              <td>{order.user?.name || 'N/A'}</td>
              <td>{formatDate(order.createdAt)}</td>
              <td>₹{order.totalAmount?.toFixed(2)}</td>
              <td>{getStatusBadge(order)}</td>
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
                    onClick={() => handleStatusChange(order._id, 'delivered')}
                  >
                    Mark Delivered
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
              <Row className="mb-4">
                <Col md={6}>
                  <h5>Customer Information</h5>
                  <p>Name: {selectedOrder.user?.name}</p>
                  <p>Email: {selectedOrder.user?.email}</p>
                </Col>
                <Col md={6}>
                  <h5>Order Information</h5>
                  <p>Order Date: {formatDate(selectedOrder.createdAt)}</p>
                  {selectedOrder.paidAt && (
                    <p>Paid On: {formatDate(selectedOrder.paidAt)}</p>
                  )}
                  {selectedOrder.deliveredAt && (
                    <p>Delivered On: {formatDate(selectedOrder.deliveredAt)}</p>
                  )}
                </Col>
              </Row>

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

              <h5>Add Note</h5>
              <Form.Group className="mb-3">
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="Add a note about this order..."
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowOrderModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddNote}>
            Add Note
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ProcessOrdersPage; 