// this one is a doozy.
// to handle input, we're making an invisible rectangle the size of the canvas,
// and every time you click on it, it'll pass information to any objects on that point.
// this layer will also keep track of things like whether shift is held down,
// whether the mouse is held down, etc.
function makeInput(draw, reset, g_circles) {
    const w = draw.data('width'),
	  h = draw.data('height'),
	  w_min = draw.data('w_min'),
	  w_max = draw.data('w_max'),
	  h_min = draw.data('h_min'),
	  h_max = draw.data('h_max'),
	  out = draw.rect(w, h);

    // some boilerplate to pass keystrokes to our input layer.
    // SVG.js can handle clicks natively, but not keystrokes. go figure.
    document.onkeydown = function(e) {
	out.fire('keydown', e);
    }
    document.onkeyup = function(e) {
	out.fire('keyup', e);
    }

    // just an ordinary transparent rectangle...
    return out.fill({ opacity: 0 })

    // oh no state variables
	.data({
	    mouseX: 0,
	    mouseY: 0,
	    moved: false,
	    newcircle: false,

	    shiftdown: false,
	    mousedown: false
	})
    
    // oh no logic
    // mouse input:
	.on('mousedown', function(e) {
	    // this transforms the click point into a point SVG can understand.
	    const p = draw.point(e.pageX, e.pageY);
	    this.data({ mousedown: true });

	    // this block tells us if there's a circle under the mouse cursor on click,
	    // as well as if it's a "new" (unselected) circle or not.
	    // TODO: turn this into another custom event on makeCircles()?
	    // i have no idea how that would work.
	    const circle = g_circles.getCircleAt(p.x, p.y);
	    const newcircle = circle && !circle.data('selected')
	    this.data({ newcircle: newcircle });
	    // as of here, we know that:
	    // circle will contain the circle under the pointer, or null if there is none.
	    // newcircle will be true if circle was unselected before, and false otherwise.

	    // first of all, if there was no circle, just clear everything.
	    if (circle === null) {
		if (!this.data('shiftdown')) {
		    g_circles.fire('clear');
		}
		// also, reset if needed.
		if (reset.inside(p.x, p.y)) {
		    reset.fire('reset');
		}
	    }
	    // if we're here, we know we clicked on a circle.
	    else {
		// if we're not holding down shift, select this circle.
		if (!this.data('shiftdown')) {
		    if (newcircle) {
			g_circles.fire('clear');
		    }
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
	    const p = draw.point(e.pageX, e.pageY);

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
		// console.log(`cursor: ${p.x}, ${p.y} (${dx}, ${dy})`);

		// and only move things if shift is released.
		if (!this.data('shiftdown')) {

		    // and move!
		    if (draw.inBoundsX(p.x)) {
			g_circles.fire('dx', { dx: dx });
		    }
		    if (draw.inBoundsY(p.y)) {
			g_circles.fire('dy', { dy: dy });
		    }
		    this.data({ moved: true });
		}
	    }
	})
    // and when the mouse is released:
	.on('mouseup', function(e) {
	    const p = draw.point(e.pageX, e.pageY);
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
	    }
	    
	    this.data({ newcircle: false });
	    this.data({ moved: false });
	})

    // keyboard input:
	.on('keydown', function(e) {
	    const key = e.detail.key;
	    switch(key) { // do different things depending on which key.
		
	    case 'r': reset.fire('reset'); break;                // r: reset the board.
	    case ' ': g_circles.fire('solve'); break;            // space: "solve" the board (make a circle).
	    case 'Shift': this.data({ shiftdown: true }); break; // shift: toggle the "shift" state.
	    }
	})
	.on('keyup', function(e) {
	    const key = e.detail.key;
	    switch(key) {
		
	    case 'Shift': this.data({ shiftdown: false }); break; // shift: toggle the "shift" state.
	    }
	});
}

export default makeInput;
