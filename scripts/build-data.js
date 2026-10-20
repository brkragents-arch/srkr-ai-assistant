const fs = require('fs');
const path = require('path');

const knowledgePath = path.join(__dirname, '..', 'data', 'srkrKnowledge.json');
const escalationPath = path.join(__dirname, '..', 'data', 'escalationDirectory.json');

const knowledge = JSON.parse(fs.readFileSync(knowledgePath, 'utf8'));
const escalation = JSON.parse(fs.readFileSync(escalationPath, 'utf8'));

const out = `// Auto-generated SRKR Knowledge & Escalation Data for Client-Side Standalone / GitHub Pages
window.srkrKnowledgeData = ${JSON.stringify(knowledge)};

window.escalationDirectoryData = ${JSON.stringify(escalation)};
`;

fs.writeFileSync(path.join(__dirname, '..', 'public', 'js', 'srkrData.js'), out, 'utf8');
fs.writeFileSync(path.join(__dirname, '..', 'js', 'srkrData.js'), out, 'utf8');

console.log('✅ Generated srkrData.js for public/js and js/ successfully!');
