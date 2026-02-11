import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const PurchaseOrders = () => {
    const { user } = useAuth();
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [showReceiveForm, setShowReceiveForm] = useState(null);
    const [formData, setFormData] = useState({
        supplierId: '',
        items: [{ variantId: '', quantity: 1, expectedPrice: 0 }],
        notes: '',
    });
    const [receiveData, setReceiveData] = useState({});

    const canManage = user?.role === 'Owner' || user?.role === 'Manager';

    useEffect(() => {
        fetchPurchaseOrders();
        fetchSuppliers();
        fetchVariants();
    }, []);

    const fetchPurchaseOrders = async () => {
        try {
            const response = await api.get('/purchase-orders');
            setPurchaseOrders(response.data.data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load purchase orders');
            setLoading(false);
        }
    };

    const fetchSuppliers = async () => {
        try {
            const response = await api.get('/suppliers');
            setSuppliers(response.data.data);
        } catch (err) {
            console.log(err)
        }
    };

    const fetchVariants = async () => {
        try {
            const response = await api.get('/variants');
            setVariants(response.data.data);
        } catch (err) {
            console.log(err)
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/purchase-orders', formData);
            setShowForm(false);
            setFormData({
                supplierId: '',
                items: [{ variantId: '', quantity: 1, expectedPrice: 0 }],
                notes: '',
            });
            fetchPurchaseOrders();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create purchase order');
        }
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { variantId: '', quantity: 1, expectedPrice: 0 }],
        });
    };

    const removeItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const updateItem = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        setFormData({ ...formData, items: newItems });
    };

    const handleReceive = async (poId) => {
        try {
            const receivedItems = Object.keys(receiveData).map((itemId) => ({
                itemId,
                receivedQuantity: parseInt(receiveData[itemId].quantity) || 0,
                actualPrice: receiveData[itemId].price ? parseFloat(receiveData[itemId].price) : undefined,
            }));

            await api.patch(`/purchase-orders/${poId}/receive`, { receivedItems });
            setShowReceiveForm(null);
            setReceiveData({});
            fetchPurchaseOrders();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to receive purchase order');
        }
    };

    if (loading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Purchase Orders</h1>
                {canManage && (
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                        Create Purchase Order
                    </button>
                )}
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {showForm && canManage && (
                <div className="card">
                    <h2>Create Purchase Order</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Supplier *</label>
                            <select
                                value={formData.supplierId}
                                onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                                required
                            >
                                <option value="">Select Supplier</option>
                                {suppliers.map((s) => (
                                    <option key={s._id} value={s._id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {formData.items.map((item, index) => (
                            <div key={index} style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '15px', borderRadius: '4px' }}>
                                <div className="form-group">
                                    <label>Variant *</label>
                                    <select
                                        value={item.variantId}
                                        onChange={(e) => updateItem(index, 'variantId', e.target.value)}
                                        required
                                    >
                                        <option value="">Select Variant</option>
                                        {variants.map((v) => (
                                            <option key={v._id} value={v._id}>
                                                {v.productId?.name} - {v.sku}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Quantity *</label>
                                    <input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                                        min="1"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Expected Price *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={item.expectedPrice}
                                        onChange={(e) => updateItem(index, 'expectedPrice', parseFloat(e.target.value))}
                                        min="0"
                                        required
                                    />
                                </div>
                                {formData.items.length > 1 && (
                                    <button type="button" className="btn btn-danger" onClick={() => removeItem(index)}>
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                        <button type="button" className="btn" onClick={addItem} style={{ marginBottom: '15px' }}>
                            Add Item
                        </button>
                        <div className="form-group">
                            <label>Notes</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows="3"
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">Create PO</button>
                        <button type="button" className="btn" onClick={() => setShowForm(false)} style={{ marginLeft: '10px' }}>
                            Cancel
                        </button>
                    </form>
                </div>
            )}

            <div className="card">
                <h2>Purchase Orders</h2>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Supplier</th>
                            <th>Status</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Date</th>
                            {canManage && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {purchaseOrders.map((po) => (
                            <tr key={po._id}>
                                <td>{po.supplierId?.name || 'N/A'}</td>
                                <td>
                                    <span
                                        style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            backgroundColor:
                                                po.status === 'Received'
                                                    ? '#d4edda'
                                                    : po.status === 'Confirmed'
                                                        ? '#cce5ff'
                                                        : '#fff3cd',
                                            color:
                                                po.status === 'Received'
                                                    ? '#155724'
                                                    : po.status === 'Confirmed'
                                                        ? '#004085'
                                                        : '#856404',
                                        }}
                                    >
                                        {po.status}
                                    </span>
                                </td>
                                <td>{po.items?.length || 0} items</td>
                                <td>${po.totalAmount?.toFixed(2)}</td>
                                <td>{new Date(po.createdAt).toLocaleDateString()}</td>
                                {canManage && (
                                    <td>
                                        {po.status !== 'Received' && (
                                            <button
                                                className="btn btn-success"
                                                onClick={() => setShowReceiveForm(po._id)}
                                                style={{ padding: '5px 10px', fontSize: '12px' }}
                                            >
                                                Receive
                                            </button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showReceiveForm && (
                <div className="card" style={{ marginTop: '20px' }}>
                    <h2>Receive Purchase Order</h2>
                    {purchaseOrders
                        .find((po) => po._id === showReceiveForm)
                        ?.items.map((item) => (
                            <div key={item._id} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
                                <p><strong>SKU:</strong> {item.variantId?.sku || 'N/A'}</p>
                                <p><strong>Expected:</strong> {item.quantity} @ ${item.expectedPrice?.toFixed(2)}</p>
                                <p><strong>Received:</strong> {item.receivedQuantity || 0}</p>
                                <div className="form-group">
                                    <label>Received Quantity</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max={item.quantity - (item.receivedQuantity || 0)}
                                        value={receiveData[item._id]?.quantity || ''}
                                        onChange={(e) =>
                                            setReceiveData({
                                                ...receiveData,
                                                [item._id]: { ...receiveData[item._id], quantity: e.target.value },
                                            })
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Actual Price (optional)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={receiveData[item._id]?.price || ''}
                                        onChange={(e) =>
                                            setReceiveData({
                                                ...receiveData,
                                                [item._id]: { ...receiveData[item._id], price: e.target.value },
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        ))}
                    <button className="btn btn-primary" onClick={() => handleReceive(showReceiveForm)}>
                        Receive
                    </button>
                    <button className="btn" onClick={() => { setShowReceiveForm(null); setReceiveData({}); }} style={{ marginLeft: '10px' }}>
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};

export default PurchaseOrders;
