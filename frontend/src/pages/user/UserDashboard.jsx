/**
 * User Dashboard Page
 */
import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import BalanceCard from '../../components/dashboard/BalanceCard';
import QuickActions from '../../components/dashboard/QuickActions';
import TransactionTable from '../../components/dashboard/TransactionTable';
import SpendingChart from '../../components/dashboard/SpendingChart';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AlertMessage from '../../components/common/AlertMessage';
import accountService from '../../services/accountService';
import transactionService from '../../services/transactionService';

const UserDashboard = () => {
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch account info
      const accountsData = await accountService.getAccounts();
      if (accountsData.length > 0) {
        setAccount(accountsData[0]);
      }

      // Fetch recent transactions
      const transactionsData = await transactionService.getTransactions({ limit: 10 });
      setTransactions(transactionsData);
    } catch (error) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Failed to load dashboard data'
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

        {alert.show && (
          <AlertMessage
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert({ show: false, type: '', message: '' })}
          />
        )}

        <div className="container-fluid">
          <h2 className="mb-4">Dashboard</h2>

          {/* Balance Card */}
          <div className="row mb-4">
            <div className="col-lg-6">
              <BalanceCard account={account} />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-4">
            <h5 className="mb-3">Quick Actions</h5>
            <QuickActions />
          </div>

          {/* Recent Transactions */}
          <div className="row">
            <div className="col-lg-8 mb-4">
              <div className="card">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Recent Transactions</h5>
                </div>
                <div className="card-body">
                  <TransactionTable transactions={transactions} loading={false} />
                </div>
              </div>
            </div>

            {/* Spending Chart */}
            <div className="col-lg-4 mb-4">
              <div className="card">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Activity (Last 7 Days)</h5>
                </div>
                <div className="card-body">
                  <SpendingChart transactions={transactions} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

