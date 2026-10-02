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
    emit(event, props = {}) { (this.listeners[event] ?? []).forEach(fn => fn({ preventDefault() {}, ...props })); }
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
const { BreadManager: M } = load('src/systems/BreadManager.ts');
const { CookingScene } = load('src/scenes/CookingScene.ts');
const { recipes } = load('src/data/recipes.ts');
const recipe=recipes.find(r=>r.id==='bread');
assert.ok(M.order({id:'mongsil',name:'몽실'}).center > M.order({id:'donggu',name:'동구'}).center);
assert.equal(M.order(undefined,'redbean').scoops,2);
assert.equal(M.order(undefined,'warm').scoops,1);
function advance(time) { now=time;const callbacks=[...raf.values()];raf.clear();callbacks.forEach(fn=>fn()); }
function flush() { const pending=timeouts;timeouts=[];pending.forEach(fn=>fn()); }
function run({extra='',id='mongsil',keyboard=false,cancel=false,timeout=false,pot=false}={}) {
 now=0;raf.clear();timeouts=[];let calls=[];
 const customer={id,name:'손님'},order=M.order(customer,extra);
 new CookingScene(recipe,pot,(...args)=>calls.push(args),customer);
 click(extra ? 'extra-'+extra : 'no-extra');
 assert.equal(raf.size,0);
 const pour=nodes.get('bread-action');pour.emit(keyboard?'keydown':'pointerdown',{code:'Space',repeat:false,button:0,pointerId:1});
 assert.equal(raf.size,1);now=2400*.7;
 if(keyboard)pour.emit('keydown',{code:'Space',repeat:true});
 if(timeout)advance(2500);else pour.emit(keyboard?'keyup':cancel?'pointercancel':'pointerup',{code:'Space'});
 pour.emit('lostpointercapture');
 assert.equal(raf.size,0);
 const next=nodes.get('bread-next');next.click();next.click();
 assert.match(nodes.get('panel').html,/팥을 배 가운데/);
 for(let scoop=0;scoop<order.scoops;scoop++) {
   const start=now;now=start+(timeout?6100:800);
   if(timeout)advance(now);else click('bread-action');
   click('bread-next');
 }
 for(let side=0;side<2;side++) {
   assert.match(nodes.get('panel').html,side===0?/앞면을 노릇/:/뒷면까지/);
   const start=now;now=start+(timeout?4100:4000*order.center);
   if(timeout)advance(now);else click('bread-action');
   const nextButton=nodes.get('bread-next');nextButton.click();nextButton.click();
 }
 assert.match(nodes.get('panel').html,/꼬리까지 따뜻하게/);
 const finishButton=nodes.get('bread-finish');finishButton.click();finishButton.click();flush();
 assert.equal(calls.length,1);
 const [quality,returnedExtra,result]=calls[0];
 assert.equal(returnedExtra,extra);assert.equal(quality,timeout?'보통':'완벽');
 assert.equal(result.score,timeout?0:100);assert.equal(result.scoops,order.scoops);
 assert.equal(result.steps.length,3+order.scoops);
 assert.equal(raf.size,0);
 assert.equal(nodes.get('interface').classList.contains('minigame-cooking'),false);
 assert.equal(nodes.get('panel').classList.contains('bread-results'),false);
 assert.equal(nodes.get('nav').classList.contains('locked'),false);
}
for(const id of ['mongsil','dubu','new-guest'])for(const pot of [true,false])run({id,pot});
run({keyboard:true});run({cancel:true});run({extra:'redbean'});run({extra:'warm'});run({timeout:true,extra:'redbean'});
const order=M.order(undefined,'redbean');
assert.equal(M.result([{id:'batter',score:100},{id:'filling-1',score:100},{id:'filling-2',score:100},{id:'bake-front',score:0},{id:'bake-back',score:0}],order).score,67);
console.log('PASS bread: pour/release, keyboard repeat, pointer cancellation, filling scoops, texture profiles, both sides, timeout recovery, category scores, extras retained, one serving and cleanup');
