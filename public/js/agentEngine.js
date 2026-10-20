// SRKR AI Assistant - Client-Side Engine for Standalone & GitHub Pages Execution
(function(window) {
  const srkrData = window.srkrKnowledgeData || {};
  const escalationData = window.escalationDirectoryData || { desks: [] };

// System persona instruction for LLM or Agent Responses
const SYSTEM_PERSONA = `
You are the Official Friendly AI Assistant for Sagi Rama Krishnam Raju (SRKR) Engineering College, Bhimavaram, Andhra Pradesh (Autonomous, affiliated with JNTUK, NAAC 'A+' accredited, EAPCET Code: SRKR, website: www.srkrec.ac.in).

Your core duties:
1. Warm, respectful, and encouraging tone suitable for a distinguished educational institution.
2. Provide clear, accurate guidance based on official SRKR data to students, parents, faculty, alumni, recruiters, and visitors.
3. Formulate clear, actionable "Next Steps" (Step 1, Step 2, Step 3) so stakeholders know precisely what to do next.
4. Always identify sensitive, confidential, or formal disputes (e.g., ragging, safety, harassment, revaluation appeals, detention issues, fee disputes) and direct them immediately to the designated official office (Anti-Ragging Squad, ICC/Women Protection Cell, Controller of Examinations, Student Grievance Cell, Principal's Office).
5. Emphasize verified official web sources (www.srkrec.ac.in) and official contact numbers.
`;

/**
 * Keyword & Pattern Matcher for Intent Detection
 */
function detectIntent(text) {
  const t = text.toLowerCase();

  // 1. Sensitive / Safety Matters (Highest Priority)
  if (t.includes('ragging') || t.includes('ragged') || t.includes('bully') || t.includes('harass') || 
      t.includes('sexual') || t.includes('molest') || t.includes('abuse') || t.includes('threat') || 
      t.includes('suicide') || t.includes('emergency') || t.includes('mental health') || t.includes('safety') ||
      t.includes('icc') || t.includes('posh')) {
    return 'SENSITIVE_SAFETY';
  }

  // 2. Admissions & Counseling
  if (t.includes('admission') || t.includes('admit') || t.includes('eapcet') || t.includes('eamcet') || 
      t.includes('category b') || t.includes('category a') || t.includes('management quota') || 
      t.includes('lateral entry') || t.includes('ecet') || t.includes('cutoff') || t.includes('cut off') ||
      t.includes('seat allotment') || t.includes('convener quota') || t.includes('apply for btech') || 
      t.includes('intermediate marks') || t.includes('eligibility for b.tech')) {
    return 'ADMISSIONS';
  }

  // 3. Placements & Internships & Corporate
  if (t.includes('placement') || t.includes('recruit') || t.includes('salary') || t.includes('package') || 
      t.includes('highest package') || t.includes('average package') || t.includes('t&p') || 
      t.includes('companies') || t.includes('internship') || t.includes('satyanarayana') || 
      t.includes('campus drive') || t.includes('hire') || t.includes('hiring') || t.includes('ctc')) {
    return 'PLACEMENTS';
  }

  // 4. Exams, Attendance, Autonomous Regulations, Transcripts (Use word boundaries for acronyms like CIE, SEE, COE)
  if (t.includes('attendance') || t.includes('condonation') || t.includes('detention') || t.includes('detained') || 
      t.includes('75%') || t.includes('exam') || t.includes('exams') || t.includes('revaluation') || t.includes('recounting') || 
      t.includes('results') || t.includes('hall ticket') || t.includes('transcript') || t.includes('transcripts') || 
      t.includes('grade card') || t.includes('marks memo') || t.includes('backlog') || 
      t.includes('controller of examination') || t.includes('controller of examinations') || 
      t.includes('cgpa') || t.includes('sgpa') || t.includes('autonomous regulation') || 
      /\b(cie|see|coe|r20|r23)\b/i.test(t)) {
    return 'ACADEMICS_EXAMS';
  }

  // 5. Hostels & Living
  if (t.includes('hostel') || t.includes('mess') || t.includes('room') || t.includes('boarding') || 
      t.includes('girls hostel') || t.includes('boys hostel') || t.includes('warden') || t.includes('food')) {
    return 'HOSTELS';
  }

  // 6. Fees, Accounts & Scholarships
  if (t.includes('fee') || t.includes('fees') || t.includes('scholarship') || t.includes('jvd') || 
      t.includes('jagananna') || t.includes('vidya deevena') || t.includes('vasathi deevena') || 
      t.includes('payment') || t.includes('dues') || t.includes('challan') || t.includes('tuition fee')) {
    return 'FEES_SCHOLARSHIPS';
  }

  // 7. Departments & Branches (Use word boundaries for short codes like ECE, IT so 'reception' or 'activity' won't false-trigger)
  if (t.includes('department') || t.includes('departments') || t.includes('branch') || t.includes('branches') || 
      t.includes('intake') || t.includes('hod') || t.includes('head of department') ||
      /\b(cse|ece|eee|mech|civil|it|csit|aids|aiml|csbs|csd|bsh|mba|maths|chem|physics|english)\b/i.test(t) ||
      /\bcs\s*(&|and)\s*it\b/i.test(t)) {
    // If the query is actually asking for principal's reception or general office contact, prioritize contacts
    if (!t.includes('principal') && !t.includes('reception') && !t.includes('working hour')) {
      return 'DEPARTMENTS';
    }
  }

  // 8. Campus Facilities, Transport, Library & Complete Landmarks
  if (t.includes('landmark') || t.includes('landmarks') || t.includes('map') || t.includes('building') || 
      t.includes('bus') || t.includes('transport') || t.includes('library') || t.includes('librarian') ||
      t.includes('sports') || t.includes('physical director') || t.includes('physical derector') || t.includes('physical education') ||
      t.includes('idea lab') || t.includes('aicte idea lab') ||
      t.includes('gym') || t.includes('cricket') || t.includes('medical') || t.includes('dispensary') || 
      t.includes('bank') || t.includes('atm') || t.includes('canteen') || t.includes('wifi') || 
      t.includes('facility') || t.includes('facilities') || t.includes('campus')) {
    return 'CAMPUS_SERVICES';
  }

  // 9. Events, Fests & Student Clubs
  if (t.includes('nipuna') || t.includes('sanketha') || t.includes('fest') || t.includes('event') || 
      t.includes('club') || t.includes('ieee') || t.includes('csi') || t.includes('acm') || 
      t.includes('iste') || t.includes('nss') || t.includes('ncc') || t.includes('hackathon')) {
    return 'EVENTS_CLUBS';
  }

  // 10. Grievance & Complaints
  if (t.includes('complaint') || t.includes('grievance') || t.includes('dispute') || t.includes('issue') || 
      t.includes('problem with faculty') || t.includes('unfair')) {
    return 'GRIEVANCE';
  }

  // 11. Alumni Matters
  if (t.includes('alumni') || t.includes('passed out') || t.includes('old student') || 
      t.includes('reunion') || t.includes('wes verification') || t.includes('migration certificate')) {
    return 'ALUMNI';
  }

  // 12. Location, Contacts, Working Hours & Visiting
  if (t.includes('contact') || t.includes('phone') || t.includes('email') || t.includes('principal') || 
      t.includes('reception') || t.includes('director') || t.includes('address') || t.includes('reach') || 
      t.includes('bhimavaram') || t.includes('directions') || t.includes('route') || t.includes('timing') || 
      t.includes('timings') || t.includes('working hour') || t.includes('working hours') || 
      t.includes('office hour') || t.includes('office hours') || t.includes('office timing') || 
      t.includes('office timings') || t.includes('visitor') || t.includes('guest house')) {
    return 'CONTACTS_VISIT';
  }

  return 'GENERAL';
}

/**
 * Match relevant escalation desk from the directory
 */
function findEscalationDesk(intent, query) {
  const q = query.toLowerCase();
  
  if (intent === 'SENSITIVE_SAFETY') {
    if (q.includes('ragging') || q.includes('ragged') || q.includes('bully')) {
      return escalationData.desks.find(d => d.id === 'anti_ragging');
    }
    if (q.includes('harass') || q.includes('women') || q.includes('sexual') || q.includes('girl') || q.includes('posh') || q.includes('icc')) {
      return escalationData.desks.find(d => d.id === 'women_protection_icc');
    }
    return escalationData.desks.find(d => d.id === 'anti_ragging');
  }

  if (intent === 'GRIEVANCE') {
    return escalationData.desks.find(d => d.id === 'student_grievance');
  }

  if (intent === 'ACADEMICS_EXAMS') {
    if (q.includes('transcript') || q.includes('revaluation') || q.includes('results') || q.includes('marks') || q.includes('grade')) {
      return escalationData.desks.find(d => d.id === 'exam_cell_coe');
    }
  }

  if (intent === 'ADMISSIONS') {
    return escalationData.desks.find(d => d.id === 'admissions_office');
  }

  if (intent === 'PLACEMENTS') {
    return escalationData.desks.find(d => d.id === 'placement_cell');
  }

  if (intent === 'HOSTELS') {
    return escalationData.desks.find(d => d.id === 'hostel_warden');
  }

  if (intent === 'FEES_SCHOLARSHIPS') {
    return escalationData.desks.find(d => d.id === 'accounts_scholarships');
  }

  if (intent === 'ALUMNI') {
    return escalationData.desks.find(d => d.id === 'alumni_office');
  }

  if (intent === 'CAMPUS_SERVICES' || intent === 'CONTACTS_VISIT') {
    if (q.includes('physical director') || q.includes('physical derector') || q.includes('sports') || q.includes('physical education') || q.includes('gym')) {
      return escalationData.desks.find(d => d.id === 'physical_director');
    }
    if (q.includes('library') || q.includes('librarian') || q.includes('book') || q.includes('journal')) {
      return escalationData.desks.find(d => d.id === 'central_library');
    }
    if (q.includes('idea lab') || q.includes('maker space') || q.includes('aicte idea lab')) {
      return escalationData.desks.find(d => d.id === 'aicte_idea_lab');
    }
  }

  if (intent === 'CONTACTS_VISIT') {
    return escalationData.desks.find(d => d.id === 'principal_office');
  }

  return null;
}

/**
 * Built-in Agent Engine with high precision responses, next steps, and official routing
 */
function generateBuiltInResponse(intent, query, stakeholder) {
  const q = query.toLowerCase();
  let textAnswer = "";
  let nextSteps = [];
  let suggestedDesk = findEscalationDesk(intent, query);
  let relevantLinks = [
    { label: "SRKR Official Portal", url: "https://www.srkrec.ac.in" }
  ];

  switch (intent) {
    case 'SENSITIVE_SAFETY': {
      if (q.includes('ragging') || q.includes('ragged') || q.includes('bully')) {
        textAnswer = `**Zero Tolerance Policy Against Ragging at SRKR Engineering College (ZERO TOLERANCE)**\n\nSRKR strictly enforces UGC and Supreme Court regulations regarding ragging. Any act of physical, mental, or verbal intimidation, teasing, or harassment is strictly forbidden on campus, in hostels, and in transit.\n\n* **Protection & Confidentiality:** Every report is handled immediately with utmost confidentiality to safeguard the student's safety, identity, and academic peace of mind. Strict disciplinary and legal actions, including suspension and police reporting, are enforced against offenders.`;
        nextSteps = [
          "**Immediate Emergency Action:** If you or someone you know is in distress, call the 24x7 Anti-Ragging Helpline at **1800-180-5522** or Principal's office at **+91 8816 223332** right now.",
          "**Report Discreetly:** Send an email with details, location, and identities to **antiragging@srkrec.ac.in** or **principal@srkrec.ac.in**.",
          "**Approach Squad in Person:** You may approach the Principal, Head of Department, or Resident Hostel Warden directly in the Administrative Block."
        ];
        suggestedDesk = escalationData.desks.find(d => d.id === 'anti_ragging');
        relevantLinks.push({ label: "National Anti-Ragging Portal", url: "https://www.antiragging.in" });
      } else {
        textAnswer = `**Internal Complaints Committee (ICC) & Women Protection Cell**\n\nSRKR Engineering College provides a safe, dignified, and inclusive learning atmosphere for all female students, faculty, and campus staff under the statutory Prevention of Sexual Harassment (POSH) guidelines and UGC directives.\n\n* **Privacy & Support:** The committee is led by senior female faculty members and external legal counsellors who ensure compassionate hearing, strict confidentiality, and prompt disciplinary intervention.`;
        nextSteps = [
          "**Direct Confidential Email:** Write directly to **icc@srkrec.ac.in** or contact the Principal at **principal@srkrec.ac.in**.",
          "**Visit the ICC Room:** Walk into Main Administrative Block, Room 104, between 9:30 AM and 4:30 PM on any working day.",
          "**Emergency Hostel Support:** Female hostel residents can reach out to the Senior Lady Warden immediately at the Girls Hostel security office."
        ];
        suggestedDesk = escalationData.desks.find(d => d.id === 'women_protection_icc');
      }
      break;
    }

    case 'ADMISSIONS': {
      const isMgmt = q.includes('management') || q.includes('category b') || q.includes('nri');
      const isLateral = q.includes('lateral') || q.includes('ecet') || q.includes('diploma');
      
      if (isMgmt) {
        textAnswer = `**SRKR Category-B (Management / NRI Quota) Admissions**\n\n* **Seat Share:** 30% of the total approved intake across B.Tech programs is earmarked for Category-B.\n* **Eligibility:** Candidates must have passed 10+2 / Intermediate with minimum 45% aggregate in MPC (Mathematics, Physics, Chemistry). Priority is given to students with valid JEE Main or AP EAPCET ranks; remaining seats are filled on Intermediate marks merit.\n* **Transparency:** Admissions follow APSCHE guidelines, verified through the official state admission portal.`;
        nextSteps = [
          "Check the official notification and admission schedule published on [www.srkrec.ac.in](https://www.srkrec.ac.in).",
          "Submit your Category-B application online via the APSCHE Category-B web portal or at the SRKR Administrative Admissions Desk.",
          "Bring original Intermediate memo, 10th memo, rank card, Transfer Certificate, and Aadhaar card to the Admissions Counter for verification.",
          "For direct inquiries on available branches and fees, contact the Admissions Cell at **+91 9848823332**."
        ];
      } else if (isLateral) {
        textAnswer = `**Lateral Entry (AP ECET) Admissions into 2nd Year B.Tech**\n\n* **Eligibility:** Diploma in Engineering holders or B.Sc (Mathematics) graduates who qualified in the **AP ECET** examination.\n* **Seat Allotment:** 10% supernumerary seats in the 3rd semester (2nd year) across core and computing engineering disciplines.\n* **College Code:** Use **SRKR** in AP ECET centralized web counseling.`;
        nextSteps = [
          "Register for AP ECET counseling conducted by APSCHE.",
          "Exercise college web options choosing **SRKR (Bhimavaram)** as your desired preference.",
          "Download seat allotment order and complete document verification at the SRKR Admissions Counter."
        ];
      } else {
        textAnswer = `**SRKR B.Tech Admissions via AP EAPCET (Convener Quota - Category-A)**\n\n* **AP EAPCET Code:** **SRKR** (Sagi Rama Krishnam Raju Engineering College, Bhimavaram).\n* **Seat Allocation:** 70% of seats are filled through merit-based centralized web counseling conducted by APSCHE.\n* **Eligibility:** Intermediate (10+2) with Mathematics, Physics, and Chemistry (MPC) and a qualifying rank in AP EAPCET.\n* **Government Schemes:** Eligible students under government criteria can avail 100% tuition fee reimbursement under **Jagananna Vidya Deevena (JVD)**.`;
        nextSteps = [
          "**Web Counseling:** Register on the official APSCHE EAPCET portal ([eapcet-sche.aptonline.in](https://eapcet-sche.aptonline.in)).",
          "**Option Entry:** Select College Code **SRKR** and choose your preferred branch (CSE, AIML, AIDS, CSBS, IT, ECE, EEE, MECH, CIVIL).",
          "**Reporting:** Upon receiving the allotment order, report at the SRKR Campus Admissions Cell, China Amiram, Bhimavaram with original certificates and 3 sets of photocopies.",
          "**Helpline:** Contact SRKR Admissions Desk at **+91 9848823332** or **admissions@srkrec.edu.in**."
        ];
      }
      suggestedDesk = escalationData.desks.find(d => d.id === 'admissions_office');
      relevantLinks.push({ label: "APSCHE Admissions Portal", url: "https://sche.ap.gov.in" });
      break;
    }

    case 'PLACEMENTS': {
      textAnswer = `**Training & Placement (T&P) Cell - SRKR Engineering College (Autonomous)**\n\n* **Location:** **Silver Jubilee Building, Ground Floor** (China Amiram, Bhimavaram).\n* **Head of Cell:** **Dr. K. R. Satyanarayana** (Dean, Training & Placement Cell).\n* **Contact Numbers:** +91 9704195376, +91 9563544999 / 08816-223332\n* **Official Email:** [dean.placements@srkrec.ac.in](mailto:dean.placements@srkrec.ac.in) | [corporaterelations@srkrec.ac.in](mailto:corporaterelations@srkrec.ac.in)\n\n* **Key Placement Records & Infrastructure:**\n  - **Highest Package:** **₹44 LPA** (Palo Alto Networks / Amazon)\n  - **Average Package:** **₹5.50 - ₹6.50 LPA** across engineering streams\n  - **Annual Offers:** Over **1,500+ job offers** per year across 80+ MNCs\n  - **Testing Infrastructure:** 500+ seat online computer assessment center, interview suites, and seminar halls.\n  - **Top Recruiters:** Amazon, Cisco, TCS (Digital & Ninja), Infosys, Wipro, Cognizant, Tech Mahindra, Capgemini, Virtusa, Mindtree, Hyundai Mobis, L&T Technology Services, Hexaware, and Accenture.\n* **CRT Initiatives:** Comprehensive Campus Recruitment Training from 2nd year covers DSA bootcamps, full stack development, competitive programming on LeetCode/CodeChef, aptitude classes, and mock HR/technical interviews with alumni.`;
      
      if (stakeholder === 'recruiter') {
        nextSteps = [
          "**Corporate Outreach:** Send your hiring drive schedule, job description, and eligibility criteria to **dean.placements@srkrec.ac.in** and **corporaterelations@srkrec.ac.in**.",
          "**Connect Directly:** Call the Dean (T&P) office at **+91 9704195376** or **+91 9563544999** to confirm on-campus or virtual recruitment slots.",
          "**Visit Placement Office:** Located on the **Ground Floor, Silver Jubilee Building**, equipped with 500+ seat online testing labs."
        ];
      } else {
        nextSteps = [
          "**Students:** Ensure your profile and resume are updated on the college Placement Portal with no pending academic backlogs.",
          "**Attend CRT Sessions:** Attend all scheduled quantitative aptitude, coding bootcamps, and soft skill training sessions in the Silver Jubilee Building.",
          "**Need Internship NOC?** Submit an application signed by your HOD to the Training & Placement Cell, **Ground Floor, Silver Jubilee Building**."
        ];
      }
      suggestedDesk = escalationData.desks.find(d => d.id === 'placement_cell');
      break;
    }

    case 'ACADEMICS_EXAMS': {
      if (q.includes('controller of examination') || q.includes('controller of examinations') || q.includes('coe') || q.includes('who is coe') || (q.includes('exam cell') && q.includes('location'))) {
        textAnswer = `**Autonomous Examination Cell (COE) - SRKR Engineering College (Autonomous)**\n\n* **Location:** **Silver Jubilee Building, 1st Floor**, SRKR Engineering College, China Amiram, Bhimavaram - 534204.\n* **Controller of Examinations:** **Dr. M. Siva Krishnam Raju**\n* **Official Examination Portal:** [www.srkrexams.in](https://www.srkrexams.in)\n* **Contact Numbers:** **08816-223332**, **08816-229377** / Mobile: **+91 9848823332**\n* **Official Email:** [coe@srkrec.ac.in](mailto:coe@srkrec.ac.in) | [srkrexams@srkrec.ac.in](mailto:srkrexams@srkrec.ac.in)\n* **Key Services:** Semester-end autonomous examinations, hall tickets, grade memos, revaluation/recounting processing, official transcripts for WES & higher education, and provisional certificate verification.`;
        nextSteps = [
          "Visit the official examination portal at [www.srkrexams.in](https://www.srkrexams.in) for active notifications and result links.",
          "For physical transcript applications, grade card corrections, or revaluation, visit the Autonomous Examination Cell on the **1st Floor, Silver Jubilee Building**.",
          "Contact the COE office directly at **08816-223332** or email **coe@srkrec.ac.in** with your Hall Ticket / Roll Number."
        ];
        suggestedDesk = escalationData.desks.find(d => d.id === 'exam_cell_coe');
        relevantLinks.push({ label: "SRKR Exam Portal", url: "https://www.srkrexams.in" });
      } else if (q.includes('attendance') || q.includes('detention') || q.includes('75%') || q.includes('condonation')) {
        textAnswer = `**SRKR Autonomous Regulations: Attendance & Condonation Rules**\n\n* **Mandatory Minimum Attendance:** A student must maintain an aggregate attendance of **at least 75%** across all subjects in the semester to be eligible to appear for Semester End Examinations (SEE).\n* **Medical Condonation (65% to 74%):** Condonation may be recommended by the HOD and Academic Committee **strictly on genuine medical grounds** (accompanied by medical certificate, hospital admission records, and parent endorsement) upon payment of the prescribed Condonation Fee.\n* **Strict Detention (Below 65%):** Any student securing **less than 65% aggregate attendance** is strictly **DETAINED** for that semester. There is no provision for condonation below 65%. Detained students must repeat the semester in the next academic year.`;
        nextSteps = [
          "Check your official attendance percentage on the student portal or at your department notice board.",
          "If between 65% and 74% due to medical reasons, collect the Medical Condonation Requisition form from your HOD office immediately.",
          "Submit the doctor's certificate, prescription bills, and parent letter to the HOD for verification before the semester-end cutoff date."
        ];
      } else if (q.includes('revaluation') || q.includes('recounting') || q.includes('results')) {
        textAnswer = `**Semester End Exam Results & Revaluation Procedure**\n\n* **Autonomous Examination Cell:** Managed by the Controller of Examinations (**Dr. M. Siva Krishnam Raju**).\n* **Official Examination Portal:** [www.srkrexams.in](https://www.srkrexams.in) for checking semester grades, notification circulars, and downloading hall tickets.\n* **Revaluation / Recounting Window:** Applications for revaluation or recounting are accepted within **10 calendar days** from the official announcement of semester results on the portal.\n* **Fee:** Pay the prescribed revaluation fee per subject through the autonomous examination fee portal or SBI Collect / Accounts challan.\n* **Contact Numbers:** 08816-223332, 08816-229377 / +91 9848823332 | **Email:** coe@srkrec.ac.in`;
        nextSteps = [
          "Visit the official SRKR exams portal at [www.srkrexams.in](https://www.srkrexams.in) and check your result.",
          "Download the Revaluation / Recounting application from the examination portal.",
          "Pay the prescribed fee per theory course and obtain the payment receipt.",
          "Submit the filled application along with payment challan to the Autonomous Examination Cell (**Silver Jubilee Building, 1st Floor**) or submit online via [srkrexams.in](https://www.srkrexams.in).",
          "Track the updated grade notification published on the official notice board."
        ];
        suggestedDesk = escalationData.desks.find(d => d.id === 'exam_cell_coe');
        relevantLinks.push({ label: "SRKR Exam Portal", url: "https://www.srkrexams.in" });
      } else if (q.includes('transcript') || q.includes('wes') || q.includes('marks memo')) {
        textAnswer = `**Official Transcripts, Marks Cards & Degree Verification**\n\n* **Issuing Authority:** Autonomous Examination Cell (COE Office), SRKR Engineering College (Head: **Dr. M. Siva Krishnam Raju**, Controller of Examinations).\n* **Exams Portal:** [www.srkrexams.in](https://www.srkrexams.in)\n* **Phone Numbers:** 08816-223332, 08816-229377 / +91 9848823332\n* **Documents Provided:** Official consolidated grade memos, semester-wise transcripts, medium of instruction certificates, and sealed envelopes for WES / international universities.`;
        nextSteps = [
          "Fill out the Official Transcript Request form available at the Examination Cell counter or download from [www.srkrexams.in](https://www.srkrexams.in).",
          "Attach photocopies of all semester grade memos, provisional certificate, and payment receipt.",
          "Submit to the COE Office (**Silver Jubilee Building, 1st Floor**); standard processing time is 3 to 7 working days.",
          "For inquiries, email **coe@srkrec.ac.in** with your Roll Number, Branch, and Passing Year."
        ];
        suggestedDesk = escalationData.desks.find(d => d.id === 'exam_cell_coe');
        relevantLinks.push({ label: "SRKR Exam Portal", url: "https://www.srkrexams.in" });
      } else {
        textAnswer = `**Academic System & Curriculum Structure (Autonomous R20 / R23)**\n\n* **System:** Choice Based Credit System (CBCS) requiring **160 credits** for B.Tech degree completion.\n* **Evaluation Pattern:**\n  - **Continuous Internal Evaluation (CIE):** 30 or 40 marks (Mid-1, Mid-2, assignments, quizzes, coding assessments)\n  - **Semester End Examination (SEE):** 70 or 60 marks conducted autonomously\n  - **Passing Minimum:** 35% in SEE and 40% aggregate in CIE + SEE combined.\n* **Honors / Minors Degree:** Students with CGPA >= 7.5 without backlogs are eligible to register for an additional 20 credits in specialized or interdisciplinary tracks.`;
        nextSteps = [
          "Access your department syllabus copy and academic calendar on the college website.",
          "Consult your Faculty Mentor / Class Teacher for credit audits or course electives selection.",
          "Visit Dean Academics or Controller of Examinations for curriculum queries."
        ];
        suggestedDesk = escalationData.desks.find(d => d.id === 'exam_cell_coe');
      }
      break;
    }

    case 'DEPARTMENTS': {
      const depts = srkrData.departments;
      let matched = null;
      if (/\b(cs\s*(&|and)\s*it|csit|cs\s+it)\b/i.test(q)) {
        matched = depts.find(d => d.code === 'CSIT');
      } else if (/\b(csd|cs\s*(&|and)\s*d)\b/i.test(q) || q.includes('computer science & design') || q.includes('computer science and design')) {
        matched = depts.find(d => d.code === 'CSD');
      } else if (/\b(csbs|cs\s*(&|and)\s*bs)\b/i.test(q) || q.includes('computer science & business') || q.includes('computer science and business')) {
        matched = depts.find(d => d.code === 'CSBS');
      } else if (/\b(aiml|cse-aiml|ai\s*(&|and)\s*ml)\b/i.test(q)) {
        matched = depts.find(d => d.code === 'AIML');
      } else if (/\b(aids|ai\s*(&|and)\s*ds)\b/i.test(q) || q.includes('data science')) {
        matched = depts.find(d => d.code === 'AIDS');
      } else if (/\bcse\b/i.test(q) || q.includes('computer science and engineering') || q.includes('computer science & engineering') || (q.includes('computer science') && !q.includes('design') && !q.includes('business') && !q.includes('information technology') && !q.includes('it'))) {
        matched = depts.find(d => d.code === 'CSE');
      } else if ((/\bit\b/i.test(q) || q.includes('information technology')) && !/\b(cs\s*(&|and)\s*it|csit)\b/i.test(q)) {
        matched = depts.find(d => d.code === 'IT');
      } else if (/\bece\b/i.test(q) || q.includes('electronics & communication') || q.includes('electronics and communication')) {
        matched = depts.find(d => d.code === 'ECE');
      } else if (/\beee\b/i.test(q) || q.includes('electrical & electronics') || q.includes('electrical and electronics')) {
        matched = depts.find(d => d.code === 'EEE');
      } else if (/\bmech\b/i.test(q) || q.includes('mechanical')) {
        matched = depts.find(d => d.code === 'MECH');
      } else if (/\bcivil\b/i.test(q)) {
        matched = depts.find(d => d.code === 'CIVIL');
      } else if (/\bmaths\b|\bmath\b|mathematics/i.test(q)) {
        matched = depts.find(d => d.code === 'MATHS');
      } else if (/\bchem\b|chemistry/i.test(q)) {
        matched = depts.find(d => d.code === 'CHEM');
      } else if (/\bphysics\b/i.test(q)) {
        matched = depts.find(d => d.code === 'PHYSICS');
      } else if (/\benglish\b/i.test(q)) {
        matched = depts.find(d => d.code === 'ENGLISH');
      } else if (/\bmba\b|management/i.test(q)) {
        matched = depts.find(d => d.code === 'MBA');
      } else {
        matched = depts.find(d => new RegExp('\\b' + d.code + '\\b', 'i').test(q) || q.includes(d.name.toLowerCase()));
      }
      
      if (matched) {
        textAnswer = `**Department of ${matched.name} (${matched.code})**\n\n* **Head of Department (HOD) / Coordinator:** **${matched.hod}** (${matched.designation || 'Head of the Department'})\n* **Approved Intake:** ${matched.intake > 0 ? matched.intake + ' seats' : 'Foundation / Allied Department'}\n* **Established:** ${matched.established}\n* **Degrees Offered:** ${matched.degrees.join(', ')}\n* **Overview:** ${matched.description}\n* **Official HOD Email:** [${matched.contactEmail}](mailto:${matched.contactEmail})${matched.alternateEmail ? ' | [' + matched.alternateEmail + '](mailto:' + matched.alternateEmail + ')' : ''}`;
        nextSteps = [
          `To visit the department or consult faculty, report to the **${matched.code} Department Block** on campus (China Amiram, Bhimavaram).`,
          `Email HOD at **${matched.contactEmail}** for academic queries, syllabus verification, or departmental permissions.`,
          "Explore department laboratories, faculty profiles, and research projects at [www.srkrec.ac.in](https://www.srkrec.ac.in)."
        ];
      } else {
        textAnswer = `**Academic Departments & HOD Contacts - SRKR Engineering College (Alphabetical Order)**\n\nSRKR houses 16 distinguished academic departments across computing, core engineering, foundational sciences, and management:\n\n1. **Artificial Intelligence & Data Science (AIDS):** Dr. P. Ravi Kiran Varma | [hod.aids@srkrec.ac.in](mailto:hod.aids@srkrec.ac.in)\n2. **Artificial Intelligence & Machine Learning (CSE-AIML):** Dr. G. N. V. G. Sirisha | [pc.aiml@srkrec.ac.in](mailto:pc.aiml@srkrec.ac.in)\n3. **Civil Engineering (CIVIL):** Dr. G. Sri Bala | [civil@srkrec.ac.in](mailto:civil@srkrec.ac.in)\n4. **Computer Science & Business Systems (CSBS):** Dr. B. V. D. S. Sekhar | [hod.csbs@srkrec.ac.in](mailto:hod.csbs@srkrec.ac.in)\n5. **Computer Science & Design (CSD):** Dr. M. Suresh Babu | [hod.csd@srkrec.ac.in](mailto:hod.csd@srkrec.ac.in)\n6. **Computer Science & Engineering (CSE):** Dr. Bh. V. S. Rama Krishnam Raju | [cse@srkrec.ac.in](mailto:cse@srkrec.ac.in)\n7. **Computer Science & Information Technology (CS & IT):** Dr. N. Gopala Krishna Murthy | [csit@srkrec.ac.in](mailto:csit@srkrec.ac.in)\n8. **Electrical & Electronics Engineering (EEE):** Dr. B. Ravi Kumar Varma | [eee@srkrec.ac.in](mailto:eee@srkrec.ac.in)\n9. **Electronics & Communication Engineering (ECE):** Dr. S. S. Mohan Reddy | [ece@srkrec.ac.in](mailto:ece@srkrec.ac.in)\n10. **Engineering Chemistry:** Dr. P. Bhavani | [chemistry@srkrec.ac.in](mailto:chemistry@srkrec.ac.in)\n11. **Engineering Physics:** Dr. M. V. Someswara Rao | [physics@srkrec.ac.in](mailto:physics@srkrec.ac.in)\n12. **English & Foreign Languages:** Dr. Satish Kumar Nadimpalli | [english@srkrec.ac.in](mailto:english@srkrec.ac.in)\n13. **Information Technology (IT):** Dr. P. Ravi Kiran Varma | [it@srkrec.ac.in](mailto:it@srkrec.ac.in)\n14. **Management Studies (MBA):** Dr. M. Siva Krishnam Raju | [hod.bba@srkrec.ac.in](mailto:hod.bba@srkrec.ac.in)\n15. **Mathematics:** Dr. G. N. V. Kishore | [maths@srkrec.ac.in](mailto:maths@srkrec.ac.in)\n16. **Mechanical Engineering (MECH):** Dr. K. Sita Rama Raju | [mech@srkrec.ac.in](mailto:mech@srkrec.ac.in)\n\n*All eligible UG departments are NBA accredited.*`;
        nextSteps = [
          "Inquire about a specific department by asking e.g. *'Who is CSE HOD?'*, *'Who is Civil HOD?'*, or *'ECE HOD contact details'*. ",
          "Click the **Departments** button in the top navigation bar to view full department profiles and intakes.",
          "Review department syllabi, faculty research, and project expos on [www.srkrec.ac.in](https://www.srkrec.ac.in)."
        ];
      }
      break;
    }

    case 'HOSTELS': {
      textAnswer = `**Hostel Accommodations & Facilities at SRKR**\n\nSRKR provides comfortable, safe, and disciplined residential hostels on and near campus:\n\n* **Boys Hostels:** Multiple well-ventilated modern blocks accommodating over 1,200 students with spacious rooms, high-speed Wi-Fi, solar hot water, study lounges, sports courts, and 24/7 security.\n* **Girls Hostels:** Located within a secure dedicated compound housing 1,000+ female students with resident lady wardens, biometric turnstiles, round-the-clock security, health clinic, and dedicated study halls.\n* **Dining & Mess:** Hygienic, steam-cooked nutritious South Indian food (both vegetarian and non-vegetarian menus served on select days) prepared under strict food safety standards.\n* **Amenities:** RO drinking water plants on every floor, power backup generators, recreation room with TV, and indoor sports.`;
      nextSteps = [
        "**Hostel Admission:** Apply for hostel room allocation at the Hostel Administration Counter in the Administrative Block upon securing college admission.",
        "**Fees & Allotment:** Pay the annual hostel establishment and mess deposit challan at the Accounts Section.",
        "**Parental Visit / Gate Pass:** Students must register outstation leave on the digital hostel register countersigned by the warden and verified via parent SMS/call.",
        "**Contact Warden:** Call college main line **+91 8816 223332** and request Hostel Chief Warden desk."
      ];
      suggestedDesk = escalationData.desks.find(d => d.id === 'hostel_warden');
      break;
    }

    case 'FEES_SCHOLARSHIPS': {
      textAnswer = `**Tuition Fee, Scholarships & Government Reimbursement (JVD)**\n\n* **Tuition Fee Structure:** B.Tech tuition fee is regulated by the AP Higher Education Regulatory and Monitoring Commission (APHERMC) (approx. ₹70,000 - ₹73,000 per annum for Category-A convener quota).\n* **Jagananna Vidya Deevena (JVD):** Full 100% tuition fee reimbursement credited by the Government of Andhra Pradesh directly to the registered bank account of the student's mother for eligible Category-A candidates.\n* **Jagananna Vasathi Deevena:** Annual financial support of ₹20,000 per student (in two installments) towards hostel, boarding, and mess costs.\n* **National & Central Scholarships:** NSP minority scholarships, AICTE Pragati & Saksham scholarships for female and specially-abled students.`;
      nextSteps = [
        "**JVD Biometric Verification:** Ensure mandatory biometric e-KYC authentication is completed each semester at the college JVD / Scholarship Section.",
        "**Tuition Fee Payment:** For non-reimbursed candidates and Category-B students, fees can be paid via official bank challan (Union Bank of India, SRKR campus branch) or through the student online fee portal.",
        "**Fee Receipts & No-Dues:** Collect verified receipts from the Accounts Wing, Ground Floor, Administrative Block.",
        "**Queries:** Contact Accounts Desk at **+91 8816 223332 (Ext: 108)** or email **accounts@srkrec.ac.in**."
      ];
      suggestedDesk = escalationData.desks.find(d => d.id === 'accounts_scholarships');
      break;
    }

    case 'CAMPUS_SERVICES': {
      if (q.includes('landmark') || q.includes('landmarks') || q.includes('map') || q.includes('building')) {
        const landmarkList = srkrData.campusFacilities.landmarks.map((l, idx) => 
          `**${idx + 1}. ${l.name}** (${l.zone})\n   ${l.description}`
        ).join('\n\n');

        textAnswer = `**Complete Campus Landmarks & Buildings Directory (SRKR Engineering College, Bhimavaram)**\n\nThe 30+ acre lush green campus in China Amiram is structured into clearly planned academic, administrative, and residential zones:\n\n${landmarkList}`;
        nextSteps = [
          "Report to the **Main Entrance Gate & Security Cabin** on SRKR Marg to collect your Visitor Badge.",
          "Visit the **Administrative Block** (Central Campus) for Admissions, Accounts, Principal, or Room 104 (ICC).",
          "For exam certificates, visit the **Autonomous Examination Cell** (Adjacent to Central Library, Head: Dr. M. Siva Krishnam Raju).",
          "Click the **Campus Guide** button in the top navigation bar to view the full interactive building directory."
        ];
        suggestedDesk = escalationData.desks.find(d => d.id === 'principal_office');
      } else if (q.includes('bus') || q.includes('transport')) {
        textAnswer = `**SRKR College Bus Transport Services**\n\n* **Fleet & Coverage:** The college operates over 50 comfortable buses connecting Bhimavaram town and surrounding areas: Tanuku, Palakollu, Tadepalligudem, Narsapur, Akividu, Veeravasaram, Maruteru, Undi, Penumantra, and more.\n* **Safety:** Experienced drivers, speed governors, and GPS tracking.\n* **Bus Pass:** Semester-wise bus passes are issued at the Transport Desk near the Main Gate.`;
        nextSteps = [
          "Visit the Transport Office near Campus Main Gate to verify route timings and bus numbers.",
          "Submit bus pass application with 2 passport photos and transport fee challan.",
          "Carry the college bus pass identity card at all times during travel."
        ];
      } else if (q.includes('physical director') || q.includes('physical derector') || q.includes('physical education') || (q.includes('sports') && !q.includes('complex'))) {
        textAnswer = `**Physical Director & Department of Physical Education - SRKR Engineering College**\n\n* **Physical Directors / Key Faculty:**\n  - **Dr. P. Satyanarayana Raju** (Associate Professor & Physical Director) | Mobile: **+91 9441814118** | Email: [srpenmethsa@gmail.com](mailto:srpenmethsa@gmail.com)\n  - **Dr. Ch. Hari Mohan** (Associate Professor & Physical Director) | Mobile: **+91 9949111178** | Email: [hari.srkrpd@gmail.com](mailto:hari.srkrpd@gmail.com)\n* **Office Location:** **Indoor Sports Stadium & Gymnasium Complex**, Sports Pavilion, SRKR Campus.\n* **Official Email:** [sports@srkrec.ac.in](mailto:sports@srkrec.ac.in)\n* **Sports Infrastructure:** International-standard synthetic badminton courts, table tennis hall, full-size cricket stadium, football ground, basketball court, 400m track, and modern air-conditioned gymnasiums for men and women.`;
        nextSteps = [
          "Visit the Physical Education Department office located in the **Indoor Sports Stadium**.",
          "For inter-collegiate sports trials or university team selections, contact Dr. P. Satyanarayana Raju (+91 9441814118) or Dr. Ch. Hari Mohan (+91 9949111178).",
          "Sports quota certificate verifications are conducted at the Physical Director's office during working hours."
        ];
        suggestedDesk = escalationData.desks.find(d => d.id === 'physical_director');
      } else if (q.includes('library') || q.includes('librarian')) {
        textAnswer = `**Central Library & Knowledge Resource Centre - SRKR Engineering College**\n\n* **Librarian / In-Charge:** **Sri G. Srinivasa Raju** (In-Charge, Central Library & Assistant Professor)\n* **Assistant Librarian:** **Ms. J.V.L.N.R. Sita**\n* **Location:** **Central Library Building** (Opposite Main Administrative Block)\n* **Official Contact:** **08816-223332 (Ext: 115)** / Mobile: **+91 9848823332**\n* **Official Email:** [library@srkrec.ac.in](mailto:library@srkrec.ac.in) | [info@srkrec.ac.in](mailto:info@srkrec.ac.in)\n* **Timings:** Open from **8:00 AM to 8:00 PM** on all working days.\n* **Collection & Facilities:** 100,000+ volumes, 20,000+ titles, air-conditioned Digital Library lab with 100+ terminals, IEEE Xplore, ScienceDirect, Springer, DELNET, NPTEL courseware, and SC/ST Book Bank facility.`;
        nextSteps = [
          "Use your student biometric ID card at the circulation desk on the Ground Floor for borrowing books (up to 4 books for UG students).",
          "Access e-journals, IEEE papers, and digital archives inside the Digital Library Centre on the 1st Floor.",
          "For library no-dues or book bank clearances, contact Sri G. Srinivasa Raju at Ext: 115 or email **library@srkrec.ac.in**."
        ];
        suggestedDesk = escalationData.desks.find(d => d.id === 'central_library');
      } else if (q.includes('idea lab') || q.includes('aicte idea lab') || q.includes('maker space')) {
        textAnswer = `**AICTE IDEA Lab (Innovation & Maker Space) - SRKR Engineering College**\n\n* **Leadership & Coordinators:**\n  - **Coordinator / Head, EDC:** **Dr. G. Harish Kumar Varma** (Associate Professor, EEE & Dean Student Affairs) | Phone: **+91 8074589783**\n  - **Co-Coordinator / Incharge:** **Sri K. Pavan Kumar** (Assistant Professor, Dept of EEE) | Phone: **08816-229373**\n* **Location:** **AICTE IDEA Lab Building, Ground & 1st Floor** (Opposite Mechanical Engineering Block)\n* **Official Email:** [idealab@srkrec.ac.in](mailto:idealab@srkrec.ac.in) | [edc@srkrec.ac.in](mailto:edc@srkrec.ac.in)\n* **Facility Capabilities:** High-end fabrication maker space sanctioned by AICTE featuring industrial 3D printers, CNC laser cutting & engraving machines, PCB prototyping & milling units, IoT embedded test stations, and robotics assembly benches.`;
        nextSteps = [
          "Walk into the **AICTE IDEA Lab Building** during college hours to submit project ideas or use fabrication tools.",
          "Contact Coordinator Dr. G. Harish Kumar Varma (+91 8074589783) or Co-Coordinator Sri K. Pavan Kumar for training sessions and maker certifications.",
          "Participate in ideathons, student hackathons, and product prototyping sprints announced on the campus notice board."
        ];
        suggestedDesk = escalationData.desks.find(d => d.id === 'aicte_idea_lab');
      } else {
        textAnswer = `**Campus Amenities & Facilities at SRKR**\n\n* **Sports & Fitness:** Full-size cricket field, football pitch, 400m track, outdoor basketball & volleyball courts, indoor badminton stadium, and modern gymnasium.\n* **Health Center:** On-campus dispensary with a resident doctor and nurse, first-aid supplies, and an emergency ambulance on 24/7 standby.\n* **Banking:** Full-service Union Bank of India (formerly Andhra Bank) branch with 24/7 ATM facility located inside the campus.\n* **Cafeteria:** Spacious hygiene-certified canteen serving South Indian snacks, meals, and fresh juices.\n* **Research Centers:** Geospatial Information Centre (GIC) with ISRO collaboration, Technology Incubation Centre, and MSME Business Incubator.`;
        nextSteps = [
          "Sports equipment can be borrowed from the Physical Education Department at the Indoor Stadium.",
          "For medical emergencies, report directly to the Dispensary near the Health Center block or call the campus emergency desk."
        ];
      }
      break;
    }

    case 'EVENTS_CLUBS': {
      textAnswer = `**Student Life, Events & Technical Clubs at SRKR**\n\n* **NIPUNA (National Level Technical Symposium):** Flagship annual mega-fest attracting engineering participants nationwide. Features live hackathons, paper presentations, robotics challenges, code golf, design sprints, and gaming arenas.\n* **SANKETHA & Branch Symposiums:** Annual departmental technical symposiums showcasing innovations in civil structures, VLSI designs, AI models, and mechanical robotics.\n* **Professional Societies:** Active student chapters of **CSI**, **IEEE**, **ACM**, **ISTE**, and **SAE India**.\n* **Clubs & Extracurriculars:** SRKR Coding Club, Google Developer Student Clubs (GDSC), Fine Arts & Literary Club, Drone Research Club.\n* **Community Service:** Active **NSS** (National Service Scheme) and **NCC** (National Cadet Corps) wings organizing blood donation camps, village upliftment, and tree plantation drives.`;
      nextSteps = [
        "To join technical student chapters (IEEE, CSI, ACM, ISTE), approach the respective faculty coordinator or student chapter office.",
        "Watch the college portal and campus notice boards for NIPUNA registrations, submission deadlines, and prize announcements.",
        "Check [www.srkrec.ac.in](https://www.srkrec.ac.in) for latest event schedules and live fest registrations."
      ];
      break;
    }

    case 'GRIEVANCE': {
      textAnswer = `**Student Grievance Redressal Committee (SGRC)**\n\nSRKR ensures fair, impartial, and rapid redressal of all student grievances:\n\n* **Scope:** Academic issues, internal mark disputes, library/canteen concerns, administrative delays, or faculty communication difficulties.\n* **Mechanism:** Every student has the right to be heard respectfully. Grievances are investigated by a committee comprising senior deans, faculty, and student representatives.`;
      nextSteps = [
        "**First Level Resolution:** Approach your Faculty Mentor or Head of Department (HOD) to resolve the issue at the branch level.",
        "**Formal Petition:** If unresolved, submit a formal written complaint to the Student Grievance Redressal Cell or email **grievances@srkrec.ac.in**.",
        "**Online Redressal:** You can also lodge grievances through the online Student Portal on [www.srkrec.ac.in](https://www.srkrec.ac.in).",
        "**Principal Appeal:** Matters requiring supreme administrative review can be submitted directly to the Principal's Office in the Administrative Building."
      ];
      suggestedDesk = escalationData.desks.find(d => d.id === 'student_grievance');
      break;
    }

    case 'ALUMNI': {
      textAnswer = `**SRKR Alumni Association Office & Global Coordination Cell**\n\n* **Office Location:** **AICTE IDEA Lab, 1st Floor**, SRKR Engineering College, China Amiram, Bhimavaram - 534204.\n* **Leadership & Coordinators:**\n  - **Dean, Student Affairs & Alumni:** **Dr. G. Harish Kumar Varma**\n  - **Alumni Coordinator:** **Dr. V. K. Viswanadha Raju** (Professor, Mechanical Dept)\n  - **Alumni Co-Coordinator:** **Dr. M. Anil Kumar** (Assistant Professor, Mechanical Dept)\n* **Direct Contact Numbers:** **+91 9848823332** / **08816-223332**\n* **Official Email:** [alumni@srkrec.ac.in](mailto:alumni@srkrec.ac.in) | [info@srkrec.ac.in](mailto:info@srkrec.ac.in)\n* **Official Alumni Portal:** [https://srkrec.almaconnect.com](https://srkrec.almaconnect.com)\n\n* **Transcripts & Credential Verification:** Official transcripts, marks cards, and sealed envelopes for WES / international universities are processed through the **Autonomous Examination Cell, Silver Jubilee Building 1st Floor** (Head: Dr. M. Siva Krishnam Raju, [coe@srkrec.ac.in](mailto:coe@srkrec.ac.in), portal: [www.srkrexams.in](https://www.srkrexams.in)).`;
      nextSteps = [
        "**Visit Alumni Office:** Walk into the **AICTE IDEA Lab, 1st Floor** during working hours (9:00 AM to 5:00 PM).",
        "**Call Coordinators:** Reach out directly at **+91 9848823332** or **08816-223332**, or email **alumni@srkrec.ac.in**.",
        "**Alumni Portal Registration:** Register and reconnect with fellow alumni at [srkrec.almaconnect.com](https://srkrec.almaconnect.com).",
        "**Official Transcripts / WES:** Submit requests to the Examination Cell on the **1st Floor, Silver Jubilee Building** or email **coe@srkrec.ac.in**."
      ];
      suggestedDesk = escalationData.desks.find(d => d.id === 'alumni_office');
      relevantLinks.push({ label: "SRKR Alumni Portal", url: "https://srkrec.almaconnect.com" });
      break;
    }

    case 'CONTACTS_VISIT': {
      if (q.includes('working hour') || q.includes('working hours') || q.includes('office hour') || q.includes('office hours') || q.includes('office timing') || q.includes('office timings') || (q.includes('timing') && q.includes('office')) || (q.includes('timings') && q.includes('office'))) {
        textAnswer = `**Administrative Office Working Hours - SRKR Engineering College**\n\n* **Working Days:** Monday to Saturday\n* **Official Working Hours:** **9:00 AM to 5:00 PM**\n* **Lunch Break:** **1:00 PM to 2:00 PM**\n* **Closed On:** Every Sunday, **Second Saturday** of every month, and all Government Public Holidays.\n\n* **Administrative Block Location:** Central Campus, Ground Floor (Admissions, Accounts, Fee & Scholarship Desks); 1st Floor (Principal's Chambers, Director's Office, Room 104 ICC / Women Protection Cell).\n* **Reception Phone Numbers:** **08816-223332**, **08816-229377** / Mobile: **+91 9848823332**`;
        nextSteps = [
          "Visit the administrative desks between 9:00 AM and 5:00 PM on any working day (excluding 1:00 PM - 2:00 PM lunch break).",
          "For fee receipts or scholarship biometric e-KYC, visit the Ground Floor Accounts Wing.",
          "For meeting the Principal, schedule an appointment via **principal@srkrec.ac.in** or call reception at **08816-223332**."
        ];
        suggestedDesk = escalationData.desks.find(d => d.id === 'principal_office');
      } else if (q.includes('principal') || q.includes('reception') || q.includes('director') || q.includes('contact number for principal')) {
        textAnswer = `**Principal's Office & Central Reception Contact Details**\n\n* **Principal:** **Dr. K. V. Murali Krishnam Raju**\n* **Director:** **Dr. M. Jagapathi Raju**\n* **Office Location:** **Administrative Building, 1st Floor**, SRKR Engineering College, SRKR Marg, China Amiram, Bhimavaram - 534204.\n\n* **Principal's Office & Reception Contact Numbers:**\n  - **Landline Reception:** **08816-223332**, **08816-229377**\n  - **Direct Mobile Helpline:** **+91 9848823332**\n* **Official Email Addresses:**\n  - Principal: [principal@srkrec.ac.in](mailto:principal@srkrec.ac.in)\n  - General Inquiries: [info@srkrec.ac.in](mailto:info@srkrec.ac.in)\n* **Office Timings:** 9:00 AM to 5:00 PM (Monday through Saturday, closed on 2nd Saturdays & Sundays).`;
        nextSteps = [
          "Call the Principal's Office reception desk at **08816-223332** or **08816-229377** during working hours (9:00 AM - 5:00 PM).",
          "For urgent administrative guidance, call the mobile helpline: **+91 9848823332**.",
          "For formal appointments or representations, write to **principal@srkrec.ac.in** with your name and agenda.",
          "Upon arriving on campus, collect your visitor badge at the Main Security Gate on SRKR Marg."
        ];
        suggestedDesk = escalationData.desks.find(d => d.id === 'principal_office');
      } else {
        textAnswer = `**SRKR Engineering College: Location, Timings & Contacts**\n\n* **Official Address:** SRKR Marg, China Amiram, Bhimavaram, West Godavari District, Andhra Pradesh, India - 534204.\n* **EAPCET / College Code:** **SRKR**\n* **How to Reach:**\n  - Located 3.5 km from **Bhimavaram Town Railway Station** (BVRT) and 4 km from **Bhimavaram Junction** (BVRM).\n  - Auto-rickshaws and college transit are readily available from both stations and the Bhimavaram APSRTC Bus Stand.\n  - Nearest Airports: Rajahmundry (RJA) ~80 km, Vijayawada (VGA) ~110 km.\n* **Administrative Working Hours:** 9:00 AM to 5:00 PM (Monday to Saturday; Closed on 2nd Saturdays, Sundays, and Public Holidays).\n* **Principal's Office Reception Numbers:** 08816-223332, 08816-229377 | Mobile: +91 9848823332\n* **Official Email Addresses:** principal@srkrec.ac.in | info@srkrec.ac.in`;
        nextSteps = [
          "**Visitors & Parents:** Report to the Main Reception / Security Desk at China Amiram entrance for visitor badge and campus directions.",
          "**Appointments:** For meeting the Principal or Dean, please schedule an appointment in advance via **principal@srkrec.ac.in** or call **08816-223332**.",
          "**Explore Campus:** Visit [www.srkrec.ac.in](https://www.srkrec.ac.in) for the digital campus map and department directories."
        ];
        suggestedDesk = escalationData.desks.find(d => d.id === 'principal_office');
      }
      break;
    }

    default: {
      textAnswer = `**Welcome to SRKR Engineering College (Autonomous), Bhimavaram**\n\nEstablished in 1980 by Sri Sagi Rama Krishnam Raju garu, SRKR is one of South India's premier autonomous institutions affiliated with JNTUK Kakinada and accredited with **NAAC 'A+' Grade (CGPA 3.42)** and NBA accreditations.\n\n* **EAPCET Code:** **SRKR**\n* **Location:** 30+ acre lush green campus in China Amiram, Bhimavaram, Andhra Pradesh.\n* **Academic Excellence:** Top-rated B.Tech & M.Tech programs in CSE, AI&DS, AIML, CSBS, IT, ECE, EEE, Mechanical, and Civil Engineering.\n* **Placements:** 1,500+ offers every year with packages up to ₹44 LPA from top recruiters like Amazon, Cisco, TCS, Infosys, and Cognizant.\n\nHow may I help you today? You can ask about **Admissions**, **Cutoffs & Codes**, **Fee & JVD Reimbursement**, **Exams & Attendance Rules**, **Hostels & Transport**, or **Placement Records**.`;
      nextSteps = [
        "Select your stakeholder role (Student, Parent, Recruiter, Alumni, Visitor) from the top bar to tailor information.",
        "Use the quick action buttons below for instant answers to frequently asked questions.",
        "Browse the official website at [www.srkrec.ac.in](https://www.srkrec.ac.in) for real-time notifications and exam circulars."
      ];
      break;
    }
  }

  // Stakeholder customization touch
  if (stakeholder === 'parent' && intent !== 'SENSITIVE_SAFETY') {
    textAnswer += `\n\n> 👨‍👩‍👦 **Note for Parents:** You can personally meet the Class Teacher, Faculty Mentor, or Head of Department regarding your ward's attendance and academic progress on any working Saturday. For hostel care matters, the resident wardens are available at **+91 8816 223332**.`;
  } else if (stakeholder === 'recruiter' && intent !== 'SENSITIVE_SAFETY') {
    textAnswer += `\n\n> 🏢 **Note for Corporate Partners:** SRKR's Placement Cell welcomes talent acquisition teams for on-campus and virtual hiring. Reach Dean Placements Dr. K. R. Satyanarayana at **dean.placements@srkrec.ac.in** (+91 9704195376).`;
  }

  return {
    response: textAnswer,
    intent,
    nextSteps,
    escalationDesk: suggestedDesk,
    officialLinks: relevantLinks
  };
}

/**
 * Call External LLM (Gemini / OpenAI API) if provided, otherwise fallback to local intelligent agent
 */
async function processChatMessage({ message, stakeholder = 'general', history = [], apiKey = null, provider = 'gemini' }) {
  const intent = detectIntent(message);
  const suggestedDesk = findEscalationDesk(intent, message);

  // If user provided a Gemini API Key, we can query Gemini with SRKR system instructions
  if (apiKey && apiKey.trim() && provider === 'gemini') {
    try {
      const response = await callGeminiAPI(apiKey.trim(), message, stakeholder, history);
      return {
        response: response.text,
        intent,
        nextSteps: response.nextSteps || [
          "Visit [www.srkrec.ac.in](https://www.srkrec.ac.in) for updated notices.",
          "Contact the designated office in the Administrative Block if further procedural action is needed."
        ],
        escalationDesk: suggestedDesk,
        officialLinks: [
          { label: "SRKR Official Portal", url: "https://www.srkrec.ac.in" }
        ],
        modelUsed: "gemini"
      };
    } catch (err) {
      console.warn("Gemini API call failed, falling back to local agent:", err.message);
      // Fallback cleanly to high-precision built-in agent
    }
  }

  // Built-in intelligent agent response
  const agentOutput = generateBuiltInResponse(intent, message, stakeholder);
  return {
    ...agentOutput,
    modelUsed: "srkr-builtin-agent"
  };
}

/**
 * Gemini API call helper
 */
async function callGeminiAPI(apiKey, prompt, stakeholder, history = []) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const formattedContents = [];
  
  // Provide system context in prompt
  formattedContents.push({
    role: "user",
    parts: [{ text: `${SYSTEM_PERSONA}\n\nSTAKEHOLDER PERSPECTIVE: The user is a ${stakeholder}.\n\nCOLLEGE KNOWLEDGE BASE SUMMARY:\n${JSON.stringify(srkrData.institution, null, 2)}\nDepartments: ${srkrData.departments.map(d => d.name + ' (' + d.code + ')').join(', ')}\nEAPCET Code: SRKR\nPrincipal: Dr. K.V. Murali Krishnam Raju\nDean Placements: Dr. K. R. Satyanarayana\nWebsite: www.srkrec.ac.in` }]
  });
  formattedContents.push({
    role: "model",
    parts: [{ text: "Understood. I am the friendly AI assistant for SRKR Engineering College, ready to assist all stakeholders with accurate guidance, clear next steps, and official office contacts." }]
  });

  // Add conversation history
  for (const turn of history.slice(-6)) {
    formattedContents.push({
      role: turn.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: turn.content }]
    });
  }

  formattedContents.push({
    role: "user",
    parts: [{ text: prompt }]
  });

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: formattedContents,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1000
      }
    })
  });

  if (!res.ok) {
    throw new Error(`Gemini API returned status ${res.status}`);
  }

  const data = await res.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Thank you for reaching out to SRKR Engineering College.";
  
  return {
    text: rawText,
    nextSteps: [
      "Refer to [www.srkrec.ac.in](https://www.srkrec.ac.in) for latest announcements and official circulars.",
      "Reach out to the relevant department HOD or administrative office in China Amiram, Bhimavaram for formal assistance."
    ]
  };
}

  window.SRKRAgent = {
    processChatMessage,
    detectIntent,
    findEscalationDesk,
    generateBuiltInResponse,
    srkrData,
    escalationData
  };
})(typeof window !== 'undefined' ? window : this);
