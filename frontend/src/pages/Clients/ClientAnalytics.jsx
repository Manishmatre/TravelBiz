import React, { useState, useEffect } from 'react';
import { FaChartBar, FaUsers, FaUserPlus, FaUserCheck, FaUserTimes, FaCalendarAlt, FaDollarSign, FaChartLine, FaChartPie } from 'react-icons/fa';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import PageHeading from '../../components/common/PageHeading';
import { getClients } from '../../services/clientService';
import { getBookings } from '../../services/bookingService';
import { useAuth } from '../../contexts/AuthContext';
import StatCard from '../../components/common/StatCard';
import Loader from '../../components/common/Loader';
import Table from '../../components/common/Table';

function ClientAnalytics() {
  const { token } = useAuth();
  const [analyticsData, setAnalyticsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([
      getClients(token),
      getBookings(null, token)
    ]).then(([clients, bookings]) => {
      // Compute stats
      const now = new Date();
      const startDate = new Date();
      if (timeRange === '7d') startDate.setDate(now.getDate() - 7);
      else if (timeRange === '30d') startDate.setDate(now.getDate() - 30);
      else if (timeRange === '90d') startDate.setDate(now.getDate() - 90);
      else if (timeRange === '1y') startDate.setFullYear(now.getFullYear() - 1);
      else startDate.setDate(now.getDate() - 30);

      const filteredClients = clients.filter(c => new Date(c.createdAt) >= startDate);
      const filteredBookings = bookings.filter(b => new Date(b.createdAt) >= startDate);
      const activeClients = clients.filter(c => (c.status || 'Active') === 'Active');
      const inactiveClients = clients.filter(c => c.status === 'Inactive');
      const newClients = filteredClients.length;
      const totalRevenue = bookings.reduce((sum, b) => sum + (Number(b.price) || 0), 0);
      const avgBookingsPerClient = clients.length ? (bookings.length / clients.length).toFixed(2) : 0;
      // Monthly growth (last 12 months)
      const monthlyGrowth = Array(12).fill(0).map((_, i) => {
        const month = new Date(now.getFullYear(), i, 1);
        const monthStr = month.toLocaleString('default', { month: 'short' });
        const clientsInMonth = clients.filter(c => {
          const d = new Date(c.createdAt);
          return d.getFullYear() === now.getFullYear() && d.getMonth() === i;
        }).length;
        const revenueInMonth = bookings.filter(b => {
          const d = new Date(b.createdAt);
          return d.getFullYear() === now.getFullYear() && d.getMonth() === i;
        }).reduce((sum, b) => sum + (Number(b.price) || 0), 0);
        return { month: monthStr, clients: clientsInMonth, revenue: revenueInMonth };
      });
      setAnalyticsData({
        totalClients: clients.length,
        newClients,
        activeClients: activeClients.length,
        inactiveClients: inactiveClients.length,
        avgBookingsPerClient,
        totalRevenue,
        clientRetentionRate: 0, // Placeholder
        topClientSegments: [], // Placeholder
        monthlyGrowth,
        clientSatisfaction: 0, // Placeholder
        avgResponseTime: '--', // Placeholder
        topPerformingAgents: [] // Placeholder
      });
    }).finally(() => setLoading(false));
  }, [token, timeRange]);

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8 min-h-screen">
      <div className="space-y-6">
        <PageHeading
          icon={<FaChartBar />}
          title="Client Analytics"
          subtitle="Comprehensive insights into client behavior, growth, and performance metrics"
          iconColor="text-blue-600"
        >
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
        </PageHeading>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <StatCard icon={<FaUsers />} label="Total Clients" value={analyticsData.totalClients} accentColor="blue" />
          <StatCard icon={<FaUserCheck />} label="Active Clients" value={analyticsData.activeClients} accentColor="green" />
          <StatCard icon={<FaUserTimes />} label="Inactive Clients" value={analyticsData.inactiveClients} accentColor="red" />
          <StatCard icon={<FaCalendarAlt />} label="New Clients" value={analyticsData.newClients} accentColor="yellow" />
          <StatCard icon={<FaDollarSign />} label="Total Revenue" value={`$${analyticsData.totalRevenue?.toLocaleString()}`} accentColor="purple" />
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
    </div>
  );
}

export default ClientAnalytics; 