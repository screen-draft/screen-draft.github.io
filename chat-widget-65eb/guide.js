/* 시연 안내 패널. 실제 사이트에는 들어가지 않는다. */
(function(){
"use strict";
var STEPS=[
  {t:'상담 창 열기',d:'오른쪽 아래 아이콘을 누르면 창이 열립니다. 휴대폰에서는 아래에서 올라옵니다.',run:function(){CW().open();}},
  {t:'질문하고 답 받기',d:'대기 표시 뒤에 답변이 글자 단위로 나옵니다.',run:function(){CW().ask('운영 시간이 어떻게 되나요?');}},
  {t:'응답이 늦을 때',d:'4초가 지나면 지연 안내를 띄우고 계속 기다립니다.',run:function(){CW().simulate('delay','회사 소개를 해 주세요');}},
  {t:'응답이 실패할 때',d:'안내 문구와 다시 보내기가 나오고 화면은 멈추지 않습니다.',run:function(){CW().simulate('fail','자료는 어디서 받을 수 있나요?');}},
  {t:'닫았다 다시 열기',d:'창을 닫았다 열거나 새로고침해도 대화가 이어집니다.',run:function(){CW().close();setTimeout(function(){CW().open();},700);}}
];
var open=null, cur=-1;
function CW(){return window.ChatWidget;}
function ic(up){return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+(up?'M6 15l6-6 6 6':'M6 9l6 6 6-6')+'"/></svg>';}
function render(){
  var g=document.getElementById('guide'); if(!g) return;
  if(open===null) open=window.matchMedia('(min-width:721px)').matches;
  g.className='guide'+(open?'':' closed');
  g.innerHTML='<button type="button" class="gh" aria-expanded="'+open+'" aria-controls="gList"><span>시연 안내</span>'+ic(!open)+'</button>'+
    '<ol id="gList">'+STEPS.map(function(s,i){return '<li><button type="button" data-i="'+i+'"'+(cur===i?' aria-current="step"':'')+'><b><span class="n">'+(i+1)+'.</span>'+s.t+'</b>'+(cur===i?'<span class="d">'+s.d+'</span>':'')+'</button></li>';}).join('')+'</ol>';
}
document.addEventListener('click',function(e){
  var g=document.getElementById('guide'); if(!g||!g.contains(e.target)) return;
  var b=e.target.closest('button'); if(!b) return;
  if(b.classList.contains('gh')){open=!open;render();return;}
  var i=Number(b.dataset.i); if(isNaN(i)||!CW()) return;
  cur=i; open=false;
  render(); STEPS[i].run();
});
/* 상담 창이 열리면 안내를 접어 창과 겹치지 않게 하고, 닫히면 다시 편다 */
var was=false;
setInterval(function(){ if(!CW()) return; var now=CW().isOpen(); if(now!==was){ was=now; open=!now&&window.matchMedia('(min-width:721px)').matches; render(); } },300);
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',render); else render();
})();
