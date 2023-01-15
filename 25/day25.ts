const SAMPLE = false;

import * as fs from "fs";

const data = fs
  .readFileSync(SAMPLE ? "./input_sample.txt" : "./input.txt", "utf8")
  .split("\n")
  .slice(0, -1)
  .map((row) => row.split("") as SNAFU_DIGIT[]);

const SNAFU_MAP = {'0':0,'1':1,'2':2,'-':-1,'=':-2} as const
const DIGIT_MAP = Object.fromEntries(
  Object.entries(SNAFU_MAP).map(([k, v]) => [v, k as SNAFU_DIGIT])
);
type SNAFU_DIGIT = keyof typeof SNAFU_MAP;

function snafuToDecimal(input: SNAFU_DIGIT[]): number {
  let decimal = 0;

  for(const idx in input)
    decimal += SNAFU_MAP[input[idx]] * 5 ** (input.length - +idx - 1)

  return decimal;
}

function decimalToSnafu(input: number): SNAFU_DIGIT[] {
  const snafu: SNAFU_DIGIT[] = [];
  let fives: (0|1|2|3|4)[] = []

  while(input / 5 > 0) {
    fives.push((input % 5) as 0 | 1 | 2 | 3 | 4);
    input = Math.floor(input / 5)
  }

  let carrydigit = false;
  for(let place of fives) {
    if(carrydigit) place++

    carrydigit = place > 2;
    if(carrydigit) place -= 5;

    snafu.unshift(DIGIT_MAP[place])
  }
  // Handle remaining carry
  if(carrydigit) snafu.unshift('1')

  return snafu;
}

const sum = (a:number, c:number) => a+c

const sum_of_balloons = data.map(snafuToDecimal).reduce(sum, 0)

console.dir({sum_of_balloons});
console.log(decimalToSnafu(sum_of_balloons).join(""));
