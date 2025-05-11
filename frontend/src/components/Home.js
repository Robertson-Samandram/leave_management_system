import React from 'react';
import { Link } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import './Dashboard.css';

function Home() {
  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <Nav className="flex-column">
          <h5 className="text-white text-center py-3">Welcome</h5>
          <Nav.Link as={Link} to="/user">User Login</Nav.Link>
          <Nav.Link as={Link} to="/register">New User Registration</Nav.Link>
          <Nav.Link as={Link} to="/admin">Admin Login</Nav.Link>
        </Nav>
      </div>

      {/* Right Section with Sky Blue Background, Watermark, and Text */}
      <div
        className="dashboard-content position-relative d-flex flex-column justify-content-start align-items-center p-4"
        style={{ position: 'relative', overflow: 'hidden' }}
      >
        {/* Watermark */}
        <img
          src={require('./logo.png')}
          alt="Watermark"
          className="position-absolute"
          style={{
            top: '20%',
            left: '30%',
            width: '38%',
            opacity: 0.3,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />

        {/* Text on top of background */}
        <div style={{ zIndex: 1 }}>
          <h1>National Informatics Center Manipur</h1>
          <h3>Employee Leave Management System</h3>
        </div>
      </div>
    </div>
  );
}

export default Home;
