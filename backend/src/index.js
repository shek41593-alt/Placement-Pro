require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const drivesRoutes = require('./routes/drives');
const applicationsRoutes = require('./routes/applications');
const interviewsRoutes = require('./routes/interviews');
const resumeRoutes = require('./routes/resume');
const alumniRoutes = require('./routes/alumni');
const analyticsRoutes = require('./routes/analytics');
const botRoutes = require('./routes/bot');
const notificationsRoutes = require('./routes/notifications');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve frontend at /app
app.use('/app', express.static(path.join(__dirname, '../../frontend')));

// Routes
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/drives', drivesRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/interviews', interviewsRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/alumni', alumniRoutes);
const { resetDB } = require('./db');
// ...
app.use('/api/bot', botRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/analytics', analyticsRoutes);

// Debug reset route (for mock DB clean)
app.post('/api/debug/reset', (req, res) => {
    resetDB();
    res.json({ message: 'System data reset to default successfully' });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'PlacementPro API is running 🚀' });
});

// Root → frontend home page (to avoid affecting the SPA pages)
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../../frontend/home.html')));

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
    console.log(`\n🎓 =====================================`);
    console.log(`🚀 PlacementPro is running!`);
    console.log(`📱 Open:  http://localhost:${PORT}`);
    console.log(`🔌 API:   http://localhost:${PORT}/api/health`);
    console.log(`🎓 =====================================\n`);
});
