import React, { useState, useEffect } from 'react';
import { userService } from '../api/userService';

export const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchUsers();
        checkBackendHealth();
    }, []);

    const checkBackendHealth = async () => {
        try {
            await userService.healthCheck();
            console.log('✓ Backend connected');
        } catch (err) {
            console.error('✗ Backend connection failed:', err.message);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await userService.getAllUsers();
            setUsers(data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            if (editingId) {
                await userService.updateUser(editingId, formData);
                setEditingId(null);
            } else {
                await userService.createUser(formData);
            }
            setFormData({ name: '', email: '' });
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.error || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this user?')) {
            try {
                await userService.deleteUser(id);
                fetchUsers();
            } catch (err) {
                setError(err.response?.data?.error || 'Delete failed');
            }
        }
    };

    const handleEdit = (user) => {
        setFormData({ name: user.name, email: user.email });
        setEditingId(user.id);
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial' }}>
            <h1>User Management</h1>

            {error && <div style={{ color: 'red', marginBottom: '10px' }}>⚠️ {error}</div>}

            <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={{ marginRight: '10px', padding: '5px' }}
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    style={{ marginRight: '10px', padding: '5px' }}
                />
                <button type="submit" style={{ padding: '5px 15px' }}>
                    {editingId ? 'Update' : 'Add'} User
                </button>
                {editingId && (
                    <button
                        type="button"
                        onClick={() => { setEditingId(null); setFormData({ name: '', email: '' }); }}
                        style={{ marginLeft: '10px', padding: '5px 15px' }}
                    >
                        Cancel
                    </button>
                )}
            </form>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f0f0f0' }}>
                            <th style={{ border: '1px solid #ddd', padding: '10px' }}>ID</th>
                            <th style={{ border: '1px solid #ddd', padding: '10px' }}>Name</th>
                            <th style={{ border: '1px solid #ddd', padding: '10px' }}>Email</th>
                            <th style={{ border: '1px solid #ddd', padding: '10px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td style={{ border: '1px solid #ddd', padding: '10px' }}>{user.id}</td>
                                <td style={{ border: '1px solid #ddd', padding: '10px' }}>{user.name}</td>
                                <td style={{ border: '1px solid #ddd', padding: '10px' }}>{user.email}</td>
                                <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                                    <button onClick={() => handleEdit(user)} style={{ marginRight: '5px' }}>Edit</button>
                                    <button onClick={() => handleDelete(user.id)} style={{ color: 'red' }}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};
