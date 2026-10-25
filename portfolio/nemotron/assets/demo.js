(() => {
  'use strict';
  // Invented educational puzzle. No model, API calls or research code execution.
  const symbols = [...'ABCDEFGHI'];
  const target = Object.fromEntries(symbols.map((s, i) => [s, i + 1]));
  const equations = [['AB', 'CD', 'DF'], ['AC', 'BE', 'CH'], ['BD', 'CE', 'EI'], ['AG', 'BA', 'CH'], ['EF', 'AB', 'FH']];
  const swaps = [['A', 'B'], ['C', 'D'], ['E', 'F']];
  const el = id => document.getElementById(id);
  const decode = (text, mapping) => [...text].reduce((n, s) => n * 10 + mapping[s], 0);
  const encode = (n, mapping) => [...String(n)].map(d => Object.keys(mapping).find(s => mapping[s] === +d) || '?').join('');
  function renderTrace() {
    const step = +el('trace-step').value;
    const mapping = { ...target };
    swaps.slice(0, 3 - step).forEach(([a, b]) => { [mapping[a], mapping[b]] = [mapping[b], mapping[a]]; });
    el('trace-position').textContent = `${step + 1} of 4`;
    el('mapping-chips').replaceChildren(...symbols.map(s => {
      const chip = document.createElement('span');
      chip.className = `mapping-chip${mapping[s] !== target[s] ? ' changed' : ''}`;
      chip.textContent = `${s}=${mapping[s]}`;
      if (mapping[s] !== target[s]) chip.title = 'Perturbed relative to the selected target';
      return chip;
    }));
    let passed = 0;
    el('trace-checks').replaceChildren(...equations.map(([lhs, rhs, result]) => {
      const a = decode(lhs, mapping), b = decode(rhs, mapping), expected = decode(result, mapping);
      const ok = a + b === expected; passed += Number(ok);
      const row = document.createElement('tr');
      [`${lhs} + ${rhs} = ${result}`, `${a} + ${b} = ${a + b}; need ${expected}`, ok ? 'Pass' : 'Fail'].forEach((text, index) => {
        const cell = document.createElement('td'); cell.textContent = text;
        if (index === 2) cell.className = ok ? 'check-ok' : 'check-fail'; row.append(cell);
      });
      return row;
    }));
    const next = [['E', 'F'], ['C', 'D'], ['A', 'B']][step];
    el('trace-explanation').textContent = `${passed} of ${equations.length} example equations pass. ` + (next ? `The constructed trajectory proposes swapping ${next[0]} and ${next[1]}, then checking again. This is a candidate repair, not a deduction of uniqueness.` : 'The selected mapping now satisfies every shown equation. Apply the same program to the query.');
    const sum = decode('AB', mapping) + decode('CE', mapping);
    el('trace-query').textContent = `${decode('AB', mapping)} + ${decode('CE', mapping)} = ${sum} → ${encode(sum, mapping)}${step < 3 ? ' (unverified candidate)' : ' (verified program)'}`;
  }
  const counts = [4165, 4165, 4121, 3146, 1668];
  const total = counts.reduce((a,b) => a+b,0);
  const thresholds = counts.map((_, i) => counts.slice(0, i+1).reduce((a,b)=>a+b,0)/total);
  const colors = ['#a9b5c4','#76a995','#609ab5','#8989ba','#b990b0','#d2a071'];
  function renderCurriculum() {
    const step = +el('curriculum-step').value;
    const competence = Math.min(1, Math.sqrt(step * (1 - .01 ** 2) / 175 + .01 ** 2));
    const unlocked = step >= 175 ? [3,4,5] : [1,2,3,4,5].filter(n => n===1 || thresholds[n-1] <= competence);
    const shares = [.25, ...[1,2,3,4,5].map(n => unlocked.includes(n) ? .75/unlocked.length : 0)];
    el('curriculum-position').textContent = `${step} / 250`;
    el('batch-bars').replaceChildren(...shares.map((share, i) => {
      const row = document.createElement('div'); row.className = 'batch-row';
      const label = document.createElement('span'); label.textContent = i===0 ? 'Other replay' : `${i} example${i===1?'':'s'}`;
      const track = document.createElement('div'); track.className='batch-track'; track.setAttribute('aria-hidden','true');
      const fill = document.createElement('span'); fill.className='batch-fill'; fill.style.width=`${share*100}%`; fill.style.background=colors[i]; track.append(fill);
      const value = document.createElement('span'); value.className='batch-share'; value.textContent=`${(share*100).toFixed(share*100%1 ? 1 : 0)}%`;
      row.append(label,track,value); return row;
    }));
    el('curriculum-description').textContent = `${step < 175 ? 'Unlocking phase' : 'Target-distribution phase'}: symbolic slots draw from ${unlocked.join(', ')} shown-example bucket${unlocked.length>1?'s':''}. Competence = ${competence.toFixed(2)}. Other-category replay stays at 25%.`;
  }
  const cases = {
    solved: {v:[1,1,1,0,0,0],text:'The answer is correct, all constraints pass, and the trajectory makes verified progress. Illustrative total: 1 + 0.2 + 0.1.'},
    partial: {v:[0,.6,.4,0,0,0],text:'The final answer is wrong, but the candidate satisfies 60% of the shown equations and makes verified progress of 0.4. Honest failures receive no false-check penalty.'},
    false: {v:[0,.6,.4,1,0,0],text:'The same partial consistency is independently verified, but a claimed successful check is false. The model’s “pass” text cannot override the checker.'},
    loop: {v:[0,.6,0,0,1,1],text:'Repeated states earn no new progress bonus. Unproductive cycling and a budget overrun subtract credit despite some satisfied equations.'}
  };
  function renderReward() {
    const c=cases[el('reward-case').value];
    const weights=[1,.2,.1,-.2,-.1,-.05];
    const score=c.v.reduce((sum,x,i)=>sum+x*weights[i],0);
    el('reward-value').textContent=`${score>=0?'+':''}${score.toFixed(2)}`;
    el('reward-description').textContent=c.text;
  }
  el('trace-step').addEventListener('input', renderTrace);
  el('curriculum-step').addEventListener('input',renderCurriculum);
  el('reward-case').addEventListener('change',renderReward);
  renderTrace();renderCurriculum();renderReward();
})();
