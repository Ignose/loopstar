import { getProperty, myFamiliar, visitUrl, refreshStatus, Familiar, myLevel, useFamiliar, toFamiliar } from "kolmafia";
import { $familiar, $skill, have } from "libram";

export enum ZooPart {
  NONE = 0,
  HEAD = 1,
  L_SHOULDER,
  R_SHOULDER,
  L_HAND,
  R_HAND,
  R_NIPPLE,
  L_NIPPLE,
  L_BUTTOCK,
  R_BUTTOCK,
  L_FOOT,
  R_FOOT,
}


// enums for body parts
export class Zootomist {
  // ------------------------
  // Check if we are in the Zootomist path
  // ------------------------
  static inZootomist(): boolean {
    // replace with your path check if needed
    return true; // stub: always true
  }

  // ------------------------
  // Specimen preparation
  // ------------------------
  static specimenPreparationsLeft(): number {
    if (!this.inZootomist()) return 0;
    const allowed = Math.min(11, parseInt(getProperty("zootomistPoints")) + 1);
    return allowed - parseInt(getProperty("zooSpecimensPrepared"));
  }

  static prepareSpecimen(): boolean {
    const f = myFamiliar();
    if (!this.inZootomist() || this.specimenPreparationsLeft() <= 0) return false;

    visitUrl("place.php?whichplace=graftinglab&action=graftinglab_prep");
    visitUrl("choice.php?pwd=&whichchoice=1555&option=1", true);
    refreshStatus();

    // stub: log XP/weight changes
    const newExp = f.experience;
    const newWeight = 0; // numericModifier("familiar weight") can be used if available
    console.info(`Specimen prepared: ${f.name}, XP=${newExp}, Weight=${newWeight}`);
    return true;
  }

  // ------------------------
  // Grafted Familiars
  // ------------------------
  static graftedToPart(part: ZooPart): Familiar {
    const mapping: Record<ZooPart, string> = {
      [ZooPart.NONE]: "0",
      [ZooPart.HEAD]: "zootGraftedHeadFamiliar",
      [ZooPart.L_SHOULDER]: "zootGraftedShoulderLeftFamiliar",
      [ZooPart.R_SHOULDER]: "zootGraftedShoulderRightFamiliar",
      [ZooPart.L_HAND]: "zootGraftedHandLeftFamiliar",
      [ZooPart.R_HAND]: "zootGraftedHandRightFamiliar",
      [ZooPart.R_NIPPLE]: "zootGraftedNippleRightFamiliar",
      [ZooPart.L_NIPPLE]: "zootGraftedNippleLeftFamiliar",
      [ZooPart.L_BUTTOCK]: "zootGraftedButtCheekLeftFamiliar",
      [ZooPart.R_BUTTOCK]: "zootGraftedButtCheekRightFamiliar",
      [ZooPart.L_FOOT]: "zootGraftedFootLeftFamiliar",
      [ZooPart.R_FOOT]: "zootGraftedFootRightFamiliar",
    };
    const famId = parseInt(getProperty(mapping[part] || "0"));
    if (famId === 0) return Familiar.none; // no graft
    return toFamiliar(famId);
  }

  static graftedFams(): Familiar[] {
    return Array.from({ length: 11 }, (_, i) => this.graftedToPart(i + 1));
  }

  static isGrafted(fam: Familiar): boolean {
    if (!fam) return false;
    return this.graftedFams().some(f => f.id === fam.id);
  }

  // ------------------------
  // Body part selection
  // ------------------------
  static getBodyPartPriority(): ZooPart[] {
    // Example: prioritize left/right nipples, then left foot, then others
    return [
      ZooPart.L_NIPPLE,
      ZooPart.R_NIPPLE,
      ZooPart.L_FOOT,
      ZooPart.HEAD,
      ZooPart.L_HAND,
      ZooPart.L_SHOULDER,
      ZooPart.R_SHOULDER,
      ZooPart.L_BUTTOCK,
      ZooPart.R_BUTTOCK,
      ZooPart.R_HAND,
      ZooPart.R_FOOT,
    ];
  }

  static getNextPart(): ZooPart {
    if (!this.inZootomist() || myLevel() > 11) return ZooPart.NONE;
    for (const part of this.getBodyPartPriority()) {
      if (this.graftedToPart(part).id === 0) return part;
    }
    return ZooPart.NONE;
  }

  // ------------------------
  // Select best familiar for a body part
  // ------------------------
  static getBestFam(part: ZooPart): Familiar {
    const fams = this.graftedFams();
    const nextFam = fams.find(f => f.id === 0);
    return nextFam || myFamiliar();
  }

  static getNextFam(): Familiar {
    const nextPart = this.getNextPart();
    if (nextPart === ZooPart.NONE) return Familiar.none;
    return this.getBestFam(nextPart);
  }

  // ------------------------
  // Graft a familiar
  // ------------------------
  static graftFam(): boolean {
    const nextPart = this.getNextPart();
    if (nextPart === ZooPart.NONE) return false;

    const fam = this.getBestFam(nextPart);
    useFamiliar(fam);
    visitUrl("place.php?whichplace=graftinglab&action=graftinglab_chamber");
    visitUrl(
      `choice.php?pwd=&whichchoice=1553&option=1&slot=${nextPart}&fam=${fam.id}`
    );
    refreshStatus();
    console.info(`Grafted ${fam.name} to ${ZooPart[nextPart]}`);
    return true;
  }

  // ------------------------
  // Familiar Weight Boosting
  // ------------------------
  static nextGraftWeight(): number {
    return Math.min(myLevel() + 2, 13);
  }

  static boostWeight(fam: Familiar, targetWeight: number = this.nextGraftWeight()): boolean {
    if (myFamiliar().id !== fam.id) useFamiliar(fam);
    // stub: simulate weight boost logic
    console.info(`Boosting ${fam.name} to target weight ${targetWeight}`);
    return true;
  }

  // ------------------------
  // Kick Skill Checks
  // ------------------------
  static leftKickHasSniff(): boolean {
    const fam = this.graftedToPart(ZooPart.L_FOOT);
    if (fam.id === 0) return false;

    const attrs = fam.attributes.split(";").map(a => a.trim());
    const sniffAttrs = ["animal", "haseyes", "hot", "humanoid", "mineral", "orb", "sentient", "software"];
    return attrs.some(a => sniffAttrs.includes(a));
  }

  static rightKickHasSniff(): boolean {
    const fam = this.graftedToPart(ZooPart.R_FOOT);
    if (fam.id === 0) return false;

    const attrs = fam.attributes.split(";").map(a => a.trim());
    const sniffAttrs = ["animal", "haseyes", "hot", "humanoid", "mineral", "orb", "sentient", "software"];
    return attrs.some(a => sniffAttrs.includes(a));
  }

  static leftKickHasPickpocket(): boolean {
    const fam = this.graftedToPart(ZooPart.L_FOOT);
    if (fam.id === 0) return false;

    const attrs = fam.attributes.split(";").map(a => a.trim());
    const pickpocketAttrs = ["hasbeak", "hasclaws", "hashands", "isclothes", "polygonal", "sleaze", "technological", "wearsclothes"];
    return attrs.some(a => pickpocketAttrs.includes(a));
  }

  static rightKickHasPickpocket(): boolean {
    const fam = this.graftedToPart(ZooPart.R_FOOT);
    if (fam.id === 0) return false;

    const attrs = fam.attributes.split(";").map(a => a.trim());
    const pickpocketAttrs = ["hasbeak", "hasclaws", "hashands", "isclothes", "polygonal", "sleaze", "technological", "wearsclothes"];
    return attrs.some(a => pickpocketAttrs.includes(a));
  }

  static leftKickHasInstaKill(): boolean {
    const fam = this.graftedToPart(ZooPart.L_FOOT);
    if (fam.id === 0) return false;

    const attrs = fam.attributes.split(";").map(a => a.trim());
    const instaAttrs = ["bite", "cute", "evil", "food", "hasstinger", "object", "reallyevil", "stench"];
    return attrs.some(a => instaAttrs.includes(a));
  }

  static rightKickHasInstaKill(): boolean {
    const fam = this.graftedToPart(ZooPart.R_FOOT);
    if (fam.id === 0) return false;

    const attrs = fam.attributes.split(";").map(a => a.trim());
    const instaAttrs = ["bite", "cute", "evil", "food", "hasstinger", "object", "reallyevil", "stench"];
    return attrs.some(a => instaAttrs.includes(a));
  }

  // ------------------------
  // Skill getters (stubs)
  // ------------------------
  static getZooKickYR(): any { return $skill`none`; }
  static getZooKickFreeKill(): any { return $skill`none`; }
  static getZooKickSniff(): any { return $skill`none`; }
  static getZooKickBanish(): any { return $skill`none`; }
  static getZooKickPickpocket(): any { return $skill`none`; }
  static getZooKickInstaKill(): any { return $skill`none`; }
  static getZooBestPunch(): any { return $skill`none`; }
}

type FamScoreMap = Map<Familiar, number>;

type ScoredFamiliars = {
  intrinsic: FamScoreMap;
  leftBuff: FamScoreMap;
  rightBuff: FamScoreMap;
  kick: FamScoreMap;
};

const intrinsicWeights: Record<string, number> = {
  stench: 2,
  spooky: 2,
  hot: 2,
  sleaze: 2,
  cold: 2,
  sentient: 2,
};

const lNipWeights: Record<string, number> = {
  spooky: 1,
  cold: 1,
};

const rNipWeights: Record<string, number> = {
  hot: 1,
  sleaze: 1,
};

const footWeights: Record<string, number> = {
  animal: 1,
  haseyes: 1,
  hot: 1,
  humanoid: 1,
  mineral: 1,
  orb: 1,
  sentient: 1,
  software: 1,

  hasbeak: 1,
  hasclaws: 1,
  hashands: 1,
  isclothes: 1,
  polygonal: 1,
  sleaze: 1,
  technological: 1,
  wearsclothes: 1,

  bite: 1,
  cute: 1,
  evil: 1,
  food: 1,
  hasstinger: 1,
  object: 1,
  reallyevil: 1,
  stench: 1,
};

function famAttributes(fam: Familiar): string[] {
  if (!fam.attributes) return [];
  return fam.attributes.split(";").map(a => a.trim());
}

function weightedScore(attrs: string[], weights: Record<string, number>): number {
  let score = 0;
  for (const attr of attrs) {
    score += weights[attr] ?? 0;
  }
  return score;
}

const BLACKLIST = new Set<Familiar>([
  $familiar`Reassembled Blackbird`,
  $familiar`Reconstituted Crow`,
  $familiar`Homemade Robot`,
]);

export function scoreFamiliars(): ScoredFamiliars {
  const intrinsic = new Map<Familiar, number>();
  const leftBuff = new Map<Familiar, number>();
  const rightBuff = new Map<Familiar, number>();
  const kick = new Map<Familiar, number>();

  for (const fam of Familiar.all().filter((f) => have(f))) {
    if (!have(fam)) continue;
    if (BLACKLIST.has(fam)) continue;

    const attrs = famAttributes(fam);
    if (attrs.length === 0) continue;

    const intrinsicScore = weightedScore(attrs, intrinsicWeights);
    const leftScore = weightedScore(attrs, lNipWeights);
    const rightScore = weightedScore(attrs, rNipWeights);
    const kickScore = weightedScore(attrs, footWeights);

    if (intrinsicScore > 0) intrinsic.set(fam, intrinsicScore);
    if (leftScore > 0) leftBuff.set(fam, leftScore);
    if (rightScore > 0) rightBuff.set(fam, rightScore);
    if (kickScore > 0) kick.set(fam, kickScore);
  }

  return { intrinsic, leftBuff, rightBuff, kick };
}

function pickBest(
  scores: Map<Familiar, number>,
  used: Set<Familiar>
): Familiar | null {
  let best: Familiar | null = null;
  let bestScore = -Infinity;

  for (const [fam, score] of scores) {
    if (used.has(fam)) continue;
    if (score > bestScore) {
      best = fam;
      bestScore = score;
    }
  }

  return best;
}

function markExistingGrafts(used: Set<Familiar>) {
  for (const part of Object.values(ZooPart)) {
    const fam = Zootomist.graftedToPart(part as ZooPart);
    if (fam.id !== 0) {
      used.add(fam);
    }
  }
}

const LEFT_FOOT_PRIORITY = [
  $familiar`Quantum Entangler`,
  $familiar`Foul Ball`,
  $familiar`Defective Childrens' Stapler`,
];

const RIGHT_FOOT_BANISH = [
  $familiar`Dire Cassava`,
  $familiar`Phantom Limb`,
  $familiar`MagiMechTech MicroMechaMech`,
];

const PUNCH_PRIORITY = [
  $familiar`Baby Bugged Bugbear`,
  $familiar`Burly Bodyguard`,
];

type GraftPlan = Partial<Record<ZooPart, Familiar>>;

export function assignGraftPlan(): GraftPlan {
  const { intrinsic, leftBuff, rightBuff, kick } = scoreFamiliars();

  const plan: GraftPlan = {};
  const used = new Set<Familiar>();

  // Respect existing grafts
  markExistingGrafts(used);

  // --- Left Nipple ---
  const leftNip = pickBest(leftBuff, used);
  if (leftNip) {
    plan[ZooPart.L_NIPPLE] = leftNip;
    used.add(leftNip);
  }

  // --- Right Nipple ---
  const rightNip = pickBest(rightBuff, used);
  if (rightNip) {
    plan[ZooPart.R_NIPPLE] = rightNip;
    used.add(rightNip);
  }

  // --- Left Foot (hardcoded first) ---
  for (const fam of LEFT_FOOT_PRIORITY) {
    if (!used.has(fam) && have(fam)) {
      plan[ZooPart.L_FOOT] = fam;
      used.add(fam);
      break;
    }
  }

  if (!plan[ZooPart.L_FOOT]) {
    const lf = pickBest(kick, used);
    if (lf) {
      plan[ZooPart.L_FOOT] = lf;
      used.add(lf);
    }
  }

  // --- Intrinsics (up to 5 total) ---
  let intrinsicSlots = 5;

  for (const fam of used) {
    if (intrinsic.has(fam)) intrinsicSlots--;
  }

  while (intrinsicSlots > 0) {
    const fam = pickBest(intrinsic, used);
    if (!fam) break;

    const slot = nextFreeIntrinsicSlot(plan);
    if (!slot) break;

    plan[slot] = fam;
    used.add(fam);
    intrinsicSlots--;
  }

  // --- Right Foot (banish override) ---
  for (const fam of RIGHT_FOOT_BANISH) {
    if (!used.has(fam) && have(fam)) {
      plan[ZooPart.R_FOOT] = fam;
      used.add(fam);
      break;
    }
  }

  if (!plan[ZooPart.R_FOOT]) {
    const rf = pickBest(kick, used);
    if (rf) {
      plan[ZooPart.R_FOOT] = rf;
      used.add(rf);
    }
  }

  // --- Punch Hands ---
  for (const fam of PUNCH_PRIORITY) {
    if (!used.has(fam) && have(fam)) {
      if (!plan[ZooPart.L_HAND]) {
        plan[ZooPart.L_HAND] = fam;
      } else if (!plan[ZooPart.R_HAND]) {
        plan[ZooPart.R_HAND] = fam;
      }
      used.add(fam);
      break;
    }
  }

  return plan;
}

const INTRINSIC_SLOTS: ZooPart[] = [
  ZooPart.HEAD,
  ZooPart.L_SHOULDER,
  ZooPart.R_SHOULDER,
  ZooPart.L_BUTTOCK,
  ZooPart.R_BUTTOCK,
];

function nextFreeIntrinsicSlot(plan: GraftPlan): ZooPart | null {
  for (const slot of INTRINSIC_SLOTS) {
    if (!plan[slot]) return slot;
  }
  return null;
}

export function bestFamForPart(part: ZooPart): Familiar {
  const plan = assignGraftPlan();
  return plan[part] ?? Familiar.none;
}
