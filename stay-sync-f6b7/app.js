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
const UI={view:'status',flt:{type:'',ch:''},evf:'',guideOpen:null,guideStep:null,cfgProp:'A',msg:'M-302',msgF:{type:'',st:''},
  rate:{rooms:{'독채':true,'한옥 1호실':true},dates:{4:true,5:true,6:true},chs:{'플랫폼 A':true,'플랫폼 B':true,'플랫폼 C':true,'플랫폼 D':true},plans:{'기본':true,'비환불':true},target:190000,preview:null,run:null,errs:[],dup:null,keys:{}}};
const propName=(k)=>PROPS.find(p=>p.k===k).name;
const activeFails=()=>S.fails.filter(f=>f.state!=='gone');
const failCnt=(ch)=>activeFails().filter(f=>f.ch===ch).length;

function go(v){if(location.hash==='#/'+v) route(); else location.hash='#/'+v;}
function route(){const v=location.hash.replace(/^#\/?/,'').split('/')[0];UI.view=MENU.some(m=>m[0]===v)?v:'status';if(Date.now()-(toast.at||0)>300)$('toastHost').innerHTML='';render();window.scrollTo(0,0);}
function toast(msg,kind){toast.at=Date.now();const h=$('toastHost');h.innerHTML='<div class="toast'+(kind==='bad'?' bad':'')+'" role="'+(kind==='bad'?'alert':'status')+'">'+ic(kind==='bad'?'alert':'check')+'<span>'+esc(msg)+'</span></div>';clearTimeout(toast.t);toast.t=setTimeout(()=>{h.innerHTML='';},3600);}
let busy=false;
function withLoading(msg,fn,ms){if(busy)return;busy=true;$('overlayHost').innerHTML='<div class="overlay" role="status" aria-live="assertive"><div class="ob"><span class="spin" aria-hidden="true"></span><span>'+esc(msg)+'</span></div></div>';setTimeout(()=>{$('overlayHost').innerHTML='';busy=false;fn();},ms||480);}
const btn=(o)=>'<button type="button" class="btn '+(o.cls||'')+'" '+(o.attrs||'')+'>'+(o.icon?ic(o.icon):'')+(o.cls&&o.cls.indexOf('icon-m')>=0?'<span class="lbl">'+esc(o.label)+'</span>':esc(o.label))+'</button>';
const lb=(t)=>{const k={'성공':'ok','처리 완료':'ok','정상':'ok','켜짐':'ok','재시도 중':'warn','처리 중':'warn','대기':'mute','중복 무시':'mute','순서 보정':'info','실패':'bad','비활성':'bad','끊김':'bad','수동 처리 필요':'bad','꺼짐':'mute','유지':'info','확인됨':'ok','확인 필요':'warn','일치':'ok','불일치':'bad','언급 없음':'mute','허용 가능':'ok','관찰 중':'warn','자동발송 제외':'mute','발송 완료':'ok','발송 가능':'ok','예약 불일치':'bad','정보 부족':'warn','운영자 발송':'info','대조 다시 필요':'warn'}[t]||'mute';
  const i={'ok':'check','bad':'x'}[k];return '<span class="lb '+k+'">'+(i?ic(i):'')+esc(t)+'</span>';};
const empty=(i,t,d,b)=>'<div class="empty">'+ic(i)+'<strong>'+esc(t)+'</strong><p>'+esc(d)+'</p>'+(b||'')+'</div>';
const head=(t,sub,acts)=>'<div class="ph"><div><h2>'+t+'</h2>'+(sub?'<div class="sub">'+sub+'</div>':'')+'</div>'+(acts?'<div class="acts">'+acts+'</div>':'')+'</div>';

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

/* ===== 8. 요금 계산 조건 ===== */
const PLANS=['기본','비환불'];
const CFG={};
PROPS.forEach(p=>{CFG[p.k]={};[['플랫폼 A',15,0,'플랫폼'],['플랫폼 B',18,10,'숙소'],['플랫폼 C',17,5,'플랫폼'],['플랫폼 D',16,8,'숙소']].forEach(b=>{CFG[p.k][b[0]]={};PLANS.forEach(pl=>{
  CFG[p.k][b[0]][pl]={fee:b[1],disc:pl==='비환불'?b[2]+5:b[2],payer:pl==='비환불'?'숙소':b[3],inc:'청소비 포함',exc:b[0]==='플랫폼 D'?'결제 수수료':'없음',ok:!(b[0]==='플랫폼 D'&&pl==='비환불')&&!(p.k==='B'&&b[0]==='플랫폼 C'&&pl==='기본')};});});});
const won=(n)=>Number(n).toLocaleString('ko-KR')+'원';
function calc(c,target){const d=c.payer==='숙소'?c.disc:0,k=(1-d/100)*(1-c.fee/100),reg=Math.ceil(target/k/100)*100;return {reg,net:Math.floor(reg*k)};}
function vRateCfg(){
  const pk=UI.cfgProp,rows=[];CH.forEach(c=>PLANS.forEach(pl=>rows.push([c,pl,CFG[pk][c][pl]])));
  const un=rows.filter(r=>!r[2].ok).length;
  return head('요금 계산 조건','숙소·요금제·플랫폼별 수수료와 할인 부담 주체입니다. 일괄 변경 미리보기가 이 표로 계산합니다.',btn({icon:'tag',label:'요금 일괄 변경',attrs:'data-go="rates"'}))+
    '<div class="panel"><div class="filters"><label for="cfgP">숙소</label><select id="cfgP" class="f" data-cfgprop="1">'+PROPS.map(p=>'<option value="'+p.k+'"'+(pk===p.k?' selected':'')+'>'+esc(p.name)+'</option>').join('')+'</select><span class="grow"></span><span class="small">확인 필요 '+un+'건</span></div>'+
    '<div class="tw"><table class="t cfg"><thead><tr><th>플랫폼</th><th>요금제</th><th>수수료(%)</th><th>할인(%)</th><th>할인 부담</th><th>포함 비용</th><th>제외 비용</th><th>조건 상태</th><th></th></tr></thead><tbody>'+
    rows.map(r=>{const id=r[0]+'|'+r[1],c=r[2];return '<tr><td class="chn">'+r[0]+'</td><td>'+r[1]+'</td><td><input type="number" class="numi" min="0" max="40" step="0.5" value="'+c.fee+'" data-cfg="'+id+'|fee" aria-label="'+r[0]+' '+r[1]+' 수수료"></td><td><input type="number" class="numi" min="0" max="50" step="1" value="'+c.disc+'" data-cfg="'+id+'|disc" aria-label="'+r[0]+' '+r[1]+' 할인"></td><td><select class="f" data-cfg="'+id+'|payer" aria-label="'+r[0]+' '+r[1]+' 할인 부담">'+['숙소','플랫폼'].map(x=>'<option'+(c.payer===x?' selected':'')+'>'+x+'</option>').join('')+'</select></td><td>'+c.inc+'</td><td>'+c.exc+'</td><td>'+lb(c.ok?'확인됨':'확인 필요')+'</td><td class="r">'+(c.ok?'':btn({cls:'sm',icon:'check',label:'확인 완료',attrs:'data-cfgok="'+id+'"'}))+'</td></tr>';}).join('')+
    '</tbody></table></div></div>'+
    '<p class="note">'+ic('alert')+'예상 실수령액 = 등록 가격 × (1 − 숙소 부담 할인) × (1 − 수수료). 플랫폼 계약 조건을 대표님이 확인하기 전에는 확인 필요로 두고 전송에서 뺍니다. 표의 수수료와 할인은 예시 값입니다.</p>';
}

/* ===== 9. 요금 일괄 변경 ===== */
const DAYS=Array.from({length:14},(_,i)=>{const d=new Date(2026,10,9+i);return {i,label:(d.getMonth()+1)+'/'+d.getDate(),dow:'일월화수목금토'[d.getDay()],we:d.getDay()===0||d.getDay()===6||d.getDay()===5};});
const roomList=()=>PROPS.flatMap(p=>p.rooms.map(r=>({p:p.k,r})));
const curPrice=(room,ch,we)=>{const b={'독채':180000,'한옥 1호실':150000,'한옥 2호실':150000}[room]||95000;return (we?Math.round(b*1.2/1000)*1000:b)+CH.indexOf(ch)*2000;};
function ratePreview(){
  const R=UI.rate,rows=[];
  roomList().filter(x=>R.rooms[x.r]).forEach(x=>PLANS.filter(pl=>R.plans[pl]).forEach(pl=>CH.filter(c=>R.chs[c]).forEach(c=>{const f=CFG[x.p][c][pl],v=calc(f,R.target);rows.push({p:x.p,room:x.r,plan:pl,ch:c,fee:f.fee,disc:f.disc,payer:f.payer,ok:f.ok,reg:v.reg,net:v.net});})));
  return rows;
}
function rateErrs(){const R=UI.rate,e=[];if(!Object.values(R.rooms).some(Boolean))e.push('객실을 하나 이상 골라 주세요.');if(!Object.values(R.dates).some(Boolean))e.push('날짜를 하나 이상 골라 주세요.');if(!Object.values(R.chs).some(Boolean))e.push('플랫폼을 하나 이상 골라 주세요.');if(!Object.values(R.plans).some(Boolean))e.push('요금제를 하나 이상 골라 주세요.');if(!(R.target>=10000&&R.target<=5000000))e.push('목표 실수령액은 10,000원에서 5,000,000원 사이로 입력해 주세요.');return e;}
const chip=(on,attr,label)=>'<button type="button" class="chipb" aria-pressed="'+!!on+'" '+attr+'>'+label+'</button>';
const STEPN=['내부 저장','Channex 접수','재조회','플랫폼 반영 확인'];
function stepCell(s){if(s==='ok')return '<span class="stp ok">'+ic('check')+'완료</span>';if(s==='busy')return '<span class="stp busy"><span class="spin" style="width:12px;height:12px"></span>진행 중</span>';if(s==='fail')return '<span class="stp bad">'+ic('x')+'실패</span>';if(s==='skip')return '<span class="stp skip">중단</span>';return '<span class="stp wait">대기</span>';}
function vRates(){
  const R=UI.rate,dn=Object.values(R.dates).filter(Boolean).length;
  let h=head('요금 일괄 변경','객실·날짜·플랫폼·요금제를 고르고 목표 실수령액을 넣으면 플랫폼별 등록 가격을 계산합니다. 전송 전에 미리 봅니다.',btn({icon:'list',label:'계산 조건',attrs:'data-go="ratecfg"'}))+
   '<div class="panel"><div class="hd"><h3>1. 변경 대상</h3><span class="small">객실 '+Object.values(R.rooms).filter(Boolean).length+' · 날짜 '+dn+' · 플랫폼 '+Object.values(R.chs).filter(Boolean).length+' · 요금제 '+Object.values(R.plans).filter(Boolean).length+'</span></div><div class="bd rf">'+
   PROPS.map(p=>'<div class="frow2"><span>'+esc(p.name)+'</span><div class="chips">'+p.rooms.map(r=>chip(R.rooms[r],'data-rroom="'+esc(r)+'"',esc(r))).join('')+'</div></div>').join('')+
   '<div class="frow2"><span>날짜</span><div><div class="chips qk">'+[['weekday','평일'],['weekend','주말(금·토·일)'],['all','전체'],['none','지우기']].map(q=>'<button type="button" class="chipb q" data-rq="'+q[0]+'">'+q[1]+'</button>').join('')+'</div><div class="tw dgw"><div class="dg">'+DAYS.map(d=>'<button type="button" class="dc'+(d.we?' we':'')+'" aria-pressed="'+!!R.dates[d.i]+'" data-rdate="'+d.i+'" aria-label="'+d.label+' '+d.dow+'요일"><b class="num">'+d.label+'</b><span>'+d.dow+'</span></button>').join('')+'</div></div></div></div>'+
   '<div class="frow2"><span>플랫폼</span><div class="chips">'+CH.map(c=>chip(R.chs[c],'data-rch="'+c+'"',c)).join('')+'</div></div>'+
   '<div class="frow2"><span>요금제</span><div class="chips">'+PLANS.map(c=>chip(R.plans[c],'data-rplan="'+c+'"',c)).join('')+'</div></div>'+
   '<div class="frow2"><label for="rT">목표 실수령액</label><div class="tgt"><input type="number" id="rT" class="numi lg" min="10000" step="1000" value="'+R.target+'" data-rtarget="1"><span>원 / 1박</span>'+btn({cls:'pri',icon:'compare',label:'미리보기',attrs:'data-act="ratePreview"'})+'</div></div>'+
   (R.errs&&R.errs.length?'<div class="ferr" role="alert">'+ic('alert')+'<div>'+R.errs.map(esc).join('<br>')+'</div></div>':'')+'</div></div>';
  if(!R.preview){h+='<div class="panel"><div class="bd">'+empty('tag','미리보기를 아직 만들지 않았습니다','대상을 고른 뒤 미리보기를 누르면 플랫폼별 등록 가격과 예상 실수령액이 나옵니다. 조건을 바꾸면 다시 계산합니다.',btn({cls:'pri',icon:'compare',label:'미리보기',attrs:'data-act="ratePreview"'}))+'</div></div>';}
  else{
    const P=R.preview,un=P.filter(x=>!x.ok),send=P.filter(x=>x.ok),first=P[0],gridCh=CH.filter(c=>R.chs[c]);
    h+='<div class="panel"><div class="hd"><h3>2. 전송 전 미리보기</h3><span class="small">목표 실수령 '+won(R.target)+' · '+P.length+'행'+(un.length?' · 확인 필요 '+un.length+'행':'')+'</span></div>'+
     '<div class="tw"><table class="t"><thead><tr><th>객실</th><th>요금제</th><th>플랫폼</th><th class="r">수수료</th><th>할인(부담)</th><th class="r">등록 가격</th><th class="r">예상 실수령액</th><th>조건</th></tr></thead><tbody>'+
     P.map(x=>'<tr class="'+(x.ok?'':'unk')+'"><td>'+esc(x.room)+'</td><td>'+x.plan+'</td><td class="chn">'+x.ch+'</td><td class="r num">'+x.fee+'%</td><td class="num">'+x.disc+'% ('+x.payer+')</td><td class="r num"><b>'+won(x.reg)+'</b></td><td class="r num">'+won(x.net)+'</td><td>'+lb(x.ok?'확인됨':'확인 필요')+'</td></tr>').join('')+'</tbody></table></div></div>'+
     (un.length?'<div class="alarm warnl">'+ic('alert')+'<span>조건을 확인하지 못한 '+un.length+'행은 이번 전송에서 뺍니다.</span><span class="sp"></span>'+btn({cls:'sm',label:'조건 확인하러 가기',attrs:'data-cfgfrom="'+un[0].p+'"'})+'</div>':'')+
     '<div class="panel"><div class="hd"><h3>날짜별 요금표</h3><span class="small">'+esc(first.room)+' · '+first.plan+' · 선택한 날짜만 변경</span></div><div class="tw"><table class="t rg"><thead><tr><th class="st">플랫폼</th>'+DAYS.map(d=>'<th class="'+(d.we?'we':'')+'">'+d.label+'<br>'+d.dow+'</th>').join('')+'</tr></thead><tbody>'+
     gridCh.map(c=>{const row=P.find(x=>x.room===first.room&&x.plan===first.plan&&x.ch===c);return '<tr><td class="chn st">'+c+'</td>'+DAYS.map(d=>{const cur=curPrice(first.room,c,d.we);return R.dates[d.i]&&row?'<td class="chg num"><s>'+(cur/1000).toFixed(0)+'</s><b>'+(row.reg/1000).toFixed(1)+'</b></td>':'<td class="num same">'+(cur/1000).toFixed(0)+'</td>';}).join('')+'</tr>';}).join('')+'</tbody></table></div><p class="note cellnote">단위: 천 원. 위 줄은 현재 가격, 아래 굵은 값은 바뀔 가격입니다.</p></div>'+
     '<div class="sendrow">'+btn({cls:'pri',icon:'send',label:'전송 ('+send.length+'행 × '+dn+'일)',attrs:'data-act="rateSend"'+(send.length?'':' disabled')})+'<span class="small">같은 내용은 한 번만 실행됩니다.</span></div>'+
     (R.dup?'<div class="alarm" role="alert">'+ic('lock')+'<span><b>중복 실행을 막았습니다.</b> 같은 내용의 전송('+R.dup+')이 이미 있어 새로 보내지 않았습니다. 다시 보내려면 대상이나 금액을 바꿔 미리보기를 새로 만들어 주세요.</span></div>':'');
  }
  if(R.run){const r=R.run,fails=r.rows.filter(x=>x.st.includes('fail')),running=r.state==='running';
    h+='<div class="panel" id="runPanel"><div class="hd"><h3>3. 단계별 결과 <span class="mono">'+r.id+'</span></h3><span class="small">'+(running?'전송 중':fails.length?'실패 '+fails.length+'행':'모든 행 반영 확인')+'</span></div>'+
      (!running&&fails.length?'<div class="alarm inp">'+ic('alert')+'<span><b>'+fails.length+'행이 재조회에서 멈췄습니다.</b> '+esc(fails[0].why)+' 나머지 '+(r.rows.length-fails.length)+'행은 반영되었으니 실패 항목만 다시 보내면 됩니다.</span><span class="sp"></span>'+btn({cls:'sm pri',icon:'retry',label:'실패 항목만 재전송',attrs:'data-act="rateRetry"'})+'</div>':'')+
      (!running&&!fails.length?'<div class="alarm ok inp">'+ic('check')+'<span><b style="color:var(--ok)">'+r.rows.length+'행 모두 플랫폼 반영까지 확인했습니다.</b></span></div>':'')+
      '<div class="tw"><table class="t steps"><thead><tr><th>객실</th><th>요금제</th><th>플랫폼</th><th class="r">등록 가격</th>'+STEPN.map(s=>'<th>'+s+'</th>').join('')+'<th class="r">시도</th></tr></thead><tbody>'+
      r.rows.map(x=>'<tr class="'+(x.st.includes('fail')?'fl':'')+'"><td>'+esc(x.room)+'</td><td>'+x.plan+'</td><td class="chn">'+x.ch+'</td><td class="r num">'+won(x.reg)+'</td>'+x.st.map(stepCell).map(c=>'<td>'+c+'</td>').join('')+'<td class="r num">'+x.tries+'회</td></tr>').join('')+'</tbody></table></div></div>';
  }
  if(S.rateLog.length)h+='<div class="panel"><div class="hd"><h3>변경 이력</h3></div><div class="tw"><table class="t"><thead><tr><th>전송</th><th>시각</th><th>대상</th><th class="r">목표 실수령</th><th>결과</th></tr></thead><tbody>'+S.rateLog.map(l=>'<tr><td class="mono">'+l.id+'</td><td class="num">'+l.at+'</td><td>'+esc(l.t)+'</td><td class="r num">'+won(l.target)+'</td><td>'+esc(l.res)+'</td></tr>').join('')+'</tbody></table></div></div>';
  return h;
}
function makePreview(){const R=UI.rate;R.errs=rateErrs();R.dup=null;if(R.errs.length){R.preview=null;return false;}R.preview=ratePreview();return true;}
function rateSend(){
  const R=UI.rate;if(R.run&&R.run.state==='running'){R.dup=R.run.id;toast('전송 중인 작업과 같은 내용이라 다시 실행하지 않았습니다.','bad');render();return;}
  const send=R.preview.filter(x=>x.ok),dates=Object.keys(R.dates).filter(k=>R.dates[k]).join(','),key=send.map(x=>x.room+x.plan+x.ch+x.reg).join('|')+'@'+dates;
  if(R.keys[key]){R.dup=R.keys[key];toast('같은 내용의 전송이 이미 있어 중복 실행을 막았습니다.','bad');render();return;}
  const id='RT-'+(S.rateSeq++);R.keys[key]=id;R.dup=null;
  const failRow=send.find(x=>x.ch==='플랫폼 C')||send[send.length-1];
  R.run={id,state:'running',target:R.target,rows:send.map(x=>Object.assign({},x,{st:['','','',''],tries:1,failAt:x===failRow?2:-1,why:x===failRow?x.ch+' 재조회 가격이 아직 이전 값입니다.':''}))};
  render();runSteps(R.run,R.run.rows,0);
}
function runSteps(run,rows,i){
  if(i>3){run.state='done';const f=run.rows.filter(x=>x.st.includes('fail')).length;logRun(run,f);toast(f?'전송을 마쳤습니다. 실패 '+f+'행은 재전송할 수 있습니다.':run.rows.length+'행 반영을 확인했습니다.',f?'bad':'');if(UI.view==='rates')render();return;}
  rows.forEach(x=>{if(x.st.slice(0,i).includes('fail')||x.st.slice(0,i).includes('skip'))x.st[i]='skip';else x.st[i]='busy';});if(UI.view==='rates')render();
  setTimeout(()=>{rows.forEach(x=>{if(x.st[i]==='busy')x.st[i]=x.failAt===i?'fail':'ok';});if(UI.view==='rates')render();runSteps(run,rows,i+1);},420);
}
function logRun(run,f){const t=run.rows.length+'행 · '+[...new Set(run.rows.map(x=>x.room))].join(', ');const res=f?'실패 '+f+'행':'전체 반영 확인';const ex=S.rateLog.find(l=>l.id===run.id);if(ex){ex.res=res;ex.at='11-02 '+hm(NOW);}else S.rateLog.unshift({id:run.id,at:'11-02 '+hm(NOW),t,target:run.target,res});}

/* ===== 10. AI 메시지 검토함 ===== */
const MT=(id,type,guest,rsv,prop,room,ch,at,q,draft,fields,o)=>Object.assign({id,type,guest,rsv,prop,room,ch,at,q,draft,fields,state:'wait',checked:true,chkAt:at+2,edited:false},o||{});
const EXCL=['환불','금액','클레임'];
S.msgs=[
  MT('M-302','편의시설','이○○','RSV-2611-0204','B','한옥 1호실','플랫폼 B',14*60+6,'침구는 몇 명 기준으로 준비되어 있나요?','안녕하세요. 11월 14일 숙박은 3명 기준으로 침구를 준비해 드립니다. 추가 침구가 필요하시면 말씀해 주세요.',[{k:'숙박일',re:/\d+월 \d+일/,src:'예약',val:'11월 14일'},{k:'인원',re:/\d+명/,src:'예약',val:'2명'}]),
  MT('M-301','체크인 안내','김○○','RSV-2611-0201','A','독채','플랫폼 A',14*60+11,'토요일 체크인은 몇 시부터 되나요? 두 명 갑니다.','안녕하세요. 11월 7일 체크인은 오후 3시부터 가능합니다. 예약 인원 2명 기준으로 준비해 두겠습니다.',[{k:'숙박일',re:/\d+월 \d+일/,src:'예약',val:'11월 7일'},{k:'체크인 시간',re:/오후 \d+시/,src:'숙소 정보',val:'오후 3시'},{k:'인원',re:/\d+명/,src:'예약',val:'2명'}]),
  MT('M-303','주차','박○○','RSV-2611-0207','C','숲 102','플랫폼 C',13*60+48,'차를 가져가도 되나요?','안녕하세요. 주차장은 객실당 1대까지 무료로 이용하실 수 있습니다.',[{k:'주차 대수',re:/객실당 \d+대/,src:'숙소 정보',val:'객실당 1대'}]),
  MT('M-304','편의시설','최○○','RSV-2611-0209','C','숲 101','플랫폼 D',13*60+31,'아기 침대를 빌릴 수 있나요?','',[],{info:'숙소 정보에 아기 침대 항목이 없어 초안을 만들지 않았습니다.'}),
  MT('M-305','환불','정○○','RSV-2611-0196','A','독채','플랫폼 B',12*60+52,'지금 취소하면 얼마나 돌려받나요?','안녕하세요. 결제 금액은 180,000원이며, 환불 금액은 취소 규정을 확인한 뒤 운영자가 안내해 드리겠습니다.',[{k:'결제 금액',re:/[\d,]+원/,src:'예약',val:'180,000원'}]),
  MT('M-306','금액','강○○','RSV-2611-0198','B','한옥 2호실','플랫폼 A',11*60+40,'한 명 추가하면 요금이 얼마인가요?','안녕하세요. 인원 추가 요금은 1인 1박 20,000원입니다.',[{k:'추가 요금',re:/[\d,]+원/,src:'숙소 정보',val:'20,000원'}]),
  MT('M-307','클레임','조○○','RSV-2611-0189','C','숲 103','플랫폼 C',10*60+15,'어젯밤 난방이 약해서 많이 추웠습니다.','불편을 드려 죄송합니다. 설비 상태를 확인한 뒤 운영자가 다시 안내해 드리겠습니다.',[]),
  MT('M-300','체크인 안내','한○○','RSV-2611-0192','A','독채','플랫폼 D',9*60+5,'출입 비밀번호는 언제 받나요?','안녕하세요. 체크인 당일 오후 3시 전에 안내해 드립니다.',[{k:'체크인 시간',re:/오후 \d+시/,src:'숙소 정보',val:'오후 3시'}],{state:'sent',sentAt:9*60+12})
];
const RSVS={'RSV-2611-0204':['11월 14일~15일, 1박','2명','210,000원'],'RSV-2611-0201':['11월 7일~8일, 1박','2명','216,000원'],'RSV-2611-0207':['11월 8일~9일, 1박','3명','114,000원'],'RSV-2611-0209':['11월 21일~22일, 1박','3명','114,000원'],'RSV-2611-0196':['11월 12일~13일, 1박','2명','180,000원'],'RSV-2611-0198':['11월 15일~16일, 1박','3명','150,000원'],'RSV-2611-0189':['11월 1일~2일, 1박','2명','95,000원'],'RSV-2611-0192':['11월 3일~4일, 1박','2명','180,000원']};
function compare(m){return m.fields.map(f=>{const hit=m.draft.match(f.re);const v=hit?hit[0]:null;return {k:f.k,src:f.src,val:f.val,draft:v,res:v===null?'언급 없음':v===f.val?'일치':'불일치'};});}
const mism=(m)=>compare(m).filter(c=>c.res==='불일치');
function msgState(m){if(m.state==='sent')return '발송 완료';if(m.info&&!m.edited)return '정보 부족';if(!m.checked)return '대조 다시 필요';if(mism(m).length)return '예약 불일치';if(EXCL.includes(m.type))return '운영자 발송';return '발송 가능';}
function vInbox(){
  const fl=UI.msgF,L=S.msgs.filter(m=>(!fl.type||m.type===fl.type)&&(fl.st===''||(fl.st==='wait'?m.state==='wait':m.state==='sent')));
  if(!L.some(m=>m.id===UI.msg)&&L[0])UI.msg=L[0].id;
  const m=S.msgs.find(x=>x.id===UI.msg);const types=['체크인 안내','주차','편의시설','환불','금액','클레임'];
  const list='<div class="panel ml"><div class="filters"><label for="mt" class="sr">유형</label><select id="mt" class="f" data-msgf="type" aria-label="유형"><option value="">유형 전체</option>'+types.map(t=>'<option'+(fl.type===t?' selected':'')+'>'+t+'</option>').join('')+'</select><label for="ms" class="sr">상태</label><select id="ms" class="f" data-msgf="st" aria-label="상태"><option value="">상태 전체</option><option value="wait"'+(fl.st==='wait'?' selected':'')+'>검토 대기</option><option value="sent"'+(fl.st==='sent'?' selected':'')+'>발송 완료</option></select></div>'+
    (L.length?'<ul class="mlist">'+L.map(x=>'<li><button type="button" data-msg="'+x.id+'" aria-current="'+(x.id===UI.msg)+'"><span class="r1"><span class="lb type">'+x.type+'</span><span class="small num">'+hm(x.at)+'</span></span><b>'+x.guest+' · '+esc(propShort(x.prop))+'</b><span class="q">'+esc(x.q)+'</span>'+lb(msgState(x))+'</button></li>').join('')+'</ul>':'<div class="bd">'+empty('inbox','조건에 맞는 문의가 없습니다','유형이나 상태 조건을 바꿔 보세요.',btn({label:'조건 지우기',attrs:'data-act="msgClear"'}))+'</div>')+'</div>';
  let det='';
  if(m&&L.length){const R=RSVS[m.rsv],cmp=compare(m),bad=mism(m),st=msgState(m),ex=EXCL.includes(m.type),can=m.state==='wait'&&m.checked&&!bad.length&&m.draft.trim().length>=5&&(!m.info||m.edited);
    det='<div class="panel md" id="msgDetail"><div class="hd"><h3>'+m.guest+'님 문의 <span class="lb type">'+m.type+'</span></h3><span class="small">'+m.ch+' · '+hm(m.at)+'</span></div><div class="bd">'+
     '<div class="qbox">'+esc(m.q)+'</div>'+
     '<dl class="rs"><div><dt>예약</dt><dd class="mono">'+m.rsv+'</dd></div><div><dt>숙소·객실</dt><dd>'+esc(propShort(m.prop))+' · '+esc(m.room)+'</dd></div><div><dt>숙박</dt><dd>'+R[0]+'</dd></div><div><dt>인원</dt><dd>'+R[1]+'</dd></div><div><dt>결제 금액</dt><dd class="num">'+R[2]+'</dd></div></dl>'+
     (m.info&&!m.edited?'<div class="alarm warnl inp">'+ic('alert')+'<span><b>정보 부족.</b> '+esc(m.info)+' 운영자가 직접 답변해 주세요.</span></div>':'')+
     (ex&&m.state==='wait'?'<div class="alarm mutel inp">'+ic('lock')+'<span><b>자동발송 제외 유형입니다.</b> 초안은 참고용이며 운영자가 확인하고 보냅니다.</span></div>':'')+
     '<label class="lbl" for="dr">'+(m.info?'운영자 답변':'AI 답변 초안')+(m.edited?' <span class="small">운영자 수정함</span>':'')+'</label><textarea id="dr" rows="4" data-draft="'+m.id+'"'+(m.state==='sent'?' readonly':'')+' placeholder="답변을 입력해 주세요">'+esc(m.draft)+'</textarea>'+
     (cmp.length?'<div class="lbl">근거 대조</div><div class="tw"><table class="t cmp"><thead><tr><th>항목</th><th>초안 속 값</th><th>원본 값</th><th>일치 여부</th><th>원본</th><th>확인 시각</th></tr></thead><tbody>'+cmp.map(c=>'<tr class="'+(c.res==='불일치'?'fl':'')+'"><td>'+c.k+'</td><td class="num"><b>'+esc(c.draft==null?'-':c.draft)+'</b></td><td class="num">'+esc(c.val)+'</td><td>'+(m.checked?lb(c.res):lb('대조 다시 필요'))+'</td><td>'+c.src+'</td><td class="num">'+hm(m.chkAt)+'</td></tr>').join('')+'</tbody></table></div>':'')+
     (m.state==='sent'?'<div class="alarm ok inp">'+ic('check')+'<span><b style="color:var(--ok)">'+hm(m.sentAt)+' 발송 완료.</b> 같은 문의에는 다시 발송되지 않습니다.</span></div>':
      (m.checked&&bad.length?'<div class="alarm inp" role="alert">'+ic('alert')+'<span><b>운영자 확인 필요.</b> '+bad.map(b=>b.k+': 초안 '+esc(b.draft)+', '+b.src+' '+esc(b.val)).join(' / ')+'. 일치할 때까지 발송할 수 없습니다.</span></div>':'')+
      (!m.checked?'<div class="alarm warnl inp">'+ic('alert')+'<span>초안을 고쳤습니다. 근거 대조를 다시 실행한 뒤 발송할 수 있습니다.</span></div>':'')+
      '<div class="sendrow">'+(cmp.length?btn({icon:'compare',label:'근거 대조 다시 실행',attrs:'data-act="msgCheck"'}):'')+btn({cls:'pri',icon:'send',label:m.info?'운영자 답변 발송':'발송',attrs:'data-act="msgSend"'+(can?'':' disabled')})+'</div>')+
    '</div></div>';
  }
  const blocked=S.msgs.filter(x=>x.state==='wait'&&x.checked&&mism(x).length).length;
  return head('AI 메시지 검토함','초안에 들어간 날짜·인원·금액·시간을 예약과 숙소 정보에 대조합니다. 하나라도 다르면 발송이 막힙니다.')+
    '<div class="sumline"><div>검토 대기<b>'+S.msgs.filter(x=>x.state==='wait').length+'</b></div><div>대조 차단<b class="'+(blocked?'bad':'')+'">'+blocked+'</b></div><div>오늘 발송<b>'+S.msgs.filter(x=>x.state==='sent').length+'</b></div></div>'+
    '<div class="aigrid">'+list+det+'</div>';
}
const propShort=(k)=>propName(k);

/* ===== 11. 자동발송 설정 ===== */
S.auto={stop:false,types:[{t:'체크인 안내',d:28,n:64,e:0,on:false},{t:'주차',d:19,n:31,e:0,on:false},{t:'편의시설',d:12,n:22,e:0,on:false}],log:[{at:'10-05 09:00',t:'AI 초안 운영과 유형별 무수정 기록 시작'}]};
function vAuto(){
  const A=S.auto;
  return head('자동발송 설정','문의 유형별로 운영자가 고치지 않고 보낸 날을 셉니다. 4주(28일) 연속 무수정인 유형만 자동발송을 켤 수 있습니다.')+
    (A.stop?'<div class="alarm" role="alert">'+ic('lock')+'<span><b>전체 중지 중입니다.</b> 모든 문의가 검토함으로 들어가고 자동으로 나가는 메시지가 없습니다.</span></div>':'')+
    '<div class="panel"><div class="hd"><h3>전체 중지</h3><label class="sw"><input type="checkbox" data-autostop="1"'+(A.stop?' checked':'')+' aria-label="자동발송 전체 중지"><span class="tr"></span>'+(A.stop?'중지 중':'운영 중')+'</label></div></div>'+
    '<div class="panel"><div class="hd"><h3>유형별 허용 판정</h3><span class="small">기준 28일 연속 무수정</span></div><div class="tw"><table class="t au"><thead><tr><th>문의 유형</th><th>연속 무수정</th><th class="r">최근 28일 초안</th><th class="r">수정</th><th>판정</th><th>자동발송</th></tr></thead><tbody>'+
    A.types.map(x=>{const ok=x.d>=28;return '<tr><td><b>'+x.t+'</b></td><td><div class="dbar"><span class="trk"><i style="width:'+Math.min(100,x.d/28*100)+'%"></i></span><span class="num">'+x.d+'일 / 28일</span></div></td><td class="r num">'+x.n+'건</td><td class="r num">'+x.e+'건</td><td>'+lb(ok?'허용 가능':'관찰 중')+(ok?'':' <span class="small">'+(28-x.d)+'일 남음</span>')+'</td><td><label class="sw'+(ok&&!A.stop?'':' off')+'"><input type="checkbox" data-autotype="'+x.t+'"'+(x.on&&!A.stop?' checked':'')+(ok&&!A.stop?'':' disabled')+' aria-label="'+x.t+' 자동발송"><span class="tr"></span>'+(x.on&&!A.stop?'켜짐':'꺼짐')+'</label></td></tr>';}).join('')+
    EXCL.map(t=>'<tr class="excl"><td><b>'+t+'</b></td><td class="small">기록하지 않음</td><td class="r">-</td><td class="r">-</td><td>'+lb('자동발송 제외')+'</td><td class="small">'+ic('lock')+' 고정</td></tr>').join('')+
    '</tbody></table></div></div>'+
    '<p class="note">'+ic('alert')+'자동발송을 켠 유형도 근거 대조에서 걸리면 보내지 않고 검토함으로 돌립니다. 운영자가 초안을 고치면 그 유형의 연속 일수는 0일부터 다시 셉니다.</p>'+
    '<div class="panel"><div class="hd"><h3>변경 기록</h3></div><div class="tw"><table class="t"><thead><tr><th>일시</th><th>내용</th></tr></thead><tbody>'+A.log.map(l=>'<tr><td class="num">'+l.at+'</td><td class="wrap">'+esc(l.t)+'</td></tr>').join('')+'</tbody></table></div></div>';
}

/* ===== 12. 미처리·통계 ===== */
function vStats(){
  const w=S.msgs.filter(m=>m.state==='wait'),nInfo=w.filter(m=>msgState(m)==='정보 부족'),nBad=w.filter(m=>m.checked&&mism(m).length),nFail=activeFails().filter(f=>f.type==='메시지'),nEx=w.filter(m=>EXCL.includes(m.type));
  const sentToday=S.msgs.filter(m=>m.state==='sent'),editedToday=sentToday.filter(m=>m.edited).length;
  const weeks=[['10-05~10-11',96,0,18,4],['10-12~10-18',103,0,12,3],['10-19~10-25',88,0,9,2],['10-26~11-01',111,0,8,3]];
  const cur=['11-02~ (오늘까지)',S.msgs.length,0,editedToday,w.length];
  return head('미처리·통계','사람이 봐야 하는 문의와 주간 추이입니다. 4주 검증과 완료보고 증빙에 그대로 씁니다.')+
    '<div class="sumline"><div>정보 부족<b class="'+(nInfo.length?'warnc':'')+'">'+nInfo.length+'</b></div><div>예약 불일치<b class="'+(nBad.length?'bad':'')+'">'+nBad.length+'</b></div><div>발송 실패<b class="'+(nFail.length?'bad':'')+'">'+nFail.length+'</b></div><div>제외 유형<b>'+nEx.length+'</b></div></div>'+
    '<div class="panel"><div class="hd"><h3>미처리 목록</h3><span class="small">'+(nInfo.length+nBad.length+nFail.length+nEx.length)+'건</span></div>'+
    (nInfo.length+nBad.length+nFail.length+nEx.length?'<div class="tw"><table class="t"><thead><tr><th>분류</th><th>문의·작업</th><th>유형</th><th>예약</th><th></th></tr></thead><tbody>'+
      nBad.map(m=>row('예약 불일치','bad',m)).join('')+nInfo.map(m=>row('정보 부족','warn',m)).join('')+nEx.map(m=>row('제외 유형','mute',m)).join('')+
      nFail.map(f=>'<tr><td><span class="lb bad">발송 실패</span></td><td class="mono">'+f.id+'</td><td>메시지</td><td class="mono">'+f.rsv+'</td><td class="r">'+btn({cls:'sm',label:'실패 건 보기',attrs:'data-go="fails"'})+'</td></tr>').join('')+'</tbody></table></div>'
      :'<div class="bd">'+empty('check','미처리 문의가 없습니다','새 문의가 들어오면 분류해서 여기에 보여 드립니다.',btn({label:'검토함 보기',attrs:'data-go="inbox"'}))+'</div>')+'</div>'+
    '<div class="panel"><div class="hd"><h3>주간 추이</h3><span class="small">단위: 건</span></div><div class="tw"><table class="t"><thead><tr><th>기간</th><th class="r">문의</th><th class="r">자동답변</th><th class="r">운영자 수정</th><th class="r">미처리</th><th class="r">무수정률</th></tr></thead><tbody>'+
    weeks.concat([cur]).map(r=>'<tr><td class="num">'+r[0]+'</td><td class="r num">'+r[1]+'</td><td class="r num">'+r[2]+'</td><td class="r num">'+r[3]+'</td><td class="r num">'+r[4]+'</td><td class="r num">'+Math.round((r[1]-r[3]-r[4])/r[1]*100)+'%</td></tr>').join('')+'</tbody></table></div></div>'+
    '<p class="note">'+ic('alert')+'4주 검증 기간에는 운영자가 모든 메시지를 확인하므로 자동답변이 0건입니다. 허용 판정을 받은 유형을 켠 뒤부터 집계됩니다.</p>';
  function row(k,c,m){return '<tr><td><span class="lb '+c+'">'+k+'</span></td><td>'+m.guest+' · '+esc(m.q.slice(0,16))+'…</td><td>'+m.type+'</td><td class="mono">'+m.rsv+'</td><td class="r">'+btn({cls:'sm',label:'검토',attrs:'data-msgopen="'+m.id+'"'})+'</td></tr>';}
}

/* ===== 시연 안내 ===== */
const MENU=[['status','연동 현황','pulse','연동 운영'],['fails','실패 건 목록','retry'],['rsv','예약 상세','time'],['events','이벤트 기록','inbox'],['recon','기록 대조','compare'],['flags','반영 스위치','toggle'],['alerts','알림 설정','bell'],['rates','요금 일괄 변경','tag','요금'],['ratecfg','요금 계산 조건','list'],['inbox','AI 메시지 검토함','msg','AI 메시지'],['auto','자동발송 설정','lock'],['astat','미처리·통계','chart']];
const GUIDE=[
  {t:'연동 현황',d:'예약이 먼저입니다. 채널 연결과 실패 건을 봅니다.',run:()=>go('status')},
  {t:'요금 일괄 변경 미리보기',d:'목표 실수령액으로 플랫폼별 등록 가격을 계산합니다. 미확인 조건은 전송에서 빠집니다.',run:()=>{makePreview();go('rates');}},
  {t:'단계별 결과와 실패 재전송',d:'네 단계가 차례로 채워지고, 실패한 행만 다시 보냅니다.',run:()=>{if(!UI.rate.preview)makePreview();go('rates');if(!UI.rate.run)rateSend();setTimeout(()=>{const p=$('runPanel');if(p)p.scrollIntoView({block:'start'});},60);}},
  {t:'AI 검토함 불일치 예시',d:'초안 3명, 예약 2명. 고치고 대조를 다시 돌려야 발송됩니다.',run:()=>{UI.msg='M-302';UI.msgF={type:'',st:''};go('inbox');}},
  {t:'자동발송 설정',d:'28일 무수정 유형만 켤 수 있고, 환불·금액·클레임은 제외입니다.',run:()=>go('auto')}
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
const V={status:vStatus,fails:vFails,rsv:vRsv,events:vEvents,recon:vRecon,flags:vFlags,alerts:vAlerts,rates:vRates,ratecfg:vRateCfg,inbox:vInbox,auto:vAuto,astat:vStats};
function render(){
  const n=activeFails().length,mn=S.msgs.filter(x=>x.state==='wait').length;
  $('side').innerHTML='<a class="brand" href="#/status"><span class="mk" aria-hidden="true"><i></i><i></i><i></i></span><b>채널지기</b></a>'+
    MENU.map(m=>(m[3]?'<div class="grp">'+m[3]+'</div>':'')+'<a href="#/'+m[0]+'"'+(UI.view===m[0]?' aria-current="page"':'')+'>'+ic(m[2])+m[1]+(m[0]==='fails'&&n?'<span class="cnt">'+n+'</span>':'')+(m[0]==='inbox'&&mn?'<span class="cnt">'+mn+'</span>':'')+'</a>').join('')+
    '<div class="env">Channex 경유 4채널<br>숙소 3곳 · 객실 7실</div>';
  const cur=MENU.find(m=>m[0]===UI.view);
  $('top').innerHTML='<span class="crumb" style="color:var(--text);font-weight:700">예약·요금·메시지 운영</span><span class="crumb">숙소 3곳 · 객실 7실 · Channex 경유 4채널</span><span class="sp"></span>'+
    '<div class="envsw" role="group" aria-label="환경"><button type="button" data-env="test" aria-pressed="'+(S.env==='test')+'">시험 환경</button><button type="button" data-env="live" aria-pressed="'+(S.env==='live')+'">운영 환경</button></div><span class="clock num">11-02 '+hm(NOW)+'</span>';
  $('main').innerHTML=V[UI.view]();
  renderGuide();
}

function rateDirty(){UI.rate.preview=null;UI.rate.dup=null;UI.rate.errs=[];render();}
function runResume(run,rows){const go2=(i)=>{if(i>3){run.state='done';logRun(run,run.rows.filter(x=>x.st.includes('fail')).length);toast('실패 항목을 다시 보냈고 반영을 확인했습니다.');if(UI.view==='rates')render();return;}rows.forEach(x=>{x.st[i]='busy';});if(UI.view==='rates')render();setTimeout(()=>{rows.forEach(x=>{x.st[i]='ok';});go2(i+1);},420);};go2(1);}
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
  if(d.rroom){UI.rate.rooms[d.rroom]=!UI.rate.rooms[d.rroom];rateDirty();return;}
  if(d.rdate!=null){UI.rate.dates[d.rdate]=!UI.rate.dates[d.rdate];rateDirty();return;}
  if(d.rch){UI.rate.chs[d.rch]=!UI.rate.chs[d.rch];rateDirty();return;}
  if(d.rplan){UI.rate.plans[d.rplan]=!UI.rate.plans[d.rplan];rateDirty();return;}
  if(d.rq){UI.rate.dates={};DAYS.forEach(x=>{if(d.rq==='all'||(d.rq==='weekend'&&x.we)||(d.rq==='weekday'&&!x.we))UI.rate.dates[x.i]=true;});rateDirty();return;}
  if(d.cfgok){const a=d.cfgok.split('|');withLoading('조건 확인 처리 중...',()=>{CFG[UI.cfgProp][a[0]][a[1]].ok=true;UI.rate.preview=null;toast(a[0]+' '+a[1]+' 조건을 확인했습니다. 미리보기를 다시 만들어 주세요.');render();},380);return;}
  if(d.cfgfrom){UI.cfgProp=d.cfgfrom;go('ratecfg');return;}
  if(d.msg){UI.msg=d.msg;render();if(window.innerWidth<=1100){const p=$('msgDetail');if(p)p.scrollIntoView({block:'start'});}return;}
  if(d.msgopen){UI.msg=d.msgopen;UI.msgF={type:'',st:''};go('inbox');return;}
  switch(d.act){
    case 'ratePreview': withLoading('플랫폼별 가격 계산 중...',()=>{const ok=makePreview();toast(ok?'미리보기를 만들었습니다. 아직 전송되지 않았습니다.':'입력 내용을 확인해 주세요.',ok?'':'bad');render();},420); return;
    case 'rateSend': rateSend(); return;
    case 'rateRetry':{const run=UI.rate.run,fr=run.rows.filter(x=>x.st.includes('fail'));fr.forEach(x=>{x.tries++;x.failAt=-1;x.why='';x.st=[x.st[0],'','',''];});run.state='running';render();runResume(run,fr);return;}
    case 'msgClear': UI.msgF={type:'',st:''};render(); return;
    case 'msgCheck':{const m=S.msgs.find(x=>x.id===UI.msg);withLoading('예약·숙소 정보와 대조하는 중...',()=>{m.checked=true;m.chkAt=NOW;const b=mism(m).length;toast(b?'아직 다른 값이 '+b+'건 있어 발송할 수 없습니다.':'모든 값이 일치합니다. 발송할 수 있습니다.',b?'bad':'');render();},480);return;}
    case 'msgSend':{const m=S.msgs.find(x=>x.id===UI.msg);withLoading('발송 중...',()=>{m.state='sent';m.sentAt=NOW;const tt=S.auto.types.find(x=>x.t===m.type);if(tt&&m.edited&&!m.info){tt.d=0;tt.e++;tt.on=false;S.auto.log.unshift({at:'11-02 '+hm(NOW),t:m.type+' 초안을 운영자가 수정해 연속 일수를 0일로 되돌림 ('+m.id+')'});}toast(m.guest+'님께 답변을 보냈습니다. (시연에서는 실제로 보내지 않음)');render();},480);return;}
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
  if(d.rtarget){UI.rate.target=+i.value;if(UI.rate.preview){UI.rate.preview=null;UI.rate.dup=null;}return;}
  if(d.draft){const m=S.msgs.find(x=>x.id===d.draft);m.draft=i.value;m.edited=true;m.checked=false;return;}
});
document.addEventListener('change',(e)=>{
  const i=e.target,d=i.dataset;
  if(d.rtarget){render();return;}
  if(d.draft){render();return;}
  if(d.cfgprop){UI.cfgProp=i.value;withLoading('조회 중...',render,300);return;}
  if(d.cfg){const a=d.cfg.split('|'),c=CFG[UI.cfgProp][a[0]][a[1]];c[a[2]]=a[2]==='payer'?i.value:Math.max(0,+i.value||0);UI.rate.preview=null;toast('조건을 바꿨습니다. 요금 미리보기는 다시 계산합니다.');render();return;}
  if(d.msgf){UI.msgF[d.msgf]=i.value;withLoading('조회 중...',render,300);return;}
  if(d.autostop){const on=i.checked;withLoading(on?'자동발송을 전체 중지하는 중...':'자동발송 중지를 푸는 중...',()=>{S.auto.stop=on;S.auto.log.unshift({at:'11-02 '+hm(NOW),t:on?'자동발송 전체 중지':'자동발송 전체 중지 해제'});toast(on?'자동발송을 모두 멈췄습니다.':'전체 중지를 풀었습니다.');render();},420);return;}
  if(d.autotype){const x=S.auto.types.find(t=>t.t===d.autotype),on=i.checked;withLoading('자동발송 설정 저장 중...',()=>{x.on=on;S.auto.log.unshift({at:'11-02 '+hm(NOW),t:x.t+' 자동발송 '+(on?'켬 ('+x.d+'일 연속 무수정 확인)':'끔')});toast(x.t+' 자동발송을 '+(on?'켰습니다.':'껐습니다.'));render();},420);return;}
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
