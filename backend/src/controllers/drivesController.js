const db = require('../db');

// Get all drives
const getAllDrives = async (req, res) => {
    try {
        const drivesRes = await db.query('SELECT * FROM drives ORDER BY created_at DESC');
        const appsRes = await db.query('SELECT * FROM applications');

        const appsCountMap = appsRes.rows.reduce((acc, a) => {
            acc[a.drive_id] = (acc[a.drive_id] || 0) + 1;
            return acc;
        }, {});

        const result = drivesRes.rows.map(d => ({
            ...d,
            application_count: appsCountMap[d.id] || 0
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch drives', message: err.message });
    }
};

// Get eligible drives for a student
const getEligibleDrives = async (req, res) => {
    try {
        const studentId = req.user.id;
        const profileResult = await db.query('SELECT * FROM profiles WHERE user_id = $1', [studentId]);
        const profile = profileResult.rows[0] || { skills: [], cgpa: 0, backlogs: 0, branch: '', passing_year: 0 };

        // Fetch all drives and applications separately because mock DB JOINs are limited
        const drivesRes = await db.query('SELECT * FROM drives');
        const appsRes = await db.query('SELECT * FROM applications');

        const myApps = appsRes.rows.filter(a => a.student_id == studentId);
        const studentSkills = profile.skills || [];

        const enrichedDrives = drivesRes.rows.map(drive => {
            const reasons = [];
            let isEligible = true;

            // Manual case-insensitive branch check
            const studentBranch = (profile.branch || '').toLowerCase();
            const allowedBranches = (drive.allowed_branches || []).map(b => b.toLowerCase());

            if (drive.min_cgpa && (profile.cgpa || 0) < drive.min_cgpa) {
                isEligible = false;
                reasons.push(`Min CGPA: ${drive.min_cgpa}`);
            }
            if (drive.max_backlogs !== null && (profile.backlogs || 0) > drive.max_backlogs) {
                isEligible = false;
                reasons.push(`Max backlogs: ${drive.max_backlogs}`);
            }
            if (drive.passing_year && drive.passing_year !== 0 && profile.passing_year !== drive.passing_year) {
                isEligible = false;
                reasons.push(`Batch: ${drive.passing_year}`);
            }
            if (allowedBranches.length > 0 && !allowedBranches.includes(studentBranch)) {
                isEligible = false;
                reasons.push(`Branches: ${drive.allowed_branches.join(', ')}`);
            }

            // Match Score Calculation
            const required = drive.required_skills || [];
            let match_score = 100;
            if (required.length > 0) {
                const matched = required.filter(rs =>
                    studentSkills.some(ss => ss.toLowerCase().includes(rs.toLowerCase()) || rs.toLowerCase().includes(ss.toLowerCase()))
                );
                match_score = Math.round((matched.length / required.length) * 100);
            }

            return {
                ...drive,
                is_eligible: isEligible,
                already_applied: myApps.some(a => a.drive_id == drive.id),
                reasons,
                match_score
            };
        });

        // Filter out inactive drives if any (though based on db.json we handle it here)
        res.json(enrichedDrives.filter(d => d.is_active !== false));
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch drives', message: err.message });
    }
};

// Get single drive
const getDriveById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT * FROM drives WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Drive not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch drive', message: err.message });
    }
};

// Create drive (TPO only)
const createDrive = async (req, res) => {
    try {
        const { company_name, job_role, job_description, package_lpa, min_cgpa, max_backlogs, allowed_branches, passing_year, required_skills, drive_date, location, rounds } = req.body;
        if (!company_name || !job_role) return res.status(400).json({ error: 'Company name and job role are required' });

        const result = await db.query(`
      INSERT INTO drives (company_name, job_role, job_description, package_lpa, min_cgpa, max_backlogs, allowed_branches, passing_year, required_skills, drive_date, location, rounds, created_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *
    `, [company_name, job_role, job_description, package_lpa, min_cgpa, max_backlogs, allowed_branches || [], passing_year, required_skills || [], drive_date, location, rounds || [], req.user.id]);

        const drive = result.rows[0];

        // Automate notifications for eligible students
        await sendDriveNotifications(drive);

        const eligibleCount = await getEligibleCount(drive);
        res.status(201).json({ drive, eligible_count: eligibleCount });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create drive', message: err.message });
    }
};

const sendDriveNotifications = async (drive) => {
    try {
        const eligible = await db.query(`
            SELECT u.id FROM users u
            JOIN profiles p ON p.user_id = u.id
            WHERE u.role = 'student'
              AND ($1::numeric IS NULL OR p.cgpa >= $1)
              AND ($2::int IS NULL OR p.backlogs <= $2)
              AND ($3::int IS NULL OR $3 = 0 OR p.passing_year = $3)
              AND ($4::text[] IS NULL OR array_length($4::text[], 1) = 0 OR p.branch = ANY($4::text[]))
        `, [drive.min_cgpa, drive.max_backlogs, drive.passing_year, drive.allowed_branches]);

        const notifPromises = eligible.rows.map(student =>
            db.query(
                'INSERT INTO notifications (user_id, title, message, type) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING',
                [student.id, `New Drive: ${drive.company_name}`, `${drive.company_name} is hiring for ${drive.job_role}. Check your eligible drives now!`, 'drive']
            )
        );
        await Promise.all(notifPromises);
        return eligible.rows.length;
    } catch (err) {
        console.error('Notification Error:', err);
        return 0;
    }
};

// Helper: count eligible students for a drive
const getEligibleCount = async (drive) => {
    try {
        const result = await db.query(`
      SELECT COUNT(*) FROM users u
      JOIN profiles p ON p.user_id = u.id
      WHERE u.role = 'student'
        AND ($1::numeric IS NULL OR p.cgpa IS NULL OR p.cgpa >= $1)
        AND ($2::int IS NULL OR p.backlogs IS NULL OR p.backlogs <= $2)
        AND ($3::int IS NULL OR $3 = 0 OR p.passing_year = $3)
        AND ($4::text[] IS NULL OR array_length($4::text[], 1) = 0 OR p.branch = ANY($4::text[]))
    `, [drive.min_cgpa, drive.max_backlogs, drive.passing_year, drive.allowed_branches]);
        return parseInt(result.rows[0].count);
    } catch (err) {
        return 0;
    }
};

// Preview eligible count (live, before drive creation)
const previewEligible = async (req, res) => {
    try {
        const { min_cgpa, max_backlogs, allowed_branches, passing_year } = req.body;
        const count = await getEligibleCount({ min_cgpa, max_backlogs, allowed_branches, passing_year });
        res.json({ eligible_count: count });
    } catch (err) {
        res.status(500).json({ error: 'Failed to preview eligibility', message: err.message });
    }
};

// Update drive
const updateDrive = async (req, res) => {
    try {
        const { id } = req.params;
        const { company_name, job_role, job_description, package_lpa, min_cgpa, max_backlogs, allowed_branches, passing_year, required_skills, drive_date, location, rounds, is_active } = req.body;
        const result = await db.query(`
      UPDATE drives SET company_name=$1, job_role=$2, job_description=$3, package_lpa=$4,
      min_cgpa=$5, max_backlogs=$6, allowed_branches=$7, passing_year=$8,
      required_skills=$9, drive_date=$10, location=$11, rounds=$12, is_active=$13, updated_at=NOW()
      WHERE id=$14 RETURNING *
    `, [company_name, job_role, job_description, package_lpa, min_cgpa, max_backlogs, allowed_branches, passing_year, required_skills, drive_date, location, rounds, is_active, id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Drive not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update drive', message: err.message });
    }
};

// Delete drive
const deleteDrive = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM drives WHERE id = $1', [id]);
        res.json({ message: 'Drive deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete drive', message: err.message });
    }
};

// Notify eligible students
const notifyEligible = async (req, res) => {
    try {
        const { id } = req.params;
        const drive = await db.query('SELECT * FROM drives WHERE id = $1', [id]);
        if (drive.rows.length === 0) return res.status(404).json({ error: 'Drive not found' });

        const count = await sendDriveNotifications(drive.rows[0]);
        res.json({ message: `Notified ${count} eligible students`, count });
    } catch (err) {
        res.status(500).json({ error: 'Failed to notify students', message: err.message });
    }
};

const getUnappliedEligibleCount = async (req, res) => {
    try {
        const studentId = req.user.id;
        const profileResult = await db.query('SELECT * FROM profiles WHERE user_id = $1', [studentId]);
        const profile = profileResult.rows[0] || { skills: [], cgpa: 0, backlogs: 0, branch: '', passing_year: 0 };

        const drivesRes = await db.query('SELECT * FROM drives');
        const appsRes = await db.query('SELECT * FROM applications');

        const myApps = appsRes.rows.filter(a => a.student_id == studentId);
        const studentBranch = (profile.branch || '').toLowerCase();

        // Filter by eligibility and not applied
        const eligibleCount = drivesRes.rows.filter(drive => {
            if (drive.is_active === false) return false;
            if (myApps.some(a => a.drive_id == drive.id)) return false;

            const allowedBranches = (drive.allowed_branches || []).map(b => b.toLowerCase());

            if (drive.min_cgpa && (profile.cgpa || 0) < drive.min_cgpa) return false;
            if (drive.max_backlogs !== null && (profile.backlogs || 0) > drive.max_backlogs) return false;
            if (drive.passing_year && drive.passing_year !== 0 && profile.passing_year !== drive.passing_year) return false;
            if (allowedBranches.length > 0 && !allowedBranches.includes(studentBranch)) return false;
            return true;
        }).length;

        res.json({ count: eligibleCount });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch eligibility count', message: err.message });
    }
};

module.exports = { getAllDrives, getEligibleDrives, getDriveById, createDrive, updateDrive, deleteDrive, notifyEligible, previewEligible, getUnappliedEligibleCount };
