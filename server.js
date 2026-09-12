'use strict';

const path = require('path');
const express = require('express');

const { handleMessage } = require('./src/agent');
const { listAppointments, updateAppointmentStatus } = require('./src/store');
const { events: notifyEvents, notifyNewAppointment } = require('./src/notify');

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
    if (result.appointment) {
      notifyNewAppointment(result.appointment);
    }
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
  const allowed = ['nouveau', 'a_confirmer', 'confirme', 'en_cours', 'termine', 'annule'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ error: `status doit etre l'un de : ${allowed.join(', ')}` });
  }
  const updated = updateAppointmentStatus(req.params.id, status);
  if (!updated) return res.status(404).json({ error: 'Rendez-vous introuvable.' });
  res.json(updated);
});

app.get('/api/stats', requireAdmin, (req, res) => {
  const appointments = listAppointments();
  const byStatus = {};
  const byUrgency = {};
  const todayStr = new Date().toDateString();
  let today = 0;

  for (const a of appointments) {
    byStatus[a.status] = (byStatus[a.status] || 0) + 1;
    byUrgency[a.urgency] = (byUrgency[a.urgency] || 0) + 1;
    if (new Date(a.createdAt).toDateString() === todayStr) today += 1;
  }

  res.json({ total: appointments.length, today, byStatus, byUrgency });
});

// Flux temps reel : le tableau de bord admin recoit chaque nouvelle demande
// instantanement, sans avoir besoin de rafraichir manuellement la page.
app.get('/api/events', requireAdmin, (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.write('\n');

  const onAppointment = (appointment) => {
    res.write(`event: appointment\ndata: ${JSON.stringify(appointment)}\n\n`);
  };
  notifyEvents.on('appointment', onAppointment);

  const heartbeat = setInterval(() => res.write(':\n\n'), 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    notifyEvents.off('appointment', onAppointment);
  });
});

app.listen(PORT, () => {
  console.log(`Agent IA plomberie demarre sur http://localhost:${PORT}`);
});
