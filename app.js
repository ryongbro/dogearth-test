/* DogEarth 테스트판 — 하단 탭(지도·기록·내 강아지), 기록, 다견, 꾸미기, 실종, 루트 계획, 가입 동의 */
(()=>{
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ld=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}};
const sv=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){DEX.toast("저장 공간이 부족해요")}};
const toast=m=>DEX.toast(m),map=DEX.map,API=DEX.dogsApi;
const pad=n=>String(n).padStart(2,"0");
const dk=t=>{const d=new Date(t);return`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`};
const today=()=>dk(Date.now());
const pd=s=>{const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d)};
const addDays=(s,n)=>{const d=pd(s);d.setDate(d.getDate()+n);return dk(d)};
const diffDays=(a,b)=>Math.round((pd(b)-pd(a))/864e5);
const fmtT=s=>{s=Math.max(0,Math.round(s));const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return h?`${h}:${pad(m)}:${pad(x)}`:`${m}:${pad(x)}`};
const km=m=>(m/1000).toFixed(2);
const WEEK=["일","월","화","수","목","금","토"];
const dogById=id=>API.list.find(d=>d.id===id);
const dogName=id=>(dogById(id)||{}).dog||"?";
const bn=k=>(BREEDS[k]||BREEDS.mix).n[0];
const COLORS=["#2d55e8","#E0782A","#2fb36d","#8e6cc9","#c0453a","#2b93c7"];
const dogColor=d=>COLORS[Math.max(0,API.list.indexOf(d))%COLORS.length];

/* ---------- 사진: 기기 안(IndexedDB) 저장 ---------- */
let DB=null;const idb=()=>DB||(DB=new Promise((res,rej)=>{const r=indexedDB.open("de-img",1);r.onupgradeneeded=()=>r.result.createObjectStore("img");r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}));
async function putImg(url){const id="i"+Date.now().toString(36)+Math.random().toString(36).slice(2,6);const db=await idb();await new Promise((res,rej)=>{const tx=db.transaction("img","readwrite");tx.objectStore("img").put(url,id);tx.oncomplete=res;tx.onerror=()=>rej(tx.error)});return id}
async function getImg(id){const db=await idb();return new Promise(res=>{const r=db.transaction("img").objectStore("img").get(id);r.onsuccess=()=>res(r.result||"");r.onerror=()=>res("")})}
async function delImg(id){try{const db=await idb();db.transaction("img","readwrite").objectStore("img").delete(id)}catch(e){}}
function hydrate(root){(root||document).querySelectorAll("img[data-img]:not([src])").forEach(async im=>{const u=await getImg(im.dataset.img);if(u)im.src=u})}
function downscale(file,max,q){return new Promise((res,rej)=>{const img=new Image();img.onload=()=>{const s=Math.min(1,max/Math.max(img.width,img.height)),c=document.createElement("canvas");c.width=Math.round(img.width*s);c.height=Math.round(img.height*s);c.getContext("2d").drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(img.src);res(c.toDataURL("image/jpeg",q))};img.onerror=rej;img.src=URL.createObjectURL(file)})}
const fileIn=document.createElement("input");fileIn.type="file";fileIn.accept="image/*";fileIn.multiple=true;fileIn.hidden=true;document.body.appendChild(fileIn);
function pickPhotos(){return new Promise(res=>{fileIn.value="";fileIn.onchange=async()=>{const out=[];for(const f of [...fileIn.files].slice(0,6)){try{out.push(await putImg(await downscale(f,1024,.72)))}catch(e){}}res(out)};fileIn.click()})}

/* ---------- 날짜별 기록 저장소 ---------- */
const DAYK="de.day.";
function day(d){const v=ld(DAYK+d,null);return v||{date:d,poops:[],health:[],stickers:[],diary:null}}
function saveDay(v){sv(DAYK+v.date,v)}
let DD=ld("de.dday",null);
if(!DD){const w=API.list[0];DD=[{id:"dd1",dog:w.id,kind:"birthday",name:"",date:"2027-02-01",cycle:365}];sv("de.dday",DD)}
const DDK={since:["함께한 날",0],birthday:["생일",365],vaccine:["종합 예방접종",365],heartworm:["심장사상충",30],deworm:["구충",90],custom:["직접 입력",0]};
function ddVal(x){const td=today();if(x.kind==="since"){const n=diffDays(x.date,td)+1;return{n,label:"+"+n.toLocaleString(),past:true}}let t=x.date;if(x.cycle)while(t<td)t=addDays(t,x.cycle);const n=diffDays(td,t);return{n,label:n===0?"D-Day":n>0?"D-"+n:"D+"+(-n),date:t}}
const ddName=x=>(x.name||(x.kind==="birthday"?`${dogName(x.dog)} 생일`:DDK[x.kind][0]+(API.list.length>1?` · ${dogName(x.dog)}`:"")));
function bumpDday(date,k,dogId){if(!DDK[k]||!DDK[k][1])return;let x=DD.find(q=>q.kind===k&&q.dog===dogId);const nd=addDays(date,DDK[k][1]);if(!x){x={id:"dd"+Date.now(),dog:dogId,kind:k,name:"",date:nd,cycle:DDK[k][1]};DD.push(x)}else if(nd>x.date)x.date=nd;sv("de.dday",DD)}
const STK={vaccine:["💉","예방접종"],heartworm:["❤️","심장사상충"],deworm:["💊","구충"],vet:["🏥","병원"],grooming:["✂️","미용"],bath:["🛁","목욕"],birthday:["🎂","생일"],special:["⭐","특별한 날"]};
const HEALTH={vomit:"구토",cough:"기침",appetite:"식욕 저하",lethargy:"무기력",itch:"가려움",limp:"절뚝임",other:"기타"};
const PSH={hard:"딱딱함",normal:"정상",soft:"묽음",diarrhea:"설사"},PCO={c_normal:"갈색",c_yellow:"노란색",c_black:"검은색",c_red:"붉은색"};
const MOOD={great:"😄",good:"🙂",soso:"😐",bad:"😟"};

/* ---------- 스타일 ---------- */
document.head.insertAdjacentHTML("beforeend",`<style>
.tabbar{position:fixed;left:0;right:0;bottom:0;z-index:700;display:flex;background:rgba(255,255,255,.97);border-top:1px solid var(--line);padding-bottom:env(safe-area-inset-bottom);backdrop-filter:blur(10px)}
.tabbar button{flex:1;border:0;background:none;padding:7px 0 6px;font:600 11px -apple-system,system-ui,sans-serif;color:#8a8f98;display:flex;flex-direction:column;align-items:center;gap:2px}.tabbar button b{font-size:21px;line-height:1;font-weight:400;filter:grayscale(1) opacity(.65)}
.tabbar button.on{color:var(--blue)}.tabbar button.on b{filter:none}
.page{position:fixed;left:0;right:0;top:0;bottom:calc(env(safe-area-inset-bottom) + 54px);z-index:650;background:#f4f5f7;overflow:auto;-webkit-overflow-scrolling:touch;padding:calc(env(safe-area-inset-top) + 14px) 16px 30px;display:none}
.page.on{display:block;animation:pin .22s ease-out}@keyframes pin{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.page h2{margin:4px 0 12px;font-size:26px;letter-spacing:-.6px}.page h4{margin:20px 0 8px;font-size:15px}
.card{background:#fff;border-radius:16px;padding:14px;margin:10px 0;box-shadow:0 1px 3px rgba(0,0,0,.04);border:1px solid #eceef1}
.dchips{display:flex;gap:6px;overflow:auto;padding-bottom:2px}.dchips button{flex:none;border:1px solid var(--line);background:#fff;border-radius:999px;padding:7px 12px;font:600 13px -apple-system,system-ui,sans-serif;color:var(--tx)}.dchips button.on{background:#141619;color:#fff;border-color:#141619}
.ddhero{display:flex;align-items:center;gap:12px}.ddhero .big2{font-size:30px;font-weight:800;letter-spacing:-1px;color:var(--blue)}.ddhero small{color:var(--sub);display:block}
.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;text-align:center}.grid3 b{display:block;font-size:20px}.grid3 span{font-size:11.5px;color:var(--sub)}
.cal{display:grid;grid-template-columns:repeat(7,1fr);gap:3px}.cal .wd{font-size:11px;color:var(--sub);text-align:center;padding:4px 0}
.cal .c{min-height:58px;border-radius:10px;background:#fff;border:1px solid #eef0f2;padding:4px 3px;font-size:11px;display:flex;flex-direction:column;gap:1px;align-items:center;cursor:pointer}
.cal .c.td{border-color:var(--blue);box-shadow:inset 0 0 0 1px var(--blue)}.cal .c .n{font-weight:700;font-size:12px;color:var(--tx)}.cal .c .k{color:var(--blue);font-weight:700;font-size:10.5px}.cal .c .e{font-size:11px;line-height:1.1}
.cal .c.x{background:transparent;border:0}
.calh{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}.calh button{border:0;background:#fff;border-radius:10px;width:34px;height:34px;font-size:16px;border:1px solid var(--line)}
.li{display:flex;align-items:center;gap:10px;padding:10px 0;border-top:1px solid #f0f1f3}.li:first-child{border-top:0}.li .m{flex:1;min-width:0}.li .m b{font-size:14.5px}.li .m div{font-size:12px;color:var(--sub);margin-top:2px}
.sbtn{border:1px solid var(--line);background:#fff;border-radius:10px;padding:6px 10px;font:600 12.5px -apple-system,system-ui,sans-serif;color:var(--tx)}.sbtn.r{color:#d93036}.sbtn.p{background:var(--blue);border-color:var(--blue);color:#fff}
.thumbs{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}.thumbs img{width:64px;height:64px;object-fit:cover;border-radius:10px;background:#eee}
.av{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;color:#fff;font-weight:800;font-size:17px;flex:none}
.dogs{display:flex;gap:12px;overflow:auto;padding:4px 0 8px}.dogs button{border:0;background:none;display:flex;flex-direction:column;align-items:center;gap:4px;font:600 12px -apple-system,system-ui,sans-serif;color:var(--tx)}.dogs button.on .av{box-shadow:0 0 0 3px #fff,0 0 0 5px var(--blue)}
.two{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.tog2{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-top:1px solid #f0f1f3;font-size:14.5px}
.lvl{display:flex;gap:4px;margin:8px 0}.lvl span{flex:1;height:6px;border-radius:3px;background:#e3e6eb}.lvl span.on{background:#2fb36d}
.lostbar{position:fixed;left:12px;right:12px;top:calc(env(safe-area-inset-top) + 58px);z-index:630;background:#d93036;color:#fff;border-radius:14px;padding:10px 12px;font-size:13.5px;display:flex;gap:6px;align-items:center;box-shadow:0 8px 20px rgba(217,48,54,.35)}
.lostbar button,.lostbar a{color:#fff;background:rgba(255,255,255,.2);border:0;border-radius:9px;padding:6px 9px;font:600 12px -apple-system,system-ui,sans-serif;text-decoration:none}
.planbar{position:fixed;left:10px;right:10px;bottom:calc(env(safe-area-inset-bottom) + 64px);z-index:640;background:#fff;border-radius:18px;padding:12px;box-shadow:0 8px 26px rgba(0,0,0,.16)}
.lookpv{width:100%;height:230px;border-radius:16px;background:radial-gradient(ellipse at 50% 70%,#eceef1,#fff);display:block;margin:4px 0;touch-action:none}
.xmas{background:linear-gradient(135deg,#c8202b,#1f6f43);color:#fff;border-radius:14px;padding:10px 12px;margin:8px 0;display:flex;align-items:center;gap:8px;font-size:13.5px}.xmas button{margin-left:auto;border:0;background:#fff;color:#c8202b;border-radius:10px;padding:7px 10px;font:700 12.5px -apple-system,system-ui,sans-serif}
.tbl{width:100%;border-collapse:collapse;font-size:13px}.tbl td{padding:8px 4px;border-bottom:1px solid var(--line);vertical-align:top}
.panel,.clk{transition:opacity .2s}body.paged .panel,body.paged .clk,body.paged .poibar{opacity:0;pointer-events:none}
</style>`);

/* ---------- 하단 탭 ---------- */
document.body.insertAdjacentHTML("beforeend",`<nav class="tabbar"><button data-t="map" class="on"><b>🗺️</b>지도</button><button data-t="rec"><b>📅</b>기록</button><button data-t="me"><b>🐶</b>내 강아지</button></nav>
<section class="page" id="pgRec"></section><section class="page" id="pgMe"></section><div id="lostBox"></div><div id="planBox"></div>`);
let TAB="map";
function setTab(t){TAB=t;document.querySelectorAll(".tabbar button").forEach(b=>b.classList.toggle("on",b.dataset.t===t));$("pgRec").classList.toggle("on",t==="rec");$("pgMe").classList.toggle("on",t==="me");document.body.classList.toggle("paged",t!=="map");if(t==="rec")renderRec();if(t==="me")renderMe();if(t==="map")map.resize()}
document.querySelectorAll(".tabbar button").forEach(b=>b.onclick=()=>setTab(b.dataset.t));
DEX.setTab=setTab;
const _view=window.DE.view;window.DE.view=id=>{setTab("map");_view(id)};

/* ---------- 기록 탭 ---------- */
let REC={dog:"all",month:today().slice(0,7),day:null};
const matchDog=x=>REC.dog==="all"||x.dog===REC.dog||(Array.isArray(x.dogs)&&x.dogs.includes(REC.dog));
const walksOf=d=>DEX.walks().filter(w=>dk(w.start)===d&&(REC.dog==="all"||!w.dogs||w.dogs.includes(REC.dog)));
function weekStats(){const td=today(),start=addDays(td,-pd(td).getDay());let dist=0,n=0;DEX.walks().forEach(w=>{const d=dk(w.start);if(d>=start&&d<=td&&(REC.dog==="all"||!w.dogs||w.dogs.includes(REC.dog))){dist+=w.dist;n++}});let st=0,d=td;if(!walksOf(d).length)d=addDays(d,-1);while(walksOf(d).length){st++;d=addDays(d,-1)}return{dist,n,st}}
function health7(){const td=today(),c={};for(let i=0;i<7;i++){const v=day(addDays(td,-i));v.health.filter(matchDog).forEach(h=>c[HEALTH[h.type]]=(c[HEALTH[h.type]]||0)+1);v.poops.filter(matchDog).forEach(p=>{if(p.shape==="soft"||p.shape==="diarrhea")c["변 "+PSH[p.shape]]=(c["변 "+PSH[p.shape]]||0)+1;if(p.color==="c_black"||p.color==="c_red")c[PCO[p.color]+" 변"]=(c[PCO[p.color]+" 변"]||0)+1})}const e=Object.entries(c);return e.length?e.map(([k,n])=>`${k} ${n}회`).join(" · "):"특이사항 없음 👍"}
function dogChips(){return`<div class="dchips">${API.list.length>1?`<button class="${REC.dog==="all"?"on":""}" data-rd="all">전체</button>`:""}${API.list.map(d=>`<button class="${REC.dog===d.id||(API.list.length===1)?"on":""}" data-rd="${d.id}">${esc(d.dog)}</button>`).join("")}</div>`}
function renderRec(){const b=$("pgRec");if(REC.day)return renderDay(b,REC.day);
 const ws=weekStats(),dds=DD.filter(x=>REC.dog==="all"||x.dog===REC.dog).map(x=>({x,v:ddVal(x)})),up=dds.filter(o=>!o.v.past).sort((a,b)=>a.v.n-b.v.n)[0],since=dds.find(o=>o.v.past);
 const [yy,mm]=REC.month.split("-").map(Number),first=new Date(yy,mm-1,1),nd=new Date(yy,mm,0).getDate();let cells="";for(let i=0;i<first.getDay();i++)cells+=`<div class="c x"></div>`;
 for(let d=1;d<=nd;d++){const ds=`${yy}-${pad(mm)}-${pad(d)}`,v=day(ds),wl=walksOf(ds),dist=wl.reduce((a,w)=>a+w.dist,0),st=v.stickers.filter(matchDog),hp=v.health.filter(matchDog).length,pp=v.poops.filter(matchDog).length;
  cells+=`<div class="c ${ds===today()?"td":""}" data-day="${ds}"><span class="n">${d}</span>${dist?`<span class="k">${(dist/1000).toFixed(1)}</span>`:""}<span class="e">${st.slice(0,2).map(s=>STK[s.k][0]).join("")}${hp?"❗":""}${pp?"💩":""}</span></div>`}
 b.innerHTML=`<h2>기록</h2>${dogChips()}
 <div class="card"><div class="ddhero"><div style="flex:1">${up?`<div class="big2">${up.v.label}</div><small>${esc(ddName(up.x))} · ${up.v.date}</small>`:`<small>다가오는 D-day가 없어요</small>`}${since?`<small style="margin-top:4px">${esc(dogName(since.x.dog))}와 함께한 지 ${since.v.label.slice(1)}일째</small>`:""}</div><button class="sbtn" id="ddm">D-day 관리</button></div></div>
 <div class="card"><div class="grid3"><div><b>${(ws.dist/1000).toFixed(1)}</b><span>이번 주 km</span></div><div><b>${ws.n}</b><span>이번 주 산책</span></div><div><b>${ws.st}</b><span>연속 산책일</span></div></div></div>
 <div class="card" style="font-size:13.5px"><b>최근 7일 건강</b><div style="color:var(--sub);margin-top:4px">${health7()}</div></div>
 <div class="card"><div class="calh"><button id="pm">‹</button><b>${yy}년 ${mm}월</b><button id="nm">›</button></div><div class="cal">${WEEK.map(w=>`<div class="wd">${w}</div>`).join("")}${cells}</div>
 <div style="font-size:11.5px;color:var(--sub);margin-top:8px">파란 숫자 = 걸은 km · 💉 스티커 · ❗ 건강 메모 · 💩 배변 기록</div></div>`;
 b.querySelectorAll("[data-rd]").forEach(x=>x.onclick=()=>{REC.dog=x.dataset.rd;renderRec()});
 $("ddm").onclick=openDdays;$("pm").onclick=()=>{const d=new Date(yy,mm-2,1);REC.month=dk(d).slice(0,7);renderRec()};$("nm").onclick=()=>{const d=new Date(yy,mm,1);REC.month=dk(d).slice(0,7);renderRec()};
 b.querySelectorAll("[data-day]").forEach(x=>x.onclick=()=>{REC.day=x.dataset.day;renderRec();b.scrollTop=0})}
function dogSel(cur){return`<div class="dchips" style="margin-bottom:6px">${API.list.map(d=>`<button class="${cur===d.id?"on":""}" data-sd="${d.id}">${esc(d.dog)}</button>`).join("")}</div>`}
function renderDay(b,ds){const v=day(ds),wl=walksOf(ds),dia=v.diary||{mood:"",memo:""},x=pd(ds),tr=(ld("de.train.v1",{})[ds])||{};
 const dl=a=>API.list.length>1?`<span style="color:var(--sub)"> · ${esc(dogName(a))}</span>`:"";
 b.innerHTML=`<button class="sbtn" id="back">‹ 달력</button><h2 style="margin-top:12px">${x.getMonth()+1}월 ${x.getDate()}일 (${WEEK[x.getDay()]})</h2>
 <div class="card"><b>산책</b>${wl.length?wl.map(w=>`<div class="li"><div class="m"><b>${km(w.dist)} km · ${fmtT(w.moving)}</b><div>${new Date(w.start).toTimeString().slice(0,5)} 출발${w.dogs?` · ${w.dogs.map(dogName).map(esc).join(", ")}`:""}${w.purpose?` · ${esc(w.purpose)}`:""}${w.clicks&&w.clicks.length?` · ⭐ ${w.clicks.length}`:""}</div>${w.events&&w.events.length?`<div style="margin-top:4px;color:var(--tx)">${DEX.evSummary(w.events)}</div>${w.events.filter(e=>e.memo).map(e=>`<div>📝 ${new Date(e.t).toTimeString().slice(0,5)} ${esc(e.memo)}</div>`).join("")}${w.events.some(e=>e.imgs)?`<div class="thumbs">${w.events.flatMap(e=>e.imgs||[]).slice(0,8).map(id=>`<img data-img="${id}" alt="">`).join("")}</div>`:""}`:""}</div><button class="sbtn" data-wv="${w.id}">지도</button></div>`).join(""):`<div style="color:var(--sub);font-size:13px;margin-top:6px">이날은 산책 기록이 없어요</div>`}</div>
 <div class="card"><b>일기</b><div class="dchips" style="margin:8px 0">${Object.entries(MOOD).map(([k,e])=>`<button class="${dia.mood===k?"on":""}" data-md="${k}" style="font-size:18px">${e}</button>`).join("")}</div><textarea class="inp" id="dm" style="height:84px;padding:10px" placeholder="오늘 있었던 일을 적어 주세요">${esc(dia.memo)}</textarea></div>
 <div class="card"><div style="display:flex;align-items:center"><b style="flex:1">배변</b><button class="sbtn p" id="ap">＋ 기록</button></div>${v.poops.filter(matchDog).map((p,i)=>`<div class="li"><div class="m"><b>💩 ${PSH[p.shape]} · ${PCO[p.color]}</b>${dl(p.dog)}<div>${p.t}${p.memo?` · ${esc(p.memo)}`:""}</div>${(p.imgs||[]).length?`<div class="thumbs">${p.imgs.map(id=>`<img data-img="${id}" alt="">`).join("")}</div>`:""}</div><button class="sbtn r" data-dp="${v.poops.indexOf(p)}">삭제</button></div>`).join("")}</div>
 <div class="card"><div style="display:flex;align-items:center"><b style="flex:1">건강 메모</b><button class="sbtn p" id="ah">＋ 기록</button></div>${v.health.filter(matchDog).map(h=>`<div class="li"><div class="m"><b>❗ ${HEALTH[h.type]}</b>${dl(h.dog)}<div>${h.t}${h.memo?` · ${esc(h.memo)}`:""}</div>${(h.imgs||[]).length?`<div class="thumbs">${h.imgs.map(id=>`<img data-img="${id}" alt="">`).join("")}</div>`:""}</div><button class="sbtn r" data-dh="${v.health.indexOf(h)}">삭제</button></div>`).join("")}</div>
 <div class="card"><div style="display:flex;align-items:center"><b style="flex:1">스티커</b><button class="sbtn p" id="as">＋ 붙이기</button></div><div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px">${v.stickers.filter(matchDog).map(s=>`<span class="sbtn" data-ds="${v.stickers.indexOf(s)}">${STK[s.k][0]} ${STK[s.k][1]}${API.list.length>1?` · ${esc(dogName(s.dog))}`:""}${s.memo?` · ${esc(s.memo)}`:""} ✕</span>`).join("")}</div></div>
 ${Object.keys(tr).length?`<div class="card"><b>🎓 트레이닝</b><div style="font-size:13px;color:var(--sub);margin-top:6px">${Object.entries(tr).map(([k,x])=>{const n=x.ok+x.ng;return`${({sit:"앉아",stay:"기다려",come:"이리 와",paw:"손",down:"엎드려",heel:"옆에"})[k]||k} ${n?Math.round(x.ok/n*100):0}% (${x.ok}/${n})`}).join(" · ")}</div></div>`:""}`;
 hydrate(b);
 $("back").onclick=()=>{REC.day=null;renderRec()};b.querySelectorAll("[data-wv]").forEach(x=>x.onclick=()=>window.DE.view(x.dataset.wv));
 const sd=()=>{const v2=day(ds);v2.diary={mood:(v2.diary||{}).mood||"",memo:$("dm").value.slice(0,1000)};saveDay(v2)};$("dm").onchange=sd;$("dm").onblur=sd;
 b.querySelectorAll("[data-md]").forEach(x=>x.onclick=()=>{const v2=day(ds);v2.diary={mood:x.dataset.md,memo:$("dm").value};saveDay(v2);renderDay(b,ds)});
 b.querySelectorAll("[data-dp]").forEach(x=>x.onclick=()=>{if(!confirm("이 배변 기록을 삭제할까요?"))return;const v2=day(ds);(v2.poops[+x.dataset.dp].imgs||[]).forEach(delImg);v2.poops.splice(+x.dataset.dp,1);saveDay(v2);renderDay(b,ds)});
 b.querySelectorAll("[data-dh]").forEach(x=>x.onclick=()=>{if(!confirm("이 건강 메모를 삭제할까요?"))return;const v2=day(ds);(v2.health[+x.dataset.dh].imgs||[]).forEach(delImg);v2.health.splice(+x.dataset.dh,1);saveDay(v2);renderDay(b,ds)});
 b.querySelectorAll("[data-ds]").forEach(x=>x.onclick=()=>{const v2=day(ds);v2.stickers.splice(+x.dataset.ds,1);saveDay(v2);renderDay(b,ds)});
 $("ap").onclick=()=>addPoop(ds);$("ah").onclick=()=>addHealth(ds);$("as").onclick=()=>addSticker(ds)}
const firstDog=()=>REC.dog!=="all"?REC.dog:(API.with[0]||API.list[0].id);
const nowHM=()=>new Date().toTimeString().slice(0,5);
function addPoop(ds,fromWalk,onSaved){const st={dog:fromWalk?API.with[0]:firstDog(),shape:"normal",color:"c_normal",memo:"",imgs:[]};const draw=()=>{DEX.openSheet(`<h3>💩 배변 기록</h3>${API.list.length>1?dogSel(st.dog):""}<span class="lab">모양</span><div class="chips">${Object.entries(PSH).map(([k,l])=>`<button class="${st.shape===k?"on":""}" data-sh="${k}">${l}</button>`).join("")}</div><span class="lab">색</span><div class="chips">${Object.entries(PCO).map(([k,l])=>`<button class="${st.color===k?"on":""}" data-co="${k}">${l}</button>`).join("")}</div><span class="lab">메모</span><input class="inp" id="pmm" maxlength="80" value="${esc(st.memo)}"><div class="row"><button class="btn sec" id="pph">📷 사진 ${st.imgs.length?`(${st.imgs.length})`:"추가"}</button><button class="btn" id="psv">저장</button></div><div class="thumbs">${st.imgs.map(id=>`<img data-img="${id}" alt="">`).join("")}</div><div class="note" style="display:block;color:var(--sub)">사진은 이 폰 안에만 저장되고, 위치 정보(EXIF)는 지워져요.</div>`);hydrate($("sheetIn"));
 const keep=()=>{st.memo=$("pmm").value};document.querySelectorAll("#sheetIn [data-sd]").forEach(x=>x.onclick=()=>{keep();st.dog=x.dataset.sd;draw()});document.querySelectorAll("#sheetIn [data-sh]").forEach(x=>x.onclick=()=>{keep();st.shape=x.dataset.sh;draw()});document.querySelectorAll("#sheetIn [data-co]").forEach(x=>x.onclick=()=>{keep();st.color=x.dataset.co;draw()});
 $("pph").onclick=async()=>{keep();st.imgs.push(...await pickPhotos());draw()};$("psv").onclick=()=>{keep();const v=day(ds);v.poops.push({dog:st.dog,shape:st.shape,color:st.color,memo:st.memo.slice(0,80),imgs:st.imgs,t:nowHM()});saveDay(v);$("sheet").classList.remove("on");toast("배변 기록을 남겼어요");onSaved&&onSaved(st);if(TAB==="rec")renderRec()}};draw()}
DEX.addPoop=cb=>addPoop(today(),true,cb);
function addHealth(ds){const st={dog:firstDog(),type:"vomit",memo:"",imgs:[]};const draw=()=>{DEX.openSheet(`<h3>❗ 건강 메모</h3>${API.list.length>1?dogSel(st.dog):""}<div class="chips">${Object.entries(HEALTH).map(([k,l])=>`<button class="${st.type===k?"on":""}" data-ht="${k}">${l}</button>`).join("")}</div><span class="lab">메모</span><textarea class="inp" id="hmm" style="height:70px;padding:10px" maxlength="200">${esc(st.memo)}</textarea><div class="row"><button class="btn sec" id="hph">📷 사진 ${st.imgs.length?`(${st.imgs.length})`:"추가"}</button><button class="btn" id="hsv">저장</button></div><div class="thumbs">${st.imgs.map(id=>`<img data-img="${id}" alt="">`).join("")}</div>`);hydrate($("sheetIn"));
 const keep=()=>{st.memo=$("hmm").value};document.querySelectorAll("#sheetIn [data-sd]").forEach(x=>x.onclick=()=>{keep();st.dog=x.dataset.sd;draw()});document.querySelectorAll("#sheetIn [data-ht]").forEach(x=>x.onclick=()=>{keep();st.type=x.dataset.ht;draw()});
 $("hph").onclick=async()=>{keep();st.imgs.push(...await pickPhotos());draw()};$("hsv").onclick=()=>{keep();const v=day(ds);v.health.push({dog:st.dog,type:st.type,memo:st.memo.slice(0,200),imgs:st.imgs,t:nowHM()});saveDay(v);$("sheet").classList.remove("on");toast("건강 메모를 남겼어요");renderRec()}};draw()}
function addSticker(ds){const st={dog:firstDog(),k:"vaccine"};const draw=()=>{DEX.openSheet(`<h3>스티커 붙이기</h3>${API.list.length>1?dogSel(st.dog):""}<div class="pad" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">${Object.entries(STK).map(([k,[e,l]])=>`<button class="sbtn ${st.k===k?"p":""}" data-k="${k}" style="padding:12px 4px;font-size:12px">${e}<br>${l}</button>`).join("")}</div><span class="lab">메모</span><input class="inp" id="smm" maxlength="40" placeholder="예: 종합백신 3차"><div class="row"><button class="btn" id="ssv">붙이기</button></div><div class="note" style="display:block;color:var(--sub)">예방접종·심장사상충·구충 스티커는 다음 D-day가 자동으로 잡혀요.</div>`);
 document.querySelectorAll("#sheetIn [data-sd]").forEach(x=>x.onclick=()=>{st.dog=x.dataset.sd;draw()});document.querySelectorAll("#sheetIn [data-k]").forEach(x=>x.onclick=()=>{st.k=x.dataset.k;draw()});
 $("ssv").onclick=()=>{const v=day(ds);v.stickers.push({dog:st.dog,k:st.k,memo:$("smm").value.slice(0,40)});saveDay(v);bumpDday(ds,st.k,st.dog);$("sheet").classList.remove("on");toast(`${STK[st.k][0]} 스티커를 붙였어요`);renderRec()}};draw()}
function openDdays(){const draw=()=>{DEX.openSheet(`<h3>D-day 관리</h3>${DD.map(x=>{const v=ddVal(x);return`<div class="li"><div class="m"><b>${esc(ddName(x))}</b><div>${v.date||x.date}${x.cycle?` · ${x.cycle}일마다`:""}</div></div><b style="color:var(--blue)">${v.label}</b><button class="sbtn r" data-del="${x.id}">삭제</button></div>`}).join("")}
 <span class="lab">새 D-day</span>${API.list.length>1?dogSel(API.list[0].id):""}<select class="sel" id="dk">${Object.entries(DDK).map(([k,[l]])=>`<option value="${k}">${l}</option>`).join("")}</select><div class="two" style="margin-top:8px"><input class="inp" id="dn" placeholder="이름 (선택)"><input class="inp" id="dd" type="date" value="${today()}"></div><div class="row"><button class="btn" id="dadd">추가</button></div>`);
 let sel=API.list[0].id;document.querySelectorAll("#sheetIn [data-sd]").forEach(x=>x.onclick=()=>{sel=x.dataset.sd;document.querySelectorAll("#sheetIn [data-sd]").forEach(y=>y.classList.toggle("on",y===x))});
 document.querySelectorAll("#sheetIn [data-del]").forEach(x=>x.onclick=()=>{DD=DD.filter(q=>q.id!==x.dataset.del);sv("de.dday",DD);draw()});
 $("dadd").onclick=()=>{const k=$("dk").value;DD.push({id:"dd"+Date.now(),dog:sel,kind:k,name:$("dn").value.slice(0,20),date:$("dd").value||today(),cycle:DDK[k][1]});sv("de.dday",DD);draw();renderRec()}};draw()}

/* ---------- 내 강아지 탭 ---------- */
let ME=API.with[0]||API.list[0].id;
const SIZEL={S:"소형",M:"중형",L:"대형"},CLEN={short:"단모",long:"장모",double:"이중모",curly:"곱슬"},CAUT={strangers:"낯선 사람 경계",kids:"아이 경계",leash:"리드줄 반응",food:"음식·간식 예민",noisy:"소리 예민"},TOUCH={tail:"꼬리",paws:"발",ears:"귀",mouth:"입 주변"};
const MUSIC={apple:["Apple Music","https://music.apple.com/"],spotify:["Spotify","https://open.spotify.com/"],ytm:["YouTube Music","https://music.youtube.com/"],melon:["멜론","https://www.melon.com/"],genie:["지니","https://www.genie.co.kr/"]};
const VLV=[["휴대폰 본인인증","내 기록·일기"],["사진 인증","친구 추가·1:1 공유"],["동물등록 인증","그룹·모임·실종 알림"],["만남 확인","신뢰 표시"]];
function av(d,sz){return`<span class="av" style="background:${dogColor(d)};${sz?`width:${sz}px;height:${sz}px;font-size:${sz*.4}px`:""}">${esc((d.dog||"?").slice(0,1))}</span>`}
function lookSum(d){const L=d.look||{},a=[];if(L.hat==="santa")a.push("산타 모자");if(L.hat==="antler")a.push("루돌프 뿔");if(L.scarf)a.push("목도리");if(L.collar)a.push("목줄");if(L.harness)a.push("하네스");if(L.bandana)a.push("반다나");if(L.hat==="beanie")a.push("비니");if(L.hat==="cap")a.push("캡");return a.join(" · ")||"견종 기본 모습"}
function renderMe(){const b=$("pgMe"),d=dogById(ME)||API.list[0];ME=d.id;d.avoid=Object.assign({breeds:[],sizes:[],sex:[],intact:0},d.avoid||{});d.cautions=d.cautions||[];d.noTouch=d.noTouch||[];
 const music=ld("de.music","");const lost=ld("de.lost",null);
 b.innerHTML=`<h2>내 강아지</h2><div class="dogs">${API.list.map(x=>`<button class="${x.id===ME?"on":""}" data-me="${x.id}">${av(x)}${esc(x.dog)}</button>`).join("")}<button id="addDog"><span class="av" style="background:#e3e6eb;color:#6b7280">＋</span>추가</button></div>
 <div class="card"><span class="lab" style="margin-top:0">이름</span><input class="inp" id="fn" value="${esc(d.dog)}" maxlength="16">
 <div class="two"><div><span class="lab">견종</span><select class="sel" id="fb">${Object.keys(BREEDS).map(k=>`<option value="${k}" ${d.breed===k?"selected":""}>${esc(bn(k))}</option>`).join("")}</select></div><div><span class="lab">나이</span><input class="inp" id="fa" type="number" min="0" max="25" value="${esc(d.age??"")}"></div></div>
 <div class="two"><div><span class="lab">성별</span><select class="sel" id="fs"><option value="m" ${d.sex!=="f"?"selected":""}>수컷</option><option value="f" ${d.sex==="f"?"selected":""}>암컷</option></select></div><div><span class="lab">중성화</span><select class="sel" id="fu"><option value="1" ${d.neut?"selected":""}>했어요</option><option value="0" ${d.neut?"":"selected"}>안 했어요</option></select></div></div>
 <div class="two"><div><span class="lab">몸무게 (kg)</span><input class="inp" id="fw" type="number" step="0.1" value="${esc(d.wt??"")}"></div><div><span class="lab">크기</span><select class="sel" id="fz">${Object.entries(SIZEL).map(([k,l])=>`<option value="${k}" ${d.size===k?"selected":""}>${l}</option>`).join("")}</select></div></div>
 <span class="lab">털</span><div class="chips">${Object.entries(CLEN).map(([k,l])=>`<button class="${d.coatLen===k?"on":""}" data-cl="${k}">${l}</button>`).join("")}</div>
 <div class="tog2">내장칩 동물등록<input type="checkbox" id="fc" ${d.chip?"checked":""}></div></div>
 <div class="card li" id="lookBtn" style="cursor:pointer;display:flex"><span class="av" style="background:#E0782A">✨</span><div class="m"><b>꾸미기</b><div>${esc(lookSum(d))}</div></div><b>›</b></div>
 ${xmasOn()?`<div class="xmas">🎄 ${esc(d.dog)}도 크리스마스 준비할까요?<button id="xm">입혀 주기</button></div>`:""}
 <h4>만남 주의사항</h4><div class="card"><span class="lab" style="margin-top:0">피하고 싶은 견종</span><div class="chips">${Object.keys(BREEDS).filter(k=>k!=="mix").map(k=>`<button class="${d.avoid.breeds.includes(k)?"on":""}" data-ab="${k}">${esc(bn(k))}</button>`).join("")}</div>
 <span class="lab">피하고 싶은 크기</span><div class="chips">${Object.entries(SIZEL).map(([k,l])=>`<button class="${d.avoid.sizes.includes(k)?"on":""}" data-as="${k}">${l}견</button>`).join("")}</div>
 <span class="lab">성향</span><div class="chips">${Object.entries(CAUT).map(([k,l])=>`<button class="${d.cautions.includes(k)?"on":""}" data-ca="${k}">${l}</button>`).join("")}</div>
 <span class="lab">만지지 말아 주세요</span><div class="chips">${Object.entries(TOUCH).map(([k,l])=>`<button class="${d.noTouch.includes(k)?"on":""}" data-nt="${k}">${l}</button>`).join("")}</div>
 <div class="tog2">중성화 안 한 강아지는 피하고 싶어요<input type="checkbox" id="fi" ${d.avoid.intact?"checked":""}></div></div>
 <h4>위치 태그 · 실종</h4><div class="card"><div class="chips">${[["airtag","AirTag"],["smarttag","SmartTag"],["other","기타 태그"]].map(([k,l])=>`<button class="${d.tagType===k?"on":""}" data-tt="${k}">${l}</button>`).join("")}</div>
 ${d.tagType==="airtag"?`<div class="row"><a class="btn sec" style="display:grid;place-items:center;text-decoration:none" href="https://www.icloud.com/find" target="_blank" rel="noopener">나의 찾기 열기</a></div>`:d.tagType==="smarttag"?`<div class="row"><a class="btn sec" style="display:grid;place-items:center;text-decoration:none" href="https://smartthingsfind.samsung.com" target="_blank" rel="noopener">SmartThings Find 열기</a></div>`:""}
 <div class="row"><button class="btn" id="lostBtn" style="background:#d93036">🚨 ${lost?`실종 모드 켜짐 (${esc(dogName(lost.dog))})`:"실종 모드"}</button></div></div>
 <h4>인증 단계</h4><div class="card"><div class="lvl">${[0,1,2,3].map(i=>`<span class="${i<=(d.verify??1)?"on":""}"></span>`).join("")}</div><table class="tbl">${VLV.map(([a,c],i)=>`<tr><td>${i<=(d.verify??1)?"✅":"🔒"}</td><td><b>${a}</b><div style="color:var(--sub);font-size:12px">${c}</div></td></tr>`).join("")}</table><div style="font-size:12px;color:var(--sub);margin-top:6px">인증은 정식 앱에서 진행돼요. 지금은 단계 구성만 보여 드려요.</div></div>
 <h4>산책 루트 계획</h4><div class="card">${PLANS.length?PLANS.map(p=>`<div class="li"><div class="m"><b>${esc(p.name)}</b><div>${esc(p.time)} · ${(planLen(p.pts)/1000).toFixed(2)}km</div></div><button class="sbtn" data-pv="${p.id}">${p.on?"숨기기":"지도"}</button><button class="sbtn r" data-pdl="${p.id}">삭제</button></div>`).join(""):`<div style="font-size:13px;color:var(--sub)">미리 걸을 길을 그려 두면 지도에 보라색으로 표시돼요.</div>`}<div class="row"><button class="btn sec" id="planNew">＋ 새 루트 그리기</button></div></div>
 <h4>앱 설정</h4><div class="card"><span class="lab" style="margin-top:0">산책할 때 여는 음악 앱</span><div class="chips">${Object.entries(MUSIC).map(([k,[n]])=>`<button class="${music===k?"on":""}" data-mu="${k}">${n}</button>`).join("")}</div>
 <div class="row"><button class="btn sec" id="cons">가입 동의·안전 수칙 보기</button></div>${API.list.length>1?`<div class="row"><button class="btn sec" id="delDog" style="color:#d93036">${esc(d.dog)} 프로필 삭제</button></div>`:""}</div>`;
 const save=()=>{API.save()};
 b.querySelectorAll("[data-me]").forEach(x=>x.onclick=()=>{ME=x.dataset.me;renderMe()});
 $("addDog").onclick=()=>{if(API.list.length>=6)return toast("최대 6마리까지 등록할 수 있어요");const nd={id:"g"+Date.now().toString(36),dog:"새 친구",breed:"mix",coat:"",look:{},age:1,sex:"m",neut:1,wt:"",size:"M",coatLen:"short",chip:0,avoid:{breeds:[],sizes:[],sex:[],intact:0},cautions:[],noTouch:[],tagType:"",verify:1};API.list.push(nd);ME=nd.id;save();renderMe();toast("새 강아지를 추가했어요. 이름과 견종을 바꿔 주세요")};
 const bind=(id,f)=>{$(id).onchange=()=>{f($(id));save();if(id==="fb"||id==="fn")renderMe()}};
 bind("fn",e=>d.dog=e.value.trim()||"이름");bind("fb",e=>{d.breed=e.value;d.coat=""});bind("fa",e=>d.age=+e.value);bind("fs",e=>d.sex=e.value);bind("fu",e=>d.neut=+e.value);bind("fw",e=>d.wt=e.value);bind("fz",e=>d.size=e.value);bind("fc",e=>d.chip=e.checked?1:0);bind("fi",e=>d.avoid.intact=e.checked?1:0);
 const tg=(attr,arr)=>b.querySelectorAll(`[data-${attr}]`).forEach(x=>x.onclick=()=>{const k=x.dataset[attr];const i=arr.indexOf(k);i<0?arr.push(k):arr.splice(i,1);save();x.classList.toggle("on")});
 tg("ab",d.avoid.breeds);tg("as",d.avoid.sizes);tg("ca",d.cautions);tg("nt",d.noTouch);
 b.querySelectorAll("[data-cl]").forEach(x=>x.onclick=()=>{d.coatLen=x.dataset.cl;save();renderMe()});
 b.querySelectorAll("[data-tt]").forEach(x=>x.onclick=()=>{d.tagType=d.tagType===x.dataset.tt?"":x.dataset.tt;save();renderMe()});
 b.querySelectorAll("[data-mu]").forEach(x=>x.onclick=()=>{sv("de.music",music===x.dataset.mu?"":x.dataset.mu);renderMe()});
 $("lookBtn").onclick=()=>openLook(d);$("lostBtn").onclick=()=>lost?toast("지도 위쪽 빨간 띠에서 '찾았어요'를 눌러 끌 수 있어요"):openLost(d);
 $("cons").onclick=()=>openConsent(true);$("planNew").onclick=()=>{setTab("map");planStart()};
 if($("xm"))$("xm").onclick=()=>{API.list.forEach((x,i)=>{x.look=Object.assign({},x.look||{},{hat:i%2?"antler":"santa",scarf:"#c8202b"})});save();renderMe();toast("🎅 크리스마스 의상을 입혔어요!")};
 if($("delDog"))$("delDog").onclick=()=>{if(!confirm(`${d.dog} 프로필을 삭제할까요? 이 강아지의 꾸미기·주의사항이 지워집니다.`))return;API.list.splice(API.list.indexOf(d),1);API.setWith(API.with.filter(x=>x!==d.id));save();ME=API.list[0].id;renderMe()};
 b.querySelectorAll("[data-pv]").forEach(x=>x.onclick=()=>{const p=PLANS.find(q=>q.id===x.dataset.pv);p.on=!p.on;sv("de.plans",PLANS);drawPlans();if(p.on){setTab("map");fitPlan(p)}else renderMe()});
 b.querySelectorAll("[data-pdl]").forEach(x=>x.onclick=()=>{PLANS=PLANS.filter(q=>q.id!==x.dataset.pdl);sv("de.plans",PLANS);drawPlans();renderMe()})}
const xmasOn=()=>{const d=new Date(),m=d.getMonth()+1,dd=d.getDate();return(m===11&&dd>=20)||(m===12&&dd<=26)};

/* ---------- 꾸미기 편집기 (회전 미리보기) ---------- */
let PV=null;
function pvStart(cv,p){pvStop();const r=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});r.setPixelRatio(Math.min(2,devicePixelRatio||1));const w=cv.clientWidth||320,h=cv.clientHeight||230;r.setSize(w,h,false);
 const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xffffff,0x8a8070,.95));const dl=new THREE.DirectionalLight(0xffffff,.75);dl.position.set(3,6,4);sc.add(dl);const cm=new THREE.PerspectiveCamera(30,w/h,.1,100);
 PV={r,sc,cm,d:null,rot:.7,drag:null,auto:true,raf:0};pvSet(p);
 cv.onpointerdown=e=>{PV.drag=e.clientX;PV.auto=false;cv.setPointerCapture(e.pointerId)};cv.onpointermove=e=>{if(PV&&PV.drag!=null){PV.rot+=(e.clientX-PV.drag)*.012;PV.drag=e.clientX}};cv.onpointerup=()=>{if(PV)PV.drag=null};
 let lt=performance.now();const loop=n=>{if(!PV)return;const dt=Math.min(.05,(n-lt)/1000);lt=n;if(PV.auto)PV.rot+=dt*.6;if(PV.d){PV.d.g.rotation.y=PV.rot;animDog(PV.d,dt,false,n/1000)}PV.r.render(PV.sc,PV.cm);PV.raf=requestAnimationFrame(loop)};PV.raf=requestAnimationFrame(loop)}
function pvSet(p){if(!PV)return;if(PV.d)PV.sc.remove(PV.d.g);PV.d=buildDog(p);PV.sc.add(PV.d.g);const bb=new THREE.Box3().setFromObject(PV.d.g),c=bb.getCenter(new THREE.Vector3()),sz=bb.getSize(new THREE.Vector3());PV.d.g.position.sub(new THREE.Vector3(c.x,bb.min.y,c.z));const R=Math.max(sz.x,sz.y,sz.z);PV.cm.position.set(0,sz.y*.75+R*.35,R*2.3);PV.cm.lookAt(0,sz.y*.45,0)}
function pvStop(){if(PV){cancelAnimationFrame(PV.raf);try{PV.r.dispose();PV.r.forceContextLoss()}catch(e){}PV=null}}
$("sheet").addEventListener("click",e=>{if(e.target.id==="sheet")pvStop()});
const ACC=["#2d55e8","#c0453a","#c8202b","#E0782A","#2fb36d","#1f6f43","#e7a1b0","#141619","#f4efe6","#8e6cc9"];
function openLook(dog){const L=Object.assign({},dog.look||{});let coat=dog.coat||"";const P=()=>({...dog,coat,look:{...L}});
 const ch=(k,opts)=>`<div class="chips">${opts.map(([v,l])=>`<button class="${(L[k]??"")===v||(!L[k]&&v==="")?"on":""}" data-k="${k}" data-v="${v}">${l}</button>`).join("")}</div>`;
 const sw=(k,cols,none)=>`<div class="sw"><button class="no ${L[k]?"":"on"}" data-k="${k}" data-v="">${none||"없음"}</button>${cols.map(c=>`<button class="${L[k]===c?"on":""}" data-k="${k}" data-v="${c}" style="background:${c}"></button>`).join("")}</div>`;
 const html=()=>`<h3>✨ ${esc(dog.dog)} 꾸미기</h3><canvas class="lookpv" id="lpv"></canvas><div style="font-size:12px;color:var(--sub);text-align:center">손가락으로 돌려 보세요</div><div id="lctl"></div><div class="row"><button class="btn sec" id="lrs">초기화</button><button class="btn" id="lsv">저장</button></div>`;
 const ctl=()=>`${xmasOn()?`<span class="lab">🎄 크리스마스</span><div class="chips"><button class="${L.hat==="santa"?"on":""}" data-k="hat" data-v="santa">🎅 산타 모자</button><button class="${L.hat==="antler"?"on":""}" data-k="hat" data-v="antler">🦌 루돌프 뿔</button><button class="${L.scarf==="#c8202b"?"on":""}" data-k="scarf" data-v="#c8202b">🧣 빨간 목도리</button><button class="${L.scarf==="#1f6f43"?"on":""}" data-k="scarf" data-v="#1f6f43">🧣 초록 목도리</button></div>`:""}
 <span class="lab">털색</span><div class="sw"><button class="no ${coat?"":"on"}" data-coat="">기본</button>${["#2c2b2a","#5c6168","#f6f4ef","#e8d6b8","#c9733a","#7a4a2b"].map(c=>`<button class="${coat===c?"on":""}" data-coat="${c}" style="background:${c}"></button>`).join("")}</div>
 <span class="lab">귀</span>${ch("ear",[["","기본"],["up","선 귀"],["flop","접힌 귀"],["half","반접힘"],["bat","박쥐 귀"]])}
 <span class="lab">눈 색</span>${sw("eye",["#3b2414","#7a4a1f","#c98a2b","#6fa8dc","#1a1a1a"],"기본")}<span class="lab">코 색</span>${sw("nose",["#151517","#6b4428","#d98c8c"],"기본")}
 <span class="lab">얼굴 무늬</span>${ch("mask",[["","기본"],["none","없음"],["husky","허스키"],["cheek","볼"],["blaze","이마 줄"]])}
 <span class="lab">흰 양말 · 꼬리 끝</span><div class="chips">${[["socks","on","흰 양말"],["socks","off","양말 없음"],["tip","on","꼬리 끝 흰색"],["tip","off","꼬리 끝 없음"]].map(([k,v,l])=>`<button class="${L[k]===v?"on":""}" data-k="${k}" data-v="${v}">${l}</button>`).join("")}<button class="${L.spots?"on":""}" data-k="spots" data-v="1">점박이</button></div>
 <span class="lab">꼬리</span>${ch("tail",[["","기본"],["curl","말린"],["sickle","낫"],["up","곧은"],["plume","풍성"],["down","내림"],["stub","짧은"]])}
 <span class="lab">목줄</span>${sw("collar",ACC)}<span class="lab">하네스</span>${sw("harness",ACC)}<span class="lab">반다나</span>${sw("bandana",ACC)}<span class="lab">목도리</span>${sw("scarf",ACC)}
 <span class="lab">모자</span>${ch("hat",[["","없음"],["beanie","비니"],["cap","캡"],["santa","산타"],["antler","루돌프 뿔"]])}`;
 DEX.openSheet(html());const bindCtl=()=>{$("lctl").innerHTML=ctl();
  document.querySelectorAll("#lctl [data-k]").forEach(x=>x.onclick=()=>{const k=x.dataset.k;let v=x.dataset.v;if(k==="spots"){L.spots=L.spots?0:1}else if(!v||L[k]===v&&["socks","tip","scarf","hat"].includes(k))delete L[k];else L[k]=v;bindCtl();pvSet(P())});
  document.querySelectorAll("#lctl [data-coat]").forEach(x=>x.onclick=()=>{coat=x.dataset.coat;bindCtl();pvSet(P())})};
 bindCtl();requestAnimationFrame(()=>pvStart($("lpv"),P()));
 $("lrs").onclick=()=>{Object.keys(L).forEach(k=>delete L[k]);coat="";bindCtl();pvSet(P())};
 $("lsv").onclick=()=>{dog.look={...L};dog.coat=coat;API.save();pvStop();$("sheet").classList.remove("on");toast(`${dog.dog}의 새 모습을 저장했어요 ✨`);renderMe()}}

/* ---------- 실종 모드 ---------- */
function openLost(d){DEX.openSheet(`<h3>🚨 실종 모드</h3><div style="font-size:13.5px;color:var(--sub);margin-bottom:8px">켜면 화면 위에 빨간 띠가 생기고, 강아지 정보·마지막 위치·태그 링크를 문자·카톡으로 바로 보낼 수 있어요. (정식 앱에서는 친구·그룹에 자동 알림)</div>
 ${API.list.length>1?dogSel(d.id):""}<span class="lab">에어태그·스마트태그 위치 공유 링크 (선택)</span><input class="inp" id="tl" placeholder="https://..." value="${esc(d.tagLink||"")}"><div style="font-size:12px;color:var(--sub);margin-top:6px">아이폰 '나의 찾기' › 물건 › 태그 › '물건 위치 공유'로 만든 링크(최대 7일)를 붙여 넣으세요.</div>
 <span class="lab">연락처 (선택)</span><input class="inp" id="tp" type="tel" placeholder="010-..." value="${esc(ld("de.phone",""))}"><div class="row"><button class="btn" id="lon" style="background:#d93036">실종 모드 켜기</button></div>`);
 let sel=d.id;document.querySelectorAll("#sheetIn [data-sd]").forEach(x=>x.onclick=()=>{sel=x.dataset.sd;document.querySelectorAll("#sheetIn [data-sd]").forEach(y=>y.classList.toggle("on",y===x))});
 $("lon").onclick=()=>{const v=$("tl").value.trim();if(v&&!/^https:\/\/[^\s"'<>]+$/.test(v))return toast("https:// 로 시작하는 링크만 넣을 수 있어요");const dg=dogById(sel);dg.tagLink=v;API.save();sv("de.phone",$("tp").value.trim().slice(0,20));const f=DEX.lastFix;sv("de.lost",{dog:sel,at:Date.now(),pos:f?[f[0],f[1]]:null});$("sheet").classList.remove("on");renderLost();setTab("map");shareLost()}}
function lostText(){const L=ld("de.lost",null);if(!L)return"";const d=dogById(L.dog)||{};const p=L.pos;const ph=ld("de.phone","");
 return`[반려견 실종] ${d.dog} (${bn(d.breed)}, ${d.sex==="f"?"암컷":"수컷"}${d.age?` ${d.age}살`:""}${d.wt?`, ${d.wt}kg`:""})\n마지막 위치: ${p?`https://maps.apple.com/?ll=${p[0].toFixed(5)},${p[1].toFixed(5)}&q=${encodeURIComponent(d.dog+" 마지막 위치")}`:"확인 중"}\n${d.tagLink?`태그 위치: ${d.tagLink}\n`:""}${ph?`연락: ${ph}\n`:""}보시면 연락 부탁드립니다 🙏`}
async function shareLost(){const t=lostText();try{if(navigator.share){await navigator.share({text:t});return}}catch(e){if(e&&e.name==="AbortError")return}try{await navigator.clipboard.writeText(t);toast("실종 안내 문구를 복사했어요. 카톡·문자에 붙여 넣어 주세요")}catch(e){DEX.openSheet(`<h3>실종 안내 문구</h3><textarea class="inp" style="height:160px;padding:10px">${esc(t)}</textarea>`)}}
function renderLost(){const L=ld("de.lost",null),b=$("lostBox");if(!L){b.innerHTML="";return}const d=dogById(L.dog)||{};
 b.innerHTML=`<div class="lostbar"><b style="flex:1">🚨 ${esc(d.dog)} 실종 모드</b>${d.tagLink?`<a href="${esc(d.tagLink)}" target="_blank" rel="noopener">태그</a>`:""}<button id="lsh">알리기</button><button id="lof">찾았어요</button></div>`;
 $("lsh").onclick=shareLost;$("lof").onclick=()=>{localStorage.removeItem("de.lost");renderLost();toast("다행이에요! 실종 모드를 껐어요 💙");if(TAB==="me")renderMe()}}

/* ---------- 루트 미리 계획 (이 폰에만 저장) ---------- */
let PLANS=ld("de.plans",[]),planMode=null;
const planLen=p=>{let s=0;for(let i=1;i<p.length;i++)s+=DEX.hav(p[i-1],p[i]);return s};
const ready=f=>{if(map.isStyleLoaded())f();else map.once("load",f)};
ready(()=>{map.addSource("plans",{type:"geojson",data:{type:"FeatureCollection",features:[]}});map.addLayer({id:"plans",type:"line",source:"plans",layout:{"line-cap":"round","line-join":"round"},paint:{"line-color":"#8e6cc9","line-width":5,"line-dasharray":[1.2,1.2],"line-opacity":.9}});
 map.addSource("planpts",{type:"geojson",data:{type:"FeatureCollection",features:[]}});map.addLayer({id:"planpts",type:"circle",source:"planpts",paint:{"circle-radius":5,"circle-color":"#8e6cc9","circle-stroke-color":"#fff","circle-stroke-width":2}});drawPlans()});
function drawPlans(){if(!map.getSource("plans"))return;const ls=[...PLANS.filter(p=>p.on).map(p=>p.pts),...(planMode?[planMode.pts]:[])].filter(l=>l.length>1);
 map.getSource("plans").setData({type:"FeatureCollection",features:ls.map(l=>({type:"Feature",geometry:{type:"LineString",coordinates:l.map(p=>[p[1],p[0]])},properties:{}}))});
 map.getSource("planpts").setData({type:"FeatureCollection",features:(planMode?planMode.pts:[]).map(p=>({type:"Feature",geometry:{type:"Point",coordinates:[p[1],p[0]]},properties:{}}))})}
function fitPlan(p){let a=[1e9,1e9],b=[-1e9,-1e9];p.pts.forEach(q=>{a[0]=Math.min(a[0],q[0]);a[1]=Math.min(a[1],q[1]);b[0]=Math.max(b[0],q[0]);b[1]=Math.max(b[1],q[1])});DEX.follow=false;map.fitBounds([[a[1],a[0]],[b[1],b[0]]],{padding:{top:120,bottom:240,left:50,right:60},maxZoom:17.5,bearing:0,pitch:30})}
function planClick(e){if(!planMode)return;planMode.pts.push([+e.lngLat.lat.toFixed(6),+e.lngLat.lng.toFixed(6)]);drawPlans();renderPlanBar()}
function planStart(){const f=DEX.lastFix;planMode={pts:f?[[f[0],f[1]]]:[],name:"",time:"19:00"};DEX.follow=false;map.on("click",planClick);drawPlans();renderPlanBar();toast("지도를 눌러 걸을 길을 이어 그려 주세요")}
function renderPlanBar(){const b=$("planBox");if(!planMode){b.innerHTML="";return}
 b.innerHTML=`<div class="planbar"><b>🗺️ 루트 계획</b> <span style="color:var(--sub);font-size:13px">${planMode.pts.length}개 지점 · ${(planLen(planMode.pts)/1000).toFixed(2)}km</span><div class="two" style="margin:8px 0"><input class="inp" id="pnm" placeholder="루트 이름" value="${esc(planMode.name)}" maxlength="24"><input class="inp" id="ptm" type="time" value="${planMode.time}"></div><div class="row" style="margin-top:0"><button class="btn sec" id="pun">되돌리기</button><button class="btn sec" id="pcx">취소</button><button class="btn" id="psv">저장</button></div></div>`;
 const keep=()=>{planMode.name=$("pnm").value;planMode.time=$("ptm").value};$("pun").onclick=()=>{keep();planMode.pts.pop();drawPlans();renderPlanBar()};$("pcx").onclick=()=>{endPlan()};
 $("psv").onclick=()=>{keep();if(planMode.pts.length<2)return toast("지점을 2개 이상 찍어 주세요");PLANS.push({id:"pl"+Date.now().toString(36),name:planMode.name||"내 루트",time:planMode.time,pts:planMode.pts,on:true});sv("de.plans",PLANS);endPlan();toast("루트를 저장했어요 (이 폰에만 저장)")}}
function endPlan(){planMode=null;map.off("click",planClick);drawPlans();renderPlanBar()}

/* ---------- 산책 시작 전: 누구랑 · 목적 · 시간 · 음악 ---------- */
const PURP=["자유 산책","친구 만나기","조용히 걷기","훈련","배변만"];
DEX.beforeStart=start=>{let sel=API.with,pur=ld("de.purpose","자유 산책"),mins=ld("de.mins",30);const music=ld("de.music","");
 const draw=()=>{DEX.openSheet(`<h3>오늘 산책</h3>${API.list.length>1?`<span class="lab" style="margin-top:0">누구랑 나갈까요?</span><div class="dogs">${API.list.map(d=>`<button class="${sel.includes(d.id)?"on":""}" data-w="${d.id}">${av(d)}${esc(d.dog)}</button>`).join("")}</div>`:""}
 <span class="lab">산책 목적</span><div class="chips">${PURP.map(p=>`<button class="${pur===p?"on":""}" data-p="${p}">${p}</button>`).join("")}</div>
 <span class="lab">예상 시간</span><div class="chips">${[15,30,45,60].map(m=>`<button class="${mins===m?"on":""}" data-m="${m}">${m}분</button>`).join("")}</div>
 <div class="row"><button class="btn" id="go">${API.names()&&sel.length?"출발 🐾":"출발"}</button></div>${music?`<div class="row" style="margin-top:6px"><a class="btn sec" style="display:grid;place-items:center;text-decoration:none" href="${MUSIC[music][1]}" target="_blank" rel="noopener">🎵 ${MUSIC[music][0]} 열기</a></div>`:`<div style="font-size:12px;color:var(--sub);margin-top:8px">'내 강아지 › 앱 설정'에서 음악 앱을 고르면 여기서 바로 열 수 있어요.</div>`}`);
  document.querySelectorAll("#sheetIn [data-w]").forEach(x=>x.onclick=()=>{const id=x.dataset.w;sel=sel.includes(id)?sel.filter(q=>q!==id):[...sel,id];if(!sel.length)sel=[id];draw()});
  document.querySelectorAll("#sheetIn [data-p]").forEach(x=>x.onclick=()=>{pur=x.dataset.p;draw()});document.querySelectorAll("#sheetIn [data-m]").forEach(x=>x.onclick=()=>{mins=+x.dataset.m;draw()});
  $("go").onclick=()=>{API.setWith(sel);sv("de.purpose",pur);sv("de.mins",mins);$("sheet").classList.remove("on");start();toast(`${API.names()}, 출발! 🐾`)}};draw()};
const _end=DEX.onEnd;DEX.onEnd=w=>{_end&&_end(w);w.dogs=API.with;w.purpose=ld("de.purpose","")};

/* ---------- 가입 동의 ---------- */
function openConsent(view){const rows=[["age",1,"만 14세 이상입니다"],["tos",1,"서비스 이용약관 (회원 간 만남·반려견 사고 책임 범위 포함)"],["priv",1,"개인정보 수집·이용"],["loc",1,"위치기반서비스 이용약관"],["safe",1,"안전 수칙 (직접 확인)"],["mkt",0,"이벤트·혜택 알림"]];
 DEX.openSheet(`<h3>DogEarth에 오신 걸 환영해요</h3><div style="font-size:13px;color:var(--sub);margin-bottom:8px">시작하기 전에 확인해 주세요. (테스트판 예시 화면)</div>${view?"":`<div class="tog2"><b>필수 항목 모두 동의</b><input type="checkbox" id="call"></div>`}
 <table class="tbl">${rows.map(([k,r,l])=>`<tr><td style="width:26px">${view?(r?"✔︎":"·"):`<input type="checkbox" data-cs="${k}">`}</td><td>${r?`<b style="color:#d93036">필수</b>`:`<span style="color:var(--sub)">선택</span>`} ${l}${k==="safe"?`<div style="color:var(--sub);font-size:12px;margin-top:4px">위치는 고른 친구에게만, 버튼을 눌렀을 때만 · 첫 만남은 낮에 공개된 장소 · 반려견 사고는 보호자 책임 · 견주 사칭·추적 목적 사용 시 이용 제한</div>`:""}</td></tr>`).join("")}</table>
 ${view?`<div class="row"><button class="btn" id="cok">닫기</button></div>`:`<div style="font-size:12px;color:var(--sub);margin-top:8px">'안전 수칙'은 전체 동의에 포함되지 않아 직접 체크해야 해요.</div><div class="row"><button class="btn" id="cok">동의하고 시작</button></div>`}`);
 if(view){$("cok").onclick=()=>$("sheet").classList.remove("on");return}
 $("call").onchange=e=>document.querySelectorAll("#sheetIn [data-cs]").forEach(c=>{if(c.dataset.cs!=="safe"&&c.dataset.cs!=="mkt")c.checked=e.target.checked});
 $("cok").onclick=()=>{const v=k=>document.querySelector(`#sheetIn [data-cs="${k}"]`).checked;if(!["age","tos","priv","loc","safe"].every(v))return toast("필수 항목에 모두 동의해 주세요");sv("de.consent",{v:"2026-11-test",at:Date.now(),mkt:v("mkt")});$("sheet").classList.remove("on")}}
if(!ld("de.consent",null))setTimeout(()=>openConsent(false),900);
// 배경 탭으로 동의 창이 닫히지 않게
$("sheet").addEventListener("click",e=>{if(e.target.id==="sheet"&&!ld("de.consent",null)){e.stopImmediatePropagation();setTimeout(()=>$("sheet").classList.add("on"),0)}},true);

/* ---------- 산책 중 배변 기록 버튼 · 시작 ---------- */
/* ---------- 산책 중 기록 (소변·대변·물·사진·만남·반응·메모) ---------- */
const EVT={pee:["💧","소변"],poop:["💩","대변"],water:["🚰","물"],photo:["📷","사진"],friend:["🐕","친구 만남"],react:["⚠️","짖음·반응"],memo:["📝","메모"]};
let EV=ld("de.ev.cur",[]),evMk=[];
DEX.evSummary=evs=>{const c={};evs.forEach(e=>c[e.k]=(c[e.k]||0)+1);return Object.entries(c).map(([k,n])=>`${EVT[k]?EVT[k][0]:"•"} ${EVT[k]?EVT[k][1]:k} ${n}`).join(" · ")};
function evMarker(e){const el=document.createElement("div");el.textContent=EVT[e.k][0];el.style.cssText="font-size:17px;filter:drop-shadow(0 1px 2px rgba(0,0,0,.35));pointer-events:none";return new maplibregl.Marker({element:el}).setLngLat([e.lng,e.lat]).addTo(map)}
function logEv(k,extra){const f=DEX.lastFix;if(!f)return toast("현재 위치를 찾는 중이에요");const e=Object.assign({k,t:Date.now(),lat:+f[0].toFixed(6),lng:+f[1].toFixed(6),dogs:API.with},extra||{});EV.push(e);sv("de.ev.cur",EV);evMk.push(evMarker(e));renderEvBar();
 if(k==="pee"||k==="water"||k==="friend"||k==="react")toast(`${EVT[k][0]} ${EVT[k][1]} 기록 · ${new Date().toTimeString().slice(0,5)}`);try{navigator.vibrate&&navigator.vibrate(10)}catch(x){}}
const MB="background:#fff;color:#141619;border:1px solid var(--line);box-shadow:0 4px 12px rgba(0,0,0,.15)";
document.head.insertAdjacentHTML("beforeend",`<style>.evbar{position:fixed;right:10px;bottom:calc(env(safe-area-inset-bottom) + 170px);z-index:560;display:flex;flex-direction:column;gap:8px;align-items:flex-end}
.evbar button{width:50px;height:50px;border-radius:50%;font-size:22px;${MB}}.evbar .main{width:58px;height:58px;background:#2D55E8;color:#fff;border:0;font-size:15px;font-weight:700}
.evbar .lbl{position:relative}.evbar .lbl::after{content:attr(data-l);position:absolute;right:58px;top:50%;transform:translateY(-50%);background:rgba(20,22,25,.85);color:#fff;font-size:12px;padding:3px 7px;border-radius:8px;white-space:nowrap}
.evcnt{position:absolute;top:-4px;right:-4px;background:#E0782A;color:#fff;font-size:11px;border-radius:10px;padding:1px 6px}</style>`);
let evOpen=false;
function renderEvBar(){let b=$("evbar");if(!DEX.cur){b&&b.remove();return}if(!b){document.body.insertAdjacentHTML("beforeend",`<div class="evbar" id="evbar"></div>`);b=$("evbar")}
 const quick=["pee","poop","photo","water","friend","react","memo"];
 b.innerHTML=(evOpen?quick.map(k=>`<button class="lbl" data-l="${EVT[k][1]}" data-e="${k}">${EVT[k][0]}</button>`).join(""):`<button data-e="pee" title="소변">💧</button><button data-e="poop" title="대변">💩</button>`)+`<button class="main" id="evm" style="position:relative">${evOpen?"닫기":"기록"}${EV.length&&!evOpen?`<span class="evcnt">${EV.length}</span>`:""}</button>`;
 $("evm").onclick=()=>{evOpen=!evOpen;renderEvBar()};
 b.querySelectorAll("[data-e]").forEach(x=>x.onclick=async()=>{const k=x.dataset.e;evOpen=false;
  if(k==="poop")return DEX.addPoop(st=>logEv("poop",{shape:st.shape}));
  if(k==="photo"){const ids=await pickPhotos();if(ids.length){logEv("photo",{imgs:ids});toast(`📷 사진 ${ids.length}장 기록`)}return}
  if(k==="memo"){DEX.openSheet(`<h3>📝 산책 메모</h3><input class="inp" id="evmemo" maxlength="80" placeholder="예: 공원 입구 공사 중, 보리랑 30분 놀았음"><div class="row"><button class="btn" id="evms">기록</button></div>`);setTimeout(()=>$("evmemo").focus(),200);$("evms").onclick=()=>{const m=$("evmemo").value.trim();if(m){logEv("memo",{memo:m.slice(0,80)});toast("📝 메모 기록")}$("sheet").classList.remove("on")};return}
  logEv(k)})}
const _st=DEX.onStart;DEX.onStart=()=>{_st&&_st();EV=[];sv("de.ev.cur",EV);evMk.splice(0).forEach(m=>m.remove());renderEvBar()};
const _en=DEX.onEnd;DEX.onEnd=w=>{if(EV.length)w.events=EV.slice(0,300);_en&&_en(w);EV=[];sv("de.ev.cur",[]);setTimeout(()=>{evMk.splice(0).forEach(m=>m.remove());renderEvBar()},50)};
// 기록 보기에서 지도로 볼 때 그 산책의 기록 표시
const _vw=window.DE.view;window.DE.view=id=>{_vw(id);evMk.splice(0).forEach(m=>m.remove());const w=DEX.walks().find(x=>x.id===id);(w&&w.events||[]).forEach(e=>evMk.push(evMarker(e)))};
if(DEX.cur){EV.forEach(e=>evMk.push(evMarker(e)));renderEvBar()}

renderLost();
})();
