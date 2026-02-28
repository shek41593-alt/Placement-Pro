const db = require('../db');

const applyToDrive = async (req, res) => {
    try {
        const { drive_id } = req.body;
        const student_id = req.user.id;
        if (!drive_id) return res.status(400).json({ error: 'Drive ID required' });

        // Check if drive exists and is active
        const drive = await db.query('SELECT * FROM drives WHERE id = $1 AND is_active = true', [drive_id]);
        if (drive.rows.length === 0) return res.status(404).json({ error: 'Drive not found or inactive' });

        // Duplicate prevention
        const existing = await db.query('SELECT id FROM applications WHERE drive_id = $1 AND student_id = $2', [drive_id, student_id]);
        if (existing.rows.length > 0) return res.status(409).json({ error: 'Already applied to this drive' });

        // Check eligibility
        const profile = await db.query('SELECT * FROM profiles WHERE user_id = $1', [student_id]);
        if (profile.rows.length === 0) return res.status(400).json({ error: 'Student profile not found. Please complete your profile.' });
        const p = profile.rows[0];
        const d = drive.rows[0];

        if (d.min_cgpa && p.cgpa < d.min_cgpa) {
            return res.status(403).json({
                error: 'Ineligible',
                reason: 'CGPA_CRITERIA',
                message: `Your CGPA (${p.cgpa}) is below the required minimum (${d.min_cgpa}).`
            });
        }
        if (d.max_backlogs !== null && p.backlogs > d.max_backlogs) {
            return res.status(403).json({
                error: 'Ineligible',
                reason: 'BACKLOG_CRITERIA',
                message: `You have ${p.backlogs} backlogs, which exceeds the limit for this drive (${d.max_backlogs}).`
            });
        }
        if (d.passing_year && d.passing_year !== 0 && p.passing_year !== d.passing_year) {
            return res.status(403).json({
                error: 'Ineligible',
                reason: 'YEAR_CRITERIA',
                message: `This drive is for the ${d.passing_year} batch, but your profile shows ${p.passing_year}.`
            });
        }
        if (d.allowed_branches && d.allowed_branches.length > 0 && !d.allowed_branches.includes(p.branch)) {
            return res.status(403).json({
                error: 'Ineligible',
                reason: 'BRANCH_CRITERIA',
                message: `Your branch (${p.branch}) is not eligible for this drive.`
            });
        }

        const result = await db.query(
            'INSERT INTO applications (drive_id, student_id, status) VALUES ($1,$2,$3) RETURNING *',
            [drive_id, student_id, 'Applied']
        );
        res.status(201).json({
            message: 'Application submitted successfully! 🚀',
            application: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to apply', message: err.message });
    }
};

const getMyApplications = async (req, res) => {
    try {
        const student_id = req.user.id;
        const appsRes = await db.query('SELECT * FROM applications');
        const drivesRes = await db.query('SELECT * FROM drives');

        const myApps = appsRes.rows.filter(a => a.student_id == student_id);
        const enriched = myApps.map(a => {
            const d = drivesRes.rows.find(drive => drive.id == a.drive_id) || {};
            return {
                ...a,
                company_name: d.company_name,
                job_role: d.job_role,
                package_lpa: d.package_lpa,
                drive_date: d.drive_date,
                location: d.location
            };
        });

        res.json(enriched.sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at)));
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch applications', message: err.message });
    }
};

const getAllApplications = async (req, res) => {
    try {
        const { drive_id } = req.query;
        const appsRes = await db.query('SELECT * FROM applications');
        const usersRes = await db.query('SELECT * FROM users');
        const profilesRes = await db.query('SELECT * FROM profiles');
        const drivesRes = await db.query('SELECT * FROM drives');

        let apps = appsRes.rows;
        if (drive_id) {
            apps = apps.filter(a => a.drive_id == drive_id);
        }

        const enriched = apps.map(a => {
            const u = usersRes.rows.find(user => user.id == a.student_id) || {};
            const p = profilesRes.rows.find(prof => prof.user_id == a.student_id) || {};
            const d = drivesRes.rows.find(drive => drive.id == a.drive_id) || {};

            return {
                ...a,
                student_name: u.name,
                student_email: u.email,
                branch: p.branch,
                cgpa: p.cgpa,
                backlogs: p.backlogs,
                company_name: d.company_name,
                job_role: d.job_role
            };
        });

        res.json(enriched.sort((a, b) => new Date(b.applied_at) - new Date(a.applied_at)));
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch applications', message: err.message });
    }
};

const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const validStatuses = ['Applied', 'Aptitude', 'Cleared', 'Interview Scheduled', 'Selected', 'Rejected'];
        if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

        const result = await db.query(
            'UPDATE applications SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *, (SELECT student_id FROM applications WHERE id=$2) as sid',
            [status, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Application not found' });
        const app = result.rows[0];

        // Notify student about status change
        await db.query(
            'INSERT INTO notifications (user_id, title, message, type) VALUES ($1,$2,$3,$4)',
            [app.student_id, 'Application Status Update', `Your application status was updated to: ${status}`, 'status']
        );

        res.json({ message: 'Status updated', application: app });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update status', message: err.message });
    }
};

const getStats = async (req, res) => {
    try {
        const appsRes = await db.query('SELECT * FROM applications');
        const rows = appsRes.rows;

        const stats = {
            applied: rows.filter(r => r.status === 'Applied').length,
            aptitude: rows.filter(r => r.status === 'Aptitude').length,
            cleared: rows.filter(r => r.status === 'Cleared').length,
            interview_scheduled: rows.filter(r => r.status === 'Interview Scheduled').length,
            selected: rows.filter(r => r.status === 'Selected').length,
            rejected: rows.filter(r => r.status === 'Rejected').length,
            total: rows.length
        };
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: 'Failed to get stats', message: err.message });
    }
};

module.exports = { applyToDrive, getMyApplications, getAllApplications, updateStatus, getStats };
