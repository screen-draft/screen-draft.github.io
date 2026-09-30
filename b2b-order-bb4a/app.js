(function(){
"use strict";

/* ===== utils ===== */
const ic = (n)=>'<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-'+n+'"/></svg>';
const won = (n)=>Number(n).toLocaleString('ko-KR');
const floor10 = (n)=>Math.floor(n/10)*10;
const DAY = 86400000;
const today = new Date(); today.setHours(0,0,0,0);
const dstr = (d)=>{const x=new Date(d);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');};
const TODAY = dstr(today);
const addDays = (n)=>dstr(today.getTime()+n*DAY);
const clone = (o)=>JSON.parse(JSON.stringify(o));
const esc = (s)=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $ = (id)=>document.getElementById(id);

/* 금액을 한글로: 2904000 -> 이백구십만사천 */
function hangul(n){
  const d=['','일','이','삼','사','오','육','칠','팔','구'], u=['','십','백','천'], big=['','만','억','조'];
  let s='', i=0; n=Math.floor(n);
  while(n>0){
    let chunk=n%10000, c='', k=0;
    while(chunk>0){const dg=chunk%10; if(dg) c=d[dg]+u[k]+c; chunk=Math.floor(chunk/10); k++;}
    if(c) s=c+big[i]+s;
    n=Math.floor(n/10000); i++;
  }
  return s||'영';
}

/* ===== 예시 데이터 ===== */
const SEED = {
  products:{
    'P-101':{name:'코팅 작업장갑',spec:'10켤레 / 박스',ipsu:'10켤레',cat:'보호구',base:24000,moq:5,step:5,uom:'박스',stock:320},
    'P-102':{name:'PVC 절연 테이프',spec:'19mm x 10m',ipsu:'1롤',cat:'전기·배선 자재',base:1800,moq:50,step:10,uom:'롤',stock:4200},
    'P-103':{name:'경량 안전화',spec:'250~290mm',ipsu:'1켤레',cat:'보호구',base:58000,moq:2,step:1,uom:'켤레',stock:86},
    'P-104':{name:'방진 마스크 KF94',spec:'20매 / 박스',ipsu:'20매',cat:'보호구',base:15000,moq:10,step:10,uom:'박스',stock:540},
    'P-105':{name:'케이블 타이 200mm',spec:'1,000개 / 봉',ipsu:'1,000개',cat:'전기·배선 자재',base:9500,moq:20,step:5,uom:'봉',stock:1250},
    'P-106':{name:'고시인성 안전조끼',spec:'프리사이즈',ipsu:'1벌',cat:'보호구',base:12000,moq:10,step:5,uom:'벌',stock:210}
  },
  clients:{
    A:{name:'거래처 A',kind:'대리점',grade:'우수',rate:0.08,special:{'P-101':20500,'P-103':52000},blocked:[]},
    B:{name:'거래처 B',kind:'일반 납품처',grade:'일반',rate:0.03,special:{'P-104':13800},blocked:['P-106']}
  },
  orders:[
    {id:'O-24091',client:'A',date:addDays(-12),source:'장바구니',status:'출고 완료',
     lines:[{pid:'P-101',qty:20,unit:20500,rule:'전용 공급가'},{pid:'P-102',qty:100,unit:1650,rule:'우수 등급 할인 8%'}]},
    {id:'O-24092',client:'B',date:TODAY,source:'장바구니',status:'입금 대기',
     lines:[{pid:'P-104',qty:20,unit:13800,rule:'전용 공급가'},{pid:'P-102',qty:100,unit:1740,rule:'일반 등급 할인 3%'}]}
  ],
  quotes:[
    {id:'Q-3107',client:'A',status:'발행',requested:addDays(-2),issued:addDays(-1),validUntil:addDays(10),
     lines:[{pid:'P-104',qty:200,unit:13200,note:'대량 수량 조정'}],memo:'현장 비축분'},
    {id:'Q-3098',client:'A',status:'발행',requested:addDays(-20),issued:addDays(-19),validUntil:addDays(-3),
     lines:[{pid:'P-105',qty:100,unit:8740,note:''}],memo:''},
    {id:'Q-3112',client:'B',status:'요청',requested:addDays(-1),issued:'',validUntil:'',
     lines:[{pid:'P-103',qty:30,unit:null,note:''},{pid:'P-102',qty:500,unit:null,note:''}],memo:'현장 투입분, 분할 납품 가능 여부 문의'}
  ],
  carts:{A:{},B:{}}
};
let S = clone(SEED);
let seq = {order:24093, quote:3113};

/* ===== 가격 계산: 이 모듈 한 곳에서만 ===== */
function priceOf(clientId,pid,data){
  data = data||S;
  const p=data.products[pid], c=data.clients[clientId];
  if(c.blocked.indexOf(pid)>=0) return {sellable:false,rule:'판매 불가'};
  if(c.special[pid]!=null) return {sellable:true,unit:Number(c.special[pid]),rule:'전용 공급가'};
  if(c.rate>0) return {sellable:true,unit:floor10(p.base*(1-c.rate)),rule:c.grade+' 등급 할인 '+Math.round(c.rate*100)+'%'};
  return {sellable:true,unit:p.base,rule:'기본가'};
}
function checkQty(p,q){
  q=Number(q);
  if(!Number.isInteger(q)||q<=0) return '수량을 입력해 주세요.';
  if(q<p.moq) return '최소 주문 수량은 '+p.moq+p.uom+'입니다.';
  if(q%p.step!==0){const lo=Math.floor(q/p.step)*p.step, hi=lo+p.step;return p.step+p.uom+' 단위로 주문할 수 있습니다. ('+Math.max(lo,p.moq)+' 또는 '+hi+')';}
  return '';
}
/* 서버 측 주문 검증: 화면 검증과 별개로 한 번 더 */
function serverValidate(clientId,lines,data){
  data=data||S;
  for(const l of lines){
    const p=data.products[l.pid]; const pr=priceOf(clientId,l.pid,data);
    if(!pr.sellable) return p.name+': 이 거래처에 판매하지 않는 상품입니다.';
    const e=checkQty(p,l.qty); if(e) return p.name+': '+e;
  }
  return '';
}
/* 공급가액 / 부가세 / 합계. lines: [{unit, qty}] */
function amounts(lines){
  let supply=0, vat=0;
  lines.forEach(l=>{const a=(Number(l.unit)||0)*(Number(l.qty)||0); supply+=a; vat+=Math.floor(a/10);});
  return {supply,vat,total:supply+vat};
}
const lineVat = (unit,qty)=>Math.floor(unit*qty/10);

/* ===== UI state & routing ===== */
const UI = {role:null, view:null, id:null, previewClient:'B', cat:'전체', q:'', onlySp:false, draft:{A:{},B:{}}, verify:null, upload:null, savedNote:false, guideOpen:null, guideStep:null};
const NAV = {
  client:[
    {g:'주문'},
    {k:'catalog',l:'상품 주문',i:'box'},
    {k:'cart',l:'장바구니',i:'cart',cnt:()=>Object.keys(S.carts[UI.role]).length},
    {k:'quotes',l:'견적',i:'file',cnt:()=>S.quotes.filter(q=>q.client===UI.role&&q.status==='발행'&&q.validUntil>=TODAY).length},
    {k:'orders',l:'주문 내역',i:'list'}
  ],
  admin:[
    {g:'영업'},
    {k:'home',l:'업무 요약',i:'home'},
    {k:'aquotes',l:'견적 처리',i:'file',cnt:()=>S.quotes.filter(q=>q.status==='요청').length},
    {k:'aorders',l:'주문 관리',i:'list'},
    {g:'기준 정보'},
    {k:'prices',l:'단가 관리',i:'tag'},
    {k:'preview',l:'거래처 화면 보기',i:'eye'},
    {g:'점검'},
    {k:'verify',l:'가격 규칙 검증',i:'shield'}
  ]
};
const TITLES = {catalog:['주문','상품 주문'],cart:['주문','장바구니'],quotes:['주문','견적'],orders:['주문','주문 내역'],
  home:['영업','업무 요약'],aquotes:['영업','견적 처리'],aorders:['영업','주문 관리'],prices:['기준 정보','단가 관리'],preview:['기준 정보','거래처 화면 보기'],verify:['점검','가격 규칙 검증']};

function go(role,view,id){
  const h='#/'+(role||'')+(view?'/'+view:'')+(id?'/'+id:'');
  if(location.hash===h) route(); else location.hash=h;
}
function route(){
  const parts=location.hash.replace(/^#\/?/,'').split('/').filter(Boolean);
  const role=parts[0];
  if(role!=='A'&&role!=='B'&&role!=='admin'){UI.role=null;render();return;}
  const list=(role==='admin'?NAV.admin:NAV.client).filter(n=>n.k).map(n=>n.k);
  UI.role=role; UI.view=list.indexOf(parts[1])>=0?parts[1]:list[0]; UI.id=parts[2]||null;
  if(Date.now()-(toast.at||0)>300) $('toastHost').innerHTML='';
  render();
  const m=$('main'); if(m&&document.activeElement&&document.activeElement.closest&&document.activeElement.closest('.side')) m.focus({preventScroll:true});
  window.scrollTo(0,0);
}

/* ===== feedback ===== */
function toast(msg,kind){
  const h=$('toastHost');
  toast.at=Date.now();
  h.innerHTML='<div class="toast'+(kind==='bad'?' bad':'')+'" role="status">'+ic(kind==='bad'?'alert':'check')+'<span>'+esc(msg)+'</span></div>';
  clearTimeout(toast.t); toast.t=setTimeout(()=>{h.innerHTML='';},3200);
}
let busy=false;
function withLoading(msg,fn){
  if(busy) return; busy=true;
  $('overlayHost').innerHTML='<div class="overlay" role="status" aria-live="assertive"><div class="ob"><span class="spin" aria-hidden="true"></span><span>'+esc(msg)+'</span></div></div>';
  setTimeout(()=>{$('overlayHost').innerHTML='';busy=false;fn();},450);
}

/* ===== small parts ===== */
function st(text,kind){return '<span class="st '+kind+'">'+esc(text)+'</span>';}
function empty(icon,title,desc,btn){return '<div class="empty">'+ic(icon)+'<strong>'+esc(title)+'</strong><p>'+esc(desc)+'</p>'+(btn||'')+'</div>';}
function pageHead(extra,sub){
  const t=TITLES[UI.view];
  return '<div class="ph"><div><div class="crumb">'+t[0]+' &gt; '+t[1]+'</div><h1>'+t[1]+'</h1>'+(sub?'<div class="sub">'+sub+'</div>':'')+'</div>'+(extra?'<div class="ph-actions">'+extra+'</div>':'')+'</div>';
}
function btn(o){
  /* o: {cls, icon, label, attrs, iconM} iconM = 모바일에서 아이콘만 */
  const lbl='<span class="lbl">'+esc(o.label)+'</span>';
  return '<button type="button" class="btn '+(o.cls||'')+(o.iconM?' icon-m':'')+'"'+(o.iconM?' data-tip="'+esc(o.label)+'" aria-label="'+esc(o.label)+'"':'')+' '+(o.attrs||'')+'>'+(o.icon?ic(o.icon):'')+lbl+'</button>';
}
function ruleSpan(pr){return '<div class="rule'+(pr.rule==='전용 공급가'?' sp':'')+'">'+esc(pr.rule)+'</div>';}
function sumBox(a){return '<div class="sum" aria-label="금액 합계"><div><span>공급가액</span><span>'+won(a.supply)+'원</span></div><div><span>부가세 (10%)</span><span>'+won(a.vat)+'원</span></div><div><span>합계</span><span>'+won(a.total)+'원</span></div></div>';}
function quoteState(q){
  if(q.status==='요청') return ['견적 작성 대기','mute'];
  if(q.status==='주문 전환') return ['주문 전환','ok'];
  if(q.validUntil<TODAY) return ['유효기간 경과','warn'];
  return ['견적 도착','info'];
}
function orderState(o){return {'입금 대기':'warn','출고 준비':'info','출고 완료':'ok'}[o.status]||'mute';}
function linesSummary(lines){const f=S.products[lines[0].pid].name;return lines.length>1?f+' 외 '+(lines.length-1)+'건':f;}

/* ===== login ===== */
function renderLogin(){
  $('app').hidden=true; $('login').hidden=false;
  $('login').innerHTML='<div class="login"><div class="login-top"><span class="logo" aria-hidden="true">LOGO</span><span>거래처 주문 시스템</span></div>'+
  '<div class="login-wrap"><div class="login-box"><div class="in"><h1>기업 거래처 로그인</h1><p class="lead">사업자 등록을 마친 거래처만 이용할 수 있습니다.</p>'+
  '<div class="fld"><label for="lid">아이디</label><input id="lid" class="f" disabled placeholder="시연에서는 입력하지 않습니다"></div>'+
  '<div class="fld"><label for="lpw">비밀번호</label><input id="lpw" class="f" type="password" disabled></div>'+
  '<button type="button" class="btn pri" style="width:100%;margin-top:6px" disabled>로그인</button></div>'+
  '<div class="demo-acc"><h2>시연 계정으로 들어가기</h2>'+
  [['A','거래처 A','대리점, 우수 등급 (전용 공급가 2품목)'],['B','거래처 B','일반 납품처, 일반 등급 (판매 제한 1품목)'],['admin','관리자','공급사 영업 담당자']]
    .map(a=>'<button type="button" data-login="'+a[0]+'"><span><b>'+a[1]+'</b><span class="d">'+a[2]+'</span></span>'+ic('right')+'</button>').join('')+
  '</div></div></div><p class="login-foot">시연용 예시 데이터입니다. 상품, 가격, 우선순위 규칙은 기획 단계에서 확정합니다.</p></div>';
}

/* ===== shell ===== */
function renderShell(){
  $('login').hidden=true; $('app').hidden=false;
  const isA=UI.role==='admin';
  $('roleSel').value=UI.role;
  $('who').textContent=isA?'관리자 (공급사 담당자)':S.clients[UI.role].name+' 담당자 · '+S.clients[UI.role].kind;
  $('side').innerHTML=(isA?NAV.admin:NAV.client).map(n=>{
    if(n.g) return '<h2>'+n.g+'</h2>';
    const c=n.cnt?n.cnt():0;
    return '<a href="#/'+UI.role+'/'+n.k+'"'+(UI.view===n.k?' aria-current="page"':'')+'>'+ic(n.i)+n.l+(c?'<span class="cnt">'+c+'</span>':'')+'</a>';
  }).join('');
}

/* ===== client: catalog ===== */
function catalogRows(clientId,readonly){
  const all=Object.keys(S.products).filter(pid=>priceOf(clientId,pid).sellable);
  const q=UI.q.trim();
  const rows=all.filter(pid=>{const p=S.products[pid];
    if(UI.cat!=='전체'&&p.cat!==UI.cat) return false;
    if(q&&(p.name+pid+p.spec).indexOf(q)<0) return false;
    if(UI.onlySp&&priceOf(clientId,pid).rule!=='전용 공급가') return false;
    return true;});
  return {all,rows};
}
function catalogTable(clientId,readonly,rows){
  if(!rows.length) return empty('search','조건에 맞는 상품이 없습니다','검색어나 카테고리를 바꿔 보세요.','<button type="button" class="btn" data-act="clearFilter">조건 초기화</button>');
  const d=UI.draft[clientId];
  const body=rows.map(pid=>{
    const p=S.products[pid], pr=priceOf(clientId,pid);
    const v=d[pid]!=null?d[pid]:p.moq;
    const inCart=S.carts[clientId][pid]!=null;
    return '<tr>'+
      '<td class="c-th"><span class="thumb" aria-hidden="true">'+ic('image')+'</span></td>'+
      '<td class="c-id code">'+pid+'</td>'+
      '<td class="c-nm">'+esc(p.name)+'<div class="small m-only">'+pid+' / '+esc(p.spec)+'</div></td>'+
      '<td class="c-sp">'+esc(p.spec)+'</td>'+
      '<td class="c-uom c">'+p.uom+'</td>'+
      '<td class="c-ip">'+esc(p.ipsu)+'</td>'+
      '<td class="c-pr r"><span class="price">'+won(pr.unit)+'</span>'+ruleSpan(pr)+'</td>'+
      '<td class="c-mq r num">'+p.moq+' / '+p.step+'<span class="m-only"> '+p.uom+' (최소 / 주문 단위)</span></td>'+
      (readonly?'':'<td class="c-q r"><label class="sr" for="dq-'+pid+'">'+esc(p.name)+' 수량</label><input class="f qty" id="dq-'+pid+'" type="number" inputmode="numeric" min="0" step="'+p.step+'" value="'+v+'" data-draft="'+pid+'"><div class="err" id="de-'+pid+'"></div></td>'+
      '<td class="c-ad r">'+btn({cls:'sm'+(inCart?'':''),icon:'cart',label:inCart?'추가 담기':'담기',attrs:'data-add="'+pid+'"'})+'</td>')+
      '</tr>';
  }).join('');
  return '<div class="tw rl rl-cat"><table class="t"><thead><tr><th><span class="sr">이미지</span></th><th>품번</th><th>품명</th><th>규격</th><th class="c">단위</th><th>입수</th><th class="r">공급가(원)</th><th class="r">최소 / 단위</th>'+(readonly?'':'<th class="r">수량</th><th></th>')+'</tr></thead><tbody>'+body+'</tbody></table></div>';
}
function catalogBlock(clientId,readonly){
  const {all,rows}=catalogRows(clientId,readonly);
  const cats=['전체'].concat([...new Set(all.map(pid=>S.products[pid].cat))]);
  const cnt=(c)=>c==='전체'?all.length:all.filter(pid=>S.products[pid].cat===c).length;
  return '<div class="cat"><div class="cats" role="group" aria-label="카테고리"><h2>카테고리</h2>'+
    cats.map(c=>'<button type="button" data-cat="'+c+'" aria-pressed="'+(UI.cat===c)+'"><span>'+c+'</span><span class="cnt">'+cnt(c)+'</span></button>').join('')+'</div>'+
    '<div><div class="bar"><div class="search">'+ic('search')+'<label class="sr" for="qs">상품 검색</label><input id="qs" class="f" type="search" placeholder="품명, 품번 검색" value="'+esc(UI.q)+'"></div>'+
    '<label class="chk"><input type="checkbox" id="onlySp"'+(UI.onlySp?' checked':'')+'>전용 공급가 품목만</label><span class="grow"></span><span class="small">'+rows.length+'개 품목</span>'+
    (readonly?'':btn({cls:'pri',icon:'cart',label:'입력 수량 일괄 담기',attrs:'data-act="addAll"'}))+'</div>'+
    catalogTable(clientId,readonly,rows)+'</div></div>';
}
function viewCatalog(){
  const c=S.clients[UI.role];
  const hidden=c.blocked.length;
  return pageHead('', c.name+'에 적용되는 가격만 표시됩니다. 공급가는 부가세 별도입니다.')+catalogBlock(UI.role,false)+
    (hidden?'<p class="note">'+ic('alert')+'이 거래처에 판매하지 않는 상품 '+hidden+'개는 목록에 나오지 않고, 주문 요청을 직접 보내도 서버에서 거절합니다.</p>':'');
}

/* ===== client: cart ===== */
function cartLines(cid){cid=cid||UI.role;const cart=S.carts[cid];return Object.keys(cart).map(pid=>({pid,qty:cart[pid]}));}
function viewCart(){
  const lines=cartLines();
  if(!lines.length) return pageHead()+empty('cart','장바구니가 비어 있습니다','상품 주문 화면에서 수량을 입력해 담으면 여기서 한 번에 확인하고 주문할 수 있습니다.','<button type="button" class="btn pri" data-go="catalog">상품 주문으로 이동</button>');
  const rows=lines.map(l=>{
    const p=S.products[l.pid], pr=priceOf(UI.role,l.pid), err=checkQty(p,l.qty);
    return '<tr>'+
      '<td class="c-nm">'+esc(p.name)+'<div class="small">'+l.pid+' / 최소 '+p.moq+p.uom+', '+p.step+p.uom+' 단위</div></td>'+
      '<td class="c-rule">'+ruleSpan(pr)+'</td>'+
      '<td class="c-pr r num"><span class="m-only small">단가 </span>'+won(pr.unit)+'<span class="m-only small">원 ('+esc(pr.rule)+')</span></td>'+
      '<td class="c-q r"><label class="sr" for="q-'+l.pid+'">'+esc(p.name)+' 수량</label><input class="f qty'+(err?' invalid':'')+'" type="number" inputmode="numeric" id="q-'+l.pid+'" data-qty="'+l.pid+'" value="'+l.qty+'" min="0" step="'+p.step+'" aria-describedby="e-'+l.pid+'"'+(err?' aria-invalid="true"':'')+'><div class="err" id="e-'+l.pid+'" role="alert">'+(err?esc(err):'')+'</div></td>'+
      '<td class="c-am r num" id="a-'+l.pid+'">'+won(pr.unit*(Number(l.qty)||0))+'</td>'+
      '<td class="c-del r"><button type="button" class="btn sm icon-m" data-del="'+l.pid+'" aria-label="'+esc(p.name)+' 삭제" data-tip="삭제">'+ic('x')+'<span class="lbl">삭제</span></button></td></tr>';
  }).join('');
  return pageHead('', '수량을 입력하는 즉시 최소 주문 수량과 주문 단위를 확인합니다.')+
    '<div class="tw rl rl-cart"><table class="t"><thead><tr><th>상품</th><th>적용 가격</th><th class="r">단가(원)</th><th class="r">수량</th><th class="r">공급가액(원)</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
    '<div id="cartSum"></div><p class="note warn" id="cartState" hidden></p>'+
    '<div class="acts">'+
      btn({icon:'shield',label:'화면 검증 없이 전송',iconM:true,attrs:'id="bypassBtn"'})+
      btn({icon:'file',label:'이 품목으로 견적 요청',iconM:true,attrs:'id="cartQuoteBtn"'})+
      btn({cls:'pri',icon:'check',label:'주문 확정',attrs:'id="orderBtn"'})+
    '</div>'+
    '<p class="note">'+ic('shield')+'화면 검증 없이 전송: 화면의 수량 검사를 거치지 않고 주문 요청을 보냈을 때 서버가 가격과 수량을 다시 확인해 막는지 보여 줍니다.</p>';
}
function refreshCart(){
  const lines=cartLines(); let bad=0;
  const priced=lines.map(l=>{const p=S.products[l.pid], pr=priceOf(UI.role,l.pid), err=checkQty(p,l.qty); if(err) bad++;
    const a=$('a-'+l.pid); if(a) a.textContent=won(pr.unit*(Number(l.qty)||0));
    const e=$('e-'+l.pid); if(e) e.textContent=err;
    const i=$('q-'+l.pid); if(i){i.classList.toggle('invalid',!!err); if(err) i.setAttribute('aria-invalid','true'); else i.removeAttribute('aria-invalid');}
    return {unit:pr.unit,qty:l.qty};});
  const s=$('cartSum'); if(s) s.innerHTML=sumBox(amounts(priced));
  const b=$('orderBtn'); if(b) b.disabled=bad>0;
  const stt=$('cartState'); if(stt){stt.hidden=!bad; stt.innerHTML=bad?ic('alert')+'수량을 고쳐야 하는 품목이 '+bad+'개 있어 주문을 확정할 수 없습니다.':'';}
}

/* ===== client: quotes ===== */
function quoteDoc(q){
  const c=S.clients[q.client];
  const lines=q.lines.map(l=>({unit:l.unit,qty:l.qty}));
  const a=amounts(lines);
  const blank=Math.max(0,4-q.lines.length);
  const items=q.lines.map((l,i)=>{const p=S.products[l.pid];const sup=l.unit*l.qty;
    return '<tr><td class="c">'+(i+1)+'</td><td>'+esc(p.name)+'<div class="ex">'+l.pid+'</div></td><td>'+esc(p.spec)+'</td><td class="r">'+won(l.qty)+'</td><td class="c">'+p.uom+'</td><td class="r">'+won(l.unit)+'</td><td class="r">'+won(sup)+'</td><td class="r">'+won(lineVat(l.unit,l.qty))+'</td><td>'+esc(l.note||'')+'</td></tr>';}).join('')+
    '<tr class="blank"><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>'.repeat(blank);
  return '<article class="qdoc" aria-label="견적서 '+q.id+'"><h2>견적서</h2>'+
    '<div class="qhead"><div class="to"><table><tbody>'+
      '<tr><th>견적번호</th><td>'+q.id+'</td></tr><tr><th>견적일</th><td>'+q.issued+'</td></tr><tr><th>유효기간</th><td>'+q.validUntil+' 까지</td></tr>'+
      '<tr><th>공급받는자</th><td class="big">'+c.name+' 귀하</td></tr></tbody></table>'+
      '<p class="say">아래와 같이 견적합니다.</p></div>'+
    '<div><table><tbody>'+
      '<tr><td class="vert" rowspan="4">공<br>급<br>자</td><th>등록번호</th><td colspan="3">000-00-00000</td></tr>'+
      '<tr><th>상호</th><td>(공급사명)</td><th>성명</th><td><span class="seal">(대표자)<i aria-label="직인 자리">인</i></span></td></tr>'+
      '<tr><th>주소</th><td colspan="3">경기도 부천시 (사업장 주소)</td></tr>'+
      '<tr><th>업태</th><td>도소매</td><th>종목</th><td>산업용품</td></tr>'+
    '</tbody></table></div></div>'+
    '<table class="qtotal"><tbody><tr><th>합계금액<div class="ex">공급가액 + 세액</div></th><td>일금 '+hangul(a.total)+'원정 (&#8361;'+won(a.total)+')</td></tr></tbody></table>'+
    '<div class="tw" style="border:0;overflow-x:auto"><table class="qitems"><thead><tr><th>No</th><th>품명</th><th>규격</th><th>수량</th><th>단위</th><th>단가</th><th>공급가액</th><th>세액</th><th>비고</th></tr></thead><tbody>'+items+
    '</tbody><tfoot><tr><td colspan="6" class="c">합계</td><td class="r">'+won(a.supply)+'</td><td class="r">'+won(a.vat)+'</td><td></td></tr></tfoot></table></div>'+
    '<div class="qfoot"><table><tbody><tr><th style="width:90px">비고</th><td>'+(q.memo?esc(q.memo)+'<br>':'')+'견적 단가는 유효기간 안에 주문으로 전환할 때 그대로 주문 금액이 됩니다.<br>결제 조건과 납기는 예시이며 기획 단계에서 확정합니다.</td></tr></tbody></table></div>'+
  '</article>';
}
function viewQuotes(){
  const qs=S.quotes.filter(q=>q.client===UI.role);
  if(UI.id){
    const q=qs.find(x=>x.id===UI.id);
    if(q) return quoteDetail(q);
  }
  if(!qs.length) return pageHead()+empty('file','요청한 견적이 없습니다','장바구니에서 품목을 담고 견적을 요청하면 담당자가 거래처 적용가를 바탕으로 견적서를 보내 드립니다.','<button type="button" class="btn pri" data-go="catalog">상품 주문으로 이동</button>');
  const rows=qs.slice().reverse().map(q=>{const [s,k]=quoteState(q);const a=amounts(q.lines.map(l=>({unit:l.unit||0,qty:l.qty})));
    return '<tr><td data-k="견적번호"><button type="button" class="idlink" data-open-q="'+q.id+'">'+q.id+'</button></td><td class="stc">'+st(s,k)+'</td><td data-k="요청일" class="num">'+q.requested+'</td><td class="full">'+esc(linesSummary(q.lines))+'</td><td data-k="유효기간" class="num">'+(q.validUntil||'-')+'</td><td data-k="합계" class="r num">'+(q.status==='요청'?'-':won(a.total))+'</td></tr>';}).join('');
  return pageHead('','견적서의 단가와 유효기간은 발행 시점에 고정됩니다.')+
    '<div class="tw rl rl-kv"><table class="t"><thead><tr><th>견적번호</th><th>상태</th><th>요청일</th><th>품목</th><th>유효기간</th><th class="r">합계(원, VAT 포함)</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
}
function quoteDetail(q){
  const [s,k]=quoteState(q);
  const back='<button type="button" class="btn" data-go="quotes">'+ic('left')+'목록</button>';
  let body;
  if(q.status==='요청'){
    body='<div class="note">'+ic('inbox')+'담당자가 견적서를 작성하고 있습니다. 요청 품목은 아래와 같습니다.</div>'+
      '<div class="tw" style="margin-top:10px"><table class="t"><thead><tr><th>품명</th><th class="r">수량</th></tr></thead><tbody>'+
      q.lines.map(l=>'<tr><td>'+esc(S.products[l.pid].name)+'</td><td class="r num">'+won(l.qty)+' '+S.products[l.pid].uom+'</td></tr>').join('')+'</tbody></table></div>';
  } else {
    body=quoteDoc(q);
  }
  let acts='';
  if(q.status==='발행'&&q.validUntil>=TODAY) acts=btn({icon:'printer',label:'인쇄',iconM:true,attrs:'data-act="print"'})+btn({cls:'pri',icon:'check',label:'이 견적으로 주문',attrs:'data-convert="'+q.id+'"'});
  if(q.status==='발행'&&q.validUntil<TODAY) acts=btn({cls:'pri',icon:'refresh',label:'같은 품목으로 재견적 요청',attrs:'data-requote="'+q.id+'"'});
  const notice = q.status==='발행'&&q.validUntil<TODAY ? '<p class="note warn">'+ic('alert')+'유효기간('+q.validUntil+')이 지난 견적은 주문으로 전환할 수 없습니다. 같은 품목으로 다시 견적을 요청해 주세요.</p>'
    : q.status==='주문 전환' ? '<p class="note ok">'+ic('check')+'주문 '+q.orderId+'로 전환되었습니다. 주문 금액은 이 견적 단가로 고정되어 있습니다.</p>' : '';
  return '<div class="ph"><div><div class="crumb">주문 &gt; 견적 &gt; '+q.id+'</div><h1>견적 '+q.id+' '+st(s,k)+'</h1></div><div class="ph-actions">'+back+'</div></div>'+
    notice+'<div style="margin-top:12px">'+body+'</div>'+(acts?'<div class="acts" style="max-width:880px">'+acts+'</div>':'');
}

/* ===== client: orders ===== */
function orderLinesTable(o,showCurrent){
  const rows=o.lines.map(l=>{const p=S.products[l.pid];const cur=priceOf(o.client,l.pid);const changed=cur.sellable&&cur.unit!==l.unit;
    return '<tr><td>'+esc(p.name)+'<div class="small">'+l.pid+'</div></td><td class="r num">'+won(l.qty)+' '+p.uom+'</td><td class="r num">'+won(l.unit)+'<div class="rule">'+esc(l.rule)+'</div></td>'+
      (showCurrent?'<td class="r num">'+(cur.sellable?won(cur.unit):'-')+(changed?'<div>'+st('단가 변경됨','warn')+'</div>':'<div class="rule">변동 없음</div>')+'</td>':'')+
      '<td class="r num">'+won(l.unit*l.qty)+'</td></tr>';}).join('');
  return '<div class="tw"><table class="t"><thead><tr><th>상품</th><th class="r">수량</th><th class="r">주문 시점 단가(원)</th>'+(showCurrent?'<th class="r">현재 단가(원)</th>':'')+'<th class="r">공급가액(원)</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+sumBox(amounts(o.lines));
}
function viewOrders(){
  const os=S.orders.filter(o=>o.client===UI.role);
  if(!os.length) return pageHead()+empty('list','아직 주문 내역이 없습니다','장바구니나 견적에서 주문하면 여기에 쌓이고, 지난 주문은 같은 품목으로 다시 담을 수 있습니다.','<button type="button" class="btn pri" data-go="catalog">상품 주문으로 이동</button>');
  const sel=os.find(o=>o.id===UI.id)||os[os.length-1];
  const rows=os.slice().reverse().map(o=>'<tr'+(o===sel?' class="sel"':'')+'><td data-k="주문번호"><button type="button" class="idlink" data-open-o="'+o.id+'">'+o.id+'</button></td><td class="stc">'+st(o.status,orderState(o))+'</td><td data-k="주문일" class="num">'+o.date+'</td><td data-k="경로">'+esc(o.source)+'</td><td class="full">'+esc(linesSummary(o.lines))+'</td><td data-k="합계" class="r num">'+won(amounts(o.lines).total)+'</td></tr>').join('');
  return pageHead('','주문 금액은 주문한 시점의 단가로 고정되어 이후 단가가 바뀌어도 달라지지 않습니다.')+
    '<div class="tw rl rl-kv"><table class="t"><thead><tr><th>주문번호</th><th>상태</th><th>주문일</th><th>주문 경로</th><th>품목</th><th class="r">합계(원, VAT 포함)</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
    '<h2 class="sh">주문 상세 <span class="meta">'+sel.id+' / '+sel.date+'</span></h2>'+orderLinesTable(sel,false)+
    '<div class="acts">'+btn({icon:'refresh',label:'같은 품목 다시 담기',attrs:'data-reorder="'+sel.id+'"'})+'</div>';
}

/* ===== admin: home ===== */
function viewHome(){
  const reqs=S.quotes.filter(q=>q.status==='요청');
  const pay=S.orders.filter(o=>o.status==='입금 대기');
  const td=S.orders.filter(o=>o.date===TODAY);
  const kpi='<div class="kpi">'+
    '<div><div class="k">견적 요청 대기</div><div class="v">'+reqs.length+'<small>건</small></div></div>'+
    '<div><div class="k">입금 대기</div><div class="v">'+pay.length+'<small>건</small></div></div>'+
    '<div><div class="k">오늘 주문</div><div class="v">'+td.length+'<small>건</small></div></div></div>';
  const qt=reqs.length?'<div class="tw"><table class="t"><thead><tr><th>견적번호</th><th>거래처</th><th>요청일</th><th>품목</th></tr></thead><tbody>'+
    reqs.map(q=>'<tr><td><button type="button" class="idlink" data-aq="'+q.id+'">'+q.id+'</button></td><td>'+S.clients[q.client].name+'</td><td class="num">'+q.requested+'</td><td>'+esc(linesSummary(q.lines))+'</td></tr>').join('')+'</tbody></table></div>'
    :empty('inbox','처리할 견적 요청이 없습니다','거래처가 견적을 요청하면 여기에 먼저 나타납니다.');
  const ot='<div class="tw"><table class="t"><thead><tr><th>주문번호</th><th>거래처</th><th>상태</th><th class="r">합계(원)</th></tr></thead><tbody>'+
    S.orders.slice().reverse().slice(0,5).map(o=>'<tr><td><button type="button" class="idlink" data-ao="'+o.id+'">'+o.id+'</button></td><td>'+S.clients[o.client].name+'</td><td>'+st(o.status,orderState(o))+'</td><td class="r num">'+won(amounts(o.lines).total)+'</td></tr>').join('')+'</tbody></table></div>';
  return pageHead('',TODAY+' 기준')+kpi+'<div class="two"><div><h2 class="sh">처리 대기 견적</h2>'+qt+'</div><div><h2 class="sh">최근 주문</h2>'+ot+'</div></div>';
}

/* ===== admin: quotes ===== */
function viewAdminQuotes(){
  if(UI.id){const q=S.quotes.find(x=>x.id===UI.id); if(q&&q.status==='요청') return adminQuoteEdit(q); if(q) return adminQuoteView(q);}
  const rows=S.quotes.slice().sort((a,b)=>(a.status==='요청'?0:1)-(b.status==='요청'?0:1)||b.requested.localeCompare(a.requested)).map(q=>{const [s,k]=quoteState(q);const a=amounts(q.lines.map(l=>({unit:l.unit||0,qty:l.qty})));
    return '<tr><td data-k="견적번호"><button type="button" class="idlink" data-aq="'+q.id+'">'+q.id+'</button></td><td class="stc">'+st(s,k)+'</td><td data-k="거래처">'+S.clients[q.client].name+'</td><td data-k="요청일" class="num">'+q.requested+'</td><td class="full">'+esc(linesSummary(q.lines))+'</td><td data-k="유효기간" class="num">'+(q.validUntil||'-')+'</td><td data-k="합계" class="r num">'+(q.status==='요청'?'-':won(a.total))+'</td>'+
      '<td class="r full">'+(q.status==='요청'?btn({cls:'sm pri',icon:'file',label:'견적 작성',attrs:'data-aq="'+q.id+'"'}):'')+'</td></tr>';}).join('');
  return pageHead('','요청을 열면 해당 거래처 적용가가 채워져 있어 조정할 품목만 고치면 됩니다.')+
    '<div class="tw rl rl-kv"><table class="t"><thead><tr><th>견적번호</th><th>상태</th><th>거래처</th><th>요청일</th><th>품목</th><th>유효기간</th><th class="r">합계(원, VAT 포함)</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>';
}
function adminQuoteEdit(q){
  const c=S.clients[q.client];
  const rows=q.lines.map((l,i)=>{const p=S.products[l.pid];const cur=priceOf(q.client,l.pid);
    return '<tr><td>'+esc(p.name)+'<div class="small">'+l.pid+' / '+esc(p.spec)+'</div></td><td class="r num">'+won(l.qty)+' '+p.uom+'</td>'+
      '<td class="r num">'+(cur.sellable?won(cur.unit):'-')+ruleSpan(cur)+'</td>'+
      '<td class="r"><label class="sr" for="qd-'+i+'">'+esc(p.name)+' 견적 단가</label><input class="f money" type="number" step="10" min="0" id="qd-'+i+'" data-qline="'+i+'" value="'+(cur.sellable?cur.unit:0)+'"></td>'+
      '<td class="r num" id="qa-'+i+'">'+won((cur.unit||0)*l.qty)+'</td></tr>';}).join('');
  return '<div class="ph"><div><div class="crumb">영업 &gt; 견적 처리 &gt; '+q.id+'</div><h1>견적 작성 '+q.id+'</h1><div class="sub">'+c.name+' ('+c.kind+', '+c.grade+' 등급) / 요청 '+q.requested+'</div></div><div class="ph-actions"><button type="button" class="btn" data-go="aquotes">'+ic('left')+'목록</button></div></div>'+
    (q.memo?'<p class="note">'+ic('inbox')+'거래처 메모: '+esc(q.memo)+'</p>':'')+
    '<h2 class="sh">견적 품목 <span class="meta">견적 단가 초기값 = 거래처 적용가</span></h2>'+
    '<div class="tw"><table class="t"><thead><tr><th>상품</th><th class="r">요청 수량</th><th class="r">거래처 적용가(원)</th><th class="r">견적 단가(원)</th><th class="r">공급가액(원)</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
    '<div id="qeSum"></div>'+
    '<div class="acts" style="align-items:center"><label for="vu" class="small">유효기간</label><input type="date" class="f" id="vu" value="'+addDays(14)+'">'+btn({cls:'pri',icon:'send',label:'견적서 발행',attrs:'data-issue="'+q.id+'"'})+'</div>';
}
function refreshQuoteEdit(){
  const q=S.quotes.find(x=>x.id===UI.id); if(!q) return;
  const lines=q.lines.map((l,i)=>{const v=Number(($('qd-'+i)||{}).value)||0; const a=$('qa-'+i); if(a) a.textContent=won(v*l.qty); return {unit:v,qty:l.qty};});
  const s=$('qeSum'); if(s) s.innerHTML=sumBox(amounts(lines));
}
function adminQuoteView(q){
  const [s,k]=quoteState(q);
  return '<div class="ph"><div><div class="crumb">영업 &gt; 견적 처리 &gt; '+q.id+'</div><h1>견적 '+q.id+' '+st(s,k)+'</h1></div><div class="ph-actions"><button type="button" class="btn" data-go="aquotes">'+ic('left')+'목록</button></div></div>'+quoteDoc(q);
}

/* ===== admin: prices ===== */
function viewPrices(){
  const pids=Object.keys(S.products);
  const cell=(cid,pid,p)=>{const c=S.clients[cid];
    if(c.blocked.indexOf(pid)>=0) return '<td>'+st('판매 불가','bad')+'</td>';
    const v=c.special[pid];
    return '<td><label class="sr" for="sp-'+cid+'-'+pid+'">'+c.name+' '+esc(p.name)+' 전용 공급가</label><input class="f money" type="number" step="10" min="0" id="sp-'+cid+'-'+pid+'" data-special="'+cid+'|'+pid+'" value="'+(v==null?'':v)+'" placeholder="'+won(floor10(p.base*(1-c.rate)))+'"><div class="rule">'+(v==null?'비우면 등급가':'전용가 적용 중')+'</div></td>';};
  const rows=pids.map(pid=>{const p=S.products[pid];
    return '<tr><td>'+esc(p.name)+'<div class="small">'+pid+' / '+esc(p.spec)+'</div></td><td><label class="sr" for="bp-'+pid+'">'+esc(p.name)+' 기본가</label><input class="f money" type="number" step="10" min="0" id="bp-'+pid+'" data-base="'+pid+'" value="'+p.base+'"></td>'+cell('A',pid,p)+cell('B',pid,p)+'<td class="r num">'+p.moq+' / '+p.step+' '+p.uom+'</td></tr>';}).join('');
  const up=UI.upload;
  const upHtml=up?'<h2 class="sh">엑셀 일괄 등록 결과 <span class="meta">단가표_거래처별.xlsx (예시)</span></h2>'+
    '<div class="up-sum"><span>전체 <b>'+up.length+'</b>행</span><span style="color:var(--ok)">반영 가능 <b>'+up.filter(r=>!r.err).length+'</b>행</span><span style="color:var(--bad)">오류 <b>'+up.filter(r=>r.err).length+'</b>행</span></div>'+
    '<div class="tw"><table class="t"><thead><tr><th class="r">행</th><th>품번</th><th>거래처</th><th class="r">전용 공급가</th><th>검사 결과</th></tr></thead><tbody>'+
    up.map(r=>'<tr'+(r.err?' class="row-bad"':'')+'><td class="r num">'+r.row+'</td><td class="code">'+esc(r.pid)+'</td><td>'+esc(r.client)+'</td><td class="r num">'+esc(r.price)+'</td><td>'+(r.err?st(r.err,'bad'):st('정상','ok'))+'</td></tr>').join('')+
    '</tbody></table></div><div class="acts">'+btn({icon:'x',label:'닫기',attrs:'data-act="closeUpload"'})+btn({cls:'pri',icon:'check',label:'정상 행만 반영',attrs:'data-act="applyUpload"'})+'</div>':'';
  return pageHead(btn({icon:'download',label:'양식 내려받기',iconM:true,attrs:'data-act="tmpl"'})+btn({icon:'upload',label:'엑셀 일괄 등록',iconM:true,attrs:'data-act="upload"'}),
      '거래처 전용 공급가를 비워 두면 등급 할인율이 적용됩니다. 저장해도 이미 들어온 주문 금액은 바뀌지 않습니다.')+
    '<div class="tw"><table class="t"><thead><tr><th>상품</th><th>기본가(원)</th><th>거래처 A 전용가<div class="rule">우수 등급 8%</div></th><th>거래처 B 전용가<div class="rule">일반 등급 3%</div></th><th class="r">최소 / 단위</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
    '<div class="acts">'+btn({icon:'refresh',label:'예시 데이터로 되돌리기',iconM:true,attrs:'data-act="reset"'})+btn({cls:'pri',icon:'check',label:'단가 저장',attrs:'data-act="savePrices"'})+'</div>'+
    (UI.savedNote?'<p class="note ok">'+ic('check')+'단가를 저장했습니다. 이미 들어온 주문은 주문 시점 단가를 그대로 유지합니다. <button type="button" class="btn link" data-ao="O-24091">주문 관리에서 O-24091 확인</button></p>':
      '<p class="note">'+ic('route')+'확인 방법: 코팅 작업장갑의 거래처 A 전용가를 21000으로 바꿔 저장한 뒤, 주문 관리에서 기존 주문 O-24091의 금액이 그대로인지 봅니다.</p>')+
    upHtml;
}

/* ===== admin: orders ===== */
function viewAdminOrders(){
  if(!S.orders.length) return pageHead()+empty('list','들어온 주문이 없습니다','거래처가 주문하면 여기서 입금과 출고 상태를 관리합니다.');
  const sel=S.orders.find(o=>o.id===UI.id)||S.orders[S.orders.length-1];
  const rows=S.orders.slice().reverse().map(o=>'<tr'+(o===sel?' class="sel"':'')+'><td data-k="주문번호"><button type="button" class="idlink" data-ao="'+o.id+'">'+o.id+'</button></td><td class="stc">'+st(o.status,orderState(o))+'</td><td data-k="거래처">'+S.clients[o.client].name+'</td><td data-k="주문일" class="num">'+o.date+'</td><td class="full">'+esc(linesSummary(o.lines))+'</td><td data-k="합계" class="r num">'+won(amounts(o.lines).total)+'</td></tr>').join('');
  const changed=sel.lines.some(l=>{const c=priceOf(sel.client,l.pid);return c.sellable&&c.unit!==l.unit;});
  return pageHead('','주문 시점 단가와 현재 단가를 나란히 보여 줍니다.')+
    '<div class="tw rl rl-kv"><table class="t"><thead><tr><th>주문번호</th><th>상태</th><th>거래처</th><th>주문일</th><th>품목</th><th class="r">합계(원, VAT 포함)</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
    '<h2 class="sh">주문 상세 <span class="meta">'+sel.id+' / '+S.clients[sel.client].name+' / '+esc(sel.source)+'</span></h2>'+
    (changed?'<p class="note warn" style="margin:0 0 10px">'+ic('alert')+'주문 이후 단가가 바뀐 품목이 있습니다. 주문 금액은 주문 시점 단가로 유지됩니다.</p>':'')+
    orderLinesTable(sel,true)+
    (sel.status==='입금 대기'?'<div class="acts">'+btn({cls:'pri',icon:'wallet',label:'입금 확인',attrs:'data-paid="'+sel.id+'"'})+'</div>':'');
}

/* ===== admin: preview ===== */
function viewPreview(){
  const pids=Object.keys(S.products);
  const f=(cid,pid)=>{const r=priceOf(cid,pid);return r.sellable?'<span class="num">'+won(r.unit)+'</span>'+ruleSpan(r):st('판매 불가','bad');};
  const cmp='<div class="tw"><table class="t"><thead><tr><th>상품</th><th class="r">기본가(원)</th><th class="r">거래처 A</th><th class="r">거래처 B</th></tr></thead><tbody>'+
    pids.map(pid=>{const p=S.products[pid];return '<tr><td>'+esc(p.name)+'<div class="small">'+pid+'</div></td><td class="r num">'+won(p.base)+'</td><td class="r">'+f('A',pid)+'</td><td class="r">'+f('B',pid)+'</td></tr>';}).join('')+'</tbody></table></div>';
  const c=S.clients[UI.previewClient];
  const saved={cat:UI.cat,q:UI.q,onlySp:UI.onlySp}; UI.cat='전체';UI.q='';UI.onlySp=false;
  const {rows}=catalogRows(UI.previewClient,true);
  const tbl=catalogTable(UI.previewClient,true,rows);
  Object.assign(UI,saved);
  return pageHead('','같은 상품이 거래처마다 어떤 가격으로 보이는지 확인합니다.')+
    '<h2 class="sh">거래처별 가격 비교 <span class="meta">담당자 전용, 거래처 화면에는 자기 가격만 보입니다</span></h2>'+cmp+
    '<h2 class="sh">거래처 화면 미리보기</h2>'+
    '<div class="bar"><label for="pvSel" class="small">미리볼 거래처</label><select id="pvSel" class="f">'+['A','B'].map(k=>'<option value="'+k+'"'+(UI.previewClient===k?' selected':'')+'>'+S.clients[k].name+'</option>').join('')+'</select>'+
    '<span class="small">'+c.name+'로 로그인했을 때의 상품 목록입니다. 주문 기능은 꺼져 있습니다.</span></div>'+tbl+
    (c.blocked.length?'<p class="note">'+ic('eye')+c.name+'에는 판매 불가 상품 '+c.blocked.length+'개('+c.blocked.map(pid=>S.products[pid].name).join(', ')+')가 목록에서 빠져 있습니다.</p>':'');
}

/* ===== admin: verify ===== */
const SCEN=[
  {c:'A',pid:'P-101',q:10,expect:205000,desc:'전용 공급가 적용'},
  {c:'A',pid:'P-102',q:50,expect:82500,desc:'등급 할인 8%, 10원 미만 절사'},
  {c:'B',pid:'P-102',q:50,expect:87000,desc:'등급 할인 3%, 10원 미만 절사'},
  {c:'B',pid:'P-104',q:20,expect:276000,desc:'전용 공급가가 등급 할인보다 우선'},
  {c:'B',pid:'P-106',q:10,expect:'차단',desc:'판매 불가 상품'},
  {c:'B',pid:'P-104',q:5,expect:'차단',desc:'최소 주문 수량 미달'},
  {c:'A',pid:'P-105',q:22,expect:'차단',desc:'주문 단위 불일치'},
  {c:'A',pid:'P-101',q:10,expect:'205000 유지',desc:'주문 후 전용가 21,000으로 변경',after:true}
];
function runScenarios(){
  return SCEN.map(s=>{
    const d=clone(SEED);
    const err=serverValidate(s.c,[{pid:s.pid,qty:s.q}],d);
    let actual;
    if(err) actual='차단';
    else{
      const pr=priceOf(s.c,s.pid,d); const snap={unit:pr.unit,qty:s.q};
      if(s.after){ d.clients[s.c].special[s.pid]=21000; const now=priceOf(s.c,s.pid,d).unit; actual=(snap.unit*snap.qty===205000&&now===21000)?'205000 유지':String(snap.unit*snap.qty); }
      else actual=pr.unit*s.q;
    }
    return {s,actual,err,pass:String(actual)===String(s.expect)};
  });
}
function viewVerify(){
  const res=UI.verify;
  const fmt=(v)=>typeof v==='number'?won(v):esc(v);
  const rows=SCEN.map((s,i)=>{const r=res&&res[i];const p=SEED.products[s.pid];
    return '<tr><td class="r num">'+(i+1)+'</td><td>'+esc(s.desc)+(r&&r.err?'<div class="small">'+esc(r.err)+'</div>':'')+'</td><td>'+SEED.clients[s.c].name+'</td><td>'+esc(p.name)+'</td><td class="r num">'+s.q+'</td><td class="r num">'+fmt(s.expect)+'</td>'+
      '<td class="r num">'+(r?fmt(r.actual):'-')+'</td><td>'+(r?(r.pass?st('통과','ok'):st('실패','bad')):st('대기','mute'))+'</td></tr>';}).join('');
  const passN=res?res.filter(r=>r.pass).length:0;
  return pageHead(btn({cls:'pri',icon:'play',label:'기준 데이터로 전체 실행',attrs:'data-act="runVerify"'}),'가격 규칙 정의서의 각 경우를 주문 화면과 같은 계산 함수로 실행합니다. 규칙을 바꿀 때마다 전부 통과해야 배포합니다.')+
    '<div class="chain" aria-label="가격 결정 순서 (예시)"><span class="small">가격 결정 순서</span><span class="s">판매 가능 여부</span><span class="ar">&rarr;</span><span class="s">거래처 전용 공급가</span><span class="ar">&rarr;</span><span class="s">등급 할인율</span><span class="ar">&rarr;</span><span class="s">기본가</span><span class="ar">&rarr;</span><span class="s">최소 수량, 주문 단위 검증</span></div>'+
    (res?'<p class="note '+(passN===SCEN.length?'ok':'bad')+'" style="margin:0 0 10px" id="verifySummary">'+ic(passN===SCEN.length?'check':'alert')+SCEN.length+'개 경우 중 '+passN+'개 통과</p>':'')+
    '<div class="tw"><table class="t" id="verifyTable"><thead><tr><th class="r">No</th><th>경우</th><th>거래처</th><th>상품</th><th class="r">수량</th><th class="r">기대 결과</th><th class="r">실제 결과</th><th>판정</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
    '<p class="note">'+ic('alert')+'우선순위(전용 공급가와 등급 할인 중 무엇이 먼저인지), 절사 단위, 수량 구간별 단가 여부는 예시입니다. 실제 규칙은 기획 단계에서 확정하고 이 표도 그 규칙으로 다시 씁니다.</p>';
}

/* ===== guide ===== */
const GUIDE=[
  {k:'g1',t:'거래처별 가격 비교',d:'같은 상품이 거래처 A, B에 다른 가격으로 보입니다.'},
  {k:'g2',t:'최소 주문 수량 차단',d:'수량이 맞지 않으면 주문 확정이 막히고, 우회해도 서버가 거절합니다.'},
  {k:'g3',t:'견적에서 주문으로',d:'견적서 단가가 그대로 주문 금액이 됩니다.'},
  {k:'g4',t:'단가 변경과 기존 주문',d:'단가를 바꿔도 이미 들어온 주문 금액은 그대로입니다.'},
  {k:'g5',t:'가격 규칙 자동 검증',d:'8개 경우를 같은 계산 함수로 실행합니다.'}
];
function renderGuide(){
  const g=$('guide');
  if(!UI.role){g.hidden=true;document.body.classList.remove('guide-open');return;}
  g.hidden=false;
  if(UI.guideOpen===null) UI.guideOpen=window.matchMedia('(min-width:1101px)').matches;
  g.className='guide'+(UI.guideOpen?'':' closed');
  document.body.classList.toggle('guide-open',!!UI.guideOpen);
  g.innerHTML='<button type="button" class="gh" data-act="toggleGuide" aria-expanded="'+UI.guideOpen+'" aria-controls="guideList"><span>시연 안내</span>'+ic(UI.guideOpen?'down':'up')+'</button>'+
    '<ol id="guideList">'+GUIDE.map((s,i)=>'<li><button type="button" data-guide="'+s.k+'"'+(UI.guideStep===s.k?' aria-current="step"':'')+'><b><span class="n">'+(i+1)+'.</span>'+s.t+'</b>'+(UI.guideStep===s.k?'<span class="d">'+s.d+'</span>':'')+'</button></li>').join('')+'</ol>';
}

/* ===== render ===== */
const VIEWS={catalog:viewCatalog,cart:viewCart,quotes:viewQuotes,orders:viewOrders,home:viewHome,aquotes:viewAdminQuotes,aorders:viewAdminOrders,prices:viewPrices,preview:viewPreview,verify:viewVerify};
function render(){
  if(!UI.role){renderLogin();renderGuide();return;}
  renderShell();
  $('main').innerHTML=VIEWS[UI.view]();
  if(UI.view==='cart'&&cartLines().length) refreshCart();
  if(UI.view==='aquotes'&&UI.id) refreshQuoteEdit();
  renderGuide();
}

/* ===== actions ===== */
function placeOrder(clientId,lines,source,cb){
  withLoading('주문 확정 중...',()=>{
    const err=serverValidate(clientId,lines);
    if(err){toast('서버 검증에서 막혔습니다. '+err,'bad');return;}
    const id='O-'+(seq.order++);
    S.orders.push({id,client:clientId,date:TODAY,source,status:'입금 대기',
      lines:lines.map(l=>{const pr=l.unit!=null?{unit:l.unit,rule:l.rule}:priceOf(clientId,l.pid);return {pid:l.pid,qty:Number(l.qty),unit:pr.unit,rule:pr.rule};})});
    if(cb) cb(id);
    toast('주문 '+id+'이 접수되었습니다. 주문 시점 단가로 금액이 고정되었습니다.');
    go(clientId,'orders',id);
  });
}
function requestQuote(clientId,lines,memo){
  withLoading('견적 요청 중...',()=>{
    const id='Q-'+(seq.quote++);
    S.quotes.push({id,client:clientId,status:'요청',requested:TODAY,issued:'',validUntil:'',memo:memo||'',lines:lines.map(l=>({pid:l.pid,qty:Number(l.qty),unit:null,note:''}))});
    toast('견적 '+id+'을 요청했습니다. 관리자 화면의 견적 처리에서 이어서 볼 수 있습니다.');
    go(clientId,'quotes',id);
  });
}
function guide(k){
  UI.guideStep=k;
  if(window.matchMedia('(max-width:1100px)').matches) UI.guideOpen=false;
  if(k==='g1'){UI.previewClient='B';go('admin','preview');}
  if(k==='g2'){S.carts.B={'P-104':5,'P-102':50};go('B','cart');toast('거래처 B 장바구니에 최소 수량보다 적은 품목을 담아 두었습니다.');}
  if(k==='g3'){go('A','quotes','Q-3107');}
  if(k==='g4'){UI.savedNote=false;go('admin','prices');}
  if(k==='g5'){go('admin','verify');withLoading('가격 규칙 검증 중...',()=>{UI.verify=runScenarios();render();});}
}

document.addEventListener('click',(e)=>{
  const t=e.target.closest('button'); if(!t) return;
  const d=t.dataset;
  if(d.login){go(d.login);return;}
  if(d.guide){guide(d.guide);return;}
  if(d.go){go(UI.role,d.go);return;}
  if(d.cat){UI.cat=d.cat;render();return;}
  if(d.openQ){go(UI.role,'quotes',d.openQ);return;}
  if(d.openO){go(UI.role,'orders',d.openO);return;}
  if(d.aq){go('admin','aquotes',d.aq);return;}
  if(d.ao){go('admin','aorders',d.ao);return;}
  if(d.add){
    const p=S.products[d.add], inp=$('dq-'+d.add), q=Number(inp.value), err=checkQty(p,q), eb=$('de-'+d.add);
    if(err){eb.textContent=err;inp.classList.add('invalid');inp.focus();return;}
    eb.textContent='';inp.classList.remove('invalid');
    const cart=S.carts[UI.role]; cart[d.add]=(cart[d.add]||0)+q;
    toast(p.name+' '+q+p.uom+'을 장바구니에 담았습니다.'); render(); return;
  }
  if(d.del){const p=S.products[d.del];delete S.carts[UI.role][d.del];toast(p.name+'을 장바구니에서 뺐습니다.');render();return;}
  if(d.convert){const q=S.quotes.find(x=>x.id===d.convert);
    placeOrder(q.client,q.lines.map(l=>({pid:l.pid,qty:l.qty,unit:l.unit,rule:'견적 '+q.id+' 단가'})),'견적 '+q.id+' 전환',(oid)=>{q.status='주문 전환';q.orderId=oid;});return;}
  if(d.requote){const q=S.quotes.find(x=>x.id===d.requote);requestQuote(q.client,q.lines,q.id+' 재견적');return;}
  if(d.reorder){const o=S.orders.find(x=>x.id===d.reorder);const cart=S.carts[o.client];
    o.lines.forEach(l=>{if(priceOf(o.client,l.pid).sellable) cart[l.pid]=l.qty;});toast('지난 주문 품목을 담았습니다. 단가는 오늘 기준으로 다시 계산됩니다.');go(o.client,'cart');return;}
  if(d.issue){const q=S.quotes.find(x=>x.id===d.issue);
    const vu=$('vu').value;
    if(vu&&vu<TODAY){toast('유효기간은 오늘 이후로 정해 주세요.','bad');$('vu').focus();return;}
    const units=q.lines.map((l,i)=>Math.max(0,Number($('qd-'+i).value)||0));
    if(units.some(u=>u<=0)){toast('견적 단가가 0원인 품목이 있습니다.','bad');return;}
    withLoading('견적서 발행 중...',()=>{q.lines.forEach((l,i)=>{l.unit=units[i];});q.status='발행';q.issued=TODAY;q.validUntil=vu||addDays(14);
      toast('견적 '+q.id+'을 발행했습니다. '+S.clients[q.client].name+' 견적 화면에서 주문으로 전환할 수 있습니다.');go('admin','aquotes',q.id);});return;}
  if(d.paid){const o=S.orders.find(x=>x.id===d.paid);withLoading('입금 확인 처리 중...',()=>{o.status='출고 준비';toast(o.id+' 입금을 확인했습니다. 출고 준비로 바뀌었습니다.');render();});return;}
  if(t.id==='orderBtn'){const lines=cartLines();placeOrder(UI.role,lines,'장바구니',()=>{S.carts[UI.role]={};});return;}
  if(t.id==='bypassBtn'){const lines=cartLines();
    withLoading('주문 요청 전송 중...',()=>{const err=serverValidate(UI.role,lines);
      if(err) toast('서버가 주문을 거절했습니다. '+err,'bad'); else toast('모든 품목이 서버 검증을 통과했습니다. 주문 확정을 누르면 접수됩니다.');});return;}
  if(t.id==='cartQuoteBtn'){const lines=cartLines();const cid=UI.role;S.carts[cid]={};requestQuote(cid,lines,'장바구니에서 요청');return;}
  if(t.id==='logoutBtn'){go('');return;}
  switch(d.act){
    case 'toggleGuide': UI.guideOpen=!UI.guideOpen; renderGuide(); return;
    case 'clearFilter': UI.cat='전체';UI.q='';UI.onlySp=false;render();return;
    case 'addAll':{
      const picks=[]; let bad=0;
      document.querySelectorAll('[data-draft]').forEach(inp=>{const pid=inp.dataset.draft, p=S.products[pid], q=Number(inp.value);
        if(!q) return; const err=checkQty(p,q);
        if(err){bad++;$('de-'+pid).textContent=err;inp.classList.add('invalid');return;}
        picks.push([pid,q]);});
      if(bad){toast('수량을 고쳐야 하는 품목이 '+bad+'개 있어 담지 않았습니다.','bad');return;}
      if(!picks.length){toast('수량을 입력한 품목이 없습니다.','bad');return;}
      withLoading('장바구니에 담는 중...',()=>{const cart=S.carts[UI.role];picks.forEach(([pid,q])=>{cart[pid]=(cart[pid]||0)+q;});toast(picks.length+'개 품목을 장바구니에 담았습니다.');go(UI.role,'cart');});return;}
    case 'print': window.print(); return;
    case 'savePrices':
      withLoading('단가 저장 중...',()=>{
        document.querySelectorAll('[data-base]').forEach(i=>{const v=Number(i.value);if(v>0)S.products[i.dataset.base].base=v;});
        document.querySelectorAll('[data-special]').forEach(i=>{const [cid,pid]=i.dataset.special.split('|');const v=i.value.trim();if(v==='')delete S.clients[cid].special[pid];else if(Number(v)>0)S.clients[cid].special[pid]=Number(v);});
        UI.savedNote=true; toast('단가를 저장했습니다. 기존 주문 금액은 바뀌지 않습니다.');render();});return;
    case 'reset': withLoading('예시 데이터 복원 중...',()=>{S=clone(SEED);seq={order:24093,quote:3113};UI.verify=null;UI.upload=null;UI.savedNote=false;toast('예시 데이터로 되돌렸습니다.');render();});return;
    case 'tmpl': toast('시연에서는 양식 파일을 내려받지 않습니다. 품번, 거래처, 전용 공급가 3열 양식입니다.'); return;
    case 'upload': withLoading('엑셀 파일 검사 중...',()=>{UI.upload=[
        {row:2,pid:'P-101',client:'거래처 A',price:'20,500',err:''},
        {row:3,pid:'P-103',client:'거래처 A',price:'52,000',err:''},
        {row:4,pid:'P-104',client:'거래처 B',price:'13,800',err:''},
        {row:5,pid:'P-102',client:'거래처 B',price:'1,700',err:''},
        {row:6,pid:'P-199',client:'거래처 A',price:'8,000',err:'없는 품번'},
        {row:7,pid:'P-105',client:'거래처 B',price:'9천원',err:'단가가 숫자가 아님'},
        {row:8,pid:'P-106',client:'거래처 B',price:'11,500',err:'판매 불가 상품'}];
      toast('7행을 검사했습니다. 오류 3행은 반영하지 않습니다.');render();}); return;
    case 'closeUpload': UI.upload=null; render(); return;
    case 'applyUpload': withLoading('정상 행 반영 중...',()=>{UI.upload.filter(r=>!r.err).forEach(r=>{const cid=r.client==='거래처 A'?'A':'B';S.clients[cid].special[r.pid]=Number(r.price.replace(/,/g,''));});UI.upload=null;UI.savedNote=true;toast('정상 4행을 반영했습니다. 오류 행은 제외했습니다.');render();}); return;
    case 'runVerify': withLoading('가격 규칙 검증 중...',()=>{UI.verify=runScenarios();const n=UI.verify.filter(r=>r.pass).length;toast(SCEN.length+'개 경우 중 '+n+'개 통과');render();}); return;
  }
});
document.addEventListener('input',(e)=>{
  const i=e.target; if(!i.dataset) return;
  if(i.dataset.qty){S.carts[UI.role][i.dataset.qty]=i.value===''?0:Number(i.value);refreshCart();return;}
  if(i.dataset.draft){UI.draft[UI.role][i.dataset.draft]=i.value===''?'':Number(i.value);const eb=$('de-'+i.dataset.draft);if(eb){eb.textContent='';i.classList.remove('invalid');}return;}
  if(i.dataset.qline!=null){refreshQuoteEdit();return;}
  if(i.id==='qs'){UI.q=i.value;clearTimeout(route.qt);route.qt=setTimeout(()=>{render();const n=$('qs');if(n){n.focus();n.setSelectionRange(n.value.length,n.value.length);}},250);return;}
});
document.addEventListener('change',(e)=>{
  const i=e.target;
  if(i.id==='roleSel'){go(i.value);return;}
  if(i.id==='onlySp'){UI.onlySp=i.checked;render();return;}
  if(i.id==='pvSel'){UI.previewClient=i.value;render();return;}
});
window.addEventListener('hashchange',route);
route();
})();
