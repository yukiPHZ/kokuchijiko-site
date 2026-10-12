import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { shuffle, loadProblemSet, createQuiz } from '../src/quiz-engine.mjs';
const { characters } = JSON.parse(fs.readFileSync(new URL('../data/characters.json', import.meta.url)));
function seeded(seed = 17) { return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32); }

test('shuffle permits all six permutations of three items, including unchanged order', () => {
  const permutations = new Set(), original = ['a', 'b', 'c'];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) {
    const draws = [(i + .5) / 3, (j + .5) / 2];
    permutations.add(shuffle(original, () => draws.shift()).join(''));
  }
  assert.equal(permutations.size, 6);
  assert.ok(permutations.has('abc'));
  assert.deepEqual(original, ['a', 'b', 'c']);
  for (const bad of [-1, 1, NaN, Infinity]) assert.throws(() => shuffle(original, () => bad));
});

test('all 124 questions have four unique choices, exactly one correct, no data mutation', () => {
  const before = JSON.stringify(characters);
  for (let seed = 0; seed < 32; seed++) {
    const set = loadProblemSet(characters, { count: 'all', random: seeded(seed) });
    assert.equal(set.length, 124);
    assert.equal(new Set(set.map(p => p.id)).size, 124);
    for (const p of set) {
      assert.equal(new Set(p.choiceIds).size, 4);
      assert.equal(p.choiceIds.filter(id => id === p.correctId).length, 1);
      assert.ok(p.choiceIds.every(id => characters.some(c => c.id === id)));
    }
    assert.equal(set.filter(p => p.id === 'haitani').length, 1);
  }
  assert.equal(JSON.stringify(characters), before);
});

test('default ten questions and a one-question review draw from the full registry', () => {
  assert.equal(loadProblemSet(characters).length, 10);
  const [p] = loadProblemSet(characters, { ids: ['haitani'], count: 'all', random: seeded() });
  assert.equal(p.id, 'haitani');
  assert.equal(p.choiceIds.length, 4);
  assert.throws(() => p.choiceIds.push('injected'));
});

test('score is protected from double clicks, stale question answers, and invalid choices', () => {
  const q = createQuiz(characters, { count: 3, random: seeded() });
  assert.equal(q.next(), false);
  const first = q.snapshot().problem;
  assert.equal(q.answer(first.id, 'unknown'), false);
  assert.equal(q.answer(first.id, first.correctId), true);
  assert.equal(q.answer(first.id, first.correctId), false);
  assert.equal(q.snapshot().score.correctAnswers, 1);
  q.next();
  assert.equal(q.answer(first.id, first.correctId), false);
  const second = q.snapshot().problem;
  q.answer(second.id, second.choiceIds.find(id => id !== second.correctId)); q.next();
  const third = q.snapshot().problem;
  q.answer(third.id, third.correctId); q.next();
  const end = q.snapshot();
  assert.equal(end.phase, 'complete'); assert.equal(end.problem, null);
  assert.equal(end.score.correctAnswers, 2); assert.equal(end.score.percentage, 66);
  assert.deepEqual(end.score.missedIds, [second.id]);
  assert.equal(q.next(), false); assert.equal(q.answer(third.id, third.correctId), false);
  assert.throws(() => end.score.answers.push({ correct: true }));
});

test('invalid or incomplete input fails before play, and Haitani never becomes a face', () => {
  for (const data of [null, [], characters.slice(0, 3), [...characters, characters[0]]]) assert.throws(() => loadProblemSet(data));
  for (const opts of [{ ids: [] }, { ids: ['unknown'] }, { ids: ['haitani', 'haitani'] }, { count: 0 }, { count: NaN }, { count: 1.5 }]) assert.throws(() => loadProblemSet(characters, opts));
  const bad = structuredClone(characters);
  bad.find(c => c.id === 'haitani').portrait = { src: '/assets/portraits/imagined.png' };
  assert.throws(() => loadProblemSet(bad));
});
