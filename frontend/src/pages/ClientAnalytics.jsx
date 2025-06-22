import React, { useState, useEffect } from 'react';
import { FaChartBar, FaUsers, FaUserPlus, FaUserCheck, FaUserTimes, FaCalendarAlt, FaDollarSign, FaChartLine, FaChartPie } from 'react-icons/fa';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

function ClientAnalytics() {
  const [analyticsData, setAnalyticsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  // Mock analytics data
  useEffect(() => {
    const mockData = {
      totalClients: 1247,
      newClients: 89,
      activeClients: 892,
      inactiveClients: 266,
      avgBookingsPerClient: 3.2,
      totalRevenue: 456789,
      clientRetentionRate: 78.5,
      topClientSegments: [
        { name: 'Business Travelers', percentage: 45, color: 'bg-blue-500' },
        { name: 'Leisure Travelers', percentage: 32, color: 'bg-green-500' },
        { name: 'VIP Clients', percentage: 15, color: 'bg-yellow-500' },
        { name: 'Occasional Users', percentage: 8, color: 'bg-gray-500' }
      ],
      monthlyGrowth: [
        { month: 'Jan', clients: 120, revenue: 45000 },
        { month: 'Feb', clients: 135, revenue: 52000 },
        { month: 'Mar', clients: 142, revenue: 58000 },
        { month: 'Apr', clients: 158, revenue: 62000 },
        { month: 'May', clients: 165, revenue: 68000 },
        { month: 'Jun', clients: 178, revenue: 72000 }
      ],
      clientSatisfaction: 4.6,
      avgResponseTime: '2.3 hours',
      topPerformingAgents: [
        { name: 'Sarah Johnson', clients: 45, satisfaction: 4.8 },
        { name: 'Mike Chen', clients: 38, satisfaction: 4.7 },
        { name: 'Lisa Rodriguez', clients: 42, satisfaction: 4.6 }
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
            Client Analytics
          </h1>
          <p className="text-gray-600 mt-2">Comprehensive insights into client behavior, growth, and performance metrics</p>
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Clients"
          value={analyticsData.totalClients?.toLocaleString()}
          icon={<FaUsers className="text-white" />}
          color="bg-blue-100"
          change={12.5}
        />
        <StatCard
          title="New Clients"
          value={analyticsData.newClients}
          icon={<FaUserPlus className="text-white" />}
          color="bg-green-100"
          change={8.3}
        />
        <StatCard
          title="Active Clients"
          value={analyticsData.activeClients?.toLocaleString()}
          icon={<FaUserCheck className="text-white" />}
          color="bg-purple-100"
          change={5.7}
        />
        <StatCard
          title="Total Revenue"
          value={`$${analyticsData.totalRevenue?.toLocaleString()}`}
          icon={<FaDollarSign className="text-white" />}
          color="bg-yellow-100"
          change={15.2}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Growth Chart */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaChartLine className="text-blue-600" />
              Client Growth Trend
            </h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {analyticsData.monthlyGrowth?.map((data, index) => (
                <div key={data.month} className="flex flex-col items-center">
                  <div className="w-8 bg-blue-500 rounded-t" style={{ height: `${(data.clients / 200) * 200}px` }}></div>
                  <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>Average monthly growth: 12.3%</p>
            </div>
          </div>
        </Card>

        {/* Client Segments */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaChartPie className="text-green-600" />
              Client Segments
            </h3>
            <div className="space-y-3">
              {analyticsData.topClientSegments?.map((segment, index) => (
                <div key={segment.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 ${segment.color} rounded-full`}></div>
                    <span className="text-sm font-medium">{segment.name}</span>
                  </div>
                  <span className="text-sm font-semibold">{segment.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Satisfaction */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Client Satisfaction</h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{analyticsData.clientSatisfaction}</div>
              <div className="flex justify-center mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaChartBar
                    key={star}
                    className={`w-5 h-5 ${star <= Math.floor(analyticsData.clientSatisfaction) ? 'text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600">out of 5 stars</p>
            </div>
          </div>
        </Card>

        {/* Response Time */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Avg Response Time</h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">{analyticsData.avgResponseTime}</div>
              <p className="text-sm text-gray-600">Average response to client inquiries</p>
            </div>
          </div>
        </Card>

        {/* Retention Rate */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Client Retention</h3>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">{analyticsData.clientRetentionRate}%</div>
              <p className="text-sm text-gray-600">Clients who book again within 6 months</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Performing Agents */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Performing Agents</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Agent</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Clients Managed</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Satisfaction Score</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.topPerformingAgents?.map((agent, index) => (
                  <tr key={agent.name} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {agent.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <span className="font-medium">{agent.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{agent.clients}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold">{agent.satisfaction}</span>
                        <FaChartBar className="w-4 h-4 text-yellow-400" />
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Button size="sm" variant="outline">View Details</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ClientAnalytics; 