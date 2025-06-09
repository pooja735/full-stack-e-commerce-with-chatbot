import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/global.css';
import { Provider } from 'react-redux';
import store from './redux/store';

// Layout Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';

// Page Components
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import ProductDetailPage from './pages/ProductDetailPage';

// Admin Components
import ProductManagement from './pages/admin/ProductManagement';
import OrderManagement from './pages/admin/OrderManagement';
import UserManagement from './pages/admin/UserManagement';
import ProcessOrdersPage from './pages/admin/ProcessOrdersPage';

// UI Components
import ScrollToTop from './components/common/ScrollToTop';

// Protected Route Component
const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

// Admin Route Component
const AdminRoute = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  
  // Only check admin status if we have both user and token
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }
  
  // Check admin status once
  if (!user.isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <Outlet />;
};

// Layout wrapper component
const Layout = () => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-grow">
      <ScrollToTop />
      <Outlet />
    </main>
    <Footer />
    <ToastContainer
      position="bottom-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
    />
  </div>
);

// Router configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "shop",
        element: <ShopPage />,
      },
      {
        path: "product/:id",
        element: <ProductDetailPage />,
      },
      {
        path: "cart",
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            element: <CartPage />,
          }
        ]
      },
      {
        path: "orders",
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            element: <OrdersPage />,
          }
        ]
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
      {
        path: "profile",
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            element: <ProfilePage />,
          },
          {
            path: "edit",
            element: <EditProfilePage />,
          }
        ]
      },
      {
        path: "admin",
        element: <AdminRoute />,
        children: [
          {
            index: true,
            element: <AdminPage />,
          },
          {
            path: "products",
            element: <ProductManagement />,
          },
          {
            path: "orders",
            element: <OrderManagement />,
          },
          {
            path: "orders/process",
            element: <ProcessOrdersPage />,
          },
          {
            path: "users",
            element: <UserManagement />,
          }
        ]
      },
      {
        path: "*",
        element: <div>Page Not Found</div>,
      }
    ]
  }
], {
  basename: process.env.PUBLIC_URL || '/'
});

function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  );
}

export default App;