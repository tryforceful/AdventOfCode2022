/**
 * IMPORT DATA
 */

import * as fs from "fs";

const data: string = fs.readFileSync("./cave_repetition.txt", "utf8").split('\n').join('')
// console.log(data)

const strlen = 19467

let n = 0;
while(true) {
  const segment = data.slice(n,strlen+n);
  if(data.indexOf(segment) === data.lastIndexOf(segment))
  {
    console.log("look at row", n+2781)
    break;
  }
  n+=7;
}


const counts = fs
  .readFileSync("./counts.txt", "utf8")
  .split("\n")
  .slice(1, -1)
  .map(x => (x.split(','))[1])
  .map(Number)

console.log(counts);

// // Do it by diffs pattern
// const diffs_pattern: number[] = []

// counts.reduce((acc, cur) => {diffs_pattern.push(cur-acc); return cur;},0)

// console.log(diffs_pattern.join(','));

// fs.writeFileSync("diffslist.txt", diffs_pattern.join(","));


const filehandle = fs.openSync("offsets.txt", "w+");
fs.writeSync(
  filehandle,
  "Block_number,Diff_to_the_next_item_1750_blocks_later\n"
);
let m = 0;
while (m < 1750) {
  m++
  const stringg = m + ": " + (counts[1750 + m] - counts[m]);
  console.log(stringg);
  fs.writeSync(filehandle, stringg + '\n');
}

console.log(m)
