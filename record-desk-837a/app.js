(function(){
"use strict";

const ic=(n)=>'<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-'+n+'"/></svg>';
const esc=(s)=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=(id)=>document.getElementById(id);
const clone=(o)=>JSON.parse(JSON.stringify(o));
const pad=(n)=>String(n).padStart(2,'0');

/* ===== 예시 기준 ===== */
const ASOF='2026-10-19';            /* 예시 기준일: 3주차 첫날 */
const END='2026-10-30';             /* 운영 종료일 */
const dday=Math.round((new Date(END+'T00:00:00')-new Date(ASOF+'T00:00:00'))/86400000);
const UT={T:'교사',S:'학생'};
const STG=[['rec','녹화'],['cap','캡처'],['mask','가림 검수'],['conf','확인 완료']];

/* ===== 기록 대상 (메뉴 이름은 일반적인 교육 서비스 예시) ===== */
const MENU=[
  ['공통',[['로그인·로그아웃','TS'],['메인 화면','TS'],['내 정보 수정','TS']]],
  ['도서',[['도서 검색','TS'],['도서 상세 보기','TS'],['추천 도서 목록','TS'],['내 서재','S'],['도서 목록 만들기','T']]],
  ['학습 활동',[['독서 기록 작성','S'],['어휘 학습','S'],['독후 활동 제출','S'],['활동 결과 확인','S'],['활동 자료 내려받기','T']]],
  ['학급 관리',[['학급 개설','T'],['학생 초대·승인','T'],['과제 배정','T'],['제출 현황 조회','T'],['평가·피드백 작성','T'],['학급 가입','S']]],
  ['통계',[['학급 독서 현황','T'],['학생별 독서 이력','T'],['나의 독서 이력','S']]],
  ['지원',[['공지사항','TS'],['도움말','TS'],['문의하기','TS'],['알림','TS']]]
];
function seedUnits(){
  const units=[]; let n=0;
  MENU.forEach(g=>g[1].forEach(m=>{ n++; const id='M-'+pad(n);
    m[1].split('').forEach(t=>{
      const u={id,grp:g[0],name:m[0],t,rec:'todo',cap:'todo',mask:'todo',conf:'todo'};
      if(t==='T'){
        u.rec='done';u.cap='done';
        if(n%3!==0) u.mask='done';
        if(n%2===0&&u.mask==='done') u.conf='done';
        if(m[0]==='평가·피드백 작성'){u.rec='redo';u.cap='todo';u.mask='todo';u.conf='todo';u.memo='팝업 창이 녹화 영역 밖에 떠서 다시 녹화 필요';}
        if(m[0]==='학생별 독서 이력'){u.rec='todo';u.cap='todo';u.mask='todo';u.conf='todo';u.memo='가상 학급 데이터가 부족해 조회 결과가 비어 있음';}
      } else if(g[0]==='공통'||m[0]==='도서 검색'){
        u.rec='done';u.cap='done'; if(m[0]!=='내 정보 수정') u.mask='done';
      }
      units.push(u);
    });
  }));
  return units;
}
const SEED={
  units:seedUnits(),
  masks:[
    {file:'REC_T_M16_과제배정_v1.mp4',tc:'00:01:12 ~ 00:01:31',item:'학생 이름 목록',how:'흐림',done:true,ok:true},
    {file:'REC_T_M17_제출현황조회_v1.mp4',tc:'00:00:48 ~ 00:01:20',item:'학생 이름, 학번',how:'흐림',done:true,ok:true},
    {file:'REC_T_M17_제출현황조회_v1.mp4',tc:'00:02:05 ~ 00:02:14',item:'제출물 본문의 실명',how:'흐림',done:true,ok:false},
    {file:'REC_T_M15_학생초대승인_v1.mp4',tc:'00:00:35 ~ 00:00:52',item:'학생 이메일 주소',how:'흐림',done:true,ok:false},
    {file:'REC_T_M20_학급독서현황_v1.mp4',tc:'00:00:20 ~ 00:01:02',item:'학급명, 학교명',how:'흐림',done:false,ok:false},
    {file:'REC_T_M03_내정보수정_v1.mp4',tc:'00:00:10 ~ 00:00:44',item:'교사 이름, 연락처',how:'흐림',done:false,ok:false},
    {file:'CAP_T_M17_제출현황조회_02.png',tc:'-',item:'학생 이름, 학번',how:'흐림',done:true,ok:true},
    {file:'CAP_S_M03_내정보수정_01.png',tc:'-',item:'학생 이름, 생년월일',how:'흐림',done:false,ok:false}
  ],
  deliv:[
    {kind:'운영 기록 영상',file:'REC_T_전체흐름_v1.mp4',fmt:'MP4 (H.264, 1920 x 1080)',size:'약 1.2 GB',st:'제작 중',ok:false},
    {kind:'운영 기록 영상',file:'REC_S_전체흐름_v1.mp4',fmt:'MP4 (H.264, 1920 x 1080)',size:'약 0.9 GB',st:'녹화 전',ok:false},
    {kind:'메뉴별 영상',file:'REC_{유형}_{메뉴번호}_{메뉴명}_v1.mp4 (36개)',fmt:'MP4 (H.264, 1920 x 1080)',size:'개당 30~150 MB',st:'제작 중',ok:false},
    {kind:'주요 화면 이미지',file:'CAP_{유형}_{메뉴번호}_{메뉴명}_{순번}.png',fmt:'PNG (원본 해상도)',size:'약 400 MB',st:'제작 중',ok:false},
    {kind:'시스템 기록 문서',file:'DOC_운영기록문서_v1.pdf',fmt:'PDF/A (장기 보존용)',size:'약 60 MB',st:'작성 전',ok:false},
    {kind:'원본자료',file:'RAW_녹화원본/',fmt:'MKV (무편집 원본)',size:'약 18 GB',st:'수집 중',ok:false},
    {kind:'원본자료',file:'RAW_편집프로젝트/',fmt:'편집 프로젝트 파일, 자막 원고',size:'약 2 GB',st:'작성 전',ok:false},
    {kind:'목록·검수 자료',file:'LIST_기록대상목록.xlsx, LIST_가림검수표.xlsx',fmt:'XLSX, PDF',size:'약 1 MB',st:'갱신 중',ok:false}
  ]
};
let S=clone(SEED);

/* ===== 집계: 한 곳에서만 ===== */
function stats(units){
  units=units||S.units; const n=units.length; const r={n};
  STG.forEach(s=>{const d=units.filter(u=>u[s[0]]==='done').length; r[s[0]]={d,p:n?Math.round(d/n*100):0};});
  r.redo=units.filter(u=>u.rec==='redo').length;
  return r;
}
function risks(){
  const out=[];
  S.units.forEach(u=>{
    if(u.rec==='redo') out.push({u,why:'재녹화 필요',k:'bad'});
    else if(u.t==='T'&&u.rec==='todo') out.push({u,why:'2주차 계획분 미착수',k:'bad'});
  });
  return out;
}

/* ===== state ===== */
const UI={view:'status',f:{open:false,t:'전체'},page:'shot',guideOpen:null,guideStep:null};
const NAV=[{k:'status',l:'기록 현황',i:'chart'},{k:'items',l:'기록 대상 목록',i:'list'},{k:'doc',l:'기록 문서 견본',i:'file'},{k:'mask',l:'가림 검수표',i:'shield'},{k:'deliv',l:'납품물 목록',i:'box'}];
const TITLES={status:'기록 현황',items:'기록 대상 목록',doc:'기록 문서 견본',mask:'가림 검수표',deliv:'납품물 목록'};
function go(v){const h='#/'+v; if(location.hash===h) route(); else location.hash=h;}
function route(){const v=location.hash.replace(/^#\/?/,'').split('/')[0];UI.view=TITLES[v]?v:'status';if(Date.now()-(toast.at||0)>300)$('toastHost').innerHTML='';render();window.scrollTo(0,0);}
function toast(msg,kind){toast.at=Date.now();const h=$('toastHost');h.innerHTML='<div class="toast'+(kind==='bad'?' bad':'')+'" role="status">'+ic(kind==='bad'?'alert':'check')+'<span>'+esc(msg)+'</span></div>';clearTimeout(toast.t);toast.t=setTimeout(()=>{h.innerHTML='';},3200);}
let busy=false;
function withLoading(msg,fn){if(busy)return;busy=true;$('overlayHost').innerHTML='<div class="overlay" role="status" aria-live="assertive"><div class="ob"><span class="spin" aria-hidden="true"></span><span>'+esc(msg)+'</span></div></div>';setTimeout(()=>{$('overlayHost').innerHTML='';busy=false;fn();},380);}
const st=(t,k)=>'<span class="st '+k+'">'+esc(t)+'</span>';
const empty=(i,t,d,b)=>'<div class="empty">'+ic(i)+'<strong>'+esc(t)+'</strong><p>'+esc(d)+'</p>'+(b||'')+'</div>';
const btn=(o)=>'<button type="button" class="btn '+(o.cls||'')+(o.iconM?' icon-m':'')+'"'+(o.iconM?' data-tip="'+esc(o.label)+'" aria-label="'+esc(o.label)+'"':'')+' '+(o.attrs||'')+'>'+(o.icon?ic(o.icon):'')+'<span class="lbl">'+esc(o.label)+'</span></button>';
const head=(sub,extra)=>'<div class="ph"><div><h1>'+TITLES[UI.view]+'</h1>'+(sub?'<div class="sub">'+sub+'</div>':'')+'</div>'+(extra?'<div class="ph-actions">'+extra+'</div>':'')+'</div>';
const ut=(t)=>'<span class="utype '+t+'">'+UT[t]+'</span>';

function renderShell(){
  $('asof').textContent='예시 기준일 '+ASOF+' (3주차 첫날)';
  $('side').innerHTML=NAV.map((n,i)=>'<a href="#/'+n.k+'"'+(UI.view===n.k?' aria-current="page"':'')+'><span class="no">'+(i+1)+'</span>'+n.l+'</a>').join('');
}

/* ===== 1. 기록 현황 ===== */
function viewStatus(){
  const a=stats(), T=stats(S.units.filter(u=>u.t==='T')), St=stats(S.units.filter(u=>u.t==='S'));
  const prog='<div class="prog" aria-label="단계별 완료율">'+STG.map(s=>'<div class="prow"><span>'+s[1]+'</span><span class="track" role="img" aria-label="'+s[1]+' '+a[s[0]].p+'%"><i style="width:'+a[s[0]].p+'%"></i></span><b>'+a[s[0]].p+'%</b><span class="cnt2">'+a[s[0]].d+' / '+a.n+'건</span></div>').join('')+'</div>';
  const wk=[
    ['1주','10-07 ~ 10-10','기록 대상 전수 목록화, 기록 계획 확정',a.n+'건 목록화',a.n+'건',['완료','ok']],
    ['2주','10-12 ~ 10-16','교사 화면 녹화·캡처',T.n+'건',T.rec.d+'건',T.rec.d>=T.n?['완료','ok']:['미완료 '+(T.n-T.rec.d)+'건','bad']],
    ['3주','10-19 ~ 10-23','학생 화면 녹화·캡처 (10-24 전량 완료)',St.n+'건',St.rec.d+'건',St.rec.d>=St.n?['완료','ok']:['진행 중','info']],
    ['여유','10-27 ~ 10-29','누락 확인, 재녹화','재녹화 대상 전부',a.redo?'대상 '+a.redo+'건':'대상 없음',['예정','mute']],
    ['종료','10-30','운영 종료. 이후 재녹화 불가','-','-',['예정','mute']],
    ['11월','11-02 ~ 11-30','편집, 자막, 기록 문서 작성. 1차 납품 후 의견 반영, 11-30 최종 납품','-','-',['예정','mute']]
  ];
  const rs=risks();
  return head('종료 전에 무엇을 기록했고 무엇이 남았는지를 매주 같은 표로 보고합니다.',btn({icon:'list',label:'기록 대상 목록 보기',attrs:'data-go="items"'}))+
    '<div class="dash"><div class="dday"><div class="k">운영 종료까지</div><div class="v">D-'+dday+'</div><div class="s">종료일 '+END+'. 이후에는 다시 녹화할 수 없습니다.</div></div>'+prog+'</div>'+
    '<h2 class="sh">사용자 유형별 <span class="meta">기록 대상 '+a.n+'건 (메뉴 '+new Set(S.units.map(u=>u.id)).size+'개 x 사용자 유형)</span></h2>'+
    '<div class="tw"><table class="t"><thead><tr><th>유형</th><th class="r">대상</th>'+STG.map(s=>'<th class="r">'+s[1]+'</th>').join('')+'<th class="r">재녹화 필요</th></tr></thead><tbody>'+
    [['T',T],['S',St]].map(x=>'<tr><td>'+ut(x[0])+'</td><td class="r num">'+x[1].n+'</td>'+STG.map(s=>'<td class="r num">'+x[1][s[0]].d+' <span class="small">('+x[1][s[0]].p+'%)</span></td>').join('')+'<td class="r num">'+(x[1].redo?'<b style="color:var(--bad)">'+x[1].redo+'</b>':'0')+'</td></tr>').join('')+'</tbody></table></div>'+
    '<h2 class="sh">주차별 계획 대비 실적</h2><div class="tw"><table class="t" style="min-width:720px"><thead><tr><th>주차</th><th>기간</th><th>할 일</th><th class="r">계획</th><th class="r">실적</th><th>상태</th></tr></thead><tbody>'+
    wk.map(w=>'<tr><td><b>'+w[0]+'</b></td><td class="num">'+w[1]+'</td><td>'+w[2]+'</td><td class="r num">'+w[3]+'</td><td class="r num">'+w[4]+'</td><td>'+st(w[5][0],w[5][1])+'</td></tr>').join('')+'</tbody></table></div>'+
    '<h2 class="sh">위험 항목 <span class="meta">미착수, 재녹화 필요</span></h2>'+
    (rs.length?'<div class="tw rl rl-kv"><table class="t"><thead><tr><th>메뉴</th><th>사유</th><th>유형</th><th>메모</th><th>조치 기한</th></tr></thead><tbody>'+rs.map(r=>'<tr><td data-k="메뉴"><b>'+r.u.id+'</b> '+esc(r.u.name)+'</td><td class="stc">'+st(r.why,r.k)+'</td><td data-k="유형">'+ut(r.u.t)+'</td><td class="full">'+esc(r.u.memo||'-')+'</td><td data-k="조치 기한" class="num">10-23 (늦어도 10-29)</td></tr>').join('')+'</tbody></table></div>'
      :'<p class="note ok">'+ic('check')+'미착수나 재녹화가 필요한 항목이 없습니다.</p>')+
    '<p class="note">'+ic('alert')+'10-24까지 전량 녹화를 끝내고 10-27 ~ 10-29를 재녹화 여유분으로 둡니다. 일정과 수치는 10-07 착수를 가정한 예시입니다.</p>';
}

/* ===== 2. 기록 대상 목록 ===== */
function cell(u,k){
  const v=u[k]; const lab={done:'완료',todo:'대기',redo:'재녹화'}[v];
  return '<button type="button" class="cellbtn '+v+'" data-cell="'+u.id+'|'+u.t+'|'+k+'" aria-label="'+esc(u.name)+' '+UT[u.t]+' '+STG.find(x=>x[0]===k)[1]+' '+lab+'">'+(v==='done'?ic('check'):'')+lab+'</button>';
}
function viewItems(){
  const f=UI.f;
  const list=S.units.filter(u=>(f.t==='전체'||UT[u.t]===f.t)&&(!f.open||u.conf!=='done'));
  let rows='', g='';
  list.forEach(u=>{ if(u.grp!==g){g=u.grp;rows+='<tr class="grp"><td colspan="7">'+g+'</td></tr>';}
    rows+='<tr><td class="num c-id">'+u.id+'</td><td class="c-nm"><span class="m-id num">'+u.id+'</span>'+esc(u.name)+(u.memo?'<div class="small">'+esc(u.memo)+'</div>':'')+'</td><td class="c-ty">'+ut(u.t)+'</td>'+STG.map(s=>'<td class="c c-st" data-k="'+s[1]+'">'+cell(u,s[0])+'</td>').join('')+'</tr>';});
  const a=stats(list);
  return head('메뉴와 사용자 유형을 한 줄씩 적은 전수 목록입니다. 이 목록이 녹화 체크리스트가 되고, 대상은 협의해 확정합니다.')+
    '<div class="bar"><label for="ft" class="small">사용자 유형</label><select id="ft" class="f">'+['전체','교사','학생'].map(x=>'<option'+(f.t===x?' selected':'')+'>'+x+'</option>').join('')+'</select>'+
    '<label class="chk"><input type="checkbox" id="fo"'+(f.open?' checked':'')+'>미완료만</label><span class="grow"></span><span class="small">'+list.length+'건 표시 / 확인 완료 '+a.conf.d+'건</span></div>'+
    (list.length?'<div class="tw rl-it"><table class="t"><thead><tr><th>번호</th><th>메뉴 (예시)</th><th>유형</th>'+STG.map(s=>'<th class="c">'+s[1]+'</th>').join('')+'</tr></thead><tbody>'+rows+'</tbody></table></div>'
      :empty('check','남은 항목이 없습니다','이 조건에서는 모든 항목이 확인 완료 상태입니다.','<button type="button" class="btn" data-act="resetF">전체 보기</button>'))+
    '<p class="note">'+ic('alert')+'상태 칸을 누르면 바뀝니다. 앞 단계가 끝나야 다음 단계를 완료로 바꿀 수 있습니다 (녹화, 캡처, 가림 검수, 확인 완료 순). 메뉴 이름은 일반적인 교육 서비스의 예시입니다.</p>';
}

/* ===== 3. 기록 문서 견본 ===== */
function docPage(kind){
  if(kind==='toc'){
    let pg=4, rows='';
    MENU.forEach((g,gi)=>{rows+='<tr class="lv1"><td>'+(gi+2)+'. '+g[0]+'</td><td class="pg">'+pg+'</td></tr>';
      g[1].forEach(m=>{rows+='<tr><td class="ind">'+m[0]+' <span style="color:#6b7280">('+m[1].split('').map(t=>UT[t]).join(', ')+')</span></td><td class="pg">'+pg+'</td></tr>';pg+=m[1].length;});});
    return '<article class="a4" aria-label="기록 문서 견본, 목차 쪽"><div class="rh"><span>운영 기록 문서 (견본)</span><span>목차</span></div>'+
      '<h2>목차</h2><table class="toc"><tbody><tr class="lv1"><td>1. 시스템 개요와 메뉴 체계</td><td class="pg">2</td></tr><tr><td class="ind">전체 메뉴 구조</td><td class="pg">2</td></tr><tr><td class="ind">사용자 유형별 이용 흐름 (교사, 학생)</td><td class="pg">3</td></tr>'+rows+
      '<tr class="lv1"><td>부록. 영상·이미지 파일 목록</td><td class="pg">'+pg+'</td></tr></tbody></table>'+
      '<div class="rf"><span>메뉴 이름과 쪽 번호는 예시입니다.</span><span>- 1 -</span></div></article>';
  }
  return '<article class="a4" aria-label="기록 문서 견본, 화면 설명 쪽"><div class="rh"><span>운영 기록 문서 (견본)</span><span>4. 학급 관리</span></div>'+
    '<h2>4.3 과제 배정</h2><div class="path">메뉴 경로: 학급 관리 &gt; 과제 배정 &nbsp;/&nbsp; 사용자 유형: 교사 &nbsp;/&nbsp; 메뉴 번호: M-16</div>'+
    '<div class="shotbox"><span class="mark" style="left:24px;top:20px">1</span><span class="mark" style="left:34%;top:24%">2</span><span class="mark" style="right:28px;bottom:22px">3</span><span>화면 캡처가 들어갈 자리</span><small>CAP_T_M16_과제배정_01.png (원본 해상도 1920 x 1080)</small></div>'+
    '<div class="cap">그림 4-5. 과제 배정 화면. 개인정보는 가림 처리 후 수록합니다.</div>'+
    '<h3>기능 설명</h3><p>교사가 학급 학생에게 읽을 도서와 활동을 과제로 지정하는 화면입니다. 화면의 번호는 아래 이용 절차의 번호와 같습니다.</p>'+
    '<h3>이용 절차</h3><ol><li>학급을 고르고 과제 만들기를 누릅니다.</li><li>도서와 활동 종류, 제출 기한을 정합니다.</li><li>배정을 누르면 학생 화면의 과제 목록에 나타납니다.</li></ol>'+
    '<h3>관련 기록 파일</h3><table><thead><tr><th>구분</th><th>파일명</th><th>위치</th></tr></thead><tbody><tr><td>영상</td><td>REC_T_M16_과제배정_v1.mp4</td><td>00:00:00 ~ 00:02:10</td></tr><tr><td>이미지</td><td>CAP_T_M16_과제배정_01.png ~ 03.png</td><td>3장</td></tr><tr><td>연결 화면</td><td>M-17 제출 현황 조회, M-11 독후 활동 제출 (학생)</td><td>19쪽, 14쪽</td></tr></tbody></table>'+
    '<div class="rf"><span>메뉴 이름과 설명은 예시이며 실제 화면을 담고 있지 않습니다.</span><span>- 18 -</span></div></article>';
}
function viewDoc(){
  return head('납품할 PDF 기록 문서의 한 쪽이 어떤 모양인지 보여 주는 견본입니다. 실제 화면 대신 캡처가 들어갈 자리만 표시했습니다.',btn({icon:'printer',label:'인쇄',iconM:true,attrs:'data-act="print"'}))+
    '<div class="chtabs" role="tablist" style="display:flex;border-bottom:1px solid var(--line);margin-bottom:12px"><button type="button" role="tab" class="tabb" data-page="shot" aria-selected="'+(UI.page==='shot')+'">화면 설명 쪽</button><button type="button" role="tab" class="tabb" data-page="toc" aria-selected="'+(UI.page==='toc')+'">목차 쪽</button></div>'+
    '<div class="a4wrap" id="a4wrap"><div class="a4scale" id="a4scale">'+docPage(UI.page)+'</div></div>'+
    '<p class="note">'+ic('file')+'한 메뉴가 한 쪽 이상을 차지하고, 쪽마다 메뉴 경로, 사용자 유형, 화면 이미지, 기능 설명, 이용 절차, 관련 영상 위치를 같은 순서로 적습니다. 장기 보존에 쓰는 PDF/A 형식으로 납품합니다.</p>';
}
function fitA4(){
  const w=$('a4wrap'), s=$('a4scale'); if(!w||!s) return;
  const a=s.firstElementChild; const avail=w.clientWidth-parseFloat(getComputedStyle(w).paddingLeft)*2;
  const k=Math.min(1,avail/794);
  s.style.transform='scale('+k+')'; s.style.width='794px';
  s.style.marginLeft=k<1?'0':Math.max(0,(avail-794)/2)+'px';
  s.style.height=(a.offsetHeight*k)+'px';
}
window.addEventListener('resize',fitA4);

/* ===== 4. 가림 검수표 ===== */
function viewMask(){
  const n=S.masks.length, d=S.masks.filter(m=>m.done).length, ok=S.masks.filter(m=>m.ok).length;
  return head('영상과 이미지에서 개인정보가 보이는 구간을 한 줄씩 적고, 처리와 검수를 따로 확인합니다.')+
    '<div class="bar"><span class="small">전체 '+n+'건</span>'+st('가림 처리 '+d+' / '+n,d===n?'ok':'warn')+st('검수 확인 '+ok+' / '+n,ok===n?'ok':'warn')+'</div>'+
    '<div class="tw"><table class="t" style="min-width:760px"><thead><tr><th>파일</th><th>구간</th><th>노출 항목</th><th>처리 방식</th><th>가림 처리</th><th class="c">검수자 확인</th></tr></thead><tbody>'+
    S.masks.map((m,i)=>'<tr><td><code class="fn">'+esc(m.file)+'</code></td><td class="num">'+m.tc+'</td><td>'+esc(m.item)+'</td><td>'+m.how+'</td><td>'+(m.done?st('처리함','ok'):st('처리 전','mute'))+'</td>'+
      '<td class="c"><button type="button" class="cellbtn '+(m.ok?'done':'todo')+'" data-mk="'+i+'" aria-label="'+esc(m.file)+' 검수 '+(m.ok?'확인됨':'대기')+'">'+(m.ok?ic('check')+'확인':'대기')+'</button></td></tr>').join('')+'</tbody></table></div>'+
    '<div class="sign"><table><thead><tr><th>작업자</th><th>검수자</th><th>발주 기관 확인</th></tr></thead><tbody><tr><td>(서명)</td><td>(서명)</td><td>(서명)</td></tr></tbody></table></div>'+
    '<p class="note">'+ic('shield')+'가림 기준(이름, 학번, 학급명, 연락처 등)은 착수 때 함께 정합니다. 가상 데이터로 녹화하더라도 실제 정보가 섞여 보이는 구간은 이 표로 걸러 냅니다. 파일명과 구간은 예시입니다.</p>';
}

/* ===== 5. 납품물 목록 ===== */
function viewDeliv(){
  const ok=S.deliv.filter(d=>d.ok).length;
  return head('최종 납품(11-30)에 들어가는 파일의 종류, 형식, 이름 규칙입니다. 범용 프로그램에서 열리는지 하나씩 확인해 표시합니다.')+
    '<div class="box sub" style="margin-bottom:12px"><b>파일명 규칙</b> &nbsp;<code class="fn">구분_사용자유형_메뉴번호_메뉴명_판.확장자</code><div class="small" style="margin-top:4px">구분: REC 영상, CAP 이미지, DOC 문서, RAW 원본 / 사용자 유형: T 교사, S 학생 / 예: REC_T_M16_과제배정_v1.mp4</div></div>'+
    '<div class="tw"><table class="t" style="min-width:820px"><thead><tr><th>구분</th><th>파일</th><th>형식</th><th class="r">용량 (예상)</th><th>상태</th><th class="c">재생·열람 확인</th></tr></thead><tbody>'+
    S.deliv.map((d,i)=>'<tr><td>'+d.kind+'</td><td><code class="fn">'+esc(d.file)+'</code></td><td>'+d.fmt+'</td><td class="r num">'+d.size+'</td><td>'+st(d.st,'mute')+'</td>'+
      '<td class="c"><button type="button" class="cellbtn '+(d.ok?'done':'todo')+'" data-dv="'+i+'" aria-label="'+esc(d.file)+' 확인 '+(d.ok?'완료':'대기')+'">'+(d.ok?ic('check')+'확인':'대기')+'</button></td></tr>').join('')+'</tbody></table></div>'+
    '<div class="bar" style="margin-top:10px"><span class="small">재생·열람 확인 '+ok+' / '+S.deliv.length+'건</span></div>'+
    '<p class="note">'+ic('box')+'영상은 별도 프로그램 없이 재생되는 MP4, 문서는 PDF로 드리고, 녹화 원본과 편집 과정의 원본 파일 일체를 함께 넘깁니다. 용량과 개수는 예시입니다.</p>';
}

/* ===== guide ===== */
const GUIDE=[
  {k:'status',t:'기록 현황',d:'종료까지 남은 일수와 단계별 완료율을 봅니다.'},
  {k:'items',t:'기록 대상 목록',d:'메뉴와 사용자 유형별 전수 체크리스트입니다.'},
  {k:'doc',t:'기록 문서 견본',d:'납품할 PDF 한 쪽의 구성입니다.'},
  {k:'mask',t:'가림 검수표',d:'개인정보 노출 구간과 검수 확인입니다.'},
  {k:'deliv',t:'납품물 목록',d:'파일 형식, 이름 규칙, 열람 확인입니다.'}
];
function renderGuide(){
  const g=$('guide');
  if(UI.guideOpen===null) UI.guideOpen=window.matchMedia('(min-width:1101px)').matches;
  g.className='guide'+(UI.guideOpen?'':' closed');
  document.body.classList.toggle('guide-open',!!UI.guideOpen);
  g.innerHTML='<button type="button" class="gh" data-act="toggleGuide" aria-expanded="'+UI.guideOpen+'" aria-controls="guideList"><span>시연 안내</span>'+ic(UI.guideOpen?'down':'up')+'</button>'+
    '<ol id="guideList">'+GUIDE.map((s,i)=>'<li><button type="button" data-guide="'+s.k+'"'+(UI.guideStep===s.k?' aria-current="step"':'')+'><b><span class="n">'+(i+1)+'.</span>'+s.t+'</b>'+(UI.guideStep===s.k?'<span class="d">'+s.d+'</span>':'')+'</button></li>').join('')+'</ol>';
}

/* ===== render & events ===== */
const VIEWS={status:viewStatus,items:viewItems,doc:viewDoc,mask:viewMask,deliv:viewDeliv};
function render(){renderShell();$('main').innerHTML=VIEWS[UI.view]();renderGuide();if(UI.view==='doc')requestAnimationFrame(fitA4);}
document.addEventListener('click',(e)=>{
  const t=e.target.closest('button'); if(!t) return; const d=t.dataset;
  if(d.guide){UI.guideStep=d.guide;if(window.matchMedia('(max-width:1100px)').matches)UI.guideOpen=false;if(d.guide==='items')UI.f={open:false,t:'전체'};go(d.guide);return;}
  if(d.go){go(d.go);return;}
  if(d.page){UI.page=d.page;render();return;}
  if(d.cell){
    const [id,ty,k]=d.cell.split('|'); const u=S.units.find(x=>x.id===id&&x.t===ty); const idx=STG.findIndex(s=>s[0]===k);
    if(u[k]==='done'){
      withLoading('상태 저장 중...',()=>{for(let i=idx;i<STG.length;i++)u[STG[i][0]]='todo';toast(u.id+' '+u.name+' ('+UT[ty]+'): '+STG[idx][1]+'부터 대기로 되돌렸습니다.');render();});return;}
    if(idx>0&&u[STG[idx-1][0]]!=='done'){toast(STG[idx-1][1]+' 단계가 끝나야 '+STG[idx][1]+' 단계를 완료로 바꿀 수 있습니다.','bad');return;}
    withLoading('상태 저장 중...',()=>{u[k]='done';if(k==='rec')delete u.memo;toast(u.id+' '+u.name+' ('+UT[ty]+'): '+STG[idx][1]+' 완료로 바꿨습니다.');render();});return;}
  if(d.mk!=null){const m=S.masks[Number(d.mk)];
    if(!m.ok&&!m.done){toast('가림 처리가 끝난 건만 검수 확인할 수 있습니다.','bad');return;}
    withLoading('검수 확인 저장 중...',()=>{m.ok=!m.ok;toast(m.ok?'검수 확인으로 표시했습니다.':'검수 확인을 취소했습니다.');render();});return;}
  if(d.dv!=null){const x=S.deliv[Number(d.dv)];withLoading('확인 저장 중...',()=>{x.ok=!x.ok;toast(x.ok?'재생·열람 확인으로 표시했습니다.':'확인을 취소했습니다.');render();});return;}
  switch(d.act){
    case 'toggleGuide': UI.guideOpen=!UI.guideOpen; renderGuide(); return;
    case 'resetF': UI.f={open:false,t:'전체'}; render(); return;
    case 'print': $('printHost').innerHTML=docPage(UI.page); if(!navigator.webdriver) window.print(); return;
  }
});
document.addEventListener('change',(e)=>{
  const i=e.target;
  if(i.id==='ft'){UI.f.t=i.value;render();return;}
  if(i.id==='fo'){UI.f.open=i.checked;render();return;}
});
window.addEventListener('hashchange',route);
route();
})();
