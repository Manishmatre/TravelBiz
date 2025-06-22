import React, { useState, useRef } from 'react';
import Card from './common/Card';
import Button from './common/Button';
import { FaFilePdf, FaFileImage, FaFileWord, FaFileExcel, FaFile, FaDownload, FaTrash, FaUpload, FaCloudUploadAlt } from 'react-icons/fa';

const ProfileDocumentsSection = ({
  documents = [],
  editMode,
  onUpload,
  onRemove,
  loading,
  success,
  error
}) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FaFilePdf className="text-red-600" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
        return <FaFileImage className="text-green-600" />;
      case 'doc':
      case 'docx':
        return <FaFileWord className="text-blue-600" />;
      case 'xls':
      case 'xlsx':
        return <FaFileExcel className="text-green-700" />;
      default:
        return <FaFile className="text-gray-600" />;
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
      const event = { target: { files: e.dataTransfer.files } };
      onUpload(event);
    }
  };

  const handleDownloadAll = () => {
    documents.forEach(doc => {
      const link = document.createElement('a');
      link.href = doc.fileUrl;
      link.download = doc.title || doc.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card title="User Documents" className="p-6 mb-6">
      <div className="flex flex-col gap-4">
        {editMode && (
          <div className="space-y-4">
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-blue-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <FaCloudUploadAlt className="mx-auto text-3xl text-gray-400 mb-2" />
              <p className="text-gray-600 mb-2">
                Drag and drop files here, or{' '}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  browse
                </button>
              </p>
              <p className="text-sm text-gray-500">
                Supported formats: PDF, Images, Word, Excel (Max 10MB each)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={onUpload}
                disabled={loading}
                accept=".pdf,.jpg,.jpeg,.png,.gif,.svg,.doc,.docx,.xls,.xlsx"
              />
            </div>
          </div>
        )}

        <div className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Uploaded Documents ({documents.length})</h3>
            {documents.length > 0 && (
              <Button
                type="button"
                color="secondary"
                size="sm"
                onClick={handleDownloadAll}
                className="flex items-center gap-2"
              >
                <FaDownload /> Download All
              </Button>
            )}
          </div>

          {documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FaFile className="mx-auto text-4xl mb-2" />
              <p>No documents uploaded yet.</p>
              {editMode && <p className="text-sm">Upload your first document above.</p>}
            </div>
          ) : (
            <div className="grid gap-3">
              {documents.map((doc, idx) => (
                <div
                  key={doc._id || idx}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getFileIcon(doc.title || doc.name)}
                    <div>
                      <p className="font-medium text-gray-900">
                        {doc.title || doc.name}
                      </p>
                      {doc.size && (
                        <p className="text-sm text-gray-500">
                          {formatFileSize(doc.size)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                      title="View Document"
                    >
                      <FaDownload />
                    </a>
                    {editMode && (
                      <button
                        type="button"
                        onClick={() => onRemove(doc._id || idx)}
                        className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                        title="Remove Document"
                        disabled={loading}
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {success && (
          <div className="text-green-600 text-center mt-2 p-2 bg-green-50 rounded">
            {success}
          </div>
        )}
        {error && (
          <div className="text-red-600 text-center mt-2 p-2 bg-red-50 rounded">
            {error}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProfileDocumentsSection; 