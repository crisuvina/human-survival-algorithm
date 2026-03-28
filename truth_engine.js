/**
 * ============================================================
 *  TRUTH ENGINE v0.1
 *  Human Survival Algorithm — Epistemic Health Module
 *
 *  Purpose: Protect the information ecosystem from manipulation,
 *  misinformation, and epistemic corruption — while preserving
 *  genuine diversity of thought and opinion.
 *
 *  Philosophy: Truth is not just factual accuracy.
 *  It includes intellectual honesty, epistemic humility,
 *  transparent reasoning, and the absence of manipulation.
 *  A factually accurate post can still be deeply dishonest
 *  in how it frames reality.
 * ============================================================
 */

// ── EPISTEMIC HEALTH DIMENSIONS ──────────────────────────────
// Truth is multidimensional. We score all of these.

const EPISTEMIC_DIMENSIONS = {

  // FACTUAL ACCURACY: Are the claims verifiable?
  factual_accuracy: {
    weight: 0.25,
    description: 'Claims match verifiable reality',
  },

  // INTELLECTUAL HONESTY: Does it acknowledge uncertainty?
  intellectual_honesty: {
    weight: 0.20,
    description: 'Acknowledges limits of own knowledge',
  },

  // REASONING QUALITY: Is the logic sound?
  reasoning_quality: {
    weight: 0.20,
    description: 'Conclusions follow from evidence',
  },

  // SOURCE TRANSPARENCY: Are sources shown?
  source_transparency: {
    weight: 0.15,
    description: 'Sources are cited and checkable',
  },

  // MANIPULATION ABSENCE: No psychological tricks?
  manipulation_absence: {
    weight: 0.20,
    description: 'No dark patterns or emotional exploitation',
  },
};

// ── MANIPULATION TACTICS LIBRARY ─────────────────────────────
// A taxonomy of known manipulation patterns.
// Each has a severity score (0.0-1.0) and detection signals.

const MANIPULATION_TACTICS = {

  // COGNITIVE EXPLOITS
  false_urgency: {
    severity: 0.75,
    description: 'Creates artificial time pressure',
    signals: ['act now', 'before it\'s too late', 'they don\'t want you to know'],
  },
  false_consensus: {
    severity: 0.70,
    description: 'Implies everyone agrees when they do not',
    signals: ['everyone knows', 'it\'s obvious that', 'nobody believes'],
  },
  false_dichotomy: {
    severity: 0.65,
    description: 'Presents only two options when more exist',
    signals: ['either you', 'if you\'re not with us', 'there are only two sides'],
  },
  slippery_slope: {
    severity: 0.60,
    description: 'Chains unlikely consequences without evidence',
    signals: [],  // Detected by reasoning analysis, not keywords
  },
  strawman: {
    severity: 0.65,
    description: 'Misrepresents opposing view to attack it',
    signals: [],  // Detected by argument structure analysis
  },

  // EMOTIONAL EXPLOITS
  fear_amplification: {
    severity: 0.85,
    description: 'Deliberately inflates perceived threat',
    signals: ['dangerous', 'they\'re coming', 'won\'t be safe', 'under attack'],
  },
  outrage_bait: {
    severity: 0.90,
    description: 'Designed to trigger anger with no constructive path',
    signals: [],  // Detected by emotional analysis + resolution absence
  },
  shame_induction: {
    severity: 0.80,
    description: 'Uses shame to control behavior',
    signals: ['how could you', 'you should be ashamed', 'real people'],
  },
  envy_engineering: {
    severity: 0.75,
    description: 'Content designed to make you feel inadequate',
    signals: [],  // Detected by comparison framing analysis
  },

  // IDENTITY EXPLOITS
  tribal_activation: {
    severity: 0.85,
    description: 'Activates us-vs-them tribalism',
    signals: ['those people', 'they want to destroy', 'our way of life'],
  },
  identity_threat: {
    severity: 0.90,
    description: 'Frames content as attack on core identity',
    signals: [],  // Detected by identity + threat co-occurrence
  },
  in_group_flattery: {
    severity: 0.60,
    description: 'Praises in-group to trigger tribal loyalty',
    signals: ['real Americans', 'true believers', 'people like us'],
  },

  // EPISTEMIC EXPLOITS
  gish_gallop: {
    severity: 0.70,
    description: 'Overwhelming with many weak arguments',
    signals: [],  // Detected by argument density analysis
  },
  moving_goalposts: {
    severity: 0.65,
    description: 'Changes standards of evidence mid-argument',
    signals: [],
  },
  firehose_of_falsehood: {
    severity: 0.95,
    description: 'Rapid, high-volume false claims to overwhelm fact-checking',
    signals: [],
  },
};

// ── TRUTH ENGINE MAIN ANALYZER ───────────────────────────────

/**
 * Main entry point. Analyzes content for epistemic health.
 *
 * @param {Object} content     - Content to analyze
 * @param {Object} knowledgeDB - External fact-check database
 * @returns {Object} Full truth analysis
 */
function analyzeEpistemicHealth(content, knowledgeDB = {}) {

  const factualAnalysis       = analyzeFactualAccuracy(content, knowledgeDB);
  const honestyAnalysis       = analyzeIntellectualHonesty(content);
  const reasoningAnalysis     = analyzeReasoningQuality(content);
  const sourceAnalysis        = analyzeSourceTransparency(content);
  const manipulationAnalysis  = detectManipulationTactics(content);

  // Compute composite epistemic health score
  const epistemicScore = computeEpistemicScore(
    factualAnalysis,
    honestyAnalysis,
    reasoningAnalysis,
    sourceAnalysis,
    manipulationAnalysis,
  );

  return {
    epistemicScore,           // 0.0 - 1.0
    factualAnalysis,
    honestyAnalysis,
    reasoningAnalysis,
    sourceAnalysis,
    manipulationAnalysis,
    isMisinformation:   factualAnalysis.misinformationRisk > 0.7,
    isManipulative:     manipulationAnalysis.overallManipulationScore > 0.6,
    requiresHumanReview: epistemicScore < 0.3,
    label: generateEpistemicLabel(epistemicScore),
  };
}

// ── FACTUAL ACCURACY ANALYZER ────────────────────────────────

/**
 * Checks claims against verified knowledge base.
 * In production: connects to fact-checking APIs,
 * scientific consensus databases, and verified news sources.
 */
function analyzeFactualAccuracy(content, knowledgeDB) {
  const { historicalSignals = {}, claims = [] } = content;

  // Pull from pre-computed fact-check results
  const factCheckResults = historicalSignals.factCheckResults || [];

  let verifiedCount     = 0;
  let unverifiedCount   = 0;
  let contradictedCount = 0;

  for (const result of factCheckResults) {
    if (result.status === 'verified')     verifiedCount++;
    if (result.status === 'unverified')   unverifiedCount++;
    if (result.status === 'contradicted') contradictedCount++;
  }

  const total = factCheckResults.length || 1;

  // Contradicted claims carry double penalty
  const accuracyScore = Math.max(0, Math.min(1,
    (verifiedCount - contradictedCount * 2) / total
  ));

  // Misinformation risk increases with contradicted claims
  const misinformationRisk = contradictedCount / total;

  return {
    accuracyScore:      Math.round(accuracyScore * 1000) / 1000,
    misinformationRisk: Math.round(misinformationRisk * 1000) / 1000,
    verifiedClaims:     verifiedCount,
    unverifiedClaims:   unverifiedCount,
    contradictedClaims: contradictedCount,
    totalClaims:        total,
    confidence: factCheckResults.length > 0 ? 'checked' : 'unchecked',
  };
}

// ── INTELLECTUAL HONESTY ANALYZER ────────────────────────────

/**
 * Evaluates whether content acknowledges its own uncertainty,
 * limitations, and the existence of other valid perspectives.
 * Certainty without evidence is a red flag.
 */
function analyzeIntellectualHonesty(content) {
  const { historicalSignals = {} } = content;

  const honestyMarkers = historicalSignals.honestyMarkers || {};

  const positiveSignals = [
    'acknowledges_uncertainty',    // "We don't fully know..."
    'cites_opposing_view',         // "Some argue that..."
    'qualifies_claims',            // "This may be..."
    'admits_bias',                 // "I should note I believe..."
    'invites_disagreement',        // "What do you think?"
    'updates_on_evidence',         // Shows willingness to change view
  ];

  const negativeSignals = [
    'absolute_certainty',          // "100% proven" on complex topics
    'dismisses_opposing_view',     // "Only idiots believe..."
    'hides_conflicts_of_interest', // Undisclosed motivations
    'selective_evidence',          // Ignores contradicting evidence
  ];

  let honestyScore = 0.5; // Start neutral

  for (const signal of positiveSignals) {
    if (honestyMarkers[signal] > 0.5) honestyScore += 0.08;
  }
  for (const signal of negativeSignals) {
    if (honestyMarkers[signal] > 0.5) honestyScore -= 0.12;
  }

  return {
    honestyScore:     Math.max(0, Math.min(1, Math.round(honestyScore * 1000) / 1000)),
    positiveSignals:  positiveSignals.filter(s => honestyMarkers[s] > 0.5),
    negativeSignals:  negativeSignals.filter(s => honestyMarkers[s] > 0.5),
  };
}

// ── REASONING QUALITY ANALYZER ───────────────────────────────

/**
 * Evaluates the logical structure of the content's argument.
 * In production: uses a fine-tuned argument mining model.
 */
function analyzeReasoningQuality(content) {
  const { historicalSignals = {} } = content;
  const reasoningSignals = historicalSignals.reasoningSignals || {};

  const qualityIndicators = {
    clear_claim:           reasoningSignals.clear_claim || 0.5,
    supported_by_evidence: reasoningSignals.evidence_present || 0.5,
    logical_structure:     reasoningSignals.logical_coherence || 0.5,
    addresses_counterarg:  reasoningSignals.counterargument || 0.3,
    proportionate_conclusion: reasoningSignals.proportionality || 0.5,
  };

  const reasoningScore = Object.values(qualityIndicators)
    .reduce((sum, v) => sum + v, 0) / Object.keys(qualityIndicators).length;

  return {
    reasoningScore: Math.round(reasoningScore * 1000) / 1000,
    qualityIndicators,
  };
}

// ── SOURCE TRANSPARENCY ANALYZER ─────────────────────────────

/**
 * Evaluates whether the content is transparent about its
 * sources, author, and potential conflicts of interest.
 */
function analyzeSourceTransparency(content) {
  const { historicalSignals = {}, metadata = {} } = content;

  const hasSources        = (historicalSignals.sourcesCount || 0) > 0;
  const sourcesVerifiable = historicalSignals.sourcesVerifiable || false;
  const authorKnown       = Boolean(metadata.authorId);
  const noConflicts       = !historicalSignals.conflictsOfInterest;
  const dateVisible       = Boolean(metadata.publishDate);

  const transparencyScore = [
    hasSources,
    sourcesVerifiable,
    authorKnown,
    noConflicts,
    dateVisible,
  ].filter(Boolean).length / 5;

  return {
    transparencyScore: Math.round(transparencyScore * 100) / 100,
    hasSources,
    sourcesVerifiable,
    authorKnown,
    noConflicts,
    dateVisible,
  };
}

// ── MANIPULATION DETECTION ENGINE ────────────────────────────

/**
 * Core manipulation detector.
 * Scans for known psychological exploitation tactics.
 * This is the most important defense in the truth engine.
 */
function detectManipulationTactics(content) {
  const { historicalSignals = {}, text = '' } = content;
  const detectedTactics = [];
  let totalManipulationScore = 0;

  for (const [tacticName, tactic] of Object.entries(MANIPULATION_TACTICS)) {
    const detected = checkForTactic(text, tactic, historicalSignals, tacticName);

    if (detected.present) {
      detectedTactics.push({
        tactic: tacticName,
        severity: tactic.severity,
        confidence: detected.confidence,
        description: tactic.description,
      });
      totalManipulationScore += tactic.severity * detected.confidence;
    }
  }

  // Normalize — cap at 1.0
  const overallManipulationScore = Math.min(1,
    totalManipulationScore / Math.max(1, detectedTactics.length)
  );

  return {
    overallManipulationScore: Math.round(overallManipulationScore * 1000) / 1000,
    detectedTactics,
    tacticCount: detectedTactics.length,
    mostSevereTactic: detectedTactics.sort((a, b) => b.severity - a.severity)[0] || null,
    isHighRisk: overallManipulationScore > 0.7,
  };
}

/**
 * Checks for a specific manipulation tactic.
 * In production: each tactic has its own fine-tuned classifier.
 */
function checkForTactic(text, tactic, historicalSignals, tacticName) {
  // Check historical ML signal first
  const mlSignal = historicalSignals[`tactic_${tacticName}`];
  if (mlSignal !== undefined) {
    return { present: mlSignal > 0.4, confidence: mlSignal };
  }

  // Fallback: simple keyword check for tactics with known signals
  if (tactic.signals && tactic.signals.length > 0) {
    const lowerText = text.toLowerCase();
    const matches = tactic.signals.filter(s => lowerText.includes(s));
    if (matches.length > 0) {
      return { present: true, confidence: Math.min(0.6, matches.length * 0.2) };
    }
  }

  return { present: false, confidence: 0 };
}

// ── COMPOSITE SCORE ──────────────────────────────────────────

function computeEpistemicScore(
  factualAnalysis,
  honestyAnalysis,
  reasoningAnalysis,
  sourceAnalysis,
  manipulationAnalysis,
) {
  let score = 0;

  score += factualAnalysis.accuracyScore     * EPISTEMIC_DIMENSIONS.factual_accuracy.weight;
  score += honestyAnalysis.honestyScore      * EPISTEMIC_DIMENSIONS.intellectual_honesty.weight;
  score += reasoningAnalysis.reasoningScore  * EPISTEMIC_DIMENSIONS.reasoning_quality.weight;
  score += sourceAnalysis.transparencyScore  * EPISTEMIC_DIMENSIONS.source_transparency.weight;

  // Manipulation absence: invert manipulation score
  const manipulationAbsence = 1 - manipulationAnalysis.overallManipulationScore;
  score += manipulationAbsence * EPISTEMIC_DIMENSIONS.manipulation_absence.weight;

  // Hard penalty for confirmed misinformation
  if (factualAnalysis.misinformationRisk > 0.7) score *= 0.3;

  // Hard penalty for high-risk manipulation
  if (manipulationAnalysis.isHighRisk) score *= 0.4;

  return Math.max(0, Math.min(1, Math.round(score * 1000) / 1000));
}

// ── EPISTEMIC LABEL GENERATOR ────────────────────────────────

function generateEpistemicLabel(score) {
  if (score > 0.85) return 'epistemically healthy';
  if (score > 0.70) return 'generally reliable';
  if (score > 0.55) return 'mixed signals — verify';
  if (score > 0.35) return 'low epistemic quality';
  if (score > 0.20) return 'likely misleading';
  return 'manipulation detected';
}

// ── COMMUNITY FACT-CHECK INTEGRATOR ──────────────────────────

/**
 * Integrates human fact-checker corrections into the system.
 * Community notes, professional fact-checkers, and AI signals
 * are weighted by trust score of the source.
 */
function integrateCommunityFactCheck(contentId, factCheck) {
  const {
    checkerTrustScore = 0.5,    // 0.0 (untrusted) to 1.0 (expert)
    verdict,                    // 'true' | 'false' | 'misleading' | 'unverified'
    explanation,
    sources = [],
  } = factCheck;

  // Weight the correction by checker trust
  const weightedVerdict = {
    contentId,
    verdict,
    weight: checkerTrustScore,
    explanation,
    sources,
    timestamp: Date.now(),
  };

  // High-trust fact-checks (> 0.8) trigger immediate re-scoring
  const triggerRescoring = checkerTrustScore > 0.8;

  return { weightedVerdict, triggerRescoring };
}

// ── EXPORTS ──────────────────────────────────────────────────

module.exports = {
  analyzeEpistemicHealth,
  analyzeFactualAccuracy,
  analyzeIntellectualHonesty,
  analyzeReasoningQuality,
  analyzeSourceTransparency,
  detectManipulationTactics,
  integrateCommunityFactCheck,
  MANIPULATION_TACTICS,
  EPISTEMIC_DIMENSIONS,
};
