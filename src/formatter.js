'use strict';

const { EmbedBuilder } = require('discord.js');
const { NOELLE_COLOR, TITLE, GIFT_URL_BASE, GREETINGS, FOOTERS, pickRandom } = require('./noelle');

/**
 * Checks whether a word is a URL.
 * @param {string} word
 * @returns {boolean}
 */
function isUrl(word) {
  return word.startsWith('http://') || word.startsWith('https://');
}

/**
 * Takes an array of words and returns formatted gift links,
 * skipping any words that are already URLs.
 * @param {string[]} words
 * @returns {string[]} Array of formatted gift link strings
 */
function formatCodeLinks(words) {
  return words
    .filter((word) => !isUrl(word))
    .map((word) => `${GIFT_URL_BASE}${word}`);
}

/**
 * Builds a Noelle-themed Discord embed containing the gift links.
 * @param {string[]} links - Array of formatted gift URLs
 * @returns {EmbedBuilder}
 */
function buildEmbed(links) {
  const greeting = pickRandom(GREETINGS);
  const footer = pickRandom(FOOTERS);
  const linkList = links.map((link) => `🎁 ${link}`).join('\n');

  return new EmbedBuilder()
    .setColor(NOELLE_COLOR)
    .setTitle(TITLE)
    .setDescription(`${greeting}\n\n${linkList}`)
    .setFooter({ text: footer });
}

module.exports = {
  isUrl,
  formatCodeLinks,
  buildEmbed,
};
