const fs = require('fs/promises');
const path = require('path');

/** @returns {Promise<number[][]>} */
const getParsedData = async (file = 'data.txt') => {
  const data = await fs.readFile(path.resolve(__dirname, file), 'utf8');
  return data.split(/\r?\n/).map(v => v.split(' ').map(n => parseInt(n)));
};

/** @param {number[]} lines */
const calcHistoryEnd = line => {
  const newRows = [line];
  let newLine = [];

  for (let i = 0; i < newRows.length; i++) {
    newLine = [];
    const newLen = newRows[i].length;
    for (let a = newLen - 1, b = newLen - 2; b >= 0; a--, b--) {
      newLine.push(newRows[i][a] - newRows[i][b]);
    }

    newRows.push(newLine.reverse());

    if (newLine.every(val => val === 0)) {
      return newRows.reduce((total, row) => (total += row[row.length - 1]), 0);
    }
  }
};

/** @param {number[]} lines */
const calcHistoryStart = line => {
  const newRows = [line];
  let newLine = [];

  for (let i = 0; i < newRows.length; i++) {
    newLine = [];
    const newLen = newRows[i].length;
    for (let a = 0, b = 1; b < newLen; a++, b++) {
      newLine.push(newRows[i][a] - newRows[i][b]);
    }

    newRows.push(newLine);

    if (newLine.every(val => val === 0)) {
      return newRows.reduce((total, row) => (total += row[0]), 0);
    }
  }
};

const day09 = async () => {
  const lines = await getParsedData('data.txt');
  const historyEnd = lines
    .map(calcHistoryEnd)
    .reduce((total, val) => (total += val), 0);

  console.log('Total End:', historyEnd);

  const historyStart = lines
    .map(calcHistoryStart)
    .reduce((total, val) => (total += val), 0);
  console.log('Total Start:', historyStart);
};

//* Part #1 => 2101499000
//* Part #2 => 1089

module.exports = day09;
