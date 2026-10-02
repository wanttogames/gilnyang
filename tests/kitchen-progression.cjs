const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),ts=require('typescript');
const cache=new Map();
function load(relative){const file=path.resolve(relative);if(cache.has(file))return cache.get(file).exports;const module={exports:{}};cache.set(file,module);const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;new Function('require','module','exports',code)(id=>load(path.resolve(path.dirname(file),id)+'.ts'),module,module.exports);return module.exports;}
let stored;global.localStorage={getItem:()=>stored,setItem:(_key,value)=>stored=value};global.document={querySelector:()=>null};
const {SaveManager:S,newSave,emptyReport}=load('src/systems/SaveManager.ts');
const {KitchenManager:K}=load('src/systems/KitchenManager.ts');
const {ProgressionManager:P}=load('src/systems/ProgressionManager.ts');
const {RecipeManager:R}=load('src/systems/RecipeManager.ts');
const {customerById}=load('src/data/customers.ts');
const {KitchenNotes:UI}=load('src/ui/KitchenNotes.ts');
function start(s,queue){s.activeNight={queue,report:emptyReport()};K.ensure(s);return s;}
function serve(s,id,q='완벽',score=100){const recipe=R.order(customerById(id),s,()=>0);return P.serve(s,id,q,'',{recipeId:recipe.id,score});}
let s=start(newSave(),['nabi','dubu','donggu']);
assert.equal(K.mastery(s,'rice').bestScore,null);assert.equal(K.rank(0).level,0);
const initial=JSON.stringify(s.activeNight.kitchen);s.unlockedRecipes.push('bread');assert.equal(JSON.stringify(K.ensure(s)),initial,'unlock does not reroll nightly goal');
for(const id of s.activeNight.queue)serve(s,id);
assert.equal(s.activeNight.report.served,3);assert.equal(s.gold,70);assert.equal(s.activeNight.report.gold,70);
assert.equal(s.activeNight.kitchen.claimed,true);
const before=JSON.stringify(s);assert.equal(K.record(s,'milk',100,'완벽',2).xp,0);assert.equal(JSON.stringify(s),before,'same ticket cannot award twice');
S.save(s);const loaded=S.load();assert.deepEqual(loaded.activeNight.kitchen,s.activeNight.kitchen);assert.deepEqual(loaded.recipeMastery,s.recipeMastery);
assert.equal(K.record(loaded,'milk',100,'완벽',2).bonusGold,0);
// XP, record ties, two separate cosmetic thresholds and opt-out persistence.
s=start(newSave(),Array(10).fill('nabi'));let unlocks=0,tools=0,bests=0;
for(let i=0;i<5;i++){const reward=serve(s,'nabi');unlocks+=Number(reward.kitchen.dishUnlocked);tools+=Number(reward.kitchen.toolsUnlocked);bests+=Number(reward.kitchen.newBest);}
assert.equal(K.mastery(s,'rice').xp,100);assert.equal(unlocks,1);assert.equal(tools,1);assert.equal(bests,1);
assert.deepEqual(K.style(s,'rice'),{dish:true,tools:true});assert.equal(s.gold,120);
s.recipeMastery.rice.decorated=false;S.save(s);s=S.load();assert.deepEqual(K.style(s,'rice'),{dish:false,tools:false});
for(let i=5;i<9;i++)serve(s,'nabi');assert.equal(K.rank(s.recipeMastery.rice.xp).name,'골목의 장인');
assert.equal(s.recipeMastery.rice.decorated,false);assert.equal(s.recipeMastery.rice.cooked,9);
const less=serve(s,'nabi','보통',12);assert.equal(less.kitchen.newBest,false);assert.equal(s.recipeMastery.rice.bestScore,100);
assert.match(UI.mastery(s,'rice'),/최고 100점/);assert.match(UI.summary(s),/완료/);
// Perfect goal progress survives reload; goal payout happens only at completion.
s=newSave();s.night=2;start(s,['nabi','nabi','nabi']);
assert.equal(serve(s,'nabi','보통',30).kitchen.goalCompleted,false);S.save(s);s=S.load();
assert.equal(s.activeNight.kitchen.goalKind,'perfect');assert.equal(s.activeNight.kitchen.perfect,0);
assert.equal(serve(s,'nabi').kitchen.goalCompleted,true);assert.equal(serve(s,'nabi').kitchen.goalCompleted,false);
assert.equal(s.gold,75);
// Legacy saves retain prior progress and get goals for remaining meals only.
s=newSave();delete s.recipeMastery;s.version=1;s.gold=123;s.activeNight={queue:['nabi','dubu','donggu'],report:{...emptyReport(),served:1,gold:10}};
S.save(s);s=S.load();assert.equal(s.gold,123);assert.equal(K.mastery(s,'rice').xp,0);assert.equal(s.activeNight.kitchen.goalTarget,2);
assert.equal(serve(s,'dubu').kitchen.goalCompleted,false);assert.equal(serve(s,'donggu').kitchen.goalCompleted,true);
// Corrupt or unknown fields cannot introduce NaN, locked specials or huge best scores.
const restored=K.restoreMastery({rice:{xp:-5,cooked:Infinity,bestScore:999,decorated:true},milk:{xp:90,cooked:2,bestScore:'bad',decorated:false},unknown:{xp:999}});
assert.deepEqual(restored.rice,{xp:0,cooked:0,bestScore:100,decorated:false});assert.equal(restored.milk.bestScore,null);assert.ok(!restored.unknown);
s=start(newSave(),['nabi']);const fallback=K.restoreNight(s,{night:1,specialRecipeId:'bread',goalKind:'serve',goalTarget:3});assert.equal(fallback.specialRecipeId,'rice');assert.equal(fallback.goalTarget,1);
const invalid=K.record(s,'bread',100,'완벽',0);assert.equal(invalid.xp,0);assert.equal(s.gold,0);
// Background guests use the same accounting and never gain persistent intimacy.
const {ambientCustomers}=load('src/data/ambientCustomers.ts');const ambient=ambientCustomers[0];
s=start(newSave(),[ambient.id]);const reward=serve(s,ambient.id);assert.equal(reward.intimacy,0);assert.equal(s.activeNight.report.served,1);assert.equal(reward.kitchen.xp,20);assert.equal(s.gold,reward.gold);
for(const recipeId of ['rice','oden','milk','ramen','bread']) {
 s=newSave();s.unlockedRecipes=['rice','oden','milk','ramen','bread'];start(s,['nabi']);
 assert.equal(K.record(s,recipeId,99,'완벽',1).xp,0,'future ticket cannot earn XP');
 const reward=K.record(s,recipeId,99,'완벽',0);assert.equal(reward.xp,20);
 assert.equal(K.record(s,recipeId,99,'완벽',0).xp,0,'same ticket before serving increment is also blocked');
 s.activeNight.report.served++;S.save(s);s=S.load();
 assert.equal(K.mastery(s,recipeId).bestScore,99);assert.equal(K.mastery(s,recipeId).xp,20);
}
console.log('PASS kitchen: all-menu records, XP/ranks/skins, frozen goals/specials, main/ambient accounting, once-only payout, record ties, reload and legacy migration, corrupted inputs');
