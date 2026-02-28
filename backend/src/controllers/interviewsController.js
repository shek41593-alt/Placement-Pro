const db = require('../db');

const getSlots = async (req, res) => {
    try {
        const { drive_id } = req.query;
        const slotsRes = await db.query('SELECT * FROM interview_slots');
        const usersRes = await db.query('SELECT * FROM users');
        const drivesRes = await db.query('SELECT * FROM drives');

        let slots = slotsRes.rows;
        if (drive_id) {
            slots = slots.filter(i => i.drive_id == drive_id);
        }

        const enriched = slots.map(i => {
            const u = usersRes.rows.find(user => user.id == i.student_id) || {};
            const d = drivesRes.rows.find(drive => drive.id == i.drive_id) || {};
            return {
                ...i,
                student_name: u.name,
                student_email: u.email,
                company_name: d.company_name,
                job_role: d.job_role
            };
        });

        res.json(enriched.sort((a, b) => new Date(a.slot_start) - new Date(b.slot_start)));
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch interview slots', message: err.message });
    }
};

const createSlot = async (req, res) => {
    try {
        let { drive_id, student_id, application_id, slot_start, slot_end, location, round_name, interviewer } = req.body;

        // If application_id is provided, derive drive_id and student_id
        if (application_id) {
            const appResult = await db.query('SELECT drive_id, student_id FROM applications WHERE id = $1', [application_id]);
            if (appResult.rows.length === 0) return res.status(404).json({ error: 'Application not found' });
            drive_id = appResult.rows[0].drive_id;
            student_id = appResult.rows[0].student_id;
        }

        if (!drive_id || !slot_start || !slot_end) {
            return res.status(400).json({ error: 'Drive association and time slots are required' });
        }

        // Overlap prevention for same student
        if (student_id) {
            const allSlots = await db.query('SELECT * FROM interview_slots');
            const overlap = allSlots.rows.filter(s =>
                s.student_id == student_id &&
                !(new Date(s.slot_end) <= new Date(slot_start) || new Date(s.slot_start) >= new Date(slot_end))
            );
            if (overlap.length > 0) return res.status(409).json({ error: 'Student already has a slot in this time range' });
        }

        // Overlap prevention for same location
        if (location) {
            const allSlots = await db.query('SELECT * FROM interview_slots');
            const roomOverlap = allSlots.rows.filter(s =>
                s.location == location &&
                !(new Date(s.slot_end) <= new Date(slot_start) || new Date(s.slot_start) >= new Date(slot_end))
            );
            if (roomOverlap.length > 0) return res.status(409).json({ error: 'Location is already booked for this time' });
        }

        const result = await db.query(
            'INSERT INTO interview_slots (drive_id, student_id, slot_start, slot_end, location, round_name, interviewer) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
            [drive_id, student_id || null, slot_start, slot_end, location, round_name || 'Technical Round', interviewer]
        );

        // Notify student
        if (student_id) {
            await db.query(
                'INSERT INTO notifications (user_id, title, message, type) VALUES ($1,$2,$3,$4)',
                [student_id, 'Interview Scheduled', `Your interview for ${round_name || 'Technical Round'} is scheduled on ${new Date(slot_start).toLocaleString()}`, 'interview']
            );

            // Update application status to 'Interview Scheduled' if not already
            if (application_id) {
                await db.query("UPDATE applications SET status='Interview Scheduled', updated_at=NOW() WHERE id=$1 AND status != 'Interview Scheduled'", [application_id]);
            }
        }

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Create Interview Slot Error:', err);
        res.status(500).json({ error: 'Failed to create slot', message: err.message });
    }
};

const updateSlot = async (req, res) => {
    try {
        const { id } = req.params;
        const { slot_start, slot_end, location, status, round_name, interviewer } = req.body;
        const result = await db.query(
            'UPDATE interview_slots SET slot_start=$1, slot_end=$2, location=$3, status=$4, round_name=$5, interviewer=$6, updated_at=NOW() WHERE id=$7 RETURNING *',
            [slot_start, slot_end, location, status || 'Scheduled', round_name, interviewer, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Slot not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update slot', message: err.message });
    }
};

const deleteSlot = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM interview_slots WHERE id=$1', [id]);
        res.json({ message: 'Slot deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete slot', message: err.message });
    }
};

const getMySlots = async (req, res) => {
    try {
        const student_id = req.user.id;
        const slotsRes = await db.query('SELECT * FROM interview_slots');
        const drivesRes = await db.query('SELECT * FROM drives');

        const mySlots = slotsRes.rows.filter(i => i.student_id == student_id);
        const enriched = mySlots.map(i => {
            const d = drivesRes.rows.find(drive => drive.id == i.drive_id) || {};
            return {
                ...i,
                company_name: d.company_name,
                job_role: d.job_role
            };
        });

        res.json(enriched.sort((a, b) => new Date(a.slot_start) - new Date(b.slot_start)));
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch your slots', message: err.message });
    }
};

module.exports = { getSlots, createSlot, updateSlot, deleteSlot, getMySlots };
