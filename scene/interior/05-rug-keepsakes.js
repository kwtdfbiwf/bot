interiorParent=add('Empty');rename('Interior Fringed Rug');position({x:0,y:0,z:0});moveInto('Interior Home');
icyl('Interior Round Woven Rug',0,3.5,315,480,7,'Interior Sage',{cornerRadius:2});
const rim=[];for(let i=0;i<=64;i++){const a=i*Math.PI*2/64;rim.push([Math.cos(a)*234,7,315+Math.sin(a)*234]);}
itube('Interior Rug Bound Edge',rim,2.7,'Interior Cream');
for(let i=0;i<40;i++){
 const a=i*Math.PI*2/40,c=Math.cos(a),s=Math.sin(a);
 itube('Interior Rug Fringe '+i,[[c*232,6,315+s*232],[c*246,5.4,315+s*246],[c*255,2.7,315+s*255]],2.1,'Interior Cream');
}
interiorParent=add('Empty');rename('Interior Slippers');position({x:0,y:0,z:0});moveInto('Interior Home');
for(const x of [-75,-15]){
 ibox('Interior Slipper Sole '+x,x,13,300,43,10,83,'Interior Cream',{y:-12});geometry({cornerRadius:15});
 iball('Interior Slipper Toe '+x,x,25,278,45,23,42,'Interior Cream');
 iball('Interior Slipper Opening '+x,x,24,306,28,3,26,'Interior Leather');
}
interiorParent=add('Empty');rename('Interior Magnifying Glass');position({x:0,y:0,z:0});moveInto('Interior Home');
const ring=[];for(let i=0;i<=40;i++){const a=i*Math.PI*2/40;ring.push([116+Math.cos(a)*26,14,396+Math.sin(a)*26]);}
itube('Interior Magnifier Brass Rim',ring,4,'Interior Brass');
itube('Interior Magnifier Handle',[[132,14,417],[158,14,457]],7,'Interior Walnut');
icyl('Interior Magnifier Glass',116,14,396,45,1.3,'Interior Mirror');createMaterial('Interior Magnifier Lens');opacity(.35);shading({category:'physical',roughness:.08,metalness:0,reflectivity:.6});
interiorParent=add('Empty');rename('Interior Book Crate');position({x:0,y:0,z:0});moveInto('Interior Home');
ibox('Interior Book Crate Body',-218,51,161,116,102,108,'Interior Book Olive');
for(const x of [-268,-168])ibox('Interior Crate Batten '+x,x,54,218,9,103,8,'Interior Walnut');
ibox('Interior Crate Recess',-218,62,217,69,12,4,'Interior Charcoal');
for(let i=0;i<2;i++){
 const y=111+i*23;
 ibox('Interior Crate Book Pages '+i,-210+i*9,y,156,111,16,79,'Interior Paper',{y:i*8-12});
 for(const side of [-1,1])ibox('Interior Crate Book Cover '+i+' '+side,-210+i*9,y+side*10,156,117,4,85,i?'Interior Book Red':'Interior Leather',{y:i*8-12});
}
