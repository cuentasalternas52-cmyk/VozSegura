const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { authMiddleware } = require('../middleware/authMiddleware');

// POST /api/solicitudes — crear solicitud
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { tipo, descripcion, urgencia } = req.body;
    if (!tipo || !descripcion) return res.status(400).json({ message: 'Tipo y descripción son requeridos.' });
    await db.query(
      'INSERT INTO solicitudes (usuario_id, tipo, descripcion, urgencia) VALUES (?,?,?,?)',
      [req.user.id, tipo, descripcion, urgencia || 'media']
    );
    res.status(201).json({ message: 'Solicitud enviada correctamente.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al guardar la solicitud.' });
  }
});

// GET /api/solicitudes — listar solicitudes del usuario
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, tipo, descripcion, urgencia, estado, creado_en FROM solicitudes WHERE usuario_id = ? ORDER BY creado_en DESC',
      [req.user.id]
    );
    res.json({ solicitudes: rows });
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener solicitudes.' });
  }
});

module.exports = router;
