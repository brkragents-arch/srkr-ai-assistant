// SRKR AI Assistant Frontend Controller
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const chatMessages = document.getElementById('chatMessages');
  const stakeholderTopContainer = document.getElementById('stakeholderTopContainer');
  const messagesStream = document.getElementById('messagesStream');
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  const micBtn = document.getElementById('micBtn');
  const stakeholderPills = document.querySelectorAll('.stakeholder-pill');
  const currentStakeholderName = document.getElementById('currentStakeholderName');
  const clearChatBtn = document.getElementById('clearChatBtn');
  const exportChatBtn = document.getElementById('exportChatBtn');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  
  // Modals
  const desksModal = document.getElementById('desksModal');
  const deptsModal = document.getElementById('deptsModal');
  const campusModal = document.getElementById('campusModal');
  const settingsModal = document.getElementById('settingsModal');

  // Trigger buttons
  const openDesksBtn = document.getElementById('openDesksBtn');
  const openDeptsBtn = document.getElementById('openDeptsBtn');
  const openCampusBtn = document.getElementById('openCampusBtn');
  const openSettingsBtn = document.getElementById('openSettingsBtn');
  const closeButtons = document.querySelectorAll('.btn-close, .btn-modal-close');

  // Settings form elements
  const apiKeyInput = document.getElementById('apiKeyInput');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const resetSettingsBtn = document.getElementById('resetSettingsBtn');

  // State
  let currentStakeholder = localStorage.getItem('srkr_stakeholder') || 'general';
  let conversationHistory = [];
  let isListening = false;
  let recognition = null;
  let synth = window.speechSynthesis;
  let currentUtterance = null;
  let activeTurnContainer = null;

  // Stakeholder Comprehensive Briefings (Displayed on TOP upon selection)
  const STAKEHOLDER_BRIEFINGS = {
    general: {
      badge: "Official College Advisor",
      title: "🎓 S.R.K.R. Engineering College (Autonomous)",
      desc: "Premier autonomous institution established in 1980, affiliated with JNTUK Kakinada, and accredited with NAAC 'A+' Grade (CGPA 3.42) and NBA accreditation. EAPCET Counseling Code: SRKR.",
      highlights: [
        { title: "EAPCET Code", text: "SRKR (Convener Quota Category-A & B)" },
        { title: "Principal's Office Reception", text: "08816-223332, 08816-229377 | Mobile: +91 9848823332 (Admin Building 1st Floor)" },
        { title: "Autonomous Exam Cell (COE)", text: "Dr. M. Siva Krishnam Raju | Silver Jubilee Building, 1st Floor | srkrexams.in | 08816-223332" },
        { title: "Training & Placement (T&P)", text: "Dr. K. R. Satyanarayana | Silver Jubilee Building, Ground Floor | Highest: ₹44 LPA" }
      ]
    },
    student: {
      badge: "Student Academics & Exams",
      title: "🎒 Student Academic & Examination Perspective",
      desc: "Clear guidance on autonomous curriculum (R20/R23), mandatory attendance policies, examination cell procedures, and placement prep.",
      highlights: [
        { title: "Mandatory Attendance", text: "75% minimum aggregate required. Condonation (65%-74%) on medical grounds with fee. Less than 65% is strictly DETAINED." },
        { title: "Autonomous Exam Cell (COE)", text: "Dr. M. Siva Krishnam Raju | Silver Jubilee Building, 1st Floor | Portal: www.srkrexams.in | 08816-223332" },
        { title: "Training & Placement Cell", text: "Dr. K. R. Satyanarayana | Silver Jubilee Building, Ground Floor | CRT bootcamps & hiring drives" },
        { title: "Revaluation Procedure", text: "Apply within 10 days of results declaration via www.srkrexams.in or at the COE Office in Silver Jubilee Building 1st Floor." }
      ]
    },
    parent: {
      badge: "Parent & Guardian Desk",
      title: "👨‍👩‍👧 Parent Admissions, Safety & Fee Perspective",
      desc: "Comprehensive guidance for parents regarding admissions, JVD tuition fee reimbursement, residential hostel safety, and academic progress.",
      highlights: [
        { title: "Admissions Quotas", text: "Category-A (70% seats via AP EAPCET code SRKR) & Category-B (30% Management quota based on JEE/10+2 marks)." },
        { title: "JVD 100% Fee Reimbursement", text: "Full tuition reimbursement credited to student mother's account by AP Govt under Jagananna Vidya Deevena." },
        { title: "Hostel Safety & Wardens", text: "Separate secure residential hostels for boys and girls with 24/7 security, biometric gates, and resident lady wardens." },
        { title: "Principal Reception & Contact", text: "08816-223332, 08816-229377 / Mobile: +91 9848823332. Meet mentors and HODs on working Saturdays." }
      ]
    },
    recruiter: {
      badge: "Corporate Talent Acquisition",
      title: "🏢 Recruiter & Corporate Relations Perspective",
      desc: "Streamlined recruitment coordination, candidate talent pool statistics, on-campus evaluation labs, and hiring drive scheduling.",
      highlights: [
        { title: "Training & Placement Office", text: "Silver Jubilee Building, Ground Floor | Dean: Dr. K. R. Satyanarayana (+91 9704195376)" },
        { title: "Placement Records", text: "Over 1,500+ offers annually across 80+ premier tech companies. Highest Package: ₹44 LPA | Average: ₹5.5 - ₹6.5 LPA." },
        { title: "Assessment Infrastructure", text: "Modern 500+ terminal online testing centre, video conferencing interview suites, and auditorium facilities." },
        { title: "Corporate Contact", text: "dean.placements@srkrec.ac.in | corporaterelations@srkrec.ac.in | Phone: 08816-223332" }
      ]
    },
    alumni: {
      badge: "SRKR Alumni Network",
      title: "🌟 Alumni Credential Services & Engagement",
      desc: "Fast-track transcript issuance for higher studies / WES evaluation, alumni association networking, and campus mentorship opportunities.",
      highlights: [
        { title: "Alumni Association Office", text: "AICTE IDEA Lab, 1st Floor | Dean: Dr. G. Harish Kumar Varma | Coordinator: Dr. V. K. Viswanadha Raju" },
        { title: "Alumni Contact & Portal", text: "Phone: +91 9848823332, 08816-223332 | Email: alumni@srkrec.ac.in | Portal: srkrec.almaconnect.com" },
        { title: "Degree Transcripts & WES", text: "Issued by Autonomous Exam Cell, Silver Jubilee Building 1st Floor (Head: Dr. M. Siva Krishnam Raju | srkrexams.in)." },
        { title: "Campus Mentorship", text: "Alumni are warmly welcomed on campus to deliver guest lectures or mentor student project clubs." }
      ]
    },
    visitor: {
      badge: "Campus Navigation & Visitor Desk",
      title: "🏛️ Visitor, Guest & Landmark Perspective",
      desc: "Detailed campus directions from Bhimavaram stations, administrative office working hours, and campus landmark locations.",
      highlights: [
        { title: "Administrative Working Hours", text: "9:00 AM to 5:00 PM (Monday–Saturday; Lunch Break: 1:00 PM – 2:00 PM; Closed on 2nd Saturdays & Sundays)." },
        { title: "Principal's Office Reception", text: "08816-223332, 08816-229377 | Mobile: +91 9848823332 | Location: Administrative Building, 1st Floor" },
        { title: "Key Building Landmarks", text: "Silver Jubilee Building (Ground: T&P Cell; 1st Floor: Exam Cell), AICTE IDEA Lab (1st Floor: Alumni Office), Admin Block" },
        { title: "Campus Address", text: "SRKR Marg, China Amiram, Bhimavaram - 534204 (3.5 km from Town station & 4 km from Junction)." }
      ]
    }
  };

  // Stakeholder Quick Prompts
  const STAKEHOLDER_PROMPTS = {
    general: [
      { text: "What is the EAPCET counseling code for SRKR?", icon: "🎯" },
      { text: "What are the administrative office working hours?", icon: "⏰" },
      { text: "Contact number for Principal's Office reception", icon: "📞" },
      { text: "Where is Autonomous Exam Cell and Placement Cell located?", icon: "🏢" },
      { text: "Where is the Alumni Association Office located and contact details?", icon: "🌟" },
      { text: "Tell me about placement records & top recruiters", icon: "💼" },
      { text: "Show complete campus landmarks and building details", icon: "🗺️" }
    ],
    student: [
      { text: "Where is the Autonomous Exam Cell located and who is the COE?", icon: "👨‍🏫" },
      { text: "Where is the Training and Placement Cell located in campus?", icon: "🏢" },
      { text: "What is the attendance criteria to write semester exams?", icon: "📊" },
      { text: "How do I apply for revaluation or recounting?", icon: "📝" },
      { text: "Procedure for getting official transcripts and WES verification", icon: "📜" },
      { text: "What are the administrative office working hours?", icon: "⏰" },
      { text: "Contact number for Principal's Office reception", icon: "📞" }
    ],
    parent: [
      { text: "What are the administrative office working hours?", icon: "⏰" },
      { text: "Contact number for Principal's Office reception", icon: "📞" },
      { text: "What are the B.Tech tuition fees and JVD reimbursement eligibility?", icon: "💳" },
      { text: "Hostel safety, resident wardens, and visiting hours", icon: "🛡️" },
      { text: "How to reach the campus from Bhimavaram Railway Station?", icon: "🗺️" },
      { text: "Show complete campus landmarks and facilities", icon: "🏛️" }
    ],
    recruiter: [
      { text: "Where is the Training & Placement Cell and assessment lab located?", icon: "🏢" },
      { text: "Who is the Dean of Placements and how do we schedule a drive?", icon: "🤝" },
      { text: "What are the student branch intake statistics and CGPA distribution?", icon: "📊" },
      { text: "Past placement records, packages, and recruiting companies", icon: "🏆" },
      { text: "Contact number for Principal's Office reception", icon: "📞" }
    ],
    alumni: [
      { text: "Where is the Alumni Office located and what are the contact details?", icon: "🏛️" },
      { text: "Contact details of Controller of Examination for transcripts", icon: "👨‍🏫" },
      { text: "How do I request consolidated transcripts for higher studies?", icon: "📜" },
      { text: "How to register with the SRKR Global Alumni Association?", icon: "🌐" },
      { text: "Can alumni deliver guest webinars or mentor students?", icon: "💡" }
    ],
    visitor: [
      { text: "What are the administrative office working hours?", icon: "⏰" },
      { text: "Contact number for Principal's Office reception", icon: "📞" },
      { text: "Where is the Silver Jubilee Building and AICTE IDEA Lab located?", icon: "🏢" },
      { text: "Show complete campus landmarks and building details", icon: "🗺️" },
      { text: "How to reach SRKR Engineering College from Bhimavaram Railway Station?", icon: "📍" }
    ]
  };

  // Render Top Stakeholder Perspective Card (Always on TOP)
  function renderStakeholderTopCard(role) {
    const data = STAKEHOLDER_BRIEFINGS[role] || STAKEHOLDER_BRIEFINGS.general;
    const prompts = STAKEHOLDER_PROMPTS[role] || STAKEHOLDER_PROMPTS.general;

    stakeholderTopContainer.innerHTML = `
      <div class="stakeholder-top-card">
        <div class="top-card-header">
          <div class="top-card-title">
            <span>${data.title}</span>
          </div>
          <span class="top-card-badge">${data.badge}</span>
        </div>
        <p class="top-card-content">${data.desc}</p>
        
        <div class="top-card-highlights">
          ${data.highlights.map(h => `
            <div class="highlight-box">
              <span class="highlight-title">${h.title}</span>
              <span class="highlight-text">${h.text}</span>
            </div>
          `).join('')}
        </div>

        <div style="margin-top: 6px;">
          <div style="font-size: 0.76rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.4px;">
            ⚡ Quick Inquiries for this Perspective:
          </div>
          <div class="prompt-chips" id="topPromptChips">
            ${prompts.map(p => `
              <button class="prompt-chip" data-prompt="${p.text}">
                <span>${p.icon}</span> <span>${p.text}</span>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Attach click listeners to top prompt chips
    const chipButtons = stakeholderTopContainer.querySelectorAll('.prompt-chip');
    chipButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const query = btn.dataset.prompt;
        chatInput.value = query;
        sendMessage(query);
      });
    });

    // Keep scroll at top so the selected perspective results are directly visible
    chatMessages.scrollTop = 0;
  }

  // Set Stakeholder perspective
  function setStakeholder(role) {
    currentStakeholder = role;
    localStorage.setItem('srkr_stakeholder', role);

    stakeholderPills.forEach(pill => {
      if (pill.dataset.stakeholder === role) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    const roleTitles = {
      general: 'All / General',
      student: 'Student',
      parent: 'Parent',
      recruiter: 'Recruiter',
      alumni: 'Alumni',
      visitor: 'Visitor'
    };

    if (currentStakeholderName) {
      currentStakeholderName.textContent = roleTitles[role] || 'General';
    }

    // Render results on TOP immediately
    renderStakeholderTopCard(role);
    renderQuickChips(role);
  }

  stakeholderPills.forEach(pill => {
    pill.addEventListener('click', () => {
      setStakeholder(pill.dataset.stakeholder);
    });
  });

  // Speech Recognition
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRec();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      chatInput.value = transcript;
      chatInput.dispatchEvent(new Event('input'));
      stopListening();
      sendMessage(transcript);
    };

    recognition.onerror = () => stopListening();
    recognition.onend = () => stopListening();
  } else {
    micBtn.style.display = 'none';
  }

  function startListening() {
    if (!recognition) return;
    try {
      recognition.start();
      isListening = true;
      micBtn.classList.add('active');
      micBtn.title = "Listening... Speak now";
    } catch (e) {
      console.warn("Speech recognition error:", e);
    }
  }

  function stopListening() {
    isListening = false;
    micBtn.classList.remove('active');
    micBtn.title = "Voice Input (Speech-to-Text)";
    try { recognition.stop(); } catch (e) {}
  }

  micBtn.addEventListener('click', () => {
    if (isListening) stopListening();
    else startListening();
  });

  // Auto-resize chat textarea
  chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
    sendBtn.disabled = !chatInput.value.trim();
  });

  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (text) sendMessage(text);
    }
  });

  sendBtn.addEventListener('click', () => {
    const text = chatInput.value.trim();
    if (text) sendMessage(text);
  });

  // Markdown Formatter
  function formatMarkdown(text) {
    if (!text) return '';
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
      .replace(/^\s*\-\s+(.*$)/gim, '<li>$1</li>')
      .replace(/^\s*\*\s+(.*$)/gim, '<li>$1</li>')
      .replace(/^\s*(\d+)\.\s+(.*$)/gim, '<li><strong>$1.</strong> $2</li>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br/>');

    html = `<p>${html}</p>`;
    html = html.replace(/<p><\/p>/g, '')
               .replace(/<p>(<h[1-3]>)/g, '$1').replace(/(<\/h[1-3]>)<\/p>/g, '$1')
               .replace(/<p>(<blockquote>)/g, '$1').replace(/(<\/blockquote>)<\/p>/g, '$1');
    return html;
  }

  // Quick Suggested Questions for Each Stakeholder Perspective (Interactive Touch Chips)
  const quickQuestionsByStakeholder = {
    general: [
      { label: "🎓 Admissions & Cutoffs", query: "What is the admission procedure, cutoffs, and convener quota?" },
      { label: "📊 Autonomous COE & Exams", query: "Who is Controller of Examination and how to apply for transcripts?" },
      { label: "💼 Highest Placement CTC", query: "What are the latest placement records, highest CTC, and top recruiters?" },
      { label: "📚 Academic Departments", query: "Show all academic departments, HOD names, and emails" },
      { label: "🏃‍♂️ Physical Director", query: "Who is the Physical Director and contact number?" },
      { label: "📖 Central Library", query: "Who is the Librarian and central library timings?" },
      { label: "🧪 AICTE IDEA Lab", query: "Tell me about AICTE IDEA Lab incharge and facilities" },
      { label: "📍 Campus Landmarks", query: "Show complete campus landmarks and buildings" },
      { label: "🚌 Bus Routes & Transport", query: "What are the college bus routes, coverage, and pass details?" },
      { label: "🚨 Anti-Ragging Helpline", query: "Anti-ragging helpline and squad details" },
      { label: "🕒 Office Timings", query: "What are the administrative office working hours?" }
    ],
    student: [
      { label: "⚠️ Attendance Below 75%", query: "What is the attendance criteria and condonation policy?" },
      { label: "📜 Official Transcripts", query: "How to apply for official transcripts and grade memo corrections?" },
      { label: "💻 CS & IT Department", query: "Tell me about CS & IT department HOD, intake and email" },
      { label: "🏃‍♂️ Sports Trials & PD", query: "Who is the Physical Director and sports facilities?" },
      { label: "🧪 IDEA Lab Prototyping", query: "Details of AICTE Idea Lab incharge and maker space" },
      { label: "📖 Digital Library Lab", query: "What are the Central Library timings and e-resources?" },
      { label: "🎉 NIPUNA Tech Fest", query: "Tell me about NIPUNA symposium and student technical clubs" },
      { label: "💼 Placement Training", query: "When does campus placement training start and who is Dean Placements?" },
      { label: "⚖️ Grievance Redressal", query: "How can a student submit a grievance to SGRC?" }
    ],
    parent: [
      { label: "💰 Tuition Fee & JVD", query: "What is the B.Tech tuition fee and Jagananna Vidya Deevena (JVD) process?" },
      { label: "🏠 Hostels & Food Safety", query: "Are there safe hostel facilities and hygienic mess for boys and girls?" },
      { label: "🛡️ Campus Discipline", query: "What measures are in place for campus safety and anti-ragging?" },
      { label: "📞 Principal Reception", query: "Contact number for Principal's Office reception" },
      { label: "🕒 Administrative Timings", query: "What are the administrative office working hours?" },
      { label: "🎓 Category-B Management Seats", query: "How to get Category B management seat and eligibility?" }
    ],
    recruiter: [
      { label: "💼 Dean Placements Contact", query: "We want to hire students from SRKR for software engineer roles" },
      { label: "📈 Placement Statistics", query: "What are the placement statistics and highest package?" },
      { label: "🏢 Host Campus Drive", query: "How can our company register for campus recruitment drive?" },
      { label: "💻 CSE & CSIT Branches", query: "What are the computing branches and student intakes?" },
      { label: "🧪 IDEA Lab Innovations", query: "Tell me about AICTE IDEA Lab incharge and student prototypes" }
    ],
    alumni: [
      { label: "🌟 Alumni Office Location", query: "Where is the Alumni Office located and contact details?" },
      { label: "📜 Official Transcripts / WES", query: "How can alumni get sealed transcripts for WES or foreign universities?" },
      { label: "🌐 Official Alumni Portal", query: "What is the official SRKR Alumni portal link?" },
      { label: "📞 Alumni Coordinator", query: "Who are the Alumni coordinators and contact numbers?" },
      { label: "🎓 Autonomous Exam Cell", query: "Check the name and contact details of controller of examination" }
    ],
    visitor: [
      { label: "📍 Campus Landmarks Directory", query: "Show complete campus landmarks and buildings" },
      { label: "⏰ Visiting Hours & Gate Protocol", query: "What are visitor security procedures and office hours?" },
      { label: "🚆 How to Reach from Station", query: "How to reach SRKR Engineering College from Bhimavaram railway station?" },
      { label: "🏦 On-Campus Bank & ATM", query: "Is there a bank and ATM facility on campus?" },
      { label: "📞 Reception Desk Helpline", query: "Contact number for Principal's Office reception" }
    ]
  };

  function renderQuickChips(stakeholderKey) {
    const track = document.getElementById('quickChipsTrack');
    if (!track) return;
    const chips = quickQuestionsByStakeholder[stakeholderKey] || quickQuestionsByStakeholder.general;
    track.innerHTML = chips.map(c => `
      <button class="quick-chip" type="button" data-query="${c.query.replace(/"/g, '&quot;')}">
        ${c.label}
      </button>
    `).join('');

    track.querySelectorAll('.quick-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const query = btn.dataset.query;
        if (query) {
          sendMessage(query);
        }
      });
    });
  }

  // Interactive Toast Notification
  function showToast(message) {
    const toast = document.getElementById('toastNotification');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('active');
    setTimeout(() => {
      toast.classList.remove('active');
    }, 2500);
  }

  function speakText(text, btnElement) {
    if (!synth) return;
    if (synth.speaking) {
      synth.cancel();
      if (btnElement) btnElement.innerHTML = `🔊 Listen`;
      return;
    }
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/>/g, '');

    currentUtterance = new SpeechSynthesisUtterance(cleanText);
    currentUtterance.rate = 1.0;
    if (btnElement) {
      btnElement.innerHTML = `⏹️ Stop`;
      currentUtterance.onend = () => { btnElement.innerHTML = `🔊 Listen`; };
      currentUtterance.onerror = () => { btnElement.innerHTML = `🔊 Listen`; };
    }
    synth.speak(currentUtterance);
  }

  function copyToClipboard(text, btnElement) {
    navigator.clipboard.writeText(text).then(() => {
      const originalText = btnElement.innerHTML;
      btnElement.innerHTML = '✓ Copied';
      showToast('Response copied to clipboard! 📋');
      setTimeout(() => { btnElement.innerHTML = originalText; }, 2000);
    });
  }

  // Build Bot Response Bubble
  function buildBotRow(data, rawText) {
    const row = document.createElement('div');
    row.className = 'message-row bot';

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = `<img src="/assets/srkr-logo.png" alt="SRKR Emblem" />`;

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'message-content-wrapper';

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.innerHTML = formatMarkdown(data.response || rawText);

    // Next steps
    if (data.nextSteps && data.nextSteps.length > 0) {
      const stepsContainer = document.createElement('div');
      stepsContainer.className = 'next-steps-container';
      stepsContainer.innerHTML = `
        <div class="next-steps-header">
          <span>⚡</span> Actionable Next Steps
        </div>
        <div class="step-list">
          ${data.nextSteps.map((step, idx) => `
            <div class="step-item">
              <span class="step-number">${idx + 1}</span>
              <div>${formatMarkdown(step)}</div>
            </div>
          `).join('')}
        </div>
      `;
      bubble.appendChild(stepsContainer);
    }

    // Escalation Desk Card with HIGH-CONTRAST VISIBLE BUTTONS
    if (data.escalationDesk) {
      const desk = data.escalationDesk;
      const isCritical = desk.urgency === 'CRITICAL' || desk.category === 'SENSITIVE_SAFETY';
      const escalationCard = document.createElement('div');
      escalationCard.className = `escalation-card ${isCritical ? 'critical' : ''}`;
      
      const phoneDigits = (desk.phone || '').split('/')[0].replace(/[^0-9+]/g, '');

      escalationCard.innerHTML = `
        <div class="escalation-header">
          <div class="escalation-title">
            <span>${isCritical ? '🚨' : '🏛️'}</span>
            <span>${desk.name}</span>
          </div>
          <span class="escalation-badge ${isCritical ? 'badge-critical' : 'badge-official'}">
            ${isCritical ? 'High Priority' : 'Official College Office'}
          </span>
        </div>
        <div class="escalation-details">
          <div class="escalation-detail-row">
            <span class="detail-icon">👤</span>
            <span><strong>Head:</strong> ${desk.head}</span>
          </div>
          <div class="escalation-detail-row">
            <span class="detail-icon">📍</span>
            <span><strong>Location:</strong> ${desk.location}</span>
          </div>
          <div class="escalation-detail-row">
            <span class="detail-icon">📞</span>
            <span><strong>Phone:</strong> ${desk.phone}</span>
          </div>
          ${desk.portal ? `
            <div class="escalation-detail-row">
              <span class="detail-icon">🌐</span>
              <span><strong>Exams Portal:</strong> <a href="${desk.portal}" target="_blank" rel="noopener noreferrer">${desk.portal}</a></span>
            </div>
          ` : ''}
          ${desk.tollFree ? `
            <div class="escalation-detail-row">
              <span class="detail-icon">🆘</span>
              <span><strong>Toll-Free Helpline:</strong> ${desk.tollFree}</span>
            </div>
          ` : ''}
          <div class="escalation-detail-row">
            <span class="detail-icon">✉️</span>
            <span><strong>Email:</strong> ${desk.email}</span>
          </div>
        </div>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">
          ${desk.actionGuidance || ''}
        </p>
        <div class="escalation-action-bar">
          <a href="tel:${phoneDigits}" class="btn-contact btn-contact-call">
            <span>📞</span> Call Office (${phoneDigits})
          </a>
          <a href="mailto:${desk.email}" class="btn-contact btn-contact-email">
            <span>✉️</span> Email Office (${desk.email})
          </a>
        </div>
      `;
      bubble.appendChild(escalationCard);
    }

    // Toolbar
    const metaBar = document.createElement('div');
    metaBar.className = 'message-meta-bar';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn-msg-action';
    copyBtn.innerHTML = `📋 Copy`;
    copyBtn.addEventListener('click', () => copyToClipboard(data.response || rawText, copyBtn));

    const listenBtn = document.createElement('button');
    listenBtn.className = 'btn-msg-action';
    listenBtn.innerHTML = `🔊 Listen`;
    listenBtn.addEventListener('click', () => speakText(data.response || rawText, listenBtn));

    const thumbUpBtn = document.createElement('button');
    thumbUpBtn.className = 'btn-feedback';
    thumbUpBtn.title = 'Helpful response';
    thumbUpBtn.innerHTML = `👍`;
    thumbUpBtn.addEventListener('click', () => {
      thumbUpBtn.classList.toggle('active');
      thumbDownBtn.classList.remove('active');
      showToast('Thank you for your feedback! 👍');
    });

    const thumbDownBtn = document.createElement('button');
    thumbDownBtn.className = 'btn-feedback';
    thumbDownBtn.title = 'Needs improvement';
    thumbDownBtn.innerHTML = `👎`;
    thumbDownBtn.addEventListener('click', () => {
      thumbDownBtn.classList.toggle('active');
      thumbUpBtn.classList.remove('active');
      showToast('Thanks for your feedback. We will refine this guidance.');
    });

    const timeStamp = document.createElement('span');
    timeStamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    metaBar.appendChild(copyBtn);
    metaBar.appendChild(listenBtn);
    metaBar.appendChild(thumbUpBtn);
    metaBar.appendChild(thumbDownBtn);
    metaBar.appendChild(timeStamp);

    contentWrapper.appendChild(bubble);
    contentWrapper.appendChild(metaBar);

    row.appendChild(avatar);
    row.appendChild(contentWrapper);

    return row;
  }

  // Build User Message Bubble
  function buildUserRow(text) {
    const row = document.createElement('div');
    row.className = 'message-row user';

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = `<span>👤</span>`;

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'message-content-wrapper';

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = text;

    const timeStamp = document.createElement('div');
    timeStamp.className = 'message-meta-bar';
    timeStamp.style.justifyContent = 'flex-end';
    timeStamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    contentWrapper.appendChild(bubble);
    contentWrapper.appendChild(timeStamp);

    row.appendChild(avatar);
    row.appendChild(contentWrapper);

    return row;
  }

  // Show Typing Indicator (Prepended in descending mode)
  function showTypingIndicator() {
    const row = document.createElement('div');
    row.className = 'message-row bot';
    row.id = 'typingIndicatorRow';

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = `<img src="/assets/srkr-logo.png" alt="SRKR" />`;

    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = `
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    `;

    row.appendChild(avatar);
    row.appendChild(indicator);
    
    // In descending order, typing indicator appears at the top of active turn
    if (activeTurnContainer) {
      activeTurnContainer.appendChild(row);
    } else {
      messagesStream.prepend(row);
    }
  }

  function removeTypingIndicator() {
    const el = document.getElementById('typingIndicatorRow');
    if (el) el.remove();
  }

  // Send message - History in DESCENDING ORDER (Newest on TOP)
  async function sendMessage(text) {
    if (!text.trim()) return;

    chatInput.value = '';
    chatInput.style.height = 'auto';
    sendBtn.disabled = true;

    // Create a new Turn Container for this interaction
    const turnContainer = document.createElement('div');
    turnContainer.className = 'turn-container';
    turnContainer.style.display = 'flex';
    turnContainer.style.flexDirection = 'column';
    turnContainer.style.gap = '12px';
    turnContainer.style.marginBottom = '20px';

    const userRow = buildUserRow(text);
    turnContainer.appendChild(userRow);

    // PREPEND to messagesStream: Newest interaction appears on TOP!
    messagesStream.prepend(turnContainer);
    activeTurnContainer = turnContainer;

    conversationHistory.push({ role: 'user', content: text });
    showTypingIndicator();

    // Smoothly ensure user views the newest interaction at top
    chatMessages.scrollTop = 0;

    const storedKey = localStorage.getItem('srkr_gemini_api_key') || null;

    try {
      let data = null;

      // Check if running in static/Pages mode or local server
      const isStaticOrPages = window.location.protocol === 'file:' || 
                             window.location.hostname.endsWith('github.io') ||
                             window.location.hostname.endsWith('pages.dev');

      if (!isStaticOrPages) {
        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: text,
              stakeholder: currentStakeholder,
              history: conversationHistory,
              apiKey: storedKey,
              provider: 'gemini'
            })
          });

          if (response.ok) {
            data = await response.json();
          }
        } catch (fetchErr) {
          console.warn('Backend /api/chat not reachable, defaulting to client engine:', fetchErr);
        }
      }

      // If backend was not reached or running on GitHub Pages / client-side standalone
      if (!data && window.SRKRAgent && typeof window.SRKRAgent.processChatMessage === 'function') {
        data = await window.SRKRAgent.processChatMessage({
          message: text,
          stakeholder: currentStakeholder,
          history: conversationHistory,
          apiKey: storedKey,
          provider: 'gemini'
        });
      }

      removeTypingIndicator();

      if (!data) {
        throw new Error('No response generated by assistant engine');
      }

      const botRow = buildBotRow(data, data.response);
      turnContainer.appendChild(botRow);
      conversationHistory.push({ role: 'assistant', content: data.response });

    } catch (err) {
      removeTypingIndicator();
      console.error('Chat error:', err);
      const botRow = buildBotRow({
        response: `**I encountered a connection issue while contacting the SRKR AI service.**\n\nPlease check your network connection or try again. For urgent inquiries, contact the college office at **08816-223332** or **principal@srkrec.ac.in**.`,
        nextSteps: [
          "Check your network connection and retry your question.",
          "Visit the official website directly at [www.srkrec.ac.in](https://www.srkrec.ac.in)."
        ],
        escalationDesk: {
          name: "Principal's Office & Central Reception",
          head: "Dr. K. V. Murali Krishnam Raju (Principal)",
          location: "Administrative Building, 1st Floor",
          phone: "08816-223332",
          email: "principal@srkrec.ac.in",
          urgency: "NORMAL"
        }
      });
      turnContainer.appendChild(botRow);
    } finally {
      activeTurnContainer = null;
      chatMessages.scrollTop = 0;
    }
  }

  // Clear Chat History
  clearChatBtn.addEventListener('click', () => {
    if (confirm('Clear the conversation history? The active stakeholder perspective card will remain at the top.')) {
      conversationHistory = [];
      messagesStream.innerHTML = '';
      chatMessages.scrollTop = 0;
    }
  });

  // Export Chat History
  exportChatBtn.addEventListener('click', () => {
    if (conversationHistory.length === 0) {
      alert('No messages to export yet.');
      return;
    }

    let transcript = `# SRKR Engineering College - AI Assistant Chat Transcript\n`;
    transcript += `Date: ${new Date().toLocaleString()}\n`;
    transcript += `Stakeholder Perspective: ${currentStakeholder.toUpperCase()}\n`;
    transcript += `Official Portal: https://www.srkrec.ac.in\n`;
    transcript += `Examination Portal: https://www.srkrexams.in\n\n---\n\n`;

    conversationHistory.forEach(turn => {
      transcript += `### ${turn.role === 'user' ? 'Stakeholder / User' : 'SRKR AI Assistant'}:\n`;
      transcript += `${turn.content}\n\n`;
    });

    const blob = new Blob([transcript], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `srkr-assistant-transcript-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Theme Toggle
  const savedTheme = localStorage.getItem('srkr_theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  themeToggleBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('srkr_theme', next);
    updateThemeIcon(next);
  });

  function updateThemeIcon(theme) {
    themeToggleBtn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
  }

  // Modal Handlers
  function openModal(modal) { modal.classList.add('active'); }
  function closeModal(modal) { modal.classList.remove('active'); }

  closeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal-overlay');
      if (modal) closeModal(modal);
    });
  });

  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) closeModal(e.target);
  });

  // Load Desks Modal
  openDesksBtn.addEventListener('click', async () => {
    openModal(desksModal);
    const container = document.getElementById('desksListContainer');
    if (!container.dataset.loaded) {
      try {
        let desks;
        if (window.escalationDirectoryData && Array.isArray(window.escalationDirectoryData.desks)) {
          desks = window.escalationDirectoryData.desks;
        } else {
          const res = await fetch('/api/escalation');
          desks = await res.json();
        }
        container.innerHTML = `
          <div class="desk-card-list">
            ${desks.map(desk => {
              const phoneDigits = (desk.phone || '').split('/')[0].replace(/[^0-9+]/g, '');
              return `
                <div class="desk-item">
                  <div class="desk-item-header">
                    <div class="desk-item-title">${desk.name}</div>
                    <span class="badge ${desk.urgency === 'CRITICAL' ? 'badge-critical' : 'badge-gold'}">
                      ${desk.category}
                    </span>
                  </div>
                  <p style="font-size: 0.85rem; color: var(--text-main); margin-bottom: 4px;">
                    <strong>Head:</strong> ${desk.head} | <strong>Location:</strong> ${desk.location}
                  </p>
                  ${desk.portal ? `
                    <p style="font-size: 0.82rem; margin-bottom: 4px;">
                      <strong>Exams Portal:</strong> <a href="${desk.portal}" target="_blank" rel="noopener noreferrer">${desk.portal}</a>
                    </p>
                  ` : ''}
                  <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px;">
                    ${desk.actionGuidance || ''}
                  </p>
                  <div class="escalation-action-bar">
                    <a href="tel:${phoneDigits}" class="btn-contact btn-contact-call">
                      <span>📞</span> Call (${desk.phone})
                    </a>
                    <a href="mailto:${desk.email}" class="btn-contact btn-contact-email">
                      <span>✉️</span> Email (${desk.email})
                    </a>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `;
        container.dataset.loaded = 'true';
      } catch (err) {
        container.innerHTML = `<p style="color: red;">Failed to load escalation directory.</p>`;
      }
    }
  });

  // Load Departments Modal
  openDeptsBtn.addEventListener('click', async () => {
    openModal(deptsModal);
    const container = document.getElementById('deptsListContainer');
    if (!container.dataset.loaded) {
      try {
        let rawDepts;
        if (window.srkrKnowledgeData && Array.isArray(window.srkrKnowledgeData.departments)) {
          rawDepts = window.srkrKnowledgeData.departments;
        } else {
          const res = await fetch('/api/departments');
          rawDepts = await res.json();
        }
        
        // Sort departments in alphabetical order (A–Z)
        const depts = rawDepts.slice().sort((a, b) => {
          const nameA = a.name.replace(/^Department of\s+/i, '').trim();
          const nameB = b.name.replace(/^Department of\s+/i, '').trim();
          return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
        });

        container.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; padding: 8px 14px; background: var(--bg-tertiary); border-radius: 8px; border: 1px solid var(--border-color);">
            <span style="font-size: 0.85rem; color: var(--text-main); font-weight: 600;">
              Total Academic Departments: <span style="color: var(--srkr-maroon);">${depts.length}</span>
            </span>
            <span class="badge badge-gold" style="font-size: 0.76rem; display: inline-flex; align-items: center; gap: 4px;">
              🔤 Alphabetical Order (A–Z)
            </span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(290px, 1fr)); gap: 14px;">
            ${depts.map(d => `
              <div class="desk-item" style="border-left: 4px solid var(--srkr-maroon);">
                <div class="desk-item-header">
                  <div class="desk-item-title">${d.name} (${d.code})</div>
                  <span class="badge badge-gold">${d.intake > 0 ? d.intake + ' Seats' : 'Foundation Dept'}</span>
                </div>
                <p style="font-size: 0.85rem; margin-bottom: 4px; color: var(--text-main);">
                  <strong>HOD / Coordinator:</strong> ${d.hod}
                </p>
                <p style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 4px;">
                  <em>${d.designation || 'Head of the Department'}</em>
                </p>
                <p style="font-size: 0.8rem; color: var(--text-main); margin-bottom: 8px; line-height: 1.4;">
                  ${d.description}
                </p>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                  <a href="mailto:${d.contactEmail}" style="font-size: 0.82rem; color: #2563eb; font-weight: 600; text-decoration: underline;">
                    ✉️ ${d.contactEmail}
                  </a>
                  ${d.alternateEmail ? `
                    <a href="mailto:${d.alternateEmail}" style="font-size: 0.82rem; color: #2563eb; font-weight: 600; text-decoration: underline;">
                      / ${d.alternateEmail}
                    </a>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        `;
        container.dataset.loaded = 'true';
      } catch (err) {
        container.innerHTML = `<p style="color: red;">Failed to load departments.</p>`;
      }
    }
  });

  // Load Complete Campus Landmarks in Modal
  openCampusBtn.addEventListener('click', async () => {
    openModal(campusModal);
    const container = document.getElementById('landmarksContainer');
    if (!container.dataset.loaded) {
      try {
        let landmarks;
        if (window.srkrKnowledgeData && window.srkrKnowledgeData.campusFacilities && Array.isArray(window.srkrKnowledgeData.campusFacilities.landmarks)) {
          landmarks = window.srkrKnowledgeData.campusFacilities.landmarks;
        } else {
          const res = await fetch('/api/landmarks');
          landmarks = await res.json();
        }
        container.innerHTML = landmarks.map((l, idx) => `
          <div class="landmark-card">
            <div class="landmark-header">
              <span class="landmark-name">${idx + 1}. ${l.name}</span>
              <span class="landmark-zone">${l.zone}</span>
            </div>
            <p class="landmark-desc">${l.description}</p>
          </div>
        `).join('');
        container.dataset.loaded = 'true';
      } catch (err) {
        container.innerHTML = `<p style="color: red;">Failed to load campus landmarks.</p>`;
      }
    }
  });

  // Settings Modal
  openSettingsBtn.addEventListener('click', () => {
    if (apiKeyInput) {
      apiKeyInput.value = localStorage.getItem('srkr_gemini_api_key') || '';
    }
    openModal(settingsModal);
  });

  saveSettingsBtn.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (key) {
      localStorage.setItem('srkr_gemini_api_key', key);
      showToast('Gemini API Key saved successfully! ⚙️');
    } else {
      localStorage.removeItem('srkr_gemini_api_key');
      showToast('API Key cleared. Running in local built-in mode.');
    }
    closeModal(settingsModal);
  });

  resetSettingsBtn.addEventListener('click', () => {
    localStorage.removeItem('srkr_gemini_api_key');
    if (apiKeyInput) apiKeyInput.value = '';
    showToast('Settings reset to default built-in mode.');
  });

  // Modal Interactive Real-time Search Handlers
  const desksSearchInput = document.getElementById('desksSearchInput');
  if (desksSearchInput) {
    desksSearchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const container = document.getElementById('desksListContainer');
      const items = container.querySelectorAll('.desk-item');
      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(q) ? '' : 'none';
      });
    });
  }

  const deptsSearchInput = document.getElementById('deptsSearchInput');
  if (deptsSearchInput) {
    deptsSearchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const container = document.getElementById('deptsListContainer');
      const items = container.querySelectorAll('.desk-item');
      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(q) ? '' : 'none';
      });
    });
  }

  const landmarksSearchInput = document.getElementById('landmarksSearchInput');
  if (landmarksSearchInput) {
    landmarksSearchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const container = document.getElementById('landmarksContainer');
      const items = container.querySelectorAll('.landmark-card');
      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(q) ? '' : 'none';
      });
    });
  }

  // Keyboard Accessibility: Escape key closes any active modal
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.active').forEach(modal => {
        closeModal(modal);
      });
    }
  });

  // Initialize: default stakeholder and render initial touch chips
  setStakeholder(currentStakeholder);
  renderQuickChips(currentStakeholder);
});
