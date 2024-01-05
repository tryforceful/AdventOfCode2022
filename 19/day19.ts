const SAMPLE = false;

import assert from 'assert';
import * as fs from 'fs';

const data: string = fs.readFileSync(
  SAMPLE ? './input_sample.txt' : './input.txt',
  'utf8',
);

const input: string[] = data.split('\n').slice(0, -1);

type n = number;
type itemlist = [ore: n, clay: n, obsidian: n, geodes: n];
type botlist = [ore_bots: n, clay_bots: n, obsidian_bots: n, geode_bots: n];
type State = [...botlist, ...itemlist, seconds_left: n];

const rex =
  /Blueprint \d+: Each ore robot costs (\d+) ore\. Each clay robot costs (\d+) ore\. Each obsidian robot costs (\d+) ore and (\d+) clay\. Each geode robot costs (\d+) ore and (\d+) obsidian\./;

const blueprints = input.map(line => {
  const [a, b, c, d, e, f] = rex.exec(line)?.slice(1).map(Number) ?? [];

  return [
    [a, 0, 0, 0] as itemlist,
    [b, 0, 0, 0] as itemlist,
    [c, d, 0, 0] as itemlist,
    [e, 0, f, 0] as itemlist,
  ];
});

function solve(part2 = false) {
  console.time(part2 ? 'part 2' : 'part 1');

  const SECONDS = part2 ? 32 : 24;

  function runBlueprint(blueprint: itemlist[]) {
    let max_bots_required: botlist = blueprint.reduce(
      (a, b) => a.map((item, idx) => Math.max(item, b[idx])) as botlist,
    );
    max_bots_required[3] = Infinity;

    const start_state: State = [1, 0, 0, 0, 0, 0, 0, 0, SECONDS];

    const DFS_stack: State[] = [start_state];

    let maxGeodes = 0;

    while (DFS_stack.length) {
      const state = DFS_stack.pop()!;
      const secs = state[8];

      if (secs === 0) {
        // end of time

        if (state[7] > maxGeodes) {
          maxGeodes = state[7];
        }
        continue;
      }

      // Short circuit magic!
      // Even if we bought a new Geode robot on every second from now until the end,
      //   if the result would be less than the max known # of geodes possible,
      //   don't walk this path any further. We can't possibly get a higher solution from this path.
      if (state[7] + state[3] * secs + (secs * (secs + 1)) / 2 < maxGeodes)
        continue;

      const end_state_minus_1 = stepState(state, Math.max(state[8] - 1, 0));
      const end_state = stepState(end_state_minus_1);
      // consider if we just run down the clock right here and now
      DFS_stack.push(end_state);

      // see which bots we can make next
      for (const i of [0, 1, 2, 3]) {
        if (
          state[i] < max_bots_required[i] &&
          blueprint[i].every((cost, idx) => end_state_minus_1[idx + 4] >= cost)
        ) {
          let newState: State = [...state];

          while (!blueprint[i].every((cost, idx) => newState[idx + 4] >= cost))
            newState = stepState(newState);

          // buy it and push the state once
          newState = stepState(newState);
          for (const j of [0, 1, 2, 3]) {
            // pay cost
            newState[j + 4] -= blueprint[i][j];
          }
          newState[i]++; // new bot
          DFS_stack.push(newState);
        }
      }
    }

    return maxGeodes;
  }

  let counter = 1,
    answer = part2 ? 1 : 0;
  for (const blueprint of blueprints.slice(0, part2 ? 3 : undefined)) {
    const res = runBlueprint(blueprint);
    if (part2) answer *= res;
    else answer += res * counter++;
  }

  console.log({ answer });

  console.timeEnd(part2 ? 'part 2' : 'part 1');

  return answer;

  function stepState(
    [rr, cr, or, gr, r, c, o, g, secs]: State,
    num_secs = 1,
  ): State {
    const num_steps = Math.min(num_secs, secs);
    return [
      rr,
      cr,
      or,
      gr,
      r + rr * num_steps,
      c + cr * num_steps,
      o + or * num_steps,
      g + gr * num_steps,
      secs - num_steps,
    ];
  }
}

assert(solve() === 960);

assert(solve(true) === 2040);
