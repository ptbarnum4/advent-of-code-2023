const fs = require('fs/promises');
const path = require('path');

/** @returns {Promise<number[][]>} */
const getParsedData = async (file = 'data.txt') => {
  const data = await fs.readFile(path.resolve(__dirname, file), 'utf8');
  return data.split(/\r?\n/).map(v => v.split(' ').map(n => parseInt(n)));
};

/** @param {number[]} lines */
const calcHistory = line => {
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

const day09 = async () => {
  const lines = await getParsedData('data.txt');
  const history = lines
    .map(calcHistory)
    .reduce((total, val) => (total += val), 0);

  console.log('Total:', history);
};

//* Part #1 => 2101499000

module.exports = day09;
