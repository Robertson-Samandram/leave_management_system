import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdmin, updateAdminPassword } from '../api';
import './Dashboard.css';

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);  
  const [resetUsername, setResetUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');    const [errorMsg, setErrorMsg] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false); // for modal
  const [showConfirmResetPassword, setShowConfirmResetPassword] = useState(false);
  const navigate = useNavigate();

  const login = async () => {
    try {
      const admin = await getAdmin(username, password); // Call the API to authenticate the admin

      if (admin.message === 'Login successful') {
        // Store admin details in localStorage
        localStorage.setItem('admin', JSON.stringify({
          username,
          firstName: admin.firstName,
          lastName: admin.lastName,
        }));

        navigate('/admin/dashboard'); // Redirect to the admin dashboard
      } else {
        alert('Invalid Admin Credentials');
      }
    } catch (err) {
      console.error('Error during login:', err);
      alert(err.message || 'Login failed. Please try again.');
    }
  };

  const handlePasswordReset = async () => {
    setErrorMsg('');
    
    if (!resetUsername || !newPassword || !confirmPassword) {
      setErrorMsg('All fields are required.');
      return;
    }

    if (newPassword.length < 8 || !/\d/.test(newPassword)) {
      setErrorMsg('Password must be at least 8 characters and include a number.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    try {
      
      await updateAdminPassword({ username: resetUsername.trim(), newPassword });

      alert('Password updated successfully!');
      setShowModal(false);
      setResetUsername('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Error during password reset:', err);
      setErrorMsg('Error updating password. Try again.');
    }
  };
    

  return (
    <div className="dashboard-content">
      <div className="d-flex w-120" style={{ minHeight: '90vh' }}>

       <div className="w-50 position-relative d-flex flex-column justify-content-start align-items-start p-4">
        <img
          src={require('./logo.png')}
          alt="Watermark"
          className="position-absolute"
          style={{
            top: '10%',
            left: '10%',
            width: '70%',
            opacity: 0.3,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
        <div style={{ zIndex: 1 }}>
          <h1>National Informatics Center Manipur</h1>
          <h3>Employee Leave Management System</h3>
        </div>
      </div>
      <div className="w-50 d-flex justify-content-start align-items-start" style={{ paddingTop: '40px', paddingLeft: '200px' }}>
        <div className="form-container">
        <h2 className="text-center mb-3">Admin Login</h2>

        <input
          className="form-control mb-2"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
        />

        <div className="input-group mb-3">
          <input
            type={showPassword ? 'text' : 'password'}
            className="form-control"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <span
            className="input-group-text"
            style={{ cursor: 'pointer' }}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? '❌' : '👁️'}
          </span>
        </div>

        <button className="btn btn-primary w-100" onClick={login}>
          Login
        </button>

        <p
          className="mt-3 text-center text-primary"
          style={{ cursor: 'pointer' }}
          onClick={() => setShowModal(true)}
        >
          Forgot Password?
        </p>
      </div>
    </div>

    {/* Password Reset Modal */}
    {showModal && (
      <div
        className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}
      >
        <div className="form-container bg-white p-4 rounded shadow" style={{ zIndex: 10000 }}>
          <h4 className="mb-3">Reset Password</h4>
          {errorMsg && <p className="text-danger">{errorMsg}</p>}
          <div className="input-group mb-3">
            <input
              className="form-control"
              type="text"
              placeholder="Enter Username"
              value={resetUsername}
              onChange={(e) => setResetUsername(e.target.value)}
            />
          </div>
          <div className="input-group mb-3">
            <input
              className="form-control"
              type={showResetPassword ? 'text' : 'password'}
              placeholder="Enter New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <span
              className="input-group-text"
              style={{ cursor: 'pointer' }}
              onClick={() => setShowResetPassword(!showResetPassword)}
            >
              {showResetPassword ? '❌' : '👁️'}
            </span>
          </div>
          <div className="input-group mb-3">
            <input
              className="form-control"
              type={showConfirmResetPassword ? 'text' : 'password'}
              placeholder="Re-type New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <span
              className="input-group-text"
              style={{ cursor: 'pointer' }}
              onClick={() => setShowConfirmResetPassword(!showConfirmResetPassword)}
            >
              {showConfirmResetPassword ? '❌' : '👁️'}
            </span>
          </div>
          <div className="d-flex justify-content-between">
            <button className="btn btn-success" onClick={handlePasswordReset}>
              Change Password
            </button>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}
      </div>
    </div>
  );
}

export default AdminLogin;
