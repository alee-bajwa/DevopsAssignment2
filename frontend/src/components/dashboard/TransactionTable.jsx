/**
 * Transaction Table Component
 */
import React from 'react';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

const TransactionTable = ({ transactions, loading }) => {
  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#ccc' }}></i>
        <p className="text-muted mt-3">No transactions yet</p>
      </div>
    );
  }

  const getTransactionIcon = (kind) => {
    const icons = {
      deposit: 'bi-arrow-down-circle',
      withdrawal: 'bi-arrow-up-circle',
      transfer: 'bi-arrow-left-right',
      bill_payment: 'bi-receipt',
      fee: 'bi-exclamation-circle',
      adjustment: 'bi-gear'
    };
    return icons[kind] || 'bi-circle';
  };

  const getTransactionColor = (direction) => {
    return direction === 'credit' ? 'transaction-credit' : 'transaction-debit';
  };

  return (
    <div className="table-responsive">
      <table className="table table-hover">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Description</th>
            <th className="text-end">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn) => (
            <tr key={txn.id}>
              <td>
                <small className="text-muted">{formatDateTime(txn.created_at)}</small>
              </td>
              <td>
                <i className={`bi ${getTransactionIcon(txn.kind)} me-2`}></i>
                <span className="text-capitalize">{txn.kind.replace('_', ' ')}</span>
              </td>
              <td>
                {txn.purpose || txn.counterparty_name || '-'}
                {txn.reference && (
                  <div>
                    <small className="text-muted">Ref: {txn.reference}</small>
                  </div>
                )}
              </td>
              <td className={`text-end fw-bold ${getTransactionColor(txn.direction)}`}>
                {txn.direction === 'credit' ? '+' : '-'}
                {formatCurrency(txn.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;

