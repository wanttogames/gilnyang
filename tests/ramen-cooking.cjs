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
const { RamenManager: M } = load('src/systems/RamenManager.ts');
const { CookingScene } = load('src/scenes/CookingScene.ts');
const { recipes } = load('src/data/recipes.ts');
const recipe = recipes.find(r => r.id === 'ramen');
assert.equal(M.order({id:'kkamang',name:'까망'}).noodleCenter,.56);
assert.equal(M.order({id:'dubu',name:'두부'}).noodleCenter,.76);
assert.equal(M.order().noodleCenter,.66);
assert.equal(M.order({id:'kkamang',name:'까망',twoEggs:true},'egg').eggs,2);
assert.equal(M.score(.7,.7,.09),100);
assert.ok(M.score(1,.7,.09) < 60);
assert.ok(M.score(.81,.7,.105) > M.score(.81,.7,.1));
function advance(time) { now = time; const callbacks = [...raf.values()]; raf.clear(); callbacks.forEach(fn => fn()); }
function flush() { const pending = timeouts; timeouts = []; pending.forEach(fn => fn()); }
function run({ timeout=false, keyboard=false, cancel=false, extra='', twoEggs=false, id='kkamang', pot=false } = {}) {
    now=0;raf.clear();timeouts=[];let calls=[];
    const customer={id,name:'손님',twoEggs}; const order=M.order(customer,extra);
    new CookingScene(recipe,pot,(...args)=>calls.push(args),customer);
    click(extra ? 'extra-'+extra : 'no-extra');
    assert.match(nodes.get('panel').html,/1 \/ 3/);
    assert.equal(raf.size,0,'pour waits for hold');
    const pour=nodes.get('ramen-stop');
    pour.emit(keyboard ? 'keydown' : 'pointerdown',{code:'Space',button:0,pointerId:1,repeat:false});
    assert.equal(raf.size,1);
    now=2800*order.brothCenter;
    // Repeated keydown must not reset the hold start.
    if(keyboard)pour.emit('keydown',{code:'Space',repeat:true});
    if(timeout)advance(2900);
    else pour.emit(keyboard ? 'keyup' : cancel ? 'pointercancel' : 'pointerup',{code:'Space'});
    pour.emit('lostpointercapture');
    assert.equal(raf.size,0);
    assert.match(nodes.get('ramen-feedback').html,timeout ? /0점/ : /100점/);
    const oldNext=nodes.get('ramen-next');oldNext.click();oldNext.click();
    assert.match(nodes.get('panel').html,/2 \/ 3/);
    const noodleStart=now;
    now=noodleStart+(timeout ? 7000 : 6200*order.noodleCenter);
    if(timeout)advance(now);else click('ramen-stop');
    assert.equal(raf.size,0);
    click('ramen-next');
    for(let egg=0;egg<order.eggs;egg++) {
        assert.match(nodes.get('panel').html,/3 \/ 3/);
        assert.ok(!nodes.get('panel').html.includes('ramen-stage ramen-egg"'),'stage class cannot collide with egg decoration');
        const eggStart=now;
        now=eggStart+(timeout ? 6600 : 900);
        if(timeout)advance(now);else click('ramen-stop');
        const nextButton=nodes.get('ramen-next');nextButton.click();nextButton.click();
    }
    const html=nodes.get('panel').html;
    assert.equal((html.match(/class="ramen-egg /g)||[]).length,order.eggs,'finished bowl has requested eggs');
    const finishButton=nodes.get('ramen-finish');finishButton.click();finishButton.click();flush();
    assert.equal(calls.length,1,'only one serving callback');
    const [quality,returnedExtra,result]=calls[0];
    assert.equal(returnedExtra,extra);
    assert.equal(quality,timeout ? '보통' : '완벽');
    assert.equal(result.score,timeout ? 0 : 100);
    assert.equal(result.eggs,order.eggs);
    assert.equal(result.steps.length,2+order.eggs);
    assert.equal(result.serving,order.eggs===2 ? 'two-eggs' : undefined);
    assert.equal(raf.size,0);
    assert.equal(nodes.get('interface').classList.contains('minigame-cooking'),false);
    assert.equal(nodes.get('panel').classList.contains('ramen-results'),false);
    assert.equal(nodes.get('nav').classList.contains('locked'),false);
}
for(const id of ['kkamang','dubu','new-guest'])for(const pot of [true,false])run({id,pot});
run({keyboard:true});run({cancel:true});run({extra:'egg'});run({twoEggs:true});run({twoEggs:true,extra:'egg'});run({extra:'broth'});run({timeout:true,twoEggs:true});
const order=M.order({id:'kkamang',name:'까망'},'egg');
const weighted=M.result([{id:'broth',name:'국물',score:0},{id:'noodle',name:'면',score:100},{id:'egg-1',name:'계란',score:100},{id:'egg-2',name:'계란',score:100}],order);
assert.equal(weighted.score,67,'egg count does not increase reward weight');
console.log('PASS ramen: hold/release, keyboard repeat, pointer cancellation, texture profiles, pot tolerance, one/two eggs, story/extra caps, timeout recovery, category scores, once-only serving and cleanup');
