import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        items: [{ variantId: '', quantity: 1 }],
        customerName: '',
        customerEmail: '',
    });

    useEffect(() => {
        fetchOrders();
        fetchVariants();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders');
            setOrders(response.data.data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load orders');
            setLoading(false);
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
            await api.post('/orders', formData);
            setShowForm(false);
            setFormData({
                items: [{ variantId: '', quantity: 1 }],
                customerName: '',
                customerEmail: '',
            });
            fetchOrders();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create order');
        }
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { variantId: '', quantity: 1 }],
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

    const handleCancel = async (orderId) => {
        if (window.confirm('Are you sure you want to cancel this order?')) {
            try {
                await api.patch(`/orders/${orderId}/cancel`);
                fetchOrders();
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to cancel order');
            }
        }
    };

    const [showFulfillForm, setShowFulfillForm] = useState(null);
    const [fulfillmentData, setFulfillmentData] = useState({});

    const handleFulfill = async (orderId, isPartial = false) => {
        if (isPartial) {
            setShowFulfillForm(orderId);
            const order = orders.find((o) => o._id === orderId);
            if (order) {
                const initialData = {};
                order.items.forEach((item) => {
                    initialData[item._id] = {
                        fulfilledQuantity: item.quantity - (item.fulfilledQuantity || 0),
                    };
                });
                setFulfillmentData(initialData);
            }
            return;
        }

        try {
            await api.patch(`/orders/${orderId}/fulfill`);
            fetchOrders();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fulfill order');
        }
    };

    const handlePartialFulfill = async (orderId) => {
        try {
            const items = Object.keys(fulfillmentData).map((itemId) => ({
                itemId,
                fulfilledQuantity: parseInt(fulfillmentData[itemId].fulfilledQuantity) || 0,
            }));

            await api.patch(`/orders/${orderId}/fulfill`, {
                fulfillmentData: { items },
            });
            setShowFulfillForm(null);
            setFulfillmentData({});
            fetchOrders();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fulfill order');
        }
    };

    if (loading) {
        return <div className="loading"><div className="spinner"></div></div>;
    }

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Orders</h1>
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                    Create Order
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            {showForm && (
                <div className="card">
                    <h2>Create Order</h2>
                    <form onSubmit={handleSubmit}>
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
                                                {v.productId?.name} - {v.sku} (Stock: {v.stock})
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
                            <label>Customer Name</label>
                            <input
                                type="text"
                                value={formData.customerName}
                                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Customer Email</label>
                            <input
                                type="email"
                                value={formData.customerEmail}
                                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">Create Order</button>
                        <button type="button" className="btn" onClick={() => setShowForm(false)} style={{ marginLeft: '10px' }}>
                            Cancel
                        </button>
                    </form>
                </div>
            )}

            <div className="card">
                <h2>All Orders</h2>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Order Number</th>
                            <th>Customer</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Fulfilled</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order._id}>
                                <td>{order.orderNumber}</td>
                                <td>{order.customerName || 'N/A'}</td>
                                <td>{order.items?.length || 0} items</td>
                                <td>${order.totalAmount?.toFixed(2)}</td>
                                <td>
                                    <span
                                        style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            backgroundColor:
                                                order.status === 'Fulfilled'
                                                    ? '#d4edda'
                                                    : order.status === 'Partially Fulfilled'
                                                        ? '#cce5ff'
                                                        : order.status === 'Cancelled'
                                                            ? '#f8d7da'
                                                            : '#fff3cd',
                                            color:
                                                order.status === 'Fulfilled'
                                                    ? '#155724'
                                                    : order.status === 'Partially Fulfilled'
                                                        ? '#004085'
                                                        : order.status === 'Cancelled'
                                                            ? '#721c24'
                                                            : '#856404',
                                        }}
                                    >
                                        {order.status}
                                    </span>
                                </td>
                                <td>
                                    {order.items?.reduce((sum, item) => sum + (item.fulfilledQuantity || 0), 0) || 0} / {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                                </td>
                                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td>
                                    {(order.status === 'Pending' || order.status === 'Partially Fulfilled') && (
                                        <>
                                            <button
                                                className="btn btn-success"
                                                onClick={() => handleFulfill(order._id, false)}
                                                style={{ marginRight: '5px', padding: '5px 10px', fontSize: '12px' }}
                                            >
                                                Fulfill All
                                            </button>
                                            <button
                                                className="btn btn-success"
                                                onClick={() => handleFulfill(order._id, true)}
                                                style={{ marginRight: '5px', padding: '5px 10px', fontSize: '12px' }}
                                            >
                                                Partial Fulfill
                                            </button>
                                            {order.status === 'Pending' && (
                                                <button
                                                    className="btn btn-danger"
                                                    onClick={() => handleCancel(order._id)}
                                                    style={{ padding: '5px 10px', fontSize: '12px' }}
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showFulfillForm && (
                <div className="card" style={{ marginTop: '20px' }}>
                    <h2>Partial Fulfillment</h2>
                    {orders
                        .find((o) => o._id === showFulfillForm)
                        ?.items.map((item) => {
                            const fulfilledQty = item.fulfilledQuantity || 0;
                            const remainingQty = item.quantity - fulfilledQty;
                            return (
                                <div key={item._id} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}>
                                    <p><strong>SKU:</strong> {item.variantId?.sku || 'N/A'}</p>
                                    <p><strong>Ordered:</strong> {item.quantity}</p>
                                    <p><strong>Fulfilled:</strong> {fulfilledQty}</p>
                                    <p><strong>Remaining:</strong> {remainingQty}</p>
                                    <div className="form-group">
                                        <label>Fulfill Quantity (max: {remainingQty})</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max={remainingQty}
                                            value={fulfillmentData[item._id]?.fulfilledQuantity || remainingQty}
                                            onChange={(e) =>
                                                setFulfillmentData({
                                                    ...fulfillmentData,
                                                    [item._id]: {
                                                        fulfilledQuantity: parseInt(e.target.value) || 0,
                                                    },
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    <button className="btn btn-primary" onClick={() => handlePartialFulfill(showFulfillForm)}>
                        Fulfill
                    </button>
                    <button className="btn" onClick={() => { setShowFulfillForm(null); setFulfillmentData({}); }} style={{ marginLeft: '10px' }}>
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};

export default Orders;
