document.addEventListener('DOMContentLoaded', () => {
  // --- Dropdown wie bei dir ---
  const dropdown = document.getElementById('pl-range');
  const trigger  = document.getElementById('pl-trigger');
  const menu     = document.getElementById('pl-menu');
  const form     = document.getElementById('pl-custom');
  const fromEl   = document.getElementById('pl-from');
  const toEl     = document.getElementById('pl-to');

  function toggle(open){
    dropdown.classList.toggle('open', open);
    trigger.setAttribute('aria-expanded', String(open));
  }
  trigger.addEventListener('click', (e) => { e.stopPropagation(); toggle(!dropdown.classList.contains('open')); });
  document.addEventListener('click', () => toggle(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') toggle(false); });
  menu.addEventListener('click', (e) => e.stopPropagation());

  menu.querySelectorAll('[data-range]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.range;
      const { from, to, label } = resolveRange(key);
      trigger.firstChild.nodeValue = label;
      updateProfitLoss({ from, to, label });
      // -> Wenn dein Zeitraum die Tabelle beeinflussen soll, hier neu laden:
      renderTable(sampleAssets, sampleTargets);
      toggle(false);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const from = fromEl.value ? new Date(fromEl.value) : null;
    const to   = toEl.value   ? new Date(toEl.value)   : null;
    if (!from || !to || to < from) return;
    const label = `${from.toLocaleDateString('de-AT')} – ${to.toLocaleDateString('de-AT')}`;
    trigger.firstChild.nodeValue = label;
    updateProfitLoss({ from, to, label, custom: true });
    // -> Falls nötig: Tabelle für Custom-Range neu laden
    renderTable(sampleAssets, sampleTargets);
    toggle(false);
  });

  // --- Demo-Daten: hier später echte Daten einsetzen ---
  // value = EUR-Wert, amount = Stückzahl, change = +/- in Prozent als String
  const sampleAssets = [
    { name: 'BTC', amount: 0.5, value: 15000, change: '+2%' },
    { name: 'ETH', amount: 2,   value:  4000, change: '-1%' },
  ];
  // Soll-Beträge in Euro (manuell definiert)
  const sampleTargets = { BTC: 20000, ETH: 3420, CASH: 3000 };

  // Erstbefüllung
  const { from, to, label } = resolveRange('today');
  trigger.firstChild.nodeValue = label;
  updateProfitLoss({ from, to, label });
  renderTable(sampleAssets, sampleTargets);

  // Modal-Setup
  const btnAdjust   = document.getElementById('btn-adjust');
  const modal       = document.getElementById('modal-adjust');
  const closeEls    = modal ? modal.querySelectorAll('.modal-close, .modal-backdrop') : [];

  function openModal(){
    if(!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(){
    if(!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  btnAdjust?.addEventListener('click', openModal);
  closeEls.forEach(el => el.addEventListener('click', closeModal));
  document.addEventListener('keydown', (e)=> { if(e.key === 'Escape') closeModal(); });
});

// --- Hilfsfunktionen ---
function resolveRange(key){
  const now = new Date();
  const startOfDay = (d)=> new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const addDays = (d, n)=> new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

  let from, to, label;
  switch(key){
    case 'today':    from = startOfDay(now); to = now; label = 'Heute'; break;
    case 'yesterday':{
      const y = addDays(now, -1);
      from = startOfDay(y); to = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 23,59,59);
      label = 'Gestern'; break;
    }
    case 'weekly': { const day = (now.getDay() + 6) % 7;
      from = addDays(startOfDay(now), -day);
      to   = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 6, 23,59,59);
      label = 'Wöchentlich'; break;
    }
    case 'monthly':  from = new Date(now.getFullYear(), now.getMonth(), 1);
                     to   = new Date(now.getFullYear(), now.getMonth()+1, 0, 23,59,59);
                     label = 'Monatlich'; break;
    case 'ytd':      from = new Date(now.getFullYear(), 0, 1); to = now; label = 'YTD'; break;
    case 'yearly':   from = new Date(now.getFullYear(), 0, 1);
                     to   = new Date(now.getFullYear(), 11, 31, 23,59,59);
                     label = 'Jährlich'; break;
    case 'all':      from = new Date(2000, 0, 1); to = now; label = 'Seit Beginn'; break;
    default:         from = startOfDay(now); to = now; label = 'Heute';
  }
  return { from, to, label };
}

function updateProfitLoss({ from, to, label }){
  const node = document.getElementById('profitLoss');
  node.textContent = '234,56 €'; // TODO: hier echten Wert aus deiner Logik setzen
  node.title = `Zeitraum: ${label} (${from.toLocaleDateString('de-AT')} – ${to.toLocaleDateString('de-AT')})`;
}

function renderTable(assets, targets){
  const tbody = document.querySelector('#assetTable tbody');
  if (!tbody) return;

  // Ist-% aus Werten berechnen
  const total = assets.reduce((s,a)=> s + (a.value || 0), 0);
  // Portfolio Wert oben im Dashboard aktualisieren
  const portfolioNode = document.getElementById('portfolioValue');
  if (portfolioNode) {
    portfolioNode.textContent = total.toLocaleString('de-AT', { minimumFractionDigits: 2 }) + ' €';
  }

  const getIst = (a)=> total > 0 ? Math.round((a.value / total) * 100) : 0;

  tbody.innerHTML = '';
  assets.forEach(a => {
    const istPct  = getIst(a); // aktueller Prozentanteil
    const sollPct = total > 0 ? Math.round(((targets[a.name] || 0) / total) * 100) : 0; // aus €-Ziel berechnet

    const tr = document.createElement('tr');
    tr.innerHTML = `
       <td>${a.name}</td>
      <td>${(a.amount ?? 0).toLocaleString('de-AT')}</td>
      <td>
        <div class="value-line">
          <strong>Aktuell:</strong> ${(a.value  ?? 0).toLocaleString('de-AT')} €
        </div>
        <div class="value-line ${(targets[a.name] ?? 0) > (a.value ?? 0) ? 'up' : 'down'}">
          <strong>Soll:</strong> ${(targets[a.name] ?? 0).toLocaleString('de-AT')} €
        </div>
      </td>
      <td>
        <div class="value-line">
          <strong>Aktuell:</strong> ${istPct} %
        </div>
        <div class="value-line">
          <strong>Soll:</strong> ${sollPct} %
        </div>
      </td>
      <td class="delta ${String(a.change || '').trim().startsWith('+') ? 'up' : 'down'}">${a.change ?? '-'}</td>
    `;
    tbody.appendChild(tr);

  });
}
