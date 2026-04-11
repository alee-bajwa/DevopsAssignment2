/**
 * Admin Dashboard Page
 */
import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';
import adminService from '../../services/adminService';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await adminService.getStats();
      setStats(data);
    } catch (error) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Failed to load statistics'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex">
        <Sidebar />
        <div className="main-content">
          <LoadingSpinner message="Loading dashboard..." />
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
          <h2 className="mb-4">Admin Dashboard</h2>

          {alert.show && (
            <AlertMessage
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert({ show: false, type: '', message: '' })}
            />
          )}

          {/* Statistics Cards */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card stats-card gradient-primary">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-2 opacity-75">Total Users</h6>
                      <h2 className="mb-0">{stats?.total_users || 0}</h2>
                    </div>
                    <i className="bi bi-people" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                  </div>
                  <div className="mt-3">
                    <small className="opacity-75">
                      <i className="bi bi-graph-up me-1"></i>
                      {stats?.user_growth_percentage > 0 ? '+' : ''}
                      {stats?.user_growth_percentage.toFixed(1)}% this month
                    </small>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card stats-card gradient-success">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-2 opacity-75">Total Accounts</h6>
                      <h2 className="mb-0">{stats?.total_accounts || 0}</h2>
                    </div>
                    <i className="bi bi-wallet2" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card stats-card gradient-danger">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-2 opacity-75">Total Transactions</h6>
                      <h2 className="mb-0">{stats?.total_transactions || 0}</h2>
                    </div>
                    <i className="bi bi-arrow-left-right" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card stats-card bg-dark text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-2 opacity-75">Active Today</h6>
                      <h2 className="mb-0">{stats?.active_today || 0}</h2>
                    </div>
                    <i className="bi bi-activity" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Volume Today */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Transaction Volume Today</h5>
                  <h2 className="text-primary mb-0">
                    {formatCurrency(stats?.transaction_volume_today || 0)}
                  </h2>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Signups */}
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Recent Signups</h5>
                </div>
                <div className="card-body">
                  {stats?.recent_signups && stats.recent_signups.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Joined</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.recent_signups.map((user, index) => (
                            <tr key={index}>
                              <td>
                                <i className="bi bi-person-circle me-2"></i>
                                {user.full_name}
                              </td>
                              <td>{user.email}</td>
                              <td>{formatDateTime(user.created_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted">No recent signups</p>
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

export default AdminDashboard;

