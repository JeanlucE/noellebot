'use strict';

const { describe, it, mock } = require('node:test');
const assert = require('node:assert/strict');
const { parseMessage, handleMessage } = require('../src/handler');

describe('parseMessage', () => {
  it('returns words for a single code', () => {
    assert.deepEqual(parseMessage('GENSHINGIFT'), ['GENSHINGIFT']);
  });

  it('returns words for multiple codes', () => {
    assert.deepEqual(parseMessage('ABC\nDEF\nGHI'), ['ABC', 'DEF', 'GHI']);
  });

  it('filters empty lines', () => {
    assert.deepEqual(parseMessage('ABC\n\nDEF'), ['ABC', 'DEF']);
  });

  it('trims whitespace', () => {
    assert.deepEqual(parseMessage('  ABC  \n  DEF  '), ['ABC', 'DEF']);
  });

  it('returns null for sentences', () => {
    assert.equal(parseMessage('hello world'), null);
  });

  it('returns null for mixed content', () => {
    assert.equal(parseMessage('ABC\nhello world'), null);
  });

  it('returns null for empty string', () => {
    assert.equal(parseMessage(''), null);
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
      content: 'ABC\nDEF',
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
    const msg = createMockMessage({ content: 'ABC\nDEF' });
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
      content: 'ABC',
      channel: { id: '222', send: sendFn },
    });
    await handleMessage(msg, config);
    assert.equal(sendFn.mock.callCount(), 2);
  });
});
