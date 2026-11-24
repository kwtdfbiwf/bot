let sample={position:[0,0,0],normal:[0,1,0]};
const raw=v=>v instanceof Node?v.eval():v;
const array=v=>Array.isArray(v)?v:[v];
function zip(a,b,fn){a=array(a);b=array(b);const n=Math.max(a.length,b.length);const r=Array.from({length:n},(_,i)=>fn(a[i%a.length],b[i%b.length]));return n===1?r[0]:r;}
class Node{
 constructor(fn){this.eval=fn}
 get x(){return new Node(()=>array(this.eval())[0])}get y(){return new Node(()=>array(this.eval())[1])}get z(){return new Node(()=>array(this.eval())[2])}
 add(v){return new Node(()=>zip(this.eval(),raw(v),(a,b)=>a+b))}sub(v){return new Node(()=>zip(this.eval(),raw(v),(a,b)=>a-b))}
 mul(v){return new Node(()=>zip(this.eval(),raw(v),(a,b)=>a*b))}div(v){return new Node(()=>zip(this.eval(),raw(v),(a,b)=>a/b))}
 negate(){return this.mul(-1)}pow(v){return new Node(()=>zip(this.eval(),raw(v),Math.pow))}max(v){return new Node(()=>zip(this.eval(),raw(v),Math.max))}
 length(){return new Node(()=>Math.hypot(...array(this.eval())))}normalize(){return this.div(this.length())}
 dot(v){return new Node(()=>array(zip(this.eval(),raw(v),(a,b)=>a*b)).reduce((a,b)=>a+b,0))}
}
class Vector2{constructor(x,y){this.set(x,y)}set(x,y){this.x=x;this.y=y}}
const vector=(...v)=>new Node(()=>v.flatMap(x=>{const a=raw(x);return a instanceof Color?a.rgb:array(a)}));
class Color{constructor(hex){this.rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255)}}
const tsl={vec2:vector,vec3:vector,float:v=>new Node(()=>v),positionWorld:new Node(()=>sample.position),normalWorld:new Node(()=>sample.normal),
 uniform(value){const n=new Node(()=>n.value instanceof Vector2?[n.value.x,n.value.y]:n.value);n.value=value;return n},
 smoothstep(lo,hi,x){return new Node(()=>{const t=Math.max(0,Math.min(1,(raw(x)-lo)/(hi-lo)));return t*t*(3-2*t)})},
 mix(a,b,t){return a.add(b.sub(a).mul(t))}};

module.exports={sample,three:{tsl,Vector2,Color,MeshBasicNodeMaterial:class{},MeshStandardNodeMaterial:class{},DoubleSide:2}};
