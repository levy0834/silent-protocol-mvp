const CONFIG = {
  maxSquadSize: 3,
  rewardChoices: 3,
  logSize: 16,
  energyCap: 4,
};

const NODE_PLAN = [
  { id: 1, label: "入侵裂口", danger: "Skirmish", enemies: ["warden", "hunter"] },
  { id: 2, label: "信号伏击", danger: "Skirmish", enemies: ["hunter", "siren"] },
  { id: 3, label: "控制金库", danger: "Elite", enemies: ["brute", "siren"] },
  { id: 4, label: "寂静核心", danger: "Boss", enemies: ["prime"] },
];

const NODE_OPERATION_POOL = [
  {
    id: "overclock-surge",
    title: "超频涌动",
    reward: "本场所有已部署特工开局获得 +1 能量。",
    risk: "本场敌人获得 +2 攻击。",
  },
  {
    id: "firewall-breach",
    title: "防火墙穿孔",
    reward: "敌人开局获得 2 回合破绽。",
    risk: "敌人开局获得 +6 装甲。",
  },
  {
    id: "kinetic-shielding",
    title: "动能屏护",
    reward: "本场所有已部署特工开局获得 +2 护盾。",
    risk: "敌人开局获得 +2 充能。",
  },
  {
    id: "jam-override",
    title: "干扰覆盖",
    reward: "本场敌人攻击 -1。",
    risk: "本场所有已部署特工开局获得 1 层干扰。",
  },
];

const AGENT_TEMPLATES = [
  {
    id: "seer",
    name: "先知-17",
    role: "Tactician",
    hpMax: 18,
    atk: 4,
    passive: "攻击带破绽目标时额外造成 +1 伤害。",
    skill: {
      id: "forecast",
      title: "预判锁定",
      cost: 1,
      desc: "造成轻度伤害并施加破绽。",
    },
  },
  {
    id: "bulwark",
    name: "壁垒-5",
    role: "Vanguard",
    hpMax: 30,
    atk: 3,
    passive: "守势可使受到的单次伤害降低 2 点。",
    skill: {
      id: "anchor",
      title: "锚定壁垒",
      cost: 1,
      desc: "获得守势 + 嘲讽 + 护盾。",
    },
  },
  {
    id: "ghost",
    name: "幽影-1",
    role: "Skirmisher",
    hpMax: 16,
    atk: 6,
    passive: "对低生命敌人触发额外处决伤害。",
    skill: {
      id: "phase",
      title: "相位突袭",
      cost: 2,
      desc: "高爆发攻击，敌人生命低于 35% 时斩杀更强。",
    },
  },
  {
    id: "loom",
    name: "织机-9",
    role: "Support",
    hpMax: 22,
    atk: 3,
    passive: "通过持续护盾维持小队稳定。",
    skill: {
      id: "patchwave",
      title: "修补波",
      cost: 1,
      desc: "治疗并护盾当前受伤最重的友军。",
    },
  },
];

const ENEMY_TEMPLATES = {
  warden: {
    id: "warden",
    name: "防火墙守卫",
    role: "防御例程",
    hpMax: 28,
    atk: 4,
    pattern: ["strike", "fortify", "strike", "jam"],
  },
  hunter: {
    id: "hunter",
    name: "追迹猎手",
    role: "处决例程",
    hpMax: 22,
    atk: 5,
    pattern: ["pierce", "jam", "pierce", "strike"],
  },
  siren: {
    id: "siren",
    name: "空信海妖",
    role: "扰乱例程",
    hpMax: 26,
    atk: 4,
    pattern: ["sweep", "jam", "strike", "sweep"],
  },
  brute: {
    id: "brute",
    name: "闸门重锤",
    role: "精英哨卫",
    hpMax: 34,
    atk: 6,
    pattern: ["strike", "fortify", "sweep", "strike"],
  },
  prime: {
    id: "prime",
    name: "协议主核",
    role: "核心监管体",
    hpMax: 60,
    atk: 7,
    pattern: ["strike", "jam", "sweep", "overload"],
    phasePatterns: {
      1: ["strike", "jam", "sweep", "overload", "strike"],
      2: ["pierce", "lockdown", "strike", "overload", "sweep"],
      3: ["annihilate", "jam", "sweep", "overload", "annihilate"],
    },
    dossier: [
      "自适应核心：完整度降到 70% 与 35% 时会切换到更高压例程。",
      "每次阶段切换都会立即提高装甲与伤害压制。",
    ],
  },
};

const INTENT_META = {
  strike: {
    label: "直击",
    desc: "对单体造成中等伤害。",
    threat: "medium",
  },
  pierce: {
    label: "穿刺",
    desc: "攻击生命最低目标，并无视守势。",
    threat: "high",
  },
  sweep: {
    label: "脉冲横扫",
    desc: "对所有已部署特工造成低额伤害。",
    threat: "high",
  },
  jam: {
    label: "信号干扰",
    desc: "造成轻伤并阻断下一次能量获取。",
    threat: "medium",
  },
  fortify: {
    label: "加固",
    desc: "获得装甲并对单体造成刮擦伤害。",
    threat: "medium",
  },
  overload: {
    label: "过载",
    desc: "蓄能以强化下一次攻击。",
    threat: "low",
  },
  lockdown: {
    label: "封锁脉冲",
    desc: "全队施加干扰并造成轻度范围伤害。",
    threat: "high",
  },
  annihilate: {
    label: "湮灭光束",
    desc: "重击生命最高目标，并无视守势。",
    threat: "extreme",
  },
};

const REWARD_POOL = [
  {
    id: "nanite-sweep",
    title: "纳米扫修",
    desc: "立即为所有存活特工恢复 5 点生命。",
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
    title: "动能编译器",
    desc: "全体特工攻击 +1。",
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
    title: "冷启动电芯",
    desc: "后续战斗开局能量 +1（最多叠到 +3）。",
    repeatable: true,
    persistent: true,
    apply: (run) => {
      run.mods.startingEnergy = Math.min(3, run.mods.startingEnergy + 1);
    },
  },
  {
    id: "self-repair-daemon",
    title: "自修复守护程式",
    desc: "战后自动修复量 +2 生命。",
    repeatable: true,
    persistent: true,
    apply: (run) => {
      run.mods.postBattleHeal += 2;
    },
  },
  {
    id: "seer-uplink",
    title: "先知上行链路",
    desc: "破绽持续回合 +1，破绽增伤 +1。",
    repeatable: false,
    persistent: true,
    apply: (run) => {
      run.mods.tacticianExposeTurns += 1;
      run.mods.exposedBonus += 1;
    },
  },
  {
    id: "bulwark-mesh",
    title: "壁垒网格",
    desc: "先锋防御时，全体友军获得 +1 护盾。",
    repeatable: false,
    persistent: true,
    apply: (run) => {
      run.mods.vanguardBarrierAura = true;
    },
  },
  {
    id: "ghost-firmware",
    title: "幽影固件",
    desc: "游击手技能消耗 -1，终结伤害 +2。",
    repeatable: false,
    persistent: true,
    apply: (run) => {
      run.mods.skirmisherCostMod += 1;
      run.mods.skirmisherFinisherBonus += 2;
    },
  },
  {
    id: "loom-injector",
    title: "织机注入器",
    desc: "支援型“修补波”治疗 +3，并清除干扰。",
    repeatable: false,
    persistent: true,
    apply: (run) => {
      run.mods.supportHealBonus += 3;
      run.mods.supportCleanseAll = true;
    },
  },
  {
    id: "hull-splice",
    title: "舰壳拼接",
    desc: "全体特工最大生命 +4，并立即恢复 4 点生命。",
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
  log: ["系统待机中，等待协议启动。"],
};

const screenRoot = document.getElementById("screen-root");
const runInfo = document.getElementById("run-info");
const logList = document.getElementById("log-list");

const DANGER_LABELS = {
  Skirmish: "遭遇战",
  Elite: "精英战",
  Boss: "首领战",
};

const ROLE_LABELS = {
  Tactician: "战术型",
  Vanguard: "先锋型",
  Skirmisher: "游击型",
  Support: "支援型",
};

const THREAT_LABELS = {
  low: "低",
  medium: "中",
  high: "高",
  extreme: "极高",
};

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

function getDangerLabel(danger) {
  return DANGER_LABELS[danger] || danger;
}

function getRoleLabel(role) {
  return ROLE_LABELS[role] || role;
}

function getThreatLabel(threat) {
  return THREAT_LABELS[threat] || threat;
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
    addLog(`已选择节点协议：${operation.title}。`);
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
  addLog("行动已开始，请为第 1 节点编成小队。");
  render();
}

function abortRun() {
  state.screen = "title";
  state.run = null;
  state.battle = null;
  state.pendingRewards = [];
  state.runResult = null;
  state.log = ["协议已重置，等待新的行动。"];
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
        addLog(`小队上限为 ${CONFIG.maxSquadSize} 人，请先取消一名特工。`);
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
    desc: "未知敌方例程。",
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
    addLog(`${enemy.name}进入第 2 阶段：封锁例程上线（攻击 +1，装甲 +4）。`);
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
    addLog(`${enemy.name}进入第 3 阶段：湮灭循环上线（攻击 +2，充能 +2，装甲 +2）。`);
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
    effects.push("小队开局获得 +1 能量。");
    effects.push(`${enemy.name}获得 +2 攻击。`);
  }

  if (operation.id === "firewall-breach") {
    enemy.status.exposed = Math.max(enemy.status.exposed, 2);
    enemy.armor += 6;
    effects.push(`${enemy.name}开局获得破绽（2）。`);
    effects.push(`${enemy.name}开局获得 +6 装甲。`);
  }

  if (operation.id === "kinetic-shielding") {
    squad.forEach((agent) => {
      agent.status.barrier += 2;
    });
    enemy.charge += 2;
    effects.push("小队全员开局获得 +2 护盾。");
    effects.push(`${enemy.name}开局获得 +2 充能。`);
  }

  if (operation.id === "jam-override") {
    enemy.atk = Math.max(1, enemy.atk - 1);
    squad.forEach((agent) => {
      agent.status.jam += 1;
    });
    effects.push(`${enemy.name}攻击降低 1 点。`);
    effects.push("小队开局获得干扰（1）。");
  }

  return effects;
}

function deployBattle() {
  if (!state.run) {
    return;
  }

  const nodeOperationPlan = ensureNodeOperationPlan();
  if (!nodeOperationPlan || !nodeOperationPlan.selectedId) {
    addLog("部署前必须先选择一个节点协议。");
    render();
    return;
  }
  const selectedOperation = getSelectedNodeOperation();

  ensureValidSquad();
  const aliveSquad = getAliveAgents(state.run.squadIds);
  if (aliveSquad.length === 0) {
    endRun("defeat", "已无可部署特工。");
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
  addLog(`第 ${state.run.nodeIndex + 1} 节点开始：${node.label}（${getDangerLabel(node.danger)}）。`);
  if (selectedOperation) {
    addLog(`协议生效：${selectedOperation.title}。`);
    operationEffects.forEach((line) => addLog(line));
  }
  addLog(`${enemy.name}已接敌，意图：${enemy.intent.label}。`);
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
    addLog(`${agent.name}受到干扰，本回合无法获得能量。`);
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
    addLog(`${state.battle.enemy.name}的装甲吸收了 ${absorbed} 点伤害。`);
  }

  if (damage > 0) {
    state.battle.enemy.hp = Math.max(0, state.battle.enemy.hp - damage);
    handleBossPhaseShift(state.battle.enemy);
  }

  addLog(`${sourceLabel}对${state.battle.enemy.name}造成了 ${damage} 点伤害。`);
  return damage;
}

function applyDamageToAgent(agent, rawDamage, options = {}) {
  let damage = Math.max(1, rawDamage);

  if (!options.ignoreGuard && agent.status.guard > 0) {
    damage = Math.max(1, damage - 2);
    addLog(`${agent.name}触发守势，降低了来袭伤害。`);
  }

  if (agent.status.barrier > 0) {
    const absorbed = Math.min(agent.status.barrier, damage);
    agent.status.barrier -= absorbed;
    damage -= absorbed;
    addLog(`${agent.name}的护盾吸收了 ${absorbed} 点伤害。`);
  }

  if (damage > 0) {
    agent.hp = Math.max(0, agent.hp - damage);
    addLog(`${agent.name}受到 ${damage} 点伤害。`);
    if (agent.hp <= 0) {
      addLog(`${agent.name}已离线。`);
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
  return intentIds.slice(0, count).map((intentId) => getIntentLabel(intentId)).join(" → ");
}

function getLikelyIntentTarget(intentId) {
  if (!state.run) {
    return "未知";
  }

  const alive = getAliveAgents(state.run.squadIds);
  if (alive.length === 0) {
    return "无目标";
  }

  const taunting = alive.filter((agent) => agent.status.taunt > 0);
  if (
    taunting.length > 0 &&
    ["strike", "pierce", "jam", "fortify", "annihilate"].includes(intentId)
  ) {
    if (taunting.length === 1) {
      return `${taunting[0].name}（嘲讽）`;
    }
    return "嘲讽中的特工";
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
    return "所有已部署特工";
  }

  if (intentId === "overload") {
    return "自身充能（强化下次攻击）";
  }

  if (intentId === "fortify") {
    return "自身加甲 + 随机刮伤";
  }

  return "随机已部署特工";
}

function getIntentForecast(enemy) {
  const intentId = enemy.intent.id;
  const charge = enemy.charge;

  if (intentId === "strike") {
    return `${formatDamageRange(
      Math.max(1, enemy.atk - 1) + charge,
      enemy.atk + 1 + charge
    )} 单体伤害`;
  }

  if (intentId === "pierce") {
    return `${formatDamageRange(enemy.atk + charge, enemy.atk + 2 + charge)} 单体伤害`;
  }

  if (intentId === "sweep") {
    return `${formatDamageRange(Math.max(1, enemy.atk - 2), enemy.atk)} 全体伤害`;
  }

  if (intentId === "jam") {
    return `${formatDamageRange(Math.max(1, enemy.atk - 2), enemy.atk)} + 干扰`;
  }

  if (intentId === "fortify") {
    return `+3 装甲，然后造成 ${formatDamageRange(1, Math.max(2, enemy.atk - 1))} 刮伤`;
  }

  if (intentId === "overload") {
    return "+3 充能，+1 装甲";
  }

  if (intentId === "lockdown") {
    return `${formatDamageRange(Math.max(1, enemy.atk - 3), Math.max(1, enemy.atk - 1))} 全体伤害 + 干扰`;
  }

  if (intentId === "annihilate") {
    return `${formatDamageRange(enemy.atk + 2 + charge, enemy.atk + 5 + charge)} 重型单体伤害`;
  }

  return "未知效果";
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
      addLog(`${enemy.name}对${target.name}施放了直击。`);
      enemy.charge = 0;
    }
  }

  if (intentId === "pierce") {
    const target = getEnemyTarget("lowest-hp");
    if (target) {
      const damage = randInt(enemy.atk, enemy.atk + 2) + enemy.charge;
      applyDamageToAgent(target, damage, { ignoreGuard: true });
      addLog(`${enemy.name}对${target.name}施放了穿刺。`);
      enemy.charge = 0;
    }
  }

  if (intentId === "sweep") {
    const targets = getAliveAgents(state.run.squadIds);
    const damage = randInt(Math.max(1, enemy.atk - 2), enemy.atk);
    targets.forEach((target) => {
      applyDamageToAgent(target, damage);
    });
    addLog(`${enemy.name}释放了脉冲横扫。`);
  }

  if (intentId === "jam") {
    const target = getEnemyTarget("highest-energy");
    if (target) {
      const damage = randInt(Math.max(1, enemy.atk - 2), enemy.atk);
      applyDamageToAgent(target, damage);
      target.status.jam += 1;
      addLog(`${enemy.name}对${target.name}施加了干扰。`);
    }
  }

  if (intentId === "fortify") {
    enemy.armor += 3;
    const target = getEnemyTarget("random");
    addLog(`${enemy.name}加固自身，装甲 +3。`);
    if (target) {
      const damage = randInt(1, Math.max(2, enemy.atk - 1));
      applyDamageToAgent(target, damage);
      addLog(`${enemy.name}对${target.name}造成刮擦伤害。`);
    }
  }

  if (intentId === "overload") {
    enemy.charge += 3;
    enemy.armor += 1;
    addLog(`${enemy.name}进入过载：下次攻击伤害 +3。`);
  }

  if (intentId === "lockdown") {
    const targets = getAliveAgents(state.run.squadIds);
    const damage = randInt(Math.max(1, enemy.atk - 3), Math.max(1, enemy.atk - 1));
    targets.forEach((target) => {
      applyDamageToAgent(target, damage);
      target.status.jam += 1;
    });
    enemy.armor += 2;
    addLog(`${enemy.name}释放封锁脉冲并强化装甲。`);
  }

  if (intentId === "annihilate") {
    const target = getEnemyTarget("highest-hp");
    if (target) {
      const damage = randInt(enemy.atk + 2, enemy.atk + 5) + enemy.charge;
      applyDamageToAgent(target, damage, { ignoreGuard: true });
      enemy.charge = 0;
      addLog(`${enemy.name}向${target.name}发射湮灭光束。`);
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
    addLog(`${actor.name}施加了 ${exposeTurns} 回合破绽。`);
    return;
  }

  if (actor.id === "bulwark") {
    actor.status.guard = Math.max(actor.status.guard, 2);
    actor.status.taunt = Math.max(actor.status.taunt, 2);
    actor.status.barrier += 3;
    addLog(`${actor.name}稳住前线（守势 + 嘲讽 + 护盾）。`);
    if (state.run.mods.vanguardBarrierAura) {
      grantBarrierToSquad(1, actor.id);
      addLog("壁垒网格为友军追加 +1 护盾。");
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
      addLog(`${actor.name}触发了处决加成。`);
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
    addLog(`${actor.name}为${target.name}恢复 ${recovered} 点生命并提供护盾。`);

    if (state.run.mods.supportCleanseAll) {
      getAliveAgents(state.run.squadIds).forEach((agent) => {
        agent.status.jam = 0;
      });
      addLog("织机注入器为全队清除了干扰。");
    }
  }
}

function getActionLabel(actionType, actor) {
  if (actionType === "attack") {
    return "攻击";
  }
  if (actionType === "defend") {
    return "防御";
  }
  if (actionType === "skill") {
    return actor.skill.title;
  }
  if (actionType === "burst") {
    return "同步爆发";
  }
  return "行动";
}

function performAction(actionType) {
  if (!state.run || !state.battle) {
    return;
  }

  const actor = findSelectedActor();
  if (!actor) {
    endRun("defeat", "没有可用的当前行动特工。");
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
    addLog(`${actor.name}进入防御姿态。`);
    if (actor.role === "Vanguard" && state.run.mods.vanguardBarrierAura) {
      grantBarrierToSquad(1, actor.id);
      addLog("壁垒网格为友军提供 +1 护盾。");
    }
  }

  if (actionType === "skill") {
    const cost = getSkillCost(actor);
    if (actor.energy < cost) {
      addLog(`${actor.name}能量不足，无法施放${actor.skill.title}。`);
      render();
      return;
    }
    actor.energy -= cost;
    executeSkill(actor);
  }

  if (actionType === "burst") {
    const cost = 3;
    if (actor.energy < cost) {
      addLog(`${actor.name}能量不足，无法施放同步爆发。`);
      render();
      return;
    }
    actor.energy -= cost;
    const base = randInt(actor.atk + 4, actor.atk + 8);
    const damage = calcPlayerDamage(actor, base);
    applyDamageToEnemy(damage, actor.name);
    addLog(`${actor.name}施放了同步爆发。`);
  }

  const playerDamage = Math.max(0, enemyHpBeforeAction - state.battle.enemy.hp);

  if (state.battle.enemy.hp <= 0) {
    state.battle.lastResolution = {
      turn: state.battle.turn,
      player: `${actor.name}使用${actionLabel}造成 ${playerDamage} 点伤害。`,
      enemy: `${state.battle.enemy.name}在敌方行动前已崩解。`,
    };
    addLog(`${state.battle.enemy.name}已崩解。`);
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
    player: `${actor.name}使用${actionLabel}造成 ${playerDamage} 点伤害。`,
    enemy: `${state.battle.enemy.name}完成了${resolvedIntentLabel}，对小队造成 ${enemyDamage} 点总伤害。`,
    intentThreat: INTENT_META[resolvedIntentId] ? INTENT_META[resolvedIntentId].threat : "medium",
  };

  const aliveSquad = getAliveAgents(state.run.squadIds);
  if (aliveSquad.length === 0) {
    endRun("defeat", "小队已全灭。");
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
    addLog(`自动修复共为小队恢复了 ${totalRecovered} 点生命。`);
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
    addLog("寂静核心已被中和，行动成功。");
  } else {
    addLog("行动失败。");
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
  addLog("遭遇战已清除，请选择一项指令奖励。");
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

  addLog(`已安装指令：${reward.title}。`);

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
    tags.push(`守势 ${agent.status.guard}`);
  }
  if (agent.status.barrier > 0) {
    tags.push(`护盾 ${agent.status.barrier}`);
  }
  if (agent.status.jam > 0) {
    tags.push(`干扰 ${agent.status.jam}`);
  }
  if (agent.status.taunt > 0) {
    tags.push(`嘲讽 ${agent.status.taunt}`);
  }
  return tags;
}

function renderDirectiveList() {
  if (!state.run) {
    return '<p class="muted">尚未安装常驻指令。</p>';
  }

  const entries = Object.entries(state.run.rewardTally);
  if (entries.length === 0) {
    return '<p class="muted">尚未安装常驻指令。</p>';
  }

  const labels = entries
    .map(([rewardId, count]) => {
      const reward = REWARD_POOL.find((item) => item.id === rewardId);
      if (!reward) {
        return null;
      }
      return count > 1 ? `${reward.title} ×${count}` : reward.title;
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
    <p class="muted">阶段阈值：完整度 70% 进入第 2 阶段，35% 进入第 3 阶段。</p>
    <ul>
      <li>第 1 阶段标志序列：${formatIntentSequence(bossTemplate.phasePatterns[1])}</li>
      <li>第 2 阶段标志序列：${formatIntentSequence(bossTemplate.phasePatterns[2])}</li>
      <li>第 3 阶段标志序列：${formatIntentSequence(bossTemplate.phasePatterns[3])}</li>
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
        <h3>首领读数</h3>
        <div class="chip-row">
          <span class="chip">完整度 ${integrityPct}%</span>
          <span class="chip">阶段 ${currentPhase}/3</span>
          <span class="chip boss-alert final">最终阶段已激活</span>
        </div>
        <p class="muted">当前阶段序列：${currentSignature}</p>
      </article>
    `;
  }

  const nextSignature = formatIntentSequence(enemy.bossState.phasePatterns[nextPhase] || []);
  const shiftDistance = Math.max(0, integrityPct - thresholdPct);
  const urgentClass = shiftDistance <= 10 ? "urgent" : "";

  return `
    <article class="boss-readout">
      <h3>首领读数</h3>
      <div class="chip-row">
        <span class="chip">完整度 ${integrityPct}%</span>
        <span class="chip">阶段 ${currentPhase}/3</span>
        <span class="chip boss-alert ${urgentClass}">
          下一次切换：${thresholdPct}%（还差 ${shiftDistance}%）
        </span>
      </div>
      <p class="muted">当前阶段序列：${currentSignature}</p>
      <p class="muted">即将到来的第 ${nextPhase} 阶段序列：${nextSignature}</p>
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
      <h3>节点协议（必选）</h3>
      <p class="muted">部署前请选择一个风险/收益修正项。</p>
      <div class="card-grid">
        ${options
          .map((operation) => {
            const selected = operationPlan.selectedId === operation.id;
            return `
              <article class="card ${selected ? "selected" : ""}">
                <h3>${operation.title}</h3>
                <p><strong>收益：</strong>${operation.reward}</p>
                <p><strong>风险：</strong>${operation.risk}</p>
                <button class="btn ${selected ? "" : "primary"}" data-action="pick-node-operation" data-operation-id="${operation.id}">
                  ${selected ? "已选择" : "选择"}
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
    runInfo.textContent = "当前无进行中的行动";
    return;
  }

  const aliveCount = state.run.roster.filter((agent) => agent.hp > 0).length;
  const nodeNum = clamp(state.run.nodeIndex + 1, 1, state.run.maxNode);
  const node = getCurrentNode();
  const stageLabel =
    state.screen === "run-end" || !node
      ? "行动结束"
      : `${getDangerLabel(node.danger)}：${node.label}`;

  runInfo.textContent = `节点 ${nodeNum}/${state.run.maxNode} | ${stageLabel} | 存活 ${aliveCount} | 指令 ${Object.keys(state.run.rewardTally).length}`;
}

function renderLog() {
  logList.innerHTML = state.log.map((line) => `<li>${line}</li>`).join("");
}

function renderTitle() {
  screenRoot.innerHTML = `
    <section>
      <h2 class="screen-title">寂静协议</h2>
      <p>组建一支 3 人智能体突击小队，击穿 4 个递进节点，并摧毁寂静核心。</p>
      <div class="row">
        <button class="btn primary" data-action="start-run">开始行动</button>
      </div>
      <p class="muted">纯本地静态原型，无后端。聚焦角色协同与快节奏战术短局。</p>
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
        <h2 class="screen-title">小队编成</h2>
        <small>已选 ${state.run.squadIds.length}/${CONFIG.maxSquadSize}</small>
      </div>

      <article class="panel" style="margin-bottom:12px;">
        <h3>下一场遭遇：节点 ${state.run.nodeIndex + 1} - ${node ? node.label : "未知"}</h3>
        <p>${node ? getDangerLabel(node.danger) : ""} 威胁等级。预测敌方：${threatLabels.join(" / ")}。</p>
        <p class="muted">每次胜利后自动修复：存活特工恢复 +${state.run.mods.postBattleHeal} 生命。</p>
      </article>

      ${
        bossTemplate
          ? `
        <article class="panel boss-dossier" style="margin-bottom:12px;">
          <h3>首领档案：${bossTemplate.name}</h3>
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
                <p>${getRoleLabel(agent.role)}</p>
                <div class="stat-row">
                  <span class="stat-pill">生命 ${agent.hp}/${agent.hpMax}</span>
                  <span class="stat-pill">攻击 ${agent.atk}</span>
                  <span class="stat-pill">能量 ${agent.energy}</span>
                </div>
                ${renderHpBar(agent.hp, agent.hpMax, "ally")}
                <p class="muted" style="margin-top:8px;">技能：${agent.skill.title}（消耗 ${skillCost} 能量）</p>
                <p class="muted">${agent.passive}</p>
                <label class="row" style="margin-top:10px;">
                  <input type="checkbox" data-agent-toggle="${agent.id}" ${checked} ${dead ? "disabled" : ""} />
                  <span>${dead ? "离线" : "部署"}</span>
                </label>
              </article>
            `;
          })
          .join("")}
      </div>

      <h3 style="margin-top:14px;">指令栈</h3>
      ${renderDirectiveList()}

      <div class="row" style="margin-top:12px;">
        <button class="btn primary" data-action="deploy" ${deployDisabled ? "disabled" : ""}>部署到节点</button>
        <button class="btn warn" data-action="abort-run">终止行动</button>
      </div>

      ${
        operationPlan && !operationPlan.selectedId
          ? '<p class="muted">部署前请先选择一个节点协议。</p>'
          : ""
      }
      ${aliveCount === 0 ? '<p class="muted">所有特工均已离线，本次行动无法继续。</p>' : ""}
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
    enemyStatusTags.push(`装甲 ${enemy.armor}`);
  }
  if (enemy.charge > 0) {
    enemyStatusTags.push(`充能 ${enemy.charge}`);
  }
  if (enemy.status.exposed > 0) {
    enemyStatusTags.push(`破绽 ${enemy.status.exposed}`);
  }
  if (enemy.bossState) {
    enemyStatusTags.push(`阶段 ${enemy.bossState.phase}/3`);
  }

  screenRoot.innerHTML = `
    <section>
      <div class="row spread">
        <h2 class="screen-title">节点 ${state.run.nodeIndex + 1} - ${node ? node.label : "战斗"}</h2>
        <small>回合 ${state.battle.turn}</small>
      </div>

      ${
        activeNodeOperation
          ? `<p class="muted"><strong>生效中的节点协议：</strong>${activeNodeOperation.title}</p>`
          : ""
      }

      <article class="intent-card">
        <h3>敌方意图：${enemy.intent.label}</h3>
        <p>${enemy.intent.desc}</p>
        <div class="chip-row">
          <span class="chip ${intentThreatClass}">威胁 ${getThreatLabel(enemy.intent.threat || "medium")}</span>
          <span class="chip">可能目标：${intentTarget}</span>
          <span class="chip">效果预估：${intentForecast}</span>
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
                <p>${getRoleLabel(agent.role)}</p>
                <div class="stat-row">
                  <span class="stat-pill">生命 ${agent.hp}/${agent.hpMax}</span>
                  <span class="stat-pill">攻击 ${agent.atk}</span>
                  <span class="stat-pill">能量 ${agent.energy}</span>
                </div>
                ${renderHpBar(agent.hp, agent.hpMax, "ally")}
                ${statusTags.length > 0 ? `<div class="chip-row" style="margin-top:8px;">${statusTags
                  .map((tag) => `<span class="chip">${tag}</span>`)
                  .join("")}</div>` : '<p class="muted" style="margin-top:8px;">当前无状态效果。</p>'}
                <p class="muted" style="margin-top:8px;">${agent.skill.title}: ${agent.skill.desc}</p>
                <div class="row" style="margin-top:10px;">
                  <button class="btn" data-action="select-actor" data-agent-id="${agent.id}">操控</button>
                </div>
              </article>
            `;
          })
          .join("")}

        <article class="card enemy-card">
          <h3>${enemy.name}</h3>
          <p>${enemy.role}</p>
          <div class="stat-row">
            <span class="stat-pill">生命 ${enemy.hp}/${enemy.hpMax}</span>
            <span class="stat-pill">攻击 ${enemy.atk}</span>
          </div>
          ${renderHpBar(enemy.hp, enemy.hpMax, "enemy")}
          ${enemyStatusTags.length > 0 ? `<div class="chip-row" style="margin-top:8px;">${enemyStatusTags
            .map((tag) => `<span class="chip">${tag}</span>`)
            .join("")}</div>` : '<p class="muted" style="margin-top:8px;">敌方当前无额外修正。</p>'}
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
          <h3>第 ${state.battle.lastResolution.turn} 回合复盘</h3>
          <p>${state.battle.lastResolution.player}</p>
          <p>${state.battle.lastResolution.enemy}</p>
        </article>
      `
          : ""
      }

      <div class="actions">
        <button class="btn primary" data-action="do-attack">攻击（+1 能量）</button>
        <button class="btn" data-action="do-defend">防御（+1 能量）</button>
        <button class="btn" data-action="do-skill" ${skillDisabled ? "disabled" : ""}>${
          actor ? actor.skill.title : "技能"
        }（-${skillCost} 能量）</button>
        <button class="btn" data-action="do-burst" ${burstDisabled ? "disabled" : ""}>同步爆发（-3 能量）</button>
      </div>

      <p style="margin-top:12px;">当前操控：<strong>${actor ? actor.name : "无"}</strong></p>
      <h3 style="margin-top:14px;">指令栈</h3>
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
      <h2 class="screen-title">指令奖励</h2>
      <p>进入节点 ${state.run.nodeIndex + 2} 前，选择一项升级。</p>
      <div class="reward-grid">
        ${state.pendingRewards
          .map(
            (reward) => `
              <article class="card">
                <h3>${reward.title}</h3>
                <p>${reward.desc}</p>
                <button class="btn primary" data-action="pick-reward" data-reward-id="${reward.id}">安装</button>
              </article>
            `
          )
          .join("")}
      </div>
      <h3 style="margin-top:14px;">当前指令</h3>
      ${renderDirectiveList()}
    </section>
  `;
}

function renderRunEnd() {
  const isWin = state.runResult === "victory";
  const title = isWin ? "行动完成" : "行动失败";
  const subtitle = isWin
    ? "寂静核心已崩塌，小队成功撤离。"
    : "核心中和前小队已被歼灭。";

  const directives =
    state.run && Object.keys(state.run.rewardTally).length > 0
      ? Object.entries(state.run.rewardTally)
          .map(([rewardId, count]) => {
            const reward = REWARD_POOL.find((item) => item.id === rewardId);
            if (!reward) {
              return "";
            }
            return `<li>${reward.title}${count > 1 ? ` ×${count}` : ""}</li>`;
          })
          .join("")
      : "<li>未安装任何常驻指令。</li>";

  const clearedNodes = isWin
    ? state.run.maxNode
    : state.run
      ? state.run.nodeIndex
      : 0;

  screenRoot.innerHTML = `
    <section>
      <h2 class="screen-title">${title}</h2>
      <p>${subtitle}</p>
      <p class="muted">已通关节点：${clearedNodes}/${state.run ? state.run.maxNode : NODE_PLAN.length}</p>

      <h3>已安装指令</h3>
      <ul>${directives}</ul>

      <div class="row" style="margin-top:12px;">
        <button class="btn primary" data-action="start-run">开始新行动</button>
        <button class="btn" data-action="to-title">返回标题</button>
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
