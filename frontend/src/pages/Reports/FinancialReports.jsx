import React, { useState } from 'react';
import { FaFileInvoiceDollar, FaChartPie, FaChartBar, FaDownload, FaFilter, FaRegCalendarAlt } from 'react-icons/fa';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const revenueData = {
  labels: ['Service Fees', 'Cancellation Fees', 'Affiliate Commission'],
  datasets: [{
    data: [350000, 25000, 15000],
    backgroundColor: ['#3B82F6', '#FBBF24', '#10B981'],
  }],
};

const expenseData = {
  labels: ['Fuel', 'Driver Salaries', 'Maintenance', 'Insurance', 'Marketing'],
  datasets: [{
    data: [75000, 150000, 45000, 30000, 20000],
    backgroundColor: ['#EF4444', '#F97316', '#8B5CF6', '#EC4899', '#6B7280'],
  }],
};

const profitLossData = {
  labels: ['Q1', 'Q2', 'Q3', 'Q4'],
  datasets: [
    { label: 'Revenue', data: [120, 150, 180, 210], backgroundColor: 'rgba(59, 130, 246, 0.7)' },
    { label: 'Profit', data: [40, 55, 65, 80], backgroundColor: 'rgba(16, 185, 129, 0.7)' },
  ],
};

function FinancialReports() {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaFileInvoiceDollar className="text-emerald-600" />
            Financial Reports
          </h1>
          <p className="text-gray-600 mt-2">Analyze revenue, expenses, and profit margins.</p>
        </div>
        <Button color="primary">
          <FaDownload className="mr-2" /> Export P&L Statement
        </Button>
      </div>

      <Card>
        <div className="p-6 flex flex-wrap gap-4 items-center">
            <h3 className="text-lg font-semibold">Filter by Date Range:</h3>
            <div className="flex-1 min-w-[200px]">
              <Input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} />
            </div>
            <div className="flex-1 min-w-[200px]">
              <Input type="date" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} />
            </div>
            <Button color="secondary" variant="outline"><FaFilter className="mr-2"/>Apply</Button>
        </div>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-center">Revenue Breakdown</h3>
            <div className="relative" style={{ height: '250px' }}>
              <Doughnut data={revenueData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-center">Expense Breakdown</h3>
            <div className="relative" style={{ height: '250px' }}>
              <Doughnut data={expenseData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </Card>
         <Card>
          <div className="p-6 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Key Financials</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-600">Total Revenue:</span>
                <span className="font-bold text-2xl text-green-600">$390,000</span>
              </div>
               <div className="flex justify-between items-center">
                <span className="font-medium text-gray-600">Total Expenses:</span>
                <span className="font-bold text-2xl text-red-600">$320,000</span>
              </div>
              <hr/>
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-600">Net Profit:</span>
                <span className="font-bold text-3xl text-green-700">$70,000</span>
              </div>
               <div className="flex justify-between items-center">
                <span className="font-medium text-gray-600">Profit Margin:</span>
                <span className="font-bold text-2xl text-blue-600">17.9%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4">Quarterly Profit & Loss</h3>
          <div className="relative" style={{ height: '400px' }}>
            <Bar data={profitLossData} options={{ responsive: true, maintainAspectRatio: false, scales: {y: { ticks: { callback: value => `$${value}k` } } } }} />
          </div>
        </div>
      </Card>
    </div>
  );
}

export default FinancialReports; 