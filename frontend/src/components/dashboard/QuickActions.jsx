/**
 * Quick Actions Component
 */
import React from 'react';
import { Link } from 'react-router-dom';

const QuickActions = () => {
  const actions = [
    {
      to: '/transfer',
      icon: 'bi-arrow-left-right',
      label: 'Transfer',
      color: 'primary'
    },
    {
      to: '/transactions',
      icon: 'bi-list-ul',
      label: 'Transactions',
      color: 'info'
    },
    {
      to: '/bills',
      icon: 'bi-receipt',
      label: 'Pay Bills',
      color: 'warning'
    },
    {
      to: '/profile',
      icon: 'bi-person',
      label: 'Profile',
      color: 'success'
    }
  ];

  return (
    <div className="row g-3">
      {actions.map((action) => (
        <div className="col-6 col-md-3" key={action.to}>
          <Link to={action.to} className="quick-action-btn text-decoration-none">
            <i className={`bi ${action.icon} text-${action.color}`}></i>
            <span>{action.label}</span>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default QuickActions;

