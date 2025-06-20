import React from 'react';
import Card from './common/Card';
import Input from './common/Input';
import Button from './common/Button';

const ProfileProfessionalSection = ({ formData, editMode, onChange, onSubmit, saving, success, error }) => (
  <form onSubmit={onSubmit}>
    <Card title="Professional Information" className="p-6 mb-6">
      <div className="flex flex-col gap-4">
        {editMode ? (
          <>
            <Input label="Job Title" name="jobTitle" value={formData.jobTitle} onChange={onChange} />
            <Input label="Department" name="department" value={formData.department} onChange={onChange} />
            <Input label="Employee ID" name="employeeId" value={formData.employeeId} onChange={onChange} />
            <Input label="Joining Date" name="joiningDate" type="date" value={formData.joiningDate} onChange={onChange} />
            <Input label="Skills" name="skills" value={formData.skills} onChange={onChange} />
            <Input label="LinkedIn" name="linkedin" value={formData.linkedin} onChange={onChange} />
            <Input label="Resume Link" name="resume" value={formData.resume} onChange={onChange} />
            <div className="flex gap-3 mt-2">
              <Button type="submit" color="primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-2"><span className="font-semibold">Job Title:</span> {formData.jobTitle}</div>
            <div className="mb-2"><span className="font-semibold">Department:</span> {formData.department}</div>
            <div className="mb-2"><span className="font-semibold">Employee ID:</span> {formData.employeeId}</div>
            <div className="mb-2"><span className="font-semibold">Joining Date:</span> {formData.joiningDate}</div>
            <div className="mb-2"><span className="font-semibold">Skills:</span> {formData.skills}</div>
            <div className="mb-2"><span className="font-semibold">LinkedIn:</span> {formData.linkedin}</div>
            <div className="mb-2"><span className="font-semibold">Resume Link:</span> {formData.resume}</div>
          </>
        )}
        {success && <div className="text-green-600 text-center mt-2">{success}</div>}
        {error && <div className="text-red-600 text-center mt-2">{error}</div>}
      </div>
    </Card>
  </form>
);

export default ProfileProfessionalSection; 