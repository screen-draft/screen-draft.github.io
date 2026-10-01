(function(){
"use strict";

/* ===== utils ===== */
const ic=(n)=>'<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-'+n+'"/></svg>';
const num=(n)=>Number(n).toLocaleString('ko-KR');
const usd=(n)=>Number(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const esc=(s)=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=(id)=>document.getElementById(id);
const clone=(o)=>JSON.parse(JSON.stringify(o));
const DAY=86400000;
const today=new Date(); today.setHours(0,0,0,0);
const dstr=(d)=>{const x=new Date(d);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');};
const TODAY=dstr(today);
const addDays=(n)=>dstr(today.getTime()+n*DAY);
const ymd6=(s)=>s.slice(2).replace(/-/g,'');
/* 주말과 공휴일(예시 목록)은 영업일에서 뺀다 */
const HOLIDAYS=['2026-10-05','2026-10-09','2026-12-25','2027-01-01'];
const isWeekend=(s)=>{const d=new Date(s+'T00:00:00').getDay();return d===0||d===6||HOLIDAYS.indexOf(s)>=0;};
function nextBiz(s){let t=new Date(s+'T00:00:00').getTime();while(isWeekend(dstr(t))) t+=DAY;return dstr(t);}
function bizAfter(s){return nextBiz(dstr(new Date(s+'T00:00:00').getTime()+DAY));}
const nowHM=()=>{const d=new Date();return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');};

/* ===== 예시 데이터 ===== */
const WH=['본사 창고','김포 창고','반품 창고','전시 재고'];
const D0=nextBiz(addDays(7));           /* 선금 희망일로 쓰는 날: 이미 4건이 차 있는 날 */
const D1=bizAfter(D0);
const SEED={
  whOn:[true,true,false,false],
  factories:{
    A:{name:'공장 A',eng:'Factory A Co., Ltd.',country:'중국',port:'Ningbo',cur:'USD',deposit:30,lead:35,mail:'order@factory-a.example'},
    B:{name:'공장 B',eng:'Factory B Co., Ltd.',country:'베트남',port:'Ho Chi Minh',cur:'USD',deposit:50,lead:30,mail:'sales@factory-b.example'},
    C:{name:'공장 C',eng:'Factory C Co., Ltd.',country:'중국',port:'Shenzhen',cur:'USD',deposit:30,lead:40,mail:'export@factory-c.example'},
    D:{name:'공장 D',eng:'Factory D Co., Ltd.',country:'인도네시아',port:'Jakarta',cur:'USD',deposit:40,lead:45,mail:'po@factory-d.example'}
  },
  items:{
    'HK-1012':{name:'스테인리스 텀블러 500ml',eng:'Stainless Tumbler 500ml',f:'A',wh:[1240,600,35,12],onOrder:0,sales:1260,xls:1245,factor:2.0,moq:1000,unit:500,cost:3.85,ret:0},
    'HK-1015':{name:'스테인리스 텀블러 750ml',eng:'Stainless Tumbler 750ml',f:'A',wh:[650,300,18,6],onOrder:1000,sales:820,xls:830,factor:2.0,moq:1000,unit:500,cost:4.60,ret:0},
    'HK-2030':{name:'보온 도시락 2단',eng:'Insulated Lunch Box 2-Tier',f:'A',wh:[300,120,9,4],onOrder:0,sales:610,xls:598,factor:2.5,moq:600,unit:300,cost:6.20,ret:0},
    'KT-3104':{name:'실리콘 조리도구 5종',eng:'Silicone Utensil Set 5pcs',f:'B',wh:[1500,710,22,8],onOrder:0,sales:540,xls:552,factor:2.0,moq:500,unit:100,cost:5.10,ret:0},
    'KT-3110':{name:'원목 도마 대',eng:'Wooden Cutting Board L',f:'B',wh:[210,100,14,5],onOrder:300,sales:390,xls:362,factor:2.5,moq:300,unit:100,cost:7.40,ret:0},
    'KT-3122':{name:'밀폐용기 6종 세트',eng:'Airtight Container Set 6pcs',f:'B',wh:[480,200,16,10],onOrder:0,sales:720,xls:715,factor:2.0,moq:1000,unit:500,cost:4.25,ret:0},
    'LV-5201':{name:'접이식 빨래건조대',eng:'Folding Drying Rack',f:'C',wh:[100,50,7,3],onOrder:500,sales:210,xls:214,factor:3.0,moq:300,unit:50,cost:11.80,ret:0},
    'LV-5207':{name:'욕실 선반 2단',eng:'Bathroom Shelf 2-Tier',f:'C',wh:[60,35,4,2],onOrder:0,sales:180,xls:176,factor:3.0,moq:300,unit:50,cost:9.30,ret:0},
    'GD-7003':{name:'원예용 전지가위',eng:'Garden Pruning Shears',f:'D',wh:[900,420,11,4],onOrder:500,sales:260,xls:255,factor:2.5,moq:500,unit:100,cost:3.10,ret:0},
    'GD-7011':{name:'물뿌리개 5L',eng:'Watering Can 5L',f:'D',wh:[160,80,58,3],onOrder:0,sales:330,xls:349,factor:2.5,moq:500,unit:100,cost:2.75,ret:58}
  },
  extra:{'HK-1012':500},
  pending:{'HK-2030':'PO-A-'+ymd6(TODAY)+'-01'},
  pos:[
    {id:'PO-C-'+ymd6(addDays(-20))+'-01',f:'C',date:addDays(-20),lines:[{code:'LV-5201',base:300,extra:0,price:11.80}],step:12,sub:null,fail:null,erpNo:'20260911-3',rb:'ok',doc:{po:'결재-2609-0142',seal:'결재-2609-0177',pay:'결재-2609-0183'},pi:'PI_FactoryC.pdf',want:addDays(-8),payDate:addDays(-8)},
    {id:'PO-D-'+ymd6(addDays(-9))+'-01',f:'D',date:addDays(-9),lines:[{code:'GD-7003',base:500,extra:0,price:3.10}],step:11,sub:'ready',fail:null,erpNo:'20260922-2',rb:'ok',doc:{po:'결재-2609-0201',seal:'결재-2609-0236'},pi:'PI_FactoryD.pdf',want:D0,payDate:null},
    {id:'PO-B-'+ymd6(addDays(-6))+'-01',f:'B',date:addDays(-6),lines:[{code:'KT-3110',base:300,extra:0,price:7.40}],step:8,sub:null,fail:{step:8,msg:'하이웍스 연동 토큰이 만료되어 메일 발송이 거절되었습니다.'},erpNo:'20260925-1',rb:'ok',doc:{po:'결재-2609-0219'},pi:null,want:D0,payDate:null},
    {id:'PO-C-'+ymd6(addDays(-2))+'-01',f:'C',date:addDays(-2),lines:[{code:'LV-5201',base:500,extra:0,price:11.80}],step:4,sub:null,fail:{step:4,msg:'보낸 값과 저장된 값이 다릅니다. 납기일자가 저장되지 않았습니다.'},erpNo:'20260929-4',rb:'bad',doc:{},pi:null,want:D0,payDate:null},
    {id:'PO-A-'+ymd6(addDays(-1))+'-01',f:'A',date:addDays(-1),lines:[{code:'HK-1015',base:1000,extra:0,price:4.60}],step:7,sub:null,fail:null,erpNo:'20260930-2',rb:'ok',doc:{po:'결재-2609-0251'},pi:null,want:D0,payDate:null},
    {id:'PO-A-'+ymd6(TODAY)+'-01',f:'A',date:TODAY,lines:[{code:'HK-2030',base:1200,extra:0,price:6.20}],step:2,sub:null,fail:null,erpNo:null,rb:null,doc:{},pi:null,want:D0,payDate:null}
  ],
  pays:[
    {date:D0,po:'PO-E-0912-01',amt:4200.00},{date:D0,po:'PO-E-0915-01',amt:1860.50},{date:D0,po:'PO-F-0916-02',amt:7350.00},{date:D0,po:'PO-G-0919-01',amt:2940.00},
    {date:D1,po:'PO-H-0920-01',amt:5120.00},{date:D1,po:'PO-E-0922-01',amt:980.00}
  ],
  reqs:[
    {id:'R-0031',code:'KT-3122',qty:500,reason:'10월 홈쇼핑 프로모션 물량',by:'영업팀',date:addDays(-1),status:'요청',reply:''},
    {id:'R-0030',code:'HK-1012',qty:500,reason:'온라인몰 기획전',by:'영업팀',date:addDays(-3),status:'반영',reply:'가산분 500 반영'}
  ],
  log:[
    {t:addDays(-1)+' 16:42',po:'PO-A-'+ymd6(addDays(-1))+'-01',who:'발주 담당자',msg:'발주 품의 상신. 결재 진행 중'},
    {t:addDays(-2)+' 11:08',po:'PO-C-'+ymd6(addDays(-2))+'-01',who:'시스템',msg:'되읽기 검증 불일치. 다음 단계 차단, 담당자 메신저 알림'},
    {t:addDays(-3)+' 09:30',po:'',who:'발주 담당자',msg:'수량 협의 R-0030 반영. HK-1012 가산분 500'},
    {t:addDays(-6)+' 14:21',po:'PO-B-'+ymd6(addDays(-6))+'-01',who:'시스템',msg:'공장 메일 발송 실패. 멈춘 단계 기록, 장애 알림'}
  ],
  xlsDate:addDays(-24)
};
let S=clone(SEED);
let seqReq=32, seqDoc=260;

/* ===== 판정: 계산은 이 함수 한 곳에서만 ===== */
function avail(it,data){data=data||S;return it.wh.reduce((a,v,i)=>a+(data.whOn[i]?v:0),0);}
function judge(code,data){
  data=data||S; const it=data.items[code];
  const av=avail(it,data), demand=Math.round(it.sales*it.factor);
  const value=av+it.onOrder-demand;
  const target=value<0, shortage=target?-value:0;
  const base=target?Math.max(it.moq,Math.ceil(shortage/it.unit)*it.unit):0;
  const extra=Number(data.extra[code])||0;
  let err='';
  if(extra<0) err='가산분은 0 이상이어야 합니다.';
  else if(extra%it.unit!==0) err='가산분은 발주단위 '+num(it.unit)+'의 배수여야 합니다.';
  return {av,demand,value,target,shortage,base,extra,qty:base+extra,err};
}
/* 발주번호: 현행 규칙 + 순번. 같은 공장 같은 날 중복 방지 */
function nextPoNo(f,date){
  const prefix='PO-'+f+'-'+ymd6(date)+'-';
  const n=S.pos.filter(p=>p.id.indexOf(prefix)===0).length+1;
  return prefix+String(n).padStart(2,'0');
}
/* 선금 요청일 배정: 하루 4건 제한, 주말·공휴일 제외 */
const PAY_CAP=4;
function assignPayDate(want,pays){
  let d=nextBiz(want);
  while(pays.filter(p=>p.date===d).length>=PAY_CAP) d=bizAfter(d);
  return d;
}
function poTotal(po){return po.lines.reduce((a,l)=>a+(l.base+l.extra)*l.price,0);}
function poDeposit(po){return Math.round(poTotal(po)*S.factories[po.f].deposit)/100;}

/* ===== 단계 ===== */
const STEPS=[null,'발주 판정 확정','전송 내용 확인','이카운트 전표 등록','되읽기 검증','발주서 PDF 생성','발주 품의 상신','품의 승인 수신','공장 메일 발송','견적송장 접수','명판 날인 결재','선금 지급 요청'];
function stageLabel(po){
  if(po.step>=12) return ['완료','ok'];
  if(po.fail) return [STEPS[po.fail.step]+' 멈춤','bad'];
  if(po.step===7||po.sub==='pending') return ['결재 대기','warn'];
  return [STEPS[po.step],'info'];
}

/* ===== state ===== */
const UI={role:'buyer',view:'check',id:null,tab:'lines',open:{},sel:{},xcmp:false,salesSel:'GD-7011',guideOpen:null,guideStep:null,showJson:false,fFilter:'전체'};
const NAV={
  buyer:[{g:'발주'},{k:'check',l:'발주 점검',i:'clipboard',cnt:()=>Object.keys(S.items).filter(c=>judge(c).target&&!S.pending[c]).length},{k:'pos',l:'발주 진행',i:'list',cnt:()=>S.pos.filter(p=>p.step<12).length},{k:'pay',l:'선금 일정',i:'calendar'},
         {g:'기준'},{k:'sales',l:'판매량 집계',i:'chart'},{k:'reqs',l:'수량 협의',i:'chat',cnt:()=>S.reqs.filter(r=>r.status==='요청').length},{k:'master',l:'기준정보',i:'settings'},
         {g:'기록'},{k:'log',l:'이력',i:'history'}],
  sales:[{g:'발주'},{k:'check',l:'발주 점검',i:'clipboard'},{k:'reqs',l:'수량 협의',i:'chat'}]
};
const TITLES={check:['발주','발주 점검'],pos:['발주','발주 진행'],pay:['발주','선금 일정'],sales:['기준','판매량 집계'],reqs:['기준','수량 협의'],master:['기준','기준정보'],log:['기록','이력']};
function go(view,id){const h='#/'+UI.role+'/'+view+(id?'/'+id:''); if(location.hash===h) route(); else location.hash=h;}
function route(){
  const p=location.hash.replace(/^#\/?/,'').split('/').filter(Boolean);
  if(p[0]==='buyer'||p[0]==='sales') UI.role=p[0];
  const list=NAV[UI.role].filter(n=>n.k).map(n=>n.k);
  UI.view=list.indexOf(p[1])>=0?p[1]:list[0]; UI.id=p[2]||null;
  if(Date.now()-(toast.at||0)>300) $('toastHost').innerHTML='';
  render(); window.scrollTo(0,0);
}
function toast(msg,kind){toast.at=Date.now();const h=$('toastHost');h.innerHTML='<div class="toast'+(kind==='bad'?' bad':'')+'" role="status">'+ic(kind==='bad'?'alert':'check')+'<span>'+esc(msg)+'</span></div>';clearTimeout(toast.t);toast.t=setTimeout(()=>{h.innerHTML='';},3400);}
let busy=false;
function withLoading(msg,fn,ms){if(busy)return;busy=true;$('overlayHost').innerHTML='<div class="overlay" role="status" aria-live="assertive"><div class="ob"><span class="spin" aria-hidden="true"></span><span>'+esc(msg)+'</span></div></div>';setTimeout(()=>{$('overlayHost').innerHTML='';busy=false;fn();},ms||460);}
function log(po,who,msg){S.log.unshift({t:TODAY+' '+nowHM(),po:po||'',who,msg});}
const st=(t,k)=>'<span class="st '+k+'">'+esc(t)+'</span>';
const empty=(i,t,d,b)=>'<div class="empty">'+ic(i)+'<strong>'+esc(t)+'</strong><p>'+esc(d)+'</p>'+(b||'')+'</div>';
const btn=(o)=>'<button type="button" class="btn '+(o.cls||'')+(o.iconM?' icon-m':'')+'"'+(o.iconM?' data-tip="'+esc(o.label)+'" aria-label="'+esc(o.label)+'"':'')+' '+(o.attrs||'')+'>'+(o.icon?ic(o.icon):'')+'<span class="lbl">'+esc(o.label)+'</span></button>';
function pageHead(extra,sub){const t=TITLES[UI.view];return '<div class="ph"><div><div class="crumb">'+t[0]+' &gt; '+t[1]+'</div><h1>'+t[1]+'</h1>'+(sub?'<div class="sub">'+sub+'</div>':'')+'</div>'+(extra?'<div class="ph-actions">'+extra+'</div>':'')+'</div>';}
const canCost=()=>UI.role==='buyer';

function renderShell(){
  $('roleSel').value=UI.role;
  $('who').textContent=UI.role==='buyer'?'발주 담당자 (원가 열람 가능)':'영업팀 (원가 비공개)';
  $('side').innerHTML=NAV[UI.role].map(n=>{if(n.g) return '<h2>'+n.g+'</h2>';const c=n.cnt?n.cnt():0;
    return '<a href="#/'+UI.role+'/'+n.k+'"'+(UI.view===n.k?' aria-current="page"':'')+'>'+ic(n.i)+n.l+(c?'<span class="cnt">'+c+'</span>':'')+'</a>';}).join('');
}

/* ===== 발주 점검 ===== */
function viewCheck(){
  const codes=Object.keys(S.items).filter(c=>UI.fFilter==='전체'||S.items[c].f===UI.fFilter);
  const buyer=UI.role==='buyer';
  const rows=codes.map(code=>{
    const it=S.items[code], j=judge(code), pend=S.pending[code];
    const selable=buyer&&j.target&&!pend&&!j.err;
    let r='<tr class="'+(j.target?'target':'')+'">'+
      (buyer?'<td class="c">'+(j.target&&!pend?'<input type="checkbox" data-sel="'+code+'"'+(UI.sel[code]&&selable?' checked':'')+(selable?'':' disabled')+' aria-label="'+esc(it.name)+' 선택" style="width:16px;height:16px">':'')+'</td>':'')+
      '<td class="itemc"><div>'+esc(it.name)+'</div><div class="small">'+code+' / '+S.factories[it.f].name+'</div></td>'+
      '<td class="r num">'+num(j.av)+'</td><td class="r num">'+num(it.onOrder)+'</td>'+
      '<td class="r num">'+num(it.sales)+'<div class="small">x '+it.factor.toFixed(1)+'</div></td>'+
      '<td class="r num '+(j.target?'neg':'pos')+'">'+(j.value>0?'+':'')+num(j.value)+'</td>'+
      '<td class="nw">'+(pend?st('발주 진행 중','info'):j.target?st('발주 대상','warn'):st('충분','mute'))+(UI.xcmp?' '+st('엑셀과 일치','ok'):'')+
        '<div><button type="button" class="xbtn" data-why="'+code+'" aria-expanded="'+(!!UI.open[code])+'">'+(UI.open[code]?'근거 닫기':'판정 근거')+'</button></div></td>'+
      '<td class="r num">'+(j.target?num(j.base):'-')+'<div class="small">최소 '+num(it.moq)+' / 단위 '+num(it.unit)+'</div></td>'+
      '<td class="r">'+(j.target&&!pend?(buyer?'<label class="sr" for="ex-'+code+'">'+esc(it.name)+' 가산분</label><input class="f qty" id="ex-'+code+'" type="number" inputmode="numeric" min="0" step="'+it.unit+'" value="'+j.extra+'" data-extra="'+code+'"><div class="err" id="exe-'+code+'">'+esc(j.err)+'</div>':'<span class="num">'+num(j.extra)+'</span>'):'-')+'</td>'+
      '<td class="r num"><b id="qt-'+code+'">'+(j.target?num(j.qty):'-')+'</b>'+(canCost()?'<div class="small" id="am-'+code+'">'+(j.target?'USD '+usd(j.qty*it.cost):'@'+usd(it.cost))+'</div>':'')+'</td></tr>';
    if(UI.open[code]){
      const cols=(buyer?1:0)+9;
      r+='<tr><td class="why" colspan="'+cols+'"><div class="calc">'+
        '<span class="cell"><small>가용재고 ('+WH.filter((w,i)=>S.whOn[i]).join(' + ')+')</small><b>'+num(j.av)+'</b></span><span class="op">+</span>'+
        '<span class="cell"><small>기발주량 (발주서 조회)</small><b>'+num(it.onOrder)+'</b></span><span class="op">-</span>'+
        '<span class="cell"><small>월평균 판매량 x 가산 지수</small><b>'+num(it.sales)+' x '+it.factor.toFixed(1)+' = '+num(j.demand)+'</b></span><span class="op">=</span>'+
        '<span class="cell"><small>판정값</small><b class="'+(j.target?'neg':'')+'">'+(j.value>0?'+':'')+num(j.value)+'</b></span>'+
        (j.target?'<span class="op">&rarr;</span><span class="cell"><small>부족분 '+num(j.shortage)+'을 발주단위 '+num(it.unit)+'로 올림, 최소발주수량 '+num(it.moq)+' 이상</small><b>기준 수량 '+num(j.base)+'</b></span>'+
          (j.extra?'<span class="op">+</span><span class="cell"><small>가산분 (기준 수량은 그대로)</small><b>'+num(j.extra)+'</b></span>':''):'<span class="op">&rarr;</span><span class="cell"><small>0 이상</small><b>발주하지 않음</b></span>')+
        '</div></td></tr>';
    }
    return r;
  }).join('');
  const nT=codes.filter(c=>judge(c).target&&!S.pending[c]).length;
  const fs=['전체'].concat(Object.keys(S.factories));
  return pageHead(buyer?btn({icon:'file',label:UI.xcmp?'엑셀 대조 닫기':'현행 엑셀과 대조',iconM:true,attrs:'data-act="xcmp"'})+btn({cls:'pri',icon:'send',label:'선택 품목 발주서 만들기',attrs:'data-act="makePo"'}):'',
      '판정식: 가용재고 + 기발주량 - 월평균 판매량 x 가산 지수. 음수면 발주 대상입니다.'+(buyer?'':' 원가와 금액은 이 권한에서 보이지 않습니다.'))+
    '<div class="bar"><label for="ff" class="small">공장</label><select id="ff" class="f">'+fs.map(f=>'<option value="'+f+'"'+(UI.fFilter===f?' selected':'')+'>'+(f==='전체'?'전체':S.factories[f].name)+'</option>').join('')+'</select><span class="grow"></span><span class="small">발주 대상 '+nT+'개 / 전체 '+codes.length+'개 품목</span></div>'+
    '<div class="tw"><table class="t jt"><thead><tr>'+(buyer?'<th class="c"><span class="sr">선택</span></th>':'')+'<th>품목</th><th class="r">가용재고</th><th class="r">기발주량</th><th class="r">월평균 판매<div class="rule">x 가산 지수</div></th><th class="r">판정값</th><th>판정</th><th class="r">기준 수량</th><th class="r">가산분</th><th class="r">발주 수량'+(canCost()?'<div class="rule">금액</div>':'')+'</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
    (UI.xcmp?'<p class="note ok">'+ic('check')+'현행 엑셀 판정 결과와 '+codes.length+'개 품목 모두 일치합니다. (예시) 인수 기준: 같은 입력에서 엑셀과 같은 대상, 같은 수량이 나와야 합니다.</p>':'')+
    '<p class="note">'+ic('alert')+'가산분은 기준 수량을 덮어쓰지 않고 따로 더합니다. 그래서 최소발주수량과 발주단위 검증이 항상 유지됩니다. 판정식과 올림 규칙은 예시이며 현행 엑셀 수식을 그대로 옮깁니다.</p>';
}

/* ===== 발주 진행 ===== */
function viewPos(){
  if(UI.id){const po=S.pos.find(p=>p.id===UI.id); if(po) return poDetail(po);}
  const rows=S.pos.slice().reverse().map(po=>{const [l,k]=stageLabel(po);
    return '<tr><td data-k="발주번호"><button type="button" class="idlink" data-po="'+po.id+'">'+po.id+'</button></td><td class="stc">'+st(l,k)+'</td><td data-k="공장">'+S.factories[po.f].name+'</td><td data-k="발주일" class="num">'+po.date+'</td><td class="full">'+esc(S.items[po.lines[0].code].name)+(po.lines.length>1?' 외 '+(po.lines.length-1)+'건':'')+'</td><td data-k="단계" class="num">'+Math.min(po.step,11)+' / 11</td><td data-k="금액(USD)" class="r num">'+usd(poTotal(po))+'</td></tr>';}).join('');
  return pageHead('','발주 한 건이 판정에서 선금 지급 요청까지 11단계로 진행됩니다. 멈춘 단계는 그 단계부터 다시 실행합니다.')+
    '<div class="tw rl rl-kv"><table class="t"><thead><tr><th>발주번호</th><th>현재 상태</th><th>공장</th><th>발주일</th><th>품목</th><th>단계</th><th class="r">금액(USD)</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
}
function timeline(po){
  return '<ol class="tl" aria-label="진행 단계">'+STEPS.slice(1).map((s,i)=>{const n=i+1;
    let cls='',sub='대기';
    if(po.fail&&po.fail.step===n){cls='fail';sub='멈춤. 이 단계부터 재실행';}
    else if(n<po.step){cls='done';sub='완료';}
    else if(n===po.step){cls='cur';sub=(n===7||po.sub==='pending')?'결재 승인 대기':(n===2||n===6||n===8||n===9||(po.sub==='ready'))?'담당자 확인 필요':'진행 중';}
    return '<li class="'+cls+'"'+(cls==='cur'?' aria-current="step"':'')+'><span class="no">'+n+'</span><span>'+s+'<span class="s">'+sub+'</span></span></li>';}).join('')+'</ol>';
}
function payloadRows(po){
  const f=S.factories[po.f];
  const rows=[['발주일자','IO_DATE',po.date.replace(/-/g,''),true],['거래처','CUST',f.name,true],['발주번호 (비고1)','P_REMARKS1',po.id,true],['납기일자','TIME_DATE',dstr(new Date(po.date+'T00:00:00').getTime()+f.lead*DAY).replace(/-/g,''),true],['선금 비율 (비고2)','P_REMARKS2',f.deposit+'%',true]];
  po.lines.forEach((l,i)=>{rows.push(['품목 '+(i+1),'PROD_CD',l.code,true]);rows.push(['수량 '+(i+1),'QTY',String(l.base+l.extra),true]);rows.push(['단가 '+(i+1),'PRICE',l.price.toFixed(2),true]);});
  return rows;
}
function readback(po){
  return payloadRows(po).map(r=>{const bad=po.rb==='bad'&&r[1]==='TIME_DATE';return {k:r[0],field:r[1],sent:r[2],saved:bad?'':r[2],ok:!bad};});
}
function stepPanel(po){
  const f=S.factories[po.f];
  if(po.step>=12) return '<section class="panel"><h2>모든 단계가 끝났습니다</h2><p class="lead">선금 지급 요청 결재까지 승인되었습니다. 잔금 지급 이후 단계는 이번 범위 밖입니다.</p><div class="kv2"><div class="k">전표 번호</div><div>'+esc(po.erpNo)+'</div><div class="k">선금 요청일</div><div>'+esc(po.payDate||'-')+'</div><div class="k">선금</div><div class="num">USD '+usd(poDeposit(po))+' ('+f.deposit+'%)</div></div></section>';
  if(po.fail&&po.fail.step===4){
    return '<section class="panel bad"><h2>되읽기 검증에서 멈췄습니다</h2><p class="lead">이카운트가 정상 응답을 줬지만 저장된 값이 보낸 값과 다릅니다. 다음 단계(발주서 PDF, 품의)로 넘어가지 않습니다.</p>'+rbTable(po)+
      '<p class="note warn">'+ic('alert')+'입력화면 양식에 등록되지 않은 항목은 응답 코드만으로는 알 수 없어, 등록 직후 발주서 조회로 다시 읽어 대조합니다. 전표는 API로 고칠 수 없으므로 이카운트 화면에서 보정한 뒤 다시 되읽습니다. 전표를 새로 만들지 않습니다.</p>'+
      '<div class="acts">'+btn({cls:'pri',icon:'refresh',label:'이카운트에서 보정 후 다시 되읽기',attrs:'data-act="recheck"'})+'</div></section>';
  }
  if(po.fail&&po.fail.step===8){
    return '<section class="panel bad"><h2>공장 메일 발송에서 멈췄습니다</h2><p class="lead">'+esc(po.fail.msg)+'</p>'+
      '<div class="kv2"><div class="k">멈춘 단계</div><div>8. 공장 메일 발송</div><div class="k">앞 단계 결과</div><div>전표 '+esc(po.erpNo)+', 품의 '+esc(po.doc.po)+' 승인 완료. 그대로 유지</div><div class="k">재실행 범위</div><div>토큰 재발급 후 8단계만 다시 실행. 전표와 결재를 다시 만들지 않습니다</div></div>'+
      '<div class="acts">'+btn({cls:'pri',icon:'refresh',label:'토큰 재발급 후 이 단계부터 재실행',attrs:'data-act="retry"'})+'</div></section>';
  }
  if(po.step===2){
    const rows=payloadRows(po);
    const json='{\n  "PurchasesOrderList": [\n'+po.lines.map(l=>'    { "BulkDatas": { "IO_DATE": "'+po.date.replace(/-/g,'')+'", "CUST": "'+f.name+'", "PROD_CD": "'+l.code+'", "QTY": "'+(l.base+l.extra)+'", "PRICE": "'+l.price.toFixed(2)+'", "TIME_DATE": "'+rows[3][2]+'", "P_REMARKS1": "'+po.id+'", "P_REMARKS2": "'+f.deposit+'%" } }').join(',\n')+'\n  ]\n}';
    return '<section class="panel"><h2>전송 내용 확인</h2><p class="lead">아래가 이카운트로 보낼 내용 그대로입니다. 전표는 등록 후 API로 수정하거나 삭제할 수 없어, 사람 확인을 등록 앞에 둡니다.</p>'+
      '<div class="tw"><table class="t"><thead><tr><th>항목</th><th>보낼 값</th><th>입력화면 양식</th></tr></thead><tbody>'+rows.map(r=>'<tr><td>'+r[0]+'<div class="small">'+r[1]+'</div></td><td class="num">'+esc(r[2])+'</td><td>'+st('등록됨','ok')+'</td></tr>').join('')+'</tbody></table></div>'+
      '<button type="button" class="xbtn" data-act="json" style="margin-top:8px">'+(UI.showJson?'요청 본문 닫기':'요청 본문 그대로 보기')+'</button>'+(UI.showJson?'<pre class="payload" tabindex="0">'+esc(json)+'</pre><p class="small" style="margin:4px 0 0">필드명은 예시입니다. 확보된 필드 대응표로 착수 시 확정합니다.</p>':'')+
      '<label class="confirm"><input type="checkbox" id="okSend"><span>보낼 내용을 확인했습니다. 등록 후에는 되돌릴 수 없다는 점을 알고 있습니다.</span></label>'+
      '<div class="acts">'+btn({icon:'x',label:'발주 취소 (전표 생성 전)',iconM:true,attrs:'data-act="cancelPo"'})+btn({cls:'pri',icon:'send',label:'이카운트에 전표 등록',attrs:'data-act="register" id="regBtn" disabled'})+'</div></section>';
  }
  if(po.step===6){
    return '<section class="panel"><h2>발주 품의 상신</h2><p class="lead">본문과 발주서 PDF 첨부를 채운 기안 화면을 엽니다. 하이웍스는 기안 화면을 팝업으로 띄우는 방식이라, 담당자가 마지막에 상신을 한 번 누릅니다.</p>'+
      '<div class="kv2"><div class="k">전표 번호</div><div>'+esc(po.erpNo)+' (되읽기 검증 일치)</div><div class="k">첨부</div><div>'+po.id+'.pdf</div><div class="k">결재 양식</div><div>발주 품의서</div></div>'+
      '<div class="acts">'+btn({cls:'pri',icon:'external',label:'기안 화면 열기',attrs:'data-draft="po"'})+'</div></section>';
  }
  if(po.step===7||po.sub==='pending'){
    const kind=po.step===7?'po':po.step===10?'seal':'pay';
    return '<section class="panel"><h2>결재 승인을 기다리고 있습니다</h2><p class="lead">하이웍스가 상태 회신 주소로 문서 번호와 상태 값을 보내면 서명을 검증하고 다음 단계로 넘깁니다. 수신이 누락되면 문서 상태 조회로 보완합니다.</p>'+
      '<div class="kv2"><div class="k">문서 번호</div><div>'+esc(po.doc[kind])+'</div><div class="k">현재 상태</div><div>'+st('결재 진행','warn')+'</div></div>'+
      '<div class="acts">'+btn({icon:'refresh',label:'문서 상태 조회',iconM:true,attrs:'data-act="poll"'})+btn({cls:'pri',icon:'check',label:'승인 상태 수신 (시연)',attrs:'data-act="approved"'})+'</div></section>';
  }
  if(po.step===8){
    return '<section class="panel"><h2>공장 메일 발송</h2><p class="lead">하이웍스 메일 발송에는 첨부 항목이 없어, 발주서는 내려받기 링크로 넣습니다.</p>'+mailPreview(po)+
      '<div class="acts">'+btn({cls:'pri',icon:'mail',label:'공장에 메일 보내기',attrs:'data-act="mail"'})+'</div></section>';
  }
  if(po.step===9){
    return '<section class="panel"><h2>견적송장(PI) 접수</h2><p class="lead">공장 회신 메일을 전용 수신 주소로 전달하면 시스템이 접수합니다. 파일로 직접 올릴 수도 있습니다.</p>'+
      '<div class="kv2"><div class="k">전용 수신 주소</div><div>pi-in@po-flow.example</div><div class="k">연결 기준</div><div>제목이나 본문의 발주번호 '+po.id+'</div></div>'+
      '<div class="acts">'+btn({icon:'upload',label:'파일로 올리기',attrs:'data-act="piFile"'})+btn({cls:'pri',icon:'inbox',label:'전달 메일 접수 (시연)',attrs:'data-act="piMail"'})+'</div></section>';
  }
  if(po.step===10){
    return '<section class="panel"><h2>견적송장 명판 날인 결재</h2><p class="lead">접수한 견적송장을 첨부해 명판 날인 결재를 올립니다.</p>'+
      '<div class="kv2"><div class="k">접수 문서</div><div>'+esc(po.pi)+'</div><div class="k">결재 양식</div><div>명판 날인 요청서</div></div>'+
      '<div class="acts">'+btn({cls:'pri',icon:'external',label:'기안 화면 열기',attrs:'data-draft="seal"'})+'</div></section>';
  }
  if(po.step===11){
    const d=assignPayDate(po.want,S.pays), moved=d!==nextBiz(po.want);
    return '<section class="panel"><h2>선금 지급 요청</h2><p class="lead">발주서의 선금 비율과 선금 일자를 읽어 결재를 올립니다. 해외 송금은 하루 '+PAY_CAP+'건까지라 요청일을 나눠 배정합니다.</p>'+
      '<div class="kv2"><div class="k">선금</div><div class="num">USD '+usd(poDeposit(po))+' (발주 금액 '+usd(poTotal(po))+'의 '+f.deposit+'%)</div><div class="k">발주서 선금 일자</div><div class="num">'+po.want+' (이미 '+S.pays.filter(p=>p.date===nextBiz(po.want)).length+'건 배정)</div><div class="k">배정된 요청일</div><div class="num"><b>'+d+'</b> '+(moved?st('다음 영업일로 이동','warn'):st('희망일 그대로','ok'))+'</div></div>'+
      '<div class="acts">'+btn({icon:'calendar',label:'선금 일정 보기',iconM:true,attrs:'data-go="pay"'})+btn({cls:'pri',icon:'external',label:'기안 화면 열기',attrs:'data-draft="pay"'})+'</div></section>';
  }
  return '<section class="panel"><h2>'+STEPS[po.step]+'</h2><p class="lead">자동으로 진행 중입니다.</p></section>';
}
function mailPreview(po){
  const f=S.factories[po.f];
  return '<div class="kv2" style="margin-bottom:8px"><div class="k">받는 사람</div><div>'+f.mail+'</div><div class="k">제목</div><div>[Purchase Order] '+po.id+'</div></div>'+
    '<div class="mailbody">Dear '+f.eng+',\n\nPlease find our purchase order '+po.id+'.\nDownload: https://po-flow.example/d/'+po.id.toLowerCase()+'\n\nKindly confirm and send us your proforma invoice.\n\nBest regards,\nPurchasing Team</div>';
}
function rbTable(po){
  const rb=readback(po);
  return '<div class="tw"><table class="t"><thead><tr><th>항목</th><th>보낸 값</th><th>저장된 값 (되읽기)</th><th>대조</th></tr></thead><tbody>'+rb.map(r=>'<tr'+(r.ok?'':' class="mis"')+'><td>'+r.k+'<div class="small">'+r.field+'</div></td><td class="num">'+esc(r.sent)+'</td><td class="num">'+(r.saved===''?'(비어 있음)':esc(r.saved))+'</td><td>'+(r.ok?st('일치','ok'):st('불일치','bad'))+'</td></tr>').join('')+'</tbody></table></div>';
}
function poDoc(po){
  const f=S.factories[po.f]; const etd=dstr(new Date(po.date+'T00:00:00').getTime()+f.lead*DAY);
  return '<article class="podoc" aria-label="발주서 '+po.id+'"><div class="pohd"><div><h2>PURCHASE ORDER</h2></div><div class="buyer"><b>(Buyer Company Name)</b><br>Geumcheon-gu, Seoul, Korea</div></div>'+
    '<table><tbody><tr><th>PO No.</th><td>'+po.id+'</td><th>Order Date</th><td>'+po.date+'</td></tr><tr><th>Supplier</th><td>'+f.eng+'</td><th>Requested ETD</th><td>'+etd+'</td></tr><tr><th>Currency</th><td colspan="3">'+f.cur+'</td></tr></tbody></table>'+
    '<div style="overflow-x:auto"><table class="poitems"><thead><tr><th class="c">No.</th><th>Item Code</th><th>Description</th><th class="r">Quantity</th><th class="r">Unit Price</th><th class="r">Amount</th></tr></thead><tbody>'+
    po.lines.map((l,i)=>'<tr><td class="c">'+(i+1)+'</td><td>'+l.code+'</td><td>'+esc(S.items[l.code].eng)+'</td><td class="r">'+num(l.base+l.extra)+'</td><td class="r">'+usd(l.price)+'</td><td class="r">'+usd((l.base+l.extra)*l.price)+'</td></tr>').join('')+
    '<tr><td colspan="5" class="r"><b>Total ('+f.cur+')</b></td><td class="r"><b>'+usd(poTotal(po))+'</b></td></tr></tbody></table></div>'+
    '<table class="poterms"><tbody><tr><th>Payment</th><td>'+f.deposit+'% deposit, '+(100-f.deposit)+'% before shipment (T/T)</td></tr><tr><th>Deposit Date</th><td>'+po.want+'</td></tr><tr><th>Price Terms</th><td>FOB '+f.port+'</td></tr><tr><th>Port of Loading</th><td>'+f.port+'</td></tr><tr><th>Packing</th><td>Export standard carton</td></tr><tr><th>Inspection</th><td>Pre-shipment inspection by buyer</td></tr><tr><th>Remarks</th><td>Please confirm by proforma invoice.</td></tr></tbody></table>'+
    '<div class="sign"><div>Authorized Signature</div></div></article>';
}
function poDetail(po){
  const [l,k]=stageLabel(po); const f=S.factories[po.f];
  const tabs=[['lines','발주 내용'],['rb','되읽기 검증'],['doc','발주서'],['log','이력']];
  let tab='';
  if(UI.tab==='lines') tab='<div class="tw"><table class="t"><thead><tr><th>품목</th><th class="r">기준 수량</th><th class="r">가산분</th><th class="r">발주 수량</th><th class="r">단가(USD)</th><th class="r">금액(USD)</th></tr></thead><tbody>'+po.lines.map(x=>'<tr><td>'+esc(S.items[x.code].name)+'<div class="small">'+x.code+'</div></td><td class="r num">'+num(x.base)+'</td><td class="r num">'+num(x.extra)+'</td><td class="r num"><b>'+num(x.base+x.extra)+'</b></td><td class="r num">'+usd(x.price)+'</td><td class="r num">'+usd((x.base+x.extra)*x.price)+'</td></tr>').join('')+'</tbody><tfoot><tr><td colspan="5">합계 / 선금 '+f.deposit+'%</td><td class="r num">'+usd(poTotal(po))+' / '+usd(poDeposit(po))+'</td></tr></tfoot></table></div>';
  if(UI.tab==='rb') tab=po.erpNo?rbTable(po)+'<p class="note">'+ic('shield')+'등록 직후 발주서 조회로 다시 읽은 값입니다. 전표 번호 '+esc(po.erpNo)+'</p>':empty('shield','아직 전표를 등록하지 않았습니다','전송 내용을 확인하고 등록하면 저장된 값을 되읽어 여기에 대조 결과를 보여 줍니다.');
  if(UI.tab==='doc') tab=po.step>=5&&!(po.fail&&po.fail.step===4)?'<div class="bar"><span class="small">현행 인쇄 양식과 같은 구성: 머리글, 발주 정보 5개, 품목 표 6개 열, 거래조건 7개 항목 (내용은 예시)</span><span class="grow"></span>'+btn({icon:'printer',label:'인쇄',iconM:true,attrs:'data-act="printPo"'})+'</div>'+poDoc(po):empty('file','발주서 PDF는 되읽기 검증 뒤에 만듭니다','전표가 저장된 값과 일치하는 것을 확인한 다음에만 발주서를 생성합니다.');
  if(UI.tab==='log'){const ls=S.log.filter(x=>x.po===po.id); tab=ls.length?'<div class="tw"><table class="t"><thead><tr><th>일시</th><th>주체</th><th>내용</th></tr></thead><tbody>'+ls.map(x=>'<tr><td class="num">'+x.t+'</td><td>'+x.who+'</td><td>'+esc(x.msg)+'</td></tr>').join('')+'</tbody></table></div>':empty('history','이 건의 이력이 아직 없습니다','단계가 진행되면 판정 근거, 수량 조정, 결재 진행이 건별로 남습니다.');}
  return '<div class="ph"><div><div class="crumb">발주 &gt; 발주 진행 &gt; '+po.id+'</div><h1>'+po.id+' '+st(l,k)+'</h1><div class="sub">'+f.name+' ('+f.country+') / 발주일 '+po.date+(po.erpNo?' / 전표 '+esc(po.erpNo):'')+'</div></div><div class="ph-actions"><button type="button" class="btn" data-go="pos">'+ic('left')+'목록</button></div></div>'+
    '<div class="po"><div>'+timeline(po)+'</div><div>'+stepPanel(po)+
    '<div class="tabs" role="tablist">'+tabs.map(t=>'<button type="button" role="tab" data-tab="'+t[0]+'" aria-selected="'+(UI.tab===t[0])+'">'+t[1]+'</button>').join('')+'</div>'+tab+'</div></div>';
}

/* ===== 결재 기안 팝업 재현 ===== */
const DRAFT={po:{form:'발주 품의서',title:(po)=>'[발주 품의] '+po.id+' '+S.factories[po.f].name},seal:{form:'명판 날인 요청서',title:(po)=>'[명판 날인] '+po.id+' 견적송장'},pay:{form:'선금 지급 요청서',title:(po)=>'[선금 지급 요청] '+po.id}};
function openDraft(po,kind){
  const d=DRAFT[kind], f=S.factories[po.f];
  let body='<div class="kv2"><div class="k">발주번호</div><div>'+po.id+'</div><div class="k">공장</div><div>'+f.name+' ('+f.country+')</div><div class="k">발주 금액</div><div class="num">USD '+usd(poTotal(po))+'</div>';
  if(kind==='po') body+='<div class="k">품목</div><div>'+po.lines.map(l=>esc(S.items[l.code].name)+' '+num(l.base+l.extra)).join(', ')+'</div>';
  if(kind==='seal') body+='<div class="k">대상 문서</div><div>'+esc(po.pi)+'</div>';
  if(kind==='pay') body+='<div class="k">선금</div><div class="num">USD '+usd(poDeposit(po))+' ('+f.deposit+'%)</div><div class="k">지급 요청일</div><div class="num">'+assignPayDate(po.want,S.pays)+'</div>';
  body+='</div>';
  const att=kind==='po'?po.id+'.pdf':kind==='seal'?po.pi:po.id+'.pdf, '+po.pi;
  $('modalHost').innerHTML='<div class="modal-bg" data-close="1"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="mTitle"><div class="mh"><span>하이웍스 전자결재 기안 팝업 (시연용 재현 화면)</span><button type="button" class="btn sm" data-act="closeModal" aria-label="닫기">'+ic('x')+'</button></div>'+
    '<div class="mb"><h2 id="mTitle">'+esc(d.title(po))+'</h2><div class="line-appr"><div><small>기안</small>발주 담당자</div><div><small>검토</small>팀장</div><div><small>승인</small>대표</div></div>'+
    '<div class="kv2" style="margin-bottom:10px"><div class="k">결재 양식</div><div>'+d.form+'</div><div class="k">첨부</div><div>'+esc(att)+'</div></div>'+body+
    '<p class="small" style="margin:10px 0 0">본문과 첨부는 시스템이 채웠습니다. 결재선과 본문 형식은 일반적인 구성을 전제한 예시입니다.</p></div>'+
    '<div class="mf">'+btn({label:'취소',attrs:'data-act="closeModal"'})+btn({cls:'pri',icon:'send',label:'상신',attrs:'data-submit="'+kind+'" id="submitDraft"'})+'</div></div></div>';
  const b=$('submitDraft'); if(b) b.focus();
}
function closeModal(){$('modalHost').innerHTML='';}

/* ===== 선금 일정 ===== */
function viewPay(){
  let d=nextBiz(addDays(5)); const days=[]; for(let i=0;i<8;i++){days.push(d); d=bizAfter(d);}
  const rows=days.map(dt=>{const ps=S.pays.filter(p=>p.date===dt);
    return '<tr><td class="num">'+dt+'</td><td><span class="cap" aria-hidden="true">'+[0,1,2,3].map(i=>'<i class="'+(i<ps.length?(ps[i].isNew?'new':'on'):'')+'"></i>').join('')+'</span><span class="num">'+ps.length+' / '+PAY_CAP+'</span> '+(ps.length>=PAY_CAP?st('마감','bad'):'')+'</td><td>'+(ps.map(p=>p.po+(p.isNew?' (이동 배정)':'')).join(', ')||'<span class="small">배정 없음</span>')+'</td><td class="r num">'+(ps.length?usd(ps.reduce((a,p)=>a+p.amt,0)):'-')+'</td></tr>';}).join('');
  const wait=S.pos.filter(p=>p.step===11&&p.sub==='ready');
  return pageHead('','해외 송금이 하루 '+PAY_CAP+'건으로 제한되어, 선금 지급 요청일이 겹치면 다음 영업일로 나눠 배정합니다.')+
    '<div class="tw"><table class="t"><thead><tr><th>요청일</th><th>배정 건수</th><th>발주번호</th><th class="r">합계(USD)</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
    (wait.length?'<h2 class="sh">선금 요청 대기 <span class="meta">기안하면 아래 날짜로 배정됩니다</span></h2><div class="tw"><table class="t"><thead><tr><th>발주번호</th><th>발주서 선금 일자</th><th>배정 예정일</th><th class="r">선금(USD)</th></tr></thead><tbody>'+wait.map(po=>{const a=assignPayDate(po.want,S.pays);return '<tr><td><button type="button" class="idlink" data-po="'+po.id+'">'+po.id+'</button></td><td class="num">'+po.want+'</td><td class="num">'+a+' '+(a!==nextBiz(po.want)?st('이동','warn'):'')+'</td><td class="r num">'+usd(poDeposit(po))+'</td></tr>';}).join('')+'</tbody></table></div>':'');
}

/* ===== 판매량 집계 ===== */
function dailyRows(code){
  const it=S.items[code]; const base=it.wh[0]+it.wh[1]; const out=[]; let stock=base;
  const pat=[0.9,1.15,1.0,0.8,1.2,0.95,1.05]; const daily=it.sales/30;
  for(let i=0;i<7;i++){const ship=Math.round(daily*pat[i]); const inb=(i===3?it.unit:0); const prev=stock+ship-inb; out.push({d:addDays(-i-1),prev,inb,cur:stock,ship}); stock=prev;}
  return out;
}
function viewSales(){
  const codes=Object.keys(S.items);
  const rows=codes.map(c=>{const it=S.items[c]; const diff=it.sales-it.xls; const pct=Math.abs(diff)/it.xls*100; const warn=pct>=5;
    return '<tr'+(UI.salesSel===c?' class="sel"':'')+'><td><button type="button" class="idlink" data-ssel="'+c+'">'+c+'</button><div class="small">'+esc(it.name)+'</div></td><td class="r num">'+num(it.sales)+'</td><td class="r num">'+num(it.xls)+'</td><td class="r num">'+(diff>0?'+':'')+num(diff)+' ('+pct.toFixed(1)+'%)</td><td>'+(warn?st('차이 확인 필요','warn'):st('일치 범위','ok'))+'</td><td>'+(it.ret?st('반품 창고 '+num(it.ret),'warn'):'<span class="small">특이 없음</span>')+'</td></tr>';}).join('');
  const it=S.items[UI.salesSel]; const dr=dailyRows(UI.salesSel);
  return pageHead(btn({icon:'refresh',label:'일별 재고 적재 실행',iconM:true,attrs:'data-act="loadStock"'})+btn({cls:'pri',icon:'upload',label:'판매현황 엑셀 올리기',attrs:'data-act="xls"'}),
      '이카운트에는 판매 실적 조회가 없어, 일별 재고 증감으로 출고량을 역산하고 월 1회 올리는 엑셀과 나란히 대조합니다.')+
    '<p class="note warn" style="margin:0 0 12px">'+ic('alert')+'재고 역산은 착수 첫 주에 실제 호출로 검증합니다. 성립하지 않으면 엑셀 경로 단독으로 운영합니다. 아래 수치는 예시입니다.</p>'+
    '<div class="tw"><table class="t"><thead><tr><th>품목</th><th class="r">역산 월평균</th><th class="r">엑셀 월평균</th><th class="r">차이</th><th>대조</th><th>반품 관측</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
    '<p class="small" style="margin:6px 0 0">엑셀 기준일 '+S.xlsDate+'. 차이가 5% 이상이면 표시합니다.</p>'+
    '<h2 class="sh">일별 역산 내역 <span class="meta">'+UI.salesSel+' '+esc(it.name)+' / 전일 재고 + 입고 - 당일 재고 = 출고</span></h2>'+
    '<div class="tw"><table class="t"><thead><tr><th>기준일</th><th class="r">전일 재고</th><th class="r">입고</th><th class="r">당일 재고</th><th class="r">역산 출고</th></tr></thead><tbody>'+dr.map(r=>'<tr><td class="num">'+r.d+'</td><td class="r num">'+num(r.prev)+'</td><td class="r num">'+(r.inb?num(r.inb):'-')+'</td><td class="r num">'+num(r.cur)+'</td><td class="r num"><b>'+num(r.ship)+'</b></td></tr>').join('')+'</tbody></table></div>'+
    (it.ret?'<p class="note warn">'+ic('alert')+'반품 창고에 '+num(it.ret)+'개가 관측됩니다. 재고로 돌아오는 반품이면 증감에서 상쇄되고, 돌아오지 않는 품목이면 판매량 계산에서 따로 보정합니다. 반품 처리 방식은 발주처 회신 후 확정합니다.</p>':'')+
    '<p class="note">'+ic('shield')+'호출 한도: 조회 계열 시간당 6,000건, 하루 10,000건. 품목 '+codes.length+'개 일별 적재는 하루 '+codes.length+'건 안팎이고, 1년 소급 적재도 시간당 한도 안에서 나눠 실행합니다. 실제 호출 단위는 첫 주 검증에서 확정합니다.</p>';
}

/* ===== 수량 협의 ===== */
function viewReqs(){
  const buyer=UI.role==='buyer';
  const rows=S.reqs.map(r=>{const it=S.items[r.code];
    return '<tr><td data-k="번호" class="num">'+r.id+'</td><td class="stc">'+st(r.status,r.status==='요청'?'warn':r.status==='반영'?'ok':'mute')+'</td><td class="full">'+esc(it.name)+' <span class="small">'+r.code+'</span></td><td data-k="요청 수량" class="r num">+'+num(r.qty)+'</td><td class="full">'+esc(r.reason)+(r.reply?'<div class="small">답변: '+esc(r.reply)+'</div>':'')+'</td><td data-k="요청일" class="num">'+r.date+'</td>'+
      '<td class="r full">'+(buyer&&r.status==='요청'?btn({cls:'sm',label:'보류',attrs:'data-hold="'+r.id+'"'})+' '+btn({cls:'sm pri',icon:'check',label:'가산분에 반영',attrs:'data-apply="'+r.id+'"'}):'')+'</td></tr>';}).join('');
  const form=!buyer?'<h2 class="sh">프로모션 물량 반영 요청</h2><div class="box"><div class="bar" style="margin:0;align-items:flex-end">'+
    '<div><label for="rq-code" class="small" style="display:block">품목</label><select id="rq-code" class="f">'+Object.keys(S.items).map(c=>'<option value="'+c+'">'+c+' '+esc(S.items[c].name)+'</option>').join('')+'</select></div>'+
    '<div><label for="rq-qty" class="small" style="display:block">추가 수량</label><input id="rq-qty" class="f qty" type="number" inputmode="numeric" min="0" style="width:110px"></div>'+
    '<div style="flex:1;min-width:180px"><label for="rq-why" class="small" style="display:block">사유</label><input id="rq-why" class="f" style="width:100%" placeholder="예: 11월 기획전 물량"></div>'+
    btn({cls:'pri',icon:'send',label:'요청 보내기',attrs:'data-act="newReq"'})+'</div><div class="err" id="rq-err" role="alert"></div></div>':'';
  return pageHead('','영업팀의 프로모션 반영 요청과 발주 담당자의 답변을 여기서 처리해 메일 협의를 대신합니다.')+form+
    (form?'<h2 class="sh">요청 내역</h2>':'')+
    (S.reqs.length?'<div class="tw rl rl-kv"><table class="t"><thead><tr><th>번호</th><th>상태</th><th>품목</th><th class="r">요청 수량</th><th>사유</th><th>요청일</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>':empty('chat','요청이 없습니다','영업팀이 프로모션 물량을 요청하면 여기에 나타납니다.'));
}

/* ===== 기준정보 ===== */
function viewMaster(){
  const rows=Object.keys(S.items).map(c=>{const it=S.items[c];
    return '<tr><td>'+esc(it.name)+'<div class="small">'+c+' / '+S.factories[it.f].name+'</div></td><td class="r"><label class="sr" for="mf-'+c+'">'+esc(it.name)+' 가산 지수</label><input class="f qty" id="mf-'+c+'" type="number" step="0.1" min="0" data-mf="'+c+'" value="'+it.factor.toFixed(1)+'"></td><td class="r"><label class="sr" for="mm-'+c+'">'+esc(it.name)+' 최소발주수량</label><input class="f qty" id="mm-'+c+'" type="number" min="0" data-mm="'+c+'" value="'+it.moq+'"></td><td class="r"><label class="sr" for="mu-'+c+'">'+esc(it.name)+' 발주단위</label><input class="f qty" id="mu-'+c+'" type="number" min="1" data-mu="'+c+'" value="'+it.unit+'"></td></tr>';}).join('');
  return pageHead(btn({cls:'pri',icon:'check',label:'기준정보 저장',attrs:'data-act="saveMaster"'}),'가산 지수, 최소발주수량, 가용재고에 넣을 창고, 공장 정보를 관리합니다. 바꾸면 발주 점검 판정에 바로 반영됩니다.')+
    '<div class="two"><div><h2 class="sh" style="margin-top:0">품목별 기준</h2><div class="tw"><table class="t"><thead><tr><th>품목</th><th class="r">가산 지수</th><th class="r">최소발주수량</th><th class="r">발주단위</th></tr></thead><tbody>'+rows+'</tbody></table></div></div>'+
    '<div><h2 class="sh" style="margin-top:0">가용재고에 넣는 창고</h2><div class="box">'+WH.map((w,i)=>'<label class="chk" style="display:flex"><input type="checkbox" data-wh="'+i+'"'+(S.whOn[i]?' checked':'')+'>'+w+'</label>').join('')+'<p class="small" style="margin:6px 0 0">실제 창고 기준은 착수 초기에 확정합니다.</p></div>'+
    '<h2 class="sh">공장 정보</h2><div class="tw"><table class="t"><thead><tr><th>공장</th><th>국가</th><th class="r">선금 비율</th><th>선적항</th><th class="r">납기(일)</th></tr></thead><tbody>'+Object.keys(S.factories).map(k=>{const f=S.factories[k];return '<tr><td>'+f.name+'</td><td>'+f.country+'</td><td class="r num">'+f.deposit+'%</td><td>'+f.port+'</td><td class="r num">'+f.lead+'</td></tr>';}).join('')+'</tbody></table></div></div></div>';
}

/* ===== 이력 ===== */
function viewLog(){
  return pageHead('','판정 근거, 수량 조정, 결재 진행, 알림 발송을 건별로 남깁니다.')+
    '<div class="tw rl rl-kv"><table class="t"><thead><tr><th>일시</th><th>발주번호</th><th>주체</th><th>내용</th></tr></thead><tbody>'+S.log.map(x=>'<tr><td data-k="일시" class="num">'+x.t+'</td><td class="stc">'+(x.po?'<button type="button" class="idlink" data-po="'+x.po+'">'+x.po+'</button>':'<span class="small">-</span>')+'</td><td data-k="주체">'+x.who+'</td><td class="full">'+esc(x.msg)+'</td></tr>').join('')+'</tbody></table></div>';
}

/* ===== guide ===== */
const GUIDE=[
  {k:'g1',t:'판매량 역산과 엑셀 대조',d:'조회 API가 없는 판매 실적을 재고 증감으로 역산합니다.'},
  {k:'g2',t:'발주 점검과 판정 근거',d:'엑셀 판정식 그대로, 가산분은 따로 더합니다.'},
  {k:'g3',t:'되돌릴 수 없는 전표: 전송 전 확인',d:'보낼 내용을 그대로 보고 확인한 뒤 등록합니다.'},
  {k:'g4',t:'되읽기 검증 불일치 차단',d:'정상 응답이어도 저장값이 다르면 멈춥니다.'},
  {k:'g5',t:'결재 상신과 승인 수신',d:'상신은 사람이 누르고, 승인은 상태 수신으로 잇습니다.'},
  {k:'g6',t:'멈춘 단계부터 재실행',d:'전표와 결재를 다시 만들지 않습니다.'},
  {k:'g7',t:'선금 요청일 분산',d:'하루 4건을 넘으면 다음 영업일로 배정합니다.'}
];
function renderGuide(){
  const g=$('guide'); g.hidden=false;
  if(UI.guideOpen===null) UI.guideOpen=window.matchMedia('(min-width:1101px)').matches;
  g.className='guide'+(UI.guideOpen?'':' closed');
  document.body.classList.toggle('guide-open',!!UI.guideOpen);
  g.innerHTML='<button type="button" class="gh" data-act="toggleGuide" aria-expanded="'+UI.guideOpen+'" aria-controls="guideList"><span>시연 안내</span>'+ic(UI.guideOpen?'down':'up')+'</button>'+
    '<ol id="guideList">'+GUIDE.map((s,i)=>'<li><button type="button" data-guide="'+s.k+'"'+(UI.guideStep===s.k?' aria-current="step"':'')+'><b><span class="n">'+(i+1)+'.</span>'+s.t+'</b>'+(UI.guideStep===s.k?'<span class="d">'+s.d+'</span>':'')+'</button></li>').join('')+'</ol>';
}
function findPo(pred){return S.pos.find(pred);}
function guide(k){
  UI.guideStep=k; UI.role='buyer'; if(window.matchMedia('(max-width:1100px)').matches) UI.guideOpen=false;
  const miss=()=>{toast('이 단계의 예시 건이 이미 진행되었습니다. 기준정보 화면 아래에서 예시 데이터를 되돌릴 수 있습니다.','bad');go('pos');};
  if(k==='g1'){UI.salesSel='GD-7011';go('sales');}
  if(k==='g2'){UI.open={'HK-1012':true};UI.fFilter='전체';go('check');}
  if(k==='g3'){const p=findPo(x=>x.step===2);UI.tab='lines';UI.showJson=true;p?go('pos',p.id):miss();}
  if(k==='g4'){const p=findPo(x=>x.fail&&x.fail.step===4);UI.tab='lines';p?go('pos',p.id):miss();}
  if(k==='g5'){const p=findPo(x=>x.step===7)||findPo(x=>x.step===6);UI.tab='doc';p?go('pos',p.id):miss();}
  if(k==='g6'){const p=findPo(x=>x.fail&&x.fail.step===8);UI.tab='log';p?go('pos',p.id):miss();}
  if(k==='g7'){const p=findPo(x=>x.step===11&&x.sub==='ready');UI.tab='lines';p?go('pos',p.id):go('pay');}
}

/* ===== render ===== */
const VIEWS={check:viewCheck,pos:viewPos,pay:viewPay,sales:viewSales,reqs:viewReqs,master:viewMaster,log:viewLog};
function render(){
  renderShell();
  $('main').innerHTML=VIEWS[UI.view]()+(UI.view==='master'?'<div class="acts">'+btn({icon:'refresh',label:'예시 데이터로 되돌리기',attrs:'data-act="reset"'})+'</div>':'');
  renderGuide();
}
function curPo(){return S.pos.find(p=>p.id===UI.id);}
function advanceAfterRegister(po){
  withLoading('저장된 전표 되읽는 중...',()=>{
    po.step=4;
    if(po.rb==='bad'){po.fail={step:4,msg:'보낸 값과 저장된 값이 다릅니다.'};log(po.id,'시스템','되읽기 검증 불일치. 다음 단계 차단');render();return;}
    po.rb='ok'; log(po.id,'시스템','되읽기 검증 일치 ('+payloadRows(po).length+'개 항목)');
    withLoading('발주서 PDF 생성 중...',()=>{po.step=6;po.fail=null;log(po.id,'시스템','발주서 PDF 생성');UI.tab='rb';toast('전표 등록, 되읽기 검증, 발주서 생성까지 끝났습니다. 품의를 상신해 주세요.');render();});
  });
}

document.addEventListener('click',(e)=>{
  if(e.target.dataset&&e.target.dataset.close){closeModal();return;}
  const t=e.target.closest('button'); if(!t) return; const d=t.dataset;
  if(d.guide){guide(d.guide);return;}
  if(d.go){go(d.go);return;}
  if(d.po){UI.tab='lines';if(UI.role!=='buyer')UI.role='buyer';go('pos',d.po);return;}
  if(d.tab){UI.tab=d.tab;render();return;}
  if(d.why){UI.open[d.why]=!UI.open[d.why];render();return;}
  if(d.ssel){UI.salesSel=d.ssel;render();return;}
  if(d.draft){openDraft(curPo(),d.draft);return;}
  if(d.submit){const po=curPo(), kind=d.submit; closeModal();
    withLoading('상신 처리 중...',()=>{po.doc[kind]='결재-'+ymd6(TODAY).slice(0,4)+'-0'+(seqDoc++);
      if(kind==='po'){po.step=7;} else {po.sub='pending';}
      if(kind==='pay'){po.payDate=assignPayDate(po.want,S.pays);S.pays.push({date:po.payDate,po:po.id,amt:poDeposit(po),isNew:po.payDate!==nextBiz(po.want)});}
      log(po.id,'발주 담당자',DRAFT[kind].form+' 상신. 문서 '+po.doc[kind]+(kind==='pay'?' / 지급 요청일 '+po.payDate:''));
      toast('상신했습니다. 결재 상태가 바뀌면 메신저로 알립니다.');render();});return;}
  if(d.apply||d.hold){const r=S.reqs.find(x=>x.id===(d.apply||d.hold));
    if(d.hold){r.status='보류';r.reply='이번 발주에는 반영하지 않음';log('','발주 담당자','수량 협의 '+r.id+' 보류');toast(r.id+' 요청을 보류했습니다.');render();return;}
    const it=S.items[r.code];
    if(r.qty%it.unit!==0){toast('요청 수량이 발주단위 '+num(it.unit)+'의 배수가 아니어서 반영할 수 없습니다.','bad');return;}
    withLoading('가산분 반영 중...',()=>{S.extra[r.code]=(Number(S.extra[r.code])||0)+r.qty;r.status='반영';r.reply='가산분 '+num(r.qty)+' 반영';log('','발주 담당자','수량 협의 '+r.id+' 반영. '+r.code+' 가산분 '+num(S.extra[r.code]));toast(it.name+' 가산분에 '+num(r.qty)+'을 더했습니다. 기준 수량은 그대로입니다.');UI.open={};UI.open[r.code]=true;go('check');});return;}
  const po=curPo();
  switch(d.act){
    case 'toggleGuide': UI.guideOpen=!UI.guideOpen; renderGuide(); return;
    case 'closeModal': closeModal(); return;
    case 'xcmp': UI.xcmp=!UI.xcmp; render(); return;
    case 'json': UI.showJson=!UI.showJson; render(); return;
    case 'makePo':{
      const codes=Object.keys(UI.sel).filter(c=>UI.sel[c]&&judge(c).target&&!S.pending[c]);
      if(!codes.length){toast('발주할 품목을 선택해 주세요.','bad');return;}
      const bad=codes.filter(c=>judge(c).err); if(bad.length){toast('가산분을 고쳐야 하는 품목이 '+bad.length+'개 있습니다.','bad');return;}
      withLoading('발주서 초안 만드는 중...',()=>{
        const byF={}; codes.forEach(c=>{(byF[S.items[c].f]=byF[S.items[c].f]||[]).push(c);});
        const made=[];
        Object.keys(byF).forEach(f=>{const id=nextPoNo(f,TODAY);
          S.pos.push({id,f,date:TODAY,lines:byF[f].map(c=>{const j=judge(c);return {code:c,base:j.base,extra:j.extra,price:S.items[c].cost};}),step:2,sub:null,fail:null,erpNo:null,rb:null,doc:{},pi:null,want:D0,payDate:null});
          byF[f].forEach(c=>{S.pending[c]=id;}); made.push(id);
          log(id,'발주 담당자','발주 판정 확정. '+byF[f].map(c=>c+' '+num(judge(c).qty)).join(', '));});
        UI.sel={}; UI.tab='lines';
        toast('발주서 '+made.join(', ')+'을 만들었습니다. 전송 내용을 확인해 주세요.');
        made.length===1?go('pos',made[0]):go('pos');});
      return;}
    case 'cancelPo':
      withLoading('발주 취소 중...',()=>{po.lines.forEach(l=>{delete S.pending[l.code];});S.pos=S.pos.filter(p=>p!==po);log('','발주 담당자',po.id+' 전표 생성 전 취소');toast(po.id+'을 취소했습니다. 전표는 만들어지지 않았습니다.');go('pos');});return;
    case 'register':
      withLoading('이카운트 전표 등록 중...',()=>{po.step=3;po.erpNo=TODAY.replace(/-/g,'')+'-'+(1+S.pos.indexOf(po));
        po.lines.forEach(l=>{S.items[l.code].onOrder+=l.base+l.extra;delete S.pending[l.code];delete S.extra[l.code];});
        log(po.id,'시스템','이카운트 발주 전표 등록. 전표 '+po.erpNo);advanceAfterRegister(po);});return;
    case 'recheck':
      withLoading('저장된 전표 다시 되읽는 중...',()=>{po.rb='ok';po.fail=null;log(po.id,'발주 담당자','이카운트 화면에서 납기일자 보정 후 재검증. 일치');
        withLoading('발주서 PDF 생성 중...',()=>{po.step=6;UI.tab='rb';log(po.id,'시스템','발주서 PDF 생성');toast('되읽기 검증이 일치합니다. 전표를 새로 만들지 않고 이어서 진행합니다.');render();});});return;
    case 'retry':
      withLoading('하이웍스 토큰 재발급 중...',()=>{withLoading('공장 메일 다시 보내는 중...',()=>{po.fail=null;po.step=9;log(po.id,'시스템','토큰 재발급 후 8단계 재실행. 공장 메일 발송 완료');UI.tab='log';toast('8단계부터 다시 실행했습니다. 전표와 결재는 그대로입니다.');render();});});return;
    case 'poll':
      withLoading('하이웍스 문서 상태 조회 중...',()=>{toast('아직 결재 진행 중입니다. 승인되면 자동으로 다음 단계로 넘어갑니다.');});return;
    case 'approved':
      withLoading('상태 수신 서명 검증 중...',()=>{
        if(po.step===7){po.step=8;log(po.id,'시스템','발주 품의 승인 수신. 담당자 메신저 알림');toast('품의가 승인되었습니다. 공장 메일 발송으로 넘어갑니다.');}
        else if(po.step===10){po.step=11;po.sub='ready';log(po.id,'시스템','명판 날인 결재 승인 수신. 메신저 알림');toast('명판 날인 결재가 승인되었습니다. 선금 지급 요청으로 넘어갑니다.');}
        else if(po.step===11){po.step=12;po.sub=null;log(po.id,'시스템','선금 지급 요청 승인 수신. 전 단계 완료');toast('선금 지급 요청이 승인되었습니다.');}
        render();});return;
    case 'mail':
      withLoading('공장 메일 발송 중...',()=>{po.step=9;log(po.id,'시스템','공장 메일 발송. 받는 사람 '+S.factories[po.f].mail);toast('공장에 발주 메일을 보냈습니다. 회신된 견적송장을 접수해 주세요.');render();});return;
    case 'piMail': case 'piFile':
      withLoading(d.act==='piMail'?'전달된 메일에서 견적송장 찾는 중...':'견적송장 파일 올리는 중...',()=>{po.pi='PI_'+po.id+'.pdf';po.step=10;po.sub='ready';log(po.id,d.act==='piMail'?'시스템':'발주 담당자','견적송장 접수 ('+(d.act==='piMail'?'전용 수신 주소':'파일 업로드')+'). '+po.pi);toast('견적송장을 접수했습니다. 명판 날인 결재로 이어집니다.');render();});return;
    case 'printPo': $('printHost').innerHTML=poDoc(po); if(!navigator.webdriver) window.print(); return;
    case 'loadStock': withLoading('이카운트 재고현황 조회 중...',()=>{log('','시스템','일별 재고 적재. 조회 10건 (전사 합계), 한도 시간당 6,000건');toast('오늘 기준 재고를 적재했습니다. 조회 10건을 사용했습니다.');});return;
    case 'xls': withLoading('판매현황 엑셀 읽는 중...',()=>{S.xlsDate=TODAY;log('','발주 담당자','판매현황 엑셀 업로드. 10개 품목 대조');toast('엑셀 10개 품목을 읽어 역산 값과 대조했습니다.');render();});return;
    case 'newReq':{
      const code=$('rq-code').value, qty=Number($('rq-qty').value), why=$('rq-why').value.trim(), it=S.items[code], eb=$('rq-err');
      if(!qty||qty<=0){eb.textContent='추가 수량을 입력해 주세요.';$('rq-qty').focus();return;}
      if(qty%it.unit!==0){eb.textContent=it.name+'의 발주단위는 '+num(it.unit)+'입니다. '+num(it.unit)+'의 배수로 입력해 주세요.';$('rq-qty').focus();return;}
      if(!why){eb.textContent='사유를 적어 주세요.';$('rq-why').focus();return;}
      withLoading('요청 보내는 중...',()=>{S.reqs.unshift({id:'R-00'+(seqReq++),code,qty,reason:why,by:'영업팀',date:TODAY,status:'요청',reply:''});log('','영업팀','수량 협의 요청. '+code+' +'+num(qty));toast('발주 담당자에게 요청을 보냈습니다.');render();});return;}
    case 'saveMaster':
      withLoading('기준정보 저장 중...',()=>{
        document.querySelectorAll('[data-mf]').forEach(i=>{const v=Number(i.value);if(v>0)S.items[i.dataset.mf].factor=v;});
        document.querySelectorAll('[data-mm]').forEach(i=>{const v=Number(i.value);if(v>=0)S.items[i.dataset.mm].moq=v;});
        document.querySelectorAll('[data-mu]').forEach(i=>{const v=Number(i.value);if(v>0)S.items[i.dataset.mu].unit=v;});
        document.querySelectorAll('[data-wh]').forEach(i=>{S.whOn[Number(i.dataset.wh)]=i.checked;});
        log('','발주 담당자','기준정보 변경');toast('저장했습니다. 발주 점검 판정에 바로 반영됩니다.');render();});return;
    case 'reset': withLoading('예시 데이터 복원 중...',()=>{S=clone(SEED);UI.sel={};UI.open={};toast('예시 데이터로 되돌렸습니다.');render();});return;
  }
});
document.addEventListener('input',(e)=>{
  const i=e.target; if(!i.dataset) return;
  if(i.dataset.extra){const c=i.dataset.extra; S.extra[c]=i.value===''?0:Number(i.value); const j=judge(c);
    i.classList.toggle('invalid',!!j.err); $('exe-'+c).textContent=j.err; $('qt-'+c).textContent=num(j.qty); const am=$('am-'+c); if(am) am.textContent='USD '+usd(j.qty*S.items[c].cost);
    const cb=document.querySelector('[data-sel="'+c+'"]'); if(cb){cb.disabled=!!j.err; if(j.err){cb.checked=false;UI.sel[c]=false;}} return;}
});
document.addEventListener('change',(e)=>{
  const i=e.target;
  if(i.id==='roleSel'){UI.role=i.value;go(NAV[UI.role][1].k);return;}
  if(i.id==='ff'){UI.fFilter=i.value;render();return;}
  if(i.dataset&&i.dataset.sel){UI.sel[i.dataset.sel]=i.checked;return;}
  if(i.id==='okSend'){const b=$('regBtn'); if(b) b.disabled=!i.checked;return;}
});
document.addEventListener('keydown',(e)=>{if(e.key==='Escape'&&$('modalHost').innerHTML) closeModal();});
window.addEventListener('hashchange',route);
route();
})();
