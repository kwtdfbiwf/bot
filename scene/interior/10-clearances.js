// One-time corrections to the authored room. Keep whole assemblies together.
select('Interior Rust Bed');position({x:215,y:0,z:-458});
select('Interior Travel Chest');position({x:35,y:0,z:0});
select('Interior Standing Mirror');position({x:420,y:-3.8,z:-50});
scale({x:.74,y:.74,z:.74});
// Rest the spare blanket on the floor, beyond the bed's timber base.
select('Interior Folded Blanket');position({x:0,y:26,z:318});
for(let i=0;i<4;i++){
 select('Interior Blanket Fold '+i);position({x:0,y:8+i*10,z:357});
}
select('Interior Small Earthen Bowl');position({x:280,y:21,z:-40});
select('Interior Bowl Inside');position({x:280,y:7,z:-40});
// The lowest cover rests on the tabletop; stacked covers meet edge to edge.
for(let i=0;i<3;i++){
 const y=190+i*17,x=-300+i*5,z=-535+i*3;
 select('Interior Desk Book Pages '+i);position({x,y,z});
 select('Interior Desk Book Spine '+i);position({x:x-56,y,z});
 for(const side of [-1,1]){select('Interior Desk Book Cover '+i+' '+side);position({x,y:y+side*7,z});}
}
for(let i=0;i<2;i++){
 const x=-210+i*9,y=115+i*24;
 select('Interior Crate Book Pages '+i);position({x,y,z:156});
 for(const side of [-1,1]){select('Interior Crate Book Cover '+i+' '+side);position({x,y:y+side*10,z:156});}
}
select('Interior Tipped Cup');position({x:366,y:53.6,z:464});
select('Interior Satchel');position({x:0,y:-4.3,z:0});
select('Interior Open Notebook Left');position({x:-368,y:183,z:-443});geometry({depth:58});
select('Interior Open Notebook Right');position({x:-311.5,y:183,z:-430});geometry({depth:58});
select('Interior Desk Pen');position({y:-3});
select('Cozy Shelf');position({x:-210,y:0,z:-30});
unselect();
