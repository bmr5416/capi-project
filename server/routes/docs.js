import { Router } from 'express';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { sheetsService } from '../services/sheets.js';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DOCS_DIR = join(__dirname, '../../docs');

// Valid pattern for path parameters to prevent path traversal
const VALID_PATH_PARAM_PATTERN = /^[a-z0-9-]+$/i;

function isValidPathParam(param) {
  return VALID_PATH_PARAM_PATTERN.test(param) && !param.includes('..');
}

// Documentation structure
const DOC_STRUCTURE = {
  'meta-capi': {
    title: 'Meta CAPI',
    description: 'Core Conversions API documentation',
    docs: [
      { slug: 'overview', title: 'Overview' },
      { slug: 'requirements', title: 'Requirements' },
      { slug: 'pixel-setup', title: 'Pixel Setup' },
      { slug: 'access-token', title: 'Access Token' },
      { slug: 'event-parameters', title: 'Event Parameters' },
    ],
  },
  platforms: {
    title: 'Platform Guides',
    description: 'Platform-specific integration guides',
    categories: {
      'data-warehouses': {
        title: 'Data Warehouses',
        platforms: ['redshift', 'snowflake', 'bigquery'],
      },
      'crms-cdps': {
        title: 'CRMs & CDPs',
        platforms: ['salesforce', 'hubspot', 'segment'],
      },
      analytics: {
        title: 'Analytics',
        platforms: ['amplitude', 'mixpanel', 'ga4'],
      },
    },
  },
};

// GET /api/docs - Get documentation structure
router.get('/', (_req, res) => {
  res.json({ structure: DOC_STRUCTURE });
});

// GET /api/docs/content/:stepId - Get checklist content for a step
// NOTE: Must be before /:category/:slug to avoid route collision
router.get('/content/:stepId', async (req, res, next) => {
  try {
    const { stepId } = req.params;
    const items = await sheetsService.getChecklistContent(stepId);
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

// GET /api/docs/:category/:slug - Get specific document
router.get('/:category/:slug', async (req, res, next) => {
  try {
    const { category, slug } = req.params;

    // Validate path parameters to prevent path traversal
    if (!isValidPathParam(category) || !isValidPathParam(slug)) {
      return res.status(400).json({ error: { message: 'Invalid path parameters' } });
    }

    const filePath = join(DOCS_DIR, category, `${slug}.md`);

    const content = await readFile(filePath, 'utf-8').catch(() => null);

    if (!content) {
      // Return placeholder content if file doesn't exist
      res.json({
        title: formatTitle(slug),
        content: getPlaceholderContent(category, slug),
        category,
        slug,
        placeholder: true,
      });
      return;
    }

    // Extract title from markdown (first h1)
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : formatTitle(slug);

    res.json({
      title,
      content,
      category,
      slug,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/docs/platforms/:platform/:slug - Get platform-specific doc
router.get('/platforms/:platform/:slug', async (req, res, next) => {
  try {
    const { platform, slug } = req.params;

    // Validate path parameters to prevent path traversal
    if (!isValidPathParam(platform) || !isValidPathParam(slug)) {
      return res.status(400).json({ error: { message: 'Invalid path parameters' } });
    }

    const filePath = join(DOCS_DIR, 'platforms', platform, `${slug}.md`);

    const content = await readFile(filePath, 'utf-8').catch(() => null);

    if (!content) {
      res.json({
        title: `${formatTitle(platform)} - ${formatTitle(slug)}`,
        content: getPlaceholderContent(`platforms/${platform}`, slug),
        platform,
        slug,
        placeholder: true,
      });
      return;
    }

    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : `${formatTitle(platform)} - ${formatTitle(slug)}`;

    res.json({
      title,
      content,
      platform,
      slug,
    });
  } catch (error) {
    next(error);
  }
});

// Helper functions
function formatTitle(slug) {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function getPlaceholderContent(category, slug) {
  const title = formatTitle(slug);
  return `# ${title}

This documentation is coming soon.

For now, please refer to the official Meta documentation:
- [Conversions API Overview](https://developers.facebook.com/docs/marketing-api/conversions-api)
- [Getting Started](https://developers.facebook.com/docs/marketing-api/conversions-api/get-started)
- [API Parameters](https://developers.facebook.com/docs/marketing-api/conversions-api/parameters)

## Need Help?

If you need immediate assistance, contact your administrator or refer to the official platform documentation.
`;
}

export default router;
