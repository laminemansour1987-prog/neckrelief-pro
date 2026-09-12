'use strict';

const path = require('path');
const express = require('express');

const { handleMessage } = require('./src/agent');
const { listAppointments, updateAppointmentStatus } = require('./src/store');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'changeme';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function requireAdmin(req, res, next) {
  const token = req.header('x-admin-token') || req.query.token;
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Non autorise. Fournissez un jeton admin valide.' });
  }
  next();
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { sessionId, message } = req.body || {};
    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ error: 'sessionId requis.' });
    }
    const result = await handleMessage(sessionId, typeof message === 'string' ? message : '');
    res.json(result);
  } catch (err) {
    console.error('Erreur /api/chat :', err);
    res.status(500).json({ error: "Une erreur est survenue cote serveur." });
  }
});

app.get('/api/appointments', requireAdmin, (req, res) => {
  res.json(listAppointments());
});

app.patch('/api/appointments/:id', requireAdmin, (req, res) => {
  const { status } = req.body || {};
  const allowed = ['nouveau', 'confirme', 'en_cours', 'termine', 'annule'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: `status doit etre l'un de : ${allowed.join(', ')}` });
  }
  const updated = updateAppointmentStatus(req.params.id, status);
  if (!updated) return res.status(404).json({ error: 'Rendez-vous introuvable.' });
  res.json(updated);
});

app.listen(PORT, () => {
  console.log(`Agent IA plomberie demarre sur http://localhost:${PORT}`);
});
