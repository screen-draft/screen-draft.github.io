(function () {
'use strict';

/* ---------- icons (one inline SVG set) ---------- */
var P = {
  file: '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5M8 13h8M8 17h6"/>',
  shield: '<path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  alert: '<path d="M12 4L2.5 20h19z"/><path d="M12 10v4.5M12 17.5h.01"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  users: '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.6-3 2.8-4.6 5.5-4.6s4.9 1.6 5.5 4.6"/><path d="M16 5.2a3 3 0 0 1 0 5.6M17.5 14.6c1.6.6 2.7 2 3 4.4"/>',
  minus: '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.6-3 2.8-4.6 5.5-4.6s4.9 1.6 5.5 4.6M16 11h5"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0-2 2z"/><path d="M4 20a2 2 0 0 0 2 1h13v-3"/>',
  clip: '<rect x="5" y="4" width="14" height="17" rx="1"/><path d="M9 4V3h6v1M8.5 10h7M8.5 14h7M8.5 18h4"/>',
  wrench: '<path d="M14.5 6.5a4 4 0 0 0 5 5l-8.5 8.5a2.1 2.1 0 0 1-3-3L16.5 8.5"/><path d="M14.5 6.5a4 4 0 0 1 5-3l-2.5 2.5.5 2 2 .5 2.5-2.5"/>',
  grid: '<rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="4"/><rect x="13" y="10" width="7" height="10"/><rect x="4" y="13" width="7" height="7"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/>',
  camera: '<path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  pin: '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
  right: '<path d="M9 5l7 7-7 7"/>',
  left: '<path d="M15 5l-7 7 7 7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  trash: '<path d="M4.5 7h15M10 7V4.5h4V7M6.5 7l1 13h9l1-13M10.5 11v6M13.5 11v6"/>',
  play: '<path d="M8 5.5v13l10.5-6.5z"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="1"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>',
  help: '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.5a2.5 2.5 0 0 1 4.8 1c0 1.7-2.4 2-2.4 3.5M12 17h.01"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>',
  refresh: '<path d="M19.5 8A8 8 0 0 0 5 7.5M4.5 16A8 8 0 0 0 19 16.5"/><path d="M19.5 3.5V8H15M4.5 20.5V16H9"/>',
  inbox: '<path d="M3.5 13.5l2.5-8h12l2.5 8V19H3.5z"/><path d="M3.5 13.5h5l1.5 2.5h4l1.5-2.5h5"/>',
  hist: '<path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.6"/><path d="M4 4v4.6h4.6M12 8v4.5l3 1.8"/>',
  send: '<path d="M4 12l16-8-6 16-2.5-6.5z"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="1"/>'
};
function ic(n) { return '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">' + (P[n] || '') + '</svg>'; }

/* ---------- helpers ---------- */
function $(s) { return document.querySelector(s); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function mins(t) { var a = t.split(':'); return +a[0] * 60 + +a[1]; }
var TODAY = '2026-11-25', NOWM = mins('13:40');
var clockM = NOWM;
function stamp() { clockM += 2; var h = Math.floor(clockM / 60), m = clockM % 60; return '11-25 ' + (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m; }
function dayDiff(d) { return Math.round((new Date(d + 'T00:00:00') - new Date(TODAY + 'T00:00:00')) / 86400000); }
function lb(c, t, i) { return '<span class="lb lb-' + c + '">' + (i ? ic(i) : '') + esc(t) + '</span>'; }
function wide() { return window.matchMedia('(min-width: 861px)').matches; }
function addDays(n) { var d = new Date(TODAY + 'T00:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }

/* ---------- master data (all fictional) ---------- */
var TR = { basic: '기초안전보건교육', hot: '화기작업 특별교육', height: '고소작업 특별교육', conf: '밀폐공간 특별교육', gas: '산소·유해가스 측정교육', rig: '줄걸이·신호수 교육' };
var TR_ORDER = ['basic', 'hot', 'height', 'conf', 'gas', 'rig'];
var PEOPLE = { worker: '최○○(솔목기공 작업책임자)', safety: '문○○(안전관리자)', admin: '백○○(관리자)' };
var ROLE_NAME = { worker: '협력사 작업책임자', safety: '안전관리자', admin: '관리자' };
var MY_CO = '솔목기공';
var SITES = ['1야드', '2야드', '도장공장'];
var PROJECTS = ['H-2481 원유운반선', 'H-2507 컨테이너선'];
var COS = ['솔목기공', '누리배관', '다온도장', '가온전기'];
var CO_TYPES = { '솔목기공': ['hot', 'conf'], '누리배관': ['hot'], '다온도장': ['height'], '가온전기': ['height'] };

function mkTypes() {
  return [
    { id: 'hot', name: '화기', on: true, req: ['basic', 'hot'],
      check: ['작업 반경 11m 내 가연물 제거·방호', '소화기 2대 이상 비치', '화재감시자 배치', '불티 비산 방지포 설치', '가연성 가스 측정(LEL 10% 미만)'],
      close: ['잔불 확인(작업 종료 30분 후)', '소화기 회수', '불티 방지포·용접기 정리', '화재감시자 철수 확인'] },
    { id: 'height', name: '고소', on: true, req: ['basic', 'height'],
      check: ['안전대 부착설비 확인', '작업발판·안전난간 상태 확인', '하부 출입통제 구역 설정', '고소작업대 작업 전 점검'],
      close: ['낙하 위험 공구·자재 정리', '하부 출입통제 해제', '작업발판 이상 유무 기록'] },
    { id: 'conf', name: '밀폐', on: true, req: ['basic', 'conf', 'gas'],
      check: ['작업 전 산소·유해가스 측정(산소 18~23.5%)', '강제환기 설비 가동', '감시인 배치·연락수단 확보', '구조장비(송기마스크·구명줄) 비치', '출입 인원 명부 작성'],
      close: ['내부 잔류 인원 확인(명부 대조)', '장비·공구 반출 확인', '맨홀 폐쇄·출입금지 표지', '환기설비 정지 기록'] },
    { id: 'lift', name: '중량물', on: true, req: ['basic', 'rig'],
      check: ['인양물 중량·무게중심 확인', '줄걸이 용구 점검', '신호수 배치·신호 방법 확인', '인양 경로 하부 출입통제'],
      close: ['인양물 고정 상태 확인', '줄걸이 용구 회수·점검', '통제구역 해제'] }
  ];
}

var S = {
  role: 'worker', screen: null,
  settings: { types: mkTypes(), steps: ['협력사 작업책임자 신청', '안전관리자 검토·승인'] },
  draft: null, setType: 'conf', setNew: { type: '', step: '', check: '', close: '' },
  workers: [
    { id: 'W-2101', name: '김○○', co: '솔목기공', job: '용접', tr: { basic: '2027-05-14', hot: '2027-02-03', conf: '2027-01-18', gas: '2027-01-18' } },
    { id: 'W-2102', name: '이○○', co: '솔목기공', job: '용접', tr: { basic: '2027-04-02', hot: '2026-12-30', conf: '2026-11-10', gas: '2027-02-11' } },
    { id: 'W-2103', name: '박○○', co: '솔목기공', job: '감시인', tr: { basic: '2027-06-01', hot: '2027-03-20', conf: '2027-03-20', gas: '2027-03-20' } },
    { id: 'W-2104', name: '정○○', co: '솔목기공', job: '취부', tr: { basic: '2027-02-27', hot: '2027-01-09', conf: '2026-12-09', gas: '2026-12-09' } },
    { id: 'W-2105', name: '한○○', co: '솔목기공', job: '사상', tr: { basic: '2027-01-30', conf: '2027-04-15', gas: '2027-04-15', rig: '2027-02-01' } },
    { id: 'W-3101', name: '윤○○', co: '누리배관', job: '배관 용접', tr: { basic: '2027-03-03', hot: '2027-03-03' } },
    { id: 'W-3102', name: '장○○', co: '누리배관', job: '배관 취부', tr: { basic: '2027-01-15', hot: '2026-11-30' } },
    { id: 'W-3103', name: '임○○', co: '누리배관', job: '배관 용접', tr: { basic: '2026-11-02', hot: '2027-02-20' } },
    { id: 'W-4101', name: '강○○', co: '다온도장', job: '도장', tr: { basic: '2027-04-11', height: '2027-04-11' } },
    { id: 'W-4102', name: '조○○', co: '다온도장', job: '도장', tr: { basic: '2027-02-08', height: '2026-11-19' } },
    { id: 'W-4103', name: '서○○', co: '다온도장', job: '비계', tr: { basic: '2027-05-20' } },
    { id: 'W-5101', name: '오○○', co: '가온전기', job: '전기', tr: { basic: '2027-06-30', height: '2027-06-30' } },
    { id: 'W-5102', name: '신○○', co: '가온전기', job: '전기', tr: { basic: '2026-12-12', height: '2027-01-25' } }
  ],
  tasks: [
    { id: 'T-1', title: '2번 밸러스트탱크 내부 용접 보수', project: PROJECTS[0], site: '2야드', zone: 'B-12 블록', start: '14:00', end: '18:00', hint: 'conf', crew: ['W-2101', 'W-2102', 'W-2103', 'W-2104'],
      ws: { id: 'WS-0412', name: '탱크 내부 용접 보수 작업표준서', rev: '개정 3', steps: ['맨홀 개방 후 30분 이상 강제환기', '산소·유해가스 측정 후 출입', '감시인 맨홀 상주, 10분 간격 교신', '용접 후 잔류 가스·불티 확인 후 퇴출'] },
      ra: { id: 'RA-1187', date: '11-24', rows: [['산소결핍·유해가스 흡입', '상', '작업 전·중 가스측정, 강제환기 유지'], ['용접 흄 노출', '중', '국소배기, 방진마스크 착용'], ['불티에 의한 화재', '중', '방염포 설치, 소화기 비치'], ['협소 공간 전도·협착', '하', '조명 확보, 통로 정리']] } },
    { id: 'T-2', title: '선미 블록 의장품 취부 용접', project: PROJECTS[1], site: '1야드', zone: 'A-06 정반', start: '08:00', end: '15:00', hint: 'hot', crew: ['W-2101', 'W-2104'],
      ws: { id: 'WS-0310', name: '의장품 취부 용접 작업표준서', rev: '개정 5', steps: ['취부 위치 마킹 확인', '가접 후 치수 검사', '본용접·사상'] },
      ra: { id: 'RA-1179', date: '11-23', rows: [['불티에 의한 화재', '중', '방염포, 소화기 비치'], ['아크 광선 노출', '하', '차광막 설치']] } },
    { id: 'T-3', title: '탑재 블록 줄걸이 이동', project: PROJECTS[1], site: '1야드', zone: '골리앗 3호 구역', start: '16:00', end: '18:00', hint: 'lift', crew: ['W-2105', 'W-2103'],
      ws: { id: 'WS-0233', name: '블록 인양·이동 작업표준서', rev: '개정 2', steps: ['인양 계획서·중량 확인', '줄걸이 각도 60도 이내', '신호수 1인 지정 후 인양'] },
      ra: { id: 'RA-1190', date: '11-25', rows: [['인양물 낙하', '상', '하부 출입통제, 줄걸이 점검'], ['협착', '중', '유도로프 사용']] } },
    { id: 'T-4', title: '연료유 탱크 내부 점검', project: PROJECTS[0], site: '2야드', zone: '기관실 하부', start: '10:00', end: '12:00', hint: 'conf', crew: ['W-2101', 'W-2103'],
      ws: { id: 'WS-0418', name: '탱크 내부 점검 작업표준서', rev: '개정 1', steps: ['잔류 유류 제거 확인', '환기 후 가스측정', '2인 1조 출입'] },
      ra: { id: 'RA-1176', date: '11-22', rows: [['유해가스 흡입', '상', '측정 후 출입, 송기마스크'], ['미끄러짐', '중', '유류 제거, 미끄럼 방지화']] } }
  ],
  permits: [],
  ncs: [],
  inspections: [
    { id: 'IN-1124-02', site: '2야드', by: '문○○', at: '11-24 10:20', items: 6, bad: 2 },
    { id: 'IN-1124-01', site: '1야드', by: '문○○', at: '11-24 09:05', items: 6, bad: 1 }
  ],
  checklists: {
    '1야드': ['통로·개구부 덮개 고정', '정반 주변 가스호스 정리·역화방지기', '소화기 비치·압력 상태', '용접기 접지·전선 피복', '크레인 인양 구역 출입통제', '작업장 조명·정리정돈'],
    '2야드': ['통로·개구부 덮개 고정', '비계 발판·안전난간 상태', '소화기 비치·압력 상태', '가스용기 고정·역화방지기', '밀폐공간 출입 표지·명부', '전선 피복·접지'],
    '도장공장': ['도장 부스 환기설비 가동', '유기용제 보관·용기 밀폐', '방폭 조명·전기설비', '정전기 접지', '보호구(방독마스크) 착용', '소화설비 상태']
  },
  form: null, sel: {}, filt: { list: '전체', act: '전체', trCo: '전체' }, dash: { site: '전체', project: '전체', co: '전체' },
  insp: null, rejText: '', rejErr: false, ncDraft: {}, guideOpen: true, gIdx: -1
};

function P_(id, o) { o.id = id; return o; }
S.permits = [
  P_('P-2611-027', { title: '선실 천장 케이블 트레이 포설', type: 'height', co: '가온전기', site: '2야드', zone: 'C-03 거주구', project: PROJECTS[0], start: '07:00', end: '12:00', status: '승인', workers: ['W-5101', 'W-5102'], ws: 'WS-0521', ra: 'RA-1170', approvals: 1, applicant: '오○○(가온전기 작업책임자)',
    hist: [['11-25 06:20', '오○○(가온전기 작업책임자)', '허가 신청'], ['11-25 06:41', '문○○(안전관리자)', '검토 시작'], ['11-25 06:52', '문○○(안전관리자)', '승인'], ['11-25 07:05', '오○○(가온전기 작업책임자)', '작업 시작'], ['11-25 12:00', '시스템', '유효기간 만료']] }),
  P_('P-2611-028', { title: '블록 반전 인양', type: 'lift', co: '솔목기공', site: '1야드', zone: '골리앗 3호 구역', project: PROJECTS[1], start: '08:00', end: '11:30', status: '종료', workers: ['W-2105', 'W-2103'], ws: 'WS-0233', ra: 'RA-1168', approvals: 1, applicant: PEOPLE.worker,
    hist: [['11-25 07:10', PEOPLE.worker, '허가 신청'], ['11-25 07:30', '문○○(안전관리자)', '승인'], ['11-25 08:02', PEOPLE.worker, '작업 시작'], ['11-25 11:34', PEOPLE.worker, '종료 확인 3/3, 허가 종료']] }),
  P_('P-2611-029', { taskId: 'T-4', title: '연료유 탱크 내부 점검', type: 'conf', co: '솔목기공', site: '2야드', zone: '기관실 하부', project: PROJECTS[0], start: '10:00', end: '12:00', status: '반려', workers: ['W-2101', 'W-2103'], ws: 'WS-0418', ra: 'RA-1176', approvals: 0, applicant: PEOPLE.worker,
    reject: '산소·유해가스 측정 시점과 측정자가 비어 있습니다. 측정 계획을 채워 다시 신청하세요.',
    hist: [['11-25 08:40', PEOPLE.worker, '허가 신청'], ['11-25 09:05', '문○○(안전관리자)', '반려 — 측정 계획 누락']] }),
  P_('P-2611-030', { title: '블록 외판 도장(스프레이)', type: 'height', co: '다온도장', site: '2야드', zone: 'B-12 블록', project: PROJECTS[0], start: '13:00', end: '18:00', status: '승인', workers: ['W-4101', 'W-4103'], ws: 'WS-0605', ra: 'RA-1183', approvals: 1, applicant: '강○○(다온도장 작업책임자)', painting: true,
    hist: [['11-25 11:20', '강○○(다온도장 작업책임자)', '허가 신청'], ['11-25 12:10', '문○○(안전관리자)', '승인']] }),
  P_('P-2611-031', { taskId: 'T-2', title: '선미 블록 의장품 취부 용접', type: 'hot', co: '솔목기공', site: '1야드', zone: 'A-06 정반', project: PROJECTS[1], start: '08:00', end: '15:00', status: '작업 중', workers: ['W-2101', 'W-2104'], ws: 'WS-0310', ra: 'RA-1179', approvals: 1, applicant: PEOPLE.worker,
    hist: [['11-25 07:15', PEOPLE.worker, '허가 신청'], ['11-25 07:40', '문○○(안전관리자)', '승인'], ['11-25 08:03', PEOPLE.worker, '작업 시작']] }),
  P_('P-2611-032', { title: '의장 배관 플랜지 용접', type: 'hot', co: '누리배관', site: '1야드', zone: 'A-04 의장장', project: PROJECTS[1], start: '14:30', end: '17:30', status: '신청', workers: ['W-3101'], ws: 'WS-0344', ra: 'RA-1188', approvals: 0, applicant: '윤○○(누리배관 작업책임자)',
    hist: [['11-25 13:12', '윤○○(누리배관 작업책임자)', '허가 신청']] })
];
var permitSeq = 33;

S.ncs = [
  { id: 'NC-2611-012', site: '1야드', project: PROJECTS[1], co: '솔목기공', loc: 'A-06 정반 용접기 3번', content: '용접기 접지선 피복 손상', due: '2026-11-22', assignee: '김○○', status: '완료', photos: 1,
    hist: [['11-20 09:10', '문○○(안전관리자)', '부적합 등록'], ['11-20 09:30', '문○○(안전관리자)', '담당 김○○, 기한 11-22'], ['11-21 15:00', PEOPLE.worker, '조치 완료 보고 — 접지선 교체'], ['11-21 16:20', '문○○(안전관리자)', '완료 확인']] },
  { id: 'NC-2611-013', site: '2야드', project: PROJECTS[0], co: '가온전기', loc: 'C-03 거주구 3층 계단', content: '개구부 덮개 미고정', due: '2026-11-23', assignee: '오○○', status: '조치 중', photos: 1,
    hist: [['11-21 10:00', '문○○(안전관리자)', '부적합 등록'], ['11-21 10:15', '문○○(안전관리자)', '담당 오○○, 기한 11-23']] },
  { id: 'NC-2611-014', site: '2야드', project: PROJECTS[0], co: '다온도장', loc: 'B-12 블록 외판 비계 3단', content: '비계 발판 고정 핀 누락 2곳', due: '2026-11-24', assignee: '서○○', status: '조치 중', photos: 2,
    hist: [['11-24 10:20', '문○○(안전관리자)', '부적합 등록(정기점검 IN-1124-02)'], ['11-24 10:40', '문○○(안전관리자)', '담당 서○○, 기한 11-24']] },
  { id: 'NC-2611-015', site: '1야드', project: PROJECTS[1], co: '누리배관', loc: 'A-04 의장장 출입구', content: '소화기 2대 압력 미달', due: '2026-11-27', assignee: '윤○○', status: '완료 확인 대기', photos: 1,
    hist: [['11-24 09:05', '문○○(안전관리자)', '부적합 등록(정기점검 IN-1124-01)'], ['11-24 09:20', '문○○(안전관리자)', '담당 윤○○, 기한 11-27'], ['11-25 11:10', '윤○○(누리배관 작업책임자)', '조치 완료 보고 — 소화기 2대 교체']] },
  { id: 'NC-2611-016', site: '2야드', project: PROJECTS[0], co: '다온도장', loc: 'B-12 블록 하부 통로', content: '도료 용기 통로 적치, 뚜껑 개방', due: '', assignee: '', status: '대기', photos: 1,
    hist: [['11-24 10:22', '문○○(안전관리자)', '부적합 등록(정기점검 IN-1124-02)']] }
];
var ncSeq = 17;

/* ---------- derived ---------- */
function T(id) { for (var i = 0; i < S.settings.types.length; i++) if (S.settings.types[i].id === id) return S.settings.types[i]; return null; }
function W(id) { for (var i = 0; i < S.workers.length; i++) if (S.workers[i].id === id) return S.workers[i]; return null; }
function PM(id) { for (var i = 0; i < S.permits.length; i++) if (S.permits[i].id === id) return S.permits[i]; return null; }
function NC(id) { for (var i = 0; i < S.ncs.length; i++) if (S.ncs[i].id === id) return S.ncs[i]; return null; }
function TK(id) { for (var i = 0; i < S.tasks.length; i++) if (S.tasks[i].id === id) return S.tasks[i]; return null; }

function trState(exp) {
  if (!exp) return { k: 'none', t: '미이수', c: 'bad' };
  var d = dayDiff(exp);
  if (d < 0) return { k: 'exp', t: '만료', c: 'bad' };
  if (d <= 30) return { k: 'soon', t: '만료 임박 D-' + d, c: 'warn' };
  return { k: 'ok', t: '유효', c: 'ok' };
}
function unmet(w, typeId) {
  var t = T(typeId); if (!t) return [];
  return t.req.filter(function (r) { var s = trState(w.tr[r]); return s.k === 'exp' || s.k === 'none'; })
    .map(function (r) { var s = trState(w.tr[r]); return TR[r] + ' ' + s.t + (w.tr[r] ? '(' + w.tr[r] + ')' : ''); });
}
function soonOf(w, typeId) {
  var t = T(typeId); if (!t) return [];
  return t.req.filter(function (r) { return trState(w.tr[r]).k === 'soon'; }).map(function (r) { return TR[r] + ' ' + trState(w.tr[r]).t; });
}
function workerUnmetAny(w) {
  var bad = false;
  (CO_TYPES[w.co] || []).forEach(function (tp) { if (unmet(w, tp).length) bad = true; });
  return bad;
}
function overdue(n) { return n.status !== '완료' && n.due && dayDiff(n.due) < 0; }
function overlap(a, b) { return mins(a.start) < mins(b.end) && mins(b.start) < mins(a.end); }
function interference(p) {
  var out = [];
  S.permits.forEach(function (o) {
    if (o.id === p.id || o.status === '종료' || o.status === '반려') return;
    if (o.site !== p.site || o.zone !== p.zone || !overlap(o, p)) return;
    var fire = function (x) { return x.type === 'hot' || x.type === 'conf'; };
    if ((o.painting && fire(p)) || (p.painting && fire(o))) {
      out.push({ o: o, msg: '같은 구역(' + p.site + ' ' + p.zone + ')·같은 시간대(' + o.start + '~' + o.end + ')에 도장 작업 허가 ' + o.id + '(' + o.co + ', ' + o.title + ', ' + o.status + ')가 있습니다. 유기용제 증기와 ' + T(p.type).name + ' 작업이 겹쳐 화재·질식 위험이 있습니다.' });
    } else if (fire(o) && fire(p)) {
      out.push({ o: o, msg: '같은 구역·시간대에 ' + T(o.type).name + ' 작업 허가 ' + o.id + '(' + o.co + ')가 있습니다.' });
    }
  });
  return out;
}
function validity(p) {
  if (p.status === '승인' || p.status === '작업 중') {
    var left = mins(p.end) - NOWM;
    if (left <= 0) return lb('bad', '유효기간 만료(' + p.end + ')', 'alert');
    if (left <= 120) return lb('warn', '만료 임박 ' + Math.floor(left / 60) + '시간 ' + (left % 60) + '분 남음', 'clock');
    return lb('plain', '~' + p.end + ' 유효');
  }
  if (p.status === '종료') return lb('plain', '종료됨');
  if (p.status === '반려') return lb('plain', '재신청 가능');
  return lb('plain', p.start + '~' + p.end + ' 예정');
}
function expired(p) { return (p.status === '승인' || p.status === '작업 중') && mins(p.end) <= NOWM; }
var ST_C = { '신청': 'info', '검토 중': 'info', '승인': 'ok', '작업 중': 'ok', '종료': 'plain', '반려': 'bad' };
var ST_I = { '신청': 'send', '검토 중': 'eye', '승인': 'check', '작업 중': 'play', '종료': 'stop', '반려': 'x' };
function stLb(s) { return lb(ST_C[s], s, ST_I[s]); }
var NC_C = { '대기': 'info', '조치 중': 'warn', '완료 확인 대기': 'info', '완료': 'ok' };
function ncLb(n) { return lb(NC_C[n.status], n.status) + (overdue(n) ? ' ' + lb('bad', '기한 초과 ' + (-dayDiff(n.due)) + '일', 'alert') : ''); }
function typeLb(id) { var t = T(id); return lb('plain', (t ? t.name : id) + ' 작업'); }

/* ---------- menu ---------- */
var MENU = [
  { g: '작업허가' },
  { id: 'apply', t: '작업허가 신청', i: 'file', r: ['worker', 'admin'] },
  { id: 'review', t: '허가 검토', i: 'shield', r: ['safety', 'admin'] },
  { id: 'list', t: '허가 목록·상태', i: 'list', r: ['worker', 'safety', 'admin'] },
  { id: 'close', t: '허가 종료', i: 'stop', r: ['worker', 'safety', 'admin'] },
  { g: '교육·점검' },
  { id: 'training', t: '교육·자격', i: 'book', r: ['worker', 'safety', 'admin'] },
  { id: 'inspect', t: '안전점검', i: 'clip', r: ['worker', 'safety', 'admin'] },
  { id: 'action', t: '시정조치', i: 'wrench', r: ['worker', 'safety', 'admin'] },
  { g: '현황·운영' },
  { id: 'dash', t: 'HSE 대시보드', i: 'grid', r: ['safety', 'admin'] },
  { id: 'settings', t: '설정', i: 'gear', r: ['admin'] }
];
function allowed(id) { for (var i = 0; i < MENU.length; i++) if (MENU[i].id === id) return MENU[i].r.indexOf(S.role) >= 0; return false; }
function defaultScreen() {
  if (S.role === 'worker') return wide() ? 'apply' : 'list';
  if (S.role === 'safety') return wide() ? 'review' : 'list';
  return 'dash';
}
function badge(id) {
  if (id === 'review') { var n = S.permits.filter(function (p) { return p.status === '신청' || p.status === '검토 중'; }).length; return n ? n + '건' : ''; }
  if (id === 'action') { var m = S.ncs.filter(overdue).length; return m ? '초과 ' + m : ''; }
  if (id === 'apply') { var r = S.permits.filter(function (p) { return p.status === '반려' && p.co === MY_CO; }).length; return r ? '반려 ' + r : ''; }
  return '';
}
function renderNav() {
  $('#nav').innerHTML = MENU.map(function (m, i) {
    if (m.g) { var any = false; for (var j = i + 1; j < MENU.length && !MENU[j].g; j++) if (MENU[j].r.indexOf(S.role) >= 0) any = true; return any ? '<div class="grp">' + m.g + '</div>' : ''; }
    if (m.r.indexOf(S.role) < 0) return '';
    var b = badge(m.id);
    return '<button type="button" data-act="go" data-id="' + m.id + '"' + (S.screen === m.id ? ' aria-current="page"' : '') + '>' + ic(m.i) + '<span>' + m.t + '</span>' + (b ? '<span class="cnt">' + b + '</span>' : '') + '</button>';
  }).join('');
  document.querySelectorAll('.roles button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.id === S.role ? 'true' : 'false'); });
}

/* ---------- busy / toast ---------- */
var busyLock = false, toastTimer;
function run(text, fn, done) {
  if (busyLock) return;
  busyLock = true;
  $('#busyT').textContent = text; $('#busy').hidden = false;
  setTimeout(function () {
    var r = fn();
    $('#busy').hidden = true; busyLock = false;
    render();
    toast(typeof done === 'function' ? done(r) : done);
  }, 450);
}
function toast(msg) {
  if (!msg) return;
  var t = $('#toast'); t.innerHTML = ic(/미충족|반려했|보완/.test(msg) ? 'info' : 'check') + '<span>' + esc(msg) + '</span>'; t.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, 2600);
}
function empty(icon, title, text, btn, act, id) {
  return '<div class="empty">' + ic(icon) + '<b>' + esc(title) + '</b><span>' + esc(text) + '</span>' +
    (btn ? '<button type="button" class="btn" data-act="' + act + '"' + (id ? ' data-id="' + id + '"' : '') + '>' + esc(btn) + '</button>' : '') + '</div>';
}
function ph(title, sub, acts) { return '<div class="ph"><div><h1>' + title + '</h1>' + (sub ? '<p>' + sub + '</p>' : '') + '</div>' + (acts ? '<div class="ph-act">' + acts + '</div>' : '') + '</div>'; }
function histHtml(h) { return '<ol class="hist">' + h.slice().reverse().map(function (x) { return '<li><time>' + esc(x[0]) + '</time><div><b>' + esc(x[2]) + '</b><br><span class="muted small">' + esc(x[1]) + '</span></div></li>'; }).join('') + '</ol>'; }

/* ---------- 1. apply ---------- */
function newForm() { return { taskId: null, type: null, checks: [], workers: [], editingId: null, typing: false }; }
function blockReasons(f) {
  var r = [];
  if (!f.taskId) { r.push('작업일정에서 작업을 고르세요'); return r; }
  if (!f.type) { r.push('허가 유형을 고르세요'); return r; }
  var t = T(f.type), left = t.check.length - f.checks.filter(Boolean).length;
  if (left > 0) r.push('허가조건 ' + left + '개 미확인');
  if (!f.workers.length) r.push('투입 작업자를 1명 이상 고르세요');
  f.workers.forEach(function (id) { var w = W(id), u = unmet(w, f.type); if (u.length) r.push(w.name + '(' + w.id + '): ' + u.join(', ') + ' — 교육·자격 미충족'); });
  return r;
}
function rApply() {
  var f = S.form, h = '';
  h += ph('작업허가 신청', '작업일정에서 작업을 고르면 작업표준서·위험성평가가 붙고, 유형별 허가조건과 작업자 교육·자격을 확인한 뒤 신청합니다.');
  var rej = S.permits.filter(function (p) { return p.status === '반려' && p.co === MY_CO; });
  rej.forEach(function (p) {
    h += '<div class="al al-bad" data-rej="' + p.id + '">' + ic('x') + '<div><b>반려된 신청 ' + p.id + ' · ' + esc(p.title) + '</b>반려 사유: ' + esc(p.reject) +
      '<div class="mt"><button type="button" class="btn sm" data-act="resubmit" data-id="' + p.id + '">' + ic('refresh') + '수정 후 재신청</button></div></div></div>';
  });
  if (f.editingId) h += '<div class="al al-info">' + ic('info') + '<div><b>' + f.editingId + ' 재신청 작성 중</b>반려 사유를 반영해 고친 뒤 다시 신청합니다. 이전 이력은 같은 허가 번호에 남습니다.</div></div>';

  h += '<div class="grid2"><div>';
  // step 1 task
  h += '<section class="pn"><div class="pn-h"><h2><span class="step">1단계</span>작업일정에서 작업 선택</h2>' + lb('src', '기존 기능에서 가져옴 · 작업일정', 'refresh') + '</div><div class="pn-b flush"><div class="tw"><table class="t stk"><thead><tr><th></th><th>작업 · 프로젝트</th><th>구역</th><th>시간</th><th>허가</th></tr></thead><tbody>';
  S.tasks.forEach(function (t) {
    var pm = S.permits.filter(function (p) { return p.taskId === t.id && p.status !== '반려'; })[0];
    var rp = S.permits.filter(function (p) { return p.taskId === t.id && p.status === '반려'; })[0];
    var dis = !!pm && f.editingId !== (pm && pm.id);
    var on = f.taskId === t.id;
    h += '<tr class="' + (on ? 'sel ' : '') + (dis ? '' : 'click') + '"' + (dis ? '' : ' data-act="pickTask" data-id="' + t.id + '"') + '>' +
      '<td class="c hide-m">' + (on ? ic('check') : '') + '</td><td class="mtitle">' + esc(t.title) + '<br><span class="id">' + t.id + ' · ' + t.project + '</span></td><td data-l="구역" class="nw">' + t.site + ' ' + t.zone + '</td><td data-l="시간" class="nw">' + t.start + '~' + t.end + '</td><td data-l="허가">' +
      (pm ? stLb(pm.status) + ' <span class="id">' + pm.id + '</span>' : rp ? lb('bad', '반려됨 · 재신청 가능') : lb('warn', '허가 없음')) + '</td></tr>';
  });
  h += '</tbody></table></div></div></section>';

  if (f.taskId) {
    var t = TK(f.taskId);
    h += '<section class="pn" id="linked"><div class="pn-h"><h2><span class="step">2단계</span>연결된 작업표준서·위험성평가</h2>' + lb('src', '기존 기능에서 가져옴', 'refresh') + '</div><div class="pn-b"><div class="grid2h">' +
      '<div><div class="row"><b>' + ic('book') + ' ' + esc(t.ws.name) + '</b><span class="id">' + t.ws.id + ' · ' + t.ws.rev + '</span></div><ol class="ws-steps">' + t.ws.steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol></div>' +
      '<div><div class="row"><b>' + ic('alert') + ' AI 위험성평가 결과</b><span class="id">' + t.ra.id + ' · ' + t.ra.date + ' 평가, 안전관리자 확인</span></div><div class="tw mt"><table class="t"><thead><tr><th>위험요인</th><th>등급</th><th>감소대책</th></tr></thead><tbody>' +
      t.ra.rows.map(function (r) { return '<tr><td>' + esc(r[0]) + '</td><td class="nw">' + lb(r[1] === '상' ? 'bad' : r[1] === '중' ? 'warn' : 'plain', r[1]) + '</td><td>' + esc(r[2]) + '</td></tr>'; }).join('') + '</tbody></table></div></div>' +
      '</div></div></section>';

    h += '<section class="pn"><div class="pn-h"><h2><span class="step">3단계</span>허가 유형</h2><span class="muted small">작업일정 기준 권장: ' + T(t.hint).name + '</span></div><div class="pn-b"><div class="row" role="radiogroup">';
    S.settings.types.filter(function (x) { return x.on; }).forEach(function (x) {
      h += '<button type="button" class="btn' + (f.type === x.id ? ' pri' : '') + '" role="radio" aria-checked="' + (f.type === x.id) + '" data-act="pickType" data-id="' + x.id + '">' + esc(x.name) + ' 작업' + '</button>';
    });
    h += '</div></div></section>';
  }
  if (f.type) {
    var ty = T(f.type);
    h += '<section class="pn" id="conds"><div class="pn-h"><h2><span class="step">4단계</span>' + esc(ty.name) + ' 작업 허가조건 체크리스트</h2><span class="small muted">' + f.checks.filter(Boolean).length + '/' + ty.check.length + ' 확인</span></div><div class="pn-b flush">';
    ty.check.forEach(function (c, i) {
      h += '<label class="ck' + (f.checks[i] ? ' on' : '') + '"><input type="checkbox" data-bind="chk" data-i="' + i + '"' + (f.checks[i] ? ' checked' : '') + '><span class="box">' + ic('check') + '</span><span class="t">' + esc(c) + '</span></label>';
    });
    h += '</div></section>';

    var crew = TK(f.taskId).crew, pool = S.workers.filter(function (w) { return w.co === MY_CO; });
    h += '<section class="pn" id="crew"><div class="pn-h"><h2><span class="step">5단계</span>투입 작업자</h2><span class="small muted">필수교육: ' + ty.req.map(function (r) { return TR[r]; }).join(', ') + '</span></div><div class="pn-b flush"><div class="tw"><table class="t stk"><thead><tr><th>작업자</th><th>직종</th><th>교육·자격 충족</th><th class="c">투입</th></tr></thead><tbody>';
    pool.forEach(function (w) {
      var inn = f.workers.indexOf(w.id) >= 0, u = unmet(w, f.type), so = soonOf(w, f.type);
      h += '<tr class="' + (inn && u.length ? 'blk' : '') + '" data-worker="' + w.id + '"><td class="mtitle">' + w.name + ' <span class="id">' + w.id + (crew.indexOf(w.id) >= 0 ? ' · 일정 배정' : '') + '</span></td><td data-l="직종" class="nw">' + w.job + '</td><td data-l="충족">' +
        (u.length ? lb('bad', '미충족', 'x') + '<div class="wk-reason">' + esc(u.join(', ')) + '</div>' : lb('ok', '충족', 'check') + (so.length ? '<div class="wk-soon">' + ic('clock') + ' ' + esc(so.join(', ')) + '</div>' : '')) +
        '</td><td class="c acts">' + (inn ? '<button type="button" class="btn sm' + (u.length ? ' dng' : '') + '" data-act="wkOut" data-id="' + w.id + '">' + ic('minus') + '제외</button>' : '<button type="button" class="btn sm" data-act="wkIn" data-id="' + w.id + '">' + ic('plus') + '투입</button>') + '</td></tr>';
    });
    h += '</tbody></table></div></div></section>';
  }
  h += '</div><div class="sticky">';
  var rs = blockReasons(f), ok = !rs.length;
  h += '<section class="pn"><div class="pn-h"><h2>' + ic(ok ? 'check' : 'lock') + '신청 가능 여부</h2>' + (ok ? lb('ok', '신청 가능', 'check') : lb('bad', '신청 불가', 'lock')) + '</div><div class="pn-b submitbar">';
  if (!ok) h += '<div class="al al-bad" id="block">' + ic('lock') + '<div><b>아래 사유로 신청 버튼이 막혀 있습니다</b><ul>' + rs.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div></div>';
  else h += '<div class="al al-ok">' + ic('check') + '<div><b>모든 조건을 충족했습니다</b>허가조건 ' + T(f.type).check.length + '개 확인, 투입 ' + f.workers.length + '명 교육·자격 충족</div></div>';
  if (f.taskId) {
    var tk = TK(f.taskId);
    h += '<dl class="kv"><dt>작업</dt><dd>' + esc(tk.title) + '</dd><dt>구역·시간</dt><dd>' + tk.site + ' ' + tk.zone + ' · ' + tk.start + '~' + tk.end + '</dd><dt>허가 유형</dt><dd>' + (f.type ? T(f.type).name + ' 작업' : '-') + '</dd><dt>승인 단계</dt><dd>' + S.settings.steps.map(esc).join(' → ') + '</dd></dl>';
  }
  h += '<button type="button" class="btn pri" id="submitBtn" data-act="submit"' + (ok ? '' : ' disabled') + '>' + ic('send') + (f.editingId ? '재신청' : '허가 신청') + '</button>';
  if (f.taskId) h += '<button type="button" class="btn" data-act="resetForm">처음부터 다시</button>';
  h += '</div></section></div></div>';
  return h;
}

/* ---------- 2. review ---------- */
function rReview() {
  var q = S.permits.filter(function (p) { return p.status === '신청' || p.status === '검토 중'; });
  var sel = S.sel.review && PM(S.sel.review);
  var h = ph('허가 검토', '신청 내용을 확인하고 승인하거나 사유를 적어 반려합니다. 같은 구역·시간대의 다른 허가와 겹치면 경고가 뜹니다.');
  h += '<div class="split' + (sel ? ' has-d' : '') + '"><div class="s-list"><section class="pn"><div class="pn-h"><h2>' + ic('inbox') + '검토 대기</h2><span class="small muted">' + q.length + '건</span></div><div class="pn-b flush">';
  if (!q.length) h += empty('inbox', '검토할 허가가 없습니다', '새 신청이 들어오면 여기에 쌓입니다. 처리한 건은 허가 목록에서 볼 수 있습니다.', '허가 목록 보기', 'go', 'list');
  else {
    h += '<div class="tw"><table class="t stk"><thead><tr><th>허가 · 유형 · 시간</th><th>협력사</th><th>상태</th></tr></thead><tbody>';
    q.forEach(function (p) {
      var itf = interference(p).length;
      h += '<tr class="click' + (sel && sel.id === p.id ? ' sel' : '') + '" data-act="openReview" data-id="' + p.id + '"><td class="mtitle">' + esc(p.title) + ' <span class="id">' + p.id + '</span>' + (itf ? '<div>' + lb('bad', '동시작업 간섭', 'alert') + '</div>' : '') + '<div class="sub">' + T(p.type).name + ' 작업 · ' + p.site + ' ' + p.zone + ' · ' + p.start + '~' + p.end + '</div></td><td data-l="협력사" class="nw">' + p.co + '</td><td data-l="상태" class="nw">' + stLb(p.status) + '</td></tr>';
    });
    h += '</tbody></table></div>';
  }
  h += '</div></section></div><div class="s-det">';
  if (sel) {
    var p = sel, ty = T(p.type), itf = interference(p);
    h += '<button type="button" class="btn back" data-act="closeDet" data-id="review">' + ic('left') + '검토 대기 목록</button>';
    h += '<section class="pn mt" id="revDetail"><div class="pn-h"><h2>' + esc(p.title) + ' <span class="id">' + p.id + '</span></h2>' + stLb(p.status) + '</div><div class="pn-b">';
    itf.forEach(function (x) { h += '<div class="al al-bad" id="interf">' + ic('alert') + '<div><b>동시작업 간섭 경고</b>' + esc(x.msg) + '<div class="small mt">작업 시간을 조정하거나, 환기·가스측정 조건을 보완하도록 반려 사유에 적을 수 있습니다.</div></div></div>'; });
    if (!itf.length) h += '<div class="al al-ok">' + ic('check') + '<div><b>간섭 없음</b>같은 구역·시간대에 겹치는 허가가 없습니다.</div></div>';
    h += '<dl class="kv"><dt>협력사·신청자</dt><dd>' + esc(p.applicant) + '</dd><dt>구역·시간</dt><dd>' + p.site + ' ' + p.zone + ' · ' + p.start + '~' + p.end + '</dd><dt>프로젝트</dt><dd>' + p.project + '</dd><dt>허가 유형</dt><dd>' + typeLb(p.type) + '</dd>' +
      '<dt>연결 문서</dt><dd>' + lb('src', '기존 기능에서 가져옴') + ' 작업표준서 ' + p.ws + ' · 위험성평가 ' + p.ra + '</dd>' +
      '<dt>허가조건</dt><dd>' + lb('ok', ty.check.length + '/' + ty.check.length + ' 확인', 'check') + '</dd>' +
      '<dt>투입 작업자</dt><dd>' + p.workers.map(function (id) { var w = W(id); return w.name + '(' + w.id + ') ' + (unmet(w, p.type).length ? lb('bad', '미충족') : lb('ok', '충족')); }).join('<br>') + '</dd>' +
      '<dt>승인 단계</dt><dd><ol class="steps">' + S.settings.steps.map(function (s, i) { return '<li class="' + (i <= p.approvals ? 'done' : i === p.approvals + 1 ? 'cur' : '') + '">' + (i <= p.approvals ? ic('check') : '') + esc(s) + '</li>'; }).join('') + '</ol></dd></dl>';
    var stepName = S.settings.steps[p.approvals + 1] || '승인';
    var can = S.role === 'safety' || S.role === 'admin';
    h += '<div class="mt"><label class="fld"><span>반려 사유 (반려할 때 필수)</span><textarea class="in' + (S.rejErr ? ' err' : '') + '" id="rejText" data-bind="rej" placeholder="예: 도장 작업 종료(18:00) 뒤로 시간을 조정해 다시 신청하세요">' + esc(S.rejText) + '</textarea>' + (S.rejErr ? '<div class="errt">반려 사유를 적어야 반려할 수 있습니다</div>' : '') + '</label>';
    h += '<div class="row"><button type="button" class="btn pri" data-act="approve" data-id="' + p.id + '"' + (can ? '' : ' disabled') + '>' + ic('check') + esc(stepName) + '</button><button type="button" class="btn dng" data-act="reject" data-id="' + p.id + '"' + (can ? '' : ' disabled') + '>' + ic('x') + '반려</button></div></div>';
    h += '<h3 class="mt small muted">처리 이력</h3>' + histHtml(p.hist) + '</div></section>';
  } else if (q.length) {
    h += '<section class="pn hide-m">' + empty('eye', '검토할 허가를 고르세요', '왼쪽 목록에서 허가를 누르면 신청 내용과 간섭 경고가 보입니다.') + '</section>';
  }
  h += '</div></div>';
  return h;
}

/* ---------- 3. list ---------- */
var FLOW = ['신청', '검토 중', '승인', '작업 중', '종료', '반려'];
function rList() {
  var mine = S.role === 'worker';
  var base = S.permits.filter(function (p) { return !mine || p.co === MY_CO; });
  var fl = S.filt.list;
  var rows = base.filter(function (p) { return fl === '전체' || (fl === '만료' ? expired(p) : p.status === fl); });
  var sel = S.sel.list && PM(S.sel.list);
  var h = ph('허가 목록·상태', (mine ? MY_CO + ' 허가만 보입니다. ' : '') + '신청 → 검토 중 → 승인 → 작업 중 → 종료, 또는 반려. 유효기간이 지나면 재승인을 받아야 작업을 이어갈 수 있습니다.');
  h += '<div class="flow" role="group" aria-label="상태 흐름"><button type="button" data-act="flt" data-id="전체" aria-pressed="' + (fl === '전체') + '"><span class="n">' + base.length + '</span><span class="s">전체</span></button>';
  FLOW.forEach(function (s, i) {
    var n = base.filter(function (p) { return p.status === s; }).length;
    h += '<button type="button" class="' + (s === '반려' ? 'rej' : '') + '" data-act="flt" data-id="' + s + '" aria-pressed="' + (fl === s) + '"><span class="n">' + n + '</span><span class="s">' + s + '</span>' + (i < 4 ? '<span class="arr">' + ic('right') + '</span>' : '') + '</button>';
  });
  var ex = base.filter(expired).length;
  h += '<button type="button" class="rej" data-act="flt" data-id="만료" aria-pressed="' + (fl === '만료') + '"><span class="n">' + ex + '</span><span class="s">유효기간 만료</span></button></div>';

  h += '<div class="split' + (sel ? ' has-d' : '') + '"><div class="s-list"><section class="pn"><div class="pn-b flush">';
  if (!rows.length) h += empty('list', fl + ' 상태의 허가가 없습니다', '다른 상태를 고르거나 전체 목록으로 돌아가세요.', '전체 보기', 'flt', '전체');
  else {
    h += '<div class="tw"><table class="t stk"><thead><tr><th>허가 · 유형 · 구역 · 시간</th><th>협력사</th><th>상태</th><th>유효기간</th><th></th></tr></thead><tbody>';
    rows.forEach(function (p) {
      h += '<tr class="click' + (sel && sel.id === p.id ? ' sel' : '') + '" data-act="openList" data-id="' + p.id + '"><td class="mtitle">' + esc(p.title) + ' <span class="id">' + p.id + '</span><div class="sub">' + T(p.type).name + ' 작업 · ' + p.site + ' ' + p.zone + ' · ' + p.start + '~' + p.end + '</div></td><td data-l="협력사" class="nw">' + p.co + '</td><td data-l="상태" class="nw">' + stLb(p.status) + '</td><td data-l="유효기간" class="nw">' + validity(p) + '</td><td class="acts">' + rowActs(p, true) + '</td></tr>';
    });
    h += '</tbody></table></div>';
  }
  h += '</div></section></div><div class="s-det">';
  if (sel) {
    var p = sel;
    h += '<button type="button" class="btn back" data-act="closeDet" data-id="list">' + ic('left') + '허가 목록</button>';
    h += '<section class="pn mt" id="listDetail"><div class="pn-h"><h2>' + esc(p.title) + ' <span class="id">' + p.id + '</span></h2><div class="row">' + stLb(p.status) + validity(p) + '</div></div><div class="pn-b">';
    if (p.status === '반려') h += '<div class="al al-bad" id="rejReason">' + ic('x') + '<div><b>반려 사유</b>' + esc(p.reject) + '</div></div>';
    if (expired(p)) h += '<div class="al al-bad">' + ic('alert') + '<div><b>유효기간 만료</b>' + p.end + '에 허가 유효기간이 지났습니다. 작업을 이어가려면 재승인을 요청하세요.</div></div>';
    h += '<dl class="kv"><dt>협력사·신청자</dt><dd>' + esc(p.applicant) + '</dd><dt>구역·시간</dt><dd>' + p.site + ' ' + p.zone + ' · ' + p.start + '~' + p.end + '</dd><dt>허가 유형</dt><dd>' + typeLb(p.type) + '</dd><dt>투입 작업자</dt><dd>' + p.workers.map(function (id) { var w = W(id); return w.name + '(' + w.id + ')'; }).join(', ') + '</dd><dt>연결 문서</dt><dd>작업표준서 ' + p.ws + ' · 위험성평가 ' + p.ra + '</dd></dl>';
    h += '<div class="row mt">' + rowActs(p, false) + '</div>';
    h += '<h3 class="mt small muted">건별 이력 (누가 · 언제)</h3><div id="permitHist">' + histHtml(p.hist) + '</div></div></section>';
  } else h += '<section class="pn hide-m">' + empty('hist', '허가를 고르면 이력이 보입니다', '목록에서 한 건을 누르면 상태와 누가 언제 처리했는지 이력이 열립니다.') + '</section>';
  h += '</div></div>';
  return h;
}
function rowActs(p, icon) {
  var a = [], mine = p.co === MY_CO || S.role !== 'worker';
  function b(act, label, i, cls) {
    return icon ? '<button type="button" class="ibtn ' + (cls || '') + '" data-act="' + act + '" data-id="' + p.id + '" data-tip="' + label + '" aria-label="' + label + '">' + ic(i) + '</button>'
      : '<button type="button" class="btn ' + (cls || '') + '" data-act="' + act + '" data-id="' + p.id + '">' + ic(i) + label + '</button>';
  }
  if (!icon) {
    if (p.status === '승인' && !expired(p) && (S.role !== 'safety') && mine) a.push(b('startWork', '작업 시작', 'play', 'pri'));
    if (expired(p) && S.role !== 'safety' && mine) a.push(b('reapprove', '재승인 요청', 'refresh', 'pri'));
    if (p.status === '작업 중' && !expired(p)) a.push(b('goClose', '종료 확인으로', 'stop'));
    if (p.status === '반려' && S.role !== 'safety' && mine) a.push(b('resubmit', '수정 후 재신청', 'refresh', 'pri'));
    if ((p.status === '신청' || p.status === '검토 중') && S.role !== 'worker') a.push(b('goReview', '검토 화면으로', 'shield'));
  } else {
    a.push(b('openList', '이력 보기', 'hist'));
    if (expired(p) && S.role !== 'safety' && mine) a.push(b('reapprove', '재승인 요청', 'refresh'));
    else if (p.status === '작업 중') a.push(b('goClose', '종료 확인', 'stop'));
    else if (p.status === '반려' && S.role !== 'safety' && mine) a.push(b('resubmit', '재신청', 'refresh'));
  }
  return a.join('');
}

/* ---------- 4. close ---------- */
function rClose() {
  var c = S.permits.filter(function (p) { return (p.status === '작업 중' || p.status === '승인') && (S.role !== 'worker' || p.co === MY_CO); });
  var sel = S.sel.close && PM(S.sel.close);
  var h = ph('허가 종료', '작업이 끝나면 유형별 종료 확인 항목을 모두 체크해야 종료 버튼이 열립니다.');
  h += '<div class="split' + (sel ? ' has-d' : '') + '"><div class="s-list"><section class="pn"><div class="pn-h"><h2>' + ic('play') + '진행 중인 허가</h2><span class="small muted">' + c.length + '건</span></div><div class="pn-b flush">';
  if (!c.length) h += empty('stop', '종료할 허가가 없습니다', '승인되었거나 작업 중인 허가가 여기에 나옵니다.', '허가 목록 보기', 'go', 'list');
  else {
    h += '<div class="tw"><table class="t stk"><thead><tr><th>허가 · 유형 · 구역</th><th>유효기간</th></tr></thead><tbody>';
    c.forEach(function (p) { h += '<tr class="click' + (sel && sel.id === p.id ? ' sel' : '') + '" data-act="openClose" data-id="' + p.id + '"><td class="mtitle">' + esc(p.title) + ' <span class="id">' + p.id + '</span><div class="sub">' + T(p.type).name + ' 작업 · ' + p.co + ' · ' + p.site + ' ' + p.zone + '</div></td><td data-l="유효기간" class="nw">' + validity(p) + '</td></tr>'; });
    h += '</tbody></table></div>';
  }
  h += '</div></section></div><div class="s-det">';
  if (sel) {
    var p = sel, ty = T(p.type), cc = p.closeChecks || [], done = cc.filter(Boolean).length, left = ty.close.length - done;
    h += '<button type="button" class="btn back" data-act="closeDet" data-id="close">' + ic('left') + '진행 중인 허가</button>';
    h += '<section class="pn mt" id="closeDetail"><div class="pn-h"><h2>' + esc(ty.name) + ' 작업 종료 확인 · <span class="id">' + p.id + '</span></h2>' + (left ? lb('warn', '남은 확인 ' + left + '개', 'clock') : lb('ok', '모두 확인', 'check')) + '</div><div class="pn-b flush">';
    ty.close.forEach(function (x, i) { h += '<label class="ck' + (cc[i] ? ' on' : '') + '"><input type="checkbox" data-bind="cchk" data-i="' + i + '"' + (cc[i] ? ' checked' : '') + '><span class="box">' + ic('check') + '</span><span class="t">' + esc(x) + '</span></label>'; });
    h += '</div><div class="pn-b" style="border-top:1px solid var(--line)">' + (p.status === '승인' ? '<p class="small muted" style="margin:0 0 8px">작업 시작 전인 허가도 취소 대신 종료로 닫을 수 있습니다.</p>' : '') +
      '<button type="button" class="btn pri" id="closeBtn" data-act="doClose" data-id="' + p.id + '"' + (left ? ' disabled' : '') + '>' + ic(left ? 'lock' : 'stop') + '허가 종료</button>' + (left ? ' <span class="small" style="color:var(--warn);font-weight:600">종료 확인 항목 ' + left + '개를 더 체크해야 열립니다</span>' : '') + '</div></section>';
  } else if (c.length) h += '<section class="pn hide-m">' + empty('stop', '종료할 허가를 고르세요', '왼쪽에서 허가를 누르면 유형별 종료 확인 항목이 열립니다.') + '</section>';
  h += '</div></div>';
  return h;
}

/* ---------- 5. training ---------- */
function rTraining() {
  var co = S.filt.trCo;
  var ws = S.workers.filter(function (w) { return co === '전체' || w.co === co; });
  var h = ph('교육·자격', '작업유형마다 필수교육을 정해 두면, 허가 신청 때 작업자별 충족 여부를 자동으로 확인합니다. 만료 30일 전부터 임박으로 표시합니다.');
  h += '<section class="pn"><div class="pn-h"><h2>' + ic('grid') + '작업유형 × 필수교육</h2><span class="small muted">설정에서 바꿀 수 있습니다</span></div><div class="pn-b flush"><div class="tw"><table class="t" id="matrix"><thead><tr><th>작업유형</th>' + TR_ORDER.map(function (r) { return '<th class="c">' + TR[r] + '</th>'; }).join('') + '</tr></thead><tbody>';
  S.settings.types.forEach(function (t) { h += '<tr><td><b>' + esc(t.name) + ' 작업</b></td>' + TR_ORDER.map(function (r) { return '<td class="c">' + (t.req.indexOf(r) >= 0 ? lb('ok', '필수') : '<span class="muted">-</span>') + '</td>'; }).join('') + '</tr>'; });
  h += '</tbody></table></div></div></section>';

  var alerts = [];
  S.workers.forEach(function (w) {
    var need = {}; (CO_TYPES[w.co] || []).forEach(function (tp) { T(tp).req.forEach(function (r) { need[r] = 1; }); });
    Object.keys(need).forEach(function (r) { var s = trState(w.tr[r]); if (s.k !== 'ok') alerts.push({ w: w, r: r, s: s }); });
  });
  alerts.sort(function (a, b) { return (a.s.c === 'bad' ? 0 : 1) - (b.s.c === 'bad' ? 0 : 1); });
  h += '<div class="grid2"><section class="pn"><div class="pn-h"><h2>' + ic('users') + '작업자별 이수 현황</h2><label class="row small">협력사 <select class="in" style="width:auto" data-bind="trCo">' + ['전체'].concat(COS).map(function (c) { return '<option' + (c === co ? ' selected' : '') + '>' + c + '</option>'; }).join('') + '</select></label></div><div class="pn-b flush"><div class="tw"><table class="t" id="trTable"><thead><tr><th>작업자</th><th>협력사</th>' + TR_ORDER.map(function (r) { return '<th>' + TR[r] + '</th>'; }).join('') + '</tr></thead><tbody>';
  ws.forEach(function (w) {
    h += '<tr><td class="nw"><b>' + w.name + '</b> <span class="id">' + w.id + '</span></td><td class="nw">' + w.co + '</td>' + TR_ORDER.map(function (r) {
      var v = w.tr[r]; if (!v) return '<td class="muted">-</td>';
      var s = trState(v); return '<td class="nw">' + v + (s.k === 'ok' ? '' : '<br>' + lb(s.c, s.t)) + '</td>';
    }).join('') + '</tr>';
  });
  if (!ws.length) h += '<tr><td colspan="8">' + empty('users', '작업자가 없습니다', '다른 협력사를 고르세요.', '전체 보기', 'trAll') + '</td></tr>';
  h += '</tbody></table></div></div></section>';
  h += '<section class="pn" id="alerts"><div class="pn-h"><h2>' + ic('alert') + '미충족 알림</h2><span class="small muted">' + alerts.length + '건</span></div><div class="pn-b flush">';
  if (!alerts.length) h += empty('check', '미충족 알림이 없습니다', '모든 작업자가 필수교육 유효기간 안에 있습니다.', '대시보드 보기', 'go', 'dash');
  else {
    h += '<ul class="slist">';
    alerts.forEach(function (a) {
      h += '<li data-alert="' + a.w.id + '-' + a.r + '"><span class="t"><b>' + a.w.name + '</b> <span class="id">' + a.w.id + ' · ' + a.w.co + '</span><br>' + TR[a.r] + ' ' + lb(a.s.c, a.s.t + (a.w.tr[a.r] ? ' (' + a.w.tr[a.r] + ')' : ''), a.s.c === 'bad' ? 'alert' : 'clock') + '</span>' +
        (S.role !== 'worker' ? '<button type="button" class="ibtn" data-act="renew" data-id="' + a.w.id + '|' + a.r + '" data-tip="이수 등록" aria-label="이수 등록">' + ic('check') + '</button>' : '') + '</li>';
    });
    h += '</ul>';
  }
  h += '</div></section></div>';
  return h;
}

/* ---------- 6. inspect ---------- */
function rInspect() {
  var h = ph('안전점검', '현장별 체크리스트를 수행하고, 부적합 항목은 사진·위치·내용과 함께 등록하면 시정조치로 넘어갑니다.');
  var I = S.insp;
  if (!I) {
    h += '<section class="pn"><div class="pn-h"><h2>' + ic('clip') + '오늘 점검할 현장</h2><span class="small muted">2026-11-25</span></div><div class="pn-b flush"><div class="tw"><table class="t stk"><thead><tr><th>현장</th><th>체크리스트</th><th>최근 점검</th><th></th></tr></thead><tbody>';
    SITES.forEach(function (s) {
      var last = S.inspections.filter(function (x) { return x.site === s; })[0];
      h += '<tr><td class="mtitle">' + s + ' 정기점검</td><td data-l="항목">' + S.checklists[s].length + '개 항목</td><td data-l="최근 점검">' + (last ? last.at + ' · 부적합 ' + last.bad + '건' : '<span class="muted">기록 없음</span>') + '</td><td class="acts"><button type="button" class="btn sm pri" data-act="inspStart" data-id="' + s + '">' + ic('clip') + '점검 시작</button></td></tr>';
    });
    h += '</tbody></table></div></div></section>';
    h += '<section class="pn"><div class="pn-h"><h2>' + ic('hist') + '점검 기록</h2></div><div class="pn-b flush"><div class="tw"><table class="t stk"><thead><tr><th>번호</th><th>현장</th><th>점검자</th><th>일시</th><th>결과</th></tr></thead><tbody>' +
      S.inspections.map(function (x) { return '<tr><td class="mtitle">' + x.id + '</td><td data-l="현장">' + x.site + '</td><td data-l="점검자">' + x.by + '</td><td data-l="일시">' + x.at + '</td><td data-l="결과">' + x.items + '개 중 ' + (x.bad ? lb('bad', '부적합 ' + x.bad + '건') : lb('ok', '부적합 없음')) + '</td></tr>'; }).join('') + '</tbody></table></div></div></section>';
    return h;
  }
  var items = S.checklists[I.site];
  var doneN = I.res.filter(function (x) { return x; }).length;
  h += '<button type="button" class="btn" data-act="inspCancel">' + ic('left') + '현장 목록</button>';
  h += '<section class="pn mt" id="inspForm"><div class="pn-h"><h2>' + I.site + ' 정기점검</h2><span class="small muted">' + doneN + '/' + items.length + ' 판정</span></div><div class="pn-b flush">';
  items.forEach(function (it, i) {
    var r = I.res[i], d = I.nc[i] || {};
    h += '<div class="insp-item" data-item="' + i + '"><div class="top2"><span>' + esc(it) + '</span><span class="seg"><button type="button" class="' + (r === 'ok' ? 'on-ok' : '') + '" data-act="inspSet" data-id="' + i + '|ok" aria-pressed="' + (r === 'ok') + '">양호</button><button type="button" class="' + (r === 'bad' ? 'on-bad' : '') + '" data-act="inspSet" data-id="' + i + '|bad" aria-pressed="' + (r === 'bad') + '">부적합</button></span></div>';
    if (r === 'bad') {
      h += '<div class="ncf"><div class="small" style="color:var(--bad);font-weight:700;margin-bottom:8px">' + ic('alert') + ' 부적합 내용</div><div class="ph-row" style="margin-bottom:10px">';
      for (var k = 0; k < (d.photos || 0); k++) h += '<div class="ph-slot">' + ic('camera') + '사진 ' + (k + 1) + '<span>(자리 표시)</span></div>';
      if ((d.photos || 0) < 3) h += '<button type="button" class="ph-slot add" data-act="inspPhoto" data-id="' + i + '">' + ic('plus') + '사진 첨부</button>';
      h += '</div><div class="grid2h"><label class="fld"><span>위치</span><input class="in" data-bind="ncLoc" data-i="' + i + '" value="' + esc(d.loc || '') + '" placeholder="예: B-12 블록 하부 통로"></label><label class="fld"><span>관련 협력사</span><select class="in" data-bind="ncCo" data-i="' + i + '">' + COS.map(function (c) { return '<option' + (c === (d.co || COS[0]) ? ' selected' : '') + '>' + c + '</option>'; }).join('') + '</select></label></div>' +
        '<label class="fld"><span>내용</span><textarea class="in" data-bind="ncText" data-i="' + i + '" placeholder="무엇이 어떻게 부적합한지 적습니다">' + esc(d.text || '') + '</textarea></label>' + (I.err && I.err[i] ? '<div class="errt">' + I.err[i] + '</div>' : '') + '</div>';
    }
    h += '</div>';
  });
  var badN = I.res.filter(function (x) { return x === 'bad'; }).length;
  h += '</div><div class="pn-b" style="border-top:1px solid var(--line)"><div class="row"><button type="button" class="btn pri" data-act="inspSave"' + (doneN < items.length ? ' disabled' : '') + '>' + ic('check') + '점검 결과 저장' + (badN ? ' · 부적합 ' + badN + '건 등록' : '') + '</button>' + (doneN < items.length ? '<span class="small muted">' + (items.length - doneN) + '개 항목을 더 판정하세요</span>' : '') + '</div></div></section>';
  return h;
}

/* ---------- 7. action ---------- */
var NC_TABS = ['전체', '대기', '조치 중', '완료 확인 대기', '완료', '기한 초과'];
function rAction() {
  var f = S.filt.act;
  var base = S.ncs;
  var rows = base.filter(function (n) { return f === '전체' || (f === '기한 초과' ? overdue(n) : n.status === f); });
  var sel = S.sel.action && NC(S.sel.action);
  var h = ph('시정조치', '부적합마다 담당자와 기한을 정하고, 조치 완료 보고 → 안전관리자 완료 확인까지 닫습니다.');
  h += '<div class="tabs" role="tablist">' + NC_TABS.map(function (t) {
    var n = base.filter(function (x) { return t === '전체' || (t === '기한 초과' ? overdue(x) : x.status === t); }).length;
    return '<button type="button" role="tab" aria-selected="' + (f === t) + '" data-act="ncTab" data-id="' + t + '"' + (t === '기한 초과' && n ? ' style="color:var(--bad)"' : '') + '>' + t + '<span class="c">' + n + '</span></button>';
  }).join('') + '</div>';
  h += '<div class="split' + (sel ? ' has-d' : '') + '"><div class="s-list"><section class="pn"><div class="pn-b flush">';
  if (!rows.length) h += empty('check', f + ' 건이 없습니다', f === '기한 초과' ? '기한을 넘긴 부적합이 없습니다.' : '점검에서 부적합을 등록하면 여기로 넘어옵니다.', '안전점검으로', 'go', 'inspect');
  else {
    h += '<div class="tw"><table class="t stk"><thead><tr><th>부적합 · 위치</th><th>협력사</th><th>담당 · 기한</th><th>처리 현황</th></tr></thead><tbody>';
    rows.forEach(function (n) {
      h += '<tr class="click' + (sel && sel.id === n.id ? ' sel' : '') + '" data-act="openNc" data-id="' + n.id + '"><td class="mtitle">' + esc(n.content) + ' <span class="id">' + n.id + '</span><div class="sub">' + n.site + ' ' + esc(n.loc) + '</div></td><td data-l="협력사" class="nw">' + n.co + '</td><td data-l="담당·기한" class="nw">' + (n.assignee || '<span class="muted">미지정</span>') + (n.due ? ' · ' + n.due.slice(5) : '') + '</td><td data-l="현황">' + ncLb(n) + '</td></tr>';
    });
    h += '</tbody></table></div>';
  }
  h += '</div></section></div><div class="s-det">';
  if (sel) {
    var n = sel;
    h += '<button type="button" class="btn back" data-act="closeDet" data-id="action">' + ic('left') + '시정조치 목록</button>';
    h += '<section class="pn mt" id="ncDetail"><div class="pn-h"><h2>' + esc(n.content) + ' <span class="id">' + n.id + '</span></h2><div class="row">' + ncLb(n) + '</div></div><div class="pn-b">';
    h += '<div class="ph-row" style="margin-bottom:10px">';
    for (var k = 0; k < n.photos; k++) h += '<div class="ph-slot">' + ic('camera') + '현장 사진 ' + (k + 1) + '<span>(자리 표시)</span></div>';
    h += '</div><dl class="kv"><dt>위치</dt><dd>' + ic('pin') + ' ' + n.site + ' ' + esc(n.loc) + '</dd><dt>협력사</dt><dd>' + n.co + '</dd><dt>담당자</dt><dd>' + (n.assignee || '미지정') + '</dd><dt>기한</dt><dd>' + (n.due || '-') + (overdue(n) ? ' ' + lb('bad', '기한 초과', 'alert') : '') + '</dd></dl>';
    var d = S.ncDraft;
    var mgr = S.role !== 'worker', fixer = S.role !== 'safety';
    if (n.status === '대기' || (n.status === '조치 중' && mgr)) {
      var cand = S.workers.filter(function (w) { return w.co === n.co; });
      h += '<div class="mt"><h3 class="small muted" style="margin-bottom:6px">' + (n.status === '대기' ? '담당자·기한 지정' : '담당자·기한 변경') + '</h3><div class="grid2h"><label class="fld"><span>담당자</span><select class="in" data-bind="ncAs">' + cand.map(function (w) { return '<option value="' + w.name + '"' + (w.name === (d.as || n.assignee) ? ' selected' : '') + '>' + w.name + ' (' + w.id + ')</option>'; }).join('') + '</select></label><label class="fld"><span>기한</span><input class="in" type="date" data-bind="ncDue" value="' + (d.due || n.due || addDays(2)) + '"></label></div>' +
        (mgr ? '<button type="button" class="btn ' + (n.status === '대기' ? 'pri' : '') + '" data-act="ncAssign" data-id="' + n.id + '">' + ic('users') + (n.status === '대기' ? '담당 지정' : '변경 저장') + '</button>' : '<p class="small muted">담당 지정은 안전관리자 역할에서 합니다.</p>') + '</div>';
    }
    if (n.status === '조치 중') {
      h += '<div class="mt"><label class="fld"><span>조치 내용</span><input class="in" data-bind="ncFix" value="' + esc(d.fix || '') + '" placeholder="예: 고정 핀 2곳 체결, 사진 첨부"></label>' +
        (fixer ? '<button type="button" class="btn pri" data-act="ncReport" data-id="' + n.id + '">' + ic('send') + '조치 완료 보고</button>' : '<p class="small muted">조치 완료 보고는 협력사 작업책임자 역할에서 합니다.</p>') + '</div>';
    }
    if (n.status === '완료 확인 대기') {
      h += '<div class="al al-info mt">' + ic('info') + '<div><b>완료 확인 대기</b>협력사가 조치 완료를 보고했습니다. 현장 확인 후 완료 처리하거나 보완을 요청합니다.</div></div>';
      h += mgr ? '<div class="row"><button type="button" class="btn pri" data-act="ncConfirm" data-id="' + n.id + '">' + ic('check') + '완료 확인</button><button type="button" class="btn" data-act="ncBack" data-id="' + n.id + '">' + ic('refresh') + '보완 요청</button></div>' : '<p class="small muted">완료 확인은 안전관리자 역할에서 합니다.</p>';
    }
    h += '<h3 class="mt small muted">처리 이력</h3><div id="ncHist">' + histHtml(n.hist) + '</div></div></section>';
  } else if (rows.length) h += '<section class="pn hide-m">' + empty('wrench', '부적합을 고르세요', '목록에서 한 건을 누르면 사진 자리, 담당·기한 지정, 처리 이력이 열립니다.') + '</section>';
  h += '</div></div>';
  return h;
}

/* ---------- 8. dashboard ---------- */
function dashData() {
  var d = S.dash;
  function m(x) { return (d.site === '전체' || x.site === d.site) && (d.project === '전체' || x.project === d.project) && (d.co === '전체' || x.co === d.co); }
  var ps = S.permits.filter(m), ns = S.ncs.filter(m);
  var ws = S.workers.filter(function (w) { return d.co === '전체' || w.co === d.co; });
  return {
    ps: ps, ns: ns,
    appr: ps.filter(function (p) { return p.status === '승인' || p.status === '작업 중'; }).length,
    rev: ps.filter(function (p) { return p.status === '신청' || p.status === '검토 중'; }).length,
    rej: ps.filter(function (p) { return p.status === '반려'; }).length,
    exp: ps.filter(expired).length,
    tr: ws.filter(workerUnmetAny).length,
    open: ns.filter(function (n) { return n.status !== '완료'; }).length,
    over: ns.filter(overdue).length
  };
}
function rDash() {
  var d = S.dash, x = dashData();
  function sel(key, opts) { return '<label class="fld" style="margin:0"><span>' + { site: '현장', project: '프로젝트', co: '협력사' }[key] + '</span><select class="in" data-bind="dash" data-k="' + key + '">' + ['전체'].concat(opts).map(function (o) { return '<option' + (o === d[key] ? ' selected' : '') + '>' + o + '</option>'; }).join('') + '</select></label>'; }
  var h = ph('HSE 통합 대시보드', '허가·교육·점검·시정조치 결과를 한 화면에서 봅니다. 앞 화면에서 승인하거나 조치를 완료하면 숫자가 바로 바뀝니다.');
  h += '<section class="pn"><div class="pn-b"><div class="grid2h" style="grid-template-columns:repeat(3,minmax(0,1fr))">' + sel('site', SITES) + sel('project', PROJECTS) + sel('co', COS) + '</div>' + (d.co === '전체' && (d.site !== '전체' || d.project !== '전체') ? '<p class="small muted" style="margin:8px 0 0">교육 미충족은 협력사 필터만 적용됩니다.</p>' : '') + '</div></section>';
  h += '<div class="kpi" id="kpi" role="status" aria-atomic="true">' +
    '<div data-k="appr"><div class="grpk">오늘 허가</div><div class="k">' + ic('check') + '승인·작업 중</div><div class="v">' + x.appr + '<small>건</small></div></div>' +
    '<div data-k="rev"><div class="grpk e">&nbsp;</div><div class="k">' + ic('eye') + '검토 중</div><div class="v">' + x.rev + '<small>건</small></div></div>' +
    '<div data-k="rej" class="' + (x.rej ? 'bad' : '') + '"><div class="grpk e">&nbsp;</div><div class="k">' + ic('x') + '반려</div><div class="v">' + x.rej + '<small>건</small></div>' + (x.exp ? '<div class="d" style="color:var(--bad)">유효기간 만료 ' + x.exp + '건</div>' : '') + '</div>' +
    '<div data-k="tr" class="' + (x.tr ? 'bad' : '') + '"><div class="grpk">교육·자격</div><div class="k">' + ic('book') + '교육 미충족 작업자</div><div class="v">' + x.tr + '<small>명</small></div></div>' +
    '<div data-k="open" class="' + (x.open ? 'warn' : '') + '"><div class="grpk">점검·시정조치</div><div class="k">' + ic('wrench') + '미조치 부적합</div><div class="v">' + x.open + '<small>건</small></div></div>' +
    '<div data-k="over" class="' + (x.over ? 'bad' : '') + '"><div class="grpk e">&nbsp;</div><div class="k">' + ic('alert') + '기한 초과</div><div class="v">' + x.over + '<small>건</small></div></div></div>';

  var rank = COS.filter(function (c) { return d.co === '전체' || c === d.co; }).map(function (c) {
    var tr = S.workers.filter(function (w) { return w.co === c && workerUnmetAny(w); }).length;
    var op = x.ns.filter(function (n) { return n.co === c && n.status !== '완료'; }).length;
    var ov = x.ns.filter(function (n) { return n.co === c && overdue(n); }).length;
    var rj = x.ps.filter(function (p) { return p.co === c && p.status === '반려'; }).length;
    return { c: c, tr: tr, op: op, ov: ov, rj: rj, sum: tr + op + ov + rj };
  }).sort(function (a, b) { return b.sum - a.sum; });
  h += '<div class="grid2h"><section class="pn"><div class="pn-h"><h2>' + ic('users') + '협력사별 미충족 순위</h2><span class="small muted">미충족 합계 순</span></div><div class="pn-b flush"><div class="tw"><table class="t" id="rank"><thead><tr><th>순위</th><th>협력사</th><th class="num">교육 미충족</th><th class="num">미조치</th><th class="num">기한 초과</th><th class="num">반려</th><th class="num">합계</th></tr></thead><tbody>';
  rank.forEach(function (r, i) { h += '<tr><td class="nw">' + (i + 1) + '위</td><td class="nw"><b>' + r.c + '</b></td><td class="num">' + r.tr + '</td><td class="num">' + r.op + '</td><td class="num">' + (r.ov ? '<span style="color:var(--bad);font-weight:700">' + r.ov + '</span>' : 0) + '</td><td class="num">' + r.rj + '</td><td class="num"><b>' + r.sum + '</b></td></tr>'; });
  h += '</tbody></table></div></div></section>';
  h += '<section class="pn"><div class="pn-h"><h2>' + ic('list') + '오늘 허가 현황</h2><button type="button" class="link" data-act="go" data-id="list">허가 목록</button></div><div class="pn-b flush">';
  if (!x.ps.length) h += empty('list', '조건에 맞는 허가가 없습니다', '필터를 바꿔 보세요.', '필터 초기화', 'dashReset');
  else h += '<div class="tw"><table class="t stk"><thead><tr><th>허가</th><th>협력사</th><th>상태</th><th>유효기간</th></tr></thead><tbody>' + x.ps.map(function (p) { return '<tr><td class="mtitle">' + esc(p.title) + ' <span class="id">' + p.id + '</span></td><td data-l="협력사" class="nw">' + p.co + '</td><td data-l="상태" class="nw">' + stLb(p.status) + '</td><td data-l="유효기간" class="nw">' + validity(p) + '</td></tr>'; }).join('') + '</tbody></table></div>';
  h += '</div></section></div>';
  return h;
}

/* ---------- 9. settings ---------- */
function rSettings() {
  var D = S.draft || (S.draft = JSON.parse(JSON.stringify(S.settings)));
  var t = null; D.types.forEach(function (x) { if (x.id === S.setType) t = x; }); if (!t) { t = D.types[0]; S.setType = t.id; }
  var h = ph('설정', '허가 유형, 승인 단계, 유형별 체크리스트와 종료 확인 항목을 화면에서 편집합니다.', '<button type="button" class="btn" data-act="setReset">되돌리기</button><button type="button" class="btn pri" data-act="setSave">' + ic('check') + '설정 저장</button>');
  h += '<div class="note" id="noCode">' + ic('info') + '<span>이 항목들은 설정 데이터로 저장되어, 코드 변경 없이 운영 중에 바꿀 수 있습니다. 저장하면 다음 신청부터 바로 적용됩니다.</span></div>';
  h += '<div class="grid2h"><section class="pn"><div class="pn-h"><h2>' + ic('file') + '허가 유형</h2></div><div class="pn-b flush"><div class="tw"><table class="t"><thead><tr><th>유형</th><th>필수교육</th><th class="num">허가조건</th><th class="num">종료 항목</th><th class="c">사용</th></tr></thead><tbody>';
  D.types.forEach(function (x) {
    h += '<tr><td class="nw"><b>' + esc(x.name) + '</b></td><td class="small">' + (x.req.map(function (r) { return TR[r]; }).join(', ') || '-') + '</td><td class="num">' + x.check.length + '</td><td class="num">' + x.close.length + '</td><td class="c"><label class="ck" style="border:0;display:inline-flex;padding:8px"><input type="checkbox" data-bind="tOn" data-id="' + x.id + '"' + (x.on ? ' checked' : '') + ' aria-label="' + esc(x.name) + ' 사용"><span class="box">' + ic('check') + '</span></label></td></tr>';
  });
  h += '</tbody></table></div><div class="pn-b row"><input class="in grow" data-bind="newType" value="' + esc(S.setNew.type) + '" placeholder="새 유형 이름 (예: 전기)"><button type="button" class="btn" data-act="addType">' + ic('plus') + '유형 추가</button></div></div></section>';
  h += '<section class="pn" id="stepsBox"><div class="pn-h"><h2>' + ic('shield') + '승인 단계</h2><span class="small muted">' + D.steps.length + '단계</span></div><div class="pn-b flush"><ul class="slist">';
  D.steps.forEach(function (s, i) { h += '<li><span class="ord">' + (i + 1) + '단계</span><span class="t">' + esc(s) + '</span>' + (i > 1 ? '<button type="button" class="ibtn dng" data-act="delStep" data-id="' + i + '" data-tip="단계 삭제" aria-label="단계 삭제">' + ic('trash') + '</button>' : '<span class="small muted">기본</span>') + '</li>'; });
  h += '</ul><div class="pn-b row"><input class="in grow" data-bind="newStep" value="' + esc(S.setNew.step) + '" placeholder="예: 현장소장 최종 승인"><button type="button" class="btn" data-act="addStep">' + ic('plus') + '단계 추가</button></div></div></section></div>';

  h += '<section class="pn" id="checkEdit"><div class="pn-h"><h2>' + ic('clip') + '유형별 체크리스트·종료 확인 항목</h2><label class="row small">유형 <select class="in" style="width:auto" data-bind="setType">' + D.types.map(function (x) { return '<option value="' + x.id + '"' + (x.id === t.id ? ' selected' : '') + '>' + esc(x.name) + '</option>'; }).join('') + '</select></label></div><div class="grid2h" style="gap:0">';
  [['check', '허가조건 체크리스트'], ['close', '종료 확인 항목']].forEach(function (k) {
    h += '<div style="border-right:1px solid var(--line2)"><div class="pn-b small muted" style="padding-bottom:4px"><b>' + k[1] + '</b> · ' + t[k[0]].length + '개</div><ul class="slist" data-list="' + k[0] + '">';
    if (!t[k[0]].length) h += '<li class="muted">' + ic('inbox') + ' 항목이 없습니다. 아래에서 추가하세요.</li>';
    t[k[0]].forEach(function (c, i) { h += '<li><span class="t">' + esc(c) + '</span><button type="button" class="ibtn dng" data-act="delItem" data-id="' + k[0] + '|' + i + '" data-tip="항목 삭제" aria-label="항목 삭제">' + ic('trash') + '</button></li>'; });
    h += '</ul><div class="pn-b row"><input class="in grow" data-bind="new_' + k[0] + '" value="' + esc(S.setNew[k[0]]) + '" placeholder="새 항목"><button type="button" class="btn" data-act="addItem" data-id="' + k[0] + '">' + ic('plus') + '추가</button></div></div>';
  });
  h += '</div></section>';
  return h;
}

/* ---------- guide ---------- */
var GUIDE = [
  ['허가 신청에서 미충족 작업자 차단', 'worker', 'apply'],
  ['검토 화면의 간섭 경고와 승인', 'safety', 'review'],
  ['종료 확인 항목 체크 후 종료', 'worker', 'close'],
  ['점검에서 부적합 등록', 'safety', 'inspect'],
  ['시정조치 완료 확인', 'safety', 'action'],
  ['대시보드 숫자 변화', 'safety', 'dash'],
  ['설정에서 유형·단계·항목 편집', 'admin', 'settings']
];
function renderGuide() {
  var g = $('#guide');
  g.className = 'guide' + (S.guideOpen ? '' : ' min');
  document.body.classList.toggle('guide-open', S.guideOpen && wide());
  var nx = S.gIdx + 1 < GUIDE.length ? S.gIdx + 1 : 0;
  g.innerHTML = '<div class="gh"><b>' + ic('help') + '<span>시연 안내</span></b>' + (S.guideOpen ? '' : '<button type="button" class="btn sm" data-act="gstep" data-id="' + nx + '" title="' + GUIDE[nx][0] + '">다음 ' + (nx + 1) + '/' + GUIDE.length + '</button>') + '<button type="button" class="btn sm" data-act="guide" aria-expanded="' + S.guideOpen + '">' + (S.guideOpen ? '접기' : '펼치기') + '</button></div>' +
    '<div class="gb"><p class="small muted" style="margin:8px 12px 0">이 순서로 눌러 보면 허가 한 건이 신청부터 대시보드까지 이어지는 흐름을 볼 수 있습니다.</p><ol>' +
    GUIDE.map(function (x, i) { return '<li class="' + (S.screen === x[2] ? 'cur' : '') + '"><span>' + x[0] + '<br><span class="small muted">' + ROLE_NAME[x[1]] + '</span></span><button type="button" class="btn sm" data-act="gstep" data-id="' + i + '">이동</button></li>'; }).join('') + '</ol></div>';
}

/* ---------- render ---------- */
var R = { apply: rApply, review: rReview, list: rList, close: rClose, training: rTraining, inspect: rInspect, action: rAction, dash: rDash, settings: rSettings };
function render() {
  if (!S.screen || !allowed(S.screen)) S.screen = defaultScreen();
  if (!S.form) S.form = newForm();
  if (S.screen === 'review' && !S.sel.review && wide()) {
    var q = S.permits.filter(function (p) { return p.status === '신청' || p.status === '검토 중'; });
    if (q.length) openReview(q[q.length - 1].id);
  }
  renderNav();
  $('#main').innerHTML = R[S.screen]();
  renderGuide();
}
function openReview(id) {
  var p = PM(id); S.sel.review = id; S.rejText = ''; S.rejErr = false;
  if (p && p.status === '신청') { p.status = '검토 중'; p.hist.push([stamp(), PEOPLE[S.role === 'admin' ? 'admin' : 'safety'], '검토 시작']); }
}
function go(id) { S.screen = id; render(); window.scrollTo(0, 0); }

/* ---------- actions ---------- */
var A = {
  role: function (id) { S.role = id; S.sel = {}; S.screen = allowed(S.screen) ? S.screen : null; if (id !== 'admin') S.draft = null; render(); toast(ROLE_NAME[id] + ' 화면으로 바꿨습니다'); },
  go: function (id) { go(id); },
  guide: function () { S.guideOpen = !S.guideOpen; renderGuide(); },
  gstep: function (i) { var g = GUIDE[+i]; S.gIdx = +i; S.role = g[1]; S.sel = {}; S.guideOpen = false; go(g[2]); toast((+i + 1) + '단계: ' + g[0]); },
  pickTask: function (id) {
    run('작업일정 불러오는 중...', function () {
      var t = TK(id); S.form.taskId = id; S.form.type = null; S.form.checks = []; S.form.workers = t.crew.slice();
    }, '작업표준서와 위험성평가를 가져왔습니다');
  },
  pickType: function (id) {
    run('충족 여부 확인 중...', function () { S.form.type = id; S.form.checks = []; },
      function () { var bad = S.form.workers.filter(function (w) { return unmet(W(w), id).length; }).length; return bad ? '교육·자격 미충족 작업자 ' + bad + '명이 있습니다' : '투입 작업자 모두 충족합니다'; });
  },
  wkOut: function (id) { run('작업자 제외 중...', function () { S.form.workers = S.form.workers.filter(function (x) { return x !== id; }); }, W(id).name + ' 작업자를 제외했습니다'); },
  wkIn: function (id) { run('충족 여부 확인 중...', function () { S.form.workers.push(id); }, function () { return unmet(W(id), S.form.type).length ? W(id).name + ' — 교육·자격 미충족' : W(id).name + ' 작업자를 넣었습니다'; }); },
  resetForm: function () { S.form = newForm(); render(); },
  submit: function () {
    if (blockReasons(S.form).length) return;
    run(S.form.editingId ? '재신청 중...' : '허가 신청 중...', function () {
      var f = S.form, t = TK(f.taskId), p;
      if (f.editingId) {
        p = PM(f.editingId); p.type = f.type; p.workers = f.workers.slice(); p.status = '신청'; p.approvals = 0; p.reject = null;
        p.hist.push([stamp(), PEOPLE.worker, '재신청(반려 사유 반영)']);
      } else {
        p = { id: 'P-2611-0' + (permitSeq++), taskId: t.id, title: t.title, type: f.type, co: MY_CO, site: t.site, zone: t.zone, project: t.project, start: t.start, end: t.end, status: '신청', workers: f.workers.slice(), ws: t.ws.id, ra: t.ra.id, approvals: 0, applicant: PEOPLE.worker, hist: [[stamp(), PEOPLE.worker, '허가 신청']] };
        S.permits.push(p);
      }
      S.form = newForm(); S.sel.list = p.id; S.screen = 'list'; S.filt.list = '전체';
      return p;
    }, function (p) { return p.id + ' 신청했습니다. 안전관리자 검토를 기다립니다'; });
  },
  resubmit: function (id) {
    run('반려 내용 불러오는 중...', function () {
      var p = PM(id), t = TK(p.taskId), ty = T(p.type);
      S.form = { taskId: p.taskId, type: p.type, checks: ty.check.map(function () { return false; }), workers: p.workers.slice(), editingId: id };
      S.screen = 'apply';
    }, '반려 사유를 반영해 고친 뒤 다시 신청하세요');
  },
  openReview: function (id) { run('허가 내용 불러오는 중...', function () { openReview(id); }, null); },
  closeDet: function (id) { S.sel[id] = null; render(); },
  approve: function (id) {
    run('승인 처리 중...', function () {
      var p = PM(id), steps = S.settings.steps, who = PEOPLE[S.role];
      p.approvals++;
      if (p.approvals >= steps.length - 1) { p.status = '승인'; p.hist.push([stamp(), who, '승인' + (steps.length > 2 ? '(' + steps[steps.length - 1] + ')' : '')]); S.sel.review = null; return '승인'; }
      p.hist.push([stamp(), who, steps[p.approvals] + ' 완료']); return '다음';
    }, function (r) { return r === '승인' ? id + ' 승인했습니다. 작업책임자에게 알림이 갑니다' : '다음 승인 단계로 넘겼습니다'; });
  },
  reject: function (id) {
    var v = ($('#rejText') || {}).value || '';
    if (!v.trim()) { S.rejErr = true; S.rejText = ''; render(); var el = $('#rejText'); if (el) el.focus(); return; }
    run('반려 처리 중...', function () {
      var p = PM(id); p.status = '반려'; p.reject = v.trim(); p.approvals = 0; p.hist.push([stamp(), PEOPLE[S.role], '반려 — ' + v.trim()]); S.sel.review = null; S.rejText = ''; S.rejErr = false;
    }, id + ' 반려했습니다. 작업책임자 화면에 사유가 보입니다');
  },
  flt: function (id) { S.filt.list = id; S.sel.list = null; render(); },
  openList: function (id) { run('이력 불러오는 중...', function () { S.sel.list = id; }, null); },
  startWork: function (id) { run('작업 시작 처리 중...', function () { var p = PM(id); p.status = '작업 중'; p.hist.push([stamp(), PEOPLE[S.role], '작업 시작']); }, '작업 중으로 바꿨습니다'); },
  reapprove: function (id) {
    run('재승인 요청 중...', function () { var p = PM(id); p.status = '검토 중'; p.approvals = 0; p.end = '18:00'; p.hist.push([stamp(), PEOPLE[S.role], '재승인 요청(유효기간 18:00까지 연장)']); }, '재승인을 요청했습니다. 안전관리자 검토 대기로 넘어갑니다');
  },
  goClose: function (id) { S.sel.close = id; go('close'); },
  goReview: function (id) { S.sel.review = null; openReview(id); go('review'); },
  openClose: function (id) { run('종료 확인 항목 불러오는 중...', function () { S.sel.close = id; }, null); },
  doClose: function (id) {
    var p = PM(id), ty = T(p.type);
    if ((p.closeChecks || []).filter(Boolean).length < ty.close.length) return;
    run('허가 종료 처리 중...', function () { p.status = '종료'; p.hist.push([stamp(), PEOPLE[S.role], '종료 확인 ' + ty.close.length + '/' + ty.close.length + ', 허가 종료']); S.sel.close = null; }, id + ' 허가를 종료했습니다');
  },
  renew: function (k) {
    var a = k.split('|');
    run('이수 기록 등록 중...', function () { W(a[0]).tr[a[1]] = '2027-11-24'; }, W(a[0]).name + ' ' + TR[a[1]] + ' 이수를 등록했습니다(유효 2027-11-24)');
  },
  trAll: function () { S.filt.trCo = '전체'; render(); },
  inspStart: function (s) { run('체크리스트 불러오는 중...', function () { S.insp = { site: s, res: S.checklists[s].map(function () { return null; }), nc: {}, err: {} }; }, null); },
  inspCancel: function () { S.insp = null; render(); },
  inspSet: function (k) { var a = k.split('|'); S.insp.res[+a[0]] = a[1]; if (a[1] === 'bad' && !S.insp.nc[a[0]]) S.insp.nc[a[0]] = { photos: 0, loc: S.insp.site + ' ', co: COS[0], text: '' }; render(); },
  inspPhoto: function (i) { run('사진 첨부 중...', function () { S.insp.nc[i].photos++; }, '사진을 첨부했습니다(시안에서는 자리 표시)'); },
  inspSave: function () {
    var I = S.insp, err = {}, bad = 0;
    I.res.forEach(function (r, i) { if (r === 'bad') { bad++; var d = I.nc[i]; if (!d.loc.trim() || d.loc.trim() === I.site || !d.text.trim()) err[i] = '위치와 내용을 적어야 등록할 수 있습니다'; } });
    I.err = err; if (Object.keys(err).length) { render(); return; }
    run(bad ? '부적합 등록 중...' : '점검 결과 저장 중...', function () {
      var ids = [];
      I.res.forEach(function (r, i) {
        if (r !== 'bad') return; var d = I.nc[i], id = 'NC-2611-0' + (ncSeq++);
        S.ncs.unshift({ id: id, site: I.site, project: I.site === '1야드' ? PROJECTS[1] : PROJECTS[0], co: d.co, loc: d.loc.replace(I.site, '').trim(), content: d.text.trim(), due: '', assignee: '', status: '대기', photos: d.photos || 0, hist: [[stamp(), PEOPLE[S.role], '부적합 등록(' + I.site + ' 정기점검 · ' + S.checklists[I.site][i] + ')']] });
        ids.push(id);
      });
      S.inspections.unshift({ id: 'IN-1125-0' + (S.inspections.length + 1), site: I.site, by: S.role === 'worker' ? '최○○' : '문○○', at: '11-25 ' + stamp().slice(6), items: I.res.length, bad: bad });
      S.insp = null;
      if (ids.length) { S.screen = 'action'; S.filt.act = '대기'; S.sel.action = ids[0]; }
      return ids.length;
    }, function (n) { return n ? '부적합 ' + n + '건을 등록했습니다. 시정조치 대기로 넘어갔습니다' : '점검 결과를 저장했습니다(부적합 없음)'; });
  },
  ncTab: function (t) { S.filt.act = t; S.sel.action = null; render(); },
  openNc: function (id) { run('부적합 불러오는 중...', function () { S.sel.action = id; S.ncDraft = {}; }, null); },
  ncAssign: function (id) {
    var n = NC(id), as = S.ncDraft.as || ($('[data-bind="ncAs"]') || {}).value, due = S.ncDraft.due || ($('[data-bind="ncDue"]') || {}).value;
    run('담당자 지정 중...', function () { var first = n.status === '대기'; n.assignee = as; n.due = due; n.status = '조치 중'; n.hist.push([stamp(), PEOPLE[S.role], (first ? '담당 ' : '담당·기한 변경 ') + as + ', 기한 ' + due.slice(5)]); S.ncDraft = {}; }, as + ' 담당, 기한 ' + due + '로 지정했습니다');
  },
  ncReport: function (id) {
    var n = NC(id), fx = (S.ncDraft.fix || '').trim() || '조치 완료';
    run('조치 완료 보고 중...', function () { n.status = '완료 확인 대기'; n.hist.push([stamp(), PEOPLE[S.role], '조치 완료 보고 — ' + fx]); S.ncDraft = {}; }, '조치 완료를 보고했습니다. 안전관리자 확인을 기다립니다');
  },
  ncConfirm: function (id) { run('완료 확인 처리 중...', function () { var n = NC(id); n.status = '완료'; n.hist.push([stamp(), PEOPLE[S.role], '완료 확인']); }, id + ' 완료 확인했습니다. 이력에 남았습니다'); },
  ncBack: function (id) { run('보완 요청 중...', function () { var n = NC(id); n.status = '조치 중'; n.hist.push([stamp(), PEOPLE[S.role], '보완 요청']); }, '보완을 요청했습니다'); },
  dashReset: function () { S.dash = { site: '전체', project: '전체', co: '전체' }; render(); },
  setReset: function () { S.draft = null; S.setNew = { type: '', step: '', check: '', close: '' }; render(); toast('저장 전 상태로 되돌렸습니다'); },
  setSave: function () {
    run('설정 반영 중...', function () { S.settings = JSON.parse(JSON.stringify(S.draft)); S.draft = null; S.form = newForm(); }, '설정을 저장했습니다. 다음 신청부터 바로 적용됩니다');
  },
  addType: function () { var v = S.setNew.type.trim(); if (!v) return; S.draft.types.push({ id: 'x' + S.draft.types.length, name: v, on: true, req: ['basic'], check: [], close: [] }); S.setType = S.draft.types[S.draft.types.length - 1].id; S.setNew.type = ''; render(); },
  addStep: function () { var v = S.setNew.step.trim(); if (!v) return; S.draft.steps.push(v); S.setNew.step = ''; render(); },
  delStep: function (i) { S.draft.steps.splice(+i, 1); render(); },
  addItem: function (k) { var v = S.setNew[k].trim(); if (!v) return; cur()[k].push(v); S.setNew[k] = ''; render(); },
  delItem: function (k) { var a = k.split('|'); cur()[a[0]].splice(+a[1], 1); render(); }
};
function cur() { var t; S.draft.types.forEach(function (x) { if (x.id === S.setType) t = x; }); return t; }

document.addEventListener('click', function (e) {
  var el = e.target.closest('[data-act]');
  if (!el || el.disabled) return;
  var f = A[el.dataset.act]; if (!f) return;
  e.preventDefault(); e.stopPropagation();
  f(el.dataset.id);
});
document.addEventListener('change', function (e) {
  var el = e.target, b = el.dataset && el.dataset.bind; if (!b) return;
  if (b === 'chk') { S.form.checks[+el.dataset.i] = el.checked; render(); }
  else if (b === 'cchk') { var p = PM(S.sel.close); p.closeChecks = p.closeChecks || []; p.closeChecks[+el.dataset.i] = el.checked; render(); }
  else if (b === 'trCo') run('이수 현황 불러오는 중...', function () { S.filt.trCo = el.value; }, null);
  else if (b === 'dash') run('현황 집계 중...', function () { S.dash[el.dataset.k] = el.value; }, '필터를 적용했습니다');
  else if (b === 'ncCo') S.insp.nc[el.dataset.i].co = el.value;
  else if (b === 'ncAs') S.ncDraft.as = el.value;
  else if (b === 'ncDue') S.ncDraft.due = el.value;
  else if (b === 'tOn') { S.draft.types.forEach(function (x) { if (x.id === el.dataset.id) x.on = el.checked; }); }
  else if (b === 'setType') { S.setType = el.value; render(); }
});
document.addEventListener('input', function (e) {
  var el = e.target, b = el.dataset && el.dataset.bind; if (!b) return;
  if (b === 'rej') { S.rejText = el.value; }
  else if (b === 'ncLoc') S.insp.nc[el.dataset.i].loc = el.value;
  else if (b === 'ncText') S.insp.nc[el.dataset.i].text = el.value;
  else if (b === 'ncFix') S.ncDraft.fix = el.value;
  else if (b === 'newType') S.setNew.type = el.value;
  else if (b === 'newStep') S.setNew.step = el.value;
  else if (b === 'new_check') S.setNew.check = el.value;
  else if (b === 'new_close') S.setNew.close = el.value;
});
document.addEventListener('keydown', function (e) {
  if (e.key !== 'Enter') return;
  var el = e.target, b = el.dataset && el.dataset.bind;
  if (b === 'newType') A.addType(); else if (b === 'newStep') A.addStep(); else if (b === 'new_check') A.addItem('check'); else if (b === 'new_close') A.addItem('close');
});

S.guideOpen = wide();
render();
})();
