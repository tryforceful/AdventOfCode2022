/**
 * IMPORT DATA
 */

const SAMPLE = false;
const PART_ONE = true;

import * as fs from "fs";

const data: string = fs.readFileSync(
  SAMPLE ? "./input_sample.txt" : "./input.txt",
  "utf8"
);

const input: string[] = data.split("\n").slice(0, -1);

const coords = input.map(row => row.split(',').map(Number))

const max_dimensions = coords.reduce((a, c) => [
  Math.max(a[0], c[0]),
  Math.max(a[1], c[1]),
  Math.max(a[2], c[2]),
]) as [number, number, number];

const INTERIOR_SPACE = -1;
const EXTERIOR_SPACE = -2;

const map3d = new Array(max_dimensions[0] + 1)
  .fill("")
  .map(() => new Array(max_dimensions[1] + 1)
    .fill('')
    .map(() => new Array(max_dimensions[2] + 1)
      .fill(PART_ONE ? EXTERIOR_SPACE : INTERIOR_SPACE)
    )
  ) as number[][][];

const showMap3D = () => {
  let i = 0;
  for(const layer of map3d) {
    console.log("Slice #" + i++);
    console.log(
      layer
        .map((row) =>
          row.map((x) =>
              x === EXTERIOR_SPACE ? "." :
              x === INTERIOR_SPACE ? "-" : x).join("")
        )
        .join("\n"), '\n'
    );
  }
}

const sumPositives = (a:number, c:number) => c < 0 ? a : a + c;

const surfaceArea3D = () : number=> {
  return map3d.map(layer =>
    layer.map(row =>
      row.reduce(sumPositives, 0)
    ).reduce(sumPositives, 0)
  ).reduce(sumPositives, 0)
}

// Mark all known coordinates as having 6 visible faces, to start
for(const voxel of coords) {
  const [x, y, z] = voxel;
  map3d[x][y][z] = 6;
}

const adjacencies_to_check = [
  [-1, 0, 0], [1, 0, 0],
  [0, -1, 0], [0, 1, 0],
  [0, 0, -1], [0, 0, 1],
]

/**
 * PART TWO
 *
 * Assume (erroneously) at first all spaces are inside.
 * Procedurally, starting at a known outside corner like [0,0,0],
 * mark neighbor voxels as outside until there are no empty-air neighbor spaces left
 */
if(!PART_ONE) {
  let voxels_checked = new Set();
  let voxels_to_check = [[0,0,0]]

  function checkSpaceForExternality() {
    const voxel = voxels_to_check.shift();
    if(!voxel) return;

    const [x,y,z] = voxel;
    const stringform = voxel.join(',')

    if(voxels_checked.has(stringform)) return;
    voxels_checked.add(stringform)

    // Skip if out of bounds
    if (
      x < 0 || x > max_dimensions[0] ||
      y < 0 || y > max_dimensions[1] ||
      z < 0 || z > max_dimensions[2]
    )
      return;

    // Skip if already marked exterior or has mass
    if (map3d[x][y][z] === EXTERIOR_SPACE ||
        map3d[x][y][z] >= 0) return;

    map3d[x][y][z] = EXTERIOR_SPACE;

    for (const [dx, dy, dz] of adjacencies_to_check) {
      // Now look at all adjacent voxels
      voxels_to_check.push([x+dx, y+dy, z+dz])
    }
  }

  while(voxels_to_check.length)
    checkSpaceForExternality();
}

// Back to Part 1
for (const voxel of coords) {
  const [x, y, z] = voxel;

  for (const [dx, dy, dz] of adjacencies_to_check) {
    const new_x = x + dx;
    const new_y = y + dy;
    const new_z = z + dz;

    if( new_x < 0 || new_x > max_dimensions[0] ||
        new_y < 0 || new_y > max_dimensions[1] ||
        new_z < 0 || new_z > max_dimensions[2])
        continue;
    
    const neighbor = map3d[new_x][new_y][new_z];
    if (neighbor > 0) {
      /**
       *  This is a legitimate neighbor voxel.
       *  Reduce the "size" of the neighbor and currently-inspected voxel by 0.5
       *  0.5 because each [current,neighbor] pair will be checked twice
       */
      map3d[new_x][new_y][new_z] -= 0.5;
      map3d[x][y][z] -= 0.5;
    }
    else if (neighbor === INTERIOR_SPACE) {
      // The neighbor voxel is interior space;
      //just reduce the size of the current voxel by 1
      map3d[x][y][z] -= 1;
    }
  }
}

// showMap3D();

// Part 1 answer, should be 4548
// Part 2 answer, should be 2588
console.log(surfaceArea3D());
