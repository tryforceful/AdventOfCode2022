const SAMPLE = false;
const PART_ONE = true;

import * as fs from "fs";

const data: string = fs.readFileSync(SAMPLE ? "./input_sample.txt" : "./input.txt", "utf8");

const input: number[] = data.split("\n").slice(0, -1).map(Number);

/**
 * We could do this in O(n log n) probably with a tree, but I don't feel like doing that research right now
 * I'm going to try an O(n^2) approach since the dataset is just 5000 items... see if it's good enough
 *
 * Doubly-linked list in a circle with separate initial-order-preserving array:
 *
 *             initial-order-preserving array
 *             [ 1,      2,      -3 ...]
 *               |       |        |
 *               v       v        v
 *      ... <-> {1} <-> {2} <-> {-3} <-> ...
 *              circular doubly linked list
 *
 * Should operate, per turn, for n turns,
 *   - Lookup O(1)
 *   - Delete O(1)
 *   - Move O(n)
 *   - Insert O(1)
 * Total O(n^2)...
 *
 * Hopefully Part 2 doesn't tell us to do it for a larger dataset or something
 */
/**
 * Note 1
 *
 * Moving an item though a circular list of length n only takes ***n-1*** moves!
 *
 * e.g. for a list "abcd" that is length 4, where a is also connected to d,
 *  wrapping around like (a <-> b <--> c <-> d <-> a)
 *
 *
 * abcd     // start position
 * bacd     // move "a" once to the right
 * bcad     // move "a" a 2nd time
 * bcda     // move "a" a 3rd time
 * // ^ but "bcda" === "abcd" for a circular list!
 *
 * We only move "a" 3 times for a list of length 4.
 *
 * Hence we only need to modulus against (n-1) for huge numbers
 *
 */

class DLLNode {
  public prev: DLLNode = this;
  public next: DLLNode = this;
  public value: number;

  constructor(_value: number) {
    this.value = _value;
  }
}

function DLL_insertAfterThisNode(_insertAfterNode: DLLNode | null = null, insertMe: DLLNode) {
  const insertAfterNode = _insertAfterNode || insertMe;
  const insertBeforeNode = insertAfterNode.next;

  insertAfterNode.next = insertMe;
  insertBeforeNode.prev = insertMe;
  insertMe.prev = insertAfterNode;
  insertMe.next = insertBeforeNode;
}

function DLL_removeTotally(removeMe: DLLNode) {
  const removeBeforeNode = removeMe.next;
  const removeAfterNode = removeMe.prev;

  if (removeBeforeNode === removeAfterNode)
    throw new Error("Trying to delete last node from list")

  removeBeforeNode.prev = removeAfterNode;
  removeAfterNode.next = removeBeforeNode;
}

// Add all numbers to DLL & create ordered pointer array
let cursor: DLLNode | null = null;
let startPosition: DLLNode | null = null;

const orderedPointerArray: { pointer: DLLNode }[] = [];

const DECRYPTION_KEY = 811589153;

// Prepare nodes
input.forEach(value => {
  const newnode = new DLLNode(PART_ONE ? value : value * DECRYPTION_KEY);

  // Add all numbers to DLL
  DLL_insertAfterThisNode(cursor, newnode);
  cursor = newnode;

  // Add this to the ordered pointer array
  orderedPointerArray.push({ pointer: newnode });

  if(value === 0) // This is the true start position we care about
    startPosition = newnode;
})

if(startPosition === null)
  throw "We have no 0 in the list (no start position)!"

// Now iterate and start moving
function mixList() {
  for(const arritem of orderedPointerArray) {
    const nodeToMove = arritem.pointer;

    // The modulus must be against (length-1)... see note #1
    const numOfMoves = nodeToMove.value % (input.length-1);
    if (numOfMoves === 0) continue;

    const direction = numOfMoves / (Math.abs(numOfMoves) || 1);

    // Rotate cursor around list
    let movecursor = nodeToMove;
    for (let i = 0; i < Math.abs(numOfMoves); i++) {
      movecursor = direction === 1 ? movecursor.next : movecursor.prev;
    }

    // we got the new location. remove node from old location, then add to new location
    DLL_removeTotally(nodeToMove)
    DLL_insertAfterThisNode(direction === 1 ? movecursor : movecursor.prev, nodeToMove);
  }
}

for(let i = 0; i < (PART_ONE ? 1 : 10); i++)
  mixList();

function getListFromZero() {
  let _curs = startPosition;
  if (!_curs) return [];

  const arr: number[] = [_curs.value];

  while (_curs && _curs.next.value != 0) {
    _curs = _curs.next;
    arr.push(_curs.value);
  }
  return arr;
}


const results = getListFromZero();

// add together 1000th 2000th and 3000th index values
const len = results.length;
console.log("Sum:", results[1000 % len] + results[2000 % len] + results[3000 % len])
