import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { onStockUpdate, offStockUpdate } from '../utils/socket';

const Products = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showProductForm, setShowProductForm] = useState(false);
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
  });
  const [variantData, setVariantData] = useState({
    productId: '',
    sku: '',
    attributes: { size: '', color: '' },
    stock: 0,
    price: 0,
    minimumStock: 0,
  });

  useEffect(() => {
    fetchProducts();
    fetchVariants();

    // Listen for real-time stock updates
    const handleStockUpdate = (data) => {
      setVariants((prevVariants) =>
        prevVariants.map((v) =>
          v._id === data.variantId ? { ...v, stock: data.variant.stock } : v
        )
      );
    };

    onStockUpdate(handleStockUpdate);

    return () => {
      offStockUpdate(handleStockUpdate);
    };
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products');
    }
  };

  const fetchVariants = async () => {
    try {
      const response = await api.get('/variants');
      setVariants(response.data.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load variants');
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products', formData);
      setShowProductForm(false);
      setFormData({ name: '', description: '', category: '' });
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create product');
    }
  };

  const handleVariantSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/variants', variantData);
      setShowVariantForm(false);
      setVariantData({
        productId: '',
        sku: '',
        attributes: { size: '', color: '' },
        stock: 0,
        price: 0,
        minimumStock: 0,
      });
      fetchVariants();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create variant');
    }
  };

  const canManage = user?.role === 'Owner' || user?.role === 'Manager';

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Products & Variants</h1>
        {canManage && (
          <div>
            <button className="btn btn-primary" onClick={() => setShowProductForm(true)}>
              Add Product
            </button>
            <button className="btn btn-primary" onClick={() => setShowVariantForm(true)} style={{ marginLeft: '10px' }}>
              Add Variant
            </button>
          </div>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {showProductForm && (
        <div className="card">
          <h2>Create Product</h2>
          <form onSubmit={handleProductSubmit}>
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary">Create</button>
            <button type="button" className="btn" onClick={() => setShowProductForm(false)} style={{ marginLeft: '10px' }}>
              Cancel
            </button>
          </form>
        </div>
      )}

      {showVariantForm && (
        <div className="card">
          <h2>Create Variant</h2>
          <form onSubmit={handleVariantSubmit}>
            <div className="form-group">
              <label>Product *</label>
              <select
                value={variantData.productId}
                onChange={(e) => setVariantData({ ...variantData, productId: e.target.value })}
                required
              >
                <option value="">Select Product</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>SKU *</label>
              <input
                type="text"
                value={variantData.sku}
                onChange={(e) => setVariantData({ ...variantData, sku: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Size</label>
              <input
                type="text"
                value={variantData.attributes.size || ''}
                onChange={(e) =>
                  setVariantData({
                    ...variantData,
                    attributes: { ...variantData.attributes, size: e.target.value },
                  })
                }
              />
            </div>
            <div className="form-group">
              <label>Color</label>
              <input
                type="text"
                value={variantData.attributes.color || ''}
                onChange={(e) =>
                  setVariantData({
                    ...variantData,
                    attributes: { ...variantData.attributes, color: e.target.value },
                  })
                }
              />
            </div>
            <div className="form-group">
              <label>Stock *</label>
              <input
                type="number"
                value={variantData.stock}
                onChange={(e) => setVariantData({ ...variantData, stock: parseInt(e.target.value) })}
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label>Price *</label>
              <input
                type="number"
                step="0.01"
                value={variantData.price}
                onChange={(e) => setVariantData({ ...variantData, price: parseFloat(e.target.value) })}
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label>Minimum Stock *</label>
              <input
                type="number"
                value={variantData.minimumStock}
                onChange={(e) => setVariantData({ ...variantData, minimumStock: parseInt(e.target.value) })}
                min="0"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">Create</button>
            <button type="button" className="btn" onClick={() => setShowVariantForm(false)} style={{ marginLeft: '10px' }}>
              Cancel
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <h2>Product Variants</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Attributes</th>
              <th>Stock</th>
              <th>Price</th>
              <th>Min Stock</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((variant) => (
              <tr key={variant._id}>
                <td>{variant.productId?.name || 'N/A'}</td>
                <td>{variant.sku}</td>
                <td>
                  {Object.entries(variant.attributes || {}).map(([key, value]) => (
                    <span key={key} style={{ marginRight: '10px' }}>
                      {key}: {value}
                    </span>
                  ))}
                </td>
                <td>{variant.stock}</td>
                <td>${variant.price?.toFixed(2)}</td>
                <td>{variant.minimumStock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Products;
