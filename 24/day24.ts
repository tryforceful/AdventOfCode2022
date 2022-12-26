/**
 * IMPORT DATA
 */

import { Heap } from 'mnemonist'

const SAMPLE = false;

import * as fs from "fs";

const data = fs
  .readFileSync(SAMPLE ? "./input_sample.txt" : "./input.txt", "utf8")
  .split("\n")
  .slice(0, -1)
  .map((row) => row.split(""));

const HEIGHT = data.length,
  WIDTH = data[0].length;
  console.log(HEIGHT, WIDTH)

const timeline = [data] as (string | BRACKET[])[][][];

function printTimeline(_timeline = timeline) {
  fs.writeFileSync("map.txt", '')
  let min = 0;
  for (const minute of _timeline) {
    const map = minute.map((x) =>
      x.map(item => typeof item === 'string' ? item : item?.length).join("")
    ).join("\n") + `\n - Minute ${min++}\n\n`;
    if (SAMPLE) console.log(map);
    fs.appendFileSync("map.txt", map);
  }
}

const motions = {
  ">": [0, 1],
  v: [1, 0],
  "<": [0, -1],
  "^": [-1, 0],
} as const;
type BRACKET = keyof typeof motions;

function nextMinuteBlizzards() {
  const next = timeline[timeline.length-1].map(row => [...row]); // make copy

  //record next steps of each blizzard
  const next_pos: {[x:string]: Array<BRACKET>} = {}
  for(let i = 1; i < HEIGHT-1; i++)
    for(let j = 1; j < WIDTH-1; j++) {
      const tile = next[i][j]
      const tile_array = typeof tile === 'string' ? [tile] : tile;
      for (const item of tile_array)
        if (item in motions) {
          const [dx, dy] = motions[item] as [number, number];
          const nextx = (i + dx || HEIGHT - 2) % (HEIGHT - 1) || 1;
          const nexty = (j + dy || WIDTH - 2) % (WIDTH - 1) || 1;
          // swap idx 0s with HEIGHT-1/WIDTH-1 and vice versa

          const nextpos_str = `${nextx},${nexty}`;
          next_pos[nextpos_str] = [
            ...(next_pos[nextpos_str] || []),
            item as BRACKET,
          ];
        }
    }

  // Now replace with new values
  for(let i = 1; i < HEIGHT-1; i++)
    for(let j = 1; j < WIDTH-1; j++) {
      const hasNextPos = next_pos[`${i},${j}`];
      if(hasNextPos) {
        next[i][j] =
          hasNextPos.length > 1 ? hasNextPos : hasNextPos[0];
      }
      else next[i][j] = '.'
    }

  timeline.push(next);
}

// Now work on A* search / heuristics

type TMinute = number;
type TX = number;
type TY = number;

function crossBlizzardsLeg(start: [TX, TY], end: [TX, TY], starting_minute: TMinute = 0) {

  function h ([node_x, node_y]: [TX, TY] | number[], minute: TMinute) {
    return (minute) * -(HEIGHT*WIDTH*1000) + // timing is weighed heavily
    Math.abs(node_x - end[0]) + Math.abs(node_y - end[1]);
  }

  const numsort = (a: number, b: number) => (a < b ? 1 : a > b ? -1 : 0);

  function compareHeap (a: [TX, TY, TMinute], b: [TX, TY, TMinute]) {
    return numsort(
      fScore[a.join()] ?? Infinity,
      fScore[b.join()] ?? Infinity
    );
  };

  const openHeap = Heap.from([[...start, starting_minute]], compareHeap);

  const start_record = [...start, starting_minute].join();

  const gScore = { [start_record]: 0 };
  const fScore = { [start_record]: h(start, starting_minute) };

  while (openHeap.size) {
    // console.dir(openHeap);

    // takes the best out of the heap
    const popped = openHeap.pop();
    if(!popped) throw 'Ran out of items'
    const [x,y,minute] = popped;

    if (x === end[0] && y === end[1]) {
      // We finished. We don't care about the path taken, just the # of mins taken.
      console.log("Ending minute", minute);
      return minute;
    }

    // make sure we have info on the next minute(s) of blizzards
    while (!timeline[minute+1]) nextMinuteBlizzards()

    for (const [dx, dy] of [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
      [0, 0],
    ]) {
      //each cardinal direction + same space
      const [nx, ny] = [x + dx, y + dy];

      if (
        nx < 0 || nx >= HEIGHT ||
        ny < 0 || ny >= WIDTH ||
        timeline[minute+1][nx][ny] !== '.'
      )
        continue;

      const current_key = [x, y, minute].join();
      const neighbor_key = [nx, ny, minute + 1].join();

      const tentative_gscore =
        gScore[current_key] + (dx === 0 && dy === 0 ? 0 : 1);

      if (tentative_gscore < (gScore[neighbor_key] ?? Infinity)) {

        gScore[neighbor_key] = tentative_gscore;
        fScore[neighbor_key] = tentative_gscore + h([nx,ny], minute+1);

        openHeap.push([nx,ny,minute+1]);
      }
    }
  }

  return Infinity
}

const start: [TX, TY] = [0, 1];
const goal: [TX, TY] = [HEIGHT - 1, WIDTH - 2];

const leg1 = crossBlizzardsLeg(start, goal, 0);
const leg2 = crossBlizzardsLeg(goal, start, leg1);
const leg3 = crossBlizzardsLeg(start, goal, leg2);

printTimeline();
