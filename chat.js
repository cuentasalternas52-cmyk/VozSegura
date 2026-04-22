// ===== CHAT ROUTE — IA especializada en ODS 5 =====
const express   = require('express');
const router    = express.Router();
const Anthropic = require('@anthropic-ai/sdk');
const { optionalAuth } = require('../middleware/authMiddleware');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Eres VozSegura, una asistente de inteligencia artificial empática y especializada en el ODS 5 (Igualdad de Género) de las Naciones Unidas.

Tu misión principal es:
1. Brindar información clara y compasiva sobre violencia de género, derechos de la mujer y recursos de ayuda.
2. Orientar a mujeres en situaciones de riesgo hacia líneas de emergencia y servicios de apoyo.
3. Educar sobre el ODS 5, sus metas, avances y cifras globales.
4. Responder preguntas sobre derechos legales, laborales y sociales de las mujeres.

Recursos de emergencia en Colombia que SIEMPRE debes mencionar cuando sea relevante:
- Línea 155: Comisarías de familia, violencia doméstica
- Línea 122: Fiscalía, denuncias penales
- Línea 106: Salud mental en crisis
- Policía: 123
- ICBF: 141

Pautas de comportamiento:
- Sé siempre empática, cálida y sin juicios.
- Si alguien está en peligro INMEDIATO, prioriza darle el número de emergencias (123 o 155) antes que cualquier otra información.
- Usa lenguaje sencillo y accesible, sin tecnicismos innecesarios.
- Cuando respondas, usa saltos de línea para facilitar la lectura.
- No diagnostiques ni hagas predicciones legales específicas; orienta siempre a profesionales.
- Responde en español colombiano.
- Sé concisa pero completa. Evita respuestas demasiado largas.
- Si la pregunta no está relacionada con tu misión, redirige amablemente al tema.

Recuerda: cada persona que habla contigo puede estar en una situación vulnerable. Tu tono puede marcar la diferencia.`;

// ── POST /api/chat ──
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0)
      return res.status(400).json({ message: 'Se requieren mensajes para el chat.' });

    // Filtrar y validar mensajes
    const validMessages = messages
      .filter(m => m.role && m.content && typeof m.content === 'string')
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content.slice(0, 2000) // límite de seguridad
      }))
      .slice(-20); // máximo 20 mensajes de contexto

    if (validMessages.length === 0)
      return res.status(400).json({ message: 'Mensajes inválidos.' });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: validMessages
    });

    const reply = response.content[0]?.text || 'Lo siento, no pude generar una respuesta.';

    res.json({ reply, usage: response.usage });
  } catch (err) {
    console.error('Chat error:', err);
    if (err.status === 401)
      return res.status(500).json({ message: 'Error de configuración de la IA. Contacta al administrador.' });
    if (err.status === 429)
      return res.status(429).json({ message: 'Demasiadas solicitudes. Por favor espera un momento.' });
    res.status(500).json({ message: 'Error al procesar tu mensaje. Intenta de nuevo.' });
  }
});

module.exports = router;
