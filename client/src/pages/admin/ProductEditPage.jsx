import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProductEditPage = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

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

  useEffect(() => {
    const checkAuth = async () => {
      if (!token || !user) {
        toast.error('Please login to access admin features');
        navigate('/login');
        return;
      }

      if (!user.isAdmin) {
        toast.error('You do not have admin privileges');
        navigate('/');
        return;
      }

      try {
        const { data } = await axios.get('http://localhost:5000/api/users/profile', config);
        if (!data.isAdmin) {
          toast.error('You do not have admin privileges');
          navigate('/');
          return;
        }
        if (id !== 'create') {
          await fetchProduct();
        } else {
          setLoading(false);
        }
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          toast.error('Session expired. Please login again');
          navigate('/login');
        } else {
          toast.error('Failed to verify admin access');
          navigate('/');
        }
      }
    };

    checkAuth();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`http://localhost:5000/api/products/${id}`);
      setName(data.name);
      setPrice(data.price);
      setImage(data.image);
      setBrand(data.brand);
      setCategory(data.category);
      setCountInStock(data.countInStock);
      setDescription(data.description);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        name,
        price,
        image,
        brand,
        category,
        countInStock,
        description
      };

      if (id === 'create') {
        await axios.post('http://localhost:5000/api/admin/products', productData, config);
        toast.success('Product created successfully');
      } else {
        await axios.put(`http://localhost:5000/api/admin/products/${id}`, productData, config);
        toast.success('Product updated successfully');
      }
      navigate('/admin/productlist');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    }
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
      <h2 className="mb-4">{id === 'create' ? 'Create Product' : 'Edit Product'}</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Price</Form.Label>
          <Form.Control
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Image URL</Form.Label>
          <Form.Control
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Brand</Form.Label>
          <Form.Control
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Category</Form.Label>
          <Form.Control
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Count In Stock</Form.Label>
          <Form.Control
            type="number"
            value={countInStock}
            onChange={(e) => setCountInStock(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </Form.Group>

        <Button type="submit" variant="primary" disabled={uploading}>
          {uploading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />{' '}
              Saving...
            </>
          ) : (
            'Save'
          )}
        </Button>
      </Form>
    </Container>
  );
};

export default ProductEditPage; 