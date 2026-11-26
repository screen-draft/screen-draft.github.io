/* 몫셈 정산 관리 — 시연용 정적 시안. 상태는 메모리에만 둔다. 금액은 원 단위 정수. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var won = function (n) { return (n < 0 ? '-' : '') + Math.abs(n).toLocaleString('ko-KR'); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var ic = function (id, cls) { return '<svg class="ic ' + (cls || '') + '" aria-hidden="true"><use href="#i-' + id + '"/></svg>'; };

  /* ---------- 월 ---------- */
  var CUR = '2026-11';
  var MONTHS = [];
  (function () { var y = 2025, m = 7; while (y * 100 + m <= 202611) { MONTHS.push(y + '-' + (m < 10 ? '0' : '') + m); m++; if (m > 12) { m = 1; y++; } } })();
  var mLabel = function (m) { return m.slice(0, 4) + '년 ' + parseInt(m.slice(5), 10) + '월'; };
  var prevM = function (m) { var i = MONTHS.indexOf(m); return i > 0 ? MONTHS[i - 1] : null; };

  /* ---------- 원천세 기준 (예시) ---------- */
  var TYPES = {
    personal: { label: '개인(사업소득)', rules: [{ from: '2025-01', pct: 3, text: '사업소득 원천세 3.3% (소득세 3% + 지방소득세 0.3%)' }] },
    sole: { label: '개인사업자', rules: [{ from: '2025-01', pct: 0, text: '원천징수 없음 (세금계산서 발행 대상)' }] },
    corp: { label: '법인사업자', rules: [{ from: '2025-01', pct: 0, text: '원천징수 없음 (세금계산서 발행 대상)' }] }
  };

  /* ---------- 계약 ---------- */
  var CONTRACTS = [
    { id: 'C-101', creator: '크리에이터 A', type: 'personal', name: '영상 광고 수익 배분', start: '2025-07', base: 4200000,
      rates: [{ from: '2025-07', rate: 70 }], deds: [{ name: '편집 외주비', v: [{ from: '2025-07', amount: 300000 }] }] },
    { id: 'C-102', creator: '크리에이터 A', type: 'personal', name: '협찬 수익 배분', start: '2026-02', base: 2600000,
      rates: [{ from: '2026-02', rate: 60 }], deds: [{ name: '촬영 장비 대여', v: [{ from: '2026-02', amount: 120000 }] }] },
    { id: 'C-201', creator: '크리에이터 B', type: 'sole', name: '영상 광고 수익 배분', start: '2025-09', base: 6800000,
      rates: [{ from: '2025-09', rate: 65 }, { from: '2026-05', rate: 70 }],
      deds: [{ name: '스튜디오 사용료', v: [{ from: '2025-09', amount: 250000 }] }, { name: '자막 외주', v: [{ from: '2026-03', amount: 80000 }] }] },
    { id: 'C-301', creator: '크리에이터 C', type: 'personal', name: '라이브 후원 수익 배분', start: '2025-11', base: 1900000,
      rates: [{ from: '2025-11', rate: 55 }], deds: [] },
    { id: 'C-401', creator: '크리에이터 D', type: 'corp', name: '상품 판매 수익 배분', start: '2026-01', base: 9500000,
      rates: [{ from: '2026-01', rate: 40 }], deds: [{ name: '물류비', v: [{ from: '2026-01', amount: 410000 }] }] },
    { id: 'C-501', creator: '크리에이터 E', type: 'personal', name: '영상 광고 수익 배분', start: '2026-04', base: 3100000,
      rates: [{ from: '2026-04', rate: 70 }], deds: [{ name: '디자인 외주비', v: [{ from: '2026-04', amount: 150000 }] }] },
    { id: 'C-601', creator: '크리에이터 F', type: 'sole', name: '협찬 수익 배분', start: '2026-06', base: 2400000,
      rates: [{ from: '2026-06', rate: 50 }], deds: [{ name: '진행비', v: [{ from: '2026-06', amount: 200000 }] }] },
    { id: 'C-701', creator: '크리에이터 G', type: 'personal', name: '영상 광고 수익 배분', start: '2026-09', base: 1500000,
      rates: [{ from: '2026-09', rate: 75 }], deds: [] }
  ];
  var byId = {}; CONTRACTS.forEach(function (c) { byId[c.id] = c; c.rateLog = []; });
  byId['C-201'].rateLog.push({ from: '2026-05', rate: 70, before: 65, at: '2026-04-21 15:02', who: '이○○', note: '재계약' });

  /* ---------- 월 입력 금액 (결정적 예시값) ---------- */
  var seed = 20261126;
  var rnd = function () { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  var INPUT = {};
  CONTRACTS.forEach(function (c) {
    INPUT[c.id] = {};
    MONTHS.forEach(function (m) { if (m >= c.start) INPUT[c.id][m] = Math.round(c.base * (0.86 + rnd() * 0.28) / 10) * 10; });
  });
  delete INPUT['C-301'][CUR]; delete INPUT['C-701'][CUR];
  INPUT['C-501'][CUR] = Math.round(INPUT['C-501']['2026-10'] * 2.36 / 10) * 10;

  var closed = {};
  MONTHS.forEach(function (m, i) { if (m < CUR) closed[m] = MONTHS[i + 1] + (m === '2026-10' ? '-05 18:10' : '-05 17:30'); });

  var AUDIT = [
    { at: '2026-11-05 18:10', who: '김○○', month: '2026-10', cid: '', what: '월 마감', before: '작성 중', after: '마감', reason: '10월 정산 확정' },
    { at: '2026-10-08 11:24', who: '이○○', month: '2026-09', cid: 'C-201', what: '입력 금액', before: won(INPUT['C-201']['2026-09'] - 184000), after: won(INPUT['C-201']['2026-09']), reason: '수익 확정치 재통보분 반영' }
  ];

  /* ---------- 계산 ---------- */
  function rateAt(c, m) { var r = null; c.rates.forEach(function (x) { if (x.from <= m && (!r || x.from >= r.from)) r = x; }); return r; }
  function dedsAt(c, m, skip) {
    var out = [];
    c.deds.forEach(function (d) {
      if (skip && d.name === skip) return;
      var v = null; d.v.forEach(function (x) { if (x.from <= m && (!v || x.from >= v.from)) v = x; });
      if (v && v.amount > 0) out.push({ name: d.name, amount: v.amount, from: v.from });
    });
    return out;
  }
  function taxRule(c, m) { var r = null; TYPES[c.type].rules.forEach(function (x) { if (x.from <= m) r = x; }); return r; }
  function calc(cid, m, opt) {
    var c = byId[cid], G = INPUT[cid][m];
    if (G === undefined) return null;
    var r = rateAt(c, m), share = Math.floor(G * r.rate / 100);
    var deds = dedsAt(c, m, opt && opt.skip), dedSum = deds.reduce(function (a, d) { return a + d.amount; }, 0);
    var base = Math.max(0, share - dedSum), tr = taxRule(c, m);
    var income = Math.floor(base * tr.pct / 1000) * 10, local = Math.floor(income / 100) * 10;
    return { G: G, rate: r.rate, rateFrom: r.from, share: share, deds: deds, dedSum: dedSum, base: base, tr: tr, income: income, local: local, tax: income + local, pay: base - income - local };
  }
  function active(m) { return CONTRACTS.filter(function (c) { return c.start <= m; }); }
  function status(cid, m) { return closed[m] ? '마감' : (INPUT[cid][m] === undefined ? '입력 전' : '입력됨'); }
  function change(cid, m) {
    var p = prevM(m), a = INPUT[cid][m], b = p ? INPUT[cid][p] : undefined;
    if (a === undefined || b === undefined || !b) return null;
    var pct = Math.round((a - b) / b * 100);
    return Math.abs(pct) >= 50 ? pct : null;
  }
  function monthTotals(m) {
    var t = { n: 0, miss: 0, G: 0, tax: 0, pay: 0, flag: 0 };
    active(m).forEach(function (c) { t.n++; var k = calc(c.id, m); if (!k) { t.miss++; return; } t.G += k.G; t.tax += k.tax; t.pay += k.pay; if (change(c.id, m) !== null) t.flag++; });
    return t;
  }

  /* 한글 금액 */
  function hangul(n) {
    if (n === 0) return '영';
    var d = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'], s = ['', '십', '백', '천'], b = ['', '만', '억', '조'];
    var out = '', g = 0;
    while (n > 0) {
      var part = n % 10000, txt = '';
      for (var i = 0; i < 4; i++) { var x = Math.floor(part / Math.pow(10, i)) % 10; if (x) txt = d[x] + s[i] + txt; }
      if (txt) out = txt + b[g] + out;
      n = Math.floor(n / 10000); g++;
    }
    return out;
  }

  /* ---------- 상태 ---------- */
  var V = { view: 'settle', month: CUR, open: null, err: {}, conSel: null, conNote: null, dedC: 'C-101', dedEdit: null, histC: 'C-101', recon: null, reconFilter: 'all', menu: false };
  var clock = 600; // 2026-11-26 10:00부터 분 단위
  function now() { clock += 3; var h = Math.floor(clock / 60) % 24, mi = clock % 60; return '2026-11-26 ' + (h < 10 ? '0' : '') + h + ':' + (mi < 10 ? '0' : '') + mi; }

  /* ---------- 처리 표시 / 토스트 ---------- */
  var lock = false, tt;
  function run(msg, fn, ms) {
    if (lock) return; lock = true;
    $('#busyT').textContent = msg; $('#busy').hidden = false;
    setTimeout(function () {
      var t = fn();
      $('#busy').hidden = true; lock = false; render();
      if (t) toast(t);
    }, ms || 450);
  }
  function toast(t) {
    var el = $('#toast'); el.innerHTML = ic('check') + '<span>' + esc(t) + '</span>'; el.hidden = false;
    clearTimeout(tt); tt = setTimeout(function () { el.hidden = true; }, 2400);
  }

  /* ---------- 메뉴 ---------- */
  var NAV = [
    ['settle', '월 정산', 'sheet'], ['contract', '크리에이터·계약', 'people'], ['deduct', '지출 공제 항목', 'minus'],
    ['close', '월 마감·수정 이력', 'lock'], ['history', '월별 내역 조회', 'cal'], ['recon', '엑셀 이관 대조', 'compare']
  ];
  function renderNav() {
    $('#nav').innerHTML = NAV.map(function (n) {
      return '<button type="button" data-act="go" data-id="' + n[0] + '"' + (V.view === n[0] ? ' aria-current="page"' : '') + '>' + ic(n[2]) + '<span>' + n[1] + '</span></button>';
    }).join('');
    document.body.classList.toggle('menu-open', V.menu);
  }

  /* ---------- 공통 조각 ---------- */
  function empty(icon, msg, btn) {
    return '<div class="empty">' + ic(icon || 'empty', 'big') + '<p>' + msg + '</p>' + (btn || '') + '</div>';
  }
  function statusTag(s) {
    var cls = s === '마감' ? 'st-close' : s === '입력 전' ? 'st-miss' : 'st-in';
    return '<span class="st ' + cls + '">' + (s === '마감' ? ic('lock') : s === '입력 전' ? ic('alert') : '') + s + '</span>';
  }
  function monthOptions(sel) { return MONTHS.slice().reverse().map(function (m) { return '<option value="' + m + '"' + (m === sel ? ' selected' : '') + '>' + mLabel(m) + (closed[m] ? ' (마감)' : ' (작성 중)') + '</option>'; }).join(''); }
  function contractOptions(sel) { return CONTRACTS.map(function (c) { return '<option value="' + c.id + '"' + (c.id === sel ? ' selected' : '') + '>' + c.id + ' ' + c.creator + ' · ' + c.name + '</option>'; }).join(''); }

  /* ---------- 1. 월 정산 ---------- */
  function vSettle() {
    var m = V.month, isClosed = !!closed[m], t = monthTotals(m);
    var head = '<div class="ph"><div><h1>월 정산</h1><p class="ph-s">계약별 입력 금액을 넣으면 분배율·지출 공제·원천세를 적용해 지급액을 계산합니다. 행을 누르면 계산 근거가 펼쳐집니다.</p></div>' +
      '<div class="ph-r"><label class="fld-inline"><span>정산 월</span><select id="monthSel" data-bind="month">' + monthOptions(m) + '</select></label>' +
      (isClosed ? '<span class="closed-flag">' + ic('lock') + mLabel(m) + ' 마감 · ' + closed[m] + '</span>'
        : (m === CUR ? '<button type="button" class="btn pri" id="closeBtn" data-act="closeAsk"' + (t.miss ? ' disabled' : '') + '>' + ic('lock') + '이번 달 마감</button>' : '')) + '</div></div>';
    var note = '';
    if (!isClosed && t.miss) note = '<p class="warnline" id="closeBlock">' + ic('alert') + '입력 전 계약 ' + t.miss + '건이 있어 마감할 수 없습니다. 입력 금액을 모두 넣으면 마감 버튼이 열립니다.</p>';
    if (isClosed) note = '<p class="infoline">' + ic('lock') + '마감된 달입니다. 입력 칸이 잠겨 있으며, 고치려면 행의 수정 버튼에서 사유를 적어야 하고 수정 이력에 남습니다.</p>';
    var sum = '<dl class="sumline" id="sum">' +
      '<div><dt>계약</dt><dd data-k="n">' + t.n + '건</dd></div>' +
      '<div class="' + (t.miss ? 'is-miss' : '') + '"><dt>입력 전</dt><dd data-k="miss">' + t.miss + '건</dd></div>' +
      '<div class="' + (t.flag ? 'is-flag' : '') + '"><dt>전월 대비 큰 변동</dt><dd data-k="flag">' + t.flag + '건</dd></div>' +
      '<div><dt>입력 금액 합계</dt><dd data-k="G">' + won(t.G) + '원</dd></div>' +
      '<div><dt>원천세 합계</dt><dd data-k="tax">' + won(t.tax) + '원</dd></div>' +
      '<div class="tot"><dt>지급액 합계</dt><dd data-k="pay">' + won(t.pay) + '원</dd></div></dl>';
    var rows = active(m).map(function (c) {
      var k = calc(c.id, m), st = status(c.id, m), ch = change(c.id, m), open = V.open === c.id, err = V.err[c.id];
      var inCell = isClosed
        ? '<span class="num">' + (k ? won(k.G) : '-') + '</span>'
        : '<input class="amt' + (err ? ' bad' : '') + '" data-bind="amt" data-id="' + c.id + '" inputmode="numeric" autocomplete="off" aria-label="' + c.creator + ' ' + c.name + ' 입력 금액" placeholder="입력 필요" value="' + (err ? esc(err.v) : (k ? won(k.G) : '')) + '"' + (err ? ' aria-describedby="err-' + c.id + '"' : '') + '>' +
          (err ? '<span class="ferr" id="err-' + c.id + '">' + err.msg + '</span>' : '');
      var chTag = ch !== null ? '<span class="chg" title="전월 대비 변동">' + ic('alert') + '전월 대비 ' + (ch > 0 ? '+' : '') + ch + '%</span>' : '';
      var act = isClosed
        ? '<button type="button" class="ibtn tip" data-act="fix" data-id="' + c.id + '" aria-label="마감 후 수정" data-tip="마감 후 수정">' + ic('edit') + '</button>'
        : '';
      return '<tr class="row' + (open ? ' open' : '') + (st === '입력 전' ? ' miss' : '') + (ch !== null ? ' flag' : '') + '" data-act="toggle" data-id="' + c.id + '">' +
        '<td class="c-who" data-label="크리에이터"><b>' + c.creator + '</b><span class="sub">' + TYPES[c.type].label + '</span></td>' +
        '<td class="c-con" data-label="계약"><span>' + c.name + '</span><span class="sub">' + c.id + '</span></td>' +
        '<td class="r c-in" data-label="입력 금액">' + inCell + chTag + '</td>' +
        '<td class="r" data-label="분배율">' + (k ? k.rate + '%' : rateAt(c, m).rate + '%') + '</td>' +
        '<td class="r" data-label="지출 공제">' + (k ? won(k.dedSum) : '-') + '</td>' +
        '<td class="r" data-label="원천세">' + (k ? won(k.tax) : '-') + '</td>' +
        '<td class="r c-pay" data-label="지급액" data-pay="' + (k ? k.pay : '') + '"><b>' + (k ? won(k.pay) : '-') + '</b></td>' +
        '<td class="c-st" data-label="상태">' + statusTag(st) + '</td>' +
        '<td class="c-act">' + act + '<button type="button" class="ibtn tip exp" data-act="toggle" data-id="' + c.id + '" aria-expanded="' + open + '" aria-label="계산 근거 ' + (open ? '접기' : '펼치기') + '" data-tip="계산 근거">' + ic('chev') + '</button></td></tr>' +
        (open ? '<tr class="detail"><td colspan="9">' + basis(c, m, k) + '</td></tr>' : '');
    }).join('');
    return head + note + sum +
      '<div class="tbl-wrap"><table class="grid settle" id="settleTbl"><thead><tr><th>크리에이터</th><th>계약</th><th class="r">입력 금액</th><th class="r">분배율</th><th class="r">지출 공제</th><th class="r">원천세</th><th class="r">지급액</th><th>상태</th><th class="c-act"><span class="sr">작업</span></th></tr></thead><tbody>' + rows +
      '</tbody><tfoot><tr><td colspan="2">합계 (' + t.n + '건)</td><td class="r" data-label="입력 금액">' + won(t.G) + '</td><td></td><td class="r" data-label="지출 공제">' + won(active(m).reduce(function (a, c) { var k = calc(c.id, m); return a + (k ? k.dedSum : 0); }, 0)) + '</td><td class="r" data-label="원천세">' + won(t.tax) + '</td><td class="r" data-label="지급액" id="payTotal"><b>' + won(t.pay) + '</b></td><td colspan="2"></td></tr></tfoot></table></div>' +
      '<p class="hint">입력 금액은 원 단위로 넣고 Enter 또는 칸 밖을 누르면 다시 계산합니다. 금액은 원 단위 정수로 계산하며, 분배 금액은 원 미만 절사, 원천세는 10원 미만 절사(예시 기준)입니다.</p>';
  }

  function basis(c, m, k) {
    if (!k) return '<div class="basis">' + empty('alert', mLabel(m) + ' 입력 금액이 아직 없습니다. 입력 금액을 넣으면 단계별 계산 근거가 여기에 나옵니다.', '<button type="button" class="btn" data-act="focusAmt" data-id="' + c.id + '">' + ic('edit') + '입력 금액 넣기</button>') + '</div>';
    var tr = k.tr, isP = tr.pct > 0;
    var dedRows = k.deds.length ? k.deds.map(function (d) {
      return '<tr class="sub-step" data-step="ded"><td></td><td>' + esc(d.name) + '<span class="rule">계약 ' + c.id + ' 공제 항목 · ' + d.from + '부터 적용 중</span></td><td class="r">-' + won(d.amount) + '</td></tr>';
    }).join('') : '<tr class="sub-step"><td></td><td>등록된 공제 항목 없음<span class="rule">지출 공제 항목 화면에서 등록할 수 있습니다</span></td><td class="r">0</td></tr>';
    return '<div class="basis" data-basis="' + c.id + '"><div class="basis-h"><b>계산 근거</b><span>' + c.creator + ' · ' + c.name + ' (' + c.id + ') · ' + mLabel(m) + '</span></div>' +
      '<table class="ledger"><tbody>' +
      '<tr data-step="G"><th>1. 입력 금액</th><td>월 입력 금액<span class="rule">' + mLabel(m) + ' 정산 데이터 · ' + (closed[m] ? '마감됨' : '작성 중') + '</span></td><td class="r" data-v="' + k.G + '">' + won(k.G) + '</td></tr>' +
      '<tr data-step="share"><th>2. 분배율 적용</th><td>' + won(k.G) + ' × ' + k.rate + '%<span class="rule">분배율 ' + k.rate + '% · ' + k.rateFrom + '부터 적용 중 · 원 미만 절사</span></td><td class="r" data-v="' + k.share + '" data-rate="' + k.rate + '">' + won(k.share) + '</td></tr>' +
      '<tr data-step="dedh"><th>3. 지출 공제</th><td>공제 항목 ' + k.deds.length + '건</td><td class="r" data-v="' + k.dedSum + '">-' + won(k.dedSum) + '</td></tr>' + dedRows +
      '<tr data-step="base" class="subtotal"><th></th><td>공제 후 금액</td><td class="r" data-v="' + k.base + '">' + won(k.base) + '</td></tr>' +
      '<tr data-step="tax"><th>4. 원천세</th><td>사업자 유형: ' + TYPES[c.type].label + '<span class="rule">' + tr.text + ' · ' + tr.from + '부터 적용 중</span><span class="ex">예시 기준, 실제는 정산 규칙에 따름</span></td><td class="r" data-v="' + k.tax + '" data-pct="' + tr.pct + '">-' + won(k.tax) + '</td></tr>' +
      (isP ? '<tr class="sub-step"><td></td><td>소득세 ' + won(k.base) + ' × 3%<span class="rule">10원 미만 절사</span></td><td class="r" data-income="' + k.income + '">-' + won(k.income) + '</td></tr>' +
        '<tr class="sub-step"><td></td><td>지방소득세 (소득세의 10%)<span class="rule">10원 미만 절사</span></td><td class="r" data-local="' + k.local + '">-' + won(k.local) + '</td></tr>' : '') +
      '<tr data-step="pay" class="final"><th>5. 지급액</th><td>공제 후 금액 − 원천세<span class="kr">금 ' + hangul(k.pay) + '원정</span></td><td class="r" data-v="' + k.pay + '">' + won(k.pay) + '원</td></tr>' +
      '</tbody></table></div>';
  }

  /* ---------- 2. 크리에이터·계약 ---------- */
  function vContract() {
    var head = '<div class="ph"><div><h1>크리에이터·계약 관리</h1><p class="ph-s">계약별 분배율을 바꿀 때는 적용 시작 월을 고릅니다. 그 달부터만 새 분배율이 적용되고, 이전 달 정산은 그대로입니다.</p></div></div>';
    var rows = CONTRACTS.map(function (c) {
      var r = rateAt(c, CUR), pend = c.rates.filter(function (x) { return x.from > CUR; })[0];
      return '<tr class="row' + (V.conSel === c.id ? ' sel' : '') + '" data-act="conPick" data-id="' + c.id + '">' +
        '<td data-label="크리에이터"><b>' + c.creator + '</b></td><td data-label="사업자 유형">' + TYPES[c.type].label + '</td>' +
        '<td data-label="계약"><span>' + c.name + '</span><span class="sub">' + c.id + '</span></td><td data-label="계약 시작 월" class="num">' + c.start + '</td>' +
        '<td class="r" data-label="현재 분배율" data-rate="' + c.id + '">' + r.rate + '%' + (pend ? '<span class="sub">' + pend.from + '부터 ' + pend.rate + '%</span>' : '') + '</td>' +
        '<td class="c-act"><button type="button" class="ibtn tip" data-act="conPick" data-id="' + c.id + '" aria-label="계약 상세" data-tip="계약 상세">' + ic('chev') + '</button></td></tr>';
    }).join('');
    var list = '<div class="tbl-wrap' + (V.conSel ? ' m-hide' : '') + '"><table class="grid"><thead><tr><th>크리에이터</th><th>사업자 유형</th><th>계약</th><th>계약 시작 월</th><th class="r">현재 분배율(' + CUR + ')</th><th class="c-act"><span class="sr">상세</span></th></tr></thead><tbody>' + rows + '</tbody></table></div>';
    var det;
    if (!V.conSel) det = '<section class="panel m-hide" id="conDetail">' + empty('people', '계약을 고르면 분배율 변경과 변경 이력이 여기에 나옵니다.', '<button type="button" class="btn" data-act="conPick" data-id="C-101">C-101 계약 열기</button>') + '</section>';
    else {
      var c = byId[V.conSel], r = rateAt(c, CUR);
      var hist = c.rates.slice().sort(function (a, b) { return a.from < b.from ? 1 : -1; }).map(function (x) {
        var lg = c.rateLog.filter(function (l) { return l.from === x.from && l.rate === x.rate; }).slice(-1)[0];
        return '<tr><td class="num" data-label="적용 시작 월">' + x.from + (x.from > CUR ? ' <span class="sub">예정</span>' : '') + '</td><td class="r" data-label="분배율">' + x.rate + '%</td><td class="r" data-label="변경 전">' + (lg ? lg.before + '%' : '계약 시') + '</td><td data-label="저장">' + (lg ? lg.at + ' · ' + lg.who : c.start + ' 계약 등록') + '</td></tr>';
      }).join('');
      det = '<section class="panel" id="conDetail"><div class="panel-h"><h2>' + c.creator + ' · ' + c.name + ' <span class="sub">' + c.id + '</span></h2><button type="button" class="btn ghost" data-act="conClose">' + ic('close') + '목록으로</button></div>' +
        '<dl class="kv"><div><dt>사업자 유형</dt><dd>' + TYPES[c.type].label + '</dd></div><div><dt>계약 시작 월</dt><dd>' + c.start + '</dd></div><div><dt>현재 분배율</dt><dd>' + r.rate + '% (' + r.from + '부터)</dd></div><div><dt>원천세 기준</dt><dd>' + taxRule(c, CUR).text + ' <span class="ex">예시</span></dd></div></dl>' +
        '<form class="rateform" id="rateForm" data-act="none"><h3>분배율 변경</h3><div class="frow">' +
        '<label class="fld"><span>새 분배율(%)</span><input id="newRate" inputmode="numeric" value="' + (V.err.rate ? esc(V.err.rate.v) : '') + '" placeholder="' + r.rate + '"' + (V.err.rate ? ' class="bad" aria-describedby="rateErr"' : '') + '>' + (V.err.rate ? '<span class="ferr" id="rateErr">' + V.err.rate.msg + '</span>' : '') + '</label>' +
        '<label class="fld"><span>적용 시작 월</span><select id="rateFrom"><option value="2026-11">2026-11 (작성 중인 정산 월)</option><option value="2026-12">2026-12</option></select></label>' +
        '<button type="button" class="btn pri" data-act="rateSave">저장</button></div>' +
        '<p class="hint">마감된 달(2026-10 이전)은 적용 시작 월로 고를 수 없습니다. 저장하면 변경 이력에 쌓입니다.</p></form>' +
        (V.conNote ? '<div class="okline" id="conNote">' + ic('check') + '<span>' + V.conNote.text + '</span><button type="button" class="btn" data-act="goMonth" data-id="2026-10">2026년 10월 정산 보기</button></div>' : '') +
        '<h3>분배율 변경 이력</h3><div class="tbl-wrap"><table class="grid compact" id="rateHist"><thead><tr><th>적용 시작 월</th><th class="r">분배율</th><th class="r">변경 전</th><th>저장</th></tr></thead><tbody>' + hist + '</tbody></table></div></section>';
    }
    return head + '<div class="split">' + list + det + '</div>';
  }

  /* ---------- 3. 지출 공제 ---------- */
  function vDeduct() {
    var c = byId[V.dedC];
    var head = '<div class="ph"><div><h1>지출 공제 항목</h1><p class="ph-s">계약별로 매월 공제하는 지출 항목입니다. 금액을 바꾸면 고른 적용 시작 월부터 반영됩니다.</p></div>' +
      '<div class="ph-r"><label class="fld-inline"><span>계약</span><select data-bind="dedC">' + contractOptions(V.dedC) + '</select></label></div></div>';
    var rows = c.deds.map(function (d, i) {
      var cur = dedsAt({ deds: [d] }, CUR)[0], vh = d.v.map(function (x) { return x.from + ' ' + won(x.amount); }).join(' → ');
      var editing = V.dedEdit === i;
      return '<tr><td data-label="항목"><b>' + esc(d.name) + '</b></td><td class="r" data-label="월 공제액(' + CUR + ')">' + (cur ? won(cur.amount) : '0') + '</td>' +
        '<td class="num" data-label="적용 시작 월">' + (cur ? cur.from : d.v[0].from) + '</td><td data-label="변경 이력"><span class="sub nowrap-no">' + vh + '</span></td>' +
        '<td class="c-act"><button type="button" class="ibtn tip" data-act="dedEdit" data-id="' + i + '" aria-label="' + esc(d.name) + ' 금액 변경" data-tip="금액 변경">' + ic('edit') + '</button></td></tr>' +
        (editing ? '<tr class="detail"><td colspan="5"><div class="frow"><label class="fld"><span>새 월 공제액(원)</span><input id="dedNewAmt" inputmode="numeric" value="' + (cur ? won(cur.amount) : '') + '"></label><label class="fld"><span>적용 시작 월</span><select id="dedNewFrom"><option>2026-11</option><option>2026-12</option></select></label><button type="button" class="btn pri" data-act="dedUpd" data-id="' + i + '">변경 저장</button><button type="button" class="btn ghost" data-act="dedEdit" data-id="-1">취소</button></div></td></tr>' : '');
    }).join('');
    var table = c.deds.length ? '<div class="tbl-wrap"><table class="grid" id="dedTbl"><thead><tr><th>항목</th><th class="r">월 공제액(' + CUR + ')</th><th>적용 시작 월</th><th>변경 이력</th><th class="c-act"><span class="sr">변경</span></th></tr></thead><tbody>' + rows + '</tbody></table></div>'
      : '<div class="panel">' + empty('minus', c.id + ' 계약에는 등록된 지출 공제 항목이 없습니다. 공제할 지출이 있으면 아래에서 추가하세요.', '<button type="button" class="btn" data-act="focusDed">' + ic('plus') + '공제 항목 추가</button>') + '</div>';
    var e = V.err.ded || {};
    var form = '<section class="panel" id="dedForm"><h3>공제 항목 추가 · ' + c.id + '</h3><div class="frow">' +
      '<label class="fld"><span>항목명</span><input id="dedName" placeholder="예: 편집 외주비" value="' + esc(e.name || '') + '"' + (e.nameMsg ? ' class="bad"' : '') + '>' + (e.nameMsg ? '<span class="ferr">' + e.nameMsg + '</span>' : '') + '</label>' +
      '<label class="fld"><span>월 공제액(원)</span><input id="dedAmt" inputmode="numeric" placeholder="0" value="' + esc(e.amt || '') + '"' + (e.amtMsg ? ' class="bad"' : '') + '>' + (e.amtMsg ? '<span class="ferr">' + e.amtMsg + '</span>' : '') + '</label>' +
      '<label class="fld"><span>적용 시작 월</span><select id="dedFrom"><option>2026-11</option><option>2026-12</option></select></label>' +
      '<button type="button" class="btn pri" data-act="dedAdd">' + ic('plus') + '추가</button></div></section>';
    return head + table + form;
  }

  /* ---------- 4. 월 마감·수정 이력 ---------- */
  function vClose() {
    var head = '<div class="ph"><div><h1>월 마감·수정 이력</h1><p class="ph-s">마감한 달은 입력 칸이 잠깁니다. 마감 뒤 수정은 사유와 함께 누가, 언제, 무엇을, 전·후 값으로 남습니다.</p></div></div>';
    var ms = MONTHS.slice().reverse().slice(0, 8);
    var rows = ms.map(function (m) {
      var t = monthTotals(m);
      return '<tr data-month="' + m + '"><td data-label="정산 월"><b>' + mLabel(m) + '</b></td><td class="r" data-label="계약">' + t.n + '건</td><td class="r" data-label="입력 금액 합계">' + won(t.G) + '</td><td class="r" data-label="지급액 합계" data-pay="' + t.pay + '">' + won(t.pay) + '</td>' +
        '<td data-label="상태">' + (closed[m] ? statusTag('마감') : '<span class="st st-in">작성 중' + (t.miss ? ' · 입력 전 ' + t.miss + '건' : '') + '</span>') + '</td><td class="num" data-label="마감 일시">' + (closed[m] || '-') + '</td>' +
        '<td class="c-act"><button type="button" class="ibtn tip" data-act="goMonth" data-id="' + m + '" aria-label="' + mLabel(m) + ' 정산 보기" data-tip="정산 보기">' + ic('chev') + '</button></td></tr>';
    }).join('');
    var log = AUDIT.map(function (a) {
      var c = a.cid ? byId[a.cid] : null;
      return '<tr><td class="num" data-label="일시">' + a.at + '</td><td class="num" data-label="누가">' + a.who + '</td><td class="num" data-label="정산 월">' + a.month + '</td><td data-label="무엇을">' + (c ? c.creator + ' · ' + c.id + ' ' : '') + a.what + '</td>' +
        '<td class="r" data-label="변경 전">' + a.before + '</td><td class="r" data-label="변경 후">' + a.after + '</td><td data-label="사유">' + esc(a.reason) + '</td></tr>';
    }).join('');
    return head + '<h2 class="sec">월별 마감 상태</h2><div class="tbl-wrap"><table class="grid" id="monthTbl"><thead><tr><th>정산 월</th><th class="r">계약</th><th class="r">입력 금액 합계</th><th class="r">지급액 합계</th><th>상태</th><th>마감 일시</th><th class="c-act"><span class="sr">보기</span></th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<h2 class="sec">수정 이력 <span class="sub">' + AUDIT.length + '건</span></h2><div class="tbl-wrap"><table class="grid" id="auditTbl"><thead><tr><th>일시</th><th>누가</th><th>정산 월</th><th>무엇을</th><th class="r">변경 전</th><th class="r">변경 후</th><th>사유</th></tr></thead><tbody>' + log + '</tbody></table></div>';
  }

  /* ---------- 5. 월별 내역 ---------- */
  function vHistory() {
    var c = byId[V.histC], ms = MONTHS.filter(function (m) { return m >= c.start; });
    var tot = { G: 0, ded: 0, tax: 0, pay: 0 };
    var rows = ms.map(function (m) {
      var k = calc(c.id, m);
      if (k) { tot.G += k.G; tot.ded += k.dedSum; tot.tax += k.tax; tot.pay += k.pay; }
      return '<tr><td data-label="정산 월"><b>' + mLabel(m) + '</b></td><td class="r" data-label="입력 금액">' + (k ? won(k.G) : '-') + '</td><td class="r" data-label="분배율">' + rateAt(c, m).rate + '%</td><td class="r" data-label="지출 공제">' + (k ? won(k.dedSum) : '-') + '</td><td class="r" data-label="원천세">' + (k ? won(k.tax) : '-') + '</td><td class="r" data-label="지급액" data-m="' + m + '" data-pay="' + (k ? k.pay : 0) + '"><b>' + (k ? won(k.pay) : '-') + '</b></td><td data-label="상태">' + statusTag(status(c.id, m)) + '</td></tr>';
    }).join('');
    return '<div class="ph"><div><h1>월별 내역 조회</h1><p class="ph-s">계약 하나를 고르면 계약 시작 월부터 이번 달까지 월별 지급액과 합계를 봅니다.</p></div>' +
      '<div class="ph-r"><label class="fld-inline"><span>계약</span><select data-bind="histC">' + contractOptions(V.histC) + '</select></label><button type="button" class="btn" data-act="xls">' + ic('down') + '엑셀 내려받기</button></div></div>' +
      '<dl class="kv inline"><div><dt>크리에이터</dt><dd>' + c.creator + '</dd></div><div><dt>사업자 유형</dt><dd>' + TYPES[c.type].label + '</dd></div><div><dt>계약 시작 월</dt><dd>' + c.start + '</dd></div><div><dt>기간</dt><dd>' + ms.length + '개월</dd></div></dl>' +
      '<div class="tbl-wrap"><table class="grid" id="histTbl"><thead><tr><th>정산 월</th><th class="r">입력 금액</th><th class="r">분배율</th><th class="r">지출 공제</th><th class="r">원천세</th><th class="r">지급액</th><th>상태</th></tr></thead><tbody>' + rows +
      '</tbody><tfoot><tr><td>합계 (' + ms.length + '개월)</td><td class="r" data-label="입력 금액">' + won(tot.G) + '</td><td></td><td class="r" data-label="지출 공제">' + won(tot.ded) + '</td><td class="r" data-label="원천세">' + won(tot.tax) + '</td><td class="r" data-label="지급액" id="histTotal" data-pay="' + tot.pay + '"><b>' + won(tot.pay) + '</b></td><td></td></tr></tfoot></table></div>';
  }

  /* ---------- 6. 엑셀 이관 대조 ---------- */
  var DIFFS = [
    { cid: 'C-101', m: '2026-03', kind: 'round', d: 4 },
    { cid: 'C-301', m: '2026-01', kind: 'round', d: -6 },
    { cid: 'C-201', m: '2026-03', kind: 'rule', skip: '자막 외주' },
    { cid: 'C-401', m: '2026-05', kind: 'manual', d: 50000 },
    { cid: 'C-201', m: '2026-07', kind: 'round', d: 3 },
    { cid: 'C-601', m: '2026-08', kind: 'manual', d: -30000 }
  ];
  var CAUSE = { round: '반올림', manual: '수기 조정', rule: '규칙 누락' };
  var CAUSE_NOTE = { round: '엑셀은 원천세를 반올림, 시스템은 10원 미만 절사', manual: '엑셀 셀에 직접 더하거나 뺀 금액', rule: '엑셀에 공제 항목이 빠져 있음' };
  function buildRecon() {
    var rows = [];
    MONTHS.forEach(function (m) {
      if (!closed[m] || m >= CUR) return;
      active(m).forEach(function (c) {
        var k = calc(c.id, m), x = k.pay, df = null;
        DIFFS.forEach(function (d) { if (d.cid === c.id && d.m === m) df = d; });
        if (df) x = df.kind === 'rule' ? calc(c.id, m, { skip: df.skip }).pay : k.pay + df.d;
        rows.push({ cid: c.id, m: m, xls: x, kind: df ? df.kind : null, cause: df ? df.kind : null, done: false, note: df && df.kind === 'rule' ? '엑셀에 ' + df.skip + ' 공제가 빠져 있음' : (df ? CAUSE_NOTE[df.kind] : '') });
      });
    });
    return { file: '정산내역_2025-07_2026-10.xlsx', rows: rows };
  }
  function vRecon() {
    var head = '<div class="ph"><div><h1>엑셀 이관 대조</h1><p class="ph-s">기존 엑셀의 지급액과 시스템 계산값을 달별로 나란히 놓고, 다른 곳은 원인을 분류해 확인 완료로 정리합니다.</p></div>' +
      '<div class="ph-r"><button type="button" class="btn pri" data-act="upload">' + ic('up') + (V.recon ? '다시 올리기' : '기존 엑셀 올리기') + '</button></div></div>';
    if (!V.recon) return head + '<div class="panel">' + empty('compare', '아직 대조할 엑셀이 없습니다. 지금까지 쓰던 정산 엑셀을 올리면 마감된 달(2025-07 ~ 2026-10)의 지급액을 시스템 계산값과 비교합니다.', '<button type="button" class="btn pri" data-act="upload">' + ic('up') + '기존 엑셀 올리기</button>') + '</div>';
    var R = V.recon.rows;
    R.forEach(function (r) { r.sys = calc(r.cid, r.m).pay; });
    var diff = R.filter(function (r) { return r.xls !== r.sys; }), done = diff.filter(function (r) { return r.done; }).length;
    var sum = '<dl class="sumline" id="reconSum"><div><dt>올린 파일</dt><dd class="fname">' + V.recon.file + '</dd></div><div><dt>전체</dt><dd data-k="all">' + R.length + '건</dd></div><div><dt>일치</dt><dd data-k="ok">' + (R.length - diff.length) + '건</dd></div><div class="' + (diff.length - done ? 'is-miss' : '') + '"><dt>차이</dt><dd data-k="diff">' + diff.length + '건</dd></div><div><dt>확인 완료</dt><dd data-k="done">' + done + ' / ' + diff.length + '건</dd></div></dl>';
    var byM = {};
    R.forEach(function (r) { var o = byM[r.m] = byM[r.m] || { n: 0, d: 0 }; o.n++; if (r.xls !== r.sys) o.d++; });
    var strip = '<div class="mstrip" aria-label="달별 대조 결과">' + Object.keys(byM).map(function (m) { var o = byM[m]; return '<div class="' + (o.d ? 'has-d' : '') + '"><span>' + m.slice(2).replace('-', '.') + '</span><b>' + (o.d ? '차이 ' + o.d : '일치') + '</b></div>'; }).join('') + '</div>';
    var list = (V.reconFilter === 'diff' ? diff : R).slice().sort(function (a, b) { var da = a.xls !== a.sys, db = b.xls !== b.sys; if (da !== db) return da ? -1 : 1; return a.m < b.m ? -1 : a.m > b.m ? 1 : 0; });
    var rows = list.map(function (r) {
      var c = byId[r.cid], d = r.xls - r.sys, isD = d !== 0, key = r.cid + '|' + r.m;
      return '<tr class="' + (isD ? (r.done ? 'd-done' : 'd-open') : '') + '" data-key="' + key + '"><td data-label="정산 월" class="num">' + r.m + '</td><td data-label="크리에이터·계약">' + c.creator + '<span class="sub">' + c.id + ' ' + c.name + '</span></td>' +
        '<td class="r" data-label="엑셀 지급액">' + won(r.xls) + '</td><td class="r" data-label="시스템 지급액">' + won(r.sys) + '</td><td class="r ' + (isD ? 'neg' : '') + '" data-label="차이">' + (isD ? (d > 0 ? '+' : '') + won(d) : '0') + '</td>' +
        '<td data-label="결과">' + (isD ? '<span class="st st-miss">' + ic('alert') + '차이</span>' : '<span class="st st-ok">' + ic('check') + '일치</span>') + '</td>' +
        '<td data-label="원인 분류">' + (isD ? '<select data-bind="cause" data-id="' + key + '" aria-label="원인 분류"' + (r.done ? ' disabled' : '') + '>' + ['round', 'manual', 'rule'].map(function (k) { return '<option value="' + k + '"' + (r.cause === k ? ' selected' : '') + '>' + CAUSE[k] + '</option>'; }).join('') + '</select><span class="sub">' + esc(r.note) + '</span>' : '<span class="sub">-</span>') + '</td>' +
        '<td data-label="처리">' + (isD ? (r.done ? '<span class="st st-ok">' + ic('check') + '확인 완료</span>' : '<button type="button" class="btn sm" data-act="reconDone" data-id="' + key + '">확인 완료</button>') : '') + '</td></tr>';
    }).join('');
    return head + sum + strip +
      '<div class="seg" role="group" aria-label="보기"><button type="button" data-act="reconFilter" data-id="all"' + (V.reconFilter === 'all' ? ' aria-pressed="true"' : ' aria-pressed="false"') + '>전체 ' + R.length + '건</button><button type="button" data-act="reconFilter" data-id="diff"' + (V.reconFilter === 'diff' ? ' aria-pressed="true"' : ' aria-pressed="false"') + '>차이만 ' + diff.length + '건</button></div>' +
      '<div class="tbl-wrap"><table class="grid recon" id="reconTbl"><thead><tr><th>정산 월</th><th>크리에이터·계약</th><th class="r">엑셀 지급액</th><th class="r">시스템 지급액</th><th class="r">차이</th><th>결과</th><th>원인 분류</th><th>처리</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  /* ---------- 모달 ---------- */
  function openModal(html) { var el = $('#modal'); el.innerHTML = '<div class="modal-box" role="dialog" aria-modal="true">' + html + '</div>'; el.hidden = false; var f = $('input, textarea, button.pri', el); if (f) f.focus(); }
  function closeModal() { $('#modal').hidden = true; $('#modal').innerHTML = ''; }
  function fixModal(cid, err) {
    var c = byId[cid], m = V.month, k = calc(cid, m);
    openModal('<div class="modal-h"><h2>마감 후 수정</h2><button type="button" class="ibtn" data-act="modalClose" aria-label="닫기">' + ic('close') + '</button></div>' +
      '<p class="modal-s">' + mLabel(m) + ' · ' + c.creator + ' · ' + c.name + ' (' + c.id + ')<br>마감된 달입니다. 수정 내용과 사유는 수정 이력에 남습니다.</p>' +
      '<dl class="kv"><div><dt>현재 입력 금액</dt><dd>' + won(k.G) + '원</dd></div><div><dt>현재 지급액</dt><dd>' + won(k.pay) + '원</dd></div></dl>' +
      '<label class="fld"><span>새 입력 금액(원)</span><input id="fixAmt" inputmode="numeric" value="' + esc(err && err.v !== undefined ? err.v : won(k.G)) + '"' + (err && err.amt ? ' class="bad"' : '') + '>' + (err && err.amt ? '<span class="ferr">' + err.amt + '</span>' : '') + '</label>' +
      '<label class="fld"><span>수정 사유 (필수)</span><textarea id="fixWhy" rows="3" placeholder="예: 수익 확정치가 다시 통보되어 반영">' + esc(err && err.why ? err.why : '') + '</textarea>' + (err && err.whyMsg ? '<span class="ferr" id="whyErr">' + err.whyMsg + '</span>' : '') + '</label>' +
      '<div class="modal-f"><button type="button" class="btn ghost" data-act="modalClose">취소</button><button type="button" class="btn pri" data-act="fixSave" data-id="' + cid + '">수정 저장</button></div>');
  }
  function closeModalAsk() {
    var t = monthTotals(V.month);
    openModal('<div class="modal-h"><h2>' + mLabel(V.month) + ' 마감</h2><button type="button" class="ibtn" data-act="modalClose" aria-label="닫기">' + ic('close') + '</button></div>' +
      '<p class="modal-s">마감하면 이 달의 입력 칸이 잠깁니다. 마감 뒤 수정은 사유를 적어야 하고 수정 이력에 남습니다.</p>' +
      '<dl class="kv"><div><dt>계약</dt><dd>' + t.n + '건</dd></div><div><dt>입력 금액 합계</dt><dd>' + won(t.G) + '원</dd></div><div><dt>지급액 합계</dt><dd>' + won(t.pay) + '원</dd></div></dl>' +
      '<div class="modal-f"><button type="button" class="btn ghost" data-act="modalClose">취소</button><button type="button" class="btn pri" data-act="closeDo">마감하기</button></div>');
  }

  /* ---------- 시연 안내 ---------- */
  var GUIDE = [
    ['settle', '월 정산에서 크리에이터 A 영상 광고(C-101)의 11월 입력 금액을 5,000,000으로 고치고 Enter. 지급액과 합계가 다시 계산됩니다.'],
    ['settle', '그 행을 눌러 계산 근거를 펼칩니다. 입력 금액 → 분배율 → 지출 공제 → 원천세 → 지급액 순서와 각 규칙의 적용 시작 월이 보입니다.'],
    ['contract', '크리에이터·계약에서 C-101 분배율을 75%, 적용 시작 월 2026-11로 저장합니다. 이어서 10월 정산을 열어 지급액이 그대로인지 확인합니다.'],
    ['settle', '11월 정산의 입력 전 2건(C-301, C-701)을 채우고 이번 달 마감. 마감 뒤 행의 수정 버튼에서 사유를 적고, 월 마감·수정 이력에서 전·후 값을 확인합니다.'],
    ['history', '월별 내역 조회에서 계약을 골라 계약 시작 월부터의 지급액과 합계를 보고 엑셀 내려받기를 눌러 봅니다.'],
    ['recon', '엑셀 이관 대조에서 기존 엑셀 올리기. 차이 행의 원인 분류(반올림·수기 조정·규칙 누락)를 확인하고 확인 완료로 정리합니다.']
  ];
  var guideMin = window.matchMedia('(max-width: 1100px)').matches;
  function renderGuide() {
    var g = $('#guide');
    g.classList.toggle('min', guideMin);
    document.body.classList.toggle('guide-open', !guideMin);
    if (guideMin) { g.innerHTML = '<button type="button" class="guide-pill" data-act="guide" aria-expanded="false">' + ic('book') + '시연 안내 펼치기</button>'; return; }
    g.innerHTML = '<div class="guide-h"><b>' + ic('book') + '시연 안내</b><button type="button" class="ibtn" data-act="guide" aria-expanded="true" aria-label="시연 안내 접기">' + ic('close') + '</button></div>' +
      '<ol>' + GUIDE.map(function (s, i) { return '<li><span class="gn">' + (i + 1) + '.</span><div><p>' + s[1] + '</p><button type="button" class="link" data-act="go" data-id="' + s[0] + '" data-guide="' + i + '">이 화면으로</button></div></li>'; }).join('') + '</ol>';
  }

  /* ---------- 렌더 ---------- */
  var VIEWS = { settle: vSettle, contract: vContract, deduct: vDeduct, close: vClose, history: vHistory, recon: vRecon };
  function render() { renderNav(); $('#view').innerHTML = VIEWS[V.view](); }

  function parseAmt(s) { s = String(s).replace(/[,\s원]/g, ''); if (!/^\d+$/.test(s)) return null; var n = parseInt(s, 10); return n > 9999999999 ? null : n; }

  function commitAmt(inp) {
    var cid = inp.dataset.id, raw = inp.value.trim(), m = V.month;
    if (raw === '' && INPUT[cid][m] === undefined) return;
    var n = parseAmt(raw);
    if (n === null) { V.err[cid] = { v: raw, msg: '숫자만 넣어 주세요 (원 단위)' }; render(); return; }
    delete V.err[cid];
    if (INPUT[cid][m] === n) { render(); return; }
    run('지급액 계산 중...', function () {
      INPUT[cid][m] = n;
      var k = calc(cid, m);
      return byId[cid].creator + ' ' + cid + ' 지급액 ' + won(k.pay) + '원으로 다시 계산했습니다';
    });
  }

  /* ---------- 이벤트 ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-act]');
    if (!t || lock) return;
    if (e.target.closest('input, select, textarea') && t.tagName === 'TR') return;
    var a = t.dataset.act, id = t.dataset.id;
    if (a === 'none') return;
    if (a === 'menu') { V.menu = !V.menu; renderNav(); return; }
    if (a === 'menuClose') { V.menu = false; renderNav(); return; }
    if (a === 'go') {
      V.menu = false; V.view = id; V.err = {}; V.open = null; if (id === 'settle') V.month = V.month || CUR;
      render(); window.scrollTo(0, 0); return;
    }
    if (a === 'guide') { guideMin = !guideMin; renderGuide(); return; }
    if (a === 'toggle') { e.stopPropagation(); V.open = V.open === id ? null : id; render(); return; }
    if (a === 'focusAmt') { var i = $('input[data-bind="amt"][data-id="' + id + '"]'); if (i) { i.focus(); i.scrollIntoView({ block: 'center' }); } return; }
    if (a === 'closeAsk') { closeModalAsk(); return; }
    if (a === 'modalClose') { closeModal(); return; }
    if (a === 'closeDo') {
      closeModal();
      run('마감 처리 중...', function () {
        var m = V.month, at = now(); closed[m] = at;
        AUDIT.unshift({ at: at, who: '김○○', month: m, cid: '', what: '월 마감', before: '작성 중', after: '마감', reason: mLabel(m) + ' 정산 확정' });
        return mLabel(m) + ' 정산을 마감했습니다. 입력 칸이 잠겼습니다';
      }, 550); return;
    }
    if (a === 'fix') { e.stopPropagation(); fixModal(id); return; }
    if (a === 'fixSave') {
      var v = $('#fixAmt').value, why = $('#fixWhy').value.trim(), n = parseAmt(v), err = {};
      if (n === null) err.amt = '숫자만 넣어 주세요 (원 단위)';
      if (!why) err.whyMsg = '마감 후 수정은 사유를 적어야 저장할 수 있습니다';
      if (err.amt || err.whyMsg) { err.v = v; err.why = why; fixModal(id, err); return; }
      var m = V.month, before = INPUT[id][m];
      if (n === before) { closeModal(); toast('바뀐 금액이 없어 저장하지 않았습니다'); return; }
      closeModal();
      run('수정 내용 저장 중...', function () {
        var pb = calc(id, m).pay; INPUT[id][m] = n; var pa = calc(id, m).pay;
        AUDIT.unshift({ at: now(), who: '김○○', month: m, cid: id, what: '입력 금액 (지급액 ' + won(pb) + ' → ' + won(pa) + ')', before: won(before), after: won(n), reason: why });
        return '수정했습니다. 수정 이력에 남겼습니다';
      }); return;
    }
    if (a === 'conPick') { V.conSel = id; V.conNote = null; V.err = {}; render(); var d = $('#conDetail'); if (d) d.scrollIntoView({ block: 'start' }); return; }
    if (a === 'conClose') { V.conSel = null; V.conNote = null; V.err = {}; render(); return; }
    if (a === 'rateSave') {
      var c = byId[V.conSel], raw = $('#newRate').value.trim(), from = $('#rateFrom').value, r = /^\d{1,3}$/.test(raw) ? +raw : NaN;
      if (!(r >= 1 && r <= 100)) { V.err.rate = { v: raw, msg: '1~100 사이 숫자로 넣어 주세요' }; render(); return; }
      delete V.err.rate;
      run('분배율 저장 중...', function () {
        var before = rateAt(c, from).rate;
        c.rates = c.rates.filter(function (x) { return x.from !== from; }); c.rates.push({ from: from, rate: r });
        c.rateLog.push({ from: from, rate: r, before: before, at: now(), who: '김○○' });
        var p = prevM(from);
        V.conNote = { text: from + '부터 분배율 ' + r + '%를 적용합니다. ' + p + ' 이전 정산의 지급액은 바뀌지 않습니다.' };
        return c.id + ' 분배율 변경을 저장했습니다 (' + from + '부터 ' + r + '%)';
      }); return;
    }
    if (a === 'goMonth') { V.view = 'settle'; V.month = id; V.open = null; V.err = {}; render(); window.scrollTo(0, 0); return; }
    if (a === 'dedEdit') { V.dedEdit = +id >= 0 ? +id : null; render(); return; }
    if (a === 'dedUpd') {
      var c2 = byId[V.dedC], it = c2.deds[+id], n2 = parseAmt($('#dedNewAmt').value), f2 = $('#dedNewFrom').value;
      if (n2 === null) { toast('금액은 숫자만 넣어 주세요'); return; }
      run('공제 항목 저장 중...', function () {
        it.v = it.v.filter(function (x) { return x.from !== f2; }); it.v.push({ from: f2, amount: n2 }); it.v.sort(function (x, y) { return x.from < y.from ? -1 : 1; });
        V.dedEdit = null; return it.name + ' ' + f2 + '부터 ' + won(n2) + '원으로 바꿨습니다';
      }); return;
    }
    if (a === 'focusDed') { $('#dedName').focus(); return; }
    if (a === 'dedAdd') {
      var nm = $('#dedName').value.trim(), am = $('#dedAmt').value.trim(), fr = $('#dedFrom').value, na = parseAmt(am), er = { name: nm, amt: am };
      if (!nm) er.nameMsg = '항목명을 넣어 주세요';
      if (na === null || na === 0) er.amtMsg = '1원 이상 숫자로 넣어 주세요';
      if (er.nameMsg || er.amtMsg) { V.err.ded = er; render(); return; }
      delete V.err.ded;
      run('공제 항목 저장 중...', function () {
        byId[V.dedC].deds.push({ name: nm, v: [{ from: fr, amount: na }] });
        return V.dedC + ' 계약에 ' + nm + ' ' + won(na) + '원을 ' + fr + '부터 공제합니다';
      }); return;
    }
    if (a === 'xls') { var c3 = byId[V.histC]; run('엑셀 파일 만드는 중...', function () { return c3.id + '_월별내역.xlsx 준비 완료 (시연용이라 파일은 만들지 않습니다)'; }); return; }
    if (a === 'upload') { run('엑셀 대조 중...', function () { V.recon = buildRecon(); V.reconFilter = 'all'; var d = V.recon.rows.filter(function (r) { return r.xls !== calc(r.cid, r.m).pay; }).length; return '대조를 마쳤습니다. 전체 ' + V.recon.rows.length + '건 중 차이 ' + d + '건'; }, 600); return; }
    if (a === 'reconFilter') { V.reconFilter = id; render(); return; }
    if (a === 'reconDone') {
      var row = V.recon.rows.filter(function (r) { return r.cid + '|' + r.m === id; })[0];
      run('확인 처리 중...', function () { row.done = true; return row.m + ' ' + row.cid + ' 차이를 ' + CAUSE[row.cause] + '(으)로 확인 완료했습니다'; }, 350); return;
    }
  });
  document.addEventListener('change', function (e) {
    var b = e.target.dataset.bind;
    if (b === 'month') { V.month = e.target.value; V.open = null; V.err = {}; run('정산 불러오는 중...', function () { return null; }, 320); }
    else if (b === 'dedC') { V.dedC = e.target.value; V.dedEdit = null; V.err = {}; run('공제 항목 불러오는 중...', function () { return null; }, 320); }
    else if (b === 'histC') { V.histC = e.target.value; run('월별 내역 불러오는 중...', function () { return null; }, 320); }
    else if (b === 'cause') { var row = V.recon.rows.filter(function (r) { return r.cid + '|' + r.m === e.target.dataset.id; })[0]; row.cause = e.target.value; }
    else if (b === 'amt') commitAmt(e.target);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target.dataset && e.target.dataset.bind === 'amt') { e.preventDefault(); e.target.blur(); }
    if (e.key === 'Escape' && !$('#modal').hidden) closeModal();
  });
  $('#modal').addEventListener('click', function (e) { if (e.target.id === 'modal') closeModal(); });

  renderGuide(); render();
})();
