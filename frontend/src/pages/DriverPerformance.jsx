import React, { useState, useEffect } from 'react';
import { FaTachometerAlt, FaSearch, FaFilter, FaStar, FaCheck, FaExclamationCircle, FaUser, FaMedal } from 'react-icons/fa';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Table from '../components/common/Table';

function DriverPerformance() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortMetric, setSortMetric] = useState('rating');

  useEffect(() => {
    const mockDrivers = [
      {
        id: 'DRV-101',
        name: 'Johnathan "John" Wick',
        rating: 4.9,
        completionRate: 99,
        incidents: 0,
        trips: 152,
      },
      {
        id: 'DRV-102',
        name: 'Sarah Connor',
        rating: 4.7,
        completionRate: 95,
        incidents: 1,
        trips: 89,
      },
      {
        id: 'DRV-103',
        name: 'James "Jim" Hopper',
        rating: 4.8,
        completionRate: 98,
        incidents: 0,
        trips: 120,
      },
      {
        id: 'DRV-104',
        name: 'Ellen Ripley',
        rating: 5.0,
        completionRate: 100,
        incidents: 0,
        trips: 210,
      },
    ];
    
    setTimeout(() => {
      setDrivers(mockDrivers);
      setLoading(false);
    }, 1000);
  }, []);

  const sortedDrivers = [...drivers].sort((a, b) => {
    if (sortMetric === 'rating' || sortMetric === 'completionRate') {
      return b[sortMetric] - a[sortMetric];
    }
    if (sortMetric === 'incidents') {
      return a[sortMetric] - b[sortMetric];
    }
    return 0;
  });

  const filteredDrivers = sortedDrivers.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const columns = [
    { key: 'rank', label: 'Rank', render: (_, index) => (
      <div className="flex items-center justify-center font-bold text-lg">
        {index + 1 === 1 && <FaMedal className="text-yellow-400" />}
        {index + 1 === 2 && <FaMedal className="text-gray-400" />}
        {index + 1 === 3 && <FaMedal className="text-yellow-600" />}
        {index + 1 > 3 && index + 1}
      </div>
    )},
    { key: 'driver', label: 'Driver', render: (d) => (
      <div>
        <div className="font-bold text-gray-900">{d?.name}</div>
        <div className="text-sm text-gray-500 font-mono">{d?.id}</div>
      </div>
    )},
    { key: 'rating', label: 'Avg. Rating', render: (d) => (
      <div className="flex items-center gap-1 font-bold">
        <FaStar className="text-yellow-500" />
        {d?.rating?.toFixed(1)}
      </div>
    )},
    { key: 'completionRate', label: 'Completion Rate', render: (d) => (
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${d?.completionRate}%` }}></div>
        <span className="text-sm font-medium">{d?.completionRate}%</span>
      </div>
    )},
    { key: 'incidents', label: 'Incidents', render: (d) => (
      <div className={`font-bold ${d?.incidents > 0 ? 'text-red-600' : 'text-green-600'}`}>{d?.incidents}</div>
    )},
     { key: 'trips', label: 'Total Trips', render: (d) => <div className="font-medium">{d?.trips}</div> },
    { key: 'actions', label: 'Actions', render: (d) => (
      <Button size="sm" variant="outline">View Profile</Button>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaTachometerAlt className="text-blue-600" />
            Driver Performance
          </h1>
          <p className="text-gray-600 mt-2">Monitor driver ratings, trip completion, and incident reports.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-500">Fleet Avg. Rating</h3>
            <p className="text-2xl font-bold">4.85 <FaStar className="inline text-yellow-500 mb-1"/></p>
          </div>
        </Card>
         <Card>
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-500">Fleet Completion Rate</h3>
            <p className="text-2xl font-bold">98.2%</p>
          </div>
        </Card>
         <Card>
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-500">Total Incidents (30d)</h3>
            <p className="text-2xl font-bold text-red-600">1</p>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-500">Top Performer</h3>
            <p className="text-xl font-bold text-green-600">Ellen Ripley</p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
               <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by driver name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <div>
                <label htmlFor="sortMetric" className="text-sm font-medium text-gray-700 mr-2">Sort by:</label>
                <select 
                  id="sortMetric"
                  value={sortMetric} 
                  onChange={e => setSortMetric(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="rating">Highest Rating</option>
                  <option value="completionRate">Highest Completion</option>
                  <option value="incidents">Lowest Incidents</option>
                </select>
              </div>
            </div>
          </div>
          <Table
            data={filteredDrivers}
            columns={columns}
            loading={loading}
            emptyMessage="No performance data found."
          />
        </div>
      </Card>
    </div>
  );
}

export default DriverPerformance; 