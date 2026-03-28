/**
 * ============================================================
 *  WELLBEING ANALYZER v0.1
 *  Human Survival Algorithm — Emotional Health Signal Engine
 *
 *  Purpose: Analyze content for its impact on human mental
 *  health, emotional tone, and psychological safety.
 *
 *  Philosophy: Content is not neutral. Every post either
 *  adds to or subtracts from a human's inner world.
 *  This engine measures that impact before it happens.
 * ============================================================
 */

// ── EMOTIONAL TONE TAXONOMY ──────────────────────────────────
// Two axes: Valence (positive/negative) + Arousal (calm/intense)
// We want high valence, calibrated arousal.
// Outrage = high arousal, negative valence → harmful
// Awe     = high arousal, positive valence → healing
// Calm    = low arousal,  positive valence → restorative

const EMOTIONAL_TAXONOMY = {

  // HEALING emotions — promote, amplify
  healing: {
    awe:          { valence: 0.95, arousal: 0.75, weight: 1.0  },
    gratitude:    { valence: 0.95, arousal: 0.40, weight: 1.0  },
    compassion:   { valence: 0.90, arousal: 0.50, weight: 1.0  },
    joy:          { valence: 0.90, arousal: 0.70, weight: 0.95 },
    hope:         { valence: 0.88, arousal: 0.55, weight: 0.95 },
    love:         { valence: 1.00, arousal: 0.60, weight: 1.0  },
    curiosity:    { valence: 0.80, arousal: 0.65, weight: 0.90 },
    serenity:     { valence: 0.85, arousal: 0.20, weight: 0.90 },
    inspiration:  { valence: 0.92, arousal: 0.72, weight: 0.95 },
    belonging:    { valence: 0.88, arousal: 0.45, weight: 1.0  },
  },

  // NEUTRAL emotions — pass through, context dependent
  neutral: {
    surprise:     { valence: 0.50, arousal: 0.70, weight: 0.50 },
    anticipation: { valence: 0.55, arousal: 0.60, weight: 0.50 },
    nostalgia:    { valence: 0.65, arousal: 0.35, weight: 0.55 },
    melancholy:   { valence: 0.40, arousal: 0.30, weight: 0.45 },
  },

  // HARMFUL emotions — demote, flag
  harmful: {
    outrage:      { valence: 0.05, arousal: 0.95, weight: -1.0  },
    envy:         { valence: 0.10, arousal: 0.60, weight: -0.90 },
    contempt:     { valence: 0.05, arousal: 0.65, weight: -0.95 },
    fear:         { valence: 0.10, arousal: 0.90, weight: -0.85 },
    shame:        { valence: 0.05, arousal: 0.55, weight: -0.80 },
    despair:      { valence: 0.02, arousal: 0.40, weight: -0.90 },
    disgust:      { valence: 0.08, arousal: 0.70, weight: -0.85 },
    tribal_rage:  { valence: 0.02, arousal: 0.98, weight: -1.0  },
  },
};

// ── PSYCHOLOGICAL SAFETY MARKERS ─────────────────────────────
// Patterns in content that signal psychological safety or danger

const SAFETY_MARKERS = {

  safe: [
    'growth_mindset',       // Framing challenges as opportunities
    'shared_humanity',      // Acknowledging common human experience
    'constructive_path',    // Problems presented with solutions
    'emotional_validation', // Acknowledging feelings without amplifying
    'nuanced_complexity',   // Acknowledging that things are complicated
    'agency_restoration',   // Empowering the reader to act
  ],

  unsafe: [
    'helplessness_induction',  // "Nothing can be done"
    'identity_threat',         // Attacking core sense of self
    'catastrophizing',         // Worst case as inevitable
    'dehumanization',          // Removing humanity from any group
    'comparison_trap',         // Designed to induce inadequacy
    'manufactured_urgency',    // False time pressure to act/react
    'isolation_framing',       // "You are alone in this"
    'dependency_creation',     // Content designed to be needed daily
  ],
};

// ── WELLBEING SIGNAL ANALYZER ────────────────────────────────

/**
 * Main entry point. Analyzes content for wellbeing impact.
 *
 * @param {Object} content       - Content to analyze
 * @param {Object} userState     - Current user mental state
 * @param {Object} sessionData   - Current session context
 * @returns {Object} Wellbeing analysis result
 */
function analyzeWellbeing(content, userState = {}, sessionData = {}) {

  // Run all sub-analyzers in parallel (in production)
  const emotionalProfile  = analyzeEmotionalTone(content);
  const safetyProfile     = analyzePsychologicalSafety(content);
  const sessionImpact     = analyzeSessionImpact(content, sessionData);
  const vulnerabilityRisk = analyzeVulnerabilityRisk(content, userState);
  const afterglowScore    = estimateAfterglowScore(content);

  // Compute composite wellbeing score
  const wellbeingScore = computeWellbeingScore(
    emotionalProfile,
    safetyProfile,
    sessionImpact,
    vulnerabilityRisk,
    afterglowScore,
  );

  return {
    wellbeingScore,             // 0.0 - 1.0
    emotionalProfile,
    safetyProfile,
    sessionImpact,
    vulnerabilityRisk,
    afterglowScore,
    flags: extractFlags(safetyProfile, emotionalProfile),
    recommendation: generateRecommendation(wellbeingScore, content),
  };
}

// ── EMOTIONAL TONE ANALYZER ──────────────────────────────────

/**
 * Identifies the dominant emotional signature of content.
 * In production: fine-tuned transformer model (RoBERTa base)
 * trained on human-labeled emotional content.
 */
function analyzeEmotionalTone(content) {
  const { historicalSignals = {} } = content;

  // Aggregate detected emotions from ML model output
  const detectedEmotions = historicalSignals.detectedEmotions || {};

  let healingScore   = 0;
  let harmfulScore   = 0;
  let dominantEmotion = 'neutral';
  let highestIntensity = 0;

  // Score healing emotions
  for (const [emotion, profile] of Object.entries(EMOTIONAL_TAXONOMY.healing)) {
    const intensity = detectedEmotions[emotion] || 0;
    healingScore += intensity * profile.weight;
    if (intensity > highestIntensity) {
      highestIntensity = intensity;
      dominantEmotion = emotion;
    }
  }

  // Score harmful emotions
  for (const [emotion, profile] of Object.entries(EMOTIONAL_TAXONOMY.harmful)) {
    const intensity = detectedEmotions[emotion] || 0;
    harmfulScore += intensity * Math.abs(profile.weight);
    if (intensity > highestIntensity) {
      highestIntensity = intensity;
      dominantEmotion = emotion;
    }
  }

  const netEmotionalScore = Math.max(0,
    Math.min(1, (healingScore - harmfulScore * 1.5 + 1) / 2)
  );

  return {
    dominantEmotion,
    healingScore:    Math.round(healingScore   * 100) / 100,
    harmfulScore:    Math.round(harmfulScore   * 100) / 100,
    netEmotionalScore: Math.round(netEmotionalScore * 1000) / 1000,
    detectedEmotions,
  };
}

// ── PSYCHOLOGICAL SAFETY ANALYZER ────────────────────────────

/**
 * Checks content for psychological safety and danger markers.
 * Looks at framing, not just topic — a post about grief can be
 * deeply healing; a post about success can induce shame.
 */
function analyzePsychologicalSafety(content) {
  const { historicalSignals = {} } = content;
  const detectedMarkers = historicalSignals.safetyMarkers || {};

  const safeMarkers    = [];
  const unsafeMarkers  = [];

  for (const marker of SAFETY_MARKERS.safe) {
    if (detectedMarkers[marker] > 0.5) safeMarkers.push(marker);
  }

  for (const marker of SAFETY_MARKERS.unsafe) {
    if (detectedMarkers[marker] > 0.4) unsafeMarkers.push(marker);
  }

  // Unsafe markers carry heavier weight — harm is harder to undo than good
  const safetyScore = Math.max(0, Math.min(1,
    0.5
    + (safeMarkers.length   * 0.08)
    - (unsafeMarkers.length * 0.15)
  ));

  return {
    safetyScore: Math.round(safetyScore * 1000) / 1000,
    safeMarkers,
    unsafeMarkers,
    isFlagged: unsafeMarkers.length > 2,
  };
}

// ── SESSION IMPACT ANALYZER ──────────────────────────────────

/**
 * Considers what the user has already consumed this session.
 * A single sad post is fine; the 10th sad post in a row is harmful.
 * Context-awareness prevents emotional pile-ons.
 */
function analyzeSessionImpact(content, sessionData) {
  const {
    sessionEmotionalBalance = 0.5,  // Current emotional state of session
    consecutiveLowMoodContent = 0,   // How many low-mood items in a row
    sessionDuration = 0,             // Seconds
  } = sessionData;

  // Detect if adding this content would create an emotional spiral
  const wouldDeepen = (
    sessionEmotionalBalance < 0.4 &&
    consecutiveLowMoodContent > 2
  );

  // Long sessions with low emotional balance are a warning sign
  const sessionStressScore = sessionDuration > 30 * 60
    ? Math.max(0, 1 - sessionEmotionalBalance)
    : 0;

  return {
    wouldDeepenNegativeSpiral: wouldDeepen,
    sessionStressScore: Math.round(sessionStressScore * 100) / 100,
    recommendation: wouldDeepen
      ? 'hold — user needs a pattern break before more heavy content'
      : 'clear',
  };
}

// ── VULNERABILITY RISK ANALYZER ──────────────────────────────

/**
 * Some users are in vulnerable states — grief, crisis, low mood.
 * Content that's fine for a stable user can be harmful for them.
 * This layer provides a vulnerability-aware safety net.
 *
 * IMPORTANT: This does NOT restrict what users can see.
 * It adjusts ranking only — users can always seek content
 * they want. We just don't push harmful content at vulnerable people.
 */
function analyzeVulnerabilityRisk(content, userState) {
  const {
    currentMoodScore    = 0.5,
    recentCrisisSignals = false,
    sensitiveTopics     = [],
  } = userState;

  const { historicalSignals = {} } = content;
  const contentSensitiveTopics = historicalSignals.sensitiveTopics || [];

  // Check for overlap between user's sensitive topics and content topics
  const topicOverlap = sensitiveTopics.filter(t =>
    contentSensitiveTopics.includes(t)
  ).length;

  const vulnerabilityScore = recentCrisisSignals
    ? 0.9   // High vulnerability — apply strong filters
    : currentMoodScore < 0.3
      ? 0.7 // Moderate vulnerability
      : currentMoodScore < 0.5
        ? 0.4 // Mild vulnerability
        : 0.1; // Stable

  const riskLevel = vulnerabilityScore > 0.6
    ? 'high'
    : vulnerabilityScore > 0.3
      ? 'moderate'
      : 'low';

  return {
    vulnerabilityScore: Math.round(vulnerabilityScore * 100) / 100,
    riskLevel,
    topicOverlapCount: topicOverlap,
    requiresExtraScrutiny: riskLevel === 'high' && topicOverlap > 0,
  };
}

// ── AFTERGLOW SCORE ──────────────────────────────────────────

/**
 * The most important metric: how does the user feel
 * 10 minutes AFTER consuming this content?
 *
 * This is measured via opt-in mood check-ins and fed back
 * into the system as the ground truth signal.
 *
 * Short-term dopamine hit vs long-term flourishing are
 * often opposites — this captures the difference.
 */
function estimateAfterglowScore(content) {
  const { historicalSignals = {} } = content;

  // Historical afterglow: average mood score reported by users
  // 10-15 minutes after consuming this content type
  const historicalAfterglowScore = historicalSignals.afterglowScore;

  if (historicalAfterglowScore !== undefined) {
    return {
      score: historicalAfterglowScore,
      confidence: historicalSignals.afterglowSampleSize > 100 ? 'high' : 'low',
      source: 'historical',
    };
  }

  // No historical data — estimate from emotional profile
  return {
    score: 0.5,   // Neutral default until data exists
    confidence: 'none',
    source: 'estimated',
  };
}

// ── COMPOSITE SCORE CALCULATOR ───────────────────────────────

function computeWellbeingScore(
  emotionalProfile,
  safetyProfile,
  sessionImpact,
  vulnerabilityRisk,
  afterglowScore,
) {
  let score = 0;

  // Afterglow is the ground truth — highest weight
  score += (afterglowScore.score || 0.5) * 0.35;

  // Emotional tone
  score += emotionalProfile.netEmotionalScore * 0.25;

  // Psychological safety
  score += safetyProfile.safetyScore * 0.20;

  // Session context penalty
  if (sessionImpact.wouldDeepenNegativeSpiral) score *= 0.5;
  score -= sessionImpact.sessionStressScore * 0.10;

  // Vulnerability penalty
  if (vulnerabilityRisk.requiresExtraScrutiny) score *= 0.4;
  score -= vulnerabilityRisk.vulnerabilityScore * 0.10;

  return Math.max(0, Math.min(1, Math.round(score * 1000) / 1000));
}

// ── FLAG EXTRACTOR ───────────────────────────────────────────

function extractFlags(safetyProfile, emotionalProfile) {
  const flags = [];

  if (safetyProfile.isFlagged) {
    flags.push({
      type: 'psychological_safety',
      severity: 'high',
      markers: safetyProfile.unsafeMarkers,
    });
  }

  if (emotionalProfile.harmfulScore > 0.6) {
    flags.push({
      type: 'emotional_harm',
      severity: emotionalProfile.harmfulScore > 0.8 ? 'critical' : 'moderate',
      emotion: emotionalProfile.dominantEmotion,
    });
  }

  return flags;
}

// ── RECOMMENDATION GENERATOR ─────────────────────────────────

function generateRecommendation(score, content) {
  if (score > 0.80) return 'amplify — high flourishing content';
  if (score > 0.60) return 'promote — positive wellbeing signal';
  if (score > 0.40) return 'neutral — no boost or penalty';
  if (score > 0.20) return 'demote — low wellbeing signal';
  return 'suppress — potential harm detected';
}

// ── MOOD CHECK-IN PROCESSOR ──────────────────────────────────

/**
 * Processes opt-in user mood check-ins.
 * These are the most valuable data points in the entire system —
 * direct human reporting of how content made them feel.
 *
 * Used to:
 * 1. Update afterglow scores for content types
 * 2. Adjust user vulnerability state
 * 3. Feed the evolution loop in flourishing_score.js
 */
function processMoodCheckIn(userId, checkIn) {
  const {
    timestamp,
    moodBefore,           // 0.0 - 1.0 (asked before session)
    moodAfter,            // 0.0 - 1.0 (asked 10min after session)
    contentConsumed,      // Array of content IDs in this session
    voluntaryFeedback,    // Optional free text
  } = checkIn;

  const moodDelta = moodAfter - moodBefore;

  // Attribute mood change to content consumed
  // Simple model: distribute attribution equally across session content
  // Production model: weight by recency and emotional intensity
  const attributionPerItem = moodDelta / (contentConsumed.length || 1);

  const attributions = contentConsumed.map(contentId => ({
    contentId,
    userId,
    moodDelta: attributionPerItem,
    timestamp,
    confidence: contentConsumed.length < 5 ? 'high' : 'low',
  }));

  return {
    userId,
    sessionMoodDelta: moodDelta,
    attributions,
    voluntaryFeedback,
    // Flag for human review if large negative delta
    requiresReview: moodDelta < -0.3,
  };
}

// ── EXPORTS ──────────────────────────────────────────────────

module.exports = {
  analyzeWellbeing,
  analyzeEmotionalTone,
  analyzePsychologicalSafety,
  analyzeSessionImpact,
  analyzeVulnerabilityRisk,
  estimateAfterglowScore,
  processMoodCheckIn,
  EMOTIONAL_TAXONOMY,
  SAFETY_MARKERS,
};
