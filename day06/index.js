const fs = require('fs/promises');
const path = require('path');

/** @returns {Promise<string[]>} */
const getParsedData = async (file = 'data.txt') => {
  const data = await fs.readFile(path.resolve(__dirname, file), 'utf8');
  const { time, distance } = data.split(/\r?\n/).reduce((acc, line) => {
    const [keyStr, numStr] = line.split(':');
    const key = keyStr.toLowerCase().trim();
    const nums = [...numStr.matchAll(/\d+/g)].map(([n]) => parseInt(n.trim()));
    acc[key] = nums;
    return acc;
  }, {});

  const boatRaceTimes = time.map((t, i) => ({
    time: t,
    distance: distance[i]
  }));

  const fullTime = {
    time: parseInt(time.join('')),
    distance: parseInt(distance.join(''))
  };

  return { boatRaceTimes, fullTime };
};

/**
 *
 * @param {number} hold Duration to hold
 * @param {number} time Time in race
 * @param {number} targetDistance Distance to win
 */
const attemptRace = (hold, time, targetDistance) => {
  const actualTime = time - hold;
  const distance = actualTime * hold;
  return {
    win: distance > targetDistance,
    distance,
    time,
    hold
  };
};

/**
 * @param {{
 * time: number;
 * distance: number;
 * }} boatRace
 */
const runRaces = boatRace => {
  const { time, distance } = boatRace;
  const races = [];
  for (let i = 0; i <= time; i++) {
    const race = attemptRace(i, time, distance);
    race.win && races.push(race);
  }
  return races.length;
};

const day06 = async () => {
  const startTime = Date.now();
  const { boatRaceTimes, fullTime } = await getParsedData('data.txt');

  const allWinCounts = boatRaceTimes.map(race => runRaces(race));
  const margin = allWinCounts.reduce((p, n) => p * n, 1);

  const winCount = runRaces(fullTime);

  console.log('[Prompt #1] Margin of Error:', margin);
  console.log('[Prompt #2] Races Won:', winCount);
  console.log(
    '\nCompleted in:',
    Number(((Date.now() - startTime) / 1000).toFixed(3)),
    'seconds\n'
  );
};

//* #1: 1108800
//* #2: 36919753
module.exports = day06;
