import React, { useEffect, useState } from 'react';
import { userAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      const { data } = await userAPI.getAll();
      setUsers(data.users);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleRoleChange = async (id, role) => {
    try {
      await userAPI.updateRole(id, role);
      toast.success('Role updated');
      setUsers(u => u.map(user => user._id === id ? { ...user, role } : user));
    } catch { toast.error('Failed to update role'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await userAPI.delete(id);
      toast.success('User deleted');
      setUsers(u => u.filter(user => user._id !== id));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete user'); }
  };

  const filtered = users.filter(u => !search ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">{users.length} total members</p>
        </div>
      </div>

      <div className="filter-bar" style={{ marginBottom: 20 }}>
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input className="form-control" placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <div className="empty-state-text">No users found.</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-dim)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--accent-light)',
                          flexShrink: 0
                        }}>
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                          {u.name}
                          {u._id === currentUser._id && (
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 6 }}>(you)</span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      {u._id === currentUser._id ? (
                        <span className={`badge badge-${u.role}`}>{u.role}</span>
                      ) : (
                        <select
                          className="filter-select"
                          value={u.role}
                          onChange={e => handleRoleChange(u._id, e.target.value)}
                          style={{ fontSize: 13, padding: '4px 8px' }}
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                    </td>
                    <td>{format(new Date(u.createdAt), 'MMM d, yyyy')}</td>
                    <td>
                      {u._id !== currentUser._id && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u._id)}>
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
