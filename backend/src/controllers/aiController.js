const db = require('../db');

// AI Career Advisor Controller
const analyzeCareer = async (req, res) => {
    try {
        const student_id = req.user.id;
        const { target_role } = req.body;

        if (!target_role) {
            return res.status(400).json({ error: 'Target role is required for AI analysis' });
        }

        // 1. Fetch student context (Profile & Performance)
        const profileResult = await db.query('SELECT * FROM profiles WHERE user_id=$1', [student_id]);
        const profile = profileResult.rows[0] || {};
        const studentSkills = profile.skills || [];
        const cgpa = parseFloat(profile.cgpa) || 0;

        // 2. Map of "Roadmap Milestones" by difficulty/domain
        const milestones = {
            basic: [
                { title: 'Master DSA Fundamentals', desc: 'Solve 200+ problems on LeetCode/HackerRank focusing on Arrays, Graphs, and DP.', difficulty: 'Medium' },
                { title: 'Project Portfolio', desc: 'Build 2 unique full-stack projects using React and Node.js.', difficulty: 'Medium' }
            ],
            intermediate: {
                frontend: [
                    { title: 'Advanced CSS/UI Architecture', desc: 'Master BEM, PostCSS, and performant animations.', difficulty: 'Medium' },
                    { title: 'State Management Systems', desc: 'Expertise in Redux Toolkit, Context API, or TanStack Query.', difficulty: 'Hard' }
                ],
                backend: [
                    { title: 'System Design Mastery', desc: 'Scalability, Load Balancing, and Sharding concepts.', difficulty: 'Hard' },
                    { title: 'Message Queues', desc: 'Integration with RabbitMQ or Kafka for async processing.', difficulty: 'Hard' }
                ],
                default: [
                    { title: 'Cloud Infrastructure', desc: 'Master AWS/Azure deployment patterns and Serverless functions.', difficulty: 'Hard' }
                ]
            },
            expert: [
                { title: 'Performance Optimization', desc: 'Database indexing strategies and Frontend render cycle optimization.', difficulty: 'Expert' },
                { title: 'CI/CD & DevOps Culture', desc: 'Implement robust pipelines and infrastructure as code.', difficulty: 'Expert' }
            ]
        };

        // 3. Dynamic Logic: Determine Domain
        const lowerRole = target_role.toLowerCase();
        let domain = 'default';
        if (lowerRole.includes('front') || lowerRole.includes('ui') || lowerRole.includes('web')) domain = 'frontend';
        else if (lowerRole.includes('back') || lowerRole.includes('server') || lowerRole.includes('api')) domain = 'backend';

        // 4. Construct Personalized Roadmap
        const roadmap = [
            { step: 1, ...milestones.basic[0] },
            { step: 2, ...milestones.basic[1] },
            { step: 3, ...milestones.intermediate[domain][0] },
            { step: 4, ...(milestones.intermediate[domain][1] || milestones.intermediate.default[0]) },
            { step: 5, ...milestones.expert[0] }
        ];

        // 5. Sophisticated AI Scoring
        // Base score: 50%. Add % for CGPA, skills, etc.
        let baseScore = 40;
        if (cgpa > 8) baseScore += 15;
        else if (cgpa > 6) baseScore += 8;

        const skillBonus = Math.min(40, studentSkills.length * 4);
        const aiScore = baseScore + skillBonus;

        // 6. Generate Summary
        const skillStr = studentSkills.length > 0 ? studentSkills.join(', ') : 'minimal technical exposure';
        const analysis_summary = `Based on your profile (CGPA: ${cgpa || 'N/A'}, Skills: ${skillStr}), our AI indicates you are at the **${cgpa > 8 ? 'Strong' : 'Steady'}** phase. For a **${target_role}** role, the primary mismatch is in advanced ${domain === 'default' ? 'architectural' : domain} domains. Follow the 5-step roadmap to bridge this gap.`;

        res.json({
            target_role,
            ai_match_score: Math.min(95, aiScore),
            direction_path: roadmap,
            analysis_summary,
            career_prospects: cgpa > 7.5 ? 'Very High (Top Tier Companies)' : 'High (Industry Wide)',
            salary_indication: domain === 'frontend' ? '₹6L - ₹18L LPA' : '₹8L - ₹24L LPA'
        });

    } catch (err) {
        console.error('AI Analysis Error:', err);
        res.status(500).json({ error: 'AI Analysis failed', message: err.message });
    }
};

module.exports = { analyzeCareer };
