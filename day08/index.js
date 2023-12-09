const fs = require('fs/promises');
const path = require('path');
const { testLog, spacerLog } = require('../helpers/testing');

/**
 * @typedef {'left'|'right'} LeftRight
 * @typedef {{ value: string; left: string; right: string; }} WastelandNode
 */

class HauntedWasteland {
  /** @param {string} steps Initial steps string. ex. `"LRL"` */
  constructor(steps) {
    /** @type {LeftRight[]} */
    this._steps = steps.split('').map(v => (/l/i.test(v) ? 'left' : 'right'));

    /** @type {Map<string, WastelandNode>} */
    this._nodes = new Map();
  }

  /** @type {(value: string) => WastelandNode } */
  find(value) {
    return this._nodes.get(value) ?? null;
  }

  /** @type {(value: string, left: string, right: string) => HauntedWasteland } */
  create(value, left, right) {
    const node = this.find(value);
    if (node) return this;
    const newNode = { value, left, right };
    this._nodes.set(value, newNode);
    return this;
  }

  /**
   * @param {string} start
   * @param {string} end
   * @returns {number}
   */
  walk(start = 'AAA', end = 'ZZZ') {
    const steps = this._steps;
    const maxSteps = steps.length;

    let stepNum = 0;
    let from = start;

    while (from !== end) {
      const node = this.find(from);
      if (!node) return 0;
      from = node[this._steps[stepNum % maxSteps]];
      stepNum++;
    }
    return stepNum;
  }
}

/** @returns {Promise<TreeMap>} */
const getParsedData = async (file = 'data.txt') => {
  const data = await fs.readFile(path.resolve(__dirname, file), 'utf8');
  const [steps, ...lines] = data.split(/\r?\n/);

  const tree = lines.reduce((root, line) => {
    if (!line) return root;
    const [k, v] = line.split('=').map(v => v.trim());
    const [l, r] = v.replaceAll(/[^A-Z ]/gi, '').split(' ');
    return root.create(k, l, r);
  }, new HauntedWasteland(steps));

  return tree;
};

const day08 = async () => {
  spacerLog('Haunted Wasteland', false);
  //* Example 1
  const wastelandEx1 = await getParsedData('example1.txt');
  const stepsEx1 = wastelandEx1.walk('AAA');
  testLog(stepsEx1, 2)(`(Example #1) Expect: ${stepsEx1} to equal ${2}`);

  //* Example 2
  const wastelandEx2 = await getParsedData('example2.txt');
  const stepsEx2 = wastelandEx2.walk('AAA');
  testLog(stepsEx2, 6)(`(Example #2) Expect: ${stepsEx2} to equal ${6}`);

  //* Solution 1
  const wasteland = await getParsedData('data.txt');
  const steps = wasteland.walk('AAA');

  testLog(steps, 18727)(`(Solution #1) Expect: ${steps} to equal ${18727}`);
  spacerLog('-----------------', true, false);
};

//* Prompt #1: 18727

module.exports = day08;
