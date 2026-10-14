(function(){
"use strict";
const ic=(n)=>'<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-'+n+'"/></svg>';
const esc=(s)=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=(id)=>document.getElementById(id);
const won=(n)=>Math.round(n).toLocaleString('ko-KR');
const pad=(n)=>String(n).padStart(2,'0');
const nowStr=()=>{const d=new Date();return '2026-10-14 '+pad(d.getHours())+':'+pad(d.getMinutes());};
const nowHM=()=>{const d=new Date();return pad(d.getHours())+':'+pad(d.getMinutes());};

/* ===== 평면도 (84㎡ 3베이, 단위 cm) ===== */
const ROOMS=[
  {k:'r1',name:'침실1',x:20,y:20,w:280,h:420,sel:1},
  {k:'r3',name:'침실3',x:20,y:450,w:280,h:330,sel:1},
  {k:'en',name:'현관',x:310,y:20,w:190,h:150},
  {k:'ba',name:'욕실',x:310,y:180,w:190,h:170,wet:1},
  {k:'kt',name:'주방·식당',x:510,y:20,w:330,h:330,sel:1},
  {k:'r2',name:'침실2',x:850,y:20,w:270,h:330,sel:1},
  {k:'lv',name:'거실',x:310,y:360,w:810,h:420,sel:1}
];
const area=(r)=>(r.w*r.h/10000);
const roomOf=(k)=>ROOMS.find(r=>r.k===k);
function segs(a,b,gaps){const out=[];let s=a;gaps.forEach(g=>{if(g[0]>s)out.push([s,g[0]]);s=g[1];});if(b>s)out.push([s,b]);return out;}
function planSVG(sel){
  const W=[];
  const v=(x,y1,y2,g)=>segs(y1,y2,g||[]).forEach(s=>W.push('<rect class="iw" x="'+x+'" y="'+s[0]+'" width="10" height="'+(s[1]-s[0])+'"/>'));
  const h=(y,x1,x2,g)=>segs(x1,x2,g||[]).forEach(s=>W.push('<rect class="iw" x="'+s[0]+'" y="'+y+'" width="'+(s[1]-s[0])+'" height="10"/>'));
  v(300,20,780,[[360,440],[470,550]]); h(440,20,300);
  v(500,20,350,[[40,150]]); v(840,20,350); h(170,310,500);
  h(350,310,1120,[[330,400],[540,820],[1030,1100]]);
  const door=(hx,hy,cx,cy,lx,ly)=>{const r=Math.hypot(lx-hx,ly-hy);const z=(cx-hx)*(ly-hy)-(cy-hy)*(lx-hx);
    return '<path class="door" d="M'+cx+' '+cy+' A'+r+' '+r+' 0 0 '+(z>0?1:0)+' '+lx+' '+ly+'"/><line class="door" x1="'+hx+'" y1="'+hy+'" x2="'+lx+'" y2="'+ly+'" style="stroke-width:5"/>';};
  const doors=[door(450,20,360,20,450,110),door(400,350,330,350,400,280),door(1100,350,1030,350,1100,270),door(300,440,300,360,220,440),door(300,470,300,550,220,470)].join('');
  const win=(x1,x2,y)=>'<rect class="win" x="'+x1+'" y="'+y+'" width="'+(x2-x1)+'" height="20"/><line class="win" x1="'+x1+'" y1="'+(y+10)+'" x2="'+x2+'" y2="'+(y+10)+'"/>';
  const wins=[win(70,250,0),win(600,760,0),win(900,1070,0),win(60,260,780),win(380,1080,780)].join('');
  const rooms=ROOMS.map(r=>{const on=sel.indexOf(r.k)>=0;const cx=r.x+r.w/2,cy=r.y+r.h/2;
    const lab='<text class="nm" x="'+cx+'" y="'+(cy-6)+'" text-anchor="middle">'+r.name+'</text><text class="ar" x="'+cx+'" y="'+(cy+26)+'" text-anchor="middle">'+area(r).toFixed(1)+'㎡</text>';
    if(!r.sel) return '<g class="'+(r.wet?'wet':'fix')+'"><rect x="'+r.x+'" y="'+r.y+'" width="'+r.w+'" height="'+r.h+'" style="fill:'+(r.wet?'url(#tile)':'#F1F2F4')+'"/>'+lab+'</g>';
    return '<g class="rm'+(on?' on':'')+'" data-room="'+r.k+'" role="button" tabindex="0" aria-pressed="'+on+'" aria-label="'+r.name+' '+area(r).toFixed(1)+'제곱미터">'+
      '<rect x="'+r.x+'" y="'+r.y+'" width="'+r.w+'" height="'+r.h+'"/><rect class="ol" x="'+(r.x+4)+'" y="'+(r.y+4)+'" width="'+(r.w-8)+'" height="'+(r.h-8)+'"/>'+lab+
      (on?'<circle class="ck" cx="'+(r.x+r.w-26)+'" cy="'+(r.y+26)+'" r="14"/><path d="M'+(r.x+r.w-33)+' '+(r.y+26)+'l5 5 9-10" stroke="#fff" stroke-width="4" fill="none"/>':'')+'</g>';}).join('');
  return '<svg viewBox="-40 -110 1250 1080" role="group" aria-label="84제곱미터 평면도, 시공할 방을 고르세요">'+
    '<defs><pattern id="hatch" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="16" height="16" fill="#fff"/><line x1="0" y1="0" x2="0" y2="16" stroke="#C9CED6" stroke-width="2"/></pattern>'+
    '<pattern id="tile" width="30" height="30" patternUnits="userSpaceOnUse"><rect width="30" height="30" fill="#F4F6F8"/><path d="M30 0H0V30" fill="none" stroke="#DCE0E5" stroke-width="2"/></pattern></defs>'+
    '<g><line class="dim" x1="0" y1="-50" x2="1140" y2="-50"/><line class="dim" x1="0" y1="-66" x2="0" y2="-34"/><line class="dim" x1="1140" y1="-66" x2="1140" y2="-34"/><text class="dimt" x="570" y="-62" text-anchor="middle">11,400</text>'+
    '<text class="dimt" transform="translate(1168,400) rotate(-90)" text-anchor="middle">8,000</text><line class="dim" x1="1180" y1="0" x2="1180" y2="800"/><line class="dim" x1="1164" y1="0" x2="1196" y2="0"/><line class="dim" x1="1164" y1="800" x2="1196" y2="800"/></g>'+
    '<rect class="bal" x="0" y="800" width="1140" height="130"/><text class="ar" x="570" y="875" text-anchor="middle">발코니 (확장 안 함)</text>'+
    rooms+W.join('')+
    '<path class="wall" fill-rule="evenodd" d="M0 0H1140V800H0Z M20 20V780H1120V20Z"/>'+
    '<rect x="360" y="0" width="90" height="20" fill="#fff"/>'+wins+doors+
    '<g transform="translate(-10,-80)"><path d="M0 34 L10 0 L20 34 L10 26Z" fill="#3C424B"/><text class="dimt" x="10" y="58" text-anchor="middle" style="font-size:20px">N</text></g>'+
    '</svg>';
}

/* ===== 기준 데이터 (예시) ===== */
const CPLX=[
  {id:'HB3',name:'한빛마을 3단지',addr:'경기 화성시 동탄 (예시)',hh:'1,240세대',yr:2019,type:'84㎡ A형',dongs:['301동','302동','305동'],price:[5.9,6.4]},
  {id:'SSC',name:'새솔 센트럴',addr:'경기 화성시 봉담 (예시)',hh:'860세대',yr:2021,type:'84㎡ B형',dongs:['101동','102동'],price:[4.8,5.3]},
  {id:'MR2',name:'마루뜰 2단지',addr:'경기 오산시 (예시)',hh:'712세대',yr:2016,type:'84㎡ A형',dongs:['201동','203동','204동'],price:[4.1,4.6]},
  {id:'EHP',name:'은하수 파크',addr:'경기 평택시 (예시)',hh:'1,018세대',yr:2023,type:'84㎡ A형',dongs:['1201동','1202동'],price:[4.5,5.0]}
];
const HOS=['302호','704호','1203호','1501호','2102호'];
const VENDORS=['시공 업체 A','시공 업체 B','시공 업체 C'];
const STS=['접수','업체 배정','상담 완료','시공 확정'];
const PKG=[
  {k:1,n:'냉방 기본',d:'선택한 방 시스템에어컨'},
  {k:2,n:'냉방 + 환기',d:'시스템에어컨 + 전열교환 환기',rec:1},
  {k:3,n:'통합 공조',d:'냉방, 환기, 공기질 제어 일체'}
];
function quoteItems(rooms,pk){
  const n=rooms.length, lv=rooms.indexOf('lv')>=0, small=n-(lv?1:0), it=[];
  if(lv) it.push(['시스템에어컨 실내기','4way 카세트, 거실',1,1380000]);
  if(small) it.push(['시스템에어컨 실내기','1way 카세트, '+rooms.filter(k=>k!=='lv').map(k=>roomOf(k).name).join('·'),small,820000]);
  it.push(['실외기','실내기 '+n+'대 연결',1,n<=3?2350000:3050000]);
  it.push(['냉매 배관·전기 공사','실내기당',n,260000]);
  if(pk>=2){it.push(['전열교환 환기장치','천장 매립형',1,1620000]);it.push(['환기 덕트·급배기구','덕트 및 디퓨저',1,640000]);}
  if(pk>=3){it.push(['공기질 센서·통합 컨트롤러','실내 미세먼지·CO2',1,310000]);it.push(['드레인 펌프·보온 보강','실내기당',n,45000]);}
  it.push(['설치비','기본 + 실내기당',1,420000+110000*n]);
  return it;
}
const qTotal=(it)=>it.reduce((a,x)=>a+x[2]*x[3],0);

/* 상담 접수 시드 */
const P=(id,at,name,ph4,c,dong,ho,rooms,pk,st,vendor,extra)=>Object.assign({id,at,name,ph4,cx:c,dong,ho,rooms,pk,items:quoteItems(rooms,pk),st,vendor:vendor||'',memo:'',photos:2,sub:null,chat:[],hist:[{at,t:'상담 신청 접수 (고객 웹)'}],src:'AI 견적'},extra||{});
const LEADS=[
  P('C-1014-03','2026-10-14 10:42','김○○','4821','HB3','302동','1501호',['lv','r1','r2'],2,'접수','',{chat:[['me','거실 천장이 낮은 편인데 4way 설치 가능한가요?'],['ai','천장 높이 2.3m 기준으로 대부분 설치 가능합니다. 현장 실측에서 최종 확인합니다.']]}),
  P('C-1014-02','2026-10-14 09:15','박○○','0937','SSC','101동','704호',['lv','kt'],1,'접수'),
  P('C-1013-05','2026-10-13 17:30','최○○','5512','HB3','305동','2102호',['lv','r1','r2','r3'],3,'업체 배정','시공 업체 A',{sub:{score:54,range:'5.9억 ~ 6.4억'}}),
  P('C-1013-02','2026-10-13 11:04','정○○','2290','EHP','1201동','302호',['lv','r1'],2,'업체 배정','시공 업체 C'),
  P('C-1012-01','2026-10-12 15:48','한○○','7713','MR2','203동','1203호',['lv','r1','r2','r3','kt'],3,'상담 완료','시공 업체 B'),
  P('C-1011-04','2026-10-11 14:20','윤○○','3306','HB3','301동','704호',['lv','r2'],2,'시공 확정','시공 업체 A'),
  P('C-1009-02','2026-10-09 10:11','장○○','6624','SSC','102동','1501호',['lv','r1','r2'],2,'상담 완료','시공 업체 C'),
  P('C-1007-03','2026-10-07 16:55','임○○','1459','EHP','1202동','2102호',['lv'],1,'시공 확정','시공 업체 B'),
  P('C-1006-01','2026-10-06 09:37','오○○','8040','MR2','201동','302호',['lv','r1','r3'],2,'상담 완료','시공 업체 A'),
  P('C-1002-02','2026-10-02 13:26','서○○','2751','HB3','302동','1203호',['lv','r1','r2','r3'],3,'시공 확정','시공 업체 C'),
  P('C-1001-01','2026-10-01 11:02','강○○','9188','SSC','101동','2102호',['lv','kt','r1'],1,'상담 완료','시공 업체 B')
];
LEADS.forEach(l=>{if(l.st!=='접수'){l.hist.push({at:l.at.slice(0,10)+' 17:10',t:'담당 업체 배정: '+l.vendor+' (운영자)'});}
  if(l.st==='상담 완료'||l.st==='시공 확정') l.hist.push({at:l.at.slice(0,10)+' 18:30',t:'상태 변경: 상담 완료'});
  if(l.st==='시공 확정') l.hist.push({at:l.at.slice(0,10)+' 19:05',t:'상태 변경: 시공 확정'});});
/* AI 호출 기록 시드 */
const MODS={q:'견적',s:'청약',c:'상담'};
const LOGS=[];
(function(){const seed=[['q',1.8,'성공'],['c',0.9,'성공'],['s',1.3,'성공'],['q',2.1,'성공'],['q',20.0,'시간 초과'],['q',1.9,'성공',1],['c',1.1,'성공'],['s',1.2,'성공'],['c',0.8,'성공'],['q',1.7,'성공'],['s',3.4,'오류'],['s',1.4,'성공',1],['c',1.0,'성공'],['q',2.3,'성공'],['c',0.7,'성공'],['q',1.6,'성공'],['s',1.1,'성공'],['c',1.2,'성공'],['q',2.0,'성공'],['c',0.9,'성공']];
  const d0=new Date();let h=d0.getHours(),m=d0.getMinutes()-3;if(h<9){h=17;m=50;}seed.forEach((s,i)=>{m-=7+(i%3)*4;while(m<0){m+=60;h--;}LOGS.push({at:'2026-10-14 '+pad(h)+':'+pad(m),mod:s[0],sec:s[1],res:s[2],retry:!!s[3],sum:s[0]==='q'?['한빛마을 3단지','새솔 센트럴','마루뜰 2단지'][i%3]+' · 방 '+(2+i%3)+'개':s[0]==='s'?'무주택 '+(3+i%5)+'년 · 부양 '+(i%3+1)+'명':'질문 '+(1+i%4)+'턴',lead:''});});
  LOGS[4].lead='C-1014-03';LOGS[5].lead='C-1014-03';})();

/* 기간별 기준치 (예시) */
const BASE={w:{try:64,view:41},m:{try:212,view:138}};

/* ===== state ===== */
const S={leads:LEADS,logs:LOGS,my:{quotes:[],leads:[]},stat:{try:0,view:0}};
const UI={view:'quote',id:null,
  q:{step:1,cx:null,dong:'',ho:'',rooms:[],state:'idle',pk:2,kw:''},slow:false,
  sub:{h:'',d:'',a:'',state:'idle',res:null},
  chat:{msgs:[{who:'ai',t:'안녕하세요. 늘숨 공조 AI 상담입니다. 냉방, 환기, 설치 일정 등 궁금한 점을 물어보세요.',at:''}],typing:false},
  ap:{name:'',phone:'',time:'평일 오후',photos:0,agree:false,done:null},
  m:{per:'w',flt:{per:'m',st:'',kw:''},alog:{mod:'',res:''},fresh:null,reveal:{}},
  guideOpen:null,guideStep:null};
function go(h){if(location.hash==='#'+h) route(); else location.hash=h;}
function route(){
  const p=location.hash.replace(/^#\/?/,'').split('/');
  UI.role=p[0]==='m'?'m':'c';
  const cv=['quote','sub','chat','apply','my'], mv=['home','list','detail','ailog'];
  UI.view=(UI.role==='c'?cv:mv).indexOf(p[1])>=0?p[1]:(UI.role==='c'?'quote':'home');
  UI.id=p[2]||null;
  if(Date.now()-(toast.at||0)>300) $('toastHost').innerHTML='';
  render(); window.scrollTo(0,0);
}
function toast(msg,kind){toast.at=Date.now();const h=$('toastHost');h.innerHTML='<div class="toast'+(kind==='bad'?' bad':'')+'" role="status">'+ic(kind==='bad'?'alert':'check')+'<span>'+esc(msg)+'</span></div>';clearTimeout(toast.t);toast.t=setTimeout(()=>{h.innerHTML='';},3400);}
let busy=false;
function withLoading(msg,fn,ms){if(busy)return;busy=true;$('overlayHost').innerHTML='<div class="overlay" role="status" aria-live="assertive"><div class="ob"><span class="spin" aria-hidden="true"></span><span>'+esc(msg)+'</span></div></div>';setTimeout(()=>{$('overlayHost').innerHTML='';busy=false;fn();},ms||450);}
const btn=(o)=>'<button type="button" class="btn '+(o.cls||'')+'" '+(o.attrs||'')+'>'+(o.icon?ic(o.icon):'')+(o.cls&&o.cls.indexOf('icon-m')>=0?'<span class="lbl">'+esc(o.label)+'</span>':esc(o.label))+'</button>';
const stLb=(s)=>'<span class="lb s'+STS.indexOf(s)+'">'+esc(s)+'</span>';
const resLb=(r)=>'<span class="lb '+(r==='성공'?'s3':'bad')+'">'+esc(r)+'</span>';
const empty=(i,t,d,b)=>'<div class="empty">'+ic(i)+'<strong>'+esc(t)+'</strong><p>'+esc(d)+'</p>'+(b||'')+'</div>';
const cxOf=(id)=>CPLX.find(c=>c.id===id);
function addLog(mod,sec,res,retry,sum){S.logs.unshift({at:nowStr(),mod,sec,res,retry:!!retry,sum,lead:''});}

/* ===== 고객 화면 ===== */
function phTop(title,back){
  return '<div class="ph-top">'+(back?'<button type="button" class="back" data-go="'+back+'" aria-label="뒤로">'+ic('left')+'</button><h1>'+esc(title)+'</h1>':'<span class="logo">'+ic('wind')+'늘숨 공조</span><span class="sp"></span><span class="small">AI 견적</span>')+'</div>';
}
function tabbar(cur){
  const T=[['quote','견적','calc'],['sub','청약','chart'],['chat','상담','chat'],['my','마이','user']];
  return '<nav class="tabbar" aria-label="고객 메뉴">'+T.map(t=>'<a href="#/c/'+t[0]+'"'+(cur===t[0]?' aria-current="page"':'')+'>'+ic(t[2])+t[1]+'</a>').join('')+'</nav>';
}
function stepbar(n){const L=['단지','동·호','방 선택','견적'];return '<div class="stepbar" aria-hidden="true">'+L.map((x,i)=>'<i class="'+(i<n?'on':'')+'"></i>').join('')+'</div><div class="steplbl"><span>'+L.map((x,i)=>i===n-1?'<b>'+x+'</b>':x).join(' · ')+'</span><span>'+n+' / 4</span></div>';}
function vQuote(){
  const q=UI.q, c=q.cx&&cxOf(q.cx);
  if(q.state==='loading') return phTop('AI 견적','')+'<div class="pbody"><div class="wait" role="status" aria-live="polite"><div class="ring" aria-hidden="true"></div><h2>AI가 견적을 계산하는 중...</h2><p class="small">'+esc(c.name)+' '+esc(c.type)+' · 방 '+q.rooms.length+'개</p><div class="prog"><i id="qprog"></i></div>'+
    '<ul class="steps"><li class="done" id="ws1">'+ic('check')+'평면도와 방 면적 확인</li><li id="ws2">'+ic('clock')+'냉방 부하와 실내기 용량 계산</li><li id="ws3">'+ic('clock')+'패키지별 견적 산출</li></ul></div></div>'+tabbar('quote');
  if(q.state==='timeout') return phTop('AI 견적','')+'<div class="pbody">'+stepbar(3)+'<div class="fail" role="alert"><h2>'+ic('alert')+'AI 응답이 늦어지고 있습니다</h2><p>20초 안에 견적 결과를 받지 못했습니다. 잠시 뒤 다시 시도해 주세요. 고르신 단지와 방은 그대로 남아 있습니다.</p>'+
    '<div class="keep">'+esc(c.name)+' '+esc(q.dong)+' '+esc(q.ho)+' · '+q.rooms.map(k=>roomOf(k).name).join(', ')+'</div></div>'+
    '<p class="small" style="margin-top:12px">계속 실패하면 상담 신청으로 남겨 주세요. 담당자가 직접 견적을 드립니다.</p></div>'+
    '<div class="cta">'+btn({cls:'ghost',label:'방 다시 고르기',attrs:'data-act="qBack"'})+btn({cls:'pri',icon:'refresh',label:'다시 시도',attrs:'data-act="qRun"'})+'</div>'+tabbar('quote');
  if(q.state==='done'){const it=quoteItems(q.rooms,q.pk), tot=qTotal(it);
    return phTop('AI 견적 결과','')+'<div class="pbody">'+stepbar(4)+'<h2>맞춤 패키지</h2><p class="lead">'+esc(c.name)+' '+esc(q.dong)+' '+esc(q.ho)+' · '+q.rooms.map(k=>roomOf(k).name).join(', ')+'</p>'+
      '<div class="pkgs" role="radiogroup" aria-label="패키지">'+PKG.map(p=>{const t=qTotal(quoteItems(q.rooms,p.k));return '<label class="pkg'+(q.pk===p.k?' on':'')+'"><input type="radio" name="pk" data-pk="'+p.k+'"'+(q.pk===p.k?' checked':'')+'><span><span class="n">'+p.n+'</span>'+(p.rec?'<span class="rec">추천</span>':'')+'<span class="d" style="display:block">'+p.d+'</span></span><span class="p">'+won(t)+'원</span></label>';}).join('')+'</div>'+
      '<div class="quote"><div class="qh"><h3>견적 내역서</h3><span>AQ-'+q.cx+'-'+q.ho.replace('호','')+'</span></div>'+
      '<div class="meta"><div>현장</div><div>'+esc(c.name)+' '+esc(q.dong)+' '+esc(q.ho)+' ('+esc(c.type)+')</div><div>패키지</div><div>'+PKG[q.pk-1].n+'</div><div>시공 범위</div><div>'+q.rooms.map(k=>roomOf(k).name+' '+area(roomOf(k)).toFixed(1)+'㎡').join(', ')+'</div></div>'+
      '<table><thead><tr><th>품목</th><th class="c">수량</th><th class="r">금액(원)</th></tr></thead><tbody>'+it.map(x=>'<tr><td>'+esc(x[0])+'<span class="spec">'+esc(x[1])+'</span></td><td class="c num">'+x[2]+'</td><td class="r num">'+won(x[2]*x[3])+'</td></tr>').join('')+'</tbody>'+
      '<tfoot><tr><td colspan="2">합계 (공급가)</td><td class="r num">'+won(tot)+'</td></tr></tfoot></table>'+
      '<div class="vat">부가세 별도. 예상 견적이며 현장 실측 뒤 확정됩니다. 유효기간 발행일로부터 14일.</div></div>'+
      '<p class="basis">산출 근거: 선택한 방 '+q.rooms.length+'개, 면적 합계 '+q.rooms.reduce((a,k)=>a+area(roomOf(k)),0).toFixed(1)+'㎡, 남향 3베이 기준 냉방 부하 (AI 견적 모듈 예시 응답)</p></div>'+
      '<div class="cta"><span class="sum">'+PKG[q.pk-1].n+'<b class="num">'+won(tot)+'원</b></span>'+btn({cls:'pri',label:'이 견적으로 상담 신청',attrs:'data-go="/c/apply"'})+'</div>'+tabbar('quote');}
  if(q.step===1){const kw=q.kw.trim(); const L=CPLX.filter(x=>!kw||x.name.indexOf(kw)>=0||x.addr.indexOf(kw)>=0);
    return phTop('','')+'<div class="pbody">'+stepbar(1)+'<h2>우리 집 냉방·환기 견적</h2><p class="lead">아파트 단지를 찾아 평면도에서 시공할 방을 고르면 AI가 견적을 계산합니다.</p>'+
      '<form class="qsearch" data-form="cx" role="search">'+ic('search')+'<label class="sr" for="cxq">단지 검색</label><input id="cxq" type="search" placeholder="단지명 또는 지역 (예: 한빛)" value="'+esc(q.kw)+'" autocomplete="off"></form>'+
      (L.length?'<ul class="clist">'+L.map(x=>'<li><button type="button" data-cx="'+x.id+'"><span><span class="nm">'+esc(x.name)+'</span><span class="ad" style="display:block">'+esc(x.addr)+' · '+x.hh+' · '+x.yr+'년</span></span>'+ic('right')+'</button></li>').join('')+'</ul>'
        :empty('building','검색한 단지가 없습니다','단지명을 다시 확인하거나 지역명으로 찾아보세요.','<button type="button" class="btn" data-act="cxClear">전체 단지 보기</button>'))+'</div>'+tabbar('quote');}
  if(q.step===2) return phTop('동·호 선택','/c/quote/1')+'<div class="pbody">'+stepbar(2)+
    '<div class="picked"><span><b>'+esc(c.name)+'</b><br><span class="small">'+esc(c.addr)+' · '+esc(c.type)+'</span></span><button type="button" data-act="qStep1">단지 변경</button></div>'+
    '<div class="two-sel"><div class="fld"><label for="qd">동</label><select id="qd" class="f" data-q="dong"><option value="">선택</option>'+c.dongs.map(d=>'<option'+(q.dong===d?' selected':'')+'>'+d+'</option>').join('')+'</select></div>'+
    '<div class="fld"><label for="qh">호</label><select id="qh" class="f" data-q="ho"><option value="">선택</option>'+HOS.map(d=>'<option'+(q.ho===d?' selected':'')+'>'+d+'</option>').join('')+'</select></div></div>'+
    '<p class="small">동과 호를 고르면 해당 세대의 평면도를 불러옵니다. 평형은 '+esc(c.type)+'입니다.</p></div>'+
    '<div class="cta">'+btn({cls:'pri',label:'평면도 불러오기',attrs:'data-act="qPlan"'+(q.dong&&q.ho?'':' disabled')})+'</div>'+tabbar('quote');
  const sumA=q.rooms.reduce((a,k)=>a+area(roomOf(k)),0);
  return phTop('시공할 방 선택','/c/quote/2')+'<div class="pbody">'+stepbar(3)+
    '<div class="picked"><span><b>'+esc(c.name)+' '+esc(q.dong)+' '+esc(q.ho)+'</b><br><span class="small">'+esc(c.type)+' · 전용 84.9㎡</span></span><button type="button" data-act="qStep2">변경</button></div>'+
    '<div class="plan" id="plan">'+planSVG(q.rooms)+'</div><div class="plancap"><span>단위 mm · 벽체 중심 치수</span><span>방을 누르면 선택됩니다</span></div>'+
    '<div class="roomchips" role="group" aria-label="시공할 방">'+ROOMS.filter(r=>r.sel).map(r=>'<button type="button" data-room="'+r.k+'" aria-pressed="'+(q.rooms.indexOf(r.k)>=0)+'">'+r.name+' <span class="a">'+area(r).toFixed(1)+'㎡</span></button>').join('')+'</div></div>'+
    '<div class="cta"><span class="sum">방 '+q.rooms.length+'개<b class="num">'+sumA.toFixed(1)+'㎡</b></span>'+btn({cls:'pri',label:'AI 견적 받기',attrs:'data-act="qRun"'+(q.rooms.length?'':' disabled')})+'</div>'+tabbar('quote');
}
function runQuote(){
  const q=UI.q; if(!q.rooms.length) return;
  const slow=UI.slow; UI.slow=false; const retry=q.state==='timeout';
  q.state='loading'; S.stat.try++; render();
  const dur=slow?2600:1800, t0=Date.now();
  const tick=()=>{const e=$('qprog');if(!e||UI.q.state!=='loading')return;const r=Math.min(1,(Date.now()-t0)/dur);e.style.width=(slow?Math.min(r*100,70):r*100)+'%';
    if(r>.35){const a=$('ws2');if(a){a.className='done';a.innerHTML=ic('check')+'냉방 부하와 실내기 용량 계산';}}
    if(r>.75&&!slow){const a=$('ws3');if(a){a.className='done';a.innerHTML=ic('check')+'패키지별 견적 산출';}}
    if(r<1)requestAnimationFrame(tick);};
  requestAnimationFrame(tick);
  const c=cxOf(q.cx), sum=c.name+' · 방 '+q.rooms.length+'개';
  setTimeout(()=>{
    if(slow){q.state='timeout';addLog('q',20.0,'시간 초과',retry,sum);toast('AI 응답 시간이 초과되었습니다. 다시 시도해 주세요.','bad');}
    else{q.state='done';S.stat.view++;addLog('q',+(1.6+Math.random()*.5).toFixed(1),'성공',retry,sum);
      const it=quoteItems(q.rooms,q.pk);S.my.quotes.unshift({at:nowStr(),cx:q.cx,dong:q.dong,ho:q.ho,rooms:q.rooms.slice(),pk:q.pk,total:qTotal(it)});}
    if(UI.role==='c'&&UI.view==='quote') render();
  },dur);
}
function vSub(){
  const s=UI.sub, c=cxOf(UI.q.cx||'HB3');
  const sel=(id,lab,opts,val)=>'<div class="fld"><label for="'+id+'">'+lab+'</label><select id="'+id+'" class="f" data-sub="'+id+'"><option value="">선택</option>'+opts.map(o=>'<option value="'+o[0]+'"'+(String(val)===String(o[0])?' selected':'')+'>'+o[1]+'</option>').join('')+'</select></div>';
  const ok=s.h!==''&&s.d!==''&&s.a!=='';
  let res='';
  if(s.state==='loading') res='<div class="wait" style="padding:20px 0" role="status"><div class="ring" aria-hidden="true"></div><p class="small">AI가 가점과 분양가를 예측하는 중...</p></div>';
  if(s.state==='done'&&s.res){const r=s.res;
    res='<div class="score" aria-live="polite"><div class="small">예상 청약 가점</div><div class="big">'+r.score+'<small> / 84점</small></div>'+
      '<div class="sbar" role="img" aria-label="예상 가점 '+r.score+'점, 최근 당첨 하한 58점"><i style="width:'+(r.score/84*100).toFixed(1)+'%"></i><em style="left:'+(58/84*100).toFixed(1)+'%"><span>최근 당첨 하한 58점 (예시)</span></em></div>'+
      '<div class="kv"><div>무주택 기간</div><div>'+r.p1+'점</div><div>부양가족</div><div>'+r.p2+'점</div><div>통장 가입 기간</div><div>'+r.p3+'점</div><div>예상 분양가</div><div><b>'+esc(r.range)+'</b> <span class="small">'+esc(c.name)+' 인근 84㎡</span></div></div>'+
      '<p class="small" style="margin:10px 0 0">AI 청약 모듈의 예측 결과 예시입니다. 실제 청약 자격과 가점은 청약홈에서 확인하세요.</p></div>';}
  return phTop('청약 예측','')+'<div class="pbody"><h2>청약 가점·분양가 예측</h2><p class="lead">세 가지만 고르면 예상 가점과 인근 분양가 범위를 알려 드립니다.</p>'+
    sel('sh','무주택 기간',[[0,'1년 미만'],[3,'3년 이상'],[5,'5년 이상'],[8,'8년 이상'],[12,'12년 이상'],[15,'15년 이상']],s.h)+
    sel('sd','부양가족 수 (본인 제외)',[[0,'0명'],[1,'1명'],[2,'2명'],[3,'3명'],[4,'4명'],[6,'6명 이상']],s.d)+
    sel('sa','청약통장 가입 기간',[[1,'1년 미만'],[3,'3년 이상'],[5,'5년 이상'],[10,'10년 이상'],[15,'15년 이상']],s.a)+res+'</div>'+
    '<div class="cta">'+btn({cls:'pri',label:s.state==='done'?'다시 예측하기':'예상 가점 보기',attrs:'data-act="subRun"'+(ok&&s.state!=='loading'?'':' disabled')})+'</div>'+tabbar('sub');
}
const CANNED={
  '시스템에어컨 몇 대가 필요한가요?':'84㎡ 3베이는 거실 1대와 침실마다 1대씩, 보통 3~5대를 씁니다. 견적 화면에서 방을 고르시면 대수와 실외기 용량을 바로 계산해 드립니다.',
  '환기장치도 같이 해야 하나요?':'에어컨을 켜고 창문을 닫아 두는 시간이 길면 전열교환 환기장치를 함께 권합니다. 천장 공사를 한 번에 하면 덕트 비용이 줄어듭니다.',
  '공사 기간은 얼마나 걸리나요?':'입주 전 공실 기준 시스템에어컨은 1~2일, 환기장치를 함께 하면 2~3일입니다. 거주 중이면 가구 보호 작업으로 하루 정도 더 걸립니다.'
};
function vChat(){
  const c=UI.chat, mine=c.msgs.filter(m=>m.who==='me').length;
  return phTop('AI 상담','')+'<div class="pbody"><div class="chat" aria-live="polite">'+c.msgs.map(m=>'<div class="bub'+(m.who==='me'?' me':'')+'">'+esc(m.t)+(m.at?'<small>'+m.at+'</small>':'')+'</div>').join('')+(c.typing?'<div class="typing" aria-label="답변 작성 중"><i></i><i></i><i></i></div>':'')+'</div>'+
    (c.typing?'':'<div class="sugs">'+Object.keys(CANNED).filter(k=>!c.msgs.some(m=>m.t===k)).map(k=>'<button type="button" data-ask="'+esc(k)+'">'+esc(k)+'</button>').join('')+'</div>')+
    (mine>=2&&!c.typing?'<div class="handoff"><span>상담을 신청하면 이 대화가 담당자에게 함께 전달됩니다.</span>'+btn({cls:'pri sm',label:'상담 신청',attrs:'data-go="/c/apply"'})+'</div>':'')+'</div>'+
    '<form class="composer" data-form="chat"><label class="sr" for="cin">메시지</label><input id="cin" placeholder="궁금한 점을 입력하세요" autocomplete="off"'+(c.typing?' disabled':'')+'><button type="submit" aria-label="보내기"'+(c.typing?' disabled':'')+'>'+ic('send')+'</button></form>'+tabbar('chat');
}
function askAI(t){
  const c=UI.chat; if(c.typing||!t.trim()) return;
  c.msgs.push({who:'me',t:t.trim(),at:nowHM()}); c.typing=true; render();
  const ans=CANNED[t]||'말씀하신 내용은 현장 구조에 따라 달라 담당자가 확인해 드리는 것이 정확합니다. 상담을 신청하시면 이 대화와 함께 전달됩니다.';
  setTimeout(()=>{c.typing=false;c.msgs.push({who:'ai',t:ans,at:nowHM()});addLog('c',+(0.8+Math.random()*.5).toFixed(1),'성공',false,'질문 '+c.msgs.filter(m=>m.who==='me').length+'턴');if(UI.view==='chat')render();},1300);
}
function vApply(){
  const a=UI.ap, q=UI.q, has=q.state==='done';
  if(a.done) return phTop('상담 신청 완료','')+'<div class="pbody"><div class="done"><div class="ok">'+ic('check')+'</div><h2>상담 신청이 접수되었습니다</h2><p class="lead">담당자가 확인한 뒤 연락드립니다. 진행 상황은 마이페이지에서 볼 수 있습니다.</p><span class="no">접수번호 '+esc(a.done)+'</span></div></div>'+
    '<div class="cta">'+btn({cls:'ghost',label:'처음으로',attrs:'data-go="/c/quote"'})+btn({cls:'pri',label:'마이페이지에서 보기',attrs:'data-go="/c/my"'})+'</div>'+tabbar('my');
  const c=has&&cxOf(q.cx), tot=has?qTotal(quoteItems(q.rooms,q.pk)):0;
  return phTop('상담 신청','/c/quote')+'<div class="pbody">'+
    (has?'<div class="qcard"><div class="h"><span>방금 받은 견적이 함께 전달됩니다</span>'+ic('check')+'</div><dl><dt>현장</dt><dd>'+esc(c.name)+' '+esc(q.dong)+' '+esc(q.ho)+'</dd><dt>패키지</dt><dd>'+PKG[q.pk-1].n+'</dd><dt>시공 범위</dt><dd>'+q.rooms.map(k=>roomOf(k).name).join(', ')+'</dd><dt>예상 금액</dt><dd class="num">'+won(tot)+'원 (부가세 별도)</dd>'+
      (UI.chat.msgs.length>1?'<dt>AI 상담</dt><dd>대화 '+UI.chat.msgs.filter(m=>m.who==='me').length+'건 함께 전달</dd>':'')+'</dl></div>'
      :'<div class="qcard none">받은 AI 견적이 없습니다. 견적 없이도 신청할 수 있고, <button type="button" class="btn sm" data-go="/c/quote">AI 견적 먼저 받기</button></div>')+
    '<div class="fld"><label for="an">이름<span class="req">*</span></label><input id="an" class="f" autocomplete="name" value="'+esc(a.name)+'"><div class="err" id="e-an"></div></div>'+
    '<div class="fld"><label for="ap">휴대폰 번호<span class="req">*</span></label><input id="ap" class="f" type="tel" inputmode="numeric" autocomplete="tel" placeholder="숫자만 입력" value="'+esc(a.phone)+'"><div class="err" id="e-ap"></div></div>'+
    '<div class="fld"><label for="at">연락 희망 시간</label><select id="at" class="f">'+['평일 오전','평일 오후','평일 저녁','주말'].map(x=>'<option'+(a.time===x?' selected':'')+'>'+x+'</option>').join('')+'</select></div>'+
    '<div class="fld"><span class="lab">현장 사진 <span class="small">(선택, 최대 3장)</span></span><div class="photos">'+Array.from({length:a.photos}).map((x,i)=>'<span class="ph">사진 '+(i+1)+'<button type="button" data-delph="'+i+'" aria-label="사진 '+(i+1)+' 삭제"><span>'+ic('x')+'</span></button></span>').join('')+(a.photos<3?'<button type="button" class="add" data-act="addPh">'+ic('camera')+'추가</button>':'')+'</div></div>'+
    '<div class="agree"><label class="chk"><input type="checkbox" id="ag"'+(a.agree?' checked':'')+'><span><b>개인정보 수집·이용 동의</b><span class="req" style="color:var(--bad)">*</span></span></label>'+
    '<details><summary>내용 보기</summary><table><tr><th>수집 항목</th><td>이름, 휴대폰 번호, 현장 사진, 견적·상담 내용</td></tr><tr><th>이용 목적</th><td>시공 상담 연락과 견적 안내</td></tr><tr><th>보유 기간</th><td>상담 종료 후 1년 (예시)</td></tr></table></details><div class="err" id="e-ag"></div></div></div>'+
    '<div class="cta">'+btn({cls:'pri',label:'상담 신청하기',attrs:'data-act="apSubmit"'})+'</div>'+tabbar('my');
}
function vMy(){
  const Q=S.my.quotes, L=S.my.leads;
  return phTop('마이페이지','')+'<div class="pbody"><h2>내 견적·상담</h2><p class="lead">AI 견적과 상담 신청 내역입니다.</p>'+
    '<div class="sec-h">상담 신청<span>'+L.length+'건</span></div>'+
    (L.length?'<ul class="myl">'+L.map(id=>{const l=S.leads.find(x=>x.id===id);return '<li><span class="t">'+esc(cxOf(l.cx).name)+' '+esc(l.ho)+'</span><span class="amt">'+stLb(l.st)+'</span><span class="s">'+esc(l.id)+' · '+esc(l.at.slice(5))+' · '+PKG[l.pk-1].n+(l.vendor?' · '+esc(l.vendor):'')+'</span></li>';}).join('')+'</ul>'
      :empty('list','상담 신청 내역이 없습니다','AI 견적을 받은 뒤 상담을 신청하면 여기서 진행 상황을 볼 수 있습니다.','<button type="button" class="btn pri" data-go="/c/quote">AI 견적 받기</button>'))+
    '<div class="sec-h" style="margin-top:18px">AI 견적<span>'+Q.length+'건</span></div>'+
    (Q.length?'<ul class="myl">'+Q.map(x=>'<li><span class="t">'+esc(cxOf(x.cx).name)+' '+esc(x.ho)+'</span><span class="amt num">'+won(x.total)+'원</span><span class="s">'+esc(x.at.slice(5))+' · '+PKG[x.pk-1].n+' · 방 '+x.rooms.length+'개</span></li>').join('')+'</ul>':'<p class="small">받은 견적이 없습니다.</p>')+'</div>'+tabbar('my');
}

/* ===== 관리자 ===== */
const inPer=(at,per)=>per==='all'||(per==='w'?at>='2026-10-12':per==='d'?at.slice(0,10)==='2026-10-14':at>='2026-10-01');
const leadAmt=(l)=>qTotal(l.items);
function leadRow(l,mini){
  const c=cxOf(l.cx);
  return '<tr'+(UI.m.fresh===l.id?' class="fresh"':'')+'><td><button type="button" class="idl" data-lead="'+l.id+'">'+l.id+'</button>'+(UI.m.fresh===l.id?' <span class="lb new">새 건</span>':'')+'</td><td class="num">'+esc(l.at.slice(5))+'</td><td>'+esc(l.name)+' <span class="small mask">●●●●-'+l.ph4+'</span></td><td>'+esc(c.name)+' · 84㎡</td>'+
    (mini?'':'<td>'+PKG[l.pk-1].n+'</td>')+'<td class="r num">'+won(leadAmt(l))+'</td><td>'+stLb(l.st)+'</td>'+(mini?'':'<td>'+(l.vendor?esc(l.vendor):'<span class="small">미배정</span>')+'</td>')+'</tr>';
}
function vHome(){
  const per=UI.m.per, b=BASE[per];
  const ls=S.leads.filter(l=>inPer(l.at,per)), tr=b.try+S.stat.try, vw=b.view+S.stat.view, ap=ls.length;
  const pct=(a,c)=>c?(a/c*100).toFixed(1)+'%':'-';
  const wait=S.leads.filter(l=>l.st==='접수').length, un=S.leads.filter(l=>!l.vendor).length;
  return '<div class="ph"><div><h1>첫 화면</h1><div class="sub">AI 체험에서 상담 신청까지 기간별 전환입니다. 지원사업 성과 보고 숫자로 그대로 씁니다.</div></div><div class="acts"><div class="seg" role="group" aria-label="기간"><button type="button" data-per="w" aria-pressed="'+(per==='w')+'">이번 주</button><button type="button" data-per="m" aria-pressed="'+(per==='m')+'">이번 달</button></div></div></div>'+
    '<div class="funnel" aria-label="전환 지표"><div class="st"><div class="k">AI 체험 (견적 요청)</div><div class="v">'+won(tr)+'<small>회</small></div></div><div class="ar">'+ic('right')+'</div>'+
    '<div class="st"><div class="k">견적 결과 확인</div><div class="v">'+won(vw)+'<small>회</small></div><div class="rt">체험 대비 '+pct(vw,tr)+'</div></div><div class="ar">'+ic('right')+'</div>'+
    '<div class="st"><div class="k">상담 신청</div><div class="v">'+ap+'<small>건</small></div><div class="rt">견적 확인 대비 '+pct(ap,vw)+'</div></div></div>'+
    '<div class="notice"><span>처리 대기 (접수 상태) <b>'+wait+'건</b></span><span>업체 미배정 <b>'+un+'건</b></span><span>오늘 AI 호출 실패 <b>'+S.logs.filter(x=>x.res!=='성공'&&x.at.slice(0,10)==='2026-10-14').length+'건</b></span></div>'+
    '<div class="panel"><div class="hd"><h2>최근 접수</h2><button type="button" class="btn sm" data-go="/m/list">상담 목록 전체</button></div><div class="tw"><table class="t"><thead><tr><th>접수번호</th><th>접수일시</th><th>고객</th><th>단지·평형</th><th class="r">견적 금액</th><th>상태</th></tr></thead><tbody>'+S.leads.slice(0,6).map(l=>leadRow(l,1)).join('')+'</tbody></table></div></div>';
}
function filtered(){const f=UI.m.flt;return S.leads.filter(l=>inPer(l.at,f.per)&&(!f.st||l.st===f.st)&&(!f.kw||(l.name+cxOf(l.cx).name+l.id).indexOf(f.kw)>=0));}
function vList(){
  const f=UI.m.flt, L=filtered();
  return '<div class="ph"><div><h1>상담 목록</h1><div class="sub">고객 웹에서 들어온 상담 신청입니다. 신청 건마다 고객이 본 AI 견적과 상담 대화가 붙어 있습니다.</div></div><div class="acts">'+btn({cls:'pri',icon:'download',label:'CSV 내보내기',attrs:'data-act="csv"'+(L.length?'':' disabled')})+'</div></div>'+
    '<div class="panel"><div class="filters"><label for="fp">기간</label><select id="fp" class="f" data-flt="per"><option value="d"'+(f.per==='d'?' selected':'')+'>오늘</option><option value="w"'+(f.per==='w'?' selected':'')+'>이번 주</option><option value="m"'+(f.per==='m'?' selected':'')+'>이번 달</option><option value="all"'+(f.per==='all'?' selected':'')+'>전체</option></select>'+
    '<label for="fs">상태</label><select id="fs" class="f" data-flt="st"><option value="">전체</option>'+STS.map(s=>'<option'+(f.st===s?' selected':'')+'>'+s+'</option>').join('')+'</select>'+
    '<form data-form="kw" style="display:flex;gap:6px;flex:1 1 220px"><label for="fk" class="sr">고객·단지 검색</label><input id="fk" class="f" style="flex:1;min-width:0" placeholder="고객, 단지, 접수번호" value="'+esc(f.kw)+'">'+btn({cls:'icon-m',icon:'search',label:'검색',attrs:'type="submit" data-tip="검색"'}).replace('type="button" ','')+'</form>'+
    '<span class="grow"></span><span class="small">'+L.length+'건</span></div>'+
    (L.length?'<div class="tw"><table class="t"><thead><tr><th>접수번호</th><th>접수일시</th><th>고객</th><th>단지·평형</th><th>패키지</th><th class="r">견적 금액</th><th>상태</th><th>담당 업체</th></tr></thead><tbody>'+L.map(l=>leadRow(l)).join('')+'</tbody></table></div>'
      :'<div style="padding:16px">'+empty('search','조건에 맞는 상담이 없습니다','기간이나 상태 조건을 넓혀 보세요.','<button type="button" class="btn" data-act="fltReset">조건 초기화</button>')+'</div>')+'</div>'+
    '<p class="small">CSV는 UTF-8(BOM)으로 저장되어 엑셀에서 한글이 깨지지 않습니다. 연락처는 내보내기에서도 끝 4자리만 남깁니다.</p>';
}
function vDetail(){
  const l=S.leads.find(x=>x.id===UI.id); if(!l) return empty('list','상담 건을 찾을 수 없습니다','목록에서 다시 골라 주세요.','<button type="button" class="btn" data-go="/m/list">상담 목록</button>');
  const c=cxOf(l.cx), it=l.items, si=STS.indexOf(l.st), rv=UI.m.reveal[l.id];
  return '<div class="crumb"><a href="#/m/list">상담 목록</a> / '+l.id+'</div><div class="ph"><div><h1>'+esc(l.name)+' · '+esc(c.name)+' '+esc(l.dong)+' '+esc(l.ho)+' '+stLb(l.st)+'</h1><div class="sub">접수 '+esc(l.at)+' · 유입 '+esc(l.src)+'</div></div><div class="acts">'+btn({icon:'left',label:'목록',attrs:'data-go="/m/list"'})+'</div></div>'+
    '<div class="dgrid"><div>'+
    '<div class="panel"><div class="hd"><h2>고객 입력</h2></div><div class="bd"><table class="kvt"><tr><th>이름</th><td>'+esc(l.name)+'</td></tr><tr><th>연락처</th><td><span class="mask">'+(rv?esc(rv):'●●●●-'+l.ph4)+'</span>'+(rv?'':btn({cls:'sm reveal',icon:'eye',label:'열람',attrs:'data-reveal="'+l.id+'"'}))+'<div class="small">개인정보는 암호화해 저장하고, 열람하면 처리 이력에 기록됩니다.</div></td></tr>'+
      '<tr><th>현장</th><td>'+esc(c.name)+' '+esc(l.dong)+' '+esc(l.ho)+' ('+esc(c.type)+')</td></tr><tr><th>연락 희망</th><td>'+esc(l.time||'평일 오후')+'</td></tr><tr><th>현장 사진</th><td>'+(l.photos?'<div class="thumbs">'+Array.from({length:l.photos}).map((x,i)=>'<span>사진 '+(i+1)+'</span>').join('')+'</div>':'<span class="small">없음</span>')+'</td></tr></table></div></div>'+
    '<div class="panel"><div class="hd"><h2>고객이 본 AI 견적</h2><span class="small">'+PKG[l.pk-1].n+' · 부가세 별도</span></div><div class="tw"><table class="t"><thead><tr><th>품목</th><th>규격</th><th class="r">수량</th><th class="r">단가</th><th class="r">금액</th></tr></thead><tbody>'+
      it.map(x=>'<tr><td>'+esc(x[0])+'</td><td class="wrap small">'+esc(x[1])+'</td><td class="r num">'+x[2]+'</td><td class="r num">'+won(x[3])+'</td><td class="r num">'+won(x[2]*x[3])+'</td></tr>').join('')+
      '<tr><td colspan="4"><b>합계 (공급가)</b></td><td class="r num"><b>'+won(qTotal(it))+'</b></td></tr></tbody></table></div><div class="bd small" style="border-top:1px solid var(--line-2)">시공 범위: '+l.rooms.map(k=>roomOf(k).name+' '+area(roomOf(k)).toFixed(1)+'㎡').join(', ')+'</div></div>'+
    '<div class="panel"><div class="hd"><h2>청약 예측 결과</h2></div><div class="bd">'+(l.sub?'예상 가점 <b class="num">'+l.sub.score+'점</b> / 84점 · 예상 분양가 '+esc(l.sub.range):'<span class="small">청약 예측을 이용하지 않았습니다.</span>')+'</div></div>'+
    '<div class="panel"><div class="hd"><h2>AI 상담 대화</h2><span class="small">'+l.chat.length+'건</span></div><div class="bd">'+(l.chat.length?'<div class="convo">'+l.chat.map(m=>'<div class="bub'+(m[0]==='me'?' me':'')+'">'+(m[0]==='me'?'<b>고객</b> ':'<b>AI</b> ')+esc(m[1])+'</div>').join('')+'</div>':'<span class="small">상담 대화 없이 신청했습니다.</span>')+'</div></div>'+
    '</div><div>'+
    '<div class="panel"><div class="hd"><h2>처리</h2></div><div class="bd"><div class="flow" aria-label="진행 상태">'+STS.map((s,i)=>'<span class="'+(i<si?'done':i===si?'cur':'')+'">'+s+'</span>').join('')+'</div>'+
      '<div class="form-row"><label for="dst">상태</label><select id="dst" class="f">'+STS.map(s=>'<option'+(l.st===s?' selected':'')+'>'+s+'</option>').join('')+'</select></div>'+
      '<div class="form-row"><label for="dvd">담당 업체</label><select id="dvd" class="f"><option value="">미배정</option>'+VENDORS.map(v=>'<option'+(l.vendor===v?' selected':'')+'>'+v+'</option>').join('')+'</select><div class="err" id="e-dvd"></div></div>'+
      '<div class="form-row"><label for="dmm">메모</label><textarea id="dmm" class="f" rows="3" placeholder="통화 내용, 실측 일정 등">'+esc(l.memo)+'</textarea></div>'+
      btn({cls:'pri',icon:'check',label:'저장',attrs:'data-save="'+l.id+'" style="width:100%"'})+'</div></div>'+
    '<div class="panel"><div class="hd"><h2>처리 이력</h2></div><div class="bd"><ul class="log">'+l.hist.slice().reverse().map(h=>'<li><span class="tm">'+esc(h.at.slice(5))+'</span><span>'+esc(h.t)+'</span></li>').join('')+'</ul></div></div>'+
    '</div></div>';
}
function vAilog(){
  const a=UI.m.alog, L=S.logs.filter(x=>(!a.mod||x.mod===a.mod)&&(!a.res||x.res===a.res));
  const sum=(m)=>{const xs=S.logs.filter(x=>x.mod===m);const ok=xs.filter(x=>x.res==='성공');const avg=ok.length?ok.reduce((s,x)=>s+x.sec,0)/ok.length:0;const fail=xs.length?(xs.length-ok.length)/xs.length*100:0;
    return '<div><b>'+MODS[m]+' 모듈</b>호출 <span class="num">'+xs.length+'</span>회 · 평균 응답 <span class="num">'+avg.toFixed(1)+'초</span> · 실패율 <span class="'+(fail?'bad':'num')+'">'+fail.toFixed(1)+'%</span></div>';};
  return '<div class="ph"><div><h1>AI 호출 기록</h1><div class="sub">AI 3종 호출마다 응답 시간과 결과를 남깁니다. 시간 초과 기준 20초, 실패하면 고객 화면에 다시 시도를 띄웁니다.</div></div></div>'+
    '<div class="modsum">'+['q','s','c'].map(sum).join('')+'</div>'+
    '<div class="panel"><div class="filters"><label for="lm">모듈</label><select id="lm" class="f" data-alog="mod"><option value="">전체</option>'+Object.keys(MODS).map(k=>'<option value="'+k+'"'+(a.mod===k?' selected':'')+'>'+MODS[k]+'</option>').join('')+'</select>'+
    '<label for="lr">결과</label><select id="lr" class="f" data-alog="res"><option value="">전체</option>'+['성공','시간 초과','오류'].map(r=>'<option'+(a.res===r?' selected':'')+'>'+r+'</option>').join('')+'</select><span class="grow"></span><span class="small">오늘 '+L.length+'건</span></div>'+
    (L.length?'<div class="tw"><table class="t"><thead><tr><th>호출 시각</th><th>모듈</th><th>요청 요약</th><th class="r">응답 시간</th><th>결과</th><th>재시도</th><th>연결된 상담</th></tr></thead><tbody>'+L.map(x=>'<tr><td class="num">'+esc(x.at.slice(11))+'</td><td>'+MODS[x.mod]+'</td><td>'+esc(x.sum)+'</td><td class="r num">'+x.sec.toFixed(1)+'초</td><td>'+resLb(x.res)+'</td><td>'+(x.retry?'<span class="lb mute">재시도</span>':'')+'</td><td>'+(x.lead?'<button type="button" class="idl" data-lead="'+x.lead+'">'+x.lead+'</button>':'')+'</td></tr>').join('')+'</tbody></table></div>'
      :'<div style="padding:16px">'+empty('log','조건에 맞는 호출 기록이 없습니다','모듈이나 결과 조건을 바꿔 보세요.','<button type="button" class="btn" data-act="alogReset">조건 초기화</button>')+'</div>')+'</div>';
}
function exportCSV(){
  const L=filtered();
  const H=['접수번호','접수일시','고객','연락처(끝4자리)','단지','동','호','평형','시공 범위','패키지','견적 금액(원, 부가세 별도)','상태','담당 업체','메모'];
  const q=(v)=>{v=String(v==null?'':v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;};
  const rows=L.map(l=>{const c=cxOf(l.cx);return [l.id,l.at,l.name,'****'+l.ph4,c.name,l.dong,l.ho,'84㎡',l.rooms.map(k=>roomOf(k).name).join(' '),PKG[l.pk-1].n,leadAmt(l),l.st,l.vendor,l.memo].map(q).join(',');});
  const csv='﻿'+[H.join(',')].concat(rows).join('\r\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='상담목록_20261014.csv';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);
  window.__lastCSV=csv;
  toast('CSV 파일을 내려받았습니다. '+L.length+'건, 엑셀에서 바로 열 수 있습니다.');
}

/* ===== 시연 안내 ===== */
function prepPlan(){UI.q=Object.assign(UI.q,{step:3,cx:'HB3',dong:'302동',ho:'1203호',rooms:['lv','r1','r2'],state:'idle',kw:''});}
const GUIDE=[
  {t:'단지 고르고 방 선택',d:'한빛마을 3단지 302동 1203호 평면도에서 방을 고릅니다.',run:()=>{prepPlan();go('/c/quote');}},
  {t:'AI 견적 받기',d:'대기 화면 뒤 패키지 3안과 견적 내역서가 나옵니다.',run:()=>{if(!UI.q.cx)prepPlan();UI.q.state='idle';go('/c/quote');setTimeout(runQuote,50);}},
  {t:'상담 신청',d:'방금 받은 견적이 신청서에 함께 붙습니다.',run:()=>{if(UI.q.state!=='done'){prepPlan();UI.q.state='done';UI.q.pk=2;}UI.ap=Object.assign(UI.ap,{name:UI.ap.name||'이서연',phone:UI.ap.phone||'01024681357',photos:Math.max(UI.ap.photos,2),agree:true,done:null});go('/c/apply');}},
  {t:'관리자 목록에서 새 건 확인',d:'고객이 신청한 건이 목록 맨 위에 들어옵니다.',run:()=>{UI.m.flt={per:'m',st:'',kw:''};go('/m/list');}},
  {t:'상세에서 업체 배정',d:'견적과 대화를 보고 담당 업체를 배정합니다.',run:()=>go('/m/detail/'+(UI.m.fresh||S.leads[0].id))},
  {t:'CSV 내보내기',d:'목록 조건 그대로 엑셀용 파일을 만듭니다.',run:()=>{go('/m/list');setTimeout(()=>withLoading('CSV 만드는 중...',exportCSV,450),80);}},
  {t:'AI 호출 기록',d:'모듈별 응답 시간과 실패, 재시도를 봅니다.',run:()=>go('/m/ailog')}
];
function renderGuide(){
  const g=$('guide');
  if(UI.guideOpen===null) UI.guideOpen=window.matchMedia('(min-width:1101px)').matches;
  g.className='guide'+(UI.guideOpen?'':' closed');
  document.body.classList.toggle('guide-open',!!UI.guideOpen);
  g.innerHTML='<button type="button" class="gh" data-act="toggleGuide" aria-expanded="'+UI.guideOpen+'" aria-controls="guideList"><span>시연 안내</span>'+ic(UI.guideOpen?'down':'up')+'</button>'+
    '<ol id="guideList">'+GUIDE.map((s,i)=>'<li><button type="button" data-guide="'+i+'"'+(UI.guideStep===i?' aria-current="step"':'')+'><b><span class="n">'+(i+1)+'.</span>'+s.t+'</b>'+(UI.guideStep===i?'<span class="d">'+s.d+'</span>':'')+'</button></li>').join('')+'</ol>'+
    '<button type="button" class="slow" data-act="slow">'+ic('clock')+'응답 지연 보기</button>';
}

/* ===== render ===== */
const CV={quote:vQuote,sub:vSub,chat:vChat,apply:vApply,my:vMy};
const MV={home:vHome,list:vList,detail:vDetail,ailog:vAilog};
function render(){
  const cnt=S.leads.filter(l=>l.st==='접수').length;
  $('top').innerHTML='<a class="logo" href="#/c/quote">'+ic('wind')+'늘숨 공조</a><span class="sysname">'+(UI.role==='c'?'고객 웹 · AI 견적과 상담 신청':'상담 관리')+'</span><span class="sp"></span>'+
    '<nav class="switch" aria-label="화면 전환"><a href="#/c/quote"'+(UI.role==='c'?' aria-current="page"':'')+'>고객 화면</a><a href="#/m/home"'+(UI.role==='m'?' aria-current="page"':'')+'>관리자 화면</a></nav>'+(UI.role==='m'?'<span class="who">운영자</span>':'');
  let h;
  if(UI.role==='c') h='<div class="stage"><main id="main" tabindex="-1" class="phone">'+CV[UI.view]()+'</main></div>';
  else {const cur=UI.view==='detail'?'list':UI.view;
    h='<div class="adm"><nav class="side" aria-label="관리자 메뉴"><h2>상담 관리</h2>'+[['home','첫 화면','dash'],['list','상담 목록','list'],['ailog','AI 호출 기록','log']].map(m=>'<a href="#/m/'+m[0]+'"'+(cur===m[0]?' aria-current="page"':'')+'>'+ic(m[2])+m[1]+(m[0]==='list'&&cnt?'<span class="cnt">'+cnt+'</span>':'')+'</a>').join('')+'</nav><main id="main" tabindex="-1" class="amain">'+MV[UI.view]()+'</main></div>';}
  $('root').innerHTML=h;
  document.body.classList.toggle('c-on',UI.role==='c');
  renderGuide();
}

/* ===== events ===== */
function toggleRoom(k){const r=UI.q.rooms,i=r.indexOf(k);if(i>=0)r.splice(i,1);else r.push(k);render();const n=document.querySelector('.plan [data-room="'+k+'"]');if(n&&document.activeElement&&document.activeElement.closest&&document.activeElement.closest('.plan'))n.focus();}
document.addEventListener('keydown',(e)=>{const g=e.target.closest&&e.target.closest('.rm');if(g&&(e.key==='Enter'||e.key===' ')){e.preventDefault();toggleRoom(g.dataset.room);}});
document.addEventListener('submit',(e)=>{const f=e.target.dataset.form;if(!f)return;e.preventDefault();
  if(f==='cx'){UI.q.kw=$('cxq').value;render();const i=$('cxq');if(i){i.focus();i.setSelectionRange(i.value.length,i.value.length);}}
  if(f==='chat'){const v=$('cin').value;askAI(v);}
  if(f==='kw'){UI.m.flt.kw=$('fk').value.trim();withLoading('조회 중...',render,300);}
});
document.addEventListener('input',(e)=>{if(e.target.id==='cxq'){UI.q.kw=e.target.value;const pos=e.target.selectionStart;render();const i=$('cxq');if(i){i.focus();i.setSelectionRange(pos,pos);}}});
document.addEventListener('click',(e)=>{
  const g=e.target.closest('.plan .rm'); if(g){toggleRoom(g.dataset.room);return;}
  const t=e.target.closest('button,a[data-go]'); if(!t) return; const d=t.dataset;
  if(d.guide!=null){const i=+d.guide;UI.guideStep=i;UI.guideOpen=false;GUIDE[i].run();return;}
  if(d.go){if(d.go==='/c/quote/1'){UI.q.step=1;go('/c/quote');return;}if(d.go==='/c/quote/2'){UI.q.step=2;go('/c/quote');return;}
    if(d.go==='/c/quote'&&UI.ap.done){UI.ap.done=null;}go(d.go);return;}
  if(d.cx){Object.assign(UI.q,{cx:d.cx,step:2,dong:'',ho:'',rooms:[],state:'idle'});render();return;}
  if(d.room){toggleRoom(d.room);return;}
  if(d.ask){askAI(d.ask);return;}
  if(d.delph!=null){UI.ap.photos--;keepAp();render();return;}
  if(d.per){UI.m.per=d.per;withLoading('집계 중...',render,300);return;}
  if(d.lead){go('/m/detail/'+d.lead);return;}
  if(d.reveal){const l=S.leads.find(x=>x.id===d.reveal);withLoading('열람 기록 남기는 중...',()=>{UI.m.reveal[l.id]=(l.full||'0'+'10'+' ●●●● '+l.ph4).replace(/(\d{3})(\d{4})(\d{4})/,'$1 $2 $3');l.hist.push({at:nowStr(),t:'연락처 열람 (운영자)'});toast('연락처를 열람했습니다. 처리 이력에 기록되었습니다.');render();},350);return;}
  if(d.save){const l=S.leads.find(x=>x.id===d.save);const st=$('dst').value,vd=$('dvd').value,mm=$('dmm').value.trim();
    if(STS.indexOf(st)>=1&&!vd){$('e-dvd').textContent='업체 배정 이후 단계는 담당 업체를 골라야 합니다.';$('dvd').focus();return;}
    withLoading('저장 중...',()=>{const at=nowStr();
      if(vd!==l.vendor){l.hist.push({at,t:vd?'담당 업체 배정: '+vd+' (운영자)':'담당 업체 해제 (운영자)'});l.vendor=vd;}
      let ns=st; if(vd&&ns==='접수') ns='업체 배정';
      if(ns!==l.st){l.hist.push({at,t:'상태 변경: '+l.st+' → '+ns});l.st=ns;}
      if(mm!==l.memo){l.hist.push({at,t:'메모 저장'});l.memo=mm;}
      toast('저장했습니다. 상태: '+l.st+(l.vendor?' · '+l.vendor:''));render();},450);return;}
  if(d.pk){return;}
  switch(d.act){
    case 'toggleGuide': UI.guideOpen=!UI.guideOpen; renderGuide(); return;
    case 'slow': UI.guideStep=null;UI.guideOpen=false;if(!UI.q.cx||UI.q.step<3)prepPlan();UI.q.state='idle';UI.slow=true;go('/c/quote');setTimeout(runQuote,50);return;
    case 'cxClear': UI.q.kw='';render();return;
    case 'qStep1': UI.q.step=1;render();return;
    case 'qStep2': UI.q.step=2;UI.q.state='idle';render();return;
    case 'qPlan': withLoading('평면도 불러오는 중...',()=>{UI.q.step=3;render();},500);return;
    case 'qRun': runQuote();return;
    case 'qBack': UI.q.state='idle';UI.q.step=3;render();return;
    case 'subRun':{const s=UI.sub;s.state='loading';render();const t0=Date.now();
      setTimeout(()=>{const h=+s.h,dd=+s.d,a=+s.a;const p1=h===0?2:Math.min(32,2*(h+1)),p2=Math.min(35,5*(dd+1)),p3=Math.min(17,a+2);const c=cxOf(UI.q.cx||'HB3');
        s.res={p1,p2,p3,score:p1+p2+p3,range:c.price[0].toFixed(1)+'억 ~ '+c.price[1].toFixed(1)+'억'};s.state='done';addLog('s',+((Date.now()-t0)/1000).toFixed(1),'성공',false,'무주택 '+h+'년 · 부양 '+dd+'명');if(UI.view==='sub')render();},1500);return;}
    case 'addPh': keepAp();UI.ap.photos=Math.min(3,UI.ap.photos+1);render();return;
    case 'apSubmit':{keepAp();const a=UI.ap;let bad=null;
      ['e-an','e-ap','e-ag'].forEach(id=>$(id).textContent='');
      if(!a.name.trim()){$('e-an').textContent='이름을 입력해 주세요.';bad=bad||'an';}
      const dg=a.phone.replace(/\D/g,'');if(dg.length<10||dg.length>11){$('e-ap').textContent='휴대폰 번호를 숫자 10~11자리로 입력해 주세요.';bad=bad||'ap';}
      if(!a.agree){$('e-ag').textContent='개인정보 수집·이용에 동의해야 신청할 수 있습니다.';bad=bad||'ag';}
      if(bad){$(bad).focus();return;}
      withLoading('상담 신청 보내는 중...',()=>{const q=UI.q,has=q.state==='done';const n=S.leads.filter(l=>l.id.indexOf('C-1014')===0).reduce((m,l)=>Math.max(m,+l.id.slice(-2)),0)+1;const id='C-1014-'+pad(n);
        const lead={id,at:nowStr(),name:a.name.trim().charAt(0)+'○○',ph4:dg.slice(-4),full:dg,cx:has?q.cx:'HB3',dong:has?q.dong:'-',ho:has?q.ho:'-',rooms:has?q.rooms.slice():['lv'],pk:has?q.pk:1,items:quoteItems(has?q.rooms:['lv'],has?q.pk:1),st:'접수',vendor:'',memo:'',photos:a.photos,time:a.time,
          sub:UI.sub.res?{score:UI.sub.res.score,range:UI.sub.res.range}:null,chat:UI.chat.msgs.slice(1).map(m=>[m.who,m.t]),hist:[{at:nowStr(),t:'상담 신청 접수 (고객 웹)'+(has?' · AI 견적 첨부':'')}],src:has?'AI 견적':'직접 신청'};
        S.leads.unshift(lead);S.my.leads.unshift(id);UI.m.fresh=id;
        const lq=S.logs.find(x=>x.mod==='q'&&!x.lead&&x.at>='2026-10-14 '+'00');if(has&&lq)lq.lead=id;
        a.done=id;toast('상담 신청이 접수되었습니다.');render();},550);return;}
    case 'csv': withLoading('CSV 만드는 중...',exportCSV,450);return;
    case 'fltReset': UI.m.flt={per:'m',st:'',kw:''};render();return;
    case 'alogReset': UI.m.alog={mod:'',res:''};render();return;
  }
});
function keepAp(){const a=UI.ap;const n=$('an'),p=$('ap'),t=$('at'),g=$('ag');if(n)a.name=n.value;if(p)a.phone=p.value;if(t)a.time=t.value;if(g)a.agree=g.checked;}
document.addEventListener('change',(e)=>{
  const i=e.target,d=i.dataset;
  if(d.q){UI.q[d.q]=i.value;render();const n=$(i.id);if(n)n.focus();return;}
  if(d.pk){UI.q.pk=+d.pk;const s=S.my.quotes[0];if(s){s.pk=UI.q.pk;s.total=qTotal(quoteItems(UI.q.rooms,UI.q.pk));}render();return;}
  if(d.sub){UI.sub[{sh:'h',sd:'d',sa:'a'}[i.id]]=i.value;if(UI.sub.state==='done')UI.sub.state='idle';render();const n=$(i.id);if(n)n.focus();return;}
  if(d.flt){UI.m.flt[d.flt]=i.value;withLoading('조회 중...',render,300);return;}
  if(d.alog){UI.m.alog[d.alog]=i.value;withLoading('조회 중...',render,300);return;}
  if(i.id==='ag'){UI.ap.agree=i.checked;return;}
});
window.addEventListener('hashchange',route);
route();
})();
