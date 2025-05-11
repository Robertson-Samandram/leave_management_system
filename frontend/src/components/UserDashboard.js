import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, ToggleButtonGroup, ToggleButton, Table, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { withdrawLeave , getUsers, getLeaves, createLeave, updateUser } from '../api'; // Import API functions
import './Dashboard.css';

const UserDashboard = () => {
  const [showLogout, setShowLogout] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [leaveType, setLeaveType] = useState('casual');
  const [user, setUser] = useState(null);
  const [userLeaves, setUserLeaves] = useState([]);
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [casualLeave, setCasualLeave] = useState(0);
  const [earnedLeave, setEarnedLeave] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [changePassError, setChangePassError] = useState('');
  const [changePassSuccess, setChangePassSuccess] = useState('');
  const [showPasswordChangeSuccess, setShowPasswordChangeSuccess] = useState(false);
  const [showLeaveDetails, setShowLeaveDetails] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [adminUsername, setAdminUsername] = useState(''); // For predefined reasons
  const [customReason, setCustomReason] = useState(''); // For "Others" reason
  const [reasonError, setReasonError] = useState(''); 
  const [totalDays, setTotalDays] = useState(0);// For validation error
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

// Calculate the total number of pages
  const totalPages = Math.ceil(userLeaves.length / itemsPerPage);

  // Get the leaves for the current page
  const paginatedLeaves = userLeaves.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Function to handle page change
  const handlePageChange = (direction) => {
    if (direction === 'next' && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    } else if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const fetchAdmin = () => {
    const storedAdmin = JSON.parse(localStorage.getItem('admin')); // Retrieve admin data from localStorage
    if (storedAdmin && storedAdmin.firstName) {
      setAdminUsername(storedAdmin.firstName); // Set admin's first name
    } else {
      console.error('No admin data found in localStorage');
      setAdminUsername('Admin'); // Fallback to default
    }
  };
  useEffect(() => {
    fetchAdmin();
  }, []);
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) return;

    // Fetch user data
    getUsers()
      .then((users) => {
        const userData = users.find((u) => u.username === storedUser.username);
        if (userData) {
          if (userData.casualLeaves === undefined) userData.casualLeaves = 12;
          if (userData.earnedLeaves === undefined) userData.earnedLeaves = 30;

          setUser({
            ...userData,
            casualLeaves: Number(userData.casualLeaves) || 0,
            earnedLeaves: Number(userData.earnedLeaves) || 0,
          });
        }
      })
      .catch((error) => console.error('Error fetching user data:', error));

    // Fetch user leave requests
    getLeaves(storedUser.username)
    .then((leaves) => {
      const userLeaves = leaves.filter((leave) => leave.username === storedUser.username);
      setUserLeaves(userLeaves); // Set only the leaves for the logged-in user
    })
    .catch((error) => console.error('Error fetching leave requests:', error));
  }, []);


  const getDatesInRange = (start, end) => {
    const dates = [];
    const currentDate = new Date(start);
    const lastDate = new Date(end);
    while (currentDate <= lastDate) {
      const day = currentDate.getDay();
      if (day !== 0) {
        dates.push(new Date(currentDate).toISOString().split('T')[0]);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  const handleChangePassword = async () => {
    setChangePassError('');
    setChangePassSuccess('');

    if (!currentPassword || !newPassword || !retypePassword) {
      setChangePassError('All fields are required.');
      return;
    }

    if (currentPassword !== user.password) {
      setChangePassError('Current password is incorrect.');
      return;
    }

    if (newPassword.length < 8 || !/\d/.test(newPassword)) {
      setChangePassError('New password must be at least 8 characters and include a number.');
      return;
    }

    if (newPassword !== retypePassword) {
      setChangePassError('New passwords do not match.');
      return;
    }

    try {
      await updateUser(user.id, { password: newPassword }); // Update password via API
      const updatedUser = { ...user, password: newPassword };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setChangePassSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setRetypePassword('');
      setShowPasswordChangeSuccess(true);
    } catch (error) {
      console.error('Error updating password:', error);
      setChangePassError('Something went wrong. Please try again.');
    }
  };

  const handlePasswordChangeSuccess = () => {
    setShowPasswordChangeSuccess(false);
    localStorage.removeItem('user'); // Log the user out after password change
    navigate('/user'); // Redirect to login page
  };

const confirmApply = () => {
  const dates = getDatesInRange(startDate, endDate);

  const alreadyRequested = userLeaves
    .filter((l) => l.status !== 'Rejected' && l.status !== 'Withdrawn')
    .flatMap((l) => getDatesInRange(l.startDate, l.endDate));

  const hasConflict = dates.some((d) => alreadyRequested.includes(d));

  if (!startDate || !endDate) {
    alert('Please select both start and end date.');
    return;
  }
  if (!reason) {
    setReasonError('Please select a reason for your leave.');
    return;
  }
  if (reason === 'Others' && !customReason.trim()) {
    setReasonError('Please give reasons for your leave.');
    return;
  }

  const totalRequested = dates.length;
  if (leaveType === 'casual' && totalRequested > user.casualLeaves) {
    alert(`You cannot apply for ${totalRequested} days of Casual Leave. Available balance: ${user.casualLeaves} days.`);
    return;
  }

  if (leaveType === 'earned' && totalRequested > user.earnedLeaves) {
    alert(`You cannot apply for ${totalRequested} days of Earned Leave. Available balance: ${user.earnedLeaves} days.`);
    return;
  }

  if (leaveType === 'Combined') {
    if (casualLeave > user.casualLeaves) {
      alert(`You cannot apply for ${casualLeave} days of Casual Leave. Available balance: ${user.casualLeaves} days.`);
      return;
    }
    if (earnedLeave > user.earnedLeaves) {
      alert(`You cannot apply for ${earnedLeave} days of Earned Leave. Available balance: ${user.earnedLeaves} days.`);
      return;
    }
    if (casualLeave + earnedLeave !== totalRequested) {
      alert(`Total combined leaves (${casualLeave + earnedLeave}) must match selected dates (${totalRequested} days).`);
      return;
    }
  }

  if (hasConflict) {
    alert('You have already requested leave for one or more of these dates.');
    return;
  }

  setShowConfirm(true);
};

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB'); // Format as DD/MM/YYYY
  };

  const applyLeave = async () => {
    try {
      const leaveData = {
        username: user.username,
        type: leaveType === 'casual' ? 'Casual Leave' : leaveType === 'earned' ? 'Earned Leave' : 'Combined Leave', // Match ENUM values
        startDate,
        endDate,
        reason,
        status: 'Pending',
        casualLeaveRequested: leaveType === 'Combined' ? casualLeave : 0,
        earnedLeaveRequested: leaveType === 'Combined' ? earnedLeave : 0,
      };
  
      console.log('Leave Data:', leaveData); // Debugging
  
      await createLeave(leaveData);
  
      setShowConfirm(false);
      alert('Leave request submitted.');
  
      const updatedLeaves = await getLeaves(user.username);
      setUserLeaves(updatedLeaves);
  
      setStartDate('');
      setEndDate('');
      setReason('');
      setCasualLeave(0);
      setEarnedLeave(0);
    } catch (error) {
      console.error('Error submitting leave request:', error);
      alert('Failed to submit leave request. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setShowLogout(false);
    setShowSuccess(true);
    setTimeout(() => navigate('/user'), 2000);
  };


  const confirmWithdraw = async (leaveId) => {
  try {
    await withdrawLeave(leaveId); // Call the API function

    // Update the userLeaves state to reflect the withdrawn leave
    setUserLeaves((prevLeaves) =>
      prevLeaves.map((leave) =>
        leave.id === leaveId ? { ...leave, status: 'Withdrawn' } : leave
      )
    );

    alert('Leave successfully withdrawn.');
  } catch (error) {
    console.error('Error withdrawing leave:', error);
    alert('Failed to withdraw leave. Please try again.');
  }
};

  if (!user) return <div className="dashboard-content">Loading...</div>;

  const pendingRequests = userLeaves.filter((l) => l.status === 'Pending');

  return (
    <div className="dashboard-container">
      <div className="sidebar">
    
          <div className="flex-column">
            <h5 className="text-white px-2">{user.firstName} {user.lastName}</h5>
            <a 
              href="#!" 
              className={`nav-link ${!showApply && !showStatus ? 'active' : ''}`}
              onClick={() => { setShowApply(false); setShowStatus(false); }}>
                Home
            </a>

            <a 
              href="#!" 
              className={`nav-link ${showApply ? 'active' : ''}`}
              onClick={() => { setShowApply(true); setShowStatus(false); }}
            >
              Apply Leave
            </a>

            <a 
              href="#!" 
              className={`nav-link ${showStatus ? 'active' : ''}`}
              onClick={() => { setShowApply(false); setShowStatus(true); }}
            >
              Application Status
            </a>
            <a
              href="#!"
              className="nav-link"
              onClick={() => setShowChangePassword(true)}
            >
              Change Password
            </a>
            <a 
              href="#!" 
              className="nav-link"
              onClick={() => setShowLogout(true)}
            >
              Logout
            </a>
          </div>
      </div>

      <div className="dashboard-content">
        {showSuccess && <Alert variant="success">Successfully logged out.</Alert>}

        {(!showApply && !showStatus) && (
          <>
            <h2>Your Leave Balance</h2>
            <div className="d-flex gap-3">
              <div className="p-3 bg-success text-white rounded">Casual: {user.casualLeaves}</div>
              <div className="p-3 bg-warning text-dark rounded">Earned: {user.earnedLeaves}</div>
              <div className="p-3 bg-danger text-white rounded">Combined: {user.casualLeaves + user.earnedLeaves}</div>
            </div>
            <h5 className="mt-4">Leave History</h5>
            {userLeaves.length > 0 ? (
              <>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Total Days</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLeaves.map((leave, idx) => (
                    <tr key={idx}>
                      <td>{leave.leaveType}</td>
                      <td>{formatDate(leave.startDate)}</td>
                      <td>{formatDate(leave.endDate)}</td>
                      <td>{getDatesInRange(leave.startDate, leave.endDate).length}</td> 
                      <td>
                        <span
                          className={
                            leave.status === 'Approved' ? 'status-approved'
                            : leave.status === 'Pending' ? 'status-pending'
                            :leave.status === 'Withdrawn' ? 'status-withdrawn'
                            : 'status-rejected'
                          }
                        >
                          {leave.status}
                        </span>
                      </td>
                      <td>
                          <span
                            variant="info"
                            size="sm"
                            className='view-text'
                            onClick={() => {
                              setSelectedLeave(leave);
                              setShowLeaveDetails(true);
                            }}
                          >
                            View
                          </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {/* Pagination Controls */}
              <div className="d-flex justify-content-center mt-3">
                {currentPage > 1 && (
                  <span
                    variant="info"
                    size="sm"
                    className='paging-text me-3'
                    onClick={() => handlePageChange('prev')}
                  >
                     &lt; Previous 
                  </span>
                )}
                <span> Page {currentPage} of {totalPages} </span>
                {currentPage < totalPages && (
                  <span
                    variant="info"
                    size="sm"
                    className='paging-text ms-3'
                    onClick={() => handlePageChange('next')}
                  >
                     Next &gt; 
                  </span>
                )}
              </div>
            </>
            ) : <p>No leave history available.</p>}
          </>
        )}

        {showStatus && (
          <>
            <h5>Application Status</h5>
            {pendingRequests.length > 0 ? (
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map((leave, idx) => (
                    <tr key={idx}>
                      <td>{leave.leaveType}</td>
                      <td>{formatDate(leave.startDate)}</td>
                      <td>{formatDate(leave.endDate)}</td>
                      <td>
                          <span
                            variant="info"
                            size="sm"
                            className='view-text'
                            onClick={() => {
                              setSelectedLeave(leave);
                              setShowLeaveDetails(true);
                            }}
                          >
                            View
                          </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : <p>No pending leave requests.</p>}
          </>
        )}

        {showApply && (
          <>
            <h2>Apply Leave</h2>
            <ToggleButtonGroup type="radio" name="leaveType" value={leaveType} onChange={val => setLeaveType(val)}>
              <ToggleButton id="tbg-radio-1" value={'casual'}>Casual</ToggleButton>
              <ToggleButton id="tbg-radio-2" value={'earned'}>Earned</ToggleButton>
              <ToggleButton id="tbg-radio-3" value={'Combined'}>Combined</ToggleButton>
            </ToggleButtonGroup>
            <div className="mt-3">Available: {leaveType === 'casual' ? user.casualLeaves : 
                              leaveType === 'earned' ? user.earnedLeaves : 
                              user.casualLeaves + user.earnedLeaves}</div>
            <div className="mt-3">
              <Form>
              {leaveType === 'Combined' && (
                <>
                  <Form.Group controlId="casualLeave">
                    <Form.Label>Casual Days</Form.Label>
                    <Form.Control type="number" value={casualLeave} onChange={e => setCasualLeave(Number(e.target.value))} />
                  </Form.Group>
                  <Form.Group controlId="earnedLeave">
                    <Form.Label>Earned Days</Form.Label>
                    <Form.Control type="number" value={earnedLeave} onChange={e => setEarnedLeave(Number(e.target.value))} />
                  </Form.Group>
                </>
              )}
                <Form.Group controlId="reason">
                  <Form.Label>Reason for Leave</Form.Label>
                  <Form.Select
                    type="radio"
                    name="reason"
                    value={reason}
                    onChange={(e) => {
                      setReason(e.target.value);
                      setCustomReason(''); // Reset custom reason when a predefined reason is selected
                      setReasonError(''); // Clear error
                    }}
                  >
                    <option value="">Select a reason</option>
                    <option value="Sick">Sick</option>
                    <option value="Vacation">Vacation</option>
                    <option value="Family Member Sick">Family Member Sick</option>
                    <option value="Marriage">Marriage</option>
                    <option value="Compassionate">Compassionate</option>
                    <option value="Others">Others</option>
                  </Form.Select>
                  {reason === 'Others' && (
                    <Form.Control
                      type="text"
                      className="mt-2"
                      placeholder="Please give reasons"
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                    />
                  )}
                  {reasonError && <p className="text-danger mt-1">{reasonError}</p>}
                </Form.Group>
                <Form.Group controlId="startDate" className="mt-2">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                          setStartDate(e.target.value);
                          if (e.target.value && endDate) {
                            const dates = getDatesInRange(e.target.value, endDate);
                            setTotalDays(dates.length);
                          } else {
                            setTotalDays(0);
                          }
                    }}
                    onBlur={() => {
                      if (!startDate) return;
                
                      const date = new Date(startDate);
                      if (isNaN(date.getTime())) return;
                
                      if (date.getDay() === 0) {
                        alert("Leave cannot start on a Sunday.");
                        setStartDate('');
                      }
                    }}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </Form.Group>

                <Form.Group controlId="endDate" className="mt-2">
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      if (startDate && e.target.value) {
                      const dates = getDatesInRange(startDate, e.target.value);
                      setTotalDays(dates.length);
                    } else {
                      setTotalDays(0);
                    }
                    }}
                    onBlur={() => {
                      if (!endDate) return;
                
                      const date = new Date(endDate);
                      if (isNaN(date.getTime())) return;
                
                      if (date.getDay() === 0) {
                        alert("Leave cannot end on a Sunday.");
                        setEndDate('');
                      }
                    }}
                    min={startDate || new Date().toISOString().split("T")[0]}
                  />
                </Form.Group>
              </Form>
              <div className="mt-2">
                <strong>Total Days:</strong> {totalDays}
              </div>
              <Button variant="success" className="mt-3" onClick={confirmApply}>Submit Leave Request</Button>
            </div>
          </>
        )}
      </div>
      <Modal
        show={showLeaveDetails}
        onHide={() => setShowLeaveDetails(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Leave Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLeave && (
            <div>
              <p><strong>Leave Request ID:</strong> {selectedLeave.id}</p>
              <p><strong>Type:</strong> {selectedLeave.leaveType}</p>
              <p><strong>Start Date:</strong> {formatDate(selectedLeave.startDate)}</p>
              <p><strong>End Date:</strong> {formatDate(selectedLeave.endDate)}</p>
              <p><strong>Total Days:</strong> {getDatesInRange(selectedLeave.startDate, selectedLeave.endDate).length}</p>
              <p>
                <strong>Status:</strong>{' '}
                <span
                  className={
                    selectedLeave.status === 'Approved' ? 'status-approved'
                    : selectedLeave.status === 'Pending' ? 'status-pending'
                    : selectedLeave.status === 'Withdrawn' ? 'status-withdrawn'
                    : 'status-rejected'
                  }
                  style={{
                    display: 'inline-block',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    color: 'white',
                  }}
                >
                  {selectedLeave.status}
                </span>
              </p>
              <p><strong>Applied To:</strong> {adminUsername|| 'Admin'}</p> {/* Replace 'Admin Username' with dynamic data */}
              {selectedLeave.status === 'Approved' && (
                <p><strong>Approved By:</strong> {adminUsername || 'Admin'}</p>
              )}
              {selectedLeave.status === 'Rejected' && (
                <p><strong>Rejected By:</strong> {adminUsername || 'Admin'}</p>
              )}
              <Modal.Footer>
              {selectedLeave.status === 'Pending' && (
                <Button
                  variant="danger"
                  className="mt-3"
                  onClick={() => {
                    setShowLeaveDetails(false);
                    confirmWithdraw(selectedLeave.id);
                  }}
                >
                  Withdraw
                </Button>
              )}
              </Modal.Footer>
            </div>
          )}
        </Modal.Body>
      </Modal>
      <Modal show={showChangePassword} onHide={() => setShowChangePassword(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {changePassError && <Alert variant="danger">{changePassError}</Alert>}
              {changePassSuccess && <Alert variant="success">{changePassSuccess}</Alert>}
              <Form>
                <Form.Group controlId="currentPassword">
                  <Form.Label>Current Password</Form.Label>
                  <Form.Control
                    type={showPasswords ? "text" : "password"}
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                  />
                </Form.Group>

                <Form.Group controlId="newPassword">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type={showPasswords ? "text" : "password"}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                </Form.Group>

                <Form.Group controlId="retypePassword">
                  <Form.Label>Retype New Password</Form.Label>
                  <Form.Control
                    type={showPasswords ? "text" : "password"}
                    value={retypePassword}
                    onChange={e => setRetypePassword(e.target.value)}
                  />
                </Form.Group>

                <Form.Check
                  type="checkbox"
                  label="Show Passwords"
                  checked={showPasswords}
                  onChange={() => setShowPasswords(!showPasswords)}
                  className="mt-2"
                />
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowChangePassword(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleChangePassword}>Update</Button>
            </Modal.Footer>
          </Modal>
          <Modal show={showPasswordChangeSuccess} onHide={() => setShowPasswordChangeSuccess(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Password Changed Successfully</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Your password has been changed successfully. Please log in again.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={handlePasswordChangeSuccess}>OK</Button>
          </Modal.Footer>
        </Modal>

      <Modal show={showLogout} onHide={() => setShowLogout(false)} centered>
        <Modal.Header closeButton><Modal.Title>Confirm Logout</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure you want to log out?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLogout(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleLogout}>Logout</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton><Modal.Title>Confirm Leave Application</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure you want to submit this leave request?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>Cancel</Button>
          <Button variant="primary" onClick={applyLeave}>Confirm</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showWithdrawConfirm} onHide={() => setShowWithdrawConfirm(false)} centered>
        <Modal.Header closeButton><Modal.Title>Confirm Withdrawal</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure you want to withdraw this leave request?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowWithdrawConfirm(false)}>Cancel</Button>
          <Button variant="danger" onClick={withdrawLeave}>Withdraw</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserDashboard;
