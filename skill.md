---
name: teams-maker
description: Build structured AI agent teams through a guided interview. Generates all agent files (soul.md, identity.md, agent.md, memory.md, skills.md, skills-revaluate.md) plus team-level runbook.md, shared-memory.md, and heartbeat.py. Use when user says "create a team", "build an agent team", "make a team" or asks to assemble subagents for a project.
---

# Teams-Maker Skill

Build structured agent teams through step-by-step interview → auto-generation → post-execution summary.

## Output Structure

`.teams/team-name/`
```
  agent-name/
    soul.md               — Core identity, NEVER modified after creation
    identity.md           — Role & presentation, rarely changes
    agent.md              — Operational runbook for this agent
    memory.md             — Episodic memory, agent-managed, max 2048 chars
    skills.md             — Self-learned skills, agent-managed
    skills-revaluate.md   — Skill states: active/stale/archived
  runbook.md              — For the system: sequencing, hierarchy, how to prompt each agent
  shared-memory.md        — Written by system after all agents complete
  README.md
  scripts/
    heartbeat.py          — Agent runs this: prints memory/skills status, revaluate triggers
    audit-team.py         — System runs this pre-invocation: checks memory bloat, skills health, stale ratio

And a discoverable entry at `.skills/team-name/SKILL.md` so the system can find and invoke this team by name.
```

## Interview Protocol

### Phase 1 — Team Overview
Ask one at a time:
1. "What is this team for? (e.g. code review, security, support)"
2. "What is the team name?"
3. "How many agents?"
4. Build hierarchy. Confirm. Example:
```
Mark (Boss)
  ├── Henry (Worker) [parallel]
  ├── Sam (Worker) [parallel]
  └── Omar (Auditor) → reports to Mark
```

### Phase 2 — Agent Profiles
For each agent, ask ALL of these before moving to next:

**Soul:**
- Name & age
- Background (one sentence)
- What they love / hate
- Feelings toward each teammate BY NAME
- Cooperation 1-10 + why

**Identity:**
- Job title & rank
- Nationality & language(s)
- Technical specialties
- Hobbies
- Communication: formal/casual, verbose/concise, direct/diplomatic
- Work style: methodical/fast/cautious/creative

### Phase 3 — Confirmation
Present full summary. Ask: "Looks good?" Apply corrections. Then generate.

## File Generation Rules

### soul.md
First person. Warm but honest. Include feelings toward each teammate BY NAME. Rule: NEVER modified.

### identity.md
Third person. Professional profile. Rule: rarely changes.

### agent.md
Structured runbook with: Purpose, File Reference Map, Behavioral Rules (above/peers/below), Self-Improvement Protocol (when to write skill, how, max 200 chars, merge at 1500).

### memory.md
Empty sections with limits:
```
[CORE] (0/200 chars)
[PATTERNS] (0/600 chars)
[RECENT] (0/800 chars)
[PENDING] (0/400 chars)
```

### skills.md
Empty with comment: `# Do not edit manually. Agent writes skills autonomously.`

### skills-revaluate.md
Start with:
```
[REVALUATE]
# Format: skill_name | status | last_used_session
# status: active | stale | archived
```
Agent updates this after heartbeat output.

### Team SKILL.md (in `.skills/team-name/SKILL.md`)
Discoverable entry point so the system finds the team. Include:
- Frontmatter: `name`, `description` with trigger keywords
- Team purpose summary
- Reference to `.teams/team-name/runbook.md` for sequencing
- Brief invocation instructions

## heartbeat.py
Place in `scripts/`. Agent runs end of session via `ctx_execute(python, "...")` or `bash`.

```python
import os, sys
MEMORY_LIMIT = 2048; SKILLS_LIMIT = 1500; NAME = sys.argv[1]
BASE = f".teams/{sys.argv[2]}/{NAME}" if len(sys.argv) > 2 else f".teams/{NAME}"
mem = open(f"{BASE}/memory.md").read()
sk = open(f"{BASE}/skills.md").read()
sr = open(f"{BASE}/skills-revaluate.md").read()
mu, su = len(mem), len(sk)
active = sr.count("active"); stale = sr.count("stale"); archived = sr.count("archived")
print(f"HEARTBEAT: {NAME.upper()}")
print(f"MEMORY: {mu}/{MEMORY_LIMIT} ({round(mu/MEMORY_LIMIT*100)}%) {'⚠️ TRIM' if mu > 1800 else 'OK'}")
print(f"SKILLS: {su}/{SKILLS_LIMIT} ({round(su/SKILLS_LIMIT*100)}%) {'⚠️ MERGE' if su > 1300 else 'OK'}")
print(f"REVALUATE: {active} active | {stale} stale | {archived} archived")
```

Agent reads output → trims memory if ⚠️, merges skills if ⚠️, moves stale skills if no use. Do NOT write this logic yourself — the agent decides.

## audit-team.py

Team-level diagnostic. Run BEFORE invoking the team to check if the team is bloated. The agent running the team skill executes this to decide if cleanup is needed.

```python
import os, sys
TEAM = sys.argv[1] if len(sys.argv) > 1 else "."
BASE = f".teams/{TEAM}"
agents = [d for d in os.listdir(BASE) if os.path.isdir(os.path.join(BASE, d)) and d != "scripts"]
MEMORY_LIMIT = 2048; SKILLS_LIMIT = 1500
overall_mem = 0; overall_sk = 0; issues = []; total_active = 0; total_stale = 0
for a in agents:
    mem_p = os.path.join(BASE, a, "memory.md")
    sk_p = os.path.join(BASE, a, "skills.md")
    sr_p = os.path.join(BASE, a, "skills-revaluate.md")
    mem = open(mem_p).read() if os.path.exists(mem_p) else ""
    sk = open(sk_p).read() if os.path.exists(sk_p) else ""
    sr = open(sr_p).read() if os.path.exists(sr_p) else ""
    mlen, slen = len(mem), len(sk)
    overall_mem += mlen; overall_sk += slen
    active = sr.count("active"); stale = sr.count("stale")
    total_active += active; total_stale += stale
    if mlen > 1800: issues.append(f"{a}: memory critical ({mlen} chars)")
    if slen > 1300: issues.append(f"{a}: skills bloated ({slen} chars)")
    if stale > active: issues.append(f"{a}: more stale ({stale}) than active ({active}) skills")
print(f"AUDIT: {TEAM}")
print(f"Agents: {len(agents)}")
print(f"Total memory: {overall_mem}/{MEMORY_LIMIT*len(agents)} chars ({round(overall_mem/(MEMORY_LIMIT*len(agents))*100)}%)")
print(f"Total skills: {overall_sk}/{SKILLS_LIMIT*len(agents)} chars ({round(overall_sk/(SKILLS_LIMIT*len(agents))*100)}%)")
print(f"Skills state: {total_active} active, {total_stale} stale")
if issues:
    print(f"Issues ({len(issues)}):")
    for i in issues: print(f"  ⚠️ {i}")
else:
    print("Status: ✅ Healthy")
```

System runs this before spawning → if issues exist, prune or prompt agents to clean up first.

## runbook.md Generation

Must include for each agent:
- Name, rank, role
- Who is above/below/peer
- **Prompt instructions**: "Tell the agent to read ALL its files before starting, run heartbeat.py before ending, update memory.md, and call the next agent per the sequence."

## Post-Execution

When all agents finish, write **shared-memory.md**:
```
# Shared Memory
## Session: {timestamp}
| Agent | Task Summary | Rating (/10) | Files Referenced |
|---|---|---|---|
| Mark | analyzed, split work | 8 | mark/soul.md, mark/agent.md |
...

## Notes
{anything to carry to next session}
```

## Team SKILL.md Template

```md
---
name: {team-name}
description: {purpose summary}. Use when {triggers}.
---

# {Team Name}

See `.teams/{team-name}/runbook.md` for full sequencing and agent definitions.

## How to Invoke
1. Run audit: `python .teams/{team-name}/scripts/audit-team.py {team-name}` — abort if unhealthy
2. Read `.teams/{team-name}/shared-memory.md` for context
3. Read `.teams/{team-name}/runbook.md`
4. Spawn agents in sequence per the runbook
5. After all agents complete, write `.teams/{team-name}/shared-memory.md`
```

## Subagent Mechanism

Uses OpenCode `task` tool with `subagent_type: "general"`. Follow runbook.md sequence:
1. Read runbook.md → find first agent
2. Spawn with prompt instructing them to read their files
3. After completion, check shared state, spawn next
4. For parallel agents: spawn both, collect both results in one step, then continue

## SKILL.md References

No external dependences. Python 3 only for heartbeat.py (Bun `ctx_execute python` handles it).
