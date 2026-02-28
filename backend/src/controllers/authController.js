const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const register = async (req, res) => {
    try {
        const { name, email, password, role, branch, cgpa, backlogs, passing_year, company, graduation_year } = req.body;
        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: 'Name, email, password, and role are required' });
        }
        const validRoles = ['tpo', 'student', 'alumni'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: 'Invalid role. Must be tpo, student, or alumni' });
        }
        // Check existing user
        const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const result = await db.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
            [name, email, hashedPassword, role]
        );
        const user = result.rows[0];
        // Insert profile based on role
        if (role === 'student') {
            await db.query(
                'INSERT INTO profiles (user_id, branch, cgpa, backlogs, passing_year) VALUES ($1, $2, $3, $4, $5)',
                [user.id, branch || null, cgpa || null, backlogs || 0, passing_year || null]
            );
        } else if (role === 'alumni') {
            await db.query(
                'INSERT INTO profiles (user_id, company, graduation_year) VALUES ($1, $2, $3)',
                [user.id, company || null, graduation_year || null]
            );
        } else {
            await db.query('INSERT INTO profiles (user_id) VALUES ($1)', [user.id]);
        }
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        res.status(201).json({ message: 'Registration successful', user, token });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Registration failed', message: err.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        res.json({ message: 'Login successful', user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed', message: err.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT u.id, u.name, u.email, u.role, u.created_at,
       p.branch, p.cgpa, p.backlogs, p.passing_year,
       p.skills, p.bio, p.company, p.graduation_year, p.linkedin, p.github
       FROM users u LEFT JOIN profiles p ON u.id = p.user_id WHERE u.id = $1`,
            [req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to get profile', message: err.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, branch, cgpa, backlogs, passing_year, skills, bio, company, graduation_year, linkedin, github } = req.body;

        // Update user name if provided
        if (name) {
            await db.query('UPDATE users SET name=$1 WHERE id=$2', [name, req.user.id]);
        }

        await db.query(
            `UPDATE profiles SET branch=$1, cgpa=$2, backlogs=$3, passing_year=$4,
       skills=$5, bio=$6, company=$7, graduation_year=$8, linkedin=$9, github=$10, updated_at=NOW()
       WHERE user_id=$11`,
            [branch, cgpa, backlogs, passing_year, skills, bio, company, graduation_year, linkedin, github, req.user.id]
        );
        const userResult = await db.query('SELECT id, name, email, role FROM users WHERE id=$1', [req.user.id]);
        res.json({ message: 'Profile updated successfully', user: userResult.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update profile', message: err.message });
    }
};

module.exports = { register, login, getProfile, updateProfile };
