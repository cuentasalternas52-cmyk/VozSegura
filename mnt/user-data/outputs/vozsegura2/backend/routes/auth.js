// ===== AUTH ROUTES =====
const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../db/connection');

const JWT_EXPIRES = '7d';

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, rol: user.rol },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

// ── POST /api/auth/register ──
router.post('/register', async (req, res) => {
  try {
    const { nombre, apellido, email, password } = req.body;

    if (!nombre || !email || !password)
      return res.status(400).json({ message: 'Nombre, correo y contraseña son requeridos.' });

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ message: 'Correo electrónico no válido.' });

    if (password.length < 8)
      return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres.' });

    // Verificar si ya existe
    const [existing] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email.toLowerCase()]);
    if (existing.length > 0)
      return res.status(409).json({ message: 'Este correo ya está registrado. Intenta iniciar sesión.' });

    const password_hash = await bcrypt.hash(password, 12);

    const [result] = await db.query(
      'INSERT INTO usuarios (nombre, apellido, email, password_hash) VALUES (?, ?, ?, ?)',
      [nombre.trim(), apellido?.trim() || null, email.toLowerCase().trim(), password_hash]
    );

    const user = { id: result.insertId, nombre: nombre.trim(), email: email.toLowerCase(), rol: 'usuario' };
    const token = generateToken(user);

    res.status(201).json({ message: 'Cuenta creada exitosamente.', token, user });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Error interno del servidor. Intenta de nuevo.' });
  }
});

// ── POST /api/auth/login ──
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Correo y contraseña son requeridos.' });

    const [rows] = await db.query(
      'SELECT id, nombre, apellido, email, password_hash, rol, activo FROM usuarios WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (rows.length === 0)
      return res.status(401).json({ message: 'Correo o contraseña incorrectos.' });

    const usuario = rows[0];

    if (!usuario.activo)
      return res.status(403).json({ message: 'Tu cuenta ha sido desactivada. Contacta soporte.' });

    const validPassword = await bcrypt.compare(password, usuario.password_hash);
    if (!validPassword)
      return res.status(401).json({ message: 'Correo o contraseña incorrectos.' });

    const user = { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol };
    const token = generateToken(user);

    res.json({ message: 'Sesión iniciada.', token, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Error interno del servidor. Intenta de nuevo.' });
  }
});

// ── GET /api/auth/me ── (verificar sesión activa)
router.get('/me', require('../middleware/authMiddleware').authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, nombre, apellido, email, rol, creado_en FROM usuarios WHERE id = ?',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Usuario no encontrado.' });
    res.json({ user: rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener perfil.' });
  }
});

module.exports = router;
