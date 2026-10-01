(function(){
"use strict";

/* ===== utils ===== */
const ic=(n)=>'<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-'+n+'"/></svg>';
const won=(n)=>Number(n).toLocaleString('ko-KR');
const esc=(s)=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=(id)=>document.getElementById(id);
const clone=(o)=>JSON.parse(JSON.stringify(o));
const today=new Date(); today.setHours(0,0,0,0);
const dstr=(d)=>{const x=new Date(d);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');};
const TODAY=dstr(today);
const addDays=(n)=>dstr(today.getTime()+n*86400000);
const nowHM=()=>{const d=new Date();return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');};

/* ===== 채널 ===== */
const CH={coupang:{l:'쿠팡',on:true},naver:{l:'네이버 스마트스토어',on:true},talk:{l:'카카오 톡딜',on:false},toss:{l:'토스',on:false}};
const ACTIVE=['coupang','naver'];

/* ===== 예시 데이터 ===== */
const SEED={
  set:{
    fee:{coupang:10.8,naver:5.5},
    nameMax:{coupang:100,naver:100},
    banned:['최저가','1위','완치'],
    catMap:[
      {my:'생활용품 > 욕실',coupang:'생활용품 > 욕실용품 > 발매트',naver:'생활/건강 > 욕실용품 > 욕실매트'},
      {my:'생활용품 > 세탁',coupang:'생활용품 > 세탁용품 > 빨래집게',naver:'생활/건강 > 세탁용품 > 빨래집게'},
      {my:'생활용품 > 수납',coupang:'생활용품 > 수납/정리 > 수납함',naver:'생활/건강 > 수납/정리용품 > 수납함'},
      {my:'농산물 > 과일',coupang:'식품 > 과일 > 사과',naver:'식품 > 농산물 > 과일 > 사과'},
      {my:'농산물 > 채소',coupang:'식품 > 채소 > 감자',naver:'식품 > 농산물 > 채소 > 감자'}
    ],
    notice:{
      goods:{coupang:['품명','제조국','제조자/수입자'],naver:['품명','제조국','제조자/수입자']},
      farm:{coupang:['품목','원산지','포장 단위별 용량'],naver:['품목','원산지','포장 단위별 용량','생산자']}
    }
  },
  cands:[
    {id:'C1',name:'규조토 발매트 대형 60x39cm',src:'도매꾹',kind:'goods',my:'생활용품 > 욕실',cost:6900,ship:3000,sell:16900,mkt:null,url:'https://sample-domae.example/item/48213'},
    {id:'C2',name:'스테인리스 빨래집게 30개입',src:'오너클랜',kind:'goods',my:'생활용품 > 세탁',cost:4200,ship:0,sell:9900,mkt:null,url:'https://sample-owner.example/goods/77120'},
    {id:'C3',name:'실리콘 주방 수세미 5개입',src:'도매꾹',kind:'goods',my:'생활용품 > 수납',cost:2100,ship:3000,sell:6900,mkt:null,url:'https://sample-domae.example/item/51877'},
    {id:'C4',name:'접이식 다용도 수납함 3종',src:'오너클랜',kind:'goods',my:'생활용품 > 수납',cost:8800,ship:0,sell:17900,mkt:null,url:'https://sample-owner.example/goods/80456'},
    {id:'C5',name:'경북 부사 사과 5kg 가정용',src:'농산물 도매몰',kind:'farm',my:'농산물 > 과일',cost:21000,ship:0,sell:32900,mkt:{item:'사과(부사) 10kg 상품',price:62400,chg:-4.2,grade:'상',recent:true},url:'https://sample-farm.example/p/2231'},
    {id:'C6',name:'강원 수미 감자 10kg',src:'농산물 도매몰',kind:'farm',my:'농산물 > 채소',cost:13500,ship:3500,sell:24900,mkt:{item:'감자(수미) 20kg 상품',price:31800,chg:2.6,grade:'상',recent:true},url:'https://sample-farm.example/p/1904'},
    {id:'C7',name:'제주 노지 감귤 5kg',src:'농산물 도매몰',kind:'farm',my:'농산물 > 과일',cost:13000,ship:0,sell:19900,mkt:{item:'감귤(노지) 5kg 상품',price:12900,chg:11.5,grade:'보통',recent:false},url:'https://sample-farm.example/p/2540'},
    {id:'C8',name:'무선 청소기 호환 필터 2개입',src:'도매꾹',kind:'goods',my:'생활용품 > 수납',cost:5400,ship:3000,sell:12900,mkt:null,url:'https://sample-domae.example/item/60392'}
  ],
  prods:[
    {id:'P-1001',name:'규조토 발매트 대형 60x39cm',src:'도매꾹',url:'https://sample-domae.example/item/48213',kind:'goods',my:'생활용품 > 욕실',cost:6900,ship:3000,sell:16900,opts:['그레이','베이지'],imgs:6,
     spec:{'품명':'규조토 발매트','크기':'60 x 39 x 0.9cm','소재':'규조토, 식물섬유','제조국':'중국','제조자/수입자':'(수입사명)','배송':'택배 3,000원, 평일 14시 이전 주문 당일 출고'},
     copy:null,ch:{coupang:{st:'none'},naver:{st:'none'}},names:{}},
    {id:'P-1002',name:'경북 부사 사과 5kg 가정용',src:'농산물 도매몰',url:'https://sample-farm.example/p/2231',kind:'farm',my:'농산물 > 과일',cost:21000,ship:0,sell:32900,opts:['5kg (16~20과)'],imgs:4,
     spec:{'품목':'사과(부사)','원산지':'경상북도','포장 단위별 용량':'5kg (16~20과)','등급':'가정용 (흠집 일부)','배송':'무료 배송, 산지 직송'},
     copy:{segs:[{t:'경북 산지에서 바로 보내는 부사 사과 5kg입니다.'},{t:'가정용 등급이라 겉에 작은 흠집이 있을 수 있습니다.'},{t:'16~20과가 들어 있습니다.'},{t:'산지에서 직접 보내며 배송비는 무료입니다.'}],checked:true},
     ch:{coupang:{st:'ok',no:'8842031177'},naver:{st:'fail',err:{field:'생산자',msg:'상품정보제공고시 필수 항목이 비어 있습니다: 생산자'}}},names:{coupang:'경북 부사 사과 5kg 가정용 16~20과 산지직송',naver:'경북 부사 사과 5kg 가정용 산지직송'}},
    {id:'P-1003',name:'강원 수미 감자 10kg',src:'농산물 도매몰',url:'https://sample-farm.example/p/1904',kind:'farm',my:'농산물 > 채소',cost:13500,ship:3500,sell:24900,opts:['10kg (중)'],imgs:3,
     spec:{'품목':'감자(수미)','원산지':'강원도','포장 단위별 용량':'10kg','생산자':'(생산 농가명)','배송':'택배 3,500원'},
     copy:{segs:[{t:'강원도에서 수확한 수미 감자 10kg입니다.'},{t:'중 크기 위주로 담았습니다.'},{t:'택배로 보내며 배송비는 3,500원입니다.'}],checked:true},
     ch:{coupang:{st:'none'},naver:{st:'none'}},names:{coupang:'강원 수미 감자 10kg 중 사이즈',naver:'강원 수미 감자 10kg'}}
  ],
  log:[
    {t:TODAY+' 09:12',step:'등록',target:'P-1002 / 네이버',ok:false,msg:'상품정보제공고시 필수 항목 누락: 생산자'},
    {t:TODAY+' 09:11',step:'등록',target:'P-1002 / 쿠팡',ok:true,msg:'등록 완료. 상품번호 8842031177'},
    {t:TODAY+' 09:04',step:'생성',target:'P-1002',ok:true,msg:'상세 문구 생성. 근거 없는 표현 0건'},
    {t:TODAY+' 08:58',step:'수집',target:'P-1003',ok:true,msg:'농산물 도매몰에서 상품 정보 수집'},
    {t:addDays(-1)+' 17:40',step:'수집',target:'sample-other.example',ok:false,msg:'수집 대상이 아닌 소싱처. 직접 입력으로 전환'}
  ]
};
let S=clone(SEED);
let seqP=1004;

/* ===== 계산과 검사: 한 곳에서만 ===== */
function margin(c){const fee=Math.round(c.sell*S.set.fee.coupang/100);const m=c.sell-c.cost-c.ship-fee;return {fee,m,rate:m/c.sell*100};}
function reasons(c){
  const r=[]; const mg=margin(c);
  if(mg.rate>=30) r.push(['마진 30% 이상','ok']);
  if(c.ship===0) r.push(['배송비 무료','info']);
  if(c.mkt){ if(c.mkt.chg<0) r.push(['시세 하락, 매입 유리','ok']); if(c.mkt.chg>=10) r.push(['시세 급등, 주의','warn']); if(c.mkt.recent) r.push(['최근 출하','info']); }
  return r;
}
function catOf(p){return S.set.catMap.find(x=>x.my===p.my)||{my:p.my,coupang:'',naver:''};}
/* AI 문구 생성 흉내: 원본 정보로 문장을 만들고, 원본에 근거가 없는 표현을 표시한다 */
function generate(p){
  const sp=p.spec; const segs=[];
  if(p.kind==='goods'){
    segs.push({t:(sp['품명']||p.name)+'입니다.'+(sp['크기']?' 크기는 '+sp['크기']+'입니다.':'')});
    if(p.name.indexOf('발매트')>=0) segs.push({t:'물기를 빠르게 흡수해 욕실 앞을 보송하게 유지합니다.',flag:{why:'원본에 흡수 속도나 성능 설명이 없습니다. 근거가 없으면 과장 표현이 될 수 있습니다.'},fix:'욕실 앞에 두고 쓰는 발매트입니다.'});
    else segs.push({t:'오래 써도 변형이 없는 튼튼한 제품입니다.',flag:{why:'원본에 내구성에 대한 설명이 없습니다. 근거가 없으면 과장 표현이 될 수 있습니다.'},fix:''});
    if(sp['소재']) segs.push({t:'소재는 '+sp['소재']+'입니다.'});
    segs.push({t:'항균 99.9% 인증을 받았습니다.',flag:{why:'원본에 항균 수치나 인증 정보가 없습니다. 인증서가 없으면 표시·광고 문제가 될 수 있습니다.'},fix:''});
    segs.push({t:'국내 판매 1위 상품입니다.',flag:{why:'원본에 판매 순위 근거가 없고, 설정의 금지어(1위)에도 걸립니다.'},fix:''});
    if(p.opts.length) segs.push({t:'색상은 '+p.opts.join(', ')+' 중에서 고를 수 있습니다.'});
    if(sp['배송']) segs.push({t:'배송: '+sp['배송']+'.'});
  } else {
    segs.push({t:(sp['원산지']||'')+'에서 보내는 '+(sp['품목']||p.name)+' '+(sp['포장 단위별 용량']||'')+'입니다.'});
    segs.push({t:'당도 15브릭스 이상만 골라 담았습니다.',flag:{why:'원본에 당도 수치가 없습니다. 측정 근거가 없으면 쓸 수 없는 표현입니다.'},fix:''});
    if(sp['등급']) segs.push({t:'등급은 '+sp['등급']+'입니다.'});
    if(sp['배송']) segs.push({t:'배송: '+sp['배송']+'.'});
  }
  segs.forEach(s=>{if(s.flag) s.st='open';});
  const cat=p.kind==='goods'?'':' 산지직송';
  p.names={coupang:p.name+(p.opts.length>1?' '+p.opts.length+'색':'')+cat,naver:p.name+cat};
  p.copy={segs,checked:false};
}
function openFlags(p){return p.copy?p.copy.segs.filter(s=>s.flag&&s.st==='open').length:0;}
/* 채널 등록 흉내: 설정값으로 검사하고 채널 응답 형태로 돌려준다 */
function tryPublish(p,ch){
  const name=(p.names[ch]||'').trim(), set=S.set;
  if(!name) return {ok:false,field:'상품명',msg:'상품명이 비어 있습니다.'};
  if(name.length>set.nameMax[ch]) return {ok:false,field:'상품명',msg:'상품명이 '+set.nameMax[ch]+'자를 넘습니다. (현재 '+name.length+'자)'};
  const bw=set.banned.find(w=>name.indexOf(w)>=0); if(bw) return {ok:false,field:'상품명',msg:'상품명에 사용할 수 없는 단어가 있습니다: '+bw};
  if(!catOf(p)[ch]) return {ok:false,field:'카테고리',msg:'카테고리 매칭이 없습니다. 설정의 카테고리 매칭표에 추가해 주세요.'};
  const miss=set.notice[p.kind][ch].filter(f=>!String(p.spec[f]||'').trim());
  if(miss.length) return {ok:false,field:miss[0],msg:'상품정보제공고시 필수 항목이 비어 있습니다: '+miss.join(', ')};
  return {ok:true,no:String(8842031000+Math.floor(p.id.slice(2)*37%900)+(ch==='naver'?5000:0))};
}
function stageOf(p){
  if(!p.copy) return ['문구 생성 전','mute','detail'];
  if(!p.copy.checked) return ['문구 확인 필요 '+openFlags(p)+'건','warn','detail'];
  const sts=ACTIVE.map(c=>p.ch[c].st);
  if(sts.indexOf('fail')>=0) return ['등록 실패','bad','publish'];
  if(sts.every(s=>s==='ok')) return ['등록 완료','ok','publish'];
  return ['등록 대기','info','publish'];
}

/* ===== state ===== */
const UI={view:'home',pid:'P-1001',ch:'coupang',impTab:'url',url:'',imp:null,impFail:null,f:{maxCost:30000,minRate:20,free:false,kind:'전체'},guideOpen:null,guideStep:null,draft:null};
const NAV=[{g:'소싱'},{k:'home',l:'오늘의 작업',i:'home'},{k:'cand',l:'상품 후보',i:'filter'},{k:'import',l:'상품 가져오기',i:'link'},
  {g:'등록'},{k:'detail',l:'상세페이지 생성',i:'wand',cnt:()=>S.prods.filter(p=>!p.copy||!p.copy.checked).length},{k:'publish',l:'채널 등록',i:'store',cnt:()=>S.prods.filter(p=>stageOf(p)[1]==='bad').length},
  {g:'관리'},{k:'settings',l:'설정',i:'settings'},{k:'log',l:'실행 기록',i:'history'}];
const TITLES={home:'오늘의 작업',cand:'상품 후보',import:'상품 가져오기',detail:'상세페이지 생성',publish:'채널 등록',settings:'설정',log:'실행 기록'};
function go(view){const h='#/'+view; if(location.hash===h) route(); else location.hash=h;}
function route(){
  const v=location.hash.replace(/^#\/?/,'').split('/')[0];
  UI.view=TITLES[v]?v:'home';
  if(Date.now()-(toast.at||0)>300) $('toastHost').innerHTML='';
  render(); window.scrollTo(0,0);
}
function toast(msg,kind){toast.at=Date.now();const h=$('toastHost');h.innerHTML='<div class="toast'+(kind==='bad'?' bad':'')+'" role="status">'+ic(kind==='bad'?'alert':'check')+'<span>'+esc(msg)+'</span></div>';clearTimeout(toast.t);toast.t=setTimeout(()=>{h.innerHTML='';},3400);}
let busy=false;
function withLoading(msg,fn,ms){if(busy)return;busy=true;$('overlayHost').innerHTML='<div class="overlay" role="status" aria-live="assertive"><div class="ob"><span class="spin" aria-hidden="true"></span><span>'+esc(msg)+'</span></div></div>';setTimeout(()=>{$('overlayHost').innerHTML='';busy=false;fn();},ms||480);}
function log(step,target,ok,msg){S.log.unshift({t:TODAY+' '+nowHM(),step,target,ok,msg});}
const st=(t,k)=>'<span class="st '+k+'">'+esc(t)+'</span>';
const empty=(i,t,d,b)=>'<div class="empty">'+ic(i)+'<strong>'+esc(t)+'</strong><p>'+esc(d)+'</p>'+(b||'')+'</div>';
const btn=(o)=>'<button type="button" class="btn '+(o.cls||'')+(o.iconM?' icon-m':'')+'"'+(o.iconM?' data-tip="'+esc(o.label)+'" aria-label="'+esc(o.label)+'"':'')+' '+(o.attrs||'')+'>'+(o.icon?ic(o.icon):'')+'<span class="lbl">'+esc(o.label)+'</span></button>';
const head=(sub,extra)=>'<div class="ph"><div><h1>'+TITLES[UI.view]+'</h1>'+(sub?'<div class="sub">'+sub+'</div>':'')+'</div>'+(extra?'<div class="ph-actions">'+extra+'</div>':'')+'</div>';
const cur=()=>S.prods.find(p=>p.id===UI.pid)||S.prods[0];
function prodSelect(filter){
  const list=S.prods.filter(filter||(()=>true));
  return '<div class="pstrip"><label for="psel" class="small">상품</label><select id="psel" class="f">'+list.map(p=>'<option value="'+p.id+'"'+(p.id===UI.pid?' selected':'')+'>'+p.id+' '+esc(p.name)+'</option>').join('')+'</select>'+(()=>{const p=cur();const s=stageOf(p);return st(s[0],s[1])+'<span class="small">'+p.src+' / 공급가 '+won(p.cost)+'원</span>';})()+'</div>';
}

function renderShell(){
  $('side').innerHTML=NAV.map(n=>{if(n.g) return '<h2>'+n.g+'</h2>';const c=n.cnt?n.cnt():0;
    return '<a href="#/'+n.k+'"'+(UI.view===n.k?' aria-current="page"':'')+'>'+ic(n.i)+n.l+(c?'<span class="cnt">'+c+'</span>':'')+'</a>';}).join('');
}

/* ===== 오늘의 작업 ===== */
function viewHome(){
  const stg=S.prods.map(p=>stageOf(p));
  const n=(k)=>stg.filter(s=>s[1]===k).length;
  const kpi='<div class="kpi"><div><div class="k">등록 대기</div><div class="v">'+(n('info')+n('warn')+n('mute'))+'<small>건</small></div></div><div><div class="k">등록 완료</div><div class="v">'+n('ok')+'<small>건</small></div></div><div><div class="k">실패</div><div class="v"'+(n('bad')?' style="color:var(--bad)"':'')+'>'+n('bad')+'<small>건</small></div></div></div>';
  const rows=S.prods.map(p=>{const s=stageOf(p);
    return '<tr><td data-k="상품"><b>'+esc(p.name)+'</b><div class="small">'+p.id+' / '+p.src+'</div></td><td class="stc">'+st(s[0],s[1])+'</td>'+ACTIVE.map(c=>'<td data-k="'+CH[c].l+'">'+(p.ch[c].st==='ok'?st('등록됨','ok'):p.ch[c].st==='fail'?st('실패','bad'):'<span class="small">미등록</span>')+'</td>').join('')+
      '<td class="r full">'+btn({cls:'sm',icon:'right',label:s[2]==='detail'?'문구 확인하기':s[1]==='bad'?'실패 사유 보기':s[1]==='ok'?'등록 내용 보기':'등록하기',attrs:'data-open="'+p.id+'" data-to="'+s[2]+'"'})+'</td></tr>';}).join('');
  return head(TODAY+' 기준. 가져온 상품이 어느 단계에 있는지 보여 줍니다.',btn({cls:'pri',icon:'filter',label:'상품 후보 보기',attrs:'data-go="cand"'}))+kpi+
    '<h2 class="sh">진행 중인 상품</h2><div class="tw rl rl-kv"><table class="t"><thead><tr><th>상품</th><th>단계</th>'+ACTIVE.map(c=>'<th>'+CH[c].l+'</th>').join('')+'<th></th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
    '<h2 class="sh">최근 실행 기록</h2>'+logTable(S.log.slice(0,4));
}

/* ===== 상품 후보 ===== */
function viewCand(){
  const f=UI.f;
  const list=S.cands.filter(c=>{const mg=margin(c);
    if(f.kind!=='전체'&&(f.kind==='농수산물')!==(c.kind==='farm')) return false;
    if(c.cost>f.maxCost) return false; if(mg.rate<f.minRate) return false; if(f.free&&c.ship>0) return false; return true;});
  const rows=list.map(c=>{const mg=margin(c), rs=reasons(c), has=S.prods.some(p=>p.url===c.url);
    return '<tr><td><b>'+esc(c.name)+'</b><div class="small">'+c.src+' / '+c.my+'</div></td>'+
      '<td class="r num">'+won(c.cost)+'</td><td class="r num">'+(c.ship?won(c.ship):'무료')+'</td><td class="r num">'+won(c.sell)+'</td>'+
      '<td class="r num"><b>'+won(mg.m)+'</b><div class="small">'+mg.rate.toFixed(1)+'% (수수료 '+won(mg.fee)+')</div></td>'+
      '<td>'+(c.mkt?'<span class="num">'+won(c.mkt.price)+'원</span> <span class="num '+(c.mkt.chg>0?'up':'down')+'">'+(c.mkt.chg>0?'+':'')+c.mkt.chg+'%</span><div class="small">'+esc(c.mkt.item)+' / 등급 '+c.mkt.grade+' / '+(c.mkt.recent?'최근 출하':'출하 초기')+'</div>':'<span class="small">해당 없음</span>')+'</td>'+
      '<td>'+(rs.length?rs.map(r=>st(r[0],r[1])).join(' '):'<span class="small">조건만 충족</span>')+'</td>'+
      '<td class="r">'+(has?'<span class="small">가져옴</span>':btn({cls:'sm pri',icon:'link',label:'가져오기',attrs:'data-pick="'+c.id+'"'}))+'</td></tr>';}).join('');
  return head('도매몰 신상품과 카테고리 목록에서 아래 조건으로 거른 후보입니다. 판매량을 예측하지 않고, 고른 기준을 행마다 보여 줍니다.')+
    '<div class="bar" style="align-items:flex-end"><div><label for="f-kind" class="small" style="display:block">분류</label><select id="f-kind" class="f" data-f="kind">'+['전체','생활용품','농수산물'].map(k=>'<option'+(f.kind===k?' selected':'')+'>'+k+'</option>').join('')+'</select></div>'+
    '<div><label for="f-max" class="small" style="display:block">공급가 상한(원)</label><input id="f-max" class="f qty" style="width:110px" type="number" inputmode="numeric" step="1000" min="0" value="'+f.maxCost+'" data-f="maxCost"></div>'+
    '<div><label for="f-rate" class="small" style="display:block">최소 마진율(%)</label><input id="f-rate" class="f qty" type="number" inputmode="numeric" min="0" max="90" value="'+f.minRate+'" data-f="minRate"></div>'+
    '<label class="chk"><input type="checkbox" data-f="free"'+(f.free?' checked':'')+'>배송비 무료만</label><span class="grow"></span><span class="small">'+list.length+' / '+S.cands.length+'개 후보</span></div>'+
    (list.length?'<div class="tw"><table class="t" style="min-width:1000px"><thead><tr><th>상품</th><th class="r">공급가</th><th class="r">배송비</th><th class="r">예상 판매가</th><th class="r">예상 마진</th><th>농산물 시세 (전주 대비)</th><th>고른 기준</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>'
      :empty('filter','조건에 맞는 후보가 없습니다','공급가 상한을 올리거나 최소 마진율을 낮춰 보세요.','<button type="button" class="btn" data-act="resetF">조건 초기화</button>'))+
    '<p class="note">'+ic('alert')+'예상 마진 = 예상 판매가 - 공급가 - 배송비 - 채널 수수료(설정값 '+S.set.fee.coupang+'%). 농산물 시세는 정부 공개 가격정보를 쓰는 것을 전제로 한 예시 값입니다. 어느 수준까지 자동으로 찾을지는 예산 안에서 미팅 때 정합니다.</p>';
}

/* ===== 상품 가져오기 ===== */
function impForm(d,manual){
  const cats=S.set.catMap.map(c=>c.my);
  return '<div class="fg">'+
    '<label for="i-name">상품명 <span class="req">*</span></label><div class="v"><input id="i-name" class="f" value="'+esc(d.name||'')+'"></div>'+
    '<label for="i-my">분류</label><div class="v"><select id="i-my" class="f">'+cats.map(c=>'<option'+(d.my===c?' selected':'')+'>'+c+'</option>').join('')+'</select></div>'+
    '<label for="i-cost">공급가(원) <span class="req">*</span></label><div class="v"><input id="i-cost" class="f qty" style="width:130px;flex:none" type="number" inputmode="numeric" min="0" value="'+(d.cost||'')+'"></div>'+
    '<label for="i-ship">배송비(원)</label><div class="v"><input id="i-ship" class="f qty" style="width:130px;flex:none" type="number" inputmode="numeric" min="0" value="'+(d.ship==null?'':d.ship)+'"><span class="small">0이면 무료 배송</span></div>'+
    '<label for="i-sell">판매가(원) <span class="req">*</span></label><div class="v"><input id="i-sell" class="f qty" style="width:130px;flex:none" type="number" inputmode="numeric" min="0" value="'+(d.sell||'')+'"></div>'+
    '<label for="i-opts">옵션</label><div class="v"><input id="i-opts" class="f" value="'+esc((d.opts||[]).join(', '))+'" placeholder="쉼표로 구분"></div>'+
    '<label for="i-origin">'+(d.kind==='farm'?'원산지':'제조국')+'</label><div class="v"><input id="i-origin" class="f" value="'+esc(d.origin||'')+'"></div>'+
    '<div class="k">이미지</div><div class="v">'+(manual?btn({icon:'upload',label:'사진 올리기',attrs:'data-act="imgUp"'})+'<span class="small" id="imgCnt">'+(d.imgs||0)+'장</span>':'<div class="imgs">'+Array.from({length:Math.min(d.imgs||0,6)}).map((x,i)=>'<span aria-hidden="true">'+(i+1)+'</span>').join('')+'</div><span class="small">원본 사진 '+(d.imgs||0)+'장</span>')+'</div>'+
    '</div><div class="err" id="i-err" role="alert" style="margin-top:6px"></div>'+
    '<div class="acts">'+btn({cls:'pri',icon:'check',label:'이 정보로 상품 만들기',attrs:'data-act="makeProd"'})+'</div>';
}
function viewImport(){
  const tabs='<div class="chtabs" role="tablist"><button type="button" role="tab" data-imptab="url" aria-selected="'+(UI.impTab==='url')+'">'+ic('link')+'주소로 가져오기</button><button type="button" role="tab" data-imptab="manual" aria-selected="'+(UI.impTab==='manual')+'">'+ic('pencil')+'직접 입력</button></div>';
  let body;
  if(UI.impTab==='manual'){
    body=(UI.impFail?'<p class="note warn" style="margin:0 0 12px">'+ic('alert')+'주소로 가져오지 못한 상품입니다. 아래에 직접 입력하면 이후 과정(문구 생성, 채널 등록)은 똑같이 진행됩니다.</p>':'<p class="note" style="margin:0 0 12px">'+ic('pencil')+'자동 수집이 안 되는 소싱처의 상품도 직접 입력하면 같은 흐름으로 진행됩니다.</p>')+impForm(UI.draft||{kind:'goods',imgs:0},true);
  } else {
    body='<div class="bar"><div style="flex:1;min-width:200px"><label for="url" class="small" style="display:block">도매몰 상품 상세 페이지 주소</label><input id="url" class="f" style="width:100%" value="'+esc(UI.url)+'" placeholder="https://"></div>'+btn({cls:'pri',icon:'download',label:'가져오기',attrs:'data-act="fetch"'})+'</div>'+
      '<div class="bar"><span class="small">예시 주소 넣기</span>'+btn({cls:'sm',label:'도매꾹 상품',attrs:'data-url="https://sample-domae.example/item/60392"'})+btn({cls:'sm',label:'오너클랜 상품',attrs:'data-url="https://sample-owner.example/goods/77120"'})+btn({cls:'sm',label:'수집 대상이 아닌 곳',attrs:'data-url="https://sample-other.example/view/3391"'})+'</div>'+
      (UI.impFail?'<div class="result bad"><h3>가져오지 못했습니다</h3><p style="margin:0">'+esc(UI.impFail)+'</p><div class="acts" style="justify-content:flex-start">'+btn({cls:'pri',icon:'pencil',label:'직접 입력으로 전환',attrs:'data-act="toManual"'})+'</div></div>'
       :UI.imp?'<h2 class="sh">가져온 정보 <span class="meta">'+UI.imp.src+' / 틀린 값은 고친 뒤 저장합니다</span></h2>'+impForm(UI.imp,false)
       :empty('link','상품 주소를 넣어 주세요','도매꾹, 오너클랜 등 수집 대상 도매몰의 상품 상세 페이지 주소를 넣으면 상품명, 공급가, 옵션, 이미지, 배송 조건을 가져옵니다.'));
  }
  return head('주소를 넣으면 상품 정보를 가져옵니다. 가져올 수 없는 곳은 직접 입력합니다.')+tabs+body;
}

/* ===== 상세페이지 생성 ===== */
function viewDetail(){
  const p=cur();
  const src='<h2>원본 상품 정보 <span class="small">'+p.src+'</span></h2><div class="fg">'+Object.keys(p.spec).map(k=>'<div class="k">'+k+'</div><div class="v">'+esc(p.spec[k])+'</div>').join('')+'<div class="k">옵션</div><div class="v">'+esc(p.opts.join(', ')||'-')+'</div><div class="k">원본 사진</div><div class="v">'+p.imgs+'장</div></div>';
  if(!p.copy) return head('가져온 정보를 바탕으로 AI가 채널용 상세 문구와 썸네일을 만듭니다.')+prodSelect()+
    '<div class="cmp"><div>'+src+'</div><div><h2>AI 생성 문구</h2>'+empty('wand','아직 문구를 만들지 않았습니다','원본 정보만 써서 문구를 만들고, 원본에 근거가 없는 표현은 표시해서 보여 드립니다.',btn({cls:'pri',icon:'wand',label:'문구와 썸네일 만들기',attrs:'data-act="gen"'}))+'</div></div>';
  let fn=0;
  const text=p.copy.segs.map(s=>{ if(!s.flag) return esc(s.t); fn++;
    if(s.st==='removed') return '<span class="rm">'+esc(s.t)+'</span>';
    if(s.st==='open') return '<span class="fl">'+esc(s.t)+'<sup>'+fn+'</sup></span>';
    return '<span class="fl done">'+esc(s.cur||s.t)+'<sup>'+fn+'</sup></span>';}).join(' ');
  fn=0;
  const flagged=p.copy.segs.map((s,i)=>({s,i})).filter(x=>x.s.flag);
  const notes=flagged.map(x=>{fn++;const s=x.s;
    return '<li class="'+(s.st==='open'?'':'done')+'"><div class="q">'+fn+'. '+esc(s.t)+' '+(s.st==='open'?st('근거 없음','bad'):s.st==='removed'?st('삭제함','mute'):s.st==='fixed'?st('고침','ok'):st('근거 확인함','ok'))+'</div><div class="why">'+esc(s.flag.why)+'</div>'+
      (s.st==='open'?'<div class="na">'+btn({cls:'sm',icon:'trash',label:'문장 삭제',attrs:'data-fl="'+x.i+'" data-do="removed"'})+(s.fix?btn({cls:'sm',icon:'pencil',label:'원본에 맞게 고치기',attrs:'data-fl="'+x.i+'" data-do="fixed"'}):'')+btn({cls:'sm',icon:'check',label:'근거가 있어 그대로 둠',attrs:'data-fl="'+x.i+'" data-do="confirmed"'})+'</div>':'<div class="na">'+btn({cls:'sm',icon:'refresh',label:'되돌리기',attrs:'data-fl="'+x.i+'" data-do="open"'})+'</div>')+'</li>';}).join('');
  const open=openFlags(p);
  return head('왼쪽 원본 정보와 오른쪽 AI 문구를 나란히 보고, 원본에 근거가 없는 표현을 확인한 뒤에만 등록으로 넘어갑니다.')+prodSelect()+
    '<div class="cmp"><div>'+src+
      '<h2 style="margin-top:16px">썸네일 <span class="small">원본 사진 기반</span></h2><div class="thumbs"><div class="thumb-b"><div class="ph2">원본 사진 1</div>원본 (배경 있음)</div><div class="thumb-b out"><div class="ph2">배경 정리</div>쿠팡 1000 x 1000</div><div class="thumb-b out"><div class="ph2">배경 정리</div>네이버 1000 x 1000</div></div><p class="small" style="margin:6px 0 0">없는 장면을 새로 그리지 않고, 원본 사진의 배경 정리와 규격 맞춤만 합니다.</p></div>'+
    '<div><h2>AI 생성 문구 '+(open?st('확인 필요 '+open+'건','warn'):st('확인 완료','ok'))+'</h2><div class="copy"><span class="tt">'+esc(p.names.coupang||p.name)+'</span>'+text+'</div>'+
      (flagged.length?'<ul class="notes" aria-label="근거 확인 목록">'+notes+'</ul>':'<p class="note ok">'+ic('check')+'원본에 근거가 없는 표현이 없습니다.</p>')+
      '<div class="acts">'+btn({icon:'wand',label:'다시 만들기',iconM:true,attrs:'data-act="gen"'})+btn({cls:'pri',icon:'right',label:p.copy.checked?'채널 등록으로':'확인 완료, 채널 등록으로',attrs:'data-act="toPublish"'+(open?' disabled':'')})+'</div>'+
      (open?'<p class="small" style="text-align:right;margin:6px 0 0">표시된 '+open+'건을 모두 처리해야 넘어갈 수 있습니다.</p>':'')+'</div></div>';
}

/* ===== 채널 등록 ===== */
function viewPublish(){
  const ready=S.prods.filter(p=>p.copy&&p.copy.checked);
  if(!ready.length) return head('확인을 마친 상품을 채널별 형식으로 등록합니다.')+empty('store','등록할 상품이 없습니다','상세페이지 생성에서 문구 확인을 마친 상품이 여기에 나타납니다.','<button type="button" class="btn pri" data-go="detail">상세페이지 생성으로</button>');
  if(!ready.some(p=>p.id===UI.pid)) UI.pid=ready[0].id;
  const p=cur(), ch=UI.ch;
  const tabs='<div class="chtabs" role="tablist">'+Object.keys(CH).map(k=>{const c=CH[k];const s=c.on?p.ch[k].st:null;
    return '<button type="button" role="tab" data-ch="'+k+'" aria-selected="'+(ch===k)+'"'+(c.on?'':' class="off"')+'>'+c.l+(s==='ok'?' '+st('등록됨','ok'):s==='fail'?' '+st('실패','bad'):!c.on?' '+st('연결 전','mute'):'')+'</button>';}).join('')+'</div>';
  if(!CH[ch].on) return head('확인을 마친 상품을 채널별 형식으로 등록합니다.')+prodSelect(x=>x.copy&&x.copy.checked)+tabs+
    empty('store',CH[ch].l+'은 아직 연결하지 않았습니다','외부 프로그램이 상품을 등록할 수 있는 판매자 API가 열려 있는지 확인한 뒤 연결합니다. API가 없으면 이 채널 양식에 맞춘 등록용 파일을 만들어 드리는 방식으로 바꿉니다.');
  const r=p.ch[ch], name=p.names[ch]||'', max=S.set.nameMax[ch], cat=catOf(p)[ch];
  const req=S.set.notice[p.kind][ch];
  const noticeRows=req.map(f=>{const v=p.spec[f]||'';const bad=r.st==='fail'&&r.err&&r.err.field===f;
    return '<tr'+(bad?' class="row-bad"':'')+'><td>'+f+' <span class="req">*</span></td><td><label class="sr" for="nt-'+f+'">'+f+'</label><input id="nt-'+f+'" class="f'+(String(v).trim()?'':' invalid')+'" style="width:100%" data-notice="'+esc(f)+'" value="'+esc(v)+'"'+(String(v).trim()?'':' placeholder="비어 있음"')+'></td></tr>';}).join('');
  let result='';
  if(r.st==='ok') result='<div class="result"><h3>'+CH[ch].l+'에 등록되었습니다</h3>상품번호 <b class="num">'+r.no+'</b>. 판매 상태: 판매 중</div>';
  if(r.st==='fail') result='<div class="result bad"><h3>'+CH[ch].l+' 등록이 실패했습니다</h3><div>채널이 돌려준 사유</div><pre>'+esc(r.err.msg)+'</pre><div><b>고칠 곳:</b> '+(r.err.field==='상품명'?'위 상품명 칸을 고친 뒤 다시 등록합니다.':r.err.field==='카테고리'?'설정의 카테고리 매칭표에 이 분류를 추가합니다.':'아래 상품정보제공고시의 '+esc(r.err.field)+' 칸을 채운 뒤 다시 등록합니다.')+'</div></div>';
  return head('확인을 마친 상품을 채널별 형식으로 등록합니다. 실패하면 채널이 돌려준 사유와 고칠 곳을 보여 줍니다.')+prodSelect(x=>x.copy&&x.copy.checked)+tabs+
    '<div class="fg"><label for="pname">상품명</label><div class="v"><input id="pname" class="f" data-pname="1" value="'+esc(name)+'"><span class="small num '+(name.length>max?'cnt-bad':'cnt-ok')+'" id="pnameCnt">'+name.length+' / '+max+'자</span></div>'+
    '<div class="k">카테고리</div><div class="v">'+(cat?esc(cat):st('매칭 없음','bad'))+' <span class="small">내 분류: '+esc(p.my)+'</span></div>'+
    '<div class="k">판매가</div><div class="v num">'+won(p.sell)+'원 <span class="small">수수료 '+S.set.fee[ch]+'% 적용 시 정산 예상 '+won(Math.round(p.sell*(100-S.set.fee[ch])/100))+'원</span></div>'+
    '<div class="k">옵션</div><div class="v">'+esc(p.opts.join(', ')||'단일 상품')+'</div>'+
    '<div class="k">썸네일</div><div class="v">1000 x 1000, 배경 정리본</div></div>'+
    '<h2 class="sh">상품정보제공고시 <span class="meta">이 채널의 필수 항목 (설정값)</span></h2><div class="tw"><table class="t"><thead><tr><th style="width:38%">항목</th><th>값</th></tr></thead><tbody>'+noticeRows+'</tbody></table></div>'+
    result+
    '<div class="acts">'+(r.st==='ok'?'':btn({cls:'pri',icon:'send',label:r.st==='fail'?CH[ch].l+'에 다시 등록':CH[ch].l+'에 등록',attrs:'data-act="publish"'}))+'</div>';
}

/* ===== 설정 ===== */
function viewSettings(){
  const s=S.set;
  return head('채널마다 다른 값은 코드가 아니라 이 설정에서 바꿉니다. 채널 정책이 바뀌면 여기부터 고칩니다.',btn({cls:'pri',icon:'check',label:'설정 저장',attrs:'data-act="saveSet"'}))+
    '<h2 class="sh" style="margin-top:0">카테고리 매칭표</h2><div class="tw"><table class="t" style="min-width:640px"><thead><tr><th>내 분류</th><th>쿠팡 카테고리</th><th>네이버 카테고리</th></tr></thead><tbody>'+
    s.catMap.map((c,i)=>'<tr><td>'+esc(c.my)+'</td><td><label class="sr" for="cm-c-'+i+'">'+esc(c.my)+' 쿠팡 카테고리</label><input id="cm-c-'+i+'" class="f" style="width:100%" data-cm="'+i+'|coupang" value="'+esc(c.coupang)+'"></td><td><label class="sr" for="cm-n-'+i+'">'+esc(c.my)+' 네이버 카테고리</label><input id="cm-n-'+i+'" class="f" style="width:100%" data-cm="'+i+'|naver" value="'+esc(c.naver)+'"></td></tr>').join('')+'</tbody></table></div>'+
    '<h2 class="sh">채널별 설정값</h2><div class="tw"><table class="t" style="min-width:560px"><thead><tr><th>항목</th><th>쿠팡</th><th>네이버 스마트스토어</th></tr></thead><tbody>'+
    '<tr><td>상품명 최대 길이(자)</td>'+ACTIVE.map(c=>'<td><label class="sr" for="nm-'+c+'">'+CH[c].l+' 상품명 최대 길이</label><input id="nm-'+c+'" class="f qty" type="number" min="1" data-nm="'+c+'" value="'+s.nameMax[c]+'"></td>').join('')+'</tr>'+
    '<tr><td>판매 수수료율(%)</td>'+ACTIVE.map(c=>'<td><label class="sr" for="fe-'+c+'">'+CH[c].l+' 수수료율</label><input id="fe-'+c+'" class="f qty" type="number" step="0.1" min="0" data-fe="'+c+'" value="'+s.fee[c]+'"></td>').join('')+'</tr>'+
    '<tr><td>고시 필수 항목 (공산품)</td>'+ACTIVE.map(c=>'<td class="small">'+s.notice.goods[c].join(', ')+'</td>').join('')+'</tr>'+
    '<tr><td>고시 필수 항목 (농산물)</td>'+ACTIVE.map(c=>'<td class="small">'+s.notice.farm[c].join(', ')+'</td>').join('')+'</tr>'+
    '</tbody></table></div>'+
    '<h2 class="sh">상품명 금지어</h2><div class="box"><label for="ban" class="sr">금지어</label><input id="ban" class="f" style="width:100%" value="'+esc(s.banned.join(', '))+'"><p class="small" style="margin:6px 0 0">쉼표로 구분합니다. 문구 생성과 등록 전 검사에 같이 쓰입니다.</p></div>'+
    '<h2 class="sh">채널 연결 상태</h2><div class="tw"><table class="t"><tbody>'+Object.keys(CH).map(k=>'<tr><td>'+CH[k].l+'</td><td>'+(CH[k].on?st('연결됨 (예시)','ok'):st('판매자 API 확인 후 연결','mute'))+'</td></tr>').join('')+'</tbody></table></div>'+
    '<p class="note">'+ic('alert')+'설정값은 모두 예시입니다. 실제 길이 제한, 수수료율, 고시 항목은 각 채널의 최신 기준으로 채우고, 값이 바뀌면 이 화면에서 고칩니다.</p>'+
    '<div class="acts">'+btn({icon:'refresh',label:'예시 데이터로 되돌리기',attrs:'data-act="reset"'})+'</div>';
}

/* ===== 실행 기록 ===== */
function logTable(list){
  return '<div class="tw rl rl-kv"><table class="t"><thead><tr><th>일시</th><th>결과</th><th>단계</th><th>대상</th><th>내용</th></tr></thead><tbody>'+list.map(x=>'<tr><td data-k="일시" class="num">'+x.t+'</td><td class="stc">'+(x.ok?st('성공','ok'):st('실패','bad'))+'</td><td data-k="단계">'+x.step+'</td><td data-k="대상">'+esc(x.target)+'</td><td class="full">'+esc(x.msg)+'</td></tr>').join('')+'</tbody></table></div>';
}
function viewLog(){return head('수집, 생성, 등록 단계마다 성공과 실패를 남깁니다. 어디서 막혔는지 여기서 확인합니다.')+logTable(S.log);}

/* ===== guide ===== */
const GUIDE=[
  {k:'g1',t:'후보 고르기',d:'마진, 배송비, 농산물 시세 기준으로 추린 후보입니다.'},
  {k:'g2',t:'상품 가져오기',d:'주소로 가져오고, 안 되면 직접 입력으로 바꿉니다.'},
  {k:'g3',t:'상세페이지 확인',d:'원본에 근거 없는 표현을 처리해야 넘어갑니다.'},
  {k:'g4',t:'채널 등록',d:'채널별 형식으로 등록하고 결과를 봅니다.'},
  {k:'g5',t:'실패 사유 확인',d:'채널이 돌려준 사유와 고칠 곳이 보입니다.'}
];
function renderGuide(){
  const g=$('guide'); g.hidden=false;
  if(UI.guideOpen===null) UI.guideOpen=window.matchMedia('(min-width:1101px)').matches;
  g.className='guide'+(UI.guideOpen?'':' closed');
  document.body.classList.toggle('guide-open',!!UI.guideOpen);
  g.innerHTML='<button type="button" class="gh" data-act="toggleGuide" aria-expanded="'+UI.guideOpen+'" aria-controls="guideList"><span>시연 안내</span>'+ic(UI.guideOpen?'down':'up')+'</button>'+
    '<ol id="guideList">'+GUIDE.map((s,i)=>'<li><button type="button" data-guide="'+s.k+'"'+(UI.guideStep===s.k?' aria-current="step"':'')+'><b><span class="n">'+(i+1)+'.</span>'+s.t+'</b>'+(UI.guideStep===s.k?'<span class="d">'+s.d+'</span>':'')+'</button></li>').join('')+'</ol>';
}
function guide(k){
  UI.guideStep=k; if(window.matchMedia('(max-width:1100px)').matches) UI.guideOpen=false;
  if(k==='g1'){UI.f=clone(SEEDF);go('cand');}
  if(k==='g2'){UI.impTab='url';UI.url='https://sample-owner.example/goods/77120';UI.imp=null;UI.impFail=null;go('import');}
  if(k==='g3'){const p=S.prods.find(x=>!x.copy||!x.copy.checked)||S.prods[0];UI.pid=p.id;go('detail');}
  if(k==='g4'){const p=S.prods.find(x=>x.copy&&x.copy.checked&&x.ch.coupang.st==='none')||S.prods.find(x=>x.copy&&x.copy.checked);if(p)UI.pid=p.id;UI.ch='coupang';go('publish');}
  if(k==='g5'){const p=S.prods.find(x=>x.ch.naver.st==='fail')||S.prods.find(x=>x.copy&&x.copy.checked);if(p)UI.pid=p.id;UI.ch='naver';go('publish');}
}
const SEEDF={maxCost:30000,minRate:20,free:false,kind:'전체'};

/* ===== render & events ===== */
const VIEWS={home:viewHome,cand:viewCand,import:viewImport,detail:viewDetail,publish:viewPublish,settings:viewSettings,log:viewLog};
function render(){renderShell();$('main').innerHTML=VIEWS[UI.view]();renderGuide();}
function fetchUrl(url){
  withLoading('상품 정보 가져오는 중...',()=>{
    const c=S.cands.find(x=>x.url===url.trim());
    if(!c){UI.imp=null;UI.impFail='이 주소의 사이트는 아직 수집 대상이 아닙니다. 수집 대상 도매몰은 미팅에서 정하고, 추가는 한 곳씩 따로 대응합니다.';log('수집',url.replace(/^https?:\/\//,'').split('/')[0],false,'수집 대상이 아닌 소싱처');toast('가져오지 못했습니다. 직접 입력으로 이어 갈 수 있습니다.','bad');render();return;}
    UI.impFail=null;UI.imp={name:c.name,my:c.my,kind:c.kind,cost:c.cost,ship:c.ship,sell:c.sell,opts:c.kind==='farm'?[c.name.match(/\d+kg/)?c.name.match(/\d+kg/)[0]:'기본']:['기본'],origin:c.kind==='farm'?c.name.split(' ')[0]:'중국',imgs:5,src:c.src,url:c.url};
    log('수집',c.src,true,c.name+' 상품 정보 수집');toast(c.src+'에서 상품 정보를 가져왔습니다.');render();});
}
document.addEventListener('click',(e)=>{
  const t=e.target.closest('button'); if(!t) return; const d=t.dataset;
  if(d.guide){guide(d.guide);return;}
  if(d.go){go(d.go);return;}
  if(d.open){UI.pid=d.open;const p=cur();if(d.to==='publish'){UI.ch=p.ch.naver.st==='fail'?'naver':'coupang';}go(d.to);return;}
  if(d.pick){const c=S.cands.find(x=>x.id===d.pick);UI.impTab='url';UI.url=c.url;UI.imp=null;UI.impFail=null;go('import');fetchUrl(c.url);return;}
  if(d.url){UI.url=d.url;const i=$('url');if(i)i.value=d.url;return;}
  if(d.imptab){UI.impTab=d.imptab;if(d.imptab==='url')UI.draft=null;render();return;}
  if(d.ch){UI.ch=d.ch;render();return;}
  if(d.fl!=null){const p=cur(), s=p.copy.segs[Number(d.fl)]; s.st=d.do; s.cur=d.do==='fixed'?s.fix:s.t; if(d.do==='open'){p.copy.checked=false;}
    toast({removed:'문장을 삭제했습니다.',fixed:'원본 정보에 맞게 고쳤습니다.',confirmed:'근거가 있는 표현으로 표시했습니다.',open:'처리를 되돌렸습니다.'}[d.do]);render();return;}
  const p=cur();
  switch(d.act){
    case 'toggleGuide': UI.guideOpen=!UI.guideOpen; renderGuide(); return;
    case 'resetF': UI.f=clone(SEEDF); render(); return;
    case 'fetch':{const u=$('url').value.trim(); UI.url=u; if(!u){toast('상품 주소를 넣어 주세요.','bad');$('url').focus();return;} fetchUrl(u); return;}
    case 'toManual': UI.impTab='manual'; UI.draft={kind:'goods',imgs:0}; render(); return;
    case 'imgUp': withLoading('사진 올리는 중...',()=>{UI.draft=UI.draft||{kind:'goods',imgs:0};UI.draft.imgs=(UI.draft.imgs||0)+3;const c=$('imgCnt');if(c)c.textContent=UI.draft.imgs+'장';toast('사진 3장을 올렸습니다. (시연)');}); return;
    case 'makeProd':{
      const name=$('i-name').value.trim(), cost=Number($('i-cost').value), sell=Number($('i-sell').value), eb=$('i-err');
      if(!name){eb.textContent='상품명을 입력해 주세요.';$('i-name').focus();return;}
      if(!cost||cost<=0){eb.textContent='공급가를 입력해 주세요.';$('i-cost').focus();return;}
      if(!sell||sell<=cost){eb.textContent='판매가는 공급가보다 커야 합니다.';$('i-sell').focus();return;}
      const base=UI.impTab==='url'?UI.imp:(UI.draft||{kind:'goods',imgs:0});
      const my=$('i-my').value, kind=my.indexOf('농산물')===0?'farm':'goods', origin=$('i-origin').value.trim();
      const opts=$('i-opts').value.split(',').map(x=>x.trim()).filter(Boolean); const ship=Number($('i-ship').value)||0;
      withLoading('상품 저장 중...',()=>{
        const id='P-'+(seqP++);
        const spec=kind==='farm'?{'품목':name.replace(/\s*\d+kg.*$/,''),'원산지':origin,'포장 단위별 용량':opts[0]||'','배송':(ship?'택배 '+won(ship)+'원':'무료 배송')}:{'품명':name,'제조국':origin,'제조자/수입자':'','배송':(ship?'택배 '+won(ship)+'원':'무료 배송')};
        S.prods.push({id,name,src:base.src||'직접 입력',url:base.url||'',kind,my,cost,ship,sell,opts,imgs:base.imgs||0,spec,copy:null,ch:{coupang:{st:'none'},naver:{st:'none'}},names:{}});
        if(UI.impTab==='manual') log('수집',id,true,'직접 입력으로 상품 등록');
        UI.pid=id;UI.imp=null;UI.draft=null;UI.impFail=null;UI.url='';
        toast(id+' 상품을 만들었습니다. 이어서 상세 문구를 만듭니다.');go('detail');});
      return;}
    case 'gen': withLoading('상세 문구와 썸네일 만드는 중...',()=>{generate(p);const n=openFlags(p);log('생성',p.id,true,'상세 문구 생성. 근거 없는 표현 '+n+'건 표시');toast('문구를 만들었습니다. 원본에 근거가 없는 표현 '+n+'건을 확인해 주세요.');render();},700); return;
    case 'toPublish': if(openFlags(p)) return; p.copy.checked=true; UI.ch='coupang'; go('publish'); return;
    case 'publish':{const ch=UI.ch;
      withLoading(CH[ch].l+'에 등록하는 중...',()=>{const r=tryPublish(p,ch);
        if(r.ok){p.ch[ch]={st:'ok',no:r.no};log('등록',p.id+' / '+CH[ch].l,true,'등록 완료. 상품번호 '+r.no);toast(CH[ch].l+'에 등록했습니다. 상품번호 '+r.no);}
        else {p.ch[ch]={st:'fail',err:{field:r.field,msg:r.msg}};log('등록',p.id+' / '+CH[ch].l,false,r.msg);toast(CH[ch].l+' 등록이 실패했습니다. 사유를 확인해 주세요.','bad');}
        render();},650); return;}
    case 'saveSet': withLoading('설정 저장 중...',()=>{
        document.querySelectorAll('[data-cm]').forEach(i=>{const [n,c]=i.dataset.cm.split('|');S.set.catMap[Number(n)][c]=i.value.trim();});
        document.querySelectorAll('[data-nm]').forEach(i=>{const v=Number(i.value);if(v>0)S.set.nameMax[i.dataset.nm]=v;});
        document.querySelectorAll('[data-fe]').forEach(i=>{const v=Number(i.value);if(v>=0)S.set.fee[i.dataset.fe]=v;});
        S.set.banned=$('ban').value.split(',').map(x=>x.trim()).filter(Boolean);
        toast('설정을 저장했습니다. 다음 등록부터 이 값으로 검사합니다.');render();}); return;
    case 'reset': withLoading('예시 데이터 복원 중...',()=>{S=clone(SEED);UI.pid='P-1001';toast('예시 데이터로 되돌렸습니다.');render();}); return;
  }
});
document.addEventListener('input',(e)=>{
  const i=e.target; if(!i.dataset) return;
  if(i.dataset.pname){const p=cur();p.names[UI.ch]=i.value;const c=$('pnameCnt'),max=S.set.nameMax[UI.ch];c.textContent=i.value.length+' / '+max+'자';c.className='small num '+(i.value.length>max?'cnt-bad':'cnt-ok');return;}
  if(i.dataset.notice){cur().spec[i.dataset.notice]=i.value;i.classList.toggle('invalid',!i.value.trim());return;}
});
document.addEventListener('change',(e)=>{
  const i=e.target;
  if(i.id==='psel'){UI.pid=i.value;render();return;}
  if(i.dataset&&i.dataset.f){const k=i.dataset.f;UI.f[k]=k==='free'?i.checked:k==='kind'?i.value:Number(i.value)||0;render();return;}
});
window.addEventListener('hashchange',route);
route();
})();
