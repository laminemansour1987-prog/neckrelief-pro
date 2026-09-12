'use strict';

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'appointments.json');

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]', 'utf8');
  }
}

function readAll() {
  ensureStore();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    return [];
  }
}

function writeAll(appointments) {
  ensureStore();
  fs.writeFileSync(DATA_FILE, JSON.stringify(appointments, null, 2), 'utf8');
}

function createAppointment(appointment) {
  const appointments = readAll();
  const record = {
    id: `RDV-${Date.now().toString(36).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    status: 'nouveau',
    ...appointment,
  };
  appointments.unshift(record);
  writeAll(appointments);
  return record;
}

function listAppointments() {
  return readAll().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function updateAppointmentStatus(id, status) {
  const appointments = readAll();
  const idx = appointments.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  appointments[idx].status = status;
  appointments[idx].updatedAt = new Date().toISOString();
  writeAll(appointments);
  return appointments[idx];
}

/**
 * Nombre de demandes actives (hors annulees) deja positionnees sur ce creneau fixe.
 * Sert a ne jamais proposer/accepter un creneau au-dela de la capacite disponible.
 */
function countActiveAtSlot(slotISO) {
  if (!slotISO) return 0;
  return readAll().filter((a) => a.slotISO === slotISO && a.status !== 'annule').length;
}

module.exports = {
  createAppointment,
  listAppointments,
  updateAppointmentStatus,
  countActiveAtSlot,
};
