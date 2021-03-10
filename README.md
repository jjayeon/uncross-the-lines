# Uncross the Lines!

A one-page javascript app implementing the wonderful game "Uncross the Lines."  Features a medley of advanced selection options --- shift-clicking and deselecting, box selection, and shift-boxing.

Play here: https://uncrossthelines.netlify.app/

## build instructions:

with npm installed:

    npm install --save-dev 'svgdotjs@svg.js'

Our favorite SVG library.

    npm run build

Creates dist/ with everything you need to host the app.  No backend or database shenanigans.

If you try this and it doesn't work, I probably forgot something.  Please tell me.

## repository structure:

### ./

Includes package.json (standard for npm apps) and webpack.config.js, for configuring Webpack (used to build dist/ files).

(At home there's another file called package-lock.json.  I don't know what it's for, but I added it to .gitignore and it seems fine.)

### node_modules

All our node packages, of course.  The only one you really need is '@svgdotjs/svg.js', a very lightweight library for manipulating SVG elements.  It's very elegant and clean, even though the documentation is a little sparse.  See svgjs.com for more.

### src

Contains all the source code! index.js is just a landing site for Webpack; it invokes App() in App.js, which arranges all our components nicely.  Also contains index.html, a template file for Webpack.

### src/components

The various components of the app.  Mostly self-explanatory, but pay special attention to Lines.js and Input.js.  Lines.js contains the bulk of the code testing for victory (i.e. no lines intersecting), and Input.js handles all user input in a nightmare nightmare mess.  I tried to comment it to make it easier to get through, but it might still take you a few passes.  Sorry!  Mouse processing is hard.

For the most part, the app is controlled by a series of custom SVG events attached to different elements.  For example, clicking will fire a "mousedown" event on Input, which will fire a "select" event on any circle under the mouse.  The full event chains (in pseudocode):

* Input.mousedown ->
  * Circles.select
  * OR Selection.anchor
  * OR Button.reset ->
    * Circles.scramble
    * Lines.check -> BG.success
* Input.mousemove ->
  * Circles.dmove AND Lines.redraw
  * OR Selection.redraw
* Input.mouseup ->
  * Circles.select
  * Lines.check -> BG.success
