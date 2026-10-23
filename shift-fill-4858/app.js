(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s);};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
var ic=function(n,c){return '<svg class="i'+(c?' '+c:'')+'" aria-hidden="true"><use href="#i-'+n+'"/></svg>';};
var mask=function(n){n=String(n).trim();return n?n.charAt(0)+'○○':'';};
var DOW='일월화수목금토';
var T0=new Date();T0.setHours(0,0,0,0);
var day=function(o){var d=new Date(T0);d.setDate(d.getDate()+o);return d;};
var md=function(o){var d=day(o);return (d.getMonth()+1)+'.'+String(d.getDate()).padStart(2,'0');};
var dlabel=function(o){return md(o)+'('+DOW[day(o).getDay()]+')';};
var rel=function(o){return o===0?'오늘':o===1?'내일':o===-1?'어제':'';};
var ago=function(t){var m=Math.round((Date.now()-t)/60000);return m<1?'방금':m<60?m+'분 전':Math.floor(m/60)+'시간 전';};
var hm=function(t){var d=new Date(t);return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');};
var mins=function(s){var p=s.split(':');return +p[0]*60+ +p[1];};
var TIMES=[];for(var h=6;h<24;h++){TIMES.push(String(h).padStart(2,'0')+':00');TIMES.push(String(h).padStart(2,'0')+':30');}
var SECS=['홀','주방','계산','세척','포장'];
var BRK=[[0,'없음'],[30,'30분'],[60,'60분'],[90,'90분']];

/* ---------- data ---------- */
var STORES=['가람점','나루점','다솜점','라온점','마루점','보람점','새솔점','아름점','여울점','이음점','지음점','한결점',
 '가온점','늘봄점','단비점','모아점','미리내점','별빛점','소담점','슬기점','온새점','윤슬점','은솔점','하늬점',
 '고운점','누리점','도담점','로운점','바름점','비솔점','시원점','아라점','초롱점','푸름점','해솔점'];
var region=function(i){return i<12?1:i<24?2:3;};
var ME_STORE='가람점';
var SUR='김이박최정강조윤장임한오서신권황';
var W=[];var AGES=['20대','30대','40대','50대'];
(function(){var ph=['4821','7305','2916','6044','1573','8237','3460','9152','5718','2689','7431','6295','3807','4562','8913','1376','5249','9604'];
 var sec=[['홀','계산'],['주방'],['홀'],['주방','세척'],['계산','포장'],['홀','주방'],['세척'],['홀','포장'],['주방'],['홀','계산'],['포장'],['홀'],['주방','세척'],['계산'],['홀','주방'],['세척','포장'],['홀'],['주방']];
 for(var i=0;i<18;i++)W.push({id:'W'+(311+i),n:SUR.charAt(i%SUR.length)+'○○',age:AGES[i%4],secs:sec[i],store:STORES[i%12],last:-(i%6)-1,ph:ph[i],exp:i%3!==2});})();
var wk=function(i){var w=W[i];return {n:w.n,age:w.age,ph:w.ph,exp:w.exp,wid:w.id};};
var now=Date.now();
var R=[];
function mk(id,store,d,sec,st,en,br,need,ws,seen,minAgo){R.push({id:id,store:store,d:d,sec:sec,st:st,en:en,br:br,need:need,workers:ws,seen:seen,chg:null,partners:[],at:now-minAgo*60000,src:'seed'});}
mk(2301,'가람점',0,'홀','10:00','15:00',60,2,[wk(0),wk(2)],true,1460);
mk(2302,'가람점',0,'주방','17:00','22:00',60,3,[wk(1)],true,1320);
mk(2303,'가람점',1,'홀','11:00','16:00',60,2,[],true,610);
mk(2304,'가람점',1,'계산','18:00','23:00',30,1,[wk(4)],true,580);
mk(2305,'가람점',3,'주방','10:00','15:00',60,2,[],true,300);
mk(2306,'가람점',4,'홀','17:00','22:00',60,4,[wk(5),wk(11)],true,240);
mk(2307,'나루점',0,'주방','09:00','14:00',60,2,[wk(8),wk(3)],true,1500);
mk(2308,'다솜점',1,'홀','17:00','22:00',60,3,[wk(9)],true,720);
mk(2309,'라온점',1,'세척','18:00','23:00',30,1,[],true,520);
mk(2310,'마루점',2,'홀','11:00','16:00',60,2,[wk(16)],true,410);
mk(2311,'보람점',2,'계산','10:00','15:00',60,1,[wk(13)],true,380);
mk(2312,'새솔점',3,'주방','17:00','22:00',60,2,[],false,95);
mk(2313,'아름점',5,'홀','11:00','16:00',60,3,[],false,42);
mk(2314,'여울점',-1,'홀','17:00','22:00',60,2,[wk(7),wk(12)],true,2900);
var nextId=2315;
var filled=function(r){return r.workers.length;};
var short=function(r){return Math.max(0,r.need-filled(r));};
function status(r){if(filled(r)>=r.need)return ['확정','ok'];if(!r.seen)return ['요청','rq'];if(r.d<=1)return ['미충원','bad'];return ['진행','pg'];}
var lbl=function(r){var s=status(r);return '<span class="lb '+s[1]+'">'+s[0]+'</span>'+(r.chg?' <span class="lb ch">변경 요청</span>':'');};
var byId=function(id){return R.filter(function(r){return r.id===+id;})[0];};

var CHAT={rooms:[{id:'all',name:'운영팀 전체',mem:6},{id:'r1',name:'1권역 담당',mem:3},{id:'nt',name:'야간 대응',mem:4}],msgs:{
 all:[{who:'한○○',t:now-180*60000,txt:'이번 주 금요일 저녁 섹션 요청이 몰립니다. 확정 등록은 당일 오전까지 부탁드립니다.',ur:0},
      {who:'이○○',t:now-95*60000,tag:'지각',txt:'나루점 강○○ 20분 늦는다고 연락 왔습니다. 매장에는 전달했습니다.',ur:0},
      {who:'최○○',t:now-40*60000,txt:'다솜점 홀 17시 1명 아직 부족합니다. 가능한 분 있으면 알려 주세요.',ur:0},
      {who:'박○○',me:1,t:now-31*60000,txt:'1권역 근무자 DB에서 두 분께 문자 보내 두었습니다.',ur:0}],
 r1:[{who:'윤○○',t:now-300*60000,txt:'가람점 주방 확정 1명 등록했습니다.',ur:0}],
 nt:[{who:'정○○',t:now-600*60000,tag:'조퇴',txt:'한결점 임○○ 21시 조퇴 처리했습니다.',ur:0}]}};
var unread={all:2,r1:0,nt:1};
var STAFF=[{n:'박○○',role:'1권역 담당',scope:[1],me:1},{n:'윤○○',role:'1권역 보조',scope:[1]},{n:'최○○',role:'2권역 담당',scope:[2]},{n:'이○○',role:'3권역 담당',scope:[3]},{n:'정○○',role:'야간 대응',scope:[1,2,3]},{n:'한○○',role:'총괄 관리자',scope:[1,2,3]}];
var SMSLOG=[{t:now-31*60000,cnt:2,type:'SMS',txt:'[채움반] 10월 근무 가능 일정 회신 부탁드립니다.'}];

var myScope=function(){return STAFF[0].scope;};
var inScope=function(r){return myScope().indexOf(region(STORES.indexOf(r.store)))>=0;};

/* ---------- ui state ---------- */
var S={side:'store',
 st:{view:'home',sheet:null,flash:null,rfilter:'week'},
 form:{d:2,sec:null,st:'17:00',en:'22:00',br:60,need:2,memo:'',err:{}},
 pf:{rid:null,name:'',ph:'',rel:'지인',err:{}},
 f:{view:'list',filter:'all',id:null,banner:null,flash:null,entries:[],aggStore:'all',upload:null,wq:'',wstore:'all',sel:{},sms:{tpl:0,txt:''},dlg:null,room:'all',tag:null,tagStore:'가람점',tagW:'',draft:'',acct:'store',scopeEdit:null},
 step:0};
var busy={};

/* ---------- toast ---------- */
function toast(msg,bad){var h=$('#toastHost');var el=document.createElement('div');el.className='toast'+(bad?' bad':'');el.innerHTML=ic(bad?'alert':'check')+'<span>'+esc(msg)+'</span>';h.appendChild(el);setTimeout(function(){el.remove();},3200);}
function work(key,ms,fn){if(busy[key])return;busy[key]=1;render();setTimeout(function(){busy[key]=0;fn();render();},ms);}
var bbtn=function(key,label,cls,attrs){return busy[key]?'<button class="btn '+(cls||'')+'" aria-busy="true" disabled><span class="spin"></span>'+label[1]+'</button>':'<button class="btn '+(cls||'')+'" '+attrs+'>'+label[0]+'</button>';};

/* ============ STORE ============ */
function storeReqs(){return R.filter(function(r){return r.store===ME_STORE;}).sort(function(a,b){return a.d-b.d||mins(a.st)-mins(b.st);});}
function rowS(r){var f=filled(r),sh=short(r),pct=Math.round(f/r.need*100);
 return '<li><button class="rw'+(sh&&r.d<=1?' short':'')+(S.st.flash===r.id?' flash':'')+'" data-a="sDetail" data-id="'+r.id+'">'+
  '<span class="dt">'+(rel(r.d)||md(r.d))+'<small>'+(rel(r.d)?md(r.d):DOW[day(r.d).getDay()]+'요일')+'</small></span>'+
  '<span class="mid"><b>'+esc(r.sec)+'</b> '+lbl(r)+'<span class="t">'+r.st+'–'+r.en+' · 휴게 '+r.br+'분</span></span>'+
  '<span class="rt"><span class="cnt'+(sh?' bad':'')+'">'+f+' / '+r.need+'명</span>'+(sh?'부족 '+sh+'명':'충원 완료')+'</span>'+
  '<span class="bar'+(sh?'':' full')+'" aria-hidden="true"><i style="width:'+pct+'%"></i></span></button></li>';}
function vHome(){var rs=storeReqs().filter(function(r){return r.d>=0;});
 var need=0,got=0;rs.forEach(function(r){need+=r.need;got+=filled(r);});
 var urgent=rs.filter(function(r){return r.d<=1&&short(r);});
 var today=rs.filter(function(r){return r.d===0;}),week=rs.filter(function(r){return r.d>0;});
 return '<div class="sum"><div><span class="k">이번 주 요청</span><span class="big">'+need+'<small>명</small></span></div><div><span class="k">채용 확정</span><span class="big">'+got+'<small>명</small></span></div><div class="'+(need-got?'bad':'')+'"><span class="k">부족</span><span class="big">'+(need-got)+'<small>명</small></span></div></div>'+
  (urgent.length?'<div class="alert">'+ic('alert')+'<span>오늘·내일 근무 중 '+urgent.length+'건이 아직 부족합니다. 지인 등록이나 인원 변경 요청을 할 수 있습니다.</span></div>':'')+
  '<div class="sec"><h3>오늘 '+dlabel(0)+'</h3><span class="m">'+today.length+'건</span></div><ul class="rows">'+today.map(rowS).join('')+'</ul>'+
  '<div class="sec"><h3>이번 주</h3><span class="m">'+week.length+'건</span></div>'+(week.length?'<ul class="rows">'+week.map(rowS).join('')+'</ul>':'')+
  '<div class="acts"><button class="btn pri" data-a="sGo" data-v="form">'+ic('plus')+'구인 요청하기</button></div>';}
function vForm(){var F=S.form,e=F.err,days='';
 for(var o=0;o<7;o++)days+='<button type="button" aria-pressed="'+(F.d===o)+'" data-a="fD" data-v="'+o+'">'+(rel(o)||md(o))+'<small>'+DOW[day(o).getDay()]+'</small></button>';
 var opt=function(v){return TIMES.map(function(t){return '<option'+(t===v?' selected':'')+'>'+t+'</option>';}).join('');};
 var er=function(k){return e[k]?'<div class="err" id="er-'+k+'">'+ic('alert')+'<span>'+esc(e[k])+'</span></div>':'';};
 return '<form class="fm" id="reqForm" novalidate>'+
 '<div class="fd'+(e.d?' bad':'')+'"><span class="lab">근무 날짜<span class="req">*</span></span><div class="chips days">'+days+'</div>'+er('d')+'</div>'+
 '<div class="fd'+(e.sec?' bad':'')+'"><span class="lab" id="lb-sec">섹션<span class="req">*</span></span><div class="chips" role="group" aria-labelledby="lb-sec">'+SECS.map(function(s){return '<button type="button" aria-pressed="'+(F.sec===s)+'" data-a="fSec" data-v="'+s+'">'+s+'</button>';}).join('')+'</div>'+er('sec')+'</div>'+
 '<div class="fd'+(e.time?' bad':'')+'"><span class="lab">근무 시간<span class="req">*</span></span><div class="two"><div><label class="sr" for="fSt">출근</label><select id="fSt" data-f="st">'+opt(F.st)+'</select><div class="hint">출근</div></div><div><label class="sr" for="fEn">퇴근</label><select id="fEn" data-f="en">'+opt(F.en)+'</select><div class="hint">퇴근</div></div></div>'+er('time')+'</div>'+
 '<div class="fd"><label for="fBr">휴게 시간</label><select id="fBr" data-f="br">'+BRK.map(function(b){return '<option value="'+b[0]+'"'+(F.br===b[0]?' selected':'')+'>'+b[1]+'</option>';}).join('')+'</select></div>'+
 '<div class="fd"><span class="lab">필요 인원<span class="req">*</span></span><div class="step"><button type="button" aria-label="한 명 줄이기" data-a="fN" data-v="-1"'+(F.need<=1?' disabled':'')+'>'+ic('minus')+'</button><output aria-live="polite">'+F.need+'명</output><button type="button" aria-label="한 명 늘리기" data-a="fN" data-v="1"'+(F.need>=10?' disabled':'')+'>'+ic('plus')+'</button></div></div>'+
 '<div class="fd"><label for="fMemo">요청 사항</label><input type="text" id="fMemo" data-f="memo" maxlength="40" value="'+esc(F.memo)+'" placeholder="예: 주방 경력자 우선"><div class="hint">40자 이내, 선택 입력</div></div>'+
 (e.dup?'<div class="alert">'+ic('alert')+'<span>'+esc(e.dup)+'</span></div>':'')+
 '<div class="acts">'+bbtn('req',['요청 보내기','요청 보내는 중'],'pri','type="button" data-a="fSubmit"')+'</div>'+
 '<p class="note">보내면 담당자 화면에 바로 알림이 갑니다.</p></form>';}
function vRoster(){var f=S.st.rfilter,rs=storeReqs().filter(function(r){return filled(r)&&(f==='today'?r.d===0:f==='next'?r.d>=7:r.d>=0&&r.d<7);});
 var chips='<div class="chips" style="margin-bottom:10px">'+[['today','오늘'],['week','이번 주'],['next','다음 주']].map(function(c){return '<button aria-pressed="'+(f===c[0])+'" data-a="rF" data-v="'+c[0]+'">'+c[1]+'</button>';}).join('')+'</div>';
 if(!rs.length)return chips+'<div class="empty">'+ic('inbox')+'<strong>확정된 근무자가 없습니다</strong><p>이 기간에는 아직 요청이 없거나 채용이 확정되지 않았습니다.</p><button class="btn pri" data-a="sGo" data-v="form">구인 요청하기</button></div>';
 return chips+rs.map(function(r){return '<div class="sec"><h3>'+dlabel(r.d)+' '+esc(r.sec)+'</h3><span class="m">'+r.st+'–'+r.en+' · '+filled(r)+'/'+r.need+'명</span></div><ul class="ppl">'+r.workers.map(function(w){return '<li'+(S.st.flash===r.id?' class="flash"':'')+'><span class="av">'+w.n.charAt(0)+'</span><span class="nm">'+esc(w.n)+'</span><span class="meta">'+w.age+(w.exp?' · 경력':' · 신입')+'</span><span class="num">끝 4자리 '+w.ph+'</span></li>';}).join('')+'</ul>';}).join('')+
 '<p class="note">이름과 연락처는 가려서 보입니다. 근무 당일 담당자가 전체 연락처를 문자로 보내 드립니다.</p>';}
function vPartner(){var P=S.pf,e=P.err,open=storeReqs().filter(function(r){return r.d>=0&&short(r);});
 var mine=[];storeReqs().forEach(function(r){r.partners.forEach(function(p){mine.push([r,p]);});});
 return '<p class="note" style="margin:0 0 10px">부족한 인원을 매장이 아는 분으로 채울 때 등록합니다. 담당자가 확인한 뒤 확정합니다.</p>'+
 '<form class="fm" novalidate><div class="fd'+(e.rid?' bad':'')+'"><span class="lab">어느 근무에 넣을까요<span class="req">*</span></span>'+
 (open.length?'<div class="chips">'+open.map(function(r){return '<button type="button" aria-pressed="'+(P.rid===r.id)+'" data-a="pR" data-v="'+r.id+'">'+(rel(r.d)||md(r.d))+' '+esc(r.sec)+' 부족 '+short(r)+'</button>';}).join('')+'</div>':'<div class="hint">부족한 근무가 없습니다.</div>')+
 (e.rid?'<div class="err">'+ic('alert')+'<span>'+e.rid+'</span></div>':'')+'</div>'+
 '<div class="fd'+(e.name?' bad':'')+'"><label for="pN">이름<span class="req">*</span></label><input type="text" id="pN" data-p="name" maxlength="10" value="'+esc(P.name)+'" autocomplete="off">'+(e.name?'<div class="err">'+ic('alert')+'<span>'+e.name+'</span></div>':'<div class="hint">화면에는 첫 글자만 보입니다.</div>')+'</div>'+
 '<div class="fd'+(e.ph?' bad':'')+'"><label for="pP">연락처 끝 4자리<span class="req">*</span></label><input type="tel" id="pP" data-p="ph" inputmode="numeric" maxlength="4" value="'+esc(P.ph)+'">'+(e.ph?'<div class="err">'+ic('alert')+'<span>'+e.ph+'</span></div>':'<div class="hint">전체 번호는 담당자가 본인 동의를 받은 뒤 받습니다.</div>')+'</div>'+
 '<div class="fd"><span class="lab">관계</span><div class="chips">'+['지인','전 근무자','가족'].map(function(x){return '<button type="button" aria-pressed="'+(P.rel===x)+'" data-a="pRel" data-v="'+x+'">'+x+'</button>';}).join('')+'</div></div>'+
 '<div class="acts">'+bbtn('pt',['지인 등록','등록하는 중'],'pri','type="button" data-a="pSubmit"')+'</div></form>'+
 '<div class="sec"><h3>등록한 지인</h3><span class="m">'+mine.length+'명</span></div>'+
 (mine.length?'<ul class="ppl">'+mine.map(function(x){return '<li><span class="av">'+x[1].n.charAt(0)+'</span><span class="nm">'+esc(x[1].n)+'</span><span class="meta">'+(rel(x[0].d)||md(x[0].d))+' '+esc(x[0].sec)+' · '+x[1].rel+'</span>'+(x[1].used?'<span class="lb ok">확정</span>':'<span class="lb rq">확인 대기</span>')+'</li>';}).join('')+'</ul>':'<div class="empty">'+ic('hand')+'<strong>등록한 지인이 없습니다</strong><p>부족한 근무를 고르고 이름과 끝 4자리만 넣으면 됩니다.</p></div>');}
function sheetS(){var sh=S.st.sheet;if(!sh)return '';var r=byId(sh.id);
 if(sh.type==='detail'){
  return '<div class="scrim" data-a="sClose"><div class="sheet" role="dialog" aria-modal="true" aria-label="요청 상세" data-stop="1"><div class="sh"><h3>'+dlabel(r.d)+' '+esc(r.sec)+'</h3><button class="ib" data-a="sClose" aria-label="닫기">'+ic('x')+'</button></div>'+
  '<dl class="kv"><dt>상태</dt><dd>'+lbl(r)+'</dd><dt>근무 시간</dt><dd class="num">'+r.st+'–'+r.en+' (휴게 '+r.br+'분)</dd><dt>충원</dt><dd class="num">'+filled(r)+' / '+r.need+'명'+(short(r)?' · 부족 '+short(r)+'명':'')+'</dd><dt>요청 번호</dt><dd class="num">'+r.id+' · '+ago(r.at)+' 요청</dd>'+(r.memo?'<dt>요청 사항</dt><dd>'+esc(r.memo)+'</dd>':'')+'</dl>'+
  (r.chg?'<div class="alert info">'+ic('edit')+'<span>인원 변경 요청 '+r.chg.from+'명 → '+r.chg.to+'명 ('+esc(r.chg.why)+'). 담당자 확인 대기 중입니다.</span></div>':'')+
  '<div class="sec"><h3>확정 근무자</h3><span class="m">'+filled(r)+'명</span></div>'+(filled(r)?'<ul class="ppl">'+r.workers.map(function(w){return '<li><span class="av">'+w.n.charAt(0)+'</span><span class="nm">'+esc(w.n)+'</span><span class="meta">'+w.age+'</span><span class="num">끝 4자리 '+w.ph+'</span></li>';}).join('')+'</ul>':'<p class="note">아직 확정된 근무자가 없습니다.</p>')+
  (short(r)&&r.d>=0?'<div class="acts"><button class="btn" data-a="sChg" data-id="'+r.id+'"'+(r.chg?' disabled':'')+'>'+ic('edit')+'인원 변경 요청</button><button class="btn pri" data-a="sPartner" data-id="'+r.id+'">'+ic('hand')+'지인 등록</button></div>':'')+'</div></div>';}
 if(sh.type==='change'){var c=sh;
  return '<div class="scrim" data-a="sClose"><div class="sheet" role="dialog" aria-modal="true" aria-label="인원 변경 요청" data-stop="1"><div class="sh"><h3>인원 변경 요청</h3><button class="ib" data-a="sClose" aria-label="닫기">'+ic('x')+'</button></div>'+
  '<p class="note" style="margin-top:0">'+dlabel(r.d)+' '+esc(r.sec)+' '+r.st+'–'+r.en+' · 지금 '+r.need+'명 요청, '+filled(r)+'명 확정</p>'+
  '<div class="fm"><div class="fd"><span class="lab">바꿀 인원</span><div class="step"><button type="button" aria-label="한 명 줄이기" data-a="cN" data-v="-1"'+(c.to<=Math.max(1,filled(r))?' disabled':'')+'>'+ic('minus')+'</button><output aria-live="polite">'+c.to+'명</output><button type="button" aria-label="한 명 늘리기" data-a="cN" data-v="1"'+(c.to>=10?' disabled':'')+'>'+ic('plus')+'</button></div><div class="hint">이미 확정된 '+filled(r)+'명보다 적게 줄일 수 없습니다.</div></div>'+
  '<div class="fd"><span class="lab">사유</span><div class="chips">'+['예약 변동','매장 자체 수급','영업시간 변경'].map(function(x){return '<button type="button" aria-pressed="'+(c.why===x)+'" data-a="cWhy" data-v="'+x+'">'+x+'</button>';}).join('')+'</div></div>'+
  '<div class="acts">'+bbtn('chg',['변경 요청 보내기','보내는 중'],'pri','type="button" data-a="cSubmit"'+(c.to===r.need?' disabled':''))+'</div></div></div></div>';}
 return '';}
function renderStore(){var v=S.st.view,title={home:['가람점','구인 요청·충원 현황'],form:['구인 요청','새 요청 작성'],roster:['채용 현황','확정 근무자 명단'],partner:['지인파트너 등록','부족 인원 직접 추천']}[v];
 var body={home:vHome,form:vForm,roster:vRoster,partner:vPartner}[v]();
 var tab=function(k,n,l){return '<button data-a="sGo" data-v="'+k+'"'+(v===k?' aria-current="page"':'')+'>'+ic(n)+l+'</button>';};
 var sc=$('#fS .ab');var top=sc&&sc.dataset.v===v?sc.scrollTop:0;
 $('#fS').innerHTML='<div class="ah"><h2>'+title[0]+'<span class="sub">'+title[1]+'</span></h2></div><div class="ab" data-v="'+v+'">'+body+'</div><nav class="tabs" aria-label="매장 메뉴">'+tab('home','home','홈')+tab('form','plus','요청')+tab('roster','users','현황')+tab('partner','hand','지인')+'</nav>'+sheetS();
 $('#fS .ab').scrollTop=top;}

/* ============ STAFF ============ */
function staffReqs(){return R.filter(inScope).filter(function(r){return r.d>=0;});}
function counts(){var a=staffReqs();return {all:a.length,new:a.filter(function(r){return !r.seen;}).length,chg:a.filter(function(r){return r.chg;}).length,bad:a.filter(function(r){return status(r)[1]==='bad';}).length,ok:a.filter(function(r){return status(r)[1]==='ok';}).length};}
function rowF(r){var sh=short(r);
 return '<li><button class="rw'+(!r.seen?' new':'')+(sh&&r.d<=1&&r.seen?' short':'')+(S.f.flash===r.id?' flash':'')+'" data-a="fOpen" data-id="'+r.id+'">'+
 '<span class="dt">'+(rel(r.d)||md(r.d))+'<small>'+(rel(r.d)?md(r.d):DOW[day(r.d).getDay()]+'요일')+'</small></span>'+
 '<span class="mid"><b>'+esc(r.store)+'</b> '+esc(r.sec)+' '+lbl(r)+'<span class="t">'+r.st+'–'+r.en+' · '+(r.src==='store'||!r.seen?ago(r.at)+' 접수':'요청 '+r.id)+'</span></span>'+
 '<span class="rt"><span class="cnt'+(sh?' bad':'')+'">'+filled(r)+' / '+r.need+'</span>'+(sh?'부족 '+sh:'완료')+'</span></button></li>';}
function vList(){var c=counts(),f=S.f.filter;
 var rs=staffReqs().filter(function(r){return f==='all'||(f==='new'&&!r.seen)||(f==='chg'&&r.chg)||(f==='bad'&&status(r)[1]==='bad')||(f==='ok'&&status(r)[1]==='ok');})
  .sort(function(a,b){return (a.seen-b.seen)||(b.chg?1:0)-(a.chg?1:0)||(f==='all'&&!a.seen?b.at-a.at:a.d-b.d||mins(a.st)-mins(b.st));});
 var chips='<div class="chips days" style="margin-bottom:10px">'+[['all','전체'],['new','신규'],['chg','변경'],['bad','미충원'],['ok','확정']].map(function(x){return '<button aria-pressed="'+(f===x[0])+'" data-a="lF" data-v="'+x[0]+'">'+x[1]+' <small>'+c[x[0]]+'</small></button>';}).join('')+'</div>';
 var body=rs.length?'<ul class="rows">'+rs.map(rowF).join('')+'</ul>':'<div class="empty">'+ic('inbox')+'<strong>'+({new:'새로 들어온 요청이 없습니다',chg:'인원 변경 요청이 없습니다',bad:'미충원 근무가 없습니다',ok:'확정된 요청이 없습니다'}[f]||'요청이 없습니다')+'</strong><p>매장에서 요청을 보내면 이 목록 맨 위에 바로 들어옵니다.</p><button class="btn pri" data-a="lF" data-v="all">전체 요청 보기</button></div>';
 return '<p class="note" style="margin:0 0 10px">1권역 12개 매장 · 오늘 이후 근무 '+c.all+'건</p>'+chips+body;}
function vDetail(){var r=byId(S.f.id);
 return '<dl class="kv"><dt>매장</dt><dd>'+esc(r.store)+' <span class="lb ch">'+region(STORES.indexOf(r.store))+'권역</span></dd><dt>근무일</dt><dd>'+dlabel(r.d)+'</dd><dt>섹션</dt><dd>'+esc(r.sec)+'</dd><dt>시간</dt><dd class="num">'+r.st+'–'+r.en+' (휴게 '+r.br+'분)</dd><dt>충원</dt><dd class="num">'+filled(r)+' / '+r.need+'명 '+lbl(r)+'</dd><dt>접수</dt><dd class="num">'+hm(r.at)+' · '+ago(r.at)+(r.src==='store'?' · 매장 앱':r.src==='xls'?' · 엑셀 업로드':'')+'</dd>'+(r.memo?'<dt>요청 사항</dt><dd>'+esc(r.memo)+'</dd>':'')+'</dl>'+
 (r.chg?'<div class="alert info">'+ic('edit')+'<span>매장 인원 변경 요청: '+r.chg.from+'명 → '+r.chg.to+'명 ('+esc(r.chg.why)+')</span></div><div class="acts"><button class="btn" data-a="chgNo" data-id="'+r.id+'">반려</button>'+bbtn('appr',['변경 승인','승인하는 중'],'pri','data-a="chgOk" data-id="'+r.id+'"')+'</div>':'')+
 (r.partners.length?'<div class="sec"><h3>매장 추천 지인</h3><span class="m">'+r.partners.length+'명</span></div><ul class="ppl">'+r.partners.map(function(p){return '<li><span class="av">'+p.n.charAt(0)+'</span><span class="nm">'+esc(p.n)+'</span><span class="meta">'+p.rel+' · 끝 4자리 '+p.ph+'</span>'+(p.used?'<span class="lb ok">확정</span>':'<span class="lb rq">확인 대기</span>')+'</li>';}).join('')+'</ul>':'')+
 '<div class="sec"><h3>확정 근무자</h3><span class="m">'+filled(r)+'명</span></div>'+(filled(r)?'<ul class="ppl">'+r.workers.map(function(w){return '<li><span class="av">'+w.n.charAt(0)+'</span><span class="nm">'+esc(w.n)+'</span><span class="meta">'+w.age+(w.exp?' · 경력':' · 신입')+'</span><span class="num">끝 4자리 '+w.ph+'</span></li>';}).join('')+'</ul>':'<p class="note">아직 확정된 근무자가 없습니다.</p>')+
 (short(r)?'<div class="acts"><button class="btn pri" data-a="fResult" data-id="'+r.id+'">'+ic('check')+'채용 결과 등록 (부족 '+short(r)+'명)</button></div>':'');}
function vResult(){var r=byId(S.f.id),E=S.f.entries,sh=short(r);
 var used=r.workers.map(function(w){return w.wid;});
 var pool=W.filter(function(w){return used.indexOf(w.id)<0&&w.secs.indexOf(r.sec)>=0;});
 var ent=E.map(function(e,i){var srcs=[['db','근무자 DB'],['new','직접 입력']];if(r.partners.some(function(p){return !p.used;}))srcs.splice(1,0,['pt','매장 추천']);
  var body='';
  if(e.src==='db')body='<div class="fd"><label for="eW'+i+'">근무자 선택</label><select id="eW'+i+'" data-e="wid" data-i="'+i+'"><option value="">선택하세요</option>'+pool.map(function(w){return '<option value="'+w.id+'"'+(e.wid===w.id?' selected':'')+'>'+w.n+' · '+w.age+' · '+w.secs.join('/')+' · 끝 '+w.ph+'</option>';}).join('')+'</select>'+(e.err?'<div class="err">'+ic('alert')+'<span>'+e.err+'</span></div>':'')+'</div>';
  else if(e.src==='pt')body='<div class="fd"><label for="eP'+i+'">매장 추천 지인</label><select id="eP'+i+'" data-e="pi" data-i="'+i+'"><option value="">선택하세요</option>'+r.partners.map(function(p,j){return p.used?'':'<option value="'+j+'"'+(String(e.pi)===String(j)?' selected':'')+'>'+p.n+' · '+p.rel+' · 끝 '+p.ph+'</option>';}).join('')+'</select>'+(e.err?'<div class="err">'+ic('alert')+'<span>'+e.err+'</span></div>':'')+'</div>';
  else body='<div class="two"><div class="fd"><label for="eN'+i+'">이름</label><input type="text" id="eN'+i+'" data-e="name" data-i="'+i+'" maxlength="10" value="'+esc(e.name||'')+'" autocomplete="off"></div><div class="fd"><label for="eA'+i+'">나이대</label><select id="eA'+i+'" data-e="age" data-i="'+i+'">'+AGES.map(function(a){return '<option'+(e.age===a?' selected':'')+'>'+a+'</option>';}).join('')+'</select></div></div><div class="fd"><label for="eH'+i+'">연락처 끝 4자리</label><input type="tel" id="eH'+i+'" data-e="ph" data-i="'+i+'" inputmode="numeric" maxlength="4" value="'+esc(e.ph||'')+'"></div><label class="chk"><input type="checkbox" data-e="exp" data-i="'+i+'"'+(e.exp?' checked':'')+'>같은 업무 경력 있음</label>'+(e.err?'<div class="fd"><div class="err">'+ic('alert')+'<span>'+e.err+'</span></div></div>':'');
  return '<div class="entry"><div class="eh"><span>근무자 '+(i+1)+'</span>'+(E.length>1?'<button class="ib" data-a="eDel" data-i="'+i+'" aria-label="근무자 '+(i+1)+' 빼기">'+ic('x')+'</button>':'')+'</div><div class="chips" style="margin-top:6px">'+srcs.map(function(s){return '<button type="button" aria-pressed="'+(e.src===s[0])+'" data-a="eSrc" data-i="'+i+'" data-v="'+s[0]+'">'+s[1]+'</button>';}).join('')+'</div>'+body+'</div>';}).join('');
 return '<dl class="kv"><dt>요청</dt><dd>'+esc(r.store)+' · '+dlabel(r.d)+' '+esc(r.sec)+'</dd><dt>시간</dt><dd class="num">'+r.st+'–'+r.en+'</dd><dt>남은 인원</dt><dd class="num"><b>'+sh+'명</b> (요청 '+r.need+' · 확정 '+filled(r)+')</dd></dl>'+
 '<div class="sec"><h3>확정 근무자 입력</h3><span class="m">'+E.length+' / '+sh+'명</span></div>'+ent+
 (E.length<sh?'<div class="acts"><button class="btn" data-a="eAdd">'+ic('plus')+'근무자 추가</button></div>':'')+
 '<div class="acts">'+bbtn('save',['저장하고 매장에 알리기','저장하는 중'],'pri','data-a="eSave"')+'</div><p class="note">저장하면 매장 화면의 충원 현황이 바로 바뀝니다. 연락처는 끝 4자리만 매장에 보입니다.</p>';}
function aggRows(){var rows=[];for(var o=0;o<7;o++){var rs=R.filter(inScope).filter(function(r){return r.d===o&&(S.f.aggStore==='all'||r.store===S.f.aggStore);});
 var need=0,got=0,st={rq:0,pg:0,ok:0,bad:0};rs.forEach(function(r){need+=r.need;got+=filled(r);st[status(r)[1]]++;});rows.push({o:o,n:rs.length,need:need,got:got,st:st});}return rows;}
function vAgg(){var rows=aggRows(),tot={n:0,need:0,got:0};rows.forEach(function(x){tot.n+=x.n;tot.need+=x.need;tot.got+=x.got;});
 var stTxt=function(s){var a=[];if(s.rq)a.push('요청 '+s.rq);if(s.pg)a.push('진행 '+s.pg);if(s.bad)a.push('미충원 '+s.bad);if(s.ok)a.push('확정 '+s.ok);return a.join(' · ')||'-';};
 return '<div class="chips" style="margin-bottom:10px"><button aria-pressed="true" data-a="fGo" data-v="agg">일자별 집계</button><button aria-pressed="false" data-a="fGo" data-v="upload">'+ic('file')+'엑셀 업로드</button></div>'+
 '<div class="fd" style="margin-top:0"><label for="aggS">매장</label><select id="aggS" data-g="aggStore"><option value="all">1권역 전체 (12개)</option>'+STORES.slice(0,12).map(function(s){return '<option'+(S.f.aggStore===s?' selected':'')+'>'+s+'</option>';}).join('')+'</select></div>'+
 '<div class="sec"><h3>'+dlabel(0)+'부터 7일</h3><span class="m">단위: 명</span></div>'+
 '<div class="tw"><table class="t"><thead><tr><th>근무일</th><th class="n">요청 건</th><th class="n">요청</th><th class="n">채용</th><th class="n">미충원</th><th class="n">충원율</th><th>진행 상태</th></tr></thead><tbody>'+
 rows.map(function(x){var m=x.need-x.got;return '<tr><td>'+dlabel(x.o)+'</td><td class="n">'+x.n+'</td><td class="n">'+x.need+'</td><td class="n">'+x.got+'</td><td class="n"'+(m?' style="color:var(--bad);font-weight:700"':'')+'>'+m+'</td><td class="n">'+(x.need?Math.round(x.got/x.need*100)+'%':'-')+'</td><td>'+stTxt(x.st)+'</td></tr>';}).join('')+
 '</tbody><tfoot><tr><td>합계</td><td class="n">'+tot.n+'</td><td class="n">'+tot.need+'</td><td class="n">'+tot.got+'</td><td class="n">'+(tot.need-tot.got)+'</td><td class="n">'+(tot.need?Math.round(tot.got/tot.need*100)+'%':'-')+'</td><td></td></tr></tfoot></table></div>'+
 '<p class="note">표는 좌우로 밀어서 봅니다. 매장에서 요청을 보내거나 채용을 확정하면 바로 다시 계산됩니다.</p>';}
var XLS=[['가람점',4,'홀','11:00','16:00',2],['나루점',4,'주방','17:00','22:00',3],['다솜점',5,'계산','10:00','15:00',1],['',5,'홀','11:00','16:00',2],['라온점',5,'세척','18:00','23:00',1],['마루점',6,'홀','25:00','16:00',2],['보람점',6,'주방','10:00','15:00',2],['새솔점',6,'홀','17:00','22:00',3]];
function xCheck(x){if(!x[0])return '매장명 없음';if(STORES.indexOf(x[0])<0)return '등록되지 않은 매장';if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(x[3]))return '출근 시간 형식 오류';if(mins(x[4])<=mins(x[3]))return '퇴근이 출근보다 빠름';return '';}
function vUpload(){var U=S.f.upload;
 var head='<div class="chips" style="margin-bottom:10px"><button aria-pressed="false" data-a="fGo" data-v="agg">일자별 집계</button><button aria-pressed="true" data-a="fGo" data-v="upload">'+ic('file')+'엑셀 업로드</button></div>';
 if(!U)return head+'<div class="empty">'+ic('file')+'<strong>요청 엑셀 파일을 올려 주세요</strong><p>매장·근무일·섹션·출근·퇴근·인원 열 순서. 올리면 반영 전에 먼저 검사 결과를 보여 줍니다.</p><div class="acts" style="justify-content:center;flex-direction:column"><label class="btn pri" for="xlsIn">'+ic('file')+'파일 선택</label><input type="file" id="xlsIn" class="sr" accept=".xlsx,.xls,.csv"><button class="btn" data-a="xSample">예시 파일로 미리보기</button></div></div>';
 if(U.done)return head+'<div class="alert info">'+ic('check')+'<span>'+U.done+'건을 요청 목록에 반영했습니다. 오류 '+U.bad+'건은 파일을 고쳐 다시 올리면 됩니다.</span></div><div class="acts"><button class="btn" data-a="xReset">다른 파일 올리기</button><button class="btn pri" data-a="fGo" data-v="agg">집계 보기</button></div>';
 var ok=XLS.filter(function(x){return !xCheck(x);}).length;
 return head+'<dl class="kv"><dt>파일</dt><dd>'+esc(U.name)+'</dd><dt>검사 결과</dt><dd><span class="lb ok">정상 '+ok+'</span> <span class="lb bad">오류 '+(XLS.length-ok)+'</span></dd></dl>'+
 '<div class="sec"><h3>미리보기</h3><span class="m">'+XLS.length+'행</span></div><div class="tw"><table class="t"><thead><tr><th>행</th><th>검사</th><th>매장</th><th>근무일</th><th>섹션</th><th>출근</th><th>퇴근</th><th class="n">인원</th></tr></thead><tbody>'+
 XLS.map(function(x,i){var e=xCheck(x);return '<tr'+(e?' class="err"':'')+'><td class="num">'+(i+2)+'</td><td>'+(e?'<span class="lb bad">'+e+'</span>':'<span class="lb ok">정상</span>')+'</td><td>'+(x[0]||'(빈칸)')+'</td><td>'+md(x[1])+'</td><td>'+x[2]+'</td><td>'+x[3]+'</td><td>'+x[4]+'</td><td class="n">'+x[5]+'</td></tr>';}).join('')+'</tbody></table></div>'+
 '<div class="acts"><button class="btn" data-a="xReset">취소</button>'+bbtn('xls',['정상 '+ok+'건 반영','반영하는 중'],'pri','data-a="xApply"')+'</div>';}
function wFiltered(){var q=S.f.wq.trim();return W.filter(function(w){return (S.f.wstore==='all'||w.store===S.f.wstore)&&(!q||w.n.indexOf(q)>=0||w.secs.join(' ').indexOf(q)>=0||w.ph.indexOf(q)>=0);});}
function vWorkers(){var ws=wFiltered(),sel=Object.keys(S.f.sel).filter(function(k){return S.f.sel[k];});
 var allOn=ws.length&&ws.every(function(w){return S.f.sel[w.id];});
 return '<div class="two"><div class="fd" style="margin-top:0"><label for="wq">검색</label><input type="search" id="wq" data-g="wq" value="'+esc(S.f.wq)+'" placeholder="성, 섹션, 끝자리"></div><div class="fd" style="margin-top:0"><label for="wst">최근 근무 매장</label><select id="wst" data-g="wstore"><option value="all">1권역 전체</option>'+STORES.slice(0,12).map(function(s){return '<option'+(S.f.wstore===s?' selected':'')+'>'+s+'</option>';}).join('')+'</select></div></div>'+
 '<div class="sec"><h3>근무자 '+ws.length+'명</h3><span class="m">'+sel.length+'명 선택</span></div>'+
 (ws.length?'<div class="tw"><table class="t"><thead><tr><th class="cb"><label><input type="checkbox" data-a="wAll"'+(allOn?' checked':'')+'><span class="sr">전체 선택</span></label></th><th>이름</th><th>나이대</th><th>가능 섹션</th><th>최근 근무</th><th>끝 4자리</th></tr></thead><tbody>'+
 ws.map(function(w){return '<tr'+(S.f.sel[w.id]?' class="sel"':'')+'><td class="cb"><label><input type="checkbox" data-a="wSel" data-id="'+w.id+'"'+(S.f.sel[w.id]?' checked':'')+'><span class="sr">'+w.n+' 선택</span></label></td><td>'+w.n+'</td><td>'+w.age+'</td><td>'+w.secs.join('·')+'</td><td>'+w.store+' '+md(w.last)+'</td><td class="num">'+w.ph+'</td></tr>';}).join('')+'</tbody></table></div>'
 :'<div class="empty">'+ic('search')+'<strong>조건에 맞는 근무자가 없습니다</strong><p>검색어를 줄이거나 매장을 1권역 전체로 바꿔 보세요.</p><button class="btn pri" data-a="wClear">조건 지우기</button></div>')+
 '<div class="acts"><button class="btn pri" data-a="fGo" data-v="sms"'+(sel.length?'':' disabled')+'>'+ic('send')+'단체 문자 ('+sel.length+'명)</button></div>'+
 '<div class="sec"><h3>발송 내역</h3><span class="m">'+SMSLOG.length+'건</span></div><div class="tw"><table class="t"><thead><tr><th>시각</th><th class="n">대상</th><th>종류</th><th>내용</th></tr></thead><tbody>'+SMSLOG.map(function(l){return '<tr><td class="num">'+hm(l.t)+'</td><td class="n">'+l.cnt+'명</td><td>'+l.type+'</td><td>'+esc(l.txt.length>22?l.txt.slice(0,22)+'…':l.txt)+'</td></tr>';}).join('')+'</tbody></table></div>';}
var TPL=[['근무 안내','[채움반] 내일 근무 안내드립니다. 출근 10분 전 매장 도착 부탁드립니다.'],['긴급 구인','[채움반] 오늘 저녁 주방 근무 가능하신 분은 이 번호로 회신 주세요.'],['일정 변경','[채움반] 요청 매장 사정으로 근무 시간이 바뀌었습니다. 확인 부탁드립니다.']];
var bytes=function(s){var b=0;for(var i=0;i<s.length;i++)b+=s.charCodeAt(i)>127?2:1;return b;};
function vSms(){var sel=W.filter(function(w){return S.f.sel[w.id];}),M=S.f.sms,b=bytes(M.txt);
 return '<dl class="kv"><dt>받는 사람</dt><dd>'+sel.length+'명 · '+sel.slice(0,4).map(function(w){return w.n;}).join(', ')+(sel.length>4?' 외 '+(sel.length-4)+'명':'')+'</dd></dl>'+
 '<div class="fd"><span class="lab">문구 고르기</span><div class="chips">'+TPL.map(function(t,i){return '<button type="button" aria-pressed="'+(M.tpl===i)+'" data-a="mT" data-v="'+i+'">'+t[0]+'</button>';}).join('')+'</div></div>'+
 '<div class="fd"><label for="smsT">내용</label><textarea id="smsT" data-g="smsTxt" maxlength="500">'+esc(M.txt)+'</textarea><div class="hint num" id="smsB">'+b+' / '+(b>90?'2000바이트 · 장문(LMS)':'90바이트 · 단문(SMS)')+'</div></div>'+
 '<div class="acts"><button class="btn" data-a="fGo" data-v="workers">취소</button><button class="btn pri" data-a="mConfirm"'+(M.txt.trim()?'':' disabled')+'>'+ic('send')+'보내기</button></div>';}
function vChat(){return '<ul class="rows">'+CHAT.rooms.map(function(r){var ms=CHAT.msgs[r.id],l=ms[ms.length-1];return '<li><button class="rw" style="grid-template-columns:40px minmax(0,1fr) auto" data-a="room" data-v="'+r.id+'"><span class="av">'+ic('msg')+'</span><span class="mid"><b>'+r.name+'</b> <span class="m" style="font-size:13px;color:var(--text-2)">'+r.mem+'명</span><span class="t">'+(l.tag?'['+l.tag+'] ':'')+esc(l.txt.slice(0,24))+'…</span></span><span class="rt">'+hm(l.t)+(unread[r.id]?'<span class="cnt" style="color:var(--ac)">'+unread[r.id]+'</span>':'')+'</span></button></li>';}).join('')+'</ul><p class="note">담당자끼리 쓰는 대화방입니다. 결근·지각·조퇴는 빠른 태그로 남기면 매장·근무자와 함께 기록됩니다.</p>';}
function vRoom(){var id=S.f.room,ms=CHAT.msgs[id],room=CHAT.rooms.filter(function(r){return r.id===id;})[0];
 return '<div class="msgs">'+ms.map(function(m){return '<div class="mg'+(m.me?' me':'')+'">'+(m.me?'':'<div class="who">'+m.who+'</div>')+'<div class="bb">'+(m.tag?'<span class="lb tag">'+m.tag+'</span> ':'')+esc(m.txt)+'</div><div class="st num">'+hm(m.t)+(m.me?' · '+(m.ur?'<span class="ur">안 읽음 '+m.ur+'</span>':'모두 읽음'):'')+'</div></div>';}).join('')+'</div><span class="sr">'+room.name+'</span>';}
function composer(){var F=S.f,todays=R.filter(function(r){return r.store===F.tagStore&&r.d===0;}).reduce(function(a,r){return a.concat(r.workers);},[]);
 return '<div class="cmp">'+(F.tag?'<div class="tagf"><div><label class="sr" for="tgS">매장</label><select id="tgS" data-g="tagStore">'+STORES.slice(0,12).map(function(s){return '<option'+(F.tagStore===s?' selected':'')+'>'+s+'</option>';}).join('')+'</select></div><div><label class="sr" for="tgW">근무자</label><select id="tgW" data-g="tagW"><option value="">근무자 선택</option>'+todays.map(function(w){return '<option'+(F.tagW===w.n?' selected':'')+'>'+w.n+'</option>';}).join('')+'</select></div></div>':'')+
 '<div class="qt"><span>빠른 태그</span>'+['결근','지각','조퇴'].map(function(t){return '<button type="button" aria-pressed="'+(F.tag===t)+'" data-a="tag" data-v="'+t+'">'+t+'</button>';}).join('')+'</div>'+
 '<div class="row"><label class="sr" for="chatIn">메시지</label><input type="text" id="chatIn" data-g="draft" maxlength="120" value="'+esc(F.draft)+'" placeholder="'+(F.tag?F.tag+' 내용 (예: 연락 두절, 30분 늦음)':'메시지 입력')+'"><button class="btn pri" data-a="say" aria-label="보내기">'+ic('send')+'</button></div></div>';}
function vAcct(){var a=S.f.acct;
 var head='<div class="chips" style="margin-bottom:10px"><button aria-pressed="'+(a==='store')+'" data-a="acct" data-v="store">매장 계정 <small>35</small></button><button aria-pressed="'+(a==='staff')+'" data-a="acct" data-v="staff">담당자 계정 <small>'+STAFF.length+'</small></button></div>';
 if(a==='store')return head+'<p class="note" style="margin:0 0 8px">매장 계정은 자기 매장의 요청과 채용 현황만 봅니다.</p><div class="tw"><table class="t"><thead><tr><th>매장</th><th>계정</th><th>권역</th><th>담당</th><th>상태</th></tr></thead><tbody>'+
  STORES.map(function(s,i){var g=region(i),st=STAFF.filter(function(x){return x.scope.length===1&&x.scope[0]===g;})[0];return '<tr><td>'+s+'</td><td class="num">store'+String(i+1).padStart(2,'0')+'</td><td>'+g+'권역</td><td>'+st.n+'</td><td>'+(i===33?'<span class="lb rq">초대 대기</span>':'<span class="lb ok">사용</span>')+'</td></tr>';}).join('')+'</tbody></table></div><p class="note">매장이 늘면 계정만 추가합니다. 권역을 지정하면 그 권역 담당자 화면에 자동으로 보입니다.</p>';
 return head+'<div class="tw"><table class="t"><thead><tr><th>이름</th><th>역할</th><th>조회 범위</th><th></th></tr></thead><tbody>'+STAFF.map(function(x,i){return '<tr><td>'+x.n+(x.me?' (나)':'')+'</td><td>'+x.role+'</td><td>'+(x.scope.length===3?'전체 35개 매장':x.scope.map(function(g){return g+'권역';}).join(', ')+' '+STORES.filter(function(s,j){return x.scope.indexOf(region(j))>=0;}).length+'개')+'</td><td><button class="ib" data-a="scope" data-i="'+i+'" aria-label="'+x.n+' 조회 범위 수정" title="조회 범위 수정">'+ic('edit')+'</button></td></tr>';}).join('')+'</tbody></table></div>';}
function overlayF(){var F=S.f,out='';
 if(F.banner){var r=byId(F.banner);out+='<button class="banner" data-a="fOpen" data-id="'+r.id+'">'+'<span class="bi">'+ic('bell')+'</span><span><b>새 구인 요청 · '+esc(r.store)+'</b><span>'+dlabel(r.d)+' '+esc(r.sec)+' '+r.st+'–'+r.en+' · '+r.need+'명</span></span></button>';}
 if(F.dlg==='sms'){var n=W.filter(function(w){return F.sel[w.id];}).length,b=bytes(F.sms.txt);
  out+='<div class="dlg" role="dialog" aria-modal="true" aria-labelledby="dlgT"><div class="bx"><h3 id="dlgT">'+n+'명에게 문자를 보낼까요?</h3><p>'+(b>90?'장문(LMS)':'단문(SMS)')+' '+b+'바이트. 시안에서는 실제로 발송되지 않습니다.</p><div class="acts"><button class="btn" data-a="dlgNo">취소</button>'+bbtn('sms',['보내기','보내는 중'],'pri','data-a="mSend"')+'</div></div></div>';}
 if(F.scopeEdit!=null){var x=STAFF[F.scopeEdit],ed=F.scopeTmp;
  out+='<div class="scrim" data-a="scopeNo"><div class="sheet" role="dialog" aria-modal="true" aria-label="조회 범위" data-stop="1"><div class="sh"><h3>'+x.n+' 조회 범위</h3><button class="ib" data-a="scopeNo" aria-label="닫기">'+ic('x')+'</button></div>'+
  [1,2,3].map(function(g){var ss=STORES.filter(function(s,j){return region(j)===g;});return '<label class="chk"><input type="checkbox" data-a="scopeG" data-v="'+g+'"'+(ed.indexOf(g)>=0?' checked':'')+'>'+g+'권역 ('+ss.length+'개) <span style="color:var(--text-2);font-size:13px">'+ss.slice(0,3).join(', ')+' 외</span></label>';}).join('')+
  (ed.length?'':'<div class="fd"><div class="err">'+ic('alert')+'<span>최소 한 권역은 선택해야 합니다.</span></div></div>')+
  '<div class="acts"><button class="btn" data-a="scopeNo">취소</button>'+bbtn('scope',['저장','저장하는 중'],'pri','data-a="scopeOk"'+(ed.length?'':' disabled'))+'</div></div></div>';}
 return out;}
function renderStaff(){var v=S.f.view,c=counts();
 var T={list:['구인 요청','1권역 · 실시간'],detail:['요청 상세',''],result:['채용 결과 등록',''],agg:['집계','일자별 요청·채용'],upload:['집계','엑셀 업로드'],workers:['근무자 DB','1권역 근무자'],sms:['단체 문자',''],chat:['채팅','담당자 대화방'],room:['',''],acct:['계정 관리','매장·담당자']}[v];
 if(v==='room')T=[CHAT.rooms.filter(function(r){return r.id===S.f.room;})[0].name,'참여 '+CHAT.rooms.filter(function(r){return r.id===S.f.room;})[0].mem+'명'];
 var back={detail:'list',result:'detail',sms:'workers',room:'chat'}[v];
 var tabOf={list:'list',detail:'list',result:'list',agg:'agg',upload:'agg',workers:'workers',sms:'workers',chat:'chat',room:'chat',acct:'acct'}[v];
 var tab=function(k,n,l,bd){return '<button data-a="fGo" data-v="'+k+'"'+(tabOf===k?' aria-current="page"':'')+'>'+ic(n)+l+(bd?'<span class="bd">'+bd+'</span>':'')+'</button>';};
 var body={list:vList,detail:vDetail,result:vResult,agg:vAgg,upload:vUpload,workers:vWorkers,sms:vSms,chat:vChat,room:vRoom,acct:vAcct}[v]();
 var sc=$('#fF .ab');var top=sc&&sc.dataset.v===v?sc.scrollTop:0;
 var ur=unread.all+unread.r1+unread.nt;
 $('#fF').innerHTML='<div class="ah">'+(back?'<button class="ib back" data-a="fGo" data-v="'+back+'" aria-label="뒤로">'+ic('left')+'</button>':'')+'<h2>'+T[0]+(T[1]?'<span class="sub">'+T[1]+'</span>':'')+'</h2>'+(v==='list'?'<span class="live">실시간 연결</span>':'')+'</div>'+
  '<div class="ab" data-v="'+v+'">'+body+'</div>'+(v==='room'?composer():'')+
  '<nav class="tabs" aria-label="담당자 메뉴">'+tab('list','list','요청',c.new)+tab('agg','chart','집계')+tab('workers','users','근무자')+tab('chat','msg','채팅',ur)+tab('acct','key','계정')+'</nav>'+overlayF();
 var ab=$('#fF .ab');ab.scrollTop=v==='room'?ab.scrollHeight:top;}

/* ============ guide ============ */
var STEPS=[['매장 요청 작성','날짜·섹션·시간·인원을 골라 보냅니다'],['담당자 화면 실시간 수신','오른쪽 목록 맨 위에 새 요청과 알림이 뜹니다'],['채용 확정 등록','근무자 DB나 매장 추천으로 확정합니다'],['매장 충원 현황 변화','왼쪽 홈의 확정 인원과 막대가 바뀝니다'],['집계와 엑셀 업로드','일자별 요청·채용·미충원'],['담당자 채팅','결근·지각·조퇴 빠른 태그']];
var gOpen=window.innerWidth>=1101;
function renderGuide(){var g=$('#guide');g.className='guide'+(gOpen?'':' closed');document.body.classList.toggle('guide-open',gOpen);
 g.innerHTML='<button class="gh" data-a="gT" aria-expanded="'+gOpen+'"><span>시연 안내 '+(gOpen?'':'('+(S.step+1)+'/6)')+'</span>'+ic(gOpen?'up':'down')+'</button><ol>'+STEPS.map(function(s,i){return '<li><button data-a="gS" data-v="'+i+'"'+(S.step===i?' aria-current="step"':'')+'><b><span class="n">'+(i+1)+'</span>'+s[0]+'</b><span class="d">'+s[1]+'</span></button></li>';}).join('')+'</ol>';}
var flashT;function render(){renderStore();renderStaff();renderGuide();
 if(S.st.flash||S.f.flash){clearTimeout(flashT);flashT=setTimeout(function(){S.st.flash=null;S.f.flash=null;},1700);}
 document.body.dataset.side=S.side;$('#swS').setAttribute('aria-selected',S.side==='store');$('#swF').setAttribute('aria-selected',S.side==='staff');
 $('#swDot').hidden=!(S.side==='store'&&counts().new>0&&R.some(function(r){return r.src==='store'&&!r.seen;}));}

/* ============ actions ============ */
function lastStoreReq(){var a=R.filter(function(r){return r.src==='store';});return a[a.length-1];}
function addStoreReq(F){var r={id:nextId++,store:ME_STORE,d:F.d,sec:F.sec,st:F.st,en:F.en,br:F.br,need:F.need,memo:F.memo.trim(),workers:[],seen:false,chg:null,partners:[],at:Date.now(),src:'store'};R.push(r);
 S.f.banner=r.id;S.st.flash=r.id;S.f.flash=r.id;clearTimeout(addStoreReq.t);addStoreReq.t=setTimeout(function(){S.f.banner=null;renderStaff();},4500);return r;}
function validate(){var F=S.form,e={};if(F.d==null)e.d='근무 날짜를 골라 주세요.';if(!F.sec)e.sec='섹션을 골라 주세요.';
 if(mins(F.en)<=mins(F.st))e.time='퇴근 시간은 출근 시간보다 늦어야 합니다.';else if(mins(F.en)-mins(F.st)<120)e.time='근무 시간은 2시간 이상이어야 합니다.';
 if(!e.sec){var dup=R.filter(function(r){return r.store===ME_STORE&&r.d===F.d&&r.sec===F.sec&&r.st===F.st;})[0];if(dup)e.dup='같은 날 같은 섹션·출근 시간 요청이 이미 있습니다(요청 '+dup.id+'). 인원을 바꾸려면 홈에서 그 요청의 인원 변경 요청을 이용해 주세요.';}
 F.err=e;return !Object.keys(e).length;}
function seeReq(id){var r=byId(id);if(r&&!r.seen){r.seen=true;}}
function goStep(i){S.step=i;var r;
 if(i===0){S.side='store';S.st.view='form';S.st.sheet=null;S.form.err={};}
 if(i===1){r=lastStoreReq();if(!r){S.form={d:2,sec:'홀',st:'17:00',en:'22:00',br:60,need:3,memo:'',err:{}};r=addStoreReq(S.form);S.form={d:2,sec:null,st:'17:00',en:'22:00',br:60,need:2,memo:'',err:{}};}
  else{S.f.banner=r.id;S.f.flash=r.id;}S.side='staff';S.f.view='list';S.f.filter='all';S.st.view='home';}
 if(i===2){r=lastStoreReq()||(goStep(1),lastStoreReq());S.step=2;seeReq(r.id);S.f.banner=null;S.f.id=r.id;S.f.view='result';S.side='staff';
  if(short(r)){var used=r.workers.map(function(w){return w.wid;});var w=W.filter(function(x){return used.indexOf(x.id)<0&&x.secs.indexOf(r.sec)>=0;})[0];S.f.entries=[{src:'db',wid:w?w.id:''}];}else S.f.view='detail';}
 if(i===3){r=lastStoreReq()||(goStep(1),lastStoreReq());S.step=3;seeReq(r.id);if(!filled(r)){var used2=[];W.filter(function(x){return x.secs.indexOf(r.sec)>=0;}).slice(0,Math.min(2,r.need)).forEach(function(x){r.workers.push({n:x.n,age:x.age,ph:x.ph,exp:x.exp,wid:x.id});});}
  S.st.view='home';S.st.sheet=null;S.st.flash=r.id;S.side='store';S.f.view='detail';S.f.id=r.id;S.f.banner=null;}
 if(i===4){S.side='staff';S.f.view='agg';}
 if(i===5){S.side='staff';S.f.view='room';S.f.room='all';S.f.tag='결근';S.f.tagStore='가람점';unread.all=0;}
 if(window.innerWidth<1101)gOpen=false;
 render();}
var A={
 side:function(d){S.side=d.v;render();},
 gT:function(){gOpen=!gOpen;renderGuide();},
 gS:function(d){goStep(+d.v);},
 sGo:function(d){S.st.view=d.v;S.st.sheet=null;S.st.flash=null;if(d.v==='form')S.form.err={};render();},
 sDetail:function(d){S.st.sheet={type:'detail',id:+d.id};S.st.flash=null;renderStore();},
 sClose:function(){S.st.sheet=null;renderStore();},
 sChg:function(d){var r=byId(d.id);S.st.sheet={type:'change',id:r.id,to:Math.max(filled(r),r.need-1)||1,why:'예약 변동'};renderStore();},
 cN:function(d){S.st.sheet.to+= +d.v;renderStore();},
 cWhy:function(d){S.st.sheet.why=d.v;renderStore();},
 cSubmit:function(){var sh=S.st.sheet,r=byId(sh.id);work('chg',450,function(){r.chg={from:r.need,to:sh.to,why:sh.why};S.st.sheet={type:'detail',id:r.id};S.f.flash=r.id;toast('인원 변경 요청을 보냈습니다');});},
 sPartner:function(d){S.pf.rid=+d.id;S.pf.err={};S.st.sheet=null;S.st.view='partner';renderStore();},
 fD:function(d){S.form.d=+d.v;delete S.form.err.d;delete S.form.err.dup;renderStore();},
 fSec:function(d){S.form.sec=d.v;delete S.form.err.sec;delete S.form.err.dup;renderStore();},
 fN:function(d){S.form.need=Math.min(10,Math.max(1,S.form.need+ +d.v));renderStore();},
 fSubmit:function(){if(!validate()){renderStore();var f=$('#fS .fd.bad, #fS .alert');if(f)f.scrollIntoView({block:'center'});toast('입력 내용을 확인해 주세요',1);return;}
  work('req',500,function(){var r=addStoreReq(S.form);S.form={d:2,sec:null,st:'17:00',en:'22:00',br:60,need:2,memo:'',err:{}};S.st.view='home';
   toast('구인 요청을 보냈습니다 · 담당자 화면에 도착');if(S.step===0)S.step=1;});},
 rF:function(d){S.st.rfilter=d.v;renderStore();},
 pR:function(d){S.pf.rid=+d.v;delete S.pf.err.rid;renderStore();},
 pRel:function(d){S.pf.rel=d.v;renderStore();},
 pSubmit:function(){var P=S.pf,e={};if(!P.rid||!byId(P.rid)||!short(byId(P.rid)))e.rid='넣을 근무를 골라 주세요.';if(P.name.trim().length<2)e.name='이름을 두 글자 이상 입력해 주세요.';if(!/^\d{4}$/.test(P.ph))e.ph='숫자 4자리를 입력해 주세요.';
  P.err=e;if(Object.keys(e).length){renderStore();toast('입력 내용을 확인해 주세요',1);return;}
  work('pt',450,function(){var r=byId(P.rid);r.partners.push({n:mask(P.name),ph:P.ph,rel:P.rel,used:false});S.f.flash=r.id;S.pf={rid:null,name:'',ph:'',rel:'지인',err:{}};toast('지인을 등록했습니다 · 담당자 확인 대기');});},
 /* staff */
 fGo:function(d){S.f.view=d.v;S.f.flash=null;if(d.v==='sms'&&!S.f.sms.txt)S.f.sms={tpl:0,txt:TPL[0][1]};renderStaff();},
 lF:function(d){S.f.filter=d.v;renderStaff();},
 fOpen:function(d){seeReq(d.id);S.f.id=+d.id;S.f.view='detail';S.f.banner=null;S.f.flash=null;S.side='staff';render();},
 fResult:function(d){var r=byId(d.id);S.f.id=r.id;S.f.entries=[{src:r.partners.some(function(p){return !p.used;})?'pt':'db'}];S.f.view='result';renderStaff();},
 eSrc:function(d){S.f.entries[+d.i]={src:d.v};renderStaff();},
 eAdd:function(){S.f.entries.push({src:'db'});renderStaff();},
 eDel:function(d){S.f.entries.splice(+d.i,1);renderStaff();},
 eSave:function(){var r=byId(S.f.id),bad=false,picked={};
  S.f.entries.forEach(function(e){e.err='';if(e.src==='db'){if(!e.wid)e.err='근무자를 골라 주세요.';else if(picked[e.wid])e.err='같은 근무자를 두 번 넣었습니다.';picked[e.wid]=1;}
   else if(e.src==='pt'){if(e.pi===''||e.pi==null)e.err='추천 지인을 골라 주세요.';}
   else{if(!e.name||e.name.trim().length<2)e.err='이름을 두 글자 이상 입력해 주세요.';else if(!/^\d{4}$/.test(e.ph||''))e.err='연락처 끝 4자리를 숫자로 입력해 주세요.';}if(e.err)bad=true;});
  if(bad){renderStaff();toast('입력 내용을 확인해 주세요',1);return;}
  work('save',550,function(){S.f.entries.forEach(function(e){var w;if(e.src==='db'){var x=W.filter(function(y){return y.id===e.wid;})[0];w={n:x.n,age:x.age,ph:x.ph,exp:x.exp,wid:x.id};x.store=r.store;x.last=r.d;}
    else if(e.src==='pt'){var p=r.partners[+e.pi];p.used=true;w={n:p.n,age:'-',ph:p.ph,exp:false,wid:'P'+r.id+e.pi};}
    else w={n:mask(e.name),age:e.age||'20대',ph:e.ph,exp:!!e.exp,wid:'N'+Date.now()+Math.random()};r.workers.push(w);});
   var n=S.f.entries.length;S.f.entries=[];S.f.view='detail';S.st.flash=r.id;if(r.store===ME_STORE&&S.st.view!=='roster'){S.st.view='home';S.st.sheet=null;}
   toast('채용 확정 '+n+'명 등록 · 매장 화면에 반영');if(S.step===2)S.step=3;});},
 chgOk:function(d){var r=byId(d.id);work('appr',450,function(){r.need=r.chg.to;r.chg=null;S.st.flash=r.id;toast('인원 변경을 승인했습니다 · 매장에 반영');});},
 chgNo:function(d){var r=byId(d.id);r.chg=null;toast('변경 요청을 반려했습니다');render();},
 xSample:function(){S.f.upload={name:'구인요청_1권역_'+md(4).replace('.','')+'.xlsx'};work('xlsr',400,function(){});},
 xReset:function(){S.f.upload=null;renderStaff();},
 xApply:function(){var ok=XLS.filter(function(x){return !xCheck(x);});work('xls',600,function(){ok.forEach(function(x){R.push({id:nextId++,store:x[0],d:x[1],sec:x[2],st:x[3],en:x[4],br:60,need:x[5],workers:[],seen:true,chg:null,partners:[],at:Date.now(),src:'xls'});});S.f.upload.done=ok.length;S.f.upload.bad=XLS.length-ok.length;toast(ok.length+'건을 반영했습니다');});},
 wSel:function(d,el){S.f.sel[d.id]=el.checked;renderStaff();},
 wAll:function(d,el){wFiltered().forEach(function(w){S.f.sel[w.id]=el.checked;});renderStaff();},
 wClear:function(){S.f.wq='';S.f.wstore='all';renderStaff();},
 mT:function(d){S.f.sms={tpl:+d.v,txt:TPL[+d.v][1]};renderStaff();},
 mConfirm:function(){S.f.dlg='sms';renderStaff();},
 dlgNo:function(){S.f.dlg=null;renderStaff();},
 mSend:function(){var n=W.filter(function(w){return S.f.sel[w.id];}).length,b=bytes(S.f.sms.txt);work('sms',600,function(){SMSLOG.unshift({t:Date.now(),cnt:n,type:b>90?'LMS':'SMS',txt:S.f.sms.txt});S.f.dlg=null;S.f.sel={};S.f.sms={tpl:0,txt:''};S.f.view='workers';toast(n+'명에게 문자를 보냈습니다 (시안)');});},
 room:function(d){S.f.room=d.v;unread[d.v]=0;S.f.view='room';renderStaff();},
 tag:function(d){S.f.tag=S.f.tag===d.v?null:d.v;S.f.tagW='';renderStaff();var i=$('#chatIn');if(i)i.focus();},
 say:function(){var F=S.f,t=F.draft.trim();if(F.tag&&!F.tagW){toast('태그를 남길 근무자를 골라 주세요',1);return;}if(!t&&!F.tag){toast('메시지를 입력해 주세요',1);return;}
  var m={who:'박○○',me:1,t:Date.now(),txt:(F.tag?F.tagStore+' '+F.tagW+' ':'')+(t||F.tag+' 처리했습니다.'),tag:F.tag,ur:CHAT.rooms.filter(function(r){return r.id===F.room;})[0].mem-1};
  CHAT.msgs[F.room].push(m);F.draft='';F.tag=null;F.tagW='';renderStaff();
  var tick=function(){if(m.ur>0){m.ur=Math.max(0,m.ur-2);if(S.f.view==='room')renderStaff();if(m.ur)setTimeout(tick,1100);}};setTimeout(tick,1200);},
 acct:function(d){S.f.acct=d.v;renderStaff();},
 scope:function(d){S.f.scopeEdit=+d.i;S.f.scopeTmp=STAFF[+d.i].scope.slice();renderStaff();},
 scopeG:function(d,el){var g=+d.v,a=S.f.scopeTmp;if(el.checked){if(a.indexOf(g)<0)a.push(g);}else S.f.scopeTmp=a.filter(function(x){return x!==g;});S.f.scopeTmp.sort();renderStaff();},
 scopeNo:function(){S.f.scopeEdit=null;renderStaff();},
 scopeOk:function(){var i=S.f.scopeEdit;work('scope',400,function(){STAFF[i].scope=S.f.scopeTmp.slice();S.f.scopeEdit=null;toast(STAFF[i].n+' 조회 범위를 저장했습니다');});}
};
document.addEventListener('click',function(ev){var el=ev.target.closest('[data-a]');if(!el)return;
 if(el.classList.contains('scrim')&&ev.target.closest('[data-stop]'))return;
 if(el.tagName==='INPUT'&&el.type==='checkbox'){A[el.dataset.a](el.dataset,el);return;}
 ev.preventDefault();if(el.disabled)return;var f=A[el.dataset.a];if(f)f(el.dataset,el);});
document.addEventListener('input',function(ev){var t=ev.target,d=t.dataset;
 if(d.f){S.form[d.f]=d.f==='br'?+t.value:t.value;if(d.f==='st'||d.f==='en'){delete S.form.err.time;}}
 if(d.p){S.pf[d.p]=d.p==='ph'?t.value.replace(/\D/g,'').slice(0,4):t.value;if(d.p==='ph')t.value=S.pf.ph;}
 if(d.e){var e=S.f.entries[+d.i];e[d.e]=t.type==='checkbox'?t.checked:d.e==='ph'?t.value.replace(/\D/g,'').slice(0,4):t.value;if(d.e==='ph')t.value=e.ph;}
 if(d.g==='smsTxt'){S.f.sms.txt=t.value;var b=bytes(t.value);$('#smsB').textContent=b+' / '+(b>90?'2000바이트 · 장문(LMS)':'90바이트 · 단문(SMS)');}
 else if(d.g==='draft')S.f.draft=t.value;
 else if(d.g==='wq'){S.f.wq=t.value;clearTimeout(A.wqT);A.wqT=setTimeout(function(){renderStaff();var q=$('#wq');if(q){q.focus();q.setSelectionRange(q.value.length,q.value.length);}},250);}
});
document.addEventListener('change',function(ev){var t=ev.target,d=t.dataset;
 if(d.g==='aggStore'||d.g==='wstore'||d.g==='tagStore'||d.g==='tagW'){S.f[d.g]=t.value;if(d.g==='tagStore')S.f.tagW='';renderStaff();}
 if(d.e==='wid'||d.e==='pi'||d.e==='age'){S.f.entries[+d.i][d.e]=t.value;}
 if(t.id==='xlsIn'&&t.files[0]){S.f.upload={name:t.files[0].name};work('xlsr',400,function(){});}
 if(d.f==='st'||d.f==='en'||d.f==='br'){S.form[d.f]=d.f==='br'?+t.value:t.value;}
});
document.addEventListener('keydown',function(ev){if(ev.key==='Enter'&&ev.target.id==='chatIn'){ev.preventDefault();A.say();}
 if(ev.key==='Escape'){if(S.st.sheet){S.st.sheet=null;renderStore();}if(S.f.dlg||S.f.scopeEdit!=null){S.f.dlg=null;S.f.scopeEdit=null;renderStaff();}}});
render();
})();
