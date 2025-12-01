export const PLATFORMS = [
  // Data Warehouses
  {
    id: 'redshift',
    name: 'Amazon Redshift',
    logo: '/logos/redshift.png',
    category: 'Data Warehouse',
    description: 'Send events from Amazon Redshift data warehouse',
  },
  {
    id: 'snowflake',
    name: 'Snowflake',
    logo: '/logos/snowflake.png',
    category: 'Data Warehouse',
    description: 'Connect Snowflake data warehouse to Meta CAPI',
  },
  {
    id: 'bigquery',
    name: 'Google BigQuery',
    logo: '/logos/bigquery.png',
    category: 'Data Warehouse',
    description: 'Stream events from Google BigQuery',
  },

  // CRMs & CDPs
  {
    id: 'salesforce',
    name: 'Salesforce',
    logo: '/logos/salesforce.png',
    category: 'CRM',
    description: 'Sync Salesforce CRM data with Meta',
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    logo: '/logos/hubspot.png',
    category: 'CRM',
    description: 'Connect HubSpot marketing data',
  },
  {
    id: 'segment',
    name: 'Segment',
    logo: '/logos/segment.png',
    category: 'CDP',
    description: 'Route Segment events to Meta CAPI',
  },

  // Analytics Tools
  {
    id: 'amplitude',
    name: 'Amplitude',
    logo: '/logos/amplitude.png',
    category: 'Analytics',
    description: 'Forward Amplitude analytics events',
  },
  {
    id: 'mixpanel',
    name: 'Mixpanel',
    logo: '/logos/mixpanel.png',
    category: 'Analytics',
    description: 'Connect Mixpanel product analytics',
  },
  {
    id: 'ga4',
    name: 'Google Analytics 4',
    logo: '/logos/ga4.png',
    category: 'Analytics',
    description: 'Sync GA4 events with Meta CAPI',
  },
];

export const PLATFORM_CATEGORIES = {
  'Data Warehouse': ['redshift', 'snowflake', 'bigquery'],
  'CRM': ['salesforce', 'hubspot'],
  'CDP': ['segment'],
  'Analytics': ['amplitude', 'mixpanel', 'ga4'],
};

export function getPlatformById(id) {
  return PLATFORMS.find((p) => p.id === id);
}
