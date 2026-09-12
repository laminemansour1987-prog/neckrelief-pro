(function () {
  const messagesEl = document.getElementById('chat-messages');
  const formEl = document.getElementById('chat-form');
  const inputEl = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');

  const SESSION_KEY = 'plomberie-ia-session-id';
  let sessionId = null;
  try {
    sessionId = localStorage.getItem(SESSION_KEY);
  } catch (e) { /* localStorage indisponible */ }
  if (!sessionId) {
    sessionId = 'sess-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    try { localStorage.setItem(SESSION_KEY, sessionId); } catch (e) { /* ignore */ }
  }

  function addMessage(text, who) {
    const div = document.createElement('div');
    div.className = 'msg ' + who;
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function clearQuickReplies() {
    const existing = messagesEl.querySelector('.quick-replies');
    if (existing) existing.remove();
  }

  function addQuickReplies(options) {
    clearQuickReplies();
    if (!options || options.length === 0) return;
    const wrap = document.createElement('div');
    wrap.className = 'quick-replies';
    options.forEach((label) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quick-reply-btn';
      btn.textContent = label;
      btn.addEventListener('click', () => {
        clearQuickReplies();
        addMessage(label, 'user');
        sendMessage(label);
      });
      wrap.appendChild(btn);
    });
    messagesEl.appendChild(wrap);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  async function sendMessage(message) {
    sendBtn.disabled = true;
    clearQuickReplies();
    const typingEl = addMessage('...', 'bot typing');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId, message }),
      });
      const data = await res.json();
      typingEl.remove();
      if (!res.ok) {
        addMessage(data.error || "Une erreur est survenue, merci de reessayer.", 'bot');
        return;
      }
      addMessage(data.reply, 'bot');
      addQuickReplies(data.quickReplies);
    } catch (err) {
      typingEl.remove();
      addMessage("Impossible de contacter l'agent pour le moment. Verifiez votre connexion et reessayez.", 'bot');
    } finally {
      sendBtn.disabled = false;
      inputEl.focus();
    }
  }

  formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = inputEl.value.trim();
    if (!value) return;
    addMessage(value, 'user');
    inputEl.value = '';
    sendMessage(value);
  });

  // Message d'accueil automatique au chargement
  sendMessage('');
})();
