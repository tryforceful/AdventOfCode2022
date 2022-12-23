/**
 * IMPORT DATA
 */

const SAMPLE = false;
const PART_ONE = false;

import * as fs from "fs";

const _data = fs
  .readFileSync(SAMPLE ? "./input_sample2.txt" : "./input.txt", "utf8")
  .split("\n")
  .slice(0, -1)
  .map((row) => row.split("")) as ('#'|'.')[][];

// we want to add a lot of padding to the original data...
const data = new Array(_data.length * 3)
  .fill(null)
  .map(() => new Array(_data[0].length * 3).fill("."));

// copy _data into data (with more space)
for(let i = _data.length; i < _data.length*2; i++)
  for(let j = _data[0].length; j < _data[0].length*2; j++)
    data[i][j] = _data[i-_data.length][j-_data[0].length]

const HEIGHT = data.length, WIDTH = data[0].length;

function printMap (themap = data) {
  const map = themap.map((x) => x.join("")).join("\n");
  if(SAMPLE) console.log(map);
  fs.writeFileSync("map.txt", map);
};

const MAWARI = [
  [-1, -1], // starting from north-west (nw)
  [-1, 0], // n
  [-1, 1], // ne
  [0, 1], // e
  [1, 1], // se
  [1, 0], // s
  [1, -1], // sw
  [0, -1], // w
] as const;
type MawariIdx = 0|1|2|3|4|5|6|7;

const DIRS: [MawariIdx, MawariIdx, MawariIdx][] = [
  [2,3,4], //E set
  [0,1,2], //N set
  [4,5,6], //S set
  [6,7,0], //W set
];

const numElves = (list: ('#'|'.')[]) => list.reduce((a,c) => c==='#'?a+1:a, 0)

function oneRound() {
  // rotate DIRS
  const shifted = DIRS.shift();
  if(!shifted) throw "Ran out of directions, somehow"
  DIRS.push(shifted);

  const wannaMove = new Map<string, string>();
  const tile_counts: {[x:string]: number} = {};

  for(let x = 0; x < HEIGHT; x++) {
    for(let y = 0; y < WIDTH; y++) {
      const tile = data[x][y];
      const xy_str = `${x},${y}`;

      if(tile === '#') { //elf
        const surroundings = MAWARI.map(([dx, dy]) => {
          const new_x = x+dx, new_y = y+dy;
          if((new_x < 0 || new_y < 0 || new_x >= HEIGHT || new_y >= WIDTH)) throw 'Out of Bounds error'
          return data[new_x][new_y]
        })

        const count_neighbors = numElves(surroundings);
        if(!count_neighbors) continue;

        //else determine where he wants to move
        //it's also possible for an elf to not move b/c he's too crowded
        for(const [d1,d2,d3] of DIRS) {
          if(![surroundings[d1],surroundings[d2],surroundings[d3]].includes('#'))
          {
            if(wannaMove.has(xy_str)) throw "# Already wants to move"
            const [dx,dy] = MAWARI[d2];
            const key = `${x + dx},${y + dy}`;
            wannaMove.set(xy_str, key);

            tile_counts[key] = (tile_counts[key] || 0) + 1;
            break;
          }
        }
      }
    }
  }

  // Now only consider non-duplicates
  const acceptable_moves = Object.entries(tile_counts)
    .filter(([, count]) => count === 1)
    .map(x => x[0]);

  for (const [elf_position, new_tile] of wannaMove.entries()) {
    if(acceptable_moves.includes(new_tile)) { // only for acceptable moves
      const [x,y] = elf_position.split(',')
      const [newx, newy] = new_tile.split(",");

      data[x][y] = '.' // clear old space
      data[newx][newy] = '#'
    }
  }

  return !!acceptable_moves.length; // did anyone move or not this round
}

let still_moving = true, numRounds = 0;
for (; PART_ONE ? numRounds < 10 : still_moving; numRounds++)
  still_moving = oneRound();

printMap()

// Get bounds of first instances of #
let left = 0, top = 0, right = WIDTH-1, bottom = HEIGHT-1;
for(; top < HEIGHT; top++) if(data[top].includes('#')) break;
for(; bottom > 0; bottom--) if (data[bottom].includes("#")) break;
for(; left < WIDTH; left++) if(data.map(row => row[left]).includes("#")) break;
for(; right > 0; right--) if(data.map(row => row[right]).includes("#")) break;

// Count number of empty tiles
let emptyTiles = 0;
for(let i = top; i <= bottom; i++)
  for(let j = left; j <= right; j++)
    if(data[i][j] === '.') emptyTiles++

console.log({ emptyTiles, numRounds });
