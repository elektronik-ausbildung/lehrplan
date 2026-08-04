let DATA, fuse, flatLZs;
let uniqueHkbs, uniqueLernorte, uniqueSemesters;
let hksByHkb = {};
let totalLzCount = 0, totalLkCount = 0;

document.getElementById("subtitle").textContent = "Lade Daten...";

(async () => {
  const res = await fetch("data/lehrplan.json");
  DATA = await res.json();
  const et = DATA.ET;

  et.handlungskompetenzbereiche.sort((a, b) => a["ID HKB"].localeCompare(b["ID HKB"]));
  const minSem = (obj) => {
    const s = obj["Semester"];
    return Math.min(...(Array.isArray(s) ? s : [s]).map(Number));
  };

  for (const hkb of et.handlungskompetenzbereiche) {
    hkb.handlungskompetenzen.sort((a, b) => a["ID HK"].localeCompare(b["ID HK"]));
    for (const hk of hkb.handlungskompetenzen) {
      hk.lernkriterien.sort((a, b) => {
        const diff = minSem(a) - minSem(b);
        return diff !== 0 ? diff : a["ID LK"].localeCompare(b["ID LK"]);
      });
      for (const lk of hk.lernkriterien) {
        lk.lernziele.sort((a, b) => minSem(a) - minSem(b));
      }
    }
  }

  flatLZs = [];
  const lernorteSet = new Set();
  for (const hkb of et.handlungskompetenzbereiche) {
    for (const hk of hkb.handlungskompetenzen) {
      for (const lk of hk.lernkriterien) {
        lernorteSet.add(lk["Lernort"]);
        for (const lz of lk.lernziele) {
          flatLZs.push({ lz, lk, hk, hkb });
        }
      }
    }
  }
  totalLzCount = flatLZs.length;
  totalLkCount = et.handlungskompetenzbereiche.reduce((s, hkb) =>
    s + hkb.handlungskompetenzen.reduce((s2, hk) => s2 + hk.lernkriterien.length, 0), 0);

  fuse = new Fuse(flatLZs, {
    keys: [
      { name: 'lz.ID LZ', weight: 3 },
      { name: 'lz.Beschreibung LZ', weight: 1 },
      { name: 'lk.Beschreibung LK', weight: 0.5 },
      { name: 'hk.Name', weight: 0.3 },
      { name: 'hk.Beschreibung', weight: 0.3 },
      { name: 'hkb.Name', weight: 0.3 },
      { name: 'lz.Semester', weight: 0.2 },
      { name: 'lz.Taxonomie LZ', weight: 0.2 },
    ],
    threshold: 0.3,
    ignoreLocation: true,
    minMatchCharLength: 3,
  });

  uniqueHkbs = et.handlungskompetenzbereiche.map(h => ({
    value: h["ID HKB"],
    label: h["ID HKB"].split(' ').pop(),
  }));

  hksByHkb = {};
  for (const hkb of et.handlungskompetenzbereiche) {
    hksByHkb[hkb["ID HKB"]] = hkb.handlungskompetenzen.map(hk => hk["ID HK"]);
  }

  uniqueLernorte = [...lernorteSet].sort();

  const semesterSet = new Set();
  for (const hkb of et.handlungskompetenzbereiche) {
    for (const hk of hkb.handlungskompetenzen) {
      for (const lk of hk.lernkriterien) {
        const lkSems = lk["Semester"];
        if (Array.isArray(lkSems)) lkSems.forEach(s => semesterSet.add(s));
        for (const lz of lk.lernziele) {
          const sems = lz["Semester"];
          if (Array.isArray(sems)) sems.forEach(s => semesterSet.add(s));
          else semesterSet.add(sems);
        }
      }
    }
  }
  uniqueSemesters = [...semesterSet].sort((a, b) => Number(a) - Number(b)).map(s => ({
    value: s,
    label: s,
  }));

  const urlParams = new URLSearchParams(location.search);
  let state = {
    search: '',
    hkbs: new Set(),
    hks: new Set(),
    wahlPflicht: new Set(),
    lernorte: new Set(),
    semesters: new Set(),
    collapsed: false,
    showDesc: true,
    showLz: true,
    showRefs: false,
    highlight: urlParams.get('highlight') || null,
  };

  const toggleAllBtn = document.getElementById('toggle-all');

  function checkFilter(set, value) {
    return set.size === 0 || set.has(value);
  }

  function lzSemesterMatches(lzSem) {
    if (state.semesters.size === 0) return true;
    if (Array.isArray(lzSem)) return lzSem.some(s => state.semesters.has(s));
    return state.semesters.has(lzSem);
  }

  function lzMatchesFilters(item) {
    return checkFilter(state.hkbs, item.hkb["ID HKB"])
      && checkFilter(state.hks, item.hk["ID HK"])
      && checkFilter(state.wahlPflicht, item.hk["P/W"])
      && checkFilter(state.lernorte, item.lk["Lernort"])
      && lzSemesterMatches(item.lz["Semester"]);
  }

  function render() {
    const results = document.getElementById('results');
    results.innerHTML = '';
    const openClass = state.collapsed ? '' : ' open';

    let visibleCount = 0;

    if (state.search) {
      const words = state.search.trim().split(/\s+/).filter(w => w.length >= 2);
      const searchSet = new Set();
      if (words.length > 0) {
        for (const word of words) {
          for (const r of fuse.search(word)) {
            searchSet.add(r.item);
          }
        }
      }
      const searchResults = [...searchSet];

      for (const hkb of DATA.ET.handlungskompetenzbereiche) {
        if (!checkFilter(state.hkbs, hkb["ID HKB"])) continue;
        const hkbMatches = searchResults.filter(x => x.hkb["ID HKB"] === hkb["ID HKB"] && lzMatchesFilters(x));
        if (hkbMatches.length === 0) continue;

        const hkbDiv = createSection('subject', hkb, null, openClass);
        const hkbContent = hkbDiv.querySelector('.subject-content');

        for (const hk of hkb.handlungskompetenzen) {
          if (!checkFilter(state.hks, hk["ID HK"])) continue;
          if (!checkFilter(state.wahlPflicht, hk["P/W"])) continue;
          const hkMatches = hkbMatches.filter(x => x.hk["ID HK"] === hk["ID HK"]);
          if (hkMatches.length === 0) continue;

          const hkDiv = createSection('competence', null, hk, openClass);
          const hkContent = hkDiv.querySelector('.competence-content');

          if (state.showDesc && hk["Beschreibung"]) {
            const desc = document.createElement('div');
            desc.className = 'competence-desc';
            desc.textContent = hk["Beschreibung"];
            hkContent.appendChild(desc);
          }

          for (const lk of hk.lernkriterien) {
            if (!checkFilter(state.lernorte, lk["Lernort"])) continue;
            const lkMatches = hkMatches.filter(x => x.lk["ID LK"] === lk["ID LK"]);
            if (lkMatches.length === 0) continue;

            renderLk(lk, lkMatches, hkContent, openClass);
            if (!state.showLz) visibleCount++;
          }

          hkbContent.appendChild(hkDiv);
        }

        results.appendChild(hkbDiv);
        if (state.showLz) visibleCount += hkbMatches.length;
      }
    } else {
      for (const hkb of DATA.ET.handlungskompetenzbereiche) {
        if (!checkFilter(state.hkbs, hkb["ID HKB"])) continue;
        let hasVisibleHk = false;
        const hkbDiv = createSection('subject', hkb, null, openClass);
        const hkbContent = hkbDiv.querySelector('.subject-content');

        for (const hk of hkb.handlungskompetenzen) {
          if (!checkFilter(state.hks, hk["ID HK"])) continue;
          if (!checkFilter(state.wahlPflicht, hk["P/W"])) continue;
          let hasVisibleLk = false;
          const hkDiv = createSection('competence', null, hk, openClass);
          const hkContent = hkDiv.querySelector('.competence-content');

          if (state.showDesc && hk["Beschreibung"]) {
            const desc = document.createElement('div');
            desc.className = 'competence-desc';
            desc.textContent = hk["Beschreibung"];
            hkContent.appendChild(desc);
          }

          for (const lk of hk.lernkriterien) {
            if (!checkFilter(state.lernorte, lk["Lernort"])) continue;
            const matchingLzs = flatLZs.filter(x =>
              x.lk["ID LK"] === lk["ID LK"]
              && x.hk["ID HK"] === hk["ID HK"]
              && lzSemesterMatches(x.lz["Semester"])
            );
            const hasLzs = lk.lernziele.length > 0;
            if (state.semesters.size > 0) {
              if (state.showLz && hasLzs) {
                if (matchingLzs.length === 0) continue;
              } else {
                const lkSems = lk["Semester"] || [];
                if (!lkSems.some(s => state.semesters.has(s))) continue;
              }
            }
            renderLk(lk, matchingLzs, hkContent, openClass);
            hasVisibleLk = true;
            visibleCount += state.showLz ? matchingLzs.length : 1;
          }

          if (hasVisibleLk) {
            hkbContent.appendChild(hkDiv);
            hasVisibleHk = true;
          }
        }

        if (hasVisibleHk) {
          results.appendChild(hkbDiv);
        }
      }
    }

    const totalCount = state.showLz ? totalLzCount : totalLkCount;
    document.getElementById('count').textContent = `${visibleCount} von ${totalCount}`;

    if (results.children.length === 0) {
      results.innerHTML = '<div class="no-results"><strong>Keine Lernziele gefunden</strong><br>Versuche andere Suchbegriffe oder filtere weniger streng.</div>';
    }
  }

  function createSection(type, hkb, hk, openClass) {
    const div = document.createElement('div');
    const header = document.createElement('div');
    const content = document.createElement('div');

    if (type === 'subject') {
      header.className = 'subject-header' + openClass;
      const letter = hkb["ID HKB"].split(' ').pop();
      header.innerHTML = `<span class="arrow">▶</span><span class="code">${letter.toUpperCase()}</span><span class="name">${highlight(hkb["Name"])}</span>`;
      content.className = 'subject-content' + openClass;
    } else {
      header.className = 'competence-header' + openClass;
      header.id = 'hk-' + hk["ID HK"].replace(/[.\s]+/g, '_');
      const pwClass = hk["P/W"] === 'W' ? 'optional' : 'mandatory';
            const pwLabel = hk["P/W"] === 'W' ? 'Wahl' : 'Pflicht';
      header.innerHTML = `<span class="arrow">▶</span><span class="code">${hk["ID HK"]}</span><span class="name">${highlight(hk["Name"])}</span><span class="hk-pw-badge ${pwClass}">${pwLabel}</span>`;
      content.className = 'competence-content' + openClass;
    }

    header.addEventListener('click', () => {
      header.classList.toggle('open');
      content.classList.toggle('open');
    });

    div.appendChild(header);
    div.appendChild(content);
    return div;
  }

  function formatSemesters(arr) {
    if (!arr || arr.length === 0) return '';
    const nums = arr.map(Number).sort((a, b) => a - b);
    const ranges = [];
    let start = nums[0], end = nums[0];
    for (let i = 1; i < nums.length; i++) {
      if (nums[i] === end + 1) { end = nums[i]; }
      else { ranges.push(start === end ? `${start}` : `${start}-${end}`); start = end = nums[i]; }
    }
    ranges.push(start === end ? `${start}` : `${start}-${end}`);
    return ranges.join(', ');
  }

  function renderLk(lk, lzItems, parentEl, openClass) {
    const lkHeader = document.createElement('div');
    lkHeader.className = 'lk-header' + openClass;
    const lc = lk["Lernort"] === 'üK' ? 'ük' : lk["Lernort"];
    lkHeader.innerHTML = `<span class="arrow">▶</span><span class="lk-code">${lk["ID LK"]}</span><span class="lk-desc">${highlight(lk["Beschreibung LK"])}</span>`;
    lkHeader.innerHTML += `<span class="lernort-badge lernort-${lc}">${lk["Lernort"]}</span>`;
    const lkSems = lk["Semester"];
    if (Array.isArray(lkSems) && lkSems.length > 0) {
      lkHeader.innerHTML += `<span class="semester-range">${formatSemesters(lkSems)}</span>`;
    }

    lkHeader.id = 'lk-' + lk["ID LK"].replace(/[.\s]+/g, '_');
    const lkContent = document.createElement('div');
    lkContent.className = 'lk-content' + openClass;

    lkHeader.addEventListener('click', () => {
      lkHeader.classList.toggle('open');
      lkContent.classList.toggle('open');
    });

    if (state.showLz) {
      for (const item of lzItems) {
        const lz = item.lz;
        const row = document.createElement('div');
        row.className = 'lernziel-row';
        const semDisplay = Array.isArray(lz["Semester"]) ? lz["Semester"].join(', ') : lz["Semester"];
        let descHtml = highlight(lz["Beschreibung LZ"]);
        if (lz["duplicated"] && state.showRefs) {
          const badges = lz["duplicated"].map(id => {
            const sid = 'lk-' + id.replace(/[.\s]+/g, '_');
            return `<a href="?highlight=${sid}" class="lk-code highlight-link">${escapeHtml(id)}</a>`;
          }).join(' ');
          descHtml += '<br>Dieses Lernziel gehört ebenfalls zum Leistungskriterium: ' + badges;
        }
        row.dataset.lzId = lz["ID LZ"];
        row.innerHTML = `<span class="lz-id">${highlight(lz["ID LZ"])}</span><span class="lz-desc">${descHtml}</span><span class="semester-badge">${semDisplay}</span>`;
        lkContent.appendChild(row);
      }
    }

    parentEl.appendChild(lkHeader);
    parentEl.appendChild(lkContent);
  }

  function highlight(text) {
    if (!state.search) return escapeHtml(text);
    const words = state.search.trim().split(/\s+/).filter(w => w.length >= 2);
    if (words.length === 0) return escapeHtml(text);
    let result = escapeHtml(text);
    for (const word of words) {
      const q = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      result = result.replace(new RegExp(`(${q})`, 'gi'), '<span class="highlight">$1</span>');
    }
    return result;
  }

  function escapeHtml(t) {
    const d = document.createElement('div');
    d.textContent = t;
    return d.innerHTML;
  }

  function initFilters() {
    const container = document.getElementById('filters');
    const filterConfigs = [
      { id: 'hkbs', label: 'Bereich', items: uniqueHkbs.map(h => ({ value: h.value, label: h.label.toUpperCase() })) },
      { id: 'wahlPflicht', label: 'Typ', items: [{ value: 'P', label: 'Pflicht' }, { value: 'W', label: 'Wahl' }] },
      { id: 'lernorte', label: 'Lernort', items: uniqueLernorte.map(v => ({ value: v, label: v })) },
      { id: 'semesters', label: 'Semester', items: uniqueSemesters },
    ];

    for (const f of filterConfigs) {
      const group = document.createElement('div');
      group.className = 'filter-group';
      group.innerHTML = `<label>${f.label}</label><div class="options"></div>`;
      const opts = group.querySelector('.options');

      for (const item of f.items) {
        const btn = document.createElement('button');
        btn.textContent = item.label;
        btn.title = item.label;
        btn.dataset.value = item.value;
        btn.dataset.filterId = f.id;
        btn.addEventListener('click', () => {
          const set = state[f.id];
          if (set.has(item.value)) {
            set.delete(item.value);
          } else {
            set.add(item.value);
          }
          if (f.id === 'hkbs') updateHkFilter();
          updateFilterButtons(f.id);
          render();
        });
        opts.appendChild(btn);
      }
      container.appendChild(group);
    }

    const lzGroup = document.createElement('div');
    lzGroup.className = 'filter-group';
    lzGroup.innerHTML = '<label>Lernziele</label><div class="options"></div>';
    const lzBtn = document.createElement('button');
    lzBtn.className = 'active';
    lzBtn.textContent = 'An';
    lzBtn.addEventListener('click', () => {
      state.showLz = !state.showLz;
      lzBtn.textContent = state.showLz ? 'An' : 'Aus';
      lzBtn.classList.toggle('active', state.showLz);
      render();
    });
    lzGroup.querySelector('.options').appendChild(lzBtn);
    container.appendChild(lzGroup);

    const descGroup = document.createElement('div');
    descGroup.className = 'filter-group';
    descGroup.innerHTML = '<label>Beschreibung</label><div class="options"></div>';
    const descBtn = document.createElement('button');
    descBtn.className = 'active';
    descBtn.textContent = 'An';
    descBtn.addEventListener('click', () => {
      state.showDesc = !state.showDesc;
      descBtn.textContent = state.showDesc ? 'An' : 'Aus';
      descBtn.classList.toggle('active', state.showDesc);
      render();
    });
    descGroup.querySelector('.options').appendChild(descBtn);
    container.appendChild(descGroup);

    const refsGroup = document.createElement('div');
    refsGroup.className = 'filter-group';
    refsGroup.innerHTML = '<label>Querverweise</label><div class="options"></div>';
    const refsBtn = document.createElement('button');
    refsBtn.textContent = 'Aus';
    refsBtn.addEventListener('click', () => {
      state.showRefs = !state.showRefs;
      refsBtn.textContent = state.showRefs ? 'An' : 'Aus';
      refsBtn.classList.toggle('active', state.showRefs);
      render();
    });
    refsGroup.querySelector('.options').appendChild(refsBtn);
    container.appendChild(refsGroup);

    const clearBtn = document.createElement('button');
    clearBtn.className = 'clear-btn';
    clearBtn.textContent = 'Filter zurücksetzen';
    clearBtn.addEventListener('click', () => {
      state.search = '';
      document.getElementById('search').value = '';
      state.hkbs = new Set();
      state.hks = new Set();
      state.wahlPflicht = new Set();
      state.lernorte = new Set();
      state.semesters = new Set();
      state.highlight = null;
      history.replaceState({ highlight: null }, '', location.pathname);
      updateAllFilterButtons();
      render();
    });
    const clearGroup = document.createElement('div');
    clearGroup.className = 'filter-group';
    clearGroup.innerHTML = '<label>Reset</label><div class="options"></div>';
    clearGroup.querySelector('.options').appendChild(clearBtn);
    container.appendChild(clearGroup);
  }

  function updateFilterButtons(id) {
    const btns = document.querySelectorAll(`[data-filter-id="${id}"]`);
    const set = state[id];
    btns.forEach(b => {
      b.classList.toggle('active', set.has(b.dataset.value));
    });
  }

  function updateAllFilterButtons() {
    for (const id of ['hkbs', 'wahlPflicht', 'lernorte', 'semesters']) {
      updateFilterButtons(id);
    }
  }

  function updateHkFilter() {
    if (state.hkbs.size === 0) {
      state.hks = new Set();
      return;
    }
    const visible = [];
    for (const hkbId of state.hkbs) {
      for (const hkId of hksByHkb[hkbId] || []) {
        visible.push(hkId);
      }
    }
    state.hks = new Set(visible);
  }

  document.getElementById('search').addEventListener('input', e => {
    state.search = e.target.value.trim();
    render();
  });

  toggleAllBtn.addEventListener('click', () => {
    state.collapsed = !state.collapsed;
    toggleAllBtn.textContent = state.collapsed ? 'Alle ausklappen' : 'Alle einklappen';
    render();
  });

  const hkbCount = DATA.ET.handlungskompetenzbereiche.length;
  const hkCount = DATA.ET.handlungskompetenzbereiche.reduce((s, h) => s + h.handlungskompetenzen.length, 0);
  const lkCount = DATA.ET.handlungskompetenzbereiche.reduce((s, h) => s + h.handlungskompetenzen.reduce((s2, hk) => s2 + hk.lernkriterien.length, 0), 0);
  document.getElementById("subtitle").textContent = flatLZs.length + " Lernziele, " + lkCount + " Leistungskriterien in " + hkbCount + " Handlungskompetenzbereichen und " + hkCount + " Handlungskompetenzen";

  const infoToggle = document.getElementById('infoToggle');
  const infoContent = document.getElementById('infoContent');
  infoToggle.addEventListener('click', () => {
    infoToggle.classList.toggle('open');
    infoContent.classList.toggle('open');
  });

  const pdfToggleBtn = document.getElementById('pdfToggleBtn');
  const pdfDropdownMenu = document.getElementById('pdfDropdownMenu');
  pdfToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    pdfDropdownMenu.classList.toggle('show');
  });
  document.addEventListener('click', () => {
    pdfDropdownMenu.classList.remove('show');
  });
  pdfDropdownMenu.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  function applyHighlight() {
    const hl = state.highlight;
    if (!hl) return;

    let el;
    if (hl.startsWith('lk-')) {
      el = document.getElementById(hl);
    } else if (hl.startsWith('lz-')) {
      el = document.querySelector(`[data-lz-id="${hl.slice(3)}"]`);
    } else if (hl.startsWith('hk-')) {
      el = document.getElementById(hl);
    }
    if (!el) return;

    let current = el.parentElement;
    while (current && current.id !== 'results') {
      if (current.classList.contains('lk-content') ||
          current.classList.contains('competence-content') ||
          current.classList.contains('subject-content')) {
        const header = current.previousElementSibling;
        if (header && !header.classList.contains('open')) {
          header.classList.add('open');
          current.classList.add('open');
        }
      }
      current = current.parentElement;
    }

    if (el.classList.contains('lk-header') && !el.classList.contains('open')) {
      el.classList.add('open');
      if (el.nextElementSibling && el.nextElementSibling.classList.contains('lk-content')) {
        el.nextElementSibling.classList.add('open');
      }
    }

    el.classList.add('highlighted');
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function setHighlight(value) {
    state.highlight = value;
    const url = value ? `?highlight=${value}` : location.pathname;
    history.pushState({ highlight: value }, '', url);
    render();
    applyHighlight();
  }

  initFilters();
  updateHkFilter();
  render();
  applyHighlight();

  document.getElementById('results').addEventListener('click', (e) => {
    const link = e.target.closest('.highlight-link');
    if (!link) return;
    e.preventDefault();
    const value = link.getAttribute('href').replace('?highlight=', '');
    setHighlight(value);
  });

  window.addEventListener('popstate', (e) => {
    const params = new URLSearchParams(location.search);
    state.highlight = params.get('highlight') || null;
    render();
    applyHighlight();
  });
})();
