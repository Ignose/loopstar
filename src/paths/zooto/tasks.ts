import { eat, myAdventures, myLevel } from "kolmafia";
import { Quest } from "../../engine/task";
import { $item } from "libram";


export const ZootoQuest: Quest = {
  name: "Zooto",
  tasks: [
    {
      name: "Diet",
      ready: () => true,
      completed: () => myAdventures() >= 7,
      do: () => {
        eat(1, $item`Deep Dish of Legend`);
      },
      limit: { tries: 50 },
      freeaction: true,
      withnoadventures: true,
    },
    {
      name: "Level-Up",
      ready: () => myLevel() < 13,
      completed: () => myLevel() >= 13,
      do: () => {
        eat(1, $item`Deep Dish of Legend`);
      },
      limit: { tries: 50 },
      freeaction: true,
      withnoadventures: true,
    },
  ],
};