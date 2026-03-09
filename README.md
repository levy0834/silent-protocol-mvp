# Silent Protocol MVP

Web-playable prototype for an **AGI gacha-inspired roguelite + light squad tactics** loop, built to stay WeChat-mini-game-friendly.

## MVP Intent
- Prioritize `A + C`: build爽感 + 少量策略感
- Keep scope tight and demo-first
- Use placeholder visuals and readable systems
- Run fully local with **no backend**

## Current Playable Slice
- Static single-page app (`HTML/CSS/JS`)
- Full run flow:
  - Title -> Squad Assembly -> Node Protocol Choice -> Battle -> Directive Reward -> Run End
- 4-agent roster with distinct roles:
  - `Tactician`, `Vanguard`, `Skirmisher`, `Support`
- Deploy up to **3 agents** per encounter
- 4-node run structure:
  - 2 skirmish nodes, 1 elite node, 1 boss node
- Pre-battle node protocol choice each node (pick 1 risk/reward modifier before deploy)
- Enemy archetypes with telegraphed intents (`Strike`, `Pierce`, `Sweep`, `Jam`, etc.)
- Boss identity pass on `Protocol Prime`:
  - Multi-phase escalation (phase shifts at 70% and 35% HP)
  - Signature intents: `Lockdown Pulse`, `Annihilate Beam`
  - Readability panel: integrity %, current phase, next shift threshold, next phase signature
- Tactical combat actions:
  - `Attack`, `Defend`, role `Skill`, `Sync Burst`
- Status/economy layer:
  - `Guard`, `Barrier`, `Jam`, `Exposed`, energy costs
- Reward/build layer:
  - Between-node directive choices including role-specific upgrades
- Battle readability pass:
  - HP bars
  - Intent threat + likely target + effect forecast
  - Per-turn recap panel

## Deployment Status
Status as of **March 9, 2026**:
- No live URL yet
- No git remote configured yet
- GitHub Pages workflow is present at `.github/workflows/deploy-pages.yml`
- Deployment path is static, no backend and no npm/build chain

## Run Locally
Recommended:
```bash
cd /Users/levy/.openclaw/workspace/projects/silent-protocol-mvp
python3 -m http.server 8080
```
Then open:
- `http://localhost:8080`

Quick open (also works for this MVP):
- Open `index.html` directly in a browser.

Sanity check JS syntax:
```bash
node --check app.js
```

## Controls
- Start run from title screen
- Select squad members on Squad Assembly (up to 3)
- Select one `Node Protocol` before each deployment (mandatory)
- Deploy to current node
- In battle:
  - Click `Control` on an agent
  - Use action buttons (`Attack`, `Defend`, `Skill`, `Sync Burst`)
- Choose one directive reward after each non-final win
- Clear all 4 nodes to win the run

## Project Files
- `README.md`: quick setup + current playable scope
- `DESIGN.md`: MVP scope and loop notes
- `index.html`: app shell
- `styles.css`: visual theme + layout + combat UI blocks
- `app.js`: run state, encounters, combat, rewards, screen rendering

## Notes
- Architecture stays intentionally simple for fast iteration.
- No persistence yet; each browser refresh resets run state.

## Deployment (GitHub Pages)
No backend or build step is required. The workflow stages static files from repo root and deploys with GitHub Actions.

1. Create first commit:
```bash
git add .
git commit -m "Initial playable MVP with Pages deployment scaffold"
```
2. Create and push the GitHub repo:
```bash
gh repo create silent-protocol-mvp --public --source=. --remote=origin --push
```
3. In GitHub, open `Settings -> Pages -> Build and deployment -> Source` and set source to **GitHub Actions**.
4. Push to `main` (the command above already does this once):
```bash
git push
```
5. Wait for workflow **Deploy GitHub Pages** to pass in `Actions`.
6. Open:
   - `https://<github-username>.github.io/silent-protocol-mvp/`

If you do not use `gh repo create`, push manually:
```bash
git branch -M main
git remote add origin git@github.com:<github-username>/silent-protocol-mvp.git
git push -u origin main
```
