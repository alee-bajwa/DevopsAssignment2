/**
 * Transaction History Page
 */
import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import AlertMessage from '../../components/common/AlertMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import transactionService from '../../services/transactionService';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    direction: '',
    kind: '',
    limit: 20,
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

      const data = await transactionService.getTransactions(params);
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

  const handleLoadMore = () => {
    setFilters(prev => ({ ...prev, offset: prev.offset + prev.limit }));
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

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="main-content">
        <Navbar />

        <div className="container-fluid">
          <h2 className="mb-4">Transaction History</h2>

          {alert.show && (
            <AlertMessage
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert({ show: false, type: '', message: '' })}
            />
          )}

          <div className="card">
            <div className="card-header bg-white">
              <div className="row align-items-center">
                <div className="col-md-4">
                  <label className="form-label mb-0 me-2">Direction:</label>
                  <select
                    className="form-select form-select-sm d-inline-block w-auto"
                    name="direction"
                    value={filters.direction}
                    onChange={handleFilterChange}
                  >
                    <option value="">All</option>
                    <option value="credit">Credit</option>
                    <option value="debit">Debit</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label mb-0 me-2">Type:</label>
                  <select
                    className="form-select form-select-sm d-inline-block w-auto"
                    name="kind"
                    value={filters.kind}
                    onChange={handleFilterChange}
                  >
                    <option value="">All</option>
                    <option value="deposit">Deposit</option>
                    <option value="withdrawal">Withdrawal</option>
                    <option value="transfer">Transfer</option>
                    <option value="bill_payment">Bill Payment</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="card-body">
              {loading && filters.offset === 0 ? (
                <LoadingSpinner message="Loading transactions..." />
              ) : transactions.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                  <p className="text-muted mt-3">No transactions found</p>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Date & Time</th>
                          <th>Type</th>
                          <th>Direction</th>
                          <th>Description</th>
                          <th>Reference</th>
                          <th className="text-end">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((txn) => (
                          <tr key={txn.id}>
                            <td>
                              <small>{formatDateTime(txn.created_at)}</small>
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
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {transactions.length >= filters.limit && (
                    <div className="text-center mt-3">
                      <button
                        className="btn btn-outline-primary"
                        onClick={handleLoadMore}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Loading...
                          </>
                        ) : (
                          'Load More'
                        )}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;

