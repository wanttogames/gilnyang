const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const ts=require(path.join(process.cwd(),'node_modules/typescript')),cache=new Map();
function load(relative){const filename=path.resolve(relative);if(cache.has(filename))return cache.get(filename).exports;const module={exports:{}};cache.set(filename,module);new Function('require','module','exports',ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(id=>load(path.resolve(path.dirname(filename),id)+'.ts'),module,module.exports);return module.exports;}
let stored;global.localStorage={getItem:()=>stored,setItem:(_k,v)=>stored=v};global.document={querySelector:()=>null};
const {CustomerManager:C}=load('src/systems/CustomerManager.ts'),{SaveManager:S,newSave}=load('src/systems/SaveManager.ts'),{RecipeManager:R}=load('src/systems/RecipeManager.ts'),{ProgressionManager:P}=load('src/systems/ProgressionManager.ts'),{ambientCustomers:A}=load('src/data/ambientCustomers.ts'),{CharacterStoryManager:M}=load('src/systems/CharacterStoryManager.ts'),{rollNightCondition:roll}=load('src/data/nightConditions.ts');
let seed=43217;const rng=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
let s=newSave();s.night=20;s.weather='rain';s.gold=333;s.unlockedRecipes.push('ramen','bread');
for(const p of Object.values(s.customers)){p.unlocked=true;p.characterStory&&(p.characterStory.stage=6);}
let count=0,ambient=0,pairs=0,opportunities=0;
for(let i=0;i<5000;i++){
 const q=C.queue(s,rng,'ordinary');assert.equal(q.length,5);assert(q.some(id=>!id.startsWith('ambient_')));
 for(let j=0;j<q.length;j++){assert.notEqual(q[j],q[j-1]);assert(![...(s.recentCustomers||[]),...q.slice(0,j)].slice(-3).includes(q[j]));count++;ambient+=q[j].startsWith('ambient_');}
 const starts=C.pairs(s,q,rng);for(const n of starts){assert(!starts.includes(n+1));assert(!C.storyReady(s,q[n]));assert(!C.storyReady(s,q[n+1]));}pairs+=starts.length;opportunities+=q.length-starts.length;
 s.recentCustomers=q.slice(-3);
}
const ratio=ambient/count;assert(ratio>.53&&ratio<.67,ratio);assert(pairs/opportunities>.12&&pairs/opportunities<.25);
assert.equal(C.queue(s,rng,'shower').length,6);
let ordinary=0,cold=0;s.activeNight={queue:['ambient_bamtol'],report:{served:0,gold:0,perfect:0,intimacy:{},discoveries:[]},condition:'ordinary'};
for(let i=0;i<15000;i++)ordinary+=['oden','ramen'].includes(R.order(A[1],s,rng).id);
s.activeNight.condition='cold';for(let i=0;i<15000;i++)cold+=['oden','ramen'].includes(R.order(A[1],s,rng).id);assert(cold>ordinary*2);
const previous=structuredClone(s.customers);P.serve(s,'ambient_bamtol','완벽','');assert.equal(s.gold,348);assert.equal(s.activeNight.report.served,1);assert.deepEqual(s.customers,previous);assert.equal(s.activeNight.report.intimacy.ambient_bamtol,undefined);assert.equal(s.customers.ambient_bamtol,undefined);
s=newSave();s.night=9;s.gold=987;s.weather='rain';s.customers.nabi.intimacy=90;s.customers.nabi.visitCount=50;
const q=C.queue(s,rng);assert(C.storyReady(s,q[0]));assert.equal(s.customers.nabi.characterStory.pending,undefined);assert(!C.pairs(s,q,()=>0).includes(0));
s.activeNight={queue:['ambient_seol','kong','ambient_mungchi'],pairStarts:[0],condition:'cold',report:{served:0,gold:0,perfect:0,intimacy:{},discoveries:[]}};S.save(s);let restored=S.load();assert.equal(restored.gold,987);assert.equal(restored.customers.nabi.intimacy,90);assert.deepEqual(restored.activeNight,s.activeNight);
restored.activeNight.report.served=1;S.save(restored);restored=S.load();assert.deepEqual(restored.activeNight.pairStarts,[]);assert.equal(restored.activeNight.queue[1],'kong');
for(const version of [1,2]){s=newSave();s.version=version;s.gold=456;s.customers.kong.visitCount=12;s.activeNight={queue:['kong','dubu'],report:{served:1,gold:10,perfect:0,intimacy:{kong:1},discoveries:[]}};stored=JSON.stringify(s);restored=S.load();assert.equal(restored.gold,456);assert.equal(restored.customers.kong.visitCount,12);assert.equal(restored.activeNight.condition,'ordinary');assert.deepEqual(restored.activeNight.pairStarts,[]);}
s=newSave();s.night=20;s.recentCustomers=['nabi'];s.customers.nabi.visitCount=50;s.customers.nabi.intimacy=100;s.customers.dubu.characterStory.stage=6;const spaced=C.queue(s,rng);assert.equal(spaced.indexOf('nabi'),3);assert.equal(spaced.filter(id=>id==='nabi').length,1);
s=newSave();s.customers.kong.visitCount=4;s.customers.kong.intimacy=7;assert(!C.storyReady(s,'kong'));assert(C.solo(s,'kong'));assert.deepEqual(C.pairs(s,['kong','ambient_seol'],()=>0),[]);
assert.equal(roll('snow',()=>.99),'cold');assert.equal(roll('rain',()=>0),'shower');assert.equal(roll('clear',()=>.99),'ordinary');
console.log('PASS variety: 25,000 visits, ambient '+(100*ratio).toFixed(1)+'%, pair opportunities '+(100*pairs/opportunities).toFixed(1)+'%; recent3, story priority/solo, recipe weights, ambient no affinity, old/pair save migration');
