-- PlacementPro Seed Data
-- Run AFTER schema.sql: psql -U postgres -d placementpro -f seed.sql

-- Password for all users: 'password123' (bcrypt hash)
INSERT INTO users (name, email, password, role) VALUES
('Dr. Rajesh Kumar', 'tpo@college.edu', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGPMkOX.7Y5K2G3z1tQxJQJ9mFm', 'tpo'),
('Student Account 1', 'arjun@student.edu', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGPMkOX.7Y5K2G3z1tQxJQJ9mFm', 'student'),
('Student Account 2', 'priya@student.edu', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGPMkOX.7Y5K2G3z1tQxJQJ9mFm', 'student'),
('Student Account 3', 'rohit@student.edu', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGPMkOX.7Y5K2G3z1tQxJQJ9mFm', 'student'),
('Sneha Gupta', 'sneha@alumni.edu', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGPMkOX.7Y5K2G3z1tQxJQJ9mFm', 'alumni'),
('Vikram Singh', 'vikram@alumni.edu', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGPMkOX.7Y5K2G3z1tQxJQJ9mFm', 'alumni')
ON CONFLICT (email) DO NOTHING;

-- Profiles (Only for TPO and Alumni initially, students start empty)
INSERT INTO profiles (user_id, company, graduation_year, bio, linkedin)
SELECT id, 'Google', 2022, 'Software Engineer at Google with 3 years experience in backend systems.', 'linkedin.com/in/snehagupta'
FROM users WHERE email='sneha@alumni.edu'
ON CONFLICT DO NOTHING;

INSERT INTO profiles (user_id, company, graduation_year, bio, linkedin)
SELECT id, 'Google', 2022, 'Software Engineer at Google with 3 years experience in backend systems.', 'linkedin.com/in/snehagupta'
FROM users WHERE email='sneha@alumni.edu'
ON CONFLICT DO NOTHING;

INSERT INTO profiles (user_id, company, graduation_year, bio, linkedin)
SELECT id, 'Microsoft', 2021, 'Senior Developer at Microsoft. Love helping students crack placements!', 'linkedin.com/in/vikramsingh'
FROM users WHERE email='vikram@alumni.edu'
ON CONFLICT DO NOTHING;

INSERT INTO profiles (user_id, bio)
SELECT id, 'Training & Placement Officer at NIT College'
FROM users WHERE email='tpo@college.edu'
ON CONFLICT DO NOTHING;

-- Empty student profiles to prevent 404s
INSERT INTO profiles (user_id)
SELECT id FROM users WHERE role='student'
ON CONFLICT DO NOTHING;

-- Drives
INSERT INTO drives (company_name, job_role, job_description, package_lpa, min_cgpa, max_backlogs, allowed_branches, passing_year, required_skills, rounds, drive_date, location, created_by)
SELECT 
  'Google India', 'Software Engineer', 'Work on large-scale distributed systems and innovative products', 45.00, 7.5, 0, ARRAY['Computer Science', 'Information Technology'], 2025, ARRAY['Python', 'DSA', 'System Design', 'SQL'], ARRAY['Aptitude Test', 'Technical Round 1', 'Technical Round 2', 'HR Round'], NOW() + INTERVAL '15 days', 'Mumbai Campus', id
FROM users WHERE email='tpo@college.edu';

INSERT INTO drives (company_name, job_role, job_description, package_lpa, min_cgpa, max_backlogs, allowed_branches, passing_year, required_skills, rounds, drive_date, location, created_by)
SELECT
  'TCS', 'Systems Engineer', 'Develop and maintain enterprise software solutions', 7.50, 6.0, 2, ARRAY['Computer Science', 'Electronics', 'Information Technology'], 2025, ARRAY['Java', 'SQL', 'OOP'], ARRAY['Aptitude Test', 'Technical Interview', 'HR Round'], NOW() + INTERVAL '10 days', 'Pune Campus', id
FROM users WHERE email='tpo@college.edu';

INSERT INTO drives (company_name, job_role, job_description, package_lpa, min_cgpa, max_backlogs, allowed_branches, passing_year, required_skills, rounds, drive_date, location, created_by)
SELECT
  'Infosys', 'Data Analyst', 'Analyze large datasets and create actionable insights', 12.00, 7.0, 1, ARRAY['Computer Science', 'Information Technology'], 2025, ARRAY['Python', 'SQL', 'PowerBI', 'Statistics'], ARRAY['Online Test', 'Case Study Round', 'HR Round'], NOW() + INTERVAL '20 days', 'Bangalore Campus', id
FROM users WHERE email='tpo@college.edu';

-- Sample Applications
INSERT INTO applications (drive_id, student_id, status)
SELECT d.id, u.id, 'Applied'
FROM drives d, users u
WHERE d.company_name='TCS' AND u.email='arjun@student.edu'
ON CONFLICT DO NOTHING;

INSERT INTO applications (drive_id, student_id, status)
SELECT d.id, u.id, 'Aptitude'
FROM drives d, users u
WHERE d.company_name='TCS' AND u.email='priya@student.edu'
ON CONFLICT DO NOTHING;

INSERT INTO applications (drive_id, student_id, status)
SELECT d.id, u.id, 'Selected'
FROM drives d, users u
WHERE d.company_name='TCS' AND u.email='rohit@student.edu'
ON CONFLICT DO NOTHING;

-- Alumni Posts
INSERT INTO alumni_posts (alumni_id, title, description, company, job_role, skills_required, apply_link)
SELECT id, 'Google SWE Referral - 2025 Batch', 'I can refer strong candidates for SWE roles at Google Bangalore office. Must have solid DSA and system design knowledge.', 'Google', 'Software Engineer', ARRAY['DSA', 'System Design', 'Python/Java'], 'https://careers.google.com'
FROM users WHERE email='sneha@alumni.edu';

INSERT INTO alumni_posts (alumni_id, title, description, company, job_role, skills_required, apply_link)
SELECT id, 'Microsoft Azure Internship Opens', 'Microsoft Azure team has openings for fresh graduates. Strong cloud and C# skills preferred.', 'Microsoft', 'Cloud Engineer', ARRAY['Azure', 'C#', 'Python', 'REST APIs'], 'https://careers.microsoft.com'
FROM users WHERE email='vikram@alumni.edu';

-- Mentorship Slots
INSERT INTO mentorship_bookings (alumni_id, slot_date, duration_minutes, topic, meeting_link)
SELECT id, NOW() + INTERVAL '5 days', 60, 'Resume Review & Interview Prep', 'https://meet.google.com/abc-defg-hij'
FROM users WHERE email='sneha@alumni.edu';

INSERT INTO mentorship_bookings (alumni_id, slot_date, duration_minutes, topic, meeting_link)
SELECT id, NOW() + INTERVAL '7 days', 45, 'DSA Problem Solving Session', 'https://meet.google.com/xyz-uvwx-yz'
FROM users WHERE email='vikram@alumni.edu';

-- FAQ Entries for PlacementBot
INSERT INTO faq_entries (category, question, answer, priority) VALUES
('Campus', 'venue', 'All interview venues will be announced via notifications. Please check the Interview Schedule section for your specific slot and location details.', 5),
('Policy', 'dress code', 'Business formal attire (formals) is recommended for all interviews. First impressions matter!', 4),
('Docs', 'documents', 'Bring: College ID, Resume (2 copies), Aadhar/PAN, 10th and 12th marksheets, degree certificate/provisional degree, and passport-size photos.', 5),
('Process', 'registration', 'Registration is automatic when you apply to a drive from the Eligible Drives section. No separate registration needed.', 4),
('Offer', 'offer letter', 'Offer letters are distributed within 2-3 weeks of final selection. Contact TPO if delayed beyond 4 weeks.', 3),
('Internship', 'internship', 'Check the Alumni Portal → Referrals section for internship opportunities posted by our alumni network.', 3),
('Prep', 'aptitude', 'Aptitude tests include quantitative aptitude, logical reasoning, and verbal ability. Practice on platforms like IndiaBix and PrepInsta.', 4),
('Results', 'result', 'Interview results are updated within 24-48 hours. You will receive a notification and can check your Application Tracker.', 5),
('PPO', 'ppo', 'Pre-Placement Offers (PPOs) are opportunities given by companies where you completed internships. Contact TPO to register your PPO.', 3),
('Eligibility', 'backlog', 'Companies specify their maximum backlog limit in the drive details. Students with backlogs exceeding the limit are automatically filtered during eligibility check.', 5)
ON CONFLICT (question) DO NOTHING;

-- Skill Analytics (sample placed student skills for skill gap engine)
INSERT INTO notifications (user_id, title, message, type)
SELECT id, 'Welcome to PlacementPro! 🎓', 'Your account has been set up. Complete your profile to see eligible drives and get personalized skill gap analysis.', 'general'
FROM users WHERE role = 'student';
