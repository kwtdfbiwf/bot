// Per-fragment cursor light for finds. Black stays opaque: objects never turn
// into transparent ghosts, and a handle can emerge before the rest of the can.
const searchLights=new Map();
const findClay={
 'Seed Shell':['#c9a377',.84],
 'Can Enamel Body':['#9cb3a2',.72],'Can Curved Spout':['#9cb3a2',.72],'Can Rolled Lip':['#9cb3a2',.72],
 'Can Loop Handle':['#d3a095',.74],'Can Dark Opening':['#596c5b',.9],'Can Spout Opening':['#596c5b',.9],
 'Blue Cap Enamel':['#789bb5',.76],'Box Folded Tape':['#d3a095',.74]
};
async function prepareSearchLight(root,meshes,options={}){
 const state={active:null,pointer:null,viewport:null,ready:false};searchLights.set(root.id,state);
 try{
   if(!spline.createCustomMaterial||!spline.setMaterial)throw new Error('Surface shaders unavailable');
   // Shared by this find's pieces; changing these values never sends mesh edits.
   for(const mesh of meshes){
     const [color]=options.colors?.[mesh.name]||findClay[mesh.name]||['#c29f7c',.86];
     const surface=options.textured?.includes(mesh.name)&&spline.getTexture?await spline.getTexture(mesh.id):null;
     const material=await spline.createCustomMaterial(three=>{
       const {tsl}=three;
       if(!state.active){
         state.active=tsl.uniform(0);
         state.pointer=tsl.uniform(new three.Vector2(0,0));
         state.viewport=tsl.uniform(new three.Vector2(innerWidth,innerHeight));
       }
       // The same fixed camera projection as screenPoint, evaluated at EVERY
       // surface fragment, not at the object's centre. Independent of DPR.
       const a=25.1*Math.PI/180,b=-10.4*Math.PI/180,c=4.442*Math.PI/180;
       const d=tsl.positionWorld.sub(tsl.vec3(370,360,790));
       const yy=d.y.mul(Math.cos(b)).add(d.z.mul(Math.sin(b)));
       const zz=d.y.mul(-Math.sin(b)).add(d.z.mul(Math.cos(b)));
       const xx=d.x.mul(Math.cos(a)).sub(zz.mul(Math.sin(a)));
       const depth=d.x.mul(Math.sin(a)).add(zz.mul(Math.cos(a))).negate();
       const f=state.viewport.y.div(2*Math.tan(Math.PI/8));
       const sx=xx.mul(Math.cos(c)).add(yy.mul(Math.sin(c))).mul(f).div(depth).add(state.viewport.x.mul(.5));
       const sy=xx.mul(-Math.sin(c)).add(yy.mul(Math.cos(c))).mul(f).div(depth).negate().add(state.viewport.y.mul(.5));
       const distance=tsl.vec2(sx,sy).sub(state.pointer).length();
       const beam=tsl.float(1).sub(tsl.smoothstep(16,130,distance)).pow(1.5);
       const illumination=tsl.mix(tsl.float(1),beam,state.active);
       // Matte clay with a broad front/overhead key. Apply the beam to the
       // final colour so ambient light and specular can't reveal unlit parts.
       const diffuse=tsl.normalWorld.dot(tsl.vec3(.35,.8,.45).normalize()).max(0).mul(.65).add(.35);
       const m=new three.MeshBasicNodeMaterial();
       // Pass numeric linear RGB: the runtime's vec3(Color) conversion
       // renders black on this backend.
       const rgb=[1,3,5].map(i=>{const s=parseInt(color.slice(i,i+2),16)/255;return s<=.04045?s/12.92:Math.pow((s+.055)/1.055,2.4);});
       const albedo=surface?.texture?tsl.texture(surface.texture,tsl.uv()).rgb:tsl.vec3(...rgb);
       m.colorNode=albedo.mul(diffuse).mul(illumination);
       m.side=three.DoubleSide;m.transparent=false;
       return m;
     });
     await spline.setMaterial(mesh.id,material);
   }
   state.ready=true;
 }catch(error){console.warn('Cursor surface light fallback:',error.message);}
}
function driveSearchLight(root,point,focused){
 const state=searchLights.get(root.id);
 if(!state?.ready)return false;
 state.active.value=focused?0:1;
 state.pointer.value.set(pointerX,pointerY);
 state.viewport.value.set(innerWidth,innerHeight);
 return true;
}
function releaseSearchLight(root){
 const state=root&&searchLights.get(root.id);
 if(state?.active)state.active.value=0;
}
