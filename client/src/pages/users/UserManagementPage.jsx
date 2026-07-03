import { useState, useEffect, useCallback } from 'react';
import * as authService from '../../services/authService';

const ROLES = ['Researcher', 'ProjectLead', 'ResourceManager', 'Administrator'];

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { users: list } = await authService.getUsers({ limit: 100 });
      setUsers(list);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleRoleChange = async (id, role) => {
    setSavingId(id);
    try {
      await authService.updateUser(id, { role });
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, role } : u)));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update role');
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    setSavingId(id);
    try {
      await authService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="p-6">
      <h1 className="heading-page mb-4">User Management</h1>

      {error && (
        <div className="mb-4 rounded bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>
      )}

      {loading ? (
        <p className="text-ink-400">Loading users…</p>
      ) : users.length === 0 ? (
        <p className="text-ink-400">No users found.</p>
      ) : (
        <div className="overflow-x-auto rounded border border-border">
          <table className="min-w-full text-sm">
            <thead className="bg-surface-2 text-left text-ink-600">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Borrower ID</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="px-4 py-2">{u.name}</td>
                  <td className="px-4 py-2 text-ink-600">{u.email}</td>
                  <td className="px-4 py-2 text-ink-400">{u.borrowerId}</td>
                  <td className="px-4 py-2">
                    <select
                      value={u.role}
                      disabled={savingId === u._id}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="rounded border border-border px-2 py-1"
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => handleDelete(u._id)}
                      disabled={savingId === u._id}
                      className="text-red-600 hover:underline disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
