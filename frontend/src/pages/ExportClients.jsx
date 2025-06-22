import React, { useState } from 'react';
import { FaDownload, FaFileCsv, FaFileExcel, FaFilter, FaCalendarAlt, FaUsers, FaCheckCircle } from 'react-icons/fa';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import PageHeading from '../components/common/PageHeading';
import SearchInput from '../components/common/SearchInput';
import Dropdown from '../components/common/Dropdown';

function ExportClients() {
  const [exportFormat, setExportFormat] = useState('csv');
  const [dateRange, setDateRange] = useState('all');
  const [clientStatus, setClientStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFields, setSelectedFields] = useState([
    'name', 'email', 'phone', 'company', 'address', 'status', 'createdAt'
  ]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  const availableFields = [
    { key: 'name', label: 'Name', required: true },
    { key: 'email', label: 'Email', required: true },
    { key: 'phone', label: 'Phone', required: false },
    { key: 'company', label: 'Company', required: false },
    { key: 'address', label: 'Address', required: false },
    { key: 'status', label: 'Status', required: false },
    { key: 'createdAt', label: 'Created Date', required: false },
    { key: 'lastBooking', label: 'Last Booking', required: false },
    { key: 'totalBookings', label: 'Total Bookings', required: false },
    { key: 'totalSpent', label: 'Total Spent', required: false },
    { key: 'notes', label: 'Notes', required: false },
    { key: 'vipLevel', label: 'VIP Level', required: false }
  ];

  const handleFieldToggle = (fieldKey) => {
    setSelectedFields(prev => {
      if (prev.includes(fieldKey)) {
        const field = availableFields.find(f => f.key === fieldKey);
        if (field?.required) return prev;
        return prev.filter(f => f !== fieldKey);
      } else {
        return [...prev, fieldKey];
      }
    });
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportComplete(false);

    setTimeout(() => {
      setIsExporting(false);
      setExportComplete(true);
      
      const mockData = [
        { name: 'John Doe', email: 'john@example.com', phone: '+1234567890', company: 'ABC Corp', status: 'active' },
        { name: 'Jane Smith', email: 'jane@example.com', phone: '+1234567891', company: 'XYZ Inc', status: 'active' }
      ];

      let content = '';
      if (exportFormat === 'csv') {
        const headers = selectedFields.map(field => availableFields.find(f => f.key === field)?.label || field);
        content = headers.join(',') + '\n';
        content += mockData.map(row => 
          selectedFields.map(field => row[field] || '').join(',')
        ).join('\n');
      }

      const blob = new Blob([content], { 
        type: exportFormat === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clients_export_${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      a.click();
      window.URL.revokeObjectURL(url);
    }, 2000);
  };

  const getFormatIcon = (format) => {
    return format === 'csv' ? <FaFileCsv className="text-green-600" /> : <FaFileExcel className="text-blue-600" />;
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-4 px-2 md:px-8 min-h-screen">
      <div>
        <PageHeading
          icon={<FaDownload />}
          title="Export Clients"
          subtitle="Export client data in various formats with custom filters"
          iconColor="text-blue-600"
        />

        {/* Modern Filter Bar (for future extensibility) */}
        <div className="flex flex-wrap items-center justify-between bg-white rounded-xl shadow p-3 mb-4 border border-gray-100">
          <SearchInput
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search clients..."
            className="w-80"
          />
          <div className="flex gap-3 items-center">
            <Dropdown
              value={clientStatus}
              onChange={e => setClientStatus(e.target.value)}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'vip', label: 'VIP' }
              ]}
              className="w-36"
            />
            <Button variant="outline" onClick={handleExport} disabled={isExporting}>
              <FaDownload className="mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaFilter className="text-blue-600" />
                Export Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'csv', label: 'CSV File', description: 'Comma separated values' },
                      { key: 'excel', label: 'Excel File', description: 'Microsoft Excel format' }
                    ].map(format => (
                      <div
                        key={format.key}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          exportFormat === format.key
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onClick={() => setExportFormat(format.key)}
                      >
                        <div className="flex items-center gap-2">
                          {getFormatIcon(format.key)}
                          <div>
                            <div className="font-medium">{format.label}</div>
                            <div className="text-xs text-gray-500">{format.description}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                    <option value="year">This Year</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Client Status</label>
                  <select
                    value={clientStatus}
                    onChange={(e) => setClientStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Clients</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                    <option value="vip">VIP Clients Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Filter</label>
                  <Input
                    type="text"
                    placeholder="Search by name, email, or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaUsers className="text-green-600" />
                Select Fields
              </h3>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {availableFields.map(field => (
                  <label key={field.key} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFields.includes(field.key)}
                      onChange={() => handleFieldToggle(field.key)}
                      disabled={field.required}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </div>
                      {field.required && (
                        <div className="text-xs text-gray-500">Required field</div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Selected {selectedFields.length} of {availableFields.length} fields
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Export Preview</h3>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Estimated Records:</span>
                  <span className="ml-2 text-gray-600">1,247 clients</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">File Size:</span>
                  <span className="ml-2 text-gray-600">~2.3 MB</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Format:</span>
                  <span className="ml-2 text-gray-600">{exportFormat.toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                onClick={handleExport}
                disabled={isExporting || selectedFields.length === 0}
                className="flex items-center gap-2"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <FaDownload />
                    Export Clients
                  </>
                )}
              </Button>
              
              {exportComplete && (
                <div className="flex items-center gap-2 text-green-600">
                  <FaCheckCircle />
                  <span>Export completed successfully!</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default ExportClients; 