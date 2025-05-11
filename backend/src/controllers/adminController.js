const Admin = require('../models/adminModel');
const bcrypt = require('bcrypt');

// Get admin credentials (for login)
exports.getAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    const admin = await Admin.findOne({ where: { username } });
    if (!admin) {
      console.log('Admin not found')
      return res.status(404).json({ error: 'Admin not found' });
    }

    // Compare the entered password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      console.log('Invalid credentials');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // If the password matches, return admin details
    res.json({
      firstName: admin.firstName,
      lastName: admin.lastName,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update admin password
exports.updateAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, username } = req.body;

    // Check if newPassword is provided
    if (!newPassword) {
      return res.status(400).json({ error: 'New password is required' });
    }

    let admin;

    // If username is provided, handle password reset
    if (username) {
      admin = await Admin.findOne({ where: { username } });
      if (!admin) {
        return res.status(404).json({ error: 'Admin not found' });
      }
    } 
    // If currentPassword is provided, handle password change
    else if (currentPassword) {
      admin = await Admin.findOne();
      if (!admin) {
        return res.status(404).json({ error: 'Admin not found' });
      }

      // Compare the current password with the stored password
      const isMatch = await bcrypt.compare(currentPassword, admin.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
    } else {
      return res.status(400).json({ error: 'Either current password or username is required' });
    }

    // Hash the new password and update it
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword;
    await admin.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};