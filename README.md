# cmu-re-dev-bridge

Dev-only package for the Revised Store on the CMU150. It lets a developer drive the HMI page from the unit's shell while testing an app:

- `js:<code>` evaluates JavaScript in the HMI page; the result goes to the daemon log as `{"control":"eval",...}`
- `open` shows the store overlay
- a number (e.g. `77`) replays a knob key press (keydown, then keyup 80 ms later)
- `window.__rvpTap(x, y)` clicks at a screen position

Write a line to the daemon's ctl FIFO to send one: `echo 'js:1+1' > /tmp/rvp-ctl`.

The store lists this package only in its Developer section, and installs it only in developer mode. "Leave Developer mode" removes it. Without it, the store ignores everything on the ctl FIFO.

## Build

Push a `vX.Y.Z` tag on `main` (prod release) or a `dev/vX.Y.Z` tag on `develop` (dev prerelease). CI checks that the tag sits on its branch, packs `cmu-re-dev-bridge-vX.Y.Z.rvp` (unsigned) and attaches it to the release; the signed catalog (revised-catalog) lists it from there (`catalog.list` for prod, `dev.list` for dev).

Local: `tools/mkpkg.sh <version> <path to rvp-pack> <out.rvp>`.
