(function(){
"use strict";
const ic=(n)=>'<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-'+n+'"/></svg>';
const esc=(s)=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=(id)=>document.getElementById(id);
const pad=(n)=>String(n).padStart(2,'0');
/* 시연 기준 시각: 2026-11-02 14:20 (분 단위로 흐른다) */
let NOW=14*60+20;
const hm=(m)=>pad(Math.floor(m/60))+':'+pad(m%60);
const ago=(m)=>{const d=NOW-m;return d<1?'방금':d<60?d+'분 전':Math.floor(d/60)+'시간 전';};

/* ===== 기준 데이터 (예시) ===== */
const PROPS=[
  {k:'A',name:'○○스테이 1호점',rooms:['독채'],},
  {k:'B',name:'○○스테이 2호점',rooms:['한옥 1호실','한옥 2호실']},
  {k:'C',name:'○○스테이 3호점',rooms:['숲 101','숲 102','숲 103','숲 104']}
];
const CH=['플랫폼 A','플랫폼 B','플랫폼 C','플랫폼 D'];
const CHS={
  '플랫폼 A':{conn:'정상',hook:'정상',last:14*60+18},
  '플랫폼 B':{conn:'정상',hook:'정상',last:14*60+16},
  '플랫폼 C':{conn:'정상',hook:'비활성',last:14*60+8,hookOff:14*60+8},
  '플랫폼 D':{conn:'정상',hook:'정상',last:14*60+11}
};
const TYPES=['취소 반영','요금 전송','메시지','예약 변경 알림'];
const F=(id,type,prop,room,ch,why,tries,next,rsv,desc)=>({id,type,prop,room,ch,why,tries,next,rsv,desc,state:'wait'});
const S={
  env:'live',
  fails:[
    F('JOB-4471','취소 반영','B','한옥 1호실','플랫폼 B','시간 초과',2,14*60+26,'RSV-2611-0187','11/07~11/10 취소 확인 전송'),
    F('JOB-4468','요금 전송','A','독채','플랫폼 C','호출 제한',3,14*60+31,'','11/14~11/15 주말 요금 180,000원'),
    F('JOB-4465','요금 전송','C','숲 102','플랫폼 C','호출 제한',1,14*60+24,'','11/16~11/20 평일 요금 95,000원'),
    F('JOB-4462','메시지','A','독채','플랫폼 D','인증 실패',3,null,'RSV-2611-0179','게스트 메시지 1건 (체크인 안내)'),
    F('JOB-4459','예약 변경 알림','C','숲 104','플랫폼 C','응답 유실',2,14*60+29,'RSV-2611-0183','인원 2명 → 3명 변경 반영'),
    F('JOB-4455','취소 반영','C','숲 101','플랫폼 B','응답 유실',1,14*60+23,'RSV-2611-0168','11/17~11/18 취소 확인 전송'),
    F('JOB-4451','요금 전송','B','한옥 2호실','플랫폼 D','시간 초과',2,14*60+27,'','11/11 단일 요금 210,000원')
  ],
  doneJobs:[],
  events:[
    {id:'EV-1102-7f3a',type:'booking_cancelled',rsv:'RSV-2611-0187',ch:'플랫폼 B',at:'13:55:02',st:'처리 완료',ack:'13:55:02.184',note:''},
    {id:'EV-1101-c21e',type:'booking_modified',rsv:'RSV-2611-0187',ch:'플랫폼 B',at:'13:55:09',st:'순서 보정',ack:'13:55:09.091',note:'11/01 변경 알림이 취소 뒤에 늦게 도착. 최신 상태(취소) 유지'},
    {id:'EV-1102-a90b',type:'booking_new',rsv:'RSV-2611-0191',ch:'플랫폼 A',at:'14:02:44',st:'처리 완료',ack:'14:02:44.210',note:''},
    {id:'EV-1102-a90b',type:'booking_new',rsv:'RSV-2611-0191',ch:'플랫폼 A',at:'14:02:51',st:'중복 무시',ack:'14:02:51.077',note:'같은 이벤트 ID 재수신'},
    {id:'EV-1102-5d12',type:'message_new',rsv:'RSV-2611-0179',ch:'플랫폼 D',at:'14:05:13',st:'처리 완료',ack:'14:05:13.402',note:''},
    {id:'EV-1102-3b77',type:'booking_modified',rsv:'RSV-2611-0183',ch:'플랫폼 C',at:'14:06:30',st:'재시도 중',ack:'14:06:30.155',note:'처리 실패 → 실패 건 JOB-4459'},
    {id:'EV-1102-0e48',type:'booking_new',rsv:'RSV-2611-0185',ch:'플랫폼 B',at:'14:09:57',st:'처리 완료',ack:'14:09:57.233',note:'재시작 후 복구',rec:1},
    {id:'EV-1102-1c09',type:'booking_modified',rsv:'RSV-2611-0172',ch:'플랫폼 B',at:'14:10:04',st:'처리 완료',ack:'14:10:04.118',note:'재시작 후 복구',rec:1},
    {id:'EV-1102-8a61',type:'message_new',rsv:'RSV-2611-0191',ch:'플랫폼 A',at:'14:14:20',st:'처리 완료',ack:'14:14:20.301',note:''},
    {id:'EV-1102-6f20',type:'booking_new',rsv:'RSV-2611-0193',ch:'플랫폼 D',at:'14:17:41',st:'대기',ack:'14:17:41.066',note:'처리 대기열 2번째'},
    {id:'EV-1102-9c33',type:'booking_cancelled',rsv:'RSV-2611-0168',ch:'플랫폼 B',at:'14:18:05',st:'재시도 중',ack:'14:18:05.140',note:'취소 확인 전송 실패 → JOB-4455'}
  ],
  recon:{last:14*60,checked:308,rows:[
    {k:'m1',rsv:'RSV-2611-0172',prop:'C',room:'숲 103',ch:'플랫폼 B',inner:'취소',ext:'예약 유지',kind:'불일치',act:'재동기화',st:'wait'},
    {k:'m2',rsv:'PC-773105',prop:'A',room:'독채',ch:'플랫폼 C',inner:'없음',ext:'확정 11/21~11/22',kind:'빠진 예약',act:'보충',st:'wait'},
    {k:'m3',rsv:'PC-773118',prop:'C',room:'숲 102',ch:'플랫폼 C',inner:'없음',ext:'확정 11/28~11/30',kind:'빠진 예약',act:'보충',st:'wait'}
  ],result:'확인 308건 · 불일치 1건 · 빠진 예약 2건 (플랫폼 C 웹훅 비활성 기간)'},
  flags:{test:{A:true,B:true,C:true},live:{A:true,B:false,C:false}},
  flagLog:[{at:'10-31 10:30',t:'운영 환경 1호점 새 처리 방식 켬'},{at:'10-29 16:05',t:'시험 환경 1·2·3호점 새 처리 방식 켬'}],
  alertCfg:{sms:true,mail:true,rate:'5',hook:'10',conn:true,exhaust:true,saved:'10-31 10:32'},
  sel:{},
  rateSeq:3105,rateLog:[]
};
const UI={view:'ui01',flt:{type:'',ch:''},evf:'',guideOpen:null,guideStep:null};
const propName=(k)=>PROPS.find(p=>p.k===k).name;
const activeFails=()=>S.fails.filter(f=>f.state!=='gone');
const failCnt=(ch)=>activeFails().filter(f=>f.ch===ch).length;

function go(v){if(location.hash==='#/'+v) route(); else location.hash='#/'+v;}
function route(){const v=location.hash.replace(/^#\/?/,'').split('/')[0];UI.view=MENU.some(m=>m[0]===v)?v:'ui01';if(Date.now()-(toast.at||0)>300)$('toastHost').innerHTML='';render();window.scrollTo(0,0);}
function toast(msg,kind){toast.at=Date.now();const h=$('toastHost');h.innerHTML='<div class="toast'+(kind==='bad'?' bad':'')+'" role="'+(kind==='bad'?'alert':'status')+'">'+ic(kind==='bad'?'alert':'check')+'<span>'+esc(msg)+'</span></div>';clearTimeout(toast.t);toast.t=setTimeout(()=>{h.innerHTML='';},3600);}
let busy=false;
function withLoading(msg,fn,ms){if(busy)return;busy=true;$('overlayHost').innerHTML='<div class="overlay" role="status" aria-live="assertive"><div class="ob"><span class="spin" aria-hidden="true"></span><span>'+esc(msg)+'</span></div></div>';setTimeout(()=>{$('overlayHost').innerHTML='';busy=false;fn();},ms||480);}
const btn=(o)=>'<button type="button" class="btn '+(o.cls||'')+'" '+(o.attrs||'')+'>'+(o.icon?ic(o.icon):'')+(o.cls&&o.cls.indexOf('icon-m')>=0?'<span class="lbl">'+esc(o.label)+'</span>':esc(o.label))+'</button>';
const lb=(t)=>{const k={'성공':'ok','처리 완료':'ok','정상':'ok','켜짐':'ok','재시도 중':'warn','처리 중':'warn','대기':'mute','중복 무시':'mute','순서 보정':'info','실패':'bad','비활성':'bad','끊김':'bad','수동 처리 필요':'bad','꺼짐':'mute','유지':'info','확정':'ok','취소':'mute','일치':'ok','불일치':'bad','반영 확인':'ok','확인 필요':'warn','확인 불가':'mute','판매 가능':'ok','계산 완료':'ok','계산 보류':'warn','완료':'ok','확인 중':'warn','언급 없음':'mute','충족':'ok','관찰 중':'warn','제외':'mute','지원':'ok','미지원':'mute','미확인':'warn','발송 완료':'ok','발송 실패':'bad','근거 부족':'warn','운영자 확인':'bad','운영자 이관':'info','재대조 필요':'warn','검토 후 발송':'ok'}[t]||'mute';
  const i={'ok':'check','bad':'x'}[k];return '<span class="lb '+k+'">'+(i?ic(i):'')+esc(t)+'</span>';};
const empty=(i,t,d,b)=>'<div class="empty">'+ic(i)+'<strong>'+esc(t)+'</strong><p>'+esc(d)+'</p>'+(b||'')+'</div>';
const head=(t,sub,acts)=>'<div class="ph"><div><h1>'+t+'</h1>'+(sub?'<div class="sub">'+sub+'</div>':'')+'</div>'+(acts?'<div class="acts">'+acts+'</div>':'')+'</div>';

/* ===== 1. 연동 현황 ===== */
function alarmLine(){
  const a=CHS['플랫폼 C'];
  if(a.hook==='비활성') return '<div class="alarm" role="alert">'+ic('alert')+'<span><b>플랫폼 C 웹훅 비활성 감지</b> '+ago(a.hookOff)+' ('+hm(a.hookOff)+'부터). 그동안 들어온 예약은 기록 대조로 보충합니다.</span><span class="sp"></span>'+btn({cls:'sm',icon:'plug',label:'웹훅 다시 켜기',attrs:'data-act="hookOn"'})+btn({cls:'sm',label:'기록 대조로',attrs:'data-go="recon"'})+'</div>';
  return '<div class="alarm ok" role="status">'+ic('check')+'<span><b style="color:var(--ok)">4채널 연결·웹훅 정상</b> 마지막 점검 '+hm(NOW)+'</span></div>';
}
function vStatus(){
  const af=activeFails();
  return head('연동 현황','Channex를 거친 4채널의 연결, 예약 변경 알림(웹훅), 마지막 정상 반영 시각입니다.',btn({icon:'retry',label:'지금 점검',attrs:'data-act="check"'}))+alarmLine()+
    '<div class="sumline"><div>처리 대기 실패 건<b class="'+(af.length?'bad':'')+'">'+af.length+'</b></div><div>오늘 받은 알림<b>'+(146+S.events.length)+'</b></div><div>오늘 재처리 성공<b>'+(9+S.doneJobs.length)+'</b></div><div>마지막 기록 대조<b>'+hm(S.recon.last)+'</b></div></div>'+
    '<div class="panel"><div class="hd"><h3>채널별 상태</h3><span class="small">최근 24시간 기준</span></div><div class="tw"><table class="t"><thead><tr><th>채널</th><th>연결</th><th>웹훅</th><th>마지막 정상 반영</th><th class="r">24시간 실패</th><th>실패 유형</th><th></th></tr></thead><tbody>'+
    CH.map(c=>{const s=CHS[c],n=failCnt(c);const types=[...new Set(af.filter(f=>f.ch===c).map(f=>f.type))].join(', ');
      return '<tr><td class="chn">'+c+'<small>Channex 경유</small></td><td>'+lb(s.conn)+'</td><td>'+lb(s.hook)+'</td><td class="num">'+hm(s.last)+' <span class="small">('+ago(s.last)+')</span></td><td class="r num">'+(n?'<b style="color:var(--bad)">'+n+'건</b>':'0건')+'</td><td>'+(types?esc(types):'<span class="small">없음</span>')+'</td><td class="r">'+(n?btn({cls:'sm',label:'실패 건 보기',attrs:'data-fch="'+c+'"'}):'')+'</td></tr>';}).join('')+
    '</tbody></table></div></div>'+
    '<div class="panel"><div class="hd"><h3>최근 실패</h3>'+btn({cls:'sm',label:'실패 건 목록 전체',attrs:'data-go="fails"'})+'</div>'+(af.length?'<div class="tw"><table class="t"><thead><tr><th>작업</th><th>유형</th><th>숙소·객실</th><th>채널</th><th>사유</th><th class="r">재시도</th></tr></thead><tbody>'+
      af.slice(0,4).map(f=>'<tr><td class="mono">'+f.id+'</td><td>'+f.type+'</td><td>'+esc(propName(f.prop))+' · '+esc(f.room)+'</td><td>'+f.ch+'</td><td>'+lb('실패')+' '+f.why+'</td><td class="r num">'+f.tries+'회</td></tr>').join('')+'</tbody></table></div>':'<div class="bd">'+empty('check','처리할 실패 건이 없습니다','모든 채널 반영이 정상입니다.')+'</div>')+'</div>';
}

/* ===== 2. 실패 건 목록 ===== */
function vFails(){
  const f=UI.flt, L=S.fails.filter(x=>x.state!=='gone'&&(!f.type||x.type===f.type)&&(!f.ch||x.ch===f.ch));
  const selN=L.filter(x=>S.sel[x.id]&&x.state==='wait').length;
  const all=L.length&&L.every(x=>S.sel[x.id]||x.state!=='wait');
  return head('실패 건 목록','채널에 반영하지 못한 작업입니다. 유형별로 간격을 늘려 자동으로 다시 시도하고, 끝내 실패하면 여기서 재처리합니다.',btn({cls:'pri',icon:'retry',label:'선택 재처리'+(selN?' ('+selN+')':''),attrs:'data-act="bulk"'+(selN?'':' disabled')}))+
    '<div class="panel"><div class="filters"><label for="ft">유형</label><select id="ft" class="f" data-flt="type"><option value="">전체</option>'+TYPES.map(t=>'<option'+(f.type===t?' selected':'')+'>'+t+'</option>').join('')+'</select><label for="fc">채널</label><select id="fc" class="f" data-flt="ch"><option value="">전체</option>'+CH.map(c=>'<option'+(f.ch===c?' selected':'')+'>'+c+'</option>').join('')+'</select><span class="grow"></span><span class="small">'+L.length+'건</span></div>'+
    (L.length?'<div class="tw"><table class="t"><thead><tr><th class="chcol"><label class="chk"><input type="checkbox" data-all="1"'+(all?' checked':'')+' aria-label="전체 선택"></label></th><th>작업</th><th>유형</th><th>숙소·객실</th><th>채널</th><th>실패 사유</th><th class="r">재시도</th><th>다음 재시도</th><th>내용</th><th>상태</th><th></th></tr></thead><tbody>'+
      L.map(x=>{const busyRow=x.state==='busy',ok=x.state==='ok';
        return '<tr class="'+(busyRow?'busy':ok?'done':S.sel[x.id]?'sel':'')+'"><td class="chcol"><label class="chk"><input type="checkbox" data-sel="'+x.id+'"'+(S.sel[x.id]?' checked':'')+(x.state!=='wait'?' disabled':'')+' aria-label="'+x.id+' 선택"></label></td>'+
        '<td class="mono">'+x.id+'</td><td>'+x.type+'</td><td>'+esc(propName(x.prop))+'<br><span class="small">'+esc(x.room)+'</span></td><td>'+x.ch+'</td><td>'+x.why+'</td><td class="r num">'+x.tries+'회</td><td class="num">'+(x.next==null?lb('수동 처리 필요'):hm(x.next))+'</td>'+
        '<td class="wrap">'+esc(x.desc)+(x.rsv?'<br><button type="button" class="idl" data-rsv="'+x.rsv+'">'+x.rsv+'</button>':'')+'</td>'+
        '<td>'+(busyRow?'<span class="lb warn"><span class="spin" style="width:12px;height:12px"></span>처리 중</span>':ok?lb('성공'):lb('실패'))+'</td>'+
        '<td class="r">'+(x.state==='wait'?btn({cls:'sm icon-m',icon:'retry',label:'재처리',attrs:'data-retry="'+x.id+'" data-tip="재처리"'}):'')+'</td></tr>';}).join('')+'</tbody></table></div>'
      :'<div class="bd">'+empty('check','처리할 실패 건이 없습니다','모든 작업이 채널에 반영되었습니다. 새 실패가 생기면 알림과 함께 여기에 나옵니다.',btn({label:'연동 현황 보기',attrs:'data-go="status"'}))+'</div>')+'</div>'+
    '<p class="note">'+ic('alert')+'재처리는 같은 작업 ID로 한 번만 실행됩니다. 이미 채널에 반영된 작업을 다시 눌러도 두 번 전송되지 않습니다.</p>'+
    (S.doneJobs.length?'<div class="panel"><div class="hd"><h3>오늘 재처리 완료</h3><span class="small">'+S.doneJobs.length+'건</span></div><div class="tw"><table class="t"><thead><tr><th>작업</th><th>유형</th><th>채널</th><th>처리 시각</th><th>결과</th></tr></thead><tbody>'+S.doneJobs.map(d=>'<tr><td class="mono">'+d.id+'</td><td>'+d.type+'</td><td>'+d.ch+'</td><td class="num">'+d.at+'</td><td>'+lb('성공')+'</td></tr>').join('')+'</tbody></table></div></div>':'');
}
function doRetry(ids){
  const xs=S.fails.filter(f=>ids.indexOf(f.id)>=0&&f.state==='wait');if(!xs.length)return;
  xs.forEach(x=>{x.state='busy';delete S.sel[x.id];});render();
  setTimeout(()=>{xs.forEach(x=>{x.state='ok';});if(UI.view==='fails')render();
    setTimeout(()=>{xs.forEach(x=>{x.state='gone';S.doneJobs.unshift({id:x.id,type:x.type,ch:x.ch,at:hm(NOW)});if(x.rsv==='RSV-2611-0187'&&x.type==='취소 반영')TL.bk='성공';S.events.forEach(ev=>{if(ev.note.indexOf(x.id)>=0){ev.st='처리 완료';ev.note='재처리 성공 ('+x.id+', '+hm(NOW)+')';}});});
      toast(xs.length+'건 재처리했습니다. 채널 반영을 확인했고 목록에서 뺐습니다.');render();},700);},550);
}

/* ===== 3. 예약 상세 타임라인 ===== */
const TL={bk:'재시도 중'};
function vRsv(){
  const st=(t)=>lb(t);
  const chTable=(rows)=>'<div class="tw"><table class="t"><thead><tr><th>채널</th><th>반영 내용</th><th>결과</th><th>시각</th></tr></thead><tbody>'+rows.map(r=>'<tr><td class="chn">'+r[0]+'</td><td>'+r[1]+'</td><td>'+st(r[2])+'</td><td class="num">'+r[3]+'</td></tr>').join('')+'</tbody></table></div>';
  return head('예약 상세','RSV-2611-0187 · 생성부터 취소까지 채널별 반영 결과와 받은 알림입니다.',btn({icon:'left',label:'실패 건 목록',attrs:'data-go="fails"'}))+
    '<div class="rsv"><div>예약<b class="mono">RSV-2611-0187</b></div><div>숙소·객실<b>○○스테이 2호점 · 한옥 1호실</b></div><div>예약 채널<b>플랫폼 B</b><span class="mono">PB-482137</span></div><div>게스트 · 현재 상태<b>김○○ · 취소</b></div></div>'+
    '<div class="panel"><div class="hd"><h3>처리 이력</h3><span class="small">24시간제, 받은 순서가 아니라 예약의 실제 순서로 보정해 표시</span></div><div class="bd"><ol class="tl">'+
    '<li><div class="tm"><b>10-31</b>09:12</div><div class="ev"><h4>예약 생성</h4><div class="meta">플랫폼 B에서 들어옴 · 11/07~11/09 2박, 성인 2</div>'+
      chTable([['플랫폼 A','11/07~11/08 재고 1 → 0','성공','09:12:06'],['플랫폼 C','11/07~11/08 재고 1 → 0','성공','09:12:07'],['플랫폼 D','11/07~11/08 재고 1 → 0','성공','09:12:07']])+
      '<div class="evrow"><span>받은 알림</span><span class="mono">EV-1031-41d2</span><span>booking_new</span>'+lb('처리 완료')+'<span>응답 09:12:05.312</span></div></div></li>'+
    '<li><div class="tm"><b>11-01</b>21:40</div><div class="ev"><h4>예약 변경</h4><div class="meta">1박 연장 · 11/07~11/10 3박</div>'+
      chTable([['플랫폼 A','11/09 재고 1 → 0','성공','21:40:12'],['플랫폼 C','11/09 재고 1 → 0','성공','21:40:13'],['플랫폼 D','11/09 재고 1 → 0','성공','21:40:13']])+
      '<div class="evrow"><span>받은 알림</span><span class="mono">EV-1101-c21e</span><span>booking_modified</span>'+lb('처리 완료')+'<span>21:40:11 첫 수신</span></div>'+
      '<div class="evrow"><span>같은 알림 재수신</span><span class="mono">EV-1101-c21e</span>'+lb('중복 무시')+'<span>21:41:02, 이벤트 ID가 같아 다시 처리하지 않음</span></div></div></li>'+
    '<li class="cancel"><div class="tm"><b>11-02</b>13:55</div><div class="ev"><h4>예약 취소</h4><div class="meta">게스트 취소 · 플랫폼 B 수신</div>'+
      chTable([['플랫폼 A','11/07~11/09 재고 0 → 1','성공','13:55:04'],['플랫폼 C','11/07~11/09 재고 0 → 1','성공','13:55:05'],['플랫폼 D','11/07~11/09 재고 0 → 1','성공','13:55:05'],['플랫폼 B','취소 확인 전송 (JOB-4471)',TL.bk,TL.bk==='성공'?'재처리 완료':'다음 14:26']])+
      '<div class="evrow"><span>받은 알림</span><span class="mono">EV-1102-7f3a</span><span>booking_cancelled</span>'+lb('처리 완료')+'<span>응답 13:55:02.184</span></div>'+
      '<div class="evrow"><span>늦게 온 이전 알림</span><span class="mono">EV-1101-c21e</span>'+lb('순서 보정')+'<span>13:55:09에 변경 알림이 다시 도착. 취소보다 이전 이벤트라 적용하지 않고 취소 상태 유지</span></div>'+
      '<div class="stock"><div class="small" style="margin-bottom:4px">취소 뒤 재고·판매 상태 복원</div><div class="tw"><table class="t"><thead><tr><th>날짜</th><th>재고</th><th>판매 상태</th><th>근거</th></tr></thead><tbody>'+
        '<tr><td class="num">11/07 (토)</td><td class="num">0 → 1</td><td>'+lb('정상')+' 판매 재개</td><td>이 예약으로 막혔던 날</td></tr>'+
        '<tr><td class="num">11/08 (일)</td><td class="num">0 → 1</td><td>'+lb('유지')+' 수동 판매중지 유지</td><td>운영자가 10-27에 직접 막은 날이라 풀지 않음</td></tr>'+
        '<tr><td class="num">11/09 (월)</td><td class="num">0 → 1</td><td>'+lb('정상')+' 판매 재개</td><td>변경으로 추가된 날</td></tr></tbody></table></div></div>'+
    '</div></li></ol></div></div>'+
    '<p class="note">'+ic('alert')+'같은 취소 알림이 다시 와도 재고는 한 번만 복원합니다. 다른 예약이 잡힌 날은 재고를 올리지 않습니다.</p>';
}

/* ===== 4. 이벤트 기록 ===== */
const EVST=['대기','처리 완료','중복 무시','재시도 중','순서 보정'];
function vEvents(){
  const L=S.events.filter(e=>!UI.evf||e.st===UI.evf).slice().reverse();
  return head('이벤트 기록','Channex에서 받은 예약 변경 알림입니다. 받자마자 이벤트 ID로 먼저 저장하고 처리 완료 응답을 보낸 뒤, 저장된 기록을 기준으로 처리합니다.')+
    '<div class="panel"><div class="filters"><label for="ef">처리 상태</label><select id="ef" class="f" data-evf="1"><option value="">전체</option>'+EVST.map(s=>'<option'+(UI.evf===s?' selected':'')+'>'+s+'</option>').join('')+'</select><span class="grow"></span><span class="small">오늘 13:50 이후 '+L.length+'건 표시</span></div>'+
    (L.length?'<div class="tw"><table class="t"><thead><tr><th>이벤트 ID</th><th>종류</th><th>예약</th><th>채널</th><th>수신</th><th>처리 상태</th><th>응답(ACK)</th><th>비고</th></tr></thead><tbody>'+
      L.map(e=>'<tr><td class="mono">'+e.id+'</td><td class="mono">'+e.type+'</td><td>'+(e.rsv==='RSV-2611-0187'?'<button type="button" class="idl" data-rsv="'+e.rsv+'">'+e.rsv+'</button>':'<span class="mono">'+e.rsv+'</span>')+'</td><td>'+e.ch+'</td><td class="num">'+e.at+'</td><td>'+lb(e.st)+'</td><td class="mono">'+e.ack+'</td><td class="wrap">'+(e.rec?'<span class="lb info">'+ic('retry')+'재시작 후 복구</span> ':'')+esc(e.rec?'14:09 서버 재시작 때 처리 중이던 건을 기록에서 다시 꺼내 처리':e.note)+'</td></tr>').join('')+'</tbody></table></div>'
      :'<div class="bd">'+empty('inbox','조건에 맞는 이벤트가 없습니다','처리 상태 조건을 바꿔 보세요.',btn({label:'전체 보기',attrs:'data-act="evAll"'}))+'</div>')+'</div>'+
    '<p class="note">'+ic('alert')+'응답(ACK)은 처리가 끝나기 전에 저장 직후 보냅니다. 그래서 Channex가 시간 초과로 알림을 끄지 않고, 처리 도중 서버가 재시작돼도 저장된 기록에서 이어서 처리합니다.</p>';
}

/* ===== 5. 기록 대조 ===== */
function vRecon(){
  const r=S.recon, open=r.rows.filter(x=>x.st!=='done');
  return head('기록 대조','내부 예약 데이터와 채널 기록을 주기적으로 비교합니다. 웹훅이 꺼진 동안 들어온 예약은 여기서 보충합니다.',btn({cls:'pri',icon:'compare',label:'지금 대조 실행',attrs:'data-act="recon"'}))+
    '<div class="sumline"><div>마지막 대조<b>'+hm(r.last)+'</b></div><div>대조 주기<b>30분</b></div><div>처리 대기<b class="'+(open.length?'bad':'')+'">'+open.length+'건</b></div></div>'+
    '<div class="alarm '+(open.length?'':'ok')+'" style="'+(open.length?'background:var(--warn-bg);border-color:#EBCB95;border-left-color:var(--warn)':'')+'">'+ic(open.length?'alert':'check')+'<span>'+esc(r.result)+'</span></div>'+
    '<div class="panel"><div class="hd"><h3>불일치·누락 목록</h3>'+(open.length>1?btn({cls:'sm',icon:'retry',label:'전체 처리',attrs:'data-act="reconAll"'}):'')+'</div>'+
    (r.rows.length?'<div class="tw"><table class="t"><thead><tr><th>구분</th><th>예약</th><th>숙소·객실</th><th>채널</th><th>내부 데이터</th><th>채널 기록</th><th>상태</th><th></th></tr></thead><tbody>'+
      r.rows.map(x=>'<tr><td>'+(x.kind==='빠진 예약'?'<span class="lb warn">빠진 예약</span>':'<span class="lb bad">불일치</span>')+'</td><td class="mono">'+x.rsv+'</td><td>'+esc(propName(x.prop))+' · '+esc(x.room)+'</td><td>'+x.ch+'</td><td>'+esc(x.inner)+'</td><td>'+esc(x.ext)+'</td><td>'+(x.st==='done'?lb('처리 완료'):lb('대기'))+'</td><td class="r">'+(x.st==='done'?'':btn({cls:'sm',icon:'retry',label:x.act==='보충'?'예약 보충':'수동 재동기화',attrs:'data-rec="'+x.k+'"'}))+'</td></tr>').join('')+'</tbody></table></div>'
      :'<div class="bd">'+empty('check','불일치가 없습니다','내부 데이터와 4채널 기록이 모두 같습니다.')+'</div>')+'</div>'+
    '<p class="note">'+ic('alert')+'재동기화는 채널 기록을 기준으로 내부 예약을 고치기 전에 변경 내용을 보여 주고, 실행 기록을 남깁니다. 실제 손님 예약을 자동으로 지우지 않습니다.</p>';
}
function reconDone(){const r=S.recon;const done=r.rows.filter(x=>x.st==='done');const fill=done.filter(x=>x.act==='보충').length,syn=done.filter(x=>x.act==='재동기화').length;
  r.result='마지막 대조 '+hm(r.last)+' · 확인 '+r.checked+'건'+(fill?' · 빠진 예약 '+fill+'건 보충':'')+(syn?' · 불일치 '+syn+'건 재동기화':'')+(r.rows.every(x=>x.st==='done')?' · 남은 불일치 없음':'');}

/* ===== 6. 반영 스위치 ===== */
function vFlags(){
  const env=S.env, fl=S.flags[env==='test'?'test':'live'];
  return head('반영 스위치','새 처리 방식(이벤트 기록·대기열·재시도)을 숙소별로 켜고 끕니다. 시험 환경에서 확인한 뒤 운영 환경은 숙소 한 곳부터 켭니다.')+
    '<div class="envnote">'+ic(env==='test'?'lock':'alert')+'<span>지금 보는 곳: <b>'+(env==='test'?'시험 환경':'운영 환경')+'</b>. '+(env==='test'?'Channex 시험 계정과 개인정보를 가린 복제 데이터로 동작합니다. 실제 손님 예약에 영향이 없습니다.':'실제 예약에 적용됩니다. 끄면 즉시 이전 처리 방식으로 돌아가며, 예약 데이터는 바뀌지 않습니다.')+' 화면 위 환경 전환으로 바꿀 수 있습니다.</span></div>'+
    '<div class="panel"><div class="hd"><h3>숙소별 새 처리 방식</h3><span class="small">'+(env==='test'?'시험 환경':'운영 환경')+'</span></div><div class="tw"><table class="t"><thead><tr><th>숙소</th><th class="r">객실</th><th>새 처리 방식</th><th>상태</th><th class="r">24시간 처리</th><th class="r">실패</th><th>비고</th></tr></thead><tbody>'+
    PROPS.map(p=>{const on=fl[p.k];const n=env==='test'?[38,22,51][PROPS.indexOf(p)]:[64,0,0][PROPS.indexOf(p)];
      return '<tr><td><b>'+esc(p.name)+'</b></td><td class="r num">'+p.rooms.length+'</td><td><label class="sw"><input type="checkbox" data-flag="'+p.k+'"'+(on?' checked':'')+' aria-label="'+esc(p.name)+' 새 처리 방식"><span class="tr"></span>'+(on?'켜짐':'꺼짐')+'</label></td><td>'+lb(on?'켜짐':'꺼짐')+'</td><td class="r num">'+(on?n+'건':'-')+'</td><td class="r num">'+(on?(env==='live'&&p.k==='A'?'0건':'0건'):'-')+'</td><td class="wrap small">'+(on?(env==='live'?'10-31부터 운영 적용, 이상 없음':'시험 시나리오 통과'):'이전 처리 방식으로 동작 중')+'</td></tr>';}).join('')+
    '</tbody></table></div></div>'+
    '<div class="panel"><div class="hd"><h3>변경 기록</h3></div><div class="tw"><table class="t"><thead><tr><th>일시</th><th>내용</th><th>변경자</th></tr></thead><tbody>'+S.flagLog.map(l=>'<tr><td class="num">'+l.at+'</td><td class="wrap">'+esc(l.t)+'</td><td>대표</td></tr>').join('')+'</tbody></table></div></div>';
}

/* ===== 7. 알림 설정 ===== */
function vAlerts(){
  const a=S.alertCfg;
  const sel=(id,v,opts)=>'<select id="'+id+'" class="f">'+opts.map(o=>'<option value="'+o[0]+'"'+(String(v)===o[0]?' selected':'')+'>'+o[1]+'</option>').join('')+'</select>';
  return head('알림 설정','연결·웹훅·실패율에 문제가 생기면 대표님께 먼저 알립니다.',btn({cls:'pri',icon:'check',label:'저장',attrs:'data-act="alertSave"'}))+
    '<div class="setgrid"><div class="panel"><div class="hd"><h3>받을 곳과 기준</h3><span class="small">마지막 저장 '+esc(a.saved)+'</span></div><div class="bd">'+
      '<div class="frow"><span>받을 곳</span><div class="opts"><label class="chk"><input type="checkbox" id="aSms"'+(a.sms?' checked':'')+'>문자 (대표 휴대폰, 등록됨)</label><label class="chk"><input type="checkbox" id="aMail"'+(a.mail?' checked':'')+'>메일 (대표 메일, 등록됨)</label></div></div>'+
      '<div class="frow"><span><label for="aRate">실패율 경보</label></span><div class="opts">최근 1시간 실패율 '+sel('aRate',a.rate,[['3','3% 이상'],['5','5% 이상'],['10','10% 이상']])+'</div></div>'+
      '<div class="frow"><span><label for="aHook">웹훅 비활성</label></span><div class="opts">알림이 '+sel('aHook',a.hook,[['5','5분'],['10','10분'],['30','30분']])+' 이상 없거나 비활성 상태일 때</div></div>'+
      '<div class="frow"><span>연결 끊김</span><div class="opts"><label class="chk"><input type="checkbox" id="aConn"'+(a.conn?' checked':'')+'>채널 연결이 끊기면 즉시</label></div></div>'+
      '<div class="frow"><span>재시도 소진</span><div class="opts"><label class="chk"><input type="checkbox" id="aEx"'+(a.exhaust?' checked':'')+'>자동 재시도를 모두 실패하면 즉시</label></div></div>'+
      '<div class="err" id="aErr" role="alert" style="color:var(--bad);font-size:14px"></div>'+
    '</div></div>'+
    '<div><div class="panel"><div class="hd"><h3>알림 미리보기</h3>'+btn({cls:'sm',icon:'bell',label:'시험 발송',attrs:'data-act="alertTest"'})+'</div><div class="bd"><div class="sms" aria-label="문자 미리보기"><div class="from">채널지기 장애 알림 · '+hm(CHS['플랫폼 C'].hookOff+2)+'</div>[채널지기] 플랫폼 C 웹훅 비활성 감지 ('+hm(CHS['플랫폼 C'].hookOff)+'부터)\n최근 10분간 예약 알림 0건, 실패 3건 대기 중\n확인: 연동 현황 화면</div></div></div>'+
    '<div class="panel"><div class="hd"><h3>로그 가림 예시</h3><span class="small">개인정보·인증정보는 저장 전에 가립니다</span></div><div class="logbox" role="region" aria-label="가려진 로그 예시" tabindex="0">14:18:05.140 <span class="k">POST</span> /webhooks/channex  event=booking_cancelled\n  property=prop_B  booking=RSV-2611-0168\n  guest_name=<span class="m">김**</span>  guest_email=<span class="m">***@***</span>\n  guest_phone=<span class="m">****</span>  api_key=<span class="m">ch_live_****</span>\n  status=stored  ack=200 (31ms)</div></div></div></div>';
}

/* ===== UI-00 연동 구조 (보조) ===== */
function vUi00(){
  const route=(n,path,req,st,last,note)=>'<tr><td><b>'+n+'</b></td><td class="wrap">'+path+'</td><td class="mono">'+req+'</td><td>'+lb(st)+'</td><td class="num">'+last+'</td><td class="wrap small">'+note+'</td></tr>';
  return head('UI-00 연동 구조','경로별 처리와 현재 상태입니다. 검토용 구조도이며 제품 메뉴가 아닙니다. CHX-01~05')+
    '<div class="chain"><div><b>내 서비스</b><span>예약·요금·메시지 / 서버</span></div><i>↔</i><div><b>Channex API</b><span>채널매니저 / 기존 연동</span></div><i>↔</i><div><b>여행 예약 플랫폼 A·B·C·D</b><span>채널별 지원·권한 확인</span></div></div>'+
    '<div class="panel"><div class="hd"><h3>경로별 상태</h3><span class="small">Channex 접수·조회와 실제 플랫폼 반영은 따로 표시</span></div><div class="tw"><table class="t"><thead><tr><th>경로</th><th>처리 순서</th><th>요구사항</th><th>상태</th><th>마지막 확인</th><th>비고</th></tr></thead><tbody>'+
    route('예약 수신·ACK','플랫폼 → Channex → 내부 저장·처리 → 예약 변경 ACK','RES-01·02, CHX-02',CHS['플랫폼 C'].hook==='비활성'?'확인 필요':'정상','14:18','웹훅 응답과 예약 변경 ACK를 구분해 기록. 플랫폼 C 웹훅 비활성 구간은 변경 내역 조회로 보충')+
    route('ARI 전송·반영 확인','내부 저장 → Channex ARI → Channex 재조회 → 플랫폼 반영 확인','RATE-03·04, CHX-03','확인 필요','14:12','플랫폼 D는 요금 계산 조건 미설정으로 보류')+
    route('메시지','Channex 수신 → 서버 AI 생성·검토 → Channex API → 지원 채널','AI-01~03, CHX-04','정상','14:11','플랫폼 D는 메시지 자동발송 미지원')+
    '</tbody></table></div></div>'+
    '<div class="panel"><div class="hd"><h3>플랫폼별 지원표</h3><span class="small">예시. 실제 값은 계약 전 진단으로 확정</span></div><div class="tw"><table class="t"><thead><tr><th>플랫폼</th><th>예약</th><th>재고·요금</th><th>메시지</th><th>반영 확인 방법</th></tr></thead><tbody>'+
    [['플랫폼 A','지원','지원','지원','플랫폼 조회 가능'],['플랫폼 B','지원','지원','지원','플랫폼 조회 가능'],['플랫폼 C','지원','지원','지원','일부 값 조회 불가, 관리 화면 대조'],['플랫폼 D','지원','미확인','미지원','미확인']].map(r=>'<tr><td class="chn">'+r[0]+'</td><td>'+lb(r[1])+'</td><td>'+lb(r[2])+'</td><td>'+lb(r[3])+'</td><td>'+r[4]+'</td></tr>').join('')+'</tbody></table></div></div>'+
    '<p class="note">'+ic('alert')+'이 화면은 구조 설명입니다. 시연 중 실제 Channex 호출, 요금 전송, 고객 발송은 일어나지 않습니다.</p>';
}

/* ===== UI-01 예약 관리 ===== */
const WEEK=Array.from({length:7},(_,i)=>{const d=new Date(2026,10,2+i);return {i,label:(d.getMonth()+1)+'/'+d.getDate(),dow:'일월화수목금토'[d.getDay()]};});
const dLabel=(i)=>{const d=new Date(2026,10,2+i);return (d.getMonth()+1)+'/'+pad(d.getDate());};
const BK=(id,prop,room,guest,s,e,n,ch,amt,o)=>Object.assign({id,prop,room,guest,s,e,n,ch,amt,st:'확정',chx:'일치',plat:'반영 확인',chk:14*60+2,hist:[]},o||{});
S.books=[
  BK('RSV-2611-0301','A','독채','김○○',0,2,2,'플랫폼 A',216000),
  BK('RSV-2611-0302','B','한옥 1호실','이○○',2,5,2,'플랫폼 B',450000,{cancelDemo:true}),
  BK('RSV-2611-0303','B','한옥 1호실','박○○',5,7,2,'플랫폼 C',340000),
  BK('RSV-2611-0304','B','한옥 2호실','최○○',-1,1,3,'플랫폼 D',300000,{plat:'확인 불가',platWhy:'플랫폼 D는 조회 경로가 없어 관리 화면 대조로 대체'}),
  BK('RSV-2611-0305','C','숲 101','정○○',-2,0,2,'플랫폼 A',190000),
  BK('RSV-2611-0306','C','숲 102','강○○',0,3,3,'플랫폼 C',285000),
  BK('RSV-2611-0307','C','숲 103','조○○',3,5,2,'플랫폼 B',190000,{st:'확인 필요',chx:'불일치',plat:'확인 필요',chk:13*60+40,orig:{e:6,amt:285000},why:'내부 2박, Channex 원본 3박'}),
  BK('RSV-2611-0308','C','숲 104','한○○',-1,2,2,'플랫폼 A',285000)
];
S.blocks=[{room:'한옥 1호실',s:0,e:2},{room:'숲 104',s:4,e:7}];
UI.bk={prop:'',q:'',flt:'',sel:'RSV-2611-0302'};
function rowCells(room){
  const out=[];let i=0;
  while(i<7){
    const b=S.books.find(x=>x.room===room&&x.st!=='취소'&&x.s<=i&&i<x.e);
    const bl=S.blocks.find(x=>x.room===room&&x.s<=i&&i<x.e);
    const cx=S.books.find(x=>x.room===room&&x.st==='취소'&&x.s<=i&&i<x.e);
    if(b){const end=Math.min(7,b.e),span=end-i;out.push('<td colspan="'+span+'" class="gc"><button type="button" class="bar '+(b.st==='확인 필요'?'need':'ok')+(UI.bk.sel===b.id?' on':'')+'" data-book="'+b.id+'"><b>'+b.guest+'</b><span>'+b.st+'</span></button></td>');i=end;}
    else if(bl){const end=Math.min(7,bl.e),span=end-i;out.push('<td colspan="'+span+'" class="gc"><span class="bar stop">수동 판매중지</span></td>');i=end;}
    else if(cx){const end=Math.min(7,cx.e),span=end-i;out.push('<td colspan="'+span+'" class="gc"><button type="button" class="bar cx'+(UI.bk.sel===cx.id?' on':'')+'" data-book="'+cx.id+'"><b>판매 가능</b><span>'+cx.guest+' 취소됨</span></button></td>');i=end;}
    else{out.push('<td class="gc free"><span class="sr">판매 가능</span></td>');i++;}
  }
  return out.join('');
}
function bkMatch(b){const F=UI.bk,q=F.q.trim();
  if(F.prop&&b.prop!==F.prop)return false;
  if(q&&(b.guest+b.id+b.room).indexOf(q)<0)return false;
  if(F.flt==='in'&&!(b.s===0&&b.st!=='취소'))return false;
  if(F.flt==='out'&&!(b.e===0&&b.st!=='취소'))return false;
  if(F.flt==='stay'&&!(b.s<=0&&0<b.e&&b.st!=='취소'))return false;
  if(F.flt==='need'&&b.st!=='확인 필요')return false;
  return true;
}
function vUi01(){
  const F=UI.bk,live=S.books.filter(b=>b.st!=='취소'&&(!F.prop||b.prop===F.prop));
  const n={in:live.filter(b=>b.s===0).length,out:live.filter(b=>b.e===0).length,stay:live.filter(b=>b.s<=0&&0<b.e).length,need:live.filter(b=>b.st==='확인 필요').length};
  const L=S.books.filter(bkMatch),rooms=PROPS.filter(p=>!F.prop||p.k===F.prop);
  const card=(k,t,v)=>'<button type="button" class="sc'+(F.flt===k?' on':'')+(k==='need'&&v?' warn':'')+'" data-bkflt="'+k+'" aria-pressed="'+(F.flt===k)+'"><span>'+t+'</span><b class="num">'+v+'건</b></button>';
  const d=S.books.find(b=>b.id===F.sel);
  return head('UI-01 예약 관리','RES-01~04 · CHX-01~02·05 · 날짜는 숙소 기준 시간대(한국 표준시), 퇴실일은 점유하지 않습니다.')+
    '<div class="panel"><div class="filters"><label for="bkP">숙소</label><select id="bkP" class="f" data-bkprop="1"><option value="">전체 숙소</option>'+PROPS.map(p=>'<option value="'+p.k+'"'+(F.prop===p.k?' selected':'')+'>'+esc(p.name)+'</option>').join('')+'</select><label for="bkQ">검색</label><input id="bkQ" class="tx" type="search" data-bkq="1" value="'+esc(F.q)+'" placeholder="게스트·예약번호"><span class="grow"></span>'+btn({cls:'sm',icon:'tag',label:'요금 관리',attrs:'data-go="ui02"'})+'</div></div>'+
    '<div class="scs">'+card('in','오늘 입실',n.in)+card('out','오늘 퇴실',n.out)+card('stay','투숙 중',n.stay)+card('need','확인 필요',n.need)+'</div>'+
    '<div class="bkgrid"><div class="bkl"><div class="panel"><div class="hd"><h3>숙소별 예약 일정</h3><span class="small">11/02~11/08</span></div><div class="tw"><table class="t cal"><thead><tr><th class="rm">객실</th>'+WEEK.map(w=>'<th class="'+(w.i===0?'today':'')+'">'+w.dow+'<br><span class="num">'+w.label+'</span></th>').join('')+'</tr></thead><tbody>'+
    rooms.map(p=>p.rooms.map(r=>'<tr><td class="rm"><b>'+esc(r)+'</b><small>'+p.name.replace('○○스테이 ','')+'</small></td>'+rowCells(r)+'</tr>').join('')).join('')+
    '</tbody></table></div><div class="lgd"><span class="k ok">확정</span><span class="k need">확인 필요</span><span class="k stop">수동 판매중지</span><span class="k cx">취소 후 판매 가능</span></div></div>'+
    '<div class="panel"><div class="hd"><h3>예약 목록</h3><span class="small">'+L.length+'건'+(F.flt?' · 조건 적용':'')+'</span></div>'+
    (L.length?'<div class="tw"><table class="t"><thead><tr><th>예약번호</th><th>게스트</th><th>객실</th><th>입퇴실</th><th>상태</th><th>플랫폼 반영</th></tr></thead><tbody>'+L.map(b=>'<tr class="'+(F.sel===b.id?'sel':'')+'"><td><button type="button" class="idl" data-book="'+b.id+'">'+b.id+'</button></td><td>'+b.guest+'</td><td>'+esc(b.room)+'</td><td class="num">'+dLabel(b.s)+'~'+dLabel(b.e)+'</td><td>'+lb(b.st)+'</td><td>'+lb(b.plat)+'</td></tr>').join('')+'</tbody></table></div>'
      :'<div class="bd">'+empty('search','조건에 맞는 예약이 없습니다','검색어를 줄이거나 조건을 지워 보세요.',btn({label:'조건 지우기',attrs:'data-act="bkClear"'}))+'</div>')+'</div></div>'+
    '<div class="bkr" id="bkDetail">'+(d?bkPanel(d):'')+'</div></div>';
}
function bkPanel(b){
  const rq=b.req;
  return '<div class="panel"><div class="hd"><h3>예약 상세</h3>'+lb(b.st)+'</div><div class="bd">'+
    '<dl class="dl"><dt>예약번호</dt><dd class="mono">'+b.id+'</dd><dt>게스트</dt><dd>'+b.guest+'</dd><dt>객실</dt><dd>'+esc(propName(b.prop).replace('○○스테이 ',''))+' · '+esc(b.room)+'</dd><dt>입퇴실</dt><dd class="num">'+dLabel(b.s)+' ~ '+dLabel(b.e)+' ('+(b.e-b.s)+'박)</dd><dt>인원</dt><dd>'+b.n+'명</dd><dt>금액</dt><dd class="num">'+won(b.amt)+'</dd><dt>예약 채널</dt><dd>'+b.ch+'</dd></dl>'+
    '<div class="lbl">외부 확인 상태</div><dl class="dl"><dt>Channex 조회</dt><dd>'+lb(b.chx)+'</dd><dt>플랫폼 반영</dt><dd>'+lb(b.plat)+'</dd><dt>마지막 확인</dt><dd class="num">11-02 '+hm(b.chk)+'</dd></dl>'+
    (b.platWhy?'<p class="note">'+ic('alert')+esc(b.platWhy)+'</p>':'')+
    (b.st==='확인 필요'?'<div class="alarm warnl inp">'+ic('alert')+'<span><b>확인 필요.</b> '+esc(b.why)+'. 원본을 확인하기 전에는 AI 초안에 이 예약을 쓰지 않습니다.</span></div>':'')+
    (rq?'<div class="tw" style="margin-top:8px"><table class="t"><thead><tr><th>항목</th><th>내부</th><th>Channex 원본</th></tr></thead><tbody><tr class="fl"><td>퇴실</td><td class="num">'+dLabel(b.e)+'</td><td class="num"><b>'+dLabel(b.orig.e)+'</b></td></tr><tr class="fl"><td>금액</td><td class="num">'+won(b.amt)+'</td><td class="num"><b>'+won(b.orig.amt)+'</b></td></tr></tbody></table></div>':'')+
    '<div class="sendrow">'+btn({icon:'retry',label:'원본 재조회',attrs:'data-act="bkRequery"'})+(rq?btn({cls:'pri',icon:'check',label:'원본 기준으로 복구',attrs:'data-act="bkRestore"'}):'')+btn({icon:'msg',label:'메시지 이동',attrs:'data-act="bkMsg"'})+'</div>'+
    (b.cancelDemo&&b.st!=='취소'?'<div class="sendrow">'+btn({cls:'pri',icon:'x',label:'취소 알림 수신 (시연)',attrs:'data-act="bkCancel"'})+'</div>':'')+
    (b.st==='취소'?'<div class="lbl">취소 후 판매 상태 (RES-03)</div><div class="tw"><table class="t"><thead><tr><th>구간</th><th>취소 전</th><th>취소 후</th></tr></thead><tbody><tr><td class="num">11/02~11/03</td><td>수동 판매중지</td><td>'+lb('유지')+'</td></tr><tr class="hl"><td class="num">11/04~11/06</td><td>이 예약</td><td>'+lb('판매 가능')+'</td></tr><tr><td class="num">11/07~11/08</td><td>다른 예약</td><td>'+lb('유지')+'</td></tr></tbody></table></div>':'')+
    (b.hist.length?'<div class="lbl">복구·처리 이력</div><ul class="hist">'+b.hist.map(h=>'<li><span class="num">'+h[0]+'</span>'+esc(h[1])+'</li>').join('')+'</ul>':'')+
    '</div></div>';
}

/* ===== UI-02 요금 관리 ===== */
const won=(n)=>Number(n).toLocaleString('ko-KR')+'원';
const PLANS=['기본','비환불'];
const CFG={};
PROPS.forEach(p=>{CFG[p.k]={};[['플랫폼 A',15,0,'플랫폼'],['플랫폼 B',18,10,'숙소'],['플랫폼 C',17,5,'플랫폼'],['플랫폼 D',null,null,null]].forEach(b=>{CFG[p.k][b[0]]={};PLANS.forEach(pl=>{const unset=b[1]==null||(p.k==='B'&&b[0]==='플랫폼 C'&&pl==='기본');
  CFG[p.k][b[0]][pl]=unset?{fee:null,disc:null,payer:'숙소',src:'',why:b[1]==null?'수수료·할인 근거 없음. 계약 조건 입력 필요':'요금제 매핑 미확인. Channex 요금제 연결 확인 필요'}:{fee:b[1],disc:pl==='비환불'?b[2]+5:b[2],payer:pl==='비환불'?'숙소':b[3],src:'계약 조건 확인 (예시)',why:''};});});});
const isOk=(c)=>c.fee!=null&&c.disc!=null;
function calc(c,target){const d=c.payer==='숙소'?c.disc:0,k=(1-d/100)*(1-c.fee/100),reg=Math.ceil(target/k/100)*100;return {reg,net:Math.floor(reg*k)};}
UI.fee={prop:'A',wd:150000,we:190000,plan:{},edit:null,err:{},saved:'10-31 10:32'};
function feeCard(ch){const U=UI.fee,pl=U.plan[ch]||'기본',c=CFG[U.prop][ch][pl],ok=isOk(c),editing=U.edit===ch;
  const a=ok?calc(c,U.wd):null,b=ok?calc(c,U.we):null;
  return '<div class="pc'+(ok?'':' hold')+'"><div class="pch"><b>'+ch+'</b>'+lb(ok?'계산 완료':'계산 보류')+'</div>'+
   '<label class="pcl" for="pl'+ch+'">요금제</label><select id="pl'+ch+'" class="f" data-cardplan="'+ch+'">'+PLANS.map(x=>'<option'+(pl===x?' selected':'')+'>'+x+'</option>').join('')+'</select>'+
   (ok?'<dl class="dl"><dt>수수료</dt><dd class="num">'+c.fee+'%</dd><dt>할인</dt><dd class="num">'+c.disc+'% ('+c.payer+' 부담)</dd><dt>근거</dt><dd>'+esc(c.src)+'</dd></dl><table class="t mini"><thead><tr><th></th><th class="r">평일(원)</th><th class="r">주말(원)</th></tr></thead><tbody><tr><td>등록 가격</td><td class="r num"><b>'+a.reg.toLocaleString('ko-KR')+'</b></td><td class="r num"><b>'+b.reg.toLocaleString('ko-KR')+'</b></td></tr><tr><td>예상 실수령액</td><td class="r num">'+a.net.toLocaleString('ko-KR')+'</td><td class="r num">'+b.net.toLocaleString('ko-KR')+'</td></tr><tr><td>목표와 차액</td><td class="r num">+'+(a.net-U.wd)+'</td><td class="r num">+'+(b.net-U.we)+'</td></tr></tbody></table>'
     :'<div class="holdm">'+ic('alert')+'<span>'+esc(c.why)+'</span></div>')+
   (editing?'<div class="ced"><label>수수료(%)<input type="number" class="numi" id="eF" min="0" max="40" step="0.5" value="'+(c.fee==null?'':c.fee)+'"></label><label>할인(%)<input type="number" class="numi" id="eD" min="0" max="50" step="1" value="'+(c.disc==null?'':c.disc)+'"></label><label>할인 부담<select id="eP" class="f">'+['숙소','플랫폼'].map(x=>'<option'+(c.payer===x?' selected':'')+'>'+x+'</option>').join('')+'</select></label>'+(U.err.card?'<div class="ferr" role="alert">'+ic('alert')+'<span>'+esc(U.err.card)+'</span></div>':'')+'<div class="sendrow">'+btn({cls:'sm',label:'취소',attrs:'data-act="cardCancel"'})+btn({cls:'sm pri',icon:'check',label:'조건 저장',attrs:'data-cardsave="'+ch+'"'})+'</div></div>'
     :'<div class="sendrow">'+btn({cls:'sm',label:'수수료·할인 설정',attrs:'data-cardedit="'+ch+'"'})+'</div>')+'</div>';
}
function vUi02(){const U=UI.fee,E=U.err;
  return head('UI-02 요금 관리','RATE-01~02 · CHX-01·03 · 운영자가 평일·주말 목표 실수령액을 넣으면 플랫폼별 등록 가격을 계산합니다.',btn({cls:'pri',icon:'tag',label:'일괄 변경 대상 선택',attrs:'data-go="ui03"'}))+
    (UI.rate.invalid?'<div class="alarm warnl">'+ic('alert')+'<span><b>설정을 바꿔 기존 미리보기를 무효화했습니다.</b> UI-03에서 다시 계산한 뒤 전송할 수 있습니다.</span></div>':'')+
    '<div class="panel"><div class="hd"><h3>기본 요금</h3><span class="small">마지막 저장 '+esc(U.saved)+'</span></div><div class="bd"><div class="fgrid"><label>숙소<select id="fP" class="f" data-feeprop="1">'+PROPS.map(p=>'<option value="'+p.k+'"'+(U.prop===p.k?' selected':'')+'>'+esc(p.name)+'</option>').join('')+'</select></label><label>평일 목표 실수령액<input type="number" class="numi lg" data-feet="wd" value="'+U.wd+'" step="1000" min="10000">'+(E.wd?'<span class="ie">'+esc(E.wd)+'</span>':'')+'</label><label>주말 목표 실수령액<input type="number" class="numi lg" data-feet="we" value="'+U.we+'" step="1000" min="10000">'+(E.we?'<span class="ie">'+esc(E.we)+'</span>':'')+'</label><div class="fend">'+btn({cls:'pri',icon:'check',label:'기본 요금 저장',attrs:'data-act="feeSave"'})+'</div></div>'+
    '<table class="t mini scope"><tbody><tr><th>포함</th><td>1박 객실 요금</td><th>제외</th><td>청소비, 세금, 추가 인원비</td></tr><tr><th>통화</th><td>원(KRW)</td><th>반올림</th><td>등록 가격 100원 단위 올림</td></tr></tbody></table><p class="note">'+ic('alert')+'수수료·할인 등 차감 후 기준이며, 값은 예시입니다. 실제 포함·제외 항목은 계약 전에 확정합니다. 예상 실수령액과 실제 정산액은 따로 관리합니다.</p></div></div>'+
    '<div class="sec2"><h3>플랫폼별 계산 조건 및 예상 수령액</h3><span class="small">근거 없는 조건은 기본값으로 단정하지 않습니다.</span></div><div class="pcs">'+CH.map(feeCard).join('')+'</div>';
}

/* ===== UI-03 요금 일괄 변경 ===== */
const DAYS=Array.from({length:14},(_,i)=>{const d=new Date(2026,10,9+i);return {i,label:(d.getMonth()+1)+'/'+d.getDate(),dow:'일월화수목금토'[d.getDay()],we:[0,5,6].includes(d.getDay())};});
const roomList=()=>PROPS.flatMap(p=>p.rooms.map(r=>({p:p.k,r})));
const curPrice=(room,ch,we)=>{const b={'독채':180000,'한옥 1호실':150000,'한옥 2호실':150000}[room]||95000;return (we?Math.round(b*1.2/1000)*1000:b)+CH.indexOf(ch)*2000;};
UI.rate={rooms:{'독채':true,'한옥 1호실':true},dates:{4:true,5:true,6:true,11:true,12:true,13:true},chs:{'플랫폼 A':true,'플랫폼 B':true,'플랫폼 C':true,'플랫폼 D':true},plans:{'기본':true},preview:null,run:null,errs:[],invalid:false,keys:{}};
function ratePreview(){const R=UI.rate,rows=[],sel=DAYS.filter(d=>R.dates[d.i]);
  [['평일',sel.filter(d=>!d.we),UI.fee.wd],['주말',sel.filter(d=>d.we),UI.fee.we]].forEach(g=>{if(!g[1].length)return;
    roomList().filter(x=>R.rooms[x.r]).forEach(x=>PLANS.filter(pl=>R.plans[pl]).forEach(pl=>CH.filter(c=>R.chs[c]).forEach(c=>{const f=CFG[x.p][c][pl],ok=isOk(f),v=ok?calc(f,g[2]):null;
      rows.push({k:x.r+pl+c+g[0],p:x.p,room:x.r,plan:pl,ch:c,grp:g[0],days:g[1].map(d=>d.label).join(', '),nDays:g[1].length,before:curPrice(x.r,c,g[0]==='주말'),target:g[2],ok,why:f.why,reg:v?v.reg:null,net:v?v.net:null});})));});
  return rows;}
function rateErrs(){const R=UI.rate,e=[];if(!Object.values(R.rooms).some(Boolean))e.push('객실을 하나 이상 골라 주세요.');if(!Object.values(R.dates).some(Boolean))e.push('날짜를 하나 이상 골라 주세요.');if(!Object.values(R.chs).some(Boolean))e.push('플랫폼을 하나 이상 골라 주세요.');if(!Object.values(R.plans).some(Boolean))e.push('요금제를 하나 이상 골라 주세요.');return e;}
const chip=(on,attr,label)=>'<button type="button" class="chipb" aria-pressed="'+!!on+'" '+attr+'>'+label+'</button>';
const STEPN=['내부 저장','Channex 접수','Channex 재조회','플랫폼 반영 확인'];
function stepCell(s){const m={ok:['ok','check','완료'],busy:['busy','','진행 중'],fail:['bad','x','실패'],skip:['skip','','중단'],chk:['busy','retry','확인 중'],need:['busy','alert','확인 필요'],'':['wait','','대기']}[s];return '<span class="stp '+m[0]+'">'+(s==='busy'?'<span class="spin" style="width:12px;height:12px"></span>':m[1]?ic(m[1]):'')+m[2]+'</span>';}
const rowResult=(x)=>x.st.includes('fail')?'실패':x.st.includes('chk')?'확인 중':x.st.includes('need')?'확인 필요':x.st.every(s=>s==='ok')?'완료':'진행 중';
function vUi03(){
  const R=UI.rate;
  let h=head('UI-03 요금 일괄 변경','RATE-03~04 · CHX-03 · 선택한 숙소·객실·날짜·플랫폼·요금제만 바뀝니다. 목표 실수령액은 평일 '+won(UI.fee.wd)+', 주말 '+won(UI.fee.we)+' (UI-02 저장값).',btn({icon:'list',label:'UI-02 계산 조건',attrs:'data-go="ui02"'}))+
   (R.invalid?'<div class="alarm warnl">'+ic('alert')+'<span><b>조건이 바뀌어 이전 미리보기를 무효화했습니다.</b> 다시 계산해 주세요.</span></div>':'')+
   '<div class="panel"><div class="hd"><h3>대상 선택</h3><span class="small">객실 '+Object.values(R.rooms).filter(Boolean).length+' · 날짜 '+Object.values(R.dates).filter(Boolean).length+' · 플랫폼 '+Object.values(R.chs).filter(Boolean).length+' · 요금제 '+Object.values(R.plans).filter(Boolean).length+'</span></div><div class="bd rf">'+
   PROPS.map(p=>'<div class="frow2"><span>'+esc(p.name)+'</span><div class="chips">'+p.rooms.map(r=>chip(R.rooms[r],'data-rroom="'+esc(r)+'"',esc(r))).join('')+'</div></div>').join('')+
   '<div class="frow2"><span>적용 날짜</span><div><div class="chips qk">'+[['weekday','평일'],['weekend','주말(금·토·일)'],['all','전체'],['none','지우기']].map(q=>'<button type="button" class="chipb q" data-rq="'+q[0]+'">'+q[1]+'</button>').join('')+'</div><div class="tw dgw"><div class="dg">'+DAYS.map(d=>'<button type="button" class="dc'+(d.we?' we':'')+'" aria-pressed="'+!!R.dates[d.i]+'" data-rdate="'+d.i+'" aria-label="'+d.label+' '+d.dow+'요일"><b class="num">'+d.label+'</b><span>'+d.dow+'</span></button>').join('')+'</div></div></div></div>'+
   '<div class="frow2"><span>플랫폼</span><div class="chips">'+CH.map(c=>chip(R.chs[c],'data-rch="'+c+'"',c)).join('')+'</div></div>'+
   '<div class="frow2"><span>요금제</span><div class="chips">'+PLANS.map(c=>chip(R.plans[c],'data-rplan="'+c+'"',c)).join('')+'</div></div>'+
   (R.errs.length?'<div class="ferr" role="alert">'+ic('alert')+'<div>'+R.errs.map(esc).join('<br>')+'</div></div>':'')+
   '<div class="sendrow">'+btn({cls:'pri',icon:'compare',label:'계산 결과 새로고침',attrs:'data-act="ratePreview"'})+'</div></div></div>';
  if(!R.preview){h+='<div class="panel"><div class="bd">'+empty('tag','전송 미리보기가 없습니다','대상을 고른 뒤 계산하면 항목별 등록 가격과 예상 수령액이 나옵니다. 아직 아무것도 전송되지 않습니다.',btn({cls:'pri',icon:'compare',label:'계산 결과 새로고침',attrs:'data-act="ratePreview"'}))+'</div></div>';}
  else{const P=R.preview,hold=P.filter(x=>!x.ok),send=P.filter(x=>x.ok),running=R.run&&R.run.state==='running';
    h+='<div class="panel"><div class="hd"><h3>전송 미리보기</h3><span class="small">'+P.length+'항목 · 계산 완료 '+send.length+' · 계산 보류 '+hold.length+'</span></div><div class="tw"><table class="t"><thead><tr><th>대상</th><th>날짜</th><th>플랫폼</th><th class="r">변경 전</th><th class="r">등록 가격</th><th class="r">예상 수령액</th><th>상태</th></tr></thead><tbody>'+
     P.map(x=>'<tr class="'+(x.ok?'':'unk')+'"><td>'+esc(x.room)+'<small class="sub2">'+x.plan+'</small></td><td class="dts">'+x.grp+'<small class="sub2 num">'+x.days+'</small></td><td class="chn">'+x.ch+'</td><td class="r num">'+won(x.before)+'</td><td class="r num">'+(x.ok?'<b>'+won(x.reg)+'</b>':'계산 보류')+'</td><td class="r num">'+(x.ok?won(x.net):'미확인')+'</td><td>'+(x.ok?lb('계산 완료'):lb('계산 보류')+'<small class="sub2 wrapn">'+esc(x.why)+'</small>')+'</td></tr>').join('')+'</tbody></table></div></div>'+
     (hold.length?'<div class="alarm warnl">'+ic('alert')+'<span>계산 보류 '+hold.length+'항목은 숨기지 않고 표시하며, 이번 전송에는 넣지 않습니다.</span><span class="sp"></span>'+btn({cls:'sm',label:'UI-02에서 조건 입력',attrs:'data-go="ui02"'})+'</div>':'')+
     '<div class="sendrow">'+btn({cls:'pri',icon:running?'':'send',label:running?'전송 중 · 중복 실행 차단':'대상 확인 후 전송 ('+send.length+'항목)',attrs:'data-act="rateSend"'+(send.length&&!running?'':' disabled')})+'<span class="small">전송 중에는 다시 누를 수 없고, 같은 내용은 한 번만 실행됩니다.</span></div>'+
     (R.dup?'<div class="alarm" role="alert">'+ic('lock')+'<span><b>중복 실행을 막았습니다.</b> 같은 내용의 전송('+R.dup+')이 이미 있습니다. 실패 항목은 아래 실패만 재처리를 쓰세요.</span></div>':'');
  }
  if(R.run){const r=R.run,running=r.state==='running',res=r.rows.map(rowResult),cnt=(t)=>res.filter(x=>x===t).length,fails=r.rows.filter(x=>x.st.includes('fail')),chk=r.rows.filter(x=>x.st.includes('chk')),need=r.rows.filter(x=>x.st.includes('need'));
    h+='<div class="panel" id="runPanel"><div class="hd"><h3>항목별 처리 결과 <span class="mono">'+r.id+'</span></h3><span class="small">'+(running?'전송 중':'완료 '+cnt('완료')+' · 실패 '+cnt('실패')+' · 확인 중 '+cnt('확인 중')+' · 확인 필요 '+cnt('확인 필요'))+'</span></div>'+
      (!running&&(fails.length||chk.length||need.length)?'<div class="bd acts2">'+btn({cls:'pri',icon:'retry',label:'실패만 재처리 ('+fails.length+')',attrs:'data-act="rateRetry"'+(fails.length?'':' disabled')})+btn({icon:'compare',label:'결과 재조회 ('+chk.length+')',attrs:'data-act="rateRecheck"'+(chk.length?'':' disabled')})+(need.length?btn({icon:'check',label:'대체 검증 기록 ('+need.length+')',attrs:'data-act="rateAlt"'}):'')+'</div>':'')+
      (!running&&!fails.length&&!chk.length&&!need.length?'<div class="alarm ok inp">'+ic('check')+'<span><b style="color:var(--ok)">'+r.rows.length+'항목을 모두 확인했습니다.</b> 성공한 항목은 재처리 때 다시 보내지 않았습니다(시도 횟수 참고).</span></div>':'')+
      '<div class="tw"><table class="t steps"><thead><tr><th>대상</th><th>플랫폼</th><th class="r">등록 가격</th><th>결과</th>'+STEPN.map(s=>'<th>'+s+'</th>').join('')+'<th class="r">전송</th><th>사유</th></tr></thead><tbody>'+
      r.rows.map(x=>{const t=rowResult(x);return '<tr class="'+(t==='실패'?'fl':t==='완료'?'':'unk')+'"><td>'+esc(x.room)+'<small class="sub2">'+x.grp+' · '+x.plan+'</small></td><td class="chn">'+x.ch+'</td><td class="r num">'+won(x.reg)+'</td><td>'+lb(t)+'</td>'+x.st.map(s=>'<td>'+stepCell(s)+'</td>').join('')+'<td class="r num">'+x.tries+'회</td><td class="wrapn small">'+esc(x.why)+'</td></tr>';}).join('')+'</tbody></table></div></div>';
  }
  if(S.rateLog.length)h+='<div class="panel"><div class="hd"><h3>변경 이력</h3></div><div class="tw"><table class="t"><thead><tr><th>전송</th><th>시각</th><th>대상</th><th>결과</th></tr></thead><tbody>'+S.rateLog.map(l=>'<tr><td class="mono">'+l.id+'</td><td class="num">'+l.at+'</td><td>'+esc(l.t)+'</td><td>'+esc(l.res)+'</td></tr>').join('')+'</tbody></table></div></div>';
  return h;
}
function makePreview(){const R=UI.rate;R.errs=rateErrs();R.dup=null;if(R.errs.length){R.preview=null;return false;}R.preview=ratePreview();R.invalid=false;return true;}
function rateInvalidate(){const R=UI.rate;if(R.preview)R.invalid=true;R.preview=null;R.dup=null;}
function rateSend(){
  const R=UI.rate;if(R.run&&R.run.state==='running'){toast('전송 중이라 다시 실행하지 않았습니다.','bad');return;}
  const send=R.preview.filter(x=>x.ok),key=send.map(x=>x.k+x.reg).join('|')+'@'+Object.keys(R.dates).filter(k=>R.dates[k]).join(',');
  if(R.keys[key]){R.dup=R.keys[key];toast('같은 내용의 전송이 이미 있어 중복 실행을 막았습니다.','bad');render();return;}
  const id='RT-'+(S.rateSeq++);R.keys[key]=id;R.dup=null;
  const pick=(c,n)=>send.filter(x=>x.ch===c)[n];
  const f=pick('플랫폼 C',0)||send[send.length-1],l=pick('플랫폼 B',0),nd=pick('플랫폼 A',1);
  R.run={id,state:'running',rows:send.map(x=>Object.assign({},x,{st:['','','',''],tries:1,plan2:x===f?{at:1,v:'fail',why:'호출 제한으로 Channex 접수 실패'}:x===l?{at:2,v:'chk',why:'응답 유실. 성공으로 단정하지 않고 재조회 대기'}:x===nd?{at:3,v:'need',why:'플랫폼 조회로 확인할 수 없는 값. 관리 화면 대조 필요'}:null,why:''}))};
  R.run.rows.forEach(x=>{x.src=send.find(y=>y.k===x.k);});
  render();runSteps(R.run,R.run.rows,0,()=>{const c=R.run.rows.filter(x=>x.st.includes('fail')).length;logRun(R.run);toast(c?'전송을 마쳤습니다. 실패 '+c+'항목은 그것만 다시 보낼 수 있습니다.':'전송을 마쳤습니다.',c?'bad':'');});
}
function runSteps(run,rows,i,done){
  if(i>3){run.state='done';done();if(UI.view==='ui03')render();return;}
  rows.forEach(x=>{const stop=x.st.slice(0,i).some(s=>['fail','chk','need','skip'].includes(s));x.st[i]=stop?(x.st.slice(0,i).includes('need')?'':'skip'):'busy';});if(UI.view==='ui03')render();
  setTimeout(()=>{rows.forEach(x=>{if(x.st[i]==='busy'){if(x.plan2&&x.plan2.at===i){x.st[i]=x.plan2.v;x.why=x.plan2.why;}else x.st[i]='ok';}});if(UI.view==='ui03')render();runSteps(run,rows,i+1,done);},380);
}
function logRun(run){const res=run.rows.map(rowResult),t=run.rows.length+'항목 · '+[...new Set(run.rows.map(x=>x.room))].join(', '),s='완료 '+res.filter(x=>x==='완료').length+' · 실패 '+res.filter(x=>x==='실패').length+' · 확인 중 '+res.filter(x=>x==='확인 중').length+' · 확인 필요 '+res.filter(x=>x==='확인 필요').length,ex=S.rateLog.find(l=>l.id===run.id);if(ex){ex.res=s;ex.at='11-02 '+hm(NOW);}else S.rateLog.unshift({id:run.id,at:'11-02 '+hm(NOW),t,res:s});}

/* ===== UI-04 메시지 관리 ===== */
const MT=(id,type,guest,rsv,prop,room,ch,at,q,draft,fields,o)=>Object.assign({id,type,guest,rsv,prop,room,ch,at,q,draft,fields,state:'wait',checked:true,chkAt:at+2,edited:false,log:[[hm(at),'문의 수신']].concat(draft?[[hm(at+2),'AI 초안 생성, 근거 대조']]:[])},o||{});
const EXCL=['환불','금액','클레임'];
const fD=(val)=>({k:'숙박일',re:/\d+월 \d+일/,src:'Channex 연결 예약',val}),fN=(val)=>({k:'인원',re:/\d+명/,src:'Channex 연결 예약',val}),fA=(k,val,src)=>({k,re:/[\d,]+원/,src,val});
S.msgs=[
  MT('M-302','편의시설','박○○','RSV-2611-0303','B','한옥 1호실','플랫폼 C',14*60+6,'침구는 몇 명 기준으로 준비되어 있나요?','안녕하세요. 11월 7일 숙박은 3명 기준으로 침구를 준비해 드립니다. 추가 침구가 필요하시면 말씀해 주세요.',[fD('11월 7일'),fN('2명')]),
  MT('M-301','체크인 안내','김○○','RSV-2611-0301','A','독채','플랫폼 A',14*60+11,'오늘 체크인은 몇 시부터 되나요? 두 명 갑니다.','안녕하세요. 11월 2일 체크인은 오후 3시부터 가능합니다. 예약 인원 2명 기준으로 준비해 두겠습니다.',[fD('11월 2일'),{k:'체크인 시간',re:/오후 \d+시/,src:'숙소 안내',val:'오후 3시'},fN('2명')]),
  MT('M-303','주차','강○○','RSV-2611-0306','C','숲 102','플랫폼 C',13*60+48,'차를 가져가도 되나요?','안녕하세요. 주차장은 객실당 1대까지 무료로 이용하실 수 있습니다.',[{k:'주차 대수',re:/객실당 \d+대/,src:'숙소 안내',val:'객실당 1대'}]),
  MT('M-304','편의시설','정○○','RSV-2611-0305','C','숲 101','플랫폼 B',13*60+31,'아기 침대를 빌릴 수 있나요?','',[],{noBasis:'숙소 안내에 아기 침대 항목이 없어 초안을 만들지 않았습니다.'}),
  MT('M-305','환불','이○○','RSV-2611-0302','B','한옥 1호실','플랫폼 B',12*60+52,'지금 취소하면 얼마나 돌려받나요?','안녕하세요. 결제 금액은 450,000원이며, 환불 금액은 취소 규정을 확인한 뒤 운영자가 안내해 드리겠습니다.',[fA('결제 금액','450,000원','Channex 연결 예약')]),
  MT('M-306','금액','최○○','RSV-2611-0304','B','한옥 2호실','플랫폼 A',11*60+40,'한 명 추가하면 요금이 얼마인가요?','안녕하세요. 인원 추가 요금은 1인 1박 20,000원입니다.',[fA('추가 요금','20,000원','숙소 안내')]),
  MT('M-307','클레임','한○○','RSV-2611-0308','C','숲 104','플랫폼 A',10*60+15,'어젯밤 난방이 약해서 많이 추웠습니다.','불편을 드려 죄송합니다. 설비 상태를 확인한 뒤 운영자가 다시 안내해 드리겠습니다.',[]),
  MT('M-308','체크인 안내','서○○','RSV-2611-0192','A','독채','플랫폼 C',9*60+40,'출입 비밀번호는 언제 받나요?','안녕하세요. 체크인 당일 오후 3시 전에 안내해 드립니다.',[{k:'체크인 시간',re:/오후 \d+시/,src:'숙소 안내',val:'오후 3시'}],{state:'failed',failWhy:'Channex 메시지 API 응답 시간 초과'}),
  MT('M-300','주차','문○○','RSV-2611-0189','C','숲 103','플랫폼 A',9*60+5,'주차비가 따로 있나요?','안녕하세요. 주차장은 객실당 1대까지 무료로 이용하실 수 있습니다.',[{k:'주차 대수',re:/객실당 \d+대/,src:'숙소 안내',val:'객실당 1대'}],{state:'sent',sentAt:9*60+12})
];
S.msgs.find(m=>m.id==='M-308').log.push(['09:43','검토 후 발송 실패 (시간 초과)']);
S.msgs.find(m=>m.id==='M-300').log.push(['09:12','검토 후 발송 완료, 수정 없음']);
UI.m={sel:'M-302',prop:'',q:'',flt:'all',showRsv:false};
function compare(m){return m.fields.map(f=>{const hit=m.draft.match(f.re),v=hit?hit[0]:null;return {k:f.k,src:f.src,val:f.val,draft:v,res:v===null?'언급 없음':v===f.val?'일치':'불일치'};});}
const mism=(m)=>compare(m).filter(c=>c.res==='불일치');
function msgState(m){if(m.state==='sent')return '발송 완료';if(m.state==='failed')return '발송 실패';if(m.state==='handed')return '운영자 이관';if(m.noBasis&&!m.edited)return '근거 부족';if(!m.checked)return '재대조 필요';if(mism(m).length)return '운영자 확인';return '검토 후 발송';}
function rsvInfo(m){const b=S.books.find(x=>x.id===m.rsv);if(b)return {stay:dLabel(b.s)+' ~ '+dLabel(b.e)+' ('+(b.e-b.s)+'박)',n:b.n+'명',amt:won(b.amt),st:b.st,inGrid:true};return {stay:'지난 예약',n:'-',amt:'-',st:'확정',inGrid:false};}
function vUi04(){
  const U=UI.m,q=U.q.trim(),props=PROPS.filter(p=>!q||p.name.indexOf(q)>=0);
  const L=S.msgs.filter(m=>(!U.prop||m.prop===U.prop)&&(U.flt==='all'||(U.flt==='todo'&&(m.state==='wait'||m.state==='handed'))||(U.flt==='fail'&&m.state==='failed')));
  if(!L.some(m=>m.id===U.sel)&&L[0])U.sel=L[0].id;
  const c=(k)=>S.msgs.filter(m=>(!U.prop||m.prop===U.prop)&&(k==='all'||(k==='todo'&&(m.state==='wait'||m.state==='handed'))||(k==='fail'&&m.state==='failed'))).length;
  const m=S.msgs.find(x=>x.id===U.sel);
  const c1='<div class="panel mc1"><div class="hd"><h3>숙소</h3></div><div class="bd sm"><label class="sr" for="mQ">숙소명 검색</label><input id="mQ" class="tx" type="search" data-mq="1" value="'+esc(U.q)+'" placeholder="숙소명 검색"></div><ul class="plist2"><li><button type="button" data-mprop="" aria-current="'+(!U.prop)+'">전체 숙소</button></li>'+props.map(p=>'<li><button type="button" data-mprop="'+p.k+'" aria-current="'+(U.prop===p.k)+'">'+esc(p.name)+'</button></li>').join('')+'</ul>'+(props.length?'':'<div class="bd sm small">검색 결과가 없습니다.</div>')+'</div>';
  const c2='<div class="panel mc2"><div class="hd"><h3>대화 목록</h3></div><div class="tabs3" role="group" aria-label="대화 필터">'+[['all','전체'],['todo','미처리'],['fail','발송 실패']].map(x=>'<button type="button" data-mflt="'+x[0]+'" aria-pressed="'+(U.flt===x[0])+'">'+x[1]+' <span class="num">'+c(x[0])+'</span></button>').join('')+'</div>'+
    (L.length?'<ul class="mlist">'+L.map(x=>'<li><button type="button" data-msg="'+x.id+'" aria-current="'+(x.id===U.sel)+'"><span class="r1"><b>'+x.guest+'</b><span class="small num">'+hm(x.at)+'</span></span><span class="q">'+esc(x.q)+'</span><span class="r2"><span class="lb type">'+x.type+'</span>'+lb(msgState(x))+'</span></button></li>').join('')+'</ul>':'<div class="bd">'+empty('inbox','대화가 없습니다','이 조건에 해당하는 대화가 없습니다.',btn({label:'전체 보기',attrs:'data-mflt="all"'}))+'</div>')+'</div>';
  let c3='<div class="panel mc3"><div class="bd">'+empty('msg','대화를 골라 주세요','왼쪽 목록에서 대화를 고르면 본문과 AI 초안이 나옵니다.')+'</div></div>';
  if(m&&L.length){const R=rsvInfo(m),cmp=compare(m),bad=mism(m),st=msgState(m),ex=EXCL.includes(m.type)||m.noBasis,open=m.state==='wait'||m.state==='failed';
    const can=m.state==='wait'&&m.checked&&!bad.length&&m.draft.trim().length>=5;
    c3='<div class="panel mc3" id="msgDetail"><div class="hd"><h3>'+m.guest+' <span class="lb type">'+m.type+'</span> '+lb(st)+'</h3>'+btn({cls:'sm',icon:'time',label:'예약 상세',attrs:'data-act="mRsv" aria-expanded="'+U.showRsv+'"'})+'</div><div class="bd">'+
     (U.showRsv?'<dl class="rs"><div><dt>예약</dt><dd class="mono">'+m.rsv+'</dd></div><div><dt>객실</dt><dd>'+esc(m.room)+'</dd></div><div><dt>숙박</dt><dd class="num">'+R.stay+'</dd></div><div><dt>인원</dt><dd>'+R.n+'</dd></div><div><dt>상태</dt><dd>'+R.st+'</dd></div></dl>'+(R.inGrid?'<div class="sendrow">'+btn({cls:'sm',label:'UI-01에서 열기',attrs:'data-openbook="'+m.rsv+'"'})+'</div>':''):'')+
     '<div class="bub"><span class="small">'+m.ch+' · '+hm(m.at)+'</span>'+esc(m.q)+'</div>'+
     '<div class="aibox"><div class="aih"><b>'+(m.noBasis?'운영자 답변':'AI 답변 초안')+'</b>'+(ex?'<span class="lb mute">자동발송 제외: '+(m.noBasis?'근거 부족':m.type)+'</span>':'')+(m.edited?'<span class="small">운영자 수정함</span>':'')+'</div>'+
     (m.noBasis&&!m.edited?'<div class="alarm warnl inp">'+ic('alert')+'<span><b>근거 부족.</b> '+esc(m.noBasis)+' 운영자가 직접 답변하거나 이관합니다.</span></div>':'')+
     '<label class="sr" for="dr">답변 내용</label><textarea id="dr" rows="3" data-draft="'+m.id+'"'+(open?'':' readonly')+' placeholder="답변을 입력해 주세요">'+esc(m.draft)+'</textarea>'+
     (m.noBasis?'':'<p class="basis">근거: 숙소 안내 / Channex 연결 예약 <span class="mono">'+m.rsv+'</span> / 확인 시각 <span class="num">'+hm(m.chkAt)+'</span></p>')+
     (cmp.length?'<div class="tw"><table class="t cmp"><thead><tr><th>항목</th><th>초안 값</th><th>원본 값</th><th>일치</th><th>원본</th></tr></thead><tbody>'+cmp.map(x=>'<tr class="'+(m.checked&&x.res==='불일치'?'fl':'')+'"><td>'+x.k+'</td><td class="num"><b>'+esc(x.draft==null?'-':x.draft)+'</b></td><td class="num">'+esc(x.val)+'</td><td>'+(m.checked?lb(x.res):lb('재대조 필요'))+'</td><td>'+x.src+'</td></tr>').join('')+'</tbody></table></div>':'')+
     (m.state==='failed'?'<div class="alarm inp" role="alert">'+ic('alert')+'<span><b>발송 실패.</b> '+esc(m.failWhy)+'. 같은 메시지 번호로 다시 보내 중복 발송을 막습니다.</span></div>':'')+
     (m.state==='wait'&&m.checked&&bad.length?'<div class="alarm inp" role="alert">'+ic('alert')+'<span><b>운영자 확인.</b> '+bad.map(b=>b.k+' 초안 '+esc(b.draft)+', 원본 '+esc(b.val)).join(' / ')+'. 일치할 때까지 발송할 수 없습니다.</span></div>':'')+
     (m.state==='wait'&&!m.checked?'<div class="alarm warnl inp">'+ic('alert')+'<span>초안을 고쳤습니다. 근거 대조를 다시 실행한 뒤 발송할 수 있습니다.</span></div>':'')+
     (m.state==='sent'?'<div class="alarm ok inp">'+ic('check')+'<span><b style="color:var(--ok)">'+hm(m.sentAt)+' 발송 완료.</b> 같은 문의에는 다시 발송되지 않습니다.</span></div>':'')+
     (m.state==='handed'?'<div class="alarm mutel inp">'+ic('lock')+'<span>운영자에게 이관했습니다. 미처리 목록에 남습니다.</span></div>':'')+
     (open?'<div class="sendrow">'+(m.state==='failed'?btn({cls:'pri',icon:'retry',label:'다시 발송',attrs:'data-act="msgRetry"'}):(m.noBasis?'':btn({icon:'compare',label:'근거 대조 다시 실행',attrs:'data-act="msgCheck"'}))+btn({icon:'alert',label:'운영자 확인으로 이관',attrs:'data-act="msgHand"'})+btn({cls:'pri',icon:'send',label:'검토 후 발송',attrs:'data-act="msgSend"'+(can?'':' disabled')}))+'</div>':'')+
     '</div><div class="lbl">처리 이력</div><ul class="hist">'+m.log.map(h=>'<li><span class="num">'+h[0]+'</span>'+esc(h[1])+'</li>').join('')+'</ul></div></div>';
  }
  return head('UI-04 메시지 관리','AI-01~03 · CHX-04 · 초안의 날짜·인원·금액·시간을 예약과 숙소 안내에 대조합니다. 하나라도 다르면 발송이 막힙니다.',btn({icon:'chart',label:'AI 관찰·자동발송',attrs:'data-go="auto"'}))+'<div class="m3">'+c1+c2+c3+'</div>';
}

/* ===== AI 관찰·자동발송 ===== */
S.auto={stop:false,types:[{t:'체크인 안내',d:28,n:64,e:0,on:false},{t:'주차',d:19,n:31,e:2,on:false},{t:'편의시설',d:12,n:22,e:3,on:false}],chan:{'플랫폼 A':true,'플랫폼 B':true,'플랫폼 C':true},log:[{at:'10-05 09:00',t:'유형별 무보정 관찰 시작'}]};
function vAuto(){const A=S.auto;
  const w=S.msgs.filter(m=>m.state==='wait'||m.state==='handed'),nB=w.filter(m=>m.noBasis&&!m.edited).length,nH=w.filter(m=>m.checked&&mism(m).length).length+S.msgs.filter(m=>m.state==='handed').length,nF=S.msgs.filter(m=>m.state==='failed').length,nE=w.filter(m=>EXCL.includes(m.type)).length;
  const W=[['10-05~10-11',34,28,26,2,6,1,12],['10-12~10-18',35,30,28,2,5,0,8],['10-19~10-25',36,29,28,1,7,1,0],['10-26~11-01',36,30,30,0,6,0,0]],sum=W.reduce((a,r)=>a.map((v,i)=>i?v+r[i]:v),['합계',0,0,0,0,0,0,0]);
  const rate=(r)=>Math.round(r[3]/(r[3]+r[4])*100)+'%';
  return head('AI 관찰·자동발송 설정','AI-02~03 · 문의 유형별 연속 무보정 일수가 4주(28일)를 채운 유형만 자동발송을 켤 수 있습니다.')+
    (A.stop?'<div class="alarm" role="alert">'+ic('lock')+'<span><b>전체 중지 중입니다.</b> 모든 문의가 운영자 검토로 들어가고 자동으로 나가는 메시지가 없습니다.</span></div>':'')+
    '<div class="panel"><div class="hd"><h3>전체 중지</h3><label class="sw"><input type="checkbox" data-autostop="1"'+(A.stop?' checked':'')+' aria-label="자동발송 전체 중지"><span class="tr"></span>'+(A.stop?'중지 중':'운영 중')+'</label></div></div>'+
    '<div class="panel"><div class="hd"><h3>유형별 판정</h3><span class="small">기준 28일 연속 무보정</span></div><div class="tw"><table class="t au"><thead><tr><th>문의 유형</th><th>연속 무보정</th><th class="r">최근 28일 초안</th><th class="r">수정</th><th>판정</th><th>자동발송</th></tr></thead><tbody>'+
    A.types.map(x=>{const ok=x.d>=28;return '<tr><td><b>'+x.t+'</b></td><td><div class="dbar"><span class="trk"><i style="width:'+Math.min(100,x.d/28*100)+'%"></i></span><span class="num">'+x.d+'일 / 28일</span></div></td><td class="r num">'+x.n+'건</td><td class="r num">'+x.e+'건</td><td>'+lb(ok?'충족':'관찰 중')+(ok?'':' <span class="small">'+(28-x.d)+'일 남음</span>')+'</td><td><label class="sw'+(ok&&!A.stop?'':' off')+'"><input type="checkbox" data-autotype="'+x.t+'"'+(x.on&&!A.stop?' checked':'')+(ok&&!A.stop?'':' disabled')+' aria-label="'+x.t+' 자동발송"><span class="tr"></span>'+(x.on&&!A.stop?'켜짐':'꺼짐')+'</label></td></tr>';}).join('')+
    EXCL.concat(['근거 부족']).map(t=>'<tr class="excl"><td><b>'+t+'</b></td><td class="small">관찰 대상 아님</td><td class="r">-</td><td class="r">-</td><td>'+lb('제외')+'</td><td class="small">'+ic('lock')+' 고정</td></tr>').join('')+
    '</tbody></table></div></div>'+
    '<div class="panel"><div class="hd"><h3>채널별 자동발송</h3><span class="small">CHX-04 · 기존 예약 자동 메시지는 건드리지 않습니다</span></div><div class="tw"><table class="t"><thead><tr><th>채널</th><th>메시지 API</th><th>자동발송</th></tr></thead><tbody>'+
    CH.map(c=>{const sup=c!=='플랫폼 D';return '<tr><td class="chn">'+c+'</td><td>'+lb(sup?'지원':'미지원')+'</td><td>'+(sup?'<label class="sw'+(A.stop?' off':'')+'"><input type="checkbox" data-autochan="'+c+'"'+(A.chan[c]&&!A.stop?' checked':'')+(A.stop?' disabled':'')+' aria-label="'+c+' 자동발송 허용"><span class="tr"></span>'+(A.chan[c]&&!A.stop?'허용':'차단')+'</label>':'<span class="small">'+ic('lock')+' 선택 불가</span>')+'</td></tr>';}).join('')+'</tbody></table></div></div>'+
    '<p class="note">'+ic('alert')+'자동발송을 켠 유형도 근거 대조에서 걸리면 보내지 않고 운영자 확인으로 넘깁니다. 운영자가 초안을 고치면 그 유형의 연속 일수는 0일부터 다시 셉니다.</p>'+
    '<div class="sumline"><div>근거 부족<b class="'+(nB?'warnc':'')+'">'+nB+'</b></div><div>보류·이관<b class="'+(nH?'bad':'')+'">'+nH+'</b></div><div>발송 실패<b class="'+(nF?'bad':'')+'">'+nF+'</b></div><div>제외 유형 대기<b>'+nE+'</b></div></div>'+
    '<div class="panel"><div class="hd"><h3>미처리·통계</h3><span class="small">집계 기간 10-05~11-01 (28일)</span></div><div class="tw"><table class="t"><thead><tr><th>기간</th><th class="r">문의</th><th class="r">초안 생성</th><th class="r">무보정 발송</th><th class="r">수정 후 발송</th><th class="r">제외·이관</th><th class="r">발송 실패</th><th class="r">자동답변</th><th class="r">무보정률</th><th class="r">모의 발송(제외)</th></tr></thead><tbody>'+
    W.map(r=>'<tr><td class="num">'+r[0]+'</td>'+[1,2,3,4,5,6].map(i=>'<td class="r num">'+r[i]+'</td>').join('')+'<td class="r num">0</td><td class="r num">'+rate(r)+'</td><td class="r num">'+r[7]+'</td></tr>').join('')+
    '</tbody><tfoot><tr><td>합계</td>'+[1,2,3,4,5,6].map(i=>'<td class="r num">'+sum[i]+'</td>').join('')+'<td class="r num">0</td><td class="r num">'+rate(sum)+'</td><td class="r num">'+sum[7]+'</td></tr></tfoot></table></div></div>'+
    '<p class="note">'+ic('alert')+'무보정률 = 무보정 발송 ÷ (무보정 발송 + 수정 후 발송). 모의 발송은 실제 자동응대 실적에 넣지 않습니다. 관찰 기간에는 운영자가 모든 메시지를 확인하므로 자동답변은 0건입니다.</p>'+
    '<div class="panel"><div class="hd"><h3>변경 기록</h3></div><div class="tw"><table class="t"><thead><tr><th>일시</th><th>내용</th></tr></thead><tbody>'+A.log.map(l=>'<tr><td class="num">'+l.at+'</td><td class="wrap">'+esc(l.t)+'</td></tr>').join('')+'</tbody></table></div></div>';
}

/* ===== 기존 메뉴 유지 화면 ===== */
function vReport(){return head('정산 리포트','기존 화면 유지 · 이번 범위에서 개편하지 않습니다.')+'<div class="panel"><div class="bd">'+empty('chart','기존 정산 리포트 화면을 그대로 씁니다','예약 매출·정산 조회는 범위 제외입니다. 시연은 예약 운영과 메시지에서 보실 수 있습니다.',btn({label:'예약 운영으로',attrs:'data-go="ui01"'}))+'</div></div>';}
function vMe(){return head('내 프로필','기존 화면 유지')+'<div class="panel"><div class="bd"><dl class="dl"><dt>권한</dt><dd>운영자 · 허용 숙소 3곳</dd><dt>조회·변경 범위</dt><dd>허용된 숙소의 예약·요금·문의만 관리</dd><dt>구독 결제</dt><dd>범위 제외, 기존 그대로</dd></dl></div></div>';}

/* ===== 시연 안내 ===== */
const AUX=[['ui00','연동 구조 UI-00'],['status','연동 현황'],['fails','실패 건'],['rsv','예약 타임라인'],['events','이벤트 기록'],['recon','기록 대조'],['flags','반영 스위치'],['alerts','알림 설정']];
const MENU=[['ui01'],['ui02'],['ui03'],['ui04'],['auto'],['report'],['me']].concat(AUX);
const TOPS=[['ui01','예약 운영',['ui01','ui02','ui03'].concat(AUX.map(x=>x[0]))],['ui04','메시지',['ui04','auto']],['report','정산 리포트',['report']],['me','내 프로필',['me']]];
const SUBS={'예약 운영':[['ui01','예약 관리 UI-01'],['ui02','요금 관리 UI-02'],['ui03','요금 일괄 변경 UI-03'],['status','연동 상태 (보조)']],'메시지':[['ui04','메시지 관리 UI-04'],['auto','AI 관찰·자동발송']]};
const GUIDE=[
  {t:'UI-01 취소 예시와 원본 재조회',d:'취소 구간만 판매 가능으로 바뀌고 수동 차단과 다른 예약은 그대로입니다. RES-03·04',run:()=>{UI.bk.sel='RSV-2611-0302';UI.bk.flt='';UI.bk.q='';UI.bk.prop='';go('ui01');}},
  {t:'UI-02 계산 조건',d:'플랫폼별 등록 가격. 조건이 없으면 계산 보류입니다. RATE-01~02',run:()=>go('ui02')},
  {t:'UI-03 부분 실패와 실패만 재처리',d:'응답 유실은 확인 중으로 두고, 성공 항목은 다시 보내지 않습니다. RATE-03~04',run:()=>{if(!UI.rate.preview)makePreview();go('ui03');if(!UI.rate.run)rateSend();setTimeout(()=>{const p=$('runPanel');if(p)p.scrollIntoView({block:'start'});},60);}},
  {t:'UI-04 근거 불일치로 발송 차단',d:'초안 3명, 예약 2명. 고치고 재대조해야 발송됩니다. AI-01~02',run:()=>{UI.m.sel='M-302';UI.m.flt='all';UI.m.prop='';go('ui04');}},
  {t:'AI 관찰·자동발송 설정',d:'28일 무보정 유형만 켤 수 있습니다. 모의 발송은 실적 제외. AI-02~03',run:()=>go('auto')}
];
function renderGuide(){
  const g=$('guide');
  if(UI.guideOpen===null) UI.guideOpen=window.matchMedia('(min-width:1101px)').matches;
  g.className='guide'+(UI.guideOpen?'':' closed');
  document.body.classList.toggle('guide-open',!!UI.guideOpen);
  g.innerHTML='<button type="button" class="gh" data-act="toggleGuide" aria-expanded="'+UI.guideOpen+'" aria-controls="guideList"><span>시연 안내</span>'+ic(UI.guideOpen?'down':'up')+'</button>'+
    '<ol id="guideList">'+GUIDE.map((s,i)=>'<li><button type="button" data-guide="'+i+'"'+(UI.guideStep===i?' aria-current="step"':'')+'><b><span class="n">'+(i+1)+'.</span>'+s.t+'</b>'+(UI.guideStep===i?'<span class="d">'+s.d+'</span>':'')+'</button></li>').join('')+'</ol>';
}

/* ===== render ===== */
const V={status:vStatus,fails:vFails,rsv:vRsv,events:vEvents,recon:vRecon,flags:vFlags,alerts:vAlerts,ui00:vUi00,ui01:vUi01,ui02:vUi02,ui03:vUi03,ui04:vUi04,auto:vAuto,report:vReport,me:vMe};
function render(){
  const v=UI.view,tp=TOPS.find(t=>t[2].includes(v)),isAux=AUX.some(x=>x[0]===v),mn=S.msgs.filter(x=>x.state==='wait'||x.state==='failed').length,nd=S.books.filter(b=>b.st==='확인 필요').length;
  $('side').innerHTML='<a class="brand" href="#/ui01"><span class="mk" aria-hidden="true"><i></i><i></i><i></i></span><b>채널지기</b></a><div class="tn">'+TOPS.map(t=>'<a href="#/'+t[0]+'"'+(t===tp?' aria-current="page"':'')+'>'+t[1]+(t[1]==='예약 운영'&&nd?'<span class="cnt">'+nd+'</span>':'')+(t[1]==='메시지'&&mn?'<span class="cnt">'+mn+'</span>':'')+'</a>').join('')+'</div>';
  const subs=SUBS[tp[1]]||[];
  $('top').innerHTML='<div class="st">'+subs.map(x=>'<a href="#/'+x[0]+'"'+((x[0]===v||(x[0]==='status'&&isAux))?' aria-current="page"':'')+'>'+x[1]+'</a>').join('')+'</div><span class="sp"></span>'+
    (isAux?'<div class="envsw" role="group" aria-label="환경"><button type="button" data-env="test" aria-pressed="'+(S.env==='test')+'">시험 환경</button><button type="button" data-env="live" aria-pressed="'+(S.env==='live')+'">운영 환경</button></div>':'')+'<span class="clock num">11-02 '+hm(NOW)+' KST</span>';
  $('top').hidden=!subs.length;
  const strip=isAux?'<div class="aux"><span class="small">연동 상태 (보조 화면)</span>'+AUX.map(x=>'<a href="#/'+x[0]+'"'+(x[0]===v?' aria-current="page"':'')+'>'+x[1]+'</a>').join('')+'</div>':'';
  $('main').innerHTML=strip+V[v]();
  renderGuide();
}

const $main=(k)=>{const i=document.querySelector('[data-feet="'+k+'"]');return i?i.value:0;};
function rateDirty(){rateInvalidate();UI.rate.errs=[];render();}
function runResume(run,rows){const go2=(i)=>{if(i>3){run.state='done';logRun(run);toast('실패 항목만 다시 보냈습니다. 성공 항목은 건드리지 않았습니다.');if(UI.view==='ui03')render();return;}rows.forEach(x=>{x.st[i]='busy';});if(UI.view==='ui03')render();setTimeout(()=>{rows.forEach(x=>{x.st[i]='ok';});go2(i+1);},380);};go2(1);}
/* ===== events ===== */
document.addEventListener('click',(e)=>{
  const t=e.target.closest('button,a[data-go]'); if(!t) return; const d=t.dataset;
  if(d.guide!=null){const i=+d.guide;UI.guideStep=i;UI.guideOpen=false;GUIDE[i].run();return;}
  if(d.go){go(d.go);return;}
  if(d.fch){UI.flt={type:'',ch:d.fch};go('fails');return;}
  if(d.rsv){go('rsv');return;}
  if(d.retry){withLoading('재처리 중...',()=>doRetry([d.retry]),380);return;}
  if(d.env){if(S.env===d.env)return;withLoading((d.env==='test'?'시험':'운영')+' 환경으로 바꾸는 중...',()=>{S.env=d.env;toast((d.env==='test'?'시험 환경':'운영 환경')+'을 보고 있습니다.');render();},400);return;}
  if(d.rec){const x=S.recon.rows.find(r=>r.k===d.rec);withLoading(x.act==='보충'?'빠진 예약 보충하는 중...':'채널 기록과 맞추는 중...',()=>{x.st='done';reconDone();toast(x.rsv+' '+(x.act==='보충'?'예약을 보충했습니다.':'재동기화했습니다.'));render();},520);return;}
  if(d.book){UI.bk.sel=d.book;render();if(window.innerWidth<=1100){const p=$('bkDetail');if(p)p.scrollIntoView({block:'start'});}return;}
  if(d.bkflt){UI.bk.flt=UI.bk.flt===d.bkflt?'':d.bkflt;render();return;}
  if(d.openbook){UI.bk.sel=d.openbook;UI.bk.flt='';UI.bk.q='';UI.bk.prop='';go('ui01');return;}
  if(d.rroom){UI.rate.rooms[d.rroom]=!UI.rate.rooms[d.rroom];rateDirty();return;}
  if(d.rdate!=null){UI.rate.dates[d.rdate]=!UI.rate.dates[d.rdate];rateDirty();return;}
  if(d.rch){UI.rate.chs[d.rch]=!UI.rate.chs[d.rch];rateDirty();return;}
  if(d.rplan){UI.rate.plans[d.rplan]=!UI.rate.plans[d.rplan];rateDirty();return;}
  if(d.rq){UI.rate.dates={};DAYS.forEach(x=>{if(d.rq==='all'||(d.rq==='weekend'&&x.we)||(d.rq==='weekday'&&!x.we))UI.rate.dates[x.i]=true;});rateDirty();return;}
  if(d.cardedit){UI.fee.edit=d.cardedit;UI.fee.err={};render();return;}
  if(d.cardsave){const U=UI.fee,c=CFG[U.prop][d.cardsave][U.plan[d.cardsave]||'기본'],fv=$('eF').value,dv=$('eD').value;
    if(fv===''||dv===''||+fv<0||+fv>40||+dv<0||+dv>50){U.err={card:'수수료는 0~40, 할인은 0~50 사이 숫자로 입력해 주세요.'};render();return;}
    withLoading('계산 조건 저장 중...',()=>{c.fee=+fv;c.disc=+dv;c.payer=$('eP').value;c.src='운영자 입력 (11-02)';c.why='';U.edit=null;U.err={};rateInvalidate();toast(d.cardsave+' 조건을 저장했습니다. 기존 미리보기는 무효화했습니다.');render();},380);return;}
  if(d.mprop!=null){UI.m.prop=d.mprop;render();return;}
  if(d.mflt){UI.m.flt=d.mflt;render();return;}
  if(d.msg){UI.m.sel=d.msg;UI.m.showRsv=false;render();if(window.innerWidth<=1100){const p=$('msgDetail');if(p)p.scrollIntoView({block:'start'});}return;}
  switch(d.act){
    case 'bkClear': UI.bk.q='';UI.bk.flt='';UI.bk.prop='';render(); return;
    case 'bkRequery':{const b=S.books.find(x=>x.id===UI.bk.sel);withLoading('Channex 원본 재조회 중...',()=>{b.chk=NOW;if(b.orig&&b.st==='확인 필요'){b.req=true;b.hist.unshift([hm(NOW),'원본 재조회: 불일치 확인 ('+b.why+')']);toast('원본과 다른 값이 있습니다. 확인 후 복구해 주세요.','bad');}else{b.hist.unshift([hm(NOW),'원본 재조회: 일치']);toast('원본과 일치합니다.');}render();},520);return;}
    case 'bkRestore':{const b=S.books.find(x=>x.id===UI.bk.sel);withLoading('원본 기준으로 복구 중...',()=>{b.e=b.orig.e;b.amt=b.orig.amt;b.st='확정';b.chx='일치';b.plat='반영 확인';b.req=false;b.chk=NOW;b.hist.unshift([hm(NOW),'원본 기준 복구 완료: 퇴실 '+dLabel(b.e)+', 금액 '+won(b.amt)]);toast('예약을 복구했고 이력을 남겼습니다.');render();},560);return;}
    case 'bkCancel':{const b=S.books.find(x=>x.id===UI.bk.sel);withLoading('취소 알림 저장 후 ACK, 재고 반영 중...',()=>{b.st='취소';b.chk=NOW;b.hist.unshift([hm(NOW),'취소 수신·저장 후 ACK. 11/04~11/06 판매 재개']);toast('취소 구간만 판매 가능으로 바꿨습니다.');render();},620);return;}
    case 'bkMsg':{const m=S.msgs.find(x=>x.rsv===UI.bk.sel);if(m){UI.m.sel=m.id;UI.m.flt='all';UI.m.prop='';go('ui04');}else toast('이 예약에 연결된 대화가 없습니다.');return;}
    case 'feeSave':{const U=UI.fee,e={};['wd','we'].forEach(k=>{const v=+$main(k);if(!(v>=10000&&v<=5000000))e[k]='10,000~5,000,000원으로 입력해 주세요.';});U.err=e;if(Object.keys(e).length){render();toast('입력 내용을 확인해 주세요.','bad');return;}
      withLoading('기본 요금 저장 중...',()=>{U.wd=+$main('wd');U.we=+$main('we');U.saved='11-02 '+hm(NOW);rateInvalidate();toast('내부에 저장했습니다. 외부 전송은 UI-03에서 합니다.');render();},420);return;}
    case 'cardCancel': UI.fee.edit=null;UI.fee.err={};render(); return;
    case 'ratePreview': withLoading('플랫폼별 가격 계산 중...',()=>{const ok=makePreview();toast(ok?'계산했습니다. 아직 전송되지 않았습니다.':'입력 내용을 확인해 주세요.',ok?'':'bad');render();},420); return;
    case 'rateSend': rateSend(); return;
    case 'rateRetry':{const run=UI.rate.run,fr=run.rows.filter(x=>x.st.includes('fail'));fr.forEach(x=>{x.tries++;x.plan2=null;x.why='';x.st=['ok','','',''];});run.state='running';render();runResume(run,fr);return;}
    case 'rateRecheck':{const run=UI.rate.run,fr=run.rows.filter(x=>x.st.includes('chk'));withLoading('Channex 재조회 후 판정 중...',()=>{fr.forEach(x=>{x.st=['ok','ok','ok','ok'];x.why='재조회로 접수 확인. 다시 보내지 않음';});logRun(run);toast(fr.length+'항목을 재조회로 확인했습니다. 다시 보내지 않았습니다.');render();},520);return;}
    case 'rateAlt':{const run=UI.rate.run,fr=run.rows.filter(x=>x.st.includes('need'));withLoading('대체 검증 기록 중...',()=>{fr.forEach(x=>{x.st=['ok','ok','ok','ok'];x.why='플랫폼 관리 화면 대조로 대체 검증 ('+hm(NOW)+')';});logRun(run);toast('사유와 대체 검증을 기록했습니다.');render();},420);return;}
    case 'mRsv': UI.m.showRsv=!UI.m.showRsv;render(); return;
    case 'msgCheck':{const m=S.msgs.find(x=>x.id===UI.m.sel);withLoading('예약·숙소 안내와 대조하는 중...',()=>{m.checked=true;m.chkAt=NOW;const b=mism(m).length;m.log.push([hm(NOW),'근거 재대조: '+(b?'불일치 '+b+'건':'모두 일치')]);toast(b?'아직 다른 값이 '+b+'건 있어 발송할 수 없습니다.':'모든 값이 일치합니다. 발송할 수 있습니다.',b?'bad':'');render();},480);return;}
    case 'msgHand':{const m=S.msgs.find(x=>x.id===UI.m.sel);m.state='handed';m.log.push([hm(NOW),'운영자 확인으로 이관']);toast('운영자 확인으로 넘겼습니다.');render();return;}
    case 'msgSend':{const m=S.msgs.find(x=>x.id===UI.m.sel);withLoading('발송 중...',()=>{m.state='sent';m.sentAt=NOW;m.log.push([hm(NOW),'검토 후 발송 완료, '+(m.edited?'운영자 수정 있음':'수정 없음')]);const tt=S.auto.types.find(x=>x.t===m.type);if(tt&&m.edited&&!m.noBasis){tt.d=0;tt.e++;tt.on=false;S.auto.log.unshift({at:'11-02 '+hm(NOW),t:m.type+' 초안을 운영자가 수정해 연속 일수를 0일로 되돌림 ('+m.id+')'});}toast(m.guest+'님께 보냈습니다. (시연에서는 실제로 보내지 않음)');render();},480);return;}
    case 'msgRetry':{const m=S.msgs.find(x=>x.id===UI.m.sel);withLoading('같은 메시지 번호로 다시 보내는 중...',()=>{m.state='sent';m.sentAt=NOW;m.log.push([hm(NOW),'재발송 완료. 중복 발송 없음']);toast('다시 보냈습니다.');render();},480);return;}
    case 'toggleGuide': UI.guideOpen=!UI.guideOpen; renderGuide(); return;
    case 'bulk':{const ids=Object.keys(S.sel).filter(k=>S.sel[k]);withLoading('선택한 '+ids.length+'건 재처리 중...',()=>doRetry(ids),450);return;}
    case 'check': withLoading('4채널 상태 점검하는 중...',()=>{NOW++;['플랫폼 A','플랫폼 B','플랫폼 D'].forEach(c=>CHS[c].last=NOW);toast('점검했습니다. '+(CHS['플랫폼 C'].hook==='비활성'?'플랫폼 C 웹훅이 아직 비활성입니다.':'4채널 모두 정상입니다.'),CHS['플랫폼 C'].hook==='비활성'?'bad':'');render();},560); return;
    case 'hookOn': withLoading('플랫폼 C 웹훅 다시 켜는 중...',()=>{CHS['플랫폼 C'].hook='정상';CHS['플랫폼 C'].last=NOW;toast('플랫폼 C 웹훅을 다시 켰습니다. 꺼져 있던 동안의 예약은 기록 대조에서 보충하세요.');render();},560); return;
    case 'recon': withLoading('채널 기록과 대조하는 중...',()=>{NOW++;S.recon.last=NOW;S.recon.checked=312;const open=S.recon.rows.filter(x=>x.st!=='done');
        S.recon.result='마지막 대조 '+hm(NOW)+' · 확인 312건 · '+(open.length?'불일치 '+open.filter(x=>x.act==='재동기화').length+'건 · 빠진 예약 '+open.filter(x=>x.act==='보충').length+'건 처리 대기':'남은 불일치 없음');toast('대조를 마쳤습니다. 처리 대기 '+open.length+'건');render();},600); return;
    case 'reconAll': withLoading('불일치와 빠진 예약을 처리하는 중...',()=>{S.recon.rows.forEach(x=>x.st='done');reconDone();toast('빠진 예약 2건을 보충하고 불일치 1건을 재동기화했습니다.');render();},600); return;
    case 'evAll': UI.evf='';render(); return;
    case 'alertSave':{const sms=$('aSms').checked,mail=$('aMail').checked;if(!sms&&!mail){$('aErr').textContent='받을 곳을 하나 이상 골라 주세요.';$('aSms').focus();return;}
      withLoading('저장 중...',()=>{Object.assign(S.alertCfg,{sms,mail,rate:$('aRate').value,hook:$('aHook').value,conn:$('aConn').checked,exhaust:$('aEx').checked,saved:'11-02 '+hm(NOW)});toast('알림 설정을 저장했습니다.');render();},450);return;}
    case 'alertTest': withLoading('시험 알림 보내는 중...',()=>toast('시험 알림을 '+[S.alertCfg.sms?'문자':'',S.alertCfg.mail?'메일':''].filter(Boolean).join('·')+'로 보냈습니다. (시연에서는 실제로 보내지 않음)'),450); return;
  }
});
document.addEventListener('input',(e)=>{
  const i=e.target,d=i.dataset;
  if(d.bkq){UI.bk.q=i.value;clearTimeout(UI.qT);UI.qT=setTimeout(()=>{render();const q=$('bkQ');if(q){q.focus();q.setSelectionRange(q.value.length,q.value.length);}},250);return;}
  if(d.mq){UI.m.q=i.value;clearTimeout(UI.qT);UI.qT=setTimeout(()=>{render();const q=$('mQ');if(q){q.focus();q.setSelectionRange(q.value.length,q.value.length);}},250);return;}
  if(d.draft){const m=S.msgs.find(x=>x.id===d.draft);if(!m.edited)m.log.push([hm(NOW),'운영자 수정']);m.draft=i.value;m.edited=true;m.checked=!!m.noBasis;return;}
});
document.addEventListener('change',(e)=>{
  const i=e.target,d=i.dataset;
  if(d.draft){render();return;}
  if(d.bkprop!=null&&i.id==='bkP'){UI.bk.prop=i.value;withLoading('조회 중...',render,300);return;}
  if(d.feeprop){UI.fee.prop=i.value;UI.fee.edit=null;withLoading('조회 중...',render,300);return;}
  if(d.cardplan){UI.fee.plan[d.cardplan]=i.value;render();return;}
  if(d.autostop){const on=i.checked;withLoading(on?'자동발송을 전체 중지하는 중...':'자동발송 중지를 푸는 중...',()=>{S.auto.stop=on;S.auto.log.unshift({at:'11-02 '+hm(NOW),t:on?'자동발송 전체 중지':'자동발송 전체 중지 해제'});toast(on?'자동발송을 모두 멈췄습니다.':'전체 중지를 풀었습니다.');render();},420);return;}
  if(d.autotype){const x=S.auto.types.find(t=>t.t===d.autotype),on=i.checked;withLoading('자동발송 설정 저장 중...',()=>{x.on=on;S.auto.log.unshift({at:'11-02 '+hm(NOW),t:x.t+' 자동발송 '+(on?'켬 ('+x.d+'일 연속 무보정 확인)':'끔')});toast(x.t+' 자동발송을 '+(on?'켰습니다.':'껐습니다.'));render();},420);return;}
  if(d.autochan){S.auto.chan[d.autochan]=i.checked;S.auto.log.unshift({at:'11-02 '+hm(NOW),t:d.autochan+' 자동발송 '+(i.checked?'허용':'차단')});render();return;}
  if(d.sel){S.sel[d.sel]=i.checked;render();return;}
  if(d.all){S.fails.filter(x=>x.state==='wait'&&(!UI.flt.type||x.type===UI.flt.type)&&(!UI.flt.ch||x.ch===UI.flt.ch)).forEach(x=>S.sel[x.id]=i.checked);render();return;}
  if(d.flt){UI.flt[d.flt]=i.value;withLoading('조회 중...',render,300);return;}
  if(d.evf){UI.evf=i.value;withLoading('조회 중...',render,300);return;}
  if(d.flag){const env=S.env==='test'?'test':'live',k=d.flag,on=i.checked,p=PROPS.find(x=>x.k===k);
    withLoading(on?'새 처리 방식으로 바꾸는 중...':'이전 처리 방식으로 되돌리는 중...',()=>{S.flags[env][k]=on;S.flagLog.unshift({at:'11-02 '+hm(NOW),t:(env==='test'?'시험':'운영')+' 환경 '+p.name+' 새 처리 방식 '+(on?'켬':'끔 (이전 방식으로 복귀)')});
      toast(p.name+': '+(on?'새 처리 방식을 켰습니다.':'이전 처리 방식으로 돌아갔습니다. 예약 데이터는 그대로입니다.'));render();},520);return;}
});
window.addEventListener('hashchange',route);
route();
})();
