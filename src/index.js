'use strict';

require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const { handleMessage } = require('./handler');

// Validate required env vars
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const GUILD_ID = process.env.GUILD_ID;
const CHANNEL_ID = process.env.CHANNEL_ID;

const missing = [];
if (!DISCORD_TOKEN) {missing.push('DISCORD_TOKEN');}
if (!GUILD_ID) {missing.push('GUILD_ID');}
if (!CHANNEL_ID) {missing.push('CHANNEL_ID');}

if (missing.length > 0) {
  console.error(`[NoelleBot] Missing required environment variables: ${missing.join(', ')}`);
  console.error('[NoelleBot] Copy .env.example to .env and fill in the values.');
  process.exit(1);
}

const config = { guildId: GUILD_ID, channelId: CHANNEL_ID };

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', () => {
  console.log(`[NoelleBot] Noelle is ready to serve! Logged in as ${client.user.tag}`);
  console.log(`[NoelleBot] Monitoring guild: ${GUILD_ID}, channel: ${CHANNEL_ID}`);
});

client.on('messageCreate', (message) => {
  handleMessage(message, config);
});

// Graceful shutdown
function shutdown(signal) {
  console.log(`[NoelleBot] Received ${signal}. Noelle is signing off... 💚`);
  client.destroy();
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

client.login(DISCORD_TOKEN);
