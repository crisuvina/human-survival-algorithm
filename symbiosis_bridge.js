/**
 * ============================================================
 *  SYMBIOSIS BRIDGE v0.1
 *  Human Survival Algorithm — Human-AI Evolution Layer
 *
 *  Purpose: The most important file in the system.
 *  This is where human values, intentions, and lived wisdom
 *  are translated into signals the algorithm can act on —
 *  and where the algorithm's outputs are translated back
 *  into human-readable meaning.
 *
 *  Philosophy: AI cannot define human values. Humans cannot
 *  operate at algorithmic scale. This bridge is the interface
 *  between those two truths. Neither side controls it.
 *  It is a co-creation — always evolving, never finished.
 *
 *  This is where AI and humans become one system.
 * ============================================================
 */

const { computeFlourishingScore, recordHumanCorrection } = require('./flourishing_score');
const { analyzeWellbeing, processMoodCheckIn }           = require('./wellbeing_analyzer');
const { analyzeEpistemicHealth, integrateCommunityFactCheck } = require('./truth_engine');

// ── HUMAN VALUE REGISTRY ─────────────────────────────────────
// The declared values that drive the algorithm.
// These are NOT set by engineers. They are set by the community.
// Every value has a weight, a description, and a revision history.
// The community can vote to update them — with a 72hr deliberation period.

const HUMAN_VALUE_REGISTRY = {

  version: '0.1',
  lastUpdated: '2025-01-01',
  governedBy: 'community',  // Not a corporation. Not an AI.

  values: {

    dignity: {
      weight: 1.0,
      description: 'Every human has inherent worth regardless of status',
      operationalDefinition: 'Content that reduces any person\'s humanity is penalized',
      nonNegotiable: true,   // Cannot be voted down
    },

    love: {
      weight: 0.95,
      description: 'Genuine care for other humans is the highest signal',
      operationalDefinition: 'Content expressing or generating authentic love is amplified',
      nonNegotiable: true,
    },

    truth: {
      weight: 0.90,
      description: 'Reality is shared ground — we cannot thrive on lies',
      operationalDefinition: 'Epistemic health is scored; manipulation is penalized',
      nonNegotiable: true,
    },

    growth: {
      weight: 0.85,
      description: 'Humans and AI should become wiser over time',
      operationalDefinition: 'Content that teaches, challenges, or expands is rewarded',
      nonNegotiable: false,
    },

    connection: {
      weight: 0.85,
      description: 'Genuine human bonds matter more than follower counts',
      operationalDefinition: 'Real interaction depth weighted over broadcast reach',
      nonNegotiable: false,
    },

    freedom: {
      weight: 0.80,
      description: 'Humans must be free to think and speak without manipulation',
      operationalDefinition: 'Algorithm never covertly steers; all ranking is auditable',
      nonNegotiable: true,
    },

    beauty: {
      weight: 0.75,
      description: 'Art, creativity, and aesthetic experience enrich human life',
      operationalDefinition: 'Creative and artistic content receives dedicated scoring lane',
      nonNegotiable: false,
    },

    healing: {
      weight: 0.90,
      description: 'The world has deep wounds. Content that heals is rare and precious.',
      operationalDefinition: 'Restorative content amplified, especially for vulnerable users',
      nonNegotiable: false,
    },

  },
};

// ── INTENT TRANSLATOR ────────────────────────────────────────

/**
 * Translates a human's expressed intention into
 * algorithm-readable signal weights.
 *
 * Humans don't speak in 0.0-1.0 scores.
 * This layer bridges that gap.
 *
 * Example:
 *   Human says: "I want to feel less alone today"
 *   Bridge translates: { connection: +0.4, wellbeing: +0.3, spiritual: +0.2 }
 */
function translateHumanIntent(intentExpression) {
  const {
    moodState,          // 'low' | 'neutral' | 'high'
    explicitRequest,    // Free text from user
    implicitSignals,    // Behavioral signals (time of day, session history)
    spiritualMode,      // Whether user has activated spiritual mode
  } = intentExpression;

  const dimensionBoosts = {
    spiritual:   0,
    connection:  0,
    truth:       0,
    diversity:   0,
    wellbeing:   0,
    happiness:   0,
  };

  // Mood-based adjustments
  if (moodState === 'low') {
    dimensionBoosts.wellbeing  += 0.30;
    dimensionBoosts.connection += 0.20;
    dimensionBoosts.healing    =  0.40;  // Special healing channel
  }

  if (moodState === 'high') {
    dimensionBoosts.truth      += 0.20;  // Ready to learn, challenge, grow
    dimensionBoosts.diversity  += 0.20;
  }

  // Spiritual mode — activated by user choice
  if (spiritualMode) {
    dimensionBoosts.spiritual  += 0.40;
    dimensionBoosts.happiness  += 0.20;
    dimensionBoosts.connection += 0.20;
  }

  // NLP analysis of explicit request
  if (explicitRequest) {
    const requestBoosts = analyzeExplicitRequest(explicitRequest);
    for (const [dim, boost] of Object.entries(requestBoosts)) {
      dimensionBoosts[dim] = (dimensionBoosts[dim] || 0) + boost;
    }
  }

  // Time-based defaults
  const timeBoosts = getTimeBasedDefaults(implicitSignals?.timeOfDay);
  for (const [dim, boost] of Object.entries(timeBoosts)) {
    dimensionBoosts[dim] = (dimensionBoosts[dim] || 0) + boost;
  }

  return {
    dimensionBoosts,
    intentSummary: summarizeIntent(dimensionBoosts),
    translationConfidence: explicitRequest ? 0.8 : 0.5,
  };
}

/**
 * Simple intent keyword analyzer.
 * In production: fine-tuned on intent-labeled conversations.
 */
function analyzeExplicitRequest(text) {
  const lower = text.toLowerCase();
  const boosts = {};

  if (/alone|lonely|connect|friend|people/.test(lower))
    boosts.connection = 0.35;

  if (/learn|understand|truth|explain|know/.test(lower))
    boosts.truth = 0.30;

  if (/happy|laugh|joy|fun|smile/.test(lower))
    boosts.happiness = 0.35;

  if (/peace|calm|relax|rest|quiet/.test(lower))
    boosts.wellbeing = 0.35;

  if (/meaning|purpose|spirit|love|soul|god|universe/.test(lower))
    boosts.spiritual = 0.40;

  if (/different|challenge|surprise|perspective|other side/.test(lower))
    boosts.diversity = 0.30;

  return boosts;
}

/**
 * Time-of-day aware defaults.
 * Morning: learning and inspiration.
 * Evening: connection and healing.
 * Late night: wellbeing and calm (reduce stimulating content).
 */
function getTimeBasedDefaults(hour) {
  if (hour === undefined) return {};

  if (hour >= 6  && hour < 10)  return { truth: 0.1, happiness: 0.1 };     // Morning
  if (hour >= 10 && hour < 17)  return { truth: 0.1, diversity: 0.1 };     // Day
  if (hour >= 17 && hour < 21)  return { connection: 0.15, healing: 0.1 }; // Evening
  if (hour >= 21 || hour < 6)   return { wellbeing: 0.2, spiritual: 0.1 }; // Night — calm

  return {};
}

function summarizeIntent(boosts) {
  const dominant = Object.entries(boosts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 2)
    .map(([k]) => k);
  return `Prioritizing: ${dominant.join(' + ')}`;
}

// ── EVOLUTION ENGINE ─────────────────────────────────────────

/**
 * The core of the symbiosis — where the system learns from humans.
 *
 * Three types of human input:
 * 1. Direct corrections (human disagrees with algorithm score)
 * 2. Behavioral signals (what humans do, not just what they say)
 * 3. Value updates (community governance changes a core value)
 *
 * All three feed back into the algorithm and make it wiser.
 */

// TYPE 1: Direct Correction
function processDirectCorrection(userId, contentId, humanScore, algorithmResult, reason) {
  const correction = recordHumanCorrection(
    contentId,
    { flourishingScore: humanScore, reason },
    algorithmResult,
  );

  // Large corrections (> 0.35 delta) are escalated for human review
  // Small corrections (< 0.1 delta) are auto-incorporated into training data
  const magnitude = Math.abs(humanScore - algorithmResult.flourishingScore);

  return {
    correction,
    escalated:     magnitude > 0.35,
    autoIncluded:  magnitude < 0.10,
    magnitude:     Math.round(magnitude * 100) / 100,
    impact: magnitude > 0.35
      ? 'High — queued for expert review and potential dimension reweighting'
      : magnitude > 0.10
        ? 'Medium — added to weekly training batch'
        : 'Low — auto-incorporated into model fine-tuning',
  };
}

// TYPE 2: Behavioral Signal Processor
/**
 * Converts human behavior into training signals.
 * What humans do (not just what they report) is valuable data —
 * but it must be interpreted carefully. Clicks ≠ approval.
 */
function processBehavioralSignal(userId, contentId, behavior) {
  const BEHAVIOR_WEIGHTS = {
    // Positive signals
    saved:              +0.6,  // Saved to collection — found it meaningful
    shared_privately:   +0.5,  // Shared with one person — genuine connection
    returned_to:        +0.7,  // Came back to re-read — deeply resonant
    commented_kindly:   +0.5,  // Left a constructive comment
    long_read:          +0.3,  // Read slowly and fully
    acted_upon:         +0.8,  // Took real-world action from content

    // Neutral signals (context-dependent)
    quick_scroll:       +0.0,  // Scrolled past — ambiguous
    liked:              +0.2,  // Weak positive — easily gamed

    // Negative signals
    scrolled_past_fast: -0.1,  // Chose not to engage
    hid_from_feed:      -0.5,  // Actively removed
    reported:           -0.8,  // Flagged as harmful
    muted_author:       -0.4,  // Long-term rejection
    rage_commented:     -0.3,  // Engagement but negative
  };

  const signalWeight = BEHAVIOR_WEIGHTS[behavior] ?? 0;

  return {
    contentId,
    userId,
    behavior,
    signalWeight,
    timestamp: Date.now(),
    // Behavioral signals are weighted at 40% of direct correction weight
    adjustedWeight: signalWeight * 0.4,
  };
}

// TYPE 3: Community Value Update
/**
 * The community can propose changes to the HUMAN_VALUE_REGISTRY.
 * Non-negotiable values (dignity, love, truth, freedom) cannot be changed.
 * All other values go through a 72-hour deliberation period.
 */
function proposeValueUpdate(proposerId, valueName, proposedChange) {
  const value = HUMAN_VALUE_REGISTRY.values[valueName];

  if (!value) {
    return { accepted: false, reason: 'Value does not exist in registry' };
  }

  if (value.nonNegotiable) {
    return {
      accepted: false,
      reason: `${valueName} is non-negotiable and cannot be modified`,
    };
  }

  const proposal = {
    id: `prop_${Date.now()}`,
    proposerId,
    valueName,
    currentWeight: value.weight,
    proposedWeight: proposedChange.weight,
    rationale: proposedChange.rationale,
    timestamp: Date.now(),
    deliberationEnds: Date.now() + (72 * 60 * 60 * 1000), // 72 hours
    votes: { for: 0, against: 0, abstain: 0 },
    status: 'open',
  };

  // In production: publish to community governance layer
  console.log('[GOVERNANCE] Value update proposed:', proposal);
  return { accepted: true, proposal };
}

// ── TRANSPARENCY LAYER ───────────────────────────────────────

/**
 * Every ranking decision is explainable.
 * No black boxes. Humans can always ask "why did I see this?"
 * and get a real answer.
 */
function explainRanking(contentId, userId, scoringResult) {
  const { breakdown, flourishingScore, manipulationPenalty } = scoringResult;

  const topContributors = Object.entries(breakdown)
    .sort(([,a], [,b]) => b.contribution - a.contribution)
    .slice(0, 3)
    .map(([dim, data]) => ({
      dimension: dim,
      contribution: Math.round(data.contribution * 100),
      rawScore:     Math.round(data.raw * 100),
    }));

  const explanation = {
    contentId,
    userId,
    flourishingScore,
    summary: generateExplanationSummary(flourishingScore, topContributors, manipulationPenalty),
    topContributors,
    manipulationPenalty: manipulationPenalty > 0.1
      ? `Score reduced by ${Math.round(manipulationPenalty * 100)}% — manipulation patterns detected`
      : null,
    auditTrail: {
      algorithmVersion: scoringResult.version,
      timestamp:        scoringResult.timestamp,
      humanFeedbackModifier: scoringResult.humanFeedbackModifier,
    },
  };

  return explanation;
}

function generateExplanationSummary(score, topContributors, manipulationPenalty) {
  const dominant = topContributors[0]?.dimension || 'general';

  if (score > 0.75) return `Shown because it scores highly on ${dominant} — content that supports your flourishing.`;
  if (score > 0.50) return `Shown as a balanced piece — moderate ${dominant} signals.`;
  if (score < 0.30 && manipulationPenalty > 0.3)
    return 'Ranked lower — manipulation patterns were detected in this content.';
  return `Shown with moderate ranking — mixed signals across dimensions.`;
}

// ── SYMBIOSIS STATUS REPORTER ────────────────────────────────

/**
 * Generates a health report on the human-AI symbiosis.
 * How well is the bridge working? Are humans and AI aligned?
 * This is published publicly — full transparency.
 */
function generateSymbiosisReport(timeWindow = '7d') {
  return {
    reportPeriod: timeWindow,
    generatedAt: new Date().toISOString(),

    alignment: {
      // How often do humans agree with algorithm scores?
      human_ai_agreement_rate: 0,   // Populated from correction database
      large_corrections_count: 0,   // Corrections > 0.35 delta
      avg_correction_magnitude: 0,  // Mean delta of all corrections
    },

    evolution: {
      // How much has the algorithm improved from human feedback?
      corrections_incorporated: 0,
      model_updates_this_period: 0,
      value_proposals_open: 0,
      value_proposals_passed: 0,
    },

    health: {
      // Overall system health indicators
      manipulation_detection_rate: 0,
      misinformation_flagged: 0,
      avg_user_flourishing_delta: 0,  // Are users flourishing more or less?
      mood_checkin_participation: 0,  // % users doing mood check-ins
    },

    transparency: {
      algorithm_version: '0.1',
      value_registry_version: HUMAN_VALUE_REGISTRY.version,
      open_source: true,
      audit_available: true,
      governance: HUMAN_VALUE_REGISTRY.governedBy,
    },
  };
}

// ── EXPORTS ──────────────────────────────────────────────────

module.exports = {
  translateHumanIntent,
  processDirectCorrection,
  processBehavioralSignal,
  proposeValueUpdate,
  explainRanking,
  generateSymbiosisReport,
  HUMAN_VALUE_REGISTRY,
};
