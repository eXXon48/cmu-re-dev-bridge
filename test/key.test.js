// Knob key replay must send keydown then keyup: stock Multicontroller.js ignores keys
// while a button is held (_btnHeld, cleared on keyup) and fires select (13) on keyup.
// Run: node test/key.test.js
"use strict";
var assert = require("assert");
var fs = require("fs");
var vm = require("vm");

var seen = [], timers = [];
function Ev() {}
Ev.prototype.initEvent = function (t) { this.type = t; };
var target = { dispatchEvent: function (e) { seen.push(e.type + ":" + e.keyCode); } };
var w = {
  document: { createEvent: function () { return new Ev(); }, activeElement: target, body: target },
  setTimeout: function (f, ms) { timers.push({ f: f, ms: ms }); }
};
w.window = w;
vm.runInNewContext(fs.readFileSync(__dirname + "/../pkg/payload/ui/bridge.js", "utf8"), w);

assert.strictEqual(w.__rvpDev.line("13"), true);
assert.deepStrictEqual(seen, ["keydown:13"]);
assert.strictEqual(timers.length, 1);
assert.ok(timers[0].ms > 0, "keyup is delayed");
timers[0].f();
assert.deepStrictEqual(seen, ["keydown:13", "keyup:13"]);
console.log("ok");
