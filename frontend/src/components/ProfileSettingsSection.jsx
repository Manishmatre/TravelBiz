import React from 'react';
import Card from './common/Card';
import Input from './common/Input';
import Button from './common/Button';

const ProfileSettingsSection = ({ formData, editMode, onChange, onSubmit, saving, success, error }) => (
  <form onSubmit={onSubmit}>
    <Card title="Settings" className="p-6 mb-6">
      <div className="flex flex-col gap-4">
        {editMode ? (
          <>
            <div className="flex items-center gap-2">
              <label className="font-semibold">Notifications</label>
              <input type="checkbox" name="notifications" checked={formData.notifications} onChange={onChange} />
            </div>
            <Input label="Language" name="language" value={formData.language} onChange={onChange} />
            <Input label="Theme" name="theme" value={formData.theme} onChange={onChange} />
            <div className="flex items-center gap-2">
              <label className="font-semibold">Privacy</label>
              <input type="checkbox" name="privacy" checked={formData.privacy} onChange={onChange} />
            </div>
            <div className="flex items-center gap-2">
              <label className="font-semibold">2FA Enabled</label>
              <input type="checkbox" name="twofa" checked={formData.twofa} onChange={onChange} />
            </div>
            <div className="flex items-center gap-2">
              <label className="font-semibold">Email Verified</label>
              <input type="checkbox" name="emailVerified" checked={formData.emailVerified} onChange={onChange} />
            </div>
            <div className="flex gap-3 mt-2">
              <Button type="submit" color="primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-2"><span className="font-semibold">Notifications:</span> {formData.notifications ? 'On' : 'Off'}</div>
            <div className="mb-2"><span className="font-semibold">Language:</span> {formData.language}</div>
            <div className="mb-2"><span className="font-semibold">Theme:</span> {formData.theme}</div>
            <div className="mb-2"><span className="font-semibold">Privacy:</span> {formData.privacy ? 'Enabled' : 'Disabled'}</div>
            <div className="mb-2"><span className="font-semibold">2FA Enabled:</span> {formData.twofa ? 'Yes' : 'No'}</div>
            <div className="mb-2"><span className="font-semibold">Email Verified:</span> {formData.emailVerified ? 'Yes' : 'No'}</div>
          </>
        )}
        {success && <div className="text-green-600 text-center mt-2">{success}</div>}
        {error && <div className="text-red-600 text-center mt-2">{error}</div>}
      </div>
    </Card>
  </form>
);

export default ProfileSettingsSection; 