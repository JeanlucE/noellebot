'use strict';

const { describe, it, mock } = require('node:test');
const assert = require('node:assert/strict');
const { parseMessage, handleMessage, MIN_CODE_LENGTH, hasEmoji } = require('../src/handler');

describe('parseMessage', () => {
  it('returns words for a single code', () => {
    assert.deepEqual(parseMessage('GENSHINGIFT'), ['GENSHINGIFT']);
  });

  it('returns words for multiple codes', () => {
    assert.deepEqual(parseMessage('GENSHINGIFT\nABCD1234567\nNOELLE2026'), ['GENSHINGIFT', 'ABCD1234567', 'NOELLE2026']);
  });

  it('filters empty lines', () => {
    assert.deepEqual(parseMessage('GENSHINGIFT\n\nABCD1234567'), ['GENSHINGIFT', 'ABCD1234567']);
  });

  it('trims whitespace', () => {
    assert.deepEqual(parseMessage('  GENSHINGIFT  \n  ABCD1234567  '), ['GENSHINGIFT', 'ABCD1234567']);
  });

  it('returns null for sentences', () => {
    assert.equal(parseMessage('hello world'), null);
  });

  it('returns null for mixed content', () => {
    assert.equal(parseMessage('GENSHINGIFT\nhello world'), null);
  });

  it('returns null when any line is below minimum length', () => {
    assert.equal(parseMessage('SHORT\nGENSHINGIFT'), null);
  });

  it('ignores lines with emoji and keeps valid lines', () => {
    assert.deepEqual(parseMessage('GENSHINGIFT\nABCD1234567🎉\nNOELLE2026'), ['GENSHINGIFT', 'NOELLE2026']);
  });

  it('returns null when all lines are removed by emoji filter', () => {
    assert.equal(parseMessage('🎉\n😀'), null);
  });

  it('returns null for empty string', () => {
    assert.equal(parseMessage(''), null);
  });
});

describe('helpers', () => {
  it('exports minimum code length as 9', () => {
    assert.equal(MIN_CODE_LENGTH, 9);
  });

  it('detects unicode and custom discord emoji', () => {
    assert.equal(hasEmoji('CODE🎉'), true);
    assert.equal(hasEmoji('<:smile:123456789012345678>'), true);
    assert.equal(hasEmoji('GENSHINGIFT'), false);
  });
});

describe('handleMessage', () => {
  const config = { guildId: '111', channelId: '222' };

  function createMockMessage(overrides = {}) {
    return {
      id: '999',
      author: { bot: false },
      guild: { id: '111' },
      channel: { id: '222', send: mock.fn(async () => ({})) },
      content: 'GENSHINGIFT\nABCD1234567',
      ...overrides,
    };
  }

  it('ignores bot messages', async () => {
    const msg = createMockMessage({ author: { bot: true } });
    await handleMessage(msg, config);
    assert.equal(msg.channel.send.mock.callCount(), 0);
  });

  it('ignores wrong guild', async () => {
    const msg = createMockMessage({ guild: { id: 'wrong' } });
    await handleMessage(msg, config);
    assert.equal(msg.channel.send.mock.callCount(), 0);
  });

  it('ignores wrong channel', async () => {
    const msg = createMockMessage({ channel: { id: 'wrong', send: mock.fn() } });
    await handleMessage(msg, config);
    assert.equal(msg.channel.send.mock.callCount(), 0);
  });

  it('ignores sentences', async () => {
    const msg = createMockMessage({ content: 'hello world' });
    await handleMessage(msg, config);
    assert.equal(msg.channel.send.mock.callCount(), 0);
  });

  it('ignores messages with only URLs', async () => {
    const msg = createMockMessage({ content: 'https://example.com' });
    await handleMessage(msg, config);
    assert.equal(msg.channel.send.mock.callCount(), 0);
  });

  it('sends embed for valid codes', async () => {
    const msg = createMockMessage({ content: 'GENSHINGIFT\nABCD1234567' });
    await handleMessage(msg, config);
    assert.equal(msg.channel.send.mock.callCount(), 1);

    const call = msg.channel.send.mock.calls[0];
    assert.ok(call.arguments[0].embeds);
    assert.equal(call.arguments[0].embeds.length, 1);
  });

  it('falls back to plain text on embed failure', async () => {
    let callCount = 0;
    const sendFn = mock.fn(async (_arg) => {
      callCount++;
      if (callCount === 1) {throw new Error('Missing permissions');}
      return {};
    });
    const msg = createMockMessage({
      content: 'GENSHINGIFT',
      channel: { id: '222', send: sendFn },
    });
    await handleMessage(msg, config);
    assert.equal(sendFn.mock.callCount(), 2);
  });

  it('ignores messages that contain too-short lines', async () => {
    const msg = createMockMessage({ content: 'SHORT\nGENSHINGIFT' });
    await handleMessage(msg, config);
    assert.equal(msg.channel.send.mock.callCount(), 0);
  });

  it('ignores emoji lines and still sends for remaining valid lines', async () => {
    const msg = createMockMessage({ content: 'GENSHINGIFT\nABCD1234567🎉\nNOELLE2026' });
    await handleMessage(msg, config);
    assert.equal(msg.channel.send.mock.callCount(), 1);
  });
});
