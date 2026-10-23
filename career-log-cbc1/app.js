(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s);};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});};
var ic=function(n){return '<svg class="i" aria-hidden="true"><use href="#i-'+n+'"/></svg>';};
var p2=function(n){return String(n).padStart(2,'0');};
var T0=new Date();T0.setHours(0,0,0,0);
var dOf=function(o){var d=new Date(T0);d.setDate(d.getDate()+o);return d;};
var ymd=function(d){return d.getFullYear()+'.'+p2(d.getMonth()+1)+'.'+p2(d.getDate());};
var md=function(d){return p2(d.getMonth()+1)+'.'+p2(d.getDate());};
var hm=function(t){var d=new Date(t);return p2(d.getHours())+':'+p2(d.getMinutes());};
var stamp=function(t){var d=new Date(t);return ymd(d)+' '+hm(t);};
var seed=7;var rnd=function(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};
var pick=function(a){return a[Math.floor(rnd()*a.length)];};

/* ---------- data ---------- */
var DEPTS=[{k:'E',n:'스마트전기과',cls:[1,2],jobs:['전기설비 시공','전기 유지보수']},{k:'C',n:'디지털콘텐츠과',cls:[3,4],jobs:['웹디자이너','영상 편집']},{k:'F',n:'조리외식과',cls:[5,6],jobs:['호텔 조리','제과·제빵']}];
var deptOf=function(c){return DEPTS.filter(function(d){return d.cls.indexOf(c)>=0;})[0];};
var SPEC={
 '전기설비 시공':[['전기기능사','자격증','필수'],['산업안전보건교육 16시간','교육','필수'],['승강기기능사','자격증','권장'],['컴퓨터활용능력 2급','자격증','권장']],
 '전기 유지보수':[['전기기능사','자격증','필수'],['산업안전보건교육 16시간','교육','필수'],['공조냉동기계기능사','자격증','권장']],
 '웹디자이너':[['웹디자인기능사','자격증','필수'],['포트폴리오 5건 이상','포트폴리오','필수'],['GTQ 1급','자격증','권장'],['컴퓨터그래픽스운용기능사','자격증','권장']],
 '영상 편집':[['영상 포트폴리오 3건 이상','포트폴리오','필수'],['GTQ 1급','자격증','권장'],['컴퓨터그래픽스운용기능사','자격증','권장']],
 '호텔 조리':[['한식조리기능사','자격증','필수'],['위생교육 이수','교육','필수'],['양식조리기능사','자격증','권장'],['TOEIC 500점 이상','어학','권장']],
 '제과·제빵':[['제과기능사','자격증','필수'],['제빵기능사','자격증','필수'],['위생교육 이수','교육','필수']]};
var GUIDE={'전기기능사':'다음 정기 필기 접수 안내를 학과 게시판에 공지합니다 (예시 일정)','승강기기능사':'방과후 승강기 실습반 수요 조사 중','컴퓨터활용능력 2급':'교내 방과후 컴활반 수강 가능','공조냉동기계기능사':'3학년 2학기 방과후반 개설 예정','웹디자인기능사':'실기 대비 주 2회 방과후반','GTQ 1급':'교내 단체 응시 신청 가능','컴퓨터그래픽스운용기능사':'필기 면제 기간 확인 필요','한식조리기능사':'조리실 개방 실습 화·목','양식조리기능사':'실기 과제 15종 교내 연습','TOEIC 500점 이상':'교육청 원어민 회화반 연계','제과기능사':'제과실 주말 개방 신청','제빵기능사':'제빵 실기 20종 연습 일정 공유','산업안전보건교육 16시간':'현장실습 전 필수, 온라인 이수 가능','위생교육 이수':'현장실습 전 필수, 반나절 집합 교육','포트폴리오 5건 이상':'수업 결과물 중 2건 보완 권장','영상 포트폴리오 3건 이상':'교내 홍보 영상 제작 참여로 보완'};
var CERTS={E:['전기기능사','승강기기능사','컴퓨터활용능력 2급','공조냉동기계기능사'],C:['웹디자인기능사','GTQ 1급','컴퓨터그래픽스운용기능사','컴퓨터활용능력 2급'],F:['한식조리기능사','양식조리기능사','제과기능사','제빵기능사']};
var COMP=[{id:'A',n:'전기설비 A사',ind:'전기공사',job:'전기설비 시공',pay:210,per:'11.03~12.19',cap:6,dept:'E'},{id:'B',n:'빌딩관리 B사',ind:'시설관리',job:'전기 유지보수',pay:200,per:'11.03~12.19',cap:5,dept:'E'},{id:'C',n:'웹에이전시 C사',ind:'디지털 광고',job:'웹디자이너',pay:205,per:'11.10~12.26',cap:4,dept:'C'},{id:'D',n:'영상제작 D사',ind:'방송·영상',job:'영상 편집',pay:200,per:'11.10~12.26',cap:4,dept:'C'},{id:'E',n:'호텔조리 E사',ind:'숙박·식음',job:'호텔 조리',pay:215,per:'11.03~12.19',cap:6,dept:'F'},{id:'F',n:'베이커리 F사',ind:'제과 제조',job:'제과·제빵',pay:205,per:'11.17~12.31',cap:4,dept:'F'}];
var compById=function(id){return COMP.filter(function(c){return c.id===id;})[0];};
var SUR='김이박최정강조윤장임한오서신권황안송류홍전고문양손배';
var ST=[];
(function(){for(var c=1;c<=6;c++){var dp=deptOf(c);for(var n=1;n<=25;n++){
  var job=dp.jobs[(n+c)%2],spec=SPEC[job],certs=[];
  spec.forEach(function(s,i){if(rnd()<(s[2]==='필수'?.55:.35)){var o=-Math.floor(rnd()*300+20);certs.push({n:s[0],kind:s[1],date:ymd(dOf(o)),proof:s[1]==='교육'?'수료증':'사진 1장',ok:rnd()<.85});}});
  var r=rnd(),match=r<.62?'파견 중':r<.8?'매칭 완료':r<.93?'매칭 대기':'미신청';
  var comp=match==='파견 중'||match==='매칭 완료'?COMP.filter(function(x){return x.dept===dp.k;})[(n+c)%2].id:null;
  var con=null;if(comp){var a=rnd();con={agr:match==='파견 중'||a<.7?'완료':'대기',stu:match==='파견 중'||a<.8?'완료':'대기',par:match==='파견 중'?'완료':a<.45?'완료':a<.75?'미요청':'발송',parAt:null,sentAt:null};
   if(con.par==='완료')con.parAt=Date.now()-Math.floor(rnd()*20+2)*86400000-Math.floor(rnd()*600)*60000;if(con.par==='발송')con.sentAt=Date.now()-Math.floor(rnd()*3+1)*86400000;}
  var e=rnd(),emp=match==='파견 중'&&e<.55?'취업 확정':e<.18?'진학':'미정';
  ST.push({id:'3-'+c+'-'+p2(n),c:c,no:n,n:SUR.charAt((c*7+n*3)%SUR.length)+'○○',dept:dp,job:job,goal:'',certs:certs,match:match,comp:comp,con:con,emp:emp,ph:String(1000+Math.floor(rnd()*8999)),vers:[],memos:[]});}}})();
var TGT=ST.filter(function(s){return s.id==='3-1-04';})[0];
TGT.n='박○○';TGT.job='전기설비 시공';TGT.match='매칭 완료';TGT.comp='A';TGT.emp='미정';TGT.ph='4417';
TGT.con={agr:'완료',stu:'완료',par:'미요청',parAt:null,sentAt:null};
TGT.certs=[{n:'컴퓨터활용능력 2급',kind:'자격증',date:ymd(dOf(-210)),proof:'사진 1장',ok:true},{n:'산업안전보건교육 16시간',kind:'교육',date:ymd(dOf(-32)),proof:'수료증',ok:true},{n:'교내 전기공사 경진대회 장려상',kind:'수상',date:ymd(dOf(-58)),proof:'상장 사진',ok:false}];
TGT.goal='졸업 후 전기공사 현장에서 3년 일하며 전기산업기사 취득';
TGT.vers=[{v:'v1',d:ymd(dOf(-64)),t:'자기소개서 초안',c:'경험 위주로 다시 쓰기 권함'},{v:'v2',d:ymd(dOf(-23)),t:'자기소개서 수정본 + 실습 사진 포트폴리오',c:'현장실습 지원 가능 수준'}];
TGT.memos=[{d:ymd(dOf(-23)),w:'정○○',t:'전기기능사 필기 준비 중. 실기는 학교 실습실에서 주 2회 연습 희망.'}];
ST.forEach(function(s){if(!s.goal)s.goal=s.job+' 분야 취업';});
var LOG=[{d:ymd(dOf(-6)),comp:'전기설비 A사',stu:'김○○ 외 3명',t:'정○○',r:'양호',m:'안전모·안전화 착용 확인'},{d:ymd(dOf(-4)),comp:'호텔조리 E사',stu:'이○○ 외 4명',t:'오○○',r:'주의',m:'야간 근무 편성 여부 재확인 요청'},{d:ymd(dOf(-2)),comp:'웹에이전시 C사',stu:'최○○ 외 2명',t:'최○○',r:'양호',m:'담당 멘토 지정 확인'}];
var SENT=[{at:Date.now()-2*86400000-3600000,tpl:'동의서 서명 요청',to:ST.filter(function(s){return s.con&&s.con.par==='발송';}).length,ok:0,sms:0,un:0,rows:[]}];
(function(){var b=SENT[0];ST.filter(function(s){return s.con&&s.con.par==='발송';}).forEach(function(s,i){var r=i%5===3?'미확인':i%7===2?'문자 대체':'알림톡 성공';b.rows.push({s:s,r:r});if(r==='미확인')b.un++;else if(r==='문자 대체')b.sms++;else b.ok++;});})();

var ROLES={hr:{n:'담임',who:'3학년 1반 담임 정○○',f:function(s){return s.c===1;},sc:'3학년 1반 25명'},job:{n:'취업지원부',who:'취업지원부 최○○',f:function(){return true;},sc:'3학년 전체 150명'},all:{n:'총괄',who:'교감 윤○○',f:function(){return true;},sc:'전 학년 · 결재 권한'}};

/* ---------- state ---------- */
var S={view:'teacher',page:'dash',role:'job',sid:null,f:{dept:'all',c:'all',q:''},
 nf:{dept:'all',job:'all',cert:'all',unsigned:true,tpl:0},rem:null,ov:null,upload:null,hit:null,
 par:{step:0,ph:'',codeSent:false,code:'',err:{},agree:[false,false,false],name:'',rel:'모',strokes:[]},
 stu:{tab:'hist',form:{kind:'자격증',n:'',date:ymd(dOf(-3)),photo:null},err:{}},
 rptSid:'3-1-04',memo:'',appr:null,step:0};
var busy={};
var vis=function(){return ST.filter(ROLES[S.role].f);};
var unsigned=function(){return vis().filter(function(s){return s.con&&s.con.par!=='완료';}).sort(function(a,b){return a.id<b.id?-1:1;});};

function toast(m,bad){var h=$('#toastHost'),el=document.createElement('div');el.className='toast'+(bad?' bad':'');el.innerHTML=ic(bad?'alert':'check')+'<span>'+esc(m)+'</span>';h.appendChild(el);setTimeout(function(){el.remove();},3200);}
function work(k,ms,fn){if(busy[k])return;busy[k]=1;render();setTimeout(function(){busy[k]=0;fn();render();},ms);}
var bb=function(k,l,cls,attr){return busy[k]?'<button class="btn '+(cls||'')+'" aria-busy="true" disabled><span class="spin"></span>'+l[1]+'</button>':'<button class="btn '+(cls||'')+'" '+attr+'>'+l[0]+'</button>';};
var parLb=function(c){if(!c)return '<span class="lb no">해당 없음</span>';var m={'완료':['ok','완료'],'발송':['pg','발송'],'열람':['rd','열람'],'미요청':['no','미요청']}[c.par];
 return '<span class="lb '+m[0]+'">'+m[1]+'</span>'+(c.par==='완료'?'<span class="ts">'+stamp(c.parAt)+'</span>':c.sentAt?'<span class="ts">'+md(new Date(c.sentAt))+' '+hm(c.sentAt)+' 발송</span>':'');};
var simpleLb=function(v){return v==='완료'?'<span class="lb ok">완료</span>':v==='대기'?'<span class="lb pg">대기</span>':'<span class="lb no">'+esc(v)+'</span>';};
var csv=function(name,rows){var s='﻿'+rows.map(function(r){return r.map(function(x){x=String(x);return /[",\r\n]/.test(x)?'"'+x.replace(/"/g,'""')+'"':x;}).join(',');}).join('\r\n');var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([s],{type:'text/csv;charset=utf-8'}));a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},500);};

/* ============ teacher pages ============ */
function pDash(){var v=vis(),dis=v.filter(function(s){return s.match==='파견 중'||s.match==='매칭 완료';}).length,emp=v.filter(function(s){return s.emp==='취업 확정';}).length,un=unsigned();
 var recent=ST.filter(function(s){return s.con&&s.con.par==='완료'&&s.con.parAt>Date.now()-3600000&&ROLES[S.role].f(s);});
 var bars=DEPTS.map(function(d){var ss=v.filter(function(s){return s.dept===d;});if(!ss.length)return '';var a=ss.filter(function(s){return s.match==='파견 중'||s.match==='매칭 완료';}).length,b=ss.filter(function(s){return s.emp==='취업 확정';}).length;
  return '<div class="rw"><b>'+d.n+'</b><div class="tr"><div class="ln a"><span class="bg"><i style="width:'+(a/ss.length*100)+'%"></i></span><span class="v">파견 '+Math.round(a/ss.length*100)+'%</span></div><div class="ln b"><span class="bg"><i style="width:'+(b/ss.length*100)+'%"></i></span><span class="v">취업 '+Math.round(b/ss.length*100)+'%</span></div></div></div>';}).join('');
 return '<div class="ph"><div><span class="crumb">'+ymd(T0)+' 기준 · '+ROLES[S.role].sc+'</span><h1>대시보드</h1></div></div>'+
 '<div class="kpi"><div><span class="k">3학년 재학생</span><span class="big">'+v.length+'<small>명</small></span><span class="s">'+(S.role==='hr'?'담당 학급':'3개 학과 6개 반')+'</span></div><div><span class="k">현장실습 파견율</span><span class="big">'+Math.round(dis/v.length*100)+'<small>%</small></span><span class="s">파견·매칭 '+dis+'명</span></div><div><span class="k">취업 확정률</span><span class="big">'+Math.round(emp/v.length*100)+'<small>%</small></span><span class="s">확정 '+emp+'명</span></div><div class="warn"><span class="k">동의서 미완료</span><span class="big">'+un.length+'<small>건</small></span><span class="s">학부모 동의서 기준</span></div></div>'+
 (recent.length?'<div class="alert ok">'+ic('check')+'<span>'+recent.map(function(s){return s.id+' '+s.n+' 학부모 서명 완료 ('+hm(s.con.parAt)+')';}).join(', ')+' · <button class="lnk" data-a="pdf" data-id="'+recent[0].id+'">동의서 PDF 보기</button></span></div>':'')+
 '<div class="grid2"><div><div class="sec"><h2>학과별 파견·취업</h2><span class="m">재적 대비 비율</span></div><div class="box"><div class="bars">'+bars+'</div><div class="legend"><span class="a">현장실습 파견·매칭</span><span class="b">취업 확정</span></div></div></div>'+
 '<div><div class="sec"><h2>학부모 동의서 미완료</h2><span class="m">'+un.length+'명</span></div>'+
 (un.length?'<div class="tw"><table class="t"><thead><tr><th>학번</th><th>이름</th><th>실습 기업</th><th>학부모 동의</th></tr></thead><tbody>'+un.slice(0,8).map(function(s){return '<tr><td class="num">'+s.id+'</td><td><button class="lnk" data-a="prof" data-id="'+s.id+'">'+s.n+'</button></td><td>'+compById(s.comp).n+'</td><td>'+parLb(s.con)+'</td></tr>';}).join('')+'</tbody></table></div>'+(un.length>8?'<p class="note">외 '+(un.length-8)+'명은 현장실습 메뉴에서 볼 수 있습니다.</p>':'')+
  '<div class="acts"><button class="btn pri" data-a="remind">'+ic('bell')+'독려 알림 보내기 ('+un.length+'명)</button></div>'
 :'<div class="empty">'+ic('check')+'<strong>미완료 동의서가 없습니다</strong><p>모든 학부모 동의서 서명이 끝났습니다.</p><button class="btn" data-a="go" data-v="practice">현장실습 서명 표 보기</button></div>')+'</div></div>';}
function pStudents(){var F=S.f,q=F.q.trim();
 var ss=vis().filter(function(s){return (F.dept==='all'||s.dept.k===F.dept)&&(F.c==='all'||s.c===+F.c)&&(!q||s.n.indexOf(q)>=0||s.id.indexOf(q)>=0||s.job.indexOf(q)>=0);});
 var cls=S.role==='hr'?[1]:[1,2,3,4,5,6];
 return '<div class="ph"><div><span class="crumb">학생 관리</span><h1>학생 목록</h1></div><div class="acts"><button class="btn" data-a="go" data-v="upload">'+ic('ul')+'엑셀 일괄 업로드</button></div></div>'+
 '<div class="flt"><label>학과<select data-g="dept"'+(S.role==='hr'?' disabled':'')+'><option value="all">전체</option>'+DEPTS.map(function(d){return '<option value="'+d.k+'"'+(F.dept===d.k?' selected':'')+'>'+d.n+'</option>';}).join('')+'</select></label><label>반<select data-g="c"><option value="all">전체</option>'+cls.map(function(c){return '<option value="'+c+'"'+(String(F.c)===String(c)?' selected':'')+'>3학년 '+c+'반</option>';}).join('')+'</select></label><label>검색<input type="search" data-g="q" value="'+esc(F.q)+'" placeholder="학번, 성, 희망 직무"></label></div>'+
 (ss.length?'<div class="tw"><table class="t"><thead><tr><th>학번</th><th>이름</th><th>학과</th><th>희망 직무</th><th class="n">자격·수상</th><th>확인 대기</th><th>현장실습</th><th>취업</th><th>학부모 동의</th></tr></thead><tbody>'+
 ss.map(function(s){var w=s.certs.filter(function(x){return !x.ok;}).length;return '<tr'+(S.hit===s.id?' class="hit"':'')+'><td class="num">'+s.id+'</td><td><button class="lnk" data-a="prof" data-id="'+s.id+'">'+s.n+'</button></td><td>'+s.dept.n+'</td><td>'+s.job+'</td><td class="n">'+s.certs.length+'</td><td>'+(w?'<span class="lb pg">'+w+'건</span>':'-')+'</td><td>'+s.match+'</td><td>'+(s.emp==='취업 확정'?'<span class="lb ok">취업 확정</span>':s.emp)+'</td><td>'+(s.con?parLb(s.con).replace(/<span class="ts">.*<\/span>/,''):'-')+'</td></tr>';}).join('')+'</tbody></table></div><p class="note">'+ss.length+'명 · 이름을 누르면 학생 프로필로 이동합니다.</p>'
 :'<div class="empty">'+ic('search')+'<strong>조건에 맞는 학생이 없습니다</strong><p>검색어를 줄이거나 학과·반 필터를 전체로 바꿔 보세요.</p><button class="btn pri" data-a="fClear">필터 지우기</button></div>');}
function pProfile(){var s=ST.filter(function(x){return x.id===S.sid;})[0],c=s.con;
 return '<div class="ph"><div><span class="crumb"><button class="lnk" data-a="go" data-v="students">학생 목록</button> / 프로필</span><h1>'+s.id+' '+s.n+'</h1></div><div class="acts"><button class="btn" data-a="rpt" data-id="'+s.id+'">'+ic('map')+'진로 리포트</button></div></div>'+
 '<dl class="kv"><dt>학과·반</dt><dd>'+s.dept.n+' 3학년 '+s.c+'반 '+s.no+'번</dd><dt>보호자 연락처</dt><dd class="num">끝 4자리 '+s.ph+'</dd><dt>희망 직무</dt><dd>'+s.job+'</dd><dt>진로 목표</dt><dd>'+esc(s.goal)+'</dd><dt>현장실습</dt><dd>'+s.match+(s.comp?' · '+compById(s.comp).n:'')+'</dd><dt>취업</dt><dd>'+s.emp+'</dd></dl>'+
 '<div class="sec"><h2>자격증·수상·어학</h2><span class="m">'+s.certs.length+'건 · 증빙과 교사 확인</span></div>'+
 (s.certs.length?'<div class="tw"><table class="t"><thead><tr><th>구분</th><th>명칭</th><th>취득일</th><th>증빙</th><th>교사 확인</th></tr></thead><tbody>'+s.certs.map(function(x,i){return '<tr'+(x.isNew?' class="hit"':'')+'><td>'+x.kind+'</td><td>'+esc(x.n)+'</td><td class="num">'+x.date+'</td><td>'+(x.proof?ic('file')+' '+esc(x.proof):'-')+'</td><td>'+(x.ok?'<span class="lb ok">확인</span>':bb('ck'+i,['확인 처리','처리 중'],'sm','data-a="certOk" data-i="'+i+'"'))+'</td></tr>';}).join('')+'</tbody></table></div>':'<div class="empty">'+ic('award')+'<strong>등록된 이력이 없습니다</strong><p>학생이 휴대폰에서 등록하거나 엑셀로 일괄 등록할 수 있습니다.</p><button class="btn" data-a="go" data-v="upload">엑셀 일괄 업로드</button></div>')+
 '<div class="grid2"><div><div class="sec"><h2>자기소개서·포트폴리오</h2><span class="m">버전 기록</span></div><div class="box">'+(s.vers.length?'<ul class="vers">'+s.vers.map(function(v){return '<li><span class="v">'+v.v+'</span><span style="flex:1">'+esc(v.t)+'<span class="ts">'+v.d+' · 교사 의견: '+esc(v.c)+'</span></span><button class="ib" aria-label="'+v.v+' 파일 보기" title="파일 보기">'+ic('file')+'</button></li>';}).join('')+'</ul>':'<p class="note" style="margin:0">아직 올린 파일이 없습니다.</p>')+'</div></div>'+
 '<div><div class="sec"><h2>현장실습 서명 3종</h2></div>'+(c?'<div class="tw"><table class="t"><thead><tr><th>표준협약서</th><th>학생 동의서</th><th>학부모 동의서</th></tr></thead><tbody><tr><td>'+simpleLb(c.agr)+'</td><td>'+simpleLb(c.stu)+'</td><td>'+parLb(c)+(c.par==='완료'?' <button class="lnk" data-a="pdf" data-id="'+s.id+'">PDF</button>':'')+'</td></tr></tbody></table></div>':'<p class="note">매칭 전이라 서명 대상이 아닙니다.</p>')+'</div></div>';}
var UPL=[['3-2-03','이○○','자격증','승강기기능사','2026.09.18',''],['3-2-07','김○○','자격증','전기기능사','2026.08.29',''],['3-3-1','최○○','자격증','GTQ 1급','2026.09.02','학번 형식 오류 (3-3-01처럼 입력)'],['3-3-11','정○○','어학','TOEIC 555점','2026.07.12',''],['3-4-05','한○○','자격증','웹디자인 기능사','2026.09.21','등록되지 않은 자격증명'],['3-5-14','강○○','자격증','한식조리기능사','2026.09.30',''],['3-5-14','강○○','자격증','한식조리기능사','2026.09.30','같은 파일 안 중복 행'],['3-6-02','조○○','자격증','제과기능사','2027.01.15','취득일이 오늘 이후']];
function pUpload(){var U=S.upload;
 var head='<div class="ph"><div><span class="crumb"><button class="lnk" data-a="go" data-v="students">학생 목록</button> / 일괄 업로드</span><h1>자격증·어학 엑셀 일괄 업로드</h1></div></div>';
 var steps='<div class="box"><b>1. 양식 내려받기</b><p class="note" style="margin:4px 0 10px">학번(3-1-04 형식), 이름, 구분, 명칭, 취득일 열. 엑셀에서 바로 열립니다.</p><button class="btn" data-a="tplDl">'+ic('dl')+'업로드 양식 내려받기</button></div>';
 if(!U)return head+steps+'<div class="sec"><h2>2. 파일 올리기</h2></div><div class="empty">'+ic('ul')+'<strong>작성한 파일을 올려 주세요</strong><p>올리면 반영 전에 행별 검사 결과를 먼저 보여 드립니다.</p><div class="acts" style="justify-content:center"><label class="btn pri" for="upIn">'+ic('file')+'파일 선택</label><input type="file" id="upIn" class="sr" accept=".xlsx,.xls,.csv"><button class="btn" data-a="upSample">예시 파일로 보기</button></div></div>';
 var ok=UPL.filter(function(r){return !r[5];}).length;
 if(U.done)return head+'<div class="alert ok">'+ic('check')+'<span>'+U.done+'건을 학생 이력에 반영했습니다. 교사 확인 대기 상태로 들어갑니다. 오류 '+(UPL.length-ok)+'건은 파일을 고쳐 다시 올려 주세요.</span></div><div class="acts"><button class="btn" data-a="upReset">다른 파일 올리기</button><button class="btn pri" data-a="go" data-v="students">학생 목록 보기</button></div>';
 return head+'<dl class="kv"><dt>파일</dt><dd>'+esc(U.name)+'</dd><dt>검사 결과</dt><dd><span class="lb ok">정상 '+ok+'</span> <span class="lb bad">오류 '+(UPL.length-ok)+'</span></dd></dl>'+
 '<div class="sec"><h2>행별 검사 결과</h2><span class="m">'+UPL.length+'행</span></div><div class="tw"><table class="t"><thead><tr><th class="n">행</th><th>검사</th><th>학번</th><th>이름</th><th>구분</th><th>명칭</th><th>취득일</th></tr></thead><tbody>'+
 UPL.map(function(r,i){return '<tr'+(r[5]?' class="err"':'')+'><td class="n">'+(i+2)+'</td><td>'+(r[5]?'<span class="lb bad">'+r[5]+'</span>':'<span class="lb ok">정상</span>')+'</td><td class="num">'+r[0]+'</td><td>'+r[1]+'</td><td>'+r[2]+'</td><td>'+r[3]+'</td><td class="num">'+r[4]+'</td></tr>';}).join('')+'</tbody></table></div>'+
 '<div class="acts"><button class="btn" data-a="upReset">취소</button>'+bb('up',['정상 '+ok+'건 반영','반영하는 중'],'pri','data-a="upApply"')+'</div>';}
function pPractice(){var v=vis(),m=v.filter(function(s){return s.con;});
 return '<div class="ph"><div><span class="crumb">현장실습</span><h1>기업 공고와 서명 진행</h1></div></div>'+
 '<div class="sec" style="margin-top:0"><h2>현장실습 기업 공고</h2><span class="m">'+COMP.length+'건 · 기업명은 가상</span></div><div class="tw"><table class="t"><thead><tr><th>기업</th><th>업종</th><th>직무</th><th class="n">수당(월)</th><th>기간</th><th class="n">모집</th><th class="n">매칭</th><th>상태</th></tr></thead><tbody>'+
 COMP.map(function(c){var k=ST.filter(function(s){return s.comp===c.id;}).length;return '<tr><td>'+c.n+'</td><td>'+c.ind+'</td><td>'+c.job+'</td><td class="n">'+c.pay+'만 원</td><td class="num">'+c.per+'</td><td class="n">'+c.cap+'</td><td class="n">'+Math.min(k,c.cap)+'</td><td>'+(k>=c.cap?'<span class="lb ok">마감</span>':'<span class="lb pg">모집 중</span>')+'</td></tr>';}).join('')+'</tbody></table></div>'+
 '<div class="sec"><h2>학생별 서명 3종 진행</h2><span class="m">'+m.length+'명 · 표준협약서·학생·학부모</span></div><div class="tw"><table class="t"><thead><tr><th>학번</th><th>이름</th><th>기업</th><th>매칭</th><th>표준협약서</th><th>학생 동의서</th><th>학부모 동의서</th><th></th></tr></thead><tbody>'+
 m.sort(function(a,b){return (a.con.par==='완료')-(b.con.par==='완료')||(a.id<b.id?-1:1);}).map(function(s){return '<tr'+(S.hit===s.id?' class="hit"':'')+'><td class="num">'+s.id+'</td><td>'+s.n+'</td><td>'+compById(s.comp).n+'</td><td>'+s.match+'</td><td>'+simpleLb(s.con.agr)+'</td><td>'+simpleLb(s.con.stu)+'</td><td>'+parLb(s.con)+'</td><td>'+(s.con.par==='완료'?'<button class="lnk" data-a="pdf" data-id="'+s.id+'">PDF</button>':'')+'</td></tr>';}).join('')+'</tbody></table></div>';}
function gapOf(s){return SPEC[s.job].map(function(x){var h=s.certs.filter(function(c){return c.n===x[0];})[0];return {item:x[0],kind:x[1],need:x[2],have:h};});}
function rptA4(s){var g=gapOf(s),miss=g.filter(function(x){return !x.have;});
 return '<div class="a4 printable"><h1>진로 가이드 리포트</h1><div class="dn">'+ymd(T0)+' 발행 · ○○고등학교 취업지원부</div>'+
 '<table><tr><th>학번·이름</th><td>'+s.id+' '+s.n+'</td><th>학과</th><td>'+s.dept.n+'</td></tr><tr><th>희망 직무</th><td>'+s.job+'</td><th>진로 목표</th><td>'+esc(s.goal)+'</td></tr></table>'+
 '<b>희망 직무 권장 스펙 대비 현황</b><table class="rpt"><tr><th>항목</th><th>구분</th><th>권장</th><th>보유</th></tr>'+g.map(function(x){return '<tr><td>'+x.item+'</td><td>'+x.kind+'</td><td>'+x.need+'</td><td'+(x.have?'':' class="miss"')+'>'+(x.have?'보유 ('+x.have.date+')':'미취득')+'</td></tr>';}).join('')+'</table>'+
 '<b>보완 안내</b><ol>'+(miss.length?miss.map(function(x){return '<li>'+x.item+': '+(GUIDE[x.item]||'담당 교사와 상담')+'</li>';}).join(''):'<li>권장 스펙을 모두 갖췄습니다. 면접 준비를 권합니다.</li>')+'</ol>'+
 '<b>상담 기록</b><table><tr><th>일자</th><th>교사</th><th>내용</th></tr>'+(s.memos.length?s.memos.map(function(m){return '<tr><td>'+m.d+'</td><td>'+m.w+'</td><td>'+esc(m.t)+'</td></tr>';}).join(''):'<tr><td colspan="3">기록 없음</td></tr>')+'</table>'+
 '<div class="foot2">이 리포트는 학생 이력 데이터로 자동 작성되며, 담당 교사 확인 후 학생·학부모에게 전달합니다.</div></div>';}
function pReport(){var list=vis(),s=ST.filter(function(x){return x.id===S.rptSid;})[0];if(!s||!ROLES[S.role].f(s)){s=list[0];S.rptSid=s.id;}var g=gapOf(s),miss=g.filter(function(x){return !x.have;});
 return '<div class="ph"><div><span class="crumb">진로 가이드</span><h1>진로 가이드 리포트</h1></div><div class="acts"><button class="btn" data-a="rptPrint">'+ic('print')+'인쇄용 화면</button></div></div>'+
 '<div class="flt"><label>학생<select data-g="rptSid">'+list.map(function(x){return '<option value="'+x.id+'"'+(x.id===s.id?' selected':'')+'>'+x.id+' '+x.n+' · '+x.job+'</option>';}).join('')+'</select></label></div>'+
 '<div class="sec" style="margin-top:4px"><h2>'+s.job+' 권장 스펙 대비</h2><span class="m">보유 '+(g.length-miss.length)+' / '+g.length+' · 부족 '+miss.length+'</span></div>'+
 '<div class="tw"><table class="t gap"><thead><tr><th>항목</th><th>구분</th><th>권장</th><th>보유</th><th>보완 안내</th></tr></thead><tbody>'+g.map(function(x){return '<tr><td>'+x.item+'</td><td>'+x.kind+'</td><td>'+(x.need==='필수'?'<span class="lb ac">필수</span>':'<span class="lb no">권장</span>')+'</td><td'+(x.have?'':' class="miss"')+'>'+(x.have?'보유 '+x.have.date:'미취득')+'</td><td>'+(x.have?'-':(GUIDE[x.item]||''))+'</td></tr>';}).join('')+'</tbody></table></div>'+
 '<div class="sec"><h2>상담 메모</h2><span class="m">'+s.memos.length+'건</span></div><div class="box">'+(s.memos.length?'<ul class="vers">'+s.memos.map(function(m){return '<li><span style="flex:1">'+esc(m.t)+'<span class="ts">'+m.d+' · '+m.w+'</span></span></li>';}).join('')+'</ul>':'<p class="note" style="margin:0 0 8px">아직 상담 기록이 없습니다.</p>')+
 '<label class="sr" for="memoIn">상담 메모</label><textarea id="memoIn" data-g="memo" maxlength="200" placeholder="상담 내용을 적어 주세요">'+esc(S.memo)+'</textarea><div class="acts">'+bb('memo',['메모 저장','저장하는 중'],'pri','data-a="memoSave"')+'</div></div>';}
var TPL=[['동의서 서명 요청','#{학생명} 학생 보호자님, 안녕하세요. ○○고등학교 취업지원부입니다.\n현장실습(#{기업명}) 학부모 동의서 서명이 필요합니다.\n#{마감일}까지 아래 버튼을 눌러 휴대폰으로 서명해 주세요.','par'],['자격증 접수 안내','#{학생명} 학생, #{자격증} 응시 준비 안내입니다.\n교내 방과후반 신청은 #{마감일}까지입니다.','stu'],['진로 상담 일정','#{학생명} 학생 보호자님, 진로 상담 일정을 안내드립니다.\n#{마감일} 방과 후 상담실에서 뵙겠습니다.','par']];
function nfTargets(){var N=S.nf;return vis().filter(function(s){return (N.dept==='all'||s.dept.k===N.dept)&&(N.job==='all'||s.job===N.job)&&(N.cert==='all'||!s.certs.some(function(c){return c.n===N.cert;}))&&(!N.unsigned||(s.con&&s.con.par!=='완료'));});}
function fill(t,s,mark){var due=md(dOf(5))+'('+'일월화수목금토'.charAt(dOf(5).getDay())+')';var v={'학생명':s?s.n:'김○○','기업명':s&&s.comp?compById(s.comp).n:'실습 기업','마감일':due,'자격증':S.nf.cert==='all'?'전기기능사':S.nf.cert};
 return t.replace(/#\{(.+?)\}/g,function(m,k){return mark?'<mark>'+esc(v[k])+'</mark>':v[k];});}
function sendBatch(list,ti){var b={at:Date.now(),tpl:TPL[ti][0],to:list.length,ok:0,sms:0,un:0,rows:[]};
 list.forEach(function(s,i){var r=s===TGT?'알림톡 성공':i%6===4?'문자 대체':i%9===7?'미확인':'알림톡 성공';b.rows.push({s:s,r:r});if(r==='미확인')b.un++;else if(r==='문자 대체')b.sms++;else b.ok++;
  if(TPL[ti][2]==='par'&&ti===0&&s.con&&s.con.par!=='완료'){s.con.par='발송';s.con.sentAt=Date.now();}});SENT.unshift(b);return b;}
function pNotify(){var N=S.nf,tg=nfTargets(),jobs=[];DEPTS.forEach(function(d){jobs=jobs.concat(d.jobs);});var certs=[];Object.keys(CERTS).forEach(function(k){CERTS[k].forEach(function(c){if(certs.indexOf(c)<0)certs.push(c);});});
 var last=SENT[0];
 return '<div class="ph"><div><span class="crumb">알림 발송</span><h1>조건별 알림 발송</h1></div></div>'+
 '<div class="flt"><label>학과<select data-n="dept"><option value="all">전체</option>'+DEPTS.map(function(d){return '<option value="'+d.k+'"'+(N.dept===d.k?' selected':'')+'>'+d.n+'</option>';}).join('')+'</select></label><label>희망 직무<select data-n="job"><option value="all">전체</option>'+jobs.map(function(j){return '<option'+(N.job===j?' selected':'')+'>'+j+'</option>';}).join('')+'</select></label><label>자격증 미보유<select data-n="cert"><option value="all">조건 없음</option>'+certs.map(function(c){return '<option'+(N.cert===c?' selected':'')+'>'+c+'</option>';}).join('')+'</select></label><label class="chk"><input type="checkbox" data-n="unsigned"'+(N.unsigned?' checked':'')+'>학부모 동의서 미제출</label></div>'+
 '<div class="grid2"><div><div class="sec" style="margin-top:4px"><h2>대상 '+tg.length+'명</h2><span class="m">'+ROLES[S.role].sc+' 안에서 추출</span></div>'+
 (tg.length?'<div class="tw" style="max-height:320px;overflow-y:auto"><table class="t"><thead><tr><th>학번</th><th>이름</th><th>희망 직무</th><th>학부모 동의</th></tr></thead><tbody>'+tg.map(function(s){return '<tr><td class="num">'+s.id+'</td><td>'+s.n+'</td><td>'+s.job+'</td><td>'+(s.con?parLb(s.con).replace(/<span class="ts">.*<\/span>/,''):'-')+'</td></tr>';}).join('')+'</tbody></table></div>':'<div class="empty">'+ic('inbox')+'<strong>조건에 맞는 대상이 없습니다</strong><p>조건을 하나씩 풀어 보세요.</p><button class="btn pri" data-a="nfClear">조건 지우기</button></div>')+'</div>'+
 '<div><div class="sec" style="margin-top:4px"><h2>템플릿과 미리보기</h2><span class="m">변수는 대상별로 바뀝니다</span></div><div class="box"><label class="sr" for="tplSel">템플릿</label><select id="tplSel" data-n="tpl" style="width:100%">'+TPL.map(function(t,i){return '<option value="'+i+'"'+(N.tpl===i?' selected':'')+'>'+t[0]+' ('+(t[2]==='par'?'보호자':'학생')+')</option>';}).join('')+'</select>'+
 '<p class="note" style="margin:10px 0 6px">원문: '+esc(TPL[N.tpl][1].split('\n')[0])+'</p><div class="tpl">'+fill(esc(TPL[N.tpl][1]),tg[0],true)+'</div><p class="note">알림톡을 받을 수 없는 번호는 같은 내용 문자로 대체 발송합니다.</p>'+
 '<div class="acts">'+bb('nf',['알림 보내기 ('+tg.length+'명)','보내는 중'],'pri','data-a="nfSend"'+(tg.length?'':' disabled'))+'</div></div></div></div>'+
 '<div class="sec"><h2>발송 이력</h2><span class="m">최근 '+SENT.length+'회</span></div><div class="tw"><table class="t"><thead><tr><th>발송 일시</th><th>템플릿</th><th class="n">대상</th><th class="n">알림톡 성공</th><th class="n">문자 대체</th><th class="n">미확인</th></tr></thead><tbody>'+SENT.map(function(b){return '<tr><td class="num">'+stamp(b.at)+'</td><td>'+b.tpl+'</td><td class="n">'+b.to+'</td><td class="n">'+b.ok+'</td><td class="n">'+b.sms+'</td><td class="n">'+b.un+'</td></tr>';}).join('')+'</tbody></table></div>'+
 '<div class="sec"><h2>최근 발송 상세</h2><span class="m">'+stamp(last.at)+' · '+last.tpl+'</span></div><div class="tw"><table class="t"><thead><tr><th>학번</th><th>이름</th><th>결과</th><th></th></tr></thead><tbody>'+last.rows.slice(0,12).map(function(r,i){return '<tr><td class="num">'+r.s.id+'</td><td>'+r.s.n+'</td><td>'+(r.r==='알림톡 성공'?'<span class="lb ok">알림톡 성공</span>':r.r==='문자 대체'?'<span class="lb rd">문자 대체</span>':'<span class="lb pg">미확인</span>')+'</td><td>'+(r.r==='미확인'?bb('re'+i,['재발송','보내는 중'],'sm','data-a="resend" data-i="'+i+'"'):'')+'</td></tr>';}).join('')+'</tbody></table></div>';}
function statRows(){var cls=S.role==='hr'?[1]:[1,2,3,4,5,6];return cls.map(function(c){var ss=ST.filter(function(s){return s.c===c;});var a=ss.filter(function(s){return s.match==='파견 중'||s.match==='매칭 완료';}).length,e=ss.filter(function(s){return s.emp==='취업 확정';}).length,g=ss.filter(function(s){return s.emp==='진학';}).length;return {c:c,d:deptOf(c).n,n:ss.length,a:a,e:e,g:g,u:ss.length-e-g};});}
function pStats(){var rs=statRows(),t={n:0,a:0,e:0,g:0,u:0};rs.forEach(function(r){['n','a','e','g','u'].forEach(function(k){t[k]+=r[k];});});
 var can=S.role!=='hr';
 return '<div class="ph"><div><span class="crumb">통계</span><h1>학과·학급별 취업 통계</h1></div><div class="acts">'+(can?'<button class="btn pri" data-a="edu">'+ic('dl')+'교육청 보고 양식 엑셀 추출</button>':'')+'</div></div>'+
 (can?'':'<div class="alert info">'+ic('lock')+'<span>담임 권한에서는 담당 학급 통계만 보입니다. 교육청 보고 양식 추출은 취업지원부·총괄 권한에서 할 수 있습니다.</span></div>')+
 '<div class="tw"><table class="t"><thead><tr><th>반</th><th>학과</th><th class="n">재적</th><th class="n">현장실습</th><th class="n">취업 확정</th><th class="n">진학</th><th class="n">미정</th><th class="n">취업률</th></tr></thead><tbody>'+rs.map(function(r){return '<tr><td>3학년 '+r.c+'반</td><td>'+r.d+'</td><td class="n">'+r.n+'</td><td class="n">'+r.a+'</td><td class="n">'+r.e+'</td><td class="n">'+r.g+'</td><td class="n">'+r.u+'</td><td class="n">'+Math.round(r.e/(r.n-r.g)*100)+'%</td></tr>';}).join('')+'</tbody><tfoot><tr><td>합계</td><td></td><td class="n">'+t.n+'</td><td class="n">'+t.a+'</td><td class="n">'+t.e+'</td><td class="n">'+t.g+'</td><td class="n">'+t.u+'</td><td class="n">'+Math.round(t.e/(t.n-t.g)*100)+'%</td></tr></tfoot></table></div><p class="note">취업률 = 취업 확정 ÷ (재적 − 진학). 산식은 교육청 보고 기준에 맞춰 바꿀 수 있습니다.</p>'+
 '<div class="sec"><h2>현장 점검 일지</h2><span class="m">'+LOG.length+'건</span></div><div class="tw"><table class="t"><thead><tr><th>점검일</th><th>기업</th><th>대상 학생</th><th>점검 교사</th><th>결과</th><th>메모</th></tr></thead><tbody>'+LOG.map(function(l,i){return '<tr'+(l.isNew?' class="hit"':'')+'><td class="num">'+l.d+'</td><td>'+l.comp+'</td><td>'+l.stu+'</td><td>'+l.t+'</td><td>'+(l.r==='양호'?'<span class="lb ok">양호</span>':l.r==='주의'?'<span class="lb pg">주의</span>':'<span class="lb bad">개선 요청</span>')+'</td><td>'+esc(l.m)+'</td></tr>';}).join('')+'</tbody></table></div>'+
 '<div class="flt" style="margin-top:8px"><label>기업<select data-l="comp">'+COMP.map(function(c){return '<option>'+c.n+'</option>';}).join('')+'</select></label><label>결과<select data-l="r"><option>양호</option><option>주의</option><option>개선 요청</option></select></label><label style="flex:1;min-width:200px">메모<input type="text" data-l="m" maxlength="60" placeholder="점검 내용"></label>'+bb('log',['일지 추가','추가하는 중'],'','data-a="logAdd"')+'</div>';}
function eduForm(){var rs=statRows(),by={};rs.forEach(function(r){if(!by[r.d])by[r.d]={n:0,e:0,g:0,u:0};by[r.d].n+=r.n;by[r.d].e+=r.e;by[r.d].g+=r.g;by[r.d].u+=r.u;});
 var rows=Object.keys(by).map(function(k){var x=by[k],reg=Math.round(x.e*.82);return [k,x.n,reg,x.e-reg,x.g,0,x.u,Math.round(x.e/(x.n-x.g)*1000)/10+'%'];});return rows;}
var EDU_H=['학과','졸업예정자','취업자(정규직)','취업자(기타)','진학자','입대자','미취업자','취업률'];

/* ============ phones ============ */
function phoneShell(title,body,foot,tabs,back){return '<div class="phwrap"><div class="phone" id="phone"><div class="pa">'+(back?'<button class="ib" data-a="'+back+'" aria-label="뒤로">'+ic('left')+'</button>':'')+'<h2>'+title+'</h2></div><div class="pb">'+body+'</div>'+(foot?'<div class="pf">'+foot+'</div>':'')+(tabs||'')+'</div></div>';}
function vParent(){var P=S.par,c=TGT.con,step=P.step,e=P.err;
 var bar=function(n){return '<div class="stpt">'+n+' / 4 단계</div><div class="stp">'+[1,2,3,4].map(function(i){return '<i'+(i<=n?' class="on"':'')+'></i>';}).join('')+'</div>';};
 var er=function(k){return e[k]?'<div class="err">'+ic('alert')+'<span>'+e[k]+'</span></div>':'';};
 if(c.par==='완료'&&step<5)step=P.step=5;
 if(step===0){if(c.par==='미요청')return phoneShell('메시지','<div class="empty" style="border:0">'+ic('inbox')+'<strong>아직 받은 알림이 없습니다</strong><p>교사 화면 대시보드에서 독려 알림을 보내면 이 휴대폰으로 도착합니다.</p><button class="btn pri" data-a="view" data-v="teacher">교사 화면으로</button></div>');
  return phoneShell('알림톡','<div class="msgapp"><div class="day">'+ymd(new Date(c.sentAt))+'</div><div class="from">○○고등학교 취업지원부</div><div class="bubble"><div class="bh">알림톡 도착</div><div class="bt">'+esc(fill(TPL[0][1],TGT))+'</div><button class="bl" data-a="pGo" data-v="1">동의서 서명하기</button></div><div class="tm">'+hm(c.sentAt)+'</div></div>');}
 if(step===1)return phoneShell('보호자 본인 확인',bar(1)+'<p><b>'+TGT.n+'</b> 학생(3학년 '+TGT.c+'반)의 현장실습 학부모 동의서입니다. 학교에 등록된 보호자 번호로 확인합니다.</p>'+
  '<label class="lab" for="pPh">보호자 휴대폰 끝 4자리</label><input type="tel" id="pPh" data-pp="ph" inputmode="numeric" maxlength="4" value="'+esc(P.ph)+'" autocomplete="off">'+er('ph')+
  (P.codeSent?'<label class="lab" for="pCd">인증번호 6자리</label><input type="tel" id="pCd" data-pp="code" inputmode="numeric" maxlength="6" value="'+esc(P.code)+'"><p class="note" style="font-size:15px">시연용 인증번호: 482913</p>'+er('code'):''),
  P.codeSent?bb('pv',['확인','확인하는 중'],'pri','data-a="pVerify"'):bb('pc',['인증번호 받기','보내는 중'],'pri','data-a="pCode"'),'','pBack');
 if(step===2){var all=P.agree.every(Boolean),items=['현장실습 기간·장소·내용(전기설비 A사, 11.03~12.19, 전기설비 시공 보조)에 동의합니다.','실습 중 안전수칙 준수와 산업재해보상보험 적용 내용을 확인했습니다.','실습 운영을 위해 학생 이름·학번·연락처를 실습 기업에 제공하는 데 동의합니다.'];
  return phoneShell('동의서 내용',bar(2)+'<div class="doc"><h3>현장실습 학부모(보호자) 동의서</h3><ol><li>실습 기업: 전기설비 A사 (가상)</li><li>실습 기간: 2026.11.03 ~ 2026.12.19, 하루 7시간</li><li>실습 수당: 월 210만 원</li><li>야간·휴일 실습 없음, 담당 교사 주 1회 현장 점검</li></ol></div>'+
  '<label class="chk" style="font-weight:700"><input type="checkbox" data-a="pAll"'+(all?' checked':'')+'>전체 동의</label>'+items.map(function(t,i){return '<label class="chk"><input type="checkbox" data-a="pAg" data-i="'+i+'"'+(P.agree[i]?' checked':'')+'><span>(필수) '+t+'</span></label>';}).join('')+er('agree'),
  '<button class="btn pri" data-a="pGo" data-v="3"'+(all?'':' disabled')+'>다음</button>','','pBack');}
 if(step===3)return phoneShell('서명',bar(3)+'<label class="lab" for="pNm" style="margin-top:0">보호자 성명</label><input type="text" id="pNm" data-pp="name" maxlength="10" value="'+esc(P.name)+'" autocomplete="name">'+er('name')+
  '<label class="lab" for="pRel">학생과의 관계</label><select id="pRel" data-pp="rel">'+['부','모','기타 보호자'].map(function(x){return '<option'+(P.rel===x?' selected':'')+'>'+x+'</option>';}).join('')+'</select>'+
  '<span class="lab">아래 칸에 손가락으로 서명해 주세요</span><div class="pad'+(P.strokes.length?' has':'')+'" id="pad"><canvas id="padC" aria-label="서명 입력 칸"></canvas><span class="hint">여기에 서명</span></div>'+er('sign')+
  '<div class="acts"><button class="btn" data-a="padClear">'+ic('retry')+'다시 쓰기</button></div>',bb('ps',['서명 제출','제출하는 중'],'pri','data-a="pSubmit"'),'','pBack');
 return phoneShell('서명 완료','<div class="big-ok"><span class="ck">'+ic('check')+'</span><h3>서명이 완료되었습니다</h3><p>서명 일시 '+stamp(c.parAt)+'<br>학교 담당 선생님께 바로 전달되었습니다.</p></div><div class="prow"><button class="btn" data-a="pdf" data-id="'+TGT.id+'">'+ic('file')+'동의서 PDF</button><button class="btn pri" data-a="view" data-v="teacher">교사 화면 확인</button></div><p class="note" style="font-size:15px;margin-top:14px">교사 화면 버튼은 시연용입니다. 실제 학부모 화면에는 없습니다.</p>');}
function vStudent(){var T=S.stu,s=TGT,tab=T.tab,F=T.form,e=T.err;
 var tabs='<nav class="ptabs" aria-label="학생 메뉴">'+[['hist','award','내 이력'],['add','plus','등록'],['rpt','map','진로 리포트']].map(function(x){return '<button data-a="sTab" data-v="'+x[0]+'"'+(tab===x[0]?' aria-current="page"':'')+'>'+ic(x[1])+x[2]+'</button>';}).join('')+'</nav>';
 if(tab==='hist')return phoneShell(s.n+' · 내 이력','<p class="note" style="font-size:15px;margin:0 0 10px">3학년 '+s.c+'반 '+s.no+'번 · 희망 직무 '+s.job+'</p><ul class="plist">'+s.certs.map(function(x){return '<li><span class="thumb">'+ic(x.kind==='교육'?'file':'award')+'</span><span class="nm">'+esc(x.n)+'<small>'+x.kind+' · '+x.date+'</small></span>'+(x.ok?'<span class="lb ok">확인</span>':'<span class="lb pg">확인 대기</span>')+'</li>';}).join('')+'</ul><div class="acts"><button class="btn pri" data-a="sTab" data-v="add" style="width:100%;min-height:52px">'+ic('plus')+'자격증·수상 등록</button></div>',null,tabs);
 if(tab==='add'){var list=CERTS[s.dept.k].concat(['교내 경진대회 수상','TOEIC 점수']);
  return phoneShell('이력 등록','<label class="lab" for="sKind" style="margin-top:0">구분</label><select id="sKind" data-sf="kind">'+['자격증','수상','어학'].map(function(x){return '<option'+(F.kind===x?' selected':'')+'>'+x+'</option>';}).join('')+'</select>'+
  '<label class="lab" for="sN">명칭</label><select id="sN" data-sf="n"><option value="">선택하세요</option>'+list.map(function(x){return '<option'+(F.n===x?' selected':'')+'>'+x+'</option>';}).join('')+'</select>'+(e.n?'<div class="err">'+ic('alert')+'<span>'+e.n+'</span></div>':'')+
  '<label class="lab" for="sD">취득일</label><input type="text" id="sD" data-sf="date" value="'+esc(F.date)+'" inputmode="numeric" placeholder="2026.10.20">'+(e.date?'<div class="err">'+ic('alert')+'<span>'+e.date+'</span></div>':'')+
  '<span class="lab">증빙 사진</span>'+(F.photo?'<ul class="plist"><li><span class="thumb">'+ic('camera')+'</span><span class="nm">'+F.photo+'<small>1.8MB · 첨부됨</small></span><button class="ib" data-a="sPhotoX" aria-label="사진 빼기">'+ic('x')+'</button></li></ul>':bb('ph',['사진 첨부','사진 올리는 중'],'','data-a="sPhoto" style="width:100%;min-height:52px"'))+(e.photo?'<div class="err">'+ic('alert')+'<span>'+e.photo+'</span></div>':'')+
  '<p class="note" style="font-size:15px;margin-top:10px">등록하면 담당 선생님 확인 후 이력에 반영됩니다.</p>',bb('sa',['등록하기','등록하는 중'],'pri','data-a="sSave"'),tabs);}
 var g=gapOf(s),miss=g.filter(function(x){return !x.have;});
 return phoneShell('진로 리포트','<p style="font-size:16px">희망 직무 <b>'+s.job+'</b> 기준으로 <b>'+(g.length-miss.length)+'개</b>를 갖췄고 <b>'+miss.length+'개</b>가 남았습니다.</p><ul class="plist">'+g.map(function(x){return '<li><span class="nm">'+x.item+'<small>'+x.kind+' · '+x.need+(x.have?'':' · '+(GUIDE[x.item]||''))+'</small></span>'+(x.have?'<span class="lb ok">보유</span>':'<span class="lb bad">미취득</span>')+'</li>';}).join('')+'</ul>',null,tabs);}

/* ============ overlays ============ */
var sigCache={};
function sigImg(s){if(s===TGT&&S.par.png)return S.par.png;if(sigCache[s.id])return sigCache[s.id];var c=document.createElement('canvas');c.width=360;c.height=120;var x=c.getContext('2d');x.strokeStyle='#1A2A6C';x.lineWidth=3;x.lineCap='round';x.beginPath();var k=s.id.charCodeAt(4)+s.no;x.moveTo(30,80);for(var i=0;i<14;i++){x.quadraticCurveTo(40+i*20,20+((i*k)%5)*18,50+i*20,70+((i+k)%3)*12);}x.stroke();return sigCache[s.id]=c.toDataURL();}
function pdfA4(s){var c=s.con,cp=compById(s.comp),pn=s===TGT&&S.par.name?esc(S.par.name):s.n.charAt(0)+'○○',rel=s===TGT?S.par.rel:'모';
 return '<div class="a4 printable"><h1>현장실습 학부모(보호자) 동의서</h1><div class="dn">문서번호 실습동의-'+T0.getFullYear()+'-'+s.c+p2(s.no)+'</div>'+
 '<table><tr><th>학생</th><td>'+s.n+' ('+s.dept.n+' 3학년 '+s.c+'반 '+s.no+'번)</td></tr><tr><th>실습 기업</th><td>'+cp.n+' · '+cp.ind+'</td></tr><tr><th>실습 직무</th><td>'+cp.job+'</td></tr><tr><th>실습 기간</th><td>'+T0.getFullYear()+'.'+cp.per.replace('~',' ~ '+T0.getFullYear()+'.')+'</td></tr><tr><th>실습 수당</th><td>월 '+cp.pay+'만 원</td></tr></table>'+
 '<b>동의 내용</b><ol><li>위 현장실습 기간·장소·내용에 동의합니다. <span class="agree">[동의]</span></li><li>실습 중 안전수칙 준수와 산업재해보상보험 적용 내용을 확인했습니다. <span class="agree">[동의]</span></li><li>실습 운영을 위한 학생 개인정보(이름·학번·연락처) 기업 제공에 동의합니다. <span class="agree">[동의]</span></li></ol>'+
 '<table class="sign"><tr><th>보호자 성명</th><td>'+pn+' ('+rel+')</td><th>서명</th><td><img alt="보호자 서명" src="'+sigImg(s)+'"></td></tr><tr><th>서명 일시</th><td class="num">'+stamp(c.parAt)+'</td><th>본인 확인</th><td>휴대폰 인증 (끝 4자리 '+s.ph+')</td></tr></table>'+
 '<p style="text-align:right;margin:24px 0 0">'+ymd(new Date(c.parAt))+'</p><p style="text-align:right;display:flex;align-items:center;justify-content:flex-end;gap:12px;margin:8px 0 0"><b>○○고등학교장 귀하</b><span class="seal">○○고<br>직인</span></p>'+
 '<div class="foot2">전자 서명으로 작성된 문서입니다. 서명 이미지와 일시, 본인 확인 기록은 학교 서버에 함께 보관됩니다.</div></div>';}
function overlay(){var O=S.ov;if(!O)return '';
 var md_=function(t,b,f,w){return '<div class="ov" data-a="ovX"><div class="md'+(w?' wide':'')+'" role="dialog" aria-modal="true" aria-label="'+t+'" data-stop="1"><div class="mh"><h2>'+t+'</h2><button class="ib" data-a="ovX" aria-label="닫기">'+ic('x')+'</button></div><div class="mb">'+b+'</div>'+(f?'<div class="mf">'+f+'</div>':'')+'</div></div>';};
 if(O.t==='remind'){var list=unsigned().filter(function(s){return O.sel[s.id];});
  return md_('독려 알림 보내기','<p class="note" style="margin-top:0">학부모 동의서 미완료 '+unsigned().length+'명 중 '+list.length+'명 선택</p><div class="tw" style="max-height:220px;overflow-y:auto"><table class="t"><thead><tr><th class="cb"><span class="sr">선택</span></th><th>학번</th><th>이름</th><th>학부모 동의</th></tr></thead><tbody>'+unsigned().map(function(s){return '<tr><td class="cb"><input type="checkbox" data-a="remSel" data-id="'+s.id+'" aria-label="'+s.id+' 선택"'+(O.sel[s.id]?' checked':'')+'></td><td class="num">'+s.id+'</td><td>'+s.n+'</td><td>'+parLb(s.con)+'</td></tr>';}).join('')+'</tbody></table></div>'+
  '<div class="sec"><h2>보낼 내용 (동의서 서명 요청)</h2><span class="m">'+(list[0]?list[0].id+' 기준 미리보기':'')+'</span></div><div class="tpl">'+fill(esc(TPL[0][1]),list[0]||TGT,true)+'\n[동의서 서명하기] 버튼</div>',
  '<button class="btn" data-a="ovX">취소</button>'+bb('rem',['알림톡 보내기 ('+list.length+'명)','보내는 중'],'pri','data-a="remSend"'+(list.length?'':' disabled')));}
 if(O.t==='pdf'){var s=ST.filter(function(x){return x.id===O.id;})[0];return md_('동의서 PDF 미리보기','<div class="a4wrap">'+pdfA4(s)+'</div>','<button class="btn" data-a="ovX">닫기</button><button class="btn pri" data-a="print">'+ic('print')+'인쇄·PDF 저장</button>',1);}
 if(O.t==='rpt'){var s2=ST.filter(function(x){return x.id===S.rptSid;})[0];return md_('진로 가이드 리포트 인쇄용','<div class="a4wrap">'+rptA4(s2)+'</div>','<button class="btn" data-a="ovX">닫기</button><button class="btn pri" data-a="print">'+ic('print')+'인쇄</button>',1);}
 if(O.t==='edu'){var rows=eduForm();return md_('교육청 보고 양식 미리보기','<p class="note" style="margin-top:0">특성화고 졸업예정자 취업 현황 · '+ymd(T0)+' 기준 · 학교명 ○○고등학교</p><div class="tw"><table class="t"><thead><tr>'+EDU_H.map(function(h,i){return '<th'+(i?' class="n"':'')+'>'+h+'</th>';}).join('')+'</tr></thead><tbody>'+rows.map(function(r){return '<tr>'+r.map(function(x,i){return '<td'+(i?' class="n"':'')+'>'+x+'</td>';}).join('')+'</tr>';}).join('')+'</tbody></table></div><p class="note">양식 열 순서는 예시입니다. 받으신 교육청 원본 양식에 맞춰 열 이름과 순서를 그대로 맞춥니다.</p>'+
  (S.role==='all'?(S.appr?'<div class="alert ok">'+ic('check')+'<span>총괄 결재 완료 · '+stamp(S.appr)+'</span></div>':'<div class="alert info">'+ic('pen')+'<span>총괄 권한: 결재 후 제출본으로 확정할 수 있습니다.</span></div>'):''),
  '<button class="btn" data-a="ovX">닫기</button>'+(S.role==='all'&&!S.appr?bb('appr',['결재','결재하는 중'],'','data-a="appr"'):'')+'<button class="btn pri" data-a="eduDl">'+ic('dl')+'엑셀(CSV) 내려받기</button>',1);}
 return '';}

/* ============ render ============ */
var NAV=[['dash','dash','대시보드'],['students','users','학생'],['practice','brief','현장실습'],['report','map','진로 리포트'],['notify','bell','알림 발송'],['stats','chart','통계']];
var gOpen=window.innerWidth>=1101;
var STEPS=[['대시보드','파견율·취업률·미완료 현황'],['미완료자 독려 알림','알림톡 미리보기와 발송'],['학부모 폰에서 서명','본인 확인 후 손가락 서명'],['대시보드 서명 현황 변화','미완료 건수와 완료 알림'],['동의서 PDF','서명란·서명 일시가 들어간 A4'],['학생 이력·진로 리포트','휴대폰 등록과 부족 스펙'],['교육청 양식','보고 양식 미리보기와 엑셀 추출']];
function render(){var v=S.view;
 document.body.classList.toggle('phone-view',v!=='teacher');
 $('#views').innerHTML=[['teacher','교사 화면'],['parent','학부모 폰'],['student','학생 폰']].map(function(x){return '<button role="tab" data-a="view" data-v="'+x[0]+'" aria-selected="'+(v===x[0])+'">'+x[1]+(x[0]==='parent'&&TGT.con.par==='발송'?'<span class="dot" aria-label="새 알림"></span>':'')+'</button>';}).join('');
 var un=unsigned().length,pg=S.page==='profile'||S.page==='upload'?'students':S.page;
 $('#side').innerHTML=v==='teacher'?'<div class="grp">취업·현장실습</div>'+NAV.map(function(n){return '<button data-a="go" data-v="'+n[0]+'"'+(pg===n[0]?' aria-current="page"':'')+'>'+ic(n[1])+n[2]+(n[0]==='dash'&&un?'<span class="bd">'+un+'</span>':'')+'</button>';}).join(''):'';
 $('#side').style.display=v==='teacher'?'':'none';
 $('#rolebar').innerHTML=v==='teacher'?'<span>권한</span><div class="seg" role="group" aria-label="권한 전환">'+Object.keys(ROLES).map(function(k){return '<button data-a="role" data-v="'+k+'" aria-pressed="'+(S.role===k)+'">'+ROLES[k].n+'</button>';}).join('')+'</div><span class="scope">'+ROLES[S.role].who+' · 보이는 범위 <b>'+ROLES[S.role].sc+'</b></span>':'<span class="scope">'+(v==='parent'?'학부모 휴대폰 화면 · '+TGT.id+' '+TGT.n+' 보호자':'학생 휴대폰 화면 · '+TGT.id+' '+TGT.n)+'</span>';
 $('#rolebar').style.display=v==='teacher'?'':(window.innerWidth<=860?'none':'');
 var body=v==='parent'?vParent():v==='student'?vStudent():({dash:pDash,students:pStudents,profile:pProfile,upload:pUpload,practice:pPractice,report:pReport,notify:pNotify,stats:pStats}[S.page])();
 var y=window.scrollY;$('#main').innerHTML=body;
 $('#ovHost').innerHTML=overlay();
 renderGuide();setupPad();
 if(S.hit){clearTimeout(render.t);render.t=setTimeout(function(){S.hit=null;},1900);}}
function renderGuide(){var g=$('#guide');g.className='guide'+(gOpen?'':' closed');document.body.classList.toggle('guide-open',gOpen);
 g.innerHTML='<button class="gh" data-a="gT" aria-expanded="'+gOpen+'"><span>시연 안내 '+(gOpen?'':'('+(S.step+1)+'/7)')+'</span>'+ic(gOpen?'up':'down')+'</button><ol>'+STEPS.map(function(s,i){return '<li><button data-a="gS" data-v="'+i+'"'+(S.step===i?' aria-current="step"':'')+'><b><span class="n">'+(i+1)+'</span>'+s[0]+'</b><span class="d">'+s[1]+'</span></button></li>';}).join('')+'</ol>';}

/* ---------- signature pad ---------- */
function setupPad(){var cv=$('#padC');if(!cv)return;var box=cv.parentNode,r=box.getBoundingClientRect(),dpr=window.devicePixelRatio||1;cv.width=r.width*dpr;cv.height=r.height*dpr;var x=cv.getContext('2d');x.scale(dpr,dpr);x.lineWidth=2.6;x.lineCap='round';x.lineJoin='round';x.strokeStyle='#1A2A6C';
 var draw=function(){x.clearRect(0,0,r.width,r.height);S.par.strokes.forEach(function(st){x.beginPath();st.forEach(function(p,i){if(i)x.lineTo(p[0],p[1]);else x.moveTo(p[0],p[1]);});if(st.length===1)x.lineTo(st[0][0]+.1,st[0][1]);x.stroke();});};draw();
 var cur=null,pt=function(e){var b=cv.getBoundingClientRect();return [e.clientX-b.left,e.clientY-b.top];};
 cv.onpointerdown=function(e){cv.setPointerCapture(e.pointerId);cur=[pt(e)];S.par.strokes.push(cur);box.classList.add('has');if(S.par.err.sign){delete S.par.err.sign;var ne=box.nextElementSibling;if(ne&&ne.classList.contains('err'))ne.remove();}draw();};
 cv.onpointermove=function(e){if(!cur)return;cur.push(pt(e));draw();};
 cv.onpointerup=cv.onpointercancel=function(){cur=null;};}
function padPng(){var cv=$('#padC');if(!cv)return null;var dpr=window.devicePixelRatio||1,x0=1e9,y0=1e9,x1=0,y1=0;S.par.strokes.forEach(function(st){st.forEach(function(p){x0=Math.min(x0,p[0]);y0=Math.min(y0,p[1]);x1=Math.max(x1,p[0]);y1=Math.max(y1,p[1]);});});
 var m=8,sx=Math.max(0,(x0-m)*dpr),sy=Math.max(0,(y0-m)*dpr),w=Math.min(cv.width-sx,(x1-x0+2*m)*dpr),h=Math.min(cv.height-sy,(y1-y0+2*m)*dpr);var o=document.createElement('canvas');o.width=w;o.height=h;o.getContext('2d').drawImage(cv,sx,sy,w,h,0,0,w,h);return o.toDataURL('image/png');}
function autoSign(){var P=S.par;if(TGT.con.par==='미요청'){sendBatch([TGT],0);}P.name=P.name||'박○○';P.rel='모';
 var c=document.createElement('canvas');c.width=600;c.height=200;var x=c.getContext('2d');x.strokeStyle='#1A2A6C';x.lineWidth=5;x.lineCap='round';x.beginPath();x.moveTo(60,130);x.bezierCurveTo(90,30,140,40,130,120);x.bezierCurveTo(125,160,190,60,230,90);x.bezierCurveTo(260,110,280,40,320,70);x.quadraticCurveTo(360,100,400,60);x.moveTo(420,120);x.quadraticCurveTo(470,60,540,90);x.stroke();
 P.png=c.toDataURL();TGT.con.par='완료';TGT.con.parAt=Date.now();P.step=5;S.hit=TGT.id;}

/* ---------- actions ---------- */
function goStep(i){S.step=i;S.ov=null;
 if(i===0){S.view='teacher';S.page='dash';}
 if(i===1){S.view='teacher';S.page='dash';A.remind();return;}
 if(i===2){if(TGT.con.par==='미요청')sendBatch([TGT],0);S.view='parent';if(TGT.con.par!=='완료')S.par.step=0;}
 if(i===3){if(TGT.con.par!=='완료')autoSign();S.view='teacher';S.page='dash';S.hit=TGT.id;}
 if(i===4){if(TGT.con.par!=='완료')autoSign();S.view='teacher';S.page='dash';S.ov={t:'pdf',id:TGT.id};}
 if(i===5){S.view='student';S.stu.tab='rpt';}
 if(i===6){if(S.role==='hr')S.role='job';S.view='teacher';S.page='stats';S.ov={t:'edu'};}
 if(window.innerWidth<1101)gOpen=false;render();window.scrollTo(0,0);}
var A={
 view:function(d){S.view=d.v;S.ov=null;render();window.scrollTo(0,0);},
 go:function(d){S.view='teacher';S.page=d.v;S.ov=null;render();window.scrollTo(0,0);},
 role:function(d){S.role=d.v;if(d.v==='hr'){S.f.dept='all';S.f.c='all';}if(S.page==='profile'&&!ROLES[d.v].f(ST.filter(function(x){return x.id===S.sid;})[0]))S.page='students';render();toast(ROLES[d.v].n+' 권한으로 전환 · '+ROLES[d.v].sc);},
 gT:function(){gOpen=!gOpen;renderGuide();},
 gS:function(d){goStep(+d.v);},
 prof:function(d){S.sid=d.id;S.page='profile';S.view='teacher';S.ov=null;render();window.scrollTo(0,0);},
 rpt:function(d){S.rptSid=d.id;S.page='report';render();window.scrollTo(0,0);},
 fClear:function(){S.f={dept:'all',c:'all',q:''};render();},
 certOk:function(d){var s=ST.filter(function(x){return x.id===S.sid;})[0],i=+d.i;work('ck'+i,400,function(){s.certs[i].ok=true;s.certs[i].isNew=false;toast('증빙을 확인 처리했습니다');});},
 remind:function(){var sel={};unsigned().forEach(function(s){sel[s.id]=true;});S.ov={t:'remind',sel:sel};render();},
 remSel:function(d,el){S.ov.sel[d.id]=el.checked;render();},
 remSend:function(){var list=unsigned().filter(function(s){return S.ov.sel[s.id];});work('rem',700,function(){var b=sendBatch(list,0);S.ov=null;toast('알림톡 '+b.ok+'건 발송 · 문자 대체 '+b.sms+'건 · 미확인 '+b.un+'건');if(S.step===1)S.step=2;});},
 ovX:function(){S.ov=null;render();},
 pdf:function(d){S.ov={t:'pdf',id:d.id};render();},
 print:function(){window.print();},
 rptPrint:function(){S.ov={t:'rpt'};render();},
 memoSave:function(){var s=ST.filter(function(x){return x.id===S.rptSid;})[0];if(!S.memo.trim()){toast('상담 내용을 적어 주세요',1);var m=$('#memoIn');if(m)m.focus();return;}work('memo',400,function(){s.memos.unshift({d:ymd(T0),w:ROLES[S.role].who.split(' ').pop(),t:S.memo.trim()});S.memo='';toast('상담 메모를 저장했습니다');});},
 tplDl:function(){csv('자격증_일괄등록_양식.csv',[['학번','이름','구분','명칭','취득일'],['3-1-04','박○○','자격증','전기기능사','2026.09.18']]);toast('업로드 양식을 내려받았습니다');},
 upSample:function(){S.upload={name:'3학년_자격증_취득현황.xlsx'};work('ups',400,function(){});},
 upReset:function(){S.upload=null;render();},
 upApply:function(){var ok=UPL.filter(function(r){return !r[5];});work('up',600,function(){ok.forEach(function(r){var s=ST.filter(function(x){return x.id===r[0];})[0];if(s)s.certs.push({n:r[3],kind:r[2],date:r[4],proof:'',ok:false,isNew:true});});S.upload.done=ok.length;toast(ok.length+'건을 반영했습니다');});},
 nfClear:function(){S.nf={dept:'all',job:'all',cert:'all',unsigned:false,tpl:S.nf.tpl};render();},
 nfSend:function(){var tg=nfTargets();work('nf',700,function(){var b=sendBatch(tg,S.nf.tpl);toast(b.to+'명 발송 · 알림톡 '+b.ok+' · 문자 대체 '+b.sms+' · 미확인 '+b.un);});},
 resend:function(d){var r=SENT[0].rows[+d.i];work('re'+d.i,600,function(){r.r='알림톡 성공';SENT[0].un--;SENT[0].ok++;toast(r.s.id+' '+r.s.n+' 재발송 완료');});},
 edu:function(){S.ov={t:'edu'};render();},
 eduDl:function(){csv('교육청_취업현황_보고_'+ymd(T0).replace(/\./g,'')+'.csv',[EDU_H].concat(eduForm()));toast('보고 양식을 내려받았습니다');},
 appr:function(){work('appr',500,function(){S.appr=Date.now();toast('결재했습니다');});},
 logAdd:function(){var m=$('[data-l="m"]').value.trim();if(!m){toast('점검 메모를 적어 주세요',1);$('[data-l="m"]').focus();return;}var c=$('[data-l="comp"]').value,r=$('[data-l="r"]').value;work('log',400,function(){LOG.unshift({d:ymd(T0),comp:c,stu:'-',t:ROLES[S.role].who.split(' ').pop(),r:r,m:m,isNew:true});toast('점검 일지를 추가했습니다');});},
 /* parent */
 pGo:function(d){var n=+d.v;if(n===1&&TGT.con.par==='발송'){TGT.con.par='열람';}if(n===3&&!S.par.agree.every(Boolean)){S.par.err.agree='필수 항목에 모두 동의해 주세요.';render();return;}S.par.step=n;S.par.err={};render();var pb=$('.pb');if(pb)pb.scrollTop=0;},
 pBack:function(){S.par.step=Math.max(0,S.par.step-1);S.par.err={};render();},
 pCode:function(){var P=S.par;if(!/^\d{4}$/.test(P.ph)){P.err={ph:'숫자 4자리를 입력해 주세요.'};render();return;}if(P.ph!==TGT.ph){P.err={ph:'학교에 등록된 보호자 번호와 다릅니다. 담임 선생님께 번호 변경을 요청해 주세요. (시연: '+TGT.ph+')'};render();return;}
  work('pc',600,function(){P.codeSent=true;P.err={};toast('인증번호를 보냈습니다 (시연)');});},
 pVerify:function(){var P=S.par;if(P.code!=='482913'){P.err={code:'인증번호가 맞지 않습니다. 다시 확인해 주세요.'};render();return;}work('pv',500,function(){P.step=2;P.err={};});},
 pAll:function(d,el){S.par.agree=[el.checked,el.checked,el.checked];delete S.par.err.agree;render();},
 pAg:function(d,el){S.par.agree[+d.i]=el.checked;delete S.par.err.agree;render();},
 padClear:function(){S.par.strokes=[];render();},
 pSubmit:function(){var P=S.par,e={};if(P.name.trim().length<2)e.name='보호자 성명을 입력해 주세요.';var pts=P.strokes.reduce(function(a,s){return a+s.length;},0);if(pts<12)e.sign='서명이 너무 짧습니다. 칸 안에 서명해 주세요.';
  P.err=e;if(Object.keys(e).length){render();toast('입력 내용을 확인해 주세요',1);return;}P.png=padPng();
  work('ps',800,function(){TGT.con.par='완료';TGT.con.parAt=Date.now();P.step=5;S.hit=TGT.id;toast('서명을 제출했습니다 · 교사 화면에 반영');if(S.step===2)S.step=3;});},
 /* student */
 sTab:function(d){S.stu.tab=d.v;S.stu.err={};render();},
 sPhoto:function(){work('ph',600,function(){S.stu.form.photo='IMG_'+md(T0).replace('.','')+'_01.jpg';delete S.stu.err.photo;});},
 sPhotoX:function(){S.stu.form.photo=null;render();},
 sSave:function(){var F=S.stu.form,e={};if(!F.n)e.n='명칭을 골라 주세요.';var m=/^(\d{4})\.(\d{2})\.(\d{2})$/.exec(F.date);if(!m)e.date='2026.10.20 형식으로 입력해 주세요.';else if(new Date(+m[1],+m[2]-1,+m[3])>T0)e.date='취득일이 오늘 이후입니다.';if(!F.photo)e.photo='증빙 사진을 첨부해 주세요.';
  S.stu.err=e;if(Object.keys(e).length){render();toast('입력 내용을 확인해 주세요',1);return;}
  work('sa',500,function(){TGT.certs.push({n:F.n,kind:F.kind,date:F.date,proof:'사진 1장',ok:false,isNew:true});S.stu.form={kind:'자격증',n:'',date:ymd(dOf(-3)),photo:null};S.stu.tab='hist';toast('등록했습니다 · 선생님 확인 대기');});}
};
document.addEventListener('click',function(ev){var el=ev.target.closest('[data-a]');if(!el)return;
 if(el.classList.contains('ov')&&ev.target.closest('[data-stop]'))return;
 if(el.tagName==='INPUT'&&el.type==='checkbox'){A[el.dataset.a](el.dataset,el);return;}
 ev.preventDefault();if(el.disabled)return;var f=A[el.dataset.a];if(f)f(el.dataset,el);});
document.addEventListener('input',function(ev){var t=ev.target,d=t.dataset;
 if(d.g==='q'){S.f.q=t.value;clearTimeout(A.qT);A.qT=setTimeout(function(){render();var q=$('[data-g="q"]');if(q){q.focus();q.setSelectionRange(q.value.length,q.value.length);}},250);}
 if(d.g==='memo')S.memo=t.value;
 if(d.pp){var v=t.value;if(d.pp==='ph'||d.pp==='code'){v=v.replace(/\D/g,'');t.value=v;}S.par[d.pp]=v;if(S.par.err[d.pp]){delete S.par.err[d.pp];var ne=t.nextElementSibling;if(ne&&ne.classList.contains('err'))ne.remove();}}
 if(d.sf==='date')S.stu.form.date=t.value;
});
document.addEventListener('change',function(ev){var t=ev.target,d=t.dataset;
 if(d.g==='dept'||d.g==='c'){S.f[d.g]=t.value;render();}
 if(d.g==='rptSid'){S.rptSid=t.value;render();}
 if(d.n){S.nf[d.n]=d.n==='unsigned'?t.checked:d.n==='tpl'?+t.value:t.value;render();}
 if(d.pp==='rel')S.par.rel=t.value;
 if(d.sf==='kind'||d.sf==='n'){S.stu.form[d.sf]=t.value;delete S.stu.err[d.sf];}
 if(t.id==='upIn'&&t.files[0]){S.upload={name:t.files[0].name};work('ups',400,function(){});}
});
document.addEventListener('keydown',function(ev){if(ev.key==='Escape'&&S.ov){S.ov=null;render();}});
window.addEventListener('resize',function(){if(S.view==='parent'&&S.par.step===3)setupPad();});
render();
})();
