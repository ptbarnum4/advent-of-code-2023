const fs = require('fs/promises');
const path = require('path');

const { testLog, spacerLog } = require('../helpers/testing');

/** @type { Record<number | string, string> } */
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

/** @type { Record<number | string, string> } */
const CARD_TO_ALPHA_ALT = { ...CARD_TO_ALPHA, J: '@' };

/** @typedef { (typeof CARD_TO_ALPHA) & (typeof CARD_TO_ALPHA_ALT)} CardToAlpha */
/** @typedef {keyof CardToAlpha} CardKey */
/** @typedef {  CardToAlpha[CardKey]} AlphaKey */

/** @param {string} str */
const cardsToAlpha = str => {
  let alpha = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    alpha += CARD_TO_ALPHA[ch] ?? '';
  }
  return alpha;
};

/** @param {string} str */
const cardsToAlphaAlt = str => {
  let alpha = '';
  for (let i = 0; i < str.length; i++) {
    alpha += CARD_TO_ALPHA_ALT[str[i]] ?? '';
  }
  return alpha;
};

/**
 * @param {string} hand
 * @param {string | undefined} originalHand
 * @returns {{
 *   power: number;
 *   highCard: string;
 *   combos: Record<string, number>,
 *   altHand: string;
 *   originalHand: string;
 *  }}
 */
const evalHand = (hand, originalHand = undefined) => {
  /** @type {Record<string, number>} */
  const combos = {};
  let highCard = '';
  let maxCount = 0;

  let power = 0;

  hand
    .split('')
    // .map(ch => {})
    .forEach((card, pos) => {
      /** @param {number} c */
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

  const entries = Object.entries(combos).sort(([, a], [, b]) => b - a);

  // Extra check for full house
  if (entries.length === 2) {
    if ([2, 3].includes(entries[0][1])) {
      power = 4;
    }
  }

  if (hand.includes('@')) {
    if (maxCount === 1) {
      return evalHand(hand.replaceAll('@', highCard), hand);
    }

    for (let i = 0; i < entries.length; i++) {
      const [k] = entries[i];

      if (k && k !== '@') {
        return evalHand(hand.replaceAll('@', k), hand);
      }
    }
  }

  return {
    power,
    highCard,
    combos,
    altHand: hand,
    originalHand: originalHand ?? hand
  };
};

/**
 *
 * @param {string} cards1 Alpha card set ex. 'AD@BC'
 * @param {string} cards2 Alpha card set ex. 'MCK@L'
 * @returns {-1|0|1}
 */
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

const getParsedData = async (file = 'data.txt') => {
  const data = await fs.readFile(path.resolve(__dirname, file), 'utf8');
  return data.split(/\r?\n/).map(line => {
    const [cards, bidStr] = line.split(' ').map(v => v.trim());

    const alphaCards = cardsToAlpha(cards);
    const alphaCardsAlt = cardsToAlphaAlt(cards);
    const reg = evalHand(alphaCards);
    const alt = evalHand(alphaCardsAlt);
    const bid = parseInt(bidStr);

    return { ...reg, alphaCards, alphaCardsAlt, alt, bid };
  });
};

/** @param {Awaited<ReturnType<typeof getParsedData>>} cards */
const sortByRank = cards => {
  return [...cards]
    .sort((a, b) => {
      if (a.power < b.power) return -1;
      if (a.power > b.power) return 1;
      return sortNextHighest(a.alphaCards, b.alphaCards);
    })
    .map((v, i) => ({ ...v, rank: i + 1 }));
};
/** @param {Awaited<ReturnType<typeof getParsedData>>} cards */
const sortByWild = cards => {
  return [...cards]
    .sort((a, b) => {
      if (a.alt.power < b.alt.power) return -1;
      if (a.alt.power > b.alt.power) return 1;
      return sortNextHighest(a.alphaCardsAlt, b.alphaCardsAlt);
    })
    .map((v, i) => ({ rank: i + 1, bid: v.bid }));
};

/** @param {string} filename */
const camelCards = async (filename = 'data.txt') => {
  /**
   * @param {{rank: number; bid: number; }[]} hands
   * @returns {number}
   */
  const calcTotal = hands => {
    return hands.reduce((total, { rank, bid }) => total + rank * bid, 0);
  };

  const data = await getParsedData(filename);

  const normalRank = sortByRank(data);
  const wildRank = sortByWild(data);

  return {
    bidTotal: calcTotal(normalRank),
    wildBidTotal: calcTotal(wildRank)
  };
};

/**
 * @param {number} expected1
 * @param {number} expected2
 * @param {ReturnType<typeof camelCards>} awaitable
 * @param {string} name
 */
const log = async (expected1, expected2, awaitable, name = '') => {
  const { bidTotal, wildBidTotal } = await awaitable;
  name && spacerLog(`Start ${name}`);
  testLog(bidTotal, expected1)(`Expect: ${expected1} [Prompt #1]`);
  testLog(wildBidTotal, expected2)(`Expect: ${expected2} [Prompt #2]`);
  name && spacerLog(`End ${name}`);
};

const day07 = async () => {
  log(6440, 5905, camelCards('example.txt'), 'Example');
  log(250254244, 250087440, camelCards('data.txt'), 'Solution');
};

module.exports = day07;
//* #1: 250254244
//* #2: 250087440
