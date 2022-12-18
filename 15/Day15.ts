/**
 * IMPORT DATA
 */

const SAMPLE = false;
const PART_ONE = false;

import * as fs from "fs";

const data: string = fs.readFileSync(SAMPLE ?  "./day15_sample.txt" : "./day15.txt", "utf8");

const input: string[] = data.split("\n").slice(0, -1);


const rex = /Sensor at x=|: closest beacon is at x=|, y=/g;

const sensors = input.map((line) => {
  const [sensor_x, sensor_y, beacon_x, beacon_y] = line.split(rex).slice(1).map(Number);
  return {sensor: {x: sensor_x, y: sensor_y}, beacon: {x: beacon_x, y: beacon_y}}
});

// console.log(sensors);
if(PART_ONE) {

  const ROW_TO_LOOK_AT = SAMPLE ? 10 : 2000000;

  // For safety, giving us some negative array bandwidth
  const NEGATIVE_BUFFER = SAMPLE ? 10 : 10000000;
  const row_array: string[] = new Array(SAMPLE ? 50 : 50000000).fill(".");

  // For each sensor
  for(const {sensor, beacon} of sensors) {

    // First, check if either the beacon or the sensor is in this row!
    if(beacon.y === ROW_TO_LOOK_AT)
      row_array[beacon.x + NEGATIVE_BUFFER] = 'B'
    if(sensor.y === ROW_TO_LOOK_AT)
      row_array[sensor.x + NEGATIVE_BUFFER] = 'S'

    // The manhattan distance from sensor to beacon is constant in the lozenge shape
    const manhattan_distance =
      Math.abs(sensor.x - beacon.x) + Math.abs(sensor.y - beacon.y);

    // Determine how far away Y-wise we are from ROW_TO_LOOK_AT
    // If it's within the manhattan distance, we have to mark some #s
    const num_spaces_within_zone = manhattan_distance - Math.abs(ROW_TO_LOOK_AT - sensor.y);
    
    if (num_spaces_within_zone > 0 ) {
      for(let x = -num_spaces_within_zone; x <= num_spaces_within_zone; x++) {
        // console.log(`# is at: [${x + sensor.x},${ROW_TO_LOOK_AT}]`)

        if (row_array[x + sensor.x + NEGATIVE_BUFFER] === '.')
          row_array[x + sensor.x + NEGATIVE_BUFFER] = "#";
      }
    }

    // console.log({ sensor, beacon, manhattan_distance });
  }

  if(SAMPLE) console.log(row_array.join(''));

  const num_hashes = row_array.reduce((a,c) => c === '#' ? a + 1 : a, 0)

  console.log(num_hashes);
}


/******
 * PART TWO
 */

if(SAMPLE && !PART_ONE) {
  // Sample: search space is [0,0] to [20,20]
  // Real search space is  [0,0] to [4 mil,4 mil]

  const set = new Set<string>();

  for(let i = 0; i < (SAMPLE ? 20 : 4000000); i++)
    for(let j = 0; j < (SAMPLE ? 20 : 4000000); j++)
      set.add(i + ',' + j)

  // For each sensor
  for(const {sensor, beacon} of sensors) {

    // First, check if either the beacon or the sensor is in this row!
    set.delete(sensor.x + ',' + sensor.y)
    set.delete(beacon.x + ',' + beacon.y)

    // The manhattan distance from sensor to beacon is constant in the lozenge shape
    const X_OFFSET = Math.abs(sensor.x - beacon.x)
    const Y_OFFSET = Math.abs(sensor.y - beacon.y)
    const manhattan_distance = X_OFFSET + Y_OFFSET

    for(let x = sensor.x - manhattan_distance; x <= sensor.x + manhattan_distance; x++ ) {
      for (let y = sensor.y - manhattan_distance; y <= sensor.y + manhattan_distance; y++) {
        if (
          Math.abs(sensor.x - x) + Math.abs(sensor.y - y) <=
          manhattan_distance
        ) {
          set.delete(x + "," + y);
        }
      }
    }
  }

  console.log(set.size);
  if(set.size < 100) {
    console.log([...set])
  }

  // This solution won't scale to 16 trillion pixels :(
}


const numsort = (a: any, b: any) => a - b;

if(!PART_ONE) {
  let set_intercepts = new Set();

  for (const { sensor, beacon } of sensors) {
    // The manhattan distance from sensor to beacon is constant in the lozenge shape
    const manhattan_distance =
      Math.abs(sensor.x - beacon.x) + Math.abs(sensor.y - beacon.y);

    const min_x = sensor.x - manhattan_distance,
      max_x = sensor.x + manhattan_distance,
      min_y = sensor.y - manhattan_distance,
      max_y = sensor.y + manhattan_distance;

    const points: [number, number][] = [
      [min_x, sensor.y], //left
      [sensor.x, min_y], //top
      [max_x, sensor.y], //right
      [sensor.x, max_y], //bottom
    ];

    // const slopes = [
    //   (points[1][1] - points[0][1]) / (points[1][0] - points[0][0]), // -1 slope
    //   (points[2][1] - points[1][1]) / (points[2][0] - points[1][0]), // 1 slope
    //   (points[3][1] - points[2][1]) / (points[3][0] - points[2][0]), // -1 slope
    //   (points[0][1] - points[3][1]) / (points[0][0] - points[3][0]), // 1 slope
    // ];

    const intercepts = [
      points[0][1] + points[0][0], // -1 slope
      points[1][1] - points[1][0], // 1 slope
      points[2][1] + points[2][0], // -1 slope
      points[3][1] - points[3][0], // 1 slope
    ];

    // console.log(slopes);
    // console.log(intercepts);

    intercepts.forEach((x) => {
      // set_intercepts.has(x) ?
      // console.log('dupe: '+x) :
      set_intercepts.add(x);
    });
  }

  const list_of_all_intercepts = [...set_intercepts].sort(numsort) as number[];

  console.log({ list_of_all_intercepts });

  const diffs: number[] = [];
  list_of_all_intercepts.reduce((a, c) => {
    diffs.push(c - a);
    return c;
  });

  console.log({ diffs });

  // There happen to only be 2 instance of "2"! Those intercepts are what we want.

  console.log([diffs.indexOf(2), diffs.lastIndexOf(2)]);
  console.log(
    [list_of_all_intercepts[diffs.indexOf(2)],
    list_of_all_intercepts[diffs.indexOf(2) + 1],],
    [list_of_all_intercepts[diffs.lastIndexOf(2)],
    list_of_all_intercepts[diffs.lastIndexOf(2) + 1]],
  );

  // -630630,  -630628    ->  intercept is -630629  (probably +1 m)
  // 6003106,  6003108    ->  intercept is 6003107  (probably -1 m)

  // So our two equations are:
  // y = x - 630629;
  // y = -x + 6003107;
  // Solve for intersection point; that's our answer

  // 2y = - 630629 + 6003107
  // Y = 5372478 / 2 = 2686239 **********
  // X = 2686239 + 630629 = 3316868 **********

  const blank_x = 3316868, blank_y = 2686239 // !!!!

  console.log(blank_x * 4000000 + blank_y)

  // 13267474686239; is the answer to part 2
}
