const db = require('../db');
const fs = require('fs');
const path = require('path');

// Read the raw JSON directly (avoids mock SQL limitations)
const readRawDB = () => {
    try {
        const dbPath = path.join(__dirname, '../../db.json');
        const data = fs.readFileSync(dbPath, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return { drives: [], profiles: [], users: [] };
    }
};

// Skill gap analysis for a student
const getSkillGap = async (req, res) => {
    try {
        const student_id = req.user.id;
        const { target_role } = req.query;

        // 1. Fetch student skills from profile (mock DB)
        const profileResult = await db.query('SELECT skills FROM profiles WHERE user_id=$1', [student_id]);
        const studentSkills = profileResult.rows[0]?.skills || [];

        // 2. Map of common roles to required skills (industry standard)
        const roleFallbacks = {
            'frontend': ['JavaScript', 'React', 'CSS3', 'HTML5', 'TypeScript', 'Redux', 'Responsive Design'],
            'backend': ['Node.js', 'Express', 'SQL', 'PostgreSQL', 'REST APIs', 'Docker', 'System Design'],
            'fullstack': ['JavaScript', 'React', 'Node.js', 'SQL', 'Git', 'Cloud Basics'],
            'data science': ['Python', 'Statistics', 'Machine Learning', 'Pandas', 'SQL', 'Data Visualization'],
            'devops': ['Docker', 'Kubernetes', 'AWS', 'Linux', 'CI/CD', 'Terraform'],
            'cloud': ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Linux', 'Python', 'Networking'],
            'cloud engineer': ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Linux', 'Python', 'Networking'],
            'software engineer': ['DSA', 'Java', 'Python', 'Git', 'DBMS', 'OOP', 'System Design'],
            'android': ['Java', 'Kotlin', 'Android SDK', 'XML', 'REST APIs', 'Firebase', 'Git'],
            'android developer': ['Java', 'Kotlin', 'Android SDK', 'XML', 'REST APIs', 'Firebase', 'Git'],
            'iot': ['C', 'Python', 'Linux', 'MQTT', 'Arduino', 'Raspberry Pi', 'Networking'],
            'embedded': ['C', 'C++', 'Linux', 'RTOS', 'Microcontrollers', 'Serial Protocols'],
            'product manager': ['Agile', 'User Research', 'Strategy', 'Analytics', 'Wireframing'],
            'ml': ['Python', 'TensorFlow', 'Scikit-learn', 'Mathematics', 'SQL', 'Data Analysis'],
            'machine learning': ['Python', 'TensorFlow', 'Scikit-learn', 'Mathematics', 'SQL'],
            'cybersecurity': ['Linux', 'Networking', 'Python', 'Ethical Hacking', 'Cryptography', 'Firewalls'],
            'java developer': ['Java', 'Spring Boot', 'SQL', 'OOP', 'Maven', 'REST APIs', 'Git'],
            'python developer': ['Python', 'Django/Flask', 'SQL', 'Git', 'REST APIs', 'Linux'],
        };

        // 3. Find matching role
        let requiredSkills = [];
        const normalizedTarget = (target_role || '').toLowerCase().trim();

        // First: try exact or partial match in hardcoded map
        const roleKey = Object.keys(roleFallbacks).find(k =>
            normalizedTarget.includes(k) || k.includes(normalizedTarget)
        );
        if (roleKey) {
            requiredSkills = roleFallbacks[roleKey];
        }

        // Second: search actual drives in db.json directly (bypassing broken UNNEST SQL)
        if (requiredSkills.length === 0) {
            const rawDB = readRawDB();
            const matchingDrives = (rawDB.drives || []).filter(d =>
                d.job_role && (
                    d.job_role.toLowerCase().includes(normalizedTarget) ||
                    normalizedTarget.includes(d.job_role.toLowerCase()) ||
                    (d.company_name && d.company_name.toLowerCase() === normalizedTarget)
                ) && (d.is_active !== false)
            );

            if (matchingDrives.length > 0) {
                // Collect all required_skills from matching drives (flatten & deduplicate)
                const allSkills = matchingDrives.flatMap(d => d.required_skills || []);
                requiredSkills = [...new Set(allSkills.map(s => s.trim()).filter(Boolean))];
            }
        }

        // Third: fallback to software engineer
        if (requiredSkills.length === 0) {
            requiredSkills = roleFallbacks['software engineer'];
        }

        // 4. Enhanced skill matching (case-insensitive, partial, alias-aware)
        const skillAliases = {
            'js': ['javascript'],
            'javascript': ['js'],
            'c': ['programming in c', 'c language', 'c programming'],
            'c++': ['cpp', 'c plus plus'],
            'python': ['python3', 'python2', 'py'],
            'java': ['java programming', 'core java', 'java se'],
            'node': ['node.js', 'nodejs'],
            'node.js': ['node', 'nodejs'],
            'sql': ['mysql', 'postgresql', 'sqlite', 'database management', 'dbms', 'rdbms'],
            'linux': ['unix', 'bash', 'shell scripting'],
            'docker': ['containerization'],
            'aws': ['amazon web services', 'cloud', 'cloud computing'],
            'android': ['android sdk', 'android development', 'android studio'],
            'ml': ['machine learning'],
            'ai': ['artificial intelligence'],
            'dsa': ['data structures', 'algorithms', 'data structures and algorithms'],
            'oop': ['object oriented programming', 'object-oriented'],
            'git': ['github', 'version control', 'gitlab'],
        };

        const normalizedStudent = studentSkills.map(s => s.toLowerCase().trim());

        const isMatch = (studentSkill, requiredSkill) => {
            const req = requiredSkill.toLowerCase().trim();
            const stu = studentSkill.toLowerCase().trim();

            // Direct match
            if (stu === req) return true;
            // Partial containment (student skill IN required or required IN student skill)
            if (req.includes(stu) || stu.includes(req)) return true;
            // Check aliases
            const stuAliases = skillAliases[stu] || [];
            if (stuAliases.some(alias => alias === req || req.includes(alias) || alias.includes(req))) return true;
            // Reverse alias lookup
            const reqAliases = skillAliases[req] || [];
            if (reqAliases.some(alias => alias === stu || stu.includes(alias) || alias.includes(stu))) return true;
            return false;
        };

        const matched = [];
        const missing = [];

        requiredSkills.forEach(reqSkill => {
            const found = normalizedStudent.some(stuSkill => isMatch(stuSkill, reqSkill));
            if (found) matched.push(reqSkill);
            else missing.push(reqSkill);
        });

        // 5. Match percentage
        const matchPercent = requiredSkills.length > 0
            ? Math.min(100, Math.round((matched.length / requiredSkills.length) * 100))
            : 0;

        // 6. Learning recommendations
        const learningCatalog = {
            'sql': { course: 'Complete SQL Bootcamp', duration: '2-3 weeks', platform: 'Udemy' },
            'react': { course: 'Modern React with Redux', duration: '4-5 weeks', platform: 'Udemy' },
            'node.js': { course: 'Node.js Developer Course', duration: '4 weeks', platform: 'Coursera' },
            'python': { course: 'Scientific Computing with Python', duration: '3 weeks', platform: 'freeCodeCamp' },
            'machine learning': { course: 'ML Specialization by Andrew Ng', duration: '8 weeks', platform: 'Coursera' },
            'docker': { course: 'Docker & Kubernetes: Practical Guide', duration: '3 weeks', platform: 'Udemy' },
            'aws': { course: 'AWS Cloud Practitioner', duration: '4 weeks', platform: 'A Cloud Guru' },
            'azure': { course: 'AZ-900: Azure Fundamentals', duration: '3 weeks', platform: 'Microsoft Learn' },
            'gcp': { course: 'Google Cloud Fundamentals', duration: '3 weeks', platform: 'Google Cloud' },
            'dsa': { course: 'DSA Masterclass', duration: '6-8 weeks', platform: 'Sorting Academy' },
            'system design': { course: 'System Design Interview', duration: '2 weeks', platform: 'Educative' },
            'javascript': { course: 'Modern JavaScript', duration: '3 weeks', platform: 'Frontend Masters' },
            'typescript': { course: 'TypeScript Masterclass', duration: '2 weeks', platform: 'Udemy' },
            'git': { course: 'Git & GitHub Strategy', duration: '1 week', platform: 'GitHub Learning' },
            'java': { course: 'Java Masterclass', duration: '5 weeks', platform: 'Udemy' },
            'c': { course: 'C Programming – Beginner to Expert', duration: '3 weeks', platform: 'Udemy' },
            'c++': { course: 'C++ Fundamentals including C++17', duration: '4 weeks', platform: 'Pluralsight' },
            'kotlin': { course: 'Android Development with Kotlin', duration: '5 weeks', platform: 'Udacity' },
            'android sdk': { course: 'Android App Development Bootcamp', duration: '6 weeks', platform: 'Udemy' },
            'linux': { course: 'Linux Command Line Basics', duration: '2 weeks', platform: 'Coursera' },
            'kubernetes': { course: 'Kubernetes for Beginners', duration: '3 weeks', platform: 'KodeKloud' },
            'networking': { course: 'Computer Networking – Top-Down Approach', duration: '4 weeks', platform: 'Coursera' },
            'rest apis': { course: 'REST API Design & Development', duration: '2 weeks', platform: 'Pluralsight' },
            'iot': { course: 'IoT with Arduino and Raspberry Pi', duration: '4 weeks', platform: 'Coursera' },
            'cloud': { course: 'AWS Cloud Practitioner Essentials', duration: '4 weeks', platform: 'A Cloud Guru' },
        };

        const recommendations = missing.map(skill => {
            const skillLower = skill.toLowerCase();
            const key = Object.keys(learningCatalog).find(k =>
                skillLower.includes(k) || k.includes(skillLower)
            );
            return key
                ? { skill, ...learningCatalog[key] }
                : { skill, course: `Master ${skill}`, duration: '3-4 weeks', platform: 'Coursera / Udemy' };
        });

        res.json({
            student_skills: studentSkills,
            required_skills: requiredSkills,
            matched_skills: matched,
            missing_skills: missing,
            match_percentage: matchPercent,
            recommendations,
            target_role: target_role || 'General SDE'
        });

    } catch (err) {
        console.error('Skill Gap Error:', err);
        res.status(500).json({ error: 'Skill gap analysis failed', message: err.message });
    }
};

// Placement statistics
const getPlacementStats = async (req, res) => {
    try {
        const rawDB = readRawDB();
        const students = (rawDB.users || []).filter(u => u.role === 'student');
        const apps = rawDB.applications || [];
        const drives = rawDB.drives || [];
        const profiles = rawDB.profiles || [];

        const placed = [...new Set(apps.filter(a => a.status === 'Selected').map(a => a.student_id))];

        const byBranch = {};
        placed.forEach(sid => {
            const p = profiles.find(pr => pr.user_id === sid);
            if (p?.branch) byBranch[p.branch] = (byBranch[p.branch] || 0) + 1;
        });

        res.json({
            total_students: students.length,
            placed_students: placed.length,
            total_drives: drives.length,
            placement_rate: students.length > 0 ? Math.round((placed.length / students.length) * 100) : 0,
            by_branch: Object.entries(byBranch).map(([branch, placed_count]) => ({ branch, placed_count })),
            top_companies: [],
            skill_distribution: []
        });
    } catch (err) {
        console.error('Analytics Error [getPlacementStats]:', err);
        res.status(500).json({ error: 'Failed to get stats', message: err.message });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        const rawDB = readRawDB();
        const students = (rawDB.users || []).filter(u => u.role === 'student');
        const drives = rawDB.drives || [];
        const apps = rawDB.applications || [];

        const activeDrives = drives.filter(d => d.is_active !== false);
        const placed = [...new Set(apps.filter(a => a.status === 'Selected').map(a => a.student_id))];
        const maxPkg = drives.reduce((max, d) => Math.max(max, d.package_lpa || 0), 0);

        res.json({
            total_students: students.length,
            active_drives: activeDrives.length,
            placed_students: placed.length,
            highest_package: maxPkg,
            drives_by_type: {},
            salary_brackets: {}
        });
    } catch (err) {
        console.error('Dashboard Stats Error:', err);
        res.status(500).json({ error: 'Failed to get dashboard stats', message: err.message });
    }
};

module.exports = { getSkillGap, getPlacementStats, getDashboardStats };
