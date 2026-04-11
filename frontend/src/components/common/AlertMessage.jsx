/**
 * Alert Message Component
 */
import React from 'react';

const AlertMessage = ({ type = 'info', message, onClose }) => {
  if (!message) return null;

  const getAlertClass = () => {
    const types = {
      success: 'alert-success',
      error: 'alert-danger',
      warning: 'alert-warning',
      info: 'alert-info'
    };
    return types[type] || types.info;
  };

  const getIcon = () => {
    const icons = {
      success: 'bi-check-circle-fill',
      error: 'bi-exclamation-circle-fill',
      warning: 'bi-exclamation-triangle-fill',
      info: 'bi-info-circle-fill'
    };
    return icons[type] || icons.info;
  };

  return (
    <div className={`alert ${getAlertClass()} alert-dismissible fade show d-flex align-items-center`} role="alert">
      <i className={`bi ${getIcon()} me-2`}></i>
      <div className="flex-grow-1">{message}</div>
      {onClose && (
        <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
      )}
    </div>
  );
};

export default AlertMessage;

