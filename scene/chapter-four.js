// A little wind: discover four physical parts, fit keyed joints, and repair a jam.
let fanReady=false,fanStartedAt=0,fanRestAt=-100,fanSelected=null,fanHeld=null,fanDrag=null,fanClickAfter=-100;
let fanStation={x:-165,y:0,z:-10},fanHeading=75,fanHomeYaw=0,fanRepair=0,fanOn=false,fanSpin=0,fanBent=null,fanSwitchMesh=null;
const fanPieces=[
 {key:'blades',name:'Fan Blades',label:'fan blades',meshes:['Fan Blade 0','Fan Blade 1','Fan Blade 2','Fan Blade Hub','Fan Blade Key'],angle:45,home:{x:-235,y:7,z:120}},
 {key:'stand',name:'Fan Stand',label:'fan stand',meshes:['Fan Weighted Base','Fan Upright','Fan Motor Socket','Fan Power Switch'],angle:0,home:{x:235,y:0,z:70}},
 {key:'motor',name:'Fan Motor',label:'fan motor',meshes:['Fan Motor Housing','Fan Motor Back','Fan Keyed Axle','Fan Axle Key','Fan Vent 0','Fan Vent 1','Fan Vent 2','Fan Vent 3','Fan Vent 4'],angle:90,home:{x:-245,y:23,z:-65}},
 {key:'grille',name:'Fan Grille',label:'fan grille',meshes:['Fan Guard Ring 0','Fan Guard Ring 1','Fan Guard Ring 2','Fan Guard Rib 0','Fan Guard Rib 1','Fan Guard Rib 2','Fan Guard Rib 3','Fan Guard Rib 4','Fan Guard Rib 5','Fan Guard Rib 6','Fan Guard Rib 7','Fan Guard Badge','Fan Grille Key'],angle:-45,home:{x:220,y:13,z:-70}}
];
const fanOrder=['stand','motor','blades','grille'];
const fanPart=key=>fanPieces.find(p=>p.key===key);
const fanStates=()=>chapter.startsWith('fan-');
const fanNext=()=>fanOrder.find(key=>!fanPart(key).fitted);
function fanWorld(local){const r=rotateVector(local,0,fanHeading,0);return{x:fanStation.x+r.x,y:r.y,z:fanStation.z+r.z};}
function fanJoint(key){return fanWorld({x:0,y:key==='stand'?0:80,z:key==='blades'?19:key==='grille'?27:0});}
function fanStage(key){
 const i=fanPieces.findIndex(p=>p.key===key),base=screenPoint(fanStation.x,0,fanStation.z);
 const x=innerWidth<600?innerWidth*(i%2===0?.24:.76):bounded(base.x+[-65,-135,65,135][i],38,innerWidth-38);
 const y=Math.min(innerHeight*.8,base.y+65)+(innerWidth<600?Math.floor(i/2)*40:0);
 return pointAtHeight(x,Math.min(y,innerHeight*.88),key==='stand'?0:key==='motor'?24:key==='grille'?36:32);
}
function fanFindPoint(p){
 const raw=screenPoint(p.home.x,p.home.y,p.home.z);
 return pointAtHeight(bounded(raw.x,38,innerWidth-38),bounded(raw.y,innerHeight*.5,innerHeight*.78),p.home.y);
}
async function prepareFan(){
 try{
   for(const p of fanPieces){
     p.root=await spline.findObjectByName(p.name);if(!p.root)throw new Error('Missing '+p.name);
     p.parts=[];for(const name of p.meshes){const o=await spline.findObjectByName(name);if(!o)throw new Error('Missing '+name);p.parts.push(o);}
     p.at={...p.home};p.collected=false;p.fitted=false;p.finding=false;
     await update(p.root.id,{visible:false});
   }
   fanBent=await spline.findObjectByName('Fan Grille Face');fanSwitchMesh=await spline.findObjectByName('Fan Power Switch');
   if(!fanBent||!fanSwitchMesh)throw new Error('Missing fan mechanism');fanReady=true;
 }catch(error){console.error('Fan assets:',error);}
}
const fanBoot=prepareFan();
async function beginFan(){
 if(!['collection-rest','collection-end'].includes(chapter))return;await fanBoot;
 if(!fanReady){speak('Something’s missing.',()=>choice('Try again',()=>location.reload()));return;}
 enter('fan-intro');fanStartedAt=chapterTime;fanHomeYaw=Math.round(yaw/360)*360;yawTarget=fanHomeYaw;
 reaction='';$('choice').hidden=true;$('collect-cap').hidden=true;$('pet').hidden=true;$('five').hidden=true;
 const desired=screenPoint(fanStation.x,0,fanStation.z);
 if(desired.x<70)fanStation=pointAtHeight(70,desired.y,0);
 speak('Shall we find another?',()=>{after(1,()=>searchFanPart(0));});
}
function searchFanPart(index){
 if(!fanStates())return;const p=fanPieces[index];
 if(!p){beginFanAssembly();return;}
 enter('fan-find');fanSelected=null;fanHeld=null;p.finding=true;p.at=fanFindPoint(p);
 $('spark').hidden=false;$('fan-'+p.key).hidden=false;
 objective(index===0?'Find the little shape':'Find the missing pieces');
 revealFoundObject('fan-'+p.key,p.root,p.parts,screenPoint(p.at.x,p.at.y,p.at.z));
}
function pickupFan(p){
 if(chapter!=='fan-find'||!p.finding)return;
 restoreFoundObject(p.root,p.parts);p.finding=false;fanSelected=p.key;enter('fan-carry');
 $('fan-hand').hidden=false;objective('Bring it to Milo');
}
function giveFanPart(){
 if(chapter!=='fan-carry'||!fanSelected||!lastPose)return;
 const p=fanPart(fanSelected),index=fanPieces.indexOf(p);p.collected=true;
 fanHeld=p.key;fanSelected=null;fanDrag=null;$('fan-hand').hidden=true;$('fan-'+p.key).hidden=true;$('spark').hidden=true;objective('');
 enter('fan-inspect');
 if(index===0){
   speak('Is it a flower?',()=>{
     // His little puff rocks the loose blades, but there is no motor to turn them.
     enter('fan-blow');speak('...');
     after(2.5,()=>{if(chapter!=='fan-blow')return;speak('No. There’s something missing.',()=>{fanHeld=null;p.at=fanStage(p.key);searchFanPart(1);});});
   });
 }else{
   speak(index===1?'This looks like a foot.':index===2?'Something goes in here.':'That looks like the last bit.',()=>{
     fanHeld=null;p.at=fanStage(p.key);searchFanPart(index+1);
   });
 }
}
function fanControls(show){for(const id of ['fan-turn-left','fan-turn-right'])$(id).hidden=!show;}
function beginFanAssembly(){
 enter('fan-assemble');fanSelected=null;fanHeld=null;yawTarget=fanHomeYaw-22;
 $('spark').hidden=true;$('fan-target').hidden=false;objective('Put the pieces together');
 for(const p of fanPieces){p.at=fanStage(p.key);restoreFoundObject(p.root,p.parts);$('fan-'+p.key).hidden=false;}
 speak('Can these be one thing?');
}
function selectFanPart(p){
 if(chapter!=='fan-assemble'||p.fitted)return;
 fanSelected=p.key;fanControls(true);
}
function turnFanPart(amount){
 if(chapter!=='fan-assemble'||!fanSelected)return;
 const p=fanPart(fanSelected);p.angle+=amount;
}
function fitFanPart(){
 if(chapter!=='fan-assemble'||!fanSelected)return false;
 const p=fanPart(fanSelected);
 if(p.key!==fanNext()){speak('The other bit goes in first.');return false;}
 const angle=((p.angle%360)+540)%360-180;
 if(Math.abs(angle)>16){speak('Nearly. Turn it a little.');return false;}
 p.fitted=true;p.angle=0;p.at=fanJoint(p.key);$('fan-'+p.key).hidden=true;fanSelected=null;fanControls(false);
 enter('fan-fit');$('fan-target').hidden=true;
 after(.7,()=>{
   if(chapter!=='fan-fit')return;
   if(fanNext()){enter('fan-assemble');$('fan-target').hidden=false;}
   else{enter('fan-test');objective('Try the switch');$('fan-switch').hidden=false;speak('All the bits are here.');}
 });return true;
}
function startFanTest(){
 if(chapter!=='fan-test')return;
 enter('fan-sputter');$('fan-switch').disabled=true;objective('');speak('...');
 after(2.5,()=>{
   if(chapter!=='fan-sputter')return;enter('fan-jammed');fanRepair=0;
   $('fan-grille').hidden=false;$('fan-grille').setAttribute('aria-label','Straighten the bent grille. Use arrow keys to pull it clear.');
   speak('It wants to.',()=>speak('That bit’s touching.'));objective('Give it room to turn');
 });
}
function finishFanRepair(){
 if(chapter!=='fan-jammed')return;
 fanRepair=1;fanDrag=null;enter('fan-ready');$('fan-grille').hidden=true;$('fan-switch').disabled=false;
 objective('Try the switch');speak('Try it now.');
}
function switchFan(){
 if(chapter==='fan-test'){startFanTest();return;}
 if(!['fan-ready','fan-running','fan-rest'].includes(chapter))return;
 fanOn=!fanOn;$('fan-switch').setAttribute('aria-pressed',String(fanOn));
 $('fan-switch').setAttribute('aria-label',fanOn?'Turn the fan off':'Turn the fan on');
 if(chapter==='fan-ready'){
   enter('fan-running');objective('');
   speak('Oh. You made wind.',()=>speak('I’d like to keep this.',()=>choice('Sit in the breeze',restWithFan)));
 }
}
function restWithFan(){
 if(chapter!=='fan-running')return;
 enter('fan-rest');fanRestAt=chapterTime;$('choice').hidden=true;$('pet').hidden=false;
 speak('The wind can stay.',()=>{after(4,()=>{$('dialogue').hidden=true;});});
}
function startFanDrag(e,p){
 if(e.button>0)return;
 if(chapter==='fan-jammed'&&p.key==='grille'){
   fanDrag={kind:'repair',id:e.pointerId,x:e.clientX,y:e.clientY,base:fanRepair,moved:false,el:e.currentTarget};
 }else{
   if(chapter==='fan-find'&&p.finding)pickupFan(p);
   else if(chapter==='fan-assemble'&&!p.fitted)selectFanPart(p);
   if(!['fan-carry','fan-assemble'].includes(chapter)||fanSelected!==p.key)return;
   fanDrag={kind:chapter==='fan-carry'?'carry':'fit',key:p.key,id:e.pointerId,x:e.clientX,y:e.clientY,moved:false,el:e.currentTarget};
 }
 e.currentTarget.setPointerCapture?.(e.pointerId);
}
for(const p of fanPieces){
 const el=$('fan-'+p.key);
 el.onfocus=()=>{if(chapter==='fan-find'&&p.finding){revealFocus='fan-'+p.key;revealFoundObject(revealFocus,p.root,p.parts,screenPoint(p.at.x,p.at.y,p.at.z));}};
 el.onclick=()=>{
   if(chapterTime<fanClickAfter)return;
   if(chapter==='fan-find')pickupFan(p);else if(chapter==='fan-assemble')selectFanPart(p);
 };
 el.onpointerdown=e=>startFanDrag(e,p);
 el.onkeydown=e=>{
   if(chapter==='fan-jammed'&&p.key==='grille'&&e.key.startsWith('Arrow')){e.preventDefault();fanRepair=clamp(fanRepair+.25);if(fanRepair===1)finishFanRepair();return;}
   if(chapter!=='fan-assemble'||p.fitted)return;
   if(['ArrowLeft','ArrowRight','Enter',' '].includes(e.key)){
     e.preventDefault();selectFanPart(p);
     if(e.key.startsWith('Arrow'))turnFanPart(e.key==='ArrowLeft'?-45:45);else fitFanPart();
   }
 };
}
$('fan-hand').onclick=giveFanPart;$('fan-target').onclick=fitFanPart;$('fan-switch').onclick=switchFan;
$('fan-turn-left').onclick=()=>turnFanPart(-45);$('fan-turn-right').onclick=()=>turnFanPart(45);
window.addEventListener('pointermove',e=>{
 const d=fanDrag;if(!d||e.pointerId!==d.id)return;
 if(!d.moved&&Math.hypot(e.clientX-d.x,e.clientY-d.y)<5)return;
 d.moved=true;fanClickAfter=chapterTime+.35;document.body.dataset.armDragging='true';
 if(d.kind==='repair'){fanRepair=clamp(d.base+Math.hypot(e.clientX-d.x,e.clientY-d.y)/65);return;}
 const p=fanPart(d.key),height=d.kind==='carry'?120:p.key==='stand'?0:80;
 p.at=pointAtHeight(e.clientX,e.clientY,height);
});
function releaseFanDrag(e,cancelled=false){
 const d=fanDrag;if(!d||(e.pointerId!==undefined&&e.pointerId!==d.id))return;
 try{d.el.releasePointerCapture?.(d.id);}catch{}
 fanDrag=null;document.body.dataset.armDragging='false';
 if(!d.moved)return;fanClickAfter=chapterTime+.35;
 if(d.kind==='repair'){
   if(cancelled)fanRepair=d.base;else if(fanRepair>=.85)finishFanRepair();return;
 }
 const p=fanPart(d.key);
 if(d.kind==='carry'){
   const h=handScreen(lastPose,'left');
   if(!cancelled&&Math.hypot((e.clientX??-999)-h.x,(e.clientY??-999)-h.y)<70)giveFanPart();
   else{p.finding=true;p.at=fanFindPoint(p);enter('fan-find');fanSelected=null;$('fan-hand').hidden=true;objective('Find the missing pieces');}
 }else{
   const j=fanJoint(fanNext()),target=screenPoint(j.x,j.y+(fanNext()==='stand'?8:0),j.z);
   const close=Math.hypot((e.clientX??-999)-target.x,(e.clientY??-999)-target.y)<bounded(innerHeight/720*65,40,80);
   if(cancelled){fanSelected=null;fanControls(false);}
   if(cancelled||!close||!fitFanPart())p.at=fanStage(p.key);
 }
}
window.addEventListener('pointerup',e=>releaseFanDrag(e));window.addEventListener('pointercancel',e=>releaseFanDrag(e,true));
window.addEventListener('blur',()=>releaseFanDrag({},true));
function fanPose(p){
 if(!fanStates())return p;
 const started=ease((chapterTime-fanStartedAt)/2.8);
 const rest=chapter==='fan-rest'?ease((chapterTime-fanRestAt)/3):0;
 const crouch=82-27*started;
 const down=crouch+(82-crouch)*rest;p.bodyY-=down;
 const leg=1-down/82;
 for(const side of [-1,1])write('Robot Leg Pivot '+side,{position:{y:20+80*leg},rotation:{x:-78*(1-leg),y:0,z:0}});
 p.headX=18;p.headY=-12;
 if(fanHeld){p.leftZ=-115;p.leftX=-35;p.headX=22;p.headY=-25;}
 if(chapter==='fan-blow'){const t=chapterTime-chapterAt;p.headX+=Math.sin(t*8)*3;p.headZ=Math.sin(t*5)*2;}
 if(['fan-assemble','fan-fit','fan-test','fan-sputter','fan-jammed','fan-ready'].includes(chapter)){p.leftX=-25;p.leftZ=-35;p.headX=22;}
 if(['fan-running','fan-rest'].includes(chapter)&&fanOn){p.leftZ=5;p.leftX=-60;p.headX=8;p.headZ=Math.sin(chapterTime)*2;}
 if(reaction==='pet'){const r=pulse(chapterTime-reactionAt,0,.3,1.2,2);p.headX+=r*8;p.headZ+=r*9;}
 return p;
}
function fanTick(dt){
 if(!fanReady||!fanStates()||!lastPose)return;
 const time=chapterTime-chapterAt;
 if(chapter==='fan-sputter'){
   const speed=reduced?45:650;
   fanSpin=time<.9?(time*speed)%360:(.9*speed)%360+Math.sin((time-.9)*23)*12*clamp(1-(time-.9)/1.6);
 }
 else if(fanOn)fanSpin=(fanSpin+dt*(reduced?45:700))%360;
 for(const p of fanPieces){
   if(p.finding)revealFoundObject('fan-'+p.key,p.root,p.parts,screenPoint(p.at.x,p.at.y,p.at.z));
   else if(p.collected){
     if(fanHeld===p.key){
       const h=projectedHand(lastPose,'left');p.at={x:h.x,y:h.y+7,z:h.z};
     }else if(p.fitted)p.at=fanJoint(p.key);
     const spinning=p.key==='blades'&&p.fitted;
     const wobble=chapter==='fan-blow'&&fanHeld===p.key?Math.sin(time*12)*10:0;
     const shake=chapter==='fan-sputter'&&p.key==='motor'?Math.sin(time*40)*.7:0;
     update(p.root.id,{position:{...p.at,x:p.at.x+shake},rotation:{x:0,y:fanHeading,z:spinning?fanSpin:p.angle+wobble}});
   }
   if(p.finding)update(p.root.id,{position:p.at,rotation:{x:p.key==='stand'?0:68,y:fanHeading,z:p.angle}});
   place($('fan-'+p.key),screenPoint(p.at.x,p.at.y+(p.key==='stand'?20:0),p.at.z));
 }
 update(fanBent.id,{rotation:{x:-18*(1-fanRepair),y:12*(1-fanRepair),z:0},position:{x:0,y:0,z:-8*(1-fanRepair)}});
 update(fanSwitchMesh.id,{rotation:{x:fanOn?-12:0}});
 place($('fan-hand'),handScreen(lastPose,'left'));
 const next=fanNext();
 if(next){const j=fanJoint(next);place($('fan-target'),screenPoint(j.x,j.y+(next==='stand'?8:0),j.z));}
 if(fanSelected&&chapter==='fan-assemble'){
   const p=fanPart(fanSelected),s=screenPoint(p.at.x,p.at.y,p.at.z);
   place($('fan-turn-left'),{x:bounded(s.x-35,24,innerWidth-65),y:s.y-55});
   place($('fan-turn-right'),{x:bounded(s.x+35,65,innerWidth-24),y:s.y-55});
 }
 const button=fanWorld({x:17,y:10,z:10});place($('fan-switch'),screenPoint(button.x,button.y,button.z));
 if(chapter==='fan-rest')place($('pet'),bodyScreen(0,235,75));
}
