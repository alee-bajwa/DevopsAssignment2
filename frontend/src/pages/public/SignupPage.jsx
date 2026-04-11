/**
 * Signup Page
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AlertMessage from '../../components/common/AlertMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { validateEmail, validatePassword, validateFullName, validateRequired } from '../../utils/validators';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    account_type: 'main',
    initial_balance: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!validateRequired(formData.full_name)) {
      newErrors.full_name = 'Full name is required';
    } else if (!validateFullName(formData.full_name)) {
      newErrors.full_name = 'Full name must be at least 2 characters';
    }

    if (!validateRequired(formData.email)) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!validateRequired(formData.password)) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!validateRequired(formData.confirmPassword)) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.initial_balance && formData.initial_balance !== '') {
      const balance = parseFloat(formData.initial_balance);
      if (isNaN(balance) || balance < 0) {
        newErrors.initial_balance = 'Initial balance must be 0 or greater';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    setAlert({ show: false, type: '', message: '' });

    try {
      const { confirmPassword, ...signupData } = formData;
      // Convert initial_balance to float, default to 0 if empty
      const dataToSend = {
        ...signupData,
        initial_balance: formData.initial_balance ? parseFloat(formData.initial_balance) : 0.0
      };
      const response = await signup(dataToSend);
      
      const balanceMsg = response.initial_balance > 0 
        ? ` Your initial balance of $${response.initial_balance.toFixed(2)} has been credited.`
        : '';
      
      setAlert({
        show: true,
        type: 'success',
        message: `Account created successfully! Account #${response.account_number}.${balanceMsg} Redirecting to login...`
      });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Signup failed. Please try again.';
      setAlert({ show: true, type: 'error', message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <LoadingSpinner message="Creating account..." />
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <i className="bi bi-person-plus-fill text-primary" style={{ fontSize: '3rem' }}></i>
                  <h2 className="mt-3">Create HakiBank Account</h2>
                  <p className="text-muted">Join HakiBank today and manage your finances with confidence</p>
                </div>

                {alert.show && (
                  <AlertMessage
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert({ show: false, type: '', message: '' })}
                  />
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="full_name" className="form-label">Full Name</label>
                    <input
                      type="text"
                      className={`form-control ${errors.full_name ? 'is-invalid' : ''}`}
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                    />
                    {errors.full_name && <div className="invalid-feedback">{errors.full_name}</div>}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                      type="password"
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                    />
                    {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                    />
                    {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="account_type" className="form-label">Account Type</label>
                    <select
                      className="form-select"
                      id="account_type"
                      name="account_type"
                      value={formData.account_type}
                      onChange={handleChange}
                    >
                      <option value="main">Main Account</option>
                      <option value="savings">Savings Account</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="initial_balance" className="form-label">
                      Initial Balance (Optional)
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className={`form-control ${errors.initial_balance ? 'is-invalid' : ''}`}
                        id="initial_balance"
                        name="initial_balance"
                        value={formData.initial_balance}
                        onChange={handleChange}
                        placeholder="0.00"
                      />
                      {errors.initial_balance && <div className="invalid-feedback">{errors.initial_balance}</div>}
                    </div>
                    <small className="text-muted">Enter the amount you want to deposit when creating your account</small>
                  </div>

                  <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading}>
                    <i className="bi bi-person-plus me-2"></i>
                    Sign Up
                  </button>

                  <div className="text-center">
                    <p className="mb-0">
                      Already have an account? <Link to="/login">Login</Link>
                    </p>
                    <Link to="/" className="text-muted">Back to Home</Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;

