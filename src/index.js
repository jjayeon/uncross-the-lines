// welcome!
// this is a one-shot javascript implementation of the great game "uncross the lines",
// in which --- you guessed it --- you uncross some lines.
// my "special feature" is that you can use shift to select multiple circles,
// and draw boxes to select like in an RTS.
// ----------------------------------------------------------------

import { SVG } from '@svgdotjs/svg.js'
// as you can see, this project uses SVG.js.
// go thru their crap documentation on svgjs.com for an overview.

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

    // get the true bounds of the canvas.
    const w_min = buffer, w_max = width - buffer,
	  h_min = buffer, h_max = height - buffer;
    
    // circle values.
    const numCircles = 10;
    const circleRadius = 20;

    // SVG STUFF:
    // --------------------------------
    const draw = SVG().addTo('#drawing').size(width, height);

    // define some helper functions on draw.
    // draw is the only namespace that's guaranteed to be in all contexts, so we're putting it here.
    // TODO: do this in a way that isn't obscenely disgusting.
    draw.inBoundsX = function (x) {
	return w_min < x && x < w_max;
    }
    draw.inBoundsY = function (y) {
	return h_min < y && y < h_max;
    }
    // the circles that the user can click on.
    const g_circles = makeCircles(draw, w_min, w_max, h_min, h_max, numCircles, circleRadius, buffer);

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

// make a whole group of circles. the variables, real quick:
// draw: the canvas, w: width of canvas, h: height of canvas, n: num circles,
// r: radius of each circle, b: buffer
// and some custom events:
// "solve" puts all the circles in a circle.
// "scramble" scrambles their positions.
// "clear" flags all circles as unselected.
// "select" will flag a circle at a point as selected.
// "dmove" will move all selected circles, but staying in bounds.
function makeCircles(draw, w_min, w_max, h_min, h_max, n, r, b) {
    
    // make a circle!
    // circles "know" whether or not they're selected.
    // when it's time to move, we'll only move circles that have the "selected" flag.
    // also, change colors to reflect state.
    function makeCircle(draw, r) {
	
	return draw.circle(r)
	    .data('selected', false, true)

	// these are useful custom events ---- update state and recolor.
	    .on('select', function() {
		this.fill('rgb(150, 0, 0)')
		    .data('selected', true, true);
	    })
	    .on('deselect', function() {
		this.fill('rgb(0, 0, 0)')
		    .data('selected', false, true);	    
	    })
	
	    .fire('deselect');
    }
    
    const out = draw.group();
    for (var i = 0; i < n; i++) {
	makeCircle(out, r);
    }
    
    const bigCircleRadius = 200;
    // this defines the bounding box for the circles.
    
    // on "solve", we'll put the circles in a big circle.
    return out.on('solve', function() {
	
	this.each(function(i, children) {
	    var circle = children[i];

	    // this goes in a circle.
	    // if you're puzzled, ask your trig professor.
	    circle.fire('deselect')
		.center(w/2 + bigCircleRadius * Math.cos(Math.PI*2 * (i/children.length)),
			h/2 + bigCircleRadius * Math.sin(Math.PI*2 * (i/children.length)));
	});
    })
        // on "scramble", simply scramble the positions.
	.on('scramble', function() {
	    function randRange(min, max) {
		return Math.random() * (max - min) + min;
	    }
	    
	    this.each(function(i, children) {
		var circle = children[i];

		circle.fire('deselect')
		    .center(randRange(w_min, w_max),
			    randRange(h_min, h_max));
	    });
	})
    // simply deselect all circles.
	.on('clear', function() {
	    this.each(function(i, children) {
		children[i].fire('deselect');
	    })
	})
    // iterate through children and find one that's at the given coordinate.
	.on('select', function(e) {
	    const px = e.detail.px, py = e.detail.py;

	    // we're using this "looping" pattern to ensure we only select one circle.
	    var looping = true;
	    this.each(function(i, children) {
		if (looping) {
		    var child = children[i];
		    if (child.inside(px, py)) {
			child.fire('select');
			looping = false;
		    }
		}
	    });
	})
    // custom move function. only moves selected circles,
    // and only moves them if they'll stay in bounds.
	.on('dmove', function(e) {
	    const dx = e.detail.dx, dy = e.detail.dy;
	    
	    this.each(function(i, children) {
		const child = children[i];
		const newx = child.cx() + dx;
		const newy = child.cy() + dy;

		if(child.data('selected')) {

		    if (draw.inBoundsX(newx)) {
			child.cx(newx);
		    }
		    if (draw.inBoundsY(newy)) {
			child.cy(newy);
		    }
		}
	    })
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
// returns a group, not the canvas.
function makeResetButton(draw, w, h, g_circles) {
    
    var out = draw.group().size(w, h);

    out.on('reset', function() {
	g_circles.fire('scramble');
    });

    // orange rectangle
    out.rect(w, h)
	.fill('rgb(255, 112, 77)');

    // and some instruction text
    out.text('reset')
	.font({ size: 24 })
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
	.data({
	    mouseX: 0,
	    mouseY: 0,
	    shiftdown: false,
	    mousedown: false,
	    moved: false,
	    newcircle: false
	})
    
    // oh no logic
    // mouse input:
	.on('mousedown', function(e) {
	    // this transforms the click point into a point SVG can understand.
	    var p = draw.point(e.pageX, e.pageY);
	    this.data({ mousedown: true });

	    // this block tells us if there's a circle under the mouse cursor on click,
	    // as well as if it's a "new" (unselected) circle or not.
	    // TODO: turn this into another custom event on makeCircles()?
	    // i have no idea how that would work.
	    var circle = null;
	    var newcircle = false;
	    var looping = true;
	    g_circles.each(function(i, children) {
		if (looping) {
		    var child = children[i];
		    if (child.inside(p.x, p.y)) {

			// important assignments!
			circle = child;
			newcircle = !child.data('selected');
			looping = false;
		    }
		}
	    });
	    this.data({ newcircle: newcircle });
	    // as of here, we know that:
	    // circle will contain the circle under the pointer, or null if there is none.
	    // newcircle will be true if circle was unselected before, and false otherwise.

	    // first of all, if there was no circle, just clear everything.
	    if (circle === null) {
		g_circles.fire('clear');
		// also, reset if needed.
		if (reset.inside(p.x, p.y)) {
		    reset.fire('reset');
		}
	    }
	    // if we're here, we know we clicked on a circle.
	    else {
		// if we're not holding down shift, select this circle.
		if (!this.data('shiftdown')) {
		    circle.fire('select');
		}
		// otherwise, we should toggle the selection.
		else {
		    if (circle.data('selected')) {
			circle.fire('deselect');
		    }
		    else {
			circle.fire('select');
		    }

		}
	    }
	})
    // now for mouse movement:
	.on('mousemove', function(e) {
	    var p = draw.point(e.pageX, e.pageY);

	    // this weirdness gets the recent motion of the mouse cursor.
	    const prevX = this.data('mouseX');
	    const prevY = this.data('mouseY');
	    
	    const dx = p.x - prevX;
	    const dy = p.y - prevY;
	    
	    this.data({ mouseX: p.x });
	    this.data({ mouseY: p.y });
	    // now we know that dx and dy have the cursor's recent change in position.


	    
	    // only fire if the mouse is held down.
	    if (this.data('mousedown')) {
		console.log(`cursor: ${p.x}, ${p.y} (${dx}, ${dy})`);

		// and only move things if shift is released.
		if (!this.data('shiftdown')) {

		    // if we've selected a new circle,
		    // get rid the old circles.
		    if (this.data('newcircle')) {
			g_circles.fire('clear');
			g_circles.fire('select', { px: p.x, py: p.y });
			this.data({ newcircle: false });
		    }

		    // and move!
		    g_circles.fire('dmove', { dx: dx, dy: dy });
		    this.data({ moved: true });
		}
	    }
	})
    // and when the mouse is released:
	.on('mouseup', function(e) {
	    var p = draw.point(e.pageX, e.pageY);
	    this.data({ mousedown: false });

	    // if we didn't move anything, 
	    // select just the circle under the cursor.
	    // in the case of "shift",
	    // we already handled the selection logic in mousedown, 
	    // so we don't need to do anything here.
	    if (!this.data('moved') &&
		!this.data('shiftdown')) {
		g_circles.fire('clear');
		g_circles.fire('select', { px: p.x, py: p.y });
		this.data({ moved: false });
	    }
	})

    // keyboard input:
	.on('keydown', function(e) {
	    var key = e.detail.key;
	    switch(key) { // do different things depending on which key.
		
	    case 'r': reset.fire('reset'); break;                // r: reset the board.
	    case ' ': g_circles.fire('solve'); break;            // space: "solve" the board (make a circle).
	    case 'Shift': this.data({ shiftdown: true }); break; // shift: toggle the "shift" state.
	    }
	})
	.on('keyup', function(e) {
	    var key = e.detail.key;
	    switch(key) {
		
	    case 'Shift': this.data({ shiftdown: false }); break; // shift: toggle the "shift" state.
	    }
	});
}


init();
