/**
 * Footer Component
 */
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-4 mt-5">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-3 mb-md-0">
            <h5><i className="bi bi-bank me-2"></i>HakiBank</h5>
            <p className="text-white-50">Secure and reliable banking services</p>
          </div>
          <div className="col-md-4 mb-3 mb-md-0">
            <h6 className="text-white">Quick Links</h6>
            <ul className="list-unstyled">
              <li><a href="/" className="text-white-50 text-decoration-none hover-link">Home</a></li>
              <li><a href="/login" className="text-white-50 text-decoration-none hover-link">Login</a></li>
              <li><a href="/signup" className="text-white-50 text-decoration-none hover-link">Sign Up</a></li>
            </ul>
          </div>
          <div className="col-md-4">
            <h6 className="text-white">Contact</h6>
            <p className="text-white-50 mb-1">
              <i className="bi bi-envelope me-2"></i>support@hakibank.com
            </p>
            <p className="text-white-50">
              <i className="bi bi-telephone me-2"></i>1-800-HAKI-123
            </p>
          </div>
        </div>
        <hr className="border-secondary" />
        <div className="text-center">
          <small className="text-white-50">&copy; 2024 HakiBank. All rights reserved.</small>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

