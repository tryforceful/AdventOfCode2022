const fs = require("fs");

let data: string;
let input: string[];

data = fs.readFileSync("./inputs/day13.txt", "utf8");
input = data.split("\n").slice(0, -1);
