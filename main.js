import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const root=document.documentElement;
const themeButton=document.querySelector("#themeButton");
const themeColor=document.querySelector("#themeColor");
const saved=localStorage.getItem("sm-theme");
const initial=saved==="light"||saved==="dark"?saved:(matchMedia("(prefers-color-scheme:light)").matches?"light":"dark");
root.dataset.theme=initial;
function setThemeUI(theme){
  const light=theme==="light";
  themeButton?.setAttribute("aria-pressed",String(light));
  themeButton?.setAttribute("aria-label",light?"Switch to dark theme":"Switch to light theme");
  if(themeColor)themeColor.content=light?"#f1e8d7":"#101312";
}
setThemeUI(initial);

// Hero title: restrained cursor-reactive, letter-by-letter interaction.
const heroTitle=document.querySelector("#heroTitle");
if(heroTitle){
  heroTitle.querySelectorAll("span").forEach(word=>{
    const text=word.textContent;
    word.textContent="";
    [...text].forEach(ch=>{
      const letter=document.createElement("span");
      letter.className="cursor-letter";
      letter.textContent=ch===" "?"\u00a0":ch;
      word.appendChild(letter);
    });
  });
}

const canvasHost=document.querySelector("#webgl");
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(31,innerWidth/innerHeight,.1,100);
camera.position.set(0,0,9.5);
const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:"high-performance"});
renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1:1.35));
renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;
canvasHost.appendChild(renderer.domElement);

const rootGroup=new THREE.Group();
scene.add(rootGroup);
const lineMaterials=[];
const fillMaterials=[];
const lineMat=(opacity=.3)=>{const m=new THREE.LineBasicMaterial({color:0xf1e8d7,transparent:true,opacity});lineMaterials.push(m);return m};
const fillMat=(opacity=.07)=>{const m=new THREE.MeshBasicMaterial({color:0xf1e8d7,transparent:true,opacity,side:THREE.DoubleSide});fillMaterials.push(m);return m};
const line=lineMat(.22), fine=lineMat(.12), faint=lineMat(.07), fill=fillMat(.055), fillStrong=fillMat(.11);

/*
  HERO OBJECT: a restrained creative-digital desk in space.
  It reads as design boards + campaign data + SEO/search, without sitting on top of the headline.
*/
const sceneGroup=new THREE.Group();
rootGroup.add(sceneGroup);
sceneGroup.position.set(2.0,.05,-.1);
sceneGroup.rotation.set(-.16,.2,-.08);

// Main floating design board with real depth.
const board=new THREE.Group();
const boardBody=new THREE.Mesh(new THREE.BoxGeometry(3.35,2.2,.16),fill);
board.add(boardBody);
const boardEdge=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(3.35,2.2,.16)),line);
board.add(boardEdge);
board.rotation.z=-.08;
sceneGroup.add(board);

// Inner layout grid / typography-like blocks.
const gridGroup=new THREE.Group();
for(let i=0;i<7;i++){
  const y=-.82+i*.27;
  gridGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-1.42,y,.11),new THREE.Vector3(1.42,y,.11)]),faint));
}
for(let i=0;i<8;i++){
  const x=-1.25+i*.36;
  gridGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x,-.88,.11),new THREE.Vector3(x,.86,.11)]),faint));
}
// Editorial blocks.
const blocks=[[-1.12,.55,.82,.22],[.03,.55,1.04,.22],[-1.12,.13,.48,.13],[-.52,.13,.86,.13],[.51,.13,.55,.13],[-1.12,-.28,1.72,.11],[-1.12,-.54,1.22,.08]];
blocks.forEach(([x,y,w,h],i)=>{
  const g=new THREE.BoxGeometry(w,h,.035);
  const m=new THREE.Mesh(g,i===0||i===1?fillStrong:fill);
  m.position.set(x+w/2,y,.13);gridGroup.add(m);
});
board.add(gridGroup);

// Brand color swatches / design palette.
const swatches=new THREE.Group();
[[-1.1,-.76],[ -.82,-.76],[ -.54,-.76]].forEach(([x,y],i)=>{
  const s=new THREE.Mesh(new THREE.BoxGeometry(.2,.2,.06),i===1?fillStrong:fill);
  s.position.set(x,y,.17);swatches.add(s);
});
board.add(swatches);

// 3D campaign analytics card, offset in depth.
const analytics=new THREE.Group();
const analyticsBody=new THREE.Mesh(new THREE.BoxGeometry(1.65,1.05,.11),fillStrong);
analytics.add(analyticsBody);
analytics.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.65,1.05,.11)),line));
const values=[.22,.39,.31,.58,.49,.77,.68,.91];
values.forEach((v,i)=>{
  const h=.72*v;
  const bar=new THREE.Mesh(new THREE.BoxGeometry(.095,h,.045),line);
  bar.position.set(-.62+i*.18,-.25+h/2,.09);analytics.add(bar);
});
analytics.position.set(1.32,-1.05,.3);analytics.rotation.z=.08;analytics.rotation.y=-.08;sceneGroup.add(analytics);

// Search / SEO magnifier, placed behind the board rather than across text.
const seo=new THREE.Group();
seo.add(new THREE.Mesh(new THREE.TorusGeometry(.72,.055,12,64),line));
const handle=new THREE.Mesh(new THREE.BoxGeometry(.11,.68,.07),line);
handle.position.set(.48,-.5,0);handle.rotation.z=-.72;seo.add(handle);
const searchCore=new THREE.Mesh(new THREE.SphereGeometry(.11,16,16),fillStrong);searchCore.position.set(-.1,.1,.04);seo.add(searchCore);
seo.position.set(-2.15,-1.45,-.25);seo.rotation.z=-.15;seo.scale.setScalar(.78);rootGroup.add(seo);

// Target/ranking rings to the far right, giving the composition a focal counterweight.
const target=new THREE.Group();
[.52,.75,.98].forEach((r,i)=>{
  const ring=new THREE.Mesh(new THREE.TorusGeometry(r,.018,8,80),lineMat(.08+i*.045));
  ring.rotation.x=Math.PI/2;ring.rotation.z=i*.18;target.add(ring);
});
target.add(new THREE.Mesh(new THREE.SphereGeometry(.055,14,14),fillStrong));
target.position.set(2.65,1.42,-.6);target.rotation.set(.35,.15,.15);rootGroup.add(target);

// Small floating cursor / pointer motif.
const cursor=new THREE.Group();
const cursorShape=new THREE.Shape();
cursorShape.moveTo(0,0);cursorShape.lineTo(.22,-.72);cursorShape.lineTo(.38,-.45);cursorShape.lineTo(.72,-.52);cursorShape.lineTo(.14,.02);cursorShape.closePath();
const cursorGeo=new THREE.ShapeGeometry(cursorShape);
const cursorMesh=new THREE.Mesh(cursorGeo,fillStrong);cursor.add(cursorMesh);
cursor.add(new THREE.LineSegments(new THREE.EdgesGeometry(cursorGeo),fine));
cursor.position.set(2.45,-.2,.4);cursor.scale.setScalar(.55);cursor.rotation.z=-.18;rootGroup.add(cursor);

// Very small dust field, deliberately sparse.
const pts=[];const count=innerWidth<700?18:38;
for(let i=0;i<count;i++){
  const p=new THREE.Vector3((Math.random()-.5)*8,(Math.random()-.5)*5,(Math.random()-.5)*4);
  pts.push(p.x,p.y,p.z);
}
const pGeo=new THREE.BufferGeometry();pGeo.setAttribute("position",new THREE.Float32BufferAttribute(pts,3));
const pMat=new THREE.PointsMaterial({color:0xf1e8d7,size:innerWidth<700?.014:.018,transparent:true,opacity:.12});
const points=new THREE.Points(pGeo,pMat);scene.add(points);

function syncSceneTheme(){
  const light=root.dataset.theme==="light";
  const c=light?0x2b302e:0xf1e8d7;
  [...lineMaterials,...fillMaterials].forEach(m=>m.color.setHex(c));
  pMat.color.setHex(c);
  pMat.opacity=light?.075:.12;
}
syncSceneTheme();

themeButton?.addEventListener("click",()=>{
  const next=root.dataset.theme==="dark"?"light":"dark";
  root.dataset.theme=next;localStorage.setItem("sm-theme",next);setThemeUI(next);syncSceneTheme();
});

const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
let mx=0,my=0,scrollYValue=0;
addEventListener("pointermove",e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5},{passive:true});
addEventListener("scroll",()=>scrollYValue=scrollY,{passive:true});

function animate(){
  requestAnimationFrame(animate);
  if(!reduce){
    const t=performance.now()*.001;
    rootGroup.rotation.y+=(mx*.055-rootGroup.rotation.y)*.025;
    rootGroup.rotation.x+=(my*.035-rootGroup.rotation.x)*.025;
    sceneGroup.rotation.z=Math.sin(t*.32)*.012;
    sceneGroup.position.y+=(-scrollYValue*.00011+.03*Math.sin(t*.55)-sceneGroup.position.y)*.018;
    analytics.rotation.y=.12+Math.sin(t*.7)*.025;
    seo.rotation.z=-.15+Math.sin(t*.5)*.025;
    target.rotation.z=.15+t*.055;
    cursor.rotation.y=Math.sin(t*.75)*.12;
    points.rotation.y=t*.035;
  }
  renderer.render(scene,camera);
}
animate();

function resize(){
  camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<700?1:1.35));renderer.setSize(innerWidth,innerHeight);
  if(innerWidth<800){rootGroup.scale.setScalar(.72);rootGroup.position.set(1.1,.25,0)}
  else{rootGroup.scale.setScalar(1);rootGroup.position.set(0,0,0)}
}
addEventListener("resize",resize,{passive:true});resize();

const menuButton=document.querySelector("#menuButton");
const panel=document.querySelector("#menuPanel");
function closeMenu(){menuButton.classList.remove("active");panel.classList.remove("open");menuButton.setAttribute("aria-expanded","false");panel.setAttribute("aria-hidden","true")}
menuButton.addEventListener("click",()=>{
  const open=!panel.classList.contains("open");
  menuButton.classList.toggle("active",open);panel.classList.toggle("open",open);
  menuButton.setAttribute("aria-expanded",String(open));panel.setAttribute("aria-hidden",String(!open));
});
document.querySelectorAll(".menu-panel a").forEach(a=>a.addEventListener("click",closeMenu));
addEventListener("keydown",e=>{if(e.key==="Escape")closeMenu()});

if(!reduce){
 document.querySelectorAll(".service-list article,.project-card,.button").forEach(el=>{
   el.addEventListener("pointermove",e=>{
     const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
     if(el.classList.contains("project-card"))el.style.transform=`perspective(1000px) rotateX(${y*-1.4}deg) rotateY(${x*1.4}deg)`;
   });
   el.addEventListener("pointerleave",()=>{el.style.transform=""});
 });
}


// Cursor-reactive hero letters; intentionally monochrome and subtle.
if(heroTitle && !matchMedia("(pointer:coarse)").matches && !reduce){
  const letters=[...heroTitle.querySelectorAll(".cursor-letter")];
  heroTitle.addEventListener("pointermove",e=>{
    letters.forEach(letter=>{
      const r=letter.getBoundingClientRect();
      const cx=r.left+r.width/2, cy=r.top+r.height/2;
      const d=Math.hypot(e.clientX-cx,e.clientY-cy);
      const influence=Math.max(0,1-d/105);
      letter.style.transform=`translateY(${-influence*7}px) scale(${1+influence*.035})`;
      letter.style.opacity=String(.72+influence*.28);
    });
  });
  heroTitle.addEventListener("pointerleave",()=>letters.forEach(letter=>{letter.style.transform="";letter.style.opacity=""}));
}

// Reusable modal behavior for the hero contact card and certificate viewer.
const messageModal=document.querySelector("#messageModal");
const certificateModal=document.querySelector("#certificateModal");
let activeModal=null;
function openModal(modal){
  if(!modal)return;
  activeModal=modal;modal.classList.add("open");modal.setAttribute("aria-hidden","false");
  document.body.style.overflow="hidden";
  modal.querySelector(".modal-close")?.focus();
}
function closeModal(modal=activeModal){
  if(!modal)return;
  modal.classList.remove("open");modal.setAttribute("aria-hidden","true");
  activeModal=null;document.body.style.overflow="";
}
document.querySelector("#messageButton")?.addEventListener("click",()=>openModal(messageModal));
document.querySelectorAll("[data-close-modal]").forEach(btn=>btn.addEventListener("click",()=>closeModal(btn.closest(".overlay-modal"))));
document.querySelectorAll(".overlay-modal").forEach(modal=>modal.addEventListener("pointerdown",e=>{if(e.target===modal)closeModal(modal)}));

const certificateTitle=document.querySelector("#certificateModalTitle");
const certificateIssuer=document.querySelector("#certificateIssuer");
const documentViewer=document.querySelector("#documentViewer");
const documentOpen=document.querySelector("#documentOpen");
document.querySelectorAll(".certificate-view").forEach(button=>button.addEventListener("click",()=>{
  const file=button.dataset.file;
  certificateTitle.textContent=button.dataset.certificate||"Certificate";
  certificateIssuer.textContent=button.dataset.issuer||"CERTIFICATE";
  documentViewer.innerHTML="";
  const img=new Image();
  img.alt=button.dataset.certificate||"Certificate";
  img.onload=()=>{documentViewer.innerHTML="";documentViewer.appendChild(img);documentOpen.href=file;documentOpen.style.display="inline-flex"};
  img.onerror=()=>{
    documentViewer.innerHTML=`<div class="document-placeholder"><span>DOCUMENT PREVIEW</span><strong>ADD YOUR<br>CERTIFICATE FILE</strong><small>Place the real certificate image at <b>${file}</b>, then this viewer will display it automatically.</small></div>`;
    documentOpen.href=file;documentOpen.style.display="inline-flex";
  };
  img.src=file;
  openModal(certificateModal);
}));
addEventListener("keydown",e=>{if(e.key==="Escape" && activeModal)closeModal()});
