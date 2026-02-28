# 🎓 PlacementPro - Campus Career Intelligence

PlacementPro is a centralized, role-based campus placement and career intelligence system designed to stream the recruitment journey for **Students**, **Training & Placement Officers (TPOs)**, and **Alumni**.

Built with a fast, modern glassmorphic UI and a robust Node.js backend, PlacementPro offers AI-powered career insights, live placement analytics, applicant tracking, and an automated ATS-friendly resume generator.

---

## 🚀 Live Demo

* **Deployed Link:** [https://placement-pro-2-umho.onrender.com](https://placement-pro-2-umho.onrender.com)

*(Note: Data resets periodically on free hosting since it uses local JSON storage for demonstration purposes).*

---

## 🌟 Key Features

### 👨‍🎓 For Students
* **Live Drive Tracking:** View upcoming drives, eligibility criteria, and apply with a single click.
* **AI Career Advisor:** Personalized career roadmaps, match scores, and skill gap identification.
* **Resume Wizard:** Instantly generate clean, 100% ATS-compliant PDF resumes based on your profile inputs.
* **Alumni Connect:** Access inner-circle job referrals and book one-on-one mentorship slots with successful alumni.

### 🏢 For Training & Placement Officers (TPOs)
* **Drive Management:** Create, edit, and broadcast upcoming placement drives with specific CGPA/branch criteria.
* **Application Tracking:** Accept/reject applications in real-time and review student profiles.
* **Interview Scheduler:** Organize interview rounds, manage technical/HR stages, and easily update interview statuses.
* **Live Analytics:** Gorgeous visual dashboards showcasing placement rates, top companies, and package trends.

### 🤝 For Alumni
* **Referral Board:** Post job referral opportunities to help juniors land interviews.
* **Mentorship Portal:** Give back to the community by opening calendar slots for career guidance and mock interviews.

---

## 💻 Tech Stack

* **Frontend:** Vanilla JS (ES6+), HTML5, Pure CSS3 (Glassmorphism & animations, zero UI frameworks).
* **Backend:** Node.js, Express.js.
* **Data Storage:** Lightweight pseudo-database (`db.json`) enabling zero-config deployment.
* **PDF Generation:** PDFKit (for generating ATS-compliant resumes).
* **Authentication:** JWT (JSON Web Tokens) with hashed passwords.

---

## 🛠️ How to Run Locally

### Prerequisites
* You must have [Node.js](https://nodejs.org/en) installed on your machine.

### Setup Instructions
1. **Clone the repository:**
   ```bash
   git clone https://github.com/shek41593-alt/Placement-Pro.git
   cd Placement-Pro
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Start the Development Server:**
   ```bash
   npm run dev
   ```

4. **Open the App:**
   * Open your browser and go to `http://localhost:5000/`.
   * You will see the beautiful landing page. Click **Open App Platform** to log in.

### Default Login Accounts
To instantly explore the different portals, you can use these pre-made accounts built into the demo database:

* **TPO Account:** `tpo@college.edu` | Pass: `password123`
* **Student Account:** `john@student.edu` | Pass: `password123`
* **Alumni Account:** `sarah@alumni.edu` | Pass: `password123`

---

## 🔮 Future Roadmap
* Migration to MongoDB/PostgreSQL for persistent production storage.
* Integration with a real Email/SMS API (like SendGrid or Twilio) for live push notifications.
* AI Mock Interview module using WebRTC.

---

*Built with ❤️ for Campus Excellence.*
