(function () {
'use strict';

/* ===================== helpers ===================== */
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const ic = (n) => '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-' + n + '"/></svg>';
const pad = (n) => String(n).padStart(2, '0');
const hm = (m) => pad(Math.floor(m / 60)) + ':' + pad(m % 60);
const won = (n) => Number(n).toLocaleString('ko-KR') + '원';
const num = (n) => Number(n).toLocaleString('ko-KR');
/* demo clock: 2026-11-02 14:20 KST */
let NOW = 14 * 60 + 20;

const TONE = {
  '확정': 'ok', '판매 가능': 'ok', '일치': 'ok', '반영 확인': 'ok', '계산 완료': 'ok', '완료': 'ok', '충족': 'ok', '지원': 'ok', '발송 완료': 'ok', '검토 후 발송': 'mute', '정상': 'ok', '처리 완료': 'ok', '허용': 'ok',
  '확인 필요': 'warn', '계산 보류': 'warn', '확인 중': 'warn', '관찰 중': 'warn', '근거 부족': 'warn', '재대조 필요': 'warn', '미확인': 'warn', '대기': 'warn',
  '불일치': 'bad', '실패': 'bad', '발송 실패': 'bad', '운영자 확인': 'bad', '비활성': 'bad',
  '취소': 'mute', '유지': 'mute', '확인 불가': 'mute', '제외': 'mute', '미지원': 'mute', '운영자 이관': 'mute', '언급 없음': 'mute', '진행 중': 'mute'
};
const pill = (t, cls) => '<span class="pill ' + (cls || TONE[t] || 'mute') + '">' + esc(t) + '</span>';
const btn = (o) => '<button type="button" class="btn ' + (o.cls || '') + '" ' + (o.attrs || '') + '>' + (o.icon ? ic(o.icon) : '') + '<span>' + esc(o.label) + '</span></button>';
const sw = (on, attrs, label, disabled) => '<button type="button" class="sw" role="switch" aria-checked="' + !!on + '" ' + attrs + (disabled ? ' disabled' : '') + '><span class="trk" aria-hidden="true"></span><span>' + esc(label) + '</span></button>';
const titleRow = (h, sid, sub, acts) => '<div class="title-row"><div><h1>' + esc(h) + (sid ? '<span class="sid">' + esc(sid) + '</span>' : '') + '</h1>' + (sub ? '<p class="sub">' + sub + '</p>' : '') + '</div>' + (acts ? '<div class="title-acts">' + acts + '</div>' : '') + '</div>';
const empty = (t, d, b) => '<div class="empty"><b>' + esc(t) + '</b><span>' + esc(d) + '</span>' + (b || '') + '</div>';
/* the signature: one segment per step of the sync chain */
const STEPWORD = { ok: '완료', fail: '실패', chk: '확인 중', need: '확인 필요', skip: '중단', busy: '진행 중', '': '대기', na: '해당 없음' };
const chain = (steps, compact) => '<ol class="chain' + (compact ? ' compact' : '') + '" style="--n:' + steps.length + '" aria-label="' + esc(steps.map((s) => s.k + ' ' + (s.v || STEPWORD[s.s])).join(', ')) + '">' +
  steps.map((s) => '<li class="' + (s.s || 'wait') + '"><span class="seg-bar"></span><span class="k">' + esc(s.k) + '</span><span class="v">' + esc(s.v || STEPWORD[s.s]) + '</span></li>').join('') + '</ol>';

function toast(msg, kind) {
  toast.at = Date.now();
  $('toastHost').innerHTML = '<div class="toast' + (kind === 'bad' ? ' bad' : '') + '" role="' + (kind === 'bad' ? 'alert' : 'status') + '">' + ic(kind === 'bad' ? 'alert' : 'check') + '<span>' + esc(msg) + '</span></div>';
  clearTimeout(toast.t); toast.t = setTimeout(() => { $('toastHost').innerHTML = ''; }, 3600);
}
let busy = false;
function withLoading(msg, fn, ms) {
  if (busy) return; busy = true;
  $('overlayHost').innerHTML = '<div class="overlay" role="status" aria-live="assertive"><div class="ob"><span class="spin" aria-hidden="true"></span><span>' + esc(msg) + '</span></div></div>';
  setTimeout(() => { $('overlayHost').innerHTML = ''; busy = false; fn(); }, ms || 420);
}

/* ===================== data (examples) ===================== */
const PROPS = [
  { k: 'A', name: '○○스테이 1호점', rooms: ['독채'] },
  { k: 'B', name: '○○스테이 2호점', rooms: ['한옥 1호실', '한옥 2호실'] },
  { k: 'C', name: '○○스테이 3호점', rooms: ['숲 101', '숲 102', '숲 103', '숲 104'] }
];
const propName = (k) => PROPS.find((p) => p.k === k).name;
const propShort = (k) => propName(k).replace('○○스테이 ', '');
const CH = ['플랫폼 A', '플랫폼 B', '플랫폼 C', '플랫폼 D'];

/* week on the calendar: 11/02 (today) .. 11/08; a booking holds nights s..e-1, the check-out day is free */
const DOW = '일월화수목금토';
const WEEK = Array.from({ length: 7 }, (_, i) => { const d = new Date(2026, 10, 2 + i); return { i, m: d.getMonth() + 1, d: d.getDate(), dow: DOW[d.getDay()], we: d.getDay() === 5 || d.getDay() === 6 }; });
const dLabel = (i) => { const d = new Date(2026, 10, 2 + i); return (d.getMonth() + 1) + '/' + pad(d.getDate()); };
const BK = (id, prop, room, guest, s, e, n, ch, amt, o) => Object.assign({ id, prop, room, guest, s, e, n, ch, amt, st: '확정', chx: '일치', plat: '반영 확인', chk: 14 * 60 + 2, hist: [] }, o || {});
const BOOKS = [
  BK('RSV-2611-0301', 'A', '독채', '김○○', 0, 2, 2, '플랫폼 A', 216000),
  BK('RSV-2611-0302', 'B', '한옥 1호실', '이○○', 2, 5, 2, '플랫폼 B', 450000, { cancelDemo: true }),
  BK('RSV-2611-0303', 'B', '한옥 1호실', '박○○', 5, 7, 2, '플랫폼 C', 340000),
  BK('RSV-2611-0304', 'B', '한옥 2호실', '최○○', -1, 1, 3, '플랫폼 D', 300000, { plat: '확인 불가', platWhy: '플랫폼 D는 반영 조회 경로가 없어 플랫폼 관리 화면 대조로 대신합니다.' }),
  BK('RSV-2611-0305', 'C', '숲 101', '정○○', -2, 0, 2, '플랫폼 A', 190000),
  BK('RSV-2611-0306', 'C', '숲 102', '강○○', 0, 3, 3, '플랫폼 C', 285000),
  BK('RSV-2611-0307', 'C', '숲 103', '조○○', 3, 5, 2, '플랫폼 B', 190000, { st: '확인 필요', chx: '불일치', plat: '확인 필요', chk: 13 * 60 + 40, orig: { e: 6, amt: 285000 }, why: '내부 2박, Channex 원본 3박' }),
  BK('RSV-2611-0308', 'C', '숲 104', '한○○', -1, 2, 2, '플랫폼 A', 285000)
];
const BLOCKS = [{ room: '한옥 1호실', s: 0, e: 2, at: '10-27' }, { room: '숲 104', s: 4, e: 7, at: '10-30' }];

/* rates: per property, platform and plan */
const PLANS = ['기본', '비환불'];
const CFG = {};
PROPS.forEach((p) => {
  CFG[p.k] = {};
  [['플랫폼 A', 15, 0, '플랫폼'], ['플랫폼 B', 18, 10, '숙소'], ['플랫폼 C', 17, 5, '플랫폼'], ['플랫폼 D', null, null, null]].forEach((b) => {
    CFG[p.k][b[0]] = {};
    PLANS.forEach((pl) => {
      const unset = b[1] == null || (p.k === 'B' && b[0] === '플랫폼 C' && pl === '기본');
      CFG[p.k][b[0]][pl] = unset
        ? { fee: null, disc: null, payer: '숙소', src: '', short: b[1] == null ? '수수료·할인 근거 없음' : '요금제 매핑 미확인', why: b[1] == null ? '수수료·할인 근거가 없습니다. 계약 조건 입력이 필요합니다.' : '요금제 매핑을 확인하지 못했습니다. Channex 요금제 연결 확인이 필요합니다.' }
        : { fee: b[1], disc: pl === '비환불' ? b[2] + 5 : b[2], payer: pl === '비환불' ? '숙소' : b[3], src: '계약 조건 확인 (예시)', why: '' };
    });
  });
});
const isOk = (c) => c.fee != null && c.disc != null;
function calc(c, target) { const d = c.payer === '숙소' ? c.disc : 0, k = (1 - d / 100) * (1 - c.fee / 100), reg = Math.ceil(target / k / 100) * 100; return { reg, net: Math.floor(reg * k) }; }
const DAYS = Array.from({ length: 14 }, (_, i) => { const d = new Date(2026, 10, 9 + i); return { i, label: (d.getMonth() + 1) + '/' + d.getDate(), dow: DOW[d.getDay()], we: [5, 6].includes(d.getDay()) }; });
const curPrice = (room, ch, we) => { const b = { '독채': 180000, '한옥 1호실': 150000, '한옥 2호실': 150000 }[room] || 95000; return (we ? Math.round(b * 1.2 / 1000) * 1000 : b) + CH.indexOf(ch) * 2000; };
const roomList = () => PROPS.flatMap((p) => p.rooms.map((r) => ({ p: p.k, r })));

/* messages */
const MT = (id, type, guest, rsv, prop, room, ch, at, q, draft, fields, o) => Object.assign({ id, type, guest, rsv, prop, room, ch, at, q, draft, fields, state: 'wait', checked: true, chkAt: at + 2, edited: false, log: [[hm(at), '문의 수신']].concat(draft ? [[hm(at + 2), 'AI 초안 생성, 근거 대조']] : []) }, o || {});
const EXCL = ['환불', '금액', '클레임'];
const fD = (val) => ({ k: '숙박일', re: /\d+월 \d+일/, src: 'Channex 연결 예약', val }), fN = (val) => ({ k: '인원', re: /\d+명/, src: 'Channex 연결 예약', val }), fA = (k, val, src) => ({ k, re: /[\d,]+원/, src, val });
const MSGS = [
  MT('M-302', '편의시설', '박○○', 'RSV-2611-0303', 'B', '한옥 1호실', '플랫폼 C', 14 * 60 + 6, '침구는 몇 명 기준으로 준비되어 있나요?', '안녕하세요. 11월 7일 숙박은 3명 기준으로 침구를 준비해 드립니다. 추가 침구가 필요하시면 말씀해 주세요.', [fD('11월 7일'), fN('2명')]),
  MT('M-301', '체크인 안내', '김○○', 'RSV-2611-0301', 'A', '독채', '플랫폼 A', 14 * 60 + 11, '오늘 체크인은 몇 시부터 되나요? 두 명 갑니다.', '안녕하세요. 11월 2일 체크인은 오후 3시부터 가능합니다. 예약 인원 2명 기준으로 준비해 두겠습니다.', [fD('11월 2일'), { k: '체크인 시간', re: /오후 \d+시/, src: '숙소 안내', val: '오후 3시' }, fN('2명')]),
  MT('M-303', '주차', '강○○', 'RSV-2611-0306', 'C', '숲 102', '플랫폼 C', 13 * 60 + 48, '차를 가져가도 되나요?', '안녕하세요. 주차장은 객실당 1대까지 무료로 이용하실 수 있습니다.', [{ k: '주차 대수', re: /객실당 \d+대/, src: '숙소 안내', val: '객실당 1대' }]),
  MT('M-304', '편의시설', '정○○', 'RSV-2611-0305', 'C', '숲 101', '플랫폼 B', 13 * 60 + 31, '아기 침대를 빌릴 수 있나요?', '', [], { noBasis: '숙소 안내에 아기 침대 항목이 없어 초안을 만들지 않았습니다.' }),
  MT('M-305', '환불', '이○○', 'RSV-2611-0302', 'B', '한옥 1호실', '플랫폼 B', 12 * 60 + 52, '지금 취소하면 얼마나 돌려받나요?', '안녕하세요. 결제 금액은 450,000원이며, 환불 금액은 취소 규정을 확인한 뒤 운영자가 안내해 드리겠습니다.', [fA('결제 금액', '450,000원', 'Channex 연결 예약')]),
  MT('M-306', '금액', '최○○', 'RSV-2611-0304', 'B', '한옥 2호실', '플랫폼 A', 11 * 60 + 40, '한 명 추가하면 요금이 얼마인가요?', '안녕하세요. 인원 추가 요금은 1인 1박 20,000원입니다.', [fA('추가 요금', '20,000원', '숙소 안내')]),
  MT('M-307', '클레임', '한○○', 'RSV-2611-0308', 'C', '숲 104', '플랫폼 A', 10 * 60 + 15, '어젯밤 난방이 약해서 많이 추웠습니다.', '불편을 드려 죄송합니다. 설비 상태를 확인한 뒤 운영자가 다시 안내해 드리겠습니다.', []),
  MT('M-308', '체크인 안내', '서○○', 'RSV-2611-0192', 'A', '독채', '플랫폼 C', 9 * 60 + 40, '출입 비밀번호는 언제 받나요?', '안녕하세요. 체크인 당일 오후 3시 전에 안내해 드립니다.', [{ k: '체크인 시간', re: /오후 \d+시/, src: '숙소 안내', val: '오후 3시' }], { state: 'failed', failWhy: 'Channex 메시지 API 응답 시간 초과' }),
  MT('M-300', '주차', '문○○', 'RSV-2611-0189', 'C', '숲 103', '플랫폼 A', 9 * 60 + 5, '주차비가 따로 있나요?', '안녕하세요. 주차장은 객실당 1대까지 무료로 이용하실 수 있습니다.', [{ k: '주차 대수', re: /객실당 \d+대/, src: '숙소 안내', val: '객실당 1대' }], { state: 'sent', sentAt: 9 * 60 + 12 })
];
MSGS.find((m) => m.id === 'M-308').log.push(['09:43', '검토 후 발송 실패 (시간 초과)']);
MSGS.find((m) => m.id === 'M-300').log.push(['09:12', '검토 후 발송 완료, 수정 없음']);

/* AI observation: weekly stats over 10-05..11-01 (28 days) */
const AUTO = {
  stop: false,
  types: [{ t: '체크인 안내', d: 28, n: 64, e: 0, on: false }, { t: '주차', d: 19, n: 31, e: 2, on: false }, { t: '편의시설', d: 12, n: 22, e: 3, on: false }],
  chan: { '플랫폼 A': true, '플랫폼 B': true, '플랫폼 C': true },
  /* week, inquiries, drafts, sent unedited, sent after edit, excluded or handed over, send failures, mock sends */
  weeks: [['10-05~10-11', 34, 28, 26, 2, 6, 1, 12], ['10-12~10-18', 35, 30, 28, 2, 5, 0, 8], ['10-19~10-25', 36, 29, 28, 1, 7, 1, 0], ['10-26~11-01', 36, 30, 30, 0, 6, 0, 0]],
  log: [['10-05 09:00', '유형별 무보정 관찰 시작']]
};
AUTO.weeks.forEach((w) => console.assert(w[2] >= w[3] + w[4], 'drafts cover the sent drafts', w[0]));

/* sync status (UI-00 and the merged auxiliary screens) */
const CHS = {
  '플랫폼 A': { hook: '정상', last: 14 * 60 + 18, sup: ['지원', '지원', '지원'] },
  '플랫폼 B': { hook: '정상', last: 14 * 60 + 16, sup: ['지원', '지원', '지원'] },
  '플랫폼 C': { hook: '비활성', last: 14 * 60 + 8, off: 14 * 60 + 8, sup: ['지원', '지원', '지원'] },
  '플랫폼 D': { hook: '정상', last: 14 * 60 + 11, sup: ['지원', '미확인', '미지원'] }
};
const FAILS = [
  { id: 'JOB-4471', type: '취소 반영', room: '한옥 1호실', ch: '플랫폼 B', why: '시간 초과', tries: 2, desc: '11/07~11/10 취소 확인 전송', st: 'wait' },
  { id: 'JOB-4468', type: '요금 전송', room: '독채', ch: '플랫폼 C', why: '호출 제한', tries: 3, desc: '11/14~11/15 주말 요금', st: 'wait' },
  { id: 'JOB-4462', type: '메시지', room: '독채', ch: '플랫폼 D', why: '인증 실패', tries: 3, desc: '체크인 안내 1건', st: 'wait' },
  { id: 'JOB-4459', type: '예약 변경', room: '숲 104', ch: '플랫폼 C', why: '응답 유실', tries: 2, desc: '인원 2명에서 3명으로 변경', st: 'wait' }
];
const RECON = { last: 14 * 60, checked: 308, rows: [
  { k: 'm1', rsv: 'RSV-2611-0172', room: '숲 103', ch: '플랫폼 B', inner: '취소', ext: '예약 유지', kind: '불일치', act: '재동기화', st: 'wait' },
  { k: 'm2', rsv: 'PC-773105', room: '독채', ch: '플랫폼 C', inner: '없음', ext: '확정 11/21~11/22', kind: '빠진 예약', act: '보충', st: 'wait' },
  { k: 'm3', rsv: 'PC-773118', room: '숲 102', ch: '플랫폼 C', inner: '없음', ext: '확정 11/28~11/30', kind: '빠진 예약', act: '보충', st: 'wait' }
] };

/* ===================== UI state ===================== */
const UI = {
  view: 'ui01', menu: false, guideOpen: false, guideStep: null,
  bk: { prop: '', q: '', flt: '', sel: 'RSV-2611-0302' },
  fee: { prop: 'A', wd: 150000, we: 190000, plan: {}, edit: null, err: {}, saved: '10-31 10:32' },
  rate: { rooms: { '독채': true, '한옥 1호실': true }, dates: { 4: true, 5: true }, chs: { '플랫폼 A': true, '플랫폼 B': true, '플랫폼 C': true, '플랫폼 D': true }, plans: { '기본': true }, preview: null, run: null, errs: [], invalid: false, keys: {}, dup: null, seq: 3105, log: [] },
  m: { sel: 'M-302', prop: '', q: '', flt: 'all', showRsv: true, pane: 'list' }
};

/* ===================== UI-01 예약 관리 ===================== */
function bkMatch(b) {
  const F = UI.bk, q = F.q.trim();
  if (F.prop && b.prop !== F.prop) return false;
  if (q && (b.guest + b.id + b.room).indexOf(q) < 0) return false;
  if (F.flt === 'in' && !(b.s === 0 && b.st !== '취소')) return false;
  if (F.flt === 'out' && !(b.e === 0 && b.st !== '취소')) return false;
  if (F.flt === 'stay' && !(b.s <= 0 && 0 < b.e && b.st !== '취소')) return false;
  if (F.flt === 'need' && b.st !== '확인 필요') return false;
  return true;
}
function counts() {
  const F = UI.bk, live = BOOKS.filter((b) => b.st !== '취소' && (!F.prop || b.prop === F.prop));
  return { in: live.filter((b) => b.s === 0).length, out: live.filter((b) => b.e === 0).length, stay: live.filter((b) => b.s <= 0 && 0 < b.e).length, need: live.filter((b) => b.st === '확인 필요').length };
}
function barHtml(kind, s, e, inner, attrs, title) {
  const a = Math.max(0, s), z = Math.min(7, e); if (z <= a) return '';
  const left = a / 7 * 100, w = (z - a) / 7 * 100;
  const tag = kind === 'stop' ? 'span' : 'button';
  return '<' + tag + (tag === 'button' ? ' type="button"' : '') + ' class="bar ' + kind + '" style="left:calc(' + left.toFixed(4) + '% + 3px);width:calc(' + w.toFixed(4) + '% - 6px)" ' + (attrs || '') + ' title="' + esc(title) + '">' + inner + '</' + tag + '>';
}
function roomRow(p, room) {
  const F = UI.bk, filtering = !!(F.flt || F.q.trim());
  let bars = '';
  BLOCKS.filter((x) => x.room === room).forEach((x) => { bars += barHtml('stop', x.s, x.e, '수동 판매중지', 'data-block="' + esc(room) + '"', '수동 판매중지 ' + dLabel(x.s) + '~' + dLabel(x.e - 1) + ' (운영자 ' + x.at + ' 설정)'); });
  BOOKS.filter((b) => b.room === room).forEach((b) => {
    const sel = UI.bk.sel === b.id ? ' sel' : '', dim = filtering && !bkMatch(b) ? ' dim' : '';
    const stay = dLabel(b.s) + '~' + dLabel(b.e) + ' ' + (b.e - b.s) + '박';
    if (b.st === '취소') bars += barHtml('freed' + sel + dim, b.s, b.e, '<b>판매 가능</b><span>' + esc(b.guest) + ' 취소</span>', 'data-book="' + b.id + '"', b.guest + ' 취소, 판매 가능 ' + stay);
    else bars += barHtml((b.st === '확인 필요' ? 'need' : 'booked') + sel + dim, b.s, b.e, '<b>' + esc(b.guest) + '</b><span>' + (b.st === '확인 필요' ? '확인 필요' : (b.e - b.s) + '박') + '</span>', 'data-book="' + b.id + '"', b.guest + ' ' + room + ' ' + stay + ' ' + b.st);
  });
  return '<div class="cal-room">' + esc(room) + '</div><div class="cal-row" data-room="' + esc(room) + '">' + WEEK.map((w) => '<span class="day' + (w.we ? ' we' : '') + (w.i === 0 ? ' today' : '') + '"></span>').join('') + bars + '</div>';
}
function vUi01() {
  const F = UI.bk, n = counts(), d = BOOKS.find((b) => b.id === F.sel), rooms = PROPS.filter((p) => !F.prop || p.k === F.prop);
  const need = BOOKS.filter((b) => b.st === '확인 필요' && (!F.prop || b.prop === F.prop));
  const sub = need.length
    ? '<b>' + esc(need[0].guest) + ' 예약(' + esc(need[0].room) + ')이 Channex 원본과 다릅니다.</b> ' + esc(need[0].why) + '. 확인 전에는 AI 초안에 쓰지 않습니다.'
    : '원본과 어긋난 예약이 없습니다. 마지막 Channex 확인 ' + hm(Math.max(...BOOKS.map((b) => b.chk))) + '.';
  const card = (k, t, v) => '<button type="button" class="count' + (k === 'need' && v ? ' alert' : '') + '" data-bkflt="' + k + '" aria-pressed="' + (F.flt === k) + '"><span>' + t + '</span><b class="num">' + v + '건</b></button>';
  const filtering = !!(F.flt || F.q.trim()), L = BOOKS.filter(bkMatch);
  const matches = filtering ? '<div class="matches" aria-live="polite"><span class="small">조건에 맞는 예약 ' + L.length + '건</span>' + L.map((b) => '<button type="button" class="chip" data-book="' + b.id + '" aria-pressed="' + (F.sel === b.id) + '">' + esc(b.guest) + ' · ' + esc(b.room) + ' · ' + dLabel(b.s) + '~' + dLabel(b.e) + '</button>').join('') + (L.length ? '' : '<span>조건에 맞는 예약이 없습니다.</span>') + btn({ cls: 'ghost sm', label: '조건 지우기', attrs: 'data-act="bkClear"' }) + '</div>' : '';
  return titleRow('예약 관리', 'UI-01', sub, '<span class="stamp">RES-01~04 · CHX-01·02·05</span>' + btn({ label: '요금 관리', icon: 'tag', attrs: 'data-go="ui02"' })) +
    '<div class="filters"><label for="bkP" class="sr">숙소</label><select id="bkP" class="input" data-bkprop="1"><option value="">전체 숙소</option>' + PROPS.map((p) => '<option value="' + p.k + '"' + (F.prop === p.k ? ' selected' : '') + '>' + esc(p.name) + '</option>').join('') + '</select>' +
    '<label for="bkQ" class="sr">예약 검색</label><input id="bkQ" class="input search" type="search" data-bkq="1" value="' + esc(F.q) + '" placeholder="게스트·예약번호·객실 검색" style="min-width:260px"><span class="spacer"></span><span class="stamp">숙소 기준 한국 표준시 · 퇴실일은 점유하지 않음</span></div>' +
    '<div class="counts" role="group" aria-label="오늘 요약, 누르면 해당 예약만 표시">' + card('in', '오늘 입실', n.in) + card('out', '오늘 퇴실', n.out) + card('stay', '투숙 중', n.stay) + card('need', '확인 필요', n.need) + '</div>' +
    '<div class="grid"><section class="panel c8 cal" aria-labelledby="calH"><header><h2 id="calH">객실별 예약 일정</h2><span class="meta">11/02(오늘)~11/08 · 7박</span></header>' + matches +
    '<div class="cal-scroll" tabindex="0" aria-label="객실별 예약 일정 표"><div class="cal-grid"><div class="cal-head room">객실</div>' + WEEK.map((w) => '<div class="cal-head' + (w.i === 0 ? ' today' : '') + (w.we ? ' we' : '') + '"><span>' + w.dow + (w.i === 0 ? ' 오늘' : '') + '</span><b class="num">' + w.m + '/' + w.d + '</b></div>').join('') +
    rooms.map((p) => '<div class="cal-prop">' + esc(p.name) + '</div>' + p.rooms.map((r) => roomRow(p, r)).join('')).join('') + '</div></div>' +
    '<div class="legend" aria-label="범례"><span><i class="booked"></i>확정 (채널 반영)</span><span><i class="need"></i>확인 필요</span><span><i class="stop"></i>수동 판매중지</span><span><i class="freed"></i>취소 후 판매 가능</span></div></section>' +
    '<section class="panel c4 sticky" id="bkDetail" aria-label="예약 상세">' + (d ? bkPanel(d) : '<h2>예약 상세</h2>' + '<div class="mt">' + empty('예약을 골라 주세요', '일정에서 예약을 누르면 Channex 확인 상태와 복구 이력이 나옵니다.') + '</div>') + '</section></div>';
}
function bkPanel(b) {
  const chx = b.st === '취소' ? { s: 'ok', v: '취소 반영' } : b.chx === '불일치' ? { s: 'need', v: '불일치' } : { s: 'ok', v: '일치' };
  const plat = b.plat === '확인 불가' ? { s: 'na', v: '확인 불가' } : b.plat === '확인 필요' ? { s: 'need', v: '확인 필요' } : { s: 'ok', v: '반영 확인' };
  const blk = BLOCKS.find((x) => x.room === b.room && x.e <= b.s), nxt = BOOKS.find((x) => x.room === b.room && x.id !== b.id && x.s >= b.e && x.st !== '취소');
  let h = '<div class="detail-head"><h2>' + esc(b.guest) + ' <small>' + esc(b.id) + '</small></h2>' + pill(b.st) + '</div>' +
    '<dl class="kv mt"><dt>숙소·객실</dt><dd>' + esc(propShort(b.prop)) + ' · ' + esc(b.room) + '</dd><dt>숙박</dt><dd class="n">' + dLabel(b.s) + ' ~ ' + dLabel(b.e) + ' · ' + (b.e - b.s) + '박</dd><dt>인원</dt><dd class="n">' + b.n + '명</dd><dt>금액</dt><dd class="n">' + won(b.amt) + '</dd><dt>예약 채널</dt><dd>' + esc(b.ch) + '</dd></dl>' +
    '<h3 class="subhead">외부 확인 · 마지막 확인 11-02 ' + hm(b.chk) + '</h3>' + chain([{ k: '내부 저장', s: 'ok', v: '저장됨' }, Object.assign({ k: 'Channex 조회' }, chx), Object.assign({ k: '플랫폼 반영' }, plat)]);
  if (b.platWhy) h += '<p class="note mt">' + ic('alert') + '<span>' + esc(b.platWhy) + '</span></p>';
  if (b.st === '확인 필요') h += '<p class="note warn mt" role="status">' + ic('alert') + '<span><b>확인 필요.</b> ' + esc(b.why) + '. 원본을 확인하기 전에는 AI 초안에 이 예약을 쓰지 않습니다.</span></p>';
  if (b.req) h += '<div class="tw mt"><table aria-label="내부 값과 Channex 원본 비교"><thead><tr><th>항목</th><th class="n">내부</th><th class="n">Channex 원본</th></tr></thead><tbody>' +
    '<tr class="flag"><td>퇴실</td><td class="n">' + dLabel(b.e) + '</td><td class="n"><b>' + dLabel(b.orig.e) + '</b></td></tr><tr class="flag"><td>숙박</td><td class="n">' + (b.e - b.s) + '박</td><td class="n"><b>' + (b.orig.e - b.s) + '박</b></td></tr><tr class="flag"><td>금액</td><td class="n">' + won(b.amt) + '</td><td class="n"><b>' + won(b.orig.amt) + '</b></td></tr></tbody></table></div>';
  if (b.st === '취소') h += '<h3 class="subhead">취소 후 판매 상태 · RES-03</h3><div class="tw"><table aria-label="취소 후 판매 상태"><thead><tr><th>구간</th><th>취소 전</th><th>취소 후</th></tr></thead><tbody>' +
    (blk ? '<tr><td class="num">' + dLabel(blk.s) + '~' + dLabel(blk.e - 1) + '</td><td>수동 판매중지</td><td>' + pill('유지') + '</td></tr>' : '') +
    '<tr><td class="num">' + dLabel(b.s) + '~' + dLabel(b.e - 1) + '</td><td>이 예약</td><td>' + pill('판매 가능') + '</td></tr>' +
    (nxt ? '<tr><td class="num">' + dLabel(nxt.s) + '~' + dLabel(nxt.e - 1) + '</td><td>' + esc(nxt.guest) + ' 예약</td><td>' + pill('유지') + '</td></tr>' : '') + '</tbody></table></div>';
  const lm = MSGS.filter((x) => x.rsv === b.id);
  h += '<h3 class="subhead">연결된 대화</h3>' + (lm.length ? lm.map((x) => '<div class="linked"><b>' + esc(x.guest) + '</b>' + pill(x.type, 'type') + pill(msgState(x)) + '<span class="q">' + esc(x.q) + '</span></div>').join('') : '<p class="small">이 예약으로 들어온 문의가 없습니다.</p>');
  h += '<div class="actions mt16">' + (b.req ? btn({ cls: 'primary', icon: 'check', label: '원본 기준으로 복구', attrs: 'data-act="bkRestore"' }) : '') + btn({ icon: 'retry', label: '원본 재조회', attrs: 'data-act="bkRequery"' }) + btn({ icon: 'msg', label: '메시지 이동', attrs: 'data-act="bkMsg"' }) + '</div>';
  if (b.cancelDemo && b.st !== '취소') h += '<div class="note mt">' + ic('alert') + '<span class="grow">시연: 플랫폼 B에서 이 예약의 취소 알림이 들어온 상황을 재현합니다.</span></div><div class="actions mt">' + btn({ icon: 'x', label: '취소 알림 수신 (시연)', attrs: 'data-act="bkCancel"' }) + '</div>';
  if (b.hist.length) h += '<h3 class="subhead">복구·처리 이력</h3><ul class="hist">' + b.hist.map((x) => '<li><span>' + x[0] + '</span>' + esc(x[1]) + '</li>').join('') + '</ul>';
  return h;
}

/* ===================== UI-02 요금 관리 ===================== */
function platCard(ch) {
  const U = UI.fee, pl = U.plan[ch] || '기본', c = CFG[U.prop][ch][pl], ok = isOk(c), editing = U.edit === ch;
  const a = ok ? calc(c, U.wd) : null, b = ok ? calc(c, U.we) : null;
  let h = '<article class="plat' + (ok ? '' : ' hold') + '" data-plat="' + ch + '"><div class="plat-head"><b>' + ch + '</b>' + pill(ok ? '계산 완료' : '계산 보류') + '</div>' +
    '<label class="field"><span class="small">요금제 (Channex 연결)</span><select class="input" data-cardplan="' + ch + '" aria-label="' + ch + ' 요금제">' + PLANS.map((x) => '<option' + (pl === x ? ' selected' : '') + '>' + x + '</option>').join('') + '</select></label>';
  if (ok) h += '<div class="reg"><div><span>평일 등록 가격</span><strong>' + num(a.reg) + '<small class="small">원</small></strong><em>실수령 ' + won(a.net) + '</em></div><div><span>주말 등록 가격</span><strong>' + num(b.reg) + '<small class="small">원</small></strong><em>실수령 ' + won(b.net) + '</em></div></div>' +
    '<p class="cond">수수료 ' + c.fee + '% · 할인 ' + c.disc + '% (' + c.payer + ' 부담)<br>근거: ' + esc(c.src) + '</p>';
  else h += '<p class="note warn">' + ic('alert') + '<span><b>계산 보류.</b> ' + esc(c.why) + '</span></p>';
  if (editing) h += '<div class="edit"><label class="field"><span>수수료(%)</span><input class="input num" type="number" id="eF" min="0" max="40" step="0.5" value="' + (c.fee == null ? '' : c.fee) + '"></label><label class="field"><span>할인(%)</span><input class="input num" type="number" id="eD" min="0" max="50" step="1" value="' + (c.disc == null ? '' : c.disc) + '"></label><label class="field"><span>할인 부담</span><select class="input" id="eP">' + ['숙소', '플랫폼'].map((x) => '<option' + (c.payer === x ? ' selected' : '') + '>' + x + '</option>').join('') + '</select></label>' +
    (U.err.card ? '<p class="field" style="grid-column:1/-1"><span class="err" role="alert">' + esc(U.err.card) + '</span></p>' : '') +
    '<div class="actions" style="grid-column:1/-1">' + btn({ cls: 'sm', label: '취소', attrs: 'data-act="cardCancel"' }) + btn({ cls: 'sm', icon: 'check', label: '조건 저장', attrs: 'data-cardsave="' + ch + '"' }) + '</div></div>';
  else h += '<div class="actions">' + btn({ cls: 'sm', label: '수수료·할인 설정', attrs: 'data-cardedit="' + ch + '"' }) + '</div>';
  return h + '</article>';
}
function vUi02() {
  const U = UI.fee, E = U.err, cs = CH.map((ch) => CFG[U.prop][ch][U.plan[ch] || '기본']), okN = cs.filter(isOk).length, holds = CH.filter((ch, i) => !isOk(cs[i]));
  const lowest = CH.map((ch, i) => isOk(cs[i]) ? { ch, v: calc(cs[i], U.wd).reg } : null).filter(Boolean).sort((x, y) => x.v - y.v)[0];
  const sub = '<b>평일 ' + won(U.wd) + '을 받으려면 ' + (lowest ? lowest.ch + '에 ' + won(lowest.v) + '부터' : '등록 가격을 계산할 수 없습니다') + '</b> 올려야 합니다.' + (holds.length ? ' ' + holds.join('·') + '는 근거가 없어 계산 보류입니다.' : '');
  return titleRow('요금 관리', 'UI-02', sub, '<span class="stamp">RATE-01~02 · CHX-01·03</span>' + btn({ icon: 'layers', label: '일괄 변경 대상 선택', attrs: 'data-go="ui03"' })) +
    (UI.rate.invalid ? '<p class="note warn" role="status" style="margin-bottom:16px">' + ic('alert') + '<span><b>설정을 바꿔 요금 일괄 변경의 기존 미리보기를 무효화했습니다.</b> UI-03에서 다시 계산한 뒤 전송할 수 있습니다.</span></p>' : '') +
    '<section class="set-row" aria-labelledby="s1"><div class="set-label"><h2 id="s1">목표 실수령액</h2><p>수수료·할인을 뗀 뒤 1박에 받을 금액입니다. 여기서 저장해도 플랫폼에는 전송되지 않고, 전송은 요금 일괄 변경에서 합니다.</p><div class="sum"><div><span class="muted">마지막 저장</span><span class="num">' + esc(U.saved) + '</span></div><div><span class="muted">계산 완료</span><b class="num">' + okN + ' / ' + CH.length + ' 플랫폼</b></div></div></div>' +
    '<div class="panel"><div class="fgrid"><label class="field"><span>숙소</span><select class="input" data-feeprop="1">' + PROPS.map((p) => '<option value="' + p.k + '"' + (U.prop === p.k ? ' selected' : '') + '>' + esc(p.name) + '</option>').join('') + '</select></label>' +
    '<label class="field"><span>평일 목표 (일~목)</span><input class="input big num" type="number" data-feet="wd" value="' + U.wd + '" step="1000" min="10000" aria-describedby="wdH">' + (E.wd ? '<span class="err" role="alert">' + esc(E.wd) + '</span>' : '<span class="hint" id="wdH">원, 1박</span>') + '</label>' +
    '<label class="field"><span>주말 목표 (금·토)</span><input class="input big num" type="number" data-feet="we" value="' + U.we + '" step="1000" min="10000" aria-describedby="weH">' + (E.we ? '<span class="err" role="alert">' + esc(E.we) + '</span>' : '<span class="hint" id="weH">원, 1박</span>') + '</label></div>' +
    '<dl class="well"><dt>포함</dt><dd>1박 객실 요금</dd><dt>제외</dt><dd>청소비, 세금, 추가 인원비</dd><dt>통화</dt><dd>원(KRW)</dd><dt>반올림</dt><dd>등록 가격 100원 단위 올림</dd></dl>' +
    '<p class="small mt">값은 예시입니다. 실제 포함·제외 항목은 계약 전에 확정하며, 예상 실수령액과 실제 정산액은 따로 관리합니다.</p>' +
    '<div class="actions mt16">' + btn({ cls: 'primary', icon: 'check', label: '기본 요금 저장', attrs: 'data-act="feeSave"' }) + '</div></div></section>' +
    '<section class="set-row" aria-labelledby="s2"><div class="set-label"><h2 id="s2">플랫폼별 계산 조건과 예상 수령액</h2><p>Channex에 연결된 요금제와 계약 조건으로 등록 가격을 계산합니다. 근거가 없는 조건은 기본값으로 채우지 않고 계산 보류로 둡니다.</p><div class="sum">' + CH.map((ch, i) => '<div><span class="muted">' + ch + '</span>' + pill(isOk(cs[i]) ? '계산 완료' : '계산 보류') + '</div>').join('') + '</div></div>' +
    '<div class="panel"><div class="plats">' + CH.map(platCard).join('') + '</div></div></section>';
}

/* ===================== UI-03 요금 일괄 변경 ===================== */
function ratePreview() {
  const R = UI.rate, rows = [], sel = DAYS.filter((d) => R.dates[d.i]);
  [['평일', sel.filter((d) => !d.we), UI.fee.wd], ['주말', sel.filter((d) => d.we), UI.fee.we]].forEach((g) => {
    if (!g[1].length) return;
    roomList().filter((x) => R.rooms[x.r]).forEach((x) => PLANS.filter((pl) => R.plans[pl]).forEach((pl) => CH.filter((c) => R.chs[c]).forEach((c) => {
      const f = CFG[x.p][c][pl], ok = isOk(f), v = ok ? calc(f, g[2]) : null;
      rows.push({ k: x.r + pl + c + g[0], p: x.p, room: x.r, plan: pl, ch: c, grp: g[0], days: g[1].map((d) => d.label).join(', '), before: curPrice(x.r, c, g[0] === '주말'), ok, why: f.short || f.why, reg: v ? v.reg : null, net: v ? v.net : null });
    })));
  });
  return rows;
}
function rateErrs() {
  const R = UI.rate, e = [];
  if (!Object.values(R.rooms).some(Boolean)) e.push('객실을 하나 이상 골라 주세요.');
  if (!Object.values(R.dates).some(Boolean)) e.push('날짜를 하나 이상 골라 주세요.');
  if (!Object.values(R.chs).some(Boolean)) e.push('플랫폼을 하나 이상 골라 주세요.');
  if (!Object.values(R.plans).some(Boolean)) e.push('요금제를 하나 이상 골라 주세요.');
  return e;
}
function makePreview() { const R = UI.rate; R.errs = rateErrs(); R.dup = null; if (R.errs.length) { R.preview = null; return false; } R.preview = ratePreview(); R.invalid = false; return true; }
function rateInvalidate() { const R = UI.rate; if (R.preview) R.invalid = true; R.preview = null; R.dup = null; }
const STEPN = ['내부 저장', 'Channex 접수', 'Channex 재조회', '플랫폼 반영'];
const rowResult = (x) => x.st.includes('fail') ? '실패' : x.st.includes('chk') ? '확인 중' : x.st.includes('need') ? '확인 필요' : x.st.every((s) => s === 'ok') ? '완료' : '진행 중';
const runCounts = (run) => { const r = run.rows.map(rowResult), c = (t) => r.filter((x) => x === t).length; return { done: c('완료'), fail: c('실패'), chk: c('확인 중'), need: c('확인 필요'), n: r.length }; };
const chip = (on, attr, label) => '<button type="button" class="chip" aria-pressed="' + !!on + '" ' + attr + '>' + label + '</button>';
function vUi03() {
  const R = UI.rate, run = R.run, running = run && run.state === 'running';
  let sub;
  if (run && !running) { const c = runCounts(run); sub = '<b>' + c.n + '항목 중 완료 ' + c.done + ' · 실패 ' + c.fail + ' · 확인 중 ' + c.chk + ' · 확인 필요 ' + c.need + '.</b> ' + (c.fail ? '실패한 ' + c.fail + '항목만 다시 보낼 수 있고, 성공한 항목은 다시 보내지 않습니다.' : c.chk || c.need ? '남은 항목은 재조회나 대체 검증으로 판정합니다.' : '모든 항목이 플랫폼 반영까지 확인됐습니다.'); }
  else if (running) sub = '<b>' + run.id + ' 전송 중입니다.</b> 끝날 때까지 다시 보낼 수 없습니다.';
  else sub = '<b>고른 객실·날짜·플랫폼·요금제만 바뀝니다.</b> 선택하지 않은 범위는 그대로 두고, 목표 실수령액은 요금 관리에 저장한 값을 씁니다.';
  const nSel = (o) => Object.values(o).filter(Boolean).length;
  let h = titleRow('요금 일괄 변경', 'UI-03', sub, '<span class="stamp">RATE-03~04 · CHX-03</span>' + btn({ icon: 'tag', label: '계산 조건 (UI-02)', attrs: 'data-go="ui02"' }));
  if (R.invalid) h += '<p class="note warn" role="status" style="margin-bottom:16px">' + ic('alert') + '<span><b>조건이 바뀌어 이전 미리보기를 무효화했습니다.</b> 다시 계산한 뒤 전송할 수 있습니다.</span></p>';
  h += '<div class="grid g-rate"><section class="panel c4" aria-labelledby="pickH"><header><h2 id="pickH">대상 선택</h2><span class="meta">객실 ' + nSel(R.rooms) + ' · 날짜 ' + nSel(R.dates) + ' · 플랫폼 ' + nSel(R.chs) + '</span></header>' +
    PROPS.map((p) => '<div class="pick"><span>' + esc(p.name) + '</span><div class="chips">' + p.rooms.map((r) => chip(R.rooms[r], 'data-rroom="' + esc(r) + '"', esc(r))).join('') + '</div></div>').join('') +
    '<div class="pick"><span>적용 날짜 · 11/09~11/22 · 금·토는 주말 요금</span><div class="seg" role="group" aria-label="날짜 빠른 선택">' + [['weekday', '평일'], ['weekend', '주말'], ['all', '전체'], ['none', '지우기']].map((q) => '<button type="button" data-rq="' + q[0] + '" aria-pressed="false">' + q[1] + '</button>').join('') + '</div>' +
    '<div class="dates">' + DAYS.map((d) => '<button type="button" class="date' + (d.we ? ' we' : '') + '" aria-pressed="' + !!R.dates[d.i] + '" data-rdate="' + d.i + '" aria-label="' + d.label + ' ' + d.dow + '요일' + (d.we ? ' 주말 요금' : '') + '"><span>' + d.dow + '</span><b class="num">' + d.label + '</b></button>').join('') + '</div></div>' +
    '<div class="pick"><span>플랫폼</span><div class="chips">' + CH.map((c) => chip(R.chs[c], 'data-rch="' + c + '"', c)).join('') + '</div></div>' +
    '<div class="pick"><span>요금제</span><div class="chips">' + PLANS.map((c) => chip(R.plans[c], 'data-rplan="' + c + '"', c)).join('') + '</div></div>' +
    (R.errs.length ? '<p class="note bad mt" role="alert">' + ic('alert') + '<span>' + R.errs.map(esc).join('<br>') + '</span></p>' : '') +
    '<div class="actions mt16">' + btn({ icon: 'compare', label: '계산 결과 새로고침', attrs: 'data-act="ratePreview"' + (running ? ' disabled' : '') }) + '</div></section>';
  h += '<section class="panel c8" aria-labelledby="prevH" id="previewPanel">';
  if (!R.preview) h += '<header><h2 id="prevH">전송 미리보기</h2></header>' + empty('전송 미리보기가 없습니다', '대상을 고른 뒤 계산하면 항목별 등록 가격과 예상 수령액이 나옵니다. 아직 아무것도 전송되지 않았습니다.', btn({ icon: 'compare', label: '계산 결과 새로고침', attrs: 'data-act="ratePreview"' }));
  else {
    const P = R.preview, hold = P.filter((x) => !x.ok), send = P.filter((x) => x.ok);
    h += '<header><h2 id="prevH">전송 미리보기</h2><span class="meta">' + P.length + '항목 · 계산 완료 ' + send.length + ' · 계산 보류 ' + hold.length + '</span></header>' +
      '<dl class="well" style="margin:0 0 8px">' + [['평일', UI.fee.wd, false], ['주말', UI.fee.we, true]].map((g) => { const ds = DAYS.filter((d) => R.dates[d.i] && d.we === g[2]).map((d) => d.label); return '<dt>' + g[0] + ' 목표 ' + won(g[1]) + '</dt><dd class="num">' + (ds.length ? ds.join(', ') : '<span class="muted">고른 날짜 없음</span>') + '</dd>'; }).join('') + '</dl>' +
      '<div class="tw"><table class="rt rt-prev"><thead><tr><th>대상</th><th>날짜</th><th>플랫폼</th><th class="n">변경 전</th><th class="n">등록 가격</th><th class="n">예상 수령액</th><th>상태</th></tr></thead><tbody>' +
      P.map((x) => '<tr class="' + (x.ok ? '' : 'hold') + '"><td class="a-t nw">' + esc(x.room) + ' <span class="muted">· ' + x.plan + '</span></td><td class="a-d nw">' + x.grp + '</td><td class="nw a-c">' + x.ch + '</td><td class="n a-b" data-l="변경 전">' + won(x.before) + '</td><td class="n a-g" data-l="등록 가격">' + (x.ok ? '<b>' + won(x.reg) + '</b>' : '<span class="muted">—</span>') + '</td><td class="n a-e" data-l="예상 수령액">' + (x.ok ? won(x.net) : '<span class="muted">미확인</span>') + '</td><td class="a-s">' + pill(x.ok ? '계산 완료' : '계산 보류') + (x.ok ? '' : '<span class="sub">' + esc(x.why) + '</span>') + '</td></tr>').join('') + '</tbody></table></div>' +
      (hold.length ? '<p class="note warn mt">' + ic('alert') + '<span class="grow">계산 보류 ' + hold.length + '항목은 숨기지 않고 보여 주며, 이번 전송에는 넣지 않습니다.</span>' + btn({ cls: 'sm', label: '요금 관리에서 조건 입력', attrs: 'data-go="ui02"' }) + '</p>' : '') +
      '<div class="sendbar">' + btn({ cls: run && !running ? '' : 'primary', icon: running ? '' : 'send', label: running ? '전송 중 · 중복 실행 차단' : '대상 확인 후 전송 (' + send.length + '항목)', attrs: 'data-act="rateSend" id="sendBtn"' + (send.length && !running ? '' : ' disabled') }) + '<span class="small">전송 중에는 다시 누를 수 없고, 같은 내용은 한 번만 실행됩니다.</span></div>' +
      (R.dup ? '<p class="note bad mt" role="alert">' + ic('lock') + '<span><b>중복 실행을 막았습니다.</b> 같은 내용의 전송(' + R.dup + ')이 이미 있습니다. 실패 항목은 아래 실패만 재처리를 쓰세요.</span></p>' : '');
  }
  h += '</section>';
  if (run) {
    const c = runCounts(run), fails = run.rows.filter((x) => x.st.includes('fail')), chk = run.rows.filter((x) => x.st.includes('chk')), need = run.rows.filter((x) => x.st.includes('need'));
    h += '<section class="panel c12" id="runPanel" aria-labelledby="runH"><header><h2 id="runH">항목별 처리 결과 <span class="muted num" style="font-weight:400">' + run.id + '</span></h2><span class="meta">' + (running ? '전송 중' : '완료 ' + c.done + ' · 실패 ' + c.fail + ' · 확인 중 ' + c.chk + ' · 확인 필요 ' + c.need) + '</span></header>' +
      (!running && (fails.length || chk.length || need.length) ? '<div class="actions" style="margin-bottom:12px">' + btn({ cls: 'primary', icon: 'retry', label: '실패만 재처리 (' + fails.length + ')', attrs: 'data-act="rateRetry"' + (fails.length ? '' : ' disabled') }) + btn({ icon: 'compare', label: '결과 재조회 (' + chk.length + ')', attrs: 'data-act="rateRecheck"' + (chk.length ? '' : ' disabled') }) + btn({ icon: 'check', label: '대체 검증 기록 (' + need.length + ')', attrs: 'data-act="rateAlt"' + (need.length ? '' : ' disabled') }) + '</div>' : '') +
      (!running && !fails.length && !chk.length && !need.length ? '<p class="note ok" style="margin-bottom:12px">' + ic('check') + '<span><b>' + c.n + '항목을 모두 확인했습니다.</b> 성공한 항목은 재처리 때 다시 보내지 않았습니다(전송 횟수 참고).</span></p>' : '') +
      '<div class="tw results"><table class="rt rt-res"><thead><tr><th>대상</th><th>플랫폼</th><th class="n">등록 가격</th><th>반영 사슬 · ' + STEPN.join(' → ') + '</th><th>결과</th><th class="n">전송</th><th>사유</th></tr></thead><tbody>' +
      run.rows.map((x) => { const t = rowResult(x); return '<tr data-row="' + esc(x.room + '|' + x.ch) + '" class="' + (t === '실패' ? 'flag' : '') + '"><td class="a-t">' + esc(x.room) + '<span class="sub">' + x.grp + ' · ' + x.plan + '</span></td><td class="nw a-c">' + x.ch + '</td><td class="n a-g">' + won(x.reg) + '</td><td class="a-x">' + chain(x.st.map((s, i) => ({ k: STEPN[i], s })), true) + '</td><td class="res a-s">' + pill(t) + '</td><td class="n tries a-n">' + x.tries + '회</td><td class="small a-w">' + esc(x.why) + '</td></tr>'; }).join('') + '</tbody></table></div></section>';
  }
  if (R.log.length) h += '<section class="panel c12" aria-labelledby="logH"><header><h2 id="logH">변경 이력</h2><span class="meta">' + R.log.length + '건</span></header><div class="tw"><table><thead><tr><th>전송</th><th>시각</th><th>대상</th><th>결과</th></tr></thead><tbody>' + R.log.map((l) => '<tr><td class="num">' + l.id + '</td><td class="num">' + l.at + '</td><td>' + esc(l.t) + '</td><td>' + esc(l.res) + '</td></tr>').join('') + '</tbody></table></div></section>';
  return h + '</div>';
}
function logRun(run) {
  const c = runCounts(run), t = run.rows.length + '항목 · ' + [...new Set(run.rows.map((x) => x.room))].join(', '), s = '완료 ' + c.done + ' · 실패 ' + c.fail + ' · 확인 중 ' + c.chk + ' · 확인 필요 ' + c.need, ex = UI.rate.log.find((l) => l.id === run.id);
  if (ex) { ex.res = s; ex.at = '11-02 ' + hm(NOW); } else UI.rate.log.unshift({ id: run.id, at: '11-02 ' + hm(NOW), t, res: s });
}
function rateSend() {
  const R = UI.rate;
  if (R.run && R.run.state === 'running') { toast('전송 중이라 다시 실행하지 않았습니다.', 'bad'); return; }
  const send = R.preview.filter((x) => x.ok), key = send.map((x) => x.k + x.reg).join('|');
  if (R.keys[key]) { R.dup = R.keys[key]; toast('같은 내용의 전송이 이미 있어 중복 실행을 막았습니다.', 'bad'); render(); return; }
  const id = 'RT-' + (R.seq++); R.keys[key] = id; R.dup = null;
  const pick = (c, n) => send.filter((x) => x.ch === c)[n];
  const f = pick('플랫폼 C', 0), l = pick('플랫폼 B', 0), nd = pick('플랫폼 A', 1);
  R.run = { id, state: 'running', rows: send.map((x) => Object.assign({}, x, { st: ['', '', '', ''], tries: 1, why: '', plan2: x === f ? { at: 1, v: 'fail', why: '호출 제한으로 Channex 접수 실패' } : x === l ? { at: 2, v: 'chk', why: '응답 유실. 성공으로 단정하지 않고 재조회 대기' } : x === nd ? { at: 3, v: 'need', why: '플랫폼 조회로 확인할 수 없는 값. 관리 화면 대조 필요' } : null })) };
  render();
  runSteps(R.run, R.run.rows, 0, () => { const c = R.run.rows.filter((x) => x.st.includes('fail')).length; logRun(R.run); toast(c ? '전송을 마쳤습니다. 실패 ' + c + '항목은 그것만 다시 보낼 수 있습니다.' : '전송을 마쳤습니다.', c ? 'bad' : ''); });
}
function runSteps(run, rows, i, done) {
  if (i > 3) { run.state = 'done'; done(); if (UI.view === 'ui03') render(); return; }
  rows.forEach((x) => { const stop = x.st.slice(0, i).some((s) => ['fail', 'chk', 'need', 'skip'].includes(s)); x.st[i] = stop ? 'skip' : 'busy'; });
  if (UI.view === 'ui03') render();
  setTimeout(() => {
    rows.forEach((x) => { if (x.st[i] === 'busy') { if (x.plan2 && x.plan2.at === i) { x.st[i] = x.plan2.v; x.why = x.plan2.why; } else x.st[i] = 'ok'; } });
    runSteps(run, rows, i + 1, done);
  }, 360);
}
function runResume(run, rows) {
  const step = (i) => {
    if (i > 3) { run.state = 'done'; logRun(run); toast('실패 항목만 다시 보냈습니다. 성공 항목은 건드리지 않았습니다.'); if (UI.view === 'ui03') render(); return; }
    rows.forEach((x) => { x.st[i] = 'busy'; }); if (UI.view === 'ui03') render();
    setTimeout(() => { rows.forEach((x) => { x.st[i] = 'ok'; if (i === 3) x.why = '재처리로 반영 확인 (' + hm(NOW) + ')'; }); step(i + 1); }, 360);
  };
  step(1);
}

/* ===================== UI-04 메시지 관리 ===================== */
function compare(m) { return m.fields.map((f) => { const hit = m.draft.match(f.re), v = hit ? hit[0] : null; return { k: f.k, src: f.src, val: f.val, draft: v, res: v === null ? '언급 없음' : v === f.val ? '일치' : '불일치' }; }); }
const mism = (m) => compare(m).filter((c) => c.res === '불일치');
function msgState(m) { if (m.state === 'sent') return '발송 완료'; if (m.state === 'failed') return '발송 실패'; if (m.state === 'handed') return '운영자 이관'; if (m.noBasis && !m.edited) return '근거 부족'; if (!m.checked) return '재대조 필요'; if (mism(m).length) return '운영자 확인'; return '검토 후 발송'; }
function rsvInfo(m) { const b = BOOKS.find((x) => x.id === m.rsv); if (b) return { stay: dLabel(b.s) + '~' + dLabel(b.e) + ' · ' + (b.e - b.s) + '박', n: b.n + '명', st: b.st, inGrid: true }; return { stay: '지난 예약', n: '—', st: '확정', inGrid: false }; }
const isTodo = (m) => m.state === 'wait' || m.state === 'handed';
const inFlt = (m, k) => k === 'all' || (k === 'todo' && isTodo(m)) || (k === 'fail' && m.state === 'failed');
function vUi04() {
  const U = UI.m, q = U.q.trim(), props = PROPS.filter((p) => !q || p.name.indexOf(q) >= 0);
  const scope = MSGS.filter((m) => !U.prop || m.prop === U.prop), L = scope.filter((m) => inFlt(m, U.flt));
  if (!L.some((m) => m.id === U.sel) && L[0]) U.sel = L[0].id;
  const m = scope.find((x) => x.id === U.sel); /* a thread just handled stays open even when it leaves the filter */
  const blocked = MSGS.filter((x) => x.state === 'wait' && x.checked && mism(x).length);
  const sub = blocked.length ? '<b>' + esc(blocked[0].guest) + '님 초안이 예약과 다릅니다.</b> ' + mism(blocked[0]).map((b) => b.k + ' 초안 ' + b.draft + ', 예약 ' + b.val).join(' · ') + '. 일치할 때까지 발송이 막힙니다.' : '초안의 날짜·인원·금액·시간을 예약과 숙소 안내에 대조합니다. 지금 막힌 초안은 없습니다.';
  const todoN = (k) => MSGS.filter((x) => x.prop === k && isTodo(x)).length;
  const c1 = '<section class="panel props-panel" aria-labelledby="propH"><h2 id="propH" class="sr">숙소</h2><label class="sr" for="mQ">숙소명 검색</label><input id="mQ" class="input search" type="search" data-mq="1" value="' + esc(U.q) + '" placeholder="숙소명 검색" style="width:100%"><div class="props"><button type="button" data-mprop="" aria-current="' + (!U.prop) + '"><span>전체 숙소</span><span class="n num">미처리 ' + MSGS.filter(isTodo).length + '</span></button>' +
    props.map((p) => '<button type="button" data-mprop="' + p.k + '" aria-current="' + (U.prop === p.k) + '"><span>' + esc(propShort(p.k)) + '</span><span class="n num">미처리 ' + todoN(p.k) + '</span></button>').join('') + '</div>' + (props.length ? '' : '<p class="small mt">검색 결과가 없습니다.</p>') + '</section>';
  const c2 = '<section class="panel list-panel" aria-labelledby="listH"><header><h2 id="listH">대화 목록</h2><span class="meta">' + (U.prop ? esc(propShort(U.prop)) : '전체 숙소') + '</span></header><div class="seg" role="group" aria-label="대화 필터">' + [['all', '전체'], ['todo', '미처리'], ['fail', '발송 실패']].map((x) => '<button type="button" data-mflt="' + x[0] + '" aria-pressed="' + (U.flt === x[0]) + '">' + x[1] + ' <span class="num">' + scope.filter((y) => inFlt(y, x[0])).length + '</span></button>').join('') + '</div>' +
    (L.length ? '<div class="convs">' + L.map((x) => '<button type="button" class="conv" data-msg="' + x.id + '" aria-current="' + (x.id === U.sel) + '"><span class="r1"><b>' + esc(x.guest) + '</b><span class="small num">' + hm(x.at) + '</span></span><span class="q">' + esc(x.q) + '</span><span class="r2">' + pill(x.type, 'type') + pill(msgState(x)) + '</span></button>').join('') + '</div>' : '<div class="mt">' + empty('이 조건의 대화가 없습니다', '다른 필터를 고르거나 전체를 보세요.', btn({ cls: 'sm', label: '전체 보기', attrs: 'data-mflt="all"' })) + '</div>') + '</section>';
  let c3 = '<section class="panel thread">' + empty('대화를 골라 주세요', '목록에서 대화를 고르면 본문과 AI 초안이 나옵니다.') + '</section>';
  if (m) {
    const R = rsvInfo(m), cmp = compare(m), bad = mism(m), st = msgState(m), ex = EXCL.includes(m.type) ? m.type : m.noBasis ? '근거 부족' : '', open = m.state === 'wait' || m.state === 'failed';
    const can = m.state === 'wait' && m.checked && !bad.length && m.draft.trim().length >= 5;
    c3 = '<section class="panel thread" id="msgDetail" aria-labelledby="thH"><div class="thread-head">' + btn({ cls: 'ghost sm back', icon: 'left', label: '목록', attrs: 'data-act="mBack"' }) + '<h2 id="thH">' + esc(m.guest) + ' ' + pill(m.type, 'type') + ' ' + pill(st) + '</h2>' + btn({ cls: 'sm', icon: 'cal', label: '예약 상세', attrs: 'data-act="mRsv" aria-expanded="' + U.showRsv + '"' }) + '</div>' +
      (U.showRsv ? '<dl class="rsv-well"><div><dt>예약</dt><dd>' + esc(m.rsv) + '</dd></div><div><dt>객실</dt><dd>' + esc(m.room) + '</dd></div><div><dt>숙박</dt><dd>' + R.stay + '</dd></div><div><dt>인원</dt><dd>' + R.n + '</dd></div><div><dt>상태</dt><dd>' + R.st + '</dd></div>' + (R.inGrid ? '<div style="grid-column:1/-1">' + btn({ cls: 'ghost sm', label: '예약 관리에서 열기', attrs: 'data-openbook="' + m.rsv + '"' }) + '</div>' : '') + '</dl>' : '') +
      '<div class="bubble"><span class="small">' + esc(m.ch) + ' · ' + hm(m.at) + ' 수신</span>' + esc(m.q) + '</div>' +
      '<div class="draft"><div class="draft-head"><h3>' + (m.noBasis ? '운영자 답변' : 'AI 답변 초안') + '</h3>' + (ex ? pill('자동발송 제외 · ' + ex, 'mute') : '') + (m.edited ? '<span class="small">운영자 수정함</span>' : '') + '</div>' +
      (m.noBasis && !m.edited ? '<p class="note warn" style="margin-bottom:10px">' + ic('alert') + '<span><b>근거 부족.</b> ' + esc(m.noBasis) + ' 운영자가 직접 답변하거나 이관합니다.</span></p>' : '') +
      '<label class="sr" for="dr">답변 내용</label><textarea id="dr" class="input" rows="3" data-draft="' + m.id + '"' + (open ? '' : ' readonly') + ' placeholder="답변을 입력해 주세요">' + esc(m.draft) + '</textarea>' +
      (m.noBasis ? '' : '<p class="basis">근거: 숙소 안내 / Channex 연결 예약 ' + esc(m.rsv) + ' / 확인 시각 <span class="num">' + hm(m.chkAt) + '</span></p>') +
      (cmp.length ? '<div class="tw cmp"><table aria-label="근거 대조"><thead><tr><th>항목</th><th>초안 값</th><th>원본 값</th><th>결과</th><th>원본</th></tr></thead><tbody>' + cmp.map((x) => '<tr class="' + (m.checked && x.res === '불일치' ? 'flag' : '') + '"><td>' + x.k + '</td><td class="v num">' + esc(x.draft == null ? '—' : x.draft) + '</td><td class="num">' + esc(x.val) + '</td><td>' + (m.checked ? pill(x.res) : pill('재대조 필요')) + '</td><td class="small">' + x.src + '</td></tr>').join('') + '</tbody></table></div>' : '') +
      (m.state === 'failed' ? '<p class="note bad mt" role="alert">' + ic('alert') + '<span><b>발송 실패.</b> ' + esc(m.failWhy) + '. 같은 메시지 번호로 다시 보내 중복 발송을 막습니다.</span></p>' : '') +
      (m.state === 'wait' && m.checked && bad.length ? '<p class="note bad mt" role="alert" id="blockNote">' + ic('lock') + '<span><b>운영자 확인.</b> ' + bad.map((b) => b.k + ' 초안 ' + esc(b.draft) + ', 원본 ' + esc(b.val)).join(' / ') + '. 일치할 때까지 발송할 수 없습니다.</span></p>' : '') +
      (m.state === 'wait' && !m.checked ? '<p class="note warn mt" role="status">' + ic('alert') + '<span>초안을 고쳤습니다. 근거 대조를 다시 실행한 뒤 발송할 수 있습니다.</span></p>' : '') +
      (m.state === 'sent' ? '<p class="note ok mt">' + ic('check') + '<span><b>' + hm(m.sentAt) + ' 발송 완료.</b> 같은 문의에는 다시 발송되지 않습니다.</span></p>' : '') +
      (m.state === 'handed' ? '<p class="note mt">' + ic('lock') + '<span>운영자에게 이관했습니다. 미처리 목록에 남습니다.</span></p>' : '') +
      (open ? '<div class="actions mt16">' + (m.state === 'failed' ? btn({ cls: 'primary', icon: 'retry', label: '다시 발송', attrs: 'data-act="msgRetry"' }) : btn({ cls: 'primary', icon: 'send', label: '검토 후 발송', attrs: 'data-act="msgSend" id="msgSendBtn"' + (can ? '' : ' disabled') }) + (m.noBasis ? '' : btn({ icon: 'compare', label: '근거 대조 다시 실행', attrs: 'data-act="msgCheck"' })) + btn({ cls: 'ghost', icon: 'alert', label: '운영자 확인으로 이관', attrs: 'data-act="msgHand"' })) + '</div>' : '') +
      '</div><h3 class="subhead">처리 이력</h3><ul class="hist" id="msgHist">' + m.log.map((x) => '<li><span>' + x[0] + '</span>' + esc(x[1]) + '</li>').join('') + '</ul></section>';
  }
  return titleRow('메시지 관리', 'UI-04', sub, '<span class="stamp">AI-01~03 · CHX-04</span>' + btn({ icon: 'eye', label: 'AI 관찰·자동발송', attrs: 'data-go="auto"' })) +
    '<div class="inbox' + (U.pane === 'thread' ? ' show-thread' : '') + '">' + c1 + c2 + c3 + '</div>';
}

/* ===================== AI 관찰·자동발송 ===================== */
function vAuto() {
  const A = AUTO, sum = A.weeks.reduce((a, r) => a.map((v, i) => (i ? v + r[i] : v)), ['합계', 0, 0, 0, 0, 0, 0, 0]);
  const rate = (r) => (r[3] / (r[3] + r[4]) * 100).toFixed(1) + '%';
  const ready = A.types.filter((x) => x.d >= 28), wait = A.types.filter((x) => x.d < 28);
  const sub = A.stop ? '<b>자동발송을 전체 중지했습니다.</b> 모든 문의가 운영자 검토로 들어갑니다.' : '<b>' + (ready.length ? ready.map((x) => x.t).join('·') + '만 28일 연속 무보정을 채웠습니다.' : '28일 연속 무보정을 채운 유형이 없습니다.') + '</b> ' + wait.map((x) => x.t + ' ' + x.d + '일').join(', ') + '째 관찰 중입니다.';
  return titleRow('AI 관찰·자동발송', '', sub, '<span class="stamp">AI-02~03 · CHX-04</span>' + btn({ icon: 'msg', label: '메시지 관리', attrs: 'data-go="ui04"' })) +
    '<section class="set-row" aria-labelledby="a1"><div class="set-label"><h2 id="a1">전체 중지</h2><p>켜 두면 자동발송이 모두 멈추고 모든 문의가 운영자 검토로 들어갑니다. 유형별 설정은 그대로 남습니다.</p></div><div class="panel"><div class="chan-row"><div class="grow"><b>자동발송 전체 중지</b><p class="small">' + (A.stop ? '중지 중 · 자동으로 나가는 메시지가 없습니다.' : '운영 중 · 아래에서 켠 유형만 자동발송됩니다.') + '</p></div>' + sw(A.stop, 'data-autostop="1" aria-label="자동발송 전체 중지"', A.stop ? '중지 중' : '운영 중') + '</div>' +
    (A.stop ? '<p class="note bad mt" role="status">' + ic('lock') + '<span><b>전체 중지 중입니다.</b> 유형별·채널별 스위치는 잠깁니다.</span></p>' : '') + '</div></section>' +
    '<section class="set-row" aria-labelledby="a2"><div class="set-label"><h2 id="a2">유형별 판정</h2><p>운영자가 초안을 고치지 않고 보낸 날이 28일(4주) 이어진 유형만 켤 수 있습니다. 초안을 고쳐 보내면 그 유형은 0일부터 다시 셉니다.</p></div><div class="panel"><div class="obs">' +
    A.types.map((x) => { const ok = x.d >= 28, on = x.on && !A.stop; return '<div class="obs-row" data-type="' + x.t + '"><b>' + x.t + '</b><div class="track"><span class="t" role="img" aria-label="' + x.d + '일 / 28일"><i style="width:' + Math.min(100, x.d / 28 * 100).toFixed(1) + '%"></i></span><span class="lab"><span class="num days">' + x.d + '일 / 28일</span><span>' + (ok ? '최근 28일 초안 ' + x.n + '건 · 수정 ' + x.e + '건' : (28 - x.d) + '일 남음 · 수정 ' + x.e + '건') + '</span></span></div>' + pill(ok ? '충족' : '관찰 중') + sw(on, 'data-autotype="' + x.t + '" aria-label="' + x.t + ' 자동발송"', on ? '켜짐' : ok && !A.stop ? '꺼짐' : '잠김', !ok || A.stop) + '</div>'; }).join('') +
    EXCL.concat(['근거 부족']).map((t) => '<div class="obs-row excl"><b>' + t + '</b><span class="lock">' + ic('lock') + '항상 운영자 검토 · 관찰 대상 아님</span>' + pill('제외') + '</div>').join('') + '</div></div></section>' +
    '<section class="set-row" aria-labelledby="a3"><div class="set-label"><h2 id="a3">채널별 자동발송</h2><p>Channex 메시지 API를 지원하는 채널만 고를 수 있습니다. 플랫폼이 보내는 기존 예약 자동 메시지는 건드리지 않습니다.</p></div><div class="panel">' +
    CH.map((c) => { const supp = c !== '플랫폼 D', on = A.chan[c] && !A.stop; return '<div class="chan-row" data-chan="' + c + '"><b>' + c + '</b><span class="grow">' + pill(supp ? '지원' : '미지원') + '</span>' + (supp ? sw(on, 'data-autochan="' + c + '" aria-label="' + c + ' 자동발송 허용"', on ? '허용' : '차단', A.stop) : '<span class="lock">' + ic('lock') + '선택 불가 · 메시지 API 미지원</span>') + '</div>'; }).join('') + '</div></section>' +
    '<section class="set-row" aria-labelledby="a4"><div class="set-label"><h2 id="a4">관찰 통계</h2><p>집계 기간 10-05~11-01 (28일), 모든 문의 유형 합계입니다. 무보정률 = 무보정 발송 ÷ (무보정 발송 + 수정 후 발송). 모의 발송은 실적에서 빼고 따로 셉니다.</p><div class="sum"><div><span class="muted">무보정률 (28일)</span><b class="num">' + rate(sum) + '</b></div><div><span class="muted">분모</span><span class="num">' + (sum[3] + sum[4]) + '건</span></div><div><span class="muted">자동답변</span><span class="num">0건 (관찰 기간)</span></div></div></div>' +
    '<div class="panel"><div class="tw"><table><thead><tr><th>주간</th><th class="n">문의</th><th class="n">초안</th><th class="n">무보정 발송</th><th class="n">수정 후 발송</th><th class="n">제외·이관</th><th class="n">무보정률</th><th class="n">모의 발송 (실적 제외)</th></tr></thead><tbody>' +
    A.weeks.map((r) => '<tr><td class="num">' + r[0] + '</td><td class="n">' + r[1] + '</td><td class="n">' + r[2] + '</td><td class="n">' + r[3] + '</td><td class="n">' + r[4] + '</td><td class="n">' + r[5] + '</td><td class="n">' + rate(r) + '</td><td class="n muted">' + r[7] + '</td></tr>').join('') +
    '</tbody><tfoot><tr><td>합계</td><td class="n">' + sum[1] + '</td><td class="n">' + sum[2] + '</td><td class="n">' + sum[3] + '</td><td class="n">' + sum[4] + '</td><td class="n">' + sum[5] + '</td><td class="n">' + rate(sum) + '</td><td class="n muted">' + sum[7] + '</td></tr></tfoot></table></div>' +
    '<p class="small mt">발송 실패 ' + sum[6] + '건은 무보정률 분모에 넣지 않았습니다. 관찰 기간에는 운영자가 모든 메시지를 확인했으므로 자동답변은 0건입니다.</p></div></section>' +
    '<section class="set-row" aria-labelledby="a5"><div class="set-label"><h2 id="a5">변경 기록</h2><p>스위치와 연속 일수가 바뀐 때를 남깁니다.</p></div><div class="panel"><ul class="hist" id="autoLog">' + A.log.map((l) => '<li style="grid-template-columns:96px minmax(0,1fr)"><span>' + l[0] + '</span>' + esc(l[1]) + '</li>').join('') + '</ul></div></section>';
}

/* ===================== 연동 상태 (UI-00 + merged auxiliary screens) ===================== */
function vSync() {
  const C = CHS['플랫폼 C'], off = C.hook === '비활성', fails = FAILS.filter((f) => f.st !== 'gone'), open = RECON.rows.filter((r) => r.st !== 'done');
  const sub = off ? '<b>플랫폼 C 웹훅이 ' + hm(C.off) + '부터 꺼져 있습니다.</b> 그동안 빠진 예약 ' + open.filter((r) => r.act === '보충').length + '건은 기록 대조로 보충합니다.' : '<b>4채널 연결과 웹훅이 정상입니다.</b> 처리 대기 실패 ' + fails.length + '건, 대조 대기 ' + open.length + '건.';
  const path = (name, steps, st, last, note) => '<tr><td><b>' + name + '</b></td><td style="min-width:300px">' + chain(steps) + '</td><td>' + pill(st) + '</td><td class="num">' + last + '</td><td class="small">' + note + '</td></tr>';
  return titleRow('연동 상태', 'UI-00', sub, '<span class="stamp">CHX-01~05 · 보조 화면</span>' + (off ? btn({ cls: 'primary', icon: 'plug', label: '플랫폼 C 웹훅 다시 켜기', attrs: 'data-act="hookOn"' }) : '') + btn({ icon: 'retry', label: '지금 점검', attrs: 'data-act="check"' })) +
    '<div class="grid"><section class="panel c12" aria-labelledby="r1"><header><h2 id="r1">연동 경로</h2><span class="meta">Channex 접수·조회와 실제 플랫폼 반영은 따로 표시</span></header>' +
    '<div class="route"><div class="node"><b>채널지기</b><span>예약·요금·메시지 / 서버</span></div><div class="link" aria-hidden="true">' + ic('compare') + '</div><div class="node"><b>Channex API</b><span>채널매니저 / 기존 연동</span></div><div class="link" aria-hidden="true">' + ic('compare') + '</div><div class="node"><b>플랫폼 A·B·C·D</b><span>채널별 지원·권한 확인</span></div></div>' +
    '<div class="tw mt16"><table><thead><tr><th>경로</th><th>처리 순서</th><th>상태</th><th>마지막 확인</th><th>비고</th></tr></thead><tbody>' +
    path('예약 수신·ACK', [{ k: '플랫폼', s: 'ok', v: '수신' }, { k: 'Channex', s: 'ok', v: '전달' }, { k: '내부 저장', s: 'ok', v: '저장' }, { k: 'ACK', s: off ? 'need' : 'ok', v: off ? 'C 비활성' : '응답' }], off ? '확인 필요' : '정상', '14:18', '플랫폼 C 웹훅 비활성 구간은 변경 내역 조회로 보충') +
    path('ARI 전송·반영 확인', [{ k: '내부 저장', s: 'ok' }, { k: 'Channex 접수', s: 'ok' }, { k: 'Channex 재조회', s: 'ok' }, { k: '플랫폼 반영', s: 'need', v: 'D 미확인' }], '확인 필요', '14:12', '플랫폼 D는 요금 계산 조건이 없어 보류') +
    path('메시지', [{ k: 'Channex 수신', s: 'ok' }, { k: 'AI 초안·검토', s: 'ok' }, { k: 'Channex API', s: 'ok' }, { k: '지원 채널', s: 'ok', v: 'A·B·C' }], '정상', '14:11', '플랫폼 D는 메시지 API 미지원') +
    '</tbody></table></div></section>' +
    '<section class="panel c7" aria-labelledby="r2"><header><h2 id="r2">플랫폼별 연결</h2><span class="meta">최근 24시간</span></header><div class="tw"><table><thead><tr><th>플랫폼</th><th>웹훅</th><th>마지막 정상 반영</th><th>예약</th><th>요금</th><th>메시지</th></tr></thead><tbody>' +
    CH.map((c) => { const s = CHS[c]; return '<tr><td><b>' + c + '</b></td><td>' + pill(s.hook) + '</td><td class="num">' + hm(s.last) + '</td>' + s.sup.map((x) => '<td>' + pill(x) + '</td>').join('') + '</tr>'; }).join('') + '</tbody></table></div></section>' +
    '<section class="panel c5" aria-labelledby="r3"><header><h2 id="r3">처리 대기 실패 건</h2><span class="meta">' + fails.length + '건 · 자동 재시도 소진</span></header>' +
    (fails.length ? '<div class="rows">' + fails.map((f) => '<div class="chan-row" data-job="' + f.id + '"><div class="grow"><b class="num">' + f.id + '</b> <span class="muted">' + f.type + ' · ' + f.ch + '</span><p class="small">' + esc(f.room) + ' · ' + esc(f.desc) + ' · ' + f.why + ' ' + f.tries + '회</p></div>' + (f.st === 'busy' ? '<span class="pill">처리 중</span>' : btn({ cls: 'sm', icon: 'retry', label: '재처리', attrs: 'data-retry="' + f.id + '"' })) + '</div>').join('') + '</div>' : empty('처리할 실패 건이 없습니다', '모든 작업이 채널에 반영되었습니다. 새 실패가 생기면 여기에 나옵니다.')) + '</section>' +
    '<section class="panel c12" aria-labelledby="r4"><header><h2 id="r4">기록 대조</h2><span class="meta">마지막 ' + hm(RECON.last) + ' · 확인 ' + RECON.checked + '건 · 30분마다</span></header>' +
    '<div class="tw"><table><thead><tr><th>구분</th><th>예약</th><th>객실</th><th>플랫폼</th><th>내부 데이터</th><th>채널 기록</th><th>상태</th><th></th></tr></thead><tbody>' +
    RECON.rows.map((x) => '<tr><td>' + pill(x.kind, x.kind === '불일치' ? 'bad' : 'warn') + '</td><td class="num">' + x.rsv + '</td><td>' + esc(x.room) + '</td><td>' + x.ch + '</td><td>' + esc(x.inner) + '</td><td>' + esc(x.ext) + '</td><td>' + pill(x.st === 'done' ? '처리 완료' : '대기') + '</td><td class="n">' + (x.st === 'done' ? '' : btn({ cls: 'sm', icon: 'retry', label: x.act === '보충' ? '예약 보충' : '수동 재동기화', attrs: 'data-rec="' + x.k + '"' })) + '</td></tr>').join('') +
    '</tbody></table></div><p class="small mt">재동기화는 채널 기록을 기준으로 내부 예약을 고치기 전에 변경 내용을 보여 주고 실행 기록을 남깁니다. 실제 손님 예약을 자동으로 지우지 않습니다. 이 화면은 구조 설명이며 시연 중 실제 Channex 호출은 일어나지 않습니다.</p></section></div>';
}

/* ===================== kept menus ===================== */
function vReport() {
  return titleRow('정산 리포트', '', '기존 화면을 그대로 씁니다. 예약 매출·정산 조회는 이번 범위에서 개편하지 않습니다.') +
    '<div class="grid"><section class="panel c8" aria-labelledby="rp"><header><h2 id="rp">기존 정산 리포트</h2><span class="meta">범위 제외 · 기존 유지</span></header>' + empty('이번 시안에서는 정산 화면을 다시 만들지 않았습니다', '예약·요금·메시지 흐름은 예약 운영과 메시지 메뉴에서 보실 수 있습니다.', btn({ cls: 'sm', label: '예약 관리로', attrs: 'data-go="ui01"' })) + '</section>' +
    '<section class="panel c4" aria-labelledby="rp2"><header><h2 id="rp2">이 메뉴에서 유지되는 것</h2></header><ul class="hist"><li><span>유지</span>예약 매출 조회</li><li><span>유지</span>플랫폼별 정산 조회</li><li><span>제외</span>전면 개편, 구독 결제 개발</li></ul></section></div>';
}
function vMe() {
  return titleRow('내 프로필', '', '기존 화면을 그대로 씁니다. 구독 결제는 범위 제외입니다.') +
    '<div class="grid"><section class="panel c8" aria-labelledby="mp"><header><h2 id="mp">권한</h2><span class="meta">기존 유지</span></header><dl class="kv"><dt>역할</dt><dd>운영자 · 허용 숙소 3곳</dd><dt>조회·변경</dt><dd>허용된 숙소의 예약·요금·문의만 관리</dd><dt>조회자</dt><dd>허용 숙소 정보 열람만 가능</dd><dt>구독 결제</dt><dd>범위 제외, 기존 그대로</dd></dl></section>' +
    '<section class="panel c4" aria-labelledby="mp2"><header><h2 id="mp2">허용 숙소</h2><span class="meta">3곳</span></header><ul class="hist">' + PROPS.map((p) => '<li><span>' + p.rooms.length + '실</span>' + esc(p.name) + '</li>').join('') + '</ul></section></div>';
}

/* ===================== shell ===================== */
const NAV = [
  ['예약 운영', [['ui01', '예약 관리', 'cal'], ['ui02', '요금 관리', 'tag'], ['ui03', '요금 일괄 변경', 'layers'], ['sync', '연동 상태', 'plug']]],
  ['메시지', [['ui04', '메시지 관리', 'msg'], ['auto', 'AI 관찰·자동발송', 'eye']]],
  ['기존 메뉴', [['report', '정산 리포트', 'chart'], ['me', '내 프로필', 'user']]]
];
const V = { ui01: vUi01, ui02: vUi02, ui03: vUi03, ui04: vUi04, auto: vAuto, sync: vSync, report: vReport, me: vMe };
const NAMES = {}; NAV.forEach((g) => g[1].forEach((x) => { NAMES[x[0]] = x[1]; }));
const GUIDE = [
  { t: 'UI-01 취소 예시와 원본 재조회', d: '취소 구간만 판매 가능으로 바뀌고, 수동 판매중지와 다른 예약은 그대로입니다. RES-03·04', run: () => { Object.assign(UI.bk, { sel: 'RSV-2611-0302', flt: '', q: '', prop: '' }); go('ui01'); } },
  { t: 'UI-02 계산 조건', d: '플랫폼별 등록 가격. 조건이 없는 플랫폼 D는 계산 보류입니다. RATE-01~02', run: () => go('ui02') },
  { t: 'UI-03 부분 실패와 실패만 재처리', d: '응답 유실은 확인 중으로 두고, 성공 항목은 다시 보내지 않습니다. RATE-03~04', run: () => { if (!UI.rate.preview) makePreview(); go('ui03'); if (!UI.rate.run) rateSend(); setTimeout(() => { const p = $('runPanel'); if (p) p.scrollIntoView({ block: 'start' }); }, 80); } },
  { t: 'UI-04 근거 불일치로 발송 차단', d: '초안 3명, 예약 2명. 고치고 재대조해야 발송됩니다. AI-01~02', run: () => { Object.assign(UI.m, { sel: 'M-302', flt: 'all', prop: '', q: '', pane: 'thread', showRsv: true }); go('ui04'); } },
  { t: 'AI 관찰·자동발송 설정', d: '28일 무보정 유형만 켤 수 있습니다. 모의 발송은 실적 제외. AI-02~03', run: () => go('auto') }
];
function go(v) { UI.menu = false; if (location.hash === '#/' + v) route(); else location.hash = '#/' + v; }
function route() { const v = location.hash.replace(/^#\/?/, '').split('/')[0]; UI.view = V[v] ? v : 'ui01'; UI.menu = false; render(); window.scrollTo(0, 0); }
function renderShell() {
  const needN = BOOKS.filter((b) => b.st === '확인 필요').length, msgN = MSGS.filter((x) => x.state === 'wait' || x.state === 'failed').length, failN = FAILS.filter((f) => f.st !== 'gone').length;
  const cnt = { ui01: needN ? [needN, '확인 필요 ' + needN + '건'] : null, ui04: msgN ? [msgN, '미처리·발송 실패 ' + msgN + '건'] : null, sync: failN ? [failN, '실패 건 ' + failN + '건'] : null };
  $('sidebar').className = 'sidebar' + (UI.menu ? ' open' : '');
  $('sidebar').innerHTML = '<div style="display:flex;align-items:center"><a class="brand" href="#/ui01"><span class="mk" aria-hidden="true"><i></i><i></i><i></i></span>채널지기</a>' + btn({ cls: 'ghost close', icon: 'x', label: '메뉴 닫기', attrs: 'data-act="menu"' }) + '</div>' +
    '<div class="scope"><b>○○스테이</b><span class="small">숙소 3곳 · 객실 7 · Channex 연결</span></div>' +
    NAV.map((g) => '<div class="group-label">' + g[0] + '</div>' + g[1].map((x) => '<a class="nav-item" href="#/' + x[0] + '"' + (UI.view === x[0] ? ' aria-current="page"' : '') + '>' + ic(x[2]) + '<span>' + x[1] + '</span>' + (cnt[x[0]] ? '<span class="cnt num" title="' + cnt[x[0]][1] + '" aria-label="' + cnt[x[0]][1] + '">' + cnt[x[0]][0] + '</span>' : '') + '</a>').join('')).join('') +
    '<div class="side-bottom"><b>대표</b><span class="small">운영자 · 11-02 ' + hm(NOW) + ' KST</span></div>';
  $('phonebar').innerHTML = '<a class="brand" href="#/ui01" aria-label="채널지기 홈"><span class="mk" aria-hidden="true"><i></i><i></i><i></i></span>채널지기</a><span class="here">' + esc(NAMES[UI.view]) + '</span>' + btn({ cls: 'ghost', icon: 'menu', label: '', attrs: 'data-act="menu" aria-label="메뉴 열기" aria-expanded="' + UI.menu + '"' });
}
function renderGuide() {
  const g = $('guide');
  g.className = 'guide' + (UI.guideOpen ? '' : ' closed');
  g.innerHTML = '<button type="button" class="guide-head" data-act="toggleGuide" aria-expanded="' + UI.guideOpen + '" aria-controls="guideList"><span>시연 안내 <span class="small">5단계</span></span>' + ic(UI.guideOpen ? 'down' : 'up') + '</button>' +
    '<ol id="guideList">' + GUIDE.map((s, i) => '<li><button type="button" data-guide="' + i + '"' + (UI.guideStep === i ? ' aria-current="step"' : '') + '><span class="n">' + (i + 1) + '.</span><b>' + s.t + '</b><span class="d">' + s.d + '</span></button></li>').join('') + '</ol>';
}
function render() {
  renderShell();
  $('main').innerHTML = V[UI.view]();
  renderGuide();
}

/* ===================== events ===================== */
const mainVal = (k) => { const i = document.querySelector('[data-feet="' + k + '"]'); return i ? i.value : 0; };
function rateDirty() { rateInvalidate(); UI.rate.errs = []; render(); }
function refocus(id) { const q = $(id); if (q) { q.focus(); const n = q.value.length; try { q.setSelectionRange(n, n); } catch (e) { /* number inputs */ } } }
document.addEventListener('click', (e) => {
  const t = e.target.closest('button,a[data-go]'); if (!t || t.disabled) return; const d = t.dataset;
  if (d.guide != null) { const i = +d.guide; UI.guideStep = i; if (window.innerWidth <= 860) UI.guideOpen = false; GUIDE[i].run(); renderGuide(); return; }
  if (d.go) { go(d.go); return; }
  if (d.book) { UI.bk.sel = d.book; render(); if (window.innerWidth <= 1180) { const p = $('bkDetail'); if (p) p.scrollIntoView({ block: 'start' }); } return; }
  if (d.bkflt) { UI.bk.flt = UI.bk.flt === d.bkflt ? '' : d.bkflt; const L = BOOKS.filter(bkMatch); if (UI.bk.flt && L.length && !L.some((b) => b.id === UI.bk.sel)) UI.bk.sel = L[0].id; render(); return; }
  if (d.openbook) { Object.assign(UI.bk, { sel: d.openbook, flt: '', q: '', prop: '' }); go('ui01'); return; }
  if (d.rroom) { UI.rate.rooms[d.rroom] = !UI.rate.rooms[d.rroom]; rateDirty(); return; }
  if (d.rdate != null) { UI.rate.dates[d.rdate] = !UI.rate.dates[d.rdate]; rateDirty(); return; }
  if (d.rch) { UI.rate.chs[d.rch] = !UI.rate.chs[d.rch]; rateDirty(); return; }
  if (d.rplan) { UI.rate.plans[d.rplan] = !UI.rate.plans[d.rplan]; rateDirty(); return; }
  if (d.rq) { UI.rate.dates = {}; DAYS.forEach((x) => { if (d.rq === 'all' || (d.rq === 'weekend' && x.we) || (d.rq === 'weekday' && !x.we)) UI.rate.dates[x.i] = true; }); rateDirty(); return; }
  if (d.cardedit) { UI.fee.edit = d.cardedit; UI.fee.err = {}; render(); return; }
  if (d.cardsave) {
    const U = UI.fee, c = CFG[U.prop][d.cardsave][U.plan[d.cardsave] || '기본'], fv = $('eF').value, dv = $('eD').value;
    if (fv === '' || dv === '' || +fv < 0 || +fv > 40 || +dv < 0 || +dv > 50) { U.err = { card: '수수료는 0~40, 할인은 0~50 사이 숫자로 입력해 주세요.' }; render(); return; }
    withLoading('계산 조건 저장 중...', () => { c.fee = +fv; c.disc = +dv; c.payer = $('eP').value; c.src = '운영자 입력 (11-02)'; c.why = ''; c.short = ''; U.edit = null; U.err = {}; rateInvalidate(); toast(d.cardsave + ' 조건을 저장했습니다. 기존 미리보기는 무효화했습니다.'); render(); }, 380); return;
  }
  if (d.mprop != null) { UI.m.prop = d.mprop; render(); return; }
  if (d.mflt) { UI.m.flt = d.mflt; render(); return; }
  if (d.msg) { UI.m.sel = d.msg; UI.m.pane = 'thread'; render(); if (window.innerWidth <= 1180) { const p = $('msgDetail'); if (p) p.scrollIntoView({ block: 'start' }); } return; }
  if (d.retry) { const f = FAILS.find((x) => x.id === d.retry); f.st = 'busy'; render(); setTimeout(() => { f.st = 'gone'; toast(f.id + ' 재처리했습니다. 채널 반영을 확인했고 목록에서 뺐습니다.'); if (UI.view === 'sync') render(); }, 600); return; }
  if (d.rec) { const x = RECON.rows.find((r) => r.k === d.rec); withLoading(x.act === '보충' ? '빠진 예약 보충하는 중...' : '채널 기록과 맞추는 중...', () => { x.st = 'done'; toast(x.rsv + ' ' + (x.act === '보충' ? '예약을 보충했습니다.' : '재동기화했습니다.')); render(); }, 480); return; }
  if (d.autostop) { const on = !AUTO.stop; withLoading(on ? '자동발송을 전체 중지하는 중...' : '자동발송 중지를 푸는 중...', () => { AUTO.stop = on; AUTO.log.unshift(['11-02 ' + hm(NOW), on ? '자동발송 전체 중지' : '자동발송 전체 중지 해제']); toast(on ? '자동발송을 모두 멈췄습니다.' : '전체 중지를 풀었습니다.'); render(); }, 420); return; }
  if (d.autotype) { const x = AUTO.types.find((y) => y.t === d.autotype), on = !x.on; withLoading('자동발송 설정 저장 중...', () => { x.on = on; AUTO.log.unshift(['11-02 ' + hm(NOW), x.t + ' 자동발송 ' + (on ? '켬 (' + x.d + '일 연속 무보정 확인)' : '끔')]); toast(x.t + ' 자동발송을 ' + (on ? '켰습니다.' : '껐습니다.')); render(); }, 420); return; }
  if (d.autochan) { const c = d.autochan; AUTO.chan[c] = !AUTO.chan[c]; AUTO.log.unshift(['11-02 ' + hm(NOW), c + ' 자동발송 ' + (AUTO.chan[c] ? '허용' : '차단')]); render(); return; }
  switch (d.act) {
    case 'menu': UI.menu = !UI.menu; renderShell(); return;
    case 'toggleGuide': UI.guideOpen = !UI.guideOpen; renderGuide(); return;
    case 'bkClear': Object.assign(UI.bk, { q: '', flt: '', prop: '' }); render(); return;
    case 'bkRequery': { const b = BOOKS.find((x) => x.id === UI.bk.sel); withLoading('Channex 원본 재조회 중...', () => { b.chk = NOW; if (b.orig && b.st === '확인 필요') { b.req = true; b.hist.unshift([hm(NOW), '원본 재조회: 불일치 확인 (' + b.why + ')']); toast('원본과 다른 값이 있습니다. 확인 후 복구해 주세요.', 'bad'); } else { b.hist.unshift([hm(NOW), '원본 재조회: 일치']); toast('원본과 일치합니다.'); } render(); }, 480); return; }
    case 'bkRestore': { const b = BOOKS.find((x) => x.id === UI.bk.sel); withLoading('원본 기준으로 복구 중...', () => { b.e = b.orig.e; b.amt = b.orig.amt; b.st = '확정'; b.chx = '일치'; b.plat = '반영 확인'; b.req = false; b.chk = NOW; b.hist.unshift([hm(NOW), '원본 기준 복구 완료: 퇴실 ' + dLabel(b.e) + ', 금액 ' + won(b.amt)]); toast('예약을 원본 기준으로 복구했고 이력을 남겼습니다.'); render(); }, 520); return; }
    case 'bkCancel': { const b = BOOKS.find((x) => x.id === UI.bk.sel); withLoading('취소 알림 저장 후 ACK, 재고 반영 중...', () => { b.st = '취소'; b.chk = NOW; b.hist.unshift([hm(NOW), '취소 수신·저장 후 ACK. ' + dLabel(b.s) + '~' + dLabel(b.e - 1) + ' 판매 재개']); toast('취소 구간만 판매 가능으로 바꿨습니다.'); render(); }, 560); return; }
    case 'bkMsg': { const m = MSGS.find((x) => x.rsv === UI.bk.sel); if (m) { Object.assign(UI.m, { sel: m.id, flt: 'all', prop: '', q: '', pane: 'thread' }); go('ui04'); } else toast('이 예약에 연결된 대화가 없습니다.'); return; }
    case 'feeSave': {
      const U = UI.fee, e = {};
      ['wd', 'we'].forEach((k) => { const v = +mainVal(k); if (!(v >= 10000 && v <= 5000000)) e[k] = '10,000~5,000,000원으로 입력해 주세요.'; });
      U.err = e; if (Object.keys(e).length) { render(); toast('입력 내용을 확인해 주세요.', 'bad'); return; }
      withLoading('기본 요금 저장 중...', () => { U.wd = +mainVal('wd'); U.we = +mainVal('we'); U.saved = '11-02 ' + hm(NOW); rateInvalidate(); toast('내부에 저장했습니다. 외부 전송은 요금 일괄 변경에서 합니다.'); render(); }, 420); return;
    }
    case 'cardCancel': UI.fee.edit = null; UI.fee.err = {}; render(); return;
    case 'ratePreview': withLoading('플랫폼별 가격 계산 중...', () => { const ok = makePreview(); toast(ok ? '계산했습니다. 아직 전송되지 않았습니다.' : '입력 내용을 확인해 주세요.', ok ? '' : 'bad'); render(); }, 420); return;
    case 'rateSend': rateSend(); return;
    case 'rateRetry': { const run = UI.rate.run, fr = run.rows.filter((x) => x.st.includes('fail')); fr.forEach((x) => { x.tries++; x.plan2 = null; x.why = ''; x.st = ['ok', '', '', '']; }); run.state = 'running'; render(); runResume(run, fr); return; }
    case 'rateRecheck': { const run = UI.rate.run, fr = run.rows.filter((x) => x.st.includes('chk')); withLoading('Channex 재조회 후 판정 중...', () => { fr.forEach((x) => { x.st = ['ok', 'ok', 'ok', 'ok']; x.why = '재조회로 접수 확인. 다시 보내지 않음'; }); logRun(run); toast(fr.length + '항목을 재조회로 확인했습니다. 다시 보내지 않았습니다.'); render(); }, 480); return; }
    case 'rateAlt': { const run = UI.rate.run, fr = run.rows.filter((x) => x.st.includes('need')); withLoading('대체 검증 기록 중...', () => { fr.forEach((x) => { x.st = ['ok', 'ok', 'ok', 'ok']; x.why = '플랫폼 관리 화면 대조로 대체 검증 (' + hm(NOW) + ')'; }); logRun(run); toast('사유와 대체 검증을 기록했습니다.'); render(); }, 420); return; }
    case 'mRsv': UI.m.showRsv = !UI.m.showRsv; render(); return;
    case 'mBack': UI.m.pane = 'list'; render(); return;
    case 'msgCheck': { const m = MSGS.find((x) => x.id === UI.m.sel); withLoading('예약·숙소 안내와 대조하는 중...', () => { m.checked = true; m.chkAt = NOW; const b = mism(m).length; m.log.push([hm(NOW), '근거 재대조: ' + (b ? '불일치 ' + b + '건' : '모두 일치')]); toast(b ? '아직 다른 값이 ' + b + '건 있어 발송할 수 없습니다.' : '모든 값이 일치합니다. 발송할 수 있습니다.', b ? 'bad' : ''); render(); }, 460); return; }
    case 'msgHand': { const m = MSGS.find((x) => x.id === UI.m.sel); m.state = 'handed'; m.log.push([hm(NOW), '운영자 확인으로 이관']); toast('운영자 확인으로 넘겼습니다.'); render(); return; }
    case 'msgSend': { const m = MSGS.find((x) => x.id === UI.m.sel); withLoading('발송 중...', () => { m.state = 'sent'; m.sentAt = NOW; m.log.push([hm(NOW), '검토 후 발송 완료, ' + (m.edited ? '운영자 수정 있음' : '수정 없음')]); const tt = AUTO.types.find((x) => x.t === m.type); if (tt && m.edited && !m.noBasis) { tt.d = 0; tt.e++; tt.on = false; AUTO.log.unshift(['11-02 ' + hm(NOW), m.type + ' 초안을 운영자가 고쳐 보내 연속 일수를 0일로 되돌림 (' + m.id + ')']); } toast(m.guest + '님께 보냈습니다. (시연에서는 실제로 보내지 않음)'); render(); }, 460); return; }
    case 'msgRetry': { const m = MSGS.find((x) => x.id === UI.m.sel); withLoading('같은 메시지 번호로 다시 보내는 중...', () => { m.state = 'sent'; m.sentAt = NOW; m.log.push([hm(NOW), '재발송 완료. 중복 발송 없음']); toast('다시 보냈습니다.'); render(); }, 460); return; }
    case 'check': withLoading('4채널 상태 점검하는 중...', () => { NOW++; ['플랫폼 A', '플랫폼 B', '플랫폼 D'].forEach((c) => { CHS[c].last = NOW; }); const off = CHS['플랫폼 C'].hook === '비활성'; toast('점검했습니다. ' + (off ? '플랫폼 C 웹훅이 아직 비활성입니다.' : '4채널 모두 정상입니다.'), off ? 'bad' : ''); render(); }, 520); return;
    case 'hookOn': withLoading('플랫폼 C 웹훅 다시 켜는 중...', () => { CHS['플랫폼 C'].hook = '정상'; CHS['플랫폼 C'].last = NOW; toast('플랫폼 C 웹훅을 다시 켰습니다. 꺼져 있던 동안의 예약은 기록 대조에서 보충하세요.'); render(); }, 520); return;
  }
});
document.addEventListener('input', (e) => {
  const i = e.target, d = i.dataset;
  if (d.bkq != null) { UI.bk.q = i.value; clearTimeout(UI.qT); UI.qT = setTimeout(() => { render(); refocus('bkQ'); }, 250); return; }
  if (d.mq != null) { UI.m.q = i.value; clearTimeout(UI.qT); UI.qT = setTimeout(() => { render(); refocus('mQ'); }, 250); return; }
  if (d.draft) { const m = MSGS.find((x) => x.id === d.draft); if (!m.edited) m.log.push([hm(NOW), '운영자 수정']); m.draft = i.value; m.edited = true; m.checked = !!m.noBasis; clearTimeout(UI.dT); UI.dT = setTimeout(() => { render(); refocus('dr'); }, 200); }
});
document.addEventListener('change', (e) => {
  const i = e.target, d = i.dataset;
  if (d.bkprop) { UI.bk.prop = i.value; withLoading('조회 중...', render, 300); return; }
  if (d.feeprop) { UI.fee.prop = i.value; UI.fee.edit = null; withLoading('조회 중...', render, 300); return; }
  if (d.cardplan) { UI.fee.plan[d.cardplan] = i.value; render(); }
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && UI.menu) { UI.menu = false; renderShell(); } });
window.addEventListener('hashchange', route);
makePreview();
route();
})();
