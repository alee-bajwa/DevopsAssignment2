/**
 * Transaction Monitoring Page (Admin)
 */
import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';
import adminService from '../../services/adminService';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

const TransactionMonitoring = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    direction: '',
    kind: '',
    limit: 50,
    offset: 0
  });
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.direction) params.direction = filters.direction;
      if (filters.kind) params.kind = filters.kind;
      params.limit = filters.limit;
      params.offset = filters.offset;

      const data = await adminService.getTransactions(params);
      setTransactions(data);
    } catch (error) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Failed to load transactions'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, offset: 0 }));
  };

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

  const getBadgeClass = (direction) => {
    return direction === 'credit' ? 'bg-success' : 'bg-danger';
  };

  const isHighValue = (amount) => {
    return parseFloat(amount) >= 10000;
  };

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="main-content">
        <Navbar />

        <div className="container-fluid">
          <h2 className="mb-4">Transaction Monitoring</h2>

          {alert.show && (
            <AlertMessage
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert({ show: false, type: '', message: '' })}
            />
          )}

          <div className="card">
            <div className="card-header bg-white">
              <div className="row align-items-center g-3">
                <div className="col-md-3">
                  <select
                    className="form-select"
                    name="direction"
                    value={filters.direction}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Directions</option>
                    <option value="credit">Credit</option>
                    <option value="debit">Debit</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select"
                    name="kind"
                    value={filters.kind}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Types</option>
                    <option value="deposit">Deposit</option>
                    <option value="withdrawal">Withdrawal</option>
                    <option value="transfer">Transfer</option>
                    <option value="bill_payment">Bill Payment</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="card-body">
              {loading ? (
                <LoadingSpinner message="Loading transactions..." />
              ) : transactions.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                  <p className="text-muted mt-3">No transactions found</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Date & Time</th>
                        <th>Account ID</th>
                        <th>Type</th>
                        <th>Direction</th>
                        <th>Description</th>
                        <th>Reference</th>
                        <th className="text-end">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((txn) => (
                        <tr 
                          key={txn.id}
                          className={isHighValue(txn.amount) ? 'table-warning' : ''}
                        >
                          <td>
                            <small>{formatDateTime(txn.created_at)}</small>
                          </td>
                          <td>
                            <small className="font-monospace">{txn.account_id.substring(0, 8)}...</small>
                          </td>
                          <td>
                            <i className={`bi ${getTransactionIcon(txn.kind)} me-2`}></i>
                            <span className="text-capitalize">{txn.kind.replace('_', ' ')}</span>
                          </td>
                          <td>
                            <span className={`badge ${getBadgeClass(txn.direction)}`}>
                              {txn.direction}
                            </span>
                          </td>
                          <td>
                            {txn.purpose || txn.counterparty_name || '-'}
                          </td>
                          <td>
                            <small className="text-muted">{txn.reference || '-'}</small>
                          </td>
                          <td className={`text-end fw-bold ${getTransactionColor(txn.direction)}`}>
                            {txn.direction === 'credit' ? '+' : '-'}
                            {formatCurrency(txn.amount)}
                            {isHighValue(txn.amount) && (
                              <i className="bi bi-exclamation-triangle-fill text-warning ms-2" title="High value transaction"></i>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="card mt-3">
            <div className="card-body">
              <h6 className="card-title">Legend</h6>
              <ul className="list-unstyled mb-0">
                <li>
                  <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>
                  <span className="badge bg-warning text-dark">High Value</span> - Transactions ≥ $10,000
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionMonitoring;

