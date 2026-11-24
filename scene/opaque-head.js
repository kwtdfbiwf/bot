// One-time native companion to the depth-writing runtime materials in
// room-layout.js. Keep head solids separate from shared body contours.
for(const [name,materialName] of [['Head Shell','Milo Opaque Porcelain'],['Head Bezel','Milo Opaque Bezel'],['Head Screen','Milo Opaque Screen']]){
 select(name);createMaterial(materialName);removeLayer('outline');opacity(1);
 layer('light',{alpha:1,alphaOverride:1});
 visibility({side:'front',wireframe:false});shadows({cast:true,receive:false});
}
