import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const canAccessUsers = user?.role === 'Owner' || user?.role === 'Manager';

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <Link to="/">Inventory SaaS</Link>
          </div>
          <div className="nav-menu">
            <Link to="/" className={isActive('/')}>
              Dashboard
            </Link>
            <Link to="/products" className={isActive('/products')}>
              Products
            </Link>
            <Link to="/orders" className={isActive('/orders')}>
              Orders
            </Link>
            <Link to="/purchase-orders" className={isActive('/purchase-orders')}>
              Purchase Orders
            </Link>
            <Link to="/suppliers" className={isActive('/suppliers')}>
              Suppliers
            </Link>
            {canAccessUsers && (
              <Link to="/users" className={isActive('/users')}>
                Users
              </Link>
            )}
          </div>
          <div className="nav-user">
            <span>{user?.name} ({user?.role})</span>
            <button onClick={handleLogout} className="btn btn-danger">
              Logout
            </button>
          </div>
        </div>
      </nav>
      <main className="main-content">{children}</main>
    </div>
  );
};

export default Layout;
