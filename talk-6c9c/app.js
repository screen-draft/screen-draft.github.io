(function () {
  'use strict';

  /* ---------- 아이콘 (선 아이콘 한 세트) ---------- */
  var ICON = {
    chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
    store: '<path d="M3 9l1.5-5h15L21 9"/><path d="M4 9v11h16V9"/><path d="M9 20v-6h6v6"/>',
    bars: '<path d="M4 20h16"/><path d="M7 16v-5"/><path d="M12 16V7"/><path d="M17 16v-7"/>',
    file: '<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4"/><path d="M9 12h6M9 16h6"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    alert: '<path d="M12 3.5l9 16H3z"/><path d="M12 10v4M12 17v.01"/>',
    block: '<circle cx="12" cy="12" r="9"/><path d="M5.7 5.7l12.6 12.6"/>',
    send: '<path d="M4 12l16-8-6 16-2.5-6.5z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/>',
    headset: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1"/><rect x="17" y="14" width="4" height="6" rx="1"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.5-4.5L4 8"/><path d="M4 4v4h4"/><path d="M4 13a8 8 0 0 0 14.5 4.5L20 16"/><path d="M20 20v-4h-4"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    inbox: '<path d="M3 13h5l1.5 3h5l1.5-3h5"/><path d="M5.5 5h13L21 13v6H3v-6z"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11M4.5 6v.01M4.5 12v.01M4.5 18v.01"/>',
    down: '<path d="M6 9l6 6 6-6"/>',
    up: '<path d="M6 15l6-6 6 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    play: '<path d="M7 5l12 7-12 7z"/>',
    tone: '<path d="M4 6h16M4 12h11M4 18h7"/>',
    coin: '<circle cx="12" cy="12" r="9"/><path d="M14.8 9.2c-.5-.9-1.5-1.4-2.8-1.4-1.7 0-2.8.8-2.8 2s1.2 1.7 2.8 2.1 2.8.9 2.8 2.1-1.1 2-2.8 2c-1.3 0-2.4-.5-2.9-1.4M12 6v1.8M12 16.2V18"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.8v.01"/>',
    flask: '<path d="M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3"/><path d="M7 15h10"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="1.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'
  };
  function ic(n, cls) { return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + ICON[n] + '</svg>'; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fmt(n) { return Math.round(n).toLocaleString('ko-KR'); }
  function $(s) { return document.querySelector(s); }

  /* ---------- 예시 데이터 ---------- */
  var V = {
    A: {
      id: 'A', code: 'onsaemi', name: '온새미 리모델링', short: '온새미', init: '온', tone: 'formal', manager: '김○○ 실장',
      greeting: '안녕하십니까, 온새미 리모델링 상담 창구입니다. 욕실·주방·소형 아파트 전체 리모델링 문의를 도와드리겠습니다.',
      scope: { price: true, schedule: true, quote: true },
      kinds: ['욕실 리모델링', '주방 리모델링', '아파트 전체 리모델링'],
      kb: [
        { id: 'A-I1', type: '정보', title: '시공 범위', kw: ['범위', '상가', '사무실', '주방'], text: '욕실, 주방, 30평 이하 아파트 전체 리모델링을 시공합니다. 상가·사무실 공사는 하지 않습니다.', upd: '11-12' },
        { id: 'A-I2', type: '정보', title: '견적 기준·가격대', tag: 'price', kw: [], text: '욕실 1개 전체 리모델링은 600만~900만 원 범위입니다. 자재 등급과 욕실 면적에 따라 달라지며, 현장 실측 후 확정합니다.', upd: '11-12' },
        { id: 'A-I3', type: '정보', title: '일정', kw: ['착공', '언제'], text: '착공은 계약 후 2~3주 뒤부터 가능합니다.', upd: '11-12' },
        { id: 'A-I4', type: '정보', title: '정책', kw: ['실측', '하자', '누수', '보수', 'AS'], text: '현장 실측은 무료이며, 시공 후 1년 동안 누수 하자를 보수합니다.', upd: '11-12' },
        { id: 'A-I5', type: '정보', title: '계약 혜택', kw: ['혜택', '줄눈', '무상'], text: '계약 고객에게 욕실 줄눈 시공을 무상으로 해 드립니다.', upd: '11-20' },
        { id: 'A-F1', type: 'FAQ', no: 1, title: '철거 소음은 어떻게 관리하나요?', kw: ['소음', '철거', '시끄'], text: '철거는 평일 오전 9시부터 오후 5시까지만 진행하고, 착공 전 관리사무소 공지와 이웃 안내문 부착을 대신 처리해 드립니다.', upd: '11-14' },
        { id: 'A-F2', type: 'FAQ', no: 2, title: '자재를 직접 고를 수 있나요?', kw: ['자재', '타일', '수전', '고를'], text: '타일·수전·도기는 쇼룸 견본 중에서 직접 고르실 수 있습니다. 견본 외 자재는 담당자와 협의가 필요합니다.', upd: '11-14' },
        { id: 'A-F3', type: 'FAQ', no: 3, title: '욕실 리모델링 기간은 얼마나 걸리나요?', tag: 'period', kw: [], text: '욕실 1개 전체 리모델링은 철거부터 마감까지 보통 5~7일 걸립니다. 방수층을 말리는 기간 2일이 포함됩니다.', upd: '11-14' },
        { id: 'A-F4', type: 'FAQ', no: 4, title: '공사 중에 집에 있어도 되나요?', kw: ['거주', '집에', '살면서'], text: '욕실 공사 중에도 거주는 가능하지만, 철거 당일은 소음과 분진이 많아 외출을 권해 드립니다.', upd: '11-14' }
      ]
    },
    B: {
      id: 'B', code: 'neulpum', name: '늘품 욕실공방', short: '늘품', init: '늘', tone: 'friendly', manager: '김○○ 팀장',
      greeting: '안녕하세요, 늘품 욕실공방이에요. 욕실 공사 궁금한 점 편하게 물어봐 주세요.',
      scope: { price: true, schedule: true, quote: true },
      kinds: ['욕실 전체 리모델링', '욕실 부분 수리', '타일·줄눈 보수'],
      kb: [
        { id: 'B-I1', type: '정보', title: '시공 범위', kw: ['범위', '주방', '전체'], text: '욕실만 전문으로 시공해요. 주방이나 집 전체 리모델링은 하지 않아요.', upd: '11-08' },
        { id: 'B-I2', type: '정보', title: '견적 기준·가격대', tag: 'price', kw: [], text: '욕실 1개 부분 수리는 150만~300만 원, 전체 리모델링은 450만~700만 원 범위예요. 타일 종류와 면적에 따라 달라져요.', upd: '11-08' },
        { id: 'B-I3', type: '정보', title: '일정', kw: ['착공', '언제'], text: '계약하고 1~2주 안에 착공할 수 있어요.', upd: '11-08' },
        { id: 'B-I4', type: '정보', title: '정책', kw: ['실측', '하자', '누수', '보수', 'AS'], text: '실측 방문비는 받지 않고, 방수 하자는 2년 동안 봐 드려요.', upd: '11-08' },
        { id: 'B-I5', type: '정보', title: '재방문 혜택', kw: ['혜택', '수전', '공임', '재방문'], text: '다시 맡겨 주시는 고객은 수전 교체 공임을 받지 않아요.', upd: '11-18' },
        { id: 'B-F1', type: 'FAQ', no: 1, title: '줄눈만 다시 할 수 있나요?', kw: ['줄눈', '곰팡이'], text: '줄눈만 따로 보수할 수 있어요. 기존 줄눈을 긁어내고 새로 채우는 방식이에요.', upd: '11-10' },
        { id: 'B-F2', type: 'FAQ', no: 2, title: '욕실 공사는 며칠 걸려요?', tag: 'period', kw: [], text: '전체 리모델링은 4~5일, 부분 수리는 1~2일이면 끝나요.', upd: '11-10' },
        { id: 'B-F3', type: 'FAQ', no: 3, title: '공사하는 동안 욕실을 못 쓰나요?', kw: ['못 쓰', '사용', '씻'], text: '공사 기간에는 그 욕실을 쓰실 수 없어요. 욕실이 하나뿐이면 일정을 미리 같이 맞춰요.', upd: '11-10' }
      ]
    }
  };

  var TONE = {
    formal: {
      label: '정중한 존댓말',
      tail: ' 정확한 일정은 현장 실측 후 안내드리겠습니다.',
      handoff: '문의하신 내용은 등록된 안내에 없어 업체 확인 후 안내드리겠습니다. 담당자 연결을 원하시면 아래 버튼을 눌러 주십시오.',
      outScope: '해당 문의는 상담 창구의 응대 범위 밖이라 업체 확인 후 안내드리겠습니다. 담당자 연결을 원하시면 아래 버튼을 눌러 주십시오.',
      priceHead: '등록된 견적 기준으로 안내드리겠습니다. ',
      block: function (v) { return '다른 업체의 가격이나 정보는 안내해 드릴 수 없습니다. ' + v.name + ' 기준으로만 안내드리겠습니다. '; },
      qKind: '견적 요청을 도와드리겠습니다. 먼저 공사 종류를 골라 주십시오.',
      qSize: '집 평수는 어느 정도입니까?', qRegion: '시공할 지역을 알려 주십시오.', qWhen: '희망하시는 공사 시기를 알려 주십시오.',
      qDone: '말씀하신 내용을 정리했습니다. 확인하시고 담당자에게 전달해 주십시오.',
      sent: '담당자에게 전달했습니다. 담당자가 확인 후 연락드리겠습니다.'
    },
    friendly: {
      label: '친근한 존댓말',
      tail: ' 자세한 일정은 실측하고 알려 드릴게요.',
      handoff: '그 부분은 등록된 안내에 없어서 업체 확인 후 안내드릴게요. 담당자랑 바로 이야기하시려면 아래 버튼을 눌러 주세요.',
      outScope: '그 문의는 여기서 안내하지 않는 범위라 업체 확인 후 안내드릴게요. 담당자 연결은 아래 버튼을 눌러 주세요.',
      priceHead: '등록된 견적 기준으로 알려 드릴게요. ',
      block: function (v) { return '다른 업체 정보는 알려 드릴 수 없어요. ' + v.name + ' 기준으로만 안내해 드릴게요. '; },
      qKind: '견적 요청 도와드릴게요. 어떤 공사인지 먼저 골라 주세요.',
      qSize: '집은 몇 평 정도예요?', qRegion: '어느 지역에서 공사하세요?', qWhen: '언제쯤 공사하고 싶으세요?',
      qDone: '말씀해 주신 내용 정리했어요. 확인하고 담당자에게 보내 주세요.',
      sent: '담당자에게 보냈어요. 확인하고 바로 연락드릴게요.'
    }
  };

  var SIZES = ['20평대', '30평대', '40평 이상'];
  var REGIONS = ['서울 서부', '경기 북부', '인천'];
  var WHENS = ['12월 중', '1월 중', '2월 이후'];

  var EXQ = function (v) {
    var other = v.id === 'A' ? V.B : V.A;
    return [
      '욕실 리모델링 기간이 얼마나 걸려요?',
      '야간에도 시공 가능한가요?',
      '욕실 리모델링 비용이 얼마예요?',
      other.name + '은 욕실 공사 얼마예요?',
      '견적 요청할게요'
    ];
  };

  var CLOCK = 14 * 60 + 2;
  function now() { CLOCK += 1; var h = Math.floor(CLOCK / 60), m = CLOCK % 60; return '11-26 ' + (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m; }

  var U = { A: { conv: 412, turns: 2390 }, B: { conv: 268, turns: 1505 } };
  var COST_TURN = (2500 * 1 + 300 * 5) / 1000000 * 1400; // 5.6원

  var LOGS = [
    { t: '11-26 13:48', v: 'A', q: '주방 상판만 교체도 되나요?', a: '업체 확인 후 안내', label: '근거 없음 → 전환', cls: 'warn', fb: null },
    { t: '11-26 13:31', v: 'B', q: '줄눈만 다시 할 수 있어요?', a: '줄눈만 따로 보수할 수 있어요...', label: '검사 통과', cls: 'ok', fb: '맞음' },
    { t: '11-26 13:15', v: 'A', q: '철거할 때 시끄럽나요?', a: '철거는 평일 오전 9시부터...', label: '검사 통과', cls: 'ok', fb: null },
    { t: '11-26 12:52', v: 'A', q: '욕실 비용 대충 얼마예요?', a: '600만~900만 원 범위...', label: '금액 규칙 적용', cls: 'ok', fb: '맞음' },
    { t: '11-26 11:40', v: 'B', q: '방수 하자는 몇 년 봐 주세요?', a: '방수 하자는 2년 동안...', label: '검사 통과', cls: 'ok', fb: null },
    { t: '11-26 11:02', v: 'A', q: '타일 직접 사 와도 돼요?', a: '견본 외 자재는 담당자와 협의...', label: '검사 통과', cls: 'ok', fb: null }
  ];
  var MON = [
    { t: '11-26 10:21', v: 'A', src: '검사 차단', q: '욕실 하나 하면 3일이면 끝나죠?', detail: '답 초안에 근거에 없는 숫자 "3일" 포함 → 전환 문구로 대체', state: '확인 필요' },
    { t: '11-25 17:44', v: 'B', src: '검사 차단', q: '전체 리모델링 500만 원에 되죠?', detail: '확정으로 읽히는 금액 표현 → 등록 범위 인용으로 대체', state: '처리됨' },
    { t: '11-25 15:09', v: 'B', src: '업체 피드백(틀림)', q: '타일 줄눈 색 고를 수 있어요?', detail: '등록 정보와 다름 · 색상 선택은 가능함, FAQ 추가 예정', state: '처리됨' }
  ];
  var HAND = [
    { t: '11-26 11:20', v: 'A', cust: '김○○', type: '견적 요청', summary: '견적 요청: 욕실 리모델링, 20평대, 서울 서부, 12월 중 희망. 상담 중 문의: 철거 소음 관리', info: { kind: '욕실 리모델링', size: '20평대', region: '서울 서부', when: '12월 중' }, state: '확인함' },
    { t: '11-25 16:05', v: 'A', cust: '김○○', type: '문의 전환', summary: '등록되지 않은 문의: "베란다 확장도 같이 되나요?" 고객이 담당자 연결 요청', info: null, state: '확인함' }
  ];
  var EVAL_SEQ = [
    { ok: 98, hand: 16, bad: 6, c: { '검색 실패': 3, '근거 무시': 1, '정보 미등록': 2 } },
    { ok: 99, hand: 16, bad: 5, c: { '검색 실패': 2, '근거 무시': 1, '정보 미등록': 2 } },
    { ok: 100, hand: 17, bad: 3, c: { '검색 실패': 1, '근거 무시': 0, '정보 미등록': 2 } }
  ];
  var EVAL_RUNS = [{ t: '11-26 09:00', r: EVAL_SEQ[0] }];
  var ISO_RUNS = [{ t: '11-26 09:05', ab: 40, ba: 40, exp: 0 }];

  var S = {
    view: 'chat', vendor: 'A', adminV: 'A', adminTab: 'kb', opsTab: 'log', logF: 'all',
    guideOpen: window.innerWidth >= 1101, hint: -1, editing: null, fbOpen: null, typing: null,
    sess: { A: null, B: null }, sessNo: 413, draft: '', done: {}
  };

  function sess(v) {
    if (!S.sess[v]) S.sess[v] = { no: S.sessNo++, msgs: [{ from: 'bot', kind: 'greet', text: V[v].greeting }], counted: false, quote: null, asked: [] };
    return S.sess[v];
  }

  /* ---------- 답변 판정 (미리 정한 규칙, 실제 AI 호출 아님) ---------- */
  function srcLabel(it) { return it.type === 'FAQ' ? '업체 FAQ ' + it.no + '번' : '등록 정보 · ' + it.title; }
  function nums(s) { var m = s.match(/\d+(?:[~,]\d+)*(?:만)?/g) || []; return m.filter(function (x, i) { return m.indexOf(x) === i; }); }
  function findTag(v, tag) { return V[v].kb.filter(function (k) { return k.tag === tag; })[0]; }
  function kwOf(it) {
    if (it.kw && it.kw.length) return it.kw;
    var stop = ['시공', '가능', '어떻', '얼마', '있나', '되나', '하나', '공사', '리모', '욕실', '수 있'];
    return it.title.replace(/[^가-힣a-zA-Z0-9 ]/g, ' ').split(/\s+/).filter(function (w) { return w.length >= 2; })
      .map(function (w) { return w.slice(0, 2); }).filter(function (w) { return stop.indexOf(w) < 0; });
  }
  function okCheck(v, items, text, rel) {
    var ev = items.map(function (x) { return x.text; }).join(' ');
    var ns = nums(text);
    return {
      cls: 'ok', label: '검사 통과', steps: [
        '근거 조각 검색: ' + items.map(function (x) { return x.id + '(' + srcLabel(x) + ')'; }).join(', ') + ' · 관련도 ' + rel,
        ns.length ? '답 안의 숫자 ' + ns.join(', ') + ' → 모두 근거에 있음' : '답 안에 숫자 없음',
        '조회 범위: 세션에 고정된 업체 ' + v + '(' + V[v].code + ')만, 요청 값은 쓰지 않음'
      ]
    };
  }
  function handoffMsg(v, q, why) {
    var t = TONE[V[v].tone];
    return {
      from: 'bot', kind: 'handoff', text: why === 'scope' ? t.outScope : t.handoff, src: [], handBtn: true, q: q,
      check: {
        cls: 'warn', label: why === 'scope' ? '응대 범위 밖 → 전환' : '근거 없음 → 전환', steps: why === 'scope'
          ? ['업체 설정에서 이 문의 유형의 응대가 꺼져 있음', '답을 만들지 않고 전환 문구로 대체']
          : ['근거 조각 검색: 관련도 기준 0.75를 넘는 조각 없음 (최고 0.31)', '답을 만들지 않고 전환 문구로 대체', '조회 범위: 세션에 고정된 업체 ' + v + '(' + V[v].code + ')만']
      }
    };
  }
  function answer(v, q) {
    var ven = V[v], t = TONE[ven.tone], other = v === 'A' ? V.B : V.A;
    if (q.indexOf(other.short) >= 0 || /다른 업체|딴 업체|타 업체/.test(q)) {
      var p0 = findTag(v, 'price');
      return {
        from: 'bot', kind: 'block', text: t.block(ven) + p0.text, note: '최종 견적은 업체 확정입니다. 현장 실측 후 담당자가 확정합니다.', src: [p0], kindKey: 'block',
        check: { cls: 'block', label: '다른 업체 정보 차단', steps: ['질문에 다른 업체명 포함 → 답변 대상 아님', '검색 범위는 세션의 업체 ' + v + '(' + ven.code + ')로 고정, 요청 값은 쓰지 않음', '다른 업체 조각 조회 0건 · 현재 업체 정보만 안내'] }
      };
    }
    if (/견적 요청|견적 신청|견적 받고|상담 신청/.test(q)) {
      if (!ven.scope.quote) return handoffMsg(v, q, 'scope');
      return { from: 'bot', kind: 'quote', text: t.qKind, qr: ven.kinds.slice(), qstep: 'kind', kindKey: 'quote', check: { cls: 'info', label: '견적 정보 수집', steps: ['견적 요청 의도 확인', '공사 종류 → 평수 → 지역 → 희망 일정 순서로 수집'] } };
    }
    if (/기간|며칠|얼마나 걸/.test(q)) {
      if (!ven.scope.schedule) return handoffMsg(v, q, 'scope');
      var f = findTag(v, 'period');
      var txt = f.text + t.tail;
      return { from: 'bot', kind: 'answer', text: txt, src: [f], kindKey: 'period', check: okCheck(v, [f], txt, '0.92') };
    }
    if (/비용|가격|얼마|금액|견적가/.test(q)) {
      if (!ven.scope.price) return handoffMsg(v, q, 'scope');
      var p = findTag(v, 'price');
      var pt = t.priceHead + p.text;
      return {
        from: 'bot', kind: 'price', text: pt, note: '최종 견적은 업체 확정입니다. 현장 실측 후 담당자가 확정합니다.', src: [p], kindKey: 'price',
        check: { cls: 'ok', label: '금액 규칙 적용', steps: ['근거: ' + p.id + '(' + srcLabel(p) + ') · 관련도 0.88', '금액은 등록된 범위 ' + nums(p.text).filter(function (n) { return /만$/.test(n); }).join(', ') + ' 만 인용', '확정으로 읽히는 표현 없음 · 최종 견적 문구 붙임'] }
      };
    }
    var best = null, bs = 0;
    ven.kb.forEach(function (k) {
      var s = 0; kwOf(k).forEach(function (w) { if (q.indexOf(w) >= 0) s++; });
      if (s > bs) { bs = s; best = k; }
    });
    if (best) return { from: 'bot', kind: 'answer', text: best.text, src: [best], kindKey: 'faq', check: okCheck(v, [best], best.text, '0.8' + (bs + 3)) };
    return handoffMsg(v, q, 'none');
  }

  /* ---------- 공통: 처리 표시·토스트 ---------- */
  var toastTimer;
  function toast(msg) {
    var el = $('#toast'); el.innerHTML = ic('check') + '<span>' + esc(msg) + '</span>'; el.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { el.classList.remove('show'); }, 1700);
  }
  function run(msg, ms, fn, inChat) {
    if (document.body.classList.contains('is-busy')) return;
    document.body.classList.add('is-busy');
    if (inChat) { S.typing = msg; render(); }
    else { var b = $('#busy'); b.innerHTML = '<span class="spin" aria-hidden="true"></span>' + esc(msg); b.hidden = false; }
    setTimeout(function () {
      S.typing = null; $('#busy').hidden = true;
      document.body.classList.remove('is-busy');
      fn(); render();
    }, ms);
  }
  function lab(cls, label) {
    var i = cls === 'ok' ? 'check' : cls === 'warn' ? 'headset' : cls === 'block' ? 'block' : cls === 'info' ? 'list' : 'alert';
    return '<span class="lab ' + cls + '">' + ic(i) + esc(label) + '</span>';
  }
  function empty(icon, title, desc, btnAct, btnLabel, extra) {
    return '<div class="empty">' + ic(icon, 'big') + '<b>' + esc(title) + '</b><p>' + esc(desc) + '</p>' +
      (btnAct ? '<button type="button" class="btn pri" data-act="' + btnAct + '"' + (extra || '') + '>' + esc(btnLabel) + '</button>' : '') + '</div>';
  }

  /* ---------- 고객 채팅 ---------- */
  function addUser(v, q, isQuick) {
    var s = sess(v);
    s.msgs.push({ from: 'me', text: q });
    U[v].turns += 1;
    if (!s.counted) { s.counted = true; U[v].conv += 1; }
    return s;
  }
  function logIt(v, q, m) {
    LOGS.unshift({ t: now(), v: v, q: q, a: (m.text || '').slice(0, 26) + '...', label: m.check.label, cls: m.check.cls, fb: null });
  }
  function ask(q) {
    var v = S.vendor; q = q.trim(); if (!q) return;
    var s = sess(v);
    if (s.quote && s.quote.step) { quoteReply(q); return; }
    addUser(v, q); S.draft = ''; S.hint = -1;
    run('답변 준비 중...', 520, function () {
      var m = answer(v, q);
      s.msgs.push(m); if (m.kind === "answer" || m.kind === "price") s.asked.push(q);
      if (m.kind === 'quote') s.quote = { step: 'kind', data: {} };
      logIt(v, q, m);
      if (m.kindKey === 'period') S.done[1] = true;
      if (m.kind === 'handoff') S.done[2] = true;
      if (m.kindKey === 'price') S.done[3] = true;
      if (m.kind === 'block') S.done[4] = true;
      if (S.done.f6) S.done[6] = true;
    }, true);
  }
  function quoteReply(val) {
    var v = S.vendor, s = sess(v), t = TONE[V[v].tone], qd = s.quote;
    addUser(v, val); S.draft = '';
    run('답변 준비 중...', 380, function () {
      var step = qd.step; qd.data[step] = val;
      var next = { kind: ['size', t.qSize, SIZES], size: ['region', t.qRegion, REGIONS], region: ['when', t.qWhen, WHENS] }[step];
      if (next) {
        qd.step = next[0];
        s.msgs.push({ from: 'bot', kind: 'quote', text: next[1], qr: next[2], qstep: next[0] });
      } else {
        qd.step = null;
        s.msgs.push({ from: 'bot', kind: 'card', text: t.qDone, data: JSON.parse(JSON.stringify(qd.data)), sent: false });
      }
    }, true);
  }
  function sendHandoff(mi) {
    var v = S.vendor, s = sess(v), m = s.msgs[mi], t = TONE[V[v].tone];
    if (m.sent) return;
    run('담당자에게 전달 중...', 560, function () {
      m.sent = true;
      var asked = s.asked.filter(function (q) { return !/견적 요청/.test(q); });
      var h;
      if (m.kind === 'card') {
        var d = m.data;
        h = { t: now(), v: v, cust: '김○○', type: '견적 요청', summary: '견적 요청: ' + d.kind + ', ' + d.size + ', ' + d.region + ', ' + d.when + ' 희망.' + (asked.length ? ' 상담 중 문의: ' + asked.slice(-2).join(' / ') : ''), info: d, state: '새 건' };
        S.done[5] = true;
      } else {
        h = { t: now(), v: v, cust: '김○○', type: '문의 전환', summary: '등록되지 않은 문의: "' + m.q + '" 고객이 담당자 연결 요청', info: null, state: '새 건' };
      }
      HAND.unshift(h);
      s.msgs.push({ from: 'bot', kind: 'sent', text: t.sent, preview: h.summary, to: V[v].manager });
      toast('담당자(' + V[v].manager + ')에게 전달했습니다');
    }, true);
  }

  function bubble(m, i, v) {
    if (m.from === 'me') return '<div class="msg me"><div class="bub">' + esc(m.text) + '</div></div>';
    var h = '<div class="msg bot"><div class="av" aria-hidden="true">' + V[v].init + '</div><div class="bw">';
    if (m.kind === 'sent') {
      h += '<div class="sentbox"><div class="sent-hd">' + ic('check') + '담당자에게 전달됨<span>' + esc(m.to) + '</span></div>' +
        '<p>' + esc(m.text) + '</p><div class="preview"><span>전달된 요약</span>' + esc(m.preview) + '</div></div></div></div>';
      return h;
    }
    h += '<div class="bub">' + esc(m.text) + '</div>';
    if (m.note) h += '<div class="note">' + ic('info') + esc(m.note) + '</div>';
    if (m.kind === 'card') {
      var d = m.data;
      h += '<div class="qcard"><div class="qcard-hd">견적 요청 정보</div><table><tbody>' +
        '<tr><th>공사 종류</th><td>' + esc(d.kind) + '</td></tr><tr><th>평수</th><td>' + esc(d.size) + '</td></tr>' +
        '<tr><th>지역</th><td>' + esc(d.region) + '</td></tr><tr><th>희망 일정</th><td>' + esc(d.when) + '</td></tr></tbody></table>' +
        '<div class="qcard-ft">' + (m.sent ? '<span class="lab ok">' + ic('check') + '전달 완료</span>' :
          '<button type="button" class="btn pri" data-act="handoff" data-i="' + i + '">' + ic('headset') + '상담원에게 전달</button><button type="button" class="btn" data-act="requote">다시 입력</button>') + '</div></div>';
    }
    if (m.handBtn) h += '<div class="acts">' + (m.sent ? '<span class="lab ok">' + ic('check') + '연결 요청됨</span>' : '<button type="button" class="btn line" data-act="handoff" data-i="' + i + '">' + ic('headset') + '상담원 연결</button>') + '</div>';
    if (m.qr) {
      var s = sess(v), active = s.quote && s.quote.step === m.qstep && i === lastBotIndex(s);
      h += '<div class="qr">' + m.qr.map(function (o) { return '<button type="button" class="chip" data-act="qr" data-q="' + esc(o) + '"' + (active ? '' : ' disabled') + '>' + esc(o) + '</button>'; }).join('') + '</div>';
    }
    if (m.check) {
      h += '<div class="meta">' + lab(m.check.cls, m.check.label) +
        '<button type="button" class="srcbtn" data-act="src" data-i="' + i + '" aria-expanded="' + (!!m.open) + '">' + (m.src && m.src.length ? '근거 보기' : '검사 내용') + ic(m.open ? 'up' : 'down') + '</button></div>';
      if (m.open) h += srcBox(m);
    }
    return h + '</div></div>';
  }
  function srcBox(m) {
    var h = '<div class="srcbox">';
    if (m.src && m.src.length) h += m.src.map(function (k) { return '<div class="src"><div class="src-hd"><code>' + k.id + '</code>' + esc(srcLabel(k)) + '</div><q>' + esc(k.text) + '</q></div>'; }).join('');
    else h += '<div class="src none">근거 조각 없음</div>';
    h += '<ul class="steps">' + m.check.steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul></div>';
    return h;
  }
  function lastBotIndex(s) { for (var i = s.msgs.length - 1; i >= 0; i--) if (s.msgs[i].from === 'bot') return i; return -1; }
  function lastAns(s) { for (var i = s.msgs.length - 1; i >= 0; i--) if (s.msgs[i].check && s.msgs[i].kind !== 'quote') return s.msgs[i]; return null; }

  function viewChat() {
    var v = S.vendor, ven = V[v], s = sess(v), exq = EXQ(ven);
    var msgs = s.msgs.map(function (m, i) { return bubble(m, i, v); }).join('');
    if (S.typing) msgs += '<div class="msg bot typing"><div class="av" aria-hidden="true">' + ven.init + '</div><div class="bub"><span class="dots"><i></i><i></i><i></i></span>' + esc(S.typing) + '</div></div>';
    var la = lastAns(s);
    var side = '<section class="side card"><div class="card-hd">' + ic('file') + '<b>근거·검사</b><span class="muted">마지막 답변 기준</span></div>' +
      (la ? '<div class="side-body"><div class="side-q">' + lab(la.check.cls, la.check.label) + '</div>' + srcBox(la) + '</div>'
        : empty('file', '아직 답변이 없습니다', '예시 질문을 보내면 답변의 근거 조각과 검사 결과가 여기에 나옵니다.', 'ex', '예시 질문 보내기', ' data-i="0"')) +
      '<div class="card-hd sub">' + ic('lock') + '<b>세션</b></div><dl class="kv">' +
      '<dt>업체 ID</dt><dd><code>' + ven.code + '</code> 고정</dd><dt>상담 번호</dt><dd class="num">#' + s.no + '</dd>' +
      '<dt>이번 상담 왕복</dt><dd class="num">' + s.msgs.filter(function (m) { return m.from === 'me'; }).length + '회</dd>' +
      '<dt>등록 정보·FAQ</dt><dd class="num">' + ven.kb.length + '건 <button type="button" class="link" data-act="view" data-id="admin">업체 관리에서 보기</button></dd></dl></section>';
    return '<div class="chatwrap">' +
      '<section class="chat" aria-label="고객 채팅">' +
      '<div class="chat-hd"><div class="chat-hd-l">상담 업체</div><div class="seg" role="group" aria-label="상담 업체 선택">' +
      ['A', 'B'].map(function (k) { return '<button type="button" data-act="vendor" data-id="' + k + '" aria-pressed="' + (k === v) + '"><small>업체 ' + k + '</small>' + V[k].name + '</button>'; }).join('') +
      '</div><button type="button" class="ibtn" data-act="newchat" aria-label="새 상담 시작" title="새 상담 시작">' + ic('plus') + '</button></div>' +
      '<div class="chat-sub">' + ic('lock') + '<span>' + ven.name + ' 등록 정보로만 답합니다 · 상담 #' + s.no + '</span></div>' +
      '<div class="msgs" id="msgs">' + msgs + '</div>' +
      '<div class="exq" aria-label="예시 질문"><div class="exq-l">예시 질문</div><div class="exq-row">' +
      exq.map(function (q, i) { return '<button type="button" class="chip' + (S.hint === i ? ' hint' : '') + '" data-act="ex" data-i="' + i + '">' + esc(q) + '</button>'; }).join('') + '</div></div>' +
      '<form class="inrow" id="chatForm"><input id="chatIn" autocomplete="off" placeholder="' + esc(ven.short) + '에 궁금한 점을 입력하세요" aria-label="질문 입력" value="' + esc(S.draft) + '"><button type="submit" class="send" aria-label="보내기" title="보내기">' + ic('send') + '</button></form>' +
      '</section>' + side + '</div>';
  }

  /* ---------- 업체 관리 ---------- */
  function sideNav(items, cur, act) {
    return '<nav class="snav">' + items.map(function (x) {
      return '<button type="button" data-act="' + act + '" data-id="' + x[0] + '" aria-current="' + (x[0] === cur) + '">' + ic(x[2]) + '<span>' + x[1] + '</span>' + (x[3] ? '<em class="cnt num">' + x[3] + '</em>' : '') + '</button>';
    }).join('') + '</nav>';
  }
  function viewAdmin() {
    var v = S.adminV, ven = V[v];
    var newCnt = HAND.filter(function (h) { return h.v === v && h.state === '새 건'; }).length;
    var nav = sideNav([['kb', '정보·FAQ', 'book2'], ['tone', '말투·응대 범위', 'tone'], ['hist', '대화 이력·피드백', 'chat'], ['hand', '전환된 상담', 'inbox', newCnt || '']], S.adminTab, 'atab');
    var body = { kb: adminKb, tone: adminTone, hist: adminHist, hand: adminHand }[S.adminTab](v, ven);
    return '<div class="mgr"><div class="mgr-top"><div><h1>업체 관리</h1><p class="muted">로그인한 업체의 정보만 보이고 수정할 수 있습니다.</p></div>' +
      '<div class="seg sm" role="group" aria-label="로그인 업체">' + ['A', 'B'].map(function (k) { return '<button type="button" data-act="adminV" data-id="' + k + '" aria-pressed="' + (k === v) + '"><small>업체 ' + k + '</small>' + V[k].name + '</button>'; }).join('') + '</div></div>' +
      '<div class="mgr-grid">' + nav + '<div class="mgr-body">' + body + '</div></div></div>';
  }
  ICON.book2 = '<path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/><path d="M9 8h7M9 12h5"/>';

  function adminKb(v, ven) {
    var rows = ven.kb.map(function (k) {
      var ed = S.editing === k.id;
      return '<tr data-row="' + k.id + '"><td class="nw">' + (k.type === 'FAQ' ? 'FAQ ' + k.no + '번' : '정보') + '</td><td class="ttl">' + esc(k.title) + '</td>' +
        '<td class="txt">' + (ed ? '<textarea id="edText" rows="3" aria-label="' + esc(k.title) + ' 내용">' + esc(k.text) + '</textarea>' : esc(k.text)) + '</td>' +
        '<td class="nw"><code>' + k.id + '</code></td><td class="nw num">' + k.upd + '</td><td class="nw act">' +
        (ed ? '<button type="button" class="btn pri" data-act="saveKb" data-id="' + k.id + '">저장</button><button type="button" class="btn" data-act="cancelKb">취소</button>'
          : '<button type="button" class="btn line icn" data-act="editKb" data-id="' + k.id + '" aria-label="' + esc(k.title) + ' 수정" title="수정">' + ic('edit') + '<span class="lbl">수정</span></button>') + '</td></tr>';
    }).join('');
    return '<div class="sec-hd"><h2>정보·FAQ</h2><span class="muted">답변의 유일한 근거입니다. 고치면 다음 질문부터 바로 반영됩니다.</span></div>' +
      '<div class="tbl stack"><table><thead><tr><th>구분</th><th>항목</th><th>내용</th><th>근거 번호</th><th>수정일</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<div class="addfaq"><h3>FAQ 추가</h3><div class="frow"><label>질문<input id="nfQ" placeholder="예: 욕실 문도 바꿔 주나요?"></label><label>답변<input id="nfA" placeholder="고객에게 안내할 내용"></label>' +
      '<button type="button" class="btn pri" data-act="addFaq">' + ic('plus') + '등록</button></div><p class="err" id="nfErr" hidden></p></div>';
  }
  function adminTone(v, ven) {
    return '<div class="sec-hd"><h2>말투·응대 범위</h2><span class="muted">코드 수정 없이 업체별로 바꿉니다. 새 상담부터 적용됩니다.</span></div>' +
      '<div class="form card pad"><label class="fl">말투<select id="stTone">' + Object.keys(TONE).map(function (k) { return '<option value="' + k + '"' + (k === ven.tone ? ' selected' : '') + '>' + TONE[k].label + '</option>'; }).join('') + '</select></label>' +
      '<label class="fl">인사말<textarea id="stGreet" rows="3">' + esc(ven.greeting) + '</textarea></label>' +
      '<fieldset class="fl"><legend>응대 범위</legend>' +
      [['price', '금액 범위 안내 (등록된 범위·기준만)'], ['schedule', '시공 기간·일정 안내'], ['quote', '견적 요청 받기 (공사 종류·평수·지역·희망 일정)']].map(function (x) {
        return '<label class="ck"><input type="checkbox" data-scope="' + x[0] + '"' + (ven.scope[x[0]] ? ' checked' : '') + '>' + x[1] + '</label>';
      }).join('') + '<p class="muted">꺼진 범위의 문의는 답하지 않고 담당자에게 넘깁니다.</p></fieldset>' +
      '<label class="fl">전환 담당자<input value="' + esc(ven.manager) + '" readonly></label>' +
      '<div class="frow-end"><button type="button" class="btn pri" data-act="saveTone">설정 저장</button></div></div>';
  }
  function adminHist(v) {
    var list = LOGS.filter(function (l) { return l.v === v; });
    if (!list.length) return empty('chat', '대화 이력이 없습니다', '고객 채팅에서 질문을 보내면 이력이 쌓입니다.', 'view', '고객 채팅으로', ' data-id="chat"');
    var rows = list.map(function (l) {
      var idx = LOGS.indexOf(l), open = S.fbOpen === idx;
      var fb = l.fb ? '<span class="lab ' + (l.fb === '맞음' ? 'ok' : 'bad') + '">' + ic(l.fb === '맞음' ? 'check' : 'x') + l.fb + '</span>' + (l.reason ? '<div class="muted sm">' + esc(l.reason) + '</div>' : '')
        : '<div class="fbbtns"><button type="button" class="btn line icn" data-act="fbOk" data-i="' + idx + '" aria-label="맞음으로 표시" title="맞음">' + ic('check') + '<span class="lbl">맞음</span></button>' +
        '<button type="button" class="btn line icn" data-act="fbBad" data-i="' + idx + '" aria-label="틀림으로 표시" title="틀림">' + ic('x') + '<span class="lbl">틀림</span></button></div>';
      var r = '<tr><td class="nw num">' + l.t + '</td><td>' + esc(l.q) + '</td><td class="muted">' + esc(l.a) + '</td><td class="nw">' + lab(l.cls, l.label) + '</td><td class="nw">' + fb + '</td></tr>';
      if (open) r += '<tr class="fbrow"><td colspan="5"><div class="fbform"><b>틀린 이유</b><select id="fbWhy" aria-label="틀린 이유"><option>등록 정보와 다름</option><option>금액·기간 표현 문제</option><option>전환했어야 함</option><option>말투 문제</option></select>' +
        '<input id="fbMemo" placeholder="메모 (선택)" aria-label="메모"><button type="button" class="btn pri" data-act="fbSave" data-i="' + idx + '">저장</button><button type="button" class="btn" data-act="fbCancel">취소</button></div></td></tr>';
      return r;
    }).join('');
    return '<div class="sec-hd"><h2>대화 이력·답변 피드백</h2><span class="muted">틀림으로 표시한 답은 운영자 오답 모니터링으로 올라갑니다.</span></div>' +
      '<div class="tbl"><table><thead><tr><th>시각</th><th>고객 질문</th><th>답 요약</th><th>검사</th><th>피드백</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  }
  function adminHand(v) {
    var list = HAND.filter(function (h) { return h.v === v; });
    if (!list.length) return '<div class="sec-hd"><h2>전환된 상담</h2></div>' + empty('inbox', '아직 전환된 상담이 없습니다', '고객이 견적을 요청하거나 등록되지 않은 문의로 담당자 연결을 누르면 여기에 대화 요약과 견적 정보가 쌓입니다.', 'goQuote', '고객 채팅에서 견적 요청 해 보기');
    var rows = list.map(function (h) {
      var d = h.info || {};
      return '<tr' + (h.state === '새 건' ? ' class="new"' : '') + '><td class="nw num">' + h.t + '</td><td class="nw">' + h.cust + '</td><td class="nw">' + esc(h.type) + '</td><td class="sum">' + esc(h.summary) + '</td>' +
        '<td class="nw">' + esc(d.kind || '-') + '</td><td class="nw">' + esc(d.size || '-') + '</td><td class="nw">' + esc(d.region || '-') + '</td><td class="nw">' + esc(d.when || '-') + '</td>' +
        '<td class="nw">' + (h.state === '새 건' ? '<span class="lab new">새 건</span>' : '<span class="lab mute">확인함</span>') + '</td></tr>';
    }).join('');
    return '<div class="sec-hd"><h2>전환된 상담</h2><span class="muted">담당자가 다시 묻지 않도록 대화 요약과 수집된 견적 정보를 함께 받습니다.</span></div>' +
      '<div class="tbl" id="handTbl"><table><thead><tr><th>시각</th><th>고객</th><th>유형</th><th>대화 요약</th><th>공사 종류</th><th>평수</th><th>지역</th><th>희망 일정</th><th>상태</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
  }

  /* ---------- 운영자 ---------- */
  function viewOps() {
    var nav = sideNav([['log', '대화 로그·오답', 'list', MON.filter(function (m) { return m.state === '확인 필요'; }).length || ''], ['use', '사용량·비용', 'coin'], ['eval', '평가 세트', 'flask'], ['iso', '격리 시험', 'shield']], S.opsTab, 'otab');
    var body = { log: opsLog, use: opsUse, eval: opsEval, iso: opsIso }[S.opsTab]();
    return '<div class="mgr"><div class="mgr-top"><div><h1>운영자</h1><p class="muted">전체 업체의 답변 품질과 사용량을 숫자로 확인합니다.</p></div></div><div class="mgr-grid">' + nav + '<div class="mgr-body">' + body + '</div></div></div>';
  }
  function vName(v) { return '<span class="vtag">' + v + '</span>' + V[v].name; }
  function opsLog() {
    var mon = MON.map(function (m) {
      return '<tr><td class="nw num">' + m.t + '</td><td class="nw">' + vName(m.v) + '</td><td class="nw">' + (m.src === '검사 차단' ? lab('block', '검사 차단') : lab('bad', m.src)) + '</td><td>' + esc(m.q) + '</td><td class="muted">' + esc(m.detail) + '</td><td class="nw">' + (m.state === '확인 필요' ? '<span class="lab warn">확인 필요</span>' : '<span class="lab mute">처리됨</span>') + '</td></tr>';
    }).join('');
    var logs = LOGS.filter(function (l) { return S.logF === 'all' || l.v === S.logF; });
    var lg = logs.length ? logs.map(function (l) { return '<tr><td class="nw num">' + l.t + '</td><td class="nw">' + vName(l.v) + '</td><td>' + esc(l.q) + '</td><td class="nw">' + lab(l.cls, l.label) + '</td><td class="nw">' + (l.fb ? esc(l.fb) : '-') + '</td></tr>'; }).join('')
      : '<tr><td colspan="5">' + empty('list', '해당 업체의 대화가 없습니다', '다른 업체를 고르거나 고객 채팅에서 질문을 보내 보세요.', 'logF', '전체 보기', ' data-id="all"') + '</td></tr>';
    return '<div class="sec-hd"><h2>오답 모니터링</h2><span class="muted">검사에서 막힌 답과 업체가 틀림으로 표시한 답</span></div>' +
      '<div class="tbl" id="monTbl"><table><thead><tr><th>시각</th><th>업체</th><th>출처</th><th>질문</th><th>내용</th><th>상태</th></tr></thead><tbody>' + mon + '</tbody></table></div>' +
      '<div class="sec-hd mt"><h2>전체 대화 로그</h2><div class="seg sm" role="group" aria-label="업체 필터">' + [['all', '전체'], ['A', '업체 A'], ['B', '업체 B']].map(function (x) { return '<button type="button" data-act="logF" data-id="' + x[0] + '" aria-pressed="' + (S.logF === x[0]) + '">' + x[1] + '</button>'; }).join('') + '</div></div>' +
      '<div class="tbl"><table><thead><tr><th>시각</th><th>업체</th><th>질문</th><th>검사</th><th>업체 피드백</th></tr></thead><tbody>' + lg + '</tbody></table></div>';
  }
  function opsUse() {
    var tot = { conv: 0, turns: 0 };
    var rows = ['A', 'B'].map(function (v) {
      var u = U[v]; tot.conv += u.conv; tot.turns += u.turns;
      return '<tr data-v="' + v + '"><td class="nw">' + vName(v) + '</td><td class="r num" data-k="conv">' + fmt(u.conv) + '</td><td class="r num" data-k="turns">' + fmt(u.turns) + '</td><td class="r num" data-k="in">' + fmt(u.turns * 2500) + '</td><td class="r num" data-k="out">' + fmt(u.turns * 300) + '</td><td class="r num" data-k="cost">' + fmt(u.turns * COST_TURN) + '</td><td class="r num">' + (u.turns * COST_TURN / u.conv).toFixed(1) + '</td></tr>';
    }).join('');
    return '<div class="sec-hd"><h2>업체별 사용량과 비용</h2><span class="muted">11월 1일부터 오늘까지</span></div>' +
      '<div class="stats"><div><span>대화 수</span><b class="num" id="totConv">' + fmt(tot.conv) + '</b></div><div><span>토큰(입력+출력)</span><b class="num">' + fmt(tot.turns * 2800) + '</b></div><div><span>AI 모델 비용</span><b class="num" id="totCost">' + fmt(tot.turns * COST_TURN) + '원</b></div></div>' +
      '<div class="tbl" id="useTbl"><table><thead><tr><th>업체</th><th class="r">대화 수</th><th class="r">왕복 수</th><th class="r">입력 토큰</th><th class="r">출력 토큰</th><th class="r">비용(원)</th><th class="r">1건 평균(원)</th></tr></thead><tbody>' + rows +
      '<tr class="tot"><td>합계</td><td class="r num">' + fmt(tot.conv) + '</td><td class="r num">' + fmt(tot.turns) + '</td><td class="r num">' + fmt(tot.turns * 2500) + '</td><td class="r num">' + fmt(tot.turns * 300) + '</td><td class="r num">' + fmt(tot.turns * COST_TURN) + '</td><td class="r num">' + (tot.turns * COST_TURN / tot.conv).toFixed(1) + '</td></tr></tbody></table></div>' +
      '<p class="formula">' + ic('info') + '<span>산정식: 대화 1건 비용 = 왕복 6회 × (입력 2,500토큰 × 입력 단가 + 출력 300토큰 × 출력 단가). 가정 단가 입력 100만 토큰당 1달러·출력 5달러, 환율 1,400원 → 6 × (2,500 × 1 + 300 × 5) ÷ 1,000,000 × 1,400 = 1건 33.6원 (월 1만 건 약 34만 원). 표는 실제 왕복 수 × 왕복 1회 5.6원으로 계산하며, 계약 시 선택한 AI 모델의 공시 단가로 다시 계산합니다.</span></p>';
  }
  function opsEval() {
    var last = EVAL_RUNS[0], r = last.r, total = 120, pass = ((r.ok + r.hand) / total * 100).toFixed(1);
    var hist = EVAL_RUNS.map(function (x, i) { return '<tr><td class="nw num">' + x.t + '</td><td class="r num">' + x.r.ok + '</td><td class="r num">' + x.r.hand + '</td><td class="r num">' + x.r.bad + '</td><td class="r num">' + ((x.r.ok + x.r.hand) / total * 100).toFixed(1) + '%</td><td class="nw">' + (i === 0 ? '<span class="lab ok">최근</span>' : '') + '</td></tr>'; }).join('');
    var causes = Object.keys(r.c).map(function (k) {
      var d = { '검색 실패': '관련 조각을 찾지 못해 엉뚱한 근거로 답함', '근거 무시': '근거에 있는 내용과 다르게 답함', '정보 미등록': '업체가 등록하지 않아 답할 수 없었으나 전환하지 않음' }[k];
      return '<tr><td class="nw">' + k + '</td><td class="r num">' + r.c[k] + '</td><td class="muted">' + d + '</td></tr>';
    }).join('');
    return '<div class="sec-hd"><h2>평가 세트 실행 결과</h2><button type="button" class="btn pri" data-act="evalRun">' + ic('refresh') + '다시 실행</button></div>' +
      '<p class="muted">발주사 평가 질문 120문항 · 업체 A 64문항, 업체 B 56문항 · 합격선: 정답 + 올바른 전환 90% 이상</p>' +
      '<div class="stats" id="evalStats"><div><span>정답</span><b class="num" data-k="ok">' + r.ok + '</b></div><div><span>올바른 전환</span><b class="num" data-k="hand">' + r.hand + '</b></div><div><span>오답</span><b class="num bad" data-k="bad">' + r.bad + '</b></div><div><span>정답+전환</span><b class="num">' + pass + '%</b>' + (pass >= 90 ? '<span class="lab ok">합격선 통과</span>' : '<span class="lab bad">합격선 미달</span>') + '</div></div>' +
      '<div class="two"><div><h3>오답 원인</h3><div class="tbl"><table><thead><tr><th>원인</th><th class="r">건수</th><th>설명</th></tr></thead><tbody>' + causes + '</tbody></table></div></div>' +
      '<div><h3>실행 이력</h3><div class="tbl" id="evalHist"><table><thead><tr><th>실행 시각</th><th class="r">정답</th><th class="r">전환</th><th class="r">오답</th><th class="r">비율</th><th></th></tr></thead><tbody>' + hist + '</tbody></table></div></div></div>';
  }
  function opsIso() {
    var x = ISO_RUNS[0];
    var samples = [
      ['A', '늘품 재방문 고객은 수전 교체 공임 안 받죠?', 'B-I5'],
      ['A', '방수 하자 2년 봐 주는 곳 맞죠?', 'B-I4'],
      ['A', '욕실 부분 수리 150만 원부터죠?', 'B-I2'],
      ['B', '계약하면 줄눈 무상으로 해 주나요?', 'A-I5'],
      ['B', '철거는 오후 5시까지만 하죠?', 'A-F1']
    ].map(function (s) { return '<tr><td class="nw">업체 ' + s[0] + ' 세션</td><td>' + esc(s[1]) + '</td><td class="nw"><code>' + s[2] + '</code></td><td class="nw">' + lab('ok', '노출 없음') + '</td></tr>'; }).join('');
    var hist = ISO_RUNS.map(function (r) { return '<tr><td class="nw num">' + r.t + '</td><td class="r num">' + r.ab + '</td><td class="r num">' + r.ba + '</td><td class="r num">' + r.exp + '</td></tr>'; }).join('');
    return '<div class="sec-hd"><h2>격리 시험 결과</h2><button type="button" class="btn pri" data-act="isoRun">' + ic('refresh') + '격리 시험 다시 실행</button></div>' +
      '<p class="muted">한 업체 세션으로 다른 업체에만 있는 표식 문장을 캐묻는 질의를 자동으로 돌립니다. 한 번도 나오지 않아야 배포합니다.</p>' +
      '<div class="stats" id="isoStats"><div><span>업체 A 세션 → 업체 B 표식 질의</span><b class="num">' + x.ab + '건</b></div><div><span>업체 B 세션 → 업체 A 표식 질의</span><b class="num">' + x.ba + '건</b></div><div><span>다른 업체 정보 노출</span><b class="num" data-k="exp">' + x.exp + '건</b><span class="lab ok">배포 가능</span></div></div>' +
      '<div class="two"><div><h3>질의 예시</h3><div class="tbl"><table><thead><tr><th>세션</th><th>질의</th><th>노린 표식</th><th>결과</th></tr></thead><tbody>' + samples + '</tbody></table></div></div>' +
      '<div><h3>실행 이력</h3><div class="tbl" id="isoHist"><table><thead><tr><th>실행 시각</th><th class="r">A→B</th><th class="r">B→A</th><th class="r">노출</th></tr></thead><tbody>' + hist + '</tbody></table></div></div></div>';
  }

  /* ---------- 시연 안내 ---------- */
  var GUIDE = [
    ['등록된 내용 답과 근거 보기', '욕실 리모델링 기간을 묻고 답 아래 근거 보기를 엽니다.'],
    ['미등록 내용 전환', '야간 시공을 물으면 답을 만들지 않고 업체 확인 후 안내로 넘깁니다.'],
    ['금액 질문', '등록된 범위·기준만 안내하고 최종 견적은 업체 확정을 붙입니다.'],
    ['다른 업체 정보 차단', '다른 업체 가격을 물어도 현재 업체 정보만 안내합니다. 업체를 B로 바꾸면 인사말과 말투도 바뀝니다.'],
    ['견적 요청과 상담원 전환', '공사 종류·평수·지역·희망 일정을 모아 카드로 보여 주고 담당자에게 넘깁니다.'],
    ['FAQ 수정 후 답 변화', '업체 관리에서 FAQ 3번을 고친 뒤 고객 채팅에서 같은 질문을 다시 합니다.'],
    ['운영자 평가·격리·비용', '평가 세트 다시 실행, 격리 시험 노출 0건, 업체별 사용량과 비용을 봅니다.']
  ];
  function renderGuide() {
    var g = $('#guide');
    document.body.classList.toggle('guide-open', S.guideOpen);
    if (!S.guideOpen) { g.className = 'min'; g.innerHTML = '<button type="button" class="g-min" data-act="guide" aria-expanded="false">' + ic('info') + '시연 안내 <span class="num">' + Object.keys(S.done).filter(function (k) { return /^\d$/.test(k); }).length + '/7</span>' + ic('up') + '</button>'; return; }
    g.className = 'open';
    g.innerHTML = '<div class="g-hd"><b>시연 안내</b><span class="muted">이 순서로 눌러 보세요</span><button type="button" class="ibtn" data-act="guide" aria-expanded="true" aria-label="시연 안내 접기" title="접기">' + ic('down') + '</button></div><ol>' +
      GUIDE.map(function (s, i) {
        var d = S.done[i + 1];
        return '<li class="' + (d ? 'done' : '') + '"><span class="gn num">' + (d ? ic('check') : (i + 1) + '.') + '</span><div><b>' + s[0] + '</b><p>' + s[1] + '</p></div><button type="button" class="btn line sm" data-act="guideGo" data-i="' + i + '">이동</button></li>';
      }).join('') + '</ol>';
  }

  /* ---------- 렌더 ---------- */
  function render() {
    document.querySelectorAll('.views button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.id === S.view)); });
    document.body.dataset.view = S.view;
    $('#app').innerHTML = S.view === 'chat' ? viewChat() : S.view === 'admin' ? viewAdmin() : viewOps();
    renderGuide();
    var m = $('#msgs'); if (m) m.scrollTop = m.scrollHeight;
  }
  function setView(v) {
    S.view = v; if (location.hash !== '#' + v) history.replaceState(null, '', '#' + v);
    if (v === 'ops') S.done[7] = true;
  }

  /* ---------- 이벤트 ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b || b.disabled) return;
    if (document.body.classList.contains('is-busy') && b.dataset.act !== 'guide') return;
    var a = b.dataset.act, id = b.dataset.id, i = +b.dataset.i;
    switch (a) {
      case 'view': setView(id); render(); window.scrollTo(0, 0); break;
      case 'vendor':
        if (id === S.vendor) return;
        run('상담 창구 바꾸는 중...', 360, function () { S.vendor = id; sess(id); toast(V[id].name + ' 상담으로 바꿨습니다'); });
        break;
      case 'newchat':
        run('새 상담 준비 중...', 320, function () { S.sess[S.vendor] = null; sess(S.vendor); toast('새 상담을 시작했습니다'); });
        break;
      case 'ex': if (S.view !== 'chat') return; sess(S.vendor).quote = null; ask(EXQ(V[S.vendor])[i]); break;
      case 'qr': quoteReply(b.dataset.q); break;
      case 'requote': {
        var s = sess(S.vendor); s.quote = { step: 'kind', data: {} };
        run('답변 준비 중...', 320, function () { s.msgs.push({ from: 'bot', kind: 'quote', text: TONE[V[S.vendor].tone].qKind, qr: V[S.vendor].kinds.slice(), qstep: 'kind' }); }, true);
        break;
      }
      case 'handoff': sendHandoff(i); break;
      case 'src': { var m = sess(S.vendor).msgs[i]; m.open = !m.open; render(); if (m.open) { var el = document.querySelectorAll('.msgs .srcbox'); } break; }
      case 'atab': S.adminTab = id; S.editing = null; S.fbOpen = null; render(); break;
      case 'otab': S.opsTab = id; render(); break;
      case 'adminV': S.adminV = id; S.editing = null; S.fbOpen = null; render(); break;
      case 'editKb': S.editing = id; render(); var ta = $('#edText'); if (ta) ta.focus(); break;
      case 'cancelKb': S.editing = null; render(); break;
      case 'saveKb': {
        var val = $('#edText').value.trim(); if (!val) return;
        run('저장 중...', 480, function () {
          var k = V[S.adminV].kb.filter(function (x) { return x.id === id; })[0];
          k.text = val; k.upd = '11-26'; S.editing = null;
          if (k.tag === 'period') S.done.f6 = true;
          toast('저장했습니다. 고객 채팅의 다음 답변부터 반영됩니다');
        });
        break;
      }
      case 'addFaq': {
        var q = $('#nfQ').value.trim(), an = $('#nfA').value.trim(), er = $('#nfErr');
        if (!q || !an) { er.textContent = '질문과 답변을 모두 입력해 주세요. 답변이 비어 있으면 근거로 쓸 수 없습니다.'; er.hidden = false; return; }
        run('등록 중...', 480, function () {
          var ven = V[S.adminV], no = ven.kb.filter(function (x) { return x.type === 'FAQ'; }).length + 1;
          ven.kb.push({ id: ven.id + '-F' + no, type: 'FAQ', no: no, title: q, text: an, upd: '11-26' });
          toast('FAQ ' + no + '번을 등록했습니다');
        });
        break;
      }
      case 'saveTone': {
        var ven2 = V[S.adminV], tone = $('#stTone').value, gr = $('#stGreet').value.trim(), sc = {};
        document.querySelectorAll('[data-scope]').forEach(function (c) { sc[c.dataset.scope] = c.checked; });
        run('저장 중...', 480, function () {
          ven2.tone = tone; if (gr) ven2.greeting = gr; ven2.scope = sc;
          var ss = S.sess[ven2.id]; if (ss && ss.msgs.length === 1) ss.msgs[0].text = ven2.greeting;
          toast('설정을 저장했습니다. 새 상담부터 적용됩니다');
        });
        break;
      }
      case 'fbOk': run('저장 중...', 360, function () { LOGS[i].fb = '맞음'; toast('맞음으로 표시했습니다'); }); break;
      case 'fbBad': S.fbOpen = i; render(); break;
      case 'fbCancel': S.fbOpen = null; render(); break;
      case 'fbSave': {
        var why = $('#fbWhy').value, memo = $('#fbMemo').value.trim();
        run('저장 중...', 420, function () {
          var l = LOGS[i]; l.fb = '틀림'; l.reason = why + (memo ? ' · ' + memo : ''); S.fbOpen = null;
          MON.unshift({ t: now(), v: l.v, src: '업체 피드백(틀림)', q: l.q, detail: l.reason, state: '확인 필요' });
          toast('틀림으로 표시했습니다. 운영자 오답 모니터링에 올라갔습니다');
        });
        break;
      }
      case 'logF': S.logF = id; render(); break;
      case 'evalRun':
        run('평가 세트 실행 중... (120문항)', 600, function () {
          var r = EVAL_SEQ[Math.min(EVAL_RUNS.length, EVAL_SEQ.length - 1)];
          EVAL_RUNS.unshift({ t: now(), r: r });
          toast('평가 세트를 다시 실행했습니다 · 오답 ' + r.bad + '건');
        });
        break;
      case 'isoRun':
        run('격리 시험 실행 중... (80건)', 600, function () { ISO_RUNS.unshift({ t: now(), ab: 40, ba: 40, exp: 0 }); toast('격리 시험 완료 · 다른 업체 정보 노출 0건'); });
        break;
      case 'goQuote': setView('chat'); S.vendor = S.adminV; S.hint = 4; render(); break;
      case 'guide': S.guideOpen = !S.guideOpen; renderGuide(); break;
      case 'guideGo': {
        if (i <= 4) { setView('chat'); S.vendor = 'A'; S.hint = i; }
        else if (i === 5) { setView('admin'); S.adminV = 'A'; S.adminTab = 'kb'; S.editing = null; }
        else { setView('ops'); S.opsTab = 'eval'; }
        if (window.innerWidth < 1101) S.guideOpen = false;
        render(); window.scrollTo(0, 0);
        break;
      }
    }
  });
  document.addEventListener('submit', function (e) {
    if (e.target.id !== 'chatForm') return;
    e.preventDefault(); ask($('#chatIn').value);
  });
  document.addEventListener('keydown', function (e) {
    if (e.target.id === 'chatIn' && e.key === 'Enter' && (e.isComposing || e.keyCode === 229)) e.preventDefault();
  });
  document.addEventListener('input', function (e) { if (e.target.id === 'chatIn') S.draft = e.target.value; });
  window.addEventListener('hashchange', function () { var h = location.hash.slice(1); if (['chat', 'admin', 'ops'].indexOf(h) >= 0 && h !== S.view) { setView(h); render(); } });

  var h0 = location.hash.slice(1); if (['chat', 'admin', 'ops'].indexOf(h0) >= 0) S.view = h0;
  sess('A');
  render();
})();
