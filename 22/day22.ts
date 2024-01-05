/**
 * IMPORT DATA
 */

const SAMPLE = false;
const PART_ONE = false;

import * as fs from "fs";

const data: string[] = fs
  .readFileSync(SAMPLE ? "./input_sample.txt" : "./input.txt", "utf8")
  .split("\n")
  .slice(0, -1);

const tilemap: string[][] = data.slice(0,-2).map(row => row.split(''))
const printMap = () => {
  const map =  tilemap.map((x) => x.join("")).join('\n')
  // console.log(map);
  fs.writeFileSync("map.txt", map);
}

const directions_str = data[data.length-1]
const directions = [...directions_str.matchAll(new RegExp(/(\d+|[RL])/g))].map(x => isNaN(Number(x[0])) ? x[0] : Number(x[0])) as ('R'|'L'|number)[]

/**
 * Maps and Types
 */

const facing_moves = {
  ">": [0, 1],
  v: [1, 0],
  "<": [0, -1],
  "^": [-1, 0],
} as const;
type BRACKET = keyof typeof facing_moves
const brackets = Object.keys(facing_moves) as BRACKET[];

const FACE_SIZE = 50;
const cube_face_coords = {
  A: [0, 1 * FACE_SIZE],
  B: [0, 2 * FACE_SIZE],
  C: [1 * FACE_SIZE, 1 * FACE_SIZE],
  D: [2 * FACE_SIZE, 1 * FACE_SIZE],
  E: [2 * FACE_SIZE, 0],
  F: [3 * FACE_SIZE, 0],
} as const;
type FACE = keyof typeof cube_face_coords;

const wraparounds: {
  [x: string]: readonly [FACE, BRACKET];
} = {
  "A<": ["E", ">"], // <-- note these pairs are reciprocals
  "E<": ["A", ">"], // <--
  "B>": ["D", "<"],
  "D>": ["B", "<"],
  "Bv": ["C", "<"],
  "C>": ["B", "^"],
  "C<": ["E", "v"],
  "E^": ["C", ">"],
  "Dv": ["F", "<"],
  "F>": ["D", "^"],
  "F<": ["A", "v"],
  "A^": ["F", ">"],
  "Fv": ["B", "v"],
  "B^": ["F", "^"],
} as const;


function cubicMove(
  bracket: BRACKET,
  current_coords: [number, number],
  attempted_coords: [number, number]
): [number, number, BRACKET] {

  //first find where we are
  let current_face: FACE | null = null;
  for (const key in cube_face_coords) {
    const [face_x, face_y] = cube_face_coords[key];

    if (
      current_coords[0] >= face_x &&
      current_coords[0] < face_x + FACE_SIZE &&
      current_coords[1] >= face_y &&
      current_coords[1] < face_y + FACE_SIZE
    ) {
      current_face = key as FACE;
      break;
    }
  }
  if (!current_face) throw "Didn't find current face...";

  // now we know where we are and where we're trying to move. look it up
  const [new_face, new_bracket] = wraparounds[current_face + bracket];
  const current_face_corner = cube_face_coords[current_face];
  const new_face_corner = cube_face_coords[new_face];

  // now handle the reassignment of coordinates for the jump

  // first, get the relative offset from its face's top-left corner
  let rel_x = attempted_coords[0] - current_face_corner[0]
  let rel_y = attempted_coords[1] - current_face_corner[1]

  // add single-face wrap around logic based on where we were going
  switch (bracket) {
    case ">": rel_y -= FACE_SIZE; break;
    case "v": rel_x -= FACE_SIZE; break;
    case "<": rel_y += FACE_SIZE; break;
    case "^": rel_x += FACE_SIZE; break;
  }

  // But we might have to reposition based on our new facing direction
  // so get the clockwise-read index of our position around the face edge
  // @returns // 0 thru FACE_SIZE-1 in clockwise indexing order
  function getIndexAlongEdge() {
    switch (bracket) {
      case ">": return FACE_SIZE - rel_x - 1
      case "v": return rel_y
      case "<": return rel_x
      case "^": return FACE_SIZE - rel_y - 1
    }
  }

  // and reassign to the same index position, but along the proper edge
  function setOnEdgeBasedOnIndex(idx: number) {
    if(idx < 0 || idx >= FACE_SIZE) throw "Bad index"

    switch (new_bracket) {
      case "v": return [0, idx]
      case "<": return [idx, FACE_SIZE-1]
      case "^": return [FACE_SIZE-1, FACE_SIZE-idx-1]
      case ">": return [FACE_SIZE-idx-1, 0]
    }
  }

  const edge_index = getIndexAlongEdge();

  const [repositioned_x, repositioned_y] = setOnEdgeBasedOnIndex(edge_index)

  const [final_x, final_y] = [repositioned_x + new_face_corner[0], repositioned_y + new_face_corner[1]]

  // console.dir({
  //   current_face,
  //   bracket,
  //   current_coords,
  //   attempted_coords,
  //   new_face,
  //   new_bracket,
  //   moved_coords: [final_x, final_y],
  // });

  return [final_x, final_y, new_bracket];
}


function day22 () {
  let position = [0, tilemap[0].findIndex((x) => x === ".")];
  let facing: 0 | 1 | 2 | 3 = 0;

  tilemap[position[0]][position[1]] = ">"; // set initial bracket

  for (const dir of directions) {
    const [_x, _y] = position;
    let bracket = tilemap[_x][_y] as BRACKET;
    if (!brackets.includes(bracket)) throw `Impossible 1 (${position}${bracket})`;
    facing = brackets.findIndex((x) => x === bracket) as 0 | 1 | 2 | 3;

    if (typeof dir === "number") {
      let [dx, dy] = facing_moves[brackets[facing]];
      for (let i = 0; i < dir; i++) {
        const [x, y] = position;
        let [newx, newy] = [x + dx, y + dy];

        const invalidityTest = () =>
          newx < 0 ||
          newy < 0 ||
          newx >= tilemap.length ||
          newy >= tilemap[newx].length ||
          tilemap[newx][newy] === " ";

        // We're looking ahead to a space that doesn't exist; we need to wrap
        if (invalidityTest()) {
          if (PART_ONE) {
            // Wraparound. Take current position and facing and back all the way up
            do (newx -= dx), (newy -= dy);
            while (!invalidityTest());
            (newx += dx), (newy += dy);
          }
          else {
            // Do cubic wrapping
            [newx, newy, bracket] = cubicMove(bracket, [x, y], [newx, newy]);

            // recalculate these to keep moving in the new direction
             facing = brackets.findIndex((x) => x === bracket) as 0 | 1 | 2 | 3;
             [dx, dy] = facing_moves[brackets[facing]];
          }
        }

        const newtile = tilemap[newx][newy];
        if ([...brackets,"."].includes(newtile)) {
          // safely move
          position = [newx, newy];
          tilemap[newx][newy] = bracket;
        } else if (newtile === "#") break;
        else throw `Wuh-oh (${newtile})`;
      }
    } else {
      facing += dir === "R" ? 1 : -1;

      tilemap[_x][_y] = brackets[(facing + 4) % 4]; // set new direction
    }
  }

  const solution = (position[0] + 1) * 1000 + (position[1] + 1) * 4 + facing;

  console.log({ [PART_ONE ? 'part1':'part2']: solution }); // 80392, 19534
}

try {
  day22()
} catch(e) {console.error(e)}

printMap()
