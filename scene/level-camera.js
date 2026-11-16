// The angled portrait camera needs a small roll correction for a level horizon.
// Keep screenPoint and cameraRay in chapter-one.js in sync with this rotation.
select('Robot Portrait Camera');
rotation({x:-10.4,y:25.1,z:4.442});
