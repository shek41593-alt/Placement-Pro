const db = require('../db');

const getMyNotifications = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch notifications', message: err.message });
    }
};

const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('UPDATE notifications SET is_read=true WHERE id=$1 AND user_id=$2', [id, req.user.id]);
        res.json({ message: 'Notification marked as read' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update notification', message: err.message });
    }
};

const markAllAsRead = async (req, res) => {
    try {
        await db.query('UPDATE notifications SET is_read=true WHERE user_id=$1', [req.user.id]);
        res.json({ message: 'All notifications marked as read' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update notifications', message: err.message });
    }
};

const getUnreadCount = async (req, res) => {
    try {
        const result = await db.query('SELECT COUNT(*) FROM notifications WHERE user_id=$1 AND is_read=false', [req.user.id]);
        res.json({ count: parseInt(result.rows[0].count) });
    } catch (err) {
        res.status(500).json({ error: 'Failed to count notifications', message: err.message });
    }
};

const createNotification = async (req, res) => {
    try {
        const { user_id, title, message, type, target_role } = req.body;
        // user_id 0 means broadcast
        if (user_id === 0) {
            let query = "SELECT id FROM users WHERE is_active=true";
            const params = [];

            if (target_role === 'student' || target_role === 'alumni') {
                query += " AND role=$1";
                params.push(target_role);
            } else {
                // 'all' or default: notify students and alumni
                query += " AND role IN ('student', 'alumni')";
            }

            const targets = await db.query(query, params);
            const promises = targets.rows.map(t =>
                db.query(
                    'INSERT INTO notifications (user_id, title, message, type) VALUES ($1,$2,$3,$4)',
                    [t.id, title, message, type || 'alert']
                )
            );
            await Promise.all(promises);

            // Log broadcast history
            await db.query(
                'INSERT INTO broadcasts (title, message, target_role) VALUES ($1, $2, $3)',
                [title, message, target_role || 'all']
            );

            res.status(201).json({ message: `Broadcast sent to ${targets.rows.length} users` });
        } else {
            await db.query(
                'INSERT INTO notifications (user_id, title, message, type) VALUES ($1,$2,$3,$4)',
                [user_id, title, message, type || 'info']
            );
            res.status(201).json({ message: 'Notification created' });
        }
    } catch (err) {
        console.error('Create Notification Error:', err);
        res.status(500).json({ error: 'Failed to create notification', message: err.message });
    }
};

const getBroadcastHistory = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM broadcasts ORDER BY created_at DESC LIMIT 20');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch broadcast history', message: err.message });
    }
};

const purgeNotifications = async (req, res) => {
    try {
        await db.query('DELETE FROM notifications WHERE user_id=$1 AND is_read=true', [req.user.id]);
        res.json({ message: 'Read notifications purged' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to purge notifications', message: err.message });
    }
};

module.exports = { getMyNotifications, markAsRead, markAllAsRead, getUnreadCount, createNotification, getBroadcastHistory, purgeNotifications };
