/**
 * ============================================================
 *  CONNECTION ENGINE v0.1
 *  Human Survival Algorithm — Human Bond Mapping Module
 *
 *  Purpose: Distinguish genuine human connection from
 *  parasocial consumption, broadcast ego, and hollow engagement.
 *  Amplify content that brings humans closer together.
 *  Demote content that creates the illusion of connection
 *  while deepening isolation.
 *
 *  Philosophy: A million followers is not connection.
 *  One real conversation is. The loneliness epidemic is
 *  partly an algorithm problem. This engine is the fix.
 * ============================================================
 */

// ── CONNECTION TAXONOMY ──────────────────────────────────────
// Not all "social" interaction is genuine connection.
// We classify interactions on two axes:
// Depth (surface → profound) × Reciprocity (broadcast → mutual)

const CONNECTION_TYPES = {

  // GENUINE CONNECTION — amplify
  genuine: {
    mutual_vulnerability: {
      depth: 0.95, reciprocity: 0.95,
      description: 'Both parties share something real and personal',
      flourishingMultiplier: 1.8,
    },
    collaborative_creation: {
      depth: 0.80, reciprocity: 0.90,
      description: 'Building something together',
      flourishingMultiplier: 1.6,
    },
    empathic_support: {
      depth: 0.85, reciprocity: 0.75,
      description: 'One person genuinely helps another through difficulty',
      flourishingMultiplier: 1.7,
    },
    shared_discovery: {
      depth: 0.75, reciprocity: 0.85,
      description: 'Learning or realizing something together',
      flourishingMultiplier: 1.5,
    },
    bridge_building: {
      depth: 0.80, reciprocity: 0.80,
      description: 'Connecting people across difference',
      flourishingMultiplier: 1.9,  // Highest multiplier — rarest and most valuable
    },
    acts_of_care: {
      depth: 0.90, reciprocity: 0.60,
      description: 'Content that leads to real-world care for another person',
      flourishingMultiplier: 2.0,  // Maximum — offline care is the goal
    },
  },

  // SHALLOW CONNECTION — neutral
  shallow: {
    casual_agreement: {
      depth: 0.30, reciprocity: 0.40,
      description: 'Like, agree, move on',
      flourishingMultiplier: 1.0,
    },
    humor_sharing: {
      depth: 0.35, reciprocity: 0.55,
      description: 'Shared laughter — brief but real',
      flourishingMultiplier: 1.1,
    },
    information_exchange: {
      depth: 0.40, reciprocity: 0.50,
      description: 'Useful but transactional',
      flourishingMultiplier: 1.0,
    },
  },

  // FALSE CONNECTION — demote
  false: {
    parasocial_consumption: {
      depth: 0.10, reciprocity: 0.05,
      description: 'One-way attachment to a creator who doesn\'t know you exist',
      flourishingMultiplier: 0.5,
    },
    performative_empathy: {
      depth: 0.15, reciprocity: 0.20,
      description: 'Public displays of care designed for audience, not recipient',
      flourishingMultiplier: 0.4,
    },
    tribal_bonding: {
      depth: 0.20, reciprocity: 0.60,
      description: 'Connection through shared hatred of an outgroup',
      flourishingMultiplier: 0.2,  // Very low — this is weaponized connection
    },
    validation_seeking: {
      depth: 0.20, reciprocity: 0.15,
      description: 'Content designed to harvest approval, not share truth',
      flourishingMultiplier: 0.5,
    },
    manufactured_intimacy: {
      depth: 0.25, reciprocity: 0.10,
      description: 'Algorithmic simulation of closeness to drive engagement',
      flourishingMultiplier: 0.3,
    },
  },
};

// ── LONELINESS SIGNAL DETECTOR ───────────────────────────────
// Detects users who may be using the platform as a loneliness
// substitute rather than a genuine connection tool.
// These users need different interventions — more bridging,
// more prompts toward real connection.

const LONELINESS_SIGNALS = {
  behavioral: [
    'excessive_session_length',         // > 3hrs/day
    'primarily_passive_consumption',    // Scrolling without interacting
    'night_time_heavy_usage',           // Most usage between 11pm - 4am
    'declining_reciprocal_interaction', // Fewer real conversations over time
    'repeated_parasocial_content',      // Same creator, hours per day
  ],
  content_preference: [
    'comfort_content_loops',            // Same category on repeat
    'avoidance_of_challenging_content', // Never engages with hard truths
    'celebrity_fixation',               // Heavy parasocial attachment
  ],
};

// ── CONNECTION ENGINE MAIN ANALYZER ─────────────────────────

/**
 * Analyzes content for its genuine connection potential.
 *
 * @param {Object} content     - Content to analyze
 * @param {Object} userProfile - Current user connection state
 * @param {Object} networkData - User's social graph signals
 * @returns {Object} Connection analysis result
 */
function analyzeConnectionPotential(content, userProfile = {}, networkData = {}) {

  const connectionType      = classifyConnectionType(content);
  const reciprocityScore    = measureReciprocity(content, networkData);
  const depthScore          = measureConnectionDepth(content);
  const offlinePathway      = detectOfflinePathway(content);
  const lonelinessRisk      = assessLonelinessRisk(userProfile);
  const bridgeScore         = measureBridgeBuilding(content, userProfile);

  const connectionScore = computeConnectionScore(
    connectionType,
    reciprocityScore,
    depthScore,
    offlinePathway,
    lonelinessRisk,
    bridgeScore,
  );

  return {
    connectionScore,          // 0.0 - 1.0
    connectionType,
    reciprocityScore,
    depthScore,
    offlinePathway,
    lonelinessRisk,
    bridgeScore,
    flourishingMultiplier: getFlourishingMultiplier(connectionType),
    interventions: generateConnectionInterventions(lonelinessRisk, connectionScore),
  };
}

// ── CONNECTION TYPE CLASSIFIER ───────────────────────────────

function classifyConnectionType(content) {
  const { historicalSignals = {} } = content;
  const connectionSignals = historicalSignals.connectionSignals || {};

  let bestType = 'shallow.information_exchange';
  let bestScore = 0;

  // Check all connection types
  for (const [category, types] of Object.entries(CONNECTION_TYPES)) {
    for (const [typeName, typeData] of Object.entries(types)) {
      const signal = connectionSignals[`${category}_${typeName}`] || 0;
      if (signal > bestScore) {
        bestScore = signal;
        bestType  = `${category}.${typeName}`;
      }
    }
  }

  const [category, typeName] = bestType.split('.');
  const typeData = CONNECTION_TYPES[category]?.[typeName];

  return {
    category,
    typeName,
    confidence: bestScore,
    depth:       typeData?.depth       || 0.3,
    reciprocity: typeData?.reciprocity || 0.3,
    description: typeData?.description || 'Unknown connection type',
  };
}

// ── RECIPROCITY MEASURER ─────────────────────────────────────

/**
 * Measures whether this content creates two-way interaction
 * or one-way consumption.
 * Real connection requires both parties to be present.
 */
function measureReciprocity(content, networkData) {
  const { historicalSignals = {} } = content;

  // Ratio of comments to passive views
  const views    = historicalSignals.viewCount    || 1;
  const comments = historicalSignals.commentCount || 0;
  const replies  = historicalSignals.replyCount   || 0;
  const dms      = historicalSignals.dmCount      || 0;

  // DMs and replies indicate real reciprocal engagement
  const reciprocityRatio = Math.min(1,
    (comments * 1.0 + replies * 1.5 + dms * 2.0) / (views * 0.1)
  );

  // Check if author responds to comments
  const authorRespondsRate = historicalSignals.authorResponseRate || 0;

  const reciprocityScore = (reciprocityRatio * 0.6) + (authorRespondsRate * 0.4);

  return {
    score: Math.round(Math.min(1, reciprocityScore) * 1000) / 1000,
    commentToViewRatio: Math.round((comments / views) * 1000) / 1000,
    authorRespondsRate,
    dmConversionsRate:  Math.round((dms / views) * 1000) / 1000,
  };
}

// ── CONNECTION DEPTH MEASURER ────────────────────────────────

/**
 * Measures the depth of connection this content enables.
 * Surface: reaction emojis. Deep: sharing something true about yourself.
 */
function measureConnectionDepth(content) {
  const { historicalSignals = {} } = content;

  const depthIndicators = {
    personal_disclosure:   historicalSignals.personalDisclosureRate   || 0,
    vulnerability_present: historicalSignals.vulnerabilityScore       || 0,
    emotional_resonance:   historicalSignals.emotionalResonanceScore  || 0,
    follow_up_engagement:  historicalSignals.followUpEngagementRate   || 0,
    long_form_response:    historicalSignals.longFormResponseRate      || 0,
  };

  const depthScore = Object.values(depthIndicators)
    .reduce((sum, v) => sum + v, 0) / Object.keys(depthIndicators).length;

  return {
    score: Math.round(depthScore * 1000) / 1000,
    indicators: depthIndicators,
    level: depthScore > 0.7 ? 'profound'
         : depthScore > 0.5 ? 'meaningful'
         : depthScore > 0.3 ? 'casual'
         : 'surface',
  };
}

// ── OFFLINE PATHWAY DETECTOR ─────────────────────────────────

/**
 * The ultimate goal of genuine connection is offline reality.
 * Content that leads people to meet, call, or care for each
 * other in the physical world is the highest-value content
 * in this entire system.
 */
function detectOfflinePathway(content) {
  const { historicalSignals = {}, tags = [] } = content;

  const offlineSignals = [
    'meetup_initiated',         // Led to people meeting in person
    'phone_call_prompted',      // Led to a phone call
    'local_community_link',     // Connected to local real-world community
    'volunteering_prompted',    // Led to volunteering or helping
    'gift_sent',                // Led to someone sending something physical
    'check_in_prompted',        // Led to someone checking on a friend
  ];

  const detectedSignals = offlineSignals.filter(s =>
    historicalSignals[s] > 0.3
  );

  // Tags that suggest offline pathway
  const offlineTags = ['local', 'meetup', 'community', 'volunteer', 'neighborhood'];
  const tagMatches = tags.filter(t => offlineTags.includes(t)).length;

  const offlineScore = Math.min(1,
    (detectedSignals.length * 0.15) + (tagMatches * 0.1)
  );

  return {
    score: Math.round(offlineScore * 100) / 100,
    detectedSignals,
    hasOfflinePathway: offlineScore > 0.2,
    // Offline pathway content gets a massive flourishing bonus
    bonus: offlineScore > 0.5 ? 0.30 : offlineScore > 0.2 ? 0.15 : 0,
  };
}

// ── LONELINESS RISK ASSESSOR ─────────────────────────────────

/**
 * Assesses whether a user may be at risk of platform-induced
 * or platform-sustained loneliness.
 * These users need intervention — more genuine connection
 * content, less passive consumption, prompts to reach out.
 */
function assessLonelinessRisk(userProfile) {
  const {
    sessionPatterns      = {},
    connectionHistory    = {},
    contentPreferences   = {},
  } = userProfile;

  let riskScore = 0;

  // Behavioral signals
  if (sessionPatterns.avgDailyMinutes > 180)       riskScore += 0.20;
  if (sessionPatterns.passiveRatio > 0.85)         riskScore += 0.20;
  if (sessionPatterns.lateNightUsageRatio > 0.4)   riskScore += 0.15;
  if (connectionHistory.reciprocalInteractions < 3) riskScore += 0.20;

  // Content preference signals
  if (contentPreferences.parasocialRatio > 0.6)    riskScore += 0.15;
  if (contentPreferences.comfortLoopRatio > 0.7)   riskScore += 0.10;

  const riskLevel = riskScore > 0.6 ? 'high'
                  : riskScore > 0.4 ? 'moderate'
                  : riskScore > 0.2 ? 'low'
                  : 'none';

  return {
    riskScore: Math.round(riskScore * 100) / 100,
    riskLevel,
    signals: {
      excessiveUsage:      sessionPatterns.avgDailyMinutes > 180,
      primarilyPassive:    sessionPatterns.passiveRatio > 0.85,
      lateNightHeavy:      sessionPatterns.lateNightUsageRatio > 0.4,
      lowRealInteraction:  connectionHistory.reciprocalInteractions < 3,
      parasocialHeavy:     contentPreferences.parasocialRatio > 0.6,
    },
  };
}

// ── BRIDGE BUILDING SCORER ───────────────────────────────────

/**
 * Measures how well content bridges different groups.
 * Content that helps people across political, cultural, or
 * ideological lines understand each other is the rarest
 * and most valuable content for human survival.
 */
function measureBridgeBuilding(content, userProfile) {
  const { historicalSignals = {} } = content;
  const { perspectiveProfile = {} } = userProfile;

  // Does this content have cross-group appeal?
  const crossGroupEngagement = historicalSignals.crossGroupEngagementScore || 0;

  // Does it represent a perspective the user rarely sees?
  const contentPerspective = content.contentPerspective || 'unknown';
  const userExposure = perspectiveProfile[contentPerspective] || 0;
  const noveltyScore = Math.max(0, 1 - userExposure);

  // Is the tone respectful enough to actually bridge rather than inflame?
  const respectScore = historicalSignals.respectScore || 0.5;

  const bridgeScore = respectScore > 0.6
    ? (crossGroupEngagement * 0.5 + noveltyScore * 0.5)
    : crossGroupEngagement * 0.2; // Low respect = cannot bridge even if different

  return {
    score: Math.round(bridgeScore * 1000) / 1000,
    crossGroupEngagement,
    noveltyScore: Math.round(noveltyScore * 100) / 100,
    respectScore,
    isBridgeContent: bridgeScore > 0.5 && respectScore > 0.6,
  };
}

// ── COMPOSITE CONNECTION SCORE ───────────────────────────────

function computeConnectionScore(
  connectionType,
  reciprocityScore,
  depthScore,
  offlinePathway,
  lonelinessRisk,
  bridgeScore,
) {
  let score = 0;

  score += reciprocityScore.score * 0.25;
  score += depthScore.score       * 0.25;
  score += bridgeScore.score      * 0.20;
  score += connectionType.depth   * 0.15;
  score += connectionType.reciprocity * 0.15;

  // Offline pathway bonus
  score += offlinePathway.bonus;

  // Loneliness intervention: if user is lonely, boost genuine connection
  // content even harder — they need it most
  if (lonelinessRisk.riskLevel === 'high')     score *= 1.3;
  if (lonelinessRisk.riskLevel === 'moderate') score *= 1.15;

  // False connection penalty
  if (connectionType.category === 'false') score *= 0.4;

  return Math.max(0, Math.min(1, Math.round(score * 1000) / 1000));
}

function getFlourishingMultiplier(connectionType) {
  const { category, typeName } = connectionType;
  return CONNECTION_TYPES[category]?.[typeName]?.flourishingMultiplier || 1.0;
}

// ── CONNECTION INTERVENTIONS ─────────────────────────────────

/**
 * Generates gentle interventions for users who may be
 * substituting the platform for real human connection.
 * These are surfaced as UI suggestions — never forced.
 */
function generateConnectionInterventions(lonelinessRisk, connectionScore) {
  const interventions = [];

  if (lonelinessRisk.riskLevel === 'high') {
    interventions.push({
      type: 'reach_out_prompt',
      message: 'You haven\'t had a real conversation in a while. Is there someone you\'ve been meaning to reach out to?',
      priority: 'high',
    });
    interventions.push({
      type: 'local_community',
      message: 'There are people near you who share your interests.',
      priority: 'medium',
    });
  }

  if (lonelinessRisk.signals?.primarilyPassive) {
    interventions.push({
      type: 'participation_prompt',
      message: 'Your thoughts matter. What would you add to this conversation?',
      priority: 'low',
    });
  }

  if (lonelinessRisk.signals?.lateNightHeavy) {
    interventions.push({
      type: 'sleep_nudge',
      message: 'It\'s late. The people who care about you will still be here tomorrow.',
      priority: 'medium',
    });
  }

  return interventions;
}

// ── SOCIAL GRAPH ANALYZER ────────────────────────────────────

/**
 * Analyzes the user's social graph for connection health.
 * A healthy social graph has: depth (a few close connections),
 * breadth (some diverse connections), and reciprocity
 * (relationships go both ways).
 */
function analyzeSocialGraphHealth(userId, socialGraph = {}) {
  const {
    connections       = [],
    recentInteractions = [],
    mutualConnections  = 0,
  } = socialGraph;

  const totalConnections   = connections.length;
  const reciprocalCount    = connections.filter(c => c.isReciprocal).length;
  const deepConnections    = connections.filter(c => c.interactionDepth > 0.7).length;
  const diverseConnections = connections.filter(c => c.perspectiveDiversity > 0.5).length;

  // Dunbar number awareness — quality over quantity
  const optimalConnectionCount = 150;
  const connectionCountScore   = totalConnections < optimalConnectionCount
    ? totalConnections / optimalConnectionCount
    : 1 - ((totalConnections - optimalConnectionCount) / optimalConnectionCount) * 0.2;

  const graphHealthScore = (
    (reciprocalCount / Math.max(1, totalConnections)) * 0.35 +
    (deepConnections / Math.max(1, totalConnections)) * 0.35 +
    (diverseConnections / Math.max(1, totalConnections)) * 0.20 +
    Math.min(1, connectionCountScore) * 0.10
  );

  return {
    userId,
    graphHealthScore: Math.round(graphHealthScore * 1000) / 1000,
    totalConnections,
    reciprocalCount,
    deepConnections,
    diverseConnections,
    recommendation: graphHealthScore > 0.7
      ? 'Healthy social graph — maintain depth'
      : graphHealthScore > 0.4
        ? 'Moderate — focus on deepening existing connections'
        : 'Needs attention — prioritize reciprocal, deep connections',
  };
}

// ── EXPORTS ──────────────────────────────────────────────────

module.exports = {
  analyzeConnectionPotential,
  classifyConnectionType,
  measureReciprocity,
  measureConnectionDepth,
  detectOfflinePathway,
  assessLonelinessRisk,
  measureBridgeBuilding,
  generateConnectionInterventions,
  analyzeSocialGraphHealth,
  CONNECTION_TYPES,
  LONELINESS_SIGNALS,
};
