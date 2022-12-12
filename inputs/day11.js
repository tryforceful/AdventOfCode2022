"use strict";
exports.__esModule = true;
exports._monkeys = void 0;
exports._monkeys = [{
        start_items: [76, 88, 96, 97, 58, 61, 67].map(BigInt),
        Operation: function (old) { return old * BigInt(19); },
        Test: function (testval) { return testval % BigInt(3) == BigInt(0) ? 2 : 3; },
        num_items_thrown: 0
    },
    {
        start_items: [93, 71, 79, 83, 69, 70, 94, 98].map(BigInt),
        Operation: function (old) { return old + BigInt(8); },
        Test: function (testval) { return testval % BigInt(11) == BigInt(0) ? 5 : 6; },
        num_items_thrown: 0
    },
    {
        start_items: [50, 74, 67, 92, 61, 76].map(BigInt),
        Operation: function (old) { return old * BigInt(13); },
        Test: function (testval) { return testval % BigInt(19) == BigInt(0) ? 3 : 1; },
        num_items_thrown: 0
    },
    {
        start_items: [76, 92].map(BigInt),
        Operation: function (old) { return old + BigInt(6); },
        Test: function (testval) { return testval % BigInt(5) == BigInt(0) ? 1 : 6; },
        num_items_thrown: 0
    },
    {
        start_items: [74, 94, 55, 87, 62].map(BigInt),
        Operation: function (old) { return old + BigInt(5); },
        Test: function (testval) { return testval % BigInt(2) == BigInt(0) ? 2 : 0; },
        num_items_thrown: 0
    },
    {
        start_items: [59, 62, 53, 62].map(BigInt),
        Operation: function (old) { return old * old; },
        Test: function (testval) { return testval % BigInt(7) == BigInt(0) ? 4 : 7; },
        num_items_thrown: 0
    },
    {
        start_items: [62].map(BigInt),
        Operation: function (old) { return old + BigInt(2); },
        Test: function (testval) { return testval % BigInt(17) == BigInt(0) ? 5 : 7; },
        num_items_thrown: 0
    },
    {
        start_items: [85, 54, 53].map(BigInt),
        Operation: function (old) { return old + BigInt(3); },
        Test: function (testval) { return testval % BigInt(13) == BigInt(0) ? 4 : 0; },
        num_items_thrown: 0
    },
];
