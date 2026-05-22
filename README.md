# teams-maker

**Inspired by Hermes.** Structured AI agent teams through a guided interview — generates all agent files, runbooks, heartbeat/audit scripts, and shared memory.

Install into any AI tool:

```bash
npx teams-maker
```

Detects Claude Code, OpenCode, Cursor, Windsurf, Continue.dev, Goose, and Amp — places the skill in the right format for each.

## What it does

Walks you through a step-by-step interview to define a team of AI agents (their souls, identities, hierarchy, communication style) then generates the full file structure:

```
.teams/team-name/
  agent-name/
    soul.md          — Core identity, never modified
    identity.md      — Role & presentation
    agent.md         — Operational runbook
    memory.md        — Episodic memory (2048 char limit)
    skills.md        — Self-learned skills
    skills-revaluate.md  — Skill states: active/stale/archived
  runbook.md         — Sequencing, hierarchy, how to prompt
  shared-memory.md   — Cross-session context (auto-generated)
  scripts/
    heartbeat.py     — Agent health check (memory/skills)
    audit-team.py    — Pre-invocation team diagnostic
```

## Caveat

Still sloppy. Works well enough for real use — but expect rough edges. Improvements welcome.

## Usage

After `npx teams-maker`, the skill is available in your AI tool's agent skill directory. Trigger it by asking your agent to "create a team" or "build an agent team".

## License

MIT
