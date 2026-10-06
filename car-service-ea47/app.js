(function(){
"use strict";
const ic=(n)=>'<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-'+n+'"/></svg>';
const seal='<svg class="i is" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-seal"/></svg>';
const esc=(s)=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=(id)=>document.getElementById(id);
const clone=(o)=>JSON.parse(JSON.stringify(o));
const nowHM=()=>{const d=new Date();return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');};

/* ===== 기준 데이터 (예시) ===== */
const CARS={
  '제네시스':{'G80':[{gen:'RG3',from:2020,to:2026},{gen:'DH',from:2016,to:2020}]},
  '현대':{'그랜저':[{gen:'GN7',from:2022,to:2026},{gen:'IG',from:2016,to:2022}]},
  '기아':{'쏘렌토':[{gen:'MQ4',from:2020,to:2026}]}
};
const SVC0=['썬팅','블랙박스','카오디오','PPF','랩핑','광택·디테일링','유리막','휠·타이어','정비·수리'];
const SYN={'썬팅':['썬팅','선팅','틴팅'],'블랙박스':['블랙박스','블박'],'카오디오':['카오디오','오디오','스피커'],'PPF':['PPF','피피에프','보호필름'],'랩핑':['랩핑','래핑'],'광택·디테일링':['광택','디테일링'],'유리막':['유리막','코팅'],'휠·타이어':['휠','타이어'],'정비·수리':['정비','수리','엔진오일']};
const MODEL_TOKENS=[['G80','제네시스','G80',null],['RG3','제네시스','G80','RG3'],['그랜저','현대','그랜저',null],['GN7','현대','그랜저','GN7'],['쏘렌토','기아','쏘렌토',null],['MQ4','기아','쏘렌토','MQ4']];
const C=(brand,model,gen,year,svcs,brands,note)=>({brand,model,gen,year,svcs,brands,note,photos:3});
const R=(who,car,rating,text,at,reply)=>({who,car,rating,text,at,reply:reply||'',type:'일반 후기'});
const V=(o)=>Object.assign({bizNo:'000-00-00000',bizChecked:true,bizPhoto:false,rejected:false,reason:''},o);
const SEED={
  car:{brand:'제네시스',model:'G80',year:2023,gen:'RG3'},
  svc:SVC0.slice(),
  shops:[
    V({id:'S1',name:'하늘 썬팅',owner:'김○○',city:'경기 여주시 홍문동',addr:'경기 여주시 홍문동 (예시 주소)',km:1.2,hours:'평일 09:00~19:00, 토 10:00~16:00',intro:'국산·수입 세단 썬팅과 유리막을 주로 합니다. 출고 당일 시공 가능.',svcs:['썬팅','PPF','유리막'],brands:{'썬팅':['솔라가드','루마','레이노'],'PPF':['3M'],'유리막':['자체 시공']},verified:true,resp:20,feat:'출고 당일 시공',applied:'09.28',
     cases:[C('제네시스','G80','RG3',2023,['썬팅'],['솔라가드'],'전면 35%, 측후면 15%'),C('제네시스','G80','RG3',2024,['썬팅','유리막'],['레이노','자체 시공'],'출고 당일 시공'),C('제네시스','G80','RG3',2022,['썬팅'],['루마'],'측후면 재시공'),C('현대','그랜저','GN7',2023,['PPF'],['3M'],'후드와 앞범퍼 부분 PPF')],
     reviews:[R('이○○','G80',5,'예약 없이 문의했는데 당일에 바로 해 주셨어요.','09-28','감사합니다. 다음에 또 들러 주세요.'),R('박○○','그랜저',4,'PPF 마감이 깔끔합니다.','09-20'),R('최○○','G80',5,'썬팅 농도 설명이 자세했습니다.','09-11')]}),
    V({id:'S2',name:'이천 PPF',owner:'정○○',city:'경기 이천시 마장면',addr:'경기 이천시 마장면 (예시 주소)',km:12.6,hours:'평일 10:00~19:00',intro:'PPF와 썬팅 전문점입니다.',svcs:['PPF','썬팅'],brands:{'PPF':['엑스펠','3M'],'썬팅':['루마']},verified:false,bizChecked:true,bizPhoto:true,resp:null,feat:'신규 입점',applied:'10.06',cases:[],reviews:[]}),
    V({id:'S3',name:'이천 디테일링',owner:'한○○',city:'경기 이천시 부발읍',addr:'경기 이천시 부발읍 (예시 주소)',km:9.4,hours:'매일 09:00~21:00',intro:'광택, 유리막, 썬팅을 함께 합니다.',svcs:['광택·디테일링','유리막','썬팅'],brands:{'광택·디테일링':['소낙스'],'유리막':['자체 시공'],'썬팅':['루마','레이노']},verified:true,resp:60,feat:'실내 작업장, 픽업 가능',applied:'09.27',
     cases:[C('현대','그랜저','GN7',2023,['광택·디테일링'],['소낙스'],'신차 광택과 유리막'),C('기아','쏘렌토','MQ4',2022,['썬팅'],['레이노'],'전체 썬팅')],
     reviews:[R('강○○','쏘렌토',5,'광택 후 차가 새것 같아요.','09-18')]}),
    V({id:'S4',name:'성남 오토케어',owner:'오○○',city:'경기 성남시 분당구',addr:'경기 성남시 분당구 (예시 주소)',km:41,hours:'평일 09:30~19:30',intro:'썬팅, 블랙박스, PPF를 한 번에 시공합니다.',svcs:['썬팅','블랙박스','PPF'],brands:{'썬팅':['솔라가드'],'블랙박스':['아이나비','파인뷰'],'PPF':['3M']},verified:true,resp:40,feat:'썬팅과 블랙박스 동시 시공',applied:'09.25',
     cases:[C('제네시스','G80','RG3',2023,['썬팅','블랙박스'],['솔라가드','아이나비'],'전면 35%, 2채널 블랙박스'),C('기아','쏘렌토','MQ4',2022,['블랙박스'],['파인뷰'],'주차 녹화 설정')],
     reviews:[R('임○○','G80',5,'블랙박스 배선 정리가 잘 되어 있었습니다.','09-22'),R('조○○','쏘렌토',4,'대기 시간이 조금 길었어요.','09-15','죄송합니다. 대기 안내를 더 정확히 드리겠습니다.')]}),
    V({id:'S5',name:'강남 랩핑스튜디오',owner:'서○○',city:'서울 강남구 논현동',addr:'서울 강남구 논현동 (예시 주소)',km:58,hours:'평일 10:00~20:00',intro:'랩핑, PPF, 썬팅.',svcs:['랩핑','PPF','썬팅'],brands:{'랩핑':['3M'],'PPF':['3M'],'썬팅':['루마']},verified:true,resp:120,feat:'수입차 전담 작업자',applied:'09.24',
     cases:[C('제네시스','G80','RG3',2023,['랩핑','썬팅'],['3M','루마'],'무광 블랙 랩핑과 썬팅'),C('제네시스','G80','RG3',2023,['썬팅'],['루마'],'전면 30%')],
     reviews:[R('신○○','G80',5,'상담이 자세합니다.','09-21'),R('문○○','G80',4,'결과는 만족, 일정이 조금 밀렸어요.','09-14'),R('유○○','그랜저',4,'랩핑 마감이 깔끔합니다.','09-08')]}),
    V({id:'S6',name:'여주 카오디오',owner:'윤○○',city:'경기 여주시 상동',addr:'경기 여주시 상동 (예시 주소)',km:3.8,hours:'평일 10:00~20:00',intro:'카오디오 튜닝과 블랙박스 장착.',svcs:['카오디오','블랙박스'],brands:{'카오디오':['포칼','모렐'],'블랙박스':['파인뷰']},verified:true,resp:25,feat:'시청 공간 있음',applied:'09.20',
     cases:[C('기아','쏘렌토','MQ4',2022,['카오디오'],['포칼'],'프런트 스피커 교체'),C('현대','그랜저','GN7',2023,['블랙박스'],['파인뷰'],'2채널, 주차 녹화 설정')],
     reviews:[R('백○○','쏘렌토',5,'소리 차이가 확실합니다.','09-25','세팅 값 문자로 보내 드렸습니다.')]}),
    V({id:'S7',name:'송파 휠타이어',owner:'남○○',city:'서울 송파구 문정동',addr:'서울 송파구 문정동 (예시 주소)',km:55,hours:'평일 09:00~18:00',intro:'휠, 타이어, 간단 정비.',svcs:['휠·타이어','정비·수리'],brands:{'휠·타이어':['금호','넥센'],'정비·수리':['순정 부품']},verified:true,resp:30,feat:'휠 얼라인먼트 장비',applied:'09.18',
     cases:[C('기아','쏘렌토','MQ4',2022,['휠·타이어'],['금호'],'19인치 타이어 4본')],
     reviews:[R('하○○','쏘렌토',4,'교체가 빨랐습니다.','09-10')]})
  ],
  inq:[{id:'Q-1001',shop:'S6',svc:'블랙박스',st:'업체 답변',reviewed:false,msgs:[{who:'me',t:'G80 RG3 2채널 블랙박스 장착 가능할까요?',at:'09:40'},{who:'shop',t:'네, 파인뷰 2채널 기준 1시간 정도 걸립니다. 방문 가능한 날 알려 주세요.',at:'09:58'}]}],
  home:[
    {k:'svc',label:'내 차에 맞는 자동차 서비스를 찾아보세요.',on:true,w:'big',desc:''},
    {k:'parts',label:'부품 찾기',on:true,w:'small',desc:'차량 → 부품 → 품번 → 판매업체'},
    {k:'goods',label:'자동차 용품',on:true,w:'small',desc:'세차용품 · 전자제품 · 거치대'},
    {k:'find',label:'전문가에게 질문',on:true,w:'small',desc:'사진과 차량 정보로 물어보기'},
    {k:'carid',label:'CAR ID',on:true,w:'small',desc:'보험 · 소모품 · 정비일 관리'},
    {k:'popular',label:'인기 서비스',on:false,w:'big',desc:'데이터가 쌓이면 켭니다'}
  ],
  find:[{q:'G80인데 어떤 블랙박스가 좋나요?',car:'제네시스 G80 RG3',photo:1,ans:{shop:'S6',t:'주차가 잦으면 주차 녹화 시간이 긴 제품을 권합니다. 방문하시면 설치 위치를 같이 보겠습니다.'}}],
  carid:[{k:'자동차 보험 시작일',v:'2026-03-02'},{k:'자동차 보험 만기일',v:'2027-03-01'},{k:'엔진오일 교체일',v:'2026-07-15'},{k:'최근 정비일',v:'2026-07-15'},{k:'다음 관리 예정일',v:'2027-01-15'}],
  cats:{'보조 기능':['부품 찾기','자동차 용품','전문가에게 질문','CAR ID']}
};
let S=clone(SEED);
let seq={q:1002};
const HOME_INFO={svc:'서비스 검색 · 버튼 9',parts:'부품 찾기',goods:'자동차 용품',find:'전문가에게 질문',carid:'CAR ID',popular:'인기 서비스'};
const SUB_ICON={parts:'ax-parts',goods:'ax-goods',find:'ax-find',carid:'ax-carid',svc:'search',popular:'ax-star'};
const SUB_VIEW={parts:'parts',goods:'goods',find:'find',carid:'carid',svc:'search',popular:'search'};

/* ===== 검색어 해석: 차량 + 서비스 + 브랜드. 이 함수 한 곳에서만 ===== */
function allBrands(){const b=new Set();S.shops.forEach(s=>Object.values(s.brands).forEach(a=>a.forEach(x=>b.add(x))));return [...b];}
function parseQuery(q){
  q=String(q||'').trim(); const out={car:null,svc:null,brand:null,q};
  const up=q.toUpperCase();
  MODEL_TOKENS.forEach(([t,b,m,g])=>{if(up.indexOf(t.toUpperCase())>=0){if(!out.car||g) out.car={brand:b,model:m,gen:g||(out.car&&out.car.gen)||null};}});
  if(out.car&&!out.car.gen&&S.car&&S.car.model===out.car.model) out.car.gen=S.car.gen;
  S.svc.forEach(s=>{(SYN[s]||[s]).forEach(w=>{if(!out.svc&&up.indexOf(w.toUpperCase())>=0) out.svc=s;});});
  allBrands().forEach(b=>{if(!out.brand&&up.indexOf(b.toUpperCase())>=0) out.brand=b;});
  return out;
}
/* 내 차 시공사례: 차량(모델·세대) + 해당 서비스 */
function caseFor(shop,car,svc){
  if(!car) return [];
  return shop.cases.filter(c=>c.model===car.model&&(!car.gen||c.gen===car.gen)&&(!svc||c.svcs.indexOf(svc)>=0));
}
const carTxt=(c)=>c?(c.brand?c.brand+' ':'')+c.model+(c.gen?' ('+c.gen+')':'')+(c.year?' '+c.year:''):'';
const rating=(s)=>s.reviews.length?(s.reviews.reduce((a,r)=>a+r.rating,0)/s.reviews.length).toFixed(1):'-';
const shopOf=(id)=>S.shops.find(s=>s.id===id);
const kmTxt=(k)=>(k<10?k.toFixed(1):String(Math.round(k)))+'km';
const respTxt=(s)=>s.resp==null?'응답 기록 없음':s.resp<60?'응답 약 '+s.resp+'분':'응답 약 '+Math.round(s.resp/60)+'시간';
const brandsOf=(s)=>[...new Set(Object.values(s.brands).flat())];
const vstate=(s)=>s.verified?'ok':s.rejected?'rej':'wait';

/* ===== state ===== */
const UI={role:'c',view:'home',id:null,q:'',sort:'dist',f:{mine:false,ver:false,brands:[]},cmp:[],guideOpen:null,guideStep:null,draft:null,caseForm:null,parts:{cat:'',pn:''},vf:'wait',vsel:null};
const CNAV=[['home','홈','home'],['search','검색','search'],['inq','문의','chat'],['car','내 차','car']];
const BNAV=[['info','업체 정보'],['cases','시공사례'],['binq','문의 관리'],['brev','후기 관리'],['verify','사업자 확인']];
const MNAV=[['dash','대시보드'],['mverify','사업자 확인'],['lists/shops','업체'],['cats','카테고리 · 서비스'],['homeset','홈 화면 설정'],['lists/cases','시공사례'],['lists/rev','후기'],['lists/inq','문의']];
const ROLE_SHOP={a:'S1',b:'S2'};
const resetF=()=>{UI.f={mine:false,ver:false,brands:[]};};
function navOf(r){return r==='c'?CNAV:r==='m'?MNAV:BNAV;}
function go(role,view,id){const h='#/'+role+'/'+view+(id?'/'+id:''); if(location.hash===h) route(); else location.hash=h;}
function route(){
  const p=location.hash.replace(/^#\/?/,'').split('/');
  UI.role=['c','a','b','m'].indexOf(p[0])>=0?p[0]:'c';
  const extra={c:['shop','compare','parts','goods','find','carid'],a:['casenew'],b:['casenew'],m:[]}[UI.role];
  const list=navOf(UI.role).map(v=>v[0].split('/')[0]).concat(extra);
  UI.view=list.indexOf(p[1])>=0?p[1]:navOf(UI.role)[0][0]; UI.id=p.slice(2).join('/')||null;
  if(Date.now()-(toast.at||0)>300) $('toastHost').innerHTML='';
  render(); window.scrollTo(0,0);
}
function toast(msg,kind){toast.at=Date.now();const h=$('toastHost');h.innerHTML='<div class="toast'+(kind==='bad'?' bad':'')+'" role="status">'+ic(kind==='bad'?'alert':'check')+'<span>'+esc(msg)+'</span></div>';clearTimeout(toast.t);toast.t=setTimeout(()=>{h.innerHTML='';},3200);}
let busy=false;
function withLoading(msg,fn,ms){if(busy)return;busy=true;$('overlayHost').innerHTML='<div class="overlay" role="status" aria-live="assertive"><div class="ob"><span class="spin" aria-hidden="true"></span><span>'+esc(msg)+'</span></div></div>';setTimeout(()=>{$('overlayHost').innerHTML='';busy=false;fn();},ms||460);}
const st=(t,k)=>'<span class="st '+k+'">'+esc(t)+'</span>';
const empty=(i,t,d,b)=>'<div class="empty">'+ic(i)+'<strong>'+esc(t)+'</strong><p>'+esc(d)+'</p>'+(b||'')+'</div>';
const btn=(o)=>'<button type="button" class="btn '+(o.cls||'')+'" '+(o.attrs||'')+'>'+(o.icon?ic(o.icon):'')+esc(o.label)+'</button>';
const head=(t,sub,extra)=>'<div class="ph"><div><h1>'+t+'</h1>'+(sub?'<div class="sub">'+sub+'</div>':'')+'</div>'+(extra?'<div class="ph-actions">'+extra+'</div>':'')+'</div>';
const vb=(s)=>s.verified?'<span class="vbadge">'+seal+'사업자 확인</span>':'<span class="pending">사업자 확인 전</span>';
const STEPS=['접수','업체 답변','상담 진행','완료'];

/* ===== 홈: 섹션 데이터로 그린다 (관리자 홈 설정 미리보기와 같은 함수) ===== */
function renderHome(cfg){
  const secs=cfg.filter(s=>s.on);
  let h='<div class="home">'; const smalls=[];
  secs.forEach(s=>{
    if(s.k==='svc'){
      h+='<h1>'+esc(s.label)+'</h1><form class="qform" data-qform="1"><div class="search">'+ic('search')+'<label class="sr" for="hq">서비스 검색</label><input id="hq" class="f" type="search" placeholder="썬팅, 블랙박스, 카오디오, PPF…" value=""></div>'+btn({cls:'pri',label:'검색',attrs:'data-act="hsearch"'})+'</form>';
      h+=s.w==='big'?'<div class="svcgrid" role="group" aria-label="서비스">'+S.svc.map(v=>'<button type="button" data-svc="'+esc(v)+'">'+esc(v)+'</button>').join('')+'</div>'
        :'<div class="svcchips" role="group" aria-label="서비스">'+S.svc.map(v=>'<button type="button" data-svc="'+esc(v)+'">'+esc(v)+'</button>').join('')+'</div>';
      h+='<p class="homeline">내 차 기준으로 서비스 가능한 업체를 거리순으로 보여 드려요.</p>';
      return;
    }
    if(s.w==='small'){smalls.push(s);return;}
    if(s.k==='popular') h+='<button type="button" class="bigsec" data-svc="썬팅"><b>'+esc(s.label)+'</b><span>이번 주 문의가 많은 서비스: 썬팅, 블랙박스, PPF (예시)</span></button>';
    else h+='<button type="button" class="bigsec" data-sub="'+s.k+'"><b>'+esc(s.label)+'</b><span>'+esc(s.desc)+'</span></button>';
  });
  if(smalls.length) h+='<section class="subrow" aria-label="보조 기능"><div class="items">'+smalls.map(s=>'<button type="button" data-sub="'+s.k+'"><span class="c">'+ic(SUB_ICON[s.k])+'</span>'+esc(s.label)+'</button>').join('')+'</div></section>';
  return h+'</div>';
}
function viewHome(){
  return renderHome(S.home)+'<p class="homenote" style="max-width:880px;margin:16px auto 0">지역을 먼저 고르지 않습니다. 업체 목록에서 거리와 위치를 함께 보여 드립니다. 예약 없이 채팅이나 전화로 문의합니다.</p>';
}

/* ===== 소비자: 내 차 ===== */
function viewCar(){
  const c=S.car||{}; const models=c.brand?Object.keys(CARS[c.brand]):[]; const gens=c.brand&&c.model?CARS[c.brand][c.model]:[];
  const years=[];gens.forEach(g=>{for(let y=g.from;y<=g.to;y++)if(years.indexOf(y)<0)years.push(y);});years.sort((a,b)=>b-a);
  const gopts=gens.filter(g=>!c.year||(c.year>=g.from&&c.year<=g.to));
  const sel=(id,lab,opts,val,ph)=>'<div><label for="'+id+'" class="small" style="display:block;margin-bottom:4px">'+lab+'</label><select id="'+id+'" class="f" style="width:100%" data-car="'+id+'"><option value="">'+ph+'</option>'+opts.map(o=>'<option value="'+esc(o[0])+'"'+(String(o[0])===String(val)?' selected':'')+'>'+esc(o[1])+'</option>').join('')+'</select></div>';
  return head('내 차 등록','브랜드, 모델, 연식, 세대를 고르면 업체 목록에서 내 차 시공사례가 있는 업체를 표시합니다. 트림은 고르지 않아도 됩니다.')+
    '<div class="box"><div class="carsel" style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px">'+
      sel('c-brand','브랜드',Object.keys(CARS).map(k=>[k,k]),c.brand,'선택')+
      sel('c-model','모델',models.map(k=>[k,k]),c.model,c.brand?'선택':'브랜드 먼저')+
      sel('c-year','연식',years.map(y=>[y,y+'년']),c.year,c.model?'선택':'모델 먼저')+
      sel('c-gen','세대',gopts.map(g=>[g.gen,g.gen+' ('+g.from+'~'+g.to+')']),c.gen,c.year?'선택':'연식 먼저')+
    '</div></div>'+
    '<h2 class="sh">등록된 차량</h2><div class="box" style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap"><b>'+esc(c.gen?carTxt(c):'등록된 차량 없음')+'</b>'+btn({cls:'pri',icon:'search',label:'내 차 서비스 찾기',attrs:'data-go2="home"'+(c.gen?'':' disabled')})+'</div>';
}

/* ===== 소비자: 검색 결과(업체 목록) ===== */
function searchShops(){
  const p=parseQuery(UI.q);
  let list=S.shops.filter(s=>{
    if(s.rejected) return false;
    if(p.svc&&s.svcs.indexOf(p.svc)<0) return false;
    if(p.brand&&!Object.values(s.brands).some(a=>a.indexOf(p.brand)>=0)) return false;
    if(!p.svc&&!p.brand&&p.q&&!p.car&&(s.name+s.intro+s.svcs.join('')).indexOf(p.q)<0) return false;
    return true;
  });
  const base=list.slice();
  const car=p.car||S.car;
  list=list.map(s=>({s,mine:caseFor(s,car,p.svc)}));
  if(UI.f.mine) list=list.filter(x=>x.mine.length);
  if(UI.f.ver) list=list.filter(x=>x.s.verified);
  if(UI.f.brands.length) list=list.filter(x=>UI.f.brands.some(b=>(p.svc?(x.s.brands[p.svc]||[]):brandsOf(x.s)).indexOf(b)>=0));
  const sorters={dist:(a,b)=>a.s.km-b.s.km,rev:(a,b)=>b.s.reviews.length-a.s.reviews.length||a.s.km-b.s.km,resp:(a,b)=>(a.s.resp==null?999:a.s.resp)-(b.s.resp==null?999:b.s.resp)};
  list.sort(sorters[UI.sort]);
  return {p,car,list,base};
}
function shopCard(x,p,car){
  const s=x.s, rep=x.mine[0]||s.cases[0];
  const inCmp=UI.cmp.indexOf(s.id)>=0;
  const svcs=p.svc?[p.svc].concat(s.svcs.filter(v=>v!==p.svc)):s.svcs;
  return '<article class="shop'+(inCmp?' sel':'')+'"><div class="row"><div class="ph2" aria-hidden="true">'+(rep?esc(rep.model+' '+rep.svcs[0])+'\n사례 사진':'대표 사례\n사진')+'</div><div class="info">'+
    '<div class="nm"><button type="button" data-shop="'+s.id+'">'+esc(s.name)+'</button>'+vb(s)+'</div>'+
    '<div class="ln"><b>'+kmTxt(s.km)+'</b> · '+esc(s.city)+'</div>'+
    '<div class="ln">'+esc(svcs.join(' · '))+'</div>'+
    '<div class="ln">'+esc((p.svc&&s.brands[p.svc]?s.brands[p.svc]:brandsOf(s)).join(' · '))+'</div></div></div>'+
    '<div class="srow"><span class="mycase '+(x.mine.length?'yes':'no')+'">'+(car?(x.mine.length?'내 차('+esc(car.model)+') 사례 '+x.mine.length+'건':'내 차 사례 없음'):'')+'</span><span>후기 '+s.reviews.length+(s.reviews.length?' · '+rating(s):'')+' · '+respTxt(s)+'</span></div>'+
    '<div class="sacts"><label class="cmpbox'+(inCmp?' on':'')+'"><input type="checkbox" data-cmpc="'+s.id+'"'+(inCmp?' checked':'')+'>비교 담기</label>'+btn({cls:'pri',label:'채팅 문의',attrs:'data-newinq="'+s.id+'"'})+'</div></article>';
}
function viewSearch(){
  const {p,car,list,base}=searchShops();
  const fb=[...new Set(base.map(s=>p.svc?(s.brands[p.svc]||[]):brandsOf(s)).flat())];
  const parsed=(p.car||p.svc||p.brand)?'<div class="parsebox"><span class="k">이렇게 찾았어요</span>'+(p.car?'<span><span class="k">차량</span> <b>'+esc(carTxt(p.car))+'</b></span>':'')+(p.svc?'<span><span class="k">서비스</span> <b>'+esc(p.svc)+'</b></span>':'')+(p.brand?'<span><span class="k">브랜드</span> <b>'+esc(p.brand)+'</b></span>':'')+'</div>'
    :'<div class="parsebox"><span class="k">검색어를 차량과 서비스로 나눠 읽습니다. 예: G80 썬팅</span></div>';
  const aside='<aside class="faside" aria-label="필터">'+parsed+
    '<fieldset><legend>조건</legend><label class="chk"><input type="checkbox" id="fMine"'+(UI.f.mine?' checked':'')+'>내 차 시공사례 있음</label><label class="chk"><input type="checkbox" id="fVer"'+(UI.f.ver?' checked':'')+'>사업자 확인</label></fieldset>'+
    (fb.length?'<fieldset><legend>'+esc(p.svc?p.svc+' 브랜드':'취급 브랜드')+'</legend>'+fb.map(b=>'<label class="chk"><input type="checkbox" data-fb="'+esc(b)+'"'+(UI.f.brands.indexOf(b)>=0?' checked':'')+'>'+esc(b)+'</label>').join('')+'</fieldset>':'')+
    '<div class="fnote">필터는 실제 데이터가 있는 항목만 표시합니다.</div></aside>';
  const sortBtn=(k,l)=>'<button type="button" data-sort="'+k+'" aria-pressed="'+(UI.sort===k)+'">'+l+'</button>';
  return '<form class="qform m-only" data-qform="1" style="margin-bottom:10px"><div class="search">'+ic('search')+'<label class="sr" for="q">검색어</label><input id="q" class="f" type="search" placeholder="예: G80 썬팅" value="'+esc(UI.q)+'"></div>'+btn({cls:'pri',label:'검색',attrs:'data-act="search"'})+'</form>'+
    '<div class="srch">'+aside+'<div>'+
    '<p class="hint">예시 <button type="button" data-ex="G80 썬팅">G80 썬팅</button> <button type="button" data-ex="아이나비 블랙박스">아이나비 블랙박스</button> <button type="button" data-ex="PPF">PPF</button></p>'+
    '<div class="rhead"><div class="cntline">'+esc(p.svc?p.svc+' 가능 업체':'업체')+' <b>'+list.length+'곳</b> · 내 위치 기준 직선 거리</div><div class="seg" role="group" aria-label="정렬">'+sortBtn('dist','가까운 순')+sortBtn('rev','후기 많은 순')+sortBtn('resp','응답 빠른 순')+'</div></div>'+
    (list.length?'<div class="shoplist">'+list.map(x=>shopCard(x,p,car)).join('')+'</div>':empty('search','조건에 맞는 업체가 없습니다','필터를 풀거나 다른 서비스로 찾아보세요.','<button type="button" class="btn" data-act="resetF">필터 풀기</button>'))+
    '<p class="note">'+ic('alert')+' 내 차 시공사례가 없는 업체도 목록에서 빼지 않습니다. 사례 유무는 표시와 필터로만 씁니다. 거리는 업체 주소와 현재 위치 사이의 직선 거리(예시)입니다.</p></div></div>';
}

/* ===== 소비자: 업체 상세 ===== */
function viewShop(){
  const s=shopOf(UI.id); if(!s) return empty('store','업체를 찾을 수 없습니다','검색에서 다시 골라 주세요.');
  const car=S.car;
  return '<div class="bar"><button type="button" class="btn" data-go2="search">'+ic('left')+'목록</button></div>'+
    '<div class="dhead"><div><h1>'+esc(s.name)+' '+vb(s)+'</h1><div class="meta2" style="font-size:14px;color:var(--text-2)"><b style="color:var(--text)">'+kmTxt(s.km)+'</b> · '+esc(s.city)+' · '+respTxt(s)+'</div></div>'+
      '<div class="cta">'+btn({cls:'pri',label:'채팅 문의',attrs:'data-newinq="'+s.id+'"'})+btn({cls:'out',label:'전화 문의',attrs:'data-act="tel"'})+'</div></div>'+
    (s.verified?'<div class="vnote">'+seal+'<span><b>사업자 정보가 확인된 업체입니다.</b> 품질이나 시공 결과를 보증하지 않습니다.</span></div>':'<div class="vnote wait">'+ic('shield')+'<span>사업자 정보 확인 전인 업체입니다.</span></div>')+
    '<div class="two" style="margin-top:20px"><div><h2 class="sh" style="margin-top:0">기본 정보</h2><div class="tw"><table class="t"><tbody>'+
      '<tr><th style="width:90px">주소</th><td>'+esc(s.addr)+'</td></tr><tr><th>영업시간</th><td>'+esc(s.hours)+'</td></tr><tr><th>전화</th><td>전화 문의 버튼으로 연결</td></tr><tr><th>소개</th><td>'+esc(s.intro)+'</td></tr><tr><th>특징</th><td>'+esc(s.feat)+'</td></tr></tbody></table></div></div>'+
      '<div><h2 class="sh" style="margin-top:0">서비스와 취급 브랜드</h2><div class="tw"><table class="t"><tbody>'+s.svcs.map(v=>'<tr><th style="width:120px">'+esc(v)+'</th><td>'+esc((s.brands[v]||[]).join(' · ')||'-')+'</td></tr>').join('')+'</tbody></table></div></div></div>'+
    '<h2 class="sh">시공사례 <span class="meta">'+s.cases.length+'건'+(car?' · 내 차('+esc(car.model+' '+car.gen)+') '+caseFor(s,car).length+'건':'')+'</span></h2>'+
    (s.cases.length?'<div class="cases">'+s.cases.map(c=>'<div class="case"><div class="img" aria-hidden="true">사진 '+c.photos+'장</div><div class="bd"><b>'+esc(c.model+' '+c.gen+' · '+c.year)+'</b>'+esc(c.svcs.join(' + '))+' · '+esc(c.brands.join(' · '))+'<div class="small">'+esc(c.note)+'</div></div></div>').join('')+'</div>':empty('camera','아직 등록된 시공사례가 없어요','업체가 사례를 올리면 차량, 작업, 브랜드별로 여기에 나옵니다.'))+
    '<h2 class="sh">후기 <span class="meta">'+s.reviews.length+'개'+(s.reviews.length?' · 평점 '+rating(s):'')+'</span></h2>'+
    (s.reviews.length?s.reviews.map(r=>'<div class="rv"><div class="top2"><span class="stars" aria-label="'+r.rating+'점">'+'★'.repeat(r.rating)+'</span><span>'+esc(r.who)+' · '+esc(r.car)+' · '+esc(r.at)+'</span><span class="small">'+esc(r.type)+'</span></div><div>'+esc(r.text)+'</div>'+(r.reply?'<div class="reply"><b>업체 답변</b> '+esc(r.reply)+'</div>':'')+'</div>').join(''):empty('star','아직 후기가 없어요','문의를 마친 이용자가 후기를 남길 수 있습니다.'));
}

/* ===== 소비자: 비교 ===== */
function viewCompare(){
  const list=UI.cmp.map(shopOf).filter(Boolean);
  if(list.length<2) return head('업체 비교')+empty('columns','비교할 업체를 2곳 이상 담아 주세요','업체 목록에서 비교 담기를 누르면 최대 3곳까지 나란히 볼 수 있습니다.','<button type="button" class="btn pri" data-go2="search">업체 목록</button>');
  const p=parseQuery(UI.q); const car=p.car||S.car;
  const row=(k,f)=>'<tr><th>'+k+'</th>'+list.map(s=>'<td>'+f(s)+'</td>').join('')+'</tr>';
  return head('업체 비교','가격 비교가 아니라 선택에 필요한 정보를 나란히 봅니다. 가격은 차량, 제품, 작업 범위에 따라 달라 문의로 확인합니다.')+
    '<div class="tw"><table class="t cmp"><thead><tr><th style="width:150px"></th>'+list.map(s=>'<th>'+esc(s.name)+'</th>').join('')+'</tr></thead><tbody>'+
    row('거리',s=>'<b>'+kmTxt(s.km)+'</b> <span class="small">'+esc(s.city)+'</span>')+
    row('서비스 범위',s=>esc(s.svcs.join(' · ')))+
    row('취급 브랜드',s=>esc(brandsOf(s).join(' · ')))+
    row('내 차 시공사례',s=>{const n=caseFor(s,car,p.svc).length;return n?'<b style="color:var(--accent)">'+n+'건</b>':'<span class="small">없음</span>';})+
    row('후기',s=>s.reviews.length+'개'+(s.reviews.length?' · 평점 '+rating(s):''))+
    row('사업자 확인',s=>vb(s))+
    row('업체 특징',s=>esc(s.feat))+
    row('문의 응답',s=>respTxt(s).replace('응답 ',''))+
    row('',s=>btn({cls:'sm pri',label:'채팅 문의',attrs:'data-newinq="'+s.id+'"'}))+
    '</tbody></table></div>';
}

/* ===== 소비자: 문의 ===== */
function stepper(stt){const i=STEPS.indexOf(stt);return '<ol class="steps4" aria-label="문의 상태">'+STEPS.map((x,k)=>'<li class="'+(k<i?'done':k===i?'cur':'')+'"'+(k===i?' aria-current="step"':'')+'><i></i>'+x+'</li>').join('')+'</ol>';}
function thread(q,me){
  return '<div class="thread" aria-live="polite">'+q.msgs.map(m=>'<div class="msg'+((m.who==='me')===me?' me':'')+'">'+esc(m.t)+'<small>'+(m.who==='me'?'고객':shopOf(q.shop).name)+' '+m.at+'</small></div>').join('')+'</div>';
}
function viewInq(){
  if(UI.id&&UI.id.indexOf('new/')===0){const s=shopOf(UI.id.slice(4));const car=S.car;const qs=parseQuery(UI.q).svc;const svc=qs&&s.svcs.indexOf(qs)>=0?qs:s.svcs[0];
    return head(esc(s.name)+'에 채팅 문의','예약 없이 문의합니다. 업체가 답하면 이 화면과 문의함에서 확인합니다.')+stepper('접수')+
      '<div class="composer"><label class="sr" for="firstMsg">문의 내용</label><textarea id="firstMsg" rows="3">'+esc((car?car.model+' '+car.gen+' '+car.year+'년식, ':'')+svc+' 문의드립니다. 가능한 날짜와 대략적인 비용 범위가 궁금합니다.')+'</textarea>'+btn({cls:'pri',icon:'chat',label:'보내기',attrs:'data-act="sendFirst" data-sid="'+s.id+'" data-isvc="'+esc(svc)+'"'})+'</div>';}
  if(UI.id){const q=S.inq.find(x=>x.id===UI.id); if(q){const s=shopOf(q.shop);
    return '<div class="bar"><button type="button" class="btn" data-go2="inq">'+ic('left')+'문의함</button></div>'+head(esc(s.name)+' · '+esc(q.svc),'문의 '+q.id)+stepper(q.st)+thread(q,true)+
      (q.st!=='완료'?'<div class="composer"><label class="sr" for="cmsg">메시지</label><textarea id="cmsg" rows="2" placeholder="메시지 입력"></textarea>'+btn({cls:'pri',icon:'chat',label:'보내기',attrs:'data-cmsg="'+q.id+'"'})+'</div>'+
        '<div class="acts" style="justify-content:space-between">'+btn({icon:'refresh',label:'새 답변 확인',attrs:'data-refresh="'+q.id+'"'})+(q.st!=='접수'?btn({icon:'check',label:'상담을 마쳤어요',attrs:'data-done="'+q.id+'"'}):'')+'</div>'+
        '<p class="small">1차는 실시간 채팅이 아니라 메시지 스레드입니다. 새 답변은 새로고침하거나 이 버튼으로 확인합니다.</p>':
        (q.reviewed?'<p class="note">'+ic('check')+' 후기를 남겼습니다. 업체 상세의 후기 목록에 나옵니다.</p>':
        '<h2 class="sh">후기 남기기 <span class="meta">문의를 마친 건에만</span></h2><div class="box"><label for="rvStar" class="small">평점</label> <select id="rvStar" class="f">'+[5,4,3,2,1].map(n=>'<option value="'+n+'">'+n+'점</option>').join('')+'</select><label for="rvText" class="sr">후기</label><textarea id="rvText" class="f" rows="3" style="width:100%;margin-top:8px;padding:8px;height:auto" placeholder="이용 후기를 적어 주세요"></textarea><div class="acts">'+btn({cls:'pri',icon:'star',label:'후기 등록',attrs:'data-review="'+q.id+'"'})+'</div></div>'));}}
  const list=S.inq.slice().reverse();
  return head('문의함','채팅이나 전화로 문의한 업체입니다. 상태는 접수, 업체 답변, 상담 진행, 완료 순으로 바뀝니다.')+
    (list.length?'<div class="tw rl rl-kv"><table class="t"><thead><tr><th>업체</th><th>서비스</th><th>상태</th><th>마지막 메시지</th><th></th></tr></thead><tbody>'+
      list.map(q=>'<tr><td data-k="업체"><b>'+esc(shopOf(q.shop).name)+'</b></td><td data-k="서비스">'+esc(q.svc)+'</td><td class="stc">'+st(q.st,q.st==='완료'?'ok':q.st==='접수'?'mute':'info')+'</td><td class="full small">'+esc(q.msgs[q.msgs.length-1].t.slice(0,40))+'</td><td class="r full">'+btn({cls:'sm',icon:'right',label:'열기',attrs:'data-openq="'+q.id+'"'})+'</td></tr>').join('')+'</tbody></table></div>'
      :empty('chat','문의한 업체가 없어요','업체 상세에서 채팅 문의를 눌러 시작하세요.','<button type="button" class="btn pri" data-go2="search">업체 찾기</button>'));
}

/* ===== 소비자: 보조 기능 4 ===== */
const SUBL='<span class="sublabel">보조 기능</span>';
const PARTS={'브레이크 패드 (앞)':[['58101-T1A00 (예시)',[['판매업체 가',52000],['판매업체 나',49500]]]],'와이퍼 블레이드':[['98350-T1000 (예시)',[['판매업체 다',17500]]]],'에어컨 필터':[['97133-T1000 (예시)',[['판매업체 가',10500],['판매업체 다',9800]]]]};
function viewParts(){
  const c=S.car; const pp=UI.parts;
  return head('부품 찾기'+SUBL,'차량에서 부품, 품번으로 내려가 판매업체를 봅니다. 1차는 조회까지이고 구매는 커머스 단계에서 붙입니다.')+
    '<div class="tw"><table class="t"><tbody><tr><th style="width:90px">차량</th><td>'+esc(c&&c.gen?carTxt(c):'내 차를 먼저 등록해 주세요')+'</td></tr>'+
    '<tr><th>부품</th><td><div class="pick">'+Object.keys(PARTS).map(k=>'<button type="button" data-pcat="'+esc(k)+'" aria-pressed="'+(pp.cat===k)+'">'+esc(k)+'</button>').join('')+'</div></td></tr>'+
    (pp.cat?'<tr><th>품번</th><td><div class="pick">'+PARTS[pp.cat].map(x=>'<button type="button" data-ppn="'+esc(x[0])+'" aria-pressed="'+(pp.pn===x[0])+'">'+esc(x[0])+'</button>').join('')+'</div></td></tr>':'')+
    '</tbody></table></div>'+
    (pp.cat&&pp.pn?'<h2 class="sh">판매업체</h2><div class="tw"><table class="t"><thead><tr><th>판매업체</th><th class="r">가격</th></tr></thead><tbody>'+PARTS[pp.cat].find(x=>x[0]===pp.pn)[1].map(s=>'<tr><td>'+s[0]+'</td><td class="r num">'+s[1].toLocaleString('ko-KR')+'원</td></tr>').join('')+'</tbody></table></div>':'');
}
function viewGoods(){
  const G=[['세차용품','카샴푸, 극세사 타월'],['차량용 전자제품','차량용 공기청정기'],['거치대','송풍구 거치대'],['충전기','고속 차량 충전기']];
  return head('자동차 용품'+SUBL,'1차는 목록만 보여 줍니다. 상품 데이터와 판매업체가 쌓이면 검색, 비교, 구매로 넓힙니다.')+
    '<div class="tw"><table class="t"><thead><tr><th>분류</th><th>예시 상품</th></tr></thead><tbody>'+G.map(g=>'<tr><td>'+g[0]+'</td><td>'+g[1]+'</td></tr>').join('')+'</tbody></table></div>';
}
function viewFind(){
  return head('전문가에게 질문'+SUBL,'무엇을 검색해야 할지 모를 때 사진, 차량 정보와 함께 질문하면 업체 전문가가 답합니다.')+
    '<div class="box"><label for="fq" class="small" style="display:block;margin-bottom:4px">질문</label><textarea id="fq" class="f" rows="3" style="width:100%;padding:8px;height:auto" placeholder="예: 이 부품 이름이 뭔가요?"></textarea>'+
    '<div class="bar" style="margin:8px 0 0">'+btn({icon:'camera',label:'사진 첨부 (예시)',attrs:'data-act="fphoto"'})+'<span class="small" id="fphotoN">사진 0장</span><span class="small">차량: '+esc(S.car&&S.car.gen?carTxt(S.car):'미등록')+'</span><span class="grow"></span>'+btn({cls:'pri',icon:'ask',label:'질문 등록',attrs:'data-act="fask"'})+'</div></div>'+
    '<h2 class="sh">질문과 답변</h2>'+S.find.slice().reverse().map(f=>'<div class="rv"><div><b>Q.</b> '+esc(f.q)+' <span class="small">'+esc(f.car)+' · 사진 '+f.photo+'장</span></div>'+(f.ans?'<div class="reply"><b>'+esc(shopOf(f.ans.shop).name)+'</b> '+esc(f.ans.t)+'</div>':'<div class="small" style="margin-top:4px">답변 대기 중</div>')+'</div>').join('');
}
function viewCarid(){
  return head('CAR ID'+SUBL,'내 차 관리 일정을 직접 적어 둡니다. 1차는 수동 입력이고, 보험이나 차량 자동 연동은 하지 않습니다.',btn({cls:'pri',icon:'check',label:'저장',attrs:'data-act="caridSave"'}))+
    '<div class="tw"><table class="t"><tbody><tr><th style="width:170px">차량</th><td>'+esc(S.car&&S.car.gen?carTxt(S.car):'미등록')+'</td></tr>'+
    S.carid.map((r,i)=>'<tr><th><label for="cid-'+i+'">'+esc(r.k)+'</label></th><td><input type="date" class="f" id="cid-'+i+'" data-cid="'+i+'" value="'+esc(r.v)+'"></td></tr>').join('')+'</tbody></table></div>'+
    '<p class="note">'+ic('alert')+' 알림은 앱 푸시를 붙이는 단계에서 함께 씁니다.</p>';
}

/* ===== 업체 ===== */
function myShop(){return shopOf(ROLE_SHOP[UI.role]);}
function viewInfo(){
  const s=myShop();
  const f=(lab,val,id)=>'<tr><th style="width:110px"><label for="'+id+'">'+lab+'</label></th><td><input class="f" id="'+id+'" style="width:100%" value="'+esc(val)+'"></td></tr>';
  return head('업체 정보','가입 때 입력한 정보입니다. 서비스는 여러 개 고를 수 있고, 서비스마다 취급 브랜드를 적습니다.',btn({cls:'pri',icon:'check',label:'저장',attrs:'data-act="infoSave"'}))+
    '<div class="two"><div class="tw"><table class="t"><tbody>'+f('업체명',s.name,'bi-name')+f('대표자',s.owner,'bi-owner')+'<tr><th>전화</th><td><span class="small">대표 번호 (예시에서는 표시하지 않음)</span></td></tr>'+f('주소',s.addr,'bi-addr')+f('영업시간',s.hours,'bi-hours')+f('소개',s.intro,'bi-intro')+
      '<tr><th>사진</th><td><div class="photos"><span></span><span></span><span></span></div></td></tr></tbody></table></div>'+
    '<div><div class="tw"><table class="t"><thead><tr><th>서비스</th><th>취급 브랜드</th></tr></thead><tbody>'+S.svc.map(v=>{const on=s.svcs.indexOf(v)>=0;return '<tr><td><label class="chk"><input type="checkbox" data-bsvc="'+esc(v)+'"'+(on?' checked':'')+'>'+esc(v)+'</label></td><td><label class="sr" for="bb-'+esc(v)+'">'+esc(v)+' 브랜드</label><input class="f" id="bb-'+esc(v)+'" data-bbr="'+esc(v)+'" style="width:100%" value="'+esc((s.brands[v]||[]).join(', '))+'"'+(on?'':' disabled')+' placeholder="쉼표로 구분"></td></tr>';}).join('')+'</tbody></table></div></div></div>'+
    '<p class="note">'+ic('alert')+' 업체 계정은 나중에 담당자 여러 명이 쓰는 구조로 넓힐 수 있게 설계합니다.</p>';
}
function viewVerify(){
  const s=myShop();
  if(s.verified) return head('사업자 확인')+'<div class="vnote">'+seal+'<span><b>사업자 확인이 끝났습니다.</b> 소비자 화면에 사업자 확인 표시가 나옵니다.</span></div>';
  return head('사업자 확인','사업자등록번호로 조회하거나 사업자등록증 사진을 올리면, 운영자가 확인한 뒤 표시가 붙습니다.')+
    '<div class="vnote wait">'+ic('shield')+'<span><b>'+(s.rejected?'반려됨':'확인 대기')+'</b> '+(s.rejected?'사유: '+esc(s.reason)+'. 다시 제출해 주세요.':'운영자가 확인 중입니다. 확인 전에도 업체 정보와 시공사례는 등록할 수 있습니다.')+'</span></div>'+
    '<div class="two" style="margin-top:16px"><div class="box"><h2 class="sh" style="margin-top:0">사업자등록번호 조회</h2><div class="bar"><label for="bizno" class="sr">사업자등록번호</label><input id="bizno" class="f" value="000-00-00000" style="width:180px">'+btn({label:'조회',attrs:'data-act="bizCheck"'})+'</div><div class="small">'+(s.bizChecked?'조회 결과: 계속사업자, 상호·대표자 일치 (예시)':'')+'</div></div>'+
    '<div class="box"><h2 class="sh" style="margin-top:0">사업자등록증 사진</h2><div class="bar">'+btn({icon:'camera',label:'사진 올리기 (예시)',attrs:'data-act="bizPhoto"'})+'<span class="small">'+(s.bizPhoto?'등록증 1장 제출됨':'제출 전')+'</span></div></div></div>';
}
function viewCases(){
  const s=myShop();
  return head('시공사례',s.name+'의 사례입니다. 차량, 작업, 제품, 사진이 구조로 저장되어 소비자 검색의 내 차 사례에 쓰입니다.',btn({cls:'pri',icon:'plus',label:'시공사례 등록',attrs:'data-act="caseNew"'}))+
    (s.cases.length?'<div class="tw rl rl-kv"><table class="t"><thead><tr><th>차량</th><th>작업</th><th>제품</th><th class="r">사진</th><th>한 줄 설명</th></tr></thead><tbody>'+s.cases.map(c=>'<tr><td class="full"><b>'+esc(c.model+' '+c.gen+' · '+c.year)+'</b></td><td data-k="작업">'+esc(c.svcs.join(' + '))+'</td><td data-k="제품">'+esc(c.brands.join(' · '))+'</td><td data-k="사진" class="r num">'+c.photos+'</td><td class="full small">'+esc(c.note)+'</td></tr>').join('')+'</tbody></table></div>'
      :'<div class="empty" style="background:#fff">'+ic('camera')+'<strong>아직 등록한 시공사례가 없어요</strong><p>차량과 작업만 고르면 30초 안에 올릴 수 있어요.</p><button type="button" class="btn out" data-act="caseNew">시공사례 등록</button></div>');
}
const QUICK=[['제네시스','G80','RG3',2023],['현대','그랜저','GN7',2023],['기아','쏘렌토','MQ4',2022]];
function viewCaseNew(){
  const s=myShop(); const f=UI.caseForm||(UI.caseForm={brand:'',model:'',gen:'',year:'',svcs:[],brands:[],photos:0,note:'',t0:Date.now()});
  const models=f.brand?Object.keys(CARS[f.brand]):[]; const gens=f.brand&&f.model?CARS[f.brand][f.model]:[]; const g=gens.find(x=>x.gen===f.gen);
  const years=g?Array.from({length:g.to-g.from+1},(x,i)=>g.to-i):[];
  const sel=(k,lab,opts,val,ph)=>'<label>'+lab+'<select class="f" data-cfs="'+k+'"><option value="">'+ph+'</option>'+opts.map(o=>'<option'+(String(o)===String(val)?' selected':'')+'>'+esc(o)+'</option>').join('')+'</select></label>';
  const on=(arr,v)=>arr.indexOf(v)>=0;
  return head('시공사례 등록','고르기 4번, 입력 한 줄. 차량·작업·제품이 구조로 저장돼 소비자 검색(G80 썬팅)에 바로 쓰입니다.','<span class="small">걸린 시간 <span class="timer" id="cfTimer">00:00</span></span>')+
    '<div class="cfwrap"><form class="cform" onsubmit="return false">'+
    '<section><h2><span class="n">1</span>차량</h2><div class="quick"><span class="k">최근 차량</span>'+QUICK.map(q=>'<button type="button" class="tg chip" data-cfq="'+q.join('|')+'" aria-pressed="'+(f.brand===q[0]&&f.model===q[1]&&f.gen===q[2]&&String(f.year)===String(q[3]))+'">'+esc(q[1]+' '+q[2]+' '+q[3])+'</button>').join('')+'</div>'+
      '<div class="sel4">'+sel('brand','브랜드',Object.keys(CARS),f.brand,'선택')+sel('model','모델',models,f.model,f.brand?'선택':'브랜드 먼저')+sel('gen','세대',gens.map(x=>x.gen),f.gen,f.model?'선택':'모델 먼저')+sel('year','연식',years,f.year,f.gen?'선택':'세대 먼저')+'</div></section>'+
    '<section><h2><span class="n">2</span>작업<span class="d">여러 개 선택 · 우리 업체 서비스만 표시</span></h2><div class="pick">'+s.svcs.map(v=>'<button type="button" class="tg" data-cf="svcs|'+esc(v)+'" aria-pressed="'+on(f.svcs,v)+'">'+esc(v)+'</button>').join('')+'</div></section>'+
    '<section><h2><span class="n">3</span>사용 제품<span class="d">작업별 취급 브랜드에서</span></h2>'+(f.svcs.length?'<div class="prodgrid">'+f.svcs.map(v=>'<b>'+esc(v)+'</b><div class="opts">'+(s.brands[v]||[]).map(b=>'<button type="button" class="tg soft" data-cf="brands|'+esc(b)+'" aria-pressed="'+on(f.brands,b)+'">'+esc(b)+'</button>').join('')+'</div>').join('')+'</div>':'<span class="small">작업을 먼저 고르세요</span>')+'</section>'+
    '<section><h2><span class="n">4</span>사진<span class="d">최대 10장 · 첫 장이 대표</span></h2><div class="ptiles">'+Array.from({length:f.photos}).map((x,i)=>'<span>'+(i===0?'대표 사진':'사진 '+(i+1))+'</span>').join('')+'<button type="button" data-act="cfPhoto"'+(f.photos>=10?' disabled':'')+'>'+ic('plus')+'사진 추가</button></div></section>'+
    '<section style="border-bottom:0"><h2><span class="n">5</span><label for="cfNote">한 줄 설명</label><span class="d">선택</span></h2><input id="cfNote" class="cfnote" maxlength="60" placeholder="예: 전면 35%, 측후면 15% · 출고 당일 시공" value="'+esc(f.note)+'"><div class="err" id="cfErr" role="alert"></div></section>'+
    '<div class="foot2">'+btn({label:'취소',attrs:'data-act="cfCancel"'})+btn({cls:'pri',label:'사례 등록',attrs:'data-act="cfSave"'})+'</div></form>'+
    '<aside class="cprev" aria-label="미리보기"><div class="lb">업체 상세에 이렇게 보입니다</div><article><div class="img">'+(f.photos?'대표 사진':'사진을 올리면 여기에 나옵니다')+'</div><dl><dt>차량</dt><dd><b>'+esc(f.year?f.model+' '+f.gen+' · '+f.year:'-')+'</b></dd><dt>작업</dt><dd>'+esc(f.svcs.join(' + ')||'-')+'</dd><dt>제품</dt><dd>'+esc(f.brands.join(' · ')||'-')+'</dd></dl><div class="nt" id="cfPrevNote">'+esc(f.note)+'</div></article>'+
    '<div class="fn">차량 세대, 작업, 제품, 사진, 한 줄 설명이 따로 저장됩니다. 등록하면 소비자 목록의 "내 차 사례 N건"에 바로 반영됩니다.</div></aside></div>';
}
function viewBInq(){
  const s=myShop(); const list=S.inq.filter(q=>q.shop===s.id);
  if(UI.id){const q=list.find(x=>x.id===UI.id); if(q) return '<div class="bar"><button type="button" class="btn" data-goto="'+UI.role+'/binq">'+ic('left')+'문의 목록</button></div>'+head('문의 '+q.id+' · '+esc(q.svc))+stepper(q.st)+thread(q,false)+
    '<div class="composer"><label class="sr" for="bmsg">답변</label><textarea id="bmsg" rows="2" placeholder="답변 입력"></textarea>'+btn({cls:'pri',icon:'chat',label:'답변',attrs:'data-bmsg="'+q.id+'"'})+'</div>'+
    '<div class="bar" style="margin-top:12px"><label for="bst" class="small">상태 변경</label><select id="bst" class="f" data-bst="'+q.id+'">'+STEPS.map(x=>'<option'+(q.st===x?' selected':'')+'>'+x+'</option>').join('')+'</select></div>';}
  return head('문의 관리',s.name+'에 들어온 문의입니다.')+(list.length?'<div class="tw rl rl-kv"><table class="t"><thead><tr><th>문의</th><th>서비스</th><th>상태</th><th>마지막 메시지</th><th></th></tr></thead><tbody>'+
    list.slice().reverse().map(q=>'<tr><td data-k="문의" class="num">'+q.id+'</td><td data-k="서비스">'+esc(q.svc)+'</td><td class="stc">'+st(q.st,q.st==='완료'?'ok':q.st==='접수'?'warn':'info')+'</td><td class="full small">'+esc(q.msgs[q.msgs.length-1].t.slice(0,40))+'</td><td class="r full">'+btn({cls:'sm',icon:'right',label:'열기',attrs:'data-goto="'+UI.role+'/binq/'+q.id+'"'})+'</td></tr>').join('')+'</tbody></table></div>':'<div class="empty" style="background:#fff">'+ic('chat')+'<strong>받은 문의가 없어요</strong><p>소비자가 채팅 문의를 보내면 여기에 나옵니다.</p></div>');
}
function viewBRev(){
  const s=myShop();
  return head('후기 관리',s.name+'에 남은 후기입니다. 답변은 소비자 화면 후기 아래에 붙습니다.')+(s.reviews.length?'<div class="box">'+s.reviews.map((r,i)=>'<div class="rv"><div class="top2"><span class="stars" aria-label="'+r.rating+'점">'+'★'.repeat(r.rating)+'</span><span>'+esc(r.who)+' · '+esc(r.car)+'</span></div><div>'+esc(r.text)+'</div>'+
    (r.reply?'<div class="reply"><b>업체 답변</b> '+esc(r.reply)+'</div>':'<div class="composer"><label class="sr" for="rr-'+i+'">답변</label><textarea id="rr-'+i+'" rows="1" placeholder="답변 입력"></textarea>'+btn({cls:'pri',label:'답변 등록',attrs:'data-rreply="'+i+'"'})+'</div>')+'</div>').join('')+'</div>':'<div class="empty" style="background:#fff">'+ic('star')+'<strong>후기가 없어요</strong><p>문의를 마친 이용자가 후기를 남기면 여기에 나옵니다.</p></div>');
}

/* ===== 관리자 ===== */
function kpis(){
  const pend=S.shops.filter(s=>vstate(s)==='wait').length, nq=S.inq.filter(q=>q.st==='접수').length;
  return '<div class="kpi3"><div><span class="k">사업자 확인 대기</span><span class="v warn">'+pend+'</span></div><div><span class="k">오늘 신규 문의 (접수)</span><span class="v">'+nq+'</span></div><div><span class="k">이번 주 신규 업체</span><span class="v">1</span></div></div>';
}
function viewDash(){
  return head('대시보드','오늘 확인할 것만 모았습니다.')+kpis()+
    '<div class="acts" style="justify-content:flex-start">'+btn({icon:'shield',label:'사업자 확인으로',attrs:'data-goto="m/mverify"'})+btn({icon:'layout',label:'홈 화면 설정으로',attrs:'data-goto="m/homeset"'})+'</div>';
}
function viewMVerify(){
  const cnt={wait:0,ok:0,rej:0};S.shops.forEach(s=>cnt[vstate(s)]++);
  const list=S.shops.filter(s=>UI.vf==='all'||vstate(s)===UI.vf);
  const cur=list.find(s=>s.id===UI.vsel)||list[0];
  const how=(s)=>s.bizChecked&&s.bizPhoto?'등록번호 조회 + 등록증':s.bizPhoto?'등록증 이미지':s.bizChecked?'등록번호 조회':'제출 전';
  const chk=(s)=>s.bizChecked?'계속사업자 · 일치':'조회 전';
  const stt=(s)=>{const v=vstate(s);return v==='ok'?st('승인됨','ok'):v==='rej'?st('반려','mute'):st('확인 대기','warn');};
  const tab=(k,l)=>'<button type="button" class="tg chip" data-vf="'+k+'" aria-pressed="'+(UI.vf===k)+'">'+l+'</button>';
  let det='';
  if(cur){const v=vstate(cur);
    det='<aside class="vdet" aria-label="선택한 신청"><div class="h">'+stt(cur)+'<b>'+esc(cur.name)+'</b><span class="small">대표 '+esc(cur.owner)+' · '+esc(cur.city.split(' ').slice(0,2).join(' '))+' · '+esc(cur.svcs.join(', '))+'</span></div>'+
      '<div class="bd"><div class="img">'+(cur.bizPhoto?'사업자등록증 이미지 (예시)':'등록증 이미지 없음')+'</div><dl><dt>등록번호</dt><dd>'+esc(cur.bizNo)+'</dd><dt>확인 방식</dt><dd>'+how(cur)+'</dd><dt>진위확인</dt><dd>'+chk(cur)+'</dd><dt>신청일</dt><dd>2026.'+esc(cur.applied)+'</dd></dl>'+
      '<div class="note" style="margin:0">승인하면 업체 화면과 소비자 목록·상세에 사업자 확인 표시가 붙습니다. 품질 인증이 아니라 사업자 정보 확인 표시입니다.</div>'+
      (v==='wait'?'<label class="rj">반려 사유 (반려 시 필수)<input id="rjReason" class="f" placeholder="예: 등록증 이미지 식별 불가"></label>':v==='rej'?'<div class="small">반려 사유: '+esc(cur.reason)+'</div>':'')+'</div>'+
      (v==='wait'?'<div class="ft">'+btn({label:'반려',attrs:'data-vrej="'+cur.id+'"'})+btn({cls:'pri',label:'승인',attrs:'data-vok="'+cur.id+'"'})+'</div>':'')+'</aside>';}
  return head('사업자 확인','업체가 낸 사업자 정보를 확인합니다. 사업자등록번호 조회는 국세청 진위확인 공공 API를 쓰는 것을 전제로 한 예시입니다.')+kpis()+
    '<div class="vwrap"><div class="tcard"><div class="ftabs">'+tab('wait','확인 대기 '+cnt.wait)+tab('ok','승인됨 '+cnt.ok)+tab('rej','반려 '+cnt.rej)+tab('all','전체')+'</div>'+
    (list.length?'<table class="t" style="min-width:640px"><thead><tr><th>업체</th><th>사업자등록번호</th><th>확인 방식</th><th>진위확인</th><th>신청일</th><th>상태</th></tr></thead><tbody>'+
      list.map(s=>'<tr'+(cur&&cur.id===s.id?' class="sel"':'')+'><td><button type="button" class="rowpick" data-vsel="'+s.id+'">'+esc(s.name)+'</button><div class="small">'+esc(s.owner)+' · '+esc(s.city.split(' ').slice(0,2).join(' '))+'</div></td><td class="num">'+esc(s.bizNo)+'</td><td>'+how(s)+'</td><td>'+chk(s)+'</td><td class="small">'+esc(s.applied)+'</td><td>'+stt(s)+'</td></tr>').join('')+'</tbody></table>'
      :'<div style="padding:16px">'+empty('check','확인할 신청이 없습니다','새 업체가 사업자 정보를 내면 여기에 나옵니다.','<button type="button" class="btn" data-vf="all">전체 보기</button>')+'</div>')+
    '</div>'+det+'</div>';
}
function viewCats(){
  return head('카테고리 · 서비스','서비스는 트리 데이터라 화면을 고치지 않고 추가하고 순서를 바꿉니다. 바꾸면 소비자 홈 버튼이 함께 바뀝니다.')+
    '<div class="two"><div class="tree"><div class="grp">서비스 · 시공</div>'+S.svc.map((v,i)=>'<div class="it"><span class="num small">'+(i+1)+'</span><span class="grow">'+esc(v)+'</span><button type="button" class="ordbtn" data-sup="'+i+'" aria-label="'+esc(v)+' 위로"'+(i===0?' disabled':'')+'>'+ic('up')+'</button><button type="button" class="ordbtn" data-sdown="'+i+'" aria-label="'+esc(v)+' 아래로"'+(i===S.svc.length-1?' disabled':'')+'>'+ic('down')+'</button></div>').join('')+
      '<div class="it"><label for="newSvc" class="sr">새 서비스</label><input id="newSvc" class="f grow" placeholder="새 서비스 이름">'+btn({cls:'sm',icon:'plus',label:'추가',attrs:'data-act="svcAdd"'})+'</div></div>'+
    '<div class="tree" style="align-self:start"><div class="grp">보조 기능</div>'+S.cats['보조 기능'].map(v=>'<div class="it"><span class="grow">'+esc(v)+'</span></div>').join('')+'</div></div>';
}
function viewHomeset(){
  const d=UI.draft||(UI.draft=clone(S.home));
  const dirty=JSON.stringify(d)!==JSON.stringify(S.home);
  const rows=d.map((s,i)=>{const orig=S.home.find(x=>x.k===s.k);const ch=JSON.stringify(orig)!==JSON.stringify(s)||S.home.indexOf(orig)!==i;const nm=HOME_INFO[s.k];
    return '<tr class="'+(s.on?'':'off')+(ch?' changed':'')+'"><td><div class="ordwrap"><span class="no">'+(i+1)+'</span><button type="button" class="ordbtn" data-hup="'+i+'" aria-label="'+nm+' 위로"'+(i===0?' disabled':'')+'>'+ic('up')+'</button><button type="button" class="ordbtn" data-hdown="'+i+'" aria-label="'+nm+' 아래로"'+(i===d.length-1?' disabled':'')+'>'+ic('down')+'</button></div></td>'+
      '<td style="font-weight:700;white-space:nowrap">'+nm+'</td>'+
      '<td><label class="chk" style="white-space:nowrap"><input type="checkbox" data-hon="'+i+'"'+(s.on?' checked':'')+' aria-label="'+nm+' 노출">'+(s.on?'켬':'끔')+'</label></td>'+
      '<td><div class="wseg" role="group" aria-label="'+nm+' 비중"><button type="button" data-hw="'+i+'|big" aria-pressed="'+(s.w==='big')+'">크게</button><button type="button" data-hw="'+i+'|small" aria-pressed="'+(s.w==='small')+'">작게</button></div></td>'+
      '<td><label class="sr" for="hl-'+i+'">'+nm+' 라벨</label><input class="f" id="hl-'+i+'" data-hl="'+i+'" style="width:100%;min-width:160px;height:36px" value="'+esc(s.label)+'"></td></tr>';}).join('');
  return head('홈 화면 설정','섹션의 노출·순서·비중·라벨을 바꾸면 오른쪽 미리보기가 바로 바뀝니다. 저장하면 웹과 앱 홈에 같은 설정이 반영됩니다.',btn({label:'초기값으로',attrs:'data-act="hDefault"'})+btn({cls:'pri',label:'저장',attrs:'data-act="hSave"'+(dirty?'':' disabled')}))+
    '<div class="hs"><div class="tcard"><table class="t"><thead><tr><th>순서</th><th>섹션</th><th>노출</th><th>비중</th><th>라벨</th></tr></thead><tbody>'+rows+'</tbody></table>'+
    '<div class="tn">비중 크게는 홈 본문에 큰 블록으로, 작게는 하단 보조 줄 아이콘으로 나옵니다. 보조 기능은 처음부터 코드와 데이터가 있고 비중만 다릅니다. 그래서 서비스·시공 우선은 개발이 아니라 설정입니다. 시연: 부품 찾기를 크게로 바꾸고 위로 올려 보세요.</div></div>'+
    '<aside aria-label="소비자 홈 미리보기"><p class="pvlabel">소비자 홈 미리보기 '+(dirty?'(저장 전)':'(현재)')+'</p><div class="preview">'+renderHome(d)+'</div></aside></div>';
}
function viewLists(){
  const t=UI.id||'shops';
  const T={shops:'업체',inq:'문의',rev:'후기',cases:'시공사례'};
  let body='';
  if(t==='shops') body='<table class="t"><thead><tr><th>업체</th><th>지역</th><th>서비스</th><th class="r">사례</th><th class="r">후기</th><th>사업자 확인</th></tr></thead><tbody>'+S.shops.map(s=>'<tr><td><b>'+esc(s.name)+'</b></td><td>'+esc(s.city)+'</td><td>'+esc(s.svcs.join(', '))+'</td><td class="r num">'+s.cases.length+'</td><td class="r num">'+s.reviews.length+'</td><td>'+(s.verified?st('승인됨','ok'):s.rejected?st('반려','mute'):st('확인 대기','warn'))+'</td></tr>').join('')+'</tbody></table>';
  if(t==='inq') body='<table class="t"><thead><tr><th>문의</th><th>업체</th><th>서비스</th><th>상태</th></tr></thead><tbody>'+S.inq.map(q=>'<tr><td class="num">'+q.id+'</td><td>'+esc(shopOf(q.shop).name)+'</td><td>'+esc(q.svc)+'</td><td>'+st(q.st,q.st==='완료'?'ok':'info')+'</td></tr>').join('')+'</tbody></table>';
  if(t==='rev') body='<table class="t"><thead><tr><th>업체</th><th>작성자</th><th class="r">평점</th><th>내용</th><th>답변</th></tr></thead><tbody>'+S.shops.flatMap(s=>s.reviews.map(r=>'<tr><td>'+esc(s.name)+'</td><td>'+esc(r.who)+'</td><td class="r num">'+r.rating+'</td><td>'+esc(r.text)+'</td><td>'+(r.reply?st('있음','ok'):st('없음','mute'))+'</td></tr>')).join('')+'</tbody></table>';
  if(t==='cases') body='<table class="t"><thead><tr><th>업체</th><th>차량</th><th>작업</th><th>제품</th></tr></thead><tbody>'+S.shops.flatMap(s=>s.cases.map(c=>'<tr><td>'+esc(s.name)+'</td><td>'+esc(c.model+' '+c.gen+' · '+c.year)+'</td><td>'+esc(c.svcs.join(' + '))+'</td><td>'+esc(c.brands.join(' · '))+'</td></tr>')).join('')+'</tbody></table>';
  return head((T[t]||'업체')+' 목록','운영자가 전체 데이터를 조회합니다.')+'<div class="tw">'+body+'</div>';
}

/* ===== guide ===== */
const GUIDE=[
  {t:'내 차 등록',d:'브랜드, 모델, 연식, 세대를 고릅니다.',run:()=>go('c','car')},
  {t:'G80 썬팅 검색',d:'한 줄 검색을 차량과 서비스로 나눠 읽습니다.',run:()=>{UI.q='G80 썬팅';resetF();go('c','search');}},
  {t:'업체 목록의 거리와 필터',d:'내 차 사례가 없는 업체도 목록에 남습니다.',run:()=>{UI.q='G80 썬팅';UI.sort='dist';go('c','search');}},
  {t:'업체 비교',d:'최대 3곳을 나란히 봅니다.',run:()=>{UI.q='G80 썬팅';UI.cmp=['S1','S3','S4'];go('c','compare');}},
  {t:'채팅 문의와 상태',d:'접수, 업체 답변, 상담 진행, 완료 순으로 바뀝니다.',run:()=>{UI.q='G80 썬팅';go('c','inq','new/S1');}},
  {t:'업체 B 시공사례 등록',d:'고르기 위주로 30초 안에 등록합니다.',run:()=>{UI.caseForm=null;go('b','casenew');}},
  {t:'관리자 사업자 확인 승인',d:'승인하면 업체 B에 확인 표시가 붙습니다.',run:()=>{UI.vf='wait';UI.vsel=null;go('m','mverify');}},
  {t:'관리자 홈 설정',d:'부품 찾기 비중을 크게로 바꾸고 저장하면 소비자 홈이 바뀝니다.',run:()=>{UI.draft=null;go('m','homeset');}}
];
function renderGuide(){
  const g=$('guide');
  if(UI.guideOpen===null) UI.guideOpen=window.matchMedia('(min-width:1101px)').matches;
  g.className='guide'+(UI.guideOpen?'':' closed');
  document.body.classList.toggle('guide-open',!!UI.guideOpen);
  g.innerHTML='<button type="button" class="gh" data-act="toggleGuide" aria-expanded="'+UI.guideOpen+'" aria-controls="guideList"><span>시연 안내</span>'+ic(UI.guideOpen?'down':'up')+'</button>'+
    '<ol id="guideList">'+GUIDE.map((s,i)=>'<li><button type="button" data-guide="'+i+'"'+(UI.guideStep===i?' aria-current="step"':'')+'><b><span class="n">'+(i+1)+'.</span>'+s.t+'</b>'+(UI.guideStep===i?'<span class="d">'+s.d+'</span>':'')+'</button></li>').join('')+'</ol>';
}

/* ===== header ===== */
function roleSel(){return '<div class="role"><label for="roleSel">보는 사람</label><select id="roleSel">'+[['c','소비자'],['a','업체 A (승인됨)'],['b','업체 B (승인 대기)'],['m','관리자']].map(o=>'<option value="'+o[0]+'"'+(UI.role===o[0]?' selected':'')+'>'+o[1]+'</option>').join('')+'</select></div>';}
function renderHeader(){
  const hd=$('hd');
  if(UI.role==='c'){
    const car=S.car, home=UI.view==='home';
    const chip='<button type="button" class="carchip'+(car&&car.gen?'':' none')+'" data-go2="car">'+ic('car')+(car&&car.gen?esc(car.brand+' '+car.model+' · '+car.year):'내 차 등록')+'</button>';
    const nIn=S.inq.filter(q=>q.st==='업체 답변'&&q.unread).length;
    const svc=parseQuery(UI.q).svc;
    hd.className='hd';
    hd.innerHTML='<div class="hd-in"><a class="logo" href="#/c/home">CARISEL</a>'+
      (home?'<span class="sp"></span>':'<form class="hq pc-only" data-qform="1" role="search">'+ic('search')+'<label class="sr" for="hdq">검색어</label><input id="hdq" type="search" placeholder="썬팅, 블랙박스, 카오디오, PPF…" value="'+esc(UI.q)+'"></form><span class="sp m-only"></span>')+
      chip+'<nav class="hnav pc-only" aria-label="내 메뉴"><a href="#/c/inq"'+(UI.view==='inq'?' aria-current="page"':'')+'>문의함'+(nIn?'<span class="cnt">'+nIn+'</span>':'')+'</a><a href="#/c/car"'+(UI.view==='car'?' aria-current="page"':'')+'>내 정보</a></nav>'+roleSel()+'</div>'+
      (home?'':'<nav class="svctabs pc-only" aria-label="서비스">'+S.svc.map(v=>'<button type="button" data-svc="'+esc(v)+'" aria-current="'+(UI.view==='search'&&svc===v)+'">'+esc(v)+'</button>').join('')+'</nav>');
  } else if(UI.role==='m'){
    hd.className='hd adm-h';
    hd.innerHTML='<div class="hd-in"><a class="logo" href="#/m/dash">CARISEL</a><span class="area">관리자</span><span class="sp"></span><span class="who2">운영자 계정</span>'+roleSel()+'</div>';
  } else {
    const s=myShop();
    hd.className='hd biz-h';
    hd.innerHTML='<div class="hd-in"><a class="logo" href="#/'+UI.role+'/info">CARISEL</a><span class="area">업체 관리</span><span class="sp"></span><span class="who2"><b>'+esc(s.name)+'</b> '+(s.verified?'<span class="okt">· 사업자 확인됨</span>':'<span class="wt">· '+(s.rejected?'반려됨':'확인 대기')+'</span>')+'</span>'+roleSel()+'</div>';
  }
}

/* ===== render ===== */
const CV={home:viewHome,search:viewSearch,shop:viewShop,compare:viewCompare,inq:viewInq,car:viewCar,parts:viewParts,goods:viewGoods,find:viewFind,carid:viewCarid};
const BV={info:viewInfo,verify:viewVerify,cases:viewCases,casenew:viewCaseNew,binq:viewBInq,brev:viewBRev};
const MV={dash:viewDash,mverify:viewMVerify,cats:viewCats,homeset:viewHomeset,lists:viewLists};
let timerH=null;
function render(){
  renderHeader();
  let h;
  if(UI.role==='c'){
    const cur={shop:'search',compare:'search',parts:'home',goods:'home',find:'home',carid:'home'}[UI.view]||UI.view;
    const nIn=S.inq.filter(q=>q.st==='업체 답변'&&q.unread).length;
    const names=UI.cmp.map(id=>shopOf(id).name).join(' · ');
    h='<nav class="cnav" aria-label="소비자 메뉴"><div class="in">'+CNAV.map(v=>'<a href="#/c/'+v[0]+'"'+(cur===v[0]?' aria-current="page"':'')+'>'+ic(v[2])+v[1]+(v[0]==='inq'&&nIn?'<span class="cnt">'+nIn+'</span>':'')+'</a>').join('')+'</div></nav>'+
      '<main id="main" tabindex="-1" class="wrap">'+CV[UI.view]()+'</main>'+
      (UI.cmp.length&&UI.view!=='compare'?'<div class="tray" role="region" aria-label="비교함"><div class="in"><span class="k">비교함 <b>'+UI.cmp.length+' / 3</b></span><span class="names">'+esc(names)+'</span><span style="flex:1"></span><button type="button" class="x" data-act="cmpClear">비우기</button><button type="button" class="btn" data-go2="compare"'+(UI.cmp.length<2?' disabled':'')+'>비교하기</button></div></div>':'');
  } else {
    const nav=navOf(UI.role);
    const cur=UI.view==='casenew'?'cases':UI.view==='lists'?'lists/'+(UI.id||'shops'):UI.view;
    const badge=(k)=>{
      if(k==='mverify'){const n=S.shops.filter(s=>vstate(s)==='wait').length;return n?'대기 '+n:'';}
      if(k==='binq'){const n=S.inq.filter(q=>q.shop===ROLE_SHOP[UI.role]&&q.st==='접수').length;return n?'새 문의 '+n:'';}
      if(k==='verify'){const s=myShop();return s.verified?'':'확인 대기';}
      return '';};
    h='<div class="biz"><nav class="bside" aria-label="메뉴">'+nav.map(v=>{const b=badge(v[0]);return '<a href="#/'+UI.role+'/'+v[0]+'"'+(cur===v[0]?' aria-current="page"':'')+'><span>'+v[1]+'</span>'+(b?'<span class="cnt">'+b+'</span>':'')+'</a>';}).join('')+'</nav>'+
      '<main id="main" tabindex="-1" class="bmain">'+(UI.role==='m'?MV:BV)[UI.view]()+'</main></div>';
  }
  $('root').innerHTML=h;
  document.body.classList.toggle('has-tray',!!document.querySelector('.tray'));
  document.body.classList.toggle('biz-on',UI.role!=='c');
  renderGuide();
  clearInterval(timerH);
  if(UI.view==='casenew'&&UI.caseForm){const tick=()=>{const e=$('cfTimer');if(!e)return;const s=Math.floor((Date.now()-UI.caseForm.t0)/1000);e.textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');};tick();timerH=setInterval(tick,1000);}
}

/* ===== events ===== */
function addMsg(q,who,t){q.msgs.push({who,t,at:nowHM()});}
function keepNote(){const n=$('cfNote');if(n&&UI.caseForm)UI.caseForm.note=n.value;}
document.addEventListener('submit',(e)=>{if(e.target.dataset&&e.target.dataset.qform){e.preventDefault();const i=e.target.querySelector('input');UI.q=i.value;resetF();go('c','search');}});
document.addEventListener('input',(e)=>{if(e.target.id==='cfNote'&&UI.caseForm){UI.caseForm.note=e.target.value;const p=$('cfPrevNote');if(p)p.textContent=e.target.value;}});
document.addEventListener('click',(e)=>{
  const t=e.target.closest('button'); if(!t) return; const d=t.dataset;
  if(d.guide!=null){const i=Number(d.guide);UI.guideStep=i;UI.guideOpen=false;GUIDE[i].run();return;}
  if(d.go2){go(UI.role,d.go2);return;}
  if(d.goto){const p=d.goto.split('/');go(p[0],p[1],p.slice(2).join('/'));return;}
  if(d.svc){UI.q=(S.car&&S.car.gen?S.car.model+' ':'')+d.svc;resetF();go('c','search');return;}
  if(d.sub){go('c',SUB_VIEW[d.sub]);return;}
  if(d.ex){UI.q=d.ex;resetF();render();return;}
  if(d.sort){UI.sort=d.sort;withLoading('업체 찾는 중…',render,300);return;}
  if(d.pcat){UI.parts={cat:d.pcat,pn:''};render();return;}
  if(d.ppn){UI.parts.pn=d.ppn;render();return;}
  if(d.shop){go('c','shop',d.shop);return;}
  if(d.newinq){go('c','inq','new/'+d.newinq);return;}
  if(d.openq){const q=S.inq.find(x=>x.id===d.openq);q.unread=false;go('c','inq',d.openq);return;}
  if(d.cmsg){const q=S.inq.find(x=>x.id===d.cmsg);const v=$('cmsg').value.trim();if(!v){toast('메시지를 입력해 주세요.','bad');return;}
    withLoading('보내는 중…',()=>{addMsg(q,'me',v);if(q.st==='업체 답변')q.st='상담 진행';toast('보냈습니다. 상태: '+q.st);render();},300);return;}
  if(d.refresh){const q=S.inq.find(x=>x.id===d.refresh);
    withLoading('새 답변 확인 중…',()=>{const last=q.msgs[q.msgs.length-1];
      if(last.who==='me'){const s=shopOf(q.shop);addMsg(q,'shop',q.st==='접수'?'네, '+q.svc+' 가능합니다. 원하시는 제품이나 농도가 있으면 알려 주세요. 방문 가능한 날도 함께 알려 주시면 됩니다. (예시 답변)':'토요일 오전 10시 가능합니다. 오시기 전에 연락 주세요. (예시 답변)');if(q.st==='접수')q.st='업체 답변';toast(s.name+'의 답변이 왔습니다.');}
      else toast('새 답변이 없습니다.');render();});return;}
  if(d.done){const q=S.inq.find(x=>x.id===d.done);withLoading('상담 완료 처리 중…',()=>{q.st='완료';toast('상담을 완료했습니다. 후기를 남길 수 있습니다.');render();});return;}
  if(d.review){const q=S.inq.find(x=>x.id===d.review);const v=$('rvText').value.trim();if(v.length<5){toast('후기를 5자 이상 적어 주세요.','bad');return;}
    withLoading('후기 등록 중…',()=>{const s=shopOf(q.shop);s.reviews.unshift(R('나',S.car?S.car.model:'',Number($('rvStar').value),v,'10-07'));q.reviewed=true;toast('후기를 등록했습니다.');render();});return;}
  if(d.bmsg){const q=S.inq.find(x=>x.id===d.bmsg);const v=$('bmsg').value.trim();if(!v){toast('답변을 입력해 주세요.','bad');return;}
    withLoading('답변 보내는 중…',()=>{addMsg(q,'shop',v);if(q.st==='접수')q.st='업체 답변';q.unread=true;toast('답변했습니다. 상태: '+q.st);render();},300);return;}
  if(d.rreply!=null){const s=myShop();const r=s.reviews[Number(d.rreply)];const v=$('rr-'+d.rreply).value.trim();if(!v){toast('답변을 입력해 주세요.','bad');return;}withLoading('답변 등록 중…',()=>{r.reply=v;toast('후기 답변을 등록했습니다.');render();},300);return;}
  if(d.cfq){keepNote();const [b,m,g,y]=d.cfq.split('|');Object.assign(UI.caseForm,{brand:b,model:m,gen:g,year:y});render();return;}
  if(d.cf){keepNote();const [k,v]=d.cf.split('|');const f=UI.caseForm;const arr=f[k];const i=arr.indexOf(v);if(i>=0)arr.splice(i,1);else arr.push(v);
    if(k==='svcs'){const s=myShop();const ok=[...new Set(f.svcs.map(x=>s.brands[x]||[]).flat())];f.brands=f.brands.filter(b=>ok.indexOf(b)>=0);}
    render();return;}
  if(d.vf){UI.vf=d.vf;UI.vsel=null;render();return;}
  if(d.vsel){UI.vsel=d.vsel;render();return;}
  if(d.vok){const s=shopOf(d.vok);withLoading('승인 처리 중…',()=>{s.verified=true;s.rejected=false;UI.vf='all';UI.vsel=s.id;toast(s.name+'의 사업자 확인을 승인했습니다. 소비자 목록에 표시가 붙습니다.');render();});return;}
  if(d.vrej){const s=shopOf(d.vrej);const r=($('rjReason')||{}).value||'';if(!r.trim()){toast('반려 사유를 적어 주세요.','bad');const e2=$('rjReason');if(e2)e2.focus();return;}
    withLoading('반려 처리 중…',()=>{s.rejected=true;s.reason=r.trim();UI.vf='all';UI.vsel=s.id;toast(s.name+'의 신청을 반려했습니다. 업체에 사유가 보입니다.');render();});return;}
  if(d.sup!=null||d.sdown!=null){const i=Number(d.sup!=null?d.sup:d.sdown);const j=d.sup!=null?i-1:i+1;const a=S.svc;[a[i],a[j]]=[a[j],a[i]];toast('순서를 바꿨습니다. 소비자 홈 버튼 순서도 바뀝니다.');render();return;}
  if(d.hup!=null||d.hdown!=null){const i=Number(d.hup!=null?d.hup:d.hdown);const j=d.hup!=null?i-1:i+1;const a=UI.draft;[a[i],a[j]]=[a[j],a[i]];render();return;}
  if(d.hw){const [i,w]=d.hw.split('|');UI.draft[Number(i)].w=w;render();return;}
  switch(d.act){
    case 'toggleGuide': UI.guideOpen=!UI.guideOpen; renderGuide(); return;
    case 'hsearch': {const i=$('hq');UI.q=i?i.value:'';resetF();go('c','search');return;}
    case 'search': UI.q=$('q').value; resetF(); render(); return;
    case 'resetF': resetF(); render(); return;
    case 'cmpClear': UI.cmp=[]; render(); return;
    case 'tel': toast('휴대폰에서는 전화 앱이 열립니다. 시연에서는 연결하지 않습니다.'); return;
    case 'sendFirst':{const v=$('firstMsg').value.trim();if(!v){toast('문의 내용을 적어 주세요.','bad');return;}
      withLoading('문의 보내는 중…',()=>{const id='Q-'+(seq.q++);S.inq.push({id,shop:d.sid,svc:d.isvc,st:'접수',reviewed:false,msgs:[{who:'me',t:v,at:nowHM()}]});toast('문의를 보냈습니다. 상태: 접수');go('c','inq',id);});return;}
    case 'fphoto': {UI.fphoto=(UI.fphoto||0)+1;const e=$('fphotoN');if(e)e.textContent='사진 '+UI.fphoto+'장';return;}
    case 'fask':{const v=$('fq').value.trim();if(v.length<5){toast('질문을 5자 이상 적어 주세요.','bad');return;}withLoading('질문 등록 중…',()=>{S.find.push({q:v,car:S.car&&S.car.gen?carTxt(S.car):'미등록',photo:UI.fphoto||0,ans:null});UI.fphoto=0;toast('질문을 등록했습니다. 업체 전문가가 답하면 알려 드립니다.');render();});return;}
    case 'caridSave': withLoading('저장 중…',()=>{document.querySelectorAll('[data-cid]').forEach(i=>{S.carid[Number(i.dataset.cid)].v=i.value;});toast('저장했습니다.');render();}); return;
    case 'infoSave':{const s=myShop();withLoading('저장 중…',()=>{s.name=$('bi-name').value.trim()||s.name;s.owner=$('bi-owner').value;s.addr=$('bi-addr').value;s.hours=$('bi-hours').value;s.intro=$('bi-intro').value;
        s.svcs=[...document.querySelectorAll('[data-bsvc]')].filter(i=>i.checked).map(i=>i.dataset.bsvc);
        document.querySelectorAll('[data-bbr]').forEach(i=>{const v=i.dataset.bbr;if(s.svcs.indexOf(v)>=0)s.brands[v]=i.value.split(',').map(x=>x.trim()).filter(Boolean);});
        toast('저장했습니다. 소비자 화면에 바로 반영됩니다.');render();});return;}
    case 'bizCheck':{const s=myShop();withLoading('사업자등록번호 조회 중…',()=>{s.bizChecked=true;toast('조회 결과: 계속사업자 (예시). 운영자 확인을 기다립니다.');render();});return;}
    case 'bizPhoto':{const s=myShop();withLoading('사진 올리는 중…',()=>{s.bizPhoto=true;s.rejected=false;toast('사업자등록증을 제출했습니다.');render();});return;}
    case 'caseNew': UI.caseForm=null; go(UI.role,'casenew'); return;
    case 'cfCancel': UI.caseForm=null; go(UI.role,'cases'); return;
    case 'cfPhoto': keepNote(); UI.caseForm.photos=Math.min(10,UI.caseForm.photos+1); render(); return;
    case 'cfSave':{const f=UI.caseForm; f.note=$('cfNote').value.trim(); const er=$('cfErr');
      if(!f.year){er.textContent='차량을 연식까지 골라 주세요.';return;}
      if(!f.svcs.length){er.textContent='작업을 하나 이상 골라 주세요.';return;}
      if(!f.photos){er.textContent='사진을 한 장 이상 올려 주세요.';return;}
      const secs=Math.floor((Date.now()-f.t0)/1000);
      withLoading('저장 중…',()=>{const s=myShop();s.cases.unshift({brand:f.brand,model:f.model,gen:f.gen,year:Number(f.year),svcs:f.svcs.slice(),brands:f.brands.slice(),note:f.note||'-',photos:f.photos});UI.caseForm=null;
        toast('등록했습니다. 걸린 시간 '+secs+'초. 소비자 목록의 내 차 사례에 바로 반영됩니다.');go(UI.role,'cases');});return;}
    case 'svcAdd':{const v=$('newSvc').value.trim();if(!v){toast('서비스 이름을 적어 주세요.','bad');return;}if(S.svc.indexOf(v)>=0){toast('이미 있는 서비스입니다.','bad');return;}withLoading('저장 중…',()=>{S.svc.push(v);toast(v+' 서비스를 추가했습니다. 소비자 홈 버튼에 나옵니다.');render();});return;}
    case 'hDefault': UI.draft=clone(SEED.home); render(); return;
    case 'hSave': withLoading('저장 중…',()=>{S.home=clone(UI.draft);toast('홈 설정을 저장했습니다. 웹·앱 홈에 반영됩니다.');render();}); return;
  }
});
document.addEventListener('change',(e)=>{
  const i=e.target;
  if(i.id==='roleSel'){go(i.value,navOf(i.value)[0][0]);return;}
  if(i.dataset&&i.dataset.car){
    const c=S.car||{};
    if(i.id==='c-brand') S.car={brand:i.value,model:'',year:'',gen:''};
    if(i.id==='c-model') S.car={brand:c.brand,model:i.value,year:'',gen:''};
    if(i.id==='c-year'){S.car={brand:c.brand,model:c.model,year:Number(i.value)||'',gen:''};const gs=(CARS[c.brand][c.model]||[]).filter(g=>S.car.year>=g.from&&S.car.year<=g.to);if(gs.length===1)S.car.gen=gs[0].gen;}
    if(i.id==='c-gen') c.gen=i.value;
    if(S.car.gen) toast('내 차를 '+carTxt(S.car)+'(으)로 등록했습니다.');
    render(); const n=$(i.id); if(n) n.focus(); return;}
  if(i.dataset&&i.dataset.cmpc){const id=i.dataset.cmpc;const k=UI.cmp.indexOf(id);
    if(k>=0){UI.cmp.splice(k,1);render();return;}
    if(UI.cmp.length>=3){toast('비교는 최대 3곳까지입니다. 하나를 빼고 담아 주세요.','bad');render();return;}
    UI.cmp.push(id);render();return;}
  if(i.id==='fMine'){UI.f.mine=i.checked;withLoading('업체 찾는 중…',render,300);return;}
  if(i.id==='fVer'){UI.f.ver=i.checked;withLoading('업체 찾는 중…',render,300);return;}
  if(i.dataset&&i.dataset.fb){const b=i.dataset.fb;const k=UI.f.brands.indexOf(b);if(k>=0)UI.f.brands.splice(k,1);else UI.f.brands.push(b);withLoading('업체 찾는 중…',render,300);return;}
  if(i.dataset&&i.dataset.cfs){keepNote();const f=UI.caseForm;const k=i.dataset.cfs;f[k]=i.value;
    if(k==='brand'){f.model='';f.gen='';f.year='';}if(k==='model'){f.gen='';f.year='';}if(k==='gen'){f.year='';}
    render();const n=document.querySelector('[data-cfs="'+k+'"]');if(n)n.focus();return;}
  if(i.dataset&&i.dataset.bst){const q=S.inq.find(x=>x.id===i.dataset.bst);withLoading('상태 변경 중…',()=>{q.st=i.value;toast('상태를 '+q.st+'(으)로 바꿨습니다.');render();},300);return;}
  if(i.dataset&&i.dataset.bsvc){const b=document.querySelector('[data-bbr="'+i.dataset.bsvc+'"]');if(b)b.disabled=!i.checked;return;}
  if(i.dataset&&i.dataset.hon!=null){UI.draft[Number(i.dataset.hon)].on=i.checked;render();return;}
  if(i.dataset&&i.dataset.hl!=null){UI.draft[Number(i.dataset.hl)].label=i.value||UI.draft[Number(i.dataset.hl)].label;render();return;}
});
window.addEventListener('hashchange',route);
route();
})();
