// ===== VOZSEGURA AUTH JS =====
const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api'
  : '/api';

// Redirect if already logged in
if (localStorage.getItem('vs_token')) {
  window.location.href = 'dashboard.html';
}

function showAlert(msg, type = 'error') {
  const el = document.getElementById('authAlert');
  if (!el) return;
  el.textContent = msg;
  el.className = `auth-alert ${type}`;
  el.style.display = 'block';
}

function clearErrors() {
  document.querySelectorAll('.ferr').forEach(e => e.textContent = '');
  const al = document.getElementById('authAlert');
  if (al) al.style.display = 'none';
}

function fieldErr(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}

function setLoading(id, textId, spinnerId, loading) {
  const btn = document.getElementById(id);
  const txt = document.getElementById(textId);
  const spin = document.getElementById(spinnerId);
  if (btn) btn.disabled = loading;
  if (txt) txt.style.display = loading ? 'none' : 'inline';
  if (spin) spin.style.display = loading ? 'inline-block' : 'none';
}

// Toggle password visibility
document.querySelectorAll('.eye-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = btn.closest('.field-icon-wrap').querySelector('input');
    input.type = input.type === 'password' ? 'text' : 'password';
  });
});

// ── LOGIN ──
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  let ok = true;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErr('emailError', 'Ingresa un correo válido'); ok = false;
  }
  if (!password) { fieldErr('passError', 'La contraseña es requerida'); ok = false; }
  if (!ok) return;

  setLoading('loginBtn', 'loginText', 'loginSpinner', true);
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok && data.token) {
      localStorage.setItem('vs_token', data.token);
      localStorage.setItem('vs_user', JSON.stringify(data.user));
      window.location.href = 'dashboard.html';
    } else {
      showAlert(data.message || 'Correo o contraseña incorrectos.');
    }
  } catch {
    showAlert('Error de conexión. Intenta de nuevo.');
  } finally {
    setLoading('loginBtn', 'loginText', 'loginSpinner', false);
  }
});

// ── REGISTER ──
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors();
  const nombre = document.getElementById('nombre')?.value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirm = document.getElementById('confirmPassword')?.value;
  let ok = true;

  if (!nombre) { fieldErr('nombreError', 'El nombre es requerido'); ok = false; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErr('emailError', 'Ingresa un correo válido'); ok = false;
  }
  if (!password || password.length < 8) {
    fieldErr('passError', 'Mínimo 8 caracteres'); ok = false;
  }
  if (password !== confirm) { fieldErr('confirmError', 'Las contraseñas no coinciden'); ok = false; }
  if (!ok) return;

  setLoading('registerBtn', 'registerText', 'registerSpinner', true);
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password })
    });
    const data = await res.json();
    if (res.ok && data.token) {
      localStorage.setItem('vs_token', data.token);
      localStorage.setItem('vs_user', JSON.stringify(data.user));
      window.location.href = 'dashboard.html';
    } else {
      showAlert(data.message || 'Error al crear la cuenta.');
    }
  } catch {
    showAlert('Error de conexión. Intenta de nuevo.');
  } finally {
    setLoading('registerBtn', 'registerText', 'registerSpinner', false);
  }
});
