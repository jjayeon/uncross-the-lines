import { SVG } from '@svgdotjs/svg.js'

// welcome!
// this is a one-shot javascript implementation of the great game "uncross the lines",
// in which --- you guessed it --- you uncross some lines.
// my "special feature" is that you can use shift to select multiple circles,
// and draw boxes to select like in an RTS.
// ----------------------------------------------------------------

// init() contains the bulk of the logic.
// i put it up here because to anyone trying to read my code,
// seeing this first makes more sense than looking at the abstract functions first.
function init() {

    // CONSTANTS:
    // --------------------------------

    // getting the screen size.
    const width  = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth) *  (9/10);
    const height = (window.innerHeight|| document.documentElement.clientHeight|| document.body.clientHeight) * (9/10);
    // note the 9/10 at the end --- that's a hack to prevent overspill at the edge.

    // determine button dimensions based on screen size.
    // if width > height (horizontal), make it a bit smaller,
    // and if width < height (vertical), make it a bit bigger.
    const buttonWidth = width / ((width > height) ? 10 : 3);
    // the button's height is always a function of its width.
    const buttonHeight = buttonWidth / 3;
    
    // don't make circles this close to the edge.
    const buffer = buttonHeight;

    // circle values.
    const numCircles = 10;
    const circleRadius = 20;

    // SVG STUFF:
    // --------------------------------
    const draw = SVG().addTo('#drawing').size(width, height);
    
    // the circles that the user can click on.
    const g_circles = makeCircles(draw, width, height, numCircles, circleRadius, buffer);

    // the lines connecting the circles.
    const g_lines = draw.group();

    // and the other SVG stuff --- the background, reset button, and input layer.
    // see makeInput() for more info on the input layer.
    const bg = makeBG(draw, width, height);
    const reset = makeResetButton(draw, buttonWidth, buttonHeight, g_circles);
    const input = makeInput(draw, width, height, reset, g_circles);

    // some boilerplate to pass keystrokes to our input layer.
    // SVG.js can handle clicks natively, but not keystrokes. go figure.
    document.onkeydown = function(e) {
	input.fire('keydown', e);
    }
    document.onkeyup = function(e) {
	input.fire('keyup', e);
    }
    
    // put everything in the right order.
    bg.front();
    reset.front();
    g_lines.front();
    g_circles.front();
    input.front();
}

// FUN PROGRAMMING STUFF:
// ----------------------------------------------------------------

// make a circle!
// circles "know" whether or not they're selected.
// when it's time to move, we'll only move circles that have the "selected" flag.
// also, change colors to reflect state.
function makeCircle(draw, r) {
    
    return draw.circle(r)
	.data('selected', false, true)

    // these are useful custom events ---- update state and recolor.
	.on('select', function() {
	    this.fill('rgb(0, 0, 150)')
		.data('selected', true, true);
	})
	.on('deselect', function() {
	    this.fill('rgb(0, 0, 0)')
		.data('selected', false, true);	    
	})
    
	.fire('deselect');
}

function makeCircles(draw, w, h, n, r, b) {

    var out = draw.group();
    for (var i = 0; i < n; i++) {
	makeCircle(out, r);
    }

    // on "solve", we'll put the circles in a big circle.
    var bigCircleRadius = 200;
    return out.on('solve', function() {
	this.each(function(i, children) {
	    var circle = children[i];

	    // this goes in a circle.
	    // if you're puzzled, ask your trig professor.
	    circle.fire('deselect');
	    circle.center(w/2 + bigCircleRadius * Math.cos(Math.PI*2 * (i/children.length)),
			  h/2 + bigCircleRadius * Math.sin(Math.PI*2 * (i/children.length)));
	});
    })
    // on "scramble", simply scramble the positions.
	.on('scramble', function() {
	    
	    const w_min = b, w_max = w - b, h_min = b, h_max = h - b;
	    function randRange(min, max) {
		return Math.random() * (max - min) + min;
	    }
	    
	    this.each(function(i, children) {
		var circle = children[i];
		circle.center(randRange(w_min, w_max),
			      randRange(h_min, h_max));
	    });
	})
	.fire('scramble');
}


// make a big rectangle covering the whole canvas.
// changes color on 'success' and 'failure' events,
// and stores the game's win state.
function makeBG(draw, w, h) {
    
    return draw.rect(w, h)
	.data('success', false, true)
    
	.on('success',  function() {
	    this.fill('rgb(240, 255, 240)')
		.data('success', true, true);})
    
	.on('failure', function() {
	    this.fill('rgb(255, 240, 240)')
		.data('success', false, true);})
    
	.fire('failure');
}

// make a button that scrambles the circle positions.
// for testing purposes i had it change the BG color. two in one test!
// returns a group, not the canvas.
function makeResetButton(draw, w, h, g_circles) {
    
    var out = draw.group().size(w, h);

    // test function mentioned above.
    out.on('reset', function() {
	g_circles.fire('scramble');
    });

    // orange rectangle
    out.rect(w, h)
	.fill('rgb(255, 112, 77)');

    // and some instruction text
    out.text('reset')
	.center(w/2, h/2);

    return out;
}

// this one is a doozy.
// to handle input, we're making an invisible rectangle the size of the canvas,
// and every time you click on it, it'll pass information to any objects on that point.
// this layer will also keep track of things like whether shift is held down,
// whether the mouse is held down, etc.
function makeInput(draw, w, h, reset, g_circles) {

    // just an ordinary transparent rectangle...
    return draw.rect(w, h)
	.fill({ opacity: 0 })

    // oh no state variables
	.data('shiftdown', false, true)
	.data('mousedown', false, true)
    
    // oh no logic
    // mouse input:
	.on('mousedown', function(e) {
	    // this transforms the click point into a point SVG can understand.
	    var p = draw.point(e.pageX, e.pageY);
	    
	    // keep track of whether we clicked on a circle.
	    var circled = false;

	    // go thru each circle...
	    g_circles.each(function(i, children) {
		var circle = children[i];

		// deselect all...
		circle.fire('deselect');

		// and select the one we clicked on.
		if (circle.inside(p.x, p.y)) {
		    circle.fire('select');
		    circled = true;
		}
	    });

	    // if we didn't click a circle, check if we clicked the reset button.
	    if (!circled &&
		reset.inside(p.x, p.y)) {
		reset.fire('reset');
	    }
	})
	.on('mousemove', function(e) {

	})
	.on('mouseup', function(e) {

	})

    // keyboard input:
	.on('keydown', function(e) {
	    var key = e.detail.key;
	    switch(key) {
		
	    case 'r': reset.fire('reset'); break;                    // r: reset the board.
	    case ' ': g_circles.fire('solve'); break;                // space: "solve" the board (make a circle).
	    case 'Shift': this.data('shiftdown', true, true); break; // shift: toggle the "shift" global. (not really a global)
	    }
	})
	.on('keyup', function(e) {
	    var key = e.detail.key;
	    switch(key) {
		
	    case 'Shift': this.data('shiftdown', false, true); break; // shift: toggle the "shift" global. (not really a global)
		
	    }
	});
}


init();
