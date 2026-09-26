import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/controls/OrbitControls.js';

const scene=new THREE.Scene(); scene.background=new THREE.Color(0x0b1422); scene.fog=new THREE.FogExp2(0x0b1422,.012);
const camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,.1,500); camera.position.set(18,10,20);
const renderer=new THREE.WebGLRenderer({antialias:true}); renderer.setSize(innerWidth,innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap; document.body.appendChild(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement); controls.enablePan=false; controls.enableZoom=false; controls.maxPolarAngle=Math.PI/2.25; controls.minPolarAngle=.75; controls.target.set(0,1,0);
scene.add(new THREE.HemisphereLight(0x9fc7ff,0x243018,1.7)); const sun=new THREE.DirectionalLight(0xffd7ad,2.5); sun.position.set(-20,30,10); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048); scene.add(sun);
const city=new THREE.Group(); scene.add(city); const colliders=[];
function box(w,h,d,color,x,y,z,rough=.7){const m=new THREE.MeshStandardMaterial({color,roughness:rough,metalness:.05});const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;city.add(o);return o}
function textSprite(text,color='#ffffff',bg='#111722'){const c=document.createElement('canvas');c.width=512;c.height=128;const x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,512,128);x.fillStyle=color;x.font='900 54px Arial';x.textAlign='center';x.textBaseline='middle';x.fillText(text,256,64);const t=new THREE.CanvasTexture(c);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true}));s.scale.set(5,1.25,1);return s}
// street
box(60,.2,18,0x252a31,0,-.1,0); box(60,.25,7,0x59616b,0,.05,0); for(let x=-28;x<=28;x+=7) box(3,.03,.25,0xe7e1ca,x,.18,0);
box(60,.5,2.5,0x8b929b,0,.15,10); box(60,.5,2.5,0x8b929b,0,.15,-10);
function shop(x,z,name,color){box(8,7,8,0x303640,x,3.5,z);box(8.2,.7,8.2,0x11151c,x,7.05,z);const s=textSprite(name,'#fff',color?'#'+color.toString(16).padStart(6,'0'):'#ff2c9c');s.position.set(x,6.2,z-4.15);city.add(s);box(6,3.6,.2,0x9aa4ad,x,2.5,z-4.12,.25);colliders.push({x,z,w:7,d:7,name});return {x,z}}
const clothes=shop(-13,-3,'CLOTHES',0x1b1f26); const messy=shop(13,-3,'MESSY',0xff2c9c); const savys=shop(13,13,'SAVYS',0xf07fb2); const shoes=shop(-13,13,'SHOES',0x20262f);
// shop interiors visible through open fronts
function rack(x,z){box(2.2,1.8,.5,0x171a20,x,1.5,z);for(let i=-2;i<=2;i++)box(.35,1.2,.35,0xffffff,x+i*.35,2.0,z-.2)}
for(const p of [-15,-13,-11]) rack(p,-7); for(const p of [11,13,15]) rack(p,-7); for(const p of [11,13,15]) rack(p,9);
// towers/background
for(let i=-27;i<=27;i+=6){const h=8+Math.random()*15; box(5,h,5,0x1a2430,i,h/2,-15); box(5,h*.8,5,0x202a35,i,h*.4,15)}
// trees/lamps
function tree(x,z){box(.45,3,.45,0x5a3827,x,1.5,z);const g=new THREE.Mesh(new THREE.SphereGeometry(1.7,12,10),new THREE.MeshStandardMaterial({color:0x2d6d45,roughness:1}));g.position.set(x,4,z);g.castShadow=true;city.add(g)}
function lamp(x,z){box(.12,4,.12,0x161b22,x,2,z);const l=new THREE.PointLight(0xffb36b,5,10);l.position.set(x,4,z);scene.add(l);}
for(let x=-25;x<=25;x+=10){tree(x,7);tree(x,-7);lamp(x,7);lamp(x,-7)}
// player
const player=new THREE.Group();scene.add(player);const body=box(.9,1.7,.55,0x101317,0,1,0);const head=new THREE.Mesh(new THREE.SphereGeometry(.38,20,16),new THREE.MeshStandardMaterial({color:0xc78f72,roughness:.75}));head.position.set(0,2.15,0);head.castShadow=true;player.add(head);const hoodie=box(1.05,1.25,.62,0x11151c,0,1.25,0);player.add(hoodie);const leg1=box(.34,1.15,.4,0x16191f,-.28,.45,0);const leg2=box(.34,1.15,.4,0x16191f,.28,.45,0);player.add(leg1,leg2);player.position.set(0,0,6);
const keys={}; addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(e.key.toLowerCase()==='e') interact()}); addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
let coins=0,bought=false,atShop=null; const coinMeshes=[];
function coin(x,z){const c=new THREE.Mesh(new THREE.CylinderGeometry(.32,.32,.12,24),new THREE.MeshStandardMaterial({color:0xffd43b,metalness:.7,roughness:.25,emissive:0x664400}));c.rotation.x=Math.PI/2;c.position.set(x,.7,z);c.castShadow=true;city.add(c);coinMeshes.push(c)}
[[-7,4],[-3,-4],[4,4],[8,-2],[0,-8],[17,5],[19,-7]].forEach(p=>coin(...p));
function interact(){if(atShop&&atShop.name==='CLOTHES'&&!bought){bought=true;document.querySelector('#m1').classList.add('done');document.querySelector('#m2').classList.add('done');document.querySelector('#m1').textContent='✓ Go to the Clothing Store';document.querySelector('#m2').textContent='✓ Buy 1 T-Shirt';checkComplete()}}
function checkComplete(){if(coins>=5&&bought){document.querySelector('#m3').classList.add('done');document.querySelector('#m3').textContent='✓ Collect 5 Coins';document.querySelector('#complete').style.display='flex'}}
function nearShop(){atShop=null;let best=999;for(const s of colliders){const d=Math.hypot(player.position.x-s.x,player.position.z-s.z);if(d<best){best=d;atShop=s}}if(best>6)atShop=null;const p=document.querySelector('#prompt');if(atShop&&!bought){p.style.display='block';p.innerHTML='<span class="promptKey">E</span>  Buy 1 T-Shirt — $50'}else p.style.display='none'}
const clock=new THREE.Clock();function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04);let dx=0,dz=0;if(keys.w||keys.arrowup)dz-=1;if(keys.s||keys.arrowdown)dz+=1;if(keys.a||keys.arrowleft)dx-=1;if(keys.d||keys.arrowright)dx+=1;const len=Math.hypot(dx,dz)||1;const speed=(keys.shift?8:4)*dt;player.position.x+=dx/len*speed;player.position.z+=dz/len*speed;player.position.x=THREE.MathUtils.clamp(player.position.x,-28,28);player.position.z=THREE.MathUtils.clamp(player.position.z,-8,8);if(dx||dz)player.rotation.y=Math.atan2(dx,dz);camera.position.lerp(new THREE.Vector3(player.position.x+10,8,player.position.z+12),.08);controls.target.lerp(new THREE.Vector3(player.position.x,1,player.position.z),.12);controls.update();for(const c of coinMeshes){c.rotation.z+=dt*3;if(c.visible&&c.position.distanceTo(player.position)<1.2){c.visible=false;coins++;document.querySelector('#coins').textContent=coins;checkComplete()}}nearShop();renderer.render(scene,camera)}animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
