/**
 * Bill Payment Page
 */
import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import AlertMessage from '../../components/common/AlertMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import accountService from '../../services/accountService';
import billService from '../../services/billService';
import { validateRequired, validateAmount } from '../../utils/validators';
import { formatCurrency } from '../../utils/formatters';

const BillPayment = () => {
  const [account, setAccount] = useState(null);
  const [billServices, setBillServices] = useState([]);
  const [formData, setFormData] = useState({
    bill_service_id: '',
    amount: '',
    purpose: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch account info
      const accountsData = await accountService.getAccounts();
      if (accountsData.length > 0) {
        setAccount(accountsData[0]);
      }

      // Fetch bill services
      const servicesData = await billService.getBillServices();
      setBillServices(servicesData);
    } catch (error) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Failed to load data'
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

    if (!validateRequired(formData.bill_service_id)) {
      newErrors.bill_service_id = 'Please select a bill service';
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    setAlert({ show: false, type: '', message: '' });

    try {
      await billService.payBill({
        bill_service_id: formData.bill_service_id,
        amount: parseFloat(formData.amount),
        purpose: formData.purpose || null
      });

      setAlert({
        show: true,
        type: 'success',
        message: 'Bill payment completed successfully!'
      });

      // Reset form
      setFormData({
        bill_service_id: '',
        amount: '',
        purpose: ''
      });

      // Refresh account balance
      const accountsData = await accountService.getAccounts();
      if (accountsData.length > 0) {
        setAccount(accountsData[0]);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Bill payment failed. Please try again.';
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
          <h2 className="mb-4">Pay Bills</h2>

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
                  {/* Current Balance */}
                  <div className="alert alert-info mb-4">
                    <i className="bi bi-wallet2 me-2"></i>
                    <strong>Current Balance:</strong> {formatCurrency(account?.balance || 0)}
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="bill_service_id" className="form-label">
                        Bill Service
                      </label>
                      <select
                        className={`form-select ${errors.bill_service_id ? 'is-invalid' : ''}`}
                        id="bill_service_id"
                        name="bill_service_id"
                        value={formData.bill_service_id}
                        onChange={handleChange}
                      >
                        <option value="">Select a service</option>
                        {billServices.map(service => (
                          <option key={service.id} value={service.id}>
                            {service.name}
                          </option>
                        ))}
                      </select>
                      {errors.bill_service_id && (
                        <div className="invalid-feedback">{errors.bill_service_id}</div>
                      )}
                    </div>

                    {formData.bill_service_id && (
                      <div className="alert alert-light mb-3">
                        <small>
                          {billServices.find(s => s.id === formData.bill_service_id)?.description}
                        </small>
                      </div>
                    )}

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
                        placeholder="Enter payment details"
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
                          <i className="bi bi-credit-card me-2"></i>
                          Pay Bill
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="card">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Available Bill Services</h5>
                </div>
                <div className="card-body">
                  {billServices.length === 0 ? (
                    <p className="text-muted">No bill services available</p>
                  ) : (
                    <div className="list-group list-group-flush">
                      {billServices.map(service => (
                        <div key={service.id} className="list-group-item">
                          <div className="d-flex align-items-center">
                            <i className="bi bi-receipt text-primary me-3" style={{ fontSize: '1.5rem' }}></i>
                            <div>
                              <h6 className="mb-0">{service.name}</h6>
                              <small className="text-muted">{service.description}</small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillPayment;

