/**
 * IMPORT DATA
 */

import { Queue } from 'mnemonist';
import * as fs from "fs";

const PART_ONE = false;
const SAMPLE = false;

const data: string = fs.readFileSync(
  SAMPLE ? "./day16_sample.txt" : "./day16.txt"
  // './testcases/case4.txt'
, "utf8");
const input: string[] = data.split("\n").slice(0, -1);

const rex = /Valve | has flow rate=|; tunnels? leads? to valves? /g

type ValveInfo = {
      index: number;
      flowrate: number;
      paths: string[];
    }

// Massage Data

const valvearr = input.map((line, index) => {
  const [,valve,flowrate,paths] = line.split(rex)

  return [valve, {index, flowrate: Number(flowrate), paths: paths.split(', ')}]
}) as [string, ValveInfo][];
const valve_names = valvearr.map((x) => x[0]);

const LENGTH = valvearr.length;

const valveobj = Object.fromEntries(valvearr);

const nonzero_valves = valvearr.filter(([, info]) => info.flowrate > 0)
const nonzero_valve_idxes = nonzero_valves.map(x => x[1].index)

const START_IDX = valveobj['AA'].index || 0

// console.log({ START_IDX });
// console.log(valveobj);
// console.log(nonzero_valves)
// console.log(nonzero_valve_idxes)

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

// Now we can try to traverse the graph knowing the min paths for each i,j vertex combo

const MAX_MINS = PART_ONE ? 30 : 26;

const START_STATE = {
  opened: [] as number[],
  minutes_so_far: 0,
  flow_so_far: 0,
};
type DP_State = typeof START_STATE;

const sum = (a:number,c:number) => a+c

const BFS = Queue.from([START_STATE]);

type T_DP_Key = string
type T_TotalCumulativeFlow = number

const DP = new Map<T_DP_Key, T_TotalCumulativeFlow>();
DP.set("", 0); // initial state

const sorter = (a:number,b:number) => a < b ? -1 : a > b ? 1 : 0

function makeKeyFromArray(opened: number[]): T_DP_Key {
  return `${[...opened].sort(sorter).join()}`;
};

let MOST_FLOW = 0;

let max_size_opened = 0;
let num_cycles = 0;

function traverse() {
  while(BFS.size) {
    num_cycles++;

    const node = BFS.dequeue()
    if (!node) throw "Uh oh";
    const {opened, minutes_so_far, flow_so_far} = node;
    const node_key = makeKeyFromArray(node.opened);

    if (!DP.has(node_key) === undefined) throw "More uh oh";

    function runDownClock(_node: DP_State | undefined = node) {
      if (!_node) throw "Uh oh 2";
      const final_total_flow = _node.flow_so_far + _node.opened.map(
          opened_valve_idx => valveobj[valve_names[opened_valve_idx]].flowrate * (MAX_MINS - _node.minutes_so_far)
        ).reduce(sum, 0)

      if(final_total_flow > MOST_FLOW) {
        MOST_FLOW = final_total_flow;
        // console.log(
        //   "Max flow was now found to be",
        //   MOST_FLOW,
        //   "with",
        //   _node.opened.join(),
        //   `[${_node.opened.map((idx) => valve_names[idx]).join()}]`
        // );
      }

      if(_node.opened.length > max_size_opened)
        max_size_opened = _node.opened.length

      return final_total_flow
    }

    if (opened.length === nonzero_valves.length) {
      // No more to traverse!
      continue;
    }

    // determine closed set
    const closed = nonzero_valve_idxes.filter( x => !opened.includes(x));

    for (const nextvalve of closed) {
      // calculate the move to this next valve
      // according to matrix, it costs this much (+1 to open valve)
      const dt = matrix[opened[opened.length - 1] || START_IDX][nextvalve] + 1;

      const new_total_minutes = minutes_so_far + dt;

      if(new_total_minutes > MAX_MINS) {
        // We can't go any deeper without going over the time limit.
        continue;
      }

      // calculate increase in total flow
      const new_flow_so_far = flow_so_far + opened.map(
        opened_valve_idx => valveobj[valve_names[opened_valve_idx]].flowrate * dt
      ).reduce(sum, 0)

      const newnode: DP_State = {
        opened: [...opened, nextvalve],
        minutes_so_far: new_total_minutes,
        flow_so_far: new_flow_so_far
      }
      const new_node_key = makeKeyFromArray(newnode.opened);

      const dp_new_node = DP.get(new_node_key);
      const new_nodes_cumulative_flow_value = runDownClock(newnode)
      if (dp_new_node === undefined || new_nodes_cumulative_flow_value > dp_new_node) {
        DP.set(new_node_key, new_nodes_cumulative_flow_value);
      }

      // push this onto the queue
      BFS.enqueue(newnode);
    }
  }
}

traverse()
console.log("Final max flow for 1 agent was found to be", MOST_FLOW);
console.log(`Biggest # of opened valves in ${MAX_MINS} mins was ${max_size_opened}`);
console.dir({num_cycles, DPsize: DP.size})

// console.dir([...DP.entries()].slice(-100))
// console.dir([...DP.values()].reduce((a,c) => Math.max(a,c)));
// const X = [...DP.entries()].sort((a,b) => a[1] < b[1] ? 1 : a[1]>b[1] ? -1 :0)
// console.dir(X.slice(0,100))

if(!PART_ONE) {
  console.log('Calculating max flow for 2 agents [me + elephant]...')
  let maxvalue = 0;

  DP.forEach((me_flow, me_valves_key) => {
    const me_valves = me_valves_key.split(",").map(Number)

    DP.forEach((elephant_flow, elephant_valves_key) => {

      if (me_flow + elephant_flow <= MOST_FLOW) return;

      const elephant_valves = elephant_valves_key.split(",").map(Number);

      if(!me_valves.some(x => elephant_valves.includes(x))) {
        // disjoint sets
        const thismax = me_flow + elephant_flow;
        if(thismax > maxvalue) {
          maxvalue = thismax;
          // console.log('updated to', maxvalue)
          // console.dir({me_valves_key, me_flow, elephant_valves_key, elephant_flow})
        }
      }
    })
  })

  console.log(maxvalue);
}
