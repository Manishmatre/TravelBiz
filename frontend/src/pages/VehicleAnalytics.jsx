import React, { useState, useEffect } from 'react';
import { FaChartBar, FaCar, FaGasPump, FaTools, FaRoute, FaDollarSign, FaChartLine, FaChartPie } from 'react-icons/fa';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

function VehicleAnalytics() {
  const [analyticsData, setAnalyticsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    const mockData = {
      totalVehicles: 45,
      activeVehicles: 38,
      maintenanceVehicles: 5,
      inactiveVehicles: 2,
      totalRevenue: 125000,
      avgFuelEfficiency: 12.5,
      totalMileage: 125000,
      maintenanceCosts: 8500,
      topPerformingVehicles: [
        { name: 'Toyota Camry 2023', revenue: 8500, trips: 45, efficiency: 14.2 },
        { name: 'Honda Accord 2023', revenue: 7800, trips: 42, efficiency: 13.8 },
        { name: 'BMW 5 Series 2023', revenue: 9200, trips: 38, efficiency: 11.5 }
      ],
      fuelConsumption: [
        { month: 'Jan', consumption: 1200, cost: 4800 },
        { month: 'Feb', consumption: 1350, cost: 5400 },
        { month: 'Mar', consumption: 1420, cost: 5680 },
        { month: 'Apr', consumption: 1580, cost: 6320 },
        { month: 'May', consumption: 1650, cost: 6600 },
        { month: 'Jun', consumption: 1780, cost: 7120 }
      ],
      vehicleTypes: [
        { type: 'Sedan', percentage: 45, count: 20 },
        { type: 'SUV', percentage: 30, count: 13 },
        { type: 'Luxury', percentage: 15, count: 7 },
        { type: 'Van', percentage: 10, count: 5 }
      ],
      maintenanceSchedule: [
        { vehicle: 'Toyota Camry 2023', nextService: '2024-02-15', mileage: 8500 },
        { vehicle: 'Honda Accord 2023', nextService: '2024-02-20', mileage: 9200 },
        { vehicle: 'BMW 5 Series 2023', nextService: '2024-02-10', mileage: 7800 }
      ]
    };
    
    setTimeout(() => {
      setAnalyticsData(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  const StatCard = ({ title, value, icon, color, change }) => (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {change && (
              <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change > 0 ? '+' : ''}{change}% from last month
              </p>
            )}
          </div>
          <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
            {icon}
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaChartBar className="text-blue-600" />
            Vehicle Analytics
          </h1>
          <p className="text-gray-600 mt-2">Comprehensive insights into vehicle performance, costs, and efficiency</p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button variant="outline">Export Report</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Vehicles"
          value={analyticsData.totalVehicles}
          icon={<FaCar className="text-white" />}
          color="bg-blue-100"
          change={8.5}
        />
        <StatCard
          title="Active Vehicles"
          value={analyticsData.activeVehicles}
          icon={<FaRoute className="text-white" />}
          color="bg-green-100"
          change={12.3}
        />
        <StatCard
          title="Total Revenue"
          value={`$${analyticsData.totalRevenue?.toLocaleString()}`}
          icon={<FaDollarSign className="text-white" />}
          color="bg-yellow-100"
          change={15.7}
        />
        <StatCard
          title="Avg Fuel Efficiency"
          value={`${analyticsData.avgFuelEfficiency} km/L`}
          icon={<FaGasPump className="text-white" />}
          color="bg-purple-100"
          change={-2.1}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaChartLine className="text-blue-600" />
              Fuel Consumption Trend
            </h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {analyticsData.fuelConsumption?.map((data, index) => (
                <div key={data.month} className="flex flex-col items-center">
                  <div className="w-8 bg-blue-500 rounded-t" style={{ height: `${(data.consumption / 2000) * 200}px` }}></div>
                  <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>Total fuel cost: ${analyticsData.fuelConsumption?.reduce((sum, d) => sum + d.cost, 0).toLocaleString()}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaChartPie className="text-green-600" />
              Vehicle Fleet Distribution
            </h3>
            <div className="space-y-3">
              {analyticsData.vehicleTypes?.map((type, index) => (
                <div key={type.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${
                      index === 0 ? 'bg-blue-500' : 
                      index === 1 ? 'bg-green-500' : 
                      index === 2 ? 'bg-yellow-500' : 'bg-purple-500'
                    }`}></div>
                    <span className="text-sm font-medium">{type.type}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{type.percentage}%</div>
                    <div className="text-xs text-gray-500">{type.count} vehicles</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Performing Vehicles</h3>
            <div className="space-y-4">
              {analyticsData.topPerformingVehicles?.map((vehicle, index) => (
                <div key={vehicle.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{vehicle.name}</div>
                      <div className="text-sm text-gray-500">{vehicle.trips} trips</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">${vehicle.revenue.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{vehicle.efficiency} km/L</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaTools className="text-orange-600" />
              Upcoming Maintenance
            </h3>
            <div className="space-y-3">
              {analyticsData.maintenanceSchedule?.map((item, index) => (
                <div key={item.vehicle} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{item.vehicle}</div>
                    <div className="text-sm text-gray-500">{item.mileage.toLocaleString()} km</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-orange-600">
                      {new Date(item.nextService).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500">Next service</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{analyticsData.totalMileage?.toLocaleString()}</div>
              <div className="text-sm text-blue-700">Total Mileage (km)</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">${analyticsData.maintenanceCosts?.toLocaleString()}</div>
              <div className="text-sm text-green-700">Maintenance Costs</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{analyticsData.maintenanceVehicles}</div>
              <div className="text-sm text-purple-700">Vehicles in Maintenance</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default VehicleAnalytics; 