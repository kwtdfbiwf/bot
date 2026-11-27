const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const html=fs.readFileSync('scene/opening.html','utf8');
assert(!/body\[data-phase=appear\] #wake/.test(html),'Both wake buttons must use the same placement');
const {three}=require('./shader-runtime.cjs');const shaderMaterials=new Map();
let now=0,rafs=[],queue=[],timerId=0,focused=null;
const elements=new Map(),objects=new Map(),writes=new Map(),events={},savedNames=new Map();
let updateCount=0,traceHead=false;const pickupHead=[];
function merge(target,source){for(const [key,value] of Object.entries(source)){if(value&&typeof value==='object')merge(target[key]||(target[key]={}),value);else target[key]=value;}return target;}
class Element{
 constructor(id){this.id=id;this.hidden=true;this.disabled=false;this.value='';this.textContent='';this.style={setProperty(k,v){this[k]=v}};this.dataset={};this.attributes={};this.children=[];this.classList={add(){},remove(){},toggle(){}};this.firstElementChild={style:{}};}
 setAttribute(k,v){this.attributes[k]=v} append(...v){this.children.push(...v)} replaceChildren(){this.children=[]}
 focus(){focused=this;this.onfocus?.()} blur(){if(focused===this)focused=null}
 getBoundingClientRect(){const x=this.id==='switch'?1050:243,y=this.id==='switch'?281:461;return{left:x-22,top:y-34,width:44,height:68}}
}
for(const m of html.matchAll(/id="([^"]+)"/g))elements.set(m[1],new Element(m[1]));
const body=new Element('body'),root=new Element('root');
const homeFixtures=['Interior Home','Interior Floor Plank 0 0','Interior Back Wall Plank 8','Interior Roof Rafter -1 -230','Interior Sloped Ceiling -1 0','Interior Travel Chest','Interior Rust Bed','Interior Book Crate','Interior Practical Lamp','Interior Practical Near','Interior Table Lamp','Interior Lamp Foot','Interior Lamp Bulb','Interior Lamp Shade','Interior Bedside Cabinet','Interior Cabinet Body','Interior Daybed','Interior Cot Mattress','Interior Daybed Pillow','Interior Pillow Seam','Interior Fringed Rug','Interior Round Woven Rug','Interior Rug Fringe 0','Interior Window','Interior Window Sill','Interior Bulb Garlands','Interior Golden Bulb 0','Interior Golden Bulb 1','Interior Golden Bulb 2','Interior Draped Cable 0','Interior Slippers','Interior Slipper Sole -75','Home Story Props','Home Rolled Rug','Home Rug Roll Cloth','Home Loose Thread','Home Thread Loop','Home Lamp Cable','Home Cable Floor','Home Daybed Cover','Home Cover Fabric','Home Folded Blanket','Home Blanket Folded Cloth','Home Connector','Home Connector Socket','Home Loose Plug','Home Plug Body','Home Garland Pull','Home Pull Cord','Home Seat Dust',...Array.from({length:6},(_,i)=>'Home Seat Dust '+i)];
const homeGroups=new Set(['Interior Home','Interior Travel Chest','Interior Rust Bed','Interior Book Crate','Interior Table Lamp','Interior Bedside Cabinet','Interior Daybed','Interior Fringed Rug','Interior Window','Interior Bulb Garlands','Interior Slippers','Home Story Props','Home Rolled Rug','Home Loose Thread','Home Lamp Cable','Home Daybed Cover','Home Folded Blanket','Home Connector','Home Loose Plug','Home Garland Pull','Home Seat Dust']);
const spline={ready:Promise.resolve(),async getAllObjects(){for(const name of homeFixtures){const o=await spline.findObjectByName(name);o.type=homeGroups.has(name)?'Empty':'Mesh';}return [...objects.values()];},async createCustomMaterial(factory){return factory(three)},async setMaterial(id,m){if(typeof m==="function")m=m(three);shaderMaterials.set(id,m);return m},async findObjectByName(name){if(!objects.has(name))objects.set(name,{id:name,name,position:{x:0,y:name.startsWith('Robot Leg')?100:102,z:0}});return objects.get(name)},async updateObject(id,props){updateCount++;if(traceHead&&id==='Robot Head Pivot'&&Number.isFinite(props.rotation?.y))pickupHead.push(props.rotation.y);writes.set(id,merge(writes.get(id)||{},props));return true},async createObject(type,props){const o={id:props.name,...props};objects.set(o.id,o);writes.set(o.id,props);return o}};
const previewMode=(process.argv[2]||'').startsWith('preview:')?process.argv[2].slice(8):'';
let reloads=0;
const context={console,spline,Math,Promise,Error,localStorage:{getItem:k=>savedNames.get(k),setItem:(k,v)=>savedNames.set(k,v)},document:{body,documentElement:root,hidden:false,getElementById:id=>elements.get(id),createElement:()=>new Element('span'),createTextNode:text=>text},innerWidth:1280,innerHeight:720,performance:{now:()=>now},matchMedia:()=>({matches:false}),location:{reload(){reloads++}},requestAnimationFrame:fn=>{rafs.push(fn)},setTimeout:(fn,delay=0)=>{const id=++timerId;queue.push({id,at:now+delay,fn});return id},clearTimeout:id=>{queue=queue.filter(t=>t.id!==id)},window:{addEventListener:(name,fn)=>{(events[name]??=[]).push(fn)}}};
vm.createContext(context);vm.runInContext(html.split('<script>')[1].split('</script>')[0].replace('function screenPoint(', 'window.testProject=screenPoint;window.testHomeHand=()=>projectedHand(lastPose,"right");window.testPointAtHeight=pointAtHeight;window.testShelfPoint=shelfPoint;window.testDustLayout=()=>shelfDustLayout;function screenPoint('),context);
const $=id=>elements.get(id);
const project=(x,y,z)=>context.window.testProject(x,y,z);
async function advance(seconds){for(let i=0;i<Math.ceil(seconds*60);i++){now+=1000/60;for(let j=0;j<8;j++)await Promise.resolve();const due=queue.filter(t=>t.at<=now);queue=queue.filter(t=>t.at>now);due.forEach(t=>t.fn());const frames=rafs;rafs=[];frames.forEach(fn=>fn(now));}for(let j=0;j<12;j++)await Promise.resolve();}
async function checkLightFind(controlId,objectId){
 for(const fn of events.pointermove)fn({clientX:0,clientY:0});await advance(.1);
 assert.equal(writes.get(objectId).visible,false,objectId+' must stay hidden outside the cursor light');
 const el=$(controlId),rect=el.getBoundingClientRect();
 const x=Number.isFinite(parseFloat(el.style.left))?parseFloat(el.style.left):rect.left+rect.width/2;
 const y=Number.isFinite(parseFloat(el.style.top))?parseFloat(el.style.top):rect.top+rect.height/2;
 for(const fn of events.pointermove)fn({clientX:x,clientY:y});await advance(.1);
 assert.equal(writes.get(objectId).visible,true,objectId+' must reveal beneath the cursor light');
 for(const fn of events.pointermove)fn({clientX:0,clientY:0});await advance(.1);
 assert.equal(writes.get(objectId).visible,false,objectId+' must become hidden when the light leaves');
 el.onfocus?.();await advance(.1);
 assert.equal(writes.get(objectId).visible,true,objectId+' must remain discoverable with keyboard focus');
}
async function until(predicate,seconds=40){for(let i=0;i<seconds*10;i++){if(predicate())return;await advance(.1)}throw Error('Timed out at phase '+body.dataset.phase+' / '+body.dataset.chapter)}
(async()=>{
 await advance(2);
 for(const name of ["Head Shell","Head Bezel","Head Screen"]){
   const material=shaderMaterials.get(name);assert(material,name+" must have an opaque surface");
   assert.equal(material.transparent,false);assert.equal(material.opacity,1);
   assert.equal(material.depthWrite,true);assert.equal(material.depthTest,true);
 }
 // These writes must override an older cached native furniture layout.
 assert.equal(writes.get('Interior Rust Bed').position.x,215);
 assert.equal(writes.get('Interior Travel Chest').position.x,35);
 assert.equal(writes.get('Interior Standing Mirror').position.x,420);
 assert.equal(writes.get('Interior Standing Mirror').scale.x,.74);
 assert.equal(writes.get('Interior Tipped Cup').position.y,53.6);
 assert.equal(writes.get('Interior Folded Blanket').position.z,318);
 if(['home','home-direct'].includes(process.argv[2])){
   const dragMode=process.argv[2]==='home-direct';
   async function homeDragTo(id,from,to){$('home-interact').onpointerdown({pointerId:id,button:0,currentTarget:$('home-interact'),clientX:from.x,clientY:from.y});for(const fn of events.pointermove)fn({pointerId:id,clientX:to.x,clientY:to.y});for(const fn of events.pointerup)fn({pointerId:id});await advance(.1);}
   await $('preview-home').onclick();await advance(.2);$('choice').onclick();
   await until(()=>body.dataset.chapter==='home-box'&&!$('home-interact').hidden);
   // Moving a box to a shelf must take time; the cap travels inside it.
   if(dragMode)await homeDragTo(110,project(-135,15,80),project(-180,80,-25));else{$('home-interact').onclick({detail:0});await advance(.4);assert(writes.get('Keepsake Box').position.y>0&&writes.get('Keepsake Box').position.y<80);}
   await until(()=>body.dataset.chapter==='home-rug-find');
   assert.equal(writes.get('Interior Travel Chest').visible,false,'Future furniture must stay hidden');
   assert.equal(writes.get('Interior Roof Rafter -1 -230').visible,false);
   await checkLightFind('home-find','Home Rolled Rug');$('home-find').onclick();await advance(.1);
   assert.equal(body.dataset.chapter,'home-rug-unroll');
   const rugStart=project(0,32,75);
   const rugTravel=Math.max(70,project(0,32,555).y-rugStart.y);
   $('home-interact').onpointerdown({pointerId:101,button:0,currentTarget:$('home-interact'),clientX:rugStart.x,clientY:rugStart.y});
   for(const fn of events.pointermove)fn({pointerId:101,clientX:rugStart.x,clientY:rugStart.y+rugTravel*.25});
   await advance(.1);
   assert(writes.get('Home Rolled Rug').scale.y<1&&writes.get('Home Rolled Rug').scale.y>0,'The roll must shrink as the carpet opens');
   assert(writes.get('Home Rolled Rug').position.y<32,'The shrinking roll must remain on the floor');
   const rollMaterial=shaderMaterials.get('Home Rug Roll Cloth');
   assert.equal(rollMaterial.transparent,true);
   assert(Math.abs(rollMaterial.opacityNode.value-.5)<.001,'The roll must be fading at a quarter unrolled');
   for(const fn of events.pointercancel)fn({pointerId:101});
   assert.equal(body.dataset.chapter,'home-rug-unroll','Cancelling a partial roll must not complete it');
   $('home-interact').onpointerdown({pointerId:102,button:0,currentTarget:$('home-interact'),clientX:rugStart.x,clientY:rugStart.y});
   for(const fn of events.pointermove)fn({pointerId:102,clientX:rugStart.x,clientY:rugStart.y+rugTravel*.25});await advance(.1);
   assert.equal(writes.get('Home Rolled Rug').visible,false,'The rolled section must disappear halfway through unrolling');
   assert.equal(rollMaterial.opacityNode.value,0);
   assert(Math.abs(writes.get('Interior Fringed Rug').scale.z-.5)<.001,'The carpet must continue opening after its roll disappears');
   for(const fn of events.pointercancel)fn({pointerId:102});
   if(dragMode){
     $('home-interact').onpointerdown({pointerId:111,button:0,currentTarget:$('home-interact'),clientX:rugStart.x,clientY:rugStart.y});
     const end=project(0,32,555);for(const fn of events.pointermove)fn({pointerId:111,clientX:end.x,clientY:end.y});await advance(.1);
     assert.equal(writes.get('Home Rolled Rug').visible,false,'The extra roll must disappear at full extension before releasing the pointer');
     for(const fn of events.pointerup)fn({pointerId:111});
   }else for(let i=0;i<6&&body.dataset.chapter==='home-rug-unroll';i++)$('home-interact').onclick({detail:0});
   await until(()=>!$('home-choices').hidden);
   assert.equal(writes.get('Home Rolled Rug').visible,false);
   assert.equal(writes.get('Home Rug Roll Cloth').visible,false,'No rolled cloth should remain after unrolling');
   assert.equal(writes.get('Interior Fringed Rug').scale.z,1,'The finished carpet must remain fully open');
   $(dragMode?'home-a':'home-b').onclick();
   await until(()=>body.dataset.chapter==='home-cable-find');$('home-find').onclick();
   await until(()=>body.dataset.chapter==='home-lamp-find');$('home-find').onclick();
   await until(()=>body.dataset.chapter==='home-lamp-hold',30);
   assert.equal(writes.get('Interior Cabinet Body').visible,false,'The cabinet is earned by repairing the lamp');
   $('home-interact').onclick({detail:0});await advance(1);
   assert.equal(body.dataset.chapter,'home-lamp-hold','Lamp repair must animate rather than complete on click');
   await until(()=>body.dataset.chapter==='home-lamp-switch');$('home-interact').onclick({detail:0});
   await until(()=>body.dataset.chapter==='home-bed-find',40);
   assert.equal(writes.get('Interior Cabinet Body').visible,true);
   assert.equal(writes.get('Interior Daybed').visible,false,'Only the cursor beam can reveal the next find');
   $('home-find').onclick();await advance(5);
   if(dragMode)await homeDragTo(112,project(-310,100,340),{x:project(-310,100,340).x-170,y:project(-310,100,340).y});else for(let i=0;i<5;i++)$('home-interact').onclick({detail:0});
   assert.equal(body.dataset.chapter,'home-bed-clean');
   if(dragMode){for(const x of [-510,-445,-380])for(const z of [90,260]){if(body.dataset.chapter!=='home-bed-clean')break;const q=project(x,109.4,z);await homeDragTo(113,{x:q.x-60,y:q.y},{x:q.x+60,y:q.y});}}else for(let i=0;i<16&&body.dataset.chapter==='home-bed-clean';i++)$('home-interact').onclick({detail:0});
   assert.equal(body.dataset.chapter,'home-cushion');
   if(dragMode)await homeDragTo(114,project(-280,40,235),project(-445,132,-5));else $('home-interact').onclick({detail:0});await advance(.4);
   assert.equal(body.dataset.chapter,'home-cushion-settle','Replacing the cushion must animate');
   await until(()=>body.dataset.chapter==='home-blanket-find',40);
   assert(writes.get('Robot Leg Pivot 1').rotation.x<-60,'Milo must sit by bending his hips');
   assert(writes.get('Leg 1 Shin').rotation.x>60,'His knees must bend independently of the hips');
   assert.equal(writes.get('Interior Roof Rafter -1 -230').visible,false);
   $('home-find').onclick();await until(()=>!$('home-choices').hidden);if(dragMode)await homeDragTo(115,project(-210,20,-431),project(-290,149,155));else $('home-b').onclick();
   await until(()=>!$('home-choices').hidden);assert.equal(writes.get('Home Folded Blanket').position.y,149);
   $('home-a').onclick();await until(()=>body.dataset.chapter==='home-connector-find');$('home-find').onclick();
   await until(()=>body.dataset.chapter==='home-connect',60);
   assert.equal(writes.get('Home Folded Blanket').position.y,113,'Milo must put a lap blanket down before standing');
   if(dragMode){await advance(1);const h=context.window.testHomeHand();await homeDragTo(116,project(-280,185,-770),project(h.x,h.y,h.z));}else $('home-interact').onclick({detail:0});assert.equal(body.dataset.chapter,'home-pull');
   const cord=project(-230,130,-770);
   $('home-interact').onpointerdown({pointerId:102,button:0,currentTarget:$('home-interact'),clientX:cord.x,clientY:cord.y});
   for(const fn of events.pointermove)fn({pointerId:102,clientX:cord.x,clientY:cord.y+20});
   for(const fn of events.pointercancel)fn({pointerId:102});
   assert.equal(body.dataset.chapter,'home-pull','A cancelled pull cannot light the room');
   if(dragMode)await homeDragTo(117,cord,{x:cord.x,y:cord.y+50});else $('home-interact').onclick({detail:0});await advance(1);
   assert.equal(writes.get('Interior Roof Rafter -1 -230').visible,true,'The structure should fade in with the bulbs');
   await until(()=>body.dataset.chapter==='home-quiet',60);
   assert.equal(writes.get('Interior Travel Chest').visible,false,'Unfound belongings remain hidden in the final home');
   assert.equal(writes.get('Interior Daybed').visible,true);assert.equal(writes.get('Interior Slippers').visible,true);
   assert.equal(writes.get('Robot').position.x,-335);assert.equal(writes.get('Robot Leg Pivot 1').position.y>120,true);
   assert.equal($('objective').hidden,true);assert.equal($('home-choices').hidden,true);
   assert.equal(writes.get('Keepsake Box').position.y,80);
   context.innerWidth=390;context.innerHeight=844;for(const fn of events.resize)fn();await advance(.2);
   const bedOnMobile=project(-445,109,155);assert(bedOnMobile.x>0&&bedOnMobile.x<390,'The daybed must remain reachable on a narrow screen');
   context.innerWidth=1280;context.innerHeight=720;
   await $('preview-water').onclick();await advance(8);
   assert.equal(body.dataset.chapter,'water-find');assert.equal(writes.get('Robot').position.x,0);
   assert.equal(writes.get('Interior Home').visible,false);assert.equal(writes.get('Leg 1 Shin').rotation.x,0,'Reset must straighten the knees');
   assert.equal(rollMaterial.opacityNode.value,1,'Restarting must restore the roll so it can be found again');
   console.log('PASS: full home sequence, gradual reveal, moving objects, knee rig, cancelled drags, quiet ending and reset');return;
 }
 if(previewMode){
   await $('preview-'+previewMode).onclick();
   if(previewMode==='dust')await until(()=>body.dataset.chapter==='shelf-cleaning');
   await advance(.1);
   const expected={play:'play',seed:'finding',name:'name-search',water:'water-find',moth:'moth-coax',cap:'collection-find',shelf:'shelf-find',dust:'shelf-cleaning',home:'shelf-home',room:'shelf-home',rug:'home-rug-unroll',lamp:'home-lamp-approach',seat:'home-cover',blanket:'home-blanket-find',lights:'home-connect',cosy:'home-quiet'};
   assert.equal(body.dataset.phase,'lit');assert.equal(body.dataset.chapter,expected[previewMode]);
   assert.equal($('wake').hidden,true,'Preview must never show the wake button');
   assert.equal(writes.get('Interior Home').visible,['room','rug','lamp','seat','blanket','lights','cosy'].includes(previewMode),'Only room checkpoints reveal the earned interior');
   if(['dust','home'].includes(previewMode))assert.equal(writes.get('Cozy Shelf').visible,true);
   if(['home','room'].includes(previewMode)){
     assert.equal(writes.get('Cozy Shelf Dust').visible,false);assert.equal($('shelf-book').hidden,false);
     assert.equal(writes.get('Keepsake Box').position.x,-135);assert.equal(writes.get('Blue Bottle Cap').position.y,7);
   }
   for(const fn of events.keydown)fn({key:'P',shiftKey:true,target:$('visitor-name'),preventDefault(){}});
   assert.equal($('preview-menu').hidden,false);
   for(const fn of events.keydown)fn({key:'Escape',preventDefault(){}});
   assert.equal($('preview-menu').hidden,true);
   for(const fn of events.keydown)fn({key:'P',shiftKey:true,target:{tagName:'INPUT'},preventDefault(){}});
   assert.equal($('preview-menu').hidden,true,'Typing a name must not open preview');
   await $('preview-dust').onclick();await until(()=>body.dataset.chapter==='shelf-cleaning');
   assert.equal(writes.get('Cozy Shelf Dust').visible,true,'Repeated jump restores dust');
   await $('preview-home').onclick();await advance(.2);
   assert.equal(writes.get('Cozy Shelf Dust').visible,false);
   assert.equal(body.dataset.chapter,'shelf-home');
   await $('preview-room').onclick();assert.equal(writes.get('Interior Home').visible,true);
   await $('preview-water').onclick();await advance(.2);
   assert.equal(writes.get('Interior Home').visible,false,'A new task must hide the room shell again');
   assert.equal(writes.get('Robot Portrait Camera').position.x,200,'A story task must restore the camera used by cursor lighting');
   assert.equal(body.dataset.chapter,'water-find');assert.equal(writes.get('Cozy Shelf').visible,false);
   assert.equal(writes.get('Blue Bottle Cap').visible,false);assert.equal(writes.get('Keepsake Box').visible,false);
   await advance(10);assert.equal(body.dataset.chapter,'water-find','Old chapter dialogue must not continue after a jump');
   await $('preview-restart').onclick();await advance(.1);
   assert.equal(body.dataset.phase,'boot');assert.equal(body.dataset.chapter,'waiting');assert.equal($('wake').hidden,false);
   assert.equal(reloads,0,'Embedded play frame must stay configured');
   console.log('PASS: preview '+previewMode+', shortcut, repeated jumps, cleanup and restart');return;
 }
 const verticalVanishingPoint=project(0,1e9,0);
 assert(Math.abs(verticalVanishingPoint.x-640)<1,'Camera roll must center the vertical vanishing point');
 for(const [x,y,z] of [[145,4,75],[-135,20,95],[0,120,0]]){
   const p=project(x,y,z),world=context.window.testPointAtHeight(p.x,p.y,y);
   assert(Math.hypot(world.x-x,world.y-y,world.z-z)<.001,'Screen and world projections must stay aligned');
 }
 await advance(2);assert.equal(writes.get('Robot').visible,true,'Prewarm the model underneath the opaque opening overlay');assert.equal(writes.get('Chapter One Plant').visible,false);assert.equal(writes.get('Chapter One Seed').visible,false);
 const idleUpdates=updateCount;await advance(2);assert.equal(updateCount,idleUpdates,'Sleeping pose must not resend unchanged scene properties');
 $('wake').onclick();await advance(2);$('wake').onclick();await advance(2);
 assert.equal(body.dataset.phase,'name');$('visitor-name').value='Alex';$('name-form').onsubmit({preventDefault(){}});
 await until(()=>body.dataset.phase==='search');assert.equal($('objective').hidden,false);
 $('switch').onclick({detail:1});assert.equal(body.dataset.phase,'search','A click must not substitute for pulling the cord');
 $('switch').onpointerdown({pointerId:40,button:0,clientY:250,currentTarget:$('switch')});
 for(const fn of events.pointermove)fn({pointerId:40,clientX:1050,clientY:300});
 for(const fn of events.pointercancel)fn({pointerId:40});
 assert.equal(body.dataset.phase,'search','Cancelled cord pull must not turn on the lamp');
 $('switch').onpointerdown({pointerId:41,button:0,clientY:250,currentTarget:$('switch')});
 for(const fn of events.pointermove)fn({pointerId:41,clientX:1050,clientY:290});
 const beforeLight=updateCount;for(const fn of events.pointerup)fn({pointerId:41});assert.equal(updateCount,beforeLight,'The switch must not trigger first-render scene updates');assert.equal(writes.get('Robot').visible,true);
 await until(()=>body.dataset.chapter==='play');assert.equal($('pet').hidden,false);assert.equal(writes.get('Robot').rotation.y,11,'The whole robot must face the viewer');
 await advance(4);
 const headTarget=project(0,310,80);for(const fn of events.pointermove)fn({clientX:headTarget.x,clientY:headTarget.y});await advance(.4);
 assert(Math.abs(writes.get('Robot Arm Pivot 1').rotation.z)<2,'Hovering near his head must not raise an arm');
 assert(Math.abs(writes.get('Robot Head Pivot').rotation.z)<2,'Hovering must not add the old head tilt');
 for(const fn of events.pointermove)fn({clientX:1280,clientY:260});await advance(.7);
 assert(Math.abs(writes.get('Robot Head Pivot').rotation.y)<5,'Idle gaze should not follow the cursor outside object searches');
 $('pet').onclick();
 for(const fn of events.pointermove)fn({clientX:0,clientY:0});await advance(.6);
 const speakingHead={...writes.get('Robot Head Pivot').rotation};
 assert(Math.abs(speakingHead.y)<2,'Milo must face the user while speaking');
 for(const fn of events.pointermove)fn({clientX:1280,clientY:720});await advance(.5);
 const stillSpeakingHead=writes.get('Robot Head Pivot').rotation;
 assert(Math.abs(stillSpeakingHead.y-speakingHead.y)<2,'Mouse motion must not turn his head during speech');
 assert(Math.abs(stillSpeakingHead.x)<6,'Speaking must hold eye contact rather than look down at the cursor');
 await advance(3);
 assert(Math.abs(writes.get('Robot Head Pivot').rotation.y)<5,'After speech Milo should return to his idle pose outside searches');
 for(const fn of events.pointermove)fn({clientX:640,clientY:260});await advance(3);
 for(const fn of events.pointermove)fn({clientX:0,clientY:0});await advance(.02);
 for(const fn of events.pointermove)fn({clientX:1280,clientY:720});
 const initialHandTop=parseFloat($('five').style.top);
 $('five').onclick();await advance(1);
 assert.match($('dialogue').textContent,/D/,'A deliberate high five must override the startled reaction');
 assert(writes.get('Robot Arm Pivot 1').rotation.z>115,'Hand should rise and hold, rather than wave');
 assert(writes.get('Arm 1 Finger 1').scale.y>1.7,'Fingers should open for a high five');
 assert(parseFloat($('five').style.top)<initialHandTop-100,'The click target must follow the raised palm');
 for(const fn of events.pointermove)fn({clientX:0,clientY:0});await advance(.2);
 assert(writes.get('Robot Arm Pivot 1').rotation.z>115,'Fast cursor movement must not interrupt contact');
 await advance(2);assert.equal(writes.get('Arm 1 Finger 1').scale.y,1,'Fingers should return to rest');
 $('five').onclick();await advance(1);assert(writes.get('Robot Arm Pivot 1').rotation.z>115,'High five should be repeatable');
 await advance(30);assert.equal(body.dataset.chapter,'play','The story must not cut off free interaction');
 const down={pointerId:7,button:0,currentTarget:$('arm-right'),clientX:720,clientY:478};
 $('arm-right').onpointerdown(down);for(const fn of events.pointermove)fn({pointerId:7,clientX:790,clientY:260});await advance(.2);
 assert(writes.get('Robot Arm Pivot 1').rotation.z>60,'Dragging must lift the right arm');
 for(const fn of events.pointerup)fn({pointerId:7});$('five').onclick();await advance(.2);
 assert(writes.get('Arm 1 Finger 1').scale.y===1,'Releasing a drag must not trigger a high five');
 await advance(1.5);assert(Math.abs(writes.get('Robot Arm Pivot 1').rotation.z)<5,'Released arm should settle gently');
 $('arm-left').onpointerdown({pointerId:8,button:0,currentTarget:$('arm-left'),clientX:560,clientY:478});
 for(const fn of events.pointermove)fn({pointerId:8,clientX:450,clientY:260});await advance(.2);
 assert(writes.get('Robot Arm Pivot -1').rotation.z< -50,'Dragging must lift the left arm');
 for(const fn of events.pointercancel)fn({pointerId:8});await advance(1.5);
 assert(Math.abs(writes.get('Robot Arm Pivot -1').rotation.z)<5,'Cancelled dragging should release the arm');
 $('choice').onclick();await until(()=>body.dataset.chapter==='finding');
 for(const fn of events.pointermove)fn({clientX:0,clientY:0});await advance(30);
 assert.equal(writes.get('Chapter One Seed').visible,false,'Waiting must not automatically brighten the seed');
  for(const fn of events.pointermove)fn({clientX:640,clientY:0});await advance(.7);
 assert(writes.get('Robot Head Pivot').rotation.x< -28,'A cursor above Milo must make him visibly look up');
 for(const fn of events.pointermove)fn({clientX:640,clientY:720});await advance(.7);
 assert(writes.get('Robot Head Pivot').rotation.x>22,'A cursor below Milo must make him look down');
 for(const fn of events.pointermove)fn({clientX:0,clientY:260});await advance(.7);
 assert(writes.get('Robot Head Pivot').rotation.y< -15,'He must clearly follow a cursor to his left');
 for(const fn of events.pointermove)fn({clientX:1280,clientY:260});await advance(.7);
 assert(writes.get('Robot Head Pivot').rotation.y>50,'He must clearly follow a cursor to his right');
 for(const fn of events.pointermove)fn({clientX:640,clientY:260});await advance(3);
 await checkLightFind('seed','Chapter One Seed');assert.equal(shaderMaterials.get('Seed Shell').transparent,false,'Search lighting must keep the seed opaque');$('seed').onclick();assert.equal(body.dataset.chapter,'carrying');assert(Number.isFinite(writes.get('Chapter One Seed').scale.x));await $('soil').onclick();assert.equal(writes.get('Chapter One Seed').visible,false);
 await until(()=>body.dataset.chapter==='growing');await advance(2);
 assert.equal($('growth').attributes['aria-valuenow'],'0','Growth must wait for light');
 $('soil').onclick();await advance(2);const litProgress=$('growth').attributes['aria-valuenow'];assert(Number(litProgress)>0);
 $('soil').onclick();for(const fn of events.pointermove)fn({clientX:0,clientY:0});await advance(2);
 assert.equal($('growth').attributes['aria-valuenow'],litProgress,'Growth must stop when the light moves away');
 $('soil').onclick();await until(()=>body.dataset.chapter==='grown',20);
 assert.equal($('growth').hidden,true);assert.equal($('objective').hidden,true);
 await until(()=>!$('choice').hidden);$('choice').onclick();assert.equal(body.dataset.chapter,'resting');
 await until(()=>!$('choice').hidden);const seated=writes.get('Robot Leg Pivot 1').position.y;
 $('choice').onclick();await advance(9);assert.equal(body.dataset.chapter,'end');
 assert.equal(writes.get('Robot Leg Pivot 1').position.y,seated,'Ending must retain seated pose');
 assert.equal(writes.get('Chapter One Plant').visible,true);assert.equal(writes.get('Chapter One Plant').scale.y,1);
 await until(()=>!$('choice').hidden&&$('choice').textContent==='Keep him company');$('choice').onclick();
 await until(()=>body.dataset.chapter==='name-search');assert.equal($('back-name').hidden,true,'Name cannot be read from the front');
 if(process.argv[2]==='nickname'){
   $('turn-milo').onpointerdown({pointerId:10,button:0,currentTarget:$('turn-milo'),clientX:640,clientY:400});
   for(const fn of events.pointermove)fn({pointerId:10,clientX:865,clientY:400});
   for(const fn of events.pointerup)fn({pointerId:10});
 }else for(let i=0;i<(process.argv[2]==='direct'?12:4);i++)$('turn-milo').onkeydown({key:'ArrowRight',preventDefault(){}});
 await advance(1.5);assert.equal(writes.get('Robot Head Pivot').rotation.y,0,'Name search must keep the back stamp steady');assert.equal($('back-name').hidden,false,'Rotating Milo should reveal the back stamp');
 $('back-name').onclick();await until(()=>!$('answers').hidden);
 const nickname=process.argv[2]==='nickname';
 if(nickname){
   $('answers').children.find(b=>b.textContent==='Choose a name').onclick();assert.equal(body.dataset.chapter,'nickname');
   $('robot-name').value='   ';$('nickname-form').onsubmit({preventDefault(){}});assert.equal(body.dataset.chapter,'nickname','Empty name should not advance');
   $('robot-name').value='  Pip  ';$('nickname-form').onsubmit({preventDefault(){}});
 }else $('answers').children.find(b=>b.textContent==='Yes. You’re Milo.').onclick();
 assert.equal(body.dataset.chapter,'name-happy');await advance(.6);assert(writes.get('Robot Arm Pivot 1').rotation.z>20,'Naming should trigger a happy gesture');
 await until(()=>body.dataset.chapter==='named-play');assert.equal(savedNames.get('milo-chosen-name'),nickname?'Pip':'Milo');
 assert.equal(writes.get('Robot Leg Pivot 1').position.y,100,'Milo should stand before turning');
 $('choice').onclick();await until(()=>body.dataset.chapter==='water-find');
 await advance(.2);
 for(const width of [1280,390]){
   context.innerWidth=width;for(const fn of events.resize)fn();await advance(.2);
   const can=writes.get('Watering Can').position;
   assert(Math.abs(parseFloat($('water-can').style.left)-width*.86)<1,'The can must stay on the right at every screen width');
   assert(Math.hypot(can.x,can.z)>240,'The can must sit outside Milo’s existing pool of light');
 }
 context.innerWidth=1280;for(const fn of events.resize)fn();await advance(.2);
 traceHead=true;
 await checkLightFind('water-can','Watering Can');assert.equal(writes.get('Garden Flower').visible,false);
 // First try a cancelled drag: it must not silently hand over the can.
 $('water-can').onpointerdown({pointerId:12,button:0,currentTarget:$('water-can'),clientX:300,clientY:480});
 for(const fn of events.pointermove)fn({pointerId:12,clientX:420,clientY:420});
 await advance(3);
 assert(Math.abs(writes.get('Robot Head Pivot').rotation.y)<70,'Picking up the can after naming must not unwind whole turns through Milo’s head');
 for(const fn of events.pointercancel)fn({pointerId:12,type:'pointercancel'});
 assert.equal(body.dataset.chapter,'water-find','Cancelled pickup should leave the can available');
 await advance(.5);
 const direct=process.argv[2]==='direct';
 if(direct||nickname){
   // Drag to Milo's anatomical right hand, then guide the held can separately.
   const x=parseFloat($('water-can').style.left),y=parseFloat($('water-can').style.top);
   $('water-can').onpointerdown({pointerId:13,button:0,currentTarget:$('water-can'),clientX:x,clientY:y});
   for(const fn of events.pointermove)fn({pointerId:13,clientX:x+10,clientY:y});await advance(.1);
   const hx=parseFloat($('water-hand').style.left),hy=parseFloat($('water-hand').style.top);
   assert(hx<640,'The handoff target must be on Milo’s right, the viewer’s left');
   for(const fn of events.pointermove)fn({pointerId:13,clientX:hx,clientY:hy});
   for(const fn of events.pointerup)fn({pointerId:13,clientX:hx,clientY:hy,type:'pointerup'});
 }else{
   $('water-can').onclick();assert.equal(body.dataset.chapter,'water-carry');$('water-hand').onclick();
 }
 assert.equal(body.dataset.chapter,'water-aim');assert.equal($('objective').children.at(-1),'Water the plant','The same watering objective must continue through hand guidance');
 assert.equal($('choice').hidden,true,'Watering must not require an aim button');
 await advance(6);
 traceHead=false;
 assert(pickupHead.every(y=>Math.abs(y)<80),'Head rotation must remain bounded throughout pickup and handoff');
 assert(pickupHead.every((y,i)=>!i||Math.abs(y-pickupHead[i-1])<60),'Pickup must not make a large rotational jump');
 assert.equal(writes.get('Water Drops').visible,false,'Taking the can must not start pouring');
 assert.equal(writes.get('Watering Can').rotation.y,180,'The spout must face outward from his right hand');
 assert(writes.get('Robot Arm Pivot -1').rotation.z< -35,'Milo’s right arm must hold the can');
 assert(Math.abs(writes.get('Robot Arm Pivot 1').rotation.z)<5,'The other arm must remain free');
 const beforeTurn=writes.get('Robot').rotation.y;
 assert.equal(writes.get('Watering Can').rotation.z,0,'He must hold the can upright until guided');
 assert.equal(body.dataset.chapter,'water-aim','Watering must wait for user guidance');
 assert.equal(writes.get('Garden Flower').visible,false);
 $('water-can').onkeydown({key:'ArrowUp',preventDefault(){}});await advance(.5);
 assert.equal(writes.get('Water Drops').visible,false,'Guiding away from the plant must not spill onto Milo');
 $('water-can').onkeydown({key:'ArrowDown',preventDefault(){}});await advance(.5);
 if(nickname||direct){
   const x=parseFloat($('water-can').style.left),y=parseFloat($('water-can').style.top);
   $('water-can').onpointerdown({pointerId:14,button:0,currentTarget:$('water-can'),clientX:x,clientY:y});
   const plant=project(145,direct?4:40,75);
   for(const fn of events.pointermove)fn({pointerId:14,clientX:x+(plant.x-x)*.35,clientY:y+(plant.y-y)*.35});await advance(.3);
   const partialTurn=writes.get('Robot').rotation.y-beforeTurn;
   assert(partialTurn>2&&partialTurn<100,'Milo must turn progressively during the drag');
   assert.equal(writes.get('Water Drops').visible,false,'A partial reach must not pour onto his body');
   for(const fn of events.pointermove)fn({pointerId:14,clientX:plant.x,clientY:plant.y});
   for(const fn of events.pointerup)fn({pointerId:14,clientX:plant.x,clientY:plant.y,type:'pointerup'});
 }else for(let i=0;i<3;i++)$('water-can').onkeydown({key:'ArrowDown',preventDefault(){}});
 await advance(2);
 assert(writes.get('Robot').rotation.y-beforeTurn>70,'Guiding the right hand must visibly turn Milo’s body toward the plant');
 const headBefore={...writes.get('Robot Head Pivot').rotation};
 for(const fn of events.pointermove)fn({clientX:0,clientY:0});await advance(.5);
 assert(Math.abs(writes.get('Robot Head Pivot').rotation.y-headBefore.y)<2,'Watering gaze should stay on the plant rather than the cursor');
 assert.equal(writes.get('Water Drops').visible,true,'Guiding over the soil should start pouring');
 assert(Math.abs(writes.get('Watering Can').rotation.y)<.01,'Pouring must not reverse the spout toward his leg');
 await until(()=>body.dataset.chapter==='water-bloom',12);
 assert.equal(writes.get('Water Drops').visible,false);assert.equal(writes.get('Garden Flower').visible,true);
 await until(()=>body.dataset.chapter==='water-done');
 assert(writes.get('Flower Petal 0').scale.x>.95,'Petals must visibly open after watering');
 await until(()=>body.dataset.chapter==='moth-coax');await until(()=>!$('moth-guide').hidden);assert.equal($('objective').children.at(-1),'Bring the moth to '+(nickname?'Pip':'Milo'));
 $('moth-guide').onclick();await until(()=>body.dataset.chapter==='moth-landed');
 assert(writes.get('Robot Arm Pivot 1').rotation.z>50,'The offered hand must stay raised as the moth lands');
 await until(()=>!$('answers').hidden);
 if(nickname)$('answers').children.find(b=>b.textContent==='Guide it to the plant').onclick();
 else{
   $('answers').children.find(b=>b.textContent==='Stay very still').onclick();await advance(2);
   assert.equal(body.dataset.chapter,'moth-stay');assert(writes.get('Robot Arm Pivot 1').rotation.z>50);
   await until(()=>!$('choice').hidden&&$('choice').textContent==='Let it rest on the plant');$('choice').onclick();
 }
 await until(()=>body.dataset.chapter==='garden-end');await advance(.2);
 assert.equal(writes.get('Garden Moth').visible,true);assert.equal(writes.get('Garden Moth').position.y,68);
 assert.equal(writes.get('Chapter One Plant').visible,true);assert.equal(writes.get('Garden Moth').position.z,86,'The perched moth must sit in front of the blossom');
 await until(()=>!$('choice').hidden&&$('choice').textContent==='Look a little further');
 $('choice').onclick();await until(()=>body.dataset.chapter==='collection-find');
 assert.equal($('objective').children.at(-1),'Find what '+(nickname?'Pip':'Milo')+' sees');
 await checkLightFind('collect-cap','Blue Bottle Cap');assert.equal(writes.get('Keepsake Box').visible,false);
 $('collect-cap').onpointerdown({pointerId:20,button:0,currentTarget:$('collect-cap'),clientX:300,clientY:480});
 for(const fn of events.pointermove)fn({pointerId:20,clientX:420,clientY:400});
 for(const fn of events.pointercancel)fn({pointerId:20});
 assert.equal(body.dataset.chapter,'collection-find','Cancelled cap drag must leave it available');
 await advance(.5);
 if(nickname){
   $('collect-cap').onpointerdown({pointerId:21,button:0,currentTarget:$('collect-cap'),clientX:300,clientY:480});
   const x=parseFloat($('five').style.left),y=parseFloat($('five').style.top);
   for(const fn of events.pointermove)fn({pointerId:21,clientX:x,clientY:y});
   for(const fn of events.pointerup)fn({pointerId:21,clientX:x,clientY:y});
 }else{$('collect-cap').onclick();assert.equal(body.dataset.chapter,'collection-carry');$('collect-hand').onclick();}
 assert.equal(body.dataset.chapter,'collection-reflex');await advance(.8);
 assert(writes.get('Collection Hatch Lid Pivot').rotation.x< -70,'The old collection reflex must visibly open his hatch');
 await until(()=>!$('answers').hidden&&body.dataset.chapter==='collection-notice');
 assert.equal(writes.get('Blue Bottle Cap').visible,true,'His first find must never be discarded');
 $('answers').children.find(b=>b.textContent===(nickname?'You can choose.':'Of course.')).onclick();
 assert.equal(body.dataset.chapter,'collection-box-find');await checkLightFind('collect-box','Keepsake Box');
 $('collect-box').onpointerdown({pointerId:22,button:0,currentTarget:$('collect-box'),clientX:300,clientY:480});
 for(const fn of events.pointermove)fn({pointerId:22,clientX:420,clientY:400});
 for(const fn of events.pointercancel)fn({pointerId:22});
 assert.equal(body.dataset.chapter,'collection-box-find','Cancelled box drag should reset safely');await advance(.5);
 $('collect-box').onclick();assert.equal(body.dataset.chapter,'collection-box-carry');
 if(nickname||direct){
   const x=parseFloat($('collect-place').style.left),y=parseFloat($('collect-place').style.top);
   $('collect-box').onpointerdown({pointerId:23,button:0,currentTarget:$('collect-box'),clientX:300,clientY:480});
   for(const fn of events.pointermove)fn({pointerId:23,clientX:x,clientY:y});
   for(const fn of events.pointerup)fn({pointerId:23,clientX:x,clientY:y});
 }else $('collect-place').onclick();
 await until(()=>body.dataset.chapter==='collection-offer');await advance(8);
 assert.equal(body.dataset.chapter,'collection-offer','Milo must hold the cap until the user takes it');
 assert.equal($('collect-cap').hidden,false);
 assert.notEqual(writes.get('Blue Bottle Cap').position.x,-135,'The cap must not automatically enter the box');
 // Cancelled retrieval must return the cap to his hand, not the dark floor.
 $('collect-cap').onpointerdown({pointerId:24,button:0,currentTarget:$('collect-cap'),clientX:600,clientY:450});
 for(const fn of events.pointermove)fn({pointerId:24,clientX:400,clientY:500});
 for(const fn of events.pointercancel)fn({pointerId:24});await advance(.5);
 assert.equal(body.dataset.chapter,'collection-offer');
 if(nickname||direct){
   $('collect-cap').onpointerdown({pointerId:25,button:0,currentTarget:$('collect-cap'),clientX:600,clientY:450});
   const target=project(-135,7,80);
   for(const fn of events.pointermove)fn({pointerId:25,clientX:target.x,clientY:target.y});
   assert.equal(body.dataset.chapter,'collection-put-carry');
   for(const fn of events.pointerup)fn({pointerId:25,clientX:target.x,clientY:target.y});
 }else{$('collect-cap').onclick();assert.equal(body.dataset.chapter,'collection-put-carry');$('collect-place').onclick();}
 await until(()=>body.dataset.chapter==='collection-end');await advance(.1);
 assert.equal(writes.get('Keepsake Box').position.x,-135);assert.equal(writes.get('Blue Bottle Cap').position.x,-135);
 assert.equal(writes.get('Collection Hatch Lid Pivot').rotation.x,0);assert.equal(writes.get('Garden Flower').visible,true);assert.equal(writes.get('Garden Moth').visible,true);
 await until(()=>!$('pet').hidden);await advance(5);
 assert.equal(body.dataset.chapter,'collection-end');
 assert.equal($('choice').textContent,'Look a little further','The next find must replace the removed second sitting choice');
 assert.equal($('dialogue').hidden,true,'The closing dialogue should clear without another sit');
 for(const side of [-1,1])assert.equal(writes.get('Robot Leg Pivot '+side).position.y,100,'Milo must remain standing after storing his first keepsake');
 $('collect-cap').onclick();await advance(2);assert.match($('dialogue').textContent,/My first one/);
 assert.equal(writes.get('Blue Bottle Cap').visible,true,'Inspecting the keepsake must preserve it');
 await advance(20);assert.equal(body.dataset.chapter,'collection-end','The story should end quietly with the first keepsake');assert.equal($('choice').textContent,'Look a little further','The shelf should be the next chapter');
 // A fixed room object: discovery, cleaning and the ending share one anchor.
 $('choice').onclick();await until(()=>body.dataset.chapter==='shelf-find');await advance(.2);
 await checkLightFind('shelf-find','Cozy Shelf');
 assert.equal(writes.get('Cozy Shelf Dust').visible,false,'Dust must not glow outside the cursor beam during the search');
 const fixedShelfPosition={...writes.get('Cozy Shelf').position},fixedShelfScale={...writes.get('Cozy Shelf').scale};
 assert.equal(writes.get('Interior Home').visible,false,'Cursor searches must never expose the room');
 $('shelf-find').onclick();await until(()=>body.dataset.chapter==='shelf-cleaning');await advance(3);
 assert.equal(writes.get('Cozy Shelf Dust').visible,true);
 assert.deepEqual(writes.get('Cozy Shelf').position,fixedShelfPosition,'Discovering must not move the shelf');
 assert.deepEqual(writes.get('Cozy Shelf').scale,fixedShelfScale,'Discovering must not enlarge the shelf');
 const shelfProject=context.window.testShelfPoint,dustLayout=context.window.testDustLayout();
 const first=shelfProject(dustLayout[0].x,dustLayout[0].y,dustLayout[0].z);
 for(const fn of events.pointermove)fn({pointerId:30,clientX:first.x,clientY:first.y});await advance(.3);
 assert.equal(writes.get('Shelf Dust 0')?.material,undefined,'Hovering alone must not clean the shelf');
 $('shelf-clean').onpointerdown({pointerId:30,button:0,currentTarget:$('shelf-clean'),clientX:first.x-22,clientY:first.y});
 assert.equal($('shelf-cloth').hidden,false,'Dragging must show the cloth under the pointer');
 for(const fn of events.pointermove)fn({pointerId:30,clientX:first.x+22,clientY:first.y});
 assert($('shelf-dust-puffs').children.length>0,'Removing dust must produce visible dust feedback');
 for(const fn of events.pointercancel)fn({pointerId:30});
 assert(writes.get('Shelf Dust 0').material.layers[0].alpha<85,'A stroke must expose wood only where it passes');
 assert.equal(writes.get('Shelf Dust 25')?.material,undefined,'An untouched upright must retain its dust');
 await advance(10);assert.equal(body.dataset.chapter,'shelf-cleaning','Dust must not fade away on a timer');
 context.innerHeight=648;for(const fn of events.resize)fn();await advance(.1);
 if(nickname||direct){
   $('shelf-clean').onpointerdown({pointerId:31,button:0,currentTarget:$('shelf-clean'),clientX:first.x-20,clientY:first.y});
   for(const d of dustLayout){const p=shelfProject(d.x,d.y,d.z);for(const x of [p.x-22,p.x+22])for(const fn of events.pointermove)fn({pointerId:31,clientX:x,clientY:p.y});}
   for(const fn of events.pointerup)fn({pointerId:31});
 }else for(let i=0;i<52&&body.dataset.chapter==='shelf-cleaning';i++)$('shelf-clean').onkeydown({key:'ArrowRight',preventDefault(){}});
 assert.equal(body.dataset.chapter,'shelf-ready','Both scrubbing and keyboard strokes must clean every region');
 assert.equal(writes.get('Cozy Shelf Dust').visible,false);
 assert.equal($('shelf-cloth').hidden,true,'Completing the cleaning must clear the cloth');
 for(let i=0;i<dustLayout.length;i++)assert.equal(writes.get('Shelf Dust '+i).visible,false,'Cleaned dust must stay gone');
 // The shelf is cleaned where it stands, without a carry/place stage.
 assert.equal($('shelf-clean').hidden,true);
 await until(()=>body.dataset.chapter==='shelf-home');await advance(.3);
 assert.deepEqual(writes.get('Cozy Shelf').position,fixedShelfPosition,'Cleaning must not slide the shelf across the room');
 assert.deepEqual(writes.get('Cozy Shelf').scale,fixedShelfScale);
 assert.equal(writes.get('Interior Home').visible,false,'Completing a task must not reveal unearned room geometry');
 assert.equal(writes.get('Cozy Shelf').position.x,-210);assert.equal(writes.get('Cozy Shelf').position.y,0);assert.equal(writes.get('Cozy Shelf').scale.x,1.35);
 assert.equal(writes.get('Cozy Shelf Dust').visible,false);assert.equal(writes.get('Blue Bottle Cap').visible,true);assert.equal(writes.get('Garden Moth').visible,true);
 assert.equal([...objects.keys()].filter(name=>name==='Cozy Shelf Book').length,1,'The shelf must already contain exactly one book');
 context.innerWidth=390;for(const fn of events.resize)fn();await advance(.2);
 assert(shelfProject(-55,60,0).x>0&&shelfProject(55,60,0).x<390,'The placed shelf must remain fully on-screen on mobile');
 context.innerWidth=1280;for(const fn of events.resize)fn();await advance(.2);
 $('shelf-book').onclick();await advance(2);assert.match($('dialogue').textContent,/read it together/);
 await advance(20);assert.equal(body.dataset.chapter,'home-box','The clean shelf must lead into building the home');
 console.log('PASS: arm dragging, high five, planting, '+(nickname?'nickname':'Milo name')+', turning, watering, flower, moth, blue cap, keepsake box, local dust wiping and shelf home');
})().catch(error=>{console.error(error);process.exitCode=1});
