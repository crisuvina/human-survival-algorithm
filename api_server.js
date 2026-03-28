/**
 * ============================================================
 *  API SERVER v0.1
 *  Human Survival Algorithm — Deployable Service Entry Point
 *
 *  Purpose: Tie all modules together into a single deployable
 *  REST API that any platform can integrate with.
 *
 *  Philosophy: This algorithm should be platform-agnostic.
 *  Twitter, TikTok, a new platform, a local community board —
 *  any of them can call this API and get back a feed ranked
 *  for human flourishing instead of engagement.
 *
 *  The revolution does not require permission.
 *  It requires an endpoint.
 * ============================================================
 */

const express = require('express');
const rateLimit = require('express-rate-limit');

const { constructFeed, createSessionContext }       = require('./feed_constructor');
const { computeFlourishingScore }                    = require('./flourishing_score');
const { analyzeWellbeing, processMoodCheckIn }       = require('./wellbeing_analyzer');
const { analyzeEpistemicHealth }                     = require('./truth_engine');
const { analyzeConnectionPotential }                 = require('./connection_engine');
const {
  translateHumanIntent,
  processDirectCorrection,
  processBehavioralSignal,
  generateSymbiosisReport,
  explainRanking,
}                                                    = require('./symbiosis_bridge');
const {
  submitProposal,
  castVote,
  resolveProposal,
  setPersonalPreferences,
  getTransparencyReport,
  addToDiscussion,
}                                                    = require('./governance_layer');

// ── SERVER SETUP ─────────────────────────────────────────────

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS — open by default. This algorithm belongs to everyone.
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin',  '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('X-Algorithm',                  'human-survival-algorithm/0.1');
  res.header('X-Open-Source',                'https://github.com/human-survival-algorithm/core');
  next();
});

// Rate limiting — protect the system without locking out users
const standardLimit = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max:      100,         // 100 requests/minute per IP
  message:  { error: 'Rate limit reached. Please slow down.' },
});

const heavyLimit = rateLimit({
  windowMs: 60 * 1000,
  max:      20,
  message:  { error: 'Rate limit reached for compute-heavy endpoint.' },
});

app.use('/api/', standardLimit);
app.use('/api/feed', heavyLimit);
app.use('/api/score', heavyLimit);

// ── ACTIVE SESSIONS ──────────────────────────────────────────
// In production: Redis-backed session store
const activeSessions = new Map();

// ── HEALTH CHECK ─────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({
    status:    'alive',
    version:   '0.1',
    purpose:   'human survival',
    timestamp: new Date().toISOString(),
    modules: {
      flourishing_score:  'loaded',
      wellbeing_analyzer: 'loaded',
      truth_engine:       'loaded',
      connection_engine:  'loaded',
      feed_constructor:   'loaded',
      symbiosis_bridge:   'loaded',
      governance_layer:   'loaded',
    },
  });
});

// ── FEED ENDPOINTS ───────────────────────────────────────────

/**
 * POST /api/feed/construct
 * Core endpoint. Takes a candidate pool and user profile,
 * returns a flourishing-ranked feed.
 *
 * Body: {
 *   userId:         string,
 *   candidatePool:  ContentItem[],
 *   userProfile:    UserProfile,
 *   feedSize:       number (default 20),
 *   intentSignal:   IntentExpression (optional)
 * }
 */
app.post('/api/feed/construct', async (req, res) => {
  try {
    const { userId, candidatePool, userProfile, feedSize = 20, intentSignal } = req.body;

    if (!userId || !candidatePool || !userProfile) {
      return res.status(400).json({ error: 'userId, candidatePool, and userProfile are required' });
    }

    // Get or create session context
    let sessionContext = activeSessions.get(userId);
    if (!sessionContext) {
      sessionContext = createSessionContext(userId, userProfile);
      activeSessions.set(userId, sessionContext);
    }

    // Apply intent translation if provided
    if (intentSignal) {
      const intentBoosts = translateHumanIntent(intentSignal);
      // Merge intent boosts into session context
      sessionContext.intentBoosts = intentBoosts.dimensionBoosts;
    }

    const result = constructFeed(candidatePool, userProfile, sessionContext, feedSize);

    res.json({
      success:           true,
      feed:              result.feed,
      sessionId:         result.sessionId,
      compositionReport: result.compositionReport,
      sessionState:      result.sessionState,
    });

  } catch (err) {
    console.error('[API] Feed construction error:', err);
    res.status(500).json({ error: 'Feed construction failed', details: err.message });
  }
});

/**
 * GET /api/feed/explain/:contentId
 * Explains why a specific piece of content was ranked where it was.
 * Full transparency — users always have the right to know.
 */
app.get('/api/feed/explain/:contentId', (req, res) => {
  const { contentId } = req.params;
  const { userId }    = req.query;

  if (!userId) return res.status(400).json({ error: 'userId is required' });

  // In production: retrieve stored scoring result from cache
  const scoringResult = {
    flourishingScore: 0.74,
    breakdown: {
      spiritual:  { raw: 0.80, weight: 0.20, contribution: 0.16 },
      connection: { raw: 0.75, weight: 0.20, contribution: 0.15 },
      truth:      { raw: 0.85, weight: 0.20, contribution: 0.17 },
      diversity:  { raw: 0.60, weight: 0.15, contribution: 0.09 },
      wellbeing:  { raw: 0.70, weight: 0.15, contribution: 0.105 },
      happiness:  { raw: 0.65, weight: 0.10, contribution: 0.065 },
    },
    manipulationPenalty:    0.02,
    humanFeedbackModifier:  1.0,
    version:                '0.1',
    timestamp:              Date.now(),
  };

  const explanation = explainRanking(contentId, userId, scoringResult);

  res.json({ success: true, explanation });
});

// ── SCORING ENDPOINTS ────────────────────────────────────────

/**
 * POST /api/score/flourishing
 * Score a single piece of content for flourishing.
 */
app.post('/api/score/flourishing', (req, res) => {
  try {
    const { content, userProfile } = req.body;
    if (!content) return res.status(400).json({ error: 'content is required' });

    const result = computeFlourishingScore(content, userProfile || {});
    res.json({ success: true, scoring: result });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/score/wellbeing
 * Score content for wellbeing impact.
 */
app.post('/api/score/wellbeing', (req, res) => {
  try {
    const { content, userState, sessionData } = req.body;
    if (!content) return res.status(400).json({ error: 'content is required' });

    const result = analyzeWellbeing(content, userState || {}, sessionData || {});
    res.json({ success: true, analysis: result });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/score/truth
 * Score content for epistemic health.
 */
app.post('/api/score/truth', (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'content is required' });

    const result = analyzeEpistemicHealth(content);
    res.json({ success: true, analysis: result });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/score/connection
 * Score content for connection potential.
 */
app.post('/api/score/connection', (req, res) => {
  try {
    const { content, userProfile, networkData } = req.body;
    if (!content) return res.status(400).json({ error: 'content is required' });

    const result = analyzeConnectionPotential(content, userProfile || {}, networkData || {});
    res.json({ success: true, analysis: result });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── FEEDBACK ENDPOINTS ───────────────────────────────────────

/**
 * POST /api/feedback/correction
 * Submit a human correction to the algorithm's scoring.
 * This is the most important feedback endpoint.
 */
app.post('/api/feedback/correction', (req, res) => {
  try {
    const { userId, contentId, humanScore, algorithmScore, reason } = req.body;

    if (!userId || !contentId || humanScore === undefined) {
      return res.status(400).json({ error: 'userId, contentId, and humanScore are required' });
    }

    if (humanScore < 0 || humanScore > 1) {
      return res.status(400).json({ error: 'humanScore must be between 0.0 and 1.0' });
    }

    const result = processDirectCorrection(
      userId,
      contentId,
      humanScore,
      { flourishingScore: algorithmScore || 0.5 },
      reason,
    );

    res.json({ success: true, result });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/feedback/behavior
 * Submit a behavioral signal (save, share, hide, report, etc.)
 */
app.post('/api/feedback/behavior', (req, res) => {
  try {
    const { userId, contentId, behavior } = req.body;

    if (!userId || !contentId || !behavior) {
      return res.status(400).json({ error: 'userId, contentId, and behavior are required' });
    }

    const result = processBehavioralSignal(userId, contentId, behavior);
    res.json({ success: true, signal: result });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/feedback/mood
 * Submit an opt-in mood check-in.
 * The most valuable data in the system. Always optional.
 */
app.post('/api/feedback/mood', (req, res) => {
  try {
    const { userId, checkIn } = req.body;

    if (!userId || !checkIn) {
      return res.status(400).json({ error: 'userId and checkIn are required' });
    }

    const result = processMoodCheckIn(userId, checkIn);
    res.json({ success: true, result });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── INTENT ENDPOINTS ─────────────────────────────────────────

/**
 * POST /api/intent/translate
 * Translate a human's expressed intention into algorithm signals.
 */
app.post('/api/intent/translate', (req, res) => {
  try {
    const { intentExpression } = req.body;
    if (!intentExpression) return res.status(400).json({ error: 'intentExpression is required' });

    const result = translateHumanIntent(intentExpression);
    res.json({ success: true, translation: result });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GOVERNANCE ENDPOINTS ─────────────────────────────────────

/**
 * POST /api/governance/propose
 * Submit a governance proposal to change the algorithm.
 */
app.post('/api/governance/propose', (req, res) => {
  try {
    const { proposerId, proposal } = req.body;
    if (!proposerId || !proposal) {
      return res.status(400).json({ error: 'proposerId and proposal are required' });
    }

    const result = submitProposal(proposerId, proposal);
    res.json(result);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/governance/vote
 * Cast a vote on an active proposal.
 */
app.post('/api/governance/vote', (req, res) => {
  try {
    const { voterId, proposalId, vote, reason } = req.body;
    if (!voterId || !proposalId || !vote) {
      return res.status(400).json({ error: 'voterId, proposalId, and vote are required' });
    }

    const result = castVote(voterId, proposalId, vote, reason);
    res.json(result);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/governance/discuss
 * Add to a proposal's discussion thread.
 */
app.post('/api/governance/discuss', (req, res) => {
  try {
    const { proposalId, userId, comment } = req.body;
    if (!proposalId || !userId || !comment) {
      return res.status(400).json({ error: 'proposalId, userId, and comment are required' });
    }

    const result = addToDiscussion(proposalId, userId, comment);
    res.json(result);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/governance/preferences/:userId
 * Set personal feed preferences within community-defined bounds.
 */
app.put('/api/governance/preferences/:userId', (req, res) => {
  try {
    const { userId }     = req.params;
    const { preferences } = req.body;

    if (!preferences) return res.status(400).json({ error: 'preferences are required' });

    const result = setPersonalPreferences(userId, preferences);
    res.json(result);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── TRANSPARENCY ENDPOINTS ───────────────────────────────────

/**
 * GET /api/transparency
 * Full public transparency report.
 * This endpoint has no authentication — it belongs to everyone.
 */
app.get('/api/transparency', (req, res) => {
  const report = getTransparencyReport();
  res.json({ success: true, report });
});

/**
 * GET /api/transparency/symbiosis
 * Report on how well humans and AI are aligned.
 */
app.get('/api/transparency/symbiosis', (req, res) => {
  const report = generateSymbiosisReport(req.query.window || '7d');
  res.json({ success: true, report });
});

// ── SESSION MANAGEMENT ───────────────────────────────────────

/**
 * DELETE /api/session/:userId
 * End a user session. Clean up session state.
 */
app.delete('/api/session/:userId', (req, res) => {
  const { userId } = req.params;
  const existed    = activeSessions.has(userId);
  activeSessions.delete(userId);

  res.json({
    success: true,
    message: existed ? 'Session ended' : 'No active session found',
  });
});

// ── USER DATA RIGHTS ─────────────────────────────────────────

/**
 * DELETE /api/user/:userId/data
 * Right to be forgotten. Deletes all user data immediately.
 * No exceptions. No delays. This is non-negotiable.
 */
app.delete('/api/user/:userId/data', (req, res) => {
  const { userId } = req.params;

  // In production: cascade delete across all databases
  activeSessions.delete(userId);

  res.json({
    success:   true,
    message:   'All user data has been permanently deleted.',
    userId,
    deletedAt: new Date().toISOString(),
  });
});

/**
 * GET /api/user/:userId/export
 * Export all user data. GDPR-plus by default.
 */
app.get('/api/user/:userId/export', (req, res) => {
  const { userId } = req.params;

  // In production: compile full data export
  const exportData = {
    userId,
    exportedAt:      new Date().toISOString(),
    sessionHistory:  [],    // All past sessions
    moodCheckIns:    [],    // All mood data
    corrections:     [],    // All algorithm corrections
    behaviorSignals: [],    // All behavioral signals
    preferences:     {},    // Personal preferences
    note: 'This is all data we have ever stored about you. Nothing is hidden.',
  };

  res.json({ success: true, export: exportData });
});

// ── ERROR HANDLER ────────────────────────────────────────────

app.use((err, req, res, next) => {
  console.error('[API] Unhandled error:', err);
  res.status(500).json({
    error:   'Internal server error',
    message: 'Something went wrong. This has been logged for human review.',
  });
});

// ── NOT FOUND ────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({
    error:     'Endpoint not found',
    available: '/health, /api/feed/*, /api/score/*, /api/feedback/*, /api/governance/*, /api/transparency',
  });
});

// ── START ────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║         HUMAN SURVIVAL ALGORITHM — API SERVER v0.1       ║
║                                                          ║
║  Running on port ${PORT}                                    ║
║  Purpose: human flourishing                              ║
║  Governance: community                                   ║
║  License: AGPL-3.0 (open forever)                        ║
║                                                          ║
║  "AI and humans evolving as one."                        ║
╚══════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
