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
        const classes = new Set(); this.classList = { add: (...xs) => xs.forEach(x => classes.add(x)), remove: (...xs) => xs.forEach(x => classes.delete(x)), contains: x => classes.has(x), toggle: (x, force) => { if (force) classes.add(x); else classes.delete(x); } };
    }
    set innerHTML(html) {
        this.html = html;
        if (this.id === 'panel') for (const id of nodes.keys()) if (!['panel', 'nav', 'interface'].includes(id)) nodes.delete(id);
        for (const tag of html.matchAll(/<[^>]+\bid="([^"]+)"[^>]*>/g)) {
            const node = new Element(tag[1]); node.disabled = /\bdisabled\b/.test(tag[0]); nodes.set(node.id, node);
        }
    }
    querySelector() { return new Element('visual'); }
    querySelectorAll() { return [new Element('egg-1'), new Element('egg-2')]; }
    setPointerCapture() {}
    animate() {}
    emit(event, props = {}) { (this.listeners[event] ?? []).forEach(fn => fn({ preventDefault() {}, ...props })); }
    addEventListener(event, fn) { (this.listeners[event] ??= []).push(fn); }
    setAttribute(name, value) { this[name] = value; }
    click() { if (!this.disabled) (this.listeners.click ?? []).forEach(fn => fn()); }
}
for (const id of ['panel', 'nav', 'interface']) nodes.set(id, new Element(id));
global.document = { getElementById: id => nodes.get(id), querySelector: () => null, querySelectorAll: () => ['shape-left', 'shape-right'].map(id => nodes.get(id)).filter(Boolean) };
let now = 0, raf = new Map(), next = 0, timeouts = [];
global.performance = { now: () => now };
global.requestAnimationFrame = fn => { raf.set(++next, fn); return next; };
global.cancelAnimationFrame = id => raf.delete(id);
global.window = { setTimeout: fn => timeouts.push(fn) };
const click = id => { assert.ok(nodes.has(id), id); nodes.get(id).click(); };
const { CookingScene } = load('src/scenes/CookingScene.ts');
const { recipes } = load('src/data/recipes.ts');
function advance(time) { now=time;const callbacks=[...raf.values()];raf.clear();callbacks.forEach(fn=>fn()); }
function flush() { const pending=timeouts;timeouts=[];pending.forEach(fn=>fn()); }
let calls=[];
new CookingScene(recipes.find(r=>r.id==='milk'),false,(...args)=>calls.push(args),undefined,{dish:true,tools:true});
assert.equal(nodes.get('interface').classList.contains('kitchen-dish'),true);
click('ingredient-milk');click('extra-warm');
const pour=nodes.get('action');pour.emit('pointerdown',{pointerId:1,button:0});advance(1800*.72);pour.emit('pointerup');pour.emit('pointerup');flush();
assert.equal(calls.length,1);assert.equal(calls[0][0],'완벽');assert.equal(calls[0][2].score,100);
assert.equal(nodes.get('interface').classList.contains('kitchen-tools'),false);
assert.equal(nodes.get('interface').classList.contains('kitchen-dish'),false);
now=0;raf.clear();calls=[];
new CookingScene(recipes.find(r=>r.id==='rice'),false,(...args)=>calls.push(args),undefined,{dish:true,tools:false});
for(const id of ['rice','tuna','seaweed'])click('ingredient-'+id);click('extra-tuna');
advance(2000);click('rice-stop');click('rice-next');
for(const id of ['shape-left','shape-right','shape-left','shape-right']){advance(now+800);click(id);}
click('rice-next');advance(now+2000);click('rice-stop');click('rice-next');
const finish=nodes.get('rice-finish');finish.click();finish.click();flush();
assert.equal(calls.length,1);assert.equal(calls[0][0],'완벽');assert.equal(calls[0][2].score,100);assert.equal(calls[0][1],'tuna');
assert.equal(nodes.get('interface').classList.contains('kitchen-dish'),false);
console.log('PASS kitchen scores: rice three-step score and milk pour score reach the shared serving callback; one callback, extras and cosmetic cleanup');
