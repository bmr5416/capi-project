/**
 * Context-aware tips for Imp (the CAPI assistant)
 * Tips are matched based on: page, platform, phase, condition
 *
 * Tip structure:
 * - id: unique identifier
 * - page: 'dashboard' | 'clientDetail' | 'wizard' | 'newClient' | 'docs' | 'any'
 * - platform: optional platform ID or category
 * - phase: optional wizard phase (1-6)
 * - condition: optional condition check
 * - priority: 1-10 (higher = more likely to show)
 * - message: the tip text (can include {variables})
 * - animation: Clippy animation to play
 */

export const impTips = [
  // ===== DASHBOARD TIPS =====
  {
    id: 'dash-welcome',
    page: 'dashboard',
    condition: 'empty_clients',
    priority: 10,
    message: "Greetings, adventurer! Your quest begins here. Click 'Add Client' to start your first CAPI journey!",
    animation: 'Wave'
  },
  {
    id: 'dash-progress',
    page: 'dashboard',
    condition: 'has_clients',
    priority: 5,
    message: "Your party grows stronger! Each completed platform brings you closer to conversion tracking mastery.",
    animation: 'Congratulate'
  },
  {
    id: 'dash-tip-stats',
    page: 'dashboard',
    priority: 4,
    message: "Pro tip: The stats at the top show your overall progress. Green means victory!",
    animation: 'Explain'
  },
  {
    id: 'dash-in-progress',
    page: 'dashboard',
    condition: 'has_in_progress',
    priority: 7,
    message: "I see unfinished quests! Click on a client to continue their CAPI setup adventure.",
    animation: 'GetAttention'
  },

  // ===== NEW CLIENT TIPS =====
  {
    id: 'new-client-intro',
    page: 'newClient',
    priority: 8,
    message: "Every great quest starts with a name! Enter your client details to begin their CAPI adventure.",
    animation: 'Wave'
  },
  {
    id: 'new-client-email',
    page: 'newClient',
    priority: 6,
    message: "The contact email helps you track who's responsible for this client's setup. Choose wisely!",
    animation: 'Explain'
  },

  // ===== CLIENT DETAIL TIPS =====
  {
    id: 'client-no-platforms',
    page: 'clientDetail',
    condition: 'no_platforms',
    priority: 10,
    message: "This adventurer needs weapons! Add a data platform to begin their CAPI quest.",
    animation: 'GetAttention'
  },
  {
    id: 'client-add-platform',
    page: 'clientDetail',
    priority: 6,
    message: "Each platform is a unique path to conversion glory. Choose based on where your client's data lives.",
    animation: 'Thinking'
  },
  {
    id: 'client-continue',
    page: 'clientDetail',
    condition: 'has_in_progress',
    priority: 8,
    message: "The quest continues! Click 'Continue Setup' to advance to the next dungeon level.",
    animation: 'Explain'
  },
  {
    id: 'client-completed',
    page: 'clientDetail',
    condition: 'all_completed',
    priority: 9,
    message: "Victory! This client has completed all their CAPI quests. May their conversions be ever accurate!",
    animation: 'Congratulate'
  },

  // ===== WIZARD - PHASE 1: PREREQUISITES =====
  {
    id: 'wiz-phase1-intro',
    page: 'wizard',
    phase: 1,
    priority: 9,
    message: "The Prerequisites phase is crucial! Verify your Business Manager access before venturing deeper into the dungeon.",
    animation: 'Explain'
  },
  {
    id: 'wiz-phase1-bm',
    page: 'wizard',
    phase: 1,
    priority: 7,
    message: "Business Manager admin access is your master key. Without it, many doors will remain locked!",
    animation: 'GetAttention'
  },

  // ===== WIZARD - PHASE 2: META SETUP =====
  {
    id: 'wiz-phase2-intro',
    page: 'wizard',
    phase: 2,
    priority: 8,
    message: "Meta Setup time! Your Pixel ID and Access Token are the sacred artifacts needed for this journey.",
    animation: 'Explain'
  },
  {
    id: 'wiz-phase2-token',
    page: 'wizard',
    phase: 2,
    priority: 7,
    message: "Guard your Access Token well! Store it securely - it's the key to your client's conversion kingdom.",
    animation: 'Thinking'
  },

  // ===== WIZARD - PHASE 3: PLATFORM SETUP =====
  {
    id: 'wiz-phase3-intro',
    page: 'wizard',
    phase: 3,
    priority: 8,
    message: "Platform Setup is where the real adventure begins! Each platform has its own unique requirements.",
    animation: 'Wave'
  },

  // Platform-specific tips
  {
    id: 'wiz-snowflake',
    page: 'wizard',
    platform: 'snowflake',
    phase: 3,
    priority: 9,
    message: "Snowflake warrior! Your warehouse connection string is the key to the data treasure vault.",
    animation: 'Explain'
  },
  {
    id: 'wiz-bigquery',
    page: 'wizard',
    platform: 'bigquery',
    phase: 3,
    priority: 9,
    message: "BigQuery sage! Ensure your service account has the right permissions to query the oracle.",
    animation: 'Thinking'
  },
  {
    id: 'wiz-redshift',
    page: 'wizard',
    platform: 'redshift',
    phase: 3,
    priority: 9,
    message: "Redshift navigator! Your cluster endpoint is your compass to the data realm.",
    animation: 'Explain'
  },
  {
    id: 'wiz-salesforce',
    page: 'wizard',
    platform: 'salesforce',
    phase: 3,
    priority: 9,
    message: "CRM warrior! Connect your Salesforce org to unlock the power of lead conversion tracking.",
    animation: 'GetAttention'
  },
  {
    id: 'wiz-hubspot',
    page: 'wizard',
    platform: 'hubspot',
    phase: 3,
    priority: 9,
    message: "HubSpot hero! Your API key is the enchanted scroll that grants data access.",
    animation: 'Explain'
  },
  {
    id: 'wiz-segment',
    page: 'wizard',
    platform: 'segment',
    phase: 3,
    priority: 9,
    message: "Segment sorcerer! Your write key channels all event streams to their destination.",
    animation: 'Thinking'
  },
  {
    id: 'wiz-amplitude',
    page: 'wizard',
    platform: 'amplitude',
    phase: 3,
    priority: 9,
    message: "Amplitude analyst! Your API credentials reveal the behavioral insights within.",
    animation: 'Explain'
  },
  {
    id: 'wiz-mixpanel',
    page: 'wizard',
    platform: 'mixpanel',
    phase: 3,
    priority: 9,
    message: "Mixpanel master! Connect your project to harness the power of event analytics.",
    animation: 'Wave'
  },
  {
    id: 'wiz-ga4',
    page: 'wizard',
    platform: 'ga4',
    phase: 3,
    priority: 9,
    message: "Analytics sage! Your Measurement ID is the scrying crystal that sees all user journeys.",
    animation: 'Thinking'
  },

  // ===== WIZARD - PHASE 4: DATA MAPPING =====
  {
    id: 'wiz-phase4-intro',
    page: 'wizard',
    phase: 4,
    priority: 8,
    message: "Data Mapping phase! Here we translate your data's language into Meta's sacred conversion runes.",
    animation: 'Explain'
  },
  {
    id: 'wiz-phase4-events',
    page: 'wizard',
    phase: 4,
    priority: 7,
    message: "Map your events carefully! Purchase, Lead, ViewContent - each tells Meta a different story.",
    animation: 'Thinking'
  },

  // ===== WIZARD - PHASE 5: TESTING =====
  {
    id: 'wiz-phase5-intro',
    page: 'wizard',
    phase: 5,
    priority: 9,
    message: "Testing phase - the final trial! Validate your events before the production battle begins.",
    animation: 'GetAttention'
  },
  {
    id: 'wiz-phase5-events-manager',
    page: 'wizard',
    phase: 5,
    priority: 8,
    message: "Check Events Manager for your test events. The Test Events tool is your debugging ally!",
    animation: 'Explain'
  },

  // ===== WIZARD - PHASE 6: GO LIVE =====
  {
    id: 'wiz-phase6-intro',
    page: 'wizard',
    phase: 6,
    priority: 10,
    message: "Go Live - the final boss! Disable test mode and unleash your conversions upon the Meta realm!",
    animation: 'Congratulate'
  },
  {
    id: 'wiz-phase6-monitor',
    page: 'wizard',
    phase: 6,
    priority: 8,
    message: "Victory is near! Set up monitoring to ensure your conversion stream flows eternally.",
    animation: 'Wave'
  },

  // ===== DOCUMENTATION TIPS =====
  {
    id: 'docs-welcome',
    page: 'docs',
    priority: 7,
    message: "The sacred scrolls of knowledge! These docs contain everything you need for CAPI mastery.",
    animation: 'Wave'
  },
  {
    id: 'docs-search',
    page: 'docs',
    priority: 5,
    message: "Lost in the library? Use the navigation to find the wisdom you seek.",
    animation: 'Thinking'
  },

  // ===== GENERAL TIPS (any page) =====
  {
    id: 'general-fun-mode',
    page: 'any',
    priority: 3,
    message: "Did you know? I only appear in Fun Mode. You can toggle me off in the settings if you need focus!",
    animation: 'Wave'
  },
  {
    id: 'general-notes',
    page: 'any',
    priority: 4,
    message: "Pro tip: Use the notes feature to record important details. Future you will thank present you!",
    animation: 'Explain'
  },
  {
    id: 'general-checklist',
    page: 'any',
    priority: 4,
    message: "Each checklist item can be expanded for detailed instructions. Click to reveal the secrets within!",
    animation: 'GetAttention'
  }
];

/**
 * Get tips filtered by context
 */
export function getTipsForContext({ page, platform, phase, condition: _condition }) {
  return impTips.filter(tip => {
    // Page match (required unless 'any')
    if (tip.page !== 'any' && tip.page !== page) return false;

    // Platform match (optional)
    if (tip.platform && tip.platform !== platform) return false;

    // Phase match (optional)
    if (tip.phase && tip.phase !== phase) return false;

    // Condition match (optional - handled by caller)
    // Conditions are evaluated in the hook based on actual data

    return true;
  });
}

/**
 * Get a random tip from filtered list, prioritizing unseen tips
 */
export function selectTip(tips, seenTipIds = []) {
  if (tips.length === 0) return null;

  // Separate unseen and seen tips
  const unseenTips = tips.filter(t => !seenTipIds.includes(t.id));
  const tipsToChooseFrom = unseenTips.length > 0 ? unseenTips : tips;

  // Sort by priority (higher first)
  tipsToChooseFrom.sort((a, b) => (b.priority || 5) - (a.priority || 5));

  // Pick randomly from top 3 (or fewer)
  const topTips = tipsToChooseFrom.slice(0, Math.min(3, tipsToChooseFrom.length));
  return topTips[Math.floor(Math.random() * topTips.length)];
}
