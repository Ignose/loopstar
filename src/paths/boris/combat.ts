import { ActionDefaults } from "grimoire-kolmafia";
import { haveEquipped, Location, Monster } from "kolmafia";
import { $effect, $item, $skill, get, have, Macro } from "libram";
import { CombatActions } from "../../engine/combat";

export class BorisActionDefaults implements ActionDefaults<CombatActions> {
  ignore(target?: Monster | Location) {
    return this.kill(target);
  }

  ignoreSoftBanish(target?: Monster | Location) {
    return this.kill(target);
  }

  kill(target?: Monster | Location) {
    return borisKillMacro(target, "any");
  }

  killHard(target?: Monster | Location) {
    return borisKillMacro(target, "train");
  }

  ignoreNoBanish(target?: Monster | Location) {
    return this.kill(target);
  }

  killFree() {
    return this.abort();
  } // Abort if no resource provided

  banish(target?: Monster | Location) {
    return this.kill(target);
  }

  killBanish(target: Monster | Location | undefined) {
    return this.kill(target);
  }

  abort() {
    return new Macro().abort();
  }

  killItem(target?: Monster | Location) {
    return this.kill(target);
  }

  yellowRay(target?: Monster | Location) {
    return this.killItem(target);
  }

  forceItems(target?: Monster | Location) {
    return this.killItem(target);
  }
}

export function borisKillMacro(
  target: Monster | Location | undefined,
  darts: "train" | "skip" | "any"
): Macro {
  const result = new Macro();
  if (haveEquipped($item`Everfull Dart Holster`)) {
    if (darts === "any" && !have($effect`Everything Looks Red`)) {
      result
        .trySkill($skill`Darts: Aim for the Bullseye`)
        .trySkill($skill`Darts: Aim for the Bullseye`)
        .trySkill($skill`Darts: Aim for the Bullseye`)
        .trySkill($skill`Darts: Aim for the Bullseye`)
        .trySkill($skill`Darts: Aim for the Bullseye`);
    } else if (darts === "train") {
      result.trySkill($skill`Darts: Throw at %part1`);
    } else if (darts === "any") {
      result.trySkill($skill`Darts: Throw at %part1`);
      for (let i = 0; i < get("_dartsLeft"); i++) result.trySkill($skill`Darts: Throw at %part1`);
    }
  }

  return result
    .trySkill($skill`Intimidating Bellow`)
    .skill($skill`Mighty Axing`)
    .repeat();
}
