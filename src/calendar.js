'use strict';

const { countActiveAtSlot } = require('./store');

const WORK_START_HOUR = Number(process.env.WORK_START_HOUR) || 8;
const WORK_END_HOUR = Number(process.env.WORK_END_HOUR) || 18;
const SLOT_HOURS = Number(process.env.SLOT_HOURS) || 2;
const MAX_CONCURRENT_JOBS = Number(process.env.MAX_CONCURRENT_JOBS) || 1;
const WORK_DAYS = [1, 2, 3, 4, 5, 6]; // lundi a samedi (0 = dimanche, ferme)

const URGENT_BUFFER_MINUTES = Number(process.env.URGENT_BUFFER_MINUTES) || 45;
const NORMAL_BUFFER_HOURS = Number(process.env.NORMAL_BUFFER_HOURS) || 2;

const WEEKDAYS_FR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const MONTHS_FR = ['jan', 'fev', 'mars', 'avr', 'mai', 'juin', 'juil', 'aout', 'sept', 'oct', 'nov', 'dec'];

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isSameCalendarDay(a, b) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

/**
 * Genere les creneaux horaires de travail (buckets de SLOT_HOURS) pour une journee donnee.
 */
function dailyBuckets(day) {
  const buckets = [];
  for (let hour = WORK_START_HOUR; hour + SLOT_HOURS <= WORK_END_HOUR; hour += SLOT_HOURS) {
    const start = new Date(day);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(day);
    end.setHours(hour + SLOT_HOURS, 0, 0, 0);
    buckets.push({ start, end });
  }
  return buckets;
}

function formatLabel(bucket, now) {
  const dayDiffMs = startOfDay(bucket.start).getTime() - startOfDay(now).getTime();
  const dayDiff = Math.round(dayDiffMs / 86400000);

  let dayLabel;
  if (dayDiff === 0) dayLabel = "Aujourd'hui";
  else if (dayDiff === 1) dayLabel = 'Demain';
  else {
    const weekday = WEEKDAYS_FR[bucket.start.getDay()];
    dayLabel = `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${bucket.start.getDate()} ${MONTHS_FR[bucket.start.getMonth()]}`;
  }

  return `${dayLabel} ${bucket.start.getHours()}h-${bucket.end.getHours()}h`;
}

/**
 * Retourne les N prochains creneaux disponibles (capacite non atteinte) compatibles
 * avec le niveau d'urgence donne. Ne renvoie jamais un creneau deja complet :
 * cela evite mecaniquement le double-booking, sans intervention humaine.
 */
function getNextAvailableSlots(urgency, count = 3, daysAhead = 14) {
  const now = new Date();
  const bufferMs = urgency === 'urgente'
    ? URGENT_BUFFER_MINUTES * 60 * 1000
    : NORMAL_BUFFER_HOURS * 60 * 60 * 1000;
  const earliest = new Date(now.getTime() + bufferMs);

  const results = [];
  for (let offset = 0; offset < daysAhead && results.length < count; offset += 1) {
    const day = new Date(now);
    day.setDate(day.getDate() + offset);
    if (!WORK_DAYS.includes(day.getDay())) continue;

    for (const bucket of dailyBuckets(day)) {
      if (bucket.start < earliest) continue;
      if (results.length >= count) break;

      const iso = bucket.start.toISOString();
      if (countActiveAtSlot(iso) >= MAX_CONCURRENT_JOBS) continue;

      results.push({ iso, label: formatLabel(bucket, now) });
    }
  }

  if (urgency === 'urgente' && results.length > 0) {
    results[0] = { ...results[0], label: `Intervention urgente - ${results[0].label}` };
  }

  return results;
}

function isSlotFree(iso) {
  return countActiveAtSlot(iso) < MAX_CONCURRENT_JOBS;
}

module.exports = {
  getNextAvailableSlots,
  isSlotFree,
  MAX_CONCURRENT_JOBS,
};
