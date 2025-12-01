// Core steps shared across all platforms
export const CORE_STEPS = [
  {
    id: 'core.prerequisites',
    phase: 1,
    title: 'Prerequisites Check',
    description: 'Verify you have everything needed to begin',
    checklist: [
      'Meta Business Manager account access',
      'Admin permissions in Business Manager',
      'Access to the data source platform',
    ],
    docLink: 'https://developers.facebook.com/docs/marketing-api/conversions-api/get-started',
  },
  {
    id: 'core.pixel_setup',
    phase: 2,
    title: 'Meta Pixel Setup',
    description: 'Create or configure your Meta Pixel',
    checklist: [
      'Pixel created in Events Manager',
      'Pixel ID documented',
      'Dataset created (if needed)',
    ],
    docLink: 'https://developers.facebook.com/docs/marketing-api/conversions-api/get-started#before-you-start',
  },
  {
    id: 'core.access_token',
    phase: 2,
    title: 'Access Token Generation',
    description: 'Generate your Conversions API access token',
    checklist: [
      'Access token generated in Events Manager',
      'Token stored securely',
      'Token permissions verified',
    ],
    docLink: 'https://developers.facebook.com/docs/marketing-api/conversions-api/get-started#access-token',
  },
  {
    id: 'core.event_planning',
    phase: 4,
    title: 'Event Planning',
    description: 'Define which events to send via CAPI',
    checklist: [
      'Standard events identified (Purchase, Lead, etc.)',
      'Custom events defined (if needed)',
      'Required parameters documented',
    ],
    docLink: 'https://developers.facebook.com/docs/marketing-api/conversions-api/parameters',
  },
];

// Platform-specific steps
export const PLATFORM_STEPS = {
  snowflake: [
    {
      id: 'snowflake.connection',
      phase: 3,
      title: 'Snowflake Connection',
      description: 'Configure Snowflake warehouse connection',
      checklist: [
        'Snowflake account URL obtained',
        'Service account or user credentials ready',
        'Warehouse and database identified',
      ],
      docLink: 'https://docs.snowflake.com/en/user-guide/connecting',
    },
    {
      id: 'snowflake.query',
      phase: 4,
      title: 'Query Configuration',
      description: 'Set up the query to extract event data',
      checklist: [
        'Source table(s) identified',
        'SQL query tested and validated',
        'Event timestamp field mapped',
      ],
    },
  ],
  redshift: [
    {
      id: 'redshift.connection',
      phase: 3,
      title: 'Redshift Connection',
      description: 'Configure Amazon Redshift connection',
      checklist: [
        'Redshift cluster endpoint obtained',
        'Database credentials configured',
        'Security groups allow connection',
      ],
      docLink: 'https://docs.aws.amazon.com/redshift/latest/mgmt/connecting-to-cluster.html',
    },
    {
      id: 'redshift.query',
      phase: 4,
      title: 'Query Configuration',
      description: 'Set up the query to extract event data',
      checklist: [
        'Source table(s) identified',
        'SQL query tested and validated',
        'Event timestamp field mapped',
      ],
    },
  ],
  bigquery: [
    {
      id: 'bigquery.connection',
      phase: 3,
      title: 'BigQuery Connection',
      description: 'Configure Google BigQuery connection',
      checklist: [
        'GCP project ID obtained',
        'Service account key created',
        'Dataset and table identified',
      ],
      docLink: 'https://cloud.google.com/bigquery/docs/authentication',
    },
    {
      id: 'bigquery.query',
      phase: 4,
      title: 'Query Configuration',
      description: 'Set up the query to extract event data',
      checklist: [
        'Source table(s) identified',
        'SQL query tested and validated',
        'Event timestamp field mapped',
      ],
    },
  ],
  salesforce: [
    {
      id: 'salesforce.connection',
      phase: 3,
      title: 'Salesforce Connection',
      description: 'Connect to Salesforce CRM',
      checklist: [
        'Salesforce org URL obtained',
        'Connected App created (or using existing)',
        'OAuth credentials ready',
      ],
      docLink: 'https://help.salesforce.com/s/articleView?id=sf.connected_app_overview.htm',
    },
    {
      id: 'salesforce.objects',
      phase: 4,
      title: 'Object Mapping',
      description: 'Map Salesforce objects to CAPI events',
      checklist: [
        'Lead/Contact objects mapped',
        'Opportunity objects mapped (if needed)',
        'Custom objects configured (if needed)',
      ],
    },
  ],
  hubspot: [
    {
      id: 'hubspot.connection',
      phase: 3,
      title: 'HubSpot Connection',
      description: 'Connect to HubSpot account',
      checklist: [
        'HubSpot account access verified',
        'Private App created',
        'API key or OAuth token obtained',
      ],
      docLink: 'https://developers.hubspot.com/docs/api/private-apps',
    },
    {
      id: 'hubspot.events',
      phase: 4,
      title: 'Event Configuration',
      description: 'Configure HubSpot events to send',
      checklist: [
        'Contact events configured',
        'Deal/opportunity events configured',
        'Form submission events configured',
      ],
    },
  ],
  segment: [
    {
      id: 'segment.connection',
      phase: 3,
      title: 'Segment Connection',
      description: 'Configure Segment as data source',
      checklist: [
        'Segment workspace access verified',
        'Source configured in Segment',
        'Write key obtained',
      ],
      docLink: 'https://segment.com/docs/connections/sources/',
    },
    {
      id: 'segment.destination',
      phase: 4,
      title: 'Meta CAPI Destination',
      description: 'Set up Meta CAPI as Segment destination',
      checklist: [
        'Meta destination added in Segment',
        'Pixel ID configured',
        'Event mappings configured',
      ],
      docLink: 'https://segment.com/docs/connections/destinations/catalog/facebook-conversions-api/',
    },
  ],
  amplitude: [
    {
      id: 'amplitude.connection',
      phase: 3,
      title: 'Amplitude Connection',
      description: 'Connect to Amplitude project',
      checklist: [
        'Amplitude project access verified',
        'API key obtained',
        'Secret key obtained (for exports)',
      ],
      docLink: 'https://www.docs.developers.amplitude.com/analytics/apis/export-api/',
    },
    {
      id: 'amplitude.events',
      phase: 4,
      title: 'Event Selection',
      description: 'Select Amplitude events to forward',
      checklist: [
        'Conversion events identified',
        'Event properties mapped',
        'User properties mapped',
      ],
    },
  ],
  mixpanel: [
    {
      id: 'mixpanel.connection',
      phase: 3,
      title: 'Mixpanel Connection',
      description: 'Connect to Mixpanel project',
      checklist: [
        'Mixpanel project access verified',
        'Service account created',
        'API credentials obtained',
      ],
      docLink: 'https://developer.mixpanel.com/docs/service-accounts',
    },
    {
      id: 'mixpanel.events',
      phase: 4,
      title: 'Event Selection',
      description: 'Select Mixpanel events to forward',
      checklist: [
        'Conversion events identified',
        'Event properties mapped',
        'User identifier mapped',
      ],
    },
  ],
  ga4: [
    {
      id: 'ga4.connection',
      phase: 3,
      title: 'GA4 Connection',
      description: 'Connect to Google Analytics 4 property',
      checklist: [
        'GA4 property access verified',
        'BigQuery export enabled',
        'Service account configured',
      ],
      docLink: 'https://support.google.com/analytics/answer/9358801',
    },
    {
      id: 'ga4.events',
      phase: 4,
      title: 'Event Configuration',
      description: 'Configure GA4 events to send',
      checklist: [
        'Conversion events identified',
        'E-commerce events mapped (if applicable)',
        'Custom events configured',
      ],
    },
  ],
};

// Shared testing and go-live steps
export const FINAL_STEPS = [
  {
    id: 'testing.validation',
    phase: 5,
    title: 'Testing & Validation',
    description: 'Test your CAPI integration',
    checklist: [
      'Test events sent successfully',
      'Events visible in Events Manager',
      'Event match quality reviewed',
    ],
    docLink: 'https://developers.facebook.com/docs/marketing-api/conversions-api/using-the-api#testEvents',
  },
  {
    id: 'golive.enable',
    phase: 6,
    title: 'Go Live',
    description: 'Enable production event sending',
    checklist: [
      'Test mode disabled',
      'Production data flowing',
      'Monitoring configured',
    ],
    docLink: 'https://developers.facebook.com/docs/marketing-api/conversions-api/best-practices',
  },
];

export function getWizardSteps(platform) {
  const platformSteps = PLATFORM_STEPS[platform] || [];
  return [...CORE_STEPS, ...platformSteps, ...FINAL_STEPS].sort(
    (a, b) => a.phase - b.phase
  );
}

export const PHASES = [
  { id: 1, name: 'Prerequisites', description: 'Verify requirements' },
  { id: 2, name: 'Meta Setup', description: 'Configure Meta Pixel and access' },
  { id: 3, name: 'Platform Setup', description: 'Connect your data source' },
  { id: 4, name: 'Data Mapping', description: 'Map events and fields' },
  { id: 5, name: 'Testing', description: 'Validate your setup' },
  { id: 6, name: 'Go Live', description: 'Enable production' },
];

// Total number of phases/steps for progress calculation
export const TOTAL_WIZARD_PHASES = PHASES.length;
