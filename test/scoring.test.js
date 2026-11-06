const { test, describe } = require('node:test');
const assert = require('node:assert');
const { calculateQuestionScores } = require('../server/scoring');

describe('Scoring Logic', () => {
  test('Normal question: correct +1, top 3 fastest get +1 bonus', () => {
    const answers = [
      { userId: 'u1', option: 0, timestamp: 100 }, // Correct, 1st fastest
      { userId: 'u2', option: 0, timestamp: 200 }, // Correct, 2nd fastest
      { userId: 'u3', option: 0, timestamp: 300 }, // Correct, 3rd fastest
      { userId: 'u4', option: 0, timestamp: 400 }, // Correct, 4th
      { userId: 'u5', option: 1, timestamp: 500 }  // Wrong
    ];

    const currentFloors = { u1: 2, u2: 0, u3: 5, u4: 1, u5: 3 };

    const result = calculateQuestionScores({
      answers,
      correctOption: 0,
      isChallenge: false,
      isWindX2: false,
      currentFloors,
      targetFloor: 20
    });

    const u1 = result.results.get('u1');
    assert.strictEqual(u1.delta, 2, 'Top 1 gets 1 normal + 1 fastest = 2');
    assert.strictEqual(u1.newFloor, 4);

    const u4 = result.results.get('u4');
    assert.strictEqual(u4.delta, 1, '4th fastest gets only 1');
    assert.strictEqual(u4.newFloor, 2);

    const u5 = result.results.get('u5');
    assert.strictEqual(u5.delta, 0, 'Wrong answer gets 0 on normal question');
    assert.strictEqual(u5.newFloor, 3);
  });

  test('Challenge question: correct +2 (+ bonus), wrong -1 (not below 0)', () => {
    const answers = [
      { userId: 'c1', option: 2, timestamp: 100 }, // Correct
      { userId: 'c2', option: 1, timestamp: 200 }, // Wrong (current 3 -> 2)
      { userId: 'c3', option: 1, timestamp: 300 }  // Wrong (current 0 -> 0)
    ];

    const currentFloors = { c1: 5, c2: 3, c3: 0 };

    const result = calculateQuestionScores({
      answers,
      correctOption: 2,
      isChallenge: true,
      isWindX2: false,
      currentFloors,
      targetFloor: 20
    });

    const c1 = result.results.get('c1');
    assert.strictEqual(c1.delta, 3, 'Challenge correct (+2) + fastest (+1) = +3');

    const c2 = result.results.get('c2');
    assert.strictEqual(c2.delta, -1, 'Challenge wrong loses 1 floor');
    assert.strictEqual(c2.newFloor, 2);

    const c3 = result.results.get('c3');
    assert.strictEqual(c3.delta, -1);
    assert.strictEqual(c3.newFloor, 0, 'Cannot fall below floor 0');
  });

  test('Wind x2 doubles correct climb', () => {
    const answers = [
      { userId: 'w1', option: 1, timestamp: 100 }
    ];
    const currentFloors = { w1: 0 };

    const result = calculateQuestionScores({
      answers,
      correctOption: 1,
      isChallenge: false,
      isWindX2: true,
      currentFloors,
      targetFloor: 20
    });

    const w1 = result.results.get('w1');
    // Normal correct (1) + fastest (1) = 2 -> doubled by wind x2 = 4!
    assert.strictEqual(w1.delta, 4);
    assert.strictEqual(w1.newFloor, 4);
  });

  test('Freeze effect prevents climb', () => {
    const answers = [
      { userId: 'f1', option: 0, timestamp: 100 }
    ];
    const currentFloors = { f1: 10 };

    const result = calculateQuestionScores({
      answers,
      correctOption: 0,
      isChallenge: false,
      isWindX2: false,
      frozenUserIds: new Set(['f1']),
      currentFloors,
      targetFloor: 20
    });

    const f1 = result.results.get('f1');
    assert.strictEqual(f1.delta, 0, 'Frozen player climbs 0');
    assert.strictEqual(f1.newFloor, 10);
    assert.strictEqual(f1.isFrozen, true);
  });

  test('Detects winners when reaching target floor', () => {
    const answers = [
      { userId: 'win1', option: 0, timestamp: 100 }
    ];
    const currentFloors = { win1: 19 };

    const result = calculateQuestionScores({
      answers,
      correctOption: 0,
      isChallenge: false,
      isWindX2: false,
      currentFloors,
      targetFloor: 20
    });

    assert.deepStrictEqual(result.winners, ['win1']);
  });
});
