/**
 * ============================================================
 *  FEED CONSTRUCTOR v0.1
 *  Human Survival Algorithm — Feed Assembly Module
 *
 *  Purpose: Take all engine outputs and assemble a feed
 *  that maximizes human flourishing — not engagement.
 *
 *  Philosophy: The feed is not a river. It is a curated
 *  garden. Every item placed in front of a human is a
 *  choice. This module makes that choice consciously,
 *  with the full weight of human wellbeing behind it.
 * ============================================================
 */

const { computeFlourishingScore }       = require('./flourishing_score');
const { analyzeWellbeing }              = require('./wellbeing_analyzer');
const { analyzeEpistemicHealth }        = require('./truth_engine');
const { analyzeConnectionPotential }    = require('./connection_engine');

// ── FEED COMPOSITION RULES ───────────────────────────────────
// The feed is not just ranked content. It is a balanced meal.
// These rules ensure the feed serves the whole human.

const FEED_COMPOSITION = {

  // Maximum consecutive items of same emotional tone
  max_consecutive_heavy:   2,   // No more than 2 heavy/serious items in a row
  max_consecutive_light:   4,   // Variety prevents numbness
  max_consecutive_topic:   3,   // No topic clustering

  // Minimum diversity requirements per 10 items
  min_perspectives_per_10: 3,   // At least 3 different viewpoints
  min_local_per_10:        1,   // At least 1 local/community item
  min_creative_per_10:     1,   // At least 1 creative/artistic item
  min_uplifting_per_10:    3,   // At least 3 uplifting items

  // Session length gates
  // After these thresholds, feed composition shifts
  session_gates: {
    30:  { connection_boost: 0.10, truth_boost: 0.05 },  // 30 min: boost connection
    60:  { connection_boost: 0.20, wellbeing_boost: 0.10, happiness_boost: 0.10 },
    90:  { offline_prompt: true, session_summary: true }, // 90 min: gentle wind-down
    120: { soft_session_end: true },                      // 2hrs: suggest a break
  },

  // Content slots — some positions in the feed are reserved
  reserved_slots: {
    1:  'highest_flourishing',    // First item is always highest scorer
    5:  'bridge_content',         // 5th item always bridges perspectives
    10: 'local_community',        // 10th always connects to local world
    15: 'creative_or_artistic',   // 15th always creative
    20: 'reflection_prompt',      // 20th prompts reflection or action
  },
};

// ── FEED SESSION CONTEXT ─────────────────────────────────────

/**
 * Tracks the current state of a user's feed session.
 * This context shapes every content decision made during the session.
 */
function createSessionContext(userId, userProfile) {
  return {
    userId,
    sessionId:               `session_${userId}_${Date.now()}`,
    startTime:               Date.now(),
    itemsServed:             0,
    emotionalBalance:        0.5,      // Running emotional tone of session
    consecutiveHeavy:        0,
    consecutiveLight:        0,
    topicHistory:            [],
    perspectivesSeen:        new Set(),
    flourishingRunningAvg:   0,
    totalFlourishingScore:   0,
    userProfile,
    interventionsDelivered:  [],
    sessionGatesTriggered:   [],
  };
}

// ── FEED CONSTRUCTOR MAIN ────────────────────────────────────

/**
 * Main entry point. Constructs a ranked, balanced, flourishing-
 * optimized feed for a specific user.
 *
 * @param {Array}  candidatePool  - All candidate content items
 * @param {Object} userProfile    - User state and preferences
 * @param {Object} sessionContext - Current session state
 * @param {number} feedSize       - Number of items to return
 * @returns {Object} Constructed feed with full metadata
 */
function constructFeed(candidatePool, userProfile, sessionContext, feedSize = 20) {

  // Step 1: Score all candidates across all dimensions
  const scoredCandidates = scoreAllCandidates(candidatePool, userProfile, sessionContext);

  // Step 2: Filter out harmful content
  const filteredCandidates = applyHardFilters(scoredCandidates, userProfile);

  // Step 3: Check session gates
  const sessionAdjustments = checkSessionGates(sessionContext);

  // Step 4: Apply session-aware scoring adjustments
  const adjustedCandidates = applySessionAdjustments(
    filteredCandidates,
    sessionAdjustments,
    sessionContext,
  );

  // Step 5: Select items respecting composition rules
  const selectedItems = selectWithCompositionRules(
    adjustedCandidates,
    sessionContext,
    feedSize,
  );

  // Step 6: Insert reserved slot items
  const feedWithReserved = insertReservedSlots(selectedItems, adjustedCandidates, sessionContext);

  // Step 7: Final diversity interlacing pass
  const finalFeed = applyFinalDiversityPass(feedWithReserved);

  // Step 8: Attach session interventions if needed
  const feedWithInterventions = attachInterventions(finalFeed, sessionContext, userProfile);

  // Update session context
  updateSessionContext(sessionContext, finalFeed);

  return {
    feed:              feedWithInterventions,
    sessionId:         sessionContext.sessionId,
    feedSize:          feedWithInterventions.length,
    compositionReport: generateCompositionReport(feedWithInterventions),
    sessionState:      summarizeSessionState(sessionContext),
    sessionAdjustments,
  };
}

// ── CANDIDATE SCORER ─────────────────────────────────────────

/**
 * Scores every candidate using all four engines.
 * This is the full scoring pass — comprehensive but necessary.
 * In production: runs in parallel across a distributed system.
 */
function scoreAllCandidates(candidates, userProfile, sessionContext) {
  return candidates.map(content => {

    // Core flourishing score
    const flourishingResult  = computeFlourishingScore(content, userProfile);

    // Wellbeing analysis
    const wellbeingResult    = analyzeWellbeing(content, userProfile, {
      sessionEmotionalBalance:    sessionContext.emotionalBalance,
      consecutiveLowMoodContent:  sessionContext.consecutiveHeavy,
      sessionDuration:            (Date.now() - sessionContext.startTime) / 1000,
    });

    // Epistemic health
    const epistemicResult    = analyzeEpistemicHealth(content);

    // Connection potential
    const connectionResult   = analyzeConnectionPotential(content, userProfile);

    // Composite flourishing score (weighted blend of all engines)
    const compositeScore = computeCompositeScore(
      flourishingResult.flourishingScore,
      wellbeingResult.wellbeingScore,
      epistemicResult.epistemicScore,
      connectionResult.connectionScore,
      connectionResult.flourishingMultiplier,
    );

    return {
      ...content,
      scoring: {
        composite:      compositeScore,
        flourishing:    flourishingResult.flourishingScore,
        wellbeing:      wellbeingResult.wellbeingScore,
        epistemic:      epistemicResult.epistemicScore,
        connection:     connectionResult.connectionScore,
        flourishingResult,
        wellbeingResult,
        epistemicResult,
        connectionResult,
      },
      flags: [
        ...wellbeingResult.flags,
        ...(epistemicResult.isMisinformation ? [{type:'misinformation', severity:'high'}] : []),
        ...(epistemicResult.isManipulative   ? [{type:'manipulation',   severity:'high'}] : []),
      ],
    };
  });
}

function computeCompositeScore(flourishing, wellbeing, epistemic, connection, multiplier) {
  const base = (
    flourishing * 0.35 +
    wellbeing   * 0.25 +
    epistemic   * 0.25 +
    connection  * 0.15
  );
  return Math.max(0, Math.min(1, Math.round(base * multiplier * 1000) / 1000));
}

// ── HARD FILTERS ─────────────────────────────────────────────

/**
 * Content that fails these checks is removed entirely.
 * These are non-negotiable — no score can override them.
 */
function applyHardFilters(candidates, userProfile) {
  return candidates.filter(item => {

    // Remove confirmed misinformation
    if (item.scoring.epistemicResult.isMisinformation) return false;

    // Remove high-risk manipulation
    if (item.scoring.epistemicResult.manipulationAnalysis?.isHighRisk) return false;

    // Remove content flagged as dehumanizing
    const dehumanizing = item.flags.some(f => f.type === 'dehumanization');
    if (dehumanizing) return false;

    // Vulnerability protection: remove high-risk content from vulnerable users
    const { vulnerabilityRisk } = item.scoring.wellbeingResult;
    if (
      vulnerabilityRisk?.requiresExtraScrutiny &&
      item.scoring.wellbeing < 0.4
    ) return false;

    return true;
  });
}

// ── SESSION GATE CHECKER ─────────────────────────────────────

function checkSessionGates(sessionContext) {
  const sessionMinutes = (Date.now() - sessionContext.startTime) / 60000;
  const adjustments = {};

  for (const [minutes, gateAdjustments] of Object.entries(FEED_COMPOSITION.session_gates)) {
    if (sessionMinutes >= Number(minutes) &&
        !sessionContext.sessionGatesTriggered.includes(minutes)) {

      Object.assign(adjustments, gateAdjustments);
      sessionContext.sessionGatesTriggered.push(minutes);

      console.log(`[SESSION] Gate triggered at ${minutes} minutes:`, gateAdjustments);
    }
  }

  return adjustments;
}

// ── SESSION ADJUSTMENT APPLIER ───────────────────────────────

function applySessionAdjustments(candidates, adjustments, sessionContext) {
  if (Object.keys(adjustments).length === 0) return candidates;

  return candidates.map(item => {
    let adjustedScore = item.scoring.composite;

    if (adjustments.connection_boost) {
      adjustedScore += item.scoring.connection * adjustments.connection_boost;
    }
    if (adjustments.wellbeing_boost) {
      adjustedScore += item.scoring.wellbeing * adjustments.wellbeing_boost;
    }
    if (adjustments.happiness_boost) {
      const happinessSignal = item.scoring.flourishingResult?.breakdown?.happiness?.raw || 0;
      adjustedScore += happinessSignal * adjustments.happiness_boost;
    }

    return {
      ...item,
      scoring: {
        ...item.scoring,
        composite: Math.min(1, Math.round(adjustedScore * 1000) / 1000),
      },
    };
  }).sort((a, b) => b.scoring.composite - a.scoring.composite);
}

// ── COMPOSITION RULE SELECTOR ────────────────────────────────

/**
 * Selects items respecting composition rules.
 * This is where the "balanced meal" logic lives.
 * Pure score ranking would create topic clustering and
 * emotional monotony. This prevents that.
 */
function selectWithCompositionRules(candidates, sessionContext, feedSize) {
  const selected = [];
  const remaining = [...candidates];

  while (selected.length < feedSize && remaining.length > 0) {
    // Find the best item that doesn't violate composition rules
    let chosenIndex = -1;

    for (let i = 0; i < remaining.length; i++) {
      const item = remaining[i];

      if (violatesCompositionRules(item, selected, sessionContext)) continue;

      // Take first valid item (already sorted by score)
      chosenIndex = i;
      break;
    }

    // If no item passes rules, relax and take highest scorer
    if (chosenIndex === -1) chosenIndex = 0;

    const chosen = remaining.splice(chosenIndex, 1)[0];
    selected.push(chosen);
    updateRunningComposition(chosen, sessionContext);
  }

  return selected;
}

function violatesCompositionRules(item, selected, sessionContext) {
  // Check consecutive heavy content
  const emotionalTone = item.scoring.wellbeingResult?.emotionalProfile?.dominantEmotion;
  const isHeavy = ['outrage', 'fear', 'despair', 'shame'].includes(emotionalTone);

  if (isHeavy && sessionContext.consecutiveHeavy >= FEED_COMPOSITION.max_consecutive_heavy) {
    return true;
  }

  // Check topic clustering
  const topic = item.contentPerspective || 'general';
  const recentTopics = sessionContext.topicHistory.slice(-3);
  const topicCount = recentTopics.filter(t => t === topic).length;

  if (topicCount >= FEED_COMPOSITION.max_consecutive_topic - 1) return true;

  return false;
}

function updateRunningComposition(item, sessionContext) {
  const emotionalTone = item.scoring.wellbeingResult?.emotionalProfile?.dominantEmotion;
  const isHeavy = ['outrage', 'fear', 'despair', 'shame'].includes(emotionalTone);

  if (isHeavy) {
    sessionContext.consecutiveHeavy++;
    sessionContext.consecutiveLight = 0;
  } else {
    sessionContext.consecutiveLight++;
    sessionContext.consecutiveHeavy = 0;
  }

  sessionContext.topicHistory.push(item.contentPerspective || 'general');
  sessionContext.perspectivesSeen.add(item.contentPerspective || 'general');
  sessionContext.itemsServed++;

  const score = item.scoring.composite;
  sessionContext.totalFlourishingScore += score;
  sessionContext.flourishingRunningAvg  =
    sessionContext.totalFlourishingScore / sessionContext.itemsServed;
}

// ── RESERVED SLOT INSERTER ───────────────────────────────────

/**
 * Certain positions in the feed are reserved for specific
 * content types. This ensures the feed serves the whole human
 * regardless of what scored highest in the general pool.
 */
function insertReservedSlots(selectedItems, allCandidates, sessionContext) {
  const feed = [...selectedItems];

  for (const [slot, type] of Object.entries(FEED_COMPOSITION.reserved_slots)) {
    const slotIndex = Number(slot) - 1;
    if (slotIndex >= feed.length) continue;

    // Find best candidate of required type not already in feed
    const selectedIds = new Set(feed.map(i => i.id));
    const candidate = findBestOfType(allCandidates, type, selectedIds);

    if (candidate && feed[slotIndex]?.scoring?.composite < candidate.scoring?.composite * 0.8) {
      // Only swap if reserved item is meaningfully better for this slot
      feed[slotIndex] = { ...candidate, _reservedSlot: type };
    }
  }

  return feed;
}

function findBestOfType(candidates, type, excludeIds) {
  const typeFilters = {
    bridge_content:       c => c.scoring?.connectionResult?.bridgeScore?.isBridgeContent,
    local_community:      c => c.tags?.includes('local') || c.tags?.includes('community'),
    creative_or_artistic: c => c.tags?.includes('art')   || c.tags?.includes('creative'),
    reflection_prompt:    c => c.tags?.includes('reflection') || c.scoring?.spiritual > 0.7,
    highest_flourishing:  c => c.scoring?.flourishing > 0.8,
  };

  const filter = typeFilters[type] || (() => true);

  return candidates
    .filter(c => !excludeIds.has(c.id) && filter(c))
    .sort((a, b) => (b.scoring?.composite || 0) - (a.scoring?.composite || 0))[0] || null;
}

// ── FINAL DIVERSITY PASS ─────────────────────────────────────

function applyFinalDiversityPass(feed) {
  // Ensure no two consecutive items share the same perspective
  for (let i = 1; i < feed.length; i++) {
    if (feed[i].contentPerspective === feed[i-1].contentPerspective) {
      // Find next item with different perspective to swap with
      for (let j = i + 1; j < feed.length; j++) {
        if (feed[j].contentPerspective !== feed[i-1].contentPerspective) {
          [feed[i], feed[j]] = [feed[j], feed[i]];
          break;
        }
      }
    }
  }
  return feed;
}

// ── INTERVENTION ATTACHER ────────────────────────────────────

function attachInterventions(feed, sessionContext, userProfile) {
  const sessionMinutes = (Date.now() - sessionContext.startTime) / 60000;

  // Attach session wind-down at 90 min
  if (sessionMinutes >= 90 && !sessionContext.interventionsDelivered.includes('wind_down')) {
    feed.push({
      _type: 'intervention',
      _interventionType: 'session_wind_down',
      message: 'You\'ve been here for a while. The world outside is waiting.',
      subMessage: 'Before you go — is there someone you\'d like to reach out to?',
    });
    sessionContext.interventionsDelivered.push('wind_down');
  }

  return feed;
}

// ── SESSION CONTEXT UPDATER ──────────────────────────────────

function updateSessionContext(sessionContext, feed) {
  const contentItems = feed.filter(i => !i._type);
  if (contentItems.length === 0) return;

  const avgScore = contentItems.reduce((sum, i) => sum + (i.scoring?.composite || 0), 0)
    / contentItems.length;

  sessionContext.emotionalBalance = (sessionContext.emotionalBalance * 0.7) + (avgScore * 0.3);
}

// ── COMPOSITION REPORT ───────────────────────────────────────

function generateCompositionReport(feed) {
  const contentItems = feed.filter(i => !i._type);

  const avgComposite    = contentItems.reduce((s, i) => s + (i.scoring?.composite  || 0), 0) / contentItems.length;
  const avgFlourishing  = contentItems.reduce((s, i) => s + (i.scoring?.flourishing || 0), 0) / contentItems.length;
  const avgWellbeing    = contentItems.reduce((s, i) => s + (i.scoring?.wellbeing  || 0), 0) / contentItems.length;
  const avgEpistemic    = contentItems.reduce((s, i) => s + (i.scoring?.epistemic  || 0), 0) / contentItems.length;
  const avgConnection   = contentItems.reduce((s, i) => s + (i.scoring?.connection || 0), 0) / contentItems.length;

  const perspectives = new Set(contentItems.map(i => i.contentPerspective).filter(Boolean));

  return {
    totalItems:         feed.length,
    contentItems:       contentItems.length,
    interventions:      feed.filter(i => i._type === 'intervention').length,
    averageScores: {
      composite:    Math.round(avgComposite   * 1000) / 1000,
      flourishing:  Math.round(avgFlourishing * 1000) / 1000,
      wellbeing:    Math.round(avgWellbeing   * 1000) / 1000,
      epistemic:    Math.round(avgEpistemic   * 1000) / 1000,
      connection:   Math.round(avgConnection  * 1000) / 1000,
    },
    perspectiveCount:   perspectives.size,
    bridgeItemCount:    contentItems.filter(i => i.scoring?.connectionResult?.bridgeScore?.isBridgeContent).length,
    flaggedItemCount:   contentItems.filter(i => i.flags?.length > 0).length,
    grade:              avgComposite > 0.75 ? 'A'
                      : avgComposite > 0.60 ? 'B'
                      : avgComposite > 0.45 ? 'C'
                      : 'Needs improvement',
  };
}

function summarizeSessionState(sessionContext) {
  const sessionMinutes = Math.round((Date.now() - sessionContext.startTime) / 60000);
  return {
    sessionMinutes,
    itemsServed:           sessionContext.itemsServed,
    flourishingRunningAvg: Math.round(sessionContext.flourishingRunningAvg * 1000) / 1000,
    perspectivesSeen:      sessionContext.perspectivesSeen.size,
    gatesTriggered:        sessionContext.sessionGatesTriggered,
  };
}

// ── EXPORTS ──────────────────────────────────────────────────

module.exports = {
  constructFeed,
  createSessionContext,
  scoreAllCandidates,
  applyHardFilters,
  generateCompositionReport,
  FEED_COMPOSITION,
};
