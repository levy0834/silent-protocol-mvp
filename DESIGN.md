# Silent Protocol MVP - Current Design Snapshot

## 1) Scope
**Goal:** keep a fast, static, local playable demo while making the run feel closer to AGI roguelite squad tactics.

**Still constrained by MVP rules:**
- No backend
- Plain JS + DOM
- Small code surface
- Placeholder visual style

## 2) Core Gameplay Loop (Current)
1. Start run
2. Assemble squad (pick up to 3 from 4 agents)
3. Choose one **Node Protocol** risk/reward modifier
4. Deploy to current node
5. Battle with role actions + enemy intent pressure
6. On win, apply auto-repair and choose 1 directive reward
7. Repeat through 4-node path
8. Defeat boss node for run victory

## 3) Encounter Structure
- Node 1: `Skirmish` (intro pressure)
- Node 2: `Skirmish` (higher disruption)
- Node 3: `Elite` (higher stat + intent pressure)
- Node 4: `Boss` (`Protocol Prime`)

Each node announces likely enemy archetypes before deployment.

## 4) Squad & Role Identity
Agents now have distinct role kits:
- `Tactician`:
  - Skill applies `Exposed` to amplify squad damage
- `Vanguard`:
  - Skill creates frontline (`Guard`, `Taunt`, `Barrier`)
- `Skirmisher`:
  - Burst skill with finisher bonus on low-HP enemies
- `Support`:
  - Healing + barrier sustain, with upgrade-driven cleanse

Shared combat actions:
- `Attack`
- `Defend`
- Role `Skill`
- `Sync Burst` (high-cost spike)

## 5) Enemy Model
Enemies are archetypes with intent patterns:
- `Strike`
- `Pierce`
- `Pulse Sweep`
- `Signal Jam`
- `Fortify`
- `Overload`

Intent is shown before player action for clearer tactical reads.

Boss identity (`Protocol Prime`) now includes:
- Multi-phase behavior (phase shifts at 70% and 35% HP)
- Unique boss routines:
  - `Lockdown Pulse` (team-wide jam pressure)
  - `Annihilate Beam` (high single-target execution)
- Dossier callouts on squad/battle UI to telegraph boss rules

Battle readability layer includes:
- HP bars on agents/enemy
- Intent threat + likely target + forecast chips
- Turn recap panel after each player action resolution

## 6) Pre-Battle Node Protocol Layer
Before each deployment, pick 1 protocol:
- `Overclock Surge`: +1 EN start / enemy +2 ATK
- `Firewall Breach`: enemy starts Exposed / enemy +6 Armor
- `Kinetic Shielding`: squad +2 Barrier / enemy +2 Charge
- `Jam Override`: enemy -1 ATK / squad starts Jammed

This adds one lightweight strategic decision per node without changing architecture.

## 7) Reward/Build Layer
Between encounters, pick one directive reward from a small set:
- Economy upgrades (`starting energy`, `post-battle repair`)
- Global stat upgrades (`ATK`, `max HP`)
- Role-specific upgrades (Tactician/Vanguard/Skirmisher/Support)

This creates lightweight build flavor without heavy meta systems.

## 8) In / Out
### In
- Full local playable run (title -> squad -> node protocol -> battle -> reward -> end)
- Distinct role gameplay
- Enemy intent clarity + threat forecast
- Boss phase identity
- Build identity through directives

### Out
- Persistent progression/account economy
- Complex target grid/positioning system
- Large status ecosystem or deckbuilder complexity
- Backend services

## 9) Immediate Next Best Iteration
- Lightweight balance tuning pass on node protocol risk/reward values.
- Capture and share one hosted static URL (GitHub Pages or Netlify) for external playtest.
