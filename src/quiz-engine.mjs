// Structural adaptation of Kikuta Yukihiko's QuizViewController.m (2015 header).
// Evidence and deliberate changes: ../docs/LEGACY_MAP.md. No legacy data or art.

export function shuffle(values, random = Math.random) {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const draw = random();
    if (!Number.isFinite(draw) || draw < 0 || draw >= 1) throw new RangeError('Random value must be in [0, 1).');
    const j = Math.floor(draw * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function validateCharacters(characters) {
  if (!Array.isArray(characters) || characters.length < 4) throw new Error('At least four characters are required.');
  const ids = new Set();
  for (const c of characters) {
    if (!c || typeof c.id !== 'string' || !/^[a-z][a-z0-9-]+$/.test(c.id) || ids.has(c.id)) throw new Error('Invalid or duplicate character ID.');
    ids.add(c.id);
    for (const key of ['name_ja', 'reading_ja', 'name_romaji']) {
      if (typeof c[key] !== 'string' || !c[key].trim()) throw new Error(`Missing ${key}.`);
    }
    if (c.id === 'haitani') {
      if (c.question_kind !== 'record' || c.portrait !== null) throw new Error('Haitani must remain a record question.');
    } else if (c.question_kind !== 'portrait' || !c.portrait || !/^\/assets\/portraits\/[a-z0-9-]+\.(png|webp)$/.test(c.portrait.src)) {
      throw new Error(`Invalid portrait: ${c.id}.`);
    }
  }
}

// Like loadProblemSet: assemble correct answer + three different distractors.
// Unlike the old fixed CSV columns, keep the whole registry as the choice pool,
// including when a review contains only one question.
export function loadProblemSet(characters, { count = 10, ids, random = Math.random } = {}) {
  validateCharacters(characters);
  const pool = characters.map(c => c.id);
  const targets = ids === undefined ? pool : [...ids];
  if (!targets.length || new Set(targets).size !== targets.length || targets.some(id => !pool.includes(id))) throw new Error('Invalid question selection.');
  const limit = count === 'all' ? targets.length : count;
  if (!Number.isInteger(limit) || limit < 1) throw new Error('Invalid question count.');
  return Object.freeze(shuffle(targets, random).slice(0, limit).map(id => Object.freeze({
    id,
    correctId: id,
    choiceIds: Object.freeze(shuffle([id, ...shuffle(pool.filter(other => other !== id), random).slice(0, 3)], random))
  })));
}

export function createQuiz(characters, options) {
  const problems = loadProblemSet(characters, options);
  const answers = [];
  let index = 0;
  let phase = 'question';
  const result = () => Object.freeze({
    total: problems.length,
    answered: answers.length,
    correctAnswers: answers.filter(a => a.correct).length,
    percentage: Math.floor(answers.filter(a => a.correct).length * 100 / problems.length),
    missedIds: Object.freeze(answers.filter(a => !a.correct).map(a => a.questionId)),
    answers: Object.freeze([...answers])
  });
  const snapshot = () => Object.freeze({
    phase, index, total: problems.length,
    problem: phase === 'complete' ? null : problems[index],
    feedback: phase === 'feedback' ? answers.at(-1) : null,
    score: result()
  });
  return Object.freeze({
    snapshot,
    answer(questionId, selectedId) {
      const current = problems[index];
      if (phase !== 'question' || current.id !== questionId || !current.choiceIds.includes(selectedId)) return false;
      answers.push(Object.freeze({ questionId, selectedId, correctId: current.correctId, correct: selectedId === current.correctId }));
      phase = 'feedback';
      return true;
    },
    next() {
      if (phase !== 'feedback') return false;
      index++;
      phase = index === problems.length ? 'complete' : 'question';
      return true;
    }
  });
}
