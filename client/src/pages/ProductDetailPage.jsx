import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Alert, Modal } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Rating from '../components/Rating';

const ProductDetailPage = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(data);
        setLoading(false);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to fetch product');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const addToCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.info('Please login to add items to cart');
        navigate('/login');
        return;
      }

      const response = await axios.post(
        'http://localhost:5000/api/cart',
        { productId: product._id, quantity: 1 },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Product added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error.response?.status === 401) {
        toast.error('Please login again');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to add to cart');
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="loading-spinner mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="py-5">
        <Alert variant="info">Product not found</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-5">
      <Row className="min-vh-100">
        {/* Product Image */}
        <Col md={6} className="d-flex align-items-center justify-content-center p-5">
          <div 
            className="product-image-container position-relative"
            style={{ cursor: 'zoom-in' }}
            onClick={() => setShowImageModal(true)}
          >
            <img
              src={product.image}
              alt={product.name}
              className="img-fluid rounded shadow-lg"
              style={{ maxHeight: '80vh', objectFit: 'contain' }}
            />
            <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3">
              <small className="text-muted bg-white px-3 py-1 rounded-pill">
                Click to zoom
              </small>
            </div>
          </div>
        </Col>

        {/* Product Details */}
        <Col md={6} className="d-flex flex-column justify-content-center p-5">
          <div className="product-details">
            <h1 className="mb-4">{product.name}</h1>
            
            <div className="mb-4">
              <Rating
                value={product.rating}
                text={`${product.numReviews} reviews`}
              />
            </div>

            <h2 className="price-tag mb-4">₹{product.price.toFixed(2)}</h2>

            <div className="mb-4">
              <h5>Description</h5>
              <p className="text-muted">{product.description}</p>
            </div>

            <div className="mb-4">
              <h5>Brand</h5>
              <p className="text-muted">{product.brand}</p>
            </div>

            <div className="mb-4">
              <h5>Category</h5>
              <p className="text-muted">{product.category}</p>
            </div>

            <div className="mb-4">
              <h5>Stock Status</h5>
              <p className={product.countInStock > 0 ? 'text-success' : 'text-danger'}>
                {product.countInStock > 0 ? `${product.countInStock} units in stock` : 'Out of Stock'}
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-100 mb-3"
              onClick={addToCart}
              disabled={product.countInStock === 0}
            >
              {product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>

            {product.countInStock > 0 && product.countInStock <= 5 && (
              <p className="text-danger text-center">
                Only {product.countInStock} left in stock!
              </p>
            )}
          </div>
        </Col>
      </Row>

      {/* Image Zoom Modal */}
      <Modal
        show={showImageModal}
        onHide={() => setShowImageModal(false)}
        size="xl"
        centered
        className="image-zoom-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>{product.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <div className="d-flex justify-content-center align-items-center bg-light">
            <img
              src={product.image}
              alt={product.name}
              className="img-fluid"
              style={{ maxHeight: '80vh', objectFit: 'contain' }}
            />
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ProductDetailPage; 