// --- Démo de chat (simulation hors-ligne, sans appel API) ---
const chatBody = document.getElementById("chatBody");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");

// Ordre important : les intentions spécifiques sont vérifiées avant la salutation générique,
// pour qu'un message comme "bonjour, combien coûte le produit ?" déclenche la réponse prix.
const RULES = [
  { keywords: ["prix", "combien", "tarif"], reply: "Le produit que vous cherchez est à 3 500 DA. Livraison disponible dans les 58 wilayas via Yalidine. Voulez-vous commander ?" },
  { keywords: ["commande", "commander", "acheter"], reply: "Parfait ! Pouvez-vous me donner votre nom complet, votre wilaya et votre numéro de téléphone pour préparer la commande ?" },
  { keywords: ["confirme", "confirmer", "oui"], reply: "Commande confirmée ✅. Vous recevrez un SMS de confirmation avant l'expédition, et votre colis sera livré sous 2 à 4 jours. Paiement à la livraison (COD)." },
  { keywords: ["livraison", "livrer", "delai", "délai", "quand"], reply: "La livraison prend généralement 2 à 4 jours ouvrés selon votre wilaya (via Yalidine). Je peux suivre votre colis si vous me donnez votre numéro de commande." },
  { keywords: ["merci", "chokran"], reply: "Avec plaisir ! N'hésitez pas si vous avez d'autres questions. Bonne journée 🙌" },
  { keywords: ["bonjour", "salam", "salut", "bonsoir"], reply: "Bonjour ! 😊 Je suis l'assistant de Boutique Nadia. Vous voulez connaître un prix, passer commande, ou suivre une livraison ?" },
];

const FALLBACK = "Je note votre message. Un membre de l'équipe Boutique Nadia va vous répondre rapidement. En attendant, vous pouvez me demander un prix, passer commande, ou suivre une livraison.";

function botReplyFor(text) {
  const lower = text.toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some((k) => lower.includes(k))) return rule.reply;
  }
  return FALLBACK;
}

function appendMessage(text, who) {
  const div = document.createElement("div");
  div.className = `msg ${who}`;
  div.textContent = text;
  chatBody.appendChild(div);
  chatBody.scrollTop = chatBody.scrollHeight;
}

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;
  appendMessage(text, "user");
  chatInput.value = "";

  setTimeout(() => {
    appendMessage(botReplyFor(text), "bot");
  }, 500);
});

// --- Formulaire de contact ---
// Pas de backend branché : on ouvre le client mail de l'utilisateur avec les infos pré-remplies.
// Remplacez CONTACT_EMAIL par votre adresse pour recevoir les demandes.
const CONTACT_EMAIL = "contact@dz-automation.example";

const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

contactForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = new FormData(contactForm);
  const name = data.get("name");
  const contact = data.get("contact");
  const business = data.get("business") || "Non précisé";
  const message = data.get("message") || "Aucun message";

  const subject = encodeURIComponent(`Demande de devis — ${name}`);
  const body = encodeURIComponent(
    `Nom: ${name}\nContact: ${contact}\nActivité: ${business}\n\nMessage:\n${message}`
  );

  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  formStatus.textContent = "Votre client mail va s'ouvrir pour envoyer la demande.";
});
