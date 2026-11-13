'use strict';
/* 차짝부품 시안: 모든 데이터는 시연용 예시이며 상태는 메모리에만 둔다 */
(function(){
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ic=(n,c)=>`<svg class="i${c?' '+c:''}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const fmt=n=>Number(n).toLocaleString('ko-KR');
const won=n=>fmt(n)+'원';
const norm=s=>String(s).replace(/[\s\-_.·]/g,'').toUpperCase();
const normPlate=s=>String(s).replace(/\s/g,'');

/* ---------- 차종 키(연식 구간 + 엔진 단위) ---------- */
const KEYS={
 'TUC-G16T':{code:'CM-2041',maker:'현대',model:'투싼',gen:'NX4',years:'2021~2023',engine:'1.6 터보 가솔린',ecode:'G1.6 T-GDi',fuel:'가솔린'},
 'TUC-D20':{code:'CM-2042',maker:'현대',model:'투싼',gen:'NX4',years:'2021~2023',engine:'2.0 디젤',ecode:'D2.0',fuel:'디젤'},
 'TUC24-G16T':{code:'CM-2047',maker:'현대',model:'투싼',gen:'NX4 페이스리프트',years:'2024~2025',engine:'1.6 터보 가솔린',ecode:'G1.6 T-GDi',fuel:'가솔린'},
 'TUC24-D20':{code:'CM-2048',maker:'현대',model:'투싼',gen:'NX4 페이스리프트',years:'2024~2025',engine:'2.0 디젤',ecode:'D2.0',fuel:'디젤'},
 'CAS-G10':{code:'CM-2311',maker:'현대',model:'캐스퍼',gen:'AX1',years:'2022~2025',engine:'1.0 가솔린',ecode:'G1.0 MPi',fuel:'가솔린'},
 'CAS-G10T':{code:'CM-2312',maker:'현대',model:'캐스퍼',gen:'AX1',years:'2022~2025',engine:'1.0 터보 가솔린',ecode:'G1.0 T-GDi',fuel:'가솔린'},
 'KAR-G35':{code:'CM-3121',maker:'기아',model:'카니발',gen:'KA4',years:'2021~2023',engine:'3.5 가솔린',ecode:'G3.5 GDi',fuel:'가솔린'},
 'KAR-D22':{code:'CM-3122',maker:'기아',model:'카니발',gen:'KA4',years:'2021~2023',engine:'2.2 디젤',ecode:'D2.2',fuel:'디젤'},
 'SEL-G16T':{code:'CM-3205',maker:'기아',model:'셀토스',gen:'SP2',years:'2020~2022',engine:'1.6 터보 가솔린',ecode:'G1.6 T-GDi',fuel:'가솔린'},
 'GV70-G25T':{code:'CM-4102',maker:'제네시스',model:'GV70',gen:'JK1',years:'2021~2024',engine:'2.5 터보 가솔린',ecode:'G2.5 T-GDi',fuel:'가솔린'},
 'TRB-G135':{code:'CM-5031',maker:'쉐보레',model:'트레일블레이저',gen:'1세대',years:'2021~2023',engine:'1.35 터보 가솔린',ecode:'E-Turbo 1.35',fuel:'가솔린'}
};
const kName=k=>{const m=KEYS[k];return m?`${m.model} ${m.gen} · ${m.years} · ${m.engine}`:k;};

/* 제조사 › 모델 › 연식 › 트림 원본 */
const MODELS=[
 ['현대',[
  ['투싼 (NX4)',[['2021~2023',[['모던','TUC-G16T'],['프리미엄','TUC-G16T'],['인스퍼레이션','TUC-G16T'],['모던 디젤','TUC-D20'],['프리미엄 디젤','TUC-D20']]],
                 ['2024~2025',[['모던','TUC24-G16T'],['익스클루시브','TUC24-G16T'],['모던 디젤','TUC24-D20']]]]],
  ['캐스퍼 (AX1)',[['2022~2025',[['스마트','CAS-G10'],['인스퍼레이션','CAS-G10'],['액티브','CAS-G10T']]]]]
 ]],
 ['기아',[
  ['카니발 (KA4)',[['2021~2023',[['프레스티지','KAR-G35'],['노블레스','KAR-G35'],['시그니처','KAR-G35'],['프레스티지 디젤','KAR-D22'],['노블레스 디젤','KAR-D22']]]]],
  ['셀토스 (SP2)',[['2020~2022',[['트렌디','SEL-G16T'],['프레스티지','SEL-G16T']]]]]
 ]],
 ['제네시스',[['GV70 (JK1)',[['2021~2024',[['2.5T 기본','GV70-G25T'],['2.5T 스포츠','GV70-G25T']]]]]]],
 ['쉐보레',[['트레일블레이저',[['2021~2023',[['LT','TRB-G135'],['RS','TRB-G135']]]]]]]
];

/* ---------- 상품 ---------- */
const TUC4=['TUC-G16T','TUC-D20','TUC24-G16T','TUC24-D20'];
const PRODUCTS=[
 {id:'P-2101',kind:'front-pad',cat:'제동',name:'앞 브레이크 패드 세트',brand:'순정',oe:'58101-N9B40',price:52000,fits:TUC4,note:'2WD·4WD 공통'},
 {id:'P-2102',kind:'rear-pad',cat:'제동',name:'뒤 브레이크 패드 세트',brand:'순정',oe:'58302-N9B20',price:44000,fits:TUC4},
 {id:'P-2103',kind:'front-disc',cat:'제동',name:'앞 브레이크 디스크',brand:'순정',oe:'51712-N9B10',price:68000,fits:['TUC-G16T','TUC24-G16T'],note:'디젤은 디스크 지름이 달라 제외'},
 {id:'P-2104',kind:'oil-filter',cat:'필터',name:'엔진오일 필터',brand:'순정',oe:'26300-35G05',price:9800,fits:['TUC-G16T','TUC24-G16T','SEL-G16T']},
 {id:'P-2105',kind:'air-filter',cat:'필터',name:'에어 클리너 필터',brand:'순정',oe:'28113-N9B70',price:18500,fits:TUC4},
 {id:'P-2106',kind:'cabin-filter',cat:'필터',name:'에어컨 필터 (활성탄)',brand:'순정',oe:'97133-N9C10',price:21000,fits:TUC4},
 {id:'P-2107',kind:'plug',cat:'점화',name:'점화 플러그 4개 세트',brand:'순정',oe:'18849-08J70',price:46000,fits:['TUC-G16T','TUC24-G16T','SEL-G16T']},
 {id:'P-2108',kind:'coil',cat:'점화',name:'점화 코일',brand:'순정',oe:'27301-2M3C1',price:63000,fits:['TUC-G16T','TUC24-G16T']},
 {id:'P-2109',kind:'wiper',cat:'와이퍼',name:'앞 와이퍼 세트 650·400mm',brand:'순정',oe:'98350-N9B00',price:27000,fits:TUC4},
 {id:'P-2110',kind:'rear-wiper',cat:'와이퍼',name:'뒷유리 와이퍼 300mm',brand:'순정',oe:'98850-N9B10',price:15000,fits:TUC4},
 {id:'P-2111',kind:'battery',cat:'배터리',name:'AGM 배터리 70Ah',brand:'순정',oe:'37110-N9B60',price:189000,fits:TUC4,note:'공회전 제한 장치 차량용'},
 {id:'P-2112',kind:'plate-lamp',cat:'램프',name:'번호판등 LED',brand:'순정',oe:'92501-N9B30',price:24000,fits:['TUC-G16T','TUC-D20'],note:'2024~ 페이스리프트는 형상이 달라 제외'},
 {id:'P-2121',kind:'front-pad',cat:'제동',name:'앞 브레이크 패드 세라믹',brand:'그립라인',oe:'GL-P2271',price:39000,fits:TUC4,after:true},
 {id:'P-2122',kind:'oil-filter',cat:'필터',name:'엔진오일 필터',brand:'플로메이트',oe:'FM-O3505',price:6900,fits:['TUC-G16T','TUC24-G16T','SEL-G16T'],after:true},
 {id:'P-2113',kind:'front-pad',cat:'제동',name:'앞 브레이크 패드 세트',brand:'순정',oe:'58101-R0A55',price:61000,fits:['KAR-G35','KAR-D22']},
 {id:'P-2114',kind:'air-filter',cat:'필터',name:'에어 클리너 필터',brand:'순정',oe:'28113-R0A15',price:22000,fits:['KAR-G35']},
 {id:'P-2115',kind:'air-filter',cat:'필터',name:'에어 클리너 필터 (디젤)',brand:'순정',oe:'28113-R0B25',price:23500,fits:['KAR-D22']},
 {id:'P-2116',kind:'plug',cat:'점화',name:'점화 플러그 6개 세트',brand:'순정',oe:'18846-11R60',price:78000,fits:['KAR-G35']},
 {id:'P-2117',kind:'wiper',cat:'와이퍼',name:'앞 와이퍼 세트 650·450mm',brand:'순정',oe:'98350-R0A00',price:29000,fits:['KAR-G35','KAR-D22']},
 {id:'P-2118',kind:'fuel-filter',cat:'필터',name:'연료 필터 (디젤)',brand:'순정',oe:'31922-R0B90',price:38000,fits:['KAR-D22']},
 {id:'P-2123',kind:'battery',cat:'배터리',name:'AGM 배터리 80Ah',brand:'순정',oe:'37110-R0A70',price:215000,fits:['KAR-G35','KAR-D22']},
 {id:'P-2119',kind:'oil-filter',cat:'필터',name:'엔진오일 필터',brand:'순정',oe:'26300-02G51',price:8600,fits:['CAS-G10','CAS-G10T']},
 {id:'P-2120',kind:'wiper',cat:'와이퍼',name:'앞 와이퍼 세트 550·350mm',brand:'순정',oe:'98350-K3A00',price:21000,fits:['CAS-G10']},
 {id:'P-2124',kind:'cabin-filter',cat:'필터',name:'에어컨 필터',brand:'순정',oe:'97133-S1C00',price:19000,fits:['GV70-G25T']},
 {id:'P-2125',kind:'wiper',cat:'와이퍼',name:'앞 와이퍼 세트 600·450mm',brand:'순정',oe:'98350-S1A10',price:32000,fits:['GV70-G25T']},
 {id:'P-2126',kind:'air-filter',cat:'필터',name:'에어 클리너 필터',brand:'순정',oe:'28113-T7A20',price:20500,fits:['TRB-G135']}
];
const PBY=Object.fromEntries(PRODUCTS.map(p=>[p.id,p]));
const CATS=['제동','필터','점화','와이퍼','배터리','램프'];
const CAT_IC={'제동':'brake','필터':'filter','점화':'spark','와이퍼':'wiper','배터리':'battery','램프':'lamp'};
const KIND_NM={'front-pad':'앞 브레이크 패드','rear-pad':'뒤 브레이크 패드','front-disc':'앞 브레이크 디스크','oil-filter':'엔진오일 필터','air-filter':'에어 클리너 필터','cabin-filter':'에어컨 필터','plug':'점화 플러그','coil':'점화 코일','wiper':'앞 와이퍼','rear-wiper':'뒷유리 와이퍼','battery':'배터리','plate-lamp':'번호판등','fuel-filter':'연료 필터'};

/* 품번 묶음: 순정 품번과 대체·호환 품번 */
const GROUPS=[
 [['58101-N9B40','순정 품번','P-2101'],['58101-N9B41','대체 품번(신품번)','P-2101'],['GL-P2271','호환품(애프터마켓)','P-2121']],
 [['26300-35G05','순정 품번','P-2104'],['26300-35G06','대체 품번(신품번)','P-2104'],['FM-O3505','호환품(애프터마켓)','P-2122']],
 [['58101-R0A55','순정 품번','P-2113'],['58101-R0A50','구 품번(단종)','P-2113']]
];

/* 차량 조회 서비스 응답(예시) */
const PLATES={
 '12가3456':{type:'one',year:2022,key:'TUC-G16T',vin:'KMHJ381CBNU204517',vendor:'투싼(NX4) 1.6T 2WD 인스퍼레이션'},
 '34나5678':{type:'two',year:2021,vin:'KNAKA81DBMA318052',vendor:'카니발 KA4 9인승',cands:['KAR-G35','KAR-D22']},
 '78도9012':{type:'none'}
};
const VINS={'KMHJ381ABPU116284':{year:2023,key:'TUC-D20',vendor:'투싼 NX4 2.0 디젤 4WD'}};

/* ---------- 상태 ---------- */
const S={
 mode:'shop',view:'home',aview:'master',
 wtab:'plate',plate:'',owner:'',agree:false,vin:'',werr:'',
 res:null,          // 위젯 결과 {kind, plate, cached, data, pick}
 cache:{},          // 조회 결과 저장소(차량번호 → 응답)
 car:null,          // 내 차 {name, gen, year, engine, fuel, keys, plate, vin, label}
 sel:{maker:null,model:null,year:null},
 cat:'전체',detail:null,dtab:'info',
 pnq:'',pnres:null,
 orderPid:'P-2101',
 tree:null,tsel:null,topen:{},tform:null,
 mapTotal:38412,
 up:{step:0,file:null,checked:false,applied:false},
 history:[
  {id:'U-0412',at:'2026.10.28 16:20',file:'호환차종_와이퍼_2610.xlsx',rows:3204,applied:3188,state:'반영',pairs:[]},
  {id:'U-0409',at:'2026.10.21 11:05',file:'호환차종_필터_2610.xlsx',rows:5120,applied:5098,state:'되돌림',pairs:[]}
 ],
 mq:'',mpid:null,mchk:null,
 unmatched:[
  {id:'L1',at:'2026.11.13 09:42',plate:'45머 12**',vendor:'더 뉴 셀토스 1.6 가솔린 터보 2WD',cands:['SEL-G16T','TUC-G16T']},
  {id:'L2',at:'2026.11.13 08:15',plate:'27우 83**',vendor:'캐스퍼 1.0 T-GDI 액티브 밴',cands:['CAS-G10T','CAS-G10']},
  {id:'L3',at:'2026.11.12 19:30',plate:'61노 40**',vendor:'GV70 2.5T AWD (JK1)',cands:['GV70-G25T']},
  {id:'L4',at:'2026.11.12 14:02',plate:'09조 77**',vendor:'올 뉴 투싼 디젤 2.0 4WD',cands:['TUC-D20','TUC24-D20']}
 ],
 guideOpen:window.matchMedia('(min-width:1280px)').matches
};
/* 매핑은 '상품|차종키' 쌍 집합. 관리자에서 바꾸면 쇼핑몰에도 바로 반영된다 */
const MAP=new Set();
PRODUCTS.forEach(p=>p.fits.forEach(k=>MAP.add(p.id+'|'+k)));
const fitsOf=pid=>[...MAP].filter(x=>x.startsWith(pid+'|')).map(x=>x.split('|')[1]).filter(k=>KEYS[k]);

/* 트리 생성 */
let NID=1;
function mkNode(name,lv,extra){return Object.assign({id:'n'+(NID++),name,lv,children:[]},extra||{});}
S.tree=MODELS.map(([mk,models])=>{const a=mkNode(mk,0);
 a.children=models.map(([mo,ranges])=>{const b=mkNode(mo,1);
  b.children=ranges.map(([yr,trims])=>{const c=mkNode(yr,2);
   c.children=trims.map(([tn,k])=>mkNode(tn,3,{key:k}));return c;});return b;});return a;});
S.tree.forEach(n=>S.topen[n.id]=true);
S.topen[S.tree[0].children[0].id]=true;
S.topen[S.tree[0].children[0].children[0].id]=true;
S.tsel=S.tree[0].children[0].children[0].id;

function walk(fn,list=S.tree,parent=null){for(const n of list){fn(n,parent);walk(fn,n.children,n);}}
function findNode(id){let r=null,par=null;walk((n,p)=>{if(n.id===id){r=n;par=p;}});return r?{n:r,p:par}:null;}
function pathOf(id){const out=[];let cur=findNode(id);while(cur){out.unshift(cur.n.name);cur=cur.p?findNode(cur.p.id):null;}return out;}
function keysUnder(n){const ks=new Set();(function w(x){if(x.key)ks.add(x.key);x.children.forEach(w);})(n);return [...ks];}
function partsForKeys(keys){const s=new Set();MAP.forEach(x=>{const [p,k]=x.split('|');if(keys.includes(k))s.add(p);});return [...s];}
function yearsOf(name){const m=String(name).match(/(\d{4})\s*~\s*(\d{4})?/);if(!m)return [];const a=+m[1],b=+(m[2]||2025);const o=[];for(let y=a;y<=b&&o.length<8;y++)o.push(y);return o;}

/* ---------- 공통: 처리 표시, 토스트 ---------- */
let busyOn=false;
function busy(text,ms){
 const d=ms||(320+Math.round(Math.random()*240));
 busyOn=true;$('#busyText').textContent=text;$('#busy').hidden=false;
 document.body.setAttribute('aria-busy','true');
 return new Promise(r=>setTimeout(()=>{busyOn=false;$('#busy').hidden=true;document.body.removeAttribute('aria-busy');r();},d));
}
let toastT;
function hideToast(){clearTimeout(toastT);$('#toast').hidden=true;}
function toast(msg){const t=$('#toast');t.textContent=msg;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,3800);}
function emptyBox(icon,title,text,btnLabel,act,extra){
 return `<div class="empty">${ic(icon)}<b>${esc(title)}</b><p>${esc(text)}</p>${btnLabel?`<button type="button" class="btn dark" data-act="${act}"${extra||''}>${esc(btnLabel)}</button>`:''}</div>`;
}

/* ---------- 내 차, 적합 판정 ---------- */
function carFromKeys(keys,year,extra){
 const m=KEYS[keys[0]];
 const engines=[...new Set(keys.map(k=>KEYS[k].engine))];
 return Object.assign({maker:m.maker,model:m.model,gen:m.gen,year,keys,
  engine:engines.length>1?'엔진 확인 필요':m.engine,ecode:engines.length>1?'-':m.ecode,
  fuel:engines.length>1?[...new Set(keys.map(k=>KEYS[k].fuel))].join('/'):m.fuel},extra||{});
}
function fitOf(pid,car){
 car=car||S.car;if(!car)return 'none';
 const f=fitsOf(pid);const hit=car.keys.filter(k=>f.includes(k)).length;
 if(hit===car.keys.length)return 'fit';if(hit>0)return 'partial';return 'no';
}
function fitTag(pid){const f=fitOf(pid);
 if(f==='fit')return `<span class="tag ok">${ic('check')}내 차에 맞음</span>`;
 if(f==='partial')return `<span class="tag warn">엔진 확인 필요</span>`;
 if(f==='no')return `<span class="tag bad">내 차에 맞지 않음</span>`;return '';}
function carParts(car){car=car||S.car;return PRODUCTS.filter(p=>{const f=fitOf(p.id,car);return f==='fit'||f==='partial';});}
const carLabel=c=>`${c.model} ${c.gen} · ${c.year}년 · ${c.engine}`;

/* ---------- 렌더 ---------- */
function render(){
 document.querySelectorAll('.mode button').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.v===S.mode)));
 $('#app').innerHTML=S.mode==='shop'?rShop():rAdmin();
 renderGuide();
}
function rShop(){
 const nav=[['home','차량 검색'],['list','호환 부품'],['pn','품번 검색'],['order','주문서']];
 const cur=S.view==='detail'?'list':S.view;
 let h=`<div class="shop"><nav class="snav" aria-label="쇼핑몰 메뉴">${nav.map(([v,l])=>`<button type="button" data-act="nav" data-v="${v}"${cur===v?' aria-current="page"':''}>${l}${v==='list'&&S.car?` <span class="badge-car">${carParts().length}</span>`:''}</button>`).join('')}</nav>`;
 h+=({home:rHome,list:rList,detail:rDetail,pn:rPn,order:rOrder})[S.view]();
 return h+'</div>';
}

/* 메인: 차량 검색 위젯 */
function rHome(){
 return rWidget()+`<section class="sect" aria-labelledby="hc"><div class="sect-h"><h2 id="hc">분류로 찾기</h2><span class="sub">${S.car?'내 차 기준으로 걸러 보여 드립니다':'차량을 먼저 찾으면 맞는 부품만 나옵니다'}</span></div>
 <div class="catgrid">${CATS.map(c=>`<button type="button" class="catbtn" data-act="cat-go" data-v="${c}">${ic(CAT_IC[c])}${c}</button>`).join('')}</div></section>`;
}
function rWidget(){
 const tabs=[['plate','차량번호'],['vin','차대번호'],['model','차종 선택']];
 let b='';
 if(S.wtab==='plate'){
  b=`<form class="wform" data-form="plate" novalidate><div class="wrow">
   <label class="field"><span>차량번호</span><input class="inp plate-inp" id="fPlate" name="plate" value="${esc(S.plate)}" placeholder="예: 12가 3456" autocomplete="off"></label>
   <label class="field"><span>소유자명</span><input class="inp" id="fOwner" name="owner" value="${esc(S.owner)}" placeholder="예: 김○○" autocomplete="off"></label>
   <label class="chk agree"><input type="checkbox" id="fAgree" name="agree"${S.agree?' checked':''}>차량 정보 조회에 동의합니다 (소유자명은 저장하지 않습니다)</label>
   <button class="btn pri go" type="submit">${ic('search')}조회</button></div>
   ${S.werr?`<p class="err" role="alert">${esc(S.werr)}</p>`:''}
   <div class="examples"><span>예시로 바로 체험</span>
    <button type="button" class="ex" data-act="ex" data-v="A">예시 A<small>한 줄로 이어짐</small></button>
    <button type="button" class="ex" data-act="ex" data-v="B">예시 B<small>후보가 둘</small></button>
    <button type="button" class="ex" data-act="ex" data-v="C">예시 C<small>조회 안 됨</small></button></div></form>`;
 }else if(S.wtab==='vin'){
  b=`<form class="wform" data-form="vin" novalidate><div class="wrow vinrow">
   <label class="field"><span>차대번호 17자리</span><input class="inp plate-inp" id="fVin" value="${esc(S.vin)}" maxlength="17" placeholder="자동차등록증의 차대번호" autocomplete="off"></label>
   <button class="btn pri go" type="submit">${ic('search')}조회</button></div>
   ${S.werr?`<p class="err" role="alert">${esc(S.werr)}</p>`:''}
   <div class="examples" style="display:flex"><span>예시</span><button type="button" class="ex" data-act="ex-vin">예시 차대번호 넣기<small>KMHJ381ABPU116284</small></button></div></form>`;
 }else b=rStepSel();
 return `<section class="widget" aria-labelledby="wh"><div class="widget-h"><h1 id="wh">내 차에 맞는 부품 찾기</h1><p>차량번호·차대번호·차종 중 아는 것으로 찾으세요</p></div>
 <div class="wtabs" role="tablist">${tabs.map(([v,l])=>`<button type="button" role="tab" data-act="wtab" data-v="${v}" aria-selected="${S.wtab===v}">${l}</button>`).join('')}</div>
 <div class="wbody">${b}${rResult()}</div></section>`;
}
function specCard(c,opts){
 opts=opts||{};
 const it=[['제조사',c.maker],['모델',c.model],['세대',c.gen],['연식',c.year+'년'],['엔진 형식',c.ecode==='-'?'확인 필요':c.ecode+' ('+c.engine+')'],['연료',c.fuel]];
 return `<dl class="spec" id="specCard">${it.map(([k,v])=>`<div><dt>${k}</dt><dd${v==='확인 필요'?' class="q"':''}>${esc(v)}</dd></div>`).join('')}</dl>`;
}
function masterLine(keys){
 if(keys.length!==1)return `<div class="master-line">${ic('link')}차종 마스터 후보 <b>${keys.map(k=>KEYS[k].code).join(', ')}</b> — 엔진을 고르면 한 줄로 이어집니다</div>`;
 const m=KEYS[keys[0]];return `<div class="master-line">${ic('link')}조회 결과 → 차종 마스터 <b>${m.code}</b> ${esc(m.model+' '+m.gen+' · '+m.years+' · '+m.engine)}</div>`;
}
function rResult(){
 const r=S.res;if(!r)return '';
 const lab=r.cached?`<span class="tag ink" id="cachedTag">${ic('clock')}저장된 조회 결과</span><span>같은 차량번호는 저장해 둔 결과를 바로 보여 드려 조회 요금이 다시 나가지 않습니다</span>`:
  `<span class="tag mute">${r.src==='vin'?'차대번호 조회':r.src==='model'?'차종 선택':'차량 조회 서비스 응답'}</span>${r.vendor?`<span>표기: ${esc(r.vendor)}</span>`:''}`;
 if(r.kind==='none'){
  return `<div class="result" id="result"><div class="notice" id="noneNotice">${ic('info')}<div><b>이 차량번호로는 차량 정보를 받지 못했습니다</b><p>법인 명의 차량이나 소유자명이 등록 정보와 다른 경우 조회되지 않을 수 있습니다. 아래 방법으로 이어서 찾을 수 있습니다.</p>
   <div class="cta-row"><button type="button" class="btn dark" data-act="to-vin">${ic('hash')}차대번호로 찾기</button><button type="button" class="btn" data-act="to-model">${ic('car')}차종 선택으로 찾기</button></div></div></div></div>`;
 }
 const c=r.car;
 let h=`<div class="result" id="result"><div class="res-label">${lab}</div>${specCard(c)}`;
 if(r.kind==='two'&&!r.pick){
  h+=`<div class="cands" id="cands"><h3>엔진이 두 가지입니다. 어느 쪽인가요</h3><p>자동차등록증의 '원동기 형식'이나 주유구 표시로 확인할 수 있습니다</p><div class="cand-row">${r.cands.map(k=>`<button type="button" class="cand" data-act="pick" data-v="${k}"><b>${esc(KEYS[k].engine)}</b><span>${esc(KEYS[k].ecode)} · ${esc(KEYS[k].fuel)} · 차종 ${KEYS[k].code}</span></button>`).join('')}</div></div>${masterLine(r.cands)}`;
  return h+'</div>';
 }
 const n=carParts(c).length;
 h+=masterLine(c.keys);
 h+=`<div class="cta-row"><button type="button" class="btn pri" data-act="see-parts" id="seeParts">내 차에 맞는 부품 ${n}개 보기 ${ic('right')}</button><span class="hint">내 차로 기억해 두고 상품마다 맞는지 표시합니다</span></div></div>`;
 return h;
}
function rStepSel(){
 const s=S.sel;
 const maker=s.maker&&S.tree.find(n=>n.id===s.maker);
 const model=maker&&s.model&&maker.children.find(n=>n.id===s.model);
 const steps=[['제조사',maker&&maker.name],['모델',model&&model.name],['연식',s.year&&s.year+'년'],['트림',null]];
 const stage=!maker?0:!model?1:!s.year?2:3;
 let h=`<div class="steps" aria-label="선택 단계">${steps.map(([k,v],i)=>`<button type="button" data-act="step" data-v="${i}" class="${i===stage?'on':''}"${i>stage?' disabled':''}><small>${i+1}. ${k}</small><span>${esc(v||(i===stage?'선택하세요':'-'))}</span></button>`).join('')}</div><div class="opts" id="opts">`;
 if(stage===0)h+=S.tree.map(n=>`<button type="button" class="opt" data-act="sel" data-lv="maker" data-v="${n.id}">${esc(n.name)}</button>`).join('');
 else if(stage===1)h+=maker.children.map(n=>`<button type="button" class="opt" data-act="sel" data-lv="model" data-v="${n.id}">${esc(n.name)}<small>${n.children.map(c=>c.name).join(', ')}</small></button>`).join('');
 else if(stage===2){const ys=[];model.children.forEach(c=>yearsOf(c.name).forEach(y=>ys.push(y)));h+=[...new Set(ys)].sort().map(y=>`<button type="button" class="opt" data-act="sel" data-lv="year" data-v="${y}">${y}년</button>`).join('');}
 else{
  const rng=model.children.find(c=>yearsOf(c.name).includes(s.year));
  const trims=rng?rng.children:[];
  h+=trims.map(t=>`<button type="button" class="opt" data-act="trim" data-v="${t.id}">${esc(t.name)}<small>${esc(KEYS[t.key]?KEYS[t.key].engine:'엔진 미지정')}</small></button>`).join('');
  h+=`<button type="button" class="opt unknown" data-act="trim" data-v="unknown">트림 모름<small>모델·연식으로 진행</small></button>`;
 }
 return h+'</div>';
}

/* 호환 부품 목록 */
function rList(){
 let h='';
 if(S.car){
  const c=S.car;
  h+=`<div class="carbar" id="carChip">${ic('car')}<div><div class="nm">${esc(c.maker+' '+c.model)} <span style="font-weight:600">${esc(c.gen)}</span></div><div class="meta">${c.year}년 · ${esc(c.engine)}${c.plate?' · '+esc(c.plate):''}</div></div>
   <div class="acts"><button type="button" class="btn sm ia" data-act="car-change" aria-label="내 차 변경" data-tip="내 차 변경">${ic('edit')}<span class="lbl">변경</span></button><button type="button" class="btn sm ia" data-act="car-clear" aria-label="내 차 해제" data-tip="내 차 해제">${ic('x')}<span class="lbl">해제</span></button></div></div>`;
 }else{
  h+=`<div class="notice">${ic('info')}<div><b>내 차가 정해지지 않았습니다</b><p>차량을 찾으면 맞는 부품만 남기고, 상품마다 맞는지 표시합니다.</p><div class="cta-row"><button type="button" class="btn dark" data-act="nav" data-v="home">${ic('search')}차량 찾기</button></div></div></div>`;
 }
 const base=S.car?carParts():PRODUCTS;
 const cnt=c=>c==='전체'?base.length:base.filter(p=>p.cat===c).length;
 h+=`<div class="cats" role="group" aria-label="분류 필터">${['전체',...CATS].map(c=>`<button type="button" data-act="cat" data-v="${c}" aria-pressed="${S.cat===c}">${c}<span class="cnt">${cnt(c)}</span></button>`).join('')}</div>`;
 const items=base.filter(p=>S.cat==='전체'||p.cat===S.cat);
 h+=`<div class="listmeta"><span><b id="listCount">${items.length}</b>개 ${S.car?'· 내 차 기준':'· 전체 상품'}</span>${S.car?`<span id="searchTime">${ic('clock')} 검색 0.04초</span>`:''}</div>`;
 if(!items.length){
  return h+emptyBox('box',`${S.cat} 분류에 내 차에 맞는 부품이 아직 없습니다`,'다른 분류를 보시거나 품번으로 찾아보세요.','전체 분류 보기','cat',' data-v="전체"');
 }
 return h+`<div class="grid" id="grid">${items.map(card).join('')}</div>`;
}
function card(p){
 return `<button type="button" class="card" data-act="open" data-v="${p.id}"><div class="thumb">${ic(CAT_IC[p.cat])}</div><div class="card-b">
  ${S.car?`<div>${fitTag(p.id)}</div>`:''}<span class="brand">${esc(p.brand)}${p.after?' · 호환품':''}</span><span class="nm">${esc(p.name)}</span><span class="pn">${p.after?'품번':'순정 품번'} ${esc(p.oe)}</span><span class="price">${won(p.price)}</span></div></button>`;
}

/* 상품 상세 */
function groupOf(pid){return GROUPS.find(g=>g.some(m=>m[2]===pid));}
function rDetail(){
 const p=PBY[S.detail];const f=fitOf(p.id);
 let ban='';
 if(f==='fit')ban=`<div class="fitban ok" id="fitBanner">${ic('check')}<div><b>내 차에 맞습니다</b><span>${esc(carLabel(S.car))}</span></div></div>`;
 else if(f==='partial')ban=`<div class="fitban warn" id="fitBanner">${ic('alert')}<div><b>엔진에 따라 다릅니다</b><span>${esc(carLabel(S.car))} — 호환정보 탭에서 엔진을 확인하세요</span></div></div>`;
 else if(f==='no'){const same=PRODUCTS.find(x=>x.kind===p.kind&&x.id!==p.id&&fitOf(x.id)==='fit');
  ban=`<div class="fitban bad" id="fitBanner">${ic('x')}<div><b>내 차에 맞지 않습니다</b><span>${esc(carLabel(S.car))}에는 장착되지 않는 부품입니다</span></div>${same?`<button type="button" class="btn dark" data-act="open" data-v="${same.id}" id="sameBtn">내 차에 맞는 같은 부품 보기</button>`:''}</div>`;}
 else ban=`<div class="fitban mute" id="fitBanner">${ic('info')}<div><b>내 차를 정하면 맞는지 알려 드립니다</b></div><button type="button" class="btn" data-act="nav" data-v="home">차량 찾기</button></div>`;
 const keys=fitsOf(p.id);
 const g=groupOf(p.id);
 const nums=g?g:[[p.oe,p.after?'호환품(애프터마켓)':'순정 품번',p.id]];
 const info=`<table class="info-tbl"><tbody><tr><th>분류</th><td>${esc(p.cat)}</td></tr><tr><th>상품코드</th><td>${p.id}</td></tr><tr><th>${p.after?'품번':'순정 품번'}</th><td>${esc(p.oe)}</td></tr><tr><th>제조</th><td>${esc(p.brand)}${p.after?' (애프터마켓)':''}</td></tr><tr><th>호환 차종</th><td>${keys.length}개 차종</td></tr></tbody></table>`;
 const compat=`<h3>호환 차종</h3><div class="tw"><table id="compatTbl"><thead><tr><th>제조사</th><th>모델</th><th>연식 구간</th><th>엔진</th><th>비고</th></tr></thead><tbody>${keys.map(k=>{const m=KEYS[k];const mine=S.car&&S.car.keys.includes(k);return `<tr class="${mine?'mine':''}"><td>${m.maker}</td><td>${esc(m.model+' '+m.gen)}${mine?' <span class="tag ink">내 차</span>':''}</td><td>${m.years}</td><td>${esc(m.engine)}</td><td>${esc(p.note||'-')}</td></tr>`;}).join('')}</tbody></table></div>
  <h3>순정 품번과 호환 품번</h3><ul class="pnlist" id="pnList">${nums.map(([n,rel,pid])=>`<li><code>${esc(n)}</code><span>${esc(rel)}${pid!==p.id?' · '+esc(PBY[pid].brand+' '+PBY[pid].name):''}</span></li>`).join('')}</ul>`;
 return `<button type="button" class="linkbtn back" data-act="nav" data-v="list">${ic('left')} 호환 부품 목록</button>
 <div class="detail"><div class="thumb">${ic(CAT_IC[p.cat])}</div><div class="d-h"><span class="brand">${esc(p.brand)} · ${esc(p.cat)}</span><h1>${esc(p.name)}</h1><div class="pn">${p.after?'품번':'순정 품번'} ${esc(p.oe)}</div><div class="price">${won(p.price)}</div>${ban}
 <div class="d-acts"><button type="button" class="btn ia" data-act="cart" data-v="${p.id}" aria-label="장바구니 담기" data-tip="장바구니 담기">${ic('cart')}<span class="lbl">장바구니</span></button><button type="button" class="btn pri" data-act="buy" data-v="${p.id}">바로 주문</button></div></div></div>
 <div class="dtabs" role="tablist"><button type="button" role="tab" data-act="dtab" data-v="info" aria-selected="${S.dtab==='info'}">상품 정보</button><button type="button" role="tab" data-act="dtab" data-v="compat" aria-selected="${S.dtab==='compat'}" id="tabCompat">호환정보</button></div>
 <div class="dpanel" role="tabpanel">${S.dtab==='info'?info:compat}</div>`;
}

/* 품번 검색 */
function pnSearch(q){
 const nq=norm(q);if(!nq)return null;
 let g=GROUPS.find(gr=>gr.some(m=>norm(m[0])===nq));
 if(!g){const p=PRODUCTS.find(x=>norm(x.oe)===nq);if(p)g=[[p.oe,p.after?'호환품(애프터마켓)':'순정 품번',p.id]];}
 if(!g)return {nq,items:[]};
 const seen={};const items=[];
 g.forEach(([n,rel,pid])=>{if(!seen[pid]){seen[pid]={pid,rel,nums:[]};items.push(seen[pid]);}seen[pid].nums.push(n);});
 return {nq,items,matched:g.find(m=>norm(m[0])===nq)};
}
function rPn(){
 let h=`<section class="sect" style="margin-top:0"><div class="sect-h"><h2>품번 검색</h2><span class="sub">하이픈·띄어쓰기·대소문자 상관없이 같은 결과</span></div>
 <form class="pnsearch" data-form="pn" novalidate><label class="sr" for="fPn">품번</label><input class="inp" id="fPn" value="${esc(S.pnq)}" placeholder="순정 품번 또는 호환 품번" autocomplete="off"><button class="btn pri" type="submit">${ic('search')}검색</button></form>
 <div class="examples" style="display:flex"><span>예시</span><button type="button" class="ex" data-act="pn-ex" data-v="58101-N9B40">58101-N9B40<small>하이픈 있음</small></button><button type="button" class="ex" data-act="pn-ex" data-v="58101n9b40">58101n9b40<small>하이픈 없음</small></button></div>`;
 const r=S.pnres;
 if(!r)h+=`<div style="margin-top:16px">${emptyBox('hash','찾을 품번을 넣어 주세요','순정 품번으로 찾으면 대체 품번과 호환품이 함께 나옵니다.','예시 품번으로 검색','pn-ex',' data-v="58101-N9B40"')}</div>`;
 else if(!r.items.length)h+=`<div style="margin-top:16px">${emptyBox('search','일치하는 품번이 없습니다','품번을 다시 확인하시거나 차량으로 찾아보세요.','차량으로 찾기','nav',' data-v="home"')}</div>`;
 else{
  h+=`<p class="normline" id="normLine">정리된 번호 <code>${esc(r.nq)}</code> · ${esc(r.matched[1])}로 찾음 · 같은 묶음 ${r.items.length}개 상품</p><div id="pnResults">`;
  h+=r.items.map(it=>{const p=PBY[it.pid];return `<button type="button" class="prow" data-act="open" data-v="${p.id}"><div class="thumb">${ic(CAT_IC[p.cat])}</div><div><div class="tags"><span class="tag ${it.rel.startsWith('순정')?'ink':it.rel.startsWith('호환')?'mute':'warn'} rel">${esc(it.rel)}</span>${S.car?fitTag(p.id):''}</div><div class="nm">${esc(p.brand+' '+p.name)}</div><div class="pn">${it.nums.map(esc).join(' · ')}</div></div><span class="price">${won(p.price)}</span></button>`;}).join('');
  h+='</div>';
 }
 return h+'</section>';
}

/* 주문서 일부 */
function rOrder(){
 const p=PBY[S.orderPid];const c=S.car;
 return `<section class="order"><div class="sect-h"><h2>주문서</h2><span class="sub">차량 정보 추가 입력란</span></div>
 <div class="ordbox"><h2>주문 상품</h2><div class="ord-item"><div class="thumb">${ic(CAT_IC[p.cat])}</div><div><b>${esc(p.brand+' '+p.name)}</b><div class="pn" style="font-size:13px;color:var(--text-2)">${esc(p.oe)}</div>${c?fitTag(p.id):''}</div><b class="price">${won(p.price)}</b></div></div>
 <form class="ordbox" data-form="order" novalidate><h2>장착 차량 (오주문 확인용)</h2><div class="ordgrid">
  <label class="field"><span>차량번호</span><input class="inp" id="oPlate" value="${esc(c&&c.plate||'')}" placeholder="예: 12가 3456"></label>
  <label class="field"><span>차대번호</span><input class="inp" id="oVin" value="${esc(c&&c.vin||'')}" placeholder="17자리" maxlength="17"></label></div>
  <p class="hint">${c?'내 차 정보로 채워 두었습니다. 출고 전에 이 차량 기준으로 호환을 한 번 더 확인합니다.':'모르면 비워 두셔도 됩니다. 출고 전에 연락드려 확인합니다.'}</p>
  <div class="cta-row"><button class="btn pri wide" type="submit">주문 정보 저장</button></div></form></section>`;
}

/* ---------- 관리자 ---------- */
function rAdmin(){
 const nav=[['master','차종 마스터','tree'],['upload','엑셀 대량 업로드','upload'],['map','개별 매핑','link'],['stats','조회 현황','chart']];
 return `<div class="admin"><nav class="aside" aria-label="관리자 메뉴"><h2>매핑 관리</h2>${nav.map(([v,l,i])=>`<button type="button" data-act="anav" data-v="${v}"${S.aview===v?' aria-current="page"':''}>${ic(i)}${l}</button>`).join('')}</nav>
 <div class="amain">${({master:rMaster,upload:rUpload,map:rMap,stats:rStats})[S.aview]()}</div></div>`;
}
const LV=['제조사','모델','연식','트림'];
function rTree(list){
 return list.map(n=>{const open=S.topen[n.id];const kids=n.children.length;const cnt=partsForKeys(keysUnder(n)).length;
  return `<li><div class="tnode">${kids?`<button type="button" class="tog" data-act="ttog" data-v="${n.id}" aria-expanded="${!!open}" aria-label="${esc(n.name)} 펼치기">${ic('down')}</button>`:'<span class="tsp"></span>'}
  <button type="button" class="tsel" data-act="tsel" data-v="${n.id}" aria-current="${S.tsel===n.id}"><span><span class="lv">${LV[n.lv]}</span>${esc(n.name)}</span><span class="cnt">${cnt}</span></button></div>
  ${kids&&open?`<ul>${rTree(n.children)}</ul>`:''}</li>`;}).join('');
}
function rMaster(){
 const f=findNode(S.tsel);
 let det='';
 if(!f)det=emptyBox('tree','선택한 차종이 없습니다','왼쪽 트리에서 차종을 고르세요.','첫 제조사 선택','tsel',` data-v="${S.tree[0]?S.tree[0].id:''}"`);
 else{
  const n=f.n;const keys=keysUnder(n);const pids=partsForKeys(keys);
  const acts=[n.lv<3?['tadd','plus','하위 추가']:null,['tren','edit','이름 수정'],['tdel','trash','삭제']].filter(Boolean);
  det=`<div class="panel-h"><div><div class="path">${pathOf(n.id).map(esc).join(' › ')}</div><h2 id="nodeName">${esc(n.name)}</h2></div>
  <div class="node-acts">${acts.map(([a,i,l])=>`<button type="button" class="btn sm" data-act="${a}" aria-label="${l}" data-tip="${l}">${ic(i)}<span class="lbl">${l}</span></button>`).join('')}</div></div>
  <div class="panel-b"><dl class="dl"><dt>구분</dt><dd>${LV[n.lv]}</dd>${n.key&&KEYS[n.key]?`<dt>차종코드</dt><dd>${KEYS[n.key].code}</dd><dt>엔진</dt><dd>${esc(KEYS[n.key].engine)}</dd>`:''}<dt>연결된 부품</dt><dd><span class="bigcnt" id="linkedCnt">${pids.length}</span> 개</dd></dl>
  ${rTForm(n)}
  ${pids.length?`<div class="tw"><table><thead><tr><th>상품코드</th><th>상품명</th><th>품번</th><th>분류</th></tr></thead><tbody>${pids.slice(0,8).map(id=>{const p=PBY[id];return `<tr><td>${p.id}</td><td>${esc(p.brand+' '+p.name)}</td><td>${esc(p.oe)}</td><td>${p.cat}</td></tr>`;}).join('')}</tbody></table></div>${pids.length>8?`<p class="more">외 ${pids.length-8}개</p>`:''}`:emptyBox('link','연결된 부품이 없습니다','엑셀로 올리거나 개별 매핑에서 부품을 연결하세요.','개별 매핑으로 이동','anav',' data-v="map"')}</div>`;
 }
 return `<div class="ah"><div><h1>차종 마스터</h1><p>제조사 › 모델 › 연식 › 트림. 매핑은 연식 구간과 엔진 기준으로 저장합니다</p></div><dl class="kpis"><div><dt>트림</dt><dd>${(()=>{let c=0;walk(n=>{if(n.lv===3)c++;});return c;})()}</dd></div><div><dt>매핑</dt><dd id="mapTotal1">${fmt(S.mapTotal)}행</dd></div></dl></div>
 <div class="two"><div class="panel"><div class="panel-h"><h2>차종 트리</h2><button type="button" class="btn sm" data-act="tadd-root">${ic('plus')}제조사 추가</button></div><ul class="tree" id="tree">${rTree(S.tree)}</ul></div><div class="panel" id="nodePanel">${det}</div></div>`;
}
function rTForm(n){
 const t=S.tform;if(!t)return '';
 if(t.mode==='del'){const c=partsForKeys(keysUnder(n)).length;
  return `<form class="inline-form bad" data-form="tdel"><p>'${esc(n.name)}'${n.children.length?'와 하위 항목':''}을 삭제합니다. 연결된 부품 ${c}개의 매핑도 함께 해제됩니다.</p><button class="btn dark" type="submit">${ic('trash')}삭제</button><button class="btn" type="button" data-act="tcancel">취소</button></form>`;}
 const isAdd=t.mode==='add'||t.mode==='root';
 const lv=t.mode==='root'?0:isAdd?n.lv+1:n.lv;
 const ph={0:'예: 르노코리아',1:'예: 스포티지 (NQ5)',2:'예: 2025~2026',3:'예: 시그니처'}[lv];
 return `<form class="inline-form" data-form="tsave"><label class="field"><span>${isAdd?LV[lv]+' 추가':LV[lv]+' 이름 수정'}</span><input class="inp" id="tName" value="${isAdd?'':esc(n.name)}" placeholder="${ph}"></label><button class="btn dark" type="submit">저장</button><button class="btn" type="button" data-act="tcancel">취소</button></form>`;
}

/* 엑셀 대량 업로드 */
const UP={rows:12480,ok:12371,bad:109,types:[['없는 상품코드',52],['없는 차종코드',41],['중복 행',16]]};
const UP_ERR=[[14,'P-9921','CM-2041','없는 상품코드','상품 목록에 없는 코드'],[233,'P-2104','CM-2099','없는 차종코드','차종 마스터에 없는 코드'],[1187,'P-2109','CM-2042','중복 행','1186행과 같은 상품·차종·연식'],[2045,'P-8812','CM-3121','없는 상품코드','상품 목록에 없는 코드'],[5610,'P-2117','CM-3190','없는 차종코드','차종 마스터에 없는 코드'],[9033,'P-2122','CM-3205','중복 행','9032행과 같은 상품·차종·연식']];
const UP_OK=[['P-2120','98350-K3A00','CM-2312','2022~2025','1.0 터보 가솔린','-'],['P-2124','97133-S1C00','CM-4102','2021~2024','2.5 터보 가솔린','-'],['P-2126','28113-T7A20','CM-5031','2021~2023','1.35 터보 가솔린','-'],['P-2119','26300-02G51','CM-2311','2022~2025','1.0 가솔린','-'],['P-2112','92501-N9B30','CM-2042','2021~2023','2.0 디젤','후면 카메라 없는 트림']];
const UP_PAIRS=[['P-2120','CAS-G10T']];
function rUpload(){
 const u=S.up;
 const fl=[['파일 선택','file'],['검사','search'],['결과 확인','check'],['반영','upload']];
 const st=u.applied?4:u.checked?2:u.file?1:0;
 let h=`<div class="ah"><div><h1>엑셀 대량 업로드</h1><p>올리면 먼저 검사하고, 통과분만 미리 본 뒤 반영합니다. 업로드 단위로 되돌릴 수 있습니다</p></div><dl class="kpis"><div><dt>현재 매핑</dt><dd id="mapTotal">${fmt(S.mapTotal)}행</dd></div></dl></div>
 <ol class="flow">${fl.map(([l,i],k)=>`<li class="${k===st?'on':k<st?'done':''}">${ic(k<st?'check':i)}${l}</li>`).join('')}</ol>
 <div class="drop">${ic('file')}<div class="grow">${u.file?`<div class="fn" id="fileName">${esc(u.file)}</div><div class="meta">${fmt(UP.rows)}행 · 1.8MB · 양식 v2 (상품코드·품번·차종코드·연식 구간·엔진·조건)</div>`:'<div class="fn">매핑 엑셀 파일을 선택하세요</div><div class="meta">양식: 상품코드, 품번, 차종코드, 연식 구간, 엔진, 조건(트림이 필요한 부품만)</div>'}
 ${u.prog!=null&&!u.checked?`<div class="bar" aria-hidden="true"><i id="progBar" style="width:${u.prog}%"></i></div>`:''}</div>
 ${!u.file||u.applied?`<button type="button" class="btn dark" data-act="up-file">${ic('file')}파일 선택</button>`:!u.checked?`<button type="button" class="btn pri" data-act="up-check" id="upCheck">${ic('search')}검사 시작</button>`:''}</div>`;
 if(u.checked){
  h+=`<dl class="sum" id="upSummary"><div><dt>전체</dt><dd id="sumRows">${fmt(UP.rows)}행</dd></div><div class="okc"><dt>통과</dt><dd id="sumOk">${fmt(UP.ok)}</dd></div><div class="badc"><dt>오류</dt><dd id="sumBad">${fmt(UP.bad)}</dd></div>${UP.types.map(([t,n])=>`<div class="sub"><dt>${t}</dt><dd data-type="${t}">${n}</dd></div>`).join('')}</dl>`;
  h+=`<div class="blk"><div class="blk-h"><h2>오류 행 ${UP.bad}건</h2><button type="button" class="btn sm" data-act="up-errdl">${ic('download')}오류 목록 내려받기</button></div>
  <div class="tw"><table id="errTbl"><thead><tr><th class="r">행</th><th>상품코드</th><th>차종코드</th><th>오류 유형</th><th>내용</th></tr></thead><tbody>${UP_ERR.map(r=>`<tr><td class="r">${fmt(r[0])}</td><td>${r[1]}</td><td>${r[2]}</td><td><span class="tag bad">${r[3]}</span></td><td>${r[4]}</td></tr>`).join('')}</tbody></table></div><p class="more">외 ${UP.bad-UP_ERR.length}건은 오류 목록 파일에 담깁니다</p></div>`;
  h+=`<div class="blk"><div class="blk-h"><h2>통과분 미리보기</h2><span class="sub">${fmt(UP.ok)}행 중 앞 5행</span></div>
  <div class="tw"><table id="okTbl"><thead><tr><th>상품코드</th><th>품번</th><th>차종코드</th><th>연식 구간</th><th>엔진</th><th>조건</th></tr></thead><tbody>${UP_OK.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
  ${u.applied?`<p class="more">${ic('check')} 반영을 마쳤습니다. 아래 이력에서 되돌릴 수 있습니다.</p>`:`<div class="cta-row"><button type="button" class="btn pri" data-act="up-apply" id="upApply">통과분 ${fmt(UP.ok)}행 반영</button><button type="button" class="btn" data-act="up-reset">취소</button></div>`}</div>`;
 }else if(!u.file){
  h+=`<div class="blk">${emptyBox('upload','검사할 파일이 없습니다','파일을 고르면 상품코드·차종코드·중복 행을 먼저 검사합니다.','파일 선택','up-file')}</div>`;
 }
 h+=`<div class="blk"><div class="blk-h"><h2>업로드 이력</h2><span class="sub">잘못 올린 건은 업로드 단위로 되돌립니다</span></div><div class="tw"><table id="histTbl"><thead><tr><th>일시</th><th>파일</th><th class="r">행 수</th><th class="r">반영</th><th>처리자</th><th>상태</th><th></th></tr></thead><tbody>
 ${S.history.map(x=>`<tr data-id="${x.id}"><td>${x.at}</td><td>${esc(x.file)}</td><td class="r">${fmt(x.rows)}</td><td class="r">${fmt(x.applied)}</td><td>관리자 김○○</td><td>${x.state==='반영'?'<span class="tag ok">반영</span>':'<span class="tag mute">되돌림</span>'}</td><td>${x.state==='반영'?`<button type="button" class="btn sm" data-act="up-undo" data-v="${x.id}">${ic('undo')}되돌리기</button>`:'-'}</td></tr>`).join('')}</tbody></table></div></div>`;
 return h;
}

/* 개별 매핑 */
function rMap(){
 const q=norm(S.mq);
 const res=q?PRODUCTS.filter(p=>norm(p.name+p.oe+p.id+p.brand).includes(q)):PRODUCTS.slice(0,8);
 let right;
 if(!S.mpid)right=emptyBox('link','부품을 먼저 고르세요','왼쪽에서 부품을 검색해 고르면 호환 차종을 체크할 수 있습니다.','예시 부품 고르기','m-pick',' data-v="P-2120"');
 else{
  const p=PBY[S.mpid];const chk=S.mchk;
  const groups={};Object.keys(KEYS).forEach(k=>{const m=KEYS[k];const g=m.maker+' '+m.model;(groups[g]=groups[g]||[]).push(k);});
  right=`<div class="panel-h"><div><div class="path">${p.id} · ${esc(p.oe)}</div><h2>${esc(p.brand+' '+p.name)}</h2></div><span class="tag ink" id="mCnt">연결 차종 ${chk.size}개</span></div>
  <form class="panel-b" data-form="map">${Object.entries(groups).map(([g,ks])=>`<div class="cgroup"><h3>${esc(g)}</h3><div class="cgrid">${ks.map(k=>`<label class="chk"><input type="checkbox" data-act="m-chk" value="${k}"${chk.has(k)?' checked':''}>${esc(KEYS[k].gen+' · '+KEYS[k].years+' · '+KEYS[k].engine)}<span class="k">${KEYS[k].code}</span></label>`).join('')}</div></div>`).join('')}
  <div class="cta-row"><button class="btn pri" type="submit" id="mSave">매핑 저장</button><button class="btn ia" type="button" data-act="m-reset" aria-label="저장 전으로 되돌리기" data-tip="저장 전으로 되돌리기">${ic('undo')}<span class="lbl">되돌리기</span></button></div></form>`;
 }
 return `<div class="ah"><div><h1>개별 매핑</h1><p>부품을 찾아 호환 차종을 체크해 연결합니다</p></div></div>
 <div class="two"><div class="panel"><div class="panel-h"><h2>부품 검색</h2></div><div class="panel-b"><form class="pnsearch" data-form="msearch" novalidate><label class="sr" for="fMq">부품명 또는 품번</label><input class="inp" id="fMq" value="${esc(S.mq)}" placeholder="부품명 또는 품번"><button class="btn dark" type="submit">${ic('search')}<span class="sr">검색</span></button></form></div>
 ${res.length?`<ul class="mlist" id="mList">${res.map(p=>`<li><button type="button" data-act="m-pick" data-v="${p.id}" aria-current="${S.mpid===p.id}"><b>${esc(p.brand+' '+p.name)}</b><span>${p.id} · ${esc(p.oe)} · 연결 ${fitsOf(p.id).length}개 차종</span></button></li>`).join('')}</ul>`:`<div class="panel-b">${emptyBox('search','찾는 부품이 없습니다','품번은 하이픈 없이 넣어도 됩니다.','전체 부품 보기','m-clear')}</div>`}</div>
 <div class="panel" id="mPanel">${right}</div></div>`;
}

/* 조회 현황 */
const MONTHS=[['2026.06',1820,24],['2026.07',2310,31],['2026.08',2940,38],['2026.09',3380,44],['2026.10',3960,49],['2026.11',4410,53]];
function rStats(){
 let h=`<div class="ah"><div><h1>조회 현황</h1><p>차종 마스터로 잇지 못한 조회를 지정하면 같은 표기는 다음부터 자동으로 이어집니다</p></div><dl class="kpis"><div><dt>잇지 못한 조회</dt><dd id="unCnt">${S.unmatched.length}건</dd></div><div><dt>이번 달 재사용</dt><dd>53%</dd></div></dl></div>
 <div class="blk" style="margin-top:0"><div class="blk-h"><h2>잇지 못한 조회</h2><span class="sub">차량 조회 서비스가 돌려준 표기 그대로</span></div>`;
 if(!S.unmatched.length)h+=emptyBox('check','잇지 못한 조회가 없습니다','새로 쌓이면 이 목록에 나타납니다. 차종 마스터에서 대응 차종을 미리 정리해 둘 수 있습니다.','차종 마스터 보기','anav',' data-v="master"');
 else h+=`<div class="tw"><table id="unTbl"><thead><tr><th>조회 일시</th><th>차량번호</th><th>돌려받은 표기</th><th>후보 차종</th><th></th></tr></thead><tbody>${S.unmatched.map(u=>`<tr data-id="${u.id}"><td data-l="조회 일시">${u.at}</td><td data-l="차량번호">${u.plate}</td><td data-l="돌려받은 표기"><span class="vendor">${esc(u.vendor)}</span></td><td data-l="후보 차종"><label class="sr" for="c${u.id}">후보 차종</label><select class="inp" id="c${u.id}">${u.cands.map(k=>`<option value="${k}">${KEYS[k].code} ${esc(kName(k))}</option>`).join('')}</select></td><td><button type="button" class="btn dark sm" data-act="assign" data-v="${u.id}">지정</button></td></tr>`).join('')}</tbody></table></div>`;
 h+=`</div><div class="blk"><div class="blk-h"><h2>월별 조회 수와 저장 결과 재사용</h2><div class="legend"><span><i style="background:#B9BEC6"></i>새로 부른 조회</span><span><i style="background:var(--acc)"></i>저장 결과 재사용</span></div></div>`;
 const max=5000;
 h+=`<div class="bars" id="bars" role="img" aria-label="월별 조회 수 막대 그래프">${MONTHS.map(([m,n,r])=>{const reuse=Math.round(n*r/100);return `<div class="bcol"><span class="v">${fmt(n)}</span><div class="bstack" style="height:${n/max*100}%"><div class="reuse" style="flex:${reuse}"></div><div class="api" style="flex:${n-reuse}"></div></div></div>`;}).join('')}</div>
 <div class="blabels">${MONTHS.map(([m,n,r])=>`<div>${m.slice(5)}월<b>${r}%</b></div>`).join('')}</div><p class="more">막대 위 숫자는 월 조회 수, 아래 %는 저장 결과 재사용 비율입니다. 재사용분은 조회 요금이 나가지 않습니다.</p></div>`;
 return h;
}

/* ---------- 시연 안내 ---------- */
const GUIDE=[
 ['예시 A 조회','제원 카드에서 맞는 부품까지'],
 ['같은 번호 다시 조회','처리 표시 없이 저장된 결과'],
 ['예시 B 엔진 고르기','후보 둘 중 하나 선택'],
 ['예시 C와 차종 선택','조회 안 되는 차의 대체 경로'],
 ['상품 상세 호환정보','맞지 않음 배너와 같은 부품 보기'],
 ['품번 검색','하이픈 유무와 관계 라벨'],
 ['엑셀 업로드 검사·되돌리기','오류 유형별 건수와 이력'],
 ['잇지 못한 조회 지정','지정하면 다음부터 자동 연결']
];
function renderGuide(){
 $('#guideList').innerHTML=GUIDE.map(([t,s],i)=>`<li><button type="button" data-act="guide" data-v="${i}"><b>${t}</b><span>${s}</span></button></li>`).join('');
 $('#guide').hidden=!S.guideOpen;$('#guideOpen').hidden=S.guideOpen;
 document.body.classList.toggle('guide-on',S.guideOpen);
}
function guideGo(i){
 const small=!window.matchMedia('(min-width:1280px)').matches;
 if(i<=3){S.mode='shop';S.view='home';S.wtab=i===3?'plate':'plate';}
 if(i===4){S.mode='shop';S.view='detail';S.detail='P-2113';S.dtab='compat';}
 if(i===5){S.mode='shop';S.view='pn';}
 if(i===6){S.mode='admin';S.aview='upload';}
 if(i===7){S.mode='admin';S.aview='stats';}
 if(small)S.guideOpen=false;
 render();window.scrollTo(0,0);
}

/* ---------- 동작 ---------- */
async function lookupPlate(plate,owner){
 const key=normPlate(plate);
 if(S.cache[key]){showPlate(key,S.cache[key],true);return;}
 await busy('차량 정보 조회 중...',520);
 const d=PLATES[key]||{type:'none'};
 S.cache[key]=d;showPlate(key,d,false);
}
function showPlate(key,d,cached){
 const plate=key.replace(/^(\d{2,3}[가-힣])/,'$1 ');
 if(d.type==='none'){S.res={kind:'none',cached};render();return;}
 if(d.type==='one'){
  S.car=carFromKeys([d.key],d.year,{plate,vin:d.vin});
  S.res={kind:'one',car:S.car,cached,vendor:d.vendor};
 }else{
  const pick=d.pick;
  const car=carFromKeys(pick?[pick]:d.cands,d.year,{plate,vin:d.vin});
  if(pick)S.car=car;
  S.res={kind:'two',car,cands:d.cands,pick,cached,vendor:d.vendor,pkey:key};
 }
 S.cat='전체';render();
 if(!cached)toast(d.type==='one'?'조회했습니다. 내 차로 기억해 둡니다':'조회했습니다. 엔진을 골라 주세요');
}

const EX={A:['12가 3456','김○○'],B:['34나 5678','김○○'],C:['78도 9012','김○○']};
document.addEventListener('click',async e=>{
 const t=e.target.closest('[data-act]');if(!t||busyOn)return;
 const a=t.dataset.act,v=t.dataset.v;
 if(t.tagName==='A')e.preventDefault();
 switch(a){
 case 'home':S.mode='shop';S.view='home';render();break;
 case 'mode':hideToast();S.mode=v;render();window.scrollTo(0,0);break;
 case 'nav':hideToast();S.view=v;if(v==='list')S.cat=S.cat||'전체';render();window.scrollTo(0,0);break;
 case 'wtab':S.wtab=v;S.werr='';S.res=null;render();break;
 case 'ex':{const [p,o]=EX[v];S.wtab='plate';S.plate=p;S.owner=o;S.agree=true;S.werr='';render();await lookupPlate(p,o);break;}
 case 'pick':{
  await busy('차종 마스터에 연결 중...',360);
  const d=S.cache[S.res.pkey];d.pick=v;showPlate(S.res.pkey,d,false);toast('엔진을 골랐습니다. 내 차로 기억해 둡니다');break;}
 case 'see-parts':S.view='list';S.cat='전체';render();window.scrollTo(0,0);break;
 case 'to-vin':S.wtab='vin';S.res=null;S.werr='';render();$('#fVin')&&$('#fVin').focus();break;
 case 'to-model':S.wtab='model';S.res=null;S.sel={maker:null,model:null,year:null};render();break;
 case 'ex-vin':S.vin='KMHJ381ABPU116284';render();break;
 case 'step':{const i=+v;if(i<=0)S.sel={maker:null,model:null,year:null};else if(i===1){S.sel.model=null;S.sel.year=null;}else if(i===2)S.sel.year=null;S.res=null;render();break;}
 case 'sel':{
  await busy(v.length===4&&!isNaN(v)?'트림 불러오는 중...':'목록 불러오는 중...',300);
  if(t.dataset.lv==='maker')S.sel={maker:v,model:null,year:null};else if(t.dataset.lv==='model'){S.sel.model=v;S.sel.year=null;}else S.sel.year=+v;
  render();break;}
 case 'trim':{
  await busy('차종 마스터에서 찾는 중...',380);
  const maker=S.tree.find(n=>n.id===S.sel.maker);const model=maker.children.find(n=>n.id===S.sel.model);
  const rng=model.children.find(c=>yearsOf(c.name).includes(S.sel.year));
  let keys,trimName='';
  if(v==='unknown')keys=[...new Set(rng.children.map(x=>x.key).filter(k=>KEYS[k]))];
  else{const tn=rng.children.find(x=>x.id===v);keys=[tn.key].filter(k=>KEYS[k]);trimName=tn.name;}
  if(!keys.length){toast('이 트림에는 아직 엔진 정보가 없습니다. 트림 모름으로 진행해 주세요');break;}
  S.car=carFromKeys(keys,S.sel.year,{trim:trimName||'트림 모름'});
  S.res={kind:'one',car:S.car,src:'model',vendor:trimName?'트림: '+trimName:'트림 모름 · 엔진별로 확인 표시'};
  S.cat='전체';render();toast('차종을 정했습니다. 내 차로 기억해 둡니다');break;}
 case 'cat-go':S.view='list';S.cat=v;render();window.scrollTo(0,0);break;
 case 'cat':S.cat=v;render();break;
 case 'car-change':S.view='home';S.res=null;render();window.scrollTo(0,0);break;
 case 'car-clear':await busy('내 차 해제 중...',300);S.car=null;S.res=null;render();toast('내 차를 해제했습니다. 전체 상품을 보여 드립니다');break;
 case 'open':hideToast();S.view='detail';S.detail=v;S.dtab='info';render();window.scrollTo(0,0);break;
 case 'dtab':S.dtab=v;render();break;
 case 'cart':await busy('장바구니에 담는 중...',340);S.orderPid=v;toast('장바구니에 담았습니다');break;
 case 'buy':await busy('주문서 여는 중...',340);S.orderPid=v;S.view='order';render();window.scrollTo(0,0);break;
 case 'pn-ex':S.pnq=v;render();await doPn();break;
 /* admin */
 case 'anav':hideToast();S.aview=v;S.tform=null;render();window.scrollTo(0,0);break;
 case 'ttog':S.topen[v]=!S.topen[v];render();break;
 case 'tsel':S.tsel=v;S.tform=null;render();break;
 case 'tadd':S.tform={mode:'add'};render();$('#tName').focus();break;
 case 'tadd-root':S.tform={mode:'root'};render();$('#tName').focus();break;
 case 'tren':S.tform={mode:'rename'};render();$('#tName').focus();break;
 case 'tdel':S.tform={mode:'del'};render();break;
 case 'tcancel':S.tform=null;render();break;
 case 'up-file':await busy('파일 읽는 중...',380);S.up={file:'호환차종_매핑_2611.xlsx',checked:false,applied:false,prog:0};render();toast('파일을 골랐습니다. 검사를 시작하세요');break;
 case 'up-check':{
  S.up.prog=0;render();
  const p=busy('엑셀 검사 중... 12,480행',600);
  requestAnimationFrame(()=>{const b=$('#progBar');if(b)b.style.width='100%';});
  await p;S.up.checked=true;S.up.prog=null;render();toast(`검사를 마쳤습니다. 통과 ${fmt(UP.ok)}행, 오류 ${UP.bad}행`);break;}
 case 'up-errdl':await busy('오류 목록 파일 만드는 중...',420);toast(`오류 목록 파일(${UP.bad}행)을 내려받았습니다 (시연용)`);break;
 case 'up-reset':S.up={step:0,file:null,checked:false,applied:false};render();break;
 case 'up-apply':{
  await busy('매핑 반영 중...',580);
  const added=UP_PAIRS.filter(([p,k])=>!MAP.has(p+'|'+k)).map(([p,k])=>p+'|'+k);added.forEach(x=>MAP.add(x));
  S.mapTotal+=UP.ok;S.up.applied=true;
  S.history.unshift({id:'U-0418',at:'2026.11.13 14:32',file:S.up.file,rows:UP.rows,applied:UP.ok,state:'반영',pairs:added});
  render();toast(`${fmt(UP.ok)}행을 반영했습니다. 현재 매핑 ${fmt(S.mapTotal)}행`);break;}
 case 'up-undo':{
  const hrow=S.history.find(x=>x.id===v);
  await busy('업로드 되돌리는 중...',520);
  hrow.pairs.forEach(x=>MAP.delete(x));S.mapTotal-=hrow.applied;hrow.state='되돌림';
  render();toast(`${hrow.file} 반영분 ${fmt(hrow.applied)}행을 되돌렸습니다`);break;}
 case 'm-pick':S.mpid=v;S.mchk=new Set(fitsOf(v));render();break;
 case 'm-chk':{const k=t.value;t.checked?S.mchk.add(k):S.mchk.delete(k);const c=$('#mCnt');if(c)c.textContent=`연결 차종 ${S.mchk.size}개`;break;}
 case 'm-reset':S.mchk=new Set(fitsOf(S.mpid));render();break;
 case 'm-clear':S.mq='';render();break;
 case 'assign':{
  const sel=$('#c'+v);const k=sel.value;const u=S.unmatched.find(x=>x.id===v);
  await busy('대응표에 저장 중...',460);
  S.unmatched=S.unmatched.filter(x=>x.id!==v);render();
  toast(`'${u.vendor}' → ${KEYS[k].code} 지정. 다음부터 자동 연결됩니다`);break;}
 case 'guide-toggle':S.guideOpen=!S.guideOpen;renderGuide();break;
 case 'guide':hideToast();guideGo(+v);break;
 }
});
document.addEventListener('input',e=>{
 const id=e.target.id;
 if(id==='fPlate')S.plate=e.target.value;else if(id==='fOwner')S.owner=e.target.value;else if(id==='fVin')S.vin=e.target.value;else if(id==='fPn')S.pnq=e.target.value;else if(id==='fMq')S.mq=e.target.value;
});
document.addEventListener('change',e=>{if(e.target.id==='fAgree')S.agree=e.target.checked;});

async function doPn(){
 await busy('품번 찾는 중...',360);
 S.pnres=pnSearch(S.pnq);render();
 if(S.pnres)toast(S.pnres.items.length?`같은 묶음 ${S.pnres.items.length}개 상품을 찾았습니다`:'일치하는 품번이 없습니다');
}
document.addEventListener('submit',async e=>{
 e.preventDefault();if(busyOn)return;
 const f=e.target.dataset.form;
 if(f==='plate'){
  if(!S.plate.trim()||!S.owner.trim()){S.werr='차량번호와 소유자명을 넣어 주세요';render();return;}
  if(!S.agree){S.werr='차량 정보 조회에 동의해 주세요';render();return;}
  S.werr='';await lookupPlate(S.plate,S.owner);
 }else if(f==='vin'){
  const vin=norm(S.vin);
  if(vin.length!==17){S.werr='차대번호 17자리를 넣어 주세요';render();return;}
  S.werr='';await busy('차대번호로 찾는 중...',480);
  const d=VINS[vin];
  if(!d){S.res={kind:'none',cached:false};render();toast('차대번호로 찾지 못했습니다');return;}
  S.car=carFromKeys([d.key],d.year,{vin});S.res={kind:'one',car:S.car,src:'vin',vendor:d.vendor};S.cat='전체';render();toast('조회했습니다. 내 차로 기억해 둡니다');
 }else if(f==='pn'){await doPn();}
 else if(f==='order'){await busy('주문 정보 저장 중...',420);toast('차량번호·차대번호를 주문서에 저장했습니다');}
 else if(f==='msearch'){await busy('부품 찾는 중...',320);render();}
 else if(f==='map'){
  await busy('매핑 저장 중...',480);
  const before=new Set(fitsOf(S.mpid));let add=0,del=0;
  S.mchk.forEach(k=>{if(!before.has(k)){MAP.add(S.mpid+'|'+k);add++;}});
  before.forEach(k=>{if(!S.mchk.has(k)){MAP.delete(S.mpid+'|'+k);del++;}});
  S.mapTotal+=add-del;render();toast(`매핑을 저장했습니다. 추가 ${add}건, 해제 ${del}건 (연결 차종 ${S.mchk.size}개)`);
 }else if(f==='tsave'){
  const name=$('#tName').value.trim();if(!name){$('#tName').focus();return;}
  await busy('차종 마스터 저장 중...',400);
  const cur=findNode(S.tsel);
  if(S.tform.mode==='rename'){cur.n.name=name;toast('이름을 고쳤습니다');}
  else{
   const parent=S.tform.mode==='root'?null:cur.n;const lv=parent?parent.lv+1:0;
   const extra={};
   if(lv===3){const pk=parent.children[0]&&parent.children[0].key;extra.key=pk||null;}
   const nn=mkNode(name,lv,extra);
   if(parent){parent.children.push(nn);S.topen[parent.id]=true;}else S.tree.push(nn);
   S.tsel=nn.id;toast(`${LV[lv]} '${name}'을 추가했습니다`);
  }
  S.tform=null;render();
 }else if(f==='tdel'){
  const cur=findNode(S.tsel);await busy('삭제 중...',400);
  const keys=keysUnder(cur.n);const others=new Set();
  walk(n=>{if(n.key&&!isUnder(n,cur.n))others.add(n.key);});
  keys.filter(k=>!others.has(k)).forEach(k=>{[...MAP].forEach(x=>{if(x.endsWith('|'+k)){MAP.delete(x);S.mapTotal--;}});});
  const list=cur.p?cur.p.children:S.tree;list.splice(list.indexOf(cur.n),1);
  S.tsel=cur.p?cur.p.id:(S.tree[0]&&S.tree[0].id);S.tform=null;render();toast(`'${cur.n.name}'을 삭제했습니다`);
 }
});
function isUnder(n,root){let f=false;(function w(x){if(x===n)f=true;x.children.forEach(w);})(root);return f;}

render();
})();
