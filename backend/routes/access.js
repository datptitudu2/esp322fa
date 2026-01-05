import express from 'express';
import { getAccessLogs, readDB } from '../services/database.js';

const router = express.Router();

// Get access logs
router.get('/logs', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const logs = getAccessLogs(limit);

    // Enrich logs with card info
    const db = readDB();
    const enrichedLogs = logs.map(log => {
      const card = db.cards.find(c => c.id === log.cardId);
      return {
        ...log,
        owner: card ? card.owner : 'Unknown',
        email: card ? card.email : ''
      };
    });

    // Log for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[GET /api/access/logs] Returning ${enrichedLogs.length} logs`);
    }

    res.json({
      success: true,
      logs: enrichedLogs,
      total: enrichedLogs.length
    });
  } catch (error) {
    console.error('Error getting access logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get cards list
router.get('/cards', (req, res) => {
  try {
    const db = readDB();
    const cards = db.cards.map(card => ({
      id: card.id,
      uid: card.uid,
      owner: card.owner,
      email: card.email,
      status: card.status,
      createdAt: card.createdAt
    }));

    res.json({
      success: true,
      cards
    });
  } catch (error) {
    console.error('Error getting cards:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

