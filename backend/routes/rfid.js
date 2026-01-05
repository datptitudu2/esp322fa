import express from 'express';
import { getCardByUID } from '../services/database.js';

const router = express.Router();

// Validate RFID card
router.post('/validate', (req, res) => {
  try {
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({ error: 'UID is required' });
    }

    const card = getCardByUID(uid);

    if (!card) {
      return res.status(404).json({ 
        success: false, 
        message: 'Card not found or inactive' 
      });
    }

    res.json({
      success: true,
      card: {
        id: card.id,
        uid: card.uid,
        owner: card.owner,
        email: card.email
      }
    });
  } catch (error) {
    console.error('Error validating RFID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

