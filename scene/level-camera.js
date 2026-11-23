// The angled portrait camera needs a small roll correction for a level horizon.
// Keep screenPoint and cameraRay in chapter-one.js in sync with this rotation.
select('Robot Portrait Camera');
rotation({x:-11,y:11,z:2.12409883794});
position({x:200,y:420,z:1100});
