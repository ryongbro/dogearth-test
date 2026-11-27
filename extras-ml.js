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
.dogon .me{width:12px;height:12px;border-width:2px;opacity:.6;box-shadow:none}
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

/* ---------- 3D 강아지 (지도 안 3D 레이어) ---------- */
const map=DEX.map;let dog=null,SC=null,RND=null,CAM=null,disp=null,target=null,lastMove=0,speed=0,prevFix=null,layerOn=false;
function setDog(){if(!SC)return;if(dog)SC.remove(dog.g);dog=buildDog(prof);const B=specOf(prof);dog.base=1/Math.max(.7,B.s);SC.add(dog.g);dog.heading=0;dog.wb=null}
const dogLayer={id:"dog3d",type:"custom",renderingMode:"3d",
 onAdd(m,gl){CAM=new THREE.Camera();SC=new THREE.Scene();SC.add(new THREE.HemisphereLight(0xffffff,0x8a8070,1));const dl=new THREE.DirectionalLight(0xffffff,.7);dl.position.set(-2,6,3);SC.add(dl);
  RND=new THREE.WebGLRenderer({canvas:m.getCanvas(),context:gl,antialias:true});RND.autoClear=false;setDog()},
 render(gl,matrix){if(!dog||!disp)return;const mc=maplibregl.MercatorCoordinate.fromLngLat([disp[1],disp[0]],0);
  const z=map.getZoom(),mpp=40075016.686*Math.cos(disp[0]*Math.PI/180)/(512*Math.pow(2,z));const zs=Math.max(.55,Math.min(1,Math.pow(2,(z-17.5)*.35)));
  const sizeM=46*mpp*zs*dog.base,s=mc.meterInMercatorCoordinateUnits()*sizeM;
  const l=new THREE.Matrix4().makeTranslation(mc.x,mc.y,mc.z).scale(new THREE.Vector3(s,-s,s)).multiply(new THREE.Matrix4().makeRotationX(Math.PI/2));
  CAM.projectionMatrix=new THREE.Matrix4().fromArray(matrix).multiply(l);RND.resetState();RND.render(SC,CAM);map.triggerRepaint()}};
function addLayer(){if(layerOn||!window.THREE)return;try{map.addLayer(dogLayer);layerOn=true;document.body.classList.add("dogon")}catch(e){}}
DEX.onMapReady=addLayer;if(map.isStyleLoaded&&map.isStyleLoaded())addLayer();
DEX.onFix=(lat,lng,acc,t)=>{target=[lat,lng];if(!disp)disp=[lat,lng];addLayer();
 if(prevFix){const d=DEX.hav(prevFix,[lat,lng]),dt=Math.max(.5,(t-prevFix[2])/1000);if(d>1.2&&d/dt<8){speed=d/dt;lastMove=Date.now()}}prevFix=[lat,lng,t];
 if(!DEX.greeted){DEX.greeted=1;showGreet(lat,lng)}};
let lt=performance.now();
function loop(n){const dt=Math.min(.05,(n-lt)/1000);lt=n;if(dog&&disp&&target){const d=DEX.hav(disp,target);
  if(d>60){disp=target.slice()}else{const k=Math.min(1,dt*1.6);const nl=[disp[0]+(target[0]-disp[0])*k,disp[1]+(target[1]-disp[1])*k];
   if(d>.4){const r=Math.PI/180,y=Math.sin((nl[1]-disp[1])*r)*Math.cos(nl[0]*r),x=Math.cos(disp[0]*r)*Math.sin(nl[0]*r)-Math.sin(disp[0]*r)*Math.cos(nl[0]*r)*Math.cos((nl[1]-disp[1])*r);if(Math.hypot(x,y)>1e-12)dog.wb=Math.atan2(y,x)}disp=nl}
  DEX.disp=disp;if(dog.wb!=null){const want=Math.PI/2-dog.wb;let df=want-dog.heading;df=Math.atan2(Math.sin(df),Math.cos(df));dog.heading+=df*Math.min(1,dt*6);dog.g.rotation.y=dog.heading}
  const moving=Date.now()-lastMove<3500&&d>.25;animDog(dog,dt*(moving?Math.min(1.6,.6+speed/1.4):1),moving,n/1000);map.triggerRepaint()}
 requestAnimationFrame(loop)}
requestAnimationFrame(loop);

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
 if(!w){box.innerHTML=`<div class="greet"><button class="x2" id="gx">×</button><h3>${hi}, ${esc(prof.dog)} 보호자님</h3><p>오늘도 즐거운 산책 되세요 🐾</p></div>`;$("gx").onclick=()=>box.innerHTML="";setTimeout(()=>box.innerHTML="",7000);return}
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
let CLKBUF=null;
function clickBuf(c){if(CLKBUF&&CLKBUF.sampleRate===c.sampleRate)return CLKBUF;const sr=c.sampleRate,n=Math.floor(sr*.16),b=c.createBuffer(1,n,sr),d=b.getChannelData(0);
 const hit=(t0,amp,sc)=>{const s0=Math.floor(t0*sr);const modes=[[1850*sc,.55,.010],[3150*sc,.9,.007],[4700*sc,.6,.005],[6900*sc,.35,.0035],[9800*sc,.2,.002]];const ph=modes.map(()=>Math.random()*6.28);
  for(let i=0;s0+i<n&&i<sr*.05;i++){const t=i/sr;let v=(Math.random()*2-1)*Math.exp(-t/.0006)*1.2;modes.forEach(([f,a,tau],k)=>{v+=a*Math.sin(6.2832*f*t+ph[k])*Math.exp(-t/tau)});v+=.35*Math.sin(6.2832*210*t)*Math.exp(-t/.004);d[s0+i]+=v*amp}};
 hit(0,1,1);hit(.072,.62,.88);let m=0;for(let i=0;i<n;i++)m=Math.max(m,Math.abs(d[i]));for(let i=0;i<n;i++)d[i]/=m||1;return CLKBUF=b}
function playClick(c,vol){const s=c.createBufferSource();s.buffer=clickBuf(c);s.playbackRate.value=.97+Math.random()*.06;const hp=c.createBiquadFilter();hp.type="highpass";hp.frequency.value=500;const g=c.createGain();g.gain.value=vol;s.connect(hp).connect(g).connect(c.destination);s.start()}
const SND={click(){const c=ac();if(c)playClick(c,.95)},
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
const starMk=[];
function log(k){const f=DEX.lastFix;if(!f)return;clicks.push([+f[0].toFixed(6),+f[1].toFixed(6),Date.now(),k]);const el=document.createElement("div");el.className="star";el.textContent=k==="praise"?"💛":k==="whistle"?"🎵":"⭐";starMk.push(new maplibregl.Marker({element:el}).setLngLat([f[1],f[0]]).addTo(map));
 $("clk").animate([{transform:"scale(1)"},{transform:"scale(1.12)"},{transform:"scale(1)"}],{duration:200})}
DEX.onStart=()=>{clicks=[];starMk.splice(0).forEach(m=>m.remove());$("clk").hidden=false;SND.squeak()};
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

/* ---------- 만날 장소 · 걸어서 길안내 ---------- */
(()=>{
const $=id=>document.getElementById(id),esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const map=DEX.map,toast=m=>DEX.toast(m);
document.head.insertAdjacentHTML("beforeend",`<style>
.navc{position:fixed;left:12px;right:12px;top:calc(env(safe-area-inset-top) + 60px);z-index:610;max-width:460px;margin:0 auto;background:#fff;border:1px solid var(--line);border-radius:18px;box-shadow:0 10px 28px rgba(0,0,0,.16);overflow:hidden}
.navc .nx{display:flex;gap:12px;align-items:center;padding:12px 14px;background:#2fb36d;color:#fff}.navc .nx .ar{font-size:30px;line-height:1;width:36px;text-align:center}.navc .nx b{display:block;font-size:20px;letter-spacing:-.3px}.navc .nx span{font-size:13px;opacity:.92}
.navc .rs{display:flex;align-items:center;gap:8px;padding:9px 12px;font-size:13px;color:var(--sub)}.navc .rs b{color:var(--tx);font-size:14px}
.navc .rs button,.navc .ext a{border:1px solid var(--line);background:#fff;border-radius:10px;padding:6px 9px;font:600 12px -apple-system,system-ui,sans-serif;color:var(--tx);text-decoration:none}
.navc .ext{display:flex;gap:6px;padding:0 12px 10px}
.sres{display:flex;flex-direction:column}.sres button{text-align:left;border:0;border-bottom:1px solid var(--line);background:none;padding:11px 2px;font:15px -apple-system,system-ui,sans-serif;color:var(--tx)}.sres small{display:block;color:var(--sub);font-size:12px;margin-top:2px}
.flag{font-size:28px;filter:drop-shadow(0 2px 3px rgba(0,0,0,.35));transform:translateY(-12px)}
.pickhint{position:fixed;left:50%;top:calc(env(safe-area-inset-top) + 64px);transform:translateX(-50%);z-index:620;background:#141619;color:#fff;padding:10px 14px;border-radius:12px;font-size:13.5px}
</style>`);
$("bHist").insertAdjacentHTML("beforebegin",`<button class="ibtn" id="bGo" title="만날 장소 길안내">📍</button>`);
document.body.insertAdjacentHTML("beforeend",`<div id="navBox"></div>`);
const ready=f=>{if(map.isStyleLoaded())f();else map.once("load",f)};
ready(()=>{map.addSource("navr",{type:"geojson",data:{type:"FeatureCollection",features:[]}});map.addLayer({id:"navr-case",type:"line",source:"navr",layout:{"line-cap":"round","line-join":"round"},paint:{"line-color":"#1d7a4a","line-width":9,"line-opacity":.35}},"live");map.addLayer({id:"navr",type:"line",source:"navr",layout:{"line-cap":"round","line-join":"round"},paint:{"line-color":"#2fb36d","line-width":6}},"live")});
let N=null,flag=null,voice=true;
const here=()=>DEX.lastFix?[DEX.lastFix[0],DEX.lastFix[1]]:null;
function openGo(){const h=here();DEX.openSheet(`<h3>📍 만날 장소로 걸어가기</h3><input class="inp" id="gq" placeholder="장소 이름 (예: 성북천, 중앙공원 입구)" autocomplete="off"><div class="row" style="margin-top:8px"><button class="btn sec" id="gpick">지도에서 고르기</button><button class="btn" id="gs">검색</button></div><div class="sres" id="gr"></div>
 <div class="note" style="display:block;color:var(--sub);text-align:left;margin-top:10px">걷기 경로는 OpenStreetMap 기반 무료 경로 서버로 계산해요. 정확한 안내가 필요하면 안내 중 화면에서 네이버·카카오·애플 지도로 바로 넘길 수 있어요.</div>`);
 const go=async()=>{const q=$("gq").value.trim();if(!q)return;$("gr").innerHTML='<div class="note" style="display:block;color:var(--sub)">찾는 중…</div>';
  let u=`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=8&accept-language=ko&countrycodes=kr&q=${encodeURIComponent(q)}`;if(h){const d=.05;u+=`&viewbox=${h[1]-d},${h[0]+d},${h[1]+d},${h[0]-d}`}
  try{const r=await (await fetch(u)).json();const list=r.map(x=>({lat:+x.lat,lng:+x.lon,name:x.name||x.display_name.split(",")[0],addr:x.display_name.split(",").slice(1,4).join(",")})).sort((a,b)=>h?DEX.hav(h,[a.lat,a.lng])-DEX.hav(h,[b.lat,b.lng]):0);
   $("gr").innerHTML=list.length?list.map((x,i)=>`<button data-i="${i}">${esc(x.name)}<small>${esc(x.addr)}${h?` · ${fmtD(DEX.hav(h,[x.lat,x.lng]))}`:""}</small></button>`).join(""):'<div class="note" style="display:block;color:var(--sub)">결과가 없어요. 지도에서 직접 골라 주세요.</div>';
   $("gr").querySelectorAll("[data-i]").forEach(b=>b.onclick=()=>{const x=list[+b.dataset.i];$("sheet").classList.remove("on");startNav(x)})}catch(e){$("gr").innerHTML='<div class="note show">검색 서버에 연결하지 못했어요.</div>'}};
 $("gs").onclick=go;$("gq").onkeydown=e=>{if(e.key==="Enter")go()};setTimeout(()=>$("gq").focus(),200);
 $("gpick").onclick=()=>{$("sheet").classList.remove("on");DEX.follow=false;document.body.insertAdjacentHTML("beforeend",'<div class="pickhint" id="ph">만날 장소를 지도에서 눌러 주세요</div>');map.once("click",e=>{$("ph")&&$("ph").remove();startNav({lat:e.lngLat.lat,lng:e.lngLat.lng,name:"고른 장소"})})}}
$("bGo").onclick=()=>N?stopNav(true):openGo();
const fmtD=m=>m>=1000?(m/1000).toFixed(1)+"km":Math.round(m/10)*10+"m";
const ARW={left:"⬅️","slight left":"↖️","sharp left":"↩️",right:"➡️","slight right":"↗️","sharp right":"↪️",straight:"⬆️",uturn:"🔄"};
function instr(s){const m=s.maneuver,mod=m.modifier||"straight",dir={left:"왼쪽으로",right:"오른쪽으로","slight left":"왼쪽 방향으로","slight right":"오른쪽 방향으로","sharp left":"왼쪽으로 크게","sharp right":"오른쪽으로 크게",straight:"직진",uturn:"유턴"}[mod]||"직진";
 const nm=s.name?`${s.name} 쪽 `:"";if(m.type==="arrive")return["🚩","목적지 도착"];if(m.type==="depart")return["⬆️",`${nm}출발`];if(m.type==="roundabout"||m.type==="rotary")return["🔄","회전 교차로 진입"];
 return[ARW[mod]||"⬆️",mod==="straight"?`${nm}직진`:`${nm}${dir} 도세요`.replace("직진 도세요","직진")]}
async function route(from,to){const u=`https://routing.openstreetmap.de/routed-foot/route/v1/foot/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson&steps=true`;const r=await (await fetch(u)).json();if(!r.routes||!r.routes[0])throw 0;return r.routes[0]}
async function startNav(dest){const h=here();if(!h){toast("현재 위치를 아직 못 찾았어요");return}
 if(flag)flag.remove();const el=document.createElement("div");el.className="flag";el.textContent="🚩";flag=new maplibregl.Marker({element:el,anchor:"bottom"}).setLngLat([dest.lng,dest.lat]).addTo(map);
 N={dest,steps:[],line:[],said:{},rerouteAt:0};toast("걷기 경로를 찾는 중…");await reroute(true);try{DEX.setNav&&DEX.setNav("head",false)}catch(e){}}
async function reroute(first){if(!N)return;const h=here();N.rerouteAt=Date.now();try{const r=await route(h,[N.dest.lat,N.dest.lng]);N.line=r.geometry.coordinates.map(c=>[c[1],c[0]]);N.steps=r.legs[0].steps;N.total=r.distance;N.said={};
  map.getSource("navr")&&map.getSource("navr").setData({type:"FeatureCollection",features:[{type:"Feature",geometry:r.geometry,properties:{}}]});
  if(first){const pts=N.line;let a=[1e9,1e9],b=[-1e9,-1e9];pts.forEach(p=>{a[0]=Math.min(a[0],p[0]);a[1]=Math.min(a[1],p[1]);b[0]=Math.max(b[0],p[0]);b[1]=Math.max(b[1],p[1])});DEX.follow=false;map.fitBounds([[a[1],a[0]],[b[1],b[0]]],{padding:{top:220,bottom:200,left:50,right:60},bearing:0,pitch:30,duration:800});setTimeout(()=>{if(N)DEX.follow=true},2600)}
  else toast("경로를 다시 찾았어요");update()}catch(e){toast("경로 서버에 연결하지 못했어요. 지도 앱으로 안내받아 주세요.");update(true)}}
function nearestIdx(p){let bi=0,bd=1e9;N.line.forEach((q,i)=>{const d=DEX.hav(p,q);if(d<bd){bd=d;bi=i}});return[bi,bd]}
function update(noRoute){if(!N)return;const h=here();if(!h)return;let remain=DEX.hav(h,[N.dest.lat,N.dest.lng]),nextS=null,toNext=0,off=0;
 if(N.line.length>1&&!noRoute){const [i,d]=nearestIdx(h);off=d;remain=d;for(let k=i;k<N.line.length-1;k++)remain+=DEX.hav(N.line[k],N.line[k+1]);
  for(const s of N.steps){const loc=[s.maneuver.location[1],s.maneuver.location[0]];const [si]=nearestIdx(loc);if(si>i||(s.maneuver.type==="arrive")){nextS=s;toNext=DEX.hav(h,loc);break}}
  if(off>35&&Date.now()-N.rerouteAt>15000){reroute(false);return}}
 const dst=DEX.hav(h,[N.dest.lat,N.dest.lng]);if(dst<20){arrive();return}
 const [ar,tx]=nextS?instr(nextS):["🚩","목적지 방향으로"];const mins=Math.max(1,Math.round(remain/1.25/60));
 if(nextS&&toNext<25&&!N.said[nextS.maneuver.location.join()]&&voice){N.said[nextS.maneuver.location.join()]=1;say(`${tx}`)}
 $("navBox").innerHTML=`<div class="navc"><div class="nx"><div class="ar">${ar}</div><div style="flex:1"><b>${nextS?fmtD(toNext)+" 앞":""} ${esc(tx)}</b><span>🚩 ${esc(N.dest.name)}</span></div></div>
 <div class="rs"><span style="flex:1">남은 거리 <b>${fmtD(remain)}</b> · 걸어서 약 <b>${mins}분</b>${noRoute?" (직선)":""}</span><button id="nv">${voice?"🔊":"🔇"}</button><button id="nx">종료</button></div>
 <div class="ext"><a href="#" id="xN">네이버지도</a><a href="#" id="xK">카카오맵</a><a href="https://maps.apple.com/?daddr=${N.dest.lat},${N.dest.lng}&dirflg=w" target="_blank" rel="noopener">애플 지도</a></div></div>`;
 $("nx").onclick=()=>stopNav(true);$("nv").onclick=()=>{voice=!voice;update()};
 const nm=encodeURIComponent(N.dest.name);$("xN").onclick=e=>{e.preventDefault();openApp(`nmap://route/walk?dlat=${N.dest.lat}&dlng=${N.dest.lng}&dname=${nm}&appname=io.github.ryongbro.dogearth`,`https://map.naver.com/p/search/${nm}`)};
 $("xK").onclick=e=>{e.preventDefault();openApp(`kakaomap://route?ep=${N.dest.lat},${N.dest.lng}&by=FOOT`,`https://map.kakao.com/link/to/${nm},${N.dest.lat},${N.dest.lng}`)}}
function openApp(scheme,web){const t=Date.now();location.href=scheme;setTimeout(()=>{if(Date.now()-t<2200&&document.visibilityState==="visible")window.open(web,"_blank")},1500)}
function say(t){try{const u=new SpeechSynthesisUtterance(t);u.lang="ko-KR";speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){}}
function arrive(){const n=N.dest.name;stopNav(false);toast(`🚩 ${n}에 도착했어요`);say("목적지에 도착했어요");try{navigator.vibrate&&navigator.vibrate([60,60,60])}catch(e){}}
DEX.startNav=d=>startNav(d);
function stopNav(msg){N=null;$("navBox").innerHTML="";if(flag){flag.remove();flag=null}map.getSource("navr")&&map.getSource("navr").setData({type:"FeatureCollection",features:[]});if(msg)toast("길안내를 종료했어요")}
const _fix=DEX.onFix;DEX.onFix=(a,b,c,d)=>{_fix&&_fix(a,b,c,d);if(N)update()};
})();

/* ---------- 녹지 강조 · 반려견 장소 표시 ---------- */
(()=>{
const $=id=>document.getElementById(id),esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const map=DEX.map,toast=m=>DEX.toast(m),ld=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},sv=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
// 1) 녹지 더 잘 보이게
const ready=f=>{if(map.isStyleLoaded())f();else map.once("load",f)};
ready(()=>{const P=(id,k,v)=>{try{if(map.getLayer(id))map.setPaintProperty(id,k,v)}catch(e){}};
 P("park","fill-color","#bfe3a6");P("park","fill-opacity",.85);P("park","fill-outline-color","#6dbb5a");
 P("park_outline","line-color","#7cc46a");P("park_outline","line-width",1.6);P("park_outline","line-dasharray",[1,0]);
 P("landcover_grass","fill-color","#bfe3a6");P("landcover_grass","fill-opacity",.75);
 P("landcover_wood","fill-color","#a5d68e");P("landcover_wood","fill-opacity",.7);
 P("landuse_pitch","fill-color","#cfe7b8");P("landuse_cemetery","fill-color","#cfe2bd");
 // 반려견 놀이터 면적 강조용
 map.addSource("dogarea",{type:"geojson",data:{type:"FeatureCollection",features:[]}});
 map.addLayer({id:"dogarea",type:"fill",source:"dogarea",paint:{"fill-color":"#6cc24a","fill-opacity":.45,"fill-outline-color":"#3f9a2b"}},"building-3d")});
// 2) 반려견 장소
const CAT={dogpark:{n:"반려견 놀이터",i:"🐕",c:"#3f9a2b",q:'nwr["leisure"="dog_park"]'},
 vet:{n:"동물병원",i:"🏥",c:"#e5484d",q:'nwr["amenity"="veterinary"]'},
 pet:{n:"펫샵·간식",i:"🦴",c:"#E0782A",q:'nwr["shop"="pet"]'},
 groom:{n:"미용",i:"✂️",c:"#8e6cc9",q:'nwr["shop"="pet_grooming"]'},
 hotel:{n:"호텔·유치원",i:"🏠",c:"#2D55E8",q:'nwr["amenity"="animal_boarding"]'},
 cafe:{n:"동반 카페",i:"☕",c:"#8a5a33",q:'nwr["amenity"~"cafe|restaurant"]["dog"~"yes|leashed|outside"]'},
 shelter:{n:"보호소",i:"💛",c:"#c99a14",q:'nwr["amenity"="animal_shelter"]'}};
let on=ld("de.pois",Object.fromEntries(Object.keys(CAT).map(k=>[k,true]))),show=ld("de.poiShow",true),pois=[],mks=[],lastQ=null,loading=false;
document.head.insertAdjacentHTML("beforeend",`<style>
.pm{display:flex;align-items:center;gap:4px;padding:3px 8px 3px 4px;border-radius:999px;background:#fff;border:2px solid var(--c);box-shadow:0 2px 6px rgba(0,0,0,.18);font:600 11.5px -apple-system,system-ui,sans-serif;color:#141619;white-space:nowrap;max-width:140px;cursor:pointer}
.pm i{font-style:normal;width:20px;height:20px;border-radius:50%;background:var(--c);display:grid;place-items:center;font-size:12px}.pm span{overflow:hidden;text-overflow:ellipsis}
.pm.sm span{display:none}.pm.sm{padding:3px}
.poibar{position:fixed;left:12px;top:calc(env(safe-area-inset-top) + 92px);z-index:520;display:flex;flex-direction:column;gap:6px}
.poibar button{border:1px solid var(--line);background:rgba(255,255,255,.95);border-radius:12px;padding:7px 10px;font:600 12.5px -apple-system,system-ui,sans-serif;color:var(--tx);box-shadow:0 2px 8px rgba(0,0,0,.08)}
.poibar button.on{background:#2fb36d;color:#fff;border-color:#2fb36d}
</style>`);
document.body.insertAdjacentHTML("beforeend",`<div class="poibar"><button id="poiT" class="${show?"on":""}">🐾 반려견 장소</button></div>`);
$("poiT").onclick=()=>{if(!show){show=true;sv("de.poiShow",true);$("poiT").classList.add("on");fetchPois(true)}else openFilter()};
function openFilter(){DEX.openSheet(`<h3>🐾 반려견 장소</h3><div class="chips" style="display:flex;flex-wrap:wrap;gap:6px">${Object.entries(CAT).map(([k,c])=>`<button data-c="${k}" style="border:2px solid ${c.c};border-radius:999px;padding:8px 12px;background:${on[k]?c.c:"#fff"};color:${on[k]?"#fff":"#141619"};font:600 13px -apple-system,system-ui,sans-serif">${c.i} ${c.n} ${pois.filter(p=>p.k===k).length||""}</button>`).join("")}</div>
 <div class="row"><button class="btn sec" id="poff">지도에서 숨기기</button><button class="btn" id="pre">이 주변 다시 찾기</button></div>
 <div class="note" style="display:block;color:var(--sub);text-align:left">OpenStreetMap에 등록된 장소만 보여요. 국내는 빠진 곳이 많아, 정식 앱에서는 네이버·카카오 장소 검색과 이용자 제보로 채울 예정이에요.</div>`);
 document.querySelectorAll("#sheetIn [data-c]").forEach(b=>b.onclick=()=>{on[b.dataset.c]=!on[b.dataset.c];sv("de.pois",on);draw();openFilter()});
 $("poff").onclick=()=>{show=false;sv("de.poiShow",false);$("poiT").classList.remove("on");draw();$("sheet").classList.remove("on")};
 $("pre").onclick=()=>{$("sheet").classList.remove("on");fetchPois(true)}}
const EPS=["https://overpass-api.de/api/interpreter","https://overpass.kumi.systems/api/interpreter"];
async function fetchPois(force){if(!show||loading)return;const c=map.getCenter(),ctr=[c.lat,c.lng];if(!force&&lastQ&&DEX.hav(lastQ,ctr)<700)return;if(map.getZoom()<13.5&&!force)return;
 loading=true;lastQ=ctr;const d=.016,bb=`${(ctr[0]-d).toFixed(4)},${(ctr[1]-d*1.25).toFixed(4)},${(ctr[0]+d).toFixed(4)},${(ctr[1]+d*1.25).toFixed(4)}`;
 const q=`[out:json][timeout:20];(${Object.values(CAT).map(x=>x.q+`(${bb});`).join("")});out center tags geom(${bb});`;
 if(force)toast("주변 반려견 장소를 찾는 중…");
 for(const ep of EPS){try{const r=await fetch(ep,{method:"POST",body:"data="+encodeURIComponent(q),headers:{"Content-Type":"application/x-www-form-urlencoded"}});if(!r.ok)continue;const j=await r.json();
   const seen=new Set(pois.map(p=>p.id));const areas=[];
   j.elements.forEach(e=>{const t=e.tags||{};const k=t.leisure==="dog_park"?"dogpark":t.amenity==="veterinary"?"vet":t.shop==="pet"?"pet":t.shop==="pet_grooming"?"groom":t.amenity==="animal_boarding"?"hotel":t.amenity==="animal_shelter"?"shelter":"cafe";
    const lat=e.lat??e.center?.lat,lng=e.lon??e.center?.lon;if(lat==null)return;
    if(k==="dogpark"&&e.geometry&&e.geometry.length>2)areas.push({type:"Feature",geometry:{type:"Polygon",coordinates:[e.geometry.map(g=>[g.lon,g.lat])]},properties:{}});
    const id=e.type+e.id;if(seen.has(id))return;seen.add(id);pois.push({id,k,lat,lng,name:t["name:ko"]||t.name||CAT[k].n,hours:t.opening_hours||"",phone:t.phone||t["contact:phone"]||"",web:t.website||t["contact:website"]||""})});
   if(areas.length&&map.getSource("dogarea"))map.getSource("dogarea").setData({type:"FeatureCollection",features:areas});
   draw();if(force)toast(pois.length?`반려견 장소 ${pois.length}곳을 찾았어요`:"근처에 등록된 반려견 장소가 없어요");loading=false;return}catch(e){}}
 loading=false;if(force)toast("장소 서버에 연결하지 못했어요")}
function draw(){mks.splice(0).forEach(m=>m.remove());if(!show)return;const z=map.getZoom();
 pois.filter(p=>on[p.k]).slice(0,120).forEach(p=>{const c=CAT[p.k],el=document.createElement("div");el.className="pm"+(z<16.5?" sm":"");el.style.setProperty("--c",c.c);el.innerHTML=`<i>${c.i}</i><span>${esc(p.name)}</span>`;
  el.onclick=e=>{e.stopPropagation();openPoi(p)};mks.push(new maplibregl.Marker({element:el,anchor:"left",offset:[-12,0]}).setLngLat([p.lng,p.lat]).addTo(map))})}
function openPoi(p){const c=CAT[p.k],h=DEX.lastFix,dist=h?DEX.hav(h,[p.lat,p.lng]):null,nm=encodeURIComponent(p.name);
 DEX.openSheet(`<h3>${c.i} ${esc(p.name)}</h3><div class="note" style="display:block;color:var(--sub);text-align:left;margin:-6px 0 10px">${c.n}${dist!=null?` · ${dist>=1000?(dist/1000).toFixed(1)+"km":Math.round(dist)+"m"}`:""}</div>
 ${p.hours?`<div style="margin:6px 0">🕒 ${esc(p.hours)}</div>`:""}${p.phone?`<div style="margin:6px 0">📞 <a href="tel:${esc(p.phone.replace(/[^0-9+]/g,""))}">${esc(p.phone)}</a></div>`:""}
 <div class="row"><button class="btn" id="pgo">여기로 길안내</button><a class="btn sec" style="display:grid;place-items:center;text-decoration:none" href="https://map.naver.com/p/search/${nm}" target="_blank" rel="noopener">네이버에서 보기</a></div>`);
 $("pgo").onclick=()=>{$("sheet").classList.remove("on");DEX.startNav&&DEX.startNav({lat:p.lat,lng:p.lng,name:p.name})}}
let mt=0;map.on("moveend",()=>{clearTimeout(mt);mt=setTimeout(()=>fetchPois(false),800)});map.on("zoomend",draw);
ready(()=>setTimeout(()=>fetchPois(false),1500));
DEX.poiTest=(list)=>{pois=list;draw()};
})();
if(DEX.lastFix){const f=DEX.lastFix;DEX.onFix(f[0],f[1],10,f[2])}
