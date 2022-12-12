export const _monkeys = [{
  start_items: [76, 88, 96, 97, 58, 61, 67].map(BigInt),
  Operation: (old:bigint) => old * BigInt(19),
  Test: (testval:bigint ) => testval % BigInt(3) == BigInt(0) ? 2 : 3 ,
  num_items_thrown: 0,
  },
{
  start_items: [93, 71, 79, 83, 69, 70, 94, 98].map(BigInt),
  Operation: (old:bigint) => old + BigInt(8),
  Test: (testval:bigint ) => testval % BigInt(11) == BigInt(0) ? 5 : 6 ,
  num_items_thrown: 0,
  },
{
  start_items: [50, 74, 67, 92, 61, 76].map(BigInt),
  Operation: (old:bigint) => old * BigInt(13),
  Test: (testval:bigint ) => testval % BigInt(19) == BigInt(0) ? 3 : 1 ,
  num_items_thrown: 0,
  },
{
  start_items: [76, 92].map(BigInt),
  Operation: (old:bigint) => old + BigInt(6),
  Test: (testval:bigint ) => testval % BigInt(5) == BigInt(0) ? 1 : 6 ,
  num_items_thrown: 0,
  },
{
  start_items: [74, 94, 55, 87, 62].map(BigInt),
  Operation: (old:bigint) => old + BigInt(5),
  Test: (testval:bigint ) => testval % BigInt(2) == BigInt(0) ? 2 : 0 ,
  num_items_thrown: 0,
  },
{
  start_items: [59, 62, 53, 62].map(BigInt),
  Operation: (old:bigint) => old * old,
  Test: (testval:bigint ) => testval % BigInt(7) == BigInt(0) ? 4 : 7 ,
  num_items_thrown: 0,
  },
{
  start_items: [62].map(BigInt),
  Operation: (old:bigint) => old + BigInt(2),
  Test: (testval:bigint ) => testval % BigInt(17) == BigInt(0) ? 5 : 7 ,
  num_items_thrown: 0,
  },
{
  start_items: [85, 54, 53].map(BigInt),
  Operation: (old:bigint) => old + BigInt(3),
  Test: (testval:bigint ) => testval % BigInt(13) == BigInt(0) ? 4 : 0 ,
 num_items_thrown: 0,
},
]
