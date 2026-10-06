(function(){
"use strict";
const ic=(n)=>'<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-'+n+'"/></svg>';
const esc=(s)=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=(id)=>document.getElementById(id);
const clone=(o)=>JSON.parse(JSON.stringify(o));
const won=(n)=>Number(n).toLocaleString('ko-KR');

/* ===== 차종 기준 데이터 (예시. 실제로는 제공사 차량 마스터를 배치로 적재) ===== */
const CARS={
  '현대':{'그랜저':[{gen:'GN7',years:'2023~',trims:['2.5 가솔린','3.5 가솔린','1.6 하이브리드']},{gen:'IG',years:'2017~2022',trims:['2.4 가솔린','3.0 가솔린','2.4 하이브리드'],disc:true}],
          '쏘나타':[{gen:'DN8',years:'2020~',trims:['2.0 가솔린','1.6 터보','2.0 하이브리드']},{gen:'LF',years:'2015~2019',trims:['2.0 가솔린','1.6 터보'],disc:true}],
          '아반떼':[{gen:'CN7',years:'2021~',trims:['1.6 가솔린','1.6 하이브리드']}]},
  '기아':{'K5':[{gen:'DL3',years:'2020~',trims:['2.0 가솔린','1.6 터보','2.0 하이브리드']}],
          '쏘렌토':[{gen:'MQ4',years:'2021~',trims:['2.5 가솔린','1.6 하이브리드','2.2 디젤']}]}
};
function genOf(mk,model,gen){return ((CARS[mk]||{})[model]||[]).find(g=>g.gen===gen);}
const F=(mk,model,gen,trim)=>({mk,model,gen,trim:trim||null});
const SELLERS={A:{name:'판매자 A',area:'경기 여주',spec:'국산차 순정 신품'},B:{name:'판매자 B',area:'서울 성동',spec:'중고·재생 부품'},C:{name:'판매자 C',area:'인천 남동',spec:'소모품 전문'}};
const SEED={
  car:{mk:'현대',model:'그랜저',gen:'GN7',trim:'1.6 하이브리드'},
  parts:[
    {id:'P1',name:'앞 브레이크 패드 세트',cat:'제동',pn:'58101-L1A00',fits:[F('현대','그랜저','GN7'),F('기아','K5','DL3','2.0 가솔린')],
     offers:[{s:'A',cond:'신품',price:52000,stock:14,ship:3000,days:1,km:38,rating:4.8},{s:'C',cond:'신품',price:49500,stock:6,ship:3500,days:2,km:61,rating:4.6},{s:'B',cond:'재생',price:31000,stock:3,ship:4000,days:2,km:72,rating:4.3}]},
    {id:'P2',name:'에어컨 필터',cat:'소모품',pn:'97133-L1000',fits:[F('현대','그랜저','GN7'),F('현대','쏘나타','DN8'),F('기아','K5','DL3')],
     offers:[{s:'C',cond:'신품',price:9800,stock:40,ship:3000,days:1,km:61,rating:4.7},{s:'A',cond:'신품',price:10500,stock:22,ship:3000,days:1,km:38,rating:4.8}]},
    {id:'P3',name:'LED 헤드램프 (좌)',cat:'램프',pn:'92101-L1100',fits:[F('현대','그랜저','GN7','2.5 가솔린'),F('현대','그랜저','GN7','3.5 가솔린')],
     offers:[{s:'A',cond:'신품',price:418000,stock:2,ship:0,days:2,km:38,rating:4.8},{s:'B',cond:'중고',price:236000,stock:1,ship:6000,days:3,km:72,rating:4.3}]},
    {id:'P4',name:'순정 내비게이션 모니터',cat:'전장',pn:'96525-D2200',fits:[F('현대','쏘나타','LF'),F('현대','그랜저','IG')],
     offers:[{s:'B',cond:'중고',price:185000,stock:2,ship:5000,days:2,km:72,rating:4.3}]},
    {id:'P5',name:'와이퍼 블레이드 세트',cat:'소모품',pn:'98350-L1000',fits:[F('현대','그랜저','GN7'),F('현대','쏘나타','DN8'),F('현대','아반떼','CN7'),F('기아','K5','DL3')],
     offers:[{s:'C',cond:'신품',price:15900,stock:55,ship:0,days:1,km:61,rating:4.7},{s:'A',cond:'신품',price:17500,stock:30,ship:3000,days:1,km:38,rating:4.8}]},
    {id:'P6',name:'엔진오일 필터',cat:'소모품',pn:'26300-35505',fits:[F('현대','그랜저','IG'),F('현대','쏘나타','LF'),F('현대','쏘나타','DN8','2.0 가솔린'),F('현대','아반떼','CN7','1.6 가솔린')],
     offers:[{s:'C',cond:'신품',price:4500,stock:120,ship:3000,days:1,km:61,rating:4.7}]},
    {id:'P7',name:'하이브리드 배터리 쿨링 팬',cat:'전장',pn:'37590-L5000',fits:[F('현대','그랜저','GN7','1.6 하이브리드'),F('기아','K5','DL3','2.0 하이브리드')],
     offers:[{s:'A',cond:'신품',price:143000,stock:4,ship:0,days:2,km:38,rating:4.8},{s:'B',cond:'재생',price:79000,stock:1,ship:5000,days:3,km:72,rating:4.3}]}
  ],
  cart:[],
  orders:[{id:'O-26100601',at:'10-06 09:12',lines:[{p:'P2',s:'A',qty:2,price:10500}],ship:{A:3000},st:{A:'결제 완료'},inv:{}}],
  apps:[
    {id:'S-D',name:'판매자 D',area:'부산 사상',spec:'수입차 중고 부품',docs:{'사업자등록증':true,'통신판매업 신고':false,'정산 계좌':true},st:'심사 대기'},
    {id:'S-E',name:'판매자 E',area:'대구 북구',spec:'정비소 겸 순정 부품 판매',docs:{'사업자등록증':true,'통신판매업 신고':true,'정산 계좌':true},st:'심사 대기'}
  ],
  discPolicy:'keep',
  upload:null
};
let S=clone(SEED);
let seq={order:26100602,part:8};

/* ===== 적합 판정: 이 함수 한 곳에서만 ===== */
function fitOf(part,car){
  car=car||S.car;
  if(!car||!car.gen) return {k:'none',l:'차량 미등록'};
  const rows=part.fits.filter(f=>f.mk===car.mk&&f.model===car.model&&f.gen===car.gen);
  if(!rows.length) return {k:'no',l:'내 차에 안 맞음'};
  if(rows.some(r=>!r.trim)||(car.trim&&rows.some(r=>r.trim===car.trim))) return {k:'ok',l:'내 차에 맞음'};
  if(!car.trim) return {k:'check',l:'트림 확인 필요'};
  return {k:'no',l:'트림이 달라 안 맞음'};
}
const allDisc=(p)=>p.fits.every(f=>{const g=genOf(f.mk,f.model,f.gen);return g&&g.disc;});
const anyDisc=(p)=>p.fits.some(f=>{const g=genOf(f.mk,f.model,f.gen);return g&&g.disc;});
const normPn=(s)=>String(s).replace(/[\s-]/g,'').toUpperCase();
function lowest(p){const o=p.offers.filter(x=>x.stock>0);return o.length?Math.min.apply(null,o.map(x=>x.price)):null;}

/* ===== state ===== */
const UI={role:'c',view:'search',id:null,q:'',onlyFit:true,sort:'price',guideOpen:null,guideStep:null,showNo:false};
const NAV={c:[['car','내 차','car'],['search','부품 검색','search'],['cart','장바구니','cart'],['orders','주문 내역','list']],
  s:[['upload','상품 대량 등록','upload'],['sorders','주문 처리','truck']],
  a:[['sellers','판매자 심사','shield'],['master','차종 기준 데이터','db']]};
function go(role,view,id){const h='#/'+role+'/'+view+(id?'/'+id:''); if(location.hash===h) route(); else location.hash=h;}
function route(){
  const p=location.hash.replace(/^#\/?/,'').split('/');
  UI.role=NAV[p[0]]?p[0]:'c';
  const list=NAV[UI.role].map(v=>v[0]).concat(UI.role==='c'?['part']:[]);
  UI.view=list.indexOf(p[1])>=0?p[1]:NAV[UI.role][UI.role==='c'?1:0][0]; UI.id=p[2]||null;
  if(Date.now()-(toast.at||0)>300) $('toastHost').innerHTML='';
  render(); window.scrollTo(0,0);
}
function toast(msg,kind){toast.at=Date.now();const h=$('toastHost');h.innerHTML='<div class="toast'+(kind==='bad'?' bad':'')+'" role="status">'+ic(kind==='bad'?'alert':'check')+'<span>'+esc(msg)+'</span></div>';clearTimeout(toast.t);toast.t=setTimeout(()=>{h.innerHTML='';},3200);}
let busy=false;
function withLoading(msg,fn,ms){if(busy)return;busy=true;$('overlayHost').innerHTML='<div class="overlay" role="status" aria-live="assertive"><div class="ob"><span class="spin" aria-hidden="true"></span><span>'+esc(msg)+'</span></div></div>';setTimeout(()=>{$('overlayHost').innerHTML='';busy=false;fn();},ms||480);}
const st=(t,k)=>'<span class="st '+k+'">'+esc(t)+'</span>';
const fitSt=(f)=>st(f.l,{ok:'ok',check:'warn',no:'bad',none:'mute'}[f.k]);
const empty=(i,t,d,b)=>'<div class="empty">'+ic(i)+'<strong>'+esc(t)+'</strong><p>'+esc(d)+'</p>'+(b||'')+'</div>';
const btn=(o)=>'<button type="button" class="btn '+(o.cls||'')+'" '+(o.attrs||'')+'>'+(o.icon?ic(o.icon):'')+esc(o.label)+'</button>';
const head=(t,sub,extra)=>'<div class="ph"><div><h1>'+t+'</h1>'+(sub?'<div class="sub">'+sub+'</div>':'')+'</div>'+(extra?'<div class="ph-actions">'+extra+'</div>':'')+'</div>';
const carLabel=(c)=>c&&c.gen?c.mk+' '+c.model+' '+c.gen+(c.trim?' '+c.trim:''):'등록된 차량 없음';

/* ===== 소비자: 내 차 ===== */
function viewCar(){
  const c=S.car||{}; const models=c.mk?Object.keys(CARS[c.mk]):[]; const gens=c.mk&&c.model?CARS[c.mk][c.model]:[]; const g=gens.find(x=>x.gen===c.gen);
  const sel=(id,lab,opts,val,ph)=>'<div><label for="'+id+'">'+lab+'</label><select id="'+id+'" class="f" data-car="'+id+'"><option value="">'+ph+'</option>'+opts.map(o=>'<option value="'+esc(o[0])+'"'+(o[0]===val?' selected':'')+'>'+esc(o[1])+'</option>').join('')+'</select></div>';
  return head('내 차 등록','제조사, 모델, 세대를 고르면 검색 결과마다 내 차에 맞는지 표시됩니다. 트림은 몰라도 되지만, 고르면 판정이 더 정확해집니다.')+
    '<div class="box"><div class="carsel">'+
      sel('c-mk','제조사',Object.keys(CARS).map(k=>[k,k]),c.mk,'선택')+
      sel('c-model','모델',models.map(k=>[k,k]),c.model,c.mk?'선택':'제조사 먼저')+
      sel('c-gen','세대 (연식)',gens.map(x=>[x.gen,x.gen+' ('+x.years+')'+(x.disc?' 단종':'')]),c.gen,c.model?'선택':'모델 먼저')+
      sel('c-trim','트림 (선택)',(g?g.trims:[]).map(t=>[t,t]),c.trim,'모름')+
    '</div></div>'+
    '<h2 class="sh">등록된 차량</h2><div class="carcard"><div>'+ic('car')+' <b>'+esc(carLabel(c))+'</b>'+(g&&g.disc?' '+st('단종 차종','warn'):'')+'</div>'+btn({cls:'pri',icon:'search',label:'이 차 기준으로 부품 찾기',attrs:'data-go2="search"'+(c.gen?'':' disabled')})+'</div>'+
    '<p class="note">'+ic('db')+'차종 목록은 제공사 차량 기준 데이터를 매일 받아 갱신하는 것을 전제로 한 예시입니다. 부품은 상품에 직접 붙이지 않고 별도의 적용 차종 표로 연결해, 차종이 갱신돼도 상품 데이터를 고치지 않습니다.</p>';
}

/* ===== 소비자: 검색 ===== */
function searchParts(){
  const q=UI.q.trim(), nq=normPn(q);
  return S.parts.filter(p=>{
    if(S.discPolicy==='hide'&&allDisc(p)) return false;
    if(!q) return true;
    if(p.name.indexOf(q)>=0||p.cat.indexOf(q)>=0) return true;
    if(nq.length>=4&&normPn(p.pn).indexOf(nq)>=0) return true;
    return p.fits.some(f=>(f.model+' '+f.gen).indexOf(q)>=0||f.model===q);
  });
}
function viewSearch(){
  const all=searchParts().map(p=>({p,f:fitOf(p)}));
  const shown=UI.onlyFit&&S.car&&S.car.gen?all.filter(x=>x.f.k!=='no'):all;
  const hidden=all.length-shown.length;
  const ord={ok:0,check:1,none:2,no:3};
  shown.sort((a,b)=>ord[a.f.k]-ord[b.f.k]);
  const rows=shown.map(({p,f})=>{const lo=lowest(p);const conds=[...new Set(p.offers.map(o=>o.cond))];
    return '<tr><td class="hide-m" style="width:56px"><span class="thumb" aria-hidden="true">'+ic('box')+'</span></td><td class="pcell full"><b>'+esc(p.name)+'</b><span class="pn">'+p.pn+'</span><span class="small">'+p.cat+' / 적용 '+p.fits.length+'개 차종'+(anyDisc(p)?' / 단종 차종용 포함':'')+'</span></td>'+
      '<td class="stc">'+fitSt(f)+'</td><td data-k="판매처" class="num">'+p.offers.length+'곳</td><td data-k="상태">'+conds.map(c=>'<span class="small" style="display:inline">'+c+'</span>').join(', ')+'</td><td data-k="최저가" class="r num"><b>'+(lo!=null?won(lo)+'원':'품절')+'</b></td>'+
      '<td class="r full">'+btn({cls:'sm',icon:'right',label:'판매자별 비교',attrs:'data-part="'+p.id+'"'})+'</td></tr>';}).join('');
  return head('부품 검색','차종, 부품명, 품번을 한 칸에서 찾습니다. 결과마다 등록한 차에 맞는지 판정해 보여 줍니다.')+
    '<div class="sbox"><div class="search">'+ic('search')+'<label class="sr" for="q">검색어</label><input id="q" class="f" type="search" placeholder="예: 브레이크 패드, 96525-D2200, 쏘나타 LF" value="'+esc(UI.q)+'"></div>'+btn({cls:'pri',label:'검색',attrs:'data-act="search"'})+'</div>'+
    '<p class="hint">예시 검색어 <button type="button" data-ex="브레이크">브레이크</button> <button type="button" data-ex="96525D2200">96525D2200 (하이픈 없이)</button> <button type="button" data-ex="쏘나타 LF">쏘나타 LF</button> <button type="button" data-ex="헤드램프">헤드램프</button></p>'+
    '<div class="bar" style="margin-top:12px"><span class="small">'+ic('car')+' 기준 차량: <b>'+esc(carLabel(S.car))+'</b></span><button type="button" class="btn link" data-go2="car">바꾸기</button><span class="grow"></span>'+
    '<label class="chk"><input type="checkbox" id="onlyFit"'+(UI.onlyFit?' checked':'')+'>내 차에 맞는 것만</label><span class="small">'+shown.length+'개'+(hidden?' (안 맞는 '+hidden+'개 숨김)':'')+'</span></div>'+
    (shown.length?'<div class="tw rl rl-kv"><table class="t"><thead><tr><th><span class="sr">사진</span></th><th>부품</th><th>적합 판정</th><th>판매처</th><th>상태</th><th class="r">가격</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>'
      :empty('search','찾는 부품이 없습니다',hidden?'내 차에 맞는 결과가 없습니다. 내 차에 맞는 것만을 끄면 다른 차종용 결과도 볼 수 있습니다.':'검색어를 바꾸거나 품번을 하이픈 없이 넣어 보세요.',hidden?'<button type="button" class="btn" data-act="showAll">안 맞는 것도 보기</button>':''))+
    '<p class="note">'+ic('alert')+'품번은 하이픈과 띄어쓰기를 지우고 비교합니다. 부품찾기 요청과 검색어 기록은 1차부터 저장해 두어 나중에 수요 분석에 씁니다.</p>';
}

/* ===== 소비자: 판매자별 비교 + 상세 ===== */
function viewPart(){
  const p=S.parts.find(x=>x.id===UI.id); if(!p) return empty('box','부품을 찾을 수 없습니다','검색 화면에서 다시 골라 주세요.','<button type="button" class="btn" data-go2="search">검색으로</button>');
  const f=fitOf(p); const lo=lowest(p);
  const sorters={price:(a,b)=>(a.price+a.ship)-(b.price+b.ship),km:(a,b)=>a.km-b.km,days:(a,b)=>a.days-b.days};
  const offers=p.offers.map((o,i)=>({o,i})).sort((a,b)=>sorters[UI.sort](a.o,b.o));
  const fitRows=p.fits.map(r=>{const g=genOf(r.mk,r.model,r.gen);const mine=S.car&&r.mk===S.car.mk&&r.model===S.car.model&&r.gen===S.car.gen;
    return '<tr'+(mine?' class="sel"':'')+'><td>'+r.mk+'</td><td>'+r.model+'</td><td>'+r.gen+'</td><td class="num">'+(g?g.years:'')+'</td><td>'+(r.trim||'전 트림')+'</td><td>'+(g&&g.disc?st('단종','warn'):'')+'</td></tr>';}).join('');
  return '<div class="bar"><button type="button" class="btn" data-go2="search">'+ic('left')+'검색 결과</button></div>'+
    '<div class="pdhead"><span class="big" aria-hidden="true">'+ic('box')+'</span><div><h1>'+esc(p.name)+'</h1><div class="pn">'+p.pn+'</div><div class="small" style="margin:4px 0 8px">'+p.cat+'</div>'+fitSt(f)+' <span class="small">'+esc(carLabel(S.car))+' 기준</span></div>'+
      '<div class="lowest"><div class="small">판매처 '+p.offers.length+'곳 최저가</div><div class="v">'+(lo!=null?won(lo)+'원':'품절')+'</div></div></div>'+
    (f.k==='no'?'<p class="note bad">'+ic('alert')+'등록한 차에는 맞지 않는 부품입니다. 아래 적용 차종을 확인해 주세요.</p>':f.k==='check'?'<p class="note warn">'+ic('alert')+'같은 세대라도 트림에 따라 다릅니다. 내 차의 트림을 고르면 맞는지 바로 알려 드립니다.</p>':'')+
    '<h2 class="sh">판매자별 비교 <span class="meta">같은 품번을 파는 판매자를 한 표에서 봅니다</span></h2>'+
    '<div class="bar"><label for="sort" class="small">정렬</label><select id="sort" class="f"><option value="price"'+(UI.sort==='price'?' selected':'')+'>배송비 포함 가격순</option><option value="days"'+(UI.sort==='days'?' selected':'')+'>도착 빠른순</option><option value="km"'+(UI.sort==='km'?' selected':'')+'>가까운순 (장착 방문)</option></select></div>'+
    '<div class="tw rl rl-kv"><table class="t"><thead><tr><th>판매자</th><th>상태</th><th class="r">가격</th><th class="r">배송비</th><th class="r">재고</th><th>도착</th><th class="r">거리</th><th class="r">후기</th><th></th></tr></thead><tbody>'+
    offers.map(({o,i})=>{const s=SELLERS[o.s];return '<tr><td class="full"><b>'+s.name+'</b><div class="small">'+s.area+' / '+s.spec+'</div></td><td class="stc">'+st(o.cond,o.cond==='신품'?'info':'mute')+'</td><td data-k="가격" class="r num"><b>'+won(o.price)+'</b></td><td data-k="배송비" class="r num">'+(o.ship?won(o.ship):'무료')+'</td><td data-k="재고" class="r num">'+(o.stock?o.stock:st('품절','bad'))+'</td><td data-k="도착">'+(o.days===1?'내일':o.days+'일 뒤')+'</td><td data-k="거리" class="r num">'+o.km+'km</td><td data-k="후기" class="r num">'+o.rating.toFixed(1)+'</td>'+
      '<td class="r full">'+btn({cls:'sm pri',icon:'cart',label:'담기',attrs:'data-add="'+p.id+'|'+i+'"'+(o.stock?'':' disabled')})+'</td></tr>';}).join('')+'</tbody></table></div>'+
    '<div class="two" style="margin-top:4px"><div><h2 class="sh">적용 차종 <span class="meta">상품과 분리된 적용 차종 표</span></h2><div class="tw"><table class="t"><thead><tr><th>제조사</th><th>모델</th><th>세대</th><th>연식</th><th>트림</th><th></th></tr></thead><tbody>'+fitRows+'</tbody></table></div></div>'+
    '<div><h2 class="sh">보증·반품</h2><div class="box"><p style="margin:0 0 6px">신품: 장착 전 미개봉 7일 이내 반품. 중고·재생: 판매자별 보증 기간 표시 (예시)</p><p class="small" style="margin:0">적합 판정과 다른 부품이 배송되면 판매자 부담으로 반품합니다.</p></div></div></div>';
}

/* ===== 소비자: 장바구니, 주문 ===== */
function viewCart(){
  if(!S.cart.length) return head('장바구니')+empty('cart','장바구니가 비어 있습니다','판매자별 비교 화면에서 원하는 판매자의 상품을 담아 주세요.','<button type="button" class="btn pri" data-go2="search">부품 찾기</button>');
  const by={}; S.cart.forEach((l,i)=>{(by[l.s]=by[l.s]||[]).push({l,i});});
  let sum=0, shipSum=0;
  const grp=Object.keys(by).map(s=>{const lines=by[s];const ship=Math.max.apply(null,lines.map(x=>x.l.ship));shipSum+=ship;
    return '<div class="cart-grp"><h3><span>'+SELLERS[s].name+' <span class="small">'+SELLERS[s].area+'</span></span><span class="small">배송비 '+(ship?won(ship)+'원':'무료')+' (묶음)</span></h3><div class="tw" style="border:0"><table class="t"><tbody>'+
      lines.map(({l,i})=>{const p=S.parts.find(x=>x.id===l.p);sum+=l.price*l.qty;const f=fitOf(p);
        return '<tr><td><b>'+esc(p.name)+'</b><div class="pn">'+p.pn+'</div></td><td>'+fitSt(f)+'</td><td>'+l.cond+'</td><td class="r"><label class="sr" for="cq-'+i+'">수량</label><input class="f qty" id="cq-'+i+'" type="number" min="1" max="'+l.max+'" value="'+l.qty+'" data-cq="'+i+'"></td><td class="r num"><b>'+won(l.price*l.qty)+'</b></td><td class="r">'+btn({cls:'sm',icon:'x',label:'빼기',attrs:'data-rm="'+i+'"'})+'</td></tr>';}).join('')+'</tbody></table></div></div>';}).join('');
  const bad=S.cart.filter(l=>fitOf(S.parts.find(x=>x.id===l.p)).k==='no').length;
  return head('장바구니','여러 판매자의 상품을 한 번에 결제합니다. 배송비는 판매자별로 묶어 계산하고, 주문은 판매자별로 나뉘어 처리됩니다.')+grp+
    (bad?'<p class="note bad">'+ic('alert')+'내 차에 맞지 않는 부품이 '+bad+'개 있습니다. 결제 전에 확인해 주세요.</p>':'')+
    '<div class="sum"><div><span>상품 금액</span><span>'+won(sum)+'원</span></div><div><span>배송비 ('+Object.keys(by).length+'개 판매자)</span><span>'+won(shipSum)+'원</span></div><div><span>결제 금액</span><span>'+won(sum+shipSum)+'원</span></div></div>'+
    '<div class="acts">'+btn({cls:'pri',icon:'check',label:'주문하고 결제하기',attrs:'data-act="pay"'})+'</div>'+
    '<p class="note">'+ic('shield')+'결제는 PG사 화면에서 이루어지고, 승인 금액을 서버에서 다시 대조한 뒤 주문을 확정합니다. 시연에서는 승인 과정을 흉내 냅니다.</p>';
}
function orderTable(o,onlySeller){
  return '<div class="tw"><table class="t"><thead><tr><th>판매자</th><th>부품</th><th class="r">수량</th><th class="r">금액</th><th>상태</th><th>송장</th></tr></thead><tbody>'+
    o.lines.filter(l=>!onlySeller||l.s===onlySeller).map(l=>{const p=S.parts.find(x=>x.id===l.p);const stt=o.st[l.s];
      return '<tr><td>'+SELLERS[l.s].name+'</td><td>'+esc(p.name)+'<div class="pn">'+p.pn+'</div></td><td class="r num">'+l.qty+'</td><td class="r num">'+won(l.price*l.qty)+'</td><td>'+st(stt,stt==='배송 중'?'info':'warn')+'</td><td class="num">'+(o.inv[l.s]||'-')+'</td></tr>';}).join('')+'</tbody></table></div>';
}
function viewOrders(){
  if(!S.orders.length) return head('주문 내역')+empty('list','주문 내역이 없습니다','결제한 주문이 여기에 쌓입니다.');
  return head('주문 내역','한 번의 결제가 판매자별 주문으로 나뉘어 각각 배송됩니다.')+S.orders.slice().reverse().map(o=>'<h2 class="sh">'+o.id+' <span class="meta">'+o.at+'</span></h2>'+orderTable(o)).join('');
}

/* ===== 판매자 ===== */
const SAMPLE=[
  {row:2,name:'그랜저 GN7 에어컨필터 97133-L1000',price:'10200',stock:'30',cond:'신상품',model:'그랜저 GN7'},
  {row:3,name:'그랜져 IG 엔진오일필터 26300-35505',price:'4300',stock:'50',cond:'신상품',model:'그랜져IG'},
  {row:4,name:'K5 DL3 브레이크패드 앞',price:'38000',stock:'12',cond:'신상품',model:'K5'},
  {row:5,name:'쏘렌토 MQ4 와이퍼 세트',price:'15000',stock:'',cond:'신상품',model:'쏘렌토'},
  {row:6,name:'아반떼 CN7 와이퍼 98350-L1000',price:'12900',stock:'20',cond:'중고상품',model:'아반떼 CN7'}
];
/* 업로드 검사: 품번 추출, 차종 표준 계층 매칭(오타 교정 제안), 필수값 확인 */
function checkRow(r){
  const out={r,pid:null,fit:null,st:'정상',msg:[],needOk:false};
  if(!r.price||!r.stock){out.st='오류';out.msg.push((!r.stock?'재고수량':'판매가')+'이 비어 있습니다');return out;}
  const m=r.name.match(/\b(\d{5}-[A-Z0-9]{5})\b/);
  if(m){const p=S.parts.find(x=>normPn(x.pn)===normPn(m[1]));out.pid=p?p.id:null;out.msg.push('품번 '+m[1]+(p?' 기존 상품에 판매처로 추가':' 새 품번'));}
  else {out.st='확인 필요';out.needOk=true;out.msg.push('품번이 없어 차종과 부품명으로 등록합니다');}
  const txt=(r.model+' '+r.name).replace(/그랜져/g,'그랜저');
  if(txt!==r.model+' '+r.name){out.st='확인 필요';out.needOk=true;out.msg.push('모델명 그랜져를 그랜저로 맞춤');}
  let found=null; Object.keys(CARS).forEach(mk=>Object.keys(CARS[mk]).forEach(md=>{if(txt.indexOf(md)>=0){CARS[mk][md].forEach(g=>{if(txt.indexOf(g.gen)>=0) found={mk,model:md,gen:g.gen,disc:!!g.disc};}); if(!found&&txt.indexOf(md)>=0&&CARS[mk][md].length===1) found={mk,model:md,gen:CARS[mk][md][0].gen,guess:true};}}));
  if(found){out.fit=found; if(found.disc) out.msg.push('단종 차종 '+found.model+' '+found.gen+'으로 표시'); if(found.guess){out.st='확인 필요';out.needOk=true;out.msg.push('세대가 없어 '+found.model+' '+found.gen+'으로 제안');}}
  else {out.st='오류';out.msg.push('차종을 찾지 못했습니다');}
  return out;
}
function viewUpload(){
  const u=S.upload;
  const res=u?'<h2 class="sh">검사 결과 <span class="meta">'+esc(u.file)+'</span></h2>'+
    '<div class="bar">'+st('정상 '+u.rows.filter(x=>x.st==='정상').length,'ok')+st('확인 필요 '+u.rows.filter(x=>x.st==='확인 필요'&&!x.ok).length,'warn')+st('오류 '+u.rows.filter(x=>x.st==='오류').length,'bad')+'</div>'+
    '<div class="tw"><table class="t" style="min-width:1000px"><thead><tr><th class="r">행</th><th>상품명 (원본)</th><th class="r">판매가</th><th class="r">재고</th><th>상태</th><th>표준 차종 매칭</th><th>검사</th><th></th></tr></thead><tbody>'+
    u.rows.map((x,i)=>'<tr'+(x.st==='오류'?' class="row-bad"':'')+'><td class="r num">'+x.r.row+'</td><td class="excel">'+esc(x.r.name)+'</td><td class="r num">'+(x.r.price?won(x.r.price):'(비어 있음)')+'</td><td class="r num">'+esc(x.r.stock||'(비어 있음)')+'</td><td>'+x.r.cond+'</td>'+
      '<td>'+(x.fit?esc(x.fit.mk+' '+x.fit.model+' '+x.fit.gen)+(x.fit.disc?' '+st('단종','warn'):''):'-')+'</td><td>'+st(x.ok?'확인함':x.st,x.ok||x.st==='정상'?'ok':x.st==='오류'?'bad':'warn')+'<div class="small">'+esc(x.msg.join('. '))+'</div></td>'+
      '<td class="r">'+(x.needOk&&!x.ok&&x.st!=='오류'?btn({cls:'sm',icon:'check',label:'제안대로 확정',attrs:'data-okrow="'+i+'"'}):'')+'</td></tr>').join('')+'</tbody></table></div>'+
    '<div class="acts">'+btn({icon:'x',label:'취소',attrs:'data-act="upCancel"'})+btn({cls:'pri',icon:'upload',label:'등록 가능한 행 등록',attrs:'data-act="upSave"'})+'</div>':'';
  return head('상품 대량 등록','네이버 스마트스토어 일괄등록 엑셀 양식을 그대로 올리면, 품번과 차종을 읽어 표준 차종 계층에 맞춰 등록합니다.',btn({cls:'pri',icon:'upload',label:'엑셀 파일 선택 (예시 파일)',attrs:'data-act="upPick"'}))+
    (u?res:empty('upload','올릴 파일을 선택해 주세요','판매자마다 다르게 적는 모델명(예: 그랜져IG, K5)을 표준 차종으로 맞추고, 확인이 필요한 행만 따로 보여 드립니다.','<button type="button" class="btn pri" data-act="upPick">예시 파일로 해 보기</button>'))+
    '<p class="note">'+ic('alert')+'예시 파일 5행에는 정상, 오타, 품번 없음, 재고 누락, 중고 상품이 섞여 있습니다. 오류 행은 등록하지 않고 행 번호와 사유를 남깁니다.</p>';
}
function viewSOrders(){
  const mine=S.orders.filter(o=>o.lines.some(l=>l.s==='A'));
  if(!mine.length) return head('주문 처리')+empty('truck','들어온 주문이 없습니다','소비자가 결제하면 판매자 A 몫의 주문이 여기에 나타납니다.');
  return head('주문 처리','판매자 A에게 들어온 주문입니다. 발송 처리를 하면 재고가 이미 빠져 있고, 소비자 화면 상태가 함께 바뀝니다.')+
    mine.slice().reverse().map(o=>'<h2 class="sh">'+o.id+' <span class="meta">'+o.at+'</span></h2>'+orderTable(o,'A')+
      (o.st.A==='결제 완료'?'<div class="bar" style="margin-top:8px;justify-content:flex-end"><label for="inv-'+o.id+'" class="small">송장번호</label><input id="inv-'+o.id+'" class="f" style="width:180px" placeholder="예: 6120 4417 0381" value="6120 4417 0381">'+btn({cls:'pri',icon:'truck',label:'발송 처리',attrs:'data-ship="'+o.id+'"'})+'</div>':'')).join('');
}

/* ===== 관리자 ===== */
function viewSellers(){
  return head('판매자 심사','입점 신청을 서류 기준으로 확인한 뒤 승인한 판매자만 상품을 올릴 수 있습니다.')+
    '<div class="tw"><table class="t" style="min-width:760px"><thead><tr><th>신청자</th><th>취급 분야</th><th>제출 서류</th><th>상태</th><th></th></tr></thead><tbody>'+
    S.apps.map((a,i)=>{const miss=Object.keys(a.docs).filter(k=>!a.docs[k]);
      return '<tr><td><b>'+a.name+'</b><div class="small">'+a.area+'</div></td><td>'+a.spec+'</td><td>'+Object.keys(a.docs).map(k=>'<div class="small" style="color:'+(a.docs[k]?'var(--ok)':'var(--bad)')+'">'+(a.docs[k]?'제출':'없음')+' '+k+'</div>').join('')+'</td>'+
      '<td>'+st(a.st,a.st==='승인'?'ok':a.st==='반려'?'bad':'mute')+(a.reason?'<div class="small">'+esc(a.reason)+'</div>':'')+'</td>'+
      '<td class="r" style="white-space:nowrap">'+(a.st==='심사 대기'?btn({cls:'sm',label:'반려',attrs:'data-rej="'+i+'"'})+' '+btn({cls:'sm pri',icon:'check',label:'승인',attrs:'data-apv="'+i+'"'+(miss.length?' disabled title="필수 서류가 없습니다"':'')}):'')+'</td></tr>';}).join('')+'</tbody></table></div>'+
    '<p class="note">'+ic('shield')+'필수 서류가 빠진 신청은 승인 버튼이 잠기고, 반려하면 빠진 서류가 사유로 판매자에게 안내됩니다. 서류 항목은 예시입니다.</p>';
}
function viewMaster(){
  const disc=[];Object.keys(CARS).forEach(mk=>Object.keys(CARS[mk]).forEach(md=>CARS[mk][md].forEach(g=>{if(g.disc)disc.push(mk+' '+md+' '+g.gen);})));
  const linked=S.parts.filter(anyDisc), only=S.parts.filter(allDisc);
  return head('차종 기준 데이터','제공사 차량 기준 데이터를 매일 받아 바뀐 것만 반영합니다. 차가 단종되면 그 차에 붙은 부품을 어떻게 보일지 정합니다.')+
    '<h2 class="sh" style="margin-top:0">최근 반영 결과 <span class="meta">예시 배치</span></h2><div class="tw"><table class="t"><thead><tr><th>구분</th><th class="r">건수</th><th>내용</th></tr></thead><tbody>'+
    '<tr><td>신규</td><td class="r num">2</td><td>세부 트림 추가</td></tr><tr><td>변경</td><td class="r num">1</td><td>연식 표기 수정</td></tr><tr><td>단종</td><td class="r num">'+disc.length+'</td><td>'+disc.join(', ')+'</td></tr></tbody></table></div>'+
    '<h2 class="sh">단종 차종에 붙은 부품 <span class="meta">상품 '+linked.length+'개, 그중 단종 차종 전용 '+only.length+'개</span></h2>'+
    '<div class="box"><label class="chk"><input type="radio" name="dp" value="keep"'+(S.discPolicy==='keep'?' checked':'')+'>검색에 남기고 단종 차종용으로 표시 (권장)</label><br><label class="chk"><input type="radio" name="dp" value="hide"'+(S.discPolicy==='hide'?' checked':'')+'>단종 차종 전용 부품은 검색에서 숨김</label>'+
    '<div class="acts" style="justify-content:flex-start">'+btn({cls:'pri',icon:'check',label:'정책 저장',attrs:'data-act="dpSave"'})+'</div></div>'+
    '<div class="tw" style="margin-top:10px"><table class="t"><thead><tr><th>부품</th><th>적용 차종</th><th>검색 노출</th></tr></thead><tbody>'+
    linked.map(p=>'<tr><td>'+esc(p.name)+'<div class="pn">'+p.pn+'</div></td><td class="small">'+p.fits.map(f=>f.model+' '+f.gen+(genOf(f.mk,f.model,f.gen).disc?' (단종)':'')).join(', ')+'</td><td>'+(S.discPolicy==='hide'&&allDisc(p)?st('숨김','mute'):st('노출','ok'))+'</td></tr>').join('')+'</tbody></table></div>'+
    '<p class="note">'+ic('alert')+'단종차 부품은 오히려 구하기 어려워 찾는 사람이 있습니다. 그래서 지우지 않고 단종 차종용으로 표시해 남기는 쪽을 권합니다. 상품 데이터는 그대로 두고 적용 차종 표의 표시만 바뀝니다.</p>';
}

/* ===== guide ===== */
const GUIDE=[
  {t:'내 차 등록',d:'제조사, 모델, 세대, 트림을 고릅니다.',run:()=>go('c','car')},
  {t:'통합 검색과 적합 판정',d:'결과마다 내 차에 맞는지 표시합니다.',run:()=>{UI.q='브레이크';go('c','search');}},
  {t:'판매자별 비교',d:'같은 품번의 판매자를 가격, 도착, 거리로 비교합니다.',run:()=>go('c','part','P1')},
  {t:'여러 판매자 한 번에 결제',d:'판매자별로 배송비를 묶고 주문을 나눕니다.',run:()=>{if(!S.cart.length){S.cart.push({p:'P1',s:'A',cond:'신품',price:52000,ship:3000,qty:1,max:14,oi:0});S.cart.push({p:'P5',s:'C',cond:'신품',price:15900,ship:0,qty:1,max:55,oi:0});}go('c','cart');}},
  {t:'판매자 엑셀 대량 등록',d:'스마트스토어 양식을 그대로 올립니다.',run:()=>{S.upload=null;go('s','upload');}},
  {t:'판매자 발송 처리',d:'송장을 넣으면 소비자 화면이 바뀝니다.',run:()=>go('s','sorders')},
  {t:'관리자 판매자 심사',d:'서류가 빠지면 승인이 잠깁니다.',run:()=>go('a','sellers')},
  {t:'단종 차종 처리',d:'단종차 부품을 남길지 숨길지 정합니다.',run:()=>go('a','master')}
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
const VIEWS={car:viewCar,search:viewSearch,part:viewPart,cart:viewCart,orders:viewOrders,upload:viewUpload,sorders:viewSOrders,sellers:viewSellers,master:viewMaster};
function render(){
  $('roleSel').value=UI.role;
  const cur=UI.view==='part'?'search':UI.view;
  $('nav').innerHTML=NAV[UI.role].map(v=>'<a href="#/'+UI.role+'/'+v[0]+'"'+(cur===v[0]?' aria-current="page"':'')+'>'+ic(v[2])+v[1]+(v[0]==='cart'&&S.cart.length?'<span class="cnt">'+S.cart.length+'</span>':'')+(v[0]==='sorders'?(()=>{const n=S.orders.filter(o=>o.st.A==='결제 완료').length;return n?'<span class="cnt">'+n+'</span>':'';})():'')+(v[0]==='sellers'?(()=>{const n=S.apps.filter(a=>a.st==='심사 대기').length;return n?'<span class="cnt">'+n+'</span>':'';})():'')+'</a>').join('')+
    (UI.role==='c'?'<span class="mycar">'+ic('car')+'<b>'+esc(carLabel(S.car))+'</b></span>':'');
  $('main').innerHTML=VIEWS[UI.view]();
  renderGuide();
}

/* ===== events ===== */
document.addEventListener('click',(e)=>{
  const t=e.target.closest('button'); if(!t) return; const d=t.dataset;
  if(d.guide!=null){const i=Number(d.guide);UI.guideStep=i;if(window.matchMedia('(max-width:1100px)').matches)UI.guideOpen=false;GUIDE[i].run();return;}
  if(d.go2){go(UI.role,d.go2);return;}
  if(d.part){go('c','part',d.part);return;}
  if(d.ex){UI.q=d.ex;UI.onlyFit=!/LF|96525/.test(d.ex);render();return;}
  if(d.add){const [pid,oi]=d.add.split('|');const p=S.parts.find(x=>x.id===pid),o=p.offers[Number(oi)];
    const ex=S.cart.find(l=>l.p===pid&&l.s===o.s);
    withLoading('장바구니에 담는 중...',()=>{if(ex){ex.qty=Math.min(ex.qty+1,o.stock);}else S.cart.push({p:pid,s:o.s,cond:o.cond,price:o.price,ship:o.ship,qty:1,max:o.stock,oi:Number(oi)});
      toast(SELLERS[o.s].name+'의 '+p.name+'을 담았습니다.');render();},300);return;}
  if(d.rm!=null){S.cart.splice(Number(d.rm),1);render();return;}
  if(d.okrow!=null){S.upload.rows[Number(d.okrow)].ok=true;render();return;}
  if(d.ship){const o=S.orders.find(x=>x.id===d.ship);const v=$('inv-'+o.id).value.trim();if(!v){toast('송장번호를 넣어 주세요.','bad');return;}
    withLoading('발송 처리 중...',()=>{o.st.A='배송 중';o.inv.A=v;toast(o.id+' 발송 처리했습니다. 소비자 주문 내역에 배송 중으로 표시됩니다.');render();});return;}
  if(d.apv!=null){const a=S.apps[Number(d.apv)];withLoading('승인 처리 중...',()=>{a.st='승인';toast(a.name+' 입점을 승인했습니다. 이제 상품을 등록할 수 있습니다.');render();});return;}
  if(d.rej!=null){const a=S.apps[Number(d.rej)];const miss=Object.keys(a.docs).filter(k=>!a.docs[k]);withLoading('반려 처리 중...',()=>{a.st='반려';a.reason=miss.length?'빠진 서류: '+miss.join(', '):'취급 분야 확인 필요';toast(a.name+' 신청을 반려했습니다. 사유가 판매자에게 안내됩니다.');render();});return;}
  switch(d.act){
    case 'toggleGuide': UI.guideOpen=!UI.guideOpen; renderGuide(); return;
    case 'search': UI.q=$('q').value; render(); return;
    case 'showAll': UI.onlyFit=false; render(); return;
    case 'pay':{
      withLoading('결제 승인 확인 중...',()=>{
        const id='O-'+(seq.order++);const ship={},stt={};
        S.cart.forEach(l=>{ship[l.s]=Math.max(ship[l.s]||0,l.ship);stt[l.s]='결제 완료';const p=S.parts.find(x=>x.id===l.p);const o=p.offers[l.oi];if(o)o.stock=Math.max(0,o.stock-l.qty);});
        S.orders.push({id,at:'10-06 '+new Date().toTimeString().slice(0,5),lines:S.cart.map(l=>({p:l.p,s:l.s,qty:l.qty,price:l.price})),ship,st:stt,inv:{}});
        const n=Object.keys(stt).length;S.cart=[];toast('결제가 끝났습니다. 주문 '+id+'이 판매자 '+n+'곳으로 나뉘어 전달됩니다.');go('c','orders');},700);return;}
    case 'upPick': withLoading('엑셀 파일 읽는 중...',()=>{S.upload={file:'스마트스토어_일괄등록_판매자A.xlsx (예시)',rows:SAMPLE.map(checkRow)};toast('5행을 읽었습니다. 확인이 필요한 행을 봐 주세요.');render();},600); return;
    case 'upCancel': S.upload=null; render(); return;
    case 'upSave':{const ok=S.upload.rows.filter(x=>x.st==='정상'||(x.needOk&&x.ok&&x.st!=='오류'));const wait=S.upload.rows.filter(x=>x.needOk&&!x.ok&&x.st!=='오류').length;
      if(!ok.length){toast('등록할 수 있는 행이 없습니다.','bad');return;}
      withLoading('상품 등록 중...',()=>{ok.forEach(x=>{const o={s:'A',cond:x.r.cond==='중고상품'?'중고':'신품',price:Number(x.r.price),stock:Number(x.r.stock),ship:3000,days:1,km:38,rating:4.8};
          let p=x.pid&&S.parts.find(q=>q.id===x.pid);
          if(!p){p={id:'P'+(seq.part++),name:x.r.name.replace(/\s*\d{5}-[A-Z0-9]{5}/,'').replace(/^(\S+\s+){1,2}/,''),cat:'기타',pn:'품번 없음',fits:[F(x.fit.mk,x.fit.model,x.fit.gen)],offers:[]};S.parts.push(p);}
          const same=p.offers.find(q=>q.s==='A'&&q.cond===o.cond); if(same){same.price=o.price;same.stock=o.stock;} else p.offers.push(o);});
        S.upload=null;toast(ok.length+'행을 등록했습니다.'+(wait?' 확인하지 않은 '+wait+'행은 남겨 두었습니다.':'')+' 오류 행은 제외했습니다.');render();});return;}
    case 'dpSave':{const v=(document.querySelector('input[name="dp"]:checked')||{}).value||'keep';withLoading('정책 저장 중...',()=>{S.discPolicy=v;toast(v==='keep'?'단종 차종 부품을 검색에 남기고 표시합니다.':'단종 차종 전용 부품을 검색에서 숨깁니다.');render();});return;}
  }
});
document.addEventListener('change',(e)=>{
  const i=e.target;
  if(i.id==='roleSel'){go(i.value,NAV[i.value][i.value==='c'?1:0][0]);return;}
  if(i.dataset&&i.dataset.car){
    const c=S.car||{};
    if(i.id==='c-mk'){S.car={mk:i.value,model:'',gen:'',trim:''};}
    if(i.id==='c-model'){S.car={mk:c.mk,model:i.value,gen:'',trim:''};}
    if(i.id==='c-gen'){S.car={mk:c.mk,model:c.model,gen:i.value,trim:''};}
    if(i.id==='c-trim'){c.trim=i.value;}
    if(S.car.gen) toast('내 차를 '+carLabel(S.car)+'(으)로 등록했습니다.');
    render(); const n=$(i.id); if(n) n.focus(); return;}
  if(i.id==='onlyFit'){UI.onlyFit=i.checked;render();return;}
  if(i.id==='sort'){UI.sort=i.value;render();return;}
  if(i.dataset&&i.dataset.cq!=null){const l=S.cart[Number(i.dataset.cq)];l.qty=Math.max(1,Math.min(l.max,Number(i.value)||1));render();return;}
});
document.addEventListener('keydown',(e)=>{if(e.key==='Enter'&&e.target.id==='q'){UI.q=e.target.value;render();const n=$('q');if(n){n.focus();}}});
window.addEventListener('hashchange',route);
route();
})();
