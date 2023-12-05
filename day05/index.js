const fs = require('fs/promises');
const path = require('path');

const swappingWords = [{ original: 'temperature', swap: 'temp' }];

/**
 * @param {string} str
 * @returns {string}
 */
const swapWords = str => {
  return swappingWords.reduce((newWord, { original, swap }) => {
    return newWord.replaceAll(original, swap);
  }, str);
};

const categoryList = [
  'seeds',
  'seed-to-soil',
  'soil-to-fertilizer',
  'fertilizer-to-water',
  'water-to-light',
  'light-to-temperature',
  'temperature-to-humidity',
  'humidity-to-location'
];

/**
 * @param {string} str
 * @returns { string[] }
 */
const getKey = str => {
  return categoryList.reduce(
    (keyFound, key) => (keyFound ? keyFound : str.includes(key) ? key : null),
    null
  );
};

/**
 * @param {string} str
 * @returns {number[]}
 */
const lineToNums = str =>
  str
    .split(' ')
    .filter(Boolean)
    .map(v => parseInt(v));

/**
 * @param {string} str
 * @returns {string}
 */
const toCamelCase = str => {
  return swapWords(str)
    .split('-')
    .map((v, i) => (!i ? v : v[0].toUpperCase() + v.slice(1).toLowerCase()))
    .join('');
};

/**
 * @typedef {{
 * start: number;
 * end: number;
 * range: number
 * }} SeedRange
 */

/**
 * @param {number[]} seeds
 * @returns {SeedRange[]}
 */
const getSeedRanges = seeds => {
  const seedRanges = [];
  for (let a = 0, b = 1; b < seeds.length; a += 2, b += 2) {
    const [seedStart, seedRange] = [seeds[a], seeds[b]];
    seedRanges.push({
      start: seedStart,
      end: seedStart + (seedRange - 1),
      range: seedRange
    });
  }
  return seedRanges;
};

/** @typedef {Record<number, number>} NumMap */
/**
 * @typedef {{
 * srcStart: number;
 * srcEnd: number;
 * destStart: number;
 * destEnd: number;
 * range: number
 * }} Category
 */

/**
 * @typedef {{
 *   seeds: number[];
 *   seedRanges: SeedRange[];
 *   seedToSoil: Category[];
 *   soilToFertilizer: Category[];
 *   fertilizerToWater: Category[];
 *   waterToLight: Category[];
 *   lightToTemp: Category[];
 *   tempToHumidity: Category[];
 *   humidityToLocation: Category[];
 * }} Categories
 */
/** @returns {Promise<Categories>} */
const getParsedData = async (file = 'data.txt') => {
  const data = await fs.readFile(path.resolve(__dirname, file), 'utf8');

  /** @type {Categories} */
  const categories = {};

  let currentKey = '';

  data.split(/\r?\n/).forEach(line => {
    const key = getKey(line);

    if (key) {
      if (key === 'seeds') {
        const seeds = lineToNums(line.split(':').pop());
        categories.seeds = seeds;
        categories.seedRanges = getSeedRanges(seeds);
        return;
      }
      currentKey = toCamelCase(key);

      return;
    }
    const nums = lineToNums(line);
    if (!currentKey || !nums.length) return;

    categories[currentKey] = categories[currentKey] ?? [];

    const [destStart, srcStart, range] = lineToNums(line);

    categories[currentKey].push({
      srcStart,
      srcEnd: srcStart + (range - 1),
      destStart,
      destEnd: destStart + (range - 1),
      range
    });
  });
  return categories;
};

/**
 * @param {number} seedNum
 * @param {Categories} categories
 */
const seedToLocation = (seedNum, categories) => {
  /* Seed => Soil => fertilizer => water => light => temp => humidity => location */

  /**
   * @param {keyof Categories} key
   * @param {number} num
   * @returns
   */
  const translate = (key, num) => {
    const cat = categories[key];
    if (!cat) return num ?? 0;
    const foundCat = cat.find(
      ({ srcStart, srcEnd }) => srcStart <= num && num <= srcEnd
    );
    if (!foundCat) return num ?? 0;

    const offset = num - foundCat.srcStart;
    return foundCat.destStart + offset ?? num ?? 0;
  };

  const soil = translate('seedToSoil', seedNum);
  const fertilizer = translate('soilToFertilizer', soil);
  const water = translate('fertilizerToWater', fertilizer);
  const light = translate('waterToLight', water);
  const temp = translate('lightToTemp', light);
  const humidity = translate('tempToHumidity', temp);
  const location = translate('humidityToLocation', humidity);

  return location;
};

const day05 = async () => {
  const startTime = Date.now();
  const categories = await getParsedData('data.txt');

  const locations = Math.min(
    ...categories.seeds.map(seedNum => seedToLocation(seedNum, categories))
  );

  /** @type {number} */
  let smallestLocNum;

  categories.seedRanges.forEach(({ start, end }) => {
    console.log(`Start checking seed range: ${start} - ${end}`);
    for (let i = start; i <= end; i++) {
      const loc = seedToLocation(i, categories);
      if (!smallestLocNum || loc < smallestLocNum) {
        smallestLocNum = loc;
      }
    }
    console.log(
      `Completed range: ${start} - ${end}`
    );
    console.log('Current Lowest Number:', smallestLocNum);
  });

  console.log('\n[Prompt #1] Lowest Location:', locations);
  console.log('[Prompt #2] Lowest Location: ', smallestLocNum);

  console.log(`\nCompleted in: ${((Date.now() - startTime) / 1000).toFixed(3)} seconds\n`);
};

//* #1: 340994526 // Completed in 0.006 Seconds
//* #2: 52210644  // Completed in 386 Seconds

module.exports = day05;
