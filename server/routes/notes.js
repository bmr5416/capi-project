import express from 'express';
import { sheetsService } from '../services/sheets.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * GET /api/notes/:clientId/:platform/:stepId
 * Get notes for a step or specific checklist item
 * Query: ?itemIndex (optional) - if provided, gets item-level note
 */
router.get('/:clientId/:platform/:stepId', async (req, res, next) => {
  try {
    const { clientId, platform, stepId } = req.params;
    const itemIndex =
      req.query.itemIndex !== undefined
        ? parseInt(req.query.itemIndex, 10)
        : null;

    const notes = await sheetsService.getNotes(clientId, platform, stepId, itemIndex);
    res.json(notes);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/notes/:clientId/:platform/:stepId
 * Save or update a note for a step or checklist item
 * Body: { note, itemIndex?, updatedBy? }
 */
router.post('/:clientId/:platform/:stepId', async (req, res, next) => {
  try {
    const { clientId, platform, stepId } = req.params;
    const { note, itemIndex, updatedBy } = req.body;

    if (note === undefined) {
      throw new AppError('Note content is required', 400);
    }

    const result = await sheetsService.saveNote(
      clientId,
      platform,
      stepId,
      note,
      itemIndex !== undefined ? parseInt(itemIndex, 10) : null,
      updatedBy
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/notes/:clientId/:platform/:stepId
 * Delete a note for a step or checklist item
 * Query: ?itemIndex (optional) - if provided, deletes item-level note
 */
router.delete('/:clientId/:platform/:stepId', async (req, res, next) => {
  try {
    const { clientId, platform, stepId } = req.params;
    const itemIndex =
      req.query.itemIndex !== undefined
        ? parseInt(req.query.itemIndex, 10)
        : null;

    // Save empty note to effectively delete
    await sheetsService.saveNote(clientId, platform, stepId, '', itemIndex, null);

    res.json({ success: true, deleted: true });
  } catch (error) {
    next(error);
  }
});

export default router;
