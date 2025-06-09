import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card, Button, Container } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { listProducts } from '../actions/productActions';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Product from '../components/Product';
import Chatbot from '../components/chatbot/Chatbot';

const HomePage = () => {
  const dispatch = useDispatch();
  const productList = useSelector((state) => state.productList);
  const { loading, error, products } = productList;

  useEffect(() => {
    dispatch(listProducts());
  }, [dispatch]);

  // Get unique categories from products
  const categories = [...new Set(products.map(product => product.category))];

  // Get featured products (products with rating >= 4.5)
  const featuredProducts = products.filter(product => product.rating >= 4.5);

  return (
    <Container>
      {/* Hero Section */}
      <div className="relative bg-indigo-900">
        <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
              Welcome to TechStore
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-indigo-200">
              Your trusted source for quality electrical components, tools, and accessories. Find everything you need for your electrical projects and repairs.
            </p>
            <div className="mt-10">
              <Link
                to="/shop"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Shop by Category</h2>
        <Row>
          {categories.map((category) => (
            <Col key={category} sm={12} md={6} lg={4} xl={3} className="mb-4">
              <Card className="h-100">
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="text-center">{category}</Card.Title>
                  <Card.Text className="text-center">
                    Browse our collection of {category.toLowerCase()} products
                  </Card.Text>
                  <Button
                    as={Link}
                    to={`/shop?category=${category}`}
                    variant="primary"
                    className="mt-auto"
                  >
                    View Products
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Featured Products Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Featured Products</h2>
          {loading ? (
            <Loader />
          ) : error ? (
            <Message variant="danger">{error}</Message>
          ) : (
            <Row>
              {featuredProducts.map((product) => (
                <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
                  <Product product={product} />
                </Col>
              ))}
            </Row>
          )}
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white">
              Stay Updated with Latest Tech News
            </h2>
            <p className="mt-4 text-xl text-indigo-200">
              Subscribe to our newsletter for exclusive deals and updates.
            </p>
            <form className="mt-8 sm:flex justify-center">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full sm:max-w-xs px-5 py-3 border border-transparent rounded-md text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-700"
              />
              <button
                type="submit"
                className="mt-3 sm:mt-0 sm:ml-3 w-full sm:w-auto flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
      <Chatbot />
    </Container>
  );
};

export default HomePage;
