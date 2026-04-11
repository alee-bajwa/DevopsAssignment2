/**
 * User Profile Page
 */
import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import AlertMessage from '../../components/common/AlertMessage';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import accountService from '../../services/accountService';
import { validateEmail, validateFullName, validatePassword, validateRequired } from '../../utils/validators';
import { formatDateTime, formatAccountNumber } from '../../utils/formatters';

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: ''
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      if (user) {
        setProfileData({
          full_name: user.full_name || '',
          email: user.email || ''
        });
      }

      // Fetch accounts
      const accountsData = await accountService.getAccounts();
      setAccounts(accountsData);
    } catch (error) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Failed to load profile data'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateProfile = () => {
    const newErrors = {};

    if (!validateRequired(profileData.full_name)) {
      newErrors.full_name = 'Full name is required';
    } else if (!validateFullName(profileData.full_name)) {
      newErrors.full_name = 'Full name must be at least 2 characters';
    }

    if (!validateRequired(profileData.email)) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(profileData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!validateRequired(passwordData.current_password)) {
      newErrors.current_password = 'Current password is required';
    }

    if (!validateRequired(passwordData.new_password)) {
      newErrors.new_password = 'New password is required';
    } else if (!validatePassword(passwordData.new_password)) {
      newErrors.new_password = 'Password must be at least 6 characters';
    }

    if (!validateRequired(passwordData.confirm_password)) {
      newErrors.confirm_password = 'Please confirm your password';
    } else if (passwordData.new_password !== passwordData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!validateProfile()) {
      return;
    }

    setSubmitting(true);
    setAlert({ show: false, type: '', message: '' });

    try {
      await userService.updateProfile(profileData);
      updateUser(profileData);

      setAlert({
        show: true,
        type: 'success',
        message: 'Profile updated successfully!'
      });
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to update profile';
      setAlert({ show: true, type: 'error', message: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    setSubmitting(true);
    setAlert({ show: false, type: '', message: '' });

    try {
      await userService.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });

      setAlert({
        show: true,
        type: 'success',
        message: 'Password changed successfully!'
      });

      // Reset password form
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Failed to change password';
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
          <LoadingSpinner message="Loading profile..." />
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
          <h2 className="mb-4">My Profile</h2>

          {alert.show && (
            <AlertMessage
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert({ show: false, type: '', message: '' })}
            />
          )}

          <div className="row">
            {/* Profile Information */}
            <div className="col-lg-6 mb-4">
              <div className="card">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Profile Information</h5>
                </div>
                <div className="card-body">
                  <form onSubmit={handleProfileSubmit}>
                    <div className="mb-3">
                      <label htmlFor="full_name" className="form-label">Full Name</label>
                      <input
                        type="text"
                        className={`form-control ${errors.full_name ? 'is-invalid' : ''}`}
                        id="full_name"
                        name="full_name"
                        value={profileData.full_name}
                        onChange={handleProfileChange}
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
                        value={profileData.email}
                        onChange={handleProfileChange}
                      />
                      {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Role</label>
                      <input
                        type="text"
                        className="form-control"
                        value={user?.role || ''}
                        disabled
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Member Since</label>
                      <input
                        type="text"
                        className="form-control"
                        value={user?.created_at ? formatDateTime(user.created_at) : ''}
                        disabled
                      />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Updating...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Update Profile
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Change Password */}
            <div className="col-lg-6 mb-4">
              <div className="card">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Change Password</h5>
                </div>
                <div className="card-body">
                  <form onSubmit={handlePasswordSubmit}>
                    <div className="mb-3">
                      <label htmlFor="current_password" className="form-label">Current Password</label>
                      <input
                        type="password"
                        className={`form-control ${errors.current_password ? 'is-invalid' : ''}`}
                        id="current_password"
                        name="current_password"
                        value={passwordData.current_password}
                        onChange={handlePasswordChange}
                      />
                      {errors.current_password && <div className="invalid-feedback">{errors.current_password}</div>}
                    </div>

                    <div className="mb-3">
                      <label htmlFor="new_password" className="form-label">New Password</label>
                      <input
                        type="password"
                        className={`form-control ${errors.new_password ? 'is-invalid' : ''}`}
                        id="new_password"
                        name="new_password"
                        value={passwordData.new_password}
                        onChange={handlePasswordChange}
                      />
                      {errors.new_password && <div className="invalid-feedback">{errors.new_password}</div>}
                    </div>

                    <div className="mb-3">
                      <label htmlFor="confirm_password" className="form-label">Confirm New Password</label>
                      <input
                        type="password"
                        className={`form-control ${errors.confirm_password ? 'is-invalid' : ''}`}
                        id="confirm_password"
                        name="confirm_password"
                        value={passwordData.confirm_password}
                        onChange={handlePasswordChange}
                      />
                      {errors.confirm_password && <div className="invalid-feedback">{errors.confirm_password}</div>}
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Changing...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-shield-lock me-2"></i>
                          Change Password
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div className="col-12">
              <div className="card">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Account Details</h5>
                </div>
                <div className="card-body">
                  {accounts.length === 0 ? (
                    <p className="text-muted">No accounts found</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table">
                        <thead>
                          <tr>
                            <th>Account Number</th>
                            <th>Type</th>
                            <th>Currency</th>
                            <th>Status</th>
                            <th>Created</th>
                          </tr>
                        </thead>
                        <tbody>
                          {accounts.map(account => (
                            <tr key={account.id}>
                              <td>{formatAccountNumber(account.account_number)}</td>
                              <td className="text-capitalize">{account.account_type}</td>
                              <td>{account.currency}</td>
                              <td>
                                <span className={`badge ${account.is_active ? 'bg-success' : 'bg-danger'}`}>
                                  {account.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td>{formatDateTime(account.created_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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

export default UserProfile;

