import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import StatCard from '../../components/common/StatCard';
import Loader from '../../components/common/Loader';
import Table from '../../components/common/Table';
import { FaSyncAlt } from 'react-icons/fa';
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
    try {
      socketRef.current = io(SOCKET_URL);
      socketRef.current.on('activity', (activity) => {
        setActivities(prev => [activity, ...prev]);
      });
    } catch (err) {
      setError('Socket connection failed: ' + (err.message || err));
    }
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
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Activity Log</h1>
      </div>
      {/* Quick Stat */}
      <div className="mb-6 max-w-xs">
        <StatCard icon={<FaSyncAlt />} label="Total Activities" value={loading ? '--' : activities.length} accentColor="blue" />
      </div>
      {/* Filters */}
      <div className="mb-4 flex gap-4">
        <select name="entityType" value={filters.entityType} onChange={handleFilterChange} className="border border-gray-300 rounded-lg px-3 py-2 bg-white shadow-sm focus:ring-2 focus:ring-blue-200">
          <option value="">All Entities</option>
          <option value="Client">Client</option>
          <option value="Vehicle">Vehicle</option>
          <option value="File">File</option>
        </select>
        <select name="actionType" value={filters.actionType} onChange={handleFilterChange} className="border border-gray-300 rounded-lg px-3 py-2 bg-white shadow-sm focus:ring-2 focus:ring-blue-200">
          <option value="">All Actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
        </select>
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="">
        {/* Debug Info */}
        {(!Array.isArray(activities) || error) && (
          <div className="bg-yellow-100 text-yellow-900 p-4 rounded mb-4">
            <div><b>Debug Info</b></div>
            {!Array.isArray(activities) && <div>activities is not an array: {JSON.stringify(activities)}</div>}
            {error && <div>Error: {error}</div>}
          </div>
        )}
        {loading ? (
          <Loader className="my-10" />
        ) : error ? (
          <div className="text-red-500 p-6">{error}</div>
        ) : (
          Array.isArray(activities) && activities.length > 0 ? (
            <Table
              columns={[
                { label: 'Timestamp', accessor: 'timestamp', render: v => v ? new Date(v).toLocaleString() : '' },
                { label: 'Action', accessor: 'actionType' },
                { label: 'Entity', accessor: 'entityType' },
                { label: 'Name', accessor: 'entityName' },
                { label: 'By', accessor: 'performedByName' },
                { label: 'Details', accessor: 'details', render: v => v ? JSON.stringify(v) : '' },
              ]}
              data={activities}
            />
          ) : (
            <div className="text-gray-500 p-6">No activity log data found.</div>
          )
        )}
      </div>
      {!loading && hasMore && (
        <button onClick={handleLoadMore} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl shadow">Load More</button>
      )}
    </div>
  );
}

export default ActivityLog; 