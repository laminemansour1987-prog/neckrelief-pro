(function () {
  const TOKEN_KEY = 'plomberie-ia-admin-token';
  const loginView = document.getElementById('login-view');
  const dashboardView = document.getElementById('dashboard-view');
  const tokenInput = document.getElementById('token-input');
  const loginBtn = document.getElementById('login-btn');
  const refreshBtn = document.getElementById('refresh-btn');
  const filterStatus = document.getElementById('filter-status');
  const filterUrgency = document.getElementById('filter-urgency');
  const tableContainer = document.getElementById('table-container');

  let token = null;
  try { token = sessionStorage.getItem(TOKEN_KEY); } catch (e) { /* ignore */ }

  const STATUS_LABELS = {
    nouveau: 'Nouveau',
    a_confirmer: 'A confirmer',
    confirme: 'Confirme',
    en_cours: 'En cours',
    termine: 'Termine',
    annule: 'Annule',
  };

  const URGENCY_LABELS = {
    urgente: 'Urgente',
    rapide: 'Rapide',
    normale: 'Normale',
    planifiable: 'Planifiable',
  };

  const statsBar = document.getElementById('stats-bar');
  const liveIndicator = document.getElementById('live-indicator');
  let eventSource = null;

  function showDashboard() {
    loginView.style.display = 'none';
    dashboardView.style.display = 'block';
    loadAppointments();
    loadStats();
    connectLiveFeed();
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  function showLogin(message) {
    loginView.style.display = 'block';
    dashboardView.style.display = 'none';
    if (message) alert(message);
  }

  async function loadStats() {
    try {
      const res = await fetch('/api/stats', { headers: { 'x-admin-token': token } });
      if (!res.ok) return;
      const stats = await res.json();
      renderStats(stats);
    } catch (err) { /* silencieux : la table reste la source de verite */ }
  }

  function renderStats(stats) {
    const urgente = stats.byUrgency?.urgente || 0;
    const aConfirmer = stats.byStatus?.a_confirmer || 0;
    const tiles = [
      { label: 'Demandes recues (total)', value: stats.total },
      { label: "Aujourd'hui", value: stats.today },
      { label: 'Urgentes', value: urgente },
      { label: 'A confirmer', value: aConfirmer },
    ];
    statsBar.innerHTML = tiles.map((t) => `
      <div class="stat-tile"><div class="value">${t.value}</div><div class="label">${t.label}</div></div>
    `).join('');
  }

  function playBeep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = 880;
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (err) { /* audio indisponible, ignorer */ }
  }

  function connectLiveFeed() {
    if (eventSource) eventSource.close();
    eventSource = new EventSource(`/api/events?token=${encodeURIComponent(token)}`);

    eventSource.onopen = () => {
      liveIndicator.innerHTML = '<span class="live-dot"></span>Suivi en temps reel actif : les nouvelles demandes apparaissent automatiquement.';
    };

    eventSource.addEventListener('appointment', (e) => {
      let appointment = null;
      try { appointment = JSON.parse(e.data); } catch (err) { /* ignore */ }
      playBeep();
      if ('Notification' in window && Notification.permission === 'granted') {
        const urgencyTxt = appointment ? (URGENCY_LABELS[appointment.urgency] || '') : '';
        new Notification('Nouvelle demande de plomberie', {
          body: appointment ? `${appointment.issueLabel} - ${urgencyTxt} (${appointment.name})` : 'Une nouvelle demande vient d\'arriver.',
        });
      }
      loadAppointments();
      loadStats();
    });

    eventSource.onerror = () => {
      liveIndicator.innerHTML = '<span class="live-dot"></span>Reconnexion au flux temps reel...';
    };
  }

  async function loadAppointments() {
    tableContainer.innerHTML = '<p class="empty-state">Chargement...</p>';
    try {
      const res = await fetch('/api/appointments', {
        headers: { 'x-admin-token': token },
      });
      if (res.status === 401) {
        try { sessionStorage.removeItem(TOKEN_KEY); } catch (e) { /* ignore */ }
        token = null;
        showLogin('Jeton invalide. Merci de vous reconnecter.');
        return;
      }
      const data = await res.json();
      renderTable(data);
    } catch (err) {
      tableContainer.innerHTML = '<p class="empty-state">Erreur lors du chargement des demandes.</p>';
    }
  }

  function renderTable(appointments) {
    const statusFilter = filterStatus.value;
    const urgencyFilter = filterUrgency.value;

    const filtered = appointments.filter((a) => {
      if (statusFilter && a.status !== statusFilter) return false;
      if (urgencyFilter && a.urgency !== urgencyFilter) return false;
      return true;
    });

    if (filtered.length === 0) {
      tableContainer.innerHTML = '<p class="empty-state">Aucune demande pour ces filtres.</p>';
      return;
    }

    const rows = filtered.map((a) => `
      <tr>
        <td>${a.id}</td>
        <td>${new Date(a.createdAt).toLocaleString('fr-FR')}</td>
        <td>${escapeHtml(a.issueLabel || '')}</td>
        <td><span class="badge ${a.urgency}">${a.urgencyLabel || a.urgency}</span></td>
        <td>${escapeHtml(a.name || '')}<br><small>${escapeHtml(a.phone || '')}</small></td>
        <td>${escapeHtml(a.address || '')}</td>
        <td>${escapeHtml(a.slot || '')}</td>
        <td>${a.priceRangeMin ?? ''}-${a.priceRangeMax ?? ''} EUR</td>
        <td>
          <select class="status-select" data-id="${a.id}">
            ${Object.entries(STATUS_LABELS).map(([value, label]) =>
              `<option value="${value}" ${a.status === value ? 'selected' : ''}>${label}</option>`
            ).join('')}
          </select>
        </td>
      </tr>
    `).join('');

    tableContainer.innerHTML = `
      <table class="appointments">
        <thead>
          <tr>
            <th>Reference</th>
            <th>Recue le</th>
            <th>Probleme</th>
            <th>Urgence</th>
            <th>Client</th>
            <th>Adresse</th>
            <th>Creneau</th>
            <th>Estimation</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    tableContainer.querySelectorAll('.status-select').forEach((select) => {
      select.addEventListener('change', async (e) => {
        const id = e.target.getAttribute('data-id');
        const status = e.target.value;
        await updateStatus(id, status);
      });
    });
  }

  async function updateStatus(id, status) {
    try {
      const res = await fetch(`/api/appointments/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        alert('Impossible de mettre a jour le statut.');
        loadAppointments();
      } else {
        loadStats();
      }
    } catch (err) {
      alert('Erreur reseau lors de la mise a jour du statut.');
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  loginBtn.addEventListener('click', () => {
    const value = tokenInput.value.trim();
    if (!value) return;
    token = value;
    try { sessionStorage.setItem(TOKEN_KEY, token); } catch (e) { /* ignore */ }
    showDashboard();
  });

  tokenInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') loginBtn.click();
  });

  refreshBtn.addEventListener('click', loadAppointments);
  filterStatus.addEventListener('change', loadAppointments);
  filterUrgency.addEventListener('change', loadAppointments);

  if (token) {
    showDashboard();
  } else {
    showLogin();
  }
})();
