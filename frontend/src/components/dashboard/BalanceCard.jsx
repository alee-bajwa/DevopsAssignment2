/**
 * Balance Card Component
 */
import React, { useState } from 'react';
import { formatCurrency, formatAccountNumber } from '../../utils/formatters';

const BalanceCard = ({ account }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // Copy the raw account number without spaces
    navigator.clipboard.writeText(account.account_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!account) {
    return (
      <div className="card balance-card">
        <div className="card-body">
          <p className="mb-0">Loading account information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card balance-card fade-in">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div className="flex-grow-1">
          <p className="mb-1 opacity-75">Account Number</p>
          <div className="d-flex align-items-center gap-2">
            <h6 className="mb-0">{formatAccountNumber(account.account_number)}</h6>
            <button 
              className="btn btn-sm btn-light"
              onClick={handleCopy}
              title="Copy account number"
            >
              <i className={`bi ${copied ? 'bi-check-circle-fill text-success' : 'bi-clipboard'}`}></i>
              {copied && <small className="ms-1">Copied!</small>}
            </button>
          </div>
        </div>
        <span className="badge bg-light text-dark">
          {account.account_type}
        </span>
      </div>
      
      <div>
        <p className="mb-2 opacity-75">Current Balance</p>
        <h1 className="balance-amount mb-0">
          {formatCurrency(account.balance, account.currency)}
        </h1>
      </div>
      
      <div className="mt-3">
        <small className="opacity-75">
          <i className="bi bi-shield-check me-1"></i>
          Your account is secure and protected
        </small>
      </div>
    </div>
  );
};

export default BalanceCard;

