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
  lastBattleResult: null,
  lastTransition: null,
  runResult: null,
  log: ["系统待机中，等待协议启动。"],
};

const screenRoot = document.getElementById("screen-root");
const runInfo = document.getElementById("run-info");
const logList = document.getElementById("log-list");
const ENEMY_STAGE_TARGET_ID = "__enemy__";

const DANGER_LABELS = {
  Skirmish: "遭遇战",
  Elite: "精英战",
  Boss: "首领战",
};

const DANGER_VISUALS = {
  Skirmish: {
    short: "遭遇",
    style: "skirmish",
  },
  Elite: {
    short: "精英",
    style: "elite",
  },
  Boss: {
    short: "首领",
    style: "boss",
  },
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

const THREAT_DIRECTIVES = {
  low: "窗口稳态",
  medium: "准备承伤",
  high: "优先防御",
  extreme: "立即减伤",
};

const ROLE_VISUALS = {
  Tactician: {
    badge: "战术",
    color: "#63def6",
    soft: "#213a52",
    icon: "预判",
  },
  Vanguard: {
    badge: "先锋",
    color: "#71f0b8",
    soft: "#203f39",
    icon: "壁垒",
  },
  Skirmisher: {
    badge: "游击",
    color: "#ff9b74",
    soft: "#442727",
    icon: "突袭",
  },
  Support: {
    badge: "支援",
    color: "#c59cff",
    soft: "#3b2b4b",
    icon: "修复",
  },
};

const ENEMY_VISUALS = {
  warden: {
    badge: "防御体",
    color: "#ff8b6a",
    soft: "#4a2920",
  },
  hunter: {
    badge: "猎杀体",
    color: "#ffb36c",
    soft: "#4b3420",
  },
  siren: {
    badge: "扰乱体",
    color: "#ff7bac",
    soft: "#4d2037",
  },
  brute: {
    badge: "重锤体",
    color: "#ff6f74",
    soft: "#4c2426",
  },
  prime: {
    badge: "主核",
    color: "#ffd37a",
    soft: "#4e371f",
  },
};

const AGENT_GLYPHS = {
  seer: `
      <ellipse cx="48" cy="48" rx="18" ry="10" fill="none" stroke="#d6fbff" stroke-width="4"/>
      <circle cx="48" cy="48" r="5" fill="#d6fbff"/>
      <path d="M32 65 L48 56 L64 65" fill="none" stroke="#d6fbff" stroke-width="4" stroke-linecap="round"/>
    `,
  bulwark: `
      <path d="M48 20 L70 30 L66 56 Q48 76 30 56 L26 30 Z" fill="none" stroke="#dbffe7" stroke-width="4"/>
      <path d="M48 30 L48 58" stroke="#dbffe7" stroke-width="4" stroke-linecap="round"/>
      <path d="M38 45 L58 45" stroke="#dbffe7" stroke-width="4" stroke-linecap="round"/>
    `,
  ghost: `
      <path d="M34 64 L64 30" stroke="#ffe5de" stroke-width="5" stroke-linecap="round"/>
      <path d="M33 34 L63 64" stroke="#ffe5de" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
      <path d="M24 54 L40 70" stroke="#ffe5de" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
    `,
  loom: `
      <path d="M30 30 L66 66 M66 30 L30 66" stroke="#efe6ff" stroke-width="4" stroke-linecap="round"/>
      <circle cx="48" cy="48" r="8" fill="none" stroke="#efe6ff" stroke-width="3"/>
      <circle cx="48" cy="48" r="2.5" fill="#efe6ff"/>
    `,
};

const ENEMY_GLYPHS = {
  warden: `
      <rect x="30" y="24" width="36" height="48" rx="6" fill="none" stroke="#ffe8df" stroke-width="4"></rect>
      <path d="M36 44 H60 M36 54 H60" stroke="#ffe8df" stroke-width="3" stroke-linecap="round"></path>
    `,
  hunter: `
      <path d="M24 66 L46 22 L72 66" fill="none" stroke="#fff2e2" stroke-width="4" stroke-linejoin="round"></path>
      <circle cx="48" cy="50" r="5" fill="#fff2e2"></circle>
    `,
  siren: `
      <path d="M26 60 Q48 20 70 60" fill="none" stroke="#ffe6f0" stroke-width="4"></path>
      <path d="M32 66 Q48 40 64 66" fill="none" stroke="#ffe6f0" stroke-width="3"></path>
      <circle cx="48" cy="36" r="4" fill="#ffe6f0"></circle>
    `,
  brute: `
      <rect x="26" y="34" width="44" height="30" rx="4" fill="none" stroke="#ffe3e3" stroke-width="4"></rect>
      <path d="M26 46 H18 M70 46 H78" stroke="#ffe3e3" stroke-width="4" stroke-linecap="round"></path>
    `,
  prime: `
      <circle cx="48" cy="48" r="24" fill="none" stroke="#fff1d8" stroke-width="4"></circle>
      <circle cx="48" cy="48" r="10" fill="none" stroke="#fff1d8" stroke-width="3"></circle>
      <path d="M48 18 V30 M48 66 V78 M18 48 H30 M66 48 H78" stroke="#fff1d8" stroke-width="3" stroke-linecap="round"></path>
    `,
};

const BATTLE_EFFECT_LABELS = {
  attack: "进攻",
  guard: "守势",
  hit: "受击",
  heal: "修复",
  shield: "护盾",
  status: "状态",
  "phase-shift": "相位",
  defeat: "离线",
};

const BATTLE_EFFECT_DURATION_MS = {
  attack: 500,
  guard: 560,
  hit: 380,
  heal: 620,
  shield: 560,
  status: 660,
  "phase-shift": 700,
  defeat: 880,
};

const BATTLE_ARENA_EFFECT_DURATION_MS = {
  impact: 320,
  "ally-drive": 500,
  "enemy-drive": 540,
  "intent-shift": 660,
  "turn-shift": 620,
  "phase-shift": 620,
  "threat-surge": 700,
  "victory-pulse": 760,
};

const BATTLE_FLOAT_DURATION_MS = {
  attack: 760,
  damage: 980,
  heal: 1040,
  shield: 1080,
  status: 1180,
  phase: 1240,
  defeat: 1320,
};

const BATTLE_FLOAT_STAGGER_MS = 110;
const BATTLE_FLOAT_X_OFFSETS = [0, -14, 14, -22, 22];
const BATTLE_DECISION_LOCK_MS = 340;
const BATTLE_DECISION_READY_MS = 560;
const BATTLE_ACTION_RECENT_MS = 780;
const BATTLE_VICTORY_COLLAPSE_MS = 380;
const BATTLE_VICTORY_HANDOFF_MS = 700;
const REWARD_REVEAL_STAGGER_MS = 120;
const BATTLE_FLOAT_LABELS = {
  attack: "行动",
  damage: "受击",
  heal: "修复",
  shield: "护盾",
  status: "状态",
  phase: "阶段",
  defeat: "结果",
};

const BOSS_THREAT_FEEDBACK_TEXT = {
  high: "威胁升高",
  extreme: "致命威胁",
};

const THREAT_INTENSITY_PCT = {
  low: 30,
  medium: 54,
  high: 78,
  extreme: 96,
};

const NODE_OPERATION_VISUALS = {
  "overclock-surge": {
    style: "overclock",
    tone: "高风险高收益",
    rewardTag: "增幅",
    riskTag: "反噪",
    riskLevel: 4,
  },
  "firewall-breach": {
    style: "breach",
    tone: "破墙窗口",
    rewardTag: "破绽",
    riskTag: "装甲",
    riskLevel: 3,
  },
  "kinetic-shielding": {
    style: "shielding",
    tone: "稳态开局",
    rewardTag: "护盾",
    riskTag: "充能",
    riskLevel: 2,
  },
  "jam-override": {
    style: "jam",
    tone: "干扰博弈",
    rewardTag: "削攻",
    riskTag: "阻断",
    riskLevel: 2,
  },
};

const INTENT_ICONS = {
  strike: "直击",
  pierce: "穿刺",
  sweep: "横扫",
  jam: "干扰",
  fortify: "加固",
  overload: "过载",
  lockdown: "封锁",
  annihilate: "湮灭",
};

const REWARD_VISUALS = {
  "nanite-sweep": {
    style: "repair",
    tone: "即时修复",
    badge: "一次性",
    color: "#7aefc4",
    soft: "#1f4439",
  },
  "kinetic-compiler": {
    style: "offense",
    tone: "火力强化",
    badge: "常驻",
    color: "#75bcff",
    soft: "#223a56",
  },
  "cold-start-cells": {
    style: "energy",
    tone: "充能加速",
    badge: "可叠层",
    color: "#6ad6ff",
    soft: "#1d3a4b",
  },
  "self-repair-daemon": {
    style: "daemon",
    tone: "战后维护",
    badge: "可叠层",
    color: "#75e7b4",
    soft: "#21463b",
  },
  "seer-uplink": {
    style: "tactician",
    tone: "战术上行",
    badge: "限定",
    color: "#7ed5ff",
    soft: "#223b50",
  },
  "bulwark-mesh": {
    style: "vanguard",
    tone: "防线联动",
    badge: "限定",
    color: "#8deeb9",
    soft: "#20463d",
  },
  "ghost-firmware": {
    style: "skirmisher",
    tone: "突袭固件",
    badge: "限定",
    color: "#ffb38f",
    soft: "#492e26",
  },
  "loom-injector": {
    style: "support",
    tone: "补给增幅",
    badge: "限定",
    color: "#cdabff",
    soft: "#3a2b4d",
  },
  "hull-splice": {
    style: "hull",
    tone: "耐久重构",
    badge: "可叠层",
    color: "#ffcb8a",
    soft: "#4a3521",
  },
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

function getDangerVisual(danger) {
  return (
    DANGER_VISUALS[danger] || {
      short: "未知",
      style: "unknown",
    }
  );
}

function getRoleLabel(role) {
  return ROLE_LABELS[role] || role;
}

function getThreatLabel(threat) {
  return THREAT_LABELS[threat] || threat;
}

function getThreatDirective(threat) {
  return THREAT_DIRECTIVES[threat] || THREAT_DIRECTIVES.medium;
}

function getRunPhaseLabel(screen = state.screen) {
  if (screen === "squad") {
    return "部署准备";
  }
  if (screen === "battle") {
    return "节点战斗";
  }
  if (screen === "reward") {
    return "奖励择取";
  }
  if (screen === "run-end") {
    return "行动结算";
  }
  return "待机";
}

function getRoleVisual(role) {
  return (
    ROLE_VISUALS[role] || {
      badge: "智能体",
      color: "#8eb5bc",
      soft: "#263841",
      icon: "特勤",
    }
  );
}

function getEnemyVisual(enemyId) {
  return (
    ENEMY_VISUALS[enemyId] || {
      badge: "未知体",
      color: "#d98f7d",
      soft: "#473129",
    }
  );
}

function getNodeOperationVisual(operationId) {
  return (
    NODE_OPERATION_VISUALS[operationId] || {
      style: "neutral",
      tone: "协议调制",
      rewardTag: "收益",
      riskTag: "风险",
      riskLevel: 2,
    }
  );
}

function getIntentIcon(intentId) {
  return INTENT_ICONS[intentId] || "例程";
}

function getRewardVisual(rewardId) {
  return (
    REWARD_VISUALS[rewardId] || {
      style: "neutral",
      tone: "指令增益",
      badge: "常规",
      color: "#8cb5bf",
      soft: "#253a42",
    }
  );
}

function renderRewardGlyph(rewardId) {
  const visual = getRewardVisual(rewardId);
  const glyphs = {
    repair: `
      <circle cx="38" cy="34" r="15" fill="none" stroke="#dffdf4" stroke-width="3.2"></circle>
      <path d="M38 25 V43 M29 34 H47" stroke="#dffdf4" stroke-width="3.4" stroke-linecap="round"></path>
    `,
    offense: `
      <path d="M18 44 L36 18 L52 34 L66 20" fill="none" stroke="#e3f3ff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"></path>
      <path d="M60 20 H67 V27" fill="none" stroke="#e3f3ff" stroke-width="3.2" stroke-linecap="round"></path>
    `,
    energy: `
      <path d="M36 16 L24 36 H38 L30 56 L50 33 H38 Z" fill="none" stroke="#def8ff" stroke-width="3.2" stroke-linejoin="round"></path>
    `,
    daemon: `
      <rect x="22" y="20" width="32" height="30" rx="5" fill="none" stroke="#ddfff1" stroke-width="3"></rect>
      <circle cx="38" cy="35" r="6" fill="none" stroke="#ddfff1" stroke-width="2.5"></circle>
      <path d="M54 35 H63" stroke="#ddfff1" stroke-width="3" stroke-linecap="round"></path>
    `,
    tactician: `
      <ellipse cx="38" cy="32" rx="16" ry="9" fill="none" stroke="#d8f6ff" stroke-width="3.2"></ellipse>
      <circle cx="38" cy="32" r="4" fill="#d8f6ff"></circle>
      <path d="M24 47 L38 39 L52 47" fill="none" stroke="#d8f6ff" stroke-width="3.2" stroke-linecap="round"></path>
    `,
    vanguard: `
      <path d="M38 16 L56 25 L52 47 Q38 60 24 47 L20 25 Z" fill="none" stroke="#dfffee" stroke-width="3.2"></path>
      <path d="M38 26 V44 M30 35 H46" stroke="#dfffee" stroke-width="3.2" stroke-linecap="round"></path>
    `,
    skirmisher: `
      <path d="M24 48 L52 20" stroke="#ffe7de" stroke-width="4" stroke-linecap="round"></path>
      <path d="M24 24 L52 52" stroke="#ffe7de" stroke-width="2.5" stroke-linecap="round" opacity="0.85"></path>
    `,
    support: `
      <path d="M24 22 L52 50 M52 22 L24 50" stroke="#f4e8ff" stroke-width="3.2" stroke-linecap="round"></path>
      <circle cx="38" cy="36" r="7" fill="none" stroke="#f4e8ff" stroke-width="2.6"></circle>
    `,
    hull: `
      <rect x="20" y="22" width="36" height="28" rx="6" fill="none" stroke="#fff0da" stroke-width="3.2"></rect>
      <path d="M28 34 H48 M28 41 H44" stroke="#fff0da" stroke-width="2.8" stroke-linecap="round"></path>
    `,
  };
  const glyph = glyphs[visual.style] || '<circle cx="38" cy="34" r="11" fill="none" stroke="#deedf4" stroke-width="3"></circle>';
  return `
    <div class="reward-glyph reward-${visual.style}" style="--reward-main:${visual.color}; --reward-soft:${visual.soft};">
      <svg viewBox="0 0 76 68" aria-hidden="true">
        ${glyph}
      </svg>
    </div>
  `;
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

function getBattleSquadRoster() {
  if (!state.run) {
    return [];
  }
  return state.run.squadIds
    .map((agentId) => state.run.roster.find((agent) => agent.id === agentId))
    .filter(Boolean);
}

function createBattleFxState() {
  return {
    allyEffects: {},
    enemyEffects: [],
    arenaEffects: [],
    floatingTexts: [],
    nextTextId: 1,
    nextEffectId: 1,
    cleanupTimerId: null,
  };
}

function clearBattleFxTimer(fxState) {
  if (fxState && fxState.cleanupTimerId) {
    window.clearTimeout(fxState.cleanupTimerId);
    fxState.cleanupTimerId = null;
  }
}

function clearCurrentBattleFx() {
  if (!state.battle) {
    return;
  }
  clearBattleFlowTimers(state.battle);
  if (!state.battle.fx) {
    return;
  }
  clearBattleFxTimer(state.battle.fx);
}

function clearBattleFlowTimers(battleState = state.battle) {
  if (!battleState) {
    return;
  }

  if (battleState.decisionUnlockTimerId) {
    window.clearTimeout(battleState.decisionUnlockTimerId);
    battleState.decisionUnlockTimerId = null;
  }
  if (battleState.decisionReadyTimerId) {
    window.clearTimeout(battleState.decisionReadyTimerId);
    battleState.decisionReadyTimerId = null;
  }
  if (battleState.finishTimerId) {
    window.clearTimeout(battleState.finishTimerId);
    battleState.finishTimerId = null;
  }
}

function isBattleDecisionLocked(battleState = state.battle, now = Date.now()) {
  if (!battleState) {
    return false;
  }
  return Boolean(battleState.decisionLockUntil && battleState.decisionLockUntil > now);
}

function markBattleActionFeedback(actionType, now = Date.now()) {
  if (!state.battle || !actionType) {
    return;
  }
  state.battle.lastActionType = actionType;
  state.battle.lastActionUntil = now + BATTLE_ACTION_RECENT_MS;
  state.battle.decisionReadyUntil = 0;
  if (state.battle.decisionReadyTimerId) {
    window.clearTimeout(state.battle.decisionReadyTimerId);
    state.battle.decisionReadyTimerId = null;
  }
}

function lockBattleDecisionWindow(durationMs = BATTLE_DECISION_LOCK_MS) {
  if (!state.battle || durationMs <= 0) {
    return;
  }

  const battleState = state.battle;
  clearBattleFlowTimers(battleState);
  battleState.decisionReadyUntil = 0;
  battleState.decisionLockUntil = Date.now() + durationMs;

  battleState.decisionUnlockTimerId = window.setTimeout(() => {
    battleState.decisionUnlockTimerId = null;
    if (state.screen !== "battle" || state.battle !== battleState) {
      return;
    }
    battleState.decisionLockUntil = 0;
    battleState.decisionReadyUntil = Date.now() + BATTLE_DECISION_READY_MS;
    render();

    battleState.decisionReadyTimerId = window.setTimeout(() => {
      battleState.decisionReadyTimerId = null;
      if (state.screen !== "battle" || state.battle !== battleState) {
        return;
      }
      battleState.decisionReadyUntil = 0;
      render();
    }, BATTLE_DECISION_READY_MS + 20);
  }, durationMs);
}

function getBattleEffectDuration(effect) {
  return BATTLE_EFFECT_DURATION_MS[effect] || 420;
}

function getBattleArenaEffectDuration(effect) {
  return BATTLE_ARENA_EFFECT_DURATION_MS[effect] || 420;
}

function getBattleFloatingTextDuration(kind) {
  return BATTLE_FLOAT_DURATION_MS[kind] || 960;
}

function buildBattleFloatingText(kind, value, customText = "") {
  const overrideText = (customText || "").trim();
  const label = BATTLE_FLOAT_LABELS[kind] || BATTLE_FLOAT_LABELS.status;

  if (kind === "attack") {
    return {
      label,
      text: overrideText || "进攻",
    };
  }

  if (kind === "damage") {
    return {
      label,
      text: overrideText || `-${value}`,
    };
  }

  if (kind === "heal") {
    return {
      label,
      text: overrideText || `+${value}`,
    };
  }

  if (kind === "shield") {
    return {
      label,
      text: overrideText || `+${value}`,
    };
  }

  if (kind === "status") {
    return {
      label,
      text: overrideText || "变更",
    };
  }

  if (kind === "phase") {
    return {
      label,
      text: overrideText || "相位切换",
    };
  }

  if (kind === "defeat") {
    return {
      label,
      text: overrideText || "离线",
    };
  }

  return {
    label: BATTLE_FLOAT_LABELS.status,
    text: overrideText || `${value}`,
  };
}

function filterActiveFxEntries(entries, now = Date.now()) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return [];
  }
  return entries.filter((entry) => entry && entry.expiresAt > now);
}

function pruneBattleFxState(fxState, now = Date.now()) {
  if (!fxState) {
    return;
  }

  Object.keys(fxState.allyEffects).forEach((agentId) => {
    const activeEntries = filterActiveFxEntries(fxState.allyEffects[agentId], now);
    if (activeEntries.length > 0) {
      fxState.allyEffects[agentId] = activeEntries;
      return;
    }
    delete fxState.allyEffects[agentId];
  });

  fxState.enemyEffects = filterActiveFxEntries(fxState.enemyEffects, now);
  fxState.arenaEffects = filterActiveFxEntries(fxState.arenaEffects, now);
  fxState.floatingTexts = filterActiveFxEntries(fxState.floatingTexts, now);
}

function getBattleFxNextExpiry(fxState, now = Date.now()) {
  let nextExpiry = Infinity;

  const inspectEntries = (entries) => {
    entries.forEach((entry) => {
      if (entry.expiresAt > now && entry.expiresAt < nextExpiry) {
        nextExpiry = entry.expiresAt;
      }
    });
  };

  Object.values(fxState.allyEffects).forEach((entries) => inspectEntries(entries));
  inspectEntries(fxState.enemyEffects);
  inspectEntries(fxState.arenaEffects);
  inspectEntries(fxState.floatingTexts);
  return nextExpiry;
}

function scheduleBattleFxCleanup() {
  if (!state.battle || !state.battle.fx) {
    return;
  }

  const fxState = state.battle.fx;
  pruneBattleFxState(fxState);
  clearBattleFxTimer(fxState);
  const nextExpiry = getBattleFxNextExpiry(fxState);
  if (!Number.isFinite(nextExpiry)) {
    return;
  }

  const delay = Math.max(24, nextExpiry - Date.now() + 20);
  fxState.cleanupTimerId = window.setTimeout(() => {
    if (!state.battle || state.battle.fx !== fxState) {
      return;
    }
    fxState.cleanupTimerId = null;
    pruneBattleFxState(fxState);
    if (state.screen === "battle") {
      render();
    }
    scheduleBattleFxCleanup();
  }, delay);
}

function upsertBattleEffect(entries, effect, now, expiresAt, fxState) {
  const existing = entries.find((entry) => entry.effect === effect);
  if (existing) {
    existing.createdAt = now;
    existing.expiresAt = expiresAt;
    return;
  }

  entries.push({
    id: fxState.nextEffectId,
    effect,
    createdAt: now,
    expiresAt,
  });
  fxState.nextEffectId += 1;
}

function getUniqueEffectNames(entries, order = "asc") {
  const sorted = [...entries].sort((a, b) =>
    order === "desc" ? b.createdAt - a.createdAt : a.createdAt - b.createdAt
  );
  const seen = new Set();
  const names = [];
  sorted.forEach((entry) => {
    if (!seen.has(entry.effect)) {
      seen.add(entry.effect);
      names.push(entry.effect);
    }
  });
  return names;
}

function ensureBattleFx() {
  if (!state.battle) {
    return null;
  }

  if (!state.battle.fx) {
    state.battle.fx = createBattleFxState();
  }
  return state.battle.fx;
}

function resetBattleFx() {
  if (!state.battle) {
    return;
  }
  clearCurrentBattleFx();
  state.battle.fx = createBattleFxState();
}

function addBattleUnitEffect(side, targetId, effect) {
  const fx = ensureBattleFx();
  if (!fx || !effect) {
    return;
  }

  const now = Date.now();
  const expiresAt = now + getBattleEffectDuration(effect);

  if (side === "enemy") {
    fx.enemyEffects = filterActiveFxEntries(fx.enemyEffects, now);
    upsertBattleEffect(fx.enemyEffects, effect, now, expiresAt, fx);
    scheduleBattleFxCleanup();
    return;
  }

  if (side !== "ally" || !targetId) {
    return;
  }

  if (!fx.allyEffects[targetId]) {
    fx.allyEffects[targetId] = [];
  }
  fx.allyEffects[targetId] = filterActiveFxEntries(fx.allyEffects[targetId], now);
  upsertBattleEffect(fx.allyEffects[targetId], effect, now, expiresAt, fx);
  scheduleBattleFxCleanup();
}

function addBattleArenaEffect(effect) {
  const fx = ensureBattleFx();
  if (!fx || !effect) {
    return;
  }

  const now = Date.now();
  const expiresAt = now + getBattleArenaEffectDuration(effect);
  fx.arenaEffects = filterActiveFxEntries(fx.arenaEffects, now);
  upsertBattleEffect(fx.arenaEffects, effect, now, expiresAt, fx);
  scheduleBattleFxCleanup();
}

function addBattleFloatingText(side, targetId, kind, amount, customText = "") {
  const fx = ensureBattleFx();
  if (!fx || !targetId) {
    return;
  }

  const value = Math.max(0, Math.round(amount || 0));
  if (value <= 0 && !customText) {
    return;
  }

  const { label, text } = buildBattleFloatingText(kind, value, customText);

  if (!text) {
    return;
  }

  const now = Date.now();
  pruneBattleFxState(fx, now);
  const activeOnTarget = fx.floatingTexts.filter(
    (entry) => entry.side === side && entry.targetId === targetId && entry.expiresAt > now
  ).length;
  const delayMs = Math.min(320, activeOnTarget * BATTLE_FLOAT_STAGGER_MS);
  const durationMs = getBattleFloatingTextDuration(kind);
  const offsetIndex = activeOnTarget % BATTLE_FLOAT_X_OFFSETS.length;
  const offsetY = Math.min(26, activeOnTarget * 8);

  fx.floatingTexts.push({
    id: fx.nextTextId,
    side,
    targetId,
    kind,
    label,
    text,
    delayMs,
    durationMs,
    offsetX: BATTLE_FLOAT_X_OFFSETS[offsetIndex],
    offsetY,
    createdAt: now,
    expiresAt: now + delayMs + durationMs + 80,
  });
  fx.nextTextId += 1;
  scheduleBattleFxCleanup();
}

function addBattleAttackCue(side, targetId, customText = "进攻") {
  addBattleUnitEffect(side, targetId, "attack");
  addBattleFloatingText(side, targetId, "attack", 0, customText);
}

function addBattleStatusCue(side, targetId, text) {
  if (!targetId || !text) {
    return;
  }
  addBattleUnitEffect(side, targetId, "status");
  addBattleFloatingText(side, targetId, "status", 0, text);
}

function getBattleUnitEffectEntries(side, targetId, now = Date.now()) {
  if (!state.battle || !state.battle.fx) {
    return [];
  }

  const fxState = state.battle.fx;
  if (side === "enemy") {
    return filterActiveFxEntries(fxState.enemyEffects, now);
  }
  return filterActiveFxEntries(fxState.allyEffects[targetId] || [], now);
}

function getBattleUnitEffects(side, targetId) {
  const entries = getBattleUnitEffectEntries(side, targetId);
  return getUniqueEffectNames(entries, "asc");
}

function getBattleUnitFxClass(side, targetId) {
  const fx = getBattleUnitEffects(side, targetId);
  return fx.map((effect) => `fx-${effect}`).join(" ");
}

function getBattleArenaFxClass() {
  if (!state.battle || !state.battle.fx) {
    return "";
  }
  const entries = filterActiveFxEntries(state.battle.fx.arenaEffects);
  return getUniqueEffectNames(entries, "asc")
    .map((effect) => `fx-arena-${effect}`)
    .join(" ");
}

function hasBattleArenaEffect(effect, now = Date.now()) {
  if (!state.battle || !state.battle.fx || !effect) {
    return false;
  }
  return filterActiveFxEntries(state.battle.fx.arenaEffects, now).some(
    (entry) => entry.effect === effect
  );
}

function getThreatIntensityPct(threat) {
  return THREAT_INTENSITY_PCT[threat] || THREAT_INTENSITY_PCT.medium;
}

function getBattleTempoClass(squad) {
  if (!state.battle || !state.battle.fx) {
    return "";
  }

  const now = Date.now();
  const enemyTempo = getBattleUnitEffectEntries("enemy", ENEMY_STAGE_TARGET_ID, now).some((entry) =>
    ["attack", "phase-shift"].includes(entry.effect)
  );
  if (enemyTempo) {
    return "tempo-enemy";
  }

  const allyTempo = squad.some((agent) =>
    getBattleUnitEffectEntries("ally", agent.id, now).some((entry) =>
      ["attack", "guard", "heal", "phase-shift"].includes(entry.effect)
    )
  );
  return allyTempo ? "tempo-allies" : "";
}

function renderBattleFloatingTexts(side, targetId) {
  if (!state.battle || !state.battle.fx) {
    return "";
  }

  const now = Date.now();
  const items = filterActiveFxEntries(state.battle.fx.floatingTexts, now)
    .filter((entry) => entry.side === side && entry.targetId === targetId)
    .slice(-4);
  if (items.length === 0) {
    return "";
  }

  return `
    <div class="floating-text-layer side-${side}" aria-hidden="true">
      ${items
        .map(
          (entry, index) =>
            `<span class="floating-text kind-${entry.kind}" style="--float-index:${index}; --float-delay:${entry.delayMs}ms; --float-duration:${entry.durationMs}ms; --float-x:${entry.offsetX}px; --float-y:${entry.offsetY || 0}px;"><span class="floating-text-label">${entry.label || "反馈"}</span><span class="floating-text-value">${entry.text}</span></span>`
        )
        .join("")}
    </div>
  `;
}

function getBattleEffectTagText(effect, side) {
  if (effect === "defeat" && side === "enemy") {
    return "崩解";
  }
  return BATTLE_EFFECT_LABELS[effect] || effect;
}

function renderBattleEffectTags(side, targetId) {
  const entries = getBattleUnitEffectEntries(side, targetId);
  const effects = getUniqueEffectNames(entries, "desc").slice(0, 2).reverse();
  if (effects.length === 0) {
    return "";
  }

  return `
    <div class="battle-fx-tags" aria-hidden="true">
      ${effects
        .map(
          (effect) =>
            `<span class="battle-fx-tag tag-${effect}">${getBattleEffectTagText(effect, side)}</span>`
        )
        .join("")}
    </div>
  `;
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
  clearCurrentBattleFx();
  state.battle = null;
  state.pendingRewards = [];
  state.lastBattleResult = null;
  state.lastTransition = null;
  state.runResult = null;
  state.screen = "squad";
  state.log = [];
  addLog("行动已开始，请为第 1 节点编成小队。");
  render();
}

function abortRun() {
  state.screen = "title";
  state.run = null;
  clearCurrentBattleFx();
  state.battle = null;
  state.pendingRewards = [];
  state.lastBattleResult = null;
  state.lastTransition = null;
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

function applyBossThreatFeedback(enemy) {
  if (!state.battle || !enemy || !enemy.bossState || !enemy.intent) {
    return;
  }

  const threat = enemy.intent.threat || "medium";
  const cueText = BOSS_THREAT_FEEDBACK_TEXT[threat];
  if (!cueText) {
    state.battle.lastBossThreatCue = "";
    return;
  }

  const signature = `${enemy.bossState.phase}-${threat}`;
  if (state.battle.lastBossThreatCue === signature) {
    return;
  }
  state.battle.lastBossThreatCue = signature;
  addBattleArenaEffect("threat-surge");
  addBattleFloatingText("enemy", ENEMY_STAGE_TARGET_ID, "phase", 0, cueText);
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

  if (state.battle && state.battle.enemy === enemy) {
    addBattleArenaEffect("intent-shift");
    applyBossThreatFeedback(enemy);
  }
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
    addBattleUnitEffect("enemy", ENEMY_STAGE_TARGET_ID, "phase-shift");
    addBattleUnitEffect("enemy", ENEMY_STAGE_TARGET_ID, "shield");
    addBattleArenaEffect("phase-shift");
    addBattleFloatingText("enemy", ENEMY_STAGE_TARGET_ID, "phase", 0, "阶段 2");
    addBattleFloatingText("enemy", ENEMY_STAGE_TARGET_ID, "shield", 4);
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
    addBattleUnitEffect("enemy", ENEMY_STAGE_TARGET_ID, "phase-shift");
    addBattleUnitEffect("enemy", ENEMY_STAGE_TARGET_ID, "shield");
    addBattleArenaEffect("phase-shift");
    addBattleFloatingText("enemy", ENEMY_STAGE_TARGET_ID, "phase", 0, "阶段 3");
    addBattleFloatingText("enemy", ENEMY_STAGE_TARGET_ID, "shield", 2);
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
    lastActionType: "",
    lastActionUntil: 0,
    pendingFinish: false,
    finishPhase: "",
    decisionLockUntil: 0,
    decisionReadyUntil: 0,
    decisionUnlockTimerId: null,
    decisionReadyTimerId: null,
    finishTimerId: null,
    lastBossThreatCue: "",
    fx: createBattleFxState(),
  };
  state.lastBattleResult = null;
  state.screen = "battle";
  addBattleArenaEffect("turn-shift");

  if (enemy.bossState) {
    addBattleArenaEffect("phase-shift");
    addBattleUnitEffect("enemy", ENEMY_STAGE_TARGET_ID, "phase-shift");
    addBattleFloatingText("enemy", ENEMY_STAGE_TARGET_ID, "phase", 0, "主核接入");
    applyBossThreatFeedback(enemy);
    addLog(`${enemy.name}展开主核压制场，战斗压力提升。`);
  }

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
    addBattleStatusCue("ally", agent.id, "能量受阻");
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
    addBattleUnitEffect("enemy", ENEMY_STAGE_TARGET_ID, "shield");
    addBattleFloatingText("enemy", ENEMY_STAGE_TARGET_ID, "shield", absorbed);
    addLog(`${state.battle.enemy.name}的装甲吸收了 ${absorbed} 点伤害。`);
  }

  if (damage > 0) {
    state.battle.enemy.hp = Math.max(0, state.battle.enemy.hp - damage);
    addBattleUnitEffect("enemy", ENEMY_STAGE_TARGET_ID, "hit");
    addBattleFloatingText("enemy", ENEMY_STAGE_TARGET_ID, "damage", damage);
    addBattleArenaEffect("impact");
    handleBossPhaseShift(state.battle.enemy);
  }

  if (state.battle.enemy.hp <= 0) {
    addBattleUnitEffect("enemy", ENEMY_STAGE_TARGET_ID, "defeat");
    addBattleFloatingText("enemy", ENEMY_STAGE_TARGET_ID, "defeat", 0, "崩解");
  }

  addLog(`${sourceLabel}对${state.battle.enemy.name}造成了 ${damage} 点伤害。`);
  return damage;
}

function applyDamageToAgent(agent, rawDamage, options = {}) {
  let damage = Math.max(1, rawDamage);
  const originalDamage = damage;

  if (options.ignoreGuard && agent.status.guard > 0) {
    addBattleStatusCue("ally", agent.id, "守势穿透");
  }

  if (!options.ignoreGuard && agent.status.guard > 0) {
    damage = Math.max(1, damage - 2);
    const mitigated = Math.max(0, originalDamage - damage);
    if (mitigated > 0) {
      addBattleUnitEffect("ally", agent.id, "shield");
      addBattleFloatingText("ally", agent.id, "shield", mitigated);
    }
    addLog(`${agent.name}触发守势，降低了来袭伤害。`);
  }

  if (agent.status.barrier > 0) {
    const absorbed = Math.min(agent.status.barrier, damage);
    agent.status.barrier -= absorbed;
    damage -= absorbed;
    addBattleUnitEffect("ally", agent.id, "shield");
    addBattleFloatingText("ally", agent.id, "shield", absorbed);
    addLog(`${agent.name}的护盾吸收了 ${absorbed} 点伤害。`);
  }

  if (damage > 0) {
    agent.hp = Math.max(0, agent.hp - damage);
    addBattleUnitEffect("ally", agent.id, "hit");
    addBattleFloatingText("ally", agent.id, "damage", damage);
    addBattleArenaEffect("impact");
    addLog(`${agent.name}受到 ${damage} 点伤害。`);
    if (agent.hp <= 0) {
      addBattleUnitEffect("ally", agent.id, "defeat");
      addBattleFloatingText("ally", agent.id, "defeat", 0, "离线");
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

function getPostBattleRecoveryPreview() {
  if (!state.run) {
    return 0;
  }

  const healAmount = state.run.mods.postBattleHeal;
  if (healAmount <= 0) {
    return 0;
  }

  return state.run.roster.reduce((total, agent) => {
    if (agent.hp <= 0) {
      return total;
    }
    const recovered = Math.min(agent.hpMax, agent.hp + healAmount) - agent.hp;
    return total + recovered;
  }, 0);
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
  addBattleArenaEffect("enemy-drive");

  if (intentId === "strike") {
    addBattleAttackCue("enemy", ENEMY_STAGE_TARGET_ID, "压制");
    const target = getEnemyTarget("random");
    if (target) {
      const damage = randInt(Math.max(1, enemy.atk - 1), enemy.atk + 1) + enemy.charge;
      applyDamageToAgent(target, damage);
      addLog(`${enemy.name}对${target.name}施放了直击。`);
      enemy.charge = 0;
    }
  }

  if (intentId === "pierce") {
    addBattleAttackCue("enemy", ENEMY_STAGE_TARGET_ID, "穿刺");
    const target = getEnemyTarget("lowest-hp");
    if (target) {
      const damage = randInt(enemy.atk, enemy.atk + 2) + enemy.charge;
      applyDamageToAgent(target, damage, { ignoreGuard: true });
      addLog(`${enemy.name}对${target.name}施放了穿刺。`);
      enemy.charge = 0;
    }
  }

  if (intentId === "sweep") {
    addBattleAttackCue("enemy", ENEMY_STAGE_TARGET_ID, "横扫");
    const targets = getAliveAgents(state.run.squadIds);
    const damage = randInt(Math.max(1, enemy.atk - 2), enemy.atk);
    targets.forEach((target) => {
      applyDamageToAgent(target, damage);
    });
    addLog(`${enemy.name}释放了脉冲横扫。`);
  }

  if (intentId === "jam") {
    addBattleAttackCue("enemy", ENEMY_STAGE_TARGET_ID, "干扰");
    const target = getEnemyTarget("highest-energy");
    if (target) {
      const damage = randInt(Math.max(1, enemy.atk - 2), enemy.atk);
      applyDamageToAgent(target, damage);
      target.status.jam += 1;
      addBattleStatusCue("ally", target.id, "干扰 +1");
      addLog(`${enemy.name}对${target.name}施加了干扰。`);
    }
  }

  if (intentId === "fortify") {
    enemy.armor += 3;
    addBattleUnitEffect("enemy", ENEMY_STAGE_TARGET_ID, "shield");
    addBattleFloatingText("enemy", ENEMY_STAGE_TARGET_ID, "shield", 3);
    const target = getEnemyTarget("random");
    addLog(`${enemy.name}加固自身，装甲 +3。`);
    if (target) {
      addBattleAttackCue("enemy", ENEMY_STAGE_TARGET_ID, "反击");
      const damage = randInt(1, Math.max(2, enemy.atk - 1));
      applyDamageToAgent(target, damage);
      addLog(`${enemy.name}对${target.name}造成刮擦伤害。`);
    }
  }

  if (intentId === "overload") {
    enemy.charge += 3;
    enemy.armor += 1;
    addBattleUnitEffect("enemy", ENEMY_STAGE_TARGET_ID, "shield");
    addBattleFloatingText("enemy", ENEMY_STAGE_TARGET_ID, "shield", 1);
    addBattleStatusCue("enemy", ENEMY_STAGE_TARGET_ID, "充能 +3");
    addLog(`${enemy.name}进入过载：下次攻击伤害 +3。`);
  }

  if (intentId === "lockdown") {
    addBattleAttackCue("enemy", ENEMY_STAGE_TARGET_ID, "封锁");
    const targets = getAliveAgents(state.run.squadIds);
    const damage = randInt(Math.max(1, enemy.atk - 3), Math.max(1, enemy.atk - 1));
    targets.forEach((target) => {
      applyDamageToAgent(target, damage);
      target.status.jam += 1;
      addBattleStatusCue("ally", target.id, "干扰 +1");
    });
    enemy.armor += 2;
    addBattleUnitEffect("enemy", ENEMY_STAGE_TARGET_ID, "shield");
    addBattleFloatingText("enemy", ENEMY_STAGE_TARGET_ID, "shield", 2);
    addLog(`${enemy.name}释放封锁脉冲并强化装甲。`);
  }

  if (intentId === "annihilate") {
    addBattleAttackCue("enemy", ENEMY_STAGE_TARGET_ID, "湮灭");
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
    return [];
  }

  const recipients = [];
  getAliveAgents(state.run.squadIds).forEach((agent) => {
    if (agent.id !== exceptId) {
      agent.status.barrier += amount;
      recipients.push(agent);
    }
  });
  return recipients;
}

function executeSkill(actor) {
  if (!state.run || !state.battle) {
    return;
  }

  const enemy = state.battle.enemy;

  if (actor.id === "seer") {
    const base = randInt(Math.max(1, actor.atk - 1), actor.atk + 1);
    const damage = calcPlayerDamage(actor, base);
    addBattleAttackCue("ally", actor.id, "锁定");
    applyDamageToEnemy(damage, actor.name);
    const exposeTurns = 2 + state.run.mods.tacticianExposeTurns;
    enemy.status.exposed = Math.max(enemy.status.exposed, exposeTurns);
    addBattleStatusCue("enemy", ENEMY_STAGE_TARGET_ID, `破绽 +${exposeTurns}T`);
    addLog(`${actor.name}施加了 ${exposeTurns} 回合破绽。`);
    return;
  }

  if (actor.id === "bulwark") {
    addBattleUnitEffect("ally", actor.id, "guard");
    addBattleUnitEffect("ally", actor.id, "shield");
    actor.status.guard = Math.max(actor.status.guard, 2);
    actor.status.taunt = Math.max(actor.status.taunt, 2);
    actor.status.barrier += 3;
    addBattleStatusCue("ally", actor.id, "守势 +2 · 嘲讽 +2");
    addBattleFloatingText("ally", actor.id, "shield", 0, "锚定");
    addBattleFloatingText("ally", actor.id, "shield", 3);
    addLog(`${actor.name}稳住前线（守势 + 嘲讽 + 护盾）。`);
    if (state.run.mods.vanguardBarrierAura) {
      const recipients = grantBarrierToSquad(1, actor.id);
      recipients.forEach((agent) => {
        addBattleUnitEffect("ally", agent.id, "shield");
        addBattleFloatingText("ally", agent.id, "shield", 1);
      });
      addLog("壁垒网格为友军追加 +1 护盾。");
    }
    return;
  }

  if (actor.id === "ghost") {
    const hpRatio = enemy.hp / enemy.hpMax;
    let damage = calcPlayerDamage(actor, randInt(actor.atk + 3, actor.atk + 6));
    addBattleUnitEffect("ally", actor.id, "phase-shift");
    addBattleAttackCue("ally", actor.id, "相位突袭");
    addBattleFloatingText("ally", actor.id, "phase", 0, "相位");
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

    addBattleUnitEffect("ally", actor.id, "heal");
    addBattleFloatingText("ally", actor.id, "heal", 0, "修补波");
    const healAmount = 6 + state.run.mods.supportHealBonus;
    const beforeHp = target.hp;
    const hadJam = target.status.jam > 0;
    target.hp = Math.min(target.hpMax, target.hp + healAmount);
    target.status.barrier += 2;
    target.status.jam = 0;

    const recovered = target.hp - beforeHp;
    if (recovered > 0) {
      addBattleUnitEffect("ally", target.id, "heal");
      addBattleFloatingText("ally", target.id, "heal", recovered);
    }
    addBattleUnitEffect("ally", target.id, "shield");
    addBattleFloatingText("ally", target.id, "shield", 2);
    if (hadJam) {
      addBattleStatusCue("ally", target.id, "净化");
    }
    addLog(`${actor.name}为${target.name}恢复 ${recovered} 点生命并提供护盾。`);

    if (state.run.mods.supportCleanseAll) {
      let cleansedCount = 0;
      getAliveAgents(state.run.squadIds).forEach((agent) => {
        if (agent.status.jam > 0) {
          agent.status.jam = 0;
          cleansedCount += 1;
          addBattleStatusCue("ally", agent.id, "净化");
        }
      });
      if (cleansedCount > 0) {
        addLog("织机注入器为全队清除了干扰。");
      }
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

function beginBattleVictoryFlow(actor, actionLabel, playerDamage) {
  if (!state.battle) {
    return;
  }

  const battleState = state.battle;
  clearBattleFlowTimers(battleState);
  battleState.lastResolution = {
    turn: battleState.turn,
    actionLabel,
    player: `${actor.name}使用${actionLabel}造成 ${playerDamage} 点伤害。`,
    enemy: `${battleState.enemy.name}在敌方行动前已崩解。`,
    playerDamage,
    enemyDamage: 0,
    intentThreat: "low",
  };
  battleState.pendingFinish = true;
  battleState.finishPhase = "collapse";
  battleState.decisionLockUntil = 0;
  battleState.decisionReadyUntil = 0;
  addBattleArenaEffect("victory-pulse");
  addBattleFloatingText("enemy", ENEMY_STAGE_TARGET_ID, "phase", 0, "节点清除");
  addLog(`${battleState.enemy.name}已崩解，战场控制权已夺取。`);
  render();

  const transitionPayload = {
    actorName: actor.name,
    actionLabel,
    playerDamage,
    turn: battleState.turn,
  };

  battleState.finishTimerId = window.setTimeout(() => {
    if (state.screen !== "battle" || state.battle !== battleState || battleState.enemy.hp > 0) {
      return;
    }
    battleState.finishTimerId = null;
    battleState.finishPhase = "handoff";
    addBattleArenaEffect("turn-shift");
    render();

    battleState.finishTimerId = window.setTimeout(() => {
      if (state.screen !== "battle" || state.battle !== battleState || battleState.enemy.hp > 0) {
        return;
      }
      battleState.finishTimerId = null;
      onBattleWin(transitionPayload);
    }, BATTLE_VICTORY_HANDOFF_MS);
  }, BATTLE_VICTORY_COLLAPSE_MS);
}

function performAction(actionType) {
  if (!state.run || !state.battle) {
    return;
  }
  if (state.battle.pendingFinish || isBattleDecisionLocked()) {
    return;
  }

  resetBattleFx();

  const actor = findSelectedActor();
  if (!actor) {
    endRun("defeat", "没有可用的当前行动特工。");
    return;
  }

  const actionLabel = getActionLabel(actionType, actor);
  const enemyHpBeforeAction = state.battle.enemy.hp;
  const squadHpBeforeEnemyTurn = getTotalSquadHp();
  let actionExecuted = false;

  if (actionType === "attack") {
    addBattleArenaEffect("ally-drive");
    addBattleAttackCue("ally", actor.id, "突击");
    const base = randInt(Math.max(1, actor.atk - 1), actor.atk + 1);
    const damage = calcPlayerDamage(actor, base);
    applyDamageToEnemy(damage, actor.name);
    gainEnergy(actor, 1);
    actionExecuted = true;
  }

  if (actionType === "defend") {
    addBattleArenaEffect("ally-drive");
    addBattleUnitEffect("ally", actor.id, "guard");
    addBattleUnitEffect("ally", actor.id, "shield");
    addBattleStatusCue("ally", actor.id, "守势 +1");
    addBattleFloatingText("ally", actor.id, "shield", 0, "守势");
    actor.status.guard = Math.max(actor.status.guard, 1);
    gainEnergy(actor, 1);
    addLog(`${actor.name}进入防御姿态。`);
    if (actor.role === "Vanguard" && state.run.mods.vanguardBarrierAura) {
      const recipients = grantBarrierToSquad(1, actor.id);
      recipients.forEach((agent) => {
        addBattleUnitEffect("ally", agent.id, "shield");
        addBattleFloatingText("ally", agent.id, "shield", 1);
      });
      addLog("壁垒网格为友军提供 +1 护盾。");
    }
    actionExecuted = true;
  }

  if (actionType === "skill") {
    const cost = getSkillCost(actor);
    if (actor.energy < cost) {
      addLog(`${actor.name}能量不足，无法施放${actor.skill.title}。`);
      render();
      return;
    }
    addBattleArenaEffect("ally-drive");
    actor.energy -= cost;
    executeSkill(actor);
    actionExecuted = true;
  }

  if (actionType === "burst") {
    const cost = 3;
    if (actor.energy < cost) {
      addLog(`${actor.name}能量不足，无法施放同步爆发。`);
      render();
      return;
    }
    addBattleArenaEffect("ally-drive");
    actor.energy -= cost;
    addBattleAttackCue("ally", actor.id, "爆发");
    const base = randInt(actor.atk + 4, actor.atk + 8);
    const damage = calcPlayerDamage(actor, base);
    applyDamageToEnemy(damage, actor.name);
    addLog(`${actor.name}施放了同步爆发。`);
    actionExecuted = true;
  }

  if (!actionExecuted) {
    return;
  }

  markBattleActionFeedback(actionType);
  const playerDamage = Math.max(0, enemyHpBeforeAction - state.battle.enemy.hp);

  if (state.battle.enemy.hp <= 0) {
    beginBattleVictoryFlow(actor, actionLabel, playerDamage);
    return;
  }

  const resolvedIntentId = state.battle.enemy.intent.id;
  const resolvedIntentLabel = state.battle.enemy.intent.label;
  executeEnemyTurn();
  const squadHpAfterEnemyTurn = getTotalSquadHp();
  const enemyDamage = Math.max(0, squadHpBeforeEnemyTurn - squadHpAfterEnemyTurn);

  state.battle.lastResolution = {
    turn: state.battle.turn,
    actionLabel,
    player: `${actor.name}使用${actionLabel}造成 ${playerDamage} 点伤害。`,
    enemy: `${state.battle.enemy.name}完成了${resolvedIntentLabel}，对小队造成 ${enemyDamage} 点总伤害。`,
    playerDamage,
    enemyDamage,
    intentThreat: INTENT_META[resolvedIntentId] ? INTENT_META[resolvedIntentId].threat : "medium",
  };

  const aliveSquad = getAliveAgents(state.run.squadIds);
  if (aliveSquad.length === 0) {
    endRun("defeat", "小队已全灭。");
    return;
  }

  state.battle.turn += 1;
  addBattleArenaEffect("turn-shift");
  lockBattleDecisionWindow();
  render();
}

function applyPostBattleRecovery() {
  if (!state.run) {
    return 0;
  }

  const healAmount = state.run.mods.postBattleHeal;
  if (healAmount <= 0) {
    return 0;
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
  return totalRecovered;
}

function endRun(result, reason) {
  state.runResult = result;
  state.screen = "run-end";
  clearCurrentBattleFx();
  state.battle = null;
  state.lastTransition = null;

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

function onBattleWin(victoryPayload = null) {
  if (!state.run || !state.battle) {
    return;
  }

  const node = getCurrentNode();
  const battleState = state.battle;
  const recoveredHp = applyPostBattleRecovery();
  const actionLabel =
    victoryPayload && victoryPayload.actionLabel
      ? victoryPayload.actionLabel
      : battleState.lastResolution
        ? battleState.lastResolution.actionLabel
        : "常规行动";
  const playerDamage =
    victoryPayload && Number.isFinite(victoryPayload.playerDamage)
      ? victoryPayload.playerDamage
      : battleState.lastResolution
        ? battleState.lastResolution.playerDamage
        : 0;
  const actorName = victoryPayload && victoryPayload.actorName ? victoryPayload.actorName : "";

  state.lastBattleResult = {
    nodeIndex: state.run.nodeIndex + 1,
    nodeLabel: node ? node.label : `节点 ${state.run.nodeIndex + 1}`,
    enemyName: battleState.enemy.name,
    turn: victoryPayload && victoryPayload.turn ? victoryPayload.turn : battleState.turn,
    actionLabel,
    actorName,
    playerDamage,
    recoveredHp,
  };
  state.lastTransition = {
    fromNodeIndex: state.run.nodeIndex + 1,
    fromNodeLabel: node ? node.label : `节点 ${state.run.nodeIndex + 1}`,
    enemyName: battleState.enemy.name,
    actionLabel,
    recoveredHp,
    rewardTitle: "",
    toNodeIndex: Math.min(state.run.maxNode, state.run.nodeIndex + 2),
  };

  if (state.run.nodeIndex >= state.run.maxNode - 1) {
    endRun("victory");
    return;
  }

  state.pendingRewards = getRewardChoices();
  state.screen = "reward";
  clearCurrentBattleFx();
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

  const previousNodeNum = state.run.nodeIndex + 1;
  const previousTransition = state.lastTransition;
  state.pendingRewards = [];
  state.lastBattleResult = null;
  state.run.nodeIndex += 1;
  const nextNodeNum = state.run.nodeIndex + 1;
  state.lastTransition = {
    fromNodeIndex: previousTransition ? previousTransition.fromNodeIndex : previousNodeNum,
    fromNodeLabel: previousTransition ? previousTransition.fromNodeLabel : `节点 ${previousNodeNum}`,
    enemyName: previousTransition ? previousTransition.enemyName : "上一节点目标",
    actionLabel: previousTransition ? previousTransition.actionLabel : "常规行动",
    recoveredHp: previousTransition ? previousTransition.recoveredHp : 0,
    rewardTitle: reward.title,
    toNodeIndex: nextNodeNum,
  };
  ensureNodeOperationPlan(state.run.nodeIndex);
  ensureValidSquad();
  state.screen = "squad";
  const nextNode = getCurrentNode();
  if (nextNode) {
    addLog(`链路推进至第 ${nextNodeNum} 节点：${nextNode.label}。`);
  }
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

function renderEnergyCells(current, max = CONFIG.energyCap) {
  const safeMax = Math.max(1, max);
  const safeCurrent = clamp(current, 0, safeMax);
  return `
    <div class="energy-cells" aria-hidden="true">
      ${Array.from({ length: safeMax }, (_, index) => {
        const filled = index < safeCurrent ? "filled" : "";
        return `<span class="energy-cell ${filled}"></span>`;
      }).join("")}
    </div>
  `;
}

function renderAgentPortrait(agent) {
  const visual = getRoleVisual(agent.role);
  const glyph = AGENT_GLYPHS[agent.id] || '<circle cx="48" cy="48" r="12" fill="#eaf8ff"/>';
  const offlineClass = agent.hp <= 0 ? "offline" : "";

  return `
    <div class="portrait-shell ${offlineClass}" style="--portrait-main:${visual.color}; --portrait-soft:${visual.soft};">
      <svg class="portrait-svg" viewBox="0 0 96 96" aria-hidden="true">
        <circle cx="48" cy="48" r="38" fill="var(--portrait-soft)"></circle>
        <circle cx="48" cy="48" r="32" fill="none" stroke="var(--portrait-main)" stroke-width="2.5" opacity="0.65"></circle>
        <circle cx="48" cy="48" r="24" fill="#0c1820" opacity="0.5"></circle>
        ${glyph}
      </svg>
      <span class="portrait-badge">${visual.badge}</span>
    </div>
  `;
}

function renderEnemyPortrait(enemy) {
  const visual = getEnemyVisual(enemy.id);
  const glyph = ENEMY_GLYPHS[enemy.id] || '<circle cx="48" cy="48" r="12" fill="#f4e2dd"/>';
  return `
    <div class="portrait-shell enemy" style="--portrait-main:${visual.color}; --portrait-soft:${visual.soft};">
      <svg class="portrait-svg" viewBox="0 0 96 96" aria-hidden="true">
        <circle cx="48" cy="48" r="38" fill="var(--portrait-soft)"></circle>
        <circle cx="48" cy="48" r="32" fill="none" stroke="var(--portrait-main)" stroke-width="2.5" opacity="0.8"></circle>
        <circle cx="48" cy="48" r="24" fill="#1a1311" opacity="0.55"></circle>
        ${glyph}
      </svg>
      <span class="portrait-badge">${visual.badge}</span>
    </div>
  `;
}

function renderProtocolGlyph(operationId) {
  const visual = getNodeOperationVisual(operationId);
  const glyphs = {
    "overclock-surge": `
      <path d="M42 14 L28 36 H44 L36 58 L58 32 H42 Z" fill="none" stroke="#dffdf7" stroke-width="3.5" stroke-linejoin="round"></path>
    `,
    "firewall-breach": `
      <rect x="22" y="20" width="40" height="40" rx="6" fill="none" stroke="#f7f0ff" stroke-width="3"></rect>
      <path d="M44 20 V60 M22 40 H62" stroke="#f7f0ff" stroke-width="3"></path>
      <path d="M62 40 L74 40" stroke="#f7f0ff" stroke-width="3.5" stroke-linecap="round"></path>
    `,
    "kinetic-shielding": `
      <path d="M42 14 L64 24 L60 50 Q42 70 24 50 L20 24 Z" fill="none" stroke="#ebfff2" stroke-width="3.5"></path>
      <path d="M42 28 V50 M32 40 H52" stroke="#ebfff2" stroke-width="3.5" stroke-linecap="round"></path>
    `,
    "jam-override": `
      <circle cx="42" cy="38" r="16" fill="none" stroke="#f6efff" stroke-width="3"></circle>
      <path d="M28 52 L56 24 M56 52 L28 24" stroke="#f6efff" stroke-width="3.5" stroke-linecap="round"></path>
      <path d="M62 32 H74 M62 44 H74" stroke="#f6efff" stroke-width="3"></path>
    `,
  };
  const glyph = glyphs[operationId] || '<circle cx="42" cy="38" r="12" fill="none" stroke="#dbecf7" stroke-width="3"></circle>';
  return `
    <div class="protocol-glyph protocol-${visual.style}">
      <svg viewBox="0 0 84 76" aria-hidden="true">
        ${glyph}
      </svg>
    </div>
  `;
}

function renderIntentSequenceTrack(enemy, count = 4) {
  if (!enemy || !enemy.intent) {
    return "";
  }

  const pattern = Array.isArray(enemy.pattern) && enemy.pattern.length > 0 ? enemy.pattern : [enemy.intent.id];
  const ids = [enemy.intent.id];
  for (let i = 0; i < count - 1; i += 1) {
    const nextId = pattern[(enemy.patternIndex + i + 1) % pattern.length];
    ids.push(nextId);
  }

  return `
    <div class="intent-track">
      ${ids
        .map((intentId, index) => {
          const isCurrent = index === 0 ? "current" : "";
          const threat = INTENT_META[intentId] ? INTENT_META[intentId].threat : "medium";
          const tick = index === 0 ? "当前" : `+${index}`;
          return `
            <span class="intent-step ${isCurrent} intent-step-${threat}">
              <span class="intent-step-icon">${getIntentIcon(intentId)}</span>
              <span class="intent-step-label">${getIntentLabel(intentId)}</span>
              <span class="intent-step-tick">${tick}</span>
            </span>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderAllyBattlePuppet(agent, isSelected) {
  const roleVisual = getRoleVisual(agent.role);
  const glyph = AGENT_GLYPHS[agent.id] || '<circle cx="48" cy="48" r="12" fill="#eaf8ff"/>';
  const hpPct = clamp(Math.round((agent.hp / Math.max(1, agent.hpMax)) * 100), 0, 100);
  const roleLabel = getRoleLabel(agent.role);
  const selectedClass = isSelected ? "selected" : "";
  const selectedTag = isSelected ? '<span class="battle-selected-tag">操控中</span>' : "";
  const defeatedClass = agent.hp <= 0 ? "defeated" : "";
  const fxClass = getBattleUnitFxClass("ally", agent.id);

  return `
    <div class="battle-puppet ally-puppet role-${agent.role.toLowerCase()} ${selectedClass} ${defeatedClass} ${fxClass}" style="--unit-accent:${roleVisual.color}; --unit-soft:${roleVisual.soft};">
      ${selectedTag}
      <div class="battle-puppet-ring"></div>
      <span class="battle-fx-flare" aria-hidden="true"></span>
      <svg class="battle-puppet-svg" viewBox="0 0 120 142" aria-hidden="true">
        <ellipse class="battle-shadow" cx="60" cy="126" rx="33" ry="10"></ellipse>
        <circle class="battle-head" cx="60" cy="46" r="22"></circle>
        <rect class="battle-core" x="43" y="68" width="34" height="42" rx="13"></rect>
        <rect class="battle-limb" x="32" y="76" width="12" height="34" rx="6"></rect>
        <rect class="battle-limb" x="76" y="76" width="12" height="34" rx="6"></rect>
        <rect class="battle-limb" x="48" y="108" width="10" height="22" rx="5"></rect>
        <rect class="battle-limb" x="62" y="108" width="10" height="22" rx="5"></rect>
        <g class="battle-glyph" transform="translate(12 6)">
          ${glyph}
        </g>
      </svg>
      ${renderBattleFloatingTexts("ally", agent.id)}
      ${renderBattleEffectTags("ally", agent.id)}
      <div class="battle-puppet-meta ${selectedClass}">
        <strong>${agent.name}</strong>
        <small class="battle-puppet-role">${roleLabel}</small>
        <small class="battle-puppet-vitals">HP ${agent.hp}/${agent.hpMax}</small>
        <span class="battle-mini-hp"><span style="width:${hpPct}%"></span></span>
      </div>
    </div>
  `;
}

function renderEnemyBattlePuppet(enemy) {
  const visual = getEnemyVisual(enemy.id);
  const glyph = ENEMY_GLYPHS[enemy.id] || '<circle cx="48" cy="48" r="12" fill="#f4e2dd"/>';
  const hpPct = clamp(Math.round((enemy.hp / Math.max(1, enemy.hpMax)) * 100), 0, 100);
  const bossClass = enemy.bossState ? "boss" : "";
  const phaseClass = enemy.bossState ? `phase-${enemy.bossState.phase}` : "";
  const defeatedClass = enemy.hp <= 0 ? "defeated" : "";
  const fxClass = getBattleUnitFxClass("enemy", ENEMY_STAGE_TARGET_ID);
  const phaseBadge = enemy.bossState
    ? `<span class="battle-boss-tag">阶段 ${enemy.bossState.phase}</span>`
    : "";
  const coreBadge = enemy.bossState ? '<span class="battle-boss-core">主核</span>' : "";
  const bossAura = enemy.bossState ? '<span class="battle-boss-aura" aria-hidden="true"></span>' : "";

  return `
    <div class="battle-puppet enemy-puppet ${bossClass} ${phaseClass} ${defeatedClass} ${fxClass}" style="--unit-accent:${visual.color}; --unit-soft:${visual.soft};">
      ${bossAura}
      <div class="battle-puppet-ring"></div>
      <span class="battle-fx-flare" aria-hidden="true"></span>
      <svg class="battle-puppet-svg enemy" viewBox="0 0 168 176" aria-hidden="true">
        <ellipse class="battle-shadow" cx="84" cy="154" rx="46" ry="12"></ellipse>
        <path class="battle-shell" d="M84 22 L128 50 L120 118 Q84 146 48 118 L40 50 Z"></path>
        <circle class="battle-head enemy" cx="84" cy="72" r="34"></circle>
        <g class="battle-glyph enemy" transform="translate(36 24)">
          ${glyph}
        </g>
      </svg>
      ${renderBattleFloatingTexts("enemy", ENEMY_STAGE_TARGET_ID)}
      ${renderBattleEffectTags("enemy", ENEMY_STAGE_TARGET_ID)}
      ${phaseBadge}
      ${coreBadge}
      <div class="battle-puppet-meta enemy">
        <strong>${enemy.name}</strong>
        <small class="battle-puppet-role enemy">${enemy.role}</small>
        <small class="battle-puppet-vitals">HP ${enemy.hp}/${enemy.hpMax}</small>
        <span class="battle-mini-hp enemy"><span style="width:${hpPct}%"></span></span>
      </div>
    </div>
  `;
}

function renderBattleStage(
  squad,
  enemy,
  selectedActorId,
  intentThreat = "medium",
  turn = 1,
  intentTarget = "未知"
) {
  const arenaFxClass = getBattleArenaFxClass();
  const bossClass = enemy.bossState ? "boss-encounter" : "";
  const phaseClass = enemy.bossState ? `boss-phase-${enemy.bossState.phase}` : "";
  const centerLabel = enemy.bossState ? "BOSS" : "VS";
  const threatKey = intentThreat || "medium";
  const threatLabel = getThreatLabel(threatKey);
  const threatClass = `battle-threat-${threatKey}`;
  const threatIntensity = getThreatIntensityPct(threatKey);
  const stageTempoClass = getBattleTempoClass(squad);
  const intentEcho = enemy.intent ? `${getIntentIcon(enemy.intent.id)} ${enemy.intent.label}` : "例程未知";
  const enemyLaneLabel = enemy.bossState ? "敌方主核" : "敌方单位";
  const turnLabel = `回合 ${Math.max(1, turn || 1)}`;
  const phaseLabel = enemy.bossState ? `阶段 ${enemy.bossState.phase}/3` : "常规遭遇";
  const focusPulseClass = hasBattleArenaEffect("turn-shift") ? "pulse" : "";
  const phasePulseClass = hasBattleArenaEffect("phase-shift") ? "pulse" : "";
  const threatPulseClass = hasBattleArenaEffect("threat-surge") ? "pulse" : "";

  return `
    <article class="battle-stage panel panel-visual ${arenaFxClass} ${bossClass} ${phaseClass} ${threatClass} ${stageTempoClass}">
      <div class="battle-stage-head" aria-hidden="true">
        <span class="battle-lane-tag allies">我方小队 · ${squad.length} 单位</span>
        <span class="battle-stage-focus ${focusPulseClass}">${turnLabel}</span>
        <span class="battle-lane-tag enemy">${enemyLaneLabel}</span>
      </div>
      <div class="battle-stage-grid">
        <div class="battle-lane allies">
          ${squad
            .map(
              (agent, index) => `
                <div class="battle-slot ally-slot">
                  <span class="battle-slot-label">我方 ${index + 1}</span>
                  ${renderAllyBattlePuppet(agent, selectedActorId === agent.id)}
                </div>
              `
            )
            .join("")}
        </div>
        <div class="battle-stage-center" aria-hidden="true">
          <strong>${centerLabel}</strong>
          <small class="${threatClass}">威胁 ${threatLabel}</small>
          <span class="battle-threat-lane">
            <span class="battle-threat-fill" style="width:${threatIntensity}%"></span>
          </span>
          <span class="battle-intent-echo">${intentEcho}</span>
          <span class="battle-intent-target">目标：${intentTarget}</span>
          <span class="battle-phase-echo ${phasePulseClass}">${phaseLabel}</span>
        </div>
        <div class="battle-lane enemy">
          <div class="battle-slot enemy-slot">
            <span class="battle-slot-label enemy">${enemy.bossState ? "主核目标" : "敌方目标"}</span>
            <span class="battle-threat-callout ${threatClass} ${threatPulseClass}">${threatLabel}威胁</span>
            ${renderEnemyBattlePuppet(enemy)}
          </div>
        </div>
      </div>
    </article>
  `;
}

function renderImpactBar(value, variant) {
  const amount = Math.max(0, value || 0);
  const width = amount <= 0 ? 0 : clamp(Math.round((amount / 24) * 100), 10, 100);
  return `
    <div class="impact-track ${variant}">
      <span class="impact-fill" style="width:${width}%"></span>
      <strong>${amount}</strong>
    </div>
  `;
}

function renderStageBadge(danger, fallbackLabel = "未知威胁") {
  if (!danger) {
    return `<span class="stage-badge stage-unknown">${fallbackLabel}</span>`;
  }
  const visual = getDangerVisual(danger);
  return `
    <span class="stage-badge stage-${visual.style}">
      <span class="stage-badge-dot"></span>
      ${getDangerLabel(danger)}
    </span>
  `;
}

function renderStageProgress(activeIndex, clearedCount = 0) {
  if (!state.run) {
    return "";
  }
  const nodes = NODE_PLAN.slice(0, state.run.maxNode);
  return `
    <div class="stage-progress" aria-label="节点进度">
      ${nodes
        .map((node, index) => {
          const visual = getDangerVisual(node.danger);
          const isCleared = index < clearedCount;
          const isActive = index === activeIndex;
          const statusClass = isActive ? "active" : isCleared ? "cleared" : "upcoming";
          const statusLabel = isActive ? "当前" : isCleared ? "已清除" : "待推进";
          return `
            <span class="stage-node stage-${visual.style} ${statusClass}">
              <small>节点 ${index + 1}</small>
              <strong>${visual.short}</strong>
              <em>${statusLabel}</em>
            </span>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderBossPhaseReference(bossTemplate) {
  if (!bossTemplate || !bossTemplate.phasePatterns) {
    return "";
  }

  return `
    <p class="muted">阶段阈值：完整度 70% 进入第 2 阶段，35% 进入第 3 阶段。</p>
    <div class="boss-phase-reference">
      ${[1, 2, 3]
        .map(
          (phase) => `
            <div class="phase-ref-card">
              <span class="phase-ref-badge">阶段 ${phase}</span>
              <p>${formatIntentSequence(bossTemplate.phasePatterns[phase], 4)}</p>
            </div>
          `
        )
        .join("")}
    </div>
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
        <div class="boss-integrity-track">
          <span class="boss-integrity-fill" style="width:${integrityPct}%"></span>
        </div>
        <div class="boss-phase-nodes">
          <span class="phase-node passed">一</span>
          <span class="phase-node passed">二</span>
          <span class="phase-node active">三</span>
        </div>
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
  const phaseNodes = [1, 2, 3]
    .map((phase) => {
      let cls = "";
      if (phase < currentPhase) {
        cls = "passed";
      } else if (phase === currentPhase) {
        cls = "active";
      }
      return `<span class="phase-node ${cls}">${phase === 1 ? "一" : phase === 2 ? "二" : "三"}</span>`;
    })
    .join("");

  return `
    <article class="boss-readout">
      <h3>首领读数</h3>
      <div class="boss-integrity-track">
        <span class="boss-integrity-fill" style="width:${integrityPct}%"></span>
      </div>
      <div class="boss-phase-nodes">${phaseNodes}</div>
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
  const selectedOperation = operationPlan.selectedId
    ? getNodeOperationById(operationPlan.selectedId)
    : null;
  const selectedVisual = selectedOperation ? getNodeOperationVisual(selectedOperation.id) : null;
  const overview = selectedOperation
    ? `
      <article class="operation-overview selected protocol-${selectedVisual.style}">
        <div class="row spread">
          <h4>当前锁定协议：${selectedOperation.title}</h4>
          <span class="chip operation-chip-selected">已锁定</span>
        </div>
        <p class="muted">收益：${selectedOperation.reward}</p>
        <p class="muted">代价：${selectedOperation.risk}</p>
      </article>
    `
    : `
      <article class="operation-overview pending">
        <div class="row spread">
          <h4>尚未锁定节点协议</h4>
          <span class="chip operation-chip-pending">必选</span>
        </div>
        <p class="muted">部署前请先选择 1 项协议，再确认风险等级与战斗节奏。</p>
      </article>
    `;

  return `
    <article class="panel panel-visual" style="margin-bottom:12px;">
      <h3>节点协议（必选）</h3>
      <p class="muted">部署前请选择一个风险/收益修正项。不同协议会改变整场战斗节奏。</p>
      ${overview}
      <div class="card-grid">
        ${options
          .map((operation, index) => {
            const selected = operationPlan.selectedId === operation.id;
            const visual = getNodeOperationVisual(operation.id);
            const hasPicked = Boolean(operationPlan.selectedId);
            const riskDots = Array.from({ length: 4 }, (_, index) => {
              const active = index < visual.riskLevel ? "active" : "";
              return `<span class="risk-dot ${active}"></span>`;
            }).join("");
            const protocolState = selected ? "已锁定" : hasPicked ? "可切换" : "待选择";
            const switchClass = selected ? "selected" : hasPicked ? "switchable" : "";
            return `
              <article class="card protocol-card protocol-${visual.style} ${selected ? "selected" : ""}">
                <div class="protocol-meta row spread">
                  <span class="protocol-index">方案 ${index + 1}</span>
                  <span class="protocol-state ${switchClass}">${protocolState}</span>
                </div>
                <div class="protocol-head">
                  ${renderProtocolGlyph(operation.id)}
                  <div>
                    <h3>${operation.title}</h3>
                    <p class="muted">${visual.tone}</p>
                  </div>
                </div>
                <div class="protocol-line positive">
                  <span class="protocol-tag">${visual.rewardTag}</span>
                  <p>${operation.reward}</p>
                </div>
                <div class="protocol-line negative">
                  <span class="protocol-tag">${visual.riskTag}</span>
                  <p>${operation.risk}</p>
                </div>
                <div class="protocol-risk">
                  <small>压力等级</small>
                  <div class="risk-dots">${riskDots}</div>
                </div>
                <button class="btn ${selected ? "" : "primary"}" data-action="pick-node-operation" data-operation-id="${operation.id}">
                  ${
                    selected
                      ? "已选择"
                      : hasPicked
                        ? "切换为此方案"
                        : "选择此方案"
                  }
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
    runInfo.innerHTML = `
      <span class="run-info-chip run-info-idle">待机</span>
      <span class="run-info-chip">当前无进行中的行动</span>
    `;
    return;
  }

  const aliveCount = state.run.roster.filter((agent) => agent.hp > 0).length;
  const totalAgents = state.run.roster.length;
  const deployedAliveCount = getAliveAgents(state.run.squadIds).length;
  const nodeNum = clamp(state.run.nodeIndex + 1, 1, state.run.maxNode);
  const node = getCurrentNode();
  const selectedOperation = getSelectedNodeOperation();
  const phaseLabel = getRunPhaseLabel();
  const nextNode = NODE_PLAN[state.run.nodeIndex + 1] || null;
  const stageLabel =
    state.screen === "run-end"
      ? "行动结束"
      : state.screen === "reward"
        ? nextNode
          ? `下一节点：${getDangerLabel(nextNode.danger)}·${nextNode.label}`
          : "终局结算"
        : node
          ? `${getDangerLabel(node.danger)}·${node.label}`
          : "行动结束";

  runInfo.innerHTML = `
    <span class="run-info-chip run-info-phase">${phaseLabel}</span>
    <span class="run-info-chip">节点 ${nodeNum}/${state.run.maxNode}</span>
    <span class="run-info-chip run-info-stage">${stageLabel}</span>
    <span class="run-info-chip ${selectedOperation ? "run-info-ready" : "run-info-pending"}">
      ${selectedOperation ? `协议 ${selectedOperation.title}` : "协议待选择"}
    </span>
    <span class="run-info-chip">存活 ${aliveCount}/${totalAgents}</span>
    <span class="run-info-chip">部署 ${deployedAliveCount}/${CONFIG.maxSquadSize}</span>
    <span class="run-info-chip">指令 ${Object.keys(state.run.rewardTally).length}</span>
  `;
}

function renderLog() {
  logList.innerHTML = state.log.map((line) => `<li>${line}</li>`).join("");
}

function renderTitle() {
  screenRoot.innerHTML = `
    <section class="title-screen">
      <article class="title-hero">
        <div class="title-copy">
          <h2 class="screen-title">寂静协议</h2>
          <p>组建一支 3 人智能体突击小队，击穿 4 个递进节点，并摧毁寂静核心。</p>
          <p class="muted">纯本地静态原型，无后端。聚焦角色协同与快节奏战术短局。</p>
          <div class="row">
            <button class="btn primary" data-action="start-run">开始行动</button>
          </div>
        </div>
        <div class="title-art" aria-hidden="true">
          <svg viewBox="0 0 220 160">
            <defs>
              <linearGradient id="titleGlowA" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#5cf2c7" stop-opacity="0.95"></stop>
                <stop offset="100%" stop-color="#5ba8ff" stop-opacity="0.7"></stop>
              </linearGradient>
            </defs>
            <rect x="14" y="14" width="192" height="132" rx="14" fill="#0f1c23" stroke="#2c4e5f"></rect>
            <circle cx="110" cy="80" r="40" fill="none" stroke="url(#titleGlowA)" stroke-width="3"></circle>
            <circle cx="110" cy="80" r="16" fill="#0f1c23" stroke="url(#titleGlowA)" stroke-width="2.5"></circle>
            <path d="M56 80 H88 M132 80 H164 M110 40 V56 M110 104 V120" stroke="url(#titleGlowA)" stroke-width="3" stroke-linecap="round"></path>
            <path d="M38 46 L58 60 M182 46 L162 60 M38 114 L58 100 M182 114 L162 100" stroke="#3a7687" stroke-width="2.5" stroke-linecap="round"></path>
          </svg>
        </div>
      </article>
      <div class="title-pill-row">
        <span class="chip">3 人小队</span>
        <span class="chip">4 节点短局</span>
        <span class="chip">纯前端静态运行</span>
      </div>
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
  const deployedAliveCount = getAliveAgents(state.run.squadIds).length;
  const deployDisabled =
    state.run.squadIds.length === 0 ||
    aliveCount === 0 ||
    !operationPlan ||
    !operationPlan.selectedId;
  const selectedOperation =
    operationPlan && operationPlan.selectedId
      ? getNodeOperationById(operationPlan.selectedId)
      : null;
  const transitionDigest =
    state.lastTransition && state.lastTransition.toNodeIndex === state.run.nodeIndex + 1
      ? state.lastTransition
      : null;
  const threatLabels = node
    ? node.enemies
        .map((enemyId) => {
          const visual = getEnemyVisual(enemyId);
          return `<span class="chip enemy-hint" style="--enemy-accent:${visual.color}">${getThreatName(enemyId)}</span>`;
        })
        .join("")
    : "";
  const bossTemplate = getNodeBossDossier(node);

  screenRoot.innerHTML = `
    <section class="squad-screen">
      <div class="row spread">
        <h2 class="screen-title">小队编成</h2>
        <small>已选 ${state.run.squadIds.length}/${CONFIG.maxSquadSize}</small>
      </div>

      <article class="panel panel-visual stage-panel" style="margin-bottom:12px;">
        <div class="row spread">
          <h3>下一场遭遇：节点 ${state.run.nodeIndex + 1} - ${node ? node.label : "未知"}</h3>
          ${renderStageBadge(node ? node.danger : null)}
        </div>
        <p class="muted">每次胜利后自动修复：存活特工恢复 +${state.run.mods.postBattleHeal} 生命。</p>
        <div class="chip-row">
          <span class="chip ${selectedOperation ? "operation-chip-selected" : "operation-chip-pending"}">
            ${selectedOperation ? `协议已锁定：${selectedOperation.title}` : "协议未锁定"}
          </span>
          <span class="chip ${deployDisabled ? "operation-chip-pending" : "operation-chip-ready"}">
            ${deployDisabled ? "部署条件未满足" : "可部署"}
          </span>
          ${threatLabels}
        </div>
        <div class="node-brief-grid">
          <article class="node-brief-item">
            <small>节点压力</small>
            <strong>${node ? getDangerLabel(node.danger) : "未知"}</strong>
          </article>
          <article class="node-brief-item">
            <small>协议状态</small>
            <strong>${selectedOperation ? "已选择" : "待选择"}</strong>
          </article>
          <article class="node-brief-item">
            <small>可部署战力</small>
            <strong>${deployedAliveCount}/${CONFIG.maxSquadSize}</strong>
          </article>
        </div>
        ${renderStageProgress(state.run.nodeIndex, state.run.nodeIndex)}
      </article>

      ${
        transitionDigest
          ? `
        <article class="panel panel-visual node-transition-panel" style="margin-bottom:12px;">
          <div class="row spread">
            <h3>节点衔接回执</h3>
            <span class="chip">来自节点 ${transitionDigest.fromNodeIndex} · ${transitionDigest.fromNodeLabel}</span>
          </div>
          <p>${transitionDigest.enemyName} 已清除，链路保持稳定并推进到下一节点。</p>
          <div class="chip-row">
            <span class="chip">终结动作：${transitionDigest.actionLabel}</span>
            <span class="chip">战后修复 ${transitionDigest.recoveredHp > 0 ? `+${transitionDigest.recoveredHp}` : "0"}</span>
            ${
              transitionDigest.rewardTitle
                ? `<span class="chip operation-chip-ready">已安装：${transitionDigest.rewardTitle}</span>`
                : '<span class="chip operation-chip-pending">待安装节点奖励</span>'
            }
          </div>
        </article>
      `
          : ""
      }

      ${
        bossTemplate
          ? `
        <article class="panel boss-dossier panel-visual" style="margin-bottom:12px;">
          <div class="row">
            ${renderEnemyPortrait({ id: bossTemplate.id })}
            <div>
              <h3>首领档案：${bossTemplate.name}</h3>
              <p class="muted">${bossTemplate.role}</p>
            </div>
          </div>
          <ul class="boss-dossier-list">
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
            const statusTags = formatAgentStatus(agent);
            const roleVisual = getRoleVisual(agent.role);

            return `
              <article class="card unit-card agent-card role-${agent.role.toLowerCase()} ${checked ? "selected" : ""} ${dead ? "dead" : ""}" style="--role-accent:${roleVisual.color};">
                <div class="unit-head">
                  ${renderAgentPortrait(agent)}
                  <div class="unit-head-copy">
                    <h3>${agent.name}</h3>
                    <p>${getRoleLabel(agent.role)}</p>
                    <span class="mini-badge" style="--badge-accent:${roleVisual.color}">${roleVisual.icon}</span>
                  </div>
                </div>
                <div class="stat-row">
                  <span class="stat-pill">生命 ${agent.hp}/${agent.hpMax}</span>
                  <span class="stat-pill">攻击 ${agent.atk}</span>
                  <span class="stat-pill">能量 ${agent.energy}</span>
                </div>
                ${renderHpBar(agent.hp, agent.hpMax, "ally")}
                ${renderEnergyCells(agent.energy)}
                ${
                  statusTags.length > 0
                    ? `<div class="chip-row">${statusTags.map((tag) => `<span class="chip">${tag}</span>`).join("")}</div>`
                    : '<div class="chip-row"><span class="chip">状态稳定</span></div>'
                }
                <p class="muted" style="margin-top:8px;">技能：${agent.skill.title}（消耗 ${skillCost} 能量）</p>
                <p class="muted">${agent.passive}</p>
                <label class="row deploy-switch" style="margin-top:10px;">
                  <input type="checkbox" data-agent-toggle="${agent.id}" ${checked} ${dead ? "disabled" : ""} />
                  <span>${dead ? "离线" : "部署到小队"}</span>
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
  const stagedSquad = getBattleSquadRoster();
  const actor = findSelectedActor();
  const enemy = state.battle.enemy;
  const activeNodeOperation = state.battle.nodeOperationId
    ? getNodeOperationById(state.battle.nodeOperationId)
    : null;

  const now = Date.now();
  const decisionLocked = isBattleDecisionLocked(state.battle, now);
  const decisionReady = Boolean(state.battle.decisionReadyUntil && state.battle.decisionReadyUntil > now);
  const actionLocked = Boolean(state.battle.pendingFinish || decisionLocked);
  const finishPhase = state.battle.finishPhase || "";
  const actionFlowClass = state.battle.pendingFinish
    ? "is-finishing"
    : decisionLocked
      ? "is-resolving"
      : decisionReady
        ? "is-ready"
        : "";
  const skillCost = actor ? getSkillCost(actor) : 0;
  const skillDisabled = actionLocked || !actor || actor.energy < skillCost;
  const burstDisabled = actionLocked || !actor || actor.energy < 3;
  const skillActionLabel = actor ? `${actor.skill.title}（-${skillCost} 能量）` : "技能";
  const isRecentAction = (type) =>
    Boolean(state.battle.lastActionType === type && state.battle.lastActionUntil > now);
  const recoveryPreview = getPostBattleRecoveryPreview();
  const flowHint = state.battle.pendingFinish
    ? finishPhase === "handoff"
      ? "战场回收完成，正在接入指令奖励..."
      : "目标崩解，正在确认节点控制权..."
    : decisionLocked
      ? "链路同步中..."
      : decisionReady
        ? "结算完成，可继续决策。"
        : "";
  const battleFinishTitle = finishPhase === "handoff" ? "节点清除完成" : "目标崩解";
  const battleFinishSubline =
    finishPhase === "handoff" ? "结算完成，正在解码可用指令。" : "敌方主链路已断开，正在回收战场残留。";
  const battleFinishAction =
    state.battle.lastResolution && state.battle.lastResolution.actionLabel
      ? state.battle.lastResolution.actionLabel
      : "常规行动";
  const intentTarget = getLikelyIntentTarget(enemy.intent.id);
  const intentForecast = getIntentForecast(enemy);
  const intentThreatKey = enemy.intent.threat || "medium";
  const intentThreatClass = `intent-${intentThreatKey}`;
  const threatDirective = getThreatDirective(intentThreatKey);
  const intentIcon = getIntentIcon(enemy.intent.id);
  const activeNodeOperationVisual = activeNodeOperation
    ? getNodeOperationVisual(activeNodeOperation.id)
    : null;
  const enemyVisual = getEnemyVisual(enemy.id);
  const turnPulseClass = hasBattleArenaEffect("turn-shift") ? "pulse" : "";
  const phasePulseClass = hasBattleArenaEffect("phase-shift") ? "pulse" : "";
  const phaseReadout = enemy.bossState ? `阶段 ${enemy.bossState.phase}/3` : "常规遭遇";

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
    <section class="battle-screen">
      <div class="row spread">
        <h2 class="screen-title">节点 ${state.run.nodeIndex + 1} - ${node ? node.label : "战斗"}</h2>
        <div class="battle-cycle-readout" aria-live="polite">
          <span class="battle-cycle-chip turn ${turnPulseClass}">回合 ${state.battle.turn}</span>
          <span class="battle-cycle-chip phase ${phasePulseClass}">${phaseReadout}</span>
          <span class="battle-cycle-chip threat threat-${intentThreatKey}">威胁 ${getThreatLabel(intentThreatKey)} · ${threatDirective}</span>
        </div>
      </div>
      ${renderStageProgress(state.run.nodeIndex, state.run.nodeIndex)}

      ${
        activeNodeOperation
          ? `
            <article class="panel panel-visual active-protocol">
              <div class="row">
                ${renderProtocolGlyph(activeNodeOperation.id)}
                <div>
                  <h3>生效协议：${activeNodeOperation.title}</h3>
                  <p class="muted">${activeNodeOperationVisual ? activeNodeOperationVisual.tone : "节点修正中"}</p>
                </div>
              </div>
            </article>
          `
          : ""
      }

      <article class="intent-card panel-visual intent-card-${enemy.intent.threat || "medium"}">
        <div class="row spread">
          <h3>敌方意图：${enemy.intent.label}</h3>
          <span class="intent-icon-badge">${intentIcon}</span>
        </div>
        <p>${enemy.intent.desc}</p>
        <p class="intent-callout">即将执行：<strong>${enemy.intent.label}</strong> → <strong>${intentTarget}</strong></p>
        <div class="chip-row">
          <span class="chip ${intentThreatClass}">威胁 ${getThreatLabel(intentThreatKey)} · ${threatDirective}</span>
          <span class="chip intent-target-chip">可能目标：${intentTarget}</span>
          <span class="chip intent-forecast-chip">效果预估：${intentForecast}</span>
          ${enemy.bossState ? `<span class="chip intent-phase-chip">主核阶段 ${enemy.bossState.phase}/3</span>` : ""}
        </div>
        ${renderIntentSequenceTrack(enemy, 4)}
      </article>

      ${renderBossBattleReadout(enemy)}
      ${renderBattleStage(
        stagedSquad,
        enemy,
        state.battle.selectedActorId,
        intentThreatKey,
        state.battle.turn,
        intentTarget
      )}

      <div class="card-grid battle-grid" style="margin-bottom:10px;">
        ${squad
          .map((agent) => {
            const selected = state.battle.selectedActorId === agent.id;
            const statusTags = formatAgentStatus(agent);
            const roleVisual = getRoleVisual(agent.role);
            const selectedControlChip = selected
              ? '<span class="chip actor-selected-chip">当前操控</span>'
              : "";

            return `
              <article class="card unit-card agent-card role-${agent.role.toLowerCase()} ${selected ? "selected" : ""}" style="--role-accent:${roleVisual.color};">
                <div class="unit-head">
                  ${renderAgentPortrait(agent)}
                  <div class="unit-head-copy">
                    <h3>${agent.name}</h3>
                    <p>${getRoleLabel(agent.role)}</p>
                    <span class="mini-badge" style="--badge-accent:${roleVisual.color}">${roleVisual.icon}</span>
                  </div>
                </div>
                <div class="stat-row">
                  <span class="stat-pill">生命 ${agent.hp}/${agent.hpMax}</span>
                  <span class="stat-pill">攻击 ${agent.atk}</span>
                  <span class="stat-pill">能量 ${agent.energy}</span>
                </div>
                ${renderHpBar(agent.hp, agent.hpMax, "ally")}
                ${renderEnergyCells(agent.energy)}
                ${statusTags.length > 0 ? `<div class="chip-row">${statusTags
                  .map((tag) => `<span class="chip">${tag}</span>`)
                  .join("")}</div>` : '<p class="muted" style="margin-top:8px;">当前无状态效果。</p>'}
                ${selectedControlChip ? `<div class="chip-row" style="margin-top:8px;">${selectedControlChip}</div>` : ""}
                <p class="muted" style="margin-top:8px;">${agent.skill.title}: ${agent.skill.desc}</p>
                <div class="row" style="margin-top:10px;">
                  <button class="btn actor-select-btn ${selected ? "is-selected" : ""}" data-action="select-actor" data-agent-id="${agent.id}" ${actionLocked ? "disabled" : ""}>${selected ? "操控中" : "切换操控"}</button>
                </div>
              </article>
            `;
          })
          .join("")}

        <article class="card enemy-card unit-card ${enemy.bossState ? "boss-unit-card" : ""}" style="--enemy-accent:${enemyVisual.color};">
          <div class="unit-head enemy-head">
            ${renderEnemyPortrait(enemy)}
            <div class="unit-head-copy">
              <h3>${enemy.name}</h3>
              <p>${enemy.role}</p>
            </div>
          </div>
          <div class="stat-row">
            <span class="stat-pill">生命 ${enemy.hp}/${enemy.hpMax}</span>
            <span class="stat-pill">攻击 ${enemy.atk}</span>
          </div>
          ${renderHpBar(enemy.hp, enemy.hpMax, "enemy")}
          ${enemyStatusTags.length > 0 ? `<div class="chip-row">${enemyStatusTags
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
          <div class="impact-grid">
            <div>
              <small class="muted">我方输出</small>
              ${renderImpactBar(state.battle.lastResolution.playerDamage, "ally")}
            </div>
            <div>
              <small class="muted">敌方压制</small>
              ${renderImpactBar(state.battle.lastResolution.enemyDamage, "enemy")}
            </div>
          </div>
          <div class="chip-row">
            <span class="chip ${`intent-${state.battle.lastResolution.intentThreat || "medium"}`}">
              敌方威胁 ${getThreatLabel(state.battle.lastResolution.intentThreat || "medium")}
            </span>
            <span class="chip">行动：${state.battle.lastResolution.actionLabel || "常规行动"}</span>
          </div>
          <p>${state.battle.lastResolution.player}</p>
          <p>${state.battle.lastResolution.enemy}</p>
        </article>
      `
          : ""
      }

      ${
        state.battle.pendingFinish
          ? `
        <article class="panel panel-visual battle-victory-bridge phase-${finishPhase || "collapse"}" style="margin-bottom:10px;">
          <div class="row spread">
            <h3>${battleFinishTitle}</h3>
            <span class="chip battle-finish-chip">${enemy.name}</span>
          </div>
          <p>${battleFinishSubline}</p>
          <div class="chip-row">
            <span class="chip">回合 ${state.battle.turn}</span>
            <span class="chip">终结动作：${battleFinishAction}</span>
            <span class="chip">终结伤害 ${state.battle.lastResolution ? state.battle.lastResolution.playerDamage : 0}</span>
            <span class="chip">${recoveryPreview > 0 ? `战后修复 +${recoveryPreview}` : "战后修复 0"}</span>
          </div>
        </article>
      `
          : ""
      }

      <div class="actions ${actionFlowClass}">
        <button class="btn primary action-btn attack ${isRecentAction("attack") ? "recent" : ""}" data-action="do-attack" ${actionLocked ? "disabled" : ""}>攻击（+1 能量）</button>
        <button class="btn action-btn guard ${isRecentAction("defend") ? "recent" : ""}" data-action="do-defend" ${actionLocked ? "disabled" : ""}>防御（+1 能量）</button>
        <button class="btn action-btn skill ${isRecentAction("skill") ? "recent" : ""}" data-action="do-skill" ${skillDisabled ? "disabled" : ""}>${skillActionLabel}</button>
        <button class="btn action-btn burst ${isRecentAction("burst") ? "recent" : ""}" data-action="do-burst" ${burstDisabled ? "disabled" : ""}>同步爆发（-3 能量）</button>
      </div>

      <p class="battle-controller-readout">当前操控：<strong>${actor ? actor.name : "无"}</strong></p>
      ${flowHint ? `<p class="battle-flow-hint ${actionFlowClass}">${flowHint}</p>` : ""}
      <h3 style="margin-top:14px;">指令栈</h3>
      ${renderDirectiveList()}
    </section>
  `;
}

function renderReward() {
  if (!state.run) {
    return;
  }
  const nextNode = NODE_PLAN[state.run.nodeIndex + 1] || null;
  const battleResult = state.lastBattleResult;

  screenRoot.innerHTML = `
    <section class="reward-screen">
      <article class="panel panel-visual reward-intro">
        <div class="row spread">
          <h2 class="screen-title">指令奖励</h2>
          <div class="row">
            <span class="chip">下一节点 ${state.run.nodeIndex + 2}/${state.run.maxNode}</span>
            ${renderStageBadge(nextNode ? nextNode.danger : null, "终局")}
          </div>
        </div>
        <p>进入下一节点前，选择并安装一项升级指令。候选指令将按序解码。</p>
        ${renderStageProgress(state.run.nodeIndex + 1, state.run.nodeIndex + 1)}
      </article>
      ${
        battleResult
          ? `
      <article class="panel panel-visual reward-bridge">
        <div class="row spread">
          <h3>战场回执</h3>
          <span class="chip">节点 ${battleResult.nodeIndex} · ${battleResult.nodeLabel}</span>
        </div>
        <p>${battleResult.enemyName} 已被清除，结算链路稳定。</p>
        <div class="chip-row">
          ${battleResult.actorName ? `<span class="chip">执行者 ${battleResult.actorName}</span>` : ""}
          <span class="chip">终结动作：${battleResult.actionLabel}</span>
          <span class="chip">终结伤害 ${battleResult.playerDamage}</span>
          <span class="chip">战后修复 ${battleResult.recoveredHp > 0 ? `+${battleResult.recoveredHp}` : "0"}</span>
        </div>
      </article>
      `
          : ""
      }
      <div class="reward-grid">
        ${
          state.pendingRewards.length === 0
            ? '<article class="panel panel-visual reward-empty"><p class="muted">当前没有可安装的奖励指令。</p></article>'
            : state.pendingRewards
                .map((reward, index) => {
                  const visual = getRewardVisual(reward.id);
                  return `
              <article class="card reward-card panel-visual reward-reveal-card" style="--reward-accent:${visual.color}; --reward-reveal-delay:${index * REWARD_REVEAL_STAGGER_MS}ms;">
                <div class="reward-head">
                  ${renderRewardGlyph(reward.id)}
                  <div>
                    <h3>${reward.title}</h3>
                    <p class="muted">${visual.tone}</p>
                  </div>
                </div>
                <p>${reward.desc}</p>
                <div class="chip-row">
                  <span class="chip">序列 ${index + 1}</span>
                  <span class="chip">${visual.badge}</span>
                  <span class="chip">${reward.persistent ? "可带入后续节点" : "即时生效"}</span>
                </div>
                <button class="btn primary" data-action="pick-reward" data-reward-id="${reward.id}">安装指令</button>
              </article>
            `;
                })
                .join("")
        }
      </div>
      <article class="panel panel-visual">
        <h3>当前指令栈</h3>
        ${renderDirectiveList()}
      </article>
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
  const survivorCount = state.run ? state.run.roster.filter((agent) => agent.hp > 0).length : 0;
  const totalAgents = state.run ? state.run.roster.length : CONFIG.maxSquadSize;
  const installedCount = state.run ? Object.keys(state.run.rewardTally).length : 0;
  const actionScore = Math.max(
    0,
    clearedNodes * 12 + survivorCount * 6 + installedCount * 4 + (isWin ? 20 : 0)
  );

  screenRoot.innerHTML = `
    <section class="run-end-screen">
      <article class="panel panel-visual end-hero ${isWin ? "success" : "failure"}">
        <div class="row spread">
          <h2 class="screen-title">${title}</h2>
          <span class="chip ${isWin ? "result-success" : "result-failure"}">${isWin ? "任务完成" : "任务中断"}</span>
        </div>
        <p>${subtitle}</p>
        <div class="end-stat-grid">
          <div class="end-stat-card">
            <small class="muted">已通关节点</small>
            <strong>${clearedNodes}/${state.run ? state.run.maxNode : NODE_PLAN.length}</strong>
          </div>
          <div class="end-stat-card">
            <small class="muted">存活特工</small>
            <strong>${survivorCount}/${totalAgents}</strong>
          </div>
          <div class="end-stat-card">
            <small class="muted">战术评分</small>
            <strong>${actionScore}</strong>
          </div>
        </div>
      </article>

      <article class="panel panel-visual">
        <h3>已安装指令</h3>
        <ul>${directives}</ul>
      </article>

      <div class="row" style="margin-top:4px;">
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
      const nextActorId = button.dataset.agentId;
      if (!nextActorId || state.battle.selectedActorId === nextActorId) {
        return;
      }
      state.battle.selectedActorId = nextActorId;
      addBattleUnitEffect("ally", nextActorId, "status");
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
