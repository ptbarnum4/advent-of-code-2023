const fs = require('fs/promises');
const path = require('path');

/**
 * @typedef {{
 * num: number;
 * rowIndex: number;
 * colStart: number;
 * colEnd: number;
 * prevLine: string;
 * currLine: string;
 * nextLine: string;
 * symbols: string;
 * line: string;
 * isPartNum: boolean;
 * }} NumBlock;
 */

/**
 * @typedef {{
 * row: number;
 * col: number;
 * blocks: NumBlock[]
 * isGear: boolean;
 * }} Gear
 */

/**
 * @param {string[]} lines
 * @returns {{
 *  numBlocks: NumBlock[]
 *  gears: Gear[]
 * } }
 */
const parseData = lines => {
  const maxRows = lines.length;

  /**
   * @type {Map<string, Gear>}
   */
  const gears = new Map();

  const numBlocks = lines.flatMap((line, rowIndex) => {
    const lineMatches = line.matchAll(/\d+/g);
    const surrounding = [];
    const width = line.length;

    for (const numMatch of lineMatches) {
      const num = numMatch[0];
      const index = numMatch.index;
      const endIndex = index + num.length;
      const prevRowIndex = rowIndex - 1;
      const nextRowIndex = rowIndex + 1;
      const leftIndex = index < 1 ? 0 : index - 1;
      const rightIndex = endIndex >= width - 1 ? width : endIndex + 1;

      const prevLine =
        prevRowIndex < 0
          ? ''
          : lines[prevRowIndex]
              .slice(leftIndex, rightIndex)
              .replaceAll('.', ' ');

      const currLine = line.slice(leftIndex, rightIndex).replaceAll('.', ' ');

      const nextLine =
        nextRowIndex >= maxRows - 1
          ? ''
          : lines[nextRowIndex]
              .slice(leftIndex, rightIndex)
              .replaceAll('.', ' ');

      const symbols =
        prevLine.replaceAll(/[0-9 ]/g, '') +
        currLine.replaceAll(/[0-9 ]/g, '') +
        nextLine.replaceAll(/[0-9 ]/g, '');

      const numBlock = {
        num: parseInt(num),
        rowIndex,
        colStart: index,
        colEnd: endIndex,
        prevLine: prevLine.replaceAll('.', ' '),
        currLine: currLine.replaceAll('.', ' '),
        nextLine: nextLine.replaceAll('.', ' '),
        symbols,
        isPartNum: !!symbols.length,
        line
      };

      if (symbols.includes('*')) {
        const s1 = prevLine.indexOf('*');
        const s2 = currLine.indexOf('*');
        const s3 = nextLine.indexOf('*');

        if (s1 >= 0) {
          const ri = leftIndex + s1;
          const gearKey = `R${ri}_C${prevRowIndex}`;
          const currentGear = gears.get(gearKey) || {
            row: prevRowIndex,
            col: ri,
            blocks: [],
            isGear: false
          };
          currentGear.blocks.push(numBlock);
          currentGear.isGear = currentGear.blocks.length > 1;
          gears.set(gearKey, currentGear);
        }
        if (s2 >= 0) {
          const ri = leftIndex + s2;
          const gearKey = `R${ri}_C${rowIndex}`;
          const currentGear = gears.get(gearKey) || {
            row: rowIndex,
            col: ri,
            blocks: [],
            isGear: false
          };
          currentGear.blocks.push(numBlock);
          currentGear.isGear = currentGear.blocks.length > 1;
          gears.set(gearKey, currentGear);
        }
        if (s3 >= 0) {
          const ri = leftIndex + s3;
          const gearKey = `R${ri}_C${nextRowIndex}`;
          const currentGear = gears.get(gearKey) || {
            row: nextRowIndex,
            col: ri,
            blocks: [],
            isGear: false
          };
          currentGear.blocks.push(numBlock);
          currentGear.isGear = currentGear.blocks.length > 1;

          gears.set(gearKey, currentGear);
        }
      }

      surrounding.push(numBlock);
    }
    return surrounding;
  });
  return {
    numBlocks,
    gears: [...gears.values()]
  };
};

/** @returns {Promise<ReturnType<typeof parseData>>} */
const getParsedData = async (file = 'data.txt') => {
  const data = await fs.readFile(path.resolve(__dirname, file), 'utf8');
  return parseData(data.split(/\r?\n/));
};

const day03 = async () => {
  const { numBlocks, gears } = await getParsedData('data.txt');

  const partNumberSum = numBlocks.reduce(
    (total, v) => (!v.isPartNum ? total : total + v.num),
    0
  );

  const gearRatioSum = gears.reduce((total, { blocks, isGear }) => {
    if (!isGear) return total;
    const nums = blocks.reduce((t, { num }) => t * num, 1);

    return total + nums;
  }, 0);
  console.log(gears.flatMap(({ blocks, isGear }) => ({ isGear, blocks })));
  console.log('1. Part Number Sum:', partNumberSum);
  console.log('2. Gear Ratio Sum:', gearRatioSum);
};

//* #1: 543867
//* #2: 79613331
module.exports = day03;
