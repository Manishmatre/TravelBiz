import React, { useState } from 'react';
import { FaChartLine, FaCalendarAlt, FaDownload, FaFilter, FaCar, FaUserFriends, FaDollarSign } from 'react-icons/fa';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
// A real app would use a charting library like Chart.js or Recharts
// For this example, we'll use a placeholder for the chart.
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import PageHeading from '../../components/common/PageHeading';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const mockMonthlyData = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      label: 'Bookings',
      data: [65, 59, 80, 81, 56, 55, 40],
      backgroundColor: 'rgba(59, 130, 246, 0.5)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1,
    },
    {
      label: 'Revenue ($k)',
      data: [28, 48, 40, 19, 86, 27, 90],
      backgroundColor: 'rgba(16, 185, 129, 0.5)',
      borderColor: 'rgba(16, 185, 129, 1)',
      borderWidth: 1,
    },
  ],
};

function BookingReports() {
  const [reportType, setReportType] = useState('monthly_summary');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Monthly Booking and Revenue Trends' },
    },
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8 min-h-screen">
      <div className="space-y-6 mb-6">
        <PageHeading
          icon={<FaChartLine />}
          title="Booking Reports"
          subtitle="Analyze trends and generate reports on booking data"
          iconColor="text-green-600"
        >
          <Button>
            <FaDownload className="mr-2" />
            Export Current Report
          </Button>
        </PageHeading>
      </div>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card><div className="p-6 flex items-center"><div className="p-3 rounded-full bg-green-100 text-green-600"><FaDollarSign size={24}/></div><div className="ml-4"><p className="text-sm font-medium text-gray-500">Total Revenue (YTD)</p><p className="text-2xl font-bold text-gray-900">$1,250,450</p></div></div></Card>
        <Card><div className="p-6 flex items-center"><div className="p-3 rounded-full bg-blue-100 text-blue-600"><FaCar size={24}/></div><div className="ml-4"><p className="text-sm font-medium text-gray-500">Total Bookings (YTD)</p><p className="text-2xl font-bold text-gray-900">1,890</p></div></div></Card>
        <Card><div className="p-6 flex items-center"><div className="p-3 rounded-full bg-purple-100 text-purple-600"><FaUserFriends size={24}/></div><div className="ml-4"><p className="text-sm font-medium text-gray-500">New Clients (YTD)</p><p className="text-2xl font-bold text-gray-900">420</p></div></div></Card>
      </div>
      {/* Report Generator (Filter/Search Bar) */}
      <Card className="p-0 mb-8">
        <div className="flex flex-col md:flex-row md:items-end gap-4 p-6 pb-0">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select 
              id="reportType"
              value={reportType} 
              onChange={e => setReportType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="monthly_summary">Monthly Summary</option>
              <option value="revenue_by_vehicle">Revenue by Vehicle</option>
              <option value="peak_hours">Peak Hours Analysis</option>
              <option value="cancellation_reasons">Cancellation Reasons</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <Input type="date" id="startDate" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <Input type="date" id="endDate" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} />
          </div>
          <Button>
            <FaFilter className="mr-2"/>
            Generate Report
          </Button>
        </div>
        <div className="p-6 pt-0">
          {/* Chart or Table */}
          <h3 className="text-xl font-semibold mb-4">Monthly Summary Chart</h3>
          <div style={{ height: '400px' }}>
            <Bar options={chartOptions} data={mockMonthlyData} />
          </div>
        </div>
      </Card>
    </div>
  );
}

export default BookingReports; 