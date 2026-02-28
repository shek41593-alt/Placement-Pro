const db = require('../db');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const generateResume = async (req, res) => {
    try {
        const { name, email, phone, linkedin, github, objective, cgpa, branch, passing_year, skills, projects, education, certifications, experience } = req.body;

        const uploadsDir = path.join(__dirname, '../../uploads/resumes');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

        const filename = `resume_${req.user.id}_${Date.now()}.pdf`;
        const filepath = path.join(uploadsDir, filename);

        // Standard margins, A4 size
        const doc = new PDFDocument({
            margin: 50,
            size: 'A4',
            info: {
                Title: `${name || 'Student'} Resume`,
                Author: name || 'Student',
                Subject: 'Professional Resume',
                Creator: 'PlacementPro ATS Resume Builder'
            }
        });
        const stream = fs.createWriteStream(filepath);
        doc.pipe(stream);

        // --- Constants for spacing / typography ---
        const PURE_BLACK = '#000000';
        doc.fillColor(PURE_BLACK);

        const headingFont = 'Helvetica-Bold';
        const bodyFont = 'Helvetica';

        // Helper to draw a clean separator line
        const drawSeparator = () => {
            doc.moveDown(0.2);
            doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).strokeColor(PURE_BLACK).lineWidth(1).stroke();
            doc.moveDown(0.4);
        };

        // ================= HEADER / CONTACT INFO (Center Aligned, No blocks) =================
        doc.font(headingFont).fontSize(20).text((name || 'Student Name').toUpperCase(), { align: 'center' });
        doc.moveDown(0.2);

        // Combine contact info tightly
        const contactArr = [];
        if (email) contactArr.push(email);
        if (phone) contactArr.push(phone);
        if (linkedin) contactArr.push(linkedin.replace(/^https?:\/\/(www\.)?/, '')); // clean URL
        if (github) contactArr.push(github.replace(/^https?:\/\/(www\.)?/, ''));

        doc.font(bodyFont).fontSize(10).text(contactArr.join('  |  '), { align: 'center' });
        doc.moveDown(1);

        // ================= OBJECTIVE =================
        if (objective) {
            doc.font(headingFont).fontSize(12).text('PROFESSIONAL OBJECTIVE');
            drawSeparator();
            doc.font(bodyFont).fontSize(10).text(objective);
            doc.moveDown(1);
        }

        // ================= EDUCATION =================
        doc.font(headingFont).fontSize(12).text('EDUCATION');
        drawSeparator();

        // Current Course
        if (branch || cgpa || passing_year) {
            doc.font(headingFont).fontSize(11).text('B.Tech - ' + (branch || 'Computer Science'), { continued: true });
            doc.font(bodyFont).text(` | Graduating: ${passing_year || 'N/A'}`, { align: 'right' });
            doc.moveDown(0.2);
            doc.font(bodyFont).fontSize(10).text(`Cumulative Grade Point Average (CGPA): ${cgpa || 'N/A'}`);
            doc.moveDown(0.5);
        }

        if (education) {
            (Array.isArray(education) ? education : [education]).forEach(edu => {
                const degree = edu.degree || 'Degree';
                const inst = edu.institution || 'Institution';
                const yr = edu.year || '';
                const score = edu.score ? `Score: ${edu.score}` : '';

                doc.font(headingFont).fontSize(11).text(degree, { continued: true });
                doc.font(bodyFont).text(` | ${yr}`, { align: 'right' });
                doc.font(bodyFont).fontSize(10).text(`${inst} ${score ? ' - ' + score : ''}`);
                doc.moveDown(0.5);
            });
        }
        doc.moveDown(0.5);

        // ================= TECHNICAL SKILLS =================
        if (skills && skills.length > 0) {
            doc.font(headingFont).fontSize(12).text('TECHNICAL SKILLS');
            drawSeparator();
            const skillList = Array.isArray(skills) ? skills.join(', ') : skills;
            doc.font(bodyFont).fontSize(10).text(`Core Competencies: ${skillList}`);
            doc.moveDown(1);
        }

        // ================= EXPERIENCE =================
        if (experience && experience.length > 0) {
            doc.font(headingFont).fontSize(12).text('EXPERIENCE');
            drawSeparator();
            (Array.isArray(experience) ? experience : [experience]).forEach(exp => {
                doc.font(headingFont).fontSize(11).text(exp.role || 'Role', { continued: true });
                doc.font(bodyFont).text(` | ${exp.duration || ''}`, { align: 'right' });
                doc.font(headingFont).fontSize(10).text(exp.company || 'Company');
                if (exp.description) {
                    doc.moveDown(0.2);
                    // ATS prefers bullet points
                    doc.font(bodyFont).fontSize(10).text(`•  ${exp.description}`, { indent: 10 });
                }
                doc.moveDown(0.8);
            });
        }

        // ================= PROJECTS =================
        if (projects && (projects.length > 0) && (projects[0].title || projects[0].description)) {
            doc.font(headingFont).fontSize(12).text('PROJECTS');
            drawSeparator();
            (Array.isArray(projects) ? projects : [projects]).forEach(proj => {
                if (!proj.title && !proj.description) return;
                doc.font(headingFont).fontSize(11).text(proj.title || 'Project Title', { continued: proj.link ? true : false });
                if (proj.link) doc.font(bodyFont).text(` | ${proj.link}`, { align: 'right' });
                if (proj.tech) {
                    doc.moveDown(0.2);
                    doc.font(headingFont).fontSize(10).text(`Technologies used: `, { continued: true });
                    doc.font(bodyFont).text(proj.tech);
                }
                if (proj.description) {
                    doc.moveDown(0.2);
                    // Split descriptions into bullets if they contain newlines, otherwise 1 bullet
                    const lines = proj.description.split('\n').map(l => l.trim()).filter(l => l.length > 0);
                    lines.forEach(l => {
                        doc.font(bodyFont).fontSize(10).text(`•  ${l}`, { indent: 10 });
                    });
                }
                doc.moveDown(0.8);
            });
        }

        // ================= CERTIFICATIONS =================
        if (certifications && certifications.length > 0) {
            const hasCerts = certifications.some(c => c.name || typeof c === 'string');
            if (hasCerts) {
                doc.font(headingFont).fontSize(12).text('CERTIFICATIONS');
                drawSeparator();
                (Array.isArray(certifications) ? certifications : [certifications]).forEach(cert => {
                    const name = cert.name || cert;
                    const issuer = cert.issuer ? ` - ${cert.issuer}` : '';
                    const year = cert.year ? ` (${cert.year})` : '';
                    if (name.trim()) doc.font(bodyFont).fontSize(10).text(`•  ${name}${issuer}${year}`);
                });
            }
        }

        doc.end();

        stream.on('finish', async () => {
            // Save version to DB
            await db.query(
                'INSERT INTO resume_versions (user_id, filename, file_path) VALUES ($1,$2,$3)',
                [req.user.id, filename, filepath]
            );
            res.json({ message: 'Resume generated', filename, download_url: `/api/resume/download/${filename}` });
        });
    } catch (err) {
        console.error('Resume Gen Error:', err);
        res.status(500).json({ error: 'Failed to generate resume', message: err.message });
    }
};

const downloadResume = async (req, res) => {
    try {
        const { filename } = req.params;
        const filepath = path.join(__dirname, '../../uploads/resumes', filename);
        if (!fs.existsSync(filepath)) return res.status(404).json({ error: 'Resume not found' });
        res.download(filepath, filename);
    } catch (err) {
        res.status(500).json({ error: 'Download failed', message: err.message });
    }
};

const getVersionHistory = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, filename, created_at FROM resume_versions WHERE user_id=$1 ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch history', message: err.message });
    }
};

module.exports = { generateResume, downloadResume, getVersionHistory };
