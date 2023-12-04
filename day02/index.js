const fs = require('fs/promises');
const path = require('path');

/**
 * @returns {Promise<{
 * gameId: string;
 * game: number;
 * cubes:  Record<'green'|'blue'|'red', number>
 * rounds: Record<'green'|'blue'|'red', number>[]
 * roundMax: Record<'green'|'blue'|'red', number>,
 * roundMin: Record<'green'|'blue'|'red', number>,
 * minPow: number,
 * maxPow: number
 * }[]>}
 */
const getParsedData = async (file = 'data.txt') => {
  const data = await fs.readFile(path.resolve(__dirname, file), 'utf8');
  const lines = data.split(/\r?\n/);

  return lines.map(line => {
    const [gameId, roundsStr] = line.split(':').map(v => v.trim());

    const rounds = roundsStr.split(';').map(v =>
      v
        .trim()
        .split(', ')
        .reduce(
          (cubes, c) => {
            const [n, color] = c.split(' ').map(v => v.trim());
            return { ...cubes, [color]: parseInt(n) };
          },
          { red: 0, green: 0, blue: 0 }
        )
    );
    const cubes = rounds.reduce(
      (cubeSum, round) => {
        return {
          red: cubeSum.red + round.red,
          green: cubeSum.green + round.green,
          blue: cubeSum.blue + round.blue
        };
      },
      { red: 0, green: 0, blue: 0 }
    );
    const roundMax = rounds.reduce(
      (cubeSum, round) => {
        return {
          red: Math.max(cubeSum.red, round.red),
          green: Math.max(cubeSum.green, round.green),
          blue: Math.max(cubeSum.blue, round.blue)
        };
      },
      { red: 0, green: 0, blue: 0 }
    );
    const roundMin = rounds.slice(1).reduce((cubeSum, round) => {
      return {
        red: Math.min(cubeSum.red, round.red),
        green: Math.min(cubeSum.green, round.green),
        blue: Math.min(cubeSum.blue, round.blue)
      };
    }, rounds[0]);

    return {
      gameId,
      game: parseInt(gameId.split(' ').pop()),
      rounds,
      totalRounds: rounds.length,
      cubes,
      roundMax,
      roundMin,
      minPow:
        (roundMin.red || 1) * (roundMin.green || 1) * (roundMin.blue || 1),
      maxPow: (roundMax.red || 1) * (roundMax.green || 1) * (roundMax.blue || 1)
    };
  });
};

const day02 = async () => {
  const colors = ['red', 'green', 'blue'];
  const cubeLimit = {
    red: 12,
    green: 13,
    blue: 14
  };
  const games = await getParsedData();

  const gamesInRangeMax = games.filter(game => {
    for (const color of colors) {
      if (game.roundMax[color] > cubeLimit[color]) return false;
    }
    return true;
  });
  const maxGameIdSum = gamesInRangeMax.reduce((t, { game }) => t + game, 0);
  const maxGamePowSum = games.reduce((t, { maxPow }) => t + maxPow, 0);

  console.log(`Sum of games in range: ${maxGameIdSum}`);
  console.log(`Sum of MinNeededRgbInRound(R*G*B): ${maxGamePowSum}`);
};

//* #1: 2239
//* #2: 83435

module.exports = day02;
