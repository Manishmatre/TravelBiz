import React, { useState } from 'react';
import { FaUpload, FaDownload, FaFileCsv, FaFileExcel, FaCheckCircle, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import PageHeading from '../../components/common/PageHeading';
import SearchInput from '../../components/common/SearchInput';
import Dropdown from '../../components/common/Dropdown';
import { useAuth } from '../../contexts/AuthContext';
import Loader from '../../components/common/Loader';
import Notification from '../../components/common/Notification';

function ImportClients() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [validationResults, setValidationResults] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadComplete(false);
      setValidationResults(null);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setUploadComplete(false);
      setValidationResults(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadComplete(true);
          
          // Simulate validation results
          setValidationResults({
            totalRows: 150,
            validRows: 142,
            invalidRows: 8,
            errors: [
              { row: 15, field: 'email', message: 'Invalid email format' },
              { row: 23, field: 'phone', message: 'Phone number required' },
              { row: 45, field: 'name', message: 'Name is required' },
              { row: 67, field: 'email', message: 'Email already exists' },
              { row: 89, field: 'phone', message: 'Invalid phone format' },
              { row: 112, field: 'email', message: 'Invalid email format' },
              { row: 134, field: 'name', message: 'Name is required' },
              { row: 147, field: 'phone', message: 'Phone number required' }
            ]
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const downloadTemplate = () => {
    // Create and download CSV template
    const csvContent = "Name,Email,Phone,Company,Address,Notes\nJohn Doe,john@example.com,+1234567890,ABC Corp,123 Main St,Regular client\nJane Smith,jane@example.com,+1234567891,XYZ Inc,456 Oak Ave,VIP client";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'client_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getFileIcon = (fileName) => {
    if (fileName?.toLowerCase().endsWith('.csv')) {
      return <FaFileCsv className="text-green-600" />;
    } else if (fileName?.toLowerCase().match(/\.(xlsx|xls)$/)) {
      return <FaFileExcel className="text-blue-600" />;
    }
    return <FaUpload className="text-gray-600" />;
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 py-6 px-2 md:px-8 min-h-screen">
      <div className="space-y-6">
        <PageHeading
          icon={<FaUpload />}
          title="Import Clients"
          subtitle="Bulk import client data from CSV or Excel files"
          iconColor="text-blue-600"
        >
          <Button onClick={downloadTemplate} variant="outline">
            <FaDownload className="mr-2" />
            Download Template
          </Button>
        </PageHeading>

        {/* File Upload */}
        <Card className="p-4">
          <div className="p-4">
            {/* Table-integrated Filter/Search Bar (future extensibility) */}
            <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
              <SearchInput
                value={''}
                onChange={() => {}}
                placeholder="Search import history..."
                className="w-96"
                disabled
              />
              <div className="flex gap-4 items-center">
                <Dropdown
                  value={''}
                  onChange={() => {}}
                  options={[
                    { value: '', label: 'All Status' },
                    { value: 'success', label: 'Success' },
                    { value: 'error', label: 'Error' }
                  ]}
                  className="w-40"
                  disabled
                />
                <Button variant="outline" disabled>
                  <FaDownload className="mr-2" />
                  Export
                </Button>
              </div>
            </div>
            {/* Import Instructions */}
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaInfoCircle className="text-blue-600" />
              Import Instructions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Supported Formats</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• CSV files (.csv)</li>
                  <li>• Excel files (.xlsx, .xls)</li>
                  <li>• Maximum file size: 10MB</li>
                  <li>• Maximum 1000 rows per import</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Required Fields</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Name (required)</li>
                  <li>• Email (required, unique)</li>
                  <li>• Phone (required)</li>
                  <li>• Company (optional)</li>
                  <li>• Address (optional)</li>
                  <li>• Notes (optional)</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* File Upload */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload File</h3>
            
            {!selectedFile ? (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <FaUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Drop your file here, or click to browse
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Supports CSV and Excel files up to 10MB
                </p>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button as="span" variant="outline">
                    Choose File
                  </Button>
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getFileIcon(selectedFile.name)}
                    <div>
                      <p className="font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                  >
                    Remove
                  </Button>
                </div>

                {!uploadComplete && (
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="w-full"
                  >
                    {isUploading ? 'Uploading...' : 'Start Import'}
                  </Button>
                )}

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Validation Results */}
        {validationResults && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaCheckCircle className="text-green-600" />
                Import Results
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{validationResults.validRows}</div>
                  <div className="text-sm text-green-700">Valid Rows</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{validationResults.invalidRows}</div>
                  <div className="text-sm text-red-700">Invalid Rows</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{validationResults.totalRows}</div>
                  <div className="text-sm text-blue-700">Total Rows</div>
                </div>
              </div>

              {validationResults.errors.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <FaExclamationTriangle className="text-yellow-600" />
                    Validation Errors
                  </h4>
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-3 font-medium text-gray-700">Row</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700">Field</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700">Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {validationResults.errors.map((error, index) => (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="py-2 px-3 font-medium">{error.row}</td>
                            <td className="py-2 px-3 text-gray-600">{error.field}</td>
                            <td className="py-2 px-3 text-red-600">{error.message}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <Button variant="outline">Download Error Report</Button>
                <Button>Import Valid Rows</Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

export default ImportClients; 