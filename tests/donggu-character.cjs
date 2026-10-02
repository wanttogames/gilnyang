const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const ts = require('typescript'), cache = new Map();
function load(relative) {
    const filename = path.resolve(relative);
    if (cache.has(filename)) return cache.get(filename).exports;
    const module = { exports: {} }; cache.set(filename, module);
    const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    new Function('require', 'module', 'exports', code)(id => load(path.resolve(path.dirname(filename), id) + '.ts'), module, module.exports);
    return module.exports;
}
let stored; global.localStorage = { getItem: () => stored, setItem: (_k, value) => { stored = value; } };
global.document = { querySelector: () => null };
const { DialogueManager: D } = load('src/systems/DialogueManager.ts');
const { CharacterStoryManager: M } = load('src/systems/CharacterStoryManager.ts');
const { SaveManager: S, newSave } = load('src/systems/SaveManager.ts');
const { recipes } = load('src/data/recipes.ts');
const { dialogues } = load('src/data/dialogues.ts');
const { rainDialogues } = load('src/data/rainDialogues.ts');
const { dongguPixels } = load('src/game/DongguArt.ts');
function random(values, fn) { const original = Math.random; Math.random = () => values.shift() ?? .99; try { return fn(); } finally { Math.random = original; } }
// Owner memories appear in both phases and always name the food actually ordered.
for (const weather of ['clear', 'rain', 'snow']) for (const food of ['milk', 'bread']) {
    const recipe = recipes.find(r => r.id === food);
    for (const choice of [0, .5, .999]) {
        const line = random([.1, choice], () => D.order('donggu', weather, recipe));
        assert(line.includes('누나')); assert(line.includes(recipe.name)); assert(!line.includes('{food}'));
        assert(random([.1, choice], () => D.reaction('donggu', weather, false)).includes('누나'));
    }
    const normal = random([.99], () => D.order('donggu', weather, recipe));
    assert(!normal.includes('누나'));
    if (weather === 'rain') assert.equal(normal, rainDialogues.donggu.order.replace('{food}', recipe.name));
}
assert.equal(random([.99], () => D.reaction('donggu', 'clear', true)), dialogues.donggu.favorite);
assert.equal(random([.99], () => D.reaction('donggu', 'rain', false)), rainDialogues.donggu.thanks);
// Existing event IDs, cursor persistence and rewards survive every story stage.
let s = newSave(); s.gold = 777; s.night = 20; let p = s.customers.donggu; p.visitCount = 40; p.intimacy = 100;
assert.equal(M.events('donggu').length, 6);
for (let stage = 0; stage < 6; stage++) {
    const event = M.reserve('donggu', p, 20 + stage); assert.equal(event, M.events('donggu')[stage]);
    const pending = structuredClone(p.characterStory.pending);
    S.save(s); s = S.load(); p = s.customers.donggu; assert.deepEqual(p.characterStory.pending, pending);
    while (p.characterStory.pending) M.advance('donggu', p);
    assert.equal(p.characterStory.stage, stage + 1); assert.equal(s.gold, 777); assert.equal(p.intimacy, 100);
    p.visitCount += 3;
}
assert(M.complete('donggu', p)); assert.equal(M.reserve('donggu', p, 50), undefined);
// Raster differences from blinking are confined to the two eyes and highlights.
function raster(blink) {
    const canvas = Array(48 * 48).fill(null);
    for (const [x,y,w,h,c] of dongguPixels(blink)) {
        assert(x >= 0 && y >= 0 && x + w <= 48 && y + h <= 48);
        for (let py = y; py < y + h; py++) for (let px = x; px < x + w; px++) canvas[py * 48 + px] = c;
    }
    return canvas;
}
const open = raster(false), shut = raster(true); let differences = 0;
for (let i = 0; i < open.length; i++) if (open[i] !== shut[i]) {
    const x = i % 48, y = Math.floor(i / 48); differences++;
    assert(y >= 18 && y < 23 && ((x >= 15 && x < 19) || (x >= 29 && x < 33)));
}
assert(differences > 0);
console.log('PASS Donggu: occasional owner memories, recipe/weather/favorite fallbacks, six saved story stages, stable blink silhouette');
