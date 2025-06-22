import React, { useState } from 'react';
import Card from './common/Card';
import Input from './common/Input';
import Button from './common/Button';
import { FaCreditCard, FaPaypal, FaUniversity, FaStar, FaStar as FaStarOutline, FaTrash } from 'react-icons/fa';

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
}) => {
  const [primaryBankIndex, setPrimaryBankIndex] = useState(0);
  const [primaryPaymentIndex, setPrimaryPaymentIndex] = useState(0);

  const handleSetPrimaryBank = (index) => {
    setPrimaryBankIndex(index);
    // Update the bank accounts to mark primary
    onBankChange(index, 'isPrimary', true);
  };

  const handleSetPrimaryPayment = (index) => {
    setPrimaryPaymentIndex(index);
    // Update the payment methods to mark primary
    onPaymentChange(index, 'isPrimary', true);
  };

  const getPaymentIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'visa':
      case 'mastercard':
      case 'credit card':
        return <FaCreditCard className="text-blue-600" />;
      case 'paypal':
        return <FaPaypal className="text-blue-500" />;
      case 'upi':
        return <FaUniversity className="text-green-600" />;
      default:
        return <FaCreditCard className="text-gray-600" />;
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FaUniversity className="text-blue-600" />
            Bank Accounts
          </h2>
          {bankAccounts.map((bank, idx) => (
            <Card key={idx} title={`Bank Account #${idx + 1}`} className="mb-4 p-4">
              {editMode ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-700">Account Details</h4>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryBank(idx)}
                        className={`p-1 rounded transition ${primaryBankIndex === idx ? 'text-yellow-600' : 'text-gray-400 hover:text-yellow-600'}`}
                        title={primaryBankIndex === idx ? 'Primary Account' : 'Set as Primary'}
                      >
                        {primaryBankIndex === idx ? <FaStar /> : <FaStarOutline />}
                      </button>
                      {bankAccounts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onRemoveBank(idx)}
                          className="text-red-600 hover:text-red-800 p-1 rounded transition"
                          title="Remove Account"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                      label="Account Holder" 
                      name="bankHolder" 
                      value={bank.bankHolder} 
                      onChange={e => onBankChange(idx, 'bankHolder', e.target.value)}
                      required
                    />
                    <Input 
                      label="Bank Name" 
                      name="bankName" 
                      value={bank.bankName} 
                      onChange={e => onBankChange(idx, 'bankName', e.target.value)}
                      required
                    />
                    <Input 
                      label="Account Number" 
                      name="account" 
                      value={bank.account} 
                      onChange={e => onBankChange(idx, 'account', e.target.value)}
                      required
                    />
                    <Input 
                      label="IFSC Code" 
                      name="ifsc" 
                      value={bank.ifsc} 
                      onChange={e => onBankChange(idx, 'ifsc', e.target.value.toUpperCase())}
                      required
                    />
                    <Input 
                      label="UPI ID" 
                      name="upi" 
                      value={bank.upi} 
                      onChange={e => onBankChange(idx, 'upi', e.target.value)}
                    />
                    <Input 
                      label="PAN Number" 
                      name="pan" 
                      value={bank.pan} 
                      onChange={e => onBankChange(idx, 'pan', e.target.value.toUpperCase())}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-700">Account Details</h4>
                    {primaryBankIndex === idx && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                        Primary
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><span className="font-semibold">Account Holder:</span> {bank.bankHolder}</div>
                    <div><span className="font-semibold">Bank Name:</span> {bank.bankName}</div>
                    <div><span className="font-semibold">Account Number:</span> {bank.account}</div>
                    <div><span className="font-semibold">IFSC Code:</span> {bank.ifsc}</div>
                    {bank.upi && <div><span className="font-semibold">UPI ID:</span> {bank.upi}</div>}
                    {bank.pan && <div><span className="font-semibold">PAN Number:</span> {bank.pan}</div>}
                  </div>
                </div>
              )}
            </Card>
          ))}
          {editMode && (
            <Button 
              type="button" 
              color="primary" 
              onClick={onAddBank}
              className="w-full p-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:border-blue-500 hover:text-blue-700 transition"
            >
              + Add Bank Account
            </Button>
          )}
        </div>
        
        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FaCreditCard className="text-green-600" />
            Payment Methods
          </h2>
          {paymentMethods.map((pm, idx) => (
            <Card key={idx} title={`Payment Method #${idx + 1}`} className="mb-4 p-4">
              {editMode ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getPaymentIcon(pm.type)}
                      <h4 className="font-semibold text-gray-700">{pm.type || 'Payment Method'}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryPayment(idx)}
                        className={`p-1 rounded transition ${primaryPaymentIndex === idx ? 'text-yellow-600' : 'text-gray-400 hover:text-yellow-600'}`}
                        title={primaryPaymentIndex === idx ? 'Primary Payment' : 'Set as Primary'}
                      >
                        {primaryPaymentIndex === idx ? <FaStar /> : <FaStarOutline />}
                      </button>
                      {paymentMethods.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onRemovePayment(idx)}
                          className="text-red-600 hover:text-red-800 p-1 rounded transition"
                          title="Remove Payment Method"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                      label="Payment Type" 
                      name="type" 
                      value={pm.type} 
                      onChange={e => onPaymentChange(idx, 'type', e.target.value)}
                      required
                    />
                    <Input 
                      label="Details" 
                      name="details" 
                      value={pm.details} 
                      onChange={e => onPaymentChange(idx, 'details', e.target.value)}
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getPaymentIcon(pm.type)}
                      <h4 className="font-semibold text-gray-700">{pm.type}</h4>
                    </div>
                    {primaryPaymentIndex === idx && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                        Primary
                      </span>
                    )}
                  </div>
                  <div><span className="font-semibold">Details:</span> {pm.details}</div>
                </div>
              )}
            </Card>
          ))}
          {editMode && (
            <Button 
              type="button" 
              color="primary" 
              onClick={onAddPayment}
              className="w-full p-3 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:border-blue-500 hover:text-blue-700 transition"
            >
              + Add Payment Method
            </Button>
          )}
        </div>
        
        <div className="flex gap-3 mt-2">
          <Button type="submit" color="primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
        {success && <div className="text-green-600 text-center mt-2">{success}</div>}
        {error && <div className="text-red-600 text-center mt-2">{error}</div>}
      </div>
    </form>
  );
};

export default ProfileBankSection; 