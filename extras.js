/* DogEarth 실제 지도 테스트판 — 3D 강아지 · 인사 카드 · 소리/트레이닝 · 클리커 */
(()=>{
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ld=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}};
const sv=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const PK="de.prof.v1";
let prof=ld(PK,{dog:"Weesky",breed:"husky",coat:"#2c2b2a",look:{mask:"husky",eye:"#6fa8dc",collar:"#2d55e8"}});
const toast=m=>DEX.toast(m);

document.head.insertAdjacentHTML("beforeend",`<style>
.dogm{pointer-events:none}.dogm canvas{width:150px;height:150px;display:block}
.dogon .me{transform:scale(.5);opacity:.55}
.greet{position:fixed;left:12px;right:12px;top:calc(env(safe-area-inset-top) + 62px);z-index:600;max-width:440px;margin:0 auto;background:rgba(255,255,255,.97);border:1px solid var(--line);border-radius:18px;padding:14px 16px;box-shadow:0 10px 30px rgba(0,0,0,.14);animation:gin .5s cubic-bezier(.2,.9,.3,1.2)}
@keyframes gin{from{opacity:0;transform:translateY(-14px) scale(.98)}to{opacity:1;transform:none}}
.greet h3{margin:0 0 4px;font-size:17px;letter-spacing:-.3px}.greet p{margin:3px 0;font-size:13.5px;color:var(--sub);line-height:1.45}
.greet .score{display:inline-flex;gap:6px;font-weight:700;font-size:13px;padding:3px 9px;border-radius:999px;margin:4px 0}
.greet .x2{position:absolute;right:10px;top:6px;border:0;background:none;font-size:20px;color:var(--sub)}
.clk{position:fixed;right:14px;bottom:calc(env(safe-area-inset-bottom) + 240px);z-index:560;width:72px;height:72px;border-radius:50%;border:0;background:#E0782A;color:#fff;font:700 14px/1.1 -apple-system,system-ui,sans-serif;box-shadow:0 6px 18px rgba(224,120,42,.45);touch-action:manipulation;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}
.clk small{display:block;font-weight:500;font-size:10px;opacity:.9;margin-top:2px}.clk:active{transform:scale(.93)}
.pad{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:8px 0}.pad button{padding:14px 4px;border-radius:14px;border:1px solid var(--line);background:#fff;color:var(--tx);font:600 14px/1.3 -apple-system,system-ui,sans-serif}.pad button small{display:block;font-weight:400;color:var(--sub);font-size:11px}.pad button:active{transform:scale(.96);background:#fdf0e6}
.seg2{display:flex;background:#eceef2;border-radius:12px;padding:3px;margin:4px 0 10px}.seg2 button{flex:1;border:0;background:none;padding:8px;border-radius:9px;font:600 13px -apple-system,system-ui,sans-serif;color:var(--sub)}.seg2 button.on{background:#fff;color:var(--tx);box-shadow:0 1px 3px rgba(0,0,0,.1)}
.bigclk{width:100%;height:120px;border-radius:20px;border:0;background:#E0782A;color:#fff;font:800 24px/1.2 -apple-system,system-ui,sans-serif;margin:4px 0 8px;touch-action:manipulation}
.cmd{display:flex;align-items:center;gap:8px;padding:9px 0;border-bottom:1px solid var(--line)}.cmd b{flex:1;font-size:15px}.cmd .n{font-size:12.5px;color:var(--sub);min-width:70px;text-align:right}
.sel{width:100%;height:44px;border-radius:12px;border:1px solid var(--line);padding:0 10px;font:15px -apple-system,system-ui,sans-serif;background:#fff}
.inp{width:100%;height:44px;border-radius:12px;border:1px solid var(--line);padding:0 12px;font:16px -apple-system,system-ui,sans-serif}
.lab{font-size:12.5px;color:var(--sub);margin:12px 0 6px;display:block}
.sw{display:flex;flex-wrap:wrap;gap:8px}.sw button{width:32px;height:32px;border-radius:50%;border:2px solid var(--line)}.sw button.on{outline:3px solid #2D55E8;outline-offset:1px}.sw button.no{background:#fff;width:auto;border-radius:16px;padding:0 10px;font-size:12px;color:var(--sub)}
.chips{display:flex;flex-wrap:wrap;gap:6px}.chips button{border:1px solid var(--line);background:#fff;border-radius:999px;padding:7px 12px;font:13px -apple-system,system-ui,sans-serif;color:var(--tx)}.chips button.on{background:#141619;color:#fff;border-color:#141619}
.star{font-size:16px;filter:drop-shadow(0 1px 2px rgba(0,0,0,.35))}
.pbtn{font-size:20px}
</style>`);
document.body.insertAdjacentHTML("beforeend",`<div id="greetBox"></div><button class="clk" id="clk" hidden>딸깍<small>길게: 휘슬</small></button>`);
// 상단 버튼 추가
$("bHist").insertAdjacentHTML("beforebegin",`<button class="ibtn pbtn" id="bDog" title="내 강아지">🐶</button><button class="ibtn" id="bPad" title="소리·트레이닝">🔊</button>`);

/* ---------- 3D 강아지 마커 ---------- */
const map=DEX.map;let dog=null,R=null,SC=null,CAM=null,marker=null,disp=null,target=null,lastMove=0,speed=0,prevFix=null;
function buildScene(){if(!window.THREE)return false;const cv=document.createElement("canvas");cv.width=300;cv.height=300;
 R=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true});R.setPixelRatio(1);R.setSize(300,300,false);
 SC=new THREE.Scene();SC.add(new THREE.HemisphereLight(0xffffff,0x8a8070,.95));const dl=new THREE.DirectionalLight(0xffffff,.7);dl.position.set(-2,5,3);SC.add(dl);
 CAM=new THREE.OrthographicCamera(-1.3,1.3,1.3,-1.3,.1,50);CAM.position.set(0,5.2,4.2);CAM.lookAt(0,.35,0);
 const icon=L.divIcon({className:"dogm",html:"",iconSize:[150,150],iconAnchor:[75,98]});
 marker=L.marker([37.5665,126.978],{icon,interactive:false,zIndexOffset:500});marker.on("add",()=>{const el=marker.getElement();el.innerHTML="";el.appendChild(cv)});
 setDog();return true}
function setDog(){if(!SC)return;if(dog)SC.remove(dog.g);dog=buildDog(prof);const B=specOf(prof);dog.g.scale.setScalar(1.25/Math.max(.7,B.s*1.0));SC.add(dog.g);dog.heading=-Math.PI/2;dog.g.rotation.y=dog.heading}
DEX.onFix=(lat,lng,acc,t)=>{if(!marker&&!buildScene())return;target=[lat,lng];if(!disp){disp=[lat,lng];marker.setLatLng(disp).addTo(map);document.body.classList.add("dogon")}
 if(prevFix){const d=map.distance(prevFix,[lat,lng]),dt=Math.max(.5,(t-prevFix[2])/1000);if(d>1.2&&d/dt<8){speed=d/dt;lastMove=Date.now()}}prevFix=[lat,lng,t];
 if(!DEX.greeted){DEX.greeted=1;showGreet(lat,lng)}};
let lt=performance.now();
function loop(n){const dt=Math.min(.05,(n-lt)/1000);lt=n;if(dog&&disp&&target){const d=map.distance(disp,target);
  if(d>60){disp=target.slice()}else{const k=Math.min(1,dt*1.6);const nl=[disp[0]+(target[0]-disp[0])*k,disp[1]+(target[1]-disp[1])*k];
   if(d>.4){const p1=map.project(disp,20),p2=map.project(nl,20),dx=p2.x-p1.x,dy=p2.y-p1.y;if(Math.hypot(dx,dy)>.01){const want=Math.atan2(-dy,dx);let df=want-dog.heading;df=Math.atan2(Math.sin(df),Math.cos(df));dog.heading+=df*Math.min(1,dt*6);dog.g.rotation.y=dog.heading}}disp=nl}
  marker.setLatLng(disp);const moving=Date.now()-lastMove<3500&&d>.25;animDog(dog,dt*(moving?Math.min(1.6,.6+speed/1.4):1),moving,n/1000);R.render(SC,CAM)}
 requestAnimationFrame(loop)}
requestAnimationFrame(loop);
// 화면 x 방향 = 3D x, 화면 아래 방향 = 3D +z → heading = atan2(-dz,dx) 기준. 투영 y는 아래로 증가하므로 atan2(dy,dx)를 그대로 사용(= -(-dy)).

/* ---------- 내 강아지 (이름·견종·꾸미기) ---------- */
const BKEYS=Object.keys(BREEDS);const COATS2=["","#2c2b2a","#5c6168","#f6f4ef","#e8d6b8","#c9733a","#7a4a2b"];const ACC=["#2d55e8","#c0453a","#E0782A","#2fb36d","#e7a1b0","#141619","#f4efe6"];
function openDog(){const d=JSON.parse(JSON.stringify(prof));d.look=d.look||{};
 const sw=(k,cols)=>`<div class="sw"><button class="no ${d.look[k]?"":"on"}" data-k="${k}" data-v="">없음</button>${cols.map(c=>`<button class="${d.look[k]===c?"on":""}" data-k="${k}" data-v="${c}" style="background:${c}"></button>`).join("")}</div>`;
 const ch=(k,opts)=>`<div class="chips">${opts.map(([v,l])=>`<button class="${(d.look[k]||"")===v?"on":""}" data-k="${k}" data-v="${v}">${l}</button>`).join("")}</div>`;
 const draw=()=>{DEX.openSheet(`<h3>내 강아지</h3><label class="lab">이름</label><input class="inp" id="dn" value="${esc(d.dog)}" maxlength="16">
 <label class="lab">견종</label><select class="sel" id="db">${BKEYS.map(k=>`<option value="${k}" ${d.breed===k?"selected":""}>${esc(BREEDS[k].n[0])}</option>`).join("")}</select>
 <label class="lab">털색</label><div class="sw">${COATS2.map(c=>`<button class="${c?"":"no"} ${(d.coat||"")===c?"on":""}" data-coat="${c}" ${c?`style="background:${c}"`:""}>${c?"":"기본"}</button>`).join("")}</div>
 <label class="lab">얼굴 무늬</label>${ch("mask",[["","기본"],["none","없음"],["husky","허스키"],["cheek","볼"],["blaze","이마 줄"]])}
 <label class="lab">귀</label>${ch("ear",[["","기본"],["up","선 귀"],["flop","접힌 귀"],["half","반접힘"]])}
 <label class="lab">눈 색</label>${sw("eye",["#3b2414","#c98a2b","#6fa8dc","#1a1a1a"])}
 <label class="lab">목줄</label>${sw("collar",ACC)}<label class="lab">하네스</label>${sw("harness",ACC)}<label class="lab">반다나</label>${sw("bandana",ACC)}
 <label class="lab">모자</label>${ch("hat",[["","없음"],["beanie","비니"],["cap","캡"]])}
 <div class="row"><button class="btn" id="dsave">저장</button></div><div class="note">저장하면 지도 위 강아지에 바로 반영됩니다.</div>`);
  const keep=()=>{d.dog=$("dn").value.trim()||"Weesky";d.breed=$("db").value};
  document.querySelectorAll("#sheetIn [data-k]").forEach(b=>b.onclick=()=>{keep();const k=b.dataset.k,v=b.dataset.v;if(v)d.look[k]=v;else delete d.look[k];draw()});
  document.querySelectorAll("#sheetIn [data-coat]").forEach(b=>b.onclick=()=>{keep();d.coat=b.dataset.coat;draw()});
  $("db").onchange=()=>{keep();draw()};
  $("dsave").onclick=()=>{keep();prof=d;sv(PK,prof);setDog();$("sheet").classList.remove("on");toast(`${prof.dog}의 새 모습을 저장했어요 ✨`)}};draw()}
$("bDog").onclick=openDog;

/* ---------- 인사 카드 (실제 날씨·미세먼지: Open-Meteo) ---------- */
const WMO=c=>c===0?["맑음","clear"]:c<=3?["구름 조금","cloud"]:c<=48?["안개","fog"]:c<=67||(c>=80&&c<=82)?["비","rain"]:c<=77||c===85||c===86?["눈","snow"]:c>=95?["뇌우","rain"]:["흐림","cloud"];
const pmGrade=(p10,p25)=>{const g10=p10==null?0:p10<=30?0:p10<=80?1:p10<=150?2:3,g25=p25==null?0:p25<=15?0:p25<=35?1:p25<=75?2:3,g=Math.max(g10,g25);return[["좋음","보통","나쁨","매우 나쁨"][g],g]};
async function fetchWx(lat,lng){const f=(u)=>fetch(u).then(r=>r.ok?r.json():null).catch(()=>null);
 const [w,a]=await Promise.all([f(`https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(3)}&longitude=${lng.toFixed(3)}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`),f(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat.toFixed(3)}&longitude=${lng.toFixed(3)}&current=pm10,pm2_5&timezone=auto`)]);
 if(!w||!w.current)return null;const c=w.current,[sky,sk]=WMO(c.weather_code),[pmL,pmG]=pmGrade(a&&a.current&&a.current.pm10,a&&a.current&&a.current.pm2_5);return{t:Math.round(c.temperature_2m),feel:Math.round(c.apparent_temperature),sky,sk,wind:c.wind_speed_10m,pmL,pmG}}
function suit(w){const dbl=["husky","jindo","shiba","corgi","pom","gsd","golden"].includes(prof.breed),small=(BREEDS[prof.breed]||{}).sz==="S";let sc=92;const tips=[];
 if(w.sk==="rain"){sc-=35;tips.push("비가 와요. 짧게 다녀오고 발을 잘 말려 주세요.")}
 if(w.sk==="snow"){sc-=12;tips.push("제설제는 발바닥을 자극해요. 다녀와서 꼭 닦아 주세요.")}
 if(w.t>=27){sc-=dbl?40:28;tips.push(dbl?`${esc(prof.dog)}처럼 이중모는 더위에 약해요. 해 진 뒤 짧게 걸어요.`:"더워요. 그늘 위주로, 물을 챙겨요.")}
 if(w.t>=30)tips.push("아스팔트가 뜨거울 수 있어요. 손등을 5초 대 보고 뜨거우면 피해 주세요.");
 if(w.feel<=0){if(small){sc-=30;tips.push("소형견은 추위에 약해요. 옷을 입혀 주세요.")}else if(dbl)tips.push(`${esc(prof.dog)}에게는 딱 좋은 날씨예요 ❄️`);else{sc-=12;tips.push("쌀쌀해요. 오래 머무르지 않게 해 주세요.")}}
 if(w.pmG>=2){sc-=w.pmG===3?45:30;tips.push(`미세먼지 ${w.pmL}이에요. 오늘은 짧게 다녀오세요.`)}else if(w.pmG===1)sc-=6;
 if(w.wind>=30){sc-=8;tips.push("바람이 강해요. 소리에 민감하면 짧게 걸어요.")}
 if(!tips.length)tips.push("바람도 선선하고 산책하기 딱 좋아요.");return{sc:Math.max(5,Math.min(100,sc)),tips}}
async function showGreet(lat,lng){const box=$("greetBox"),h=new Date().getHours(),hi=h<5?"늦은 밤이에요":h<11?"좋은 아침이에요":h<17?"좋은 오후예요":"좋은 저녁이에요";
 const td=new Date().toDateString(),seen=ld("de.greet","")===td;sv("de.greet",td);
 box.innerHTML=`<div class="greet"><button class="x2" id="gx">×</button><h3>${hi}, ${esc(prof.dog)} 보호자님</h3><p>날씨를 확인하는 중…</p></div>`;$("gx").onclick=()=>box.innerHTML="";
 const w=await fetchWx(lat,lng);if(!box.firstChild)return;
 if(!w){box.innerHTML=`<div class="greet"><button class="x2" id="gx">×</button><h3>${hi}, ${esc(prof.dog)} 보호자님</h3><p>오늘도 즐거운 산책 되세요 🐾</p></div>`;$("gx").onclick=()=>box.innerHTML="";return}
 const {sc,tips}=suit(w),col=sc>=75?"#2fb36d":sc>=50?"#e3a008":"#e5484d",lab=sc>=75?"산책 좋음":sc>=50?"짧게 추천":"실내 놀이 추천";
 const today=DEX.walks().filter(x=>new Date(x.start).toDateString()===td),km=today.reduce((a,x)=>a+x.dist,0)/1000;
 box.innerHTML=`<div class="greet"><button class="x2" id="gx">×</button><h3>${hi}, ${esc(prof.dog)} 보호자님</h3><span class="score" style="background:${col}22;color:${col}">● ${lab} · ${sc}</span>
 <p>${w.sky} ${w.t}°C (체감 ${w.feel}°C) · 미세먼지 ${w.pmL}</p>${(seen?tips.slice(0,1):tips.slice(0,2)).map(x=>`<p>${x}</p>`).join("")}${today.length?`<p>🐾 오늘 ${today.length}번 · ${km.toFixed(2)}km 걸었어요</p>`:""}</div>`;
 $("gx").onclick=()=>box.innerHTML="";setTimeout(()=>{const g=box.firstChild;if(g){g.style.transition="opacity .4s";g.style.opacity=0;setTimeout(()=>box.innerHTML="",420)}},seen?7000:14000)}
setTimeout(()=>{if(!DEX.greeted){DEX.greeted=1;showGreet(37.5665,126.978)}},9000);

/* ---------- 소리 ---------- */
let AC=null;const ac=()=>{if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(AC&&AC.state==="suspended")AC.resume();return AC};
const VOL=.6;let lock=0;
function env(g,t0,a,d,p){g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(p,t0+a);g.gain.exponentialRampToValueAtTime(.0001,t0+a+d)}
function tone(type,f0,f1,dur,pk){const c=ac();if(!c)return;const o=c.createOscillator(),g=c.createGain(),t0=c.currentTime;o.type=type;o.frequency.setValueAtTime(f0,t0);if(f1)o.frequency.exponentialRampToValueAtTime(f1,t0+dur);env(g,t0,.008,dur,(pk||.4)*VOL);o.connect(g).connect(c.destination);o.start(t0);o.stop(t0+dur+.05)}
function noise(dur,fq,pk,q){const c=ac();if(!c)return;const n=Math.floor(c.sampleRate*dur),b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(Math.random()<.35?1:.3);const s=c.createBufferSource();s.buffer=b;const f=c.createBiquadFilter();f.type="bandpass";f.frequency.value=fq;f.Q.value=q||1.2;const g=c.createGain(),t0=c.currentTime;env(g,t0,.005,dur,(pk||.5)*VOL);s.connect(f).connect(g).connect(c.destination);s.start(t0)}
const BARKS={ko:["🇰🇷","멍멍",520,2,220],us:["🇺🇸","Woof",380,1,0],jp:["🇯🇵","ワンワン",600,2,200],fr:["🇫🇷","Ouaf",440,1,0],es:["🇪🇸","Guau",470,2,260],de:["🇩🇪","Wau",400,2,240],it:["🇮🇹","Bau",450,2,230],ru:["🇷🇺","Гав",360,2,250],cn:["🇨🇳","汪汪",560,2,190]};
let rec=ld("de.praise","");
const SND={click(){tone("square",3200,1800,.03,.55);setTimeout(()=>tone("square",2400,1200,.025,.35),35)},
 squeak(){tone("sine",1400,2300,.12,.45);setTimeout(()=>tone("sine",2300,1500,.14,.4),130)},
 bag(){for(let i=0;i<7;i++)setTimeout(()=>noise(.06+Math.random()*.05,3000+Math.random()*3000,.45,.8),i*70)},
 whistle(f,dur){if(Date.now()<lock){toast("잠깐 쉬었다가 눌러 주세요 (강아지 귀 보호)");return}lock=Date.now()+900;const c=ac();if(!c)return;dur=Math.min(dur||.6,2.5);const o=c.createOscillator(),l=c.createOscillator(),lg=c.createGain(),g=c.createGain(),t0=c.currentTime;o.type="sine";o.frequency.value=f;l.frequency.value=f>10000?0:6;lg.gain.value=f*.012;l.connect(lg).connect(o.frequency);env(g,t0,.03,dur,(f>10000?.7:.35)*VOL);o.connect(g).connect(c.destination);o.start(t0);l.start(t0);o.stop(t0+dur+.1);l.stop(t0+dur+.1)},
 bark(k){const [,,f,n,gap]=BARKS[k];for(let i=0;i<n;i++)setTimeout(()=>{tone("sawtooth",f,f*.62,.13,.32);noise(.12,f*1.6,.25,1.5)},i*gap)},
 praise(){if(rec){try{const a=new Audio(rec);a.play();return}catch(e){}}try{const u=new SpeechSynthesisUtterance("잘했어!");u.lang="ko-KR";u.pitch=1.3;speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){tone("sine",660,990,.25,.4)}}};
async function recPraise(cb){try{const st=await navigator.mediaDevices.getUserMedia({audio:true});const mr=new MediaRecorder(st),ch=[];mr.ondataavailable=e=>ch.push(e.data);
 mr.onstop=()=>{st.getTracks().forEach(t=>t.stop());const fr=new FileReader();fr.onload=()=>{if(String(fr.result).length<600000){rec=fr.result;sv("de.praise",rec);toast("칭찬 소리를 저장했어요 👏")}else toast("녹음이 너무 길어요");cb&&cb()};fr.readAsDataURL(new Blob(ch,{type:mr.mimeType||"audio/mp4"}))};
 mr.start();toast("🎙️ 2초 동안 '잘했어!'라고 말해 주세요");setTimeout(()=>mr.stop(),2000)}catch(e){toast("마이크 권한이 필요해요")}}

/* ---------- 클리커 (산책 중) ---------- */
let clicks=[];
(()=>{const b=$("clk");let tm=0,longed=false,last=0;
 b.addEventListener("touchstart",e=>e.preventDefault(),{passive:false});
 b.onpointerdown=e=>{e.preventDefault();longed=false;tm=setTimeout(()=>{longed=true;SND.whistle(5000,.9);log("whistle")},480)};
 b.onpointerup=e=>{e.preventDefault();clearTimeout(tm);if(longed)return;const n=Date.now();if(n-last<320){last=0;SND.praise();log("praise");return}last=n;SND.click();log("click")};
 b.onpointercancel=()=>clearTimeout(tm);b.oncontextmenu=e=>e.preventDefault()})();
const stars=L.layerGroup().addTo(map);
function log(k){const f=DEX.lastFix;if(!f)return;clicks.push([+f[0].toFixed(6),+f[1].toFixed(6),Date.now(),k]);L.marker([f[0],f[1]],{icon:L.divIcon({className:"star",html:k==="praise"?"💛":k==="whistle"?"🎵":"⭐",iconSize:[18,18],iconAnchor:[9,9]}),interactive:false}).addTo(stars);
 $("clk").animate([{transform:"scale(1)"},{transform:"scale(1.12)"},{transform:"scale(1)"}],{duration:200})}
DEX.onStart=()=>{clicks=[];stars.clearLayers();$("clk").hidden=false;SND.squeak()};
DEX.onEnd=w=>{$("clk").hidden=true;if(clicks.length)w.clicks=clicks.slice(0,300)};
if(DEX.cur)$("clk").hidden=false;

/* ---------- 소리 패드 · 트레이닝 ---------- */
const CMDS=[["sit","앉아"],["stay","기다려"],["come","이리 와"],["paw","손"],["down","엎드려"],["heel","옆에"]];
const TK="de.train.v1",tday=()=>new Date().toISOString().slice(0,10);
function openPad(tab){tab=tab||"train";const all=ld(TK,{}),tr=all[tday()]||{};
 const head=`<h3>소리 · 트레이닝</h3><div class="seg2"><button class="${tab==="train"?"on":""}" data-tb="train">트레이닝</button><button class="${tab==="pad"?"on":""}" data-tb="pad">소리 패드</button></div>`;
 if(tab==="pad")DEX.openSheet(`${head}<div class="lab">시선 끌기</div><div class="pad"><button data-s="squeak">🧸<small>삑삑이</small></button><button data-s="bag">🛍️<small>간식 봉지</small></button><button data-s="click">👆<small>클리커</small></button></div>
 <div class="lab">훈련 휘슬</div><div class="pad"><button data-w="5000,.35">〰️<small>짧게 · 주목</small></button><button data-w="5000,1.1">〰️〰️<small>길게 · 이리 와</small></button><button data-w="18000,.8">🔇<small>고음 18kHz</small></button></div>
 <div class="note" style="text-align:left">폰 스피커는 약 20kHz까지만 나와서 사람에게 안 들리는 초음파 휘슬은 불가능해요. 고음 모드는 가까운 거리에서만 효과가 있고, 귀 보호를 위해 연속 재생을 막아 둡니다.</div>
 <div class="lab">나라별 짖는 소리 (임시 합성음)</div><div class="pad">${Object.entries(BARKS).map(([k,b])=>`<button data-b="${k}">${b[0]}<small>${esc(b[1])}</small></button>`).join("")}</div>`);
 else{const row=([k,l])=>{const x=tr[k]||{ok:0,ng:0},n=x.ok+x.ng;return`<div class="cmd"><b>${l}</b><span class="n">${n?Math.round(x.ok/n*100)+"%":"–"} · ${x.ok}/${n}</span><button class="chip" data-ok="${k}" style="border:1px solid var(--line);background:#fff;border-radius:10px;padding:8px 12px">✓</button><button class="chip" data-ng="${k}" style="border:1px solid var(--line);background:#fff;border-radius:10px;padding:8px 12px">✗</button></div>`};
  DEX.openSheet(`${head}<button class="bigclk" id="bc">딸깍<br><small style="font-size:13px;font-weight:500">잘한 순간 바로!</small></button>
  <div class="pad"><button id="pr">👏<small>${rec?"내 목소리 칭찬":"'잘했어!'"}</small></button><button id="rc">🎙️<small>${rec?"다시 녹음":"칭찬 녹음"}</small></button><button id="wh">〰️<small>이리 와 휘슬</small></button></div>
  <div class="lab">명령어 연습 (오늘)</div>${CMDS.map(row).join("")}<div class="note" style="text-align:left">✓를 누르면 클리커 소리와 칭찬이 함께 나와요. 10분이 넘으면 쉬어 가기를 알려 드려요.</div>`);
  DEX.trainT0=DEX.trainT0||Date.now();
  $("bc").onpointerdown=e=>{e.preventDefault();SND.click()};$("pr").onclick=()=>SND.praise();$("wh").onclick=()=>SND.whistle(5000,1);$("rc").onclick=()=>recPraise(()=>openPad("train"));
  document.querySelectorAll("#sheetIn [data-ok],#sheetIn [data-ng]").forEach(b=>b.onclick=()=>{const k=b.dataset.ok||b.dataset.ng,a=ld(TK,{}),d=a[tday()]=a[tday()]||{},x=d[k]=d[k]||{ok:0,ng:0};if(b.dataset.ok){x.ok++;SND.click();setTimeout(SND.praise,260)}else x.ng++;sv(TK,a);
   if(Date.now()-DEX.trainT0>6e5&&!DEX.tw){DEX.tw=1;toast("10분 지났어요. 잠깐 쉬어 갈까요? 🐶")}openPad("train")})}
 document.querySelectorAll("#sheetIn [data-tb]").forEach(b=>b.onclick=()=>openPad(b.dataset.tb));
 document.querySelectorAll("#sheetIn [data-s]").forEach(b=>b.onclick=()=>SND[b.dataset.s]());
 document.querySelectorAll("#sheetIn [data-w]").forEach(b=>b.onclick=()=>{const [f,d]=b.dataset.w.split(",").map(Number);SND.whistle(f,d)});
 document.querySelectorAll("#sheetIn [data-b]").forEach(b=>b.onclick=()=>SND.bark(b.dataset.b))}
$("bPad").onclick=()=>openPad();
})();
