'use strict';
/* 여밈 시안 — 모든 데이터는 예시, 상태는 메모리에만 둔다 */
const P = {
  upload: '<path d="M12 15V4M7 9l5-5 5 5"/><path d="M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4"/>',
  doc: '<path d="M14 3H7a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  alert: '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17.5v.01"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="1"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  bell: '<path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  next: '<path d="M9 5l7 7-7 7"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.01"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a5 5 0 0 1 3.5 6"/>',
  shield: '<path d="M12 3l8 3v6c0 4.5-3.5 8-8 9-4.5-1-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5"/>',
  send: '<path d="M4 12l16-8-6 16-3-7z"/>',
  folder: '<path d="M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>',
  grid: '<rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><rect x="13" y="13" width="7" height="7"/>',
  sliders: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>'
};
const ic = (n, c = '') => `<svg class="ic ${c}" viewBox="0 0 24 24" aria-hidden="true">${P[n]}</svg>`;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const $ = s => document.querySelector(s);

const TODAY = new Date(2026, 10, 26);
const DEATH = new Date(2026, 9, 30);
const ELAPSED = Math.round((TODAY - DEATH) / 86400000); // 27
const pad = n => String(n).padStart(2, '0');
const fmt = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
let clk = 14 * 60 + 2;
const stamp = () => { clk += 3; return `11-26 ${pad(Math.floor(clk / 60))}:${pad(clk % 60)}`; };

/* 예시 문서(재산 조회 결과 예시) */
const SRC = [
  { ln: 1, cat: '금융', org: '○○은행', desc: '보통예금 1건', amt: '12,480,000원' },
  { ln: 2, cat: '금융', org: '△△카드', desc: '미결제 이용대금', amt: '1,320,000원' },
  { ln: 3, cat: '토지·건물', org: '-', desc: '○○시 ○○구 아파트 1건', amt: '소유' },
  { ln: 4, cat: '자동차', org: '-', desc: '승용차 1대(2018년식)', amt: '소유' },
  { ln: 5, cat: '연금', org: '연금 관리 기관', desc: '유족연금 대상 여부', amt: '개별 확인' },
  { ln: 6, cat: '지방세', org: '○○구청', desc: '체납 내역 없음', amt: '-' },
  { ln: 7, cat: '보험', org: '□□생명', desc: '보험계약 2건', amt: '-' },
  { ln: 8, cat: '금융', org: '○○은행', desc: '정기예금 1건', amt: '20,180,000원' }
];
const EXTRACT = () => [
  { id: 'i7', cat: '예금', label: '○○은행 정기예금', value: '21,800,000원', ln: 8, st: 'need', why: '이 금액을 원문에서 찾지 못했습니다. 원문 8번 줄과 비교해 고쳐 주세요.' },
  { id: 'i8', cat: '예금', label: '▽▽증권 위탁계좌', value: '3,050,000원', ln: null, st: 'need', why: '원문에서 이 항목을 찾지 못했습니다. 원문에 없는 값이면 삭제해 주세요.' },
  { id: 'i1', cat: '예금', label: '○○은행 보통예금', value: '12,480,000원', ln: 1, st: 'ok' },
  { id: 'i2', cat: '채무', label: '△△카드 미결제 이용대금', value: '1,320,000원', ln: 2, st: 'ok' },
  { id: 'i3', cat: '부동산', label: '○○시 ○○구 아파트', value: '1건', ln: 3, st: 'ok' },
  { id: 'i4', cat: '자동차', label: '승용차(2018년식)', value: '1대', ln: 4, st: 'ok' },
  { id: 'i5', cat: '연금', label: '유족연금 대상 여부', value: '개별 확인', ln: 5, st: 'ok' },
  { id: 'i6', cat: '보험', label: '□□생명 보험계약', value: '2건', ln: 7, st: 'ok' }
];
const ST_LB = { ok: ['lb-ok', '원문 확인됨'], need: ['lb-need', '확인 필요'], edited: ['lb-mid', '이용자 수정'] };

const COND = {
  always: '모든 이용자', 'a:예금': '예금이 있을 때', 'a:부동산': '부동산이 있을 때', 'a:채무': '채무가 있을 때',
  'a:자동차': '자동차가 있을 때', 'a:연금': '연금 항목이 있을 때', 'a:보험': '보험이 있을 때',
  'a:재산': '예금 또는 부동산이 있을 때', 's:혼자': '고인이 혼자 거주했을 때', 's:사업자': '고인이 사업자였을 때'
};
const RULES0 = [
  { id: 'r1', name: '사망신고', days: 30, cond: 'always', where: '시·구청 또는 읍·면·동 주민센터', on: true },
  { id: 'r2', name: '상속 방법(승인·포기 등) 검토', days: 90, cond: 'a:채무', where: '전문가 상담 후 관할 법원', on: true },
  { id: 'r3', name: '예금 지급·명의 정리', days: 180, cond: 'a:예금', where: '해당 은행 영업점', on: true },
  { id: 'r4', name: '부동산 상속 등기·취득세 신고', days: 180, cond: 'a:부동산', where: '관할 등기소, 시·구청 세무과', on: true },
  { id: 'r5', name: '상속세 신고 검토', days: 180, cond: 'a:재산', where: '관할 세무서', on: true },
  { id: 'r6', name: '자동차 이전 등록', days: 180, cond: 'a:자동차', where: '차량 등록 사업소', on: true },
  { id: 'r7', name: '유족연금 청구 확인', days: 150, cond: 'a:연금', where: '연금 관리 기관 지사', on: true },
  { id: 'r8', name: '사망보험금 청구', days: 365, cond: 'a:보험', where: '해당 보험사', on: true },
  { id: 'r9', name: '공과금·통신 명의 정리', days: 45, cond: 's:혼자', where: '관리사무소, 각 통신사', on: true },
  { id: 'r10', name: '유품 정리 일정 정하기', days: 60, cond: 's:혼자', where: '가족 또는 전문 업체', on: true },
  { id: 'r11', name: '사업자 폐업 신고', days: 60, cond: 's:사업자', where: '관할 세무서', on: true }
];
const FIELDS = [
  { id: 'reg', name: '상속 등기', desc: '부동산 명의를 상속인으로 옮기는 절차를 돕습니다.', cats: ['부동산'] },
  { id: 'tax', name: '세무 신고', desc: '상속세·취득세 신고 대상인지 함께 살펴봅니다.', cats: ['예금', '부동산'] },
  { id: 'clean', name: '유품 정리', desc: '고인의 거처를 정리하고 남길 물건을 함께 고릅니다.', sit: true }
];
const PARTNERS = [
  { id: 'p1', field: 'reg', name: '맑은터 법무사사무소', area: '○○시 ○○구', how: '방문·화상 상담', scope: '상속 등기 신청, 필요 서류 안내, 등기소 제출 대행', resp: '영업일 1일 안 답변(예시)' },
  { id: 'p2', field: 'reg', name: '솔빛 법무사사무소', area: '△△시', how: '화상 상담', scope: '상속 등기, 상속재산 분할 협의서 작성 안내', resp: '영업일 2일 안 답변(예시)' },
  { id: 'p3', field: 'tax', name: '나란 세무회계', area: '○○시 ○○구', how: '방문·화상 상담', scope: '상속세 신고 검토, 취득세 신고 안내', resp: '영업일 1일 안 답변(예시)' },
  { id: 'p4', field: 'tax', name: '도담 세무회계', area: '□□시', how: '전화 예약 후 방문', scope: '상속세 신고 대리, 금융재산 정리 상담', resp: '영업일 2일 안 답변(예시)' },
  { id: 'p5', field: 'clean', name: '가지런 유품정리', area: '○○시 전역', how: '현장 방문 견적', scope: '유품 분류·보관·처분, 거처 정리', resp: '영업일 1일 안 답변(예시)' },
  { id: 'p6', field: 'clean', name: '차곡 정리', area: '○○시·△△시', how: '현장 방문 견적', scope: '유품 정리, 기증·재활용 연계', resp: '영업일 2일 안 답변(예시)' }
];
const DISC = [
  { k: 'rel', label: '고인과의 관계' }, { k: 'death', label: '사망일' }, { k: 'addr', label: '고인 거주지(시·구)' },
  { k: 'realty', label: '부동산 항목', cat: '부동산' }, { k: 'deposit', label: '예금 항목', cat: '예금' },
  { k: 'debt', label: '채무 항목', cat: '채무' }, { k: 'car', label: '자동차 항목', cat: '자동차' },
  { k: 'ins', label: '보험 항목', cat: '보험' }, { k: 'tasks', label: '체크리스트 진행 상황' }, { k: 'orig', label: '결과지 원본 문서' }
];
const DEF_DISC = { reg: ['rel', 'death', 'realty'], tax: ['rel', 'death', 'deposit', 'realty'], clean: ['addr'] };

const S = {
  role: 'user', view: 'upload', pv: 'apps', av: 'ops',
  doc: null, sel: null, editing: null,
  sit: { rel: '자녀', assets: [], live: '혼자 거주', biz: '아니오' },
  tstat: { r1: '진행 중' }, alerts: {}, tf: 'todo',
  rules: RULES0.map(r => ({ ...r })), rdraft: null,
  pField: null, pSel: null, applying: false, draftDisc: null,
  apps: [
    { id: 'A-27', pid: 'p1', who: '이○○', field: 'reg', status: '상담 중', at: '11-24 11:20', disc: { rel: 1, death: 1, realty: 1 }, revoked: {}, vals: { rel: '배우자', death: '2026-10-12', realty: '△△시 단독주택 1건' } },
    { id: 'A-22', pid: 'p1', who: '박○○', field: 'reg', status: '완료', at: '11-18 09:40', disc: { rel: 1, death: 1, realty: 1, addr: 1 }, revoked: {}, vals: { rel: '자녀', death: '2026-09-21', realty: '○○시 아파트 1건', addr: '○○시 ○○구' } },
    { id: 'A-29', pid: 'p3', who: '정○○', field: 'tax', status: '신규', at: '11-25 15:05', disc: { rel: 1, deposit: 1 }, revoked: {}, vals: { rel: '자녀', deposit: '○○은행 예금 2건' } },
    { id: 'A-25', pid: 'p5', who: '최○○', field: 'clean', status: '상담 중', at: '11-22 13:30', disc: { addr: 1 }, revoked: {}, vals: { addr: '△△시 ○○동' } }
  ],
  seq: 31, partnerAcc: 'p1', papp: null, pf: '전체', pOrig: {},
  logs: [
    { t: '11-25 16:40', who: '나란 세무회계', role: '전문 파트너', target: '정○○ 신청 건', items: '고인과의 관계, 예금 항목', kind: '파트너 열람' },
    { t: '11-25 10:02', who: '운영자 한○○', role: '관리자', target: '최○○ 결과지 원본', items: '원본 문서', kind: '관리자 열람', note: '삭제 요청 확인' },
    { t: '11-24 11:52', who: '맑은터 법무사사무소', role: '전문 파트너', target: '이○○ 신청 건', items: '고인과의 관계, 사망일, 부동산 항목', kind: '파트너 열람' },
    { t: '11-24 11:20', who: '이○○', role: '이용자', target: '상담 신청 A-27', items: '고인과의 관계, 사망일, 부동산 항목', kind: '공개 동의' }
  ],
  lf: '전체', keepDays: 90,
  keep: [
    { who: '최○○', name: '재산 조회 결과지', up: new Date(2026, 7, 31) },
    { who: '윤○○', name: '재산 조회 결과지', up: new Date(2026, 8, 2) },
    { who: '박○○', name: '재산 조회 결과지', up: new Date(2026, 8, 15) },
    { who: '정○○', name: '재산 조회 결과지', up: new Date(2026, 10, 25) }
  ],
  guideOpen: window.innerWidth >= 1101
};

/* ---------- 계산 ---------- */
const resolvedItems = () => (S.doc && S.doc.confirmed) ? S.doc.items.filter(i => i.st !== 'need') : [];
const docCats = () => new Set(resolvedItems().map(i => i.cat));
const hasCat = c => docCats().has(c) || S.sit.assets.includes(c);
function condOk(c) {
  if (c === 'always') return true;
  if (c === 's:혼자') return S.sit.live === '혼자 거주';
  if (c === 's:사업자') return S.sit.biz === '예';
  if (c === 'a:재산') return hasCat('예금') || hasCat('부동산');
  return hasCat(c.slice(2));
}
function fromDoc(c) {
  const d = docCats();
  if (c === 'a:재산') return d.has('예금') || d.has('부동산');
  return c.startsWith('a:') && d.has(c.slice(2));
}
function tasks() {
  const order = { '시작 전': 0, '진행 중': 0, '완료': 1 };
  return S.rules.filter(r => r.on && condOk(r.cond)).map(r => ({
    ...r, left: r.days - ELAPSED, due: addDays(DEATH, r.days), st: S.tstat[r.id] || '시작 전', doc: fromDoc(r.cond)
  })).sort((a, b) => order[a.st] - order[b.st] || a.left - b.left);
}
function fieldInfo(f) {
  if (f.sit) {
    const need = S.sit.live === '혼자 거주';
    return { need, why: need ? '상황 입력에서 "고인 혼자 거주"를 골라 안내합니다.' : '상황 입력에서 "혼자 거주"를 고르면 안내합니다.', doc: false };
  }
  const d = docCats();
  const docHit = f.cats.filter(c => d.has(c));
  const sitHit = f.cats.filter(c => S.sit.assets.includes(c) && !d.has(c));
  if (docHit.length) {
    const it = resolvedItems().filter(i => docHit.includes(i.cat)).map(i => `"${i.label} ${i.value}"`).slice(0, 2).join(', ');
    return { need: true, doc: true, why: `결과지에서 확인된 ${it} 때문에 안내합니다.` };
  }
  if (sitHit.length) return { need: true, doc: false, why: `상황 입력의 재산 종류(${sitHit.join('·')})로 안내합니다.` };
  return { need: false, doc: false, why: `${f.cats.join(' 또는 ')} 항목이 확인되면 안내합니다.` };
}
function discVal(app, k) {
  if (app.vals) return app.vals[k] || '-';
  const def = DISC.find(d => d.k === k);
  if (k === 'rel') return S.sit.rel;
  if (k === 'death') return fmt(DEATH);
  if (k === 'addr') return '○○시 ○○구';
  if (k === 'tasks') { const t = tasks(); return `${t.length}건 중 완료 ${t.filter(x => x.st === '완료').length}건`; }
  if (k === 'orig') return '재산조회_결과_예시.pdf';
  const its = resolvedItems().filter(i => i.cat === def.cat);
  return its.length ? its.map(i => `${i.label} ${i.value}`).join(', ') : '';
}
const discAvail = k => { const d = DISC.find(x => x.k === k); if (k === 'orig') return !!S.doc; return d.cat ? resolvedItems().some(i => i.cat === d.cat) : true; };
const visible = (app, k) => !!app.disc[k] && !app.revoked[k];
const pname = id => PARTNERS.find(p => p.id === id).name;
const fname = id => FIELDS.find(f => f.id === id).name;
const log = (o) => S.logs.unshift({ t: stamp(), ...o });

/* ---------- 처리 표시 ---------- */
let toastT;
function toast(msg) {
  const t = $('#toast'); t.innerHTML = ic('check') + `<span>${esc(msg)}</span>`; t.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2400);
}
function run(msg, fn, ms = 450) {
  $('#busyMsg').textContent = msg; $('#busy').hidden = false;
  setTimeout(() => { const m = fn(); $('#busy').hidden = true; render(); if (m) toast(m); }, ms);
}

/* ---------- 화면: 공통 ---------- */
const NAV = {
  user: [['upload', '결과지 올리기', 'upload'], ['confirm', '항목 확인', 'doc'], ['check', '내 체크리스트', 'list'], ['fields', '서비스 분야 안내', 'grid'], ['partners', '전문 파트너', 'users'], ['mine', '내 신청 현황', 'send']],
  partner: [['apps', '상담·신청 현황', 'list']],
  admin: [['ops', '운영 현황', 'grid'], ['rules', '기준 데이터', 'sliders'], ['logs', '문서 열람 기록', 'eye'], ['keep', '보관·자동 삭제', 'clock']]
};
function navHTML() {
  const cur = S.role === 'user' ? S.view : S.role === 'partner' ? S.pv : S.av;
  const head = { user: '김○○ 님(본인확인 완료)', partner: pname(S.partnerAcc), admin: '운영자 화면' }[S.role];
  return `<div class="nh">${esc(head)}</div>` + NAV[S.role].map(([id, t, i]) => {
    let cnt = '';
    if (id === 'confirm' && S.doc && !S.doc.confirmed) { const n = S.doc.items.filter(x => x.st === 'need').length; if (n) cnt = `<span class="cnt">확인 필요 ${n}</span>`; }
    if (id === 'mine') { const n = S.apps.filter(a => a.mine).length; if (n) cnt = `<span class="cnt">${n}</span>`; }
    return `<button type="button" data-act="go" data-id="${id}" ${cur === id ? 'aria-current="page"' : ''}>${ic(i)}<span>${t}</span>${cnt}</button>`;
  }).join('');
}
const empty = (icon, msg, btn, act, id = '') => `<div class="empty">${ic(icon)}<p>${msg}</p><button type="button" class="btn pri keep" data-act="${act}" data-id="${id}"><span class="lbl">${btn}</span></button></div>`;

/* ---------- 이용자 1: 결과지 올리기 ---------- */
function vUpload() {
  const d = S.doc;
  const row = d ? `<div class="row-doc">${ic('doc')}<div class="grow"><b>${esc(d.name)}</b><div class="sm mut">${d.up} 올림 · 예시 문서 · 원본은 암호화 보관(예시)</div></div>
      <span class="lb ${d.confirmed ? 'lb-ok' : 'lb-need'}">${d.confirmed ? '확인 완료' : '확인 대기'}</span>
      <button type="button" class="btn" data-act="go" data-id="confirm">${d.confirmed ? '항목 보기' : '확인하기'}</button></div>`
    : empty('folder', '아직 올린 결과지가 없습니다. 예시 문서로 처리 흐름을 볼 수 있습니다.', '예시 문서 사용', 'useSample');
  return `<div class="ph"><div><h1>결과지 올리기</h1><p>안심상속 결과지를 올리면 재산 항목을 읽어 확인 화면으로 보여 드립니다.</p></div></div>
  <div class="stack up">
    <div class="drop">${ic('upload')}<h2>결과지 파일을 올려 주세요</h2><p>PDF, 스캔 이미지, 사진을 올릴 수 있습니다. 시안에서는 예시 문서만 사용합니다.</p>
      <div class="acts"><button type="button" class="btn lg keep" data-act="pickFile"><span class="lbl">파일 선택</span></button><button type="button" class="btn pri lg keep" data-act="useSample" id="sampleBtn"><span class="lbl">예시 문서 사용</span></button></div></div>
    <div class="flow" aria-label="처리 순서"><b>읽기</b>${ic('next')}<b>항목 추출</b>${ic('next')}<b>원문 대조</b>${ic('next')}<b>이용자 확인</b>${ic('next')}<b>체크리스트·안내 연결</b><span>· 확인된 항목만 안내에 쓰입니다</span></div>
    <div class="box docs"><div class="box-h"><h3>올린 문서</h3><span class="sm mut">보관 기간 ${S.keepDays}일 뒤 자동 삭제(예시)</span></div><div id="docList">${row}</div></div>
  </div>`;
}

/* ---------- 이용자 2: 항목 확인 ---------- */
function vConfirm() {
  if (!S.doc) return `<div class="ph"><div><h1>추출 항목 확인</h1></div></div><div class="box">${empty('doc', '확인할 결과지가 없습니다. 먼저 결과지를 올려 주세요.', '결과지 올리기', 'go', 'upload')}</div>`;
  const d = S.doc, items = d.items;
  const selIt = items.find(i => i.id === S.sel);
  const hlLn = selIt ? selIt.ln : null;
  const need = items.filter(i => i.st === 'need').length;
  const rows = SRC.map(r => `<tr data-ln="${r.ln}" class="${hlLn === r.ln ? (selIt.st === 'need' ? 'hl hl-need' : 'hl') : ''}"><td class="n">${r.ln}</td><td>${r.cat}</td><td>${r.org}</td><td>${r.desc}</td><td>${r.amt}</td></tr>`).join('');
  const miss = selIt ? (selIt.ln ? `${ic('info', 's')}<span>선택한 항목: 원문 ${selIt.ln}번 줄</span>` : `${ic('alert', 's')}<span>선택한 항목은 원문에서 찾지 못했습니다.</span>`) : '<span class="mut">오른쪽 항목을 누르면 원문 위치가 강조됩니다.</span>';
  const li = items.map(i => {
    const [c, t] = ST_LB[i.st];
    const fix = (S.editing === i.id && !d.confirmed) ? `<div class="fix"><label>고친 값<input id="fixInput" data-bind="fix" value="${esc(i.value)}" inputmode="numeric"></label><button type="button" class="btn pri keep" data-act="saveFix" data-id="${i.id}"><span class="lbl">저장</span></button><button type="button" class="btn keep" data-act="cancelFix"><span class="lbl">취소</span></button></div>`
      : (i.st === 'need' && !d.confirmed ? `<div class="fix"><button type="button" class="btn keep" data-act="editItem" data-id="${i.id}">${ic('edit', 's')}<span class="lbl">고치기</span></button><button type="button" class="btn keep" data-act="delItem" data-id="${i.id}">${ic('trash', 's')}<span class="lbl">삭제</span></button></div>` : '');
    return `<li data-item="${i.id}" class="${S.sel === i.id ? 'sel' : ''}"><button type="button" class="item" data-act="selItem" data-id="${i.id}"><div class="grow"><div class="k">${i.cat}</div><div class="v">${esc(i.label)} · <span class="num">${esc(i.value)}</span></div>${i.st === 'need' ? `<div class="why">${i.why}</div>` : ''}</div><span class="lb ${c}">${i.st === 'need' ? ic('alert', 's') : ic('check', 's')}${t}</span></button>${fix}</li>`;
  }).join('');
  const foot = d.confirmed
    ? `<span class="lb lb-ok">${ic('check', 's')}확인 완료</span><span class="mut">확인한 ${items.length}개 항목이 체크리스트와 서비스 분야 안내에 반영됐습니다.</span><button type="button" class="btn" data-act="go" data-id="check">체크리스트 보기</button>`
    : `<button type="button" class="btn pri lg keep" id="confirmBtn" data-act="confirmDoc" ${need ? 'disabled' : ''}><span class="lbl">확인 완료하고 체크리스트 만들기</span></button><span class="mut" id="needMsg">${need ? `확인 필요 ${need}건을 고치거나 삭제하면 넘어갈 수 있습니다.` : '모든 항목을 확인했습니다.'}</span>`;
  return `<div class="ph"><div><h1>추출 항목 확인</h1><p>원문과 나란히 보고, 맞는지 확인해 주세요. 확인한 항목만 안내에 쓰입니다.</p></div></div>
  <div class="note" style="margin-bottom:16px">${ic('info')}<span>이 화면의 판독 결과는 실제 OCR·AI 호출이 아니라 예시 데이터로 재현한 것입니다. 원문에서 찾지 못한 값은 '확인 필요'로 표시합니다.</span></div>
  <div class="cf">
    <section class="src" aria-label="원문"><div class="paper"><span class="stamp">예시 문서</span><h3>재산 조회 결과 통지</h3><div class="meta">대상자 김○○ · 신청인 김○○(자녀) · 통지일 2026-11-20</div>
      <div class="tscroll"><table class="ptab" id="srcTab"><thead><tr><th>번호</th><th>구분</th><th>기관</th><th>내용</th><th>금액·비고</th></tr></thead><tbody>${rows}</tbody></table></div>
      <div class="miss" id="srcMsg">${miss}</div></div></section>
    <section aria-label="추출 항목"><div class="sm mut" style="margin-bottom:8px">추출 항목 ${items.length}개 · 원문 확인됨 ${items.filter(i => i.st === 'ok').length} · 확인 필요 <b id="needCnt">${need}</b></div>
      <ul class="items" id="items">${li}</ul>
      <div class="cf-foot">${foot}</div></section>
  </div>`;
}

/* ---------- 이용자 3: 체크리스트 ---------- */
function vCheck() {
  const T = tasks();
  const dc = docCats();
  const assets = ['예금', '부동산', '자동차', '보험', '채무'];
  const sel = (k, opts) => `<select data-bind="sit" data-k="${k}">${opts.map(o => `<option ${S.sit[k] === o ? 'selected' : ''}>${o}</option>`).join('')}</select>`;
  const chips = assets.map(a => dc.has(a) ? `<label class="chip fromdoc" title="결과지에서 확인됨"><input type="checkbox" checked disabled>${a}</label>` : `<label class="chip"><input type="checkbox" data-bind="asset" value="${a}" ${S.sit.assets.includes(a) ? 'checked' : ''}>${a}</label>`).join('');
  const docLine = S.doc && S.doc.confirmed
    ? `<div class="note">${ic('shield')}<span>결과지에서 확인된 재산(${[...dc].join(', ')})이 아래 업무에 반영됐습니다. 색이 있는 재산 칸은 결과지에서 온 값입니다.</span></div>`
    : `<div class="note warn">${ic('info')}<span>결과지를 확인하면 재산 항목이 자동으로 반영됩니다. 지금은 상황 입력만으로 만든 목록입니다.</span><button type="button" class="btn keep" data-act="go" data-id="${S.doc ? 'confirm' : 'upload'}" style="margin-left:auto"><span class="lbl">${S.doc ? '항목 확인하기' : '결과지 올리기'}</span></button></div>`;
  const list = T.filter(t => S.tf === 'all' || (S.tf === 'done' ? t.st === '완료' : t.st !== '완료'));
  const soon = T.filter(t => t.st !== '완료' && t.left <= 7).length;
  const rows = list.length ? list.map(t => `<li class="task ${t.st === '완료' ? 'done' : ''}" data-task="${t.id}">
      <div class="tmain"><div class="tn">${esc(t.name)}</div>${t.doc ? `<span class="tag">${ic('doc', 's')}결과지에서 확인됨</span>` : `<span class="sm mut">${COND[t.cond]}</span>`}</div>
      <div class="dd ${t.left <= 7 && t.st !== '완료' ? 'soon' : ''}" data-left="${t.left}">${t.left >= 0 ? `${t.left}일 남음` : `기한 ${-t.left}일 지남`}<small>${fmt(t.due)}까지(예시)</small></div>
      <select class="stsel" data-bind="tst" data-id="${t.id}" aria-label="${esc(t.name)} 상태">${['시작 전', '진행 중', '완료'].map(o => `<option ${t.st === o ? 'selected' : ''}>${o}</option>`).join('')}</select>
      <div class="where">${ic('info', 's')} ${esc(t.where)}</div>
      <div class="acts">${t.st !== '완료' ? `<button type="button" class="btn ic-only" data-act="doneTask" data-id="${t.id}" data-tip="완료 처리" aria-label="${esc(t.name)} 완료 처리">${ic('check')}</button>` : ''}<button type="button" class="btn ic-only ${S.alerts[t.id] ? 'on' : ''}" data-act="alertTask" data-id="${t.id}" aria-pressed="${!!S.alerts[t.id]}" data-tip="${S.alerts[t.id] ? '기한 알림 끄기' : '기한 알림 켜기'}" aria-label="${esc(t.name)} 기한 알림">${ic('bell')}</button></div>
    </li>`).join('')
    : `<li>${S.tf === 'done' ? empty('check', '아직 완료한 업무가 없습니다. 기한이 가까운 일부터 하나씩 처리해 보세요.', '진행할 일 보기', 'tf', 'todo') : empty('check', '진행할 업무가 모두 끝났습니다.', '완료한 일 보기', 'tf', 'done')}</li>`;
  return `<div class="ph"><div><h1>내 체크리스트</h1><p>상황과 확인된 결과지 항목으로 만든 해야 할 일입니다. 기한이 가까운 순서로 보여 드립니다.</p></div></div>
  <div class="stack">
    <div class="box"><div class="box-h"><h3>내 상황</h3><span class="sm mut">바꾸면 목록이 다시 만들어집니다</span></div><div class="box-b"><div class="sit">
      <label class="fld"><span>고인과의 관계</span>${sel('rel', ['배우자', '자녀', '부모', '형제자매'])}</label>
      <div class="fld assets"><span>재산 종류</span><div class="chips">${chips}</div></div>
      <label class="fld"><span>고인의 거주 형태</span>${sel('live', ['가족과 함께 거주', '혼자 거주'])}</label>
      <label class="fld"><span>고인의 사업자 여부</span>${sel('biz', ['아니오', '예'])}</label>
    </div></div></div>
    ${docLine}
    <div class="sum" id="tsum"><span>해야 할 일<b>${T.filter(t => t.st !== '완료').length}</b></span><span>7일 안 기한<b>${soon}</b></span><span>완료<b>${T.filter(t => t.st === '완료').length}</b></span><span class="sm">사망일 ${fmt(DEATH)}(예시) 기준 · 기한은 예시입니다</span></div>
    <div><div class="tabs" role="tablist">${[['todo', '진행할 일'], ['done', '완료'], ['all', '전체']].map(([k, t]) => `<button type="button" role="tab" data-act="tf" data-id="${k}" aria-selected="${S.tf === k}">${t}</button>`).join('')}</div>
    <div class="task thead" aria-hidden="true"><span>업무</span><span>기한</span><span>상태</span><span>어디서</span><span></span></div>
    <ul class="tasks" id="tasks">${rows}</ul></div>
  </div>`;
}

/* ---------- 이용자 4: 서비스 분야 ---------- */
function vFields() {
  const L = FIELDS.map(f => ({ f, i: fieldInfo(f) }));
  const on = L.filter(x => x.i.need), off = L.filter(x => !x.i.need);
  const row = ({ f, i }) => `<li class="${i.need ? '' : 'off'}" data-field="${f.id}"><div><h3>${f.name}</h3><p class="desc">${f.desc}</p><p class="why">${ic(i.doc ? 'doc' : 'info', 's')}<span>${esc(i.why)}</span></p></div>
    ${i.need ? `<button type="button" class="btn" data-act="seePartners" data-id="${f.id}">전문 파트너 ${PARTNERS.filter(p => p.field === f.id).length}곳 보기</button>` : ''}</li>`;
  return `<div class="ph"><div><h1>서비스 분야 안내</h1><p>지금 상황에 필요할 수 있는 분야와, 왜 안내하는지를 함께 보여 드립니다.</p></div></div>
  <div class="stack">
    ${on.length ? `<ul class="fields" id="fieldsOn">${on.map(row).join('')}</ul>` : `<div class="box">${empty('grid', '아직 안내할 분야가 없습니다. 결과지를 확인하거나 상황을 입력해 주세요.', '체크리스트로 가기', 'go', 'check')}</div>`}
    ${off.length ? `<div><h3 class="mut" style="margin:8px 0">지금 상황에서는 안내하지 않는 분야</h3><ul class="fields" id="fieldsOff">${off.map(row).join('')}</ul></div>` : ''}
    <div class="note">${ic('info')}<span>안내는 예시이며 법률·세무 판단이 아닙니다. 필요한지는 전문 파트너와 상담해 정하세요.</span></div>
  </div>`;
}

/* ---------- 이용자 5: 전문 파트너 ---------- */
function vPartners() {
  const mob = window.innerWidth <= 760;
  const field = S.pField || (FIELDS.find(f => fieldInfo(f).need) || FIELDS[0]).id;
  S.pField = field;
  const ps = PARTNERS.filter(p => p.field === field);
  const tabs = `<div class="tabs" role="tablist">${FIELDS.map(f => `<button type="button" role="tab" data-act="pField" data-id="${f.id}" aria-selected="${field === f.id}">${f.name}</button>`).join('')}</div>`;
  const list = `<ul class="plist" id="plist">${ps.map(p => `<li class="${S.pSel === p.id ? 'sel' : ''}"><button type="button" data-act="pSel" data-id="${p.id}"><div class="grow"><b>${p.name}</b><div class="k">${p.area} · ${p.how}</div></div>${ic('next')}</button></li>`).join('')}</ul>`;
  const p = PARTNERS.find(x => x.id === S.pSel);
  let det = '';
  if (p) {
    const existing = S.apps.find(a => a.mine && a.pid === p.id);
    if (S.applying) {
      const dd = S.draftDisc;
      det = `<div class="box" id="applyForm"><div class="box-h"><h2>상담 신청 · ${p.name}</h2></div><div class="box-b stack">
        <p>이 파트너에게 공개할 항목을 고르세요. 기본은 상담에 꼭 필요한 최소 항목이며, 결과지 원본은 기본 비공개입니다.</p>
        <ul class="consent">${DISC.map(d => { const av = discAvail(d.k); return `<li class="${av ? '' : 'dis'}"><label><input type="checkbox" data-bind="disc" value="${d.k}" ${dd[d.k] ? 'checked' : ''} ${av ? '' : 'disabled'}><div class="grow"><b>${d.label}</b><div class="v">${av ? esc(discVal({}, d.k) || '-') : '결과지에서 확인된 값이 없습니다'}</div>${d.k === 'orig' ? '<div class="lk">기본 비공개 · 공개하면 10분 동안만 열리는 주소로 전달(예시)</div>' : ''}</div></label></li>`; }).join('')}</ul>
        <div class="sm mut" id="discCnt">공개할 항목 ${Object.values(dd).filter(Boolean).length}개 · 신청 뒤에도 '내 신청 현황'에서 공개를 철회할 수 있습니다.</div>
        <div class="cf-foot"><button type="button" class="btn pri lg keep" data-act="submitApply" id="applyBtn"><span class="lbl">상담 신청</span></button><button type="button" class="btn keep" data-act="cancelApply"><span class="lbl">취소</span></button></div>
      </div></div>`;
    } else {
      det = `<div class="box" id="pDetail"><div class="box-h"><h2>${p.name}</h2><span class="lb lb-gray">가상 파트너</span></div><div class="box-b stack">
        <dl class="dl"><dt>분야</dt><dd>${fname(p.field)}</dd><dt>지역</dt><dd>${p.area}</dd><dt>상담 방식</dt><dd>${p.how}</dd><dt>처리 범위</dt><dd>${p.scope}</dd><dt>답변</dt><dd>${p.resp}</dd></dl>
        ${existing ? `<div class="note">${ic('info')}<span>이미 상담을 신청했습니다(${existing.id}, ${existing.status}).</span><button type="button" class="btn keep" data-act="go" data-id="mine" style="margin-left:auto"><span class="lbl">신청 현황</span></button></div>`
          : `<button type="button" class="btn pri lg keep" data-act="startApply" data-id="${p.id}"><span class="lbl">상담 신청하기</span></button>`}
      </div></div>`;
    }
  }
  const head = `<div class="ph"><div><h1>전문 파트너</h1><p>분야별 파트너를 보고 상담을 신청합니다. 파트너는 내가 공개에 동의한 항목만 봅니다.</p></div></div>`;
  if (mob && p) return head + `<button type="button" class="btn back keep" data-act="pBack">${ic('back', 's')}<span class="lbl">목록으로</span></button>` + det;
  return head + `<div class="stack">${tabs}<div class="two"><div>${list}</div><div>${p ? det : (mob ? '' : `<div class="box">${empty('users', '왼쪽 목록에서 파트너를 고르면 상세와 상담 신청이 보입니다.', '첫 파트너 보기', 'pSel', ps[0].id)}</div>`)}</div></div></div>`;
}

/* ---------- 이용자 6: 내 신청 현황 ---------- */
function vMine() {
  const mine = S.apps.filter(a => a.mine);
  const head = `<div class="ph"><div><h1>내 신청 현황</h1><p>신청한 상담과 파트너에게 공개한 항목입니다. 공개를 철회하면 파트너 화면에서 바로 가려집니다.</p></div></div>`;
  if (!mine.length) return head + `<div class="box">${empty('send', '아직 신청한 상담이 없습니다.', '전문 파트너 보기', 'go', 'partners')}</div>`;
  return head + mine.map(a => {
    const rows = DISC.filter(d => a.disc[d.k]).map(d => {
      const rv = a.revoked[d.k];
      return `<tr data-k="${d.k}"><td data-h="항목">${d.label}</td><td data-h="상태">${rv ? `<span class="lb lb-gray">철회함 ${rv.slice(6)}</span>` : '<span class="lb lb-mid">공개 중</span>'}</td><td class="r">${rv ? '' : `<button type="button" class="btn keep" data-act="revoke" data-id="${a.id}|${d.k}">${ic('undo', 's')}<span class="lbl">공개 철회</span></button>`}</td></tr>`;
    }).join('');
    const hidden = DISC.filter(d => !a.disc[d.k]).map(d => d.label).join(', ');
    return `<div class="box app" data-app="${a.id}"><div class="box-h"><div><h2>${pname(a.pid)}</h2><div class="sm mut">${a.id} · ${fname(a.field)} · ${a.at} 신청</div></div><span class="lb ${a.status === '완료' ? 'lb-ok' : 'lb-mid'}">${a.status}</span></div>
      <div class="box-b stack"><div class="tscroll"><table class="dtab stackm"><thead><tr><th>공개한 항목</th><th>상태</th><th></th></tr></thead><tbody>${rows || '<tr><td colspan="3">공개한 항목이 없습니다.</td></tr>'}</tbody></table></div>
      <p class="sm mut">${ic('lock', 's')} 비공개: ${hidden || '없음'}</p></div></div>`;
  }).join('');
}

/* ---------- 전문 파트너 ---------- */
function vPartnerApps() {
  const mob = window.innerWidth <= 760;
  const all = S.apps.filter(a => a.pid === S.partnerAcc);
  const list = all.filter(a => S.pf === '전체' || a.status === S.pf);
  const cnt = s => all.filter(a => s === '전체' || a.status === s).length;
  const tabs = `<div class="tabs" role="tablist">${['전체', '신규', '상담 중', '완료'].map(s => `<button type="button" role="tab" data-act="pf" data-id="${s}" aria-selected="${S.pf === s}">${s} ${cnt(s)}</button>`).join('')}</div>`;
  const tb = list.length ? `<div class="tscroll"><table class="dtab stackm" id="pApps"><thead><tr><th>번호</th><th>신청인</th><th>분야</th><th>신청 일시</th><th>상태</th></tr></thead><tbody>${list.map(a => `<tr class="click ${S.papp === a.id ? 'sel' : ''}" data-act="openApp" data-id="${a.id}" tabindex="0"><td data-h="번호">${a.id}</td><td data-h="신청인">${a.who}</td><td data-h="분야">${fname(a.field)}</td><td data-h="신청 일시">${a.at}</td><td data-h="상태"><span class="lb ${a.status === '신규' ? 'lb-need' : a.status === '완료' ? 'lb-ok' : 'lb-mid'}">${a.status}</span></td></tr>`).join('')}</tbody></table></div>`
    : empty('list', `${S.pf} 상태의 신청이 없습니다.`, '전체 보기', 'pf', '전체');
  const a = S.apps.find(x => x.id === S.papp && x.pid === S.partnerAcc);
  let det = '';
  if (a) {
    const rows = DISC.map(d => {
      let v;
      if (visible(a, d.k)) v = d.k === 'orig' ? `<button type="button" class="btn keep" data-act="origView" data-id="${a.id}">${ic('doc', 's')}<span class="lbl">원본 열람(10분 유효, 예시)</span></button>` : esc(discVal(a, d.k));
      else v = `<span class="hidden-v">${ic('lock', 's')}비공개${a.revoked[d.k] ? ` · 이용자가 ${a.revoked[d.k].slice(6)}에 공개 철회` : ''}</span>`;
      return `<dt>${d.label}</dt><dd data-k="${d.k}" class="${visible(a, d.k) ? 'shown' : 'masked'}">${v}</dd>`;
    }).join('');
    const btn = a.status === '신규' ? `<button type="button" class="btn pri keep" data-act="pStatus" data-id="${a.id}|상담 중"><span class="lbl">상담 시작</span></button>` : a.status === '상담 중' ? `<button type="button" class="btn pri keep" data-act="pStatus" data-id="${a.id}|완료"><span class="lbl">상담 완료 처리</span></button>` : '';
    det = `<div class="box" id="appDetail"><div class="box-h"><div><h2>${a.who} 님 신청 · ${a.id}</h2><div class="sm mut">${fname(a.field)} · ${a.at}</div></div><span class="lb lb-mid">${a.status}</span></div>
      <div class="box-b stack"><div class="note">${ic('shield')}<span>이용자가 공개에 동의한 항목만 보입니다. 나머지는 서버에서 내보내지 않습니다(시안에서는 예시로 재현).</span></div>
      <dl class="dl" id="appFields">${rows}</dl><div class="cf-foot">${btn}</div></div></div>`;
  }
  const head = `<div class="ph"><div><h1>상담·신청 현황</h1><p>${pname(S.partnerAcc)} 계정으로 보는 화면입니다(예시).</p></div></div>`;
  if (mob && a) return head + `<button type="button" class="btn back keep" data-act="pAppBack">${ic('back', 's')}<span class="lbl">목록으로</span></button>` + det;
  return head + `<div class="stack">${tabs}${tb}${a ? det : (mob ? '' : `<div class="box">${empty('eye', '목록에서 신청을 누르면 이용자가 공개한 항목이 보입니다.', '첫 신청 보기', 'openApp', (list[0] || all[0] || {}).id || '')}</div>`)}</div>`;
}

/* ---------- 관리자 ---------- */
function vOps() {
  const c = s => S.apps.filter(a => a.status === s).length;
  const waiting = S.doc && !S.doc.confirmed ? 1 : 0;
  return `<div class="ph"><div><h1>운영 현황</h1><p>이용자·파트너·상담 현황입니다. 수치는 예시입니다.</p></div></div>
  <div class="stack"><div class="stats" id="stats">
    <div class="stat" data-k="users"><span>이용자</span><b>128</b></div><div class="stat" data-k="partners"><span>전문 파트너</span><b>24</b></div>
    <div class="stat" data-k="new"><span>상담 신규</span><b>${c('신규')}</b></div><div class="stat" data-k="ing"><span>상담 중</span><b>${c('상담 중')}</b></div><div class="stat" data-k="done"><span>상담 완료</span><b>${c('완료')}</b></div>
  </div>
  <div class="note">${ic('info')}<span>결과지 확인 대기 ${3 + waiting}건 · 이번 주 자동 삭제 예정 ${keepRows().filter(r => r.left <= 7).length}건</span></div>
  <div class="box"><div class="box-h"><h3>최근 상담 신청</h3></div><div class="tscroll"><table class="dtab stackm" id="opsTab"><thead><tr><th>번호</th><th>신청인</th><th>파트너</th><th>분야</th><th>공개 항목</th><th>상태</th></tr></thead><tbody>
    ${[...S.apps].sort((a, b) => b.at.localeCompare(a.at)).map(a => `<tr><td data-h="번호">${a.id}</td><td data-h="신청인">${a.who}</td><td data-h="파트너">${pname(a.pid)}</td><td data-h="분야">${fname(a.field)}</td><td data-h="공개 항목" class="num">${DISC.filter(d => visible(a, d.k)).length}개</td><td data-h="상태">${a.status}</td></tr>`).join('')}
  </tbody></table></div></div></div>`;
}
function vRules() {
  const R = S.rdraft || (S.rdraft = S.rules.map(r => ({ ...r })));
  const dirty = JSON.stringify(R) !== JSON.stringify(S.rules);
  return `<div class="ph"><div><h1>체크리스트 기준 데이터</h1><p>업무, 기한 규칙, 적용 조건을 고칩니다.</p></div><button type="button" class="btn pri keep" data-act="saveRules" id="saveRules" ${dirty ? '' : 'disabled'}><span class="lbl">저장하고 반영</span></button></div>
  <div class="stack"><div class="note" id="noDev">${ic('info')}<span>여기서 고친 업무·기한·적용 조건은 개발 없이 이용자 체크리스트에 바로 반영됩니다. 기한 값은 예시입니다.</span></div>
  <div class="tscroll"><table class="dtab rtab" id="rulesTab"><thead><tr><th>사용</th><th>업무</th><th>기한 규칙</th><th>적용 조건</th><th>어디서</th></tr></thead><tbody>
  ${R.map(r => `<tr data-rule="${r.id}"><td><input type="checkbox" data-bind="rule" data-id="${r.id}" data-k="on" ${r.on ? 'checked' : ''} aria-label="${esc(r.name)} 사용" style="width:20px;min-height:20px"></td>
    <td><input data-bind="rule" data-id="${r.id}" data-k="name" value="${esc(r.name)}" aria-label="업무명"></td>
    <td><span class="inline">사망일부터 <input class="days num" type="number" min="1" data-bind="rule" data-id="${r.id}" data-k="days" value="${r.days}" aria-label="${esc(r.name)} 기한 일수">일</span></td>
    <td><select data-bind="rule" data-id="${r.id}" data-k="cond" aria-label="적용 조건">${Object.entries(COND).map(([k, v]) => `<option value="${k}" ${r.cond === k ? 'selected' : ''}>${v}</option>`).join('')}</select></td>
    <td><input data-bind="rule" data-id="${r.id}" data-k="where" value="${esc(r.where)}" aria-label="어디서"></td></tr>`).join('')}
  </tbody></table></div></div>`;
}
function vLogs() {
  const F = { '전체': () => true, '관리자 열람': l => l.role === '관리자', '파트너 열람': l => l.role === '전문 파트너', '이용자': l => l.role === '이용자' };
  const L = S.logs.filter(F[S.lf]);
  return `<div class="ph"><div><h1>문서 열람 기록</h1><p>문서와 추출 항목을 누가 언제 봤는지 남깁니다. 관리자 열람도 같은 기록에 남습니다.</p></div></div>
  <div class="stack"><div class="tabs" role="tablist">${Object.keys(F).map(k => `<button type="button" role="tab" data-act="lf" data-id="${k}" aria-selected="${S.lf === k}">${k}</button>`).join('')}</div>
  ${L.length ? `<div class="tscroll"><table class="dtab stackm" id="logTab"><thead><tr><th>일시</th><th>누가</th><th>역할</th><th>대상 문서·항목</th><th>내용</th></tr></thead><tbody>
  ${L.map(l => `<tr><td data-h="일시" class="num">${l.t}</td><td data-h="누가">${esc(l.who)}</td><td data-h="역할">${l.role}</td><td data-h="대상">${esc(l.target)}<div class="sm mut">${esc(l.items)}</div></td><td data-h="내용"><span class="lb ${l.role === '관리자' ? 'lb-need' : l.kind === '공개 철회' ? 'lb-gray' : 'lb-mid'}">${l.kind}</span>${l.note ? `<div class="sm mut">사유: ${esc(l.note)}</div>` : ''}</td></tr>`).join('')}
  </tbody></table></div>` : empty('eye', `${S.lf} 기록이 없습니다.`, '전체 기록 보기', 'lf', '전체')}</div>`;
}
function keepRows() {
  const rows = S.keep.map(k => ({ ...k }));
  if (S.doc) rows.push({ who: '김○○', name: '재산 조회 결과지', up: TODAY, mine: true });
  return rows.map(r => { const del = addDays(r.up, S.keepDays); return { ...r, del, left: Math.round((del - TODAY) / 86400000) }; }).filter(r => r.left >= 0).sort((a, b) => a.left - b.left);
}
function vKeep() {
  const R = keepRows();
  return `<div class="ph"><div><h1>보관·자동 삭제</h1><p>원본은 암호화 보관하고, 보관 기간이 지나면 자동 삭제합니다(예시).</p></div>
    <label class="fld" style="min-width:180px"><span>보관 기간</span><select data-bind="keepDays">${[30, 90, 180].map(d => `<option value="${d}" ${S.keepDays === d ? 'selected' : ''}>업로드 후 ${d}일</option>`).join('')}</select></label></div>
  ${R.length ? `<div class="tscroll"><table class="dtab stackm" id="keepTab"><thead><tr><th>이용자</th><th>문서</th><th>업로드일</th><th>삭제 예정일</th><th>남은 기간</th><th></th></tr></thead><tbody>
  ${R.map(r => `<tr><td data-h="이용자">${r.who}</td><td data-h="문서">${r.name}</td><td data-h="업로드일" class="num">${fmt(r.up)}</td><td data-h="삭제 예정일" class="num">${fmt(r.del)}</td><td data-h="남은 기간">${r.left <= 7 ? `<span class="lb lb-need">${r.left}일 · 자동 삭제 예정</span>` : `${r.left}일`}</td>
    <td class="r"><button type="button" class="btn keep" data-act="adminView" data-id="${r.who}">${ic('eye', 's')}<span class="lbl">관리자 열람</span></button></td></tr>`).join('')}
  </tbody></table></div>` : `<div class="box">${empty('folder', '보관 중인 문서가 없습니다.', '보관 기간 90일로', 'keep90')}</div>`}
  <div class="note">${ic('shield')}<span>관리자가 원본을 열면 사유와 함께 열람 기록에 남습니다.</span></div>`;
}

/* ---------- 시연 안내 ---------- */
const GUIDE = [
  ['예시 결과지 올리기', 'user', 'upload'], ["'확인 필요' 항목 고치기", 'user', 'confirm'], ['체크리스트 생성 확인', 'user', 'check'],
  ['서비스 분야 안내의 근거', 'user', 'fields'], ['상담 신청에서 공개 항목 고르기', 'user', 'partners'],
  ['파트너 화면: 동의한 항목만 보이는지', 'partner', 'apps'], ['이용자로 돌아가 공개 철회', 'user', 'mine'], ['관리자 열람 기록', 'admin', 'logs']
];
function guideHTML() {
  const cur = S.role === 'user' ? S.view : S.role === 'partner' ? S.pv : S.av;
  return `<div class="gh"><b>${ic('book', 's')}시연 안내</b><button type="button" class="btn ghost keep" data-act="guide" aria-expanded="${S.guideOpen}"><span class="lbl">${S.guideOpen ? '접기' : '펼치기'}</span></button></div>
  <ol>${GUIDE.map(([t, r, v], i) => `<li class="${r === S.role && v === cur ? 'cur' : ''}"><button type="button" data-act="gstep" data-id="${i}"><span class="gn">${i + 1}.</span><span>${t}</span></button></li>`).join('')}</ol>
  <div class="gf">순서대로 누르면 해당 화면으로 이동합니다.</div>`;
}

/* ---------- 렌더 ---------- */
function render() {
  document.querySelectorAll('.roles button').forEach(b => b.setAttribute('aria-pressed', b.dataset.id === S.role));
  $('#nav').innerHTML = navHTML();
  const V = S.role === 'user' ? { upload: vUpload, confirm: vConfirm, check: vCheck, fields: vFields, partners: vPartners, mine: vMine }[S.view]
    : S.role === 'partner' ? vPartnerApps : { ops: vOps, rules: vRules, logs: vLogs, keep: vKeep }[S.av];
  $('#main').innerHTML = V();
  const g = $('#guide'); g.innerHTML = guideHTML(); g.classList.toggle('min', !S.guideOpen);
  document.body.classList.toggle('guide-open', S.guideOpen);
}
function go(id) { if (S.role === 'user') S.view = id; else if (S.role === 'partner') S.pv = id; else S.av = id; S.sel = null; S.editing = null; window.scrollTo(0, 0); }
function openPartnerApp(id) {
  const a = S.apps.find(x => x.id === id); if (!a) return;
  S.papp = id;
  log({ who: pname(a.pid), role: '전문 파트너', target: `${a.who} 신청 건`, items: DISC.filter(d => visible(a, d.k)).map(d => d.label).join(', ') || '공개 항목 없음', kind: '파트너 열람' });
}

const ACT = {
  role(id) { run('화면 바꾸는 중...', () => { S.role = id; if (id === 'partner') S.papp = null; window.scrollTo(0, 0); }, 320); },
  go(id) { run('화면 여는 중...', () => go(id), 300); },
  guide() { S.guideOpen = !S.guideOpen; render(); },
  gstep(i) { const [, r, v] = GUIDE[+i]; run('화면 여는 중...', () => { S.role = r; go(v); if (r === 'partner') S.papp = null; if (window.innerWidth <= 760) S.guideOpen = false; }, 320); },
  pickFile() { toast('시안에서는 예시 문서만 사용할 수 있습니다'); },
  useSample() {
    run('문서 읽는 중...', () => {
      S.doc = { name: '재산조회_결과_예시.pdf', up: stamp(), confirmed: false, items: EXTRACT() };
      log({ who: '김○○', role: '이용자', target: '김○○ 결과지 원본', items: '원본 문서', kind: '업로드' });
      S.view = 'confirm'; S.sel = 'i7'; window.scrollTo(0, 0);
      return '문서를 읽었습니다. 확인 필요 2건이 있습니다';
    }, 580);
  },
  selItem(id) {
    S.sel = id; render();
    const it = S.doc.items.find(i => i.id === id);
    if (window.innerWidth <= 900) { const r = it.ln ? document.querySelector(`#srcTab tr[data-ln="${it.ln}"]`) : $('#srcMsg'); r && r.scrollIntoView({ block: 'center' }); }
  },
  editItem(id) { S.sel = id; S.editing = id; render(); const f = $('#fixInput'); f && f.focus(); },
  cancelFix() { S.editing = null; render(); },
  saveFix(id) {
    const val = $('#fixInput').value.trim();
    if (!val) { $('#fixInput').setAttribute('aria-invalid', 'true'); return; }
    run('원문과 다시 대조하는 중...', () => {
      const it = S.doc.items.find(i => i.id === id);
      it.value = val; S.editing = null;
      const hit = SRC.some(r => (r.amt + ' ' + r.desc).includes(val.replace(/원$/, '')));
      it.st = hit ? 'ok' : 'edited';
      if (hit) { const r = SRC.find(r => (r.amt + ' ' + r.desc).includes(val.replace(/원$/, ''))); it.ln = r.ln; }
      return hit ? '원문에서 값을 찾았습니다. 원문 확인됨으로 바꿨습니다' : '고친 값을 저장했습니다(이용자 수정)';
    });
  },
  delItem(id) { run('항목 삭제하는 중...', () => { S.doc.items = S.doc.items.filter(i => i.id !== id); if (S.sel === id) S.sel = null; return '항목을 삭제했습니다'; }); },
  confirmDoc() {
    run('체크리스트 만드는 중...', () => {
      S.doc.confirmed = true; S.view = 'check'; S.tf = 'todo'; window.scrollTo(0, 0);
      log({ who: '김○○', role: '이용자', target: '김○○ 결과지 추출 항목', items: `${S.doc.items.length}개 항목`, kind: '확인 완료' });
      return `확인한 항목으로 체크리스트를 만들었습니다(${tasks().length}건)`;
    }, 550);
  },
  tf(id) { run('목록 정리하는 중...', () => { S.tf = id; }, 300); },
  doneTask(id) { run('완료 처리하는 중...', () => { S.tstat[id] = '완료'; return '완료로 바꿨습니다'; }, 350); },
  alertTask(id) {
    run('알림 설정하는 중...', () => { S.alerts[id] = !S.alerts[id]; return S.alerts[id] ? '기한 3일 전에 알림을 보냅니다(예시)' : '기한 알림을 껐습니다'; }, 350);
  },
  seePartners(id) { run('파트너 목록 여는 중...', () => { S.view = 'partners'; S.pField = id; S.pSel = null; S.applying = false; window.scrollTo(0, 0); }, 350); },
  pField(id) { run('파트너 목록 여는 중...', () => { S.pField = id; S.pSel = null; S.applying = false; }, 300); },
  pSel(id) { run('파트너 정보 여는 중...', () => { S.pSel = id; S.applying = false; window.scrollTo(0, 0); }, 300); },
  pBack() { S.pSel = null; S.applying = false; render(); },
  startApply(id) {
    const p = PARTNERS.find(x => x.id === id); S.applying = true; S.draftDisc = {};
    DEF_DISC[p.field].forEach(k => { if (discAvail(k)) S.draftDisc[k] = true; });
    render();
  },
  cancelApply() { S.applying = false; render(); },
  submitApply() {
    run('상담 신청 중...', () => {
      const p = PARTNERS.find(x => x.id === S.pSel);
      const disc = {}; Object.entries(S.draftDisc).forEach(([k, v]) => { if (v) disc[k] = 1; });
      const a = { id: `A-${S.seq++}`, pid: p.id, who: '김○○', field: p.field, status: '신규', at: stamp(), disc, revoked: {}, mine: true };
      S.apps.push(a); S.partnerAcc = p.id; S.applying = false; S.view = 'mine'; window.scrollTo(0, 0);
      log({ who: '김○○', role: '이용자', target: `상담 신청 ${a.id}`, items: DISC.filter(d => disc[d.k]).map(d => d.label).join(', '), kind: '공개 동의' });
      return `${p.name}에 상담을 신청했습니다`;
    }, 560);
  },
  revoke(v) {
    const [id, k] = v.split('|');
    run('공개 철회하는 중...', () => {
      const a = S.apps.find(x => x.id === id); a.revoked[k] = stamp();
      const lb = DISC.find(d => d.k === k).label;
      log({ who: '김○○', role: '이용자', target: `상담 신청 ${id}`, items: lb, kind: '공개 철회' });
      return `${lb} 공개를 철회했습니다. 파트너 화면에서 바로 가려집니다`;
    });
  },
  pf(id) { run('목록 정리하는 중...', () => { S.pf = id; }, 300); },
  openApp(id) { if (!id) return; run('신청 내용 여는 중...', () => { openPartnerApp(id); window.scrollTo(0, 0); }, 350); },
  pAppBack() { S.papp = null; render(); },
  pStatus(v) { const [id, st] = v.split('|'); run('상태 바꾸는 중...', () => { S.apps.find(a => a.id === id).status = st; return `상태를 '${st}'(으)로 바꿨습니다`; }, 400); },
  origView(id) {
    run('열람 주소 만드는 중...', () => {
      const a = S.apps.find(x => x.id === id);
      log({ who: pname(a.pid), role: '전문 파트너', target: `${a.who} 결과지 원본`, items: '원본 문서', kind: '원본 열람' });
      return '원본 열람 주소를 10분 동안 열었습니다(예시)';
    });
  },
  saveRules() {
    run('기준 데이터 저장 중...', () => {
      S.rules = S.rdraft.map(r => ({ ...r, days: Math.max(1, parseInt(r.days, 10) || 1) })); S.rdraft = null;
      return '저장했습니다. 이용자 체크리스트에 바로 반영됩니다';
    }, 500);
  },
  lf(id) { run('기록 정리하는 중...', () => { S.lf = id; }, 300); },
  keep90() { run('보관 기간 바꾸는 중...', () => { S.keepDays = 90; }); },
  adminView(who) {
    run('관리자 열람 기록 남기는 중...', () => {
      log({ who: '운영자 한○○', role: '관리자', target: `${who} 결과지 원본`, items: '원본 문서', kind: '관리자 열람', note: '보관 기간 확인' });
      return '열람 기록에 남겼습니다';
    });
  }
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  if (el.disabled) return;
  const f = ACT[el.dataset.act]; if (f) f(el.dataset.id);
});
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.matches('tr[data-act]')) ACT[e.target.dataset.act](e.target.dataset.id);
  if (e.key === 'Enter' && e.target.id === 'fixInput') ACT.saveFix(S.editing);
});
document.addEventListener('change', e => {
  const el = e.target, b = el.dataset.bind; if (!b) return;
  if (b === 'sit') run('체크리스트 다시 만드는 중...', () => { S.sit[el.dataset.k] = el.value; return '상황에 맞게 목록을 다시 만들었습니다'; });
  else if (b === 'asset') run('체크리스트 다시 만드는 중...', () => { const a = S.sit.assets; el.checked ? a.push(el.value) : a.splice(a.indexOf(el.value), 1); return '상황에 맞게 목록을 다시 만들었습니다'; });
  else if (b === 'tst') run('상태 바꾸는 중...', () => { S.tstat[el.dataset.id] = el.value; return `상태를 '${el.value}'(으)로 바꿨습니다`; }, 350);
  else if (b === 'disc') { S.draftDisc[el.value] = el.checked; $('#discCnt').firstChild.textContent = `공개할 항목 ${Object.values(S.draftDisc).filter(Boolean).length}개 · 신청 뒤에도 '내 신청 현황'에서 공개를 철회할 수 있습니다.`; }
  else if (b === 'rule') { const r = S.rdraft.find(x => x.id === el.dataset.id); r[el.dataset.k] = el.type === 'checkbox' ? el.checked : el.dataset.k === 'days' ? parseInt(el.value, 10) || 1 : el.value; $('#saveRules').disabled = JSON.stringify(S.rdraft) === JSON.stringify(S.rules); }
  else if (b === 'keepDays') run('보관 기간 바꾸는 중...', () => { S.keepDays = +el.value; return `보관 기간을 ${el.value}일로 바꿨습니다(예시)`; });
});
let lastW = window.innerWidth;
window.addEventListener('resize', () => { const w = window.innerWidth; if ((lastW <= 760) !== (w <= 760)) render(); lastW = w; });
render();
