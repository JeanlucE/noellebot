'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { isUrl, formatCodeLinks, buildEmbed } = require('../src/formatter');

describe('isUrl', () => {
  it('returns true for http URLs', () => {
    assert.equal(isUrl('http://example.com'), true);
  });

  it('returns true for https URLs', () => {
    assert.equal(isUrl('https://example.com'), true);
  });

  it('returns false for plain words', () => {
    assert.equal(isUrl('GENSHINGIFT'), false);
  });

  it('returns false for words containing http in the middle', () => {
    assert.equal(isUrl('nothttp://test'), false);
  });
});

describe('formatCodeLinks', () => {
  it('formats words into gift links', () => {
    const result = formatCodeLinks(['ABC', 'DEF']);
    assert.equal(result.length, 2);
    assert.equal(result[0], 'https://genshin.hoyoverse.com/en/gift?code=ABC');
    assert.equal(result[1], 'https://genshin.hoyoverse.com/en/gift?code=DEF');
  });

  it('skips URLs', () => {
    const result = formatCodeLinks(['ABC', 'https://example.com', 'DEF']);
    assert.equal(result.length, 2);
  });

  it('returns empty array when all words are URLs', () => {
    const result = formatCodeLinks(['https://a.com', 'http://b.com']);
    assert.equal(result.length, 0);
  });
});

describe('buildEmbed', () => {
  it('returns an embed with correct color and title', () => {
    const links = ['https://genshin.hoyoverse.com/en/gift?code=ABC'];
    const embed = buildEmbed(links);
    const data = embed.toJSON();

    assert.equal(data.color, 0x80C0A0);
    assert.equal(data.title, '✨ Noelle\'s Redemption Service!');
  });

  it('includes all links in description', () => {
    const links = [
      'https://genshin.hoyoverse.com/en/gift?code=ABC',
      'https://genshin.hoyoverse.com/en/gift?code=DEF',
    ];
    const embed = buildEmbed(links);
    const data = embed.toJSON();

    assert.ok(data.description.includes('code=ABC'));
    assert.ok(data.description.includes('code=DEF'));
  });

  it('has a footer', () => {
    const embed = buildEmbed(['https://genshin.hoyoverse.com/en/gift?code=ABC']);
    const data = embed.toJSON();

    assert.ok(data.footer);
    assert.ok(data.footer.text.length > 0);
  });
});
