import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUser, getUsers } from '../api';
import './Dashboard.css';



function Register() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    employeeId: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Toggle for password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Toggle for confirm password visibility
  const navigate = useNavigate();


  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return regex.test(password);
  };

  const validateEmployeeId = (id) => /^\d{6}$/.test(id);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const registerUser = async () => {
    setError('');
  
    if (!validatePassword(form.password)) {
      setError('Password must be at least 8 characters long and include a number and a letter.');
      return;
    }
  
    if (!validateEmployeeId(form.employeeId)) {
      setError('Employee ID must be exactly 6 digits.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
  
    try {
      const users = await getUsers();
  
      const employeeIDExists = users.some((user) => user.employeeId === form.employeeId);
      const employeeUserExists = users.some((user) => user.username === form.username);
  
      if (employeeIDExists) {
        setError('Employee ID already exists. Please check your Employee ID.');
        return;
      }
      if (employeeUserExists) {
        setError('User name already exists. Please choose another.');
        return;
      }
  
      const newUser = {
        ...form,
        approved: false,
        casualLeaves: 12,
        earnedLeaves: 30,
      };
  
      const response = await createUser(newUser);
  
      if (response) {
        alert('Registration submitted. Await admin approval.');
        navigate('/user');
      }
    } catch (err) {
      console.error(err);
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="dashboard-content">
      <div className="d-flex w-120" style={{ minHeight: '90vh' }}>
        
        {/* LEFT SIDE TEXT */}
        <div className="w-50 position-relative d-flex flex-column justify-content-start align-items-start p-4">
          {/* Watermark */}
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

          {/* Text on top */}
          <div style={{ zIndex: 1 }}>
            <h1>National Informatics Center Manipur</h1>
            <h3>Employee Leave Management System</h3>
          </div>
        </div>

        {/* RIGHT SIDE FORM */}
        <div className="w-50 d-flex justify-content-start align-items-start" style={{ paddingTop: '40px', paddingLeft: '200px' }}>
          <div className="form-container">
            <h2 className="text-center mb-3">New User Registration</h2>
            {error && <p className="error">{error}</p>}
  
            <input className="form-control mb-2" name="firstName" placeholder="First Name" onChange={handleChange} />
            <input className="form-control mb-2" name="lastName" placeholder="Last Name" onChange={handleChange} />
            <input className="form-control mb-2" name="employeeId" placeholder="Employee ID (6 digits)" onChange={handleChange} />
            <input className="form-control mb-2" name="username" placeholder="Username" onChange={handleChange} />
            <div className="input-group mb-3">
              <input
                className="form-control"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                onChange={handleChange}
              />
              <span
                className="input-group-text"
                style={{ cursor: 'pointer' }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '❌' : '👁️'}
              </span>
            </div>

            {/* Confirm Password Field */}
            <div className="input-group mb-3">
              <input
                className="form-control"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirm Password"
                onChange={handleChange}
              />
              <span
                className="input-group-text"
                style={{ cursor: 'pointer' }}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? '❌' : '👁️'}
              </span>
            </div>
            <button className="btn btn-primary w-100" onClick={registerUser}>Register</button>
  
            <p className="mt-3 text-center">
              Already registered?{' '}
              <span className="text-primary" style={{ cursor: 'pointer' }} onClick={() => navigate('/user')}>
                Login here
              </span>
            </p>
          </div>
        </div>
  
      </div>
    </div>
  );
  
    
}
export default Register;
