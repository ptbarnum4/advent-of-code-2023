const fs = require('fs/promises');
const path = require('path');

const { testLog } = require('../helpers/testing');

const POWER_TO_NAME = {
  6: 'Five of a kind',
  5: 'Four of a kind',
  4: 'Full house',
  3: 'Three of a kind',
  2: 'Two pair',
  1: 'One pair',
  0: 'High card'
};

const CARD_TO_ALPHA = {
  2: 'A',
  3: 'B',
  4: 'C',
  5: 'D',
  6: 'E',
  7: 'F',
  8: 'G',
  9: 'H',
  T: 'I',
  J: 'J',
  Q: 'K',
  K: 'L',
  A: 'M'
};
/** @param {string} str */
const cardsToAlpha = str => {
  let alpha = '';
  for (let i = 0; i < str.length; i++) {
    alpha += CARD_TO_ALPHA[str[i]] ?? '';
  }
  return alpha;
};

/** @param {string} str */
const alphaToCard = str => {
  return Object.entries(CARD_TO_ALPHA).find(([, v]) => v === str)?.[0] ?? '';
};

/**
 * @param {string} hand
 * @returns {{ power: number; highCard: string; }}
 */
const evalHand = hand => {
  const combos = {};
  let highCard = '';
  let maxCount = 0;

  let power = 0;

  hand.split('').forEach((card, pos) => {
    const incMax = c => {
      if (c > maxCount) maxCount = c;
      combos[card] = c;
    };
    if (!highCard || card > highCard) highCard = card;

    const count = (combos[card] ?? 0) + 1;

    if (count === 5) {
      power = 6;
      return incMax(count);
    }
    if (count === 4) {
      power = 5;
      return incMax(count);
    }

    // Full House | Power: 4
    const isFullHouseRight =
      highCard !== card && maxCount === 2 && count === 3 && pos === 5;
    const isFullHouseLeft = maxCount === 3 && count === 2;
    if (isFullHouseLeft || isFullHouseRight) {
      // Full House where the last card is the third card
      power = 4;
      return incMax(count);
    }

    // Three of a kind | Power: 3
    if (count === 3) {
      power = 3;
      return incMax(count);
    }

    // Two Pair | Power: 2
    if (count === 2 && maxCount === 2) {
      power = 2;
      return incMax(count);
    }

    // One Pair | Power: 1
    if (count === 2) {
      power = 1;
    }

    // High Card | Power: 0
    return incMax(count);
  });

  const entries = Object.entries(combos);

  // Extra check for full house
  if (entries.length === 2) {
    if ([2, 3].includes(entries[0][1])) {
      return { power: 4, highCard, combos };
    }
  }
  return { power, highCard, combos };
};

const sortNextHighest = (cards1, cards2) => {
  for (let i = 0; i < cards1.length; i++) {
    const c1 = cards1[i];
    const c2 = cards2[i];
    if (c1 > c2) return 1;
    if (c1 < c2) return -1;
  }
  return 0;
};

/**
 * @typedef {{
 *  cards: number[];
 *  sortedCards: number[]
 *  bid: number;
 *  power: number;
 *  rank: number;
 * }} Hand
 */

/** @returns {Promise<{string}[]>} */
const getParsedData = async (file = 'data.txt') => {
  const data = await fs.readFile(path.resolve(__dirname, file), 'utf8');
  return data
    .split(/\r?\n/)
    .map(line => {
      const [cards, bidStr] = line.split(' ').map(v => v.trim());

      const alphaCards = cardsToAlpha(cards);

      return {
        cards,
        alphaCards,
        ...evalHand(alphaCards),
        bid: parseInt(bidStr)
      };
    })
    .sort((a, b) => {
      if (a.power < b.power) {
        return -1;
      }
      if (a.power > b.power) {
        return 1;
      }

      return sortNextHighest(a.alphaCards, b.alphaCards);
    })

    .map((v, i) => ({
      name: POWER_TO_NAME[v.power],
      ...v,
      rank: i + 1,
      firstCard: v.cards[0],
      highCard: alphaToCard(v.highCard)
    }));
};

const day07 = async () => {
  const hands = await getParsedData('data.txt');
  const handsExample = await getParsedData('example.txt');
  // console.log(hands);
  const bidRankProduct = hands.reduce(
    (total, { rank, bid }) => total + rank * bid,
    0
  );
  const bidRankProductExample = handsExample.reduce(
    (total, { rank, bid }) => total + rank * bid,
    0
  );

  console.log('');
  testLog(
    bidRankProduct < 250992920 && bidRankProduct > 249685000,
    true
  )('[ 249685000 < `Rank` < 250992920 ]');

  testLog(bidRankProductExample, 6440)('Expect example to pass with `6440`');
  console.log('');
  console.log('Total (bid * rank):', bidRankProduct);
  console.log('Total (bid * rank):', bidRankProductExample);

  // Weakest: Jack => '@'
  // Strongest: Jack => 'M'
};

module.exports = day07;
//* #1: 250254244
