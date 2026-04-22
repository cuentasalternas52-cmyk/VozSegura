// ===== VOZSEGURA APP JS =====
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api'
  : '/api';

// ── AUTH GUARD ──
(function checkAuth() {
  const token = localStorage.getItem('vs_token');
  const publicPages = ['index.html', 'login.html', 'register.html', '/', ''];
  const path = window.location.pathname.split('/').pop() || 'index.html';
  if (!token && !publicPages.includes(path)) {
    window.location.href = 'login.html';
  }
})();

// ── LOAD USER DATA ──
function loadUserData() {
  const user = JSON.parse(localStorage.getItem('vs_user') || '{}');
  const initial = (user.nombre || 'U')[0].toUpperCase();

  const avatarEl = document.getElementById('userAvatar');
  if (avatarEl) avatarEl.textContent = initial;

  const nameEl = document.getElementById('userName');
  if (nameEl) nameEl.textContent = user.nombre || 'Usuaria';

  // Perfil page
  const pfNombre = document.getElementById('pfNombre');
  if (pfNombre) pfNombre.textContent = `${user.nombre || ''} ${user.apellido || ''}`.trim() || 'Sin nombre';
  const pfEmail = document.getElementById('pfEmail');
  if (pfEmail) pfEmail.textContent = user.email || 'Sin correo';
  const pfTelefono = document.getElementById('pfTelefono');
  if (pfTelefono) pfTelefono.textContent = user.telefono || '+34 123 456 789';
  const perfilAvatar = document.getElementById('perfilAvatar');
  if (perfilAvatar) perfilAvatar.textContent = initial;
}
loadUserData();

// ── LOGOUT ──
function logout() {
  localStorage.removeItem('vs_token');
  localStorage.removeItem('vs_user');
  window.location.href = 'login.html';
}

// ── FAB CHAT TOGGLE ──
const fabBtn = document.getElementById('fabBtn');
if (fabBtn) fabBtn.addEventListener('click', toggleChat);

function toggleChat() {
  const modal = document.getElementById('chatModal');
  if (modal) modal.classList.toggle('open');
}

// ── CHATBOT ──
let chatHistory = [];

async function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const messages = document.getElementById('chatMessages');
  if (!input || !messages) return;
  const text = input.value.trim();
  if (!text) return;
  input.value = '';

  // User bubble
  appendChatMsg(messages, text, 'user');
  chatHistory.push({ role: 'user', content: text });

  // Typing indicator
  const typingId = 'typing_' + Date.now();
  const typingEl = document.createElement('div');
  typingEl.className = 'cmsg bot';
  typingEl.id = typingId;
  typingEl.innerHTML = `<div class="cmsg-avatar">VS</div><div class="cmsg-bubble"><div class="typing-dots"><span class="td"></span><span class="td"></span><span class="td"></span></div></div>`;
  messages.appendChild(typingEl);
  messages.scrollTop = messages.scrollHeight;

  try {
    const token = localStorage.getItem('vs_token');
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ messages: chatHistory })
    });
    const data = await res.json();
    document.getElementById(typingId)?.remove();
    const reply = data.reply || 'Error al responder. Intenta de nuevo.';
    appendChatMsg(messages, reply, 'bot');
    chatHistory.push({ role: 'assistant', content: reply });
  } catch {
    document.getElementById(typingId)?.remove();
    appendChatMsg(messages, 'Error de conexión. Verifica tu internet.', 'bot');
  }
}

function appendChatMsg(container, text, role) {
  const el = document.createElement('div');
  el.className = `cmsg ${role}`;
  el.innerHTML = `
    <div class="cmsg-avatar">${role === 'bot' ? 'VS' : '👤'}</div>
    <div class="cmsg-bubble">${text}</div>
  `;
  container.appendChild(el);
  container.scrollTop = container.scrollHeight;
}

document.getElementById('chatInput')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendChatMessage();
});

// ── SOLICITUD FORM ──
document.getElementById('solicitudForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const tipo = document.getElementById('tipoSituacion')?.value;
  const desc = document.getElementById('descripcion')?.value?.trim();
  const urgencia = document.querySelector('input[name="urgencia"]:checked')?.value;

  if (!tipo || !desc) return;

  const btn = document.getElementById('enviarBtn');
  const text = document.getElementById('enviarText');
  const spinner = document.getElementById('enviarSpinner');
  if (btn) btn.disabled = true;
  if (text) text.style.display = 'none';
  if (spinner) spinner.style.display = 'inline-block';

  try {
    const token = localStorage.getItem('vs_token');
    const res = await fetch(`${API_BASE}/solicitudes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ tipo, descripcion: desc, urgencia })
    });
    if (res.ok) {
      document.getElementById('successMsg').style.display = 'block';
      document.getElementById('solicitudForm').reset();
    }
  } catch {
    alert('Error al enviar. Intenta de nuevo.');
  } finally {
    if (btn) btn.disabled = false;
    if (text) text.style.display = 'inline';
    if (spinner) spinner.style.display = 'none';
  }
});
