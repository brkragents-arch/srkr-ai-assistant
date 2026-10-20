const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const { processChatMessage, srkrData, escalationData } = require('./services/agentEngine');

const app = express();
const PORT = process.env.PORT || 3050;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Chat API Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, stakeholder, history, apiKey, provider } = req.body;
    
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Please provide a valid question or message.' });
    }

    const result = await processChatMessage({
      message: message.trim(),
      stakeholder: stakeholder || 'general',
      history: Array.isArray(history) ? history : [],
      apiKey: apiKey || process.env.GEMINI_API_KEY || null,
      provider: provider || 'gemini'
    });

    res.json(result);
  } catch (error) {
    console.error('Error handling /api/chat:', error);
    res.status(500).json({
      error: 'An internal error occurred while processing your request.',
      details: error.message
    });
  }
});

// College Information & Metadata
app.get('/api/info', (req, res) => {
  res.json({
    institution: srkrData.institution,
    stats: {
      departmentsCount: srkrData.departments.length,
      highestPackage: srkrData.placements.highestPackage,
      averagePackage: srkrData.placements.averagePackage,
      annualOffers: srkrData.placements.annualOffers,
      eapcetCode: srkrData.admissions.eapcetCode,
      naac: srkrData.institution.accreditation.naac
    }
  });
});

// Departments Endpoint
app.get('/api/departments', (req, res) => {
  res.json(srkrData.departments);
});

// Official Escalation Desks Endpoint
app.get('/api/escalation', (req, res) => {
  res.json(escalationData.desks);
});
app.get('/api/desks', (req, res) => {
  res.json(escalationData.desks);
});

// FAQs Endpoint
app.get('/api/faqs', (req, res) => {
  res.json(srkrData.faq);
});

// Campus Landmarks Endpoint
app.get('/api/landmarks', (req, res) => {
  res.json(srkrData.campusFacilities.landmarks || []);
});

// Fallback to index.html for SPA/client-side navigation (Express 5 compatible)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`======================================================`);
  console.log(`🎓 SRKR Engineering College AI Assistant is Running!`);
  console.log(`📍 Web Application: http://localhost:${PORT}`);
  console.log(`🌐 Official Portal: https://www.srkrec.ac.in`);
  console.log(`======================================================`);
});
