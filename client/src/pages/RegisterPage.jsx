import React, { useState } from 'react';
import RegisterForm from '../components/auth/RegisterForm';

const RegisterPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <RegisterForm setIsAuthenticated={setIsAuthenticated} />
    </div>
  );
};

export default RegisterPage; 