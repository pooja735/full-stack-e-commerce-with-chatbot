import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from 'react-bootstrap';
import Rating from './Rating';
import axios from 'axios';
import { toast } from 'react-toastify';

const Product = ({ product }) => {
  const navigate = useNavigate();

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

  const handleProductClick = () => {
    navigate(`/product/${product._id}`);
  };

  return (
    <Card className="my-3 p-3 rounded h-100">
      <div 
        className="product-image-container" 
        onClick={handleProductClick}
        style={{ cursor: 'pointer' }}
      >
        <Card.Img src={product.image} variant="top" />
      </div>

      <Card.Body className="d-flex flex-column">
        <div 
          className="product-title" 
          onClick={handleProductClick}
          style={{ cursor: 'pointer' }}
        >
          <Card.Title as="div">
            <strong>{product.name}</strong>
          </Card.Title>
        </div>

        <Card.Text as="div">
          <Rating
            value={product.rating}
            text={`${product.numReviews} reviews`}
          />
        </Card.Text>

        <Card.Text as="h3" className="mt-auto">₹{product.price}</Card.Text>

        <Button
          variant="primary"
          className="mt-2 w-100"
          onClick={addToCart}
          disabled={product.countInStock === 0}
        >
          {product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </Card.Body>
    </Card>
  );
};

export default Product; 