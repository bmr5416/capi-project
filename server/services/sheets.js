import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const SHEET_NAMES = {
  CLIENTS: 'Clients',
  CLIENT_PLATFORMS: 'ClientPlatforms',
  STEP_PROGRESS: 'StepProgress',
  CHECKLIST_PROGRESS: 'ChecklistProgress',
  CHECKLIST_CONTENT: 'ChecklistContent',
  NOTES: 'Notes',
};

// Helper: Find a row matching client/platform/step criteria
function findRowByStepCriteria(rows, clientId, platform, stepId) {
  return rows.find(
    (r) =>
      r.get('client_id') === clientId &&
      r.get('platform') === platform &&
      r.get('step_id') === stepId
  );
}

// Helper: Find a row matching client/platform/step/itemIndex criteria
function findRowByItemCriteria(rows, clientId, platform, stepId, itemIndex) {
  return rows.find(
    (r) =>
      r.get('client_id') === clientId &&
      r.get('platform') === platform &&
      r.get('step_id') === stepId &&
      parseInt(r.get('item_index'), 10) === itemIndex
  );
}

// Helper: Filter rows by client/platform/step criteria
function filterRowsByStepCriteria(rows, clientId, platform, stepId) {
  return rows.filter(
    (r) =>
      r.get('client_id') === clientId &&
      r.get('platform') === platform &&
      r.get('step_id') === stepId
  );
}

// Helper: Match note row by item index (null for step-level notes)
function matchesNoteItemIndex(row, itemIndex) {
  const rowItemIndex = row.get('item_index');
  if (itemIndex !== null) {
    return rowItemIndex !== '' && parseInt(rowItemIndex, 10) === itemIndex;
  }
  return rowItemIndex === '' || rowItemIndex === null;
}

// Helper: Find a note row by criteria
function findNoteRow(rows, clientId, platform, stepId, itemIndex) {
  return rows.find((r) => {
    const matches =
      r.get('client_id') === clientId &&
      r.get('platform') === platform &&
      r.get('step_id') === stepId;
    return matches && matchesNoteItemIndex(r, itemIndex);
  });
}

// Helper: Filter note rows by criteria
function filterNoteRows(rows, clientId, platform, stepId, itemIndex) {
  return rows.filter((r) => {
    const matches =
      r.get('client_id') === clientId &&
      r.get('platform') === platform &&
      r.get('step_id') === stepId;
    return matches && matchesNoteItemIndex(r, itemIndex);
  });
}

class SheetsService {
  constructor() {
    this.doc = null;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!serviceAccountEmail || !privateKey || !sheetId) {
      console.warn('Google Sheets credentials not configured - using mock data');
      this.useMockData = true;
      this.initialized = true;
      return;
    }

    // Handle private key formatting from environment variables
    // Remove surrounding quotes if present
    privateKey = privateKey.replace(/^["']|["']$/g, '');
    // Replace literal \n with actual newlines
    privateKey = privateKey.replace(/\\n/g, '\n');

    try {
      const auth = new JWT({
        email: serviceAccountEmail,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      this.doc = new GoogleSpreadsheet(sheetId, auth);
      await this.doc.loadInfo();
      this.initialized = true;
    } catch (error) {
      console.error('Google Sheets initialization failed:', error.message);
      console.error('Service account email:', serviceAccountEmail);
      console.error('Sheet ID:', sheetId);
      console.error('Private key starts with:', privateKey?.substring(0, 50));
      throw new Error(`Google Sheets connection failed: ${error.message}`);
    }
  }

  async getSheet(name) {
    await this.init();
    if (this.useMockData) return null;
    return this.doc.sheetsByTitle[name];
  }

  // Client operations
  async getClients() {
    await this.init();
    if (this.useMockData) return this.getMockClients();

    const sheet = await this.getSheet(SHEET_NAMES.CLIENTS);
    const rows = await sheet.getRows();
    return rows.map((row) => ({
      id: row.get('client_id'),
      name: row.get('client_name'),
      email: row.get('contact_email'),
      createdAt: row.get('created_at'),
      status: row.get('status'),
      notes: row.get('notes'),
    }));
  }

  async getClient(clientId) {
    await this.init();
    if (this.useMockData) return this.getMockClient(clientId);

    const sheet = await this.getSheet(SHEET_NAMES.CLIENTS);
    const rows = await sheet.getRows();
    const row = rows.find((r) => r.get('client_id') === clientId);
    if (!row) return null;

    const platforms = await this.getClientPlatforms(clientId);
    const progress = await this.getClientProgress(clientId);

    return {
      id: row.get('client_id'),
      name: row.get('client_name'),
      email: row.get('contact_email'),
      createdAt: row.get('created_at'),
      status: row.get('status'),
      notes: row.get('notes'),
      platforms,
      progress,
    };
  }

  async createClient(data) {
    await this.init();
    if (this.useMockData) return this.createMockClient(data);

    const sheet = await this.getSheet(SHEET_NAMES.CLIENTS);
    const newRow = await sheet.addRow({
      client_id: data.id,
      client_name: data.name,
      contact_email: data.email,
      created_at: new Date().toISOString(),
      status: 'not_started',
      notes: data.notes || '',
    });

    return {
      id: newRow.get('client_id'),
      name: newRow.get('client_name'),
      email: newRow.get('contact_email'),
      createdAt: newRow.get('created_at'),
      status: newRow.get('status'),
      notes: newRow.get('notes'),
    };
  }

  async updateClient(clientId, data) {
    await this.init();
    if (this.useMockData) return this.updateMockClient(clientId, data);

    const sheet = await this.getSheet(SHEET_NAMES.CLIENTS);
    const rows = await sheet.getRows();
    const row = rows.find((r) => r.get('client_id') === clientId);
    if (!row) return null;

    if (data.name) row.set('client_name', data.name);
    if (data.email) row.set('contact_email', data.email);
    if (data.status) row.set('status', data.status);
    if (data.notes !== undefined) row.set('notes', data.notes);

    await row.save();

    return {
      id: row.get('client_id'),
      name: row.get('client_name'),
      email: row.get('contact_email'),
      createdAt: row.get('created_at'),
      status: row.get('status'),
      notes: row.get('notes'),
    };
  }

  async deleteClient(clientId) {
    await this.init();
    if (this.useMockData) return this.deleteMockClient(clientId);

    const sheet = await this.getSheet(SHEET_NAMES.CLIENTS);
    const rows = await sheet.getRows();
    const row = rows.find((r) => r.get('client_id') === clientId);
    if (!row) return false;

    await row.delete();
    return true;
  }

  // Platform operations
  async getClientPlatforms(clientId) {
    await this.init();
    if (this.useMockData) return this.getMockPlatforms(clientId);

    const sheet = await this.getSheet(SHEET_NAMES.CLIENT_PLATFORMS);
    const rows = await sheet.getRows();
    return rows
      .filter((r) => r.get('client_id') === clientId)
      .map((row) => ({
        id: row.get('id'),
        platform: row.get('platform'),
        status: row.get('status'),
        startedAt: row.get('started_at'),
        completedAt: row.get('completed_at'),
      }));
  }

  // Batch fetch platform counts for all clients (optimizes N+1 query)
  async getAllClientPlatformCounts() {
    await this.init();
    if (this.useMockData) return this.getMockAllPlatformCounts();

    const sheet = await this.getSheet(SHEET_NAMES.CLIENT_PLATFORMS);
    const rows = await sheet.getRows();

    // Group platforms by client_id and count
    const counts = {};
    for (const row of rows) {
      const clientId = row.get('client_id');
      if (!counts[clientId]) {
        counts[clientId] = { total: 0, completed: 0 };
      }
      counts[clientId].total++;
      if (row.get('status') === 'completed') {
        counts[clientId].completed++;
      }
    }
    return counts;
  }

  getMockAllPlatformCounts() {
    // Return mock platform counts for demo data
    return {
      'demo-client-1': { total: 2, completed: 1 },
      'demo-client-2': { total: 1, completed: 0 },
    };
  }

  async addPlatformToClient(clientId, platform) {
    await this.init();
    if (this.useMockData) return this.addMockPlatform(clientId, platform);

    const sheet = await this.getSheet(SHEET_NAMES.CLIENT_PLATFORMS);
    const { v4: uuidv4 } = await import('uuid');
    const newRow = await sheet.addRow({
      id: uuidv4(),
      client_id: clientId,
      platform,
      status: 'not_started',
      started_at: new Date().toISOString(),
      completed_at: '',
    });

    return {
      id: newRow.get('id'),
      platform: newRow.get('platform'),
      status: newRow.get('status'),
      startedAt: newRow.get('started_at'),
    };
  }

  async removePlatformFromClient(clientId, platform) {
    await this.init();
    if (this.useMockData) return true;

    const sheet = await this.getSheet(SHEET_NAMES.CLIENT_PLATFORMS);
    const rows = await sheet.getRows();
    const row = rows.find(
      (r) => r.get('client_id') === clientId && r.get('platform') === platform
    );
    if (!row) return false;

    await row.delete();
    return true;
  }

  // Progress operations
  async getClientProgress(clientId) {
    await this.init();
    if (this.useMockData) return this.getMockProgress(clientId);

    const sheet = await this.getSheet(SHEET_NAMES.STEP_PROGRESS);
    const rows = await sheet.getRows();
    return rows
      .filter((r) => r.get('client_id') === clientId)
      .map((row) => ({
        id: row.get('id'),
        platform: row.get('platform'),
        stepId: row.get('step_id'),
        status: row.get('status'),
        completedAt: row.get('completed_at'),
        completedBy: row.get('completed_by'),
      }));
  }

  async getPlatformProgress(clientId, platform) {
    await this.init();
    if (this.useMockData) return this.getMockPlatformProgress(clientId, platform);

    const sheet = await this.getSheet(SHEET_NAMES.STEP_PROGRESS);
    const rows = await sheet.getRows();
    return rows
      .filter((r) => r.get('client_id') === clientId && r.get('platform') === platform)
      .map((row) => ({
        id: row.get('id'),
        stepId: row.get('step_id'),
        status: row.get('status'),
        completedAt: row.get('completed_at'),
        completedBy: row.get('completed_by'),
      }));
  }

  async markStepComplete(clientId, platform, stepId, completedBy) {
    await this.init();
    if (this.useMockData) return this.markMockStepComplete(clientId, platform, stepId);

    const sheet = await this.getSheet(SHEET_NAMES.STEP_PROGRESS);
    const rows = await sheet.getRows();
    const existingRow = findRowByStepCriteria(rows, clientId, platform, stepId);

    let result;
    if (existingRow) {
      existingRow.set('status', 'completed');
      existingRow.set('completed_at', new Date().toISOString());
      existingRow.set('completed_by', completedBy || '');
      await existingRow.save();
      result = {
        stepId,
        status: 'completed',
        completedAt: existingRow.get('completed_at'),
      };
    } else {
      const { v4: uuidv4 } = await import('uuid');
      const newRow = await sheet.addRow({
        id: uuidv4(),
        client_id: clientId,
        platform,
        step_id: stepId,
        status: 'completed',
        completed_at: new Date().toISOString(),
        completed_by: completedBy || '',
      });

      result = {
        stepId,
        status: 'completed',
        completedAt: newRow.get('completed_at'),
      };
    }

    // Update parent statuses to "in_progress" if currently "not_started"
    await this.updateParentStatuses(clientId, platform);

    return result;
  }

  // Update ClientPlatforms and Clients status when progress is made
  async updateParentStatuses(clientId, platform) {
    // Update ClientPlatforms status
    const platformsSheet = await this.getSheet(SHEET_NAMES.CLIENT_PLATFORMS);
    const platformRows = await platformsSheet.getRows();

    // For "core" steps, update ALL of the client's platforms to "in_progress"
    // since core steps (like prerequisites) apply to all platforms
    if (platform === 'core') {
      const clientPlatforms = platformRows.filter(
        (r) => r.get('client_id') === clientId && r.get('status') === 'not_started'
      );
      for (const row of clientPlatforms) {
        row.set('status', 'in_progress');
        await row.save();
      }
    } else {
      // For platform-specific steps, only update that platform
      const platformRow = platformRows.find(
        (r) => r.get('client_id') === clientId && r.get('platform') === platform
      );
      if (platformRow && platformRow.get('status') === 'not_started') {
        platformRow.set('status', 'in_progress');
        await platformRow.save();
      }
    }

    // Update Clients status
    const clientsSheet = await this.getSheet(SHEET_NAMES.CLIENTS);
    const clientRows = await clientsSheet.getRows();
    const clientRow = clientRows.find((r) => r.get('client_id') === clientId);
    if (clientRow && clientRow.get('status') === 'not_started') {
      clientRow.set('status', 'in_progress');
      await clientRow.save();
    }
  }

  async unmarkStep(clientId, platform, stepId) {
    await this.init();
    if (this.useMockData) return true;

    const sheet = await this.getSheet(SHEET_NAMES.STEP_PROGRESS);
    const rows = await sheet.getRows();
    const row = findRowByStepCriteria(rows, clientId, platform, stepId);

    if (!row) return false;
    await row.delete();
    return true;
  }

  // Checklist Item Progress operations
  async getChecklistProgress(clientId, platform, stepId) {
    await this.init();
    if (this.useMockData) return this.getMockChecklistProgress(clientId, platform, stepId);

    const sheet = await this.getSheet(SHEET_NAMES.CHECKLIST_PROGRESS);
    if (!sheet) return [];

    const rows = await sheet.getRows();
    return filterRowsByStepCriteria(rows, clientId, platform, stepId).map((row) => ({
      itemIndex: parseInt(row.get('item_index'), 10),
      status: row.get('status'),
      completedAt: row.get('completed_at'),
      completedBy: row.get('completed_by'),
    }));
  }

  async markChecklistItemComplete(clientId, platform, stepId, itemIndex, completedBy) {
    await this.init();
    if (this.useMockData)
      return this.markMockChecklistItemComplete(clientId, platform, stepId, itemIndex, completedBy);

    const sheet = await this.getSheet(SHEET_NAMES.CHECKLIST_PROGRESS);
    if (!sheet) return { itemIndex, status: 'completed', completedAt: new Date().toISOString() };

    const rows = await sheet.getRows();
    const existingRow = findRowByItemCriteria(rows, clientId, platform, stepId, itemIndex);

    if (existingRow) {
      existingRow.set('status', 'completed');
      existingRow.set('completed_at', new Date().toISOString());
      existingRow.set('completed_by', completedBy || '');
      await existingRow.save();
      return {
        itemIndex,
        status: 'completed',
        completedAt: existingRow.get('completed_at'),
      };
    }

    const { v4: uuidv4 } = await import('uuid');
    const newRow = await sheet.addRow({
      id: uuidv4(),
      client_id: clientId,
      platform,
      step_id: stepId,
      item_index: itemIndex,
      status: 'completed',
      completed_at: new Date().toISOString(),
      completed_by: completedBy || '',
    });

    return {
      itemIndex,
      status: 'completed',
      completedAt: newRow.get('completed_at'),
    };
  }

  async unmarkChecklistItem(clientId, platform, stepId, itemIndex) {
    await this.init();
    if (this.useMockData)
      return this.unmarkMockChecklistItem(clientId, platform, stepId, itemIndex);

    const sheet = await this.getSheet(SHEET_NAMES.CHECKLIST_PROGRESS);
    if (!sheet) return true;

    const rows = await sheet.getRows();
    const row = findRowByItemCriteria(rows, clientId, platform, stepId, itemIndex);

    if (!row) return false;
    await row.delete();
    return true;
  }

  // Notes operations
  async getNotes(clientId, platform, stepId, itemIndex = null) {
    await this.init();
    if (this.useMockData) return this.getMockNotes(clientId, platform, stepId, itemIndex);

    const sheet = await this.getSheet(SHEET_NAMES.NOTES);
    if (!sheet) return [];

    const rows = await sheet.getRows();
    return filterNoteRows(rows, clientId, platform, stepId, itemIndex).map((row) => ({
      id: row.get('id'),
      itemIndex: row.get('item_index') ? parseInt(row.get('item_index'), 10) : null,
      note: row.get('note'),
      updatedAt: row.get('updated_at'),
      updatedBy: row.get('updated_by'),
    }));
  }

  async saveNote(clientId, platform, stepId, note, itemIndex = null, updatedBy = '') {
    await this.init();
    if (this.useMockData)
      return this.saveMockNote(clientId, platform, stepId, note, itemIndex, updatedBy);

    const sheet = await this.getSheet(SHEET_NAMES.NOTES);
    if (!sheet)
      return {
        itemIndex,
        note,
        updatedAt: new Date().toISOString(),
      };

    const rows = await sheet.getRows();
    const existingRow = findNoteRow(rows, clientId, platform, stepId, itemIndex);

    if (existingRow) {
      existingRow.set('note', note);
      existingRow.set('updated_at', new Date().toISOString());
      existingRow.set('updated_by', updatedBy);
      await existingRow.save();
      return {
        itemIndex,
        note,
        updatedAt: existingRow.get('updated_at'),
      };
    }

    const { v4: uuidv4 } = await import('uuid');
    const newRow = await sheet.addRow({
      id: uuidv4(),
      client_id: clientId,
      platform,
      step_id: stepId,
      item_index: itemIndex !== null ? itemIndex : '',
      note,
      updated_at: new Date().toISOString(),
      updated_by: updatedBy,
    });

    return {
      itemIndex,
      note,
      updatedAt: newRow.get('updated_at'),
    };
  }

  async deleteNote(clientId, platform, stepId, itemIndex = null) {
    await this.init();
    if (this.useMockData) return true;

    const sheet = await this.getSheet(SHEET_NAMES.NOTES);
    if (!sheet) return true;

    const rows = await sheet.getRows();
    const row = findNoteRow(rows, clientId, platform, stepId, itemIndex);

    if (!row) return false;
    await row.delete();
    return true;
  }

  // Checklist Content operations
  async getChecklistContent(stepId) {
    await this.init();
    if (this.useMockData) return this.getMockChecklistContent(stepId);

    const sheet = await this.getSheet(SHEET_NAMES.CHECKLIST_CONTENT);
    if (!sheet) return [];

    const rows = await sheet.getRows();
    return rows
      .filter((r) => r.get('step_id') === stepId)
      .map((row) => {
        let links = [];
        const linksData = row.get('links');
        if (linksData) {
          try {
            links = JSON.parse(linksData);
          } catch {
            // If JSON parsing fails, return empty array
            console.error(`Invalid JSON in links for step ${stepId}:`, linksData);
          }
        }
        return {
          itemIndex: parseInt(row.get('item_index'), 10),
          title: row.get('title'),
          instruction: row.get('instruction'),
          links,
        };
      })
      .sort((a, b) => a.itemIndex - b.itemIndex);
  }

  // Mock data methods for development without Google Sheets
  mockClients = [
    {
      id: 'mock-client-1',
      name: 'Acme Corporation',
      email: 'contact@acme.com',
      createdAt: '2024-01-15T10:00:00Z',
      status: 'in_progress',
      notes: 'Large enterprise client',
    },
    {
      id: 'mock-client-2',
      name: 'TechStart Inc',
      email: 'hello@techstart.io',
      createdAt: '2024-02-01T14:30:00Z',
      status: 'completed',
      notes: 'Completed Snowflake integration',
    },
    {
      id: 'mock-client-3',
      name: 'Global Retail',
      email: 'digital@globalretail.com',
      createdAt: '2024-02-20T09:15:00Z',
      status: 'not_started',
      notes: '',
    },
  ];

  mockPlatforms = {
    'mock-client-1': [
      { id: 'mp-1', platform: 'snowflake', status: 'in_progress', startedAt: '2024-01-20T10:00:00Z' },
      { id: 'mp-2', platform: 'salesforce', status: 'not_started', startedAt: '2024-01-25T10:00:00Z' },
    ],
    'mock-client-2': [
      { id: 'mp-3', platform: 'snowflake', status: 'completed', startedAt: '2024-02-01T10:00:00Z', completedAt: '2024-02-15T10:00:00Z' },
    ],
  };

  mockProgress = {
    'mock-client-1': [
      { id: 'prog-1', platform: 'core', stepId: 'core.business_manager', status: 'completed', completedAt: '2024-01-20T11:00:00Z' },
      { id: 'prog-2', platform: 'core', stepId: 'core.pixel_id', status: 'completed', completedAt: '2024-01-20T12:00:00Z' },
      { id: 'prog-3', platform: 'snowflake', stepId: 'snowflake.connection', status: 'completed', completedAt: '2024-01-21T10:00:00Z' },
    ],
  };

  getMockClients() {
    return this.mockClients;
  }

  getMockClient(clientId) {
    const client = this.mockClients.find((c) => c.id === clientId);
    if (!client) return null;
    return {
      ...client,
      platforms: this.getMockPlatforms(clientId),
      progress: this.getMockProgress(clientId),
    };
  }

  createMockClient(data) {
    const newClient = {
      id: data.id,
      name: data.name,
      email: data.email,
      createdAt: new Date().toISOString(),
      status: 'not_started',
      notes: data.notes || '',
    };
    this.mockClients.push(newClient);
    return newClient;
  }

  updateMockClient(clientId, data) {
    const client = this.mockClients.find((c) => c.id === clientId);
    if (!client) return null;
    Object.assign(client, data);
    return client;
  }

  deleteMockClient(clientId) {
    const index = this.mockClients.findIndex((c) => c.id === clientId);
    if (index === -1) return false;
    this.mockClients.splice(index, 1);
    return true;
  }

  getMockPlatforms(clientId) {
    return this.mockPlatforms[clientId] || [];
  }

  addMockPlatform(clientId, platform) {
    const { v4: uuidv4 } = { v4: () => `mock-${Date.now()}` };
    const newPlatform = {
      id: uuidv4(),
      platform,
      status: 'not_started',
      startedAt: new Date().toISOString(),
    };
    if (!this.mockPlatforms[clientId]) {
      this.mockPlatforms[clientId] = [];
    }
    this.mockPlatforms[clientId].push(newPlatform);
    return newPlatform;
  }

  getMockProgress(clientId) {
    return this.mockProgress[clientId] || [];
  }

  getMockPlatformProgress(clientId, platform) {
    const progress = this.getMockProgress(clientId);
    return progress.filter((p) => p.platform === platform);
  }

  markMockStepComplete(clientId, platform, stepId) {
    if (!this.mockProgress[clientId]) {
      this.mockProgress[clientId] = [];
    }
    const existing = this.mockProgress[clientId].find(
      (p) => p.platform === platform && p.stepId === stepId
    );
    if (existing) {
      existing.status = 'completed';
      existing.completedAt = new Date().toISOString();
      return existing;
    }
    const newProgress = {
      id: `prog-${Date.now()}`,
      platform,
      stepId,
      status: 'completed',
      completedAt: new Date().toISOString(),
    };
    this.mockProgress[clientId].push(newProgress);
    return newProgress;
  }

  // Mock data for checklist progress
  mockChecklistProgress = {};

  getMockChecklistProgress(clientId, platform, stepId) {
    const key = `${clientId}:${platform}:${stepId}`;
    return this.mockChecklistProgress[key] || [];
  }

  markMockChecklistItemComplete(clientId, platform, stepId, itemIndex, completedBy) {
    const key = `${clientId}:${platform}:${stepId}`;
    if (!this.mockChecklistProgress[key]) {
      this.mockChecklistProgress[key] = [];
    }
    const existing = this.mockChecklistProgress[key].find((p) => p.itemIndex === itemIndex);
    if (existing) {
      existing.status = 'completed';
      existing.completedAt = new Date().toISOString();
      existing.completedBy = completedBy || '';
      return existing;
    }
    const newItem = {
      itemIndex,
      status: 'completed',
      completedAt: new Date().toISOString(),
      completedBy: completedBy || '',
    };
    this.mockChecklistProgress[key].push(newItem);
    return newItem;
  }

  unmarkMockChecklistItem(clientId, platform, stepId, itemIndex) {
    const key = `${clientId}:${platform}:${stepId}`;
    if (!this.mockChecklistProgress[key]) return false;
    const index = this.mockChecklistProgress[key].findIndex((p) => p.itemIndex === itemIndex);
    if (index === -1) return false;
    this.mockChecklistProgress[key].splice(index, 1);
    return true;
  }

  // Mock data for notes
  mockNotes = {};

  getMockNotes(clientId, platform, stepId, itemIndex) {
    const key = `${clientId}:${platform}:${stepId}:${itemIndex !== null ? itemIndex : 'step'}`;
    const note = this.mockNotes[key];
    return note ? [note] : [];
  }

  saveMockNote(clientId, platform, stepId, note, itemIndex, updatedBy) {
    const key = `${clientId}:${platform}:${stepId}:${itemIndex !== null ? itemIndex : 'step'}`;
    const noteData = {
      id: `note-${Date.now()}`,
      itemIndex,
      note,
      updatedAt: new Date().toISOString(),
      updatedBy,
    };
    this.mockNotes[key] = noteData;
    return noteData;
  }

  // Mock data for checklist content - comprehensive instructions
  mockChecklistContent = {
    'core.prerequisites': [
      {
        itemIndex: 0,
        title: 'Meta Business Manager account access',
        instruction: `## Access Meta Business Manager

To set up the Conversions API, you need access to Meta Business Manager.

### Steps:
1. Go to [business.facebook.com](https://business.facebook.com/)
2. Log in with your Facebook account
3. If you don't have a Business Manager account, click **Create Account**
4. Enter your business name, your name, and business email
5. Click **Submit**

### Verify Access:
- You should see your business dashboard
- Navigate to **Business Settings** to confirm you're logged in correctly`,
        links: [
          { title: 'Create Business Manager', url: 'https://www.facebook.com/business/help/1710077379203657' },
          { title: 'Business Manager Overview', url: 'https://www.facebook.com/business/help/113163272211510' },
        ],
      },
      {
        itemIndex: 1,
        title: 'Admin permissions in Business Manager',
        instruction: `## Verify Admin Permissions

You need Admin-level access in Business Manager to set up the Conversions API.

### Check Your Permission Level:
1. Go to **Business Settings** in Business Manager
2. Click **People** in the left menu
3. Find your name in the list
4. Verify your role shows **Admin**

### If You Don't Have Admin Access:
- Contact an existing Admin in your Business Manager
- Request Admin role assignment
- Alternatively, ask the Admin to complete CAPI setup

### Why Admin is Required:
- Creating and managing Pixels
- Generating access tokens
- Configuring event datasets`,
        links: [
          { title: 'Business Manager Roles', url: 'https://www.facebook.com/business/help/442345745885606' },
        ],
      },
      {
        itemIndex: 2,
        title: 'Access to the data source platform',
        instruction: `## Verify Data Source Access

Ensure you have the necessary access to your data source platform.

### What You Need:
- **Login credentials** for your data platform
- **Read access** to the tables containing event data
- **API/connection permissions** for server-to-server communication

### Common Data Sources:
- **Data Warehouses**: Snowflake, BigQuery, Redshift
- **CRMs**: Salesforce, HubSpot
- **CDPs**: Segment
- **Analytics**: Amplitude, Mixpanel, GA4

### Gather This Information:
- Connection URL or hostname
- Database/project name
- Authentication credentials (API key, OAuth, etc.)
- Table or view names containing conversion data`,
        links: [],
      },
    ],
    'core.pixel_setup': [
      {
        itemIndex: 0,
        title: 'Pixel created in Events Manager',
        instruction: `## Create or Locate Your Meta Pixel

The Conversions API sends events to a Meta Pixel (now called "Dataset").

### Create a New Pixel:
1. Go to [Events Manager](https://business.facebook.com/events_manager)
2. Click **Connect Data Sources**
3. Select **Web**
4. Choose **Meta Pixel** and click **Connect**
5. Enter a name for your Pixel
6. Enter your website URL (optional)
7. Click **Continue**

### Find an Existing Pixel:
1. Go to Events Manager
2. Look in the left sidebar for your data sources
3. Click on the Pixel you want to use for CAPI`,
        links: [
          { title: 'Create a Meta Pixel', url: 'https://www.facebook.com/business/help/952192354843755' },
          { title: 'Events Manager', url: 'https://business.facebook.com/events_manager' },
        ],
      },
      {
        itemIndex: 1,
        title: 'Pixel ID documented',
        instruction: `## Document Your Pixel ID

You'll need the Pixel ID to configure the Conversions API.

### Find Your Pixel ID:
1. Go to [Events Manager](https://business.facebook.com/events_manager)
2. Select your Pixel from the left sidebar
3. Click **Settings** tab
4. Find the **Dataset ID** (this is your Pixel ID)
5. It's a 15-16 digit number (e.g., 1234567890123456)

### Store It Safely:
- Copy the Pixel ID
- Store it in your configuration/environment variables
- You'll use this when making API calls

### Format:
\`\`\`
PIXEL_ID=1234567890123456
\`\`\``,
        links: [
          { title: 'Find Pixel ID', url: 'https://www.facebook.com/business/help/952192354843755' },
        ],
      },
      {
        itemIndex: 2,
        title: 'Dataset created (if needed)',
        instruction: `## Dataset Configuration

Modern Meta Pixel setups use "Datasets" which unify web, app, and offline events.

### Check If You Need a Dataset:
- If you created a Pixel recently, you already have a Dataset
- Older Pixels may need to be upgraded

### Create/Upgrade Dataset:
1. Go to Events Manager
2. Select your Pixel
3. Look for **Upgrade to Dataset** option if available
4. Follow the prompts to complete upgrade

### Benefits of Datasets:
- Unified view of all conversion sources
- Better event deduplication
- Improved measurement across channels`,
        links: [
          { title: 'About Datasets', url: 'https://developers.facebook.com/docs/marketing-api/conversions-api' },
        ],
      },
    ],
    'core.access_token': [
      {
        itemIndex: 0,
        title: 'Access token generated in Events Manager',
        instruction: `## Generate Your Conversions API Access Token

The access token authenticates your server requests to Meta.

### Generate Token (Recommended Method):
1. Go to [Events Manager](https://business.facebook.com/events_manager)
2. Select your Pixel/Dataset
3. Click **Settings** tab
4. Scroll to **Conversions API** section
5. Click **Generate access token** under "Set up manually"
6. Follow the prompts to create the token
7. **Copy the token immediately** - it won't be shown again

### Alternative: Generate via Business Manager
1. Go to **Business Settings** > **System Users**
2. Create or select a System User
3. Generate a token with pixel permissions

### Important:
- Tokens don't expire but should be rotated periodically
- Never expose tokens in client-side code`,
        links: [
          { title: 'Generate Access Token', url: 'https://developers.facebook.com/docs/marketing-api/conversions-api/get-started#access-token' },
        ],
      },
      {
        itemIndex: 1,
        title: 'Token stored securely',
        instruction: `## Secure Token Storage

Access tokens provide full access to send events - protect them carefully.

### Best Practices:
- **Never commit tokens to version control**
- Use environment variables or secrets management
- Rotate tokens periodically (every 6-12 months)
- Limit token access to necessary team members

### Storage Options:
\`\`\`bash
# Environment variable (recommended)
export META_ACCESS_TOKEN="your_token_here"

# .env file (add to .gitignore)
META_ACCESS_TOKEN=your_token_here
\`\`\`

### Secrets Management:
- AWS Secrets Manager
- HashiCorp Vault
- Google Secret Manager
- Azure Key Vault`,
        links: [
          { title: 'Security Best Practices', url: 'https://developers.facebook.com/docs/marketing-api/conversions-api/best-practices' },
        ],
      },
      {
        itemIndex: 2,
        title: 'Token permissions verified',
        instruction: `## Verify Token Permissions

Ensure your token has the correct permissions for CAPI.

### Required Permissions:
- **ads_management** - For sending conversion events
- No App Review required for CAPI tokens generated in Events Manager

### Test Your Token:
Send a test event using the Events Manager Test Events tool:
1. Go to Events Manager > Test Events
2. Enter your token
3. Send a test event
4. Verify it appears in the test events log

### Common Issues:
- **Invalid token**: Re-generate in Events Manager
- **Permission denied**: Ensure token is associated with the correct Pixel
- **Expired token**: Generate a new token`,
        links: [
          { title: 'Test Events Tool', url: 'https://developers.facebook.com/docs/marketing-api/conversions-api/using-the-api#testEvents' },
        ],
      },
    ],
    'core.event_planning': [
      {
        itemIndex: 0,
        title: 'Standard events identified (Purchase, Lead, etc.)',
        instruction: `## Identify Standard Events

Meta supports standard events that are pre-defined for common conversion actions.

### Common Standard Events:
| Event | Use Case |
|-------|----------|
| **Purchase** | Completed transaction |
| **Lead** | Form submission, signup |
| **AddToCart** | Product added to cart |
| **InitiateCheckout** | Checkout started |
| **ViewContent** | Product/content viewed |
| **Search** | Search performed |
| **CompleteRegistration** | Account created |
| **Contact** | Contact form submitted |
| **Subscribe** | Subscription started |

### Choose Your Events:
1. List your key conversion actions
2. Map each to a standard event if possible
3. Use standard events for better optimization`,
        links: [
          { title: 'Standard Events Reference', url: 'https://developers.facebook.com/docs/meta-pixel/reference' },
        ],
      },
      {
        itemIndex: 1,
        title: 'Custom events defined (if needed)',
        instruction: `## Define Custom Events

Use custom events for actions not covered by standard events.

### When to Use Custom Events:
- Industry-specific conversions
- Multi-step funnels
- App-specific actions

### Naming Conventions:
\`\`\`javascript
// Good custom event names
"DownloadWhitepaper"
"ScheduleDemo"
"WatchVideo"
"CompleteLevel"

// Avoid generic names
"Click"  // Too generic
"Event1" // Not descriptive
\`\`\`

### Custom Event Structure:
\`\`\`javascript
{
  "event_name": "ScheduleDemo",
  "custom_data": {
    "demo_type": "product",
    "sales_rep": "John"
  }
}
\`\`\``,
        links: [
          { title: 'Custom Events Guide', url: 'https://developers.facebook.com/docs/marketing-api/conversions-api/parameters' },
        ],
      },
      {
        itemIndex: 2,
        title: 'Required parameters documented',
        instruction: `## Document Required Parameters

Each event needs specific parameters for effective matching and attribution.

### Required for ALL Events:
| Parameter | Description |
|-----------|-------------|
| \`event_name\` | Name of the event |
| \`event_time\` | Unix timestamp of event |
| \`action_source\` | Where event occurred (website, app, etc.) |

### Required for Website Events:
| Parameter | Description |
|-----------|-------------|
| \`event_source_url\` | Full URL where event occurred |
| \`client_user_agent\` | User's browser user agent |

### Recommended for Better Matching:
| Parameter | Impact |
|-----------|--------|
| \`em\` (email) | High match quality |
| \`ph\` (phone) | High match quality |
| \`fn\`, \`ln\` (name) | Medium match quality |
| \`fbc\`, \`fbp\` | Click/browser ID from cookies |

### Hash Requirements:
- Email, phone, names must be SHA-256 hashed
- Lowercase and trim whitespace before hashing`,
        links: [
          { title: 'Parameters Reference', url: 'https://developers.facebook.com/docs/marketing-api/conversions-api/parameters' },
          { title: 'Customer Information Parameters', url: 'https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters' },
        ],
      },
    ],
    'testing.validation': [
      {
        itemIndex: 0,
        title: 'Test events sent successfully',
        instruction: `## Send Test Events

Use the Test Events tool to validate your integration before going live.

### Get Your Test Event Code:
1. Go to Events Manager > Your Pixel > Test Events
2. Copy the **Test Event Code** shown (e.g., "TEST12345")

### Send a Test Event:
Include the test code in your API request:
\`\`\`javascript
{
  "data": [...],
  "test_event_code": "TEST12345"
}
\`\`\`

### Verify Receipt:
- Test events appear in the Test Events tab within seconds
- Check for errors or warnings
- Verify all parameters are received correctly

### Important:
- Remove \`test_event_code\` before production
- Test events still count toward your event totals`,
        links: [
          { title: 'Test Events Tool', url: 'https://developers.facebook.com/docs/marketing-api/conversions-api/using-the-api#testEvents' },
        ],
      },
      {
        itemIndex: 1,
        title: 'Events visible in Events Manager',
        instruction: `## Verify Events in Events Manager

Confirm your events are being received and processed.

### Check Events Manager:
1. Go to [Events Manager](https://business.facebook.com/events_manager)
2. Select your Pixel/Dataset
3. Click **Overview** tab
4. Look for your events in the activity list

### What to Check:
- **Event volume**: Events appearing as expected
- **Connection method**: Shows "Conversions API"
- **Match quality**: Higher is better

### Timeline:
- Test events: Appear within seconds
- Real events: May take up to 20 minutes
- Historical data: Appears within a few hours`,
        links: [
          { title: 'Events Manager Guide', url: 'https://www.facebook.com/business/help/898185560232180' },
        ],
      },
      {
        itemIndex: 2,
        title: 'Event match quality reviewed',
        instruction: `## Review Event Match Quality

Event Match Quality (EMQ) measures how well events can be attributed.

### Check EMQ Score:
1. Go to Events Manager
2. Select your Pixel
3. Click on a specific event type
4. View the **Event Match Quality** score (1-10)

### Improve Match Quality:
| Action | Impact |
|--------|--------|
| Add hashed email | +2-3 points |
| Add hashed phone | +2-3 points |
| Include \`fbp\`/\`fbc\` | +1-2 points |
| Add IP address | +1 point |

### Target Scores:
- **8-10**: Excellent - optimal performance
- **6-7**: Good - room for improvement
- **1-5**: Poor - add more customer data

### Best Practice:
Send as many customer information parameters as available.`,
        links: [
          { title: 'Event Match Quality', url: 'https://www.facebook.com/business/help/765081237991954' },
        ],
      },
    ],
    'golive.enable': [
      {
        itemIndex: 0,
        title: 'Test mode disabled',
        instruction: `## Disable Test Mode

Remove test configurations before going to production.

### Checklist:
- [ ] Remove \`test_event_code\` from all requests
- [ ] Switch from test/staging environment to production
- [ ] Update API endpoints if different for production
- [ ] Verify production credentials are in place

### Final Request Format:
\`\`\`javascript
// Production request (no test_event_code)
{
  "data": [
    {
      "event_name": "Purchase",
      "event_time": 1699999999,
      // ... other parameters
    }
  ]
  // NO test_event_code
}
\`\`\``,
        links: [],
      },
      {
        itemIndex: 1,
        title: 'Production data flowing',
        instruction: `## Verify Production Data Flow

Confirm real events are being sent and received.

### Verification Steps:
1. Deploy your production configuration
2. Trigger a real conversion (or wait for organic traffic)
3. Check Events Manager for new events
4. Verify they show "Conversions API" as source

### Monitor First 24 Hours:
- Watch for any API errors
- Compare event volumes to expected levels
- Check for duplicate events (if using both Pixel and CAPI)

### Deduplication:
If using both Pixel and CAPI, ensure:
- Same \`event_id\` is sent from both sources
- Same \`event_name\` is used
- Events are within 48-hour window`,
        links: [
          { title: 'Deduplication Guide', url: 'https://developers.facebook.com/docs/marketing-api/conversions-api/deduplicate-pixel-and-server-events' },
        ],
      },
      {
        itemIndex: 2,
        title: 'Monitoring configured',
        instruction: `## Configure Monitoring

Set up alerts and monitoring for your CAPI integration.

### What to Monitor:
| Metric | Alert Threshold |
|--------|-----------------|
| API errors | Any 4xx/5xx errors |
| Event volume | >20% drop from baseline |
| Match quality | Drop below 6 |
| Latency | Events >1 hour delayed |

### Monitoring Options:
1. **Events Manager Diagnostics**
   - Built-in error reporting
   - Event quality metrics

2. **Server-side Logging**
   - Log all API responses
   - Track success/failure rates

3. **Alerting**
   - Set up alerts for error spikes
   - Monitor event volume trends

### Weekly Review:
- Check Event Match Quality
- Review any diagnostic warnings
- Verify event counts match expectations`,
        links: [
          { title: 'Best Practices', url: 'https://developers.facebook.com/docs/marketing-api/conversions-api/best-practices' },
        ],
      },
    ],
  };

  getMockChecklistContent(stepId) {
    return this.mockChecklistContent[stepId] || [];
  }
}

export const sheetsService = new SheetsService();
