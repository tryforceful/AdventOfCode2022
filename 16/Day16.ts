/**
 * IMPORT DATA
 */

import { Queue } from 'mnemonist'

import * as fs from "fs";

const PART_ONE = true;

const data: string = fs.readFileSync("./day16.txt", "utf8");

const input: string[] = data.split("\n").slice(0, -1);

const rex = /Valve | has flow rate=|; tunnels? leads? to valves? /g

type ValveInfo = {
      index: number;
      flowrate: number;
      paths: string[];
    }

const valvearr = input.map((line, index) => {
  const [,valve,flowrate,paths] = line.split(rex)

  return [valve, {index, flowrate: Number(flowrate), paths: paths.split(', ')}]
}) as [string, ValveInfo][];
const valve_names = valvearr.map((x) => x[0]);

const LENGTH = valvearr.length;

const valveobj = Object.fromEntries(valvearr);

const nonzero_valves = valvearr.filter(([, info]) => info.flowrate > 0)
const nonzero_valve_idxes = nonzero_valves.map(x => x[1].index)

// console.log(valveobj);


// Make Adjacency Matrix
const matrix: number[][] = new Array(LENGTH)
  .fill("")
  .map(() => new Array(LENGTH).fill(Infinity));

for (const [, info] of valvearr) {
  matrix[info.index][info.index] = 0;
  for (const neighbor of info.paths)
    // mark all real edges as having weight 1
    matrix[info.index][valveobj[neighbor].index] = 1;
}

// Floyd Warshall attempt
for(let k = 0; k < LENGTH; k++)
  for(let i = 0; i < LENGTH; i++)
    for(let j = 0; j < LENGTH; j++)
      if(matrix[i][j] > matrix[i][k] + matrix[k][j])
        matrix[i][j] = matrix[i][k] + matrix[k][j]

function printMatrix() {
  console.log(matrix.map(row=>row.join()).join('\n'));
}
// printMatrix()

// console.dir(nonzero_valve_idxes);

// Now we can try to traverse the graph knowing the min paths for each i,j vertex combo

const MAX_MINS = PART_ONE ? 30 : 26;

const START_STATE = {
    opened: [] as number[],
    closed: new Set(nonzero_valve_idxes),
    total_minutes: 0,
    total_flow: 0,
  }

const sum = (a:number,c:number) => a+c

const BFS = Queue.from([START_STATE]);

let MOST_FLOW = 0;

function traverse() {
  while(BFS.size) {
    const node = BFS.dequeue()
    if(!node) throw 'Uh oh'
    const {opened, closed, total_minutes, total_flow} = node;

    // if (
    //   ["3", "3,1", "3,1,9", "3,1,9,7", "3,1,9,7,4", "3,1,9,7,4,2"].includes(
    //     node.opened.join()
    //   )
    // )
    //   console.dir(node);

    function runDownClock() {
      const new_total_flow = total_flow + opened.map(
          opened_valve_idx => valveobj[valve_names[opened_valve_idx]].flowrate * (MAX_MINS - total_minutes)
        ).reduce(sum, 0)

      if(new_total_flow > MOST_FLOW) {
        MOST_FLOW = new_total_flow;
        // console.log("Max flow was now found to be", MOST_FLOW);
      }
    }

    if(!closed.size) {
      // No more to traverse! Just run down the clock and report the final flow
      runDownClock();
      continue;
    }

    for (const nextvalve of [...closed]) {
      // calculate the move to this next valve
      // according to matrix, it costs this much (+1 to open valve)
      const dt = matrix[opened[opened.length-1] || 0][nextvalve] + 1;

      const new_total_minutes = total_minutes + dt;

      if(new_total_minutes > MAX_MINS) {
        // We can't go any deeper without going over the time limit.
        // Just calculate how much more flow we will see until the time limit
        runDownClock();
        continue;
      }

      // calculate increase in total flow
      const new_total_flow = total_flow + opened.map(
        opened_valve_idx => valveobj[valve_names[opened_valve_idx]].flowrate * dt
      ).reduce(sum, 0)

      // remove from the closed set (as a copy)
      const new_closed_set = new Set(closed)
      new_closed_set.delete(nextvalve);

      // push this onto the queue
      BFS.enqueue({
        opened: [...opened, nextvalve],
        closed: new_closed_set,
        total_minutes: new_total_minutes,
        total_flow: new_total_flow,
      });
    }
  }
}

traverse()
console.log("Final max flow was found to be", MOST_FLOW);
