const { test, describe } = require('node:test');
const assert = require('node:assert');
const { findGiftEffect, GiftStreakTracker } = require('../server/gifts');

describe('Gifts & Streak Handling', () => {
  test('Finds gift mapping by giftId', () => {
    const effect = findGiftEffect(5655); // Rose
    assert.ok(effect);
    assert.strictEqual(effect.id, 'thang_tre');
  });

  test('Finds gift mapping by giftName', () => {
    const effect = findGiftEffect(null, 'Fireworks');
    assert.ok(effect);
    assert.strictEqual(effect.id, 'cap_treo');

    const effect50 = findGiftEffect(null, 'Bắn tim');
    assert.ok(effect50);
    assert.strictEqual(effect50.id, 'goi_y_5050');
  });

  test('GiftStreakTracker aggregates combos until repeatEnd is true', () => {
    const tracker = new GiftStreakTracker();

    // Combo 1st tick (repeatEnd: false)
    const res1 = tracker.processGiftEvent({
      userId: 'user1',
      uniqueId: 'u1',
      nickname: 'User One',
      avatarUrl: '',
      giftId: 5655,
      giftName: 'Rose',
      repeatCount: 1,
      repeatEnd: false
    });
    assert.strictEqual(res1, null, 'Should wait for combo to end');

    // Combo 2nd tick (repeatEnd: false)
    const res2 = tracker.processGiftEvent({
      userId: 'user1',
      uniqueId: 'u1',
      nickname: 'User One',
      avatarUrl: '',
      giftId: 5655,
      giftName: 'Rose',
      repeatCount: 5,
      repeatEnd: false
    });
    assert.strictEqual(res2, null, 'Still waiting for combo to end');

    // Combo ends (repeatEnd: true)
    const res3 = tracker.processGiftEvent({
      userId: 'user1',
      uniqueId: 'u1',
      nickname: 'User One',
      avatarUrl: '',
      giftId: 5655,
      giftName: 'Rose',
      repeatCount: 10,
      repeatEnd: true
    });
    assert.ok(res3, 'Fires when repeatEnd is true');
    assert.strictEqual(res3.repeatCount, 10);
    assert.strictEqual(res3.mapping.id, 'thang_tre');
  });
});
