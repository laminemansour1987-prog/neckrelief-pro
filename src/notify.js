'use strict';

const { EventEmitter } = require('events');

// Bus d'evenements interne : alimente le flux temps reel (SSE) du tableau de
// bord admin, pour que le plombier voie une nouvelle demande sans rien faire.
const events = new EventEmitter();
events.setMaxListeners(100);

/**
 * Envoie un email au plombier via SMTP si configure (SMTP_HOST/SMTP_USER/SMTP_PASS/ADMIN_EMAIL).
 * Ne fait rien silencieusement si la configuration est absente : le reste de
 * l'agent continue de fonctionner normalement (notification temps reel + SMS restent actifs).
 */
async function sendAdminEmail(subject, text) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, ADMIN_EMAIL } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !ADMIN_EMAIL) return false;

  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    await transporter.sendMail({
      from: SMTP_FROM || SMTP_USER,
      to: ADMIN_EMAIL,
      subject,
      text,
    });
    return true;
  } catch (err) {
    console.error('Erreur envoi email admin :', err.message);
    return false;
  }
}

/**
 * Envoie un SMS via l'API Twilio si configuree (TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN/TWILIO_FROM_NUMBER).
 * No-op silencieux sinon.
 */
async function sendSms(to, body) {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER || !to) return false;

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
    const params = new URLSearchParams({ To: to, From: TWILIO_FROM_NUMBER, Body: body });
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });
    return res.ok;
  } catch (err) {
    console.error('Erreur envoi SMS :', err.message);
    return false;
  }
}

/**
 * Point d'entree unique appele des qu'un rendez-vous est cree : previent le
 * plombier en temps reel (SSE) + par email, et confirme au client par SMS
 * quand le creneau a ete valide automatiquement. Tout est best-effort et
 * n'interrompt jamais le flux de conversation en cas d'echec d'envoi.
 */
function notifyNewAppointment(appointment) {
  events.emit('appointment', appointment);

  const urgencyFlag = appointment.urgency === 'urgente' ? '🚨 URGENT - ' : '';
  const subject = `${urgencyFlag}Nouvelle demande ${appointment.id} - ${appointment.issueLabel}`;
  const text = [
    `Client : ${appointment.name} (${appointment.phone})`,
    `Adresse : ${appointment.address}`,
    `Probleme : ${appointment.issueLabel}`,
    `Urgence : ${appointment.urgencyLabel}`,
    `Creneau : ${appointment.slotLabel}${appointment.autoConfirmed ? ' (confirme automatiquement)' : ' (a confirmer manuellement)'}`,
    `Estimation : ${appointment.priceRangeMin}-${appointment.priceRangeMax} EUR`,
    `Reference : ${appointment.id}`,
  ].join('\n');

  sendAdminEmail(subject, text).catch(() => {});

  if (appointment.autoConfirmed) {
    const clientMsg = `Bonjour ${appointment.name}, votre rendez-vous plomberie (${appointment.issueLabel}) est confirme : ${appointment.slotLabel}. Reference ${appointment.id}.`;
    sendSms(appointment.phone, clientMsg).catch(() => {});
  }
}

module.exports = { events, notifyNewAppointment, sendAdminEmail, sendSms };
