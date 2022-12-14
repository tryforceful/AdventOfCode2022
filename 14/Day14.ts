/**
 * IMPORT DATA
 */

import * as fs from "fs";

const data: string = fs.readFileSync("./day14.txt", "utf8");

const input: string[] = data.split("\n").slice(0, -1);

const coords = input.map((line) => line.split(" -> ").map(coord => coord.split(',').map(Number)))

// console.log(coords[0]);

function Day14(PART_2: boolean = false) {

  const flat = coords.flat();

  let maxX = Math.max(...flat.map(coord => coord[0]))
  let maxY = Math.max(...flat.map(coord => coord[1]))

  // console.log(maxX, maxY) // [569, 166] max in data (PART 1)

  if(PART_2) {
    maxY += 2;
    maxX *= 2; // Double the width, just in case; well past max it should spread.
  }

  const cave = new Array(maxY + 1).fill([]).map(() => new Array(maxX + 1).fill('.'));

  // Create rocks

  function drawRockLine(_coord_list: [number, number][]) {
    const coord_list = [..._coord_list]; // copy to avoid mutation

    let first = coord_list.shift();
    let second = coord_list.shift();

    while (coord_list.length >= 0) {
      if (!first || !second) return;

      const xIsSame = first[0] === second[0]

      const startOfLine = first[xIsSame ? 1 : 0];
      const endOfLine = second[xIsSame ? 1 : 0]
      let direction = xIsSame ? second[1] - first[1] : second[0] - first[0]
      direction /= Math.abs(direction);

      let coord_to_set;
      for (let i = startOfLine; i != endOfLine; i += direction) {
        coord_to_set = xIsSame ? [first[0], i] : [i, first[1]]
        cave[coord_to_set[1]][coord_to_set[0]] = 'X';
      }
      coord_to_set = xIsSame ? [first[0], endOfLine] : [endOfLine, first[1]];

      if (!cave[coord_to_set[1]]?.[coord_to_set[0]]) {
        const errmsg = `Error for this coord ${coord_to_set} with this coord set (${coord_list})`
        throw errmsg;
      }
      cave[coord_to_set[1]][coord_to_set[0]] = "X";

      first = second;
      second = coord_list.shift();
    }
  }

  coords.forEach(coord_list => drawRockLine(coord_list as[number, number][]));

  if(PART_2) {
    // Now draw the bottom floor
    drawRockLine([
      [0, maxY],
      [maxX - 1, maxY],
    ]);
  }

  // Start pouring sand

  const origin_coord = [500, 0] // x, y  // but `cave` is [y, x]
  let sand_counter = 0;

  function sandDrop() {
    let [x, y] = origin_coord;

    while (true) {
      if (cave[0][500] === "o") throw "Hit the top of the cave";

      // over-bounds tests & movements
      if (y + 1 > maxY && !PART_2) {
        throw "Went beyond floor (over y)";
      }
      else if (cave[y + 1][x] === '.') {
        y += 1;
        continue;
      }
      else if (x - 1 < 0 && !PART_2) {
        throw "Went left of cave (under x)";
      }
      else if (cave[y + 1][x - 1] === '.') {
        y += 1;
        x -= 1;
        continue;
      }
      else if (x + 1 > maxX && !PART_2) {
        throw "Went right of cave (over x)"
      }
      else if (cave[y + 1][x + 1] === '.') {
        y += 1;
        x += 1;
        continue;
      }
      else {
        // Nowhere to go; rest here.
        cave[y][x] = 'o';
        break;
      }
    }

    // Increment counter of 'o's
    ++sand_counter;
  }

  // Drop sand until we hit a bounds error
  try {
    while (true)
      sandDrop();
  } catch (e) {
    console.error(e);
  }

  // Write cave to file
  fs.writeFileSync("cave.txt", cave.map((line) => line.join("")).join("\n"));

  // Print # of 'o's
  console.log(sand_counter)
}

console.log("--- Part 1 ---");
Day14();
console.log('--- Part 2 ---');
Day14(true);
