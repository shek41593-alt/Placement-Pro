const db = require('../db');

const chat = async (req, res) => {
    try {
        const { message } = req.body;
        const user_id = req.user.id;
        if (!message) return res.status(400).json({ error: 'Message is required' });

        const lower = message.toLowerCase().trim();
        let response = null;
        let escalated = false;

        // Check FAQ database first
        const faqResult = await db.query(
            'SELECT answer FROM faq_entries WHERE LOWER($1) LIKE \'%\' || LOWER(question) || \'%\' ORDER BY priority DESC LIMIT 1',
            [lower]
        );

        if (faqResult.rows.length > 0) {
            response = faqResult.rows[0].answer;
        } else {
            // Rule-based intent classification
            if (/cgpa|cutoff|minimum cgpa|gpa/i.test(lower)) {
                const drives = await db.query('SELECT company_name, min_cgpa FROM drives WHERE is_active=true AND min_cgpa IS NOT NULL ORDER BY created_at DESC LIMIT 3');
                if (drives.rows.length > 0) {
                    const list = drives.rows.map(d => `${d.company_name}: ${d.min_cgpa}`).join(', ');
                    response = `Current active drive CGPA cutoffs: ${list}`;
                } else {
                    response = 'No active drives with CGPA cutoff currently. Please check the Drives section.';
                }
            } else if (/interview|when is|schedule|slot/i.test(lower)) {
                if (user_id) {
                    const slots = await db.query(
                        'SELECT i.slot_start, i.round_name, d.company_name FROM interview_slots i JOIN drives d ON i.drive_id=d.id WHERE i.student_id=$1 AND i.slot_start >= NOW() ORDER BY i.slot_start ASC LIMIT 3',
                        [user_id]
                    );
                    if (slots.rows.length > 0) {
                        const list = slots.rows.map(s => `${s.company_name} - ${s.round_name}: ${new Date(s.slot_start).toLocaleString()}`).join('\n');
                        response = `Your upcoming interviews:\n${list}`;
                    } else {
                        response = 'You have no upcoming interview slots scheduled. Check the Interview Schedule section.';
                    }
                }
            } else if (/drive|drives|companies|which companies/i.test(lower)) {
                const drives = await db.query('SELECT company_name, job_role, package_lpa FROM drives WHERE is_active=true ORDER BY created_at DESC LIMIT 5');
                if (drives.rows.length > 0) {
                    const list = drives.rows.map(d => `${d.company_name} (${d.job_role}) - ₹${d.package_lpa || 'TBD'} LPA`).join('\n');
                    response = `Active drives:\n${list}`;
                } else {
                    response = 'No active drives at the moment. Please check back later!';
                }
            } else if (/apply|how to apply|application/i.test(lower)) {
                response = 'To apply: Go to "Eligible Drives" from your dashboard → Click on a drive → Click "Apply Now". Make sure your profile is complete with CGPA, branch, and backlogs.';
            } else if (/resume|cv/i.test(lower)) {
                response = 'Use the Resume Wizard from your dashboard to build a professional ATS-friendly resume. Go to Student Dashboard → Resume Wizard → Fill in your details → Download PDF.';
            } else if (/backlog|arrear/i.test(lower)) {
                response = 'Backlog limits vary per company. Check each drive\'s details in the Eligible Drives section for the maximum allowed backlogs.';
            } else if (/skill|learn|course/i.test(lower)) {
                response = 'Check the Skill Gap Analysis page under Analytics for personalized skill recommendations and course suggestions based on placement data.';
            } else if (/contact|tpo|help|human|agent/i.test(lower)) {
                escalated = true;
                response = 'Connecting you to the TPO team. Your query has been noted and will be addressed shortly. Please also check the notice board for announcements.';
            } else {
                response = "I'm not sure I understand that query. Try asking about: drives, CGPA cutoff, interview schedule, resume, skill gap, or how to apply. You can also contact the TPO directly.";
            }
        }

        // Log chat
        await db.query(
            'INSERT INTO chat_logs (user_id, message, response, escalated) VALUES ($1,$2,$3,$4)',
            [user_id, message, response, escalated]
        );

        res.json({ message: response, escalated, timestamp: new Date().toISOString() });
    } catch (err) {
        res.status(500).json({ error: 'Bot error', message: err.message });
    }
};

const getChatHistory = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM chat_logs WHERE user_id=$1 ORDER BY created_at ASC LIMIT 50',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch chat history', message: err.message });
    }
};

const getFAQs = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM faq_entries ORDER BY priority DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch FAQs', message: err.message });
    }
};

const addFAQ = async (req, res) => {
    try {
        const { category, question, answer, priority } = req.body;
        if (!question || !answer) return res.status(400).json({ error: 'Question and answer required' });
        const result = await db.query(
            'INSERT INTO faq_entries (category, question, answer, priority) VALUES ($1,$2,$3,$4) RETURNING *',
            [category || 'General', question, answer, priority || 1]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to add FAQ', message: err.message });
    }
};

const deleteFAQ = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM faq_entries WHERE id=$1', [id]);
        res.json({ message: 'FAQ deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete FAQ', message: err.message });
    }
};

module.exports = { chat, getChatHistory, getFAQs, addFAQ, deleteFAQ };
