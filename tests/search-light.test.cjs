// Evaluate the shader graph at actual surface positions. This checks the
// lighting gradient itself, rather than duplicating the reveal implementation.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const {sample,three}=require('./shader-runtime.cjs');
const applied=new Map();
const context={console,Math,innerWidth:1280,innerHeight:720,pointerX:640,pointerY:360,
 spline:{async createCustomMaterial(factory){return factory(three)},async setMaterial(id,m){applied.set(id,m)}}};
vm.createContext(context);vm.runInContext(fs.readFileSync('scene/search-light.js','utf8')+'\nwindowTest={prepareSearchLight,driveSearchLight,releaseSearchLight};',context);
(async()=>{
 const root={id:'can'},mesh={id:'body',name:'Can Enamel Body'};
 await context.windowTest.prepareSearchLight(root,[mesh]);
 const projectSource=fs.readFileSync('scene/chapter-one.js','utf8');vm.runInContext(projectSource.slice(projectSource.indexOf('function screenPoint'),projectSource.indexOf('function place(')),context);
 const centre=context.screenPoint(400,20,-150);context.pointerX=centre.x+100;context.pointerY=centre.y;
 assert.equal(context.windowTest.driveSearchLight(root,centre,false),true);
 const material=applied.get('body');assert.equal(material.transparent,false);
 const brightness=p=>{sample.position=p;return material.colorNode.eval().reduce((a,b)=>a+b,0)};
 const near=brightness([430,20,-150]),middle=brightness([400,20,-150]),far=brightness([340,20,-150]);
 assert(near>middle&&middle>far,'The near edge must light before the far side on the SAME mesh');assert.equal(far,0,'The far surface must stay black');
 context.pointerX=centre.x+300;context.windowTest.driveSearchLight(root,centre,false);assert.equal(brightness([400,20,-150]),0);
 context.windowTest.releaseSearchLight(root);assert(brightness([400,20,-150])>middle,'Picked-up objects must return to their clay shading');
 context.windowTest.driveSearchLight(root,centre,true);assert(brightness([400,20,-150])>0,'Keyboard discovery must remain available');
 console.log('PASS: per-surface light falloff, opaque dark surfaces, pickup restoration and keyboard discovery');
})().catch(e=>{console.error(e);process.exitCode=1});
