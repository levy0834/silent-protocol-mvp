const CONFIG = {
  maxSquadSize: 3,
  rewardChoices: 3,
  logSize: 16,
  energyCap: 4,
};

const NODE_PLAN = [
  { id: 1, label: "Ingress Breach", danger: "Skirmish", enemies: ["warden", "hunter"] },
  { id: 2, label: "Signal Ambush", danger: "Skirmish", enemies: ["hunter", "siren"] },
  { id: 3, label: "Control Vault", danger: "Elite", enemies: ["brute", "siren"] },
  { id: 4, label: "Silent Core", danger: "Boss", enemies: ["prime"] },
];

const NODE_OPERATION_POOL = [
  {
    id: "overclock-surge",
    title: "Overclock Surge",
    reward: "All deployed agents start with +1 EN.",
    risk: "Enemy gains +2 ATK this encounter.",
  },
  {
    id: "firewall-breach",
    title: "Firewall Breach",
    reward: "Enemy starts Exposed for 2 turns.",
    risk: "Enemy starts with +6 Armor.",
  },
  {
    id: "kinetic-shielding",
    title: "Kinetic Shielding",
    reward: "All deployed agents start with +2 Barrier.",
    risk: "Enemy starts with +2 Charge.",
  },
  {
    id: "jam-override",
    title: "Jam Override",
    reward: "Enemy ATK is reduced by 1 for this encounter.",
    risk: "All deployed agents start Jammed (1).",
  },
];

const AGENT_TEMPLATES = [
  {
    id: "seer",
    name: "Seer-17",
    role: "Tactician",
    hpMax: 18,
    atk: 4,
    passive: "Gets +1 damage against Exposed targets.",
    skill: {
      id: "forecast",
      title: "Forecast Lock",
      cost: 1,
      desc: "Deal light damage and apply Exposed.",
    },
  },
  {
    id: "bulwark",
    name: "Bulwark-5",
    role: "Vanguard",
    hpMax: 30,
    atk: 3,
    passive: "Guard cuts incoming hit by 2 damage.",
    skill: {
      id: "anchor",
      title: "Anchor Wall",
      cost: 1,
      desc: "Gain Guard + Taunt + Barrier.",
    },
  },
  {
    id: "ghost",
    name: "Ghost-I",
    role: "Skirmisher",
    hpMax: 16,
    atk: 6,
    passive: "Extra execution damage on low-HP enemies.",
    skill: {
      id: "phase",
      title: "Phase Lunge",
      cost: 2,
      desc: "High burst. Bigger finisher below 35% HP.",
    },
  },
  {
    id: "loom",
    name: "Loom-9",
    role: "Support",
    hpMax: 22,
    atk: 3,
    passive: "Keeps squad stable with barrier sustain.",
    skill: {
      id: "patchwave",
      title: "Patchwave",
      cost: 1,
      desc: "Heal and shield the most injured ally.",
    },
  },
];

const ENEMY_TEMPLATES = {
  warden: {
    id: "warden",
    name: "Firewall Warden",
    role: "Bulwark Routine",
    hpMax: 28,
    atk: 4,
    pattern: ["strike", "fortify", "strike", "jam"],
  },
  hunter: {
    id: "hunter",
    name: "Trace Hunter",
    role: "Execution Routine",
    hpMax: 22,
    atk: 5,
    pattern: ["pierce", "jam", "pierce", "strike"],
  },
  siren: {
    id: "siren",
    name: "Null Siren",
    role: "Disruptor Routine",
    hpMax: 26,
    atk: 4,
    pattern: ["sweep", "jam", "strike", "sweep"],
  },
  brute: {
    id: "brute",
    name: "Gate Brute",
    role: "Elite Sentinel",
    hpMax: 34,
    atk: 6,
    pattern: ["strike", "fortify", "sweep", "strike"],
  },
  prime: {
    id: "prime",
    name: "Protocol Prime",
    role: "Core Overseer",
    hpMax: 60,
    atk: 7,
    pattern: ["strike", "jam", "sweep", "overload"],
    phasePatterns: {
      1: ["strike", "jam", "sweep", "overload", "strike"],
      2: ["pierce", "lockdown", "strike", "overload", "sweep"],
      3: ["annihilate", "jam", "sweep", "overload", "annihilate"],
    },
    dossier: [
      "Adaptive Core: shifts into harder routines at 70% and 35% integrity.",
      "Phase shifts immediately spike armor and damage pressure.",
    ],
  },
};

const INTENT_META = {
  strike: {
    label: "Strike",
    desc: "Medium damage to one target.",
    threat: "medium",
  },
  pierce: {
    label: "Pierce",
    desc: "Hits lowest HP target and ignores Guard.",
    threat: "high",
  },
  sweep: {
    label: "Pulse Sweep",
    desc: "Low damage to all deployed agents.",
    threat: "high",
  },
  jam: {
    label: "Signal Jam",
    desc: "Light damage and blocks next energy gain.",
    threat: "medium",
  },
  fortify: {
    label: "Fortify",
    desc: "Adds armor and chips one target.",
    threat: "medium",
  },
  overload: {
    label: "Overload",
    desc: "Charges for a heavier next attack.",
    threat: "low",
  },
  lockdown: {
    label: "Lockdown Pulse",
    desc: "Jams the full squad and inflicts light area damage.",
    threat: "high",
  },
  annihilate: {
    label: "Annihilate Beam",
    desc: "Heavy strike on the highest HP target. Ignores Guard.",
    threat: "extreme",
  },
};

const REWARD_POOL = [
  {
    id: "nanite-sweep",
    title: "Nanite Sweep",
    desc: "Instantly heal all alive agents for 5 HP.",
    repeatable: true,
    persistent: false,
    apply: (run) => {
      run.roster.forEach((agent) => {
        if (agent.hp > 0) {
          agent.hp = Math.min(agent.hpMax, agent.hp + 5);
        }
      });
    },
  },
  {
    id: "kinetic-compiler",
    title: "Kinetic Compiler",
    desc: "+1 ATK to all agents.",
    repeatable: false,
    persistent: true,
    apply: (run) => {
      run.roster.forEach((agent) => {
        agent.atk += 1;
      });
    },
  },
  {
    id: "cold-start-cells",
    title: "Cold Start Cells",
    desc: "Future battles start with +1 EN (max +3).",
    repeatable: true,
    persistent: true,
    apply: (run) => {
      run.mods.startingEnergy = Math.min(3, run.mods.startingEnergy + 1);
    },
  },
  {
    id: "self-repair-daemon",
    title: "Self-Repair Daemon",
    desc: "Post-battle auto-repair +2 HP.",
    repeatable: true,
    persistent: true,
    apply: (run) => {
      run.mods.postBattleHeal += 2;
    },
  },
  {
    id: "seer-uplink",
    title: "Seer Uplink",
    desc: "Exposed duration +1 and exposed damage +1.",
    repeatable: false,
    persistent: true,
    apply: (run) => {
      run.mods.tacticianExposeTurns += 1;
      run.mods.exposedBonus += 1;
    },
  },
  {
    id: "bulwark-mesh",
    title: "Bulwark Mesh",
    desc: "Vanguard Defend grants all allies +1 Barrier.",
    repeatable: false,
    persistent: true,
    apply: (run) => {
      run.mods.vanguardBarrierAura = true;
    },
  },
  {
    id: "ghost-firmware",
    title: "Ghost Firmware",
    desc: "Skirmisher skill cost -1 and finisher damage +2.",
    repeatable: false,
    persistent: true,
    apply: (run) => {
      run.mods.skirmisherCostMod += 1;
      run.mods.skirmisherFinisherBonus += 2;
    },
  },
  {
    id: "loom-injector",
    title: "Loom Injector",
    desc: "Support Patchwave heals +3 and clears Jam.",
    repeatable: false,
    persistent: true,
    apply: (run) => {
      run.mods.supportHealBonus += 3;
      run.mods.supportCleanseAll = true;
    },
  },
  {
    id: "hull-splice",
    title: "Hull Splice",
    desc: "+4 Max HP and +4 HP to all agents.",
    repeatable: true,
    persistent: true,
    apply: (run) => {
      run.roster.forEach((agent) => {
        agent.hpMax += 4;
        agent.hp = Math.min(agent.hpMax, agent.hp + 4);
      });
    },
  },
];

const state = {
  screen: "title",
  run: null,
  battle: null,
  pendingRewards: [],
  runResult: null,
  log: ["System standby. Awaiting protocol boot."],
};

const screenRoot = document.getElementById("screen-root");
const runInfo = document.getElementById("run-info");
const logList = document.getElementById("log-list");

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function sampleDistinct(arr, count) {
  const clone = [...arr];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone.slice(0, count);
}

function addLog(text) {
  state.log.unshift(text);
  state.log = state.log.slice(0, CONFIG.logSize);
  renderLog();
}

function createRun() {
  const roster = AGENT_TEMPLATES.map((template) => ({
    ...template,
    hp: template.hpMax,
    energy: 0,
    status: {
      guard: 0,
      barrier: 0,
      jam: 0,
      taunt: 0,
    },
  }));

  return {
    nodeIndex: 0,
    maxNode: NODE_PLAN.length,
    roster,
    squadIds: roster.slice(0, CONFIG.maxSquadSize).map((agent) => agent.id),
    nodeOperations: {},
    upgrades: [],
    rewardTally: {},
    mods: {
      startingEnergy: 0,
      postBattleHeal: 2,
      exposedBonus: 2,
      tacticianExposeTurns: 0,
      vanguardBarrierAura: false,
      skirmisherFinisherBonus: 2,
      skirmisherCostMod: 0,
      supportHealBonus: 0,
      supportCleanseAll: false,
    },
  };
}

function getCurrentNode() {
  if (!state.run) {
    return null;
  }
  return NODE_PLAN[state.run.nodeIndex] || null;
}

function getAliveAgents(ids) {
  if (!state.run) {
    return [];
  }
  return state.run.roster.filter((agent) => ids.includes(agent.id) && agent.hp > 0);
}

function ensureValidSquad() {
  if (!state.run) {
    return;
  }

  const aliveRoster = state.run.roster.filter((agent) => agent.hp > 0);
  const aliveSquad = state.run.squadIds.filter((id) =>
    aliveRoster.some((agent) => agent.id === id)
  );

  if (aliveSquad.length === 0 && aliveRoster.length > 0) {
    state.run.squadIds = aliveRoster.slice(0, CONFIG.maxSquadSize).map((agent) => agent.id);
    return;
  }

  state.run.squadIds = aliveSquad.slice(0, CONFIG.maxSquadSize);
}

function getThreatName(enemyId) {
  const template = ENEMY_TEMPLATES[enemyId];
  return template ? template.name : enemyId;
}

function getUnavailableRewardIds() {
  if (!state.run) {
    return new Set();
  }
  return new Set(state.run.upgrades.map((upgrade) => upgrade.id));
}

function getRewardChoices() {
  if (!state.run) {
    return [];
  }

  const unavailable = getUnavailableRewardIds();
  const available = REWARD_POOL.filter((reward) => reward.repeatable || !unavailable.has(reward.id));

  if (available.length <= CONFIG.rewardChoices) {
    return sampleDistinct(available, available.length);
  }

  return sampleDistinct(available, CONFIG.rewardChoices);
}

function getNodeOperationById(operationId) {
  return NODE_OPERATION_POOL.find((operation) => operation.id === operationId) || null;
}

function ensureNodeOperationPlan(nodeIndex = state.run ? state.run.nodeIndex : 0) {
  if (!state.run) {
    return null;
  }

  if (nodeIndex < 0 || nodeIndex >= state.run.maxNode) {
    return null;
  }

  if (!state.run.nodeOperations[nodeIndex]) {
    const options = sampleDistinct(
      NODE_OPERATION_POOL,
      Math.min(3, NODE_OPERATION_POOL.length)
    ).map((operation) => operation.id);

    state.run.nodeOperations[nodeIndex] = {
      optionIds: options,
      selectedId: null,
    };
  }

  return state.run.nodeOperations[nodeIndex];
}

function getSelectedNodeOperation(nodeIndex = state.run ? state.run.nodeIndex : 0) {
  if (!state.run) {
    return null;
  }

  const plan = ensureNodeOperationPlan(nodeIndex);
  if (!plan || !plan.selectedId) {
    return null;
  }

  return getNodeOperationById(plan.selectedId);
}

function selectNodeOperation(operationId) {
  if (!state.run) {
    return;
  }

  const plan = ensureNodeOperationPlan();
  if (!plan) {
    return;
  }

  if (!plan.optionIds.includes(operationId)) {
    return;
  }

  plan.selectedId = operationId;
  const operation = getNodeOperationById(operationId);
  if (operation) {
    addLog(`Node protocol selected: ${operation.title}.`);
  }
  render();
}

function startRun() {
  state.run = createRun();
  ensureNodeOperationPlan(0);
  state.battle = null;
  state.pendingRewards = [];
  state.runResult = null;
  state.screen = "squad";
  state.log = [];
  addLog("Run started. Assemble a squad for Node 1.");
  render();
}

function abortRun() {
  state.screen = "title";
  state.run = null;
  state.battle = null;
  state.pendingRewards = [];
  state.runResult = null;
  state.log = ["Protocol reset. Awaiting new run."];
  render();
}

function toggleSquadAgent(agentId, checked) {
  if (!state.run) {
    return;
  }

  const agent = state.run.roster.find((item) => item.id === agentId);
  if (!agent || agent.hp <= 0) {
    return;
  }

  if (checked) {
    if (!state.run.squadIds.includes(agentId)) {
      if (state.run.squadIds.length >= CONFIG.maxSquadSize) {
        addLog(`Squad limit ${CONFIG.maxSquadSize}. Unselect an agent first.`);
        render();
        return;
      }
      state.run.squadIds.push(agentId);
    }
  } else {
    state.run.squadIds = state.run.squadIds.filter((id) => id !== agentId);
  }

  render();
}

function buildEnemy() {
  const node = getCurrentNode();
  if (!node) {
    return null;
  }

  const enemyId = node.enemies[randInt(0, node.enemies.length - 1)];
  const template = ENEMY_TEMPLATES[enemyId];
  const nodeScale = 1 + state.run.nodeIndex * 0.2;
  const dangerScale = node.danger === "Elite" ? 1.12 : node.danger === "Boss" ? 1.2 : 1;

  const hpMax = Math.max(8, Math.round(template.hpMax * nodeScale * dangerScale) + randInt(-2, 3));
  const atk = Math.max(2, Math.round(template.atk * (1 + state.run.nodeIndex * 0.1)));
  const initialPattern = template.phasePatterns
    ? [...template.phasePatterns[1]]
    : [...template.pattern];

  const enemy = {
    id: template.id,
    name: template.name,
    role: template.role,
    hpMax,
    hp: hpMax,
    atk,
    armor: 0,
    charge: 0,
    pattern: initialPattern,
    patternIndex: 0,
    status: {
      exposed: 0,
    },
    dossier: template.dossier || [],
    bossState: template.phasePatterns
      ? {
          phase: 1,
          phasePatterns: template.phasePatterns,
        }
      : null,
    intent: null,
  };

  queueEnemyIntent(enemy);
  return enemy;
}

function queueEnemyIntent(enemy) {
  const intentId = enemy.pattern[enemy.patternIndex % enemy.pattern.length];
  enemy.patternIndex += 1;
  const meta = INTENT_META[intentId] || {
    label: intentId,
    desc: "Unknown hostile routine.",
    threat: "medium",
  };
  enemy.intent = {
    id: intentId,
    label: meta.label,
    desc: meta.desc,
    threat: meta.threat,
  };
}

function handleBossPhaseShift(enemy) {
  if (!enemy || !enemy.bossState || enemy.hp <= 0) {
    return;
  }

  const integrityRatio = enemy.hp / enemy.hpMax;

  if (enemy.bossState.phase === 1 && integrityRatio <= 0.7) {
    enemy.bossState.phase = 2;
    enemy.pattern = [...enemy.bossState.phasePatterns[2]];
    enemy.patternIndex = 0;
    enemy.atk += 1;
    enemy.armor += 4;
    addLog(`${enemy.name} enters Phase 2: lockdown routines online (+1 ATK, +4 Armor).`);
    queueEnemyIntent(enemy);
    return;
  }

  if (enemy.bossState.phase === 2 && integrityRatio <= 0.35) {
    enemy.bossState.phase = 3;
    enemy.pattern = [...enemy.bossState.phasePatterns[3]];
    enemy.patternIndex = 0;
    enemy.atk += 2;
    enemy.charge += 2;
    enemy.armor += 2;
    addLog(`${enemy.name} enters Phase 3: annihilation loop online (+2 ATK, +2 Charge, +2 Armor).`);
    queueEnemyIntent(enemy);
  }
}

function resetBattleStatsForSquad() {
  if (!state.run) {
    return;
  }

  getAliveAgents(state.run.squadIds).forEach((agent) => {
    agent.energy = clamp(state.run.mods.startingEnergy, 0, CONFIG.energyCap);
    agent.status.guard = 0;
    agent.status.barrier = 0;
    agent.status.jam = 0;
    agent.status.taunt = 0;
  });
}

function applyNodeOperationEffects(operation, squad, enemy) {
  const effects = [];
  if (!operation) {
    return effects;
  }

  if (operation.id === "overclock-surge") {
    squad.forEach((agent) => {
      agent.energy = clamp(agent.energy + 1, 0, CONFIG.energyCap);
    });
    enemy.atk += 2;
    effects.push("Squad starts +1 EN.");
    effects.push(`${enemy.name} gains +2 ATK.`);
  }

  if (operation.id === "firewall-breach") {
    enemy.status.exposed = Math.max(enemy.status.exposed, 2);
    enemy.armor += 6;
    effects.push(`${enemy.name} starts Exposed (2).`);
    effects.push(`${enemy.name} starts with +6 Armor.`);
  }

  if (operation.id === "kinetic-shielding") {
    squad.forEach((agent) => {
      agent.status.barrier += 2;
    });
    enemy.charge += 2;
    effects.push("Squad starts with +2 Barrier each.");
    effects.push(`${enemy.name} starts with +2 Charge.`);
  }

  if (operation.id === "jam-override") {
    enemy.atk = Math.max(1, enemy.atk - 1);
    squad.forEach((agent) => {
      agent.status.jam += 1;
    });
    effects.push(`${enemy.name} loses 1 ATK.`);
    effects.push("Squad starts Jammed (1).");
  }

  return effects;
}

function deployBattle() {
  if (!state.run) {
    return;
  }

  const nodeOperationPlan = ensureNodeOperationPlan();
  if (!nodeOperationPlan || !nodeOperationPlan.selectedId) {
    addLog("Select a pre-battle node protocol before deployment.");
    render();
    return;
  }
  const selectedOperation = getSelectedNodeOperation();

  ensureValidSquad();
  const aliveSquad = getAliveAgents(state.run.squadIds);
  if (aliveSquad.length === 0) {
    endRun("defeat", "No deployable agents left.");
    return;
  }

  const enemy = buildEnemy();
  if (!enemy) {
    return;
  }

  resetBattleStatsForSquad();
  const operationEffects = applyNodeOperationEffects(selectedOperation, aliveSquad, enemy);

  state.battle = {
    turn: 1,
    enemy,
    selectedActorId: aliveSquad[0].id,
    nodeOperationId: selectedOperation ? selectedOperation.id : null,
    lastResolution: null,
  };
  state.screen = "battle";

  const node = getCurrentNode();
  addLog(`Node ${state.run.nodeIndex + 1} started: ${node.label} (${node.danger}).`);
  if (selectedOperation) {
    addLog(`Protocol active: ${selectedOperation.title}.`);
    operationEffects.forEach((line) => addLog(line));
  }
  addLog(`${enemy.name} engaged. Intent: ${enemy.intent.label}.`);
  render();
}

function findSelectedActor() {
  if (!state.run || !state.battle) {
    return null;
  }

  const actor = state.run.roster.find((agent) => agent.id === state.battle.selectedActorId);
  if (!actor || actor.hp <= 0 || !state.run.squadIds.includes(actor.id)) {
    const fallback = getAliveAgents(state.run.squadIds)[0] || null;
    state.battle.selectedActorId = fallback ? fallback.id : null;
    return fallback;
  }

  return actor;
}

function getSkillCost(actor) {
  if (!state.run) {
    return actor.skill.cost;
  }

  if (actor.role === "Skirmisher") {
    return Math.max(1, actor.skill.cost - state.run.mods.skirmisherCostMod);
  }

  return actor.skill.cost;
}

function gainEnergy(agent, amount) {
  if (amount <= 0) {
    return;
  }

  if (agent.status.jam > 0) {
    agent.status.jam -= 1;
    addLog(`${agent.name} is Jammed and gains no energy.`);
    return;
  }

  agent.energy = clamp(agent.energy + amount, 0, CONFIG.energyCap);
}

function applyDamageToEnemy(rawDamage, sourceLabel) {
  if (!state.battle) {
    return 0;
  }

  let damage = Math.max(1, rawDamage);

  if (state.battle.enemy.armor > 0) {
    const absorbed = Math.min(state.battle.enemy.armor, damage);
    state.battle.enemy.armor -= absorbed;
    damage -= absorbed;
    addLog(`${state.battle.enemy.name} armor absorbs ${absorbed}.`);
  }

  if (damage > 0) {
    state.battle.enemy.hp = Math.max(0, state.battle.enemy.hp - damage);
    handleBossPhaseShift(state.battle.enemy);
  }

  addLog(`${sourceLabel} deals ${damage} to ${state.battle.enemy.name}.`);
  return damage;
}

function applyDamageToAgent(agent, rawDamage, options = {}) {
  let damage = Math.max(1, rawDamage);

  if (!options.ignoreGuard && agent.status.guard > 0) {
    damage = Math.max(1, damage - 2);
    addLog(`${agent.name} guards and reduces incoming damage.`);
  }

  if (agent.status.barrier > 0) {
    const absorbed = Math.min(agent.status.barrier, damage);
    agent.status.barrier -= absorbed;
    damage -= absorbed;
    addLog(`${agent.name}'s barrier absorbs ${absorbed}.`);
  }

  if (damage > 0) {
    agent.hp = Math.max(0, agent.hp - damage);
    addLog(`${agent.name} takes ${damage} damage.`);
    if (agent.hp <= 0) {
      addLog(`${agent.name} is offline.`);
    }
  }
}

function calcPlayerDamage(actor, baseRoll) {
  if (!state.run || !state.battle) {
    return baseRoll;
  }

  let damage = baseRoll;
  const enemy = state.battle.enemy;

  if (enemy.status.exposed > 0) {
    damage += state.run.mods.exposedBonus;
    if (actor.role === "Tactician") {
      damage += 1;
    }
  }

  return Math.max(1, damage);
}

function getEnemyTarget(mode) {
  if (!state.run) {
    return null;
  }

  const alive = getAliveAgents(state.run.squadIds);
  if (alive.length === 0) {
    return null;
  }

  const taunting = alive.filter((agent) => agent.status.taunt > 0);
  if (taunting.length > 0) {
    return taunting[randInt(0, taunting.length - 1)];
  }

  if (mode === "lowest-hp") {
    return [...alive].sort((a, b) => a.hp - b.hp)[0];
  }

  if (mode === "highest-energy") {
    return [...alive].sort((a, b) => b.energy - a.energy)[0];
  }

  if (mode === "highest-hp") {
    return [...alive].sort((a, b) => b.hp - a.hp)[0];
  }

  return alive[randInt(0, alive.length - 1)];
}

function getTotalSquadHp() {
  if (!state.run) {
    return 0;
  }

  return getAliveAgents(state.run.squadIds).reduce((total, agent) => total + agent.hp, 0);
}

function formatDamageRange(minValue, maxValue) {
  if (minValue === maxValue) {
    return `${minValue}`;
  }
  return `${minValue}-${maxValue}`;
}

function getIntentLabel(intentId) {
  const meta = INTENT_META[intentId];
  return meta ? meta.label : intentId;
}

function formatIntentSequence(intentIds, count = 3) {
  return intentIds.slice(0, count).map((intentId) => getIntentLabel(intentId)).join(" -> ");
}

function getLikelyIntentTarget(intentId) {
  if (!state.run) {
    return "Unknown";
  }

  const alive = getAliveAgents(state.run.squadIds);
  if (alive.length === 0) {
    return "No targets";
  }

  const taunting = alive.filter((agent) => agent.status.taunt > 0);
  if (
    taunting.length > 0 &&
    ["strike", "pierce", "jam", "fortify", "annihilate"].includes(intentId)
  ) {
    if (taunting.length === 1) {
      return `${taunting[0].name} (Taunt)`;
    }
    return "Taunting agents";
  }

  if (intentId === "pierce") {
    return [...alive].sort((a, b) => a.hp - b.hp)[0].name;
  }

  if (intentId === "jam") {
    return [...alive].sort((a, b) => b.energy - a.energy)[0].name;
  }

  if (intentId === "annihilate") {
    return [...alive].sort((a, b) => b.hp - a.hp)[0].name;
  }

  if (intentId === "sweep" || intentId === "lockdown") {
    return "All deployed agents";
  }

  if (intentId === "overload") {
    return "Self-charge (next attack)";
  }

  if (intentId === "fortify") {
    return "Self-armor + random chip";
  }

  return "Random deployed agent";
}

function getIntentForecast(enemy) {
  const intentId = enemy.intent.id;
  const charge = enemy.charge;

  if (intentId === "strike") {
    return `${formatDamageRange(
      Math.max(1, enemy.atk - 1) + charge,
      enemy.atk + 1 + charge
    )} single-target`;
  }

  if (intentId === "pierce") {
    return `${formatDamageRange(enemy.atk + charge, enemy.atk + 2 + charge)} single-target`;
  }

  if (intentId === "sweep") {
    return `${formatDamageRange(Math.max(1, enemy.atk - 2), enemy.atk)} to all agents`;
  }

  if (intentId === "jam") {
    return `${formatDamageRange(Math.max(1, enemy.atk - 2), enemy.atk)} + Jam`;
  }

  if (intentId === "fortify") {
    return `+3 Armor, then ${formatDamageRange(1, Math.max(2, enemy.atk - 1))} chip`;
  }

  if (intentId === "overload") {
    return "+3 Charge, +1 Armor";
  }

  if (intentId === "lockdown") {
    return `${formatDamageRange(Math.max(1, enemy.atk - 3), Math.max(1, enemy.atk - 1))} + Jam to all`;
  }

  if (intentId === "annihilate") {
    return `${formatDamageRange(enemy.atk + 2 + charge, enemy.atk + 5 + charge)} heavy single-target`;
  }

  return "Unknown effect";
}

function decaySquadStatuses() {
  if (!state.run) {
    return;
  }

  getAliveAgents(state.run.squadIds).forEach((agent) => {
    if (agent.status.guard > 0) {
      agent.status.guard -= 1;
    }
    if (agent.status.taunt > 0) {
      agent.status.taunt -= 1;
    }
  });
}

function executeEnemyTurn() {
  if (!state.run || !state.battle) {
    return;
  }

  const enemy = state.battle.enemy;
  const intentId = enemy.intent.id;

  if (intentId === "strike") {
    const target = getEnemyTarget("random");
    if (target) {
      const damage = randInt(Math.max(1, enemy.atk - 1), enemy.atk + 1) + enemy.charge;
      applyDamageToAgent(target, damage);
      addLog(`${enemy.name} uses Strike on ${target.name}.`);
      enemy.charge = 0;
    }
  }

  if (intentId === "pierce") {
    const target = getEnemyTarget("lowest-hp");
    if (target) {
      const damage = randInt(enemy.atk, enemy.atk + 2) + enemy.charge;
      applyDamageToAgent(target, damage, { ignoreGuard: true });
      addLog(`${enemy.name} uses Pierce on ${target.name}.`);
      enemy.charge = 0;
    }
  }

  if (intentId === "sweep") {
    const targets = getAliveAgents(state.run.squadIds);
    const damage = randInt(Math.max(1, enemy.atk - 2), enemy.atk);
    targets.forEach((target) => {
      applyDamageToAgent(target, damage);
    });
    addLog(`${enemy.name} broadcasts Pulse Sweep.`);
  }

  if (intentId === "jam") {
    const target = getEnemyTarget("highest-energy");
    if (target) {
      const damage = randInt(Math.max(1, enemy.atk - 2), enemy.atk);
      applyDamageToAgent(target, damage);
      target.status.jam += 1;
      addLog(`${enemy.name} jams ${target.name}.`);
    }
  }

  if (intentId === "fortify") {
    enemy.armor += 3;
    const target = getEnemyTarget("random");
    addLog(`${enemy.name} fortifies for +3 armor.`);
    if (target) {
      const damage = randInt(1, Math.max(2, enemy.atk - 1));
      applyDamageToAgent(target, damage);
      addLog(`${enemy.name} chips ${target.name}.`);
    }
  }

  if (intentId === "overload") {
    enemy.charge += 3;
    enemy.armor += 1;
    addLog(`${enemy.name} overloads: next attack gains +3 damage.`);
  }

  if (intentId === "lockdown") {
    const targets = getAliveAgents(state.run.squadIds);
    const damage = randInt(Math.max(1, enemy.atk - 3), Math.max(1, enemy.atk - 1));
    targets.forEach((target) => {
      applyDamageToAgent(target, damage);
      target.status.jam += 1;
    });
    enemy.armor += 2;
    addLog(`${enemy.name} emits Lockdown Pulse and reinforces armor.`);
  }

  if (intentId === "annihilate") {
    const target = getEnemyTarget("highest-hp");
    if (target) {
      const damage = randInt(enemy.atk + 2, enemy.atk + 5) + enemy.charge;
      applyDamageToAgent(target, damage, { ignoreGuard: true });
      enemy.charge = 0;
      addLog(`${enemy.name} fires Annihilate Beam at ${target.name}.`);
    }
  }

  if (enemy.status.exposed > 0) {
    enemy.status.exposed -= 1;
  }

  decaySquadStatuses();
  queueEnemyIntent(enemy);
}

function getMostInjuredAlly() {
  if (!state.run) {
    return null;
  }

  const alive = getAliveAgents(state.run.squadIds);
  if (alive.length === 0) {
    return null;
  }

  return [...alive].sort((a, b) => a.hp / a.hpMax - b.hp / b.hpMax)[0];
}

function grantBarrierToSquad(amount, exceptId = null) {
  if (!state.run) {
    return;
  }

  getAliveAgents(state.run.squadIds).forEach((agent) => {
    if (agent.id !== exceptId) {
      agent.status.barrier += amount;
    }
  });
}

function executeSkill(actor) {
  if (!state.run || !state.battle) {
    return;
  }

  const enemy = state.battle.enemy;

  if (actor.id === "seer") {
    const base = randInt(Math.max(1, actor.atk - 1), actor.atk + 1);
    const damage = calcPlayerDamage(actor, base);
    applyDamageToEnemy(damage, actor.name);
    const exposeTurns = 2 + state.run.mods.tacticianExposeTurns;
    enemy.status.exposed = Math.max(enemy.status.exposed, exposeTurns);
    addLog(`${actor.name} applies Exposed for ${exposeTurns} turns.`);
    return;
  }

  if (actor.id === "bulwark") {
    actor.status.guard = Math.max(actor.status.guard, 2);
    actor.status.taunt = Math.max(actor.status.taunt, 2);
    actor.status.barrier += 3;
    addLog(`${actor.name} anchors the line (Guard + Taunt + Barrier).`);
    if (state.run.mods.vanguardBarrierAura) {
      grantBarrierToSquad(1, actor.id);
      addLog("Bulwark Mesh extends +1 barrier to allies.");
    }
    return;
  }

  if (actor.id === "ghost") {
    const hpRatio = enemy.hp / enemy.hpMax;
    let damage = calcPlayerDamage(actor, randInt(actor.atk + 3, actor.atk + 6));
    if (enemy.status.exposed > 0) {
      damage += 2;
    }
    if (hpRatio <= 0.35) {
      damage += state.run.mods.skirmisherFinisherBonus;
      addLog(`${actor.name} triggers execution bonus.`);
    }
    applyDamageToEnemy(damage, actor.name);
    return;
  }

  if (actor.id === "loom") {
    const target = getMostInjuredAlly();
    if (!target) {
      return;
    }

    const healAmount = 6 + state.run.mods.supportHealBonus;
    const beforeHp = target.hp;
    target.hp = Math.min(target.hpMax, target.hp + healAmount);
    target.status.barrier += 2;
    target.status.jam = 0;

    const recovered = target.hp - beforeHp;
    addLog(`${actor.name} restores ${recovered} HP to ${target.name} and adds barrier.`);

    if (state.run.mods.supportCleanseAll) {
      getAliveAgents(state.run.squadIds).forEach((agent) => {
        agent.status.jam = 0;
      });
      addLog("Loom Injector clears Jam for the squad.");
    }
  }
}

function getActionLabel(actionType, actor) {
  if (actionType === "attack") {
    return "Attack";
  }
  if (actionType === "defend") {
    return "Defend";
  }
  if (actionType === "skill") {
    return actor.skill.title;
  }
  if (actionType === "burst") {
    return "Sync Burst";
  }
  return "Action";
}

function performAction(actionType) {
  if (!state.run || !state.battle) {
    return;
  }

  const actor = findSelectedActor();
  if (!actor) {
    endRun("defeat", "No active actor available.");
    return;
  }

  const actionLabel = getActionLabel(actionType, actor);
  const enemyHpBeforeAction = state.battle.enemy.hp;
  const squadHpBeforeEnemyTurn = getTotalSquadHp();

  if (actionType === "attack") {
    const base = randInt(Math.max(1, actor.atk - 1), actor.atk + 1);
    const damage = calcPlayerDamage(actor, base);
    applyDamageToEnemy(damage, actor.name);
    gainEnergy(actor, 1);
  }

  if (actionType === "defend") {
    actor.status.guard = Math.max(actor.status.guard, 1);
    gainEnergy(actor, 1);
    addLog(`${actor.name} takes a defensive posture.`);
    if (actor.role === "Vanguard" && state.run.mods.vanguardBarrierAura) {
      grantBarrierToSquad(1, actor.id);
      addLog("Bulwark Mesh grants +1 barrier to allies.");
    }
  }

  if (actionType === "skill") {
    const cost = getSkillCost(actor);
    if (actor.energy < cost) {
      addLog(`${actor.name} lacks energy for ${actor.skill.title}.`);
      render();
      return;
    }
    actor.energy -= cost;
    executeSkill(actor);
  }

  if (actionType === "burst") {
    const cost = 3;
    if (actor.energy < cost) {
      addLog(`${actor.name} lacks energy for Sync Burst.`);
      render();
      return;
    }
    actor.energy -= cost;
    const base = randInt(actor.atk + 4, actor.atk + 8);
    const damage = calcPlayerDamage(actor, base);
    applyDamageToEnemy(damage, actor.name);
    addLog(`${actor.name} executes Sync Burst.`);
  }

  const playerDamage = Math.max(0, enemyHpBeforeAction - state.battle.enemy.hp);

  if (state.battle.enemy.hp <= 0) {
    state.battle.lastResolution = {
      turn: state.battle.turn,
      player: `${actor.name} used ${actionLabel} for ${playerDamage} damage.`,
      enemy: `${state.battle.enemy.name} crashed before enemy action.`,
    };
    addLog(`${state.battle.enemy.name} crashed.`);
    onBattleWin();
    return;
  }

  const resolvedIntentId = state.battle.enemy.intent.id;
  const resolvedIntentLabel = state.battle.enemy.intent.label;
  executeEnemyTurn();
  const squadHpAfterEnemyTurn = getTotalSquadHp();
  const enemyDamage = Math.max(0, squadHpBeforeEnemyTurn - squadHpAfterEnemyTurn);

  state.battle.lastResolution = {
    turn: state.battle.turn,
    player: `${actor.name} used ${actionLabel} for ${playerDamage} damage.`,
    enemy: `${state.battle.enemy.name} resolved ${resolvedIntentLabel} for ${enemyDamage} squad damage.`,
    intentThreat: INTENT_META[resolvedIntentId] ? INTENT_META[resolvedIntentId].threat : "medium",
  };

  const aliveSquad = getAliveAgents(state.run.squadIds);
  if (aliveSquad.length === 0) {
    endRun("defeat", "Squad eliminated.");
    return;
  }

  state.battle.turn += 1;
  render();
}

function applyPostBattleRecovery() {
  if (!state.run) {
    return;
  }

  const healAmount = state.run.mods.postBattleHeal;
  if (healAmount <= 0) {
    return;
  }

  let totalRecovered = 0;
  state.run.roster.forEach((agent) => {
    if (agent.hp > 0) {
      const before = agent.hp;
      agent.hp = Math.min(agent.hpMax, agent.hp + healAmount);
      agent.status.jam = 0;
      totalRecovered += agent.hp - before;
    }
  });

  if (totalRecovered > 0) {
    addLog(`Auto-repair restores ${totalRecovered} total HP across the squad.`);
  }
}

function endRun(result, reason) {
  state.runResult = result;
  state.screen = "run-end";
  state.battle = null;

  if (reason) {
    addLog(reason);
  }

  if (result === "victory") {
    addLog("Silent Core neutralized. Run success.");
  } else {
    addLog("Run failed.");
  }

  render();
}

function onBattleWin() {
  if (!state.run) {
    return;
  }

  applyPostBattleRecovery();

  if (state.run.nodeIndex >= state.run.maxNode - 1) {
    endRun("victory");
    return;
  }

  state.pendingRewards = getRewardChoices();
  state.screen = "reward";
  state.battle = null;
  addLog("Encounter cleared. Select one directive reward.");
  render();
}

function applyReward(rewardId) {
  if (!state.run) {
    return;
  }

  const reward = state.pendingRewards.find((item) => item.id === rewardId);
  if (!reward) {
    return;
  }

  reward.apply(state.run);

  if (reward.persistent) {
    state.run.rewardTally[reward.id] = (state.run.rewardTally[reward.id] || 0) + 1;
  }

  if (!reward.repeatable && !state.run.upgrades.some((upgrade) => upgrade.id === reward.id)) {
    state.run.upgrades.push({ id: reward.id, title: reward.title });
  }

  addLog(`Directive installed: ${reward.title}.`);

  state.pendingRewards = [];
  state.run.nodeIndex += 1;
  ensureNodeOperationPlan(state.run.nodeIndex);
  ensureValidSquad();
  state.screen = "squad";
  render();
}

function formatAgentStatus(agent) {
  const tags = [];
  if (agent.status.guard > 0) {
    tags.push(`Guard ${agent.status.guard}`);
  }
  if (agent.status.barrier > 0) {
    tags.push(`Barrier ${agent.status.barrier}`);
  }
  if (agent.status.jam > 0) {
    tags.push(`Jammed ${agent.status.jam}`);
  }
  if (agent.status.taunt > 0) {
    tags.push(`Taunt ${agent.status.taunt}`);
  }
  return tags;
}

function renderDirectiveList() {
  if (!state.run) {
    return '<p class="muted">No permanent directives installed yet.</p>';
  }

  const entries = Object.entries(state.run.rewardTally);
  if (entries.length === 0) {
    return '<p class="muted">No permanent directives installed yet.</p>';
  }

  const labels = entries
    .map(([rewardId, count]) => {
      const reward = REWARD_POOL.find((item) => item.id === rewardId);
      if (!reward) {
        return null;
      }
      return count > 1 ? `${reward.title} x${count}` : reward.title;
    })
    .filter(Boolean);

  return `
    <div class="chip-row">
      ${labels.map((label) => `<span class="chip">${label}</span>`).join("")}
    </div>
  `;
}

function renderHpBar(current, max, variant) {
  const pct = clamp(Math.round((current / Math.max(1, max)) * 100), 0, 100);
  return `
    <div class="hp-track">
      <div class="hp-fill ${variant}" style="width:${pct}%"></div>
    </div>
  `;
}

function renderBossPhaseReference(bossTemplate) {
  if (!bossTemplate || !bossTemplate.phasePatterns) {
    return "";
  }

  return `
    <p class="muted">Phase breakpoints: 70% integrity -> Phase 2, 35% integrity -> Phase 3.</p>
    <ul>
      <li>Phase 1 signature: ${formatIntentSequence(bossTemplate.phasePatterns[1])}</li>
      <li>Phase 2 signature: ${formatIntentSequence(bossTemplate.phasePatterns[2])}</li>
      <li>Phase 3 signature: ${formatIntentSequence(bossTemplate.phasePatterns[3])}</li>
    </ul>
  `;
}

function renderBossBattleReadout(enemy) {
  if (!enemy || !enemy.bossState) {
    return "";
  }

  const currentPhase = enemy.bossState.phase;
  const integrityPct = clamp(Math.round((enemy.hp / Math.max(1, enemy.hpMax)) * 100), 0, 100);
  const currentSignature = formatIntentSequence(enemy.bossState.phasePatterns[currentPhase] || enemy.pattern);
  let nextPhase = null;
  let thresholdPct = null;

  if (currentPhase === 1) {
    nextPhase = 2;
    thresholdPct = 70;
  } else if (currentPhase === 2) {
    nextPhase = 3;
    thresholdPct = 35;
  }

  if (!nextPhase) {
    return `
      <article class="boss-readout">
        <h3>Boss Readout</h3>
        <div class="chip-row">
          <span class="chip">Integrity ${integrityPct}%</span>
          <span class="chip">Phase ${currentPhase}/3</span>
          <span class="chip boss-alert final">Final phase active</span>
        </div>
        <p class="muted">Current phase signature: ${currentSignature}</p>
      </article>
    `;
  }

  const nextSignature = formatIntentSequence(enemy.bossState.phasePatterns[nextPhase] || []);
  const shiftDistance = Math.max(0, integrityPct - thresholdPct);
  const urgentClass = shiftDistance <= 10 ? "urgent" : "";

  return `
    <article class="boss-readout">
      <h3>Boss Readout</h3>
      <div class="chip-row">
        <span class="chip">Integrity ${integrityPct}%</span>
        <span class="chip">Phase ${currentPhase}/3</span>
        <span class="chip boss-alert ${urgentClass}">
          Next shift: ${thresholdPct}% (${shiftDistance}% away)
        </span>
      </div>
      <p class="muted">Current phase signature: ${currentSignature}</p>
      <p class="muted">Incoming phase ${nextPhase} signature: ${nextSignature}</p>
    </article>
  `;
}

function getNodeBossDossier(node) {
  if (!node) {
    return null;
  }
  const bossId = node.enemies.find((enemyId) => {
    const template = ENEMY_TEMPLATES[enemyId];
    return Boolean(template && template.phasePatterns);
  });

  if (!bossId) {
    return null;
  }

  return ENEMY_TEMPLATES[bossId];
}

function renderNodeOperationPanel() {
  if (!state.run) {
    return "";
  }

  const operationPlan = ensureNodeOperationPlan();
  if (!operationPlan) {
    return "";
  }

  const options = operationPlan.optionIds
    .map((operationId) => getNodeOperationById(operationId))
    .filter(Boolean);

  return `
    <article class="panel" style="margin-bottom:12px;">
      <h3>Node Protocol (Mandatory)</h3>
      <p class="muted">Choose one risk/reward modifier before deployment.</p>
      <div class="card-grid">
        ${options
          .map((operation) => {
            const selected = operationPlan.selectedId === operation.id;
            return `
              <article class="card ${selected ? "selected" : ""}">
                <h3>${operation.title}</h3>
                <p><strong>Reward:</strong> ${operation.reward}</p>
                <p><strong>Risk:</strong> ${operation.risk}</p>
                <button class="btn ${selected ? "" : "primary"}" data-action="pick-node-operation" data-operation-id="${operation.id}">
                  ${selected ? "Selected" : "Choose"}
                </button>
              </article>
            `;
          })
          .join("")}
      </div>
    </article>
  `;
}

function renderHeader() {
  if (!state.run) {
    runInfo.textContent = "No active run";
    return;
  }

  const aliveCount = state.run.roster.filter((agent) => agent.hp > 0).length;
  const nodeNum = clamp(state.run.nodeIndex + 1, 1, state.run.maxNode);
  const node = getCurrentNode();
  const stageLabel =
    state.screen === "run-end" || !node
      ? "Run End"
      : `${node.danger}: ${node.label}`;

  runInfo.textContent = `Node ${nodeNum}/${state.run.maxNode} | ${stageLabel} | Alive ${aliveCount} | Directives ${Object.keys(state.run.rewardTally).length}`;
}

function renderLog() {
  logList.innerHTML = state.log.map((line) => `<li>${line}</li>`).join("");
}

function renderTitle() {
  screenRoot.innerHTML = `
    <section>
      <h2 class="screen-title">Silent Protocol</h2>
      <p>Build a 3-agent AGI strike squad, clear 4 escalating nodes, and break the Silent Core.</p>
      <div class="row">
        <button class="btn primary" data-action="start-run">Start Run</button>
      </div>
      <p class="muted">Static/local prototype. No backend. Focused on squad role synergy + quick tactical runs.</p>
    </section>
  `;
}

function renderSquad() {
  if (!state.run) {
    return;
  }

  ensureValidSquad();
  const operationPlan = ensureNodeOperationPlan();

  const node = getCurrentNode();
  const aliveCount = state.run.roster.filter((agent) => agent.hp > 0).length;
  const deployDisabled =
    state.run.squadIds.length === 0 ||
    aliveCount === 0 ||
    !operationPlan ||
    !operationPlan.selectedId;
  const threatLabels = node ? node.enemies.map((enemyId) => getThreatName(enemyId)) : [];
  const bossTemplate = getNodeBossDossier(node);

  screenRoot.innerHTML = `
    <section>
      <div class="row spread">
        <h2 class="screen-title">Squad Assembly</h2>
        <small>${state.run.squadIds.length}/${CONFIG.maxSquadSize} selected</small>
      </div>

      <article class="panel" style="margin-bottom:12px;">
        <h3>Next Encounter: Node ${state.run.nodeIndex + 1} - ${node ? node.label : "Unknown"}</h3>
        <p>${node ? node.danger : ""} threat level. Predicted hostiles: ${threatLabels.join(" / ")}.</p>
        <p class="muted">Auto-repair after each win: +${state.run.mods.postBattleHeal} HP to alive agents.</p>
      </article>

      ${
        bossTemplate
          ? `
        <article class="panel boss-dossier" style="margin-bottom:12px;">
          <h3>Boss Dossier: ${bossTemplate.name}</h3>
          <p class="muted">${bossTemplate.role}</p>
          <ul>
            ${bossTemplate.dossier.map((line) => `<li>${line}</li>`).join("")}
          </ul>
          ${renderBossPhaseReference(bossTemplate)}
        </article>
      `
          : ""
      }

      ${renderNodeOperationPanel()}

      <div class="card-grid">
        ${state.run.roster
          .map((agent) => {
            const checked = state.run.squadIds.includes(agent.id) ? "checked" : "";
            const dead = agent.hp <= 0;
            const skillCost = getSkillCost(agent);

            return `
              <article class="card ${checked ? "selected" : ""} ${dead ? "dead" : ""}">
                <h3>${agent.name}</h3>
                <p>${agent.role}</p>
                <div class="stat-row">
                  <span class="stat-pill">HP ${agent.hp}/${agent.hpMax}</span>
                  <span class="stat-pill">ATK ${agent.atk}</span>
                  <span class="stat-pill">EN ${agent.energy}</span>
                </div>
                ${renderHpBar(agent.hp, agent.hpMax, "ally")}
                <p class="muted" style="margin-top:8px;">Skill: ${agent.skill.title} (${skillCost} EN)</p>
                <p class="muted">${agent.passive}</p>
                <label class="row" style="margin-top:10px;">
                  <input type="checkbox" data-agent-toggle="${agent.id}" ${checked} ${dead ? "disabled" : ""} />
                  <span>${dead ? "Offline" : "Deploy"}</span>
                </label>
              </article>
            `;
          })
          .join("")}
      </div>

      <h3 style="margin-top:14px;">Directive Stack</h3>
      ${renderDirectiveList()}

      <div class="row" style="margin-top:12px;">
        <button class="btn primary" data-action="deploy" ${deployDisabled ? "disabled" : ""}>Deploy to Node</button>
        <button class="btn warn" data-action="abort-run">Abort Run</button>
      </div>

      ${
        operationPlan && !operationPlan.selectedId
          ? '<p class="muted">Pick one Node Protocol before deployment.</p>'
          : ""
      }
      ${aliveCount === 0 ? '<p class="muted">All agents are offline. This run cannot continue.</p>' : ""}
    </section>
  `;
}

function renderBattle() {
  if (!state.run || !state.battle) {
    return;
  }

  const node = getCurrentNode();
  const squad = getAliveAgents(state.run.squadIds);
  const actor = findSelectedActor();
  const enemy = state.battle.enemy;
  const activeNodeOperation = state.battle.nodeOperationId
    ? getNodeOperationById(state.battle.nodeOperationId)
    : null;

  const skillCost = actor ? getSkillCost(actor) : 99;
  const skillDisabled = !actor || actor.energy < skillCost;
  const burstDisabled = !actor || actor.energy < 3;
  const intentTarget = getLikelyIntentTarget(enemy.intent.id);
  const intentForecast = getIntentForecast(enemy);
  const intentThreatClass = `intent-${enemy.intent.threat || "medium"}`;

  const enemyStatusTags = [];
  if (enemy.armor > 0) {
    enemyStatusTags.push(`Armor ${enemy.armor}`);
  }
  if (enemy.charge > 0) {
    enemyStatusTags.push(`Charge ${enemy.charge}`);
  }
  if (enemy.status.exposed > 0) {
    enemyStatusTags.push(`Exposed ${enemy.status.exposed}`);
  }
  if (enemy.bossState) {
    enemyStatusTags.push(`Phase ${enemy.bossState.phase}/3`);
  }

  screenRoot.innerHTML = `
    <section>
      <div class="row spread">
        <h2 class="screen-title">Node ${state.run.nodeIndex + 1} - ${node ? node.label : "Battle"}</h2>
        <small>Turn ${state.battle.turn}</small>
      </div>

      ${
        activeNodeOperation
          ? `<p class="muted"><strong>Active Node Protocol:</strong> ${activeNodeOperation.title}</p>`
          : ""
      }

      <article class="intent-card">
        <h3>Enemy Intent: ${enemy.intent.label}</h3>
        <p>${enemy.intent.desc}</p>
        <div class="chip-row">
          <span class="chip ${intentThreatClass}">Threat ${enemy.intent.threat || "medium"}</span>
          <span class="chip">Likely target: ${intentTarget}</span>
          <span class="chip">Forecast: ${intentForecast}</span>
        </div>
      </article>

      ${renderBossBattleReadout(enemy)}

      <div class="card-grid" style="margin-bottom:10px;">
        ${squad
          .map((agent) => {
            const selected = state.battle.selectedActorId === agent.id;
            const statusTags = formatAgentStatus(agent);

            return `
              <article class="card ${selected ? "selected" : ""}">
                <h3>${agent.name}</h3>
                <p>${agent.role}</p>
                <div class="stat-row">
                  <span class="stat-pill">HP ${agent.hp}/${agent.hpMax}</span>
                  <span class="stat-pill">ATK ${agent.atk}</span>
                  <span class="stat-pill">EN ${agent.energy}</span>
                </div>
                ${renderHpBar(agent.hp, agent.hpMax, "ally")}
                ${statusTags.length > 0 ? `<div class="chip-row" style="margin-top:8px;">${statusTags
                  .map((tag) => `<span class="chip">${tag}</span>`)
                  .join("")}</div>` : '<p class="muted" style="margin-top:8px;">No active status effects.</p>'}
                <p class="muted" style="margin-top:8px;">${agent.skill.title}: ${agent.skill.desc}</p>
                <div class="row" style="margin-top:10px;">
                  <button class="btn" data-action="select-actor" data-agent-id="${agent.id}">Control</button>
                </div>
              </article>
            `;
          })
          .join("")}

        <article class="card enemy-card">
          <h3>${enemy.name}</h3>
          <p>${enemy.role}</p>
          <div class="stat-row">
            <span class="stat-pill">HP ${enemy.hp}/${enemy.hpMax}</span>
            <span class="stat-pill">ATK ${enemy.atk}</span>
          </div>
          ${renderHpBar(enemy.hp, enemy.hpMax, "enemy")}
          ${enemyStatusTags.length > 0 ? `<div class="chip-row" style="margin-top:8px;">${enemyStatusTags
            .map((tag) => `<span class="chip">${tag}</span>`)
            .join("")}</div>` : '<p class="muted" style="margin-top:8px;">No active enemy modifiers.</p>'}
          ${
            enemy.bossState && enemy.dossier.length > 0
              ? `<p class="muted" style="margin-top:8px;">${enemy.dossier[enemy.bossState.phase - 1] || enemy.dossier[0]}</p>`
              : ""
          }
        </article>
      </div>

      ${
        state.battle.lastResolution
          ? `
        <article class="panel combat-summary" style="margin-bottom:10px;">
          <h3>Turn ${state.battle.lastResolution.turn} Recap</h3>
          <p>${state.battle.lastResolution.player}</p>
          <p>${state.battle.lastResolution.enemy}</p>
        </article>
      `
          : ""
      }

      <div class="actions">
        <button class="btn primary" data-action="do-attack">Attack (+1 EN)</button>
        <button class="btn" data-action="do-defend">Defend (+1 EN)</button>
        <button class="btn" data-action="do-skill" ${skillDisabled ? "disabled" : ""}>${
          actor ? actor.skill.title : "Skill"
        } (-${skillCost} EN)</button>
        <button class="btn" data-action="do-burst" ${burstDisabled ? "disabled" : ""}>Sync Burst (-3 EN)</button>
      </div>

      <p style="margin-top:12px;">Selected actor: <strong>${actor ? actor.name : "None"}</strong></p>
      <h3 style="margin-top:14px;">Directive Stack</h3>
      ${renderDirectiveList()}
    </section>
  `;
}

function renderReward() {
  if (!state.run) {
    return;
  }

  screenRoot.innerHTML = `
    <section>
      <h2 class="screen-title">Directive Reward</h2>
      <p>Choose one upgrade before Node ${state.run.nodeIndex + 2}.</p>
      <div class="reward-grid">
        ${state.pendingRewards
          .map(
            (reward) => `
              <article class="card">
                <h3>${reward.title}</h3>
                <p>${reward.desc}</p>
                <button class="btn primary" data-action="pick-reward" data-reward-id="${reward.id}">Install</button>
              </article>
            `
          )
          .join("")}
      </div>
      <h3 style="margin-top:14px;">Current Directives</h3>
      ${renderDirectiveList()}
    </section>
  `;
}

function renderRunEnd() {
  const isWin = state.runResult === "victory";
  const title = isWin ? "Run Complete" : "Run Failed";
  const subtitle = isWin
    ? "Silent Core collapsed. Squad extracted."
    : "Squad wiped before core neutralization.";

  const directives =
    state.run && Object.keys(state.run.rewardTally).length > 0
      ? Object.entries(state.run.rewardTally)
          .map(([rewardId, count]) => {
            const reward = REWARD_POOL.find((item) => item.id === rewardId);
            if (!reward) {
              return "";
            }
            return `<li>${reward.title}${count > 1 ? ` x${count}` : ""}</li>`;
          })
          .join("")
      : "<li>No persistent directives were installed.</li>";

  const clearedNodes = isWin
    ? state.run.maxNode
    : state.run
      ? state.run.nodeIndex
      : 0;

  screenRoot.innerHTML = `
    <section>
      <h2 class="screen-title">${title}</h2>
      <p>${subtitle}</p>
      <p class="muted">Nodes cleared: ${clearedNodes}/${state.run ? state.run.maxNode : NODE_PLAN.length}</p>

      <h3>Installed Directives</h3>
      <ul>${directives}</ul>

      <div class="row" style="margin-top:12px;">
        <button class="btn primary" data-action="start-run">Start New Run</button>
        <button class="btn" data-action="to-title">Back to Title</button>
      </div>
    </section>
  `;
}

function render() {
  renderHeader();

  if (state.screen === "title") {
    renderTitle();
  }
  if (state.screen === "squad") {
    renderSquad();
  }
  if (state.screen === "battle") {
    renderBattle();
  }
  if (state.screen === "reward") {
    renderReward();
  }
  if (state.screen === "run-end") {
    renderRunEnd();
  }

  renderLog();
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  const action = button.dataset.action;

  if (action === "start-run") {
    startRun();
  }
  if (action === "abort-run") {
    abortRun();
  }
  if (action === "deploy") {
    deployBattle();
  }
  if (action === "pick-node-operation") {
    selectNodeOperation(button.dataset.operationId);
  }
  if (action === "select-actor") {
    if (state.battle) {
      state.battle.selectedActorId = button.dataset.agentId;
      render();
    }
  }
  if (action === "do-attack") {
    performAction("attack");
  }
  if (action === "do-defend") {
    performAction("defend");
  }
  if (action === "do-skill") {
    performAction("skill");
  }
  if (action === "do-burst") {
    performAction("burst");
  }
  if (action === "pick-reward") {
    applyReward(button.dataset.rewardId);
  }
  if (action === "to-title") {
    abortRun();
  }
});

document.addEventListener("change", (event) => {
  const input = event.target.closest("input[data-agent-toggle]");
  if (!input) {
    return;
  }

  toggleSquadAgent(input.dataset.agentToggle, input.checked);
});

render();
