// The two distinct resting places, triangular window and upholstered details.
interiorParent=add('Empty');rename('Interior Window');position({x:0,y:0,z:0});moveInto('Interior Home');
mesh('Triangle',{width:265,height:255,depth:12,cornerRadius:3});rename('Interior Triangular Window Glass');
createMaterial('Interior Night Glass');color('#252a30');shading({category:'physical',roughness:.2,metalness:.25});position({x:-350,y:425,z:-793});moveInto(interiorParent);
for(const e of [[-485,300,-350,555],[-350,555,-215,300],[-485,300,-215,300]]){
 const dx=e[2]-e[0],dy=e[3]-e[1];ibox('Interior Window Frame '+e[0]+' '+e[1],(e[0]+e[2])/2,(e[1]+e[3])/2,-775,20,Math.hypot(dx,dy)+12,30,'Interior Cedar',{z:-Math.atan2(dx,dy)*180/Math.PI});
}
ibox('Interior Window Sill',-350,292,-756,302,18,65,'Interior Walnut');
interiorParent=add('Empty');rename('Interior Daybed');position({x:-445,y:0,z:155});moveInto('Interior Home');
for(const x of [-555,-335])for(const z of [-25,340])ibox('Interior Cot Foot '+x+' '+z,x,27,z,23,54,24,'Interior Walnut');
ibox('Interior Cot Frame',-445,51,155,280,28,435,'Interior Cedar');
ibox('Interior Cot Mattress',-445,86,155,275,44,423,'Interior Cream');geometry({cornerRadius:16,cornerSegments:8});
ibox('Interior Cot Piped Edge',-445,69,155,279,5,424,'Interior Paper');
ibox('Interior Daybed Pillow',-445,132,-5,207,74,106,'Interior Cream',{x:18,z:-7});geometry({cornerRadius:25,cornerSegments:8});
// Fine stitched cushion edge, with visible tuft indent buttons.
itube('Interior Pillow Seam',[[-537,128,34],[-537,150,-24],[-355,150,-24],[-353,128,34],[-537,128,34]],1.3,'Interior Paper');
for(const x of [-490,-442,-397])iball('Interior Cot Tuft '+x,x,110,135,5,2,5,'Interior Paper');
for(const z of [60,270])ibox('Interior Cot Side Joinery '+z,-587,55,z,5,16,14,'Interior Brass');
interiorParent=add('Empty');rename('Interior Rust Bed');position({x:250,y:0,z:-458});moveInto('Interior Home');
ibox('Interior Bed Timber Base',250,31,-458,315,60,525,'Interior Walnut');
ibox('Interior Bed Mattress',250,73,-458,305,34,515,'Interior Cream');geometry({cornerRadius:18,cornerSegments:8});
ibox('Interior Bed Rust Quilt',250,101,-410,312,37,390,'Interior Rust');geometry({cornerRadius:19,cornerSegments:8});
ibox('Interior Bed Folded Hem',250,119,-223,308,20,49,'Interior Rust');geometry({cornerRadius:8});
ibox('Interior Bed Ochre Pillow',250,119,-642,239,65,108,'Interior Oak',{x:-12,z:5});geometry({cornerRadius:24,cornerSegments:8});
for(let row=0;row<5;row++)for(let col=0;col<4;col++){
 const x=139+col*74,z=-552+row*66;
 iball('Interior Quilt Tuft '+row+' '+col,x,120,z,7,2,7,'Interior Leather');
}
for(const x of [100,174,248,322,398])itube('Interior Quilt Stitch '+x,[[x,120,-595],[x+2,122,-460],[x-1,122,-330],[x,121,-233]],.7,'Interior Book Red');
// Little folded blanket at the foot of the back bed.
ibox('Interior Folded Blanket',250,44,-162,244,52,74,'Interior Cream');geometry({cornerRadius:12});
for(let i=0;i<4;i++)ibox('Interior Blanket Fold '+i,250,26+i*10,-123,227,2,2,'Interior Paper');
unselect();
