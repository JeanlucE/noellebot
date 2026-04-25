'use strict';

const NOELLE_COLOR = 0x80C0A0;

const TITLE = '✨ Noelle\'s Redemption Service!';

const GIFT_URL_BASE = 'https://genshin.hoyoverse.com/en/gift?code=';

const GREETINGS = [
  'Welcome back, Traveler! Noelle has prepared your redemption links. Please help yourself! 🧹',
  'Oh, Traveler! I took the liberty of tidying up these codes for you! 🧹',
  'Good day, Traveler! I\'ve organized your gift codes. It\'s the least I can do! ✨',
  'Traveler! Please allow me to assist you with these codes! 💪',
  'Right away, Traveler! Here are your redemption links, freshly prepared! 🍪',
];

const FOOTERS = [
  'As a maid of the Knights of Favonius, it\'s my duty to be of service! 💚',
  'If there\'s anything else you need, please don\'t hesitate to ask! 💚',
  'I hope these are helpful! I\'ll keep doing my best! 💚',
  'No task is too big or too small for Noelle! 💚',
  'Maid of all work, at your service! 💚',
];

/**
 * Returns a random element from an array.
 * @param {Array} arr
 * @returns {*}
 */
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

module.exports = {
  NOELLE_COLOR,
  TITLE,
  GIFT_URL_BASE,
  GREETINGS,
  FOOTERS,
  pickRandom,
};
