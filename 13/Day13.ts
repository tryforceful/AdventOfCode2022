/**
 * IMPORT DATA
 */

import * as fs from "fs";

let data: string;
let input: (RecursiveArr<number[]> | undefined)[];

data = fs.readFileSync("./day13.txt", "utf8");

const original_input = data
    .split("\n")
    .slice(0, -1)

input = original_input.map((x) => (x ? JSON.parse(x) : undefined));

// Types
type RecursiveArr<T extends Array<number>> = Array<number | RecursiveArr<T>>;

type Pair = {
  left: RecursiveArr<number[]>;
  right: RecursiveArr<number[]>;
};

/**
 * PART ONE
 */

const pairs: Pair[] = [];

while(input.length) {
  const pair = {
    left: input.shift(),
    right: input.shift()
  }
  pairs.push(pair as Required<Pair>);
  input.shift();
}

function isRecursiveArray(x: unknown): x is RecursiveArr<number[]> {
  return x instanceof Array;
}

function inCorrectOrder(pair: Pair): boolean | undefined {
  const {left, right} = pair;

  while(true) {
    const a = left.shift();
    const b = right.shift();

    // console.log(`Compare '${JSON.stringify(a)}' and '${JSON.stringify(b)}'`)

    if (a === undefined && b === undefined) return undefined;
    if (a === undefined || b === undefined) return a === undefined;

    if(typeof a === 'number' && typeof b === 'number'){
      if (b === a) continue;
      return a < b;
    }
    else {
      const deeper = inCorrectOrder({
        left: isRecursiveArray(a) ? a : [a],
        right: isRecursiveArray(b) ? b : [b]
      });
      if(deeper === undefined) continue;
      return deeper;
    }
  }
}

const pairsInCorrectOrders = pairs.map(x => {
  const result = inCorrectOrder(x);

  if(result === undefined) throw "Indeterminate comparison state :(";

  return result;
})


const reductor = (acc: number, cur: boolean, idx: number) => (cur === true ? acc + idx + 1 : acc);

console.log((pairsInCorrectOrders).reduce(reductor, 0));


/**
 * PART TWO
 */

const allpackets = original_input.filter(x => x !== '')

allpackets.push(`[[2]]`,`[[6]]`)

allpackets.sort((a, b) => {
  const _a = JSON.parse(a), _b = JSON.parse(b);

  if(!_a) throw "No a :("
  if(!_b) throw "No b :("

  const result = inCorrectOrder({ left: _a, right: _b });

  if(result === undefined) throw "Indeterminate sort state :(";

  return result === true ? -1 : result === false ? 1 : 0;
});

fs.writeFileSync("./sorted_packets.txt", allpackets.join("\n"));

const packet1 = allpackets.findIndex(x => x === '[[2]]') + 1;
const packet2 = allpackets.findIndex(x => x === '[[6]]') + 1;

console.log(`Solution: ${packet1 * packet2}`)
