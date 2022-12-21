/**
 * IMPORT DATA
 */

const SAMPLE = false;

import * as fs from "fs";

const data: string = fs.readFileSync(
  SAMPLE ? "./input_sample.txt" : "./input.txt",
  "utf8"
);

const input = data.split("\n").slice(0, -1).map(x => x.split(/:?\s/));
const inputmap = Object.fromEntries(input.map(row => [row[0], row.slice(1)])) as MapStructure

// PART ONE
const monkeys = makeFunctionMap(inputmap)

// calculate root value
const part_one_answer = monkeys['root']()

console.log({part_one_answer});

// PART TWO
// Two values which should be equal:
const [root1,, root2] = inputmap['root'];

// find path through the map to `humn`
const humn_path: string[] = ['humn']
while(true) {
  const most_recent = humn_path[0]
  const nextkey = input.find(row =>row.slice(1).includes(most_recent))?.[0]

  if(nextkey) humn_path.unshift(nextkey);
  else break;
}
// Now humn_path[0] should be "root", [1] should be the operand we want to unwind

const val_to_compare_against = monkeys[(humn_path[1] === root1 ? root2 as string : root1)]()

const swapOperation = {
  '*':'/', '/':'*', '+':'-', '-':'+'
} as const;

// reframe original input map in terms of `humn`
const human_map: MapStructure = {
  [humn_path[1]]: [String(val_to_compare_against)],
};
for(let i = 1; i < humn_path.length-1; i++) {
  const curstep = humn_path[i],
        nextstep = humn_path[i+1];
  const [op1, sign, op2] = inputmap[curstep]

  if(!sign || !op2) throw "Impossible 2"
  if(nextstep === op1) {
    human_map[nextstep] = [curstep, swapOperation[sign], op2];
  }
  else if(nextstep === op2) {
    if(['-','/'].includes(sign))
      human_map[nextstep] = [op1, sign, curstep]
    else
      human_map[nextstep] = [curstep, swapOperation[sign], op1];
  }
  else throw "Impossible 3"
}

// include old operation sets we need to calculate with,
// but overwrite with the latest reframed math ops
const newhuman_map = {...inputmap, ...human_map}

const human_fn_map = makeFunctionMap(newhuman_map);

// calculate human value
const part_two_answer = human_fn_map["humn"]();

console.log({ part_two_answer });


/**
 * HELPERS
 */

type MapStructure = {
  [x: string]: [string] | [string, string, string];
};

type FunctionMapStructure = {
  [x: string]: () => number
}

function makeFunctionMap(inputmap: MapStructure): FunctionMapStructure {
  const result_fn_map = {};
  for (const key in inputmap) {
    const value = inputmap[key];
    if (value.length === 1) {
      // this is a number yelling monkey
      result_fn_map[key] = () => Number(value[0]);
    } else {
      // this is a math operation monkey
      const [operand, operation, operand2] = value;

      if (["+", "-"].includes(operation)) {
        result_fn_map[key] = () =>
          result_fn_map[operand]() +
          result_fn_map[operand2]() * (operation === "-" ? -1 : 1);
      } else if (["*", "/"].includes(operation)) {
        result_fn_map[key] = () =>
          result_fn_map[operand]() *
          result_fn_map[operand2]() ** (operation === "/" ? -1 : 1);
      } else throw "Impossible";
    }
  }
  return result_fn_map;
}
