const assert = require('assert');
const { processChatMessage, detectIntent, findEscalationDesk, srkrData, escalationData } = require('../services/agentEngine');

async function runTests() {
  console.log("🚀 Starting SRKR AI Assistant Test Suite...\n");
  let passed = 0;
  let failed = 0;

  function test(name, fn) {
    try {
      fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name}`);
      console.error(err);
      failed++;
    }
  }

  async function asyncTest(name, fn) {
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name}`);
      console.error(err);
      failed++;
    }
  }

  // Test 1: Data integrity
  test("SRKR Knowledge Base has required college metadata", () => {
    assert.strictEqual(srkrData.institution.eapcetCode, "SRKR");
    assert.ok(srkrData.departments.length >= 8);
    assert.ok(srkrData.placements.highestPackage.includes("44"));
    assert.ok(srkrData.institution.accreditation.naac.includes("A+"));
  });

  // Test 2: Intent Detection
  test("Intent Detection correctly identifies queries", () => {
    assert.strictEqual(detectIntent("What is the EAPCET code for admissions?"), "ADMISSIONS");
    assert.strictEqual(detectIntent("What happens if my attendance is below 75%?"), "ACADEMICS_EXAMS");
    assert.strictEqual(detectIntent("Who are the top recruiters and average package?"), "PLACEMENTS");
    assert.strictEqual(detectIntent("Tell me about the CSE department and HOD"), "DEPARTMENTS");
    assert.strictEqual(detectIntent("Are there hostel facilities for girls?"), "HOSTELS");
    assert.strictEqual(detectIntent("A senior is ragging me in the hostel"), "SENSITIVE_SAFETY");
  });

  // Test 3: Sensitive / Escalation routing
  test("Escalation Desk matches safety and sensitive queries", () => {
    const raggingDesk = findEscalationDesk("SENSITIVE_SAFETY", "Report ragging incident");
    assert.ok(raggingDesk);
    assert.strictEqual(raggingDesk.id, "anti_ragging");
    assert.strictEqual(raggingDesk.urgency, "CRITICAL");
    assert.ok(raggingDesk.phone);

    const womenDesk = findEscalationDesk("SENSITIVE_SAFETY", "Harassment complaint ICC");
    assert.ok(womenDesk);
    assert.strictEqual(womenDesk.id, "women_protection_icc");
  });

  // Test 4: Full Chat processing with Next Steps (Student perspective)
  await asyncTest("Chat message for attendance returns guidance, next steps, and rules", async () => {
    const result = await processChatMessage({
      message: "What is the attendance criteria and condonation policy?",
      stakeholder: "student"
    });

    assert.ok(result.response.includes("75%"));
    assert.ok(result.response.includes("65%"));
    assert.strictEqual(result.intent, "ACADEMICS_EXAMS");
    assert.ok(Array.isArray(result.nextSteps));
    assert.ok(result.nextSteps.length >= 2);
  });

  // Test 5: Full Chat processing for Admissions
  await asyncTest("Chat message for Category-B admissions provides APSCHE guidance", async () => {
    const result = await processChatMessage({
      message: "How to get Category B management seat?",
      stakeholder: "parent"
    });

    assert.ok(result.response.includes("Category-B"));
    assert.strictEqual(result.intent, "ADMISSIONS");
    assert.ok(result.escalationDesk);
    assert.strictEqual(result.escalationDesk.id, "admissions_office");
    assert.ok(result.response.includes("Parent")); // includes parent-tailored note
  });

  // Test 6: Anti-ragging emergency handling
  await asyncTest("Sensitive ragging query generates urgent escalation response", async () => {
    const result = await processChatMessage({
      message: "Someone is ragging juniors in the campus hostel, what should I do?",
      stakeholder: "student"
    });

    assert.strictEqual(result.intent, "SENSITIVE_SAFETY");
    assert.ok(result.escalationDesk);
    assert.strictEqual(result.escalationDesk.id, "anti_ragging");
    assert.ok(result.response.includes("ZERO TOLERANCE"));
    assert.ok(result.nextSteps.some(step => step.includes("1800-180-5522") || step.includes("Anti-Ragging")));
  });

  // Test 7: Placements query from Recruiter perspective
  await asyncTest("Recruiter query gives corporate relations desk & T&P contact", async () => {
    const result = await processChatMessage({
      message: "We want to hire students from SRKR for software engineer roles",
      stakeholder: "recruiter"
    });

    assert.strictEqual(result.intent, "PLACEMENTS");
    assert.ok(result.response.includes("Satyanarayana"));
    assert.ok(result.escalationDesk);
    assert.strictEqual(result.escalationDesk.id, "placement_cell");
    assert.ok(result.response.includes("Corporate Partners"));
  });

  // Test 8: Controller of Examinations (COE) check
  await asyncTest("Controller of Examinations name and contact details are verified", async () => {
    assert.strictEqual(srkrData.institution.leadership.controllerOfExaminations, "Dr. M. Siva Krishnam Raju");
    
    const coeDesk = escalationData.desks.find(d => d.id === "exam_cell_coe");
    assert.ok(coeDesk);
    assert.ok(coeDesk.head.includes("Dr. M. Siva Krishnam Raju"));
    assert.ok(coeDesk.phone.includes("08816-223332"));
    assert.ok(coeDesk.portal.includes("srkrexams.in"));

    const result = await processChatMessage({
      message: "Check the name and contact details of controller of examination",
      stakeholder: "student"
    });

    assert.ok(result.response.includes("Dr. M. Siva Krishnam Raju") || result.escalationDesk.head.includes("Dr. M. Siva Krishnam Raju"));
  });

  // Test 9: Complete Campus Landmarks check
  await asyncTest("Complete campus landmarks are structured with all key buildings", async () => {
    assert.ok(Array.isArray(srkrData.campusFacilities.landmarks));
    assert.ok(srkrData.campusFacilities.landmarks.length >= 10);

    const result = await processChatMessage({
      message: "Show complete campus landmarks and buildings",
      stakeholder: "visitor"
    });

    assert.strictEqual(result.intent, "CAMPUS_SERVICES");
    assert.ok(result.response.includes("Campus Landmarks"));
    assert.ok(result.response.includes("Administrative Block"));
    assert.ok(result.response.includes("Examination Cell"));
    assert.ok(result.response.includes("Central Library"));
  });

  // Test 10: Silver Jubilee Building & IDEA Lab building layout
  await asyncTest("Exam Cell & T&P in Silver Jubilee Building and Alumni in IDEA Lab", async () => {
    const coeDesk = escalationData.desks.find(d => d.id === "exam_cell_coe");
    assert.ok(coeDesk.location.includes("Silver Jubilee Building, 1st Floor"));

    const tpDesk = escalationData.desks.find(d => d.id === "placement_cell");
    assert.ok(tpDesk.location.includes("Silver Jubilee Building, Ground Floor"));

    const alumniDesk = escalationData.desks.find(d => d.id === "alumni_office");
    assert.ok(alumniDesk);
    assert.ok(alumniDesk.location.includes("AICTE IDEA Lab, 1st Floor"));
    assert.ok(alumniDesk.phone.includes("9848823332") || alumniDesk.phone.includes("08816-223332"));
  });

  // Test 11: Administrative working hours query
  await asyncTest("Administrative working hours query returns exact office timing", async () => {
    const result = await processChatMessage({
      message: "What are the administrative office working hours?",
      stakeholder: "visitor"
    });

    assert.ok(result.response.includes("9:00 AM to 5:00 PM"));
    assert.ok(result.response.includes("1:00 PM to 2:00 PM"));
    assert.ok(result.response.includes("Second Saturday"));
  });

  // Test 12: Principal's Office reception contact query
  await asyncTest("Principal's Office reception query returns relevant contact numbers without irrelevant transit", async () => {
    const result = await processChatMessage({
      message: "Contact number for Principal's Office reception",
      stakeholder: "visitor"
    });

    assert.ok(result.response.includes("08816-223332"));
    assert.ok(result.response.includes("9848823332"));
    assert.ok(result.response.includes("Administrative Building, 1st Floor"));
    assert.ok(!result.response.includes("Railway Station (BVRT)")); // no irrelevant transit dump!
  });

  // Test 13: Academic Department HOD names and official emails check
  await asyncTest("Academic Department HOD names and emails are accurately verified", async () => {
    const cse = srkrData.departments.find(d => d.code === "CSE");
    assert.strictEqual(cse.hod, "Dr. Bh. V. S. Rama Krishnam Raju");
    assert.strictEqual(cse.contactEmail, "cse@srkrec.ac.in");
    assert.strictEqual(cse.alternateEmail, "hod.cse@srkrec.ac.in");

    const it = srkrData.departments.find(d => d.code === "IT");
    assert.strictEqual(it.hod, "Dr. P. Ravi Kiran Varma");
    assert.strictEqual(it.contactEmail, "it@srkrec.ac.in");

    const ece = srkrData.departments.find(d => d.code === "ECE");
    assert.strictEqual(ece.hod, "Dr. S. S. Mohan Reddy");
    assert.strictEqual(ece.contactEmail, "ece@srkrec.ac.in");

    const eee = srkrData.departments.find(d => d.code === "EEE");
    assert.strictEqual(eee.hod, "Dr. B. Ravi Kumar Varma");
    assert.strictEqual(eee.contactEmail, "eee@srkrec.ac.in");

    const mech = srkrData.departments.find(d => d.code === "MECH");
    assert.strictEqual(mech.hod, "Dr. K. Sita Rama Raju");
    assert.strictEqual(mech.contactEmail, "mech@srkrec.ac.in");

    const civil = srkrData.departments.find(d => d.code === "CIVIL");
    assert.strictEqual(civil.hod, "Dr. G. Sri Bala");
    assert.strictEqual(civil.contactEmail, "civil@srkrec.ac.in");

    const result = await processChatMessage({
      message: "Who is the HOD of Civil Engineering department and email?",
      stakeholder: "student"
    });

    assert.ok(result.response.includes("Dr. G. Sri Bala"));
    assert.ok(result.response.includes("civil@srkrec.ac.in"));
  });

  // Test 14: CS & IT Department verification and web page emails
  await asyncTest("CS & IT Department is included and verified with HOD and web page email", async () => {
    const csit = srkrData.departments.find(d => d.code === "CSIT");
    assert.ok(csit, "CSIT department must be present in departments list");
    assert.strictEqual(csit.name, "Computer Science & Information Technology (CS & IT)");
    assert.strictEqual(csit.hod, "Dr. N. Gopala Krishna Murthy");
    assert.strictEqual(csit.contactEmail, "csit@srkrec.ac.in");
    assert.strictEqual(csit.intake, 120);

    const result = await processChatMessage({
      message: "Tell me about CS & IT department HOD, intake and email",
      stakeholder: "student"
    });

    assert.strictEqual(result.intent, "DEPARTMENTS");
    assert.ok(result.response.includes("Dr. N. Gopala Krishna Murthy"));
    assert.ok(result.response.includes("csit@srkrec.ac.in"));
    assert.ok(result.response.includes("120 seats"));

    // Also verify intent detection for "csit"
    assert.strictEqual(detectIntent("Who is csit hod?"), "DEPARTMENTS");
  });

  // Test 15: Alphabetical ordering of departments
  await asyncTest("Departments are sorted in alphabetical order (A–Z)", async () => {
    const deptNames = srkrData.departments.map(d => d.name);
    for (let i = 0; i < deptNames.length - 1; i++) {
      const cmp = deptNames[i].localeCompare(deptNames[i + 1], undefined, { sensitivity: 'base' });
      assert.ok(cmp <= 0, `Department '${deptNames[i]}' should come before or equal to '${deptNames[i + 1]}' in alphabetical order`);
    }

    assert.strictEqual(srkrData.departments[0].code, "AIDS"); // Artificial Intelligence & Data Science
    assert.strictEqual(srkrData.departments[srkrData.departments.length - 1].code, "MECH"); // Mechanical Engineering
  });

  // Test 16: Official Desks include Physical Director, Librarian, and AICTE IDEA Lab Incharge
  await asyncTest("Official Desks include Physical Director, Librarian, and AICTE IDEA Lab Incharge", async () => {
    const pdDesk = escalationData.desks.find(d => d.id === 'physical_director');
    assert.ok(pdDesk, "Physical Director desk must exist");
    assert.ok(pdDesk.head.includes("Dr. P. Satyanarayana Raju"));
    assert.ok(pdDesk.phone.includes("9441814118"));

    const libDesk = escalationData.desks.find(d => d.id === 'central_library');
    assert.ok(libDesk, "Central Library desk must exist");
    assert.ok(libDesk.head.includes("Sri G. Srinivasa Raju"));
    assert.ok(libDesk.location.includes("Central Library Building"));

    const ideaDesk = escalationData.desks.find(d => d.id === 'aicte_idea_lab');
    assert.ok(ideaDesk, "AICTE IDEA Lab desk must exist");
    assert.ok(ideaDesk.head.includes("Dr. G. Harish Kumar Varma") || ideaDesk.head.includes("Sri K. Pavan Kumar"));
    assert.ok(ideaDesk.phone.includes("8074589783"));

    // Verify chat routing for these desks
    const pdResult = await processChatMessage({
      message: "Who is the physical director and contact number?",
      stakeholder: "student"
    });
    assert.ok(pdResult.response.includes("Dr. P. Satyanarayana Raju"));
    assert.strictEqual(pdResult.escalationDesk.id, "physical_director");

    const libResult = await processChatMessage({
      message: "Who is the librarian of SRKR?",
      stakeholder: "student"
    });
    assert.ok(libResult.response.includes("Sri G. Srinivasa Raju"));
    assert.strictEqual(libResult.escalationDesk.id, "central_library");

    const ideaResult = await processChatMessage({
      message: "Details of AICTE Idea Lab incharge",
      stakeholder: "student"
    });
    assert.ok(ideaResult.response.includes("Dr. G. Harish Kumar Varma") || ideaResult.response.includes("Sri K. Pavan Kumar"));
    assert.strictEqual(ideaResult.escalationDesk.id, "aicte_idea_lab");
  });

  console.log(`\n======================================`);
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`======================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
