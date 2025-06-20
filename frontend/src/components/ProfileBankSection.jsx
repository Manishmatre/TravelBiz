import React from 'react';
import Card from './common/Card';
import Input from './common/Input';
import Button from './common/Button';

const ProfileBankSection = ({
  bankAccounts = [],
  paymentMethods = [],
  editMode,
  onBankChange,
  onAddBank,
  onRemoveBank,
  onPaymentChange,
  onAddPayment,
  onRemovePayment,
  onSubmit,
  saving,
  success,
  error
}) => (
  <form onSubmit={onSubmit}>
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold mb-2">Bank Accounts</h2>
        {bankAccounts.map((bank, idx) => (
          <Card key={idx} title={`Bank Account #${idx + 1}`} className="mb-4 p-4">
            {editMode ? (
              <div className="flex flex-col gap-2">
                <Input label="Account Holder" name="bankHolder" value={bank.bankHolder} onChange={e => onBankChange(idx, 'bankHolder', e.target.value)} />
                <Input label="Bank Name" name="bankName" value={bank.bankName} onChange={e => onBankChange(idx, 'bankName', e.target.value)} />
                <Input label="Account Number" name="account" value={bank.account} onChange={e => onBankChange(idx, 'account', e.target.value)} />
                <Input label="IFSC" name="ifsc" value={bank.ifsc} onChange={e => onBankChange(idx, 'ifsc', e.target.value)} />
                <Input label="UPI" name="upi" value={bank.upi} onChange={e => onBankChange(idx, 'upi', e.target.value)} />
                <Input label="PAN" name="pan" value={bank.pan} onChange={e => onBankChange(idx, 'pan', e.target.value)} />
                <Input label="Salary/Pay Info" name="salary" value={bank.salary} onChange={e => onBankChange(idx, 'salary', e.target.value)} />
                <Button type="button" color="danger" onClick={() => onRemoveBank(idx)}>Remove</Button>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <div><span className="font-semibold">Account Holder:</span> {bank.bankHolder}</div>
                <div><span className="font-semibold">Bank Name:</span> {bank.bankName}</div>
                <div><span className="font-semibold">Account Number:</span> {bank.account}</div>
                <div><span className="font-semibold">IFSC:</span> {bank.ifsc}</div>
                <div><span className="font-semibold">UPI:</span> {bank.upi}</div>
                <div><span className="font-semibold">PAN:</span> {bank.pan}</div>
                <div><span className="font-semibold">Salary/Pay Info:</span> {bank.salary}</div>
              </div>
            )}
          </Card>
        ))}
        {editMode && (
          <Button type="button" color="primary" onClick={onAddBank}>Add Bank Account</Button>
        )}
      </div>
      <div>
        <h2 className="text-lg font-bold mb-2">Payment Methods</h2>
        {paymentMethods.map((pm, idx) => (
          <Card key={idx} title={`Payment Method #${idx + 1}`} className="mb-4 p-4">
            {editMode ? (
              <div className="flex flex-col gap-2">
                <Input label="Type" name="type" value={pm.type} onChange={e => onPaymentChange(idx, 'type', e.target.value)} />
                <Input label="Details" name="details" value={pm.details} onChange={e => onPaymentChange(idx, 'details', e.target.value)} />
                <Button type="button" color="danger" onClick={() => onRemovePayment(idx)}>Remove</Button>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <div><span className="font-semibold">Type:</span> {pm.type}</div>
                <div><span className="font-semibold">Details:</span> {pm.details}</div>
              </div>
            )}
          </Card>
        ))}
        {editMode && (
          <Button type="button" color="primary" onClick={onAddPayment}>Add Payment Method</Button>
        )}
      </div>
      <div className="flex gap-3 mt-2">
        <Button type="submit" color="primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
      </div>
      {success && <div className="text-green-600 text-center mt-2">{success}</div>}
      {error && <div className="text-red-600 text-center mt-2">{error}</div>}
    </div>
  </form>
);

export default ProfileBankSection; 