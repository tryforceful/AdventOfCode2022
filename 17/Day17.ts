/**
 * IMPORT DATA
 */

import * as fs from "fs";

const data: string = fs.readFileSync("./input.txt", "utf8");

const original_input = <('<' | '>')[]> (data.split("\n")[0]).split('');
console.log("Length of commands:", original_input.length);

let input = [...original_input]
// console.log(input)

const MINUS = [[1,1,1,1]] //1x4
const PLUS = [[0,1,0], //3x3
              [1,1,1],
              [0,1,0]]
const ANGLE = [[0,0,1], //3x3
               [0,0,1],
               [1,1,1]];
const TOWER = [[1],[1],[1],[1]] //4x1
const BLOCK = [[1,1],[1,1]] //2x2

const FALLING_PIECE_ORDER = [MINUS,PLUS,ANGLE,TOWER,BLOCK]

// Max possible height is 8088 so let's round up to be safe
const HEIGHT = 9000;

// Create chamber

const cave: string[][] = new Array(HEIGHT)
  .fill('')
  .map(() => new Array(7).fill("."));

const writeCave = () =>
  fs.writeFileSync("cave.txt", cave.map((line) => line.join("")).join("\n"));
const consoleCave = () =>
  console.log(cave.map((line) => line.join("")).join("\n") + '\n\n');

let top_of_tower_idx = HEIGHT - 1;


const filehandle = fs.openSync('counts.txt', 'w+');
fs.writeSync(filehandle, "[piece_num, height_of_tower]\n");
for (let i = 0; i < 5491; i++) {
  handlePiece(i);

  fs.writeSync(filehandle, `${i + 1},${HEIGHT - top_of_tower_idx - 1}\n`);
}

function handlePiece(cur_piece: number ) {
  const piece = FALLING_PIECE_ORDER[cur_piece % 5];

  // place piece
  function attemptMovePiece(
    [new_x = 0, new_y = 0],
    [old_x, old_y]: [number, number]
  ) {
    // console.log(new_x, new_y, old_x, old_y);

    function attemptWritePiece(x: number, y: number, char = "@") {
      const new_indices: [number, number][] = [];

      try {
        piece.forEach((row, row_num) => {
          row.forEach((pixel, col_num) => {
            if (pixel === 1) {
              const y_idx = top_of_tower_idx - 2 - piece.length + row_num + y,
                x_idx = col_num + x;

              if (y_idx >= cave.length) {
                throw "";
              }

              if (char == "." || cave[y_idx][x_idx] == ".") {
                // we can write here, but don't write yet. keep a record of the pixels to write
                new_indices.push([y_idx, x_idx]);
              } else {
                // We are overlapping on something! Fail.
                throw "";
              }
            }
          });
        });
      } catch (e) {
        return false;
      }

      // Now do the writing
      new_indices.forEach(([y_idx, x_idx]) => {
        cave[y_idx][x_idx] = char;
      });

      return true;
    }

    // Erase current space
    attemptWritePiece(old_x, old_y, "."); // should always return true

    const successful = attemptWritePiece(new_x, new_y);
    if (!successful) {
      // We ran into an error so, rewrite the old space with '#' and we're done
      attemptWritePiece(old_x, old_y, "#");
      return false;
    } else return true;
  }

  let can_move_more = true;

  let x = 2,
    y = 0;
  let old_x = 2,
    old_y = 0;

  // Set first position of piece
  attemptMovePiece([x, y], [x, y]);

  while (can_move_more) {
    // Handle horizontal movement
    if(input.length === 0) {
      // we need to refresh the input
      input = [...original_input];
    }
    const movement = input.shift();
    if (!movement) throw new Error("Error, not enough movement input!");

    (old_x = x), (old_y = y);
    if (movement === "<") {
      x === 0 || x--;
    } else {
      x + piece[0].length >= 7 || x++;
    }

    if (x !== old_x) {
      can_move_more = attemptMovePiece([x, y], [old_x, old_y]);
      if (!can_move_more)
        // reset x to old_x, we couldn't move it horizontally
        x = old_x;
    }

    // consoleCave();

    // Handle downward movement
    (old_x = x), (old_y = y);
    y = y + 1;

    can_move_more = attemptMovePiece([x, y], [old_x, old_y]);
    if (!can_move_more) break;

    // consoleCave();
  }

  // should be finished falling

  // recalculate top_of_tower_idx
  while(cave[top_of_tower_idx].findIndex(x => x ==='#') !== -1)
    top_of_tower_idx--;

  // writeCave();
}

writeCave()
console.log(HEIGHT - top_of_tower_idx - 1)
