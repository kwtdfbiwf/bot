const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const html=fs.readFileSync('scene/opening.html','utf8');
let now=0,rafs=[],queue=[],timerId=0,focused=null;
const elements=new Map(),objects=new Map(),writes=new Map(),events={};
class Element{
 constructor(id){this.id=id;this.hidden=true;this.disabled=false;this.value='';this.textContent='';this.style={setProperty(k,v){this[k]=v}};this.dataset={};this.attributes={};this.children=[];this.classList={add(){},remove(){},toggle(){}};this.firstElementChild={style:{}};}
 setAttribute(k,v){this.attributes[k]=v} append(...v){this.children.push(...v)} replaceChildren(){this.children=[]}
 focus(){focused=this;this.onfocus?.()} blur(){if(focused===this)focused=null}
 getBoundingClientRect(){const x=this.id==='switch'?1050:243,y=this.id==='switch'?281:461;return{left:x-22,top:y-34,width:44,height:68}}
}
for(const m of html.matchAll(/id="([^"]+)"/g))elements.set(m[1],new Element(m[1]));
const body=new Element('body'),root=new Element('root');
const spline={ready:Promise.resolve(),async findObjectByName(name){if(!objects.has(name))objects.set(name,{id:name,name,position:{x:0,y:name.startsWith('Robot Leg')?100:102,z:0}});return objects.get(name)},async updateObject(id,props){writes.set(id,{...(writes.get(id)||{}),...props});return true},async createObject(type,props){const o={id:props.name,...props};objects.set(o.id,o);writes.set(o.id,props);return o}};
const context={console,spline,Math,Promise,Error,document:{body,documentElement:root,hidden:false,getElementById:id=>elements.get(id),createElement:()=>new Element('span'),createTextNode:text=>text},innerWidth:1280,innerHeight:720,performance:{now:()=>now},matchMedia:()=>({matches:false}),location:{reload(){}},requestAnimationFrame:fn=>{rafs.push(fn)},setTimeout:(fn,delay=0)=>{const id=++timerId;queue.push({id,at:now+delay,fn});return id},clearTimeout:id=>{queue=queue.filter(t=>t.id!==id)},window:{addEventListener:(name,fn)=>{(events[name]??=[]).push(fn)}}};
vm.createContext(context);vm.runInContext(html.split('<script>')[1].split('</script>')[0],context);
const $=id=>elements.get(id);
async function advance(seconds){for(let i=0;i<Math.ceil(seconds*60);i++){now+=1000/60;for(let j=0;j<8;j++)await Promise.resolve();const due=queue.filter(t=>t.at<=now);queue=queue.filter(t=>t.at>now);due.forEach(t=>t.fn());const frames=rafs;rafs=[];frames.forEach(fn=>fn(now));}for(let j=0;j<12;j++)await Promise.resolve();}
async function until(predicate,seconds=40){for(let i=0;i<seconds*10;i++){if(predicate())return;await advance(.1)}throw Error('Timed out at phase '+body.dataset.phase+' / '+body.dataset.chapter)}
(async()=>{
 await advance(2);assert.equal(writes.get('Robot').visible,false);assert.equal(writes.get('Chapter One Plant').visible,false);assert.equal(writes.get('Chapter One Seed').visible,false);
 $('wake').onclick();await advance(2);$('wake').onclick();await advance(2);
 assert.equal(body.dataset.phase,'name');$('visitor-name').value='Alex';$('name-form').onsubmit({preventDefault(){}});
 await until(()=>body.dataset.phase==='search');assert.equal($('objective').hidden,false);
 $('switch').onclick();assert.equal(writes.get('Robot').visible,true);
 await until(()=>body.dataset.chapter==='play');assert.equal($('pet').hidden,false);
 await advance(4);
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
 $('choice').onclick();await until(()=>body.dataset.chapter==='finding');
 assert.equal(writes.get('Chapter One Seed').visible,true);$('seed').onclick();assert.equal(body.dataset.chapter,'carrying');assert(Number.isFinite(writes.get('Chapter One Seed').scale.x));await $('soil').onclick();assert.equal(writes.get('Chapter One Seed').visible,false);
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
 console.log('PASS: opening → light → play → seed → planting → light-driven growth → seated ending');
})().catch(error=>{console.error(error);process.exitCode=1});
