import React from 'react';
import Card from './common/Card';
import Button from './common/Button';

const ProfileDocumentsSection = ({
  documents = [],
  editMode,
  onUpload,
  onRemove,
  loading,
  success,
  error
}) => (
  <Card title="User Documents" className="p-6 mb-6">
    <div className="flex flex-col gap-4">
      {editMode && (
        <div>
          <label className="block font-medium mb-2">Upload Document</label>
          <input type="file" multiple className="block" onChange={onUpload} disabled={loading} />
        </div>
      )}
      <div className="mt-4">
        <div className="font-semibold mb-2">Uploaded Documents:</div>
        <ul className="list-disc ml-6 text-gray-700">
          {documents.length === 0 && <li className="text-gray-400">No documents uploaded.</li>}
          {documents.map((doc, idx) => (
            <li key={doc._id || idx} className="flex items-center justify-between">
              <span>{doc.title || doc.name}</span>
              <div className="flex gap-2 items-center">
                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View</a>
                {editMode && (
                  <Button type="button" color="danger" size="sm" onClick={() => onRemove(doc._id || idx)}>Remove</Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
      {success && <div className="text-green-600 text-center mt-2">{success}</div>}
      {error && <div className="text-red-600 text-center mt-2">{error}</div>}
    </div>
  </Card>
);

export default ProfileDocumentsSection; 