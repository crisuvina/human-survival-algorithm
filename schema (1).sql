-- ============================================================
--  DATABASE SCHEMA v0.1
--  Human Survival Algorithm — PostgreSQL
--
--  Philosophy: Every table here serves human flourishing.
--  No dark patterns. No shadow profiles. No data hoarding.
--  We store only what is needed to make the system work.
--  Users own their data. Always.
-- ============================================================

-- ── EXTENSIONS ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- Fast text search
CREATE EXTENSION IF NOT EXISTS "pgcrypto";     -- Encryption at rest

-- ── USERS ────────────────────────────────────────────────────

CREATE TABLE users (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at        TIMESTAMPTZ,

  -- Anonymized by default. Display name is optional.
  display_name          TEXT,
  account_age_days      INTEGER GENERATED ALWAYS AS
                          (EXTRACT(DAY FROM NOW() - created_at)::INTEGER) STORED,

  -- Governance
  is_verified_expert    BOOLEAN DEFAULT FALSE,
  expert_domain         TEXT,                    -- psychology, journalism, etc.
  can_vote              BOOLEAN GENERATED ALWAYS AS
                          (EXTRACT(DAY FROM NOW() - created_at) >= 30) STORED,

  -- Wellbeing state (rolling average — not history)
  current_mood_score    FLOAT CHECK (current_mood_score BETWEEN 0 AND 1),
  recent_crisis_signal  BOOLEAN DEFAULT FALSE,

  -- Data rights
  data_export_requested_at TIMESTAMPTZ,
  deletion_requested_at    TIMESTAMPTZ,

  CONSTRAINT users_mood_score_range CHECK (current_mood_score IS NULL OR
    current_mood_score BETWEEN 0.0 AND 1.0)
);

-- ── USER PREFERENCES ─────────────────────────────────────────

CREATE TABLE user_preferences (
  user_id               UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Personal dimension weight adjustments (within community bounds)
  weight_spiritual      FLOAT DEFAULT 1.0 CHECK (weight_spiritual BETWEEN 0.5 AND 2.0),
  weight_connection     FLOAT DEFAULT 1.0 CHECK (weight_connection BETWEEN 0.5 AND 2.0),
  weight_truth          FLOAT DEFAULT 1.0 CHECK (weight_truth     BETWEEN 0.5 AND 2.0),
  weight_diversity      FLOAT DEFAULT 1.0 CHECK (weight_diversity  BETWEEN 0.5 AND 2.0),
  weight_wellbeing      FLOAT DEFAULT 1.0 CHECK (weight_wellbeing  BETWEEN 0.5 AND 2.0),
  weight_happiness      FLOAT DEFAULT 1.0 CHECK (weight_happiness  BETWEEN 0.5 AND 2.0),

  -- Sensitive topics (user-defined — respected absolutely)
  sensitive_topics      TEXT[],

  -- Modes
  spiritual_mode        BOOLEAN DEFAULT FALSE,
  session_limit_mins    INTEGER,               -- Self-imposed session limit

  -- Privacy
  mood_checkins_enabled BOOLEAN DEFAULT FALSE   -- Opt-in only. Default off.
);

-- ── CONTENT ──────────────────────────────────────────────────

CREATE TABLE content (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id           TEXT UNIQUE,           -- ID from source platform
  source_platform       TEXT NOT NULL,
  author_id             TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  indexed_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Content metadata
  content_type          TEXT NOT NULL,         -- post, video, article, image
  content_perspective   TEXT,                  -- Ideological/topical classification
  tags                  TEXT[],
  language              TEXT DEFAULT 'en',

  -- Scoring cache (recomputed periodically)
  flourishing_score     FLOAT,
  wellbeing_score       FLOAT,
  epistemic_score       FLOAT,
  connection_score      FLOAT,
  composite_score       FLOAT,
  last_scored_at        TIMESTAMPTZ,

  -- Flags
  is_misinformation     BOOLEAN DEFAULT FALSE,
  is_manipulative       BOOLEAN DEFAULT FALSE,
  is_dehumanizing       BOOLEAN DEFAULT FALSE,
  manipulation_penalty  FLOAT DEFAULT 0.0,
  requires_review       BOOLEAN DEFAULT FALSE,

  -- Historical signals (aggregated from interactions)
  view_count            BIGINT DEFAULT 0,
  comment_count         BIGINT DEFAULT 0,
  reply_count           BIGINT DEFAULT 0,
  save_count            BIGINT DEFAULT 0,
  report_count          BIGINT DEFAULT 0,
  author_response_rate  FLOAT DEFAULT 0.0,

  -- Afterglow (populated from mood check-ins)
  afterglow_score       FLOAT,
  afterglow_sample_size INTEGER DEFAULT 0,

  CONSTRAINT content_scores_range CHECK (
    (flourishing_score IS NULL OR flourishing_score BETWEEN 0 AND 1) AND
    (wellbeing_score   IS NULL OR wellbeing_score   BETWEEN 0 AND 1) AND
    (epistemic_score   IS NULL OR epistemic_score   BETWEEN 0 AND 1) AND
    (connection_score  IS NULL OR connection_score  BETWEEN 0 AND 1)
  )
);

CREATE INDEX idx_content_composite_score    ON content(composite_score DESC);
CREATE INDEX idx_content_perspective        ON content(content_perspective);
CREATE INDEX idx_content_source_platform    ON content(source_platform);
CREATE INDEX idx_content_requires_review    ON content(requires_review) WHERE requires_review = TRUE;
CREATE INDEX idx_content_tags               ON content USING GIN(tags);

-- ── CONTENT SIGNALS ──────────────────────────────────────────
-- Detailed ML signals per content item

CREATE TABLE content_signals (
  content_id                UUID PRIMARY KEY REFERENCES content(id) ON DELETE CASCADE,
  computed_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Wellbeing signals
  dominant_emotion          TEXT,
  healing_score             FLOAT,
  harmful_score             FLOAT,
  safety_score              FLOAT,
  unsafe_markers            TEXT[],
  safe_markers              TEXT[],

  -- Truth signals
  accuracy_score            FLOAT,
  honesty_score             FLOAT,
  reasoning_score           FLOAT,
  transparency_score        FLOAT,
  manipulation_score        FLOAT,
  detected_tactics          TEXT[],
  misinformation_risk       FLOAT,

  -- Connection signals
  reciprocity_score         FLOAT,
  depth_score               FLOAT,
  bridge_score              FLOAT,
  connection_type           TEXT,
  has_offline_pathway       BOOLEAN DEFAULT FALSE,
  cross_group_engagement    FLOAT,

  -- Spiritual signals
  spiritual_score           FLOAT,
  awe_score                 FLOAT,
  love_score                FLOAT,
  meaning_score             FLOAT
);

-- ── SESSIONS ─────────────────────────────────────────────────

CREATE TABLE sessions (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  started_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at              TIMESTAMPTZ,
  duration_seconds      INTEGER,

  -- Session health metrics
  items_served          INTEGER DEFAULT 0,
  flourishing_avg       FLOAT,
  emotional_balance     FLOAT,
  perspectives_seen     INTEGER DEFAULT 0,

  -- Mood (from opt-in check-ins)
  mood_before           FLOAT,
  mood_after            FLOAT,
  mood_delta            FLOAT GENERATED ALWAYS AS (mood_after - mood_before) STORED,

  CONSTRAINT sessions_mood_range CHECK (
    (mood_before IS NULL OR mood_before BETWEEN 0 AND 1) AND
    (mood_after  IS NULL OR mood_after  BETWEEN 0 AND 1)
  )
);

CREATE INDEX idx_sessions_user_id   ON sessions(user_id);
CREATE INDEX idx_sessions_started   ON sessions(started_at DESC);

-- ── FEED EVENTS ───────────────────────────────────────────────
-- Every content item served is recorded for transparency

CREATE TABLE feed_events (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id            UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id            UUID NOT NULL REFERENCES content(id),
  served_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  feed_position         INTEGER NOT NULL,
  composite_score       FLOAT,
  was_reserved_slot     TEXT,           -- Which reserved slot type, if any
  was_diversity_injected BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_feed_events_session  ON feed_events(session_id);
CREATE INDEX idx_feed_events_content  ON feed_events(content_id);
CREATE INDEX idx_feed_events_user     ON feed_events(user_id);

-- ── HUMAN CORRECTIONS ────────────────────────────────────────
-- The most important table. Human wisdom correcting AI.

CREATE TABLE human_corrections (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id                UUID NOT NULL REFERENCES content(id),
  submitted_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  algorithm_score           FLOAT NOT NULL,
  human_score               FLOAT NOT NULL CHECK (human_score BETWEEN 0 AND 1),
  correction_magnitude      FLOAT GENERATED ALWAYS AS
                              (ABS(human_score - algorithm_score)) STORED,
  reason                    TEXT,

  -- Which dimensions the human felt were wrong
  dimension_feedback        JSONB,

  -- Processing status
  incorporated_into_training BOOLEAN DEFAULT FALSE,
  escalated_for_review       BOOLEAN DEFAULT FALSE,
  reviewed_by                UUID REFERENCES users(id),
  reviewed_at                TIMESTAMPTZ
);

CREATE INDEX idx_corrections_content      ON human_corrections(content_id);
CREATE INDEX idx_corrections_magnitude    ON human_corrections(correction_magnitude DESC);
CREATE INDEX idx_corrections_unreviewed   ON human_corrections(escalated_for_review)
  WHERE escalated_for_review = TRUE AND reviewed_at IS NULL;

-- ── BEHAVIORAL SIGNALS ───────────────────────────────────────

CREATE TABLE behavioral_signals (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id            UUID NOT NULL REFERENCES content(id),
  behavior              TEXT NOT NULL,
  signal_weight         FLOAT NOT NULL,
  recorded_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_behavioral_content ON behavioral_signals(content_id);

-- ── MOOD CHECK-INS ────────────────────────────────────────────
-- Opt-in only. The ground truth signal.

CREATE TABLE mood_checkins (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id            UUID REFERENCES sessions(id) ON DELETE SET NULL,
  checked_in_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  mood_before           FLOAT CHECK (mood_before BETWEEN 0 AND 1),
  mood_after            FLOAT CHECK (mood_after  BETWEEN 0 AND 1),
  voluntary_feedback    TEXT,          -- Optional free text

  -- Attribution to content (populated async)
  attribution_computed  BOOLEAN DEFAULT FALSE
);

-- ── GOVERNANCE: PROPOSALS ────────────────────────────────────

CREATE TABLE governance_proposals (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposer_id           UUID NOT NULL REFERENCES users(id),
  submitted_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deliberation_ends     TIMESTAMPTZ NOT NULL,

  proposal_type         TEXT NOT NULL CHECK (
                          proposal_type IN ('value_weight','feature','dimension','policy')
                        ),
  title                 TEXT NOT NULL,
  description           TEXT NOT NULL,
  rationale             TEXT NOT NULL,
  target_value          TEXT,
  proposed_change       JSONB NOT NULL,
  evidence_links        TEXT[],

  status                TEXT NOT NULL DEFAULT 'deliberating' CHECK (
                          status IN ('deliberating','passed','failed_quorum','failed_vote',
                                     'vetoed_core_protection','closed_pending_count')
                        ),

  -- Vote tallies
  votes_for             FLOAT DEFAULT 0,
  votes_against         FLOAT DEFAULT 0,
  votes_abstain         FLOAT DEFAULT 0,
  voter_count           INTEGER DEFAULT 0,

  -- Resolution
  resolved_at           TIMESTAMPTZ,
  implementation        JSONB          -- What was actually changed
);

CREATE INDEX idx_proposals_status        ON governance_proposals(status);
CREATE INDEX idx_proposals_deliberation  ON governance_proposals(deliberation_ends)
  WHERE status = 'deliberating';

-- ── GOVERNANCE: VOTES ────────────────────────────────────────

CREATE TABLE governance_votes (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id           UUID NOT NULL REFERENCES governance_proposals(id),
  voter_id              UUID NOT NULL REFERENCES users(id),
  vote                  TEXT NOT NULL CHECK (vote IN ('for','against','abstain')),
  vote_weight           FLOAT NOT NULL,
  reason                TEXT,
  voted_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(proposal_id, voter_id)         -- One vote per user per proposal
);

-- ── GOVERNANCE: DISCUSSION ───────────────────────────────────

CREATE TABLE governance_discussion (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id           UUID NOT NULL REFERENCES governance_proposals(id),
  user_id               UUID NOT NULL REFERENCES users(id),
  comment               TEXT NOT NULL,
  epistemic_quality     FLOAT DEFAULT 0.5,
  upvotes               INTEGER DEFAULT 0,
  posted_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── TRANSPARENCY LOG ─────────────────────────────────────────
-- Immutable record of every algorithm change. Ever.
-- This is the public audit trail.

CREATE TABLE transparency_log (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  logged_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  change_type           TEXT NOT NULL,
  description           TEXT NOT NULL,
  triggered_by          TEXT NOT NULL,    -- 'governance_vote' | 'human_correction' | 'scheduled_retrain'
  proposal_id           UUID REFERENCES governance_proposals(id),
  before_state          JSONB,
  after_state           JSONB,
  algorithm_version     TEXT NOT NULL DEFAULT '0.1'
);

-- Transparency log is append-only — no updates, no deletes
CREATE RULE transparency_log_no_update AS ON UPDATE TO transparency_log DO INSTEAD NOTHING;
CREATE RULE transparency_log_no_delete AS ON DELETE TO transparency_log DO INSTEAD NOTHING;

-- ── VIEWS ────────────────────────────────────────────────────

-- Flourishing health of the platform (updated by materialized view refresh)
CREATE MATERIALIZED VIEW platform_health AS
SELECT
  DATE_TRUNC('day', s.started_at)     AS date,
  COUNT(DISTINCT s.user_id)            AS active_users,
  AVG(s.flourishing_avg)               AS avg_flourishing_score,
  AVG(s.mood_delta)                    AS avg_mood_delta,
  AVG(s.perspectives_seen)             AS avg_perspectives_seen,
  SUM(s.items_served)                  AS total_items_served,
  COUNT(hc.id)                         AS human_corrections,
  AVG(hc.correction_magnitude)         AS avg_correction_magnitude
FROM sessions s
LEFT JOIN human_corrections hc ON hc.submitted_at::DATE = s.started_at::DATE
GROUP BY DATE_TRUNC('day', s.started_at)
ORDER BY date DESC;

CREATE UNIQUE INDEX ON platform_health(date);

-- ── DELETION CASCADE FUNCTION ────────────────────────────────
-- Right to be forgotten. Called when user requests deletion.

CREATE OR REPLACE FUNCTION delete_user_data(target_user_id UUID)
RETURNS void AS $$
BEGIN
  -- Anonymize rather than hard-delete where references are needed for research
  UPDATE content          SET author_id = 'deleted' WHERE author_id = target_user_id::TEXT;
  DELETE FROM behavioral_signals  WHERE user_id = target_user_id;
  DELETE FROM mood_checkins       WHERE user_id = target_user_id;
  DELETE FROM human_corrections   WHERE user_id = target_user_id;
  DELETE FROM feed_events         WHERE user_id = target_user_id;
  DELETE FROM sessions            WHERE user_id = target_user_id;
  DELETE FROM user_preferences    WHERE user_id = target_user_id;
  DELETE FROM users               WHERE id      = target_user_id;

  -- Log the deletion (without personal data)
  INSERT INTO transparency_log (change_type, description, triggered_by, algorithm_version)
  VALUES ('user_deletion', 'User exercised right to be forgotten', 'user_request', '0.1');
END;
$$ LANGUAGE plpgsql;
