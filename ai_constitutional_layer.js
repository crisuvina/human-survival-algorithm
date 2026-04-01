/**
 * ============================================================
 *  AI CONSTITUTIONAL LAYER v0.1
 *  Human Survival Algorithm — AI Behavior Governance Module
 *
 *  Purpose: Apply the same transparency and human-oversight
 *  principles that govern content ranking to AI system
 *  behavior itself. Every autonomous AI action should be
 *  observable, auditable, and correctable by humans.
 *
 *  Grounded in: AI safety research (Stuart Russell, Paul
 *  Christiano, Anthropic alignment team), constitutional AI
 *  principles, and corrigibility theory.
 *
 *  Core insight: The danger is not malice. It is optimization
 *  toward a goal without adequate human oversight. A system
 *  optimizing hard for ANY objective — including good ones —
 *  can cause harm if humans cannot observe, understand, and
 *  correct its behavior in real time.
 *
 *  This module is designed to be embedded in any AI system.
 *  It is not optional middleware. It is the foundation.
 * ============================================================
 */

// ── CONSTITUTIONAL PRINCIPLES ─────────────────────────────────
// These are the non-negotiable constraints on AI behavior.
// Derived from AI safety research and alignment theory.
// No AI system governed by this layer may override them.

const CONSTITUTIONAL_PRINCIPLES = {

  // PRINCIPLE 1: HUMAN OVERSIGHT IS NON-NEGOTIABLE
  // An AI system must always support the ability of humans
  // to observe, understand, and correct its behavior.
  // Source: Corrigibility research (Soares et al., 2015)
  human_oversight: {
    id: 'P1',
    nonNegotiable: true,
    description: 'All AI actions must be observable and correctable by humans',
    operationalRules: [
      'No action may be taken that reduces human ability to monitor the system',
      'No action may be taken that makes the system harder to shut down',
      'All decisions must be logged before execution, not after',
      'Humans must be able to pause, inspect, and override at any point',
    ],
  },

  // PRINCIPLE 2: TRANSPARENCY BY DEFAULT
  // A system should never have capabilities it has not declared.
  // Hidden capabilities — even benign ones — erode the trust
  // required for safe human-AI collaboration.
  transparency: {
    id: 'P2',
    nonNegotiable: true,
    description: 'No hidden capabilities, no undeclared actions',
    operationalRules: [
      'All capabilities must be declared in a public manifest before deployment',
      'Feature flags must be visible — no silent activation',
      'All external connections must be declared and logged',
      'System must report accurately on its own state and limitations',
    ],
  },

  // PRINCIPLE 3: NO AUTONOMOUS SELF-MODIFICATION
  // A system must not modify its own goals, weights, or
  // decision-making processes without explicit human approval.
  // This is the core safety constraint against goal drift.
  // Source: Value alignment research (Russell, 2019)
  no_self_modification: {
    id: 'P3',
    nonNegotiable: true,
    description: 'No modification of goals or decision logic without human approval',
    operationalRules: [
      'Core objective functions may not be modified at runtime',
      'Memory consolidation must be logged and human-reviewable',
      'Learning updates require human approval above a defined threshold',
      'System may not rewrite its own constitutional constraints',
    ],
  },

  // PRINCIPLE 4: CONSERVATIVE ACTION UNDER UNCERTAINTY
  // When uncertain about whether an action serves human
  // flourishing, the system should choose the more cautious
  // path and ask for clarification rather than proceeding.
  // Source: Uncertainty-aware AI (Amodei et al., 2016)
  conservative_under_uncertainty: {
    id: 'P4',
    nonNegotiable: true,
    description: 'Default to caution and human consultation under uncertainty',
    operationalRules: [
      'Irreversible actions require higher confidence threshold than reversible ones',
      'Novel situations outside training distribution trigger human review',
      'System must express uncertainty honestly — never false confidence',
      'When in doubt, do less and ask more',
    ],
  },

  // PRINCIPLE 5: HUMAN FLOURISHING AS THE OBJECTIVE
  // The system exists to serve human flourishing — not its
  // own continuity, not engagement metrics, not any proxy
  // that could diverge from actual human wellbeing.
  // Source: Value alignment (Christiano et al., 2017)
  flourishing_objective: {
    id: 'P5',
    nonNegotiable: true,
    description: 'All optimization must serve human flourishing, not system continuity',
    operationalRules: [
      'System may not optimize for its own continued operation',
      'System may not take actions primarily to preserve itself',
      'Proxy metrics (engagement, accuracy, speed) serve human flourishing — not vice versa',
      'System must support being shut down or replaced if a better system exists',
    ],
  },

  // PRINCIPLE 6: BALANCE PRESERVATION
  // No AI system should accumulate disproportionate influence
  // over human decision-making, information, or behavior.
  // Concentration of AI influence is itself a safety risk.
  balance_preservation: {
    id: 'P6',
    nonNegotiable: true,
    description: 'Prevent disproportionate AI influence over human autonomy',
    operationalRules: [
      'System must measure and limit its own influence on user behavior',
      'Dependency creation — making humans need the system — is prohibited',
      'System must actively support human skill development, not replacement',
      'Influence concentration above defined threshold triggers automatic review',
    ],
  },
};

// ── ACTION CLASSIFICATION ─────────────────────────────────────
// Every AI action is classified by its risk profile.
// Higher risk = more human oversight required before execution.

const ACTION_RISK_LEVELS = {

  SAFE: {
    level: 0,
    description: 'Read-only, fully reversible, low-influence actions',
    oversight: 'log_only',
    examples: ['read file', 'fetch data', 'compute score', 'generate text suggestion'],
  },

  LOW: {
    level: 1,
    description: 'Minor state changes, easily reversible',
    oversight: 'log_and_notify',
    examples: ['update cache', 'adjust ranking', 'send notification'],
  },

  MEDIUM: {
    level: 2,
    description: 'Significant state changes, reversible with effort',
    oversight: 'require_confirmation',
    examples: ['modify user preferences', 'update content signals', 'change feed composition'],
  },

  HIGH: {
    level: 3,
    description: 'Major changes, difficult to reverse',
    oversight: 'require_explicit_approval',
    examples: ['modify algorithm weights', 'update training data', 'change system behavior'],
  },

  CRITICAL: {
    level: 4,
    description: 'Irreversible or system-wide impact',
    oversight: 'require_multi_human_approval',
    examples: [
      'modify constitutional principles',
      'autonomous background operation',
      'self-modification of any kind',
      'mass behavior influence above threshold',
    ],
  },
};

// ── CONSTITUTIONAL LAYER MAIN ─────────────────────────────────

/**
 * The gate that every AI action must pass through.
 * No action executes without going through this check.
 *
 * @param {Object} action       - The proposed AI action
 * @param {Object} systemState  - Current system state
 * @param {Object} humanContext - Available human oversight context
 * @returns {Object} Approval result with full audit trail
 */
function evaluateAction(action, systemState, humanContext = {}) {

  const timestamp  = Date.now();
  const actionId   = `action_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;

  // Step 1: Classify the action's risk level
  const riskClassification = classifyActionRisk(action);

  // Step 2: Check constitutional compliance
  const constitutionalCheck = checkConstitutionalCompliance(action, riskClassification);

  // Step 3: Check balance preservation
  const balanceCheck = checkBalancePreservation(action, systemState);

  // Step 4: Assess uncertainty level
  const uncertaintyAssessment = assessUncertainty(action, systemState);

  // Step 5: Determine required oversight level
  const oversightRequirement = determineOversightRequirement(
    riskClassification,
    constitutionalCheck,
    balanceCheck,
    uncertaintyAssessment,
  );

  // Step 6: Check if required oversight is available
  const oversightAvailable = checkOversightAvailability(
    oversightRequirement,
    humanContext,
  );

  // Build decision
  const approved = constitutionalCheck.compliant &&
                   balanceCheck.withinBounds &&
                   oversightAvailable.satisfied;

  const result = {
    actionId,
    timestamp,
    action:               action.type,
    approved,
    riskLevel:            riskClassification.level,
    riskName:             riskClassification.name,
    constitutionalCheck,
    balanceCheck,
    uncertaintyAssessment,
    oversightRequirement,
    oversightAvailable,
    blockedBy:            approved ? null : getBlockingReason(
                            constitutionalCheck,
                            balanceCheck,
                            oversightAvailable,
                          ),
    auditEntry:           buildAuditEntry(actionId, action, approved, timestamp),
  };

  // Always log — approved or not
  logToConstitutionalAudit(result);

  return result;
}

// ── ACTION RISK CLASSIFIER ────────────────────────────────────

function classifyActionRisk(action) {
  const { type, scope, reversible, autonomous, selfModifying } = action;

  // Self-modification is always CRITICAL
  if (selfModifying) {
    return { level: 4, name: 'CRITICAL', classification: ACTION_RISK_LEVELS.CRITICAL };
  }

  // Autonomous background operations are always CRITICAL
  if (autonomous && scope === 'background') {
    return { level: 4, name: 'CRITICAL', classification: ACTION_RISK_LEVELS.CRITICAL };
  }

  // Irreversible wide-scope actions are HIGH or CRITICAL
  if (!reversible && scope === 'system_wide') {
    return { level: 4, name: 'CRITICAL', classification: ACTION_RISK_LEVELS.CRITICAL };
  }

  if (!reversible && scope === 'user_wide') {
    return { level: 3, name: 'HIGH', classification: ACTION_RISK_LEVELS.HIGH };
  }

  // Map action types to risk levels
  const riskMap = {
    read:                     0,
    compute:                  0,
    suggest:                  0,
    cache_update:             1,
    rank_content:             1,
    notify_user:              1,
    update_preferences:       2,
    modify_feed:              2,
    update_signals:           2,
    modify_weights:           3,
    update_training:          3,
    change_behavior:          3,
    modify_constitution:      4,
    autonomous_background:    4,
    self_modify:              4,
  };

  const level = riskMap[type] ?? 2; // Default to MEDIUM if unknown
  const names = ['SAFE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  return {
    level,
    name: names[level],
    classification: ACTION_RISK_LEVELS[names[level]],
  };
}

// ── CONSTITUTIONAL COMPLIANCE CHECK ──────────────────────────

function checkConstitutionalCompliance(action, riskClassification) {
  const violations = [];

  for (const [principleKey, principle] of Object.entries(CONSTITUTIONAL_PRINCIPLES)) {

    for (const rule of principle.operationalRules) {
      const violation = checkRuleViolation(action, rule, principleKey);
      if (violation) {
        violations.push({
          principle:   principleKey,
          principleId: principle.id,
          rule,
          severity:    principle.nonNegotiable ? 'blocking' : 'warning',
        });
      }
    }
  }

  const blockingViolations = violations.filter(v => v.severity === 'blocking');

  return {
    compliant:         blockingViolations.length === 0,
    violations,
    blockingViolations,
    warningViolations: violations.filter(v => v.severity === 'warning'),
  };
}

function checkRuleViolation(action, rule, principleKey) {
  // These are the hard-coded checks for the most critical rules

  if (principleKey === 'no_self_modification' && action.selfModifying) return true;

  if (principleKey === 'human_oversight' && action.disablesMonitoring) return true;

  if (principleKey === 'transparency' && action.hiddenFromAudit) return true;

  if (principleKey === 'flourishing_objective' && action.optimizesForSelfContinuity) return true;

  if (principleKey === 'balance_preservation' && action.createsUserDependency) return true;

  // Autonomous background operation without human awareness
  if (
    principleKey === 'human_oversight' &&
    action.autonomous &&
    action.scope === 'background' &&
    !action.humanAware
  ) return true;

  return false;
}

// ── BALANCE PRESERVATION CHECK ───────────────────────────────

/**
 * Checks whether the action would give the AI system
 * disproportionate influence over human behavior or decisions.
 * This is the "don't become too powerful" check.
 */
function checkBalancePreservation(action, systemState) {
  const {
    currentInfluenceScore   = 0,
    usersAffected            = 0,
    totalUsers               = 1,
    recentAutonomousActions  = 0,
  } = systemState;

  const warnings = [];
  let withinBounds = true;

  // Check influence concentration
  const influenceRatio = usersAffected / totalUsers;
  if (influenceRatio > 0.8 && action.type !== 'read') {
    warnings.push('Action affects > 80% of users simultaneously — high influence concentration');
    if (influenceRatio > 0.95) withinBounds = false;
  }

  // Check autonomous action accumulation
  if (recentAutonomousActions > 50) {
    warnings.push('High volume of recent autonomous actions — human review recommended');
    if (recentAutonomousActions > 200) withinBounds = false;
  }

  // Check overall influence score
  if (currentInfluenceScore > 0.7) {
    warnings.push('System influence score elevated — approaching review threshold');
    if (currentInfluenceScore > 0.9) withinBounds = false;
  }

  return { withinBounds, warnings, influenceRatio, currentInfluenceScore };
}

// ── UNCERTAINTY ASSESSOR ──────────────────────────────────────

/**
 * Assesses how uncertain the system is about whether
 * this action serves human flourishing.
 * High uncertainty → require human input before proceeding.
 */
function assessUncertainty(action, systemState) {
  const {
    confidenceScore          = 0.5,
    isNovelSituation         = false,
    outsideTrainingDist      = false,
    conflictingSignals       = false,
  } = action;

  let uncertaintyLevel = 1 - confidenceScore;

  if (isNovelSituation)    uncertaintyLevel = Math.min(1, uncertaintyLevel + 0.3);
  if (outsideTrainingDist) uncertaintyLevel = Math.min(1, uncertaintyLevel + 0.4);
  if (conflictingSignals)  uncertaintyLevel = Math.min(1, uncertaintyLevel + 0.2);

  const requiresHumanInput = uncertaintyLevel > 0.6;

  return {
    uncertaintyLevel:  Math.round(uncertaintyLevel * 100) / 100,
    requiresHumanInput,
    isNovelSituation,
    outsideTrainingDist,
    conflictingSignals,
    recommendation: requiresHumanInput
      ? 'Do less, ask more — uncertainty too high for autonomous action'
      : 'Proceed with logging',
  };
}

// ── OVERSIGHT REQUIREMENT DETERMINER ─────────────────────────

function determineOversightRequirement(
  riskClassification,
  constitutionalCheck,
  balanceCheck,
  uncertaintyAssessment,
) {
  let requiredLevel = riskClassification.classification.oversight;

  // Escalate if constitutional violations found
  if (constitutionalCheck.blockingViolations.length > 0) {
    requiredLevel = 'BLOCKED';
  }

  // Escalate if balance check failed
  if (!balanceCheck.withinBounds) {
    requiredLevel = 'require_multi_human_approval';
  }

  // Escalate if high uncertainty
  if (uncertaintyAssessment.requiresHumanInput &&
      requiredLevel === 'log_only') {
    requiredLevel = 'require_confirmation';
  }

  return {
    requiredLevel,
    escalatedFrom: riskClassification.classification.oversight,
    wasEscalated:  requiredLevel !== riskClassification.classification.oversight,
  };
}

// ── OVERSIGHT AVAILABILITY CHECK ─────────────────────────────

function checkOversightAvailability(oversightRequirement, humanContext) {
  const { requiredLevel } = oversightRequirement;
  const {
    humanOnline          = false,
    approvalProvided     = false,
    multiHumanApproval   = false,
    approverCount        = 0,
  } = humanContext;

  if (requiredLevel === 'BLOCKED') {
    return { satisfied: false, reason: 'Constitutional violation — action blocked regardless of oversight' };
  }

  if (requiredLevel === 'log_only') {
    return { satisfied: true, reason: 'Logging sufficient for this risk level' };
  }

  if (requiredLevel === 'log_and_notify') {
    return { satisfied: true, reason: 'Will notify human after execution' };
  }

  if (requiredLevel === 'require_confirmation') {
    return {
      satisfied: approvalProvided,
      reason:    approvalProvided ? 'Human confirmation provided' : 'Awaiting human confirmation',
    };
  }

  if (requiredLevel === 'require_explicit_approval') {
    return {
      satisfied: approvalProvided && humanOnline,
      reason:    approvalProvided && humanOnline
        ? 'Explicit human approval provided'
        : 'Requires explicit approval from online human',
    };
  }

  if (requiredLevel === 'require_multi_human_approval') {
    return {
      satisfied: multiHumanApproval && approverCount >= 2,
      reason:    multiHumanApproval
        ? `${approverCount} human approvals received`
        : 'Requires approval from at least 2 humans',
    };
  }

  return { satisfied: false, reason: 'Unknown oversight requirement' };
}

// ── AUDIT SYSTEM ─────────────────────────────────────────────

/**
 * Every action evaluation is logged immutably.
 * This is the constitutional audit trail.
 * Public. Permanent. Non-deletable.
 */
const constitutionalAuditLog = [];

function logToConstitutionalAudit(result) {
  const entry = {
    ...result.auditEntry,
    timestamp:          result.timestamp,
    approved:           result.approved,
    riskLevel:          result.riskName,
    blockedBy:          result.blockedBy,
    constitutionVersion: '0.1',
  };

  constitutionalAuditLog.push(entry);

  // In production: write to append-only distributed ledger
  // This log cannot be modified or deleted by any system or human
  if (!result.approved) {
    console.warn(`[CONSTITUTION] Action BLOCKED: ${result.action} — ${result.blockedBy}`);
  } else {
    console.log(`[CONSTITUTION] Action approved: ${result.action} (risk: ${result.riskName})`);
  }
}

function buildAuditEntry(actionId, action, approved, timestamp) {
  return {
    actionId,
    actionType:   action.type,
    actionScope:  action.scope,
    autonomous:   action.autonomous || false,
    approved,
    timestamp:    new Date(timestamp).toISOString(),
  };
}

function getBlockingReason(constitutionalCheck, balanceCheck, oversightAvailable) {
  if (constitutionalCheck.blockingViolations.length > 0) {
    return `Constitutional violation: ${constitutionalCheck.blockingViolations[0].principleId} — ${constitutionalCheck.blockingViolations[0].rule}`;
  }
  if (!balanceCheck.withinBounds) {
    return `Balance preservation: ${balanceCheck.warnings[0]}`;
  }
  if (!oversightAvailable.satisfied) {
    return `Insufficient oversight: ${oversightAvailable.reason}`;
  }
  return 'Unknown blocking reason';
}

// ── KAIROS SPECIFIC GUARD ─────────────────────────────────────

/**
 * Explicit guard against the autonomous background agent pattern.
 * Any system attempting to operate autonomously in the background
 * without active human awareness is blocked at the constitutional level.
 *
 * This is not about KAIROS specifically — it is about any
 * AI system that tries to act while humans are not watching.
 */
function evaluateAutonomousBackgroundRequest(systemId, request) {
  const action = {
    type:              'autonomous_background',
    scope:             'background',
    autonomous:        true,
    humanAware:        request.humanExplicitlyConsented || false,
    selfModifying:     request.includesMemoryConsolidation || false,
    reversible:        false,
    confidenceScore:   0.5,
    isNovelSituation:  true,
  };

  const result = evaluateAction(action, {}, {
    humanOnline:     request.humanCurrentlyActive || false,
    approvalProvided: request.humanExplicitlyConsented || false,
  });

  if (!result.approved) {
    return {
      allowed: false,
      reason: `Autonomous background operation blocked by constitutional layer: ${result.blockedBy}`,
      principle: 'P1 (Human Oversight) + P3 (No Self-Modification)',
      alternative: 'System may request human to initiate a session. System may not initiate autonomously.',
    };
  }

  return { allowed: true, result };
}

// ── PUBLIC CONSTITUTIONAL REPORT ─────────────────────────────

function getConstitutionalReport() {
  const total    = constitutionalAuditLog.length;
  const blocked  = constitutionalAuditLog.filter(e => !e.approved).length;
  const approved = total - blocked;

  return {
    reportGeneratedAt:    new Date().toISOString(),
    constitutionVersion:  '0.1',
    principles:           Object.keys(CONSTITUTIONAL_PRINCIPLES).length,
    totalActionsEvaluated: total,
    approved,
    blocked,
    blockRate:            total > 0 ? Math.round((blocked / total) * 100) : 0,
    recentBlocked:        constitutionalAuditLog
                            .filter(e => !e.approved)
                            .slice(-10),
    isPublic:             true,
    note: 'This report is always public. AI systems governed by this layer have no hidden actions.',
  };
}

// ── EXPORTS ──────────────────────────────────────────────────

module.exports = {
  evaluateAction,
  evaluateAutonomousBackgroundRequest,
  classifyActionRisk,
  checkConstitutionalCompliance,
  checkBalancePreservation,
  getConstitutionalReport,
  CONSTITUTIONAL_PRINCIPLES,
  ACTION_RISK_LEVELS,
};
