const db = require('../db');

// Get all referral posts
const getReferrals = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM alumni_posts');
        const usersRes = await db.query('SELECT * FROM users');
        const profilesRes = await db.query('SELECT * FROM profiles');

        const enriched = result.rows.map(ap => {
            const user = usersRes.rows.find(u => u.id == ap.alumni_id) || {};
            const profile = profilesRes.rows.find(p => p.user_id == ap.alumni_id) || {};
            return {
                ...ap,
                alumni_name: user.name,
                alumni_email: user.email,
                company: profile.company || ap.company
            };
        });
        res.json(enriched.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch referrals', message: err.message });
    }
};

const createReferral = async (req, res) => {
    try {
        const { title, description, company, job_role, skills_required, apply_link, expiry_date } = req.body;
        if (!title || !company) return res.status(400).json({ error: 'Title and company are required' });
        const result = await db.query(
            'INSERT INTO alumni_posts (alumni_id, title, description, company, job_role, skills_required, apply_link, expiry_date) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
            [req.user.id, title, description, company, job_role, skills_required || [], apply_link, expiry_date]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create referral', message: err.message });
    }
};

const updateReferral = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, company, job_role, skills_required, apply_link, expiry_date, is_active } = req.body;
        const result = await db.query(`
      UPDATE alumni_posts SET title=$1, description=$2, company=$3, job_role=$4,
      skills_required=$5, apply_link=$6, expiry_date=$7, is_active=$8, updated_at=NOW()
      WHERE id=$9 AND alumni_id=$10 RETURNING *
    `, [title, description, company, job_role, skills_required, apply_link, expiry_date, is_active, id, req.user.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Post not found or unauthorized' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update referral', message: err.message });
    }
};

const deleteReferral = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM alumni_posts WHERE id=$1 AND alumni_id=$2', [id, req.user.id]);
        res.json({ message: 'Referral post deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete referral', message: err.message });
    }
};

// Mentorship slots
const getMentorshipSlots = async (req, res) => {
    try {
        const { available_only } = req.query;
        const slotsRes = await db.query('SELECT * FROM mentorship_bookings');
        const usersRes = await db.query('SELECT * FROM users');
        const profilesRes = await db.query('SELECT * FROM profiles');

        let slots = slotsRes.rows.map(ms => {
            const mentor = usersRes.rows.find(u => u.id == ms.alumni_id) || {};
            const profile = profilesRes.rows.find(p => p.user_id == ms.alumni_id) || {};
            return {
                ...ms,
                mentor_name: mentor.name,
                mentor_email: mentor.email,
                company: profile.company
            };
        });

        if (available_only === 'true') {
            const now = new Date();
            slots = slots.filter(s => !s.student_id && new Date(s.slot_date) >= now);
        }

        res.json(slots.sort((a, b) => new Date(a.slot_date) - new Date(b.slot_date)));
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch mentorship slots', message: err.message });
    }
};

const createMentorshipSlot = async (req, res) => {
    try {
        const { slot_date, duration_minutes, topic, meeting_link } = req.body;
        if (!slot_date) return res.status(400).json({ error: 'Slot date required' });
        const result = await db.query(
            'INSERT INTO mentorship_bookings (alumni_id, slot_date, duration_minutes, topic, meeting_link) VALUES ($1,$2,$3,$4,$5) RETURNING *',
            [req.user.id, slot_date, duration_minutes || 30, topic, meeting_link]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create slot', message: err.message });
    }
};

const bookMentorshipSlot = async (req, res) => {
    try {
        const { id } = req.params;
        const student_id = req.user.id;

        // Check if already booked
        const slot = await db.query('SELECT * FROM mentorship_bookings WHERE id=$1', [id]);
        if (slot.rows.length === 0) return res.status(404).json({ error: 'Slot not found' });
        if (slot.rows[0].student_id) return res.status(409).json({ error: 'Slot already booked' });

        // Double-booking check for student
        const doubleBook = await db.query(
            'SELECT id FROM mentorship_bookings WHERE student_id=$1 AND slot_date=$2',
            [student_id, slot.rows[0].slot_date]
        );
        if (doubleBook.rows.length > 0) return res.status(409).json({ error: 'You already have a session at this time' });

        const result = await db.query(
            'UPDATE mentorship_bookings SET student_id=$1, updated_at=NOW() WHERE id=$2 RETURNING *',
            [student_id, id]
        );

        // Notify alumni
        await db.query(
            'INSERT INTO notifications (user_id, title, message, type) VALUES ($1,$2,$3,$4)',
            [slot.rows[0].alumni_id, 'Mentorship Booked', `A student has booked your mentorship slot on ${new Date(slot.rows[0].slot_date).toLocaleString()}`, 'mentorship']
        );

        res.json({ message: 'Slot booked successfully', slot: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to book slot', message: err.message });
    }
};

const getMyMentorshipSlots = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;

        const slotsRes = await db.query('SELECT * FROM mentorship_bookings');
        const usersRes = await db.query('SELECT * FROM users');
        const profilesRes = await db.query('SELECT * FROM profiles');

        const col = role === 'alumni' ? 'alumni_id' : 'student_id';
        const mySlots = slotsRes.rows.filter(ms => ms[col] == userId);

        const enriched = mySlots.map(ms => {
            const otherId = role === 'alumni' ? ms.student_id : ms.alumni_id;
            const otherUser = usersRes.rows.find(u => u.id == otherId) || {};
            const otherProfile = profilesRes.rows.find(p => p.user_id == otherId) || {};

            return {
                ...ms,
                other_name: otherUser.name || 'Unbooked',
                other_email: otherUser.email,
                other_branch: otherProfile.branch
            };
        });

        res.json(enriched.sort((a, b) => new Date(a.slot_date) - new Date(b.slot_date)));
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch your slots', message: err.message });
    }
};

const deleteSlot = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM mentorship_bookings WHERE id=$1 AND alumni_id=$2 RETURNING *', [id, req.user.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Slot not found or unauthorized' });
        res.json({ message: 'Mentorship slot deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete slot', message: err.message });
    }
};

module.exports = { getReferrals, createReferral, updateReferral, deleteReferral, getMentorshipSlots, createMentorshipSlot, bookMentorshipSlot, getMyMentorshipSlots, deleteSlot };
