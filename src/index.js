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

    // SVG STUFF
    // --------------------------------
    const draw = SVG().addTo('#drawing').size(width, height);

    // the circles that the user can click on.
    const g_circles = draw.group();

    // we'll put them in a big circle by default.
    // she's messy, but she just makes n circles and arranges them in a ring.
    // if you're puzzled, ask your trig professor.
    function __makeBigCircle(r) {
	for (var i = 0; i < numCircles; i++) {
	    makeCircle(g_circles, circleRadius)
	    
		.center( width/2 + r * Math.cos(Math.PI*2 * (i/numCircles)),
			height/2 + r * Math.sin(Math.PI*2 * (i/numCircles)));
	}
    }
    __makeBigCircle(200);

    // the lines connecting the circles.
    const g_lines = draw.group();

    // the other SVG pieces --- background, input layer, and reset button.
    // see makeInput() for more info on the input layer.
    const bg = makeBG(draw, width, height);
    const reset = makeResetButton(draw, buttonWidth, buttonHeight, bg);
    const input = makeInput(draw, width, height, reset, g_circles);

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

// make a big rectangle covering the whole canvas.
// changes color on 'success' and 'failure' events,
// and stores the game's win state.
function makeBG(draw, w, h) {
    
    return draw.rect(w, h)
	.data('success', false, true)
    
	.on('success',  function() {
	    this.data('success', true, true);
	    this.fill({ color: 'rgb(240, 255, 240)' })})
    
	.on('failure', function() {
	    this.data('success', false, true);
	    this.fill({ color: 'rgb(255, 240, 240)' })})
    
	.fire('failure');
}

// make a button that resets the canvas.
// for testing purposes i had it change the BG color. two in one test!
// returns a group, not the canvas.
function makeResetButton(draw, w, h, bg) {
    
    var out = draw.group().size(w, h);

    // test function mentioned above.
    out.on('reset', function() {
    	if (bg.data('success')) {
    	    bg.fire('failure');
    	}
    	else {
    	    bg.fire('success');
    	}
    });

    // orange rectangle
    out.rect(w, h)
	.front()
	.fill({ color: 'rgb(255, 112, 77)' });

    // and some instruction text
    out.text('reset')
	.center(w/2, h/2)

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

    // oh no logic
	.on('click', function(e) {

	    // this transforms the click point into a point SVG can understand.
	    var p = draw.point(e.pageX, e.pageY);
	    
	    // keep track of whether we clicked on a circle.
	    var circled = false;
	    
	    g_circles.each(function(i, array) {
		var circle = array[i];
		
		circle.fire('deselect');

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
	});
}

init();
