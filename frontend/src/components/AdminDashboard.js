import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Table, Alert } from 'react-bootstrap';
import { getUsers, getLeaves, updateAdminPassword, updateUser, updateLeave } from '../api'; // Import API functions
import './Dashboard.css';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [view, setView] = useState('admin-panel');
  const [selectedView, setSelectedView] = useState('active-users');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [changePassError, setChangePassError] = useState('');
  const [showPasswordChangeSuccessModal, setShowPasswordChangeSuccessModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showLeaveDetailsModal, setShowLeaveDetailsModal] = useState(false);
  const [isLeavesDropdownOpen, setIsLeavesDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isUsersDropdownOpen, setIsUsersDropdownOpen] = useState(false);
  const [currentUsersPage, setCurrentUsersPage] = useState(1);
  const [currentPendingPage, setCurrentPendingPage] = useState(1);
  const usersPerPage = 5;
  const [adminName, setAdminName] = useState('');

  const [selectedUser, setSelectedUser] = useState(null); // For the modal
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);

  // Calculate the total number of pages
  const filteredLeaves = leaves.filter((l) => {
    if (view === 'leaves-approved') return l.status === 'Approved';
    if (view === 'leaves-rejected') return l.status === 'Rejected';
    if (view === 'leaves-pending') return l.status === 'Pending';
    return true; // Default: return all leaves
  });

  // Calculate the total number of pages for the filtered leaves
  const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);

  // Get the filtered leaves for the current page
  const paginatedLeaves = filteredLeaves.slice(
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

  useEffect(() => {
    const storedAdmin = JSON.parse(localStorage.getItem('admin')); // Retrieve admin data from localStorage
    if (storedAdmin) {
      setAdminName(`${storedAdmin.firstName} ${storedAdmin.lastName}`); // Set admin name
    } else {
      console.error('No admin data found in localStorage');
      setAdminName('Admin'); // Fallback if no admin data is found
    }
    fetchData();
  
  }, []);



  // Filter approved users for Manage Users
  const approvedUsers = users.filter((user) => user.approved);

  // Filter pending user requests for Pending User Requests
  // Filter pending user requests for Pending User Requests
  const pendingUsers = users.filter((user) => !user.approved);

  // Paginate approved users
  const totalUsersPages = Math.ceil(approvedUsers.length / usersPerPage);
  const paginatedApprovedUsers = approvedUsers.slice(
    (currentUsersPage - 1) * usersPerPage,
    currentUsersPage * usersPerPage
  );

  // Paginate pending users
  const totalPendingPages = Math.ceil(pendingUsers.length / usersPerPage);
  const paginatedPendingUsers = pendingUsers.slice(
    (currentPendingPage - 1) * usersPerPage,
    currentPendingPage * usersPerPage
  );
  const handleViewLeaveDetails = (leave) => {
  // Find the user associated with the leave
    const user = users.find((u) => u.username === leave.username);

  // Add employeeId and employeeName to the selectedLeave object
    const leaveWithUserDetails = {
      ...leave,
      employeeId: user ? user.employeeId : 'N/A',
      employeeName: user ? `${user.firstName} ${user.lastName}` : 'N/A',
    };

    setSelectedLeave(leaveWithUserDetails);
    setShowLeaveDetailsModal(true);
  };
  // Fetch users and leave requests
  const fetchData = async () => {
  try {
    const usersData = await getUsers(); // Fetch users from the backend
    const leavesData = await getLeaves(); // Fetch leave requests from the backend

    // Add employeeId and employeeName to each leave
    const updatedLeaves = leavesData.map((leave) => {
      const user = usersData.find((u) => u.username === leave.username);
      return {
        ...leave,
        employeeId: user ? user.employeeId : 'N/A',
        employeeName: user ? `${user.firstName} ${user.lastName}` : 'N/A',
      };
    });

    // Ensure all users have the 'active' property set to true by default
    const updatedUsers = usersData.map((user) => ({
      ...user,
      active: user.active !== undefined ? user.active : true, // Default to true if undefined
    }));

    setUsers(updatedUsers);
    setLeaves(updatedLeaves);
    } catch (error) {
    console.error('Error fetching data:', error);
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    setChangePassError('');
  
    if (!currentPassword || !newPassword || !retypePassword) {
      setChangePassError('All fields are required.');
      return;
    }
  
    if (newPassword.length < 8 || !/\d/.test(newPassword)) {
      setChangePassError('Password must be at least 8 characters and include at least one number.');
      return;
    }
  
    if (newPassword !== retypePassword) {
      setChangePassError('New passwords do not match.');
      return;
    }
  
    try {
   
      await updateAdminPassword({ currentPassword, newPassword }); // Update admin password

      setChangePassError('');
      setCurrentPassword('');
      setNewPassword('');
      setRetypePassword('');
      setShowChangePassword(false);
      setShowPasswordChangeSuccessModal(true);
    } catch (error) {
      console.error('Error updating password:', error);
      if (error.message === 'Current password is incorrect') {
          setChangePassError('Current password is incorrect.');
        } else {
          setChangePassError('Something went wrong. Please try again.');
        }
        }
  };
  // Handle logout
  const handleLogout = () => {

    setShowLogoutConfirm(false);
    setShowSuccessMessage(true);

    setTimeout(() => {
      setShowSuccessMessage(false);
      window.location.href = '/admin'; // Redirect to admin login
    }, 2000);
  };

  // Approve user
  const approveUser = async (id) => {
    try {
      await updateUser(id, { approved: true }); // Update user approval status
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error approving user:', error);
    }
  };
  // Get dates in range
  const getDatesInRange = (start, end) => {
    const date = new Date(start);
    const dates = [];
    while (date <= new Date(end)) {
      if (date.getDay() !== 0){
        dates.push(new Date(date).toISOString().split('T')[0]);
      }
      
      date.setDate(date.getDate() + 1);
    }
    return dates;
  };


  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB'); // Format as DD/MM/YYYY
  };
  
  // Handle leave approval/rejection
  const handleLeaveAction = async (leave, action) => {
    try {
      const user = users.find((u) => u.username === leave.username); // Find the user by username
  
      if (action === 'Approve') {
        let updatedBalance = {};
  
        // Calculate the number of days for the leave
        const leaveDates = getDatesInRange(leave.startDate, leave.endDate).length;
  
        if (leave.leaveType === 'Casual Leave') {
          updatedBalance = { casualLeaves: user.casualLeaves - leaveDates };
        } else if (leave.leaveType === 'Earned Leave') {
          updatedBalance = { earnedLeaves: user.earnedLeaves - leaveDates };
        } else if (leave.leaveType === 'Combined Leave') {
          updatedBalance = {
            casualLeaves: user.casualLeaves - leave.casualLeaveRequested,
            earnedLeaves: user.earnedLeaves - leave.earnedLeaveRequested,
          };
        }
  
        // Ensure no negative leave balances
        if (updatedBalance.casualLeaves < 0 || updatedBalance.earnedLeaves < 0) {
          alert('Insufficient leave balance.');
          return;
        }
  
        // Update the user's leave balance in the backend
        await updateUser(user.id, updatedBalance);
      }
  
      // Update the leave status in the backend
      await updateLeave(leave.id, { status: action === 'Approve' ? 'Approved' : 'Rejected' });
  
      // Refresh the data
      fetchData();
    } catch (error) {
      console.error('Error handling leave action:', error);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h5 className="text-center">   
          <a
            href="#!"
            onClick={() => setView('admin-panel')} // Set view to 'active-users' when clicked
            style={{ textDecoration: 'none', color: 'inherit' }} // Optional: Remove underline and keep default text color
          >
            Admin Panel
          </a>
        </h5>
        <div className="dropdown">
          <a
            href="#!"
            className={`dropdown-toggle ${view === 'active-users' || view === 'pending-user-requests' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              setIsUsersDropdownOpen(!isUsersDropdownOpen); // Toggle dropdown visibility
            }}
          >
            Users
          </a>
          <div className={`dropdown-menu ${isUsersDropdownOpen ? 'show' : ''}`}>
            <a
              href="#!"
              className={`dropdown-item ${view === 'active-users' ? 'active' : ''}`}
              onClick={() => setView('active-users')}
            >
              Active Users
            </a>
            <a
              href="#!"
              className={`dropdown-item ${view === 'pending-user-requests' ? 'active' : ''}`}
              onClick={() => setView('pending-user-requests')}
            >
              Pending User Requests
            </a>
          </div>
        </div>
        <div className="dropdown">
          <a
            href="#!"
            className={`dropdown-toggle ${isLeavesDropdownOpen ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault(); // Prevent default link behavior
              setIsLeavesDropdownOpen(!isLeavesDropdownOpen); // Toggle dropdown visibility
              console.log('Dropdown state:', !isLeavesDropdownOpen); // Debugging
            }}
          >
            Leaves
          </a>
          <div className={`dropdown-menu ${isLeavesDropdownOpen ? 'show' : ''}`}>
            <a
              href="#!"
              className={`dropdown-item ${view === 'leaves-pending' ? 'active' : ''}`}
              onClick={() => {
                setView('leaves-pending');
              }}
            >
              Pending Leave Requests
            </a>
            <a
              href="#!"
              className={`dropdown-item ${view === 'leaves-approved' ? 'active' : ''}`}
              onClick={() => {
                setView('leaves-approved');
              }}
            >
              Approved Leaves
            </a>
            <a
              href="#!"
              className={`dropdown-item ${view === 'leaves-rejected' ? 'active' : ''}`}
              onClick={() => {
                setView('leaves-rejected');
              }}
            >
              Rejected Leaves
            </a>
          </div>
        </div>
        <a href="#!" onClick={() => setShowChangePassword(true)}>
          Change Password
        </a>

        <a href="#!" onClick={() => setShowLogoutConfirm(true)}>
          Logout
        </a>
      </div>

      <div className="dashboard-content">
      {view === 'admin-panel' && (
        <>
          <h2>Welcome, {adminName}</h2>

          {/* Toggle for Components */}
          <div className="toggle-container">
            <button
              className={`toggle-button ${selectedView === 'active-users' ? 'active' : ''}`}
              onClick={() => setSelectedView('active-users')}
            >
              Active Users
            </button>
            <button
              className={`toggle-button ${selectedView === 'pending-user-requests' ? 'active' : ''}`}
              onClick={() => setSelectedView('pending-user-requests')}
            >
              Pending User Requests
            </button>
            <button
              className={`toggle-button ${selectedView === 'pending-leave-requests' ? 'active' : ''}`}
              onClick={() => setSelectedView('pending-leave-requests')}
            >
              Pending Leave Requests
            </button>
          </div>

          {/* Render the selected view */}
          {selectedView === 'active-users' && (
            <>
              <h4>Active Users</h4>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Username</th>
                    <th>Employee Name</th>
                    <th>View Details</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.employeeId}</td>
                      <td>{user.username}</td>
                      <td>{`${user.firstName} ${user.lastName}`}</td>
                      <td>
                        <button
                          className="btn btn-info btn-sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserDetailsModal(true);
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}

          {selectedView === 'pending-user-requests' && (
            <>
              <h4>Pending User Requests</h4>
              {pendingUsers.length === 0 ? (
                <p>No active user requests.</p>
              ) : (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Employee ID</th>
                      <th>Username</th>
                      <th>Employee Name</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingUsers.map((user) => (
                      <tr key={user.id}>
                        <td>{user.employeeId}</td>
                        <td>{user.username}</td>
                        <td>{`${user.firstName} ${user.lastName}`}</td>
                        <td>
                          <button
                            className="btn btn-info btn-sm"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserDetailsModal(true);
                            }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </>
          )}

          {selectedView === 'pending-leave-requests' && (
            <>
              <h4>Pending Leave Requests</h4>
              {leaves.filter((l) => l.status === 'Pending').length === 0 ? (
                <p>No pending leave requests.</p>
              ) : (
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Employee ID</th>
                      <th>Employee Name</th>
                      <th>Type</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.filter((l) => l.status === 'Pending').map((l) => (
                      <tr key={l.id}>
                        <td>{l.employeeId}</td>
                        <td>{l.employeeName}</td>
                        <td>{l.leaveType}</td>
                        <td>{formatDate(l.startDate)}</td>
                        <td>{formatDate(l.endDate)}</td>
                        <td>
                          <button
                            className="btn btn-info btn-sm"
                            onClick={() => handleViewLeaveDetails(l)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </>
          )}
        </>
      )}
      {view === 'active-users' && (
      <>
        <h4>Active Users</h4>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Username</th>
              <th>Employee Name</th>
              <th>View Details</th>
            </tr>
          </thead>
          <tbody>
            {paginatedApprovedUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.employeeId}</td>
                <td>{user.username}</td>
                <td>{`${user.firstName} ${user.lastName}`}</td>
                <td>
                  <button
                        className="btn btn-info btn-sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserDetailsModal(true);
                        }}
                      >
                        View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        <div className="d-flex justify-content-center mt-3">
          {currentUsersPage > 1 && (
            <span
              variant="info"
              size="sm"
              className='paging-text me-3'
              onClick={() => setCurrentUsersPage(currentUsersPage - 1)}
            >
             &lt; Previous
            </span>
          )}
          <span>Page {currentUsersPage} of {totalUsersPages}</span>
          {currentUsersPage < totalUsersPages && (
            <span
                    variant="info"
                    size="sm"
                    className='paging-text ms-3'
                    onClick={() => setCurrentUsersPage(currentUsersPage + 1)}
                  >
                     Next &gt; 
                  </span>
          )}
        </div>
      </>
    )}

      {view === 'pending-user-requests' && (
      <>
        <h4>Pending User Requests</h4>
        {pendingUsers.length === 0 ? (
          <p>No active user requests.</p>
        ) : (
          <>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Username</th>
                  <th>Employee Name</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPendingUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.employeeId}</td>
                    <td>{user.username}</td>
                    <td>{`${user.firstName} ${user.lastName}`}</td>
                    <td>
                      <button
                        className="btn btn-info btn-sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserDetailsModal(true);
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <div className="d-flex justify-content-center mt-3">
              {currentPendingPage > 1 && (
                <span
                  variant="info"
                  size="sm"
                  className='paging-text me-3'
                  onClick={() => setCurrentPendingPage(currentPendingPage - 1)}
                >
                  &lt; Previous
                </span>
              )}
              <span>Page {currentPendingPage} of {totalPendingPages}</span>
              {currentPendingPage < totalPendingPages && (
                <span
                  variant="info"
                  size="sm"
                  className='paging-text ms-3'
                  onClick={() => setCurrentPendingPage(currentPendingPage + 1)}
                >
                  Next &gt;
                </span>
              )}
            </div>
          </>
        )}
      </>
    )}
        {view === 'leaves-pending' && (
          <>
            <h4>Pending Leave Requests</h4>
              {paginatedLeaves.filter((l) => l.status === 'Pending').length === 0 ? (
                <p>No pending leave requests.</p>
              ) : (
              <Table>
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Employee Name</th>
                    <th>Type</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                {paginatedLeaves.filter((l) => l.status === 'Pending').map((l) => ( 
                  <tr key={l.id}>
                    <td>{l.employeeId}</td>
                    <td>{l.employeeName}</td>
                    <td>{l.leaveType}</td>
                    <td>{formatDate(l.startDate)}</td>
                    <td>{formatDate(l.endDate)}</td>
                    <td>
                      <button
                        className="btn btn-info btn-sm"
                        onClick={() => handleViewLeaveDetails(l)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </>
        )}

        {view === 'leaves-approved' && (
          <>
            <h4>Approved Leaves</h4>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Emplopyee ID</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Total Days</th>
                  <th>Reason</th>
                  <th>View</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLeaves.filter((l) => l.status === 'Approved').map((l) => (
                  <tr key={l.id}>
                    <td>{l.leaveType}</td>
                    <td>{l.employeeId}</td>
                    <td>{formatDate(l.startDate)}</td>
                    <td>{formatDate(l.endDate)}</td>
                    <td>{getDatesInRange(l.startDate, l.endDate).length}</td>
                    <td>{l.reason}</td>
                    <td>
                      <button
                        className="btn btn-info btn-sm"
                        onClick={() => handleViewLeaveDetails(l)}
                      >
                        View
                      </button>
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
        )}

        {view === 'leaves-rejected' && (
          <>
            <h4>Rejected Leaves</h4>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Employee ID</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Total Days</th>
                  <th>Reason</th>
                  <th>View</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLeaves.filter((l) => l.status === 'Rejected').map((l) => (
                  <tr key={l.id}>
                    <td>{l.leaveType}</td>
                    <td>{l.employeeId}</td>
                    <td>{formatDate(l.startDate)}</td>
                    <td>{formatDate(l.endDate)}</td>
                    <td>{getDatesInRange(l.startDate, l.endDate).length}</td>
                    <td>{l.reason}</td>
                    <td>
                      <button
                        className="btn btn-info btn-sm"
                        onClick={() => handleViewLeaveDetails(l)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
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
        )}
      {/* Change Password Modal */}
        <Modal
          show={showLeaveDetailsModal}
          onHide={() => setShowLeaveDetailsModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Leave Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedLeave && (
              <div>
                <p><strong>Leave Request ID:</strong> {selectedLeave.id}</p>
                <p><strong>Employee ID:</strong> {selectedLeave.employeeId}</p>
                <p><strong>Employee Name:</strong> {selectedLeave.employeeName}</p>
                <p><strong>Username:</strong> {selectedLeave.username}</p>
                <p><strong>Type:</strong> {selectedLeave.leaveType}</p>
                <p><strong>Start Date:</strong> {formatDate(selectedLeave.startDate)}</p>
                <p><strong>End Date:</strong> {formatDate(selectedLeave.endDate)}</p>
                <p><strong>Total Days:</strong> {getDatesInRange(selectedLeave.startDate, selectedLeave.endDate).length}</p>
                <p><strong>Reason:</strong> {selectedLeave.reason}</p>
                {selectedLeave.status !== 'Pending' && (
                  <p><strong>Status:</strong> {selectedLeave.status}</p>
                )}
              </div>
            )}
          </Modal.Body>
            {/* Footer with Approve/Reject buttons only for Pending Leaves */}
          {selectedLeave?.status === 'Pending' && (
            <Modal.Footer>
              <Button
                variant="success"
                onClick={() => {
                  handleLeaveAction(selectedLeave, 'Approve');
                  setShowLeaveDetailsModal(false); // Close the modal after action
                }}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  handleLeaveAction(selectedLeave, 'Reject');
                  setShowLeaveDetailsModal(false); // Close the modal after action
                }}
              >
                Reject
              </Button>
            </Modal.Footer>
          )}
        </Modal>
        <Modal show={showChangePassword} onHide={() => setShowChangePassword(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Change Password</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {changePassError && <Alert variant="danger">{changePassError}</Alert>}
            <Form>
              <Form.Group controlId="currentPassword">
                <Form.Label>Current Password</Form.Label>
                <Form.Control
                  type={showPasswords ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </Form.Group>

              <Form.Group controlId="newPassword">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type={showPasswords ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </Form.Group>

              <Form.Group controlId="retypePassword">
                <Form.Label>Retype New Password</Form.Label>
                <Form.Control
                  type={showPasswords ? 'text' : 'password'}
                  value={retypePassword}
                  onChange={(e) => setRetypePassword(e.target.value)}
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
            <Button variant="secondary" onClick={() => setShowChangePassword(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleChangePassword}>
              Update
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Success Modal after password change */}
        <Modal
          show={showPasswordChangeSuccessModal}
          onHide={() => setShowPasswordChangeSuccessModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Password Changed Successfully</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Your password has been successfully changed. Please login again.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={() => window.location.href = '/admin'}>
              OK
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Logout Confirmation Modal */}
        <Modal show={showLogoutConfirm} onHide={() => setShowLogoutConfirm(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Logout</Modal.Title>
          </Modal.Header>
          <Modal.Body>Are you sure you want to logout?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowLogoutConfirm(false)}>
              No
            </Button>
            <Button variant="danger" onClick={handleLogout}>
              Yes
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal
          show={showUserDetailsModal}
          onHide={() => setShowUserDetailsModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Emplopyee Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedUser && (
              <div>
                <p><strong>Employee ID:</strong> {selectedUser.employeeId}</p>
                <p><strong>Username:</strong> {selectedUser.username}</p>
                <p><strong>Employee Name:</strong> {`${selectedUser.firstName} ${selectedUser.lastName}`}</p>
                {(view === 'active-users' || selectedView === 'active-users') && (
                  <>
                  <p><strong>Casual Leave Available:</strong> {selectedUser.casualLeaves}</p>
                  <p><strong>Earned Leave Available:</strong> {selectedUser.earnedLeaves}</p>
                </>
                )}
              </div>
            )}
          </Modal.Body>
            <Modal.Footer>
              {(view === 'pending-user-requests' || selectedView === 'pending-user-requests') && (
                <Button
                  variant="success"
                  onClick={() => {
                    approveUser(selectedUser.id); // Approve user
                    setShowUserDetailsModal(false); // Close modal
                  }}
                >
                  Approve
                </Button>
              )}
            </Modal.Footer>
        </Modal>
        {showSuccessMessage && (
          <div className="alert alert-success logout-alert" role="alert">
            Successfully logged out.
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;