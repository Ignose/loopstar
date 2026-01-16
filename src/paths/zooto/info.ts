import { $path, set } from "libram";
import { PathInfo } from "../pathinfo";
import { findAndMerge, Task } from "../../engine/task";
import { Engine } from "../../engine/engine";
import { myPath, runChoice, visitUrl } from "kolmafia";
import { getTasks, step } from "grimoire-kolmafia";
import { Requirement } from "../../sim";
import { args } from "../../args";

export class ZootoInfo implements PathInfo {
  name(): string {
    return "Z is for Zootomist";
  }

  active(): boolean {
    return myPath() === $path`Z is for Zootomist`;
  }

  finished(): boolean {
    return step("questL13Final") > 11;
  }

  getTasks(tasks: Task[]): Task[] {
    const newTasks = getTasks([ZootoQuest], false, false);
    return findAndMerge([...newTasks, ...tasks], zootoDeltas);
  }

  getRoute(route: string[]): string[] {
    return route;
  }

  getEngine(tasks: Task[]): Engine {
    return new Engine(tasks);
  }

  runIntro() {
    // Clear intro adventure
    set("choiceAdventure1507", 1);
    if (visitUrl("main.php").includes("dense, trackless jungle")) runChoice(-1);
  }

  getRequirements(reqs: Requirement[]): Requirement[] {
    return [
      ...reqs,
    ];
  }

  args(): string | undefined {
    return args.smol.smolargs;
  }
}
