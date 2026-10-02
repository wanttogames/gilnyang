const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const ts=require(path.join(process.cwd(),'node_modules/typescript'));
const cache=new Map();
function load(relative){const filename=path.resolve(relative);if(cache.has(filename))return cache.get(filename).exports;const module={exports:{}};cache.set(filename,module);const code=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;new Function('require','module','exports',code)(id=>load(path.resolve(path.dirname(filename),id)+'.ts'),module,module.exports);return module.exports;}
let stored;global.localStorage={getItem:()=>stored,setItem:(_k,value)=>{stored=value}};global.document={querySelector:()=>null};
const {CharacterStoryManager:M}=load('src/systems/CharacterStoryManager.ts');const {SaveManager:S,newSave}=load('src/systems/SaveManager.ts');const {DialogueManager:D}=load('src/systems/DialogueManager.ts');const {ProgressionManager:P}=load('src/systems/ProgressionManager.ts');
for(const version of [1,2]){const s=newSave();s.version=version;s.gold=789;s.level=6;s.night=24;s.weather='snow';s.unlockedRecipes=['rice','oden','milk','ramen','bread'];s.upgrades={chair:1,pot:1};s.customers.nabi={intimacy:100,visitCount:45,unlocked:true,preferenceFound:true,storyStage:3};stored=JSON.stringify(s);const restored=S.load();assert.equal(restored.gold,789);assert.equal(restored.night,24);assert.equal(restored.weather,'snow');assert.deepEqual(restored.unlockedRecipes,s.unlockedRecipes);assert.equal(restored.customers.nabi.intimacy,100);assert.equal(restored.customers.nabi.storyStage,3);assert.equal(restored.customers.nabi.characterStory.stage,0);assert.equal(M.reserve('nabi',restored.customers.nabi,24).id,'NABI_STORY_1');}
let s=newSave(),p=s.customers.nabi;p.visitCount=30;p.intimacy=200;M.reserve('nabi',p,1);M.advance('nabi',p);S.save(s);s=S.load();p=s.customers.nabi;assert.equal(p.characterStory.pending.line,1);while(p.characterStory.pending)M.advance('nabi',p);assert.equal(M.reserve('nabi',p,1),undefined);p.visitCount=31;assert.equal(M.reserve('nabi',p,2),undefined);p.visitCount=32;assert.equal(M.reserve('nabi',p,1),undefined);assert.equal(M.reserve('nabi',p,2).id,'NABI_STORY_2');while(p.characterStory.pending)M.advance('nabi',p);assert(p.preferenceFound);
// Visits alone cannot open an intimacy-gated event.
p.characterStory={stage:2,lastEventVisit:3,lastEventNight:1};p.visitCount=10;p.intimacy=7;assert.equal(M.reserve('nabi',p,2),undefined);p.intimacy=8;assert.equal(M.reserve('nabi',p,2).id,'NABI_STORY_3');
// Split ending and refresh after serving retain the same event, without paying twice.
s=newSave();p=s.customers.nabi;p.visitCount=12;p.intimacy=40;p.characterStory={stage:5,lastEventVisit:10,lastEventNight:4};s.night=5;s.activeNight={queue:['nabi'],report:{served:0,gold:0,perfect:0,intimacy:{},discoveries:[]}};M.reserve('nabi',p,5);while(p.characterStory.pending.part==='before')M.advance('nabi',p);assert.equal(p.characterStory.stage,5);assert.equal(p.characterStory.pending.part,'after');P.serve(s,'nabi','완벽','');let loaded=S.load();assert.equal(loaded.gold,15);assert.equal(loaded.activeNight.report.served,1);assert.equal(loaded.customers.nabi.characterStory.pending.eventId,'NABI_STORY_COMPLETE');assert.equal(loaded.customers.nabi.characterStory.pending.visit,13);while(loaded.customers.nabi.characterStory.pending)M.advance('nabi',loaded.customers.nabi);S.save(loaded);loaded=S.load();assert(M.complete('nabi',loaded.customers.nabi));assert.equal(M.reserve('nabi',loaded.customers.nabi,6),undefined);assert.equal(loaded.gold,15);
// Missing or malformed story state cannot erase an otherwise valid save.
for(const raw of [undefined,null,{stage:-1},{stage:'six'},{stage:0,pending:{eventId:'bad',part:'before',line:0,visit:1,night:1}},{stage:0,pending:{eventId:'NABI_STORY_1',part:'before',line:999,visit:1,night:1}}]){s=newSave();s.gold=555;s.customers.nabi.characterStory=raw;stored=JSON.stringify(s);loaded=S.load();assert.equal(loaded.gold,555);assert.equal(loaded.customers.nabi.characterStory.stage,0);assert.equal(loaded.customers.nabi.characterStory.pending,undefined);}
// Both drama arcs use identical reservation/save/once-per-visit rules.
for (const id of ['nabi','dubu']) {
 s=newSave(); p=s.customers[id]; p.intimacy=100; p.visitCount=40;
 for(let stage=0;stage<6;stage++) {
  const event=M.reserve(id,p,stage+1); assert.equal(event,M.events(id)[stage]);
  while(p.characterStory.pending) M.advance(id,p);
  assert.equal(p.characterStory.stage,stage+1);
  assert.equal(M.reserve(id,p,stage+1),undefined);
  S.save(s); s=S.load(); p=s.customers[id]; assert.equal(p.characterStory.stage,stage+1);
  p.visitCount+=3;
 }
 assert(M.complete(id,p));assert.equal(M.reserve(id,p,20),undefined);
}
s=newSave();p=s.customers.dubu;p.storyStage=3;p.visitCount=50;p.intimacy=100;S.save(s);s=S.load();p=s.customers.dubu;
assert.equal(p.storyStage,3);assert.equal(p.characterStory.stage,0);assert.equal(M.reserve('dubu',p,1).id,'DUBU_STORY_1');
assert.deepEqual(D.unlock('dubu',p),[]);
const kong=s.customers.kong;kong.visitCount=5;kong.intimacy=10;assert(D.unlock('kong',kong).length>0);assert.equal(kong.storyStage,1);
for (const version of [1,2]) {
 s=newSave();s.version=version;s.gold=321;s.weather='rain';s.customers.dubu={intimacy:99,visitCount:42,storyStage:3,unlocked:true,preferenceFound:true};
 stored=JSON.stringify(s);const old=S.load();assert.equal(old.gold,321);assert.equal(old.weather,'rain');assert.equal(old.customers.dubu.intimacy,99);assert.equal(old.customers.dubu.visitCount,42);assert.equal(old.customers.dubu.storyStage,3);assert.equal(old.customers.dubu.characterStory.stage,0);
}
for (let stage=1;stage<6;stage++) {
 s=newSave();p=s.customers.dubu;const e=M.events('dubu')[stage];p.intimacy=e.minIntimacy;p.visitCount=e.minVisits-1;
 p.characterStory={stage,lastEventVisit:e.minVisits-e.visitsSincePrevious,lastEventNight:4};
 assert.equal(M.reserve('dubu',p,4),undefined);
 p.intimacy=e.minIntimacy-1;assert.equal(M.reserve('dubu',p,5),undefined);
 p.intimacy=e.minIntimacy;p.visitCount=e.minVisits-2;assert.equal(M.reserve('dubu',p,5),undefined);
 p.visitCount=e.minVisits-1;assert.equal(M.reserve('dubu',p,5).id,e.id);
 M.advance('dubu',p);S.save(s);const restored=S.load();assert.equal(restored.customers.dubu.characterStory.pending.line,1);
}
// Kkamang's recipe/weather gates never change the other arcs or saved cursors.
const rain={weather:'rain',unlockedRecipes:['rice','oden','milk','ramen']},clear={...rain,weather:'clear'};
s=newSave();p=s.customers.kkamang;p.visitCount=3;p.intimacy=5;
assert.equal(M.reserve('kkamang',p,4,{weather:'rain',unlockedRecipes:['rice','oden','milk']}),undefined);
assert.equal(M.reserve('kkamang',p,4,clear),undefined);
assert.equal(M.reserve('kkamang',p,4,rain).id,'KKAMANG_STORY_1');
M.advance('kkamang',p);S.save(s);s=S.load();p=s.customers.kkamang;
assert.equal(p.characterStory.pending.line,1);
assert.equal(M.reserve('kkamang',p,4,clear).id,'KKAMANG_STORY_1');
while(p.characterStory.pending)M.advance('kkamang',p);
assert.equal(M.reserve('kkamang',p,4,rain),undefined);
p.visitCount=4;assert.equal(M.reserve('kkamang',p,5,rain),undefined);
p.visitCount=5;p.intimacy=8;assert.equal(M.reserve('kkamang',p,5,rain).id,'KKAMANG_STORY_2');
s=newSave();p=s.customers.kkamang;p.visitCount=5;p.intimacy=10;assert.equal(M.reserve('kkamang',p,6,clear),undefined);p.visitCount=6;assert.equal(M.reserve('kkamang',p,7,clear).id,'KKAMANG_STORY_1');
// Event 5: weather can delay two eligible visits, but cannot permanently block the arc.
s=newSave();p=s.customers.kkamang;p.intimacy=30;p.visitCount=12;p.characterStory={stage:4,lastEventVisit:10,lastEventNight:8};
assert.equal(M.reserve('kkamang',p,9,clear),undefined);assert.equal(M.reserve('kkamang',p,9,rain).id,'KKAMANG_STORY_5');delete p.characterStory.pending;p.visitCount=14;assert.equal(M.reserve('kkamang',p,9,clear).id,'KKAMANG_STORY_5');
// Ordered events and two-part egg order; high affinity never skips the sequence.
s=newSave();p=s.customers.kkamang;p.intimacy=200;p.visitCount=40;
for(let stage=0;stage<6;stage++){
 const e=M.reserve('kkamang',p,stage+1,rain);assert.equal(e,M.events('kkamang')[stage]);
 if(stage===3){assert.equal(e.serving,'two-eggs');while(p.characterStory.pending.part==='before')M.advance('kkamang',p);assert.equal(p.characterStory.stage,3);S.save(s);s=S.load();p=s.customers.kkamang;assert.equal(p.characterStory.pending.part,'after')}
 while(p.characterStory.pending)M.advance('kkamang',p);
 assert.equal(p.characterStory.stage,stage+1);assert.equal(M.reserve('kkamang',p,stage+1,rain),undefined);p.visitCount+=3;S.save(s);s=S.load();p=s.customers.kkamang;
}
assert(M.complete('kkamang',p));assert.equal(M.reserve('kkamang',p,20,rain),undefined);
for(const version of [1,2]){s=newSave();s.version=version;s.gold=777;s.weather='snow';s.night=25;s.unlockedRecipes=['rice','oden','milk','ramen','bread'];s.customers.kkamang={intimacy:80,visitCount:45,storyStage:3,preferenceFound:true,unlocked:true};s.customers.nabi.characterStory.stage=6;s.customers.dubu.characterStory.stage=4;stored=JSON.stringify(s);const v=S.load();assert.equal(v.gold,777);assert.equal(v.weather,'snow');assert.equal(v.customers.kkamang.intimacy,80);assert.equal(v.customers.kkamang.visitCount,45);assert.equal(v.customers.kkamang.storyStage,3);assert.equal(v.customers.kkamang.characterStory.stage,0);assert.equal(v.customers.nabi.characterStory.stage,6);assert.equal(v.customers.dubu.characterStory.stage,4);assert.deepEqual(D.unlock('kkamang',v.customers.kkamang),[])}
console.log('PASS Nabi/Dubu/Kkamang: migration, gates, rain preference/fallback, recipe lock, cursor persistence, split order, ordered six events, no repeat, legacy data preserved; Kong legacy unlock unchanged');
