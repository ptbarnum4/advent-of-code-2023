const fs = require('fs/promises');
const path = require('path');

/**
 * @typedef {{
 * cardNum: number;
 * winning: number[];
 * nums: number[];
 * winCount: number;
 * points: number;
 * totalCards: number;
 * }} Ticket
 */

const splitNums = str => {
  return new Set(
    str
      .split(' ')
      .filter(Boolean)
      .map(v => parseInt(v))
  );
};

/**
 * @returns {Promise<Ticket[]>}
 */
const getParsedData = async (file = 'data.txt') => {
  const data = await fs.readFile(path.resolve(__dirname, file), 'utf8');

  return data.split(/\r?\n/).flatMap(line => {
    const [cardNameNum, losingWinning] = line.split(': ');
    const cardNum = parseInt(cardNameNum.match(/\d+/g)?.[0]);
    const [winningStr, numsStr] = losingWinning.split('|');

    const winning = splitNums(winningStr);
    const nums = splitNums(numsStr);

    let winCount = 0;
    let points = 0;

    winning.forEach(val => {
      if (nums.has(val)) {
        winCount++;
        points = points ? points * 2 : 1;
      }
    });

    const card = {
      cardNum,
      winning,
      nums,
      winCount,
      points,
      totalCards: 1
    };

    return card;
  });
};

/**
 *
 * @param {Ticket[]} cards
 */
const countCards = cards => {
  const increase = (index, count) => {
    for (let i = index; i < index + count; i++) {
      cards[i].totalCards += 1;
    }
  };
  cards.forEach((card, i) => {
    if (card.winCount) {
      new Array(card.totalCards)
        .fill('0')
        .forEach(() => increase(i + 1, card.winCount));
    }
  });
};

const day04 = async () => {
  const cards = await getParsedData('data.txt');
  const totalPoints = cards.reduce((total, card) => card.points + total, 0);

  console.log('Total Points:', totalPoints);

  countCards(cards);

  const totalCards = cards.reduce((total, card) => card.totalCards + total, 0);
  console.log('Total Cards:', totalCards);
};

//* #1: 21485
//* #2: 11024379

module.exports = day04;
