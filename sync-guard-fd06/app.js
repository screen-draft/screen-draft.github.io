(function(){
"use strict";
const ic=(n)=>'<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-'+n+'"/></svg>';
const esc=(s)=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=(id)=>document.getElementById(id);
const pad=(n)=>String(n).padStart(2,'0');
/* 시연 기준 시각: 2026-10-19 14:20 (분 단위로 흐른다) */
let NOW=14*60+20;
const hm=(m)=>pad(Math.floor(m/60))+':'+pad(m%60);
const ago=(m)=>{const d=NOW-m;return d<1?'방금':d<60?d+'분 전':Math.floor(d/60)+'시간 전';};

/* ===== 기준 데이터 (예시) ===== */
const PROPS=[
  {k:'A',name:'숙소 A 바닷가 독채',rooms:['독채'],},
  {k:'B',name:'숙소 B 한옥 스테이',rooms:['한옥 1호실','한옥 2호실']},
  {k:'C',name:'숙소 C 숲속 객실',rooms:['숲 101','숲 102','숲 103','숲 104']}
];
const CH=['Airbnb','Booking.com','Agoda','Trip.com'];
const CHS={
  'Airbnb':{conn:'정상',hook:'정상',last:14*60+18},
  'Booking.com':{conn:'정상',hook:'정상',last:14*60+16},
  'Agoda':{conn:'정상',hook:'비활성',last:14*60+8,hookOff:14*60+8},
  'Trip.com':{conn:'정상',hook:'정상',last:14*60+11}
};
const TYPES=['취소 반영','요금 전송','메시지','예약 변경 알림'];
const F=(id,type,prop,room,ch,why,tries,next,rsv,desc)=>({id,type,prop,room,ch,why,tries,next,rsv,desc,state:'wait'});
const S={
  env:'live',
  fails:[
    F('JOB-4471','취소 반영','B','한옥 1호실','Booking.com','시간 초과',2,14*60+26,'RSV-2610-0187','10/24~10/27 취소 확인 전송'),
    F('JOB-4468','요금 전송','A','독채','Agoda','호출 제한',3,14*60+31,'','10/25~10/31 주말 요금 180,000원'),
    F('JOB-4465','요금 전송','C','숲 102','Agoda','호출 제한',1,14*60+24,'','11/01~11/07 평일 요금 95,000원'),
    F('JOB-4462','메시지','A','독채','Trip.com','인증 실패',3,null,'RSV-2610-0179','게스트 메시지 1건 (체크인 안내)'),
    F('JOB-4459','예약 변경 알림','C','숲 104','Agoda','응답 유실',2,14*60+29,'RSV-2610-0183','인원 2명 → 3명 변경 반영'),
    F('JOB-4455','취소 반영','C','숲 101','Booking.com','응답 유실',1,14*60+23,'RSV-2610-0168','11/02~11/03 취소 확인 전송'),
    F('JOB-4451','요금 전송','B','한옥 2호실','Trip.com','시간 초과',2,14*60+27,'','10/26 단일 요금 210,000원')
  ],
  doneJobs:[],
  events:[
    {id:'EV-1019-7f3a',type:'booking_cancelled',rsv:'RSV-2610-0187',ch:'Booking.com',at:'13:55:02',st:'처리 완료',ack:'13:55:02.184',note:''},
    {id:'EV-1018-c21e',type:'booking_modified',rsv:'RSV-2610-0187',ch:'Booking.com',at:'13:55:09',st:'순서 보정',ack:'13:55:09.091',note:'10/18 변경 알림이 취소 뒤에 늦게 도착. 최신 상태(취소) 유지'},
    {id:'EV-1019-a90b',type:'booking_new',rsv:'RSV-2610-0191',ch:'Airbnb',at:'14:02:44',st:'처리 완료',ack:'14:02:44.210',note:''},
    {id:'EV-1019-a90b',type:'booking_new',rsv:'RSV-2610-0191',ch:'Airbnb',at:'14:02:51',st:'중복 무시',ack:'14:02:51.077',note:'같은 이벤트 ID 재수신'},
    {id:'EV-1019-5d12',type:'message_new',rsv:'RSV-2610-0179',ch:'Trip.com',at:'14:05:13',st:'처리 완료',ack:'14:05:13.402',note:''},
    {id:'EV-1019-3b77',type:'booking_modified',rsv:'RSV-2610-0183',ch:'Agoda',at:'14:06:30',st:'재시도 중',ack:'14:06:30.155',note:'처리 실패 → 실패 건 JOB-4459'},
    {id:'EV-1019-0e48',type:'booking_new',rsv:'RSV-2610-0185',ch:'Booking.com',at:'14:09:57',st:'처리 완료',ack:'14:09:57.233',note:'재시작 후 복구',rec:1},
    {id:'EV-1019-1c09',type:'booking_modified',rsv:'RSV-2610-0172',ch:'Booking.com',at:'14:10:04',st:'처리 완료',ack:'14:10:04.118',note:'재시작 후 복구',rec:1},
    {id:'EV-1019-8a61',type:'message_new',rsv:'RSV-2610-0191',ch:'Airbnb',at:'14:14:20',st:'처리 완료',ack:'14:14:20.301',note:''},
    {id:'EV-1019-6f20',type:'booking_new',rsv:'RSV-2610-0193',ch:'Trip.com',at:'14:17:41',st:'대기',ack:'14:17:41.066',note:'처리 대기열 2번째'},
    {id:'EV-1019-9c33',type:'booking_cancelled',rsv:'RSV-2610-0168',ch:'Booking.com',at:'14:18:05',st:'재시도 중',ack:'14:18:05.140',note:'취소 확인 전송 실패 → JOB-4455'}
  ],
  recon:{last:14*60,checked:308,rows:[
    {k:'m1',rsv:'RSV-2610-0172',prop:'C',room:'숲 103',ch:'Booking.com',inner:'취소',ext:'예약 유지',kind:'불일치',act:'재동기화',st:'wait'},
    {k:'m2',rsv:'AG-773105',prop:'A',room:'독채',ch:'Agoda',inner:'없음',ext:'확정 11/08~11/09',kind:'빠진 예약',act:'보충',st:'wait'},
    {k:'m3',rsv:'AG-773118',prop:'C',room:'숲 102',ch:'Agoda',inner:'없음',ext:'확정 11/14~11/16',kind:'빠진 예약',act:'보충',st:'wait'}
  ],result:'확인 308건 · 불일치 1건 · 빠진 예약 2건 (Agoda 웹훅 비활성 기간)'},
  flags:{test:{A:true,B:true,C:true},live:{A:true,B:false,C:false}},
  flagLog:[{at:'10-17 10:30',t:'운영 환경 숙소 A 새 처리 방식 켬'},{at:'10-15 16:05',t:'시험 환경 숙소 A·B·C 새 처리 방식 켬'}],
  alertCfg:{sms:true,mail:true,rate:'5',hook:'10',conn:true,exhaust:true,saved:'10-17 10:32'},
  sel:{}
};
const UI={view:'status',flt:{type:'',ch:''},evf:'',guideOpen:null,guideStep:null};
const propName=(k)=>PROPS.find(p=>p.k===k).name;
const activeFails=()=>S.fails.filter(f=>f.state!=='gone');
const failCnt=(ch)=>activeFails().filter(f=>f.ch===ch).length;

function go(v){if(location.hash==='#/'+v) route(); else location.hash='#/'+v;}
function route(){const v=location.hash.replace(/^#\/?/,'').split('/')[0];UI.view=MENU.some(m=>m[0]===v)?v:'status';if(Date.now()-(toast.at||0)>300)$('toastHost').innerHTML='';render();window.scrollTo(0,0);}
function toast(msg,kind){toast.at=Date.now();const h=$('toastHost');h.innerHTML='<div class="toast'+(kind==='bad'?' bad':'')+'" role="'+(kind==='bad'?'alert':'status')+'">'+ic(kind==='bad'?'alert':'check')+'<span>'+esc(msg)+'</span></div>';clearTimeout(toast.t);toast.t=setTimeout(()=>{h.innerHTML='';},3600);}
let busy=false;
function withLoading(msg,fn,ms){if(busy)return;busy=true;$('overlayHost').innerHTML='<div class="overlay" role="status" aria-live="assertive"><div class="ob"><span class="spin" aria-hidden="true"></span><span>'+esc(msg)+'</span></div></div>';setTimeout(()=>{$('overlayHost').innerHTML='';busy=false;fn();},ms||480);}
const btn=(o)=>'<button type="button" class="btn '+(o.cls||'')+'" '+(o.attrs||'')+'>'+(o.icon?ic(o.icon):'')+(o.cls&&o.cls.indexOf('icon-m')>=0?'<span class="lbl">'+esc(o.label)+'</span>':esc(o.label))+'</button>';
const lb=(t)=>{const k={'성공':'ok','처리 완료':'ok','정상':'ok','켜짐':'ok','재시도 중':'warn','처리 중':'warn','대기':'mute','중복 무시':'mute','순서 보정':'info','실패':'bad','비활성':'bad','끊김':'bad','수동 처리 필요':'bad','꺼짐':'mute','유지':'info'}[t]||'mute';
  const i={'ok':'check','bad':'x'}[k];return '<span class="lb '+k+'">'+(i?ic(i):'')+esc(t)+'</span>';};
const empty=(i,t,d,b)=>'<div class="empty">'+ic(i)+'<strong>'+esc(t)+'</strong><p>'+esc(d)+'</p>'+(b||'')+'</div>';
const head=(t,sub,acts)=>'<div class="ph"><div><h2>'+t+'</h2>'+(sub?'<div class="sub">'+sub+'</div>':'')+'</div>'+(acts?'<div class="acts">'+acts+'</div>':'')+'</div>';

/* ===== 1. 연동 현황 ===== */
function alarmLine(){
  const a=CHS['Agoda'];
  if(a.hook==='비활성') return '<div class="alarm" role="alert">'+ic('alert')+'<span><b>Agoda 웹훅 비활성 감지</b> '+ago(a.hookOff)+' ('+hm(a.hookOff)+'부터). 그동안 들어온 예약은 기록 대조로 보충합니다.</span><span class="sp"></span>'+btn({cls:'sm',icon:'plug',label:'웹훅 다시 켜기',attrs:'data-act="hookOn"'})+btn({cls:'sm',label:'기록 대조로',attrs:'data-go="recon"'})+'</div>';
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
    setTimeout(()=>{xs.forEach(x=>{x.state='gone';S.doneJobs.unshift({id:x.id,type:x.type,ch:x.ch,at:hm(NOW)});if(x.rsv==='RSV-2610-0187'&&x.type==='취소 반영')TL.bk='성공';S.events.forEach(ev=>{if(ev.note.indexOf(x.id)>=0){ev.st='처리 완료';ev.note='재처리 성공 ('+x.id+', '+hm(NOW)+')';}});});
      toast(xs.length+'건 재처리했습니다. 채널 반영을 확인했고 목록에서 뺐습니다.');render();},700);},550);
}

/* ===== 3. 예약 상세 타임라인 ===== */
const TL={bk:'재시도 중'};
function vRsv(){
  const st=(t)=>lb(t);
  const chTable=(rows)=>'<div class="tw"><table class="t"><thead><tr><th>채널</th><th>반영 내용</th><th>결과</th><th>시각</th></tr></thead><tbody>'+rows.map(r=>'<tr><td class="chn">'+r[0]+'</td><td>'+r[1]+'</td><td>'+st(r[2])+'</td><td class="num">'+r[3]+'</td></tr>').join('')+'</tbody></table></div>';
  return head('예약 상세','RSV-2610-0187 · 생성부터 취소까지 채널별 반영 결과와 받은 알림입니다.',btn({icon:'left',label:'실패 건 목록',attrs:'data-go="fails"'}))+
    '<div class="rsv"><div>예약<b class="mono">RSV-2610-0187</b></div><div>숙소·객실<b>숙소 B · 한옥 1호실</b></div><div>예약 채널<b>Booking.com</b><span class="mono">BK-482137</span></div><div>게스트 · 현재 상태<b>K.J. · 취소</b></div></div>'+
    '<div class="panel"><div class="hd"><h3>처리 이력</h3><span class="small">24시간제, 받은 순서가 아니라 예약의 실제 순서로 보정해 표시</span></div><div class="bd"><ol class="tl">'+
    '<li><div class="tm"><b>10-17</b>09:12</div><div class="ev"><h4>예약 생성</h4><div class="meta">Booking.com에서 들어옴 · 10/24~10/26 2박, 성인 2</div>'+
      chTable([['Airbnb','10/24~10/25 재고 1 → 0','성공','09:12:06'],['Agoda','10/24~10/25 재고 1 → 0','성공','09:12:07'],['Trip.com','10/24~10/25 재고 1 → 0','성공','09:12:07']])+
      '<div class="evrow"><span>받은 알림</span><span class="mono">EV-1017-41d2</span><span>booking_new</span>'+lb('처리 완료')+'<span>응답 09:12:05.312</span></div></div></li>'+
    '<li><div class="tm"><b>10-18</b>21:40</div><div class="ev"><h4>예약 변경</h4><div class="meta">1박 연장 · 10/24~10/27 3박</div>'+
      chTable([['Airbnb','10/26 재고 1 → 0','성공','21:40:12'],['Agoda','10/26 재고 1 → 0','성공','21:40:13'],['Trip.com','10/26 재고 1 → 0','성공','21:40:13']])+
      '<div class="evrow"><span>받은 알림</span><span class="mono">EV-1018-c21e</span><span>booking_modified</span>'+lb('처리 완료')+'<span>21:40:11 첫 수신</span></div>'+
      '<div class="evrow"><span>같은 알림 재수신</span><span class="mono">EV-1018-c21e</span>'+lb('중복 무시')+'<span>21:41:02, 이벤트 ID가 같아 다시 처리하지 않음</span></div></div></li>'+
    '<li class="cancel"><div class="tm"><b>10-19</b>13:55</div><div class="ev"><h4>예약 취소</h4><div class="meta">게스트 취소 · Booking.com 수신</div>'+
      chTable([['Airbnb','10/24~10/26 재고 0 → 1','성공','13:55:04'],['Agoda','10/24~10/26 재고 0 → 1','성공','13:55:05'],['Trip.com','10/24~10/26 재고 0 → 1','성공','13:55:05'],['Booking.com','취소 확인 전송 (JOB-4471)',TL.bk,TL.bk==='성공'?'재처리 완료':'다음 14:26']])+
      '<div class="evrow"><span>받은 알림</span><span class="mono">EV-1019-7f3a</span><span>booking_cancelled</span>'+lb('처리 완료')+'<span>응답 13:55:02.184</span></div>'+
      '<div class="evrow"><span>늦게 온 이전 알림</span><span class="mono">EV-1018-c21e</span>'+lb('순서 보정')+'<span>13:55:09에 변경 알림이 다시 도착. 취소보다 이전 이벤트라 적용하지 않고 취소 상태 유지</span></div>'+
      '<div class="stock"><div class="small" style="margin-bottom:4px">취소 뒤 재고·판매 상태 복원</div><div class="tw"><table class="t"><thead><tr><th>날짜</th><th>재고</th><th>판매 상태</th><th>근거</th></tr></thead><tbody>'+
        '<tr><td class="num">10/24 (토)</td><td class="num">0 → 1</td><td>'+lb('정상')+' 판매 재개</td><td>이 예약으로 막혔던 날</td></tr>'+
        '<tr><td class="num">10/25 (일)</td><td class="num">0 → 1</td><td>'+lb('유지')+' 수동 판매중지 유지</td><td>운영자가 10-13에 직접 막은 날이라 풀지 않음</td></tr>'+
        '<tr><td class="num">10/26 (월)</td><td class="num">0 → 1</td><td>'+lb('정상')+' 판매 재개</td><td>변경으로 추가된 날</td></tr></tbody></table></div></div>'+
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
      L.map(e=>'<tr><td class="mono">'+e.id+'</td><td class="mono">'+e.type+'</td><td>'+(e.rsv==='RSV-2610-0187'?'<button type="button" class="idl" data-rsv="'+e.rsv+'">'+e.rsv+'</button>':'<span class="mono">'+e.rsv+'</span>')+'</td><td>'+e.ch+'</td><td class="num">'+e.at+'</td><td>'+lb(e.st)+'</td><td class="mono">'+e.ack+'</td><td class="wrap">'+(e.rec?'<span class="lb info">'+ic('retry')+'재시작 후 복구</span> ':'')+esc(e.rec?'14:09 서버 재시작 때 처리 중이던 건을 기록에서 다시 꺼내 처리':e.note)+'</td></tr>').join('')+'</tbody></table></div>'
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
      return '<tr><td><b>'+esc(p.name)+'</b></td><td class="r num">'+p.rooms.length+'</td><td><label class="sw"><input type="checkbox" data-flag="'+p.k+'"'+(on?' checked':'')+' aria-label="'+esc(p.name)+' 새 처리 방식"><span class="tr"></span>'+(on?'켜짐':'꺼짐')+'</label></td><td>'+lb(on?'켜짐':'꺼짐')+'</td><td class="r num">'+(on?n+'건':'-')+'</td><td class="r num">'+(on?(env==='live'&&p.k==='A'?'0건':'0건'):'-')+'</td><td class="wrap small">'+(on?(env==='live'?'10-17부터 운영 적용, 이상 없음':'시험 시나리오 통과'):'이전 처리 방식으로 동작 중')+'</td></tr>';}).join('')+
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
    '<div><div class="panel"><div class="hd"><h3>알림 미리보기</h3>'+btn({cls:'sm',icon:'bell',label:'시험 발송',attrs:'data-act="alertTest"'})+'</div><div class="bd"><div class="sms" aria-label="문자 미리보기"><div class="from">채널지기 장애 알림 · '+hm(CHS['Agoda'].hookOff+2)+'</div>[채널지기] Agoda 웹훅 비활성 감지 ('+hm(CHS['Agoda'].hookOff)+'부터)\n최근 10분간 예약 알림 0건, 실패 3건 대기 중\n확인: 연동 현황 화면</div></div></div>'+
    '<div class="panel"><div class="hd"><h3>로그 가림 예시</h3><span class="small">개인정보·인증정보는 저장 전에 가립니다</span></div><div class="logbox" role="region" aria-label="가려진 로그 예시" tabindex="0">14:18:05.140 <span class="k">POST</span> /webhooks/channex  event=booking_cancelled\n  property=prop_B  booking=RSV-2610-0168\n  guest_name=<span class="m">K.***</span>  guest_email=<span class="m">***@***</span>\n  guest_phone=<span class="m">****</span>  api_key=<span class="m">ch_live_****</span>\n  status=stored  ack=200 (31ms)</div></div></div></div>';
}

/* ===== 시연 안내 ===== */
const MENU=[['status','연동 현황','pulse'],['fails','실패 건 목록','retry'],['rsv','예약 상세','time'],['events','이벤트 기록','inbox'],['recon','기록 대조','compare'],['flags','반영 스위치','toggle'],['alerts','알림 설정','bell']];
const GUIDE=[
  {t:'연동 현황에서 경보 확인',d:'Agoda 웹훅 비활성 경보와 채널별 실패 건수를 봅니다.',run:()=>go('status')},
  {t:'실패 건 목록에서 재처리',d:'재처리를 누르면 처리 중, 성공을 거쳐 목록에서 빠집니다.',run:()=>{UI.flt={type:'',ch:''};go('fails');}},
  {t:'예약 타임라인에서 채널별 반영 확인',d:'생성, 변경, 취소마다 채널별 결과와 재고 복원을 봅니다.',run:()=>go('rsv')},
  {t:'이벤트 기록에서 중복·역순 처리 확인',d:'중복 무시, 순서 보정, 재시작 후 복구 표시를 봅니다.',run:()=>{UI.evf='';go('events');}},
  {t:'기록 대조로 빠진 예약 보충',d:'대조를 실행하고 빠진 예약을 보충합니다.',run:()=>go('recon')},
  {t:'반영 스위치',d:'숙소 B를 켜 보고, 끄면 바로 이전 방식으로 돌아갑니다.',run:()=>go('flags')}
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
const V={status:vStatus,fails:vFails,rsv:vRsv,events:vEvents,recon:vRecon,flags:vFlags,alerts:vAlerts};
function render(){
  const n=activeFails().length;
  $('side').innerHTML='<a class="brand" href="#/status"><span class="mk" aria-hidden="true"><i></i><i></i><i></i></span><b>채널지기</b></a><div class="grp">연동 운영</div>'+
    MENU.map(m=>'<a href="#/'+m[0]+'"'+(UI.view===m[0]?' aria-current="page"':'')+'>'+ic(m[2])+m[1]+(m[0]==='fails'&&n?'<span class="cnt">'+n+'</span>':'')+'</a>').join('')+
    '<div class="env">Channex 경유 4채널<br>숙소 3곳 · 객실 7실</div>';
  const cur=MENU.find(m=>m[0]===UI.view);
  $('top').innerHTML='<span class="crumb" style="color:var(--text);font-weight:700">연동 운영 관리</span><span class="crumb">숙소 3곳 · 객실 7실 · Channex 경유 4채널</span><span class="sp"></span>'+
    '<div class="envsw" role="group" aria-label="환경"><button type="button" data-env="test" aria-pressed="'+(S.env==='test')+'">시험 환경</button><button type="button" data-env="live" aria-pressed="'+(S.env==='live')+'">운영 환경</button></div><span class="clock num">10-19 '+hm(NOW)+'</span>';
  $('main').innerHTML=V[UI.view]();
  renderGuide();
}

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
  switch(d.act){
    case 'toggleGuide': UI.guideOpen=!UI.guideOpen; renderGuide(); return;
    case 'bulk':{const ids=Object.keys(S.sel).filter(k=>S.sel[k]);withLoading('선택한 '+ids.length+'건 재처리 중...',()=>doRetry(ids),450);return;}
    case 'check': withLoading('4채널 상태 점검하는 중...',()=>{NOW++;['Airbnb','Booking.com','Trip.com'].forEach(c=>CHS[c].last=NOW);toast('점검했습니다. '+(CHS['Agoda'].hook==='비활성'?'Agoda 웹훅이 아직 비활성입니다.':'4채널 모두 정상입니다.'),CHS['Agoda'].hook==='비활성'?'bad':'');render();},560); return;
    case 'hookOn': withLoading('Agoda 웹훅 다시 켜는 중...',()=>{CHS['Agoda'].hook='정상';CHS['Agoda'].last=NOW;toast('Agoda 웹훅을 다시 켰습니다. 꺼져 있던 동안의 예약은 기록 대조에서 보충하세요.');render();},560); return;
    case 'recon': withLoading('채널 기록과 대조하는 중...',()=>{NOW++;S.recon.last=NOW;S.recon.checked=312;const open=S.recon.rows.filter(x=>x.st!=='done');
        S.recon.result='마지막 대조 '+hm(NOW)+' · 확인 312건 · '+(open.length?'불일치 '+open.filter(x=>x.act==='재동기화').length+'건 · 빠진 예약 '+open.filter(x=>x.act==='보충').length+'건 처리 대기':'남은 불일치 없음');toast('대조를 마쳤습니다. 처리 대기 '+open.length+'건');render();},600); return;
    case 'reconAll': withLoading('불일치와 빠진 예약을 처리하는 중...',()=>{S.recon.rows.forEach(x=>x.st='done');reconDone();toast('빠진 예약 2건을 보충하고 불일치 1건을 재동기화했습니다.');render();},600); return;
    case 'evAll': UI.evf='';render(); return;
    case 'alertSave':{const sms=$('aSms').checked,mail=$('aMail').checked;if(!sms&&!mail){$('aErr').textContent='받을 곳을 하나 이상 골라 주세요.';$('aSms').focus();return;}
      withLoading('저장 중...',()=>{Object.assign(S.alertCfg,{sms,mail,rate:$('aRate').value,hook:$('aHook').value,conn:$('aConn').checked,exhaust:$('aEx').checked,saved:'10-19 '+hm(NOW)});toast('알림 설정을 저장했습니다.');render();},450);return;}
    case 'alertTest': withLoading('시험 알림 보내는 중...',()=>toast('시험 알림을 '+[S.alertCfg.sms?'문자':'',S.alertCfg.mail?'메일':''].filter(Boolean).join('·')+'로 보냈습니다. (시연에서는 실제로 보내지 않음)'),450); return;
  }
});
document.addEventListener('change',(e)=>{
  const i=e.target,d=i.dataset;
  if(d.sel){S.sel[d.sel]=i.checked;render();return;}
  if(d.all){S.fails.filter(x=>x.state==='wait'&&(!UI.flt.type||x.type===UI.flt.type)&&(!UI.flt.ch||x.ch===UI.flt.ch)).forEach(x=>S.sel[x.id]=i.checked);render();return;}
  if(d.flt){UI.flt[d.flt]=i.value;withLoading('조회 중...',render,300);return;}
  if(d.evf){UI.evf=i.value;withLoading('조회 중...',render,300);return;}
  if(d.flag){const env=S.env==='test'?'test':'live',k=d.flag,on=i.checked,p=PROPS.find(x=>x.k===k);
    withLoading(on?'새 처리 방식으로 바꾸는 중...':'이전 처리 방식으로 되돌리는 중...',()=>{S.flags[env][k]=on;S.flagLog.unshift({at:'10-19 '+hm(NOW),t:(env==='test'?'시험':'운영')+' 환경 '+p.name+' 새 처리 방식 '+(on?'켬':'끔 (이전 방식으로 복귀)')});
      toast(p.name+': '+(on?'새 처리 방식을 켰습니다.':'이전 처리 방식으로 돌아갔습니다. 예약 데이터는 그대로입니다.'));render();},520);return;}
});
window.addEventListener('hashchange',route);
route();
})();
