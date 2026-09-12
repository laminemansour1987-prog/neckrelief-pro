'use strict';

const { classifyIssue, URGENCY_META } = require('./plumbingKnowledge');
const { createAppointment } = require('./store');
const { polishReply } = require('./llm');

const GENERIC_ISSUE = {
  id: 'autre',
  label: 'Probleme non identifie precisement',
  urgency: 'normale',
  priceRange: [80, 250],
  advice: "Un diagnostic sur place sera necessaire pour identifier precisement la panne.",
};

const RESET_WORDS = ['recommencer', 'annuler', 'reinitialiser'];
const YES_WORDS = ['oui', 'ok', 'daccord', "d'accord", 'yes', 'partant', 'go', 'volontiers'];
const NO_WORDS = ['non', 'no', 'pas maintenant', 'plus tard'];

// Etat de conversation en memoire, par session. Suffisant pour un prototype ;
// une vraie base de donnees serait necessaire en production multi-instance.
const sessions = new Map();

function normalize(text) {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['’ʼ-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getSession(sessionId) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      step: 'awaiting_description',
      clarifyAttempted: false,
      issue: null,
      contact: {},
    });
  }
  return sessions.get(sessionId);
}

function resetSession(session) {
  session.step = 'awaiting_description';
  session.clarifyAttempted = false;
  session.issue = null;
  session.contact = {};
}

function formatPrice([min, max]) {
  return `entre ${min} EUR et ${max} EUR`;
}

function containsAny(text, words) {
  const norm = normalize(text);
  return words.some((w) => norm.includes(normalize(w)));
}

function looksLikePhone(text) {
  const digits = (text.match(/\d/g) || []).length;
  return digits >= 6;
}

async function buildReply(userMessage, facts, fallback) {
  const polished = await polishReply({ factsSummary: facts, userMessage });
  return polished || fallback;
}

/**
 * Traite un message utilisateur pour une session donnee et retourne :
 * { reply: string, appointment: object|null, issue: object|null, step: string }
 */
async function handleMessage(sessionId, rawMessage) {
  const session = getSession(sessionId);
  const message = (rawMessage || '').trim();

  if (message && containsAny(message, RESET_WORDS)) {
    resetSession(session);
    const fallback = "D'accord, reprenons a zero. Decrivez-moi le probleme de plomberie que vous rencontrez.";
    return {
      reply: await buildReply(message, 'La conversation redemarre, demander au client de decrire son probleme.', fallback),
      appointment: null,
      issue: null,
      step: session.step,
    };
  }

  if (session.step === 'awaiting_description') {
    if (!message) {
      const fallback = "Bonjour, je suis l'assistant plomberie. Decrivez-moi votre probleme (fuite, bouchon, panne de chauffe-eau...) et je vous oriente immediatement.";
      return {
        reply: await buildReply(message, "Message d'accueil, demander de decrire le probleme de plomberie.", fallback),
        appointment: null,
        issue: null,
        step: session.step,
      };
    }

    let issue = classifyIssue(message);

    if (!issue && !session.clarifyAttempted) {
      session.clarifyAttempted = true;
      const fallback = "Je n'ai pas identifie precisement le probleme. S'agit-il d'une fuite, d'une canalisation bouchee, d'une panne de chauffe-eau/chaudiere, ou d'autre chose ? Pouvez-vous preciser ?";
      return {
        reply: await buildReply(message, "Le probleme n'est pas encore clair, demander de preciser : fuite, bouchon, panne chauffe-eau/chaudiere, ou autre.", fallback),
        appointment: null,
        issue: null,
        step: session.step,
      };
    }

    if (!issue) issue = GENERIC_ISSUE;

    session.issue = issue;
    session.step = 'awaiting_schedule_confirm';

    const urgencyMeta = URGENCY_META[issue.urgency];
    const facts = [
      `Diagnostic probable : ${issue.label}.`,
      `Niveau d'urgence : ${urgencyMeta.label} (intervention ${urgencyMeta.delaiText}).`,
      `Conseil de securite : ${issue.advice}`,
      `Estimation tarifaire indicative : ${formatPrice(issue.priceRange)} (hors pieces detachees, confirme sur place).`,
      'Demander au client s\'il souhaite prendre rendez-vous maintenant (repondre oui ou non).',
    ].join(' ');

    const fallback = [
      `D'apres votre description, il s'agit probablement de : ${issue.label}.`,
      `Urgence : ${urgencyMeta.label} (intervention ${urgencyMeta.delaiText}).`,
      issue.advice,
      `Estimation indicative : ${formatPrice(issue.priceRange)} (confirmee sur place).`,
      'Souhaitez-vous prendre rendez-vous maintenant ? (oui/non)',
    ].join(' ');

    return {
      reply: await buildReply(message, facts, fallback),
      appointment: null,
      issue,
      step: session.step,
    };
  }

  if (session.step === 'awaiting_schedule_confirm') {
    if (containsAny(message, NO_WORDS)) {
      resetSession(session);
      const fallback = "Pas de souci. Ecrivez-moi si vous changez d'avis, ou decrivez un nouveau probleme quand vous voulez.";
      return {
        reply: await buildReply(message, 'Le client ne souhaite pas de rendez-vous pour le moment, rester disponible.', fallback),
        appointment: null,
        issue: null,
        step: session.step,
      };
    }
    if (containsAny(message, YES_WORDS)) {
      session.step = 'awaiting_name';
      const fallback = 'Parfait ! Quel est votre nom complet ?';
      return {
        reply: await buildReply(message, 'Le client accepte le rendez-vous, demander son nom complet.', fallback),
        appointment: null,
        issue: session.issue,
        step: session.step,
      };
    }
    const fallback = "Je n'ai pas bien compris : souhaitez-vous prendre rendez-vous maintenant ? (oui/non)";
    return {
      reply: await buildReply(message, "Reponse ambigue, redemander une confirmation claire oui/non pour le rendez-vous.", fallback),
      appointment: null,
      issue: session.issue,
      step: session.step,
    };
  }

  if (session.step === 'awaiting_name') {
    if (!message) {
      const fallback = 'Pouvez-vous indiquer votre nom complet ?';
      return { reply: fallback, appointment: null, issue: session.issue, step: session.step };
    }
    session.contact.name = message;
    session.step = 'awaiting_phone';
    const fallback = `Merci ${message}. Quel est votre numero de telephone ?`;
    return {
      reply: await buildReply(message, `Le client s'appelle ${message}, demander maintenant son numero de telephone.`, fallback),
      appointment: null,
      issue: session.issue,
      step: session.step,
    };
  }

  if (session.step === 'awaiting_phone') {
    if (!looksLikePhone(message)) {
      const fallback = 'Ce numero ne semble pas valide. Pouvez-vous le resaisir (au moins 6 chiffres) ?';
      return { reply: fallback, appointment: null, issue: session.issue, step: session.step };
    }
    session.contact.phone = message;
    session.step = 'awaiting_address';
    const fallback = "Merci. Quelle est l'adresse d'intervention ?";
    return {
      reply: await buildReply(message, "Le numero de telephone est enregistre, demander l'adresse d'intervention.", fallback),
      appointment: null,
      issue: session.issue,
      step: session.step,
    };
  }

  if (session.step === 'awaiting_address') {
    if (!message) {
      const fallback = "Pouvez-vous preciser l'adresse d'intervention ?";
      return { reply: fallback, appointment: null, issue: session.issue, step: session.step };
    }
    session.contact.address = message;
    session.step = 'awaiting_slot';
    const urgencyMeta = URGENCY_META[session.issue.urgency];
    const fallback = session.issue.urgency === 'urgente'
      ? "Adresse enregistree. Vu l'urgence, un technicien peut intervenir sous 2h : cela vous convient-il, ou preferez-vous un autre creneau ?"
      : `Adresse enregistree. Quel creneau vous conviendrait (ex: demain matin, cet apres-midi...) ? Delai recommande : ${urgencyMeta.delaiText}.`;
    return {
      reply: await buildReply(message, `L'adresse est enregistree, demander le creneau souhaite. Delai recommande : ${urgencyMeta.delaiText}.`, fallback),
      appointment: null,
      issue: session.issue,
      step: session.step,
    };
  }

  if (session.step === 'awaiting_slot') {
    const slot = message || 'des que possible';
    session.contact.slot = slot;

    const issue = session.issue || GENERIC_ISSUE;
    const urgencyMeta = URGENCY_META[issue.urgency];

    const appointment = createAppointment({
      issueId: issue.id,
      issueLabel: issue.label,
      urgency: issue.urgency,
      urgencyLabel: urgencyMeta.label,
      priceRangeMin: issue.priceRange[0],
      priceRangeMax: issue.priceRange[1],
      advice: issue.advice,
      name: session.contact.name,
      phone: session.contact.phone,
      address: session.contact.address,
      slot,
      sessionId,
    });

    session.step = 'done';

    const facts = [
      `Rendez-vous confirme, reference ${appointment.id}.`,
      `Probleme : ${issue.label}. Urgence : ${urgencyMeta.label} (${urgencyMeta.delaiText}).`,
      `Creneau retenu : ${slot}.`,
      `Estimation : ${formatPrice(issue.priceRange)}.`,
      'Remercier le client et confirmer qu\'un technicien va le contacter pour finaliser.',
    ].join(' ');

    const fallback = [
      `C'est note ! Votre rendez-vous est confirme (reference ${appointment.id}).`,
      `Probleme : ${issue.label} - urgence ${urgencyMeta.label} (${urgencyMeta.delaiText}).`,
      `Creneau : ${slot}. Estimation : ${formatPrice(issue.priceRange)}.`,
      'Un technicien vous contactera pour finaliser les details. Merci de votre confiance !',
    ].join(' ');

    return {
      reply: await buildReply(message, facts, fallback),
      appointment,
      issue,
      step: session.step,
    };
  }

  // step === 'done'
  const newIssue = classifyIssue(message);
  if (newIssue) {
    session.issue = newIssue;
    session.step = 'awaiting_schedule_confirm';
    session.contact = {};
    const urgencyMeta = URGENCY_META[newIssue.urgency];
    const facts = [
      `Nouveau diagnostic : ${newIssue.label}.`,
      `Urgence : ${urgencyMeta.label} (${urgencyMeta.delaiText}).`,
      newIssue.advice,
      `Estimation : ${formatPrice(newIssue.priceRange)}.`,
      'Demander si le client veut prendre rendez-vous pour ce nouveau probleme (oui/non).',
    ].join(' ');
    const fallback = [
      `Nouveau probleme identifie : ${newIssue.label}.`,
      `Urgence : ${urgencyMeta.label} (${urgencyMeta.delaiText}).`,
      newIssue.advice,
      `Estimation : ${formatPrice(newIssue.priceRange)}.`,
      'Souhaitez-vous prendre rendez-vous ? (oui/non)',
    ].join(' ');
    return {
      reply: await buildReply(message, facts, fallback),
      appointment: null,
      issue: newIssue,
      step: session.step,
    };
  }

  const fallback = "Votre demande precedente est deja enregistree. Avez-vous un autre probleme de plomberie a signaler ?";
  return {
    reply: await buildReply(message, 'Le client a deja un rendez-vous enregistre, demander s\'il a un autre probleme.', fallback),
    appointment: null,
    issue: session.issue,
    step: session.step,
  };
}

module.exports = { handleMessage };
