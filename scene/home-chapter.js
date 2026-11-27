// Building a home. One clock and one pose owner; all placements are absolute.
const homeStates=()=>chapter.startsWith('home-');
let homeReady=false,homeEpoch=0,homeStage=0,homeObjects=[],homeLookup=new Map(),homePacks={};
let homeFind=null,homeDrag=null,homeSuppressUntil=0,homeMove=null,homeSitting=0,homeSitTarget=0;
let homeActor={x:0,y:0,z:0},homeProgress=0,homeRugAngle=-7,homeRugTarget=-7,homeLampProgress=0;
let homeFloorRadius=null,homeWallLight=null,homeRadiusTarget=0,homeLampOn=false,homeLightProgress=0;
let homeBoxPlaced=false,homeBlanketPlace='',homeSeatDust=[],homeLegs=[],homeAudio=null;
let homeBulbFlight=0,homeMothFlight=0,homeLitCount=-1,homeKeyboardHold=false,homeMothGarden=false,homeBulbGlow=null,homeLampPool=null;
let homeCushionAt={x:165,y:40,z:80},homeCushionFlight=null,homeBlanketAt={x:-210,y:17,z:-431},homeBlanketTween=null;
let homePoint={x:0,y:0,z:0};
const homeSeat={x:-335,y:0,z:155},homeShelfBox={x:-180,y:80,z:-25};
const homeSeatDustPoints=[];
for(const x of [-510,-445,-380])for(const z of [90,260])homeSeatDustPoints.push({x,y:109.4,z});
const homeDefinitions={
 rug:['Interior Fringed Rug',/^Interior (Round Woven Rug|Rug )/],
 lamp:['Interior Table Lamp',/^Interior (Lamp |Shade )/],
 cabinet:['Interior Bedside Cabinet',/^Interior (Cabinet |Bedside Book|Bedside Letter)/],
 bed:['Interior Daybed',/^Interior (Cot |Daybed |Pillow Seam)/],
 window:['Interior Window',/^Interior (Window |Triangular Window)/],
 garland:['Interior Bulb Garlands',/^Interior (Draped Cable |Golden Bulb |Bulb Socket )/],
 roll:['Home Rolled Rug',/^Home Rug Roll /],
 thread:['Home Loose Thread',/^Home Thread /],
 cable:['Home Lamp Cable',/^Home Cable /],
 cover:['Home Daybed Cover',/^Home Cover /],
 blanket:['Home Folded Blanket',/^Home Blanket /],
 connector:['Home Connector',/^Home Connector /],
 plug:['Home Loose Plug',/^Home Plug /],
 cord:['Home Garland Pull',/^Home Pull /],
 dust:['Home Seat Dust',/^Home Seat Dust /],
 slippers:['Interior Slippers',/^Interior Slipper /]
};
async function homeObject(name){
 if(!homeLookup.has(name)){const o=await spline.findObjectByName(name);if(!o)throw new Error('Missing home asset: '+name);homeLookup.set(name,o);}
 return homeLookup.get(name);
}
function homeWrite(name,props){const o=homeLookup.get(name);if(o)return update(o.id,props);return Promise.resolve();}
async function homePack(key,visible,searchOnly=false){
 const p=homePacks[key];if(!p)return;
 await Promise.all(p.members.map(o=>update(o.id,{visible:visible&&(!searchOnly||o.id!==p.root.id)&&(!/^(Interior Golden Bulb|Interior Bulb Socket) /.test(o.name)||Number(o.name.split(' ').at(-1))%2===0)})));
}
function homeAfter(seconds,fn){const token=homeEpoch;after(seconds,()=>{if(token===homeEpoch)fn();});}
function homeSay(lines,done){
 const token=homeEpoch,list=Array.isArray(lines)?lines:[lines];let index=0;
 function next(){if(token!==homeEpoch)return;if(index<list.length)speak(list[index++],next);else done?.();}next();
}
function homeChoices(a,b){
 $('home-choices').hidden=false;
 for(const [id,entry] of [['home-a',a],['home-b',b]]){$(id).textContent=entry[0];$(id).onclick=()=>{$('home-choices').hidden=true;entry[1]();};}
}
function homeSound(kind){
 try{
   const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
   homeAudio??=new Audio();if(homeAudio.state==='suspended')homeAudio.resume();
   const oscillator=homeAudio.createOscillator(),gain=homeAudio.createGain(),t=homeAudio.currentTime;
   oscillator.type=kind==='creak'?'triangle':'sine';oscillator.frequency.setValueAtTime(kind==='creak'?180:650,t);
   oscillator.frequency.exponentialRampToValueAtTime(kind==='creak'?90:300,t+.18);
   gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(.025,t+.025);gain.gain.exponentialRampToValueAtTime(.0001,t+.22);
   oscillator.connect(gain);gain.connect(homeAudio.destination);oscillator.start(t);oscillator.stop(t+.25);
 }catch{}
}
async function prepareHome(){
 await Promise.all([roomBoot,shelfBoot,collectionBoot,twoBoot]);
 const all=await spline.getAllObjects();
 homeObjects=all.filter(o=>o.name.startsWith('Interior ')||o.name.startsWith('Home '));
 for(const o of homeObjects)homeLookup.set(o.name,o);
 await homeObject('Home Story Props');await homeObject('Interior Home');
 for(const [key,[name,pattern]] of Object.entries(homeDefinitions)){
   const root=await homeObject(name),members=[root,...all.filter(o=>o.id!==root.id&&pattern.test(o.name))];
   homePacks[key]={root,members,meshes:members.filter(o=>o.type==='Mesh')};
 }
 for(const side of [-1,1])for(const [part,y,z] of [['Toe Armor',-88,36],['Sole',-97.5,13],['Foot',-87.5,13],['Shin Plate',-65,22],['Shin',-66,1]]){
   homeLegs.push({object:await homeObject('Leg '+side+' '+part),side,part,base:{x:0,y,z}});
 }
 for(let i=0;i<6;i++)homeSeatDust.push({object:await homeObject('Home Seat Dust '+i),point:homeSeatDustPoints[i],clean:0});
 for(const key of ['roll','cable','lamp','bed','blanket','connector']){
   const pack=homePacks[key],colors={};
   for(const m of pack.meshes)colors[m.name]=[/Brass|Stem|Binding|Socket|Connector|Plug/.test(m.name)?'#ad7840':/Cable/.test(m.name)?'#50402b':key==='roll'?'#929078':key==='blanket'?'#a88169':'#c6b49c'];
   await prepareSearchLight(pack.root,key==='lamp'?pack.meshes.filter(m=>m.name!=='Interior Lamp Bulb'):pack.meshes,{colors,textured:pack.meshes.map(m=>m.name),warm:key==='lamp'?['Interior Lamp Shade','Interior Shade Top']:[],fade:key==='roll'});
 }
 if(spline.createCustomMaterial&&spline.setMaterial){
   try{
     const first=all.find(o=>o.name.startsWith('Interior Floor Plank '));
     const wood=first&&spline.getTexture?await spline.getTexture(first.id):null;
     const floor=await spline.createCustomMaterial(three=>{
       const {tsl}=three,m=new three.MeshBasicNodeMaterial();homeFloorRadius=tsl.uniform(0);
       const distance=tsl.vec2(tsl.positionWorld.x,tsl.positionWorld.z.sub(120)).length();
       const fade=tsl.float(1).sub(tsl.smoothstep(homeFloorRadius.mul(.65),homeFloorRadius,distance));
       const base=tsl.vec3(.39,.3,.21),albedo=wood?.texture?tsl.mix(base,tsl.texture(wood.texture,tsl.uv()).rgb,tsl.float(.16)):base;
       m.colorNode=albedo.mul(.68).mul(fade);m.transparent=false;m.depthWrite=true;return m;
     });
     for(const o of all.filter(o=>o.name.startsWith('Interior Floor Plank ')))await spline.setMaterial(o.id,floor);
   }catch(error){console.warn('Home floor fade:',error.message);}
 }
 try{
   const light=await spline.createCustomMaterial(three=>{
     const m=new three.MeshBasicNodeMaterial();homeBulbGlow=three.tsl.uniform(0);
     m.colorNode=three.tsl.mix(three.tsl.vec3(.12,.09,.05),three.tsl.vec3(2.5,1.8,.85),homeBulbGlow);m.toneMapped=false;m.depthWrite=true;return m;
   });await spline.setMaterial((await homeObject('Interior Lamp Bulb')).id,light);
   const grain=spline.getTexture?await spline.getTexture('Interior Back Wall Plank 0'):null;
   const wood=await spline.createCustomMaterial(three=>{
     const {tsl}=three,m=new three.MeshBasicNodeMaterial();homeWallLight=tsl.uniform(0);homeLampPool=tsl.uniform(0);
     const delta=tsl.positionWorld.sub(tsl.vec3(-77,220,-817));
     const pool=tsl.float(1).sub(tsl.smoothstep(100,420,delta.length())).mul(.48).mul(homeLampPool);
     const diffuse=tsl.normalWorld.dot(tsl.vec3(.35,.8,.45).normalize()).max(0).mul(.45).add(.55);
     const base=tsl.vec3(.31,.17,.075),albedo=grain?.texture?tsl.mix(base,tsl.texture(grain.texture,tsl.uv()).rgb,tsl.float(.14)):base;
     m.colorNode=albedo.mul(diffuse).mul(.8).mul(tsl.mix(pool,tsl.float(1),homeWallLight));m.transparent=false;return m;
   });
   for(const o of homeObjects.filter(o=>/^Interior (Back Wall Plank |Sloped Ceiling |Roof Rafter |Ridge|Base Rail)/.test(o.name)))await spline.setMaterial(o.id,wood);
 }catch(error){console.warn('Home practical fade:',error.message);}
 await Promise.all(homeObjects.map(o=>update(o.id,{visible:false})));
 homeReady=true;
}
const homeBoot=prepareHome().catch(error=>{console.error('Home chapter:',error);});
async function activateHome(){
 await homeBoot;if(!homeReady)throw new Error('Home assets are not ready');
 await homeWrite('Interior Home',{visible:true});await homeWrite('Home Story Props',{visible:true});
 document.body.dataset.roomPreview='false';roomPreview=false;
}
async function showHomeStage(stage){
 const token=homeEpoch;await activateHome();if(token!==homeEpoch)return;homeStage=stage;
 if(stage>=1){
   homeRadiusTarget=stage>=5?1250:stage>=3?820:stage>=2?700:600;
   await homePack('rug',true);releaseSearchLight(homePacks.rug.root);
   for(const o of homeObjects.filter(o=>o.name.startsWith('Interior Floor Plank ')))update(o.id,{visible:true});
   await update(roomGround.id,{visible:false});
 }
 if(stage>=2){
   await homePack('lamp',true);if(token!==homeEpoch)return;releaseSearchLight(homePacks.lamp.root);await homePack('cabinet',true);if(token!==homeEpoch)return;homeLampOn=true;
   for(const o of homeObjects.filter(o=>/^Interior Back Wall Plank (7|8|9|10)$/.test(o.name)))update(o.id,{visible:true});
   await homeWrite('Interior Practical Lamp',{visible:true});
 }
 if(stage>=3){await homePack('bed',true);releaseSearchLight(homePacks.bed.root);}
 if(stage>=4)await homePack('slippers',true);
 if(stage>=5){
   await homePack('garland',true);await homePack('window',true);
   for(const o of homeObjects.filter(o=>/^Interior (Back Wall Plank |Sloped Ceiling |Roof Rafter |Ridge|Base Rail|Practical )/.test(o.name)))update(o.id,{visible:true});
 }
}
async function revealCompleteHome(){
 await homeBoot;
 for(const o of homeObjects){
   const hidden=o.name.startsWith('Home ')||o.name==='Interior Floor Starter'||o.name==='Interior Mirror Amber Reflection'||(/^(Interior Golden Bulb|Interior Bulb Socket) /.test(o.name)&&Number(o.name.split(' ').at(-1))%2!==0);
   update(o.id,{visible:!hidden});
 }
 if(homeFloorRadius)homeFloorRadius.value=2500;if(homeBulbGlow)homeBulbGlow.value=1;if(homeWallLight)homeWallLight.value=1;if(homeLampPool)homeLampPool.value=1;const warmth=searchLights.get(homePacks.lamp.root.id)?.warmth;if(warmth)warmth.value=1;
}
async function resetHomeStory(){
 homeEpoch++;homeFind=null;homeDrag=null;homeMove=null;homeStage=0;homeSitTarget=homeSitting=0;homeActor={x:0,y:0,z:0};homeBoxPlaced=false;homeBlanketPlace='';homeLampOn=false;homeRadiusTarget=0;homeLightProgress=0;homeProgress=0;homeLampProgress=0;homeKeyboardHold=false;homeLitCount=-1;homeCushionFlight=null;homeBlanketTween=null;homeMothGarden=false;homeCushionAt={x:165,y:40,z:80};homeBlanketAt={x:-210,y:17,z:-431};
 for(const id of ['home-find','home-interact','home-place','home-choices','home-blanket'])$(id).hidden=true;
 document.body.dataset.homeDragging='false';await homeBoot;
 for(const o of homeObjects)update(o.id,{visible:false});
 if(homeFloorRadius)homeFloorRadius.value=0;if(homeBulbGlow)homeBulbGlow.value=0;if(homeWallLight)homeWallLight.value=0;if(homeLampPool)homeLampPool.value=0;const warmth=searchLights.get(homePacks.lamp.root.id)?.warmth;if(warmth)warmth.value=0;
 homeWrite('Interior Lamp Bulb',{position:{y:311},rotation:{z:0}});
 Object.assign(storyCamera,{x:200,y:420,z:1100});update(roomCamera.id,{position:{...storyCamera}});
 write('Robot',{position:{x:0,y:0,z:0}});
 for(const part of homeLegs)update(part.object.id,{position:part.base,rotation:{x:0,y:0,z:0}});
 for(const d of homeSeatDust){d.clean=0;update(d.object.id,{visible:true,material:{alpha:100}});}
 homeWrite('Interior Daybed Pillow',{position:{x:0,y:132,z:-160},rotation:{x:18,y:0,z:-7}});
 homeWrite('Home Daybed Cover',{position:{x:0,y:0,z:0},scale:{x:1,y:1,z:1}});
 homeWrite('Home Folded Blanket',{position:{x:-210,y:17,z:-431},rotation:{x:0,y:0,z:0},scale:{x:1,y:1,z:1}});
 homeWrite('Interior Fringed Rug',{position:{x:0,y:0,z:0},scale:{x:1,y:1,z:1},rotation:{y:0}});
 homeWrite('Home Rolled Rug',{visible:false,position:{x:0,y:32,z:75},rotation:{x:0,y:0,z:0},scale:{x:1,y:1,z:1}});
 const rugOpacity=searchLights.get(homePacks.roll.root.id)?.opacity;if(rugOpacity)rugOpacity.value=1;
 homeWrite('Interior Slippers',{position:{x:0,y:0,z:0}});
 homeWrite('Home Garland Pull',{scale:{x:1,y:1,z:1}});
}
function resizeHomeView(){
 if(!homeStates())return;
 const scale=Math.max(1,innerHeight/innerWidth*1.4);
 Object.assign(storyCamera,{x:200*scale,y:180+240*scale,z:1100*scale});
 update(roomCamera.id,{position:{...storyCamera}});
}
window.addEventListener('resize',resizeHomeView);
function homeStep(stage){
 enter(stage);resizeHomeView();homeProgress=0;homeFind=null;$('home-find').hidden=true;$('home-interact').hidden=true;$('home-place').hidden=true;$('home-choices').hidden=true;$('home-blanket').hidden=true;clearShelfFeedback();$('home-interact').disabled=false;
 homeDrag=null;document.body.dataset.homeDragging='false';$('collect-cap').hidden=true;$('shelf-book').hidden=true;$('choice').hidden=true;$('pet').hidden=true;$('five').hidden=true;
}
function homeAim(angle){yawTarget=yaw+(((angle-yaw)%360+540)%360-180);}
function walkHome(points,done){
 homeMove={points:[{...homeActor},...points],segment:0,elapsed:0,duration:0,done};
 homeMove.duration=Math.max(.8,Math.hypot(points[0].x-homeActor.x,points[0].z-homeActor.z)/100);
 $('dialogue').hidden=false;$('dialogue').textContent='...';speechTyping=false;speechUntil=0;clearTimeout(typing);$('home-interact').disabled=true;
}
async function findHomeThing(key,point,stage,text,objectiveText){
 const token=homeEpoch;await activateHome();if(token!==homeEpoch)return;
 homeStep(stage);const pack=homePacks[key];await homePack(key,true,true);if(token!==homeEpoch)return;
 homeFind={key,point,pack};revealFoundObject('home-'+key,pack.root,pack.meshes,screenPoint(point.x,point.y,point.z));$('home-find').hidden=false;$('home-find').setAttribute('aria-label',objectiveText);$('spark').hidden=false;objective(objectiveText);if(text)homeSay(text);
}
function homeTask(label,point){homePoint=point;$('home-interact').hidden=false;$('home-interact').setAttribute('aria-label',label);objective(label);}
async function beginHomeStory(){
 const token=homeEpoch;await homeBoot;if(token!==homeEpoch)return;
 await activateHome();homeStep('home-box');homePack('thread',true);
 homeSay(['Could this go here?'],()=>homeTask('Put the box on the shelf',boxAt));
}
async function boxOnShelf(){
 homeDrag=null;homeBoxPlaced=true;homeStep('home-box-settle');homeSound('click');objective('');
 const from={...boxAt},started=chapterTime;
 homeBoxPlaced={from,started};
 homeAfter(1.2,()=>{homeBoxPlaced=true;homeSay(['There.','I like knowing where it is.'],()=>{
   homeStep('home-thread');homeSay(['Oh. Sorry.'],()=>findHomeThing('roll',{x:0,y:32,z:75},'home-rug-find',null,'Find what caught his foot'));
 });});
}
function rollFound(){
 restoreFoundObject(homePacks.roll.root,homePacks.roll.meshes);homePack('rug',true);releaseSearchLight(homePacks.rug.root);
 homeStep('home-rug-unroll');homeTask('Unroll the rug together',{x:0,y:32,z:75});$('spark').hidden=true;
}
function finishRug(){
 homeStep('home-rug-choice');homePack('roll',false);homePack('thread',false);showHomeStage(1);homeSound('cloth');
 homeSay('Is that straight?',()=>homeChoices(['Straighten it',()=>settleRug(0)],['It’s good like that',()=>settleRug(-7)]));
}
function settleRug(angle){
 homeRugTarget=angle;homeStep('home-rug-settle');objective('');
 homeAfter(1,()=>homeSay('That’s nicer.',()=>{
   homeStep('home-cable-intro');homeMothFlight=chapterTime;
   homeSay(['It keeps coming with you.','Where does that go?'],()=>findHomeThing('cable',{x:65,y:4,z:55},'home-cable-find',null,'Follow the cable'));
 }));
}
function cableFound(){findHomeThing('lamp',{x:-77,y:285,z:-560},'home-lamp-find',null,'Follow the cable');}
function lampFound(){
 restoreFoundObject(homePacks.lamp.root,homePacks.lamp.meshes);homePack('cable',false);homeStep('home-lamp-approach');homeWrite('Interior Lamp Bulb',{visible:true});objective('');$('spark').hidden=true;
 homeSay('Could you hold that bit?',()=>walkHome([{x:85,y:0,z:-440}],()=>{
   homeAim(180);homeStep('home-lamp-hold');homeTask('Hold the lamp steady',{x:-77,y:311,z:-560});
 }));
}
function lampFixed(){
 homeStep('home-lamp-switch');homeAim(frontYaw);homeTask('Turn on the lamp',{x:-77,y:230,z:-500});homeSound('click');
}
async function lampOn(){
 homeStep('home-lamp-warm');objective('');await showHomeStage(2);homeSound('click');homeMothFlight=chapterTime;
 homeSay('Now you can put your light down.',()=>walkHome([{x:20,y:0,z:-250},{x:0,y:0,z:0}],()=>{
   homeAim(frontYaw);homeStep('home-creak');homeSound('creak');
   homeSay('That wasn’t me.',()=>findHomeThing('bed',{x:-445,y:100,z:155},'home-bed-find',null,'Find where the sound came from'));
 }));
}
function bedFound(){
 restoreFoundObject(homePacks.bed.root,homePacks.bed.meshes);homePack('cover',true);homeStep('home-cover');$('spark').hidden=true;
 // The loose cushion is physically on the floor until the player replaces it.
 homeWrite('Interior Daybed Pillow',{position:{x:165,y:40,z:80},rotation:{x:-7,y:15,z:12}});homeWrite('Interior Pillow Seam',{visible:false});
 homeTask('Uncover the seat',{x:-310,y:100,z:340});
 walkHome([{x:-190,y:0,z:290}],()=>homeAim(-90));
}
function coverRemoved(){
 homePack('cover',false);homeStep('home-bed-clean');homePack('dust',true);homeTask('Clean the seat',{x:-445,y:109,z:180});homeSound('cloth');
}
function cleanHomeSeat(a,b){
 let changed=false;
 for(const d of homeSeatDust){
   if(d.clean>=1)continue;const p=screenPoint(d.point.x,d.point.y,d.point.z),near=distanceToStroke(p,a,b);
   if(near>=45)continue;d.clean=clamp(d.clean+(1-near/45)*Math.min(1,Math.hypot(b.x-a.x,b.y-a.y)/35));changed=true;
   update(d.object.id,{visible:d.clean<.98,material:{alpha:100*(1-d.clean)}});
 }
 if(changed)puffShelfDust(b.x,b.y);
 if(homeSeatDust.every(d=>d.clean>=.8)){
   homePack('dust',false);homeStep('home-cushion');homeTask('Put the cushion back',{x:-280,y:40,z:235});
 }
}
function cushionPlaced(){
 homeCushionFlight={from:{...homeCushionAt},started:chapterTime};homeStep('home-cushion-settle');objective('');homeSound('cloth');
 homeAfter(1.1,()=>{
   homeWrite('Interior Pillow Seam',{visible:true});showHomeStage(3);
   walkHome([{x:-235,y:0,z:155},{...homeSeat}],()=>{
     homeAim(90);homeSitTarget=1;homeStep('home-sitting');homeSound('creak');
     homeAfter(2,()=>homeSay('It does that.',()=>homeAfter(1.5,()=>{
       homeStep('home-blanket-intro');homeSay('There’s a corner sticking out.',()=>findHomeThing('blanket',{x:-210,y:20,z:-431},'home-blanket-find',null,'Find the loose corner'));
     })));
   });
 });
}
function blanketFound(){
 restoreFoundObject(homePacks.blanket.root,homePacks.blanket.meshes);homePack('slippers',true);homeWrite('Interior Slippers',{position:{x:-165,y:0,z:-731}});
 homeStep('home-blanket');$('spark').hidden=true;homeSound('cloth');
 homeSay('These are very small beds.',()=>{
   homeTask('Make it comfortable',{x:-210,y:20,z:-431});
   homeChoices(['On the bed',()=>placeBlanket('bed')],['Over your knees',()=>placeBlanket('lap')]);
 });
}
function placeBlanket(where){
 homeBlanketPlace=where;homeStep('home-blanket-settle');homeSound('cloth');objective('');
 const to=where==='lap'?{x:-290,y:149,z:155}:{x:-445,y:113,z:260};
 homeBlanketTween={from:{...homeBlanketAt},to,started:chapterTime,where,carrySlippers:homeStage<4};showHomeStage(4);
 homeAfter(2.1,()=>homeSay('Should we leave it like this?',()=>homeChoices(['Yes, just like this',startHomeLights],['Try the other place',()=>placeBlanket(homeBlanketPlace==='lap'?'bed':'lap')])));
}
function startHomeLights(){
 homeStep('home-moth-up');objective('');homeMothFlight=chapterTime;
 homeAfter(2,()=>homeSay('What did you find?',()=>findHomeThing('connector',{x:-235,y:150,z:-770},'home-connector-find',null,'Follow the moth')));
}
function connectorFound(){
 restoreFoundObject(homePacks.connector.root,homePacks.connector.meshes);homeStep('home-stand');$('spark').hidden=true;objective('');
 if(homeBlanketPlace==='lap'){homeWrite('Home Folded Blanket',{position:{x:-445,y:113,z:260},rotation:{y:0},scale:{x:1.7,y:.22,z:1.7}});homeBlanketPlace='bed';}
 homeSitTarget=0;homeAfter(1.8,()=>walkHome([{x:-320,y:0,z:155},{x:-320,y:0,z:-700},{x:-180,y:0,z:-700}],()=>{
   homeAim(180);homeStep('home-connect');homePack('plug',true);homeTask('Join the ends',{x:-280,y:185,z:-770});
 }));
}
function endsJoined(){
 homeStep('home-pull');homePack('plug',false);homePack('cord',true);homeSound('click');homeTask('Pull the cord',{x:-230,y:130,z:-770});
}
function homeLightsOn(){
 homeStep('home-lights');objective('');homeProgress=0;homeLightProgress=0;homeLitCount=-1;homeSound('click');homePack('cord',false);homePack('connector',false);
 homePack('garland',true).then(()=>{for(let i=0;i<48;i++)homeWrite('Interior Golden Bulb '+i,{visible:false});});
 for(const o of homeObjects.filter(o=>/^Interior (Back Wall Plank |Sloped Ceiling |Roof Rafter |Ridge|Base Rail)/.test(o.name)))update(o.id,{visible:true});
 homeAfter(3.3,()=>{
   showHomeStage(5);homeAim(frontYaw);
   homeSay('There’s more of it than I thought.',()=>walkHome([{x:-320,y:0,z:-700},{x:-320,y:0,z:155},{...homeSeat}],()=>{
     homeAim(90);homeSitTarget=1;homeStep('home-evening');
     homeAfter(2,()=>homeSay('Are you comfortable?',()=>{homeStep('home-quiet');objective('');$('shelf-book').hidden=false;homeAfter(5,()=>{$('dialogue').hidden=true;});}));
   }));
 });
}
function homeComment(line){homeSay(line,()=>homeAfter(3,()=>{$('dialogue').hidden=true;}));}
$('home-blanket').onclick=()=>{
 if(chapter!=='home-quiet')return;
 const where=homeBlanketPlace==='lap'?'bed':'lap';homeBlanketPlace=where;
 homeBlanketTween={from:{...homeBlanketAt},to:where==='lap'?{x:-290,y:149,z:155}:{x:-445,y:113,z:260},started:chapterTime,where,carrySlippers:false};
 homeComment('Like that?');
};
$('home-find').onfocus=()=>{if(homeFind){revealFocus='home-'+homeFind.key;}};
$('home-find').onclick=()=>{
 const actions={'home-rug-find':rollFound,'home-cable-find':cableFound,'home-lamp-find':lampFound,'home-bed-find':bedFound,'home-blanket-find':blanketFound,'home-connector-find':connectorFound};actions[chapter]?.();
};
function activateHomeTask(){
 const actions={'home-quiet':()=>homeComment('I saved you some room.'),'home-box':boxOnShelf,'home-lamp-switch':lampOn,'home-cushion':cushionPlaced,'home-connect':endsJoined,'home-pull':homeLightsOn};
 if(actions[chapter]){actions[chapter]();return;}
 if(chapter==='home-lamp-hold'){homeKeyboardHold=true;return;}
 if(chapter==='home-bed-clean'){
   const d=homeSeatDust.find(d=>d.clean<.8);if(d){const p=screenPoint(d.point.x,d.point.y,d.point.z);showShelfCloth(p.x,p.y);cleanHomeSeat({x:p.x-50,y:p.y},{x:p.x+50,y:p.y});}return;
 }
 if(chapter==='home-rug-unroll'||chapter==='home-cover'){
   homeProgress=clamp(homeProgress+.22);if(homeProgress>=1)(chapter==='home-cover'?coverRemoved:finishRug)();
 }
}
$('home-interact').onclick=e=>{if((e?.detail||0)>0&&performance.now()<homeSuppressUntil)return;activateHomeTask();};
$('home-place').onclick=()=>{if(chapter==='home-quiet'){homeMothGarden=true;homeMothFlight=chapterTime;homeComment('It seems happy here.');}else activateHomeTask();};
$('home-interact').onkeydown=e=>{
 if(['ArrowRight','ArrowDown','ArrowLeft','ArrowUp'].includes(e.key)){e.preventDefault();activateHomeTask();}
};
$('home-interact').onpointerdown=e=>{
 if(e.button>0||!homeStates()||homeMove)return;
 e.currentTarget.setPointerCapture?.(e.pointerId);homeSuppressUntil=performance.now()+400;
 homeDrag={id:e.pointerId,kind:chapter,el:e.currentTarget,start:{x:e.clientX,y:e.clientY},last:{x:e.clientX,y:e.clientY},progress:homeProgress,boxFrom:{...boxAt}};
 document.body.dataset.homeDragging='true';if(chapter==='home-bed-clean')showShelfCloth(e.clientX,e.clientY);
};
window.addEventListener('pointermove',e=>{
 const drag=homeDrag;if(!drag||drag.id!==e.pointerId)return;
 const p={x:e.clientX,y:e.clientY};
 if(drag.kind==='home-box'){
   boxAt=pointAtHeight(p.x,p.y,80);capAt={x:boxAt.x,y:boxAt.y+7,z:boxAt.z};
   $('home-place').hidden=false;place($('home-place'),screenPoint(homeShelfBox.x,homeShelfBox.y,homeShelfBox.z));
 }else if(drag.kind==='home-rug-unroll'){
   const a=screenPoint(0,32,75),b=screenPoint(0,32,555);homeProgress=clamp(drag.progress+(p.y-drag.start.y)/Math.max(70,b.y-a.y));
 }else if(drag.kind==='home-cover')homeProgress=clamp(drag.progress+Math.hypot(p.x-drag.start.x,p.y-drag.start.y)/150);
 else if(drag.kind==='home-bed-clean'){showShelfCloth(p.x,p.y);cleanHomeSeat(drag.last,p);}
 else if(drag.kind==='home-cushion'){
   const q=pointAtHeight(p.x,p.y,95);homeCushionAt={x:q.x+445,y:q.y,z:q.z-155};homeWrite('Interior Daybed Pillow',{position:homeCushionAt});$('home-place').hidden=false;place($('home-place'),screenPoint(-445,132,-5));
 }else if(drag.kind==='home-blanket'){
   const q=pointAtHeight(p.x,p.y,135);homeBlanketAt=q;homeWrite('Home Folded Blanket',{position:q});
 }else if(drag.kind==='home-connect')homeWrite('Home Loose Plug',{position:pointAtHeight(p.x,p.y,190)});
 else if(drag.kind==='home-pull')homeProgress=clamp((p.y-drag.start.y)/40);
 drag.last=p;
});
function releaseHomeDrag(e={},cancel=false){
 const drag=homeDrag;if(!drag||(e.pointerId!==undefined&&e.pointerId!==drag.id))return;
 try{drag.el.releasePointerCapture?.(drag.id);}catch{}homeDrag=null;homeSuppressUntil=performance.now()+300;document.body.dataset.homeDragging='false';clearShelfFeedback();
 if(cancel){
   if(drag.kind==='home-box'){boxAt=drag.boxFrom;capAt={x:boxAt.x,y:boxAt.y+7,z:boxAt.z};}
   if(drag.kind==='home-cushion')homeWrite('Interior Daybed Pillow',{position:{x:165,y:40,z:80}});
   if(drag.kind==='home-pull')homeProgress=0;
   return;
 }
 const end=drag.last;
 if(drag.kind==='home-box'){
   const target=screenPoint(homeShelfBox.x,homeShelfBox.y,homeShelfBox.z);if(Math.hypot(end.x-target.x,end.y-target.y)<80)boxOnShelf();else{boxAt=drag.boxFrom;capAt={x:boxAt.x,y:boxAt.y+7,z:boxAt.z};}
 }else if(drag.kind==='home-rug-unroll'&&homeProgress>=.98)finishRug();
 else if(drag.kind==='home-cover'&&homeProgress>=.98)coverRemoved();
 else if(drag.kind==='home-cushion'){
   const target=screenPoint(-445,132,-5);if(Math.hypot(end.x-target.x,end.y-target.y)<90)cushionPlaced();else homeWrite('Interior Daybed Pillow',{position:{x:165,y:40,z:80}});
 }else if(drag.kind==='home-blanket'){
   const bed=screenPoint(-445,113,260),lap=screenPoint(-290,149,155);if(Math.min(Math.hypot(end.x-bed.x,end.y-bed.y),Math.hypot(end.x-lap.x,end.y-lap.y))<100)placeBlanket(Math.hypot(end.x-bed.x,end.y-bed.y)<Math.hypot(end.x-lap.x,end.y-lap.y)?'bed':'lap');
 }else if(drag.kind==='home-connect'){
   const h=projectedHand(lastPose,'right'),target=screenPoint(h.x,h.y,h.z);if(Math.hypot(end.x-target.x,end.y-target.y)<65)endsJoined();
 }else if(drag.kind==='home-pull'){if(homeProgress>.95)homeLightsOn();else homeProgress=0;}
}
window.addEventListener('pointerup',e=>releaseHomeDrag(e));window.addEventListener('pointercancel',e=>releaseHomeDrag(e,true));window.addEventListener('blur',()=>releaseHomeDrag({},true));
function homeLegPose(side,hip,knee,height=100){
 write('Robot Leg Pivot '+side,{position:{y:height},rotation:{x:hip,y:0,z:0}});
 for(const part of homeLegs.filter(p=>p.side===side)){
   const v=rotateVector({x:0,y:part.base.y+42,z:part.base.z},knee,0,0);
   const foot=['Foot','Sole','Toe Armor'].includes(part.part);
   update(part.object.id,{position:{x:0,y:v.y-42,z:v.z},rotation:{x:foot?-hip:knee,y:0,z:0}});
 }
}
function homePose(p){
 if(!homeStates())return p;
 const t=chapterTime-chapterAt;homeSitting+=(homeSitTarget-homeSitting)*(1-Math.exp(-.033*3));if(Math.abs(homeSitting-homeSitTarget)<.001)homeSitting=homeSitTarget;
 p.bodyY=26*homeSitting;p.bodyZ=0;p.headX=homeSitting?4:0;p.headY=homeSitting?-70:0;
 for(const side of [-1,1])homeLegPose(side,-75*homeSitting,75*homeSitting,100+26*homeSitting);
 if(homeMove){
   const g=pulse(homeMove.elapsed,0,.25,homeMove.duration-.25,homeMove.duration),step=reduced?0:Math.sin(homeMove.elapsed*8);
   p.bodyY=Math.abs(step)*1.5*g;p.leftX=step*8*g;p.rightX=-step*8*g;
   for(const side of [-1,1])homeLegPose(side,-10*g+step*side*11*g,20*g,100);
 }else if(chapter==='home-thread'){p.rightZ=15;p.headX=20;homeLegPose(1,-22,35,104);}
 else if(chapter==='home-box'||chapter==='home-box-settle'){p.leftZ=-45;p.headY=-18;p.headX=12;}
 else if(chapter==='home-rug-unroll'){p.rightX=-55;p.leftX=-55;p.bodyY=-8;p.headX=22;for(const side of [-1,1])homeLegPose(side,-12,22,96);}
 else if(chapter==='home-lamp-hold'){p.rightX=-80;p.rightZ=25+Math.sin(chapterTime*4)*3;p.headX=12;p.bodyX=8;}
 else if(chapter==='home-cover'){p.leftX=-65;p.rightX=-20;p.bodyY=-8;p.headX=18;}
 else if(chapter==='home-connect'||chapter==='home-pull'){p.rightX=-55;p.rightZ=18;p.elbowZ=35;p.headX=16;}
 else if(chapter==='home-moth-up'||chapter==='home-connector-find'||chapter==='home-lights'){p.headX=-24;p.headY=homeSitting?-50:0;}
 if(homeFind&&gazeActive){const face=bodyScreen(0,317+p.bodyY,75);p.headY=bounded((pointerX-face.x)/innerWidth*45,-25,25);p.headX=bounded((pointerY-face.y)/innerHeight*40,-24,24);}
 if(chapter==='home-quiet'&&!reduced)p.headZ=Math.sin(chapterTime*.5)*1.2;
 if(!speechTyping&&performance.now()>speechUntil)return p;
 if(!homeMove&&!['home-lamp-hold','home-connect','home-pull'].includes(chapter))p.headY=bounded(((frontYaw-yaw)%360+540)%360-180,-80,80);
 return p;
}
function homeTick(dt){
 if(!homeReady||!homeStates())return;
 if(homeMove){
   const move=homeMove;move.elapsed+=dt;const a=move.points[move.segment],b=move.points[move.segment+1],g=ease(move.elapsed/move.duration);
   homeActor={x:a.x+(b.x-a.x)*g,y:0,z:a.z+(b.z-a.z)*g};homeAim(Math.atan2(b.x-a.x,b.z-a.z)*180/Math.PI);
   if(g===1){move.segment++;move.elapsed=0;if(move.segment>=move.points.length-1){homeMove=null;$('home-interact').disabled=false;move.done?.();}else{const c=move.points[move.segment+1];move.duration=Math.max(.8,Math.hypot(c.x-b.x,c.z-b.z)/100);}}
 }
 write('Robot',{position:homeActor});homeWrite('Home Actor Shadow',{visible:true,position:{x:homeActor.x,y:.35,z:homeActor.z+13},rotation:{x:-90,y:0,z:-yaw}});
 if(homeFloorRadius)homeFloorRadius.value+=(homeRadiusTarget-homeFloorRadius.value)*(1-Math.exp(-dt*1.8));
 homeRugAngle+=(homeRugTarget-homeRugAngle)*(1-Math.exp(-dt*5));if(Math.abs(homeRugAngle-homeRugTarget)<.001)homeRugAngle=homeRugTarget;
 if(homeFind){const f=homeFind;homeAim(Math.atan2(f.point.x-homeActor.x,f.point.z-homeActor.z)*180/Math.PI);if(f.key==='lamp')homeWrite('Interior Lamp Bulb',{visible:false});revealFoundObject('home-'+f.key,f.pack.root,f.pack.meshes,screenPoint(f.point.x,f.point.y,f.point.z));place($('home-find'),screenPoint(f.point.x,f.point.y,f.point.z));$('home-find').style.width=f.key==='bed'?'220px':'90px';$('home-find').style.height=f.key==='bed'?'130px':'90px';}
 if(homeBoxPlaced){
   if(typeof homeBoxPlaced==='object'){const g=ease((chapterTime-homeBoxPlaced.started)/1.1),a=homeBoxPlaced.from;boxAt={x:a.x+(homeShelfBox.x-a.x)*g,y:a.y+(homeShelfBox.y-a.y)*g,z:a.z+(homeShelfBox.z-a.z)*g};}
   else boxAt={...homeShelfBox};capAt={x:boxAt.x,y:boxAt.y+7,z:boxAt.z};
 }
 update(keepsakeBox.id,{position:boxAt});update(blueCap.id,{position:capAt});
 if(chapter==='home-rug-unroll'){
   const g=Math.max(.006,homeProgress),a=homeRugAngle*Math.PI/180;homeWrite('Interior Fringed Rug',{scale:{x:1,y:1,z:g},position:{x:-315*g*Math.sin(a),y:0,z:75+240*g-315*g*Math.cos(a)},rotation:{y:homeRugAngle}});
   const radius=Math.sqrt(1-clamp(homeProgress))*.96+.04;
   const opacity=1-ease(homeProgress*2),fade=searchLights.get(homePacks.roll.root.id)?.opacity;if(fade)fade.value=opacity;
   homePoint={x:240*homeProgress*Math.sin(a),y:1+31*radius,z:75+240*homeProgress*(1+Math.cos(a))};
   homeWrite('Home Rolled Rug',{visible:opacity>0,position:homePoint,rotation:{x:homeProgress*540,y:homeRugAngle},scale:{x:1,y:radius,z:radius}});
 }else if(homeStage>=1){const a=homeRugAngle*Math.PI/180;homeWrite('Interior Fringed Rug',{scale:{x:1,y:1,z:1},position:{x:-315*Math.sin(a),y:0,z:315-315*Math.cos(a)},rotation:{y:homeRugAngle}});}
 if(chapter==='home-cover'){
   const g=homeProgress,s=1-.55*g;homeWrite('Home Daybed Cover',{scale:{x:s,y:1-.5*g,z:1-.7*g},position:{x:-445*(1-s)-180*g,y:65*g,z:155*.7*g+230*g}});
 }
 if(chapter==='home-lamp-hold'){
   if(homeDrag?.kind==='home-lamp-hold'||homeKeyboardHold)homeLampProgress=clamp(homeLampProgress+dt/2.8);
   homeWrite('Interior Lamp Bulb',{position:{y:298+13*ease(homeLampProgress)},rotation:{z:7*(1-homeLampProgress)}});
   if(homeLampProgress>=1)lampFixed();
 }
 const warmth=searchLights.get(homePacks.lamp.root.id)?.warmth;if(warmth)warmth.value+=((homeLampOn?1:0)-warmth.value)*(1-Math.exp(-dt*2));
 if(homeBulbGlow)homeBulbGlow.value+=((homeLampOn?1:0)-homeBulbGlow.value)*(1-Math.exp(-dt*2));
 if(homeLampPool)homeLampPool.value+=((homeLampOn?1:0)-homeLampPool.value)*(1-Math.exp(-dt*2));
 if(homeWallLight)homeWallLight.value=homeStage>=5?1:homeLightProgress;
 if(homeCushionFlight){
   const a=homeCushionFlight.from,g=ease((chapterTime-homeCushionFlight.started)/1);
   homeCushionAt={x:a.x*(1-g),y:a.y+(132-a.y)*g+Math.sin(g*Math.PI)*30,z:a.z+(-160-a.z)*g};
   homeWrite('Interior Daybed Pillow',{position:homeCushionAt,rotation:{x:-7+25*g,y:15*(1-g),z:12-19*g}});if(g===1)homeCushionFlight=null;
 }
 if(homeBlanketTween){
   const a=homeBlanketTween.from,b=homeBlanketTween.to,g=ease((chapterTime-homeBlanketTween.started)/2),lap=homeBlanketTween.where==='lap';
   homeBlanketAt={x:a.x+(b.x-a.x)*g,y:a.y+(b.y-a.y)*g+Math.sin(g*Math.PI)*60,z:a.z+(b.z-a.z)*g};
   homeWrite('Home Folded Blanket',{position:homeBlanketAt,rotation:{y:(lap?90:0)*g},scale:{x:1+((lap ? .7 : 1.7)-1)*g,y:1-.78*g,z:1+((lap ? .9 : 1.7)-1)*g}});
   if(homeBlanketTween.carrySlippers)homeWrite('Interior Slippers',{position:{x:-165-70*g,y:0,z:-731+721*g}});if(g===1)homeBlanketTween=null;
 }
 if(moth){
   const cable=['home-cable-intro','home-cable-find','home-lamp-find'].includes(chapter);
   if(cable){
     const g=ease((chapterTime-homeMothFlight)/3),q=pointAtHeight(pointerX,pointerY,120),moving=chapter==='home-cable-intro'&&g<1;
     const goal=moving?{x:bounded(q.x,-250,250),y:120+Math.sin(chapterTime*4)*12,z:bounded(q.z,-150,180)}:{x:65,y:8,z:55};
     mothAt={x:mothAt.x+(goal.x-mothAt.x)*dt*3,y:mothAt.y+(goal.y-mothAt.y)*dt*3,z:mothAt.z+(goal.z-mothAt.z)*dt*3};update(moth.id,{position:mothAt});
   }
   const up=['home-moth-up','home-connector-find','home-stand','home-connect','home-pull','home-lights','home-evening','home-quiet'].includes(chapter);
   if(homeMothGarden){const g=ease((chapterTime-homeMothFlight)/3);update(moth.id,{position:{x:-220+365*g,y:682-614*g+Math.sin(g*Math.PI)*30,z:-581+667*g}});}
   else if(up){const g=ease((chapterTime-homeMothFlight)/3);update(moth.id,{position:{x:-77-143*g,y:409+273*g,z:-560-21*g}});}
   else if(homeLampOn&&!cable){const g=ease((chapterTime-homeMothFlight)/2);update(moth.id,{position:{x:145-222*g,y:68+341*g+Math.sin(g*Math.PI)*60,z:86-646*g}});}
   const flight=(up||homeMothGarden)&&chapterTime-homeMothFlight<3||chapter==='home-lamp-warm'||chapter==='home-cable-intro';const flap=Math.sin(chapterTime*(flight?22:2))*(flight?30:3);
   update(mothLeft.id,{rotation:{y:-25-flap}});update(mothRight.id,{rotation:{y:25+flap}});
 }
 if(chapter==='home-connect'&&lastPose){const h=projectedHand(lastPose,'right');homeWrite('Home Connector',{position:{x:h.x,y:h.y+8,z:h.z}});}
 if(chapter==='home-pull')homeWrite('Home Garland Pull',{scale:{y:1+.25*homeProgress}});
 if(chapter==='home-lights'){
   homeLightProgress=clamp((chapterTime-chapterAt)/3);
   const count=Math.floor(homeLightProgress*24);if(count!==homeLitCount){homeLitCount=count;for(let i=0;i<48;i+=2)homeWrite('Interior Golden Bulb '+i,{visible:i/2<count});}
 }
 if(chapter==='home-quiet'){
   $('home-interact').hidden=false;$('home-interact').setAttribute('aria-label','Sit with '+chosenName);homePoint={x:homeActor.x,y:320,z:homeActor.z};
   $('home-place').hidden=false;$('home-place').setAttribute('aria-label','Visit the plant');place($('home-place'),screenPoint(145,50,86));
   $('home-blanket').hidden=false;const b=homeBlanketPlace==='lap'?{x:-290,y:149,z:155}:{x:-445,y:113,z:260};place($('home-blanket'),screenPoint(b.x,b.y,b.z));
   $('collect-box').hidden=false;$('collect-box').setAttribute('aria-label','Look at the keepsake box');place($('collect-box'),screenPoint(boxAt.x,boxAt.y+15,boxAt.z));
 }
 if(!homeMove&&!$('home-interact').hidden){
   let point=homePoint;
   if(chapter==='home-box')point={x:boxAt.x,y:boxAt.y+15,z:boxAt.z};
   if(chapter==='home-connect')point={x:-280,y:185,z:-770};
   place($('home-interact'),screenPoint(point.x,point.y,point.z));
   $('home-interact').style.width=chapter==='home-bed-clean'?'200px':'80px';$('home-interact').style.height=chapter==='home-bed-clean'?'130px':'70px';
 }
}

// Author checkpoints reconstruct only earned objects, using the same transitions.
async function previewHomeChapter(stop){
 await activateHome();homeActor={x:0,y:0,z:0};homeBoxPlaced=true;boxAt={...homeShelfBox};capAt={x:boxAt.x,y:boxAt.y+7,z:boxAt.z};
 const levels={rug:0,lamp:1,seat:2,blanket:3,lights:4,cosy:5};await showHomeStage(levels[stop]);
 if(stop==='rug'){await homePack('roll',true);rollFound();}
 if(stop==='lamp'){await homePack('lamp',true);lampFound();}
 if(stop==='seat'){await homePack('bed',true);bedFound();}
 if(stop==='blanket'){
   homeActor={...homeSeat};homeSitting=homeSitTarget=1;homeAim(90);await findHomeThing('blanket',{x:-210,y:20,z:-431},'home-blanket-find',null,'Find the loose corner');
 }
 if(stop==='lights'){
   homeActor={x:-180,y:0,z:-700};homeAim(180);homeStep('home-connect');await homePack('connector',true);await homePack('plug',true);homeTask('Join the ends',{x:-280,y:185,z:-770});
 }
 if(stop==='cosy'){
   homeActor={...homeSeat};homeSitting=homeSitTarget=1;homeAim(90);homeStep('home-quiet');objective('');$('dialogue').hidden=true;$('shelf-book').hidden=false;
   await homePack('blanket',true);homeWrite('Home Folded Blanket',{position:{x:-445,y:113,z:260},rotation:{y:0},scale:{x:1.7,y:.22,z:1.7}});homeWrite('Interior Slippers',{position:{x:-235,y:0,z:-10}});
 }
 if(homeFloorRadius)homeFloorRadius.value=homeRadiusTarget;
}
