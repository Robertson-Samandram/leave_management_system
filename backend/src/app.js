const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/admin', adminRoutes);

const sequelize = require('./config/database');
sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced');
});

app.get('/', (req, res) => {
  res.send('Backend is running. Use /api/users, /api/leaves, or /api/admin for API endpoints.');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});