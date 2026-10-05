/* 상담 창 위젯: 사이트에 스크립트 한 줄로 붙는다. 사이트의 다른 코드와 겹치지 않도록 모든 이름에 cw- 접두어를 쓴다. */
(function(){
"use strict";
if(window.ChatWidget) return;

var CFG={
  name:'온라인 상담 도우미',
  greeting:'안녕하세요. 궁금한 점을 입력해 주세요. 아래 버튼을 눌러도 됩니다.',
  quick:['회사 소개','운영 시간','문의 방법','자료 요청'],
  delayNotice:4000,     /* 이 시간이 지나도 답이 없으면 지연 안내 */
  timeout:12000,        /* 이 시간이 지나면 실패로 처리 */
  storeKey:'cw-history-v1'
};

/* ===== 스타일 (위젯 안에서만 쓰는 이름) ===== */
var css=''+
'.cw-root{--cw-a:#1f6f43;--cw-ah:#185a36;--cw-abg:#e9f3ed;--cw-t:#1d2125;--cw-t2:#4b535c;--cw-m:#6a727b;--cw-l:#dfe2e5;--cw-bg:#f4f5f6;--cw-bad:#b42318;--cw-badbg:#fcebea;font-family:"Pretendard Variable",Pretendard,-apple-system,"Apple SD Gothic Neo","Malgun Gothic",sans-serif;color:var(--cw-t);font-size:15px;line-height:1.55;word-break:keep-all;overflow-wrap:anywhere}'+
'.cw-root *{box-sizing:border-box}'+
'.cw-root svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;flex:none}'+
'.cw-fab{position:fixed;right:20px;bottom:20px;z-index:2147483000;width:60px;height:60px;border-radius:50%;border:0;background:var(--cw-a);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.22)}'+
'.cw-fab:hover{background:var(--cw-ah)}'+
'.cw-fab svg{width:26px;height:26px}'+
'.cw-fab .cw-dot{position:absolute;top:6px;right:6px;width:12px;height:12px;border-radius:50%;background:#e8590c;border:2px solid #fff}'+
'.cw-win{position:fixed;right:20px;bottom:92px;z-index:2147483001;width:370px;height:min(580px,calc(100dvh - 120px));background:#fff;border:1px solid #c9ced3;border-radius:6px;box-shadow:0 10px 32px rgba(0,0,0,.18);display:flex;flex-direction:column;overflow:hidden;transform-origin:bottom right;animation:cw-in .16s ease-out}'+
'@keyframes cw-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}'+
'.cw-hd{display:flex;align-items:center;gap:10px;padding:0 6px 0 14px;height:56px;background:var(--cw-a);color:#fff;flex:none}'+
'.cw-hd .cw-ttl{flex:1;min-width:0}'+
'.cw-hd b{display:block;font-size:15px;font-weight:700;white-space:nowrap}'+
'.cw-hd small{display:block;font-size:12px;opacity:.85;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
'.cw-ib{width:44px;height:44px;border:0;background:none;color:inherit;display:flex;align-items:center;justify-content:center;cursor:pointer;border-radius:4px;position:relative}'+
'.cw-ib:hover{background:rgba(255,255,255,.14)}'+
'.cw-ib[data-tip]:hover::after,.cw-ib[data-tip]:focus-visible::after{content:attr(data-tip);position:absolute;top:calc(100% + 4px);right:0;background:#1d2125;color:#fff;font-size:12px;padding:3px 8px;border-radius:2px;white-space:nowrap;pointer-events:none;z-index:2}'+
'.cw-log{flex:1;overflow-y:auto;padding:14px 12px 8px;background:var(--cw-bg);scroll-behavior:smooth}'+
'.cw-day{text-align:center;font-size:12px;color:var(--cw-m);margin:2px 0 12px}'+
'.cw-msg{display:flex;flex-direction:column;margin-bottom:12px;max-width:86%}'+
'.cw-msg.cw-bot{align-items:flex-start}'+
'.cw-msg.cw-me{align-items:flex-end;margin-left:auto}'+
'.cw-who{font-size:12px;color:var(--cw-t2);margin:0 0 3px 2px}'+
'.cw-row{display:flex;align-items:flex-end;gap:6px}'+
'.cw-me .cw-row{flex-direction:row-reverse}'+
'.cw-bub{padding:9px 12px;border-radius:4px 12px 12px 12px;background:#fff;border:1px solid var(--cw-l);white-space:pre-wrap;font-size:14.5px}'+
'.cw-me .cw-bub{background:var(--cw-a);color:#fff;border-color:var(--cw-a);border-radius:12px 4px 12px 12px}'+
'.cw-time{font-size:12px;color:var(--cw-m);white-space:nowrap;flex:none}'+
'.cw-caret{display:inline-block;width:7px;height:1em;vertical-align:-2px;background:var(--cw-t2);margin-left:1px;animation:cw-blink .9s steps(2) infinite}'+
'@keyframes cw-blink{50%{opacity:0}}'+
'.cw-typing{display:inline-flex;gap:4px;align-items:center;height:20px}'+
'.cw-typing i{width:6px;height:6px;border-radius:50%;background:#9aa1a8;animation:cw-b 1.1s infinite ease-in-out}'+
'.cw-typing i:nth-child(2){animation-delay:.15s}.cw-typing i:nth-child(3){animation-delay:.3s}'+
'@keyframes cw-b{0%,80%,100%{opacity:.3;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}'+
'.cw-note{font-size:13px;color:var(--cw-t2);margin-top:6px}'+
'.cw-err .cw-bub{background:var(--cw-badbg);border-color:#efc0bb;color:#7d180f}'+
'.cw-acts{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}'+
'.cw-btn{height:36px;padding:0 12px;border:1px solid var(--cw-l);background:#fff;color:var(--cw-t);border-radius:4px;font:inherit;font-size:13.5px;cursor:pointer;display:inline-flex;align-items:center;gap:6px}'+
'.cw-btn:hover{border-color:var(--cw-a);color:var(--cw-a)}'+
'.cw-btn svg{width:16px;height:16px}'+
'.cw-btn.cw-pri{background:var(--cw-a);border-color:var(--cw-a);color:#fff}'+
'.cw-quick{display:flex;gap:6px;flex-wrap:wrap;padding:8px 12px;border-top:1px solid var(--cw-l);background:#fff;flex:none}'+
'.cw-quick .cw-btn{height:34px;font-size:13px}'+
'.cw-in{display:flex;align-items:flex-end;gap:8px;padding:10px 12px;border-top:1px solid var(--cw-l);background:#fff;flex:none}'+
'.cw-in textarea{flex:1;min-width:0;resize:none;border:1px solid var(--cw-l);border-radius:4px;padding:10px 12px;font:inherit;font-size:15px;line-height:1.4;max-height:120px;min-height:44px;outline:none;color:var(--cw-t)}'+
'.cw-in textarea:focus{border-color:var(--cw-a);box-shadow:0 0 0 2px var(--cw-abg)}'+
'.cw-send{width:44px;height:44px;border:0;border-radius:4px;background:var(--cw-a);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;flex:none}'+
'.cw-send:disabled{background:#b9c3bd;cursor:not-allowed}'+
'.cw-send.cw-stop{background:#3a4148}'+
'.cw-foot{font-size:12px;color:var(--cw-m);text-align:center;padding:0 12px 8px;background:#fff;flex:none}'+
'.cw-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}'+
'.cw-back{display:none}'+
'.cw-root :focus-visible{outline:2px solid var(--cw-a);outline-offset:2px}'+
'.cw-hd :focus-visible{outline-color:#fff}'+
'@media (max-width:600px){'+
'.cw-fab{right:16px;bottom:16px}'+
'.cw-back{display:block;position:fixed;inset:0;background:rgba(20,24,28,.45);z-index:2147483000}'+
'.cw-win{left:0;right:0;bottom:0;width:auto;height:88dvh;border-radius:12px 12px 0 0;border-left:0;border-right:0;border-bottom:0;animation:cw-up .2s ease-out}'+
'@keyframes cw-up{from{transform:translateY(24px);opacity:0}to{transform:none;opacity:1}}'+
'.cw-quick .cw-btn{height:44px}'+
'.cw-btn{height:44px}'+
'}'+
'@media (prefers-reduced-motion:reduce){.cw-win,.cw-caret,.cw-typing i{animation:none}.cw-log{scroll-behavior:auto}}';

var IC={
  chat:'<path d="M4 20V7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H8l-4 4"/><path d="M8.5 9h7M8.5 12.5h4.5"/>',
  x:'<path d="M18 6L6 18M6 6l12 12"/>',
  send:'<path d="M5 12h13M13 6l6 6-6 6"/>',
  stop:'<rect x="7" y="7" width="10" height="10" rx="1"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  retry:'<path d="M20 11A8.1 8.1 0 0 0 4.5 9M4 5v4h4"/><path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"/>'
};
function ic(n){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+IC[n]+'</svg>';}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function hm(d){d=d?new Date(d):new Date();var h=d.getHours(),m=String(d.getMinutes()).padStart(2,'0');return (h<12?'오전 ':'오후 ')+((h%12)||12)+':'+m;}

/* ===== 대화 저장: 창을 닫았다 열어도, 새로고침해도 이어진다. 저장이 막힌 브라우저에서는 메모리로만 동작 ===== */
var mem=null;
function load(){try{var s=sessionStorage.getItem(CFG.storeKey);if(s) return JSON.parse(s);}catch(e){} return mem;}
function save(h){mem=h;try{sessionStorage.setItem(CFG.storeKey,JSON.stringify(h));}catch(e){}}
var hist=load()||[{who:'bot',text:CFG.greeting,t:Date.now()}];

/* ===== 답변 공급자: 실제 연결 때는 이 함수만 중계 서버 호출로 바꾼다 ===== */
var ANSWERS=[
  [/회사|소개|무슨 일|어떤 곳/,'저희 회사 소개 페이지의 내용을 바탕으로 답하는 자리입니다. 시연에서는 예시 문장만 보여 드립니다.\n\n실제 연결 후에는 준비하신 AI API가 회사 소개 자료를 근거로 답변합니다.'],
  [/운영|시간|영업|몇 시|주말/,'운영 시간은 평일 오전 9시부터 오후 6시까지입니다. 점심 시간은 낮 12시부터 1시까지이고, 주말과 공휴일은 쉽니다. (예시)'],
  [/문의|연락|상담|전화|메일/,'고객 지원 메뉴의 문의하기에서 남겨 주시면 영업일 기준 하루 안에 답변드립니다. 급한 문의는 운영 시간 안에 이 창에서 남겨 주세요. (예시)'],
  [/자료|카탈로그|브로슈어|견적|다운/,'자료실 메뉴에서 소개 자료를 내려받으실 수 있습니다. 필요한 자료 이름을 알려 주시면 위치를 안내해 드립니다. (예시)']
];
var forced=null;   /* 시연용: 'delay' 또는 'fail' */
function provider(q,signal){
  return new Promise(function(resolve,reject){
    var mode=forced; forced=null;
    if(/지연 시연/.test(q)) mode='delay';
    if(/실패 시연/.test(q)) mode='fail';
    var wait=mode==='delay'?7000:mode==='fail'?2200:900+Math.random()*500;
    var tm=setTimeout(function(){
      if(mode==='fail'){reject(new Error('server'));return;}
      var a=null; for(var i=0;i<ANSWERS.length;i++){if(ANSWERS[i][0].test(q)){a=ANSWERS[i][1];break;}}
      if(mode==='delay') a='늦어서 죄송합니다. 응답이 늦어질 때는 이렇게 안내를 띄우고, 정해 둔 시간을 넘기면 실패로 처리해 다시 보내기를 보여 드립니다.';
      resolve(a||'시연용 예시 답변입니다. 지금은 몇 가지 질문(회사 소개, 운영 시간, 문의 방법, 자료 요청)에만 미리 정한 답을 드립니다. 실제 연결 후에는 준비하신 AI API의 답변이 이 자리에 표시됩니다.');
    },wait);
    if(signal) signal.onabort=function(){clearTimeout(tm);reject(new Error('abort'));};
  });
}

/* ===== DOM ===== */
var root,fab,win,log,ta,sendBtn,live,quick,busy=false,ctrl=null,streamTimer=null,unread=false,lastQ='';
function build(){
  var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
  root=document.createElement('div'); root.className='cw-root';
  root.innerHTML='<button type="button" class="cw-fab" aria-label="상담 창 열기" aria-expanded="false">'+ic('chat')+'</button>'+
    '<div class="cw-sr" aria-live="polite" aria-atomic="true"></div>';
  document.body.appendChild(root);
  fab=root.querySelector('.cw-fab'); live=root.querySelector('.cw-sr');
  fab.addEventListener('click',function(){win?close():open();});
}
function open(){
  if(win) return;
  var back=document.createElement('div'); back.className='cw-back'; back.addEventListener('click',close); root.appendChild(back);
  win=document.createElement('section'); win.className='cw-win'; win.setAttribute('role','dialog'); win.setAttribute('aria-label',CFG.name);
  win.innerHTML='<div class="cw-hd"><div class="cw-ttl"><b>'+esc(CFG.name)+'</b><small>보통 몇 초 안에 답합니다</small></div>'+
    '<button type="button" class="cw-ib" data-cw="new" aria-label="새 대화" data-tip="새 대화">'+ic('plus')+'</button>'+
    '<button type="button" class="cw-ib" data-cw="close" aria-label="상담 창 닫기" data-tip="닫기">'+ic('x')+'</button></div>'+
    '<div class="cw-log" role="log" aria-label="대화 내용"></div>'+
    '<div class="cw-quick" aria-label="자주 묻는 질문">'+CFG.quick.map(function(q){return '<button type="button" class="cw-btn" data-q="'+esc(q)+'">'+esc(q)+'</button>';}).join('')+'</div>'+
    '<form class="cw-in"><label class="cw-sr" for="cw-ta">질문 입력</label><textarea id="cw-ta" rows="1" placeholder="질문을 입력하세요" maxlength="500"></textarea>'+
    '<button type="submit" class="cw-send" aria-label="보내기">'+ic('send')+'</button></form>'+
    '<div class="cw-foot">Enter 보내기, Shift+Enter 줄바꿈</div>';
  root.appendChild(win);
  log=win.querySelector('.cw-log'); ta=win.querySelector('textarea'); sendBtn=win.querySelector('.cw-send'); quick=win.querySelector('.cw-quick');
  win.addEventListener('click',onClick);
  win.querySelector('form').addEventListener('submit',function(e){e.preventDefault();if(busy){stop();return;}ask(ta.value);});
  ta.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();if(!busy)ask(ta.value);}});
  ta.addEventListener('input',function(){ta.style.height='auto';ta.style.height=Math.min(ta.scrollHeight,120)+'px';});
  document.addEventListener('keydown',onEsc);
  fab.setAttribute('aria-expanded','true'); fab.setAttribute('aria-label','상담 창 닫기');
  unread=false; renderFab(); renderLog(); setBusy(busy);
  if(ctrl&&!streamTimer){ var w=document.createElement('div'); w.className='cw-msg cw-bot cw-wait'; w.innerHTML='<div class="cw-who">'+esc(CFG.name)+'</div><div class="cw-row"><div class="cw-bub"><span class="cw-typing" aria-label="답변 준비 중"><i></i><i></i><i></i></span></div></div>'; log.appendChild(w); log.scrollTop=log.scrollHeight; }
  setTimeout(function(){ta.focus();},30);
}
function close(){
  if(!win) return;
  win.remove(); win=null; log=null;
  var b=root.querySelector('.cw-back'); if(b) b.remove();
  document.removeEventListener('keydown',onEsc);
  fab.setAttribute('aria-expanded','false'); fab.setAttribute('aria-label','상담 창 열기'); fab.focus();
}
function onEsc(e){if(e.key==='Escape') close();}
function renderFab(){var d=fab.querySelector('.cw-dot');if(unread&&!d){d=document.createElement('span');d.className='cw-dot';d.setAttribute('aria-hidden','true');fab.appendChild(d);fab.setAttribute('aria-label','상담 창 열기, 새 답변 있음');} if(!unread&&d) d.remove();}
function msgHTML(m,i){
  if(m.who==='me') return '<div class="cw-msg cw-me"><div class="cw-row"><div class="cw-bub">'+esc(m.text)+'</div><span class="cw-time">'+hm(m.t)+'</span></div></div>';
  if(m.who==='err') return '<div class="cw-msg cw-bot cw-err"><div class="cw-who">'+esc(CFG.name)+'</div><div class="cw-row"><div class="cw-bub">'+esc(m.text)+'</div><span class="cw-time">'+hm(m.t)+'</span></div>'+
    (i===hist.length-1?'<div class="cw-acts"><button type="button" class="cw-btn cw-pri" data-cw="retry">'+ic('retry')+'다시 보내기</button></div>':'')+'</div>';
  return '<div class="cw-msg cw-bot"><div class="cw-who">'+esc(CFG.name)+'</div><div class="cw-row"><div class="cw-bub">'+esc(m.text)+(m.cut?'<div class="cw-note">답변을 중지했습니다.</div>':'')+'</div><span class="cw-time">'+hm(m.t)+'</span></div></div>';
}
function renderLog(){
  if(!log) return;
  var d=new Date(hist[0].t);
  log.innerHTML='<div class="cw-day">'+d.getFullYear()+'년 '+(d.getMonth()+1)+'월 '+d.getDate()+'일</div>'+hist.map(msgHTML).join('');
  log.scrollTop=log.scrollHeight;
}
function setBusy(b){
  busy=b; if(!sendBtn) return;
  sendBtn.classList.toggle('cw-stop',b); sendBtn.innerHTML=ic(b?'stop':'send'); sendBtn.setAttribute('aria-label',b?'답변 중지':'보내기');
  quick.querySelectorAll('button').forEach(function(x){x.disabled=b;});
}
function onClick(e){
  var t=e.target.closest('button'); if(!t) return;
  if(t.dataset.q){ if(!busy) ask(t.dataset.q); return; }
  var a=t.dataset.cw;
  if(a==='close') close();
  if(a==='new'){ stop(); hist=[{who:'bot',text:CFG.greeting,t:Date.now()}]; save(hist); renderLog(); ta.focus(); }
  if(a==='retry'){ hist.pop(); save(hist); renderLog(); if(!lastQ){for(var k=hist.length-1;k>=0;k--){if(hist[k].who==='me'){lastQ=hist[k].text;break;}}} request(lastQ); }
}
function ask(q){
  q=String(q||'').trim(); if(!q||busy) return;
  hist.push({who:'me',text:q,t:Date.now()}); save(hist);
  if(ta){ta.value='';ta.style.height='auto';}
  renderLog(); request(q);
}
function request(q){
  lastQ=q; setBusy(true);
  /* 대기 표시 */
  var wait=null;
  if(log){ wait=document.createElement('div'); wait.className='cw-msg cw-bot cw-wait';
    wait.innerHTML='<div class="cw-who">'+esc(CFG.name)+'</div><div class="cw-row"><div class="cw-bub"><span class="cw-typing" aria-label="답변 준비 중"><i></i><i></i><i></i></span></div></div>';
    log.appendChild(wait); log.scrollTop=log.scrollHeight; }
  live.textContent='답변을 준비하고 있습니다.';
  ctrl={aborted:false,onabort:null,abort:function(){this.aborted=true;if(this.onabort)this.onabort();}};
  var my=ctrl;
  var slowT=setTimeout(function(){ if(my!==ctrl) return; var w=log&&log.querySelector('.cw-wait .cw-bub'); if(w&&!w.querySelector('.cw-note')){var n=document.createElement('div');n.className='cw-note';n.textContent='응답이 늦어지고 있습니다. 조금만 기다려 주세요.';w.appendChild(n);} live.textContent='응답이 늦어지고 있습니다.'; },CFG.delayNotice);
  var outT=setTimeout(function(){ if(my===ctrl) my.abort('timeout'); },CFG.timeout);
  var done=function(){clearTimeout(slowT);clearTimeout(outT);var w=log&&log.querySelector('.cw-wait');if(w)w.remove();};
  provider(q,my).then(function(text){
    if(my!==ctrl) return; done(); stream(text);
  },function(err){
    if(my!==ctrl) return; done(); ctrl=null; setBusy(false);
    hist.push({who:'err',text:'답변을 받지 못했습니다. 연결이 불안정하거나 서버가 잠시 응답하지 않는 상태일 수 있습니다. 입력하신 질문은 그대로 두었으니 다시 보내기를 눌러 주세요.',t:Date.now()}); save(hist);
    if(!win){unread=true;renderFab();} else renderLog();
    live.textContent='답변을 받지 못했습니다. 다시 보내기를 누를 수 있습니다.';
  });
}
/* 답변을 글자 단위로 보여 준다. 실제 연결에서 API가 조각 단위로 보내 주면 받은 조각을 그대로 붙인다 */
function stream(text){
  var m={who:'bot',text:'',t:Date.now()}; hist.push(m);
  var i=0, step=2;
  renderLog();
  var bub=function(){return log&&log.lastElementChild&&log.lastElementChild.querySelector('.cw-bub');};
  streamTimer=setInterval(function(){
    i=Math.min(text.length,i+step); m.text=text.slice(0,i);
    var b=bub(); if(b){b.innerHTML=esc(m.text)+(i<text.length?'<span class="cw-caret" aria-hidden="true"></span>':'');log.scrollTop=log.scrollHeight;}
    if(i>=text.length){ finish(m,false); }
  },28);
}
function finish(m,cut){
  clearInterval(streamTimer); streamTimer=null; ctrl=null; if(cut) m.cut=true; save(hist); setBusy(false);
  if(log) renderLog(); else { unread=true; renderFab(); }
  live.textContent=cut?'답변을 중지했습니다.':m.text;
}
function stop(){
  if(streamTimer){ finish(hist[hist.length-1],true); return; }
  if(ctrl){ ctrl.userStop=true; ctrl.abort(); var w=log&&log.querySelector('.cw-wait'); if(w) w.remove(); ctrl=null; setBusy(false); hist.push({who:'bot',text:'답변 요청을 취소했습니다. 다시 질문하시면 이어서 답합니다.',t:Date.now()}); save(hist); renderLog(); live.textContent='답변 요청을 취소했습니다.'; }
}

/* 시연 안내에서 쓰는 조작 */
window.ChatWidget={open:open,close:close,ask:function(q){open();ask(q);},
  simulate:function(mode,q){open();forced=mode;ask(q||'운영 시간 알려 주세요');},
  isOpen:function(){return !!win;},
  reset:function(){stop();hist=[{who:'bot',text:CFG.greeting,t:Date.now()}];save(hist);if(log)renderLog();}};

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',build); else build();
})();
