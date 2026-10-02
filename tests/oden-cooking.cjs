const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const cache = new Map();
function load(file) {
    file = path.resolve(file);
    if (file.endsWith('AudioManager.ts')) return { audio: { note() {}, success() {} } };
    if (cache.has(file)) return cache.get(file).exports;
    const module = { exports: {} }; cache.set(file, module);
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
    new Function('require', 'module', 'exports', code)(id => load(path.resolve(path.dirname(file), id) + '.ts'), module, module.exports);
    return module.exports;
}
// Small DOM fixture: exercise the same click handlers as touch and keyboard activation.
const nodes = new Map();
class Element {
    constructor(id) {
        this.id = id; this.listeners = {}; this.style = {}; this.dataset = {};
        const classes = new Set(); this.classList = { add: (...xs) => xs.forEach(x => classes.add(x)), remove: (...xs) => xs.forEach(x => classes.delete(x)), contains: x => classes.has(x) };
    }
    set innerHTML(html) {
        this.html = html;
        if (this.id === 'panel') for (const id of nodes.keys()) if (!['panel', 'nav', 'interface'].includes(id)) nodes.delete(id);
        for (const tag of html.matchAll(/<[^>]+\bid="([^"]+)"[^>]*>/g)) {
            const node = new Element(tag[1]); node.disabled = /\bdisabled\b/.test(tag[0]); nodes.set(node.id, node);
        }
    }
    addEventListener(event, fn) { (this.listeners[event] ??= []).push(fn); }
    setAttribute(name, value) { this[name] = value; }
    click() { if (!this.disabled) (this.listeners.click ?? []).forEach(fn => fn()); }
}
for (const id of ['panel', 'nav', 'interface']) nodes.set(id, new Element(id));
global.document = { getElementById: id => nodes.get(id) };
let now = 0, raf = new Map(), next = 0, timeouts = [];
global.performance = { now: () => now };
global.requestAnimationFrame = fn => { raf.set(++next, fn); return next; };
global.cancelAnimationFrame = id => raf.delete(id);
global.window = { setTimeout: fn => timeouts.push(fn) };
const click = id => { assert.ok(nodes.has(id), id); nodes.get(id).click(); };
const { OdenManager: M } = load('src/systems/OdenManager.ts');
const { OdenCooking } = load('src/scenes/OdenCooking.ts');
const { CookingScene } = load('src/scenes/CookingScene.ts');
const { odenCooking: config } = load('src/data/cookingSteps.ts');
const { CookingManager: C } = load('src/systems/CookingManager.ts');
const { recipes } = load('src/data/recipes.ts');
const recipe = recipes.find(r => r.id === 'oden');
for (let i = 0; i < 100; i++) assert.deepEqual([...M.order('dubu', '두부', () => i / 100).ids].sort(), ['round', 'square', 'triangle']);
assert.ok(M.order('dubu').center > M.order('donggu').center);
assert.ok(M.order('nabi').center < M.order('donggu').center);
assert.equal(M.order('new-guest').center, .68);
assert.equal(M.result(0, [100, 100, 100], M.order('dubu')).quality, '완벽');
assert.equal(M.result(20, [0, 0, 0], M.order('dubu')).quality, '보통');
function advance(time) { now = time; const callbacks = [...raf.values()]; raf.clear(); callbacks.forEach(fn => fn()); }
function flush() { const pending = timeouts; timeouts = []; pending.forEach(fn => fn()); }
function run({ timeout = false, wrong = false, pot = false, customerId = 'dubu' } = {}) {
    now = 0; raf.clear(); timeouts = []; let calls = [];
    new CookingScene(recipe, pot, (...args) => calls.push(args), { id: customerId, name: '손님' });
    click('extra-broth');
    assert.equal(raf.size, 0, 'selection has no timer');
    const html = nodes.get('panel').html;
    const names = [...html.matchAll(/<b>\d<\/b> ([^<✓]+)/g)].map(m => m[1].trim());
    const ids = names.map(name => config.pieces.find(p => p.name === name).id);
    if (wrong) {
        click('oden-pick-' + ids[1]);
        assert.match(nodes.get('oden-selection-feedback').textContent, /다시 골라/);
    }
    ids.forEach(id => click('oden-pick-' + id));
    click('oden-start');
    assert.equal(raf.size, 1);
    if (timeout) advance(9000);
    else for (const piece of config.pieces) {
        advance(piece.duration * M.order(customerId).center);
        click('oden-' + piece.id); click('oden-' + piece.id);
    }
    assert.equal(raf.size, 0, 'finished cooking cancels animation loop');
    click('oden-result');
    assert.match(nodes.get('panel').html, /3 \/ 3/);
    const finishButton = nodes.get('oden-finish');
    finishButton.click(); finishButton.click(); flush();
    assert.equal(calls.length, 1, 'one serving callback');
    assert.equal(calls[0][1], 'broth', 'extra ingredient retained');
    assert.equal(calls[0][0], timeout ? '보통' : '완벽');
    assert.equal(calls[0][2].timingScore, timeout ? 0 : 100);
    assert.equal(calls[0][2].selectionScore, wrong ? 90 : 100);
    assert.equal(nodes.get('nav').classList.contains('locked'), false);
    assert.equal(nodes.get('interface').classList.contains('minigame-cooking'), false);
    assert.equal(raf.size, 0);
    return calls[0][2];
}
for (const customerId of ['dubu', 'nabi', 'donggu', 'new-guest']) for (const pot of [true, false]) run({ customerId, pot });
run({ wrong: true }); run({ timeout: true });
for (const center of [.59, .68, .77]) for (const range of [.12, .13]) {
    assert.equal(C.odenState(center, config.goodStart, center, range, config.lateGoodEnd).score, 100);
    assert.equal(C.odenState(1, config.goodStart, center, range, config.lateGoodEnd).score, 0);
}
console.log('PASS oden: shuffled requests, texture profiles, wrong-pick recovery, pot tolerance, perfect/timeout scoring, extra retained, no duplicate serving, animation cleanup');
