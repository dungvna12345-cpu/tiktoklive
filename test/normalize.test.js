const { test, describe } = require('node:test');
const assert = require('node:assert');
const { extractAnswer, removeVietnameseTones, sanitizeNickname } = require('../server/normalize');

describe('Normalize & Answer Extraction', () => {
  test('Extracts single letters', () => {
    assert.strictEqual(extractAnswer('A'), 0);
    assert.strictEqual(extractAnswer('b'), 1);
    assert.strictEqual(extractAnswer('C.'), 2);
    assert.strictEqual(extractAnswer('d!'), 3);
  });

  test('Extracts conversational answers', () => {
    assert.strictEqual(extractAnswer('a nha'), 0);
    assert.strictEqual(extractAnswer('chọn B'), 1);
    assert.strictEqual(extractAnswer('đáp án C'), 2);
    assert.strictEqual(extractAnswer('câu d đi shop'), 3);
    assert.strictEqual(extractAnswer('dap an la A'), 0);
  });

  test('Rejects non-answers', () => {
    assert.strictEqual(extractAnswer('alo anh em'), null);
    assert.strictEqual(extractAnswer('bánh bao'), null);
    assert.strictEqual(extractAnswer('chào cả nhà'), null);
    assert.strictEqual(extractAnswer('12345'), null);
    assert.strictEqual(extractAnswer(''), null);
  });

  test('Removes Vietnamese diacritics', () => {
    assert.strictEqual(removeVietnameseTones('Hà Nội Mùa Thu'), 'Ha Noi Mua Thu');
    assert.strictEqual(removeVietnameseTones('Đà Nẵng'), 'Da Nang');
  });

  test('Sanitizes nicknames', () => {
    const clean = sanitizeNickname('Người Chơi 1');
    assert.strictEqual(clean, 'Người Chơi 1');
    
    const prof = sanitizeNickname('Thằng dcm m');
    assert.ok(prof.includes('***'));
  });
});
