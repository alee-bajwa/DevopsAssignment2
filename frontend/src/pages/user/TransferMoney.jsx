/**
 * Transfer Money Page
 */
import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import AlertMessage from '../../components/common/AlertMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import accountService from '../../services/accountService';
import transactionService from '../../services/transactionService';
import { validateRequired, validateAmount, validateAccountNumber } from '../../utils/validators';
import { formatCurrency } from '../../utils/formatters';

const TransferMoney = () => {
  const [account, setAccount] = useState(null);
  const [formData, setFormData] = useState({
    recipient_account_number: '',
    amount: '',
    purpose: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    fetchAccount();
  }, []);

  const fetchAccount = async () => {
    try {
      const accountsData = await accountService.getAccounts();
      if (accountsData.length > 0) {
        setAccount(accountsData[0]);
      }
    } catch (error) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Failed to load account information'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!validateRequired(formData.recipient_account_number)) {
      newErrors.recipient_account_number = 'Recipient account number is required';
    } else if (!validateAccountNumber(formData.recipient_account_number)) {
      newErrors.recipient_account_number = 'Invalid account number format';
    }

    if (!validateRequired(formData.amount)) {
      newErrors.amount = 'Amount is required';
    } else if (!validateAmount(formData.amount)) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (account && parseFloat(formData.amount) > parseFloat(account.balance)) {
      newErrors.amount = 'Insufficient funds';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmTransfer = async () => {
    setSubmitting(true);
    setShowConfirmModal(false);
    setAlert({ show: false, type: '', message: '' });

    try {
      await transactionService.transfer({
        recipient_account_number: formData.recipient_account_number,
        amount: parseFloat(formData.amount),
        purpose: formData.purpose || null
      });

      setAlert({
        show: true,
        type: 'success',
        message: 'Transfer completed successfully!'
      });

      // Reset form
      setFormData({
        recipient_account_number: '',
        amount: '',
        purpose: ''
      });

      // Refresh account balance
      fetchAccount();
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Transfer failed. Please try again.';
      setAlert({ show: true, type: 'error', message: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex">
        <Sidebar />
        <div className="main-content">
          <LoadingSpinner message="Loading..." />
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="main-content">
        <Navbar />

        <div className="container-fluid">
          <h2 className="mb-4">Transfer Money</h2>

          {alert.show && (
            <AlertMessage
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert({ show: false, type: '', message: '' })}
            />
          )}

          <div className="row">
            <div className="col-lg-6">
              <div className="card">
                <div className="card-body">
                  {/* Current Balance and Account Info */}
                  <div className="alert alert-info mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <i className="bi bi-wallet2 me-2"></i>
                        <strong>Current Balance:</strong> {formatCurrency(account?.balance || 0)}
                      </div>
                    </div>
                  </div>

                  <div className="alert alert-light mb-4">
                    <small className="text-muted">
                      <i className="bi bi-info-circle me-1"></i>
                      <strong>Your Account:</strong> {account?.account_number || 'Loading...'}
                    </small>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="recipient_account_number" className="form-label">
                        Recipient Account Number
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.recipient_account_number ? 'is-invalid' : ''}`}
                        id="recipient_account_number"
                        name="recipient_account_number"
                        value={formData.recipient_account_number}
                        onChange={handleChange}
                        placeholder="Enter recipient's account number (with or without spaces)"
                      />
                      {errors.recipient_account_number && (
                        <div className="invalid-feedback">{errors.recipient_account_number}</div>
                      )}
                      <small className="text-muted">
                        <i className="bi bi-shield-check me-1"></i>
                        You can paste the account number with or without spaces - both formats work
                      </small>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="amount" className="form-label">
                        Amount
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">$</span>
                        <input
                          type="number"
                          step="0.01"
                          className={`form-control ${errors.amount ? 'is-invalid' : ''}`}
                          id="amount"
                          name="amount"
                          value={formData.amount}
                          onChange={handleChange}
                          placeholder="0.00"
                        />
                        {errors.amount && (
                          <div className="invalid-feedback">{errors.amount}</div>
                        )}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="purpose" className="form-label">
                        Purpose (Optional)
                      </label>
                      <textarea
                        className="form-control"
                        id="purpose"
                        name="purpose"
                        rows="3"
                        value={formData.purpose}
                        onChange={handleChange}
                        placeholder="Enter transfer purpose"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-100"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Processing...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-arrow-right-circle me-2"></i>
                          Transfer Money
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card bg-light">
                <div className="card-body">
                  <h5 className="card-title">
                    <i className="bi bi-info-circle me-2"></i>
                    Transfer Information
                  </h5>
                  <ul className="list-unstyled mt-3">
                    <li className="mb-2">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      Transfers are processed instantly
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      No transfer fees
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      Secure and encrypted transactions
                    </li>
                    <li className="mb-2">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      Transaction history available anytime
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Transfer</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowConfirmModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to transfer:</p>
                <ul className="list-unstyled">
                  <li><strong>Amount:</strong> {formatCurrency(formData.amount)}</li>
                  <li><strong>To:</strong> {formData.recipient_account_number}</li>
                  {formData.purpose && <li><strong>Purpose:</strong> {formData.purpose}</li>}
                </ul>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowConfirmModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={confirmTransfer}
                >
                  Confirm Transfer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransferMoney;

