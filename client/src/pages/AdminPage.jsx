import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AdminPage = () => {
  const navigate = useNavigate();

  const handleManageProducts = () => {
    navigate('/admin/products');
  };

  const handleAddProduct = () => {
    navigate('/admin/products?action=add');
  };

  const handleViewOrders = () => {
    navigate('/admin/orders');
  };

  const handleProcessOrders = () => {
    navigate('/admin/orders/process');
  };

  const handleManageUsers = () => {
    navigate('/admin/users');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Products</h2>
          <div className="space-y-2">
            <button 
              onClick={handleManageProducts}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Manage Products
            </button>
            <button 
              onClick={handleAddProduct}
              className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
            >
              Add New Product
            </button>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Orders</h2>
          <div className="space-y-2">
            <button 
              onClick={handleViewOrders}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              View Orders
            </button>
            <button 
              onClick={handleProcessOrders}
              className="w-full bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
            >
              Process Orders
            </button>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Users</h2>
          <div className="space-y-2">
            <button 
              onClick={handleManageUsers}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Manage Users
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
