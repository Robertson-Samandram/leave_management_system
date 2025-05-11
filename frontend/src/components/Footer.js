import React from 'react';
import { Container } from 'react-bootstrap';

function Footer() {
  return (
    <footer className="mt-auto" style={{ backgroundColor: '#fff', padding: '4px 0' }}>
      <Container>
        <div className="d-flex justify-content-between" style={{ fontSize: '1rem', color: '#000' }}>
          <small>© {new Date().getFullYear()} Employee Leave Management System</small>
          <small>This website is designed and developed by Robertson Samandram @ NIC Manipur</small>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;