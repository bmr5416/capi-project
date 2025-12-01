import { Router } from 'express';
import { sheetsService } from '../services/sheets.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

// GET /api/progress/:clientId - Get all progress for a client
router.get('/:clientId', async (req, res, next) => {
  try {
    const progress = await sheetsService.getClientProgress(req.params.clientId);
    res.json({ progress });
  } catch (error) {
    next(error);
  }
});

// GET /api/progress/:clientId/:platform - Get progress for specific platform
router.get('/:clientId/:platform', async (req, res, next) => {
  try {
    const progress = await sheetsService.getPlatformProgress(
      req.params.clientId,
      req.params.platform
    );
    res.json({ progress });
  } catch (error) {
    next(error);
  }
});

// POST /api/progress/:clientId/:platform/:stepId - Mark step complete
router.post('/:clientId/:platform/:stepId', async (req, res, next) => {
  try {
    const { completedBy } = req.body;
    const { clientId, platform, stepId } = req.params;

    const result = await sheetsService.markStepComplete(
      clientId,
      platform,
      stepId,
      completedBy
    );

    res.json({ step: result });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/progress/:clientId/:platform/:stepId - Unmark step
router.delete('/:clientId/:platform/:stepId', async (req, res, next) => {
  try {
    const { clientId, platform, stepId } = req.params;

    const deleted = await sheetsService.unmarkStep(clientId, platform, stepId);
    if (!deleted) {
      throw new AppError('Step progress not found', 404);
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// Checklist Item Progress Endpoints
// ==========================================

// GET /api/progress/:clientId/:platform/:stepId/items - Get all checklist item progress for a step
router.get('/:clientId/:platform/:stepId/items', async (req, res, next) => {
  try {
    const { clientId, platform, stepId } = req.params;
    const items = await sheetsService.getChecklistProgress(
      clientId,
      platform,
      stepId
    );
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

// POST /api/progress/:clientId/:platform/:stepId/items/:itemIndex - Mark checklist item complete
router.post(
  '/:clientId/:platform/:stepId/items/:itemIndex',
  async (req, res, next) => {
    try {
      const { clientId, platform, stepId, itemIndex } = req.params;
      const { completedBy } = req.body;

      const result = await sheetsService.markChecklistItemComplete(
        clientId,
        platform,
        stepId,
        parseInt(itemIndex, 10),
        completedBy
      );

      res.json({ item: result });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/progress/:clientId/:platform/:stepId/items/:itemIndex - Unmark checklist item
router.delete(
  '/:clientId/:platform/:stepId/items/:itemIndex',
  async (req, res, next) => {
    try {
      const { clientId, platform, stepId, itemIndex } = req.params;

      const result = await sheetsService.unmarkChecklistItem(
        clientId,
        platform,
        stepId,
        parseInt(itemIndex, 10)
      );

      res.json({ success: true, item: result });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
