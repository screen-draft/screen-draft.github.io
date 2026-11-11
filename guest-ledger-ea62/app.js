(function () {
  'use strict';

  /* ---------- helpers ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var html = document.documentElement;

  var P = {
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    grid: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>',
    building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/>',
    flow: '<path d="m3 17 2 2 4-4M3 7l2 2 4-4M13 6h8M13 12h8M13 18h8"/>',
    devices: '<path d="M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8M10 19v-4M7 19h5"/><rect x="16" y="12" width="6" height="10" rx="2"/>',
    admin: '<circle cx="9" cy="7" r="4"/><path d="M10 15H6a4 4 0 0 0-4 4v2"/><circle cx="18" cy="16" r="3"/><path d="M18 11.5v1.5M18 19v1.5M22.5 16H21M15 16h-1.5"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    unlock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>',
    open: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    pause: '<circle cx="12" cy="12" r="10"/><path d="M10 15V9M14 15V9"/>',
    eye: '<path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"/><circle cx="12" cy="12" r="3"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    key: '<path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4M21 2l-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/>',
    userplus: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
    bell: '<path d="M10.27 21a2 2 0 0 0 3.46 0M3.26 15.33A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.67C19.41 13.96 18 12.5 18 8A6 6 0 0 0 6 8c0 4.5-1.41 5.96-2.74 7.33"/>',
    book: '<path d="M12 7v14M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    back: '<path d="m12 19-7-7 7-7M19 12H5"/>',
    import: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>'
  };
  var ic = function (n, cls) { return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + P[n] + '</svg>'; };

  /* ---------- simulated clock ---------- */
  var clock = new Date(2026, 10, 11, 14, 20, 5).getTime();
  function tick(sec) { clock += sec * 1000; return clock; }
  function p2(n) { return (n < 10 ? '0' : '') + n; }
  function fmt(t) { var d = new Date(t); return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()) + ' ' + p2(d.getHours()) + ':' + p2(d.getMinutes()) + ':' + p2(d.getSeconds()); }
  function hm(t) { var d = new Date(t); return p2(d.getHours()) + ':' + p2(d.getMinutes()); }

  /* ---------- data ---------- */
  var ACCTS = {
    A: { label: '업체 A 운영자', biz: '○○스테이', id: 'acct_a1', person: '김○○', role: '대표' },
    B: { label: '업체 B 운영자', biz: '△△하우스', id: 'acct_b2', person: '박○○', role: '대표' },
    SA: { label: '슈퍼어드민', biz: '머뭄장부 운영팀', id: 'platform', person: '정○○', role: '슈퍼어드민' }
  };

  // [method, path, ownExpected, crossExpected, anonExpected, where]
  var ROUTES = [
    ['GET', '/properties', '200', '0건', '401', 'propertyRepo.list'],
    ['GET', '/properties/:id', '200', '404', '401', 'propertyRepo.findById'],
    ['PATCH', '/properties/:id', '200', '404', '401', 'propertyRepo.update'],
    ['GET', '/reservations', '200', '0건', '401', 'reservationRepo.list'],
    ['GET', '/reservations/:id', '200', '404', '401', 'reservationRepo.findById'],
    ['PATCH', '/reservations/:id', '200', '404', '401', 'reservationRepo.update'],
    ['DELETE', '/reservations/:id', '200', '404', '401', 'reservationRepo.cancel'],
    ['GET', '/rates/:propertyId', '200', '403', '401', 'rateRepo.byProperty'],
    ['PUT', '/rates/:propertyId', '200', '403', '401', 'rateRepo.upsert'],
    ['GET', '/cohosts', '200', '0건', '401', 'memberRepo.list'],
    ['POST', '/cohosts/invite', '200', '403', '401', 'memberRepo.invite'],
    ['DELETE', '/cohosts/:id', '200', '404', '401', 'memberRepo.remove'],
    ['GET', '/cleaning-tasks', '200', '0건', '401', 'taskRepo.list'],
    ['PATCH', '/cleaning-tasks/:id', '200', '404', '401', 'taskRepo.update'],
    ['GET', '/channel/connection', '200', '403', '401', 'channelRepo.get'],
    ['PUT', '/channel/connection', '200', '403', '401', 'channelRepo.save'],
    ['POST', '/channel/import', '200', '403', '401', 'channelRepo.importProperties'],
    ['POST', '/webhooks/channel', '200', '403', '401', 'webhook.resolveAccountByPropId'],
    ['GET', '/sessions', '200', '0건', '401', 'sessionRepo.list'],
    ['DELETE', '/sessions/:id', '200', '404', '401', 'sessionRepo.revoke'],
    ['GET', '/reports/monthly', '200', '0건', '401', 'reportRepo.monthly']
  ];
  var LEAK_ROW = 4; // GET /reservations/:id

  var ROLES = [
    { name: '대표', note: '업체당 1명', cells: ['rw', 'rw', 'rw', 'rw', 'rw', 'rw', 'rw', 'r'] },
    { name: '공동호스트', note: '대표가 초대', cells: ['r', 'rw', 'rw', 'r', '-', 'rw', 'own', 'r'] },
    { name: '청소 담당', note: '대표·공동호스트가 초대', cells: ['r', 'r', '-', '-', '-', 'rw', 'own', '-'] },
    { name: '슈퍼어드민', note: '플랫폼 운영', cells: ['log', 'log', 'log', 'log', 'log', 'log', 'rw', 'log'] }
  ];
  var FEATURES = [
    ['숙소', 'property'], ['예약', 'reservation'], ['요금', 'rate'], ['구성원', 'member'],
    ['연동 설정', 'channel'], ['청소 일정', 'cleaning'], ['로그인 기기', 'session'], ['보고서', 'report']
  ];

  var DATA = {
    A: {
      props: [
        { name: '○○스테이 본관 201호', pid: 'bx-30117', rooms: 1, today: '입실 예정' },
        { name: '○○스테이 본관 202호', pid: 'bx-30118', rooms: 1, today: '투숙 중' },
        { name: '○○스테이 별채', pid: 'bx-30140', rooms: 2, today: '청소 대기' }
      ],
      res: [
        ['R-A-7712', '본관 201호', '김○○', '11-11', 2, '베드24 · 직접', '확정'],
        ['R-A-7715', '본관 202호', '이○○', '11-10', 3, '베드24 · OTA', '투숙 중'],
        ['R-A-7721', '별채', '최○○', '11-14', 1, '베드24 · OTA', '확정'],
        ['R-A-7730', '본관 201호', '한○○', '11-15', 2, '베드24 · 직접', '확정'],
        ['R-A-7734', '별채', '서○○', '11-21', 2, '베드24 · OTA', '결제 대기'],
        ['R-A-7740', '본관 202호', '윤○○', '11-22', 1, '베드24 · OTA', '확정']
      ]
    },
    B: {
      props: [
        { name: '△△하우스 바다동', pid: 'bx-52904', rooms: 3, today: '투숙 중' },
        { name: '△△하우스 숲동', pid: 'bx-52911', rooms: 2, today: '공실' }
      ],
      res: [
        ['R-B-3051', '바다동', '박○○', '11-11', 1, '베드24 · OTA', '투숙 중'],
        ['R-B-3058', '바다동', '오○○', '11-13', 2, '베드24 · 직접', '확정'],
        ['R-B-3062', '숲동', '장○○', '11-16', 3, '베드24 · OTA', '확정'],
        ['R-B-3070', '숲동', '임○○', '11-20', 1, '베드24 · OTA', '취소 요청'],
        ['R-B-3077', '바다동', '신○○', '11-28', 2, '베드24 · 직접', '확정']
      ]
    }
  };

  var STEP_NAMES = ['사업장 정보', '베드24 연결', '숙소 가져오기', '공동호스트 초대', '완료'];
  var CHANNEL_PROPS = [
    { pid: 'bx-40211', name: '□□민박 본채', rooms: 2 },
    { pid: 'bx-40212', name: '□□민박 별채', rooms: 1 },
    { pid: 'bx-40388', name: '□□민박 독채 A', rooms: 1 },
    { pid: 'bx-40389', name: '□□민박 독채 B', rooms: 1 }
  ];

  function freshOnb() {
    return {
      step: 1,
      biz: { name: '□□민박', owner: '최○○', rooms: '5', region: '강원 ○○군' },
      key: '', keyState: null,
      registered: ['bx-40211'], // imported in an earlier attempt
      selected: [],
      invites: [],
      away: false, savedAt: clock
    };
  }

  var S = {
    acct: 'A',
    leak: false,
    run: { no: 13, at: clock, sec: 4.2 },
    onb: freshOnb(),
    devices: {
      A: [
        { id: 'ses_a_01', dev: 'macOS · Chrome', last: '방금 전', loc: '서울 종로구 근처', current: true, state: 'on' },
        { id: 'ses_a_02', dev: 'iPhone · Safari', last: '오늘 12:08', loc: '서울 근처', state: 'on' },
        { id: 'ses_a_03', dev: 'Windows · Edge', last: '오늘 09:14', loc: '부산 근처', state: 'on', fresh: true },
        { id: 'ses_a_04', dev: 'iPad · Safari', last: '11-03 21:40', loc: '강원 근처', state: 'on' }
      ],
      B: [
        { id: 'ses_b_01', dev: 'Windows · Chrome', last: '방금 전', loc: '제주 근처', current: true, state: 'on' },
        { id: 'ses_b_02', dev: 'Android · Chrome', last: '오늘 08:51', loc: '제주 근처', state: 'on' },
        { id: 'ses_b_03', dev: 'macOS · Safari', last: '오늘 10:02', loc: '대구 근처', state: 'on', fresh: true }
      ],
      SA: [
        { id: 'ses_p_01', dev: 'macOS · Chrome', last: '방금 전', loc: '서울 근처', current: true, state: 'on' },
        { id: 'ses_p_02', dev: 'Windows · Chrome', last: '11-10 18:22', loc: '서울 근처', state: 'on' }
      ]
    },
    customers: [
      { id: 'acct_a1', biz: '○○스테이', owner: '김○○', joined: '2026-10-02', step: 5, state: 'on', props: 3 },
      { id: 'acct_b2', biz: '△△하우스', owner: '박○○', joined: '2026-10-19', step: 5, state: 'on', props: 2 },
      { id: 'acct_c3', biz: '□□민박', owner: '최○○', joined: '2026-11-11', step: 0, state: 'on', props: 0 },
      { id: 'acct_d4', biz: '◇◇펜션', owner: '이○○', joined: '2026-11-06', step: 1, state: 'on', props: 0, stuck: '베드24 연결 실패 2회' },
      { id: 'acct_e5', biz: '▽▽게스트하우스', owner: '정○○', joined: '2026-09-28', step: 5, state: 'on', props: 4 }
    ],
    log: [],
    adminNote: null
  };

  /* ---------- busy / toast / dialog ---------- */
  var busy = false;
  function act(text, fn, done) {
    if (busy) return;
    busy = true;
    html.classList.add('is-busy');
    var b = $('#busy');
    b.innerHTML = '<span class="spin" aria-hidden="true"></span>' + esc(text);
    b.hidden = false;
    var ms = 320 + Math.round(Math.random() * 260);
    setTimeout(function () {
      b.hidden = true;
      html.classList.remove('is-busy');
      busy = false;
      var msg = fn ? fn() : null;
      render();
      var t = typeof msg === 'string' ? msg : done;
      if (t) toast(t);
    }, ms);
  }
  function toast(t) {
    var el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = ic('check') + '<span>' + esc(t) + '</span>';
    var box = $('#toasts');
    box.appendChild(el);
    while (box.children.length > 2) box.removeChild(box.firstChild);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 2800);
  }
  var dlgCb = null;
  function confirmDlg(title, bodyHtml, okLabel, cb, danger) {
    dlgCb = cb;
    var d = $('#dlg');
    d.innerHTML = '<div class="dlg" role="dialog" aria-modal="true" aria-labelledby="dlgT"><h2 id="dlgT">' + esc(title) + '</h2><div class="dlg-b">' + bodyHtml + '</div><div class="dlg-f"><button class="btn" data-act="dlg-no">취소</button><button class="btn ' + (danger ? 'danger solid' : 'primary') + '" data-act="dlg-ok">' + esc(okLabel) + '</button></div></div>';
    d.hidden = false;
    $('[data-act="dlg-ok"]', d).focus();
  }
  function closeDlg() { $('#dlg').hidden = true; $('#dlg').innerHTML = ''; }

  /* ---------- routing ---------- */
  var NAV = [
    { sec: '격리·권한' },
    { r: 'isolation', label: '격리 시험 결과', icon: 'shield' },
    { r: 'roles', label: '역할별 권한', icon: 'grid' },
    { sec: '업체 운영' },
    { r: 'accounts', label: '숙소·예약', icon: 'building' },
    { r: 'onboarding', label: '셀프 온보딩', icon: 'flow' },
    { r: 'devices', label: '로그인 기기', icon: 'devices' },
    { sec: '플랫폼' },
    { r: 'admin', label: '고객 관리', icon: 'admin' }
  ];
  function route() {
    var h = (location.hash || '').replace(/^#\/?/, '');
    var parts = h.split('/');
    var name = parts[0] || 'isolation';
    if (name === 'reservations' && parts[1]) return { name: 'res', id: decodeURIComponent(parts[1]) };
    var ok = NAV.some(function (n) { return n.r === name; });
    return { name: ok ? name : 'isolation' };
  }
  var prevRoute = null;
  window.addEventListener('hashchange', function () {
    var r = route();
    if (prevRoute === 'onboarding' && r.name !== 'onboarding' && S.onb.step > 1 && S.onb.step < 5) S.onb.away = true;
    render(true);
  });

  /* ---------- screens ---------- */
  function cellTag(v) {
    if (v === '200') return '<span class="tag t-ok">허용 200</span>';
    if (v === '0건') return '<span class="tag t-zero">0건</span>';
    return '<span class="tag t-deny">거부 ' + v + '</span>';
  }
  function isoResults() {
    return ROUTES.map(function (r, i) {
      var actualCross = (S.leak && i === LEAK_ROW) ? '200' : r[3];
      return { r: r, cross: actualCross, fail: actualCross !== r[3] };
    });
  }
  function viewIsolation() {
    var rows = isoResults();
    var total = rows.length * 3;
    var fails = rows.filter(function (x) { return x.fail; }).length;
    var pass = total - fails;
    var h = '';
    h += '<div class="intro"><p>이 화면은 시험용 업체 A의 권한으로 업체 B의 숙소·예약을 열어 보고, 서버의 모든 라우트가 막는지를 표로 보여 줍니다.</p><p>화면의 업체·숙소·예약은 모두 예시이며, 실제 시험은 같은 표를 Vitest로 출력합니다.</p></div>';
    h += '<div class="page-h"><div><h1>격리 시험 결과</h1><p>등록된 라우트 ' + ROUTES.length + '개를 업체 A 권한으로 호출합니다. 자기 자원은 허용, 업체 B 자원과 비로그인은 거부, 목록에는 B 데이터 0건이어야 통과입니다.</p></div>';
    h += '<div class="tools"><button class="btn primary" data-act="rerun">' + ic('refresh') + '시험 다시 실행</button><button class="btn" data-act="report">' + ic('download') + '보고서 내려받기</button>';
    h += '<button class="switch" role="switch" aria-checked="' + S.leak + '" data-act="leak" id="leakSwitch"><span class="knob" aria-hidden="true"></span>격리 누락 예시 보기</button></div></div>';
    h += '<dl class="summary" id="isoSummary">';
    h += '<div><dt>통과</dt><dd class="' + (fails ? '' : 'is-ok') + '" id="passCount" data-pass="' + pass + '" data-total="' + total + '">' + pass + ' <small>/ ' + total + '건</small></dd></div>';
    h += '<div><dt>실패</dt><dd class="' + (fails ? 'is-bad' : '') + '" id="failCount" data-fail="' + fails + '">' + fails + ' <small>건</small></dd></div>';
    h += '<div><dt>라우트 × 역할</dt><dd>' + ROUTES.length + ' <small>× 3열</small></dd></div>';
    h += '<div class="run"><dt>마지막 실행</dt><dd id="runInfo" data-run="' + S.run.no + '"><span class="mono">#' + S.run.no + '</span> · ' + fmt(S.run.at) + ' · ' + S.run.sec.toFixed(1) + '초<br>Vitest · Workers 런타임 · 로컬 D1 · 시험 계정 <span class="mono">acct_test_a → acct_test_b</span></dd></div>';
    h += '</dl>';
    if (S.leak) {
      h += '<div class="notice bad" id="leakNotice">' + ic('alert') + '<div><p><b>실패 1건: GET /reservations/:id 가 업체 B 예약을 돌려줬습니다.</b></p><div class="leak-box" id="leakDetail"><span><b>열린 경로</b> <span class="mono">GET /reservations/:id</span> → <span class="mono">reservationRepo.findById(id)</span> 에 계정 ID 인자가 없습니다.</span><span>업체 A 세션으로 <span class="mono">/reservations/R-B-3051</span> 을 요청하면 업체 B 예약이 200으로 반환됩니다 (기대 404).</span><span>조치: <span class="mono">reservationRepo.findById(accountId, id)</span> 로 바꾸면 다시 통과합니다. 토글을 끄면 수정된 코드로 다시 시험합니다.</span></div></div></div>';
    } else {
      h += '<div class="notice ok">' + ic('shield') + '<div><p><b>전체 ' + total + '건 통과, 실패 0.</b> 업체 A 권한으로는 업체 B의 어떤 자원도 열리지 않았습니다.</p></div></div>';
    }
    h += '<div class="tbl-wrap"><table class="iso" id="isoTable"><thead><tr><th>라우트</th><th>업체 A → 자기 자원<small>기대: 허용</small></th><th>업체 A → 업체 B 자원<small>기대: 거부 또는 0건</small></th><th>비로그인<small>기대: 거부 401</small></th><th>판정</th></tr></thead><tbody>';
    rows.forEach(function (x) {
      var r = x.r, m = r[0].toLowerCase();
      h += '<tr class="' + (x.fail ? 'row-fail' : '') + '" data-route="' + esc(r[0] + ' ' + r[1]) + '" data-verdict="' + (x.fail ? 'fail' : 'pass') + '">';
      h += '<td><span class="route"><span class="mth m-' + m + '">' + r[0] + '</span><span class="mono">' + esc(r[1]) + '</span></span></td>';
      h += '<td>' + cellTag(r[2]) + '</td>';
      h += '<td>' + (x.fail ? '<span class="tag t-bad">허용 200</span><span class="cell-exp">기대 거부 ' + r[3] + '</span>' : cellTag(r[3])) + '</td>';
      h += '<td>' + cellTag(r[4]) + '</td>';
      h += '<td>' + (x.fail ? '<span class="tag v-fail">실패</span>' : '<span class="tag v-pass">통과</span>') + '</td></tr>';
      if (x.fail) {
        h += '<tr class="leak"><td colspan="5"><b>열린 경로</b> <span class="mono">' + r[5] + '(id)</span> · 계정 ID 조건 없음 · 업체 B 예약 R-B-3051 반환</td></tr>';
      }
    });
    h += '</tbody></table></div>';
    h += '<div class="legend"><span>' + cellTag('200') + ' 정상 응답</span><span>' + cellTag('404') + cellTag('403') + ' 다른 계정 자원은 존재 여부도 알리지 않음</span><span>' + cellTag('0건') + ' 목록에 업체 B 데이터 없음</span><span>' + cellTag('401') + ' 로그인 필요</span></div>';
    return h;
  }

  function viewRoles() {
    var lab = { rw: '<span class="tag t-acc">조회·변경</span>', r: '<span class="tag t-deny">조회</span>', '-': '<span class="muted">없음</span>', own: '<span class="tag t-deny">본인 기기</span>', log: '<span class="tag t-warn">열람 기록</span>' };
    var h = '<div class="page-h"><div><h1>역할별 권한</h1><p>역할마다 기능별로 조회·변경할 수 있는지 보여 줍니다. 슈퍼어드민의 고객 데이터 열람은 별도 경로로만 가능하고 기록이 남습니다.</p></div></div>';
    h += '<div class="tbl-wrap"><table class="perm" id="permTable"><thead><tr><th>역할</th>';
    FEATURES.forEach(function (f) { h += '<th>' + f[0] + '<small class="mono">' + f[1] + ':*</small></th>'; });
    h += '</tr></thead><tbody>';
    ROLES.forEach(function (r) {
      h += '<tr><td><b>' + r.name + '</b><span>' + r.note + '</span></td>';
      r.cells.forEach(function (c) { h += '<td>' + lab[c] + '</td>'; });
      h += '</tr>';
    });
    h += '</tbody></table></div>';
    h += '<div class="legend"><span>' + lab.rw + ' 읽기·쓰기 권한</span><span>' + lab.r + ' 읽기 권한만</span><span>' + lab.log + ' 별도 경로 열람, 기록 남음</span></div>';
    h += '<p class="foot-note" id="permNote">' + ic('info') + '<span>이 표는 서버의 권한 선언(라우트마다 붙는 <span class="mono">requirePerm(\'reservation:write\')</span> 같은 선언)에서 그대로 그려집니다. 선언이 바뀌면 표도 바뀌므로 화면과 실제 동작이 어긋나지 않습니다.</span></p>';
    return h;
  }

  function viewAccounts() {
    if (S.acct === 'SA') {
      return '<div class="page-h"><div><h1>숙소·예약</h1></div></div>' + empty('lock', '슈퍼어드민은 업체 화면에 소속이 없습니다', '고객 데이터는 고객 관리의 별도 열람 경로로만 보고, 열람할 때마다 기록이 남습니다. 계정 전환 체험은 보는 계정을 업체 A나 B로 바꿔서 하세요.', 'go-acct-A', '업체 A 운영자로 보기');
    }
    var a = ACCTS[S.acct], d = DATA[S.acct], other = S.acct === 'A' ? 'B' : 'A';
    var probeId = DATA[other].res[0][0];
    var h = '<div class="page-h"><div><h1>숙소·예약</h1><p>상단의 보는 계정을 업체 A ↔ 업체 B로 바꾸면 숙소와 예약 목록이 완전히 바뀝니다. 같은 화면, 같은 코드, 다른 계정입니다.</p></div></div>';
    h += '<div class="acct-head" id="acctHead" data-acct="' + S.acct + '"><div class="who-is"><span class="muted" style="font-size:12px">지금 보는 계정</span><b>' + a.label + ' · ' + a.biz + '</b><span class="mono muted">account_id = ' + a.id + '</span></div><button class="btn" data-act="go-acct-' + other + '">' + ic('refresh') + ACCTS[other].label + '로 바꾸기</button></div>';
    h += '<div class="two"><section class="sec"><div class="sec-h"><div><h2>숙소 ' + d.props.length + '곳</h2></div></div><div class="tbl-wrap"><table id="propTable"><thead><tr><th>숙소</th><th>베드24 숙소 ID</th><th class="num">객실</th><th>오늘</th></tr></thead><tbody>';
    d.props.forEach(function (p) { h += '<tr><td data-prop>' + p.name + '</td><td class="mono">' + p.pid + '</td><td class="num">' + p.rooms + '</td><td>' + p.today + '</td></tr>'; });
    h += '</tbody></table></div></section>';
    h += '<section class="sec"><div class="sec-h"><div><h2>요약</h2></div></div><div class="tbl-wrap"><table><tbody>';
    var stay = d.res.filter(function (r) { return r[6] === '투숙 중'; }).length;
    h += '<tr><td>11월 예약</td><td class="num"><b>' + d.res.length + '</b>건</td></tr><tr><td>오늘 투숙 중</td><td class="num"><b>' + stay + '</b>건</td></tr><tr><td>베드24 동기화</td><td class="num">' + (S.acct === 'A' ? '14:18' : '14:16') + ' 완료</td></tr><tr><td>구성원</td><td class="num">' + (S.acct === 'A' ? '대표 1 · 공동호스트 1 · 청소 1' : '대표 1 · 청소 2') + '</td></tr>';
    h += '</tbody></table></div></section></div>';
    h += '<section class="sec"><div class="sec-h"><div><h2>예약 ' + d.res.length + '건</h2><p>예약번호를 누르면 상세 주소 <span class="mono">/reservations/:id</span> 로 엽니다.</p></div></div>';
    h += '<div class="tbl-wrap"><table id="resTable" style="min-width:600px"><thead><tr><th>예약번호</th><th>숙소</th><th>투숙객</th><th>체크인</th><th class="num">박</th><th>채널</th><th>상태</th></tr></thead><tbody>';
    d.res.forEach(function (r) {
      var st = r[6] === '확정' ? 't-acc' : r[6] === '투숙 중' ? 't-ok' : 't-warn';
      h += '<tr><td><a class="rlink" data-res-id="' + r[0] + '" href="#/reservations/' + r[0] + '">' + r[0] + '</a></td><td>' + r[1] + '</td><td>' + r[2] + '</td><td>' + r[3] + '</td><td class="num">' + r[4] + '</td><td>' + r[5] + '</td><td><span class="tag ' + st + '">' + r[6] + '</span></td></tr>';
    });
    h += '</tbody></table></div></section>';
    h += '<div class="probe"><p>' + ACCTS[other].biz + '(업체 ' + other + ')의 예약 주소를 지금 계정으로 직접 열어 봅니다.<br><span class="mono">GET /reservations/' + probeId + '</span></p><a class="btn" id="probeBtn" href="#/reservations/' + probeId + '">' + ic('open') + '업체 ' + other + ' 예약 주소 직접 열기</a></div>';
    return h;
  }

  function findRes(id) {
    var out = null;
    ['A', 'B'].forEach(function (k) { DATA[k].res.forEach(function (r) { if (r[0] === id) out = { acct: k, r: r }; }); });
    return out;
  }
  function viewRes(id) {
    var f = findRes(id), a = ACCTS[S.acct];
    if (f && f.acct === S.acct) {
      var r = f.r;
      var h = '<div class="page-h"><div><h1>예약 <span class="mono" style="font-size:18px">' + r[0] + '</span></h1><p>' + a.biz + ' · account_id <span class="mono">' + a.id + '</span></p></div><div class="tools"><a class="btn" href="#/accounts">' + ic('back') + '예약 목록으로</a></div></div>';
      h += '<div class="tbl-wrap" style="max-width:640px"><table><tbody><tr><td class="muted">숙소</td><td>' + r[1] + '</td></tr><tr><td class="muted">투숙객</td><td>' + r[2] + '</td></tr><tr><td class="muted">체크인</td><td>2026-' + r[3] + '</td></tr><tr><td class="muted">숙박</td><td>' + r[4] + '박</td></tr><tr><td class="muted">채널</td><td>' + r[5] + '</td></tr><tr><td class="muted">상태</td><td>' + r[6] + '</td></tr><tr><td class="muted">응답</td><td><span class="tag t-ok">허용 200</span></td></tr></tbody></table></div>';
      return h;
    }
    var h2 = '<div class="deny" id="denyScreen"><span class="code">HTTP 404</span><h1>접근할 수 없습니다 (404)</h1><p>요청한 예약이 지금 계정에 없습니다. 다른 계정의 자원은 있는지 없는지도 알려 주지 않도록 403이 아니라 404로 답합니다.</p>';
    h2 += '<dl><dt>요청 경로</dt><dd class="mono">GET /reservations/' + esc(id) + '</dd><dt>지금 계정</dt><dd>' + a.label + ' · ' + a.biz + ' <span class="mono muted">(' + a.id + ')</span></dd><dt>판정 위치</dt><dd class="mono">reservationRepo.findById(accountId, id) → null</dd><dt>격리 시험</dt><dd>같은 경우를 <span class="mono">GET /reservations/:id</span> 행에서 매번 확인합니다</dd></dl>';
    h2 += '<div class="tools"><a class="btn primary" href="#/accounts">' + ic('back') + '예약 목록으로</a><a class="btn" href="#/isolation">' + ic('shield') + '격리 시험 결과 보기</a></div></div>';
    return h2;
  }

  function empty(icon, title, text, act, label) {
    return '<div class="empty">' + ic(icon) + '<b>' + title + '</b><p>' + text + '</p>' + (act ? '<button class="btn primary" data-act="' + act + '">' + label + '</button>' : '') + '</div>';
  }

  function viewOnboarding() {
    var o = S.onb;
    var h = '<div class="page-h"><div><h1>셀프 온보딩</h1><p>새 업체(□□민박, 예시)가 가입부터 베드24 연결, 숙소 가져오기, 공동호스트 초대까지 혼자 끝내는 순서입니다. 단계 상태는 서버에 저장됩니다.</p></div></div>';
    if (o.away && o.step > 1 && o.step < 5) {
      h += '<div class="notice info" id="resumeNote">' + ic('info') + '<div><p><b>저장된 단계에서 이어서 진행합니다.</b> ' + o.step + '단계 ' + STEP_NAMES[o.step - 1] + ' · 마지막 저장 ' + hm(o.savedAt) + '</p></div></div>';
    }
    h += '<ol class="steps" id="steps">';
    STEP_NAMES.forEach(function (n, i) {
      var c = i + 1 < o.step ? 'done' : i + 1 === o.step ? 'now' : '';
      h += '<li class="' + c + '"' + (c === 'now' ? ' aria-current="step"' : '') + '><span>' + (i + 1) + '단계</span>' + n + '</li>';
    });
    h += '</ol>';
    h += '<div class="steps-narrow">' + o.step + '/5 단계 · <b>' + STEP_NAMES[o.step - 1] + '</b><div class="stage"><i>' + bars(o.step) + '</i></div></div>';
    h += '<div class="panel" id="wizard" data-step="' + o.step + '">';
    if (o.step === 1) {
      h += '<h2>사업장 정보</h2><p>업체 계정을 만들 때 쓰는 기본 정보입니다.</p><div class="form">';
      h += field('bizName', '상호', o.biz.name) + field('bizOwner', '대표자', o.biz.owner) + field('bizRooms', '객실 수', o.biz.rooms) + field('bizRegion', '지역', o.biz.region);
      h += '</div>';
      h += foot(false, '<button class="btn primary" data-act="onb-save1">저장하고 다음</button>');
    } else if (o.step === 2) {
      h += '<h2>베드24 연결</h2><p>베드24에서 발급한 API 키를 붙여 넣으면, 이 업체 계정 전용으로 암호화해 저장합니다.</p><div class="form"><div class="field full"><label for="chKey">베드24 API 키</label><input id="chKey" class="mono" autocomplete="off" spellcheck="false" value="' + esc(o.key) + '" placeholder="베드24 설정의 API 메뉴에서 발급한 키"><span class="help">시연용: 아래 버튼으로 예시 키를 넣어 볼 수 있습니다.</span></div></div>';
      h += '<div class="tools" style="margin-top:10px"><button class="btn" data-act="key-bad">' + ic('key') + '잘못된 키 예시 넣기</button><button class="btn" data-act="key-good">' + ic('key') + '발급받은 키 예시 넣기</button></div>';
      if (o.keyState === 'bad') {
        h += '<div class="cause" id="keyError" role="alert"><dl><dt>원인</dt><dd>베드24가 인증 실패(401)를 돌려줬습니다. 키가 만료되었거나 다른 베드24 계정에서 발급된 키입니다.</dd><dt>다음 행동</dt><dd><ol><li>베드24 설정의 API 메뉴에서 새 키를 발급합니다.</li><li>권한에 숙소 읽기·예약 읽기가 켜져 있는지 확인합니다.</li><li>새 키를 붙여 넣고 다시 연결 확인을 누릅니다.</li></ol></dd></dl></div>';
      }
      h += foot(true, '<button class="btn primary" data-act="key-check">연결 확인</button>');
    } else if (o.step === 3) {
      var left = CHANNEL_PROPS.filter(function (p) { return o.registered.indexOf(p.pid) < 0; });
      h += '<h2>숙소 가져오기</h2><p>베드24 숙소 ID를 유일 키로 써서, 여러 번 가져와도 한 번만 등록됩니다. 이미 가져온 숙소는 등록됨으로 표시됩니다.</p>';
      h += '<div class="sec-h"><span class="counter">이 계정에 등록된 숙소 <b id="regCount" data-count="' + o.registered.length + '">' + o.registered.length + '</b>곳</span><span class="okbox" style="margin:0;padding:4px 10px">베드24 연결됨 · 숙소 ' + CHANNEL_PROPS.length + '곳 확인</span></div>';
      h += '<div class="tbl-wrap"><table class="prop-tbl" id="importTable"><thead><tr><th>가져올 숙소</th><th class="wcol">베드24 숙소 ID</th><th class="num wcol">객실</th><th>상태</th></tr></thead><tbody>';
      CHANNEL_PROPS.forEach(function (p) {
        var reg = o.registered.indexOf(p.pid) >= 0, sel = o.selected.indexOf(p.pid) >= 0;
        h += '<tr data-pid="' + p.pid + '"><td><label class="chk' + (reg ? ' is-off' : '') + '"><input type="checkbox" data-pick="' + p.pid + '"' + (reg ? ' disabled checked' : sel ? ' checked' : '') + '> <span>' + p.name + '<span class="ncol mono muted">' + p.pid + '</span></span></label></td><td class="mono wcol">' + p.pid + '</td><td class="num wcol">' + p.rooms + '</td><td>' + (reg ? '<span class="tag t-deny" data-reg>등록됨</span>' : '<span class="tag t-zero">새 숙소</span>') + '</td></tr>';
      });
      h += '</tbody></table></div>';
      h += '<div class="tools" style="margin-top:10px"><button class="btn primary" data-act="import" ' + (o.selected.length ? '' : 'disabled') + '>' + ic('import') + '선택한 숙소 가져오기 (' + o.selected.length + ')</button><button class="btn" data-act="reimport">' + ic('refresh') + '전체 다시 가져오기</button>' + (left.length ? '<span class="muted" style="font-size:12.5px">가져올 숙소를 체크하세요</span>' : '') + '</div>';
      h += foot(true, '<button class="btn primary" data-act="onb-next" ' + (o.registered.length > 1 ? '' : 'disabled') + '>다음 단계</button>');
    } else if (o.step === 4) {
      h += '<h2>공동호스트 초대</h2><p>초대받은 사람은 이 업체 계정에만 소속됩니다. 역할은 나중에 바꿀 수 있습니다.</p><div class="form">';
      h += field('invName', '이름', '김○○') + field('invMail', '이메일', 'cohost.kim@example.com') + '<div class="field"><label for="invRole">역할</label><select id="invRole"><option>공동호스트</option><option>청소 담당</option></select></div></div>';
      h += '<div class="tools" style="margin-top:10px"><button class="btn primary" data-act="invite" id="inviteBtn">' + ic('userplus') + '초대 보내기</button></div>';
      h += '<section class="sec" id="inviteList"><div class="sec-h"><h2>보낸 초대</h2></div>';
      if (!o.invites.length) h += empty('inbox', '아직 초대한 사람이 없습니다', '공동호스트나 청소 담당을 초대하면 여기에 수락 상태가 표시됩니다. 지금 건너뛰고 나중에 초대해도 됩니다.', 'focus-invite', '초대 양식 채우기');
      else {
        h += '<div class="tbl-wrap"><table><thead><tr><th>이름</th><th>이메일</th><th>역할</th><th>상태</th></tr></thead><tbody>';
        o.invites.forEach(function (v) { h += '<tr data-invite><td>' + esc(v.name) + '</td><td class="mono">' + esc(v.mail) + '</td><td>' + esc(v.role) + '</td><td><span class="tag t-warn">수락 대기</span></td></tr>'; });
        h += '</tbody></table></div>';
      }
      h += '</section>';
      h += foot(true, '<button class="btn primary" data-act="onb-next">' + (o.invites.length ? '다음 단계' : '건너뛰고 완료') + '</button>');
    } else {
      h += '<h2 id="doneTitle">온보딩 완료</h2><p>□□민박이 혼자서 모든 단계를 마쳤습니다. 슈퍼어드민 고객 관리에도 완료로 표시됩니다.</p>';
      h += '<div class="tbl-wrap" style="max-width:640px"><table><tbody><tr><td class="muted">사업장</td><td>' + esc(o.biz.name) + ' · ' + esc(o.biz.owner) + '</td></tr><tr><td class="muted">베드24</td><td>연결됨 (키는 계정별 암호화 저장)</td></tr><tr><td class="muted">숙소</td><td>' + o.registered.length + '곳 등록, 중복 0</td></tr><tr><td class="muted">초대</td><td>' + o.invites.length + '명 수락 대기</td></tr></tbody></table></div>';
      h += '<div class="wz-foot"><div class="tools"><button class="btn" data-act="onb-reset">' + ic('refresh') + '처음부터 다시 체험</button><a class="btn primary" href="#/admin">고객 관리에서 확인</a></div></div>';
    }
    h += '</div>';
    return h;
  }
  function field(id, label, val) { return '<div class="field"><label for="' + id + '">' + label + '</label><input id="' + id + '" value="' + esc(val) + '"></div>'; }
  function foot(back, right) {
    return '<div class="wz-foot">' + (back ? '<button class="btn" data-act="onb-prev">' + ic('back') + '이전</button>' : '<span></span>') + '<div class="tools"><button class="btn" data-act="onb-later">나중에 이어서 하기</button>' + right + '</div></div>';
  }
  function bars(n, full) {
    var s = '';
    for (var i = 1; i <= 5; i++) s += '<u class="' + (i <= n ? 'on' : '') + '"></u>';
    return s;
  }

  function viewDevices() {
    var a = ACCTS[S.acct], list = S.devices[S.acct];
    var h = '<div class="page-h"><div><h1>로그인 기기</h1><p>' + a.person + ' (' + a.biz + ') 계정에 로그인된 기기입니다. 세션은 기기 단위로 기록되고, 원격 로그아웃하면 그 기기의 다음 요청부터 막힙니다.</p></div></div>';
    var fresh = list.filter(function (d) { return d.fresh && d.state === 'on'; })[0];
    if (fresh) {
      h += '<div class="alert-card" id="newDevice">' + ic('bell') + '<p><b>새 기기 로그인 알림 예시</b><br>' + a.biz + ' 계정에 처음 보는 기기에서 로그인했습니다. ' + fresh.dev + ' · ' + fresh.loc + ' · ' + fresh.last + '. 본인이 아니면 이 기기를 로그아웃하세요. (알림 수단은 이메일·문자·알림톡 중 협의)</p><button class="btn danger" data-act="logout" data-sid="' + fresh.id + '">' + ic('logout') + '이 기기 로그아웃</button></div>';
    }
    h += '<div class="tbl-wrap"><table id="devTable" style="min-width:560px"><thead><tr><th>기기·브라우저</th><th>최근 접속</th><th class="wcol">대략적 위치</th><th class="wcol">상태</th><th class="num"><span class="sr">작업</span></th></tr></thead><tbody>';
    list.forEach(function (d) {
      var st = d.current ? '<span class="tag t-acc">현재 기기</span>' : d.state === 'on' ? '<span class="tag t-ok">로그인 중</span>' : '<span class="tag t-deny">로그아웃됨</span>';
      var actc = '';
      if (!d.current && d.state === 'on') {
        actc = '<button class="btn danger only-wide" data-act="logout" data-sid="' + d.id + '">' + ic('logout') + '원격 로그아웃</button><button class="icon-btn danger only-narrow" data-act="logout" data-sid="' + d.id + '" aria-label="원격 로그아웃" data-tip="원격 로그아웃">' + ic('logout') + '</button>';
      }
      h += '<tr data-sid="' + d.id + '"><td><b>' + d.dev + '</b>' + (d.fresh ? ' <span class="tag t-warn">새 기기</span>' : '') + '<br><span class="mono muted">' + d.id + '</span><span class="ncol" data-state-n>' + st + '</span></td><td>' + d.last + '<span class="ncol muted">' + d.loc + '</span></td><td class="wcol">' + d.loc + '</td><td class="wcol" data-state>' + st + '</td><td class="act-cell">' + actc + '</td></tr>';
    });
    h += '</tbody></table></div>';
    h += '<p class="foot-note">' + ic('info') + '<span>위치는 접속 IP로 추정한 시·도 수준입니다. 비밀번호를 바꾸면 현재 기기를 뺀 모든 세션이 함께 로그아웃됩니다.</span></p>';
    return h;
  }

  function viewAdmin() {
    if (S.acct !== 'SA') {
      return '<div class="page-h"><div><h1>고객 관리</h1></div></div>' + empty('lock', '슈퍼어드민만 열 수 있습니다 (403)', '지금은 ' + ACCTS[S.acct].label + '로 보고 있습니다. 업체 계정에는 고객 관리 권한이 선언되어 있지 않아 서버가 거부합니다.', 'go-acct-SA', '슈퍼어드민으로 보기');
    }
    var h = '<div class="page-h"><div><h1>고객 관리</h1><p>가입한 업체별 온보딩 단계와 계정 상태입니다. 고객 데이터는 별도 경로로만 열고, 열람·조치는 모두 기록됩니다.</p></div></div>';
    if (S.adminNote) h += '<div class="notice ' + S.adminNote.kind + '" id="adminNote">' + ic(S.adminNote.kind === 'warn' ? 'pause' : 'unlock') + '<div><p>' + S.adminNote.text + '</p></div></div>';
    h += '<div class="tbl-wrap"><table id="custTable" class="cust"><thead><tr><th>업체</th><th class="wcol">대표</th><th class="wcol">가입일</th><th>온보딩 단계</th><th class="num wcol">숙소</th><th class="wcol">상태</th><th class="num"><span class="sr">작업</span></th></tr></thead><tbody>';
    S.customers.forEach(function (c) {
      var step = c.id === 'acct_c3' ? (S.onb.step === 5 ? 5 : S.onb.step - 1) : c.step;
      var props = c.id === 'acct_c3' ? (S.onb.step >= 3 ? S.onb.registered.length : 0) : c.props;
      var label = step >= 5 ? '완료' : STEP_NAMES[step] + ' 진행 중';
      var on = c.state === 'on';
      h += '<tr data-cust="' + c.id + '"><td><b>' + c.biz + '</b><br><span class="mono muted">' + c.id + '</span>' + (on ? '' : '<span class="cust-sub">로그인·동기화 중지 · 데이터 보존</span>') + (c.stuck ? '<span class="cust-sub" style="color:var(--warn)">' + c.stuck + '</span>' : '') + '<span class="ncol">' + (on ? '<span class="tag t-ok">사용 중</span>' : '<span class="tag t-bad">정지</span>') + '</span></td><td class="wcol">' + c.owner + '</td><td class="wcol">' + c.joined + '</td>';
      h += '<td><span class="stage"><i class="' + (step >= 5 ? 'full' : '') + '">' + bars(step) + '</i><span>' + step + '/5<span class="wcol-i"> ' + label + '</span></span></span></td><td class="num wcol">' + props + '</td>';
      h += '<td class="wcol" data-state>' + (on ? '<span class="tag t-ok">사용 중</span>' : '<span class="tag t-bad">정지</span>') + '</td><td class="act-cell">';
      h += '<button class="btn only-wide" data-act="view" data-cid="' + c.id + '">' + ic('eye') + '데이터 열람</button>';
      h += on ? '<button class="btn danger only-wide" data-act="suspend" data-cid="' + c.id + '">' + ic('pause') + '정지</button>' : '<button class="btn only-wide" data-act="reopen" data-cid="' + c.id + '">' + ic('unlock') + '다시 열기</button>';
      h += '<button class="icon-btn only-narrow" data-act="view" data-cid="' + c.id + '" aria-label="데이터 열람" data-tip="데이터 열람">' + ic('eye') + '</button>';
      h += on ? '<button class="icon-btn danger only-narrow" data-act="suspend" data-cid="' + c.id + '" aria-label="계정 정지" data-tip="계정 정지">' + ic('pause') + '</button>' : '<button class="icon-btn only-narrow" data-act="reopen" data-cid="' + c.id + '" aria-label="다시 열기" data-tip="다시 열기">' + ic('unlock') + '</button>';
      h += '</td></tr>';
    });
    h += '</tbody></table></div>';
    h += '<section class="sec" id="accessLog"><div class="sec-h"><div><h2>고객 데이터 열람·조치 기록</h2><p>슈퍼어드민이 고객 데이터를 열거나 계정을 정지·다시 열 때마다 남습니다. 지울 수 없습니다.</p></div></div>';
    if (!S.log.length) h += empty('inbox', '아직 기록이 없습니다', '고객 데이터를 열람하거나 계정을 정지하면 시각·사람·경로가 여기에 남습니다.', 'view-first', '○○스테이 데이터 열람해 보기');
    else {
      h += '<div class="tbl-wrap"><table style="min-width:640px"><thead><tr><th>시각</th><th>슈퍼어드민</th><th>고객</th><th>구분</th><th>경로</th></tr></thead><tbody>';
      S.log.forEach(function (l) { h += '<tr data-log><td>' + fmt(l.t) + '</td><td>' + l.who + '</td><td>' + l.biz + '</td><td><span class="tag ' + l.cls + '">' + l.kind + '</span></td><td class="mono">' + l.path + '</td></tr>'; });
      h += '</tbody></table></div>';
    }
    h += '</section>';
    return h;
  }

  /* ---------- render ---------- */
  function renderNav(r) {
    var cur = r.name === 'res' ? 'accounts' : r.name;
    $('#nav').innerHTML = NAV.map(function (n) {
      if (n.sec) return '<div class="nav-sec">' + n.sec + '</div>';
      return '<a href="#/' + n.r + '"' + (n.r === cur ? ' aria-current="page"' : '') + '>' + ic(n.icon) + n.label + '</a>';
    }).join('');
    var a = ACCTS[S.acct];
    $('#sideMeta').innerHTML = '<b>' + a.person + '</b> · ' + a.role + '<br>' + a.biz;
    $('#whoId').textContent = a.id;
    $('#acct').value = S.acct;
    var lab = (NAV.filter(function (n) { return n.r === cur; })[0] || {}).label || '';
    $('#crumb').innerHTML = a.biz + ' / <b>' + lab + '</b>';
    return cur;
  }
  var GUIDE = [
    ['isolation', '격리 시험 결과', '표의 모든 행이 통과, 실패 0인지 봅니다. 시험 다시 실행도 눌러 보세요.'],
    ['isolation#leak', '누락 예시 토글', '격리 누락 예시 보기를 켜면 한 행이 실패로 바뀌고 열린 경로가 나옵니다.'],
    ['accounts', '계정 전환과 직접 주소 차단', '보는 계정을 업체 A ↔ B로 바꾸고, 다른 업체 예약 주소를 직접 열어 404를 확인합니다.'],
    ['onboarding', '온보딩 마법사', '잘못된 키 예시로 원인 안내를 보고, 숙소 가져오기를 두 번 눌러 중복이 없는지 봅니다.'],
    ['devices', '기기 관리', '다른 기기를 원격 로그아웃하면 로그아웃됨으로 바뀝니다.'],
    ['admin', '슈퍼어드민', '고객을 정지했다가 다시 열고, 열람·조치 기록을 확인합니다.']
  ];
  var guideOpen = null;
  function renderGuide(cur) {
    var g = $('#guide');
    g.className = guideOpen ? '' : 'closed';
    var h = '<div class="g-head"><button class="g-open" data-act="guide">' + ic('book') + '시연 안내 열기</button>' + ic('book') + '<b>시연 안내</b><button class="icon-btn g-toggle" data-act="guide" aria-label="시연 안내 접기" data-tip="접기" style="border:0">' + ic('down') + '</button></div>';
    h += '<div class="g-body"><p>아래 순서대로 누르면 3분 안에 핵심을 볼 수 있습니다.</p>';
    GUIDE.forEach(function (s, i) {
      var on = s[0].split('#')[0] === cur && (i !== 1 || S.leak) && !(i === 0 && S.leak);
      h += '<button class="g-step' + (on ? ' on' : '') + '" data-act="gstep" data-i="' + i + '"><em>' + p2(i + 1) + '</em><span><b>' + s[1] + '</b><span>' + s[2] + '</span></span></button>';
    });
    h += '</div>';
    g.innerHTML = h;
  }
  function render(routeChanged) {
    var r = route();
    var cur = renderNav(r);
    var m = $('#main');
    var v = r.name === 'res' ? viewRes(r.id) :
      cur === 'roles' ? viewRoles() : cur === 'accounts' ? viewAccounts() : cur === 'onboarding' ? viewOnboarding() :
      cur === 'devices' ? viewDevices() : cur === 'admin' ? viewAdmin() : viewIsolation();
    m.innerHTML = v;
    renderGuide(cur);
    if (routeChanged) { window.scrollTo(0, 0); }
    prevRoute = cur;
  }

  function wideGuide() { return window.matchMedia('(min-width:1280px)').matches; }
  function syncGuideLayout() {
    var wide = wideGuide();
    html.classList.toggle('guide-wide', wide && !!guideOpen);
  }

  function viewMsg(k) { return k === 'SA' ? '슈퍼어드민으로 보는 중입니다' : ACCTS[k].label + ' · ' + ACCTS[k].biz + '로 보는 중입니다'; }
  /* ---------- events ---------- */
  $('#acct').addEventListener('change', function (e) {
    var v = e.target.value;
    act('보는 계정을 바꾸는 중', function () { S.acct = v; return viewMsg(v); });
  });

  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t.matches('[data-pick]')) {
      var pid = t.getAttribute('data-pick'), sel = S.onb.selected, i = sel.indexOf(pid);
      if (t.checked && i < 0) sel.push(pid);
      if (!t.checked && i >= 0) sel.splice(i, 1);
      render();
    }
  });

  document.addEventListener('input', function (e) {
    var t = e.target;
    var map = { bizName: 'name', bizOwner: 'owner', bizRooms: 'rooms', bizRegion: 'region' };
    if (map[t.id]) S.onb.biz[map[t.id]] = t.value;
    if (t.id === 'chKey') S.onb.key = t.value;
  });

  function goStep(n) { S.onb.step = n; S.onb.away = false; S.onb.savedAt = tick(40); }
  function findDev(sid) { return S.devices[S.acct].filter(function (d) { return d.id === sid; })[0]; }
  function findCust(cid) { return S.customers.filter(function (c) { return c.id === cid; })[0]; }
  function addLog(c, kind, cls, path) { S.log.unshift({ t: tick(25), who: '정○○', biz: c.biz, kind: kind, cls: cls, path: path }); }

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]');
    if (!el || busy) return;
    var a = el.getAttribute('data-act');
    var o = S.onb;
    switch (a) {
      case 'rerun':
        act('격리 시험을 다시 실행하는 중 (라우트 ' + ROUTES.length + '개)', function () {
          S.run.no += 1; S.run.at = tick(137); S.run.sec = 3.8 + Math.round(Math.random() * 9) / 10;
          var f = S.leak ? 1 : 0;
          return '시험 #' + S.run.no + ' 완료 · 통과 ' + (ROUTES.length * 3 - f) + '건, 실패 ' + f + '건';
        });
        break;
      case 'report':
        act('시험 결과 보고서를 만드는 중', null, '보고서(격리시험_결과_#' + S.run.no + '.pdf)를 만들었습니다 · 시연에서는 내려받기를 생략합니다');
        break;
      case 'leak':
        var to = !S.leak;
        act(to ? '조회문에서 계정 조건을 뺀 코드로 시험하는 중' : '수정된 코드로 다시 시험하는 중', function () {
          S.leak = to; S.run.no += 1; S.run.at = tick(95);
          return to ? '실패 1건: GET /reservations/:id 가 열려 있습니다' : '다시 통과 · 실패 0건';
        });
        break;
      case 'go-acct-A': case 'go-acct-B': case 'go-acct-SA':
        var k = a.slice(8);
        act('보는 계정을 바꾸는 중', function () { S.acct = k; return viewMsg(k); });
        break;
      case 'onb-save1':
        if (!o.biz.name.trim()) { toast('상호를 입력하세요'); return; }
        act('사업장 정보를 저장하는 중', function () { goStep(2); return '사업장 정보를 저장했습니다 · 2단계 베드24 연결'; });
        break;
      case 'key-bad':
        o.key = 'b24-key-EXPIRED-7c1e09'; o.keyState = null; render(); break;
      case 'key-good':
        o.key = 'b24-key-4f8a2c91d3e6'; o.keyState = null; render(); break;
      case 'key-check':
        act('베드24에 연결을 확인하는 중', function () {
          if (!o.key || /EXPIRED/.test(o.key) || o.key.length < 12) { o.keyState = 'bad'; return '연결하지 못했습니다 · 원인과 다음 행동을 확인하세요'; }
          o.keyState = 'ok'; goStep(3); return '베드24에 연결했습니다 · 숙소 ' + CHANNEL_PROPS.length + '곳 확인';
        });
        break;
      case 'import':
        var pick = o.selected.slice();
        act('선택한 숙소 ' + pick.length + '곳을 가져오는 중', function () {
          var added = 0;
          pick.forEach(function (p) { if (o.registered.indexOf(p) < 0) { o.registered.push(p); added++; } });
          o.selected = []; o.savedAt = tick(30);
          return '숙소 ' + added + '곳을 등록했습니다';
        });
        break;
      case 'reimport':
        act('베드24 숙소 전체를 다시 가져오는 중', function () {
          var added = 0, skip = 0;
          CHANNEL_PROPS.forEach(function (p) { if (o.registered.indexOf(p.pid) < 0) { o.registered.push(p.pid); added++; } else skip++; });
          o.selected = []; o.savedAt = tick(30);
          return '새로 등록 ' + added + '건 · 이미 등록됨 ' + skip + '건은 건너뜀 (중복 0)';
        });
        break;
      case 'onb-next':
        act('진행 단계를 저장하는 중', function () { goStep(o.step + 1); return o.step === 5 ? '온보딩을 마쳤습니다' : o.step + '단계 ' + STEP_NAMES[o.step - 1] + '로 넘어갑니다'; });
        break;
      case 'onb-prev':
        act('이전 단계를 여는 중', function () { goStep(o.step - 1); o.keyState = null; return o.step + '단계 ' + STEP_NAMES[o.step - 1]; });
        break;
      case 'onb-later':
        act('지금 단계를 저장하는 중', function () { o.savedAt = tick(10); if (o.step > 1 && o.step < 5) o.away = true; location.hash = '#/isolation'; return o.step + '단계까지 저장했습니다 · 다시 들어오면 이어서 진행합니다'; });
        break;
      case 'onb-reset':
        act('체험을 처음 상태로 되돌리는 중', function () { S.onb = freshOnb(); return '1단계부터 다시 시작합니다'; });
        break;
      case 'focus-invite':
        var inp = $('#invName'); if (inp) { inp.focus(); inp.select(); }
        break;
      case 'invite':
        var nm = ($('#invName') || {}).value || '', ml = ($('#invMail') || {}).value || '', rl = ($('#invRole') || {}).value || '공동호스트';
        if (!nm.trim() || ml.indexOf('@') < 0) { toast('이름과 이메일을 확인하세요'); return; }
        act('초대 메일을 보내는 중', function () { o.invites.push({ name: nm, mail: ml, role: rl }); o.savedAt = tick(20); return nm + '님에게 초대를 보냈습니다'; });
        break;
      case 'logout':
        var d = findDev(el.getAttribute('data-sid'));
        if (!d) return;
        confirmDlg('이 기기를 로그아웃할까요?', '<p><b>' + d.dev + '</b> · ' + d.loc + ' · 최근 접속 ' + d.last + '</p><p>이 세션(<span class="mono">' + d.id + '</span>)을 폐기합니다. 그 기기의 다음 요청부터 바로 로그인 화면으로 돌아갑니다.</p>', '로그아웃', function () {
          act('세션을 폐기하는 중', function () { d.state = 'off'; d.last = d.last; return d.dev + ' 기기를 로그아웃했습니다'; });
        }, true);
        break;
      case 'suspend':
        var c = findCust(el.getAttribute('data-cid'));
        confirmDlg(c.biz + ' 계정을 정지할까요?', '<p>정지하면 이 업체 구성원의 로그인과 베드24 동기화가 바로 멈춥니다.</p><p><b>숙소·예약·요금 데이터는 지우지 않고 그대로 보존합니다.</b> 다시 열면 이어서 쓸 수 있습니다.</p>', '정지', function () {
          act(c.biz + ' 계정을 정지하는 중', function () {
            c.state = 'off';
            addLog(c, '정지', 't-bad', 'POST /admin/accounts/' + c.id + '/suspend');
            S.adminNote = { kind: 'warn', text: '<b>' + c.biz + ' 계정을 정지했습니다.</b> 로그인과 베드24 동기화가 멈췄고, 데이터는 보존됩니다.' };
            return c.biz + ' 계정을 정지했습니다 · 데이터 보존';
          });
        }, true);
        break;
      case 'reopen':
        var c2 = findCust(el.getAttribute('data-cid'));
        act(c2.biz + ' 계정을 다시 여는 중', function () {
          c2.state = 'on';
          addLog(c2, '다시 열기', 't-ok', 'POST /admin/accounts/' + c2.id + '/reopen');
          S.adminNote = { kind: 'ok', text: '<b>' + c2.biz + ' 계정을 다시 열었습니다.</b> 보존된 데이터 그대로 로그인과 동기화가 재개됩니다.' };
          return c2.biz + ' 계정을 다시 열었습니다';
        });
        break;
      case 'view': case 'view-first':
        var c3 = findCust(el.getAttribute('data-cid') || 'acct_a1');
        act(c3.biz + ' 데이터를 별도 경로로 여는 중', function () {
          addLog(c3, '열람', 't-warn', 'GET /admin/accounts/' + c3.id + '/reservations');
          return '열람 기록을 남겼습니다 · ' + c3.biz + ' 예약 ' + (c3.id === 'acct_b2' ? 5 : 6) + '건';
        });
        break;
      case 'dlg-no':
        closeDlg(); break;
      case 'dlg-ok':
        var cb = dlgCb; closeDlg(); if (cb) cb(); break;
      case 'guide':
        guideOpen = !guideOpen; syncGuideLayout(); render(); break;
      case 'gstep':
        var i = +el.getAttribute('data-i'), s = GUIDE[i];
        var target = '#/' + s[0].split('#')[0];
        if (!wideGuide()) { guideOpen = false; syncGuideLayout(); }
        if (location.hash !== target) location.hash = target; else render();
        if (i === 1) setTimeout(function () { var sw = $('#leakSwitch'); if (sw) { sw.scrollIntoView({ block: 'center' }); sw.focus(); } }, 30);
        break;
    }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !$('#dlg').hidden) closeDlg(); });
  $('#dlg').addEventListener('click', function (e) { if (e.target.id === 'dlg') closeDlg(); });

  guideOpen = wideGuide();
  syncGuideLayout();
  window.addEventListener('resize', syncGuideLayout);
  render();
})();
