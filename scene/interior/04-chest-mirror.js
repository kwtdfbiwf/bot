interiorParent=add('Empty');rename('Interior Travel Chest');position({x:0,y:0,z:0});moveInto('Interior Home');
ibox('Interior Chest Body',475,73,-364,226,142,168,'Interior Leather');
for(const y of [13,132])ibox('Interior Chest Rim '+y,475,y,-364,235,15,176,'Interior Walnut');
// A barrel-vaulted lid with a real arched profile and closed end caps.
const v=[],idx=[],n=20;
for(const z of [-449,-279])for(let i=0;i<=n;i++){
 const a=i*Math.PI/n;v.push(475+114*Math.cos(a),144+76*Math.sin(a),z);
}
for(let i=0;i<n;i++)idx.push(i,i+1,n+1+i,i+1,n+2+i,n+1+i);
for(const end of [0,1]){
 const center=v.length/3;v.push(475,144,end?-279:-449);
 for(let i=0;i<n;i++){const a=end*(n+1)+i;idx.push(center,end?a+1:a,end?a:a+1);}
}
const lid=customMesh({vertices:v,indices:idx});rename('Interior Chest Arched Lid');applyMaterial('Interior Leather');position({x:0,y:0,z:0});moveInto(interiorParent);
for(const z of [-417,-309]){
 const points=[];for(let i=0;i<=24;i++){const a=i*Math.PI/24;points.push([475+116*Math.cos(a),145+78*Math.sin(a),z]);}
 itube('Interior Chest Curved Brass Band '+z,points,6,'Interior Brass');
 for(const x of [359,591])ibox('Interior Chest Band End '+x+' '+z,x,79,z,10,132,15,'Interior Brass');
}
ibox('Interior Chest Lock Plate',475,128,-272,29,44,9,'Interior Brass');
ibox('Interior Chest Lock Slot',475,126,-266,5,12,3,'Interior Charcoal');
for(const x of [365,585])for(const y of [35,112])iball('Interior Chest Rivet '+x+' '+y,x,y,-274,9,9,5,'Interior Brass');
itube('Interior Chest Side Handle',[[598,100,-400],[610,94,-400],[610,82,-340],[598,100,-340]],4,'Interior Walnut');
interiorParent=add('Empty');rename('Interior Standing Mirror');position({x:560,y:0,z:160});moveInto('Interior Home');
ibox('Interior Mirror Back',560,220,160,151,410,17,'Interior Walnut');
ibox('Interior Mirror Glass',560,222,171,125,378,5,'Interior Mirror');
shading({category:'physical',metalness:.9,roughness:.1,reflectivity:1});
for(const x of [486,634])ibox('Interior Mirror Side '+x,x,220,177,13,420,20,'Interior Brass');
for(const y of [14,426])ibox('Interior Mirror Cross '+y,560,y,177,158,14,20,'Interior Brass');
ibox('Interior Mirror Back Support',560,129,220,14,257,16,'Interior Walnut',{x:-15});
// A soft reflected streak from the bulb string, inside the glass frame.
ibox('Interior Mirror Amber Reflection',541,271,175,12,190,2,'Interior Amber',{z:-8});createMaterial('Interior Mirror Warm Reflection');shading({category:'phong',emissive:'#be6c25',shininess:40});
select(interiorParent);rotation({x:-9,y:-17,z:-5});
