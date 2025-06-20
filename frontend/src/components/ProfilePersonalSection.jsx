import React from 'react';
import Card from './common/Card';
import Input from './common/Input';
import Button from './common/Button';

const ProfilePersonalSection = ({ formData, editMode, onChange, onSubmit, saving, success, error }) => (
  <form onSubmit={onSubmit}>
    <Card title="Personal & Address" className="p-6 mb-6">
      <div className="flex flex-col gap-4">
        {editMode ? (
          <>
            <Input label="Name" name="name" value={formData.name} onChange={onChange} required />
            <Input label="Email" name="email" value={formData.email} onChange={onChange} required disabled />
            <Input label="Phone" name="phone" value={formData.phone} onChange={onChange} />
            <Input label="Date of Birth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={onChange} />
            <Input label="Gender" name="gender" value={formData.gender} onChange={onChange} />
            <Input label="Street" name="address.street" value={formData.address?.street || ''} onChange={onChange} />
            <Input label="City" name="address.city" value={formData.address?.city || ''} onChange={onChange} />
            <Input label="State" name="address.state" value={formData.address?.state || ''} onChange={onChange} />
            <Input label="Country" name="address.country" value={formData.address?.country || ''} onChange={onChange} />
            <Input label="Postal Code" name="address.postalCode" value={formData.address?.postalCode || ''} onChange={onChange} />
            <div className="flex gap-3 mt-2">
              <Button type="submit" color="primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-2"><span className="font-semibold">Name:</span> {formData.name}</div>
            <div className="mb-2"><span className="font-semibold">Email:</span> {formData.email}</div>
            <div className="mb-2"><span className="font-semibold">Phone:</span> {formData.phone}</div>
            <div className="mb-2"><span className="font-semibold">Date of Birth:</span> {formData.dateOfBirth}</div>
            <div className="mb-2"><span className="font-semibold">Gender:</span> {formData.gender}</div>
            <div className="mb-2"><span className="font-semibold">Street:</span> {formData.address?.street}</div>
            <div className="mb-2"><span className="font-semibold">City:</span> {formData.address?.city}</div>
            <div className="mb-2"><span className="font-semibold">State:</span> {formData.address?.state}</div>
            <div className="mb-2"><span className="font-semibold">Country:</span> {formData.address?.country}</div>
            <div className="mb-2"><span className="font-semibold">Postal Code:</span> {formData.address?.postalCode}</div>
          </>
        )}
        {success && <div className="text-green-600 text-center mt-2">{success}</div>}
        {error && <div className="text-red-600 text-center mt-2">{error}</div>}
      </div>
    </Card>
  </form>
);

export default ProfilePersonalSection; 