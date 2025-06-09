import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import axios from 'axios';

const EditProfilePage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    currentPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
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
        setFormData(prev => ({
          ...prev,
          name: data.name,
          email: data.email
        }));
        setLoading(false);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to load profile');
        if (error.response?.status === 401) {
          navigate('/login');
        }
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate password match if changing password
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    // Validate current password is provided if changing password or email
    if ((formData.password || formData.email) && !formData.currentPassword) {
      setError('Current password is required to change email or password');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Only include fields that have values
      const updateData = {
        name: formData.name,
        ...(formData.email && { email: formData.email }),
        ...(formData.password && { password: formData.password }),
        ...(formData.currentPassword && { currentPassword: formData.currentPassword })
      };

      await axios.put('http://localhost:5000/api/auth/profile', updateData, config);
      
      setSuccess('Profile updated successfully');
      
      // Update local storage with new user data if name changed
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.name !== formData.name) {
        localStorage.setItem('user', JSON.stringify({ ...user, name: formData.name }));
      }

      // Clear sensitive fields
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: '',
        currentPassword: ''
      }));

      // Navigate back to profile after short delay
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
    }
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">Loading...</div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Card className="mx-auto" style={{ maxWidth: '600px' }}>
        <Card.Header as="h5">Edit Profile</Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>New Password (leave blank to keep current)</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                minLength="6"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                minLength="6"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Current Password (required for email/password changes)</Form.Label>
              <Form.Control
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
              />
            </Form.Group>

            <div className="d-flex gap-2">
              <Button variant="primary" type="submit">
                Update Profile
              </Button>
              <Button variant="secondary" onClick={() => navigate('/profile')}>
                Cancel
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EditProfilePage; 