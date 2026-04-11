/**
 * Sidebar Component
 */
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { isAdmin } = useAuth();

  const userLinks = [
    { to: '/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
    { to: '/transfer', icon: 'bi-arrow-left-right', label: 'Transfer Money' },
    { to: '/transactions', icon: 'bi-list-ul', label: 'Transactions' },
    { to: '/bills', icon: 'bi-receipt', label: 'Pay Bills' },
    { to: '/profile', icon: 'bi-person', label: 'Profile' }
  ];

  const adminLinks = [
    { to: '/admin', icon: 'bi-speedometer2', label: 'Admin Dashboard' },
    { to: '/admin/users', icon: 'bi-people', label: 'Manage Users' },
    { to: '/admin/transactions', icon: 'bi-list-check', label: 'Transactions' }
  ];

  const links = isAdmin() ? adminLinks : userLinks;

  return (
    <div className="sidebar">
      <div className="p-3 border-bottom">
        <h5 className="mb-0">
          <i className="bi bi-bank me-2"></i>
          HB
        </h5>
      </div>
      
      <nav className="sidebar-nav">
        <ul className="nav flex-column">
          {links.map((link) => (
            <li className="nav-item" key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <i className={`bi ${link.icon}`}></i>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;

