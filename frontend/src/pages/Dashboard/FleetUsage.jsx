import React, { useState, useEffect } from 'react';
import { FaCar, FaSearch, FaFilter, FaTachometerAlt, FaGasPump, FaClock, FaDownload } from 'react-icons/fa';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Table from '../../components/common/Table';
import { useAuth } from '../../contexts/AuthContext';
import StatCard from '../../components/common/StatCard';
import Loader from '../../components/common/Loader';

function FleetUsage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const mockVehicles = [
      {
        id: 'V-001',
        name: 'Mercedes S-Class',
        plate: 'LUX-001',
        type: 'Sedan',
        mileage: 12500,
        usageHours: 450,
        fuelConsumption: 18.5, // MPG
      },
      {
        id: 'V-002',
        name: 'Cadillac Escalade',
        plate: 'VIP-007',
        type: 'SUV',
        mileage: 25000,
        usageHours: 800,
        fuelConsumption: 14.2,
      },
      {
        id: 'V-003',
        name: 'Mercedes Sprinter',
        plate: 'GRP-003',
        type: 'Van',
        mileage: 32000,
        usageHours: 1100,
        fuelConsumption: 16.8,
      },
       {
        id: 'V-004',
        name: 'Lincoln Navigator',
        plate: 'EXEC-04',
        type: 'SUV',
        mileage: 18000,
        usageHours: 650,
        fuelConsumption: 15.1,
      },
    ];
    
    setTimeout(() => {
      setVehicles(mockVehicles);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || v.plate.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || v.type === filterType;
    return matchesSearch && matchesType;
  });
  
  const columns = [
    { key: 'vehicle', label: 'Vehicle', render: (v) => (
      <div>
        <div className="font-bold text-gray-900">{v.name}</div>
        <div className="text-sm text-gray-500 font-mono">{v.plate}</div>
      </div>
    )},
    { key: 'mileage', label: 'Total Mileage', render: (v) => (
      <div className="flex items-center gap-2"><FaTachometerAlt className="text-gray-500" /> {v.mileage.toLocaleString()} mi</div>
    )},
    { key: 'usage', label: 'Usage Hours', render: (v) => (
       <div className="flex items-center gap-2"><FaClock className="text-gray-500" /> {v.usageHours.toLocaleString()} hrs</div>
    )},
    { key: 'fuel', label: 'Fuel Economy', render: (v) => (
      <div className="flex items-center gap-2"><FaGasPump className="text-gray-500" /> {v.fuelConsumption} MPG</div>
    )},
    { key: 'actions', label: 'Actions', render: (v) => (
      <Button size="sm" variant="outline">Maintenance Log</Button>
    )}
  ];

  const totalMileage = vehicles.reduce((sum, v) => sum + v.mileage, 0);
  const avgMileage = totalMileage / vehicles.length;
  const mostUsedVehicle = vehicles.sort((a,b) => b.usageHours - a.usageHours)[0] || {name: 'N/A'};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaCar className="text-indigo-600" />
            Fleet Usage Reports
          </h1>
          <p className="text-gray-600 mt-2">Analyze mileage, usage hours, and fuel consumption of your fleet.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="p-5">
            <h3 className="font-semibold text-gray-600">Total Fleet Mileage</h3>
            <p className="text-3xl font-bold text-indigo-600 mt-2">{totalMileage.toLocaleString()} mi</p>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <h3 className="font-semibold text-gray-600">Avg. Mileage/Vehicle</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{avgMileage.toLocaleString(undefined, {maximumFractionDigits: 0})} mi</p>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <h3 className="font-semibold text-gray-600">Most Utilized Vehicle</h3>
            <p className="text-xl font-bold text-green-600 mt-2">{mostUsedVehicle.name}</p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input type="text" placeholder="Search by name or plate" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-60" />
              </div>
              <select 
                value={filterType} 
                onChange={e => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Vehicle Types</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Van">Van</option>
              </select>
            </div>
            <Button>
              <FaDownload className="mr-2"/> Export Data
            </Button>
          </div>
          <div className="mt-4">
            <Table
              data={filteredVehicles}
              columns={columns}
              loading={loading}
              emptyMessage="No vehicle usage data found."
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

export default FleetUsage; 