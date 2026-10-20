# 🎓 SRKR Engineering College AI Assistant

> **A friendly, intelligent conversational AI assistant for Sagi Rama Krishnam Raju (SRKR) Engineering College, Bhimavaram (Autonomous, NAAC 'A+' Grade, EAPCET Code: `SRKR`, [www.srkrec.ac.in](https://www.srkrec.ac.in)).**

Designed to provide authoritative guidance to **students, parents, recruiters, alumni, faculty, and visitors** with clear step-by-step next steps, verified institutional data, and automated routing of sensitive or unresolved matters to official college desks.

---

## 🌟 Key Features

### 1. 👥 Multi-Stakeholder Perspective Modes
Easily switch between targeted perspectives with dedicated prompts and context:
* **🎒 Students**: Attendance 75% & condonation rules, autonomous CBCS grading, exam revaluation, hall tickets, CRT placement preparation, technical fests (NIPUNA, SANKETHA).
* **👨‍👩‍👧 Parents**: Category-A (EAPCET) & Category-B (Management) admissions, fee payment, Jagananna Vidya Deevena (JVD) reimbursement, hostel safety & resident wardens, mentor consultation.
* **🏢 Recruiters & Corporate**: Talent pool stats, highest (₹44 LPA) & average (₹5.5–6.5 LPA) CTC, Dean Placements contact, scheduling on-campus & virtual hiring drives.
* **🌟 Alumni**: Transcript requisition for higher education / WES, degree verification, alumni association engagement, guest lectures.
* **🏛️ Visitors & Guests**: Location in China Amiram (Bhimavaram), railway transit (BVRT & BVRM), administrative office timings (9 AM – 5 PM), campus landmarks.

### 2. ⚡ Actionable "Next Steps" Synthesis
Every response delivers concrete, numbered actions (Step 1, Step 2, Step 3) explaining what to prepare, where to submit, and who to contact.

### 3. 🚨 Dedicated Escalation & Redressal Routing
Directs sensitive, confidential, or formal disputes to the appropriate official college desks with phone, email, and campus office location:
* **Anti-Ragging Committee & Squad** (Zero Tolerance policy, 24x7 toll-free: `1800-180-5522`, `antiragging@srkrec.ac.in`)
* **Internal Complaints Committee (ICC) & Women Protection Cell** (POSH compliance, Main Admin Block Room 104, `icc@srkrec.ac.in`)
* **Student Grievance Redressal Committee (SGRC)** (`grievances@srkrec.ac.in`)
* **Autonomous Controller of Examinations (COE)** (Transcripts, revaluation, grade memos, `coe@srkrec.ac.in`)
* **Admissions & Verification Desk** (EAPCET code `SRKR`, `+91 9848823332`, `admissions@srkrec.edu.in`)
* **Training & Placement Cell (Corporate Relations)** (Dean Dr. K. R. Satyanarayana, `+91 9704195376`, `dean.placements@srkrec.ac.in`)
* **Hostel Administration & Chief Wardens** (Boys & Girls hostels, mess queries)
* **Finance & Accounts Wing** (Tuition fees, JVD biometric authentication)
* **Office of the Principal & Director** (`principal@srkrec.ac.in`, `+91 8816 223332`)

### 4. 🧠 Dual Engine Architecture (Zero Mandatory External API Key)
* **Built-in High-Precision Local Agent**: Works immediately out-of-the-box with 100% offline capability using structured SRKR institutional data and intent classification.
* **Optional External LLM Integration**: Supports Google Gemini 1.5/2.0 API keys (configurable via browser settings UI or `.env`) for dynamic conversational generation grounded on college facts.

### 5. 🎙️ Voice Input & Text-to-Speech
* **Speech-to-Text**: One-click microphone button using Web Speech Recognition.
* **Audio Read Aloud**: Listen to any assistant response.
* **Chat Export**: Download full conversation transcript as Markdown (`.md`).
* **Dark / Light Theme**: Toggleable UI adhering to SRKR's Crimson Maroon & Gold branding.

---

## 📁 Project Architecture

```
SRKR AI Assistant/
├── data/
│   ├── srkrKnowledge.json         # Comprehensive college facts, departments, admissions, placements, hostels
│   └── escalationDirectory.json   # 9 official college desks with phone, email, location & guidance
├── services/
│   └── agentEngine.js             # Intent detection, next-steps synthesis, escalation logic, LLM adapter
├── public/
│   ├── index.html                 # Semantic responsive single-page web app
│   ├── css/
│   │   └── style.css              # SRKR design system (Maroon #7a0019, Gold #d4af37, Dark mode)
│   ├── js/
│   │   └── app.js                 # Frontend controller, speech synthesis, prompt carousels, modals
│   └── assets/
│       └── srkr-logo.svg          # SRKR crest seal logo
├── test/
│   └── test_assistant.js          # Automated unit & integration test suite (7 tests)
├── server.js                      # Express backend API & static server (port 3050)
├── package.json                   # Project metadata and dependencies
└── README.md                      # Documentation
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v18 or higher (tested on Node v24)
* **npm**: v9 or higher

### Installation & Run

1. **Clone or navigate to the directory**:
   ```bash
   cd "SRKR AI Assistant"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run Automated Tests**:
   ```bash
   npm test
   ```

4. **Start the Web Application**:
   ```bash
   npm start
   ```

5. **Open in Browser**:
   Visit [http://localhost:3050](http://localhost:3050)

---

## 🌐 Deploy to GitHub Pages (100% Free & Standalone)

This application is fully adapted to run standalone on **GitHub Pages** without requiring any active backend server:
* All college knowledge and directory data load statically in-browser (`js/srkrData.js`).
* The intent detection, routing, and next-steps synthesis run via the client-side agent engine (`js/agentEngine.js`).
* Optional Google Gemini LLM API calls execute directly from the browser if a key is provided in Settings.

### Step-by-Step GitHub Pages Deployment:

1. **Initialize Git and Commit**:
   ```bash
   git init
   git add .
   git commit -m "Deploy SRKR AI Assistant to GitHub Pages"
   ```

2. **Push to your GitHub Repository**:
   ```bash
   git remote add origin https://github.com/<YOUR_USERNAME>/<REPO_NAME>.git
   git branch -M main
   git push -u origin main
   ```

3. **Enable GitHub Pages**:
   * Navigate to your repo on GitHub: **Settings** -> **Pages** (in left sidebar).
   * **Source**: Choose **Deploy from a branch**.
   * **Branch**: Select `main` and root `/` folder.
   * Click **Save**.
   *(Alternatively, the included `.github/workflows/deploy.yml` will deploy automatically if you select **GitHub Actions** as source).*

4. **Access your site**:
   Your assistant will be live within 1–2 minutes at:
   `https://<YOUR_USERNAME>.github.io/<REPO_NAME>/`

---

## 📡 REST API Reference

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/chat` | `POST` | Process chat question with stakeholder context, next steps, and escalation card. |
| `/api/info` | `GET` | Returns college overview, accreditation, NIRF/NAAC data, and key statistics. |
| `/api/departments` | `GET` | Returns all 10 departments, approved intakes, HOD names, and emails. |
| `/api/escalation` | `GET` | Returns all 9 official escalation desks with emergency phone numbers and rooms. |
| `/api/faqs` | `GET` | Returns common college FAQs. |

### Example Chat Request:
```json
POST /api/chat
Content-Type: application/json

{
  "message": "What is the EAPCET code and procedure for admission?",
  "stakeholder": "student"
}
```

---

## 🏛️ SRKR Engineering College At a Glance
* **Full Name**: Sagi Rama Krishnam Raju Engineering College (Autonomous)
* **EAPCET Code**: `SRKR`
* **Accreditation**: NAAC Grade 'A+' (CGPA 3.42), NBA Accredited UG Branches
* **Affiliation**: JNTUK, Kakinada | Approved by AICTE
* **Campus Address**: SRKR Marg, China Amiram, Bhimavaram, West Godavari District, Andhra Pradesh - 534204
* **Official Website**: [www.srkrec.ac.in](https://www.srkrec.ac.in)
* **Principal**: Dr. K. V. Murali Krishnam Raju
* **Dean (T&P)**: Dr. K. R. Satyanarayana
