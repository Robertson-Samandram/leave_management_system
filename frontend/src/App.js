import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Register from './components/Register';
import AdminLogin from './components/AdminLogin';
import UserLogin from './components/UserLogin';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <div className='box'>
      <Router>
      <div className="d-flex flex-column min-vh-100">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/user" element={<UserLogin />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
      <Footer/>
      </div>
    </Router>
    </div>

  );
}

export default App;
