import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { sheetsService } from '../services/sheets.js';
import { AppError } from '../middleware/errorHandler.js';

const router = Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateClientData(data, isUpdate = false) {
  const errors = [];
  const name = data.name?.trim();
  const email = data.email?.trim();

  if (!isUpdate || data.name !== undefined) {
    if (!name) {
      errors.push('Client name is required');
    } else if (name.length < 2) {
      errors.push('Client name must be at least 2 characters');
    } else if (name.length > 100) {
      errors.push('Client name must be less than 100 characters');
    }
  }

  if (!isUpdate || data.email !== undefined) {
    if (!email) {
      errors.push('Email is required');
    } else if (!EMAIL_REGEX.test(email)) {
      errors.push('Invalid email format');
    }
  }

  if (data.notes && data.notes.length > 1000) {
    errors.push('Notes must be less than 1000 characters');
  }

  return errors;
}

// GET /api/clients - List all clients
router.get('/', async (_req, res, next) => {
  try {
    // Fetch clients and platform counts in parallel (optimized from N+1)
    const [clients, platformCounts] = await Promise.all([
      sheetsService.getClients(),
      sheetsService.getAllClientPlatformCounts(),
    ]);

    // Enrich clients with platform counts from batch result
    const enrichedClients = clients.map((client) => {
      const counts = platformCounts[client.id] || { total: 0, completed: 0 };
      return {
        ...client,
        platformCount: counts.total,
        completedPlatforms: counts.completed,
      };
    });

    res.json({ clients: enrichedClients });
  } catch (error) {
    next(error);
  }
});

// GET /api/clients/:id - Get single client with full details
router.get('/:id', async (req, res, next) => {
  try {
    const client = await sheetsService.getClient(req.params.id);
    if (!client) {
      throw new AppError('Client not found', 404);
    }
    res.json({ client });
  } catch (error) {
    next(error);
  }
});

// POST /api/clients - Create new client
router.post('/', async (req, res, next) => {
  try {
    const { name, email, notes } = req.body;

    const validationErrors = validateClientData({ name, email, notes });
    if (validationErrors.length > 0) {
      throw new AppError(validationErrors.join(', '), 400);
    }

    const client = await sheetsService.createClient({
      id: uuidv4(),
      name: name.trim(),
      email: email.trim(),
      notes: notes?.trim() || '',
    });

    res.status(201).json({ client });
  } catch (error) {
    next(error);
  }
});

// PUT /api/clients/:id - Update client
router.put('/:id', async (req, res, next) => {
  try {
    const { name, email, status, notes } = req.body;

    const validationErrors = validateClientData({ name, email, notes }, true);
    if (validationErrors.length > 0) {
      throw new AppError(validationErrors.join(', '), 400);
    }

    const client = await sheetsService.updateClient(req.params.id, {
      name: name?.trim(),
      email: email?.trim(),
      status,
      notes: notes?.trim(),
    });

    if (!client) {
      throw new AppError('Client not found', 404);
    }

    res.json({ client });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/clients/:id - Delete client
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await sheetsService.deleteClient(req.params.id);
    if (!deleted) {
      throw new AppError('Client not found', 404);
    }
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// POST /api/clients/:id/platforms - Add platform to client
router.post('/:id/platforms', async (req, res, next) => {
  try {
    const { platform } = req.body;

    if (!platform) {
      throw new AppError('Platform is required', 400);
    }

    const result = await sheetsService.addPlatformToClient(req.params.id, platform);
    res.status(201).json({ platform: result });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/clients/:id/platforms/:platform - Remove platform from client
router.delete('/:id/platforms/:platform', async (req, res, next) => {
  try {
    const deleted = await sheetsService.removePlatformFromClient(
      req.params.id,
      req.params.platform
    );
    if (!deleted) {
      throw new AppError('Platform not found', 404);
    }
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
