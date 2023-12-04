const fs = require('fs/promises');
const path = require('path');

const wordsToNumbers = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine'
];

/** @param {string} str */
const swapStrForNums = str => {
  const isN1 = !isNaN(parseInt(str[0]));
  const isN2 = !isNaN(parseInt(str[str.length - 1]));

  if (isN1 && isN2) return str;

  const oStr = wordsToNumbers.map(s => {
    const regex = new RegExp(s, 'g');
    return [...str.matchAll(regex)].flat();
  });
  // console.log(oStr.flat());

  const firstSwap = wordsToNumbers
    .map((v, n) => ({ v, i: str.indexOf(v), n }))
    .filter(v => v.i >= 0)
    .sort((a, b) => a.i - b.i)[0];

  const lastSwap = wordsToNumbers
    .map((v, n) => ({ v, i: str.lastIndexOf(v), n }))
    .filter(v => v.i >= 0)
    .sort((a, b) => b.i - a.i)[0];

  if (!firstSwap && !lastSwap) return str;

  const outStr1 = !firstSwap
    ? ''
    : `${str.slice(0, firstSwap.i)}${firstSwap.n}${str.slice(
        firstSwap.i + firstSwap.v.length,
        str.length
      )}`;

  const outStr2 = !lastSwap
    ? ''
    : `${str.slice(0, lastSwap.i)}${lastSwap.n}${str.slice(
        lastSwap.i + lastSwap.v.length,
        str.length
      )}`;

  if (!outStr1 && !outStr2) return str;

  // Combine them, we don't care because we only need first and last
  return outStr1 + outStr2;
};

/** @returns {Promise<string[]>} */
const getParsedData = async (file = 'data.txt', prompt = 1) => {
  const data = await fs.readFile(path.resolve(__dirname, file), 'utf8');
  const numGroups = data.split(/\r?\n/).map(line => {
    const l = prompt === 1 ? line : swapStrForNums(line);

    return [...l.matchAll(/\d/g)].map(match => +match[0]);
  });

  return numGroups.map(group => {
    const n1 = group?.shift() ?? 0;
    const n2 = group?.pop() ?? n1;
    return parseInt(`${n1}${n2}`);
  });
};

const day01 = async () => {
  const lines = await getParsedData('data.txt', 2);
  const sum = lines.reduce((acc, curr) => acc + curr, 0);
  console.log(sum);
};

//* #1: 55130
//* #2: 54985

module.exports = day01;
