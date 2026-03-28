# Contributing to the Human Survival Algorithm

First — thank you for being here.

This project exists because a small number of people believed
that building something better was possible. If you are reading
this, you are one of those people now.

This document tells you how to contribute — technically,
intellectually, and as a human being.

---

## Table of Contents

1. [Who we need](#who-we-need)
2. [Code of conduct](#code-of-conduct)
3. [Getting started](#getting-started)
4. [How to contribute](#how-to-contribute)
5. [Technical contribution areas](#technical-contribution-areas)
6. [Non-technical contribution areas](#non-technical-contribution-areas)
7. [Pull request process](#pull-request-process)
8. [Governance participation](#governance-participation)
9. [A note on disagreement](#a-note-on-disagreement)

---

## Who we need

We need people from every background imaginable.
This project will fail if it is built by one kind of person.

**Engineers** — Node.js, Python, ML/AI, database, infrastructure, security

**Researchers** — psychology, sociology, epistemology, ethics, public health,
network science, misinformation studies, wellbeing science

**Domain experts** — mental health practitioners, journalists, philosophers,
contemplatives, educators, community organizers

**Lived experience** — people who have been harmed by current algorithms,
people who have found healing online, people who understand what genuine
human connection feels like and can help us measure it

**Translators and localizers** — flourishing is not one-size-fits-all.
We need people who understand what it means in different cultures,
languages, and contexts

**Skeptics** — people who think this will not work and can tell us why.
We need you most of all.

If you do not see yourself in this list, you probably still belong here.

---

## Code of conduct

Three principles. Non-negotiable.

**1. Dignity first.**
Every person who contributes, every user the system serves,
every human whose content is analyzed — has inherent worth.
Communicate accordingly.

**2. Epistemic honesty.**
Say what you actually think. Acknowledge uncertainty.
Change your mind when evidence warrants it.
The system we are building rewards intellectual honesty.
So do we.

**3. The mission over the ego.**
This project is not about any one contributor's reputation.
It is about building something that helps human beings flourish.
Contributions that serve that mission are welcome.
Contributions that serve individual status at the mission's expense are not.

Violations of these principles are handled by the community governance layer —
the same governance that governs the algorithm itself.

---

## Getting started

### Prerequisites

```bash
node >= 18.0.0
docker + docker-compose
postgresql >= 16 (or use docker-compose)
git
```

### Local setup

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/human-survival-algorithm.git
cd human-survival-algorithm

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env
# Edit .env with your local values

# 4. Start the full stack
docker-compose --profile dev up

# 5. Run database migrations
npm run migrate

# 6. Seed with test data
npm run seed

# 7. Verify everything works
curl http://localhost:3000/health
```

### Running tests

```bash
npm test               # Run full test suite
npm run test:watch     # Watch mode during development
```

All pull requests must pass the full test suite.
New features must include tests.
Bug fixes must include a test that reproduces the bug.

---

## How to contribute

### Found a bug?

1. Search existing issues first — it may already be reported
2. Open a new issue with:
   - Clear title describing the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Your environment (node version, OS, etc.)
3. Label it `bug`

### Have a feature idea?

1. Open a discussion first (not an issue) — describe the idea and why it serves the mission
2. Get community feedback before building
3. If there is consensus, open an issue and link to the discussion
4. Build it, submit a PR

### Want to improve an existing module?

1. Comment on the relevant issue or open a new one
2. Describe your approach before starting
3. Build and test thoroughly
4. Submit a PR with clear documentation of what changed and why

### Want to improve the ML models?

See the [ML contribution guide](#ml-and-data-science-contributions) below.
Model changes require extra review — they affect the entire system.

### Want to improve governance?

Governance changes go through the governance layer itself —
not through GitHub PRs. See [Governance participation](#governance-participation).

---

## Technical contribution areas

These are the areas where engineering help is most needed.
Each links to the relevant module.

### 🧠 Core algorithm improvements (`flourishing_score.js`)

- Improve dimension weight calibration
- Add new flourishing dimensions with research backing
- Improve the human feedback incorporation pipeline
- Performance optimization for high-volume scoring

**Entry point:** Issues labeled `core-algorithm`

---

### 💚 Wellbeing analyzer (`wellbeing_analyzer.js`)

- Improve the afterglow score prediction
- Add support for new languages and cultural contexts
- Improve the vulnerability detection model
- Add more nuanced emotional taxonomy entries

**Entry point:** Issues labeled `wellbeing`

---

### 🔍 Truth engine (`truth_engine.js`)

- Add new manipulation tactic detectors
- Improve fact-checking API integrations
- Build the community fact-check integration layer
- Improve reasoning quality analysis

**Entry point:** Issues labeled `truth-engine`

**Special note:** Changes to the manipulation detector require
review by at least two domain experts (journalism, rhetoric, or psychology)
before merging. This is to prevent the model from being used to
silence legitimate advocacy, satire, or emotional expression.

---

### 🤝 Connection engine (`connection_engine.js`)

- Improve the parasocial vs genuine connection classifier
- Build the offline pathway detector
- Improve the social graph health analyzer
- Add cultural context to connection type definitions

**Entry point:** Issues labeled `connection`

---

### 🌉 Symbiosis bridge (`symbiosis_bridge.js`)

- Improve the intent translation NLP
- Build the behavioral signal processor
- Improve the evolution loop (human correction → model retraining)
- Build the transparency dashboard

**Entry point:** Issues labeled `symbiosis`

---

### 📡 Feed constructor (`feed_constructor.js`)

- Improve the composition rules
- Build the session gate system
- Improve diversity interlacing
- Performance optimization for large candidate pools

**Entry point:** Issues labeled `feed`

---

### 🗳️ Governance layer (`governance_layer.js`)

- Build the full voting UI
- Build the deliberation discussion system
- Build the expert verification system
- Build the transparency dashboard

**Entry point:** Issues labeled `governance`

---

### 🖥️ API server (`api_server.js`)

- Add authentication middleware
- Add comprehensive request validation
- Add API documentation (OpenAPI/Swagger)
- Add monitoring and observability
- Performance and load testing

**Entry point:** Issues labeled `api`

---

### 🗄️ Database (`schema.sql`)

- Query optimization
- Add missing indexes
- Build the migration system
- Build the data export pipeline (GDPR compliance)

**Entry point:** Issues labeled `database`

---

### ML and data science contributions

This is where the algorithm goes from prototype to reality.

**What we need most:**

1. **Training data curation** — Help build labeled datasets for each model.
   Each model has a specification in `ml_model_specs.yml`.
   Data curation requires domain knowledge — not just technical skill.

2. **Model implementation** — Replace the stub functions in each engine
   with real inference calls to trained models.

3. **Bias auditing** — Every model must be audited before deployment.
   We need people who specialize in algorithmic fairness.

4. **Evaluation framework** — Build the evaluation pipeline that measures
   model performance against human judgment.

**How to contribute ML work:**

- All training data must be publicly documented before use
- All model cards must be written before model is merged
- All models must pass bias audit before deployment
- Adversarial testing results must be published

**Entry point:** Issues labeled `ml` and `data`

---

## Non-technical contribution areas

The algorithm is only as good as the human wisdom behind it.

### Research contributions

We need people who can:
- Review the psychological and sociological assumptions behind each engine
- Point us to relevant research we are missing
- Challenge assumptions that are wrong
- Write research summaries that improve our training data guidelines

If you are a researcher: open a discussion, share your work,
tell us where we are wrong. That is the most valuable contribution.

### Translation and localization

The flourishing taxonomy was written in English by a small group.
It reflects certain cultural assumptions.

We need:
- Translations of all user-facing text
- Cultural review of the emotional taxonomy
- Local context for what "genuine connection" means across cultures
- Review of the spiritual/meaning scorer for cultural universality

### Annotation and labeling

The ML models require human-labeled training data.
We will run periodic annotation campaigns.

Annotators are paid fairly.
Annotation guidelines are published publicly.
All annotator demographics are tracked to ensure diversity.

If you want to be notified of annotation campaigns:
open an issue labeled `annotation-interest` with your domain expertise.

### Documentation

Good documentation is as important as good code.

- API documentation
- Tutorials for platform integrators
- Plain-language explanations of how each engine works
- Translation of technical concepts for non-technical stakeholders

---

## Pull request process

1. **One PR, one thing.** Do not bundle multiple unrelated changes.

2. **Write a clear description.** Explain what changed, why,
   and how it serves the mission. Link to the relevant issue.

3. **Tests required.** No exceptions for code changes.

4. **Documentation required.** If your change affects behavior,
   update the relevant documentation.

5. **Review process:**
   - All PRs require at least 2 approvals
   - Changes to core algorithm require a domain expert review
   - Changes to ML models require an extra review cycle
   - Changes to governance require community discussion first

6. **Merge policy:** Squash and merge. Clean commit history.

7. **Breaking changes:** Must be discussed in an issue first.
   Must include a migration path.
   Must be clearly labeled in the PR and changelog.

---

## Governance participation

Code is not the only way to shape this project.

The governance layer itself is the mechanism for changing
fundamental decisions about the algorithm — dimension weights,
value registry entries, feature additions, policy decisions.

**Anyone can:**
- Propose a change via `POST /api/governance/propose`
- Vote on active proposals
- Participate in deliberation discussions
- Request expert endorsement review

**Voting weight increases with:**
- Account age (up to 30 days for full weight)
- Verified expertise in a relevant domain

**Non-negotiable protections** (cannot be changed by any vote):
- Human dignity
- Freedom of mind (no covert manipulation)
- Transparency (all ranking decisions auditable)
- Right to exit (data portability and deletion)
- Child protection
- Algorithm honesty

For major governance questions — changes to the fundamental
architecture, licensing, or mission — we hold open community calls.
Dates announced in the repository discussions.

---

## A note on disagreement

This project will attract disagreement. Good.

We will disagree about what flourishing means.
We will disagree about which manipulation tactics are manipulation
and which are legitimate persuasion.
We will disagree about how much diversity injection is too much.
We will disagree about governance structure.
We will disagree about the business model.

These disagreements are not problems to be avoided.
They are the process by which the system gets better.

What we ask is that disagreement be conducted with the same
epistemic quality the algorithm is designed to promote:

- Make your actual argument
- Cite your evidence
- Acknowledge what you do not know
- Be willing to change your mind
- Treat the person you disagree with as a human being

If we cannot do this in the building of the system,
we cannot claim the system will do it at scale.

---

## Thank you

For every hour you put into this.
For every assumption you challenge.
For every line of code, every labeled example,
every translation, every research paper shared.

The world the current algorithm is building is not inevitable.

We are building a different one.

---

*Human Survival Algorithm — Community Governed, Open Source, Built for Everyone*
*License: AGPL-3.0*
*https://github.com/human-survival-algorithm/core*
