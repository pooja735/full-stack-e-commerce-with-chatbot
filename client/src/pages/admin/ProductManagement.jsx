import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Container, Table, Button, Modal, Form, Spinner } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    brand: '',
    countInStock: '',
    image: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const location = useLocation();
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

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('http://localhost:5000/api/admin/products', config);
      console.log('Products fetched:', data);
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        console.error('Invalid products data:', data);
        toast.error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error fetching products:', error.response?.data || error);
      toast.error(error.response?.data?.message || 'Failed to fetch products');
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
    const checkAuth = async () => {
      if (!token || !user) {
        console.log('No token or user found');
        toast.error('Please login to access admin features');
        navigate('/login');
        return;
      }

      if (!user.isAdmin) {
        console.log('User is not admin:', user);
        toast.error('You do not have admin privileges');
        navigate('/');
        return;
      }

      try {
        // Verify token and user with backend
        const { data } = await axios.get('http://localhost:5000/api/users/profile', config);
        console.log('Profile data:', data);
        if (!data.isAdmin) {
          toast.error('You do not have admin privileges');
          navigate('/');
          return;
        }
        await fetchProducts();
      } catch (error) {
        console.error('Auth verification failed:', error);
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
  }, []); // Empty dependency array

  // Check for add product action separately
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('action') === 'add') {
      resetForm();
      setShowModal(true);
    }
  }, [location.search]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validate form data
    if (!formData.name || !formData.description || !formData.price || 
        !formData.category || !formData.brand || !formData.countInStock || !formData.image) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const productData = {
        ...formData,
        price: Number(formData.price),
        countInStock: Number(formData.countInStock)
      };

      console.log('Submitting product data:', productData);

      if (editingProduct) {
        const response = await axios.put(
          `http://localhost:5000/api/admin/products/${editingProduct._id}`,
          productData,
          config
        );
        console.log('Product update response:', response.data);
        toast.success('Product updated successfully');
      } else {
        const response = await axios.post(
          'http://localhost:5000/api/admin/products',
          productData,
          config
        );
        console.log('Product creation response:', response.data);
        toast.success('Product added successfully');
      }
      setShowModal(false);
      fetchProducts();
      resetForm();
    } catch (error) {
      console.error('Error:', error.response?.data || error);
      const errorMessage = error.response?.data?.details 
        ? Object.values(error.response.data.details).map(err => err.message).join(', ')
        : error.response?.data?.message || 'Operation failed';
      toast.error(errorMessage);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      brand: product.brand,
      countInStock: product.countInStock,
      image: product.image
    });
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        setLoading(true);
        await axios.delete(`http://localhost:5000/api/admin/products/${productId}`, config);
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete product');
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      brand: '',
      countInStock: '',
      image: ''
    });
    setEditingProduct(null);
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Product Management</h2>
        <Button 
          variant="primary" 
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          disabled={loading}
        >
          Add New Product
        </Button>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Price</th>
            <th>Category</th>
            <th>Brand</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id}>
              <td>
                <img 
                  src={product.image} 
                  alt={product.name} 
                  style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                />
              </td>
              <td>{product.name}</td>
              <td>₹{product.price}</td>
              <td>{product.category}</td>
              <td>{product.brand}</td>
              <td>{product.countInStock}</td>
              <td>
                <Button 
                  variant="info" 
                  size="sm" 
                  className="me-2"
                  onClick={() => handleEdit(product)}
                  disabled={loading}
                >
                  Edit
                </Button>
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => handleDelete(product._id)}
                  disabled={loading}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal 
        show={showModal} 
        onHide={() => {
          if (!isSubmitting) {
            setShowModal(false);
            resetForm();
          }
        }}
        backdrop={isSubmitting ? 'static' : true}
      >
        <Modal.Header closeButton={!isSubmitting}>
          <Modal.Title>
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Price (₹)</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                disabled={isSubmitting}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              >
                <option value="">Select Category</option>
                <option value="ELECTRONICS PARTS">ELECTRONICS PARTS</option>
                <option value="SENSORS">SENSORS</option>
                <option value="POWER SUPPLY">POWER SUPPLY</option>
                <option value="BATTERIES">BATTERIES</option>
                <option value="WALL ADAPTERS">WALL ADAPTERS</option>
                <option value="TOOLS">TOOLS</option>
                <option value="HAND TOOLS">HAND TOOLS</option>
                <option value="SOLDERING">SOLDERING</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Brand</Form.Label>
              <Form.Select
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              >
                <option value="">Select Brand</option>
                <option value="Arduino">Arduino</option>
                <option value="Raspberry Pi">Raspberry Pi</option>
                <option value="Adafruit">Adafruit</option>
                <option value="SparkFun">SparkFun</option>
                <option value="Seeed Studio">Seeed Studio</option>
                <option value="DFRobot">DFRobot</option>
                <option value="Pololu">Pololu</option>
                <option value="Weller">Weller</option>
                <option value="Hakko">Hakko</option>
                <option value="Klein Tools">Klein Tools</option>
                <option value="Stanley">Stanley</option>
                <option value="Duracell">Duracell</option>
                <option value="Energizer">Energizer</option>
                <option value="Anker">Anker</option>
                <option value="Belkin">Belkin</option>
                <option value="Bosch">Bosch</option>
                <option value="Makita">Makita</option>
                <option value="Dewalt">Dewalt</option>
                <option value="Fluke">Fluke</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Stock</Form.Label>
              <Form.Control
                type="number"
                name="countInStock"
                value={formData.countInStock}
                onChange={handleInputChange}
                required
                min="0"
                disabled={isSubmitting}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Image URL</Form.Label>
              <Form.Control
                type="text"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button 
                variant="secondary" 
                onClick={() => {
                  if (!isSubmitting) {
                    setShowModal(false);
                    resetForm();
                  }
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    {editingProduct ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  editingProduct ? 'Update' : 'Add'
                )} Product
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ProductManagement;