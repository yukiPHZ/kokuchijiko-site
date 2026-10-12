import { createQuiz, validateCharacters } from './quiz-engine.mjs';
import { escape, displayName, portrait } from './templates.mjs';
const root = document.querySelector('#quiz-root');
let characters, byId, manifest, quiz;
let lastOptions;
const focusHeading = () => root.querySelector('[data-focus]')?.focus({ preventScroll: true });
function menu() {
  quiz = null;
  const available = manifest.availableQuestionIds.length;
  root.innerHTML = `<div class="quiz-menu"><p class="eyebrow">CHOOSE YOUR PACE</p><h2 data-focus tabindex="-1">今日は、何人に会いますか。</h2><p>4つの名前からひとつを選びます。時間制限はありません。<br>答え合わせの後、次の人物へ進みます。</p>${manifest.preview ? `<p class="development-note">制作途中のため、画像を確認済みの${available - 1}人と灰谷の記録から出題します。完成版の124問モードではありません。</p>` : ''}<div class="mode-buttons"><button class="button" data-mode="ten">まずは10問 <span>→</span></button><button class="button secondary" data-mode="all">${manifest.preview ? `制作済み${available}問` : '全124問'} <span>→</span></button></div><a class="text-link" href="/characters/">先に人物帳で覚える ↗</a></div>`;
  root.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => start({ count: button.dataset.mode === 'all' ? 'all' : 10, ids: manifest.availableQuestionIds })));
  focusHeading();
}
function start(options) {
  lastOptions = options;
  quiz = createQuiz(characters, options);
  render();
}
function render() {
  const state = quiz.snapshot();
  if (state.phase === 'complete') return result(state.score);
  const c = byId.get(state.problem.id);
  const answered = state.phase === 'feedback';
  root.innerHTML = `<div class="quiz-progress"><span>QUESTION <strong>${String(state.index + 1).padStart(2, '0')}</strong> / ${state.total}</span><span>${state.score.correctAnswers} 正解</span></div><progress max="${state.total}" value="${state.score.answered}" aria-label="回答済みの問題数"></progress><div class="question-layout"><div class="question-art">${portrait(c, { known: answered, eager: true })}${c.question_kind === 'record' ? '<p class="record-disclosure">原作の設定に基づく文字組みです。署名画像の複製ではありません。</p>' : ''}</div><div class="question-body"><p class="eyebrow">${c.question_kind === 'record' ? 'READ THE RECORD' : 'RECOGNIZE THE FACE'}</p><h2 data-focus tabindex="-1">${c.question_kind === 'record' ? '記録に残る名前は？' : 'この人物の名前は？'}</h2><div class="choices">${state.problem.choiceIds.map((id, i) => {
    const answer = byId.get(id);
    const correct = answered && id === state.problem.correctId;
    const selected = answered && id === state.feedback.selectedId;
    return `<button class="choice${correct ? ' correct' : ''}${selected && !correct ? ' incorrect' : ''}" data-answer="${id}"${answered ? ' disabled' : ''}><span class="choice-number">${i + 1}</span><span>${displayName(answer)}</span>${correct ? '<span class="choice-status">正解</span>' : selected ? '<span class="choice-status">選択</span>' : ''}</button>`;
  }).join('')}</div>${answered ? `<div class="feedback" role="status"><p>${state.feedback.correct ? '正解です。' : 'この人物は、'}</p><p class="answer-name">${escape(c.name_ja)}</p><p>${escape(c.impression)}</p><a class="text-link" href="/characters/#${c.id}" target="_blank" rel="noopener">人物帳で見る（新しいタブ） ↗</a></div><button class="button next">${state.index + 1 === state.total ? '結果を見る' : '次の人物へ'} <span>→</span></button>` : '<p class="choice-help">名前をひとつ選んでください。</p>'}</div></div>`;
  const questionId = state.problem.id;
  root.querySelectorAll('[data-answer]').forEach(button => button.addEventListener('click', () => {
    if (quiz.answer(questionId, button.dataset.answer)) { render(); root.querySelector('.next').focus({ preventScroll: true }); }
  }));
  root.querySelector('.next')?.addEventListener('click', () => { if (quiz.next()) render(); });
  if (!answered) { root.scrollIntoView({ block: 'start' }); focusHeading(); }
}
function result(score) {
  root.innerHTML = `<div class="result"><p class="eyebrow">YOUR RECORD</p><h2 data-focus tabindex="-1">${score.correctAnswers === score.total ? '全員の名前に、たどり着きました。' : 'また会えば、きっと思い出せる。'}</h2><p class="result-score">${score.correctAnswers}<span> / ${score.total} 問正解</span></p><p class="result-rate">正答率 ${score.percentage}%</p><div class="mode-buttons">${score.missedIds.length ? `<button class="button" id="review">迷った${score.missedIds.length}人をもう一度 →</button>` : ''}<button class="button secondary" id="retry">同じモードで再挑戦 →</button><button class="quiet-button" id="menu">モード選択へ</button></div><h3>今回出会った人々</h3><ol class="answer-list">${score.answers.map(a => {
    const c = byId.get(a.correctId);
    return `<li><span class="answer-mark">${a.correct ? '正解' : '未正解'}</span><a href="/characters/#${c.id}">${displayName(c)}</a>${!a.correct ? `<span class="your-answer">選んだ名前：${escape(byId.get(a.selectedId).name_ja)}</span>` : ''}</li>`;
  }).join('')}</ol><a class="text-link" href="/characters/">人物帳を開く ↗</a></div>`;
  root.querySelector('#review')?.addEventListener('click', () => start({ count: 'all', ids: score.missedIds }));
  root.querySelector('#retry').addEventListener('click', () => start(lastOptions));
  root.querySelector('#menu').addEventListener('click', menu);
  root.scrollIntoView({ block: 'start' });
  focusHeading();
}
async function init() {
  root.setAttribute('aria-busy', 'true');
  try {
    const responses = await Promise.all(['/data/characters.json', '/data/build.json'].map(url => fetch(url, { cache: 'no-cache' })));
    if (responses.some(r => !r.ok)) throw new Error('Load failed');
    const [data, config] = await Promise.all(responses.map(r => r.json()));
    validateCharacters(data.characters);
    characters = data.characters; manifest = config; byId = new Map(characters.map(c => [c.id, c]));
    if (!Array.isArray(manifest.availableQuestionIds) || manifest.availableQuestionIds.length < 4 || manifest.availableQuestionIds.some(id => !byId.has(id))) throw new Error('Invalid build');
    menu();
  } catch {
    root.innerHTML = '<div class="quiz-menu"><h2 data-focus tabindex="-1">人物帳を読み込めませんでした。</h2><p>接続を確かめて、もう一度読み込んでください。回答はまだ始まっていません。</p><button class="button" id="reload">もう一度読み込む</button><p><a href="/characters/">人物帳を読む</a></p></div>';
    root.querySelector('#reload').addEventListener('click', init); focusHeading();
  } finally { root.setAttribute('aria-busy', 'false'); }
}
init();
