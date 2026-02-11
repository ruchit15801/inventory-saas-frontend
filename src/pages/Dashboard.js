import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import './Dashboard.css';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/summary');
      setSummary(response.data.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!summary) {
    return <div>No data available</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Inventory Value</h3>
          <p className="dashboard-value">
            ${summary.inventoryValue?.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) || '0.00'}
          </p>
        </div>

        <div className="dashboard-card">
          <h3>Low Stock Items</h3>
          <p className="dashboard-value">{summary.lowStockItems?.length || 0}</p>
        </div>
      </div>

      <div className="card">
        <h2>Low Stock Alerts</h2>
        {summary.lowStockItems && summary.lowStockItems.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Current Stock</th>
                <th>Pending PO Qty</th>
                <th>Minimum Stock</th>
                <th>Shortfall</th>
              </tr>
            </thead>
            <tbody>
              {summary.lowStockItems.map((item, index) => (
                <tr key={index}>
                  <td>{item.sku}</td>
                  <td>{item.currentStock}</td>
                  <td>{item.pendingPOQty}</td>
                  <td>{item.minimumStock}</td>
                  <td className="text-danger">{item.shortfall}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No low stock items</p>
        )}
      </div>

      <div className="card">
        <h2>Top 5 Selling Products (Last 30 Days)</h2>
        {summary.topSellingProducts && summary.topSellingProducts.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Quantity Sold</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {summary.topSellingProducts.map((item, index) => (
                <tr key={index}>
                  <td>{item.variant?.productId?.name || 'N/A'}</td>
                  <td>{item.variant?.sku || 'N/A'}</td>
                  <td>{item.totalQuantity}</td>
                  <td>
                    ${item.totalRevenue?.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) || '0.00'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No sales data available</p>
        )}
      </div>

      <div className="card">
        <h2>Stock Movement (Last 7 Days)</h2>
        {summary.stockMovementChart && summary.stockMovementChart.length > 0 ? (
          <div className="chart-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Purchase</th>
                  <th>Sale</th>
                  <th>Return</th>
                  <th>Adjustment</th>
                  <th>Cancellation</th>
                </tr>
              </thead>
              <tbody>
                {summary.stockMovementChart.map((day, index) => (
                  <tr key={index}>
                    <td>{day.date}</td>
                    <td>{day.purchase || 0}</td>
                    <td>{day.sale || 0}</td>
                    <td>{day.return || 0}</td>
                    <td>{day.adjustment || 0}</td>
                    <td>{day.cancellation || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No movement data available</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
