'use strict';

const { classifyIssue, URGENCY_META } = require('./plumbingKnowledge');
const { createAppointment } = require('./store');
const { polishReply } = require('./llm');
const { getNextAvailableSlots } = require('./calendar');

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
const NEW_ISSUE_WORDS = ['autre probleme', 'nouveau probleme', 'signaler'];

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
      slotOptions: [],
    });
  }
  return sessions.get(sessionId);
}

function resetSession(session) {
  session.step = 'awaiting_description';
  session.clarifyAttempted = false;
  session.issue = null;
  session.contact = {};
  session.slotOptions = [];
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

function reply({ text, appointment = null, issue = null, step, quickReplies = [] }) {
  return { reply: text, appointment, issue, step, quickReplies };
}

function presentDiagnosis(issue) {
  const urgencyMeta = URGENCY_META[issue.urgency];
  const facts = [
    `Diagnostic probable : ${issue.label}.`,
    `Niveau d'urgence : ${urgencyMeta.label} (intervention ${urgencyMeta.delaiText}).`,
    `Conseil de securite : ${issue.advice}`,
    `Estimation tarifaire indicative : ${formatPrice(issue.priceRange)} (hors pieces detachees, confirme sur place).`,
    "Demander au client s'il souhaite prendre rendez-vous maintenant (repondre oui ou non).",
  ].join(' ');
  const fallback = [
    `D'apres votre description, il s'agit probablement de : ${issue.label}.`,
    `Urgence : ${urgencyMeta.label} (intervention ${urgencyMeta.delaiText}).`,
    issue.advice,
    `Estimation indicative : ${formatPrice(issue.priceRange)} (confirmee sur place).`,
    'Souhaitez-vous prendre rendez-vous maintenant ? (oui/non)',
  ].join(' ');
  return { facts, fallback };
}

/**
 * Traite un message utilisateur pour une session donnee et retourne :
 * { reply, appointment, issue, step, quickReplies }
 */
async function handleMessage(sessionId, rawMessage) {
  const session = getSession(sessionId);
  const message = (rawMessage || '').trim();

  if (message && containsAny(message, RESET_WORDS)) {
    resetSession(session);
    const fallback = "D'accord, reprenons a zero. Decrivez-moi le probleme de plomberie que vous rencontrez.";
    return reply({
      text: await buildReply(message, 'La conversation redemarre, demander au client de decrire son probleme.', fallback),
      step: session.step,
    });
  }

  if (session.step === 'awaiting_description') {
    if (!message) {
      const fallback = "Bonjour, je suis l'assistant plomberie. Decrivez-moi votre probleme (fuite, bouchon, panne de chauffe-eau...) et je vous oriente immediatement.";
      return reply({
        text: await buildReply(message, "Message d'accueil, demander de decrire le probleme de plomberie.", fallback),
        step: session.step,
      });
    }

    let issue = classifyIssue(message);

    if (!issue && !session.clarifyAttempted) {
      session.clarifyAttempted = true;
      const fallback = "Je n'ai pas identifie precisement le probleme. S'agit-il d'une fuite, d'une canalisation bouchee, d'une panne de chauffe-eau/chaudiere, ou d'autre chose ? Pouvez-vous preciser ?";
      return reply({
        text: await buildReply(message, "Le probleme n'est pas encore clair, demander de preciser : fuite, bouchon, panne chauffe-eau/chaudiere, ou autre.", fallback),
        step: session.step,
      });
    }

    if (!issue) issue = GENERIC_ISSUE;

    session.issue = issue;
    session.step = 'awaiting_schedule_confirm';

    const { facts, fallback } = presentDiagnosis(issue);
    return reply({
      text: await buildReply(message, facts, fallback),
      issue,
      step: session.step,
      quickReplies: ['Oui, prendre rendez-vous', 'Non merci'],
    });
  }

  if (session.step === 'awaiting_schedule_confirm') {
    if (containsAny(message, NO_WORDS)) {
      resetSession(session);
      const fallback = "Pas de souci. Ecrivez-moi si vous changez d'avis, ou decrivez un nouveau probleme quand vous voulez.";
      return reply({
        text: await buildReply(message, 'Le client ne souhaite pas de rendez-vous pour le moment, rester disponible.', fallback),
        step: session.step,
      });
    }
    if (containsAny(message, YES_WORDS)) {
      session.step = 'awaiting_name';
      const fallback = 'Parfait ! Quel est votre nom complet ?';
      return reply({
        text: await buildReply(message, 'Le client accepte le rendez-vous, demander son nom complet.', fallback),
        issue: session.issue,
        step: session.step,
      });
    }
    const fallback = "Je n'ai pas bien compris : souhaitez-vous prendre rendez-vous maintenant ? (oui/non)";
    return reply({
      text: await buildReply(message, 'Reponse ambigue, redemander une confirmation claire oui/non pour le rendez-vous.', fallback),
      issue: session.issue,
      step: session.step,
      quickReplies: ['Oui, prendre rendez-vous', 'Non merci'],
    });
  }

  if (session.step === 'awaiting_name') {
    if (!message) {
      return reply({ text: 'Pouvez-vous indiquer votre nom complet ?', issue: session.issue, step: session.step });
    }
    session.contact.name = message;
    session.step = 'awaiting_phone';
    const fallback = `Merci ${message}. Quel est votre numero de telephone ?`;
    return reply({
      text: await buildReply(message, `Le client s'appelle ${message}, demander maintenant son numero de telephone.`, fallback),
      issue: session.issue,
      step: session.step,
    });
  }

  if (session.step === 'awaiting_phone') {
    if (!looksLikePhone(message)) {
      return reply({
        text: 'Ce numero ne semble pas valide. Pouvez-vous le resaisir (au moins 6 chiffres) ?',
        issue: session.issue,
        step: session.step,
      });
    }
    session.contact.phone = message;
    session.step = 'awaiting_address';
    const fallback = "Merci. Quelle est l'adresse d'intervention ?";
    return reply({
      text: await buildReply(message, "Le numero de telephone est enregistre, demander l'adresse d'intervention.", fallback),
      issue: session.issue,
      step: session.step,
    });
  }

  if (session.step === 'awaiting_address') {
    if (!message) {
      return reply({ text: "Pouvez-vous preciser l'adresse d'intervention ?", issue: session.issue, step: session.step });
    }
    session.contact.address = message;

    const options = getNextAvailableSlots(session.issue.urgency, 3);
    session.slotOptions = options;

    if (options.length === 0) {
      // Aucune disponibilite trouvee sur l'horizon : on retombe sur une saisie libre,
      // le rendez-vous sera marque "a confirmer" par le plombier.
      session.step = 'awaiting_slot_freetext';
      const fallback = "Adresse enregistree. Aucun creneau standard n'est disponible pour le moment : quel jour et horaire vous conviendraient ? Un technicien confirmera l'horaire exact.";
      return reply({
        text: await buildReply(message, "Aucun creneau standard disponible, demander une preference libre de jour/horaire.", fallback),
        issue: session.issue,
        step: session.step,
      });
    }

    session.step = 'awaiting_slot_choice';
    const optionsList = options.map((o, i) => `${i + 1}) ${o.label}`).join(' | ');
    const fallback = `Adresse enregistree. Voici les prochains creneaux disponibles : ${optionsList}. Repondez avec le numero de votre choix, ou indiquez un autre horaire souhaite.`;
    return reply({
      text: await buildReply(message, `L'adresse est enregistree. Creneaux disponibles a proposer : ${optionsList}. Demander de choisir un numero ou proposer un autre horaire.`, fallback),
      issue: session.issue,
      step: session.step,
      quickReplies: options.map((o) => o.label),
    });
  }

  if (session.step === 'awaiting_slot_choice' || session.step === 'awaiting_slot_freetext') {
    const issue = session.issue || GENERIC_ISSUE;
    const urgencyMeta = URGENCY_META[issue.urgency];

    let slotISO = null;
    let slotLabel = message;
    let autoConfirmed = false;

    if (session.step === 'awaiting_slot_choice') {
      const options = session.slotOptions || [];
      const numMatch = message.match(/^([1-9])/);
      let chosen = null;
      if (numMatch && options[Number(numMatch[1]) - 1]) {
        chosen = options[Number(numMatch[1]) - 1];
      } else {
        chosen = options.find((o) => normalize(message).includes(normalize(o.label))
          || normalize(o.label).includes(normalize(message)));
      }
      if (chosen) {
        slotISO = chosen.iso;
        slotLabel = chosen.label;
        autoConfirmed = true;
      }
    }

    if (!message && !autoConfirmed) {
      return reply({
        text: 'Merci de choisir un creneau (numero) ou de preciser un horaire.',
        issue: session.issue,
        step: session.step,
      });
    }

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
      slot: slotLabel,
      slotISO,
      slotLabel,
      autoConfirmed,
      status: autoConfirmed ? 'confirme' : 'a_confirmer',
      sessionId,
    });

    session.step = 'done';
    session.slotOptions = [];

    const facts = autoConfirmed
      ? [
        `Rendez-vous confirme automatiquement, reference ${appointment.id}.`,
        `Probleme : ${issue.label}. Urgence : ${urgencyMeta.label} (${urgencyMeta.delaiText}).`,
        `Creneau retenu : ${slotLabel}.`,
        `Estimation : ${formatPrice(issue.priceRange)}.`,
        'Remercier le client, le creneau est ferme, aucune autre action de sa part n\'est necessaire.',
      ].join(' ')
      : [
        `Demande enregistree, reference ${appointment.id}, en attente de confirmation du creneau exact par un technicien.`,
        `Probleme : ${issue.label}. Urgence : ${urgencyMeta.label} (${urgencyMeta.delaiText}).`,
        `Horaire souhaite par le client : ${slotLabel}.`,
        `Estimation : ${formatPrice(issue.priceRange)}.`,
        'Rassurer le client : un technicien va valider ce creneau rapidement.',
      ].join(' ');

    const fallback = autoConfirmed
      ? [
        `C'est note ! Votre rendez-vous est confirme (reference ${appointment.id}).`,
        `Probleme : ${issue.label} - urgence ${urgencyMeta.label} (${urgencyMeta.delaiText}).`,
        `Creneau : ${slotLabel}. Estimation : ${formatPrice(issue.priceRange)}.`,
        'Aucune autre action n\'est necessaire de votre part, a bientot !',
      ].join(' ')
      : [
        `Votre demande est enregistree (reference ${appointment.id}).`,
        `Probleme : ${issue.label} - urgence ${urgencyMeta.label} (${urgencyMeta.delaiText}).`,
        `Horaire souhaite : ${slotLabel}. Estimation : ${formatPrice(issue.priceRange)}.`,
        'Un technicien va confirmer ce creneau exact tres prochainement.',
      ].join(' ');

    return reply({
      text: await buildReply(message, facts, fallback),
      appointment,
      issue,
      step: session.step,
      quickReplies: ['Signaler un autre probleme'],
    });
  }

  // step === 'done'
  const wantsNew = containsAny(message, NEW_ISSUE_WORDS);
  const newIssue = classifyIssue(message);
  if (newIssue) {
    session.issue = newIssue;
    session.step = 'awaiting_schedule_confirm';
    session.contact = {};
    session.slotOptions = [];
    const { facts, fallback } = presentDiagnosis(newIssue);
    return reply({
      text: await buildReply(message, facts, fallback),
      issue: newIssue,
      step: session.step,
      quickReplies: ['Oui, prendre rendez-vous', 'Non merci'],
    });
  }

  if (wantsNew) {
    resetSession(session);
    const fallback = 'Bien sur, decrivez-moi ce nouveau probleme de plomberie.';
    return reply({
      text: await buildReply(message, 'Le client veut signaler un nouveau probleme, demander de le decrire.', fallback),
      step: session.step,
    });
  }

  const fallback = 'Votre demande precedente est deja enregistree. Avez-vous un autre probleme de plomberie a signaler ?';
  return reply({
    text: await buildReply(message, "Le client a deja un rendez-vous enregistre, demander s'il a un autre probleme.", fallback),
    issue: session.issue,
    step: session.step,
    quickReplies: ['Signaler un autre probleme'],
  });
}

module.exports = { handleMessage };
