const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// --- Liens WhatsApp ---
// Remplacez WHATSAPP_NUMBER par votre numéro au format international sans "+" ni espaces (ex: 213555000000).
const WHATSAPP_NUMBER = "213500000000";

document.querySelectorAll(".whatsapp-link").forEach((link) => {
  const text = link.dataset.waText || "Bonjour, je voudrais en savoir plus.";
  link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  link.target = "_blank";
  link.rel = "noopener";
});

// --- Panneau "journal d'activité" du hero (simulation) ---
const OPS_EVENTS = [
  { time: "23:47", text: "Réponse envoyée à un client", place: "Oran" },
  { time: "23:52", text: "Commande #5182 confirmée", place: "Alger" },
  { time: "00:14", text: "Suivi de livraison partagé", place: "Béjaïa" },
  { time: "00:36", text: "Nouveau prospect qualifié", place: "Sétif" },
  { time: "01:02", text: "Commande #5183 confirmée", place: "Tlemcen" },
  { time: "01:29", text: "Question prix répondue", place: "Constantine" },
  { time: "02:05", text: "Colis remis à Yalidine", place: "Annaba" },
  { time: "02:41", text: "Commande #5184 confirmée", place: "Blida" },
];

function buildOpsFeed() {
  const feed = document.getElementById("opsFeed");
  if (!feed) return;

  const renderItems = () =>
    OPS_EVENTS.map(
      (e) => `<li><time>${e.time}</time><span>${e.text} · <span class="ops-place">${e.place}</span></span></li>`
    ).join("");

  // Le contenu est dupliqué pour permettre une boucle de défilement continue (translateY -50%).
  feed.innerHTML = renderItems() + renderItems();
}
buildOpsFeed();

// --- Révélation au scroll ---
if (!prefersReducedMotion && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
} else {
  document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
}

// --- Menu mobile ---
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle?.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

// --- Bascule thème clair / sombre ---
const themeToggle = document.getElementById("themeToggle");
const root = document.documentElement;
const storedTheme = localStorage.getItem("dz-theme");
if (storedTheme) root.setAttribute("data-theme", storedTheme);

themeToggle?.addEventListener("click", () => {
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  const current = root.getAttribute("data-theme") || (prefersLight ? "light" : "dark");
  const next = current === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", next);
  localStorage.setItem("dz-theme", next);
});

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
