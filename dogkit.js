const DS=1;
const shadowGeo=new THREE.CircleGeometry(1,24);
const shadowMat=new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.16,depthWrite:false});
const BREEDS={
 husky:{n:["시베리안 허스키","Siberian Husky","シベリアン・ハスキー"],sz:"L",s:{s:1,len:1.05,leg:.46,bh:.44,w:.42,hs:.42,sn:.24,ear:"up",er:1,tail:"sickle",tr:.085,c:["#5c6168","#f3f2ee"],mask:"husky",ruff:.85,eye:"#5e8fbf",lr:.07}},
 maltese:{n:["말티즈","Maltese","マルチーズ"],sz:"S",s:{s:.55,len:.9,leg:.3,bh:.48,w:.46,hs:.5,sn:.16,ear:"flop",er:1.25,tail:"curl",tr:.09,c:["#f7f5f0"],fluff:1,lr:.08}},
 poodle:{n:["푸들","Poodle","プードル"],sz:"S",s:{s:.6,len:.85,leg:.42,bh:.42,w:.4,hs:.44,sn:.22,ear:"flop",er:1,tail:"up",tr:.07,c:["#c98a55"],fluff:1,top:1,lr:.075}},
 pom:{n:["포메라니안","Pomeranian","ポメラニアン"],sz:"S",s:{s:.5,len:.8,leg:.28,bh:.52,w:.5,hs:.48,sn:.13,ear:"up",er:.6,tail:"curl",tr:.11,c:["#d9883a","#efc58f"],fluff:2,ruff:1.3,lr:.07}},
 shiba:{n:["시바견","Shiba Inu","柴犬"],sz:"M",s:{s:.78,len:1,leg:.42,bh:.42,w:.4,hs:.44,sn:.2,ear:"up",er:.85,tail:"curl",tr:.075,c:["#c9733a","#f3e6d2"],mask:"cheek",socks:1,lr:.07}},
 jindo:{n:["진돗개","Jindo","珍島犬"],sz:"M",s:{s:.88,len:1.02,leg:.46,bh:.42,w:.4,hs:.43,sn:.22,ear:"up",er:.9,tail:"curl",tr:.08,c:["#ebe2d0","#f8f5ee"],mask:"cheek",lr:.072}},
 corgi:{n:["웰시코기","Welsh Corgi","ウェルシュ・コーギー"],sz:"M",s:{s:.8,len:1.15,leg:.2,bh:.44,w:.46,hs:.44,sn:.22,ear:"up",er:1.15,tail:"stub",c:["#cf7b3b","#f5f2eb"],mask:"blaze",lr:.085}},
 golden:{n:["골든 리트리버","Golden Retriever","ゴールデン・レトリーバー"],sz:"L",s:{s:1.08,len:1.08,leg:.48,bh:.46,w:.44,hs:.42,sn:.27,ear:"flop",er:1,tail:"plume",tr:.08,c:["#d7a05c"],lr:.078}},
 bichon:{n:["비숑 프리제","Bichon Frise","ビション・フリーゼ"],sz:"S",s:{s:.58,len:.88,leg:.34,bh:.46,w:.46,hs:.56,sn:.14,ear:"flop",er:.8,tail:"curl",tr:.1,c:["#f8f7f3"],fluff:2,lr:.085}},
 chihuahua:{n:["치와와","Chihuahua","チワワ"],sz:"S",s:{s:.42,len:.85,leg:.36,bh:.38,w:.36,hs:.52,sn:.13,ear:"up",er:1.45,tail:"up",tr:.05,c:["#d4a776"],lr:.05}},
 dachs:{n:["닥스훈트","Dachshund","ダックスフンド"],sz:"S",s:{s:.7,len:1.35,leg:.17,bh:.36,w:.34,hs:.38,sn:.3,ear:"flop",er:1.1,tail:"down",tr:.06,c:["#7a4a2b"],lr:.065}},
 lab:{n:["래브라도 리트리버","Labrador Retriever","ラブラドール・レトリーバー"],sz:"L",s:{s:1.06,len:1.06,leg:.48,bh:.46,w:.45,hs:.42,sn:.26,ear:"flop",er:.85,tail:"down",tr:.08,c:["#2c2b2a"],lr:.08}},
 gsd:{n:["저먼 셰퍼드","German Shepherd","ジャーマン・シェパード"],sz:"L",s:{s:1.12,len:1.12,leg:.5,bh:.44,w:.42,hs:.42,sn:.3,ear:"up",er:1.15,tail:"plume",tr:.085,c:["#b98249","#c99a62","#26221f"],muzzle:"#2a2522",lr:.075}},
 beagle:{n:["비글","Beagle","ビーグル"],sz:"M",s:{s:.72,len:1,leg:.36,bh:.42,w:.4,hs:.44,sn:.24,ear:"flop",er:1.2,tail:"up",tr:.06,tipU:1,c:["#b9773d","#f5f2eb","#2a2623"],mask:"blaze",legc:"#f5f2eb",lr:.07}},
 frenchie:{n:["프렌치 불도그","French Bulldog","フレンチ・ブルドッグ"],sz:"S",s:{s:.66,len:.9,leg:.3,bh:.48,w:.52,hs:.54,sn:.08,ear:"bat",er:1,tail:"stub",c:["#d8c3a2"],lr:.095}},
 mix:{n:["믹스견","Mixed breed","ミックス"],sz:"M",s:{s:.8,len:1,leg:.4,bh:.42,w:.4,hs:.44,sn:.22,ear:"flop",er:.9,tail:"up",tr:.065,c:["#9a6a43","#f0e7d9"],mask:"cheek",lr:.072}}
};
const STRIDE={husky:.85,maltese:.3,poodle:.36,pom:.26,shiba:.6,jindo:.72,corgi:.42,golden:.9,bichon:.33,chihuahua:.22,dachs:.32,lab:.9,gsd:.95,beagle:.56,frenchie:.38,mix:.6};
/* ---------- smooth dog builder (SDF + surface nets) ---------- */
const DOGCACHE={},sphSmooth=new THREE.SphereGeometry(1,18,14);
const sm=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
const smin=(a,b,k)=>{const h=Math.max(k-Math.abs(a-b),0)/k;return Math.min(a,b)-h*h*k*.25};
function fEll(c,r){return(x,y,z)=>{const a=(x-c[0])/r[0],b=(y-c[1])/r[1],d=(z-c[2])/r[2],k0=Math.sqrt(a*a+b*b+d*d),k1=Math.sqrt(a*a/(r[0]*r[0])+b*b/(r[1]*r[1])+d*d/(r[2]*r[2]));return k1<1e-6?-Math.min(r[0],r[1],r[2]):k0*(k0-1)/k1}}
function fCap(a,b,ra,rb){const bx=b[0]-a[0],by=b[1]-a[1],bz=b[2]-a[2],bb=bx*bx+by*by+bz*bz;return(x,y,z)=>{const px=x-a[0],py=y-a[1],pz=z-a[2];const h=Math.max(0,Math.min(1,(px*bx+py*by+pz*bz)/bb));const dx=px-bx*h,dy=py-by*h,dz=pz-bz*h;return Math.sqrt(dx*dx+dy*dy+dz*dz)-(ra+(rb-ra)*h)}}
function compose(parts,noise){return(x,y,z)=>{let d=parts[0][0](x,y,z);for(let i=1;i<parts.length;i++)d=smin(d,parts[i][0](x,y,z),parts[i][1]);if(noise)d+=Math.sin(x*46+1.3)*Math.sin(y*41+.7)*Math.sin(z*44+2.1)*noise;return d}}
function grad(f,x,y,z,e){const gx=f(x+e,y,z)-f(x-e,y,z),gy=f(x,y+e,z)-f(x,y-e,z),gz=f(x,y,z+e)-f(x,y,z-e),l=Math.hypot(gx,gy,gz)||1;return[gx/l,gy/l,gz/l]}
function nets(f,b0,b1,h,colorAt){
 const nx=Math.ceil((b1[0]-b0[0])/h),ny=Math.ceil((b1[1]-b0[1])/h),nz=Math.ceil((b1[2]-b0[2])/h),gx=nx+1,gy=ny+1,gz=nz+1;
 const G=new Float32Array(gx*gy*gz);for(let k=0;k<gz;k++)for(let j=0;j<gy;j++)for(let i=0;i<gx;i++)G[(k*gy+j)*gx+i]=f(b0[0]+i*h,b0[1]+j*h,b0[2]+k*h);
 const g=(i,j,k)=>G[(k*gy+j)*gx+i],cell=new Int32Array(nx*ny*nz).fill(-1),P=[];
 const E=[[0,1],[0,2],[0,4],[1,3],[1,5],[2,3],[2,6],[3,7],[4,5],[4,6],[5,7],[6,7]],v=new Float32Array(8);
 for(let k=0;k<nz;k++)for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){let m=0;for(let c=0;c<8;c++){v[c]=g(i+(c&1),j+(c>>1&1),k+(c>>2&1));if(v[c]<0)m|=1<<c}if(m===0||m===255)continue;
  let sx=0,sy=0,sz=0,n=0;for(const [a,b] of E){if((v[a]<0)===(v[b]<0))continue;const t=v[a]/(v[a]-v[b]);sx+=(a&1)+((b&1)-(a&1))*t;sy+=(a>>1&1)+((b>>1&1)-(a>>1&1))*t;sz+=(a>>2&1)+((b>>2&1)-(a>>2&1))*t;n++}
  cell[(k*ny+j)*nx+i]=P.length/3;P.push(b0[0]+(i+sx/n)*h,b0[1]+(j+sy/n)*h,b0[2]+(k+sz/n)*h)}
 const C=(i,j,k)=>cell[(k*ny+j)*nx+i],I=[];const quad=(a,b,c,d)=>{if(a<0||b<0||c<0||d<0)return;I.push(a,b,c,a,c,d)};
 for(let k=0;k<gz;k++)for(let j=0;j<gy;j++)for(let i=0;i<gx;i++){const va=g(i,j,k)<0;
  if(i<nx&&j>0&&k>0&&j<ny&&k<nz&&va!==(g(i+1,j,k)<0))quad(C(i,j-1,k-1),C(i,j,k-1),C(i,j,k),C(i,j-1,k));
  if(j<ny&&i>0&&k>0&&i<nx&&k<nz&&va!==(g(i,j+1,k)<0))quad(C(i-1,j,k-1),C(i,j,k-1),C(i,j,k),C(i-1,j,k));
  if(k<nz&&i>0&&j>0&&i<nx&&j<ny&&va!==(g(i,j,k+1)<0))quad(C(i-1,j-1,k),C(i,j-1,k),C(i,j,k),C(i-1,j,k))}
 const nv=P.length/3,N=new Float32Array(nv*3),col=new Float32Array(nv*3),pos=new Float32Array(P);
 for(let q=0;q<nv;q++){let x=pos[q*3],y=pos[q*3+1],z=pos[q*3+2];for(let s=0;s<2;s++){const d=f(x,y,z),gr=grad(f,x,y,z,h*.5);x-=gr[0]*d;y-=gr[1]*d;z-=gr[2]*d}
  const gr=grad(f,x,y,z,h*.5);pos[q*3]=x;pos[q*3+1]=y;pos[q*3+2]=z;N.set(gr,q*3);col.set(colorAt(x,y,z),q*3)}
 for(let t=0;t<I.length;t+=3){const a=I[t]*3,b=I[t+1]*3,c=I[t+2]*3;const ux=pos[b]-pos[a],uy=pos[b+1]-pos[a+1],uz=pos[b+2]-pos[a+2],wx=pos[c]-pos[a],wy=pos[c+1]-pos[a+1],wz=pos[c+2]-pos[a+2];
  const fx=uy*wz-uz*wy,fy=uz*wx-ux*wz,fz=ux*wy-uy*wx;if(fx*(N[a]+N[b]+N[c])+fy*(N[a+1]+N[b+1]+N[c+1])+fz*(N[a+2]+N[b+2]+N[c+2])<0){const tmp=I[t+1];I[t+1]=I[t+2];I[t+2]=tmp}}
 const geo=new THREE.BufferGeometry();geo.setAttribute("position",new THREE.BufferAttribute(pos,3));geo.setAttribute("normal",new THREE.BufferAttribute(N,3));geo.setAttribute("color",new THREE.BufferAttribute(col,3));geo.setIndex(I);return geo}
const rgb=h=>{const c=new THREE.Color(h);return[c.r,c.g,c.b]};
const lum3=c=>c[0]*.299+c[1]*.587+c[2]*.114;const mix3=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
const LOOKDEF={ear:"auto",eye:"",nose:"",mask:"auto",spots:0,socks:"auto",tip:"auto",tail:"auto",collar:"",harness:"",bandana:"",hat:""};
function lookOf(p){const l=Object.assign({},LOOKDEF,(p&&typeof p.look==="object"&&p.look)||{});for(const k in LOOKDEF)if(typeof l[k]!==typeof LOOKDEF[k])l[k]=LOOKDEF[k];["eye","nose","collar","harness","bandana"].forEach(k=>{if(l[k]&&!/^#[0-9a-f]{6}$/i.test(l[k]))l[k]=""});return l}
function specOf(p){const B0=(BREEDS[p.breed]||BREEDS.mix).s,L=lookOf(p),B={...B0};
 if(L.ear!=="auto"&&["up","flop","half","bat"].includes(L.ear)){B.ear=L.ear;if(!B0.er||B0.ear!==L.ear)B.er=L.ear==="up"?1:L.ear==="bat"?1:1}
 if(L.mask!=="auto")B.mask=L.mask==="none"?null:L.mask;
 if(L.socks!=="auto")B.socks=L.socks==="on"?1:0;
 if(L.tip!=="auto")B.tipU=L.tip==="on"?1:0;
 if(L.tail!=="auto")B.tail=L.tail;
 if(L.eye)B.eye=L.eye;
 B.spots=L.spots?1:0;B.forceU=(L.mask!=="auto"&&L.mask!=="none")||L.socks==="on"||L.tip==="on";return B}
const geoKey=p=>{const L=lookOf(p);return[p.breed,p.coat||"",L.ear,L.mask,L.spots,L.socks,L.tip,L.tail].join("|")};
function dogModel(p){const B=specOf(p),key=geoKey(p);if(DOGCACHE[key])return DOGCACHE[key];
 const Ln=B.len,H=B.leg,bh=B.bh,W=B.w,hs=B.hs,sn=B.sn,er=B.er,by=H+bh*.5,fl=B.fluff||0;
 const top=rgb(p.coat||B.c[0]),under=rgb(B.c[1]||(B.forceU?"#f3efe8":(p.coat||B.c[0]))),sad=B.c[2]?rgb(B.c[2]):null,hasU=(!!B.c[1]&&!p.coat)||B.forceU;
 const hc=[Ln*.5+hs*.12,by+bh*.5+hs*.28,0],tipX=hc[0]+hs*.42+sn,snY=hc[1]-hs*.16;
 const parts=[[fEll([0,by,0],[Ln*.5,bh*.5,W*.5]),0],[fEll([Ln*.26,by-bh*.02,0],[Ln*.24,bh*.56,W*.48]),.12],[fEll([-Ln*.28,by+bh*.02,0],[Ln*.24,bh*.5,W*.48]),.12],
  [fCap([Ln*.3,by+bh*.12,0],[hc[0]-hs*.1,hc[1]-hs*.12,0],bh*.34,hs*.34),.12],[fEll(hc,[hs*.52,hs*.46,hs*.45]),.08],
  [fCap([hc[0]+hs*.15,snY+hs*.02,0],[tipX,snY-hs*.02,0],hs*.27,hs*.19*(B.ear==="bat"?1.25:1)),.07]];
 [1,-1].forEach(s=>{parts.push([fEll([-Ln*.3,H+bh*.28,s*W*.22],[Ln*.17,bh*.42,W*.2]),.08]);parts.push([fEll([Ln*.29,H+bh*.3,s*W*.2],[Ln*.11,bh*.36,W*.16]),.08]);
  if(B.ear==="up"||B.ear==="bat"){const bx=hc[0]-hs*.12,byy=hc[1]+hs*.26,bz=s*hs*.24;parts.push([fCap([bx,byy,bz],[bx-hs*.04,byy+hs*.5*er,bz+s*hs*.12],hs*(B.ear==="bat"?.2:.15)*Math.sqrt(er),hs*(B.ear==="bat"?.1:.025)),.05])}
  else if(B.ear==="half"){const bx=hc[0]-hs*.1,byy=hc[1]+hs*.26,bz=s*hs*.26;parts.push([fCap([bx,byy,bz],[bx+hs*.02,byy+hs*.26,bz+s*hs*.1],hs*.15,hs*.1),.05]);parts.push([fCap([bx+hs*.02,byy+hs*.26,bz+s*hs*.1],[bx+hs*.2,byy+hs*.16,bz+s*hs*.14],hs*.1,hs*.05),.03])}
  else{parts.push([fCap([hc[0]-hs*.06,hc[1]+hs*.22,s*hs*.36],[hc[0]+hs*.02,hc[1]-hs*.32*er,s*hs*.52],hs*.13,hs*(fl?.2:.15)),.05])}});
 if(B.ruff)parts.push([fEll([Ln*.34,by+bh*.25,0],[Ln*.2,bh*.62*B.ruff,W*.6*B.ruff]),.15]);
 if(fl>1)parts.push([fEll([hc[0]-hs*.05,hc[1]+hs*.05,0],[hs*.68,hs*.62,hs*.62]),.12]);
 if(B.top)parts.push([fEll([hc[0]-hs*.05,hc[1]+hs*.38,0],[hs*.35,hs*.3,hs*.3]),.1]);
 if(B.tail==="stub")parts.push([fEll([-Ln*.5,by+bh*.18,0],[.07,.06,.06]),.06]);
 const f=compose(parts,fl?.0045+.0015*fl:0);
 const colorAt=(x,y,z)=>{let c=top;if(hasU){let w=0;
   const belly=sm(by+bh*.02,by-bh*.3,y)*sm(-Ln*.55,-Ln*.3,x);w=Math.max(w,belly);
   const chest=sm(Ln*.12,Ln*.32,x)*sm(by+bh*.38,by+bh*.12,y)*sm(W*.38,W*.12,Math.abs(z));w=Math.max(w,chest);
   if(B.mask){const face=sm(hc[0]-hs*.35,hc[0]-hs*.05,x)*sm(hc[1]+hs*(B.mask==="husky"?.22:.02),hc[1]-hs*.12,y);let fw=face;if(B.mask==="husky")fw=Math.max(face*(1-sm(hs*.18,hs*.06,Math.abs(z))*sm(hc[1]-hs*.05,hc[1]+hs*.1,y)),sm(hc[0]+hs*.15,hc[0]+hs*.3,x)*sm(hc[1]+hs*.18,hc[1]+hs*.08,y));
    if(B.mask==="blaze")fw=Math.max(sm(hc[0]+hs*.2,hc[0]+hs*.35,x)*1,sm(hs*.12,hs*.04,Math.abs(z))*sm(hc[0]-hs*.1,hc[0]+hs*.2,x)*sm(hc[1]+hs*.5,hc[1]+hs*.2,y));w=Math.max(w,fw)}
   if(B.mask==="husky"&&y>hc[1]+hs*.2&&Math.abs(z)>hs*.15&&x<hc[0])w*=.2;
   c=mix3(top,under,Math.min(1,w))}
  if(sad){const s=sm(by+bh*.02,by+bh*.22,y)*sm(-Ln*.5,-Ln*.35,x)*sm(Ln*.32,Ln*.18,x);c=mix3(c,sad,s*.95)}
  if(B.muzzle){const m=sm(hc[0]+hs*.1,hc[0]+hs*.35,x)*sm(hc[1]+hs*.1,hc[1]-hs*.05,y);c=mix3(c,rgb(B.muzzle),m*.85)}
  if(B.spots&&y>by-bh*.35&&x<hc[0]-hs*.2){const q=9,ix=Math.floor(x*q),iy=Math.floor(y*q),iz=Math.floor(z*q);let sp=0;for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)for(let e=-1;e<=1;e++){const hx=ix+a,hy=iy+b,hz=iz+e,hh=Math.abs(Math.sin(hx*127.1+hy*311.7+hz*74.7)*43758.5453)%1;if(hh<.55)continue;const cx=(hx+.5)/q,cy=(hy+.5)/q,cz=(hz+.5)/q,dd=Math.hypot(x-cx,y-cy,z-cz)*q;sp=Math.max(sp,sm(.62,.4,dd))}c=mix3(c,lum3(top)>.5?mix3(top,[.1,.08,.07],.8):[.93,.91,.88],sp*.92)}
  const l=sm(by+bh*.4,by-bh*.5,y)*.06;return mix3(c,[1,1,1],l)};
 const pad=.12+(fl?.04:0)+(B.ruff?.06:0),b0=[-Ln*.62-pad,H-.02,-Math.max(W,hs*1.25)*.62-pad],b1=[tipX+pad,hc[1]+hs*.5+hs*.55*er+pad,Math.max(W,hs*1.25)*.62+pad];
 const h=Math.max(.018,Math.min(.026,(b1[0]-b0[0])/64));const body=nets(f,b0,b1,h,colorAt);
 const proj=(x,y,z)=>{for(let s=0;s<6;s++){const d=f(x,y,z),g=grad(f,x,y,z,.004);x-=g[0]*d;y-=g[1]*d;z-=g[2]*d}return[x,y,z]};
 const eyes=[1,-1].map(s=>proj(hc[0]+hs*.27,hc[1]+hs*.17,s*hs*.28)),nose=proj(tipX+.05,snY+hs*.03,0);
 // tail
 let tail=null;const T={curl:[[0,0,0],[-.05,.14,0],[-.02,.28,0],[.1,.33,0],[.18,.26,0]],sickle:[[0,0,0],[-.1,.1,0],[-.17,.24,0],[-.15,.38,0]],up:[[0,0,0],[-.07,.14,0],[-.11,.32,0]],plume:[[0,0,0],[-.14,-.03,0],[-.24,-.18,0],[-.28,-.36,0]],down:[[0,0,0],[-.15,-.05,0],[-.3,-.2,0]]}[B.tail];
 if(T){const tr=B.tr||.07,tp=[];const tn=T.length-1;for(let i=0;i<tn;i++){const r0=tr*(1-i/tn*.55),r1=tr*(1-(i+1)/tn*.55);tp.push([fCap(T[i],T[i+1],r0,r1),.05])}tp.unshift([fEll([0,0,0],[tr*1.3,tr*1.3,tr*1.3]),0]);
  const tf=compose(tp,fl?.005*fl:0),ub=B.tipU&&hasU;const tc=(x,y,z)=>{const d=Math.hypot(x-T[tn][0],y-T[tn][1]);return ub?mix3(top,under,sm(.16,.06,d)):top};
  let mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];T.forEach(q=>q.forEach((v,i)=>{mn[i]=Math.min(mn[i],v);mx[i]=Math.max(mx[i],v)}));
  tail=nets(tf,mn.map(v=>v-tr*1.6-.03),mx.map(v=>v+tr*1.6+.03),.016,tc)}
 // legs
 const lr=B.lr,hl=H+bh*.22,prof=[[0,.001],[lr*1.45,0],[lr*1.3,-hl*.3],[lr*1.05,-hl*.62],[lr*.92,-hl*.82],[lr*.9,-hl*.9],[0.001,-hl*.93]].map(q=>new THREE.Vector2(q[0],q[1]));
 const leg=new THREE.LatheGeometry(prof,14);const lc=new Float32Array(leg.attributes.position.count*3),legTop=B.legc?rgb(B.legc):(B.socks&&hasU?top:(hasU&&B.mask&&!sad?under:top)),legBot=B.legc?rgb(B.legc):(hasU&&(B.socks||B.mask)&&!sad?under:top);
 for(let i=0;i<leg.attributes.position.count;i++){const y=leg.attributes.position.getY(i);lc.set(mix3(legTop,legBot,sm(-hl*.25,-hl*.6,y)),i*3)}leg.setAttribute("color",new THREE.BufferAttribute(lc,3));
 const march=(x,y,z,dx,dy,dz)=>{let r=0;while(r<1.2&&f(x+dx*r,y+dy*r,z+dz*r)<0)r+=.004;return r};
 const nA=[Ln*.3,by+bh*.12],nB=[hc[0]-hs*.1,hc[1]-hs*.12],nc=[nA[0]+(nB[0]-nA[0])*.5,nA[1]+(nB[1]-nA[1])*.5],nl=Math.hypot(nB[0]-nA[0],nB[1]-nA[1])||1,nd=[(nB[0]-nA[0])/nl,(nB[1]-nA[1])/nl];
 const nr=march(nc[0],nc[1],0,0,0,1),cx=Ln*.1,cu=march(cx,by,0,0,1,0),cd=march(cx,by,0,0,-1,0),cyc=by+(cu-cd)/2,crz=march(cx,cyc,0,0,0,1),cry=(cu+cd)/2,htop=hc[1]+march(hc[0]-hs*.05,hc[1],0,0,1,0);
 return DOGCACHE[key]={body,tail,leg,eyes,nose,hl,paw:legBot,lr,tailAt:[-Ln*.47,by+bh*.28,0],hs,acc:{nc,nd,nr,cx,cyc,crz,cry,htop,hx:hc[0]-hs*.05}}}
const furMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.78,metalness:0});
const glossMat=new THREE.MeshStandardMaterial({color:0x151517,roughness:.25,metalness:0});
const eyeMats={},pawMats={},accMats={};const accMat=(c,r)=>accMats[c+r]||(accMats[c+r]=new THREE.MeshStandardMaterial({color:c,roughness:r==null?.6:r,side:THREE.DoubleSide}));
const torusG=new THREE.TorusGeometry(1,.075,8,28),hemiG=new THREE.SphereGeometry(1,20,10,0,Math.PI*2,0,Math.PI/2),brimG=new THREE.CylinderGeometry(1,1,.06,24),bandG=(()=>{const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute([0,0,-1, 0,0,1, 0,-1.25,0],3));g.setIndex([0,1,2]);g.computeVertexNormals();return g})();
function addAcc(par,m,L){const a=m.acc;if(!a)return;const Z=new THREE.Vector3(0,0,1);
 if(L.collar||L.bandana){const c=new THREE.Mesh(torusG,accMat(L.collar||L.bandana,.5));c.scale.set(a.nr*1.05,a.nr*1.05,a.nr*1.4);c.position.set(a.nc[0],a.nc[1],0);c.quaternion.setFromUnitVectors(Z,new THREE.Vector3(a.nd[0],a.nd[1],0));par.add(c);
  if(L.collar&&!L.bandana){const tag=new THREE.Mesh(sphSmooth,accMat("#d9b45a",.25));tag.scale.set(a.nr*.08,a.nr*.16,a.nr*.16);tag.position.set(a.nc[0]+a.nd[1]*a.nr*1.08,a.nc[1]-a.nd[0]*a.nr*1.08,0);par.add(tag)}}
 if(L.bandana){const b=new THREE.Mesh(bandG,accMat(L.bandana,.75));b.scale.set(1,a.nr*1.05,a.nr*1.02);b.position.set(a.nc[0]+a.nd[1]*a.nr*.98,a.nc[1]-a.nd[0]*a.nr*.98,0);b.rotation.z=Math.atan2(a.nd[1],a.nd[0])-Math.PI/2+.55;par.add(b)}
 if(L.harness){const hm=accMat(L.harness,.55);[0,-.16].forEach(o=>{const h=new THREE.Mesh(torusG,hm);h.rotation.y=Math.PI/2;h.scale.set(a.crz*1.04,a.cry*1.04,1);h.position.set(a.cx+o*(a.crz*2),a.cyc,0);par.add(h)});const st=new THREE.Mesh(torusG,hm);st.scale.setScalar(a.crz*.28);st.position.set(a.cx-a.crz*.16,a.cyc+a.cry*1.04+a.crz*.2,0);par.add(st)}
 if(L.hat==="beanie"||L.hat==="cap"){const hc=L.hat==="beanie"?"#c0453a":"#2d55e8",hs=m.hs;const h=new THREE.Mesh(hemiG,accMat(hc,.8));h.scale.set(hs*.34,hs*.26,hs*.34);h.position.set(a.hx,a.htop-hs*.1,0);par.add(h);
  if(L.hat==="beanie"){const pm=new THREE.Mesh(sphSmooth,accMat("#f4efe6",.9));pm.scale.setScalar(hs*.1);pm.position.set(a.hx,a.htop+hs*.15,0);par.add(pm)}
  else{const br=new THREE.Mesh(brimG,accMat(hc,.8));br.scale.set(hs*.3,1,hs*.26);br.position.set(a.hx+hs*.26,a.htop-hs*.09,0);br.rotation.z=-.12;par.add(br)}}}
const pawMat=c=>{const k=c.join();return pawMats[k]||(pawMats[k]=new THREE.MeshStandardMaterial({color:new THREE.Color(c[0],c[1],c[2]),roughness:.8}))};
function buildDog(p){const B=specOf(p),m=dogModel(p),L=lookOf(p),g=new THREE.Group(),root=new THREE.Group(),SC=DS*B.s;g.add(root);root.scale.setScalar(SC);
 const Ln=B.len,W=B.w,H=B.leg,bh=B.bh;const body=new THREE.Group();body.position.set(-Ln*.3,H,0);root.add(body);const inner=new THREE.Group();inner.position.set(Ln*.3,-H,0);body.add(inner);inner.add(new THREE.Mesh(m.body,furMat));
 const eyeM=B.eye?(eyeMats[B.eye]||(eyeMats[B.eye]=new THREE.MeshStandardMaterial({color:B.eye,roughness:.2}))):glossMat;
 m.eyes.forEach(e=>{const o=new THREE.Mesh(sphSmooth,eyeM);o.scale.setScalar(m.hs*.075);o.position.set(e[0],e[1],e[2]);inner.add(o);if(B.eye){const pu=new THREE.Mesh(sphSmooth,glossMat);pu.scale.setScalar(m.hs*.045);pu.position.set(e[0]+m.hs*.035,e[1],e[2]);inner.add(pu)}});
 const no=new THREE.Mesh(sphSmooth,L.nose?accMat(L.nose,.3):glossMat);no.scale.set(m.hs*.13,m.hs*.1,m.hs*.15);no.position.set(m.nose[0],m.nose[1],m.nose[2]);inner.add(no);
 const head=new THREE.Group();inner.add(head);addAcc(inner,m,L);
 const legs=[];
 [[Ln*.29,1],[Ln*.29,-1],[-Ln*.3,1],[-Ln*.3,-1]].forEach(([x,s])=>{const pv=new THREE.Group();pv.position.set(x,m.hl,s*W*.21);pv.add(new THREE.Mesh(m.leg,furMat));const pw=new THREE.Mesh(sphSmooth,pawMat(m.paw));pw.scale.set(m.lr*1.3,m.lr*.72,m.lr*1.12);pw.position.set(m.lr*.4,-m.hl+m.lr*.68,0);pv.add(pw);root.add(pv);legs.push(pv)});
 const tail=new THREE.Group();tail.position.set(...m.tailAt);if(m.tail)tail.add(new THREE.Mesh(m.tail,furMat));inner.add(tail);
 const sh=new THREE.Mesh(shadowGeo,shadowMat);sh.rotation.x=-Math.PI/2;sh.position.y=.3;sh.scale.set(SC*Ln*.46,SC*W*.62,1);g.add(sh);
 return {g,body,head,legs,tail,ph:Math.random()*6,sit:0,idle:0,base:H,bh,heading:0}}

function animDog(d,dt,moving,time){d.ph+=dt*(moving?10:0);d.idle=moving?0:d.idle+dt;const ts=(!moving&&d.idle>2.4)?1:0;d.sit+=(ts-d.sit)*Math.min(1,dt*4);
 d.legs.forEach((l,i)=>{const sw=moving?Math.sin(d.ph+(i===0||i===3?0:Math.PI))*.55:0;l.rotation.z+=((i>1?d.sit*1.15:0)+sw-l.rotation.z)*Math.min(1,dt*10)});
 d.body.rotation.z=d.sit*.42;d.body.position.y=d.base-d.sit*d.bh*.3+(moving?Math.abs(Math.sin(d.ph))*.03:0);
 d.tail.rotation.y=Math.sin(time*(moving?7:12))*.35;d.head.rotation.z=moving?Math.sin(d.ph*2)*.04:Math.sin(time*.7)*.07}
function setHeading(d,dx,dz,dt){if(Math.hypot(dx,dz)<.01)return;const a=Math.atan2(-dz,dx);let df=a-d.heading;df=Math.atan2(Math.sin(df),Math.cos(df));d.heading+=df*Math.min(1,dt*8);d.g.rotation.y=d.heading}