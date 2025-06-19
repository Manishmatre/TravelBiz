import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import io from 'socket.io-client';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api') + '/files/activity';
const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

function ActivityLog() {
  const { token } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ entityType: '', actionType: '' });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const socketRef = useRef(null);
  const limit = 20;

  useEffect(() => {
    fetchActivities(1, true);
    // Setup socket
    socketRef.current = io(SOCKET_URL);
    socketRef.current.on('activity', (activity) => {
      setActivities(prev => [activity, ...prev]);
    });
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
    // eslint-disable-next-line
  }, [filters.entityType, filters.actionType]);

  const fetchActivities = async (pageNum = 1, reset = false) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        limit,
        skip: (pageNum - 1) * limit,
        ...(filters.entityType && { entityType: filters.entityType }),
        ...(filters.actionType && { actionType: filters.actionType })
      });
      const res = await fetch(`${API_URL}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let data;
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || 'Failed to fetch activity log');
        setActivities([]);
        setHasMore(false);
        return;
      } else {
        data = await res.json();
      }
      if (!Array.isArray(data)) {
        setActivities([]);
        setError('Unexpected response from server');
        setHasMore(false);
        return;
      }
      if (reset) setActivities(data);
      else setActivities(prev => [...prev, ...data]);
      setHasMore(data.length === limit);
    } catch (err) {
      setError(err.message || 'Failed to fetch activity log');
      setActivities([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1);
    fetchActivities(1, true);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchActivities(nextPage);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Activity Log</h1>
      <div className="mb-4 flex gap-4">
        <select name="entityType" value={filters.entityType} onChange={handleFilterChange} className="border rounded px-2 py-1">
          <option value="">All Entities</option>
          <option value="Client">Client</option>
          <option value="Vehicle">Vehicle</option>
          <option value="File">File</option>
        </select>
        <select name="actionType" value={filters.actionType} onChange={handleFilterChange} className="border rounded px-2 py-1">
          <option value="">All Actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
        </select>
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="bg-white rounded shadow p-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="text-left p-2">Time</th>
              <th className="text-left p-2">Action</th>
              <th className="text-left p-2">Entity</th>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">By</th>
              <th className="text-left p-2">Details</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((a, idx) => (
              <tr key={a._id || idx} className="border-t">
                <td className="p-2 text-xs text-gray-500">{a.timestamp ? new Date(a.timestamp).toLocaleString() : ''}</td>
                <td className="p-2 font-semibold">{a.actionType}</td>
                <td className="p-2">{a.entityType}</td>
                <td className="p-2">{a.entityName}</td>
                <td className="p-2">{a.performedByName}</td>
                <td className="p-2 text-xs text-gray-600">{a.details ? JSON.stringify(a.details) : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div className="text-gray-500 mt-2">Loading...</div>}
        {!loading && hasMore && (
          <button onClick={handleLoadMore} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Load More</button>
        )}
      </div>
    </div>
  );
}

export default ActivityLog; 