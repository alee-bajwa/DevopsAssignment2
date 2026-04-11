/**
 * Landing Page
 */
import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../../components/common/Footer';

const LandingPage = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-4">
                Welcome to HakiBank
              </h1>
              <p className="lead mb-4">
                Secure, fast, and reliable banking at your fingertips. 
                Manage your finances with ease and confidence.
              </p>
              <div className="d-flex gap-3">
                <Link to="/signup" className="btn btn-light btn-lg">
                  <i className="bi bi-person-plus me-2"></i>
                  Sign Up
                </Link>
                <Link to="/login" className="btn btn-outline-light btn-lg">
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Login
                </Link>
              </div>
            </div>
            <div className="col-lg-6 text-center">
              <i className="bi bi-bank" style={{ fontSize: '15rem', opacity: 0.8 }}></i>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-5">Why Choose Us?</h2>
          <div className="row g-4">
            <div className="col-md-3">
              <div className="feature-card">
                <i className="bi bi-shield-check feature-icon"></i>
                <h5>Secure Accounts</h5>
                <p className="text-muted">
                  Bank-grade security with encryption and multi-factor authentication
                </p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="feature-card">
                <i className="bi bi-lightning-charge feature-icon"></i>
                <h5>Fast Transfers</h5>
                <p className="text-muted">
                  Instant money transfers to any account, anytime, anywhere
                </p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="feature-card">
                <i className="bi bi-headset feature-icon"></i>
                <h5>24/7 Support</h5>
                <p className="text-muted">
                  Round-the-clock customer support for all your banking needs
                </p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="feature-card">
                <i className="bi bi-graph-up feature-icon"></i>
                <h5>Analytics</h5>
                <p className="text-muted">
                  Track your spending and manage your finances effectively
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-5">
        <div className="container">
          <div className="row text-center g-4">
            <div className="col-md-4">
              <div className="card p-4">
                <h2 className="text-primary fw-bold mb-2">50K+</h2>
                <p className="text-muted mb-0">Active Users</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card p-4">
                <h2 className="text-primary fw-bold mb-2">$2.5B+</h2>
                <p className="text-muted mb-0">Transactions Processed</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card p-4">
                <h2 className="text-primary fw-bold mb-2">99.9%</h2>
                <p className="text-muted mb-0">Uptime Guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5 bg-primary text-white">
        <div className="container text-center">
          <h2 className="mb-4">Ready to Get Started?</h2>
          <p className="lead mb-4">
            Join thousands of satisfied customers who trust us with their finances
          </p>
          <Link to="/signup" className="btn btn-light btn-lg">
            <i className="bi bi-person-plus me-2"></i>
            Create Account Now
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;

