import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Form, Accordion } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../styles/global.css';

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Get category from URL parameters
  const searchParams = new URLSearchParams(location.search);
  const categoryFromUrl = searchParams.get('category');

  // Filter states
  const [filters, setFilters] = useState({
    category: categoryFromUrl || 'All',
    priceRange: '',
    brand: 'All',
    inStock: false,
  });

  // Price ranges
  const priceRanges = [
    { label: 'All', value: '' },
    { label: 'Under ₹500', value: '0-500' },
    { label: '₹500 - ₹2000', value: '500-2000' },
    { label: '₹2000 - ₹5000', value: '2000-5000' },
    { label: 'Over ₹5000', value: '5000-above' }
  ];

  // Categories
  const categories = [
    'All',
    'ELECTRONICS PARTS',
    'SENSORS',
    'POWER SUPPLY',
    'BATTERIES',
    'WALL ADAPTERS',
    'TOOLS',
    'HAND TOOLS',
    'SOLDERING'
  ];

  // Brands
  const brands = [
    'All',
    'Arduino',
    'Raspberry Pi',
    'Adafruit',
    'SparkFun',
    'Seeed Studio',
    'DFRobot',
    'Pololu',
    'Weller',
    'Hakko',
    'Klein Tools',
    'Stanley',
    'Duracell',
    'Energizer',
    'Anker',
    'Belkin',
    'Bosch',
    'Makita',
    'Dewalt',
    'Fluke'
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    // Update filters when URL parameters change
    if (categoryFromUrl) {
      setFilters(prev => ({
        ...prev,
        category: categoryFromUrl
      }));
    }
  }, [categoryFromUrl]);

  useEffect(() => {
    applyFilters();
  }, [filters, products]);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/products');
      setProducts(data);
      setFilteredProducts(data);
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load products');
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Apply category filter
    if (filters.category && filters.category !== 'All') {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Apply brand filter
    if (filters.brand && filters.brand !== 'All') {
      filtered = filtered.filter(product => product.brand === filters.brand);
    }

    // Apply price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-');
      filtered = filtered.filter(product => {
        if (max === 'above') {
          return product.price >= Number(min);
        }
        return product.price >= Number(min) && product.price <= Number(max);
      });
    }

    // Apply in stock filter
    if (filters.inStock) {
      filtered = filtered.filter(product => product.countInStock > 0);
    }

    setFilteredProducts(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetFilters = () => {
    setFilters({
      category: 'All',
      priceRange: '',
      brand: 'All',
      inStock: false,
    });
  };

  const addToCart = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.info('Please login to add items to cart');
        navigate('/login');
        return;
      }

      console.log('Adding product to cart:', productId);
      
      const response = await axios.post(
        'http://localhost:5000/api/cart',
        { productId, quantity: 1 },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('Cart update response:', response.data);
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
    return <div className="text-center py-5">Loading...</div>;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <Container className="py-5">
      <h1 className="mb-4">Electronic Components Shop</h1>
      
      <Row>
        {/* Filters Sidebar */}
        <Col md={3}>
          <Accordion defaultActiveKey="0" className="mb-4">
            <Accordion.Item eventKey="0">
              <Accordion.Header>Categories</Accordion.Header>
              <Accordion.Body>
                <Form.Select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Form.Select>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="1">
              <Accordion.Header>Brands</Accordion.Header>
              <Accordion.Body>
                <Form.Select
                  name="brand"
                  value={filters.brand}
                  onChange={handleFilterChange}
                >
                  {brands.map(brand => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </Form.Select>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="2">
              <Accordion.Header>Price Range</Accordion.Header>
              <Accordion.Body>
                <Form.Select
                  name="priceRange"
                  value={filters.priceRange}
                  onChange={handleFilterChange}
                >
                  {priceRanges.map(range => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </Form.Select>
              </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="3">
              <Accordion.Header>Availability</Accordion.Header>
              <Accordion.Body>
                <Form.Check
                  type="checkbox"
                  label="In Stock Only"
                  name="inStock"
                  checked={filters.inStock}
                  onChange={handleFilterChange}
                />
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
          <Button variant="outline-secondary" onClick={resetFilters} className="w-100">
            Reset Filters
          </Button>
        </Col>

        {/* Products Grid */}
        <Col md={9}>
          {filteredProducts.length === 0 ? (
            <Alert variant="info">
              No products found matching your filters. Try adjusting your criteria.
            </Alert>
          ) : (
            <Row>
              {filteredProducts.map((product) => (
                <Col key={product._id} sm={6} lg={4} xl={4} className="mb-4">
                  <Card className="h-100 product-card">
                    <div className="overflow-hidden" style={{ height: '200px' }}>
                      <Card.Img
                        variant="top"
                        src={product.image}
                        alt={product.name}
                        className="product-image"
                        style={{ height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <Card.Body className="d-flex flex-column">
                      <Card.Title className="h5 mb-2">{product.name}</Card.Title>
                      <Card.Text className="text-muted small mb-2">
                        {product.brand}
                      </Card.Text>
                      <Card.Text className="flex-grow-1">
                        {product.description}
                      </Card.Text>
                      <div className="mt-auto">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="price-tag">₹{product.price.toFixed(2)}</span>
                          <Button
                            variant={product.countInStock === 0 ? "secondary" : "primary"}
                            onClick={() => addToCart(product._id)}
                            disabled={product.countInStock === 0}
                            className="rounded-pill"
                          >
                            {product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                          </Button>
                        </div>
                        {product.countInStock > 0 && product.countInStock <= 5 && (
                          <small className="text-danger d-block mt-2">
                            Only {product.countInStock} left in stock!
                          </small>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ShopPage;
