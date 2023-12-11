const fs = require('fs/promises');
const path = require('path');
const { testLog, spacerLog, trackTime } = require('../helpers/testing');

const time = trackTime();

const formatNum = n => {
  if (n === 0) return 0;
  const num = String(n);
  const len = num.length;
  const expLen = len + (3 - (len % 3));

  return [...num.padStart(expLen, '0').matchAll(/\d{3}/g)]
    .flatMap(([v], i) =>
      i === 0 ? (!parseInt(v) ? [] : String(parseInt(v))) : v
    )
    .join();
};

/**
 * @typedef {'left'|'right'} LeftRight
 * @typedef {{ value: string; left: string; right: string; }} WastelandNode
 */

class HauntedWasteland {
  /** @param {string} steps Initial steps string. ex. `"LRL"` */
  constructor(steps) {
    /**
     * @private
     * @type {LeftRight[]}
     */
    this._steps = steps.split('').map(v => (/l/i.test(v) ? 'left' : 'right'));

    /**
     * @private
     * @type {Map<string, WastelandNode>}
     */
    this._nodes = new Map();

    /**
     * @private
     * @type {WastelandNode[]}
     */
    this._nodeList;
  }

  getStep(num) {
    return this._steps[num % this._steps.length];
  }

  nodes() {
    if (!this.nodeList) {
      this._nodeList = [...this._nodes.values()];
    }
    return this._nodeList;
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

  /** @type {(start: string, end: string) => number} */
  walk(start = 'AAA', end = 'ZZZ') {
    const steps = this._steps;
    const maxSteps = steps.length;

    let stepNum = 0;
    let from = start;

    while (from && from !== end) {
      const node = this.find(from);
      if (!node) return 0;
      from = node[this._steps[stepNum % maxSteps]];
      stepNum++;
    }
    return stepNum;
  }

  /** @type {(key: string, nodes?: WastelandNode[]) => WastelandNode[]} */
  getAllEndsWith(key, nodes) {
    return (nodes ?? this.nodes()).filter(
      ({ value }) => key === value[value.length - 1]
    );
  }

  /** @type {(nodes: WastelandNode[], key: string) => boolean} */
  checkAllEndsWith(nodes, key) {
    return nodes.every(
      node => node?.value && key === node.value[node.value.length - 1]
    );
  }

  /** @type {(nodes: WastelandNode[], direction: LeftRight) => WastelandNode[]} */
  step(nodes, direction) {
    const endsWith = [];
    const newNodes = nodes.map((node, i) => {
      const n = this.find(node[direction]);
      if (n.value.endsWith('Z')) endsWith.push(n);
      node.index = i;
      return n;
    });
    return {
      newNodes,
      endsWith
    };
  }

  walkNodes(start = 'A', end = 'Z') {
    const originalNodes = this.getAllEndsWith(start);
    let nodes = [...originalNodes];

    const occ = new Map();

    for (let i = 0; ; i++) {
      if (occ.size === nodes.length) return [...occ.values()];

      const direction = this.getStep(i);
      const { newNodes, endsWith } = this.step(nodes, direction);

      nodes = newNodes;

      if (endsWith.length) {
        const nodeIndex = nodes.findIndex(n =>
          endsWith.some(v => v.value === n.value)
        );
        const key = originalNodes[nodeIndex].value;

        endsWith.forEach(v => {
          !occ.has(key) &&
            occ.set(key, { start: key, end: v.value, steps: i + 1 });
        });
      }
    }
  }

  findIntersection(nums) {
    const max = Math.max(...nums);
    let n = max;
    while (!nums.every(v => !(n % v))) {
      n += max;
    }
    return n;
  }

  countConcurrentSteps() {
    const nodeInfo = this.walkNodes();
    return this.findIntersection(nodeInfo.map(v => v.steps));
  }
}

/** @returns {Promise<HauntedWasteland>} */
const getParsedData = async (file = 'data.txt') => {
  const data = await fs.readFile(path.resolve(__dirname, file), 'utf8');
  const [steps, ...lines] = data.split(/\r?\n/);

  const wasteland = lines.reduce((root, line) => {
    if (!line) return root;
    const [k, v] = line.split('=').map(v => v.trim());
    const [l, r] = v.replaceAll(/[^A-Z0-9 ]/gi, '').split(' ');
    return root.create(k, l, r);
  }, new HauntedWasteland(steps));

  return wasteland;
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
  const intersectStep = wasteland.countConcurrentSteps();

  testLog(
    intersectStep,
    18024643846273
  )(`(Example #3) Expect: ${intersectStep} to equal ${18024643846273}`);

  //* Example 3
  const wastelandEx3 = await getParsedData('example3.txt');
  const stepIntersectEx3 = wastelandEx3.countConcurrentSteps();
  testLog(
    stepIntersectEx3,
    6
  )(`(Example #3) Expect: ${stepIntersectEx3} to equal ${6}`);

  // console.log(wastelandEx3.countConcurrentSteps());
  console.log(
    time
      .time()
      .format('Complete in {hours} Hours {minutes} Minutes {seconds} Seconds')
  );
};

//* Prompt #1: 18727
//* Prompt #2: 18024643846273 // 36.43 Seconds

module.exports = day08;
