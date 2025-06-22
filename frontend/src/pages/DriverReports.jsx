import React, { useState, useEffect } from 'react';
import { FaUserClock, FaSearch, FaDownload, FaRoad, FaDollarSign, FaList } from 'react-icons/fa';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Table from '../components/common/Table';

function DriverReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    const mockReports = [
      {
        driverId: 'DRV-101',
        driverName: 'Johnathan "John" Wick',
        hoursLogged: 168,
        distance: 2550, // in miles
        earnings: 4200,
        trips: 45,
      },
      {
        driverId: 'DRV-102',
        driverName: 'Sarah Connor',
        hoursLogged: 155,
        distance: 2300,
        earnings: 3875,
        trips: 41,
      },
      {
        driverId: 'DRV-103',
        driverName: 'James "Jim" Hopper',
        hoursLogged: 162,
        distance: 2480,
        earnings: 4050,
        trips: 43,
      },
       {
        driverId: 'DRV-104',
        driverName: 'Ellen Ripley',
        hoursLogged: 175,
        distance: 2800,
        earnings: 4550,
        trips: 52,
      },
    ];
    
    setTimeout(() => {
      setReports(mockReports);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredReports = reports.filter(r => 
    r.driverName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const columns = [
    { key: 'driver', label: 'Driver', render: (r) => (
      <div>
        <div className="font-bold text-gray-900">{r.driverName}</div>
        <div className="text-sm text-gray-500 font-mono">{r.driverId}</div>
      </div>
    )},
    { key: 'hours', label: 'Hours Logged', render: (r) => (
      <div className="flex items-center gap-2"><FaUserClock className="text-gray-500" /> {r.hoursLogged} hrs</div>
    )},
    { key: 'distance', label: 'Distance', render: (r) => (
       <div className="flex items-center gap-2"><FaRoad className="text-gray-500" /> {r.distance.toLocaleString()} mi</div>
    )},
     { key: 'trips', label: 'Total Trips', render: (r) => (
       <div className="flex items-center gap-2"><FaList className="text-gray-500" /> {r.trips}</div>
    )},
    { key: 'earnings', label: 'Total Earnings', render: (r) => (
      <div className="font-bold text-green-600">${r.earnings.toLocaleString()}</div>
    )},
    { key: 'actions', label: 'Actions', render: (r) => (
      <Button size="sm" variant="outline">View Details</Button>
    )}
  ];

  const totalHours = reports.reduce((sum, r) => sum + r.hoursLogged, 0);
  const totalDistance = reports.reduce((sum, r) => sum + r.distance, 0);
  const totalEarnings = reports.reduce((sum, r) => sum + r.earnings, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaUserClock className="text-orange-600" />
            Driver Reports
          </h1>
          <p className="text-gray-600 mt-2">Generate reports on driver hours, distance, and earnings.</p>
        </div>
      </div>
      
      <Card>
        <div className="p-6">
           <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <Input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} />
            </div>
             <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <Input type="date" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} />
            </div>
            <div className="relative flex-1 min-w-[250px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Driver</label>
              <FaSearch className="absolute left-3 bottom-3 text-gray-400" />
              <Input type="text" placeholder="Search by name" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Button>
              <FaDownload className="mr-2"/>
              Export Report
            </Button>
          </div>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="p-5">
            <h3 className="font-semibold text-gray-600 flex items-center gap-2"><FaUserClock/> Total Hours Logged</h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">{totalHours.toLocaleString()} hrs</p>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <h3 className="font-semibold text-gray-600 flex items-center gap-2"><FaRoad/> Total Distance Driven</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{totalDistance.toLocaleString()} mi</p>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <h3 className="font-semibold text-gray-600 flex items-center gap-2"><FaDollarSign/> Total Driver Payout</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">${totalEarnings.toLocaleString()}</p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">Driver Activity Report</h3>
          <Table
            data={filteredReports}
            columns={columns}
            loading={loading}
            emptyMessage="No driver reports found for the selected period."
          />
        </div>
      </Card>
    </div>
  );
}

export default DriverReports; 