const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const html=fs.readFileSync('scene/opening.html','utf8');
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
const spline={ready:Promise.resolve(),async createCustomMaterial(factory){return factory(three)},async setMaterial(id,m){shaderMaterials.set(id,m);return m},async findObjectByName(name){if(!objects.has(name))objects.set(name,{id:name,name,position:{x:0,y:name.startsWith('Robot Leg')?100:102,z:0}});return objects.get(name)},async updateObject(id,props){updateCount++;if(traceHead&&id==='Robot Head Pivot'&&Number.isFinite(props.rotation?.y))pickupHead.push(props.rotation.y);writes.set(id,merge(writes.get(id)||{},props));return true},async createObject(type,props){const o={id:props.name,...props};objects.set(o.id,o);writes.set(o.id,props);return o}};
const context={console,spline,Math,Promise,Error,localStorage:{getItem:k=>savedNames.get(k),setItem:(k,v)=>savedNames.set(k,v)},document:{body,documentElement:root,hidden:false,getElementById:id=>elements.get(id),createElement:()=>new Element('span'),createTextNode:text=>text},innerWidth:1280,innerHeight:720,performance:{now:()=>now},matchMedia:()=>({matches:false}),location:{reload(){}},requestAnimationFrame:fn=>{rafs.push(fn)},setTimeout:(fn,delay=0)=>{const id=++timerId;queue.push({id,at:now+delay,fn});return id},clearTimeout:id=>{queue=queue.filter(t=>t.id!==id)},window:{addEventListener:(name,fn)=>{(events[name]??=[]).push(fn)}}};
vm.createContext(context);vm.runInContext(html.split('<script>')[1].split('</script>')[0].replace('function screenPoint(', 'window.testProject=screenPoint;window.testPointAtHeight=pointAtHeight;function screenPoint('),context);
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
 const beforeLight=updateCount;$('switch').onclick();assert.equal(updateCount,beforeLight,'The switch must not trigger first-render scene updates');assert.equal(writes.get('Robot').visible,true);
 await until(()=>body.dataset.chapter==='play');assert.equal($('pet').hidden,false);
 await advance(4);
 for(const fn of events.pointermove)fn({clientX:1280,clientY:260});await advance(.7);
 assert(Math.abs(writes.get('Robot Head Pivot').rotation.y)<5,'Idle gaze should not follow the cursor outside object searches');
 $('pet').onclick();
 for(const fn of events.pointermove)fn({clientX:0,clientY:0});await advance(.6);
 const speakingHead={...writes.get('Robot Head Pivot').rotation};
 assert(Math.abs(speakingHead.y-25.1)<2,'Milo must face the user while speaking');
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
 assert.equal(body.dataset.chapter,'water-aim');
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
 assert(writes.get('Robot').rotation.y-beforeTurn>90,'Guiding the right hand must visibly turn Milo’s body toward the plant');
 const headBefore={...writes.get('Robot Head Pivot').rotation};
 for(const fn of events.pointermove)fn({clientX:0,clientY:0});await advance(.5);
 assert(Math.abs(writes.get('Robot Head Pivot').rotation.y-headBefore.y)<2,'Watering gaze should stay on the plant rather than the cursor');
 assert.equal(writes.get('Water Drops').visible,true,'Guiding over the soil should start pouring');
 assert(Math.abs(writes.get('Watering Can').rotation.y)<.01,'Pouring must not reverse the spout toward his leg');
 await until(()=>body.dataset.chapter==='water-bloom',12);
 assert.equal(writes.get('Water Drops').visible,false);assert.equal(writes.get('Garden Flower').visible,true);
 await until(()=>body.dataset.chapter==='water-done');
 assert(writes.get('Flower Petal 0').scale.x>.95,'Petals must visibly open after watering');
 await until(()=>body.dataset.chapter==='moth-coax');await until(()=>!$('moth-guide').hidden);
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
 assert.equal(writes.get('Garden Moth').visible,true);assert.equal(writes.get('Garden Moth').position.y,82);
 assert.equal(writes.get('Chapter One Plant').visible,true);
 await until(()=>!$('choice').hidden&&$('choice').textContent==='Look a little further');
 $('choice').onclick();await until(()=>body.dataset.chapter==='collection-find');
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
 await until(()=>body.dataset.chapter==='collection-end');await advance(.1);
 assert.equal(writes.get('Keepsake Box').position.x,-135);assert.equal(writes.get('Blue Bottle Cap').position.x,-135);
 assert.equal(writes.get('Collection Hatch Lid Pivot').rotation.x,0);assert.equal(writes.get('Garden Flower').visible,true);assert.equal(writes.get('Garden Moth').visible,true);
 await until(()=>!$('choice').hidden&&$('choice').textContent==='Sit with him');$('choice').onclick();await advance(3.2);
 assert.equal(body.dataset.chapter,'collection-rest');assert.equal(writes.get('Robot Leg Pivot 1').position.y,20);
 for(const fn of events.pointermove)fn({clientX:640,clientY:0});await advance(.7);
 assert(writes.get('Robot Head Pivot').rotation.x>0,'Resting Milo should keep his seated pose outside object searches');
 $('collect-cap').onclick();await advance(2);assert.match($('dialogue').textContent,/My first one/);
 assert.equal(writes.get('Blue Bottle Cap').visible,true,'Inspecting the keepsake must preserve it');
 await advance(20);assert.equal(body.dataset.chapter,'collection-rest','The story should end quietly with the first keepsake');assert.equal($('choice').hidden,true,'The removed fan chapter must not be offered');
 console.log('PASS: arm dragging, high five, planting, '+(nickname?'nickname':'Milo name')+', turning, watering, flower, moth, blue cap, keepsake box and collection ending');
})().catch(error=>{console.error(error);process.exitCode=1});
