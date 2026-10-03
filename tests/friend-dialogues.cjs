const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require('typescript'),cache=new Map();
function load(relative){const f=path.resolve(relative);if(cache.has(f))return cache.get(f).exports;const m={exports:{}};cache.set(f,m);new Function('require','module','exports',ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(id=>load(path.resolve(path.dirname(f),id)+'.ts'),m,m.exports);return m.exports;}
global.document={querySelector:()=>null};let stored;global.localStorage={getItem:()=>stored,setItem:(_k,v)=>stored=v};
const {friendOrder,friendConversation,friends}=load('src/data/friendDialogues.ts'),{newSave,SaveManager:S,emptyReport}=load('src/systems/SaveManager.ts'),{CustomerManager:C}=load('src/systems/CustomerManager.ts'),{DialogueManager:D}=load('src/systems/DialogueManager.ts');
const p={visitCount:2,intimacy:0,storyStage:0,unlocked:true,preferenceFound:false};
assert.equal(friendOrder('donggu','clear',{...p,visitCount:0},'우유',()=>0),undefined);
assert(friendOrder('donggu','rain',p,'우유',()=>0).includes('누나 보고 싶다'));
assert(friendOrder('nabi','clear',{...p,intimacy:10},'주먹밥',()=>0).includes('가까이'));
assert.equal(friendOrder('ambient_seol','clear',p,'우유',()=>0),undefined);
for(const pair of [['nabi','donggu'],['dubu','kkamang'],['mongsil','kong']]){assert(friends(...pair));assert.deepEqual(friendConversation(...pair,'clear',2),friendConversation(...pair.toReversed(),'clear',2));assert.equal(friendConversation(...pair,'rain',3).length,3)}
assert.equal(friendConversation('nabi','dubu','clear',1).length,0);assert(!friends('nabi','nabi'));
const s=newSave();s.night=4;const solo=C.solo;assert(C.solo(s,'nabi'),'opening story has priority');C.solo=()=>false;let q=['nabi','ambient_seol','donggu','ambient_bamtol'];const original=[...q].sort();assert.deepEqual(C.pairs(s,q,()=>0),[0,2]);assert.deepEqual(q.slice(0,2),['nabi','donggu']);assert.deepEqual([...q].sort(),original);
s.activeNight={queue:q,pairStarts:[0,2],report:emptyReport()};S.save(s);const restored=S.load();assert.deepEqual(restored.activeNight.queue,q);assert.deepEqual(restored.activeNight.pairStarts,[0,2]);
q=['nabi','nabi'];assert.deepEqual(C.pairs(s,q,()=>0),[]);
C.solo=(_s,id)=>id==='donggu';q=['nabi','ambient_seol','donggu'];C.pairs(s,q,()=>0);assert.equal(q[2],'donggu','story guest never moved into a pair');C.solo=solo;
const random=Math.random;Math.random=()=>0;assert.equal(D.order('kkamang','clear',{id:'ramen',name:'라면'},{...p,characterStory:{pending:{eventId:'KKAMANG_STORY_4'}}}),'오늘은 계란 두 개.');Math.random=random;
console.log('PASS friend dialogue: character context, rain and affinity, three reversible pair conversations, queue preservation, save reload, solo story and two-egg order');
