const normalize = value => value.normalize('NFKC').toLowerCase().replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60)).replace(/\s/g, '');
const search = document.querySelector('#character-search');
const people = [...document.querySelectorAll('[data-person]')];
function filter() {
  const query = normalize(search.value);
  const status = document.querySelector('input[name="status"]:checked').value;
  let count = 0;
  for (const person of people) {
    const match = (status === 'all' || person.dataset.status === status) && normalize(person.dataset.search).includes(query);
    person.hidden = !match;
    if (match) count++;
  }
  document.querySelector('#list-count').textContent = `${count}人 / 全124人`;
  document.querySelector('#no-people').hidden = count !== 0;
}
search.addEventListener('input', filter);
document.querySelectorAll('input[name="status"]').forEach(input => input.addEventListener('change', filter));
