-- PlacementPro Database Schema
-- Run: psql -U postgres -c "CREATE DATABASE placementpro;"
-- Then: psql -U postgres -d placementpro -f schema.sql

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('tpo', 'student', 'alumni')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  -- Student fields
  branch VARCHAR(100),
  cgpa NUMERIC(4,2),
  backlogs INT DEFAULT 0,
  passing_year INT,
  skills TEXT[] DEFAULT '{}',
  bio TEXT,
  -- Alumni fields
  company VARCHAR(255),
  graduation_year INT,
  -- Common
  linkedin VARCHAR(500),
  github VARCHAR(500),
  phone VARCHAR(20),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Drives table
CREATE TABLE IF NOT EXISTS drives (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  job_role VARCHAR(255) NOT NULL,
  job_description TEXT,
  package_lpa NUMERIC(6,2),
  min_cgpa NUMERIC(4,2),
  max_backlogs INT,
  allowed_branches TEXT[] DEFAULT '{}',
  passing_year INT DEFAULT 0,
  required_skills TEXT[] DEFAULT '{}',
  rounds TEXT[] DEFAULT '{}',
  drive_date TIMESTAMP,
  location VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id SERIAL PRIMARY KEY,
  drive_id INT REFERENCES drives(id) ON DELETE CASCADE,
  student_id INT REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'Applied' CHECK (status IN ('Applied', 'Aptitude', 'Cleared', 'Interview Scheduled', 'Selected', 'Rejected')),
  notes TEXT,
  applied_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(drive_id, student_id)
);

-- Interview slots
CREATE TABLE IF NOT EXISTS interview_slots (
  id SERIAL PRIMARY KEY,
  drive_id INT REFERENCES drives(id) ON DELETE CASCADE,
  student_id INT REFERENCES users(id) ON DELETE SET NULL,
  slot_start TIMESTAMP NOT NULL,
  slot_end TIMESTAMP NOT NULL,
  location VARCHAR(255),
  round_name VARCHAR(100) DEFAULT 'Technical Round',
  interviewer VARCHAR(255),
  status VARCHAR(50) DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Cancelled', 'Rescheduled')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'general' CHECK (type IN ('drive', 'status', 'interview', 'mentorship', 'general')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Alumni posts / referrals
CREATE TABLE IF NOT EXISTS alumni_posts (
  id SERIAL PRIMARY KEY,
  alumni_id INT REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  company VARCHAR(255) NOT NULL,
  job_role VARCHAR(255),
  skills_required TEXT[] DEFAULT '{}',
  apply_link TEXT,
  expiry_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Mentorship bookings
CREATE TABLE IF NOT EXISTS mentorship_bookings (
  id SERIAL PRIMARY KEY,
  alumni_id INT REFERENCES users(id) ON DELETE CASCADE,
  student_id INT REFERENCES users(id) ON DELETE SET NULL,
  slot_date TIMESTAMP NOT NULL,
  duration_minutes INT DEFAULT 30,
  topic VARCHAR(255),
  meeting_link TEXT,
  status VARCHAR(50) DEFAULT 'Available' CHECK (status IN ('Available', 'Booked', 'Completed', 'Cancelled')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Resume versions
CREATE TABLE IF NOT EXISTS resume_versions (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  filename VARCHAR(500) NOT NULL,
  file_path TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Chat logs
CREATE TABLE IF NOT EXISTS chat_logs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  response TEXT,
  escalated BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- FAQ entries for PlacementBot
CREATE TABLE IF NOT EXISTS faq_entries (
  id SERIAL PRIMARY KEY,
  category VARCHAR(100) DEFAULT 'General',
  question VARCHAR(255) NOT NULL UNIQUE,
  answer TEXT NOT NULL,
  priority INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_applications_student ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_drive ON applications(drive_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_interview_slots_drive ON interview_slots(drive_id);
CREATE INDEX IF NOT EXISTS idx_chat_logs_user ON chat_logs(user_id);
