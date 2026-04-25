'use strict';

const { formatCodeLinks, buildEmbed } = require('./formatter');

/**
 * Parses a message's content to extract single-word-per-line codes.
 * Returns an array of words if every non-empty line is a single word,
 * or null if the message does not qualify.
 * @param {string} content
 * @returns {string[] | null}
 */
function parseMessage(content) {
  const lines = content.split('\n').map((line) => line.trim()).filter((line) => line.length > 0);

  if (lines.length === 0) {
    return null;
  }

  for (const line of lines) {
    if (line.includes(' ')) {
      return null;
    }
  }

  return lines;
}

/**
 * Handles an incoming Discord message.
 * @param {import('discord.js').Message} message
 * @param {{ guildId: string, channelId: string }} config
 * @returns {Promise<void>}
 */
async function handleMessage(message, config) {
  // Guard: ignore bots
  if (message.author.bot) {return;}

  // Guard: wrong guild
  if (message.guild?.id !== config.guildId) {return;}

  // Guard: wrong channel
  if (message.channel.id !== config.channelId) {return;}

  const words = parseMessage(message.content);
  if (!words) {return;}

  const links = formatCodeLinks(words);
  if (links.length === 0) {return;}

  const embed = buildEmbed(links);

  try {
    await message.channel.send({ embeds: [embed] });
    console.log(`[NoelleBot] Sent ${links.length} redemption link(s) in response to message ${message.id}`);
  } catch (err) {
    console.error('[NoelleBot] Failed to send embed:', err.message);

    // Plain text fallback
    try {
      const fallback = links.map((link) => `🎁 ${link}`).join('\n');
      await message.channel.send(`✨ Here are your redemption links, Traveler!\n\n${fallback}`);
      console.log('[NoelleBot] Sent plain text fallback');
    } catch (fallbackErr) {
      console.error('[NoelleBot] Failed to send fallback:', fallbackErr.message);
    }
  }
}

module.exports = {
  parseMessage,
  handleMessage,
};
