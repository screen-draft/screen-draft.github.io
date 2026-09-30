(function(){
"use strict";

const ic=(n)=>'<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-'+n+'"/></svg>';
const esc=(s)=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=(id)=>document.getElementById(id);
const clone=(o)=>JSON.parse(JSON.stringify(o));
const DAY=86400000;
const today=new Date(); today.setHours(0,0,0,0);
const dstr=(d)=>{const x=new Date(d);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');};
const TODAY=dstr(today);
const addDays=(n)=>dstr(today.getTime()+n*DAY);

/* ===== 측정 항목 (예시): 5개 부위 x 6개 지표 = 30개 수치 ===== */
const ZONES=['이마','왼쪽 볼','오른쪽 볼','코','턱'];
const METRICS=[
  {k:'moist',l:'수분',dir:'high'},
  {k:'oil',l:'유분',dir:'range'},
  {k:'pore',l:'모공',dir:'low'},
  {k:'wrinkle',l:'주름',dir:'low'},
  {k:'pig',l:'색소',dir:'low'},
  {k:'red',l:'홍조',dir:'low'}
];
const DIR_LABEL={high:'높을수록 좋음',low:'낮을수록 좋음',range:'적정 범위'};

const SEED_CFG={
  weights:{moist:20,oil:15,pore:15,wrinkle:20,pig:15,red:15},
  oilRange:[40,60],
  grades:[{min:85,l:'매우 좋음'},{min:70,l:'좋음'},{min:55,l:'보통'},{min:0,l:'관리 필요'}],
  show:{moist:true,oil:true,pore:true,wrinkle:true,pig:true,red:true},
  zoneTable:true, prevCompare:true
};
const V=(rows)=>rows.map(r=>r.slice());
const SEED={
  cfg:SEED_CFG,
  recs:[
    {id:'R-01',chart:'C-20412',name:'김○○',age:'30대',sex:'여',time:'09:42',dev:'진단기 1',printed:true,
     values:V([[52,58,31,22,28,19],[48,44,36,26,34,27],[47,45,35,27,33,25],[44,71,48,18,22,31],[50,52,33,24,26,20]]),
     src:'server', prev:{date:addDays(-42),total:68,scores:{moist:44,oil:86,pore:60,wrinkle:70,pig:66,red:70}},
     clinic:{type:'복합성',concerns:['모공','색소'],opinion:'T존 유분이 높고 양 볼 색소가 지난 방문보다 옅어졌습니다.\n보습 위주 관리를 이어가고 4주 뒤 재촬영을 권합니다.',care:['수분 관리','색소 관리'],next:addDays(28),doctor:'원장'}},
    {id:'R-02',chart:'C-18857',name:'이○○',age:'40대',sex:'여',time:'10:15',dev:'진단기 1',printed:false,
     values:V([[41,39,38,41,37,24],[38,33,42,45,44,36],[39,34,41,44,46,35],[36,55,52,30,30,33],[40,37,39,38,35,28]]),
     src:'file', prev:null,
     clinic:{type:'',concerns:[],opinion:'',care:[],next:'',doctor:'원장'}},
    {id:'R-03',chart:'C-21093',name:'박○○',age:'20대',sex:'남',time:'10:48',dev:'진단기 2',printed:false,
     values:V([[55,68,44,12,18,21],[53,57,40,14,20,24],[54,58,41,13,19,23],[null,null,null,null,null,null],[null,null,null,null,null,null]]),
     src:'manual', prev:null,
     clinic:{type:'',concerns:[],opinion:'',care:[],next:'',doctor:'원장'}},
    {id:'R-04',chart:'C-21104',name:'최○○',age:'50대',sex:'여',time:'11:20',dev:'진단기 1',printed:false,
     values:ZONES.map(()=>METRICS.map(()=>null)),
     src:null, prev:{date:addDays(-90),total:61,scores:{moist:36,oil:88,pore:58,wrinkle:52,pig:55,red:67}},
     clinic:{type:'',concerns:[],opinion:'',care:[],next:'',doctor:'원장'}}
  ]
};
/* 총판 서버 응답을 흉내 낸 예시 값 (R-04) */
const SERVER_RESP={'R-04':[[39,47,42,46,43,31],[35,40,45,51,49,38],[36,41,44,50,50,36],[33,58,54,40,37,35],[37,45,40,44,41,30]]};
const PASTE_SAMPLE='[촬영 결과] C-21093  '+TODAY+' 10:48\n부위\t수분\t유분\t모공\t주름\t색소\t홍조\n이마\t55\t68\t44\t12\t18\t21\n왼쪽 볼\t53\t57\t40\t14\t20\t24\n오른쪽 볼\t54\t58\t41\t13\t19\t23\n코\t49\t74\t56\t10\t15\t27\n턱\t56\t61\t42\t12\t17\t22';

let S=clone(SEED);

/* ===== 본원 산식: 계산은 이 함수 한 곳에서만 ===== */
function metricScore(m,avg,cfg){
  if(m.dir==='high') return avg;
  if(m.dir==='low') return 100-avg;
  const [lo,hi]=cfg.oilRange; const dist=avg<lo?lo-avg:avg>hi?avg-hi:0;
  return Math.max(0,100-dist*3);
}
function calc(values,cfg){
  cfg=cfg||S.cfg;
  const res={metrics:{},total:null,grade:null,filled:0};
  values.forEach(r=>r.forEach(v=>{if(v!=null&&v!=='') res.filled++;}));
  if(res.filled<ZONES.length*METRICS.length) return res;
  let sum=0, wsum=0;
  METRICS.forEach((m,j)=>{
    const avg=values.reduce((a,r)=>a+Number(r[j]),0)/ZONES.length;
    const score=Math.round(metricScore(m,avg,cfg));
    res.metrics[m.k]={avg:Math.round(avg*10)/10,score};
    const w=Number(cfg.weights[m.k])||0; sum+=score*w; wsum+=w;
  });
  res.total=wsum?Math.round(sum/wsum):0;
  res.grade=(cfg.grades.find(g=>res.total>=g.min)||cfg.grades[cfg.grades.length-1]).l;
  return res;
}
function valueError(v){
  if(v===''||v==null) return '';
  const n=Number(v);
  if(!Number.isFinite(n)) return '숫자가 아닙니다';
  if(n<0||n>100) return '0~100 범위를 벗어났습니다';
  return '';
}

/* ===== state & routing ===== */
const UI={view:'list',id:null,step:'data',srcTab:null,q:'',guideOpen:null,guideStep:null,paste:'',fileLoaded:null,cfgDraft:null};
function go(path){const h='#/'+path; if(location.hash===h) route(); else location.hash=h;}
function route(){
  const p=location.hash.replace(/^#\/?/,'').split('/').filter(Boolean);
  if(p[0]==='rec'&&S.recs.find(r=>r.id===p[1])){UI.view='rec';UI.id=p[1];UI.step=['data','clinic','report'].indexOf(p[2])>=0?p[2]:'data';}
  else if(p[0]==='settings'){UI.view='settings';UI.id=null;}
  else {UI.view='list';UI.id=null;}
  if(Date.now()-(toast.at||0)>300) $('toastHost').innerHTML='';
  render(); window.scrollTo(0,0);
}

function toast(msg,kind){toast.at=Date.now();const h=$('toastHost');h.innerHTML='<div class="toast'+(kind==='bad'?' bad':'')+'" role="status">'+ic(kind==='bad'?'alert':'check')+'<span>'+esc(msg)+'</span></div>';clearTimeout(toast.t);toast.t=setTimeout(()=>{h.innerHTML='';},3200);}
let busy=false;
function withLoading(msg,fn){if(busy)return;busy=true;$('overlayHost').innerHTML='<div class="overlay" role="status" aria-live="assertive"><div class="ob"><span class="spin" aria-hidden="true"></span><span>'+esc(msg)+'</span></div></div>';setTimeout(()=>{$('overlayHost').innerHTML='';busy=false;fn();},480);}
const st=(t,k)=>'<span class="st '+k+'">'+esc(t)+'</span>';
const btn=(o)=>'<button type="button" class="btn '+(o.cls||'')+(o.iconM?' icon-m':'')+'"'+(o.iconM?' data-tip="'+esc(o.label)+'" aria-label="'+esc(o.label)+'"':'')+' '+(o.attrs||'')+'>'+(o.icon?ic(o.icon):'')+'<span class="lbl">'+esc(o.label)+'</span></button>';
const empty=(i,t,d,b)=>'<div class="empty">'+ic(i)+'<strong>'+esc(t)+'</strong><p>'+esc(d)+'</p>'+(b||'')+'</div>';

function recState(r){
  const c=calc(r.values);
  const total=ZONES.length*METRICS.length;
  const data=c.filled===0?['수치 미수신','mute']:c.filled<total?['입력 중 '+c.filled+'/'+total,'warn']:['수치 완료','ok'];
  const clinicDone=!!(r.clinic.type&&r.clinic.opinion.trim());
  const rep=r.printed?['출력 완료','ok']:(c.total!=null&&clinicDone)?['출력 대기','info']:['작성 전','mute'];
  return {c,data,clinicDone,rep};
}
const SRC_LABEL={server:'총판 서버',file:'파일',manual:'직접 입력'};

/* ===== shell ===== */
function renderShell(){
  $('who').textContent='원내 PC 1 / '+TODAY;
  const waiting=S.recs.filter(r=>!r.printed).length;
  $('side').innerHTML=
    '<a href="#/list"'+(UI.view!=='settings'?' aria-current="page"':'')+'>'+ic('list')+'오늘 촬영 목록'+(waiting?'<span class="cnt">'+waiting+'</span>':'')+'</a>'+
    '<a href="#/settings"'+(UI.view==='settings'?' aria-current="page"':'')+'>'+ic('settings')+'산식·출력 설정</a>';
}

/* ===== list ===== */
function viewList(){
  const q=UI.q.trim();
  const rows=S.recs.filter(r=>!q||(r.chart+r.name).indexOf(q)>=0);
  const body=rows.length?'<div class="tw rl"><table class="t"><thead><tr><th>촬영</th><th>차트번호</th><th>고객</th><th>진단기</th><th>수치</th><th>원내 입력</th><th>보고서</th><th></th></tr></thead><tbody>'+
    rows.map(r=>{const s=recState(r);
      return '<tr><td data-k="촬영" class="num">'+r.time+'</td><td class="stc">'+st(s.rep[0],s.rep[1])+'</td>'+
      '<td class="full"><button type="button" class="idlink" data-open="'+r.id+'">'+r.chart+'</button> <span>'+esc(r.name)+' / '+r.age+' '+r.sex+'</span></td>'+
      '<td data-k="진단기" class="hide-m">'+r.dev+'</td>'+
      '<td data-k="수치">'+st(s.data[0],s.data[1])+(r.src?' <span class="small">'+SRC_LABEL[r.src]+'</span>':'')+'</td>'+
      '<td data-k="원내 입력">'+(s.clinicDone?st('완료','ok'):st('미입력','mute'))+'</td>'+
      '<td class="hide-m">'+st(s.rep[0],s.rep[1])+'</td>'+
      '<td class="r">'+btn({cls:'sm',icon:'right',label:'열기',attrs:'data-open="'+r.id+'"'})+'</td></tr>';}).join('')+
    '</tbody></table></div>'
    :empty('search','찾는 촬영 기록이 없습니다','차트번호나 고객명 앞 글자로 다시 찾아보세요.','<button type="button" class="btn" data-act="clearQ">검색 지우기</button>');
  return '<div class="ph"><div><div class="crumb">촬영 목록</div><h1>오늘 촬영 목록</h1><div class="sub">촬영 건을 열어 수치 확인, 원내 입력, 보고서 출력 순서로 진행합니다.</div></div></div>'+
    '<div class="bar"><div class="search">'+ic('search')+'<label class="sr" for="qs">차트번호 검색</label><input id="qs" class="f" type="search" placeholder="차트번호, 고객명" value="'+esc(UI.q)+'"></div><span class="grow"></span><span class="small">'+TODAY+' 촬영 '+S.recs.length+'건</span></div>'+body;
}

/* ===== record ===== */
function recHead(r){
  return '<div class="rec-head"><span><b>'+r.chart+'</b> '+esc(r.name)+'</span><span>'+r.age+' / '+r.sex+'</span><span>촬영 '+TODAY+' '+r.time+'</span><span>'+r.dev+'</span>'+(r.prev?'<span>이전 방문 '+r.prev.date+'</span>':'<span>첫 방문</span>')+'</div>';
}
function stepBar(r){
  const s=recState(r);
  const items=[['data','수치 가져오기',s.c.total!=null],['clinic','원내 입력',s.clinicDone],['report','보고서 출력',r.printed]];
  return '<div class="steps" role="tablist">'+items.map((it,i)=>'<button type="button" role="tab" data-step="'+it[0]+'"'+(UI.step===it[0]?' aria-current="step" aria-selected="true"':' aria-selected="false"')+'><span class="n">'+(i+1)+'</span>'+it[1]+(it[2]?'<span class="done">'+ic('check')+'</span>':'')+'</button>').join('')+'</div>';
}
function viewRec(){
  const r=S.recs.find(x=>x.id===UI.id);
  const s=recState(r);
  const head='<div class="ph"><div><div class="crumb">촬영 목록 &gt; '+r.chart+'</div><h1>'+r.chart+' 진단 결과 '+st(s.rep[0],s.rep[1])+'</h1></div><div class="ph-actions"><button type="button" class="btn" data-go="list">'+ic('left')+'목록</button></div></div>';
  const body={data:stepData,clinic:stepClinic,report:stepReport}[UI.step](r);
  return head+recHead(r)+stepBar(r)+body;
}

/* step 1: data */
function stepData(r){
  const tab=UI.srcTab||r.src||'server';
  const tabs=[['server','server','총판 서버에서 조회','촬영 기록을 차트번호로 조회합니다'],['file','file','파일 가져오기','총판 프로그램이 내보낸 CSV, 엑셀'],['manual','keyboard','직접 입력, 붙여넣기','결과지 수치를 복사해 붙여넣습니다']];
  let src='';
  if(tab==='server'){
    src='<div class="bar"><span class="small">조회 조건: 차트번호 '+r.chart+', 촬영일 '+TODAY+'</span><span class="grow"></span>'+btn({cls:'pri',icon:'refresh',label:'촬영 기록 조회',attrs:'data-act="fetch"'})+'</div>'+
      '<p class="note warn" style="margin:0 0 12px">'+ic('alert')+'총판 서버 조회는 총판 개발자와 협의해 가능 여부를 확정합니다. 어렵다면 파일 가져오기나 직접 입력으로 같은 보고서를 만듭니다. 시연에서는 예시 응답을 채웁니다.</p>';
  } else if(tab==='file'){
    src='<div class="bar">'+btn({icon:'file',label:'파일 선택',attrs:'data-act="file"'})+'<span class="small">'+(UI.fileLoaded?esc(UI.fileLoaded):'선택된 파일 없음')+'</span></div>'+
      (UI.fileLoaded?'<p class="note warn" style="margin:0 0 12px">'+ic('alert')+'30개 중 29개를 읽었습니다. 비어 있는 칸(턱, 홍조)은 결과지를 보고 직접 채워 주세요.</p>':'<p class="note" style="margin:0 0 12px">'+ic('file')+'열 순서가 달라도 첫 줄의 항목 이름으로 맞춰 읽습니다. 양식은 총판에서 받을 수 있는 형태로 정합니다.</p>');
  } else {
    src='<label for="pasteBox" class="small" style="display:block;margin-bottom:4px">결과지나 총판 프로그램 화면에서 표를 복사해 붙여넣으면 부위 순서대로 채웁니다.</label>'+
      '<textarea id="pasteBox" class="f" rows="6" placeholder="여기에 붙여넣기">'+esc(UI.paste)+'</textarea>'+
      '<div class="acts" style="margin-top:6px;justify-content:flex-start">'+btn({icon:'clipboard',label:'붙여넣은 값 채우기',attrs:'data-act="paste"'})+btn({icon:'eraser',label:'표 비우기',iconM:true,attrs:'data-act="clearVals"'})+'</div>';
  }
  const c=calc(r.values); const total=ZONES.length*METRICS.length;
  return '<h2 class="sh">수치를 가져올 방법</h2><div class="src" role="group" aria-label="수치를 가져올 방법">'+tabs.map(t=>'<button type="button" data-src="'+t[0]+'" aria-pressed="'+(tab===t[0])+'">'+ic(t[1])+'<span><b>'+t[2]+'</b><span>'+t[3]+'</span></span></button>').join('')+'</div>'+src+
    '<h2 class="sh">측정 수치 <span class="meta">5개 부위 x 6개 지표, 0~100</span><span class="fillcount" id="fillCount">채운 칸 <b>'+c.filled+'</b> / '+total+'</span></h2>'+
    '<div class="tw"><table class="vg"><thead><tr><th>부위</th>'+METRICS.map(m=>'<th>'+m.l+'</th>').join('')+'</tr></thead><tbody>'+
    ZONES.map((z,i)=>'<tr><th>'+z+'</th>'+METRICS.map((m,j)=>{const v=r.values[i][j];const e=valueError(v);
      return '<td><input inputmode="decimal" id="v-'+i+'-'+j+'" data-v="'+i+'-'+j+'" value="'+(v==null?'':esc(v))+'" aria-label="'+z+' '+m.l+'"'+(e?' class="invalid" aria-invalid="true" title="'+e+'"':(v!=null&&r.src&&r.src!=='manual'?' class="imported"':''))+'></td>';}).join('')+'</tr>').join('')+
    '</tbody><tfoot><tr><th>평균</th>'+METRICS.map(m=>'<td class="avg" id="avg-'+m.k+'">'+(c.metrics[m.k]?c.metrics[m.k].avg:'-')+'</td>').join('')+'</tr></tfoot></table></div>'+
    '<p class="note" id="valMsg" role="status">'+valMsg(r,c)+'</p>'+
    '<div class="acts">'+btn({cls:'pri',icon:'right',label:'원내 입력으로',attrs:'data-act="toClinic" id="toClinic"'+(c.total==null||hasErr(r)?' disabled':'')})+'</div>';
}
function hasErr(r){return r.values.some(row=>row.some(v=>valueError(v)));}
function refreshData(){
  const r=S.recs.find(x=>x.id===UI.id); const c=calc(r.values);
  const f=$('fillCount'); if(f) f.innerHTML='채운 칸 <b>'+c.filled+'</b> / '+ZONES.length*METRICS.length;
  METRICS.forEach(m=>{const a=$('avg-'+m.k); if(a) a.textContent=c.metrics[m.k]?c.metrics[m.k].avg:'-';});
  const b=$('toClinic'); if(b) b.disabled=c.total==null||hasErr(r);
  const m=$('valMsg'); if(m) m.innerHTML=valMsg(r,c);
}
function valMsg(r,c){
  const errs=[]; r.values.forEach((row,i)=>row.forEach((v,j)=>{const e=valueError(v); if(e) errs.push(ZONES[i]+' '+METRICS[j].l+': '+e);}));
  const blank=ZONES.length*METRICS.length-c.filled;
  if(errs.length) return ic('alert')+errs.slice(0,3).join(' / ')+(errs.length>3?' 외 '+(errs.length-3)+'건':'');
  if(blank) return ic('alert')+'빈 칸 '+blank+'개를 채우면 다음 단계로 넘어갈 수 있습니다.';
  return ic('check')+'30개 수치가 모두 확인되었습니다.';
}

/* step 2: clinic */
const TYPES=['건성','중성','지성','복합성','민감성'];
const CONCERNS=['건조','유분','모공','주름','색소','홍조','트러블'];
const CARES=['수분 관리','진정 관리','색소 관리','모공 관리','탄력 관리','홈케어 안내'];
function stepClinic(r){
  const c=calc(r.values);
  if(c.total==null) return empty('keyboard','측정 수치를 먼저 채워 주세요','30개 수치가 모두 있어야 본원 산식으로 점수를 계산할 수 있습니다.','<button type="button" class="btn pri" data-step="data">수치 가져오기로</button>');
  const k=r.clinic;
  return '<h2 class="sh">원내 입력 <span class="meta">보고서에 함께 인쇄됩니다</span></h2>'+
    '<div class="form">'+
    '<div class="lab" id="lb-type">피부 타입<span class="req" aria-hidden="true">*</span></div><div class="fv" role="radiogroup" aria-labelledby="lb-type">'+TYPES.map(t=>'<label class="chk"><input type="radio" name="ctype" value="'+t+'"'+(k.type===t?' checked':'')+'>'+t+'</label>').join('')+'</div>'+
    '<div class="lab" id="lb-con">주요 고민</div><div class="fv" role="group" aria-labelledby="lb-con">'+CONCERNS.map(t=>'<label class="chk"><input type="checkbox" name="ccon" value="'+t+'"'+(k.concerns.indexOf(t)>=0?' checked':'')+'>'+t+'</label>').join('')+'</div>'+
    '<label for="cop">원장 소견<span class="req" aria-hidden="true">*</span></label><div class="fv"><textarea id="cop" class="f" rows="4" placeholder="보고서에 인쇄될 소견을 적어 주세요">'+esc(k.opinion)+'</textarea></div>'+
    '<div class="lab" id="lb-care">권장 관리</div><div class="fv" role="group" aria-labelledby="lb-care">'+CARES.map(t=>'<label class="chk"><input type="checkbox" name="ccare" value="'+t+'"'+(k.care.indexOf(t)>=0?' checked':'')+'>'+t+'</label>').join('')+'</div>'+
    '<label for="cnext">다음 방문 권장일</label><div class="fv"><input type="date" id="cnext" class="f" value="'+esc(k.next)+'"><span class="small">비우면 보고서에 표시하지 않습니다</span></div>'+
    '</div>'+
    '<p class="note">'+ic('check')+'본원 산식 적용 결과: 종합 '+c.total+'점 ('+c.grade+'). 계산식은 산식·출력 설정에서 바꿀 수 있습니다.</p>'+
    '<div class="acts">'+btn({icon:'left',label:'수치 가져오기',iconM:true,attrs:'data-step="data"'})+btn({cls:'pri',icon:'check',label:'저장하고 보고서 보기',attrs:'data-act="saveClinic"'})+'</div>';
}

/* step 3: report */
function reportHTML(r){
  const cfg=S.cfg, c=calc(r.values,cfg), k=r.clinic;
  const shown=METRICS.filter(m=>cfg.show[m.k]);
  const prev=cfg.prevCompare&&r.prev;
  const bars=shown.map(m=>{const sc=c.metrics[m.k].score;const pv=prev?r.prev.scores[m.k]:null;const d=pv==null?'':(sc-pv>0?'+':'')+(sc-pv);
    return '<div class="brow"><span>'+m.l+'</span><span class="track"><span class="fill" style="width:'+sc+'%"></span>'+(pv!=null?'<span class="prev" style="left:calc('+pv+'% - 1px)"></span>':'')+'</span><b>'+sc+'</b><span class="delta">'+(d?d:'')+'</span></div>';}).join('');
  const zt=cfg.zoneTable?'<div class="sec"><h3>부위별 측정 수치</h3><table class="z"><thead><tr><th>부위</th>'+shown.map(m=>'<th>'+m.l+'</th>').join('')+'</tr></thead><tbody>'+
    ZONES.map((z,i)=>'<tr><th>'+z+'</th>'+shown.map(m=>{const j=METRICS.indexOf(m);return '<td>'+r.values[i][j]+'</td>';}).join('')+'</tr>').join('')+
    '<tr><th>평균</th>'+shown.map(m=>'<td class="hl">'+c.metrics[m.k].avg+'</td>').join('')+'</tr></tbody></table></div>':'';
  return '<article class="a4" aria-label="A4 보고서 미리보기">'+
    '<div class="hd"><h2>피부 진단 결과 보고서</h2><span class="logo"><span class="mk" aria-hidden="true"></span>하늘 피부과 의원</span></div>'+
    '<div class="pinfo"><div class="k">차트번호</div><div class="v">'+r.chart+'</div><div class="k">성명</div><div class="v">'+esc(r.name)+'</div><div class="k">연령·성별</div><div class="v">'+r.age+' / '+r.sex+'</div><div class="k">촬영일</div><div class="v">'+TODAY+'</div>'+
    '<div class="k">피부 타입</div><div class="v">'+esc(k.type||'-')+'</div><div class="k">주요 고민</div><div class="v">'+esc(k.concerns.join(', ')||'-')+'</div><div class="k">진단기</div><div class="v">'+r.dev+'</div><div class="k">담당</div><div class="v">'+esc(k.doctor)+'</div></div>'+
    '<div class="score"><div class="total"><div class="k">종합 점수</div><div class="v">'+c.total+'</div><span class="g">'+c.grade+'</span>'+(prev?'<div class="p">이전 방문 '+r.prev.date+' '+r.prev.total+'점</div>':'')+'</div>'+
    '<div><h3>지표별 점수</h3><div class="bars">'+bars+'</div>'+(prev?'<div class="legend"><span><i></i>이번 점수</span><span><i class="pv"></i>이전 방문</span><span>오른쪽 숫자는 이전 대비 변화</span></div>':'')+'</div></div>'+
    zt+
    '<div class="sec"><h3>원장 소견</h3><div class="op">'+esc(k.opinion||'')+'</div></div>'+
    '<div class="sec"><div class="kv"><div class="k">권장 관리</div><div>'+esc(k.care.join(', ')||'-')+'</div><div class="k">다음 방문</div><div>'+esc(k.next||'-')+'</div></div></div>'+
    '<div class="ft"><span>점수는 본원 산식(예시)으로 계산했으며 진단서가 아닙니다.</span><span>하늘 피부과 의원</span></div>'+
  '</article>';
}
function stepReport(r){
  const s=recState(r);
  if(s.c.total==null) return empty('keyboard','측정 수치를 먼저 채워 주세요','30개 수치가 모두 있어야 보고서를 만들 수 있습니다.','<button type="button" class="btn pri" data-step="data">수치 가져오기로</button>');
  const warn=!s.clinicDone?'<p class="note warn" style="margin:0 0 12px">'+ic('alert')+'원내 입력(피부 타입, 원장 소견)이 비어 있습니다. 그대로 인쇄하면 해당 칸이 비어서 나갑니다.</p>':'';
  return warn+'<div class="bar"><span class="small">A4 1장, 일반 프린터 기준. 출력 항목은 산식·출력 설정에서 고릅니다.</span><span class="grow"></span>'+
    btn({icon:'settings',label:'출력 항목 설정',iconM:true,attrs:'data-go="settings"'})+btn({cls:'pri',icon:'printer',label:r.printed?'다시 인쇄':'인쇄',attrs:'data-act="print"'})+'</div>'+
    '<div class="a4wrap" id="a4wrap"><div class="a4scale" id="a4scale">'+reportHTML(r)+'</div></div>';
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

/* ===== settings ===== */
function viewSettings(){
  const d=UI.cfgDraft||(UI.cfgDraft=clone(S.cfg));
  const wsum=METRICS.reduce((a,m)=>a+(Number(d.weights[m.k])||0),0);
  const sample=S.recs[0]; const before=calc(sample.values,S.cfg), after=calc(sample.values,d);
  return '<div class="ph"><div><div class="crumb">설정</div><h1>산식·출력 설정</h1><div class="sub">본원 산식과 보고서에 인쇄할 항목을 정합니다. 저장 전에 적용 예시로 결과를 확인합니다.</div></div></div>'+
    '<div class="two"><div>'+
    '<h2 class="sh">지표별 가중치와 출력 여부</h2><div class="tw"><table class="t"><thead><tr><th>지표</th><th>점수 방향</th><th class="r">가중치(%)</th><th class="c">보고서 표시</th></tr></thead><tbody>'+
    METRICS.map(m=>'<tr><td>'+m.l+'</td><td>'+DIR_LABEL[m.dir]+(m.dir==='range'?' <span class="small">('+d.oilRange[0]+'~'+d.oilRange[1]+')</span>':'')+'</td><td class="r"><label class="sr" for="w-'+m.k+'">'+m.l+' 가중치</label><input class="f w" type="number" min="0" max="100" id="w-'+m.k+'" data-w="'+m.k+'" value="'+d.weights[m.k]+'"></td><td class="c"><label class="chk" style="justify-content:center"><input type="checkbox" data-show="'+m.k+'"'+(d.show[m.k]?' checked':'')+' aria-label="'+m.l+' 보고서 표시"></label></td></tr>').join('')+
    '</tbody><tfoot><tr><td colspan="2"><b>합계</b></td><td class="r"><b class="num" id="wsum" style="color:'+(wsum===100?'var(--ok)':'var(--bad)')+'">'+wsum+'</b></td><td></td></tr></tfoot></table></div>'+
    '<p class="note'+(wsum===100?'':' warn')+'" id="wmsg">'+ic(wsum===100?'check':'alert')+(wsum===100?'가중치 합계가 100입니다.':'가중치 합계가 100이 되어야 저장할 수 있습니다.')+'</p>'+
    '<h2 class="sh">등급 구간</h2><div class="tw"><table class="t"><thead><tr><th>등급</th><th class="r">종합 점수 이상</th></tr></thead><tbody>'+
    d.grades.map((g,i)=>'<tr><td>'+g.l+'</td><td class="r">'+(i===d.grades.length-1?'<span class="num">0</span>':'<label class="sr" for="g-'+i+'">'+g.l+' 기준 점수</label><input class="f w" type="number" min="0" max="100" id="g-'+i+'" data-g="'+i+'" value="'+g.min+'">')+'</td></tr>').join('')+'</tbody></table></div>'+
    '<h2 class="sh">보고서 구성</h2><div class="form"><div class="lab">부위별 수치 표</div><div class="fv"><label class="chk"><input type="checkbox" id="optZone"'+(d.zoneTable?' checked':'')+'>인쇄</label></div><div class="lab">이전 방문 비교</div><div class="fv"><label class="chk"><input type="checkbox" id="optPrev"'+(d.prevCompare?' checked':'')+'>인쇄 (이전 기록이 있을 때)</label></div></div>'+
    '</div><div>'+
    '<h2 class="sh">적용 예시 <span class="meta">'+sample.chart+' 촬영 수치</span></h2><div class="tw"><table class="t"><thead><tr><th>지표</th><th class="r">평균</th><th class="r">현재 산식</th><th class="r">변경안</th></tr></thead><tbody>'+
    METRICS.map(m=>'<tr><td>'+m.l+'</td><td class="r">'+before.metrics[m.k].avg+'</td><td class="r">'+before.metrics[m.k].score+'</td><td class="r">'+after.metrics[m.k].score+'</td></tr>').join('')+
    '</tbody><tfoot><tr><td colspan="2"><b>종합 점수 / 등급</b></td><td class="r"><b>'+before.total+'</b> '+before.grade+'</td><td class="r" id="afterTotal"><b>'+after.total+'</b> '+after.grade+'</td></tr></tfoot></table></div>'+
    '<h2 class="sh">수치 받는 방법 <span class="meta">총판 협의 후 확정</span></h2><div class="tw"><table class="t"><tbody>'+
    '<tr><td>총판 서버 조회</td><td>'+st('협의 중','warn')+'</td><td class="small">조회 방법이 있으면 촬영 후 바로 채움</td></tr>'+
    '<tr><td>파일 가져오기</td><td>'+st('사용 가능','ok')+'</td><td class="small">CSV, 엑셀 내보내기를 받을 수 있을 때</td></tr>'+
    '<tr><td>직접 입력, 붙여넣기</td><td>'+st('사용 가능','ok')+'</td><td class="small">어떤 경우에도 보고서 발행 가능</td></tr>'+
    '</tbody></table></div>'+
    '</div></div>'+
    '<div class="acts">'+btn({icon:'refresh',label:'되돌리기',iconM:true,attrs:'data-act="cfgReset"'})+btn({cls:'pri',icon:'check',label:'설정 저장',attrs:'data-act="cfgSave"'+(wsum===100?'':' disabled')})+'</div>';
}

/* ===== guide ===== */
const GUIDE=[
  {k:'g1',t:'총판 서버에서 수치 조회',d:'차트번호로 촬영 기록 30개 수치를 채웁니다.'},
  {k:'g2',t:'결과지 붙여넣기',d:'연동이 안 되어도 복사해 붙여넣으면 채워집니다.'},
  {k:'g3',t:'원내 입력과 산식 적용',d:'피부 타입, 소견을 넣으면 본원 산식 점수가 나옵니다.'},
  {k:'g4',t:'A4 보고서 인쇄',d:'이전 방문 대비 변화까지 1장에 담습니다.'},
  {k:'g5',t:'산식·출력 항목 설정',d:'가중치를 바꾸면 적용 예시로 먼저 확인합니다.'}
];
function renderGuide(){
  const g=$('guide');
  if(UI.guideOpen===null) UI.guideOpen=window.matchMedia('(min-width:1101px)').matches;
  g.className='guide'+(UI.guideOpen?'':' closed');
  document.body.classList.toggle('guide-open',!!UI.guideOpen);
  g.innerHTML='<button type="button" class="gh" data-act="toggleGuide" aria-expanded="'+UI.guideOpen+'" aria-controls="guideList"><span>시연 안내</span>'+ic(UI.guideOpen?'down':'up')+'</button>'+
    '<ol id="guideList">'+GUIDE.map((s,i)=>'<li><button type="button" data-guide="'+s.k+'"'+(UI.guideStep===s.k?' aria-current="step"':'')+'><b><span class="n">'+(i+1)+'.</span>'+s.t+'</b>'+(UI.guideStep===s.k?'<span class="d">'+s.d+'</span>':'')+'</button></li>').join('')+'</ol>';
}
function guide(k){
  UI.guideStep=k; if(window.matchMedia('(max-width:1100px)').matches) UI.guideOpen=false;
  if(k==='g1'){UI.srcTab='server';go('rec/R-04/data');}
  if(k==='g2'){UI.srcTab='manual';UI.paste=PASTE_SAMPLE;go('rec/R-03/data');}
  if(k==='g3'){go('rec/R-02/clinic');}
  if(k==='g4'){go('rec/R-01/report');}
  if(k==='g5'){UI.cfgDraft=null;go('settings');}
}

/* ===== render ===== */
function render(){
  renderShell();
  $('main').innerHTML=UI.view==='rec'?viewRec():UI.view==='settings'?viewSettings():viewList();
  renderGuide();
  if(UI.view==='rec'&&UI.step==='report') requestAnimationFrame(fitA4);
}

/* ===== events ===== */
function curRec(){return S.recs.find(x=>x.id===UI.id);}
document.addEventListener('click',(e)=>{
  const t=e.target.closest('button'); if(!t) return; const d=t.dataset;
  if(d.guide){guide(d.guide);return;}
  if(d.open){UI.srcTab=null;UI.fileLoaded=null;UI.paste='';go('rec/'+d.open+'/data');return;}
  if(d.go){go(d.go);return;}
  if(d.step){go('rec/'+UI.id+'/'+d.step);return;}
  if(d.src){UI.srcTab=d.src;render();return;}
  const r=curRec();
  switch(d.act){
    case 'toggleGuide': UI.guideOpen=!UI.guideOpen; renderGuide(); return;
    case 'clearQ': UI.q=''; render(); return;
    case 'fetch':
      withLoading('총판 서버에서 촬영 기록 조회 중...',()=>{
        const resp=SERVER_RESP[r.id];
        if(resp){r.values=clone(resp);r.src='server';toast('촬영 기록 30개 수치를 받았습니다.');}
        else if(calc(r.values).filled===30){toast('이미 수치가 채워져 있습니다. 다시 받으려면 표를 비운 뒤 조회하세요.');}
        else {toast('이 촬영 건은 서버에 기록이 없습니다. 파일이나 직접 입력으로 채워 주세요.','bad');}
        render();});
      return;
    case 'file':
      withLoading('파일 읽는 중...',()=>{
        const base=[[48,52,39,31,36,24],[45,41,43,35,40,31],[46,42,42,34,41,30],[42,66,55,24,27,34],[47,49,41,30,33,null]];
        r.values=clone(base); r.src='file'; UI.fileLoaded='촬영결과_'+r.chart+'_'+TODAY.replace(/-/g,'')+'.csv';
        toast('파일에서 29개 수치를 읽었습니다. 빈 칸 1개를 확인해 주세요.','bad'); render();});
      return;
    case 'paste':{
      const box=$('pasteBox'); UI.paste=box.value;
      const nums=[]; box.value.split(/\n/).forEach(line=>{ if(!/^(이마|왼쪽 볼|오른쪽 볼|코|턱)/.test(line.trim())) return; (line.replace(/^[^\d]*/,'').match(/-?\d+(\.\d+)?/g)||[]).forEach(n=>nums.push(Number(n))); });
      if(!nums.length){toast('붙여넣은 내용에서 부위별 수치를 찾지 못했습니다. 부위 이름으로 시작하는 줄이 필요합니다.','bad');return;}
      withLoading('붙여넣은 값 채우는 중...',()=>{let n=0; ZONES.forEach((z,i)=>METRICS.forEach((m,j)=>{if(n<nums.length){r.values[i][j]=nums[n++];}})); r.src='manual';
        toast(Math.min(nums.length,30)+'개 수치를 채웠습니다.'); render();});
      return;}
    case 'clearVals': r.values=ZONES.map(()=>METRICS.map(()=>null)); r.src=null; UI.fileLoaded=null; toast('측정 수치를 비웠습니다.'); render(); return;
    case 'toClinic': go('rec/'+r.id+'/clinic'); return;
    case 'saveClinic':{
      const type=(document.querySelector('input[name="ctype"]:checked')||{}).value||'';
      const op=$('cop').value;
      if(!type||!op.trim()){toast('피부 타입과 원장 소견은 꼭 적어 주세요.','bad'); (type?$('cop'):document.querySelector('input[name="ctype"]')).focus(); return;}
      withLoading('원내 입력 저장 중...',()=>{
        r.clinic.type=type; r.clinic.opinion=op;
        r.clinic.concerns=[...document.querySelectorAll('input[name="ccon"]:checked')].map(i=>i.value);
        r.clinic.care=[...document.querySelectorAll('input[name="ccare"]:checked')].map(i=>i.value);
        r.clinic.next=$('cnext').value;
        toast('저장했습니다. 보고서 미리보기를 확인하세요.'); go('rec/'+r.id+'/report');});
      return;}
    case 'print':
      withLoading('인쇄 준비 중...',()=>{
        $('printHost').innerHTML=reportHTML(r);
        r.printed=true; render();
        toast(r.chart+' 보고서를 인쇄로 보냈습니다.');
        if(!navigator.webdriver) window.print();});
      return;
    case 'cfgReset': UI.cfgDraft=clone(S.cfg); render(); return;
    case 'cfgSave':
      withLoading('설정 저장 중...',()=>{S.cfg=clone(UI.cfgDraft); toast('산식을 저장했습니다. 이후 보고서부터 새 산식이 적용됩니다.'); render();});
      return;
  }
});
document.addEventListener('input',(e)=>{
  const i=e.target;
  if(i.dataset&&i.dataset.v){const [a,b]=i.dataset.v.split('-').map(Number);const r=curRec();
    r.values[a][b]=i.value.trim()===''?null:i.value.trim();
    const er=valueError(r.values[a][b]); i.classList.toggle('invalid',!!er); i.classList.remove('imported');
    if(er){i.setAttribute('aria-invalid','true');i.title=er;} else {i.removeAttribute('aria-invalid');i.removeAttribute('title');}
    refreshData(); return;}
  if(i.id==='qs'){UI.q=i.value;clearTimeout(route.qt);route.qt=setTimeout(()=>{render();const n=$('qs');if(n){n.focus();n.setSelectionRange(n.value.length,n.value.length);}},250);return;}
  if(i.id==='pasteBox'){UI.paste=i.value;return;}
  if(i.dataset&&(i.dataset.w||i.dataset.g!=null)&&UI.cfgDraft){
    if(i.dataset.w) UI.cfgDraft.weights[i.dataset.w]=Number(i.value)||0; else UI.cfgDraft.grades[Number(i.dataset.g)].min=Number(i.value)||0;
    clearTimeout(route.ct);route.ct=setTimeout(()=>{const id=i.id;render();const n=$(id);if(n){n.focus();}},350);return;}
});
document.addEventListener('change',(e)=>{
  const i=e.target;
  if(i.dataset&&i.dataset.show&&UI.cfgDraft){UI.cfgDraft.show[i.dataset.show]=i.checked;return;}
  if(i.id==='optZone'&&UI.cfgDraft){UI.cfgDraft.zoneTable=i.checked;return;}
  if(i.id==='optPrev'&&UI.cfgDraft){UI.cfgDraft.prevCompare=i.checked;return;}
});
window.addEventListener('hashchange',route);
route();
})();
