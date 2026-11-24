// Full, furnished 3D interior built to the warm attic reference. The camera
// stays INSIDE the home in every mode. During story searches the unearned
// set is hidden; only the active object can respond to the cursor beam.
const homeLayout={shelf:{position:{x:-210,y:0,z:-30},scale:1.35,yaw:15}};
const interiorCamera={x:200,y:420,z:1100};
let homeRoom=null,roomCamera=null,roomGround=null,roomPreview=false;
// Apply absolute placements at runtime too: cached model data must not
// restore the earlier overlapping furniture layout.
async function applyRoomClearances(){
 const place=async(name,position,extra={})=>{
   const object=await spline.findObjectByName(name);
   if(object)await update(object.id,{position,...extra});
 };
 await place('Interior Rust Bed',{x:215,y:0,z:-458});
 await place('Interior Travel Chest',{x:35,y:0,z:0});
 await place('Interior Standing Mirror',{x:420,y:-3.8,z:-50},{scale:{x:.74,y:.74,z:.74}});
 await place('Interior Folded Blanket',{x:0,y:26,z:318});
 for(let i=0;i<4;i++)await place('Interior Blanket Fold '+i,{x:0,y:8+i*10,z:357});
 await place('Interior Small Earthen Bowl',{x:280,y:21,z:-40});
 await place('Interior Bowl Inside',{x:280,y:7,z:-40});
 for(let i=0;i<3;i++){
   const x=-300+i*5,y=190+i*17,z=-535+i*3;
   await place('Interior Desk Book Pages '+i,{x,y,z});
   await place('Interior Desk Book Spine '+i,{x:x-56,y,z});
   for(const side of [-1,1])await place('Interior Desk Book Cover '+i+' '+side,{x,y:y+side*7,z});
 }
 for(let i=0;i<2;i++){
   const x=-210+i*9,y=115+i*24;
   await place('Interior Crate Book Pages '+i,{x,y,z:156});
   for(const side of [-1,1])await place('Interior Crate Book Cover '+i+' '+side,{x,y:y+side*10,z:156});
 }
 await place('Interior Tipped Cup',{x:366,y:53.6,z:464});
 await place('Interior Satchel',{x:0,y:-4.3,z:0});
 await place('Interior Open Notebook Left',{x:-368,y:183,z:-443},{geometry:{depth:58}});
 await place('Interior Open Notebook Right',{x:-311.5,y:183,z:-430},{geometry:{depth:58}});
 await place('Interior Desk Pen',{y:-3});
}
async function prepareRoom(){
 homeRoom=await spline.findObjectByName('Interior Home');
 roomCamera=await spline.findObjectByName('Robot Portrait Camera');
 roomGround=await spline.findObjectByName('Studio Ground');
 const oldShell=await spline.findObjectByName('Home Room');
 if(!homeRoom||!roomCamera||!roomGround)throw new Error('Missing furnished interior');
 if(oldShell)await update(oldShell.id,{visible:false});
 await applyRoomClearances();
 // The layered contour pass leaks room edges across Milo. Give the three
 // closed head meshes opaque depth-writing surfaces instead.
 for(const [name,color] of [['Head Shell','#eee5d5'],['Head Bezel','#343d50'],['Head Screen','#7793b5']]){
   const head=await spline.findObjectByName(name);
   if(!head)continue;
   try{
     await spline.setMaterial(head.id,three=>{
       const material=new three.MeshStandardNodeMaterial();
       material.color=new three.Color(color);material.roughness=.7;material.metalness=0;
       material.transparent=false;material.opacity=1;material.depthWrite=true;material.depthTest=true;
       return material;
     });
   }catch{
     await update(head.id,{material:{alpha:100,layers:[{type:'color',alpha:100},{type:'light',alpha:100}]}});
   }
 }
 // HDR filaments give the reference's small bulbs a genuine soft bloom,
 // without increasing ambient exposure over the entire room.
 if(spline.createCustomMaterial&&spline.setMaterial){
   const glow=await spline.createCustomMaterial(three=>{
     const material=new three.MeshBasicNodeMaterial();
     material.colorNode=three.tsl.vec3(2.5,1.8,.85);material.toneMapped=false;
     return material;
   });
   const bulbs=[];
   for(let i=0;i<48;i+=2)bulbs.push(await spline.findObjectByName('Interior Golden Bulb '+i));
   bulbs.push(await spline.findObjectByName('Interior Lamp Bulb'));
   for(const bulb of bulbs)if(bulb)await spline.setMaterial(bulb.id,glow);
 }
 // Compile the furnished set underneath the opening's opaque black screen.
 // Later discovery must not pay the first-render cost of hundreds of pieces.
 await update(homeRoom.id,{visible:true});
 await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
 await update(homeRoom.id,{visible:false});
 await update(roomCamera.id,{position:interiorCamera});
 await update(roomGround.id,{visible:true});
}
const roomBoot=prepareRoom();
async function showRoomModel(visible){
 await roomBoot;roomPreview=visible;document.body.dataset.roomPreview=String(visible);
 await update(homeRoom.id,{visible});
 await update(roomGround.id,{visible:!visible});
 // Opening the full model reveals the furnishings, never an outside camera.
 await update(roomCamera.id,{position:interiorCamera});
}
