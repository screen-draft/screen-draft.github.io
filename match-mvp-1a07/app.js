(function(){
"use strict";
const ic=(n)=>'<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-'+n+'"/></svg>';
const esc=(s)=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=(id)=>document.getElementById(id);
const clone=(o)=>JSON.parse(JSON.stringify(o));
const num=(n)=>Number(n).toLocaleString('ko-KR');

/* ===== 예시 회원 (이름은 가림 표기, 내용은 예시) ===== */
const SEED={
  users:{
    U1:{name:'박○○',title:'대표',org:'수제 소스 브랜드',ind:'식품 제조',contact:'카카오톡 ID park_sauce (예시)',
        have:[{t:'수제 소스 레시피와 생산 설비',d:'자체 공장, 소스 12종'},{t:'소량 OEM 생산',d:'월 2,000병까지'},{t:'온라인몰 판매 3년',d:'재구매 고객층 보유'}],
        want:[{t:'오프라인 유통 판로',d:'편의점, 대형마트'},{t:'시드 투자',d:'1~5억'},{t:'식품 인증 전문가',d:'HACCP 준비'}]},
    U2:{name:'정○○',title:'MD',org:'식품 유통사',ind:'유통',contact:'카카오톡 ID jung_md (예시)',
        have:[{t:'편의점·대형마트 MD 네트워크',d:'입점 제안 경로'},{t:'신규 브랜드 입점 경험',d:'연 10여 건'}],
        want:[{t:'온라인에서 검증된 소스·양념 브랜드',d:'신규 카테고리'},{t:'PB 생산이 가능한 제조사',d:'소량부터'}]},
    U3:{name:'최○○',title:'투자자',org:'개인 엔젤 투자',ind:'투자',contact:'카카오톡 ID choi_angel (예시)',
        have:[{t:'시드 투자',d:'1~5억'},{t:'식품 스타트업 투자 경험',d:'3건'}],
        want:[{t:'매출이 검증된 초기 식품 브랜드',d:'온라인 매출 기준'}]},
    U4:{name:'한○○',title:'컨설턴트',org:'식품 인증 컨설팅',ind:'전문직',contact:'카카오톡 ID han_cert (예시)',
        have:[{t:'HACCP 인증 컨설팅',d:'중소 제조사 위주'}],want:[{t:'신규 식품 제조 고객',d:'인증 준비 단계'}]},
    U5:{name:'오○○',title:'예비 창업자',org:'카페 창업 준비',ind:'외식',contact:'카카오톡 ID oh_cafe (예시)',
        have:[{t:'카페 매장 공간',d:'역세권 1층'}],want:[{t:'소스 납품처',d:'디저트용'}]},
    U6:{name:'윤○○',title:'대표',org:'물류 스타트업',ind:'물류',contact:'카카오톡 ID yoon_logi (예시)',
        have:[{t:'소량 풀필먼트',d:'월 500건부터'}],want:[{t:'초기 화주사',d:'식품, 생활용품'}]}
  },
  /* 추천: f = 박○○의 WANT와 상대 HAVE, b = 상대 WANT와 박○○의 HAVE */
  recs:[
    {a:'U1',b:'U2',f:92,r:88,basis:['WANT 오프라인 유통 판로','HAVE 편의점·대형마트 MD 네트워크'],why:'박○○님이 찾는 오프라인 판로(편의점, 대형마트)를 정○○님이 연결할 수 있습니다.',back:'정○○님이 찾는 온라인에서 검증된 소스 브랜드에 박○○님이 맞고, PB 소량 생산도 가능합니다.',st:'승인'},
    {a:'U1',b:'U3',f:85,r:78,basis:['WANT 시드 투자 1~5억','HAVE 시드 투자 1~5억'],why:'박○○님이 찾는 시드 투자 규모(1~5억)와 최○○님의 투자 범위가 겹칩니다.',back:'최○○님은 매출이 검증된 초기 식품 브랜드를 찾고 있고, 박○○님은 온라인 판매 3년 실적이 있습니다.',st:'승인'},
    {a:'U1',b:'U4',f:80,r:64,basis:['WANT 식품 인증 전문가','HAVE HACCP 인증 컨설팅'],why:'박○○님이 준비 중인 HACCP 인증을 한○○님이 컨설팅합니다.',back:'한○○님이 찾는 신규 제조 고객이지만, 인증 준비 단계인지는 확인이 필요합니다.',st:'대기'},
    {a:'U1',b:'U5',f:22,r:81,basis:['WANT 오프라인 유통 판로','HAVE 카페 매장 공간'],why:'오○○님은 소스 납품처를 찾지만, 박○○님이 찾는 것(판로, 투자)과는 거의 겹치지 않습니다.',back:'오○○님이 찾는 디저트용 소스 납품처에 박○○님이 맞습니다.',st:'보류'},
    {a:'U1',b:'U6',f:41,r:70,basis:['WANT 오프라인 유통 판로','HAVE 소량 풀필먼트'],why:'소량 풀필먼트는 판로가 넓어지면 필요해질 수 있으나 지금 찾는 것과는 거리가 있습니다.',back:'윤○○님이 찾는 식품 화주사에 박○○님이 맞습니다.',st:'대기'}
  ],
  conns:[{from:'U3',to:'U1',st:'요청',at:'10-04 18:20'}],
  metrics:{join:64,profile:51,shown:44,recApproved:170,req:38,mutual:13},
  onb:null,
  cfg:{apv:'each',autoMin:75,topK:10}
};
let S=clone(SEED);
/* 적합도: 한쪽만 맞으면 낮아지도록 두 방향의 기하평균을 쓴다 */
const fit=(x)=>Math.round(Math.sqrt(x.f*x.r));
const oneSided=(x)=>Math.min(x.f,x.r)<50;

/* ===== state & routing ===== */
const UI={role:'me',view:'recs',open:{},guideOpen:null,guideStep:null};
const VIEWS_USER=[['recs','추천','users'],['conn','연결 요청','inbox'],['prof','내 프로필','user']];
const VIEWS_ADMIN=[['review','AI 추천 검토'],['members','회원'],['metrics','운영 지표']];
function go(role,view){const h='#/'+role+'/'+view; if(location.hash===h) route(); else location.hash=h;}
function route(){
  const p=location.hash.replace(/^#\/?/,'').split('/');
  UI.role=['me','other','admin'].indexOf(p[0])>=0?p[0]:'me';
  const list=(UI.role==='admin'?VIEWS_ADMIN:VIEWS_USER).map(v=>v[0]);
  UI.view=list.indexOf(p[1])>=0?p[1]:list[0];
  if(Date.now()-(toast.at||0)>300) $('toastHost').innerHTML='';
  render(); window.scrollTo(0,0);
}
function toast(msg,kind){toast.at=Date.now();const h=$('toastHost');h.innerHTML='<div class="toast'+(kind==='bad'?' bad':'')+'" role="status">'+ic(kind==='bad'?'alert':'check')+'<span>'+esc(msg)+'</span></div>';clearTimeout(toast.t);toast.t=setTimeout(()=>{h.innerHTML='';},3200);}
let busy=false;
function withLoading(msg,fn,ms){if(busy)return;busy=true;$('overlayHost').innerHTML='<div class="overlay" role="status" aria-live="assertive"><div class="ob"><span class="spin" aria-hidden="true"></span><span>'+esc(msg)+'</span></div></div>';setTimeout(()=>{$('overlayHost').innerHTML='';busy=false;fn();},ms||480);}
const st=(t,k)=>'<span class="st '+k+'">'+esc(t)+'</span>';
const empty=(i,t,d,b)=>'<div class="empty">'+ic(i)+'<strong>'+esc(t)+'</strong><p>'+esc(d)+'</p>'+(b||'')+'</div>';
const btn=(o)=>'<button type="button" class="btn '+(o.cls||'')+'" '+(o.attrs||'')+'>'+(o.icon?ic(o.icon):'')+esc(o.label)+'</button>';
const meId=()=>UI.role==='other'?'U2':'U1';
const U=(id)=>S.users[id];

/* ===== 회원: 추천 ===== */
function pairFor(me,other){return S.recs.find(x=>(x.a===me&&x.b===other)||(x.a===other&&x.b===me));}
function connOf(a,b){return S.conns.find(c=>(c.from===a&&c.to===b)||(c.from===b&&c.to===a));}
function viewRecs(){
  const me=meId();
  /* 관리자가 승인한 추천만 보인다 */
  const list=S.recs.filter(x=>x.st==='승인'&&(x.a===me||x.b===me)).map(x=>({x,other:x.a===me?x.b:x.a})).sort((p,q)=>fit(q.x)-fit(p.x));
  if(!list.length) return '<h1 class="pt">추천</h1>'+empty('users','아직 보여 드릴 추천이 없습니다','AI가 찾은 후보는 운영자 확인을 거쳐 이곳에 나타납니다.');
  const rows=list.map(({x,other})=>{
    const o=U(other), mine=x.a===me, f=mine?x.f:x.r, r=mine?x.r:x.f, c=connOf(me,other);
    const conn=!c?btn({cls:'pri',icon:'send',label:'연결 요청',attrs:'data-req="'+other+'"'}):c.st==='수락'?st('서로 연결됨','ok'):c.from===me?st('요청 보냄, 응답 대기','info'):btn({cls:'pri',icon:'check',label:'받은 요청 수락하기',attrs:'data-go2="conn"'});
    return '<article class="rec"><div class="hd2"><div><div class="nm">'+esc(o.name)+' <span class="role2">'+esc(o.title)+'</span></div><div class="role2">'+esc(o.org)+' / '+esc(o.ind)+'</div></div><div class="score">'+fit(x)+'<small>적합도</small></div></div>'+
      '<div class="fit" aria-label="양방향 적합도"><span>내가 찾는 것</span><span class="bar2"><i style="width:'+f+'%"></i></span><b>'+f+'</b><span>상대가 찾는 것</span><span class="bar2"><i class="b" style="width:'+r+'%"></i></span><b>'+r+'</b></div>'+
      '<p class="why2">'+esc(mine?x.why:x.back)+'</p><p class="why2">'+esc(mine?x.back:x.why)+'</p>'+
      (UI.open[other]?'<div class="hw"><h3><span class="k H">HAVE</span><span class="small">'+esc(o.name)+'님이 가진 것</span></h3><ul>'+o.have.map(h=>'<li><span class="tx">'+esc(h.t)+'<small>'+esc(h.d)+'</small></span></li>').join('')+'</ul></div><div class="hw"><h3><span class="k W">WANT</span><span class="small">'+esc(o.name)+'님이 찾는 것</span></h3><ul>'+o.want.map(h=>'<li><span class="tx">'+esc(h.t)+'<small>'+esc(h.d)+'</small></span></li>').join('')+'</ul></div>':'')+
      (c&&c.st==='수락'?'<div class="lock open2">'+ic('unlock')+'연락처 '+esc(o.contact)+'</div>':'<div class="lock">'+ic('lock')+'연락처와 회사명 상세는 서로 수락한 뒤에 공개됩니다.</div>')+
      '<div class="acts" style="justify-content:space-between"><button type="button" class="btn link" data-open="'+other+'">'+(UI.open[other]?'프로필 접기':'프로필 자세히')+'</button>'+conn+'</div></article>';
  }).join('');
  return '<h1 class="pt">추천</h1><p class="sub2">내가 찾는 것과 상대가 찾는 것을 양쪽 모두 봅니다. 한쪽만 맞는 추천은 아래로 내려가거나 운영자가 보류합니다.</p>'+rows;
}

/* ===== 회원: 연결 요청 ===== */
function viewConn(){
  const me=meId();
  const got=S.conns.filter(c=>c.to===me), sent=S.conns.filter(c=>c.from===me);
  const card=(c,inbound)=>{const other=inbound?c.from:c.to, o=U(other), p=pairFor(me,other);
    return '<article class="rec"><div class="hd2"><div><div class="nm">'+esc(o.name)+' <span class="role2">'+esc(o.title)+'</span></div><div class="role2">'+esc(o.org)+'</div></div>'+(p?'<div class="score">'+fit(p)+'<small>적합도</small></div>':'')+'</div>'+
      (p?'<p class="why2">'+esc(p.a===me?p.why:p.back)+'</p>':'')+
      (c.st==='수락'?'<div class="lock open2">'+ic('unlock')+'연락처 '+esc(o.contact)+'</div>':'<div class="lock">'+ic('lock')+'서로 수락하면 연락처가 공개됩니다.</div>')+
      '<div class="acts">'+(inbound&&c.st==='요청'?btn({icon:'x',label:'거절',attrs:'data-deny="'+other+'"'})+btn({cls:'pri',icon:'check',label:'수락',attrs:'data-accept="'+other+'"'}):st(c.st==='수락'?'서로 연결됨':c.st==='거절'?'거절됨':'응답 대기',c.st==='수락'?'ok':c.st==='거절'?'mute':'info'))+'</div>'+
      '<div class="small">'+esc(c.at)+'</div></article>';};
  return '<h1 class="pt">연결 요청</h1><p class="sub2">요청을 받은 쪽이 수락해야 연결됩니다. 거절은 상대에게 사유 없이 거절됨으로만 표시됩니다.</p>'+
    '<h2 class="sh">받은 요청 <span class="meta">'+got.length+'건</span></h2>'+(got.length?got.map(c=>card(c,true)).join(''):empty('inbox','받은 요청이 없습니다','추천에 오른 상대가 연결을 요청하면 여기에 나타납니다.'))+
    '<h2 class="sh">보낸 요청 <span class="meta">'+sent.length+'건</span></h2>'+(sent.length?sent.map(c=>card(c,false)).join(''):empty('send','보낸 요청이 없습니다','추천 화면에서 마음에 드는 상대에게 연결을 요청해 보세요.',btn({label:'추천 보기',attrs:'data-go2="recs"'})));
}

/* ===== 회원: 내 프로필 + AI 온보딩 대화 ===== */
const Q1=['1억 미만','1~5억','5억 이상'], Q2=['3개월 안','6개월 안','1년 안'];
function viewProf(){
  const me=meId(), u=U(me);
  if(me!=='U1') return '<h1 class="pt">내 프로필</h1><p class="sub2">'+esc(u.name)+' '+esc(u.title)+' / '+esc(u.org)+'</p>'+hwBlock(u,false);
  const o=S.onb;
  let chat='';
  if(o){
    chat='<div class="chat" aria-live="polite">'+o.msgs.map(m=>'<div class="bub'+(m.me?' me':'')+'"><span class="who">'+(m.me?'나':'AI 도우미')+'</span>'+esc(m.t)+'</div>').join('')+'</div>';
    if(o.step===0) chat+='<form class="composer" data-onb="1"><label class="sr" for="onbIn">하는 일과 필요한 것</label><textarea id="onbIn" rows="4">'+esc(o.draft)+'</textarea>'+btn({cls:'pri',icon:'send',label:'보내기',attrs:'data-act="onbSend"'})+'</form>';
    if(o.step===1) chat+='<div class="chips" style="margin-top:8px">'+Q1.map(q=>btn({label:q,attrs:'data-a1="'+q+'"'})).join('')+'</div>';
    if(o.step===2) chat+='<div class="chips" style="margin-top:8px">'+Q2.map(q=>btn({label:q,attrs:'data-a2="'+q+'"'})).join('')+'</div>';
    if(o.step===3) chat+=hwBlock({have:o.have,want:o.want},true)+'<div class="acts">'+btn({icon:'x',label:'취소',attrs:'data-act="onbCancel"'})+btn({cls:'pri',icon:'check',label:'이대로 확정',attrs:'data-act="onbSave"'})+'</div>';
    return '<h1 class="pt">AI와 프로필 정리하기</h1><p class="sub2">하는 일과 지금 필요한 것을 말하듯 적으면, AI가 몇 가지를 더 묻고 HAVE와 WANT로 나눠 정리합니다.</p>'+chat;
  }
  return '<h1 class="pt">내 프로필</h1><p class="sub2">'+esc(u.name)+' '+esc(u.title)+' / '+esc(u.org)+'. 추천은 아래 HAVE와 WANT로 계산합니다.</p>'+
    hwBlock(u,false)+'<div class="acts">'+btn({cls:'pri',icon:'chat',label:'AI와 다시 정리하기',attrs:'data-act="onbStart"'})+'</div>';
}
function hwBlock(u,edit){
  const li=(arr,k)=>arr.map((h,i)=>'<li>'+(edit?'<span class="tx"><label class="sr" for="hw-'+k+i+'">'+k+' '+(i+1)+'</label><input class="f" id="hw-'+k+i+'" data-hw="'+k+'|'+i+'" value="'+esc(h.t)+'"><small>'+esc(h.d)+'</small></span><button type="button" class="btn sm icon-m" data-del="'+k+'|'+i+'" aria-label="삭제" data-tip="삭제">'+ic('trash')+'<span class="lbl">삭제</span></button>':'<span class="tx">'+esc(h.t)+'<small>'+esc(h.d)+'</small></span>')+'</li>').join('');
  return '<div class="hw"><h3><span class="k H">HAVE</span><span class="small">내가 가진 것, 줄 수 있는 것</span></h3><ul>'+li(u.have,'have')+'</ul></div>'+
    '<div class="hw"><h3><span class="k W">WANT</span><span class="small">지금 필요한 것</span></h3><ul>'+li(u.want,'want')+'</ul></div>'+
    (edit?'<p class="small" style="margin:6px 0 0">AI가 정리한 결과입니다. 틀린 곳은 고치거나 지운 뒤 확정합니다.</p>':'');
}

/* ===== 관리자 ===== */
function viewReview(){
  const rows=S.recs.map((x,i)=>{const a=U(x.a),b=U(x.b);
    return '<tr><td style="white-space:nowrap"><b>'+esc(a.name)+'</b> &rarr; <b>'+esc(b.name)+'</b><div class="small">'+esc(b.org)+'</div></td><td class="r num"><b>'+fit(x)+'</b></td><td class="r num">'+x.f+'</td><td class="r num">'+x.r+'</td>'+
      '<td style="min-width:260px"><div style="font-size:13px">'+esc(x.why)+'</div><div class="small" style="margin-top:2px">근거: '+esc(x.basis.join(' / '))+' '+st('회원 입력에 있음','ok')+'</div><div class="small" style="margin-top:2px">'+esc(x.back)+'</div>'+(oneSided(x)?'<div style="margin-top:4px">'+st('한쪽만 맞음','warn')+'</div>':'')+'</td>'+
      '<td>'+st(x.st,x.st==='승인'?'ok':x.st==='보류'?'warn':x.st==='거절'?'bad':'mute')+'</td>'+
      '<td><div class="rvacts">'+(x.st!=='승인'?btn({cls:'sm pri',label:'승인',attrs:'data-rv="'+i+'|승인"'}):'')+(x.st!=='보류'?btn({cls:'sm',label:'보류',attrs:'data-rv="'+i+'|보류"'}):'')+(x.st!=='거절'?btn({cls:'sm',label:'거절',attrs:'data-rv="'+i+'|거절"'}):'')+'</div></td></tr>';}).join('');
  return '<h1 class="pt">AI 추천 검토</h1><p class="sub2">AI가 찾은 후보를 운영자가 확인합니다. 승인한 건만 회원에게 보입니다. 앞 숫자는 박○○님이 찾는 것과 상대가 가진 것, 뒤 숫자는 그 반대입니다.</p>'+
    '<div class="tw"><table class="t" style="min-width:820px"><thead><tr><th>추천</th><th class="r">적합도</th><th class="r">찾는 것</th><th class="r">상대가 찾는 것</th><th>추천 이유 (AI 생성)</th><th>상태</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
    '<h2 class="sh">매칭 기준 설정 <span class="meta">코드가 아니라 이 화면에서 바꿉니다</span></h2>'+
    '<div class="tw"><table class="t"><tbody>'+
    '<tr><th style="width:200px">승인 방식</th><td><label class="chk"><input type="radio" name="apv" value="each"'+(S.cfg.apv==='each'?' checked':'')+'>추천마다 승인</label> &nbsp; <label class="chk"><input type="radio" name="apv" value="auto"'+(S.cfg.apv==='auto'?' checked':'')+'>적합도 <input class="f qty" style="width:70px" type="number" id="autoMin" min="0" max="100" value="'+S.cfg.autoMin+'" aria-label="자동 승인 기준 점수"> 이상은 자동 노출</label></td></tr>'+
    '<tr><th>후보 수</th><td>임베딩으로 회원마다 상위 '+S.cfg.topK+'명을 추린 뒤 AI가 평가합니다</td></tr>'+
    '<tr><th>적합도 계산</th><td>두 방향 점수의 기하평균. 한쪽만 맞으면 낮게 나옵니다</td></tr>'+
    '</tbody></table></div><div class="acts">'+btn({cls:'pri',icon:'check',label:'설정 저장',attrs:'data-act="cfgSave"'})+'</div>'+
    '<p class="note">'+ic('alert')+'승인 방식은 미팅에서 정할 사항입니다. 추천마다 승인하면 초기에는 운영자가 매일 확인해야 하고, 자동 노출로 바꾸면 기준 점수만 관리하면 됩니다.</p>';
}
function viewMembers(){
  return '<h1 class="pt">회원</h1><p class="sub2">회원별 프로필과 HAVE, WANT 등록 현황입니다.</p><div class="tw"><table class="t" style="min-width:720px"><thead><tr><th>회원</th><th>업종</th><th class="r">HAVE</th><th class="r">WANT</th><th>프로필</th><th>받은 추천 (승인)</th></tr></thead><tbody>'+
    Object.keys(S.users).map(k=>{const u=U(k);const n=S.recs.filter(x=>(x.a===k||x.b===k)&&x.st==='승인').length;return '<tr><td><b>'+esc(u.name)+'</b> '+esc(u.title)+'<div class="small">'+esc(u.org)+'</div></td><td>'+esc(u.ind)+'</td><td class="r num">'+u.have.length+'</td><td class="r num">'+u.want.length+'</td><td>'+st('완성','ok')+'</td><td class="r num">'+n+'</td></tr>';}).join('')+'</tbody></table></div>';
}
function viewMetrics(){
  const m=S.metrics; const reqRate=m.req/m.recApproved*100, mutRate=m.mutual/m.req*100;
  const row=(k,v,base,crit,ok)=>'<div class="frow"><span>'+k+'</span><span class="bar2"><i style="width:'+Math.min(100,v/m.join*100)+'%"></i></span><b>'+num(v)+'</b><span class="crit small">'+(crit?st(crit,ok?'ok':'warn'):base||'')+'</span></div>';
  return '<h1 class="pt">운영 지표</h1><p class="sub2">1차 검증은 추천이 실제 연결 요청과 양측 수락으로 이어지는지 보는 것입니다. 기준은 제안서에 적은 값이며 미팅에서 함께 정합니다.</p>'+
    '<div class="funnel">'+row('가입',m.join,'회원 수')+row('프로필 완성',m.profile,Math.round(m.profile/m.join*100)+'%')+row('추천 받은 회원',m.shown,'승인 추천 '+num(m.recApproved)+'건')+row('연결 요청',m.req,'',
      '요청률 '+reqRate.toFixed(1)+'% (기준 20%)',reqRate>=20)+row('상호 수락',m.mutual,'','수락률 '+mutRate.toFixed(1)+'% (기준 30%)',mutRate>=30)+'</div>'+
    '<p class="note">'+ic('chart')+'요청률 = 연결 요청 / 승인된 추천, 수락률 = 상호 수락 / 연결 요청. 수치는 예시이며, 시연에서 요청과 수락을 누르면 함께 바뀝니다.</p>';
}

/* ===== guide ===== */
const GUIDE=[
  {t:'AI 온보딩 대화',d:'말하듯 적으면 AI가 더 묻고 HAVE, WANT로 정리합니다.',run:()=>{S.onb=null;startOnb();go('me','prof');}},
  {t:'양방향 추천과 이유',d:'내가 찾는 것과 상대가 찾는 것을 모두 봅니다.',run:()=>go('me','recs')},
  {t:'연결 요청 보내기',d:'추천 상대에게 요청합니다. 연락처는 아직 비공개입니다.',run:()=>{UI.open={U2:true};go('me','recs');}},
  {t:'상대가 수락, 연락처 공개',d:'정○○ 화면에서 수락하면 양쪽에 연락처가 열립니다.',run:()=>{if(!connOf('U1','U2'))S.conns.push({from:'U1',to:'U2',st:'요청',at:'10-05 10:12'});go('other','conn');}},
  {t:'관리자 추천 검토',d:'승인한 추천만 회원에게 보입니다.',run:()=>go('admin','review')},
  {t:'1차 검증 지표',d:'추천에서 요청, 요청에서 수락으로 이어지는 비율입니다.',run:()=>go('admin','metrics')}
];
function renderGuide(){
  const g=$('guide');
  if(UI.guideOpen===null) UI.guideOpen=window.matchMedia('(min-width:1101px)').matches;
  g.className='guide'+(UI.guideOpen?'':' closed');
  document.body.classList.toggle('guide-open',!!UI.guideOpen&&UI.role==='admin');
  g.innerHTML='<button type="button" class="gh" data-act="toggleGuide" aria-expanded="'+UI.guideOpen+'" aria-controls="guideList"><span>시연 안내</span>'+ic(UI.guideOpen?'down':'up')+'</button>'+
    '<ol id="guideList">'+GUIDE.map((s,i)=>'<li><button type="button" data-guide="'+i+'"'+(UI.guideStep===i?' aria-current="step"':'')+'><b><span class="n">'+(i+1)+'.</span>'+s.t+'</b>'+(UI.guideStep===i?'<span class="d">'+s.d+'</span>':'')+'</button></li>').join('')+'</ol>';
}

/* ===== render ===== */
function render(){
  $('roleSel').value=UI.role;
  let h;
  if(UI.role==='admin'){
    h='<div class="admin"><nav class="tabs2" aria-label="관리자 메뉴">'+VIEWS_ADMIN.map(v=>'<a href="#/admin/'+v[0]+'"'+(UI.view===v[0]?' aria-current="page"':'')+'>'+v[1]+'</a>').join('')+'</nav><main id="main" tabindex="-1">'+({review:viewReview,members:viewMembers,metrics:viewMetrics}[UI.view])()+'</main></div>';
  } else {
    const me=meId(); const inbound=S.conns.filter(c=>c.to===me&&c.st==='요청').length;
    h='<div class="app"><main id="main" tabindex="-1">'+({recs:viewRecs,conn:viewConn,prof:viewProf}[UI.view])()+'</main>'+
      '<nav class="tabbar" aria-label="회원 메뉴">'+VIEWS_USER.map(v=>'<a href="#/'+UI.role+'/'+v[0]+'"'+(UI.view===v[0]?' aria-current="page"':'')+'>'+ic(v[2])+v[1]+(v[0]==='conn'&&inbound?'<span class="badge" aria-label="새 요청 '+inbound+'건">'+inbound+'</span>':'')+'</a>').join('')+'</nav></div>';
  }
  $('root').innerHTML=h+'<footer class="foot">시연용 예시입니다. 회원과 수치는 가상이며, 실제 AI API는 호출하지 않습니다.</footer>';
  renderGuide();
}

/* ===== 온보딩 흐름 (AI 응답은 예시로 흉내 냄) ===== */
function startOnb(){S.onb={step:0,draft:'수제 소스 브랜드를 3년째 하고 있어요. 온라인몰에서는 잘 팔리는데 오프라인 판로가 없고, 생산을 늘리려면 투자가 필요합니다. 소량 OEM 생산도 받을 수 있어요.',msgs:[{me:false,t:'어떤 일을 하시는지, 지금 가장 필요한 것이 무엇인지 말하듯 편하게 적어 주세요.'}],have:[],want:[]};}

document.addEventListener('click',(e)=>{
  const t=e.target.closest('button'); if(!t) return; const d=t.dataset;
  if(d.guide!=null){const i=Number(d.guide);UI.guideStep=i;if(window.matchMedia('(max-width:1100px)').matches)UI.guideOpen=false;GUIDE[i].run();return;}
  if(d.go2){go(UI.role,d.go2);return;}
  if(d.open){UI.open[d.open]=!UI.open[d.open];render();return;}
  if(d.req){const me=meId(),o=U(d.req);withLoading('연결 요청 보내는 중...',()=>{S.conns.push({from:me,to:d.req,st:'요청',at:'10-05 10:12'});S.metrics.req++;toast(o.name+'님에게 연결을 요청했습니다. 수락하면 연락처가 공개됩니다.');render();});return;}
  if(d.accept||d.deny){const me=meId(),other=d.accept||d.deny,c=S.conns.find(x=>x.from===other&&x.to===me);
    withLoading(d.accept?'수락 처리 중...':'거절 처리 중...',()=>{c.st=d.accept?'수락':'거절';if(d.accept)S.metrics.mutual++;toast(d.accept?U(other).name+'님과 연결되었습니다. 서로의 연락처가 공개됩니다.':'요청을 거절했습니다.');render();});return;}
  if(d.rv){const [i,v]=d.rv.split('|');const x=S.recs[Number(i)];withLoading('검토 결과 저장 중...',()=>{const was=x.st;x.st=v;if(v==='승인'&&was!=='승인')S.metrics.recApproved++;if(was==='승인'&&v!=='승인')S.metrics.recApproved--;toast(U(x.b).name+' 추천을 '+v+'했습니다.'+(v==='승인'?' 이제 회원 화면에 보입니다.':' 회원에게는 보이지 않습니다.'));render();});return;}
  if(d.a1){const o=S.onb;o.msgs.push({me:true,t:d.a1});o.a1=d.a1;withLoading('AI가 답을 정리하는 중...',()=>{o.msgs.push({me:false,t:'투자와 판로는 언제까지 필요하신가요? 시점이 있어야 지금 움직일 수 있는 상대를 먼저 추천할 수 있습니다.'});o.step=2;render();});return;}
  if(d.a2){const o=S.onb;o.msgs.push({me:true,t:d.a2});
    withLoading('HAVE와 WANT로 정리하는 중...',()=>{o.have=[{t:'수제 소스 레시피와 생산 설비',d:'대화에서 추출'},{t:'소량 OEM 생산',d:'대화에서 추출'},{t:'온라인몰 판매 3년',d:'대화에서 추출'}];
      o.want=[{t:'오프라인 유통 판로',d:'편의점, 대형마트 / '+d.a2},{t:'시드 투자',d:o.a1+' / '+d.a2}];
      o.msgs.push({me:false,t:'이렇게 정리해 봤습니다. 맞는지 확인하고 틀린 곳은 고쳐 주세요. 식품 인증처럼 더 필요한 것이 있으면 나중에 추가할 수 있습니다.'});o.step=3;render();},700);return;}
  if(d.del){const [k,i]=d.del.split('|');S.onb[k].splice(Number(i),1);render();return;}
  switch(d.act){
    case 'toggleGuide': UI.guideOpen=!UI.guideOpen; renderGuide(); return;
    case 'onbStart': startOnb(); render(); return;
    case 'cfgSave':{const v=(document.querySelector('input[name="apv"]:checked')||{}).value||'each';const n=Number($('autoMin').value);
      if(v==='auto'&&(!(n>=0)||n>100)){toast('기준 점수는 0에서 100 사이로 적어 주세요.','bad');return;}
      withLoading('설정 저장 중...',()=>{S.cfg.apv=v;S.cfg.autoMin=n;let k=0;
        if(v==='auto'){S.recs.forEach(x=>{if(x.st==='대기'&&fit(x)>=n){x.st='승인';S.metrics.recApproved++;k++;}});}
        toast(v==='auto'?'자동 노출로 바꿨습니다. 기준 이상 대기 건 '+k+'건이 승인되었습니다.':'추천마다 승인하도록 바꿨습니다.');render();});return;}
    case 'onbCancel': S.onb=null; render(); return;
    case 'onbSend':{const v=$('onbIn').value.trim(); if(v.length<10){toast('조금만 더 자세히 적어 주세요.','bad');$('onbIn').focus();return;}
      const o=S.onb;o.msgs.push({me:true,t:v});o.draft='';
      withLoading('AI가 내용을 읽는 중...',()=>{o.msgs.push({me:false,t:'잘 읽었습니다. 두 가지만 더 여쭤볼게요. 투자는 어느 정도 규모를 생각하고 계신가요?'});o.step=1;render();},700);return;}
    case 'onbSave':{const o=S.onb;
      document.querySelectorAll('[data-hw]').forEach(i=>{const [k,n]=i.dataset.hw.split('|');if(o[k][Number(n)])o[k][Number(n)].t=i.value.trim()||o[k][Number(n)].t;});
      if(!o.have.length||!o.want.length){toast('HAVE와 WANT를 하나 이상 남겨 주세요.','bad');return;}
      withLoading('프로필에 저장하는 중...',()=>{const u=U('U1');u.have=o.have;u.want=o.want.concat(u.want.filter(w=>w.t==='식품 인증 전문가'));S.onb=null;toast('HAVE와 WANT를 확정했습니다. 추천은 이 내용으로 다시 계산됩니다.');render();});return;}
  }
});
document.addEventListener('change',(e)=>{if(e.target.id==='roleSel'){go(e.target.value,e.target.value==='admin'?'review':'recs');}});
window.addEventListener('hashchange',route);
route();
})();
