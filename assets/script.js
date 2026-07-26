const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// --- Liens WhatsApp ---
// Remplacez WHATSAPP_NUMBER par votre numéro au format international sans "+" ni espaces (ex: 213555000000).
const WHATSAPP_NUMBER = "33624630854";

function refreshWhatsappLinks() {
  document.querySelectorAll(".whatsapp-link").forEach((link) => {
    const text = link.dataset.waText || "Bonjour, je voudrais en savoir plus.";
    link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    link.target = "_blank";
    link.rel = "noopener";
  });
}
refreshWhatsappLinks();

// -------------------------------------------------------------------------
// i18n — Français / Arabe (avec bascule RTL)
// -------------------------------------------------------------------------
const I18N = {
  "nav.services": { fr: "Ce qu'il prend en charge", ar: "ما يقوم به" },
  "nav.how": { fr: "Comment ça marche", ar: "كيف يعمل" },
  "nav.demo": { fr: "Démo", ar: "تجربة حية" },
  "nav.pricing": { fr: "Tarifs", ar: "الأسعار" },
  "nav.calc": { fr: "Calculette", ar: "الحاسبة" },
  "nav.faq": { fr: "FAQ", ar: "الأسئلة الشائعة" },
  "nav.contact": { fr: "Contact", ar: "تواصل معنا" },

  "hero.eyebrow": { fr: "Automatisation IA · Algérie", ar: "أتمتة بالذكاء الاصطناعي · الجزائر" },
  "hero.title": {
    fr: "Pendant que vous dormez,<br><em>votre commerce</em> répond, confirme et vend.",
    ar: "بينما أنت نائم،<br><em>متجرك</em> يرد، يؤكد الطلبات، ويبيع.",
  },
  "hero.subtitle": {
    fr: "Un assistant IA prend le relais sur WhatsApp et Messenger : il répond aux clients, confirme les commandes à la livraison (COD) et suit les colis Yalidine — du lever au coucher du soleil, et bien après.",
    ar: "مساعد ذكاء اصطناعي يتولى الرد على واتساب وماسنجر: يجيب على العملاء، يؤكد طلبات الدفع عند الاستلام، ويتابع شحنات يالدين — من شروق الشمس إلى غروبها، وما بعد ذلك.",
  },
  "cta.whatsapp": { fr: "Discuter sur WhatsApp", ar: "تواصل عبر واتساب" },
  "cta.demo": { fr: "Voir la démo en direct", ar: "شاهد التجربة الحية" },
  "hero.note": {
    fr: "Premier message répondu en moins de 5&nbsp;secondes · 58 wilayas · Français &amp; darija",
    ar: "الرد على أول رسالة في أقل من 5 ثوانٍ · 58 ولاية · بالفرنسية والدارجة",
    html: true,
  },
  "ops.header": { fr: "Journal d'activité — en direct", ar: "سجل النشاط — مباشر" },

  "compare.eyebrow": { fr: "La différence", ar: "الفرق" },
  "compare.title": { fr: "Ce qui change concrètement", ar: "ما الذي يتغير فعلياً" },
  "compare.lead": {
    fr: "Rien d'abstrait : voici ce qui se passe réellement sur vos conversations, avant et après.",
    ar: "لا شيء نظري: هذا ما يحدث فعلاً في محادثاتك، قبل وبعد.",
  },
  "compare.before.head": { fr: "Sans assistant", ar: "بدون مساعد" },
  "compare.after.head": { fr: "Avec DZ Automation", ar: "مع DZ Automation" },
  "compare.before.1": { fr: "Vous répondez quand vous pouvez, parfois plusieurs heures après le message", ar: "أنت ترد عندما تستطيع، أحياناً بعد ساعات من استلام الرسالة" },
  "compare.before.2": { fr: "Vous appelez chaque client un par un pour confirmer la commande COD", ar: "تتصل بكل عميل يدوياً لتأكيد طلب الدفع عند الاستلام" },
  "compare.before.3": { fr: "Les messages du soir et du weekend attendent le lendemain", ar: "رسائل المساء وعطلة نهاية الأسبوع تنتظر اليوم التالي" },
  "compare.before.4": { fr: "Le client vous relance pour savoir où en est son colis", ar: "يضطر العميل لسؤالك عن حالة طرده" },
  "compare.after.1": { fr: "Réponse en moins de 5 secondes, à toute heure", ar: "رد في أقل من 5 ثوانٍ، في أي وقت" },
  "compare.after.2": { fr: "Confirmation automatique envoyée avant l'expédition", ar: "تأكيد تلقائي يُرسل قبل الشحن" },
  "compare.after.3": { fr: "L'assistant répond aussi la nuit et le weekend", ar: "المساعد يرد أيضاً ليلاً وفي عطلة نهاية الأسبوع" },
  "compare.after.4": { fr: "Le statut du colis est envoyé sans que le client ait à demander", ar: "تُرسل حالة الطرد دون أن يضطر العميل للسؤال" },

  "services.eyebrow": { fr: "Ce qu'il prend en charge", ar: "ما يقوم به" },
  "services.title": { fr: "Un assistant, quatre postes surveillés", ar: "مساعد واحد، أربع مهام تحت المراقبة" },
  "services.lead": {
    fr: "Chaque ligne tourne en continu, adaptée au terrain algérien : COD, Yalidine, réseaux sociaux, darija.",
    ar: "كل مهمة تعمل باستمرار، مصممة خصيصاً للسوق الجزائري: الدفع عند الاستلام، يالدين، شبكات التواصل، والدارجة.",
  },
  "services.1.title": { fr: "Réponse WhatsApp & Messenger", ar: "الرد على واتساب وماسنجر" },
  "services.1.desc": { fr: "Répond aux prospects en quelques secondes, qualifie la demande et propose le produit adapté — même à 2h du matin.", ar: "يرد على العملاء المحتملين خلال ثوانٍ، يحدد طبيعة الطلب، ويقترح المنتج المناسب — حتى الساعة الثانية صباحاً." },
  "services.1.tag": { fr: "24/7", ar: "24/7" },
  "services.2.title": { fr: "Confirmation de commande COD", ar: "تأكيد طلبات الدفع عند الاستلام" },
  "services.2.desc": { fr: "Un message de confirmation automatique avant expédition : moins de faux numéros, moins de colis refusés.", ar: "رسالة تأكيد تلقائية قبل الشحن: أرقام هاتف وهمية أقل، وطرود مرفوضة أقل." },
  "services.2.tag": { fr: "Anti-annulation", ar: "ضد الإلغاء" },
  "services.3.title": { fr: "Suivi de livraison Yalidine", ar: "تتبع شحنات يالدين" },
  "services.3.desc": { fr: "Le client reçoit l'état de son colis sans avoir à demander, de la prise en charge jusqu'à la remise.", ar: "يستلم العميل حالة طرده دون طلب، من استلامه إلى تسليمه." },
  "services.3.tag": { fr: "58 wilayas", ar: "58 ولاية" },
  "services.4.title": { fr: "Rapports & tâches internes", ar: "تقارير ومهام داخلية" },
  "services.4.desc": { fr: "Factures générées, stock suivi, rapport de ventes envoyé chaque semaine — sans intervention manuelle.", ar: "إصدار الفواتير، متابعة المخزون، وإرسال تقرير مبيعات أسبوعي — دون تدخل يدوي." },
  "services.4.tag": { fr: "Hebdomadaire", ar: "أسبوعي" },

  "steps.eyebrow": { fr: "Comment ça marche", ar: "كيف يعمل" },
  "steps.title": { fr: "Du premier échange à la mise en service", ar: "من أول تواصل إلى التشغيل الفعلي" },
  "steps.lead": {
    fr: "Un processus court, pensé pour ne pas vous faire perdre de temps sur quelque chose que vous ne connaissez pas encore.",
    ar: "عملية قصيرة، مصممة لعدم إضاعة وقتك في شيء لا تعرفه بعد.",
  },
  "steps.1.title": { fr: "Appel de découverte (15 min)", ar: "مكالمة تعارف (15 دقيقة)" },
  "steps.1.desc": { fr: "On regarde vos produits, votre volume de commandes et votre façon actuelle de répondre aux clients.", ar: "نطّلع على منتجاتك، حجم طلباتك، وطريقتك الحالية في الرد على العملاء." },
  "steps.2.title": { fr: "Configuration sur mesure", ar: "إعداد مخصص" },
  "steps.2.desc": { fr: "Réponses, ton, produits et zones de livraison sont réglés spécifiquement pour votre activité, en français et darija.", ar: "يتم ضبط الردود، الأسلوب، المنتجات، ومناطق التوصيل خصيصاً لنشاطك، بالفرنسية والدارجة." },
  "steps.3.title": { fr: "Test en conditions réelles (7 jours)", ar: "اختبار في ظروف حقيقية (7 أيام)" },
  "steps.3.desc": { fr: "Vous suivez chaque conversation en direct pendant l'essai gratuit, et on ajuste ensemble ce qui doit l'être.", ar: "تتابع كل محادثة مباشرة خلال فترة التجربة المجانية، ونقوم معاً بضبط ما يلزم." },
  "steps.4.title": { fr: "Mise en service", ar: "التشغيل الفعلي" },
  "steps.4.desc": { fr: "L'assistant tourne seul au quotidien. Vous gardez la main à tout moment sur n'importe quelle conversation.", ar: "يعمل المساعد بمفرده يومياً. وتبقى قادراً على التدخل في أي محادثة في أي وقت." },

  "demo.eyebrow": { fr: "Essayez-le", ar: "جرّبه" },
  "demo.title": { fr: "La démo, pas une capture d'écran", ar: "تجربة حقيقية، لا مجرد صورة" },
  "demo.lead": {
    fr: "Simulation de l'assistant pour « Boutique Nadia », une boutique fictive. Écrivez comme le ferait un client sur WhatsApp — prix, commande, livraison.",
    ar: "محاكاة للمساعد الخاص بـ«متجر نادية»، متجر افتراضي. اكتب كما يفعل عميل حقيقي على واتساب — السعر، الطلب، التوصيل.",
  },
  "demo.chatTitle": { fr: "Boutique Nadia — Assistant IA", ar: "متجر نادية — المساعد الذكي" },
  "demo.chatStatus": { fr: "en ligne", ar: "متصل الآن" },
  "demo.placeholder": { fr: "Écrivez votre message...", ar: "اكتب رسالتك..." },
  "demo.send": { fr: "Envoyer", ar: "إرسال" },
  "demo.note": {
    fr: "Démo hors-ligne à but illustratif : les réponses sont simulées pour montrer le type de scénarios qu'un assistant IA gère réellement.",
    ar: "تجربة توضيحية غير متصلة: الردود محاكاة لإظهار نوعية المواقف التي يتعامل معها المساعد فعلياً.",
  },

  "calc.eyebrow": { fr: "Calculette", ar: "الحاسبة" },
  "calc.title": { fr: "Combien vous coûtent les commandes non confirmées ?", ar: "كم تكلفك الطلبات غير المؤكدة؟" },
  "calc.lead": {
    fr: "Un calcul simple à partir de vos propres chiffres — pas une estimation marketing.",
    ar: "حساب بسيط انطلاقاً من أرقامك الخاصة — وليس تقديراً تسويقياً.",
  },
  "calc.field1": { fr: "Commandes COD par mois", ar: "طلبات الدفع عند الاستلام شهرياً" },
  "calc.field2": { fr: "% de commandes annulées / injoignables", ar: "% الطلبات الملغاة / غير القابلة للتواصل" },
  "calc.field3": { fr: "Panier moyen (DA)", ar: "متوسط سلة الشراء (دج)" },
  "calc.resultLabel": { fr: "Perte estimée chaque mois", ar: "الخسارة التقديرية شهرياً" },
  "calc.note": {
    fr: "Basé uniquement sur vos chiffres ci-dessus. La confirmation automatique vise à récupérer une partie de ce montant en fiabilisant chaque commande avant expédition.",
    ar: "مبني فقط على أرقامك أعلاه. يهدف التأكيد التلقائي إلى استرجاع جزء من هذا المبلغ عبر التحقق من كل طلب قبل الشحن.",
  },

  "pricing.eyebrow": { fr: "Tarifs", ar: "الأسعار" },
  "pricing.title": { fr: "Trois formules, un devis sur mesure", ar: "ثلاث باقات، وعرض سعر مخصص" },
  "pricing.lead": {
    fr: "Sans engagement long terme. Le devis final dépend de votre volume de commandes.",
    ar: "دون التزام طويل الأمد. السعر النهائي يعتمد على حجم طلباتك.",
  },
  "pricing.unit": { fr: "DA / mois", ar: "دج / شهرياً" },
  "pricing.choose": { fr: "Choisir", ar: "اختر" },
  "pricing.badge": { fr: "Le plus choisi", ar: "الأكثر اختياراً" },
  "pricing.starter.1": { fr: "Assistant WhatsApp basique", ar: "مساعد واتساب أساسي" },
  "pricing.starter.2": { fr: "Réponses aux questions fréquentes", ar: "الرد على الأسئلة الشائعة" },
  "pricing.starter.3": { fr: "Jusqu'à 300 conversations / mois", ar: "حتى 300 محادثة شهرياً" },
  "pricing.business.1": { fr: "Tout Starter, plus :", ar: "كل مزايا Starter، بالإضافة إلى:" },
  "pricing.business.2": { fr: "Confirmation automatique des commandes COD", ar: "تأكيد تلقائي لطلبات الدفع عند الاستلام" },
  "pricing.business.3": { fr: "Suivi Yalidine intégré", ar: "تتبع مدمج مع يالدين" },
  "pricing.business.4": { fr: "Conversations illimitées", ar: "محادثات غير محدودة" },
  "pricing.custom.title": { fr: "Sur-mesure", ar: "مخصص" },
  "pricing.custom.price": { fr: "Devis", ar: "عرض سعر" },
  "pricing.custom.1": { fr: "Automatisation de workflows internes", ar: "أتمتة سير العمل الداخلي" },
  "pricing.custom.2": { fr: "Intégrations spécifiques (ERP, caisse...)", ar: "تكاملات خاصة (ERP، الصندوق...)" },
  "pricing.custom.3": { fr: "Accompagnement dédié", ar: "مرافقة مخصصة" },
  "pricing.custom.cta": { fr: "Nous contacter", ar: "تواصل معنا" },

  "reassure.1": { fr: "7 jours d'essai gratuit", ar: "تجربة مجانية لمدة 7 أيام" },
  "reassure.2": { fr: "Sans engagement long terme", ar: "دون التزام طويل الأمد" },
  "reassure.3": { fr: "Un humain reprend la main à tout moment", ar: "بإمكان شخص حقيقي التدخل في أي وقت" },
  "reassure.4": { fr: "Compatible Yalidine, ZR Express, Maystro Delivery", ar: "متوافق مع يالدين، ZR Express، وMaystro Delivery" },

  "faq.eyebrow": { fr: "Questions fréquentes", ar: "الأسئلة الشائعة" },
  "faq.title": { fr: "Avant de vous décider", ar: "قبل أن تقرر" },
  "faq.lead": { fr: "Les questions qu'on nous pose le plus souvent avant de se lancer.", ar: "الأسئلة الأكثر تكراراً قبل البدء." },
  "faq.1.q": { fr: "Est-ce que je perds le contrôle de mes conversations ?", ar: "هل سأفقد السيطرة على محادثاتي؟" },
  "faq.1.a": { fr: "Non. Vous voyez toutes les conversations en temps réel et pouvez reprendre la main manuellement à tout moment, sur n'importe quel client.", ar: "لا. تشاهد جميع المحادثات مباشرة، ويمكنك التدخل يدوياً في أي وقت، مع أي عميل." },
  "faq.2.q": { fr: "Ça fonctionne avec Yalidine, ZR Express ou Maystro Delivery ?", ar: "هل يعمل مع يالدين أو ZR Express أو Maystro Delivery؟" },
  "faq.2.a": { fr: "Oui. L'intégration se fait avec le service de livraison que vous utilisez déjà — pas besoin d'en changer.", ar: "نعم. يتم الربط مع شركة التوصيل التي تستخدمها حالياً — لا حاجة لتغييرها." },
  "faq.3.q": { fr: "C'est un vrai assistant IA ou un chatbot rigide qui répond à côté ?", ar: "هل هو مساعد ذكاء اصطناعي حقيقي أم روبوت محادثة جامد يرد بشكل عشوائي؟" },
  "faq.3.a": { fr: "L'assistant est configuré spécifiquement sur vos produits et votre façon de vendre, pas un script générique. Et un humain peut toujours reprendre la conversation si la demande sort du cadre.", ar: "المساعد يتم إعداده خصيصاً على منتجاتك وطريقتك في البيع، وليس نصاً عاماً جاهزاً. ويمكن لشخص حقيقي التدخل دائماً إذا خرج الطلب عن الإطار المحدد." },
  "faq.4.q": { fr: "Combien de temps avant que ce soit opérationnel ?", ar: "كم من الوقت يلزم ليصبح جاهزاً للعمل؟" },
  "faq.4.a": { fr: "Comptez 3 à 5 jours entre le premier échange et la mise en service, précédés d'une semaine de test en conditions réelles.", ar: "من 3 إلى 5 أيام بين أول تواصل والتشغيل الفعلي، تسبقها أسبوع من الاختبار في ظروف حقيقية." },
  "faq.5.q": { fr: "Est-ce que ça remplace mon équipe ?", ar: "هل سيحل محل فريق عملي؟" },
  "faq.5.a": { fr: "Non. L'assistant absorbe les tâches répétitives — réponses, confirmations, suivi de livraison — pour que vous et votre équipe vous concentriez sur le reste.", ar: "لا. يتكفل المساعد بالمهام المتكررة — الردود، التأكيدات، تتبع التوصيل — لتتفرغوا أنت وفريقك لبقية العمل." },
  "faq.6.q": { fr: "Je peux arrêter quand je veux ?", ar: "هل يمكنني التوقف في أي وقت؟" },
  "faq.6.a": { fr: "Oui, aucun engagement long terme. Vous résiliez à tout moment, sans frais cachés.", ar: "نعم، دون أي التزام طويل الأمد. يمكنك الإلغاء في أي وقت، دون رسوم خفية." },

  "contact.eyebrow": { fr: "Contact", ar: "تواصل معنا" },
  "contact.title": { fr: "Parlons de votre projet", ar: "لنتحدث عن مشروعك" },
  "contact.lead": { fr: "La plupart des échanges se font directement sur WhatsApp — c'est le plus rapide.", ar: "معظم التواصل يتم مباشرة عبر واتساب — إنه الأسرع." },
  "contact.note": { fr: "Ou laissez vos coordonnées ci-contre, réponse sous 24h.", ar: "أو اترك معلومات التواصل هنا، وسنرد خلال 24 ساعة." },
  "contact.form.name": { fr: "Nom", ar: "الاسم" },
  "contact.form.contact": { fr: "Téléphone ou email", ar: "الهاتف أو البريد الإلكتروني" },
  "contact.form.business": { fr: "Votre activité", ar: "نشاطك التجاري" },
  "contact.form.businessPh": { fr: "Ex : boutique de vêtements, dropshipping...", ar: "مثال: متجر ملابس، دروبشيبينغ..." },
  "contact.form.message": { fr: "Message", ar: "الرسالة" },
  "contact.form.messagePh": { fr: "Décrivez ce dont vous avez besoin", ar: "صف ما تحتاجه" },
  "contact.form.submit": { fr: "Envoyer la demande", ar: "إرسال الطلب" },

  "footer.copy": { fr: "© 2026 — Automatisation IA pour commerces algériens.", ar: "© 2026 — أتمتة بالذكاء الاصطناعي للتجار الجزائريين." },

  "a11y.theme": { fr: "Changer de thème", ar: "تغيير المظهر" },
  "a11y.menu": { fr: "Ouvrir le menu", ar: "فتح القائمة" },

  "chat.first": { fr: "Bonjour 👋 Bienvenue chez Boutique Nadia ! Comment puis-je vous aider ? (prix, commande, livraison...)", ar: "مرحباً 👋 أهلاً بك في متجر نادية! كيف يمكنني مساعدتك؟ (السعر، الطلب، التوصيل...)" },
  "form.status.sent": { fr: "Votre client mail va s'ouvrir pour envoyer la demande.", ar: "سيتم فتح برنامج البريد لإرسال الطلب." },
};

let currentLang = localStorage.getItem("dz-lang") || "fr";

function applyLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang === "ar" ? "ar" : "fr";
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.body.classList.toggle("lang-ar", lang === "ar");

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const entry = I18N[el.dataset.i18n];
    if (!entry) return;
    const value = entry[lang] || entry.fr;
    if (el.hasAttribute("data-i18n-html") || entry.html) {
      el.innerHTML = value;
    } else {
      el.textContent = value;
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const entry = I18N[el.dataset.i18nPlaceholder];
    if (entry) el.placeholder = entry[lang] || entry.fr;
  });

  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const entry = I18N[el.dataset.i18nAria];
    if (entry) el.setAttribute("aria-label", entry[lang] || entry.fr);
  });

  const langToggle = document.getElementById("langToggle");
  if (langToggle) langToggle.textContent = lang === "ar" ? "Français" : "عربي";

  const firstMsg = document.getElementById("chatFirstMsg");
  if (firstMsg && firstMsg.dataset.userTouched !== "true") {
    firstMsg.textContent = I18N["chat.first"][lang] || I18N["chat.first"].fr;
  }

  buildOpsFeed(lang);
  runPhoneDemo(lang);
  localStorage.setItem("dz-lang", lang);
}

document.getElementById("langToggle")?.addEventListener("click", () => {
  applyLanguage(currentLang === "ar" ? "fr" : "ar");
});

// --- Panneau "journal d'activité" du hero (simulation) ---
const OPS_EVENTS = [
  { time: "23:47", fr: "Réponse envoyée à un client", ar: "تم الرد على عميل", place: { fr: "Oran", ar: "وهران" } },
  { time: "23:52", fr: "Commande #5182 confirmée", ar: "تم تأكيد الطلب رقم 5182", place: { fr: "Alger", ar: "الجزائر" } },
  { time: "00:14", fr: "Suivi de livraison partagé", ar: "تمت مشاركة تتبع الشحنة", place: { fr: "Béjaïa", ar: "بجاية" } },
  { time: "00:36", fr: "Nouveau prospect qualifié", ar: "تأهيل عميل محتمل جديد", place: { fr: "Sétif", ar: "سطيف" } },
  { time: "01:02", fr: "Commande #5183 confirmée", ar: "تم تأكيد الطلب رقم 5183", place: { fr: "Tlemcen", ar: "تلمسان" } },
  { time: "01:29", fr: "Question prix répondue", ar: "تمت الإجابة عن سؤال حول السعر", place: { fr: "Constantine", ar: "قسنطينة" } },
  { time: "02:05", fr: "Colis remis à Yalidine", ar: "تم تسليم الطرد لشركة يالدين", place: { fr: "Annaba", ar: "عنابة" } },
  { time: "02:41", fr: "Commande #5184 confirmée", ar: "تم تأكيد الطلب رقم 5184", place: { fr: "Blida", ar: "البليدة" } },
];

function buildOpsFeed(lang) {
  const feed = document.getElementById("opsFeed");
  if (!feed) return;

  const renderItems = () =>
    OPS_EVENTS.map(
      (e) =>
        `<li><time>${e.time}</time><span>${lang === "ar" ? e.ar : e.fr} · <span class="ops-place">${lang === "ar" ? e.place.ar : e.place.fr}</span></span></li>`
    ).join("");

  // Le contenu est dupliqué pour permettre une boucle de défilement continue (translateX -50%).
  feed.innerHTML = renderItems() + renderItems();
}

// --- Mockup téléphone : conversation WhatsApp jouée automatiquement en boucle ---
const PHONE_SCRIPT = {
  fr: [
    { who: "in", text: "Bonjour, le produit est encore disponible ?" },
    { who: "out", text: "Oui disponible ✅ 3 500 DA, livraison Yalidine incluse." },
    { who: "in", text: "Je le prends, comment je fais ?" },
    { who: "out", text: "Donnez-moi votre nom, wilaya et téléphone, je prépare la commande." },
    { who: "in", text: "Amina Belkacem, Oran, 0555 12 34 56" },
    { who: "out", text: "Commande confirmée ✅ Livraison sous 2 à 4 jours. Merci Amina !" },
  ],
  ar: [
    { who: "in", text: "السلام، المنتج مازال موجود؟" },
    { who: "out", text: "نعم متوفر ✅ السعر 3500 دج، التوصيل عبر يالدين مشمول." },
    { who: "in", text: "نأخذه، كيفاش ندير؟" },
    { who: "out", text: "عطيني اسمك، ولايتك، ورقم هاتفك، ونحضرلك الطلب." },
    { who: "in", text: "أمينة بلقاسم، وهران، 0555 12 34 56" },
    { who: "out", text: "تم تأكيد الطلب ✅ التوصيل خلال يومين إلى 4 أيام. شكراً أمينة!" },
  ],
};

let phoneGeneration = 0;

function phoneTime() {
  return new Date().toLocaleTimeString(currentLang === "ar" ? "ar-DZ" : "fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function appendPhoneTyping(body) {
  const el = document.createElement("div");
  el.className = "phone-bubble in typing";
  el.innerHTML = '<span class="typing-dots"><span></span><span></span><span></span></span>';
  body.appendChild(el);
  body.scrollTop = body.scrollHeight;
  return el;
}

function appendPhoneBubble(body, msg, animateTicks) {
  const el = document.createElement("div");
  el.className = `phone-bubble ${msg.who}`;

  const textSpan = document.createElement("span");
  textSpan.textContent = msg.text;
  el.appendChild(textSpan);

  const meta = document.createElement("span");
  meta.className = "phone-meta";
  const time = document.createElement("span");
  time.textContent = phoneTime();
  meta.appendChild(time);

  if (msg.who === "out") {
    const ticks = document.createElement("span");
    ticks.className = "phone-check";
    ticks.textContent = "✓✓";
    meta.appendChild(ticks);
    if (animateTicks) {
      setTimeout(() => ticks.classList.add("read"), 700);
    } else {
      ticks.classList.add("read");
    }
  }
  el.appendChild(meta);

  body.appendChild(el);
  body.scrollTop = body.scrollHeight;
}

function runPhoneDemo(lang) {
  const gen = ++phoneGeneration;
  const body = document.getElementById("phoneChatBody");
  const statusEl = document.getElementById("phoneStatus");
  if (!body) return;
  const script = PHONE_SCRIPT[lang] || PHONE_SCRIPT.fr;
  body.innerHTML = "";

  if (prefersReducedMotion) {
    script.forEach((msg) => appendPhoneBubble(body, msg, false));
    if (statusEl) statusEl.textContent = lang === "ar" ? "متصل الآن" : "en ligne";
    return;
  }

  let i = 0;
  function step() {
    if (gen !== phoneGeneration) return; // une nouvelle boucle a pris le relais
    if (i >= script.length) {
      setTimeout(() => {
        if (gen !== phoneGeneration) return;
        body.innerHTML = "";
        i = 0;
        step();
      }, 2600);
      return;
    }
    const msg = script[i];
    if (msg.who === "out") {
      if (statusEl) statusEl.textContent = lang === "ar" ? "يكتب..." : "en train d'écrire...";
      const typingEl = appendPhoneTyping(body);
      setTimeout(() => {
        if (gen !== phoneGeneration) return;
        typingEl.remove();
        appendPhoneBubble(body, msg, true);
        if (statusEl) statusEl.textContent = lang === "ar" ? "متصل الآن" : "en ligne";
        i += 1;
        setTimeout(step, 1000);
      }, 900);
    } else {
      appendPhoneBubble(body, msg, false);
      i += 1;
      setTimeout(step, 1100);
    }
  }
  step();
}

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
  {
    keywords: ["prix", "combien", "tarif", "سعر", "بشحال", "كم"],
    reply: {
      fr: "Le produit que vous cherchez est à 3 500 DA. Livraison disponible dans les 58 wilayas via Yalidine. Voulez-vous commander ?",
      ar: "المنتج الذي تبحث عنه سعره 3500 دج. التوصيل متوفر في 58 ولاية عبر يالدين. هل تريد الطلب؟",
    },
  },
  {
    keywords: ["commande", "commander", "acheter", "طلب", "نطلب", "نشري"],
    reply: {
      fr: "Parfait ! Pouvez-vous me donner votre nom complet, votre wilaya et votre numéro de téléphone pour préparer la commande ?",
      ar: "ممتاز! هل يمكنك إعطائي اسمك الكامل، ولايتك، ورقم هاتفك لتحضير الطلب؟",
    },
  },
  {
    keywords: ["confirme", "confirmer", "oui", "نعم", "أكد"],
    reply: {
      fr: "Commande confirmée ✅. Vous recevrez un SMS de confirmation avant l'expédition, et votre colis sera livré sous 2 à 4 jours. Paiement à la livraison (COD).",
      ar: "تم تأكيد الطلب ✅. ستصلك رسالة تأكيد قبل الشحن، وسيصلك الطرد خلال يومين إلى 4 أيام. الدفع عند الاستلام.",
    },
  },
  {
    keywords: ["livraison", "livrer", "delai", "délai", "quand", "توصيل", "وقتاش", "متى"],
    reply: {
      fr: "La livraison prend généralement 2 à 4 jours ouvrés selon votre wilaya (via Yalidine). Je peux suivre votre colis si vous me donnez votre numéro de commande.",
      ar: "التوصيل يستغرق عادة من يومين إلى 4 أيام حسب ولايتك (عبر يالدين). يمكنني تتبع طردك إذا أعطيتني رقم طلبك.",
    },
  },
  {
    keywords: ["merci", "chokran", "شكرا", "يعطيك"],
    reply: {
      fr: "Avec plaisir ! N'hésitez pas si vous avez d'autres questions. Bonne journée 🙌",
      ar: "بكل سرور! لا تتردد إذا كان لديك أي سؤال آخر. يوماً سعيداً 🙌",
    },
  },
  {
    keywords: ["bonjour", "salam", "salut", "bonsoir", "مرحبا", "السلام"],
    reply: {
      fr: "Bonjour ! 😊 Je suis l'assistant de Boutique Nadia. Vous voulez connaître un prix, passer commande, ou suivre une livraison ?",
      ar: "مرحباً! 😊 أنا مساعد متجر نادية. هل تريد معرفة السعر، تقديم طلب، أو تتبع توصيل؟",
    },
  },
];

const FALLBACK = {
  fr: "Je note votre message. Un membre de l'équipe Boutique Nadia va vous répondre rapidement. En attendant, vous pouvez me demander un prix, passer commande, ou suivre une livraison.",
  ar: "لقد سجلت رسالتك. سيرد عليك أحد أعضاء فريق متجر نادية قريباً. في هذه الأثناء، يمكنك سؤالي عن السعر، تقديم طلب، أو تتبع توصيل.",
};

function botReplyFor(text) {
  const lower = text.toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some((k) => lower.includes(k))) return rule.reply[currentLang] || rule.reply.fr;
  }
  return FALLBACK[currentLang] || FALLBACK.fr;
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
  document.getElementById("chatFirstMsg").dataset.userTouched = "true";
  appendMessage(text, "user");
  chatInput.value = "";

  setTimeout(() => {
    appendMessage(botReplyFor(text), "bot");
  }, 500);
});

// --- Calculette de perte estimée ---
const calcOrders = document.getElementById("calcOrders");
const calcCancelRate = document.getElementById("calcCancelRate");
const calcBasket = document.getElementById("calcBasket");
const calcResult = document.getElementById("calcResult");

let calcDisplayed = 0;
let calcAnimFrame = null;

function animateCalcTo(target) {
  if (prefersReducedMotion) {
    calcDisplayed = target;
    calcResult.textContent = target.toLocaleString("fr-FR");
    return;
  }
  cancelAnimationFrame(calcAnimFrame);
  const start = calcDisplayed;
  const startTime = performance.now();
  const duration = 500;

  function frame(now) {
    const t = Math.min(1, (now - startTime) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    calcDisplayed = Math.round(start + (target - start) * eased);
    calcResult.textContent = calcDisplayed.toLocaleString("fr-FR");
    if (t < 1) calcAnimFrame = requestAnimationFrame(frame);
  }
  calcAnimFrame = requestAnimationFrame(frame);
}

function updateCalc() {
  const orders = Math.max(0, Number(calcOrders.value) || 0);
  const rate = Math.min(100, Math.max(0, Number(calcCancelRate.value) || 0));
  const basket = Math.max(0, Number(calcBasket.value) || 0);
  const loss = Math.round((orders * (rate / 100) * basket) / 100) * 100;
  animateCalcTo(loss);
}

[calcOrders, calcCancelRate, calcBasket].forEach((input) => {
  input?.addEventListener("input", updateCalc);
});
updateCalc();

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
  const business = data.get("business") || "-";
  const message = data.get("message") || "-";

  const subject = encodeURIComponent(`Demande de devis — ${name}`);
  const body = encodeURIComponent(
    `Nom: ${name}\nContact: ${contact}\nActivité: ${business}\n\nMessage:\n${message}`
  );

  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  formStatus.textContent = I18N["form.status.sent"][currentLang] || I18N["form.status.sent"].fr;
});

// --- Initialisation ---
applyLanguage(currentLang);
