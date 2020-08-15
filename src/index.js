import { SVG } from '@svgdotjs/svg.js'

// welcome!
// this is a one-shot javascript implementation of the great game "Uncross the Lines,
// in which --- you guessed it --- you uncross some lines.
// My "special feature" is that you can use shift to select multiple circles.

// this function contains the bulk of the logic.
// it's pretty much just a series of calls to the below functions.
// i put it up here because to anyone trying to read my code,
// seeing this first makes more sense than looking at the abstract functions first.
function init() {

    // CONSTANTS:
    // --------------------------------
    // don't make circles this close to the edge.
    const buffer = 40;

    // TODO: someday, i would like to determine these values
    // based on the user's platform/screen size.
    // someday.
    const buttonWidth = 80;
    const buttonHeight = 40;

    const circleRadius = 20;

    // SVG STUFF
    // --------------------------------
    const draw = makeDraw();
    const bg = makeBG(draw);
    
    const g_button = makeResetButton(draw, buttonWidth, buttonHeight, bg);
    const g_circles = draw.group();
    const g_lines = draw.group();

    // LOGIC
    // --------------------------------
    for (var i = 0; i < 10; i++) {
	makeCircle(g_circles, circleRadius)
	    .move(i * 100 + buffer, buffer);
    }
}

init();

// FUN PROGRAMMING STUFF:
// ----------------------------------------------------------------

// creates the SVG object itself. bound to "draw" in "init()".
function makeDraw() {
    return SVG().addTo('#drawing').size('100%', '100%');
}

// make a big rectangle covering the whole canvas.
// changes color on 'success' and 'failure' events.
// like all the make functions, we'll pass "draw" as an argument.
// this avoids global variables!
function makeBG(draw) {
    return draw.rect('100%', '100%')
	.on('success',  function() {
	    this.fill({ color: 'rgb(240, 255, 240)' })})
	.on('failure', function() {
	    this.fill({ color: 'rgb(255, 240, 240)' })})
	.fire('failure');
}

// make a button that resets the canvas.
// for testing purposes i had it change the BG color. two in one test!
// returns the new group.
function makeResetButton(draw, w, h, bg) {
    var out = draw.group().size(w, h);

    out.click(function() {
	bg.fire('success');
    });

    // test function mentioned above.
    
    // out.data('success', true, true)
    // 	.click(function() {
    // 	    if (this.data('success')) {
    // 		bg.fire('success');
    // 		this.data('success', false, true);
    // 	    }
    // 	    else {
    // 		bg.fire('failure');
    // 		this.data('success', true, true);
    // 	    }
    // 	});

    // orange rectangle
    out.rect(w, h)
	.front()
	.fill({ color: 'rgb(255, 112, 77)' });

    // and some instruction text
    out.text('reset').center(w/2, h/2);

    return out;
}

// make a circle!
// this one is a doozy.
// circles "know" whether or not they're selected.
// when it's time to move, we'll only move circles that have the "selected" flag.
// circles also have a bunch of logic to determine whether or not they get selected.
// if the user clicks without shift, deselect all other circles + select this one.
// if with shift, add it if it's not selected, and remove it if it is selected.
// also, change colors to reflect state.
function makeCircle(draw, r) {
    return draw.circle(r)
    // the basics.
	.fill('rgb(0, 0, 0)')
	.data('selected', false, true)

    // uh oh, logic
    // these are useful custom events ---- update state and recolor.
	.on('select', function () {
	    this.fill('rgb(0, 0, 150)')
		.data('selected', true, true);
	})
	.on('deselect', function () {
	    this.fill('rgb(0, 0, 0)')
		.data('selected', false, true);	    
	})

    // UH OH, LOGIC
    // input processing time
	.mousedown(function () {
	    // TODO: figure out a better way to detect if shift is down
	    var shift = false;

	    // if shift is held down...
	    if (shift) {
		// if it's already selected, deselect it.
		if (this.data('selected')) {
		    this.fire('deselect');
		}
		// otherwise, select it.
		else {
		    this.fire('select');
		}
	    }
	    // if not...
	    else {
		// deselect the others and select this.
		this.parent().children().fire('deselect');
		this.fire('select');
	    }
	});
}
