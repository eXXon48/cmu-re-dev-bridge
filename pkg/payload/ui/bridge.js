/* Revised dev bridge  (ES5 / Opera-Presto safe, ASCII only)
 * ----------------------------------------------------------------------------
 * Jail file of the dev-only package `cmu-re-dev-bridge`:
 *   /data_persist/cmu-re/pkg/cmu-re-dev-bridge/ui/bridge.js
 * The store injector (developer_mode_GuiConfig.js) loads it if it exists and hands
 * it every non-JSON line the daemon relays from its ctl FIFO. The daemon relays
 * those lines only while this package is installed. Developer mode installs it,
 * "Leave Developer mode" removes it.
 *
 * Lines:
 *   js:<code>   global eval in the HMI page; the result goes back to the daemon log
 *               as {control:"eval",action:"ok|err",value,ts}
 *   open        show the store overlay without the Apps menu
 *   <keyCode>   replay a knob key as keydown (e.g. 77)
 * Also: window.__rvpTap(x, y) = mousedown/mouseup/click at screen x,y.
 */
(function () {
  "use strict";

  var TAG = "[revised-dev-bridge]";
  var STORE_KEY = "cmu-re-store/store";
  function logMsg(m) {
    try { if (window.log && log.info) log.info(TAG + " " + m); } catch (e) {}
  }
  function send(evt) {
    try { if (window.__rvpDaemon) window.__rvpDaemon.send(evt); } catch (e) {}
  }

  // global (indirect) eval; reply {control:"eval",action:"ok|err",value}
  function devEval(code) {
    var ok = true, r;
    try { r = (0, eval)(code); } catch (e) { ok = false; r = String(e); }
    try { r = typeof r === "string" ? r : JSON.stringify(r); } catch (e2) { r = String(r); }
    if (r && r.length > 4000) r = r.substring(0, 4000) + "...";
    send({ control: "eval", action: ok ? "ok" : "err", value: r === undefined ? "undefined" : r, ts: Date.now() });
  }

  // Generic Event + keyCode expando: Presto-safe (no KeyboardEvent ctor / initKeyEvent needed).
  function synthKey(k) {
    try {
      var e = document.createEvent("Events");
      e.initEvent("keydown", true, true);
      e.keyCode = k; e.which = k;
      (document.activeElement || document.body).dispatchEvent(e);
      logMsg("remote key " + k);
    } catch (err) { logMsg("remote key failed: " + err); }
  }

  window.__rvpTap = function (x, y) {
    var t = document.elementFromPoint(x, y), i, ty = ["mousedown", "mouseup", "click"], e;
    if (!t) return "nothing at " + x + "," + y;
    for (i = 0; i < 3; i++) {
      e = document.createEvent("MouseEvents");
      e.initMouseEvent(ty[i], true, true, window, 1, x, y, x, y, false, false, false, false, 0, null);
      t.dispatchEvent(e);
    }
    return t.tagName + "." + t.className;
  };

  // one daemon line; returns whether it was handled
  window.__rvpDev = {
    line: function (s) {
      if (s === "open") { if (window.RevisedHMI) window.RevisedHMI.open(STORE_KEY); return true; }
      if (s.substring(0, 3) === "js:") { devEval(s.substring(3)); return true; }
      var k = parseInt(s, 10);
      if (k > 0) { synthKey(k); return true; }
      return false;
    }
  };
  logMsg("loaded");
})();
