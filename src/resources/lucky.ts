import { cliExecute, itemAmount, use, useSkill } from "kolmafia";
import { $item, $skill, AugustScepter, get, have } from "libram";

type LuckySource = {
  name: string;
  do: () => void;
  remaining: () => number;
};

export const luckySources: LuckySource[] = [
  {
    name: "11-leaf clover",
    do: () => use($item`11-leaf clover`),
    remaining: () => itemAmount($item`11-leaf clover`),
  },
  {
    name: "August Scepter",
    do: () => useSkill($skill`Aug. 2nd: Find an Eleven-Leaf Clover Day`),
    remaining: () => (AugustScepter.canCast(2) ? 1 : 0),
  },
  {
    name: "Pillkeeper",
    do: () => cliExecute("pillkeeper lucky"),
    remaining: () =>
      have($item`Eight Days a Week Pill Keeper`) && !get("_freePillKeeperUsed") ? 1 : 0,
  },
];
